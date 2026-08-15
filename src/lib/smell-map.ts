import { docs } from '../content/docs'

/**
 * Koku → refactoring → prensip haritası.
 *
 * Veri iki dosyadan okunur, elle tanımlanmaz:
 *   REFACTORING.md — "Koku → çözüm haritası" tablosu (omurga)
 *   REFACTORING.md — 4. bölümdeki koku katalogları (belirti metinleri)
 *
 * Tablolar değişirse harita da değişir.
 */

export type SmellEntry = {
  smell: string
  /** Katalogdan gelen belirti; her koku için olmayabilir. */
  symptom: string | null
  refactorings: string[]
  principles: string[]
}

export type SmellMapData = {
  entries: SmellEntry[]
  refactorings: string[]
  principles: string[]
}

function plain(cell: string): string {
  return cell
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "Extract Method, Decompose Conditional" → iki ayrı madde */
function splitList(cell: string): string[] {
  return plain(cell)
    .split(/\s*,\s*/)
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

/** Verilen başlık satırıyla eşleşen tablonun veri satırlarını döndürür. */
function tableRows(source: string, headerMatcher: RegExp): string[][] {
  const lines = source.split('\n')
  const rows: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    if (!headerMatcher.test(lines[i])) continue

    // Başlıktan sonra hizalama satırını atla, boş satıra kadar oku.
    for (let j = i + 2; j < lines.length; j++) {
      const line = lines[j]
      if (!line.startsWith('|')) break
      const cells = line.split('|').slice(1, -1)
      if (cells.length >= 2) rows.push(cells)
    }
  }

  return rows
}

function buildSmellMap(): SmellMapData {
  const refactoringDoc = docs.find((doc) => doc.fileName === 'REFACTORING')
  if (!refactoringDoc) return { entries: [], refactorings: [], principles: [] }

  const source = refactoringDoc.source

  // Belirti sözlüğü: katalog tablolarındaki "Koku | Belirti | ..." satırları.
  const symptoms = new Map<string, string>()
  for (const cells of tableRows(source, /^\|\s*Koku\s*\|\s*Belirti\s*\|/)) {
    const name = plain(cells[0])
    const symptom = plain(cells[1])
    if (name && symptom && !symptoms.has(name)) symptoms.set(name, symptom)
  }

  const entries: SmellEntry[] = []
  for (const cells of tableRows(source, /^\|\s*Koku\s*\|\s*Refactoring\s*\|/)) {
    const smell = plain(cells[0])
    if (!smell) continue

    entries.push({
      smell,
      symptom: symptoms.get(smell) ?? null,
      refactorings: splitList(cells[1] ?? ''),
      principles: splitList(cells[2] ?? ''),
    })
  }

  const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'tr'))

  return {
    entries,
    refactorings: unique(entries.flatMap((entry) => entry.refactorings)),
    principles: unique(entries.flatMap((entry) => entry.principles)),
  }
}

export const smellMap: SmellMapData = buildSmellMap()
