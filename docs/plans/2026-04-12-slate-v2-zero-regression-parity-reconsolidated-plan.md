---
date: 2026-04-12
topic: slate-v2-zero-regression-parity-reconsolidated-plan
---

# Slate v2 Zero-Regression Parity Reconsolidated Plan

## Purpose

One current plan for the remaining work required to support the strongest honest
Slate React parity claim:

- zero regression on legacy relied-on behavior
- especially browser/input/IME/mobile weirdness
- without letting tooling drift or benchmark drift hijack the queue

This plan supersedes vague “next batch” execution for the reopened browser/input
lane.

## Scope Lock

Primary goal:

- close the remaining behavior-bearing parity rows that legacy Slate React
  relied on

RC gate:

- no regression versus legacy Slate tests
- plus no regression on explicitly relied-on weird-input/browser patches that
  legacy carried in runtime code even when legacy did not have deep automated
  proof

Non-goals:

- chasing perfect iOS automation before all higher-signal local rows close
- widening perf work beyond the curated blocker package
- adding transport abstraction work that does not close a named row

Hard rule:

- every remaining item must be classified first:
  - `product-bug`
  - `missing-proof-row`
  - `tooling-blocked`
  - `justified-omission-candidate`

## Authority

Execution truth:

- [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

Roadmap truth:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)

Verdict truth:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)

Planning inputs that changed the queue:

- [2026-04-12-android-legacy-case-classification.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-android-legacy-case-classification.md)
- [2026-04-12-restore-dom-family-closure-matrix.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-restore-dom-family-closure-matrix.md)
- [2026-04-12-firefox-browser-weirdness-tranche-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-firefox-browser-weirdness-tranche-plan.md)

## Current Snapshot

Already closed at a serious level:

- Chromium IME rows:
  - placeholder
  - no-FEFF placeholder
  - inline-edge
  - void-edge
  - post-composition undo/redo
- Firefox rows:
  - direct composition on the main IME surfaces
  - blur/focus selection recovery
  - zero-width normalization
  - drag/drop cleanup after dragged-node unmount
  - table multi-range preservation during selection sync
  - nested editable focus bounce
- Android direct rows on emulator Chrome:
  - placeholder
  - no-FEFF placeholder
  - inline-edge
  - void-edge
  - split/join
  - empty/delete-rebuild
  - remove-range
  - structural `special` subcases
- desktop WebKit:
  - focus/selection recovery
  - zero-width normalization
  - direct-input ceiling plus proxy composition backstop
- no-FEFF delayed plain typing bug:
  - fixed in runtime
- package/type publishing drift:
  - fixed in build pipeline

Still open:

1. Android keyboard-feature-dependent behavior:
   - autocorrect
   - glide typing
   - voice input
   current direct probe:
   Appium can show keyboard state and switch to `NATIVE_APP`, but exposes zero
   Gboard candidate nodes; hardware keycodes only yield literal `cant ` text
   external plan:
   [2026-04-12-android-keyboard-feature-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-android-keyboard-feature-external-evidence-plan.md)
2. broader iOS Safari composition/focus beyond the currently green rows
   external plan:
   [2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md)
3. final verdict/document reconsolidation after the external/tooling-blocked
   rows are settled or explicitly downgraded

Already closed enough to stop pretending they are future batches:

- the reopened file-family rows in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  are checked
- Firefox local weirdness closure is banked
- `restore-dom` is closed as a non-current lifecycle guard plus current-proof
  coverage split
- the Android legacy manual-case matrix is classified tightly enough that the
  remaining debt is keyboard-feature evidence, not generic local browser chaos

## Ledger-Close Rule

Tranche 7 does not close on “basically done.”

It closes only when the reopened browser/input rows in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
are individually checkmarkable and actually checked.

Hard rules:

1. if one still-open row hides multiple platforms, split it first
2. file-family debt does not stay open just because some platform row is still
   open somewhere else
3. residual debt must live on the narrowest honest row:
   - file family
   - platform parity row
   - or external/tooling-blocked row
4. no batch is complete while stale next-batch wording still points at work
   that is already locally closed

## Remaining Work Map

### Phase 1: Keep The Closed Ledger Closed

Goal:

- preserve the fully checked file-review ledger and stop stale wording from
  reopening generic local debt

Rows:

1. file-review closure state
   current read:
   the reopened browser/input file-family rows are already checked in
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   next action:
   do not reopen generic file-family debt unless a new concrete behavior gap is
   discovered
   exit:
   remaining parity work lives only on named platform or external/tooling rows

