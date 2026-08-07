/**
 * Retours haptiques. Le motif « heartbeat » est celui du Bouton Pensee :
 * deux pulsations courtes suivies d'une plus longue, comme un battement.
 */
export type HapticPattern = 'tap' | 'success' | 'heartbeat' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  tap: 18,
  success: [24, 40, 24],
  heartbeat: [70, 90, 70, 260, 120],
  error: [40, 60, 40],
};

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export function vibrate(pattern: HapticPattern = 'tap') {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(patterns[pattern]);
  } catch {
    /* certains navigateurs refusent la vibration hors interaction utilisateur */
  }
}

export function supportsHaptics() {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
