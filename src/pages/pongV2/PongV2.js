import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useAudioManager from './hooks/useAudioManager';
import { GAME_CONFIG } from './config/gameConfig';
import {
  drawBall,
  drawPaddle,
  drawScore,
  drawPauseButton,
  drawFrame,
  drawNet,
  drawStartScreen,
  drawPauseScreen,
  getPauseButtonBounds
} from './utils/GameRenderer';

// Transform touch coordinates based on canvas scaling and fullscreen mode
const transformTouchCoordinates = (touch, canvas, isFullscreenMode) => {
  const rect = canvas.getBoundingClientRect();
  let touchX = touch.clientX - rect.left;
  let touchY = touch.clientY - rect.top;
  
  if (isFullscreenMode) {
    // Handle fullscreen mode - use center-based coordinate transformation
    const computedStyle = window.getComputedStyle(canvas);
    const transform = computedStyle.transform;
    
    if (transform && transform !== 'none') {
      // Extract scale values from transform matrix
      const matrix = new DOMMatrix(transform);
      const scaleX = matrix.a;
      const scaleY = matrix.d;
      
      // Adjust touch coordinates for scale using center-based approach
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      
      // Convert to canvas coordinates
      touchX = (touch.clientX - canvasCenterX) / scaleX + canvas.width / 2;
      touchY = (touch.clientY - canvasCenterY) / scaleY + canvas.height / 2;
    } else {
      // Fallback for when no transform is applied
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      
      touchX = touchX / scaleX;
      touchY = touchY / scaleY;
    }
  } else {
    // Adjust coordinates for normal mode when canvas is scaled (mobile)
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    touchX = touchX / scaleX;
    touchY = touchY / scaleY;
  }
  
  return { x: touchX, y: touchY };
};

const transformMouseCoordinates = (e, canvas, isFullscreenMode) => {
  const rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;
  
  if (isFullscreenMode) {
    // Handle fullscreen mode - use center-based coordinate transformation
    const computedStyle = window.getComputedStyle(canvas);
    const transform = computedStyle.transform;
    
    if (transform && transform !== 'none') {
      // Extract scale values from transform matrix
      const matrix = new DOMMatrix(transform);
      const scaleX = matrix.a;
      const scaleY = matrix.d;
      
      // Adjust mouse coordinates for scale using center-based approach
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      
      // Convert to canvas coordinates
      mouseX = (e.clientX - canvasCenterX) / scaleX + canvas.width / 2;
      mouseY = (e.clientY - canvasCenterY) / scaleY + canvas.height / 2;
    } else {
      // Fallback for when no transform is applied
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      
      mouseX = mouseX / scaleX;
      mouseY = mouseY / scaleY;
    }
  } else {
    // Adjust coordinates for normal mode when canvas is scaled (mobile)
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    
    mouseX = mouseX / scaleX;
    mouseY = mouseY / scaleY;
  }
  
  return { x: mouseX, y: mouseY };
};

const isPointInBounds = (point, bounds) => {
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
         point.y >= bounds.y && point.y <= bounds.y + bounds.height;
};

const constrainPaddle = (paddleY, frameOffset, gameHeight, paddleHeight) => {
  const minY = frameOffset;
  const maxY = frameOffset + gameHeight - paddleHeight;
  
  if (paddleY < minY) return minY;
  if (paddleY > maxY) return maxY;
  return paddleY;
};

const constrainPointToGameBounds = (point, frameOffset, gameWidth, gameHeight) => {
  const minX = frameOffset;
  const maxX = frameOffset + gameWidth;
  const minY = frameOffset;
  const maxY = frameOffset + gameHeight;
  
  return {
    x: Math.max(minX, Math.min(maxX, point.x)),
    y: Math.max(minY, Math.min(maxY, point.y))
  };
};

