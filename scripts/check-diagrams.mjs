/**
 * Tarayıcıda GERÇEK render doğrulaması.
 *
 * check-mermaid.mjs sözdizimini doğrular (build'e bağlı, sunucu istemez).
 * Bu script bir adım öteye gider: uygulamayı açar, mermaid içeren her dosyayı
 * gezer ve her diyagramın <svg> ürettiğini doğrular.
 *
 * Sunucu gerektirdiği için build'e BAĞLI DEĞİLDİR:
 *   npm run preview &   (veya npm run dev)
 *   npm run check:render
 */
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5174/'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const consoleErrors = []
page.on('pageerror', (err) => consoleErrors.push(String(err)))
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('.markdown h1')

// Sidebar'daki tüm dosyaları gez
const titles = await page.locator('aside nav button').allInnerTexts()

let totalDiagrams = 0
const failures = []

for (const title of titles) {
  await page.getByRole('button', { name: title, exact: true }).first().click()
  await page.waitForTimeout(150)

  const expected = await page.locator('.mermaid, .mermaid-error').count()
  if (expected === 0) continue

  try {
    await page.waitForFunction(
      (count) => document.querySelectorAll('.mermaid__canvas svg').length === count,
      expected,
      { timeout: 15_000 },
    )
  } catch {
    const rendered = await page.locator('.mermaid__canvas svg').count()
    failures.push(`${title}: ${expected} diyagramdan ${rendered} tanesi render edildi`)
    continue
  }

  const broken = await page.locator('.mermaid-error').count()
  if (broken > 0) failures.push(`${title}: ${broken} diyagram hata kutusuna düştü`)

  totalDiagrams += expected
}

await browser.close()

console.log(`render: ${totalDiagrams} diyagram ${titles.length} dosyada doğrulandı`)

if (failures.length > 0) {
  console.error('\n✗ render sorunları:')
  for (const failure of failures) console.error('  ' + failure)
  process.exit(1)
}

if (consoleErrors.length > 0) {
  console.error(`\n✗ ${consoleErrors.length} konsol hatası:`)
  for (const error of consoleErrors.slice(0, 10)) console.error('  ' + error)
  process.exit(1)
}

console.log('✓ hepsi render edildi, konsol temiz')
