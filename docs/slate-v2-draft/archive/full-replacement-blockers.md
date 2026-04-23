---
date: 2026-04-08
topic: slate-v2-full-replacement-blockers
---

# Slate v2 True Slate RC Blockers

> Historical/supporting blocker note. The live verdict and blocker read now
> lives in [../release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md).

## Purpose

This doc answers one question:

- what still blocks the broader replacement claim?

Live verdict still names that claim `Target B`.
The roadmap now calls the same destination **True Slate RC**.

Use it with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [oracle-harvest-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md)

## Current Read

- completed `POC RC`
- live verdict:
  - `Target A`: `Reopened under challenge`
  - `Target B`: `Reopened under challenge`
- earned destination:
  - current `True Slate RC` perf package is green enough, but the broader
    browser/input parity lane is still open
- perf blocker class is no longer open on current blocker-facing lanes
- local Firefox/browser parity is exhausted
- local Android structural/browser parity is exhausted
- the remaining unresolved slice is external Android keyboard-feature behavior
  plus broader iOS Safari composition/focus
- target impact is now concrete in
  [perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)

## Hard Blockers

Current read:

- browser/input zero-regression parity is still unresolved for the stronger RC
  claim
- no current perf blocker remains under the curated gate package
- local file-family/browser rows no longer block by themselves:
  - Firefox local weirdness rows are closed
  - reopened browser/input file-family rows are checked
  - deleted `restore-dom` and `android-input-manager/**` families do not close
    shared surface drift by themselves; they stay open unless current same-path
    parity or explicit engine-rewrite exceptions are recorded
- remaining blocker rows are:
  - external Android keyboard-feature evidence:
    - autocorrect
    - glide typing
    - voice input
  - broader iOS Safari composition/focus evidence
- external collaboration adapters remain external by design
### Cleared Former Blockers

- contract-width recovery lanes are closed
- proof depth is now broadened with same-turn runtime/browser/package evidence
- stable package surfaces, secondary surfaces, and explicit non-claims are now
  aligned across the live docs

Current collaboration read:

- external collaboration adapters remain external
- the local history/operation substrate now has a dedicated integrity owner

## Perf Gate Constraint

Perf no longer stays only as a lane-by-lane wording caveat.

Current read:

- blocker classes are concrete in
  [perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
- final perf read is:
  - the curated blocker-facing lanes currently clear
  - but perf alone does not close the broader browser/input parity blocker
- low-value demos, microbench noise, and slower-but-still-fast cases are
  explicit non-blockers

## Promotion Rule

Historical read:

1. the roadmap’s `True Slate RC` tranches are green
2. the broader contract is recovered or explicitly better-cut
3. proof depth is broad enough to support the broader claim
4. file/test/deletion review is closed
5. live verdict docs and repo-local envelope docs agree

Current perf-gate read:

- promotion is currently green under the curated perf gate package only
- remaining follow-up perf work does not currently rise to blocker truth

## Current Hard Read

- this doc is no longer allowed to say `Go` while the live verdict doc says
  reopened
- perf is green enough
- the broader replacement claim is still blocked by the unresolved external
  browser/input rows
- the next honest move is:
  - execute the external Android keyboard-feature evidence plan
  - execute the broader iOS Safari evidence plan
  - then reconcile the verdict once those rows are proved, downgraded, or kept
    explicitly tooling-blocked
