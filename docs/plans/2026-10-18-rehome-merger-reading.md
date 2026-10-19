---
review_scopes: [transactions, history, collaboration]
review_basis: []
work_kind: implementation
review_commit: ca9f418a0024ea19b77a54fdde42a1363eeb63a5
review_inputs: [packages/plitejs/src/core/change/merge-rehome.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/test/document-change-structural-transform.test.ts, packages/plitejs/test/yjs/merge-node-contract.spec.ts, packages/plitejs/test/authored-tree-collab.test.ts, docs/plans/2026-10-17-join-keeps-target.md, docs/vision/plite.md, content/docs/api/document-change.mdx]
---

# Undo finds a peer's merge inside the peer's own change

Status: superseded by docs/plans/2026-10-18-join-travels-as-join.md, after plan panel round 1's findings and a probe showed that no reading of a peer's change by value can find the merged line
Playbook: plan

**Pivot.** This iteration finishes the undo part of suggested task t_dd0dd0bd, which `2026-10-17-join-keeps-target.md` carries. That plan lets a reviewer accept a join beside another author's pending text, which the old hold blocked, so Bob's undo after such an accept must land in the joined line instead of bringing the join back. Its diff panel's round 2, the last round a panel gets, found the re-home's merger reading still failed there. That reading split the peer's change into runs of siblings inside the pair's parent, and when the change crossed the parent's edge it fell back to a whole-document diff. Past 62 changed siblings the diff's aligner gives up and returns one flat replacement, and a quote whose type changes arrives as one replacement of the whole quote. Both left the reading without a merged line. Under the panel rule's one replacement, the reading went back to its round 0 code at `ca9f418a00`, where 10 tests are red (`r2-reverted-tests-a1.log`), and this plan replaces its approach. Its rounds count from zero.

## Brief

### What will change?

Your undo inside two lines a teammate merged in a big change, like Accept all over a quote, lands in the merged line. The join task's last review found it reorders your text or brings the merge back.

### What could go wrong?

If the undo can't tell which line is the merge, it uses position, which can bring a decided join back beside pending text. A change removing both lines and editing a line holding their letters can send the undo there.

## Teach

When two people edit at once, an undo is replayed on top of what the other person did since, and both editors must end on the same document.

When the teammate merged the two lines your undo touches, the editor has to find the merged line. Today it reads the shape of the teammate's change, which a big change like Accept all hides. Your text then lands in the wrong order, or the decided merge comes back.

Now the editor looks only at the part of the teammate's change around the two lines. Near their place, it finds the line holding both lines' text in order and lands your undo there. An exact match wins, then the first line's type. If the change also deleted some text, the line at that place counts when it holds most letters. Both editors build toward one document, so they agree. When no line fits, the undo works as today.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the undo finds a teammate's merge | It looks for the merged line by its text, only inside the part of the teammate's change around the two lines (look) | The teammate's editor records the merge and sends it through sync, which changes the sync format | record merge | big |
| A merge that also deletes text in the two lines | The line left at the two lines' place counts as the merge when the change removed one line there, the line holds at least half their letters in order with some from each line, and no other line nearby still holds either line whole (look) | The undo works by position, as at base, so an Accept all that also takes a deletion in the two lines beside another author's pending text brings the join back | position only | small |
| Retyping a removed line at the end of the line above | Still reads as a merge, as the first plan already accepted (safe) | Refuse a merge whose merged line gained text | refuse retype | small |
| A merged line whose type changed in the same change | Still found: the text decides, and the first line's type only breaks a tie between two matches (look) | Only accept a merged line that keeps the first line's type | keep type | small |
| An emptied first line removed while the same change restyles the next one | A line that keeps every property of the second line counts as the second line kept, so the undo restores the first line, as at base (look) | Also refuse a line that lost any property of the first line, which brings the join back in seven review cases beside Ann, C4 among them | strict empty | small |
| The cost of a merge read from a whole-document replacement | 149 ms at 10,000 blocks, against base's 362 ms (safe) | Patch the merging side's own inserted slice, about 37 ms less, as a second way to build the change | patch slice | detail |
| Which page shows this plan | The atomic updates and document changes page, which owns the change transform (safe) | The undo page | undo page | detail |

