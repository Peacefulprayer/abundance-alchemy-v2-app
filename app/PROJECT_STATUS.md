# Abundance Alchemy App V2 — Project Status

## Canonical repo
https://github.com/Peacefulprayer/abundance-alchemy-v2-app

## Current phase
Phase 1.9 — Sacred entry resilience plus inner-screen baseline polish

## Non-negotiables
- Button tap tone is canonical and must be used across the app.

## Current state
- Sacred entry flow remains:
  - `PRE_SPLASH -> SPLASH -> WELCOME -> NAMING/AUTH/RETURN PORTAL -> ONBOARDING -> TUTORIAL -> DASHBOARD`
- Shared `sacredCards` layout/card system is now applied across the core entry sequence:
  - `PreSplash`
  - `Auth`
  - `SacredNamingCeremony`
  - `Onboarding`
  - `TutorialOverlay`
  - `WelcomeScreen`
  - `SplashScreen`
- Tutorial screens were visually improved and are in a stronger state than the prior checkpoint.
- Register-from-direct-auth now carries the entered name through `NAMING_CEREMONY` into `ONBOARDING`.
- Splash glass-card treatment and welcome skip behavior were restored after regressions.
- Auth flow is now explicit and app-directed:
  - `App.tsx` owns `Sign Up` vs `Sign In` intent
  - fresh-path users are routed into registration
  - returning/signed-out users are routed into sign-in
  - failed sign-in no longer bounces the app back to Splash
- Standards pass started across sacred entry:
  - onboarding now skips redundant name confirmation when identity is already established
  - auth now includes password recovery
  - welcome invocation now has autoplay fallback without forcing an extra text branch into the screen
  - splash preparation copy now reads as ritual opening rather than fake technical loading
  - tutorial copy no longer teaches around browser refresh/back weakness
- Dashboard now has a stronger sacred/gold baseline:
  - centered shell and framed section grouping
  - upgraded card contrast and hierarchy for wisdom, focus, practice, meditation, and Temple Sound
  - tighter mobile spacing without changing dashboard behavior
- Pre-auth refresh/back resilience has been strengthened in `app/App.tsx`:
  - resumable anonymous states now persist more intentionally through `SPLASH`, `WELCOME`, `NAMING_CEREMONY`, and `AUTH`
  - pre-auth sacred-name state is preserved and cleared deliberately instead of leaking across flows
  - browser history state is now synchronized with major app modes so refresh/back behaves more predictably
- Inner dashboard screens now follow the same sacred-card baseline:
  - `Settings`
  - `Stats`
  - `Profile`
  - `Library`

## Known issues (from prior work)
- browser network tools can still show the expected `401` from `api/me.php` on anonymous boot, though the app no longer treats it like a logout event
- One user-reported flow glitch is intentionally being left for later.
- Broader post-dashboard consistency pass is still pending on:
  - `Prayer`
  - practice screens

## Next actions
1) Visual QA the full sacred entry path plus `Dashboard`, `Settings`, `Stats`, `Profile`, and `Library` on mobile Safari and desktop.
2) Continue the sacred-system polish into the next inner-screen cluster:
   `Prayer`, `Meditation`, `I Am`, `I Love`.
3) Reduce anonymous-boot `401` noise further by narrowing when `me.php` is called.
4) Resolve the intentionally deferred user-reported flow glitch once the inner-screen baseline is signed off.
