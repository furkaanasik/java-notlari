import { useEffect, useState } from 'react'
import { docs, stripManualToc } from '../content/docs'
import { Markdown, expandComponentMarkers } from './Markdown'
import type { Theme } from '../hooks/useTheme'

/**
 * Tüm seti tek akışta yazdırma görünümü.
 *
 * 17 dosya arka arkaya dizilir. Yazdırma OTOMATİK başlatılmaz: kod vurgulama ve
 * diyagramlar asenkron yüklendiği için erken tetiklenen bir `print()` yarım
 * içerik basardı. Kullanıcı hazır olduğunda kendi başlatır.
 */
export function PrintAll({ theme, onExit }: { theme: Theme; onExit: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Diyagram ve vurgulamaların yerleşmesi için kısa bir pay.
    const id = window.setTimeout(() => setReady(true), 1500)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="printall">
      <div className="printall__bar">
        <span>
          {docs.length} dosya · {ready ? 'hazır' : 'hazırlanıyor…'}
        </span>
        <span className="printall__actions">
          <button type="button" onClick={() => window.print()} disabled={!ready}>
            Yazdır
          </button>
          <button type="button" onClick={onExit}>
            Çık
          </button>
        </span>
      </div>

      <div className="printall__body">
        {docs.map((doc) => (
          <article key={doc.slug} className="markdown printall__doc">
            <Markdown
              source={expandComponentMarkers(stripManualToc(doc.source))}
              theme={theme}
            />
          </article>
        ))}
      </div>
    </div>
  )
}
