import s from './create.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { useRef } from 'react'
import {Link} from 'react-router-dom'
import Import from './Import'
import { useState } from 'react'
import Card from './Card'
import { createLessonThunk } from '../redux/thunks/lessonThunks'
import { useEffect } from 'react'

const Create = () => {

    const createSuccess = useSelector(s => s.lessons.createSuccess)

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

        if (createSuccess) {
            word.current.value = '';
            description.current.value = '';
            lessonName.current.value = '';
            select.current.value = null;
            translate.current.value = '';
        }

    },[imported, createSuccess])

    const addCard = (card) => {

        setLesson(prev => [...prev, card])
        word.current.value = '';
        translate.current.value = '';
        
    }

    const approve = () => {

        const cards = lesson.map(e => {
            return {...e, lang: select.current.value}  
        })
        
        dispatch(createLessonThunk(
            {
                title: lessonName.current.value || alert('Добавьте название урока'),
                description: description.current.value || '',
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

    const resetFlag = () => {
        dispatch({type: 'lessons/resetFlags'})
    }

const editTranslate = (e) => {
    setLesson(prev => prev.map((item, index) => 
        index === e.id ? {...item, translate: e.translate} : item
    ))
}

const editWord = (e) => {
    setLesson(prev => prev.map((item, index) => 
        index === e.id ? {...item, word: e.word} : item
    ))
}
    
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

        {lesson.map((e, i) => <div key={i} className={s.spanWrapper}>
                            <div>{i + 1}</div>
                        <div className={s.previewWrapper}>
                            <div className={s.coloredBG}>
                                <textarea onChange={(event) => editTranslate({id: i, translate: event.target.value})}>
                            {                        
                                e.translate
                            }
                                </textarea>
                            </div>
                        <span>Термин</span>
                        </div>
                        <div className={s.previewWrapper}>
                            <div className={s.coloredBG}>
                                <textarea onChannge={(event) => editWord({id: i, word: event.target.value})}>
                            {
                                e.word
                            }
                                </textarea>
                            </div>
                        <span>Определение</span>
                        </div>
                    </div>)}

        </div>
        {createSuccess ?
        <div className={s.successModal}>
        <div
        onClick={() => resetFlag()}
        className={s.overlay}>
            <span className={s.successSpan}>
                Урок создан Ура
            </span> 
        </div>
        </div>
            : null}
        <button onClick={() => approve()}>Подтвердить и создать урок</button>
        {importIsOpen ? <Import setter={setImportIsOpen} import={setImported}/> : <></>}
    </div>
    </>
    )
}

export default Create