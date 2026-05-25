---
title: Slate v2 text snapshots should be path-stable for large-document typing
date: 2026-05-01
category: docs/solutions/performance-issues
module: Slate v2 core transaction runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Huge-document direct typing was slower than legacy chunking even after React selector and DOM-sync costs were cut"
  - "Profiled `editor.update(tx.text.insert)` spent most time in `core-time:next-snapshot` and rollback cloning"
  - "Select-then-type still lost after direct typing improved because collapsed selection impact scanned the full runtime index"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - performance
  - huge-document
  - typing
  - snapshots
  - transactions
  - selection
---

# Slate v2 text snapshots should be path-stable for large-document typing

## Problem

The large-document typing lane looked like a React rendering problem, but the measured cost was in core snapshot publication. Every text insert paid for a full document snapshot and rollback clone even though text operations do not change paths.

## Symptoms

- At 2000 blocks, v2 shell middle typing was about `59.63 ms` while legacy chunk-on was about `32 ms`.
- The profile showed `editor-update-text-insert` at `59.36 ms`, `core-time:build-change` at `40.78 ms`, `core-time:next-snapshot` at `40.13 ms`, and `core-time:transaction-rollback-children` at `12.97 ms`.
- React provider work was tiny in the same profile: DOM sync and selector dispatch were both under `1 ms`.
- After direct typing improved, select-then-type still had extra cost from collapsed selection impact scanning every indexed path.

## What Didn't Work

- Cutting React selector fanout helped correctness and reduced wakeups, but it did not explain the direct typing cost.
- Cutting selection DOM export wakeups helped native event lanes, but direct model typing still stayed red.
- Adding DOM-present groups alone did not fix typing because the slow path ran before React had meaningful work to skip.

## Solution

Keep the snapshot contract, but make text snapshots path-stable:

- Store `previousSnapshot.children` in the transaction snapshot and clone it only if rollback actually happens.
- For `insert_text`, `remove_text`, and `set_selection` commits, reuse the previous snapshot index because paths do not change.
- Build the next snapshot by cloning and freezing only the edited text branch.
- Cache that path-stable snapshot for listeners and the next transaction.
- For collapsed selections, compute selection impact from the caret ancestor chain instead of scanning every indexed path.

The core shape:

```ts
const getPathStableSnapshot = (
  editor: Editor,
  previousSnapshot: EditorSnapshot,
  operations: readonly Operation[]
): EditorSnapshot | null => {
  if (!canBuildPathStableSnapshot(operations)) {
    return null
  }

  let children = previousSnapshot.children as readonly Descendant[]

  for (const operation of operations) {
    if (operation.type === 'set_selection') continue
    if (operation.type !== 'insert_text' && operation.type !== 'remove_text') {
      continue
    }

    children =
      updateTextInSnapshotChildren(children, operation) ?? previousSnapshot.children
  }

  return {
    children,
    index: previousSnapshot.index,
    marks: cloneFrozen(getCurrentMarks(editor)),
    selection: cloneFrozen(getCurrentSelection(editor)),
    version: getVersion(editor),
  } as EditorSnapshot
}
```

And the collapsed-selection guard:

```ts
if (Range.isCollapsed(selection)) {
  return uniqPaths(paths)
}
```

## Why This Works

Text operations are path-stable. They change leaf text and cloned ancestors, but they do not change child order or runtime-id path mapping. A full structured clone plus full index rebuild is wasted work for that class.

Rollback still stays correct because the transaction keeps the previous committed snapshot as the rollback source and only clones it when an error path actually restores state. Snapshot readers still receive frozen snapshot objects, and the targeted snapshot contract proves earlier snapshots stay stable across later text commits.

The collapsed-selection cut removes a second O(document) tax from the common caret path. Expanded selections still scan the index because range coverage can legitimately cross many nodes.

## Prevention

- Profile core publication buckets before blaming React rendering in large-document typing lanes.
- Treat text operations, selection operations, and structural operations as different snapshot classes.
- Reuse snapshot indexes only for path-stable operation classes.
- Keep a focused contract that stores a text snapshot, commits another text edit, and proves the first snapshot still reads the old text.
- In benchmark reports, separate direct model typing from native `beforeinput` typing; after this fix direct typing flipped green, while native event overhead remained a separate owner.

## Related Issues

- [Slate v2 huge-document typing needs selector-fanout cuts before islands](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-slate-v2-huge-document-typing-needs-selector-fanout-cuts-before-islands.md)
- [Slate v2 huge-document paste should not rerender unchanged descendants](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-06-slate-v2-huge-document-paste-should-not-rerender-unchanged-descendants.md)
- [Slate v2 legacy compare benchmark must align Bun workspace source and built React surfaces](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-05-01-slate-v2-legacy-compare-benchmark-must-align-bun-workspace-source-and-built-react-surfaces.md)
