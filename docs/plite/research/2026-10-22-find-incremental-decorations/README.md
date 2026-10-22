---
title: Find incremental recompute and decorations
type: research
status: complete
updated: 2026-10-22
review_scope: search
review_basis:
  - 2026-10-22-search-block-rescan
---

# Find incremental recompute and decorations

## Question

When one paragraph changes while a Find query is active, should Find rescan and repaint only that paragraph? Is Plite's decoration runtime the right and fastest owner for Find's paint, or would a mapped range set, as ProseMirror, CodeMirror and VS Code keep, do better? How do other editors recompute and paint find results after an edit?

## Scope

- Plate's `BaseFindPlugin` at `origin/next`, Phase 1's saved patch from the 2026-10-21 review, and a block-rescan prototype on top of Phase 1, profiled in the editor-perf Find lane.
- Plite's decoration runtime, `packages/plitejs/src/react/decoration-source.ts`.
- VS Code and Monaco, CodeMirror 6 (`search`, `view`, `state`), ProseMirror (`prosemirror-search`, `prosemirror-view`), Lexical's playground find, and CKEditor 5's find and replace, read as local checkouts at the commits in `repo-registry.tsv`.
- Google Docs, Word desktop and Word for the web through public material only. They are closed source, so every claim about them is labeled public-only.

Out: Tiptap and Slate, which the 2026-10-21 review read and which ship no incremental find. Query-change and whole-search cost, which this question does not ask about.

## Stop rule

Stop when each editor has a recorded recompute, mapping and repaint behavior or an explicit unknown, when each technique has a lead with a verdict, and when the block-rescan lead has a measured Plate prototype.

## Current evidence gap

The 2026-10-21 plan deferred the changed-block rescan until a profile of a rendered `sparse-10k` keystroke on Phase 1 showed the scan as a large share. Nobody had profiled a rendered keystroke, and nobody had measured the decoration runtime's share of one.

## Verdict

Pursue the block-local rescan, on top of Phase 1. Plate's search runs per text block and no match crosses one, so rescanning the blocks a commit changed equals a whole search. The prototype scans one text run per typed character where Phase 1 scans every block, and its Find work per keystroke pair falls from about 6 ms to about 0.1 ms at 10,000 blocks. CKEditor 5 is the one editor read that does the same.

Keep the decoration runtime. It re-reads only dirty nodes and costs under 0.3 ms per keystroke pair in every profile of Phase 1 and the prototype, so a mapped range set would save nothing measurable. On `origin/next` it costs 18 ms per `dense-1k` `shift` pair, because Find there republishes every match and marks every node dirty, which Phase 1 removes. Viewport-only search, a deferred rescan and a match cap were rejected; `rejected-ledger.tsv` holds each reason and reopen condition.

The profiles also found that at 10,000 blocks the editor itself, with no query at all, spends about 108 ms per keystroke pair, mostly in selection sync and React tree walks. Find is not the limiter there. The verdict page offers that as large-documents work.

Paired timing and the per-cohort counts live in the verdict page's decision log, `docs/plans/2026-10-22-search-block-rescan.decisions.tsv`.

## Counts

Nine editors and 13 repositories registered, 10 read locally, 3 closed products covered from public material. Five leads: one promoted, four rejected. No issues or PRs read.
