---
module: AI
date: 2026-03-26
problem_type: performance_issue
component: assistant
symptoms:
  - "Insert-mode AI streaming hitches on large documents before the first preview chunk appears"
  - "Accepting or canceling a streamed preview can touch the whole document even when only one block changed"
  - "Untouched blocks lose identity because preview accept/cancel rebuilds the entire editor value"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - undo
  - redo
  - performance
  - history
  - selection
  - streamInsertChunk
---

# AI streaming preview should use localized rollback

## Problem

Insert-mode AI preview was restoring and recommitting the whole editor value.

That kept chunk history out of undo, but it still deep-cloned the full document and used full-document `setValue` on accept and cancel. Large documents therefore paid a document-sized cost for a paragraph-sized preview.

## Symptoms

- The first streamed insert chunk felt slower on long documents.
- Accept and cancel touched more editor state than the preview actually changed.
- Untouched blocks were more likely to lose identity because the whole tree was replaced.

## Solution

Treat insert-mode preview as a localized top-level block range instead of a full-document snapshot.

### 1. Capture only the replaced slice

`tf.ai.beginPreview` stores:

- `originalBlocks`: the exact top-level blocks the preview overwrites
- `selectionBefore`: the original selection

When streaming starts from an empty paragraph, `originalBlocks` is that paragraph. When streaming inserts after existing content, `originalBlocks` is `[]`.

### 2. Mark preview-owned blocks during streaming

`streamInsertChunk` tags preview-owned top-level blocks with `aiPreview: true` while keeping AI text leaves marked with the normal AI text prop.

That makes the live preview range discoverable without relying on drifting paths.

### 3. Cancel by restoring only the marked range

`tf.ai.cancelPreview()`:

- finds the contiguous top-level `aiPreview` range
- replaces only that range with `originalBlocks`
- removes the AI chat anchor
- restores `selectionBefore`

All of that runs in `withoutSaving`, so preview cancel still stays out of history.

### 4. Accept by localized restore-then-commit

`tf.ai.acceptPreview()`:

- clones only the marked preview blocks
- strips `aiPreview` and AI text marks from that local clone
- restores the original block slice with `withoutSaving`
- inserts the accepted local blocks in one fresh history batch
- stamps that batch with the original `selectionBefore`

That produces a single undoable commit whose cost scales with the preview range, not the whole document.

## Why This Works

The preview and the committed edit need different behavior:

- preview needs cheap incremental rendering with no history writes
- accept needs one real undoable edit

The trick is not “snapshot everything once.” The trick is “remember only what this preview replaced, then commit only that region.”

That keeps:

- chunk history out of undo
- accept and cancel local
- undo restoring the original content and selection
- redo restoring the accepted content and selection

## Prevention

- Do not use full-document `setValue` for insert-mode preview accept or cancel.
- Store the overwritten top-level slice, not the entire editor value.
- Tag preview-owned streamed blocks so the current preview range can be found from the document itself.
- Keep anchor removal out of the committed batch. The original state did not contain the anchor.
- Test the full flow:
  - preview stays out of history
  - cancel restores exact content and selection
  - accept creates one undoable batch
  - undo restores original content and selection
  - redo restores accepted content and selection
