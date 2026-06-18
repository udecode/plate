---
date: 2026-05-04
topic: slate-issues-ledger-sync-tracking
status: complete
---

# Slate Issues Ledger Sync Tracking

## Goal

Make `docs/slate-issues/open-issues-ledger.md` track v2 sync progress at the issue and cluster level.

## Scope

- Add a clear sync vocabulary to the open issues ledger.
- Add cluster-level progress rows without moving the source of truth out of the ledger.
- Add per-issue v2 sync columns to every ledger row.
- Keep `docs/slate-v2/ledgers/issue-coverage-matrix.md` as PR-slice claim accounting only.

## Progress

| Step                                  | Status   | Notes                                                                                                           |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| Inspect issue ledger and clusters     | complete | `open-issues-ledger.md` has `682` issue rows and `378` raw primary clusters.                                    |
| Add ledger sync tracking              | complete | Added sync vocabulary, macro theme rollup, raw cluster rollup, and per-issue sync columns.                      |
| Wire references                       | complete | Updated `slate-ralplan.mdc`, the PR reference, and the issue coverage matrix to point back to the corpus owner. |
| Verify row counts and completion hook | complete | `682` issue rows, `9` macro rows, and `378` raw primary cluster rows verified.                                  |

## Verification

| Check                      | Result | Notes                                                                                                         |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `pnpm install`             | pass   | Regenerated `.agents/skills/slate-ralplan/SKILL.md`.                                                          |
| Ledger count script        | pass   | `682` issue rows have sync columns; `9` macro rows and `378` raw cluster rows exist.                          |
| Reference grep             | pass   | Rule, generated skill, PR reference, coverage matrix, and open issues ledger all point at the new sync owner. |
| `bun run completion-check` | pass   | Completion hook reads this pass as done.                                                                      |
| `pnpm lint:fix`            | fail   | Existing benchmark lint debt in `benchmarks/editor/**`; no fixes applied.                                     |

## Full V2 Rewrite Issue Sync Pass

Status: `complete`

The follow-up scan expands the ledger beyond the editor initialization/value
slice. The rule for this pass is intentionally strict:

- exact `fixes-claimed` only when current `Plate repo root` source has a named
  contract, browser test, or benchmark that covers the original issue behavior;
- `improves-claimed` when v2 materially improves the failure class but does not
  prove the original repro end to end;
- `not-claimed` when the scan proves the issue remains outside the current v2
  claim, even if adjacent runtime work exists.

Evidence owners reviewed:

- `packages/slate-react/test/provider-hooks-contract.tsx`
- `packages/slate-dom/test/bridge.ts`
- `packages/browser/test/browser/zero-width.browser.test.ts`
- `benchmarks/slate-v2/donor/core/current/transaction-execution.mjs`
- `benchmarks/slate-v2/donor/browser/react/rerender-breadth.tsx`
- `docs/plans/2026-04-02-slate-dom-v2-bridge-proof-ralph.md`
- `docs/plans/2026-04-03-slate-dom-v2-zero-width-selection-proof-plan.md`
- `docs/plans/2026-04-03-slate-react-v2-projection-proof-plan.md`
- `docs/plans/2026-04-11-slate-v2-rerender-breadth-batch.md`
- `docs/solutions/performance-issues/2026-04-11-slate-react-rerender-breadth-is-mostly-local-and-useSlate-is-the-only-broad-hook-left.md`

Initial decisions:

| Issue                                                | Decision           | Reason                                                                                                                                                         |
| ---------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#5709`                                              | `fixes-claimed`    | Current provider hook contract proves consumers see a replaced provider editor.                                                                                |
| `#6038`                                              | `improves-claimed` | Transaction/applyOperations benchmark exists and checks mixed structural snapshots; no accepted perf threshold row yet.                                        |
| `#3656`                                              | `improves-claimed` | Rerender breadth benchmark proves sibling leaves and parent block stay at `0` rerenders.                                                                       |
| `#4141`                                              | `improves-claimed` | Rerender breadth benchmark proves ancestor chain and sibling branch stay at `0` rerenders.                                                                     |
| `#5131`                                              | `not-claimed`      | `useSlate()`/`useEditor()` remains broad by contract; local selectors are the v2 answer.                                                                       |
| `#5947`, `#5938`, `#4789`                            | `improves-claimed` | DOM bridge/path lookup/outside-boundary proof covers the failure class, but not every exact browser repro.                                                     |
| `#5760`                                              | `improves-claimed` | Zero-width bridge proof normalizes DOM offsets both directions; no raw iOS device closure claim.                                                               |
| `#4483`, `#4477`, `#5987`, `#4392`, `#3382`, `#3352` | `improves-claimed` | Projection/annotation/store proof covers local overlay and cross-node projection pressure; individual product/API requests are not auto-closed.                |
| `#5945`, `#3430`, `#1971`, `#2597`                   | `not-claimed`      | Adjacent paste/zero-width/runtime work exists, but the exact large plaintext paste, many-inline normalization, and sentinel replacement claims are not proven. |

Completed updates:

- Updated `23` per-issue rows in
  `docs/slate-issues/open-issues-ledger.md`.
- Updated `5` macro theme rows and `15` raw primary cluster rows.
- Updated `docs/slate-v2/ledgers/issue-coverage-matrix.md` with one new exact
  fixed issue claim and `22` new related/improved/non-claimed rows.
- Updated `docs/slate-v2/references/pr-description.md` to keep the short PR
  issue-count summary in sync with the matrix.

Verification:

- Ledger sync script confirmed all `23` reviewed issue rows now have non-default
  v2 sync state.
- Matrix/PR count script confirmed `3` exact fixed claims and `27`
  improved/related/not-claimed rows.
- `bun run completion-check` passed against
  `.tmp/completion-checks/slate-issues-full-v2-rewrite-sync.md`.
- `pnpm lint:fix` failed on existing `benchmarks/editor/**` lint debt; Biome
  reported `202` benchmark diagnostics and no fixes were applied to this docs
  pass.
