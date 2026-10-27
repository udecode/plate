# A rejected Enter rejoins the same way in every click order, second iteration

Status: superseded by docs/plans/2026-10-24-split-rejoin-order-3.md
Topic: cut-join
Playbook: plan

Pursue, second iteration. Iteration 1, `docs/plans/2026-10-24-split-rejoin-order.md`, kept an unwrapped half out of its rejoined link. Round 2 of its diff panel and a new family of the order check for unwrapped link pieces showed that design makes 80 sets of suggestions a reviewer can only decide together, because rejecting the Enter waits on the unwrap while removing a piece waits on the Enter. This iteration starts again from next and keeps next's direction. An unwrap of a half waits on its Enter, and once the Enter is rejected the unwrap reaches the whole rejoined link, from either half. It keeps iteration 1's fix for an emptied first line. Any content between the halves keeps them apart, text included, so unwrapping a link between them gives the same result in every order, on one line or across two. Round 1 of the plan panel blocked this plan's first version, which made that unwrap wait on the Enter. The wait missed an Enter across two lines and formed two new cycles. This iteration also fixes a bug the new family found on next. The resolver's look-ahead at a pending suggestion read an Enter's verdict again and got another answer. Every probe case gives one result in every click order. At every gate bound, each family of the order check keeps next's coupled sets, compared one by one; at three unwrap operations it has 36 fewer, and each of its 12 new sets is the two-suggestion core of two sets next needs a third suggestion for. Four design runners and a blind cross-judge compared this design with keeping each piece's identity as stored facts, and the judge picked this one, the only one built.

## Brief

### What will change?

Rejecting an Enter gives one document in any order, even when other suggestions empty a line, unwrap a link between the halves or remove pieces. Unwrapping either half unlinks the rejoined link, and text typed between the halves stays unlinked.

### What could go wrong?

Rejecting an Enter and accepting "remove link" on one half unlinks both halves. A half's unwrap still waits for its Enter. A suggestion that types between the halves and deletes one must be decided with the Enter.

## Teach

Review stores a suggested Enter as a split of one line or link into two halves. Rejecting the Enter puts the halves back together. A reviewer can decide suggestions one at a time in any order, or many at once, and every way must give the same document.

On next, three cases break that. When another suggestion empties the first line, the rejoin compares the two edits' clocks. A link between the halves keeps them apart, but once its unwrap lands, the rejoin glues its text into the link, so the result follows click order. And a look-ahead at a pending suggestion can forget an Enter it already settled.

The fix drops the clock read and remembers each settled Enter. Any content between the halves now keeps them apart, text included, so an unwrapped link's text stays outside in every order. An unwrap of either half reaches the whole rejoined link, because rejecting the Enter makes it one link again.

## Main changes

