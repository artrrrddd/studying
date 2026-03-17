import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from './comparison.module.css'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Chip, { ChipPreview } from "./Chip";
import LiquidGlassPane from "./LiquidGlassPane";
import { GlassContainer } from './GlassContainer'

const bgGradient =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <radialGradient id="g1" cx="20%" cy="20%" r="60%">
          <stop offset="0%" stop-color="#8cc5ff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#8cc5ff" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g2" cx="85%" cy="25%" r="45%">
          <stop offset="0%" stop-color="#ffba57" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#ffba57" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="g3" cx="50%" cy="85%" r="50%">
          <stop offset="0%" stop-color="#52e8b5" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#52e8b5" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#08111f" />
          <stop offset="45%" stop-color="#10243f" />
          <stop offset="100%" stop-color="#173763" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#base)" />
      <rect width="1600" height="900" fill="url(#g1)" />
      <rect width="1600" height="900" fill="url(#g2)" />
      <rect width="1600" height="900" fill="url(#g3)" />
    </svg>
  `)

const heroGlassOptions = {
  refraction: 0.028,
  bevelDepth: 0.11,
  bevelWidth: 0.17,
  frost: 1.2,
  shadow: false,
  specular: false,
  reveal: 'none',
  magnify: 1.03,
}

const INDICES = [0, 1, 2, 3];

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

export default function ComparisonMode({
  randomQuestions = [],
  randomAnswers = [],
  remaining,
}) {
  const [placements, setPlacements] = useState(new Map());
  const [activeQIdx, setActiveQIdx] = useState(null);
  const [activeRect, setActiveRect] = useState(null);
  const overlayHostRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const answerOccupant = useMemo(() => {
    const map = new Map();
    placements.forEach((answerIdx, questionIdx) => {
      map.set(answerIdx, questionIdx);
    });
    return map;
  }, [placements]);

  function onDragStart({ active }) {
    setActiveQIdx(Number(active.id));
    setActiveRect(active.rect.current?.initial ?? active.rect.current?.translated ?? null);
  }

  function onDragEnd({ active, over }) {
    setActiveQIdx(null);
    setActiveRect(null);

    if (!over) {
      return;
    }

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
          <div className="lesson-end">Урок оконче��</div>
        </div>
      </>
    );
  }

  const progress = (placements.size / 4) * 100;
  const snapshotKey = `${activeQIdx ?? "idle"}:${[...placements.entries()]
    .map(([questionIdx, answerIdx]) => `${questionIdx}-${answerIdx}`)
    .sort()
    .join("|")}`;

  return (
    <>

      <Styles />
      <GlassContainer
      imageSrc={bgGradient}
      style={{ width: '55vw', height: '85vh' }}
      >

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
                const placedQIdx = answerOccupant.get(ai);
                const isQPlaced = placements.has(ai);
                const showUnplaced = !isQPlaced && activeQIdx !== ai;
                
                return (
                  <div key={ai} className="lf-row">
                    <div className="lf-cell-left">
                      {showUnplaced ? (
                        <div className={s.glassSlot}>

          <Chip
      id={String(ai)}
      label={randomQuestions[ai]}
      />

        </div>
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

          {overlayHostRef.current
            ? createPortal(
                <DragOverlay dropAnimation={{ duration: 160, easing: "ease" }}>
                  {activeQIdx !== null && (
                    <ChipPreview
                      label={randomQuestions[activeQIdx]}
                      className="is-overlay"
                      style={
                        activeRect
                          ? { width: `${activeRect.width}px`, height: `${activeRect.height}px` }
                          : { width: "clamp(220px, 26vw, 360px)" }
                      }
                    />
                  )}
                </DragOverlay>,
                overlayHostRef.current
              )
            : null}
        </DndContext>
        <div ref={overlayHostRef} className="lf-overlay-host" />
</GlassContainer>
    </>
  );
}

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

      .lf-board {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .lf-row {
        display: grid;
        grid-template-columns: 2fr 3fr 3fr;
        gap: 1vw;
        align-items: center;
        min-height: 88px;
      }

      .lf-cell-left {
        display: flex;
        align-items: center;
      }

      .lf-ghost {
        width: 100%;
        height: 88px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
      }

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
        z-index: 12;
        background: transparent;
        box-shadow:
          0 0 0 0.5px rgba(255,255,255,0.22),
          inset 0 1px 0 rgba(255,255,255,0.46),
          inset 0 -1px 0 rgba(255,255,255,0.08),
          inset 1px 0 0 rgba(255,255,255,0.10),
          inset -1px 0 0 rgba(255,255,255,0.06),
          0 12px 40px rgba(35,206,217,0.08);
        transition: box-shadow 0.15s, opacity 0.12s, transform 0.15s;
      }

      .chip__label {
        position: relative;
        z-index: 14;
        display: block;
      }

      .chip::before {
        content: '';
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 1.5px;
        background: linear-gradient(90deg,
          transparent,
          rgba(255,100,80,0.9) 10%,
          rgba(255,200,60,1.0) 25%,
          rgba(80,255,160,0.9) 45%,
          rgba(60,160,255,0.9) 65%,
          rgba(160,80,255,0.8) 80%,
          transparent
        );
        border-radius: 99px;
        filter: blur(0.3px);
        z-index: 13;
        pointer-events: none;
      }

      .chip:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow:
          0 0 0 0.5px rgba(255,255,255,0.28),
          inset 0 1px 0 rgba(255,255,255,0.56),
          inset 0 -1px 0 rgba(255,255,255,0.10),
          inset 1px 0 0 rgba(255,255,255,0.14),
          inset -1px 0 0 rgba(255,255,255,0.08),
          0 16px 48px rgba(35,206,217,0.12);
      }

      .chip[data-dragging="true"] {
        opacity: 0;
      }

      .chip.placed {
        color: #FFE8D4;
      }

      .chip.is-overlay {
        cursor: grabbing;
        transform: rotate(-1.5deg) scale(1.05);
        opacity: 1 !important;
      }

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

      .dz .chip {
        cursor: grab;
      }

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

      .lf-overlay-host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1000;
      }
    `}</style>
  );
}
