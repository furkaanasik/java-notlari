import GithubSlugger from 'github-slugger'
import { CATEGORY_LABELS, CATEGORY_ORDER, MANUAL_ORDER } from '../config/order'

/**
 * Tüm markdown dosyaları build zamanında gömülür.
 * Yeni bir .md eklemek için KOD DEĞİŞİKLİĞİ GEREKMEZ — dosyayı content/
 * altına koymak yeterli, menüde otomatik çıkar.
 */
const RAW = import.meta.glob('/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type Doc = {
  /** URL'de kullanılan kimlik, ör. "patterns/03-builder" */
  slug: string
  /** Dosya adı, uzantısız — ör. "03-builder" */
  fileName: string
  /** Klasör; kök seviyesi için "" */
  category: string
  /** Menüde görünen ad — dosyadaki ilk h1, yoksa dosya adı */
  title: string
  /** Ham markdown */
  source: string
  /** Sıralama anahtarı */
  order: number
}

/** "## Başlık" satırlarından üretilen içindekiler girdisi. */
export type Heading = {
  depth: number
  text: string
  id: string
}

function stripPrefix(fileName: string): string {
  return fileName.replace(/^\d+[-_]/, '')
}

/** Dosya adındaki sayı prefix'i; yoksa null. */
function numericPrefix(fileName: string): number | null {
  const match = /^(\d+)[-_]/.exec(fileName)
  return match ? Number(match[1]) : null
}

function orderOf(fileName: string): number {
  const prefix = numericPrefix(fileName)
  if (prefix !== null) return prefix

  const manual = MANUAL_ORDER.indexOf(fileName)
  // Listede yoksa sona at — ama prefix'li dosyaların da arkasına düşmesin diye
  // manuel blok 1000'den başlar, bilinmeyenler 9000'den.
  return manual === -1 ? 9000 : 1000 + manual
}

/** Dosyadaki ilk h1'i başlık olarak kullan; yoksa dosya adına düş. */
function extractTitle(source: string, fileName: string): string {
  const match = /^#\s+(.+?)\s*$/m.exec(source)
  if (match) return match[1].trim()
  return stripPrefix(fileName).replace(/[-_]/g, ' ')
}

/**
 * Başlıkları çıkarır. h1 de toplanır — PRINCIPLES/TESTING/REFACTORING
 * dosyalarında her ana bölüm h1 olduğu için h2/h3 ile sınırlarsak
 * içindekiler boş çıkardı.
 *
 * Kod bloklarının içindeki "# yorum" satırları başlık sanılmasın diye
 * fence'ler atlanır.
 */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let insideFence = false

  for (const line of source.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence
      continue
    }
    if (insideFence) continue

    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const text = match[2].replace(/`/g, '').trim()
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) })
  }

  return headings
}

function buildDocs(): Doc[] {
  const docs = Object.entries(RAW).map(([path, source]) => {
    // "/content/patterns/03-builder.md" → "patterns/03-builder"
    const slug = path.replace(/^\/content\//, '').replace(/\.md$/, '')
    const segments = slug.split('/')
    const fileName = segments.pop() as string
    const category = segments.join('/')

    return {
      slug,
      fileName,
      category,
      title: extractTitle(source, fileName),
      source,
      order: orderOf(fileName),
    }
  })

  return docs.sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category)
    const catB = CATEGORY_ORDER.indexOf(b.category)
    const rankA = catA === -1 ? Number.MAX_SAFE_INTEGER : catA
    const rankB = catB === -1 ? Number.MAX_SAFE_INTEGER : catB
    if (rankA !== rankB) return rankA - rankB
    if (a.order !== b.order) return a.order - b.order
    return a.fileName.localeCompare(b.fileName, 'tr')
  })
}

export const docs: Doc[] = buildDocs()

export function getDoc(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug)
}

export type DocGroup = { category: string; label: string; docs: Doc[] }

/** Sidebar için kategoriye göre gruplanmış liste. */
export function groupedDocs(): DocGroup[] {
  const groups: DocGroup[] = []
  for (const doc of docs) {
    let group = groups.find((g) => g.category === doc.category)
    if (!group) {
      group = {
        category: doc.category,
        label: CATEGORY_LABELS[doc.category] ?? doc.category,
        docs: [],
      }
      groups.push(group)
    }
    group.docs.push(doc)
  }
  return groups
}
