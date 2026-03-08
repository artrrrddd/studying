import React from "react";
import s from './card.module.css'
import { useState, useRef } from "react";

const Card = (props) => {

    const [turned, setTurned] = useState(false)

    const [position, setPosition] = useState({x: 0, y: 0})

    const [dragging, setDragging] = useState(false)

    const offsetRef = useRef({x: 0, y: 0})

    const handleMouseDown = (e) => {
        setDragging(true)
        offsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleDrag = (e) => {
        console.log(position);
        console.log(dragging);
        if(!dragging) return
        setPosition({
            y: e.clientY - offsetRef.current.y,
            x: e.clientX - offsetRef.current.x
        })
    }

    const handleUp = (e) => {
        if (dragging) {
        e.stopPropagation()
    }

        setDragging(false)
    }

    return (
        <>
        <div className={s.container}>
            <button
                // style={props.drag ? 
                //         {
                //             position: 'absolute',
                //             top: position.y,
                //             left: position.x,
                //             cursor: dragging ? "grabbing" : "grab"
                //         }
                //     : null
                // }
                // onMouseUp={(e) => handleUp(e)}
                // onMouseMove={(e) => handleDrag(e)}
                // onMouseDown={(e) => handleMouseDown(e)}

                onClick={() => setTurned(!turned)} className={turned ? s.cardsBack : s.cardFront}>
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