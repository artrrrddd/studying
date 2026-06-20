import { useMemo } from 'react';
import {
  useDaily,
  useLocalSessionId,
  useParticipantProperty,
  useScreenShare,
} from '@daily-co/daily-react';
import {
  Link2,
  LogOut,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';
import s from './calls.module.css';

function MediaControls({
  canAdmin,
  daily,
  localSessionId,
  onCreateInvite,
  onEnd,
  onLeave,
}) {
  const [audioState, videoState] = useParticipantProperty(localSessionId, [
    'tracks.audio.state',
    'tracks.video.state',
  ]);
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  const audioEnabled = audioState === 'playable' || audioState === 'sendable';
  const videoEnabled = videoState === 'playable' || videoState === 'sendable';

  const buttons = useMemo(
    () => ({
      audio: audioEnabled ? 'Mute microphone' : 'Unmute microphone',
      video: videoEnabled ? 'Disable camera' : 'Enable camera',
      screen: isSharingScreen ? 'Stop screen share' : 'Share screen',
    }),
    [audioEnabled, isSharingScreen, videoEnabled]
  );

  return (
    <>
      <button
        aria-label={buttons.audio}
        className={`${s.iconButton} ${audioEnabled ? s.iconButtonActive : ''}`}
        onClick={() => daily?.setLocalAudio(!audioEnabled)}
        title={buttons.audio}
        type="button"
      >
        {audioEnabled ? <Mic size={19} /> : <MicOff size={19} />}
      </button>

      <button
        aria-label={buttons.video}
        className={`${s.iconButton} ${videoEnabled ? s.iconButtonActive : ''}`}
        onClick={() => daily?.setLocalVideo(!videoEnabled)}
        title={buttons.video}
        type="button"
      >
        {videoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
      </button>

      <button
        aria-label={buttons.screen}
        className={`${s.iconButton} ${isSharingScreen ? s.iconButtonActive : ''}`}
        onClick={() => (isSharingScreen ? stopScreenShare() : startScreenShare())}
        title={buttons.screen}
        type="button"
      >
        {isSharingScreen ? <ScreenShareOff size={19} /> : <ScreenShare size={19} />}
      </button>

      <button
        aria-label="Create invite link"
        className={s.iconButton}
        onClick={onCreateInvite}
        title="Create invite link"
        type="button"
      >
        <Link2 size={19} />
      </button>

      <button
        aria-label="Leave call"
        className={s.iconButton}
        onClick={onLeave}
        title="Leave call"
        type="button"
      >
        <LogOut size={19} />
      </button>

      {canAdmin && (
        <button
          aria-label="End call"
          className={`${s.iconButton} ${s.dangerIconButton}`}
          onClick={onEnd}
          title="End call"
          type="button"
        >
          <PhoneOff size={19} />
        </button>
      )}
    </>
  );
}

export default function CallControls({
  canAdmin = false,
  onCreateInvite,
  onEnd,
  onLeave,
}) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();

  return (
    <footer className={s.controls}>
      {localSessionId ? (
        <MediaControls
          canAdmin={canAdmin}
          daily={daily}
          localSessionId={localSessionId}
          onCreateInvite={onCreateInvite}
          onEnd={onEnd}
          onLeave={onLeave}
        />
      ) : (
        <button
          aria-label="Leave call"
          className={s.iconButton}
          onClick={onLeave}
          title="Leave call"
          type="button"
        >
          <LogOut size={19} />
        </button>
      )}
    </footer>
  );
}
