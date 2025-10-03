import { GamepadController } from '../core/GamepadController.js';

// Helper to mock navigator.getGamepads
function setGetGamepads(fn) {
  Object.defineProperty(global.navigator, 'getGamepads', {
    configurable: true,
    writable: true,
    value: fn,
  });
}

describe('GamepadController – basics', () => {
  beforeEach(() => {
    // Ensure DOM is available via JSDOM and reset navigator
    if (!global.navigator) {
      // eslint-disable-next-line no-global-assign
      global.navigator = {};
    }
    setGetGamepads(undefined);
  });

  afterEach(() => {
    // Restore
    setGetGamepads(undefined);
  });

  test('disables when Gamepad API is missing', () => {
    setGetGamepads(undefined);
    const controller = new GamepadController({});
    const st = controller.getState();
    expect(st.enabled).toBe(false);
    expect(st.running).toBe(false);
  });

  test('enables and emits enabledChange when Gamepad API present', () => {
    const events = [];
    setGetGamepads(() => []);
    const controller = new GamepadController({});
    controller.on('enabledChange', (payload) => events.push(payload));
    controller.start();
    const st = controller.getState();
    expect(st.enabled).toBe(true);
    expect(st.running).toBe(true);
    expect(events.some((e) => e && e.enabled === true)).toBe(true);
    controller.stop();
  });
});

describe('GamepadController – normalization and ownership', () => {
  beforeEach(() => {
    // Provide a mock gamepad snapshot array
    setGetGamepads(() => [
      {
        connected: true,
        axes: [0.1, 0.2, 0, 0],
        buttons: [ { pressed: false }, { pressed: false }, { pressed: false }, { pressed: false } ],
        index: 0,
        id: 'MockPad',
        mapping: 'standard',
        timestamp: Date.now(),
      },
    ]);
  });

  test('applies deadzone and sensitivity and switches ownership to gamepad', () => {
    const controller = new GamepadController({ deadzone: 0.15, sensitivity: 10 });
    // Manually call _tick to simulate a frame while enabled
    // Ensure enabled true for processing
    controller.start();
    controller._tick(100); // eslint-disable-line no-underscore-dangle
    const st = controller.getState();
    expect(st.ownership).toBe('gamepad');
    // dx should be 0 (0.1 < 0.15), dy should be > 0 (0.2 >= 0.15)
    expect(st.cursor.x).toBeGreaterThanOrEqual(0);
    expect(st.cursor.y).toBeGreaterThan(0);
    controller.stop();
  });

  test('emits buttonChange on south press and release', () => {
    // Two frames: press then release
    let pressed = false;
    setGetGamepads(() => [
      {
        connected: true,
        axes: [0, 0, 0, 0],
        buttons: [ { pressed }, { pressed: false }, { pressed: false }, { pressed: false } ],
        index: 0,
        id: 'MockPad',
        mapping: 'standard',
        timestamp: Date.now(),
      },
    ]);
    const controller = new GamepadController({});
    const events = [];
    controller.on('buttonChange', (payload) => events.push(payload));
    controller.start();
    // Frame 1: press
    pressed = true;
    controller._tick(200); // eslint-disable-line no-underscore-dangle
    // Frame 2: release
    pressed = false;
    controller._tick(300); // eslint-disable-line no-underscore-dangle
    controller.stop();
    const names = events.map((e) => e && e.name);
    expect(names.includes('south')).toBe(true);
    expect(events.some((e) => e && e.name === 'south' && e.pressed === true)).toBe(true);
    expect(events.some((e) => e && e.name === 'south' && e.pressed === false)).toBe(true);
  });
});