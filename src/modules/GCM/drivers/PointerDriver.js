/**
 * Gamepad Control Module (GCM) – Pointer Driver (Scaffold)
 * Manages a high z-index virtual cursor overlay and OS cursor visibility.
 * This scaffold provides mount/unmount and position updates; event dispatch
 * and integration with controller will be added in later steps.
 */

import { dispatchMouseEvent } from '../utils/eventDispatch.js';

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

export class PointerDriver {
  constructor(options = {}) {
    this.container = canUseDOM ? (options.container || document.body) : null;
    this.showRing = !!options.showRing;
    this.smoothing = Math.max(0, Math.min(1, options.smoothing ?? 0)); // 0-1 lerp
    this.cursorEl = null;
    this.position = { x: 0, y: 0 };
    this._mounted = false;
    this._pendingPos = null;
    this._rafId = null;
  }

  mount() {
    if (!canUseDOM || this._mounted || !this.container) return;
    const el = document.createElement('div');
    el.className = `gcm-cursor${this.showRing ? ' gcm-cursor--ring' : ''}`;
    el.setAttribute('aria-hidden', 'true');
    // Use transform-based positioning for smoother movement
    el.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) translate(-50%, -50%)`;
    this.container.appendChild(el);
    this.cursorEl = el;
    this._mounted = true;
  }

  unmount() {
    if (!canUseDOM || !this._mounted) return;
    if (this._rafId) {
      try { window.cancelAnimationFrame(this._rafId); } catch (_) {}
      this._rafId = null;
    }
    this._pendingPos = null;
    if (this.cursorEl && this.cursorEl.parentNode) {
      this.cursorEl.parentNode.removeChild(this.cursorEl);
    }
    this.cursorEl = null;
    this._mounted = false;
    // Ensure OS cursor is visible again after teardown
    try { document.documentElement.classList.remove('gcm-hide-native-cursor'); } catch (_) {}
  }

  setRing(enabled) {
    this.showRing = !!enabled;
    if (!this.cursorEl) return;
    this.cursorEl.classList.toggle('gcm-cursor--ring', !!enabled);
  }

  setPosition(x, y) {
    if (!canUseDOM) return;
    // Queue target position and batch DOM writes via rAF
    const clampedX = Math.max(0, Math.min(window.innerWidth, x));
    const clampedY = Math.max(0, Math.min(window.innerHeight, y));
    this._pendingPos = { x: clampedX, y: clampedY };
    if (!this._rafId) {
      this._rafId = window.requestAnimationFrame((ts) => this._flush(ts));
    }
  }

  // Move the pointer by delta and emit synthetic mousemove at the new position
  moveBy(dx, dy) {
    if (!canUseDOM) return;
    const nextX = Math.max(0, Math.min(window.innerWidth, this.position.x + dx));
    const nextY = Math.max(0, Math.min(window.innerHeight, this.position.y + dy));
    this.setPosition(nextX, nextY);
    // Dispatch synthetic mousemove to the element under the pointer
    try {
      dispatchMouseEvent('mousemove', nextX, nextY, { buttons: 0 });
    } catch (_) {}
  }

  // Dispatch helper at current cursor position
  dispatch(type, options = {}) {
    if (!canUseDOM) return;
    try {
      const px = (this._pendingPos && typeof this._pendingPos.x === 'number') ? this._pendingPos.x : this.position.x;
      const py = (this._pendingPos && typeof this._pendingPos.y === 'number') ? this._pendingPos.y : this.position.y;
      dispatchMouseEvent(type, px, py, options);
    } catch (_) {}
  }

  mousedown() { this.dispatch('mousedown', { buttons: 1 }); }
  mouseup() { this.dispatch('mouseup', { buttons: 0 }); }
  click() { this.dispatch('click'); }

  getPosition() {
    return { ...this.position };
  }

  hideNativeCursorGlobally(enable) {
    if (!canUseDOM) return;
    document.documentElement.classList.toggle('gcm-hide-native-cursor', !!enable);
  }

  _flush(ts) {
    this._rafId = null;
    if (!canUseDOM || !this.cursorEl) return;
    if (!this._pendingPos) return;
    const target = this._pendingPos;
    // Lerp toward target if smoothing enabled
    const alpha = this.smoothing;
    const nextX = alpha > 0 ? (this.position.x + (target.x - this.position.x) * alpha) : target.x;
    const nextY = alpha > 0 ? (this.position.y + (target.y - this.position.y) * alpha) : target.y;
    this.position.x = nextX;
    this.position.y = nextY;
    // Apply batched DOM write
    try {
      this.cursorEl.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0) translate(-50%, -50%)`;
    } catch (_) {}
    // If not close enough to target, continue animating
    const closeEnough = Math.abs(this.position.x - target.x) < 0.5 && Math.abs(this.position.y - target.y) < 0.5;
    if (!closeEnough) {
      this._rafId = window.requestAnimationFrame((t) => this._flush(t));
    } else {
      // Arrived
      this._pendingPos = null;
    }
  }
}

export default PointerDriver;