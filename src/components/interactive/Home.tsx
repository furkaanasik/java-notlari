import { useMemo } from 'react'
import { readDocs } from '../../hooks/useReadingProgress'
import { extras, stages, stats } from '../../lib/overview'
import { HOME_FILE } from '../../config/order'
import type { InteractiveProps } from './registry'

/**
 * Anasayfa panosu.
 *
 * Üç soruya cevap verir: bu seri nedir, nereden başlanır, ben nerede kaldım.
 * Bütün sayılar içerikten türetilir; elle güncellenen bir yer yoktur.
 */
export function Home({ onNavigate }: InteractiveProps) {
  const read = useMemo(() => readDocs(), [])
  const summary = useMemo(() => stats(), [])
  const path = useMemo(() => stages(), [])
  const tools = useMemo(() => extras(HOME_FILE), [])

  /*
   * Kaldığın yer: okuma yolundaki ilk okunmamış dosya.
   * Yolun kendisinden türetilir — böylece aşama sayaçlarıyla her zaman
   * tutarlıdır ve giriş sayfası kendiliğinden dışarıda kalır.
   */
  const ordered = useMemo(() => path.flatMap((stage) => stage.docs), [path])
  const next = ordered.find((doc) => !read.has(doc.slug))
  const readCount = ordered.filter((doc) => read.has(doc.slug)).length

  return (
    <section className="home" aria-label="Genel bakış">
      <div className="home__stats">
        <Stat value={summary.documents} label="dosya" />
        <Stat value={summary.patterns} label="pattern" />
        <Stat value={summary.codeBlocks} label="kod bloğu" />
        <Stat value={summary.diagrams} label="diyagram" />
        <Stat value={summary.lines.toLocaleString('tr')} label="satır" />
      </div>

      {next && (
        <div className="home__resume">
          <div>
            <p className="home__resume-label">
              {readCount === 0 ? 'Buradan başla' : 'Kaldığın yer'}
            </p>
            <p className="home__resume-title">{next.title}</p>
          </div>
          <button type="button" className="home__resume-open" onClick={() => onNavigate?.(next.slug)}>
            Aç →
          </button>
        </div>
      )}

      <ol className="home__path">
        {path.map((stage, index) => {
          const done = stage.docs.filter((doc) => read.has(doc.slug)).length
          const ratio = stage.docs.length === 0 ? 0 : done / stage.docs.length

          return (
            <li key={stage.key} className="home__stage">
              <span className="home__stage-index" aria-hidden="true">
                {index + 1}
              </span>

              <div className="home__stage-body">
                <p className="home__stage-title">{stage.title}</p>
                <p className="home__stage-summary">{stage.summary}</p>

                <div className="home__stage-bar" aria-hidden="true">
                  <span style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>

                <p className="home__stage-meta">
                  {done}/{stage.docs.length} okundu
                </p>

                <div className="home__stage-links">
                  {stage.docs.map((doc) => (
                    <button
                      key={doc.slug}
                      type="button"
                      data-read={read.has(doc.slug)}
                      onClick={() => onNavigate?.(doc.slug)}
                    >
                      {doc.title}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {tools.length > 0 && (
        <div className="home__tools">
          <p className="home__tools-label">Her an başvurulabilir</p>
          <div className="home__stage-links">
            {tools.map((doc) => (
              <button key={doc.slug} type="button" onClick={() => onNavigate?.(doc.slug)}>
                {doc.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="home__stat">
      <span className="home__stat-value">{value}</span>
      <span className="home__stat-label">{label}</span>
    </div>
  )
}
