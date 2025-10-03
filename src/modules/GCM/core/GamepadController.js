/**
 * Gamepad Control Module (GCM) – Core GamepadController (Skeleton)
 * Provides init/start/stop, a minimal event system, runtime config, and state.
 * Input polling and ownership arbitration will be added in later steps.
 */

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;
// Debounce device discovery to avoid thrash on rapid connect/disconnect
const DEVICE_SCAN_INTERVAL_MS = 200;

export const DEFAULT_CONFIG = {
  axes: { leftX: 0, leftY: 1, rightX: 2, rightY: 3 },
  buttons: { south: 0, east: 1, west: 2, north: 3 },
  useDPad: true,
  deadzone: 0.15,
  sensitivity: 10,
  // Scroll sensitivity used by adapters (e.g., React Provider Scroll Mode) - might not be working at all - see readme
  scrollSensitivity: 30,
  pointerEnabled: true,
  focusEnabled: true,
  clickMode: 'tap',
  devicePreference: 'last-connected',
  pauseWhenHidden: true,
  ownershipHysteresisMs: 75,
};

export class GamepadController {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._listeners = new Map(); // event -> Set(handler)
    this._rafId = null;
    this._running = false;
    // Enabled indicates whether the Gamepad API is available and the controller can operate
    this._enabled = canUseDOM && typeof navigator !== 'undefined' && !!navigator.getGamepads;
    this._lastTs = 0;
    this._lastDeviceScanTs = 0;
    this._ownership = 'mouse'; // 'mouse' | 'gamepad'
    this._cursor = { x: 0, y: 0 };
    this._connectedPads = [];
    this._connectedPadIds = new Set();
    this._lastMouseTs = 0;
    this._lastGamepadTs = 0;
    this._lastMousePos = { x: 0, y: 0 };
    this._onMouseMove = null;
    this._onMouseActivity = null;
    this._prevButtonState = { south: false, east: false, west: false, north: false };
  }

  start() {
    // Starts the controller loop and sets up mouse activity listeners.
    // Inputs: none. Output: none; emits enabledChange and begins _tick via rAF.
    if (this._running) return;
    if (!canUseDOM) return; // No-op on server
    // Graceful fallback: if Gamepad API is unavailable, mark disabled and do not start loop
    if (!(typeof navigator !== 'undefined' && navigator.getGamepads)) {
      this._enabled = false;
      this._emit('enabledChange', { enabled: false, reason: 'no-gamepad-api' });
      return;
    }
    this._enabled = true;
    this._emit('enabledChange', { enabled: true });
    this._running = true;
    // Mouse activity listeners (ownership: mouse)
    this._onMouseMove = (e) => {
      // Ignore synthetic mousemove to prevent accidental ownership flips
      if (e && e.isTrusted === false) return;
      this._lastMouseTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      this._lastMousePos = { x: e.clientX, y: e.clientY };
      if (this._ownership !== 'mouse') this._setOwnership('mouse');
    };
    this._onMouseActivity = (e) => {
      // Ignore synthetic wheel/mousedown to prevent accidental ownership flips
      if (e && e.isTrusted === false) return;
      this._lastMouseTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (this._ownership !== 'mouse') this._setOwnership('mouse');
    };
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.addEventListener('wheel', this._onMouseActivity, { passive: true });
    document.addEventListener('mousedown', this._onMouseActivity, { passive: true });
    const loop = (ts) => {
      this._rafId = window.requestAnimationFrame(loop);
      this._tick(ts);
    };
    this._rafId = window.requestAnimationFrame(loop);
  }

  stop() {
    // Stops the controller loop and removes listeners; restores mouse ownership.
    // Inputs: none. Output: none.
    if (!this._running) return;
    this._running = false;
    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (canUseDOM) {
      if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
      if (this._onMouseActivity) {
        document.removeEventListener('wheel', this._onMouseActivity);
        document.removeEventListener('mousedown', this._onMouseActivity);
      }
      this._onMouseMove = null;
      this._onMouseActivity = null;
      // Ensure native cursor is restored when stopping, regardless of ownership state
      try {
        this._setOwnership('mouse');
      } catch (_) {
        try { document.documentElement.classList.remove('gcm-hide-native-cursor'); } catch (_) {}
      }
    }
  }

  on(event, handler) {
    // Subscribes to controller events.
    // Inputs: event name string, handler function; Output: void.
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
  }

  off(event, handler) {
    // Unsubscribes a handler from an event.
    // Inputs: event name string, handler function; Output: void.
    const set = this._listeners.get(event);
    if (set) set.delete(handler);
  }

  _emit(event, payload) {
    // Internal: invokes all handlers for event with payload.
    // Inputs: event string, payload any; Output: void.
    const set = this._listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (err) {
        // swallow errors whole - like a sword eater or something - I guess someday it will log the issues or something
      }
    }
  }

  setConfig(partial = {}) {
    // Merges new configuration and notifies listeners.
    // Inputs: partial config object; Output: void.
    this.config = { ...this.config, ...partial };
    this._emit('configChange', this.config);
  }

  getState() {
    // Returns a snapshot of controller state.
    // Inputs: none. Output: plain object with ownership/cursor/pads/config/running/enabled.
    return {
      ownership: this._ownership,
      cursor: { ...this._cursor },
      connectedGamepads: [...this._connectedPads],
      config: { ...this.config },
      running: this._running,
      enabled: this._enabled,
    };
  }

  _tick(ts) {
    // Internal per-frame loop: scans devices, arbitrates ownership, updates cursor.
    // Inputs: timestamp (rAF); Output: none.
    if (!canUseDOM) return; // Skip on server
    if (!this._enabled) return; // Skip when disabled due to missing Gamepad API
    if (this.config.pauseWhenHidden && typeof document !== 'undefined' && document.hidden) return;
    // Minimal skeleton: track connected gamepads.
    this._lastTs = ts;
    // Debounced device discovery
    if (ts - this._lastDeviceScanTs >= DEVICE_SCAN_INTERVAL_MS) {
      this._scanDevices(ts);
      this._lastDeviceScanTs = ts;
    }
    // Read current gamepads snapshot for activity detection
    const pads = (typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()) || [];
    const connected = Array.from(pads).filter((gp) => gp && gp.connected !== false);
    // Ownership arbitration: detect recent gamepad activity
    const active = connected.some((gp) => this._isGamepadActive(gp));
    if (active) {
      this._lastGamepadTs = ts;
    }
    // Switch to gamepad ownership if hysteresis exceeded
    const hysteresis = this.config.ownershipHysteresisMs || 75;
    if (this._lastGamepadTs > (this._lastMouseTs + hysteresis)) {
      if (this._ownership !== 'gamepad') this._setOwnership('gamepad');
    }

    // Pointer movement: when gamepad owns input, update virtual cursor from axes
    if (this._ownership === 'gamepad' && this.config.pointerEnabled !== false) {
      let gpInstance = null;
      if (connected.length > 0) {
        const pref = this.config.devicePreference;
        if (typeof pref === 'number') {
          gpInstance = connected.find((g) => g.index === pref) || connected[0];
        } else if (pref === 'first') {
          gpInstance = connected[0];
        } else {
          // default: last-connected (use last non-null from the array snapshot)
          gpInstance = connected[connected.length - 1];
        }
      }

      if (gpInstance && Array.isArray(gpInstance.axes)) {
        const axes = this.config.axes || {};
        const leftXIdx = typeof axes.leftX === 'number' ? axes.leftX : 0;
        const leftYIdx = typeof axes.leftY === 'number' ? axes.leftY : 1;
        const rawX = gpInstance.axes[leftXIdx] || 0;
        const rawY = gpInstance.axes[leftYIdx] || 0;
        const dz = typeof this.config.deadzone === 'number' ? this.config.deadzone : 0.15;
        const sensitivity = typeof this.config.sensitivity === 'number' ? this.config.sensitivity : 10;
        const norm = (v) => (Math.abs(v) < dz ? 0 : v);
        const dx = norm(rawX) * sensitivity;
        const dy = norm(rawY) * sensitivity;
          if (dx !== 0 || dy !== 0) {
            const vw = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) || 0;
          const vh = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) || 0;
          const nextX = Math.max(0, Math.min(vw, this._cursor.x + dx));
          const nextY = Math.max(0, Math.min(vh, this._cursor.y + dy));
          this._cursor = { x: nextX, y: nextY };
          this._emit('cursorChange', { ownership: this._ownership, cursor: { ...this._cursor } });
        }
      }

      // Button mapping: detect primary button transitions for click/tap actions
      if (gpInstance && Array.isArray(gpInstance.buttons)) {
        const btns = this.config.buttons || {};
        const southIdx = typeof btns.south === 'number' ? btns.south : 0;
        const southPressed = !!(gpInstance.buttons[southIdx] && gpInstance.buttons[southIdx].pressed);
        if (southPressed !== this._prevButtonState.south) {
          this._prevButtonState.south = southPressed;
          this._emit('buttonChange', { name: 'south', pressed: southPressed });
        }
        // Secondary (right click) – east/B
        const eastIdx = typeof btns.east === 'number' ? btns.east : 1;
        const eastPressed = !!(gpInstance.buttons[eastIdx] && gpInstance.buttons[eastIdx].pressed);
        if (eastPressed !== this._prevButtonState.east) {
          this._prevButtonState.east = eastPressed;
          this._emit('buttonChange', { name: 'east', pressed: eastPressed });
        }
        // Other face buttons can be wired later as needed
      }
    }
  }

  /**
   * Scan navigator.getGamepads, update internal connected list, and emit lifecycle events.
   * Called in a debounced manner from _tick to reduce thrash.
   */
  _scanDevices(ts) {
    // Internal: updates the connected gamepads list and emits lifecycle events.
    // Inputs: timestamp; Output: none.
    const pads = (typeof navigator !== 'undefined' && navigator.getGamepads && navigator.getGamepads()) || [];
    const list = Array.from(pads).filter((gp) => gp && gp.connected !== false);
    const next = list.map((gp) => ({ id: gp.id, index: gp.index, mapping: gp.mapping, timestamp: gp.timestamp }));
    const prevIds = new Set(this._connectedPadIds);
    const nextIds = new Set(next.map((p) => p.id));
    // Determine adds/removals
    const added = [];
    const removed = [];
    for (const id of nextIds) {
      if (!prevIds.has(id)) added.push(id);
    }
    for (const id of prevIds) {
      if (!nextIds.has(id)) removed.push(id);
    }
    const prevCount = this._connectedPads.length;
    this._connectedPads = next;
    this._connectedPadIds = nextIds;
    // Emit events when changes occur
    if (added.length || removed.length || next.length !== prevCount) {
      this._emit('connected', this._connectedPads);
      if (removed.length) this._emit('disconnected', removed);
    }
  }

  _isGamepadActive(gp) {
    // Internal: detects activity beyond deadzone on axes or any pressed button.
    // Inputs: Gamepad; Output: boolean.
    if (!gp) return false;
    const dz = this.config.deadzone ?? 0.15;
    const axesActive = Array.isArray(gp.axes) && gp.axes.some((v) => Math.abs(v) > dz);
    const buttonsActive = Array.isArray(gp.buttons) && gp.buttons.some((b) => b && b.pressed);
    return axesActive || buttonsActive;
  }

  _setOwnership(owner) {
    // Internal: switches ownership and emits changes; aligns cursor when taking gamepad.
    // Inputs: 'mouse'|'gamepad'; Output: none.
    if (!canUseDOM) return;
    if (owner === this._ownership) return;
    this._ownership = owner;
    // When switching to gamepad, align virtual cursor to last mouse position for continuity
    if (owner === 'gamepad') {
      this._cursor = { ...this._lastMousePos };
      // Hide OS cursor
      try {
        document.documentElement.classList.add('gcm-hide-native-cursor');
      } catch (_) {}
    } else {
      // Show OS cursor
      try {
        document.documentElement.classList.remove('gcm-hide-native-cursor');
      } catch (_) {}
    }
    this._emit('ownershipChange', { ownership: owner, cursor: { ...this._cursor } });
  }
}

export default GamepadController;