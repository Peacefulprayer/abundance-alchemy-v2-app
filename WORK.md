# Abundance Alchemy Work Log

Last updated: 2026-02-24

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
