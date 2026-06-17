# Slate v2 Architecture Deepening Ledger

This file is the durable review ledger for the architecture-deepening run.
It intentionally omits per-loop transcript noise. The active source, tests, and
plans are the proof; this document records the decisions worth preserving.

## Source Roots Inspected

- `.tmp/slate-v2/packages/slate/src`
- `.tmp/slate-v2/packages/slate-react/src`
- `.tmp/slate-v2/packages/slate-dom/src`
- `.tmp/slate-v2/packages/slate-history/src`
- `.tmp/slate-v2/packages/slate-browser/src`
- `.tmp/slate-v2/packages/slate-browser/test`
- `.tmp/slate-v2/playwright`
- `VISION.md`
- `docs/vision/slate.md`

## Final Take

The original deepening direction was right: several Slate v2 files had grown
into impossible owner piles. Splitting the worst files made behavior and proof
work more navigable.

The run also went too far. Some later packets split paragraph-sized helpers
into files that added import hops without durable ownership. The follow-up
cleanup merged those back where the new file did not earn its keep.

## Keep Decisions

| Area | Decision | Why |
| --- | --- | --- |
| `slate-browser/src/playwright/index.ts` | keep split | The old entrypoint was a 9k-line proof harness. Sub-owners such as scenario replay, selection snapshots, DOM text actions, native-event trace, and harness construction are real proof owners. |
| `slate/src/core/public-state.ts` | keep major owner splits, not micro-state splits | Runtime impact, snapshot indexes, listener state, state fields, public root policy, and operation state are durable core owners. Tiny WeakMap helpers were merged back. |
| `slate-react/src/editable/mutation-controller.ts` | keep semantic mutation owners | Block editing, full-block editing, history intent, and projected root scope are behavior owners. One-owner profiler/frame helpers should not be separate. |
| `slate-dom/src/plugin/dom-editor.ts` | keep geometry/event/path splits | DOM event range targets, node paths, and string-coordinate placement are independent DOM substrate owners. |
| `slate-history/src/history-extension.ts` | keep split | State, replay, merge policy, and selection are durable history owners. |

## Merge-Back Decisions

| Area | Action | Reason |
| --- | --- | --- |
| Core runtime helpers | merged `document-value`, `normalization-fast-path`, `operation-root-state`, `transaction-depth`, and `version-state` back into `public-state.ts` | These files only served `public-state.ts` plus re-exports. Separate files increased navigation without durable ownership. |
| Delete text planning | merged `delete-text-location`, `delete-text-preservation`, and `delete-text-types` into `delete-text-plan.ts` | Delete planning had one algorithm split across location, preservation, and type shards. A single plan owner is easier to inspect. |
| DOM repair helpers | merged `dom-repair-frame`, `dom-repair-profiler`, and `dom-repair-scheduler` into `dom-repair-queue.ts` | They were one-owner queue helpers, not reusable runtime surfaces. |
| Editable void rendering | inlined `editable-rendered-void.tsx` into `editable-text-blocks.tsx` | The component had one caller and no independent owner. |
| Slate-browser budget assertions | inlined `budget-assertions.ts` into `harness-scenario.ts` | It was a one-use helper. |

## Keep After Re-Review

| Area | Reason |
| --- | --- |
| `clone.ts` | Tiny but reused across many core owners; merging it would duplicate clone/freeze policy. |
| `constants.ts` in slate-browser | Tiny but central and many-importer; this is a constants owner, not confetti. |
| `surface.ts`, `handle.ts`, `ready.ts`, `materialization.ts`, `root-focus.ts` | Small but first-party Playwright primitives with clear names and multiple callers. |
| `full-document-range.ts` | Shared by insert text, insert fragment, and full-document delete behavior. |
| `mutation-profiler.ts` and `mutation-root-scope.ts` | Small but have multiple mutation owners and represent shared mutation policy. |

## Verification Evidence

- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/delete-contract.ts`
- `bun test ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/projected-command-contract.test.ts`
- `bun test test/core/scenario.test.ts` from `.tmp/slate-v2/packages/slate-browser`
- `bun run typecheck` from `.tmp/slate-v2/packages/slate-browser`
- `bun --filter ./packages/slate typecheck && bun --filter ./packages/slate-react typecheck`
- stale-import audit for deleted helper filenames

## Review Notes

- Do not judge this run by file count alone. The correct question is whether
  one behavior has fewer owners to inspect.
- Future split packets must record a before/after agent-navigation score.
- New files under 80 lines are allowed only when they have multiple callers, a
  stable name, or a durable proof/runtime owner.
- Merge/delete/inline are equal architecture outcomes. More files is not a
  win.

## Next Owner

Use `$architecture-cleanup` before committing large Slate v2 refactor batches.
The first command should be:

```bash
git -C .tmp/slate-v2 ls-files --others --exclude-standard | while IFS= read -r f; do lines=$(wc -l < ".tmp/slate-v2/$f" | tr -d ' '); printf '%5d %s\n' "$lines" "$f"; done | sort -n | sed -n '1,120p'
```

Then rank candidates by durable ownership, caller count, and focused proof, not
line count.
