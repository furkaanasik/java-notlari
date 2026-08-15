import { useMemo, useState } from 'react'
import { smellMap } from '../../lib/smell-map'

type Focus =
  | { type: 'smell'; value: string }
  | { type: 'refactoring'; value: string }
  | { type: 'principle'; value: string }
  | null

/**
 * Koku → refactoring → prensip üçlü haritası.
 *
 * Üç sütunun herhangi birinden bir madde seçilir; diğer iki sütun o maddeyle
 * ilişkili olanları vurgular, ilişkisizler soluklaşır. Böylece hem
 * "bu kokunun çözümü ne", hem "bu refactoring hangi kokularda işe yarar",
 * hem de "bu prensibi hangi kokular ihlal ediyor" sorusu aynı yerden yanıtlanır.
 */
export function SmellMap() {
  const [focus, setFocus] = useState<Focus>(null)

  const active = useMemo(() => {
    if (!focus) return null

    const entries = smellMap.entries.filter((entry) => {
      if (focus.type === 'smell') return entry.smell === focus.value
      if (focus.type === 'refactoring') return entry.refactorings.includes(focus.value)
      return entry.principles.includes(focus.value)
    })

    return {
      smells: new Set(entries.map((entry) => entry.smell)),
      refactorings: new Set(entries.flatMap((entry) => entry.refactorings)),
      principles: new Set(entries.flatMap((entry) => entry.principles)),
      entries,
    }
  }, [focus])

  const dim = (type: Focus extends null ? never : 'smell' | 'refactoring' | 'principle', value: string) => {
    if (!active) return false
    if (type === 'smell') return !active.smells.has(value)
    if (type === 'refactoring') return !active.refactorings.has(value)
    return !active.principles.has(value)
  }

  const isFocused = (type: string, value: string) =>
    focus?.type === type && focus.value === value

  function toggle(next: NonNullable<Focus>) {
    setFocus((current) =>
      current && current.type === next.type && current.value === next.value ? null : next,
    )
  }

  return (
    <section className="smap" aria-label="Koku, refactoring ve prensip haritası">
      <header className="smap__bar">
        <p className="smap__summary">
          <strong>{smellMap.entries.length}</strong> koku ·{' '}
          <strong>{smellMap.refactorings.length}</strong> refactoring ·{' '}
          <strong>{smellMap.principles.length}</strong> prensip
        </p>
        {focus ? (
          <button type="button" className="smap__clear" onClick={() => setFocus(null)}>
            Seçimi temizle
          </button>
        ) : (
          <p className="smap__hint">Herhangi bir sütundan seç</p>
        )}
      </header>

      <div className="smap__cols">
        <Column title="Koku">
          {smellMap.entries.map((entry) => (
            <li key={entry.smell}>
              <button
                type="button"
                className="smap__item smap__item--smell"
                data-dim={dim('smell', entry.smell)}
                data-on={isFocused('smell', entry.smell)}
                onClick={() => toggle({ type: 'smell', value: entry.smell })}
              >
                <span className="smap__name">{entry.smell}</span>
                {entry.symptom && <span className="smap__symptom">{entry.symptom}</span>}
              </button>
            </li>
          ))}
        </Column>

        <Column title="Refactoring">
          {smellMap.refactorings.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="smap__item smap__item--refactoring"
                data-dim={dim('refactoring', name)}
                data-on={isFocused('refactoring', name)}
                onClick={() => toggle({ type: 'refactoring', value: name })}
              >
                <span className="smap__name">{name}</span>
              </button>
            </li>
          ))}
        </Column>

        <Column title="Prensip">
          {smellMap.principles.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="smap__item smap__item--principle"
                data-dim={dim('principle', name)}
                data-on={isFocused('principle', name)}
                onClick={() => toggle({ type: 'principle', value: name })}
              >
                <span className="smap__name">{name}</span>
              </button>
            </li>
          ))}
        </Column>
      </div>

      {active && active.entries.length > 0 && (
        <footer className="smap__detail">
          {active.entries.map((entry) => (
            <p key={entry.smell} className="smap__chain">
              <span className="smap__chain-smell">{entry.smell}</span>
              <span className="smap__arrow" aria-hidden="true">
                →
              </span>
              <span className="smap__chain-ref">{entry.refactorings.join(', ')}</span>
              <span className="smap__arrow" aria-hidden="true">
                →
              </span>
              <span className="smap__chain-pri">{entry.principles.join(', ')}</span>
            </p>
          ))}
        </footer>
      )}
    </section>
  )
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="smap__col">
      {/* Başlık seviyesi atlamasın diye <p>: bileşen h1 altına da gömülebiliyor */}
      <p className="smap__col-title" id={`smap-${title}`}>
        {title}
      </p>
      <ul className="smap__list" aria-labelledby={`smap-${title}`}>
        {children}
      </ul>
    </div>
  )
}
