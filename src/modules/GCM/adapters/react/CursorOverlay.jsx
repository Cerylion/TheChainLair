/**
 * Gamepad Control Module (GCM) – React Cursor Overlay
 * Renders the visual cursor at the controller-provided position when owned by gamepad.
 */
import React from 'react';
import { useGamepadControl } from './useGamepadControl.js';

const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

export function CursorOverlay({ showRing = false }) {
  // Reads GCM context and displays an overlay at state.cursor when active.
  // Inputs: showRing boolean; Output: a positioned, non-interactive overlay element.
  const ctx = useGamepadControl();
  const state = ctx && ctx.state ? ctx.state : { cursor: { x: 0, y: 0 }, ownership: 'mouse', running: false };
  const { cursor, ownership, running } = state;

  if (!canUseDOM) return null;

  const visible = running && ownership === 'gamepad';

  return (
    <div
      className={`gcm-cursor ${showRing ? 'gcm-cursor--ring' : ''}`}
      role="presentation"
      aria-hidden="true"
      tabIndex={-1}
      style={{
        // Combine translation with centering offset defined in CSS baseline; use translate3d for consistency/perf
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`,
        display: visible ? 'block' : 'none',
        pointerEvents: 'none',
      }}
    />
  );
}

export default CursorOverlay;