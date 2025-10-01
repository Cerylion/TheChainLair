/**
 * Game Actions - Central action constants for the Pong game input system
 * Defines all possible game actions that can be triggered by various input devices
 */

export const GAME_ACTIONS = {
  // Game Control Actions
  PAUSE_UNPAUSE: 'PAUSE_UNPAUSE',
  TOGGLE_FULLSCREEN: 'TOGGLE_FULLSCREEN',
  EXIT_GAME: 'EXIT_GAME',
  
  // Player Movement Actions
  PLAYER_MOVE_UP: 'PLAYER_MOVE_UP',
  PLAYER_MOVE_DOWN: 'PLAYER_MOVE_DOWN',
  PLAYER_STOP: 'PLAYER_STOP',
  
  // Interaction Actions
  START_DRAG: 'START_DRAG',
  CONTINUE_DRAG: 'CONTINUE_DRAG',
  END_DRAG: 'END_DRAG'
};

/**
 * Action Categories - Groups actions by type for easier management
 */
export const ACTION_CATEGORIES = {
  GAME_CONTROL: ['PAUSE_UNPAUSE', 'TOGGLE_FULLSCREEN', 'EXIT_GAME'],
  PLAYER_MOVEMENT: ['PLAYER_MOVE_UP', 'PLAYER_MOVE_DOWN', 'PLAYER_STOP'],
  INTERACTION: ['START_DRAG', 'CONTINUE_DRAG', 'END_DRAG']
};

/**
 * Action Descriptions - Human-readable descriptions for each action
 */
export const ACTION_DESCRIPTIONS = {
  [GAME_ACTIONS.PAUSE_UNPAUSE]: 'Pause or unpause the game',
  [GAME_ACTIONS.TOGGLE_FULLSCREEN]: 'Enter or exit fullscreen mode',
  [GAME_ACTIONS.EXIT_GAME]: 'Exit the game and return to menu',
  [GAME_ACTIONS.PLAYER_MOVE_UP]: 'Move player paddle up',
  [GAME_ACTIONS.PLAYER_MOVE_DOWN]: 'Move player paddle down',
  [GAME_ACTIONS.PLAYER_STOP]: 'Stop player paddle movement',
  [GAME_ACTIONS.START_DRAG]: 'Start dragging the paddle',
  [GAME_ACTIONS.CONTINUE_DRAG]: 'Continue dragging the paddle',
  [GAME_ACTIONS.END_DRAG]: 'End paddle dragging'
};