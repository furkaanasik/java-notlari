/**
 * Menü sırası ve kategori tanımları — TEK yönetim noktası.
 *
 * Kural:
 *  - Dosya adı sayı prefix'i taşıyorsa (01-, 02-) sıralama ondan gelir.
 *  - Taşımıyorsa aşağıdaki `MANUAL_ORDER` listesindeki sıra kullanılır.
 *  - Listede hiç geçmeyen dosya SONA eklenir — yani yeni bir .md dosyası
 *    atınca kod değişikliği olmadan menüde çıkar.
 */

/** Prefix'siz dosyalar için okuma sırası (dosya adı, uzantısız). */
export const MANUAL_ORDER: string[] = ['PRINCIPLES', 'TESTING', 'REFACTORING']

/** Klasör adı → menüde görünecek kategori başlığı. */
export const CATEGORY_LABELS: Record<string, string> = {
  '': 'Temeller',
  java: 'Java Dili',
  patterns: 'Design Patterns',
}

/** Kategorilerin menüdeki sırası. Listede olmayan klasör sona eklenir. */
export const CATEGORY_ORDER: string[] = ['java', '', 'patterns']
