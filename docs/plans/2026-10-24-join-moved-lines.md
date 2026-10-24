---
review_scopes: [collaboration]
review_basis: [2026-10-24-collaboration-move-lowering]
work_kind: implementation
review_commit: 05b58b8c9a589fc89d7c9996d0593a24bfbb99dd
review_inputs: [docs/plans/2026-10-24-collaboration-move-lowering.md, docs/vision/plite.md, packages/plitejs/src/yjs/core/event-change-bridge.ts, packages/plitejs/src/core/change/root-change.ts, packages/plitejs/src/core/change/join.ts, packages/plitejs/test/join-collab.test.ts, packages/plitejs/test/yjs/move-node-contract.spec.ts]
---

# Keep two peers on one document when one update moves blocks and adds or removes others

Status: landed: task t_50039fd9's fix is on next as c5e77511f3, and this run lands its proof and the Stop verdict
Topic: collaboration
Playbook: bug-fix

## Brief

### What will change?

Task t_50039fd9 fixed your case, where Alice moves a line she accepted a join into and Bob then undoes his delete. Both peers now read one document. This run changes no code. It proves the fix and explains the bug.

### What could go wrong?

In 66 of 12,000 generated cases, a block next to an earlier move lands on the wrong side for other peers. A peer's typing is lost in a block one update moves and types into, or splits while moving another.

## Teach

When you edit, the Yjs binding writes your change into Yjs so other people get it. For a moved block it leaves a placeholder where the block now sits and hides the original. When the same update also moved, inserted or removed other blocks, the writer deleted and inserted one stretch at a time, so a later deletion could delete the placeholder it had just written. The other peer then lost a block or kept a stale one.

Task t_50039fd9 changed that writer to delete every old block first, then insert the new ones where they end up.

The join rebase was not the bug. In your case Alice's accept and move reach Bob as one change with no join record, so Bob's undo goes through the plain transform and reverts her join and move. Task t_23fa5708 decides whether it should keep them, as it does when her accept arrives first.

## Expected results

Each row starts two peers on one document, and Yjs delivers each update to the other peer. R1, R7, R8 and R9 add the steps they name; the other rows are one update on Alice's peer. Rows R2 to R5 come from the generated check's smallest failing cases on `next` at `05b58b8c9a`, read again one by one with `probe-case.mjs`; the rows logs read only those four. Letters are paragraphs, and `#` marks a heading.

| Row | Priority | Start and steps | Must give | On next | Fixed by |
| --- | --- | --- | --- | --- | --- |
| R1 | P0 | x, Carol's pending line N, heading ab with Ann's pending text, cd, z. Alice proposes joining cd into the heading; Bob deletes ab; Alice accepts the join and N, then switches to Editing and moves the heading above N; then Bob undoes | Both peers read x, #cd, N, z after the move, and one document with Bob's ab back after the undo, each editor matching its own Yjs root. In one delivery that document is x, N, #ab with Ann's text, cd with Alice's join mark, z; with her accept delivered first it is x, #abcd, N, z | after the undo Alice reads x N z #ab cd and Bob x N #ab cd z | t_50039fd9 |
| R2 | P0 | A B C; one update moves 0 to 2, then 1 to 0 | C B A on both | Bob reads C B | t_50039fd9 |
| R3 | P0 | K L M N O; one update moves 2 to 0, then types q at the start of 1 | M qK L N O on both | M N L O | t_50039fd9 |
| R4 | P0 | C D; one update moves 1 to 0, then retypes 0 | #D C on both | C C | t_50039fd9 |
| R5 | P0 | F G H I J; one update retypes 2, then moves 0 to 2 | G #H F I J on both | G H F I J | t_50039fd9 |
| R6 | P0 | abcdefghij, second; one update moves 0 to 1, then types X at the start of the moved paragraph | second, Xabcdefghij on both | the receiving peer's paragraph is empty | t_50039fd9 |
| R7 | P1 | drop, then a section of a and b; Alice's one update removes drop, moves a after b and types into both, while Bob types ! at the end of a | ! stays in a | ! lands in b | t_043a0fd7 |
| R8 | P0 | F G H I J, both peers offline; Alice's one update retypes 2, then moves 0 to 2, while Bob types ! at the end of H | G #H! F I J on both | G H! F I J, and this run's draft of the retype fix gives G #H F I J | t_50039fd9 |
| R9 | P0 | A B C D E; one update moves 4 to 0, then the next inserts X at 1 | E X A B C D on both | Bob reads X E A B C D, while his own Yjs root reads E X A B C D | t_1b68f351 |

