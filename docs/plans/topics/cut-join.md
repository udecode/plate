# Rejected cuts and decided values

Page: https://claude.ai/artifact/V9DMHdJKexdyqCDCDLF5Wa

What happens to property values when a reviewer rejects a proposed Enter or split, and when a decision lands a value on a node whose type or place changed. Plans `docs/plans/2026-10-20-cut-join-values.md`, `-order.md`, `-moves.md`, `docs/plans/2026-10-21-cut-join-classes.md` and `docs/plans/2026-10-21-cut-join-slices.md` are this subject's earlier iterations. `docs/plans/2026-10-21-cut-join-redesign.md` is the current one, and `docs/plans/2026-10-21-cut-join-storage.md` follows it.

## Main changes

- `joinRejectedCuts` in `packages/plitejs/src/authored/tree/cuts.ts` joins a rejected cut's halves without comparing their values, and the joined element keeps the left half's properties. A block join keeps the left block's type and properties.
- Two owners write decided values. `settleFormats` in `packages/plitejs/src/authored/facts/settle.ts` restores a pending tag's written value at admission, and `decideFormats` in `packages/plitejs/src/authored/tree/resolve.ts` writes each decided value during a decision. Both pass the node through `heldProps` in `packages/plitejs/src/authored/tree/holds.ts`, which keeps only the values the node's place declares and accepts. A decision that retypes, wraps or unwraps a node judges it, and the children it lifts, at the new place.
- A decision that would drop a value waits instead while a pending suggestion still decides that place: a retype of the node, or a wrap, unwrap, join, split or retype of an ancestor. It returns blocked with that suggestion.
- Yjs import, in `canonicalize` in `packages/plitejs/src/yjs/core/plugin.ts`, drops a merged value its place refuses, so concurrent edits give every peer the same document instead of an admission error.

## Open work

- The storage, joins and give-back slices in `docs/plans/2026-10-21-cut-join-storage.md`, which fix how a rejected cut joins halves whose values differ. Owner: a fresh session the lead starts from the redesign run's hand-off. Stop: each slice's land.
- Same-batch readers, removed content's write ids, place-dependent schema policy, shown-default writes, block unwraps, partial saves and Yjs splits each wait as their own suggested task: t_048448ff, t_4293d5c9, t_546ba394, t_e7c18723, t_ab434358, t_f1233d76, t_3eff99fa and t_649d2131. Owner: the lead session. Stop: each task's land.