## What other editors do

Read from local clones on 2026-10-18 by a research agent, which ran none of them: CKEditor 5 `14e73cc31b`, ProseMirror (transform `662b7a9`, history `768b742`, collab `19ad580`), Yjs `da052300` with y-prosemirror `9200946`, Lexical `dd5c41b13`, Slate `945a484df` with slate-yjs `69f3e0e`, Automerge `1618c97` and Loro `d5da57d` (`docs/plans/artifacts/2026-10-17-held-editing-deletion/architect-3/prior-art.md`). The two editors that restore an undone edit in place send the merge as a change that touches only the boundary. The editors that send it as a delete plus an insert lose the undone text. None finds a merge inside a coarse replacement.

| Editor | How a merge reaches the peer | Where an undone edit in the second line lands | Source |
| --- | --- | --- | --- |
| CKEditor 5 | A dedicated merge operation | In the merged line, where it stood | `model/operation/mergeoperation.ts:30-82`; `operation/transform.ts:2046-2121` |
| ProseMirror | A structural step that deletes only the boundary tokens | In the merged line, where it stood | `structure.ts:274-293`; `history.ts:121-165` |
| Yjs with y-prosemirror | A delete of the second line plus an insert of its text with new ids | Lost | yjs `utils/UndoManager.js:74-110`; y-prosemirror `src/sync-plugin.js:140-149` |
| Lexical | A delete plus an insert in Yjs | Lost | `lexical-yjs/src/CollabElementNode.ts:557-664` |
| Slate with slate-yjs | A merge operation that slate-yjs turns into a copy plus a delete | slate-history: where the stale path points; slate-yjs: lost (both inferred) | `slate-history/src/with-history.ts:44-66`; slate-yjs `applyToYjs/node/mergeNode.ts:53-73` |
| Automerge | A delete of one block marker in a flat text | In place for an id-based undo (inferred) | `rust/automerge/src/transaction/inner.rs:893-981` |
| Loro | No merge operation | Lost when each block is its own container (inferred) | `crates/loro-internal/src/undo.rs:1058-1141` |

Plite's Yjs import sends no boundary-only operation either. A join inside a quote arrives as one replacement over the quote and the line after it, and a top-level join beside an accepted line arrives as one replacement over every block from that line to the join, 83 blocks in R80 (`a3-shape-probe-a2.log`). So the receiver reads the merge from the peer's own change.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The re-home finds the merged line by value inside the merger's own edits around the pair | Plite | `plitejs`, `src/core/change/merge-rehome.ts` | The merger's edits bound the search, so neither a whole-document diff nor its aligner's cap decides it |
| The merger's rebased side keeps every section outside that window and splices the merge inside it | Plite | `plitejs`, `src/core/change/root-change.ts` | Both sides then land on one target, so the public transform converges |

No code moves between entrypoints, so `tooling/entrypoints/entrypoint-dag.mjs` is unchanged.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Undo inside two lines a peer merged in a coarse change: an Accept all over a quote beside Ann's pending text, a batch with up to 80 changed lines between, a quote or callout whose type changes in the same change | The undone text lands in the merged line where it stood, and the decided join stays | bun tests over two Yjs peers in `authored-tree-collab.test.ts`, 10 of them red at `ca9f418a00` |
| The public `DocumentChange.transform` over a merge with a property change, a link relinked or a level change | Both orders converge on the merger's properties with the other side's typing in the merged line | bun tests in `document-change-structural-transform.test.ts` |
| Undo after a peer removed both lines, alone or with typing in a third line holding their letters | Unchanged from base | bun tests in `test/yjs/merge-node-contract.spec.ts` |

