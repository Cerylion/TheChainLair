/**
 * Game Configuration - Central configuration for the Pong game
 * Contains all game constants, UI settings, and styling options
 */

export const GAME_CONFIG = {
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
    FRAME_SHADOW: 'rgba(255, 255, 255, 0.1)',
    START_SCREEN: {
      BACKGROUND: '#000000',
      TEXT: '#FFFFFF'
    }
  }
};