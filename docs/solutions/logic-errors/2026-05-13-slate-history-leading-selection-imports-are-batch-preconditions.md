---
title: Slate history leading selection imports are batch preconditions
date: 2026-05-13
category: docs/solutions/logic-errors
module: slate-v2 slate-history
problem_type: logic_error
component: testing_framework
symptoms:
  - Undo after typing at a DOM-imported middle-block caret restored selection to the start of the block.
  - A focused browser undo row passed while a package-level mixed commit still stored stale history selection.
  - Redo needed to keep explicit selection operations that occur after the first text operation.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-history, selection, undo, redo, set-selection]
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

Undo and redo should set `batch.selectionBefore` unconditionally, including
`null`, because a valid history precondition can be "no selection":

```ts
tx.selection.set(batch.selectionBefore)
tx.operations.replay(batch.operations)
```

Keep `set_selection` operations after the first saveable operation in the
batch. Those operations are part of the user-visible edit result, and redo must
replay them.

## Why This Works

History units are grouped around model-changing operations. A leading DOM
selection import only establishes where the model change should happen; it is
not itself the undoable edit.

Capturing the batch start after leading selection imports matches the old Slate
history behavior without returning to operation-by-operation plugin wrapping.
It also keeps Slate v2 operation-first history intact for collaboration rebase,
because `selectionBefore` still flows through the existing range transform path.

## Prevention

- Add package contracts for mixed commits, not only browser rows.
- When a commit starts with non-saveable operations, decide whether they are
  preconditions or replayable results before storing the history batch.
- Keep paired undo and redo assertions: undo proves the batch start selection,
  redo proves trailing selection operations were not trimmed.
- Keep browser undo rows as integration proof, but use package tests to lock
  core history semantics.

## Related Issues

- [Slate React history hotkeys must repair DOM after model undo](../ui-bugs/2026-04-21-slate-react-history-hotkeys-must-repair-dom-after-model-undo.md)
- [Slate React native IME history boundaries need explicit push metadata](../ui-bugs/2026-05-07-slate-react-native-ime-history-boundaries-need-explicit-push-metadata.md)
- [Lexical history harvest rows need stack-law contracts](../best-practices/2026-05-09-lexical-history-harvest-rows-need-stack-law-contracts.md)
