# Abundance Alchemy Work Log

Last updated: 2026-03-06

## Why this file exists
This is a checkpoint record so work can resume quickly if a session drops.

## Major changes completed

### 1) Admin security hardening
- Added/used shared CSRF/session helpers in `admin/admin_init.php`.
- Enforced `POST + CSRF` for all admin write/destructive actions on:
  - `admin/users.php`
  - `admin/affirmations.php`
  - `admin/wisdom.php`
  - `admin/add-user.php`
  - `admin/edit-user.php`
  - `admin/soundscapes.php`
  - `admin/backgrounds.php`
  - `admin/logout.php` (now POST-only)
- Updated `admin/header.php` logout link to CSRF-protected POST form.

### 2) API security hardening
- Added API session hardening and request-context/CSRF helpers in:
  - `api/session.php`
  - `api/config.php`
  - `api/csrf-token.php` (new)
- Enforced CSRF on mutating authenticated routes:
  - `api/add-user-affirmation.php`
  - `api/delete-user-affirmation.php`
  - `api/sync-progress.php`
  - `api/user-upload-audio.php`
  - `api/logout.php`
- Tightened error handling in auth/reset paths:
  - `api/register.php`
  - `api/request-password-reset.php`
- Removed unused endpoint:
  - `api/admin-upload-audio.php` (deleted)

### 3) App integration/security updates
- Added CSRF token fetch/cache + automatic `X-CSRF-Token` on mutating API calls in:
  - `app/services/api.ts`
  - `app/services/apiService.ts`
- Reminder engine Phase 1 integrated (permission timing, per-practice times, timezone-aware schedule, snooze options).

### 4) Background system and screen consistency
- Unified background slot resolution and fallback behavior across app sections.
- Added section defaults and explicit screen slot mapping support in admin background management.
- Adjusted app layout layering to avoid duplicate full-page + in-card background clashes:
  - entry flow keeps full-bleed behavior
  - core app screens use stage-local background rendering

### 5) Prayer (Omba) flow + media
- Added prayer setup/guide/session flow screens and navigation.
- Added prayer sound selection and volume path in settings/flow.
- Fixed non-playing sound selection and improved runtime handling.

### 6) Audio stability and UX polish
- Replaced unmanaged preview audio playback with managed ambience channel:
  - `app/services/audioManager.ts`
- Added prayer exit safety stop to prevent layered playback:
  - `app/App.tsx`
- Tuned fades for smoother transitions without behavior change:
  - `app/services/audioService.ts`

### 7) UI updates requested
- Dashboard:
  - removed top-right settings gear (bottom nav settings retained)
  - centered sacred orb/wisdom quote block alignment
- Standardized orb usage to one sacred orb system:
  - replaced custom pseudo-orb paths with `BreathingOrb`
  - `app/components/AlchemistAvatar.tsx`
  - `app/components/FocusIntroduction.tsx`
  - `app/components/FocusConfirmation.tsx`

## Deployment notes
- If deploying source files directly, upload changed files to matching folders.
- If deploying built frontend assets, run build in `app/` and upload `app/dist`.

## Quick smoke test checklist
- Admin login/session persistence and logout.
- Admin create/edit/delete in Users/Affirmations/Wisdom.
- Background assignment visible in app for key screens.
- Soundscape switching in Settings and Prayer.
- Enter Prayer flow, change track, exit Prayer, verify no audio overlap.

## Next likely tasks
- Continue card/style consistency across Dashboard, Library, Stats, Profile, Settings.
- Optional: further tighten admin error disclosure (generic UI errors + server logs only).

## Checkpoint: 2026-02-27

### Current stable point
- Latest UI pass is in place and local build passed.
- Current modified frontend source files:
  - `app/components/WelcomeScreen.tsx`
  - `app/components/PersonalGreeting.tsx`
  - `app/components/Dashboard.tsx`
- These changes are not yet committed in git unless committed manually after this checkpoint.

### Latest fixes completed

#### 1) `Welcome.mp3` progress bar
- Fixed the welcome audio slider so it tracks during playback again instead of only jumping at the end.
- Added more robust progress handling using:
  - audio events (`play`, `pause`, `timeupdate`, `loadedmetadata`, `ended`)
  - a short interval fallback for Safari/timing inconsistencies

#### 2) Returning user greeting card
- Updated the returning-user card to match requested structure:
  - title card now says `Abundance Alchemy`
  - body card is darker
  - main message text is white and non-bold
