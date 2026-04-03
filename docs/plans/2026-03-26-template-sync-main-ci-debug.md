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
- The actual release failure was package graph skew, not template source:
  - the template PR moved direct `@platejs/*` dependencies to `^52.3.10`
  - `platejs` stayed at `^52.3.9`
  - published `platejs@52.3.9` hard-pins `@platejs/utils@52.3.4`
  - published `@platejs/utils@52.3.4` still depends on `@platejs/core:^52.3.4`
  - the install then resolves both top-level `@platejs/core@52.3.9` and nested `@platejs/core@52.3.4` under `@platejs/utils`
- The `/editor` prerender crash is a symptom of that split graph:
  - `bun run build -- --debug-prerender` fails in `TurnIntoToolbarButton` on `useSelectionFragmentProp(...)`
  - removing only `templates/plate-playground-template/node_modules/@platejs/utils/node_modules/@platejs/core` makes the build pass unchanged
- Source-level fix was not required for this turn:
  - packing the current local `platejs` manifest after switching its internal workspace deps to `workspace:^`
  - and packing the current local `@platejs/utils` manifest with `@platejs/core:^52.3.9`
  - makes an isolated template build pass even with direct `@platejs/*` deps forced to `^52.3.10`

## Progress

- 2026-03-26: Loaded `debug`, `learnings-researcher`, `planning-with-files`, and `tdd`.
- 2026-03-26: Switched to `main`; branch was already up to date with `origin/main`.
- 2026-03-26: Confirmed the failing main-branch tombstone message comes from `.github/workflows/release.yml` after the template-sync phase.
- 2026-03-26: Reproduced the real failure from the generated template sync PR state with `bun run build -- --debug-prerender`; `/editor` crashes on `useSelectionFragmentProp(...)`.
- 2026-03-26: Confirmed the install graph was split across `platejs@52.3.9`, `@platejs/utils@52.3.4`, top-level `@platejs/core@52.3.9`, and nested `@platejs/core@52.3.4`.
- 2026-03-26: Verified the crash disappears as soon as the nested stale core under `@platejs/utils` is removed.
- 2026-03-26: Patched `packages/plate/package.json` to publish compatible internal workspace ranges, added a manifest guard for the umbrella package, and wrote release changesets for `platejs` and `@platejs/utils`.
- 2026-03-26: Verified with `pnpm install`, `pnpm test:manifests`, `pnpm lint:fix`, packed-tarball manifest inspection, and isolated template builds against the packed local `platejs` + `@platejs/utils` manifests.
- 2026-03-26: Confirmed the stale fallback PR remained open because `release.yml` had a failure path that created `templates/release-sync-failure` PRs, but no later-success path that closed them after `main` received a successful template sync.
- 2026-03-26: Patched `release.yml` so successful template sync runs close any open PR whose head branch is `templates/release-sync-failure`.
