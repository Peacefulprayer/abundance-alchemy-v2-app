# Abundance Alchemy App Flow

Last updated: 2026-02-24

## Quick Reference Format
Use this format when describing issues or requests:

- `Stage`: high-level area of the app journey
- `Mode`: exact `AppMode` in code
- `Screen`: user-facing screen name

Example:
- `S2 Welcome -> WELCOME -> Welcome.mp3 screen`

## Stage Map

### S1 Entry
- `PRE_SPLASH` -> Pre-Splash
- `SPLASH` -> Splash Intro

### S2 Welcome
- `WELCOME` -> Welcome.mp3 screen

### S3 Identity
- `NAMING_CEREMONY` -> Sacred Naming
- `AUTH` -> Login / Register
- `RETURN_PORTAL` -> Returning user bridge

### S4 Orientation
- `ONBOARDING` -> Focus setup
- `TUTORIAL` -> Guided tutorial

### S5 Hub
- `DASHBOARD` -> Main home hub

### S6 Practice

#### S6A I Am
- `PRACTICE` with `PracticeType.MORNING_IAM`

#### S6B I Love
- `PRACTICE` with `PracticeType.EVENING_ILOVE`

#### S6C Meditation
- `MEDITATION_SETUP` -> setup
- `PRACTICE` with `PracticeType.MEDITATION`

#### S6D Prayer (Omba)
- `PRAYER_SETUP` -> path + audio selection
- `PRAYER_GUIDE` -> instructions
- `PRAYER_SESSION` -> prayer content

### S7 Support / Account
- `LIBRARY` -> Maktaba (Library)
- `SETTINGS` -> app settings
- `STATS` -> user stats
- `PROFILE` -> profile screen

## Typical User Paths

### New user
`S1 Entry -> S2 Welcome -> S3 Identity (Naming/Auth) -> S4 Orientation -> S5 Hub -> S6/S7`

### Returning user
`S1 Entry -> S2 Welcome -> S3 Identity (Return Portal) -> S5 Hub -> S6/S7`

## Reporting Template
Copy/paste this when reporting an issue:

- `Path`: (example: `S1 -> S2 -> S3`)
- `Stage/Mode`: (example: `S2 / WELCOME`)
- `Expected`:
- `Actual`:
- `Repro steps`:
- `Audio state` (if relevant): (ambient, narration, prayer track, etc.)
