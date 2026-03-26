# Template Sync Main CI Debug

## Task

- Source: main-branch CI failure
- Symptom: workflow ends on `echo "Template sync automation failed."` with no useful context
- Goal: trace the real failing command, add durable logs for next time, and fix the underlying issue if reproducible

## Plan

1. Switch to `main` and update the checkout.
2. Search existing learnings for template-sync and CI workflow guidance.
3. Inspect the failing workflow step and the scripts it wraps.
4. Reproduce locally or narrow the failing boundary with direct commands.
5. Add logging around the failure path and fix the root cause if found.
6. Run the relevant verification before closing out.

## Findings

- Existing learnings already cover two relevant failure classes in this path:
  - template updater should generate, not own verification
  - template update/check failures can come from wrapper args, template-scoped lint, TS config, or generated-file normalization
- The generic `Template sync automation failed.` step lives in `.github/workflows/release.yml`, not `registry.yml`.
- `release.yml` runs `pnpm templates:update --local` with `continue-on-error: true`, then masks the real failure at the end with a generic `echo` + `exit 1`.
- `registry.yml` runs the same updater path on both PR validation and `main` sync, but does not currently hide the failing command behind the same wrapper step.
- The updater entrypoint is thin: `tooling/scripts/update-templates.sh` just dispatches `basic` and `ai`.
- The real work happens in `tooling/scripts/update-template.sh`:
  - `bun update --latest`
  - `pnpm dlx shadcn@latest add ...`
  - import normalization
  - `bun lint:fix`
  - optional `bun typecheck`

## Progress

- 2026-03-26: Loaded `debug`, `learnings-researcher`, `planning-with-files`, and `tdd`.
- 2026-03-26: Switched to `main`; branch was already up to date with `origin/main`.
- 2026-03-26: Confirmed the failing main-branch tombstone message comes from `.github/workflows/release.yml` after the template-sync phase.