## Main changes

- `rehomeOverBlockMerge` in `packages/plitejs/src/core/change/merge-rehome.ts` reads the merging side's result and its own edits, instead of a split of that change into sibling runs. The pair search around the other side's first edit and its checks stay: every edit of the other side lies strictly inside one of the two blocks, both blocks hold text and stay whole on the other side, joining them gives a new block, and one of the merging side's replacements covers the boundary.
- A new `windowOf` sorts the merging side's edits once and sweeps outward from the pair, taking an edit that overlaps the window or inserts at its edge, and widening to whole siblings until neither grows it. It maps that range into the merging side's result by the edits' lengths.
- A new `mergedBlockIn` looks at the outermost text blocks inside the mapped window that sit within the pair's place, give or take the blocks the merger added or removed there. It takes an exact match of the pair's text first, then a block holding it in order, with the first line's type as a tiebreak, and refuses a tie. A block that a line outside the pair could have become with text only added never counts when that line held the pair's letters. With no match, it takes the block at the pair's place when the window lost one block there, the block holds at least half the pair's letters in order with some from each line, and no other block nearby still holds either line whole. It refuses, when the first line is empty, a block that keeps every property of the second line, and a copy of the second line beside the match when the window lost none.
- `rehomedTransforms` in `packages/plitejs/src/core/change/root-change.ts` builds the merging side's rebased change as the second block removed, the first block's children and properties set to the merged block's, then the merging side's sections outside the window copied as they are, inserts on the window's edges left to the window, and the window's remainder as two replacements beside the merged block. The other side's rebased change is a children diff inside the merged block. Both land on the merging side's result with the merged block's children three-way merged: each side's edits are read per block with the junction's empty text dropped, the other side's are carried through an exact join, and both are rebased on the merged block.
- `partitionChange`, `mergerWithin` with its whole-document `between`, `RootMergerPart`, `mergeOverOther`, `mergeLayoutOf`, `MergerPart`, `SiblingEdit` and `firstChild` are deleted.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| How the re-home reads the merging side's change | Sibling runs inside the pair's parent, from the change or a whole-document diff | The merged block found by value inside the merging side's own edits around the pair | `merge-rehome.ts` | A coarse import or a container's type change leaves no sibling run to read, and the diff's aligner gives up past 62 siblings | Internal; the public transform keeps its signature | The build step | A line nearby that holds the pair's letters in order | rearchitect |
| How the merging side's rebased change is built | Reassembled from its parts inside the parent, the rest rebased by position | Its sections outside the window kept, the merge spliced inside it toward one target | `root-change.ts` | Both sides land on one value, so a property change on the merged line survives | Internal | The build step | A window that covers the whole document costs one pass over it | rearchitect |
| Producing a node-local merge at the Yjs import | The import sends a coarse replacement | Unchanged | The Yjs bridge | The public transform takes changes callers build, so the reader must work on any shape anyway | none | none | Selection mapping through the coarse change stays coarse | defer |

## Design

### The reading

For each sibling pair around the other side's first edit, from the innermost block out, the re-home keeps today's checks. It then grows a window from the pair. It sorts the merging side's edits once and sweeps outward, taking in an edit that overlaps the window or inserts at its edge, and widening the window to whole siblings, until neither grows it. A property change on the next sibling's opening token does not overlap the window, so a change that restyles every later block does not chain the window through them. A merge can arrive as both lines removed and the merged line inserted beside them, or as one replacement from inside the first line to inside the third, and both shapes end in one window. Where an edit crosses the pair's parent, the window ends wherever that edit ends. The window maps into the merging side's result by the lengths of the edits inside it and before it.

