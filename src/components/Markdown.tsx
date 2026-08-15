import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from './CodeBlock'

/** <pre><code class="language-java"> içinden dil adını ve ham metni çıkarır. */
function readCodeChild(children: ReactNode): { language: string | null; code: string } {
  if (!isValidElement(children)) return { language: null, code: '' }

  const props = children.props as { className?: string; children?: ReactNode }
  const match = /language-([\w-]+)/.exec(props.className ?? '')
  const code = typeof props.children === 'string' ? props.children : ''

  return { language: match?.[1] ?? null, code: code.replace(/\n$/, '') }
}

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        pre({ children, ...rest }: ComponentPropsWithoutRef<'pre'>) {
          const { language, code } = readCodeChild(children)
          return (
            <CodeBlock language={language} code={code}>
              <pre {...rest}>{children}</pre>
            </CodeBlock>
          )
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
