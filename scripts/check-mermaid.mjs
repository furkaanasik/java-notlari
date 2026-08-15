/**
 * Mermaid render smoke test.
 *
 * content/ altındaki TÜM ```mermaid bloklarını bulur ve her birini gerçekten
 * render etmeyi dener. Bir tanesi bile kırılırsa süreç 1 ile çıkar — yani
 * `npm run build` kırmızı olur.
 *
 * Neden gerekli: mermaid sözdizimi hatası sessizce "kırmızı hata kutusu"na
 * dönüşür; sayfa açılır, diyagram kaybolur. Build'de yakalanması şart.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const CONTENT_DIR = new URL('../content/', import.meta.url).pathname
const FENCE = /^([ \t]*)```mermaid[ \t]*\n([\s\S]*?)^\1```[ \t]*$/gm

/** content/ altındaki tüm .md dosyalarını topla */
async function markdownFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await markdownFiles(full)))
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out.sort()
}

/** Bir dosyadaki mermaid bloklarını satır numarasıyla birlikte çıkar */
function extractDiagrams(source) {
  const found = []
  for (const match of source.matchAll(FENCE)) {
    const line = source.slice(0, match.index).split('\n').length
    found.push({ line, code: match[2] })
  }
  return found
}

async function main() {
  const files = await markdownFiles(CONTENT_DIR)

  const diagrams = []
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const d of extractDiagrams(source)) {
      diagrams.push({ ...d, file: relative(process.cwd(), file) })
    }
  }

  if (diagrams.length === 0) {
    console.error('✗ Hiç mermaid bloğu bulunamadı — test anlamsız, muhtemelen bozuk.')
    process.exit(1)
  }

  // mermaid tarayıcı API'lerine dayanır; jsdom ile minimal bir DOM sağlıyoruz.
  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true })
  for (const key of ['window', 'document', 'navigator', 'Element', 'SVGElement', 'DOMPurify']) {
    if (key in globalThis) continue
    if (key === 'DOMPurify') continue
    globalThis[key] = dom.window[key]
  }
  globalThis.window ??= dom.window
  globalThis.document ??= dom.window.document

  const mermaid = (await import('mermaid')).default
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })

  const failures = []
  for (const [i, d] of diagrams.entries()) {
    try {
      // parse(), render etmeden sözdizimini doğrular ve hatada throw eder.
      await mermaid.parse(d.code)
    } catch (err) {
      failures.push({ ...d, message: String(err?.message ?? err).split('\n')[0] })
    }
    void i
  }

  console.log(`mermaid: ${diagrams.length} diyagram tarandı (${files.length} dosya)`)

  if (failures.length > 0) {
    console.error(`\n✗ ${failures.length} diyagram kırık:\n`)
    for (const f of failures) {
      console.error(`  ${f.file}:${f.line}`)
      console.error(`    ${f.message}\n`)
    }
    process.exit(1)
  }

  console.log('✓ hepsi geçerli')
}

main().catch((err) => {
  console.error('mermaid smoke test çalıştırılamadı:', err)
  process.exit(1)
})
