import { useState, type ReactNode } from 'react'

type Props = {
  language: string | null
  code: string
  children: ReactNode
}

/** Kod bloğu: dil etiketi + kopyala butonu + yatay kaydırmalı gövde. */
export function CodeBlock({ language, code, children }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Pano izni yoksa sessizce geç — kullanıcı yine de metni seçebilir.
    }
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{language ?? 'kod'}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Kopyalandı' : 'Kodu kopyala'}
          className="rounded px-2 py-1 text-[0.6875rem] font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100"
        >
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      {children}
    </div>
  )
}
