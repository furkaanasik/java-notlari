import { docs, extractHeadings } from '../content/docs'
import { fold } from './search'

/**
 * Metindeki dosya adı atıflarını bağlantıya çevirir.
 *
 * Dokümanlar birbirine düz metinle atıf yapıyor:
 *   "(Bkz. TESTING.md — Mock ne zaman tasarım kokusudur)"
 *   "PRINCIPLES.md"
 *
 * Bunlar okunabilir ama tıklanamazdı. Bu rehype eklentisi metin düğümlerini
 * tarar ve yalnızca GERÇEKTEN VAR OLAN dosyalara bağlantı üretir — olmayan bir
 * dosya (ör. planlanan Spring Boot notu) düz metin olarak kalır, kırık link
 * oluşmaz.
 *
 * Başlık kısmı yalnızca hedef dosyada eşleşen bir başlık varsa bağlantıya
 * dahil edilir; yoksa cümlenin geri kalanı yenmeden dosya bağlantısı üretilir.
 */

type HeadingRef = { id: string; folded: string }

/** Dosya adı (uzantısız, büyük harf) → hedef bilgisi */
const TARGETS = new Map<string, { slug: string; headings: HeadingRef[] }>()

for (const doc of docs) {
  TARGETS.set(doc.fileName.toUpperCase(), {
    slug: doc.slug,
    headings: extractHeadings(doc.source).map((heading) => ({
      id: heading.id,
      // "9. Mock ne zaman..." → "mock ne zaman..." (numara ön ekini at)
      folded: fold(heading.text.replace(/^\d+(\.\d+)*\.?\s*/, '')).trim(),
    })),
  })
}

/** "Bkz. X.md — Başlık" veya yalın "X.md" */
const REFERENCE =
  /([A-ZÇĞİÖŞÜ][A-Z0-9ÇĞİÖŞÜ-]*)\.md(?:\s*[—–-]\s*([^.,;)\n]+(?:\n[^.,;)\n]+)?))?/g

function findHeading(headings: HeadingRef[], phrase: string): string | null {
  const wanted = fold(phrase.replace(/\s+/g, ' ').trim())
  if (wanted.length < 3) return null

  for (const heading of headings) {
    if (heading.folded === wanted) return heading.id
  }
  // Kısmi eşleşme: "Immutability" ↔ "Immutability (Değişmezlik)"
  for (const heading of headings) {
    if (heading.folded.startsWith(wanted) || wanted.startsWith(heading.folded)) return heading.id
  }
  return null
}

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

/** Bir metin düğümünü, atıflar bağlantıya çevrilmiş düğüm dizisine böler. */
function linkify(value: string): HastNode[] | null {
  const out: HastNode[] = []
  let lastIndex = 0
  let matched = false

  REFERENCE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = REFERENCE.exec(value)) !== null) {
    const [whole, fileName, phrase] = match
    const target = TARGETS.get(fileName.toUpperCase())
    if (!target) continue // dosya yok → düz metin kalsın

    const headingId = phrase ? findHeading(target.headings, phrase) : null

    // Başlık eşleşmediyse sadece "X.md" kısmını bağlantıla, cümleyi yeme.
    const consumed = headingId ? whole : `${fileName}.md`
    const start = match.index
    const end = start + consumed.length

    if (start > lastIndex) out.push({ type: 'text', value: value.slice(lastIndex, start) })

    out.push({
      type: 'element',
      tagName: 'a',
      properties: {
        href: `?doc=${target.slug}${headingId ? `#${headingId}` : ''}`,
        className: ['xref'],
        'data-doc': target.slug,
        'data-anchor': headingId ?? '',
      },
      children: [{ type: 'text', value: consumed }],
    })

    lastIndex = end
    REFERENCE.lastIndex = end
    matched = true
  }

  if (!matched) return null
  if (lastIndex < value.length) out.push({ type: 'text', value: value.slice(lastIndex) })
  return out
}

/** İçinde bağlantı üretilmemesi gereken kaplar. */
const SKIP = new Set(['a', 'code', 'pre'])

export function rehypeCrossRefs() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return

      const next: HastNode[] = []
      for (const child of node.children) {
        if (child.type === 'text' && typeof child.value === 'string') {
          const replaced = linkify(child.value)
          if (replaced) {
            next.push(...replaced)
            continue
          }
          next.push(child)
          continue
        }

        if (child.type === 'element' && child.tagName && SKIP.has(child.tagName)) {
          next.push(child)
          continue
        }

        walk(child)
        next.push(child)
      }
      node.children = next
    }

    walk(tree)
  }
}
