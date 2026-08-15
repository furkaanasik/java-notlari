import { docs, type Doc } from '../content/docs'

/**
 * Pattern ilişki grafiği — veriyi markdown'dan ÇIKARIR, elle tanımlamaz.
 *
 * Her pattern dosyasının "İlgili ve karıştırılan pattern'ler" tablosu zaten
 * ilişkileri anlatıyor; bu bilgi 12 ayrı dosyaya dağılmış durumda ve hiçbir
 * yerde bütün resim yok. Burada tablolar ayrıştırılıp tek grafa dönüştürülür.
 *
 * Yeni bir pattern dosyası eklendiğinde graf kendiliğinden büyür.
 */

export type Category = 'creational' | 'structural' | 'behavioral'

export const CATEGORY_LABEL: Record<Category, string> = {
  creational: 'Creational',
  structural: 'Structural',
  behavioral: 'Behavioral',
}

/** GoF'un 23 pattern'i, kategorileriyle. Dosyası olmayanlar "planlanan" görünür. */
const CATALOG: { name: string; category: Category }[] = [
  { name: 'Factory Method', category: 'creational' },
  { name: 'Abstract Factory', category: 'creational' },
  { name: 'Builder', category: 'creational' },
  { name: 'Prototype', category: 'creational' },
  { name: 'Singleton', category: 'creational' },
  { name: 'Adapter', category: 'structural' },
  { name: 'Bridge', category: 'structural' },
  { name: 'Composite', category: 'structural' },
  { name: 'Decorator', category: 'structural' },
  { name: 'Facade', category: 'structural' },
  { name: 'Flyweight', category: 'structural' },
  { name: 'Proxy', category: 'structural' },
  { name: 'Chain of Responsibility', category: 'behavioral' },
  { name: 'Command', category: 'behavioral' },
  { name: 'Iterator', category: 'behavioral' },
  { name: 'Mediator', category: 'behavioral' },
  { name: 'Memento', category: 'behavioral' },
  { name: 'Observer', category: 'behavioral' },
  { name: 'State', category: 'behavioral' },
  { name: 'Strategy', category: 'behavioral' },
  { name: 'Template Method', category: 'behavioral' },
  { name: 'Visitor', category: 'behavioral' },
  { name: 'Interpreter', category: 'behavioral' },
]

export type EdgeKind = 'confused' | 'together' | 'opposite'

export const EDGE_LABEL: Record<EdgeKind, string> = {
  confused: 'Karıştırılan',
  together: 'Birlikte kullanılan',
  opposite: 'Zıt',
}

export type PatternNode = {
  name: string
  category: Category
  /** Dosyası var mı; yoksa "planlanan" */
  slug: string | null
}

export type PatternEdge = {
  source: string
  target: string
  kind: EdgeKind
  /** Tablodaki açıklama — kenara tıklayınca gösterilir */
  note: string
}

export type PatternGraphData = {
  nodes: PatternNode[]
  edges: PatternEdge[]
}

const RELATION_HEADING = /^#{2,3}\s+\d*\.?\s*(?:İlgili ve karıştırılan|Karışanlar)/i

/** Açıklamanın diline bakarak ilişki türünü belirle. */
function classify(note: string): EdgeKind {
  if (/zıt|tam zıttı|tam tersi|tersi\b/i.test(note)) return 'opposite'
  if (/birlikte|sık sık|beraber|birleştir|yanında/i.test(note)) return 'together'
  return 'confused'
}

/** Hücre metnindeki markdown süslerini at. */
function plain(cell: string): string {
  return cell
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Hücrede geçen kanonik pattern adını bul (en uzun eşleşme kazanır). */
function findPattern(cell: string): string | null {
  const text = plain(cell).toLocaleLowerCase('tr')
  let best: string | null = null
  for (const entry of CATALOG) {
    const name = entry.name.toLocaleLowerCase('tr')
    if (!text.includes(name)) continue
    if (!best || name.length > best.length) best = entry.name
  }
  return best
}

/** Bir pattern dosyasının ilişki tablosunu ayrıştır. */
function parseRelations(doc: Doc, self: string): PatternEdge[] {
  const lines = doc.source.split('\n')
  const start = lines.findIndex((line) => RELATION_HEADING.test(line))
  if (start === -1) return []

  const edges: PatternEdge[] = []

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (/^#{1,6}\s/.test(line)) break // sonraki bölüm
    if (!line.startsWith('|')) continue

    const cells = line.split('|').slice(1, -1)
    if (cells.length < 2) continue
    if (/^\s*:?-{2,}/.test(cells[0])) continue // hizalama satırı

    const target = findPattern(cells[0])
    const note = plain(cells.slice(1).join(' '))
    if (!target || target === self || note === '' || /^Fark$|^İlişki$/i.test(note)) continue

    edges.push({ source: self, target, kind: classify(note), note })
  }

  return edges
}

function buildGraph(): PatternGraphData {
  const patternDocs = docs.filter(
    (doc) => doc.category === 'patterns' && !doc.fileName.startsWith('00'),
  )

  const slugByName = new Map<string, string>()
  for (const doc of patternDocs) {
    const name = findPattern(doc.title)
    if (name) slugByName.set(name, doc.slug)
  }

  const nodes: PatternNode[] = CATALOG.map((entry) => ({
    name: entry.name,
    category: entry.category,
    slug: slugByName.get(entry.name) ?? null,
  }))

  const edges: PatternEdge[] = []
  const seen = new Set<string>()

  for (const doc of patternDocs) {
    const self = findPattern(doc.title)
    if (!self) continue

    for (const edge of parseRelations(doc, self)) {
      // Aynı çift iki dosyadan da anlatılmış olabilir — yönsüz olarak tekille.
      const key = [edge.source, edge.target].sort().join('::')
      if (seen.has(key)) continue
      seen.add(key)
      edges.push(edge)
    }
  }

  return { nodes, edges }
}

export const patternGraph: PatternGraphData = buildGraph()