## Design

The [verdict](2026-10-24-collaboration-move-lowering.md) is Stop. The binding keeps its writers, and three of their rules needed fixing. Task t_50039fd9 fixed all three. The writer for moved blocks removes every old block before it inserts any new one, and updates in place a stretch with no moved block that keeps its number of blocks and their nesting. The sparse writer pairs an equal-length range by position only when the update changes one stretch. The single-move writer refuses an update that also changes a property, so that update goes to the writer for moved blocks.

This run first built its own fix of the writer for moved blocks. The session for t_50039fd9 rewrote the same loop, so this run dropped its version. It also cut its two tests, because t_50039fd9's own tests also catch every bug planted in that fix that the cut tests caught. Two planted bugs fail both cut tests and five and three of t_50039fd9's tests. One fails one of its tests and neither cut test (`sib-c/run-mutants.out`, `sib-c/run-mutants-first.out`). Two fail no test at all: one rebuilds a region's unmoved changed blocks when it holds a second move, and one drops set-valued properties such as review marks (`sib-c/run-mutants-first.out`, `sib-c/run-setvalued-2.out`). Removing the join rebase's moved-line check fails one committed join test and not the cut one, because the task's case never reaches that check (`tests-join-mutant-no-moves-sibc-a1.log`, `probe-join-trace-sibc-a1.log`). This run's draft of the retype rule had lost a peer's typing in the retyped block (R8, `probe-retype-concurrent-full-sib-a1.log`); t_50039fd9's commit keeps it (`probe-retype-concurrent-sibc-a1.log`). After Bob's undo in R1, the accepted and proposed views carry the `authored-uncorrected` diagnostic (`probe-undo-state-sibc-a1.log`). The Defaults row on that undo picks this outcome.

## Main changes

- No code. This run lands this plan, the Stop [verdict](2026-10-24-collaboration-move-lowering.md) and two rejected rows in the [collaboration subject](topics/collaboration.md).

## Steps

