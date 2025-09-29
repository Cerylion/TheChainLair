/**
 * Pong Game Component
 * 
 * This component implements a classic Pong game using HTML5 Canvas and React.
 * The player controls the left paddle using arrow keys or gamepad, while the right paddle
 * is controlled by a computer AI.
 */
/**
 * ========================================
 * PONG GAME COMPONENT - COMPREHENSIVE GUIDE
 * ========================================
 * 
 * This is a complete implementation of the classic Pong game using React and HTML5 Canvas.
 * 
 * GAME FEATURES:
 * - Single player vs AI computer opponent
 * - Multiple input methods: Keyboard (arrow keys), Gamepad, Touch (mobile)
 * - Fullscreen mode support for desktop and mobile
 * - Sound effects for paddle hits and scoring
 * - Responsive design that works on all screen sizes
 * - Mobile-optimized touch controls with drag sensitivity
 * 
 * TECHNICAL ARCHITECTURE:
 * - React functional component with hooks for state management
 * - HTML5 Canvas for high-performance 2D graphics rendering
 * - Game loop using requestAnimationFrame for smooth 60fps animation
 * - Event-driven input handling for keyboard, gamepad, and touch
 * - Collision detection using bounding box intersection
 * - AI opponent using simple tracking algorithm with difficulty scaling
 * 
 * CODE STRUCTURE:
 * 1. Component setup and state initialization
 * 2. Utility functions (mobile detection, state management)
 * 3. Game initialization and canvas setup
 * 4. Input event handlers (keyboard, gamepad, touch)
 * 5. Game logic (physics, collision detection, AI)
 * 6. Rendering functions (drawing game objects and UI)
 * 7. Game loop and lifecycle management
 * 8. Component cleanup and event listener removal
 */
import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Sound effect imports - These are audio files that play during game events
import PADDLE_HIT_SOUND from './assets/sounds/bip.mp3';  // Sound when ball hits paddle
import SCORE_SOUND from './assets/sounds/score.mp3';      // Sound when player scores

