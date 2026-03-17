import LiquidGlassPane from './LiquidGlassPane'
import s from './mainpage.module.css'
import { GlassContainer } from './GlassContainer'
import { LiquidGlass } from './LiquidGlass'

const bgGradient =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <radialGradient id="g1" cx="20%" cy="20%" r="60%">
          <stop offset="0%" stop-color="#8cc5ff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#8cc5ff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g2" cx="85%" cy="25%" r="45%">
          <stop offset="0%" stop-color="#ffba57" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ffba57" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g3" cx="50%" cy="85%" r="50%">
          <stop offset="0%" stop-color="#52e8b5" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#52e8b5" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#08111f" />
          <stop offset="45%" stop-color="#10243f" />
          <stop offset="100%" stop-color="#173763" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#base)" />
      <rect width="1600" height="900" fill="url(#g1)" />
      <rect width="1600" height="900" fill="url(#g2)" />
      <rect width="1600" height="900" fill="url(#g3)" />
    </svg>
  `)

const heroGlassOptions = {
  refraction: 0.028,
  bevelDepth: 0.11,
  bevelWidth: 0.17,
  frost: 1.2,
  shadow: false,
  specular: true,
  reveal: 'none',
  tilt: true,
  tiltFactor: 5,
  magnify: 1.03,
}

const MainPage = () => {
  return (
    <main className={s.page}>
      {/* <div className={s.backdropLayer} aria-hidden="true">
        <div className={`${s.orb} ${s.orbBlue}`} />
        <div className={`${s.orb} ${s.orbAmber}`} />
        <div className={`${s.orb} ${s.orbMint}`} />
        <div className={s.grid} />
      </div>

      <section className={s.stage}>
        <div className={s.copy}>
          <span className={s.kicker}>liquidGL integration</span>
          <h1>Liquid glass panel integrated into the React app</h1>
          <p>
            The panel uses the original liquidGL runtime, bundled html2canvas, and a
            dedicated content layer that should stay readable above the refraction.
          </p>
          <div className={s.badges}>
            <span>WebGL</span>
            <span>html2canvas</span>
            <span>Vite</span>
            <span>React</span>
          </div>
        </div>

        <div className={s.glassSlot}>
          <LiquidGlassPane
            paneId="main-liquid-panel"
            className={s.glassPane}
            surfaceClassName={s.glassSurface}
            contentClassName={s.glassContent}
            options={heroGlassOptions}
          >
            <div className={s.metricRow}>
              <div className={s.metricCard}>
                <span>Refraction</span>
                <strong>0.028</strong>
              </div>
              <div className={s.metricCard}>
                <span>Frost</span>
                <strong>1.2px</strong>
              </div>
              <div className={s.metricCard}>
                <span>Tilt</span>
                <strong>off</strong>
              </div>
            </div>

            <div className={s.panelBody}>
              <div>
                <p className={s.panelEyebrow}>Ready for UI</p>
                <h2>The text layer should remain visible after liquidGL initializes</h2>
              </div>

              <div className={s.checkList}>
                <p>Single initialization guards prevent duplicate lens setup.</p>
                <p>Reveal and extra helper layers are disabled for baseline stability.</p>
                <p>The content is rendered inside the required .content child layer.</p>
              </div>
            </div>
          </LiquidGlassPane>
        </div>
      </section> */}

      <div>

        <GlassContainer 
      imageSrc={bgGradient}
      style={{ width: '100vw', height: '100vh' }}
    >
      
      {/* 2. Place LiquidGlass components anywhere inside */}
      <LiquidGlass
        blurRadiusPx={16}
        edgeMapStart={0.85} // Start mapping at 85% of the border radius
        style={{
          width: 300,
          height: 200,
          borderRadius: 24, // The effect automatically adapts to this
          margin: '100px auto',
          color: 'white'
        }}
      >
        <div style={{ padding: 20 }}>
          <h2>Glass Content</h2>
          <p>This content sits on top of the glass effect.</p>
        </div>
      </LiquidGlass>

    </GlassContainer>

      </div>
    </main>
  )
}

export default MainPage
