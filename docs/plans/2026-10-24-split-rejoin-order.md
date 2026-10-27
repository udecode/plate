# A rejected Enter rejoins the same way in every click order

Status: superseded by docs/plans/2026-10-24-split-rejoin-order-2.md
Topic: cut-join
Playbook: plan

Pursue. A rejected split's rejoin must not depend on the order a reviewer decides in, and it needs no stored fact. Three causes remain on next, and each one reads the document at the wrong moment. The block rejoin counts a pending deletion as emptying the first line only when its clock reads earlier than the Enter's. The cut verdict never sees a pending unwrap of an element between the halves, and in one call it counts that element as standing. The inline join glues the halves before a decided unwrap of one half lifts it, so the unwrap spreads to both halves or is lost. The fix reads each case at the right moment, and an unwrapped piece leaves its link's cut family, so no rejected Enter glues text back into the link through it. It gives one result in every click order for each case the brief names and for 79 probe cases, among them a link split twice. It passes the authored tests and the decision-order check at the gate and at two deeper bounds with the same coupled sets, and it reads no more stored marks than next on the two budgeted paths. The storage plan already settled findings 2, 4 and 8 on next. Finding 3 (N6) is a Stop. Decide keeps reporting what each change did, and the suggestion docs say when a rejected Enter keeps both halves.

## Brief

### What will change?

Rejecting an Enter gives the same document in any click order, even when another suggestion empties a line or unwraps a link. An unwrapped piece stays out of its link, and halves that differ both stay.

### What could go wrong?

An emptied heading can return as a paragraph after a rejected Enter. A link half inside a removed element can still follow click order. A link split twice can lose or repeat the ref an Enter dropped.

## Teach

Review stores a suggested Enter as a split of one line or link into two halves. Rejecting the Enter puts the halves back together. A reviewer can decide suggestions one at a time in any order, or many at once, and every way must give the same document.

Three cases break that. When another suggestion empties the first line, the rejoin compares the two edits' clocks, so the result follows click order and clock skew. A suggested unwrap of a link between the halves goes unseen until it lands. An unwrap of one half runs after the halves were glued, so it spreads to both halves or does nothing.

The fix handles each case. An emptied first line gives way to the second. The rejoin waits for an unwrap between the halves. An unwrapped piece leaves its link, whatever happens to its text, so the halves around it stay apart.

## Main changes

