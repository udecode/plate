---
date: 2026-04-13
topic: slate-v2-full-no-regression-story-plan
status: active
---

# Slate v2 Full No-Regression Story Plan

## Purpose

Define the full remaining work required to make the “no regression vs legacy
Slate” story honest.

This remains a supporting scope map, not the live batch order owner.

Current batch order is owned by
[2026-04-18-slate-v2-lossless-remaining-work-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-lossless-remaining-work-replan.md),
which puts claim-width audit and residue classification ahead of any broad
rewrite-first package work.

This is broader than the browser/input external-evidence tranche alone.

It includes:

- exact 1:1 legacy test/file accounting
- exhaustive API/public-surface contract-width audit
- maximum parity with legacy for all examples
- browser/input parity proof completion
- control-ledger and verdict reconciliation

## Problem Frame

Current state is stronger than before, but still not good enough to claim full
no-regression truth.

What is already real:

- live owner docs are much cleaner
- browser/input proof ownership is centralized in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- legacy file closure control is centralized in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- exact 1:1 ledgers now exist under
  [docs/slate-v2/ledgers/](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/README.md)

What is still false if stated too strongly:

- that the API/public-surface story is fully closed
- that example parity is fully closed for all legacy examples
- that the browser/input parity story is fully closed
- that the verdict stack is fully reconciled around the now-closed exact ledgers

## Source Of Truth

Primary owners:

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Supporting exact ledgers:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [legacy-slate-react-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-react-test-files.md)
- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-history-test-files.md)
- [legacy-playwright-example-tests.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-playwright-example-tests.md)

Gap audit:

- [2026-04-13-slate-v2-ledger-gap-audit.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-ledger-gap-audit.md)

Browser/input execution plan:

- [2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md)

Example parity execution plan:

- [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)

## Current Snapshot

Exact-ledger state:

- `packages/slate/test/**`
  - total legacy files: `1069`
  - zero `needs-triage`
- `packages/slate-react/test/**`
  - total legacy files: `8`
  - exact rows exist for all `8`
  - no `needs-triage`
- `packages/slate-history/test/**`
  - total legacy files: `20`
  - zero `needs-triage`
- `playwright/integration/examples/**`
  - total legacy files: `23`
  - `21` same-path current files
  - `1` recovered
  - `1` explicit skip
  - no `needs-triage`

Local exact-ledger closure work that is now banked:

- `packages/slate/test/transaction-contract.ts` recovers the live replacement
  surface for legacy batch rows that still matter
- `packages/slate/test/normalization-contract.ts` now carries the missing
  `invalid-insert_node` oracle row
- `packages/slate/src/core/draft-helpers.ts` now rejects out-of-range
  `insert_node` indexes instead of silently appending
- `packages/slate/src/create-editor.ts` now routes `getChildren()` through the
  live current tree so direct replacement followed by later transaction writes
  stays observable

Browser/input state:

- local Firefox/browser parity is exhausted
- local Android structural/browser parity is exhausted
- remaining open browser/input rows are:
  - external Android keyboard-feature evidence:
    - autocorrect
    - glide typing
    - voice input
  - broader iOS Safari / WebKit composition/focus

API/public-surface state:

- exact ledgers are now good at file inventory, but that is not enough
- some `mapped-mirrored` API families were classified from helper presence plus
  broad proof ownership instead of exact accepted-argument / option-bag parity
- the first exposed miss family, legacy `Editor.before(...)` /
  `Editor.after(...)` `voids: true` rows and `nonSelectable` traversal rows,
  is now recovered in code and proof
