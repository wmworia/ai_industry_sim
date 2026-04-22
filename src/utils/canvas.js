// Canvas drawing utilities for gauges and charts

export function drawGauge(canvas, pressure, tStarHit) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H * 0.62;
  const R = Math.min(W, H) * 0.37;

  ctx.clearRect(0, 0, W, H);

  const startA = Math.PI * 0.75;
  const endA = Math.PI * 2.25;
  const sweepA = endA - startA;

  // Glow effect for high pressure
  if (pressure > 0.75) {
    const grd = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.3);
    const alpha = Math.min(0.3, (pressure - 0.75) * 1.2);
    const col = pressure > 1.0 ? `rgba(239,68,68,${alpha})` : `rgba(245,158,11,${alpha})`;
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(1, col);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  // Track ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, startA, endA);
  ctx.strokeStyle = '#1a2a3f';
  ctx.lineWidth = 22;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // Zone coloring
  const zones = [
    { from: 0, to: 0.6, color: '#064e3b' },
    { from: 0.6, to: 0.85, color: '#78350f' },
    { from: 0.85, to: 1.0, color: '#7f1d1d' },
  ];
  zones.forEach(z => {
    ctx.beginPath();
    ctx.arc(cx, cy, R, startA + sweepA * z.from, startA + sweepA * z.to);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 22;
    ctx.lineCap = 'butt';
    ctx.stroke();
  });

  // Tick marks
  for (let i = 0; i <= 10; i++) {
    const a = startA + sweepA * (i / 10);
    const inner = i % 5 === 0 ? R - 30 : R - 18;
    ctx.beginPath();
    ctx.moveTo(cx + (R + 12) * Math.cos(a), cy + (R + 12) * Math.sin(a));
    ctx.lineTo(cx + inner * Math.cos(a), cy + inner * Math.sin(a));
    ctx.strokeStyle = i % 5 === 0 ? '#3a5a7f' : '#1e3a5f';
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.stroke();
  }

  // Zone labels
  ctx.font = '9px Share Tech Mono';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2d6e4a';
  ctx.fillText('STABLE', cx - R * 0.72, cy + R * 0.28);
  ctx.fillStyle = '#8a5a0a';
  ctx.fillText('WARN', cx, cy + R * 0.42);
  ctx.fillStyle = '#8a1a1a';
  ctx.fillText('CRITICAL', cx + R * 0.72, cy + R * 0.28);

  // Active arc
  const fillP = Math.min(pressure, 1.0);
  const fillA = startA + sweepA * fillP;
  const arcColor = pressure < 0.6 ? '#10b981' : pressure < 0.85 ? '#f59e0b' : '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy, R, startA, fillA);
  ctx.strokeStyle = arcColor;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Arc glow
  ctx.beginPath();
  ctx.arc(cx, cy, R, startA, fillA);
  ctx.strokeStyle = arcColor;
  ctx.lineWidth = 28;
  ctx.globalAlpha = 0.15;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Needle
  const needleA = startA + sweepA * Math.min(pressure, 1.05);
  const nLen = R * 0.82;
  ctx.save();
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 6 * Math.cos(needleA + Math.PI / 2), cy - 6 * Math.sin(needleA + Math.PI / 2));
  ctx.lineTo(cx + nLen * Math.cos(needleA), cy + nLen * Math.sin(needleA));
  ctx.lineTo(cx + 6 * Math.cos(needleA + Math.PI / 2), cy + 6 * Math.sin(needleA + Math.PI / 2));
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#2d4a6f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Pressure value
  const pct = (pressure * 100).toFixed(1);
  ctx.font = 'bold 38px Orbitron';
  ctx.textAlign = 'center';
  ctx.fillStyle = arcColor;
  ctx.shadowColor = arcColor;
  ctx.shadowBlur = 15;
  ctx.fillText(pct + '%', cx, cy - R * 0.32);
  ctx.shadowBlur = 0;

  ctx.font = '9px Share Tech Mono';
  ctx.fillStyle = '#4a6080';
  ctx.fillText('SYSTEM PRESSURE  Φ / Ω', cx, cy - R * 0.15);

  if (pressure >= 1.0) {
    ctx.font = 'bold 11px Orbitron';
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillText('⚠ T* EXCEEDED — RECONFIGURING', cx, cy + R * 0.5);
    ctx.shadowBlur = 0;
  }

  ctx.font = '8px Share Tech Mono';
  ctx.fillStyle = '#2d4a6f';
  ctx.fillText('PRESSURE VESSEL GAUGE', cx, 16);
}

