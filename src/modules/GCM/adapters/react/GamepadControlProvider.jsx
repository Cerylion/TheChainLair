import React, { createContext, useEffect, useRef, useState, useMemo } from 'react';
import { GamepadController } from '../../core/GamepadController.js';
import { PointerDriver } from '../../drivers/PointerDriver.js';
import { FocusDriver } from '../../drivers/FocusDriver.js';

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

// Idempotent Provider style injection (opt-out via config.styleInjection === false)
const INJECT_STYLE_ID = 'gcm-css';
const GCM_CSS = `
.gcm-cursor { position: fixed; top: 0; left: 0; width: 12px; height: 12px; border-radius: 50%; background: rgba(255, 255, 255, 0.95); box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.6); pointer-events: none; z-index: 2147483647; transform: translate(-50%, -50%); }
.gcm-cursor--ring { box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.6), 0 0 0 6px rgba(255, 255, 255, 0.9); }
.gcm-hide-native-cursor, :root.gcm-hide-native-cursor { cursor: none !important; }
@media (prefers-reduced-motion: reduce) { .gcm-cursor { transition: none; } }
`;

function injectGcmStyles(config) {
  if (!canUseDOM) return;
  if (config && config.styleInjection === false) return;
  if (document.getElementById(INJECT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INJECT_STYLE_ID;
  style.type = 'text/css';
  style.appendChild(document.createTextNode(GCM_CSS));
  document.head.appendChild(style);
}

const defaultState = {
  ownership: 'mouse',
  cursor: { x: 0, y: 0 },
  connectedGamepads: [],
  config: {},
  running: false,
};

export const GamepadControlContext = createContext({
  state: defaultState,
  controller: null,
  pointer: null,
  focus: null,
  setConfig: () => {},
});

export function GamepadControlProvider({ config = {}, children }) {
  const controllerRef = useRef(null);
  const pointerRef = useRef(null);
  const focusRef = useRef(null);

  // Lazy instantiate instances once (avoids side-effects in useMemo)
  if (!controllerRef.current) {
    controllerRef.current = new GamepadController(config);
  }
  if (canUseDOM) {
    if (!pointerRef.current) {
      pointerRef.current = new PointerDriver({ showRing: !!config.showRing });
    }
    if (!focusRef.current) {
      focusRef.current = new FocusDriver({ root: document });
    }
  }

  const controller = controllerRef.current;
  const pointer = pointerRef.current;
  const focus = focusRef.current;

  const [state, setState] = useState(controller ? controller.getState() : defaultState);

  // Mount overlay and start controller based on config
  useEffect(() => {
    if (!canUseDOM) return undefined;
    if (!pointer || !controller) return undefined;
    injectGcmStyles(config);
    if (config.mountPointer !== false) {
      try { pointer.mount(); } catch (_) {}
    }
    if (config.autoStart !== false) {
      try { controller.start(); } catch (_) {}
    }
    return () => {
      try { pointer.unmount(); } catch (_) {}
      try { controller.stop(); } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync basic state from controller events and update pointer position
  useEffect(() => {
    if (!controller) return;
    const update = () => setState(controller.getState());
    const onOwnershipChange = (payload) => {
      update();
      if (pointer && payload && payload.cursor) {
        try { pointer.setPosition(payload.cursor.x, payload.cursor.y); } catch (_) {}
      }
    };
    const onCursorChange = (payload) => {
      update();
      if (pointer && payload && payload.cursor) {
        try { pointer.setPosition(payload.cursor.x, payload.cursor.y); } catch (_) {}
      }
    };
    controller.on('connected', update);
    controller.on('configChange', update);
    controller.on('ownershipChange', onOwnershipChange);
    controller.on('cursorChange', onCursorChange);
    // Map gamepad button events to pointer actions (primary click)
    const onButton = (payload) => {
      if (!payload || !pointer) return;
      const st = controller.getState();
      if (st.ownership !== 'gamepad' || st.config.pointerEnabled === false) return;
      if (payload.name === 'south') {
        const mode = (st.config && st.config.clickMode) || 'tap';
        if (mode === 'hold') {
          if (payload.pressed) {
            try { pointer.mousedown(); } catch (_) {}
          } else {
            try { pointer.mouseup(); } catch (_) {}
          }
        } else {
          // tap: emit click on release
          if (!payload.pressed) {
            try { pointer.click(); } catch (_) {}
          }
        }
      }
    };
    controller.on('buttonChange', onButton);
    // Future: ownership/cursor events
    return () => {
      controller.off('connected', update);
      controller.off('configChange', update);
      controller.off('ownershipChange', onOwnershipChange);
      controller.off('cursorChange', onCursorChange);
      controller.off('buttonChange', onButton);
    };
  }, [controller]);

  const value = useMemo(() => ({
    state,
    controller,
    pointer,
    focus,
    setConfig: (partial) => controller && controller.setConfig(partial),
  }), [state, controller, pointer, focus]);

  return (
    <GamepadControlContext.Provider value={value}>
      {children || null}
    </GamepadControlContext.Provider>
  );
}

export default GamepadControlProvider;