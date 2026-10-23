# Copy what a split takes onto the second half, so rejecting it gives it back in any order

Status: executed: landed in `e1922aa309`
Topic: cut-join
Playbook: bug-fix

## Brief

### What will change?

This is your cut-join task, which the last review sent back to design. A split now copies what it takes onto the second half. Rejecting the split reads that copy back, so click order stops changing the result.

### What could go wrong?

Old splits give nothing back once their first half is gone. Older editors can't open new pending splits. Two results change, and one rare pair must be decided together. Removing only a two-line split's first link gives nothing back.

## Teach

A proposed split cuts a link in two. Some properties, such as a reference id, stay only on the first half. If the reviewer rejects the split, the second half should get them back, even when someone removed the first half, with one rare exception.

Today the give-back reads the first half at the moment the split is rejected. Four attempts broke the same way, because what that read sees depends on other suggestions, other places in the document and the order of clicks.

Now the split copies those properties onto the second half when it happens, with any suggestions pending on them, under one tag of the split that marks everything beneath it as its copy. Rejecting the split reads the copy. A copy never makes another suggestion wait, so it adds no new click order that matters. If the rejected halves still differ and both stay, the copy goes, so an id never ends up on both links.

## Expected results

Rows use the storage plan's semantics and its table check, `docs/plans/artifacts/cut-join-values/storage/table/table-check.r9.template.ts`, and the redesign plan's table check. "Every order" means each order of single decisions and all of them in one call. The order check is `pnpm check:authored-order` with its give-back family. D+C means accepting Dave's removal of a and rejecting Carol's cut in one call, which next already requires.

