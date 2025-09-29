/**
 * Pong Game Component
 * 
 * This component implements a classic Pong game using HTML5 Canvas and React.
 * The player controls the left paddle using arrow keys or gamepad, while the right paddle
 * is controlled by a computer AI.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Sound effect imports
import PADDLE_HIT_SOUND from './assets/sounds/bip.mp3';
import SCORE_SOUND from './assets/sounds/score.mp3';

const Pong = () => {
  // Reference to the canvas element for drawing the game
  const canvasRef = useRef(null);
  // State to track if a gamepad is connected
  const [gamepadConnected, setGamepadConnected] = useState(false);
  // Game state management (start, playing, paused)
  const [_, setGameState] = useState('start'); // 'start', 'playing', 'paused'
  const gameStateRef = useRef('start'); // Ref to track current game state for immediate access
  
  // Mobile device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Track input source and game active state
  const inputSource = useRef('keyboard'); // 'keyboard', 'gamepad', or 'touch'
  const isGameActive = useRef(true);
  
  // Touch control state
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  
  // Double-tap detection for fullscreen
  const lastTapTime = useRef(0);
  const doubleTapDelay = 300; // milliseconds
  
  // Fullscreen mode state
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  
  // Audio references for game sounds
  const paddleHitSound = useRef(null);
  const scoreSound = useRef(null);
  
  // Track gamepad button states to prevent multiple triggers
  const lastSouthButtonStateRef = useRef(false);
  const lastEastButtonStateRef = useRef(false);
  const lastNorthButtonStateRef = useRef(false);

  // Mobile device detection function
  const detectMobileDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
                          ('ontouchstart' in window) ||
                          (navigator.maxTouchPoints > 0) ||
                          (navigator.msMaxTouchPoints > 0);
    return isMobileDevice;
  };

  
  // Custom state setter that updates both state and ref
  const updateGameState = (newState) => {
    gameStateRef.current = newState;
    setGameState(newState);
  };
  
  useEffect(() => {
    // Mobile device detection
    const mobileDetected = detectMobileDevice();
    setIsMobile(mobileDetected);
    console.log("Mobile device detected:", mobileDetected);
    
    // Audio initialization
    paddleHitSound.current = new Audio(PADDLE_HIT_SOUND);
    scoreSound.current = new Audio(SCORE_SOUND);
    
    // Canvas setup - Get the canvas element and its 2D rendering context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // We'll set up the gamepad polling interval after defining the pollGamepad function
    let gamepadPollingInterval;
    
    // Game constants - Define the size of game elements
    const paddleHeight = 100;  // Height of both paddles
    const paddleWidth = 10;    // Width of both paddles
    const ballRadius = 8;      // Radius of the ball
    
    // Ball position and speed - Initial values
    let ballX = canvas.width / 2;   // Start ball in horizontal center
    let ballY = canvas.height / 2;  // Start ball in vertical center
    let ballSpeedX = 5;             // Initial horizontal speed (positive = right)
    let ballSpeedY = 3;             // Initial vertical speed (positive = down)
    
    // Paddle positions - Both paddles start in the middle vertically
    let player1Y = (canvas.height - paddleHeight) / 2;  // Left paddle (player)
    let player2Y = (canvas.height - paddleHeight) / 2;  // Right paddle (computer)
    
    // Score tracking
    let player1Score = 0;  // Player score
    let player2Score = 0;  // Computer score
    
    // Keyboard state tracking for player controls
    let upPressed = false;    // Is up arrow key pressed?
    let downPressed = false;  // Is down arrow key pressed?
    
    // Gamepad reference and state
    let gamepads = {};
    let gamepadIndex = null;
    
    // Computer AI difficulty (0-1)
    // Higher values make the computer more responsive and harder to beat
    const computerDifficulty = 0.85;
    
    /**
     * Handle gamepad connection event
     * @param {GamepadEvent} e - The gamepad connection event
     */
    const gamepadConnectHandler = (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
      gamepads[e.gamepad.index] = e.gamepad;
      gamepadIndex = e.gamepad.index;
      setGamepadConnected(true);
    };
    
    /**
     * Handle gamepad disconnection event
     * @param {GamepadEvent} e - The gamepad disconnection event
     */
    const gamepadDisconnectHandler = (e) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
      delete gamepads[e.gamepad.index];
      if (gamepadIndex === e.gamepad.index) {
        gamepadIndex = null;
      }
      setGamepadConnected(false);
    };
    
    // Add gamepad event listeners inside useEffect for proper cleanup
    // (These will be moved to useEffect)
    
    // Check if a gamepad is already connected
    const checkGamepads = () => {
      const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < connectedGamepads.length; i++) {
        if (connectedGamepads[i]) {
          gamepads[connectedGamepads[i].index] = connectedGamepads[i];
          gamepadIndex = connectedGamepads[i].index;
          setGamepadConnected(true);
          console.log("Found existing gamepad:", connectedGamepads[i].id);
          break;
        }
      }
    };
    
    // Check if a gamepad is already connected (moved to useEffect)
    
    // Event listeners for paddle control
    /**
     * Handle key press events for paddle movement and game control
     * @param {KeyboardEvent} e - The keyboard event
     */
    const keyDownHandler = (e) => {
      // Set input source to keyboard when keyboard is used
  inputSource.current = 'keyboard';
      
      // Game state controls
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        
        // Toggle between start/playing or playing/paused states
        if (gameStateRef.current === 'start') {
          updateGameState('playing');
        } else if (gameStateRef.current === 'playing') {
          updateGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          updateGameState('playing');
        }
        return;
      }
      
      // Escape key only works in pause state to exit
      if (e.key === 'Escape') {
        e.preventDefault();
        if (gameStateRef.current === 'paused') {
          // Clean up game resources and exit
          cleanupGame();
        }
        // No action for Escape in other states
        return;
      }
      
      // Enter key toggles fullscreen
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleFullscreenMode();
        return;
      }
      
      // Start game with arrow keys
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'start') {
        e.preventDefault();
        updateGameState('playing');
        return;
      }
      
      // Paddle movement controls (only when playing)
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'playing') {
        // Prevent default browser scrolling behavior
        e.preventDefault();
        
        // Set input source to keyboard
        inputSource.current = 'keyboard';
        
        if (e.key === 'ArrowUp') {
          upPressed = true;  // Mark up arrow as pressed
        } else if (e.key === 'ArrowDown') {
          downPressed = true;  // Mark down arrow as pressed
        }
      }
    };
    
    /**
     * Handle key release events for paddle movement
     * Clears the direction flag when arrow keys are released
     * @param {KeyboardEvent} e - The keyboard event
     */
    const keyUpHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Only handle keyboard events if keyboard is the current input source
        if (inputSource.current === 'keyboard') {
          if (e.key === 'ArrowUp') {
            upPressed = false;  // Mark up arrow as released
          } else if (e.key === 'ArrowDown') {
            downPressed = false;  // Mark down arrow as released
          }
        }
      }
    };
    
    // Event listeners will be added in useEffect for proper cleanup
    
    // Touch event handlers for mobile devices
    /**
     * Handle touch start events for paddle movement and game control
     * @param {TouchEvent} e - The touch event
     */
     const touchStartHandler = (e) => {
       e.preventDefault();
       
       const touch = e.touches[0];
       const rect = canvas.getBoundingClientRect();
       const touchX = touch.clientX - rect.left;
       const touchY = touch.clientY - rect.top;
       
       // Set input source to touch
       inputSource.current = 'touch';
       
       // Double-tap detection for fullscreen
       const currentTime = Date.now();
       const timeDiff = currentTime - lastTapTime.current;
       
       if (timeDiff < doubleTapDelay) {
         // Double-tap detected - toggle fullscreen
         toggleFullscreenMode();
         lastTapTime.current = 0; // Reset to prevent triple-tap issues
         return;
       }
       
       lastTapTime.current = currentTime;
       
       // Check if touch is on exit button when paused
       if (gameStateRef.current === 'paused') {
         const buttonWidth = 80;
         const buttonHeight = 40;
         const buttonX = 20;
         const buttonY = 20;
         
         // Check if touch is within exit button bounds
         if (touchX >= buttonX && touchX <= buttonX + buttonWidth &&
             touchY >= buttonY && touchY <= buttonY + buttonHeight) {
           // Exit button clicked
           cleanupGame();
           return;
         }
       }
       
       // Store initial touch position for dragging
       touchStartY.current = touchY;
       isDragging.current = false;
       
       // Handle tap-to-pause/unpause
       if (gameStateRef.current === 'start') {
         updateGameState('playing');
       } else if (gameStateRef.current === 'playing') {
         // Don't pause immediately on touch start, wait to see if it's a drag
         setTimeout(() => {
           if (!isDragging.current) {
             updateGameState('paused');
           }
         }, 100);
       } else if (gameStateRef.current === 'paused') {
         updateGameState('playing');
       }
     };
    
    /**
     * Handle touch move events for paddle dragging
     * @param {TouchEvent} e - The touch event
     */
    const touchMoveHandler = (e) => {
      e.preventDefault();
      
      if (touchStartY.current === null) return;
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      
      // Calculate movement threshold to determine if this is a drag
      const moveThreshold = 10;
      if (Math.abs(touchY - touchStartY.current) > moveThreshold) {
        isDragging.current = true;
      }
      
      // Only move paddle during gameplay and when dragging
      if (gameStateRef.current === 'playing' && isDragging.current) {
        // Calculate paddle position based on touch position
        const newPaddleY = touchY - (paddleHeight / 2);
        
        // Constrain paddle within canvas bounds
        if (newPaddleY >= 0 && newPaddleY <= canvas.height - paddleHeight) {
          player1Y = newPaddleY;
        }
      }
    };
    
    /**
     * Handle touch end events
     * @param {TouchEvent} e - The touch event
     */
    const touchEndHandler = (e) => {
      e.preventDefault();
      
      // Reset touch state
      touchStartY.current = null;
      isDragging.current = false;
      
      // Reset movement flags
      upPressed = false;
      downPressed = false;
    };
    
    // Draw functions
    /**
     * Draws the ball on the canvas
     * Creates a white circle at the ball's current position
     */
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };
    
    /**
     * Draws a paddle on the canvas
     * @param {number} x - The x-coordinate of the paddle
     * @param {number} y - The y-coordinate of the paddle
     */
    const drawPaddle = (x, y) => {
      ctx.beginPath();
      ctx.rect(x, y, paddleWidth, paddleHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };
    
    /**
     * Draws the current score on the canvas
     * Player score on the left, computer score on the right
     */
    const drawScore = () => {
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(player1Score, canvas.width / 4, 30);
      ctx.fillText(player2Score, (canvas.width / 4) * 3, 30);
    };
    
    /**
     * Draws the center net line (dashed)
     * Creates a vertical dashed line in the middle of the canvas
     */
    const drawNet = () => {
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.rect(canvas.width / 2 - 1, i, 2, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.closePath();
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
      if (upPressed && player1Y > 0) {
        player1Y -= 7;  // Move paddle up if not at top edge
      } else if (downPressed && player1Y < canvas.height - paddleHeight) {
        player1Y += 7;  // Move paddle down if not at bottom edge
      }
      
      // Computer AI - Moves the right paddle to track the ball
      const computerTargetY = ballY - (paddleHeight / 2);  // Target center of paddle to ball
      if (computerTargetY < player2Y) {
        player2Y -= 5 * computerDifficulty;  // Move up at speed based on difficulty
      } else if (computerTargetY > player2Y) {
        player2Y += 5 * computerDifficulty;  // Move down at speed based on difficulty
      }
      
      // Ball movement - Update position based on current speed
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // Ball collision with top and bottom walls - Reverse vertical direction
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
      }
      
      // Ball collision with player paddle (left)
      if (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;  // Reverse horizontal direction
        // Change vertical speed based on where ball hits paddle (adds spin effect)
        const deltaY = ballY - (player1Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        // Play paddle hit sound
  paddleHitSound.current.currentTime = 0;
  paddleHitSound.current.play();
      }
      
      // Ball collision with computer paddle (right)
      if (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;  // Reverse horizontal direction
        // Change vertical speed based on where ball hits paddle (adds spin effect)
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        // Play paddle hit sound
        paddleHitSound.current.currentTime = 0;
        paddleHitSound.current.play();
      }
      
      // Score points when ball passes paddles
      if (ballX < 0) {
        player2Score++;  // Computer scores a point
        
        // Play score sound
  scoreSound.current.currentTime = 0;
  scoreSound.current.play();
        
        resetBall();     // Reset ball position
      } else if (ballX > canvas.width) {
        player1Score++;  // Player scores a point
        
        // Play score sound
        scoreSound.current.currentTime = 0;
        scoreSound.current.play();
        
        resetBall();     // Reset ball position
      }
    };
    
    /**
     * Toggles custom fullscreen mode using CSS transform scale
     */
    const toggleFullscreenMode = () => {
      setIsFullscreenMode(prev => {
        const newFullscreenState = !prev;
        
        if (newFullscreenState) {
          // Calculate scale factor to fit screen with border
          const borderWidth = 26; // Total border width (8 + 8 + 10 = 26px)
          const availableWidth = window.innerWidth - borderWidth * 2;
          const availableHeight = window.innerHeight - borderWidth * 2;
          
          // Calculate scale based on original canvas size
          const scaleX = availableWidth / canvas.width;
          const scaleY = availableHeight / canvas.height;
          const scale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio
          
          // Apply fullscreen styles with scale transform
          canvas.style.position = 'fixed';
          canvas.style.top = '50%';
          canvas.style.left = '50%';
          canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
          canvas.style.zIndex = '9999';
          
          // Hide body overflow and all other page elements
          document.body.style.overflow = 'hidden';
          
          // Hide all elements except the canvas by adding a fullscreen class to body
          document.body.classList.add('pong-fullscreen');
          
          // Create and inject CSS to hide all elements except the canvas
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
          // Reset canvas style to original
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.transform = '';
          canvas.style.zIndex = '';
          
          // Restore body overflow
          document.body.style.overflow = '';
          
          // Remove fullscreen class and styles
          document.body.classList.remove('pong-fullscreen');
          const fullscreenStyle = document.getElementById('pong-fullscreen-style');
          if (fullscreenStyle) {
            fullscreenStyle.remove();
          }
        }
        
        return newFullscreenState;
      });
    };

    /**
     * Resets the ball to the center of the screen after scoring
     * Reverses horizontal direction and randomizes vertical direction
     */
    const resetBall = () => {
      ballX = canvas.width / 2;    // Center horizontally
      ballY = canvas.height / 2;   // Center vertically
      ballSpeedX = -ballSpeedX;    // Reverse horizontal direction
      ballSpeedY = Math.random() * 6 - 3;  // Random vertical speed between -3 and 3
    };
    
    /**
     * Draws the start screen with instructions
     */
    const drawStartScreen = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('JavaScript PONG', canvas.width / 2, canvas.height / 3);
      
      // Draw start instruction based on input source
      ctx.font = '24px Arial';
      
      if (inputSource.current === 'touch') {
        ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
        ctx.font = '18px Arial';
        ctx.fillText('Drag to move paddle • Tap to pause', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 70);
      } else {
        ctx.fillText('Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / 2);
        
        // Draw gamepad instruction if connected
        if (gamepadConnected) {
          ctx.fillText('or Press A Button on Gamepad', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        // Draw fullscreen instructions for PC
        ctx.font = '18px Arial';
        const yOffset = gamepadConnected ? 70 : 40;
        ctx.fillText('Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + yOffset);
        
        if (gamepadConnected) {
          ctx.fillText('or Press Y Button for fullscreen', canvas.width / 2, canvas.height / 2 + 100);
        }
      }
    };
    
    /**
     * Draws the pause screen
     */
    const drawPauseScreen = () => {
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Pause text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 30);
      
      // Resume instruction based on input source
      ctx.font = '20px Arial';
      if (inputSource.current === 'gamepad') {
        ctx.fillText('Press A Button to Resume', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Press Y Button to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
      } else if (inputSource.current === 'touch') {
        ctx.fillText('Tap to Resume', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
      } else {
        ctx.fillText('Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '16px Arial';
        ctx.fillText('Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 50);
      }
      
      // Exit instruction
      if (inputSource.current === 'touch') {
        ctx.font = '20px Arial';
        ctx.fillText('Tap Exit Button to Exit', canvas.width / 2, canvas.height / 2 + 80);
      } else if (inputSource.current === 'gamepad') {
        ctx.font = '20px Arial';
        ctx.fillText('Press B Button to Exit', canvas.width / 2, canvas.height / 2 + 80);
      } else {
        ctx.font = '20px Arial';
        ctx.fillText('Press ESC to Exit', canvas.width / 2, canvas.height / 2 + 80);
      }
      
      // Draw exit button for mobile devices
      if (inputSource.current === 'touch') {
        // Exit button dimensions and position (top-left corner)
        const buttonWidth = 80;
        const buttonHeight = 40;
        const buttonX = 20;
        const buttonY = 20;
        
        // Button background (more visible)
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border (white for contrast)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text (white for better visibility)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6);
      }
    };
    
    /**
     * Draws the 3-layer border for fullscreen mode
     */
    const drawFullscreenBorder = () => {
      if (!isFullscreenMode) return;
      
      // Clear any existing canvas effects/shadows
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      const borderLayers = [
        { color: '#FFFFFF', width: 8 }, // Inner white layer (increased)
        { color: '#808080', width: 8 }, // Middle paddle grey layer (increased)
        { color: '#000000', width: 10 } // Outer black layer (increased for better visibility)
      ];
      
      let currentOffset = 0;
      
      borderLayers.forEach(layer => {
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.width;
        
        // Calculate border position
        const x = currentOffset + layer.width / 2;
        const y = currentOffset + layer.width / 2;
        const width = canvas.width - (currentOffset + layer.width / 2) * 2;
        const height = canvas.height - (currentOffset + layer.width / 2) * 2;
        
        // Draw border rectangle with clean, simple lines
        ctx.strokeRect(x, y, width, height);
        
        currentOffset += layer.width;
      });
    };

    /**
     * Main game loop that runs every animation frame
     * Clears the canvas, draws all game elements, and updates the game state
     */
    const gameLoop = () => {
      // Handle different game states
      if (gameStateRef.current === 'start') {
        drawStartScreen();
        drawFullscreenBorder();
      } else if (gameStateRef.current === 'playing') {
        // Clear canvas with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawNet();     // Draw center line
        drawBall();    // Draw the ball
        drawPaddle(0, player1Y);  // Draw player paddle (left)
        drawPaddle(canvas.width - paddleWidth, player2Y);  // Draw computer paddle (right)
        drawScore();   // Draw current score
        drawFullscreenBorder(); // Draw border if in fullscreen mode
        
        // Update game state for next frame
        updateGame();
      } else if (gameStateRef.current === 'paused') {
        // Draw the game in the background
        drawNet();
        drawBall();
        drawPaddle(0, player1Y);
        drawPaddle(canvas.width - paddleWidth, player2Y);
        drawScore();
        drawFullscreenBorder(); // Draw border if in fullscreen mode
        
        // Draw pause overlay
        drawPauseScreen();
      }
      
      // Continue game loop by requesting next animation frame
      if (isGameActive.current) {
        requestAnimationFrame(gameLoop);
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
          width="800" 
          height="500" 
          style={{ 
            background: '#000', 
            border: '2px solid #fff',
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