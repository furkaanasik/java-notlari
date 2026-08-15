/**
 * Görsel kontrol için ekran görüntüsü alır.
 *   node scripts/shots.mjs [url] [outDir]
 * Dev sunucusunun ayakta olmasını bekler.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const url = process.argv[2] ?? 'http://localhost:5174/'
const outDir = process.argv[3] ?? 'shots'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('.markdown h1', { timeout: 15_000 })

/** Belirtilen temaya geç (localStorage + reload). */
async function setTheme(theme) {
  await page.evaluate((t) => localStorage.setItem('java-docs:theme', t), theme)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.markdown h1')
}

async function shot(name) {
  await page.screenshot({ path: `${outDir}/${name}.png` })
  console.log(`  ${outDir}/${name}.png`)
}

console.log('ekran görüntüleri:')

await setTheme('dark')
await shot('01-dark-top')

// Kod bloğu + tablo görünsün diye biraz aşağı in
await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 1400))
await page.waitForTimeout(400)
await shot('02-dark-code')

// Pattern dosyası — tablo ve blockquote yoğun
await page.getByRole('button', { name: 'Decorator', exact: true }).click()
await page.waitForTimeout(400)
await shot('03-dark-pattern')

await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 2600))
await page.waitForTimeout(400)
await shot('04-dark-table')

await setTheme('light')
await shot('05-light-top')

await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 1400))
await page.waitForTimeout(400)
await shot('06-light-code')

await browser.close()

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} konsol hatası:`)
  for (const e of errors.slice(0, 10)) console.error('  ' + e)
  process.exit(1)
}
console.log('✓ konsol temiz')