| Row | Rank | Start and steps | Must give | next |
| --- | --- | --- | --- | --- |
| T11 | P0 | the redesign plan's row | b at u ref r1 | b at u in one call |
| S20, S36 to S38 | P1 | the storage plan's rows | the storage plan's results | fail |
| S39 | P1 | the storage plan's row | b ref r8 | passes |
| R3 | P1 | the give-back order plan's row | each single decision applies, or waits only on a change that does not wait back; every order reads as one call | rejecting Alice applies alone |
| K1 | P1 | S13; reject Bob; then remove a directly; reject Carol | b ref r1 | b ref r2 |
| K2 | P1 | S13; remove a directly while Bob is pending; reject Carol; then decide Bob | b ref r2 while Bob is pending; accepting Bob keeps r2, rejecting him gives r1 | b ref r2 whatever Bob's verdict |
| K3 | P1 | S13; reject Bob; one direct update sets a's ref to r9 and removes a; reject Carol | b ref r1 | b ref r2 |
| A to E | P1 | round 3's probes in `docs/plans/artifacts/cut-join-values/giveback-order/push-3/probes/probe-r3.test.ts`, case B, a property write in a named root, and D again with Dave's removal rejected and with Eve's rejected | one result in every order; D's last piece has no ref, and no two links hold ref r1 | passes |
| L1 | P1 | S38, then D+C; then reject Bob alone, accept Alice alone, and decide both, every order | each applies alone; b ref r3 unless Alice is rejected, and r1 once Alice and Bob are rejected | fails as S38 |
| L2 | P1 | S38, with Ed setting b's url w directly; reject Dave and Carol; then decide Alice and Bob, every order | a and b stay apart; b ref r3 once Alice is accepted, else none | passes |
| L3 | P1 | S38; accept Carol; then decide Alice and Bob, every order | b ref r3 once Alice is accepted, else none | passes |
| L4 | P1 | Bob proposes ref r2 and Eve ref r3 on the whole link; Carol splits; D+C; then reject Bob and accept Eve one at a time, every order | each applies alone; b ref r3 | b ref r3 |
| V1 | P1 | S20 with D+C first | Bob stays listed as a change, his suggestion shows on b, and rejecting him applies; b ref r1 | Bob decides nothing |
| T9b | P1 | link ab ref r1; Carol's split; Ed sets a's ref r7 directly; reject Carol | ab ref r7 | ab ref r7 |
| S41b | P1 | S41; Ed's direct write on b and the storage plan's fills | b ref r1 in every order, as the storage plan gives | passes |
| W1 | P1 | S13's schema; Carol's split; Ed writes b's ref and then removes it directly; Ed removes a; reject Carol | b ref r1, the storage plan's record removals default | passes |
| W2 | P1 | S13's schema; Bob proposes ref r2 on link ab ref r1; Carol splits; Carol's same change sets b's ref r2; reject Bob and accept Carol, every order | a ref r1, b ref r2 | passes |
| C2 | P1 | link abc ref r1; Carol splits after a; Cat's one change splits bc after b and removes a; reject Carol and Cat, every order | each applies alone; abc ref r1 | passes |
| AP | P1 | the repro with ref r1 on link ab, then reject Carol and accept Alice, every order; and Carol's Enter inside link ab ref r1 with the second line made a heading directly and Dave's proposed removal of the first line rejected, then reject Carol | the halves stay apart and only a holds ref r1 | passes |
| A1 | P1 | link ab ref r1; Carol's split; Ed sets b's url w directly; Alice proposes ref r3 on b; reject Carol and Alice, every order | a ref r1 and b no ref | passes |
| A2 | P1 | link abc ref r1; Carol splits after a; Ed sets bc's ref r2 directly; Bob proposes removing it; Cat splits bc after b; Ed sets c's ref r1 and removes a directly; reject Carol; then accept Bob and reject Cat, one at a time and in one call | bc ref r1 | bc ref r1 |
| S1 | P1 | link abc ref r1; Carol splits after a; Ed writes bc's ref r8, removes it and removes a directly; Alice proposes ref v on bc; reject Carol; Cat splits bc after b; Ed removes b directly; reject Alice and Cat, every order | c ref r1 | c ref v |
| S2 | P1 | S1 up to Carol's rejection; read bc's accepted ref in the review, then reject Alice | r1 both times | passes |
| S3 | P1 | S1 with Bob proposing ref w on bc after Alice, before Carol's rejection; reject Alice, then Cat, then Bob, and all three in one call | c ref r1 both ways | c ref w |
| O3 | P1 | link ab ref r1; Bob proposes removing the ref and Dan ref v1, on the whole link; Carol splits; Alice proposes ref v2 on b and removes a; reject Carol and accept Dan and Alice in one call, then reject Bob; and all four in one call | b ref v2 both ways | passes |
| N1 | P1 | link ab ref r1; Bob proposes removing the ref; Carol's one change sets ref r5 and splits after a; accept Carol and reject Bob in one call | a ref r5, b no ref | passes |
| N2 | P1 | link ab ref r1; Carol sets ref r5, then splits after a in a second change; Ed removes a directly; accept the first and reject the split | b ref r5 | passes |
| N3 | P1 | link abc ref r1; Carol splits after a; Cat's one change sets bc's ref r9 and splits it after b; Ed removes a directly; accept Cat and reject Carol | b ref r9, c no ref | passes |
| N4 | P1 | link ab ref r1, whose ref fills w; Carol splits; Ed sets b's ref r0 and removes a directly; Alice's w and Bob's r2 on b arrive as one fork, Bob's value winning; accept both, then reject Carol | b ref r2 | passes |
| N5 | P1 | N4 with a standing | a ref r1 and b ref r2 stay apart | passes |
| N6 | P1 | link abc ref r1; Alice proposes ref w on it; Carol splits after a; Bob proposes ref q on bc; Cat splits bc after b; Ed sets c's ref v and removes a and b directly; accept Alice and Bob and reject Carol and Cat, in one call and in turn with Alice last | c ref v both ways | passes |
| N7 | P1 | link ab ref r1; Bob proposes ref r2 on it; Carol splits; Ed removes a directly; Carol withdraws her split; then reject Bob | Bob stays pending and b stores r2; rejecting Bob gives r1 | Bob is gone and b keeps r2 |
| N8 | P1 | link ab ref r1; Bob proposes ref r2 on it; Carol splits; accept Carol and reject Bob | b stores no tag | passes |
| N9 | P1 | N4 with Alice's value winning | b ref r1 | passes |
| N10 | P1 | N9 with a standing and Ed setting a's ref r7 directly | one link ab with ref r7 | passes |
| N11 | P1 | link ab ref r1, whose ref has no default; Carol splits; Ed sets b's ref r0 and removes a directly; Alice proposes ref r2 on b and Cat removes it, while Bob, who saw neither, removes b's ref; accept all three, then reject Carol | b ref r1 | passes |
| N12 | P1 | link ab ref r1; Alice's r2 and Bob's r3 on it arrive as one fork, Bob's value winning; Carol splits; accept Alice and Bob; Ed removes a directly; reject Carol | b ref r3 | passes |
| N13 | P1 | N12 with Alice removing the ref | b ref r3 | passes |
| N14 | P1 | link abc ref r1; Carol splits after a; Alice's r3 and Bob's r2 on bc arrive as one fork, Bob's value winning; accept both; Cat splits bc after b; Ed removes a and b directly; reject Carol and Cat, in one call and in either order | c ref r2 | passes |
| CB | P1 | link abc ref r1 and link xy; Bob proposes ref r2 on abc; Carol splits abc after a; Cat splits bc after b; Ed sets c's ref r1 directly; Bob proposes splitting xy after x; Cat proposes removing x; Dave proposes removing a; D+C | rejecting Cat and rejecting Bob decide only together, and every other set stays reachable | each applies alone, and b keeps ref r2 after Bob is rejected |
| G1 | P2 | next's 12 gate failures of the give-back family | none | 12 |
| G9 | P2 | sixteen pending cuts of one link's tail, each by another change | each rejection applies alone | each applies alone |
| O1 | P0 | the order check's give-back family at its gate bound | no failure and no coupled set beyond next's | 12 failures, 1,105 coupled sets |
| O2 | P1 | the family at `--giveback-changes=3`, `--giveback-edits=1` and `--giveback-ops=4 --giveback-changes=3` | no failure, and the same coupled sets as next, compared one by one | the Findings' counts |
| Y1 | P1 | two Yjs peers each reject the same cut at once | both peers read the same | no give-back |
| G2 | P1 | every row that passes on next in the storage and redesign tables; T42 and T37's two-peer variant | still passes, and converges | passes |

