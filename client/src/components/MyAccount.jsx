import React, { useEffect } from "react";
import s from './myAccount.module.css'
import { useDispatch, useSelector } from "react-redux";
import { fetchMyLessonsThunk } from "../redux/thunks/lessonThunks";

const MyAccount = () => {
    const dispatch = useDispatch();
    const lessons = useSelector((state) => state.lessons.items);

    useEffect(() => {
        dispatch(fetchMyLessonsThunk());
    }, [dispatch]);

    return (
        <div className={s.wrapper}>
            <div><h2>Мои уроки:</h2>
                {lessons?.length ? lessons.map((e) => <div key={e.id}>{e.title}</div>) : 'нет уроков'}
            </div>
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