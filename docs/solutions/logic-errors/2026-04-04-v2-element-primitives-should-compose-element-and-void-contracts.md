---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 element primitives should compose element and void contracts
tags:
  - slate-v2
  - slate-react-v2
  - element
  - void
  - renderer
severity: medium
---

# V2 element primitives should compose element and void contracts

## What happened

After packaging the v2 text-side contracts, the proof surfaces were still
assembling the element side by hand:

- ordinary element wrappers
- void wrappers
- non-editable void content
- spacer placement

That meant the text layer was packaged but the element layer still lived in
examples.

## What fixed it

`slate-react-v2` now owns the next compositional layer:

- [EditableElement](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/editable-element.tsx)
- [VoidElement](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/void-element.tsx)

Those build on the lower-level primitives:

- `SlateElement`
- `SlateSpacer`

The proof surfaces and matrix routes now consume the element layer instead of
reassembling it manually.

## Why this works

The void/browser proofs already established that spacer placement and void
content boundaries are not optional markup details.
They are part of the renderer/input contract.

Once that is true, hand-writing the void seam in every proof file is just
another way to leak renderer ownership back into examples.

## Reusable rule

For `slate-react-v2`:

- package low-level DOM attrs first
- then package repeated branch logic
- then package repeated element/void composition

Do not stop halfway through the renderer stack and leave the remaining contract
living in example files.

## Related issues

- [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)
- [2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md)
- [2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-void-like-zero-width-ime-proofs-need-the-real-void-spacer-structure.md)
