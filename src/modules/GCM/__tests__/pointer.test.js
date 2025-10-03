import { PointerDriver } from '../drivers/PointerDriver.js';

describe('PointerDriver – position and click dispatch', () => {
  let driver;

  beforeEach(() => {
    driver = new PointerDriver({ smoothing: 0 });
    driver.mount();
  });

  afterEach(() => {
    driver.unmount();
    driver = null;
  });

  test('setPosition applies translate3d transform', async () => {
    driver.setPosition(100, 200);
    // Directly flush queued position to avoid rAF timing issues in JSDOM
    driver._flush(0); // eslint-disable-line no-underscore-dangle
    const el = driver.cursorEl;
    expect(el).toBeTruthy();
    const transform = el.style.transform || '';
    expect(transform.includes('translate3d(100px, 200px, 0)')).toBe(true);
    const pos = driver.getPosition();
    expect(pos.x).toBeCloseTo(100, 1);
    expect(pos.y).toBeCloseTo(200, 1);
  });

  test('click dispatch targets elementFromPoint', () => {
    // Create a target element and intercept elementFromPoint
    const target = document.createElement('div');
    target.id = 'click-target';
    document.body.appendChild(target);
    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => target;

    const events = [];
    target.addEventListener('click', (e) => events.push(e));

    // Position over the element and click
    driver.setPosition(10, 10);
    driver.click();

    // Restore
    document.elementFromPoint = origElementFromPoint;
    document.body.removeChild(target);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe('click');
  });
});