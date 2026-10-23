# Drop a decided value that its retyped block can no longer hold

Status: partial: slice 1a landed; the storage plan carries the storage, joins and give-back rows
Topic: cut-join
Playbook: bug-fix

## Brief

### What will change?

Deciding a suggestion no longer crashes or is refused when a retype leaves a block a value it cannot hold. The editor drops that value, or waits while another suggestion still decides the place. Yjs peers drop it too.

### What could go wrong?

A tone or color someone accepted disappears when the heading that held it is rejected or retyped away. Rejecting someone's Enter or split still merges halves that hold different values; the storage plan fixes that next.

## Teach

A schema can say that a value only fits some blocks, such as a tone that only headings hold. In suggesting mode, one person can propose a heading and another a tone on it. Deciding them in some orders left the tone on a paragraph, and the editor then crashed or refused the decision.

Now, when a decision writes values onto a block or changes its type or place, the block keeps only the values that place can hold, text included. While another pending suggestion, such as a wrap or a retype, still decides that place, the decision waits for it instead of dropping the value. When concurrent edits leave a value where its place refuses it, every peer drops it alike, and a pending suggestion keeps its mark.

This plan first covered the cut fixes too. Its panel traced them to how the editor saves a value equal to the default, so they moved to the storage plan.

## Expected results

Each row starts from the document named, runs the steps in order and must give the result. "Proposes" is a suggestion, "directly" is an Editing change, and "every order" means each order of single decisions and all of them in one call, with decisions that each wait on the other decided together. The table check is `docs/plans/artifacts/cut-join-values/redesign/table/table-check.r6.template.ts`, run by its `run.sh` against a tree. It runs outside the suite. "next" is its run on `origin/next` b7fb129af6. Since the storage slice a node keeps every value written to it, so r6, which compares saved bytes, no longer fits T12, T23 and T31; the storage plan's table check runs those three by what each node reads.