const Pong = () => {
  // ========================================
  // REACT STATE AND REFS SETUP
  // ========================================
  
  // Canvas reference - Direct access to the HTML5 canvas element for drawing
  const canvasRef = useRef(null);
  
  // Gamepad connection state - Tracks if a gamepad controller is connected
  const [gamepadConnected, setGamepadConnected] = useState(false);
  
  // Game state management - Controls the current phase of the game
  const [_, setGameState] = useState('start'); // React state (not used directly in game logic)
  const gameStateRef = useRef('start'); // Ref for immediate access in game loop
  // Possible states: 'start' (waiting to begin), 'playing' (active game), 'paused' (game paused)
  
  // Mobile device detection states
  const [isMobile, setIsMobile] = useState(false);     // Is this a mobile device?
  const [isPaused, setIsPaused] = useState(false);     // Is the game currently paused?
  
  // Input source tracking - Determines which input method is currently being used
  const inputSource = useRef('keyboard'); // Options: 'keyboard', 'gamepad', 'touch'
  
  // Game lifecycle control - Used to stop the game loop when component unmounts
  const isGameActive = useRef(true);
  
  // ========================================
  // TOUCH CONTROL STATE VARIABLES
  // ========================================
  
  // Touch interaction tracking for mobile devices
  const touchStartY = useRef(null);    // Y-coordinate where touch began
  const isDragging = useRef(false);    // Is the user currently dragging their finger?
  
  // Double-tap detection for fullscreen toggle on mobile
  const lastTapTime = useRef(0);       // Timestamp of the last tap
  const doubleTapDelay = 300;          // Maximum time between taps to count as double-tap (milliseconds)
  
  // ========================================
  // FULLSCREEN AND AUDIO REFERENCES
  // ========================================
  
  // Fullscreen mode state - Tracks if the game is in fullscreen mode
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  
  // Audio references for game sound effects
  const paddleHitSound = useRef(null); // Audio object for paddle hit sound
  const scoreSound = useRef(null);     // Audio object for scoring sound
  
  // ========================================
  // GAMEPAD BUTTON STATE TRACKING
  // ========================================
  
  // These refs prevent multiple triggers when gamepad buttons are held down
  const lastSouthButtonStateRef = useRef(false);  // A button (start/pause game)
  const lastEastButtonStateRef = useRef(false);   // B button (exit game)
  const lastNorthButtonStateRef = useRef(false);  // Y button (fullscreen toggle)

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Detects if the current device is a mobile device
   * 
   * This function uses multiple detection methods to ensure accurate mobile detection:
   * 1. User agent string analysis - Checks for mobile device keywords
   * 2. Touch capability detection - Checks if the device supports touch
   * 3. Touch points detection - Checks maximum number of simultaneous touches
   * 
   * @returns {boolean} True if mobile device is detected, false otherwise
   */
  const detectMobileDevice = () => {
    // Get user agent string from browser
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for mobile device patterns in user agent string
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
                          ('ontouchstart' in window) ||           // Touch events supported
                          (navigator.maxTouchPoints > 0) ||       // Modern touch detection
                          (navigator.msMaxTouchPoints > 0);       // IE/Edge touch detection
    return isMobileDevice;
  };

  /**
   * Updates both React state and ref for game state
   * 
   * We need both because:
   * - React state triggers re-renders for UI updates
   * - Ref provides immediate access in the game loop without waiting for re-renders
   * 
   * @param {string} newState - The new game state ('start', 'playing', or 'paused')
   */
  const updateGameState = (newState) => {
    gameStateRef.current = newState;  // Update ref for immediate access
    setGameState(newState);           // Update React state for UI re-rendering
  };

  useEffect(() => {
    // ========================================
    // COMPONENT INITIALIZATION AND SETUP
    // ========================================
    
    // Detect if this is a mobile device and store the result
    // This affects input handling, UI display, and fullscreen behavior
    const mobileDetected = detectMobileDevice();
    setIsMobile(mobileDetected);
    console.log("Mobile device detected:", mobileDetected);
    
    // ========================================
    // AUDIO SYSTEM INITIALIZATION
    // ========================================
    
    // Create Audio objects for game sound effects
    // These are loaded once and reused throughout the game
    paddleHitSound.current = new Audio(PADDLE_HIT_SOUND);  // Sound when ball hits paddle
    scoreSound.current = new Audio(SCORE_SOUND);           // Sound when someone scores
    
    // ========================================
    // CANVAS AND RENDERING CONTEXT SETUP
    // ========================================
    
    // Get references to the canvas element and its 2D rendering context
    // The canvas is where all game graphics are drawn
    const canvas = canvasRef.current;                      // HTML5 canvas element
    const ctx = canvas.getContext('2d');                   // 2D rendering context for drawing
    
    // Gamepad polling interval variable (will be initialized later)
    // This controls how often we check for gamepad input (~60fps)
    let gamepadPollingInterval;
    
    // ========================================
    // GAME CONSTANTS AND DIMENSIONS
    // ========================================
    
    // Define the physical dimensions of all game objects
    const paddleHeight = 100;  // Height of both player and computer paddles (pixels)
    const paddleWidth = 10;    // Width of both paddles (pixels)
    const ballRadius = 8;      // Radius of the game ball (pixels)
    const frameOffset = 24;    // Thickness of the decorative frame border (pixels)
    
    // Calculate the actual playable game area (excluding the decorative frame)
    const gameWidth = canvas.width - (frameOffset * 2);   // 800px playable width
    const gameHeight = canvas.height - (frameOffset * 2); // 500px playable height
    
    // ========================================
    // GAME OBJECT INITIAL POSITIONS AND PHYSICS
    // ========================================
    
    // Ball starting position and velocity
    // The ball starts in the center of the playable area
    let ballX = frameOffset + gameWidth / 2;   // Horizontal center of game area
    let ballY = frameOffset + gameHeight / 2;  // Vertical center of game area
    let ballSpeedX = 5;                        // Initial horizontal velocity (positive = moving right)
    let ballSpeedY = 3;                        // Initial vertical velocity (positive = moving down)
    
    // Paddle starting positions
    // Both paddles start vertically centered in the game area
    let player1Y = frameOffset + (gameHeight - paddleHeight) / 2;  // Left paddle (human player)
    let player2Y = frameOffset + (gameHeight - paddleHeight) / 2;  // Right paddle (AI computer)
    
    // ========================================
    // GAME STATE VARIABLES
    // ========================================
    
    // Score tracking for both players
    let player1Score = 0;  // Human player's score (left side)
    let player2Score = 0;  // Computer AI's score (right side)
    
    // Input state tracking for keyboard controls
    // These flags track which keys are currently pressed
    let upPressed = false;    // Is the up arrow key currently pressed?
    let downPressed = false;  // Is the down arrow key currently pressed?
    
    // ========================================
    // GAMEPAD SYSTEM VARIABLES
    // ========================================
    
    // Gamepad connection and state management
    let gamepads = {};        // Object to store connected gamepad references
    let gamepadIndex = null;  // Index of the currently active gamepad (null if none)
    
    // ========================================
    // AI DIFFICULTY CONFIGURATION
    // ========================================
    
    // Computer AI difficulty level (0.0 to 1.0)
    // 0.0 = Computer never moves (easiest)
    // 1.0 = Computer tracks ball perfectly (hardest)
    // 0.85 = Challenging but beatable difficulty
    const computerDifficulty = 0.85;
    
    // ========================================
    // GAMEPAD EVENT HANDLERS
    // ========================================
    
    /**
     * Handles gamepad connection events
     * 
     * When a gamepad is connected to the system, this function:
     * 1. Logs the connection for debugging
     * 2. Stores the gamepad reference for later use
     * 3. Sets the active gamepad index
     * 4. Updates the UI to show gamepad is connected
     * 
     * @param {GamepadEvent} e - Browser event containing gamepad information
     */
    const gamepadConnectHandler = (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
      gamepads[e.gamepad.index] = e.gamepad;  // Store gamepad reference
      gamepadIndex = e.gamepad.index;         // Set as active gamepad
      setGamepadConnected(true);              // Update React state for UI
    };
    
    /**
     * Handles gamepad disconnection events
     * 
     * When a gamepad is disconnected from the system, this function:
     * 1. Logs the disconnection for debugging
     * 2. Removes the gamepad reference from storage
     * 3. Clears the active gamepad index if it was the disconnected one
     * 4. Updates the UI to show no gamepad is connected
     * 
     * @param {GamepadEvent} e - Browser event containing gamepad information
     */
    const gamepadDisconnectHandler = (e) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
      delete gamepads[e.gamepad.index];       // Remove gamepad reference
      if (gamepadIndex === e.gamepad.index) {
        gamepadIndex = null;                  // Clear active gamepad if it was this one
      }
      setGamepadConnected(false);             // Update React state for UI
    };
    
    // ========================================
    // GAMEPAD DETECTION FOR ALREADY CONNECTED DEVICES
    // ========================================
    
    /**
     * Checks for gamepads that were already connected before the page loaded
     * 
     * The Gamepad API doesn't fire connection events for devices that were
     * already connected when the page loaded, so we need to manually check.
     * This function scans all gamepad slots and activates the first one found.
     */
    const checkGamepads = () => {
      // Get array of all connected gamepads (some slots may be null)
      const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      
      // Scan through all possible gamepad slots
      for (let i = 0; i < connectedGamepads.length; i++) {
        if (connectedGamepads[i]) {  // If a gamepad exists in this slot
          gamepads[connectedGamepads[i].index] = connectedGamepads[i];  // Store reference
          gamepadIndex = connectedGamepads[i].index;                    // Set as active
          setGamepadConnected(true);                                    // Update UI
          console.log("Found existing gamepad:", connectedGamepads[i].id);
          break;  // Use the first gamepad found
        }
      }
    };

    /**
     * Handles key press events for paddle movement and game control
     * 
     * This function processes all keyboard input for the game:
     * - SPACE: Start game or toggle pause/resume
     * - ESCAPE: Exit game (only when paused)
     * - ENTER: Toggle fullscreen mode
     * - ARROW KEYS: Start game or control paddle movement
     * 
     * @param {KeyboardEvent} e - The keyboard event object containing key information
     */
    const keyDownHandler = (e) => {
      // Set input source to keyboard when any keyboard input is detected
      // This helps the UI show appropriate instructions for the current input method
      inputSource.current = 'keyboard';
      
      // ========================================
      // SPACEBAR - GAME STATE CONTROL
      // ========================================
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        
        // Handle different game state transitions based on current state
        if (gameStateRef.current === 'start') {
          // Start the game from the initial screen
          updateGameState('playing');
        } else if (gameStateRef.current === 'playing') {
          // Pause the active game
          updateGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          // Resume the paused game
          updateGameState('playing');
        }
        return; // Exit early to prevent other key processing
      }
      
      // ========================================
      // ESCAPE KEY - EXIT GAME (PAUSE STATE ONLY)
      // ========================================
      if (e.key === 'Escape') {
        e.preventDefault(); // Prevent default browser behavior
        
        // Only allow exit when game is paused (safety feature)
        // This prevents accidental exits during active gameplay
        if (gameStateRef.current === 'paused') {
          cleanupGame(); // Properly clean up resources and exit
        }
        // Ignore Escape key in other states (start/playing)
        return;
      }
      
      // ========================================
      // ENTER KEY - FULLSCREEN TOGGLE
      // ========================================
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission or other default behavior
        toggleFullscreenMode(); // Toggle between windowed and fullscreen modes
        return;
      }
      
      // ========================================
      // ARROW KEYS - GAME START FROM START SCREEN
      // ========================================
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'start') {
        e.preventDefault(); // Prevent page scrolling
        updateGameState('playing'); // Start the game immediately
        return;
      }
      
      // ========================================
      // ARROW KEYS - PADDLE MOVEMENT (PLAYING STATE ONLY)
      // ========================================
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'playing') {
        // Prevent default browser scrolling behavior
        e.preventDefault();
        
        // Confirm keyboard as the active input source
        inputSource.current = 'keyboard';
        
        // Set movement flags based on which arrow key was pressed
        if (e.key === 'ArrowUp') {
          upPressed = true;    // Enable upward paddle movement
        } else if (e.key === 'ArrowDown') {
          downPressed = true;  // Enable downward paddle movement
        }
      }
    };
    
    /**
     * Handles key release events for paddle movement
     * 
     * This function clears movement flags when arrow keys are released,
     * stopping paddle movement. It only responds to keyboard events when
     * keyboard is the current input source to avoid conflicts with gamepad input.
     * 
     * @param {KeyboardEvent} e - The keyboard event object
     */
    const keyUpHandler = (e) => {
      // Only process arrow key releases
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Only handle keyboard events if keyboard is the current input source
        // This prevents gamepad input from being overridden by stale keyboard events
        if (inputSource.current === 'keyboard') {
          if (e.key === 'ArrowUp') {
            upPressed = false;    // Stop upward paddle movement
          } else if (e.key === 'ArrowDown') {
            downPressed = false;  // Stop downward paddle movement
          }
        }
      }
    };
    
    // Event listeners will be added in useEffect for proper cleanup
    
    // ========================================
    // TOUCH EVENT HANDLERS FOR MOBILE DEVICES
    // ========================================
    
    /**
     * Handles touch start events for mobile paddle control and game interaction
     * 
     * This function manages all touch-based interactions including:
     * - Game state control (start/pause/resume)
     * - Double-tap detection for fullscreen toggle
     * - Exit button interaction when paused
     * - Initial touch position tracking for paddle dragging
     * 
     * @param {TouchEvent} e - The touch event object containing touch information
     */
    const touchStartHandler = (e) => {
      // Prevent default browser touch behavior (scrolling, zooming, etc.)
      e.preventDefault();
      
      // Get the first touch point (we only handle single-touch input)
      const touch = e.touches[0];
      
      // Calculate touch position relative to the canvas element
      const rect = canvas.getBoundingClientRect(); // Get canvas position on screen
      const touchX = touch.clientX - rect.left;    // Touch X relative to canvas
      const touchY = touch.clientY - rect.top;     // Touch Y relative to canvas
      
      // Set input source to touch for UI instruction display
      inputSource.current = 'touch';
      
      // ========================================
      // DOUBLE-TAP DETECTION FOR FULLSCREEN TOGGLE
      // ========================================
      
      // Get current timestamp for double-tap timing calculation
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTapTime.current;
      
      // Check if this tap occurred within the double-tap time window
      if (timeDiff < doubleTapDelay) {
        // Double-tap detected - toggle fullscreen mode
        toggleFullscreenMode();
        lastTapTime.current = 0; // Reset to prevent triple-tap issues
        return; // Exit early to prevent other touch processing
      }
      
      // Store this tap time for future double-tap detection
      lastTapTime.current = currentTime;
      
      // ========================================
      // EXIT BUTTON INTERACTION (PAUSE STATE ONLY)
      // ========================================
      
      // Check if the game is paused and user touched the exit button
      if (gameStateRef.current === 'paused') {
        // Define exit button dimensions and position (top-left corner)
        const buttonWidth = 80;   // Button width in pixels
        const buttonHeight = 40;  // Button height in pixels
        const buttonX = 20;       // Button X position from left edge
        const buttonY = 20;       // Button Y position from top edge
        
        // Check if touch coordinates are within the exit button bounds
        if (touchX >= buttonX && touchX <= buttonX + buttonWidth &&
            touchY >= buttonY && touchY <= buttonY + buttonHeight) {
          // Exit button was touched - clean up and exit the game
          cleanupGame();
          return; // Exit early to prevent other touch processing
        }
      }
      
      // ========================================
      // PADDLE DRAGGING INITIALIZATION
      // ========================================
      
      // Store the initial touch Y position for calculating paddle movement
      // This allows for relative movement based on finger drag distance
      touchStartY.current = touchY;
      isDragging.current = false; // Reset dragging state
      
      // ========================================
      // GAME STATE CONTROL VIA TOUCH
      // ========================================
      
      // Handle different game state transitions based on current state
      if (gameStateRef.current === 'start') {
        // Start the game immediately when touched from start screen
        updateGameState('playing');
      } else if (gameStateRef.current === 'playing') {
        // Don't pause immediately on touch start - wait to see if it's a drag gesture
        // This prevents accidental pausing when user intends to drag the paddle
        setTimeout(() => {
          // Only pause if the user didn't start dragging within 100ms
          if (!isDragging.current) {
            updateGameState('paused');
          }
        }, 100); // 100ms delay to detect drag intent
      } else if (gameStateRef.current === 'paused') {
        // Resume the game immediately when touched from pause screen
        updateGameState('playing');
      }
    };
   
    /**
     * Handles touch move events for paddle dragging control
     * 
     * This function enables smooth paddle movement by tracking finger movement
     * and translating it to paddle position changes. It includes:
     * - Drag detection based on movement threshold
     * - Relative paddle movement calculation
     * - Paddle boundary constraint enforcement
     * 
     * @param {TouchEvent} e - The touch event object containing current touch position
     */
    const touchMoveHandler = (e) => {
      // Prevent default browser touch behavior (scrolling, selection, etc.)
      e.preventDefault();
      
      // Exit early if no initial touch position was recorded
      if (touchStartY.current === null) return;
      
      // Get current touch position relative to canvas
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      
      // ========================================
      // DRAG DETECTION AND THRESHOLD CHECK
      // ========================================
      
      // Calculate movement threshold to determine if this is intentional dragging
      // A small threshold prevents accidental paddle movement from tiny finger movements
      const moveThreshold = 3; // Pixels of movement required to register as drag
      
      // Check if finger has moved beyond the threshold distance
      if (Math.abs(touchY - touchStartY.current) > moveThreshold) {
        isDragging.current = true; // Mark as active dragging gesture
      }
      
      // ========================================
      // PADDLE MOVEMENT DURING ACTIVE GAMEPLAY
      // ========================================
      
      // Only process paddle movement when game is active and user is dragging
      if (gameStateRef.current === 'playing' && isDragging.current) {
        // Calculate relative movement from the last recorded touch position
        // This allows for smooth, continuous paddle movement
        const deltaY = touchY - touchStartY.current;
        const newPaddleY = player1Y + deltaY;
        
        // ========================================
        // PADDLE BOUNDARY CONSTRAINT ENFORCEMENT
        // ========================================
        
        // Define the valid movement area for the paddle (within game frame)
        const minY = frameOffset; // Top boundary (frame edge)
        const maxY = frameOffset + gameHeight - paddleHeight; // Bottom boundary
        
        // Apply the new paddle position with boundary constraints
        if (newPaddleY >= minY && newPaddleY <= maxY) {
          // Position is within bounds - apply directly
          player1Y = newPaddleY;
        } else if (newPaddleY < minY) {
          // Position is above top boundary - clamp to minimum
          player1Y = minY;
        } else if (newPaddleY > maxY) {
          // Position is below bottom boundary - clamp to maximum
          player1Y = maxY;
        }
        
        // Update the reference touch position for continuous relative movement
        // This ensures smooth movement even during long drag gestures
        touchStartY.current = touchY;
      }
    };
    
    /**
     * Handles touch end events to clean up touch state
     * 
     * This function resets all touch-related state variables when the user
     * lifts their finger from the screen, ensuring clean state for the next touch.
     * 
     * @param {TouchEvent} e - The touch event object (not used but required by API)
     */
    const touchEndHandler = (e) => {
      // Prevent default browser touch behavior
      e.preventDefault();
      
      // ========================================
      // TOUCH STATE CLEANUP
      // ========================================
      
      // Reset touch tracking variables to initial state
      touchStartY.current = null;    // Clear initial touch position
      isDragging.current = false;    // Clear dragging state
      
      // Reset paddle movement flags (safety cleanup)
      // These should already be false for touch input, but reset for consistency
      upPressed = false;    // Clear upward movement flag
      downPressed = false;  // Clear downward movement flag
    };
    
    // ========================================
    // CANVAS DRAWING FUNCTIONS
    // ========================================
    
    /**
     * Draws the game ball on the canvas
     * 
     * Creates a white circular ball at the current ball position using
     * HTML5 Canvas arc drawing. The ball is always drawn as a perfect circle
     * with the radius defined in game constants.
     */
    const drawBall = () => {
      ctx.beginPath(); // Start a new drawing path
      
      // Draw a complete circle (0 to 2π radians) at ball position
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      
      // Set fill color to white for visibility against black background
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(); // Fill the circle with the specified color
      
      ctx.closePath(); // Close the drawing path (good practice)
    };
    
    /**
     * Draws a paddle on the canvas at the specified position
     * 
     * Creates a white rectangular paddle using HTML5 Canvas rectangle drawing.
     * Both player and computer paddles use this same function with different coordinates.
     * 
     * @param {number} x - The x-coordinate of the paddle's top-left corner
     * @param {number} y - The y-coordinate of the paddle's top-left corner
     */
    const drawPaddle = (x, y) => {
      ctx.beginPath(); // Start a new drawing path
      
      // Draw a rectangle with specified position and paddle dimensions
      ctx.rect(x, y, paddleWidth, paddleHeight);
      
      // Set fill color to white for visibility against black background
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(); // Fill the rectangle with the specified color
      
      ctx.closePath(); // Close the drawing path (good practice)
    };
    
    /**
     * Draws the current game score on the canvas
     * 
     * Displays both player scores in the upper portion of the game area.
     * Player 1 score appears on the left quarter, Player 2 score on the right quarter.
     * Uses Arial font for clean, readable text display.
     */
    const drawScore = () => {
      // Set font properties for score display
      ctx.font = '24px Arial';        // 24px Arial font for good readability
      ctx.fillStyle = '#FFFFFF';      // White text for visibility
      ctx.textAlign = 'center';       // Center-align text for balanced appearance
      
      // Draw Player 1 score (left side) - positioned at 1/4 of game width
      ctx.fillText(player1Score, frameOffset + gameWidth / 4, frameOffset + 30);
      
      // Draw Player 2 score (right side) - positioned at 3/4 of game width
      ctx.fillText(player2Score, frameOffset + (gameWidth / 4) * 3, frameOffset + 30);
    };
    
    /**
     * Draws the decorative game frame border around the play area
     * 
     * Creates a multi-layered border effect with three distinct layers:
     * 1. Outer black layer for depth
     * 2. Middle white layer for contrast
     * 3. Inner grey layer for subtle detail
     * 
     * This creates a classic arcade-style frame appearance.
     */
    const drawFrame = () => {
      // Define the three border layers from outside to inside
      // Each layer has different color, width, and offset properties
      const borderLayers = [
        { color: '#000000', width: 10, offset: 0 },   // Outer black layer (deepest)
        { color: '#FFFFFF', width: 8, offset: 10 },   // Middle white layer (contrast)
        { color: '#808080', width: 8, offset: 18 }    // Inner grey layer (subtle detail)
      ];
      
      // Draw each border layer in sequence (outside to inside)
      borderLayers.forEach(layer => {
        // Set stroke properties for this layer
        ctx.strokeStyle = layer.color;  // Set the color for this border layer
        ctx.lineWidth = layer.width;    // Set the thickness for this border layer
        
        // Calculate border rectangle position accounting for layer offset and width
        const x = layer.offset + layer.width / 2;      // X position (centered on line width)
        const y = layer.offset + layer.width / 2;      // Y position (centered on line width)
        const width = canvas.width - (layer.offset + layer.width / 2) * 2;   // Rectangle width
        const height = canvas.height - (layer.offset + layer.width / 2) * 2; // Rectangle height
        
        // Draw the border rectangle with calculated dimensions
        ctx.strokeRect(x, y, width, height);
      });
    };
    
    /**
     * Draws the center net line (dashed vertical line)
     * 
     * Creates a classic Pong-style dashed line down the center of the play area
     * to visually separate the two player sides. The dashes are evenly spaced
     * white rectangles that span the full height of the game area.
     */
    const drawNet = () => {
      // Draw dashed line segments from top to bottom of game area
      // Each segment is 20px tall with 20px gaps (40px total spacing)
      for (let i = frameOffset; i < frameOffset + gameHeight; i += 40) {
        ctx.beginPath(); // Start new path for each dash segment
        
        // Draw a small vertical rectangle for each dash
        // Positioned at horizontal center, 2px wide, 20px tall
        ctx.rect(frameOffset + gameWidth / 2 - 1, i, 2, 20);
        
        // Set fill color to white for visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(); // Fill the rectangle
        
        ctx.closePath(); // Close the path (good practice)
      }
    };
    
    // Add a cleanup function to properly shut down the game
    const cleanupGame = () => {
      // Stop the game loop by setting a flag
      isGameActive.current = false;
      
      // Stop any audio that might be playing
      if (paddleHitSound.current) {
        paddleHitSound.current.pause();
        paddleHitSound.current.currentTime = 0;
      }
      if (scoreSound.current) {
        scoreSound.current.pause();
        scoreSound.current.currentTime = 0;
      }
      
      // Clear intervals and timeouts
      clearInterval(gamepadPollingInterval);
      
      // Reset game state
      updateGameState('start');
      
      // Reset scores
      player1Score = 0;
      player2Score = 0;
      
      // Use setTimeout to ensure this runs after the current execution context
      setTimeout(() => {
        // Navigate back to games page
        const goBack = () => {
          window.history.back();
        };
        setTimeout(goBack, 0);
      }, 0);
    };
    
    // Use the refs defined at component level
    // No need to redefine variables here
    
    /**
     * Polls the gamepad for input
     * Updates control flags based on gamepad buttons and axes
     * Allows switching between gamepad and keyboard input
     */
    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        // Get the latest gamepad state
        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (gamepad) {
          // Check south button (A on Xbox, X on PlayStation)
          const southButtonPressed = gamepad.buttons[0].pressed;
          
          // Check east button (B on Xbox, Circle on PlayStation) for exit
          const eastButtonPressed = gamepad.buttons[1].pressed;
          
          // Check north button (Y on Xbox, Triangle on PlayStation) for fullscreen
          const northButtonPressed = gamepad.buttons[3].pressed;
          
          // Handle fullscreen with north button
          if (northButtonPressed) {
            if (!lastNorthButtonStateRef.current) {
              toggleFullscreenMode();
            }
            lastNorthButtonStateRef.current = true;
          } else {
            lastNorthButtonStateRef.current = false;
          }
          
          // Handle exit with east button (only in pause state)
          if (eastButtonPressed) {
            if (!lastEastButtonStateRef.current && gameStateRef.current === 'paused') {
              cleanupGame();
            }
            lastEastButtonStateRef.current = true;
          } else {
            lastEastButtonStateRef.current = false;
          }
          
          // Handle game state changes with south button
          if (southButtonPressed) {
            // Only set input source to gamepad when buttons are actively used
            if (!lastSouthButtonStateRef.current) {
              if (gameStateRef.current === 'start') {
                updateGameState('playing');
                inputSource.current = 'gamepad';
              } else if (gameStateRef.current === 'playing') {
                updateGameState('paused');
              } else if (gameStateRef.current === 'paused') {
                updateGameState('playing');
                inputSource.current = 'gamepad';
              }
            }
            lastSouthButtonStateRef.current = true;
          } else {
            lastSouthButtonStateRef.current = false;
          }
          
          // Check left analog stick (vertical axis)
          const leftStickY = gamepad.axes[1]; // Y-axis of left stick
          
          // Check D-pad up/down buttons
          const dpadUp = gamepad.buttons[12].pressed;
          const dpadDown = gamepad.buttons[13].pressed;
          
          // Check if there's active gamepad input for movement
          const hasGamepadInput = dpadUp || dpadDown || Math.abs(leftStickY) > 0.2;
          
          // Start game with any directional input or south button
          if (gameStateRef.current === 'start' && (hasGamepadInput || southButtonPressed)) {
            console.log("Starting game from gamepad input");
            updateGameState('playing');
          }
          
          // Only process movement controls when playing
          if (gameStateRef.current === 'playing') {
            // Only set input source to gamepad when there's actual gamepad movement
            // Don't override keyboard input unless gamepad is actively being used
            if (hasGamepadInput) {
              inputSource.current = 'gamepad';
              
              // Update control flags based on gamepad input
              if (dpadUp || leftStickY < -0.2) {
                upPressed = true;
                downPressed = false;
              } else if (dpadDown || leftStickY > 0.2) {
                downPressed = true;
                upPressed = false;
              } else {
                // Reset flags when no directional input
                upPressed = false;
                downPressed = false;
              }
            } else {
              // Reset gamepad flags when no gamepad input is detected
              if (inputSource.current === 'gamepad') {
                upPressed = false;
                downPressed = false;
              }
            }
            // Don't reset keyboard flags when gamepad is not being used
          }
        }
      }
    };
    
    /**
     * Checks if keyboard controls are active
     * @returns {boolean} True if any keyboard controls are active
     */

    // Game logic
    /**
     * Updates the game state for each frame
     * Handles paddle movement, ball movement, collisions, and scoring
     */
    const updateGame = () => {
      // Move player paddle based on input (keyboard or gamepad)
      if (upPressed && player1Y > frameOffset) {
        player1Y -= 7;  // Move paddle up if not at top edge of game area
      } else if (downPressed && player1Y < frameOffset + gameHeight - paddleHeight) {
        player1Y += 7;  // Move paddle down if not at bottom edge of game area
      }
      
      // Computer AI - Moves the right paddle to track the ball
      const computerTargetY = ballY - (paddleHeight / 2);  // Target center of paddle to ball
      if (computerTargetY < player2Y) {
        player2Y -= 5 * computerDifficulty;  // Move up at speed based on difficulty
      } else if (computerTargetY > player2Y) {
        player2Y += 5 * computerDifficulty;  // Move down at speed based on difficulty
      }
      
      // Constrain computer paddle within game area bounds
      if (player2Y < frameOffset) {
        player2Y = frameOffset;
      } else if (player2Y > frameOffset + gameHeight - paddleHeight) {
        player2Y = frameOffset + gameHeight - paddleHeight;
      }
      
      // Ball movement - Update position based on current speed
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // Ball collision with top and bottom walls of game area - Reverse vertical direction
      if (ballY - ballRadius < frameOffset || ballY + ballRadius > frameOffset + gameHeight) {
        ballSpeedY = -ballSpeedY;
      }
      
      // Ball collision with player paddle (left)
      if (ballX - ballRadius < frameOffset + paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;  // Reverse horizontal direction
        // Change vertical speed based on where ball hits paddle (adds spin effect)
        const deltaY = ballY - (player1Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        // Play paddle hit sound
  paddleHitSound.current.currentTime = 0;
  paddleHitSound.current.play();
      }
      
      // Ball collision with computer paddle (right)
      if (ballX + ballRadius > frameOffset + gameWidth - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;  // Reverse horizontal direction
        // Change vertical speed based on where ball hits paddle (adds spin effect)
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        // Play paddle hit sound
        paddleHitSound.current.currentTime = 0;
        paddleHitSound.current.play();
      }
      
      // Score points when ball passes paddles (outside game area)
      if (ballX < frameOffset) {
        player2Score++;  // Computer scores a point
        
        // Play score sound
  scoreSound.current.currentTime = 0;
  scoreSound.current.play();
        
        resetBall();     // Reset ball position
      } else if (ballX > frameOffset + gameWidth) {
        player1Score++;  // Player scores a point
        
        // Play score sound
        scoreSound.current.currentTime = 0;
        scoreSound.current.play();
        
        resetBall();     // Reset ball position
      }
    };
    
    /**
     * ========================================
     * FULLSCREEN MODE MANAGEMENT
     * ========================================
     * 
     * Toggles custom fullscreen mode using CSS transform scale.
     * This provides cross-platform fullscreen support that works on both desktop and mobile.
     * 
     * DESKTOP BEHAVIOR:
     * - Scales the canvas to fit the entire viewport while maintaining aspect ratio
     * - Hides all other page elements using CSS visibility
     * - Centers the canvas using CSS transforms
     * 
     * MOBILE BEHAVIOR:
     * - Uses visualViewport API for accurate mobile viewport dimensions
     * - Accounts for mobile browser UI elements (address bar, etc.)
     * - Provides smaller padding to maximize screen usage
     * 
     * SCALING LOGIC:
     * - Calculates both horizontal and vertical scale factors
     * - Uses the smaller scale to maintain aspect ratio (no stretching)
     * - Allows scaling down to fit smaller screens
     */
    const toggleFullscreenMode = () => {
      setIsFullscreenMode(prev => {
        const newFullscreenState = !prev;
        
        if (newFullscreenState) {
          // ========================================
          // ENTERING FULLSCREEN MODE
          // ========================================
          
          // Get accurate viewport dimensions (mobile-aware)
          // visualViewport provides more accurate dimensions on mobile devices
          const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
          const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
          
          // Calculate available space with padding to prevent edge clipping
          const padding = isMobile ? 10 : 20; // Smaller padding on mobile for maximum screen usage
          const availableWidth = viewportWidth - padding * 2;
          const availableHeight = viewportHeight - padding * 2;
          
          // Calculate scale factors for both dimensions
          const scaleX = availableWidth / canvas.width;   // Horizontal scale factor
          const scaleY = availableHeight / canvas.height; // Vertical scale factor
          const scale = Math.min(scaleX, scaleY);         // Use smaller scale to maintain aspect ratio
          
          // Apply the calculated scale (allows scaling down for smaller screens)
          const finalScale = scale;
          
          // Apply CSS transforms to create fullscreen effect
          canvas.style.position = 'fixed';                                    // Remove from document flow
          canvas.style.top = '50%';                                          // Center vertically
          canvas.style.left = '50%';                                         // Center horizontally
          canvas.style.transform = `translate(-50%, -50%) scale(${finalScale})`; // Center and scale
          canvas.style.zIndex = '9999';                                      // Bring to front
          canvas.style.maxWidth = 'none';                                    // Override responsive constraints
          
          // Hide page scrollbars and other elements
          document.body.style.overflow = 'hidden';
          document.body.classList.add('pong-fullscreen');
          
          // Inject CSS to hide all page elements except the canvas
          const fullscreenStyle = document.createElement('style');
          fullscreenStyle.id = 'pong-fullscreen-style';
          fullscreenStyle.textContent = `
            body.pong-fullscreen > *:not(canvas) {
              visibility: hidden !important;
            }
            body.pong-fullscreen canvas {
              visibility: visible !important;
            }
          `;
          document.head.appendChild(fullscreenStyle);
          
        } else {
          // ========================================
          // EXITING FULLSCREEN MODE
          // ========================================
          
          // Reset all canvas styles to original values
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.transform = '';
          canvas.style.zIndex = '';
          canvas.style.maxWidth = '';
          
          // Restore page scrolling and visibility
          document.body.style.overflow = '';
          document.body.classList.remove('pong-fullscreen');
          
          // Remove injected fullscreen styles
          const fullscreenStyle = document.getElementById('pong-fullscreen-style');
          if (fullscreenStyle) {
            fullscreenStyle.remove();
          }
        }
        
        return newFullscreenState;
      });
    };

    /**
     * ========================================
     * BALL RESET FUNCTION
     * ========================================
     * 
     * Resets the ball to the center of the game area after a point is scored.
     * This function is called whenever the ball exits the left or right side of the screen.
     * 
     * RESET BEHAVIOR:
     * - Ball returns to the exact center of the playable game area
     * - Horizontal direction is reversed (ball serves toward the player who was just scored on)
     * - Vertical direction is randomized to add variety to each serve
     * 
     * PHYSICS DETAILS:
     * - Horizontal speed maintains the same magnitude but opposite direction
     * - Vertical speed is randomized between -3 and +3 pixels per frame
     * - This creates unpredictable serve angles that keep the game interesting
     */
    const resetBall = () => {
      // Reset position to center of playable game area
      ballX = frameOffset + gameWidth / 2;    // Horizontal center (accounting for frame border)
      ballY = frameOffset + gameHeight / 2;   // Vertical center (accounting for frame border)
      
      // Reverse horizontal direction (serve toward the player who was scored on)
      ballSpeedX = -ballSpeedX;
      
      // Randomize vertical direction for variety
      // Math.random() * 6 gives 0-6, then subtract 3 to get -3 to +3 range
      ballSpeedY = Math.random() * 6 - 3;
    };
    
    /**
     * ========================================
     * START SCREEN RENDERING
     * ========================================
     * 
     * Draws the initial game screen that appears before gameplay begins.
     * This screen provides instructions for all supported input methods.
     * 
     * SCREEN ELEMENTS:
     * - Game title in large, prominent font
     * - Input-specific instructions (keyboard, gamepad, or touch)
     * - Fullscreen toggle instructions
     * - Control scheme explanations
     * 
     * RESPONSIVE DESIGN:
     * - Instructions adapt based on detected input method
     * - Gamepad instructions only appear when a controller is connected
     * - Touch instructions are shown on mobile devices
     * - Desktop shows keyboard shortcuts
     */
    const drawStartScreen = () => {
      // Clear the entire canvas with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // ========================================
      // GAME TITLE
      // ========================================
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('JavaScript PONG', canvas.width / 2, canvas.height / 3);
      
      // ========================================
      // INPUT-SPECIFIC INSTRUCTIONS
      // ========================================
      ctx.font = '24px Arial';
      
      if (inputSource.current === 'touch') {
        // ========================================
        // MOBILE TOUCH INSTRUCTIONS
        // ========================================
        ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
        
        // Detailed touch control explanations
        ctx.font = '18px Arial';
        ctx.fillText('Drag to move paddle • Tap to pause', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 70);
        
      } else {
        // ========================================
        // DESKTOP KEYBOARD INSTRUCTIONS
        // ========================================
        ctx.fillText('Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / 2);
        
        // Show gamepad instructions if a controller is connected
        if (gamepadConnected) {
          ctx.fillText('or Press A Button on Gamepad', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        // Additional control instructions for desktop
        ctx.font = '18px Arial';
        const yOffset = gamepadConnected ? 70 : 40;
        ctx.fillText('Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + yOffset);
        
        // Show gamepad fullscreen instructions if controller is connected
        if (gamepadConnected) {
          ctx.fillText('or Press Y Button for fullscreen', canvas.width / 2, canvas.height / 2 + 100);
        }
      }
    };
    
    /**
     * ========================================
     * PAUSE SCREEN RENDERING
     * ========================================
     * 
     * Draws the pause overlay screen that appears when the game is paused.
     * This screen provides context-sensitive instructions based on the current input method.
     * 
     * VISUAL ELEMENTS:
     * - Semi-transparent black overlay to dim the background game
     * - Large "PAUSED" text for clear status indication
     * - Input-specific resume instructions (keyboard, gamepad, or touch)
     * - Fullscreen toggle instructions for each input method
     * - Exit instructions with appropriate controls for each input type
     * - Mobile-specific exit button for touch devices
     * 
     * MOBILE TOUCH FEATURES:
     * - Visible red exit button in top-left corner
     * - White border and text for high contrast
     * - Touch-friendly button size (80x40 pixels)
     * - Clear "EXIT" label for accessibility
     */
    const drawPauseScreen = () => {
      // ========================================
      // SEMI-TRANSPARENT OVERLAY
      // ========================================
      // Create a dark overlay to dim the background game while maintaining visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 50% transparent black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // ========================================
      // PAUSE STATUS INDICATOR
      // ========================================
      // Display large "PAUSED" text for immediate status recognition
      ctx.fillStyle = '#FFFFFF';           // White text for high visibility
      ctx.font = '36px Arial';             // Large font for prominence
      ctx.textAlign = 'center';            // Center-aligned text
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 30);
      
      // ========================================
      // INPUT-SPECIFIC RESUME INSTRUCTIONS
      // ========================================
      // Show appropriate resume instructions based on the current input method
      ctx.font = '20px Arial'; // Medium font for instructions
      
      if (inputSource.current === 'gamepad') {
        // ========================================
        // GAMEPAD RESUME INSTRUCTIONS
        // ========================================
        ctx.fillText('Press A Button to Resume', canvas.width / 2, canvas.height / 2 + 20);
        
        // Gamepad fullscreen instruction
        ctx.font = '16px Arial'; // Smaller font for secondary instructions
        ctx.fillText('Press Y Button to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
        
      } else if (inputSource.current === 'touch') {
        // ========================================
        // TOUCH RESUME INSTRUCTIONS
        // ========================================
        ctx.fillText('Tap to Resume', canvas.width / 2, canvas.height / 2 + 20);
        
        // Touch fullscreen instruction
        ctx.font = '16px Arial'; // Smaller font for secondary instructions
        ctx.fillText('Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
        
      } else {
        // ========================================
        // KEYBOARD RESUME INSTRUCTIONS
        // ========================================
        ctx.fillText('Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + 20);
        
        // Keyboard fullscreen instruction
        ctx.font = '16px Arial'; // Smaller font for secondary instructions
        ctx.fillText('Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
      }
      
      // ========================================
      // INPUT-SPECIFIC EXIT INSTRUCTIONS
      // ========================================
      // Show appropriate exit instructions based on the current input method
      if (inputSource.current === 'touch') {
        // Touch exit instruction
        ctx.font = '20px Arial';
        ctx.fillText('Tap Exit Button to Exit', canvas.width / 2, canvas.height / 2 + 80);
        
      } else if (inputSource.current === 'gamepad') {
        // Gamepad exit instruction
        ctx.font = '20px Arial';
        ctx.fillText('Press B Button to Exit', canvas.width / 2, canvas.height / 2 + 80);
        
      } else {
        // Keyboard exit instruction
        ctx.font = '20px Arial';
        ctx.fillText('Press ESC to Exit', canvas.width / 2, canvas.height / 2 + 80);
      }
      
      // ========================================
      // MOBILE EXIT BUTTON RENDERING
      // ========================================
      // Draw a visible exit button for touch devices (mobile/tablet)
      if (inputSource.current === 'touch') {
        // Define exit button dimensions and position
        const buttonWidth = 80;   // Button width in pixels
        const buttonHeight = 40;  // Button height in pixels
        const buttonX = 20;       // X position from left edge
        const buttonY = 20;       // Y position from top edge
        
        // Draw button background with semi-transparent red color
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // 80% opaque red background
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Draw button border for definition and contrast
        ctx.strokeStyle = '#FFFFFF'; // White border color
        ctx.lineWidth = 3;           // 3px border thickness
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Draw button text label
        ctx.fillStyle = '#FFFFFF';        // White text for high contrast
        ctx.font = 'bold 16px Arial';     // Bold font for button text
        ctx.textAlign = 'center';         // Center-align text within button
        // Position text in center of button (accounting for font baseline)
        ctx.fillText('EXIT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6);
      }
    };
    
    /**
     * ========================================
     * MAIN GAME LOOP
     * ========================================
     * 
     * The core game loop that runs continuously using requestAnimationFrame.
     * This function is called approximately 60 times per second to create smooth animation.
     * 
     * GAME STATE HANDLING:
     * - 'start': Displays the start screen with instructions
     * - 'playing': Renders active gameplay with all game objects and physics
     * - 'paused': Shows the game in background with pause overlay
     * 
     * RENDERING ORDER (for 'playing' and 'paused' states):
     * 1. Clear canvas with black background
     * 2. Draw decorative frame border
     * 3. Draw center net line
     * 4. Draw game ball
     * 5. Draw both paddles (player and computer)
     * 6. Draw current score
     * 7. Update game physics (playing state only)
     * 8. Draw pause overlay (paused state only)
     * 
     * PERFORMANCE OPTIMIZATION:
     * - Uses requestAnimationFrame for optimal frame timing
     * - Only continues loop while game is active (prevents memory leaks)
     * - Efficient canvas clearing and redrawing
     */
    const gameLoop = () => {
      // ========================================
      // GAME STATE ROUTING
      // ========================================
      // Handle rendering based on current game state
      
      if (gameStateRef.current === 'start') {
        // ========================================
        // START SCREEN STATE
        // ========================================
        // Display the initial game screen with instructions
        drawStartScreen();
        
      } else if (gameStateRef.current === 'playing') {
        // ========================================
        // ACTIVE GAMEPLAY STATE
        // ========================================
        
        // Clear the entire canvas with black background
        // This removes all previous frame content for clean rendering
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the decorative multi-layered frame border
        drawFrame();
        
        // Draw all game objects in proper layering order
        drawNet();     // Center dashed line (background element)
        drawBall();    // Game ball (moving object)
        
        // Draw both paddles with their current positions
        drawPaddle(frameOffset, player1Y);  // Player paddle (left side)
        drawPaddle(frameOffset + gameWidth - paddleWidth, player2Y);  // Computer paddle (right side)
        
        // Draw the current score display
        drawScore();
        
        // Update game physics and logic for the next frame
        // This includes paddle movement, ball movement, collision detection, and scoring
        updateGame();
        
      } else if (gameStateRef.current === 'paused') {
        // ========================================
        // PAUSED GAME STATE
        // ========================================
        
        // Clear the entire canvas with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the decorative frame border
        drawFrame();
        
        // Draw the game in the background (frozen state)
        // This shows the current game state without updating physics
        drawNet();     // Center line
        drawBall();    // Ball at current position
        drawPaddle(frameOffset, player1Y);                              // Player paddle
        drawPaddle(frameOffset + gameWidth - paddleWidth, player2Y);    // Computer paddle
        drawScore();   // Current score
        
        // Draw the pause overlay on top of the game
        // This includes pause text, instructions, and exit button (mobile)
        drawPauseScreen();
      }
      
      // ========================================
      // ANIMATION FRAME CONTINUATION
      // ========================================
      // Schedule the next frame of the game loop
      // Only continue if the game is still active (prevents memory leaks on component unmount)
      if (isGameActive.current) {
        requestAnimationFrame(gameLoop); // Request next animation frame (~60fps)
      }
    };
    
    // Add event listeners for keyboard and gamepad
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    window.addEventListener("gamepadconnected", gamepadConnectHandler);
    window.addEventListener("gamepaddisconnected", gamepadDisconnectHandler);
    
    // Add touch event listeners for mobile devices
    if (mobileDetected) {
      canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
      canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
      canvas.addEventListener('touchend', touchEndHandler, { passive: false });
      console.log("Touch event listeners added for mobile device");
    }
    
    // Check for already connected gamepads
    checkGamepads();
    
    // Start the game by initiating the game loop
    gameLoop();
    
    // Set up gamepad polling interval after pollGamepad is defined
    gamepadPollingInterval = setInterval(pollGamepad, 16); // ~60fps
    
    // Cleanup event listeners when component unmounts to prevent memory leaks
    return () => {
      console.log("Component unmounting - cleaning up resources");
      // Set flag to stop the game loop
      isGameActive.current = false;
      
      // Remove event listeners
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener("gamepadconnected", gamepadConnectHandler);
      window.removeEventListener("gamepaddisconnected", gamepadDisconnectHandler);
      
      // Remove touch event listeners if they were added
      if (mobileDetected) {
        canvas.removeEventListener('touchstart', touchStartHandler);
        canvas.removeEventListener('touchmove', touchMoveHandler);
        canvas.removeEventListener('touchend', touchEndHandler);
      }
      
      // Clear intervals
      clearInterval(gamepadPollingInterval);
      
      // Stop any audio that might be playing
      if (paddleHitSound.current) {
        paddleHitSound.current.pause();
        paddleHitSound.current.currentTime = 0;
      }
      if (scoreSound.current) {
        scoreSound.current.pause();
        scoreSound.current.currentTime = 0;
      }
    };
  }, []); // Remove gamepadConnected dependency to prevent re-initialization
  
  return (
    <Container className="py-5 text-center">
      <h1 className="mb-4">Pong</h1>
      <p className="mb-4">
        Use the up and down arrow keys to control your paddle (left side).
        {gamepadConnected && (
          <span className="ms-2 badge bg-success">
            Gamepad Connected! Use D-pad or left stick
          </span>
        )}
      </p>
      <div className="d-flex justify-content-center mb-4">
        <canvas 
          ref={canvasRef} 
          width="848" 
          height="548" 
          style={{ 
            background: '#000', 
            maxWidth: '100%'
          }}
        />
      </div>
      <Link to="/games" className="btn btn-primary">
        Back to Games
      </Link>
    </Container>
  );
};

export default Pong;