import React, { useEffect } from "react";
import Card from "./Card";
import { useDispatch, useSelector } from "react-redux";
import { fetchCardsThunk } from "../redux/thunks/cardThunks";
import s from './cards.module.css'

const Cards = () => {
    useEffect(() => {
        dispatch(fetchCardsThunk())        
    },[])

    const dispatch = useDispatch()

    const data = useSelector(s => s.cards.items)
    
    return (
        <div className={s.wrap}>
            <div>{console.log(data)}</div>
        {data.map((e) => <Card word={e.word} translate={e.translate} />
        )}
        </div>
    )
}

export default Cards