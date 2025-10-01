import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useAudioManager from './hooks/useAudioManager';
import { useActionSystem } from './hooks/useActionSystem';
import useInputMapper from './hooks/useInputMapper';
import { GAME_CONFIG } from './config/gameConfig';
import { createActionHandlerRegistry, registerAllHandlers } from './utils/actionHandlerRegistry';
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
  
  // Always use simple scaling approach - this works for both normal and fullscreen
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  
  mouseX = mouseX / scaleX;
  mouseY = mouseY / scaleY;
  
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

  // Game state refs - moved before gameRefs to fix initialization order
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

  const { playPaddleHitSound, playScoreSound, stopAllSounds } = useAudioManager();

  // Initialize action system and input mapper
  const gameRefs = {
    gameState: gameStateRef,
    upPressed: upPressedRef,
    downPressed: downPressedRef,
    isDragging,
    touchStartY,
    isMouseDragging,
    mouseStartY,
    player1Y: player1YRef,
    canvas: canvasRef,
    isFullscreenMode: { current: isFullscreenMode },
    inputSource
  };

  const actionSystem = useActionSystem({ 
    gameState: gameStateRef.current,
    enableHistory: false 
  });
  const { dispatch, registerHandler } = actionSystem;
  const { mapKeyboardInput, mapTouchInput, mapMouseInput, mapGamepadInput } = useInputMapper(dispatch);

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
    // This is now handled by toggleFullscreenMode directly
    // No need to listen for native fullscreen events
  }, []);

  const toggleFullscreenMode = useCallback(() => {
    setIsFullscreenMode(prev => {
      const newFullscreenState = !prev;
      const canvas = canvasRef.current;
      
      if (!canvas) return prev;
      
      if (newFullscreenState) {
        // Enter custom fullscreen mode
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate scale to fit canvas while maintaining aspect ratio
        const scaleX = viewportWidth / canvas.width;
        const scaleY = viewportHeight / canvas.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply custom fullscreen styling
        canvas.style.position = 'fixed';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
        canvas.style.zIndex = '9999';
        canvas.style.maxWidth = 'none';
        canvas.style.backgroundColor = '#000';
        
        // Hide page content and prevent scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('pong-fullscreen');
        
        // Create style to hide other elements
         const fullscreenStyle = document.createElement('style');
         fullscreenStyle.id = 'pong-fullscreen-style';
         fullscreenStyle.textContent = `
           body.pong-fullscreen {
             background-color: #808080 !important;
           }
           body.pong-fullscreen > *:not(canvas) {
             visibility: hidden !important;
           }
           body.pong-fullscreen canvas {
             visibility: visible !important;
           }
         `;
         document.head.appendChild(fullscreenStyle);
        
      } else {
        // Exit custom fullscreen mode
        canvas.style.position = '';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.transform = '';
        canvas.style.zIndex = '';
        canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
        canvas.style.backgroundColor = '#000';
        
        // Restore page content and scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('pong-fullscreen');
        
        // Remove fullscreen style
        const fullscreenStyle = document.getElementById('pong-fullscreen-style');
        if (fullscreenStyle) {
          fullscreenStyle.remove();
        }
      }
      
      return newFullscreenState;
    });
  }, []);

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



  // Remove the duplicate getPauseButtonBounds function and use the one from GameRenderer
  // This ensures the clickable area matches exactly with the visual button position

  const touchStartHandler = useCallback((e) => {
    mapTouchInput(e, 'touchstart');
  }, [mapTouchInput]);

  const touchMoveHandler = useCallback((e) => {
    mapTouchInput(e, 'touchmove');
  }, [mapTouchInput]);

  const touchEndHandler = useCallback((e) => {
    mapTouchInput(e, 'touchend');
  }, [mapTouchInput]);

  const mouseDownHandler = useCallback((e) => {
    mapMouseInput(e, 'mousedown');
  }, [mapMouseInput]);

  const mouseMoveHandler = useCallback((e) => {
    mapMouseInput(e, 'mousemove');
  }, [mapMouseInput]);

  const mouseUpHandler = useCallback((e) => {
    mapMouseInput(e, 'mouseup');
  }, [mapMouseInput]);

  const doubleClickHandler = useCallback((e) => {
    mapMouseInput(e, 'dblclick');
  }, [mapMouseInput]);

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

    // Use the input mapper for gamepad input
    mapGamepadInput(activeGamepad);
  }, [gamepadConnected, mapGamepadInput]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && gameStateRef.current === 'playing') {
      updateGameState('paused');
    }
  }, [updateGameState]);

  const handleBeforeUnload = useCallback(() => {
    if (isFullscreenMode) {
      // Clean up fullscreen styles
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.position = '';
        canvas.style.top = '';
        canvas.style.left = '';
        canvas.style.transform = '';
        canvas.style.zIndex = '';
        canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
        canvas.style.backgroundColor = '#000';
      }
      
      // Restore page content and scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('pong-fullscreen');
      
      // Remove fullscreen style
      const fullscreenStyle = document.getElementById('pong-fullscreen-style');
      if (fullscreenStyle) {
        fullscreenStyle.remove();
      }
    }
  }, [isFullscreenMode]);

  const handlePopState = useCallback(() => {
    if (isFullscreenMode) {
      // Properly exit fullscreen mode when navigating back
      setIsFullscreenMode(false);
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
    // No longer need fullscreen change listeners since we're using custom fullscreen
    return () => {
      // Component unmount cleanup - ensure fullscreen is properly cleaned up
      if (isFullscreenMode) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.position = '';
          canvas.style.top = '';
          canvas.style.left = '';
          canvas.style.transform = '';
          canvas.style.zIndex = '';
          canvas.style.maxWidth = GAME_CONFIG.CANVAS.MAX_WIDTH;
          canvas.style.backgroundColor = '#000';
        }
        
        // Restore page content and scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('pong-fullscreen');
        
        // Remove fullscreen style
        const fullscreenStyle = document.getElementById('pong-fullscreen-style');
        if (fullscreenStyle) {
          fullscreenStyle.remove();
        }
      }
    };
  }, [isFullscreenMode]);

  // Register action handlers
  useEffect(() => {
    // Create the complete gameRefs object with all required properties
    const completeGameRefs = {
      gameStateRef,
      upPressedRef,
      downPressedRef,
      isDragging,
      touchStartY,
      isMouseDragging,
      mouseStartY,
      player1YRef,
      canvasRef,
      isFullscreenMode,
      setIsFullscreenMode,
      inputSource
    };

    // Create gameFunctions object with all required functions
    const gameFunctions = {
      updateGameState,
      cleanupGame,
      toggleFullscreenMode,
      constrainPaddle,
      transformTouchCoordinates,
      transformMouseCoordinates
    };

    // Create and register all action handlers
    const handlerRegistry = createActionHandlerRegistry(completeGameRefs, GAME_CONFIG, gameFunctions);
    const cleanup = registerAllHandlers(actionSystem, handlerRegistry);

    return cleanup;
  }, [actionSystem, updateGameState, cleanupGame, toggleFullscreenMode]);

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