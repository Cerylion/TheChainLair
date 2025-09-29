import { useRef, useEffect } from 'react';
import PADDLE_HIT_SOUND from '../assets/sounds/bip.mp3';
import SCORE_SOUND from '../assets/sounds/score.mp3';

/**
 * Custom hook for managing audio in the Pong game
 * Handles audio initialization, playback, and cleanup
 */
const useAudioManager = () => {
  const paddleHitSound = useRef(null);
  const scoreSound = useRef(null);

  // Initialize audio on mount
  useEffect(() => {
    paddleHitSound.current = new Audio(PADDLE_HIT_SOUND);
    scoreSound.current = new Audio(SCORE_SOUND);

    // Preload audio files for better performance
    paddleHitSound.current.preload = 'auto';
    scoreSound.current.preload = 'auto';

    // Set volume levels (optional)
    paddleHitSound.current.volume = 0.7;
    scoreSound.current.volume = 0.8;

    // Cleanup function
    return () => {
      if (paddleHitSound.current) {
        paddleHitSound.current.pause();
        paddleHitSound.current = null;
      }
      if (scoreSound.current) {
        scoreSound.current.pause();
        scoreSound.current = null;
      }
    };
  }, []);

  /**
   * Play a sound with error handling
   * @param {React.RefObject} soundRef - Reference to the audio element
   */
  const playSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
        console.warn('Audio play failed:', error);
      });
    }
  };

  /**
   * Stop a sound and reset its position
   * @param {React.RefObject} soundRef - Reference to the audio element
   */
  const stopSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
    }
  };

  /**
   * Stop all sounds
   */
  const stopAllSounds = () => {
    stopSound(paddleHitSound);
    stopSound(scoreSound);
  };

  /**
   * Play paddle hit sound
   */
  const playPaddleHitSound = () => {
    playSound(paddleHitSound);
  };

  /**
   * Play score sound
   */
  const playScoreSound = () => {
    playSound(scoreSound);
  };

  return {
    // Sound refs for direct access if needed
    paddleHitSound,
    scoreSound,
    
    // Utility functions
    playSound,
    stopSound,
    stopAllSounds,
    
    // Specific sound functions
    playPaddleHitSound,
    playScoreSound
  };
};

export default useAudioManager;