Inside the mapped window, the candidates are the outermost text blocks, so an inline link inside a line never counts as the merged block. A candidate must sit at the pair's place among its parent's children, give or take as many places as the merger added or removed blocks there, and hold the pair's joined text in order. A candidate that a line outside the pair could have become with text only added, at the place that line would hold once the pair is one block, is left out when that line already held the pair's letters: its letters are its own, not a merge's. An unchanged line in a coarse replacement is the plainest such case. An exact match of the pair's text wins over a block that holds it with text added, and the first line's type breaks a tie that remains. Text only added still matches, so typing in the merged line, a third line merged in, a suggestion decided in it and a level or type change all pass.

When no candidate holds the whole text, the merging side may have deleted some of it, as an Accept all that also accepts a pending deletion does. The block at the pair's place then counts when the window lost exactly one block there, the block holds at least half the pair's letters in order, and, when the first line holds text, the block's letters come from both lines. A line still whole in another block of the window, or in the block just outside either edge, means the merging side joined a neighbour instead, and the reading refuses.

The reading also refuses a tie, and two shapes that read as a merge but are not one. When the first line is empty, a match that keeps every property of the second line is the second line kept while the peer removed the emptied first one, perhaps restyling the second; a suggested join's second line carries the join claim, which the accept drops, so this refusal guards Editing merges and the public transform, not the review flow. And a copy of the second line beside the match, when the window lost no copy of it, means the merging side retyped the second line's text into the first and kept the second.

### The rebuild

The target is the merging side's result with the merged block's children replaced by a three-way merge of the two lines joined, the merged block's children and the other side's two lines joined. The merge reads the other side's edits per block, after dropping the empty text that the join removes at the junction, so a mark the other side puts on that text lands on a new text instead of the one it joins. It carries those edits through the join built from the two lines' close and open tokens, and rebases them over the merging side's edits on the merged block. The other side's rebased change is a children diff inside the merged block. The merging side's rebased change removes the second block, sets the first block's children and properties to the target's, then copies the merging side's sections before and after the window and covers the window's remainder with two replacements beside the merged block. An insert on either edge of the window is already inside it, so the copy leaves it out. Outside the window the other side changed nothing, so the copied sections apply unchanged. Both rebased changes therefore land on the target, and an older undo entry that rebases over the merging side still sees a block removal.

### Arena synthesis

The third arena ran three runners on `docs/plans/artifacts/2026-10-17-held-editing-deletion/architect-3/task.md`. The first reads the merge by value through a lazy view of the merging side's result and rebuilds toward one shared target. The second finds the merged line by the first line's surviving token, or else by value, inside the merging side's edits. The third records the merge at the sender and carries it through Yjs. The lead built the first runner's shape without its lazy view, its anchors and its type rule, in a scratch tree, to test the premise all three share.

The cross-judge, an Opus seat that saw the designs without their runners' names, scored them on six criteria: 14 for the second, 11 for the first and 9 for the third (`architect-3/judge/verdict.md`). The lead's own scoring agrees on the order. The third is the only design that tells a merge from a retype, but it changes every producer and the sync format, and it is task t_1d5cd200 behind the Defaults word "record merge". The first design's lazy view rests on a false premise, because `transformInDocument` already applies both changes before the re-home runs. Its type rule refuses C4, which the prototype re-homes plain and beside Ann.

The base is the prototype: the second design's window and its by-value search, used for every merge, with both sides built toward one target as the first design builds them. The second design's surviving-token branch, its property-distance weight, its windowed diff and its fallback are cut, because the prototype passes the three suites and every must-answer case without them. These grafts go into the build:

- From the first design, a test for each encoding of the merging change, built by `between`, flat, composed, and serialized then read back, in both orders, plus a second line copied while it stays and two identical destinations, which refuse.
- From the second design, the mutant that builds the target with the first line's properties instead of the merged block's, which must turn the level-change merge red, and its corners written as the undo law's limits.
- From the third design, a test that counts whole-document reads during the undo over the quote join at 1,000 and 10,000 blocks, so a whole-document diff cannot come back unnoticed. Also a test that a retype and a real merge with the same changes give the same answer, pinned under t_1d5cd200.

