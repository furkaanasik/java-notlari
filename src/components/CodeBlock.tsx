import { useEffect, useState } from 'react'
import { CODE_THEME, getHighlighter, isSupported } from '../lib/highlighter'

type Props = {
  language: string | null
  code: string
}

/**
 * Kod bloğu: dil etiketi, kopyala butonu, satır numarası ve shiki vurgulaması.
 *
 * Vurgulama asenkron yüklenir; hazır olana kadar (ve desteklenmeyen dillerde)
 * düz metin gösterilir — içerik hiçbir durumda kaybolmaz.
 */
export function CodeBlock({ language, code }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isSupported(language)) return

    let cancelled = false
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        setHtml(highlighter.codeToHtml(code, { lang: language, theme: CODE_THEME }))
      })
      .catch(() => {
        // Vurgulama yüklenemezse düz metin kalır.
      })

    return () => {
      cancelled = true
    }
  }, [code, language])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Pano izni yoksa sessizce geç — metin yine seçilebilir.
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{language ?? 'kod'}</span>
        <button type="button" onClick={copy} className="code-block__copy">
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>

      {html ? (
        <div className="code-block__body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="code-block__body">
          <pre>
            <code>
              {code.split('\n').map((line, index) => (
                <span key={index} className="line">
                  {line}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}
