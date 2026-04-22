import React, { useEffect, useRef } from 'react';
import { drawGauge } from '../utils/canvas.js';

export function CenterPanel({ state, tStarHit, events }) {
  const gaugeRef = useRef(null);

  useEffect(() => {
    if (gaugeRef.current && state) {
      drawGauge(gaugeRef.current, state.pressure, tStarHit);
    }
  }, [state, tStarHit]);

  if (!state) return <div className="center-panel">Initializing...</div>;

  const getNashDescription = () => {
    const { pressure } = state;
    if (pressure >= 1.0) {
      return 'Equilibrium is infeasible. Physical constraints have forced a reconfiguration. The coordination trap is resolving through physics, not consensus.';
    } else if (pressure > 0.75) {
      return 'Nash Equilibrium holds but system is near T*. Dominant strategy remains: accelerate. Deviation destroys position before relief is possible.';
    } else {
      return 'All players locked in dominant strategies. Unilateral deceleration destroys competitive position. Collective rationality remains individually irrational.';
    }
  };

  const getNashColor = () => {
    const { pressure } = state;
    if (pressure >= 1.0) return 'var(--red)';
    if (pressure > 0.75) return 'var(--amber)';
    return 'var(--text)';
  };

  return (
    <div className="center-panel">
      <canvas
        ref={gaugeRef}
        id="gauge-canvas"
        width={380}
        height={230}
        style={{ display: 'block' }}
      />

      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-label">DEMAND Φ</div>
          <div
            className="metric-value"
            style={{
              color: state.pressure > 0.85 ? 'var(--red)' : state.pressure > 0.6 ? 'var(--amber)' : 'var(--cyan)'
            }}
          >
            {state.phi.toFixed(1)}
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-label">CAPACITY Ω</div>
          <div className="metric-value" style={{ color: 'var(--cyan)' }}>
            {state.omega.toFixed(1)}
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-label">
            GPU PRICE p<sub style={{ fontSize: '10px' }}>V</sub>
          </div>
          <div className="metric-value" style={{ color: 'var(--purple)' }}>
            {state.p_V.toFixed(0)}u
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-label">EST. T*</div>
          <div className="metric-value" style={{ color: 'var(--red)' }}>
            {tStarHit ? 'HIT' : state.t_star_est !== null && state.t_star_est < 999 ? '~' + state.t_star_est : '—'}
          </div>
        </div>
      </div>

      <div className="trap-bar-container">
        <div className="trap-label">
          <span>COORDINATION TRAP INTENSITY</span>
          <span>{Math.min(100, state.trap).toFixed(0)}%</span>
        </div>
        <div className="trap-bar-bg">
          <div
            className="trap-bar-fill"
            style={{ width: `${Math.min(100, state.trap)}%` }}
          />
        </div>
      </div>

      <div className="nash-status">
        <div className="nash-title">NASH EQUILIBRIUM STATE</div>
        <div className="nash-desc" style={{ color: getNashColor() }}>
          {getNashDescription()}
        </div>
      </div>

      <div className="event-log">
        <div className="event-log-title">SYSTEM EVENT LOG</div>
        <div className="event-list">
          {events.map((event, idx) => (
            <div key={idx} className="event-item">
              <span className="event-t">t={event.t}</span>
              <span className={`event-${event.type}`}>{event.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
