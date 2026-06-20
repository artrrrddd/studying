import { useEffect, useMemo, useRef } from 'react';
import { useParticipantProperty } from '@daily-co/daily-react';
import s from './calls.module.css';

function useMediaTrack(elementRef, track, muted = false) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.srcObject = track ? new MediaStream([track]) : null;
    element.muted = muted;

    if (track) {
      element.play?.().catch(() => {});
    }

    return () => {
      element.srcObject = null;
    };
  }, [elementRef, muted, track]);
}

export default function ParticipantTile({ sessionId, isSpeaking = false }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [
    userName,
    local,
    videoState,
    videoTrack,
    audioState,
    audioTrack,
    screenState,
    screenTrack,
  ] = useParticipantProperty(sessionId, [
    'user_name',
    'local',
    'tracks.video.state',
    'tracks.video.persistentTrack',
    'tracks.audio.state',
    'tracks.audio.persistentTrack',
    'tracks.screenVideo.state',
    'tracks.screenVideo.persistentTrack',
  ]);

  const visibleTrack = screenState === 'playable' ? screenTrack : videoTrack;
  const hasVideo = screenState === 'playable' || videoState === 'playable';
  const hasAudio = audioState === 'playable';
  const displayName = userName || (local ? 'You' : 'Guest');

  const initials = useMemo(() => {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }, [displayName]);

  useMediaTrack(videoRef, hasVideo ? visibleTrack : null, Boolean(local));
  useMediaTrack(audioRef, !local && hasAudio ? audioTrack : null, false);

  return (
    <article className={`${s.tile} ${isSpeaking ? s.tileSpeaking : ''}`}>
      <video
        className={`${s.video} ${hasVideo ? '' : s.videoHidden}`}
        playsInline
        ref={videoRef}
      />
      {!hasVideo && <div className={s.avatar}>{initials || '?'}</div>}
      {!local && <audio ref={audioRef} />}

      <div className={s.tileFooter}>
        <span className={s.nameTag}>{local ? `${displayName} (you)` : displayName}</span>
        {isSpeaking && <span className={s.stateTag}>Speaking</span>}
        {!hasAudio && <span className={s.stateTag}>Mic off</span>}
      </div>
    </article>
  );
}
