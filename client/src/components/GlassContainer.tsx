import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { GlassContainerContext, type GlassContainerContextValue } from './GlassContainerContext'

export type GlassContainerProps = PropsWithChildren<
  {
    imageSrc: string
  } & React.ComponentPropsWithoutRef<'div'>
>

export function GlassContainer({ imageSrc, className, style, children, ...divProps }: GlassContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<
    { width: number; height: number } | null
  >(null)
  
  const [displaySrc, setDisplaySrc] = useState(imageSrc)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [imageVersion, setImageVersion] = useState(0)

  // Preload new images before switching
  useEffect(() => {
    let active = true
    const img = new Image()
    img.src = imageSrc
    
    const handleLoad = () => {
      if (!active) return
      setDisplaySrc(imageSrc)
      setImageElement(img)
      setImageVersion((v) => v + 1)
    }

    if (img.complete) {
      handleLoad()
    } else {
      img.onload = handleLoad
    }

    return () => {
      active = false
    }
  }, [imageSrc])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setContainerSize({ width, height })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const value = useMemo<GlassContainerContextValue>(
    () => ({ containerRef, containerSize, imageElement, imageVersion }),
    [containerSize, imageElement, imageVersion],
  )

  return (
    <GlassContainerContext.Provider value={value}>
      <div
        ref={containerRef}
        className={className}
        style={{ position: 'relative', ...style }}
        {...divProps}
      >
        <img
          src={displaySrc}
          alt="container"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        {children}
      </div>
    </GlassContainerContext.Provider>
  )
}