const ACTOR_COLORS = {
  piH: '#f59e0b',
  piV: '#38bdf8',
  piM: '#a78bfa',
  piD: '#fb923c',
  piZ: '#34d399',
  piI: '#f472b6',
  piR: '#94a3b8'
};

const ACTOR_KEYS = ['piH', 'piV', 'piM', 'piD', 'piZ', 'piI', 'piR'];
const DISPLAY_WINDOW = 60;

export function drawPayoffChart(canvas, history, simT, tStarHit) {
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  if (W <= 0 || H <= 0) return;
  
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 12, right: 12, bottom: 28, left: 40 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  ctx.fillStyle = '#080e18';
  ctx.fillRect(pad.left, pad.top, cW, cH);

  const n = Math.min(DISPLAY_WINDOW, history.t.length);
  if (n < 2) {
    ctx.fillStyle = '#1e3a5f';
    ctx.font = '10px Share Tech Mono';
    ctx.textAlign = 'center';
    ctx.fillText('AWAITING DATA...', pad.left + cW / 2, pad.top + cH / 2);
    return;
  }

  // Find global min/max
  let globalMin = Infinity,
    globalMax = -Infinity;
  ACTOR_KEYS.forEach(k => {
    const slice = history[k].slice(-n);
    slice.forEach(v => {
      if (isFinite(v)) {
        globalMin = Math.min(globalMin, v);
        globalMax = Math.max(globalMax, v);
      }
    });
  });
  const range = globalMax - globalMin || 1;
  const pad_v = range * 0.12;
  const yMin = globalMin - pad_v;
  const yMax = globalMax + pad_v;
  const yRange = yMax - yMin;

  const toX = i => pad.left + (i / (n - 1)) * cW;
  const toY = v => pad.top + cH - ((v - yMin) / yRange) * cH;

  // Grid lines
  const nLines = 5;
  for (let i = 0; i <= nLines; i++) {
    const v = yMin + (yRange * i) / nLines;
    const y = toY(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cW, y);
    ctx.strokeStyle = 'rgba(30,58,95,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#2d4a6f';
    ctx.font = '8px Share Tech Mono';
    ctx.textAlign = 'right';
    ctx.fillText(v.toFixed(0), pad.left - 4, y + 3);
  }

  // Zero line
  if (yMin < 0 && yMax > 0) {
    const y0 = toY(0);
    ctx.beginPath();
    ctx.moveTo(pad.left, y0);
    ctx.lineTo(pad.left + cW, y0);
    ctx.strokeStyle = 'rgba(100,130,180,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw lines for each actor
  ACTOR_KEYS.forEach(k => {
    const slice = history[k].slice(-n);
    const color = ACTOR_COLORS[k];
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;
    slice.forEach((v, i) => {
      if (!isFinite(v)) return;
      const x = toX(i);
      const y = toY(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot at current end
    if (slice.length > 0 && isFinite(slice[slice.length - 1])) {
      const last = slice[slice.length - 1];
      ctx.beginPath();
      ctx.arc(toX(slice.length - 1), toY(last), 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  });

  // X axis labels
  ctx.fillStyle = '#2d4a6f';
  ctx.font = '8px Share Tech Mono';
  ctx.textAlign = 'center';
  const tStart = history.t.length > n ? history.t[history.t.length - n] : 0;
  const tEnd = simT;
  ctx.fillText('t=' + tStart, pad.left, pad.top + cH + 16);
  ctx.fillText('t=' + tEnd, pad.left + cW, pad.top + cH + 16);
  ctx.fillText('PAYOFF UNITS', pad.left + cW / 2, pad.top + cH + 22);
}
