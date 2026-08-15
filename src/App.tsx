import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { docs, extractHeadings, groupedDocs } from './content/docs'
import { useState } from 'react'

/**
 * MİNİMUM SÜRÜM — tek dosya render eder.
 * Router, arama, mermaid, shiki, dark mode ve diğer özellikler
 * sonraki adımlarda eklenecek.
 */
export default function App() {
  const [activeSlug, setActiveSlug] = useState(docs[0]?.slug ?? '')
  const doc = docs.find((d) => d.slug === activeSlug)
  const headings = doc ? extractHeadings(doc.source) : []

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] gap-8 px-6">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 py-8 pr-4 md:block">
        <p className="mb-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {docs.length} dosya
        </p>
        {groupedDocs().map((group) => (
          <div key={group.category} className="mb-6">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.docs.map((d) => (
                <li key={d.slug}>
                  <button
                    type="button"
                    onClick={() => setActiveSlug(d.slug)}
                    className={`w-full rounded px-2 py-1 text-left text-sm ${
                      d.slug === activeSlug
                        ? 'bg-accent-soft text-accent font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main className="min-w-0 flex-1 py-8">
        {doc ? (
          <article className="prose-body markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {doc.source}
            </ReactMarkdown>
          </article>
        ) : (
          <p>Dosya bulunamadı.</p>
        )}
      </main>

      <nav className="hidden w-56 shrink-0 py-8 lg:block">
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          İçindekiler
        </p>
        <ul className="space-y-1 text-sm">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: (h.depth - 1) * 10 }}>
              <a href={`#${h.id}`} className="text-slate-500 hover:text-accent">
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
