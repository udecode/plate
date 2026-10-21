# Keep a rejected cut's halves apart when their values differ

Status: superseded by docs/plans/2026-10-20-cut-join-order.md after the diff panel's third round
Page: https://claude.ai/artifact/FwpfS6h4GdVEp8osXhYJTZ
Playbook: bug-fix

## Brief

### What will change?

Rejecting a split inside a link no longer throws away a url, as task t_a2a1c87f asked. If the two halves end up with different urls, they stay two links, and while a suggestion could still change them, the reject waits.

### What could go wrong?

A rejected split can leave two links where people expect one, also when a schema refills a dropped property with a default. With the left half deleted first, the reject can still overwrite a dropped property, such as an id.

## Teach

When someone splits a link that is still under review, the link becomes two halves. Rejecting the split glues them back into one link.

Today the glued link keeps only the left half's url. If the halves held different urls, the right one is gone, even when nobody suggested it and it was already settled.

Now the glue step first works out what each half ends up as under this decision. If a pending suggestion still decides a url that differs, the reject waits for it. If the halves still differ with nothing pending, they stay two links, so neither url is lost. A property the right half doesn't have at all, such as an id a split took off it, counts as the left half's.

## Scope

- In: `packages/plitejs/src/authored/tree/cuts.ts` and `resolve.ts`, and the export of `sameValue` from `layers.ts`; the tests in `packages/plitejs/test/authored-tree-cuts.test.ts`; the comment on `withCuts` in `packages/plitejs/test/authored-tree-resolve-laws.spec.ts`; the rejoin rule, the cuts line of Main changes and the Open work line on the left-gone restore in `docs/plans/topics/authored.md`; the bullet on rejecting an Enter in `.changeset/plite-authored-values.md`.
- Out: the wait a real Enter inside a pending link already takes through the block landing (`landingOf` in `resolve.ts`), which suggested task t_ab434358 owns; restoring a split's dropped properties when its left half is gone, and cut fragments with format tags in the resolution-law generators, which suggested task t_44385dec owns; a Yjs merge that drops an inline split, or duplicates the link of an Enter, when the link's author edits it offline, which suggested task t_649d2131 owns; a batch whose rejection reads a write another link's decision lands in the same batch, which suggested task t_048448ff owns.

## Main changes

- `joinRejectedCuts` in `cuts.ts` compares every property of the two fragments as the decision leaves it. It decides each property's format tags with `decideKey` and the reading `decideFormats` uses, which `resolve.ts` now builds once. It waits on the tags the decision leaves undecided behind a property the fragments hold differently, or under tags that differ, write ids included. `isUndecided` in `layers.ts` reads that from `decideKey`'s own tag status. When a property differs and no undecided tag is behind it, the fragments stay apart without waiting on other properties' tags. So a tag the decision keeps only as history, such as an accepted url over a rejected one, never lets a join through. A property the right fragment lacks reads as the left fragment's while the decision leaves no tag on it, so a property a split dropped keeps them apart only when the schema fills it back in with a default, even when an earlier split dropped it. A right fragment the decision removes is not compared. It hands the right fragment's tags the decision lands to `landFormats` in `resolve.ts`, which stores their landed records although the join drops them. `oneSided` no longer compares format tags.

## Rules

A rejected split inside an element joins its two halves only when they hold every property alike once the decision is made. The reject waits while a pending suggestion still decides a value that differs, and halves that still differ stay two elements, so neither value is lost. A property the right half lacks counts as the left half's while the decision leaves no tag on it, so a property a split dropped keeps the halves apart only when the schema fills it back in with a default, which task t_4dcd7ffe owns. At the fold this goes beside the rule that a rejected split rejoins its pieces.

## Steps

