# Abundance Alchemy App V2 — Project Status

## Canonical repo
https://github.com/Peacefulprayer/abundance-alchemy-v2-app

## Current phase
Phase 1 — Stabilize + unify foundation (tagged milestones)

## Non-negotiables
- Button tap tone is canonical and must be used across the app.

## Current state
- main is synced to origin.
- .gitignore updated to prevent macOS/build artifacts from being committed.

## Known issues (from prior work)
- App sometimes blank screen when moving from tutorial to Dashboard.
- iOS Safari overscroll gap.
- Header overlap / dashboard bottom cutoffs on some screens.
- Missing back/cancel on setup screens.
- Auth/reset-password return link should point users back to app.
- Maktaba UI text/button overflow.
- Admin routing: /abundance-alchemy/admin

## Next actions
1) Identify canonical button sound file path and centralize playButtonTap().
2) Confirm current app flow: PRE_SPLASH -> SPLASH -> WELCOME (welcome.mp3) -> tutorial -> dashboard.
3) Resolve blank screen root cause and add guardrails.