CB is a new coupled set. S20 keeps Bob's suggestion deciding b after Carol's cut is rejected, so whether Cat's halves b and c join depends on Bob, and rejecting Cat waits on him. Bob's own cut of xy waits on Cat's removal of x. Next decides each alone only because Bob stops deciding b, which is S20's failure. The order law leaves a new coupled set to the owner, and the Defaults row keeps this one. It takes four changes on two links, more than any bound the order check runs.

## Design

Three architect runners and a cross-judge chose this shape. The judge's verdict, with each candidate's traces, is `docs/plans/artifacts/cut-join-values/giveback-3/architect/judge/verdict.md`. All three runners found that the cut's tag cannot sit in the key's history as an ordinary tag. `decideKey` makes a pending step below an accepted one wait, and a pending step above a rejected one too, so a plain removal tag of the cut couples it with every suggestion stacked on the same key.

**Recording.** When a proposed inline split, alone or inside an Enter, drops a key from its right half, the recorder copies the left half's format tags on that key onto the right half, with their ids and changes. It then records one tag of the cut's change over every copy, the cut's own earlier writes included, through `recordFormats`, that writes the split's output (N1 to N3). Only that tag carries a new stored field, `split`, naming the cut's change. The copies keep their own fields, so in a chain an earlier cut's tag stays that cut's tag, with its history beneath it (S1). A key's split history is the topmost tag that carries the field and every tag it reaches through `over`, and one helper in `layers.ts` names it for every reader. The keys are those the left half holds a value or tags for that the right half's raw split output lacks, which is what `kept` and `droppedOnSplit` name today. Writes to the right half after the split link only the split's tag and what stands above it, with that tag's write, the split's output, as their floor. So once the split's tags go, as when the halves stay apart, such a write reads the output, never a copy (A1). They never merge with a tag of the split's history, so the cut's own later write there stays its own tag (W2). The split no longer writes `kept`, and a forced type keeps `splitTypeTags` as it is.

