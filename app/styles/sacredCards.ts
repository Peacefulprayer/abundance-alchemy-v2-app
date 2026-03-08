/**
 * Sacred card design system — S1 through S4 entry flow.
 * Used by: PreSplash, SplashScreen, WelcomeScreen, PersonalGreeting, Auth.
 *
 * ONE card style. All cards share the same background, border, corners, and
 * shadow. Only padding varies by content density. This is intentional and
 * must not be changed without explicit direction.
 *
 * Visual spec:
 *   Background : slate-900 → slate-950 gradient, 90% opacity (always readable)
 *   Border     : amber-500 at 20% opacity (ties to amber title text and buttons)
 *   Corners    : rounded-2xl
 *   Shadow     : shadow-xl
 *   Width      : 300px mobile / 380px desktop
 */

const SACRED_CARD_BASE =
  'rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/88 shadow-xl w-full max-w-[300px] md:max-w-[380px]';

/** Outer layout — centers content vertically, gap handles spacing between cards */
export const SACRED_LAYOUT =
  'relative z-10 min-h-screen flex flex-col items-center justify-center py-6 md:py-10 px-4 gap-3 md:gap-4 overflow-y-auto';

/** Title card — "Abundance Alchemy". Compact padding, just the heading. */
export const SACRED_TITLE_CARD = `${SACRED_CARD_BASE} p-4 md:p-5`;

/** Body card — main content. More vertical padding for breathing room. */
export const SACRED_BODY_CARD = `${SACRED_CARD_BASE} p-4 md:p-6`;

/** Footer card — legal/attribution copy. Compact padding. */
export const SACRED_FOOTER_CARD = `${SACRED_CARD_BASE} p-3`;

/** No-op — gap on SACRED_LAYOUT handles card spacing */
export const SACRED_CARD_GAP = '';

/** No-op — gap on SACRED_LAYOUT handles orb spacing */
export const SACRED_ORB_WRAPPER = '';

/** Inner width — non-card children (buttons, progress bars) align with cards */
export const SACRED_INNER_WIDTH = 'w-full max-w-[300px] md:max-w-[380px]';