- `keepsContent` in `packages/plitejs/src/authored/tree/resolve.ts` reads the first line's content from what the decision settles, with no timestamp read, so `deletesBeforeJoin`, `JoinMoment` and `joinOf` go. The right piece then stands in an emptied line's place, as it does when the deletion was decided first.
- A rejected cut finds its left half gone when the right half's line takes the place of the line a removal empties, so the right half gets back what the split dropped.
- `cutVerdict` hands each cut verdict the outer run settled to the probes it starts, so a probe that tries a pending removal both ways reads that cut as the outer run did.
- `verdictOf` in `packages/plitejs/src/authored/tree/halves.ts` keeps a cut's halves apart when content the decision leaves stands between them: an element, or text that is not empty. An element the decision unwraps counts only through what it lifts, so an unwrapped link between the halves keeps them apart through its text, before or after the Enter. The cut's look-ahead also tries each pending unwrap or wrap of an element between the halves, so the cut waits on one only when it changes the verdict. That happens when the same decision also deletes that element's text.
- `joinedShell` in `packages/plitejs/src/authored/tree/cuts.ts` keeps the right half's unwrap and wrap marks on the joined element unless the left half holds the same one, so an unwrap of either half reaches the rejoined link.
- An element the decision lifts out no longer waits on another unwrap or wrap of itself, since a rejoined link can carry one from each half.
- An emptied element that holds only text, inside a parent that takes text, no longer waits on its own unwrap or wrap, since emptying it and lifting its text out give the same document in either order. Otherwise emptying a rejoined link would wait on the unwrap it carries from a half. A line whose parent takes no text, such as a line at the top of the document, still waits, because the top of the document cannot hold its lifted text.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Unwrap of one half after a rejected Enter | The whole rejoined link loses its link, whichever half was unwrapped (look) | Only that half leaves the link, and some suggestions must then be decided together | stand apart | big |
| Unwrap of a link between the halves, or text typed there | The halves stay two links around the plain text (look) | The text becomes part of the rejoined link and takes its url, as next does with typed text. Then a suggestion that unwraps the link between and also deletes a half must be decided with the Enter | join over | small |
| A suggestion that types between the halves and also deletes one of them or all its text | It must be decided together with the Enter. Next already works this way when the suggestion adds a link there (look) | Let a deleted half be decided before its Enter, which changes how removals wait | removal first | small |
| An unwrapped link between the halves whose text the decision also deletes | The halves join, since nothing is left between them | Keep two links, as next does when both are decided at once | keep two | detail |
| Unwrap of a half the decision also removes or empties | The unwrap still removes the link from the whole rejoined link | The unwrap goes with the half, so the rest stays a link. That works only when one suggestion does both, since two suggestions would each wait on the other | empty lift | small |
| Accepting an unwrap of a half before its Enter | It waits for the Enter, as on next | It applies right away, and more suggestions must be decided together | unwrap first | small |
| Unwrap of the middle piece of a link split twice | It reaches each piece a rejected Enter joins it to | Only the middle piece leaves the link | middle apart | small |
| Rejected Enter after an emptied first line | The second line takes the first line's place, in every order | Store which half kept the line when the Enter happens | store split | small |
| Iteration 1's build | This iteration replaces it, and its code for unwrapped halves goes | Keep iteration 1 and accept 80 more sets decided together | keep iteration 1 | small |
| Telling the reviewer the halves stayed apart | The docs explain it, and decide's answer stays the same. The document already shows why: the values differ, an element sits between, or the left half is gone | Add a diagnostic for each Enter whose halves stayed apart, saying why | report apart | small |
| Where this answer lives | Its own plan on the cut-join page | Fold it into the authored page now | authored page | detail |
| A link half inside a removed element | Stays an open item of the cut-join page | Fix it in this run too | widen | small |
| After the plan panel | Build right away (look) | Stop after the plan | hold | detail |
| The cut-join page's old link, https://claude.ai/artifact/Y77WFp5kARVDo1GrdNAxH5, no longer opens | A new page at https://claude.ai/artifact/3QjHNd3Zgoh42nB8DCGYHt takes its place | Publish no page for this subject | no page | detail |

## Evidence

### Requirements

