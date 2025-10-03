# Gamepad Control Module – Cross‑Project Plan (Auto‑Activation, Cursor Ownership, GCM Directory)

## Goals

- Automatically enable gamepad control when any gamepad movement or button press is detected.
- Allow pointer movement via D‑pad and/or left stick.
- Map the “south/A” button to primary click.
- Implement input source ownership: the last active input (mouse or gamepad) controls the on‑screen pointer until the other input moves again.
- Make the module framework‑agnostic and easily reusable across projects.

## Feasibility

- This is fully feasible as a self‑contained, copy‑pasteable module. Browsers cannot move the OS cursor; we implement ownership using a virtual cursor overlay, synthetic mouse events, and automatic activation on gamepad input. The module can live entirely under `./src/modules/GCM` and be imported from `App.js` with no external dependencies (aside from React for the React adapter).

## Important Feasibility Note

- Browsers do not allow web pages to move the system (OS) mouse cursor programmatically. To “take control” of cursor behavior, we render a high‑z‑index virtual cursor overlay and dispatch synthetic mouse events to DOM elements under that cursor.
- When gamepad becomes active, we hide the OS cursor (`cursor: none`) and position the virtual cursor at the last known OS cursor location so control feels continuous.
- When the user moves the mouse, ownership switches back: we show the OS cursor and pause the virtual cursor.

## Design Principles

- Framework‑agnostic core with adapters for React and vanilla DOM.
- Auto‑activation: no UI toggle. The controller wakes on first detected gamepad input and sleeps when mouse movement resumes.
- Non‑intrusive: no changes required to existing components; works globally via synthetic events.
- Accessibility‑aware: consistent focus management and visible virtual cursor; respects user preferences.
- Graceful degradation on browsers lacking the Gamepad API.

## High‑Level Architecture

- Core library (`GCM`): pure JS/TS module that handles gamepad detection, input normalization, ownership arbitration, and emits high‑level actions.
- Drivers:
  - Pointer Driver: manages a virtual cursor overlay, hides/shows OS cursor, and dispatches synthetic mouse events (`mousemove`, `mousedown`, `mouseup`, `click`).
  - Focus Driver: navigates focusable elements when pointer use is not desired or in accessibility mode.
- Adapters:
  - React Hook/Provider (`useGamepadControl`, `GamepadControlProvider`).
  - Vanilla init (`initGCM({ ...config })`).

## GCM Directory Structure (Copy‑Paste Friendly)

- `src/modules/GCM/`
  - `index.js` (central entry)
    - Re‑exports public API: `GamepadController`, `initGCM`, `GamepadControlProvider`, `useGamepadControl`, `CursorOverlay`.
  - `core/GamepadController.js` (or `.ts`)
    - Handles Gamepad API polling, normalization, ownership arbitration, events.
  - `drivers/PointerDriver.js`
    - Virtual cursor overlay, OS cursor hide/show, synthetic mouse events.
  - `drivers/FocusDriver.js`
    - Directional focus navigation.
  - `adapters/react/GamepadControlProvider.jsx`
  - `adapters/react/useGamepadControl.js`
  - `adapters/react/CursorOverlay.jsx`
  - `adapters/vanilla/initGCM.js`
  - `styles/gcm.css`
    - Namespaced styles for virtual cursor (e.g., `.gcm-cursor`), high contrast.
  - `utils/eventDispatch.js`, `utils/geometry.js`
    - Helpers for synthetic events and directional calculations.
  - `__tests__/` (optional, colocated tests for unit/integration)

This structure keeps everything self‑contained. Projects can copy `src/modules/GCM` into their codebase and import from `modules/GCM` without additional setup.

## Input Source Ownership Arbitration

- Ownership is determined by the most recent input activity:
  - On gamepad movement or button press → ownership: `gamepad`.
  - On mouse move or wheel → ownership: `mouse`.
- Ownership transitions:
  - `mouse → gamepad`: hide OS cursor, show virtual cursor at last mouse coordinates.
  - `gamepad → mouse`: show OS cursor, pause virtual cursor updates and synthetic events.
- Configurable hysteresis (e.g., small timeout) to avoid rapid flickering during simultaneous inputs.