- the exact editor API matrix now exists at
  [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- the supporting transforms/interfaces/react/history audit matrices also now
  exist under
  [docs/slate-v2/ledgers/](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/README.md)
- direct legacy oracle proof is now tightened for `before`, `after`, `next`,
  `previous`, `levels`, `unhangRange`, and `positions` in
  [query-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/query-contract.ts)
- direct 1:1 legacy fixture proof now closes `Editor.nodes/**` in
  [legacy-editor-nodes-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts)
- direct 1:1 legacy fixture proof now closes the non-Editor `interfaces/**`
  namespaces in
  [legacy-interfaces-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts)
- the direct transform audit is now green in
  [legacy-transforms-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-transforms-fixtures.ts),
  so the old blanket transform reopen is gone
- the transform matrix still is not fully green because it keeps
  `explicit-skip` rows
- until the exhaustive API contract-width audit lands, the broad public-surface
  lane is reopened under challenge

Example state:

- deleted-example ledgers are useful, but they are not example parity proof
- same-path current example files and same-path browser tests are not enough to
  close the example lane
- maximum parity with legacy for all examples is now explicitly reopened
- legacy examples may be added or extended when that creates a better
  comparison for rewrite-only unlocks

## Scope

In scope:

- eliminate all `needs-triage` rows from the exact ledgers
- make every legacy test file land in one of:
  - `mapped-mirrored`
  - `mapped-recovered`
  - `mapped-mixed`
  - `same-path-current`
  - `explicit-skip`
- audit every kept API/public-surface row against:
  - legacy docs or legacy tests
  - current docs
  - current source
  - current proof owner
- reopen any supposedly mirrored API row whose accepted arguments, option bag,
  return shape, or behavior width is narrower than legacy
- classify every legacy example that still matters to the blanket claim as:
  - mirrored
  - recovered
  - extended
  - mixed
  - explicit cut
  - open
- allow legacy example additions/extensions when that creates a better
  comparison for rewrite-only unlocks
- complete or explicitly bound the remaining browser/input proof debt
- reconcile the verdict docs once the exact-ledger and browser/input stories are
  both honest

Out of scope:

- broad new architecture work
- perf chasing beyond the already-owned blocker lanes
- reviving dead legacy internals just to make counts look pretty

## Non-Negotiable Rules

1. Exact ledgers are mandatory.
   No more hiding thousands of files behind one family row and calling it done.
2. Exact relative path keys only.
   Basename-level matching is not enough.
3. `explicit-skip` is allowed only with a concrete rationale.
4. Browser/input proof rows stay scenario-based in the proof ledger.
   Do not try to collapse them into file-closure prose.
5. No `needs-triage` rows may remain before the no-regression story is called
   complete.
6. Exact ledgers are 1:1 archaeology, not a demand for one current source file
   per legacy file.
7. Current proof belongs in the smallest behavior-domain owner file that
   honestly carries the live contract.
8. API/public-surface closure is not earned by name-only helper recovery.
   Accepted arguments, option bags, return shapes, and behavior width all count.
9. A `mapped-mirrored` API row is false if the current helper exists but the
   legacy contract was wider.
10. `mapped-mixed` means one legacy file splits into mirrored, recovered,
    and/or explicit-skip subclaims. It is not limited to mirrored plus
    recovered only.
11. Example deletion closure is not example parity closure.
12. Same-path current example files and same-path browser tests are not enough
    to call the example lane closed.
13. Legacy examples may be extended when the rewrite unlocked a fairer
    comparison, but those rows must be labeled explicitly.

## Workstreams

### Workstream 1: Exact Legacy Test Ledgers

Goal:

- finish the 1:1 file-accounting story

Files:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-history-test-files.md)

Current state:

- complete locally
- zero `needs-triage`
- recovered rows now land in current proof owners instead of family prose
- retired matrix/perf harness rows are explicit skip instead of fake “open”

Exit:

- exact ledger rows exist for every legacy test file
- zero `needs-triage`

### Workstream 2: Exhaustive API / Public-Surface Contract Audit

Goal:

- detect every remaining legacy-vs-current API regression before another broad
  closure claim

Owners:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)

Scope:

- static helpers
- instance helpers
- exported utility namespaces
- documented option bags
- “mirrored” legacy API rows in the exact ledgers

Required checks per API row:

1. legacy docs
2. legacy tests
3. current docs
4. current source signature
5. current proof owner
6. final classification:
   - mirrored
   - recovered but narrower
   - explicit cut
   - still open

Exit:

- every kept API row is audited for contract width, not just helper presence
- no `mapped-mirrored` API row hides a narrower option bag or accepted
  arguments
- every surviving cut is explicit in live docs, ledgers, and maintainer context

### Workstream 3: Example Parity Recovery

Goal:

- make the example story honest for the broader no-regression claim

Owners:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)

Exit:

- every legacy example row is classified as mirrored, recovered, extended,
  mixed, explicit cut, or open
- same-path current example files are no longer treated as implicit closure
- legacy example extensions are explicit and justified

### Workstream 4: Browser/Input Parity Completion

Goal:

- finish the remaining behavior-bearing proof debt

Owners:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [2026-04-12-android-keyboard-feature-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-android-keyboard-feature-external-evidence-plan.md)
- [2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md)

Exit:

- remaining Android keyboard-feature rows are proved or explicitly downgraded
- broader iOS Safari rows are proved or explicitly downgraded

### Workstream 5: Claim Reconciliation

Goal:

- make the control stack and exact ledgers say the same thing

Files:

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Exit:

- the control ledger no longer overclaims exhaustiveness
- the public-surface lane no longer overclaims closure
- the exact ledgers have zero `needs-triage`
- the verdict is based on exact rows plus proof rows, not family-level vibes

## Sequence

1. Finish the exhaustive API/public-surface contract-width audit.
2. Finish the example parity recovery lane.
3. Finish external Android keyboard-feature evidence.
4. Finish broader iOS Safari evidence.
5. Reconcile the verdict stack around the audited API rows, example-parity
   rows, and the browser/input proof rows.

## Acceptance Criteria

- every legacy file in:
  - `packages/slate/test/**`
  - `packages/slate-react/test/**`
  - `packages/slate-history/test/**`
  - `playwright/integration/examples/**`
  has an exact ledger row
- zero exact-ledger rows remain `needs-triage`
- every kept API/public-surface row is audited for:
  - accepted arguments
  - option bag
  - return shape
  - behavior width
- every legacy example that still matters to the blanket claim is classified
  and owned
- no API row is still called mirrored by name-only helper presence
- zero browser/input rows remain “open because we didn’t classify them”
- every skip is explicit and justified
- live verdict docs agree with exact ledgers and proof ledgers

## Hard Read

Right now the repo has:

- a good control ledger
- a decent proof ledger
- and a locally closed exact no-regression ledger story

The remaining work is no longer local file accounting.
That part is banked.

The remaining work is now four different problems:

1. exact legacy-file accounting debt
2. exhaustive API/public-surface contract-width debt
3. maximum example parity debt
4. real browser/input proof debt

If you mash those together, you get another giant vague ledger and learn
nothing.