- [ask] The rejoined line's type must not depend on decision order or clock skew (finding 1).
- [ask] A suggested unwrap of an element between the halves must not change the rejoin by decision order, whether it is pending or accepted in the same call (finding 5).
- [ask] Say what a decided unwrap of one half leaves after the reject (finding 7).
- [ask] Decide whether decide or a diagnostic should tell the reviewer that the halves stayed apart (finding 3).
- [ask] Settle findings 2, 4 and 8 (keep both halves, paragraph tones, moved text and an unset property). They keep next's answers. Halves that differ both stay, a tone reads where its paragraph stands, and moved text and an unset property read their final context. Iteration 1's first probe checked each on next, and its W6 case gives one result on this build.
- [law] Deciding one at a time in any admissible order equals deciding the same verdicts at once, and no new coupled set appears (the `authored-decision-order` skill's property; `content/docs/(plugins)/(collaboration)/suggestion.mdx` line 263). Outside the order check's gate, one kind of suggestion must now be decided in one call with its Enter, where next decides them one at a time. The Defaults row "removal first" accepts it.
- [law] A rejected split gives back what it dropped in every decision order, whether or not its left half stands (`docs/plans/topics/cut-join.md`, last Main changes bullet). One case misses it in every order, as on next, and Open work names it.
- [law] The rejected-cut work budgets in `packages/plitejs/test/authored-tree-work.test.ts` hold; next reads exactly their caps.

### Lanes

- Control, no new artifact: keep next and state findings 1, 5 and 7 as limits. It loses because the docs promise the same document in any order, and next breaks that for an emptied first line, for an unwrap between the halves and for a link split twice whose pieces two changes remove.
- Iteration 1, an unwrapped half stands apart from its link. It loses on the order law: the unwrap family finds 80 sets of suggestions that only deciding together settles, which next decides one at a time, and round 2 of its diff panel found three critical bugs in the code that reads lifts from verdicts.
- Keep each piece's identity through the rejoin as stored facts, so an unwrap stays on the piece it targeted (two design runners). It loses for now: it adds a stored shape, its migration and a new materializer, and none of it is built or measured. The Defaults row "stand apart" names it.
- Carry both halves' unwraps onto the rejoined link and change nothing else (a third runner's design; the other two measured it). It adds 16 coupled sets, because two pending unwraps on one rejoined link then wait on each other.
- Make an unwrap of an element between the halves wait on the Enter, as this plan's first version did. Round 1 of the plan panel blocked it. The wait read only the siblings on one line, so an Enter across two lines still followed click order. One suggestion can also split a link and unwrap an element between another suggestion's halves, so two such suggestions wait on each other. So do an Enter past the probe cap and the suggestion that unwraps between its halves.
- Keep next's rule that text between the halves joins the link, and count an unwrapped link only through the elements it lifts (measured on probes). It also gives one result in every order, but the unwrapped text then takes the link's url, which the brief names as the defect. A suggestion that unwraps a link between the pieces and also deletes or removes one must then be decided with the Enter, which is likelier than typing there.
- Next's direction with the unwrap reaching the rejoined link, and any content between the halves keeping them apart (picked). The lead and the cross-judge picked the direction, which the judge scored 21 of 25 against 14 at best, and the content rule replaced the first version's wait after the plan panel. It adds no wait to an unwrap, so the panel's cycles cannot form, and it holds across two lines because it reads the joined line. The one wait it adds is the Enter's wait on a change to what stands between the halves. Next already makes a deleted or removed piece wait on its Enter, so a suggestion that types between the pieces and also deletes or removes one must be decided with the Enter. Next couples the same suggestion when it puts a link there instead of text. A lift no longer waits on another unwrap of the same element, which removes the 16 sets, and an emptied element of plain text no longer waits on its own unwrap, which removes 18 more at three unwrap operations.

### Dependents

- Plate's suggestion plugin and UI call `decide` through Plite's public authored API. Its call shape and result shape stay; the documents some decisions produce change, as Brief says.

Model: claude-opus-5-5 @xhigh

## Steps

