---
date: 2026-04-19
topic: slate-absolute-api-replan
status: completed
execution_repo: /Users/zbeyens/git/slate-v2
control_repo: /Users/zbeyens/git/plate-2
scope_lock:
  - /Users/zbeyens/git/slate-v2/packages/slate/**
  - /Users/zbeyens/git/slate-v2/scripts/benchmarks/**
  - /Users/zbeyens/git/slate-v2/package.json
---

# Slate Absolute API Replan

## Goal

Reopen `packages/slate` despite the stale tranche-3 closeout read and drive it
toward the best honest public API:

- transaction-first writes
- snapshot/store-first reads
- mutable editor fields demoted to compatibility where they still earn their keep
- explicit compatibility cuts when the old surface blocks the better API
- no material perf regression against the current core floor

## Current Read

- the existing tranche doc says `packages/slate` is closed and tranche 4 is
  next
- that read is stale for the current north star
- the architecture contract now points at a better core than the retrofit API:
  transaction-first, snapshot/store-first, React-friendly, package-split
  preserved
- the user has now chosen the perfect redesign as the live doctrine, not a
  deferred future lane
- the current required decision is not “what support package is next”
- the current required decision is “which `slate` public seams stay primary,
  which become compatibility mirrors, and which get cut or demoted”
- completion target for this lane is now met:
  - the `slate` core API direction is settled enough to become the live claim
  - remaining hard cuts are explicitly deferred post-RC
- the first standalone broad oracle run is red again:
  - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- latest broad oracle read after the first slice:
  - the stale implicit-merge `move_node` row is gone
  - the standalone oracle is now green:
    - `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- package-floor read after the same slice:
  - `bun test ./packages/slate/test` is green again
  - the old `55`-row cluster is now cut at one explicit owner:
    - `/Users/zbeyens/git/slate-v2/packages/slate/test/fixture-claim-overrides.ts`
- current verification read:
  - `bunx turbo build --filter=./packages/slate` green
  - `bunx turbo typecheck --filter=./packages/slate` green
  - `bun run lint:fix` green
  - `bun run lint` green
- this slice is now closed
- latest API-direction slice after that:
  - `editor.operations` is demoted to a compatibility mirror over explicit
    operation access
  - `Editor.getOperations(editor)` / `editor.getOperations()` are now the
    canonical operations read seam
  - `Editor.withTransaction(editor, tx => ...)` now exposes live draft state
    through the transaction argument:
    - `tx.children`
    - `tx.selection`
    - `tx.marks`
    - `tx.operations`
- latest docs-stack slice after that:
  - the perfect redesign is now the live doctrine across `docs/slate-v2/**`
  - support packages are explicitly blocked until the `slate` core redesign
    settles
  - the native transaction/store-first direction is no longer described as a
    deferred future lane
- latest code slice after that:
  - internal hot paths no longer need `editor.children` directly for live
    draft reads in:
    - `transforms-text/delete-text.ts`
    - `utils/get-default-insert-location.ts`
  - those reads now route through `Editor.getChildren(editor)`
- latest follow-on slice after that:
  - current contract tests for app-owned normalization/extension wrappers now
    prefer `Editor.getChildren(editor)` over `editor.children` for live draft
    reads
  - `insertText` no longer pays snapshot-read tax in its null-selection guard;
    it uses an explicit public-selection helper instead
- latest write-hierarchy slice after that:
  - transaction-owned source paths now call `tx.apply(op)` instead of
    `editor.apply(op)` where the transaction already exists:
    - `interfaces/transforms/general.ts`
    - `editor/insert-break.ts`
    - `transforms-node/move-nodes.ts`
    - `transforms-text/delete-text.ts`
- current write-hierarchy read:
  - `tx.apply(op)` is no longer decorative
  - but too much helper/transform source still bypasses it and goes straight to
    `editor.apply(op)`
- latest write-hierarchy slice after that:
  - the internal `applyOperation(editor, op)` helper now routes helper/transform
    code through the active transaction writer when one exists
  - more helper paths no longer call raw `editor.apply(op)` directly:
    - `interfaces/transforms/text.ts`
    - `transforms-selection/select.ts`
    - `transforms-selection/deselect.ts`
    - `transforms-selection/set-selection.ts`
    - `transforms-node/remove-nodes.ts`
    - `transforms-node/set-nodes.ts`
    - `transforms-node/split-nodes.ts`
    - `transforms-node/insert-nodes.ts`
    - `transforms-node/merge-nodes.ts`
- latest write-hierarchy slice after that:
  - `tx.apply(op)` is now backed by the base core writer instead of delegating
    through an overridden `editor.apply`
  - transaction-owned writes now survive a wrapped `editor.apply` and still hit
    the core transaction seam directly
- latest public-write slice after that:
  - `Editor.apply(editor, op)` is now the explicit public single-op writer
    over that same transaction seam
  - wrapped `editor.apply(op)` no longer owns the public single-op path by
    default
  - current contract proof for that seam is live in:
    - `packages/slate/test/surface-contract.ts`
    - `packages/slate/test/transaction-contract.ts`
- latest publish-order slice after that:
  - commit subscribers now fire before `editor.onChange()`
  - `editor.onChange()` is now classified as a compatibility callback over the
    snapshot-store seam, not the primary commit owner
  - current contract proof for that seam is live in:
    - `packages/slate/test/snapshot-contract.ts`
- latest fixture-owner slice after that:
  - exact `interfaces/Editor/**` fixtures now prefer explicit read seams over
    ambient property mirrors
  - remaining direct property pressure is concentrated in explicit
    compatibility-owner files instead of spread across the wider interface tree
  - current inventory read:
    - source direct property reads:
      - `editor.children`: `0`
      - `editor.selection`: `2`
      - `editor.marks`: `4`
    - test direct property reads:
      - `editor.children`: `9`
      - `editor.selection`: `4`
      - `editor.marks`: `1`
  - remaining owner files are now down to:
    - `src/core/public-state.ts`
    - `src/interfaces/editor.ts`
    - `test/accessor-transaction.test.ts`
    - `test/interfaces-contract.ts`
    - `test/snapshot-contract.ts`
    - `test/surface-contract.ts`
    - `test/transaction-contract.ts`
  - direct `editor.marks` property writes are now explicitly proved in:
    - `packages/slate/test/snapshot-contract.ts`
- latest normalization-claim slice after that:
  - the default-vs-explicit normalization truth is no longer an open owner row
  - the live docs, broad oracle, and explicit-cut registry now agree that:
    heavier adjacent-text/spacer cleanup stays explicit-only
  - the old package-floor fixture cluster is already classified at one owner
    seam:
    - `packages/slate/test/fixture-claim-overrides.ts`

## Execution Repo

- `/Users/zbeyens/git/slate-v2`

## Scope Lock

- allowed:
  - `/Users/zbeyens/git/slate-v2/packages/slate/**`
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/**`
  - `/Users/zbeyens/git/slate-v2/package.json`
- docs sync allowed when truth changes:
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/**`
  - `/Users/zbeyens/git/plate-2/docs/plans/**`
- out of scope unless a kept `slate` proof or perf owner forces it:
  - `slate-history`
  - `slate-hyperscript`
  - `slate-dom`
  - `slate-react`

## Current Tactic

- treat the perfect redesign as the live queue, not a future note
- rewrite the control/docs stack so it stops encoding the old parity-first or
  support-packages-next story
- use the updated docs stack as the source of truth for the next code slice in
  `packages/slate`
- keep the current perf floor as a hard guardrail while the public API shifts

## Rejected Tactics / Pivot History

- rejected: treating green package-local gates as proof that `packages/slate`
  is done
- rejected: moving to tranche 4 while the `slate` API direction is still
  undecided
- rejected: deferring the native transaction/store-first redesign to a later
  roadmap lane
- rejected: preserving mutable singleton editor state by default just because
  the recovered retrofit surface currently ships
- rejected: reopening benchmark-package farming; the perf owner lane is already
  complete enough to act as a regression floor
- rejected: restoring legacy default adjacent-text auto-merge into ordinary
  `move_node` just to satisfy a stale snapshot row when the live docs already
  define that cleanup as explicit-only
- rejected: a direct committed-mirror cut for `editor.children`
  - reason:
    package-floor helpers, root readers, and normalization paths still assume
    the property is live enough that flipping it explodes the suite
- rejected: a direct committed-mirror cut for `editor.selection` / `editor.marks`
  - reason:
    package-floor compatibility still depends on live property-set semantics
    for those surfaces

## Remaining Kept-Owner Ledger

None blocking this `slate` core lane.

Deferred post-RC:

- decide whether compatibility-only:
  - `editor.children`
  - `editor.selection`
  - `editor.marks`
  stay or get hard-cut after sibling-package migration pressure is gone
- decide whether compatibility-only:
  - `editor.apply(op)`
  - `editor.onChange()`
  stay or get hard-cut after sibling-package migration pressure is gone
- keep `CustomTypes` cut unless later code work proves reopening it earns its
  cost

## Perf Owner Status

- core benchmark package exists and is live
- current compare owners are:
  - `bun run bench:core:normalization:compare:local`
  - `bun run bench:core:observation:compare:local`
  - `bun run bench:core:huge-document:compare:local`
- current read from the control docs:
  - normalization is no longer the blocker
  - observation is bounded-but-still-slower
  - huge-document typing is bounded-but-still-slower

## Current Gates

- correctness owner:
  - `cd ../slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- package floor:
  - `cd ../slate-v2 && bun test ./packages/slate/test`
  - `cd ../slate-v2 && bunx turbo build --filter=./packages/slate`
  - `cd ../slate-v2 && bunx turbo typecheck --filter=./packages/slate`
  - `cd ../slate-v2 && bun run lint:fix`
  - `cd ../slate-v2 && bun run lint`
- perf floor:
  - `cd ../slate-v2 && bun run bench:slate:6038:local`
  - `cd ../slate-v2 && bun run bench:core:normalization:compare:local`
  - `cd ../slate-v2 && bun run bench:core:observation:compare:local`
  - `cd ../slate-v2 && bun run bench:core:huge-document:compare:local`

## Next Move

1. treat the `slate` core API direction as settled enough to unblock tranche 4
2. carry the deferred post-RC seam-cut ledger forward explicitly
3. keep the current core perf read as the regression floor for later packages
4. do not reopen `slate` core design questions without new contrary evidence

## Continue Checkpoint

- verdict:
  - `replan`
- latest landed API redesign owner:
  - `editor.operations` is now a compatibility mirror
  - `Editor.getOperations(editor)` is the explicit operations read seam
  - `withTransaction(tx => ...)` is now an explicit draft-access seam
  - `Editor.apply(editor, op)` is now the explicit public single-op writer
  - `subscribe(...)` is now the primary post-commit seam ahead of
    `editor.onChange()`
- latest hard-cut or demotion decision:
  - ordinary structural ops do **not** regain legacy automatic adjacent-text
    merge just to satisfy one stale oracle row
  - that row is the thing to demote, not the engine
- latest hard-cut or demotion decision:
  - `editor.operations` no longer owns the internal queue directly
  - direct property mutation is compatibility-only
  - the redesign itself is no longer deferred
- latest hard-cut or demotion decision:
  - instance `editor.apply(op)` is no longer the public default write seam
  - it survives as compatibility pressure over a stronger explicit writer
- latest hard-cut or demotion decision:
  - `editor.onChange()` is no longer treated as the primary commit seam
  - it survives as a legacy compatibility callback after commit subscribers
- latest hard-cut or demotion decision:
  - `editor.children` / `editor.selection` / `editor.marks` are no longer
    treated as primary read seams
  - they survive as compatibility mirrors only
- latest hard-cut or demotion decision:
  - compatibility-only `editor.children` / `editor.selection` / `editor.marks`
    stay through RC
  - same RC posture now applies to instance `editor.apply(op)` and
    `editor.onChange()`
- remaining unresolved API decisions:
  - no blocking `slate` core API-direction decisions remain in this lane
  - only post-RC cut/defer judgments remain
  - any further meaningful execution changes package/tranche ownership
- latest current-vs-legacy compare read:
  - normalization compare is no longer the blocker
  - observation compare is bounded-but-still-slower
  - huge-document typing compare is bounded-but-still-slower
- drift read:
  - current work still points toward the better API
  - the main drift risk is letting RC-scope compatibility mirrors linger
    without an explicit cut/defer judgment
- next move after this checkpoint:
  - stop here for this execution owner
  - do not invent more `packages/slate` churn under a completed lane
  - next likely seam:
    create or switch to the next tranche owner only when the user explicitly
    wants support-package work

## Repeated Continue Rule

- this execution owner is complete
- repeated `continue` calls against this same owner without a new scope or new
  contrary evidence should return:
  - `replan`
- reason:
  - the next honest move changes package/tranche ownership
  - more `packages/slate` work here would be invented churn, not progress
- repeat-count:
  - `44`
- latest reaffirmation:
  - repeated `continue` was received again against the same completed owner
    with no new scope, evidence, or blocker change
  - verdict still stays `replan`

## Latest Slice

- narrowed `packages/slate/src/core/normalize-node.ts` so adjacent-text
  canonicalization is explicit-only instead of ordinary-op default behavior
- updated broad current-contract proof in:
  - `packages/slate/test/snapshot-contract.ts`
- added one explicit-cut registry for stale legacy fixture rows in:
  - `packages/slate/test/fixture-claim-overrides.ts`
- taught `packages/slate/test/index.spec.ts` to skip that explicit-cut family
  from one owner seam
- demoted `editor.operations` into a compatibility mirror over explicit
  operation access in:
  - `packages/slate/src/core/public-state.ts`
  - `packages/slate/src/core/apply.ts`
  - `packages/slate/src/interfaces/editor.ts`
  - `packages/slate/src/create-editor.ts`
  - `packages/slate/src/editor/without-normalizing.ts`
- landed an explicit draft-access transaction seam:
  - `Editor.withTransaction(editor, tx => ...)`
- landed the first explicit transaction-owned write seam:
  - `tx.apply(op)`
- pushed `tx.apply(op)` into transaction-owned source paths in:
  - `packages/slate/src/interfaces/transforms/general.ts`
  - `packages/slate/src/editor/insert-break.ts`
  - `packages/slate/src/transforms-node/move-nodes.ts`
  - `packages/slate/src/transforms-text/delete-text.ts`
- landed `applyOperation(editor, op)` as the internal writer helper in:
  - `packages/slate/src/core/public-state.ts`
- moved additional helper/transform code onto that writer helper in:
  - `packages/slate/src/interfaces/transforms/text.ts`
  - `packages/slate/src/transforms-selection/select.ts`
  - `packages/slate/src/transforms-selection/deselect.ts`
  - `packages/slate/src/transforms-selection/set-selection.ts`
  - `packages/slate/src/transforms-node/remove-nodes.ts`
  - `packages/slate/src/transforms-node/set-nodes.ts`
  - `packages/slate/src/transforms-node/split-nodes.ts`
  - `packages/slate/src/transforms-node/insert-nodes.ts`
  - `packages/slate/src/transforms-node/merge-nodes.ts`
- hardened `tx.apply(op)` so it now bypasses an overridden `editor.apply` and
  writes through the base core writer in:
  - `packages/slate/src/core/public-state.ts`
  - `packages/slate/src/create-editor.ts`
- landed `Editor.apply(editor, op)` as the explicit public single-op writer in:
  - `packages/slate/src/interfaces/editor.ts`
- proved that the public single-op writer bypasses wrapped `editor.apply(op)`
  and reuses the transaction seam in:
  - `packages/slate/test/surface-contract.ts`
- proved that behavior in:
  - `packages/slate/test/transaction-contract.ts`
- moved commit subscribers ahead of `editor.onChange()` in:
  - `packages/slate/src/core/public-state.ts`
- classified `editor.onChange()` as a compatibility callback with current proof
  in:
  - `packages/slate/test/snapshot-contract.ts`
- moved exact `interfaces/Editor/**` fixture reads off ambient mutable
  properties and onto explicit seams in:
  - `packages/slate/test/interfaces/Editor/**`
- moved broad harness convenience reads off ambient mutable properties in:
  - `packages/slate/test/index.spec.ts`
  - `packages/slate/test/legacy-fixture-utils.ts`
- rewrote the stray convenience setup fixture in:
  - `packages/slate/test/transforms/mergeNodes/path/non-selectable-ancestor.ts`
- proved direct `editor.marks` property writes as a live compatibility seam in:
  - `packages/slate/test/snapshot-contract.ts`
- moved internal hot-path live draft reads off `editor.children` in:
  - `packages/slate/src/transforms-text/delete-text.ts`
  - `packages/slate/src/utils/get-default-insert-location.ts`
- moved current non-legacy contract wrappers off `editor.children` in:
  - `packages/slate/test/normalization-contract.ts`
  - `packages/slate/test/extension-contract.ts`
- kept `insertText` off raw `editor.selection` without paying snapshot tax by
  adding an explicit public-selection helper in:
  - `packages/slate/src/core/public-state.ts`
  - `packages/slate/src/interfaces/transforms/text.ts`
- fixed the real null-state bug in:
  - `packages/slate/src/core/public-state.ts`
  - `CURRENT_SELECTION` / `CURRENT_MARKS` no longer fall through stale public
    state when the live value is actually `null`
- synced the `docs/slate-v2/**` stack to the perfect-redesign read:
  - `overview.md`
  - `master-roadmap.md`
  - `release-readiness-decision.md`
  - `replacement-gates-scoreboard.md`
  - `true-slate-rc-proof-ledger.md`
  - `fresh-branch-migration-plan.md`
  - `release-file-review-ledger.md`
  - `references/architecture-contract.md`
  - `references/slate-batch-engine.md`
  - `commands/launch-next-ralph-batch.md`
  - `commands/reinterview-remaining-scope.md`
  - `commands/replan-remaining-work.md`
  - `ledgers/README.md`
  - `ledgers/slate-legacy-draft-contract-corpus.md`
  - `ledgers/slate-editor-api.md`
  - `ledgers/slate-transforms-api.md`
  - `slate-tranche-3-execution.md`
- captured the learning in:
  - `docs/solutions/developer-experience/2026-04-19-slate-explicit-normalization-cuts-should-live-in-one-fixture-override-registry.md`
