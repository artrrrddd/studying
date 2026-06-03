import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { logoutThunk } from "../redux/thunks/authThunks";
import { Link } from "react-router-dom";
import logo from '../../public/logo.webp'

import s from './mainpage.module.css'

const Navbar = () => {

  const isLogged = useSelector(s => s.auth.isLogged)
  const dispatch = useDispatch()

    return (
        <section className={s.navSection}>
          <div className={s.btns}>
        <div className={s.logo}>
            <img src={logo} alt="" />
        </div>
            <div className={s.line}>
        </div>
        <div className={s.navBtnsWrapper}>
        <Link to='/'>
          <button className={s.navBtn}>Главная</button>
        </Link>
        <Link to='/cards'>
          <button className={s.navBtn}>Карточки</button>
        </Link>
        <Link to='/lessons'>
          <button className={s.navBtn}>Уроки</button>
        </Link>
        <Link to='/create'>
          <button className={s.navBtn}>Создать урок</button>
        </Link>
                    </div>
        </div>
        <div className={s.authBlock}>
        {isLogged ? (
          <div>
                            <Link to='/myAccount'>
                                <button className={s.navBtn}>Личный кабинет</button>
                            </Link>
                            <button className={s.navBtn} onClick={() => { dispatch(logoutThunk())}}>Выйти</button>
                        </div>
                    ) : (
                      <Link to='/auth'>
                            <button className={s.navBtn}>Войти</button>
                        </Link>
                    )}
          </div>
      </section>
    )
}

export default Navbar