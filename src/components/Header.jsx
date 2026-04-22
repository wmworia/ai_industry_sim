import React from 'react';
import { SCENARIOS } from '../logic/scenarios.js';

export function Header({ simT, tStarHit, tStarEst, pressure, loadScenario, status }) {
  const handleScenarioClick = (scenarioKey) => {
    const scenario = SCENARIOS[scenarioKey];
    loadScenario(scenario);
  };

  return (
    <div className="header">
      <div>
        <div className="header-title">⊕ THE PRESSURE VESSEL</div>
        <div className="subtitle">AI ECOSYSTEM · GAME THEORY SIMULATOR</div>
      </div>
      
      <div className={`status-pill status-${status}`}>
        {status === 'critical' ? 'CRITICAL' : status === 'warning' ? 'WARNING' : 'STABLE'}
      </div>

      <div className="scenario-btns">
        <button 
          className="scenario-btn" 
          onClick={() => handleScenarioClick('status_quo')}
          title="Status Quo — Nash Equilibrium baseline"
        >
          STATUS QUO
        </button>
        <button 
          className="scenario-btn"
          onClick={() => handleScenarioClick('supply_surge')}
          title="Supply Surge — Nvidia/TSMC expansion"
        >
          SUPPLY SURGE
        </button>
        <button 
          className="scenario-btn"
          onClick={() => handleScenarioClick('reg_freeze')}
          title="Regulatory Freeze — Grid expansion halted"
        >
          REG FREEZE
        </button>
        <button 
          className="scenario-btn"
          onClick={() => handleScenarioClick('inv_pullback')}
          title="Investor Pullback — Confidence collapse"
        >
          INV. PULLBACK
        </button>
        <button 
          className="scenario-btn"
          onClick={() => handleScenarioClick('sovereign_surge')}
          title="Sovereign Surge — Nations stockpile compute"
        >
          SOVEREIGN SURGE
        </button>
      </div>

      <div className="time-display">
        T = <span>{simT}</span>
      </div>

      <div className={`t-star-display ${tStarHit || tStarEst < 15 ? 'near' : ''}`}>
        {tStarHit ? 'T* REACHED' : tStarEst ? `T* EST: ~${tStarEst} PERIODS` : 'T* EST: —'}
      </div>
    </div>
  );
}
