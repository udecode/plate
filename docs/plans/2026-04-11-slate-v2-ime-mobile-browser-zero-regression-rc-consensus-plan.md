---
date: 2026-04-11
topic: slate-v2-ime-mobile-browser-zero-regression-rc-consensus-plan
status: draft
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
source_spec:
  - /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-ime-mobile-browser-zero-regression-rc.md
---

# Slate v2 IME / Mobile / Browser Zero-Regression RC Consensus Plan

## RALPLAN-DR Summary

### Principles

1. Behavior-bearing browser/input legacy surfaces need proof, not confidence.
2. Missing proof blocks by default; omission is allowed only for engine-specific
   internals with no user-visible browser/input behavior.
3. File-granular review comes before broad “parity” language.
4. Recovery work should target real user-visible behavior, not dead internal
   architecture nostalgia.
5. RC wording must follow proved coverage, not architectural optimism.

### Decision Drivers

1. Legacy Slate React carried explicit Android and restore-dom machinery that
   current `slate-v2` intentionally cut.
2. Current `slate-v2` browser proof is strong on Chromium IME paths, but weak
   on real Android, iOS Safari, Firefox, and richer focus/composition
   interactions.
3. The user wants the strong claim: zero regression on relied-on weird-input
   surfaces, not “good enough on Chromium”.

### Viable Options

#### Option A: Narrow the RC claim to the currently proved browser surface

Pros:
- cheapest path
- probably enough for a pragmatic desktop RC

Cons:
- directly violates the clarified spec
- does not answer the actual risk question

Status:
- invalid under the deep-interview boundary

#### Option B: File-granular review only, then defer recovery

Pros:
- lower immediate implementation cost
- gives a clean map of unknowns

Cons:
- still leaves the strong RC claim unsupported
- turns missing proof into known-but-accepted risk, which the spec forbids

Status:
- invalid under the deep-interview boundary

#### Option C: File-granular review plus immediate recovery program

Pros:
- matches the clarified scope and blocker rule
- turns missing proof into an executable RC program
- creates a durable ledger instead of a one-turn review

Cons:
- more expensive than review-only
- may expose genuinely missing parity work that delays the stronger RC claim

Status:
- chosen

## Problem Frame

Legacy Slate React had platform-specific and browser-specific weird-input
patches:

- Android input manager
- restore-dom mutation repair
- dense DOM selection and composition handling

Current `slate-v2` has:

- mounted-bridge `Editable`
- `ReactEditor` / `DOMBridge` helper surface
- Chromium Playwright IME proof on placeholder, inline-edge, and void-edge
- specialist `slate-browser` helper layer

That is not enough to claim zero regression on every relied-on weird-input
surface.

## Reopen Protocol

Day 0 rule:

1. mark the browser/input parity lane as `reopened-under-challenge` in the live
   RC docs before any recovery work starts
