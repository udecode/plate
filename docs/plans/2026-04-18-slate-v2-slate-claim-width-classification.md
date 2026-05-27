---
date: 2026-04-18
topic: slate-v2-slate-claim-width-classification
status: completed
---

# Goal

Freeze the current `slate` residue inventory and classify the remaining tranche
3 work before any broader source recovery starts.

# Alignment Rule

Current `slate` root exports in
[src/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts) are:

- `core`
- `create-editor`
- `editor`
- `interfaces`
- `transforms-node`
- `transforms-selection`
- `transforms-text`
- `types`
- `utils/is-object`

That is the **currently shipped** `slate-v2` root surface.

It is **not** the default source of truth for tranche 3.

Tranche-3 default truth is:

1. legacy public API and behavior
2. current live proof of what still matters
3. explicit cut decisions where a legacy seam is no longer worth keeping
4. draft-only implementation ideas only as secondary evidence

So:

- current narrowing in `slate-v2` is not automatically accepted
- draft additions are not automatically accepted
- the job is to preserve the maximum non-breaking API/behavior surface unless a
  narrower cut is explicitly justified as no longer relevant to keep

# Frozen Inventory

## Live vs draft `packages/slate` diff

Excluding build output and tool junk:

- changed files: `106`
- draft-only files: `61`
- live-only files: `1063`

Bucket read:

- changed files are almost entirely `src/**`
- draft-only files split into:
  - `src/**`: `41`
  - `test/**`: `18`
  - `type-tests/**`: `2`
- live-only files split into:
  - `test/**`: `1052`
  - `src/**`: `11`

Interpretation:

- the live package is no longer “draft package plus a few edits”
- the biggest divergence is that live `slate` already carries a huge exact
  legacy-style test corpus while draft carries contract-owner test files and
  helper modules

## Live vs legacy `packages/slate/src` diff

- changed files: `106`
- legacy-only files: `16`
- live-only files: `1`

Legacy-only source residue is narrow and concrete:

- core batching/apply helpers:
  - `core/batch.ts`
  - `core/batching/**`
  - `core/children.ts`
  - `core/apply-operation.ts`
- one editor helper:
  - `editor/with-batch.ts`
- one utility:
  - `utils/non-settable-properties.ts`

Interpretation:

- same-path source drift is broad
- truly deleted legacy source is much smaller and should be classified row by
  row before any recovery claim

## Live vs legacy `packages/slate/test` diff

- changed files: `830`
- legacy-only files: `23`
- live-only files: `4`

Legacy-only test residue is concentrated in already-known buckets:

- apply-batch family
- children accessor
- old harness/perf files
- one legacy editor fixture:
  - `interfaces/Editor/legacy-minimal.tsx`
- one transform row:
  - `transforms/mergeNodes/path/text.tsx`

Live-only test residue is just current harness support:

- `index.spec.ts`
- `support/with-test.js`
- `tsconfig.json`
- `tsconfig.custom-types.json`

# Already Settled

These do **not** need to be re-litigated from scratch:

- deleted core legacy test-family archaeology is already classified in
  [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-test-files.md)
  and
  [2026-04-09-slate-v2-core-deleted-test-family-closeout.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-core-deleted-test-family-closeout.md)
- interfaces-family explicit skip for `CustomTypes` is already justified
- transforms-family explicit skip for broader helper breadth is already
  justified
- utils/root-harness explicit skip for `deep-equal`, old root harness files,
  and similar dead helper residue is already justified

What is still missing is not the archaeology.

What is missing is a live tranche-3 owner doc that turns those banked decisions
into the current claim-width execution order.

# Classification

## Recover Now

These still belong in the kept tranche-3 claim and should be audited first:

- same-path changed exported editor helpers under
  `packages/slate/src/editor/**`
- same-path changed exported interfaces under
  `packages/slate/src/interfaces/**`
- same-path changed exported transform helpers under
  `packages/slate/src/transforms-node/**`,
  `packages/slate/src/transforms-selection/**`, and
  `packages/slate/src/transforms-text/**`
- `src/create-editor.ts`
- exported core behavior reachable through the root surface:
  - `src/core/apply.ts`
  - `src/core/get-dirty-paths.ts`
  - `src/core/get-fragment.ts`
  - `src/core/normalize-node.ts`
  - `src/core/should-normalize.ts`
  - `src/core/update-dirty-paths.ts`

Reason:

- these files define the currently shipped surface where hidden narrowing is
  most likely to hurt non-breaking API/behavior goals
- they still differ from both legacy and draft
- broad claim-width audit is meaningless if these rows stay hand-waved

## Explicit Skip

These are already justified as outside the kept live claim unless a later proof
lane reopens them explicitly:

- `interfaces/CustomTypes/**`
- deleted `utils/deep-equal/**`
- old root fixture harness entrypoints:
  - `test/index.js` as a legacy harness role
  - `test/jsx.d.ts`
- deleted perf and matrix manifests
- broader transform option-bag breadth already marked explicit skip in the
  transforms-family closeout

## Post RC Candidates

These may contain real value, but they are not default tranche-3 recovery:

- draft-only helper modules with no current exported claim:
  - `src/core/draft-helpers.ts`
  - `src/core/transaction-helpers.ts`
  - `src/range-projection.ts`
  - `src/range-ref-transform.ts`
  - `src/text-units.ts`
  - `src/transforms-fragment.ts`
  - `src/editor/bookmark.ts`
  - `src/interfaces/bookmark.ts`
- draft-only contract-owner tests that do not match the current live test
  strategy directly:
  - `test/query-contract.ts`
  - `test/transforms-contract.ts`
  - `test/interfaces-contract.ts`
  - `test/legacy-*.ts`
  - similar draft-only contract files
- package docs residue:
  - `Readme.md`
  - `CHANGELOG.md`

Reason:

- some of these may be genuinely useful
- none of them are automatically required to make the kept legacy-facing claim
  honest
- draft is not the source of truth for package shape; it is a bank of possible
  supporting ideas
- if one of these files is the cleanest way to preserve a still-relevant
  legacy API/behavior seam, promote it later with an explicit reason

# Next Slate Batch

Query/location audit result:

- `before`
- `after`
- `positions`

look source-close enough that they are no longer the best next code target.

That makes the next planned code wave:

[2026-04-18-slate-v2-slate-accessor-batch-wave-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-accessor-batch-wave-plan.md).

It targets:

- `getChildren`
- `setChildren`
- `Editor.withTransaction(...)`
- `Transforms.applyBatch(...)`
- supporting `createEditor()` behavior
- snapshot/listener helpers that the draft-backed seam needs

Execution posture for that wave:

- pull focused draft tests first as RED
- keep relevant current tests green
- then recover code until GREEN

That wave is now landed in:

[2026-04-18-slate-v2-slate-accessor-batch-wave-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-accessor-batch-wave-plan.md).

Next follow-on should be chosen after implementing that wave and re-reading the
tranche-3 ledgers against the accessor/batch seam, not by reusing the stale
pre-landing
queue blindly.

Do **not** do this next:

- bulk-port draft helper modules
- rewrite all `src/**` files toward the draft shape
- delete same-path tests just because they are painful

# Consequence For Live Ledgers

The live `slate` ledgers should now read as:

- tranche 3 is active
- deleted-family archaeology is banked
- same-path exported source drift is the active owner problem
- explicit skip and `post RC` rows are distinct on purpose
