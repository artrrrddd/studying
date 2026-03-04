import { useDispatch, useSelector } from "react-redux"
import { fetchLessonByIdThunk } from "../redux/thunks/lessonThunks"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import s from './lesson.module.css'
import Card from "./Card"

const Lesson = () => {

    const lesson = useSelector(s => s.lessons.currentLesson)

    const { id } = useParams()

    const dispatch = useDispatch()

    useEffect(() => {        
        dispatch(fetchLessonByIdThunk(id))
    },[])
    
    return (
        <div className={s.cont}>
        <span>

        название: {''}
        {lesson?.title}
        </span>
        <span>

        описание: {''}
        {lesson?.description}
        </span>
        <span>карточки:</span>
        <div className={s.cardWrapper}>
            {lesson?.cards?.map((e) => {
                return <Card word={e.word} translate={e.translate}>sadas</Card>
            })}
            </div>
        </div>
    )
}

export default Lesson