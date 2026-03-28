# Changelog (human-readable)

## 2026-03-27 checkpoint-public-asset-cleanup
- Removed the remaining macOS `._*` sidecar files from `app/public/`
- Cleared the same metadata files from the current `app/dist/`
- Rebuilt the frontend so the clean asset tree is reflected in production output

## 2026-03-26 checkpoint-companion-pages-integrated
- Added the companion pages to the Vite multi-page build so they now ship as standalone static outputs under `dist/companion-pages/`
- Linked the companion pages from:
  - `PrayerSetup`
  - `MeditationSetup`
- Replaced hard-coded `/abundance-alchemy/` companion-page app links with relative app-root links so the pages work in local preview and under the deployed base path
- Cleaned the macOS `._*` sidecar files from `app/companion-pages/`
- Prayer backend/runtime verification remains partially blocked in local CLI:
  - endpoint files lint clean
  - direct local DB bootstrap still returns `Database connection error`

## 2026-03-20 checkpoint-handoff-refresh-and-companion-pages
- Refreshed handoff docs to match the actual working tree after the interrupted session/restart.
- Documented the existing standalone companion pages under `app/companion-pages/`:
  - `prayer.html`
  - `meditation.html`
  - shared `assets/companion-pages.css`
  - prayer/meditation image folder scaffolding
- Clarified that the companion pages currently exist as local workspace assets and are not yet wired into the React app or referenced elsewhere in the active app code.
- Noted cleanup needed before commit/deploy:
  - remove macOS `._*` sidecar files in `app/companion-pages/`
  - decide whether companion pages should be committed as static pages, moved into a routed app surface, or deployed separately

## 2026-03-17 checkpoint-backend-cleanup-and-prayer-support
- Added a shared backend helper layer in `api/helpers.php` for:
  - JSON/error responses
  - request-method enforcement
  - JSON body parsing
  - session identity lookup
  - schema/ownership inspection
  - prayer table creation and default prayer seeding
- Normalized core API endpoints onto the shared helper layer:
  - `me.php`
  - `login.php`
  - `register.php`
  - `get-user-affirmations.php`
  - `add-user-affirmation.php`
  - `delete-user-affirmation.php`
  - `sync-progress.php`
  - `request-password-reset.php`
  - `get-affirmation.php`
  - `get-soundscapes.php`
- Added backend prayer support:
  - `get-prayer-content.php`
  - `get-user-prayers.php`
  - `add-user-prayer.php`
  - `delete-user-prayer.php`
- Added admin prayer management in `admin/prayers.php` and linked it from the admin nav.
- Updated `PrayerGuide` and `PrayerSession` to read backend prayer content with safe frontend fallback.
- Added personal prayer save/delete support inside `PrayerSession`.
- `npm run build` passes and PHP lint passes on the touched backend files.

## 2026-03-16 checkpoint-authenticated-qa-and-boot-cleanup
- Completed local authenticated visual QA on mobile and desktop through the signed-in shell:
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
- Narrowed the boot-time `me.php` probe in `app/App.tsx` so fresh anonymous boots no longer hit the session-validation endpoint by default.
- Rebuilt successfully after the boot cleanup.

## 2026-03-14 checkpoint-prayer-meditation-practice-polish
- Performed a real headless visual QA pass on the sacred entry flow:
  - `PreSplash`
  - `Splash`
  - `Welcome`
  - `Naming Ceremony`
  - `Auth`
- Confirmed the current pushed baseline build still passes locally.
- Added a shared inner-screen sacred-shell helper in `app/styles/sacredInnerScreen.ts`.
- Extended the sacred inner-screen system into:
  - `PrayerSetup`
  - `PrayerGuide`
  - `PrayerSession`
  - `MeditationSetup`
  - `PracticeSession` (`I Am`, `I Love`, and Meditation session shell)
- Reworked practice completion/reflection to match the newer sacred-card language.
- Removed temporary local QA fixtures after verification and rebuilt the app cleanly.

## 2026-03-13 checkpoint-inner-screens-and-resilience
- Strengthened pre-auth refresh/back resilience in `app/App.tsx`.
- Preserved anonymous sacred-entry state more deliberately across `SPLASH`, `WELCOME`, `NAMING_CEREMONY`, and `AUTH`.
- Completed the first inner-screen sacred/gold baseline pass on:
  - `Settings`
  - `Stats`
  - `Profile`
  - `Library`
- Kept the Dashboard baseline and sacred-entry standards work aligned with current docs.
- Updated handoff docs:
  - `WORK.md`
  - `app/PROJECT_STATUS.md`
  - `app/CHANGELOG.md`

## 2026-03-08 checkpoint-sacred-entry-ui
- Applied a shared sacred card/layout system across the entry sequence.
- Polished tutorial visuals and improved readability.
- Restored sacred-entry routing in `app/App.tsx` after local drift.
- Restored welcome skip button and splash glass-card treatment after regressions.
- Fixed deleted-account direct-auth registration so the entered name survives into naming/onboarding.
- Updated handoff docs (`WORK.md`, `app/PROJECT_STATUS.md`) to match the current checkpoint.

## v0.1-spine-green
- Establish repo as canonical, ensure clean pushes, ignore OS/build artifacts.
