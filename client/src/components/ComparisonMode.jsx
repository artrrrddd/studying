import React, { useRef, useState } from "react";
import s from './comparison.module.css'

// remaining setCorrect setHistory setRemaining randomAnswers getBtnColor pickChoice goBack errors again

const ComparisonMode = (props) => {

    

    const getBtnColor = (word) => {
        if (!props.correct.correct) return ''
        if(word === props.correct.correct) return '2px dashed green'
        if(word === props.correct.choice) return '2px dashed red'
        return ''
    }

    const pickChoice = (choice, card) => {
    if (props.correct.choice) return

    props.setCorrect({ correct: card.word, choice: choice })
    if (choice !== card.word) {
        props.setErrors(prev => prev.find(e => e.id === card.id) ? prev : [...prev, card])
    } else {
        props.setErrors(prev => prev.find(e => e.id === card.id) ? prev.filter((e) => e.id !== card.id) : prev)
    }
}

    const [dragging, setDragging] = useState(false)

    const [currentPosOfPointer, setCurrentPosOfPointer] = useState({x: 0, y: 0})

    const handlePointerMove = (e) => {
        if (!dragging) return

        setCurrentPosOfPointer({
            x: e.clientX,
            y: e.clientY
        })
    }

    const [draggingIndex, setDraggingIndex] = useState(null)

    const [offset, setOffset] = useState({x: 0, y: 0})

    const handlePointerDown = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
        setDragging(true)
        setDraggingIndex(index)
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const windowRef0 = useRef(null)
    const windowRef1 = useRef(null)
    const windowRef2 = useRef(null)
    const windowRef3 = useRef(null)

    // const SNAP = 60;
    
    // const windowRect0 = windowRef0?.current?.getBoundingClientRect()
    // const windowRect1 = windowRef1?.current?.getBoundingClientRect()
    // const windowRect2 = windowRef2?.current?.getBoundingClientRect()
    // const windowRect3 = windowRef3?.current?.getBoundingClientRect()

    // const snapArea0 = {
    //     left: windowRect0?.left - SNAP,
    //     right: windowRect0?.right + SNAP,
    //     top: windowRect0?.top - SNAP,
    //     bottom: windowRect0?.bottom + SNAP
    // }

    // const snapArea1 = {
    //     left: windowRect1?.left - SNAP,
    //     right: windowRect1?.right + SNAP,
    //     top: windowRect1?.top - SNAP,
    //     bottom: windowRect1?.bottom + SNAP
    // }

    // const snapArea2 = {
    //     left: windowRect2?.left - SNAP,
    //     right: windowRect2?.right + SNAP,
    //     top: windowRect2?.top - SNAP,
    //     bottom: windowRect2?.bottom + SNAP
    // }

    // const snapArea3 = {
    //     left: windowRect3?.left - SNAP,
    //     right: windowRect3?.right + SNAP,
    //     top: windowRect3?.top - SNAP,
    //     bottom: windowRect3?.bottom + SNAP
    // }
    

    const handlePointerUp = (e) => {
    setDragging(false)

    setDraggingIndex(null)

    const SNAP = 60

    const rects = [windowRef0, windowRef1, windowRef2, windowRef3]
        .map(ref => ref.current?.getBoundingClientRect())
        .filter(Boolean)

    const snapAreas = rects.map(rect => ({
        left: rect.left - SNAP,
        right: rect.right + SNAP,
        top: rect.top - SNAP,
        bottom: rect.bottom + SNAP
    }))

    const matchIndex = snapAreas.findIndex(area =>
        e.clientX >= area.left &&
        e.clientX <= area.right &&
        e.clientY >= area.top &&
        e.clientY <= area.bottom
    )

    if (matchIndex !== -1) {
        console.log('снап к индексу', matchIndex)
        // здесь вызывай pickChoice или что нужно
    }
}

    return (
        <>
            { props.remaining?.length > 0 ?
                                    <>
                                    <div>Осталось вопросов: {props.remaining?.length}</div>

                                        <div className={s.container}>
                                            <div>
                                                
                                                    <div className={s.row}>

                                                <div style={{ width: '15vw', height: '5vh', flexShrink: 0 }}>
    <div
        style={{
            position: draggingIndex === 0 ? 'fixed' : 'relative',
            top: draggingIndex === 0 ? currentPosOfPointer.y - offset.y : 'auto',
            left: draggingIndex === 0 ? currentPosOfPointer.x - offset.x : 'auto',
            zIndex: draggingIndex === 0 ? 1000 : 'auto',
            pointerEvents: dragging && draggingIndex !== 0 ? 'none' : 'auto'
        }}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerDown={(e) => handlePointerDown(e, 0)}
        onPointerUp={(e) => handlePointerUp(e)}
        className={s.leftItem}>
        {props.randomQuestions[0]}
    </div>
</div>
                                                {props.randomAnswers?.length > 0 && 
                                                <div className={s.answerCont}>
                                                    <div
                                                    ref={windowRef0}
                                                    className={s.snapArea}>
                                                        </div>
                                                <div
                                                    className={s.item}>
                                                    {props.randomAnswers[0]}
                                                </div>
                                                </div>}
                                                        </div>
                                                
                                                    <div className={s.row}>

                                                <div style={{ width: '15vw', height: '5vh', flexShrink: 0 }}>
    <div
        style={{
            position: draggingIndex === 1 ? 'fixed' : 'relative',
            top: draggingIndex === 1 ? currentPosOfPointer.y - offset.y : 'auto',
            left: draggingIndex === 1 ? currentPosOfPointer.x - offset.x : 'auto',
            zIndex: draggingIndex === 1 ? 1000 : 'auto',
            pointerEvents: dragging && draggingIndex !== 1 ? 'none' : 'auto'
        }}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerDown={(e) => handlePointerDown(e, 1)}
        onPointerUp={(e) => handlePointerUp(e)}
        className={s.leftItem}>
        {props.randomQuestions[1]}
    </div>
</div>
                                                {props.randomAnswers?.length > 1 && 
                                                <div className={s.answerCont}>
                                                    <div
                                                    ref={windowRef1}
                                                    className={s.snapArea}>
                                                        </div>
                                                <div
                                                    className={s.item}>
                                                    {props.randomAnswers[1]}
                                                </div>
                                                </div>}
                                                        </div>
                                                
                                                    <div className={s.row}>

                                                <div style={{ width: '15vw', height: '5vh', flexShrink: 0 }}>
    <div
        style={{
            position: draggingIndex === 2 ? 'fixed' : 'relative',
            top: draggingIndex === 2 ? currentPosOfPointer.y - offset.y : 'auto',
            left: draggingIndex === 2 ? currentPosOfPointer.x - offset.x : 'auto',
            zIndex: draggingIndex === 2 ? 1000 : 'auto',
            pointerEvents: dragging && draggingIndex !== 2 ? 'none' : 'auto'
        }}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerDown={(e) => handlePointerDown(e, 2)}
        onPointerUp={(e) => handlePointerUp(e)}
        className={s.leftItem}>
        {props.randomQuestions[2]}
    </div>
</div>
                                                {props.randomAnswers?.length > 2 && 
                                                <div className={s.answerCont}>
                                                    <div
                                                    ref={windowRef2}
                                                    className={s.snapArea}>
                                                        </div>
                                                <div
                                                    className={s.item}>
                                                    {props.randomAnswers[2]}
                                                </div>
                                                </div>}
                                                        </div>
                                                
                                                    <div className={s.row}>

                                                <div style={{ width: '15vw', height: '5vh', flexShrink: 0 }}>
    <div
        style={{
            position: draggingIndex === 3 ? 'fixed' : 'relative',
            top: draggingIndex === 3 ? currentPosOfPointer.y - offset.y : 'auto',
            left: draggingIndex === 3 ? currentPosOfPointer.x - offset.x : 'auto',
            zIndex: draggingIndex === 3 ? 1000 : 'auto',
            pointerEvents: dragging && draggingIndex !== 3 ? 'none' : 'auto'
        }}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerDown={(e) => handlePointerDown(e, 3)}
        onPointerUp={(e) => handlePointerUp(e)}
        className={s.leftItem}>
        {props.randomQuestions[3]}
    </div>
</div>
                                                {props.randomAnswers?.length > 3 && 
                                                <div className={s.answerCont}>
                                                    <div
                                                    ref={windowRef3}
                                                    className={s.snapArea}>
                                                        </div>
                                                <div
                                                    className={s.item}>
                                                    {props.randomAnswers[3]}
                                                </div>
                                                </div>}
                                                        </div>
                                            </div>
                                        </div>

                                        <div className={s.backBtns}>
                                        <button
                                            style={{ visibility: history.length === 0 ? 'visible' : 'hidden' }}
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

export default ComparisonMode