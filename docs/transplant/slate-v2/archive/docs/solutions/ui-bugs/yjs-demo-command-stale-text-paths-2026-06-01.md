---
title: Resolve Yjs demo commands against current text leaves
date: 2026-06-01
category: ui-bugs
module: slate-yjs
problem_type: ui_bug
component: tooling
symptoms:
  - Fragment after Fragment leaves the second peer edit invisible.
  - Wrap followed by Insert, Delete, or Back can no-op because `[0, 0]` is no longer a text path.
  - Append, Back, Fragment, Back leaves the final Back as a no-op.
  - Disconnected Replace after Wrap or Fragment throws stale path or stale offset errors.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-yjs, yjs, demo-controls, stale-paths, playwright]
---

# Resolve Yjs demo commands against current text leaves

## Problem
The Yjs collaboration demo command buttons cached the assumption that the first
editable text leaf always lives at `[0, 0]`. Structural and fragment commands
can wrap the first block or append new text leaves, so later controls operated
against stale paths and offsets.

## Symptoms
- B clicks Fragment, D clicks Fragment, and D's fragment does not appear.
- C clicks Wrap, then B clicks Insert !, and the document stays unchanged.
- C clicks Wrap, then peers click Delete or Back, and the controls do nothing.
- B clicks Append, D clicks Back, B clicks Fragment, D clicks Back, and the
  second Back does not remove the last fragment character.
- B disconnects, clicks Wrap or Fragment, clicks Replace, and reconnects. Broken
  behavior either throws a non-leaf `[0, 0]` path error or tries to delete text
  at an offset longer than the current leaf.

## What Didn't Work
- Checking only offline reconnect cases missed connected command chains.
- Looking only for page errors was too weak; some stale-path commands no-op
  without throwing.
- Fixing individual buttons would leave the same `[0, 0]` bug in the next
  control that edits text after a structural command.
- Reusing manual text operations for disconnected Replace kept the stale path
  problem even after connected Insert/Delete/Back controls resolved fresh leaves.

## Solution
Resolve the current first or last text leaf from the live Slate value before
each command mutates text or sets a synthetic selection.

```ts
const getFirstBlockTextEntry = (
  editor: CustomEditor,
  position: 'first' | 'last'
) => {
  const [block] = getEditorValue(editor)

  if (!block) {
    return null
  }

  return position === 'first'
    ? findFirstTextEntryInNode(block, [0])
    : findLastTextEntryInNode(block, [0])
}
```

Use the resolved `entry.path` and `entry.text.length` for Append, Insert,
Fragment, Delete, Back, Bold selection, and Select. The Split control also reads
the current text leaf and parent element before replaying `split_node`, instead
of replaying a hard-coded text path and block path.

For Replace, avoid manufacturing text-level operations entirely. A document
replacement is a root-fragment operation:

```ts
const operation: Operation = {
  children: value,
  newChildren: [paragraph(peer.replacementText)],
  path: [],
  root: 'main',
  type: 'replace_fragment',
}
```

That keeps disconnected Replace aligned with the same operation shape a real
editor command would emit, regardless of whether the first visible block is
plain, wrapped, or contains multiple text leaves.

## Why This Works
The demo control panel is intentionally a public-command matrix. Those commands
must behave like real user controls after previous commands change the document
shape. Resolving the text leaf at command time keeps synthetic selections and
text operations aligned with the current editor tree, whether the first text is
directly under a paragraph or nested under a wrapper.

## Prevention
- Browser tests for command matrices should include connected command chains,
  not only offline reconnect scenarios.
- Assert both final peer text and `pageerror` output. No-op command failures can
  be silent.
- Avoid hard-coded Slate text paths in demo controls unless the same helper just
  created that exact document shape.
- Prefer operation-level document commands over hand-built text edits when the
  intended user action replaces a whole fragment.

## Related Issues
- `docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md`
- `docs/solutions/ui-bugs/slate-react-structural-text-dom-sync-2026-05-28.md`
- `docs/solutions/logic-errors/yjs-split-history-dependent-redo-2026-06-01.md`
