import React, { useCallback, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useGlassRef } from "./GlassCanvas";

function ChipBase({
  label,
  placed = false,
  isDragging = false,
  className = "",
  title,
  style,
  setNodeRef,
  listeners,
  attributes,
}) {
  const cleanupRef = useRef(null);
  const registerGlassRef = useGlassRef();

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const mergedRef = useCallback(
    (node) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      if (node && typeof registerGlassRef === "function") {
        cleanupRef.current = registerGlassRef(node);
      }

      if (typeof setNodeRef === "function") {
        setNodeRef(node);
      }
    },
    [registerGlassRef, setNodeRef]
  );

  const classes = ["chip"];
  if (placed) {
    classes.push("placed");
  }
  if (className) {
    classes.push(className);
  }

  return (
    <div
      ref={mergedRef}
      {...listeners}
      {...attributes}
      className={classes.join(" ")}
      data-dragging={isDragging ? "true" : "false"}
      data-glass-chip="true"
      style={style}
      title={title ?? label}
    >
      <span className="chip__label">{label}</span>
    </div>
  );
}

export function ChipPreview({ label, placed = false, className = "", style }) {
  return (
    <ChipBase
      label={label}
      placed={placed}
      className={className}
      style={style}
    />
  );
}

export default function Chip({ id, label, placed }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <ChipBase
      label={label}
      placed={placed}
      isDragging={isDragging}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
    />
  );
}
