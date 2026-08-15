import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from './CodeBlock'
import { MermaidDiagram } from './MermaidDiagram'
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

export function Markdown({ source, theme }: { source: string; theme: Theme }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        pre({ children }: ComponentPropsWithoutRef<'pre'>) {
          const { language, code } = readCodeChild(children)

          // Mermaid blokları kod olarak değil, diyagram olarak gösterilir.
          if (language === 'mermaid') return <MermaidDiagram code={code} theme={theme} />

          return <CodeBlock language={language} code={code} />
        },
        // Geniş tabloları kendi kabında yatay kaydır; sayfa gövdesi kaymasın.
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