**Deciding.** A copy neither waits nor makes another step wait, except inside a fork, whose tags still decide as one. When the cut's tag is accepted, it and the copies under it leave the right half without landing, since the left half holds the originals (N8). While the cut is pending, its history stays stored as it is, whatever verdicts its copies get, since rejecting the cut reads them. When it is rejected, the copies stay as the right half's history, and one value rule changes. If the right half has no standing write of its own on the key, or the value its standing writes leave is the split's output, the key reads the copies. It reads the value that the topmost copy no verdict rejects leaves, as stored above that copy, so a copied fork gives back the value its peers settled on, not the write with the smaller id. With every copy rejected, it reads the value from before the split (S41, W1, N12, N13). While those writes are the top of the key, the value they leave is the stored one, so the rule reads a fork's settled value, not each write in it (N4, N9, N11). When the copies hold an earlier cut's history, they read as that history decides on its own, from the value the later cut's tag recorded as stored under it, so a chain gives back what the earlier rejected cut gave (S1, N14). While that history still waits on a pending change, the key reads the topmost copy no verdict rejects (S3). While the right half has its own pending write on that key, what its writes leave is not known yet, so the cut's rejected tag, the copies and the standing writes over them stay stored until that write is decided (O2). A rejected cut's whole history, each cut's tag in it included, stays stored while any tag in it is pending. Each cut's tag is what marks the copies under it as history, and a write over the split reaches them only through it, so the copies keep waiting on nothing, as they did in the call that rejected the cut (S3, O3, N6). Withdrawing a change with a mark stored in a split's history, such as a rejected cut or a suggestion copied under a pending one, records its rejection, so later reads see it rejected and the other suggestions on the copies stay pending (N7). That rule lives in `decideKey`, so settling, admission, reload and the review read the same value. The resolver and the review read a node's split history whole, its rejected tags included, and treat a change an earlier call rejected as rejected, so a later call compares and reviews the value that history gives (A2, S2). So the right half reads its own stored tags in every order, and rejecting a cut whose left half is gone has nothing left to do. `joinRejectedCuts` loses its give-back branch, and the resolver stops passing it `endSurvives` and the schema.

**Joins.** A key the split dropped compares by where the right half's value comes from. When `decideKey` reads the right half's copies for that key, the comparison reads the left half's value. `decideKey` reports that read to the comparison, so the two cannot disagree (N5, N10). When the halves join, the left half supplies that key even where its value is absent, and the right half's copies never enter the joined node. Otherwise the halves compare as now. The right half's copies never count as changes touching the comparison, since the left half's originals already do. A tag on the left half does not count either for a key the right half takes from the left, since that key compares equal whatever its verdict (C2). When the halves stay apart and the left half stands, in the same block or in another, the cut's tag and its copies leave the right half, and a write over them reads the split's output, as on acceptance. So a dropped key such as an element id never stands on both halves (AP, A1). In one block the verdict already waits on a pending change that could remove the left half. In two blocks, next's waits already decide whether the cut or the removal goes first. A removal of the left half itself waits on the cut, so the cut decides first and finds it standing, even when both are decided in one call. A removal of the left half's whole block makes the cut wait instead, so the cut finds it gone (D). The split's output keeps its current meaning: absent, a default some place fills for that key, or a generated value. So S41 and the record removals default stay as the storage plan gives them.

**Older documents.** A cut saved before this change has `kept` and no copies. While its left half stays, it joins as on next. Once its left half is gone, rejecting it gives nothing back, in every order.

