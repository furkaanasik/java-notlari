import { useMemo, useState } from 'react'

/**
 * Decorator zinciri simülasyonu.
 *
 * 09-decorator.md "Sıra önemlidir" diyor ama okuyucu bunu ancak zihninde
 * canlandırabiliyordu. Burada katmanlar açılıp kapatılıyor, sırası
 * değiştiriliyor ve `write()` yolunda verinin ne olduğu adım adım görünüyor.
 *
 * Dönüşümler gerçek sıkıştırma/şifreleme değil; amaç boyut ve okunabilirlik
 * etkisini göstermek — özellikle "şifrelenmiş veri sıkışmaz" gerçeğini.
 */

type LayerId = 'logging' | 'compression' | 'encryption'

type Layer = {
  id: LayerId
  name: string
  enabled: boolean
}

const INITIAL: Layer[] = [
  { id: 'logging', name: 'LoggingDecorator', enabled: true },
  { id: 'encryption', name: 'EncryptionDecorator', enabled: true },
  { id: 'compression', name: 'CompressionDecorator', enabled: true },
]

const SAMPLE = 'aaaaabbbbcccdd hassas veri hassas veri'

type Step = {
  layer: string
  output: string
  bytes: number
  note?: string
}

/** Tekrarlı karakterleri sayıya indirger — sıkışabilirliği görünür kılar. */
function compress(input: string): string {
  return input.replace(/(.)\1{1,}/g, (run, char: string) => `${char}${run.length}`)
}

/** Deterministik "şifreleme": her karakter iki haneli hex olur. */
function encrypt(input: string): string {
  return [...input]
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

export function DecoratorChain() {
  const [layers, setLayers] = useState<Layer[]>(INITIAL)
  const [data] = useState(SAMPLE)

  const active = layers.filter((layer) => layer.enabled)

  /** write() dıştan içe akar: listenin başındaki katman veriyi ilk görür. */
  const steps = useMemo<Step[]>(() => {
    const result: Step[] = [{ layer: 'girdi', output: data, bytes: data.length }]
    let current = data
    let encrypted = false

    for (const layer of active) {
      if (layer.id === 'logging') {
        result.push({
          layer: layer.name,
          output: current,
          bytes: current.length,
          note: 'veriyi değiştirmez, ölçer ve loglar',
        })
        continue
      }

      if (layer.id === 'compression') {
        const before = current.length
        current = encrypted ? current : compress(current)
        result.push({
          layer: layer.name,
          output: current,
          bytes: current.length,
          note: encrypted
            ? 'şifreli veri rastgele görünür, sıkışmaz — kazanç yok'
            : `%${Math.round((1 - current.length / before) * 100)} küçüldü`,
        })
        continue
      }

      current = encrypt(current)
      encrypted = true
      result.push({
        layer: layer.name,
        output: current,
        bytes: current.length,
        note: 'boyut iki katına çıkar',
      })
    }

    result.push({ layer: 'FileDataSource', output: current, bytes: current.length, note: 'diske yazılır' })
    return result
  }, [active, data])

  const finalBytes = steps[steps.length - 1].bytes
  const compressionAfterEncryption =
    active.findIndex((l) => l.id === 'encryption') !== -1 &&
    active.findIndex((l) => l.id === 'compression') >
      active.findIndex((l) => l.id === 'encryption')

  function move(index: number, direction: -1 | 1) {
    setLayers((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const code = useMemo(() => {
    let expression = 'new FileDataSource(path)'
    // En içteki en son sarılır: listeyi tersten dolaş.
    for (const layer of [...active].reverse()) {
      expression = `new ${layer.name}(\n    ${expression.replace(/\n/g, '\n    ')})`
    }
    return `DataSource source =\n  ${expression.replace(/\n/g, '\n  ')};`
  }, [active])

  return (
    <section className="dchain" aria-label="Decorator zinciri simülasyonu">
      <div className="dchain__cols">
        <div className="dchain__layers">
          <h3 className="dchain__title">Katmanlar (dıştan içe)</h3>
          <ul className="dchain__list">
            {layers.map((layer, index) => (
              <li key={layer.id}>
                <div className="dchain__layer" data-off={!layer.enabled}>
                  <label className="dchain__toggle">
                    <input
                      type="checkbox"
                      checked={layer.enabled}
                      onChange={() =>
                        setLayers((current) =>
                          current.map((item) =>
                            item.id === layer.id ? { ...item, enabled: !item.enabled } : item,
                          ),
                        )
                      }
                    />
                    <span>{layer.name}</span>
                  </label>
                  <span className="dchain__move">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`${layer.name} yukarı`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === layers.length - 1}
                      aria-label={`${layer.name} aşağı`}
                    >
                      ↓
                    </button>
                  </span>
                </div>
              </li>
            ))}
            <li>
              <div className="dchain__layer dchain__layer--base">FileDataSource</div>
            </li>
          </ul>

          <pre className="dchain__code">
            <code>{code}</code>
          </pre>
        </div>

        <div className="dchain__flow">
          <h3 className="dchain__title">write("…") yolu</h3>
          <ol className="dchain__steps">
            {steps.map((step, index) => (
              <li key={`${step.layer}-${index}`}>
                <p className="dchain__step-head">
                  <span className="dchain__step-name">{step.layer}</span>
                  <span className="dchain__step-bytes">{step.bytes} bayt</span>
                </p>
                <code className="dchain__step-out">
                  {step.output.length > 74 ? `${step.output.slice(0, 74)}…` : step.output}
                </code>
                {step.note && <p className="dchain__step-note">{step.note}</p>}
              </li>
            ))}
          </ol>

          <p className="dchain__verdict" data-warn={compressionAfterEncryption}>
            {compressionAfterEncryption
              ? `Sıkıştırma şifrelemeden SONRA: ${finalBytes} bayt. Şifreli veri sıkışmadığı için kazanç yok — sıralamayı ters çevir.`
              : `Sonuç: ${finalBytes} bayt.`}
          </p>
        </div>
      </div>
    </section>
  )
}
