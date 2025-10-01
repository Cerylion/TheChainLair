/**
 * TestInputMapper Component - Browser-based Testing for useInputMapper Hook
 * 
 * This component provides comprehensive testing for the useInputMapper hook,
 * including input mapping, device detection, and action dispatching.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import useInputMapper from '../hooks/useInputMapper.js';
import { GAME_ACTIONS } from '../config/gameActions.js';

const TestInputMapper = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [inputHistory, setInputHistory] = useState([]);
  const [currentTest, setCurrentTest] = useState('');
  
  // Mock action dispatcher for testing
  const mockActionDispatcher = useCallback((action, context) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      action,
      context,
      id: Date.now() + Math.random()
    };
    
    setInputHistory(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
    
    // Log to console for debugging
    console.log('Action dispatched:', action, context);
  }, []);

  // Initialize useInputMapper with mock dispatcher
  const {
    mapKeyboardInput,
    mapGamepadInput,
    mapTouchInput,
    mapMouseInput,
    updateMappings,
    getInputStatus,
    resetInputTracking,
    currentInputSource,
    activeSources
  } = useInputMapper(mockActionDispatcher, {
    enableMultiInput: true,
    inputTimeout: 200
  });

  // Test utilities
  const addTestResult = useCallback((testName, passed, message) => {
    const result = {
      id: Date.now() + Math.random(),
      testName,
      passed,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
  }, []);

  const clearResults = useCallback(() => {
    setTestResults([]);
    setInputHistory([]);
    resetInputTracking();
  }, [resetInputTracking]);

  // Test functions
  const runBasicMappingTests = useCallback(() => {
    setCurrentTest('Basic Input Mapping Tests');
    
    // Test keyboard mapping
    const mockKeyEvent = { key: 'ArrowUp', preventDefault: () => {} };
    const keyboardAction = mapKeyboardInput(mockKeyEvent);
    
    if (keyboardAction === GAME_ACTIONS.PLAYER_MOVE_UP) {
      addTestResult('Keyboard Mapping', true, 'ArrowUp correctly mapped to PLAYER_MOVE_UP');
    } else {
      addTestResult('Keyboard Mapping', false, `Expected PLAYER_MOVE_UP, got ${keyboardAction}`);
    }

    // Test invalid key mapping
    const invalidKeyEvent = { key: 'InvalidKey', preventDefault: () => {} };
    const invalidAction = mapKeyboardInput(invalidKeyEvent);
    
    if (invalidAction === null) {
      addTestResult('Invalid Key Mapping', true, 'Invalid key correctly returns null');
    } else {
      addTestResult('Invalid Key Mapping', false, `Expected null, got ${invalidAction}`);
    }

    // Test gamepad mapping
    const mockGamepadState = {
      buttons: [
        { pressed: true }, // Button 0 (A/X)
        { pressed: false },
        { pressed: false },
        { pressed: false }
      ],
      axes: [0, -0.8, 0, 0] // Left stick up
    };
    
    const gamepadActions = mapGamepadInput(mockGamepadState);
    
    if (Array.isArray(gamepadActions) && gamepadActions.length > 0) {
      addTestResult('Gamepad Mapping', true, `Gamepad input mapped to ${gamepadActions.length} actions`);
    } else {
      addTestResult('Gamepad Mapping', false, 'Gamepad input mapping failed');
    }

    // Test touch mapping
    const mockTouchEvent = { touches: [{ clientX: 100, clientY: 100 }] };
    const touchAction = mapTouchInput(mockTouchEvent, 'tap');
    
    if (touchAction === GAME_ACTIONS.PAUSE_UNPAUSE) {
      addTestResult('Touch Mapping', true, 'Touch tap correctly mapped to PAUSE_UNPAUSE');
    } else {
      addTestResult('Touch Mapping', false, `Expected PAUSE_UNPAUSE, got ${touchAction}`);
    }
  }, [mapKeyboardInput, mapGamepadInput, mapTouchInput, addTestResult]);

  const runInputSourceTests = useCallback(() => {
    setCurrentTest('Input Source Detection Tests');
    
    // Reset tracking first
    resetInputTracking();
    
    // Simulate keyboard input
    const keyEvent = { key: ' ', preventDefault: () => {} };
    mapKeyboardInput(keyEvent);
    
    setTimeout(() => {
      const status = getInputStatus();
      
      if (status.currentSource === 'keyboard') {
        addTestResult('Input Source Detection', true, 'Keyboard input source correctly detected');
      } else {
        addTestResult('Input Source Detection', false, `Expected keyboard, got ${status.currentSource}`);
      }

      if (status.activeSources.includes('keyboard')) {
        addTestResult('Active Sources Tracking', true, 'Keyboard added to active sources');
      } else {
        addTestResult('Active Sources Tracking', false, 'Keyboard not found in active sources');
      }
    }, 50);
  }, [mapKeyboardInput, getInputStatus, resetInputTracking, addTestResult]);

  const runCustomMappingTests = useCallback(() => {
    setCurrentTest('Custom Mapping Tests');
    
    // Test custom mapping update
    const customMappings = {
      keyboard: {
        'w': GAME_ACTIONS.PLAYER_MOVE_UP,
        's': GAME_ACTIONS.PLAYER_MOVE_DOWN
      }
    };
    
    updateMappings(customMappings);
    
    // Test custom key mapping
    const customKeyEvent = { key: 'w', preventDefault: () => {} };
    const customAction = mapKeyboardInput(customKeyEvent);
    
    if (customAction === GAME_ACTIONS.PLAYER_MOVE_UP) {
      addTestResult('Custom Mapping', true, 'Custom key mapping (w -> PLAYER_MOVE_UP) works');
    } else {
      addTestResult('Custom Mapping', false, `Custom mapping failed, got ${customAction}`);
    }
  }, [updateMappings, mapKeyboardInput, addTestResult]);

  const runPerformanceTests = useCallback(() => {
    setCurrentTest('Performance Tests');
    
    const iterations = 1000;
    const startTime = performance.now();
    
    // Simulate rapid input mapping
    for (let i = 0; i < iterations; i++) {
      const mockEvent = { key: 'ArrowUp', preventDefault: () => {} };
      mapKeyboardInput(mockEvent);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    if (avgTime < 1) { // Less than 1ms per mapping
      addTestResult('Performance Test', true, `Average mapping time: ${avgTime.toFixed(3)}ms`);
    } else {
      addTestResult('Performance Test', false, `Mapping too slow: ${avgTime.toFixed(3)}ms`);
    }
  }, [mapKeyboardInput, addTestResult]);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      runBasicMappingTests();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      runInputSourceTests();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      runCustomMappingTests();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      runPerformanceTests();
      
      addTestResult('All Tests', true, 'Test suite completed successfully');
    } catch (error) {
      addTestResult('Test Suite', false, `Error running tests: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [runBasicMappingTests, runInputSourceTests, runCustomMappingTests, runPerformanceTests, clearResults, addTestResult]);

  // Real input event handlers for live testing
  useEffect(() => {
    const handleKeyDown = (e) => {
      mapKeyboardInput(e, 'keydown');
    };

    const handleKeyUp = (e) => {
      mapKeyboardInput(e, 'keyup');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mapKeyboardInput]);

  // Gamepad polling for live testing
  useEffect(() => {
    let gamepadInterval;
    
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          mapGamepadInput(gamepads[i], i);
        }
      }
    };

    gamepadInterval = setInterval(pollGamepads, 100);

    return () => {
      if (gamepadInterval) {
        clearInterval(gamepadInterval);
      }
    };
  }, [mapGamepadInput]);

  const inputStatus = getInputStatus();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>🎮 Input Mapper Test Suite</h1>
      
      {/* Test Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Test Controls</h3>
        <button 
          onClick={runAllTests} 
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px', 
            backgroundColor: isRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
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
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
        {currentTest && (
          <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
            Currently running: {currentTest}
          </div>
        )}
      </div>

      {/* Input Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Input Status</h3>
        <div><strong>Current Input Source:</strong> {inputStatus.currentSource}</div>
        <div><strong>Active Sources:</strong> {inputStatus.activeSources.join(', ') || 'None'}</div>
        <div><strong>Last Input Times:</strong></div>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {Object.entries(inputStatus.lastInputTimes).map(([source, time]) => (
            <li key={source}>
              {source}: {new Date(time).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      {/* Live Input Testing */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Live Input Testing</h3>
        <p>Try these inputs to test live mapping:</p>
        <ul>
          <li><strong>Keyboard:</strong> Arrow keys, Spacebar, Enter, Escape</li>
          <li><strong>Gamepad:</strong> Connect a gamepad and use buttons/sticks</li>
        </ul>
      </div>

      {/* Test Results */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Test Results ({testResults.length})</h3>
        {testResults.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {testResults.map(result => (
              <div 
                key={result.id}
                style={{ 
                  padding: '8px',
                  margin: '5px 0',
                  backgroundColor: result.passed ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${result.passed ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '3px'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {result.passed ? '✅' : '❌'} {result.testName}
                </div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {result.message} ({result.timestamp})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input History */}
      <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
        <h3>Input History ({inputHistory.length})</h3>
        {inputHistory.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No inputs recorded yet. Try pressing keys or running tests.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {inputHistory.map(entry => (
              <div 
                key={entry.id}
                style={{ 
                  padding: '8px',
                  margin: '5px 0',
                  backgroundColor: '#e9ecef',
                  border: '1px solid #dee2e6',
                  borderRadius: '3px',
                  fontSize: '0.9em'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {entry.action} ({entry.timestamp})
                </div>
                <div style={{ color: '#666' }}>
                  Source: {entry.context.inputSource} | Type: {entry.context.inputType}
                  {entry.context.analogValue && ` | Value: ${entry.context.analogValue.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestInputMapper;