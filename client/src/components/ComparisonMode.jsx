import React from "react"
import Droppable from "./Droppable"
import { Draggable } from "./Draggable"
import { useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import s from './comparison.module.css'
import { useSelector } from "react-redux"
import { useRef, useEffect } from "react"

const ComparisonMode = (props) => {
  
  const getRandomNumbers = () => {
    const numbers = [0, 1, 2, 3];
    
    for (let i = numbers.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      
        [numbers[i], numbers[randomIndex]] = [numbers[randomIndex], numbers[i]];
      }
      
      return numbers;
    };
    const [randIndexesA, setRandIndexesA] = useState(() => getRandomNumbers());
    const [randIndexesQ, setRandIndexesQ] = useState(() => getRandomNumbers());
    
  useEffect(() => {

    const handleBeforeUnload = (event) => {
      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
      
      const [errors, setErrors] = useState([])

      const [correct, setCorrect] = useState([])

      const lesson = useSelector(s => s.lessons.currentLesson)

      const questions = lesson?.cards?.map(e => e.translate)

      const answers = lesson?.cards?.map(e => e.word)
      
      const [randomAnswers, setRandomAnswers] = useState([])

      const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};
      
const partsFunction = (initial) => {
  const parts = [];

  for (let i = 0; i < initial.length; i += 4) {
    const part = initial.slice(i, i + 4);

    if (initial.length >= 4) {
      let index = 0;

      while (part.length < 4) {
        part.push(initial[index]);
        index++;
      }
    }

    parts.push(part);
  }

  return parts;
};

      const shuffledRemaining = shuffleArray(props.remaining)

      const [remaining, setRemaining] = useState(partsFunction(shuffledRemaining))

      partsFunction(shuffledRemaining)

      const [shuffledQuestions, setShuffledQuestions] = useState(shuffleArray(partsFunction(shuffledRemaining).map(e => e.map(e => e.translate))))

      const [shuffledAnswers, setShuffledAnswers] = useState(shuffleArray(partsFunction(shuffledRemaining).map(e => e.map(e => e.word))))

      const [randomQuestions, setRandomQuestions] = useState([]) 

      const isGoingBack = useRef(false)

      useEffect(() => {
      if (!answers?.length || !props.remaining?.length) return
      if (isGoingBack.current) {
          isGoingBack.current = false
          return
      }
  
      const correctIndex = answers.indexOf(props.remaining?.[0]?.word)
      const otherIndexes = [...Array(answers.length).keys()]
          .filter(i => i !== correctIndex)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
  
      const indexes = [...otherIndexes, correctIndex].sort(() => Math.random() - 0.5)
      setRandomAnswers(indexes.map(i => answers[i]))
  
      const questionIndex = questions.indexOf(props.remaining?.[0]?.translate)
      const otherQuestions = [...Array(questions.length).keys()]
          .filter(i => i !== questionIndex)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
  
      const indexesForQuestions = [...otherQuestions, questionIndex].sort(() => Math.random() - 0.5)
      setRandomQuestions(indexesForQuestions.map(i => questions[i]))    
  
  }, [props.remaining])

  const [result, setResult] = useState({
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  })

    const [answered, setAnswered] = useState(false)

    const [currentGroup, setCurrentGroup] = useState(0)    

    const [isColoredNow, setIsColoredNow] = useState(null)

    const [current, setCurrent] = useState({

      initialSlot1: remaining[currentGroup]?.[randIndexesA[0]]?.word ?? null,
      initialSlot2: remaining[currentGroup]?.[randIndexesA[1]]?.word ?? null,
      initialSlot3: remaining[currentGroup]?.[randIndexesA[2]]?.word ?? null,
      initialSlot4: remaining[currentGroup]?.[randIndexesA[3]]?.word ?? null,

      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
    })

    const answer = (current, randomQuestions, remain) => {

      setAnswered(true)

    const checkSlot = (slotName, questionIndex) => {
    const selectedWord = current[slotName]
    const questionTranslate = randomQuestions[questionIndex]    

    if (selectedWord === null) {
      return "none"
    }

    const correctCard = remain?.find(card => 
      card.translate === questionTranslate
    )

    if (!correctCard) {
      return "wrong"
    }

    if (correctCard.word === selectedWord) {
      return 'correct'
    } else {
      setErrors(prev => prev.some(e => e.id === correctCard.id) ? prev : [...prev, correctCard])
      return 'wrong'
    }
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

const [finished, setFinished] = useState(false)

  const bgColorFunc = (slot) => {
    
    if (result[slot] === 'correct') {
      return 'rgba(0,255,150,0.7)';
    } else if (result[slot] === 'wrong') {
      return '#ef4444'
    } else if (result[slot] === 'none') {
      return 'none'
    }
  }

  const next = (currentGroupIndex, setter) => {

    setAnswered(false)

    if (currentGroupIndex >= remaining.length - 1) {
      setFinished(true)
      return
    }

    // setRemaining((prev) => [...prev.slice(1)])
    
    setter((prev) => prev + 1)

    setResult(
    {
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
    }
  )

    setCurrent(
      {
        initialSlot1: remaining[currentGroupIndex + 1][randIndexesA[0]].word,
        initialSlot2: remaining[currentGroupIndex + 1][randIndexesA[1]].word,
        initialSlot3: remaining[currentGroupIndex + 1][randIndexesA[2]].word,
        initialSlot4: remaining[currentGroupIndex + 1][randIndexesA[3]].word,

        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
      }
    )
  }

  const goBack = (currentGroupIndex, setter) => {

    if (currentGroupIndex <= 0) {
      return
    }
    
    setter(prev => prev >= 0 ? prev - 1 : prev)
    setCurrent(
      {
        initialSlot1: remaining[currentGroupIndex - 1][randIndexesA[0]].word,
        initialSlot2: remaining[currentGroupIndex - 1][randIndexesA[1]].word,
        initialSlot3: remaining[currentGroupIndex - 1][randIndexesA[2]].word,
        initialSlot4: remaining[currentGroupIndex - 1][randIndexesA[3]].word,

        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
      }
    )
  }

  const practiceMistakes = () => {
  const errorGroups = partsFunction(errors)
  const group = errorGroups[0] ?? []

  const answerIndexes = getRandomNumbers().filter(i => i < group.length)
  const questionIndexes = getRandomNumbers().filter(i => i < group.length)

  setRandIndexesA(answerIndexes)
  setRandIndexesQ(questionIndexes)

  setResult({
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  })

  setCurrentGroup(0)
  setRemaining(errorGroups)

  setCurrent({
    initialSlot1: group[answerIndexes[0]]?.word ?? null,
    initialSlot2: group[answerIndexes[1]]?.word ?? null,
    initialSlot3: group[answerIndexes[2]]?.word ?? null,
    initialSlot4: group[answerIndexes[3]]?.word ?? null,

    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null,
  })

  setAnswered(false)
  setFinished(false)
  setErrors([])
}

    const goAgain = () => {

      setCurrentGroup(0)

      setAnswered(false)
      setFinished(false)

      setCurrent(
      {
        initialSlot1: remaining[0][randIndexesA[0]].word,
        initialSlot2: remaining[0][randIndexesA[1]].word,
        initialSlot3: remaining[0][randIndexesA[2]].word,
        initialSlot4: remaining[0][randIndexesA[3]].word,

        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null,
      }
    )

    setResult(
    {
      slot1: null,
      slot2: null,
      slot3: null,
      slot4: null,
    }
  )

    }
  
  return (
    finished ?
    <div className={s.finalDisplay}>
      Ошибки: {errors.length} из {props.remaining.length}
      процент: {(100 * errors.length / props.remaining.length).toFixed(2)}%
      <progress
      value={errors.length / props.remaining.length} />
      <div className={s.btnCont}>
      {errors.length !== 0 && <button onClick={practiceMistakes}>
        Тренировать ошибки
      </button>}
      <button onClick={goAgain}>Начать сначала</button>
      </div>
    </div> : 
    <DragDropProvider
      onDragEnd={(event) => {

        setIsColoredNow(null)
        
        if (event.canceled) return;
        
        const {target, source} = event.operation;
        if (!source || !target) return;

        setCurrent(prev => {
          const sourceSlot = Object.keys(prev).find(
            key => prev[key] === source.id
          );
          const targetSlot = target?.id;
          
          if (!targetSlot || !sourceSlot || !(targetSlot in prev) || sourceSlot === targetSlot) {
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

        <div>{errors.length}</div>

    <div className={s.rowOfDnD}>
      <Droppable
      border={'initialSlot'}
      id="initialSlot1">
      {current?.initialSlot1 !== null && <Draggable
      disabled={answered ? true : false}
      key={current?.initialSlot1}
      id={current?.initialSlot1}
      text={current?.initialSlot1}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot1" ? 'colored' : null}
      background={bgColorFunc('slot1')}
      id="slot1">
        {current?.slot1 !== null && <Draggable
        disabled={answered ? true : false}
        key={current.slot1}
        id={current?.slot1}
        text={current?.slot1}/>}
      </Droppable>
      <div className={s.question }>
        {remaining[currentGroup]?.[randIndexesQ[0]]?.translate}
      </div>
    </div>

    {remaining[currentGroup]?.length >= 2 ? 
    <div className={s.rowOfDnD}>
      <Droppable
      border={'initialSlot'}
      id="initialSlot2">
      {current?.initialSlot2 !== null && <Draggable
      disabled={answered ? true : false}
      key={current.initialSlot2}
      id={current?.initialSlot2}
      text={current?.initialSlot2}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot2" ? 'colored' : null}
      background={bgColorFunc('slot2')}
      id="slot2">
        {current?.slot2 !== null && <Draggable
        disabled={answered ? true : false}
        key={current.slot2}
        id={current?.slot2}
        text={current?.slot2}/>}
      </Droppable>
      <div className={s.question }>
        {remaining[currentGroup]?.[randIndexesQ[1]]?.translate}
      </div>
    </div>
    : <></>}

    {remaining[currentGroup]?.length >= 3 ? 
    <div className={s.rowOfDnD}>
      <Droppable
      border={'initialSlot'}
      id="initialSlot3">
      {current?.initialSlot3 !== null && <Draggable
      disabled={answered ? true : false}
      key={current.initialSlot3}
      id={current?.initialSlot3}
      text={current?.initialSlot3}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot3" ? 'colored' : null}
      background={bgColorFunc('slot3')}
      id="slot3">
        {current?.slot3 !== null && <Draggable
        disabled={answered ? true : false}
        key={current.slot3}
        id={current?.slot3}
        text={current?.slot3}/>}
      </Droppable>
      <div className={s.question }>
        {remaining[currentGroup]?.[randIndexesQ[2]]?.translate}
      </div>
    </div>
    : <></>}

    {remaining[currentGroup]?.length >= 4 ? 
    <div className={s.rowOfDnD}>
      <Droppable
      border={'initialSlot'}
      id="initialSlot4">
      {current?.initialSlot4 !== null && <Draggable
      disabled={answered ? true : false}
      key={current.initialSlot4}
      id={current?.initialSlot4}
      text={current?.initialSlot4}/>}
      </Droppable>

      <Droppable
      border={isColoredNow === "slot4" ? 'colored' : null}
      background={bgColorFunc('slot4')}
      id="slot4">
        {current?.slot4 !== null && <Draggable
        disabled={answered ? true : false}
        key={current.slot4}
        id={current?.slot4}
        text={current?.slot4}/>}
      </Droppable>
      <div className={s.question }>
        {remaining[currentGroup]?.[randIndexesQ[3]]?.translate}
      </div>
    </div>
    : <></>}

        <div className={s.bottomCont}>
          <button
            style={currentGroup <= 0 ? {visibility: 'hidden'} : {visibility: 'visible'}}
            onClick={() => goBack(currentGroup, setCurrentGroup)}
          >
            Назад
          </button>
        <div className={s.rightBTNs}>
        <button
        onClick={() => answer(
    current,
    [
      remaining[currentGroup]?.[randIndexesQ[0]]?.translate,
      remaining[currentGroup]?.[randIndexesQ[1]]?.translate,
      remaining[currentGroup]?.[randIndexesQ[2]]?.translate,
      remaining[currentGroup]?.[randIndexesQ[3]]?.translate,
    ],
    remaining[currentGroup]
  )}
        >Ответить</button>

        {result.slot1 === null &&
        result.slot2 === null &&
        result.slot3 === null &&
        result.slot4 === null ? null :
          <button
          onClick={() => next(currentGroup, setCurrentGroup)}
          >
            Далее
          </button>
        }
        </div>
        </div>
        </div>
    </DragDropProvider>
  );
}

export default ComparisonMode
