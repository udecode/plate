---
title: Preserve offline split-node edits through reconnect merges
date: 2026-05-25
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Multiple disconnected peers edit the same initial document
  - A text replacement disappears after reconnect
  - A block split brings back a duplicate stale paragraph
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, split-node, reconnect, playwright]
---

# Preserve offline split-node edits through reconnect merges

## Problem
The Yjs collaboration demo could lose a disconnected peer's text replacement
and duplicate another peer's stale paragraph when peers reconnected after mixed
offline edits.

## Symptoms
- Peer B disconnects and bolds `Hello`.
- Peer C disconnects and replaces `Hello` with `Hi`.
- Peer D disconnects, presses Enter at the end, and types `Test`.
- Reconnecting B, C, and D converges all peers to
  `Hello world!TestHello world!` instead of two paragraphs:
  `Hi world!` and `Test`.

## What Didn't Work
- Retesting only append/undo flows missed the issue because those edits already
  used operation-level Yjs writes.
- Treating the bug as a demo timing issue was wrong. The failure reproduced
  with real keyboard input and deterministic Playwright steps.
- Allowing unsupported structural operations to fall back to full-document
  snapshot writes made the local value look correct while sending destructive
  Yjs deletes on reconnect.

## Solution
Encode Slate `split_node` operations directly in the Yjs tree.

Text splits update `slate:text-leaves` metadata on the existing `Y.XmlText` so
the original shared text container stays alive:

```ts
leaves.splice(
  leafIndex,
  1,
  { ...textLeaf, text: textLeaf.text.slice(0, operation.position) },
  {
    ...(operation.properties as Record<string, unknown>),
    text: textLeaf.text.slice(operation.position),
  }
)
setYjsTextLeaves(leaf.sharedText, leaves)
```

Element splits keep the left side in the original `Y.XmlElement`, create the
right sibling, and move the split text-leaf tail into that sibling without
replacing the whole root.

Add Playwright coverage for the browser-visible path:

```ts
B offline -> bold Hello
C offline -> type Hi over Hello
D offline -> Enter -> Test
B/C/D reconnect
assert paragraphs are ['Hi world!', 'Test']
```

## Why This Works
Yjs can merge concurrent edits when they target live shared types. The old
fallback deleted and reinserted the document tree for D's Enter key, so C's
replacement targeted a container that D had effectively replaced. Keeping the
original text container alive lets C's `Hello` -> `Hi` edit merge with D's new
paragraph instead of being overwritten by D's stale snapshot.

## Prevention
- Add operation-level Yjs encoders before accepting snapshot fallback for user
  editing operations.
- Browser tests for collaboration should mix mark, text, and structural edits;
  append-only tests are not enough.
- Assert paragraph arrays, not just flattened text, when testing reconnect
  merges involving Enter or paste.

## Related Issues
- `docs/solutions/logic-errors/yjs-offline-replace-undo-concurrent-append-2026-05-25.md`
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
