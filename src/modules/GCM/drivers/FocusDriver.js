/**
 * Gamepad Control Module (GCM) – Focus Driver (Scaffold)
 * Handles focusable element collection and basic focus navigation.
 * Directional (spatial) navigation will be implemented in later steps.
 */

import { rectCenter, isInDirection, directionalMetric } from '../utils/geometry.js';

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'textarea',
  'select',
  'details',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
].join(',');

function isElementVisible(el) {
  if (!canUseDOM) return true;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle ? window.getComputedStyle(el) : { visibility: 'visible', display: 'block' };
  const ariaHidden = (el && el.getAttribute) ? el.getAttribute('aria-hidden') : null;
  return (
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    rect.width > 0 &&
    rect.height > 0 &&
    ariaHidden !== 'true'
  );
}

function isFocusable(el) {
  if (!el) return false;
  if (el.hasAttribute('disabled')) return false;
  return isElementVisible(el);
}

export class FocusDriver {
  constructor(options = {}) {
    this.root = options.root || (canUseDOM ? document : null);
  }

  /** Collect focusable elements within the root (DOM order). */
  getFocusableElements() {
    if (!this.root || !canUseDOM) return [];
    const list = Array.from(this.root.querySelectorAll(FOCUSABLE_SELECTOR));
    return list.filter(isFocusable);
  }

  /** Focus the first focusable element, if any. */
  focusFirst() {
    const els = this.getFocusableElements();
    if (els.length) this.focusElement(els[0]);
  }

  /** Focus the next element in DOM order after the currently focused one. */
  focusNext() {
    const els = this.getFocusableElements();
    const active = this.root ? this.root.activeElement : null;
    const idx = els.indexOf(active);
    const next = idx >= 0 && idx + 1 < els.length ? els[idx + 1] : els[0];
    if (next) this.focusElement(next);
  }

  /** Focus the previous element in DOM order. */
  focusPrev() {
    const els = this.getFocusableElements();
    const active = this.root ? this.root.activeElement : null;
    const idx = els.indexOf(active);
    const prev = idx > 0 ? els[idx - 1] : els[els.length - 1];
    if (prev) this.focusElement(prev);
  }

  /** Spatial directional navigation based on bounding boxes and angle alignment. */
  focusByDirection(direction = 'right') {
    if (!canUseDOM) return;
    const els = this.getFocusableElements();
    if (!els.length) return;
    const active = (this.root && this.root.activeElement) || null;
    // If no active element, focus the first
    if (!active || !els.includes(active)) {
      this.focusElement(els[0]);
      return;
    }
    const fromRect = active.getBoundingClientRect();
    const fromCenter = rectCenter(fromRect);
    let best = null;
    let bestScore = Infinity; // lower is better
    for (const el of els) {
      if (el === active) continue;
      const toRect = el.getBoundingClientRect();
      if (!isInDirection(fromRect, toRect, direction)) continue;
      const score = directionalMetric(fromCenter, rectCenter(toRect), direction);
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) {
      this.focusElement(best);
    } else {
      // Fallback to linear next/prev if no spatial candidate
      if (direction === 'left' || direction === 'up') {
        this.focusPrev();
      } else {
        this.focusNext();
      }
    }
  }

  /** Safely focus an element without scrolling. */
  focusElement(el) {
    try {
      el.focus({ preventScroll: true });
    } catch (_) {
      // ignore focus errors in scaffold
    }
  }
}

export default FocusDriver;