/**
 * Gamepad Control Module (GCM) – React Hook
 * Returns the current GCM context for consumers within the Provider tree.
 */
import { useContext } from 'react';
import { GamepadControlContext } from './GamepadControlProvider.jsx';

export function useGamepadControl() {
  // Provides access to { state, controller, pointer, focus, setConfig }
  // Inputs: none. Output: GCM context object.
  return useContext(GamepadControlContext);
}

export default useGamepadControl;