import { useEffect, useState } from 'react'
import { CODE_THEME, getHighlighter, isSupported } from '../lib/highlighter'
import { markLines } from '../lib/code-analysis'

/**
 * Vurgulanmış kod gövdesi.
 *
 * ❌ / ✅ ile işaretli satırlar shiki transformer'ı ile sınıflandırılır;
 * böylece "hangi satır yanlış, hangisi doğru" koda bakmadan görünür.
 */
export function HighlightedCode({ code, language }: { code: string; language: string | null }) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupported(language)) return

    let cancelled = false
    const marks = markLines(code)

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        setHtml(
          highlighter.codeToHtml(code, {
            lang: language,
            theme: CODE_THEME,
            transformers: [
              {
                line(node, lineNumber) {
                  const mark = marks.get(lineNumber)
                  if (mark) this.addClassToHast(node, `line--${mark}`)
                },
              },
            ],
          }),
        )
      })
      .catch(() => {
        // Vurgulama yüklenemezse düz metne düşülür.
      })

    return () => {
      cancelled = true
    }
  }, [code, language])

  if (html) {
    return <div className="code-block__body" dangerouslySetInnerHTML={{ __html: html }} />
  }

  const marks = markLines(code)
  return (
    <div className="code-block__body">
      <pre>
        <code>
          {code.split('\n').map((line, index) => {
            const mark = marks.get(index + 1)
            return (
              <span key={index} className={`line${mark ? ` line--${mark}` : ''}`}>
                {line}
                {'\n'}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
