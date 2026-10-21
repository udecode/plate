# Store the values people write, so a rejected cut, a retype or a move never loses one

Status: planning: the plan panel on the architect pick
Topic: cut-join
Playbook: bug-fix

## Brief

### What will change?

Rejecting an Enter or split keeps halves apart when their values differ, and a retype, move or reload never loses a value someone wrote or crashes on it.

### What could go wrong?

Saved documents can hold values they used to leave out, so the saved format changes for schemas whose defaults the editor leaves out. Halves that used to merge can stay apart, and a rejection can wait on a related suggestion.

## Teach

A schema can give a property a default and leave that default out of the saved document. Today the editor also leaves out a value someone wrote when it equals the default where the node sits. After that, "never written" and "written as the default" look the same.

That one blur causes every finding the redesign plan's panel raised. A rejected cut cannot tell a dropped value from a written one, so it merges halves that differ. A retype or a move reads the new block's default where a person wrote a value, or crashes when the new block requires it. Two decision orders give two results, because one order drops a written value before a retype and the other keeps it.

This plan picks how written values are stored, then lands the cut-join and give-back slices on that rule.

## Expected results

Rows carry the redesign plan's semantics: "proposes" is a suggestion, "directly" is an Editing change, and "every order" means each order of single decisions and all of them in one call. A result names what each node reads, and "stores" names what the saved document holds. The table check grows from `docs/plans/artifacts/cut-join-values/redesign/table/table-check.r5.template.ts`. Rows T1 to T31, G1 and G2 are the redesign plan's, moved here except T17 to T20, T26 and T27 to T30, which its slice 1a owns.

| Row | Rank | Start and steps | Must give | next | Slice |
| --- | --- | --- | --- | --- | --- |
| T1 to T7, T12, T22 to T24 | P0, T24 P1 | the redesign plan's rows | the redesign plan's results, compared by reading | fail | joins |
| T10, T11 | P0 | the redesign plan's rows | the redesign plan's results | fail | give-back |
| T13 to T15, T21, T25, T31 | P0 | the redesign plan's rows | the redesign plan's results | fail | storage |
| G2 | P0 | the probes `one-editor` and `filled5` | no crash; each value next stores before its crash stays | crashes | storage |
| S1 | P0 | ref defaults to w and is left out, and a split drops it; link ab ref r1; Carol proposes a split; Ed sets b's ref to z directly; Alice proposes v on a and w on b; accept Alice, reject Carol, every order | two links, a ref v and b reading w | ab ref v | joins |
| S2 | P0 | as S1, but Frank sets a's ref to v and b's to w directly, with no Alice; reject Carol | two links, a ref v and b reading w | ab ref v | joins |
| S3 | P0 | as S1's schema; link ab ref r1; Carol's split; Bob proposes removing a; Alice proposes ref w on b; accept Bob and Alice, reject Carol, every order | b reading w | b ref r1 | give-back |
| S4 | P0 | url defaults to u under paragraphs and w under headings, both left out; heading h, then a paragraph with link ab; Carol proposes an inline split; Ed sets a's url to w directly; Dave proposes a Backspace that merges the paragraph into the heading; reject Carol and accept Dave, every order | one link ab reading w in every order | one link ab | joins |
| S5 | P0 | S4's schema; a paragraph with link ab; Carol's inline split; Bob proposes heading; Ed sets a's url to u directly; reject Carol and decide Bob, every order | accepting Bob gives a at u and b reading w; rejecting him gives one link ab at u; every order agrees | depends on order | joins |
| S6 | P0 | the root requires a leading title, then paragraphs; title ab; Carol proposes an Enter between a and b; reject Carol | title ab | passes | guard |
| S7 | P0 | a Plate heading; Enter proposed in the middle, at the end and at the start; reject each | the one heading as before | passes | guard |
| S8 | P0 | link ab at u; Carol proposes an inline split; Dave proposes inserting link x at z between the halves; reject both, every order | Carol waits on Dave; ab at u in every order | depends on order | joins |
| S9 | P1 | as S8, but Ed inserts x directly and Dave proposes removing it; reject Carol and accept Dave, every order | ab at u in every order | depends on order | joins |
| S10 | P1 | url required under paragraphs, w its left-out default under headings; a paragraph with link at w; retype to heading directly, then back | no crash; the link at w | crashes | storage |
| S11 | P1 | leaf url defaults to v under outer and w elsewhere; Bob proposes u, Eve w; accept Bob; save the children and reload; move the leaf to the root; save and reload; move it back | the leaf at w | w | storage |
| S12 | P1 | color defaults to u under paragraphs and w under headings, left out; set the text's color to u directly; retype to heading directly | the text stores u and reads u | stores nothing, reads w | storage |
| S13 | P1 | ref split drops; link ab ref r1; Bob proposes r2; Carol proposes a split; reject Carol, then reject Bob | ab ref r2, then ab ref r1 | waits on Bob | joins |
| S14 | P0 | the seed search's case gen-40 of seed 20261212: url defaults by parent, link abcd at v, six changes of Enters, an inline split, a merge and url and ref writes; reject Eve's ref writes; then move b's link into the first block directly | no crash; the link reads the url its new place gives | crashes, as the slice does | storage |
| G1 | P0 | the gate probes | each line reads as next's, apart from a throw or a refusal that becomes a result this table gives | the reference | each |

