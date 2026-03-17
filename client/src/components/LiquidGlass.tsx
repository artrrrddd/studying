import { type ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { GlassContainerContext } from './GlassContainerContext'
import { createLiquidGlassRenderer, type LiquidGlassRenderer } from '../components/gl/liquidGlassRenderer'

export type LiquidGlassProps = {
  blurRadiusPx?: number
  edgeMapStart?: number
  edgeMapMaxPx?: number
  children?: ReactNode
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'children'>

export function LiquidGlass({
  blurRadiusPx = 12,
  edgeMapStart = 0.85,
  edgeMapMaxPx = 0,
  children,
  className,
  style,
  ...divProps
}: LiquidGlassProps) {
  const container = useContext(GlassContainerContext)
  if (!container) {
    throw new Error('LiquidGlass must be used inside <GlassContainer>')
  }

  const { containerRef, containerSize, imageElement, imageVersion } = container

  const capsuleRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<LiquidGlassRenderer | null>(null)

  const dpr = useMemo(() => Math.min(2, window.devicePixelRatio || 1), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createLiquidGlassRenderer(canvas)
    rendererRef.current = renderer

     if (imageElement) {
      renderer.setImage(imageElement)
    }

    return () => {
      renderer.dispose()
      rendererRef.current = null
    }
  }, [imageElement])


  const rafRef = useRef<number | null>(null)

  const renderNow = useCallback(() => {
    const r = rendererRef.current
    const capsuleEl = capsuleRef.current
    const containerEl = containerRef.current
    if (!r || !containerSize || !capsuleEl || !containerEl) return

    const capRect = capsuleEl.getBoundingClientRect()
    const contRect = containerEl.getBoundingClientRect()

    const width = capRect.width
    const height = capRect.height
    if (width <= 0 || height <= 0) return

    const parseRadiusPair = (value: string) => {
      const parts = value.trim().split(/\s+/)
      const rxRaw = parts[0] ?? '0'
      const ryRaw = parts[1] ?? rxRaw

      const toPx = (raw: string, ref: number) => {
        const s = raw.trim()
        if (s.endsWith('%')) {
          const pct = Number.parseFloat(s.slice(0, -1))
          return Number.isFinite(pct) ? (pct / 100) * ref : 0
        }
        const n = Number.parseFloat(s)
        return Number.isFinite(n) ? n : 0
      }

      const rx = toPx(rxRaw, width)
      const ry = toPx(ryRaw, height)
      return Math.min(rx, ry)
    }

    const cs = window.getComputedStyle(capsuleEl)
    const rTL = parseRadiusPair(cs.borderTopLeftRadius)
    const rTR = parseRadiusPair(cs.borderTopRightRadius)
    const rBR = parseRadiusPair(cs.borderBottomRightRadius)
    const rBL = parseRadiusPair(cs.borderBottomLeftRadius)
    const borderRadiusPx = Math.max(0, Math.min(rTL, rTR, rBR, rBL))

    const edgeStart01 = Number.isFinite(edgeMapStart) ? Math.max(0, Math.min(1, edgeMapStart)) : 0
    const edgeMapStartPx = Math.min(borderRadiusPx, edgeStart01 * borderRadiusPx)

    const topLeft = {
      x: capRect.left - contRect.left,
      y: capRect.top - contRect.top,
    }

    r.resize(width, height, dpr)
    r.render({
      dpr,
      containerSizePx: { x: containerSize.width, y: containerSize.height },
      capsuleTopLeftPx: topLeft,
      capsuleSizePx: { x: width, y: height },
      blurRadiusPx,
      edgeMapStartPx,
      edgeMapMaxPx,
      borderRadiusPx,
    })
  }, [blurRadiusPx, containerRef, containerSize, dpr, edgeMapMaxPx, edgeMapStart])

  const requestRender = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      renderNow()
    })
  }, [renderNow])

  // Use useLayoutEffect to update the texture synchronously before the browser paints
  // This ensures the glass effect updates in the same frame as the background image
  useLayoutEffect(() => {
    const r = rendererRef.current
    if (!r || !imageElement) return
    r.setImage(imageElement)
    requestRender()
  }, [imageElement, imageVersion, requestRender])

  useEffect(() => {
    requestRender()
  }, [requestRender, blurRadiusPx, edgeMapStart, edgeMapMaxPx, containerSize?.width, containerSize?.height, imageElement, className, style])

  useEffect(() => {
    const el = capsuleRef.current
    if (!el) return

    const ro = new ResizeObserver(() => requestRender())
    ro.observe(el)
    
    return () => ro.disconnect()
  }, [requestRender])

  useEffect(() => {
    const handleScroll = () => requestRender()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [requestRender])

  return (
    <div
      ref={capsuleRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        userSelect: 'none',
        ...style,
      }}
      {...divProps}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {children ? (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>{children}</div>
      ) : null}
    </div>
  )
}
