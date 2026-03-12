import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";

/*
  props:
    randomQuestions: string[4]
    randomAnswers:   string[4]
    remaining:       any[]
*/

const INDICES = [0, 1, 2, 3];

// ── Draggable chip ────────────────────────────────────────────────────────────

function Chip({ id, label, placed }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`chip${placed ? " placed" : ""}`}
      data-dragging={isDragging}
    >
      {label}
    </div>
  );
}

// ── Droppable zone ────────────────────────────────────────────────────────────

function DropZone({ id, children, occupied }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`dz${occupied ? " has" : ""}${isOver ? " over" : ""}`}
    >
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ComparisonMode({
  randomQuestions = [],
  randomAnswers = [],
  remaining,
}) {
  const [placements, setPlacements] = useState(new Map());
  const [activeQIdx, setActiveQIdx] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  // reverse: answerIdx → questionIdx
  const answerOccupant = useMemo(() => {
    const m = new Map();
    placements.forEach((ai, qi) => m.set(ai, qi));
    return m;
  }, [placements]);

  function onDragStart({ active }) {
    setActiveQIdx(Number(active.id));
  }

  function onDragEnd({ active, over }) {
    setActiveQIdx(null);
    if (!over) return;

    const qIdx = Number(active.id);
    const aIdx = Number(over.id);

    setPlacements((prev) => {
      const next = new Map(prev);
      const prevAIdx = next.get(qIdx);
      const occupant = answerOccupant.get(aIdx);

      if (occupant !== undefined && occupant !== qIdx) {
        prevAIdx !== undefined ? next.set(occupant, prevAIdx) : next.delete(occupant);
      }

      next.set(qIdx, aIdx);
      return next;
    });
  }

  if (!remaining?.length) {
    return (
      <>
        <Styles />
        <div className="lf-root">
          <div className="lesson-end">Урок окончен</div>
        </div>
      </>
    );
  }

  const progress = (placements.size / 4) * 100;

  return (
    <>
      <Styles />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="lf-root">

          <div className="lf-header">
            <span className="lf-title">Сопоставление</span>
            <span className="lf-badge">{remaining.length} осталось</span>
          </div>

          <div className="lf-progress-track">
            <div className="lf-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="lf-board">
            {INDICES.map((ai) => {
              const placedQIdx   = answerOccupant.get(ai);
              const isQPlaced    = placements.has(ai);
              const showUnplaced = !isQPlaced && activeQIdx !== ai;

              return (
                <div key={ai} className="lf-row">

                  <div className="lf-cell-left">
                    {showUnplaced ? (
                      <Chip id={String(ai)} label={randomQuestions[ai]} placed={false} />
                    ) : (
                      <div className="lf-ghost" />
                    )}
                  </div>

                  <DropZone id={String(ai)} occupied={placedQIdx !== undefined}>
                    {placedQIdx !== undefined && activeQIdx !== placedQIdx && (
                      <Chip
                        id={String(placedQIdx)}
                        label={randomQuestions[placedQIdx]}
                        placed={true}
                      />
                    )}
                  </DropZone>

                  <div className="lf-answer">{randomAnswers[ai]}</div>

                </div>
              );
            })}
          </div>

        </div>

        <DragOverlay dropAnimation={{ duration: 160, easing: "ease" }}>
          {activeQIdx !== null && (
            <div className="chip is-overlay">{randomQuestions[activeQIdx]}</div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap');

      .lf-root {
        font-family: 'Manrope';
        min-height: 80vh;
        max-width: 50vw;
        padding: 24px 16px 48px;
      }

      /* ── Header ── */
      .lf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .lf-title {
        color: #fff;
        font-size: x-large;
        font-weight: 800;
        letter-spacing: 0.01em;
        text-shadow: 0 1px 8px rgba(0,0,0,0.4);
      }
      .lf-badge {
        font-size: medium;
        font-weight: 700;
        color: rgba(255,255,255,0.9);
        padding: 4px 12px;
        border-radius: 99px;
        background: rgba(255,255,255,0.10);
        border: 0.5px solid rgba(255,255,255,0.30);
        box-shadow:
          inset 0 0.5px 0 rgba(255,255,255,0.45),
          0 1px 6px rgba(0,0,0,0.25);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      }

      /* ── Progress ── */
      .lf-progress-track {
        height: 4px;
        background: rgba(255,255,255,0.08);
        border-radius: 99px;
        margin-bottom: 20px;
        overflow: hidden;
      }
      .lf-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #FCA47C, #F9D779);
        border-radius: 99px;
        box-shadow: 0 0 8px rgba(252,164,124,0.6);
        transition: width 0.4s ease;
      }

      /* ── Board ── */
      .lf-board { display: flex; flex-direction: column; gap: 24px; }

      .lf-row {
        display: grid;
        grid-template-columns: 2fr 3fr 3fr;
        gap: 1vw;
        align-items: center;
        min-height: 88px;
      }

      .lf-cell-left { display: flex; align-items: center; }

      .lf-ghost {
        width: 100%;
        height: 88px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
      }

      /* ── Liquid drop chip ── */
      .chip {
        position: relative;
        width: 100%;
        height: auto;
        min-height: 9vh;
        box-sizing: border-box;
        padding: 26px 18px;
        border-radius: 18px;
        font-family: 'Manrope', sans-serif;
        font-size: large;
        font-weight: 700;
        color: rgba(255,255,255,0.95);
        text-align: center;
        line-height: 1.3;
        white-space: normal;
        word-break: break-word;
        text-shadow: 0 1px 6px rgba(0,0,0,0.45);
        overflow: hidden;
        cursor: grab;
        user-select: none;
        touch-action: none;
        isolation: isolate;

        background: rgba(255,255,255,0.001);

        backdrop-filter: blur(1px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);

        box-shadow:
          0 0 0 0.5px rgba(255,255,255,0.20),
          inset 0 2px 0 rgba(255,255,255,0.55),
          inset 0 -2px 4px rgba(0,0,0,0.35),
          inset 2px 0 0 rgba(255,255,255,0.15),
          inset -2px 0 0 rgba(255,255,255,0.10),
          0 8px 32px rgba(0,0,0,0.40),
          0 2px 8px rgba(0,0,0,0.25),
          0 12px 40px rgba(35,206,217,0.10);

        transition: box-shadow 0.15s, background 0.15s, opacity 0.12s, transform 0.15s;
      }

      .chip::before {
        content: '';
        position: absolute;
        top: 0; left: 10%; right: 10%;
        height: 1.5px;
        background: linear-gradient(90deg,
          transparent,
          rgba(255,100,80,0.9)  10%,
          rgba(255,200,60,1.0)  25%,
          rgba(80,255,160,0.9)  45%,
          rgba(60,160,255,0.9)  65%,
          rgba(160,80,255,0.8)  80%,
          transparent
        );
        border-radius: 99px;
        filter: blur(0.3px);
      }

      .chip::after {
        content: '';
        position: absolute;
        top: 2px; left: 15%; right: 15%;
        height: 35%;
        border-radius: 50%;
        pointer-events: none;
      }

      .chip:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow:
          0 0 0 0.5px rgba(255,255,255,0.28),
          inset 0 2px 0 rgba(255,255,255,0.60),
          inset 0 -2px 4px rgba(0,0,0,0.35),
          inset 2px 0 0 rgba(255,255,255,0.18),
          inset -2px 0 0 rgba(255,255,255,0.12),
          0 14px 42px rgba(0,0,0,0.50),
          0 4px 12px rgba(0,0,0,0.30),
          0 16px 48px rgba(35,206,217,0.16);
      }

      .chip[data-dragging="true"] {
        opacity: 0;
      }

      .chip.placed {
        backdrop-filter: blur(1px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(200%);
        color: #FFE8D4;
      }

      .chip.is-overlay {
        cursor: grabbing;
        transform: rotate(-1.5deg) scale(1.05);
        opacity: 1 !important;
      }

      /* ── Drop zone ── */
      .dz {
        min-height: 88px;
        border-radius: 18px;
        padding: 4px;
        display: flex;
        align-items: center;

        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(16px) saturate(140%);
        -webkit-backdrop-filter: blur(16px) saturate(140%);

        border: 1.5px dashed rgba(255,255,255,0.15);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);

        transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      }
      .dz.has {
        border: 0.5px solid rgba(252,164,124,0.30);
        box-shadow: inset 0 1px 0 rgba(255,200,150,0.10);
      }
      .dz.over {
        border-color: rgba(255,255,255,0.40);
        background: rgba(255,255,255,0.08);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.12),
          0 0 0 3px rgba(255,255,255,0.06);
      }
      .dz .chip { cursor: grab; }

      /* ── Answer card ── */
      .lf-answer {
        padding: 26px 18px;
        border-radius: 18px;
        font-size: large;
        font-weight: 600;
        color: rgba(255,255,255,0.38);
        text-align: center;
        line-height: 1.4;
        white-space: normal;
        word-break: break-word;
        overflow-wrap: break-word;

        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(16px) saturate(140%);
        -webkit-backdrop-filter: blur(16px) saturate(140%);

        box-shadow:
          0 0 0 0.5px rgba(255,255,255,0.08),
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 -1px 0 rgba(0,0,0,0.08);
      }

      /* ── End screen ── */
      .lesson-end {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 2px 12px rgba(0,0,0,0.4);
      }
    `}</style>
  );
}