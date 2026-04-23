---
date: 2026-04-08
topic: slate-v2-release-readiness-decision
---

# Slate v2 Release-Readiness Decision

## Purpose

Canonical live verdict for `/Users/zbeyens/git/slate-v2`.

It answers:

- what is honest to recommend now?
- what is still not honest to claim?

Use it with:

- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [replacement-candidate.md](/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md)
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)

## Decision

### Live Verdict Terms

- `Target A`
  - release-grade confidence for the proved default surface:
    - `Slate`
    - `EditableBlocks`
    - `withHistory(createEditor())`
- `Target B`
  - honest blanket replacement for legacy Slate as a whole

### Roadmap Mapping

- completed `POC RC`
  - roadmap name for the work that now supports `Target A`
- `True Slate RC`
  - roadmap name for the broader destination that the live verdict still calls
    `Target B`

### Verdict

- `Target A`: **Go**
- `Target B`: **Reopened under challenge**

## Post-RC Browser / Input Follow-up Lane

As of 2026-04-15, browser/input parity is deferred to post-RC follow-up.

Reason:

- legacy Slate React previously relied on behavior-bearing weird-input patches
  in Android input-manager, restore-dom, focus/selection recovery, and
  browser-specific composition handling
- current `slate-v2` has real Chromium proof on several IME rows, but that is
  still not enough to honestly support the broader zero-regression claim
- the remaining unresolved slice is already mostly external evidence:
  Android keyboard features plus broader iOS Safari composition/focus
- that follow-up work is no longer treated as a blocker for the current RC
  recommendation surface
- the approved proof authority for this lane is now
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md),
  with
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  owning the legacy-file closure read
- execution order for the post-RC follow-up lane now lives in
  [2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md)

Hard rule:

- do not claim full zero-regression versus legacy Slate React on every
  relied-on IME/mobile/browser weird-input surface until the behavior/parity
  ledger closes or the broader claim is explicitly narrowed

Current narrow follow-up read:

- local Firefox/browser parity is exhausted
- local Android structural/browser parity is exhausted
- the remaining unresolved slice is external Android keyboard-feature behavior
  plus broader iOS Safari composition/focus
- current execution plans for those rows:
  - [2026-04-12-android-keyboard-feature-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-android-keyboard-feature-external-evidence-plan.md)
  - [2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-ios-safari-broader-composition-focus-external-evidence-plan.md)

## Broader Replacement Claim Blockers

Current broader blocker read:

- exhaustive API / public-surface contract-width audit is now unresolved for
  the stronger replacement claim
- direct legacy fixture proof now closes `Editor.nodes/**` and the
  non-Editor `interfaces/**` namespaces more honestly than the earlier family
  buckets did
- the direct transform audit is green again, so the transform lane is no
  longer a blanket reopened family
- the transform matrix still has real non-green rows:
  - `explicit-skip` rows
- browser/input zero-regression parity is deferred to post-RC follow-up for the
  broader blanket replacement claim
- overlay architecture is no longer the blocker:
  the repo now has a final first-class design for decoration sources,
  `Bookmark`-backed durable anchors, annotation stores, and widget lanes
- example parity is now explicitly reopened:
  same-path current example files and same-path browser tests are not enough to
  close the broader legacy parity story
- no current perf blocker remains under the curated package
- local file-family/browser rows no longer block by themselves:
  - Firefox local weirdness rows are closed
  - reopened browser/input file-family rows stay open until same-path parity or
    explicit engine-rewrite exceptions are recorded under
    [repair-drift.mdc](/Users/zbeyens/git/plate-2/.agents/rules/repair-drift.mdc)
  - deleted `restore-dom` and `android-input-manager/**` families do not count
    as closed just because specialist browser lanes are green; the surviving
    shared surface still has to prove the relied-on behavior
- remaining blocker rows are:
  - exhaustive API / public-surface audit:
    - transform `explicit-skip` rows
  - example parity:
    - legacy/current example matrix across all examples
    - explicit mirrored vs extended classification
- external collaboration adapters remain external by design

Post-RC follow-up rows:

- external Android keyboard-feature evidence:
  - autocorrect
  - glide typing
  - voice input
- broader iOS Safari composition/focus evidence

## What Is Safe To Recommend Now

Default recommendation:

- `Slate`
- `EditableBlocks`
- `withHistory(createEditor())`

That surface is still the completed `POC RC` surface for the already-proved
runtime/perf stack.

What is not honest to say right now:

- that the repo has already closed full legacy API/public-surface parity
- that the RC has already proved zero regression versus legacy Slate React on
  every relied-on IME/mobile/browser weird-input surface
- that the repo has already reached maximum parity with legacy for all examples
- that browser/input parity and the exhaustive API/public-surface audit are
  actually closed under the `repair-drift.mdc` rule, not just softened into
  specialist-proof follow-up
- declaration-merging `CustomTypes` is no longer a hard-cut non-claim on the
  current type surface; the package seam has been recovered and stale skip docs
  need refresh

What changed:

- the functionality/proof stack is still real
- but the curated perf gate package is now active
- the mainstream richtext perf lane is now green again on the current
  blocker-facing benchmark surface
- placeholder and huge-document blocker lanes are also green enough under the
  current curated package
