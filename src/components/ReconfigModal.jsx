import React from 'react';

export function ReconfigModal({ tStarHit, onDismiss }) {
  return (
    <>
      <div className={`reconfig-overlay ${tStarHit ? 'show' : ''}`} />
      <div className={`reconfig-msg ${tStarHit ? 'show' : ''}`}>
        <h2>T* REACHED</h2>
        <p>
          SYSTEM RECONFIGURATION EVENT<br />
          Physical constraints have exceeded capacity.<br />
          The coordination trap has resolved through physics.
        </p>
        <button className="dismiss-btn" onClick={onDismiss}>
          CONTINUE OBSERVING
        </button>
      </div>
    </>
  );
}
