---
date: 2026-04-13
topic: slate-v2-exhaustive-api-contract-recovery
status: active
---

# Slate v2 Exhaustive API Contract Recovery Plan

## Purpose

Recover every remaining legacy-vs-current API regression in the kept
`slate-v2` public surfaces.

This remains the supporting recovery plan for kept public-surface rows.

Current batch order is owned by
[2026-04-18-slate-v2-lossless-remaining-work-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-lossless-remaining-work-replan.md),
which requires claim-width audit and residue classification before any broader
package/source recovery language.

This plan exists because file-level closure was not enough.
Name-only helper recovery is not contract recovery.

This plan is not the whole remaining-work story anymore.

Example parity is now a sibling blocker with its own owner:

- [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)

## Problem Frame

The current stack overclosed the public-surface lane.

What failed:

- some legacy API rows were marked `mapped-mirrored`
- the current helper existed
- the current helper had some proof
- but the accepted arguments, option bag, or behavior width were narrower than
  legacy

Concrete known miss family:

- `Editor.before(...)`
- `Editor.after(...)`

Legacy rows that were overclaimed:

- `voids: true`
- `nonSelectable` traversal

Current shipped surface:

- `Path | Point | Range`
- `{ distance?: number }`

That is not full legacy parity.

Current progress:

- the first exposed `before/after` miss family is now recovered:
  - `unit`
  - `voids`
  - `nonSelectable` traversal