- `keepsContent` in `packages/plitejs/src/authored/tree/resolve.ts` counts every removal the decision accepts as emptying the line before a rejected split, with no timestamp read, so `deletesBeforeJoin`, `JoinMoment` and `joinOf` go. The right piece then stands in the emptied line's place, as it does when the deletion was decided first.
- `verdictOf` in `packages/plitejs/src/authored/tree/halves.ts` counts a pending wrap or unwrap between the halves, or on a half, as a change that touches the verdict, so the cut probes or waits on it. An element between the halves that the decision lifts out stands only through the elements it lifts.
- `joinRejectedCuts` in `packages/plitejs/src/authored/tree/cuts.ts` keeps a rejected cut's halves apart when the decision lifts one of them. A lifted left half leaves the right half standing with what the split dropped given back, as a removed left half does, and a lifted right half leaves the left half standing. A right half drops only the copies an earlier split wrote, read from its own history by `earlierSplitsOf` in `layers.ts`, since the fragment before the lifted one still holds that value. A lifted half on another line counts as gone, so the half on this line gets back what the split dropped.
- `relinkCuts` in the same file hands no cuts on from a fragment whose element was lifted out, and the fragment after it drops an earlier split's copies, as above. On the decide path, `liftedUnder` in `marks.ts` reads which elements were lifted from the verdicts. Editing, load and repair still count an element as lifted when a character of its text stays. A rejected Enter then never joins the pieces around a lifted piece, in whichever order the piece was lifted or its text deleted.
- `keepsContent` counts an element the decision unwraps only through what it lifts. So when the first line holds only an unwrapped link and a decision deletes its text, the second line takes that line's place with its own type and gets back what the split dropped.
- A rejected cut finds its left half gone when the right half's line takes the place of the line a removal empties, so the right half gets back what the split dropped.
- An element the decision lifts out waits on its own pending marks except its cut tag and the copies its split wrote, so accepting an unwrap of a half first no longer waits on the split.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Rejected Enter after an emptied first line | The second line takes the first line's place, in every order | Store which half kept the line when the Enter happens | store split | small |
| Unwrap of a link between the halves | The rejoin waits for it, and an unwrapped link no longer keeps the halves apart | Treat that link as a wall, so the halves stay apart | wall | small |
| Unwrap of one half | It acts like removing that half, so the other half stands alone | The unwrap spreads to the whole rejoined link | spread unwrap | small |
| Accepting an unwrap of a half first | It applies right away | Make the reviewer decide it together with the Enter | couple | detail |
| Unwrap of the middle piece of a link split twice | That piece leaves the link, and the pieces around it stay two links in every order | Keep next's rule, where the middle piece rejoins the link or spreads its unwrap, and the unwrap waits on both Enters | middle rejoins | small |
| A ref the first Enter dropped, when the middle piece is unwrapped | Only the first piece keeps it | Give it back to the last piece too, so two links hold it | ref on both | detail |
| A link piece unwrapped with none of its text left | Counts as unwrapped, so the pieces around it stay two links in every order | Count it as removed, so a rejected Enter rejoins those pieces, and make the unwrap wait on any pending deletion of its text, which adds a set of suggestions a reviewer must decide together | empty lift | detail |
| An unwrap of a link piece made directly in Editing | Takes the piece out of the link, like an accepted suggested unwrap | Let the pieces around it take over its splits, so a later rejected Enter glues its text back into the link | relink unwrap | detail |
| Telling the reviewer the halves stayed apart | The docs explain it, and decide's answer stays as it is | Add a list of kept-apart Enters to decide's answer | report apart | small |
| Where this answer lives | Its own plan on the cut-join page, off the authored page two other runs hold | Fold it into the authored page now | authored page | detail |
| A link half inside a removed element | Stays an open item of the cut-join page | Fix it in this run too | widen | small |
| After the design pick | Build right away | Stop after the plan | hold | detail |
| The cut-join page's old link, https://claude.ai/artifact/Y77WFp5kARVDo1GrdNAxH5, no longer opens | A new page at https://claude.ai/artifact/3QjHNd3Zgoh42nB8DCGYHt takes its place | Publish no page for this subject | no page | detail |

## Evidence

### Requirements

