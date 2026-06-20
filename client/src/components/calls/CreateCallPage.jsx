import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callsApi } from '../../api/callsApi';
import CreateCallModal from './CreateCallModal';
import s from './calls.module.css';

function getRequestErrorMessage(error, fallback) {
  if (error?.response?.status === 404) {
    return 'API route не найден. Проверьте VITE_API_URL и что backend запущен с /api/calls routes.';
  }

  return error?.response?.data?.message || error?.message || fallback;
}

export default function CreateCallPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError(null);

    try {
      const call = await callsApi.createCall(payload);
      navigate(`/calls/${call.id}`);
    } catch (e) {
      setError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={s.page}>
      <div className={s.shell}>
        <header className={s.topbar}>
          <div className={s.titleGroup}>
            <p className={s.eyebrow}>Calls</p>
            <h1 className={s.title}>Создать звонок</h1>
          </div>
          <Link to="/calls">
            <button className={s.secondaryButton}>Назад</button>
          </Link>
        </header>

        <section className={s.panel}>
          <CreateCallModal submitting={submitting} onSubmit={handleSubmit} />
          {error && (
            <p className={s.error}>
              {getRequestErrorMessage(error, 'Не удалось создать звонок')}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
