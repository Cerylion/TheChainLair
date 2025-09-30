/**
 * GameRenderer - Utility module containing all drawing functions for the Pong game
 * Extracted from PongV2.js to improve code organization and maintainability
 */

import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Utility function for drawing text with customizable properties
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string|number} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} fontSize - Font size in pixels
 * @param {string} color - Text color (default: '#FFFFFF')
 * @param {string} align - Text alignment (default: 'center')
 */
export const drawText = (ctx, text, x, y, fontSize, color = '#FFFFFF', align = 'center') => {
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
};

/**
 * Draws the game ball as a circle
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} ballX - Ball X position
 * @param {number} ballY - Ball Y position
 * @param {number} ballRadius - Ball radius
 */
export const drawBall = (ctx, ballX, ballY, ballRadius) => {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
  ctx.fill();
  ctx.closePath();
};

/**
 * Draws a paddle rectangle at specified coordinates
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} x - Paddle X position
 * @param {number} y - Paddle Y position
 * @param {number} paddleWidth - Paddle width
 * @param {number} paddleHeight - Paddle height
 */
export const drawPaddle = (ctx, x, y, paddleWidth, paddleHeight) => {
  ctx.beginPath();
  ctx.rect(x, y, paddleWidth, paddleHeight);
  ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
  ctx.fill();
  ctx.closePath();
};

/**
 * Draws both player scores on the screen
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} player1Score - Player 1 score
 * @param {number} player2Score - Player 2 score
 * @param {number} frameOffset - Frame offset for positioning
 * @param {number} gameWidth - Game area width
 */