## Core Module API (ESM)

- `class GamepadController(config?: GamepadConfig)`
  - `start()`: begin polling via `requestAnimationFrame` (module remains dormant until gamepad activity).
  - `stop()`: stop polling and clean up.
  - `on(event, handler)`: subscribe to actions (`pointerMove`, `click`, `navigate`, `ownershipChange`, `connected`, `disconnected`).
  - `off(event, handler)`: unsubscribe.
  - `setConfig(partial: Partial<GamepadConfig>)`: update runtime config.
  - `getState()`: returns current ownership, cursor position, connected gamepads, etc.

- `type GamepadConfig` (key options)
  - `axes`: mapping (e.g., `{ leftX: 0, leftY: 1, rightX: 2, rightY: 3 }`).
  - `buttons`: mapping (e.g., `{ south: 0, east: 1, west: 2, north: 3 }`).
  - `useDPad`: boolean to treat d‑pad as digital pointer movement.
  - `deadzone`: number (default `0.15`).
  - `sensitivity`: number (pixels per frame per axis unit).
  - `pointerEnabled`: boolean (default `true`).
  - `focusEnabled`: boolean (default `true`).
  - `clickMode`: `'tap' | 'press-release'`.
  - `devicePreference`: `'last-connected' | 'first' | number`.
  - `pauseWhenHidden`: boolean (default `true`).
  - `ownershipHysteresisMs`: number to reduce rapid toggling (default `75`).

## Public Entry Points (for Consumers)

- `import { GamepadController, initGCM } from './modules/GCM'`
- `import { GamepadControlProvider, useGamepadControl } from './modules/GCM'`
- `import './modules/GCM/styles/gcm.css'` (optional if provider injects styles automatically)

## Input Normalization & Polling

- Use `navigator.getGamepads()` in a `requestAnimationFrame` loop; bail out if not supported.
- Track connected/disconnected state; emit events accordingly.
- Normalize axes values with deadzone and optional curve; cap to `[-1, 1]`.
- D‑pad maps to cardinal directions; axes movement drives pointer deltas.
- Auto‑activation: controller is running but inactive until non‑zero axis or button press.

## Pointer Driver

- Virtual cursor element (`position: fixed; z-index: 2147483647;`) with customizable theme.
- Maintain cursor position in screen coordinates; clamp within viewport.
- On `ownership: gamepad` and `pointerMove(dx, dy)`: update position and dispatch `mousemove` if `pointerEnabled`.
- On `ownership: gamepad` and `click`: compute target with `document.elementFromPoint(x, y)` and dispatch synthetic mouse events:
  - `mousedown` → `mouseup` → `click` with `{ bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 }`.
- Ownership transitions:
  - `mouse → gamepad`: set virtual cursor to last known mouse `clientX/clientY`, hide OS cursor globally (`document.documentElement.style.cursor = 'none'`).
  - `gamepad → mouse`: show OS cursor, pause virtual cursor updates.
- Optional throttle for `mousemove` to avoid event floods.

## Focus Driver

- When `focusEnabled`, map d‑pad to focus navigation.
- Strategy:
  - Collect focusable elements (`[tabindex], a[href], button, input, select, textarea, [role="button"]`).
  - Compute nearest in direction using bounding boxes and angle threshold.
  - Fallback to dispatching arrow key events if needed.
  - Ensure `focus-visible` styling remains consistent.

## Click Mapping

- “south/A” button triggers primary click.
- Optional long‑press support for context menu (right click) via “east/B” or config.
- Debounce and press/release modes to avoid accidental double clicks.

## React Integration

- `GamepadControlProvider` initializes `GamepadController`, mounts Pointer/Focus drivers, and exposes state via context.
- `useGamepadControl()` returns state like `ownership` (`'mouse' | 'gamepad'`), connected gamepads, cursor position, and `setConfig()`.
- No UI toggle; the provider auto‑activates on gamepad input and deactivates on mouse movement.
- Import pattern (copy‑paste friendly):

```jsx
// src/App.js
import { GamepadControlProvider } from './modules/GCM';
import './modules/GCM/styles/gcm.css'; // if not auto‑injected

export default function App() {
  return (
    <GamepadControlProvider config={{ useDPad: true, sensitivity: 12 }}>
      {/* existing app */}
    </GamepadControlProvider>
  );
}
```

