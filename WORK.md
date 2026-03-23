# Abundance Alchemy Work Log

Last updated: 2026-03-20

## Why this file exists
This is a checkpoint record so work can resume quickly if a session drops.

## Checkpoint: 2026-03-20

### Actual resume point
- The workspace resumed after a machine restart with the broader prayer/backend work still present locally.
- The prior handoff docs had drifted behind the working tree and did not mention the newer companion-page assets.
- Current reality is better reflected by:
  - `app/PROJECT_STATUS.md`
  - `app/CHANGELOG.md`
  - this checkpoint section

### Major work currently present in the tree

#### 1) Backend cleanup + prayer-content system
- Shared helper layer exists in `api/helpers.php` for:
  - JSON/error responses
  - method enforcement
  - JSON parsing
  - session identity
  - table/ownership inspection
  - prayer table bootstrap + default seeding
- Prayer backend endpoints exist for:
  - curated content: `api/get-prayer-content.php`
  - user prayers: `api/get-user-prayers.php`
  - saving user prayers: `api/add-user-prayer.php`
  - deleting user prayers: `api/delete-user-prayer.php`
- Admin prayer management exists in:
  - `admin/prayers.php`

#### 2) Frontend prayer/practice work
- `PrayerGuide` now loads backend guide steps with frontend fallback.
- `PrayerSession` now loads backend curated prayers, merges in personal prayers, and supports save/delete flows.
- `PracticeSession` and related inner sacred-shell work remain heavily modified from the recent UI pass.
- Supporting API/type changes are present in:
  - `app/services/api.ts`
  - `app/types.ts`

#### 3) Standalone companion pages
- Local companion pages exist in:
  - `app/companion-pages/prayer.html`
  - `app/companion-pages/meditation.html`
  - `app/companion-pages/assets/companion-pages.css`
- These pages are real editorial/static content, not placeholders.
- Image folder scaffolding also exists for prayer and meditation under:
  - `app/companion-pages/assets/images/prayer/`
  - `app/companion-pages/assets/images/meditation/`
- At the moment, the image folders mostly contain placeholder `.gitkeep` files.

### Important caveat
- The companion pages are not yet wired into the React app or linked from the active app code.
- `app/companion-pages/` also contains macOS `._*` sidecar files that should be removed before commit/deploy.

### Best next steps from here
1. Verify the prayer tables/endpoints/admin UI against the live runtime/database.
2. Decide whether the companion pages are meant to be:
   - committed as standalone static pages
   - integrated into the app/site navigation
   - deployed separately from the React app
3. Clean the macOS sidecar files from `app/companion-pages/`.
4. Run final Safari/real-device QA on the signed-in routes.
5. Resolve the intentionally deferred flow glitch, then checkpoint/commit/deploy.

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

---

## Checkpoint: 2026-03-08

### Work completed this session

- Dark-text-on-dark-background audit across all S1–S4 screens.
  - Root cause confirmed: `TempleSpace` uses `bg-white` base when `theme='light'` is passed in from App.tsx, which lightens the 90%-opacity card and makes slate-colored text unreadable.
  - Fix applied across all affected screens: `SacredNamingCeremony`, `Auth`, `TutorialOverlay` now force `theme="dark"` on SacredBackground and use hardcoded `text-white` instead of theme-conditional variables.
  - All body/caption text across `WelcomeScreen`, `Onboarding`, `SacredNamingCeremony`, `TutorialOverlay` brightened from slate-300/400 to slate-200 or white.

- Bilingual (Swahili) alternating button on SplashScreen:
  - "I Am Ready For Transformation" crossfades to "Niko Tayari Kubadilika" every 3.5 seconds using CSS opacity transitions on stacked spans.
  - min-w-[220px] on the button prevents layout shift during swap.

- Auth screen hardened to always-dark ceremonial path:
  - `getContentCardClasses` now always returns `SACRED_BODY_CARD` (dark) regardless of user theme.
  - `fallbackBackgroundType` changed from non-existent `SECTION_ENTRY` to `SPLASH`.

- Onboarding Focus step (Step 2/4) tightened:
  - Header reduced to `text-xs md:text-sm font-medium`.
  - Focus option rows: padding reduced (`px-3 py-2`), gap tightened (`gap-1`), labels unbolded (`font-normal`).
  - No longer scrolls on desktop browser.

