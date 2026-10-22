# Shard 001: how editors recompute and paint find results

Scope: one theme, eight editors. The open editors were read as local checkouts at the commits in `../repo-registry.tsv`. Google Docs, Word desktop and Word for the web are closed, so their rows rest on public material only and say so.

Three operations stay separate in every editor read: recomputing matches, moving existing ranges through an edit, and updating the view. A full rescan can still end in a small DOM update, and a small rescan can still rebuild every highlight.

| Editor | Recompute after an edit | How highlights follow an edit | What it repaints |
| --- | --- | --- | --- |
| VS Code | The whole search scope, after a 100 ms delay, capped at 19,999 matches (`findModel.ts:81`, `:105-110`) | Decorations live in interval trees that adjust on the edit itself; the later rescan replaces the match list | Rendered viewport lines whose input changed |
| Monaco | Inherits VS Code's core; the packaged core was not installed, so unverified | Same | Same |
| CodeMirror 6 | The built-in highlighter rebuilds matches over `visibleRanges` on every doc, selection or viewport change (`search.ts:399-425`) | `RangeSet.map` moves general decoration sets; `MatchDecorator` maps its set and rescans only the changed lines inside the viewport, rebuilding when more than 1,000 characters changed (`matchdecorator.ts:103-143`) | Changed tiles in the rendered viewport |
| ProseMirror (`prosemirror-search`) | The whole document or configured range on every doc or selection change (`search.ts:43-55`) | Rebuilt, not mapped; `DecorationSet.map` exists but find does not use it | View descriptions reuse equal nodes and decorations |
| Lexical (playground) | The whole root text on every change | Clears and rebuilds every CSS highlight or overlay (`FindReplaceExtension/index.tsx:347-390`) | Dirty DOM nodes; all find highlights |
| CKEditor 5 | Only the elements the model differ changed (`findandreplaceediting.ts:228-290`) | One live-range marker per result, transformed by each operation | Marker-affected view text |
| Google Docs (public only) | Unknown | Historical OT is documented; find and comment mapping are not | Canvas rendering is documented; its invalidation scope is not |
| Word desktop (public only) | Unknown | `Range` objects expand on insertion at their end; internals unknown | Background pagination is documented; local relayout is not |
| Word for the web (public only) | Query-as-you-type is documented; edit-driven rescans are not | `Range.track()` and Fluid interval collections are documented; no evidence links Fluid to Word's find | Unknown |

## Leads

- Block-local rescan (CKEditor 5's shape). Kept and promoted. Plate's matches never cross a text block, so rescanning the changed text blocks gives the same results as a whole search. See `../lead-ledger.tsv`.
- Viewport-bounded search (CodeMirror 6's built-in shape). Rejected for the search. Find shows a total count and steps through every match, so it needs the whole list. Plate already reads decorations only for rendered nodes.
- Mapped decoration sets (ProseMirror, CodeMirror, VS Code interval trees). Rejected for now. Plite re-reads only dirty nodes and shifts slices through native insertions, and the profiles of Phase 1 and the prototype put the whole decoration runtime under 0.3 ms per keystroke pair. Its 18 ms per `dense-1k` `shift` pair on `origin/next` comes from Find marking every node dirty.
- Deferred rescan (VS Code's 100 ms delay). Rejected. It leaves stale ranges and a stale count between the edit and the rescan, and a block rescan already costs little.
- Match cap (VS Code). Rejected for this question. A cap bounds query-change cost, which this review did not measure.

## Duplicates

The 2026-10-21 review read the same ProseMirror, Lexical and CKEditor find code. This shard reuses those reads and adds VS Code, CodeMirror 6 and the closed editors.

## Next query

None for this question. The closed editors stay unknown beyond public material, and no public engineering account found would change the pick.
