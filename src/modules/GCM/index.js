/**
 * Gamepad Control Module (GCM) – Public Entry (Scaffold)
 * Copy-paste friendly module living under src/modules/GCM.
 * This file provides minimal stubs for the public API to be fleshed out
 * in subsequent steps.
 */

// Core controller (skeleton implementation)
export { GamepadController } from './core/GamepadController.js';
// Export core defaults for consumers (clone or reference as needed)
export { DEFAULT_CONFIG as GCM_DEFAULT_CONFIG } from './core/GamepadController.js';
// Export a stable list of known configuration keys for documentation/introspection
export const GCM_CONFIG_KEYS = [
  'axes',
  'buttons',
  'useDPad',
  'deadzone',
  'sensitivity',
  'scrollSensitivity',
  'pointerEnabled',
  'focusEnabled',
  'clickMode',
  'devicePreference',
  'pauseWhenHidden',
  'ownershipHysteresisMs',
];

// Vanilla adapter initializer (placeholder)
export { initGCM } from './adapters/vanilla/initGCM.js';

// Pointer driver (scaffold) re-export
export { PointerDriver } from './drivers/PointerDriver.js';

// Focus driver (scaffold) re-export
export { FocusDriver } from './drivers/FocusDriver.js';
// Scroll driver (new)
export { ScrollDriver } from './drivers/ScrollDriver.js';

// React adapter stubs (placeholders)
// Export implemented React Provider
export { GamepadControlProvider } from './adapters/react/GamepadControlProvider.jsx';
export { useGamepadControl } from './adapters/react/useGamepadControl.js';

// Export React Cursor Overlay component
export { CursorOverlay } from './adapters/react/CursorOverlay.jsx';

// Re-export paths to keep copy-paste imports stable as the module grows.
export const __GCM_VERSION__ = '0.0.1-lifecycle';