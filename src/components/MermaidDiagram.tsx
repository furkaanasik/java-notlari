import { useEffect, useId, useRef, useState } from 'react'
import type { Theme } from '../hooks/useTheme'

type Props = {
  code: string
  theme: Theme
}

let mermaidReady: Promise<typeof import('mermaid').default> | null = null

/**
 * Diyagram renkleri sitenin paletine bağlanır — mermaid'in varsayılan moru
 * "tek vurgu rengi" kuralını bozuyordu. Yüzeyler zinc, vurgu amber.
 */
function themeVariables(theme: Theme) {
  const dark = theme === 'dark'
  return {
    background: 'transparent',
    primaryColor: dark ? '#27272a' : '#f4f4f5',
    primaryTextColor: dark ? '#e4e4e7' : '#27272a',
    primaryBorderColor: dark ? '#52525b' : '#d4d4d8',
    secondaryColor: dark ? '#3f3f46' : '#e4e4e7',
    tertiaryColor: dark ? '#18181b' : '#fafafa',
    lineColor: dark ? '#a1a1aa' : '#71717a',
    textColor: dark ? '#d4d4d8' : '#3f3f46',
    classText: dark ? '#e4e4e7' : '#27272a',
    fontSize: '14px',
  }
}

async function loadMermaid(theme: Theme) {
  mermaidReady ??= import('mermaid').then((mod) => mod.default)
  const mermaid = await mermaidReady
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: themeVariables(theme),
    securityLevel: 'strict',
    fontFamily: 'Inter var, Inter, system-ui, sans-serif',
  })
  return mermaid
}

/**
 * Mermaid bloğunu diyagram olarak render eder.
 * Tema değişiminde yeniden render edilir; tıklayınca büyütme modalı açılır.
 */
export function MermaidDiagram({ code, theme }: Props) {
  const reactId = useId()
  const domId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let cancelled = false

    loadMermaid(theme)
      .then((mermaid) => mermaid.render(domId, code))
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(String(err instanceof Error ? err.message : err))
      })

    return () => {
      cancelled = true
    }
  }, [code, theme, domId])

  // Modal açıkken Esc ile kapat, odağı içeri al.
  useEffect(() => {
    if (!zoomed) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  if (error) {
    // Diyagram kırıksa sessizce kaybolmasın — kaynağı göster.
    return (
      <div className="mermaid-error">
        <p className="mermaid-error__title">Diyagram render edilemedi</p>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <>
      <figure className="mermaid">
        <button
          type="button"
          className="mermaid__canvas"
          onClick={() => setZoomed(true)}
          aria-label="Diyagramı büyüt"
          // Render edilmiş SVG mermaid'in strict modundan geçer.
          dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        >
          {svg ? undefined : 'Diyagram yükleniyor…'}
        </button>
        <figcaption className="mermaid__actions">
          <button type="button" onClick={() => setShowSource((value) => !value)}>
            {showSource ? 'Kaynağı gizle' : 'Kaynağı göster'}
          </button>
        </figcaption>
      </figure>

      {showSource && (
        <div className="code-block">
          <div className="code-block__bar">
            <span className="code-block__lang">mermaid</span>
          </div>
          <div className="code-block__body">
            <pre>
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}

      {zoomed && (
        <div
          className="mermaid-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Büyütülmüş diyagram"
          onClick={() => setZoomed(false)}
        >
          <div className="mermaid-modal__panel" onClick={(event) => event.stopPropagation()}>
            <div className="mermaid-modal__bar">
              <button type="button" onClick={() => setShowSource((value) => !value)}>
                {showSource ? 'Kaynağı gizle' : 'Kaynağı göster'}
              </button>
              <button ref={closeRef} type="button" onClick={() => setZoomed(false)}>
                Kapat
              </button>
            </div>
            <div
              className="mermaid-modal__canvas"
              dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
            />
          </div>
        </div>
      )}
    </>
  )
}
