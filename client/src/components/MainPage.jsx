import s from './mainpage.module.css'

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
      <div className={s.main}>
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
    </>
  )
}

export default MainPage
