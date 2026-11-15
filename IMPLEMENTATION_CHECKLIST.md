# Abundant Alchemy App V2 — Completion Checklist

Use `[x]` only with actual evidence; put date, command/log, source version next to completed entries. Historical offline checks are recorded in `PROJECT_STATUS_FOR_MODELS.md`, not treated as live integration success.

## Phase A — Source and isolated environment
- [ ] Confirm Mac authoritative recovered directory and read-only inventory.
- [ ] Confirm Windows `Z:\output\recovery-2026-11-04\source` is accessible.
- [ ] Create isolated working copy on Windows C:; exclude generated assets, dependencies, secrets, and personal data.
- [ ] Record source identity, Git status or manifest checksums; ensure Mac original unchanged.
- [ ] Inventory Windows PHP, Composer (if used), MariaDB/MySQL, web server, Node/npm and existing services.
- [ ] Confirm development API settings cannot reach production; isolate networking and config.

## Phase B — Database and authorization
- [ ] Review schema dump and actual required migrations, especially focus cycle fields.
- [ ] Initialize private local DB with synthetic fixtures only.
- [ ] Verify registration/login/logout, sessions, CSRF, data ownership and admin access rules.
- [ ] Validate progress/focus persistence and date/time-zone behavior against actual DB.
- [ ] Check negative paths: invalid input, missing schema, lost DB, duplicate requests, wrong account.

## Phase C — Experience and regression
- [ ] Run current frontend test suite, TypeScript checks and direct Vite build; record commands/output.
- [ ] Run PHP syntax/backend integration tests against the local fixture environment.
- [ ] Test splash, naming, onboarding, dashboard and focus cycles.
- [ ] Verify sacred bell and Breathing Orb remain intact.
- [ ] Test I Am, I Love, meditation, Omba/prayer, Library, audio, companion pages, settings and stats.
- [ ] Confirm progress survives logout and is restored on another browser/device.
- [ ] Test Safari and target mobile/desktop experiences.

## Phase D — Release acceptance
- [ ] Review only intended source changes; commit with narrow staging and rollback plan.
- [ ] Produce reproducible release artifact with sanitized config.
- [ ] Confirm backups restore and rollback works.
- [ ] Deploy reviewed candidate to staging; test same artifact and admin isolation there.
- [ ] Document defects resolved, remaining scope, acceptance evidence and release decision.

## Working agreements
Avoid broad redesign, unrelated AI tooling, autonomous changes to production, force-push, and undocumented migration. Keep app design, rituals, audio, and companion content intact.

## Immediate QA gate — focus cycles (before DB integration)
- [x] User reported applying corrected local calendar-day calculation to recovered `app/services/focusCycle.ts` (2026-11-15); original copy saved as timestamped backup.
- [x] User reported **5/5 existing focusCycle tests passed** using Vitest 4.1.4 (2026-11-15; not an independently rerun full suite).
- [ ] Add and run future-start, invalid-date, cross-month/year, leap-day, spring/fall DST tests; verify daily/weekly/monthly and completion semantics.
- [ ] Run **entire** frontend Vitest suite and TypeScript no-emit check; record versions, exact command and outputs.
- [ ] Compare restored behavior against documented Nov 4 semantics, especially start day, last active day, day after completion, and 30-day monthly duration.

## Independent contributor work packages
- [ ] **A / QA:** own focus-cycle test additions and TypeScript/Vitest evidence; changes restricted to tests unless a confirmed defect is reproduced.
- [ ] **B / runtime:** own isolated Windows C: PHP/MariaDB installation/config report; no live production API/data.
- [ ] **C / auth-data:** own reviewed schema/migrations and private login/progress/ownership integration tests; synthetic fixtures only.
- [ ] **D / experience:** own bell/Orb/audio/companion pages cross-browser regression matrix; don't alter design.
- [ ] **E / release:** own staging artifact, backup/restore and rollback documentation after A–D pass.
- [ ] Assign an owner and branch/issue for each lane; avoid overlapping source writes, and require evidence-linked PRs.
