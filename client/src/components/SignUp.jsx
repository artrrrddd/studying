import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthService from '../services/AuthService'
import s from './auth.module.css'

const SignUp = () => {
    const [email, setEmail] = useState("")
    const [pwd, setPwd] = useState("")
    const navigate = useNavigate()

    const registrationFunc = async () => {
        try {
            await AuthService.registration(email, pwd);
            navigate('/auth');
        } catch(e) {
            alert(e.response?.data?.message || 'Ошибка регистрации');
        }
    }

    return (
        <div className={s.page}>
            <div className={s.cont}>
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
