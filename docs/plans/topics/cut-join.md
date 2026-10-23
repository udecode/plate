# Rejected cuts and decided values

Page: https://claude.ai/artifact/Y77WFp5kARVDo1GrdNAxH5

What happens to property values when a reviewer rejects a proposed Enter or split, and when a decision lands a value on a node whose type or place changed. Plans `docs/plans/2026-10-20-cut-join-values.md`, `-order.md`, `-moves.md`, `docs/plans/2026-10-21-cut-join-classes.md` and `docs/plans/2026-10-21-cut-join-slices.md` are this subject's earlier iterations. `docs/plans/2026-10-21-cut-join-redesign.md` is the current one, and `docs/plans/2026-10-21-cut-join-storage.md` follows it. `docs/plans/2026-10-22-carried-moves.md` built the storage plan's moves and landed with its storage and joins slices.

## Main changes

- `joinRejectedCuts` in `packages/plitejs/src/authored/tree/cuts.ts` joins a rejected cut's halves without comparing their values, and the joined element keeps the left half's properties. A block join keeps the left block's type and properties.
- Two owners write decided values. `settleFormats` in `packages/plitejs/src/authored/facts/settle.ts` restores a pending tag's written value at admission, and `decideFormats` in `packages/plitejs/src/authored/tree/resolve.ts` writes each decided value during a decision. Both pass the node through `heldProps` in `packages/plitejs/src/authored/tree/holds.ts`, which keeps only the values the node's place declares and accepts. A decision that retypes, wraps or unwraps a node judges it, and the children it lifts, at the new place.
- A decision that would drop a value waits instead while a pending suggestion still decides that place: a retype of the node, or a wrap, unwrap, join, split or retype of an ancestor. It returns blocked with that suggestion.
- Yjs import, in `canonicalize` in `packages/plitejs/src/yjs/core/plugin.ts`, drops a merged value its place refuses, so concurrent edits give every peer the same document instead of an admission error.
- A producer that relocates a node records where it stood, and `formerPlace` in `packages/plitejs/src/core/change/lineage.ts` reads that place back for the current command. A write that carries a value its new place cannot hold drops it only when `carriesDefault` in `packages/plitejs/src/core/default-storage.ts` finds it was the left-out default there and no other change is pending on that key or on the node's place; any other value still refuses. In Suggesting, `carriedJudge` in `packages/plitejs/src/authored/tree/carried.ts` writes the drop as a removal tag, so rejecting gives the value back.

## Open work

- The give-back slice in `docs/plans/2026-10-21-cut-join-storage.md`, which fixes how a rejected cut whose left half is gone gives back the values the split dropped. Owner: the storage plan's session. Stop: that slice's land.
- Config-3's per-operation line for moves read inconclusive twice on the final tree, with move-large at 1.094 against 1.10. Owner: zbeyens, through suggested task t_78d37129. Stop: that task lands or the owner drops it; a conclusive miss sends the moves target back to `architect`.
- A decision that drops a key under another change's pending tag reads differently after a reload once a retype gives the key a place again. Owner: zbeyens, through suggested task t_a419bed6. Stop: that task lands or the owner drops it.
- A Suggesting Enter at the end of a heading whose text stores the left-out size, then a retype of the new line, records a removal tag next does not record. Owner: zbeyens, through suggested task t_a76ee70d. Stop: that task lands or the owner drops it.
- Same-batch readers, removed content's write ids, place-dependent schema policy, shown-default writes, block unwraps, partial saves and Yjs splits each wait as their own suggested task: t_048448ff, t_4293d5c9, t_546ba394, t_e7c18723, t_ab434358, t_f1233d76, t_3eff99fa and t_649d2131. Owner: the lead session. Stop: each task's land.
