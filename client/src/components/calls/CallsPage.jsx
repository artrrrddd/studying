import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  CalendarClock,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';
import { useCallRoom } from '../../hooks/calls/useCallRoom';
import CreateCallModal from './CreateCallModal';
import s from './calls.module.css';

function formatDate(date) {
  if (!date) {
    return 'без срока';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function getStatusLabel(status) {
  const labels = {
    created: 'Создан',
    active: 'Активен',
    ended: 'Завершен',
    expired: 'Истек',
  };

  return labels[status] || status || 'Неизвестно';
}

function getInviteCode(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || trimmed;
  } catch {
    return trimmed.replace(/^\/?calls\/join\//, '');
  }
}

function getRequestErrorMessage(error, fallback) {
  if (error?.response?.status === 404) {
    return 'API route не найден. Проверьте VITE_API_URL и что backend запущен с /api/calls routes.';
  }

  return error?.response?.data?.message || error?.message || fallback;
}

function CallCard({ call }) {
  const isDisabled = call.status === 'ended' || call.status === 'expired';

  return (
    <article className={s.callCard}>
      <div className={s.cardTopline}>
        <span className={`${s.statusPill} ${s[`status_${call.status}`] || ''}`}>
          {getStatusLabel(call.status)}
        </span>
        <span className={s.cardType}>{call.type || 'instant'}</span>
      </div>

      <div>
        <h2>{call.title || 'Video call'}</h2>
        <div className={s.metaGrid}>
          <span>
            <Users size={16} />
            до {call.maxParticipants || 10}
          </span>
          <span>
            <CalendarClock size={16} />
            {formatDate(call.expiresAt)}
          </span>
          <span>
            <ShieldCheck size={16} />
            {call.visibility || 'private'}
          </span>
        </div>
      </div>

      <div className={s.cardActions}>
        <Link to={`/calls/${call.id}`} aria-disabled={isDisabled}>
          <button
            className={isDisabled ? s.secondaryButton : s.primaryButton}
            disabled={isDisabled}
            type="button"
          >
            Войти
            <ArrowRight size={17} />
          </button>
        </Link>
      </div>
    </article>
  );
}

export default function CallsPage() {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const isLogged = auth.isLogged;
  const { calls, loading, error, loadCalls, createCall } = useCallRoom({
    enabled: isLogged,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [inviteValue, setInviteValue] = useState('');
  const [inviteError, setInviteError] = useState('');

  const stats = useMemo(() => {
    const active = calls.filter((call) => call.status === 'active').length;
    const planned = calls.filter((call) => call.status === 'created').length;
    const finished = calls.filter(
      (call) => call.status === 'ended' || call.status === 'expired'
    ).length;

    return { active, planned, finished };
  }, [calls]);

  const handleCreate = async (payload) => {
    setCreating(true);
    setCreateError(null);

    try {
      const call = await createCall(payload);
      navigate(`/calls/${call.id}`);
    } catch (e) {
      setCreateError(e);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinInvite = (e) => {
    e.preventDefault();
    const inviteCode = getInviteCode(inviteValue);

    if (!inviteCode) {
      setInviteError('Вставьте код или ссылку приглашения');
      return;
    }

    setInviteError('');
    navigate(`/calls/join/${encodeURIComponent(inviteCode)}`);
  };

  if (auth.isLoading && !isLogged) {
    return (
      <main className={s.callsPage}>
        <section className={s.authPrompt}>
          <div className={s.spinner} aria-hidden="true" />
          <h1>Проверяем сессию</h1>
          <p>Сейчас откроем раздел звонков, если вы уже авторизованы.</p>
        </section>
      </main>
    );
  }

  if (!isLogged && !auth.isLoading) {
    return (
      <main className={s.callsPage}>
        <section className={s.authPrompt}>
          <Video size={36} />
          <h1>Звонки доступны после входа</h1>
          <p>Авторизуйтесь, чтобы создавать комнаты и получать защищенные Daily tokens.</p>
          <Link to="/auth">
            <button className={s.primaryButton} type="button">
              Войти
            </button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={s.callsPage}>
      <div className={s.callsShell}>
        <header className={s.callsHero}>
          <div className={s.heroCopy}>
            <p className={s.eyebrow}>Calls</p>
            <h1>Видеозвонки</h1>
            <p>
              Создавайте приватные комнаты, приглашайте участников по ссылке и
              подключайтесь через короткоживущие Daily tokens с backend-проверкой доступа.
            </p>
          </div>

          <div className={s.heroActions}>
            <button
              className={s.primaryButton}
              onClick={() => setCreateOpen((value) => !value)}
              type="button"
            >
              <Plus size={18} />
              Новый звонок
            </button>
            <button className={s.secondaryButton} onClick={loadCalls} type="button">
              <RefreshCw size={17} />
              Обновить
            </button>
          </div>
        </header>

        <section className={s.quickGrid}>
          <article className={s.quickPanel}>
            <Video size={22} />
            <div>
              <strong>{stats.active}</strong>
              <span>активных</span>
            </div>
          </article>
          <article className={s.quickPanel}>
            <CalendarClock size={22} />
            <div>
              <strong>{stats.planned}</strong>
              <span>создано</span>
            </div>
          </article>
          <article className={s.quickPanel}>
            <ShieldCheck size={22} />
            <div>
              <strong>{stats.finished}</strong>
              <span>завершено</span>
            </div>
          </article>
        </section>

        <section className={s.workArea}>
          <form className={s.joinPanel} onSubmit={handleJoinInvite}>
            <div>
              <h2>Войти по приглашению</h2>
              <p>Вставьте полный invite link или только код.</p>
            </div>
            <div className={s.joinRow}>
              <label className={s.visuallyHidden} htmlFor="call-invite">
                Код приглашения
              </label>
              <input
                id="call-invite"
                placeholder="https://app/calls/join/... или invite code"
                value={inviteValue}
                onChange={(e) => setInviteValue(e.target.value)}
              />
              <button className={s.secondaryButton} type="submit">
                <Link2 size={17} />
                Войти
              </button>
            </div>
            {inviteError && <p className={s.error}>{inviteError}</p>}
          </form>

          {createOpen && (
            <section className={s.createPanel}>
              <div className={s.sectionHeader}>
                <div>
                  <h2>Новый звонок</h2>
                  <p>Комната будет создана в MongoDB и Daily через backend.</p>
                </div>
                <button
                  className={s.secondaryButton}
                  onClick={() => setCreateOpen(false)}
                  type="button"
                >
                  Скрыть
                </button>
              </div>
              <CreateCallModal submitting={creating} onSubmit={handleCreate} />
              {createError && (
                <p className={s.error}>
                  {getRequestErrorMessage(createError, 'Не удалось создать звонок')}
                </p>
              )}
            </section>
          )}

          <section className={s.callsSection}>
            <div className={s.sectionHeader}>
              <div>
                <h2>Мои комнаты</h2>
                <p>Здесь отображаются комнаты, где вы владелец, участник или приглашены.</p>
              </div>
            </div>

            {loading && (
              <div className={s.skeletonList}>
                <div className={s.skeletonCard} />
                <div className={s.skeletonCard} />
                <div className={s.skeletonCard} />
              </div>
            )}

            {error && (
              <div className={s.errorPanel}>
                <strong>Не удалось загрузить звонки</strong>
                <span>Проверьте авторизацию и доступность backend.</span>
                <button className={s.secondaryButton} onClick={loadCalls} type="button">
                  Повторить
                </button>
              </div>
            )}

            {!loading && !error && calls.length === 0 && (
              <div className={s.emptyState}>
                <Video size={30} />
                <h3>Комнат пока нет</h3>
                <p>Создайте первый звонок или подключитесь по invite link.</p>
                <button
                  className={s.primaryButton}
                  onClick={() => setCreateOpen(true)}
                  type="button"
                >
                  <Plus size={18} />
                  Создать звонок
                </button>
              </div>
            )}

            {!loading && !error && calls.length > 0 && (
              <div className={s.list}>
                {calls.map((call) => (
                  <CallCard call={call} key={call.id} />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
