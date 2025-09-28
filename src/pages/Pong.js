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

// Sound effect URLs
const PADDLE_HIT_SOUND = `${process.env.PUBLIC_URL}/sounds/bip.mp3`;
const SCORE_SOUND = `${process.env.PUBLIC_URL}/sounds/score.mp3`;

const Pong = () => {
  // Reference to the canvas element for drawing the game
  const canvasRef = useRef(null);
  // State to track if a gamepad is connected
  const [gamepadConnected, setGamepadConnected] = useState(false);
  // Game state management (start, playing, paused)
  const [_, setGameState] = useState('start'); // 'start', 'playing', 'paused'
  const gameStateRef = useRef('start'); // Ref to track current game state for immediate access
  
  // Track input source and game active state
  const inputSource = useRef('keyboard'); // 'keyboard' or 'gamepad'
  const isGameActive = useRef(true);
  
  // Audio references for game sounds
  const paddleHitSound = useRef(null);
  const scoreSound = useRef(null);
  
  // Track gamepad button states to prevent multiple triggers
  const lastSouthButtonStateRef = useRef(false);
  const lastEastButtonStateRef = useRef(false);

  
  // Custom state setter that updates both state and ref
  const updateGameState = (newState) => {
    gameStateRef.current = newState;
    setGameState(newState);
  };
  
  useEffect(() => {
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
    
    // Add gamepad event listeners
    window.addEventListener("gamepadconnected", gamepadConnectHandler);
    window.addEventListener("gamepaddisconnected", gamepadDisconnectHandler);
    
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
    
    // Check for already connected gamepads
    checkGamepads();
    
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
      
      // Exit game with Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        // Clean up game resources and exit
        cleanupGame();
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
    
    // Add event listeners to detect player input
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
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
          // Set input source to gamepad when gamepad is connected
  inputSource.current = 'gamepad';
          
          // Check south button (A on Xbox, X on PlayStation)
          const southButtonPressed = gamepad.buttons[0].pressed;
          
          // Check east button (B on Xbox, Circle on PlayStation) for exit
          const eastButtonPressed = gamepad.buttons[1].pressed;
          
          // Handle exit with east button
          if (eastButtonPressed) {
            if (!lastEastButtonStateRef.current) {
              console.log("East button pressed, exiting game");
              cleanupGame();
            }
            lastEastButtonStateRef.current = true;
          } else {
            lastEastButtonStateRef.current = false;
          }
          
          // Handle game state changes with south button
          if (southButtonPressed) {
            // Debounce button press (prevent multiple triggers)
            if (!lastSouthButtonStateRef.current) {
              console.log("South button pressed, current state:", gameStateRef.current);
              if (gameStateRef.current === 'start') {
                console.log("Starting game from gamepad");
                updateGameState('playing');
              } else if (gameStateRef.current === 'playing') {
                console.log("Pausing game from gamepad");
                updateGameState('paused');
              } else if (gameStateRef.current === 'paused') {
                console.log("Unpausing game from gamepad");
                updateGameState('playing');
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
            // Set input source to gamepad when there's gamepad input
            if (hasGamepadInput) {
              inputSource.current = 'gamepad';
            }
            
            // Update control flags based on gamepad input
            if (dpadUp || leftStickY < -0.2) {
              upPressed = true;
              downPressed = false;
            } else if (dpadDown || leftStickY > 0.2) {
              downPressed = true;
              upPressed = false;
            } else {
              // Reset flags when no directional input
              if (inputSource.current === 'gamepad') {
                upPressed = false;
                downPressed = false;
              }
            }
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
      
      // Draw start instruction
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / 2);
      
      // Draw gamepad instruction if connected
      if (gamepadConnected) {
        ctx.fillText('or Press A Button on Gamepad', canvas.width / 2, canvas.height / 2 + 40);
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
      } else {
        ctx.fillText('Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + 20);
      }
      
      // Exit instruction
      ctx.fillText('Press ESC or B Button to Exit', canvas.width / 2, canvas.height / 2 + 60);
    };
    
    /**
     * Main game loop that runs every animation frame
     * Clears the canvas, draws all game elements, and updates the game state
     */
    const gameLoop = () => {
      // Handle different game states
      if (gameStateRef.current === 'start') {
        drawStartScreen();
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
        
        // Update game state for next frame
        updateGame();
      } else if (gameStateRef.current === 'paused') {
        // Draw the game in the background
        drawNet();
        drawBall();
        drawPaddle(0, player1Y);
        drawPaddle(canvas.width - paddleWidth, player2Y);
        drawScore();
        
        // Draw pause overlay
        drawPauseScreen();
      }
      
      // Continue game loop by requesting next animation frame
      if (isGameActive) {
        requestAnimationFrame(gameLoop);
      }
    };
    
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
  }, [gamepadConnected]); // Add gamepadConnected as a dependency
  
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