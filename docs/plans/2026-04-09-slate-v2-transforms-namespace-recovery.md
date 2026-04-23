---
date: 2026-04-09
topic: slate-v2-transforms-namespace-recovery
status: completed
---

# Slate v2 Transforms Namespace Recovery

## Goal

Restore the legacy transform helper namespace objects as thin public sugar over
the current v2 engine.

## Completed

- exported:
  - `GeneralTransforms`
  - `NodeTransforms`
  - `SelectionTransforms`
  - `TextTransforms`
- kept them thin:
  - `GeneralTransforms.applyBatch(...)` is one outer transaction over ordered
    `editor.apply(...)` calls
  - `GeneralTransforms.transform(...)` is direct `editor.apply(...)` sugar
  - the node/selection/text namespaces delegate to the current `editor.*` /
    transform seams
- widened `snapshot-contract.ts` to prove the namespace exports and behavior
- updated the public transforms docs and package/control docs to include the
  recovered family

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
