---
title: Read Yjs merged text containers as canonical Slate leaves
date: 2026-05-27
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - A real Backspace merge stores adjacent compatible text in separate Yjs containers.
  - `readSlateValueFromYjs` returns `alpha` and `beta` as two Slate text leaves after the editor merged them into `alphabeta`.
  - Late-joining peers bootstrap with adjacent compatible text leaves.
  - Canonical read paths can break Slate-to-Yjs selection mapping when offsets land in the second Yjs container.
  - Reusing canonical read paths for history repair can make offline merge undo split concurrent text at the wrong offset.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-yjs, yjs, merge-node, text-leaves, selection]
---

# Read Yjs merged text containers as canonical Slate leaves

## Problem
The Backspace merge encoder keeps the left and right text in separate
`Y.XmlText` containers so concurrent inserts stay attached to live shared types.
That is correct for conflict handling, but a plain read exposed those containers
as adjacent compatible Slate text leaves, so late peers did not match the
canonical editor value.

## Symptoms
- A local editor applies the real Backspace batch:

```ts
[
  { type: 'merge_node', path: [1], position: 1 },
  { type: 'merge_node', path: [0, 1], position: 5 },
]
```

- The initiating editor reads `[{ text: 'alphabeta' }]`.
- `readSlateValueFromYjs(root)` and a late peer read
  `[{ text: 'alpha' }, { text: 'beta' }]`.
- A naive read fix makes operation replay use canonical paths, so the second
  `merge_node` cannot find raw path `[0, 1]` and falls back to snapshot
  replacement, dropping concurrent inserts.
- A second naive fix feeds canonical merged children into remote history repair.
  That hides the raw split at `[0, 1]`, leaves the merge undo position stale, and
  turns `alpha!beta` into `alpha` / `!beta` on undo.

## What Didn't Work
- Merging the right text into the left `Y.XmlText` would make the stored value
  look canonical, but it reintroduces same-offset conflicts with remote inserts.
- Globally merging all adjacent same-mark text leaves during read would destroy
  intentional metadata boundaries inside a single `Y.XmlText`.
- Making `getYjsTextLeaves` always return canonical paths breaks structural
  operation replay because operation batches still address raw intermediate
  Slate paths.

## Solution
Keep two path views over the same Yjs tree:

- Raw leaf paths for operation replay and structural encoders.
- Virtual merged leaf paths for `readSlateValueFromYjs` and selection mapping.
- Raw child-boundary reads for remote history repair.

When reading an element, merge adjacent compatible text only at Yjs child
boundaries. Do not merge metadata leaves produced by the same `Y.XmlText`:

```ts
appendYjsReadChildren(children, readYjsNode(child, options))
```

For selection mapping, allow one Slate text path to span multiple Yjs text
segments by recording each segment's Slate offset range:

```ts
{
  path: [...previous.path],
  sharedText: child,
  slateStart: previous.slateEnd,
  slateEnd: previous.slateEnd + text.length,
}
```

Then map Slate offsets through the segment range before creating a Yjs relative
position:

```ts
index: leaf.start + point.offset - leaf.slateStart
```

## Why This Works
Yjs conflict safety depends on preserving shared-type identity. Slate
canonicality depends on exposing adjacent compatible text as one leaf. Those are
different views, not competing storage strategies. Raw paths keep the operation
encoder and history repair faithful to Slate's intermediate operation batch;
virtual paths keep read values and selections faithful to the final editor value.

## Prevention
- Add regressions that assert both `readSlateValueFromYjs` and late peer
  bootstrap after real Backspace merge batches.
- Include a Slate-to-Yjs-to-Slate range round trip at an offset inside the second
  Yjs container.
- Keep operation replay tests that prove concurrent inserts survive the same
  Backspace merge.
- Keep browser history tests that undo the same offline merge after reconnect.
- Do not make structural encoders consume the same canonical path view used by
  read/bootstrap paths.

## Related Issues
- `docs/solutions/logic-errors/yjs-backspace-merge-normalization-reconnect-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-text-leaf-metadata-delta-sync-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-offline-merge-stale-undo-2026-05-26.md`