- the default `withHistory(createEditor())` surface is still covered on the
  headless lane, but headless/history substrate proof does not close shared
  browser hotkey/input integration in `Editable`
- core normalization benches remain ugly, but stay diagnostic until mapped into
  user-facing blocker lanes

See:

- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

## Why The Earlier `Go` Verdict Was Reopened

The curated perf blocker package still owns part of the live truth.
It is no longer the whole truth.

Browser/input parity no longer blocks the current RC gate.
It still limits the broader blanket replacement claim.

Current blocker-facing read:

1. mounted-runtime placeholder baseline is faster than legacy
2. huge-document user flows are green enough on the measured gate lane
3. mainstream richtext formatting latency is now faster than legacy on the
   current blocker rerun
4. `slate-history` undo / redo on the default recommendation surface is now
   measured directly; it stays slower than legacy, but the fresh same-turn
   `5000`-block compare still lands in a tolerable band:
   typing undo `20.27ms`, typing redo `17.7ms`, fragment undo `31.77ms`,
   fragment redo `29.11ms`, so it does not justify reopening RC
5. there is no honest browser huge-document history compare row to keep:
   legacy Slate never exposed a history-backed huge-document surface there, so
   the headless history compare lane remains the sole owner
6. core normalization benches are still substantially slower than legacy, but
   stay diagnostic until mapped into user-facing blocker lanes

Current deletion-review read:

- major file/test deletion review is now explicitly closed
- it no longer blocks `Target B` by itself

Current extension-model read:

- extension model / behavior interception is now explicitly closed
- it no longer blocks `Target B` by itself

Current normalization read:

- schema / normalization extensibility is now explicitly closed on the current
  default-vs-explicit model
- safe live invariants are real by default
- heavier canonicalization lives on explicit/load/import/app-owned boundaries
- broader always-on live coercion remains explicitly outside the default claim
  unless a future design survives the full proof stack

Current headless read:

- non-React / headless core usability is now explicitly closed on the current
  package-split model
- direct composition across `slate`, `slate-history`, and `slate-hyperscript`
  is directly proved without React
- the docs now show a real headless entry path instead of implying React is the
  only serious starting point

Current collaboration read:

- operation-history-collaboration integrity is now explicitly closed on the
  local substrate
- operation and history records are proved as collaboration-safe inputs
- external `slate-yjs` still owns CRDT/provider/cursor integration

Current public-surface read:

- the package-level matrix across stable surfaces, secondary surfaces, and
  explicit non-claims is still useful
- but broad API / public surface reconciliation is reopened under challenge
  until exhaustive per-API contract-width audit closes
- the first exposed miss family, legacy `Editor.before(...)` /
  `Editor.after(...)` `voids: true` rows and `nonSelectable` traversal rows,
  is now recovered in code and proof
- docs, ledgers, and proof rows must now be re-audited for accepted-argument,
  option-bag, and behavior-width parity instead of name-only helper presence

The old lane-by-lane-only perf posture is no longer the live read.

The curated perf gate package now still matters to both:

- `Target A`, because mainstream richtext flows belong to the default
  recommendation surface
- `Target B`, because the same lane belongs to the broader replacement claim

## Final Gate

### `Target A`

Verdict:

- **Go**

Gate read:

1. current core oracle proof exists
2. runtime and browser proof exist for the default envelope
3. contributor-facing recovery for the current recommendation is real
4. blocker-facing perf gates now exist
5. current blocker-facing perf lanes clear under the curated package,
   including the explicit history compare lane
6. the remaining browser/input rows are explicit post-RC follow-up, not current
   RC blockers

### `Target B`

Verdict:

- **Reopened under challenge**

Gate read:

1. contract-recovery lanes are closed
2. broader proof depth is now wide enough to support the package-level claim
3. the curated blocker-facing perf package is currently green enough for the
   broader replacement claim
4. browser/input zero-regression parity is deferred to post-RC follow-up and is
   still unresolved for the broader blanket replacement claim
5. exhaustive API / public-surface contract-width audit is reopened and still
   unresolved

## Reclose Rule

`Target B` may return to `Go` only after:

1. the exhaustive API / public-surface contract-width audit closes the reopened
   rows or marks every surviving cut explicitly with owner sign-off
2. the example-parity lane closes or marks every surviving extension/cut
   explicitly with owner sign-off
3. the behavior/parity ledger closes the IME/mobile/browser rows or marks a row
   as justified omission with explicit owner sign-off
4. the RC docs are reconciled back to the behavior/parity, example-parity, and
   API-truth
   authorities
5. the perf blocker package stays green enough on the already-proved lanes

`Target A` stays `Go` unless a blocker reopens inside the proved default
recommendation surface or the current claim is widened back to full
zero-regression browser/input parity.

## Current Read

This file is not the roadmap.

It owns the live verdict only:

- completed `POC RC` still names the default recommendation surface
- the current curated perf gate package still matters
- example parity is now an explicit broader-claim blocker, not a side-effect of
  file-review closure
- browser/input parity is now explicit post-RC follow-up work:
  it does not block the current RC recommendation, but it still blocks the
  broader blanket replacement claim until closed or explicitly narrowed
