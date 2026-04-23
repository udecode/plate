---
date: 2026-04-12
topic: slate-v2-restore-dom-family-closure-matrix
---

# Restore DOM Family Closure Matrix

> Historical batch note. The live closure read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Purpose

Break the deleted legacy `restore-dom` family into behavior rows that can be
proved, cut, or left tooling-blocked explicitly.

Legacy source:

- [restore-dom.tsx](/Users/zbeyens/git/slate/packages/slate-react/src/components/restore-dom/restore-dom.tsx)
- [restore-dom-manager.ts](/Users/zbeyens/git/slate/packages/slate-react/src/components/restore-dom/restore-dom-manager.ts)

Current owners:

- [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
- [react-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts)
- [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts)
- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)

## Behavior Matrix

| Legacy behavior | Legacy mechanism | Current read | Classification | Current owner / gap |
| --- | --- | --- | --- | --- |
| buffer browser mutations only during real user input | `receivedUserInput` gate | current runtime does not use the same pre-commit DOM replay lifecycle | `justified-omission` | non-current lifecycle guard; see [2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md) |
| restore removed/added DOM nodes before React commit | mutation observer + `getSnapshotBeforeUpdate` | current runtime owns direct DOM commit on `input` / `compositionend` instead of pre-commit DOM replay; visible behavior rows are green on the current seams | `justified-omission` | superseded by current root-owned DOM commit plus direct behavior rows |
| ignore `characterData` mutation restore during composition | explicit skip in restore manager | main IME rows are green on the behavior-bearing current surfaces without this family | `covered-by-current-proof` | current IME proof lanes own this user-visible behavior |
| Android-only activation of the restore-dom wrapper | `IS_ANDROID` guard | current Android rows are green on placeholder, no-FEFF placeholder, inline-edge, void-edge, and split/join without this wrapper | `covered-by-current-proof` | Android proof is narrower than the full legacy matrix, but this guard no longer stands as its own unresolved family |
| restore before update, clear after update, then resume observation | class lifecycle contract | current runtime no longer depends on that rerender-era lifecycle to keep visible editor behavior correct | `justified-omission` | old lifecycle shape is not the current architecture contract |

## Current Hard Read

The deleted family is not one thing.

It mixes:

- Android-only runtime protection
- mutation replay around React commit timing
- composition-sensitive guardrails

The current proof stack already says:

- main IME rows are green without `restore-dom`
- transient DOM-point focus failure already fails closed

What it now says:

- the behavior-bearing rows formerly protected by `restore-dom` are either
  directly green or no longer current runtime lifecycle requirements

## Closure Read

The family is ready to reclose as:

- behavior rows covered on current proof surfaces
- rerender-era mutation replay lifecycle explicitly non-current
