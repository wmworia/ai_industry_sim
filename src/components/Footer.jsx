import React from 'react';

export function Footer({
  running,
  simSpeed,
  toggleRun,
  reset,
  setSimSpeed,
  payoffs
}) {
  const PAYOFF_RANGES = {
    H: 50,
    V: 50,
    M: 50,
    D: 50,
    Z: 50,
    I: 50,
    R: 50
  };

  const getPayoffColor = (payoff) => {
    return payoff > 3 ? 'payoff-pos' : payoff < -3 ? 'payoff-neg' : 'payoff-neutral';
  };

  const MiniBar = ({ label, payoff, color }) => {
    const range = PAYOFF_RANGES[label] || 50;
    const norm = Math.max(0, Math.min(1, (payoff - (-range)) / (range * 2)));

    return (
      <div className="mini-bar-item">
        <div className="mini-bar-track">
          <div className="mini-bar-zero" />
          <div
            className="mini-bar-fill"
            style={{
              height: `${norm * 100}%`,
              background: color
            }}
          />
        </div>
        <div className="mini-bar-label">{label}</div>
        <div className={`mini-bar-val ${getPayoffColor(payoff)}`}>
          {payoff.toFixed(0)}
        </div>
      </div>
    );
  };

  return (
    <div className="footer">
      <button
        className={`sim-btn ${running ? 'active' : ''}`}
        onClick={toggleRun}
      >
        {running ? '⏸ PAUSE' : '▶ RUN'}
      </button>
      <button className="sim-btn danger" onClick={reset}>
        ↺ RESET
      </button>

      <div className="speed-label">SPEED:</div>
      <div className="toggle-group" style={{ gap: '2px' }}>
        <button
          className={`toggle-btn ${simSpeed === 800 ? 'active' : ''}`}
          onClick={() => setSimSpeed(800)}
        >
          1×
        </button>
        <button
          className={`toggle-btn ${simSpeed === 300 ? 'active' : ''}`}
          onClick={() => setSimSpeed(300)}
        >
          3×
        </button>
        <button
          className={`toggle-btn ${simSpeed === 100 ? 'active' : ''}`}
          onClick={() => setSimSpeed(100)}
        >
          8×
        </button>
      </div>

      <div className="actor-mini-bars">
        <MiniBar label="HYPER" payoff={payoffs.pi_H} color="var(--amber)" />
        <MiniBar label="NVDA" payoff={payoffs.pi_V} color="var(--cyan)" />
        <MiniBar label="MODEL" payoff={payoffs.pi_M} color="var(--purple)" />
        <MiniBar label="DEVICE" payoff={payoffs.pi_D} color="var(--orange)" />
        <MiniBar label="SOV" payoff={payoffs.pi_Z} color="#34d399" />
        <MiniBar label="INV" payoff={payoffs.pi_I} color="#f472b6" />
        <MiniBar label="REG" payoff={payoffs.pi_R} color="#94a3b8" />
      </div>
    </div>
  );
}
