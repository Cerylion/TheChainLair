/**
 * Gamepad Control Module (GCM) – React Provider
 * Supplies GCM context, mounts the virtual cursor, and coordinates controller/drivers.
 */
import React, { createContext, useEffect, useRef, useState, useMemo } from 'react';
import { GamepadController } from '../../core/GamepadController.js';
import { PointerDriver } from '../../drivers/PointerDriver.js';
import { FocusDriver } from '../../drivers/FocusDriver.js';
import { ScrollDriver } from '../../drivers/ScrollDriver.js';

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

// Scroll Speed Control: tweak SCROLL_SPEED_MULTIPLIER to adjust global scroll intensity.
// You can modify this constant to fine-tune gamepad scroll behavior. - currently works wonkily - go see readme
const SCROLL_SPEED_MULTIPLIER = 20;
// Minimum per-frame scroll delta to avoid sluggish feel.
// If the computed delta is non-zero but under this threshold, we clamp to it.
const SCROLL_MIN_DELTA = 8;

function injectGcmStyles(config) {
  // Injects minimal GCM CSS once into <head> unless disabled via config.
  // Inputs: config object; Output: none (side-effect style tag insertion).
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
  enabled: true,
};

export const GamepadControlContext = createContext({
  state: defaultState,
  controller: null,
  pointer: null,
  focus: null,
  setConfig: () => {},
});

