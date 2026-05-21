import React from "react"
import Droppable from "./Droppable"
import { Draggable } from "./Draggable"
import { useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import s from './comparison.module.css'

const ComparisonMode = (props) => {

  const [result, setResult] = useState({
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  })

    const [isColoredNow, setIsColoredNow] = useState(null)

    const [current, setCurrent] = useState({

      initialSlot1: props.randomAnswers[0],
      initialSlot2: props.randomAnswers[1],
      initialSlot3: props.randomAnswers[2],
      initialSlot4: props.randomAnswers[3],

      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
    })

    const answer = (current, randomQuestions, remaining) => {
    const checkSlot = (slotName, questionIndex) => {
    const selectedWord = current[slotName]
    const questionTranslate = randomQuestions[questionIndex]

    if (selectedWord === null) {
      return "none"
    }

    const correctCard = remaining.find(card => 
      card.translate === questionTranslate
    )

    if (!correctCard) {
      return "wrong"
    }

    return correctCard.word === selectedWord ? "correct" : "wrong"
  }

  setResult(
    {
      slot1: checkSlot("slot1", 0),
      slot2: checkSlot("slot2", 1),
      slot3: checkSlot("slot3", 2),
      slot4: checkSlot("slot4", 3),
    }
  )
}

  const bgColorFunc = (slot) => {
    
    if (result[slot] === 'correct') {
      return 'rgba(0,255,150,0.7)';
    } else if (result[slot] === 'wrong') {
      return '#ef4444'
    } else if (result[slot] === 'none') {
      return 'none'
    }
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {

        setIsColoredNow(null)
        
        if (event.canceled) return;
        
        const {target, source} = event.operation;
        setCurrent(prev => {
          const sourceSlot = Object.keys(prev).find(
            key => prev[key] === source.id
          );
          const targetSlot = target?.id;
          
          if (!sourceSlot || !(targetSlot in prev) || sourceSlot === targetSlot) {
            return prev;
          }
          
          return {
            ...prev,
            [sourceSlot]: prev[targetSlot],
            [targetSlot]: prev[sourceSlot],
          };
          
        });
      }}
      onDragOver={(event) => {
        
        if (event.canceled) return;
        
        const {target} = event.operation
        
        setIsColoredNow(target?.id ?? null)
        
      }}
      >

      <div className={s.comparisonWrapper}>

    <div className={s.rowOfDnD}>
      <Droppable
      border={'initialSlot'}
      id="initialSlot1">
      {current?.initialSlot1 !== null && <Draggable
      key={current.initialSlot1}
      id={current?.initialSlot1}
      text={current?.initialSlot1}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot1" ? 'colored' : null}
      background={bgColorFunc('slot1')}
      id="slot1">
        {current?.slot1 !== null && <Draggable
        key={current.slot1}
        id={current?.slot1}
        text={current?.slot1}/>}
      </Droppable>
      <div className={s.question }>
        {props?.randomQuestions[0]}
      </div>
    </div>

    <div className={s.rowOfDnD}>
      
      <Droppable
      border={'initialSlot'}
      id="initialSlot2">
      {current?.initialSlot2 !== null && <Draggable
      key={current.initialSlot2}
      id={current?.initialSlot2}
      text={current?.initialSlot2}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot2" ? 'colored' : null}
      background={bgColorFunc('slot2')}
      id="slot2">
        {current?.slot2 !== null && <Draggable
        key={current.slot2}
        id={current?.slot2}
        text={current?.slot2}/>}
      </Droppable>
      <div className={s.question }>
        {props?.randomQuestions[1]}
      </div>
    </div>

    <div className={s.rowOfDnD}>
      
      <Droppable
      border={'initialSlot'}
      id="initialSlot3">
      {current?.initialSlot3 !== null && <Draggable
      key={current.initialSlot3}
      id={current?.initialSlot3}
      text={current?.initialSlot3}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot3" ? 'colored' : null}
      background={bgColorFunc('slot3')}
      id="slot3">
        {current?.slot3 !== null && <Draggable
        key={current.slot3}
        id={current?.slot3}
        text={current?.slot3}/>}
      </Droppable>
      <div className={s.question }>
        {props?.randomQuestions[2]}
      </div>
    </div>

    <div className={s.rowOfDnD}>
      
      <Droppable
      border={'initialSlot'}
      id="initialSlot4">
      {current?.initialSlot4 !== null && <Draggable
      key={current.initialSlot4}
      id={current?.initialSlot4}
      text={current?.initialSlot4}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot4" ? 'colored' : null}
      background={bgColorFunc('slot4')}
      id="slot4">
        {current?.slot4 !== null && <Draggable
        key={current.slot4}
        id={current?.slot4}
        text={current?.slot4}/>}
      </Droppable>
      <div className={s.question }>
        {props?.randomQuestions[3]}
      </div>
    </div>
        <div className={s.bottomCont}>
        <button>Назад</button>
        <button
        onClick={() => answer(current, props.randomQuestions, props.remaining)}
        >Ответить</button>
        </div>
        </div>
    </DragDropProvider>
  );
}

export default ComparisonMode