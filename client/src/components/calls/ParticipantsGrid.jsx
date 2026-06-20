import {
  useActiveSpeakerId,
  useLocalSessionId,
  useParticipantIds,
} from '@daily-co/daily-react';
import ParticipantTile from './ParticipantTile';
import s from './calls.module.css';

function getGridClass(count) {
  if (count <= 1) {
    return s.gridOne;
  }

  if (count === 2) {
    return s.gridTwo;
  }

  if (count <= 4) {
    return s.gridFour;
  }

  return s.gridMany;
}

export default function ParticipantsGrid() {
  const participantIds = useParticipantIds({ sort: 'joined_at' });
  const localSessionId = useLocalSessionId();
  const activeSpeakerId = useActiveSpeakerId();
  const ids = participantIds.length ? participantIds : [localSessionId].filter(Boolean);

  return (
    <section className={`${s.grid} ${getGridClass(ids.length)}`}>
      {ids.map((id) => (
        <ParticipantTile
          isSpeaking={activeSpeakerId === id}
          key={id}
          sessionId={id}
        />
      ))}
    </section>
  );
}
