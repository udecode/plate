---
date: 2026-04-08
topic: slate-v2-true-slate-rc-roadmap-consensus-plan
status: approved
source: /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-true-slate-rc-roadmap-20260408T151944Z.md
---

# Slate v2 True Slate RC Roadmap Consensus Plan

## RALPLAN-DR Summary

### Principles

1. data-model-first beats renderer convenience
2. same-or-better Slate flexibility is the bar
3. every cut needs explicit better-value proof
4. diff/test/file review is part of the contract, not cleanup
5. one linear roadmap, one owner

### Decision Drivers

1. the current doc stack is honest only about a narrowed POC RC, not a true
   Slate RC
2. missing Slate identity work is broader than method overridability: API
   surface, file/test deletions, headless/core usability, and
   history/collaboration semantics all matter
3. the roadmap, ledger, commands, and repo-local envelope docs are wired to
   `Target A` / `Target B`, so the rewrite has to be systemic

### Viable Options

#### Option A: Patch the current ladder with another blocker batch

Pros:

- smallest editorial change
- preserves the existing hold docs almost untouched

Cons:

- keeps the wrong destination in control
- makes the roadmap look more complete than it is
- leaves command and ledger drift lurking under the surface

#### Option B: Rewrite the stack into one linear `POC RC -> True Slate RC` path

Pros:

- honest end state
- one operator path
- lets recovery lanes, proof lanes, and experiments live in one order

Cons:

- larger editorial rewrite
- forces coordinated changes across roadmap, ledger, commands, and front-door
  docs

#### Option C: Continue runtime experiments first and backfill the contract

later

Pros:

- keeps technical momentum on `Activity`, islands, and deeper `slate-react`
  work
- may surface better runtime abstractions early

Cons:

- optimizes the wrong product if Slate identity losses remain unresolved
- risks codifying React-first drift under the cover of experimentation
- makes later contract recovery more expensive

#### Option D: Keep a dual-track roadmap with one `POC RC` ladder and one

`True Slate RC` ladder

Pros:

- preserves the current hold language with minimal rewriting
- looks safer because the existing verdict stack barely moves

Cons:

- recreates roadmap split-brain immediately
- makes operators translate between ladders instead of following one path
- lets the wrong roadmap stay “complete” while the real one keeps slipping

### Chosen Option

- `Option B`

Why chosen:

- the current miss is the roadmap destination itself, not one more blocker row

## Requirements Summary

- Rewrite [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  from the finished `Target A` / `Target B` hold ladder into one linear path
  that preserves completed `POC RC` groundwork and defines `True Slate RC` as
  the remaining ordered path.
- Preserve the truth split already established by
  [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md),
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md),
  [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md),
  and
  [2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md):
  live verdict docs keep verdict ownership, the roadmap owns sequence and
  operator surface, and reference specs stay reference-only.
- Promote these to top-level `True Slate RC` recovery lanes:
  - extension model / behavior interception
  - schema / normalization extensibility
  - non-React / headless core usability
  - operation-history-collaboration integrity
  - broad API / public surface reconciliation
  - major file/test deletion review
- Add a dedicated TDD-first extension-model proof tranche.
- Make periodic diff-driven `[ ]/[x]` file-granular review mandatory and use
  missing `slate` and `slate-browser` tests as proof work.
- Rewrite the roadmap and command docs into the new vocabulary, then re-anchor
  the front door, live verdict docs, and repo-local envelope docs so they stay
  consistent without surrendering verdict ownership.

## Truth Ownership Matrix

Each touched artifact must declare one primary class and one proof owner.

| Class              | Owns                                                       | Canonical artifacts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verdict            | current go/no-go truth and claim width                     | [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md), [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md), [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md), [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md), [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md) |
| sequence           | ordered work, tranche entry/exit, operator flow            | [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md), [docs/slate-v2/commands](/Users/zbeyens/git/plate-2/docs/slate-v2/commands)                                                                                                                                                                                                                                                                                                                                                                      |
| evidence           | proof lanes, emitted artifacts, oracle depth               | [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md), [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md), [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)                                                                                                                                                                                                             |
| reference          | north-star and architecture rationale, not queue ownership | [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md), [slate-batch-engine.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md), [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)                                                                                                                                                                                                                                                         |
| maintainer context | short diff explanation and supporting execution memory     | [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md), `docs/plans/*slate-v2*.md`                                                                                                                                                                                                                                                                                                                                                              |

## Ian/Slate Pass-Fail Rubric

Any roadmap tranche, cut, or runtime experiment must pass all of these:

1. keep Slate's simple document model as the top principle
2. keep operations and collaboration viability first-class
3. keep transaction-first engine semantics ahead of renderer convenience
4. optimize React as the reference runtime without turning the core into a
   React-shaped ontology
5. keep the package split and explicit adapters; do not confuse headless with
   single-package

Failure rule:

- if a proposed step or cut cannot name how it passes this rubric, it does not
  belong in the `True Slate RC` path

## Acceptance Criteria

1. [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
   no longer uses `Target A` / `Target B` as the primary roadmap frame; it
   explicitly presents completed `POC RC` groundwork and ordered `True Slate RC`
   tranches.
2. The roadmap preserves the truth-class split from
   [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md) and the
   Slate v2 doc-stack learning, instead of letting plans compete with live
   verdict docs.
3. The roadmap names the six mandatory recovery lanes, an explicit
   principle-lock tranche, the dedicated TDD-first extension-model proof
   tranche, and one translation table for any surviving historical
   `Target A` / `Target B` mentions.
4. The front door, canonical roadmap, command entrypoint, proof ledger, review
   ledger, and maintainer diff register each declare whether they own verdict,
   sequence, evidence, reference, or maintainer context.
5. Runtime work cannot take roadmap priority unless it names the recovery lane
   it strengthens and the exit artifact it must emit.
6. The roadmap embeds periodic diff-driven file-granular review with explicit
   `[ ]/[x]` expectations and ties missing `slate` and `slate-browser` tests to
   proof closure.
7. [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   is planned to track new recovery buckets instead of treating the current
   freeze as the end of granular review.
8. [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
   exists as a required artifact lane with schema, proof-owner fields, and
   emitted-artifact requirements.
9. Every command doc in
   [/Users/zbeyens/git/plate-2/docs/slate-v2/commands](/Users/zbeyens/git/plate-2/docs/slate-v2/commands)
   is planned to point at the new spec/roadmap flow instead of the old
   `deep-interview-slate-v2-roadmap-release-candidate` / `Target B` loop.
10. Live verdict docs keep `Target A` / `Target B` as verdict vocabulary, while
    the roadmap and command pack adopt `POC RC` / `True Slate RC` as roadmap
    vocabulary.
11. The initial open recovery rows are seeded by concrete files across core,
    history, runtime, browser, and proof-matrix lanes.
12. The final plan includes Ralph/team staffing guidance, launch hints, and a
    verification path.
13. Repo-local envelope docs and specialist lane docs are explicitly checked for
    framing drift, and no touched doc gets to imply that `True Slate RC` is
    already achieved.

## Implementation Steps

### 1. Rewrite the canonical roadmap frame

Why:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  still presents a completed `Target A` foundation + `Target B` blocker ladder,
  `next batch: none`, and a frozen hold posture.

Work:

- replace the current `migration candidate / Target A / Target B / batch ladder`
  framing with:
  - completed opening tranche: `POC RC`
  - tranche 1: principle stack lock and RC vocabulary reset
  - tranche 2: true Slate contract recovery
  - tranche 3: extension-model proof
  - tranche 4: broad diff/test/file review closure
  - tranche 5: `True Slate RC` judgment
- add one explicit translation table:
  - historical `Target A` -> completed `POC RC` default-stack verdict
  - historical `Target B` -> older name for the broader replacement claim that
    now resolves into `True Slate RC`
  - surviving old labels are historical only, never roadmap control terms
- keep truth ownership boundaries intact:
  - roadmap owns sequencing and commands
  - live verdict docs own the current go/no-go read
  - [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
    stays reference-only
- make the “every cut must justify better value” rule explicit inside the
  roadmap, not just in supporting prose
- make the Ian/Slate rubric explicit using
  [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
  on:
  - data-model-first
  - operations/collaboration first-class
  - transaction-first engine semantics
  - React-optimized runtime without React-first ontology
  - package split and explicit adapters
- make sequencing explicit:
  - claim-bearing contract recovery completes before any runtime experiment can
    be promoted
  - runtime ideas from
    [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
    are validation inputs and optional follow-on work, not their own roadmap
    owner

Primary file:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Supporting evidence:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)

### 2. Define the extension-model proof gate and broader proof ladder

Why:

- “extension-model recovery” is still too slogan-shaped unless the plan names
  the capabilities, proof owners, and exit bar.
- [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md)
  should stay narrow and current-claim-scoped, not become the whole
  `True Slate RC` proof backlog.

Work:

- define tranche-3 capabilities explicitly:
  - primitive edit interception
  - domain command extension
  - schema / normalization extension without React coupling
  - non-React / headless use that is still first-class
  - operation/history/collaboration integrity under extension hooks
- assign proof owners:
  - roadmap owns the tranche and exit bar
  - ledger owns the file-level `[ ]/[x]` rows
  - core/headless/API evidence lives first in:
    - `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
    - `/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts`
    - `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`
  - operation/history evidence lives first in:
    - `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
  - runtime/browser evidence lives first in:
    - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
    - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts`
    - [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
- create a roadmap-owned broader proof support doc, instead of widening
  [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md)
  into backlog soup:
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- define the proof ledger schema on first creation:
  - recovery lane
  - command/test surface
  - expected outcome
  - actual outcome
  - artifact links
  - owning doc
  - proof owner
  - status
- require browser and future agent-native rows to emit the artifact set from
  [framework-design.md](/Users/zbeyens/git/plate-2/docs/slate-browser/framework-design.md):
  - selection dump
  - DOM dump
  - screenshot
  - action transcript
  - action
  - expected outcome
  - actual outcome
  - artifact links
- set the tranche exit bar:
  - representative real ports exist
  - cuts are justified with named better-value arguments
  - proof owners are green for each capability lane

Primary files:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

### 3. Re-anchor the front door and inspect live verdict/envelope drift without

rewriting verdict ownership

Why:

- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md) still
  frames the stack as `Target A: Go` / `Target B: No-Go`, which is still the
  live verdict.
- the roadmap rewrite will contradict the front door if the stack does not
  explain the mapping between roadmap vocabulary and verdict vocabulary.
- repo-local envelope docs are still active proof surfaces and can drift even
  if the verdict vocabulary stays the same.

Work:

- update [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
  so it keeps `Target A` / `Target B` as live verdict language while clearly
  routing roadmap readers to the new `POC RC -> True Slate RC` roadmap
- add or refresh a short ownership table in the front door / command entrypoint
  so operators can see, in one place, which docs own verdict, sequence,
  evidence, reference, and maintainer context
- inspect
  [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md),
  [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md),
  [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md),
  and
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
  for wording/link drift, but keep them as verdict/evidence docs
- keep
  [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md)
  scoped to current core proof only
- inspect repo-local envelope drift in
  [Readme.md](/Users/zbeyens/git/slate-v2/Readme.md) and
  [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- inspect specialist-lane framing drift in
  [docs/slate-browser/overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md)
  and
  [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
- keep the live status sentence strict:
  - completed `POC RC`
  - open `True Slate RC`
  - no fake promotion in roadmap-adjacent docs

Primary files:

- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [docs/slate-browser/overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md)
- [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)

### 4. Rebuild the granular review ledger around recovery lanes

Why:

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  currently reads like the major diff review is basically finished, with only
  claim width/oracle depth/narrow family contracts still open.

Work:

- add top-level recovery buckets for:
  - extension model / behavior interception
  - schema / normalization
  - non-React / headless
  - operation/history/collab
  - public API / editor surface
  - major file/test deletion review
- convert the current freeze read into an open/close read for `True Slate RC`
- keep `[ ]/[x]` file-granular tracking mandatory and tie it to periodic diff
  reviews
- promote missing `slate` and `slate-browser` tests to explicit proof rows
- add file-granular subrows for deletion-heavy public-surface cuts and missing
  tests so the ledger cannot slide back into vague buckets
- seed the first required open rows from:
  - `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts`
  - [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
- distinguish between:
  - already-completed `POC RC` classifications
  - still-open `True Slate RC` review rows
- keep
  [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  in sync as the maintainer-context companion to the ledger

Primary file:

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Supporting evidence:

- [2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md)

### 5. Rewrite the command pack so operators follow the new path

Why:

- the command docs still assume the old spec path and the old hold model

Work:

- update
  [reconsolidate-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reconsolidate-roadmap.md)
  and
  [replan-remaining-work.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/replan-remaining-work.md)
  to invoke exactly:
  - `$ralplan /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md`
- update
  [reinterview-remaining-scope.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md)
  to re-open ambiguity against the new recovery lanes, not just “remaining
  `Target B` scope”
- update
  [launch-next-ralph-batch.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/launch-next-ralph-batch.md)
  so `next batch` means the first unfinished `True Slate RC` tranche rather
  than a non-existent leftover blocker batch
- update
  [refresh-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/refresh-file-review-ledger.md)
  so it references the new recovery buckets and periodic diff-review cadence
- update the command entrypoint copy to point at the truth-ownership matrix and
  translation table, not just “the roadmap”
- treat
  [reconsolidate-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reconsolidate-roadmap.md)
  as the concrete command-pack entrypoint that carries the translation table
  and ownership reminder
- repoint
  [reinterview-remaining-scope.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md)
  so its refresh target becomes:
  - [2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md)
    instead of
  - [2026-04-08-slate-v2-master-roadmap-consensus-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-master-roadmap-consensus-plan.md)

Primary files:

- [reconsolidate-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reconsolidate-roadmap.md)
- [replan-remaining-work.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/replan-remaining-work.md)
- [reinterview-remaining-scope.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md)
- [launch-next-ralph-batch.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/launch-next-ralph-batch.md)
- [refresh-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/refresh-file-review-ledger.md)

### 6. Lock the operator handoff and verification rules

Why:

- this rewrite only matters if later execution can follow it without
  re-litigating scope

Work:

- finalize this consensus plan with explicit Ralph/team staffing
- queue the live rewrite in one Ralph execution pass or a small team split with
  disjoint write scopes
- define grep/manual review checks that prove the old frame is no longer
  primary
- make the team/Ralph verification path explicit so the plan does not end in
  “and then somehow we clean it up”

Primary artifacts:

- this consensus plan
- updated command pack
- updated roadmap/front-door/verdict/ledger docs
- updated proof ledger and maintainer diff register

## Risks And Mitigations

- Risk: the new roadmap starts competing with verdict docs again.
  Mitigation:
  keep [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md) as
  the front door only, keep current verdict ownership in the live verdict docs,
  and keep
  [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
  reference-only.
- Risk: extension-model recovery collapses into backward-compat cosplay.
  Mitigation:
  define capability parity, representative ports, and explicit cut
  justifications instead of legacy-name parity.
- Risk: diff review becomes checkbox theater.
  Mitigation:
  require `[ ]/[x]` file-granular rows tied to concrete proof owners and
  missing tests.
- Risk: runtime experiments outrun Slate identity again.
  Mitigation:
  keep runtime ideas as validation inputs and post-recovery follow-on work, not
  a parallel tranche.
- Risk: command docs drift and operators keep invoking the old spec.
  Mitigation:
  rewrite all command docs in the same execution pass and add grep verification
  for the old spec path / old framing strings.
- Risk: the rewrite accidentally promotes the current state beyond what the
  evidence supports.
  Mitigation:
  keep every touched verdict/envelope doc explicit about the mapping:
  completed `POC RC`, open `True Slate RC`, no fake promotion.

## Verification Steps

1. Re-read the spec at
   [/Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md](/Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md)
   and confirm every mandatory item is represented.
2. Re-read
   [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md),
   [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md),
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md),
   [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md),
   [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md),
   [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md),
   [Readme.md](/Users/zbeyens/git/slate-v2/Readme.md), and
   [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md),
   [docs/slate-browser/overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md),
   and
   [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
   to ensure the plan addresses the live contradictions.
3. After execution, run:

```sh
rg -n "POC RC|True Slate RC" \
  /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/commands/*.md

rg -n "Target A|Target B" \
  /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/commands/*.md

rg -n "Target A|Target B" \
  /Users/zbeyens/git/plate-2/docs/slate-v2/overview.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md

rg -n "deep-interview-slate-v2-roadmap-release-candidate" \
  /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/commands/*.md \
  /Users/zbeyens/git/plate-2/docs/slate-v2/overview.md
```

Pass rule:

- `master-roadmap.md` and `docs/slate-v2/commands/*.md` may contain
  `Target A` / `Target B` only inside the explicit historical translation table
  or quoted historical context
- any other hit in those files is failure
- live verdict docs may retain `Target A` / `Target B`

4. Manually confirm
   [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md) still
   routes readers to live verdict docs first and keeps supporting plans
   non-canonical.
5. Manually confirm
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   has open recovery buckets, proof owners, and file-granular subrows for
   deletion-heavy and missing-test surfaces, not a fake “freeze complete”
   posture.
6. Manually confirm
   [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
   was created during execution and requires expected/actual/artifact-link
   fields.
7. Manually confirm
   [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
   still matches the front-door reading order and the ledger's proof-owner
   claims.

## ADR

### Decision

Replace the current `Target A` / `Target B` roadmap frame with one linear
`POC RC -> True Slate RC` roadmap and re-anchor the ledger + command pack
around the recovered Slate contract.

### Drivers

- current docs are honest only about a narrowed hold
- the end state is full flexibility in Ian/Slate philosophy, not a
  default-stack subset
- the command pack and roadmap need new vocabulary, while verdict docs still
  need to keep release truth stable
- proof ownership without artifact obligations is too soft to close a real RC

### Alternatives Considered

- patch the current ladder with another blocker batch
- keep a dual-track POC roadmap plus true Slate roadmap
- continue runtime experimentation first

### Why Chosen

- patching leaves the wrong destination in control
- dual tracks recreate roadmap split-brain
- runtime-first sequencing optimizes the wrong product if Slate identity losses
  remain unresolved

### Consequences

## Post-Interview Clarification (2026-04-09)

The later quick re-interview on remaining `True Slate RC` scope clarified four
things:

1. safe default live invariants are enough; full canonical shape does not need
   to happen after every ordinary committed edit
2. heavier canonicalization belongs on explicit/load/import/app-owned
   boundaries unless the better live design survives proof
3. collaboration is primarily an architecture/invariants lane, not a “more
   demos” blocker lane
4. after the current safe normalization tranche, the next mainline blocker is
   broad API/public-surface reconciliation plus file/test deletion closure

Reference:

- [2026-04-09-slate-v2-remaining-scope-reinterview.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-remaining-scope-reinterview.md)

- the master roadmap becomes a true end-to-end artifact instead of a frozen
  hold log
- live verdict/support docs need label and scope repair
- live verdict docs keep ownership and vocabulary while the roadmap/commands
  move to the new frame
- the stack gets one explicit truth-ownership matrix and one proof ledger
- granular review re-opens with sharper recovery buckets
- repo-local envelope docs and command docs must be rewritten in lockstep

### Follow-Ups

- execute the doc rewrite
- run the ledger/command alignment sweep
- launch the first `True Slate RC` batch against the rewritten roadmap
- re-interview if diff review exposes new top-level Slate-identity lanes

## Available-Agent-Types Roster

- `explorer` — fast doc/diff inventory and file-backed findings
- `planner` — roadmap reconsolidation and tranche/order tuning
- `architect` — Ian/Slate philosophy guardrail; challenges React-first drift
  and weak cut logic
- `critic` — rejects vague proof/cut language and weak acceptance criteria
- `executor` — performs the doc rewrites
- `writer` — polish/consistency pass for dense docs if needed
- `verifier` — grep/manual consistency sweep after edits

## Follow-Up Staffing Guidance

### Ralph path

- Lane 1: `executor` (`high`) owns
  [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  - [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- Lane 2: `executor` or `writer` (`medium`) owns
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  - command pack
- Lane 3: `executor` (`medium`) owns blocker/oracle/verdict/envelope
  re-anchoring
  - [docs/slate-browser/overview.md](/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md)
  - [docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
- Lane 4: `explorer` (`low`) inventories residual `Target A` / `Target B` /
  old-spec references
  - [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- Lane 5: `architect` (`high`) and `critic` (`high`) do final sign-off after
  verifier evidence

### Team path

- Worker 1 owns
  `/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md` and
  `/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md`
- Worker 2 owns
  `/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md` and
  `/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md` and
  `/Users/zbeyens/git/plate-2/docs/slate-v2/commands/*.md`
- Worker 3 owns
  `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md`,
  `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`,
  `/Users/zbeyens/git/slate-v2/Readme.md`, and
  `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- Leader integrates, runs grep/manual verification, then sends architect +
  critic sign-off

Rule:

- workers are not alone in the codebase; keep write scopes disjoint and adapt
  to others’ edits instead of reverting them

## Launch Hints

- Ralph:

```sh
$ralph /Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md
```

- Team:

```sh
$team /Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md
```

- `omx team` hint:
  use the same plan path, with the three write lanes above, then reserve final
  verification/sign-off for the leader

## Team Verification Path

1. Each worker proves their write scope is internally consistent and hands back
   explicit files changed plus any open contradictions.
2. Leader runs repository-wide grep checks for old framing/spec references and
   manually re-reads the front door, roadmap, ledger, verdict docs, and
   blocker/oracle docs.
3. `verifier` confirms acceptance-criteria coverage.
4. `architect` challenges philosophy drift and cut logic.
5. `critic` approves only if the rewritten stack is linear, explicit, and not
   hiding the old hold model under new labels.

## Changelog To Apply During Finalization

- fold in any architect/critic tightening on truth ownership, cut language, and
  verification commands
- critic approved the handoff; treat the next execution pass as create-first for
  `true-slate-rc-proof-ledger.md`
