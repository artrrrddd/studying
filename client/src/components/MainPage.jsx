import s from './mainpage.module.css'

import blueNote from '../../public/blueNote.webp'
import pinkNote from '../../public/pinkNote.webp'
import yellowNote from '../../public/yellowNote.webp'
import greenNote from '../../public/greenNote.webp'

import purpleNote from '../../public/purpleNote.webp'
import beigeNote from '../../public/beigeNote.webp'
import titleNote from '../../public/titleNote.webp'
import whiteNote from '../../public/whiteNote.webp'

import uk from '../../public/uk.webp'
import chinese from '../../public/chinese.webp'
import geography from '../../public/geography.webp'
import biology from '../../public/biology.webp'
import history from '../../public/history.webp'
import socialScience from '../../public/socialScience.webp'
import empty from '../../public/empty.webp'


const lessonMouseDown = (lesson) => {
  alert(`нажатие на ${lesson}`)
}


const MainPage = () => {
  return (
    <>
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

        <div
        onClick={() => lessonMouseDown('chinese')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${chinese})`,
        }}>
            <div className={s.cardInner}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>

          <div
        onClick={() => lessonMouseDown('geography')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${geography})`,
        }}>
            <div className={s.cardInner}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>

          <div
        onClick={() => lessonMouseDown('biology')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${biology})`,
        }}>
            <div className={s.cardInner}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>

          <div
        onClick={() => lessonMouseDown('history')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${history})`,
        }}>
            <div className={s.cardInner}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>

          <div
        onClick={() => lessonMouseDown('socialScience')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${socialScience})`,
        }}>
            <div className={s.cardInner}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>


          <div
        onClick={() => lessonMouseDown('uk')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${uk})`,
        }}>
            <div className={s.cardInnerHistory}>
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>

          <div
        onClick={() => lessonMouseDown('empty')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${empty})`,
        }}>
            <div className={s.cardInner}>
              <div>
              </div>
              <div>
              </div>
            </div>
          </div>
          </div>
          
      </section>
    </>
  )
}

export default MainPage
