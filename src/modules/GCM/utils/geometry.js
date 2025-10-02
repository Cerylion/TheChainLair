/**
 * Gamepad Control Module (GCM) – Geometry Utilities
 * Helpers for spatial directional focus navigation.
 */

// SSR safety guards are handled by callers; these are pure math utilities.

export function rectCenter(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function isInDirection(fromRect, toRect, direction) {
  const fc = rectCenter(fromRect);
  const tc = rectCenter(toRect);
  const dx = tc.x - fc.x;
  const dy = tc.y - fc.y;
  switch (direction) {
    case 'right': return dx > 0;
    case 'left': return dx < 0;
    case 'down': return dy > 0;
    case 'up': return dy < 0;
    default: return true;
  }
}

export function directionalMetric(fromCenter, toCenter, direction) {
  // Lower is better; favor alignment with direction and proximity.
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const dist2 = dx * dx + dy * dy;
  // Unit vector for direction
  const ux = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
  const uy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  const dot = dx * ux + dy * uy; // projection on direction axis
  const offAxis2 = dist2 - dot * dot; // perpendicular component squared
  // Weight: primary axis distance plus a penalty for off-axis deviation
  return Math.abs(dot) + 0.5 * Math.sqrt(Math.max(0, offAxis2));
}

const geometry = { rectCenter, isInDirection, directionalMetric };

export default geometry;