import { useContext } from 'react';
import { GamepadControlContext } from './GamepadControlProvider.jsx';

export function useGamepadControl() {
  return useContext(GamepadControlContext);
}

export default useGamepadControl;