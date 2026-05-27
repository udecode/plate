---
date: 2026-04-08
topic: slate-v2-master-roadmap
---

# Slate v2 Master Roadmap

## Purpose

Canonical sequence for the `slate-v2` rewrite program.

This file owns:

- tranche order
- tranche entry/exit conditions
- operator handoff
- roadmap vocabulary

It does **not** own:

- live verdict truth
- family truth
- proof artifacts
- architecture rationale

Use it with:

- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)

## Vocabulary

| Historical verdict term | Roadmap meaning now                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `Target A`              | completed `POC RC` default-stack verdict                                            |
| `Target B`              | older name for the broader replacement claim that now resolves into `True Slate RC` |

Rule:

- old `Target A` / `Target B` labels may survive only as historical or verdict
  vocabulary
- roadmap control terms are now `POC RC` and `True Slate RC`

## Truth Ownership

| Class              | Owner                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verdict            | [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md) (primary); supporting live surfaces: [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md), [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) |
| sequence           | this file and [docs/slate-v2/commands](/Users/zbeyens/git/plate-2/docs/slate-v2/commands)                                                                                                                                                                                                                                                                                                                                                                                 |
| evidence           | [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md), [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md), [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)                                                                                                                                                     |
| reference          | [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md), [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md), [normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md)                                                                                                                                                                                               |
| maintainer context | [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md) and supporting plans                                                                                                                                                                                                                                                                                                             |

## Current Read

