# A rejected Enter rejoins the same way in every click order, sixth iteration

Status: superseded by docs/plans/2026-10-27-split-rejoin-order-7.md
Topic: cut-join
Playbook: plan

Pivot from iteration 5, `docs/plans/2026-10-26-split-rejoin-order-5.md`. Round 1 of its plan panel reproduced four failures of the sealed chain that next does not have: a re-proposed change id, a suggestion that also changes an outside paragraph, two peers deciding a link's last two suggestions before syncing, and a link cut in distant paragraphs or two roots. Fixing them needs a new owner for the landing and for what a sealed region holds, so the run went back to `architect`. Its arena picked a sealed review unit that only one decision lands. Next moved 92 commits past this run's base, and six of them changed the authored resolver, settle and admission, so this iteration builds on current next.

## Brief

### What will change?

Iteration 5's review found four ways a rejected Enter still rejoined differently by click order. Now deciding the Enter applies everything on its link together, so every order and collaborator agree, and no two suggestions there need one call.

### What could go wrong?

The Enter waits for every suggestion on its link and in the run of suggested paragraphs around it, however long. Undoing a link decision after the Enter lands brings nothing back. Older editors may apply saved decisions early.

## Teach

A suggested Enter inside a link cuts it into pieces. Other suggestions can unwrap, empty, remove or rewrite a piece. Rejecting the Enter joins the pieces back.

Today each decision changes the document at once, so a decision on one piece changes what a later reject sees, and click order changes the joined link. Iteration 5 froze the link until its last decision, but two reviewers could each make a last decision, and then nobody applied them.

Now the Enter is the one decision that applies the link. Every other decision on it is saved and waits. Deciding the Enter waits until those are decided, then applies them all together, as deciding everything at once would. Only that one decision changes the document, so every collaborator sees the same link. A paragraph with no suggestion ends the wait, so two links one plain paragraph apart are decided on their own.

## Main changes

