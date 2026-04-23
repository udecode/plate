---
date: 2026-04-09
topic: slate-v2-node-utility-surface-recovery
status: completed
---

# Slate v2 Node Utility Surface Recovery

## Goal

Recover the missing `Node` / `Element` / `Text` utility breadth so the public
node API is not a docs-only fantasy.

## Completed

- restored the wider `Text.*` helper surface:
  - `isTextList`
  - `isTextProps`
  - `matches`
  - `decorations`
- restored the wider `Element.*` helper surface:
  - `isAncestor`
  - `isElementList`
  - `isElementProps`
  - `isElementType`
  - `matches`
- replaced the `Node.*` stub with the broader traversal/retrieval/check/text
  surface:
  - `ancestor`
  - `ancestors`
  - `child`
  - `children`
  - `common`
  - `descendant`
  - `descendants`
  - `elements`
  - `extractProps`
  - `first`
  - `fragment`
  - `get`
  - `getIf`
  - `has`
  - `isAncestor`
  - `isEditor`
  - `isElement`
  - `isNode`
  - `isNodeList`
  - `isText`
  - `last`
  - `leaf`
  - `levels`
  - `matches`
  - `nodes`
  - `parent`
  - `string`
  - `texts`
- widened `snapshot-contract.ts` to prove traversal, `pass` pruning, fragment
  slicing, text decoration splitting, and the main type-guard helpers

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
