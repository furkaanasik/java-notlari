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
const BEFORE_HEADER =
  /^\s*(?:\/\/|#)\s*(?:❌\s*)?(\d\.\s*)?(önce|kötü|problem|yanlış|hatalı|naif|eski\s*yöntem|anti-?pattern|kaçın|test\s*edilemez|seam\s*yok)\b.*$/i
const AFTER_HEADER =
  /^\s*(?:\/\/|#)\s*(?:✅\s*)?(\d\.\s*)?(sonra|iyi|çözüm|doğru|yeni\s*yöntem|kullan|test\s*edilebilir|seam\s*açıldı)\b.*$/i

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
    if (BEFORE_HEADER.test(line)) {
      beforeCount++
      if (beforeAt === -1) beforeAt = index
    } else if (AFTER_HEADER.test(line)) {
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
