/**
 * useInputMapper Hook - Input Device Abstraction Layer
 * 
 * This hook provides a centralized system for mapping different input types
 * (keyboard, touch, gamepad, mouse) to standardized game actions. It works
 * in conjunction with useActionSystem to provide a complete input solution.
 * 
 * Features:
 * - Multi-device input support (keyboard, touch, gamepad, mouse)
 * - Customizable input mappings
 * - Input priority and conflict resolution
 * - Real-time input source detection
 * - Action-based input abstraction
 */

import { useCallback, useRef, useEffect } from 'react';
import { GAME_ACTIONS } from '../config/gameActions.js';

// Default input mappings for different devices
const DEFAULT_MAPPINGS = {
  keyboard: {
    'ArrowUp': GAME_ACTIONS.PLAYER_MOVE_UP,
    'ArrowDown': GAME_ACTIONS.PLAYER_MOVE_DOWN,
    ' ': GAME_ACTIONS.PAUSE_UNPAUSE,        // Spacebar
    'Escape': GAME_ACTIONS.EXIT_GAME,
    'Enter': GAME_ACTIONS.TOGGLE_FULLSCREEN,
  },
  
  gamepad: {
    // D-pad and left stick
    'dpad_up': GAME_ACTIONS.PLAYER_MOVE_UP,
    'dpad_down': GAME_ACTIONS.PLAYER_MOVE_DOWN,
    'left_stick_up': GAME_ACTIONS.PLAYER_MOVE_UP,
    'left_stick_down': GAME_ACTIONS.PLAYER_MOVE_DOWN,
    
    // Face buttons (Xbox/PlayStation layout)
    'button_0': GAME_ACTIONS.PAUSE_UNPAUSE,    // A/X button
    'button_1': GAME_ACTIONS.EXIT_GAME,        // B/Circle button
    'button_3': GAME_ACTIONS.TOGGLE_FULLSCREEN, // Y/Triangle button
  },
  
  touch: {
    'tap': GAME_ACTIONS.PAUSE_UNPAUSE,
    'double_tap': GAME_ACTIONS.TOGGLE_FULLSCREEN,
    'drag_up': GAME_ACTIONS.PLAYER_MOVE_UP,
    'drag_down': GAME_ACTIONS.PLAYER_MOVE_DOWN,
  },
  
  mouse: {
    'click': GAME_ACTIONS.PAUSE_UNPAUSE,
    'double_click': GAME_ACTIONS.TOGGLE_FULLSCREEN,
    'drag_up': GAME_ACTIONS.PLAYER_MOVE_UP,
    'drag_down': GAME_ACTIONS.PLAYER_MOVE_DOWN,
  }
};

// Input source priority (higher number = higher priority)
const INPUT_PRIORITY = {
  gamepad: 4,
  keyboard: 3,
  touch: 2,
  mouse: 1
};