## Vanilla Integration

- `initGCM(config)` returns a controller instance and teardown function.
- The controller auto‑activates on first gamepad input and deactivates on mouse movement.
- Mounts cursor overlay to `document.body`.
- Import pattern (copy‑paste friendly):

```js
import { initGCM } from './modules/GCM';
import './modules/GCM/styles/gcm.css'; // if not auto‑injected

const { controller, teardown } = initGCM({
  useDPad: true,
  sensitivity: 10,
  pointerEnabled: true,
});

// controller.start() may be called immediately; it stays dormant until gamepad input.
```

## Packaging & Distribution

- Source in `src/modules/GCM/` (TS recommended for typings).
- Primary distribution model: copy‑paste module directory into any project.
- Optional: build with Vite/Rollup if publishing to npm.
  - Outputs: `esm`, `cjs`, `umd` bundles in `dist/`.
  - Include `.d.ts` for TypeScript consumers.
- Avoid external dependencies; React is only required for the React adapter.

## Configuration Example (React)

```jsx
// src/App.js
import { GamepadControlProvider } from './modules/GCM';
import './modules/GCM/styles/gcm.css';

export default function App() {
  return (
    <GamepadControlProvider config={{ useDPad: true, sensitivity: 12 }}>
      {/* existing app */}
    </GamepadControlProvider>
  );
}
```

## Configuration Example (Vanilla)

```js
import { initGCM } from './modules/GCM';
import './modules/GCM/styles/gcm.css';

const { controller, teardown } = initGCM({
  useDPad: true,
  sensitivity: 10,
  pointerEnabled: true,
});

// controller.start() may be called immediately; it will stay dormant until gamepad input is detected.
```

## Accessibility & UX Considerations

- Respect `prefers-reduced-motion`; reduce cursor animation rate when enabled.
- Auto‑activation; no UI toggle is provided.
- Pause pointer while typing or when an input is focused to avoid interference.
- Provide high‑contrast cursor theme options.

## Performance & Safety

- Use a single `requestAnimationFrame` loop; pause when `document.hidden` if configured.
- Throttle `mousemove` dispatch to avoid event floods.
- Guard against cross‑origin iframes (do not dispatch into them).

## Testing Strategy

- Unit tests: axis normalization, deadzone, ownership arbitration, event emission.
- Integration tests (browser): mock `navigator.getGamepads`; verify synthetic events fire on elements; test ownership transitions on mouse move vs gamepad input.
- Manual demo page under `public/` that displays gamepad state, ownership status, and cursor behavior.

## Implementation Steps (for this repo)

Each step is limited to modifying a maximum of two files. Use the checkboxes to track progress.

- [X] Scaffold module entry and base styles (Files: `src/modules/GCM/index.js`, `src/modules/GCM/styles/gcm.css`)
  - Create `index.js` with stubs and public exports.
  - Add namespaced CSS for virtual cursor.

- [X] Add core controller skeleton (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/index.js`)
  - Create `GamepadController` with init/start/stop and empty event system.
  - Export controller from `index.js`.

- [X] Add Pointer Driver scaffold (Files: `src/modules/GCM/drivers/PointerDriver.js`, `src/modules/GCM/index.js`)
  - Create driver with virtual cursor element creation/removal methods.
  - Export driver from `index.js`.

- [X] Add Focus Driver scaffold (Files: `src/modules/GCM/drivers/FocusDriver.js`, `src/modules/GCM/index.js`)
  - Create driver with focusable element collection utilities.
  - Export driver from `index.js`.

- [X] Add vanilla adapter init (Files: `src/modules/GCM/adapters/vanilla/initGCM.js`, `src/modules/GCM/index.js`)
  - Provide `initGCM(config)` that wires controller + drivers.
  - Export adapter from `index.js`.

- [X] Add React Provider component (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/index.js`)
  - Create context/provider; mount drivers; expose state.
  - Export provider from `index.js`.

