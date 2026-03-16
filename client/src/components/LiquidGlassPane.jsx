import { useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'

const LIQUID_GL_SCRIPT_URL = 'https://cdn.jsdelivr.net/gh/naughtyduk/liquidGL/scripts/liquidGL.js'

let liquidGLLoader

const ensureLiquidGL = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('liquidGL can only run in the browser'))
  }

  if (window.liquidGL) {
    window.html2canvas = window.html2canvas || html2canvas
    return Promise.resolve(window.liquidGL)
  }

  window.html2canvas = window.html2canvas || html2canvas

  if (!liquidGLLoader) {
    liquidGLLoader = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-liquid-gl-script="true"]')

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.liquidGL), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Failed to load liquidGL')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.src = LIQUID_GL_SCRIPT_URL
      script.defer = true
      script.dataset.liquidGlScript = 'true'
      script.onload = () => resolve(window.liquidGL)
      script.onerror = () => reject(new Error('Failed to load liquidGL'))
      document.body.appendChild(script)
    })
  }

  return liquidGLLoader
}

function LiquidGlassPane({
  paneId,
  className = '',
  surfaceClassName = '',
  contentClassName = '',
  options = {},
  dynamicSelectors = [],
  children,
}) {
  const paneRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const initLiquid = async () => {
      try {
        await ensureLiquidGL()

        if (cancelled || !paneRef.current || !window.liquidGL) {
          return
        }

        const mergedOptions = {
          target: `#${paneId}`,
          snapshot: 'body',
          resolution: 1.5,
          refraction: 0.02,
          bevelDepth: 0.08,
          bevelWidth: 0.18,
          frost: 1.6,
          shadow: true,
          specular: true,
          reveal: 'fade',
          tilt: true,
          tiltFactor: 4,
          magnify: 1,
          ...options,
        }

        window.requestAnimationFrame(() => {
          if (cancelled || !window.liquidGL) {
            return
          }

          window.liquidGL(mergedOptions)

          dynamicSelectors.forEach((selector) => {
            window.liquidGL.registerDynamic(selector)
          })
        })
      } catch (error) {
        console.error('liquidGL init failed:', error)
      }
    }

    initLiquid()

    return () => {
      cancelled = true
    }
  }, [dynamicSelectors, options, paneId])

  return (
    <section className={className}>
      <div
        id={paneId}
        ref={paneRef}
        className={surfaceClassName}
      >
        <div className={['content', contentClassName].filter(Boolean).join(' ')}>{children}</div>
      </div>
    </section>
  )
}

export default LiquidGlassPane
