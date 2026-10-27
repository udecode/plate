# A rejected Enter rejoins the same way in every click order, fifth iteration

Status: superseded by docs/plans/2026-10-26-split-rejoin-order-6.md
Topic: cut-join
Playbook: plan

Pivot from iteration 4, `docs/plans/2026-10-25-split-rejoin-order-4.md`. Round 3 of its plan panel found six cases where deciding one at a time and deciding at once differ on iteration 4 and agree on next: three from opus, two from astra and one from sol. The lead then ran the order check's unwrap family at three changes and three operations, 5,002 scripts. Iteration 4 fails 288 orders in 190 scripts there, iteration 3 fails 222 in 136, and next fails 738 in 160. Iterations 3 and 4 hold a rejected Enter's pieces apart and give the dropped ref back by local rules, and each panel round found shapes those rules miss. So this iteration replaces the rules instead of patching them again. The order check now also builds a write between two Enters and real paragraph Enters, which round 3 needed and the generator could not build.

## Brief

### What will change?

You asked that a rejected Enter rejoin the same way in any click order. Iteration 4 failed six cases. Now a link cut by pending Enters stays unchanged until its last suggestion is decided, then all decisions apply together.

### What could go wrong?

Deciding one suggestion on such a link shows no change until the last one is decided, which can look broken. An older editor may apply saved decisions early. An app that saves content without records loses them.

## Teach

A suggested Enter inside a link splits it into pieces. Other suggestions can unwrap a piece, empty it, remove it, or write its ref or note. When the reviewer rejects the Enter, the pieces join back, and the right piece gets back the ref the split took.

Today each decision lands right away, so a decision on one piece changes what a later reject sees, and click order changes the joined link. Iterations 3 and 4 added rules to rebuild what early decisions lost, and each review found a case they missed.

Now the link and everything on it stay unchanged while any suggestion on it is pending. Each decision is saved and leaves the review list. The last decision applies all the saved ones together, exactly as deciding them all at once would, so every order ends the same. If the last pending suggestion disappears undecided, as when its author deletes their own text, the saved decisions apply then.

## Main changes

