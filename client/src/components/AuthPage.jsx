import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { loginThunk } from '../redux/thunks/authThunks'
import s from './auth.module.css'

const AuthPage = () => {
    const [email, setEmail] = useState("")
    const [pwd, setPwd] = useState("")
    
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const shouldRedirect = useSelector(s => s.auth.shouldRedirect)
    const isLoading = useSelector(s => s.auth.isLoading)

    useEffect(() => {
        if (shouldRedirect === true){
            navigate('/')
            dispatch({type: 'CLEAR_REDIRECT_FLAG'})
        };
    }, [shouldRedirect, navigate, dispatch])

    const loginFunc = () => {
        dispatch(loginThunk({email, pwd}));
    };

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
                <button onClick={loginFunc}>
                    {isLoading ? 'Загрузка...' : 'Войти'}
                </button>
                <h5>Еще не зарегестрированы?</h5>
                <Link to='/signup'>
                    <a>Зарегестрироваться</a>
                </Link>
            </div>
        </div>
    )
}

export default AuthPage
