// Logic Layer: Core Simulation Engine
// Handles all game theory calculations and state evolution

export function computeStep(params, simT, prevPressure = 0) {
  const p = params;

  // Capex evolves with commitment inertia
  const capex_t = Math.min(150, p.capex_base * (1 + (p.capex_growth / 100) * simT));

  // Supply evolves (grows but slower than demand)
  const supply_t = Math.min(120, p.supply_level + p.supply_growth * simT * 0.5);

  // Model company compute demand (scales with capex and multiple)
  const compute_demand = capex_t * 0.5 * (p.compute_intensity / 60) * (p.revenue_mult / 42);

  // Sovereign demand
  const sov_demand = p.sovereign_rate * (1 + simT / (p.sov_horizon * 2));

  // PHYSICAL DEMAND Φ = α·s_H + β·compute_demand + γ·s_Z
  const alpha = 0.42, beta = 0.28, gamma = 0.30;
  const phi = alpha * capex_t + beta * compute_demand + gamma * sov_demand;

  // PHYSICAL CAPACITY Ω: grows with grid expansion, moderated by regulator
  let grid_eff = p.grid_growth;
  if (p.regulator_stance === 1) grid_eff *= 0.4;
  if (p.regulator_stance === 2) grid_eff = -0.5;
  const omega_base = 50 + grid_eff * simT;
  // Supply expansion also contributes to effective omega
  const omega = Math.max(20, omega_base + supply_t * 0.2);

  const pressure = phi / Math.max(omega, 1);

  // GPU price: function of demand/supply ratio
  const gpu_demand = capex_t + sov_demand;
  const p_V = 20 * Math.pow(Math.max(gpu_demand / Math.max(supply_t, 1), 0.5), 1.3);

  // Calculate all payoffs
  const payoffs = calculatePayoffs({
    t: simT,
    capex_t,
    supply_t,
    compute_demand,
    sov_demand,
    phi,
    omega,
    pressure,
    p_V,
    params: p
  });

  // Coordination trap intensity (0–100)
  const trap = Math.min(100, pressure * 70 + (p.lambda_H / 80) * 30);

  // T* estimate
  const dp = pressure - prevPressure;
  const t_star_est = dp > 0.001 ? Math.max(0, Math.round((1.0 - pressure) / dp)) : null;

  return {
    t: simT,
    capex_t,
    supply_t,
    phi,
    omega,
    pressure,
    p_V,
    ...payoffs,
    trap,
    t_star_est,
    R_actual: payoffs.R_actual,
    R_required: payoffs.R_required,
    shortfall: payoffs.shortfall
  };
}

function calculatePayoffs(state) {
  const { t, capex_t, supply_t, compute_demand, sov_demand, phi, omega, pressure, p_V, params: p } = state;

  // Hyperscalers π_H
  const ai_rev_H = capex_t * (p.revenue_mult / 42) * 0.8;
  const capex_cost_H = capex_t * capex_t * 0.006;
  const expected_capex = p.capex_base * (1 + 0.09 * t);
  const narrative_pen = capex_t < expected_capex * 0.9
    ? p.lambda_H * (expected_capex - capex_t) * 0.05 : 0;
  const pi_H = ai_rev_H - capex_cost_H - narrative_pen;

  // Nvidia/TSMC π_V
  const gpu_margin = Math.max(0, p_V - 18);
  const pi_V = gpu_margin * supply_t * 0.35;

  // Model Companies π_M
  const R_actual = p.revenue_mult * capex_t * 0.015;
  const R_required = p.revenue_mult * Math.pow(1.93, t * 0.08);
  const shortfall = Math.max(0, R_required - R_actual);
  const compute_cost_M = p_V * compute_demand * 0.008;
  const inv_premium = (p.investor_val / 100) * R_actual * 0.4;
  const pi_M = inv_premium - compute_cost_M - shortfall * 0.25;

  // Device Manufacturers π_D
  let pi_D;
  if (p.device_mode === 1) {
    const ep = p.edge_progress / 100;
    pi_D = -15 * (1 - ep) + 40 * ep - pressure * 5 * (1 - ep);
  } else {
    pi_D = capex_t * 0.2 - pressure * 30;
  }

  // Sovereign Actors π_Z
  const scarcity_mult = Math.min(2.5, pressure * 1.3);
  const pi_Z = p.sovereign_rate * scarcity_mult * 1.5 - p_V * p.sovereign_rate * 0.02;

  // Investors π_I
  const rev_growth = R_actual / Math.max(p.revenue_mult * 0.8, 1);
  const reconfig_hit = pressure > 1.0 ? -(100 - p.inv_risk) * 0.8 : 0;
  const valuation_gain = (p.investor_val / 100) * rev_growth * 30;
  const pi_I = valuation_gain + reconfig_hit - pressure * 8;

  // Regulators π_R
  const grid_stability = 40 * (omega / (omega + 20));
  const overload = pressure > 1.0 ? -100 * (pressure - 1.0) : 0;
  const pi_R = grid_stability + overload;

  return {
    pi_H, pi_V, pi_M, pi_D, pi_Z, pi_I, pi_R,
    R_actual, R_required, shortfall
  };
}
