import { useEffect, useState } from 'react'

/**
 * Scroll pozisyonuna göre aktif başlığı belirler.
 *
 * IntersectionObserver "görünür olanlar" kümesini verir; aktif başlık olarak
 * bunların en yukarıdakini seçeriz. Hiçbiri görünmüyorsa (uzun bir bölümün
 * ortasındaysak) son geçilen başlık aktif kalır.
 */
export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null)
      return
    }

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
        }

        if (visible.size === 0) return
        // Belge sırasına göre en yukarıdaki görünür başlık
        const first = ids.find((id) => visible.has(id))
        if (first) setActiveId(first)
      },
      // Üst şerit: header yüksekliği kadar aşağıdan başlat, alt %65'i yok say.
      { rootMargin: '-72px 0px -65% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [ids])

  return activeId
}