**Why every order agrees.** A key's value depends on which verdicts exist, not on their order, as on next. The right half's history is written when the split is recorded and afterwards only by writes to the right half, so no decision, removal, load or peer reads the left half's values to compute it. That covers round 3's cases, since nothing scans other nodes or roots for a value. Whether the copies leave at a rejection depends only on whether the left half stands when the cut decides, and next's waits fix that order. Above the copies, the right half holds the same tags it holds on next, so its waits there are next's. The copies wait on nothing, and their changes already make the left half wait while it stands. A rejected cut adds no wait of its own. The joins comparison waits only on changes that touch the left half or the right half's own writes, as on next. That is why CB couples. Bob's original on the left half is gone, and his copy makes b's value depend on him.

**Cost.** Per proposed inline split, for each dropped key the left half has a value or tags for, one walk of that key's steps, one new tag and the copied tags, usually one key and zero to two copies. A chain of pending cuts on one link copies each earlier cut's tags again, so copies grow with the square of the chain. Sixteen pending cuts of one link's tail save about 31 KB where next saves 4 KB, and rejecting the first took 33 ms, measured while the order checks loaded the machine, where next took 9 ms (G9). A rejected cut does less work than today, because the left-half-gone branch goes. A removal does nothing new. In every cohort of the joins decide-latency probe, the change does the same resolver work as next, so that brief's work lines hold. Its paired wall-clock line did not run, and the work counts leave out reading the split history.

## Main changes

- A proposed inline split copies the left half's history on each key it drops onto the right half, under one tag of the cut's change that alone carries the marker, and one helper names each key's split history.
- A write over a split's tag links only from that tag up and reads its output once the split's tags go.
- `decideKey` leaves the split history out of the waits between steps, keeps it whole while the cut is pending or, once the cut is rejected, while any tag in it is pending, and reads the copies, or an earlier cut's history among them, when the value the right half's own standing writes leave on the key is the split's output. It reports that read to the joins comparison.
- Withdrawing a change with a mark stored in a split's history records its rejection.
- The resolver and the review keep a split history's rejected tags and treat a change an earlier call rejected as rejected.
- The joins comparison judges a dropped key by where the right half's value comes from, the left half supplies a joined key when the right half holds only the split's output, and halves that stay apart drop the copies.
- The split stops writing `kept`, and the rejection-time give-back in `joinRejectedCuts` goes.

## Steps

- [x] Build the copy recorder and its marker, `decideKey`'s exemption and output rule, the joins provenance, the left supplier and the apart rule, and delete the give-back branch and the `kept` write. Proof: every row above passes, T11 through the redesign table check and the S rows through the storage table check; rows S20, K2, K3 with T9b, W1, W2, C2, AP, D, A1, A2, S1, S2, S3, O3, N1 to N14 and O2's open history as plitejs tests, and round 3's probes and rows K1, L1 to L4, V1, S41b and CB through the panel's probe files; the order check at its gate bound and at O2's bounds, comparing `--together` identities with next's; T42 and T37's two-peer variant converge; the plitejs suite, typecheck and lint; Benchmark's decide-latency probe within the joins slice's limits. Fix the storage plan's Cut record paragraph, which gives the old give-back.
- [x] Writing passes, a push panel on the diff, and one land.mjs run. Proof: the panel's critical findings settled as the Panel review rule says, and land.mjs pushes next.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A suggestion made before a split, once the first half is removed | It still decides the second half, because it covered the whole link (look) | It decides nothing there, as today | K2 as before | small |
| A direct change to the first half after a split, before its removal | It leaves with the first half, so rejecting the split gives the second half the value from before the split (look) | The second half takes it | K3 as before | small |
| A pair of suggestions across two links that must be decided together, CB's | Keep it, because a suggestion made before a split must keep deciding the second half (look) | Redesign rejected cuts so a join can wait for a later decision | no new together set | small |
| Documents saved before this change | Rejecting an old split whose first half is gone gives nothing back, in every order (look) | Keep today's give-back from what the cut saved, which needs the rejection-time branch this change deletes | keep old give-back | detail |
| Older editors opening a new document | One that holds a split's tag, while the split is pending or under an accepted write over a rejected split, fails with the damaged-document error any newer review mark gives; no fence (look) | A format revision, so older editors refuse such documents, but the new editor then refuses every older envelope and room with review marks | fence marks | small |
| Halves on two lines, when a suggestion removes only the first link | The split decides first and finds the first link standing, so the second link gets nothing back, in every order (look) | Give it back as when the whole first line goes, which makes the split wait on that removal and couples round 3's probe D | give back on own removal | small |
| Withdrawing a change with a mark stored in a split's history, such as a rejected split or a suggestion copied under a pending one | It records a rejection, so later reads see it rejected and the other suggestions on the copies stay pending (safe) | Withdraw with no record, which leaves a stored split tag that reads as pending again on the next call | withdraw leaves no record | detail |
| Today's 12 click-order failures | Fix them in this change, since the same joining rule causes them (safe) | Leave them for later | skip the 12 | small |

