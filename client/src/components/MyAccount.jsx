import React from "react";
import s from './myAccount.module.css'

const MyAccount = () => {
    return (
        <div className={s.wrapper}>
            <ul>
                <li>Мои уроки</li>
                <li>Мои избранные</li>
                <li>Тесты</li>
                <li>Всякое типа там</li>
            </ul>
        </div>
    )
}

export default MyAccount