const Pong = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [_, setGameState] = useState('start');
  const gameStateRef = useRef('start');
  const [isMobile, setIsMobile] = useState(false);
  const inputSource = useRef('keyboard');
  const isGameActive = useRef(true);

  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const lastTapTime = useRef(0);
  const doubleTapDelay = GAME_CONFIG.MOBILE.DOUBLE_TAP_DELAY;

  const mouseStartY = useRef(null);
  const isMouseDragging = useRef(false);

  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const { playPaddleHitSound, playScoreSound, stopAllSounds } = useAudioManager();

  const lastSouthButtonStateRef = useRef(false);
  const lastEastButtonStateRef = useRef(false);
  const lastNorthButtonStateRef = useRef(false);

  // Game state refs
  const ballXRef = useRef(0);
  const ballYRef = useRef(0);
  const ballSpeedXRef = useRef(0);
  const ballSpeedYRef = useRef(0);
  const player1YRef = useRef(0);
  const player2YRef = useRef(0);
  const player1ScoreRef = useRef(0);
  const player2ScoreRef = useRef(0);
  const upPressedRef = useRef(false);
  const downPressedRef = useRef(false);
  const gamepadsRef = useRef({});
  const gamepadIndexRef = useRef(null);

  const detectMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
  };

  const updateGameState = useCallback((newState) => {
    gameStateRef.current = newState;
    setGameState(newState);
  }, []);

  const cleanupGame = useCallback(() => {
    if (isFullscreenMode) {
      document.exitFullscreen?.() || 
      document.webkitExitFullscreen?.() || 
      document.mozCancelFullScreen?.() || 
      document.msExitFullscreen?.();
      
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    navigate('/games');
  }, [isFullscreenMode, navigate]);

  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(document.fullscreenElement || 
                                     document.webkitFullscreenElement || 
                                     document.mozFullScreenElement || 
                                     document.msFullscreenElement);
    setIsFullscreenMode(isCurrentlyFullscreen);
    
    if (!isCurrentlyFullscreen) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Reset canvas styling to prevent overflow on mobile
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
        canvas.style.width = '';
        canvas.style.height = '';
      }
    }
  }, []);

  const toggleFullscreenMode = useCallback(() => {
    if (!isFullscreenMode) {
      const canvas = canvasRef.current;
      if (canvas) {
        const requestFullscreen = canvas.requestFullscreen || 
                                 canvas.webkitRequestFullscreen || 
                                 canvas.mozRequestFullScreen || 
                                 canvas.msRequestFullscreen;
        
        if (requestFullscreen) {
          requestFullscreen.call(canvas);
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        }
      }
    } else {
      const exitFullscreen = document.exitFullscreen || 
                             document.webkitExitFullscreen || 
                             document.mozCancelFullScreen || 
                             document.msExitFullscreen;
      
      if (exitFullscreen) {
        exitFullscreen.call(document);
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }
  }, [isFullscreenMode]);

  const gamepadConnectHandler = useCallback((e) => {
    setGamepadConnected(true);
    gamepadIndexRef.current = e.gamepad.index;
  }, []);

  const gamepadDisconnectHandler = useCallback((e) => {
    setGamepadConnected(false);
    gamepadIndexRef.current = null;
  }, []);

  const checkGamepads = useCallback(() => {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gamepadsRef.current[i] = gamepads[i];
        if (!gamepadConnected) {
          setGamepadConnected(true);
        }
      }
    }
  }, [gamepadConnected]);

  const keyDownHandler = useCallback((e) => {
    // Set input source to keyboard when any key is pressed
    inputSource.current = 'keyboard';
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        upPressedRef.current = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        downPressedRef.current = true;
        break;
      case ' ':
        e.preventDefault();
        if (gameStateRef.current === 'start') {
          updateGameState('playing');
        } else if (gameStateRef.current === 'playing') {
          updateGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          updateGameState('playing');
        }
        break;
      case 'Escape':
        e.preventDefault();
        // Only allow ESC to exit game when in paused state
        if (gameStateRef.current === 'paused') {
          cleanupGame();
        }
        break;
      case 'Enter':
        e.preventDefault();
        toggleFullscreenMode();
        break;
    }
  }, [updateGameState, cleanupGame, toggleFullscreenMode]);

  const keyUpHandler = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp':
        upPressedRef.current = false;
        break;
      case 'ArrowDown':
        downPressedRef.current = false;
        break;
    }
  }, []);

  // Remove the duplicate getPauseButtonBounds function and use the one from GameRenderer
  // This ensures the clickable area matches exactly with the visual button position

  const touchStartHandler = useCallback((e) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    // Set input source immediately for UI visibility
    inputSource.current = 'touch';

    const touch = e.touches[0];
    const coords = transformTouchCoordinates(touch, canvas, isFullscreenMode);
    
    // In fullscreen mode, constrain coordinates to game bounds to prevent button clicks outside game area
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    const constrainedCoords = isFullscreenMode ? 
      constrainPointToGameBounds(coords, frameOffset, gameWidth, gameHeight) : coords;
    
    // Check for pause button tap using the unified positioning logic
    // In fullscreen mode, we need to use the actual canvas dimensions for button positioning
    const pauseButtonBounds = getPauseButtonBounds(frameOffset, gameWidth);
    
    // Debug logging for fullscreen mode
    if (isFullscreenMode) {
      console.log('Touch Debug - Fullscreen Mode:');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      console.log('Original coords:', coords);
      console.log('Constrained coords:', constrainedCoords);
      console.log('Button bounds:', pauseButtonBounds);
      console.log('Point in bounds:', isPointInBounds(constrainedCoords, pauseButtonBounds));
    }
    if (isPointInBounds(constrainedCoords, pauseButtonBounds)) {
      if (gameStateRef.current === 'playing') {
        updateGameState('paused');
      } else if (gameStateRef.current === 'paused') {
        updateGameState('playing');
      }
      return;
    }

    // Handle pause screen interactions
    if (gameStateRef.current === 'paused') {
      // Check for exit button tap
      const exitButtonBounds = {
        x: GAME_CONFIG.UI.EXIT_BUTTON.X,
        y: GAME_CONFIG.UI.EXIT_BUTTON.Y,
        width: GAME_CONFIG.UI.EXIT_BUTTON.WIDTH,
        height: GAME_CONFIG.UI.EXIT_BUTTON.HEIGHT
      };
      
      if (isPointInBounds(constrainedCoords, exitButtonBounds)) {
        cleanupGame();
        return;
      }
      
      // Check for unpause button tap (same bounds as pause button)
      if (isPointInBounds(coords, pauseButtonBounds)) {
        updateGameState('playing');
        return;
      }
      
      // Handle double tap for fullscreen while paused
      const currentTime = Date.now();
      if (currentTime - lastTapTime.current < doubleTapDelay) {
        toggleFullscreenMode();
        return;
      }
      lastTapTime.current = currentTime;
      
      // Ignore other taps on pause screen
      return;
    }

    // Handle double tap for fullscreen
    const currentTime = Date.now();
    if (currentTime - lastTapTime.current < doubleTapDelay) {
      toggleFullscreenMode();
      return;
    }
    lastTapTime.current = currentTime;

    // Handle game start
    if (gameStateRef.current === 'start') {
      updateGameState('playing');
      return;
    }

    // Handle paddle control
    if (gameStateRef.current === 'playing') {
      touchStartY.current = constrainedCoords.y;
      isDragging.current = true;
      // inputSource.current already set at the beginning of function
    }
  }, [isFullscreenMode, toggleFullscreenMode, updateGameState, cleanupGame, getPauseButtonBounds]);

  const touchMoveHandler = useCallback((e) => {
    e.preventDefault();
    
    if (!isDragging.current || !touchStartY.current || e.touches.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const coords = transformTouchCoordinates(touch, canvas, isFullscreenMode);
    
    const deltaY = coords.y - touchStartY.current;
    const sensitivity = isMobile ? GAME_CONFIG.MOBILE.SENSITIVITY : 1;
    
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    const gameHeight = canvas.height - (frameOffset * 2);
    const paddleHeight = GAME_CONFIG.PADDLE.HEIGHT;
    
    const newY = player1YRef.current + (deltaY * sensitivity);
    player1YRef.current = constrainPaddle(newY, frameOffset, gameHeight, paddleHeight);
    
    touchStartY.current = coords.y;
  }, [isFullscreenMode, isMobile]);

  const touchEndHandler = useCallback((e) => {
    e.preventDefault();
    isDragging.current = false;
    touchStartY.current = null;
  }, []);

  const mouseDownHandler = useCallback((e) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = transformMouseCoordinates(e, canvas, isFullscreenMode);
    const mouseX = coords.x;
    const mouseY = coords.y;
    
    // In fullscreen mode, constrain coordinates to game bounds to prevent button clicks outside game area
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    const constrainedCoords = isFullscreenMode ? 
      constrainPointToGameBounds(coords, frameOffset, gameWidth, gameHeight) : coords;
    
    // Check for pause button click using the unified positioning logic
    // In fullscreen mode, we need to use the actual canvas dimensions for button positioning
    const pauseButtonBounds = getPauseButtonBounds(frameOffset, gameWidth);
    
    // Debug logging for fullscreen mode
    if (isFullscreenMode) {
      console.log('Mouse Debug - Fullscreen Mode:');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      console.log('Original coords:', coords);
      console.log('Constrained coords:', constrainedCoords);
      console.log('Button bounds:', pauseButtonBounds);
      console.log('Point in bounds:', isPointInBounds(constrainedCoords, pauseButtonBounds));
    }
    if (isPointInBounds(constrainedCoords, pauseButtonBounds)) {
      if (gameStateRef.current === 'playing') {
        updateGameState('paused');
      } else if (gameStateRef.current === 'paused') {
        updateGameState('playing');
      }
      return;
    }

    // Handle pause screen interactions
    if (gameStateRef.current === 'paused') {
      // Check for exit button click
      const exitButtonBounds = {
        x: GAME_CONFIG.UI.EXIT_BUTTON.X,
        y: GAME_CONFIG.UI.EXIT_BUTTON.Y,
        width: GAME_CONFIG.UI.EXIT_BUTTON.WIDTH,
        height: GAME_CONFIG.UI.EXIT_BUTTON.HEIGHT
      };
      
      if (isPointInBounds(constrainedCoords, exitButtonBounds)) {
        cleanupGame();
        return;
      }
      
      // Check for unpause button click (same bounds as pause button)
      if (isPointInBounds({ x: mouseX, y: mouseY }, pauseButtonBounds)) {
        updateGameState('playing');
        return;
      }
      
      // Ignore clicks elsewhere on pause screen
      return;
    }

    // Handle game start
    if (gameStateRef.current === 'start') {
      updateGameState('playing');
      return;
    }

    // Handle paddle control
    if (gameStateRef.current === 'playing') {
      mouseStartY.current = constrainedCoords.y;
      isMouseDragging.current = true;
      inputSource.current = 'mouse';
    }
  }, [isFullscreenMode, updateGameState, cleanupGame, getPauseButtonBounds]);

  const mouseMoveHandler = useCallback((e) => {
    if (!isMouseDragging.current || !mouseStartY.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    const deltaY = mouseY - mouseStartY.current;
    
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    const gameHeight = canvas.height - (frameOffset * 2);
    const paddleHeight = GAME_CONFIG.PADDLE.HEIGHT;
    
    const newY = player1YRef.current + deltaY;
    player1YRef.current = constrainPaddle(newY, frameOffset, gameHeight, paddleHeight);
    
    mouseStartY.current = mouseY;
  }, [isFullscreenMode]);

  const mouseUpHandler = useCallback((e) => {
    e.preventDefault();
    isMouseDragging.current = false;
    mouseStartY.current = null;
  }, []);

  const doubleClickHandler = useCallback((e) => {
    e.preventDefault();
    toggleFullscreenMode();
  }, [toggleFullscreenMode]);

  const pollGamepad = useCallback(() => {
    if (!gamepadConnected) return;

    const gamepads = navigator.getGamepads();
    let activeGamepad = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        activeGamepad = gamepads[i];
        gamepadIndexRef.current = i;
        break;
      }
    }

    if (!activeGamepad) return;

    const buttons = activeGamepad.buttons;
    const axes = activeGamepad.axes;

    // D-pad or left stick for paddle movement
    const upPressed = (buttons[12] && buttons[12].pressed) || (axes[1] < -0.5);
    const downPressed = (buttons[13] && buttons[13].pressed) || (axes[1] > 0.5);

    if (upPressed) {
      upPressedRef.current = true;
      inputSource.current = 'gamepad';
    } else {
      upPressedRef.current = false;
    }

    if (downPressed) {
      downPressedRef.current = true;
      inputSource.current = 'gamepad';
    } else {
      downPressedRef.current = false;
    }

    // South button (A/X) for start/pause
    const southPressed = buttons[0] && buttons[0].pressed;
    if (southPressed && !lastSouthButtonStateRef.current) {
      if (gameStateRef.current === 'start') {
        updateGameState('playing');
      } else if (gameStateRef.current === 'playing') {
        updateGameState('paused');
      } else if (gameStateRef.current === 'paused') {
        updateGameState('playing');
      }
    }
    lastSouthButtonStateRef.current = southPressed;

    // East button (B/Circle) for exit
    const eastPressed = buttons[1] && buttons[1].pressed;
    if (eastPressed && !lastEastButtonStateRef.current) {
      // Only allow east button to exit game when in paused state
      if (gameStateRef.current === 'paused') {
        cleanupGame();
      }
    }
    lastEastButtonStateRef.current = eastPressed;

    // North button (Y/Triangle) for fullscreen
    const northPressed = buttons[3] && buttons[3].pressed;
    if (northPressed && !lastNorthButtonStateRef.current) {
      toggleFullscreenMode();
    }
    lastNorthButtonStateRef.current = northPressed;
  }, [gamepadConnected, updateGameState, cleanupGame, toggleFullscreenMode]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && gameStateRef.current === 'playing') {
      updateGameState('paused');
    }
  }, [updateGameState]);

  const handleBeforeUnload = useCallback(() => {
    if (isFullscreenMode) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isFullscreenMode]);

  const handlePopState = useCallback(() => {
    if (isFullscreenMode) {
      handleBeforeUnload();
    }
  }, [isFullscreenMode, handleBeforeUnload]);

  // Game initialization effect - runs only once on mount
  useEffect(() => {
    const mobileDetected = detectMobileDevice();
    setIsMobile(mobileDetected);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const paddleHeight = GAME_CONFIG.PADDLE.HEIGHT;
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    
    // Initialize game state using refs
    ballXRef.current = frameOffset + gameWidth / 2;
    ballYRef.current = frameOffset + gameHeight / 2;
    ballSpeedXRef.current = GAME_CONFIG.BALL.INITIAL_SPEED_X;
    ballSpeedYRef.current = GAME_CONFIG.BALL.INITIAL_SPEED_Y;
    
    player1YRef.current = frameOffset + (gameHeight - paddleHeight) / 2;
    player2YRef.current = frameOffset + (gameHeight - paddleHeight) / 2;
    
    player1ScoreRef.current = 0;
    player2ScoreRef.current = 0;
    
    upPressedRef.current = false;
    downPressedRef.current = false;
    
    gamepadsRef.current = {};
    gamepadIndexRef.current = null;
  }, []); // Empty dependency array - runs only once on mount

  // Main game setup effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let gamepadPollingInterval;
    let animationFrameId;
    
    const paddleHeight = GAME_CONFIG.PADDLE.HEIGHT;
    const paddleWidth = GAME_CONFIG.PADDLE.WIDTH;
    const ballRadius = GAME_CONFIG.BALL.RADIUS;
    const frameOffset = GAME_CONFIG.FRAME.OFFSET;
    
    const gameWidth = canvas.width - (frameOffset * 2);
    const gameHeight = canvas.height - (frameOffset * 2);
    
    const computerDifficulty = GAME_CONFIG.COMPUTER.DIFFICULTY;

    const resetBall = () => {
      ballXRef.current = frameOffset + gameWidth / 2;
      ballYRef.current = frameOffset + gameHeight / 2;
      ballSpeedXRef.current = (Math.random() > 0.5 ? 1 : -1) * GAME_CONFIG.BALL.INITIAL_SPEED_X;
      ballSpeedYRef.current = (Math.random() - 0.5) * GAME_CONFIG.BALL.INITIAL_SPEED_Y;
    };

    const updateGame = () => {
      if (gameStateRef.current !== 'playing') return;
      
      // Move player paddle
      let newPlayer1Y = player1YRef.current;
      if (upPressedRef.current) {
        newPlayer1Y -= GAME_CONFIG.PADDLE.SPEED;
      } else if (downPressedRef.current) {
        newPlayer1Y += GAME_CONFIG.PADDLE.SPEED;
      }
      player1YRef.current = constrainPaddle(newPlayer1Y, frameOffset, gameHeight, paddleHeight);
      
      // Computer AI
      const computerTargetY = ballYRef.current - (paddleHeight / 2);
      if (computerTargetY < player2YRef.current) {
        player2YRef.current -= GAME_CONFIG.PADDLE.COMPUTER_SPEED * computerDifficulty;
      } else if (computerTargetY > player2YRef.current) {
        player2YRef.current += GAME_CONFIG.PADDLE.COMPUTER_SPEED * computerDifficulty;
      }
      
      // Constrain computer paddle
      player2YRef.current = constrainPaddle(player2YRef.current, frameOffset, gameHeight, paddleHeight);
      
      // Ball movement
      ballXRef.current += ballSpeedXRef.current;
      ballYRef.current += ballSpeedYRef.current;
      
      // Ball collision with top and bottom walls
      if (ballYRef.current - ballRadius < frameOffset || ballYRef.current + ballRadius > frameOffset + gameHeight) {
        ballSpeedYRef.current = -ballSpeedYRef.current;
      }
      
      // Ball collision with player paddle
      if (ballXRef.current - ballRadius < frameOffset + paddleWidth && ballYRef.current > player1YRef.current && ballYRef.current < player1YRef.current + paddleHeight) {
        ballSpeedXRef.current = -ballSpeedXRef.current;
        const deltaY = ballYRef.current - (player1YRef.current + paddleHeight / 2);
        ballSpeedYRef.current = deltaY * GAME_CONFIG.BALL.SPEED_MULTIPLIER;
        
        playPaddleHitSound();
      }
      
      // Ball collision with computer paddle
      if (ballXRef.current + ballRadius > frameOffset + gameWidth - paddleWidth && ballYRef.current > player2YRef.current && ballYRef.current < player2YRef.current + paddleHeight) {
        ballSpeedXRef.current = -ballSpeedXRef.current;
        const deltaY = ballYRef.current - (player2YRef.current + paddleHeight / 2);
        ballSpeedYRef.current = deltaY * GAME_CONFIG.BALL.SPEED_MULTIPLIER;
        
        playPaddleHitSound();
      }
      
      // Scoring
      if (ballXRef.current < frameOffset) {
        player2ScoreRef.current++;
        
        playScoreSound();
        
        resetBall();
      } else if (ballXRef.current > frameOffset + gameWidth) {
        player1ScoreRef.current++;
        
        playScoreSound();
        
        resetBall();
      }
    };

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update game logic
      updateGame();
      
      // Render based on game state
      if (gameStateRef.current === 'start') {
        drawStartScreen(ctx, canvas, inputSource.current, gamepadConnected);
      } else if (gameStateRef.current === 'paused') {
        // Draw game elements
        drawFrame(ctx, canvas);
        drawNet(ctx, frameOffset, gameWidth, gameHeight);
        drawPaddle(ctx, frameOffset, player1YRef.current, paddleWidth, paddleHeight);
        drawPaddle(ctx, frameOffset + gameWidth - paddleWidth, player2YRef.current, paddleWidth, paddleHeight);
        drawBall(ctx, ballXRef.current, ballYRef.current, ballRadius);
        drawScore(ctx, player1ScoreRef.current, player2ScoreRef.current, frameOffset, gameWidth);
        drawPauseButton(ctx, inputSource.current, gameStateRef.current, frameOffset, gameWidth);
        
        // Draw pause screen overlay
        drawPauseScreen(ctx, canvas, inputSource.current, frameOffset, gameWidth);
      } else if (gameStateRef.current === 'playing') {
        // Draw all game elements
        drawFrame(ctx, canvas);
        drawNet(ctx, frameOffset, gameWidth, gameHeight);
        drawPaddle(ctx, frameOffset, player1YRef.current, paddleWidth, paddleHeight);
        drawPaddle(ctx, frameOffset + gameWidth - paddleWidth, player2YRef.current, paddleWidth, paddleHeight);
        drawBall(ctx, ballXRef.current, ballYRef.current, ballRadius);
        drawScore(ctx, player1ScoreRef.current, player2ScoreRef.current, frameOffset, gameWidth);
        drawPauseButton(ctx, inputSource.current, gameStateRef.current, frameOffset, gameWidth);
      }
      
      // Continue the game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    checkGamepads();
    
    // Start the game loop
    gameLoop();
    
    gamepadPollingInterval = setInterval(pollGamepad, GAME_CONFIG.GAMEPAD.POLLING_INTERVAL);

    return () => {
      // Cleanup
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (gamepadPollingInterval) {
        clearInterval(gamepadPollingInterval);
      }
    };
  }, []); // Empty dependency array - no dependencies needed for event listeners

  // Separate useEffect for keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, [keyDownHandler, keyUpHandler]);

  // Separate useEffect for gamepad event listeners
  useEffect(() => {
    window.addEventListener('gamepadconnected', gamepadConnectHandler);
    window.addEventListener('gamepaddisconnected', gamepadDisconnectHandler);

    return () => {
      window.removeEventListener('gamepadconnected', gamepadConnectHandler);
      window.removeEventListener('gamepaddisconnected', gamepadDisconnectHandler);
    };
  }, [gamepadConnectHandler, gamepadDisconnectHandler]);

  // Separate useEffect for window event listeners
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleVisibilityChange, handleBeforeUnload, handlePopState]);

  // Separate useEffect for canvas event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
    canvas.addEventListener('touchend', touchEndHandler, { passive: false });
    canvas.addEventListener('mousedown', mouseDownHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('dblclick', doubleClickHandler);

    return () => {
      canvas.removeEventListener('touchstart', touchStartHandler);
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('touchend', touchEndHandler);
      canvas.removeEventListener('mousedown', mouseDownHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('dblclick', doubleClickHandler);
    };
  }, [touchStartHandler, touchMoveHandler, touchEndHandler, mouseDownHandler, mouseMoveHandler, mouseUpHandler, doubleClickHandler]);

  // Separate useEffect for fullscreen listeners to avoid game restart
  useEffect(() => {
    // Fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      // Remove fullscreen change listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return (
    <Container fluid className="d-flex flex-column align-items-center py-4">
      <div className="text-center mb-3">
        <h1 className="display-4 mb-2 text-dark">Refined React Pong</h1>
        <p className="lead mb-1 text-dark">Use the up and down arrow keys to control your paddle (left side).</p>
        <p className="small text-muted">
          Space: Start/Pause | Enter: Fullscreen | Escape: Exit
          {gamepadConnected && " | Gamepad Connected"}
        </p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS.WIDTH}
        height={GAME_CONFIG.CANVAS.HEIGHT}
        className="border border-secondary"
        style={{ 
          maxWidth: GAME_CONFIG.CANVAS.MAX_WIDTH,
          backgroundColor: '#000'
        }}
      />
      
      <div className="mt-3 text-center">
        <Link to="/games" className="btn btn-primary">
          Back to Games
        </Link>
      </div>
    </Container>
  );
};

export default Pong;