export function GamepadControlProvider({ config = {}, children }) {
  // React context provider wiring controller, pointer, focus, and scroll drivers.
  // Inputs: config object and children; Output: renders children within context.
  const controllerRef = useRef(null);
  const pointerRef = useRef(null);
  const focusRef = useRef(null);
  const scrollRef = useRef(null);

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
    if (!scrollRef.current) {
      scrollRef.current = new ScrollDriver({ root: document, preferGlobal: true });
    }
  }

  const controller = controllerRef.current;
  const pointer = pointerRef.current;
  const focus = focusRef.current;
  const scroll = scrollRef.current;

  const [state, setState] = useState(controller ? controller.getState() : defaultState);
  const [scrollMode, setScrollMode] = useState(false);

  // Mount overlay and start controller based on config
  useEffect(() => {
    if (!canUseDOM) return undefined;
    if (!pointer || !controller) return undefined;
    const st0 = controller.getState();
    injectGcmStyles(config);
    // Mount overlay and start only when controller is enabled
    if (st0.enabled !== false) {
      if (config.mountPointer !== false) {
        try { pointer.mount(); } catch (_) {}
      }
      if (config.autoStart !== false) {
        try { controller.start(); } catch (_) {}
      }
    }
    return () => {
      try { pointer.unmount(); } catch (_) {}
      try { controller.stop(); } catch (_) {}
      // Safety: ensure native cursor visibility restored even if stop/unmount fails
      try {
        if (canUseDOM && document && document.documentElement) {
          document.documentElement.classList.remove('gcm-hide-native-cursor');
        }
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync basic state from controller events and update pointer position
  useEffect(() => {
    if (!controller) return;
    const update = () => setState(controller.getState());
    const onEnabledChange = () => setState(controller.getState());
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
    controller.on('enabledChange', onEnabledChange);
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
      } else if (payload.name === 'east') {
        const mode = (st.config && st.config.clickMode) || 'tap';
        if (mode === 'hold') {
          if (payload.pressed) {
            try { pointer.mousedownRight(); } catch (_) {}
          } else {
            try { pointer.mouseupRight(); } catch (_) {}
            // Optionally emit contextmenu on release to support sites relying on it
            try { pointer.contextmenu(); } catch (_) {}
          }
        } else {
          // tap: emit contextmenu on release
          if (!payload.pressed) {
            try { pointer.contextmenu(); } catch (_) {}
          }
        }
      }
    };
    controller.on('buttonChange', onButton);
    // Future: ownership/cursor events
    return () => {
      controller.off('connected', update);
      controller.off('configChange', update);
      controller.off('enabledChange', onEnabledChange);
      controller.off('ownershipChange', onOwnershipChange);
      controller.off('cursorChange', onCursorChange);
      controller.off('buttonChange', onButton);
    };
  }, [controller]);

  // Poll gamepad to support scroll-mode toggle via North/Y and axis-driven scrolling
  useEffect(() => {
    if (!canUseDOM || !controller || !pointer || !scroll) return undefined;
    // Skip scroll loop entirely when controller is disabled
    if (controller && controller.getState().enabled === false) return undefined;
    let rafId = null;
    // Track last frame time to normalize scroll speed across frame-rate changes
    let lastTs = 0;
    let prevNorthPressed = false;
    // Scroll speed controller function: reads stick input and applies - something here or near here is not working as intended - see readme
    // SCROLL_SPEED_MULTIPLIER to the computed delta before scrolling.
    // Also enforces SCROLL_MIN_DELTA so small inputs don't feel sluggish.
    const loop = () => {
      try {
        const pads = (typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()) || [];
        const list = Array.from(pads).filter(Boolean);
        const st = controller.getState();
        let gp = null;
        if (list.length > 0) {
          const pref = st.config && st.config.devicePreference;
          if (typeof pref === 'number') {
            gp = list.find((g) => g.index === pref) || list[0];
          } else if (pref === 'first') {
            gp = list[0];
          } else {
            gp = list[list.length - 1];
          }
        }
        if (gp) {
          // Normalize by time so holding the stick yields consistent speed,
          // avoiding bursts on release when a large dt occurs.
          const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
          const dtSeconds = lastTs ? (now - lastTs) / 1000 : (1 / 60);
          lastTs = now;
          // Bound dt to avoid extreme spikes from tab switches or scheduler hiccups
          const dtScale = Math.max(0.5, Math.min(2.0, dtSeconds * 60));
          const axes = gp.axes || [];
          const btns = gp.buttons || [];
          const axesCfg = (st.config && st.config.axes) || {};
          const leftYIdx = typeof axesCfg.leftY === 'number' ? axesCfg.leftY : 1;
          const rawY = axes[leftYIdx] || 0;
          const dz = typeof (st.config && st.config.deadzone) === 'number' ? st.config.deadzone : 0.15;
          const norm = (v) => (Math.abs(v) < dz ? 0 : v);
          const scrollSens = typeof (st.config && st.config.scrollSensitivity) === 'number' ? st.config.scrollSensitivity : 30;
          // Apply scrolling only when in scroll mode and gamepad owns input
          if (scrollMode && st.ownership === 'gamepad') {
            // Time-normalized scroll delta (approximately per-frame at 60fps)
            let dy = norm(rawY) * scrollSens * SCROLL_SPEED_MULTIPLIER * dtScale;
            // Clamp small non-zero deltas to a minimum for consistent feel across the page
            if (dy !== 0) {
              const sign = dy > 0 ? 1 : -1;
              const minDelta = SCROLL_MIN_DELTA * dtScale; // Scale minimum with frame time
              if (Math.abs(dy) < minDelta) dy = sign * minDelta; // Minimum per-frame scroll delta
            }
            if (dy !== 0) {
              const pos = pointer.getPosition();
              scroll.scrollByAtPoint(dy, pos.x, pos.y);
            }
          }
          // Toggle scroll mode on North/Y release
          const buttonsCfg = (st.config && st.config.buttons) || {};
          const northIdx = typeof buttonsCfg.north === 'number' ? buttonsCfg.north : 3;
          const northPressed = !!(btns[northIdx] && btns[northIdx].pressed);
          if (northPressed !== prevNorthPressed) {
            // On release -> toggle
            if (prevNorthPressed && !northPressed) {
              setScrollMode((prev) => {
                const next = !prev;
                try { controller.setConfig({ pointerEnabled: !next }); } catch (_) {}
                try { pointer.setRing(!!next); } catch (_) {}
                return next;
              });
            }
            prevNorthPressed = northPressed;
          }
        }
      } catch (_) {}
      rafId = window.requestAnimationFrame(loop);
    };
    rafId = window.requestAnimationFrame(loop);
    return () => { if (rafId) try { window.cancelAnimationFrame(rafId); } catch (_) {} };
  }, [controller, pointer, scroll, scrollMode]);

  const value = useMemo(() => ({
    state,
    controller,
    pointer,
    focus,
    scroll,
    setConfig: (partial) => controller && controller.setConfig(partial),
    scrollMode,
    setScrollMode: (next) => {
      const val = typeof next === 'boolean' ? next : !scrollMode;
      setScrollMode(val);
      try { controller.setConfig({ pointerEnabled: !val }); } catch (_) {}
      try { pointer && pointer.setRing(!!val); } catch (_) {}
    },
  }), [state, controller, pointer, focus]);

  return (
    <GamepadControlContext.Provider value={value}>
      {children || null}
    </GamepadControlContext.Provider>
  );
}

export default GamepadControlProvider;