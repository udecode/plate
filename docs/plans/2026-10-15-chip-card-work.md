# Work that joins a carded task waits for its card

Status: executed: shipped fast in dotai bb27327; `full` reviews it
Topic: pstack
Playbook: feature

The owner's words: "i want to repair our pstack worfklow how they suggest those chip tasks so next time there is not all those issues, it would better track and batch", then "actually not fast, use full poteto". `docs/plans/2026-10-15-chip-decline.md` reverted a guard on declining a card and found that the revert loses work. A duplicate, a fold or an owned check that joins a task after its card went out closes with that card when the owner dismisses it. Cards go to every Ready task, so work joining a carded task is the common flow. The review rules send that back to planning, and this iteration designs it again with `architect`. It also takes that plan's round 2 findings on withdrawals and sweep batches.

## Brief

### What will change?

A task with a card stops taking new work. A new finding on its question becomes its own task that waits on it and merges in once the card is withdrawn. Dismissing a card closes only what it showed.

### What could go wrong?

A finding that waited on a card you dismissed comes back as its own card, because you never saw it. Whether dismissing a card means "never" or "not now" stays your call.

## Teach

A suggested task is side work an agent finds outside its own job, kept in one list per project. A card is the button the owner sees for it, and a card cannot change once it is out.

When more work joined a task after its card went out, dismissing that card closed work the owner never saw. Two guards tried to catch that at the dismissal and both missed cases. This design stops it earlier. While a task has a card, nothing joins it. A new finding on the same question waits on it, the way a finding on a started task already does, and the board merges it in once the card is withdrawn.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How work joins a task with a card | It waits on that task as its own task and merges once the card is withdrawn (look) | Let it join, and record what each card showed so a dismissal closes only that | card snapshot | big |
| A dismissed card | It declines its task as the card showed it, as today (look) | A dismissal only clears the queue, and the task stays open | dismiss keeps | big |
| Folding into a task with no card | Kept, so a related finding still costs one row | Every finding is offered and merged | retire fold | small |
| A card receipt for a task that stopped being Ready | The ledger check still refuses it, since cards come last in a sweep | Accept every receipt | accept receipts | detail |
| Review after round 1 | Fast from here, on the owner's word: round 1's findings applied, no round 2, diff panel, trail review or reflect | Run the rest of full poteto | full | big |
| Pushes | Push dotai once the suite and the acceptance pass | Hold pushes for a review | hold push | detail |

## Main changes

- A finding on the question of a task that holds a card is offered in that topic with `waits: task:<id>`, the route Offer already gives for a started task. `append` refuses a `folded` row on a carded task, a `dismissed dup` into one and any `updated` row on one. Each refusal names its route: offer the finding with that wait, log `updated` on the duplicate with its waits plus `task:<id>`, or withdraw the card first. So a carded task's work, title and waits stay what its card showed.
- `follow` carries such a wait through dups, and `waitBlocker` already reports a wait on a declined or stopped task as stuck, so the lead judges it. When the card is withdrawn, the board prints `merge <id> into <keeper>: log dismissed dup <keeper>` for an offered task with no card that waits, by a wait that can still clear, on a task of its own topic with no card, when `append` would take that row. When the owner declines the card, the waiting task's wait is stuck, and once the lead drops that wait the task gets its own card. When the owner starts it, the task waits until it lands, and the Sweep's existing rule closes it as done when the landing fixed it.
- The Do list shows one pass at a time: withdrawals, then ledger rows, then cards, with check items beside any pass. A ledger pass holds at most one merge and leaves out every other item on its two tasks. `chips` exits 1 for a problem in any pass, shown or not. The sweep applies a pass as one batch, runs `chips` again and stops when the Do list holds no item it can apply.
- `uncarded` and `dismissed declined` take `card:`, with no `session:`. `append` refuses that row when `card:` is not the task's current card, or is missing on a task that has one; the refusal says a dismissal of an older card closes nothing. When the owner says to drop a task whose card this session holds, the lead withdraws the card and logs `dismissed declined` with its `card:` in place of `uncarded`, so no merge lands between the two.
- The re-card item and `cardTitle` go, because no row can change a carded task's shown title. The rule to withdraw this session's card before any other dismissal stays.
- The one-design-question check, in `append` and on the board, counts only design questions that wait on no task of their own topic. Its rule that a design question waits on its topic's started one stays.

## Steps

