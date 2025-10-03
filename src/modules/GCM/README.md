# Author's Note

What I actually wanted to do was seamlessly take control of the OS cursor only when navigating where this module was active.
But that is a security risk, so I then decided to emulate the cursor instead. This is an accesibility project, the internet is supposed to be accesible by everyone, and this is a way to make that possible. Or so I believe.

If you want to use the module in a non-React project, you can use the vanilla adapter.

I want to make it bigger and better, I want to make it so it identifies differentgamepads and maps them to the correct buttons and axes.
This is a first iteration.

# Gamepad Control Module (GCM)

Self-contained gamepad control for web apps. Provides a virtual cursor, ownership arbitration (mouse vs gamepad), React and vanilla adapters, and a scroll mode mapped to the left stick.

## Module Location

- Path: `src/modules/GCM/`
- Public entry: `src/modules/GCM/index.js`

## Quick Start (React)

```jsx
import { GamepadControlProvider, CursorOverlay } from './modules/GCM';

export default function App() {
  return (
    <GamepadControlProvider config={{ useDPad: true }}>
      {/* App content */}
      <CursorOverlay />
    </GamepadControlProvider>
  );
}
```

### Avoid duplicate cursors (React)

If you use `CursorOverlay`, disable the Provider’s built-in pointer overlay:

```jsx
<GamepadControlProvider config={{ mountPointer: false }}>
  <CursorOverlay />
</GamepadControlProvider>
```

## Quick Start (Vanilla)

```js
import { initGCM } from './modules/GCM';

const { controller, teardown } = initGCM({ pointerEnabled: true });
controller.start();
// ... later
// teardown();
```

## Features

- Virtual cursor overlay with synthetic mouse events.
- Ownership arbitration: last active input wins (mouse or gamepad).
- Primary click mapping (south/A) and optional right-click (east/B).
- Scroll Mode: toggle via north/Y; map left stick vertical to scroll.
- React Provider and hook; vanilla adapter for non-React.

## Public API

Exported from `src/modules/GCM/index.js`:

- `GamepadController`
- `PointerDriver`
- `FocusDriver`
- `ScrollDriver`
- `GamepadControlProvider`
- `useGamepadControl`
- `CursorOverlay`
- `initGCM`

## Events

These events are emitted by `GamepadController` and can be subscribed to via `controller.on(event, handler)`:

- `enabledChange`: `{ enabled, reason? }` — module enabled/disabled toggles.
- `ownershipChange`: `{ ownership, cursor? }` — active input owner: `'mouse' | 'gamepad'`; cursor may accompany.
- `cursorChange`: `{ cursor: { x, y }, ownership }` — cursor position updates.
- `buttonChange`: `{ name, pressed }` — logical button state changes (e.g., `south`, `east`, `north`, `west`).
- `connected`: `Array<{ id, index, mapping, timestamp }>` — current list of connected pads after a change.
- `disconnected`: `string[]` — IDs removed since the previous scan.

Unsubscribe with `controller.off(event, handler)`.

## State Shape

`controller.getState()` returns an object with:

- `ownership`: `'mouse' | 'gamepad'`
- `cursor`: `{ x: number, y: number }`
- `connectedPads`: `Array<{ id, index, mapping, timestamp }>`
- `config`: the current runtime config object
- `running`: `boolean` — controller loop running status
- `enabled`: `boolean` — module-wide enable flag

## React Context

`useGamepadControl()` provides a context with:

- `state`: same shape as `controller.getState()`
- `controller`: the `GamepadController` instance
- `pointer`: `PointerDriver | null`
- `focus`: `FocusDriver | null`
- `setConfig(next)`: update runtime config (merged)

Use inside a `GamepadControlProvider` tree.

## Configuration (selected)

- `axes`: `{ leftX, leftY, rightX, rightY }` indices
- `buttons`: `{ south, east, west, north }` indices
- `deadzone`: default `0.15`
- `sensitivity`: cursor move sensitivity (pixels per frame per axis unit)
- `scrollSensitivity`: base scroll pixels per frame per axis unit (default `30`)
- `pointerEnabled`: enable virtual pointer (default `true`)
- `focusEnabled`: enable focus driver (default `true`)
- `devicePreference`: `'last-connected' | 'first' | number`
- `pauseWhenHidden`: pause when tab hidden (default `true`)
- `ownershipHysteresisMs`: default `75`
- `mountPointer`: Provider mounts pointer overlay (default `true`)
- `autoStart`: Provider starts controller (default `true`)
- `showRing`: show cursor ring for accessibility
- `styleInjection`: auto-inject CSS (default `true`)

