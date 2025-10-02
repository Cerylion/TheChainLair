/**
 * Gamepad Control Module (GCM) – Vanilla Adapter (Skeleton)
 * Provides an initializer that constructs the controller and driver instances.
 * Mounting overlays and starting the controller will be handled in a later step.
 */

import { GamepadController } from '../../core/GamepadController.js';
import { PointerDriver } from '../../drivers/PointerDriver.js';
import { FocusDriver } from '../../drivers/FocusDriver.js';

// SSR safety: detect DOM availability
const canUseDOM = typeof window !== 'undefined' && !!window.document && !!window.document.createElement;

export function initGCM(config = {}) {
  const controller = new GamepadController(config);

  const pointer = canUseDOM ? new PointerDriver({ showRing: !!config.showRing }) : null;
  const focus = canUseDOM ? new FocusDriver({ root: document }) : null;

  // Finalize vanilla wiring: mount overlay and optionally start controller (client-only).
  if (canUseDOM) {
    if (pointer && config.mountPointer !== false) {
      try { pointer.mount(); } catch (_) {}
    }
    if (config.autoStart !== false) {
      try { controller.start(); } catch (_) {}
    }
  }

  const teardown = () => {
    try { pointer && pointer.unmount(); } catch (_) {}
    try { controller.stop(); } catch (_) {}
  };

  return { controller, pointer, focus, teardown };
}

export default initGCM;