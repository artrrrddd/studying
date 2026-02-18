import s from './create.module.css'
import { createCardThunk } from '../redux/thunks/cardThunks'
import { useDispatch } from 'react-redux'
import { useRef } from 'react'

const Create = () => {

    const dispatch = useDispatch()
    const word = useRef(null)
    const translate = useRef(null)
    const select = useRef(null)

    return (
    <>
    <div className={s.textInputs}>
        <span>Создание карточки</span>
        <span>Введите слово</span>
        <textarea ref={word} name="" id=""></textarea>
        <span>Введите перевод</span>
        <textarea ref={translate} name="" id=""></textarea>
        <span>Выберите язык</span>
        <select ref={select} className={s.select} name="lang" id="lang">
            <option value="English">English</option>
            <option value="Китайский">Китайский</option>
            <option value="Какийский">Какийский</option>
        </select>
        <button onClick={() => dispatch(createCardThunk({word: word.current.value, translate: translate.current.value, lang: select.current.value}))}>Создать карточку</button>
    </div>
    </>
    )
}

export default Create
