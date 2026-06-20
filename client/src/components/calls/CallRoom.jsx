import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDaily, useParticipantIds, useParticipantProperty } from '@daily-co/daily-react';
import { callsApi } from '../../api/callsApi';
import CallControls from './CallControls';
import ParticipantsGrid from './ParticipantsGrid';
import s from './calls.module.css';

function SidebarParticipant({ sessionId }) {
  const [userName, local, audioState, videoState] = useParticipantProperty(sessionId, [
    'user_name',
    'local',
    'tracks.audio.state',
    'tracks.video.state',
  ]);

  return (
    <div className={s.sidebarItem}>
      <strong>{userName || (local ? 'You' : 'Guest')}</strong>
      <span>
        {audioState === 'playable' || audioState === 'sendable' ? 'Audio on' : 'Audio off'}
        {' · '}
        {videoState === 'playable' || videoState === 'sendable' ? 'Video on' : 'Video off'}
      </span>
    </div>
  );
}

export default function CallRoom({ call, participant, onLeave }) {
  const navigate = useNavigate();
  const daily = useDaily();
  const participantIds = useParticipantIds({ sort: 'joined_at' });
  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const canAdmin =
    participant?.role === 'owner' ||
    participant?.role === 'moderator' ||
    participant?.permissions?.canAdmin;

  const createInvite = async () => {
    setInviteError(null);

    try {
      const data = await callsApi.createInvite(call.id, { expiresInMinutes: 60 });
      setInvite(data);
      await navigator.clipboard?.writeText(data.joinUrl);
    } catch (e) {
      setInviteError(e);
    }
  };

  const leave = async () => {
    await daily?.leave();
    await onLeave?.();
    navigate('/calls');
  };

  const end = async () => {
    await callsApi.endCall(call.id);
    await daily?.leave();
    navigate('/calls');
  };

  return (
    <main className={s.room}>
      <header className={s.roomHeader}>
        <div>
          <h1>{call.title}</h1>
          <p>
            {call.status} · {participantIds.length || 1} connected
          </p>
        </div>
        <span className={s.pill}>{participant?.role || 'participant'}</span>
      </header>

      <div className={s.roomBody}>
        <ParticipantsGrid />

        <aside className={s.sidebar}>
          <section>
            <h2>Participants</h2>
            <div className={s.sidebarList}>
              {participantIds.map((id) => (
                <SidebarParticipant key={id} sessionId={id} />
              ))}
            </div>
          </section>

          <section className={s.inviteBox}>
            <h2>Invite</h2>
            <button className={s.secondaryButton} onClick={createInvite} type="button">
              Create link
            </button>
            {invite && <div className={s.inviteLink}>{invite.joinUrl}</div>}
            {inviteError && <div className={s.error}>Could not create invite</div>}
          </section>
        </aside>
      </div>

      <CallControls
        canAdmin={canAdmin}
        onCreateInvite={createInvite}
        onEnd={end}
        onLeave={leave}
      />
    </main>
  );
}
