import mascot from '../../public/mascot.webp'
import s from './promopage.module.css'
import logo from '../../public/logo.webp'
import { Link } from 'react-router-dom'


const PromoPage = () => {
    return (
        <div className={s.mainGrid}>
                <div
            className={s.top}
            style={{backgroundColor: '#FEFAF5'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div
            style={{
                '--note-image': `url(${logo})`,
            }}
            className={s.logo}>
            </div>
            <div style={{display: 'flex', gap: '1dvw', marginRight: '2dvw'}}>
                <Link to='/'>
                            <button style={{border: 'none', background: 'none'}}>О нас</button>
                </Link>
                <Link to='/'>
                            <button style={{border: 'none', background: 'none'}}>Обучение</button>
                </Link>
                <Link to='/'>
                            <button style={{border: 'none', background: 'none'}}>Уроки</button>
                </Link>
                <Link to='/auth'>
                            <button className={s.btn}>Войти</button>
                </Link>
                <Link to='/auth'>
                            <button
                            style={{backgroundColor: '#97D252'}}
                            className={s.btn}>Регистрация</button>
                </Link>
            </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>

            <div className={s.topBot}>

            <div
            style={{
                '--note-image': `url(${mascot})`,
            }}
            className={s.mascot}>
                asddfasfdsafdas     
            </div>
                </div>
            </div>
                </div>
            <div>
                
            <div
                className={s.middle}
                style={{
                height: '100%',
                width: '100%'
                }}>

            </div>
                </div>
            <div
            className={s.bot}
            >

            </div>
        </div>
    )
}

export default PromoPage