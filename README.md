# The Pressure Vessel — AI Ecosystem Game Theory Simulator

This project was inspired by this article by Productics by Igor
https://substack.com/home/post/p-188791056


The underlying logic: https://claude.ai/share/f491f99d-1c1b-4ec3-8c26-2869c753687e


## Project Structure

```
src/
├── App.jsx                          # Main application component
├── index.jsx                        # React entry point
├── index.css                        # Global styles
│
├── components/                      # Presentation Layer - UI Components
│   ├── Header.jsx                  # Header with title, scenarios, time display
│   ├── ControlPanel.jsx            # Left panel with actor parameters
│   ├── CenterPanel.jsx             # Center panel with gauge, metrics, events
│   ├── ChartPanel.jsx              # Right panel with payoff chart
│   ├── Footer.jsx                  # Bottom panel with controls and mini bars
│   └── ReconfigModal.jsx           # T* reached notification modal
│
├── hooks/                           # Custom React Hooks
│   └── useSimulation.js            # Main simulation state management hook
│
├── logic/                           # Logic Layer - Business Rules
│   ├── simulationEngine.js         # Core game theory calculations
│   ├── scenarios.js                # Scenario definitions
│   └── payoffCalculations.js       # (combined into simulationEngine.js)
│
├── utils/                           # Utilities
│   ├── canvas.js                   # Canvas drawing functions (gauge, chart)
│   └── formatters.js               # Text formatting utilities
│
└── styles/                          # Stylesheets
    ├── variables.css               # CSS custom properties and tokens
    ├── layout.css                  # Layout structure styles
    └── components.css              # Component-specific styles
```

## Architecture

### Presentation Layer (`/components`)
- **Stateless components** that receive data via props
- Responsible for rendering UI elements
- Uses CSS classes for styling
- Delegates logic to parent/hooks

### Logic Layer (`/logic`)
- **Pure functions** for game theory calculations
- No React dependencies
- Testable and reusable
- Exports computation functions

### State Management (`/hooks`)
- `useSimulation()` - Central hook managing simulation state
- Handles: Params, time, history, events, running state
- Orchestrates simulation loop and parameter updates
- Maintains separation from UI rendering

### Utilities (`/utils`)
- Canvas rendering functions (gauge and payoff chart)
- Formatting helpers
- Reusable non-business logic

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts Vite dev server on http://localhost:3000

### Build

```bash
npm run build
```

Produces optimized production build in `/dist`

### Preview

```bash
npm run preview
```

## Key Features

- **Separated Concerns**: Logic, state, and UI are cleanly separated
- **React Hooks**: Uses `useState` and `useEffect` for state management
- **Canvas Graphics**: Custom gauge and payoff chart rendering
- **Real-time Simulation**: Configurable speed (1x, 3x, 8x)
- **7 Actor Model**: Hyperscalers, NVIDIA/TSMC, Model Companies, Device Makers, Sovereigns, Investors, Regulators
- **Game Theory**: Nash Equilibrium, coordination traps, payoff calculations

## Component Data Flow

```
App
├── useSimulation() [State Management]
│   ├── params
│   ├── simT
│   ├── running
│   ├── currentState
│   ├── history
│   └── events
│
├── Header
│   └── Displays: Title, scenarios, time, T* estimate, system status
│
├── ControlPanel
│   └── Updates: All game parameters via updateParam()
│
├── CenterPanel
│   ├── Renders: Gauge, metrics, trap bar, Nash status, event log
│   └── Inputs: state (pressure, phi, omega, payoffs, etc.)
│
├── ChartPanel
│   ├── Renders: Payoff trajectories for all actors
│   └── Inputs: history, simT
│
└── Footer
    ├── Controls: Run/Pause, Reset, Speed selection
    └── Displays: Mini payoff bars
```

## Simulation Loop

The `useSimulation()` hook:

1. Maintains params and current state
2. On start: `toggleRun()` enables the loop
3. Loop fires every `simSpeed` ms
4. Each step: `simStep()` calls `computeStep()` from logic layer
5. Updates: history, events, currentState
6. UI re-renders on state changes

## Customization

### Add New Scenario

In `/logic/scenarios.js`:
```javascript
export const SCENARIOS = {
  my_scenario: {
    capex_base: 70,
    capex_growth: 6,
    // ... other params
    label: 'My Scenario Description'
  }
};
```

### Modify Payoff Calculations

Edit `/logic/simulationEngine.js` `calculatePayoffs()` function:
```javascript
function calculatePayoffs(state) {
  // Modify π_H, π_V, π_M, etc.
}
```

### Add New Metrics

1. Add to `computeStep()` return object in simulationEngine.js
2. Add to history in useSimulation.js
3. Display in CenterPanel.jsx

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2020+ JavaScript support (top-level await, optional chaining, etc.)