2. update the canonical truth docs first:
   - [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
   - [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
   - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
3. do not let a side ledger quietly challenge a lane that the live docs still
   call closed

## Gate Authority

Execution authority:

- the behavior/parity ledger is the only artifact allowed to decide whether a
  row is:
  - proved
  - blocking
  - justified omission

Publication authority:

- the RC docs are the only artifacts allowed to decide the public verdict after
  the behavior ledger has been reconciled:
  - [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
  - [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
  - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

`Justified omission` approval rule:

- a row cannot be downgraded to `justified omission` by one note in the file
  ledger
- it must record:
  - the exact legacy file(s)
  - the exact user-visible behavior hypothesis
  - why the behavior is actually engine-internal and not user-visible
  - the current owner that subsumes or deletes the behavior
  - explicit sign-off in the row notes from the RC review owner
- only after that can the corresponding RC docs mirror the omission

## Scope

In scope:

- file-granular review of legacy `slate-react` browser/input behavior-bearing
  files
- file-granular review of the current `slate-v2` equivalents or replacements
- missing deleted-test recovery for browser/input/IME/mobile behavior
- specialist proof-lane recovery where current proof is absent
- RC docs update based on proved coverage

Out of scope:

- generic architecture cleanup unrelated to browser/input behavior
- internal legacy helper recovery where no user-visible behavior depends on it
- broad perf work unless it blocks the weird-input/browser review itself

## ADR

### Decision

Run a behavior-ledger-first legacy-vs-v2 browser/input review and treat missing
behavior-bearing proof rows as immediate RC recovery work.

### Drivers

- strict zero-regression claim
- missing-proof-blocks rule
- only engine-specific internals may be omitted

### Alternatives Considered

- narrow claim to proved Chromium-only surface
- review only and defer recovery

### Why Chosen

It is the only option that matches the clarified spec without quietly lowering
the release standard.

### Consequences

- the outcome may be “RC claim still too broad”
- or it may require targeted recovery lanes before that claim is honest
- but the final verdict will actually mean something

### Follow-ups

- if the ledger finds only minor missing rows, recover them in the same RC lane
- if it finds broad unproved mobile/browser classes, narrow the claim or accept
  a deeper parity project after explicit user confirmation

## Plan

### Phase 0: Reopen + Seed The Behavior Ledger

Deliver:

- reopen the live browser/input RC lane in the canonical docs
- expand
  [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
  into a dual-axis behavior ledger with these fields:
  - `[x]` / `[ ]` reviewed state
  - legacy file
  - behavior hypothesis
  - current owner/equivalent
  - proof lane
  - browser scope
  - expected outcome
  - actual outcome
  - artifact links
  - owner
  - status
- start with all missing browser/input tests in the git diff
- use legacy files to seed behavior rows, not as the verdict artifact by
  themselves

Acceptance:

- every behavior-bearing legacy file maps to one or more behavior rows
- every row still carries explicit `[x]` / `[ ]` reviewed tracking
- every row has proof-ledger style fields
- each omission has an explicit justification owner, not a shrug

Bootstrap seed is deterministic:

1. start from the existing browser/input rows and explicit better-cuts already
   named in
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
2. add current missing browser/input tests from the `slate-v2` checkout under:
   - `packages/slate-react/test/**`
   - `packages/slate-dom/test/**`
   - `packages/slate-browser/**`
   - `playwright/integration/examples/**`
3. add paired legacy files from `/Users/zbeyens/git/slate` for the same
   behavior families

Pinned `slate-v2` diff command:

```sh
git -C /Users/zbeyens/git/slate-v2 diff --name-status --diff-filter=ACDMRTUXB origin/main...HEAD -- \
  packages/slate-react \
  packages/slate-dom \
  packages/slate-browser \
  playwright/integration/examples \
  site/examples/ts
```

Do not let executors invent a different diff base.

### Phase 1: Paired Legacy / Current Scenario Rows

Seed these rows immediately:

- placeholder IME
- no-FEFF placeholder IME
- inline-edge IME
- void-edge IME
- blur/focus selection recovery
- transient DOM-point gap / mutation-repair / focus-restore fail-closed behavior
- zero-width selection normalization
- post-composition undo/redo
- Android composition / diff / flush
- iOS Safari / WebKit composition / focus
- Firefox composition / selection recovery

For each row:

- identify the behavior-bearing legacy file(s) that motivated the row
- identify the current owner:
  - mounted `Editable`
  - `ReactEditor`
  - `DOMBridge`
  - `slate-browser` proof lane
  - missing

Acceptance:

- the first artifact is already paired legacy/current behavior rows
- current and legacy are compared up front, not only at the end

### Phase 2: File Archaeology As Threat Model

Priority current files:

- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/src/plugin/react-editor.ts`
- `packages/slate-dom/src/bridge.ts`
- `packages/slate-browser/src/playwright/ime.ts`
- zero-width / selection helper surfaces under `slate-browser`

For each row:

- classify the file as:
  - behavior-bearing
  - internal hypothesis generator
  - justified omission candidate
- use the result to refine the behavior ledger, not replace it

Acceptance:

- each reviewed file either feeds a behavior row or is explicitly classified as
  non-behavioral

### Phase 3: Proof Recovery

Recover missing proof in this order:

1. deleted browser/input tests missing in the git diff
2. paired legacy/current scenario rows for currently existing browser proof
3. undo/redo immediately after composition on placeholder / inline-edge /
   void-edge paths
4. real Android proof, not only the hub smoke test
5. Firefox/browser-specific focus/selection/composition recovery
6. iOS Safari / WebKit composition and focus behavior

### Platform Evidence Ladder

Before closing a platform/browser row, classify the evidence as:

1. `automated-direct`
   - real lane for that browser/platform
2. `automated-proxy`
   - desktop/browser automation approximates the behavior, but not the target
   platform itself
3. `manual-device-blocking`
   - must gather device/browser artifacts before the row may close

Hard rule:

- Android / iOS Safari / Firefox rows do not close on Chromium-only proof
  unless the row is reclassified as non-behavioral
- a row may be reclassified as non-behavioral only if the ledger records:
  - the exact legacy file(s)
  - the exact user-visible behavior hypothesis
  - why the behavior is actually engine-internal and not user-visible
  - the current owner who absorbs that responsibility
  - explicit reviewer sign-off in the row notes

Acceptance:

- every behavior-bearing row is either directly proved, explicitly still
  blocking, or explicitly justified as engine-internal and omittable

### Phase 4: RC Verdict Rewrite

Update:

- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`

Acceptance:

- RC wording matches actual proof width
- no “zero regression” language survives without the corresponding file-granular
  proof

## Verification

Minimum verification path:

- `cwd=/Users/zbeyens/git/slate-v2 pnpm --filter slate-react test`
- `cwd=/Users/zbeyens/git/slate-v2 pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate-react/test/**/*.tsx`
  or the focused equivalent used by the recovered row
- `cwd=/Users/zbeyens/git/slate-v2 pnpm test:slate-browser:ime:local`
- any newly added specialist browser lane
- representative legacy-vs-v2 browser proof for each recovered row

Manual-device-blocking artifact root:

- `/Users/zbeyens/git/plate-2/.omx/artifacts/ime-mobile-browser/`

Each manual-device row must link:

- screen recording or screenshot set
- action transcript
- expected vs actual behavior
- browser/device identifier
- final row status

Evidence required for browser rows:

- action transcript
- DOM dump
- selection dump
- screenshot
- exact expected vs actual behavior
- evidence class from the platform evidence ladder

## Available Agent Types

- `planner`
- `architect`
- `critic`
- `explore`
- `researcher`
- `code-reviewer`
- `executor`
- `test-engineer`
- `verifier`
- `vision`

## Staffing Guidance

### For `$ralph`

- primary owner: one main execution lane on the ledger
- recommended reasoning:
  - file review and parity classification: `high`
  - recovery implementation: `high`
  - browser proof interpretation: `high`

Suggested order:

1. finish the full file ledger
2. recover missing proof rows in priority order
3. only then rewrite RC wording

### For `$team`

- lane 1: legacy file archaeology + classification
- lane 2: current `slate-react` / `slate-dom` parity mapping
- lane 3: specialist browser proof recovery
- lane 4: docs / verdict rewrite after evidence lands

Recommended reasoning:

- archaeology/classification lanes: `medium`
- browser/input recovery lanes: `high`
- verdict/docs lane: `medium`

Launch hint:

```sh
$team /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-ime-mobile-browser-zero-regression-rc.md
```

## Team Verification Path

1. merge lane findings into the single file ledger
2. mark every row as:
   - proved
   - blocking
   - justified omission
3. run focused browser proof on every newly recovered row
4. update RC docs only after the ledger stops having unexplained gaps

## Recommendation

Recommended next execution mode: `$ralph`

Reason:

- the work is sequential and evidence-sensitive
- the ledger needs one owner
- each missing proof row can still turn into targeted implementation, and that
  flow benefits from one persistent owner more than from broad parallelism at
  the start
