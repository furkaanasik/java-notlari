import { useEffect, useMemo, useRef, useState } from 'react'
import { search, type SearchHit } from '../lib/search'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (docSlug: string, headingId: string) => void
}

/** Cmd/Ctrl+K ile açılan komut paleti. */
export function SearchPalette({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const hits = useMemo<SearchHit[]>(() => (open ? search(query) : []), [open, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    // Girdiye odaklan — palet açıldığında yazmaya hazır olsun.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => setCursor(0), [query])

  // Seçili sonuç listenin görünür alanında kalsın.
  useEffect(() => {
    const item = listRef.current?.children[cursor] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  function choose(hit: SearchHit | undefined) {
    if (!hit) return
    onSelect(hit.section.docSlug, hit.section.headingId)
    onClose()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((value) => Math.min(value + 1, Math.max(hits.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((value) => Math.max(value - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(hits[cursor])
    }
  }

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Arama" onClick={onClose}>
      <div className="palette__panel" onClick={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tüm dosyalarda ara…"
          aria-label="Arama terimi"
          autoComplete="off"
          spellCheck={false}
        />

        {query.trim().length >= 2 && (
          <p className="palette__count">
            {hits.length === 0 ? 'Sonuç yok' : `${hits.length} sonuç`}
          </p>
        )}

        <ul ref={listRef} className="palette__list">
          {hits.map((hit, index) => (
            <li key={hit.section.id}>
              <button
                type="button"
                className="palette__hit"
                data-active={index === cursor}
                onMouseEnter={() => setCursor(index)}
                onClick={() => choose(hit)}
              >
                <span className="palette__hit-head">
                  <span className="palette__hit-doc">{hit.section.docTitle}</span>
                  {hit.section.heading !== hit.section.docTitle && (
                    <>
                      <span className="palette__sep" aria-hidden="true">
                        ›
                      </span>
                      <span className="palette__hit-heading">{hit.section.heading}</span>
                    </>
                  )}
                </span>
                <span className="palette__hit-snippet">{hit.snippet}</span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="palette__foot">
          <span>↑↓ gez</span>
          <span>↵ aç</span>
          <span>esc kapat</span>
        </footer>
      </div>
    </div>
  )
}
