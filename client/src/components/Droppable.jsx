import {useDroppable} from '@dnd-kit/react';
import s from './comparison.module.css'

function Droppable({id, children, border, isHighlighted}) {
  const {ref} = useDroppable({
    id,
  });

  const borderFunc = (border) => {
    if (border === 'colored' || isHighlighted) {
      return '1.5px solid #2dd4bf'
    } else if (border === 'initialSlot') {
      return 'none'
    } else {
      return '1.5px solid #e2e8f0'
    }
  }

  return (
    <div ref={ref}
    className={s.droppable}
    style={{borderRadius: 10,
      border: borderFunc(border)}}
    >
      {children}
    </div>
  );
}

export default Droppable
