import { useEffect, useRef } from 'react'
import type { Heading } from '../content/docs'
import { Sidebar } from './Sidebar'

type Props = {
  open: boolean
  onClose: () => void
  activeSlug: string
  onSelect: (slug: string) => void
  read: Set<string>
  headings: Heading[]
  onSelectHeading: (id: string) => void
}

/**
 * Dar ekranda gezinme çekmecesi.
 *
 * Masaüstünde solda sidebar, sağda içindekiler var; mobilde ikisi de gizli
 * kalıyordu ve dosya değiştirmenin yolu yoktu. Çekmece ikisini birden taşır.
 */
export function MobileDrawer({
  open,
  onClose,
  activeSlug,
  onSelect,
  read,
  headings,
  onSelectHeading,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      // Odak çekmecenin içinde kalsın.
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer" onClick={onClose}>
      <div
        ref={panelRef}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Gezinme"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer__bar">
          <span className="drawer__title">Gezinme</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Menüyü kapat">
            Kapat
          </button>
        </div>

        <div className="drawer__scroll">
          <Sidebar
            activeSlug={activeSlug}
            read={read}
            onSelect={(slug) => {
              onSelect(slug)
              onClose()
            }}
          />

          {headings.length > 0 && (
            <nav aria-label="Bu sayfada" className="drawer__toc">
              <h2 className="drawer__toc-title">Bu sayfada</h2>
              <ul>
                {headings.map((heading) => (
                  <li key={heading.id} style={{ paddingLeft: (heading.depth - 1) * 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHeading(heading.id)
                        onClose()
                      }}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