- the exact editor API audit matrix now exists at
  [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- the supporting audit matrices now also exist at:
  - [slate-transforms-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-transforms-api.md)
  - [slate-interfaces-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-interfaces-api.md)
  - [slate-react-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-react-api.md)
  - [slate-history-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-history-api.md)
- direct legacy oracle proof is now tightened in the dedicated query owner for:
  - `before`
  - `after`
  - `next`
  - `previous`
  - `levels`
  - `unhangRange`
- `Editor.nodes/**` is now directly proved by
  [legacy-editor-nodes-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts)
- the non-Editor `interfaces/**` namespaces are now directly proved by
  [legacy-interfaces-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts)
- `positions` is now also recovered on the kept editor surface:
  - block-boundary traversal
  - reverse traversal
  - `unit`
  - `voids`
  - inline-fragmentation rows
- the direct transform audit in
  [legacy-transforms-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-transforms-fixtures.ts)
  is now green, so the old blanket transform reopen is gone
- the transform matrix still keeps real non-green rows:
  - `explicit-skip`

## Default Recovery Policy

Because the requested direction is to recover, not just classify:

1. default action is **recover code + proof**
2. explicit cut is allowed only when:
   - the semantics are incoherent in the current engine, or
   - the value is clearly not worth the surface cost, and
   - the cut is explicitly recorded in the live docs/ledgers
3. do not create new “better cut” rows casually just to make the lane smaller

## Source Of Truth

Legacy truth:

- legacy docs under `/Users/zbeyens/git/slate/docs/api/**`
- legacy tests under `/Users/zbeyens/git/slate/packages/slate/test/**`
- legacy tests under `/Users/zbeyens/git/slate/packages/slate-history/test/**`

Current truth:

- current docs under `/Users/zbeyens/git/slate-v2/docs/**`
- current source under `/Users/zbeyens/git/slate-v2/packages/**`
- current proof files under `/Users/zbeyens/git/slate-v2/packages/*/test/**`

Live control owners:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

## Non-Negotiable Rules

1. Audit by API row, not by family vibe.
2. For each kept row, verify:
   - accepted arguments
   - option bag
   - return shape
   - behavior width
3. A row is not mirrored just because the helper name survived.
4. A legacy test file mapped to a current proof file is not enough by itself.
5. Recovery beats doc-only narrowing when the user still wants the legacy
   contract.
6. If a cut survives, it must be explicit in:
   - exact ledger
   - proof ledger
   - verdict/control docs
   - maintainer context

## Deliverables

### 1. Generated API Audit Matrices

Add exact audit matrices under `docs/slate-v2/ledgers/` for:

- `slate-editor-api.md` (`landed`)
- `slate-transforms-api.md` (`landed`)
- `slate-interfaces-api.md` (`landed`)
- `slate-history-api.md` (`landed`)
- `slate-react-api.md` (`landed`)

Each row must contain:

- legacy row key
- legacy source file
- current source owner
- current proof owner
- current docs owner
- status:
  - `mapped-mirrored`
  - `mapped-recovered`
  - `mapped-mixed`
  - `explicit-skip`
- exact mismatch note

### 2. Recovery Code + Proof

Recover missing contract width in code and tests for every row that stays in the
kept public surface.

### 3. Live Truth Sync

After each recovery wave, sync:

- exact ledgers
- proof ledger
- roadmap
- verdict
- maintainer drift register

## Recovery Waves

### Wave 1. Editor Query / Location Helpers

Goal:

- recover the helper families most likely to hide option-bag drift

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/query-contract.ts`
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md`

Legacy families to audit first:

- `Editor.before/**`
- `Editor.after/**`
- `Editor.next/**`
- `Editor.previous/**`
- `Editor.positions/**`
- `Editor.nodes/**`
- `Editor.levels/**`
- `Editor.unhangRange/**`

Recovery priority:

1. `before/after` `voids`
2. `before/after` `nonSelectable`
3. other query-helper option bags

Required outcomes:

- every legacy `before/after` row is either directly proved or explicitly cut
- if `voids` stays part of the kept surface, code must accept it for
  `before/after`
- if `nonSelectable` traversal stays part of the kept surface, code must
  consult `editor.isSelectable(...)` instead of stepping blindly

### Wave 2. Transform Option-Bag Recovery

Goal:

- recover transform-helper width that may have been collapsed too aggressively

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/**`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/**`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/**`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts`
- `/Users/zbeyens/git/slate-v2/docs/api/transforms.md`

Priority families:

- `Transforms.move(...)`
- `Transforms.delete(...)`
- `Transforms.select(...)`
- `Transforms.setPoint(...)`
- `Transforms.setSelection(...)`
- helper wrappers that depend on query/location behavior

Rule:

- if Wave 1 expands location helpers, reuse that behavior here instead of
  re-encoding it in transforms

### Wave 3. Utility Namespace / Ref Surface Recovery

Goal:

- recover or explicitly cut legacy width in the exported utility namespaces

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/*.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts`

Priority families:

- `Location.*`
- `Path.*`
- `Point.*`
- `Range.*`
- `Operation.*`
- ref APIs where docs or tests still imply broader legacy width

Rule:

- do not fake legacy static helpers when the runtime model no longer supports
  them cleanly
- recover true utility semantics when they are still part of the kept public
  claim

### Wave 4. Package-Surface Recovery

Goal:

- recover package-level API width outside bare `slate` core

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/**`

Priority:

1. `slate-history`
2. `slate-react`
3. `slate-dom`

Rule:

- package rows only close after exact API-row audit is done for the kept
  surface they advertise

### Wave 5. Docs / Envelope / Ledger Reclose

Goal:

- make the public-surface closure claim honest again

Primary files:

- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- `/Users/zbeyens/git/slate-v2/packages/*/Readme.md`
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Exit:

- no live doc still treats the package-matrix pass as sufficient closure
- surviving cuts are explicit and consistent everywhere

## Execution Sequence

1. Generate the exact API audit matrices.
2. Recover `Editor.before/after` family fully.
3. Finish the rest of query/location helper families.
4. Recover transform option bags that still belong to the kept claim.
5. Recover remaining utility/package surfaces.
6. Reclose the public-surface lane in the live control docs only after the
   matrices are green.
7. Return to browser/input as the next blocker lane.

## Acceptance Criteria

- every kept public API row has an exact audit row
- zero kept API rows remain unaudited
- zero `mapped-mirrored` API rows hide narrower accepted arguments, option
  bags, return shapes, or behavior width
- every recovered row has direct proof in the smallest honest owner file
- every explicit cut is documented in ledgers, proof rows, and maintainer
  context
- the public-surface lane can be closed again without hand-waving

## Hard Read

The earlier public-surface closure was too optimistic.

The recovery path is not:

- read a few docs
- tweak a few ledger notes
- say “narrower but fine”

The recovery path is:

1. generate exact API truth
2. recover real contract width where we still claim it
3. cut only what we can defend explicitly
4. then close the lane again
