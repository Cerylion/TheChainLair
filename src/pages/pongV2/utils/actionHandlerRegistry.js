/**
 * Action Handler Registry - Pre-built handlers for common game actions
 * 
 * This module provides a collection of standardized action handlers that can be
 * registered with the useActionSystem hook. These handlers implement the core
 * game functionality in a modular, reusable way.
 * 
 * Features:
 * - Pre-built handlers for all game actions
 * - Configurable handler behavior
 * - Integration with existing game state and refs
 * - Proper error handling and validation
 */

import { GAME_ACTIONS } from '../config/gameActions.js';

/**
 * Create game control handlers
 * @param {Object} gameRefs - Game state references
 * @param {Object} gameFunctions - Game control functions
 * @returns {Object} Game control action handlers
 */
export const createGameControlHandlers = (gameRefs, gameFunctions) => {
  const {
    gameStateRef,
    isFullscreenMode,
    setIsFullscreenMode
  } = gameRefs;

  const {
    updateGameState,
    cleanupGame,
    toggleFullscreenMode
  } = gameFunctions;

  return {
    [GAME_ACTIONS.PAUSE_UNPAUSE]: async (payload, context) => {
      try {
        const currentState = gameStateRef.current;
        
        if (currentState === 'start') {
          // Start the game
          updateGameState('playing');
          return { success: true, action: 'game_started' };
        } else if (currentState === 'playing') {
          // Pause the game
          updateGameState('paused');
          return { success: true, action: 'game_paused' };
        } else if (currentState === 'paused') {
          // Unpause the game
          updateGameState('playing');
          return { success: true, action: 'game_unpaused' };
        }
        
        return { success: false, reason: 'invalid_state' };
      } catch (error) {
        console.error('[ActionHandler] PAUSE_UNPAUSE error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.TOGGLE_FULLSCREEN]: async (payload, context) => {
      try {
        toggleFullscreenMode();
        return { 
          success: true, 
          newState: !isFullscreenMode,
          action: isFullscreenMode ? 'fullscreen_exit' : 'fullscreen_enter'
        };
      } catch (error) {
        console.error('[ActionHandler] TOGGLE_FULLSCREEN error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.EXIT_GAME]: async (payload, context) => {
      try {
        // Only allow exit when paused
        if (gameStateRef.current !== 'paused') {
          return { success: false, reason: 'must_be_paused' };
        }
        
        cleanupGame();
        return { success: true, action: 'game_exited' };
      } catch (error) {
        console.error('[ActionHandler] EXIT_GAME error:', error);
        return { success: false, error: error.message };
      }
    }
  };
};

/**
 * Create player movement handlers
 * @param {Object} gameRefs - Game state references
 * @param {Object} gameConfig - Game configuration
 * @returns {Object} Player movement action handlers
 */
export const createPlayerMovementHandlers = (gameRefs, gameConfig) => {
  const {
    upPressedRef,
    downPressedRef,
    inputSource
  } = gameRefs;

  return {
    [GAME_ACTIONS.PLAYER_MOVE_UP]: async (payload, context) => {
      try {
        upPressedRef.current = true;
        downPressedRef.current = false; // Prevent conflicting inputs
        
        // Update input source if provided
        if (payload && payload.inputSource) {
          inputSource.current = payload.inputSource;
        }
        
        return { 
          success: true, 
          action: 'player_moving_up',
          inputSource: inputSource.current
        };
      } catch (error) {
        console.error('[ActionHandler] PLAYER_MOVE_UP error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.PLAYER_MOVE_DOWN]: async (payload, context) => {
      try {
        downPressedRef.current = true;
        upPressedRef.current = false; // Prevent conflicting inputs
        
        // Update input source if provided
        if (payload && payload.inputSource) {
          inputSource.current = payload.inputSource;
        }
        
        return { 
          success: true, 
          action: 'player_moving_down',
          inputSource: inputSource.current
        };
      } catch (error) {
        console.error('[ActionHandler] PLAYER_MOVE_DOWN error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.PLAYER_STOP]: async (payload, context) => {
      try {
        upPressedRef.current = false;
        downPressedRef.current = false;
        
        return { 
          success: true, 
          action: 'player_stopped',
          inputSource: inputSource.current
        };
      } catch (error) {
        console.error('[ActionHandler] PLAYER_STOP error:', error);
        return { success: false, error: error.message };
      }
    }
  };
};

/**
 * Create interaction handlers for drag operations
 * @param {Object} gameRefs - Game state references
 * @param {Object} gameConfig - Game configuration
 * @param {Object} gameFunctions - Game utility functions
 * @returns {Object} Interaction action handlers
 */
export const createInteractionHandlers = (gameRefs, gameConfig, gameFunctions) => {
  const {
    player1YRef,
    touchStartY,
    mouseStartY,
    isDragging,
    isMouseDragging,
    inputSource,
    canvasRef,
    isFullscreenMode
  } = gameRefs;

  const {
    constrainPaddle,
    transformTouchCoordinates,
    transformMouseCoordinates
  } = gameFunctions;

  return {
    [GAME_ACTIONS.START_DRAG]: async (payload, context) => {
      try {
        const { coordinates, inputType, event } = payload || {};
        
        if (!coordinates || !inputType) {
          return { success: false, reason: 'missing_coordinates_or_input_type' };
        }

        // Set input source
        inputSource.current = inputType;

        // Initialize drag based on input type
        if (inputType === 'touch') {
          touchStartY.current = coordinates.y;
          isDragging.current = true;
        } else if (inputType === 'mouse') {
          mouseStartY.current = coordinates.y;
          isMouseDragging.current = true;
        }

        return { 
          success: true, 
          action: 'drag_started',
          inputType,
          coordinates
        };
      } catch (error) {
        console.error('[ActionHandler] START_DRAG error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.CONTINUE_DRAG]: async (payload, context) => {
      try {
        const { coordinates, inputType, sensitivity = 1 } = payload || {};
        
        if (!coordinates || !inputType) {
          return { success: false, reason: 'missing_coordinates_or_input_type' };
        }

        const canvas = canvasRef.current;
        if (!canvas) {
          return { success: false, reason: 'canvas_not_available' };
        }

        let deltaY = 0;
        let startY = null;

        // Calculate delta based on input type
        if (inputType === 'touch' && isDragging.current && touchStartY.current !== null) {
          deltaY = coordinates.y - touchStartY.current;
          startY = touchStartY.current;
          touchStartY.current = coordinates.y; // Update for next move
        } else if (inputType === 'mouse' && isMouseDragging.current && mouseStartY.current !== null) {
          deltaY = coordinates.y - mouseStartY.current;
          startY = mouseStartY.current;
          mouseStartY.current = coordinates.y; // Update for next move
        } else {
          return { success: false, reason: 'drag_not_active' };
        }

        // Apply sensitivity and update paddle position
        const frameOffset = gameConfig.FRAME.OFFSET;
        const gameHeight = canvas.height - (frameOffset * 2);
        const paddleHeight = gameConfig.PADDLE.HEIGHT;
        
        const newY = player1YRef.current + (deltaY * sensitivity);
        const constrainedY = constrainPaddle(newY, frameOffset, gameHeight, paddleHeight);
        player1YRef.current = constrainedY;

        return { 
          success: true, 
          action: 'drag_continued',
          inputType,
          deltaY,
          newPosition: constrainedY
        };
      } catch (error) {
        console.error('[ActionHandler] CONTINUE_DRAG error:', error);
        return { success: false, error: error.message };
      }
    },

    [GAME_ACTIONS.END_DRAG]: async (payload, context) => {
      try {
        const { inputType } = payload || {};

        // Clean up drag state
        if (inputType === 'touch' || !inputType) {
          isDragging.current = false;
          touchStartY.current = null;
        }
        
        if (inputType === 'mouse' || !inputType) {
          isMouseDragging.current = false;
          mouseStartY.current = null;
        }

        return { 
          success: true, 
          action: 'drag_ended',
          inputType: inputType || 'unknown'
        };
      } catch (error) {
        console.error('[ActionHandler] END_DRAG error:', error);
        return { success: false, error: error.message };
      }
    }
  };
};

/**
 * Create a complete action handler registry
 * @param {Object} gameRefs - All game state references
 * @param {Object} gameConfig - Game configuration object
 * @param {Object} gameFunctions - All game utility functions
 * @returns {Object} Complete action handler registry
 */
export const createActionHandlerRegistry = (gameRefs, gameConfig, gameFunctions) => {
  const gameControlHandlers = createGameControlHandlers(gameRefs, gameFunctions);
  const playerMovementHandlers = createPlayerMovementHandlers(gameRefs, gameConfig);
  const interactionHandlers = createInteractionHandlers(gameRefs, gameConfig, gameFunctions);

  return {
    ...gameControlHandlers,
    ...playerMovementHandlers,
    ...interactionHandlers
  };
};

/**
 * Register all handlers with an action system
 * @param {Object} actionSystem - The action system instance from useActionSystem
 * @param {Object} handlerRegistry - The handler registry from createActionHandlerRegistry
 * @param {Object} options - Registration options
 * @returns {Function} Cleanup function to unregister all handlers
 */
export const registerAllHandlers = (actionSystem, handlerRegistry, options = {}) => {
  const { priority = 0 } = options;
  const unregisterFunctions = [];

  // Register each handler
  Object.entries(handlerRegistry).forEach(([action, handler]) => {
    const unregister = actionSystem.registerHandler(action, handler, { priority });
    unregisterFunctions.push(unregister);
  });

  // Return cleanup function
  return () => {
    unregisterFunctions.forEach(unregister => {
      if (typeof unregister === 'function') {
        unregister();
      }
    });
  };
};

/**
 * Utility function to create handler registry with validation
 * @param {Object} dependencies - All required dependencies
 * @returns {Object|null} Handler registry or null if validation fails
 */
export const createValidatedHandlerRegistry = (dependencies) => {
  const { gameRefs, gameConfig, gameFunctions } = dependencies;

  // Validate required dependencies
  const requiredRefs = [
    'gameStateRef', 'upPressedRef', 'downPressedRef', 'player1YRef',
    'inputSource', 'canvasRef', 'isFullscreenMode'
  ];

  const requiredFunctions = [
    'updateGameState', 'cleanupGame', 'toggleFullscreenMode', 'constrainPaddle'
  ];

  // Check refs
  for (const ref of requiredRefs) {
    if (!gameRefs[ref]) {
      console.error(`[ActionHandlerRegistry] Missing required ref: ${ref}`);
      return null;
    }
  }

  // Check functions
  for (const func of requiredFunctions) {
    if (typeof gameFunctions[func] !== 'function') {
      console.error(`[ActionHandlerRegistry] Missing required function: ${func}`);
      return null;
    }
  }

  // Check config
  if (!gameConfig || !gameConfig.FRAME || !gameConfig.PADDLE) {
    console.error('[ActionHandlerRegistry] Missing required game config');
    return null;
  }

  return createActionHandlerRegistry(gameRefs, gameConfig, gameFunctions);
};