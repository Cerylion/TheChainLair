import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import PADDLE_HIT_SOUND from './assets/sounds/bip.mp3';
import SCORE_SOUND from './assets/sounds/score.mp3';

const Pong = () => {
  const canvasRef = useRef(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [_, setGameState] = useState('start');
  const gameStateRef = useRef('start');
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const inputSource = useRef('keyboard');
  const isGameActive = useRef(true);
  
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const lastTapTime = useRef(0);
  const doubleTapDelay = 300;
  
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const paddleHitSound = useRef(null);
  const scoreSound = useRef(null);
  
  const lastSouthButtonStateRef = useRef(false);
  const lastEastButtonStateRef = useRef(false);
  const lastNorthButtonStateRef = useRef(false);

  const detectMobileDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
                          ('ontouchstart' in window) ||
                          (navigator.maxTouchPoints > 0) ||
                          (navigator.msMaxTouchPoints > 0);
    return isMobileDevice;
  };

  const updateGameState = (newState) => {
    gameStateRef.current = newState;
    setGameState(newState);
  };

  useEffect(() => {
    const mobileDetected = detectMobileDevice();
    setIsMobile(mobileDetected);
    console.log("Mobile device detected:", mobileDetected);
    
    paddleHitSound.current = new Audio(PADDLE_HIT_SOUND);
    scoreSound.current = new Audio(SCORE_SOUND);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let gamepadPollingInterval;
    
    const paddleHeight = 100;
    const paddleWidth = 10;
    const ballRadius = 8;
    const frameOffset = 24;
    
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    
    let ballX = frameOffset + gameWidth / 2;
    let ballY = frameOffset + gameHeight / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 3;
    
    let player1Y = frameOffset + (gameHeight - paddleHeight) / 2;
    let player2Y = frameOffset + (gameHeight - paddleHeight) / 2;
    
    let player1Score = 0;
    let player2Score = 0;
    
    let upPressed = false;
    let downPressed = false;
    
    let gamepads = {};
    let gamepadIndex = null;
    
    const computerDifficulty = 0.85;
    
    const gamepadConnectHandler = (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
      gamepads[e.gamepad.index] = e.gamepad;
      gamepadIndex = e.gamepad.index;
      setGamepadConnected(true);
    };
    
    const gamepadDisconnectHandler = (e) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
      delete gamepads[e.gamepad.index];
      if (gamepadIndex === e.gamepad.index) {
        gamepadIndex = null;
      }
      setGamepadConnected(false);
    };
    
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

    const keyDownHandler = (e) => {
      inputSource.current = 'keyboard';
      
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        
        if (gameStateRef.current === 'start') {
          updateGameState('playing');
        } else if (gameStateRef.current === 'playing') {
          updateGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          updateGameState('playing');
        }
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        
        if (gameStateRef.current === 'paused') {
          cleanupGame();
        }
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleFullscreenMode();
        return;
      }
      
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'start') {
        e.preventDefault();
        updateGameState('playing');
        return;
      }
      
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && gameStateRef.current === 'playing') {
        e.preventDefault();
        inputSource.current = 'keyboard';
        
        if (e.key === 'ArrowUp') {
          upPressed = true;
        } else if (e.key === 'ArrowDown') {
          downPressed = true;
        }
      }
    };
    
    const keyUpHandler = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (inputSource.current === 'keyboard') {
          if (e.key === 'ArrowUp') {
            upPressed = false;
          } else if (e.key === 'ArrowDown') {
            downPressed = false;
          }
        }
      }
    };
    
    const touchStartHandler = (e) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      let touchX = touch.clientX - rect.left;
      let touchY = touch.clientY - rect.top;
      
      // Adjust coordinates for fullscreen mode
      if (isFullscreenMode) {
        const canvasStyle = window.getComputedStyle(canvas);
        const transform = canvasStyle.transform;
        
        if (transform && transform !== 'none') {
          // Extract scale from transform matrix
          const matrix = transform.match(/matrix\(([^)]+)\)/);
          if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            
            // Adjust touch coordinates for scale
            const canvasRect = canvas.getBoundingClientRect();
            const canvasCenterX = canvasRect.left + canvasRect.width / 2;
            const canvasCenterY = canvasRect.top + canvasRect.height / 2;
            
            // Convert to canvas coordinates
            touchX = (touch.clientX - canvasCenterX) / scaleX + canvas.width / 2;
            touchY = (touch.clientY - canvasCenterY) / scaleY + canvas.height / 2;
          }
        }
      }
      
      inputSource.current = 'touch';
      
      // Double-tap detection for fullscreen
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTapTime.current;
      
      if (timeDiff < doubleTapDelay) {
        toggleFullscreenMode();
        lastTapTime.current = 0;
        return;
      }
      
      lastTapTime.current = currentTime;
      
      // Pause button interaction (playing state only)
      if (gameStateRef.current === 'playing') {
        const buttonBounds = getPauseButtonBounds();
        
        if (touchX >= buttonBounds.x && touchX <= buttonBounds.x + buttonBounds.width &&
            touchY >= buttonBounds.y && touchY <= buttonBounds.y + buttonBounds.height) {
          updateGameState('paused');
          return;
        }
      }
      
      // Exit button interaction (pause state only)
      if (gameStateRef.current === 'paused') {
        const buttonWidth = 80;
        const buttonHeight = 40;
        const buttonX = 20;
        const buttonY = 20;
        
        if (touchX >= buttonX && touchX <= buttonX + buttonWidth &&
            touchY >= buttonY && touchY <= buttonY + buttonHeight) {
          cleanupGame();
          return;
        }
      }
      
      touchStartY.current = touchY;
      isDragging.current = false;
      
      if (gameStateRef.current === 'start') {
        updateGameState('playing');
      } else if (gameStateRef.current === 'paused') {
        updateGameState('playing');
      }
      // Removed the automatic pause timeout that was causing accidental pauses
    };
   
    const touchMoveHandler = (e) => {
      e.preventDefault();
      
      if (touchStartY.current === null) return;
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      
      const moveThreshold = 3;
      
      if (Math.abs(touchY - touchStartY.current) > moveThreshold) {
        isDragging.current = true;
      }
      
      if (gameStateRef.current === 'playing' && isDragging.current) {
        const deltaY = touchY - touchStartY.current;
        const newPaddleY = player1Y + deltaY;
        
        const minY = frameOffset;
        const maxY = frameOffset + gameHeight - paddleHeight;
        
        if (newPaddleY >= minY && newPaddleY <= maxY) {
          player1Y = newPaddleY;
        } else if (newPaddleY < minY) {
          player1Y = minY;
        } else if (newPaddleY > maxY) {
          player1Y = maxY;
        }
        
        touchStartY.current = touchY;
      }
    };
    
    const touchEndHandler = (e) => {
      e.preventDefault();
      
      touchStartY.current = null;
      isDragging.current = false;
      
      upPressed = false;
      downPressed = false;
    };
    
    // Helper function to calculate pause button position
    const getPauseButtonBounds = () => {
      const buttonSize = 60;
      const buttonX = frameOffset + gameWidth - buttonSize - 15;
      const buttonY = 75 - buttonSize / 2; // Align with scores vertically, centered on score baseline
      
      return {
        x: buttonX,
        y: buttonY,
        size: buttonSize,
        width: buttonSize,
        height: buttonSize
      };
    };
    
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
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      
      ctx.fillText(player1Score, frameOffset + gameWidth / 4, 75);
      ctx.fillText(player2Score, frameOffset + (3 * gameWidth) / 4, 75);
    };

    const drawPauseButton = () => {
      if (inputSource.current !== 'touch' || gameStateRef.current !== 'playing') return;
      
      const buttonBounds = getPauseButtonBounds();
      const cornerRadius = 12;
      
      // Draw rounded rectangle background
      ctx.beginPath();
      ctx.moveTo(buttonBounds.x + cornerRadius, buttonBounds.y);
      ctx.lineTo(buttonBounds.x + buttonBounds.width - cornerRadius, buttonBounds.y);
      ctx.quadraticCurveTo(buttonBounds.x + buttonBounds.width, buttonBounds.y, buttonBounds.x + buttonBounds.width, buttonBounds.y + cornerRadius);
      ctx.lineTo(buttonBounds.x + buttonBounds.width, buttonBounds.y + buttonBounds.height - cornerRadius);
      ctx.quadraticCurveTo(buttonBounds.x + buttonBounds.width, buttonBounds.y + buttonBounds.height, buttonBounds.x + buttonBounds.width - cornerRadius, buttonBounds.y + buttonBounds.height);
      ctx.lineTo(buttonBounds.x + cornerRadius, buttonBounds.y + buttonBounds.height);
      ctx.quadraticCurveTo(buttonBounds.x, buttonBounds.y + buttonBounds.height, buttonBounds.x, buttonBounds.y + buttonBounds.height - cornerRadius);
      ctx.lineTo(buttonBounds.x, buttonBounds.y + cornerRadius);
      ctx.quadraticCurveTo(buttonBounds.x, buttonBounds.y, buttonBounds.x + cornerRadius, buttonBounds.y);
      ctx.closePath();
      
      // Button background (semi-transparent)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      
      // Button border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Pause symbol (two vertical bars)
      ctx.fillStyle = '#FFFFFF';
      const barWidth = 8;
      const barHeight = 28;
      const barSpacing = 10;
      const startX = buttonBounds.x + (buttonBounds.width - (2 * barWidth + barSpacing)) / 2;
      const startY = buttonBounds.y + (buttonBounds.height - barHeight) / 2;
      
      // Left bar with rounded edges
      ctx.beginPath();
      ctx.roundRect(startX, startY, barWidth, barHeight, 2);
      ctx.fill();
      
      // Right bar with rounded edges
      ctx.beginPath();
      ctx.roundRect(startX + barWidth + barSpacing, startY, barWidth, barHeight, 2);
      ctx.fill();
    };
    
    const drawFrame = () => {
      const borderLayers = [
        { color: '#000000', width: 10, offset: 0 },
        { color: '#FFFFFF', width: 8, offset: 10 },
        { color: '#808080', width: 8, offset: 18 }
      ];
      
      borderLayers.forEach(layer => {
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.width;
        
        const x = layer.offset + layer.width / 2;
        const y = layer.offset + layer.width / 2;
        const width = canvas.width - (layer.offset + layer.width / 2) * 2;
        const height = canvas.height - (layer.offset + layer.width / 2) * 2;
        
        ctx.strokeRect(x, y, width, height);
      });
    };
    
    const drawNet = () => {
      for (let i = frameOffset; i < frameOffset + gameHeight; i += 40) {
        ctx.beginPath();
        ctx.rect(frameOffset + gameWidth / 2 - 1, i, 2, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.closePath();
      }
    };
    
    const cleanupGame = () => {
      isGameActive.current = false;
      
      if (paddleHitSound.current) {
        paddleHitSound.current.pause();
        paddleHitSound.current.currentTime = 0;
      }
      if (scoreSound.current) {
        scoreSound.current.pause();
        scoreSound.current.currentTime = 0;
      }
      
      clearInterval(gamepadPollingInterval);
      
      updateGameState('start');
      
      player1Score = 0;
      player2Score = 0;
      
      setTimeout(() => {
        const goBack = () => {
          window.history.back();
        };
        setTimeout(goBack, 0);
      }, 0);
    };
    
    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (gamepad) {
          const southButtonPressed = gamepad.buttons[0].pressed;
          const eastButtonPressed = gamepad.buttons[1].pressed;
          const northButtonPressed = gamepad.buttons[3].pressed;
          
          if (northButtonPressed) {
            if (!lastNorthButtonStateRef.current) {
              toggleFullscreenMode();
            }
            lastNorthButtonStateRef.current = true;
          } else {
            lastNorthButtonStateRef.current = false;
          }
          
          if (eastButtonPressed) {
            if (!lastEastButtonStateRef.current && gameStateRef.current === 'paused') {
              cleanupGame();
            }
            lastEastButtonStateRef.current = true;
          } else {
            lastEastButtonStateRef.current = false;
          }
          
          if (southButtonPressed) {
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
          
          const leftStickY = gamepad.axes[1];
          const dpadUp = gamepad.buttons[12].pressed;
          const dpadDown = gamepad.buttons[13].pressed;
          
          const hasGamepadInput = dpadUp || dpadDown || Math.abs(leftStickY) > 0.2;
          
          if (gameStateRef.current === 'start' && (hasGamepadInput || southButtonPressed)) {
            console.log("Starting game from gamepad input");
            updateGameState('playing');
          }
          
          if (gameStateRef.current === 'playing') {
            if (hasGamepadInput) {
              inputSource.current = 'gamepad';
              
              if (dpadUp || leftStickY < -0.2) {
                upPressed = true;
                downPressed = false;
              } else if (dpadDown || leftStickY > 0.2) {
                downPressed = true;
                upPressed = false;
              } else {
                upPressed = false;
                downPressed = false;
              }
            } else {
              if (inputSource.current === 'gamepad') {
                upPressed = false;
                downPressed = false;
              }
            }
          }
        }
      }
    };

    const updateGame = () => {
      // Move player paddle
      if (upPressed && player1Y > frameOffset) {
        player1Y -= 7;
      } else if (downPressed && player1Y < frameOffset + gameHeight - paddleHeight) {
        player1Y += 7;
      }
      
      // Computer AI
      const computerTargetY = ballY - (paddleHeight / 2);
      if (computerTargetY < player2Y) {
        player2Y -= 5 * computerDifficulty;
      } else if (computerTargetY > player2Y) {
        player2Y += 5 * computerDifficulty;
      }
      
      // Constrain computer paddle
      if (player2Y < frameOffset) {
        player2Y = frameOffset;
      } else if (player2Y > frameOffset + gameHeight - paddleHeight) {
        player2Y = frameOffset + gameHeight - paddleHeight;
      }
      
      // Ball movement
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // Ball collision with top and bottom walls
      if (ballY - ballRadius < frameOffset || ballY + ballRadius > frameOffset + gameHeight) {
        ballSpeedY = -ballSpeedY;
      }
      
      // Ball collision with player paddle
      if (ballX - ballRadius < frameOffset + paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (player1Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        paddleHitSound.current.currentTime = 0;
        paddleHitSound.current.play();
      }
      
      // Ball collision with computer paddle
      if (ballX + ballRadius > frameOffset + gameWidth - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * 0.35;
        
        paddleHitSound.current.currentTime = 0;
        paddleHitSound.current.play();
      }
      
      // Scoring
      if (ballX < frameOffset) {
        player2Score++;
        
        scoreSound.current.currentTime = 0;
        scoreSound.current.play();
        
        resetBall();
      } else if (ballX > frameOffset + gameWidth) {
        player1Score++;
        
        scoreSound.current.currentTime = 0;
        scoreSound.current.play();
        
        resetBall();
      }
    };
    
    const toggleFullscreenMode = () => {
      setIsFullscreenMode(prev => {
        const newFullscreenState = !prev;
        
        if (newFullscreenState) {
          const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
          const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
          
          const padding = isMobile ? 10 : 20;
          const availableWidth = viewportWidth - padding * 2;
          const availableHeight = viewportHeight - padding * 2;
          
          const scaleX = availableWidth / canvas.width;
          const scaleY = availableHeight / canvas.height;
          const scale = Math.min(scaleX, scaleY);
          
          const finalScale = scale;
          
          canvas.style.position = 'fixed';
          canvas.style.top = '50%';
          canvas.style.left = '50%';
          canvas.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
          canvas.style.zIndex = '9999';
          canvas.style.maxWidth = 'none';
          
          document.body.style.overflow = 'hidden';
          document.body.classList.add('pong-fullscreen');
          
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
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.transform = '';
          canvas.style.zIndex = '';
          canvas.style.maxWidth = '';
          
          document.body.style.overflow = '';
          document.body.classList.remove('pong-fullscreen');
          
          const fullscreenStyle = document.getElementById('pong-fullscreen-style');
          if (fullscreenStyle) {
            fullscreenStyle.remove();
          }
        }
        
        return newFullscreenState;
      });
    };

    const resetBall = () => {
      ballX = frameOffset + gameWidth / 2;
      ballY = frameOffset + gameHeight / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = Math.random() * 6 - 3;
    };
    
    const drawStartScreen = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('JavaScript PONG', canvas.width / 2, canvas.height / 3);
      
      ctx.font = '24px Arial';
      
      if (inputSource.current === 'touch') {
        ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '18px Arial';
        ctx.fillText('Drag to move paddle • Tap to pause', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + 70);
        
      } else {
        ctx.fillText('Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / 2);
        
        if (gamepadConnected) {
          ctx.fillText('or Press A Button on Gamepad', canvas.width / 2, canvas.height / 2 + 40);
        }
        
        ctx.font = '18px Arial';
        const yOffset = gamepadConnected ? 70 : 40;
        ctx.fillText('Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + yOffset);
        
        if (gamepadConnected) {
          ctx.fillText('or Press Y Button for fullscreen', canvas.width / 2, canvas.height / 2 + 100);
        }
      }
    };
    
    const drawPauseScreen = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 30);
      
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
      
      // Mobile exit button
      if (inputSource.current === 'touch') {
        const buttonWidth = 80;
        const buttonHeight = 40;
        const buttonX = 20;
        const buttonY = 20;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6);
      }
    };
    
    const gameLoop = () => {
      if (gameStateRef.current === 'start') {
        drawStartScreen();
        
      } else if (gameStateRef.current === 'playing') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawFrame();
        drawNet();
        drawBall();
        drawPaddle(frameOffset, player1Y);
        drawPaddle(frameOffset + gameWidth - paddleWidth, player2Y);
        drawScore();
        drawPauseButton(); // Add pause button to playing state
        
        updateGame();
        
      } else if (gameStateRef.current === 'paused') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawFrame();
        drawNet();
        drawBall();
        drawPaddle(frameOffset, player1Y);
        drawPaddle(frameOffset + gameWidth - paddleWidth, player2Y);
        drawScore();
        
        drawPauseScreen();
      }
      
      if (isGameActive.current) {
        requestAnimationFrame(gameLoop);
      }
    };
    
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    window.addEventListener("gamepadconnected", gamepadConnectHandler);
    window.addEventListener("gamepaddisconnected", gamepadDisconnectHandler);
    
    if (mobileDetected) {
      canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
      canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
      canvas.addEventListener('touchend', touchEndHandler, { passive: false });
      console.log("Touch event listeners added for mobile device");
    }
    
    checkGamepads();
    gameLoop();
    
    gamepadPollingInterval = setInterval(pollGamepad, 16);
    
    return () => {
      console.log("Component unmounting - cleaning up resources");
      isGameActive.current = false;
      
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener("gamepadconnected", gamepadConnectHandler);
      window.removeEventListener("gamepaddisconnected", gamepadDisconnectHandler);
      
      if (mobileDetected) {
        canvas.removeEventListener('touchstart', touchStartHandler);
        canvas.removeEventListener('touchmove', touchMoveHandler);
        canvas.removeEventListener('touchend', touchEndHandler);
      }
      
      clearInterval(gamepadPollingInterval);
      
      if (paddleHitSound.current) {
        paddleHitSound.current.pause();
        paddleHitSound.current.currentTime = 0;
      }
      if (scoreSound.current) {
        scoreSound.current.pause();
        scoreSound.current.currentTime = 0;
      }
    };
  }, []);
  
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