export const drawScore = (ctx, player1Score, player2Score, frameOffset, gameWidth) => {
  drawText(ctx, player1Score, frameOffset + gameWidth / 4, GAME_CONFIG.UI.SCORE.Y_POSITION, GAME_CONFIG.UI.SCORE.FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
  drawText(ctx, player2Score, frameOffset + (3 * gameWidth) / 4, GAME_CONFIG.UI.SCORE.Y_POSITION, GAME_CONFIG.UI.SCORE.FONT_SIZE, GAME_CONFIG.COLORS.FOREGROUND);
};

/**
 * Helper function to calculate pause button position
 * @param {number} frameOffset - Frame offset
 * @param {number} gameWidth - Game area width
 * @returns {Object} Button bounds object with x, y, size, width, height
 */
export const getPauseButtonBounds = (frameOffset, gameWidth) => {
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

/**
 * Draws the pause button with rounded rectangle background and pause symbol
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} inputSource - Current input source ('touch', 'mouse', etc.)
 * @param {string} gameState - Current game state
 * @param {number} frameOffset - Frame offset
 * @param {number} gameWidth - Game area width
 */
export const drawPauseButton = (ctx, inputSource, gameState, frameOffset, gameWidth) => {
  if ((inputSource !== 'touch' && inputSource !== 'mouse') || gameState !== 'playing') return;
  
  const buttonBounds = getPauseButtonBounds(frameOffset, gameWidth);
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

/**
 * Draws the game frame with multiple border layers
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
export const drawFrame = (ctx, canvas) => {
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

/**
 * Draws the center line/net with dashed pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} frameOffset - Frame offset
 * @param {number} gameWidth - Game area width
 * @param {number} gameHeight - Game area height
 */
export const drawNet = (ctx, frameOffset, gameWidth, gameHeight) => {
  for (let i = frameOffset; i < frameOffset + gameHeight; i += GAME_CONFIG.GAME.CENTER_LINE.DASH_SPACING) {
    ctx.beginPath();
    ctx.rect(frameOffset + gameWidth / 2 - GAME_CONFIG.GAME.CENTER_LINE.WIDTH / 2, i, GAME_CONFIG.GAME.CENTER_LINE.WIDTH, GAME_CONFIG.GAME.CENTER_LINE.DASH_LENGTH);
    ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
    ctx.fill();
    ctx.closePath();
  }
};

/**
 * Draws the start screen with title and instructions
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} inputSource - Current input source
 * @param {boolean} gamepadConnected - Whether gamepad is connected
 */
export const drawStartScreen = (ctx, canvas, inputSource, gamepadConnected) => {
  ctx.fillStyle = GAME_CONFIG.COLORS.START_SCREEN.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawText(ctx, 'React Pong', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.TITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.TITLE_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
  
  if (inputSource === 'touch') {
    drawText(ctx, 'Tap to Start', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    
    drawText(ctx, 'Drag to move paddle • Tap to pause', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    drawText(ctx, 'Double-tap to enter/exit fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 2, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    
  } else {
    drawText(ctx, 'Press SPACE or UP/DOWN to Start', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    
    if (gamepadConnected) {
      drawText(ctx, 'or Press A Button on Gamepad', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING, GAME_CONFIG.UI.START_SCREEN.SUBTITLE_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    }
    
    const yOffset = gamepadConnected ? GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 2 : GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING;
    drawText(ctx, 'Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + yOffset, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    
    if (gamepadConnected) {
      drawText(ctx, 'or Press Y Button for fullscreen', canvas.width / 2, canvas.height / GAME_CONFIG.UI.START_SCREEN.SUBTITLE_Y_OFFSET + GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_LINE_SPACING * 3, GAME_CONFIG.UI.START_SCREEN.INSTRUCTION_FONT_SIZE, GAME_CONFIG.COLORS.START_SCREEN.TEXT);
    }
  }
};

/**
 * Draws the pause screen overlay with instructions and exit button
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} inputSource - Current input source
 * @param {number} frameOffset - Frame offset for positioning
 * @param {number} gameWidth - Game area width
 */
export const drawPauseScreen = (ctx, canvas, inputSource, frameOffset, gameWidth) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawText(ctx, 'PAUSED', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.TITLE_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.TITLE_FONT_SIZE, '#FFFFFF');
  
  if (inputSource === 'gamepad') {
    drawText(ctx, 'Press A Button to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
    
    drawText(ctx, 'Press Y Button to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
    
  } else if (inputSource === 'touch' || inputSource === 'mouse') {
    drawText(ctx, 'Click to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
    
    drawText(ctx, 'Double-click to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
    
  } else {
    drawText(ctx, 'Press SPACE to Resume', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.RESUME_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
    
    drawText(ctx, 'Press ENTER to enter/exit fullscreen', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.FULLSCREEN_Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.INSTRUCTION_FONT_SIZE, '#FFFFFF');
  }
  
  if (inputSource === 'touch' || inputSource === 'mouse') {
    drawText(ctx, 'Click Exit Button to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
    
  } else if (inputSource === 'gamepad') {
    drawText(ctx, 'Press B Button to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
    
  } else {
    drawText(ctx, 'Press ESC to Exit', canvas.width / 2, canvas.height / 2 + GAME_CONFIG.UI.PAUSE_SCREEN.Y_OFFSET, GAME_CONFIG.UI.PAUSE_SCREEN.FONT_SIZE, '#FFFFFF');
  }
  
  // Mobile/Mouse exit button
  if (inputSource === 'touch' || inputSource === 'mouse') {
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
    
    // Draw unpause button (play icon) in the same location as the pause button
    drawUnpauseButton(ctx, inputSource, frameOffset, gameWidth);
  }
};

/**
 * Draws the unpause button with a play icon (triangle)
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {string} inputSource - Current input source
 * @param {number} frameOffset - Frame offset for positioning
 * @param {number} gameWidth - Game area width
 */
export const drawUnpauseButton = (ctx, inputSource, frameOffset, gameWidth) => {
  if (inputSource !== 'touch' && inputSource !== 'mouse') return;
  
  const buttonBounds = getPauseButtonBounds(frameOffset, gameWidth);
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
  
  // Play symbol (triangle pointing right)
  ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
  
  // Calculate triangle dimensions and position
  const triangleSize = GAME_CONFIG.UI.PAUSE_BARS.HEIGHT * 0.8; // Slightly smaller than pause bars
  const centerX = buttonBounds.x + buttonBounds.width / 2;
  const centerY = buttonBounds.y + buttonBounds.height / 2;
  
  // Draw triangle (play icon)
  ctx.beginPath();
  ctx.moveTo(centerX - triangleSize / 3, centerY - triangleSize / 2); // Left point
  ctx.lineTo(centerX + triangleSize / 2, centerY); // Right point (tip)
  ctx.lineTo(centerX - triangleSize / 3, centerY + triangleSize / 2); // Bottom left
  ctx.closePath();
  ctx.fill();
};