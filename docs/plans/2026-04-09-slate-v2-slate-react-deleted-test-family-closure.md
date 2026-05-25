---
date: 2026-04-09
topic: slate-v2-slate-react-deleted-test-family-closure
---

# Slate V2 Slate React Deleted Test-Family Closure

> Historical batch note. The live closure read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Scope

Close the deleted `packages/slate-react/test/**` family with explicit restore
vs cut accounting instead of leaving it as a vague non-core blocker.

## Family Closure Matrix

| Deleted file                                            | Current claim cluster                                                             | Status          | Current proof owner                                                                                | Resolution                                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `packages/slate-react/test/use-slate-selector.spec.tsx` | selector equality + selector identity swap                                        | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current runtime proof already covers referential stability and selector replacement               |
| `packages/slate-react/test/use-slate.spec.tsx`          | provider editor + version counter exposure                                        | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current runtime proof already covers `useSlateWithV` and hook-surface editor exposure             |
| `packages/slate-react/test/react-editor.spec.tsx`       | mounted window + helper surface                                                   | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current mounted-bridge runtime proof already covers helper/window behavior                        |
| `packages/slate-react/test/react-editor.spec.tsx`       | `ReactEditor.focus` null-selection init, mid-transform safety, no `onValueChange` | `recovered now` | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx) | direct proof now covers the deleted focus rows on the live mounted bridge                         |
| `packages/slate-react/test/editable.spec.tsx`           | callback partition                                                                | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current runtime proof already covers `onChange` / `onSelectionChange` / `onValueChange` partition |
| `packages/slate-react/test/editable.spec.tsx`           | low-level `Editable` translate policy                                             | `recovered now` | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx) | source and direct proof now restore default `translate=\"no\"` plus override                      |
| `packages/slate-react/test/editable.spec.tsx`           | structured split/merge mount identity                                             | `recovered now` | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx) | direct proof now covers stable element mounts on the current structured surface                   |
| `packages/slate-react/test/use-selected.spec.tsx`       | selection-overlap rerender                                                        | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current element-hook runtime proof already covers selection switching                             |
| `packages/slate-react/test/use-selected.spec.tsx`       | path-rebasing stability after structural edits                                    | `recovered now` | [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx) | direct proof now covers the selected element staying selected after path shift                    |
| `packages/slate-react/test/use-selected.spec.tsx`       | chunking-specific branch                                                          | `explicit skip` | none                                                                                               | the current package no longer ships the deleted chunking tree                                     |
| `packages/slate-react/test/decorations.spec.tsx`        | render-leaf split metadata + projection-local decoration behavior                 | `mirrored now`  | [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)                   | current runtime proof already covers the surviving value on the projection-driven renderer        |
| `packages/slate-react/test/decorations.spec.tsx`        | exact old `decorate` API parity                                                   | `explicit skip` | none                                                                                               | the current package is projection-first here; the old `decorate` prop is not live contract        |
| `packages/slate-react/test/chunking.spec.ts`            | internal chunk-tree reconcile logic                                               | `explicit skip` | none                                                                                               | dead internal architecture, not current contributor-facing proof                                  |
| `packages/slate-react/test/tsconfig.json`               | test-local harness config                                                         | `explicit skip` | none                                                                                               | no current value in reviving a deleted test-local tsconfig                                        |

Totals:

- `mirrored now`: `5`
- `recovered now`: `4`
- `explicit skip`: `3`
- reconciled deleted files: `8`

## What Was Restored

- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
  now directly proves:
  - `ReactEditor.focus` initializes selection from `null`
  - `ReactEditor.focus` stays safe mid-transform
  - `ReactEditor.focus` does not trigger `onValueChange`
  - `Editable` defaults `translate=\"no\"` and allows override
  - `EditableBlocks` keeps element mounts stable across split/merge
  - `useSelected` stays true for the same element after structured path
    rebasing
- [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
  now owns the restored `translate` attribute and suppresses transient
  unresolved DOM-point errors during focus-time selection restore

## What Stayed Mirrored

- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
  remains the proof owner for:
  - hook surface basics
  - selector equality
  - provider version exposure
  - callback partition
  - mounted helper/window behavior
  - render-leaf/projection-local decoration behavior

## Explicit Skip Rationale

### `chunking.spec.ts`

- the deleted chunk-tree reconcile module is gone
- the live `slate-react` contract does not claim that internal tree anymore
- restoring it would resurrect dead architecture, not contributor-facing proof

### `decorations.spec.tsx` exact `decorate` parity

- the current package is projection-first
- the live renderer value is already proved through `renderLeaf` plus
  projection-store behavior
- restoring the old `decorate` prop would widen the current contract instead of
  closing it

### `tsconfig.json`

- test execution is owned by the package script
- the deleted test-local tsconfig added no current contributor-facing value

## Proof Owners

- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