Not grafted: the second design's patch of the merging side's own inserted slice, because the whole-document merge already measures 149 ms against base's 362 ms (`a3-proto-perf-a1.log`), under its frozen budget, and the patch would add a second way to build the same change; and the first design's typed refusal reasons, because each refusal already has a mutant that turns a test of the result red. The unchanged-block rule is the lead's own deviation from all three designs, and the judge read the prototype from before it, so the must-answer probes ran on the tree with the rule. Plan panel round 0 then replaced that rule with the held rule, which compares a line with the merge only at the place that line would hold, after a generated differential found the unchanged-block rule dropping the true merge when a line 60 places away was equal to it (case 297, `a3-diff-a8.log`).

The judge named eight probes to run before the pick. Each ran on the prototype, W at `ca9f418a00` and base `dc06078008` (`a3-judge-a1-a1.log`, `a3-judge2-a1.log`, `a3-judge3-a1.log`, `a3-judge4-a1.log`):

- **P1, a line holding the pair's letters, beside both lines removed.** `between` cuts that change into the pair's removal and a separate insert in the third line, so the window holds only the pair and the reading refuses, as base does. When the third line's own change touches the removal, such as its first letter retyped or its type changed, one replacement covers all three lines. The public transform then glues Bob's `b` into the third line in both orders, where base also misplaces it, or in one order drops the merging change. Through two Yjs peers, Bob's undo over the same edits leaves the document as base does. It is a new limit below.
- **P2, a merge that also deletes `c`, beside a line reading `xacdx`.** The undo rebases by position to `Qabd` in the heading, and nothing lands in `xacdx`. Base gives the same text in a paragraph. After plan panel round 0 the reading takes the heading at the pair's place, and the undo gives `abQd` (`a3-cases-r3fix-a5.log`).
- **P3, the same in Ann's variant.** Bob's undo brings the decided join back with Ann's text pending, on the prototype and on W. Base blocks that accept. After plan panel round 0 the undo lands Ann's pending `ab` in the merged heading before `dQ`, with no join back (`a3-cases-r3fix-a5.log`).
- **P4, a line reading `acd` 40 lines from an 80-line merge.** The prototype lands `abcQd` in the merged heading. The judge predicted a refusal, but `acd` does not hold the pair's text. W and base give `cQabd`.
- **P5, cost.** The scale gate's step gains a cohort for a coarse replacement that removes the pair, which the reading refuses.
- **P6, older entries through a coarse accept.** The second undo removes Bob's older `Y` from its own line on every tree. The first undo selects the restored `ab` where it stands. The older entry's selection maps into the merged heading on every tree, base included, because the accept arrives as one replacement over the fillers.
- **P7, the retype control.** A retype and a real merge both give `abc` on the prototype. Base gives `abcd` for both, which loses the real merge's undo.
- **P8, an empty first line whose surviving line gets a new id.** No live package assigns node ids. The public transform converges on `abcd` in both orders, where base diverges. It is a limit below.

Against the incumbent reading at `ca9f418a00`, the base passes the 10 red tests, drops the whole-document diff and its aligner's cap, and deletes the sibling-run reader.

### Limits

These rebase by position, as at base:

- A merging change that also deletes more than half the two lines' text, or whose kept letters all come from one line, such as an Accept all that keeps only `d` (`a3-cases-r3fix-a5.log`, F4b, `db` on every tree). A smaller deletion re-homes, as P2 and P3 do.
- A merging change that also deletes text, in a coarse window that holds another line with either line's text whole, as W1 and W4 at 80 lines do: Bob's `X` lands at the end of the window's last line, as on base (`a3-cases-r3fix-a5.log`). Before plan panel round 0, W4 landed it in the edited filler.
- A window where two changed blocks tie on exact text, on holding the text in order and on the first line's type.
- A retype: removing the second line and typing its text at the end of the first gives the same answer as a merge, `abc`, so the undo removes the retyped `d` (P7). Only a recorded merge tells them apart, t_1d5cd200.
- A join and a new line in one transaction, which the Yjs import turns into a text replacement that reuses the second line, so the re-home never runs and the undo gives `acdb`, as on base (`panel-plan-3/r0/seat-sol-on-opus.md`, finding 7).
- The selection an older entry stored inside a coarse replacement maps into the merged line, as on base (`a3-judge2-a1.log`, P6s).
- A plain join across a container's edge, such as Backspace at the start of the line after a quote, which joins no two sibling lines.
- Styled text restored at the very end of the first line, and a mark undone where the two lines meet, as the undo law already says.

Some cases land in a wrong place instead:

- **A repeated letter beside the merging side's own edit.** When the merging side also edits the lines next to a letter that repeats, such as deleting one `b` of `bbe`, the children merge cannot tell which copy it kept, and the other side's edit can land on the far side of that letter: `aedbXYe` where the generator expected `aedXYbe`. The generated differential has 14 such merge-and-delete rows and 4 merge rows that base or W gets right, out of 10,306 (cases 164, 1291, 1327, 2165, 2796 and 1669, `a3-diff-a14-summary.txt`). Both answers keep every letter.
- **A third line edited in the replacement that removes both lines.** When a change removes both lines and, in the same replacement, retypes the next line's first letter, and that line holds the pair's letters in order, the reading takes that line as the merge and glues the other side's text into it in both orders (`a3-cases-r3fix-a5.log`, P1t; the differential's cases 666, 1061, 1164 and 2375). When the same change instead changes the next line's type, one order now gives the expected heading and the other drops the merging change, as base does in one order (P1h). Bob's undo through two Yjs peers over the same edits matches base (`a3-judge4-a1.log`). One generated case, 3104, glues because `between` aligns the third line onto the pair.
- **An emptied first line removed while the same change drops, retypes or renews the next line.** The reading takes the line left as a merge, because it no longer keeps every property of the second line, and the transform converges on the glued text where base keeps two lines (`a3-cases-r3fix-a5.log`, G2, G1r and P8). By value, G2 is the same change as an accept that joins and drops a property, C4 beside Ann, which must re-home. No live package assigns node ids.

Base's own behavior when a peer removed both lines is kept: Bob's undo there brings back both removed lines and drops the peer's typing in a third line on both peers (`a3-proto-false-a1.log`, F1 to F3 and F6). That is a separate defect, under Open work.

### Blast radius and rollback

The change is inside `RootChange.transformInDocument`'s re-home branch, which runs only when one side merges two blocks around every edit of the other side. Its readers are history's replay (`history-replay.ts:425-510`), the public `DocumentChange.transform`, the Yjs import's rebases and `src/diff/lib/compare.ts:834`. Rollback is reverting the two files, which gives the reading at `ca9f418a00` and its 10 red tests.

## Steps