- A live cut of an inline element, pending or decided and waiting, seals a unit of top-level blocks, derived from marks and verdict records with nothing new stored. The unit holds every block, in any root, that names a live incarnation of its blocks, on each side every neighboring block with a live suggestion mark or an Editing mark that waits on a pending change, stopping before the first block with neither, and every root a block in it owns, marked or not. Live means a mark the landing will consume, not a reference the ledger keeps after a landing. A block with neither survives every outcome and no decision changes it, so a cut's pieces on its two sides never join, the unit needs no block past it, and two cut links one such block apart form two units. The lander is the unit's smallest pending cut incarnation that still marks a block of the unit.
- `decideOn` in `packages/plitejs/src/authored/authored.ts` routes a call before it resolves. A member that is not its unit's lander stores its verdict records, changes no content and returns its id. A lander whose unit still has another pending member returns `blocked` with those members. A lander whose unit has nothing else pending lands it: the call's one resolve takes every member's verdict, stored ones included as call verdicts and hidden from the facts it reads, so the landing is the at-once decision. Withdrawing a member stores its reject the same way. The order check's step helper uses the same routing.
- The ledger keeps the units between syncs and updates them from what each sync changed. An edit that adds a claim, a name, a block or a content root grows a unit in place. A removal shrinks it in place, or splits it by searching outward from the broken link, and a unit that loses its last live cut ends. Two cases rebuild one unit instead: a unit that owns a content root and loses a root or a link, and a removed suggestion that more than four blocks still name. Each unit keeps its waiting members and how many verdict records they hold, so hiding their verdicts is a lookup, and an edit does no work in a unit it does not touch. Nothing derives while no suggestion mark has a stored verdict, and the ledger counts every visit before any cache.
- The resolver's call outcome takes the mark's incarnation instead of its change id, at every site that reads it, and probe assignments key by incarnation, so a re-proposed change id never takes an older incarnation's verdict.
- A view of the document's facts hides waiting members' verdicts without copying the verdict records. Admission, load, historic repair, compaction, review and content reads, the document that Editing and Suggesting commands edit, and a decision's resolve all read through it. So a peer that receives a member's verdict changes no content, and a waiting member keeps the marks it had before its decision and reads as pending.
- A member that stops waiting takes its saved verdict in the commit that frees it. A local edit lands it there, such as an Editing delete of the link's last Enter. An undo, a remote import or a load lands no unit and settles the member as a verdict it receives, by next's rules for a stored verdict. A member that a concurrent change moves out of every unit, such as an Editing delete of the last Enter or a plain paragraph inserted before it, follows the same rules: an accepted one settles when it arrives, and a rejected insertion shows as pending again until it is decided again.
- The order check's unwrap family can add a paragraph after the link's, which any change may remove, type into or join into the link's paragraph, a second cut link after a plain paragraph, and a quote around the link's paragraph, so a unit that misses a neighboring block, drops a decided cut or misses its container fails it.
- The review list skips a waiting member, decided and not landed, at a path, a point or a range.
- Deciding at once takes iteration 4's results for an unwrap of a piece: an accepted unwrap of one half leaves only that half without the link, and the other half takes back what the split dropped. Text typed between the halves joins the rejoined link, as on next. An element between them keeps them apart, and one the decision unwraps keeps them apart only through text it lifts out, so an unwrapped element the decision also empties lets them rejoin.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who applies a cut link's decisions | The reviewer who decides the Enter, once nothing else on the link is pending (look) | Every editor works the document out from the saved decisions, which needs a new saved shape and editing through a derived view | retained source | big |
| What a reviewer sees after deciding a suggestion on a link that waits | It leaves the review list and keeps its suggestion marks until the Enter is decided (look) | A new waiting status on the suggestion, which is a new public read | waiting state | big |
| Suggestions in the suggested paragraphs around the link | They wait with the link (look) | Only the ones that join, remove, split or wrap beside the link wait, once a check proves the rest never change the rejoin | narrow reach | small |
| A suggestion that touches the link and also changes something else | All of it waits for the Enter | The outside part applies now, which needs a wait wherever the outside reads the link | split change | small |
| An accepted unwrap of one piece of a rejected Enter | Only that piece loses its link, as iteration 4 decided | Next's results, where the unwrap is lost or spreads to the other piece | next unwrap | small |
| Plain text between the pieces of a rejected Enter | It joins the rejoined link, as on next since 2026-10-10, also when an edit unwrapped it; a suggested unwrap decided with the Enter keeps the halves apart | It stays plain between two links, as iterations 3 and 4 did for their held cut | text apart | small |
| A waiting link whose last pending Enter an edit removes | Its saved decisions apply in that edit | They stay saved and unapplied | keep saved | small |
| A suggestion decided on one editor while another editor's change moves it away from its link | Once the two sync, an accepted one applies and a rejected insertion shows as undecided again until decided again, as today (look) | The editor that receives any such decision applies it | land on import | small |
| Undoing a decision on a link after a collaborator decided its Enter | The undo says it applied and removes the saved decision, but brings nothing back, because the collaborator's decision already applied it; next brings the suggestion back (answer) | The undo is skipped as a history conflict and says blocked, as the review law asks, which needs a conflict path in undo that nothing has today | undo conflict | small |
| A keystroke that frees waiting members | It works out the whole document once, as deciding does on next (look) | Working out only the freed members' paragraphs, which needs a new resolver mode | scoped release | small |
| An edit that may split a unit | It searches outward from where the link broke and pays for the part that splits off; if the parts still connect, the search runs until they meet, at most the unit's size (look) | An index of which paragraphs connect, about 1,000 lines | connectivity index | small |
| Telling the reviewer that a rejected Enter's halves stayed apart | The docs explain it, and the decision's answer stays the same | A diagnostic for each Enter whose halves stayed apart, saying why | report apart | small |
| An older editor that opens a document with a waiting link | It may apply the saved decisions early, and in a shared room every editor gets that, with no version check (look) | Refuse such a document in an older editor | version gate | small |
| After the plan panel | Build right away | Stop after the plan | hold | detail |
| The cut-join page's link https://claude.ai/artifact/FMQi4YLD6BWqunYB84k26w no longer opens | A new page at https://claude.ai/artifact/NHiZFfaVWxKpJN8s6awMWL takes its place | Publish no page for this subject | no page | detail |