- [X] Add SSR safety for adapters (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/adapters/vanilla/initGCM.js`)
  - Guard `window`/`document` usage; no-op on server render.
  - Mount overlays and start controller only in client environments.

- [X] Add SSR safety for core/drivers (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/drivers/PointerDriver.js`)
  - Skip RAF loop and navigator access when `typeof window === 'undefined'`.
  - Avoid DOM mutations if `document` is unavailable.

- [X] Implement Provider style injection (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/styles/gcm.css`)
  - Auto-inject `.gcm-cursor` styles on provider mount (idempotent; no duplicates).
  - Allow opting out via config to use manual CSS import instead.

 - [X] Implement pointer movement and synthetic events (Files: `src/modules/GCM/drivers/PointerDriver.js`, `src/modules/GCM/utils/eventDispatch.js`)
  - Calculate cursor deltas, clamp viewport, dispatch `mousemove/mousedown/mouseup/click`.
  - Add helper to safely dispatch events to `elementFromPoint`.

- [x] Implement ownership arbitration (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/styles/gcm.css`)
  - Detect last active input (mouse vs gamepad) and switch ownership.
  - Hide/show OS cursor via CSS when ownership changes.

 - [X] Controller cursor updates and event (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`)
  - In `_tick`, compute cursor deltas from axes and update `this._cursor`.
  - Emit `cursorChange` event or expand `ownershipChange` payload to include updated cursor.
  - Update Provider to listen and sync context state.

- [x] Optimize pointer performance (Files: `src/modules/GCM/drivers/PointerDriver.js`, `src/modules/GCM/utils/eventDispatch.js`)
  - Batch position updates; write only to styles; prefer `transform: translate3d` for smoother cursor.
  - Rate-limit event dispatch to prevent floods and layout thrash.

 - [x] Align PointerDriver to transform translate3d (Files: `src/modules/GCM/drivers/PointerDriver.js`, `src/modules/GCM/styles/gcm.css`)
   - Write position using `transform: translate3d(x, y, 0)` for smooth movement; keep CSS baseline alignment.
   - Ensure consistency with React `CursorOverlay` approach.

 - [X] Add light throttling to synthetic mouse events (Files: `src/modules/GCM/utils/eventDispatch.js`, `src/modules/GCM/drivers/PointerDriver.js`)
   - Rate-limit synthetic `mousemove` dispatches to prevent floods and reduce layout thrash.
   - Keep throttling configurable via Provider/Controller config.

- [x] Improve cleanup and lifecycle (core/drivers) (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/drivers/PointerDriver.js`)
  - Ensure controller `stop()` cancels RAF and halts input polling.
  - Unmount overlay and restore native cursor class on driver teardown.

 - [X] Ensure stop() restores native cursor and enforces teardown (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/drivers/PointerDriver.js`)
 - On `stop()`, remove `gcm-hide-native-cursor` class even if ownership remains `gamepad`.
  - Guarantee overlay unmount/teardown consistency across adapters.

- [X] Map primary face button to pointer actions (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`)
  - Detect primary button state transitions and emit `buttonChange` events.
  - Provider dispatches `mousedown`/`mouseup`/`click` based on `clickMode` (tap/hold).

 **Status Update – Click Interaction**
- Observed: pointer moves smoothly, but click does not interact.
- Likely cause: `PointerDriver` position not synced with controller cursor when using React overlay only; synthetic click occurs at stale coordinates.