| Row | Rank | Start and steps | Must give | next | Slice |
| --- | --- | --- | --- | --- | --- |
| T1 | P0 | link ab at u; Carol proposes an Enter after a; Alice proposes a at v and b at w in one change; reject Carol | waits on Alice and changes nothing | applies, ab at v | joins |
| T2 | P0 | as T1; accept Alice and reject Carol, every order; then reload, then set a's url directly | one paragraph, a at v and b at w; reload the same; the edit changes only a | ab at v | joins |
| T3 | P0 | as T1, then Bob proposes q on both halves; reject Carol | waits on Alice and Bob | applies | joins |
| T4 | P0 | as T1, then Bob proposes q on a; accept Bob, reject Alice and Carol, every order | a at q and b at u | ab at q | joins |
| T5 | P0 | Bob proposes an Enter in ab at u; Carol proposes u2 on b; accept Carol, reject Bob, every order | a at u and b at u2 | ab at u | joins |
| T6 | P0 | ab at u with ref r1; Carol's Enter; Ed sets b's ref to r9 directly; Alice proposes v and w; reject Carol | applies at once: a at v ref r1, b at w ref r9 | ab at v ref r1 | joins |
| T7 | P0 | abc at u; Carol and Dave each propose a split; Ed removes the middle piece's url directly; reject both, every order | a at u, b with no url, c at u | abc at u | joins |
| T8 | P0 | ab at u with ref r1; Carol proposes a split; reject it | ab at u ref r1 | passes | guard |
| T9 | P0 | ab at u; Carol's Enter; Ed sets a's ref to r7 directly; reject Carol | ab at u ref r7 | passes | guard |
| T10 | P0 | ab at u with ref r1; Carol's split; Bob proposes removing a; Alice proposes ref r2 on b; accept Bob and Alice, reject Carol, every order | b at u ref r2 | b at u ref r1 | give-back |
| T11 | P0 | as T10; accept Bob, reject Alice and Carol, every order | b at u ref r1 | b at u in one call | give-back |
| T12 | P0 | url defaults to w and leaves it out; Carol's split of ab at u; Alice proposes v and w; accept Alice, reject Carol, every order | a at v, and b reading w | ab at v | joins |
| T13 | P0 | url defaults to w and leaves it out; Bob proposes u, then Eve proposes w; accept Bob, then reject Eve | both apply; url u | accepting crashes | storage |
| T14 | P0 | T13 on a text color | both apply; color u | accepting crashes | storage |
| T15 | P0 | tone only on headings, default w left out; Bob proposes u, Eve w; accept Bob; retype to paragraph directly; reject Eve; reload | each step applies; the paragraph has no tone; reload the same | accepting crashes | storage |
| T16 | P1 | T15 with Eve's x | accepting applies with tone x; the retype gives a paragraph | passes | guard |
| T17 | P0 | a paragraph; Alice proposes heading; Bob proposes tone u, Eve tone w; one call accepts Bob and rejects Alice; then reject Eve | both apply; the paragraph has no tone | crashes | 1a |
| T18 | P1 | T17 with Eve's z; reject Alice and accept Bob, every order | a paragraph with no tone | refused | 1a |
| T19 | P1 | T17 with Eve's z; accept Bob, then reject Alice | applies; a paragraph with no tone | refused | 1a |
| T20 | P1 | a heading at tone u; Eve proposes w; retype to paragraph directly; reject Eve | applies; a paragraph with no tone | refused | 1a |
| T21 | P0 | color only on text in paragraphs, default w left out; Bob proposes u, Eve w; accept Bob; retype to heading directly; reject Eve | each step applies; the heading's text has no color | accepting crashes | storage |
| T22 | P0 | a paragraph ab, tone with no default; Carol's Enter; Alice proposes tone v on a's line and w on b's; reject Carol; then accept Alice and reject Carol, every order | waits on Alice; then two paragraphs, tone v and tone w | one paragraph at tone v | joins |
| T23 | P0 | url defaults to v under paragraphs and w under headings, both left out; Carol's Enter in ab at u; Bob proposes heading for b's line; Alice proposes v and w; accept Alice and Bob, reject Carol, every order | a paragraph with a and a heading with b, each reading its own default | one paragraph ab | joins |
| T24 | P1 | as T23 from a link with no url; Alice proposes u on both; Ed makes b's line a heading directly; accept Alice, reject Carol, every order | a paragraph with a at u and a heading with b at u | one paragraph ab at u | joins |
| T25 | P0 | url defaults to v under paragraphs and w under headings, both left out; link ab at x; Dave proposes heading; Bob proposes u, then Eve w; accept Bob; then accept Eve and reject Dave, every order | a paragraph with ab reading w | crashes | storage |
| T26 | P1 | color only on text in headings; a paragraph; Alice proposes heading; Bob proposes color u on its text; reject Alice and accept Bob, every order; or accept both | a paragraph whose text has no color; accepting both keeps u | refused | 1a |
| T27 | P1 | a heading; Bob proposes tone u; Alice proposes paragraph; accept Bob and reject Alice, every order | a heading at tone u | passes | guard |
| T28 | P1 | T18 in every order; then reload, retype to heading directly and type x | every order gives the same document and review marks; a heading at tone z reading abcx | refused | 1a |
| T29 | P1 | T26 in every order; then reload, retype to heading directly and type x | every order gives the same document and review marks; a heading abcx with no color | refused | 1a |
| T30 | P1 | T17 with Eve's z, and T20; then reload, retype to heading directly and type x | a heading at tone z reading abcx, and a heading abcx | refused | 1a |
| T31 | P0 | T17, with Eve's w still pending; reload, then retype to heading directly | no crash; a heading reading w | crashes | storage |
| T32 | P0 | tone and color only outside quotes; a paragraph at tone u; Alice proposes removing its tone and wrapping it in a quote, in one change; reject Alice; reload and type x | the paragraph at tone u, then abcx at tone u | passes | guard |
| T33 | P0 | as T32 with color u on the paragraph's text | the text keeps color u, then abcx at u | passes | guard |
| T34 | P1 | T28's decisions in each order in one live editor, then a direct heading retype and a typed x in that editor | both orders give the same document and review marks; a heading at tone z reading abcx | refused | 1a |
| T35 | P1 | color only on text in quoted paragraphs; a paragraph a and a quote holding b; Alice proposes moving a into the quote; Bob proposes color u on the moved text; accept Bob and reject Alice, every order; reload and type x | a root paragraph a with no color, then ax with no color | passes | guard |
| T36 | P1 | size is any string on headings and s or m on paragraphs; a paragraph; Alice proposes heading; Bob proposes size xl; accept Bob and reject Alice, every order; reload, retype to heading directly and type x | a paragraph with no size, then a heading abcx with no size | refused | 1a |
| T37 | P1 | color only on text in headings; Alice proposes heading; Bob proposes color u; accept Bob; Ed presses Enter after a directly; reject Alice; reload | two paragraphs, a and bc, with no color | refused | 1a |
| T38 | P2 | T35's start and decisions | the restored paragraph keeps no review mark, so a typed x joins its text | keeps Alice's held deletion mark | chip |
| T39 | P0 | tone and color only outside quotes; a paragraph at tone u, or with its text at color u; Eve proposes removing the value; Alice separately proposes wrapping the paragraph in a quote; reject Eve alone, then reject Alice and Eve, and separately reject both together; reload and type x | rejecting Eve alone changes nothing, then both ways end at the start, and abcx keeps the value | refuses Eve alone, then the start | 1a |
| T40 | P0 | T36's sizes, declared on text too; a heading at size xl, or with its text at size xl; Eve proposes removing the size; Alice separately proposes paragraph; T39's decisions; reload and type x | as T39, with the heading keeping size xl | as T39 | 1a |
| T41 | P1 | tone only inside quotes; a paragraph; Alice proposes wrapping it in a quote; Bob proposes tone u on it; accept Bob and reject Alice, every order; separately, Ed sets tone u directly inside the pending quote and the reviewer rejects Alice; type x | a paragraph abc with no tone each way, then abcx | refused | 1a |
| T42 | P0 | two Yjs peers; T41's start with tone u accepted, or with no tone; peer A rejects Alice while peer B sets a quote-only text color, directly or proposed; exchange updates in either order | both peers ready and equal: a root paragraph abc with no tone or color, and a proposed color keeps its pending mark | the tone start refuses the rejection; the no-tone start stops both peers with an admission error | 1a |
| G2 | P0 | the probes `one-editor` and `filled5`, where the left-out default depends on the block: a decision, then a retype or a typed character | no crash; each value next stores before its crash stays | crashes | storage |
| G1 | P0 | the earlier probes `upgrade`, `required`, `required3`, `filled5`, `filled2`, `stale-type2`, `stale-type3`, `r1-repros`, `retype-uniform`, `one-editor`, `editing-retype` and `retype-next` | each line reads as next's, apart from a throw that becomes a result this table gives | the reference | each |

