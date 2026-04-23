---
date: 2026-04-07
status: draft
source_context: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-release-hardening-plan-20260407T082855Z.md
source_plan: /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-remaining-release-hardening-plan.md
mode: consensus
---

# Slate v2 Release-Grade Confidence Consensus Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Review Verdict

Current state is not release-grade by the standard the user asked for.

False today:

- zero-regression confidence
- full legacy Slate test parity
- honest blanket full-replacement claim

True today:

- `/Users/zbeyens/git/slate-v2` is a credible replacement candidate for a proved
  default surface
- the roadmap is frozen enough
- the remaining problem is release hardening, not roadmap grooming

## RALPLAN-DR

### Principles

- Plan to the claim, not to vanity parity.
- Use legacy Slate tests as an oracle where the v2 surface already claims the
  behavior.
- Freeze scope explicitly; do not let “maybe later” semantics leak into release.
- Require proof from three lanes: oracle tests, default-surface runtime/browser
  proof, and calibrated benchmark wording.
- A release gate only passes if docs and evidence say the same thing.

### Decision Drivers

1. Test-surface asymmetry is still extreme: legacy `slate` has `1069` test files;
   current v2 `slate` has `3`.
2. Public replacement language is still stronger than the proof in several areas:
   comparison-only families, narrow benchmark scope, package-runtime confidence.
3. The cheapest honest path is not full legacy parity first; it is release-grade
   confidence for a narrowed, explicit target.

### Viable Options

1. Ship now as a broad “release-grade” claim.
   Rejected: evidence is not remotely strong enough.
2. Chase full legacy parity before any release-grade claim.
   Rejected: too large, wrong order, and not necessary for a narrower honest
   target.
3. Narrow the release target, harvest proof for the already-claimed surface,
   freeze package/runtime claims, then run a hard final stop/go.
   Chosen: smallest honest path to release-grade confidence.

### Why Chosen

It matches the evidence. Anything broader is fantasy; anything narrower just
kicks the can.

## ADR

### Decision

Use a seven-workstream release-hardening program, executed in strict order, to
decide whether `slate-v2` can claim release-grade confidence for the proved
default surface:

- `Slate`
- `EditableBlocks`
- `withHistory(createEditor())`

### Alternatives Considered

- Full legacy parity program first
- Ship current candidate state with stronger wording
- Keep doing micro-slices and revisit later

### Why This Decision Wins

- It converts the current docs into an executable proof program.
- It prevents fake “release-grade” language before the evidence exists.
- It keeps scope tight enough to finish.

### Consequences

- Comparison-only families stay outside the default release claim unless they
  are explicitly promoted with proof.
- Current public wording may need to get narrower before it gets stronger.
- Test harvesting becomes the dominant cost center.

### Follow-Ups

- If the final gate is `Go`, freeze docs and ship.
- If the final gate is `No-Go`, publish the blocker set and cut the claim.

## Ordered Execution Plan

### Workstream 1. Reset The Exact Release Target

Status:

- done

Purpose:

- choose one honest release target before spending more proof effort:
  `Slate + EditableBlocks + withHistory(createEditor())`

Dependencies:

- none

Likely files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`

Required decisions:

- `Target A`: release-grade confidence for the proved default surface
- `Target B`: honest full replacement

Chosen default for planning:

- `Target A`

Verification commands:

- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn test:replacement:compat:local`

Acceptance criteria:

- one explicit target named in all four files
- `Target B` remains documented only as a later claim with blocker list
- no doc still mixes candidate-grade and full-replacement language

Exit criteria:

- a reviewer can answer “what exactly are we trying to release?” in one sentence

### Workstream 2. Harvest Legacy Tests For The Already-Claimed `slate` Surface

Status:

- in progress

Purpose:

- replace bespoke local confidence with legacy-oracle-backed confidence

Dependencies:

- Workstream 1

Likely source files:

- `/Users/zbeyens/git/slate/packages/slate/test/transforms/delete/**`
- `/Users/zbeyens/git/slate/packages/slate/test/transforms/move/**`
- `/Users/zbeyens/git/slate/packages/slate/test/transforms/wrapNodes/**`
- `/Users/zbeyens/git/slate/packages/slate/test/transforms/unwrapNodes/**`
- `/Users/zbeyens/git/slate/packages/slate/test/transforms/liftNodes/**`
- `/Users/zbeyens/git/slate/packages/slate/test/interfaces/Editor/**`

