import React from "react";
import s from './card.module.css'
import { useState } from "react";

const Card = (props) => {

    const [turned, setTurned] = useState(false)

    return (
        <>
        <div className={s.container}>
            <button onClick={() => setTurned(!turned)} className={turned ? s.cardsBack : s.cardFront}>
                {turned ? <div className={s.flipped}>
                    {props.word}
                        </div>
                    : <div>
                        {props.translate}
                    </div>}
            </button>
        </div>
        </>
    )
}

export default Card