/**
 * İçerik bütünlüğü kontrolü — build'e bağlıdır.
 *
 * Dokümanlar birbirine dosya adı ve başlık çapasıyla atıf yapıyor, ayrıca
 * interaktif bileşenleri isimle çağırıyor. Bu bağların hiçbirini derleyici
 * doğrulamaz: bir dosya yeniden adlandırıldığında ya da bir başlık
 * değiştiğinde her şey sessizce kırılır. (JAVA.md bölünürken tam olarak bu
 * oldu; üç atıf kırıldı ve tesadüfen fark edildi.)
 *
 * Denetlenenler:
 *   1. `X.md` biçimindeki dosya atıfları var olan bir dosyayı gösteriyor mu
 *   2. `](#çapa)` bağlantıları aynı dosyada gerçekten bir başlığa denk geliyor mu
 *   3. `<!-- component:X -->` çağrıları kayıtlı bir bileşene mi ait
 *   4. Kayıtlı ama hiç kullanılmayan bileşen var mı (yalnızca uyarı)
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, dirname } from 'node:path'
import GithubSlugger from 'github-slugger'

const CONTENT = 'content'
const REGISTRY = 'src/components/interactive/registry.tsx'

/**
 * Metinde geçen ama kasıtlı olarak dosyası olmayan adlar.
 * Bunlar "planlanan" olarak işaretli; bağlantıya çevrilmiyorlar.
 */
const PLANNED = new Set(['SPRING-BOOT.md'])

async function markdownFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await markdownFiles(full)))
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out.sort()
}

/** Kod bloklarını boşlukla değiştirir; içlerindeki `#` ve `X.md` sayılmasın. */
function withoutCode(source) {
  return source.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, ' '))
}

/** Dosyadaki başlıkların github-slugger kimlikleri. */
function headingIds(source) {
  const slugger = new GithubSlugger()
  const ids = new Set()
  let insideFence = false

  for (const line of source.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence
      continue
    }
    if (insideFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line)
    if (match) ids.add(slugger.slug(match[2].replace(/`/g, '').trim()))
  }
  return ids
}

const files = await markdownFiles(CONTENT)
const sources = new Map()
for (const file of files) sources.set(file, await readFile(file, 'utf8'))

// Bilinen dosya adları (uzantılı, büyük/küçük duyarsız)
const known = new Set(files.map((file) => file.split('/').pop().toLowerCase()))

// Kayıtlı bileşenler
const registry = await readFile(REGISTRY, 'utf8')
const registered = new Set(
  [...registry.matchAll(/^\s{2}([A-Z][\w]*),\s*$/gm)].map((match) => match[1]),
)

const problems = []
const usedComponents = new Set()

for (const [file, source] of sources) {
  const where = relative('.', file)
  const prose = withoutCode(source)
  const ids = headingIds(source)

  // 1. Dosya atıfları
  for (const match of prose.matchAll(/\b([A-Za-z0-9][\w-]*\.md)\b/g)) {
    const name = match[1]
    if (PLANNED.has(name)) continue
    if (!known.has(name.toLowerCase())) {
      const line = prose.slice(0, match.index).split('\n').length
      problems.push(`${where}:${line} → "${name}" diye bir içerik dosyası yok`)
    }
  }

  // 2. Dosya içi çapalar
  for (const match of prose.matchAll(/\]\(#([^)]+)\)/g)) {
    const anchor = decodeURIComponent(match[1])
    if (!ids.has(anchor)) {
      const line = prose.slice(0, match.index).split('\n').length
      problems.push(`${where}:${line} → "#${anchor}" çapası bu dosyada bir başlığa denk gelmiyor`)
    }
  }

  // 3. Bileşen çağrıları
  for (const match of source.matchAll(
    /<!--\s*component:\s*([A-Za-z][\w-]*)\s*-->|:::component\{name="([A-Za-z][\w-]*)"\}/g,
  )) {
    const name = match[1] ?? match[2]
    usedComponents.add(name)
    if (!registered.has(name)) {
      const line = source.slice(0, match.index).split('\n').length
      problems.push(`${where}:${line} → "${name}" kayıtlı bir interaktif bileşen değil`)
    }
  }

  void dirname
}

console.log(
  `içerik: ${files.length} dosya, ${registered.size} kayıtlı bileşen (${usedComponents.size} kullanılıyor)`,
)

// 4. Kullanılmayan bileşenler — hata değil, uyarı
const unused = [...registered].filter((name) => !usedComponents.has(name))
if (unused.length > 0) {
  console.warn(`⚠ hiçbir dosyada çağrılmayan bileşen: ${unused.join(', ')}`)
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} bütünlük sorunu:\n`)
  for (const problem of problems) console.error('  ' + problem)
  process.exit(1)
}

console.log('✓ atıflar, çapalar ve bileşen çağrıları tutarlı')