Likely target files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md`

Execution batches:

1. `delete`, `move`, `Editor.before`, `Editor.after`
2. `select`, `setPoint`, `collapse`, `setSelection`, `deselect`
3. `wrapNodes`, `unwrapNodes`, `liftNodes`

Rules:

- port only cases the current v2 contract claims
- every skipped legacy case gets one reason:
  - unsupported semantics
  - intentionally out of scope
  - comparison-only family

Acceptance criteria:

- each claimed family has a harvested-case inventory
- each skipped legacy case has a written reason
- every claimed `slate` helper family has harvested oracle cases
- raw file-count parity is **not** required for `Target A`

Verification commands:

- `yarn test:mocha`

Exit criteria:

- the claimed `slate` surface is mostly defended by imported oracle semantics,
  not custom happy-path proofs

Non-blocking rule:

- unharvested legacy rows outside `Target A` do not block Workstream 4 start
- they matter only if they remain inside the release claim at Workstreams 6 and
  7

### Workstream 3. Harden Runtime Packages Against Their Current Claims

Purpose:

- stop the package-level confidence gap from lagging far behind core `slate`

Dependencies:

- Workstream 1
- should run partly in parallel with Workstream 2, but must finish before the
  final release gate

Likely files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/test/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`

Execution batches:

1. `slate-react` stable editor/reset/selection behavior
2. `slate-history` save/merge/reset behavior on the already-claimed transform
   families
3. `slate-dom` selection/clipboard/bridge behavior
4. `slate-browser` only for already-claimed automation surfaces

Acceptance criteria:

- every package README claim has at least one direct contract test lane
- browser/runtime proofs cover all already-claimed package surfaces
- no package README makes a broader claim than its test surface

Verification commands:

- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:anchors`

Exit criteria:

- package-level release confidence is no longer wildly asymmetric

### Workstream 4. Default-Surface End-to-End Proof

Status:

- in progress
- rich-inline anchor stack green on the current default surface

Purpose:

- prove the actual release target end to end instead of inferring confidence
  from disjoint lower-level tests

Dependencies:

- Workstream 1
- minimum Workstream 3 anchor stack only

Minimum anchor stack required to start:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts`
- one clipboard/DOM seam:
  - `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`
  - or `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts`

Anchor stack:

- `Slate`
- `EditableBlocks`
- `withHistory(createEditor())`

Likely files:

- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts`

Proof lanes:

1. type/edit through the default surface
2. selection and selection recovery
3. copy/paste
4. undo/redo
5. reset/load boundaries
6. outer-transaction and history interactions on the same stack

Acceptance criteria:

- the default stack is proved by direct end-to-end tests, not only by stitched
  lower-level evidence
- type/edit, selection, copy/paste, undo/redo, reset/load, and selection
  recovery are each named and covered
- the same default stack appears consistently in runtime, history, browser, and
  replacement docs

Verification commands:

- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:anchors`
- `yarn test:replacement:compat:local`

Exit criteria:

- a hostile reviewer can see one concrete release target and one concrete proof
  stack for it

Current proof read:

- `rich-inline` now carries one direct browser proof stack for:
  - type/edit
  - selection and blur/focus recovery
  - copy/paste
  - undo/redo
  - reset/load
  - one outer transaction as one history step

Start condition:

- Workstream 4 starts as soon as Workstream 1 and the minimum anchor stack are
  green, even if Workstream 2 is still harvesting oracle cases in parallel

### Workstream 5. Performance Claim Calibration

Status:

- done enough to freeze
- chosen exit: narrow the wording to the frozen measured lanes

Purpose:

- make the performance wording honest for `Target A`

Dependencies:

- Workstream 1
- ideally after Workstreams 2 and 3, so the measured surface matches the tested
  claim

Likely files:

- `/Users/zbeyens/git/slate-v2/scripts/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`

Candidate added lanes if stronger wording is retained:

- selection-heavy workload
- paste-heavy workload
- structural-edit workload
- mixed-inline workload

Valid exits:

1. add enough new lanes that the stronger wording is defended
2. narrow the wording so it only claims what the current two frozen lanes prove

Chosen exit:

- `2`

Acceptance criteria:

- the benchmark story ends with one honest statement, not a hand-wave
- scoreboard records which lanes are frozen and which are exploratory
- performance wording either references the widened lane set or is narrowed to
  placeholder plus huge-document only

Verification commands:

- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`

Exit criteria:

- the performance claim is calibrated to real evidence, not wishful wording

### Workstream 6. Freeze The Actual Release Claim

Purpose:

- make the public claim impossible to over-read

Dependencies:

- Workstreams 1 through 5

Likely files:

- `/Users/zbeyens/git/slate-v2/Readme.md`
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`

Must answer plainly:

- what is safe by default
- what is advanced but claimed
- what is comparison-only
- what is out of scope for this release

Required comparison-only and later handling:

- comparison-only:
  - `richtext`
  - `markdown`
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
  - `tables`
  - `embeds`
  - `editable-voids`
  - `images`
- intentionally later:
  - `scroll-into-view`

Acceptance criteria:

- all five docs use the same exact claim language
- no doc still implies zero regression
- no doc still implies full legacy parity
- all comparison-only families from the ledger are explicitly named, not
  collapsed into fuzzy shorthand
- `scroll-into-view` is explicitly kept intentionally later, not half-claimed

Verification commands:

- `yarn test:replacement:compat:local`
- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`

Exit criteria:

- the release statement is single-source consistent

### Workstream 7. Final Release Gate

Status:

- done enough to freeze
- outcome:
  - `Target A`: `Go`
  - `Target B`: `No-Go`

Purpose:

- decide `Go` or `No-Go` without bullshit

Dependencies:

- Workstreams 1 through 6 complete

Likely files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`

Gate questions:

1. Is the chosen release claim backed by enough legacy-oracle tests?
2. Is the chosen release claim backed by enough default-surface runtime and
   browser proof?
3. Is the chosen release claim backed by calibrated benchmark wording?
4. Are the named comparison-only and intentionally-later families acceptable
   exclusions for `Target A`?

Acceptance criteria:

- every gate question is answered with cited evidence, not prose vibes
- outcome is either `Go` or `No-Go`
- `No-Go` includes a short blocker list with named files and proof gaps

Current gate read:

1. legacy-oracle coverage is now good enough for `Target A`
   because the current claimed `slate` surface is defended by the harvest in:
   - `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md`
   - `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`
2. default-surface runtime and browser proof is now good enough for `Target A`
   because the anchor stack is directly proved in:
   - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
   - `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
   - `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts`
   - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts`
3. benchmark wording is calibrated for `Target A`
   because the public claim is now explicitly limited to:
   - placeholder
   - huge-document `1000`-block
4. comparison-only and intentionally-later exclusions are acceptable for
   `Target A`
   because they are named explicitly in:
   - `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md`
   - `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`

Verification commands:

- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:anchors`
- `yarn test:replacement:compat:local`
- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`

Exit criteria:

- release decision can be defended to a hostile reviewer

Non-blocking rule:

- unharvested legacy rows and comparison-only families outside `Target A` do
  not block `Go`
- they matter only if they remain inside the release claim at Workstreams 6 and
  7

## Dependency Graph

Practical order:

1. Workstream 1
2. Workstream 2 starts in parallel with minimum Workstream 3 anchor stack
3. Workstream 4 starts as soon as that anchor stack is ready
4. Workstream 2 continues in parallel with remaining Workstream 3 batches
5. Workstream 5
6. Workstream 6
7. Workstream 7

Hard dependency notes:

- Workstream 2 without Workstream 1 risks harvesting tests for the wrong claim.
- Workstream 6 before Workstreams 2 through 5 just fossilizes lies.
- Workstream 4 is the release-target proof spine; skipping it leaves the whole
  plan as stitched inference.
- Workstream 2 strengthens confidence, but it is not a hard predecessor for
  starting Workstream 4.

## Intentionally Out Of Scope Even After This Plan

This plan does not promise:

- full legacy Slate test parity
- zero-regression proof for every historical behavior
- automatic promotion of `richtext`, `markdown`, `forced-layout`, `styling`,
  `hovering-toolbar`, `tables`, `embeds`, `editable-voids`, or `images`
- any `scroll-into-view` family claim in this release
- broad `voids`, `unit`, `hanging`, or unsupported-block parity
- blanket “drop-in replacement for everything” wording
- implementation of new families not already on the claimed surface

## Execution Handoff

Recommended staffing by lane:

- execution owner: one lead engineer for Workstream 1, 4, 6, 7
- test-harvest lane: one engineer focused on Workstream 2
- runtime/package lane: one engineer focused on Workstream 3
- benchmark lane: one engineer focused on Workstream 5

Verification path:

- every workstream ends by updating the scoreboard and the release-readiness
  decision
- if the scoreboard cannot absorb the new evidence cleanly, the claim is still
  too fuzzy
