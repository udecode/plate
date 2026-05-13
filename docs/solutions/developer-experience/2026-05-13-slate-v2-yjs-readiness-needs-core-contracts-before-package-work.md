---
title: Slate v2 Yjs readiness needs core contracts before package work
date: 2026-05-13
category: docs/solutions/developer-experience
module: slate-v2 collaboration substrate
problem_type: developer_experience
component: tooling
symptoms:
  - Future slate-yjs work could accidentally port legacy editor monkey-patches into v2.
  - Collaboration issue claims were too easy to overstate from generic operation replay proof.
  - Remote selection sync needed scroll and focus suppression before provider UI work.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags: [slate-v2, yjs, collaboration, selection, benchmarks, issue-ledger]
---

# Slate v2 Yjs readiness needs core contracts before package work

## Problem

Starting a first-party `slate-yjs` package before proving the raw Slate v2
substrate would invite dirty adapter hacks: monkey-patched editor methods,
direct document mutation, vague remote-selection behavior, and inflated issue
claims.

The better move is to prove the substrate first, then let the package own Yjs
schema, providers, awareness, and cursor UI.

## Symptoms

- Legacy `slate-yjs` patterns depend on `editor.apply`, `editor.onChange`, and
  direct `editor.children` replacement.
- Generic operation replay proof did not cover the #5771 class: high-QPS remote
  inserts while local collapsed selection is live.
- Remote collaboration imports could reuse normal React selection side effects
  unless scroll and focus suppression were tested.
- Issue ledgers said collaboration-selection proof was still missing even after
  the new P0 contracts landed.

## What Didn't Work

- Creating `slate-yjs` first. That would make package ergonomics drive raw core
  API before the failure modes were known.
- Porting legacy adapter hooks. That would reintroduce exactly the mutable
  editor-object behavior v2 is cutting.
- Adding Yjs nouns to raw Slate. Raw Slate should expose commits, metadata,
  extension runtime state, bookmarks, and transactions; Yjs objects belong in a
  package.
- Calling #5771 fixed from core tests alone. The proof now improves the
  Slate-side substrate, but exact closure still needs a real adapter/browser
  repro.

## Solution

Run Yjs readiness as a core contract lane before package work.

The fake adapter contract should mount through public extension APIs and export
from commit listeners:

```ts
const extension = defineEditorExtension({
  name: 'fake-collab-adapter',
  register(context) {
    const state = context.runtimeState({
      connected: true,
      exports: [],
      paused: false,
    })

    return {
      cleanup() {
        state.set((current) => ({ ...current, connected: false, paused: true }))
      },
      commitListeners: [
        (commit) => {
          if (
            commit.tags.includes('skip-collab') ||
            commit.tags.includes('collaboration') ||
            commit.metadata.collab?.origin === 'remote'
          ) {
            return
          }

          state.set((current) => ({
            ...current,
            exports: [...current.exports, commit.operations],
          }))
        },
      ],
    }
  },
})
```

Remote imports should stay transaction-owned and metadata-rich:

```ts
editor.update((tx) => {
  tx.operations.replay(remoteOperations)
}, {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-import'],
})
```

React selection side effects should read the last commit policy instead of
guessing from call sites:

```ts
export const shouldSkipSelectionScroll = (editor: ReactEditor) => {
  const commit = editor.read((state) => state.value.lastCommit())

  return Boolean(
    commit?.tags.includes('skip-scroll-into-view') ||
      commit?.metadata.selection?.scroll === false
  )
}
```

The final lane added these proof owners:

- `../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts`
- `../slate-v2/packages/slate/test/collab-selection-stress-contract.ts`
- `../slate-v2/packages/slate/test/collab-bookmark-position-contract.ts`
- `../slate-v2/packages/slate/test/collab-canonical-reconcile-contract.ts`
- `../slate-v2/packages/slate-react/test/selection-side-effect-policy-contract.ts`
- `../slate-v2/scripts/benchmarks/core/current/collab-readiness.mjs`

Issue accounting moved #5771 only to `Improves`, not `Fixes`.

## Why This Works

The contracts force raw Slate to prove the behavior future collaboration
packages need without absorbing collaboration product policy.

Core owns deterministic replay, commit metadata, history skipping, bookmark and
runtime-id stability, canonical reconcile, and side-effect policy signals. A
future `slate-yjs` package can then translate Y events into those primitives
without patching editor methods or leaking Yjs objects into document values.

The benchmark keeps the performance claim honest by measuring collaboration as
a composed workload: local export, remote replay, bookmark rebase, canonical
replace, history skip, and connect/disconnect cleanup.

## Prevention

- Do not create a collaboration package until raw core has fake-adapter,
  high-QPS selection, bookmark, canonical reconcile, side-effect, and benchmark
  proof.
- Keep raw Slate free of `Y.Doc`, provider, awareness, and cursor API.
- Require remote imports to carry `collaboration`, history skip, and selection
  side-effect metadata.
- Treat core proof as an `Improves` claim for provider bugs until a real
  adapter/browser reproduction passes.
- Keep benchmark lanes calibration-only until at least three repeated runs
  produce stable thresholds.

## Related Issues

- [Slate collaboration docs must mark the external adapter boundary](../documentation-gaps/2026-04-09-slate-collaboration-docs-must-mark-the-external-adapter-boundary.md)
- [Slate v2 migration-backbone lanes need browser contracts before completion](2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
- [Slate DOM-incomplete work should start with internal coverage boundaries](2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
- `docs/plans/2026-05-13-slate-v2-yjs-core-readiness-ralplan.md`
