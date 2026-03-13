# Changelog (human-readable)

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