## Open work

- The order check's gaps that the give-back order plan deferred: `decide` returns an empty decision for a change it does not list, the family compares only children, its explorer skips batch states whose history later decisions could read, S39's check skips past three pending changes, the script parses verdicts with a regular expression, and `finding-baseline.mjs` checks only the base's rules. Owner: zbeyens, in the subject's Open work. Stop: the next change to the order check's give-back family.
- The give-back cases that fail on next and on the reverted slice alike stay with suggested task t_44385dec, as the storage plan says. Owner: zbeyens. Stop: that task's landing.
- The decide-latency brief's paired wall-clock line, C with three touching changes and D at 10,000 paragraphs, did not run for this change. No cohort covers withdrawal either, which now reads the whole document once per withdrawn change. Owner: zbeyens. Stop: a decide-latency report on authored review.
- Copies grow with the square of a chain of pending cuts on one link (G9). Owner: zbeyens. Stop: a chain longer than sixteen cuts in real use, or a decide-latency limit missed.
- An accepted suggestion whose tag sits over a rejected cut's tag stays stored instead of landing, as T10's Alice does. So does one on a right half that stays apart, because the apart rule drops the cut's tag without landing it, where next lands the suggestion. The diff panel's Astra and Opus seats traced in the source, without running it, cases where that stored tag makes a later direct retype refuse, because the new type cannot hold the key. Owner: zbeyens. Stop: a report of a refused retype or of a decided document an older editor refuses.
- `decideKey` has four split rules: the copies' exemption from waits, the open history, the whole history kept while a tag in it is pending, and the rejected-split read. The diff panel's Opus seat sketched deciding the history and the right half's own writes apart and combining them by the cut's verdict. Owner: zbeyens. Stop: the next change to those rules.
- Two Yjs peers that each reject the same cut before they sync leave its paragraph twice on both peers, on next too, while Y1's own requirement, that both read the same, holds. Owner: suggested task t_649d2131. Stop: that task's landing.
- A rejected cut whose first half sits inside an element a suggestion removes, or on a line in another container, can still decide differently by click order, as on next. Owner: zbeyens. Stop: a report of it, when the cut would wait on any pending removal of the first half's block or ancestor.
- The order check's give-back family builds one split whose halves differ only on the dropped key, so chained cuts and halves kept apart by another key are covered by tests A1, A2, S1, S2 and S3 alone. Owner: zbeyens, in the subject's Open work. Stop: the next change to the order check's give-back family.
- Reflect's Backlog from this run's last stretch, each a workflow change for the owner to take or drop:
  1. Stop a run by TaskStop or its recorded PID, never by `pkill -f` on a pattern, because other sessions on this host run the same commands. A hook that denies `pkill -f` and `killall` would enforce it.
  2. A package's `lint:partition:*` runs `ultracite check` without the type-aware rules that land's `lint:task` adds, so two casts passed every gate and failed land. A pre-land gate can run `pnpm lint:task` on the changed files, or the partition lint can gain the type-aware pass once its existing violations are counted.
  3. The verify skill's commands can name oxfmt as the formatter and bun with the plite source preload as plitejs's test runner. Each was mistaken twice here, both times after a compaction.
  4. A test or probe of the authored tree carries the whole document between decide calls, because the verdict records live on its root. Carrying only the children hid a real panel finding.
  5. A finished, independent piece, such as the order check, lands once it passes, rather than waiting for an unfinished one.
  6. An answer about how long landing takes estimates from how the remaining gate has gone so far, not from its best case.
  7. When panels keep finding bugs in shapes the order check never builds, such as forks and chains of splits, the check grows those shapes before the next fix.
  8. A panel round saves the exact bytes its seats review before they start.
  9. A test's expected values come from the plan or from next, never from the candidate's own output.
  10. A row claims a pass only for a check that asserts, run on the final bytes.
  11. Skipping the plan panel to save time moved design discovery after the build, which a revert then undid.
  12. The lead prototypes in its own clean worktree, where its Edit calls work.

  Owner: zbeyens. Stop: the owner takes or drops each item.

