import { createHighlighter, type Highlighter } from 'shiki'

/**
 * Kod blokları her iki temada da koyu yüzeyde durduğu için tek bir koyu
 * shiki teması kullanılır — tema değişiminde yeniden vurgulama gerekmez.
 */
export const CODE_THEME = 'github-dark-default'

/** Dokümantasyonda geçen diller. Bilinmeyen dil düz metne düşer. */
const LANGS = ['java', 'json', 'sql', 'bash', 'xml', 'properties', 'yaml', 'diff']

let instance: Promise<Highlighter> | null = null

export function getHighlighter(): Promise<Highlighter> {
  instance ??= createHighlighter({ themes: [CODE_THEME], langs: LANGS })
  return instance
}

/** shiki'nin tanımadığı dilleri (ör. `mermaid`, `text`) elemek için. */
export function isSupported(language: string | null): language is string {
  return language !== null && LANGS.includes(language)
}
