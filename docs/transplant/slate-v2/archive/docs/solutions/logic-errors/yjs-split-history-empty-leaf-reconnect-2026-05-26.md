---
title: Preserve Yjs split positions and clean split history undo
date: 2026-05-26
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Concurrent inserts after offline split_node land at the start of the document
  - Undo after offline split-at-end typing leaves an empty paragraph
  - Rapid history button replay gives remote peers taller empty paragraphs
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, slate-history, split-node, undo-redo, reconnect]
---

# Preserve Yjs split positions and clean split history undo

## Problem
Offline `split_node` handling broke Yjs positional intent when another peer inserted into the original text while the splitter was disconnected. The same split/history path also left empty text leaves behind during undo/redo, which made remote peer DOM height diverge.

## Symptoms
- B disconnects, splits `alphabeta` at `alpha|beta`, A inserts `!` at offset 2, 5, or 7, then B reconnects. The local result becomes `!alpha / beta` instead of preserving the insertion around the split.
- B disconnects, presses Enter at the end of `alpha`, types `beta`, A inserts `!`, then B reconnects and presses Cmd+Z. The local result leaves `alpha!` plus an empty paragraph.
- Pressing Enter three times and rapidly replaying Undo/Redo through the example buttons leaves remote peers with taller empty paragraphs.

## What Didn't Work
- Comparing only logical paragraph text hid the remote DOM issue. The peers converged to the same visible text while remote paragraphs still contained extra empty text leaves.
- Preventing the Undo/Redo buttons from stealing focus helped align them with the other user controls, but it did not fix the structural height bug by itself.
- Treating split reconnect as a snapshot problem missed the lower-level issue: the split code was still deleting and reinserting the original `Y.XmlText` tail.

## Solution
Keep the original Yjs text identity alive when splitting. `splitYjsTextAtLeafIndex` should delete only the tail after the split point, then clone the right side into the new block:

```ts
const beforeTextLength = before.reduce(
  (length, leaf) => length + leaf.text.length,
  0
)

if (beforeTextLength < sharedText.length) {
  sharedText.delete(beforeTextLength, sharedText.length - beforeTextLength)
}
setYjsTextLeaves(sharedText, before.length > 0 ? before : [{ text: '' }])
```

Teach Slate history that word typing into the paragraph created by the immediately previous split batch is part of that undo unit. Keep punctuation follow-up edits separate.

When applying text `merge_node` across different Yjs text containers, delete the merged leaf if it is empty:

```ts
if (leaf.text.length === 0) {
  leaf.sharedText.setAttribute(DELETED_ATTRIBUTE, 'true')
}
```

Also keep example Undo/Redo buttons from taking focus on `mousedown`, matching the other user-facing controls.

## Why This Works
Yjs can only rebase concurrent text inserts correctly when the original shared items survive. Full delete/reinsert turns a split into a destructive replacement, so concurrent inserts anchored inside the original text drift to the front of the replacement.

The undo issue had two layers. First, history treated Enter and subsequent word typing as separate undo units, so one undo removed only the word. Second, structural merge cleanup cloned empty text leaves into the surviving block but never removed them, so redo rebuilt paragraphs with multiple empty leaves and inflated height.

## Prevention
- For split and merge encoders, preserve live Yjs containers unless a test proves replacement semantics are safe.
- Add core tests for disconnected split with concurrent insert offsets before adding browser-only coverage.
- Browser tests for collaboration history should assert layout metrics, not only visible text.
- Keep a package test entrypoint that the repo's default Bun test command actually discovers.

## Related Issues
- `docs/solutions/logic-errors/yjs-offline-split-reconnect-merge-2026-05-25.md`
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