- A new `packages/plitejs/src/authored/tree/chains.ts` decides which marks a resolve may change. `chainsOf` groups the pieces of cut links by their cut tags, decided or not, with the nodes between them, their descendants and the lines and containers that hold them. The changes that touch a chain are every suggestion on those nodes and every place change on those lines. Chains that share a change merge. `sealChains` builds one run's reading. While a touching change stays pending after the call, every touching change reads as pending in that run, so nothing on the chain changes. A wait that names a decided touching change then names the chain's pending changes instead. When none stays pending, the run reads each stored verdict of a touching change as its own decision, so the landing run is the run that decides them all at once.
- `resolveAuthoredChildren` in `packages/plitejs/src/authored/tree/resolve.ts` resolves through that reading, so `decideKey`, `halfOf`, `standingClaimsOf` and the cut joins all read one set of verdicts. The order check's quote documents go through the same boundary.
- Review reads a decided change on a waiting chain as decided. It leaves the review list and the marks `reviewOf` paints, `decide` lists it in its result, and it stays decided after a reload. `marksOf` in `packages/plitejs/src/authored/facts/facts.ts` drops a mark whose stored verdict a waiting chain holds, and `factsOf` finds those verdicts once per document. Every other stored rejection reads as it does in iteration 3, so `SETTLED_BY_REJECT` gains no kind.
- Every settle leaves a waiting chain's nodes as recorded: `settleValue` and `settleNode` in `packages/plitejs/src/authored/facts/settle.ts`, the undo repair, the collaboration format restore and claim compaction. A run that resolves only some blocks, such as accepting the author's own writes, takes in every line of a chain it meets.
- A waiting link lands once nothing on it is pending, however its last pending suggestion goes. A withdrawal lands it in that call. A write that erases that suggestion lands it in the write's commit. `acceptOwn` in `packages/plitejs/src/authored/authored.ts` takes every chain of the written blocks that holds a stored verdict and has nothing pending, where iteration 3's `touchesHeldCut` took only a stored-rejected cut. It reads its result once more when accepting the write's own claims frees a chain. Chain discovery skips a mark on an emptied text leaf, which normalizing removes. A document that loads with such a chain lands it in the load's settle.
- Iteration 3 and 4's hold machinery goes, because a sealed chain never reaches it: `lostLefts`, `liftedLefts`, the removal wait, the metadata hold, `middleMayMove`, the stacked plain wait, the inline cut probes, `deferredCuts`, `options.holds`, `deferredSplits`, `writeTouches`, `metadataWritersOf`, `Half.stacked` and the `decideKey` unwrap exemption. Iteration 4's rules for a fully decided link stay: `leftOf` passes a removed or lifted piece, `reclaimFrom` gives back from a gone left piece, `follows`, `apartFrom`, `keepsContent` and the `joinedShell` left-tag fix.
- Chain discovery starts from the blocks an operation already reads and reads only toward each found cut's other side, so it reads the chain's own blocks and nothing else. Settle reads the chains of the blocks it settles, and review reads use the waiting chains that the resolve which produced the value recorded. A new `chainNodes` work counter counts what discovery reads.
- The order check's unwrap family builds a write or edit between the two Enters, real paragraph Enters, a letter typed into or between pieces and a join of the link's paragraph, and splits a family into shards. It compares the pending review list one at a time with deciding at once, and fails when a decided change is still listed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a reviewer sees after deciding one suggestion on a link that waits | The suggestion leaves the review list, and the link keeps every suggestion as made until its last one is decided (look) | A new mark that shows the decision waiting on the link, which needs a new public read | waiting mark | big |
| A suggestion that touches a waiting link and also changes something else | All of it waits for the link (look) | The part outside the link lands now, which needs a wait at every place that reads the link from outside | split change | small |
| A letter typed on a waiting link | It waits with the link | It lands at once, which let one click order land the link while another kept it waiting | typing lands | small |
| What the document stores for a waiting link | Nothing new; the link keeps its marks and saved verdicts | A private copy of next's rules for links beside block decisions, kept in a new stored record | engine copy | small |
| A removed left piece whose ref an accepted suggestion unset | It still gives the ref back, as iteration 4 does when everything is decided at once | It gives back only the ref it holds once its own writes are decided | held ref | small |
| An older editor that opens a document with a waiting link | It may apply the saved decisions early, with no version check (look) | Refuse to open such a document in an older editor | version gate | small |
| A document that loads with a waiting link that has nothing pending, such as one an older editor wrote | It lands on load | It stays as recorded, and nothing pending is left to decide on it | commit only | small |
| After the plan panel | Build right away | Stop after the plan | hold | detail |

## Evidence

### Requirements

