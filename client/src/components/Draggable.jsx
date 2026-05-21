import {useDraggable} from '@dnd-kit/react';
import s from './comparison.module.css'

export function Draggable(props) {
  const {ref} = useDraggable({
    id: props.id,
  });

  return (
    <button
    className={s.draggable}
    ref={ref}
    >
      {props?.text}
    </button>
  );
}