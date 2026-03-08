import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registrationThunk } from '../redux/thunks/authThunks'
import {  Link } from 'react-router-dom'
import s from './auth.module.css'

const SignUp = () => {
    const [email, setEmail] = useState("")
    const [pwd, setPwd] = useState("")

    const dispatch = useDispatch()

    const { error } = useSelector(s => s.auth)

    const registrationFunc = async () => {
        try {
            dispatch(registrationThunk({email, pwd}))
        } catch(e) {
            alert(e.response?.data?.message || 'Ошибка регистрации');
        }
    }

    return (
        <div className={s.page}>
            <div className={s.cont}>
                {error && <div style={{color: 'red'}}>{error}</div>}
                <div className={s.textareas}>
                    <input 
                        className={s.textarea} 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email" 
                    />
                    <input 
                        className={s.textarea} 
                        type="password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="Password" 
                        minLength={3}
                    />
                </div>
                <button onClick={registrationFunc}>
                    Зарегестрироваться
                </button>
                <h5>Уже зарегестрированы?</h5>
                <Link to="/auth">
                    <a>Войти</a>
                </Link>
            </div>
        </div>
    )
}

export default SignUp
