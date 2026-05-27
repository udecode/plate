---
date: 2026-04-07
topic: slate-v2-release-ready-without-regression-consensus-plan
status: approved
source: /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-release-ready-without-regression.md
deepened: 2026-04-07
---

# Slate v2 Release-Ready Without Behavior Or Testing Coverage Regression

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Problem Frame

`/Users/zbeyens/git/slate-v2` currently has a credibility gap between the
remaining proof surface and the size of the deleted legacy surface. The user
does not want a fake `Target B` story, a silent test shrink, or contributor
confusion caused by deleted conceptual slots.

The required boundary from the deep interview is:

- keep the closest legacy-shaped architecture for contributor-facing concepts:
  - examples
  - tests
  - docs
  - conceptual slots
- allow internal implementation divergence
- document every accepted drift explicitly

## RALPLAN-DR Summary

### Principles

1. Contributor-facing parity beats internal file nostalgia.
2. No contributor-facing deletion is allowed to stay silent.
3. Release claims must trail gated evidence, not lead it.
4. Performance language stays lane-by-lane until broader proof exists.

### Decision Drivers

1. Prevent behavior and coverage regression in the shipped/editor-facing story.
2. Preserve contributor mental models and repo legibility.
3. Make the release gate enforce the same proof stack the docs claim.

### Viable Options

#### Option A: Restore Every Deleted Legacy File Literally

Pros:

- maximally conservative
- easiest story to explain emotionally

Cons:

- forces architecture rollback
- reintroduces dead internal seams
- wastes effort restoring private structures the user explicitly said may diverge

#### Option B: Restore Exact Contributor-Facing Conceptual Slots, Allow Internal Divergence

Pros:

- matches the interview boundary exactly
- protects DX and contributor experience
- allows v2 architecture to stay modern internally
- gives a clean drift register story for the large PR

Cons:

- requires deliberate mapping work
- harder than simply narrowing the claim

#### Option C: Shrink The Claim Hard And Ship Target A Only

Pros:

- fastest path to honest release
- least implementation work

Cons:

- does not satisfy the user's release-ready replacement goal
- leaves contributor-facing concept loss unresolved

### Chosen Option

Pick **Option B**.

### Why Option A Loses

It optimizes for emotional symmetry, not product truth. The user explicitly
allowed internal divergence. Restoring dead private architecture just to make
the tree look old again is the wrong target.

### Why Option C Loses

It is honest, but it abandons the stated goal. Good fallback, wrong primary
plan.

## ADR

### Decision

Restore or remap every contributor-facing deleted concept into the closest
current conceptual slot, while allowing internal file/module architecture to
diverge.

### Drivers

- preserve contributor-facing conceptual continuity
- prevent behavior/testing coverage regression
- avoid architecture rollback
- keep release claims aligned with enforced proof

### Alternatives Considered

- literal one-to-one restoration of everything
- hard retreat to Target A only

### Why Chosen

It is the only option that matches the deep interview boundary exactly.

### Consequences

- examples/tests/docs work becomes first-class release work
- internal rewrites stay permissible
- the future PR description must carry a full drift register
- `Target B` remains red until this recovery is complete

### Follow-ups

- restore/remap contributor-facing concept slots
- rebuild the release gate
- only then re-evaluate `Target B`

## Implementation Units

### Unit 1: Claim And Source-Of-Truth Lock

Purpose:

- keep the live verdict honest while recovery happens
- define the current contributor-facing concept inventory that the rest of the
  plan must satisfy

Files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md`
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`

Decisions:

- keep `Target B` red until all contributor-facing concept slots are restored or
  mapped
- point the live stack at the regression-audit plan as the governing tracker

Current tranche state:

- completed for:
  - `android-tests`
  - `check-lists`
  - `code-highlighting`
  - `custom-placeholder`
  - `inlines`
  - `search-highlighting`
  - `slate-hyperscript`
- still pending:
  - deeper `Target B` blockers after the contributor-facing tranche:
    - shipping release-gate parity
    - broader oracle depth
    - widened family proof depth
    - lane-by-lane perf truth

Test scenarios:

- docs name the same blockers
- no live doc treats the recovered contributor-facing tranche as unresolved

### Unit 1.5: Release-Gate Manifest First

Purpose:

- establish the exact proof checklist before recovery work fans out

Files:

- `/Users/zbeyens/git/slate-v2/package.json`
- `/Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-full-release-regression-audit-plan.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`

Decisions:

- define one manifest of required proof lanes
- every later restore/remap task must point at the exact lane that satisfies it

Test scenarios:

- one canonical replacement-gate checklist exists
- every restored or remapped concept has a named proof owner in that checklist

### Unit 2: Contributor-Facing Concept Matrix

Purpose:

- turn deleted contributor-facing concepts into an explicit restore/remap table

Canonical concept set:

- `android-tests`
- `check-lists`
- `code-highlighting`
- `custom-placeholder`
- `inlines`
- `search-highlighting`
- `slate-hyperscript`

Files:

- `/Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-full-release-regression-audit-plan.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md`
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`
- `/Users/zbeyens/git/slate-v2/Readme.md`
- `/Users/zbeyens/git/slate-v2/docs/Introduction.md`
- `/Users/zbeyens/git/slate-v2/docs/Summary.md`

Decisions:

- every concept gets one of:
  - restored in place
  - mapped to a closest current replacement
- no concept gets cut without a named replacement slot unless it is clearly
  outside contributor-facing release scope

Test scenarios:

- every concept above has one exact decision
- no stale docs point at a deleted concept without a replacement note
- stale-reference scan exists for deleted concept names before release sign-off

### Unit 3: Example-Slot Recovery

Purpose:

- restore or remap deleted example routes into closest current conceptual slots

Files:

- `/Users/zbeyens/git/slate-v2/site/constants/examples.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/**`
- `/Users/zbeyens/git/slate-v2/site/examples/js/**`

Completed concept decisions in the first tranche:

1. `android-tests`
   - restored as a current Android/IME hub slot
   - proof owner:
     - `android-tests.test.ts`
2. `check-lists`
   - restored as a current interactive checklist slot
   - proof owner:
     - `check-lists.test.ts`
3. `code-highlighting`
   - restored as a current editable token-highlighting slot
   - proof owner:
     - `code-highlighting.test.ts`
4. `custom-placeholder`
   - restored as a current placeholder-seam slot
   - proof owner:
     - `placeholder.test.ts`
5. `inlines`
   - restored as a current inline-family slot
   - proof owner:
     - `inlines.test.ts`
6. `search-highlighting`
   - restored as a current projection-driven highlighting slot
   - proof owner:
     - `search-highlighting.test.ts`

Concept-slot rule:

- a `closest current conceptual slot` does not have to mean one exact route if a
  small documented cluster teaches the same contributor concept more honestly
- but it must still be first-class and easy to find in docs/examples/tests

Test scenarios:

- `tsc:examples` passes with the chosen example set
- example index/readme matches the final concept matrix
- every deleted legacy example concept has a visible current home

### Unit 4: Browser-Proof Recovery

Purpose:

- restore direct browser proof for deleted contributor-facing example slots or
  map them to nearest equivalent current lanes

Files:

- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts`
- `/Users/zbeyens/git/slate-v2/package.json`

Deleted lane set and current mapping decisions after the first tranche:

- `huge-document.test.ts`
  - mapped to the frozen huge-document benchmark lane
- `iframe.test.ts`
  - mapped to replacement compatibility coverage
- `plaintext.test.ts`
  - mapped to replacement compatibility coverage
- `read-only.test.ts`
  - mapped to replacement compatibility coverage
- `select.test.ts`
  - mapped to the current anchor/rich-inline lifecycle and selection proof
- `shadow-dom.test.ts`
  - mapped to replacement compatibility coverage

Decisions:

- direct current-family browser lanes are preferred for contributor-facing
  concepts
- compatibility rows may backstop, but they should not be the only surviving
  story where a direct lane used to exist

Test scenarios:

- each deleted lane is restored or explicitly mapped
- mapping table is reflected in docs/plan/PR drift register

### Unit 5: Package Proof Recovery

Purpose:

- rebuild the contributor-facing regression oracle without restoring dead
  internals blindly

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/**`
- `/Users/zbeyens/git/slate-v2/package.json`

Deleted bucket set to resolve:

- `packages/slate/test/interfaces/**`
- `packages/slate/test/transforms/**`
- `packages/slate/test/operations/**`
- `packages/slate/test/normalization/**`
- `packages/slate/test/utils/**`
- `packages/slate-react/test/**`
- `packages/slate-history/test/**`

Decisions:

- restore contributor-facing test concepts, not dead implementation detail
  mechanically
- if a legacy bucket no longer maps one-to-one, rebuild the proof at the
  nearest current seam and document the drift

Important tension:

- exact file-for-file resurrection of `1048` legacy package tests is not the
  goal
- exact contributor-facing proof concepts for public behavior are the goal

Test scenarios:

- every deleted bucket has a named current proof owner
- root/package test commands cover the rebuilt proof surface

### Unit 6: `slate-hyperscript` Recovery

Purpose:

- keep `slate-hyperscript` as part of contributor-facing parity without forcing
  the old fixture harness back into the release bar

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/**`
- `/Users/zbeyens/git/slate-v2/docs/Summary.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/10-serializing.md`
- `/Users/zbeyens/git/slate-v2/Readme.md`

Completed decision:

1. restore `slate-hyperscript` as a live package surface
2. keep the old fixture corpus out of the release bar
3. use a current smoke proof in the root Mocha lane for the contributor-facing
   package slot

Test scenarios:

- docs do not reference a dead package without a current replacement story
- the package/concept slot is explicit in README + docs + test harness guidance

### Unit 7: Release Gate Rebuild

Purpose:

- make the release command enforce the same proof stack the release docs claim

Files:

- `/Users/zbeyens/git/slate-v2/package.json`
- any helper scripts required under `/Users/zbeyens/git/slate-v2/scripts/**`

Required gate:

1. core/history package proof
2. `slate-react` runtime proof
3. `slate-dom` proof
4. contributor-facing example/browser proof
5. replacement compatibility proof
6. release-relevant type/lint proof

Blocking release gate shape:

1. `yarn build:rollup`
2. `yarn test`
3. `yarn test:replacement:compat:local`
   - or CI-safe equivalent if the legacy repo is provisioned differently there
4. one stable browser wrapper for the widened current family suite
   - currently routed through `yarn test:replacement:gate:local`
5. `yarn lint:release`

Performance policy:

- replacement benchmark lanes are not part of the blocking per-commit release
  gate
- they stay as:
  - nightly evidence
  - release-candidate evidence
  - manual evidence before flipping `Target B`
- perf lanes block claims, not routine release-gate execution
- lane-by-lane wording stays mandatory while the measurements remain narrow or
  mixed

Current state:

- root command graph restored in `/Users/zbeyens/git/slate-v2/package.json`
- `prerelease` now routes through the widened replacement gate instead of the
  skinny `yarn test`
- full perf benches are intentionally deferred from the blocking gate because
  they are slower and noisier than the correctness/coverage lanes

Test scenarios:

- one top-level release gate command exists
- its membership matches the release docs exactly
- benchmark lanes are documented separately as non-blocking claim evidence

### Unit 8: Drift Register And PR Story

Purpose:

- make every accepted divergence legible in the large PR

Artifacts:

- plan-level drift register:
  - [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- final PR description section

Required fields per drift:

- legacy concept
- current replacement
- why the replacement is closest
- what behavior changed
- what test moved or was adapted
- what doc moved or was rewritten

Test scenarios:

- no accepted drift lacks a register entry
- register language matches repo reality

## Deliberate-Mode Pre-Mortem

### Scenario 1: Fake Parity

Failure:

- we map deleted concepts to “kind of similar” current surfaces and ship a lie

Prevention:

- require explicit concept-by-concept replacement rationale
- require direct browser proof where a direct contributor-facing example used to
  exist

### Scenario 2: Architecture Rollback Panic

Failure:

- in trying to restore parity, we reintroduce dead internal architecture

Prevention:

- hold the line on contributor-facing parity only
- allow internal divergence unless public/contributor behavior depends on it

### Scenario 3: Release Gate Drift Returns

Failure:

- docs say one thing, `prerelease` runs another tiny suite

Prevention:

- make one canonical gate command
- point docs at that command explicitly

## Expanded Test Plan

### Unit

- package contract suites for `slate`, `slate-history`, `slate-react`,
  `slate-dom`
- rebuilt concept-level package tests for restored/mapped deleted buckets

### Integration

- `tsc:examples`
- example-slot restoration checks
- replacement compatibility matrix

### E2E / Browser

- direct example tests for contributor-facing concept slots
- IME/mobile-input proof where Android concept is remapped

### Observability / Evidence

- measured benchmark artifacts for the frozen lanes
- drift register for the large PR
- release gate command definition as executable evidence

## Concrete Verification Steps

Minimum same-turn evidence before flipping `Target B`:

1. `yarn tsc:examples`
2. `yarn test`
3. release-gate command
4. targeted browser proof for restored/mapped concept slots
5. compatibility matrix
6. benchmark lanes
7. doc-prettier checks on changed source-of-truth docs
8. stale-reference scan for deleted concept names and dead package references

## Available Agent Types

- `architect`
- `critic`
- `planner`
- `researcher`
- `explore`
- `executor`
- `verifier`
- `test-engineer`
- `code-reviewer`
- `writer`

## Suggested Reasoning Levels By Lane

- concept-mapping and docs lanes: `medium`
- package oracle rebuild: `high`
- browser-proof rebuild: `high`
- `slate-hyperscript` decision: `high`
- release-gate wiring: `medium`

## Staffing Guidance

### If Executing Via `ralph`

- use `ralph` for sequential, dependency-heavy recovery:
  1. concept matrix
  2. example-slot rebuild
  3. browser-proof rebuild
  4. package oracle rebuild
  5. release gate
  6. drift register + final docs

### If Executing Via `team`

- split into disjoint lanes:
  1. examples/docs concept mapping
  2. Playwright/browser proof recovery
  3. package-test oracle recovery
  4. release gate + drift register

Use `$team` only after the concept matrix is fixed first. Parallelizing before
the mapping is explicit is how this turns into soup.

## Launch Hints

- sequential:
  - `$ralph /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-release-ready-without-regression-consensus-plan.md`
- team:
  - `$team /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-release-ready-without-regression-consensus-plan.md`

## Team Verification Path

1. freeze the concept matrix first
2. after each lane, update the drift register
3. run package tests + `tsc:examples`
4. run restored/mapped browser lanes
5. run compatibility matrix
6. run benchmarks
7. only then re-open the `Target B` verdict
