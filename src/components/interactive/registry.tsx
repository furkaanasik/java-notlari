import type { ComponentType } from 'react'
import { PatternGraph } from './PatternGraph'
import { SmellMap } from './SmellMap'

/**
 * Markdown içinden çağrılabilen interaktif bileşenler.
 *
 * Kullanım (md dosyasında):
 *   :::component{name="PatternGraph"}
 *   :::
 *
 * ya da GitHub'da görünmeyen biçim:
 *   <!-- component:PatternGraph -->
 *
 * Yeni bileşen eklemek: dosyayı bu klasöre koy, aşağıya bir satır ekle.
 */
export type InteractiveProps = {
  onNavigate?: (slug: string) => void
}

export const INTERACTIVE: Record<string, ComponentType<InteractiveProps>> = {
  PatternGraph,
  SmellMap,
}
