import React, { useEffect } from "react";
import s from './myAccount.module.css'
import { useDispatch, useSelector } from "react-redux";
import { fetchMyLessonsThunk } from "../redux/thunks/lessonThunks";
import { Link } from "react-router-dom";

const MyAccount = () => {

    const dispatch = useDispatch();
    const lessons = useSelector((state) => state.lessons.myItems) || [];

    const isLoading = useSelector(s => s.lessons.fetchMineIsLoading)

    useEffect(() => {
        dispatch(fetchMyLessonsThunk());
    }, [dispatch]);

    return (
        <div className={s.wrapper}>
            <div><h2>Мои уроки</h2>
                {isLoading ? 'Загрузка...' :
                lessons?.length > 0 ? lessons.map((e) =>
                <div className={s.cont}>
                    <Link to={`/lessons/${e.id}`}>
                <div className={s.link} key={e.id}>{e.title}</div>
                    </Link>
                </div>
            )  : <div>нет уроков</div>}
            </div>
        </div>
    )
}

export default MyAccount