Refer to `GCM_CONFIG_KEYS` exported from `index.js` for the current stable list of keys.

## Scroll Mode

- Toggle: press and release `north/Y` to toggle Scroll Mode.
- Behavior: when active, pointer movement is disabled and left stick vertical scrolls the nearest scrollable container or the page (prefers global page scroll).
- Implementation:
  - React Provider maps left stick Y to `ScrollDriver.scrollByAtPoint()`.
  - Page-level preference via `ScrollDriver({ preferGlobal: true })`.
  - Time-normalized delta to keep steady speed while holding the stick.
- Constants (in `adapters/react/GamepadControlProvider.jsx`):
  - `SCROLL_SPEED_MULTIPLIER`: global intensity multiplier.
  - `SCROLL_MIN_DELTA`: minimum per-frame delta (scaled by frame time).

## Known Behavior Note

- Observed inconsistency: holding the stick at strong deflection scrolls continuously but slower than expected; a quick push-and-release produces a faster burst. This is minor and does not break the module. Future tuning may refine time normalization, minimum delta, and introduce velocity curves or smoothed synthetic wheel dispatch.

## SSR Safety

- Core and drivers guard `window`/`document` usage; adapters no-op on server.

## Lifecycle & Teardown

- React: unmounting `GamepadControlProvider` stops the controller and unmounts the pointer; native cursor is restored.
- Vanilla: `initGCM(config)` returns `{ controller, pointer, focus, teardown }`. Call `teardown()` to unmount overlays and stop the controller, ensuring the native cursor is restored even if an error occurs.

## Version & Exports

- Module version: `__GCM_VERSION__` from `index.js` (e.g., `'0.0.1-lifecycle'`).
- Defaults: `GCM_DEFAULT_CONFIG` from `GamepadController.js`.
- Config keys: `GCM_CONFIG_KEYS` list exported from `index.js`.

## Development & Testing

- Unit tests: axes normalization, ownership, event emission.
- Integration: synthetic pointer events target `elementFromPoint`.
- Manual demo: use the running app at `http://localhost:3000/`.

**Test Coverage**
- Current coverage includes: core controller normalization and lifecycle, pointer driver transform and synthetic click, React Provider scroll mode ring/pointerEnabled, and FocusDriver directional navigation.
- All suites pass under JSDOM with React 18; environment stabilized via virtual router mocks in `src/App.test.js` (non-GCM).

## Styling

- CSS is auto-injected by the Provider (`.gcm-cursor`), or import `styles/gcm.css` manually.
- The Provider toggles `.gcm-hide-native-cursor` on the root element when gamepad ownership requires hiding the OS cursor.
- Customize the cursor ring by passing `showRing` to the Provider or `CursorOverlay`.

## License

- This module is part of a proprietary project; see repository license.

## Integration Modes

Choose how to integrate GCM depending on your app’s needs:

### Modular (current project state)

Scope GCM to specific pages or features. Wrap only the page/component that needs gamepad control:

```jsx
// Example: Page-level integration (e.g., GCM Demo page)
import { GamepadControlProvider, CursorOverlay } from '../modules/GCM';

export default function GcmDemo() {
  return (
    <GamepadControlProvider config={{ mountPointer: true, autoStart: true }}>
      {/* Page content */}
      <CursorOverlay />
    </GamepadControlProvider>
  );
}
```

Pros:
- Isolated behavior with no global side effects.
- Easier to test and iterate during development.
- Keeps public routes clean while the module is evolving.

### Global (recommended after export)

Provide gamepad control app-wide by wrapping your root and rendering a single overlay:

```jsx
// src/index.js (root-level)
import { GamepadControlProvider, CursorOverlay } from './modules/GCM';

root.render(
  <GamepadControlProvider config={{ mountPointer: false }}>
    <App />
    <CursorOverlay showRing={true} />
  </GamepadControlProvider>
);
```

Guidelines:
- Avoid duplicate overlays: when using a root `CursorOverlay`, set `mountPointer: false`.
- Do not nest additional `GamepadControlProvider` instances in pages; use the global context via `useGamepadControl()`.
- Centralize configuration (e.g., sensitivity, device preference) at the root.

### Switching from Modular to Global

1. Remove page-level `GamepadControlProvider` and `CursorOverlay`.
2. Add the root-level wrapper and a single `CursorOverlay`.
3. Ensure tests do not assume local providers; wrap test harnesses when needed.

### Testing Notes

- For unit/integration tests, prefer wrapping a minimal harness with `GamepadControlProvider` to avoid coupling to app-level providers.
- When asserting UI overlays, choose resilient indicators (e.g., `scrollMode` state) rather than DOM timing-sensitive classes.