- Tutorial screens: all body text changed to emerald green (`text-emerald-300` / `text-emerald-200`) for readability against the dark glass card. Amber accents preserved. Title card ("Abundance Alchemy") stays amber-500 throughout, consistent with the full entry flow.

- Full frontend/backend API audit completed. No PHP changes needed. Two pre-existing data gaps documented: sacred name not persisted to DB after naming ceremony, and new background slots (NAMING_CEREMONY, ONBOARDING, TUTORIAL) need admin panel entries for images to show.

### Verified on 2026-03-08
- `cd app && npm run build` passed clean.
- Committed and pushed as: `checkpoint: sacred entry ui system and tutorial polish`
- Branch `checkpoint_prayer_phase1_and_categories_2026_02_20` up to date with remote.

### Next session: Dashboard (S5+)
- Begin sacred design pass on Dashboard and inner app screens.
- Swahili language layer additions (remaining S1–S4 touch points not yet done).
- Investigate tutorial → Dashboard blank screen transition (known issue).

### Reconciliation note on 2026-03-09
- Code and docs were rechecked after additional local edits.
- `app/App.tsx` was brought back in line with the documented checkpoint for post-register flow:
  - registration again routes through `NAMING_CEREMONY` before `ONBOARDING`
- Remaining uncommitted work is now primarily:
  - `app/components/Dashboard.tsx` visual polish
  - minor copy/typography refinement in `app/components/Onboarding.tsx`

### Dashboard pass on 2026-03-09
- Continued Option 1 Dashboard polish in the current sacred/gold direction.
- Established a stronger S5 visual baseline in `app/components/Dashboard.tsx`:
  - added a centered page shell and framed section containers
  - strengthened wisdom, focus, practice, meditation, and Temple Sound card hierarchy
  - tightened mobile spacing and CTA rhythm without changing dashboard behavior
  - upgraded dark-mode contrast with more solid amber-edged card treatments
- No flow logic was changed in this pass; practice handlers, audio controls, and navigation behavior remain intact.
- Build verification after the Dashboard pass:
  - `cd app && npm run build` passed
  - existing Vite chunk-size warning remains unchanged

### Recommended next working area
- Use `Dashboard.tsx` as the S5 style baseline.
- Continue the same visual system across the lower-risk inner-screen cluster next:
  - `Settings`
  - `Stats`
  - `Profile`
  - `Library`

### Fresh-browser signup flow fix on 2026-03-09
- Fixed duplicate name-flow routing in `app/App.tsx`.
- Fresh new users who already completed `NAMING_CEREMONY` before registering no longer get routed back into `NAMING_CEREMONY` after `Auth` signup.
- `handleAuthRegister` now:
  - preserves the existing sacred name when one already exists
  - routes fresh-path signups directly to `ONBOARDING`
  - still routes direct-auth/deleted-account registration through `NAMING_CEREMONY` when no sacred name exists yet
- Verification:
  - `cd app && npm run build` passed
  - existing Vite chunk-size warning remains unchanged

### Entry-flow correction on 2026-03-09
- Fixed incorrect anonymous/deleted-user handling in `app/services/api.ts`.
- Root cause:
  - the shared API client treated every `401` like a forced logout
  - that included anonymous `me.php` boot checks and failed `login.php` attempts
  - result: fresh users could be misclassified as returning visitors and failed sign-in attempts could bounce the app back into sacred entry
- Fix applied:
  - `401` responses from `me.php`, `login.php`, `register.php`, `request-password-reset.php`, and `csrf-token.php` no longer dispatch global logout behavior
  - protected authenticated endpoints still clear auth on real session loss
- Expected flow after this fix:
  - fresh browser / no site data: `PRE_SPLASH -> SPLASH -> WELCOME -> NAMING_CEREMONY -> AUTH (Sign Up) -> ONBOARDING`
  - deleted-account user who incorrectly tries `Sign In` should now stay on `Auth` with an auth error instead of being bounced back to `Splash`

### Auth flow modernization on 2026-03-09
- Reworked auth to use explicit app-owned auth intent instead of inferring login/register from `initialName`.
- `app/App.tsx` now persists `authFlowMode` in session storage:
  - fresh naming path sets `register`
  - returning/signed-out path sets `login`
  - reset/start-over clears the auth-flow hint
