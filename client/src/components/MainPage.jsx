import s from './mainpage.module.css'

import LessonCard from './LessonCard'

import { Link } from 'react-router-dom'

import Navbar from './Navbar'

import blueNote from '../../public/blueNote.webp'
import pinkNote from '../../public/pinkNote.webp'
import yellowNote from '../../public/yellowNote.webp'
import greenNote from '../../public/greenNote.webp'

import purpleNote from '../../public/purpleNote.webp'
import beigeNote from '../../public/beigeNote.webp'
import titleNote from '../../public/titleNote.webp'
import whiteNote from '../../public/whiteNote.webp'
import listik from '../../public/listik.webp'


const MainPage = () => {

  return (
    <>
    <div className={s.mainGrid}>
      <Navbar />
    <div className={s.mainWrapper}>
      <section className={s.main}>
        <div className={s.mainTopSection}>
          
        </div>

        <div className={s.mainBotSection}>
          <div className={s.mainBotSectionPart}>
          </div>
          <div className={s.line}>
          </div>
          <div className={s.mainBotSectionBotPart}>
            <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: '600', fontSize: 'large'}}>Недавние уроки:</div>
            <a href='/' style={{fontWeight: '600', fontSize: '14px', textDecoration: 'underline'}}>Смотреть все</a>
            </div>
            <div className={s.wrapForCards}>
          <LessonCard theme='history'/>
          <LessonCard theme='biology'/>
          <LessonCard theme='socialScience'/>
          <LessonCard theme='chinese'/>
          <LessonCard theme='uk'/>
          <LessonCard theme='geography'/>
          <Link to='/create'>
              <LessonCard theme='empty'/>    
          </Link>
        </div>
          </div>
        </div>
        {/* <div className={s.rowWrapper}>
        <div className={s.notesRow}>
        <div
        className={s.note}
        style={{
          backgroundImage: `url(${  greenNote})`,
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
        </div> */}
      </section>
      <section>
        {/* <div className={s.wrapForCards}>
          <LessonCard theme='history'/>
          <LessonCard theme='biology'/>
          <LessonCard theme='socialScience'/>
          <LessonCard theme='chinese'/>
          <LessonCard theme='uk'/>
          <LessonCard theme='geography'/>
          <Link to='/create'>
              <LessonCard theme='empty'/>    
          </Link>
        </div> */}
      </section>
          </div>
      <section className={s.rightSection}>
        <div className={s.rightTopSection}>
      <div
        className={s.listik}
        style={{
          backgroundImage: `url(${listik})`,
        }}>
          <div className={s.innerListik}>
            <h1>Вопрос</h1>
            <div style={{fontWeight: '600'}}>Какой органоид отвечает за выработку энергии че то там фиг знает какой</div>
          </div>
      </div>
        </div>
        <div className={s.rightBotSection}>
        </div>
      </section>
          </div>
    </>
  )
}

export default MainPage