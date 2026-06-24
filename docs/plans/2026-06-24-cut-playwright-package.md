# cut playwright package

Objective:
Cut `@platejs/playwright`; done when Browser owns the useful Playwright proof
surface, no active source/docs package path still depends on the old package,
and focused package/docs checks pass.

Completion threshold:
- `packages/playwright` is gone.
- No active source/docs/package manifest uses `@platejs/playwright`,
  `packages/playwright`, `PlaywrightPlugin`, `platePlaywrightAdapter`,
  `usePlaywrightAdapter`, or `KEYS.playwright`.
- `@platejs/browser/playwright` owns the useful low-level editable, text, block,
  and handle helpers.
- Install graph and release artifact metadata are refreshed.
- Browser package test/typecheck and docs source checks pass.

Verification surface:
- `pnpm install`
- `pnpm --filter @platejs/browser brl`
- `pnpm --filter @platejs/browser test`
- `pnpm --filter @platejs/browser typecheck`
- `pnpm --filter www check:docs`
- `pnpm turbo typecheck --filter=./packages/utils`
- `pnpm --filter www exec eslint src/registry/examples/playground-demo.tsx --fix`
- Focused stale-ref audit for old package names and adapter symbols.
- Browser route proof for `/docs/playwright`, with blocker recorded if the
  current app cannot compile unrelated code.

Constraints:
- No compat package, no alias, no deprecation shim, no redirect export.
- Preserve Playwright as Browser/test infrastructure.
- Do not run broad Plate runtime migration inside this cut.
- Do not hand-edit CI-owned registry/template/generated output.
- Keep unrelated dirty files untouched.

Boundaries:
- Edited owners: `packages/browser`, `apps/www/package.json`,
  `apps/www/src/registry/examples/playground-demo.tsx`,
  `content/docs/(guides)/playwright.mdx`,
  `content/docs/(guides)/playwright.cn.mdx`, package locks, changeset metadata,
  and `packages/utils/src/lib/plate-keys.ts`.
- Deleted owner: `packages/playwright`.
- Not owned here: generated registry/release JSON, broad Plate runtime APIs,
  stale built package `dist` files.

Blocked condition:
Browser-rendered docs proof is blocked by unrelated `apps/www` compile debt if
docs import registry previews that resolve stale built `dist` files or legacy
Plate runtime APIs. That blocker does not invalidate the package cut when source
docs, package checks, and stale-ref audits pass.

Task source:
- type: user prompt
- date: 2026-06-24
- title: Hard cut `@platejs/playwright` in favor of `@platejs/browser`

First checkpoint:
- [x] Delete `packages/playwright` with no compat package, alias, redirect, or shim.
- [x] Keep Playwright test support through `@platejs/browser/playwright`.
- [x] Steal only pieces that are a perfect fit for Browser's public proof harness.
- [x] Remove current app/docs/package imports of `@platejs/playwright`.
- [x] Preserve Playwright itself as test-runner infrastructure where Browser owns it.
- [x] Refresh lockfiles/install graph.
- [x] Audit active source/docs/manifests for stale `@platejs/playwright` and `packages/playwright`.
- [x] No timed loop requested.

Scope:
- [x] Source owners: `packages/playwright`, `packages/browser`, docs guide pages,
      `apps/www` package manifest and active caller imports, lockfiles.
- [x] Non-goals: no broad Plate runtime migration, no generated registry/template
      hand edits, no Playwright removal from Browser/test infrastructure.
- [x] Release artifact: existing Browser changeset updated.
- [x] Browser proof: attempted because docs changed; blocked by unrelated current
      `apps/www` stale-dist/runtime migration errors, recorded below.

Implementation:
- [x] Removed `packages/playwright`.
- [x] Removed `@platejs/playwright` from `apps/www/package.json`.
- [x] Removed `@platejs/playwright` from `pnpm-lock.yaml`, `bun.lock`, and
      `.changeset/pre.json`.
- [x] Removed `KEYS.playwright` and the playground demo's proof adapter plugin.
- [x] Promoted useful low-level proof helpers into `@platejs/browser/playwright`:
      `getPliteBrowserEditable`, `locatePliteBrowserBlock`,
      `locatePliteBrowserText`, and `evaluatePliteBrowserHandle`.
- [x] Updated Browser harness imports and Browser export contract tests.
- [x] Updated Browser README to document the low-level locator/handle helpers.
- [x] Rewrote English and Chinese Playwright docs to install/use
      `@platejs/browser/playwright`.
- [x] Updated `.changeset/slate-browser-proof-lane.md` so Browser owns the
      Playwright proof lane.

