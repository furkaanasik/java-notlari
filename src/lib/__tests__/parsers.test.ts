import { describe, expect, it } from 'vitest'
import { extractOutput, markLines, splitComparison } from '../code-analysis'
import { fold, search, sections } from '../search'
import { patternGraph } from '../pattern-graph'
import { smellMap } from '../smell-map'
import { docs, extractHeadings, getDoc, stripManualToc } from '../../content/docs'
import { expandComponentMarkers } from '../../components/Markdown'

/**
 * Bu testler iki işi birden yapar:
 *   1. Ayrıştırma mantığını doğrular (saf fonksiyonlar)
 *   2. Gerçek içeriğe karşı çalıştığı için içerik bozulmasını da yakalar —
 *      bir md düzenlemesi PatternGraph'ı boşaltırsa burada kırmızı olur.
 */

describe('splitComparison', () => {
  it('Önce/Sonra bloğunu iki parçaya ayırır', () => {
    const result = splitComparison(
      ['// Önce', 'int a = 1;', 'int b = 2;', '', '// Sonra', 'var a = 1;', 'var b = 2;'].join('\n'),
    )

    expect(result).not.toBeNull()
    expect(result?.[0].kind).toBe('before')
    expect(result?.[0].code).toBe('int a = 1;\nint b = 2;')
    expect(result?.[1].kind).toBe('after')
    expect(result?.[1].code).toBe('var a = 1;\nvar b = 2;')
  })

  it('Kötü/İyi ve Yanlış/Doğru çiftlerini de tanır', () => {
    for (const [before, after] of [
      ['// Kötü', '// İyi'],
      ['// Yanlış', '// Doğru'],
      ['// Problem', '// Çözüm'],
    ]) {
      const code = [before, 'a();', 'b();', after, 'c();', 'd();'].join('\n')
      expect(splitComparison(code), `${before}/${after}`).not.toBeNull()
    }
  })

  it('başlık tek taraflıysa bölmez', () => {
    expect(splitComparison('// Önce\na();\nb();')).toBeNull()
  })

  it('"sonra" başlığı "önce"den önce gelirse bölmez', () => {
    expect(splitComparison('// Sonra\na();\nb();\n// Önce\nc();\nd();')).toBeNull()
  })

  it('iki taraftan biri çok kısaysa bölmez', () => {
    expect(splitComparison('// Önce\na();\n// Sonra\nb();\nc();')).toBeNull()
  })

  it('aynı türden iki başlık varsa bölmez (belirsiz)', () => {
    const code = ['// Önce', 'a();', 'b();', '// Önce', 'c();', '// Sonra', 'd();', 'e();'].join('\n')
    expect(splitComparison(code)).toBeNull()
  })
})

describe('markLines', () => {
  it('❌ ve ✅ satırlarını işaretler', () => {
    const marks = markLines(['int a;', 'int b; // ❌ olmaz', 'int c; // ✅ olur'].join('\n'))

    expect(marks.get(1)).toBeUndefined()
    expect(marks.get(2)).toBe('bad')
    expect(marks.get(3)).toBe('good')
  })

  it('aynı satırda ikisi de varsa karar vermez', () => {
    expect(markLines('x(); // ❌ mi ✅ mi').size).toBe(0)
  })
})

describe('extractOutput', () => {
  it('yazdırma satırlarının yorumundan çıktıyı toplar', () => {
    const output = extractOutput(
      [
        'Integer a = 127, b = 127;',
        'System.out.println(a == b);  // true  ✅ (cache)',
        'System.out.println(a + b);   // 254',
      ].join('\n'),
    )

    expect(output?.map((line) => line.value)).toEqual(['true', '254'])
  })

  it('emoji ve parantezli açıklamayı çıktıdan ayıklar', () => {
    const output = extractOutput(
      [
        'System.out.println(a == b);  // true  ✅ (cache\'den aynı nesne)',
        'System.out.println(c == d);  // false ❌ (yeni nesne yaratılır)',
        'System.out.println(x);       // 42 — açıklama',
      ].join('\n'),
    )

    expect(output?.map((line) => line.value)).toEqual(['true', 'false', '42'])
  })

  it('açıklama yorumlarını çıktı sanmaz', () => {
    const output = extractOutput(
      ['int a = 1;    // stack’te tutulur', 'int b = 2;    // yine stack'].join('\n'),
    )
    expect(output).toBeNull()
  })

  it('tek satırlık çıktı için panel açmaz', () => {
    expect(extractOutput('System.out.println(x); // 5')).toBeNull()
  })
})

describe('fold — Türkçe karakter katlama', () => {
  it('Türkçe harfleri ASCII karşılığına indirger', () => {
    expect(fold('Sözleşme')).toBe('sozlesme')
    expect(fold('KALITIM')).toBe('kalitim')
    expect(fold('İçindekiler')).toBe('icindekiler')
    expect(fold('ĞÜŞÖÇ')).toBe('gusoc')
  })
})

describe('stripManualToc', () => {
  it('elle yazılmış içindekiler bloğunu çıkarır', () => {
    const source = ['# Başlık', '', '---', '', '## İçindekiler', '', '1. [A](#a)', '', '---', '', '# A', 'gövde'].join('\n')
    const result = stripManualToc(source)

    expect(result).not.toContain('İçindekiler')
    expect(result).toContain('gövde')
    expect(result).toContain('# Başlık')
  })

  it('içindekiler yoksa kaynağı değiştirmez', () => {
    const source = '# Başlık\n\ngövde'
    expect(stripManualToc(source)).toBe(source)
  })
})

