/**
 * Gamepad Control Module (GCM) – Synthetic Event Dispatch Utilities
 * Safe helpers to dispatch mouse events to the element under a viewport point.
 */

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

// Light throttling for high-frequency synthetic mousemove events (~60Hz)
const MOVE_THROTTLE_MS = 16; // default throttle interval
let lastMouseMoveTs = 0;

export function elementFromViewportPoint(x, y) {
  if (!canUseDOM) return null;
  try {
    return document.elementFromPoint(x, y);
  } catch (_) {
    return null;
  }
}

export function dispatchMouseEvent(type, x, y, options = {}) {
  if (!canUseDOM) return null;
  // Throttle synthetic mousemove to avoid event floods
  if (type === 'mousemove') {
    const now = Date.now();
    const throttleMs = typeof options.throttleMs === 'number' ? Math.max(0, options.throttleMs) : MOVE_THROTTLE_MS;
    if (now - lastMouseMoveTs < throttleMs) {
      return null;
    }
    lastMouseMoveTs = now;
  }
  const target = elementFromViewportPoint(x, y);
  if (!target) return null;
  const eventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    ...options,
  };
  try {
    const evt = new MouseEvent(type, eventInit);
    target.dispatchEvent(evt);
    return { target, event: evt };
  } catch (_) {
    return null;
  }
}

const eventDispatch = {
  elementFromViewportPoint,
  dispatchMouseEvent,
};

export default eventDispatch;