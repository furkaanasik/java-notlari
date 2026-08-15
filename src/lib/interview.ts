import GithubSlugger from 'github-slugger'
import { docs, stripManualToc } from '../content/docs'

/**
 * "Mülakat" geçen pasajları toplar.
 *
 * Dokümanlar boyunca 14 yerde "mülakatta sorulur", "mülakat tuzağı" gibi
 * uyarılar var; hepsi ayrı dosyalara dağılmış. Burada tek listede toplanır —
 * içerik yeniden yazılmaz, olduğu yerden alınır ve kaynağına bağlanır.
 */

export type InterviewNote = {
  id: string
  docSlug: string
  docTitle: string
  /** Pasajın altında bulunduğu başlık */
  heading: string
  headingId: string
  /** Ham markdown parçası (paragraf, tablo satırı veya alıntı) */
  excerpt: string
}

const TRIGGER = /mülakat/i

/** Markdown süslerini okunur düz metne indirger. */
function clean(text: string): string {
  return text
    .replace(/^>\s?/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/^\|\s*/, '')
    .replace(/\s*\|\s*$/, '')
    .replace(/\s*\|\s*/g, ' — ')
    .trim()
}

function collect(): InterviewNote[] {
  const notes: InterviewNote[] = []

  for (const doc of docs) {
    // Bu listeyi barındıran sayfa kendini toplamasın — girişinde "mülakat"
    // geçtiği için kendi kendine kaynak oluyordu.
    if (/component:\s*InterviewNotes/.test(doc.source)) continue

    const lines = stripManualToc(doc.source).split('\n')
    const slugger = new GithubSlugger()

    let heading = doc.title
    let headingId = ''
    let insideFence = false
    let buffer: string[] = []

    const flushParagraph = () => {
      const text = buffer.join('\n').trim()
      buffer = []
      if (text === '' || !TRIGGER.test(text)) return

      // "Mülakat tuzağı:" gibi tek başına anlam taşımayan giriş cümleleri —
      // asıl içerik altındaki kod bloğunda kalıyor, burada gürültü olurdu.
      const cleaned = clean(text)
      if (cleaned.length < 40 || /:$/.test(cleaned)) return

      notes.push({
        id: `${doc.slug}#${notes.length}`,
        docSlug: doc.slug,
        docTitle: doc.title,
        heading,
        headingId,
        excerpt: cleaned,
      })
    }

    for (const line of lines) {
      if (/^\s*(```|~~~)/.test(line)) {
        insideFence = !insideFence
        buffer = []
        continue
      }
      if (insideFence) continue

      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line)
      if (match) {
        flushParagraph()
        heading = match[2].replace(/`/g, '').trim()
        headingId = slugger.slug(heading)
        continue
      }

      // Boş satır paragrafı bitirir; tablo satırları tek başına değerlendirilir.
      if (line.trim() === '') {
        flushParagraph()
        continue
      }

      if (line.startsWith('|')) {
        flushParagraph()
        buffer = [line]
        flushParagraph()
        continue
      }

      buffer.push(line)
    }

    flushParagraph()
  }

  return notes
}

export const interviewNotes: InterviewNote[] = collect()