- current live go/no-go still lives in
  [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- completed `POC RC` groundwork is real
- the core `packages/slate/test/**` deleted-family bucket is now explicitly
  closed
- the full `packages/slate-react/**` deleted-family bucket is now explicitly
  closed
- the full `packages/slate-history/**` package bucket is now explicitly closed
- major file/test deletion review is now explicitly closed
- schema / normalization extensibility is now explicitly closed
- non-React / headless core usability is now explicitly closed
- the earlier package-matrix public-surface pass is banked, but exhaustive
  API/public-surface contract-width audit is reopened under challenge
- the curated perf gate package now clears under the current blocker-facing
  lanes in
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- the next honest work is now the decoration source-scoped invalidation tranche
  in
  [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md)
- the exhaustive API/public-surface contract-width audit remains the next
  broader replacement lane after that tranche:
  [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- `Editor.nodes/**` and the non-Editor `interfaces/**` namespaces now have
  direct 1:1 legacy fixture proof; the current public-surface debt is now the
  narrower post-sync matrix:
  - transform `explicit-skip` rows
  - the overlay architecture lock is complete, and the active decoration tranche
    now targets source-scoped invalidation:
    - decoration sources own inline projected decoration
    - `Bookmark` owns durable public anchors
    - annotation stores own anchored data
    - widget stores own widget UI
  - authority:
    [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md)
  - `CustomTypes` declaration merging is now reopened and recovered on the
    package type surface; old explicit-skip ledgers for that seam are stale and
    need targeted refresh
- browser/input parity stays active on the shared editor/input surface until
  same-path source + contract parity is restored or an explicit engine-rewrite
  exception is recorded per
  [repair-drift.mdc](/Users/zbeyens/git/plate-2/.agents/rules/repair-drift.mdc)
- specialist IME/platform/browser rows are secondary proof only; they do not
  close shared `Editable`/history/hotkey/android surface drift by themselves
- perf follow-up remains real, but it is not the current control-plane owner
- maximum parity with legacy for all examples is now reopened as a sibling
  blocker lane under
  [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)

## Ian / Slate Rule

Every open tranche has to satisfy this order:

1. data-model-first
2. operation- and collaboration-friendly
3. transaction-first engine semantics
4. React-optimized runtime
5. explicit adapters later

That means:

- breaking is allowed when it is clearly better
- backward compatibility alone is not enough
- runtime work does not get priority unless it strengthens a named recovery lane
  and closes a named proof artifact

## Completed Groundwork

### [x] POC RC

This groundwork stays closed:

- doc ownership reset
- proof-lane surfacing
- initial oracle harvest
- family proof deepening for the proved default stack
- maintainer-facing PR description
- current release-envelope hold

What this means:

- the repo has a believable default-stack release candidate
- the repo does **not** yet have a true Slate release candidate

## Tranche Status

### [x] Tranche 1: Principle Lock And Vocabulary Reset

Goal:

- make the doc stack say the same thing about `POC RC`, `True Slate RC`, and
  ownership

Exit:

- front door routes to the new roadmap
- command pack uses the new spec path
- old roadmap control terms survive only as historical/verdict vocabulary

Status:

- complete

### [x] Tranche 2: True Slate Contract Recovery

Goal:

- recover the real Slate contract unless a cut is explicitly better

Mandatory recovery lanes:

1. extension model / behavior interception (`closed`)
2. schema / normalization extensibility (`closed`)
3. non-React / headless core usability (`closed`)
4. operation-history-collaboration integrity (`closed`)
5. broad API / public surface reconciliation (`initial package-matrix pass closed; reopened under challenge in tranche 7`)
6. major file/test deletion review (`closed`)

Exit:

- every lane has named proof owners
- every cut has named better-value justification
- no lane is still hiding behind vague “claim width” wording

### [x] Tranche 3: Extension-Model Proof

Goal:

- prove same-or-better extension power with TDD-first evidence

Required capability proof:

- primitive edit interception
- domain command extension
- schema / normalization extension without React coupling
- non-React / headless use that is still first-class
- operation/history/collaboration integrity under extension hooks
- representative real ports

Exit:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  is green for the extension lane

### [x] Tranche 4: Diff / Test / File Review Closure

Goal:

- make sure no major loss is still unclassified

Exit:

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  has no vague buckets left
- the remaining open deletion families outside `packages/slate/test/**` are
  either closed or explicitly justified per
  [deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md):
  - none
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  matches the current truth

### [x] Tranche 5: Perf Gate Definition And Validation Under Quarantine

Goal:

- define the curated perf blocker package before any live verdict rewrite
- validate blocker lanes that matter for migration truth

Perf quarantine rule:

- no perf blocker claim may widen beyond the curated gate package
- low-value demos, microbench noise, and slower-but-still-fast cases do not
  block RC truth by themselves
- roadmap and verdict docs may not flip until the gate package is concrete

Examples:

- `slate-react` mounted runtime basics
- huge-document user flows
- mainstream richtext flows
- core normalization / engine lanes

### [x] Tranche 6: True Slate RC Judgment

Goal:

- decide whether the rewrite is now honestly a true Slate release candidate

Exit:

- verdict docs can explain the post-perf-gate `Target A` / `Target B` read
- proof ledger, blocker doc, and perf gate package are coherent enough to
  support that sentence

### [ ] Tranche 7: Exhaustive API / Public Surface And Example Parity Re-Audit

Goal:

- detect every remaining legacy-vs-current API regression and every remaining
  example-parity gap before another broad closure claim

Authority:

- [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)
- [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Exit:

- every kept API row is checked against:
  - legacy docs or legacy test rows
  - current docs
  - current source
  - current proof owner
- no API row is still marked mirrored when the accepted arguments, option bag,
  or behavior are narrower
- every surviving cut is explicit in the live proof/control/docs stack
- every legacy example row is classified as mirrored, recovered, extended,
  mixed, explicit cut, or open
- deletion closure is no longer allowed to masquerade as example parity closure

### [ ] Tranche 8: Post-RC Browser / Input Follow-up

Goal:

- finish the deferred browser/input parity follow-up after RC at the behavior,
  file-family, and broader-claim levels

Authority:

- [2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Exit:

- remaining local Android rows are closed or explicitly omitted
- Firefox local weirdness closure is synced into the live ledgers instead of
  lingering as fake next work
- browser/input file families are fully reconciled for the broader claim
- iOS broader rows are either proved or explicitly classified as tooling-blocked
  outside the RC gate

### [x] Tranche 9: Decorations / Annotations Architecture Lock

Goal:

- replace the bounded mixed-row / explicit-skip overlay story with an explicit
  final architecture for:
  - transient decorations
  - durable annotations
  - anchored widget / chrome layers

Authority:

- [decoration-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decoration-roadmap.md)
- [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)

Exit:

- the final overlay nouns and ownership boundaries are frozen
- durable public-anchor semantics are `Bookmark`-first and explicit enough to
  back comment / cursor /
  review-anchor claims
- the shared projection runtime is no longer “just local proof”
- legacy `decorate` is explicitly cut as architecture instead of being the
  silent default
- `RangeRef` recedes to lower-level runtime machinery in the public story
- the RC blocker docs no longer rely on the old “projection-local mirrored,
  broader decorate skipped” hedge as the final truth

## Batch Exit Rule

After any tranche changes truth:

0. if deletion wording changes, freeze the deleted inventory and reconcile the
   parent/child rows per
   [deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)
1. refresh [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
2. refresh [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
3. refresh [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
4. refresh [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
5. refresh [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
6. refresh [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
7. refresh [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
5. refresh any touched verdict docs

## Command Pack

- [reconsolidate-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reconsolidate-roadmap.md)
- [replan-remaining-work.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/replan-remaining-work.md)
- [reinterview-remaining-scope.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md)
- [run-perf-gates.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/run-perf-gates.md)
- [refresh-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/refresh-file-review-ledger.md)
- [launch-next-ralph-batch.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/launch-next-ralph-batch.md)

## Next Move

Current next move:

- execute
  [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- first batch:
  - finish the exhaustive API / public-surface contract-width audit
  - reopen maximum parity with legacy for all examples
  - allow legacy example additions/extensions when the rewrite unlocked a
    fairer comparison
  - continue the remaining browser/input external-evidence rows
  - keep the overlay architecture lock as already-closed authority, not active
    remaining work
- headless/core stays closed on the current package-split model:
  - `slate` owns document meaning, refs, transforms, and fragments
  - `slate-history` owns undo/redo batching
  - `slate-hyperscript` owns document construction helpers
- normalization stays closed on the current model:
  - safe live invariants by default
  - heavier canonicalization on explicit/import/load/app-owned seams
  - broader always-on live coercion is still outside the default contract
- history/collab stays closed on the current model:
  - local operation/history integrity is proved
  - external collaboration adapters remain external
- package/public surface stays closed on the current matrix:
  - stable package surfaces are explicit
  - secondary package surfaces stay public where intended
  - explicit non-claims are documented instead of hiding in `partial` rows
- Tranche 2 proof inputs are already known:
  - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- latest scope interview:
  - [2026-04-09-slate-v2-remaining-scope-reinterview.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-remaining-scope-reinterview.md)