## Evidence

### Requirements

- [ask] A rejected split's rejoin must not depend on decision order (the task's title).
- [ask] "a suggested unwrap of an element between a rejected split's halves still changes the rejoin by decision order", and "the answer must read whether the element between survives the decision, for a pending unwrap and an accepted one in the same batch". A pending unwrap of the element is a member of the link's unit, so deciding the Enter waits on it. Accepted in the same call, the element's text survives between the halves, which stay two links. An element the decision both unwraps and empties lets them rejoin.
- [ask] "The rejoin answer must say what a decided unwrap of one half leaves after the reject". That half alone becomes plain text, and the other half keeps the link and any ref the give-back returns.
- [ask] "The rejoin answer must say what moved text and an unset property read". Moved text and an unset property are judged in their final place. An unset is an absence, so the final place's default can show, as `docs/plans/topics/cut-join.md` already says. An accepted unset of the ref on the right half leaves the key empty, so the ref the rejected Enter gives back fills it, as next does at once.
- [ask] The task's first finding: the rejoined line's type must not depend on decision order or clock skew. `keepsContent` counts every removal the decision accepts, with no clock read, as iteration 1 decided.
- [ask] The task's third finding: decide whether `decide` or a diagnostic should tell the reviewer that the halves stayed apart. The docs explain it and `decide`'s answer stays, as iteration 2 decided, because the document shows why: the values differ, an element sits between them, or the left half is gone.
- [ask] The task's second, fourth and eighth findings, keep both halves, paragraph tones, and moved text with an unset property, keep next's answers, as iteration 2 decided.
- [law] Deciding one at a time in any admissible order equals deciding the same verdicts at once, and no coupled set next lacks appears (the `authored-decision-order` skill's property).
- [law] Two collaborators converge on suggestions and decisions (`docs/plans/2026-10-08-authored-review.md`).
- [premise] Iteration 4's at-once results for an unwrap of a piece are the right ones, and next's are not. This is the lead's conclusion from the two cases in Controls at base.

### Critical findings this iteration takes over

The first three are `open` critical findings in iteration 5's decision log with this plan as their patch, and the fourth is a warning there that this plan's design takes on.

- Opus, astra and sol: a re-proposed change id let one incarnation's verdict decide another's marks. Verdicts are now read per incarnation everywhere, call outcomes included.
- Astra: a suggestion that notes the link and removes an outside paragraph, with a join of the next paragraph into it, gave a coupled set next lacks and erased the outside paragraph early. The unit now holds every block its members name and every block a landing reads, so the whole suggestion waits with the link and nothing outside lands early.
- Opus: two peers deciding a link's last two suggestions before syncing left it unlanded. Only the Enter's decision lands a unit, and it waits while any member is pending on the deciding peer, so a decision on another peer can only be a saved member verdict.
- Astra: a link cut in distant paragraphs or in two roots landed one part early. The unit holds every block that names the cut, in any root, and the suggested blocks beside them.

### Design

`architect` ran an arena of three runners on the outcome, the four reproduced failures and the panel's warnings: opus, gpt-6-astra and gpt-6.1-sol, each at xhigh. Astra and sol proposed retaining the recorded source and deriving the visible document from it and the saved verdicts. Opus proposed a sealed unit that only its lander lands. The lead scored sol 17, opus 15 and astra 17, and an anonymized cross-judge scored them 16, 15 and 18. Both picked opus's as the base. The retained-source designs make the editing view a projection that every command must lower back to source, which `docs/plans/topics/authored.md` forbids for previews today. They also change what the saved value means, keep history with no compaction and drop the `blocked` result `docs/plans/topics/cut-join.md` promises. The judge's one objection to the base was that two peers landing the same unit duplicate the paragraph. That reproduces on this run's base and not on current next, which converges for identical concurrent decisions after `0335ef66c7`.

Grafts: the review list and paint of a waiting member (the `waiting state` Defaults row keeps the plain form); every visit counted before any cache lookup (sol, astra, judge); two-peer tests that a member decision sends only records (sol, astra, judge); re-proposed ids on two peers and three peers deciding three suggestions (astra); undo of a member decision and of a landing (sol); live incarnations as the marks a landing consumes (judge); dissolution in the same commit (opus, judge). The structural check that a landing reads nothing past its unit (astra, judge) is not built: the order check's families with a paragraph, a second cut link and a quote beside the link check the closure instead, with planted controls for the paragraph and second-link families; the quote family has none.

Grounding on current next changed two parts of the base. The resolver reads across blocks transitively, back over removed and merging lines, through followers, completion, spares and the blocks between a cut's pieces, so opus's hand-kept list of neighbor reads could not match it. The unit instead grows on each side up to the first block with no live mark, which every outcome keeps and no read crosses, and leaves that block out. The same rule covers the blocks between a cut's pieces: round 1's build first added them all, and a search of 273 documents with plain paragraphs between the pieces found no result that needed them, only an Enter blocked by an unrelated suggestion two plain paragraphs away. And the landing goes through next's own decide path with every member's verdict, instead of a separate scoped resolve, so it is the at-once decision by construction.

### Controls at base

- On current next with this run's unwrap family ported, the order check's gate gives the counts it gave on this run's base: quotes 0 failures and 66 coupled sets, give-back 0 and 1,105, unwrap 12 and 96. The unwrap family at three changes and three operations gives 738 failures and 1,852 coupled sets on both, with the same coupled sets.
- Iteration 4's cut tests on current next: 79 pass and 37 fail. At once, an accepted unwrap of the right half gives one link `ab@u#r1` where iteration 4 gives `a@u#r1` and plain `b`, and an accepted unwrap of the left half gives plain `ab` where iteration 4 gives plain `a` and `b@u#r1`. An element between the halves whose unwrap is accepted gives `a@u`, `x` and `b@u` at once on next too, and one link `axb@u` only in an order that accepts the unwrap before rejecting the Enter.
- The four reproduced failures fail on iteration 5's prototype and pass on next at this run's base.

### Prototype

This section is the merged prototype's, before plan panel round 1's fixes. The prototype on current next derives units for each synced document, routes `decideOn`, reads outcomes per incarnation, hides waiting members' verdicts from admission, historic repair, compaction and load, and carries the at-once results in Main changes.

- The 13 round 1 probes pass, each now asserting that every order ends where deciding everything at once ends, and that a reload reads the same.
- The order check finds no failure and no wait outside a unit in any family run, and every coupled set it finds is also one of next's at that bound:

  | Family and bound | Comparisons | Coupled sets, prototype and next | Next's failures |
  | --- | --- | --- | --- |
  | Gate | 27,204 | 64 and 1,267 | 12 |
  | Quotes, three marks | 303,066 | 2,340 and 2,362 | 0 |
  | Quotes, three blocks | 137,284 | 358 and 372 | 0 |
  | Give-back, three changes | 9,632 | 0 and 1,303 | 0 |
  | Unwrap, three changes and three operations | 72,984 | 0 and 1,852 | 738 |
  | Same, with a paragraph before the link | 42,928 | 0 and 724 | 1,444 |
  | Same, with a marked paragraph after the link | 157,008 | 0 and 2,408 | 600 |
  | Paragraph Enters, mixed keys, three changes and two operations | 7,816 | 0 and 508 | 0 |

- The six round 3 scripts each give no failure, no coupled set and no wait.
- Dropping the reach to the first unmarked block fails the family with a marked paragraph after the link at two changes and two operations, with 16 failures. In one, a change joins that paragraph into the link's and another types into it. One at a time gives `q` and `z`, and at once gives `qz`. Every other family still passes without the reach.
- Every value decided with nothing pending equals the at-once port's for the same verdicts, 97 decides.
- Unit derivation stays flat between 100 and 2,000 blocks for every case the work test counted, all with a one-paragraph unit. Round 1 of the plan panel found it quadratic in a unit's size, uncounted: with one suggestion spanning every other paragraph, a review read took 1,537 ms at 2,000 blocks against 0.5 ms on next.
- A decision inside a root that an unmarked card beside the link owns waits for the link, as a load already did; without the owned roots of unmarked blocks, deciding it landed it early.
- No test through the public API could make shown-value settlement or a spare transition change content while a unit waits, so neither changes.
- A rejected insertion that reaches a peer after another peer's Editing delete removed the unit stays saved and unapplied, even after a later local edit on either peer, and shows as pending again; deciding it again there applies it.
- 19 of next's authored tests assert behavior the unit changes: a decision on a cut link landing alone, rejecting an Enter while a suggestion on its link is pending, a member settling on load or when its verdict arrives, and withdrawing an Enter whose copy is pending. On current next, 17 of them are rewritten to the unit's behavior and 2 are cut because no unit can reach their state; one of the cut tests, a correction that removes a middle piece, gave `ac@u` on next and gives `amc@u`, deciding its three suggestions at once.

### Plan panel round 1

Opus, astra and sol each reviewed this plan and the prototype. Four critical findings, each reproduced on the prototype and absent on next:

- Sol: a decided cut stopped seeding its unit, so two links' merged unit split and a saved reject applied early. Units now start from every live cut.
- Opus: unit derivation walked a name's blocks once per block that holds it. It now expands each name once and counts the walk.
- Opus, with sol as a warning: a decided member lost its paint, so an accepted deletion looked rejected. Review reads now hide waiting verdicts.
- Astra: undoing a member decision after another peer landed its unit could not bring the suggestion back, where next can. Round 1 kept this on `docs/plans/2026-10-08-authored-review.md` line 246, which skips an undo step whose marks a peer already decided. Round 2 found that the undo still removes the saved decision and reports that it applied, where that line asks for a history conflict. The `undo conflict` row now leaves the call to the owner.

The build fixes the first three, each with a test that fails before its fix, and a records-only decision returns the member's id. With nothing waiting, a letter and a review read derive no unit at 100 or 2,000 blocks, and a letter outside every unit reads the same 2 blocks at both sizes. A letter inside a unit that one suggestion spans across 2,000 blocks, with a member waiting, derives that unit again: about 6,000 block reads. In single samples on a loaded machine, the first letter after the decision took 7 to 43 ms and the next one 1.4 ms, against 1.1 to 2.2 ms on next. After the fixes, the unwrap family's pair, paragraph-Enter pair, quote and outside starts at two changes and two operations gave no failure and no coupled set.

### Plan panel round 2

Opus, astra and sol reviewed round 1's fixes on the build. Three critical findings:

- Astra and sol, and opus as a warning: work grew with unrelated waiting units and with the size of the unit an edit is in, and none of it was counted. Each admission pass and each new value's first review read copied the verdict records without the waiting ones, the ledger copied a document-wide waiting set, dissolution walked every member that had waited, and a letter inside a unit rebuilt it. The finding is in round 1's fix, so `architect` designed its replacement. Its arena ran the three seats' models; the lead and an anonymized cross-judge both picked opus's design, which keeps waiting members in each unit, hides their verdicts through a view and updates units in place.
- Opus: a point or range read of the review list threw on a waiting member. It now skips them.
- Opus: an undo, a redo or a remote import that took a waiting member out of its unit never applied its saved verdict, so peers differed from a reload. Every commit kind now applies it.

The warnings changed the reach. An Editing join that waits on a pending deletion now extends it, because accepting the deletion moves that paragraph, and the reach stops before the first block with no live mark, so two links one plain paragraph apart form two units. Content reads now hide waiting verdicts as review reads do, a landing names each member once, and the undo row became the owner's call. The order check now also decides each order on one editor that keeps deciding and compares it with a fresh load after every step; it added a start with two plain paragraphs between the links, one where the paragraph between holds a pending suggestion, a quote with a paragraph after it, and a paragraph whose only claim is an Editing join.

All 13 work cohorts failed on round 1's fixes, with work growing 15 to 20 times from 100 to 2,000 blocks. On the built redesign, each does the same work at both sizes. Four planted faults each fail their cohorts: a scan of every verdict, a copy of the waiting sets, a rebuild on every grow, and dropping the units when a root changes. A property test of random edits, decisions and undos checks after every step that the kept units equal a full derivation, over 25 seeds of 200 runs each, and a planted fault in its join step fails it. The authored suites (1,640), Plate's authored tests (113), the typecheck, lint, the gate with an unchanged baseline and all nine unwrap-family runs pass with the same counts as before the redesign. The document that Editing and Suggesting commands edit now also reads the hidden verdicts, because a decision on a waiting member otherwise broke the recording law.

## Steps

- [ ] 1. Port the order check's unwrap family onto next, with the pending review list in each compared step, the check that no decided change stays listed, the marked paragraph after the link, a second cut link after a plain paragraph, and a quote around the link's paragraph. Proof: next's gate counts above, and next's counts for the unwrap family at three changes and three operations, with and without each paragraph beside the link, and for the second link and the quote at the bounds step 8 runs.
- [ ] 2. Read call outcomes per incarnation. Proof: the re-proposed id probes, inline and Enter, in every order, fail on iteration 5's prototype and pass.
- [ ] 3. Derive units and route decisions. Proof: the reproduced probes for an outside dependency, two peers, distant blocks, two roots and two links whose units merge after one Enter is rejected, inline and paragraph Enter, each in every order, and the six round 3 scripts as single order-check scripts; each compares every step with deciding the same verdicts at once, and each fix's test fails on the code before it.
- [ ] 4. Keep a unit as recorded through admission, load, historic repair and compaction, and land it on dissolution. Proof: a peer receiving a member's verdict, a load of a waiting unit, an undo of a member decision and of a landing, an undo of a member decision after another peer landed the unit removing only the saved decision, an Editing delete of the last pending Enter, a member that a concurrent change moves out of every unit once accepted and once rejected, a decision inside a root an unmarked block of the unit owns, and an accepted deletion, a rejected url and an accepted and a rejected unwrap of a piece each painting as before its decision while it waits, each leaving content and review reads as the step says.
- [ ] 5. Take iteration 4's at-once results for an unwrap of a piece. Proof: iteration 4's cut tests' at-once values on next, except those with text typed between the halves, which keep next's, and next's authored tests apart from those whose at-once value this changes, each listed; each kept rule fails a test when reverted.
- [ ] 6. Hold the peers. Proof: two-peer and three-peer tests on the Yjs harness, with a member decision sending only records.
- [ ] 7. Keep the work budgets. Proof: `packages/plitejs/test/authored-tree-work.test.ts` whole, counting every visit before any cache lookup and every copied record or set entry, at 100 and 2,000 blocks. No unit work while nothing waits. With 25 and 500 waiting units, a letter inside one unit, a letter outside every unit and each review read after it cost the same at both sizes. With one suggestion spanning every other paragraph and a member waiting, a letter and a Backspace cost the same at both sizes, apart from next's holder search. An Editing Enter that splits a unit costs the part it splits off, and a keystroke that frees members runs one resolve. Each of these fails on the code before the change. The units kept between syncs equal a full derivation after every step of a random edit sequence. A review read and a keystroke at 2,000 blocks with one suggestion spanning every other paragraph, timed against next per the `benchmark` skill. `/pstack:correct` on the class of the "Per-keystroke work stays bounded as the document grows" row of `docs/development/enforcement.md`, whose rule-only part this run's unit work broke twice.
- [ ] 8. Hold the order check. Proof: the gate after `--lower`, quotes at three marks and at three blocks, the give-back family with three changes, the unwrap family at three changes and three operations, with a paragraph before the link, with a marked paragraph after it, with a second cut link one and two plain paragraphs away and through a suggested paragraph, inside a quote, inside a quote with a paragraph after it, and after a paragraph whose only claim is an Editing join, each also decided on one continuing editor, with no failure and every coupled-set identity also in next's file for that bound. Planted controls: without the reach, the family with a marked paragraph after the link must fail; with units seeded only from pending cuts, the second-link family must fail on the start whose paragraph between holds a suggestion; and with units never updated between syncs, the continuing editor must fail.
- [ ] 9. Hold Plate and the suites. Proof: every Plate authored test, the plitejs authored suites, the plitejs typecheck, `pnpm lint:task` on the changed files, and one hand drive of the suggestion demo per the `verify` skill, in which a decided suggestion on a cut link keeps its paint until the Enter is decided.
- [ ] 10. Write it down. Fold this plan into `docs/plans/topics/cut-join.md`, update the `authored-decision-order` skill, add a changeset, and say in `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin, per the `plate-docs` skill, what deciding a suggested Enter inside a link waits on, what its link shows meanwhile, that undoing a decision on it after a collaborator's decision applied the link only removes the saved decision and brings nothing back, and what an unwrap of a piece, content between the pieces and halves that stay apart give; the JSDoc of withdrawing a change says it stores its reject while the change waits. Proof: `pnpm run prepare` with the resource sync check, the docs checks of `pnpm check --affected`, and `plan-page.mjs --folded`.

## Open work

- Outside units, a decision still resolves the whole value, as on next. Owner: zbeyens. Stop: a work budget a decision outside units misses.
- A unit reaches over every neighboring paragraph with a live suggestion, though only one that joins, removes, splits or wraps beside the link can change the rejoin. Owner: zbeyens. Stop: the `narrow reach` word, with an order-check family that proves the narrower reach.
- Two reviewers who decide the same members differently while offline, then each reject the Enter, both land, and the synced link drops the accepted values that deciding all the verdicts at once keeps. Astra and sol reproduced it on next too, so the unit does not cause it. Owner: zbeyens. Stop: a two-peer test where the synced link equals the at-once result.
- When an edit moves one half of a cut link into a card's own root, rejecting the Enter gives the dropped ref to both halves, on next too, because the resolver finds no left half across roots. Owner: zbeyens. Stop: a test where only the left half takes the ref.
- No structural check proves a landing reads nothing past its unit; the order check's families and planted controls stand in for it. Owner: zbeyens. Stop: a landing that reads past its unit in any family.
- Nothing reports a history conflict: `HistoryOutcome` declares `blocked` with conflicts, and no code on next or here returns it, so an undo whose marks a peer already decided applies what it can. Owner: zbeyens. Stop: the `undo conflict` word, or a report of such an undo.
- Each change keeps its holder blocks in a sorted array on next, so removing one block of a change that spans the document searches in log N steps and shifts the array without counting it. Owner: zbeyens. Stop: a keystroke budget missed on a change that spans thousands of blocks.
- A name's blocks are found by asking every content root, as next's review reads already do, so a document with many cards pays per card when a suggestion first appears. The walk is counted. Owner: zbeyens. Stop: a work cohort with many cards that misses its budget.
- The order check records no edit between two decisions, so a ledger that misses an edit's note is caught only by the work file's comparison with a full derivation. Owner: zbeyens. Stop: the next change to the order check's lift family.
- The random edits of that comparison never make a block with one claim start to reach next to another unit's block, so a planted fault on that path survived it. The reach cohorts and the cut tests still cover the path. Owner: zbeyens. Stop: the next change to how units grow.
- An Enter in the text of a block that owns an exclusive content root, such as a card, gives the root two owners, which the schema refuses, so the Enter throws and the value stays as it was. A probe at this run's base refused it in 5 of 1,422 random steps, each an Enter, with or without review marks, and the build refuses the same steps. Owner: zbeyens. Stop: a report of a refused Enter in such a block.
- On next, an Editing join into a block holding a cut link, or into a struck block before one, fails the recording law that tests check, because accepting what it recorded does not put the caret where its commands did. It failed 4 of 5 probe cases at this run's base. Owner: zbeyens. Stop: a report of a caret that moves after such a join.
