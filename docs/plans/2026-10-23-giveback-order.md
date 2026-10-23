# Give a removed left half's values back in every decision order

Status: partial: the order check landed in `b214849c2a`; the give-back waits on its next plan iteration
Topic: cut-join
Playbook: bug-fix

## Brief

### What will change?

For your cut-join task, we land the check that tries every click order on give-back cases. The give-back stays as it is today and goes back to design, because the last review found bugs in both parts we had redone.

### What could go wrong?

Rejecting a split whose first half was removed still loses that half's values, as today. The check knows today's 12 click-order failures and stops a landing only on a new one.

## Teach

A proposed Enter or split cuts a link into two halves. Some properties, such as a reference id, stay on the first half only. If the reviewer rejects the split but someone removed the first half, the second half should get that id back, with any pending suggestions on it.

Today the second half keeps nothing. Four builds tried to give it back, and every review found click orders that gave different results, or suggestions that could only be decided together. The fourth build passed the new click-order check at every size tried. The last review still found five cases by reading the code, all in documents the check does not build, such as a removal somewhere else in the document or a second content area.

So this round lands only the check. It records today's failures and stops a landing on any new one. The next round designs the give-back again, with those five cases as its first tests.

## Expected results

Rows use the storage plan's semantics and its table check, `docs/plans/artifacts/cut-join-values/storage/table/table-check.r9.template.ts`. "Every order" means each order of single decisions and all of them in one call. The order check is `pnpm check:authored-order` with its give-back family.

| Row | Rank | Start and steps | Must give | next |
| --- | --- | --- | --- | --- |
| T11 | P0 | the redesign plan's row | b at u ref r1 | b at u in one call |
| S20, S36 to S38 | P1 | the storage plan's rows | the storage plan's results | fail |
| S39 | P1 | the storage plan's row | b ref r8 | passes |
| O1 | P0 | the order check's give-back family at its gate bound | no failure and no set decidable only together beyond next's | no family |
| O2 | P1 | the family at the bound that holds R3's script | as O1 | no family |
| R3 | P1 | S13's schema; link ab ref r1; Carol's split; Bob proposes a's ref r2, then b's r3; Alice proposes a's ref r4, then b's r5, each in its own update; Dave proposes removing a; accept Dave and reject Carol, then decide Alice and Bob one at a time, every order | each single decision applies, or waits only on a change that does not wait back; every order reads as one call | rejecting Alice applies alone |
| K1 | P1 | S13; reject Bob; then remove a directly; reject Carol | b ref r1 | b ref r2 |
| K2 | P1 | S13; remove a directly while Bob is pending; reject Carol; then decide Bob | b ref r1, and Bob's decision changes nothing | b ref r2 |
| K3 | P1 | S13's schema; link ab ref r1; Carol's split; one direct update sets a's ref to r9 and removes a; reject Carol | b ref r9 | b ref r2 |
| Y1 | P1 | two Yjs peers each give back or refresh the same cut at once | both peers read the same | no give-back |

## Design

This iteration built the rule below, and three push panel rounds reviewed it. Round 3 found five order bugs, two of them in parts round 2 had already replaced, so the build went back to next's code at `c1b3b46d56` and only the order check lands. The decision log's round 3 rows name each bug and its probe. The next iteration starts from these findings, not from this rule.

The storage plan's Give-back paragraph stays the outcome law: a value on the right half beats the left half's history unless it is the split's own output. The rule below replaces its Cut record sentences from "When the cut is rejected without its left half" on. Three architect runners and a cross-judge picked it, and a prototype passed every row with it (`docs/plans/artifacts/cut-join-values/giveback-order/proto/design.md`).

**The rule.** When a call rejects a cut whose left half is gone, and neither the cut's change nor a change that removes the left half has a pending property write anywhere in the document, the right half takes back the left half's history on each key the split drops. The left half counts as gone when the call's verdicts remove it, and the changes behind those verdicts count with the cut's rejection below. A right half that is itself the left half of another rejected cut also takes back, so a chain of rejected cuts hands the first half's value to the last, whatever block each half sits in. The floor of the right half's history is its topmost standing write and everything under it, plus any pending writes of the split's output directly above it. When the call decides other changes too, the rule first runs with only the cut's rejection and the left half's removal decided, then again with each change that run waits on decided too. Where a run waits on a change the call leaves pending, the call waits on it, and where step 7 finds no change to wait on, the right half stays. Otherwise the first step that matches decides:

1. If deciding the right half's own history waits, the right half stays as it is, and the call waits as it does on next.
2. If the right half reads a value other than the split's output whichever way its pending changes go, it stays (S39).
3. If the left half saved nothing, the right half stays.
4. Read the left half's history as the cut's rejection and the left half's removal decide it alone, with every other change still pending. If it reads one value whichever way those changes go, that value replaces the output as in step 5. Otherwise drop the writes those two decisions reject, so a write over one of them reads what stands under it. If deciding what remains with this call's verdicts would wait, the rejection waits on the same changes (E1).
5. If nothing on the left half stays pending, its value replaces the split's output everywhere the right half's history holds it: the stored value, each suggestion's write, and the values under and linked from each suggestion (T11, S36).
6. If nothing on the right half stays pending, the left half's history replaces the right half's (S20, S37).
7. Otherwise both halves have pending suggestions. Read the right half's pending changes as rejected. If the left half then reads one value whichever way its other pending changes go, and none of the right half's pending changes writes the split's output, that value replaces the output as in step 5 (R3). If not, the rejection waits. It waits on the left half's changes that make that value vary when each of them can be decided alone, on every key of either half, without waiting on a change this call decides (S38). Failing that, it waits on the right half's pending changes under the same test, then on those of either side that pass it. When none passes, the right half stays.

