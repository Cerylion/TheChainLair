/**
 * Pong Game Component
 * 
 * This component implements a classic Pong game using HTML5 Canvas and React.
 * The player controls the left paddle using arrow keys, while the right paddle
 * is controlled by a computer AI.
 */
import React, { useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Pong = () => {
  // Reference to the canvas element for drawing the game
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Canvas setup - Get the canvas element and its 2D rendering context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
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
    
    // Computer AI difficulty (0-1)
    // Higher values make the computer more responsive and harder to beat
    const computerDifficulty = 0.85;
    
    // Event listeners for paddle control
    /**
     * Handle key press events for paddle movement
     * Sets the appropriate direction flag when arrow keys are pressed
     * @param {KeyboardEvent} e - The keyboard event
     */
    const keyDownHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Prevent default browser scrolling behavior
        e.preventDefault();
        
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
      if (e.key === 'ArrowUp') {
        upPressed = false;  // Mark up arrow as released
      } else if (e.key === 'ArrowDown') {
        downPressed = false;  // Mark down arrow as released
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
    
    // Game logic
    /**
     * Updates the game state for each frame
     * Handles paddle movement, ball movement, collisions, and scoring
     */
    const updateGame = () => {
      // Move player paddle based on keyboard input
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
      }
      
      // Ball collision with computer paddle (right)
      if (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;  // Reverse horizontal direction
        // Change vertical speed based on where ball hits paddle (adds spin effect)
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
      }
      
      // Score points when ball passes paddles
      if (ballX < 0) {
        player2Score++;  // Computer scores a point
        resetBall();     // Reset ball position
      } else if (ballX > canvas.width) {
        player1Score++;  // Player scores a point
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
     * Main game loop that runs every animation frame
     * Clears the canvas, draws all game elements, and updates the game state
     */
    const gameLoop = () => {
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
      
      // Continue game loop by requesting next animation frame
      requestAnimationFrame(gameLoop);
    };
    
    // Start the game by initiating the game loop
    gameLoop();
    
    // Cleanup event listeners when component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, []);
  
  return (
    <Container className="py-5 text-center">
      <h1 className="mb-4">Pong</h1>
      <p className="mb-4">Use the up and down arrow keys to control your paddle (left side).</p>
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