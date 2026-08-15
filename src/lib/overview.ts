import { docs, type Doc } from '../content/docs'
import { patternGraph } from '../lib/pattern-graph'

/**
 * Anasayfa için özet veriler.
 *
 * Hepsi içerikten türetilir — elle güncellenen bir sayı yoktur. Yeni dosya
 * eklendiğinde anasayfa da kendiliğinden doğru olur.
 */

export type Stage = {
  key: string
  title: string
  summary: string
  docs: Doc[]
}

/** Serinin okuma sırası: her adım bir önceki adımın üstüne kurulur. */
export function stages(): Stage[] {
  const byCategory = (category: string) => docs.filter((doc) => doc.category === category)
  const rootNamed = (names: string[]) =>
    names
      .map((name) => docs.find((doc) => doc.fileName === name))
      .filter((doc): doc is Doc => doc !== undefined)

  return [
    {
      key: 'java',
      title: 'Java dili',
      summary: 'Dil ve çalışma zamanı: bellek, koleksiyonlar, akışlar, eşzamanlılık.',
      docs: byCategory('java'),
    },
    {
      key: 'principles',
      title: 'Prensipler',
      summary: '"Bu kod iyi mi kötü mü" sorusunun karar kriterleri.',
      docs: rootNamed(['PRINCIPLES']),
    },
    {
      key: 'testing',
      title: 'Test',
      summary: 'Tasarımın ilk gerçek kullanıcısı; refactoring için güvenlik ağı.',
      docs: rootNamed(['TESTING']),
    },
    {
      key: 'refactoring',
      title: 'Refactoring',
      summary: 'Kokudan çözüme: elindeki koddan hedefe nasıl gidilir.',
      docs: rootNamed(['REFACTORING']),
    },
    {
      key: 'patterns',
      title: 'Design Patterns',
      summary: '23 GoF pattern — prensiplerin isimlendirilmiş uygulamaları.',
      docs: byCategory('patterns'),
    },
  ]
}

/**
 * Okuma yolunda yer almayan dosyalar: sıralı bir adım değil, her an
 * başvurulan araçlar (ör. üretilmiş Mülakat Notları sayfası).
 * Listeyi elle tutmuyoruz — yolda olmayan her şey buraya düşer.
 */
export function extras(homeFile: string): Doc[] {
  const inPath = new Set(stages().flatMap((stage) => stage.docs.map((doc) => doc.slug)))
  return docs.filter((doc) => doc.fileName !== homeFile && !inPath.has(doc.slug))
}

export type Stats = {
  documents: number
  patterns: number
  diagrams: number
  codeBlocks: number
  lines: number
}

function countMatches(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0
}

export function stats(): Stats {
  let diagrams = 0
  let codeBlocks = 0
  let lines = 0

  for (const doc of docs) {
    diagrams += countMatches(doc.source, /^```mermaid\s*$/gm)
    codeBlocks += countMatches(doc.source, /^```[a-z]/gm)
    lines += doc.source.split('\n').length
  }

  return {
    documents: docs.length,
    patterns: patternGraph.nodes.length,
    diagrams,
    codeBlocks: codeBlocks - diagrams,
    lines,
  }
}
