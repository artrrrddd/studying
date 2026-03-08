import React from "react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchLessonsThunk } from "../redux/thunks/lessonThunks"
import { Link } from "react-router-dom"


const Lessons = () => {

    const lessons = useSelector(s => s.lessons.items) || []

    const isLoading = useSelector(s=> s.lessons.fetchAllIsLoading)

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchLessonsThunk())
    }, [dispatch])

    return (
        <div>
            {
            isLoading ? 'Загрузка...' : 
                lessons.length > 0 ? (
                    lessons.map(e => (
                        <div key={e.id}>
                            <Link to={`/lessons/${e.id}`}>
                                {e.title}
                            </Link>
                        </div>
                    ))
                ) : (
                <div>Уроков пока нет</div>
            )}
        </div>
    )
}

export default Lessons