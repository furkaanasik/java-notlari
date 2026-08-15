import { useEffect, useMemo, useRef, useState } from 'react'
import { docs, extractHeadings, stripManualToc } from './content/docs'
import { CATEGORY_LABELS } from './config/order'
import { Markdown } from './components/Markdown'
import { Sidebar } from './components/Sidebar'
import { Toc } from './components/Toc'
import { Header } from './components/Header'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()
  const [activeSlug, setActiveSlug] = useState(docs[0]?.slug ?? '')
  const mainRef = useRef<HTMLElement>(null)

  const doc = docs.find((d) => d.slug === activeSlug)

  // Elle yazılmış "## İçindekiler" bloğu gövdeden çıkarılır; sağ panel onun yerini alır.
  const body = useMemo(() => (doc ? stripManualToc(doc.source) : ''), [doc])
  const headings = useMemo(() => extractHeadings(body), [body])

  // Dosya değişince içerik en üste dönsün.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeSlug])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--c-bg-content)' }}>
      <aside
        className="hidden shrink-0 overflow-y-auto border-r md:block"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--c-bg-panel)',
          borderColor: 'var(--c-border)',
        }}
      >
        <Sidebar activeSlug={activeSlug} onSelect={setActiveSlug} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={doc?.title ?? '—'}
          category={doc ? (CATEGORY_LABELS[doc.category] ?? doc.category) : ''}
          theme={theme}
          onToggleTheme={toggle}
        />

        <div className="flex min-h-0 flex-1">
          <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
            <div className="content-pad mx-auto py-12">
              {doc ? (
                <article className="markdown">
                  <Markdown source={body} theme={theme} />
                </article>
              ) : (
                <p>Dosya bulunamadı.</p>
              )}
            </div>
          </main>

          <aside
            className="hidden shrink-0 overflow-y-auto border-l lg:block"
            style={{
              width: 'var(--toc-w)',
              background: 'var(--c-bg-panel)',
              borderColor: 'var(--c-border)',
            }}
          >
            <Toc headings={headings} />
          </aside>
        </div>
      </div>
    </div>
  )
}
