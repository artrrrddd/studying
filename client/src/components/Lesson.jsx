import { useDispatch, useSelector } from "react-redux"
import { fetchLessonByIdThunk } from "../redux/thunks/lessonThunks"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import s from './lesson.module.css'
import Card from "./Card"
import CardsMode from "./CardsMode"
import MemorizingMode from "./MemorizingMode"
import EdittingMode from "./EdittingMode"
import TestMode from "./TestMode"


const Lesson = () => {

    const [edittingMode, setEdittingMode] = useState(false)

    const myId = useSelector(s => s.auth.myId)

    const [burgerIsOpen, setBurgerIsOpen] = useState(false)
    
    useEffect(() => {
    if (!burgerIsOpen) return
    
    const handleClick = () => setBurgerIsOpen(false)
    document.addEventListener('click', handleClick)
    
    return () => document.removeEventListener('click', handleClick)
}, [burgerIsOpen])

    const lesson = useSelector(s => s.lessons.currentLesson)

    const [remaining, setRemaining] = useState(lesson?.cards)

    const [history, setHistory] = useState([])
    
    const { id } = useParams()    
    
    const dispatch = useDispatch()
    
    useEffect(() => {    
        dispatch(fetchLessonByIdThunk(id))
    },[])

    useEffect(() => {
        if (lesson?.cards) {
            setRemaining(lesson.cards.map((e) =>  (
                {
                    ...e,
                    attempt: 0
                }
            )))
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
                
    const [errors, setErrors] = useState([])
    
    const swipe = (answer, currentCard) => {

        setHistory(prev => [...prev, currentCard])

        if (answer === false) {
            setErrors(prev => prev.find(e => e?.id === currentCard?.id) ? prev : [...prev, currentCard])
        } else {
            setErrors(prev => prev.find(e => e?.id === currentCard?.id) ? prev.filter((e) => e.id !== currentCard.id) : prev)
        }
        setRemaining(prev => prev.slice(1))
    }
    
    const goBack = () => {
        
        if(history.length === 0) return

        const lastCard = history[history.length - 1]

        isGoingBack.current = true
        setCorrect({})
        setRandomAnswers(lastCard.answers)
        setRemaining(prev => [lastCard.card, ...prev]);
        setHistory(prev => prev.slice(0, -1))
        setErrors(prev => prev.filter(e => e === lastCard))
    }

    const again = () => {
        setRemaining(lesson?.cards)
        setHistory([])
        setErrors([])
    }

    const answers = lesson?.cards?.map(e => e.word)

    const [randomAnswers, setRandomAnswers] = useState([])

    const isGoingBack = useRef(false)

useEffect(() => {
    if (!answers?.length || !remaining?.length) return
    if (isGoingBack.current) {
        isGoingBack.current = false
        return
    }

    const correctIndex = answers.indexOf(remaining?.[0]?.word)
    const otherIndexes = [...Array(answers.length).keys()]
        .filter(i => i !== correctIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

    const indexes = [...otherIndexes, correctIndex].sort(() => Math.random() - 0.5)
    setRandomAnswers(indexes.map(i => answers[i]))
}, [remaining])

    const [correct, setCorrect] = useState({})

    const pickChoice = (choice, card) => {
    if (correct.choice) return
    setCorrect({ correct: card.word, choice: choice })
}

    const content = () => {

        if (studying.mode === 'cards') {
            return (
                <CardsMode
                remaining={remaining}
                setRemaining={setRemaining}
                again={again}
                goBack={goBack}
                swipe={swipe}
                errors={errors}
                />
            )
        }

        if (studying.mode === 'memorizing') {
            return (
                <MemorizingMode 
                    remaining={remaining}
                    setRemaining={setRemaining}
                    again={again}
                    goBack={goBack}
                    errors={errors}
                    pickChoice={pickChoice}
                    randomAnswers={randomAnswers}
                    setCorrect={setCorrect}
                    correct={correct}
                    setHistory={setHistory}
                    />
            )
        }

        if (studying.mode === 'comparison') {
            return (
                <>
                </>
            )
        }

        if (studying.mode === 'test') {
            return (
                <>
                    <TestMode 
                    remaining={remaining}
                    setRemaining={setRemaining}
                    again={again}
                    goBack={goBack}
                    errors={errors}
                    setErrors={setErrors}
                    pickChoice={pickChoice}
                    randomAnswers={randomAnswers}
                    setCorrect={setCorrect}
                    correct={correct}
                    setHistory={setHistory}
                    />
                </>
            )
        }
    }

    return (
            <>
        {edittingMode && <EdittingMode lesson={lesson}/>}
        {
        studying.bool ? content() :

        !edittingMode &&
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
            {   
                !edittingMode &&
                <div className={s.buttonsCont}>
                {
                    myId === lesson?.userId ?
                    <button
                    onClick={() => setEdittingMode(true)}
                    >Редактировать</button>
                    : null
                }
                <div
                className={s.wrapperForBtns}
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative' }}>
    {burgerIsOpen ? (
        <div className={s.burgerWrap}>
            <button onClick={() => { setStudying({bool: true, mode: 'cards'}); setBurgerIsOpen(false) }}>Карточки</button>
            <button onClick={() => { setStudying({bool: true, mode: 'memorizing'}); setBurgerIsOpen(false) }}>Заучивание</button>
            <button onClick={() => { setStudying({bool: true, mode: 'comparison'}); setBurgerIsOpen(false) }}>Сопоставление</button>
            <button onClick={() => { setStudying({bool: true, mode: 'test'}); setBurgerIsOpen(false) }}>Тест</button>
        </div>
    ) : (
        <button
        className={s.startLessonBtn}
        onClick={() => setBurgerIsOpen(true)}>Начать урок</button>
    )}
</div>
            <button onClick={share}>
            Поделиться
            </button>
            </div>
}
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