import React, { useState } from 'react';

export function ControlPanel({ params, payoffs, updateParam }) {
  const [collapsedCards, setCollapsedCards] = useState({
    h: false,
    v: true,
    m: true,
    d: true,
    z: true,
    i: true,
    r: true
  });

  const toggleCard = (id) => {
    setCollapsedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPayoffColor = (payoff) => {
    return payoff > 3 ? 'payoff-pos' : payoff < -3 ? 'payoff-neg' : 'payoff-neutral';
  };

  const ActorCard = ({ id, icon, name, paramKey = null, controls }) => (
    <div className="actor-card">
      <div className="actor-header" onClick={() => toggleCard(id)}>
        <span className="actor-icon">{icon}</span>
        <span className="actor-name">{name}</span>
        <span className={`actor-payoff ${getPayoffColor(payoffs[paramKey] || 0)}`}>
          {paramKey && payoffs[paramKey] ? (payoffs[paramKey] >= 0 ? '+' : '') + payoffs[paramKey].toFixed(1) : '—'}
        </span>
      </div>
      {!collapsedCards[id] && controls}
    </div>
  );

  const ControlRow = ({ label, paramKey, min, max, step = 1, unit = '' }) => (
    <div className="control-row">
      <div className="control-label">
        {label} <span>{params[paramKey]}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[paramKey]}
        onChange={(e) => updateParam(paramKey, parseFloat(e.target.value))}
      />
    </div>
  );

  const ToggleGroup = ({ options, value, onChange }) => (
    <div className="toggle-group">
      {options.map((opt, idx) => (
        <button
          key={idx}
          className={`toggle-btn ${value === idx ? 'active' : ''}`}
          onClick={() => onChange(idx)}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="control-panel">
      {/* Hyperscalers */}
      <ActorCard id="h" icon="🏢" name="HYPERSCALERS" paramKey="piH" controls={
        <div className="actor-controls">
          <ControlRow label="CAPEX BASE LEVEL" paramKey="capex_base" min={10} max={100} />
          <ControlRow label="CAPEX GROWTH RATE" paramKey="capex_growth" min={0} max={15} unit="%/period" />
          <ControlRow label="NARRATIVE PENALTY λ" paramKey="lambda_H" min={5} max={80} />
          <div className="impact-note">↑ Growth rate accelerates Φ and T*. ↑ Narrative penalty locks in commitment inertia.</div>
        </div>
      } />

      {/* Nvidia/TSMC */}
      <ActorCard id="v" icon="🔲" name="NVIDIA / TSMC" paramKey="piV" controls={
        <div className="actor-controls">
          <ControlRow label="SUPPLY ALLOCATION" paramKey="supply_level" min={10} max={100} />
          <ControlRow label="SUPPLY GROWTH RATE" paramKey="supply_growth" min={0} max={10} unit="/period" />
          <div className="impact-note">↑ Supply expands Ω and delays T*. GPU price falls as demand/supply ratio tightens.</div>
        </div>
      } />

      {/* Model Companies */}
      <ActorCard id="m" icon="🤖" name="MODEL COS (OpenAI)" paramKey="piM" controls={
        <div className="actor-controls">
          <ControlRow label="VALUATION MULTIPLE" paramKey="revenue_mult" min={5} max={100} unit="x" />
          <ControlRow label="COMPUTE SPEND INTENSITY" paramKey="compute_intensity" min={10} max={100} />
          <div className="impact-note">↑ Multiple widens the moving denominator gap. ↑ Compute spend increases Φ and operating losses.</div>
        </div>
      } />

      {/* Device Manufacturers */}
      <ActorCard id="d" icon="📱" name="DEVICE MFRs" paramKey="piD" controls={
        <div className="actor-controls">
          <div className="control-label" style={{ marginBottom: '6px' }}>STRATEGIC MODE</div>
          <ToggleGroup
            options={['CLOUD DEPENDENT', 'EDGE EXIT']}
            value={params.device_mode}
            onChange={(val) => updateParam('device_mode', val)}
          />
          <ControlRow label="EDGE TRANSITION PROGRESS" paramKey="edge_progress" min={0} max={100} unit="%" />
          <div className="impact-note">Edge exit reduces cloud demand pressure. Transition incurs temporary payoff cost before stabilizing.</div>
        </div>
      } />

      {/* Sovereign Actors */}
      <ActorCard id="z" icon="🌐" name="SOVEREIGN ACTORS" paramKey="piZ" controls={
        <div className="actor-controls">
          <ControlRow label="ACQUISITION INTENSITY" paramKey="sovereign_rate" min={0} max={100} />
          <ControlRow label="STRATEGIC HORIZON" paramKey="sov_horizon" min={5} max={50} unit=" periods" />
          <div className="impact-note">↑ Acquisition rate adds to Φ and GPU demand, raising Nvidia pricing and accelerating T*.</div>
        </div>
      } />

      {/* Investors */}
      <ActorCard id="i" icon="💰" name="INVESTORS" paramKey="piI" controls={
        <div className="actor-controls">
          <ControlRow label="CONFIDENCE / VALUATION" paramKey="investor_val" min={10} max={100} />
          <ControlRow label="RISK TOLERANCE" paramKey="inv_risk" min={5} max={95} />
          <div className="impact-note">↓ Confidence triggers the moving denominator collapse. Low risk tolerance amplifies reconfiguration exposure ξ.</div>
        </div>
      } />

      {/* Regulators */}
      <ActorCard id="r" icon="⚡" name="REGULATORS / UTILITIES" paramKey="piR" controls={
        <div className="actor-controls">
          <div className="control-label" style={{ marginBottom: '6px' }}>REGULATORY STANCE</div>
          <ToggleGroup
            options={['APPROVE', 'RESTRICT', 'FREEZE']}
            value={params.regulator_stance}
            onChange={(val) => updateParam('regulator_stance', val)}
          />
          <ControlRow label="GRID EXPANSION RATE" paramKey="grid_growth" min={0} max={8} step={0.5} unit="/period" />
          <div className="impact-note">FREEZE reduces Ω growth, directly accelerating T*. Highest leverage of any single actor on system stability.</div>
        </div>
      } />
    </div>
  );
}
