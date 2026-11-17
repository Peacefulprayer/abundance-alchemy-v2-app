# Recovered working source — November 4, 2026

This is the durable source-recovery candidate, based on 0a93937 plus the reviewed October cumulative patch and reconstructed later returning-sign-in, personal-focus-card, and confirmed-sign-out changes. See ../RECOVERY-REPORT.md before using older project status notes.

Use this working copy for the next local integration step; the original project remains untouched. No deployment or database verification has occurred. app/.env.production uses /abundance-alchemy/api. No config.local.php or local credentials were copied. Configure the private local runtime explicitly before running PHP endpoints. Do not point this candidate at production.

The dependency directory is currently a local link to the original app/node_modules; the source ZIP excludes it and contains package.json/package-lock.json for installation in a separate environment. Build with the direct typecheck/Vite commands documented in the recovery report; the inherited npm build script performs metadata deletion and was not used. Companion pages remain separate from the Vite build and must be deployed/preserved explicitly.