- Current completed-cycle copy now reads:
  - `Karibu Tena.`
  - `Welcome Back`
  - `The Ancestors acknowledge your devotion.`
  - `{Name}, your focus is:`
  - `{Focus}.`
  - `You have completed your cycle.`
  - `Continue with this focus,`
  - `or choose a new one?`

#### 3) Dashboard readability
- Strengthened contrast for:
  - section title chips
  - `days left` chip
- This was specifically to improve readability over mixed/light backgrounds.

### Verified
- `cd app && npm run build` completed successfully on 2026-02-27.

### If work resumes from here
- Resume from visual QA of the updated build after deploy.
- Primary next target:
  - continue consistency polish across post-dashboard screens (`Library`, `Settings`, `Stats`, `Profile`, `Prayer`, `I Am`, `I Love`, `Meditation`)
- Secondary target:
  - if needed, continue Phase 2 prayer work after UI consistency pass

### Deployment reminder
- For frontend-only changes, rebuild in `app/` and upload the latest `app/dist/*`.
- If deploying source for reference, the edited source files remain in:
  - `app/components/WelcomeScreen.tsx`
  - `app/components/PersonalGreeting.tsx`
  - `app/components/Dashboard.tsx`

## Checkpoint: 2026-03-06

### Resume point used
- Continued from the 2026-02-27 UI checkpoint above.
- Verified current working tree only has one live app entry file: `app/App.tsx`.
- Confirmed older root-level `App.tsx` exists only in git history from pre-restructure commits and is not part of the active tree.

### Latest fix completed
- Reconfirmed the active app entry is `app/App.tsx`; older root-level `App.tsx` remains history-only.
- Restored `app/App.tsx` to the pushed sacred-entry behavior:
  - returning-visitor marker/state restored
  - `WelcomeScreen` again receives `isReturningVisitor`
  - gated `Continue to Sign In` actions route back through `PRE_SPLASH -> SPLASH -> WELCOME`
  - auth/session-expiry exits re-enter sacred flow instead of jumping directly to `AUTH`
- Standardized the S1-S4 entry flow screens onto a shared sacred card/layout system:
  - `PreSplash`
  - `Auth`
  - `SacredNamingCeremony`
  - `Onboarding`
  - `TutorialOverlay`
  - `WelcomeScreen`
  - `SplashScreen`
- Updated splash-entry UI after Safari/card regressions:
  - `WelcomeScreen` card contrast strengthened
  - `PersonalGreeting` card contrast strengthened
  - `WelcomeScreen` now always shows the `Skip Invocation` button on the `welcome.mp3` screen
  - `SplashScreen` glass-card treatment restored with backdrop blur
- Tutorial screens received a stronger visual pass and are currently in a better state than the prior checkpoint.

### Next likely check
- Visual QA on Safari/iPhone for:
  - `SplashScreen`
  - `WelcomeScreen`
  - returning-user `PersonalGreeting`
- Visual QA for:
  - `PreSplash`
  - `Auth`
  - `SacredNamingCeremony`
  - `Onboarding`
  - `TutorialOverlay`
- Confirm the sacred entry sequence still behaves correctly for:
  - new user
  - returning signed-in user
  - returning signed-out user
  - session-expired user bounced from protected screens
- Pending design decision:
  - define expected refresh behavior during anonymous pre-auth flow (`PRE_SPLASH`, `SPLASH`, `WELCOME`) before implementing a deeper state fix
- Known console noise still present:
  - expected `401` from `api/me.php` on anonymous boot until boot-validation logic is narrowed

### Verified on 2026-03-06
- `cd app && npm run build` completed successfully after the entry-flow cleanup and splash/welcome UI fixes.
- Additional local builds continued to pass after:
  - shared entry-flow card refactor
  - tutorial polish
  - deleted-account registration flow fix

### Current frontend files touched in this checkpoint
- `app/App.tsx`
- `app/components/Auth.tsx`
- `app/components/Onboarding.tsx`
- `app/components/PreSplash.tsx`
- `app/components/SplashScreen/SplashScreen.tsx`
- `app/components/SacredNamingCeremony.tsx`
- `app/components/TutorialOverlay.tsx`
- `app/components/WelcomeScreen.tsx`
- `app/components/PersonalGreeting.tsx`
- `app/index.css`
- `app/tailwind.config.js`
- `app/styles/sacredCards.ts`

### Additional fix after checkpoint
- Fixed deleted-account direct-to-auth registration flow:
  - `handleAuthRegister` now preserves `account.name` in `sacredName`
  - post-register flow now routes through `NAMING_CEREMONY` instead of jumping straight to `ONBOARDING`
  - when naming completes for an already-registered user, the chosen name is carried into `ONBOARDING` instead of sending the user back to `AUTH`
