import { docs, groupedDocs } from '../content/docs'
import { HOME_FILE } from '../config/order'

type Props = {
  activeSlug: string
  onSelect: (slug: string) => void
  /** Sonuna kadar okunmuş dosyaların slug'ları */
  read: Set<string>
}

export function Sidebar({ activeSlug, onSelect, read }: Props) {
  const home = docs.find((doc) => doc.fileName === HOME_FILE)

  return (
    <nav aria-label="Dosyalar" className="py-6 pr-3 pl-5">
      {home && (
        <button
          type="button"
          onClick={() => onSelect(home.slug)}
          aria-current={home.slug === activeSlug ? 'page' : undefined}
          className="mb-6 flex w-full items-center border-l-2 pr-2 pl-3 text-left"
          style={{
            height: 'var(--item-h)',
            fontSize: 'var(--text-small)',
            borderColor: home.slug === activeSlug ? 'var(--c-accent)' : 'transparent',
            background: home.slug === activeSlug ? 'var(--c-accent-quiet)' : 'transparent',
            color: home.slug === activeSlug ? 'var(--c-text-strong)' : 'var(--c-text-muted)',
            fontWeight: home.slug === activeSlug ? 550 : 400,
          }}
        >
          <span className="truncate">{home.title}</span>
        </button>
      )}

      {groupedDocs().map((group) => (
        <div key={group.category} className="mb-7">
          <h2
            className="mb-2 px-2 font-semibold uppercase"
            style={{
              fontSize: 'var(--text-label)',
              letterSpacing: '0.12em',
              color: 'var(--c-text-muted)',
            }}
          >
            {group.label}
          </h2>
          <ul>
            {group.docs.map((doc) => {
              const active = doc.slug === activeSlug
              return (
                <li key={doc.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(doc.slug)}
                    aria-current={active ? 'page' : undefined}
                    className="flex w-full items-center border-l-2 pr-2 pl-3 text-left transition-colors"
                    style={{
                      height: 'var(--item-h)',
                      fontSize: 'var(--text-small)',
                      borderColor: active ? 'var(--c-accent)' : 'transparent',
                      background: active ? 'var(--c-accent-quiet)' : 'transparent',
                      color: active ? 'var(--c-text-strong)' : 'var(--c-text-muted)',
                      fontWeight: active ? 550 : 400,
                    }}
                    onMouseEnter={(event) => {
                      if (!active) event.currentTarget.style.background = 'var(--c-bg-hover)'
                    }}
                    onMouseLeave={(event) => {
                      if (!active) event.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span className="truncate">{doc.title}</span>
                    {read.has(doc.slug) && (
                      <span
                        className="ml-auto shrink-0"
                        title="Okundu"
                        aria-label="Okundu"
                        style={{ color: 'var(--c-accent)', fontSize: '0.7rem' }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
