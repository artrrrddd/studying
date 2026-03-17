import React from "react";
import { useDraggable } from "@dnd-kit/core";
import s from "./comparison.module.css";
import { LiquidGlass } from './LiquidGlass'

function ChipBase({
  id,
  label,
  className = "",
  title,
  style,
  setNodeRef,
  listeners,
  attributes,
  placed = false,
}) {
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        s.chipShell,
        placed ? s.chipPlaced : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      title={title ?? label}
    >
      <LiquidGlass
        blurRadiusPx={0}
        edgeMapStart={0.9}
        edgeMapMaxPx={0}
        className={s.chipGlassPane}
        style={{
          width: '100%',
          minHeight: 88,
          borderRadius: 18,
        }}
      >
        <div className={s.chipGlassContent}>{label}</div>
      </LiquidGlass>
    </div>
  );
}

export function ChipPreview({ id = "preview", label, className = "", style }) {
  return (
    <ChipBase
      id={id}
      label={label}
      className={className}
      style={style}
    />
  );
}

export default function Chip({ id, label, placed = false, className = "", style }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <ChipBase
      id={id}
      label={label}
      placed={placed}
      className={className}
      style={style}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
    />
  );
}