Verification:
- [x] `pnpm install` passed.
- [x] `pnpm --filter @platejs/browser brl` passed; no barrels to generate.
- [x] `pnpm --filter @platejs/browser test` passed.
- [x] `pnpm --filter @platejs/browser typecheck` passed.
- [x] `pnpm --filter www check:docs` passed.
- [x] `pnpm turbo typecheck --filter=./packages/utils` passed.
- [x] `pnpm --filter www exec eslint src/registry/examples/playground-demo.tsx --fix` passed.
- [x] Focused stale active-ref audit passed:
      `rg -n "@platejs/playwright|packages/playwright|PlaywrightPlugin|platePlaywrightAdapter|usePlaywrightAdapter|KEYS\\.playwright" apps packages content package.json pnpm-lock.yaml bun.lock .changeset --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!apps/www/public/r/**' --glob '!apps/www/src/generated/**' --glob '!docs/**'`
- [x] Package directory audit passed:
      `rg --files packages | rg '^packages/playwright'`
- [x] `pnpm --filter www typecheck` was run and failed on unrelated current
      Plate runtime migration errors under `src/app/(app)/layout.tsx`,
      `src/app/dev/editor-perf/page.tsx`, and registry callers using removed
      legacy runtime APIs such as `tf`, `getPluginApi`, and `getTransforms`.
- [x] Browser docs proof attempted at `http://localhost:3004/docs/playwright`.
      It was blocked by the same unrelated `apps/www` compile path: docs import
      registry previews that pull stale built package `dist` files expecting
      removed Plite-era exports (`createPlitePlugin`, `createTSlatePlugin`,
      `createPliteEditor`). This is not caused by the Playwright package cut.

Recovery notes:
- [x] First broad `rg` streamed too much output; recovered with focused audits.
- [x] `bun install` could not parse the pre-existing `bun.lock` duplicate package
      path and rewrote too much. Restored `bun.lock` from `HEAD` and reapplied
      only the package deletion edits, then reran `pnpm install`.
- [x] A dev-server attempt failed after Bun polluted module resolution with
      `.bun/zod@4.4.3`; `pnpm install` restored the pnpm graph.
- [x] Port `3003` was occupied; retried on `3004`.

Generated artifacts:
- [x] Generated registry/release snapshots under `apps/www/src/generated/**` and
      `apps/www/public/r/**` may still contain historical `@platejs/playwright`
      strings. They were intentionally not hand-edited because registry/template
      outputs are CI-owned.

Closeout:
- [x] No PR, commit, push, or tracker sync requested.
- [x] No agent-rule or skill topology changed.
- [x] No compat alias remains for `@platejs/playwright`.
- [x] Final confidence: 94%. The cut is coherent; the only missing rendered docs
      proof is blocked by unrelated Plate runtime/stale-dist migration debt.

Work Checklist:
- [x] Prompt requirements captured before implementation.
- [x] Hard-cut skill applied: no compatibility alias or shim.
- [x] Autogoal plan created and used as the closure ledger.
- [x] Docs-creator used for docs current-state rewrite.
- [x] Changeset skill used for release artifact decision.
- [x] Old package deleted.
- [x] Browser package absorbed useful proof helpers.
- [x] App caller and install graph cleaned.
- [x] Docs updated.
- [x] Focused package/docs checks run.
- [x] Browser proof attempted and blocker recorded.
- [x] Generated output caveat recorded.
- [x] Final handoff evidence recorded.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | done | Prompt requirements copied into this plan. |
| Implementation | done | Package deleted; Browser helpers promoted; docs and manifests updated. |
| Verification | done | Browser/package/docs/source checks recorded above. |
| Browser route proof | blocked_external | Blocked by unrelated `apps/www` stale-dist/runtime migration compile errors. |
| Closeout | done | No git/PR action requested; risks recorded. |

Verification evidence:
- Fresh final package evidence is recorded in the Verification section above.
- Fresh stale-reference audits returned no active source/package/docs matches
  after excluding generated registry/release output and `dist`.
- Browser route proof was attempted after a live dev-server start on port `3004`
  and blocked by unrelated current app compile errors.

Reboot status:
Current plan is self-contained. If the thread reboots, continue from this file,
rerun the focused stale-ref audit, and do not reopen broad Plate runtime
migration unless the user asks.

Open risks:
- `apps/www` rendered docs proof remains blocked by unrelated stale built package
  output and Plate runtime migration debt.
- Generated registry/release snapshots may still mention historical
  `@platejs/playwright` until the owning generator refreshes them.