- `app/components/Auth.tsx` is now a controlled screen:
  - `App.tsx` passes `mode` and `onModeChange`
  - auth no longer guesses the starting tab from leftovers in component state
  - mode switches clear only the auth-form state needed for a clean transition
- UX improvement:
  - added explicit `Sign Up` / `Sign In` sacred segmented control at the top of Auth
  - failed `Sign In` now stays on Auth with a clearer message guiding users to `Sign Up` when no active account exists
- Resulting professionalized auth behavior:
  - new user flow is explicitly registration-led
  - returning/signed-out user flow is explicitly sign-in-led
  - failed auth no longer collapses back into the sacred entry loop
- Verification:
  - `cd app && npm run build` passed
  - existing Vite chunk-size warning remains unchanged

### Standards pass checklist on 2026-03-09
- Goal:
  - bring the sacred entry and transition sequence up to a cleaner modern product standard without flattening the ceremonial tone
- Standards-pass checklist:
  - reduce repeated identity friction
  - provide real auth recovery/help affordances
  - improve invocation fallback and accessibility
  - replace fake-loading language with truer ritual-transition language
  - remove tutorial copy that teaches around app weaknesses
  - defer the deeper browser-refresh/navigation resilience pass as a separate architecture item

### Standards pass implemented on 2026-03-09
- `app/components/Onboarding.tsx`
  - users with an already-established sacred name now skip the redundant name-confirmation step and begin at focus selection
- `app/components/Auth.tsx`
  - added controlled `Sign Up` / `Sign In` segmented auth switch
  - added real `Forgot Password?` flow using the existing password-reset API
  - improved recovery messaging for failed sign-in
- `app/components/WelcomeScreen.tsx`
  - added autoplay failure fallback with explicit `Play Invocation`
  - added a readable invocation text toggle for accessibility and control
- `app/components/SplashScreen/SplashScreen.tsx`
  - softened the staged progress language from fake loading semantics to ritual-opening language
- `app/components/TutorialOverlay.tsx`
  - removed the explicit warning telling users not to refresh or use browser back
- `app/services/api.ts`
  - added password-reset API support

### Remaining standards item after this pass
- Still pending as its own deeper architecture pass:
  - make browser refresh / browser back behavior truly resilient across the pre-auth journey rather than merely avoiding weak copy around it

### Verified after standards pass
- `cd app && npm run build` passed
- existing Vite chunk-size warning remains unchanged

### Pre-auth resilience pass on 2026-03-12
- Strengthened `app/App.tsx` refresh/back behavior across the anonymous sacred-entry path.
- Added intentional resume handling for the pre-auth flow:
  - `SPLASH`
  - `WELCOME`
  - `NAMING_CEREMONY`
  - `AUTH`
- Added dedicated pre-auth sacred-name persistence so the chosen name can survive refresh without bleeding into unrelated flows.
- Split authenticated resume handling from anonymous resume handling so dashboard/session restoration no longer shares the same coarse path as anonymous boot.
- Synced major app modes into browser history state so browser back/forward behaves more predictably instead of dumping the user into mismatched entry states.
- Verification:
  - `cd app && npm run build` passed
  - existing Vite chunk-size warning remains unchanged

### Inner-screen polish pass on 2026-03-12
- Continued the Dashboard sacred/gold system into the first post-dashboard cluster:
  - `app/components/Settings.tsx`
  - `app/components/Stats.tsx`
  - `app/components/Profile.tsx`
  - `app/components/Library.tsx`
- `Settings.tsx`
  - rebuilt into framed sacred sections with clearer hierarchy for appearance, audio, reminders, and actions
  - preserved all existing controls and handlers while improving readability and spacing
- `Stats.tsx`
  - upgraded from a flat utilitarian screen into a proper journey snapshot using the sacred-card system
- `Profile.tsx`
  - aligned profile identity details and key metrics to the Dashboard baseline
- `Library.tsx`
  - reorganized into clearer sections for soundscapes, uploaded audio, affirmations, and gratitude logs
  - improved composer/readability without changing library behavior
- Verification:
  - `cd app && npm run build` passed
  - existing Vite chunk-size warning remains unchanged

### Next session
- Visual QA:
  - sacred entry refresh/back behavior
  - `Dashboard`
  - `Settings`
  - `Stats`
  - `Profile`
  - `Library`
- Then continue the sacred-system pass into:
  - `Prayer`
  - `Meditation`
  - `I Am`
  - `I Love`
