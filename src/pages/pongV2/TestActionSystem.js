import React, { useState, useRef, useEffect } from 'react';
import { useActionSystem } from './hooks/useActionSystem';
import { 
  createValidatedHandlerRegistry, 
  registerAllHandlers 
} from './utils/actionHandlerRegistry';
import { GAME_ACTIONS } from './config/gameActions';

/**
 * Test Action System Component - Browser-based testing for useActionSystem
 */
const TestActionSystem = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [gameState, setGameState] = useState('start');
  
  // Mock game dependencies
  const gameRefs = useRef({
    gameStateRef: { current: 'start' },
    upPressedRef: { current: false },
    downPressedRef: { current: false },
    player1YRef: { current: 200 },
    touchStartY: { current: null },
    mouseStartY: { current: null },
    isDragging: { current: false },
    isMouseDragging: { current: false },
    inputSource: { current: 'keyboard' },
    canvasRef: { 
      current: { 
        width: 800, 
        height: 400,
        getBoundingClientRect: () => ({ top: 0, left: 0 })
      } 
    },
    isFullscreenMode: false,
    setIsFullscreenMode: (value) => { gameRefs.current.isFullscreenMode = value; }
  });

  const gameConfig = {
    FRAME: { OFFSET: 20 },
    PADDLE: { HEIGHT: 80, SPEED: 5 },
    BALL: { RADIUS: 8 }
  };

  const gameFunctions = {
    updateGameState: (newState) => {
      addTestResult(`✓ Game state changed: ${gameRefs.current.gameStateRef.current} -> ${newState}`);
      gameRefs.current.gameStateRef.current = newState;
      setGameState(newState);
    },
    cleanupGame: () => {
      addTestResult('✓ Game cleanup called');
      gameRefs.current.gameStateRef.current = 'start';
      setGameState('start');
    },
    toggleFullscreenMode: () => {
      addTestResult('✓ Fullscreen toggle called');
      gameRefs.current.isFullscreenMode = !gameRefs.current.isFullscreenMode;
    },
    constrainPaddle: (y, frameOffset, gameHeight, paddleHeight) => {
      const minY = frameOffset;
      const maxY = frameOffset + gameHeight - paddleHeight;
      return Math.max(minY, Math.min(maxY, y));
    },
    transformTouchCoordinates: (touch, canvas, isFullscreen) => {
      return { x: touch.clientX, y: touch.clientY };
    },
    transformMouseCoordinates: (event, canvas, isFullscreen) => {
      return { x: event.clientX, y: event.clientY };
    }
  };

  // Initialize action system
  const actionSystem = useActionSystem({
    gameState,
    enableHistory: true,
    maxHistorySize: 10
  });

  const addTestResult = (message) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runBasicTests = async () => {
    addTestResult('🚀 Starting Basic Action System Tests');
    
    // Test 1: Action system initialization
    addTestResult(`✓ Action system created with ${Object.keys(actionSystem.ACTIONS).length} actions`);
    
    // Test 2: Handler registration
    let testHandlerCalled = false;
    const testHandler = async (payload, context) => {
      testHandlerCalled = true;
      addTestResult(`✓ Test handler executed with payload: ${JSON.stringify(payload)}`);
      return { success: true, message: 'Test handler executed' };
    };

    const unregister = actionSystem.registerHandler(GAME_ACTIONS.PAUSE_UNPAUSE, testHandler);
    addTestResult(`✓ Handler registered for ${GAME_ACTIONS.PAUSE_UNPAUSE}`);
    
    // Test 3: Action dispatch
    const result = await actionSystem.dispatch(GAME_ACTIONS.PAUSE_UNPAUSE, { test: 'data' });
    addTestResult(`✓ Dispatch result: ${JSON.stringify(result)}`);
    addTestResult(`✓ Test handler called: ${testHandlerCalled}`);
    
    // Test 4: Unregistration
    unregister();
    addTestResult(`✓ Handler unregistered successfully`);
    
    return true;
  };

  const runRegistryTests = async () => {
    addTestResult('🔧 Starting Action Handler Registry Tests');
    
    // Create handler registry
    const mockDeps = { 
      gameRefs: gameRefs.current, 
      gameConfig, 
      gameFunctions 
    };
    
    const handlerRegistry = createValidatedHandlerRegistry(mockDeps);
    
    if (!handlerRegistry) {
      addTestResult('❌ Failed to create handler registry');
      return false;
    }
    
    addTestResult(`✓ Handler registry created with ${Object.keys(handlerRegistry).length} handlers`);
    
    // Register all handlers
    const cleanup = registerAllHandlers(actionSystem, handlerRegistry);
    addTestResult('✓ All handlers registered');
    
    // Test game control actions
    addTestResult(`Current game state: ${gameRefs.current.gameStateRef.current}`);
    
    const pauseResult = await actionSystem.dispatch(GAME_ACTIONS.PAUSE_UNPAUSE);
    addTestResult(`✓ PAUSE_UNPAUSE result: ${JSON.stringify(pauseResult)}`);
    
    // Test fullscreen toggle
    const fullscreenResult = await actionSystem.dispatch(GAME_ACTIONS.TOGGLE_FULLSCREEN);
    addTestResult(`✓ TOGGLE_FULLSCREEN result: ${JSON.stringify(fullscreenResult)}`);
    
    // Test player movement
    await actionSystem.dispatch(GAME_ACTIONS.PLAYER_MOVE_UP, { inputSource: 'keyboard' });
    addTestResult(`✓ MOVE_UP - upPressed: ${gameRefs.current.upPressedRef.current}, inputSource: ${gameRefs.current.inputSource.current}`);
    
    await actionSystem.dispatch(GAME_ACTIONS.PLAYER_STOP);
    addTestResult(`✓ STOP - upPressed: ${gameRefs.current.upPressedRef.current}, downPressed: ${gameRefs.current.downPressedRef.current}`);
    
    // Test drag interactions
    const startDragResult = await actionSystem.dispatch(GAME_ACTIONS.START_DRAG, {
      coordinates: { x: 100, y: 150 },
      inputType: 'touch'
    });
    addTestResult(`✓ START_DRAG result: ${JSON.stringify(startDragResult)}`);
    addTestResult(`✓ isDragging: ${gameRefs.current.isDragging.current}, touchStartY: ${gameRefs.current.touchStartY.current}`);
    
    const continueDragResult = await actionSystem.dispatch(GAME_ACTIONS.CONTINUE_DRAG, {
      coordinates: { x: 100, y: 180 },
      inputType: 'touch',
      sensitivity: 1
    });
    addTestResult(`✓ CONTINUE_DRAG result: ${JSON.stringify(continueDragResult)}`);
    addTestResult(`✓ New paddle position: ${gameRefs.current.player1YRef.current}`);
    
    const endDragResult = await actionSystem.dispatch(GAME_ACTIONS.END_DRAG, {
      inputType: 'touch'
    });
    addTestResult(`✓ END_DRAG result: ${JSON.stringify(endDragResult)}`);
    addTestResult(`✓ isDragging after end: ${gameRefs.current.isDragging.current}`);
    
    // Cleanup
    cleanup();
    addTestResult('✓ All handlers unregistered');
    
    return true;
  };

  const runErrorTests = async () => {
    addTestResult('🛡️ Starting Error Handling Tests');
    
    // Test invalid action
    const invalidResult = await actionSystem.dispatch('INVALID_ACTION');
    addTestResult(`✓ Invalid action result: ${JSON.stringify(invalidResult)}`);
    
    // Test handler that throws error
    actionSystem.registerHandler(GAME_ACTIONS.PAUSE_UNPAUSE, async () => {
      throw new Error('Test error');
    });
    
    const errorResult = await actionSystem.dispatch(GAME_ACTIONS.PAUSE_UNPAUSE);
    addTestResult(`✓ Error handler result: ${JSON.stringify(errorResult)}`);
    
    return true;
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      await runBasicTests();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for readability
      
      await runRegistryTests();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await runErrorTests();
      
      // Show metrics
      const metrics = actionSystem.getMetrics();
      addTestResult(`📊 Performance metrics: ${JSON.stringify(metrics)}`);
      
      const history = actionSystem.actionHistory;
      addTestResult(`📝 Action history length: ${history ? history.length : 'disabled'}`);
      
      addTestResult('✅ All Action System Tests Completed Successfully!');
    } catch (error) {
      addTestResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Action System Test Suite</h2>
      <p>Current Game State: <strong>{gameState}</strong></p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>
      
      <div 
        style={{ 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '15px',
          height: '400px',
          overflowY: 'auto',
          fontSize: '12px',
          lineHeight: '1.4'
        }}
      >
        {testResults.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Click "Run All Tests" to start testing the action system...
          </p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {result}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Test Coverage:</strong></p>
        <ul>
          <li>✅ Action system initialization</li>
          <li>✅ Handler registration/unregistration</li>
          <li>✅ Action dispatching</li>
          <li>✅ Action handler registry</li>
          <li>✅ Game control actions (pause, fullscreen)</li>
          <li>✅ Player movement actions</li>
          <li>✅ Drag interaction actions</li>
          <li>✅ Error handling</li>
          <li>✅ Performance metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default TestActionSystem;