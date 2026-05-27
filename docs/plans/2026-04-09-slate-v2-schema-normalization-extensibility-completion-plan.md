---
date: 2026-04-09
topic: slate-v2-schema-normalization-extensibility-completion
status: completed
---

# Slate V2 Schema / Normalization Extensibility Completion Plan

## Goal

Close the `schema / normalization extensibility` lane in
[master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
and turn the corresponding open bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
from `partial` to closed-by-proof.

For this lane, "100% completion" means:

1. the current normalization model is stated plainly and proved as-is
2. app-owned schema rules are proved headless-first on the real engine
3. explicit canonicalization boundaries are proved without leaking into
   ordinary live transactions
4. structure-changing normalization stays safe under refs, clipboard, and
   runtime proof
5. the docs stop hand-waving with one overloaded partial row

## Problem Frame

The repo already has real normalization work landed:

- [create-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts)
  already owns a safe built-in floor
- [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts) already
  runs custom normalization as a pass-level loop with `explicit` tracking
- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
  already proves part of the story directly
- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
  and
  [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
  already backstop some higher-risk shape-changing cases
- [with-forced-layout.ts](/Users/zbeyens/git/slate-v2/site/examples/ts/plugins/with-forced-layout.ts)
  is already a real app-owned normalizer
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)
  already records some intentionally non-default live shapes

So the lane is not open because there is no normalization model.

It is open because the current proof story is still too scattered and too thin
at the primary owner:

- the owning proof row in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  is a single `partial` summary row
- the dedicated owner file,
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts),
  proves only a subset of the actual claimed width
- the repo documents allowed explicit canonicalization boundaries, but the lane
  still lacks one clean closeout story maintainers can audit quickly

## Planning Decision

Do **not** try to close this lane by reviving blanket legacy built-in
normalization parity.

Do **not** invent a new schema package or normalization DSL.

Close the lane on the current model:

- safe default live invariants in core
- heavier canonicalization only on explicit or app-owned boundaries
- app-owned `normalizeNode(...)` as the real schema extension hook
- explicit records for live shapes that are allowed before canonicalization

That is the honest target. Anything broader is a different project.

## Scope

### In scope

- strengthen the primary proof owner for normalization
- prove app-owned schema rules at root and descendant level without React
  coupling
- prove explicit canonicalization boundaries as current product truth
- keep structure-changing normalization safe under range-ref, clipboard, and
  runtime guards
- make the proof/doc stack auditable enough to flip the lane closed

### Out of scope

- blanket legacy built-in normalization parity
- broad always-on live inline-container coercion
- broad always-on live adjacent-text cleanup
- a revived `slate-schema` style abstraction
- React-first normalization ownership

## Relevant Current Truth

### Already recovered

- [2026-04-08-slate-v2-normalization-policy-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-normalization-policy-recovery.md)
  kept `shouldNormalize(...)` as a narrow pass-level gate
- [2026-04-09-slate-v2-built-in-normalization-recovery-lane.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-built-in-normalization-recovery-lane.md)
  recovered the safe built-in floor and explicit-only heavier cleanup
- [2026-04-09-slate-v2-normalization-docs-truth-pass.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-normalization-docs-truth-pass.md)
  stopped repo docs from implying blanket legacy parity
- [2026-04-09-slate-v2-normalization-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-normalization-family-deleted-test-closure.md)
  already reconciled the deleted `packages/slate/test/normalization/**`
  inventory against the current default-vs-explicit split

### Relevant learnings

- [2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md)
  proves new normalization hooks must be fallback-safe and have explicit call
  cadence
- [2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md)
  proves broader built-in recovery is not a cheap helper port
- [2026-04-09-slate-inline-container-flattening-cannot-be-a-quick-built-in-normalization-win.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-inline-container-flattening-cannot-be-a-quick-built-in-normalization-win.md)
  proves inline canonicalization must stay tied to full guard proof
- [2026-04-09-slate-range-refs-must-rebase-node-ops-before-wrap-driven-normalization.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-range-refs-must-rebase-node-ops-before-wrap-driven-normalization.md)
  proves structure-changing normalization must be checked against ref rebasing,
  not only final snapshots

### Current deleted-family source rows to keep honest

Deleted inventory under `packages/slate/test/normalization/**` still resolves
into these clusters:

- `normalization.block`
- `normalization.editor`
- `normalization.inline`
- `normalization.text`
- `normalization.void`

The plan must preserve that mapping instead of quietly drifting to a narrower
story than the closure note already claims.

## Completion Criteria

This lane is done when all of the following are true:

