---
title: Slate v2 deslop completion must prove sibling release discipline
date: 2026-05-08
category: docs/solutions/workflow-issues
module: slate-v2 plate-2 completion workflow
problem_type: workflow_issue
component: development_workflow
symptoms:
  - `plate-2` completion-check stayed pending while the real Slate v2 cleanup was not fully closed.
  - `bun test:release-discipline` in `../slate-v2` failed on a stale `editor.operations` test usage.
  - The escape-hatch inventory counts were stale after classified source drift.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [slate-v2, release-discipline, completion-check, escape-hatch, bun-check]
---

# Slate v2 deslop completion must prove sibling release discipline

## Problem

Architecture/deslop work is coordinated from `plate-2`, but the code and tests
live in `../slate-v2`. A green `plate-2` completion file only proves the loop
state; it does not prove the sibling package.

## Symptoms

- `bun run completion-check` in `plate-2` reported `pending`.
- The active plan had already closed docs/example cleanup, but later package
  test cleanup still needed sibling proof.
- `bun test:release-discipline` in `../slate-v2` failed on
  `packages/slate-dom/test/bridge.ts` because it still assigned
  `editor.operations`.
- After that stale field was removed, the escape-hatch inventory still failed
  until the classified counts matched current source.

## What Didn't Work

- Treating `plate-2` completion-check as the main verification. It only reads
  the markdown state file.
- Relying on default cleanup tests alone. Release discipline found a stale API
  shape that the focused package tests did not.
- Adding a new allowlist hole for `packages/slate-dom/test`. The correct move
  was to remove the stale field from the test.

## Solution

Run sibling verification before setting completion to `done`:

```bash
cd /Users/zbeyens/git/slate-v2
bun test:release-discipline
bun lint:fix
bun check
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium -g 'forced-layout paste-normalize-undo'
```

When release discipline flags a stale public field in a test, remove the stale
field unless the test is explicitly proving compatibility. For this case,
`packages/slate-dom/test/bridge.ts` kept the DOM path behavior covered with
neutral custom metadata instead of `editor.operations`.

Then refresh `packages/slate/test/escape-hatch-inventory-contract.ts` counts
only after there are no unclassified matches. Count updates are acceptable when
the paths remain classified and the source drift is intentional.

## Why This Works

The workflow separates state proof from package proof. `plate-2` owns the
continuation loop and completion markdown; `../slate-v2` owns the actual code,
release discipline, typecheck, unit tests, Vitest tests, and browser row.

The release-discipline gate protects the public API cleanup goal better than a
plain completion state file because it scans for stale `editor.children`,
`editor.selection`, `editor.marks`, `editor.operations`, primitive transforms,
and runtime bridge escape hatches.

## Prevention

- For Slate v2 cleanup work driven from `plate-2`, always run final gates in
  `/Users/zbeyens/git/slate-v2`.
- Keep `bun check` as the fast iteration closeout, but run
  `bun test:release-discipline` when the work changes API boundaries, internal
  helper usage, or public-vs-internal tests.
- Do not set completion state to `done` until the sibling proof and the
  `plate-2` completion check both pass.
- If the inventory reports `unmatched`, fix or classify the source first.
  Update expected counts only after unmatched entries are empty.

## Related Issues

- [Slate public root hard cuts need internal imports and explicit type exports](../developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md)
- [Slate React runtime owner cuts need static inventories and browser proof](../developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](../developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
