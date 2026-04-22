import { useState, useCallback, useRef, useEffect } from 'react';
import { computeStep } from '../logic/simulationEngine.js';
import { getDefaultParams } from '../logic/scenarios.js';

const MAX_HISTORY = 200;

export function useSimulation() {
  const [params, setParams] = useState(getDefaultParams());
  const [simT, setSimT] = useState(0);
  const [running, setRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(800);
  const [tStarHit, setTStarHit] = useState(false);
  const prevPressureRef = useRef(0);
  const loopTimerRef = useRef(null);

  const [history, setHistory] = useState({
    t: [],
    phi: [],
    omega: [],
    pressure: [],
    gpuPrice: [],
    piH: [],
    piV: [],
    piM: [],
    piD: [],
    piZ: [],
    piI: [],
    piR: [],
    trap: []
  });

  const [currentState, setCurrentState] = useState(null);
  const [events, setEvents] = useState([]);

  const addEvent = useCallback((t, msg, type = 'info') => {
    setEvents(prev => {
      const updated = [{ t, msg, type }, ...prev];
      return updated.slice(0, 30); // Keep only 30 most recent
    });
  }, []);

  const computeCurrentState = useCallback(() => {
    const state = computeStep(params, simT, prevPressureRef.current);
    prevPressureRef.current = state.pressure;
    return state;
  }, [params, simT]);

  const simStep = useCallback(() => {
    const state = computeCurrentState();
    
    // Record history
    setHistory(prev => {
      const updated = {
        t: [...prev.t, simT],
        phi: [...prev.phi, state.phi],
        omega: [...prev.omega, state.omega],
        pressure: [...prev.pressure, state.pressure],
        gpuPrice: [...prev.gpuPrice, state.p_V],
        piH: [...prev.piH, state.pi_H],
        piV: [...prev.piV, state.pi_V],
        piM: [...prev.piM, state.pi_M],
        piD: [...prev.piD, state.pi_D],
        piZ: [...prev.piZ, state.pi_Z],
        piI: [...prev.piI, state.pi_I],
        piR: [...prev.piR, state.pi_R],
        trap: [...prev.trap, state.trap]
      };

      // Trim history if too large
      Object.keys(updated).forEach(k => {
        if (updated[k].length > MAX_HISTORY) {
          updated[k] = updated[k].slice(-MAX_HISTORY);
        }
      });

      return updated;
    });

    // Check for events
    if (state.pressure > 0.5 && state.pressure <= 0.55 && history.pressure.length < 3) {
      addEvent(simT, 'System pressure crossing 50%. Coordination trap intensifying.', 'warn');
    }
    if (state.pressure > 0.75 && history.pressure[history.pressure.length - 2] <= 0.75) {
      addEvent(simT, 'PRESSURE EXCEEDS 75% — Critical threshold breached.', 'warn');
    }
    if (state.pressure > 0.9 && history.pressure[history.pressure.length - 2] <= 0.9) {
      addEvent(simT, 'PRESSURE > 90% — Reconfiguration imminent.', 'danger');
    }
    if (state.shortfall > 50 && simT % 10 === 0) {
      addEvent(simT, `Model co. revenue shortfall: ${state.shortfall.toFixed(0)} units. Moving denominator widening.`, 'warn');
    }
    if (state.p_V > 60 && simT % 15 === 0) {
      addEvent(simT, `GPU price at ${state.p_V.toFixed(0)}u — supply bottleneck deepening.`, 'warn');
    }
    if (state.pi_M < -20 && simT % 12 === 0) {
      addEvent(simT, `Model companies posting losses: π_M = ${state.pi_M.toFixed(1)}`, 'danger');
    }
    if (params.device_mode === 1 && simT === 1) {
      addEvent(simT, 'Device manufacturers executing edge-exit strategy. Cloud dependency decoupling.', 'good');
    }
    if (params.regulator_stance === 2 && simT === 1) {
      addEvent(simT, 'Regulatory freeze active — grid expansion halted. T* accelerating.', 'danger');
    }

    // T* event
    if (state.pressure >= 1.0 && !tStarHit) {
      setTStarHit(true);
      addEvent(simT, '⚠ T* REACHED — Physical constraints exceed capacity. System reconfiguration.', 'danger');
    }

    setCurrentState(state);
    setSimT(prev => prev + 1);
  }, [params, simT, history.pressure, tStarHit, computeCurrentState, addEvent]);

  const toggleRun = useCallback(() => {
    setRunning(prev => !prev);
  }, []);

  // Handle simulation loop
  useEffect(() => {
    if (!running) {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
      }
      return;
    }

    const scheduleNext = () => {
      loopTimerRef.current = setTimeout(() => {
        simStep();
        scheduleNext();
      }, simSpeed);
    };

    scheduleNext();
    addEvent(simT, 'Simulation started.', 'info');

    return () => {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
      }
    };
  }, [running, simSpeed, simStep, addEvent, simT]);

  const reset = useCallback(() => {
    setRunning(false);
    clearTimeout(loopTimerRef.current);
    setSimT(0);
    setTStarHit(false);
    prevPressureRef.current = 0;
    setHistory({
      t: [],
      phi: [],
      omega: [],
      pressure: [],
      gpuPrice: [],
      piH: [],
      piV: [],
      piM: [],
      piD: [],
      piZ: [],
      piI: [],
      piR: [],
      trap: []
    });
    setEvents([]);
    const initialState = computeStep(params, 0, 0);
    setCurrentState(initialState);
    addEvent(0, 'Simulation reset. Parameters retained.', 'info');
  }, [params, addEvent]);

  const updateParam = useCallback((key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const loadScenario = useCallback((scenarioParams) => {
    setParams(scenarioParams);
    reset();
  }, [reset]);

  // Initialize on mount
  useEffect(() => {
    const initialState = computeCurrentState();
    setCurrentState(initialState);
    addEvent(0, 'System initialized. Status Quo scenario loaded. Press RUN to begin.', 'info');
  }, []);

  return {
    params,
    simT,
    running,
    simSpeed,
    tStarHit,
    history,
    currentState,
    events,
    updateParam,
    toggleRun,
    reset,
    setSimSpeed,
    loadScenario,
    computeCurrentState
  };
}
