/**
 * INPUT_MAPPINGS Configuration
 * Maps device-specific inputs to game actions for PongV2
 * 
 * This configuration preserves all existing button-to-action relationships
 * while providing a centralized mapping system for the action-based input architecture.
 */

import { GAME_ACTIONS } from './gameActions.js';

/**
 * Keyboard input mappings
 * Maps keyboard keys to game actions
 */
export const KEYBOARD_MAPPINGS = {
  // Player movement
  'ArrowUp': GAME_ACTIONS.PLAYER_MOVE_UP,
  'ArrowDown': GAME_ACTIONS.PLAYER_MOVE_DOWN,
  
  // Game control
  'Space': GAME_ACTIONS.PAUSE_UNPAUSE,
  'Escape': GAME_ACTIONS.EXIT_GAME,
  'Enter': GAME_ACTIONS.TOGGLE_FULLSCREEN,
};

/**
 * Gamepad input mappings
 * Maps gamepad buttons and axes to game actions
 */
export const GAMEPAD_MAPPINGS = {
  // Buttons (using standard gamepad button indices)
  buttons: {
    0: GAME_ACTIONS.PAUSE_UNPAUSE,     // South button (A/X)
    1: GAME_ACTIONS.EXIT_GAME,         // East button (B/Circle) 
    3: GAME_ACTIONS.TOGGLE_FULLSCREEN, // North button (Y/Triangle)
    12: GAME_ACTIONS.PLAYER_MOVE_UP,   // D-pad Up
    13: GAME_ACTIONS.PLAYER_MOVE_DOWN, // D-pad Down
  },
  
  // Axes (left stick for movement)
  axes: {
    1: {
      negative: GAME_ACTIONS.PLAYER_MOVE_UP,   // Left stick up (negative Y)
      positive: GAME_ACTIONS.PLAYER_MOVE_DOWN, // Left stick down (positive Y)
      threshold: 0.5, // Minimum axis value to trigger action
    }
  }
};

/**
 * Touch input mappings
 * Maps touch gestures to game actions
 */
export const TOUCH_MAPPINGS = {
  // Touch gestures
  singleTap: GAME_ACTIONS.PAUSE_UNPAUSE,
  doubleTap: GAME_ACTIONS.TOGGLE_FULLSCREEN,
  drag: GAME_ACTIONS.START_DRAG,
  
  // Touch timing configuration
  doubleTapDelay: 300, // milliseconds
  
  // Button regions (will be calculated dynamically based on canvas size)
  buttonRegions: {
    pauseButton: GAME_ACTIONS.PAUSE_UNPAUSE,
    exitButton: GAME_ACTIONS.EXIT_GAME,
  }
};

/**
 * Mouse input mappings
 * Maps mouse events to game actions
 */
export const MOUSE_MAPPINGS = {
  // Mouse events
  click: GAME_ACTIONS.PAUSE_UNPAUSE,
  doubleClick: GAME_ACTIONS.TOGGLE_FULLSCREEN,
  drag: GAME_ACTIONS.START_DRAG,
  
  // Button regions (same as touch)
  buttonRegions: {
    pauseButton: GAME_ACTIONS.PAUSE_UNPAUSE,
    exitButton: GAME_ACTIONS.EXIT_GAME,
  }
};

/**
 * Complete input mappings object
 * Centralizes all device mappings for easy access
 */
export const INPUT_MAPPINGS = {
  keyboard: KEYBOARD_MAPPINGS,
  gamepad: GAMEPAD_MAPPINGS,
  touch: TOUCH_MAPPINGS,
  mouse: MOUSE_MAPPINGS,
};

/**
 * Input device detection utilities
 */
export const INPUT_DEVICE_TYPES = {
  KEYBOARD: 'keyboard',
  GAMEPAD: 'gamepad', 
  TOUCH: 'touch',
  MOUSE: 'mouse',
};

/**
 * Action context configuration
 * Defines which actions are valid in which game states
 */
export const ACTION_CONTEXTS = {
  start: [
    GAME_ACTIONS.PAUSE_UNPAUSE,      // Start game
    GAME_ACTIONS.TOGGLE_FULLSCREEN,
  ],
  playing: [
    GAME_ACTIONS.PLAYER_MOVE_UP,
    GAME_ACTIONS.PLAYER_MOVE_DOWN,
    GAME_ACTIONS.START_DRAG,
    GAME_ACTIONS.PAUSE_UNPAUSE,      // Pause game
    GAME_ACTIONS.TOGGLE_FULLSCREEN,
  ],
  paused: [
    GAME_ACTIONS.PAUSE_UNPAUSE,      // Unpause game
    GAME_ACTIONS.EXIT_GAME,          // Only available when paused
    GAME_ACTIONS.TOGGLE_FULLSCREEN,
  ]
};

export default INPUT_MAPPINGS;