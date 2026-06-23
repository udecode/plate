---
title: Plite source bus routing must prove upstream fan-in and runtime-bucket locality separately
date: 2026-04-30
category: performance-issues
module: Plite React runtime
problem_type: performance_issue
component: testing_framework
symptoms:
  - projection and annotation stores had local subscriber APIs but still listened through broad editor commits
  - source-scoped recompute proof could pass without proving the upstream subscription path was source-scoped
  - structural path changes could update projections while still over-notifying unrelated runtime buckets
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - plite
  - slate-react
  - source-bus
  - projections
  - annotations
  - performance
  - runtime-ids
---

# Plite source bus routing must prove upstream fan-in and runtime-bucket locality separately

## Problem

Plite React stores already had source and runtime-id subscriber concepts, but
their upstream editor listener was still broad. That made the architecture look
source-scoped while the first notification hop still woke on every editor
commit.

## Symptoms

- `createPliteProjectionStore` selected recompute by dirtiness, but still
  subscribed through broad `editor.subscribe`.
- `createPliteAnnotationStore` had candidate filtering, but still received every
  editor commit before filtering.
- Existing tests proved selective recompute and bookmark correctness, but did
  not fail if a store fell back to broad upstream fan-in.
- Structural moves could preserve runtime ids while still needing proof that
  only the changed runtime bucket notified.

## What Didn't Work

- Treating selective recompute as sufficient. It proves the store can ignore a
  change after it receives it; it does not prove the store avoided the broad
  upstream wakeup.
- Adding public source APIs first. The current raw Plite API should stay small:
  `read`, `update`, broad advanced `subscribe`, and friend/internal routing for
  React runtime owners.
- Typing only canonical update tags. That would improve autocomplete but break
  app-specific metadata such as remote-import or product import tags.

## Solution

Add a friend/internal source bus behind `Editor.subscribeSource(...)`, then route
projection and annotation stores through it.

Before, projection and annotation stores depended on broad editor fan-in:

```ts
const unsubscribeEditor = editor.subscribe((nextSnapshot, change) => {
  recompute({
    change,
    reason: 'editor',
    snapshot: nextSnapshot,
    sourceId: options.sourceId,
  })
})
```

After, projection stores map their dirtiness class to editor commit sources:

```ts
const unsubscribeEditorSources = getEditorSourcesForDirtiness(
  options.dirtiness
).map((editorSource) =>
  Editor.subscribeSource(editor, editorSource, (nextSnapshot, change) => {
    recompute({
      change,
      reason: 'editor',
      snapshot: nextSnapshot,
      sourceId: options.sourceId,
    })
  })
)
```

The core bus derives sources from commit metadata:

```ts
const getSourcesForChange = (
  change: SnapshotChange
): readonly EditorCommitSource[] => {
  const sources: EditorCommitSource[] = ['commit']

  if (
    change.selectionChanged ||
    (change.selectionImpactRuntimeIds?.length ?? 0) > 0
  ) {
    sources.push('selection')
  }

  if (change.classes.includes('text')) {
    sources.push('text')
  }

  if (
    change.nodeImpactRuntimeIds == null ||
    change.nodeImpactRuntimeIds.length > 0
  ) {
    sources.push('node')
  }

  if (
    change.classes.includes('text') ||
    change.classes.includes('structural') ||
    change.classes.includes('replace')
  ) {
    sources.push('decoration', 'root')
  }

  return sources
}
```

Lock it with tests that fail on the exact wrong owner:

- Core source routing: selection-only commits wake `commit` and `selection`, not
  `text`, `node`, `decoration`, or `root`.
- Projection store: monkey-patch `editor.subscribe` to throw, then prove a
  text-dirty projection still updates through the source bus.
- Annotation store: monkey-patch `editor.subscribe` to throw, then prove a
  bookmark-backed annotation still rebases after text insertion.
- Runtime bucket locality: move the block containing a projection, keep the
  same runtime id, update projection data, and notify only that runtime bucket.
- Collab pressure: replay remote text ops and prove local bookmark ranges still
  rebase.
- Tag typing: type canonical tags while preserving arbitrary string tags.

## Why This Works

The fix separates three different promises:

1. Source routing decides which editor source class wakes.
2. Store recompute decides whether that store's data changed.
3. Runtime-id delivery decides which mapped subscribers hear about the changed
   store buckets.

Those are not interchangeable. A green test for one can leave the other two
quietly broken.

Keeping `Editor.subscribeSource(...)` on the friend/internal static API also
keeps the raw public editor shape small. App authors still see the simple
`editor.subscribe` escape hatch, while React runtime code gets the sharper
routing primitive it needs.

## Prevention

- Any source-partition implementation needs one test that monkey-patches broad
  `editor.subscribe` to throw. Without that, broad upstream fan-in can sneak
  back in while recompute tests stay green.
- Any runtime-id projection fix needs a structural move row that proves changed
  bucket delivery, not only updated render output.
- Keep source categories derived from commit metadata. Do not bolt public
  `editor.onSelection` or `editor.sources` onto raw Plite before the internal
  routing contract has failed to express a real need.
- Canonical tag types should always keep a custom string escape hatch; product
  and collaboration layers need metadata that core cannot enumerate.

## Related Issues

- [Source-scoped overlay invalidation proof must separate recompute selectivity from subscriber fan-out](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-20-source-scoped-overlay-invalidation-proof-must-separate-recompute-selectivity-from-subscriber-fan-out.md)
- [Annotation store inputs must keep stable data references](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md)
- [Overlay perf coverage must include annotation-backed widget churn](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-15-overlay-perf-coverage-must-include-annotation-widget-churn.md)
- [Plite Lexical API steal review plan](/Users/zbeyens/git/plate-2/docs/plans/2026-04-30-plite-lexical-api-steal-review-ralplan.md)
