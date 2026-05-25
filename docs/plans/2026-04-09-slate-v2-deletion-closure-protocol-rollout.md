---
date: 2026-04-09
topic: slate-v2-deletion-closure-protocol-rollout
---

# Slate v2 Deletion Closure Protocol Rollout

## Scope

Roll out the deletion-closure protocol into the roadmap/process stack and use
the current Slate React overclaim as the first proving case.

## Frozen Deleted Inventory

Captured from:

```bash
git -C /Users/zbeyens/git/slate-v2 diff --diff-filter=D --name-only -- packages/slate-react
```

Exact deleted paths:

- `packages/slate-react/CHANGELOG.md`
- `packages/slate-react/src/@types/direction.d.ts`
- `packages/slate-react/src/chunking/children-helper.ts`
- `packages/slate-react/src/chunking/chunk-tree-helper.ts`
- `packages/slate-react/src/chunking/get-chunk-tree-for-node.ts`
- `packages/slate-react/src/chunking/index.ts`
- `packages/slate-react/src/chunking/reconcile-children.ts`
- `packages/slate-react/src/chunking/types.ts`
- `packages/slate-react/src/components/chunk-tree.tsx`
- `packages/slate-react/src/components/element.tsx`
- `packages/slate-react/src/components/leaf.tsx`
- `packages/slate-react/src/components/restore-dom/restore-dom-manager.ts`
- `packages/slate-react/src/components/restore-dom/restore-dom.tsx`
- `packages/slate-react/src/components/string.tsx`
- `packages/slate-react/src/components/text.tsx`
- `packages/slate-react/src/custom-types.ts`
- `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- `packages/slate-react/src/hooks/android-input-manager/use-android-input-manager.ts`
- `packages/slate-react/src/hooks/use-children.tsx`
- `packages/slate-react/src/hooks/use-composing.ts`
- `packages/slate-react/src/hooks/use-decorations.ts`
- `packages/slate-react/src/hooks/use-editor.tsx`
- `packages/slate-react/src/hooks/use-element.ts`
- `packages/slate-react/src/hooks/use-focused.ts`
- `packages/slate-react/src/hooks/use-generic-selector.tsx`
- `packages/slate-react/src/hooks/use-is-mounted.tsx`
- `packages/slate-react/src/hooks/use-mutation-observer.ts`
- `packages/slate-react/src/hooks/use-read-only.ts`
- `packages/slate-react/src/hooks/use-selected.ts`
- `packages/slate-react/src/hooks/use-track-user-input.ts`
- `packages/slate-react/src/utils/environment.ts`
- `packages/slate-react/test/chunking.spec.ts`
- `packages/slate-react/test/decorations.spec.tsx`
- `packages/slate-react/test/editable.spec.tsx`
- `packages/slate-react/test/react-editor.spec.tsx`
- `packages/slate-react/test/tsconfig.json`
- `packages/slate-react/test/use-selected.spec.tsx`
- `packages/slate-react/test/use-slate-selector.spec.tsx`
- `packages/slate-react/test/use-slate.spec.tsx`

Inventory count:

- `39` deleted paths

## Seeded Frozen-Inventory Grouping

| Scope / grouping row                                            | Frozen deleted paths covered | Notes                                               |
| --------------------------------------------------------------- | ---------------------------: | --------------------------------------------------- |
| `packages/slate-react/**`                                       |                         `39` | package parent used for closure-tree reconciliation |
| `packages/slate-react/test/**`                                  |                          `8` | existing deleted test-family bucket                 |
| `packages/slate-react/src/chunking/**`                          |                          `6` | direct deleted subtree from the frozen inventory    |
| `packages/slate-react/src/components/restore-dom/**`            |                          `2` | direct deleted subtree from the frozen inventory    |
| `packages/slate-react/src/hooks/android-input-manager/**`       |                          `2` | direct deleted subtree from the frozen inventory    |
| remaining deleted `packages/slate-react/src/hooks/*` files      |                         `10` | grouped remainder derived from the frozen inventory |
| remaining deleted `packages/slate-react/src/components/*` files |                          `5` | grouped remainder derived from the frozen inventory |
| `packages/slate-react/src/utils/environment.ts`                 |                          `1` | single-file residue                                 |
| `packages/slate-react/src/custom-types.ts`                      |                          `1` | single-file residue                                 |
| `packages/slate-react/src/@types/direction.d.ts`                |                          `1` | single-file residue                                 |
| `packages/slate-react/CHANGELOG.md`                             |                          `1` | package-root residue                                |

## Reconciliation Check

Unmatched frozen inventory paths against the seeded tree:

- `0`

## Current Correction

This rollout corrects the omission that previously let the front-door docs
imply the remaining deletion review lived elsewhere.

## What This Rollout Does Not Close

- live parent/child status stays in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- `packages/slate-react/src/**` deleted-source closure
- `packages/slate-history/test/**`
- supporting example/browser deletion families
