---
date: 2026-04-09
topic: plite-deletion-closure-protocol-rollout
---

# Plite Deletion Closure Protocol Rollout

## Scope

Roll out the deletion-closure protocol into the roadmap/process stack and use
the current Plite React overclaim as the first proving case.

## Frozen Deleted Inventory

Captured from:

```bash
git -C /Users/zbeyens/git/plite diff --diff-filter=D --name-only -- packages/plite-react
```

Exact deleted paths:

- `packages/plite-react/CHANGELOG.md`
- `packages/plite-react/src/@types/direction.d.ts`
- `packages/plite-react/src/chunking/children-helper.ts`
- `packages/plite-react/src/chunking/chunk-tree-helper.ts`
- `packages/plite-react/src/chunking/get-chunk-tree-for-node.ts`
- `packages/plite-react/src/chunking/index.ts`
- `packages/plite-react/src/chunking/reconcile-children.ts`
- `packages/plite-react/src/chunking/types.ts`
- `packages/plite-react/src/components/chunk-tree.tsx`
- `packages/plite-react/src/components/element.tsx`
- `packages/plite-react/src/components/leaf.tsx`
- `packages/plite-react/src/components/restore-dom/restore-dom-manager.ts`
- `packages/plite-react/src/components/restore-dom/restore-dom.tsx`
- `packages/plite-react/src/components/string.tsx`
- `packages/plite-react/src/components/text.tsx`
- `packages/plite-react/src/custom-types.ts`
- `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`
- `packages/plite-react/src/hooks/android-input-manager/use-android-input-manager.ts`
- `packages/plite-react/src/hooks/use-children.tsx`
- `packages/plite-react/src/hooks/use-composing.ts`
- `packages/plite-react/src/hooks/use-decorations.ts`
- `packages/plite-react/src/hooks/use-editor.tsx`
- `packages/plite-react/src/hooks/use-element.ts`
- `packages/plite-react/src/hooks/use-focused.ts`
- `packages/plite-react/src/hooks/use-generic-selector.tsx`
- `packages/plite-react/src/hooks/use-is-mounted.tsx`
- `packages/plite-react/src/hooks/use-mutation-observer.ts`
- `packages/plite-react/src/hooks/use-read-only.ts`
- `packages/plite-react/src/hooks/use-selected.ts`
- `packages/plite-react/src/hooks/use-track-user-input.ts`
- `packages/plite-react/src/utils/environment.ts`
- `packages/plite-react/test/chunking.spec.ts`
- `packages/plite-react/test/decorations.spec.tsx`
- `packages/plite-react/test/editable.spec.tsx`
- `packages/plite-react/test/react-editor.spec.tsx`
- `packages/plite-react/test/tsconfig.json`
- `packages/plite-react/test/use-selected.spec.tsx`
- `packages/plite-react/test/use-slate-selector.spec.tsx`
- `packages/plite-react/test/use-slate.spec.tsx`

Inventory count:

- `39` deleted paths

## Seeded Frozen-Inventory Grouping

| Scope / grouping row                                            | Frozen deleted paths covered | Notes                                               |
| --------------------------------------------------------------- | ---------------------------: | --------------------------------------------------- |
| `packages/plite-react/**`                                       |                         `39` | package parent used for closure-tree reconciliation |
| `packages/plite-react/test/**`                                  |                          `8` | existing deleted test-family bucket                 |
| `packages/plite-react/src/chunking/**`                          |                          `6` | direct deleted subtree from the frozen inventory    |
| `packages/plite-react/src/components/restore-dom/**`            |                          `2` | direct deleted subtree from the frozen inventory    |
| `packages/plite-react/src/hooks/android-input-manager/**`       |                          `2` | direct deleted subtree from the frozen inventory    |
| remaining deleted `packages/plite-react/src/hooks/*` files      |                         `10` | grouped remainder derived from the frozen inventory |
| remaining deleted `packages/plite-react/src/components/*` files |                          `5` | grouped remainder derived from the frozen inventory |
| `packages/plite-react/src/utils/environment.ts`                 |                          `1` | single-file residue                                 |
| `packages/plite-react/src/custom-types.ts`                      |                          `1` | single-file residue                                 |
| `packages/plite-react/src/@types/direction.d.ts`                |                          `1` | single-file residue                                 |
| `packages/plite-react/CHANGELOG.md`                             |                          `1` | package-root residue                                |

## Reconciliation Check

Unmatched frozen inventory paths against the seeded tree:

- `0`

## Current Correction

This rollout corrects the omission that previously let the front-door docs
imply the remaining deletion review lived elsewhere.

## What This Rollout Does Not Close

- live parent/child status stays in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/release-file-review-ledger.md)
- `packages/plite-react/src/**` deleted-source closure
- `packages/plite-history/test/**`
- supporting example/browser deletion families
