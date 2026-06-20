import { useCallback } from 'react';
import { DailyProvider } from '@daily-co/daily-react';
import { Link, useParams } from 'react-router-dom';
import { callsApi } from '../../api/callsApi';
import { useDailyCall } from '../../hooks/calls/useDailyCall';
import CallErrorBoundary from './CallErrorBoundary';
import CallLobby from './CallLobby';
import CallRoom from './CallRoom';
import s from './calls.module.css';

function getRequestErrorMessage(error) {
  if (error?.response?.status === 404) {
    return 'Комната или API route не найдены. Проверьте id звонка и VITE_API_URL.';
  }

  const dailyMessage =
    error?.errorMsg ||
    error?.error?.message ||
    error?.error?.msg ||
    (typeof error?.error === 'string' ? error.error : null);

  return (
    error?.response?.data?.message ||
    dailyMessage ||
    error?.message ||
    (typeof error === 'string' ? error : null) ||
    'Проверьте доступ, статус звонка и DAILY_API_KEY на backend.'
  );
}

export default function CallRoomPage() {
  const { id } = useParams();
  const joinRequest = useCallback(() => callsApi.joinCall(id), [id]);
  const { callObject, joinData, error, leave } = useDailyCall(joinRequest);

  if (error) {
    return (
      <main className={s.page}>
        <div className={s.shell}>
          <section className={s.panel}>
            <h1>Не удалось войти в звонок</h1>
            <p className={s.error}>{getRequestErrorMessage(error)}</p>
            <Link to="/calls">
              <button className={s.secondaryButton}>Назад к звонкам</button>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!callObject || !joinData) {
    return <CallLobby />;
  }

  return (
    <CallErrorBoundary>
      <DailyProvider callObject={callObject}>
        <CallRoom
          call={joinData.call}
          participant={joinData.participant}
          onLeave={leave}
        />
      </DailyProvider>
    </CallErrorBoundary>
  );
}
