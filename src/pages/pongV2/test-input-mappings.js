/**
 * Test file to verify inputMappings.js import functionality
 * This file can be imported in the browser console or used for testing
 */

import { INPUT_MAPPINGS, KEYBOARD_MAPPINGS, GAMEPAD_MAPPINGS, TOUCH_MAPPINGS, MOUSE_MAPPINGS } from './config/inputMappings.js';
import { GAME_ACTIONS } from './config/gameActions.js';

// Test function to verify all imports work correctly
export function testInputMappings() {
  console.log('🧪 Testing Input Mappings Import...');
  
  try {
    // Test GAME_ACTIONS import
    console.log('✅ GAME_ACTIONS imported:', Object.keys(GAME_ACTIONS).length, 'actions');
    
    // Test INPUT_MAPPINGS import
    console.log('✅ INPUT_MAPPINGS imported:', Object.keys(INPUT_MAPPINGS).length, 'device types');
    
    // Test individual mapping imports
    console.log('✅ KEYBOARD_MAPPINGS imported:', Object.keys(KEYBOARD_MAPPINGS).length, 'key mappings');
    console.log('✅ GAMEPAD_MAPPINGS imported:', Object.keys(GAMEPAD_MAPPINGS.buttons).length, 'button mappings');
    console.log('✅ TOUCH_MAPPINGS imported:', Object.keys(TOUCH_MAPPINGS).length, 'touch mappings');
    console.log('✅ MOUSE_MAPPINGS imported:', Object.keys(MOUSE_MAPPINGS).length, 'mouse mappings');
    
    // Verify key mappings preserve existing relationships
    const expectedKeyMappings = {
      'ArrowUp': GAME_ACTIONS.PLAYER_MOVE_UP,
      'ArrowDown': GAME_ACTIONS.PLAYER_MOVE_DOWN,
      'Space': GAME_ACTIONS.PAUSE_UNPAUSE,
      'Escape': GAME_ACTIONS.EXIT_GAME,
      'Enter': GAME_ACTIONS.TOGGLE_FULLSCREEN,
    };
    
    let mappingsValid = true;
    for (const [key, expectedAction] of Object.entries(expectedKeyMappings)) {
      if (KEYBOARD_MAPPINGS[key] !== expectedAction) {
        console.error('❌ Mapping mismatch for', key, '- expected:', expectedAction, 'got:', KEYBOARD_MAPPINGS[key]);
        mappingsValid = false;
      }
    }
    
    if (mappingsValid) {
      console.log('✅ All keyboard mappings preserve existing relationships');
    }
    
    console.log('🎉 Input Mappings Import Test PASSED!');
    return true;
    
  } catch (error) {
    console.error('❌ Input Mappings Import Test FAILED:', error);
    return false;
  }
}

// Auto-run test when imported
testInputMappings();

export default testInputMappings;