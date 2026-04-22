import React, { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { CenterPanel } from './components/CenterPanel';
import { ChartPanel } from './components/ChartPanel';
import { Footer } from './components/Footer';
import { ReconfigModal } from './components/ReconfigModal';

import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';

export function App() {
  const sim = useSimulation();
  const [reconfigDismissed, setReconfigDismissed] = useState(false);

  const getStatus = () => {
    if (!sim.currentState) return 'stable';
    const { pressure } = sim.currentState;
    if (pressure >= 1.0) return 'critical';
    if (pressure > 0.75) return 'critical';
    if (pressure > 0.5) return 'warning';
    return 'stable';
  };

  const handleDismissReconfig = () => {
    setReconfigDismissed(true);
  };

  return (
    <div className="app-container">
      <Header
        simT={sim.simT}
        tStarHit={sim.tStarHit && !reconfigDismissed}
        tStarEst={sim.currentState?.t_star_est}
        pressure={sim.currentState?.pressure}
        loadScenario={sim.loadScenario}
        status={getStatus()}
      />

      <div className="main">
        <ControlPanel
          params={sim.params}
          payoffs={
            sim.currentState
              ? {
                  piH: sim.currentState.pi_H,
                  piV: sim.currentState.pi_V,
                  piM: sim.currentState.pi_M,
                  piD: sim.currentState.pi_D,
                  piZ: sim.currentState.pi_Z,
                  piI: sim.currentState.pi_I,
                  piR: sim.currentState.pi_R
                }
              : {}
          }
          updateParam={sim.updateParam}
        />

        <CenterPanel
          state={sim.currentState}
          tStarHit={sim.tStarHit}
          events={sim.events}
        />

        <ChartPanel
          history={sim.history}
          simT={sim.simT}
          tStarHit={sim.tStarHit}
        />
      </div>

      <Footer
        running={sim.running}
        simSpeed={sim.simSpeed}
        toggleRun={sim.toggleRun}
        reset={sim.reset}
        setSimSpeed={sim.setSimSpeed}
        payoffs={
          sim.currentState
            ? {
                pi_H: sim.currentState.pi_H,
                pi_V: sim.currentState.pi_V,
                pi_M: sim.currentState.pi_M,
                pi_D: sim.currentState.pi_D,
                pi_Z: sim.currentState.pi_Z,
                pi_I: sim.currentState.pi_I,
                pi_R: sim.currentState.pi_R
              }
            : {}
        }
      />

      <ReconfigModal
        tStarHit={sim.tStarHit && !reconfigDismissed}
        onDismiss={handleDismissReconfig}
      />
    </div>
  );
}

export default App;
