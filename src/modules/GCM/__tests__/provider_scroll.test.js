import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { GamepadControlProvider } from '../adapters/react/GamepadControlProvider.jsx';
import { useGamepadControl } from '../adapters/react/useGamepadControl.js';

function setGetGamepads(fn) {
  Object.defineProperty(global.navigator, 'getGamepads', {
    configurable: true,
    writable: true,
    value: fn,
  });
}

function Harness({ onReady }) {
  const ctx = useGamepadControl();
  useEffect(() => {
    if (!ctx) return;
    onReady && onReady(ctx);
  }, [ctx, onReady]);
  return null;
}

describe('GamepadControlProvider – scroll mode toggling', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    if (!global.navigator) {
      // eslint-disable-next-line no-global-assign
      global.navigator = {};
    }
    // Ensure Gamepad API exists so Provider enables and mounts pointer
    setGetGamepads(() => []);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    setGetGamepads(undefined);
  });

  test('setScrollMode toggles pointer ring and disables pointerEnabled', () => {
    let ctxRef = null;
    act(() => {
      const root = createRoot(container);
      root.render(
        <GamepadControlProvider>
          <Harness onReady={(ctx) => { ctxRef = ctx; }} />
        </GamepadControlProvider>
      );
    });

    // Initially, ring should be off
    const cursorEl = document.querySelector('.gcm-cursor');
    expect(cursorEl).toBeTruthy();
    expect(cursorEl.classList.contains('gcm-cursor--ring')).toBe(false);

    // Toggle scroll mode on
    act(() => {
      ctxRef.setScrollMode(true);
    });

    // Ring should be on and controller pointerEnabled false
    const cursorElAfter = document.querySelector('.gcm-cursor');
    expect(cursorElAfter.classList.contains('gcm-cursor--ring')).toBe(true);
    const st = ctxRef.controller.getState();
    expect(st.config.pointerEnabled).toBe(false);

    // Toggle scroll mode off
    act(() => {
      ctxRef.setScrollMode(false);
    });

    const cursorElOff = document.querySelector('.gcm-cursor');
    expect(cursorElOff.classList.contains('gcm-cursor--ring')).toBe(false);
    const stOff = ctxRef.controller.getState();
    expect(stOff.config.pointerEnabled).toBe(true);
  });
});