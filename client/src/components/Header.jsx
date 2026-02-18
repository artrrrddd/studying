import React, { useState } from "react";
import s from './header.module.css'
import { Link } from "react-router-dom";
import {useSelector, useDispatch} from 'react-redux'
import { logoutThunk } from "../redux/thunks/authThunks";

const Header = () => {
    const dispatch = useDispatch()
    const isLogged = useSelector(s => s.auth.isLogged)
    const [menuOpen, setMenuOpen] = useState(false)

    const closeMenu = () => setMenuOpen(false)

    return (
        <div className={s.cont}>
            <div className={`${s.menuPanel} ${menuOpen ? s.menuPanelOpen : ''}`}>
                <div className={s.nav}>
                    <Link to='/' onClick={closeMenu}>
                        <button>Главная</button>
                    </Link>
                    <Link to="/cards" onClick={closeMenu}>
                        <button>Карточки</button>
                    </Link>
                    <button>Пушка</button>
                    <button>Танки</button>
                    <button>Бомба</button>
                </div>
                <div className={s.functionalWrap}>
                    {isLogged ? (
                        <div className={s.functional}>
                            <Link to='/create' onClick={closeMenu}>
                                <button>Создать урок</button>
                            </Link>
                            <Link to='/myAccount' onClick={closeMenu}><button>Личный кабинет</button></Link>
                            <button onClick={() => { dispatch(logoutThunk()); closeMenu(); }}>Выйти</button>
                        </div>
                    ) : (
                        <Link to='/auth' onClick={closeMenu}>
                            <button>Войти</button>
                        </Link>
                    )}
                </div>
            </div>
            <button
                className={s.burger}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
                <span className={s.burgerLine} />
                <span className={s.burgerLine} />
                <span className={s.burgerLine} />
            </button>
        </div>
    )
}

export default Header