1. [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
   is the clear primary owner for the normalization story instead of a thin
   teaser file
2. safe default live invariants are directly proved there
3. app-owned custom normalization is directly proved there for:
   - root layout repair
   - descendant-level schema repair
   - scoped delegation into core normalization
4. explicit canonicalization is directly proved there for:
   - adjacent-text cleanup
   - inline-container flattening
   - replace/manual normalize cleanup
5. every structure-changing rule has at least one guard proof in:
   - [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
   - [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
   - [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
6. [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)
   fully lists the allowed non-default live shapes and their canonicalization
   boundary
7. the `schema / normalization` row in
   [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
   can flip from `partial` to `closed` without lying about blanket legacy
   parity
8. the open bucket in
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   can flip closed on the current model

## Implementation Units

### Unit 1. Turn the lane into auditable capability rows

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)

Work:

- split the current overloaded normalization story into explicit capability
  statements:
  - safe default live invariants
  - app-owned custom schema normalization
  - explicit canonicalization boundaries
  - structure-changing normalization safety under refs/clipboard/runtime
  - intentionally non-default live shapes
- keep one primary proof owner row, but make the capability coverage obvious in
  the actual outcome text and linked artifacts

Reason:

- right now the proof exists, but the lane still reads like a shrug

### Unit 2. Make `normalization-contract.ts` the real owner

Files:

- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)

Work:

- move enough normalization proof out of the broad oracle and into
  `normalization-contract.ts` that maintainers can audit the lane there first
- keep `snapshot-contract.ts` as the general surface oracle for delegation and
  editor-instance behavior, not the main owner of normalization breadth

Required test scenarios:

- empty non-editor elements get an empty text child
- void inline and void block descendants get empty-child repair
- inline children get leading and trailing spacer text where the current model
  guarantees it
- direct-child block-only cleanup is proved for node-op-driven invalid children
- replace/manual normalize block-only cleanup is proved for broader scans
- `fallbackElement` wrapping is proved directly in the normalization owner file
- explicit adjacent-text cleanup is proved directly in the normalization owner
  file
- explicit inline-container flattening is proved directly in the normalization
  owner file

### Unit 3. Prove real app-owned schema rules headless-first

Files:

- [with-forced-layout.ts](/Users/zbeyens/git/slate-v2/site/examples/ts/plugins/with-forced-layout.ts)
- [forced-layout.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx)
- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)

Work:

- keep `withForcedLayout` as the canonical root-layout example
- add one explicit descendant-level schema-repair scenario in
  `normalization-contract.ts`
- prove that app code can delegate back into core normalization with
  `fallbackElement` when it needs wrapping instead of deletion

Required test scenarios:

- a root normalizer enforces title-first / paragraph-second after replace
- a descendant-level normalizer repairs an invalid child shape using supported
  transforms
- app code can call the original normalizer with `fallbackElement` and still
  get the current scoped wrapping behavior
- those app-owned rules work without any React package involved

### Unit 4. Keep the dangerous tree-shape changes on a short leash

Files:

- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)

Work:

- keep every structure-changing normalization rule attached to at least one
  cross-lane guard
- add guard rows only where the current normalization owner proves a shape
  change not already guarded elsewhere

Required guard scenarios:

- `fallbackElement` wrapping preserves range refs
- explicit adjacent-text cleanup preserves range refs
- explicit inline-container flattening preserves range refs
- mixed-inline clipboard proof stays green because broader live coercion stays
  off by default
- mixed-inline runtime/selection proof stays green because broader live
  coercion stays off by default

### Unit 5. Record allowed non-default live shapes precisely

Files:

- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)
- [11-normalizing.md](/Users/zbeyens/git/slate-v2/docs/concepts/11-normalizing.md)
- [editor.md](/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md)

Work:

- for each allowed non-default live shape, record:
  - where it may exist
  - what canonicalizes it
  - which proof rows keep it safe
- keep the concept docs and API docs aligned to that register

Reason:

- if maintainers cannot tell what is intentionally non-default, the lane is not
  actually closed

### Unit 6. Close the docs only after the proof is strong enough

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)

Work:

- flip the normalization proof row closed only when the owner file and guard
  files are enough to defend the sentence
- keep the wording sharp:
  - current default-vs-explicit normalization model is closed
  - blanket legacy built-in normalization parity is not what got closed

## Recommended Order

1. strengthen `normalization-contract.ts` until it can honestly own the lane
2. add or tighten the specific cross-lane guards that protect shape-changing
   normalization
3. refresh the live-shape register and normalization docs
4. only then close the proof row and roadmap/blocker docs

## Verification Targets

Primary proof surfaces:

- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
- [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [forced-layout.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/forced-layout.test.ts)
  if the example wrapper or example surface changes

Required verification before declaring the lane closed:

- `yarn test:custom`
- `yarn workspace slate-react exec tsx --test test/runtime.tsx`
- forced-layout browser proof if the example wrapper/surface changed
- `yarn lint:typescript`

## Hard Rules

- do not reopen blanket always-on live coercion just to make the row turn green
- do not split schema work into a fake separate abstraction track; in this repo
  schema power is currently exercised through app-owned normalization
- do not move normalization ownership into React code
- do not close the lane on docs alone; the owner test file has to earn it

## Result

- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
  now owns the lane directly instead of carrying only a thin subset
- the lane closes on the current default-vs-explicit normalization model
- the proof/doc stack now says that plainly instead of leaving the owner row
  `partial`

## Verification

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/normalization-contract.ts`
- `yarn workspace slate-react exec tsx --test test/runtime.tsx`
- `yarn test:custom`
- `yarn lint:typescript`
