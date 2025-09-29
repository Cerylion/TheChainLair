import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import PADDLE_HIT_SOUND from './assets/sounds/bip.mp3';
import SCORE_SOUND from './assets/sounds/score.mp3';

// Game Configuration Constants
const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 848,
    HEIGHT: 548,
    MAX_WIDTH: '100%'
  },
  PADDLE: {
    WIDTH: 10,
    HEIGHT: 100,
    SPEED: 7,
    COMPUTER_SPEED: 5
  },
  BALL: {
    RADIUS: 8,
    INITIAL_SPEED_X: 5,
    INITIAL_SPEED_Y: 3,
    SPEED_MULTIPLIER: 0.35,
    RANDOM_SPEED_RANGE: 6
  },
  FRAME: {
    OFFSET: 24,
    LAYERS: [
      { color: '#000000', width: 10, offset: 0 },
      { color: '#FFFFFF', width: 8, offset: 10 },
      { color: '#808080', width: 8, offset: 18 }
    ]
  },
  COMPUTER: {
    DIFFICULTY: 0.85
  },
  UI: {
    PAUSE_BUTTON_SIZE: 60,
    PAUSE_BUTTON_OFFSET: 15,
    EXIT_BUTTON: {
      WIDTH: 80,
      HEIGHT: 40,
      X: 20,
      Y: 20
    },
    SCORE: {
      FONT_SIZE: 48,
      Y_POSITION: 75
    },
    PAUSE_BARS: {
      WIDTH: 8,
      HEIGHT: 28,
      SPACING: 10,
      CORNER_RADIUS: 2
    },
    CORNER_RADIUS: 12,
    LINE_WIDTH: 3,
    START_SCREEN: {
      TITLE_FONT_SIZE: 48,
      SUBTITLE_FONT_SIZE: 24,
      INSTRUCTION_FONT_SIZE: 18,
      TITLE_Y_OFFSET: 3, // canvas.height / 3
      SUBTITLE_Y_OFFSET: 2, // canvas.height / 2
      INSTRUCTION_LINE_SPACING: 30
    },
    PAUSE_SCREEN: {
      TITLE_FONT_SIZE: 36,
      FONT_SIZE: 20,
      INSTRUCTION_FONT_SIZE: 16,
      Y_OFFSET: 80,
      TITLE_Y_OFFSET: -30,
      RESUME_Y_OFFSET: 20,
      FULLSCREEN_Y_OFFSET: 50
    }
  },
  MOBILE: {
    SENSITIVITY: 2.5,
    DOUBLE_TAP_DELAY: 300,
    MOVE_THRESHOLD: 3,
    PADDING: 10
  },
  DESKTOP: {
    PADDING: 20
  },
  GAMEPAD: {
    POLLING_INTERVAL: 16,
    STICK_THRESHOLD: 0.2,
    BUTTON_INDICES: {
      SOUTH: 0,
      EAST: 1,
      NORTH: 3,
      DPAD_UP: 12,
      DPAD_DOWN: 13
    },
    AXES: {
      LEFT_STICK_Y: 1
    }
  },
  GAME: {
    CENTER_LINE: {
      DASH_LENGTH: 20,
      DASH_SPACING: 40,
      WIDTH: 2
    },
    INITIAL_SCORES: 0,
    RESET_DELAY: 0
  },
  COLORS: {
    BACKGROUND: '#000000',
    FOREGROUND: '#FFFFFF',
    PAUSE_OVERLAY: 'rgba(0, 0, 0, 0.5)',
    EXIT_BUTTON: 'rgba(255, 0, 0, 0.8)',
    FRAME_SHADOW: 'rgba(255, 255, 255, 0.1)'
  }
};

// Sound utility functions to eliminate code duplication
const playSound = (soundRef) => {
  if (soundRef.current) {
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(error => {
      // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
      console.warn('Audio play failed:', error);
    });
  }
};

const stopSound = (soundRef) => {
  if (soundRef.current) {
    soundRef.current.pause();
    soundRef.current.currentTime = 0;
  }
};

