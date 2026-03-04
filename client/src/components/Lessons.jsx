import React from "react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchLessonsThunk } from "../redux/thunks/lessonThunks"
import { Link } from "react-router-dom"


const Lessons = () => {

    const lessons = useSelector(s => s.lessons.items)

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchLessonsThunk())
    }, [])

    return (
        <>
        <div>
            {lessons.map(e => <div>{
            <Link to={`/lessons/${e.id}`}>
            {e.title}
            </Link>
            }</div>)}    
        </div>
        </>
    )
}

export default Lessons