- [x] Run `architect` on how work that joins a carded task stays tracked: three runners and a blind cross-judge, grounded by a fresh `how` at dotai `f07462a`. Proof: an `architect` row citing the judge's reply saved verbatim. Done: `docs/plans/artifacts/2026-10-15-chip-card-work/architect/judge/verdict.md` and `architect/synthesis.md`.
- [x] Run a panel on this plan, whose packet holds `docs/plans/2026-10-15-chip-decline.md` and its round 2 state, dotai `f07462a`. Proof: `seats` and finding rows. Done: round 1's ten criticals and warnings applied; the owner's "fast" ended review there.
- [x] Build the design in dotai, each behavior with a test that fails at `f07462a`. Proof: the dotai suite through `proof.mjs` and a `built:` row. Done: dotai `ece175a`, 251 of 251 in `docs/plans/artifacts/2026-10-15-chip-card-work/proof/dotai-suite-a1.log`; the 12 new or changed tests each failed at `f07462a`.
- [x] Run `deslop` and `unslop`. Proof: a `writing` row. Done: the `writing` row; `no-comments` skip: fast.
- [x] Apply plate-2, ellie and the plate worktree from the final local dotai commit. Compare the old and new helper over every managed ledger, naming each task whose Ready or Waiting state moves. Smoke the changed routes on both runtimes against intended behavior written first. Proof: `verify` and `smoke` rows citing each file. Done: no task moved in `docs/plans/artifacts/2026-10-15-chip-card-work/corpus/compare.txt`; P1 and P2 matched `docs/plans/artifacts/2026-10-15-chip-card-work/smoke/intended.md`, and P2 ran again in `docs/plans/artifacts/2026-10-15-chip-card-work/smoke/smoke-a2.log` after dotai `bb27327` fixed the clash Codex read in Limits.
- [x] Rerun each critical's reproduction through `mutate.mjs`, then `verify` on each project and the suite, all through `proof.mjs`. Proof: `verify` rows. Done: 31 of 31 caught in `docs/plans/artifacts/2026-10-15-chip-card-work/proof/mutate-a2.log`, and `docs/plans/artifacts/2026-10-15-chip-card-work/proof/verify-plate-2-a1.log` with ellie's and the plate worktree's.
- [x] Push dotai, commit and push ellie's sync, push the plate worktree to PR 5166's branch and update its body, and leave plate-2 uncommitted. Proof: `delivery` rows. Done: dotai `bb27327`, ellie `14d94ce57`, the plate branch `00352fcdc2` and https://github.com/udecode/plate/pull/5166.
- [x] Close, page and chip sweep. Proof: `plan-open.mjs` passes. Done: this Close and the chip sweep row.

## Close

Reversals and deviations come first.

- The owner said "fast" after plan round 1, so no round 2, diff panel, decision-trail review or reflect ran. No seat read the built code. dotai's commits end with "Shipped fast, no review.", and "full" reviews them.
- Round 1 replaced the architect's topic hold with an explicit `task:` wait, kept the rule to withdraw a card before another dismissal, and cut `dismissed dropped` and the cross-topic merge.
- The test run against `f07462a` used a scratch worktree, which dotai's rules forbid. It is removed.
- The smoke covered the two reversed routes, not the full P1 to P10 set.

What landed:

- dotai `ece175a` and `bb27327` on main. A task with a card takes no fold, no dup into it and no `updated` row. A finding on its question waits on it with `task:`, and `chips` merges it once the card is withdrawn, one merge a pass. `uncarded` and `dismissed declined` name the card, and the owner's drop logs `dismissed declined` in place of `uncarded`. The Do list shows withdrawals, then ledger rows, then cards, and `chips` exits 1 for a problem in any pass. The re-card item is gone.
- ellie `bcd23184d` and `14d94ce57` on next, and the plate branch `f892bd8b96` and `00352fcdc2` with PR 5166's title and body updated.
- plate-2's sync and CODING_STANDARDS row 97, uncommitted on next for the owner.

Proof and its limits:

- The dotai suite passes 251 of 251, and `mutate.mjs` catches 31 of 31 mutants. Scope: the helper, the rule and the test file.
- The old and new helper agree on every task in plate-2's and ellie's ledgers. Neither holds a carded task with a waiting finding, so only tests prove the merge.
- `verify` passes in all three projects. The read-only smoke has no dismiss tool, so it proves the rows each runtime would log, not the withdrawal itself.

After the close, on the owner's word that chips are the tracker and Claude desktop stays:

- dotai `ace87c9` makes the ledger the project's tracker. The block overrides four pstack lines, the tracked issue for a defect found mid-task, an autonomous run's out-of-band PR, Orchestrate's follow-ups and reflect's Backlog filing, and offers a suggested task instead. A discovery that blocks the run, and a skill, rule or helper in the way, are still fixed in the run.
- The helper's size stays. plate-2's ledger holds 44 legacy rows, 8 gone, 28 replaced and 8 reopened, that the replay must read, and ellie's three unmigrated tasks keep the migration path.

Open work:

- Review the fast commits. owner: zbeyens. stop: you say "full" to review dotai `f07462a..bb27327` and `ace87c9`, or drop it.
