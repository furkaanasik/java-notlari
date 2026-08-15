import { useState } from 'react'
import { HighlightedCode } from './HighlightedCode'
import { splitComparison, type Segment } from '../lib/code-analysis'

type Props = {
  language: string | null
  code: string
}

export function CodeBlock({ language, code }: Props) {
  const comparison = splitComparison(code)

  if (comparison) {
    return <ComparisonBlock language={language} segments={comparison} raw={code} />
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{language ?? 'kod'}</span>
        <CopyButton code={code} />
      </div>
      <HighlightedCode code={code} language={language} />
    </div>
  )
}

/**
 * "Önce / Sonra" karşılaştırması.
 *
 * Dokümanlardaki tek kod bloğu iki panele ayrılır: sekmelerle üst üste
 * (fark aynı konumda görünür, göz kaymaz) veya yan yana.
 */
function ComparisonBlock({
  language,
  segments,
  raw,
}: {
  language: string | null
  segments: [Segment, Segment]
  raw: string
}) {
  const [side, setSide] = useState<0 | 1>(0)
  const [split, setSplit] = useState(false)
  const active = segments[side]

  return (
    <div className="code-block code-block--compare" data-kind={active.kind}>
      <div className="code-block__bar">
        {split ? (
          <span className="code-block__lang">{language ?? 'kod'} · karşılaştırma</span>
        ) : (
          <div className="compare-tabs" role="tablist" aria-label="Kod karşılaştırması">
            {segments.map((segment, index) => (
              <button
                key={segment.kind}
                type="button"
                role="tab"
                aria-selected={side === index}
                onClick={() => setSide(index as 0 | 1)}
                className={`compare-tab compare-tab--${segment.kind}`}
                data-active={side === index}
              >
                <span className="compare-tab__dot" aria-hidden="true" />
                {segment.label}
              </button>
            ))}
          </div>
        )}

        <div className="code-block__actions">
          <button type="button" className="code-block__copy" onClick={() => setSplit((v) => !v)}>
            {split ? 'Sekmeli' : 'Yan yana'}
          </button>
          <CopyButton code={split ? raw : active.code} />
        </div>
      </div>

      {split ? (
        <div className="compare-split">
          {segments.map((segment) => (
            <div key={segment.kind} className={`compare-pane compare-pane--${segment.kind}`}>
              <p className="compare-pane__label">
                <span className="compare-tab__dot" aria-hidden="true" />
                {segment.label}
              </p>
              <HighlightedCode code={segment.code} language={language} />
            </div>
          ))}
        </div>
      ) : (
        <HighlightedCode code={active.code} language={language} />
      )}
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Pano izni yoksa sessizce geç.
    }
  }

  return (
    <button type="button" className="code-block__copy" onClick={copy}>
      {copied ? 'Kopyalandı' : 'Kopyala'}
    </button>
  )
}