// Transform touch coordinates based on canvas scaling and fullscreen mode
const transformTouchCoordinates = (touch, canvas, isFullscreenMode) => {
  const rect = canvas.getBoundingClientRect();
  let touchX = touch.clientX - rect.left;
  let touchY = touch.clientY - rect.top;
  
  if (isFullscreenMode) {
    // Handle fullscreen mode with transform matrix scaling
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
  } else {
    // Handle normal mode with simple scaling
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    // Convert touch coordinates to canvas coordinates
    touchX = touchX / scaleX;
    touchY = touchY / scaleY;
  }
  
  return { touchX, touchY };
};

// Check if a point is within the bounds of a rectangle
const isPointInBounds = (point, bounds) => {
  return point.x >= bounds.x && 
         point.x <= bounds.x + bounds.width &&
         point.y >= bounds.y && 
         point.y <= bounds.y + bounds.height;
};

// Constrain paddle position within game boundaries
const constrainPaddle = (paddleY, frameOffset, gameHeight, paddleHeight) => {
  const minY = frameOffset;
  const maxY = frameOffset + gameHeight - paddleHeight;
  
  if (paddleY < minY) {
    return minY;
  } else if (paddleY > maxY) {
    return maxY;
  }
  return paddleY;
};

// Utility function for consistent text rendering
const drawText = (ctx, text, x, y, fontSize, color = '#FFFFFF', align = 'center') => {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
};

