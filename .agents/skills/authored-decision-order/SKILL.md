---
description: Check that deciding the authored review tree's pending changes one at a time, in any order, gives the document that deciding them all at once gives, and that no change adds a set of verdicts a reviewer can only decide together, for every document up to a bound. Use before and after changing packages/plitejs/src/authored/tree/resolve.ts or another file in its coverage record, when the authored-order step of pnpm check fails, when fixing a decision-order bug, or when recording gains a new kind of mark.
argument-hint: '[check | deep | lower | update]'
name: authored-decision-order
metadata:
  skiller:
    source: .agents/rules/authored-decision-order.mdc
---

# Authored decision order

Handle $ARGUMENTS. `check`, or no argument, runs the gate bound. `deep` runs `--marks=3` and `--blocks=3` and compares their failures and coupled sets with Findings. `lower` runs `--lower` after a fix removes a known finding or a coupled set. `update` brings the verification in line with changed code, as Coverage record says.

**The property.** For every document in the bound, deciding its pending changes one at a time, each accepted or rejected in any admissible order, gives the same children and the same readable landed writes as deciding the same verdicts in one call. A step may wait only on another change that is still pending, and so may deciding the same verdicts at once. A set of verdicts that settles only when decided at once, because every order of single steps waits before reaching it, is a coupled set, and the list of coupled sets only shrinks.

**The harm.** A reviewer who accepts and rejects suggestions one by one gets a different document than a reviewer who decides the same suggestions together, so text moves or disappears depending on click order. A new coupled set makes a reviewer decide two suggestions in one call, and it hides any decision-order bug in the orders it blocks.

## What it checks

`packages/plitejs/scripts/authored-decision-order.ts` runs the real resolver on every document it can build within the bound. It is bounded exhaustive checking of the TypeScript code, not a model; no model checker or verifier runs on this resolver, so the script enumerates the inputs instead of sampling them.

1. It builds every document of one or two top-level blocks, each a paragraph or a quote of one or two paragraphs, with each paragraph holding one letter (`a`, `b`, and so on).
2. It places one or two pending marks from changes `s0` and `s1` at every place recording writes one. A block's boundary with the block before it takes `join` or `split`. A block's whole content takes `insert` or `delete`, spread into its children as recording writes it. A leaf takes its own `insert` or `delete`. A quote takes `wrap` or `unwrap`, and an `align` format tag with or without the stored `align: 'center'`. The script tries a split between two top-level paragraphs with and without the cut link that Enter inside a link writes.
3. It normalizes each document through `quotesEditor` and `expandContexts`, as the sampled law does. A document the editor rejects, or one that normalizes to a document another one gives, stops the run, as Read a failure says.
4. One decision step calls `resolveWithVerdicts` with one change's verdict and the earlier verdicts as records, then `settleAsAdmission`. The script runs every order of `(change, verdict)` steps. `admissionOf` judges each resolve the way `decideOn` in `authored.ts` does. It drops a blocker that names a change the call itself decides, then reads the other blockers before placement. A step whose other `blockers` name only pending changes waits, so that order stops there. A step whose `blockers` name a change decided earlier or one the document lacks, or that is `unplaceable`, is a failure. For such a blocker `decideOn` returns `blocked` with a change the reviewer can no longer decide, so the script counts it as a failure, not a wait. From the second step on, the script compares the document with deciding the same verdicts at once, through the same two calls; the first step makes the same calls as deciding its verdict alone. The at-once call follows the same rule. When it waits on another pending change, the script skips that comparison, and any other refusal is a failure.
5. Then it decides at once every set of verdicts that no order of single steps reached. A set that settles is a coupled set. A set the at-once call refuses is a failure.
6. It sorts the failures and the coupled sets and compares them with `packages/plitejs/scripts/authored-decision-order-baseline.json` through `tooling/scripts/finding-baseline.mjs`, the same shrink-only baseline the lint baseline uses. Failures are the `decision-order` rule and coupled sets the `decided-together` rule.

The helpers, `admissionOf` included, come from `packages/plitejs/test/support/authored-laws.ts`. The sampled fast-check law in `packages/plitejs/test/authored-tree-resolve-laws.spec.ts` imports them too, so both run the same decision step and settle, and the plitejs test typecheck covers the helpers through the spec. The sampled law skips a step the resolver blocks or cannot place, where the script judges it.

