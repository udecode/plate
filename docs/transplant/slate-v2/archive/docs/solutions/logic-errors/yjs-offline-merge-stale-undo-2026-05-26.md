---
title: Repair offline merge undo after Yjs reconnect
date: 2026-05-26
last_updated: 2026-05-26
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Offline Backspace merge reconnects to the correct shared text
  - Keyboard Undo on the offline peer can no-op or split at an old text offset
  - Potion keeps the concurrent insert when undoing the offline merge
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, merge-node, undo-redo, playwright]
---

# Repair offline merge undo after Yjs reconnect

## Problem
A disconnected peer can merge two paragraphs with Backspace while another peer inserts into the surviving left text. Reconnect converges correctly to `alpha!beta`, but the disconnected peer's local Slate undo history can still hold the old merge split point. The correct undo is not a stale no-op; it should undo the local merge and preserve the remote insert as `alpha! / beta`.

## Symptoms
- A writes `alpha` / `beta`.
- B disconnects and presses Backspace at the start of `beta`, locally producing `alphabeta`.
- A inserts `!` after `alpha`.
- B reconnects and all peers converge to `alpha!beta`.
- B presses keyboard Undo.
- Broken behavior: undo no-ops or splits at the old offset.
- Expected behavior: all peers become `alpha!` / `beta`.

## What Didn't Work
- Fixing only the Yjs merge encoder made reconnect converge, but left Slate's local history stack pointing at the pre-remote-edit split position.
- Dropping the stale merge batch avoided bad undo, but it made the user's local merge impossible to undo even though Potion could preserve the remote insert.
- Letting the historic Slate commit fall back to snapshot export turned a local stale replay into shared Yjs state.
- Treating the result as a button issue missed the fact that keyboard Undo used the same stale Slate history batch.

## Solution
During remote import history repair, rebase a text-level `merge_node` history batch to the current previous text leaf length:

```ts
const repairTextMergeHistoryOperation = (
  operation: Extract<Operation, { type: 'merge_node' }>,
  value: Value
) => {
  const node = getTextNode(value, operation.path)

  if (!node) {
    return true
  }

  const slateIndex = operation.path.at(-1)

  if (slateIndex === undefined || slateIndex <= 0) {
    return true
  }

  const previousNode = getTextNode(value, [
    ...operation.path.slice(0, -1),
    slateIndex - 1,
  ])
  const previousText =
    typeof previousNode?.text === 'string' ? previousNode.text : null

  if (previousText == null) {
    return true
  }

  operation.position = previousText.length

  return true
}
```

The Playwright regression should press the real keyboard undo shortcut after reconnect and assert every peer becomes `alpha! / beta`.

## Why This Works
Yjs keeps the concurrent insert attached to the live left text, so reconnect can converge to `alpha!beta`. Slate history stores a concrete `merge_node.position`; after the remote `!` lands, the old split point no longer represents the boundary between the user's two original paragraphs. Rewriting the history position to the current previous text length preserves the user's intent: undo my merge, not the remote insert.

## Prevention
- Add browser coverage for reconnect followed by real keyboard Undo, not just reconnect convergence.
- Treat stale structural history after remote import as repairable only when its semantic target still exists in the converged value.
- If `applyYjsHistory()` rejects a historic commit and Slate fallback would export a divergent replay, inspect the local history batch before changing Yjs conflict handling.
- Use Potion as a differential oracle for offline structural undo. If Potion preserves a remote insert, dropping the local undo is probably too weak.

## Related Issues
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-backspace-merge-normalization-reconnect-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-forward-move-history-fallback-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`
