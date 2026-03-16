import React from "react";
import { useDraggable } from "@dnd-kit/core";

function ChipBase({
  label,
  className = "",
  title,
  style,
  setNodeRef,
  listeners,
  attributes,
}) {
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={className || undefined}
      style={style}
      title={title ?? label}
    >
      {label}
    </div>
  );
}

export function ChipPreview({ label, className = "", style }) {
  return (
    <ChipBase
      label={label}
      className={className}
      style={style}
    />
  );
}

export default function Chip({ id, label }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <ChipBase
      label={label}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
    />
  );
}