Three reductions keep the run short. Change names are labels, so a document uses `s1` only after `s0`; a run with every labeling, at commit `da4bc3e523` on the generator before format tags on deleted quotes, found exactly twice the documents, orders and failures. The first step is not compared, since both sides make the same calls. A failure is reported once. The orders that extend a failed order only mark which verdicts one at a time reaches and are not compared, so a second failure further along a failed order stays hidden until the first one is fixed.

## Run it

Run every command from the repository root.

- `pnpm check:authored-order` checks the gate bound: two blocks, two marks, two changes. It builds 4,467 documents and makes 17,472 comparisons in 4 to 14 s on an 18-core M5 Max, slower while other sessions load the machine, and prints one JSON summary line, then each failure and coupled set the baseline does not list. `pnpm check authored-order` runs the same step through the check runner, and `pnpm check --affected` runs it for any change under `packages/plitejs/` or to `tooling/scripts/finding-baseline.mjs`.
- A flag raises one part of the bound and leaves the rest at the gate's. On the same machine, `pnpm check:authored-order --marks=3` builds 54,451 documents and makes 303,134 comparisons in 51 to 105 s. It is the cheapest bound that caught the container-boundary and rejected-wrap bugs in What a pass proves. `--blocks=3` builds 34,961 documents and makes 137,656 comparisons in 21 to 79 s. `--marks=3 --changes=3` builds 71,203 documents and makes 1,300,316 comparisons in 90 to 167 s. A bound other than the gate's skips the baseline and exits 1 on any failure, because the known findings repeat there in more documents and orders. It prints the coupled sets only as the summary's `together` count. Compare its failures and that count with Findings. Run `--marks=3` and `--blocks=3` after a change to the resolver's join, split or enclosure logic.
- `--jobs=<n>` sets the number of worker processes; it defaults to the machine's cores. `--together=<file>` writes every coupled set to that file, sorted, one per line: its identity, then `=>` and the document and readable landed writes that deciding it at once gives. A bound flag and `--together` take the `--marks=3` form, and any other argument exits 2.
- After a fix removes a known finding or a coupled set, the gate fails until you run `pnpm check:authored-order --lower`, which drops the entries the tree no longer holds. The baseline never grows: `--lower` refuses a new entry, and `finding-baseline.mjs` refuses an entry its copy at the base commit lacks.

## Read a failure

Each failure prints the document, the order of steps, and both results. This one is the bug Findings describes, before its fix:

```text
quote(paragraph{delete s0}("a"{delete s0})) paragraph{split s1}("b"): accept s0, reject s1
  one at a time: quote(paragraph("b")) landed []
  all at once:   quote(paragraph("")) paragraph("b") landed []
```

A refused step prints `the last step is unplaceable` or `the last step is waiting on s0, which is not another pending change` in place of the two results, and a refused at-once call prints the same reason after `all at once:`. A set of verdicts that no order reaches and the at-once call refuses prints the verdicts in change order, then `at once`, then the reason and `and no order reaches these verdicts`. A new coupled set prints the document and its verdicts in change order, then `settles when decided together, while every order of single steps waits`.

A node is `type(children)` and a leaf is its text in quotes. `{delete s0}` lists the node's marks by kind and change; a format tag shows its key, and a cut shows its side. `[align center]` is a stored property. `landed [...]` lists the landed writes that some remaining tag still links, the only ones a reader can see.

When the run says that some generated documents fail to load, did not come back from the workers, normalize to a document another one gives, or hold two or more changes with no order the script could compare, it exits 1 at every bound, `--lower` included, before it prints failures or reads the baseline. Those documents went unchecked. Find what changed in the editor, the resolver or the generator before anything else.

Tell a real bug from a modeling error before you change code:

