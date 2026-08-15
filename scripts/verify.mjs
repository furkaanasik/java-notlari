/**
 * Yayın öncesi tam doğrulama.
 *
 *   npm run verify
 *
 * Sırayla: üretim derlemesi (mermaid sözdizimi + tip kontrolü dahil) →
 * derlenmiş çıktıyı servis et → gerçek tarayıcıda diyagram render'ı ve
 * konsol temizliği. Herhangi biri başarısızsa süreç 1 ile çıkar.
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const PORT = Number(process.env.VERIFY_PORT ?? 4173)
const BASE = `http://localhost:${PORT}/`

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false, ...options })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} → ${code}`)),
    )
  })
}

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // sunucu henüz ayakta değil
    }
    await sleep(300)
  }
  throw new Error(`Sunucu ${timeoutMs} ms içinde ayağa kalkmadı: ${url}`)
}

let preview

try {
  console.log('\n▸ Derleme\n')
  await run('npm', ['run', 'build'])

  console.log('\n▸ Derlenmiş çıktı servis ediliyor\n')
  preview = spawn('npm', ['run', 'preview', '--', '--port', String(PORT)], {
    stdio: 'ignore',
    detached: true,
  })
  await waitForServer(BASE)

  console.log('▸ Render doğrulaması\n')
  await run('node', ['scripts/check-diagrams.mjs', BASE])

  console.log('\n✓ Tüm doğrulamalar geçti')
} catch (error) {
  console.error(`\n✗ ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
} finally {
  if (preview?.pid) {
    try {
      process.kill(-preview.pid)
    } catch {
      preview.kill()
    }
  }
}
