---
title: Slate v2 migration-backbone lanes need browser contracts before completion
date: 2026-04-28
category: docs/solutions/developer-experience
module: slate-v2 migration backbone
problem_type: developer_experience
component: tooling
symptoms:
  - Completion status stayed pending while Phase 6 and Phase 7 still had runnable proof work.
  - The plan briefly confused migration-backbone proof with current Plate and slate-yjs adapter support.
  - A full browser gate exited 0 but still reported retry-resolved flaky rows.
root_cause: inadequate_documentation
resolution_type: workflow_improvement
severity: high
tags: [slate-v2, migration-backbone, browser-proof, completion-check, slate-browser, runtime-id]
---

# Slate v2 migration-backbone lanes need browser contracts before completion

## Problem

A Slate v2 architecture lane is not done just because the raw API hard cuts
compile. If the goal includes future Plate or slate-yjs migration, raw Slate
must prove the shared backbone: extension groups, deterministic operations,
commit metadata, local runtime targets, and replayable browser contracts.

## Symptoms

- `tmp/completion-check.md` correctly stayed `pending` after the public API and
  React DX cuts because migration-backbone proof still had runnable work.
- The plan needed a hard correction: do not support current Plate or slate-yjs
  adapters in raw Slate. Prove only the substrate those libraries can migrate
  toward.
- `bun check:full` exited `0`, but Playwright still reported retry-resolved
  rows. That is acceptable only after the exact rows pass cleanly with retries
  disabled.

## What Didn't Work

- Treating Phase 6 as current-version adapter work. That would drag product
  API compatibility into raw Slate and pollute the clean public surface.
- Calling the lane complete after package typechecks and unit contracts. Browser
  regressions around voids, selection, tables, search focus, and toolbar
  overlays are the failure class this lane exists to catch.
- Trusting an exit-code-only browser pass when the output includes flaky rows.

## Solution

Keep the adapter boundary strict and prove the migration backbone directly.

Raw Slate contracts should cover:

```ts
editor.read((state) => state.table.rowCount())

editor.update((tx) => {
  tx.table.insertRow()
  return tx.table.rowCount()
})
```

Collaboration/runtime contracts should cover:

```ts
const commits = local.applyOperations(operations, { tag: 'remote-import' })
remote.applyOperations(commits[0].operations, { tag: 'remote-import' })
expect(remote.children).toEqual(local.children)
```

Browser stress contracts should be generated from plugin-style rows, not
example-specific patches:

```ts
const registry = createSlateBrowserPluginContractRegistry([
  defineSlateBrowserPluginContract({
    name: 'media',
    rows: [
      { family: 'block-void-navigation', routes: ['images', 'embeds'] },
      { family: 'stale-target-remote-rebase', routes: ['images'] },
    ],
  }),
])
```

The stale-target row should prove local runtime identity rules:

```ts
captureRuntimeId('firstImage', [1])
applyOperations(remoteRemoveAndMoveOps, { tag: 'remote-rebase' })
assertCapturedRuntimeIdPath('firstImage', null)
assertCapturedRuntimeIdPath('secondImage', [1])
assertLastCommitTags(['remote-rebase'])
```

Close the browser gate only after the full gate and any retry-resolved rows are
clean under a focused retry-disabled rerun:

```bash
bun check:full
PLAYWRIGHT_RETRIES=0 bun run playwright \
  playwright/integration/examples/richtext.test.ts \
  playwright/integration/examples/inlines.test.ts \
  --project=chromium --project=firefox \
  -g "persistent native word-delete|generated inline cut typing gauntlet"
```

## Why This Works

This keeps raw Slate small and publishable while still giving Plate, slate-yjs,
and similar libraries a real migration path. The proof lives at the common
runtime layer: state/tx groups, operations, commits, metadata, runtime ids, and
browser replay rows.

The focused retry-disabled rerun prevents a green exit code from hiding a real
flake introduced by the current slice.

## Prevention

- Keep `blocked` reserved for no-autonomous-progress states. If a proof owner
  remains runnable, status stays `pending`.
- For migration claims, prove substrate behavior. Do not import current adapter
  APIs into raw Slate.
- Add browser contract rows for operation families. Examples can demonstrate,
  but `slate-browser` owns replayable regression contracts.
- When `bun check:full` reports retry-resolved rows, rerun those exact rows with
  `PLAYWRIGHT_RETRIES=0` before setting completion to `done`.

## Related Issues

- [Slate React runtime owner cuts need static inventories and browser proof](../developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
- [Slate React void renderers should not own hidden children](../developer-experience/2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md)
- [Slate v2 integration-local should cap local Playwright workers before debugging editor failures](../test-failures/2026-04-24-slate-v2-integration-local-should-cap-local-playwright-workers-before-debugging-editor-failures.md)
- [Workspace package subpath consumers may need a targeted build before Playwright](../logic-errors/2026-04-04-workspace-package-subpath-consumers-may-need-a-targeted-build-before-playwright.md)
