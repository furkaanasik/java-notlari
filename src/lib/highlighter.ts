import type { Highlighter } from 'shiki'

/**
 * Kod blokları her iki temada da koyu yüzeyde durduğu için tek bir koyu
 * shiki teması kullanılır — tema değişiminde yeniden vurgulama gerekmez.
 */
export const CODE_THEME = 'github-dark-default'

/** Dokümantasyonda geçen diller. Bilinmeyen dil düz metne düşer. */
const LANGS = ['java', 'json', 'sql', 'bash', 'xml', 'properties', 'yaml', 'diff']

let instance: Promise<Highlighter> | null = null

/**
 * shiki dinamik olarak yüklenir — ~300 kB'lik vurgulama motoru ana pakete
 * girmesin. İlk kod bloğu görününce indirilir, sonra önbellekten gelir.
 */
export function getHighlighter(): Promise<Highlighter> {
  instance ??= import('shiki').then((shiki) =>
    shiki.createHighlighter({ themes: [CODE_THEME], langs: LANGS }),
  )
  return instance
}

/** shiki'nin tanımadığı dilleri (ör. `mermaid`, `text`) elemek için. */
export function isSupported(language: string | null): language is string {
  return language !== null && LANGS.includes(language)
}
