/**
 * Kod bloklarını "okunacak metin" olmaktan çıkarıp anlamlandırır.
 *
 * Dokümantasyon zaten iki kalıp üzerine kurulu:
 *   1. Tek blok içinde "// Önce" ... "// Sonra" karşılaştırması
 *   2. Satır sonunda ❌ / ✅ ile işaretlenmiş doğru/yanlış örnekler
 *
 * Buradaki işlevler bu kalıpları TESPİT eder; markdown'a hiçbir şey eklenmez.
 */

export type Segment = {
  label: string
  kind: 'before' | 'after'
  code: string
}

/** Yalnız başına duran yorum satırı mı, ve hangi tarafı işaret ediyor? */
/*
 * Sözcük sonu için `\b` KULLANILMIYOR: JavaScript'te `\b` yalnızca ASCII sözcük
 * karakterlerine göre çalışır, bu yüzden "kötü", "çözüm", "yanlış" gibi Türkçe
 * harfle biten anahtar sözcüklerden sonra hiç eşleşmiyordu — `// Kötü` / `// İyi`
 * çiftleri sessizce tanınmadan geçiyordu. Yerine Unicode harf/rakam olumsuzlaması.
 */
const WORD_END = '(?![\\p{L}\\p{N}])'

const BEFORE_HEADER = new RegExp(
  `^\\s*(?://|#)\\s*(?:❌\\s*)?(\\d\\.\\s*)?(önce|kötü|problem|yanlış|hatalı|naif|eski\\s*yöntem|anti-?pattern|kaçın|test\\s*edilemez|seam\\s*yok)${WORD_END}.*$`,
  'iu',
)
const AFTER_HEADER = new RegExp(
  `^\\s*(?://|#)\\s*(?:✅\\s*)?(\\d\\.\\s*)?(sonra|iyi|çözüm|doğru|yeni\\s*yöntem|kullan|test\\s*edilebilir|seam\\s*açıldı)${WORD_END}.*$`,
  'iu',
)

/**
 * Regex'ten önce Türkçe büyük harf tuzaklarını giderir.
 *
 * JavaScript'in `i` bayrağı Unicode katlaması yapar: `İ` (U+0130) ASCII `i`'ye
 * katlanmaz, `I` da `ı`'ya. Bu yüzden `// İyi` başlığı hiç eşleşmiyordu.
 */
function normalizeTr(line: string): string {
  return line.replace(/İ/g, 'i').replace(/I/g, 'ı')
}

/** Yorumun görünen metnini çıkar (başlık etiketi olarak kullanılır). */
function headerLabel(line: string): string {
  return line
    .replace(/^\s*(?:\/\/|#)\s*/, '')
    .replace(/[—–-]\s*$/, '')
    .trim()
}

/**
 * Bir kod bloğu "önce/sonra" karşılaştırması içeriyorsa iki parçaya böler.
 * İçermiyorsa null döner ve blok normal şekilde gösterilir.
 */
export function splitComparison(code: string): [Segment, Segment] | null {
  const lines = code.split('\n')

  let beforeAt = -1
  let afterAt = -1
  let beforeCount = 0
  let afterCount = 0

  lines.forEach((line, index) => {
    if (BEFORE_HEADER.test(normalizeTr(line))) {
      beforeCount++
      if (beforeAt === -1) beforeAt = index
    } else if (AFTER_HEADER.test(normalizeTr(line))) {
      afterCount++
      if (afterAt === -1) afterAt = index
    }
  })

  // Tam olarak birer tane olmalı ve "önce" daha yukarıda durmalı.
  if (beforeCount !== 1 || afterCount !== 1) return null
  if (beforeAt === -1 || afterAt === -1 || afterAt <= beforeAt) return null

  const beforeBody = lines.slice(beforeAt + 1, afterAt)
  const afterBody = lines.slice(afterAt + 1)

  // Çok kısa parçalar anlamlı bir karşılaştırma üretmez.
  const meaningful = (body: string[]) => body.filter((line) => line.trim() !== '').length >= 2
  if (!meaningful(beforeBody) || !meaningful(afterBody)) return null

  return [
    {
      label: headerLabel(lines[beforeAt]),
      kind: 'before',
      code: trimBlank(beforeBody).join('\n'),
    },
    {
      label: headerLabel(lines[afterAt]),
      kind: 'after',
      code: trimBlank(afterBody).join('\n'),
    },
  ]
}

function trimBlank(lines: string[]): string[] {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === '') start++
  while (end > start && lines[end - 1].trim() === '') end--
  return lines.slice(start, end)
}

export type LineMark = 'bad' | 'good'

/**
 * Satır sonundaki ❌ / ✅ işaretlerini toplar.
 * Anahtar: 1'den başlayan satır numarası (shiki ile aynı sayım).
 */
export function markLines(code: string): Map<number, LineMark> {
  const marks = new Map<number, LineMark>()

  code.split('\n').forEach((line, index) => {
    const hasBad = line.includes('❌')
    const hasGood = line.includes('✅')
    if (hasBad === hasGood) return // ikisi de yoksa veya ikisi de varsa karar verme
    marks.set(index + 1, hasBad ? 'bad' : 'good')
  })

  return marks
}

export type OutputLine = { source: string; value: string }

/**
 * `System.out.println(...)` satırlarının sonundaki yorumlardan beklenen
 * çıktıyı toplar.
 *
 * Bu bir çalıştırma değil, dokümanın kendi iddiasının derlenmesidir: örnekler
 * zaten "// true", "// 5" gibi sonucu yazıyor. Yalnızca yazdırma satırlarındaki
 * yorumlar alınır; açıklama amaçlı yorumlar ("// stack'te tutulur") dışarıda
 * kalsın diye başka satırlara bakılmaz.
 *
 * En az iki satır bulunmazsa null döner — tek satırlık bir çıktı paneli
 * göstermeye değmez.
 */
export function extractOutput(code: string): OutputLine[] | null {
  const lines: OutputLine[] = []

  for (const line of code.split('\n')) {
    const match = /^\s*System\.(?:out|err)\.print(?:ln|f)?\s*\(.*?\)\s*;\s*\/\/\s*(.+?)\s*$/.exec(
      line,
    )
    if (!match) continue

    /*
     * Yorumun ilk parçası sonuç, gerisi açıklamadır:
     *   "true  ✅ (cache'den aynı nesne)"  →  "true"
     *   "false ❌ (yeni nesne yaratılır)"  →  "false"
     * Kesme noktası: çift boşluk, ✅/❌ işareti, açılan parantez veya tire.
     */
    const value = match[1]
      .split(/\s{2,}|\s[✅❌]|\s\(|\s[—–-]\s/u)[0]
      .replace(/[✅❌]/gu, '')
      .trim()
    if (value === '') continue

    lines.push({ source: line.trim(), value })
  }

  return lines.length >= 2 ? lines : null
}
