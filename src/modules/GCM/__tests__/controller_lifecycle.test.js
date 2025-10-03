import { GamepadController } from '../core/GamepadController.js';

function setGetGamepads(fn) {
  Object.defineProperty(global.navigator, 'getGamepads', {
    configurable: true,
    writable: true,
    value: fn,
  });
}

describe('GamepadController – connect/disconnect lifecycle events', () => {
  beforeEach(() => {
    if (!global.navigator) {
      // eslint-disable-next-line no-global-assign
      global.navigator = {};
    }
  });

  afterEach(() => {
    setGetGamepads(undefined);
  });

  test('emits connected and disconnected on device changes', () => {
    let pads = [
      { connected: true, id: 'PadA', index: 0, axes: [], buttons: [], mapping: 'standard', timestamp: Date.now() },
    ];
    setGetGamepads(() => pads);
    const controller = new GamepadController({});
    const connectedEvents = [];
    const disconnectedEvents = [];
    controller.on('connected', (payload) => connectedEvents.push(payload));
    controller.on('disconnected', (payload) => disconnectedEvents.push(payload));

    // Run ticks to allow debounced device scan (~200ms)
    controller.start();
    controller._tick(0); // eslint-disable-line no-underscore-dangle
    controller._tick(250); // triggers scan; PadA connected

    expect(connectedEvents.length).toBeGreaterThan(0);
    expect(Array.isArray(connectedEvents[connectedEvents.length - 1])).toBe(true);

    // Now remove the pad
    pads = [];
    controller._tick(500); // triggers next scan; PadA disconnected

    expect(disconnectedEvents.length).toBeGreaterThan(0);
    // Disconnected payload contains removed IDs
    const lastRemoved = disconnectedEvents[disconnectedEvents.length - 1];
    expect(Array.isArray(lastRemoved)).toBe(true);
    expect(lastRemoved.includes('PadA')).toBe(true);

    controller.stop();
  });
});