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