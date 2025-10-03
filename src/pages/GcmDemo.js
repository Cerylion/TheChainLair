import React from 'react';
import { GamepadControlProvider, CursorOverlay, useGamepadControl } from '../modules/GCM/index.js';

function StatusPanel() {
  const ctx = useGamepadControl();
  if (!ctx) return null;
  const { state } = ctx;
  const ownership = state?.ownership ?? 'mouse';
  const running = !!state?.running;
  const cursor = state?.cursor ?? { x: 0, y: 0 };
  const connectedCount = (state?.connectedGamepads ?? []).length;
  return (
    <div data-testid="gcm-status" style={{ marginTop: 12, fontSize: '12px', color: '#555' }}>
      <div>Running: {String(running)}</div>
      <div>Ownership: {ownership}</div>
      <div>Cursor: {cursor.x}, {cursor.y}</div>
      <div>Gamepads: {connectedCount}</div>
    </div>
  );
}

function Controls() {
  const ctx = useGamepadControl();
  if (!ctx) return null;
  const { controller } = ctx;
  const st = controller ? controller.getState() : { ownership: 'mouse' };
  return (
    <div style={{ marginTop: '16px' }}>
      <button onClick={() => ctx.setScrollMode(true)} style={{ marginRight: 8 }}>Scroll On</button>
      <button onClick={() => ctx.setScrollMode(false)}>Scroll Off</button>
      <div data-testid="scroll-mode-indicator" style={{ marginTop: 8, fontSize: '12px', color: '#555' }}>{String(ctx.scrollMode)}</div>
    </div>
  );
}

export default function GcmDemo() {
  return (
    <div style={{ padding: 20 }}>
      <h2>GCM Demo</h2>
      <p>Use the buttons to toggle Scroll Mode and observe the cursor ring.</p>
      <GamepadControlProvider config={{ mountPointer: true, autoStart: true }}>
        <CursorOverlay />
        <StatusPanel />
        <Controls />
        <div style={{ marginTop: 20 }}>
          <a href="#" style={{ marginRight: 12 }}>Focusable Link A</a>
          <button style={{ marginRight: 12 }}>Focusable Button B</button>
          <input placeholder="Focusable Input C" />
        </div>
      </GamepadControlProvider>
    </div>
  );
}