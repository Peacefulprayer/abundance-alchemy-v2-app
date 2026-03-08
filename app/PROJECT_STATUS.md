# Abundance Alchemy App V2 — Project Status

## Canonical repo
https://github.com/Peacefulprayer/abundance-alchemy-v2-app

## Current phase
Phase 1.5 — Sacred entry flow polish + shared ceremonial UI system

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

## Known issues (from prior work)
- Anonymous pre-auth refresh behavior still needs an explicit product decision.
- `api/me.php` can still generate expected `401` console noise on anonymous boot.
- One user-reported flow glitch is intentionally being left for later.
- Broader post-dashboard consistency pass is still pending on:
  - `Library`
  - `Settings`
  - `Stats`
  - `Profile`
  - `Prayer`
  - practice screens

## Next actions
1) Visual QA the full sacred entry path on mobile Safari and desktop:
   `PreSplash`, `Splash`, `Welcome`, `Naming`, `Auth`, `Onboarding`, `Tutorial`.
2) Decide the intended refresh model for anonymous users before coding the deeper flow fix.
3) Reduce anonymous-boot `401` noise by narrowing when `me.php` is called.
4) Continue consistency polish across post-dashboard screens.
