import { useMemo, useState } from 'react'
import { interviewNotes } from '../../lib/interview'
import type { InteractiveProps } from './registry'

/**
 * Dokümanlara dağılmış "mülakatta sorulur" uyarılarını tek listede toplar.
 * Metin yeniden yazılmaz; kaynağından alınır ve o başlığa bağlanır.
 */
export function InterviewNotes({ onNavigate }: InteractiveProps) {
  const [filter, setFilter] = useState<string>('hepsi')

  const groups = useMemo(() => {
    const bySource = new Map<string, typeof interviewNotes>()
    for (const note of interviewNotes) {
      const list = bySource.get(note.docTitle) ?? []
      list.push(note)
      bySource.set(note.docTitle, list)
    }
    return [...bySource.entries()]
  }, [])

  const visible = filter === 'hepsi' ? groups : groups.filter(([title]) => title === filter)

  return (
    <section className="interview" aria-label="Mülakat notları">
      <header className="interview__bar">
        <p className="interview__count">
          <strong>{interviewNotes.length}</strong> not · {groups.length} dosya
        </p>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Dosyaya göre süz"
        >
          <option value="hepsi">Hepsi</option>
          {groups.map(([title]) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </header>

      {visible.map(([title, notes]) => (
        <div key={title} className="interview__group">
          <p className="interview__source">{title}</p>
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <blockquote className="interview__excerpt">{note.excerpt}</blockquote>
                <button
                  type="button"
                  className="interview__link"
                  onClick={() => onNavigate?.(note.docSlug, note.headingId)}
                >
                  {note.heading} →
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
