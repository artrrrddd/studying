import { useCallback } from 'react';
import { DailyProvider } from '@daily-co/daily-react';
import { Link, useParams } from 'react-router-dom';
import { callsApi } from '../../api/callsApi';
import { useDailyCall } from '../../hooks/calls/useDailyCall';
import CallLobby from './CallLobby';
import CallRoom from './CallRoom';
import s from './calls.module.css';

export default function JoinCallByInvitePage() {
  const { inviteCode } = useParams();
  const joinRequest = useCallback(
    () => callsApi.joinByCode(inviteCode),
    [inviteCode]
  );
  const { callObject, joinData, error, leave } = useDailyCall(joinRequest);

  if (error) {
    return (
      <main className={s.page}>
        <div className={s.shell}>
          <section className={s.panel}>
            <h1>Invite is not available</h1>
            <p className={s.error}>The link may be expired, used, or revoked.</p>
            <Link to="/calls">
              <button className={s.secondaryButton}>Back to calls</button>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!callObject || !joinData) {
    return <CallLobby title="Joining by invite..." />;
  }

  return (
    <DailyProvider callObject={callObject}>
      <CallRoom
        call={joinData.call}
        participant={joinData.participant}
        onLeave={leave}
      />
    </DailyProvider>
  );
}