- [x] Run the third arena's runners on the merger reading. Proof: `docs/plans/artifacts/2026-10-17-held-editing-deletion/architect-3/runner-astra.md`, `runner-sol.md` and `runner-opus-a2.md`, and the `architect` rows in the decision log.
- [x] Prototype the value reading and measure it against base and the reverted reader. Proof: `a3-proto-tests-a2.log` (181 of 181 in the three suites that hold the 10 red tests), `a3-proto-cases-a2.log`, `a3-proto-false-a1.log`, `a3-record-*-a1.log`, `a3-slow-*-a1.log` and `a3-proto-perf-a1.log`, all under `docs/plans/artifacts/2026-10-17-held-editing-deletion/`.
- [x] Probe a coarse merge over 80 changed lines whose window holds another line with the pair's letters in order, and leave out any block the merging side left unchanged. Before the rule, the prototype landed Bob's `X` in an unchanged filler `abcd` and refused a full merge beside one (`a3-filler-before-a2.log`, W1 to W3). After it, W1 falls back to base's tree, W2 and W3 land `abcXd` in the merged heading, and W4 stays the named limit (`a3-filler-after-a1.log`). The three suites still pass 181 of 181 (`a3-unchanged-tests-a2.log`), and all 128 case lines of `a3-proto-cases-a2.log` and `a3-proto-false-a1.log` are unchanged (`a3-unchanged-cases-a2.log`). Proof: those logs and `architect-3/prototype-unchanged.patch`.
- [x] Fold the cross-judge's verdict into Arena synthesis and run each must-answer probe it names before the pick. Proof: `architect-3/judge/verdict.md`, `a3-judge-a1-a1.log`, `a3-judge2-a1.log`, `a3-judge3-a1.log` and `a3-judge4-a1.log`, and the `architect` rows in the decision log.
- [x] Run the panel on this plan, round 0, and settle each finding in the prototype. Proof: the round's `seats` row and one row per critical finding in the decision log; `panel-plan-3/r0/`; `a3-cases-r3fix-a5.log`, `a3-r3fix-tests-a4.log` (181 of 181), `a3-diff-a14.log` with `a3-diff-a14-summary.txt`, and `architect-3/prototype-r0.patch`.
- [x] Run the panel on this plan, round 1, with the Codex seats, on what round 0 changed. Proof: the round's `seats` row and one row per critical finding in the decision log; `panel-plan-3/r1/seat-opus.md`, `seat-astra.md` and `seat-sol.md`, the reruns in `panel-plan-3/r1/rerun/`, and the pivot row that settles its criticals.

