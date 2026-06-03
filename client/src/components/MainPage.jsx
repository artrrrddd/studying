import s from './mainpage.module.css'

import { Link } from "react-router-dom";


import LessonCard from './lessonCard'

import blueNote from '../../public/blueNote.webp'
import pinkNote from '../../public/pinkNote.webp'
import yellowNote from '../../public/yellowNote.webp'
import greenNote from '../../public/greenNote.webp'

import purpleNote from '../../public/purpleNote.webp'
import beigeNote from '../../public/beigeNote.webp'
import titleNote from '../../public/titleNote.webp'
import whiteNote from '../../public/whiteNote.webp'

const MainPage = () => {
  return (
    <>
    <div className={s.mainGrid}>
      <section className={s.navSection}>
        <div>logo</div>
            <div className={s.line}>
        </div>
        <div className={s.navBtnsWrapper}>
        <Link to='/'>
          <button className={s.navBtn}>Главная</button>
        </Link>
        <Link to='/cards'>
          <button className={s.navBtn}>Карточки</button>
        </Link>
        <Link to='/lessons'>
          <button className={s.navBtn}>Уроки</button>
        </Link>
        </div>
      </section>
    <div className={s.mainWrapper}>
      <section className={s.main}>
        <div className={s.rowWrapper}>
        <div className={s.notesRow}>
        <div
        className={s.note}
        style={{
          backgroundImage: `url(${greenNote})`,
        }}>
          заметка
          </div>

      <div className={s.note}
      style={{
        backgroundImage: `url(${blueNote})`,
      }}>
        заметка
      </div>

        <div
        className={s.note}
        style={{
          backgroundImage: `url(${yellowNote})`,
        }}>
          заметка
        </div>

      <div
      className={s.note}
      style={{
        backgroundImage: `url(${pinkNote})`,
      }}>
        заметка
      </div>
        </div>
        </div>
        <div className={s.line}>
        </div>
      <div className={s.rowWrapper2}>

      <div className={s.notesRow}>
      <div
      className={s.note}
      style={{
        backgroundImage: `url(${purpleNote})`,
      }}>
        заметка
      </div>
      <div
      className={s.note}
      style={{
        backgroundImage: `url(${beigeNote})`,
      }}>
        заметка
      </div>
      <div
      className={s.note}
      style={{
        backgroundImage: `url(${titleNote})`,
      }}>
      </div>
      <div
      className={s.note}
      style={{
        backgroundImage: `url(${whiteNote})`,
      }}>
        заметка
      </div>
        </div>
        </div>
      </section>
      <section>
        <div className={s.wrapForCards}>
          <LessonCard theme='history'/>
          <LessonCard theme='biology'/>
          <LessonCard theme='socialScience'/>
          {/* <LessonCard theme='chinese'/>
          <LessonCard theme='uk'/>
          <LessonCard theme='geography'/> */}
          <LessonCard theme='empty'/>
        </div>
      </section>
          </div>
      <section className={s.rightSection}>
      </section>
          </div>
    </>
  )
}

export default MainPage
