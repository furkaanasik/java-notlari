import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { docs, extractHeadings, stripManualToc } from './content/docs'
import { CATEGORY_LABELS } from './config/order'
import { Markdown, expandComponentMarkers } from './components/Markdown'
import { Sidebar } from './components/Sidebar'
import { Toc } from './components/Toc'
import { Header } from './components/Header'
import { SearchPalette } from './components/SearchPalette'
import { MobileDrawer } from './components/MobileDrawer'
import { PrintAll } from './components/PrintAll'
import { useTheme } from './hooks/useTheme'
import { useReadingProgress } from './hooks/useReadingProgress'
import { useKeyboardNav } from './hooks/useKeyboardNav'

export default function App() {
  const { theme, toggle } = useTheme()
  const [params, setParams] = useSearchParams()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [printAll, setPrintAll] = useState(false)
  // Bekleyen çapa state DEĞİL ref: state olsaydı temizlenmesi yeni bir render
  // tetikleyip effect'i ikinci kez çalıştırır ve sayfayı hemen başa döndürürdü.
  const pendingAnchor = useRef<string | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  const fallbackSlug = docs[0]?.slug ?? ''
  const requested = params.get('doc') ?? ''
  const doc = docs.find((item) => item.slug === requested) ?? docs.find((item) => item.slug === fallbackSlug)
  const activeSlug = doc?.slug ?? ''

  const openDoc = useCallback(
    (slug: string, anchor?: string) => {
      // Aynı doküman içindeki çapa: DOM zaten hazır, doğrudan kaydır.
      if (slug === activeSlug) {
        const target = anchor ? document.getElementById(anchor) : null
        if (target) target.scrollIntoView({ block: 'start' })
        return
      }

      // Farklı doküman: hedef başlık henüz DOM'da yok. İstek kaydedilir,
      // aşağıdaki effect render sonrası uygular.
      pendingAnchor.current = anchor ?? null
      setParams(slug === fallbackSlug ? {} : { doc: slug })
    },
    [setParams, fallbackSlug, activeSlug],
  )

  // Elle yazılmış "## İçindekiler" gövdeden çıkarılır; sağ panel onun yerini alır.
  const body = useMemo(
    () => (doc ? expandComponentMarkers(stripManualToc(doc.source)) : ''),
    [doc],
  )
  const headings = useMemo(() => extractHeadings(body), [body])

  const { progress, read } = useReadingProgress(mainRef, activeSlug)

  // n / p için komşu dosyalar
  const currentIndex = docs.findIndex((item) => item.slug === activeSlug)
  const goRelative = useCallback(
    (step: 1 | -1) => {
      const next = docs[currentIndex + step]
      if (next) openDoc(next.slug)
    },
    [currentIndex, openDoc],
  )

  useKeyboardNav({
    headings,
    scrollRef: mainRef,
    onNextDoc: () => goRelative(1),
    onPrevDoc: () => goRelative(-1),
    disabled: paletteOpen || menuOpen || printAll,
  })

  /**
   * Doküman render edildikten sonra: bekleyen bir çapa varsa oraya, yoksa
   * en üste kaydır. Böylece çapraz atıf ve arama sonucu doğru başlıkta açılır.
   */
  useEffect(() => {
    const anchor = pendingAnchor.current
    pendingAnchor.current = null

    const target = anchor ? document.getElementById(anchor) : null
    if (target) target.scrollIntoView({ block: 'start' })
    else mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeSlug, body])

  // Cmd/Ctrl+K ile arama paleti.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        // Toggle DEĞİL: aynı olay iki kez ulaşırsa (React StrictMode'da geliştirme
        // sırasında olabiliyor) toggle kendini iptal ediyordu. Açmak idempotent.
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /** Aramadan gelen seçim: dosyayı aç ve ilgili başlığa kaydır. */
  const goToResult = useCallback(
    (slug: string, headingId: string) => openDoc(slug, headingId),
    [openDoc],
  )

  if (printAll) return <PrintAll theme={theme} onExit={() => setPrintAll(false)} />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--c-bg-content)' }}>
      <a href="#icerik" className="skip-link">
        İçeriğe atla
      </a>
      <aside
        aria-label="Dosya listesi"
        className="hidden shrink-0 overflow-y-auto border-r md:block"
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--c-bg-panel)',
          borderColor: 'var(--c-border)',
        }}
      >
        <Sidebar activeSlug={activeSlug} onSelect={openDoc} read={read} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={doc?.title ?? '—'}
          category={doc ? (CATEGORY_LABELS[doc.category] ?? doc.category) : ''}
          theme={theme}
          onToggleTheme={toggle}
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
          onPrintAll={() => setPrintAll(true)}
          progress={progress}
        />

        <div className="flex min-h-0 flex-1">
          <main id="icerik" ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
            <div className="content-pad mx-auto py-12">
              {doc ? (
                <article className="markdown">
                  <Markdown source={body} theme={theme} onNavigate={openDoc} />
                </article>
              ) : (
                <p>Dosya bulunamadı.</p>
              )}
            </div>
          </main>

          <aside
            aria-label="Sayfa içindekiler"
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

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSlug={activeSlug}
        onSelect={openDoc}
        read={read}
        headings={headings}
        onSelectHeading={(id) => openDoc(activeSlug, id)}
      />

      <SearchPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={goToResult}
      />
    </div>
  )
}