next passes T8, T9, T16, T27, T32, T33, T35, T39 and T40, and fails the other 32 P0 and P1 rows and the P2 row T38. Slice 1a also passes T17 to T20, T26, T28 to T30, T34, T36, T37, T41 and T42, and leaves every other row as next has it. T42 runs by `docs/plans/artifacts/cut-join-values/redesign/peer/run.sh`, because the table check drives one editor.

The fresh-seed search runs `chain-oracle-post.ts` in rounds of three new seeds for 12 minutes each, on the slice and on next, and stops at the first round that finds no new kind or after an hour. Its failures that next shares become rows of the plan that owns their class. The rows marked storage, joins and give-back belong to the storage plan.

## Design

The plan panel's critical findings all trace to one premise. The editor leaves a written value out of the saved document when it equals the default where it stands. Every row whose result depends on that premise moved to `docs/plans/2026-10-21-cut-join-storage.md`, with the join and give-back slices, which compare the values that rule decides. This plan keeps slice 1a, which needs no storage pick.

- **A decided place holds only its own values.** After a decision or the admission settle writes values onto a node, or a decision retypes the node or an ancestor, the node drops every value that its decided type, ancestors and root cannot hold. One helper, `heldProps` in `packages/plitejs/src/authored/tree/holds.ts`, answers this for both owners: the decision in `tree/resolve.ts` and `settleNode` in `facts/settle.ts`. A place holds a value only when a declaration there names the key and accepts the value, the same value check a direct retype makes. A key no declaration names keeps its value, and so does every value of an element whose type the schema does not declare. The settle judges every key of a node it writes, not only the keys it wrote.
- **An unwrapped node's children are judged at their new parent.** When a decision unwraps a node, such as a rejected wrap or an accepted unwrap, each child is judged at the parent and ancestors that survive, never at the wrapper that goes away, whether or not the decision changes the child's own values (row T41).
- **A decision waits while another pending change decides the place.** When a decision would drop a value and a suggestion that retypes the node, or that wraps, unwraps, joins, splits or retypes one of its ancestors, is still pending, the decision waits on that suggestion instead (rows T39 and T40). next refuses such a decision. Once the other suggestion is decided, the decision applies, and every order ends the same. An earlier version waited only on a pending retype of the node and was cut because no row needed it; T39 and T40 are those rows. The settle at load needs no wait within one editor, because a verdict that would restore such a value cannot land there while that place is pending. A peer whose copy holds a concurrent pending wrap can still drop the value when the verdict reaches it, as the next rule does for every peer.
- **Every peer drops a merged value its place refuses.** Yjs import runs each merged root through the schema's property canonicalizer with misplaced values dropped, in `canonicalize` in `packages/plitejs/src/yjs/core/plugin.ts`, before it replaces the editor's value. Concurrent edits that leave a value where the merged place refuses it, such as a quote-only color written while another peer rejects the wrap, then give every peer the same document instead of an admission error. A proposed value keeps its pending mark, so the suggestion stays reviewable (row T42). next stops both peers there whenever such a race happens, and slice 1a reaches it from more decisions, because decisions next refused now apply.
- **No empty repairs.** The settle reports a change only when the node's values differ after the drop, because the drop can remove a value the settle just brought back.

