# Prayer Section Design Specification

## Overview
This document outlines the complete prayer section user experience, covering the Setup, Guide, Session, and Save/Delete flows. It serves as a living reference for design, copy, interaction, and accessibility considerations, allowing updates without impacting other app sections.

## User Goals
- Quickly select or customize a prayer tradition/path.
- Understand how to pray via clear, concise guide steps.
- Read or repeat session prayers with visual and audio support.
- Save personal prayers for later use.
- Remove unwanted saved prayers.
- Navigate back to Dashboard or Home at any point.

## Screen-by-Screen Breakdown

### 1. Prayer Setup Screen
**Purpose:** Choose prayer tradition and optionally customize profile (intent, tone, language, style) and soundscape.

**UI Elements**
- Header pill: "Prayer Setup"
- Back button (top-left) → Dashboard
- Hero card: 
  - Section kicker: "Choose Your Duration" (centered, regular weight)
  - Clock icon (violet-400 light, violet-300 dark)
  - Duration selector (grid of preset times + custom slider)
- Soundscape card:
  - Section kicker: "Soundscape (Acoustic Alchemy)" 
  - Music icon (violet-400 light, violet-300 dark)
  - Title: "Choose the Atmosphere" (theme‑aware violet‑700 light / violet‑300 dark)
  - List of available soundscape cards (selected state highlighted)
- Intent/Tone/Language/Style selection chips (optional, collapsed by default)
- Continue button (full‑width, primary style) → Prayer Guide
- Optional: Open Prayer Companion Page link (centered, secondary style) at bottom

**Interaction Flow**
- User selects a path → profile auto‑fills with defaults for that path (can be edited).
- User adjusts duration, soundscape, and optional profile fields.
- Tapping Continue validates selection and navigates to Prayer Guide, passing chosen path and profile.

**Accessibility**
- All interactive elements have aria‑labels.
- Sufficient color contrast (WCAG AA) for text/icons.
- Focus order logical: back → hero → soundscape → profile chips → continue.

### 2. Prayer Guide Screen
**Purpose:** Display the step‑by‑step guide for the selected tradition ("How to Pray in This Flow").

**UI Elements**
- Header pill: "Prayer Guide"
- Back button → Prayer Setup
- Hero card (optional orientation/description)
- Guide Steps card:
  - Section kicker bar: dark‑slate‑800 background, white uppercase text "How to Pray in This Flow"
  - List of steps (4‑6 items), each with:
    - Numbered circle (theme‑aware accent background, white text)
    - Step description (body‑text color, readable line‑height)
- Begin Prayer button (full‑width, primary) → Prayer Session

**Interaction Flow**
- Steps are read‑only; user can scroll if list exceeds viewport.
- Tapping Begin Prayer validates and proceeds to Prayer Session, carrying forward path, profile, duration, soundscape.

**Accessibility**
- Numbered circles have aria‑label "Step X of Y".
- List uses semantic `<ul>`/`<li>`.
- Touch targets ≥48 dp.

### 3. Prayer Session Screen
**Purpose:** Present the curated prayer texts (and optional user‑saved prayers) for the user to read/repeat.

**UI Elements**
- Header pill: "Prayer Session {label}"
- Back button → Prayer Guide
- Prayer Text card:
  - Black background with white text (high contrast)
  - Optional user‑prayer title in emerald‑300
  - Prayer line(s) in white, readable size
- Prayer Profile chip row (Intent, Tone, Language, Style)
- Sacred Flow card (guide steps repeated as reference, smaller chips)
- Add Your Own Prayer section:
  - Title input (optional)
  - Body textarea (4 rows)
  - Save Personal Prayer button (primary, disabled until body non‑empty)
- Saved Personal Prayers list (if any):
  - Each item shows optional title and body, with Delete (trash) icon button.
- Navigation controls:
  - Next Prayer button (primary, icon: rotate‑ccw)
  - Complete Prayer button (secondary, icon: check‑circle‑2)

**Interaction Flow**
- User reads current prayer line.
- Tap Next Prayer to advance through curated list (loops to start after last).
- Tap Complete to finish session → returns to Prayer Guide (or Dashboard depending on configuration).
- Tap Save Personal Prayer to store custom text locally and/or via API.
- Tap Delete on a saved prayer to remove it from active list.

**Accessibility**
- Prayer text uses large, legible font with ample line spacing.
- All buttons have accessible names.
- Live region announces prayer index changes (if implemented).

### 4. Save / Delete Flows (Modals/Toasts optional)
- On successful save: toast “Prayer saved.” or inline status.
- On delete: confirmation dialog (“Remove this saved prayer?”) then removal.
- Errors: display user‑friendly message (e.g., “Unable to save; stored locally instead.”).

## Copy & Tone Guidelines
- Headers: Title case, concise.
- Section kickers: Uppercase, tracking‑wider, font‑extrabold.
- Body text: Sentence case, clear, instructional, encouraging.
- Buttons: Sentence case, action‑oriented (“Begin Prayer”, “Save Personal Prayer”, “Next Prayer”).
- Links: Lowercase, underline on hover.
- Error messages: Plain language, no jargon, suggest next step.

## Interaction & Motion Guidelines
- Use sacred bell sound on all taps/clicks (via `buttonSoundService.play()`).
- Subtle scale transitions on tap (press 0.98, release 1.02).
- No motion that triggers vestibular sensitivity; keep animations < 500 ms, respect `prefers-reduced-motion`.
- Radial light and breathing orb remain global sacred elements; do not remove or alter unless explicitly targeting those components.

## Edge Cases & Error Handling
- No soundscape available → show fallback list + message “No tracks found”.
- Empty prayer body → disable Save button, show hint “Please write a prayer”.
- Network failure on save → fall back to localStorage, inform user via toast.
- Duplicate saved prayers → allow duplicates (user‑intent) but optionally warn.
- Clearing all saved prayers → UI shows empty state with encouragement to add one.

## Open Questions / TODOs
- [ ] Determine whether Complete Prayer should return to Dashboard or Prayer Guide (currently returns to Guide).
- [ ] Consider adding a “Favorite” star to saved prayers for quick access.
- [ ] Evaluate need for a prayer‑category filter in the admin UI (beyond guide_step/session_prayer).
- [ ] Verify sessionStorage vs localStorage behavior for prayer profile across refresh/tab‑close.

## Notes for Maintainers
- This file is **documentation only**; changes here do not affect code unless explicitly copied into components.
- When updating the prayer section, keep this spec in sync.
- Use the sections above as checklists during QA or design reviews.

---
*Last updated: 2026‑05‑01*  
*Author: Opencode (big‑pickle)*