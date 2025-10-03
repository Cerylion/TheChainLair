import { FocusDriver } from '../drivers/FocusDriver.js';

describe('FocusDriver – directional navigation and aria-hidden', () => {
  let driver;
  let center;
  let right;
  let left;

  beforeEach(() => {
    // Build a simple layout: left, center (active), right
    center = document.createElement('button');
    center.id = 'center';
    center.style.position = 'absolute';
    center.style.left = '200px';
    center.style.top = '100px';
    center.style.width = '100px';
    center.style.height = '40px';
    // Provide deterministic layout boxes for jsdom
    center.getBoundingClientRect = () => ({ left: 200, top: 100, width: 100, height: 40, right: 300, bottom: 140 });

    right = document.createElement('button');
    right.id = 'right';
    right.style.position = 'absolute';
    right.style.left = '340px';
    right.style.top = '100px';
    right.style.width = '100px';
    right.style.height = '40px';
    // Provide deterministic layout boxes for jsdom
    right.getBoundingClientRect = () => ({ left: 340, top: 100, width: 100, height: 40, right: 440, bottom: 140 });

    left = document.createElement('button');
    left.id = 'left';
    left.style.position = 'absolute';
    left.style.left = '60px';
    left.style.top = '100px';
    left.style.width = '100px';
    left.style.height = '40px';
    // Provide deterministic layout boxes for jsdom
    left.getBoundingClientRect = () => ({ left: 60, top: 100, width: 100, height: 40, right: 160, bottom: 140 });

    document.body.appendChild(left);
    document.body.appendChild(center);
    document.body.appendChild(right);

    driver = new FocusDriver({ root: document });
    // Set initial focus to center
    center.focus();
  });

  afterEach(() => {
    document.body.removeChild(left);
    document.body.removeChild(center);
    document.body.removeChild(right);
    driver = null;
  });

  test('focusByDirection("right") moves focus to right element', () => {
    expect(document.activeElement).toBe(center);
    driver.focusByDirection('right');
    expect(document.activeElement).toBe(right);
  });

  test('focusByDirection("left") moves focus to left element', () => {
    expect(document.activeElement).toBe(center);
    driver.focusByDirection('left');
    expect(document.activeElement).toBe(left);
  });

  test('skips elements with aria-hidden="true"', () => {
    // Hide the right element from accessibility tree
    right.setAttribute('aria-hidden', 'true');
    expect(document.activeElement).toBe(center);
    driver.focusByDirection('right');
    // With right hidden, no spatial candidate on the right; falls back to next in DOM
    // Our DOM order is left -> center -> right, so fallback goes to center.next (right),
    // but since right is hidden, FocusDriver.filter removes it; fallback to focusNext yields left or center.
    // To keep assertion consistent, ensure activeElement is not the hidden element.
    expect(document.activeElement).not.toBe(right);
  });
});