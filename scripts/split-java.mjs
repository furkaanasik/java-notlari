/**
 * JAVA.md'yi konu başlıklarına göre ayrı dosyalara böler.
 *
 * Tek dosya 5.300 satır, 193 kod bloğu ve ~20.000 DOM düğümü üretiyordu;
 * açılışı 3-4 saniye sürüyordu. Bölümler zaten numaralı ve bağımsız.
 *
 * Kural: gövde metni HİÇ değiştirilmez. Yalnızca dosya başına bir h1 ve
 * bölümler eklenir/kaldırılır; script sonunda içerik kaybı olmadığı doğrulanır.
 *
 *   node scripts/split-java.mjs          → böl
 *   node scripts/split-java.mjs --check  → sadece doğrula, yazma
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import GithubSlugger from 'github-slugger'

const SOURCE = 'content/JAVA.md'
const TARGET_DIR = 'content/java'

/** Hangi bölümler hangi dosyaya gidecek (bölüm numaraları dahil). */
const GROUPS = [
  { file: '01-temeller.md', title: 'Java Temelleri', sections: [1, 2, 3, 4, 5, 6, 7] },
  { file: '02-oop-temel.md', title: 'OOP — Temel Kavramlar', sections: [8, 9] },
  { file: '03-oop-prensipler.md', title: 'OOP — Prensipler ve İlişkiler', sections: [10, 11, 12] },
  { file: '04-strings.md', title: 'Java Strings', sections: [13] },
  { file: '05-exceptions.md', title: 'Java Exceptions', sections: [14] },
  { file: '06-arrays.md', title: 'Java Arrays', sections: [15] },
  { file: '07-collections.md', title: 'Java Collections', sections: [16] },
  { file: '08-streams.md', title: 'Java Streams', sections: [17] },
  { file: '09-jvm.md', title: 'JVM, Class Loader ve GC', sections: [18] },
  { file: '10-concurrency.md', title: 'Java Concurrency', sections: [19] },
  { file: '11-java21.md', title: 'Java 21 — Virtual Threads', sections: [20] },
]

const source = await readFile(SOURCE, 'utf8')
const lines = source.split('\n')

// Bölüm sınırlarını bul
const starts = []
lines.forEach((line, index) => {
  const match = /^## (\d+)\. /.exec(line)
  if (match) starts.push({ number: Number(match[1]), index })
})

if (starts.length !== 20) {
  console.error(`✗ 20 bölüm bekleniyordu, ${starts.length} bulundu`)
  process.exit(1)
}

/** Bir bölümün gövdesi: başlığından bir sonraki bölümün başlangıcına kadar. */
function sectionBody(number) {
  const at = starts.findIndex((s) => s.number === number)
  const from = starts[at].index
  const to = at + 1 < starts.length ? starts[at + 1].index : lines.length
  return lines.slice(from, to)
}

// Dosyaların dışında kalan giriş (başlık + açıklama + TOC) ilk bölümden önce
const preamble = lines.slice(0, starts[0].index)

const outputs = GROUPS.map((group) => {
  const body = group.sections.flatMap((number) => sectionBody(number))

  // Dosya başına tek h1 + kısa içindekiler
  const toc = group.sections.map((number) => {
    const heading = lines[starts.find((s) => s.number === number).index]
    const text = heading.replace(/^##\s+/, '')
    // Çapa, önyüzün ve GitHub'ın kullandığı slug üreticisiyle aynı olmalı;
    // elle yazılmış bir sadeleştirme "—" ve "İ" gibi karakterlerde tutmuyordu.
    const anchor = new GithubSlugger().slug(text)
    return `- [${text}](#${anchor})`
  })

  const header = [
    `# ${group.title}`,
    '',
    'Java dili referans notlarının bir parçası. Seri:',
    'Temeller → OOP → Strings → Exceptions → Arrays → Collections →',
    'Streams → JVM → Concurrency → Java 21.',
    '',
  ]

  const contents = group.sections.length > 1 ? ['## İçindekiler', '', ...toc, '', '---', ''] : []

  return { file: group.file, lines: [...header, ...contents, ...body] }
})

// ---- Doğrulama: bölüm gövdelerinin tamamı korunmuş mu? ----
const originalBody = lines.slice(starts[0].index).join('\n').trim()
const rebuilt = GROUPS.flatMap((group) => group.sections)
  .sort((a, b) => a - b)
  .flatMap((number) => sectionBody(number))
  .join('\n')
  .trim()

if (originalBody !== rebuilt) {
  console.error('✗ Bölümlerin birleşimi orijinalle aynı değil — bölme iptal edildi')
  process.exit(1)
}

const covered = GROUPS.flatMap((g) => g.sections).sort((a, b) => a - b)
const expected = starts.map((s) => s.number).sort((a, b) => a - b)
if (covered.join(',') !== expected.join(',')) {
  console.error('✗ Bazı bölümler hiçbir dosyaya atanmamış')
  process.exit(1)
}

console.log(`✓ 20 bölüm, ${outputs.length} dosyaya bölünüyor; gövde birebir korunuyor`)
console.log(`  giriş bloğu: ${preamble.length} satır (dosya başlıkları yeniden yazıldı)`)

if (process.argv.includes('--check')) process.exit(0)

await rm(TARGET_DIR, { recursive: true, force: true })
await mkdir(TARGET_DIR, { recursive: true })

for (const output of outputs) {
  const text = output.lines.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n'
  await writeFile(join(TARGET_DIR, output.file), text, 'utf8')
  console.log(`  ${TARGET_DIR}/${output.file.padEnd(20)} ${output.lines.length} satır`)
}

await rm(SOURCE)
console.log(`\n${SOURCE} kaldırıldı.`)
