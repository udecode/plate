# Table Multi-Cell Selection Debug

## Goal

Fix the `/docs/table` multi-cell selection runtime error:

`Unable to find the path for Slate node: {"text":""}`

## Status

- Phase 1: Gather prior learnings and reproduce the failure — completed
- Phase 2: Trace the owning table-selection seam — completed
- Phase 3: Add regression coverage and implement the fix — completed
- Phase 4: Verify in tests and browser — completed

## Findings

- The failure is reported on the local docs route `http://localhost:3002/docs/table` during multi-cell selection.
- A prior learning at `.claude/docs/solutions/ui-bugs/2026-03-27-version-history-demo-must-clone-snapshots-per-editor.md` documents the same Slate error when multiple editor surfaces share the same Slate node graph.
- The currently captured terminal output is stale and still shows the older local `.bun` parse failure; the docs dev server is not currently running.
- Browser repro is deterministic: dragging from the `Heading` cell into the lower-right cells of the first table raises `Unable to find the path for Slate node: {"text":"Heading","bold":true}`.
- `/docs/table` mounts two editors that both start from the same static `tableValue` graph:
  - the generic `table-demo` through `Demo` + `DEMO_VALUES.table`
  - the disable-merge example through `table-nomerge-demo`
- The table package itself was a red herring here. The docs examples were sharing the same Slate nodes across two mounted editors on one page.
- A targeted red test path with `bun test` is currently blocked by the local `node_modules/.bun/is-hotkey` parse corruption, which is separate from this table bug.

## Progress Log

- Reloaded task/debug/browser/test/planning skills for this bug.
- Searched local learnings and code for `table`, `multi-cell`, and the exact Slate error.
- Started a dedicated plan file for this bug.
- Reproduced the browser crash on `/docs/table` with `dev-browser` by dragging a multi-cell selection in the first table demo.
- Added `createDemoValueSnapshot` and switched both mounted table demos to pass cloned initial values into `usePlateEditor`.
- Cleaned non-versioned local env after the `.bun` mirror reintroduced the `is-hotkey` parse failure during verification, then reinstalled with `pnpm install`.
- Verified the regression test passes, `apps/www` typechecks cleanly, `pnpm lint:fix` passes, and the fresh `/docs/table` browser repro no longer throws page errors.

## Errors

- `bun test apps/www/src/registry/examples/values/demo-values.spec.tsx` was initially blocked locally by `node_modules/.bun/is-hotkey@0.2.0/node_modules/is-hotkey/lib/index.js:251:30 Unexpected end of file`.
- Cleaning `node_modules`, `apps/www/.next`, `apps/www/.contentlayer`, and `.turbo`, then rerunning `pnpm install`, resolved the local env corruption and unblocked verification.
