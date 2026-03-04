import React, { useState } from "react"
import s from './import.module.css'

const Import = (props) => {


    const [betweenWords, setBetweenWords] = useState('\t')
    const [betweenCards, setBetweenCards] = useState('\n')
    const [customBetweenWords, setCustomBetweenWords] = useState('')
    const [customBetweenCards, setCustomBetweenCards] = useState('')
    const [text, setText] = useState(null)

    const assembly = (e) => {
        const newValue = e.target.value
        setText(newValue)
    }

    const preview = text ? text.split(betweenCards) : []

    const importedCards = preview ? preview.map((e) => (
        {
            word: e.indexOf(betweenWords) !== -1 ? e.slice(0, e.indexOf(betweenWords)) : e,
            translate: e.indexOf(betweenWords) === -1 ? '' : e.slice(e.indexOf(betweenWords) + 1),
        }
    )
    ) : []

    const handleTextareaKeyDown = (e) => {
        if (e.key !== 'Tab') return
        e.preventDefault()
        const ta = e.target
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const val = text ?? ''
        const newVal = val.slice(0, start) + '\t' + val.slice(end)
        setText(newVal)
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 1
        })
    }

    const commit = () => {
        props.import(importedCards)
        props.setter(false)
    }

    return (

        <>
        
        <div className={s.modalWrapper}>
            <div className={s.btnClose}>
            <button onClick={() => props.setter(false)}>Закрыть</button>
            </div>
            <textarea
                className={s.textarea}
                value={text ?? ''}
                onChange={(e) => assembly(e)}
                onKeyDown={handleTextareaKeyDown}
                name=""
                id="textareaArea"
                placeholder={'Слово 1 Термин 1\nСлово 2 Термин 2\nСлово 3 Термин 3'}
                />

            <div className={s.options}>
                <fieldset
                    className={s.cont}
                    >
                    <legend>Между термином и определением:</legend>
                    <div>
                        <input
                        checked={betweenWords === '\t'}
                        onChange={(e) => setBetweenWords(e.target.value)}
                        name="betweenWords" type="radio" value={'\t'} id="Tab" />
                        <label htmlFor="Tab">Tab</label>
                    </div>
                    <div>
                        <input
                        checked={betweenWords === ','}
                        onChange={(e) => setBetweenWords(e.target.value)}
                        name="betweenWords" type="radio" value="," id="comma" />
                        <label htmlFor="comma">Запятая</label>
                    </div>
                    <div>
                        <input
                        checked={betweenWords !== '\t' && betweenWords !== ','}
                        onChange={() => setBetweenWords(customBetweenWords)}
                        name="betweenWords" type="radio" value="customBetweenWords" id="customBetweenWords" />
                        <label htmlFor="customBetweenWords">
                            <input
                                type="text"
                                value={customBetweenWords}
                                onChange={(e) => {
                                    setCustomBetweenWords(e.target.value)
                                    setBetweenWords(e.target.value)
                                }}
                                />
                        </label>
                    </div>
                </fieldset>
                <fieldset
                    className={s.cont}
                    >
                    <legend>Между карточками:</legend>
                    <div>
                        <input
                        checked={betweenCards === '\n'}
                        onChange={(e) => setBetweenCards(e.target.value)}
                        name="betweenCards" type="radio" value={'\n'}  id="lineBreak" />
                        <label htmlFor="lineBreak">Перенос строки</label>
                    </div>
                    <div>
                        <input
                        checked={betweenCards === ';'}
                        onChange={(e) => setBetweenCards(e.target.value)}
                        name="betweenCards" type="radio" value=";" id="semicolon" />
                        <label htmlFor="semicolon">Точка с запятой</label>
                    </div>
                    <div>
                        <input
                        checked={betweenCards !== '\n' && betweenCards !== ';'}
                        onChange={() => setBetweenCards(customBetweenCards)}
                        name="betweenCards" type="radio" value="customBetweenCards" id="customBetweenCards" />
                        <label htmlFor="customBetweenCards">
                            <input
                                type="text"
                                value={customBetweenCards}
                                onChange={(e) => {
                                    setCustomBetweenCards(e.target.value)
                                    setBetweenCards(e.target.value)
                                }}
                                />
                        </label>
                    </div>
                </fieldset>
            </div>
            <div className={s.previewHeader}>
            <h3>Предварительный просмотр</h3>
            <h5>Карточек: {preview.length}</h5>
            </div>
            <div className={s.previewContainer}>

            {
                preview.map((e, i) => <div key={i} className={s.spanWrapper}>
                    <div>{i + 1}</div>
                <div className={s.previewWrapper}>
                <div className={s.coloredBG}>
                <span>
                    {                        
                        e.indexOf(betweenWords) !== -1 ?
                        e.slice(0, e.indexOf(betweenWords)) : e
                    }
                </span>
                </div>
                <span>Термин</span>
                </div>
                <div className={s.previewWrapper}>
                <div className={s.coloredBG}>
                <span>
                    {
                        e.indexOf(betweenWords) === -1 ?
                        '' : e.slice(e.indexOf(betweenWords) + 1)
                    }
                </span>
                </div>
                <span>Определение</span>
                </div>
            </div>)
            }   
            </div>
            <button
            onClick={() => commit()}
            className={s.btn}>Импортировать карточки</button>
            </div>
        </>

    )
}

export default Import