## Steps

- [x] Slice 1a: a decided place holds only its own values. Proof: rows T17 to T20, T26, T28 to T30, T34, T36, T37, T41 and T42 pass and no other row changes, T32, T33, T39 and T40 pass as on next, the G1 probes read as next's apart from `retype-next`'s planned result, each new suite test fails on next or on the slice before its fix, a mutant of the settle's placement, its rewritten check, resolve's retype gate, its descent and the text parent fails a test, then the plitejs suite, typecheck and lint, a push panel on the diff and land.mjs. No mutant covers the `root` argument or the undeclared-type guard.
- [ ] Storage, joins and give-back. Moved to the storage plan, which this session builds next.

The run is done when every P0 and P1 row here and in the storage plan passes. A failing P2 row becomes a suggested task.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A decided value the block's type cannot hold | The decision applies and drops the value (look) | Refuse the decision | refuse misplaced values | small |
| Slice 1 after the panel | Land the retype rule now as slice 1a and move the storage-dependent rows to the storage plan (look) | Hold all of slice 1 until the storage rule is picked | hold slice 1 | small |
| Which suggested tasks join this run | The crash, the retype throw, the retype refusal and the gone left piece join; the same-batch reader, removed content's writes and the schema question keep waiting | Fold all seven | fold all | detail |
| Design pass | Recheck the eight-slice program against the table, then the plan panel | A fresh architect run on the table | architect | detail |
| Rows other tasks own | Yjs, removal landing, unwraps, shown-default writes and partial saves stay with their tasks and out of this run's done line, apart from T42, the Yjs race this run's decisions reach | Add their rows here | widen table | detail |
| A decided retype and a property that a direct retype drops | A decision keeps every value the decided place holds, as next does, while a direct retype drops a property whose type-change rule says drop (look) | Make decisions follow each property's type-change rule too | follow typeChange | small |
| A decision whose drop depends on a suggestion still pending | The decision waits on that suggestion and returns blocked with it (look) | Refuse it as next does and return invalid | refuse while pending | small |
| A merged Yjs value whose place refuses it | Every peer drops it at import, and a proposed value keeps its pending mark (look) | Stop the binding with an admission error, as next does | refuse misplaced imports | small |
| Releasing between slice 1a and the storage slice | No release cuts between them, because after 1a T31's crash moves from the decision to a later direct retype of the saved document. next refuses or crashes at or before that step in every order (look) | Release 1a alone and accept the moved crash | release 1a | small |