The steps below are superseded. The fourth arena's design, which `2026-10-18-join-travels-as-join.md` adopts, replaces the value reading, so none of them runs.
- [ ] Build the reading and the rebuild in W from the prototype's diff, `architect-3/prototype-r0.patch`, without its debug lines and with the grafts the synthesis picks. Add each test below that the three files lack, in both orders for a transform: in `document-change-structural-transform.test.ts`, a merge with a level change, with an alignment, with two links relinked, through the public transform, a merge 80 blocks away from a line the other side types in, a whole-document flat merge, an emptied line removed on either side, a swap, a split, a removal and a retype; in `authored-tree-collab.test.ts`, plain and beside Ann, the batch with 80 changed lines above, below and between, the callout and quote type changes, and two undos after the Carol accept; in `test/yjs/merge-node-contract.spec.ts`, the emptied-line cases with ids and with an alignment, an older entry after a merge, a redo, two merges in one update, a merge with a line added, and both lines removed with typing in a third line; and in `document-change-structural-transform.test.ts`, the four filler cases at 80 lines. Add the grafts: the level-change merge, the 80-block merge and the whole-document merge, each with the merging change built by `between`, flat, composed, and serialized then read back, in both orders; a second line copied while it stays; two identical destinations, which refuse; a retype and a real merge with the same changes, which give the same answer; the judge's P1t, P1h and P8 cases as their limits' answers; plan panel round 0's cases, E4h, E6 and O1 for the edge insert, D, D2, D4, R80d and E1, plain and beside Ann, for a changed decoy, L1d and S6 for links, G1, G1m, G1p, G2 and G1r for an emptied line, K1, P2, P3, and the differential's cases 269, 297, 829, 2439 and 2859, plus a test that joins a restored bold line and a merged plain line without restyling either; a generated differential of 3,000 cases in four encodings and both orders, which must fix every row it fixes on the prototype and regress no row beyond the Limits' cases; and a work-count test that reads `wholeReadNodes` from `readCoreWork` during the undo over the quote join at 1,000 and 10,000 blocks and fails when it grows with the document. Proof: the 10 red tests fail at `ca9f418a00` and pass after; each new test passes after; the work-count test fails at base `dc06078008`, or the build records that the counter cannot tell base from the build and drops it; and a test that already passes at `ca9f418a00` fails on its named mutant: the empty-line refusal dropped, more than one match accepted, the kept-second-line refusal dropped, the copy beside the match not required, the merging side built as one diff of the two documents, its property update dropped, the target built with the first line's properties, the window kept to the pair's own siblings, edge inserts left out of the window, an edge insert copied again outside the window, the held rule dropped, the place bound dropped, inline elements counted as candidates, the loose tier's neighbour check dropped, and the junction's empty text dropped only when its marks match.
- [ ] Scale gate on the built tree. Run `node .agents/rules/benchmark/scripts/paired-timing.mjs` with base `dc06078008` in a worktree from `node tooling/scripts/proof-worktree.mjs` and the built tree, loadLimit 6, a planted arm that adds a walk of the whole document at the top of `RootChange.transformInDocument`, and a same-code arm that is a second copy of the built tree. Cohorts and frozen ratio budgets, built over base: a transform touching text with no merge, at most 1.10; a merge beside a block insert, which the re-home does not take, at most 1.05; a merge beside an edit inside the lines, sent as Yjs, at most 1.0; a whole-document flat merge beside an edit inside the lines, at most 1.0; a whole-document replacement that removes the pair, which the reading refuses, at most 1.10; a merge that also centers every later block, built by `between` and composed from a removal, an insert and a property change, at 4,000 and 16,000 blocks, at most 1.0; a whole-document flat merge over 20,000 empty lines, at most 1.0; the 10,000-block undo over the quote join, plain and beside Ann, at most 1.0, each with its tree asserted before it is timed. The composed cohort also runs W at `ca9f418a00` as a third arm, which the prototype beat at every size on a loaded host (`a3-perf-w1-final-a1.log`). Proof: the runner's measurements file and exit status. A conclusive miss sends the target back to `architect`; an inconclusive result stays a gate in this step.
- [ ] Run `deslop`, then `no-comments`, on the two source files, and the panel on the diff (reviews: `push`, a Plite core change). Proof: the `writing` rows, the round's `seats` row and one row per critical finding.
- [ ] Rewrite the undo law's bullet in `docs/vision/plite.md`, the `.changeset/join-keeps-target.md` sentence about the undo, and the re-home's Main changes bullet, Defaults row and ledger row in `2026-10-17-join-keeps-target.md`, so each names the value reading and these Limits instead of the first line's type. Proof: the docs diff and its `unslop` pass.
- [ ] Return to `2026-10-17-join-keeps-target.md`'s remaining steps, its Checks and its close. Proof: that plan's own boxes.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Arena and cross-judge | yes | Three runners, an anonymized judge, the base and grafts recorded | `architect-3/judge/verdict.md`; the must-answer probes in `a3-judge*-a1.log` |
| Plan panel | yes | Up to three rounds, each finding settled | round 0 settled: `panel-plan-3/r0/` and its rows; round 1 pending |
| `verify` loaded before the first proof gate | yes | This build's own load | pending |
| Red tests at base | yes | The 10 red tests fail at `ca9f418a00` and pass on the build | `r2-reverted-tests-a1.log`; build pending |
| Mutation of each check | yes | Each named mutant fails its test | pending |
| Scale gate | yes | The paired-timing run in its step | prototype only: `a3-proto-perf-a1.log`, on a host other sessions loaded |
| Full, record and slow suites | yes | No new failure against base | prototype: the same 5 record and 2 slow failures as base and W |
| Writing passes | yes | `deslop` and `no-comments` on the code, `unslop` on the docs | pending |
| Panel on the diff | yes | The `push` row for a Plite core change | pending |
| `best-api repair` | no | No public call shape changes | N/A |

## Open work

- Bob's undo after a peer removes the two lines he edited, with or without the peer's typing in a third line, brings both lines back and drops the peer's typing on both peers, at base `dc06078008` (`a3-proto-false-a1.log`). owner: zbeyens. stop: a session card at this plan's close.