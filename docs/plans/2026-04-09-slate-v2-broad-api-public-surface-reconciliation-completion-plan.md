---
date: 2026-04-09
topic: slate-v2-broad-api-public-surface-reconciliation-completion
status: completed
---

# Slate V2 Broad API / Public Surface Reconciliation Completion Plan

Historical note:

- this package-matrix closure pass is banked, but it no longer counts as the
  live closure verdict by itself
- exhaustive per-API/public-surface contract-width audit later reopened the
  live lane under
  [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)

## Goal

Close the `broad API / public surface reconciliation` lane in
[master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
and turn the corresponding open bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
from `partial` to closed-by-proof.

For this lane, "100% completion" means:

1. the repo can state one coherent broad package-level public claim
2. every package in that claim has an explicit stable-vs-secondary surface
3. each still-live public row is either:
   - directly proved
   - explicitly better-cut
   - clearly outside the broad claim
4. the live docs stop contradicting each other about whether public-surface
   work is “done”

## Problem Frame

The repo has already done a lot of public-surface work:

- package readmes were rewritten to describe current surfaces
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
  now documents a current package-level claim
- package root entries are source-runnable under Yarn PnP
- many previously missing exports and helper groups were recovered in:
  - `slate`
  - `slate-react`
  - `slate-dom`
  - `slate-history`
  - `slate-hyperscript`

But the lane is still open because the live proof stack says so.

The hard contradiction is already visible:

- [2026-04-09-slate-v2-public-surface-reconciliation.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-public-surface-reconciliation.md)
  says the batch was closed for the current claim
- the live proof ledger still carries a stack of `public surface` rows marked
  `partial`
- the roadmap and verdict stack still keep the lane open

So the remaining work is not “write nicer docs”.

It is:

- make the broad claim narrower and explicit enough to defend, or
- widen proof until that broader claim is honest

Right now the row set still spans:

- `slate` helper/type/export width
- `slate-react` editor-facing surface width
- `slate-dom` package-surface width
- contributor-facing `slate-hyperscript`
- proof infrastructure and package-truth docs that must not drift

## Planning Decision

Do **not** reopen already-closed recovery lanes just because they touch public
names.

Do **not** treat this lane as “recover every legacy exported name”.

Close the lane on one package-by-package public-surface matrix:

- stable public surface
- secondary public surface
- explicit non-claims
- direct proof owner for each package

That is the right target because the remaining problem is no longer “missing a
few helpers”.

The remaining problem is that the repo still has too many partial rows and not
enough explicit broad-claim boundaries.

## Scope

### In scope

- package-level public surface reconciliation across:
  - `slate`
  - `slate-react`
  - `slate-dom`
  - `slate-history`
  - `slate-hyperscript`
  - `slate-browser` where it is truly part of the public package graph
- stable-vs-secondary package surface classification
- code/export/doc/proof alignment for those claims
- closure or explicit better-cut treatment for all remaining `public surface`
  rows in the proof ledger

### Out of scope

- reopening extension, normalization, headless, or history/collaboration lanes
- browser demo expansion
- Android-only DOM internals
- performance claims
- adding new product behavior that is unrelated to public-surface truth

## Relevant Current Truth

### Already recovered

- [2026-04-09-slate-v2-slate-react-surface-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-react-surface-recovery.md)
  recovered the current React package’s editor-facing surface
- [2026-04-09-slate-v2-reacteditor-dom-helper-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-reacteditor-dom-helper-recovery.md)
  recovered the current `ReactEditor` DOM helper surface
- [2026-04-09-slate-v2-rendering-api-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-rendering-api-recovery.md)
  recovered the current rendering API surface
- [2026-04-09-slate-v2-package-readme-truth-pass.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-package-readme-truth-pass.md)
  updated package readmes to current-surface truth
- [2026-04-09-slate-v2-slate-hyperscript-proof-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-hyperscript-proof-closure.md)
  closed the contributor-facing hyperscript slot
- [2026-04-09-slate-v2-headless-core-usability-completion-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-non-react-headless-core-usability-completion-plan.md)
  and
  [2026-04-09-slate-v2-operation-history-collaboration-integrity-completion-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-operation-history-collaboration-integrity-completion-plan.md)
  already closed the neighboring lanes this batch must not silently absorb

### Relevant learnings

- [2026-04-09-slate-transform-namespaces-should-stay-thin-sugar-over-the-current-engine.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-transform-namespaces-should-stay-thin-sugar-over-the-current-engine.md)
  proves namespace recovery is fine only when it rides the same engine
- [2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md)
  proves docs should cut fake legacy helpers instead of overclaiming
- [2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md)
  proves workspace package truth includes source-runnable package-name imports
- [2026-04-09-slate-headless-proof-tests-must-declare-cross-package-workspace-deps-under-pnp.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-headless-proof-tests-must-declare-cross-package-workspace-deps-under-pnp.md)
  proves package-split proof only counts when the package graph is honest under
  PnP
- [2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md)
  proves historical plans cannot be allowed to outrank the live stack

### Current pressure points

- the proof ledger still has multiple `public surface` rows marked `partial`
- the old
  [2026-04-09-slate-v2-public-surface-reconciliation.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-public-surface-reconciliation.md)
  says “closed” while the live stack says “open”
- `replacement-candidate.md`, package readmes, and proof rows are closer than
  before, but still not obviously one broad claim

## Completion Criteria

This lane is done when all of the following are true:

1. every remaining `public surface` proof row is either `closed` or explicitly
   removed from the broad claim
2. the repo has one explicit package-surface matrix covering:
   - stable surface
   - secondary surface
   - explicit non-claims
   - proof owner
3. `replacement-candidate.md`, package readmes, and the proof ledger describe
   the same public package truth
4. stale “public-surface closed” docs that only covered a narrower current
   claim are either updated, superseded, or explicitly reframed
5. the live blocker docs can stop saying “broader public-surface lanes are
   still not fully closed”

## Implementation Units

### Unit 1. Build one package-surface matrix

Files:

- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Work:

- define one explicit matrix for each package:
  - stable public surface
  - secondary public surface
  - explicit non-claims
  - proof owner
- use that matrix to decide which partial proof rows should close, which should
  collapse together, and which should move out of the broad claim

Reason:

- right now the lane is too diffused across partial rows and prose summaries

### Unit 2. Close the `slate` core helper/type/export rows

Files:

- [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts)
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts)
- [text-units-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts)
- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- [packages/slate/src/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- [packages/slate/src/interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
- [packages/slate/src/editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)

Work:

- decide which helper/type/export rows are already broad enough to close as-is
- identify any remaining fake width that should be cut from the broad claim
  instead of kept as `partial`
- keep the stable-vs-secondary distinction explicit for `slate`

Required test scenarios:

- helper/type rows claimed in the stable `slate` surface have direct proof
- secondary exports are marked secondary, not left ambiguous
- explicit non-claims are documented where legacy helper width still does not
  land

### Unit 3. Close the package rows for `slate-react`, `slate-dom`, and `slate-hyperscript`

Files:

- [packages/slate-react/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-react/Readme.md)
- [packages/slate-dom/README.md](/Users/zbeyens/git/slate-v2/packages/slate-dom/README.md)
- [packages/slate-hyperscript/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/Readme.md)
- [packages/slate-react/test/runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [packages/slate-react/test/surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
- [packages/slate-dom/test/bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts)
- [packages/slate-dom/test/clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts)
- [packages/slate-hyperscript/test/index.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js)
- [packages/slate-hyperscript/test/smoke.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/smoke.js)

Work:

- make the stable-vs-secondary package claim explicit and aligned to proof
- resolve any remaining proof/doc mismatch in the `slate-react` editor-facing
  surface
- decide whether `slate-dom` and `slate-hyperscript` rows can close as stable
  package claims or should be framed as narrower contributor/tooling surfaces

Required outcomes:

- `slate-react` row stops overclaiming relative to its runtime proof
- `slate-dom` row is either closed on the current `DOMBridge` /
  `ClipboardBridge` claim or explicitly narrowed
- `slate-hyperscript` row is either closed as a contributor-facing package slot
  or explicitly marked narrower than a blanket historical claim

### Unit 4. Reconcile stale docs that claim closure too early

Files:

- [2026-04-09-slate-v2-public-surface-reconciliation.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-public-surface-reconciliation.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [packages/*/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate/Readme.md)
- [Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)

Work:

- reframe the old completed public-surface note as a narrower current-claim
  cleanup if that is what it really was
- prevent historical docs from still sounding like the broad lane is finished
- keep the repo front door and package front doors aligned to the same matrix

### Unit 5. Close the lane cleanly

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Work:

- close the lane only if the package matrix plus proof rows are enough to
  defend the broad claim
- if any package surface still cannot be made honest, keep the lane open and
  state the exact residual rows instead of pretending this batch was enough

## Recommended Order

1. define the package-surface matrix
2. close or explicitly narrow the `slate` core rows
3. close or explicitly narrow the `slate-react`, `slate-dom`, and
   `slate-hyperscript` package rows
4. update stale “closed” docs that only covered a narrower claim
5. then close the live lane if the matrix is coherent

## Verification Targets

Primary proof surfaces:

- [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts)
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts)
- [text-units-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts)
- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
- [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts)
- [clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts)
- [packages/slate-hyperscript/test/index.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js)
- [packages/slate-hyperscript/test/smoke.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/smoke.js)

Required verification before declaring the lane closed:

- `yarn test:custom`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn workspace slate-hyperscript run test`
- `yarn lint:typescript`

## Hard Rules

- do not let a narrower “current claim” cleanup doc masquerade as broad-lane
  closure
- do not reopen already-closed neighboring lanes just because a public name
  touches them
- do not keep `partial` rows around out of inertia; either close them or say
  exactly why they remain outside the broad claim
- do not close the lane on readmes alone; the package-level proof rows have to
  earn it

## Result

- the package matrix is now explicit across stable surfaces, secondary
  surfaces, and explicit non-claims
- the remaining `public surface` proof rows are closed on that matrix
- the earlier narrower current-claim cleanup note is now framed as a precursor,
  not the whole lane

## Verification

- `yarn test:custom`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn workspace slate-hyperscript run test`
- `yarn lint:typescript`
