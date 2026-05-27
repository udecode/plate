---
date: 2026-04-12
topic: slate-v2-doc-stack-consolidation
status: completed
---

# Slate v2 Doc Stack Consolidation

## Goal

Tighten the live `docs/slate-v2` stack so active queue docs stop mixing with
legacy/reference material.

## Findings

- The zero-regression diff seed in
  [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
  is `EMPTY`, so there are no hidden unreviewed browser/input files left in the
  current `origin/main...HEAD` diff scope.
- Every row in the behavior/parity ledger is reviewed.
- The remaining open parity work is external/tooling-limited:
  - Android keyboard features
  - broader iOS Safari composition/focus
- `slate-batch-engine.md` and `chunking-review.md` are useful history, not live
  queue owners.

## Cleanup

- demoted batch-engine and chunking docs to explicit historical/reference status
- merged the live normalization read into
  [normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md)
- archived:
  - `api-drift-perf-register.md`
  - `api-drift-perf-scoreboard.md`
  - `api-surface-keep-cut-register.md`
  - `normalization-baseline-matrix.md`
  - `normalization-phase-boundary-note.md`
  - `normalization-reopen-verdict.md`
- patched live and historical references so the moved docs still resolve
- made the front-door docs point at the live parity, verdict, and normalization
  owners instead of implying batch-engine/chunking are still active candidates
- moved legacy/reference docs out of the live root:
  - `architecture-contract.md` -> `reference/`
  - `live-shape-register.md` -> `reference/`
  - `normalization-reference.md` -> `reference/`
  - `chunking-review.md` -> `archive/`
  - `slate-batch-engine.md` -> `archive/`
  - `oracle-harvest-ledger.md` -> `archive/`
  - `full-replacement-blockers.md` -> `archive/`
  - `perf-gate-package.md` -> `archive/`
- merged blocker ownership into
  [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- merged perf-gate ownership into
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- live `docs/slate-v2/*.md` root is now down to `9` owner docs
