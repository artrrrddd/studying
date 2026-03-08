import s from './lesson.module.css'
import Card from './Card'

//remaining swipe goBack errors setRemaining again

const CardsMode = (props) => {
    return (
        <>
            <div className={s.cont}>
                    {props.remaining?.length > 0 && (
                        <div>
                        <span>Карточек осталось: {props.remaining?.length}</span>
                            <Card
                                drag={true}
                                word={props.remaining?.[0]?.word}
                                translate={props.remaining?.[0]?.translate}
                                />
                        </div>
                    )}
                    {props.remaining?.length > 0 ? 
                    <div className={s.btnsWrapper}>
                    <div className={s.answersCont}>
                        <button onClick={() => props.swipe(false, props.remaining?.[0])}>
                            не знаю
                        </button>
                        <button onClick={() => props.swipe(true, props.remaining?.[0])}>
                            знаю
                        </button>
                    </div>
                        <button
                        onClick={() => props.goBack()}
                        className={s.back}>Назад</button>
                    </div>
                    : <>Урок окончен
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
                    </>}
                </div>
        </>
    )
}

export default CardsMode