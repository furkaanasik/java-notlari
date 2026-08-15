import FlexSearch from 'flexsearch'
import GithubSlugger from 'github-slugger'
import { docs, stripManualToc } from '../content/docs'

/**
 * Tam metin arama.
 *
 * Dokümanlar başlıklara göre bölümlere ayrılır; her bölüm ayrı bir kayıt olur.
 * Böylece sonuçta yalnızca dosya değil, "hangi başlığın altında" bilgisi de olur.
 *
 * Türkçe karakter duyarsızlığı `fold()` ile sağlanır: arama da içerik de aynı
 * katlama işleminden geçtiği için "sozlesme" araması "sözleşme"yi bulur.
 */

export type Section = {
  id: number
  docSlug: string
  docTitle: string
  heading: string
  headingId: string
  /** Arama ve bağlam için düzleştirilmiş metin */
  text: string
}

export type SearchHit = {
  section: Section
  /** Eşleşmenin çevresinden kesilmiş bağlam */
  snippet: string
}

const TR_MAP: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ş: 's',
  Ş: 's',
  ğ: 'g',
  Ğ: 'g',
  ü: 'u',
  Ü: 'u',
  ö: 'o',
  Ö: 'o',
  ç: 'c',
  Ç: 'c',
}

/** Türkçe karakterleri sadeleştirip küçük harfe indirger. */
export function fold(input: string): string {
  return input
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (char) => TR_MAP[char] ?? char)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Markdown gürültüsünü arama ve önizleme için temizle. */
function flatten(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // kod blokları
    .replace(/^\s*\|.*\|\s*$/gm, (row) => row.replace(/\|/g, ' ')) // tablo boruları
    .replace(/^[-:| ]+$/gm, ' ') // tablo hizalama satırları
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // linkler
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSections(): Section[] {
  const sections: Section[] = []
  let id = 0

  for (const doc of docs) {
    const body = stripManualToc(doc.source)
    const lines = body.split('\n')
    const slugger = new GithubSlugger()

    let heading = doc.title
    let headingId = ''
    let buffer: string[] = []
    let insideFence = false

    const flush = () => {
      const text = flatten(buffer.join('\n'))
      if (text.length > 0) {
        sections.push({ id: id++, docSlug: doc.slug, docTitle: doc.title, heading, headingId, text })
      }
      buffer = []
    }

    for (const line of lines) {
      if (/^\s*(```|~~~)/.test(line)) insideFence = !insideFence

      const match = insideFence ? null : /^(#{1,3})\s+(.+?)\s*$/.exec(line)
      if (match) {
        flush()
        heading = match[2].replace(/`/g, '').trim()
        headingId = slugger.slug(heading)
        continue
      }

      buffer.push(line)
    }

    flush()
  }

  return sections
}

export const sections: Section[] = buildSections()

const index = new FlexSearch.Index({
  tokenize: 'forward',
  encode: (value: string) => fold(value).split(/[^a-z0-9]+/).filter(Boolean),
})

for (const section of sections) {
  // Başlık da aranabilsin diye metne eklenir.
  index.add(section.id, `${section.docTitle} ${section.heading} ${section.text}`)
}

/** Eşleşen kelimenin çevresinden okunabilir bir parça kes. */
function makeSnippet(text: string, query: string): string {
  const folded = fold(text)
  const terms = fold(query).split(/\s+/).filter(Boolean)

  let at = -1
  for (const term of terms) {
    at = folded.indexOf(term)
    if (at !== -1) break
  }
  if (at === -1) return text.slice(0, 140).trim()

  const start = Math.max(0, at - 55)
  const end = Math.min(text.length, at + 105)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

export function search(query: string, limit = 20): SearchHit[] {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const ids = index.search(trimmed, { limit }) as number[]

  return ids
    .map((id) => sections[id])
    .filter((section): section is Section => Boolean(section))
    .map((section) => ({ section, snippet: makeSnippet(section.text, trimmed) }))
}
