/**
 * Gamepad Control Module (GCM) – Scroll Driver
 * Finds the appropriate scroll container and applies vertical scroll deltas.
 */
export class ScrollDriver {
  // Manages page or element scrolling relative to a viewport point.
  // Inputs: options { root, preferGlobal, minScrollableRatio }.
  // Output: instance with helper methods to scroll.
  constructor({ root = document, preferGlobal = true, minScrollableRatio = 1.2 } = {}) {
    this.root = root;
    this.preferGlobal = preferGlobal;
    this.minScrollableRatio = minScrollableRatio;
  }

  getGlobalScrollElement() {
    // Returns the document-level scrolling element for global page scroll.
    // Inputs: none. Output: Element.
    const doc = this.root || document;
    return doc.scrollingElement || doc.documentElement || doc.body;
  }

  isScrollable(el) {
    // Checks if an element can scroll vertically or horizontally.
    // Inputs: Element; Output: boolean.
    if (!el) return false;
    const style = (el.ownerDocument || document).defaultView.getComputedStyle(el);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canY = (overflowY === 'auto' || overflowY === 'scroll') && (el.scrollHeight > el.clientHeight * this.minScrollableRatio);
    const canX = (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
    return canY || canX;
  }

  findScrollableAncestorAtPoint(x, y) {
    // Finds nearest scrollable ancestor at viewport point (x, y),
    // falling back to global page scroll when none found or preferGlobal.
    // Inputs: x, y numbers; Output: Element.
    const doc = this.root || document;
    if (this.preferGlobal) return this.getGlobalScrollElement();
    const el = doc.elementFromPoint(Math.round(x), Math.round(y));
    let cur = el;
    while (cur && cur !== doc && cur !== doc.body) {
      if (this.isScrollable(cur)) return cur;
      cur = cur.parentElement;
    }
    return this.getGlobalScrollElement();
  }

  scrollByAtPoint(dy, x, y) {
    // Scrolls the target container at (x, y) vertically by dy pixels.
    // Inputs: dy number, x/y numbers; Output: none.
    if (!dy) return;
    const target = this.findScrollableAncestorAtPoint(x, y);
    try {
      target.scrollBy({ top: dy, left: 0, behavior: 'auto' });
    } catch (_) {
      target.scrollTop = (target.scrollTop || 0) + dy;
    }
  }

  pageJump(direction, x, y) {
    // Performs near-page-size jump up/down from point (x, y).
    // Inputs: direction 'up'|'down', x/y numbers; Output: none.
    const sign = direction === 'up' ? -1 : 1;
    const doc = this.root || document;
    const viewportH = (doc.defaultView || window).innerHeight || 600;
    this.scrollByAtPoint(sign * viewportH * 0.9, x, y);
  }
}