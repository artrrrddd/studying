import s from './calls.module.css';

export default function IncomingCallModal({ callerName, onAccept, onDecline }) {
  if (!callerName) {
    return null;
  }

  return (
    <div className={s.modalBackdrop} role="dialog" aria-modal="true">
      <div className={s.modal}>
        <h2>{callerName} is calling</h2>
        <div className={s.actions}>
          <button className={s.secondaryButton} onClick={onDecline} type="button">
            Decline
          </button>
          <button className={s.primaryButton} onClick={onAccept} type="button">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
