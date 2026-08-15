import { lazy, type ComponentType } from 'react'

/*
 * Bileşenler tembel yüklenir: yalnızca onları içeren doküman açıldığında
 * indirilir, ana paket şişmez.
 */
const PatternGraph = lazy(() =>
  import('./PatternGraph').then((mod) => ({ default: mod.PatternGraph })),
)
const SmellMap = lazy(() => import('./SmellMap').then((mod) => ({ default: mod.SmellMap })))
const HashMapBuckets = lazy(() =>
  import('./HashMapBuckets').then((mod) => ({ default: mod.HashMapBuckets })),
)
const DecoratorChain = lazy(() =>
  import('./DecoratorChain').then((mod) => ({ default: mod.DecoratorChain })),
)
const InterviewNotes = lazy(() =>
  import('./InterviewNotes').then((mod) => ({ default: mod.InterviewNotes })),
)
const Home = lazy(() => import('./Home').then((mod) => ({ default: mod.Home })))

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
  /** İkinci argüman: gidilecek başlık kimliği. */
  onNavigate?: (slug: string, anchor?: string) => void
}

export const INTERACTIVE: Record<string, ComponentType<InteractiveProps>> = {
  PatternGraph,
  SmellMap,
  HashMapBuckets,
  DecoratorChain,
  InterviewNotes,
  Home,
}
