import { useMemo } from 'react'
import type { Heading } from '../content/docs'
import { useActiveHeading } from '../hooks/useActiveHeading'

/** Girinti: h1 → 0, h2 → 0.75rem, h3 → 1.5rem */
const INDENT: Record<number, string> = { 1: '0rem', 2: '0.75rem', 3: '1.5rem' }

export function Toc({ headings }: { headings: Heading[] }) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings])
  const activeId = useActiveHeading(ids)

  if (headings.length === 0) return null

  return (
    <nav aria-label="İçindekiler" className="py-6 pr-5 pl-4">
      <p
        className="mb-3 font-semibold uppercase"
        style={{
          fontSize: 'var(--text-label)',
          letterSpacing: '0.12em',
          color: 'var(--c-text-muted)',
        }}
      >
        İçindekiler
      </p>
      <ul style={{ fontSize: 'var(--text-toc)' }}>
        {headings.map((heading) => {
          const active = heading.id === activeId
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? 'true' : undefined}
                className="block border-l-2 py-1 transition-colors"
                style={{
                  paddingLeft: `calc(0.75rem + ${INDENT[heading.depth] ?? '1.5rem'})`,
                  borderColor: active ? 'var(--c-accent)' : 'transparent',
                  color: active ? 'var(--c-accent-strong)' : 'var(--c-text-faint)',
                  fontWeight: active ? 550 : 400,
                  lineHeight: 1.45,
                }}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
