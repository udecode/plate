---
date: 2026-04-09
topic: slate-v2-slate-react-source-deleted-family-closure
---

# Slate V2 Slate React Source Deleted-Family Closure

## Scope closed

- `packages/slate-react/src/**`

## Frozen Source Inventory

Captured from:

```bash
git -C /Users/zbeyens/git/slate-v2 diff --diff-filter=D --name-only -- packages/slate-react/src
```

Exact deleted source paths: `30`

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

## Source-Family Closure Matrix

| Cluster                                                                                                                                                     | Deleted count | Status          | Current proof owner / replacement                                                                                                                                                                                                  | Resolution                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------: | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| public hook split surface (`use-composing`, `use-editor`, `use-element`, `use-focused`, `use-read-only`, `use-selected`)                                    |             6 | `mirrored now`  | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md), current hooks in `packages/slate-react/src/hooks/*.tsx`                                                                   | the deleted split hook files are carried by the current `.tsx` hook surface plus existing runtime/surface proof                                    |
| renderer primitive split surface (`element`, `leaf`, `text`, `string`)                                                                                      |             4 | `mirrored now`  | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md), current primitives in `slate-element.tsx`, `slate-leaf.tsx`, `slate-text.tsx`, `text-string.tsx`, `zero-width-string.tsx` | the old primitive split is recovered on the current renderer primitives and structured text surface                                                |
| chunking/runtime-breadth internals (`src/chunking/**`, `components/chunk-tree.tsx`, `hooks/use-children.tsx`)                                               |             8 | `explicit skip` | [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md), [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)                                                   | child-count chunking is not foundational in v2; semantic islands and selector-local invalidation are the real story                                |
| restore-dom rollback internals (`components/restore-dom/**`, `hooks/use-track-user-input.ts`, `hooks/use-is-mounted.tsx`, `hooks/use-mutation-observer.ts`) |             5 | `explicit skip` | [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx), [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                                                     | old DOM rollback architecture is replaced by the mounted bridge plus current `Editable` selection/input ownership                                  |
| old decorate subscription internals (`hooks/use-decorations.ts`, `hooks/use-generic-selector.tsx`)                                                          |             2 | `explicit skip` | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx), [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)                        | exact old decorate machinery is outside the live contract; current value survives through projection-local rendering and recovered public surfaces |
| Android-only helper internals (`hooks/android-input-manager/**`)                                                                                            |             2 | `explicit skip` | [proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md), current composition path in [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)               | Android helper internals are not part of the live public/package claim; current IME truth is owned by specialist browser lanes                     |
| `src/custom-types.ts`                                                                                                                                       |             1 | `explicit skip` | [interfaces-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md)                                                                                   | declaration-merging `CustomTypes` is outside the live structural typing contract                                                                   |
| `src/@types/direction.d.ts`                                                                                                                                 |             1 | `explicit skip` | none                                                                                                                                                                                                                               | deleted type residue, not current contributor-facing proof                                                                                         |
| `src/utils/environment.ts`                                                                                                                                  |             1 | `explicit skip` | none                                                                                                                                                                                                                               | deleted React-major helper is not part of the current public or proof surface                                                                      |

Totals:

- `mirrored now`: `10`
- `explicit skip`: `20`
- reconciled source deleted paths: `30`

## Package Parent Tree

| Scope                               | Status          | Notes                                                                                                                                                                                    |
| ----------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/slate-react/**`           | `closed`        | parent closes because every child row is now closed or explicit skip                                                                                                                     |
| `packages/slate-react/test/**`      | `closed`        | already closed in [2026-04-09-slate-v2-slate-react-deleted-test-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-react-deleted-test-family-closure.md) |
| `packages/slate-react/src/**`       | `closed`        | closed by this note                                                                                                                                                                      |
| `packages/slate-react/CHANGELOG.md` | `explicit skip` | package-root residue, not release-proof                                                                                                                                                  |

## Sibling buckets still open

- none inside `packages/slate-react/**`

## What this batch does NOT close

- `packages/slate-history/test/**`
- supporting example/browser deletion families
- future large-document runtime work like semantic islands or deeper `slate-react`
  optimization under runtime quarantine

## Why the hard parts were better-cuts

### Chunking

- current docs already say chunking is not foundational in v2
- current source no longer ships the old child-count chunking tree
- restoring it would resurrect a runtime-breadth crutch instead of closing the
  live contract

### Restore DOM

- the old class-based DOM rollback manager is not the current seam anymore
- current `Editable` owns mounted root selection/input behavior directly
- restoring the old rollback layer would create competing DOM truth paths

### Android input manager

- current IME truth is specialist browser proof, not package-internal Android
  helper state
- if the live contract needed those helpers, the package/browser proof would
  have exposed it by now

## Fresh verification required for this closure

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:dom`
