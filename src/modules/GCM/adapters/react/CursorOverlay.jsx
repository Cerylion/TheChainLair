import React from 'react';
import { useGamepadControl } from './useGamepadControl.js';

const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

export function CursorOverlay({ showRing = false }) {
  const ctx = useGamepadControl();
  const state = ctx && ctx.state ? ctx.state : { cursor: { x: 0, y: 0 }, ownership: 'mouse', running: false };
  const { cursor, ownership, running } = state;

  if (!canUseDOM) return null;

  const visible = running && ownership === 'gamepad';

  return (
    <div
      className={`gcm-cursor ${showRing ? 'gcm-cursor--ring' : ''}`}
      style={{
        // Combine translation with centering offset defined in CSS baseline
        transform: `translate(${cursor.x}px, ${cursor.y}px) translate(-50%, -50%)`,
        display: visible ? 'block' : 'none',
      }}
    />
  );
}

export default CursorOverlay;