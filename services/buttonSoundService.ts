// src/services/buttonSoundService.ts
// Centralized UI button sound API (single source of truth)
//
// Goal:
// - Keep the same public surface used across the app (play, playClick, etc.)
// - Route all button taps to the canonical short tap tone in audioService
// - Preserve semantic variants ('click' | 'confirm' | 'back') for future tuning

import { playButtonTap } from './audioService';

export type ButtonSoundVariant = 'click' | 'confirm' | 'back';

/**
 * Canonical button tap sound across the app.
 * Variants are currently mapped to the same tap tone to preserve consistency.
 * If you later want confirm/back to differ slightly, we can tune here without touching components.
 */
function play(variant: ButtonSoundVariant = 'click') {
  // Right now: one sacred, consistent tap across the app.
  // Keeping variant param for UI semantics & future flexibility.
  void variant;
  playButtonTap();
}

function playClick() {
  play('click');
}

export const buttonSoundService = {
  play,
  playClick
};