- **Real bug.** The document is one recording writes and the two results differ in children or readable landed writes. Recording writes one mark of a change per node, spreads a whole-block insert or delete into every node inside the block, puts boundary marks only on a block that follows another, and never tags a node with a format change that also inserted it. `formattedProps` in `packages/plitejs/src/authored/tree/record.ts` owns that last rule. It writes no tag on a node that already holds a delete mark and none inside the writer's own insertion, so a tag written before its change deletes the node stays beside the delete mark. Fix the resolver, then run `--lower`.
- **Modeling error.** The document breaks one of those recording shapes, or the difference is in something no user reads. Fix `slotsOf` or `build` in the script, or the shared helper, and fix the sampled law's generators in the spec the same way.
- **Intended change.** A change that alters what a decision produces changes both sides alike and keeps passing. A step may wait on another pending change only while every set of verdicts that settles at once stays reachable one at a time or is already a coupled set. A new coupled set fails the gate, because it makes a reviewer decide those suggestions in one call and can hide a decision-order failure, as What a pass proves shows. Whether that trade is worth it is the owner's call, and accepting it changes this check, not the baseline. Never weaken the property or add a baseline entry to get green.

## Findings

No bound finds a failure. The gate bound found two and the deeper bounds 22 at `--marks=3`, 14 at `--blocks=3` and 78 at `--marks=3 --changes=3` until the fix for suggested task t_6e758b7d. All had one shape, a paragraph with a pending split right after a quote whose paragraphs a decision removes. For `quote(paragraph{delete s0}("a"{delete s0})) paragraph{split s1}("b")`, accepting `s0` and then rejecting `s1` gave `quote(paragraph("b"))`, while deciding both at once gave `quote(paragraph("")) paragraph("b")`. With a paragraph `x` before the quote, deciding both at once rejoined `b` into `x` instead.

Deciding the removal first leaves the empty paragraph that completion builds, because a quote needs one, and the rejected split then rejoins it. Deciding both at once, phase one of `resolveAuthoredChildren` looked for the nearest preceding text block the decision keeps before completion ran, so it passed the quote. Now the split looks back for the first container that the decision keeps but empties, or whose children it lifts out by accepting an unwrap or rejecting a wrap. Only that container can take the split. The split's block takes the removed block's place there only when the decision does not lift the container's children, the container has no prefix slot, completion would rebuild it as one empty line with exactly the split block's properties, and the split block carries no format tag. Deciding the removal first and then rejoining the split into that line gives the same document. Otherwise the split looks further back as it did before the fix, and no container further back can take it. It waits on what removing that block, emptying the container and building the line wait on. Through the public `decide` of `authoredTestApi` in `packages/plitejs/test/support/authored.ts`, both orders now give `quote(paragraph("b"))`, and rejecting `s1` first still returns `blocked`. Every coupled set at every bound below is the same set as before the fix, compared one by one. Decided at once, the gate's and `--blocks=3`'s give the same documents as before, while 12 of those at `--marks=3` and 16 at `--marks=3 --changes=3` give another one. Each of those has a split right after a quote the decision empties, and the split's piece now takes the place of the quote's paragraph instead of following the quote. The script does not compare these documents; a one-off dump of each set with its document did.

The gate bound has 66 coupled sets. Each merges two paragraphs, by accepting a join or rejecting a split, while the other change's verdict removes the content of one of them. In `paragraph{delete s0}("a"{delete s0}) paragraph{join s1}("b")` with both accepted, accepting `s0` first waits on the join and accepting `s1` first waits on the deletion, while deciding both at once gives `paragraph("b")`. Through the public `decide`, accepting either change first returns `blocked` with the other, and deciding both together applies. `--blocks=3` has 372 coupled sets, `--marks=3` has 2,362 and `--marks=3 --changes=3` has 5,334. A deeper bound does not check these counts, so compare them by hand.

At `--marks=3 --changes=3`, measured before the generator added format tags on deleted quotes, 84 orders decide two changes one at a time where deciding the same two together waits on a third change, a split that is still pending. One is `paragraph("a") quote{unwrap s0}(paragraph{delete s1}("b"{delete s1}) paragraph{split s2}("c"))` with `s0` and `s1` accepted. Lifting a quote's children, by accepting an unwrap or rejecting a wrap, waits on the join boundary of its first child, as the comment beside that wait in `resolve.ts` says. Decided together, that child is the split paragraph, so the resolver waits on `s2`. One at a time, the first child is still `b` when the unwrap lands. The script skips those comparisons. Nothing shows that the wait loses content, but it makes deciding together stricter than deciding one at a time.

