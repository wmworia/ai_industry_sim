import React, { useEffect, useRef } from 'react';
import { drawPayoffChart } from '../utils/canvas.js';

export function ChartPanel({ history, simT, tStarHit }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      drawPayoffChart(chartRef.current, history, simT, tStarHit);
    }
  }, [history, simT, tStarHit]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <span>ACTOR PAYOFF TRAJECTORIES</span>
        <span style={{ color: 'var(--cyan)', fontSize: '8px' }}>LAST 60 PERIODS</span>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f59e0b' }} />
          HYPERSCALERS
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#38bdf8' }} />
          NVIDIA/TSMC
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#a78bfa' }} />
          MODEL COS
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#fb923c' }} />
          DEVICE MFRS
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#34d399' }} />
          SOVEREIGN
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f472b6' }} />
          INVESTORS
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#94a3b8' }} />
          REGULATORS
        </div>
      </div>
      <canvas
        ref={chartRef}
        id="payoff-canvas"
        className="payoff-canvas"
      />
    </div>
  );
}
