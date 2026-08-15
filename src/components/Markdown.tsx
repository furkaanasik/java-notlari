import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
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

type Props = {
  source: string
  theme: Theme
  onNavigate?: (slug: string) => void
}

export function Markdown({ source, theme, onNavigate }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        pre({ children }: ComponentPropsWithoutRef<'pre'>) {
          const { language, code } = readCodeChild(children)

          if (language === 'mermaid') return <MermaidDiagram code={code} theme={theme} />

          if (language === COMPONENT_LANG) {
            const name = code.trim()
            const Component = INTERACTIVE[name]
            if (Component) return <Component onNavigate={onNavigate} />
            return (
              <p className="interactive-missing">
                Bilinmeyen interaktif bileşen: <code>{name}</code>
              </p>
            )
          }

          return <CodeBlock language={language} code={code} />
        },

        table({ children, ...rest }: ComponentPropsWithoutRef<'table'>) {
          return (
            <div className="table-wrap">
              <table {...rest}>{children}</table>
            </div>
          )
        },
      }}
    >
      {source}
    </ReactMarkdown>
  )
}