## What a pass proves

The check catches a defect that makes the result depend on decision order, that refuses a step no other pending change holds, or that couples a set of verdicts the baseline lacks. At commit `da4bc3e523`, bugs planted in `resolveAuthoredChildren` showed where that holds:

- Letting a rejected split rejoin into a block the decision removes, by dropping the `!survives(candidate.node) && !rejoins(candidate.node)` test, gives six failures at the gate bound that the baseline does not list.
- Letting a join leave the quote that holds it, by dropping the `boundary` test, passes the gate bound and `--blocks=3`, and gives six new failures at `--marks=3` and fourteen at `--marks=3 --changes=3`. One is `quote(paragraph{delete s0}("a"{delete s0})) quote(paragraph{delete s0}("b"{delete s0}) paragraph{split s1}("c"))` with `s0` accepted, then `s1` rejected.
- Keeping a rejected wrap passes the gate bound and `--blocks=3`, and gives one new failure at `--marks=3` and three at `--marks=3 --changes=3`. The one at `--marks=3` is `quote{wrap s0}(paragraph{insert s0}("a"{insert s0})) paragraph{split s1}("b")` with `s0` rejected, then `s1` rejected.
- Marking a step unplaceable where the rejoin target was removed, so the resolver refuses the known failing orders instead of fixing them, gives 94 new failures at the gate bound.
- Making a pending split wait on a decision that removes the block before it, the mirror of the wait a rejected split already has, turns both known failures into coupled sets, 38 new ones in all at the gate bound. The gate fails, and so does `--lower`, which leaves the baseline unchanged. Planted together with the rejoin-target bug above, it still adds 38 and fails. Making every removal wait on every other pending change adds 348.
- Letting a join land in a block an earlier join emptied, counting a deletion made after a join, and ignoring earlier verdict records passed the gate bound, `--marks=3`, `--blocks=3` and `--marks=3 --changes=3`. Either each changes both paths alike or it needs a larger document.

The fix for t_6e758b7d adds a path where a rejected split takes the place of a removed block in a container the decision empties. Bugs planted in that path gave these results:

- Turning that path off gives back the two known failures at the gate bound.
- Taking that place while the container keeps other content, by dropping the test that nothing in it survives, gives two failures at the gate bound. One is `quote(paragraph("a") paragraph{delete s0}("b"{delete s0})) paragraph{split s1}("c")` with `s0` accepted, then `s1` rejected.
- Leaving the container's own pending marks out of what the split waits on passes the gate bound. At `--marks=3 --changes=3` it gives two failures, adds 12 coupled sets and drops 2, each on a quote that holds a pending format tag, insert, delete, wrap or unwrap.
- No bound can catch a looser test on the line completion would build, because in the quotes schema completion always rebuilds an emptied quote as one empty paragraph and the generator gives a split paragraph no property and no format tag. Dropping the whole completion check passed every bound. The decide-completion test `keeps a rejected split in place when the first container the decision empties or lifts before it is not one completion rebuilds, outside any prefix slot, as one empty line with exactly the split block’s properties, or when the split block carries a format tag` catches each of nine such bugs: taking a line of another type, comparing only the type of the line and the split block, taking the place while the split block carries a format tag, taking a line in a prefix slot, taking one of several lines, taking a line that holds an element, taking a place in a container the decision lifts, looking past such a container, and looking past the first emptied container that fails these tests. Each makes deciding the changes together return `invalid` or give another document than before the fix.
- Taking that place in a quote the decision unwraps passes every bound. The smallest such document is a paragraph, a quote that one change unwraps and empties, and a paragraph whose split another change rejects. That needs three blocks and three marks, and no bound raises both. The decide-completion test `rejoins a rejected split past a quote whose unwrap it decides with the deletion of the quote’s paragraph, as deciding the two in turn does` catches it.

The sampled laws in `packages/plitejs/test/authored-tree-resolve-laws.spec.ts` and the resolver's other tests own what each decision produces.

## Coverage record

Synced at commit `b2228e62ef`. The verification describes these files and functions as they stand there:

| File | What the check exercises |
| --- | --- |
| `packages/plitejs/src/authored/tree/resolve.ts` | `resolveAuthoredChildren` for the main root, its structural landing, enclosure lifts and canonical completion |
| `packages/plitejs/src/authored/facts/facts.ts` | `factsOf`, the review facts each step reads |
| `packages/plitejs/src/authored/facts/records.ts` | verdict and landed records, through `reviewRecords` in `test/support/authored.ts` |
| `packages/plitejs/src/authored/facts/compact.ts` | `expandContexts` on the normalized document |
| `packages/plitejs/src/authored/resolve-schema.ts` | `authoredResolveSchemaOf` for the quotes schema |
| `packages/plitejs/src/authored/authored.ts` | `createAuthoredPlugin` normalization of the initial value, which blockers `decideOn` drops, and the order in which it reads blockers and placement |
| `packages/plitejs/test/support/authored-laws.ts` | the step, the settle, `admissionOf` and the comparison |
| `packages/plitejs/src/authored/tree/record.ts` | not run; `slotsOf` and `build` copy where recording puts marks and format tags |

To see whether the verification needs another look, run `git log --oneline b2228e62ef..HEAD -- packages/plitejs/src/authored packages/plitejs/test/support/authored-laws.ts packages/plitejs/scripts/authored-decision-order.ts`. The commit that added this check, `test(plitejs): check every decision order of the authored review tree up to a bound`, is in that range; it is the check itself. For each other commit it lists, read the diff and confirm three things. One call of `resolveWithVerdicts` plus `settleAsAdmission` still matches the resolve call in `decideOn` in `authored.ts`, apart from what What it does not cover lists. `admissionOf` still drops the blockers a call decides and reads the rest before placement, as `decideOn` does. Recording writes no mark kind or place the script lacks. Move the sync commit in this file forward only after that check and a run of `pnpm check:authored-order`. When recording gains a mark kind or a place, add it to `slotsOf` and `build` and to the spec's generators in the same change.

## What it does not cover

- The public `decide` path in `authored.ts`: revision checks and `stale`, cards, decision tokens, `decideOn`'s `stores: true` resolve, withdrawals of held members, the `taken` check, the second blocker check for insertions inside removed content, schema validation of the decided document and undo. `settleAsAdmission` stands in for the run-scoped `resolveOwn` in `authoredAdmission`.
- Readable landed writes. The generated format tags link no earlier write through `over`, so no document in any bound tried has one, and only the children half of the comparison can fail.
- A known failure whose results change. A baseline entry names the document and the order, not the results, so a known failing order that gets worse stays green.
- What deciding a coupled set produces. No order of single steps reaches a coupled set, so nothing compares its at-once result. A planted bug that lets an accepted join merge into a block that another change in the same call removes passed the gate bound and changed 24 of the 68 coupled-set results. Other authored tests caught it with 34 failures, among them the sampled law `accepting every change at once equals accepting admissible batches in turn` and the preview reads of a block a pending join passes. To see which coupled-set results a resolver change moves, run the same bound with `--together=<file>` before and after it and diff the two files.
- Coupled sets beyond the gate bound. Only the gate's are in the baseline; a deeper bound prints their count, which Findings records.
- Splits inside a quote with a cut link. The script tries cut links only between top-level paragraphs.
- The script's own code. It is in no typecheck program, so keep the code that reads resolver results in the shared helper, which the plitejs test typecheck covers.
- Named roots and orphaned roots, which `resolveAuthoredValue` adds around `resolveAuthoredChildren`.
- Shapes no bound builds, where the split is decided as it was before the fix. In one, the first container the split meets has a prefix slot, the decision lifts its children, or completion would rebuild it with no line, with more than one line, with a line that holds an element or with a line whose properties differ from the split block's. In another, the split block carries a format tag, pending or decided in the same call. Removing everything in such a container and rejecting the split right after it can still give a different document one at a time than at once, or refuse the second step as `invalid` while deciding both together applies. Suggested task t_674a5226 tracks it.
- Bold or other leaf formats, text longer than one letter, more than two blocks, marks or changes at the gate bound, other schemas, corrections that derive values, and collaboration.
- Sizes beyond the bound. A pass covers only the documents the bound builds.

`/pstack:maintain-formal-verification-skill` brings this verification back in line after changes that did not recheck it.
