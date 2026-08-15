import { useCallback, useEffect, useState, type RefObject } from 'react'

const STORAGE_KEY = 'java-docs:read'

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

/**
 * Okuma ilerlemesi.
 *
 * `progress`: aktif dokümanda ne kadar aşağı inildiği (0-1).
 * `read`: sonuna kadar okunmuş dosyaların kümesi — localStorage'da tutulur,
 * sidebar'da işaretlenir.
 */
export function useReadingProgress(scrollRef: RefObject<HTMLElement | null>, slug: string) {
  const [progress, setProgress] = useState(0)
  const [read, setRead] = useState<Set<string>>(loadRead)

  const markRead = useCallback((value: string) => {
    setRead((current) => {
      if (current.has(value)) return current
      const next = new Set(current)
      next.add(value)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setRead(new Set())
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    // Her scroll olayında state güncellemek gereksiz render üretir; yalnızca
    // yüzde tam sayı olarak değiştiğinde güncelle.
    let lastPercent = -1

    const onScroll = () => {
      const scrollable = element.scrollHeight - element.clientHeight
      // Kısa dosyalarda kaydırılacak yer yok — açıldığı an okunmuş sayılır.
      const ratio = scrollable <= 8 ? 1 : Math.min(1, element.scrollTop / scrollable)
      const percent = Math.round(ratio * 100)

      if (percent !== lastPercent) {
        lastPercent = percent
        setProgress(percent / 100)
      }
      if (ratio > 0.98) markRead(slug)
    }

    onScroll()
    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [scrollRef, slug, markRead])

  return { progress, read, reset }
}
