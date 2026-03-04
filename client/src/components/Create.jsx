import s from './create.module.css'
import { useDispatch } from 'react-redux'
import { useRef } from 'react'
import {Link} from 'react-router-dom'
import Import from './Import'
import { useState } from 'react'
import Card from './Card'
import { createLessonThunk } from '../redux/thunks/lessonThunks'
import { useEffect } from 'react'

const Create = () => {

    const [imported, setImported] = useState([])

    useEffect(() => {
        if (imported.length > 0) {
            setLesson(prevState => [...prevState, ...imported.map((e) => {
        return {
                    word: e.word,
                    translate: e.translate,
                }
        })])
        setImported([])
        }
    },[imported])

    const addCard = (card) => {
        // dispatch(createCardThunk({word: word.current.value, translate: translate.current.value, lang: select.current.value}))
        setLesson(prev => [...prev, card])
        
    }

    const approve = () => {

        const cards = lesson.map(e => {
            return {...e, lang: select.current.value}  
        })

        dispatch(createLessonThunk(
            {
                title: lessonName.current.value,
                description: description.current.value,
                cards: cards
            }
        ))
    }

    const [importIsOpen, setImportIsOpen] = useState(false)

    const [lesson, setLesson] = useState([])
    const dispatch = useDispatch()
    const word = useRef(null)
    const translate = useRef(null)
    const select = useRef(null)
    const lessonName = useRef(null)
    const description = useRef(null)
    

    // imported ? setLesson([...lesson, ...imported.map((e) => {
    //     return {
    //                 word: e.word,
    //                 translate: e.translate,
    //                 lang: select.current.value
    //             }
    //     })]) : null
    
    // console.log(lesson);
    
    return (
    <>
    <button onClick={() => setImportIsOpen(true)}>Импортировать</button>

    <div className={s.textInputs}>
        <span>Название урока</span>
        <textarea ref={lessonName} name="" id=""></textarea>
        <span>Описание</span>
        <textarea ref={description} name="" id=""></textarea>
        <span>Язык</span>
        <select ref={select} className={s.select} name="lang" id="lang">
            <option value="English">English</option>
            <option value="Китайский">Китайский</option>
            <option value="Какийский">Какийский</option>
        </select>
        <span>Термин</span>
        <textarea ref={translate} name="" id=""></textarea>
        <span>Определение</span>
        <textarea ref={word} name="" id=""></textarea>
        <button onClick={() => addCard(
            {   word: word.current.value,
                translate: translate.current.value,
            })}>
            Добавить карточку
        </button>
        <div className={s.previewWrapper}>

        {lesson.map((e) => {
            return <Card word={e.word} translate={e.translate}/>
        })}

        </div>
        <button onClick={() => approve()}>Подтвердить и создать урок</button>
        {importIsOpen ? <Import setter={setImportIsOpen} import={setImported}/> : <></>}
    </div>
    </>
    )
}

export default Create