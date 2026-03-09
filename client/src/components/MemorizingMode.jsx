import React, { useRef, useState } from "react";
import s from './lesson.module.css'

// remaining setCorrect setHistory setRemaining randomAnswers getBtnColor pickChoice goBack errors again

const MemorizingMode = (props) => {

    const [isAnswered, setIsAnswered] = useState(false)

    const getBtnColor = (word) => {
        if (!props.correct.correct) return ''
        if(word === props.correct.correct) return '2px dashed green'
        if(word === props.correct.choice) return '2px dashed red'
        return ''
    }

    const next = () => {
    setIsAnswered(false)
    if (!props.correct.choice) return

    const card = props.remaining[0]
    const choice = props.correct.choice

    props.setCorrect({})
    props.setHistory(prev => [...prev, { card, answers: props.randomAnswers }])

    if (choice !== card.word) {
        props.setRemaining(prev => [...prev.slice(1), {...card, attempt: 0}])
    } else if (choice === card.word && card.attempt === 0) {
        props.setRemaining(prev => [...prev.slice(1), {...card, attempt: 1}])
    } else if (choice === card.word && card.attempt === 1) {
        props.setRemaining(prev => prev.slice(1))
    }
}

    const nextAfterTextarea = () => {
            setIsAnswered(false)
            answerTextarea.current.value = ''
            props.setCorrect({})
            props.setHistory(prev => [...prev, { card: props.remaining?.[0], answers: props.randomAnswers }])
            props.setRemaining(prev => prev.slice(1))

            const card = props.remaining[0]
    const choice = props.correct.choice

            if (choice !== card.word && card.attempt === 1) {
        props.setRemaining(prev => [...prev, {...card, attempt: 0}])
    }
    if (choice === card.word && card.attempt === 1) {
        props.setRemaining(prev => prev.filter((e) => e.id !== card.id))
    }
    }

    const answerWithText = (choice, card) => {        
        if (props.correct.choice) return
        setIsAnswered(true)
        
        props.setCorrect({ correct: card.word, choice: choice })
}

    const answerTextarea = useRef(null)

    return (
        <>
            { props.remaining?.length > 0 ?
                                    <>
                                    <div>Осталось вопросов: {props.remaining?.length}</div>

                                    <div className={s.container}
                                    onClick={() => next()}
                                    >
                                        <div className={s.topSection}>
                                            {props.remaining?.length > 0 ? props.remaining?.[0]?.translate : null}
                                        </div>
                                            {props.remaining[0].attempt === 0 &&
                                            <div className={s.botSection}>
                                            <div className={s.leftBtns}>
                                                {props.randomAnswers?.length > 0 && <button
                                                    style={{ border: getBtnColor(props.randomAnswers[0]) }}
                                                    key={0}
                                                    onClick={() => props.pickChoice(props.randomAnswers[0], props.remaining?.[0])}
                                                    >{'1)'} {props.randomAnswers[0]}</button>}
                                                {props.randomAnswers?.length > 1 && <button
                                                    style={{ border: getBtnColor(props.randomAnswers[1]) }}
                                                    key={1}
                                                    onClick={() => props.pickChoice(props.randomAnswers[1], props.remaining?.[0])}
                                                    >{'2)'} {props.randomAnswers[1]}</button>}
                                            </div>
                                            <div className={s.rightBtns}>
                                                {props.randomAnswers?.length > 2 && <button
                                                    style={{ border: getBtnColor(props.randomAnswers[2]) }}
                                                    key={2}
                                                    onClick={() => props.pickChoice(props.randomAnswers[2], props.remaining?.[0])}
                                                    >{'3)'} {props.randomAnswers[2]}</button>}
                                                {props.randomAnswers?.length > 3 && <button
                                                    style={{ border: getBtnColor(props.randomAnswers[3]) }}
                                                    key={3}
                                                    onClick={() => props.pickChoice(props.randomAnswers[3], props.remaining?.[0])}
                                                    >{'4)'} {props.randomAnswers[3]}</button>}
                                            </div>
                                        </div>
                                                }
                                        {props.remaining[0].attempt > 0 &&
                                        <>
                                        
                                        <div className={s.botSection}>
                                            <div className={s.wrapperForTextarea}>
                                            <textarea
                                                className={s.textarea}
                                                name=""
                                                id=""
                                                onClick={(e) => e.stopPropagation()}
                                                ref={answerTextarea}
                                                ></textarea>
                                                {
                                                    !isAnswered ? 
                                                    <button
                                                    onClick={(e) => { e.stopPropagation(); answerWithText(answerTextarea.current.value, props.remaining?.[0])}}
                                                    >Ответить</button>
                                                    : 
                                                    <>
                                                    
                                                    </>
                                                }
                                            </div>
                                        </div>
                                        </>
                                            }
                                    
                                    </div>
                                        <div className={s.backBtns}>
                                        <button
                                            onClick={props.goBack}
                                            >Назад</button>
                                            <button
                                            onClick={nextAfterTextarea}
                                            style={{ visibility: isAnswered ? 'visible' : 'hidden' }}
                                            >Дальше</button>
                                        </div>
                                    </> 
                                    :
                                    <>Урок окончен
                                                        <div>
                                                            {props.errors.length > 0 ? `Ошибок: ${props.errors.length}` : 'Нет ошибок ура'}
                                                        </div>
                                                        <div className={s.endBtnCont}>
                                                            <button onClick={() => props.again()}>Начать сначала</button>
                                                            {
                                                                props.errors.length > 0 ?
                                                                <button onClick={() => props.setRemaining(props.errors)}>Тренировать ошибки</button>
                                                                : null
                                                            }
                                                        </div>
                                                        </>
                                }
        </>
    )
}

export default MemorizingMode