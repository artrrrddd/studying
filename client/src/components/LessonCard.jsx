import s from './mainpage.module.css'

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

const LessonCard = (props) => {

    switch (props.theme) {
        case 'history':
            return (
                <div
        onClick={() => lessonMouseDown('history')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${history})`,
        }}>
            <div className={s.cardInner}
                style={{top: '49.3%', bottom: '3%', right: '4.5%', left: '4.5%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'biology':
            return (
                <div
        onClick={() => lessonMouseDown('biology')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${biology})`,
        }}>
            <div className={s.cardInner}
                style={{top: '55%', bottom: '-0.4%', right: '4.4%', left: '3.8%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'chinese':
            return (
                <div
        onClick={() => lessonMouseDown('chinese')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${chinese})`,
        }}>
            <div className={s.cardInner}
                style={{top: '54.5%', bottom: '0%', right: '6.9%', left: '1.3%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'uk':
            return (
                <div
        onClick={() => lessonMouseDown('uk')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${uk})`,
        }}>
            <div className={s.cardInner}
                style={{top: '55.2%', bottom: '-0.6%', right: '4.5%', left: '3.5%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'socialScience':
            return (
                <div
        onClick={() => lessonMouseDown('socialScience')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${socialScience})`,
        }}>
            <div className={s.cardInner}
                style={{top: '49.3%', bottom: '2.7%', right: '4.2%', left: '4.5%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'geography':
            return (
                <div
        onClick={() => lessonMouseDown('geography')}
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${geography})`,
        }}>
            <div className={s.cardInner}
                style={{top: '50.1%', bottom: '1.5%', right: '4.2%', left: '3.8%'}}
            >
              <div>
              Заметка
              </div>
              <div>
                19 вопросов
              </div>
            </div>
          </div>
            )

        case 'empty':
            return (
                <div
        className={`${s.card} ${s.plantNote}`}
        style={{
          '--note-image': `url(${empty})`,
        }}>
            <div className={s.cardInner}
                style={{top: '2.2%', bottom: '3.5%', right: '7.5%', left: '3.5%'}}
            >
              <div>
              </div>
              <div>
              </div>
            </div>
          </div>
            )
    
        default:
            return null
    }

}

export default LessonCard