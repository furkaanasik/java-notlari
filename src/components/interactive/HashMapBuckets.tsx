import { useMemo, useState } from 'react'

/**
 * HashMap bucket dağılımı — canlı hesap.
 *
 * JAVA.md'deki anlatımın birebir uygulaması: hash yayılır (`h ^ h >>> 16`),
 * indeks `%` ile DEĞİL `(n - 1) & hash` ile bulunur. Çakışmalar zincir olarak
 * görünür.
 */

const DEFAULT_KEYS = ['Ali', 'Veli', 'Ayşe']
const CAPACITIES = [16, 32, 64]

/** Java'nın `String.hashCode()` davranışı: s[0]*31^(n-1) + … , 32-bit taşmalı. */
function javaHashCode(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    // Math.imul 32-bit taşmayı Java ile aynı şekilde yapar.
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0
  }
  return hash
}

/** HashMap.hash(): üst 16 biti alta karıştırır. */
function spread(hash: number): number {
  return (hash ^ (hash >>> 16)) | 0
}

function bucketIndex(hash: number, capacity: number): number {
  return (capacity - 1) & spread(hash)
}

function toHex(value: number): string {
  return `0x${(value >>> 0).toString(16).padStart(8, '0')}`
}

export function HashMapBuckets() {
  const [keys, setKeys] = useState<string[]>(DEFAULT_KEYS)
  const [capacity, setCapacity] = useState(16)
  const [draft, setDraft] = useState('')
  const [selected, setSelected] = useState<string | null>(DEFAULT_KEYS[0])

  const buckets = useMemo(() => {
    const table: { key: string; hash: number }[][] = Array.from({ length: capacity }, () => [])
    for (const key of keys) {
      const hash = javaHashCode(key)
      table[bucketIndex(hash, capacity)].push({ key, hash })
    }
    return table
  }, [keys, capacity])

  const collisions = buckets.filter((bucket) => bucket.length > 1).length
  const used = buckets.filter((bucket) => bucket.length > 0).length

  function addKey(value: string) {
    const key = value.trim()
    if (key === '' || keys.includes(key)) return
    setKeys((current) => [...current, key])
    setSelected(key)
    setDraft('')
  }

  const detail = selected ? { key: selected, hash: javaHashCode(selected) } : null

  return (
    <section className="hmap" aria-label="HashMap bucket dağılımı">
      <header className="hmap__bar">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            addKey(draft)
          }}
        >
          <input
            className="hmap__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Anahtar ekle…"
            aria-label="Yeni anahtar"
          />
        </form>

        <div className="hmap__controls">
          <label className="hmap__cap">
            Kapasite
            <select
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
              aria-label="Tablo kapasitesi"
            >
              {CAPACITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="hmap__reset" onClick={() => setKeys(DEFAULT_KEYS)}>
            Sıfırla
          </button>
        </div>
      </header>

      {detail && (
        <div className="hmap__formula">
          <code>
            "{detail.key}".hashCode() = {detail.hash} ({toHex(detail.hash)})
          </code>
          <code>
            h ^ (h &gt;&gt;&gt; 16) = {toHex(spread(detail.hash))}
          </code>
          <code>
            ({capacity} - 1) &amp; hash = <strong>{bucketIndex(detail.hash, capacity)}</strong>
          </code>
        </div>
      )}

      <div className="hmap__grid">
        {buckets.map((bucket, index) => (
          <div
            key={index}
            className="hmap__bucket"
            data-filled={bucket.length > 0}
            data-collision={bucket.length > 1}
          >
            <span className="hmap__index">{index}</span>
            <div className="hmap__entries">
              {bucket.map((entry, position) => (
                <button
                  key={entry.key}
                  type="button"
                  className="hmap__entry"
                  data-on={entry.key === selected}
                  onClick={() => setSelected(entry.key)}
                  title={`${entry.key} — ${toHex(entry.hash)}`}
                >
                  {position > 0 && <span className="hmap__link">→</span>}
                  {entry.key}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="hmap__foot">
        <span>
          {keys.length} anahtar · {used}/{capacity} bucket dolu ·{' '}
          {collisions === 0 ? 'çakışma yok' : `${collisions} bucket'ta çakışma`}
        </span>
        <span className="hmap__note">
          Bir bucket ağaca ancak <strong>8 eleman</strong> ve kapasite{' '}
          <strong>≥ 64</strong> olduğunda döner; kapasite küçükken HashMap bunun
          yerine tabloyu büyütür.
        </span>
      </footer>
    </section>
  )
}
