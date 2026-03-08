import s from './create.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { useRef } from 'react'
import {Link} from 'react-router-dom'
import Import from './Import'
import { useState } from 'react'
import Card from './Card'
import { updateLessonThunk } from '../redux/thunks/lessonThunks'
import { useEffect } from 'react'

const EdittingMode = (props) => {

    useEffect(() => {
        setUpdatedLesson(props.lesson?.cards)
    },[])

    const updateSuccess = useSelector(s => s.lessons.updateSuccess)
    
    const [imported, setImported] = useState([])

    const [updatedLesson, setUpdatedLesson] = useState(null)
    
    useEffect(() => {
        if (imported.length > 0) {
            setUpdatedLesson(prevState => [...prevState, ...imported.map((e) => {
                return {
                    word: e.word,
                    translate: e.translate,
                }
            })])
            setImported([])
        }
        
        if (updateSuccess) {
            word.current.value = '';
            description.current.value = '';
            lessonName.current.value = '';
            select.current.value = null;
            translate.current.value = '';
        }
        
    },[imported, updateSuccess])
    
    const addCard = (card) => {
        setUpdatedLesson(prev => [...prev, card])
        word.current.value = '';
        translate.current.value = '';
    }

    const deleteCard = (card) => {        
        setUpdatedLesson(prev => prev.filter(e => e !== card))
    }
    
    const approve = () => {
        
        const cards = updatedLesson.map(e => {
            return {...e, lang: select.current.value}  
        })
        
        dispatch(updateLessonThunk      (
            {
                id: props.lesson?.id,
                title: lessonName.current.value || alert('Добавьте название урока'),
                description: description.current.value || '',
                cards: cards
            }
        ))
    }
    
    const [importIsOpen, setImportIsOpen] = useState(false)
    
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
    setUpdatedLesson(prev => prev.map((item, index) => 
        index === e.id ? {...item, translate: e.translate} : item
    ))
}

const editWord = (e) => {
    setUpdatedLesson(prev => prev.map((item, index) => 
        index === e.id ? {...item, word: e.word} : item
    ))
}
    
    return (
    <>
    <button onClick={() => setImportIsOpen(true)}>Импортировать</button>

    <div className={s.textInputs}>
        <span>Название урока</span>
        <textarea
        defaultValue={props.lesson.title}
        ref={lessonName} name="" id=""></textarea>
        <span>Описание</span>
        <textarea
        defaultValue={props.lesson.description}
        ref={description} name="" id=""></textarea>
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

        {updatedLesson?.map((e, i) => <div key={i} className={s.spanWrapper}>
                            <div>{i + 1}</div>
                        <div className={s.previewWrapper}>
                            <div className={s.coloredBG}>
                                <textarea
                                defaultValue={e.translate}
                                onChange={(event) => editTranslate({id: i, translate: event.target.value})}>
                        
                                </textarea>
                            </div>
                        <span>Термин</span>
                        </div>
                        <div className={s.previewWrapper}>
                            <div className={s.coloredBG}>
                                <textarea
                                defaultValue={e.word}
                                onChange={(event) => editWord({id: i, word: event.target.value})}>
                                </textarea>
                            </div>
                        <span>Определение</span>
                        </div>
                                    <button
                                    onClick={() => deleteCard(e)}                                    
                                    className={s.deleteBtn}>
                                        Удалить
                                    </button>
                    </div>)}

        </div>
        {updateSuccess ?
        <div className={s.successModal}>
        <div
        onClick={() => resetFlag()}
        className={s.overlay}>
            <span className={s.successSpan}>
                Урок успешно отредактирован
            </span> 
        </div>
        </div>
            : null}
        <button onClick={() => approve()}>Подтвердить изменения</button>
        {importIsOpen ? <Import setter={setImportIsOpen} import={setImported}/> : <></>}
    </div>
    </>
    )
}

export default EdittingMode