## Open work

- The storage, joins and give-back slices, in `docs/plans/2026-10-21-cut-join-storage.md`. Owner: a fresh session the lead starts from this run's hand-off brief. Stop: each slice's land.mjs push.
- A decision also moves content into another block through a merged block, a rejected cut's join and a landed line, and slice 1a does not judge that content at its new block yet. Owner: the storage plan's session. Stop: its joins slice, which rewrites that code.
- The speed line, each 1,000-block cohort of the decide bench within 1.25 times next, is still a gate. Run a2 read candidate ratios of 0.81 to 0.93, but host load passed the runner's limit in both paired runs, so neither is conclusive. Owner: suggested task t_37895e33, which reruns it on a quiet host. Stop: that run; a conclusive miss sends the design back to `architect`.
- T38, a rejected move that leaves a review mark, waits as suggested task t_0d2139f7.

## Close

Slice 1a landed on next as `fix(plitejs): drop a decided value its retyped or unwrapped block cannot hold`. A decision or the settle at load that writes values onto a node, or a decision that retypes, wraps or unwraps a node's place, now leaves only the values that place declares and accepts. Rejecting a heading under an accepted tone, or a wrap that gave a tone back, applies in every order instead of crashing or being refused. While another pending suggestion still decides the place, the decision waits on it. Yjs peers drop a merged value whose place refuses it instead of stopping with an admission error.

Proof:
- The r6 table check passes 21 rows on the landed bytes and 9 on next b7fb129af6. The slice fixes T17 to T20, T26, T28 to T30, T34, T36, T37 and T41, and every row next passes still passes. The peer probe passes T42 on the slice; on next, the tone start refuses the rejection and the no-tone start stops both peers.
- next fails 32 P0 and P1 rows, and the slice fails 19.
- Each new suite test fails on next or with its fix reverted alone, and a mutant of each guarded mechanism fails a test.
- The plitejs suite, typecheck and lint pass on the final bytes, apart from one React IME decoration test that failed once under host load 45 and passed five of five runs alone. land.mjs reruns the affected checks on the rebased commit.
- The G1 probes read as next's apart from `retype-next`'s planned result.
- Four fresh-seed search rounds found no failure kind on the slice that next lacks.

Limits: T31's crash moves from the decision to a later direct retype until the storage slice lands, so no release cuts between them. No mutant covers `heldProps`' `root` argument or its undeclared-type guard. The speed line stays a gate, as Open work says.

Deviations: round 1 of the diff panel found that the decision judged an unwrapped node's children at the wrapper it removed; the fix judges them at the surviving parent. Opus's W3 added the value check, which next lacks, so a decided value its place declares but does not accept is dropped instead of refused. Round 2's criticals added the wait on a pending wrap, unwrap, join, split or retype, rows T39 and T40. Round 3's critical showed that the slice reaches next's Yjs admission stop from more decisions, so the run added the import drop, row T42.

Trial metrics: 3.5 hours and 2,804 session messages since the start, 925 lead calls, failing P0 and P1 rows 32 before and 19 after, 4 panel rounds (one on the plan, three on the diff), and 3 chips offered.
