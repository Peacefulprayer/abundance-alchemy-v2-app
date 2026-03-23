# Abundance Alchemy App V2 — Project Status

## Canonical repo
https://github.com/Peacefulprayer/abundance-alchemy-v2-app

## Current phase
Phase 2.2 — Backend cleanup, prayer-content system, and companion-page handoff refresh in progress

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
- Prayer and practice screens now use the same inner sacred-shell direction:
  - `PrayerSetup`
  - `PrayerGuide`
  - `PrayerSession`
  - `MeditationSetup`
  - `PracticeSession` (`I Am`, `I Love`, Meditation)
- Practice completion/reflection now follows the same card hierarchy instead of the older full-bleed gradient-only treatment.
- Local headless QA was completed on the sacred entry flow:
  - `PreSplash`
  - `Splash`
  - `Welcome`
  - `Naming Ceremony`
  - `Auth`
- Local authenticated visual QA was completed through the signed-in app shell on mobile and desktop via the QA harness:
  - `Dashboard`
  - `Settings`
  - `Stats`
  - `Profile`
  - `Library`
  - `PrayerSetup`
  - `PrayerGuide`
  - `PrayerSession`
  - `MeditationSetup`
  - `PracticeSession` (`I Am`, `I Love`, Meditation)
- Anonymous first boot now skips the `me.php` session probe unless local state suggests a returning session should exist.
- Backend cleanup has started across the API layer:
  - shared API helpers now centralize JSON responses, method checks, session identity, schema inspection, and prayer-table bootstrapping
  - core auth / profile / user-content endpoints were normalized onto that helper layer
  - password-reset requests no longer depend on a missing helper file
  - soundscape responses no longer leak stack traces in production responses
- Prayer content is no longer frontend-only by design:
  - curated prayer content can now live in backend `prayer_content`
  - personal user prayers can now live in backend `user_prayers`
  - admin prayer management now exists in `admin/prayers.php`
  - `PrayerGuide` and `PrayerSession` now load backend prayer content with frontend fallback
  - `PrayerSession` now supports saving and removing personal prayers
- Standalone companion pages now exist locally for practice education/orientation:
  - `app/companion-pages/prayer.html`
  - `app/companion-pages/meditation.html`
  - shared styling in `app/companion-pages/assets/companion-pages.css`
  - image folder scaffolding exists for both prayer and meditation companion pages
- Companion pages are currently workspace-only assets:
  - they are not yet wired into the React app shell or linked from the app code
  - they are not reflected in the older handoff notes that existed before this refresh

## Known issues (from prior work)
- One user-reported flow glitch is intentionally being left for later.
- Real-device Safari verification is still desirable before final ship, even though local headless mobile/desktop QA is now complete.
- Live database bootstrap could not be verified from local CLI because the configured DB connection still failed outside the app runtime.
- Companion pages currently appear as untracked local assets rather than integrated app routes/build outputs.
- `app/companion-pages/` contains macOS `._*` sidecar files that should be cleaned before commit/deploy.

## Next actions
1) Verify the new prayer tables/endpoints against the live database/runtime and confirm admin prayer management can seed/edit content there.
2) Decide the integration/deployment path for the standalone companion pages and either wire them into the app/site or explicitly treat them as external/static assets.
3) Clean `app/companion-pages/` before commit so only real source/assets remain.
4) Run a final real-device Safari check against the signed-in routes to confirm touch/viewport behavior outside the QA harness.
5) Resolve the intentionally deferred user-reported flow glitch, then commit/checkpoint/deploy.
