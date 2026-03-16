import LiquidGlassPane from './LiquidGlassPane'
import s from './mainpage.module.css'

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
      <div className={s.backdropLayer} aria-hidden="true">
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
      </section>
    </main>
  )
}

export default MainPage
