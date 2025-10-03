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
  // Initializes GCM in vanilla apps: creates controller/drivers, mounts pointer, starts.
  // Inputs: config object; Output: { controller, pointer, focus, teardown }.
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
    // Cleans up mounted overlay and stops controller, restoring native cursor.
    // Inputs: none; Output: none.
    try { pointer && pointer.unmount(); } catch (_) {}
    try { controller.stop(); } catch (_) {}
    // Safety: ensure native cursor visibility is restored even if stop/unmount fails
    try {
      if (canUseDOM && document && document.documentElement) {
        document.documentElement.classList.remove('gcm-hide-native-cursor');
      }
    } catch (_) {}
  };

  return { controller, pointer, focus, teardown };
}

export default initGCM;