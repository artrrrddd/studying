import { useState } from 'react';
import s from './calls.module.css';

export default function CreateCallModal({ onSubmit, onCancel, submitting = false }) {
  const [title, setTitle] = useState('Учебный звонок');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [settings, setSettings] = useState({
    startVideoOff: false,
    startAudioOff: false,
    enableScreenshare: true,
    enableChat: false,
  });

  const updateSetting = (name) => {
    setSettings((current) => ({
      ...current,
      [name]: !current[name],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      type: 'instant',
      visibility: 'private',
      maxParticipants,
      settings,
      allowedUsers: [],
    });
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.field}>
        <label htmlFor="call-title">Название</label>
        <input
          id="call-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={s.field}>
        <label htmlFor="call-max-participants">Максимум участников</label>
        <input
          id="call-max-participants"
          min="2"
          max="200"
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
        />
      </div>

      <div className={s.checkboxRow}>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={settings.startVideoOff}
            onChange={() => updateSetting('startVideoOff')}
          />
          Старт с выключенной камерой
        </label>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={settings.startAudioOff}
            onChange={() => updateSetting('startAudioOff')}
          />
          Старт с выключенным микрофоном
        </label>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={settings.enableScreenshare}
            onChange={() => updateSetting('enableScreenshare')}
          />
          Демонстрация экрана
        </label>
        <label className={s.checkbox}>
          <input
            type="checkbox"
            checked={settings.enableChat}
            onChange={() => updateSetting('enableChat')}
          />
          Чат
        </label>
      </div>

      <div className={s.actions}>
        {onCancel && (
          <button className={s.secondaryButton} type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
        <button className={s.primaryButton} disabled={submitting} type="submit">
          {submitting ? 'Создаем...' : 'Создать звонок'}
        </button>
      </div>
    </form>
  );
}
