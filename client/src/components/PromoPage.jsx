import s from './promopage.module.css'
import Group2 from '../../public/Group2.svg'
import Union1 from '../../public/Union1.svg'
import logo from '../../public/logo.svg'

import kolokol from '../../public/kolokol.svg'
import i from '../../public/i.svg'
import profile from '../../public/profile.svg'

import home from '../../public/home.svg'
import dashboard from '../../public/dashboard.svg'
import calendar from '../../public/calendar.svg'
import homework from '../../public/homework.svg'
import chat from '../../public/chat.svg'
import videocall from '../../public/videocall.svg'
import logout from '../../public/logout.svg'

import plus from  '../../public/plus.svg'





const PromoPage = () => {
  return (
    <main className={s.page}>
      <div className={s.contForHeaderAndMain}>

      <div className={s.header}>
        <img src={logo} alt="" />
        <div></div>
        <div className={s.btnsCont}>
          <button style={{border: 'none', background: 'none', padding: '0'}}>
              <img src={i} alt="" style={{width: '45px'}}/>
          </button>
          <button style={{border: 'none', background: 'none', padding: '0'}}>
              <img src={kolokol} alt="" style={{width: '45px'}}/>
          </button>
          <button style={{border: 'none', background: 'none', padding: '0'}}>
              <img src={profile} alt="" style={{width: '45px'}}/>
          </button>
        </div>
      </div>

      <div className={s.main}>
        <div className={s.contForNavAndSect}>

        <div className={s.navbar}>
  <div className={s.navBtns}>
    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={home} alt="" />
        <span className={s.navText}>home</span>
      </span>
    </button>

    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={dashboard} alt="" />
        <span className={s.navText}>dashboard</span>
      </span>
    </button>

    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={calendar} alt="" />
        <span className={s.navText}>calendar</span>
      </span>
    </button>

    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={homework} alt="" />
        <span className={s.navText}>homework</span>
      </span>
    </button>

    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={chat} alt="" />
        <span className={s.navText}>chat</span>
      </span>
    </button>

    <button className={s.navBtn}>
      <span className={s.navPanel}>
        <img className={s.navIcon} src={videocall} alt="" />
        <span className={s.navText}>video</span>
      </span>
    </button>
  </div>
<div className={s.navBtns}>

  <button className={s.navBtn}>
    <span className={s.navPanel}>
      <img className={s.navIcon} src={logout} alt="" />
      <span className={s.navText}>logout</span>
    </span>
  </button>
</div>
</div>

        <div className={s.section}>

          <div className={s.sectionTop}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
            <div className={s.hText}>Welcome, Mauve Gnoll!</div>
            <div className={s.smallH}>Personal daily routine dashboard</div>
            </div>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <div className={s.plus}><img src={plus} alt="" /></div>
                <div className={s.lessonWidget}></div>
                <div className={s.lessonWidget}></div>
                <div className={s.croppedLessonWidget}></div>
              </div>
            </div>
          </div>
          <div className={s.sectionBot}>
          <div className={s.sectionBotTopRow}>

            <div className={s.leftWidget}>
              <div className={s.leftWidgetOverlay}>
              </div>
            </div>

            <div className={s.betweenWidget}></div>

            <div className={s.rightWidget}>
              <div className={s.rightWidgetOverlay}>
              </div>
            </div>
          </div>

          <div className={s.sectionBotBotRow}>
            <div className={s.botLeftWidget}></div>
            <div className={s.botRightWidget}></div>
          </div>

          </div>

        </div>

        </div>
      </div>

        </div>
    </main>
  )
}

export default PromoPage