2. roadmap wording
   current read:
   some planning surfaces still talk like local Firefox/file-family recovery is
   the next batch
   next action:
   refresh the queue so it starts from the remaining non-local rows
   exit:
   no stale local next-batch wording survives

### Phase 2: Package The Remaining External Evidence Work

Goal:

- convert the remaining claim-width debt into named non-local execution lanes

Rows:

1. Android keyboard-feature behavior
   bucket:
   `tooling-blocked` or `justified-omission-candidate`
   current read:
   local Appium + Chrome on emulator now proves the structural and typing rows
   that mattered inside the old `android-tests` matrix, but does not expose
   Gboard candidates well enough for:
   - autocorrect
   - glide typing
   - voice input
   next action:
   choose one explicit non-local path:
   - real-device capture
   - browser-farm / device-cloud proof
   - alternate transport that exposes candidate UI
   - manual-device artifact lane if transport ceilings remain
   exit:
   each remaining Android keyboard-feature row has an explicit owner and
   evidence path

2. broader iOS Safari composition/focus
   bucket:
   `tooling-blocked`
   current read:
   local Appium/XCUITest is setup-green / behavior-red and the current
   `agent-browser` iOS path is only trustworthy for open plus initial snapshot
   next action:
   choose one explicit non-local path:
   - real-device cloud/browser farm
   - alternate iOS automation substrate
   - manual-device evidence lane if automation still fails
   exit:
   iOS rows become either directly proved or explicitly tagged as external
   tooling debt outside the repo

3. desktop WebKit direct composition depth
   bucket:
   `tooling-blocked` or `justified-omission-candidate`
   current read:
   current honest ceiling is direct input plus proxy composition
   next action:
   only promote this if a real relied-on legacy behavior remains unowned after
   the iOS decision
   exit:
   either direct row exists or proxy/ceiling status is explicitly accepted

### Phase 3: Reconcile Verdict And Proof Truth

Goal:

- make the live docs say the same thing about the checked ledger and the still
  open external/tooling rows

Rows:

1. blocker/verdict docs
   files:
   - [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
   - [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
   - [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
   exit:
   there is one blocker story, not contradictory reopened-vs-`Go` language

2. roadmap/front-door docs
   files:
   - [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
   - [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
   exit:
   the next move points at the external evidence package plus truth pass

3. proof/status docs
   files:
   - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
   - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
   exit:
   remaining rows are clearly tagged as:
   - direct proof
   - tooling-blocked
   - or justified omission

## Required Next Batches

### Batch 1

Target:

- Android external evidence package

Deliver:

- chosen transport/evidence path for:
  - autocorrect
  - glide typing
  - voice input
- exact artifact requirements for calling any of those rows closed

### Batch 2

Target:

- iOS external evidence package

Deliver:

- chosen non-local execution lane for broader iOS Safari composition/focus
- explicit carry-forward of the current setup-green / behavior-red boundary

### Batch 3

Target:

- optional WebKit direct-depth decision

Deliver:

- either:
  - a narrow follow-up for direct WebKit depth
  - or an explicit defer/omission decision behind the iOS result

### Batch 4

Target:

- final doc truth pass

Deliver:

- release-file ledger has no vague grouped `[ ]` debt
- roadmap/verdict docs agree on the blocker story
- stale `Target A` / `Target B` `Go` wording is removed where it contradicts
  the reopened parity lane

## Documentation Work Required On Every Batch Exit

Always refresh:

1. [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
2. [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
3. [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
4. [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
5. [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md) when verdict language changes
6. [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) when proof scope changes
7. [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md) when blocker truth changes

## Re-Interview Trigger

Run the remaining-scope re-interview again if any of these happen:

- a new legacy relied-on browser/input behavior is discovered
- the RC gate is widened beyond legacy test parity plus named relied-on patches
- iOS evidence strategy changes from local automation to external/manual
- a reopened file family splits into more than one independent closure lane

Reference:

- [reinterview-remaining-scope.md](/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reinterview-remaining-scope.md)

## Hard Read

The remaining work is no longer “figure out whether Slate v2 is real.”

That part is done.

The remaining work is:

- stop pretending Firefox is still the next batch when that local tranche is
  already closed
- make the ledger rows individually checkmarkable
- reclose `editable.tsx` and `android-input-manager/**` honestly
- keep Android debt narrowed to keyboard features only
- stop letting iOS tooling limitations blur product truth
- then reconcile the verdict docs so they stop contradicting each other