**Why every order agrees.** A removal of the left half waits on the cut and the cut's rejection on the removal, so every order decides them in one call, and that call sees the same pending writes of theirs. A write of either change can put a third change's verdict behind the cut's, which no reading of the two halves sees, so the rule gives nothing back then. No key history ever holds pending suggestions of both halves. Whatever the still-pending changes decide, the right half reads its own value unless that is the split's output, and the left half's value otherwise. Each half's history gives the same result in every order on its own, so the outcome does not depend on what was decided first. Replacing a value changes no wait, because a key's decision picks its steps by id, link and status and never by value. The first runs and step 4 read the left half as if the cut's rejection and the removal came first and the call's other verdicts came after, one wait at a time, so those verdicts wait exactly as they would after them. A set of verdicts that settles in one call therefore also settles with the rejection and the removal decided first and the rest after. Step 7 waits only on a change that decides alone on every key of both halves, so the change it waits on never waits back on the rejection.

**What it costs.** For each rejected cut whose left half is gone, and each dropped key, a handful of key decisions, at most 8 more to read the left half and 8 more when both halves stay pending, once more for each change a run waits on that the call decides, and one node rewrite. The first such cut in a call walks the document once to find which changes write properties. It runs no resolver probe, and a call with no such cut pays nothing.

## Steps

- [x] Extend the decision-order check to give-back documents. Proof: on next its gate bound passes and seeds next's findings; on the reverted slice's commits it reports the bug each review round found.
- [x] Architect on the give-back rule, with the extended check as the judge's proof. Proof: its synthesis.
- [ ] Give-back build. Built, reviewed in three push panel rounds and reverted to next at `c1b3b46d56`; it moves to the give-back's next plan iteration. Proof: every row above passes, rows T11 and S20 and S36 to S39 through both plans' table checks; the order check at its gate bound and at O2's bound; every row passing on next still passes in both tables; T42 and T37's two-peer variant converge; the plitejs suite, typecheck and lint; Benchmark's decide-latency probe within the joins slice's limits; writing passes, a push panel on the design and the diff together, and one land.mjs run that carries the order check and the give-back.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the order check builds give-back documents | It records real edit scripts through the editor and decides through the reviewer's path, so the documents are exactly what people produce (look) | Build the marks by hand, as the quote documents do | hand-built marks | small |
| Review before landing | One push panel reviews the design and the diff together, after three architect runners, a cross-judge and the prototype's rows (look) | A plan panel on the design first, then a push panel on the diff | plan panel first | small |
| What lands after round 3 | Only the click-order check lands. The give-back goes back to today's code and to design. The third review found bugs in two parts the second review had already made us redo, and a part only gets redone once (look) | Land the build with the five cases and fix them after | land the gated give-back | small |

## Open work

- The give-back itself. T11, S20 and S36 to S38 fail as on next. Its next plan iteration designs it again, with round 3's five probes as its first tests and a plan panel before any build. Owner: this session, from t_9c25c288. Stop: that iteration's land.mjs push.
- The order check's gate finds 12 give-back failures on next, each rejecting a cut whose left half stays. Owner: this session, through the give-back's next plan iteration, which must not add one. Stop: that iteration's land.mjs push.
- The order check's gaps that rounds 1 and 2 deferred: `decide` returns an empty decision for a change it does not list, the family compares only children, its explorer skips batch states whose history later decisions could read, S39's check skips past three pending changes, the script parses verdicts with a regular expression, and `finding-baseline.mjs` checks only the base's rules. Owner: this session, through the give-back's next plan iteration, which uses the check as its judge. Stop: that iteration's land.mjs push.
- The give-back cases that fail on next and on the reverted slice alike stay with suggested task t_44385dec, as the storage plan says. Owner: zbeyens. Stop: that task's landing.

## Close

The order check's give-back family landed on next as `b214849c2a`, `test(plitejs): check every decision order of recorded give-back scripts`. It records each script through a real editor, decides every order through the public `decide` and compares what a reader sees. Its baseline holds next's 12 failures and 1,105 coupled sets at the gate bound, so a landing fails only on a new one. The give-back code went back to next's at `c1b3b46d56`.

Reversal. The give-back build from this iteration's architect synthesis is not landing. It passed every row in both tables and the family at every bound tried, but round 3 found five order bugs the family does not build, each confirmed by a probe that fails on the build and passes on next. Round 2 had already replaced two of the parts they hit, the write gate and the chain donor.

Proof. On the tree rebased onto next, the gate passes. The quote documents have no failures, since next fixed its two, and their 66 coupled sets; the give-back family has the 12 failures and 1,105 coupled sets its baseline lists. `--together=<file>`, which next added while this ran, writes all 1,171 sets with this branch's walks. The plitejs typecheck, the authored partition and lint of the script and its helper pass, as they did on the reverted tree before the rebase. Limits. The check proves only the scripts its bound builds, as the rule's What it does not cover lists. The rule cites the four reverted builds by commit, and those commits live only in this machine's branches `giveback-r3-274a34` and `giveback-r4-274a34`.

Counts. 3 push panel rounds of 3 seats each, 13 critical findings applied, 5 by revert.