- [x] Fix click interaction by syncing pointer position with controller (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/drivers/PointerDriver.js`)
  - On `cursorChange`, update `PointerDriver` via `setPosition` to match controller.
  - Ensure synthetic `click` targets element under updated coordinates; keep `CursorOverlay` `pointer-events: none`.
  - Address immediately after provider wiring and ownership arbitration, before tests.

- [x] Implement directional focus navigation (Files: `src/modules/GCM/drivers/FocusDriver.js`, `src/modules/GCM/utils/geometry.js`)
  - Compute nearest element by direction using DOMRects.
  - Utility for angle/distance calculations.

 - [X] Add React hook for state (Files: `src/modules/GCM/adapters/react/useGamepadControl.js`, `src/modules/GCM/index.js`)
  - Implement `useGamepadControl` consuming provider context.
  - Export hook from `index.js`.

 - [X] Add Cursor Overlay component (Files: `src/modules/GCM/adapters/react/CursorOverlay.jsx`, `src/modules/GCM/index.js`)
  - Render cursor overlay; read position from provider.
  - Export overlay from `index.js`.

- [X] Finalize vanilla init wiring (Files: `src/modules/GCM/adapters/vanilla/initGCM.js`, `src/modules/GCM/styles/gcm.css`)
  - Mount overlay by default; opt-out with `mountPointer: false`.
  - Start controller by default; opt-out with `autoStart: false`.
  - Respect `showRing` flag for overlay styling.
  - Ensure styles load via manual import or upcoming React Provider injection.

 - [X] Finalize React provider wiring (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/adapters/react/useGamepadControl.js`)
 - Provide ownership, cursor position, connected pads, config.

 - [x] Align CursorOverlay transform with PointerDriver (Files: `src/modules/GCM/adapters/react/CursorOverlay.jsx`, `src/modules/GCM/drivers/PointerDriver.js`)
  - Use `translate3d(x, y, 0) translate(-50%, -50%)` for GPU-accelerated positioning and consistency.
  - Acceptance: Cursor overlay moves smoothly and matches pointer driver positioning with no visual regressions.

 - [x] Guard synthetic events in ownership listeners (Files: `src/modules/GCM/core/GamepadController.js`)
  - Ignore synthetic input using `event.isTrusted === false` and/or a custom synthetic marker (e.g., `detail.__gcmSynthetic`) in mouse/wheel/keyboard handlers.
  - Goal: Prevent ownership flipping to `mouse` during synthetic pointer and upcoming wheel dispatches so `gamepad` retains control while emulating input.

 - [x] Map right‑click (east / B) (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/drivers/PointerDriver.js`, `src/modules/GCM/utils/eventDispatch.js`)
 - Emit `buttonChange` for `east`; in Provider, dispatch right‑click via `mousedown`/`mouseup` with `{ button: 2 }`. Optionally emit `contextmenu` on release for sites relying on it.
 - Acceptance: Elements react to right‑click without breaking current primary click behavior.

 - [X] Implement Scroll Mode with programmatic scrolling (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/drivers/ScrollDriver.js`)
   - Toggle scroll mode on `north / Y` release; disable pointer movement while active and show ring.
   - Map left stick Y to container/page scrolling using `ScrollDriver.scrollByAtPoint()` (no synthetic WheelEvent).
   - Introduce `SCROLL_SPEED_MULTIPLIER` constant (default `1.5`) to globally adjust scroll speed.
   - Acceptance: When scroll mode is toggled on, left stick smoothly scrolls the nearest scrollable container or the page; speed is clearly affected by the multiplier constant.

 - [x] React overlay usage config (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `README.md`)
   - When using `CursorOverlay` in React, pass `config={{ mountPointer: false }}` to avoid duplicate overlays.
   - Document this pattern and provide example in README.

 - [x] Add accessibility safeguards for synthetic events (Files: `src/modules/GCM/drivers/FocusDriver.js`, `src/modules/GCM/adapters/react/CursorOverlay.jsx`)
  - Ensure synthetic events do not break screen readers; add ARIA hints for focus movement.
  - Revert ARIA adjustments on unmount to restore defaults.

 - [x] Add configuration defaults and mapping (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/index.js`)
  - Define axes/buttons mappings, deadzone, sensitivity, click mode.
  - Expose `setConfig` and defaults through `index.js`.

 - [x] Add gamepad lifecycle robustness (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/index.js`)
  - Handle connect/disconnect, index shifts, and purge stale `navigator.getGamepads()` entries.
  - Debounce device discovery and state updates to avoid thrash.

 - [x] Add graceful fallbacks and Provider enabled state (Files: `src/modules/GCM/core/GamepadController.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`)
  - Degrade gracefully when Gamepad API is missing; expose `enabled` in Provider context.
  - Provide disabled module state; reserve keyboard mapping as future optional fallback.

 - [x] Add basic tests (Files: `src/modules/GCM/__tests__/controller.test.js`, `src/modules/GCM/__tests__/pointer.test.js`)
 - Unit tests for normalization/ownership; integration tests for pointer events.

 - [x] Add controller lifecycle tests (Files: `src/modules/GCM/__tests__/controller_lifecycle.test.js`, `src/modules/GCM/core/GamepadController.js`)
   - Verify debounced device scanning emits `connected` and `disconnected` when `navigator.getGamepads()` changes.
   - Acceptance: `connected` payloads are arrays of device info; `disconnected` contains removed IDs.

 - [x] Add Provider scroll mode test (Files: `src/modules/GCM/__tests__/provider_scroll.test.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`)
   - Assert `setScrollMode(true)` adds `gcm-cursor--ring` and flips `config.pointerEnabled` to `false`; off restores ring removal and `pointerEnabled: true`.
   - Uses React 18 `createRoot` in tests to align with Provider implementation.

 - [x] Add FocusDriver directional navigation tests (Files: `src/modules/GCM/__tests__/focus.test.js`, `src/modules/GCM/drivers/FocusDriver.js`)
   - Confirm `focusByDirection('right'|'left')` moves to spatial neighbor; skip elements with `aria-hidden="true"`.
   - Provide deterministic `getBoundingClientRect` stubs for elements to ensure reliable JSDOM geometry.

 - [x] Add SSR tests (Files: `src/modules/GCM/__tests__/ssr.test.js`, `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`)
  - Server-render Provider and assert no DOM mutations or errors; verify client hydration.
  - Ensure style injection is idempotent and does not duplicate on hydration.
  - Acceptance: SSR render does not mutate DOM; hydration injects a single style tag; `styleInjection: false` skips injection. All SSR tests pass in Jest.

 - [x] Add minimal e2e tests (Files: `src/modules/GCM/__tests__/e2e/basic.e2e.test.js`)
  - Added Jest e2e-style test to render a demo and toggle `scrollMode`.
  - Verifies overlay presence and `scrollMode` changes via demo buttons.
  - Visual check available at `/test/gcm-demo` route for manual verification.

 - [x] Wire minimal app integration (scoped to demo route) (Files: `src/index.js`, `src/App.js`)
  - Keep `GamepadControlProvider` scoped to the `/test/gcm-demo` route (Option A).
  - Remove global wrapper from `src/index.js`; public API shape remains consistent.

 - [x] Add demo page to visualize inputs (Files: `src/pages/GcmDemo.js`, `src/App.js`)
  - Implemented status panel showing `running`, `ownership`, cursor coordinates, and connected gamepad count.
  - Added route `/test/gcm-demo` in `App.js` for quick manual verification.

 - [x] Improve cleanup and lifecycle (adapters) (Files: `src/modules/GCM/adapters/react/GamepadControlProvider.jsx`, `src/modules/GCM/adapters/vanilla/initGCM.js`)
  - Provider unmount stops controller and unmounts overlay; added safety to restore native cursor class.
  - Vanilla teardown ensures overlay removal, controller stop, and native cursor restoration.

 - [x] Document configuration surface (Files: `README.md`, `src/modules/GCM/index.js`)
   - Root README now includes a "GCM Configuration Surface" section covering `mountPointer`, `autoStart`, `showRing`, `styleInjection`, common defaults, and notes on future `hideNativeCursor`/`container` overrides.
   - Public API exposes `GCM_DEFAULT_CONFIG` and `GCM_CONFIG_KEYS`; runtime updates via `controller.setConfig(partial)` are documented with React/vanilla examples.

 - [x] Document integration modes (Files: `src/modules/GCM/README.md`)
  - Added "Integration Modes" section describing modular vs global setup with code examples, pros/cons, and switching instructions.
  - Clarifies current project state: modular provider on demo route; outlines steps for global integration post-export.

## Future Enhancements

- Haptics feedback on click (where supported).
- Custom per‑page mappings via route config.
- Multi‑gamepad arbitration and handoff.


## Observed Behavior Note

- Scroll mode inconsistency: holding the left stick at strong deflection scrolls continuously but slow, while a quick push-and-release produces a faster scroll burst.
- Impact: minor; does not break the module, acceptable for now. We will move on and revisit tuning later.
- Potential follow-ups: refine time normalization and minimum delta; consider velocity-based curves or synthetic WheelEvent with delta smoothing.