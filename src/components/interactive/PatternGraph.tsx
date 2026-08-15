import { useMemo, useState } from 'react'
import {
  CATEGORY_LABEL,
  EDGE_LABEL,
  patternGraph,
  type Category,
  type EdgeKind,
  type PatternNode,
} from '../../lib/pattern-graph'

const SIZE = 720
const CENTER = SIZE / 2
const RADIUS = SIZE / 2 - 118 // etiketler çemberin dışına sığsın

const CATEGORY_ORDER: Category[] = ['creational', 'structural', 'behavioral']
const KINDS: EdgeKind[] = ['confused', 'together', 'opposite']

type Placed = PatternNode & { x: number; y: number; angle: number }

/** Düğümleri kategoriye göre gruplayarak çember üzerine yerleştir. */
function layout(): Placed[] {
  const ordered = CATEGORY_ORDER.flatMap((category) =>
    patternGraph.nodes.filter((node) => node.category === category),
  )

  return ordered.map((node, index) => {
    // -90°'den başla ki ilk düğüm tepede olsun.
    const angle = (index / ordered.length) * Math.PI * 2 - Math.PI / 2
    return {
      ...node,
      angle,
      x: CENTER + Math.cos(angle) * RADIUS,
      y: CENTER + Math.sin(angle) * RADIUS,
    }
  })
}

export function PatternGraph({ onNavigate }: { onNavigate?: (slug: string) => void }) {
  const nodes = useMemo(layout, [])
  const [selected, setSelected] = useState<string | null>(null)
  const [enabled, setEnabled] = useState<Record<EdgeKind, boolean>>({
    confused: true,
    together: true,
    opposite: true,
  })

  const edges = useMemo(
    () => patternGraph.edges.filter((edge) => enabled[edge.kind]),
    [enabled],
  )

  const positions = useMemo(
    () => new Map(nodes.map((node) => [node.name, node])),
    [nodes],
  )

  /** Seçili düğümün komşuları — vurgulama ve yan panel için. */
  const related = useMemo(() => {
    if (!selected) return []
    return edges
      .filter((edge) => edge.source === selected || edge.target === selected)
      .map((edge) => ({
        other: edge.source === selected ? edge.target : edge.source,
        kind: edge.kind,
        note: edge.note,
      }))
  }, [edges, selected])

  const neighbours = useMemo(
    () => new Set(related.map((relation) => relation.other)),
    [related],
  )

  const selectedNode = selected ? positions.get(selected) : undefined

  return (
    <section className="pgraph" aria-label="Pattern ilişki grafiği">
      <header className="pgraph__bar">
        <div className="pgraph__filters">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={enabled[kind]}
              onClick={() => setEnabled((state) => ({ ...state, [kind]: !state[kind] }))}
              className={`pgraph__filter pgraph__filter--${kind}`}
              data-on={enabled[kind]}
            >
              <span className="pgraph__swatch" aria-hidden="true" />
              {EDGE_LABEL[kind]}
            </button>
          ))}
        </div>
        <p className="pgraph__hint">
          {selected ? 'Boşluğa tıkla: seçimi bırak' : 'Bir pattern seç'}
        </p>
      </header>

      <div className="pgraph__body">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="pgraph__svg"
          role="img"
          aria-label={`${patternGraph.nodes.length} pattern, ${edges.length} ilişki`}
          onClick={() => setSelected(null)}
        >
          <g className="pgraph__edges">
            {edges.map((edge) => {
              const a = positions.get(edge.source)
              const b = positions.get(edge.target)
              if (!a || !b) return null

              const active =
                selected !== null && (edge.source === selected || edge.target === selected)
              const dimmed = selected !== null && !active

              // Merkeze doğru bükülmüş yay — düz çizgiler birbirine karışıyordu.
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              const cx = mx + (CENTER - mx) * 0.45
              const cy = my + (CENTER - my) * 0.45

              return (
                <path
                  key={`${edge.source}-${edge.target}`}
                  d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                  className={`pgraph__edge pgraph__edge--${edge.kind}`}
                  data-active={active}
                  data-dimmed={dimmed}
                />
              )
            })}
          </g>

          <g className="pgraph__nodes">
            {nodes.map((node) => {
              const isSelected = node.name === selected
              const isNeighbour = neighbours.has(node.name)
              const dimmed = selected !== null && !isSelected && !isNeighbour

              // Etiketi çemberin dışına, açının yönüne göre hizala.
              const flip = Math.cos(node.angle) < 0
              const labelX = CENTER + Math.cos(node.angle) * (RADIUS + 16)
              const labelY = CENTER + Math.sin(node.angle) * (RADIUS + 16)

              return (
                <g
                  key={node.name}
                  className="pgraph__node"
                  data-selected={isSelected}
                  data-dimmed={dimmed}
                  data-planned={node.slug === null}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected(isSelected ? null : node.name)
                  }}
                >
                  {/* Görünmez, geniş tıklama alanı — 6px'lik nokta hedef olarak çok küçük */}
                  <circle cx={node.x} cy={node.y} r={20} className="pgraph__hit" />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 9 : 6}
                    className={`pgraph__dot pgraph__dot--${node.category}`}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    dy="0.35em"
                    textAnchor={flip ? 'end' : 'start'}
                    className="pgraph__label"
                  >
                    {node.name}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        <aside className="pgraph__panel">
          {selectedNode ? (
            <>
              <p className={`pgraph__panel-cat pgraph__panel-cat--${selectedNode.category}`}>
                {CATEGORY_LABEL[selectedNode.category]}
              </p>
              <h3 className="pgraph__panel-title">{selectedNode.name}</h3>

              {selectedNode.slug ? (
                <button
                  type="button"
                  className="pgraph__open"
                  onClick={() => onNavigate?.(selectedNode.slug as string)}
                >
                  Dosyayı aç →
                </button>
              ) : (
                <p className="pgraph__planned">Bu pattern henüz yazılmadı (planlanan)</p>
              )}

              <ul className="pgraph__relations">
                {related.map((relation) => (
                  <li key={relation.other + relation.kind}>
                    <p className="pgraph__relation-head">
                      <span
                        className={`pgraph__swatch pgraph__swatch--${relation.kind}`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        className="pgraph__relation-name"
                        onClick={() => setSelected(relation.other)}
                      >
                        {relation.other}
                      </button>
                      <span className="pgraph__relation-kind">{EDGE_LABEL[relation.kind]}</span>
                    </p>
                    <p className="pgraph__relation-note">{relation.note}</p>
                  </li>
                ))}
                {related.length === 0 && (
                  <li className="pgraph__relation-note">
                    Seçili filtrelerde bu pattern'in ilişkisi yok.
                  </li>
                )}
              </ul>
            </>
          ) : (
            <div className="pgraph__empty">
              <p>
                <strong>{patternGraph.nodes.length}</strong> pattern,{' '}
                <strong>{patternGraph.edges.length}</strong> ilişki.
              </p>
              <p>
                İlişkiler pattern dosyalarındaki “İlgili ve karıştırılan pattern'ler”
                tablolarından çıkarıldı. İçi dolu düğümlerin dosyası var; soluk olanlar
                henüz yazılmadı.
              </p>
              <ul className="pgraph__legend">
                {CATEGORY_ORDER.map((category) => (
                  <li key={category}>
                    <span
                      className={`pgraph__swatch pgraph__dot--${category}`}
                      aria-hidden="true"
                    />
                    {CATEGORY_LABEL[category]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