const useInputMapper = (actionDispatcher, options = {}) => {
  const {
    customMappings = {},
    enableMultiInput = true,
    inputTimeout = 100, // ms to wait before switching input sources
  } = options;

  // Refs for tracking input state
  const currentInputSource = useRef('keyboard');
  const lastInputTime = useRef({});
  const activeInputs = useRef(new Set());
  const inputMappings = useRef({ ...DEFAULT_MAPPINGS, ...customMappings });

  // Merge custom mappings with defaults
  useEffect(() => {
    inputMappings.current = {
      ...DEFAULT_MAPPINGS,
      ...customMappings
    };
  }, [customMappings]);

  /**
   * Determines the active input source based on priority and timing
   */
  const determineInputSource = useCallback(() => {
    if (!enableMultiInput) {
      return currentInputSource.current;
    }

    const now = Date.now();
    const validSources = [];

    // Check which input sources have been active recently
    for (const [source, lastTime] of Object.entries(lastInputTime.current)) {
      if (now - lastTime < inputTimeout) {
        validSources.push(source);
      }
    }

    if (validSources.length === 0) {
      return currentInputSource.current;
    }

    // Return the highest priority active source
    return validSources.reduce((highest, current) => {
      return INPUT_PRIORITY[current] > INPUT_PRIORITY[highest] ? current : highest;
    });
  }, [enableMultiInput, inputTimeout]);

  /**
   * Maps a raw input to a game action
   */
  const mapInputToAction = useCallback((inputType, inputKey, inputSource) => {
    const mappings = inputMappings.current[inputSource];
    if (!mappings || !mappings[inputKey]) {
      return null;
    }

    // Update input source tracking
    lastInputTime.current[inputSource] = Date.now();
    activeInputs.current.add(inputSource);
    currentInputSource.current = determineInputSource();

    return mappings[inputKey];
  }, [determineInputSource]);

  /**
   * Keyboard input mapper
   */
  const mapKeyboardInput = useCallback((event, inputType = 'keydown') => {
    const action = mapInputToAction(inputType, event.key, 'keyboard');
    if (action && actionDispatcher) {
      actionDispatcher(action, {
        inputSource: 'keyboard',
        originalEvent: event,
        inputType
      });
    }
    return action;
  }, [mapInputToAction, actionDispatcher]);

  /**
   * Gamepad input mapper
   */
  const mapGamepadInput = useCallback((gamepadState, gamepadIndex = 0) => {
    if (!gamepadState) return null;

    const { buttons, axes } = gamepadState;
    let mappedActions = [];

    // Map button inputs
    buttons.forEach((button, index) => {
      if (button.pressed) {
        const action = mapInputToAction('button_press', `button_${index}`, 'gamepad');
        if (action) {
          mappedActions.push({
            action,
            context: {
              inputSource: 'gamepad',
              gamepadIndex,
              buttonIndex: index,
              inputType: 'button_press'
            }
          });
        }
      }
    });

    // Map analog stick inputs (left stick)
    if (axes.length >= 2) {
      const leftStickY = axes[1]; // Y-axis of left stick
      const threshold = 0.3; // Dead zone threshold

      if (leftStickY < -threshold) {
        const action = mapInputToAction('analog', 'left_stick_up', 'gamepad');
        if (action) {
          mappedActions.push({
            action,
            context: {
              inputSource: 'gamepad',
              gamepadIndex,
              analogValue: Math.abs(leftStickY),
              inputType: 'analog'
            }
          });
        }
      } else if (leftStickY > threshold) {
        const action = mapInputToAction('analog', 'left_stick_down', 'gamepad');
        if (action) {
          mappedActions.push({
            action,
            context: {
              inputSource: 'gamepad',
              gamepadIndex,
              analogValue: leftStickY,
              inputType: 'analog'
            }
          });
        }
      }
    }

    // Dispatch all mapped actions
    if (actionDispatcher) {
      mappedActions.forEach(({ action, context }) => {
        actionDispatcher(action, context);
      });
    }

    return mappedActions.map(item => item.action);
  }, [mapInputToAction, actionDispatcher]);

  /**
   * Touch input mapper
   */
  const mapTouchInput = useCallback((touchEvent, touchType) => {
    let inputKey;
    
    switch (touchType) {
      case 'tap':
        inputKey = 'tap';
        break;
      case 'double_tap':
        inputKey = 'double_tap';
        break;
      case 'drag_up':
        inputKey = 'drag_up';
        break;
      case 'drag_down':
        inputKey = 'drag_down';
        break;
      default:
        return null;
    }

    const action = mapInputToAction(touchType, inputKey, 'touch');
    if (action && actionDispatcher) {
      actionDispatcher(action, {
        inputSource: 'touch',
        originalEvent: touchEvent,
        inputType: touchType
      });
    }
    return action;
  }, [mapInputToAction, actionDispatcher]);

  /**
   * Mouse input mapper
   */
  const mapMouseInput = useCallback((mouseEvent, mouseType) => {
    let inputKey;
    
    switch (mouseType) {
      case 'click':
        inputKey = 'click';
        break;
      case 'double_click':
        inputKey = 'double_click';
        break;
      case 'drag_up':
        inputKey = 'drag_up';
        break;
      case 'drag_down':
        inputKey = 'drag_down';
        break;
      default:
        return null;
    }

    const action = mapInputToAction(mouseType, inputKey, 'mouse');
    if (action && actionDispatcher) {
      actionDispatcher(action, {
        inputSource: 'mouse',
        originalEvent: mouseEvent,
        inputType: mouseType
      });
    }
    return action;
  }, [mapInputToAction, actionDispatcher]);

  /**
   * Update custom mappings at runtime
   */
  const updateMappings = useCallback((newMappings) => {
    inputMappings.current = {
      ...inputMappings.current,
      ...newMappings
    };
  }, []);

  /**
   * Get current input source information
   */
  const getInputStatus = useCallback(() => {
    return {
      currentSource: currentInputSource.current,
      activeSources: Array.from(activeInputs.current),
      lastInputTimes: { ...lastInputTime.current },
      mappings: inputMappings.current
    };
  }, []);

  /**
   * Reset input tracking
   */
  const resetInputTracking = useCallback(() => {
    currentInputSource.current = 'keyboard';
    lastInputTime.current = {};
    activeInputs.current.clear();
  }, []);

  // Cleanup inactive input sources periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const timeout = inputTimeout * 2; // Double the timeout for cleanup

      Object.keys(lastInputTime.current).forEach(source => {
        if (now - lastInputTime.current[source] > timeout) {
          delete lastInputTime.current[source];
          activeInputs.current.delete(source);
        }
      });
    }, inputTimeout);

    return () => clearInterval(cleanupInterval);
  }, [inputTimeout]);

  return {
    // Input mappers for different devices
    mapKeyboardInput,
    mapGamepadInput,
    mapTouchInput,
    mapMouseInput,
    
    // Configuration and status
    updateMappings,
    getInputStatus,
    resetInputTracking,
    
    // Current state
    currentInputSource: currentInputSource.current,
    activeSources: Array.from(activeInputs.current)
  };
};

export default useInputMapper;