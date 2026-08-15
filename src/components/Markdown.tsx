import {
  Suspense,
  isValidElement,
  memo,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { rehypeCrossRefs } from '../lib/cross-refs'
import { CodeBlock } from './CodeBlock'
import { MermaidDiagram } from './MermaidDiagram'
import { INTERACTIVE } from './interactive/registry'
import type { Theme } from '../hooks/useTheme'

/** <pre><code class="language-java"> içinden dil adını ve ham metni çıkarır. */
function readCodeChild(children: ReactNode): { language: string | null; code: string } {
  if (!isValidElement(children)) return { language: null, code: '' }

  const props = children.props as { className?: string; children?: ReactNode }
  const match = /language-([\w-]+)/.exec(props.className ?? '')
  const raw = props.children
  const code = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('') : ''

  return { language: match?.[1] ?? null, code: code.replace(/\n$/, '') }
}

/** Kod bloğu dili olarak ayrılmış özel ad — interaktif bileşen yuvası. */
const COMPONENT_LANG = 'x-interactive-component'

/**
 * Bileşen çağrılarını, işlenmesi güvenli tek bir biçime indirger.
 *
 * İki yazım da desteklenir:
 *   <!-- component:PatternGraph -->        (GitHub'da görünmez — tercih edilen)
 *   :::component{name="PatternGraph"}      (spec'teki yönerge biçimi)
 *
 * Not: `remark-directive` bilinçli olarak KULLANILMIYOR. O plugin metindeki
 * `1:1`, `Not:` gibi sıradan ifadeleri de yönerge sanıp gövdeyi bozuyordu.
 * Onun yerine çağrılar kendi diline sahip bir kod bloğuna çevrilir; markdown
 * ayrıştırıcısının geri kalan davranışı hiç değişmez.
 */
export function expandComponentMarkers(source: string): string {
  const asFence = (name: string) => `\n\`\`\`${COMPONENT_LANG}\n${name}\n\`\`\`\n`

  return source
    .replace(/^[ \t]*<!--\s*component:\s*([A-Za-z][\w-]*)\s*-->[ \t]*$/gm, (_m, name: string) =>
      asFence(name),
    )
    .replace(
      /^[ \t]*:::component\{name="([A-Za-z][\w-]*)"\}[ \t]*\n(?:[ \t]*:::[ \t]*\n?)?/gm,
      (_m, name: string) => asFence(name),
    )
}

// Sabit referanslar — her render'da yeni dizi vermek de yeniden ayrıştırmaya yol açar.
const REMARK_PLUGINS = [remarkGfm]
const REHYPE_PLUGINS = [rehypeSlug, rehypeCrossRefs]

type Props = {
  source: string
  theme: Theme
  /** İkinci argüman: gidilecek başlık kimliği (boş olabilir). */
  onNavigate?: (slug: string, anchor?: string) => void
}

/**
 * DİKKAT: `components` haritası useMemo ile sabitlenir.
 *
 * Satır içi nesne olarak verildiğinde her render'da YENİ bileşen tipleri
 * üretiliyordu; React bunları farklı tipler sayıp tüm kod bloklarını söküp
 * yeniden kuruyordu. Sonuç: sayfa kaydırılırken vurgulanmış kod bir an düz
 * metne düşüp geri geliyor, ❌/✅ satır renkleri gidip geliyordu.
 */
function MarkdownView({ source, theme, onNavigate }: Props) {
  /*
   * `onNavigate` üst bileşende her render'da yeni bir kimlik alabiliyor
   * (react-router'ın setSearchParams'ı sabit değil). Bağımlılığa koyarsak
   * `components` yeniden üretilir, React bunları farklı bileşen tipleri sayar
   * ve TÜM kod bloklarını söker — vurgulanmış kod bir an düz metne düşerdi.
   * Referansta tutup bağımlılıktan çıkarıyoruz.
   */
  const navigateRef = useRef(onNavigate)
  navigateRef.current = onNavigate

  const components = useMemo(
    () => ({
      pre({ children }: ComponentPropsWithoutRef<'pre'>) {
          const { language, code } = readCodeChild(children)

          if (language === 'mermaid') return <MermaidDiagram code={code} theme={theme} />

          if (language === COMPONENT_LANG) {
            const name = code.trim()
            const Component = INTERACTIVE[name]
            if (Component) {
              return (
                <Suspense fallback={<p className="interactive-loading">Bileşen yükleniyor…</p>}>
                  <Component onNavigate={(slug: string) => navigateRef.current?.(slug)} />
                </Suspense>
              )
            }
            return (
              <p className="interactive-missing">
                Bilinmeyen interaktif bileşen: <code>{name}</code>
              </p>
            )
          }

          return <CodeBlock language={language} code={code} />
        },

        // Çapraz atıf bağlantıları uygulama içinde gezinsin, sayfa yenilenmesin.
        a({ children, ...raw }: ComponentPropsWithoutRef<'a'>) {
          // react-markdown `node` prop'unu da geçiriyor; DOM'a sızmasın.
          const { node: _node, ...rest } = raw as Record<string, unknown>
          const targetDoc = rest['data-doc']
          const anchor = rest['data-anchor']

          if (typeof targetDoc === 'string' && navigateRef.current) {
            return (
              <a
                {...(rest as ComponentPropsWithoutRef<'a'>)}
                onClick={(event) => {
                  // Yeni sekmede açma isteğini bozma.
                  if (event.metaKey || event.ctrlKey || event.shiftKey) return
                  event.preventDefault()
                  navigateRef.current?.(targetDoc, typeof anchor === 'string' ? anchor : '')
                }}
              >
                {children}
              </a>
            )
          }

          return <a {...(rest as ComponentPropsWithoutRef<'a'>)}>{children}</a>
        },

        // Bazı tablolarda ilk başlık hücresi kasıtlı olarak boş; ekran
        // okuyucu için görünmez bir etiket konur.
        th({ children, ...rest }: ComponentPropsWithoutRef<'th'>) {
          const empty =
            children === undefined ||
            children === null ||
            (typeof children === 'string' && children.trim() === '')

          return (
            <th {...rest}>
              {empty ? <span className="sr-only">Satır başlığı</span> : children}
            </th>
          )
        },

      table({ children, ...rest }: ComponentPropsWithoutRef<'table'>) {
        return (
          <div className="table-wrap" tabIndex={0}>
            <table {...rest}>{children}</table>
          </div>
        )
      },
    }),
    [theme],
  )

  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={components}
    >
      {source}
    </ReactMarkdown>
  )
}

/** Aynı kaynak ve tema ile yeniden render edilmesin. */
export const Markdown = memo(MarkdownView)