- [x] Reproduce the task's case and find each failure kind. Proof: `probe-move-head-a4.log`, and the generated check's three kinds on `next` in `gen-base-seed1-a1.log` to `gen-base-seed6-a1.log`; a round of five fresh seeds found no fourth kind.
- [x] Recall the owner's history, then judge it. Proof: the [verdict](2026-10-24-collaboration-move-lowering.md) and the recall briefs in the run directory's `recall/`.
- [x] A plan panel on this plan, its table and both slices' diffs. Proof: round 1's rows in this plan's decision log.
- [x] Slice 1, this run's own fix of the writer for moved blocks, later dropped for t_50039fd9's. Proof: the join and crossing-moves tests fail on `next` (`tests-c-next-a1.log`, `tests-c-next2-a1.log`) and pass on the slice (`tests-c-slice1-a1.log`, `tests-c-s1r-a1.log`); three mutants show each test catches a mistake the other misses (`tests-c-insert-before-a1.log`, `tests-c-interleaved-a1.log`, `tests-c-no-composite-a1.log`).
- [x] A panel on slice 1's diff, with this plan and the verdict. Proof: round 2's rows in this plan's decision log.
- [x] Prove t_50039fd9's fix on the tree it lands. Proof: on that task's commit, the task's case and R2 converge in this run's two tests, which then go (`tests-sibc-a1.log`, `probe-move-sibc-a1.log`). The task's case also converges with the accept delivered apart, and every editor matches its own Yjs root after each delivery (`probe-move-r3-sibc-a1.log`). R2 to R5 and R8 give their rows (`rows-sibc-a1.log`, `probe-retype-concurrent-sibc-a1.log`). The generated check fails 66 of 12,000 cases, each with the import's signature (`gen-c-sibc-seed1-a1.log` to `-seed6-a1.log`). Six planted bugs show this run's tests catch nothing t_50039fd9's tests miss (`sib-c/run-mutants.out`, `sib-c/run-mutants-first.out`, `sib-c/run-setvalued-2.out`, `tests-join-mutant-no-moves-sibc-a1.log`). The two chain-of-joins tests pass with a 60-second limit (`tests-chain-long-sibc-a1.log`) and time out at 5 seconds with the load average near 80 (`tests-chain-sibc-a1.log`). Before landing, this run rebases the branch onto `origin/next` past `cc8f03b861`, checks that it carries only its five docs files, and checks that the bridge, `root-change.ts`, `mapping.ts`, `representation.ts` and `join.ts` match `cc8f03b861`'s. If one differs, it runs these proofs again. All five match on `c5e77511f3`, the commit that landed the fix, so the proofs stand. `pnpm check --affected` passes through `land.mjs`.
- [x] A panel on the final diff, with this plan and the verdict. Proof: round 3's rows in this plan's decision log.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Who lands the fix of the writer for moved blocks | Task t_50039fd9, whose session rewrote the same loop; this run drops its own version and lands its docs on that fix (look) | Land this run's version first, and rebase that task onto it | land fix here | small |
| Where the retype fix goes | Task t_50039fd9, whose version keeps a peer's typing in the retyped block, while this run's draft lost it (look) | Build the retype fix in this run | build retype here | small |
| Whether this run's two tests land | Cut, because t_50039fd9's tests fail on every planted bug that this run's tests fail on (look) | Land them as the task's own repro | keep tests | small |
| Cases another task already owns | Listed here and left to those tasks (look) | Fix them in this run | take over rows | small |
| What Bob's undo gives after Alice moves the joined line | Both peers read x, N, #ab, cd, z. The cd line comes back as its own paragraph with Alice's join mark, her stored accept still applies in the accepted view, her move is undone, and her accept of N stays. The accepted and proposed views also warn that a decision restructured an element's children and the corrections that depend on them did not run. The undo rules list a join whose own lines move in the same update among the cases they handle by position. Here the move is Alice's next commit and reaches Bob in one delivery with her accept, which the list does not name, so task t_23fa5708 decides it. When her accept reaches Bob before her move, the undo keeps both, giving x, #abcd, N, z (look) | Make that undo keep the join and the move in this run | undo keeps join | small |
| Where the generated check lives | In this run's folder; its logs show how to rerun it. Task t_dd929413 decides whether such a check gets committed | Commit it as a script now | commit check | detail |

## Close

This run first built its own fix of the writer for moved blocks and two tests, then dropped both for task t_50039fd9's rewrite of the same loop. That task's commit `c5e77511f3` fixes the task's case and rows R1 to R6 and R8, and this run lands only docs: this plan, the Stop [verdict](2026-10-24-collaboration-move-lowering.md) and two rejected rows in the [collaboration subject](topics/collaboration.md).

The proof ran on `cc8f03b861`, whose bridge, `root-change.ts`, `mapping.ts`, `representation.ts` and `join.ts` match `c5e77511f3`'s byte for byte. It covers the probes and tests the Prove step names, over top-level paragraphs and headings with two peers. It does not cover nested blocks, three or more peers, or the 66 generated cases R9 lists, and the two chain-of-joins tests pass only with a 60-second limit under this host's load.

## Open work

- R9, a block placed next to a block an earlier update moved. t_50039fd9's fix writes more of those earlier moves as real moves, so the generated check reaches this kind in 66 of 12,000 cases, 6 of them new. Their replays include an insert right before the moved block and an update with no insert, which this run folded into the task's ledger entry. Owner: zbeyens, through suggested task t_1b68f351. Stop: that task's landing.
- R7. Owner: zbeyens, through suggested task t_043a0fd7. Stop: that task's landing.
- A peer's typing lost in a block one update moves and types into, and in a block it splits while it moves another (`probe-r3-typing-sibc-a2.log`), and the two planted bugs no test catches. Task t_c313ad28's retype rule landed with t_50039fd9, so this run folded these into its ledger entry. Owner: zbeyens, through suggested task t_c313ad28. Stop: that task's landing.
- Whether Bob's undo keeps Alice's join and move when both reach him in one delivery, as it does when her accept arrives first. Owner: zbeyens, through suggested task t_23fa5708. Stop: that task's decision.
- A committed check that two Yjs peers converge. Owner: zbeyens, through suggested task t_dd929413. Stop: that task's landing.
