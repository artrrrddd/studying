import { useDispatch, useSelector } from "react-redux"
import { fetchLessonByIdThunk } from "../redux/thunks/lessonThunks"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import s from './lesson.module.css'
import Card from "./Card"

const Lesson = () => {

    const lesson = useSelector(s => s.lessons.currentLesson)

    const [remaining, setRemaining] = useState(lesson?.cards)
    
    const { id } = useParams()

    console.log(id);
    
    
    const dispatch = useDispatch()
    
    useEffect(() => {    
        dispatch(fetchLessonByIdThunk(id))
    },[])

    useEffect(() => {
        if (lesson?.cards) {
            setRemaining(lesson.cards)
        }
    },[lesson])
    

    const [shareSuccess, setShareSuccess] = useState(false)
    const [studying, setStudying] = useState(false)

    const share = () => {

            navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setShareSuccess(true)
                setTimeout(() => {setShareSuccess(false)}, 2000)
            })
        }

        console.log(lesson);
                
        const [errors, setErrors] = useState([])
    
    const swipe = (answer, currentCard) => {
        if (answer === false) {
            setErrors(prev => prev.find(e => e?.id === currentCard?.id) ? prev : [...prev, currentCard])
        } else {
            setErrors(prev => prev.find(e => e?.id === currentCard?.id) ? prev.filter((e) => e.id === currentCard.id) : prev)
        }
        setRemaining(prev => prev.slice(1))
    }
    console.log(errors);
    

    return (
    <>
            {studying ?  <>
                <div className={s.cont}>
                    {remaining?.length > 0 && (
                        <div>
                        <span>Карточек осталось: {remaining?.length}</span>
                            <Card
                                word={remaining?.[0]?.word}
                                translate={remaining?.[0]?.translate}
                            />
                        </div>
                    )}
                    {remaining?.length > 0 ? 
                    <div className={s.answersCont}>
                        <button onClick={() => swipe(false, remaining?.[0])}>
                            не знаю
                        </button>
                        <button onClick={() => swipe(true, remaining?.[0])}>
                            знаю
                        </button>
                    </div>
                    : <>Урок окончен
                    <div>
                        {errors.length > 0 ? `Ошибок: ${errors.length}` : 'Нет ошибок ура'}
                    </div>
                    <div className={s.endBtnCont}>
                        <button onClick={() => setRemaining(lesson?.cards)}>Начать сначала</button>
                        {
                            errors.length > 0 ?
                                <button onClick={() => setRemaining(errors)}>Тренировать ошибки</button>
                            : null
                        }
                    </div>
                    </>}
                </div>
            </> : 
            <div className={s.cont}>
            <span>
            <h1>
            {lesson?.title}
            </h1>
            </span>
            <span>
            <h2>
            {lesson?.description}
            </h2>
            </span>
            <div className={s.succesHandlerCont}>
            {shareSuccess ? <div className={s.successText}>Ссылка на урок скопирована в буфер обмена</div> : null}
            </div>
            <div className={s.buttonsCont}>
            <button onClick={() => setStudying(true)}>
            Начать урок
            </button>
            <button onClick={share}>
            Поделиться
            </button>
            </div>
            <div className={s.previewContainer}>
            {
                lesson?.cards?.map((e, i) => <div key={i} className={s.spanWrapper}>
                            <div>{i + 1}</div>
                        <div className={s.previewWrapper}>
                        <div className={s.coloredBG}>
                        <span>
                            {e.word}
                        </span>
                        </div>
                        <span>Термин</span>
                        </div>
                        <div className={s.previewWrapper}>
                        <div className={s.coloredBG}>
                        <span>
                            {e.translate}
                        </span>
                        </div>
                        <span>Определение</span>
                        </div>
                    </div>)
                    }   
                    </div>
                    <div className={s.cardWrapper}>
                    {lesson?.cards?.map((e) => {
                        return <Card word={e.word} translate={e.translate}></Card>
                    })}
                    </div>
                    </div>
                    }
                        </>
                )
            }
                
        
            
            export default Lesson