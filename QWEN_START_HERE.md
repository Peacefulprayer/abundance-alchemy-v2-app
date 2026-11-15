# Qwen3 Coder — Authoritative Continuation Contract

Updated: 2026-11-15. This is the **single entry point** for Qwen3 Coder Workstream A. The instruction is to execute and report, not to produce another narrative summary.

## 0. Known facts and evidence levels

- Mac project root: `/Volumes/Alchemy/abundance-alchemy-v2`.
- Recovered candidate: `/Volumes/Alchemy/abundance-alchemy-v2/output/recovery-2026-11-04/source`.
- Exact tested implementation: `<recovered>/app/services/focusCycle.ts`; 2026-11-15 user applied local calendar-date normalization with `Date.UTC(localYear, localMonth, localDay)`, `elapsedDays = Math.max(0, ...)`.
- User-run 2026-11-15 test: `<recovered>/app/src/test/focusCycle.test.ts` **5/5 passed**, Vitest 4.1.4. No full suite or TypeScript rerun was supplied.
- Qwen historical workspace: `/Volumes/Alchemy/abundance-alchemy-v2/output/local-agent-check-qwen3-coder-2026-11-01`; Qwen claimed uncommitted `focus-cycle.js` and `focus-cycle.test.js`. These are *not* the production TS source/test paths. Qwen says new tests were written, but file contents, diff and execution logs were never supplied; their quality/status is unverified.
- GitHub `main` may not represent the recovered candidate. Documentation is on branch `docs/model-handoff-2026-11-15` and draft PR #1. Do not merge source from `main` blindly.
- Local Mac and Windows share locations are different views and not proof of identical version. Do not read or write production DB/config.

## 1. Strict boundaries

Do not modify the original root checkout; do not rewrite recovered `focusCycle.ts`; do not modify recovered candidate without an explicit approved plan. Work on a newly identified isolated copy/branch. Do not use `git add .`, commit, push, deploy, install services, perform DB writes, or overwrite private configs. No destructive commands.

Do not claim 'verified' unless you have read the exact artifact and/or captured the actual command output. When tools cannot run tests, mark **UNTESTED** and give complete contents of test-only patch and paths.

## 2. Perform a genuine reconciliation in this order

1. Read all of `AGENTS.md`, `PROJECT_STATUS_FOR_MODELS.md`, `IMPLEMENTATION_CHECKLIST.md`, `Abundance_Alchemy_V2_Handoff.md`, and recovery README/report **from the Mac root**. Also compare with the docs branch versions if available.
2. Report real current working directory and repository root; list which modified files are present in your isolated directory (with safe `git status --short` when applicable; `find` for untracked files). Do not assert it is clean unless checked.
3. Read recovered `app/services/focusCycle.ts` and `app/src/test/focusCycle.test.ts`. Identify exactly how TS exports `CycleType` and how tests import code. List any differences between recovered TS code and your isolated test code. Preserve existing modifications.
4. Produce **test-only** changes compatible with the actual TS/Vitest test file. Cover daily/weekly/monthly cycles, future starts, malformed starts, spring/fall DST transitions, month/year/leap-day boundaries, first/last/after-end behavior. For DST cases, control the process timezone (e.g. TZ=America/New_York in a dedicated test invocation) rather than assuming the machine's timezone. Use explicit date/time fixtures.
5. If your tooling permits, execute the focused tests, full frontend test suite and TypeScript no-emit check **in the isolated working copy**, after inspecting package scripts and environment URLs. Reuse existing `node_modules` only when safe; do not build/run against production configuration. Capture exact commands and pass/fail totals.
6. If tooling does not permit, do not stop at a summary. Provide a complete test-only unified diff against recovered `app/src/test/focusCycle.test.ts` (or a complete replacement file), labeled **UNTESTED**. The file's actual TS import/enum setup must be preserved. Include a single exact Mac command to run tests against a safe isolated copy, and a source-review checklist.
7. Report a concise machine-readable completion record: paths inspected, source hashes or version, exact files changed, focused/full/typecheck outcomes, diff location, blockers, and ownership of next steps.

## 3. Do not misstate completion

'Source is accessible' is not 'same working copy'; 'reported test result' is not 'I ran tests'; 'I created JS tests' is not 'Vitest TS suite integrated'; 'can't run tools' is not 'all requirements met'. If a verified diff and test evidence are missing, use **READY FOR REVIEW — UNTESTED**, not **VERIFIED — COMPLETE**.

## 4. Collaborator routing

- Workstream A Qwen: tests-only patch and report; no production implementation rewrite.
- Workstream B: Windows runtime inventory and isolated PHP/MariaDB setup.
- Workstream C: reviewed schema/migrations and auth/persistence integration testing.
- Workstream D: bell/Orb/audio/companion/browser QA.
- Workstream E: staging, backups, rollback, release candidate.

To prevent collision, record one owner per lane and only a short-lived isolated branch/working copy. Others can read this document and select a different lane.

## 5. Required final answer format

```text
WORKSTREAM A RESULT
Actual workspace:
Authoritative TS source inspected:
Existing TS tests inspected:
Uncommitted files preserved:
Test-only patch path:
Focused tests: PASS/FAIL/UNTESTED (count and command)
Full frontend suite: PASS/FAIL/UNTESTED (count and command)
TypeScript check: PASS/FAIL/UNTESTED (command)
New cases covered:
Remaining blocker:
Status: VERIFIED WITH EVIDENCE / READY FOR REVIEW — UNTESTED
```

Keep your response brief and make outputs available, not just claims.