## Design

Every storage shape keeps slice 1a's `heldProps` at both of its call sites, the decision and the admission settle, because a written value still has to leave a place that cannot hold it.

The architect run picked "store every written value" (`docs/plans/artifacts/cut-join-values/redesign/architect-1/synthesis.md`), and its cross-judge picked the same base. A key that is present was written and a key that is absent was never written, so "written" has one owner and needs no list of special keys. The storage slice deletes the two strips in `editor-schema.ts`, the `omittedDefault` repair branch and the `omit-default-property` repair instead of adding a stored record. Plate keeps its saved bytes and its schema fingerprint, because every Plate `omitDefault` key is a `false` boolean that no first-party flow writes. Three grafts join it:

- **From the cut-record shape.** The cut records a `CutBasis` when it is made. Its dropped patterns include absent keys, which fixes T9. Its replacements tell a type the cut forced (S6, S7) from one an Editing change made (T24), and its saved values keep their format layers for the give-back slice.
- **From the classes shape.** Plate's heading split reset is tied to the break that causes it, and a round-trip test checks that a saved written default loads back unchanged.
- **From the review of all three.** `storageLawOf` feeds the schema fingerprint, so only a schema where an older editor's strip could change a reading gets a new fingerprint. An exclusive group counts only members that differ from their default, and typing compares stored values.

The plan panel still has to settle one question the run left open, a gate for an older peer with the same fingerprint that loads a document holding a pending written default.

The joins and give-back slices follow the redesign plan's design with two changes from its panel: a type the rejected cut itself forced, such as a title's continuation, joins back, and a rejection waits on undecided insertions and removals between its halves.

## Steps

- [x] Architect on the storage rule. Proof: `docs/plans/artifacts/cut-join-values/redesign/architect-1/synthesis.md`.
- [ ] The plan panel on this plan. Proof: the panel's rows in the decision log.
- [ ] Storage slice. Proof: rows T13 to T15, T21, T25, T31, G2, S10 to S12 and S14 pass, no passing row breaks, the G1 probes read as next's apart from the table's results, a suite test per failure mode fails on next first, then the plitejs suite, typecheck, lint, a push panel on the diff and land.mjs.
- [ ] Joins slice. It also judges content a decision moves into another block, through a merged block, a rejected cut's join or a landed line, at that block, as slice 1a judges an unwrapped node's children. Proof: rows T1 to T7, T12, T22 to T24, S1, S2, S4, S5, S8, S9 and S13 pass, with the same gates.
- [ ] Give-back slice. Proof: rows T10, T11 and S3 pass, with the same gates.

The run is done when every P0 and P1 row here and in the redesign plan passes. A failing P2 row becomes a suggested task.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How a written value is saved | Store every written value, even one equal to its default (look) | Keep leaving defaults out and have the cut record what it dropped | record drops | big |
| A type the rejected cut itself forced, such as a title's continuation | Joins back to the first line's type (look) | Stays apart like any other type difference | keep forced type | small |
| A rejection with an undecided insertion or removal between its halves | Waits on it, so every order agrees (look) | Applies at once and leaves the order's result | no structural waits | small |
| A rejected Enter between lines whose type or properties differ | The lines stay apart, the same rule as link halves (look) | Join them and keep the first line's type and properties | join lines | big |
| A url removed from the middle piece of two rejected splits | Stays removed, so three pieces remain (look) | The url comes back and the pieces join | restore removed url | small |

## Open work

- The plan panel and the three slices. Owner: a fresh session the lead starts from the redesign run's hand-off brief. Stop: each slice's land.mjs push.