const Pong = () => {
  const navigate = useNavigate();
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
  const doubleTapDelay = GAME_CONFIG.MOBILE.DOUBLE_TAP_DELAY;
  
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
    
    const paddleHeight = GAME_CONFIG.PADDLE.HEIGHT;
    const paddleWidth = GAME_CONFIG.PADDLE.WIDTH;
    const ballRadius = GAME_CONFIG.BALL.RADIUS;
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    
    let ballX = frameOffset + gameWidth / 2;
    let ballY = frameOffset + gameHeight / 2;
    let ballSpeedX = GAME_CONFIG.BALL.INITIAL_SPEED_X;
    let ballSpeedY = GAME_CONFIG.BALL.INITIAL_SPEED_Y;
    
    let player1Y = frameOffset + (gameHeight - paddleHeight) / 2;
    let player2Y = frameOffset + (gameHeight - paddleHeight) / 2;
    
    let player1Score = GAME_CONFIG.GAME.INITIAL_SCORES;
    let player2Score = GAME_CONFIG.GAME.INITIAL_SCORES;
    
    let upPressed = false;
    let downPressed = false;
    
    let gamepads = {};
    let gamepadIndex = null;
    
    const computerDifficulty = GAME_CONFIG.COMPUTER.DIFFICULTY;
    
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
      const { touchX, touchY } = transformTouchCoordinates(touch, canvas, isFullscreenMode);
      
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
        
        if (isPointInBounds({ x: touchX, y: touchY }, buttonBounds)) {
          updateGameState('paused');
          return;
        }
      }
      
      // Exit button interaction (pause state only)
      if (gameStateRef.current === 'paused') {
        const exitButtonBounds = {
          x: GAME_CONFIG.UI.EXIT_BUTTON.X,
          y: GAME_CONFIG.UI.EXIT_BUTTON.Y,
          width: GAME_CONFIG.UI.EXIT_BUTTON.WIDTH,
          height: GAME_CONFIG.UI.EXIT_BUTTON.HEIGHT
        };
        
        if (isPointInBounds({ x: touchX, y: touchY }, exitButtonBounds)) {
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
      const { touchY } = transformTouchCoordinates(touch, canvas, isFullscreenMode);
      
      const moveThreshold = GAME_CONFIG.MOBILE.MOVE_THRESHOLD;
      
      if (Math.abs(touchY - touchStartY.current) > moveThreshold) {
        isDragging.current = true;
      }
      
      if (gameStateRef.current === 'playing' && isDragging.current) {
        const deltaY = touchY - touchStartY.current;
        const sensitivityMultiplier = GAME_CONFIG.MOBILE.SENSITIVITY;
        const adjustedDeltaY = deltaY * sensitivityMultiplier;
        const newPaddleY = player1Y + adjustedDeltaY;
        
        const minY = frameOffset;
        const maxY = frameOffset + gameHeight - paddleHeight;
        
        player1Y = constrainPaddle(newPaddleY, frameOffset, gameHeight, paddleHeight);
        
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
      const buttonSize = GAME_CONFIG.UI.PAUSE_BUTTON_SIZE;
      const buttonX = frameOffset + gameWidth - buttonSize - GAME_CONFIG.UI.PAUSE_BUTTON_OFFSET;
      const buttonY = GAME_CONFIG.UI.SCORE.Y_POSITION - GAME_CONFIG.UI.SCORE.FONT_SIZE + 5; // Align with top of score text
      
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
      ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
      ctx.fill();
      ctx.closePath();
    };
    
    const drawPaddle = (x, y) => {
      ctx.beginPath();
      ctx.rect(x, y, paddleWidth, paddleHeight);
      ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
      ctx.fill();
      ctx.closePath();
    };
    
    const drawScore = () => {
      drawText(ctx, player1Score, frameOffset + gameWidth / 4, GAME_CONFIG.UI.SCORE.Y_POSITION, GAME_CONFIG.UI.SCORE.FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
      drawText(ctx, player2Score, frameOffset + (3 * gameWidth) / 4, GAME_CONFIG.UI.SCORE.Y_POSITION, GAME_CONFIG.UI.SCORE.FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
    };

    const drawPauseButton = () => {
      if (inputSource.current !== 'touch' || gameStateRef.current !== 'playing') return;
      
      const buttonBounds = getPauseButtonBounds();
      const cornerRadius = GAME_CONFIG.UI.CORNER_RADIUS;
      
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
      ctx.fillStyle = GAME_CONFIG.COLORS.FRAME_SHADOW;
      ctx.fill();
      
      // Button border
      ctx.strokeStyle = GAME_CONFIG.COLORS.FOREGROUND;
      ctx.lineWidth = GAME_CONFIG.UI.LINE_WIDTH;
      ctx.stroke();
      
      // Pause symbol (two vertical bars)
      ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
      const barWidth = GAME_CONFIG.UI.PAUSE_BARS.WIDTH;
      const barHeight = GAME_CONFIG.UI.PAUSE_BARS.HEIGHT;
      const barSpacing = GAME_CONFIG.UI.PAUSE_BARS.SPACING;
      const startX = buttonBounds.x + (buttonBounds.width - (2 * barWidth + barSpacing)) / 2;
      const startY = buttonBounds.y + (buttonBounds.height - barHeight) / 2;
      
      // Left bar with rounded edges
      ctx.beginPath();
      ctx.roundRect(startX, startY, barWidth, barHeight, GAME_CONFIG.UI.PAUSE_BARS.CORNER_RADIUS);
      ctx.fill();
      
      // Right bar with rounded edges
      ctx.beginPath();
      ctx.roundRect(startX + barWidth + barSpacing, startY, barWidth, barHeight, GAME_CONFIG.UI.PAUSE_BARS.CORNER_RADIUS);
      ctx.fill();
    };
    
    const drawFrame = () => {
      const borderLayers = GAME_CONFIG.FRAME.LAYERS;
      
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
      for (let i = frameOffset; i < frameOffset + gameHeight; i += GAME_CONFIG.GAME.CENTER_LINE.DASH_SPACING) {
        ctx.beginPath();
        ctx.rect(frameOffset + gameWidth / 2 - GAME_CONFIG.GAME.CENTER_LINE.WIDTH / 2, i, GAME_CONFIG.GAME.CENTER_LINE.WIDTH, GAME_CONFIG.GAME.CENTER_LINE.DASH_LENGTH);
        ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
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
      
      player1Score = GAME_CONFIG.GAME.INITIAL_SCORES;
      player2Score = GAME_CONFIG.GAME.INITIAL_SCORES;
      
      // Navigate back to games page using React Router
      navigate('/games');
    };
    
    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        const gamepad = navigator.getGamepads()[gamepadIndex];
        if (gamepad) {
          const southButtonPressed = gamepad.buttons[GAME_CONFIG.GAMEPAD.BUTTON_INDICES.SOUTH].pressed;
          const eastButtonPressed = gamepad.buttons[GAME_CONFIG.GAMEPAD.BUTTON_INDICES.EAST].pressed;
          const northButtonPressed = gamepad.buttons[GAME_CONFIG.GAMEPAD.BUTTON_INDICES.NORTH].pressed;
          
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
          
          const leftStickY = gamepad.axes[GAME_CONFIG.GAMEPAD.AXES.LEFT_STICK_Y];
          const dpadUp = gamepad.buttons[GAME_CONFIG.GAMEPAD.BUTTON_INDICES.DPAD_UP].pressed;
          const dpadDown = gamepad.buttons[GAME_CONFIG.GAMEPAD.BUTTON_INDICES.DPAD_DOWN].pressed;
          
          const hasGamepadInput = dpadUp || dpadDown || Math.abs(leftStickY) > GAME_CONFIG.GAMEPAD.STICK_THRESHOLD;
          
          if (gameStateRef.current === 'start' && (hasGamepadInput || southButtonPressed)) {
            console.log("Starting game from gamepad input");
            updateGameState('playing');
          }
          
          if (gameStateRef.current === 'playing') {
            if (hasGamepadInput) {
              inputSource.current = 'gamepad';
              
              if (dpadUp || leftStickY < -GAME_CONFIG.GAMEPAD.STICK_THRESHOLD) {
                upPressed = true;
                downPressed = false;
              } else if (dpadDown || leftStickY > GAME_CONFIG.GAMEPAD.STICK_THRESHOLD) {
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
      let newPlayer1Y = player1Y;
      if (upPressed) {
        newPlayer1Y -= 7;
      } else if (downPressed) {
        newPlayer1Y += 7;
      }
      player1Y = constrainPaddle(newPlayer1Y, frameOffset, gameHeight, paddleHeight);
      
      // Computer AI
      const computerTargetY = ballY - (paddleHeight / 2);
      if (computerTargetY < player2Y) {
        player2Y -= 5 * computerDifficulty;
      } else if (computerTargetY > player2Y) {
        player2Y += 5 * computerDifficulty;
      }
      
      // Constrain computer paddle
      player2Y = constrainPaddle(player2Y, frameOffset, gameHeight, paddleHeight);
      
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
        ballSpeedY = deltaY * GAME_CONFIG.BALL.SPEED_MULTIPLIER;
        
        playSound(paddleHitSound);
      }
      
      // Ball collision with computer paddle
      if (ballX + ballRadius > frameOffset + gameWidth - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        const deltaY = ballY - (player2Y + paddleHeight / 2);
        ballSpeedY = deltaY * GAME_CONFIG.BALL.SPEED_MULTIPLIER;
        
        playSound(paddleHitSound);
      }
      
      // Scoring
      if (ballX < frameOffset) {
        player2Score++;
        
        playSound(scoreSound);
        
        resetBall();
      } else if (ballX > frameOffset + gameWidth) {
        player1Score++;
        
        playSound(scoreSound);
        
        resetBall();
      }
    };
    
    const toggleFullscreenMode = () => {
      setIsFullscreenMode(prev => {
        const newFullscreenState = !prev;
        
        if (newFullscreenState) {
          const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
          const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
          
          const padding = isMobile ? GAME_CONFIG.MOBILE.PADDING : GAME_CONFIG.DESKTOP.PADDING;
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
          canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH; // Restore original mobile scaling
          
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
      ballSpeedY = Math.random() * GAME_CONFIG.BALL.RANDOM_SPEED_RANGE - (GAME_CONFIG.BALL.RANDOM_SPEED_RANGE / 2);
    };
    
    const drawStartScreen = () => {
      ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawText(ctx, 'React Pong', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.TITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.TITLE_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
      
      if (inputSource.current === 'touch') {
        drawText(ctx, 'Tap to Start', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        
        drawText(ctx, 'Drag to move paddle • Tap to pause', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        drawText(ctx, 'Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 2, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        
      } else {
        drawText(ctx, 'Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        
        if (gamepadConnected) {
          drawText(ctx, 'or Press A Button on Gamepad', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        }
        
        const yOffset = gamepadConnected ? GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 2 : GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING;
        drawText(ctx, 'Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + yOffset, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        
        if (gamepadConnected) {
          drawText(ctx, 'or Press Y Button for fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 3, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
        }
      }
    };
    
    const drawPauseScreen = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawText(ctx, 'PAUSED', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.TITLE_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.TITLE_FONT_SIZE, '#FFFFFF');
      
      if (inputSource.current === 'gamepad') {
        drawText(ctx, 'Press A Button to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
        
        drawText(ctx, 'Press Y Button to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
        
      } else if (inputSource.current === 'touch') {
        drawText(ctx, 'Tap to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
        
        drawText(ctx, 'Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
        
      } else {
        drawText(ctx, 'Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
        
        drawText(ctx, 'Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
      }
      
      if (inputSource.current === 'touch') {
        drawText(ctx, 'Tap Exit Button to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
        
      } else if (inputSource.current === 'gamepad') {
        drawText(ctx, 'Press B Button to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
        
      } else {
        drawText(ctx, 'Press ESC to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
      }
      
      // Mobile exit button
      if (inputSource.current === 'touch') {
        const buttonWidth = GAME_CONFIG.UI.EXIT_BUTTON.WIDTH;
        const buttonHeight = GAME_CONFIG.UI.EXIT_BUTTON.HEIGHT;
        const buttonX = GAME_CONFIG.UI.EXIT_BUTTON.X;
        const buttonY = GAME_CONFIG.UI.EXIT_BUTTON.Y;
        
        ctx.fillStyle = GAME_CONFIG.COLORS.EXIT_BUTTON;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.strokeStyle = GAME_CONFIG.COLORS.FOREGROUND;
        ctx.lineWidth = GAME_CONFIG.UI.LINE_WIDTH;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        drawText(ctx, 'EXIT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6, 16, GAME_CONFIG.COLORS.FOREGROUND);
      }
    };
    
    const gameLoop = () => {
      if (gameStateRef.current === 'start') {
        drawStartScreen();
        
      } else if (gameStateRef.current === 'playing') {
        ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
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
        ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
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
    
    const handleVisibilityChange = () => {
      // Exit fullscreen mode when page becomes hidden to prevent blank screen bug
      if (document.hidden && isFullscreenMode) {
        console.log("Page hidden while in fullscreen - exiting fullscreen mode");
        toggleFullscreenMode();
      }
    };

    const handleBeforeUnload = () => {
      // Clean up fullscreen styles before page unloads
      if (isFullscreenMode) {
        console.log("Page unloading while in fullscreen - cleaning up styles");
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.transform = '';
          canvas.style.zIndex = '';
          canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
        }
        
        document.body.style.overflow = '';
        document.body.classList.remove('pong-fullscreen');
        
        const fullscreenStyle = document.getElementById('pong-fullscreen-style');
        if (fullscreenStyle) {
          fullscreenStyle.remove();
        }
      }
    };

    const handlePopState = () => {
      // Clean up fullscreen styles when navigating back/forward
      if (isFullscreenMode) {
        console.log("Navigation detected while in fullscreen - cleaning up styles");
        handleBeforeUnload();
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
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
    
    gamepadPollingInterval = setInterval(pollGamepad, GAME_CONFIG.GAMEPAD.POLLING_INTERVAL);
    
    return () => {
      console.log("Component unmounting - cleaning up resources");
      isGameActive.current = false;
      
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener("gamepadconnected", gamepadConnectHandler);
      window.removeEventListener("gamepaddisconnected", gamepadDisconnectHandler);
      
      // Capture canvas reference at cleanup time to avoid initialization errors
      const currentCanvas = canvasRef.current;
      
      if (mobileDetected && currentCanvas) {
        currentCanvas.removeEventListener('touchstart', touchStartHandler);
        currentCanvas.removeEventListener('touchmove', touchMoveHandler);
        currentCanvas.removeEventListener('touchend', touchEndHandler);
      }
      
      clearInterval(gamepadPollingInterval);
      
      // Clean up fullscreen styles when component unmounts
      if (currentCanvas) {
        currentCanvas.style.position = '';
        currentCanvas.style.top = '';
        currentCanvas.style.left = '';
        currentCanvas.style.transform = '';
        currentCanvas.style.zIndex = '';
        currentCanvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
      }
      
      document.body.style.overflow = '';
      document.body.classList.remove('pong-fullscreen');
      
      const fullscreenStyle = document.getElementById('pong-fullscreen-style');
      if (fullscreenStyle) {
        fullscreenStyle.remove();
      }
      
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
      <h1 className="mb-4">Refined React Pong</h1>
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
          width={GAME_CONFIG.CANVAS.WIDTH} 
          height={GAME_CONFIG.CANVAS.HEIGHT} 
          style={{ 
            background: GAME_CONFIG.COLORS.BACKGROUND, 
            maxWidth: GAME_CONFIG.CANVAS.MAX_WIDTH
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