- [ ] 1. Revert iteration 1's code for unwrapped halves to next. Proof: `git diff` against the base shows no change in `halves.ts`, `marks.ts`, `layers.ts`, `authored.ts` or `admission.ts`, and `cuts.ts` and `resolve.ts` carry only this plan's changes.
- [ ] 2. Keep each settled cut verdict in the probes. Proof: a cuts test with a link one Enter splits twice, one change removing the middle piece and another the last, in every order, failing at the base through `tooling/scripts/proof-worktree.mjs --expect-fail` and passing after.
- [ ] 3. Keep iteration 1's emptied-line fix. Proof: its decide-completion test and its cross-line removal test fail at the base and pass after.
- [ ] 4. Keep content between the halves apart from them, and let an unwrap of either half reach the rejoined link. Proof: cuts tests for an unwrap between the halves on one line, at the end of the first line and at the start of the second, text typed between the halves, an unwrap of the right half with a dropped ref, the half on the next line, and the middle piece of a link split twice under every verdict row, each failing at the base and passing after. The cuts test that joins accepted text typed between the halves into the link now keeps that text out. Cuts tests for the plan panel's cases, each failing on this plan's first version, whose source the run directory keeps: two suggestions that each split a link and unwrap an element between the other's halves, and an Enter past the probe cap. A cuts test that empties a rejoined link while the unwrap it carries is pending, which fails with the plain-text exemption removed, and one for two top-level lines that one suggestion unwraps while another empties the first, which fails with the exemption applied there.
- [ ] 5. Hold the order check and the budgets. Proof: `pnpm check:authored-order` at the gate, `--marks=3` and `--blocks=3`, and the give-back and unwrap families at their gates, with every coupled set the same as next's one by one, where only 4 of the unwrap family's sets give another document (a link split twice, one suggestion removing its left piece and unwrapping its right); the unwrap family at three operations with no failure and each new coupled set the core of next's sets; the authored suites and the work budgets; the plitejs typecheck and `pnpm lint:task` on the changed files.
- [ ] 6. Add the unwrap family to the order check through `/pstack:correct`, in its own commit after the fix, and seed its two rules in the baseline with next's coupled sets. Besides splitting a link and unwrapping, emptying or removing its pieces, the family puts a link that Editing inserts between the first split's halves, whose unwrap, emptying and removal the changes suggest, and it also splits with an Enter across two lines. Proof: it finds next's failures at the base, among them an unwrap between the halves of an Enter across two lines, iteration 1's 80 new coupled sets on its reviewed tree, and no failure on this build; at its gate it keeps next's coupled sets one by one, and the unfiltered `pnpm check:authored-order` passes on this build. A deeper bound reports the sets this build couples that next does not, and the skill records them beside the Defaults row that accepts them.
- [ ] 7. Say what a rejected Enter does with an unwrap of a half and with content between the halves, an element or text, through `plate-docs` on the suggestion page and its Chinese twin. Proof: the docs checks and the rendered page.
- [ ] 8. Write the changeset through the `changeset` skill. Proof: its check.
- [ ] 9. Bring the order check's coverage record in the `authored-decision-order` skill to the built commit. Proof: the skill's sync check and a gate run.

## Open work

- A rejected cut whose left half sits inside an element a suggestion removes, or on a line in another container, can still decide differently by click order, as the cut-join page's open item says. Owner: zbeyens. Stop: a report of it.
- When the only content of the first line is a link half that a suggestion unwraps and empties, a rejected Enter keeps that empty line and loses the ref the Enter dropped, in every order, as on next. Owner: zbeyens. Stop: a report of it.
- A deleted or removed link piece waits on its pending Enter, so a suggestion that also changes what stands between the pieces must be decided with the Enter. Letting the piece decide first might also let a reviewer decide some of the give-back family's coupled sets one at a time. Owner: zbeyens. Stop: a change to how removals wait.
- An Editing unwrap of a link piece keeps a half apart. When both Enters of a link split twice are rejected, an Editing unwrap of its middle piece leaves that piece's text between two links, while an accepted suggested unwrap of any piece removes the whole rejoined link. Owner: zbeyens. Stop: a change to how Editing relinks cuts.
- The quote family's coverage record in the `authored-decision-order` skill is still synced at `b2228e62ef`. Owner: zbeyens. Stop: the next `authored-decision-order update`.
- The rejoin rule in `docs/plans/topics/authored.md` names no unwrap limit to restore, and that file belongs to two open runs, so this plan's answer folds into it when they close. Owner: zbeyens. Stop: the close of the construction-values and authored-review plans.
