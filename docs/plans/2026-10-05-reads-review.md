---
review_scopes: [reads]
---

# Reads: next move

Status: proposed: waiting on review
Playbook: api-review

`node tooling/scripts/review-ledger.mjs next` returns the `reads` unit, queue position 2, open as `pursue-not-adopted`. Its head verdict, the 2026-10-04 audit, is a Pursue to delete the public `editor.subscribe` and the root `SnapshotListener` export and keep `editor.subscribeCommit` as the one public subscription. No plan or execution names that Pursue. The ledger marks the verdict stale, but the six changed source files carry history-result and update-view edits, and none of their changed lines mentions `subscribe`, `SnapshotListener` or `notifyListeners`. The vision files still teach commit listeners. So the verdict's question is unchanged, and the scope needs a plan.

## Brief

### What did you find?

`next` returns reads. Its 2026-10-04 Pursue, which deletes public `editor.subscribe` and keeps `subscribeCommit`, has no plan or build. The ledger says stale, but no changed line since touches subscriptions.

### What will change?

Nothing yet; this page picks the move. The recommended move plans the cut: `subscribeCommit` becomes the only public subscription, the Plite provider moves to a private late phase, and two docs pages drop `subscribe`.

### What do you need from me?

Pick the next move for reads: plan the subscription cut (recommended), review another scope, or hold.

### What happens if I say go?

Go picks the plan. I run the Plan playbook on this file: `architect` picks the target, then a panel reviews the plan, per the `api-plan` row. Then I ask Build now, Panel first or Hold. No code changes first.

### What could go wrong?

The risk is notification order. The Plite provider's `editor.subscribe` runs after every commit listener, and moving it could reorder selector publication against Plate stores, history or Yjs listeners. The audit read source only, so that safety is unproven.

## Open questions

### Next move for reads

What should happen next for the reads unit?

Why it needs you: The ledger leaves the pick to the owner. Planning commits an `architect` run and a panel to one scope, and another unit may matter more to you.

- `editor.subscribe` and `editor.subscribeCommit` are both public on `BaseEditor` (`packages/plitejs/src/interfaces/editor.ts:1858`). `notifyListeners` hands both the same commit and snapshot, commit listeners first.
- The production `editor.subscribe` callers are the Plite provider (`packages/plitejs/src/react/components/plite.tsx:721`) and the editor view runtime, which forwards its own `subscribe` to the base runtime (`packages/plitejs/src/editor-runtime-view.ts:1188`). `subscribeCommit` has 19 production call sites outside tests.
- `content/docs/(guides)/debugging.mdx` tells readers to use `editor.subscribe` when they need the snapshot, but `subscribeCommit` listeners already receive it as their second argument.
- The ledger has 36 Pursue scopes not adopted, 30 closed, 1 deferred and none unreviewed.

- **Plan the subscription cut** (recommended): I write the plan on this page, run `architect` and a panel on it, then ask Build now, Panel first or Hold. Cost: An `architect` run and a panel before any code, for a small public cut.
- **Review another scope**: Name a scope and I run its review instead; reads stays open. Cost: The duplicate subscription keeps teaching two ways to do one job.
- **Hold**: I stop here and reads stays first in the queue. Cost: The next `next` returns the same unit.

Why I pick it: The verdict is a day old, its question is unchanged, and the playbook's move for an unadopted Pursue is a plan.

If you say go: I continue into the Plan playbook on this file for the reads subscription cut.

## Evidence

Prior work, from `node tooling/scripts/review-ledger.mjs lookup reads --detail` and a search of `docs/plans` and `docs/research/decisions` for the scope:

- 2026-09-11 review, Pursue: commit-owned invalidation membership and demand-sensitive consumers. It landed in `packages/plitejs/src/core/commit.ts` and `packages/plitejs/src/react/hooks/use-editor-selector.tsx`. Its plan, `docs/plans/2026-09-11-demand-driven-commit-invalidation.md`, still fails the unchanged 373.4 ms www burst budget at 405.7 to 455.1 ms, and its whole-checkout gates are open.
- 2026-09-16 review, Pursue: copy-on-branch snapshot-index provenance. It landed as `advancePathStableSnapshotIndex` with a fork regression test.
- 2026-09-18 execution record, recovered from the completed 2026-08-18 read-view caching plan. Its proof is historical and unbound.
- 2026-10-04 audit, Pursue, the current head. It supersedes both earlier reviews and targets the duplicate public subscription. It read source only and ran no tests, benchmarks or browsers.
- `docs/research/decisions/reads-demand-driven-invalidation.md` is the active decision page. No candidate records exist.

The ledger lists six changed source files and three moved law files since the head. The diff from `fe0e9599a6` to `HEAD` across `public-state.ts`, `facade.ts`, `interfaces/editor.ts`, `read-registry.ts` and `editor-runtime-view.ts` changes no line that mentions `subscribe`, `SnapshotListener` or `notifyListeners`; `interfaces/editor.ts` adds the history result types. The sixth file, `tooling/config/bunTestSetup.ts`, only sets `_FUMADOCS_MDX` for tests. `VISION.md` still lists commit listeners in the public API it teaches.

Ledger counts from `node tooling/scripts/review-ledger.mjs status` on 2026-10-05: 67 scopes, 0 unreviewed, 0 fork, 0 pursue-unbound, 36 pursue-not-adopted, 1 deferred (search), 30 closed and 1 unowned coverage entry.

The plan search matched on the scope id, `editor.subscribe`, `SnapshotListener` and `subscribeCommit`, and found no plan after the audit that builds the cut. It misses plans that name the work under another word.