describe('extractHeadings', () => {
  it('h1-h3 toplar, kod bloğundaki # satırlarını saymaz', () => {
    const headings = extractHeadings(
      ['# Bir', '```java', '# bu bir yorum', '```', '## İki', '### Üç', '#### Dört'].join('\n'),
    )

    expect(headings.map((h) => h.text)).toEqual(['Bir', 'İki', 'Üç'])
    expect(headings[0].id).toBe('bir')
  })
})

describe('expandComponentMarkers', () => {
  it('HTML yorumu biçimini tanır', () => {
    expect(expandComponentMarkers('<!-- component:PatternGraph -->')).toContain('PatternGraph')
  })

  it('yönerge biçimini de tanır', () => {
    const result = expandComponentMarkers(':::component{name="SmellMap"}\n:::\n')
    expect(result).toContain('SmellMap')
  })

  it('sıradan metni bozmaz', () => {
    // remark-directive bu ifadeyi yönerge sanıp gövdeyi bozuyordu.
    const prose = 'thread’lerine 1:1 bağlıdır ve Not: şudur'
    expect(expandComponentMarkers(prose)).toBe(prose)
  })
})

// ---------------------------------------------------------------------------
// Gerçek içeriğe karşı doğrulamalar
// ---------------------------------------------------------------------------

describe('içerik yüklemesi', () => {
  it('bütün dosyalar yüklenir ve başlıkları vardır', () => {
    expect(docs.length).toBeGreaterThanOrEqual(25)
    for (const doc of docs) {
      expect(doc.title, doc.slug).not.toBe('')
      expect(doc.source.length, doc.slug).toBeGreaterThan(100)
    }
  })

  it('Java notları sayı ön ekine göre sıralanır', () => {
    const java = docs.filter((doc) => doc.category === 'java').map((doc) => doc.fileName)
    expect(java[0]).toBe('01-temeller')
    expect(java.at(-1)).toBe('13-java21')
    // Sıra numaraları boşluksuz ve artan olmalı
    const numbers = java.map((name) => Number(name.slice(0, 2)))
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b))
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('slug ile erişilebilir', () => {
    expect(getDoc('patterns/09-decorator')?.title).toBe('Decorator')
  })
})

describe('pattern grafiği', () => {
  it('23 GoF pattern düğümü üretir', () => {
    expect(patternGraph.nodes).toHaveLength(23)
  })

  it('23 pattern\'in de dosyası var', () => {
    const missing = patternGraph.nodes.filter((node) => node.slug === null)
    expect(missing.map((node) => node.name)).toEqual([])
  })

  it('ilişkiler tablolardan çıkarılır', () => {
    expect(patternGraph.edges.length).toBeGreaterThanOrEqual(50)

    const decoratorProxy = patternGraph.edges.find(
      (edge) =>
        (edge.source === 'Decorator' && edge.target === 'Proxy') ||
        (edge.source === 'Proxy' && edge.target === 'Decorator'),
    )
    expect(decoratorProxy, 'Decorator ↔ Proxy ilişkisi bekleniyor').toBeDefined()
    expect(decoratorProxy?.note.length).toBeGreaterThan(20)
  })

  it('"tam zıttı" ifadesini zıt ilişki olarak sınıflar', () => {
    const opposite = patternGraph.edges.filter((edge) => edge.kind === 'opposite')
    expect(opposite.length).toBeGreaterThan(0)
    expect(
      opposite.some(
        (edge) =>
          [edge.source, edge.target].includes('Flyweight') &&
          [edge.source, edge.target].includes('Prototype'),
      ),
    ).toBe(true)
  })
})

describe('koku haritası', () => {
  it('REFACTORING.md tablosundan 22 koku çıkarır', () => {
    expect(smellMap.entries).toHaveLength(22)
  })

  it('her kokunun en az bir refactoring karşılığı var', () => {
    for (const entry of smellMap.entries) {
      expect(entry.refactorings.length, entry.smell).toBeGreaterThan(0)
    }
  })

  it('katalogdan belirti metnini eşleştirir', () => {
    const longMethod = smellMap.entries.find((entry) => entry.smell === 'Long Method')
    expect(longMethod?.symptom).toContain('50+')
    expect(longMethod?.principles).toContain('SRP')
  })
})

describe('anasayfa özeti', () => {
  it('her doküman ya okuma yolunda ya araçlarda görünür', async () => {
    const { stages, extras } = await import('../overview')

    const shown = new Set([
      ...stages().flatMap((stage) => stage.docs.map((doc) => doc.slug)),
      ...extras('00-giris').map((doc) => doc.slug),
    ])
    const missing = docs
      .filter((doc) => doc.fileName !== '00-giris')
      .filter((doc) => !shown.has(doc.slug))
      .map((doc) => doc.slug)

    expect(missing).toEqual([])
  })

  it('sayılar içerikten türetilir', async () => {
    const { stats } = await import('../overview')
    const summary = stats()

    expect(summary.documents).toBe(docs.length)
    expect(summary.patterns).toBe(23)
    expect(summary.diagrams).toBeGreaterThanOrEqual(24)
    expect(summary.codeBlocks).toBeGreaterThan(300)
  })
})

describe('arama', () => {
  it('bölümlere ayırır', () => {
    expect(sections.length).toBeGreaterThan(100)
  })

  it('Türkçe karakter duyarsız arar', () => {
    expect(search('sozlesme').length).toBeGreaterThan(0)
    expect(search('kalitim').length).toBeGreaterThan(0)
  })

  it('sonuç dosya ve başlık taşır', () => {
    const [hit] = search('immutable')
    expect(hit.section.docTitle).not.toBe('')
    expect(hit.snippet.length).toBeGreaterThan(10)
  })

  it('çok kısa sorguda sonuç döndürmez', () => {
    expect(search('a')).toHaveLength(0)
  })
})
