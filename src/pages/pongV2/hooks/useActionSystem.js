/**
 * useActionSystem Hook - Central Action Dispatcher for Pong Game
 * 
 * This hook provides a centralized system for dispatching game actions and managing
 * action handlers. It serves as the core of the action-based input architecture.
 * 
 * Features:
 * - Action dispatching with validation
 * - Handler registration and management
 * - Context-aware action filtering
 * - Action history tracking (for debugging)
 * - Performance monitoring
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { GAME_ACTIONS, ACTION_CATEGORIES } from '../config/gameActions.js';

/**
 * Action System Hook
 * @param {Object} options - Configuration options
 * @param {string} options.gameState - Current game state (start, playing, paused)
 * @param {boolean} options.enableHistory - Whether to track action history
 * @param {number} options.maxHistorySize - Maximum number of actions to keep in history
 * @returns {Object} Action system interface
 */
export const useActionSystem = (options = {}) => {
  const {
    gameState = 'start',
    enableHistory = false,
    maxHistorySize = 100
  } = options;

  // Action handler registry - stores all registered action handlers
  const actionHandlers = useRef(new Map());
  
  // Action history for debugging and analytics
  const [actionHistory, setActionHistory] = useState([]);
  
  // Performance metrics
  const performanceMetrics = useRef({
    totalActions: 0,
    actionCounts: {},
    averageExecutionTime: 0,
    lastActionTime: null
  });

  // Context validation - determines which actions are valid in current state
  const isActionValidInContext = useCallback((action, currentGameState) => {
    switch (currentGameState) {
      case 'start':
        return [
          GAME_ACTIONS.PAUSE_UNPAUSE, // Start game
          GAME_ACTIONS.TOGGLE_FULLSCREEN,
          GAME_ACTIONS.START_DRAG,
          GAME_ACTIONS.CONTINUE_DRAG,
          GAME_ACTIONS.END_DRAG
        ].includes(action);
        
      case 'playing':
        return [
          GAME_ACTIONS.PAUSE_UNPAUSE, // Pause game
          GAME_ACTIONS.TOGGLE_FULLSCREEN,
          GAME_ACTIONS.PLAYER_MOVE_UP,
          GAME_ACTIONS.PLAYER_MOVE_DOWN,
          GAME_ACTIONS.PLAYER_STOP,
          GAME_ACTIONS.START_DRAG,
          GAME_ACTIONS.CONTINUE_DRAG,
          GAME_ACTIONS.END_DRAG
        ].includes(action);
        
      case 'paused':
        return [
          GAME_ACTIONS.PAUSE_UNPAUSE, // Unpause game
          GAME_ACTIONS.EXIT_GAME,
          GAME_ACTIONS.TOGGLE_FULLSCREEN,
          GAME_ACTIONS.START_DRAG,
          GAME_ACTIONS.CONTINUE_DRAG,
          GAME_ACTIONS.END_DRAG
        ].includes(action);
        
      default:
        return false;
    }
  }, []);

  /**
   * Register an action handler
   * @param {string} action - The action to handle (from GAME_ACTIONS)
   * @param {Function} handler - The handler function
   * @param {Object} options - Handler options
   * @param {number} options.priority - Handler priority (higher = executed first)
   * @param {boolean} options.once - Whether to execute only once
   */
  const registerHandler = useCallback((action, handler, handlerOptions = {}) => {
    const { priority = 0, once = false } = handlerOptions;
    
    if (!Object.values(GAME_ACTIONS).includes(action)) {
      console.warn(`[ActionSystem] Unknown action: ${action}`);
      return;
    }

    if (typeof handler !== 'function') {
      console.error(`[ActionSystem] Handler for action ${action} must be a function`);
      return;
    }

    // Get existing handlers for this action or create new array
    const existingHandlers = actionHandlers.current.get(action) || [];
    
    // Create handler entry
    const handlerEntry = {
      id: `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      handler,
      priority,
      once,
      registeredAt: Date.now()
    };

    // Insert handler in priority order (higher priority first)
    const updatedHandlers = [...existingHandlers, handlerEntry]
      .sort((a, b) => b.priority - a.priority);

    actionHandlers.current.set(action, updatedHandlers);

    // Return unregister function
    return () => {
      const handlers = actionHandlers.current.get(action) || [];
      const filteredHandlers = handlers.filter(h => h.id !== handlerEntry.id);
      
      if (filteredHandlers.length === 0) {
        actionHandlers.current.delete(action);
      } else {
        actionHandlers.current.set(action, filteredHandlers);
      }
    };
  }, []);

  /**
   * Unregister all handlers for a specific action
   * @param {string} action - The action to clear handlers for
   */
  const unregisterAllHandlers = useCallback((action) => {
    actionHandlers.current.delete(action);
  }, []);

  /**
   * Dispatch an action with optional payload
   * @param {string} action - The action to dispatch
   * @param {*} payload - Optional payload data
   * @param {Object} options - Dispatch options
   * @param {boolean} options.force - Force execution even if invalid in current context
   * @returns {Promise<boolean>} Whether the action was successfully dispatched
   */
  const dispatch = useCallback(async (action, payload = null, dispatchOptions = {}) => {
    const { force = false } = dispatchOptions;
    const startTime = performance.now();

    try {
      // Validate action exists
      if (!Object.values(GAME_ACTIONS).includes(action)) {
        console.warn(`[ActionSystem] Unknown action: ${action}`);
        return false;
      }

      // Context validation (unless forced)
      if (!force && !isActionValidInContext(action, gameState)) {
        console.debug(`[ActionSystem] Action ${action} not valid in state ${gameState}`);
        return false;
      }

      // Get handlers for this action
      const handlers = actionHandlers.current.get(action) || [];
      
      if (handlers.length === 0) {
        console.debug(`[ActionSystem] No handlers registered for action: ${action}`);
        return false;
      }

      // Execute handlers in priority order
      const results = [];
      const handlersToRemove = [];

      for (const handlerEntry of handlers) {
        try {
          const result = await handlerEntry.handler(payload, {
            action,
            gameState,
            timestamp: Date.now()
          });
          results.push(result);

          // Mark for removal if it's a one-time handler
          if (handlerEntry.once) {
            handlersToRemove.push(handlerEntry.id);
          }
        } catch (error) {
          console.error(`[ActionSystem] Handler error for action ${action}:`, error);
        }
      }

      // Remove one-time handlers
      if (handlersToRemove.length > 0) {
        const remainingHandlers = handlers.filter(h => !handlersToRemove.includes(h.id));
        if (remainingHandlers.length === 0) {
          actionHandlers.current.delete(action);
        } else {
          actionHandlers.current.set(action, remainingHandlers);
        }
      }

      // Update performance metrics
      const executionTime = performance.now() - startTime;
      const metrics = performanceMetrics.current;
      metrics.totalActions++;
      metrics.actionCounts[action] = (metrics.actionCounts[action] || 0) + 1;
      metrics.averageExecutionTime = 
        (metrics.averageExecutionTime * (metrics.totalActions - 1) + executionTime) / metrics.totalActions;
      metrics.lastActionTime = Date.now();

      // Add to history if enabled
      if (enableHistory) {
        setActionHistory(prev => {
          const newEntry = {
            action,
            payload,
            timestamp: Date.now(),
            executionTime,
            gameState,
            handlersExecuted: handlers.length
          };

          const newHistory = [newEntry, ...prev];
          return newHistory.slice(0, maxHistorySize);
        });
      }

      return true;

    } catch (error) {
      console.error(`[ActionSystem] Dispatch error for action ${action}:`, error);
      return false;
    }
  }, [gameState, isActionValidInContext, enableHistory, maxHistorySize]);

  /**
   * Get all registered actions
   * @returns {Array<string>} Array of registered action names
   */
  const getRegisteredActions = useCallback(() => {
    return Array.from(actionHandlers.current.keys());
  }, []);

  /**
   * Get handler count for a specific action
   * @param {string} action - The action to check
   * @returns {number} Number of registered handlers
   */
  const getHandlerCount = useCallback((action) => {
    const handlers = actionHandlers.current.get(action) || [];
    return handlers.length;
  }, []);

  /**
   * Clear all handlers and reset system
   */
  const reset = useCallback(() => {
    actionHandlers.current.clear();
    setActionHistory([]);
    performanceMetrics.current = {
      totalActions: 0,
      actionCounts: {},
      averageExecutionTime: 0,
      lastActionTime: null
    };
  }, []);

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics object
   */
  const getMetrics = useCallback(() => {
    return { ...performanceMetrics.current };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      actionHandlers.current.clear();
    };
  }, []);

  return {
    // Core functionality
    dispatch,
    registerHandler,
    unregisterAllHandlers,
    
    // Utility functions
    getRegisteredActions,
    getHandlerCount,
    isActionValidInContext: (action) => isActionValidInContext(action, gameState),
    
    // System management
    reset,
    
    // Debugging and monitoring
    actionHistory: enableHistory ? actionHistory : null,
    getMetrics,
    
    // Constants for convenience
    ACTIONS: GAME_ACTIONS,
    ACTION_CATEGORIES
  };
};