- [ask] A rejected split's rejoin must not depend on decision order (the task's title).
- [ask] A suggested unwrap of an element between the halves must not change the rejoin by decision order, whether it is pending or accepted in the same call (finding 5 of the task brief).
- [ask] Say what a decided unwrap of one half leaves after the reject (finding 7).
- [law] Deciding one at a time in any admissible order equals deciding the same verdicts at once, and no coupled set next lacks appears (the `authored-decision-order` skill's property).
- [premise] Iteration 4's results for a link whose suggestions are all decided at once are the right ones. This is the lead's conclusion.
- [premise] No further local rule in iteration 4's cut code makes holding a cut order-safe. This is the lead's conclusion from four iterations of panel rounds.
- [premise] A document's records travel with its children. A host that saves only the children loses the verdicts saved on a waiting link, and those suggestions read as pending again. next already keeps landed writes and contexts there.

### Critical findings this iteration takes over

Each is `open` in iteration 4's decision log with this plan as its patch, and each fails on iteration 4 and passes on next through the order check's own script runs.

- Opus C1: a pending removal of the middle piece skips the removal wait, so the last piece loses the ref when one suggestion unsets and unwraps the left piece and another removes it.
- Opus C2: deciding at once withholds the ref single steps give back after a suggestion unwraps the left piece while two removals stay pending.
- Opus C3: content standing between the pieces keeps them apart while a removal of the left piece is pending, so the ref given back depends on click order.
- Astra 1: across two paragraph Enters, the give-back stops at the paragraph boundary, so an Editing ref write on the last piece survives in one order only.
- Astra 2: a note hold makes accepting an emptied piece's note wait on another note, a set of decisions next lacks.
- Sol 1: after a removal of the middle piece, a later decision drops a pending ref suggestion from review in one order only.

### Design

`architect` ran an arena of three runners on the outcome and the measured classes: opus, gpt-6-astra and gpt-6.1-sol, each at xhigh. All three proposed one shape: keep a cut link's recorded source until every suggestion touching it is decided, then resolve it once from every stored verdict. They differed on what guards block decisions next to the link. Opus's sealed chain adds no stored field and reuses the resolver's own at-once run for the landing. Astra's left the block side unproved, and sol's kept a private copy of next's engine in a new stored record. The lead scored opus 16, astra 15 and sol 15, and an anonymized cross-judge scored them 15, 14 and 15 with 5 for a no-artifact control. Both picked opus's as the base. The runner task named four directions as optional hints, which the plan playbook asks it not to do, so the three runners' agreement is weaker evidence than three independent finds; the decision log records that deviation.

Grafts: a review reading scoped to sealed chains instead of a global widening of `SETTLED_BY_REJECT` (astra, sol); sealing at every settle, not only in the cut join (astra); every wait that names a decided touching change maps to the chain's pending changes, at all of the resolver's wait sites (judge); the pending review list in the order check (judge); the block-side lemma proved by comparing coupled-set identities with next's, never counts (astra, sol). Cases a losing candidate handles that the base drops, each a graft or a limit: blocks wholly between two pieces' lines and a removal of an ancestor, which sol's closure covers, are Open work; marks on another change's typed text cannot split routes, because typed text waits too; moved text and an unset property read their final context, as iteration 3 decided; and the reviewer's view of a decided suggestion that waits is the `waiting mark` Defaults row.

A prototype on iteration 4's code, `split-rejoin-p5`, measured the design before the plan. Every coupled set it keeps is one of next's, compared by identity:

| Bound | next failing orders | next coupled sets | Sealed chain failures | Sealed chain coupled sets |
| --- | --- | --- | --- | --- |
| Unwrap family, three changes and three operations, 5,002 scripts | 738 | 1,852 | 0 | 0 |
| The same with the second split after writes, 6,672 scripts | 972 | 2,472 | 0 | 0 |
| The same with real paragraph Enters, 5,002 scripts | 0 | 5,006 | 0 | 0 |
| A ref on the link from the start, one write, 14,550 scripts | 2,434 | 6,454 | 0 | 0 |
| A note written once, 11,984 scripts | 1,200 | 3,488 | 0 | 0 |
| A join of the link's paragraph, 2,884 scripts | 1,444 | 724 | 0 | 0 |
| A ref or a note written once with real paragraph Enters, two operations, 1,006 scripts | 4 | 504 | 0 | 0 |
| The same with the second split after writes, 1,420 scripts | 36 | 345 | 0 | 0 |
| A letter typed into or between pieces, 23,686 scripts | 7,676 | 5,386 | 0 | 0 |
| Quotes at three marks | 0 | 2,362 | 0 | 2,340 |
| Quotes at three blocks | 0 | 372 | 0 | 358 |
| Give-back family with three changes | 0 | 1,303 | 0 | 0 |
| The gate | quotes 0, give-back 0, unwrap 12 | 66, 1,105 and 96 | 0 | 64, 0 and 0 |

Each round 3 case passes as one script: opus's C1 and C3 (C3 as the reordered twin the generator can build), C2, astra 1 with real Enters and an Editing write, astra 2, and sol 1. A trace of the unwrap and gate runs counted no call of iteration 4's hold machinery. The first prototype left a decided rejection of an unwrap listed in review while its chain waited. Its fix, the review reading in Main changes, passes that case. The first unwrap row and the rows from the ref family down ran on the fixed prototype, which also compares the pending review list at each step; the other rows ran on the first prototype.

On the windowed prototype, 31 existing cuts and decisions tests fail. The lead traced the six whose result looked wrong rather than only different from next's. Two pass only the children from one editor to the next, which drops the saved verdicts. With the whole document, the ref test gives next's `ab@u#r1`, and the correction test gives `amc@u` in every order. That is next's own result for rejecting all three suggestions at once; next gives `ac@u` only when Dave's text is rejected first. A withdrawn Enter leaves the last piece without the ref while a ref suggestion stays pending, as a waiting link should, and deciding that suggestion gives next's result. In the other three, a write erased the last pending suggestion and the link stayed split with nothing pending, even after a reload. The chain counted a mark on the emptied text leaf as pending, and when Editing erased the text, the commit read the chain before it applied that deletion. With both fixed in the prototype, the write lands the link and 29 tests fail, each by design. A probe then found a waiting link whose saved verdicts all accept. Erasing its last pending text leaves its accepted unwrap unlanded, because iteration 3's write trigger fires only on a rejected cut. Main changes and Step 3 cover that case.

### Performance

- applicability: applied. Sealing adds chain discovery to every resolve and settle, and to review reads of a decided mark, which run on every keystroke.
- Vercel rules used: none; the change is headless resolver work with no React or DOM change.
- questions answered: cohorts, repeated unit, interaction latency as deterministic work per keystroke and per decision. Memory and DOM, readiness, page load and native behavior do not apply: no DOM, selection or rendering path changes.
- repeated unit: the block, and the waiting link.
- cohorts: 100 and 2,000 blocks, 5,000 for the settle budgets; 0, 1 and 10 waiting links at the document's start.
- budgets: every existing test of the authored work file, frozen before the candidate ran, where next passes 80 of 80 and iteration 4 81 of 81, plus `chainNodes` equal at both sizes and both link counts for work away from a waiting link. The deterministic counts have no noise.
- interaction metrics: work counts, not timings. A timing line would add nothing the counts miss at these cohorts; the order check's slower runs on the prototype are a constant factor on two-paragraph documents.
- trace and field proof: lab-only, a proof gap for a production claim.
- result: the first prototype, which walked every content root, fails 10 of next's budgets, for example 10,077 against 277 other reads for a Suggesting letter at 5,000 and 100 blocks; that run is the planted control. The windowed prototype in `split-rejoin-p6` fails 17 tests before its change and passes every budget and the five new cohort tests after, with every order result unchanged. Only iteration 4's probe-count test still fails, and Step 5 deletes it with the probes.
- plan delta: Step 5 holds the five cohort tests and gives the three paths the probe did not measure the same budget.

### Controls at base

next fails the unwrap families above, and each round 3 case fails on iteration 4 and passes on next, through the order check's own runs: the `h1`, `h6`, `h7r`, `a2`, `sol1` and `astra1` logs in the run directory. With lever 2, iteration 4 also fails 8 typed-letter scripts at two changes and two operations and the pending comparison on sol 1. next has 1,444 failing orders and 724 coupled sets in the 2,884-script paragraph-join family.

## Steps

- [ ] 1. Port the order check's unwrap family from the lever: `--lift-interleave`, `--lift-enter`, `--lift-shard`, `--lift-inserts`, `--lift-place`, the pending review list in each compared step, and a check that no decided change stays listed. Drop the temporary script-list hook. Proof: with every new flag off, the family yields byte-identical scripts at three changes and three operations alone, with the second split after writes, and with the mixed key and one write; next reproduces the counts in Design and Controls at base; the pending comparison fails sol 1 on iteration 4, and the listed check fails the prototype's probe on the first sealed prototype.
- [ ] 2. Seal cut chains: `chains.ts`, the resolve through its reading, the wait mapping and revival. Proof: cuts tests through `decide`, each deciding every order and comparing each step with deciding the same verdicts at once: one script per class in the c3o3 class list, each round 3 case (opus's C1, C2 and C3's twin, astra 1 with real Enters and an Editing write, astra 2, sol 1 inline and with real Enters), and the typed-letter case. Each fails on next or on iteration 4 (next plus the saved iteration 4 patch) through `tooling/scripts/proof-worktree.mjs --expect-fail`, and passes after. Rewrite the 29 existing cuts and decisions tests that fail on the windowed prototype, listed in `tests-cuts-decisions-a3-a1.log` in the run directory. Of them, 16 assert a step result while a suggestion on the link stays pending, 11 a call that leaves one pending, and 2 a settle that removes a waiting link's piece. Each now asserts that the decision applies, the link stays as recorded and it lands with the last suggestion, with the at-once result unchanged. The two that pass only children carry the whole document, and the correction test expects next's at-once `amc@u` in every order.
- [ ] 3. Keep review meaning on a waiting link. Proof: decisions tests. Rejecting a suggested unwrap on a waiting link applies, lists it in the result, takes it off the review list and keeps it off after a reload. Sol 1's pending ref write stays listed until it is decided. Withdrawing the last pending suggestion lands the link in that call. A write that erases the last pending suggestion lands the link in its commit, for its author's own deletion, an Editing deletion and an undo of the typing, both when the saved verdicts reject the Enter and when they all accept. A document saved with such a link lands it on load. After each of these, the review list and the painted marks match a fresh editor's on the same document, because the ledger re-reads only blocks that name a newly decided change. The call that lands the link lists only its own change in its result; the windowed prototype lists the earlier ones again. The sealed reading moves out of `facts.ts`, which the prototype made import `chains.ts` and back. Each test fails on one of the prototypes or on next and passes after.
- [ ] 4. Keep a waiting link as recorded through every settle. Proof: tests for undo after a decision on a waiting link, a collaboration format restore, claim compaction, and accepting the author's own writes on one of the link's lines: each leaves the link's marks, text and verdict records as before, and the link lands with its last suggestion. Each fails without the seal at its site.
- [ ] 5. Delete iteration 3 and 4's hold machinery and keep the read budgets. Proof: every test of `packages/plitejs/test/authored-tree-work.test.ts` with `chainNodes` compared, and the prototype's five waiting-link tests: a Suggesting and an Editing letter in a middle block, deciding a middle suggestion and a peer verdict on a middle block, each the same work at 2,000 blocks as at 100 and with 10 waiting links as with 1, and deciding a pending suggestion on the waiting link, the same at 2,000 blocks as at 100. Three paths the probe did not measure get the same budget: a letter typed inside a waiting link's own line, a review read of the waiting link after a letter typed elsewhere in a document just loaded with it, and a fully decided chain that waits only through a chain it merges with. A miss on any of these sends the design back to `architect`.
- [ ] 6. Hold the order check. Proof: `pnpm check:authored-order` at the gate after `--lower` drops the give-back, unwrap and quote sets this build removes and adds none. Quotes at three marks and three blocks, the give-back family with three changes and with an Editing author, and each unwrap family of Design and the typed letter, each with no failure and no coupled-set identity next lacks, compared with ids-diff against next's files. A family runs whole when one timed sample says it fits the hour in one run, and otherwise at the largest bound that does; the rest goes to the suggested task in Open work.
- [ ] 7. Hold Plate and the suites. Proof: every Plate authored test, the column width order tests among them, the plitejs authored suites and work budgets, the plitejs typecheck and `pnpm lint:task` on the changed files, and one hand drive of the suggestion demo per the `verify` skill, where deciding a suggestion on a link that a pending Enter cut shows the waiting state the `waiting mark` row picks and the last decision lands the link.
- [ ] 8. Write it down. Fold this plan into `docs/plans/topics/cut-join.md`, update the `authored-decision-order` skill's Findings, flags and coverage record for `chains.ts`, the unwrap family section of its rule, and add a changeset. Rewrite the rejected Enter paragraph of `content/docs/(plugins)/(collaboration)/suggestion.mdx` and its Chinese twin, per the `plate-docs` skill, so it says a decision on a link that pending Enters cut applies and the link stays as made until its last suggestion is decided, that the saved decisions live in the document's records, and keep only the sentences about a `blocked` result that the built tree bears out. Proof: `pnpm run prepare` with `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`, the docs checks of `pnpm check --affected`, and `plan-page.mjs --folded`.

## Open work

- Blocks wholly between two pieces' lines, and a removal of an ancestor of a waiting link, are not part of its chain. No family builds either. Owner: zbeyens. Stop: a report of a link whose rejoin differs by click order with a block between its lines or a removed ancestor.
- A block decision next to a waiting link may wait on the link's pending suggestions where next would not. The measured quote, give-back and unwrap bounds show no coupled set next lacks; no bound mixes a chain with an outside block decision beyond the quote family's cut links. Owner: zbeyens. Stop: a coupled set next lacks in any bound.
- A rejected paragraph Enter keeps or drops a suggested note by click order while Editing noted the other paragraph, on next and every iteration, because a paragraph Enter outside a link forms no chain. Owner: zbeyens. Stop: a block metadata key that a suggestion writes, or a report of a paragraph note that differs by click order.
- Inserting a link over a selection inside another link splits the old link and unwraps the selected piece in one change, and no family covers it. Owner: zbeyens. Stop: a report of such a link insert whose rejection gives a different link by click order.
- The mixed key at three operations, with real paragraph Enters (18,966 scripts) and with the second split after writes (28,100), did not fit an hour in one run on the prototype or, at two changes, on next. They and any family Step 6 cannot run whole go to a suggested task that runs them on the landed build. Owner: zbeyens. Stop: that task lands or is dropped.
