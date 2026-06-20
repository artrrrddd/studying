import s from './calls.module.css';

export default function CallLobby({ title = 'Connecting...' }) {
  return (
    <main className={s.page}>
      <div className={`${s.shell} ${s.lobby}`}>
        <div className={s.panel}>
          <div className={s.spinner} aria-hidden="true" />
          <h1>{title}</h1>
        </div>
      </div>
    </main>
  );
}