## Close

The give-back copy landed on next as `e1922aa309`, `fix(plitejs): copy what a split drops onto its second half, so rejecting it gives it back in any order`. A proposed split copies the first half's tags on each key it drops onto the second half, under one tag of the split. Rejecting the split reads those copies, so the second half gets its value back in every decision order, whether or not someone removed the first half. Halves that stay apart drop the copies, so an id never stands on both links.

Deviations. Each of the diff panel's three rounds found a case where the rejected split read the wrong write of a fork. Round 2 replaced round 1's fork rule with the value the second half's own writes leave, and made `decideKey` report its read to the joins comparison, so the two cannot disagree. Round 3 made the copies read their stored values too, so a copied fork gives back what its peers settled on, even through a chain of rejected splits. Rows N1 to N8 come from round 1, N9 to N11 from round 2 and N12 to N14 from round 3. Round 3 was the last round the cap allows, so its fix shipped on its own tests, two mutants and a full rerun of the gates.

Proof. Every P0 and P1 row of this plan passes. The storage plan's table fails only T38, a P2 row, where next fails T11, S20 and T38. The redesign plan's table fails T12, T23, T31 and T38, as it does on next; the storage plan's table states T12, T23 and T31 with stored values and passes them. T42 and T37's two-peer variant converge. In Y1 both peers read the same, though both keep the paragraph twice, as on next. The order check's give-back family has no failure at its gate bound, where next has 12, and the same coupled sets as next at the gate bound, at `--giveback-edits=1`, `--giveback-changes=1 --giveback-edits=1`, `--giveback-changes=3` and `--giveback-ops=4 --giveback-changes=3`, and for the five-operation script. The quote family passes at `--marks=3` and `--blocks=3`. The plitejs typecheck, lint and authored suite pass, the decide-latency probe's work lines match next's, and land.mjs's `pnpm check --affected` passed all 26 steps.

Limits. The decide-latency probe's paired wall-clock line did not run. The order check's give-back family builds one split whose halves differ only on the dropped key, so chained cuts and halves kept apart by another key rest on tests A1, A2, S1, S2 and S3. CB, a new pair that must be decided together, takes four changes on two links, more than any bound the order check runs, and the Defaults row keeps it.

Counts. 3 plan panel rounds and 3 diff panel rounds, each of 3 seats; 17 critical findings, all applied. Open work above lists what stays open, each item with its owner and stop.

Reflect. One reviewer read this run from the owner's "this task is getting long" to the end, through the judgment, tooling and divergent lenses, and returned 19 findings. None qualified for applying in the run: none fixes a helper that refuses a case its rule allows, and none rewords a rule without adding words. Twelve went to the Backlog in Open work. Seven were dropped: a partitioned test command's own error names its fix; the harness already says how to wait on long runs and what `get_session` takes; the main checkout's run directories are already written with the shell, as the landing rule says; the claim that a checker that catches past bugs will catch future ones joins items 7 and 11; landing at the panel cap is disclosed in Deviations, and the checker's blind spot is in Open work; re-reading the facts behind repeated mistakes after a compaction joins item 3; and the tooling lens found no context the owner supplied by hand.
