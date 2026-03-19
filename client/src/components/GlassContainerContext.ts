import { createContext } from 'react'

export type GlassContainerContextValue = {
  containerRef: React.RefObject<HTMLDivElement | null>
  containerSize: { width: number; height: number } | null
  imageElement: HTMLImageElement | null
  imageVersion: number
  snapshotSource: HTMLCanvasElement | null
  snapshotVersion: number
}

export const GlassContainerContext = createContext<GlassContainerContextValue | null>(null)
