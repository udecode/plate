---
title: Slate history leading selection imports are batch preconditions
date: 2026-05-13
last_updated: 2026-05-21
category: docs/solutions/logic-errors
module: slate-v2 slate-history
problem_type: logic_error
component: testing_framework
symptoms:
  - Undo after typing at a DOM-imported middle-block caret restored selection to the start of the block.
  - A focused browser undo row passed while a package-level mixed commit still stored stale history selection.
  - Redo needed to keep explicit selection operations that occur after the first text operation.
  - In a multi-root document, the second toolbar undo moved the focused body caret while undoing a header-owned batch.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-history, selection, undo, redo, set-selection, multi-root]
---

# Slate history leading selection imports are batch preconditions

## Problem

`slate-history` captured `batch.selectionBefore` from the commit-wide
`selectionBefore`. When a commit first imported the DOM caret with
`set_selection` and then inserted text, undo restored the stale model selection
from before the caret import.

## Symptoms

- Typing at the end of an example, scrolling, typing again, and undoing could
  restore the selection to the wrong block position.
- The existing plaintext browser row passed, because it did not force a single
  package commit containing both selection import and text insertion.
- A package repro with `set_selection(start -> middle)` followed by
  `insert_text` undid the text but restored `[0,0]@0` instead of `[0,0]@3`.
- In a multi-root runtime, undoing a header edit from the main view removed the
  right text but moved the focused body selection. The text changed in the
  header, but the visible cursor jumped in the body.

## What Didn't Work

- Treating the browser row as enough proof. It showed the visible flow could
  pass, but not that the core history batch stored the right precondition.
- Fixing selection export after undo. That would only paint over a bad history
  batch; redo and replay would still be built from stale data.
- Adding public history bookmarks or full editor snapshots. Slate v2 already
  had enough commit operations to compute the correct batch start internally.

## Solution

Build each history batch from the first saveable operation. Selection-only
operations before that point are preconditions for the edit, so apply them to
the batch start selection and trim them from stored operations:

```ts
const prepareHistoryBatch = (
  selectionBefore: Range | null,
  operations: readonly Operation[]
) => {
  const firstSaveableIndex = operations.findIndex(shouldSave)

  if (firstSaveableIndex === -1) {
    return null
  }

  let batchSelectionBefore = cloneRange(selectionBefore)

  for (let index = 0; index < firstSaveableIndex; index++) {
    const operation = operations[index]!

    if (operation.type === 'set_selection') {
      batchSelectionBefore = applySelectionPatch(
        batchSelectionBefore,
        operation.newProperties
      )
    }
  }

  return {
    operations: [...operations.slice(firstSaveableIndex)],
    selectionBefore: batchSelectionBefore,
  }
}
```

For multi-root documents, the precondition range must also preserve root
identity. A leading `set_selection` operation may carry the root on the
operation rather than on each point, so `applySelectionPatch` needs the
operation root when it clones points:

```ts
const clonePoint = (point: Range['anchor'], root?: string) => {
  const nextRoot = point.root ?? root

  return {
    offset: point.offset,
    path: [...point.path],
    ...(nextRoot && nextRoot !== 'main' ? { root: nextRoot } : {}),
  }
}

batchSelectionBefore = applySelectionPatch(
  batchSelectionBefore,
  operation.newProperties,
  operation.root
)
```

Undo and redo should set `batch.selectionBefore` unconditionally, including
`null`, because a valid history precondition can be "no selection":

```ts
tx.selection.set(batch.selectionBefore)
tx.operations.replay(batch.operations)
```

When the saved range is rooted, restore it only if it belongs to the invoking
view root. A single browser selection cannot both keep the body caret active and
restore an off-focus header caret. Cross-root history should change the other
root's content without moving the active view selection:

```ts
const root = getRangeRootOrMain(batch.selectionBefore)

if (root !== tx.view.root()) {
  return
}

tx.operations.replay([rootedSetSelectionOperation])
```

Keep `set_selection` operations after the first saveable operation in the
batch. Those operations are part of the user-visible edit result, and redo must
replay them.

For toolbar-driven multi-root examples, run document history through the active
root view and then refocus that editable while preserving its DOM range.
State-only undo should preserve title/input focus. Cross-root content undo
should not globally force the active root to follow the restored batch root.

## Why This Works

History units are grouped around model-changing operations. A leading DOM
selection import only establishes where the model change should happen; it is
not itself the undoable edit.

Capturing the batch start after leading selection imports matches the old Slate
history behavior without returning to operation-by-operation plugin wrapping.
It also keeps Slate v2 operation-first history intact for collaboration rebase,
because `selectionBefore` still flows through the existing range transform path.

Rooted history adds one more invariant: the range precondition, the invoking
view root, and the replayed selection operation must agree on ownership. If the
range is cloned rootless, or if a rooted range is replayed through the wrong
view, document text can undo correctly while the active caret moves somewhere
the user did not ask for.

## Prevention

- Add package contracts for mixed commits, not only browser rows.
- When a commit starts with non-saveable operations, decide whether they are
  preconditions or replayable results before storing the history batch.
- Keep paired undo and redo assertions: undo proves the batch start selection,
  redo proves trailing selection operations were not trimmed.
- Keep browser undo rows as integration proof, but use package tests to lock
  core history semantics.
- In multi-root tests, invoke history from a focused root while the next history
  batch belongs to another root, then assert the focused root selection is
  unchanged.
- In examples with external toolbar buttons, test the full browser loop:
  focus root A, undo root A, undo root B, then type again and assert typing
  still lands in root A.

## Related Issues

- [Slate React history hotkeys must repair DOM after model undo](../ui-bugs/2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Slate React native IME history boundaries need explicit push metadata](../ui-bugs/2026-05-07-slate-react-native-ime-history-boundaries-need-explicit-push-metadata.md)
- [Lexical history harvest rows need stack-law contracts](../best-practices/2026-05-09-lexical-history-harvest-rows-need-stack-law-contracts.md)
