# Abundant Alchemy App V2 — Shared Model Status

As of: 2026-11-15 (documentation baseline; no fresh runtime or source tests performed during this update)

## Overall state
**Recovered and automated checks passed; not yet a verified release candidate.** Continue from recovered Mac candidate, not the older original source or an assumed deployment.

## Verified in the November 4 handoff
- Permanent reconciled recovered candidate created; original checkout preserved.
- 48 frontend tests passed, TypeScript check and direct Vite build passed.
- PHP syntax check passed for 55 files; 9 offline backend cases passed.
- Recovered changes include chosen-name saving, account-specific progress persistence, focus cycle restoration, personal focus card, sign-in shortcut, and confirmed/retry sign-out.
- Application code contains principal frontend screens, backend account/content endpoints and separate companion pages.

## Later user-reported operational progress
- Windows mini successfully mapped a Mac network share to drive `Z:`.
- Expected candidate source: `Z:\output\recovery-2026-11-04\source`.
- Handoff file uploaded into existing ChatGPT project **Abundant Alchemy App V2**; browser/Mac app display the handoff and new conversation consistently.
- These do not establish whether the source is currently runnable from Windows or whether a clean C: working copy exists.

## Not yet verified
- Windows PHP installation and MariaDB (or compatible SQL) installation/service status.
- Local isolated runtime with no production API/data access.
- Reviewed SQL migrations for persisted focus-cycle fields.
- Actual DB-backed user creation, login, sessions, CSRF, ownership and admin separation.
- User progress and focus restored across browsers/devices.
- Safari/desktop/mobile ritual and managed audio behavior against the recovered candidate.
- Backup/restore and rollback procedure.
- Current staging deployment parity and acceptance of the exact recovered candidate.

## Immediate next milestone
**Private DB integration on isolated Windows working copy**, preserving authoritative Mac source.

Required evidence for completion:
1. Exact source version and working copy path (with Git status/checksum as appropriate).
2. Runtime/tool versions; local-only service binding and safe sanitized environment configuration (never print secrets).
3. Reviewed migration list; seeded synthetic user/admin fixtures.
4. Repeatable tests: sign in -> choose focus -> complete practice -> persist to DB -> sign out -> sign in on second device/browser -> verify restored state; verify unauthorized access denied.
5. Test logs and failures summarized without secrets; rollback described.

## Change log
- 2026-11-04: recovery and automated offline verification documented.
- 2026-11-04 onward: Mac project share mapped to Windows Z: (user reported).
- 2026-11-15: model-facing status/instructions prepared from existing evidence. No source, database or deployment edits asserted.

## On completion of a milestone
Append: date, machine, source/branch/commit, exact commands run, results, files changed, remaining blockers, and next action. **Never silently mark a reported state as newly verified.**