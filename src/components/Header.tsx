import type { Theme } from '../hooks/useTheme'

type Props = {
  title: string
  category: string
  theme: Theme
  onToggleTheme: () => void
  onOpenSearch: () => void
  /** 0-1 arası okuma ilerlemesi */
  progress: number
}

export function Header({ title, category, theme, onToggleTheme, onOpenSearch, progress }: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b px-5 relative"
      style={{
        height: 'var(--header-h)',
        background: 'color-mix(in oklch, var(--c-bg-content) 88%, transparent)',
        borderColor: 'var(--c-border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Okuma ilerlemesi — başlığın alt kenarında ince şerit */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-150"
        style={{
          background: 'var(--c-accent)',
          transform: `scaleX(${progress})`,
        }}
        aria-hidden="true"
      />

      <div className="flex min-w-0 items-center gap-2">
        {category && (
          <>
            <span
              className="truncate"
              style={{ fontSize: 'var(--text-small)', color: 'var(--c-text-faint)' }}
            >
              {category}
            </span>
            <span style={{ color: 'var(--c-text-faint)' }}>/</span>
          </>
        )}
        <span
          className="truncate font-semibold"
          style={{ fontSize: 'var(--text-small)', color: 'var(--c-text-strong)' }}
        >
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-8 items-center gap-2 rounded-md border px-2.5 transition-colors"
          style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-faint)' }}
          aria-label="Ara"
        >
          <SearchIcon />
          <span className="hidden sm:inline" style={{ fontSize: '0.8125rem' }}>
            Ara
          </span>
          <kbd className="hidden sm:inline-block kbd">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
          className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
          style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}