- [ask] The rejoined line's type must not depend on decision order or clock skew (finding 1).
- [ask] A suggested unwrap of an element between the halves must not change the rejoin by decision order, whether it is pending or accepted in the same call (finding 5).
- [ask] Say what a decided unwrap of one half leaves after the reject (finding 7).
- [ask] Decide whether decide or a diagnostic should tell the reviewer that the halves stayed apart (finding 3).
- [ask] Settle findings 2, 4 and 8 (keep both halves, paragraph tones, moved text and an unset property).
- [law] Deciding one at a time in any admissible order equals deciding the same verdicts at once, and no new coupled set appears (the `authored-decision-order` skill's property; `content/docs/(plugins)/(collaboration)/suggestion.mdx` line 263).
- [law] A rejected split gives back what it dropped in every decision order, whether or not its left half stands (`docs/plans/topics/cut-join.md`, last Main changes bullet).
- [law] The rejected-cut work budgets in `packages/plitejs/test/authored-tree-work.test.ts` hold; next reads exactly their caps.

### Lanes

- Control, no new artifact: keep the code and state each order dependence as a limit. It loses because the docs promise the same document in any order, and finding 1 leaves two lines after a rejected Enter in the batch.
- A stored split fact, which `docs/plans/2026-10-17-join-keeps-target.md` expected C1 to need: record which half keeps the line when the Enter is made. The prototype shows no stored fact is needed, and storing one adds a stored shape and its migration.
- The strongest deletion: drop the emptied-line rule, so a rejected Enter always merges into the first line. Halves of different types then stay apart in every order, which leaves an empty heading above the text after the Enter is rejected, and the rule also carries the t_6e758b7d decision-order fix.
- Read each case at the right moment (picked): no timestamp read in the block rejoin, enclosure changes in the cut verdict, a lifted half kept apart, and a lifted piece out of its cut family. Three design runners and a cross-judge agreed on every pick, and the judge chose how a lifted piece leaves its family.
- Keep next's join rule for a lifted piece unless both of its sides are rejected. It loses because which sides a piece has changes once one Enter is decided, so the result still follows click order.

### Dependents

- Plate's suggestion plugin and UI call `decide` through Plite's public authored API. Its call shape and result shape stay; the documents some decisions produce change, as Brief says.

Model: claude-opus-5-5 @xhigh

## Steps

- [x] 1. Drop the timestamp read from the block rejoin. Proof: a decide test in `packages/plitejs/test/authored-tree-decide-completion.test.ts` that fails at the base through `tooling/scripts/proof-worktree.mjs --expect-fail` and passes after, and every order of the probe's C1 cases giving one document.
- [x] 2. Make the cut verdict see enclosure changes, keep a lifted half apart, and take a lifted piece out of its cut family. Proof: tests in `packages/plitejs/test/authored-tree-cuts.test.ts` for an unwrap between the halves, an unwrap of each half, a lifted half on the line before, the unwrapped middle piece of a link split twice under every verdict row, an Editing unwrap of that piece, the piece unwrapped with its text deleted by the same suggestion or another, an unwrapped and emptied half that is the first line's only content, a suggestion made on the whole link before the split and a removed half whose line the other line replaces, each failing at the base and passing after.
- [ ] 3. Hold the order check and the budgets. Proof: `pnpm check:authored-order`, `--marks=3` and `--blocks=3` with unchanged coupled-set counts, the authored suites and the work budgets, the plitejs typecheck and `pnpm lint:task` on the changed files.
- [ ] 4. Say when a rejected Enter keeps both halves, through `plate-docs` on the suggestion page and its Chinese twin. Proof: the docs checks and the rendered page.
- [ ] 5. Write the changeset through the `changeset` skill. Proof: its check.
- [ ] 6. Bring the give-back family's coverage record in the `authored-decision-order` skill to the built commit, and name the lifted halves it does not build. Proof: the skill's sync check and a gate run.

## Open work

- A rejected cut whose left half sits inside an element a suggestion removes, or on a line in another container, can still decide differently by click order, as the cut-join page's open item says. Owner: zbeyens. Stop: a report of it.
- The order check's give-back family splits a link once and unwraps nothing, so no gate bound builds a lifted half or a link split twice; the cut tests above stand in for it. Owner: zbeyens. Stop: a change to the order check.
- A link split twice with its first piece removed and its middle piece unwrapped loses the ref the first Enter dropped, in every order; next unwraps the last piece as well. Owner: zbeyens. Stop: a report of it.
- A link split twice whose left piece was split second, with its middle piece unwrapped, gives the ref the first Enter dropped back to the last piece too, so both outer links hold it, in every order; next rejoins all three pieces. Owner: zbeyens. Stop: a report of it.
- An unwrap made in Editing through `DocumentChange.between` replaces the unwrapped piece's characters, so relinking reads that piece as removed, and a later rejected Enter glues its text back into the link. `tx.nodes.unwrap` keeps it out. Owner: zbeyens. Stop: a change to how Editing relinks cuts.
- An Editing merge of two link pieces may read as a lift to relinking, which no test or probe has checked. Owner: zbeyens. Stop: a report of it.
- The quote family's coverage record in the `authored-decision-order` skill is still synced at `b2228e62ef`. Since then `fix(plitejs): keep validators out of authored resolution and generators out of exports` changed `decide` in `authored.ts` and the shared law helpers, and no run has rechecked the record against it. Owner: zbeyens. Stop: the next `authored-decision-order update`.
- The rejoin rule in `docs/plans/topics/authored.md` names no unwrap limit to restore, and that file belongs to two open runs, so this plan's answer folds into it when they close. Owner: zbeyens. Stop: the close of the construction-values and authored-review plans.
