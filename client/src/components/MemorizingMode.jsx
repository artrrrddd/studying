import React from "react";
import s from './lesson.module.css'

// remaining setCorrect setHistory setRemaining randomAnswers getBtnColor pickChoice goBack errors again

const MemorizingMode = (props) => {
    return (
        <>
            { props.remaining?.length > 0 ?
                                    <>
                                    <div>Осталось вопросов: {props.remaining?.length}</div>
                                    <div className={s.container}     
                                    onClick={() => {
                    if (!props.correct.choice) return
                    
                    props.setCorrect({})
                    props.setHistory(prev => [...prev, { card: props.remaining?.[0], answers: props.randomAnswers }])
                    props.setRemaining(prev => prev.slice(1))
                }}
                                    >
                                        <div className={s.topSection}>
                                            {props.remaining?.length > 0 ? props.remaining?.[0]?.translate : null}
                                        </div>
                                        <div className={s.botSection}>
                                            <div className={s.leftBtns}>
                                                {props.randomAnswers?.length > 0 && <button
                                                    style={{ border: props.getBtnColor(props.randomAnswers[0]) }}
                                                    key={0}
                                                    onClick={() => props.pickChoice(props.randomAnswers[0], props.remaining?.[0], props.randomAnswers)}
                                                >{'1)'} {props.randomAnswers[0]}</button>}
                                                {props.randomAnswers?.length > 1 && <button
                                                    style={{ border: props.getBtnColor(props.randomAnswers[1]) }}
                                                    key={1}
                                                    onClick={() => props.pickChoice(props.randomAnswers[1], props.remaining?.[0], props.randomAnswers)}
                                                >{'2)'} {props.randomAnswers[1]}</button>}
                                            </div>
                                            <div className={s.rightBtns}>
                                                {props.randomAnswers?.length > 2 && <button
                                                    style={{ border: props.getBtnColor(props.randomAnswers[2]) }}
                                                    key={2}
                                                    onClick={() => props.pickChoice(props.randomAnswers[2], props.remaining?.[0], props.randomAnswers)}
                                                >{'3)'} {props.randomAnswers[2]}</button>}
                                                {props.randomAnswers?.length > 3 && <button
                                                    style={{ border: props.getBtnColor(props.randomAnswers[3]) }}
                                                    key={3}
                                                    onClick={() => props.pickChoice(props.randomAnswers[3], props.remaining?.[0], props.randomAnswers)}
                                                >{'4)'} {props.randomAnswers[3]}</button>}
                                            </div>
                                        </div>
                                    </div>
                                        <div className={s.backBtns}>
                                        <button
                                            onClick={props.goBack}
                                        >Назад</button>
                                        </div>
                                    </> :
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