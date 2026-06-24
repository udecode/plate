---
title: Preserve concurrent edits through Yjs Backspace merge normalization
date: 2026-05-25
last_updated: 2026-05-29
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - A disconnected peer merges two paragraphs with Backspace.
  - A connected peer inserts text into the surviving left paragraph.
  - Reconnecting converges to the merged text without the connected peer's insert.
  - Cross-block deleteFragment can drop remote text inserted into the absorbed end block.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, merge-node, reconnect, playwright]
---

# Preserve concurrent edits through Yjs Backspace merge normalization

## Problem
The Yjs collaboration example could still drop a connected peer's insert when a
disconnected peer merged two paragraphs with Backspace and then reconnected.

## Symptoms
- A writes `alpha` / `beta`.
- B disconnects.
- B places the caret at the start of `beta` and presses Backspace.
- A inserts `!` after `alpha`.
- B reconnects.
- All peers converge to `alphabeta` instead of `alpha!beta`.
- In the harder deleteFragment shape, B deletes from `alpha` into `gamma`,
  A appends `!` to `gamma`, and reconnect converges to `almma` instead of
  `almma!`.

## What Didn't Work
- Testing only a single element `merge_node` was too narrow. It proved the
  structural merge, but not the real Backspace operation batch.
- Merging the right text into the left `Y.XmlText` looked closer to Slate's final
  value, but it makes the right text and a concurrent remote insert compete at
  the same Yjs offset.
- Browser proof was initially misleading because the dev site resolved
  `@slate/yjs` through stale package `dist` instead of the edited source.

## Solution
Handle the real Backspace batch:

```ts
[
  { type: 'merge_node', path: [1], position: 1 },
  { type: 'merge_node', path: [0, 1], position: 5 },
]
```

The element merge must not clone the right paragraph's children. Insert
traceable virtual placeholders into the surviving paragraph and hide the
absorbed paragraph so the original right-side `Y.XmlText` remains in the Yjs
document:

```ts
insertYjsChild(
  root,
  previous,
  getYjsLength(previous),
  createVirtualYjsMovePlaceholder(child)
)
hideYjsNode(target)
```

The follow-up text normalization merge returns success when the previous and
current text leaves live in different `Y.XmlText` containers:

```ts
if (previousSharedLeaf && previousSharedLeaf.sharedText !== leaf.sharedText) {
  return (
    PathApi.equals(previousPath.slice(0, -1), operation.path.slice(0, -1)) &&
    operation.position === previousSharedLeaf.text.length
  )
}
```

That prevents the operation batch from falling back to whole-document snapshot
replacement while keeping both Yjs text containers alive for conflict merging.
The current trace name for the element merge path is
`fallback: "virtual-merge-ref"`.

The demo also needs Turbopack aliases based on package names, including scoped
subpath entries such as `@slate/yjs/react`, so browser tests exercise source
files instead of stale `dist`.

## Why This Works
Yjs preserves concurrent edits when they stay attached to live shared types. In
this case, the remote `!` can belong to either the original left `Y.XmlText` or
the absorbed right `Y.XmlText`. The merged text can remain in separate adjacent
`Y.XmlText` containers and still render as one Slate paragraph. Yjs avoids
same-offset insert ordering and absorbed-block data loss that would otherwise
produce `alphabeta!`, `almma`, or force a snapshot fallback.

## Prevention
- Add tests for real user operation batches, not just the first structural op.
- Include cross-block `deleteFragment` rows where the remote edit targets the
  absorbed end block, not only the surviving start block.
- Treat a supported operation encoder returning `false` as dangerous; it can
  silently trigger snapshot fallback.
- For Yjs text merges, preserve live shared-type identity unless a test proves
  same-container insertion is conflict-safe.
- Keep dev-site workspace aliases keyed by package name and subpath, not by
  folder name only.

## Related Issues
- `docs/solutions/logic-errors/yjs-offline-split-reconnect-merge-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-offline-replace-undo-concurrent-append-2026-05-25.md`
