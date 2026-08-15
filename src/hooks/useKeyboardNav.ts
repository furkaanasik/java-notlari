import { useEffect, type RefObject } from 'react'
import type { Heading } from '../content/docs'

type Options = {
  headings: Heading[]
  /** Kaydırılan kap — hedef konum bunun üzerinden hesaplanır. */
  scrollRef: RefObject<HTMLElement | null>
  onPrevDoc: () => void
  onNextDoc: () => void
  /** Palet gibi bir katman açıkken kısayollar susar. */
  disabled: boolean
}

/** Yazı yazılan bir alanda mıyız? */
function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}

/** Sabit başlığın altında bırakılacak boşluk (markdown'daki scroll-margin ile aynı). */
const OFFSET = 76

/**
 * Klavye navigasyonu: `j`/`k` sonraki/önceki başlık, `n`/`p` sonraki/önceki dosya.
 *
 * Hedef konum `scrollIntoView` yerine elle hesaplanır. Sebebi: ilk başlık zaten
 * tepedeyken `scrollIntoView` negatif bir konuma denk gelip clamp'lendiği için
 * kaydırma hiç olmuyor ve `j` sürekli aynı başlığı seçip kilitleniyordu.
 */
export function useKeyboardNav({
  headings,
  scrollRef,
  onPrevDoc,
  onNextDoc,
  disabled,
}: Options) {
  useEffect(() => {
    if (disabled) return

    const jump = (direction: 1 | -1) => {
      const container = scrollRef.current
      if (!container) return

      const containerTop = container.getBoundingClientRect().top
      const current = container.scrollTop

      // Her başlığın kap içindeki hedef kaydırma konumu
      const targets = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => element !== null)
        .map(
          (element) =>
            element.getBoundingClientRect().top - containerTop + container.scrollTop - OFFSET,
        )
        .map((value) => Math.max(0, Math.round(value)))

      if (targets.length === 0) return

      const EPS = 4
      const next =
        direction === 1
          ? targets.find((value) => value > current + EPS)
          : [...targets].reverse().find((value) => value < current - EPS)

      // Sona/başa gelindiyse kabın ucuna git.
      const fallback = direction === 1 ? container.scrollHeight : 0
      container.scrollTo({ top: next ?? fallback, behavior: 'smooth' })
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return

      switch (event.key) {
        case 'j':
          event.preventDefault()
          jump(1)
          break
        case 'k':
          event.preventDefault()
          jump(-1)
          break
        case 'n':
          event.preventDefault()
          onNextDoc()
          break
        case 'p':
          event.preventDefault()
          onPrevDoc()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [headings, scrollRef, onPrevDoc, onNextDoc, disabled])
}
