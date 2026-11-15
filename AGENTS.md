# Abundant Alchemy App V2 — Agent Instructions

Updated: 2026-11-15. Source of truth: documented November 4 recovery and subsequent confirmed Mac-to-Windows mapped-drive setup. **This document is a handoff draft, not proof of a new runtime audit.**

## Mission
Finish the existing application, safely and incrementally. Do not restart recovery, redesign the app, audition local models, or create another app. Prioritize a real private PHP/MariaDB integration environment, end-to-end account/data tests, repeatable builds, and staging acceptance.

## Authoritative locations
- Mac project root: `/Volumes/Alchemy/abundance-alchemy-v2`
- **Recovered working candidate**: `/Volumes/Alchemy/abundance-alchemy-v2/output/recovery-2026-11-04/source`
- Mac recovery report: `/Volumes/Alchemy/abundance-alchemy-v2/output/recovery-2026-11-04/RECOVERY-REPORT.md`
- Completion assessment: `/Volumes/Alchemy/abundance-alchemy-v2/output/assessment-2026-11-04/APP-COMPLETION-ASSESSMENT.md`
- Prior handoff: `/Volumes/Alchemy/abundance-alchemy-v2/Abundance_Alchemy_V2_Handoff.md`
- Windows mini mapped share: `Z:`; reported candidate: `Z:\output\recovery-2026-11-04\source`. **Verify path and read access on the target machine before using.**
- GitHub: `https://github.com/Peacefulprayer/abundance-alchemy-v2-app` (repository may lag recovered source)
- Staging: `https://staging.abundantthought.com/abundance-alchemy/admin` (do not assume the recovered candidate is deployed)

## Technical design
- Frontend: React + Vite + TypeScript; backend: PHP + MySQL/MariaDB-compatible database.
- Existing: ceremonial entry/naming/auth, dashboard, I Am, I Love, meditation, Omba/prayer, Library, profile/settings/stats, content administration, progress/focus cycles, managed audio, companion pages.
- Preserve sacred bell, Breathing Orb, ceremonial entry and identity, dark/glass/gold aesthetic, separate companion pages under `/abundance-alchemy/companion-pages/`.
- Do not introduce unsolicited chatbot, simulated ancestor, major redesign, or optional scope in the core release.

## Nonnegotiable safety
1. **Do not modify the original Mac checkout** or overwrite the recovered candidate without an explicit reviewed change plan. Work on an isolated copy/branch with backups.
2. No blanket `git add .`, force-push, auto-deploy, or staging against unreviewed artifacts.
3. Never copy or commit `config.local.php`, `.env.local`, real credentials, production personal data, database dumps with user records, `node_modules`, `dist`, logs, or generated artifacts.
4. Do not run local tests against a production API. Check Vite environment precedence and all API targets before starting a development server.
5. Review PHP schema and migrations before any SQL write. Historical SQL dump has 17 CREATE TABLE statements but lacks recovered cycle fields. Never improvise migrations.
6. Use a private local database and synthetic users. Ensure normal users cannot access admin actions; verify ownership and CSRF/session boundaries.
7. Read scripts before executing them. The old `npm run build` wrapper was reported to delete `._*` files recursively; use the direct Vite executable only after inspecting package/scripts and working copy.
8. Preserve existing audio/bell/orb interactions and test them on actual devices.
9. Do not mistake earlier test results or a documented path for a fresh verification.

## Evidence from November 4 recovery (historical, NOT rerun here)
- 48 frontend tests passed across 9 files; TypeScript check and direct Vite build passed.
- 55 PHP files passed syntax checks; 9 offline backend fixture cases passed.
- Original tracked/runtime checksums were reported unchanged.
- These do **not** establish live DB, authentication, CSRF, multi-device persistence, deployment, or Safari acceptance.
- Windows mini inventory dated Nov 4 reports Windows 11 Pro Insider Preview, 63.8 GB RAM, Iris Xe, C: NTFS and D: exFAT. It did **not** verify PHP/MariaDB installations. More recent state may differ.
- Mac-to-Windows mapped Z: access was later reported successful; exact recovered source access and isolated C: copy are not independently verified in this chat.

## How to contribute
1. Read `Abundance_Alchemy_V2_Handoff.md`, recovery README/report, completion assessment, this file, and `IMPLEMENTATION_CHECKLIST.md`.
2. Inspect actual filesystem, Git status, environment configuration, schema and available test/runtime commands **read-only first**.
3. Report blockers only when observed; do not ask the owner to repeat already verified setup.
4. Make minimal focused changes on isolated working copy. Include rationale, exact changed paths, tests executed/results, and rollback guidance.
5. Distinguish verified facts, inherited reports, assumptions, and unresolved risks.
6. Update `PROJECT_STATUS_FOR_MODELS.md` with evidence and date after each completed milestone; keep unresolved work visible.

## First authorized implementation milestone
Verify mapped access to recovered source; create isolated Windows C: working copy excluding private config, dependencies, generated files, and original checkout. Inspect available PHP/DB runtime and schema; configure an isolated MariaDB database with synthetic fixtures; execute a complete cross-device persistence journey. **No production connections.**

## Definition of done
One versioned source and reproducible artifact; required real DB and ownership/auth flows pass; bell/orb/audio and companion pages work; cross-device persistence is verified; backups/restores and rollback are tested; same artifact passes staging acceptance.


## Collaborator work allocation (choose one lane)
Before starting, declare a lane in an issue/PR and list the exact paths you intend to edit. The GitHub default branch may **not** contain the recovered working candidate, so review the source manifest/version first and never cherry-pick blindly.

| Lane | Files/area to inspect (verify actual paths) | Deliverable | Acceptance evidence |
| --- | --- | --- | --- |
| A — Focus-cycle QA | `app/services/focusCycle.ts`, `app/src/test/focusCycle.test.ts`, nearby tests | Future-start/DST/timezone regression tests; no speculative rewrite | Full Vitest + TypeScript results; tested TZ settings; source diff |
| B — Local runtime | Windows mini C: isolated copy, runtime/config and scripts | Private PHP/MariaDB test environment, no production routes | Versions, localhost binding, safe config, repeatable start/stop commands |
| C — Data and auth | `api/`, schema/migration files, auth/progress code | Reviewed migrations and real-DB account/ownership test fixtures | Passing login/CSRF/admin-isolation/progress scenarios; rollback |
| D — Experience | UI/practice/audio/companion pages | Cross-browser/device accessibility and regression report | Bell/Orb/audio/screens checklist, browser/device/version details |
| E — Release | Build scripts, deployment manifests, backup docs | Reproducible sanitized staging candidate and rollback | Artifact hash, backup/restore proof, staging acceptance |

Rules: pick a lane only after verifying current source; create a scoped branch/PR; don't edit shared Mac files concurrently; link dependent issues; note owner and status; submit tests and handoff notes. The user approves any production writes, migrations, destructive actions, and release changes. PR descriptions must explicitly state whether changes target recovered candidate or older GitHub source.

## Most recent local report — November 15
The user ran a read-only-inspected correction to the recovered candidate's `app/services/focusCycle.ts`, restoring local date-component normalization using `Date.UTC` and clamping elapsed days to zero. User-provided Vitest output: `src/test/focusCycle.test.ts`, **5 tests passed** with Vitest 4.1.4. Backup: `focusCycle.ts.backup-20261115-135608`. This is not a committed GitHub patch and has **not** been validated with new DST/future-start tests, full suite, TypeScript or integration tests. Do not reapply blindly.
