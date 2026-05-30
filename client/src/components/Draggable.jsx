import {useDraggable} from '@dnd-kit/react';
import s from './comparison.module.css'

export function Draggable(props) {
  const {ref} = useDraggable({
    id: props.id,
    disabled: props.disabled
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