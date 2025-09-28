import React, { useEffect, useRef } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Pong = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Canvas setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Game variables
    const paddleHeight = 100;
    const paddleWidth = 10;
    const ballRadius = 8;
    
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 3;
    
    let player1Y = (canvas.height - paddleHeight) / 2;
    let player2Y = (canvas.height - paddleHeight) / 2;
    
    let player1Score = 0;
    let player2Score = 0;
    
    let upPressed = false;
    let downPressed = false;
    
    // Computer AI difficulty (0-1)
    const computerDifficulty = 0.85;
    
    // Event listeners for paddle control
    const keyDownHandler = (e) => {
      if (e.key === 'ArrowUp') {
        upPressed = true;
      } else if (e.key === 'ArrowDown') {
        downPressed = true;
      }
    };
    
    const keyUpHandler = (e) => {
      if (e.key === 'ArrowUp') {
        upPressed = false;
      } else if (e.key === 'ArrowDown') {
        downPressed = false;
      }
    };
    
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    // Draw functions
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };
    
    const drawPaddle = (x, y) => {
      ctx.beginPath();
      ctx.rect(x, y, paddleWidth, paddleHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.closePath();
    };
    
    const drawScore = () => {
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(player1Score, canvas.width / 4, 30);
      ctx.fillText(player2Score, (canvas.width / 4) * 3, 30);
    };
    
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
    const updateGame = () => {
      // Move player paddle
      if (upPressed && player1Y > 0) {
        player1Y -= 7;
      } else if (downPressed && player1Y < canvas.height - paddleHeight) {
        player1Y += 7;
      }
      
      // Computer AI
      const computerTargetY = ballY - (paddleHeight / 2);
      if (computerTargetY < player2Y) {
        player2Y -= 5 * computerDifficulty;
      } else if (computerTargetY > player2Y) {
        player2Y += 5 * computerDifficulty;
      }
      
      // Ball movement
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // Ball collision with top and bottom
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
      }
      
      // Ball collision with paddles
      if (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (player1Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
      }
      
      if (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
      }
      
      // Score points
      if (ballX < 0) {
        player2Score++;
        resetBall();
      } else if (ballX > canvas.width) {
        player1Score++;
        resetBall();
      }
    };
    
    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = Math.random() * 6 - 3;
    };
    
    // Game loop
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw game elements
      drawNet();
      drawBall();
      drawPaddle(0, player1Y);
      drawPaddle(canvas.width - paddleWidth, player2Y);
      drawScore();
      
      // Update game state
      updateGame();
      
      // Continue game loop
      requestAnimationFrame(gameLoop);
    };
    
    // Start the game
    gameLoop();
    
    // Cleanup event listeners on unmount
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