- [x] Write the tests first and run them on next and on the earlier iteration: the repro, F, H in every order, I, I2, J, K, the dropped ref, X, Sol's write-id case, the card, the innermost insertion and the write id, each through `everyOrder` when it decides more than one change, except Sol's case, whose result depends on decision order on next too, as the batch-landing line in Open work says. Proof: head-r2-a2.log and current-r2-a2.log in the run directory.
- [x] Producer, reverted after the diff panel's first round: record the link author's half edits as format tags with one write id per change a commit writes for. Proof: cuts-w1-b-a1.log, and the round 1 decision rows that revert it.
- [x] Join: build the format reading once in `resolve.ts`, replace the format compare in `cuts.ts` with the decided compare of values and tags, and land the right fragment's landed tags. Proof: cuts-w1-b-a1.log.
- [x] Diff panel round 1 fixes: keep the halves apart when a property differs with nothing pending, read a property the split dropped as the left half's, and revert the producer. Keeping both halves no longer needs its recorded edits, and its tags outlived the left-gone restore. The cut suite drops the producer's five tests and the inserter-only F case that the pending link case in every order covers, and adds the pending dropped ref, a right half with pending writes on the dropped ref, and a later accept after the left-gone restore. Proof: the new cut suite fails 6 tests on the reviewed build (r1-before-reviewed-a2.log) and passes all 35 after (r1-after-cand-a3.log); with keep-both removed, 4 tests fail (r1-mutant-no-keep-both-a3.log); with the dropped-key reading removed, 3 fail (r1-mutant-no-dropped-a3.log); and with that reading ignoring the right half's tags, the tagged right half test fails (r1-mutant-dropped-ignores-tags-a3.log).
- [x] Held tags, found while reviewing comments after round 1's fixes: wait only on tags the decision leaves undecided, keep the halves apart when a value differs with none of those behind it, and read the dropped property from the right half's state after the decision. The cut suite adds an accepted url over a rejected one on the left half and Bob's rejected ref on both halves of an inline split. Proof: both fail on round 1's fix (cuts-held-before-a1.log) and all 36 pass after (held-after-cand-a1.log, in a detached tree at 58ebaa76a0 with the fix's patch). Each of five single mutations fails its named tests (the held-mutant logs). A generated check (join-oracle.ts) builds 3000 cases, each a cut, url and ref writes by Suggesting and Editing authors, and a decision. It finds 1026 joins on next that lose a value, 62 on round 1's fix and none after. It also finds 20 order splits on round 1's fix and none after, and 46 cases the fix keeps apart where next joins (join-oracle-base.json, join-oracle-r1.json and join-oracle-fix.json). Each case makes one cut, and its join and apart checks read only the url, so it could not see the chained cuts that the diff panel's second round found.
- [x] Diff panel round 2 fixes: read a property the right half lacks as the left half's while no tag is on it, in place of the split's record of what it dropped, which a second split never writes. Keep the halves apart without waiting when a property differs with nothing pending, even while another property still waits, and skip the compare when the decision removes the right half. The cut suite adds two rejected cuts of a link whose ref the first cut dropped, in every order, for Enters and for inline splits; an Enter whose left half got a ref after the Enter; refs that differ with nothing pending while one change's urls stay pending; and an Enter rejected with the removal of its right half. Proof: those four tests fail on round 2's reviewed build (r2-before-a1.log) and all 40 pass after, in a detached tree at 58ebaa76a0 with the fix's patch (r2-after-cand-a1.log). Each of five single mutations fails its named tests (the r2-mutant logs). A generated check of two chained cuts (chain-oracle-whole.ts) builds 600 cases, each two Enters or inline splits, url and ref writes by up to two authors and a decision, and carries the whole document between decisions. On next it finds 347 lost values. Round 2's reviewed build loses none, but decision order changes the result in 39 cases. After the fix it finds neither (chain-whole-base.json, chain-whole-held.json and chain-whole-r2.json). The one-cut check, rerun on round 2's fix, finds no loss and no order split. It keeps one case apart that next joins, because Ed's Editing removal of the right half's ref stays stored as a tag (join-oracle-r2.json).
- [x] Limits: state the left-gone restore's limit in `docs/plans/topics/authored.md` and in the comment on `withCuts`. Proof: both name suggested task t_44385dec.
- [x] Two-peer: Carol splits Alice's pending link while Alice, offline, sets its url, and the peers sync. Proof: two-peer-head-a1.log and two-peer-build-a2.log, where both trees drop Carol's inline split in the merge, so no reject runs. With an Enter, both trees duplicate the link, which suggested task t_649d2131 owns.
- [ ] Benchmark gate, on the final bytes: run Benchmark's pre-acceptance probe through `paired-timing.mjs` in detached worktrees at next, the candidate and a second copy of the candidate, over the cohorts the measurements file names. The budget, frozen before the build, is a median time of at most 1.25 times next's per cohort, because each runs once per gesture, judged with a planted arm 1.6 times slower and a same-code arm. Each arm reads its link count back and records as many tags and records as next. A conclusive miss sends the design back to `architect`. Proof: the measurements file and the known-bad run's log.
- [x] Gates, on the final bytes: the cut and layers suites, the authored test partition, the plitejs typecheck, both resolution-law suites at the repository seed, and `pnpm lint:task`. Proof: their logs exit 0, or fail only as next does. On the final bytes rebased onto next at 8c3ea8e552, all six exit 0. The cut and layers suites pass 47 tests, the authored partition 56, the resolution laws 5 and the recording laws 90, and `pnpm lint:task` finds nothing (cuts-layers-rebased-a1.log, authored-partition-rebased-a2.log, plitejs-typecheck-rebased-a2.log, resolve-laws-rebased-a2.log, recording-laws-rebased-a2.log and lint-task-rebased-a2.log).
- [ ] Writing passes, then the diff panel's third round, then land through `land.mjs`. Proof: the panel rows and the landed commit.

## Proof

Each value comes from the case probe, which is the cut suite with each assertion turned into a printed value. It ran on next at 58ebaa76a0, on the reviewed build of the diff panel's first round and on round 1's fix: r1-cases-next-a1.log, r1-cases-reviewed-a1.log and r1-cases-fixed-a1.log in the run directory. The held tag and rejected dropped ref rows come from the cut suite's failures on next (held-next-a1.log). The cut suite asserts each value in the last column and passes on the final bytes after the rebase (cuts-layers-rebased-a1.log). Unless a row says otherwise, Carol splits a link at offset 1.

| Case | Decision | next | Reviewed build | After the fix |
| --- | --- | --- | --- | --- |
| Repro, Carol's Enter, then Alice's v on the left and w on the right in one change | reject carol | joins as `ab@v` | blocked on alice:1 | blocked on alice:1 |
| Repro | accept alice and reject carol, in either order or together | `ab@v` | `ab@v` | `a@v` `b@w` |
| Stacked, Alice's w and v, Bob's q on both halves, then Alice's v and w | reject carol | joins | blocked on alice:1 and bob:1 | blocked on alice:1 and bob:1 |
| Stacked | accept alice and bob and reject carol together | `ab@v` | `ab@v` | `a@v` `b@w` |
| Settled, Bob's Enter, then Carol's u2 on the right half | accept carol and reject bob, in either order or together | `ab@u` | `ab@u` | `a@u` `b@u2` |
| Alice's pending link split inline, her v and w, then Bob's q on both halves | reject carol | joins as `ab@v` | blocked on alice:1 and bob:1 | blocked on bob:1 |
| The same | reject bob and carol, in either order or together | `ab@v` | `a@q` `b@q` together, and each order stops with a change waiting | `a@v` `b@w` |
| The same with Bob's x on the left half only | accept bob and reject carol | `ab@x` | `a@x` `b@w` together, and each order stops with a change waiting | `a@x` `b@w` |
| The same with Bob's x on the right half only | reject bob and carol | `ab@v` | `a@v` `b@x` together, and each order stops with a change waiting | `a@v` `b@w` |
| Sol's case, a loaded fork whose halves hold alice:1's v under two write ids, and a link `cd@q` whose bob:1 tag names the right one | reject carol | applies | blocked on alice:1 | blocked on alice:1 |
| Sol's case | accept alice and reject carol together, then reject bob | `cd@u` | `cd@v` | `cd@v` |
| Held tag, Carol's Enter, Alice's v and w, then Bob's q on the left half | accept bob and reject alice and carol, in steps or together | `ab@q` | not run | `a@q` `b@u` |
| Dropped ref, the link's ref r1, which the split drops from the right half | reject carol | `ab@u#r1` | `ab@u#r1` | `ab@u#r1` |
| Rejected dropped ref, Bob's ref r2 on both halves after the split | reject bob and carol together | `ab@u#r1` | not run | `ab@u#r1` |
| Pending dropped ref, Bob's ref r2 before the split | reject carol, then reject bob | blocked on bob:1 | blocked on bob:1 | `ab@u#r2`, then `ab@u#r1` |
| Dave's ref r5 and Eve's removal of it on the right half after the split | reject carol | blocked on dave:1 and eve:1 | blocked on dave:1 and eve:1 | blocked on dave:1 and eve:1 |
| Left gone, Alice's r2 on the right half of her pending link, Bob's removal of the left half, then Bob accepted and Carol rejected | accept Dave's later ref r3 | applies | blocked on alice:1 | applies |
| Two urls under one hand-built alice:1 tag | reject carol | applies | blocked on alice:1 | blocked on alice:1 |

The diff panel's second round added four cases. Their values come from the cut suite on next (r2-tests-next-a1.log), on round 2's reviewed build (r2-before-a1.log) and after the fix (r2-after-cand-a1.log).

| Case | Decision | next | Round 2's reviewed build | After the fix |
| --- | --- | --- | --- | --- |
| Two Enters, or two inline splits, in link `abc@u#r1`, the second in the first one's right half | reject both, in every order | `abc@u#r1` | `ab@u#r1` `c@u` | `abc@u#r1` |
| Ed's Editing ref r7 on the left half after Carol's Enter | reject carol | `ab@u#r7` | `a@u#r7` `b@u` | `ab@u#r7` |
| Ed's Editing ref r9 on the right half after Carol's Enter in `ab@u#r1`, then Alice's v and w | reject carol | `ab@v#r1` | blocked on alice:1 | `a@v#r1` `b@w#r9` |
| Alice's v and w after Carol's Enter, then Bob's removal of the right half | accept bob and reject carol | `a@v` | blocked on alice:1 | `a@v` |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix lives | The glue step compares what each half ends up as | Write down the link author's own edits on a half, which the first build did | record edits | big |
| Two different settled urls when a split is rejected | Both halves stay as two links (look) | The glued link keeps the left url, as today | keep left | big |
| A property the split took off the right half | It counts as the left half's, so a pending suggestion on it no longer holds up the reject | Wait on that suggestion, as today | wait on dropped | small |
| A property the right half lacks | It counts as the left half's while no suggestion is on it, so two splits in a row still join (look) | Ask the schema which properties a split drops. Then a schema default on the right half no longer keeps a rejected Enter's halves apart. And removing a kept property, such as url, from the right half alone no longer comes back on the join, as it does today. No Plate plugin declares such a default. Task t_4dcd7ffe | schema drops | small |
| Matching the halves' suggestions | They match only if they are the exact same records | Count two records of the same edit as a match, so the reject never waits on them | id-blind | detail |
| A wait that names two changes | Name every change at stake, such as Alice and Bob | Name one, and the reviewer goes round twice | one at a time | detail |
| The overwrite when the left half is gone | Leave it to task t_44385dec (look) | Fix it here, by settling the right half's suggestions first and waiting on any still pending | fix left gone | small |
| A real Enter inside a pending link | Leave its existing wait to the split-order task | Relax it here | relax enter | small |
| One batch that accepts a url and rejects a change over it on another link | Leave it as today, where deciding both at once can bring back the older url and accepting first keeps the new one (look) | Fix it here, with a second pass over the document | batch landings | small |
| Release note | Add one sentence to the unreleased bullet on rejecting an Enter, since no beta has shipped the cut join yet | A changeset of its own | own changeset | detail |
| Speed budget | At most 1.25 times today's time per step, since each runs once per gesture | At most 1.10 times | tight budget | detail |

## Close

This iteration does not land on its own. The diff panel's third round found defects in its design, and docs/plans/2026-10-20-cut-join-order.md continues the work from this tree.

Reversals and deviations come first.

- The first build recorded the link author's own edits on each half as format tags. Diff round 1 found that a leftover tag made a later accept wait once the left half was gone, so the build reverted it.
- The plan only made the join wait. Round 1 found that accepting Alice and then rejecting Carol still lost w, so halves that differ with nothing pending now stay apart.
- A comment review after round 1 found that a tag the decision keeps only as history still held the join. The join now waits only on undecided tags.
- Round 2 found that two cuts in a row resolved differently by decision order, because the second split records no drop. Reading a missing property as the left half's replaced the split's record.
- Round 3 found three more defects, each logged open with the new plan as its patch. Two chained cuts still resolve differently by decision order when the middle piece lacks a property the outer pieces hold alike, where next joins every order (r3-chain-cand-a1.log, r3-chain-base-a1.log). A url whose schema default the document omits still loses w, on next too (r3-default-cand-a1.log). A right half the decision removes no longer lands its pending write ids. The keep-apart rule and the missing-property reading already had their one replacement, so the panel rule sends them back to planning.

What the final bytes show, rebased onto next at 8c3ea8e552: the cut suite's 40 tests and every gate pass (the rebased gate logs), and the hand drive of the authored-changes example joins a rejected Enter inside a link back into one link (drive/readback.md). The benchmark passed on round 1's bytes in attempt 8, and attempts 9 to 11 ran inconclusive under host load. Nothing landed.

The task had one ask: "Make the join wait, or keep both writes, when the halves' values differ." This iteration does not finish it; the new plan carries it, with the open work below.

## Open work

- A real Enter inside a pending link still waits on the link's author when the split is rejected, even with no url edit. And a reject that keeps the halves apart returns `applied` with nothing that says they stayed two elements. owner: suggested task t_ab434358. stop: that task decides the rejoin order.
- A property the schema fills with a default on a split's right half, where the split drops it, keeps a rejected Enter's halves apart, where next joins them (default-drop-next-a1.log and default-drop-r2-a1.log). No Plate plugin declares such a default. A removal of a kept property, such as url, from the right half alone comes back on the join, as on next. owner: suggested task t_4dcd7ffe. stop: that task lands or is dropped.
- When a rejected split's left half is gone, restoring the properties the split dropped can overwrite a value another change wrote on the right half, and the result depends on decision order, as on next. The resolution laws build no tagged cut join at all, so they miss it. owner: suggested task t_44385dec. stop: that task lands or is dropped.
- When the link's author edits its url offline while another person splits it inside the link, the Yjs merge drops the split, on next too, so no reject runs. With an Enter instead, the merge keeps the split and duplicates the link. owner: suggested task t_649d2131. stop: that task lands or is dropped.
- One batch that accepts Alice's url and rejects Bob's url over it on another link restores the url below hers, as on next. The other link does not see yet that the batch landed her write. Deciding Alice first gives her url. owner: suggested task t_048448ff. stop: that task lands or is dropped.
