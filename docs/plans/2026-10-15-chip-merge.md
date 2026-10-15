# Duplicate suggested tasks fold into one

Status: executed: the merge shipped, and docs/plans/2026-10-15-chip-card-work.md replaced its decline rule
Topic: pstack
Playbook: feature

The owner's words: "i want to repair our pstack worfklow how they suggest those chip tasks so next time there is not all those issues, it would better track and batch", then "actually not fast, use full poteto". The decision-trail review of `docs/plans/2026-10-15-chip-batching.md` opened this iteration. It found two problems. Review rounds patched the `dismissed dup` merge twice, which `panel.md` allows once. Six commits from the smoke rounds also changed the rules after the panel's last round, and nobody reviewed them. `panel.md` sends such a mechanism back to planning, so dotai `d408957` reverted the merge. After that revert, a dup closed its task and moved nothing, and the sweep folded the duplicate in by hand first.

## Brief

### What will change?

When two suggested tasks turn out to be the same work, they become one task that keeps everything both found. This redoes the merge the last review sent back, and reviews the rule fixes the smoke tests forced.

### What could go wrong?

A review can still find a case the merge gets wrong, so nothing ships until the code and trail reviews pass. The run built the merge in dotai and applied it, uncommitted, to plate-2, ellie and the plate worktree.

## Teach

A suggested task is side work an agent finds outside its own job, kept in one list per project. Sometimes two tasks turn out to be the same work, and one of them has to go.

The last iteration made closing a duplicate also move its findings, files and waits into the task that stays. Review reworked that move twice, and the rules allow one rework per piece before it goes back to planning, so the run undid it.

This iteration designed that move again from the start, reviewed the plan three times, built it and now reviews the code. Its first review round also covered the six rule fixes the smoke tests forced after the last review ended.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The duplicate merge | Undo it and plan it again, as the review rules require (look) | Keep the merged code and only review it | keep merge | big |
| The smoke-round rule fixes | Review them in this iteration's first round, before anything ships | Ship them as they are | ship smoke fixes | small |
| Reviews | Full: architect, a panel on the plan, a panel on the code, the smoke set and a trail review | Fast: the lead's own design and no panels | fast | detail |
| Pushes | Hold every push, dotai's included, until this iteration's trail review | Push dotai now | push now | detail |
| How a duplicate joins | Closing it moves its work into the kept task, as the live lists already do (look) | A join marker on new closes, with import rows for old ones | join marker | big |
| A duplicate of a running task | Always refused; it waits on the running task and closes as done once that lands | Move its findings and checks into the running task | merge into running | small |
| Cards that go stale | The board flags a card this session holds once the title it shows changes, and the agent reissues it; every card's session loads the current brief | Reissue a card on every change to its task | recard on change | small |
| An old task moving to the new format | The row that gives it a topic also names its waits, or says it has none | A topic alone | topic only | small |
| A duplicate in another topic | Refused until it moves into the kept task's topic, except between two design questions | Merge across topics always | cross-topic dup | small |
| A design question found later | It folds into the topic's open task and turns that task into a design question | Offer it as its own task | separate design task | small |
| A card older than its task's work | The merge or fold goes in, and the owner's decline of that card closes the whole task, merged work included (look) | Build a card snapshot now, so a decline closes only what its card showed | card snapshot now | small |
| A design question merged from another topic | It counts only in the kept task's topic, and the sweep merges a later one from the other topic, or has it wait on a started kept task | It keeps guarding both topics | guard both topics | small |

## Main changes

- `dismissed dup` moves the work again, in one row. In `tasks.mjs`, `mergeInto` adds the duplicate's title and findings to the kept task as a `covers` entry. The duplicate's paths and owned checks join the kept task's, and so do its waits, except any wait that follows back to the kept task through dup rows. The kept task becomes `kind: decide` when the duplicate was one. A chain of dups flattens into one covers list, and `afterRow` deep-copies the task map, so judging a row never changes the live one.
- A dup moves work only into an offered task. Both `append` and the whole-log check refuse a dup whose kept task is closed or the task itself, and `append` also refuses one into a started task. A dup that an older helper logged into a started task still replays as before and gives that task only the title, findings and owned checks. For a started kept task, the refusal tells the lead to keep the duplicate open, add `task:<started id>` to its waits, and log it `dismissed done` once that task lands with the fix, because a started session keeps its own plan.
- A `folded` row can carry `kind: decide` when the finding it adds is a design question, which makes its task one. Both checks refuse `kind: fix` on a folded row, so a fold never turns a design question back into a fix. A folded row can also carry `effort: xhigh` when its finding needs design judgment the title lacks, such as a bug whose cause is unknown.
- The one-design-question check now judges `folded` and `dismissed dup` rows too, by the task after the row. It refuses one only when the row turns its task into a design question beside another open one, or into one that does not wait on its topic's started design question, where a wait through dup rows counts. A design question merged from another topic counts only in the kept task's topic. The sweep merges a later design question from the other topic into the kept task while that task is offered, and once the kept task is started, has the later question wait on it. A dup between two design questions never trips this check, so several design questions in one topic collapse one row at a time.
- `append` refuses a dup when either task has no topic, because its waits may still be prose that a merge would carry across unchecked. It also refuses a dup across two topics, because a dup joins tasks on one question, unless both tasks are design questions, since the kept task then still holds the design question. A task with no topic gets one only in a row that also names its waits, as `waits: none` when it has none, and `append` refuses an empty `waits:`, which a replay still reads as no waits. `append` also refuses a `carded` row on a task that already has a card, and a row that adds a wait to a loop, so that a task waits on itself or offered tasks wait on each other through their waits and dup rows. It finds that row by comparing the waits that sit on a loop before and after it, and for a dup the refusal says to keep the duplicate open, because a loop shows the two tasks are separate work. A hand-written loop makes `chips` exit 1, among tasks with no topic too. A prose wait on a task with no topic still only asks for its migration.
- `chips brief` opens with the title plus ` (xhigh)` when the task is a design question or covers an `(xhigh)` task, so a card's effort follows the merged work. Its prompt first tells the session to print the current brief and work from that, because a card's prompt cannot change once it is offered, and to print it again right after its `started` row, because the task can gain work until then. It prints each covered task's id, title and findings under `Also covers:`, and the owned checks under `Owns:`. `chips brief` of a merged task, or of one an older helper replaced, prints the brief of the task that holds its work when that task is offered and has no card. Otherwise it says there is nothing to start, as for a closed task, so a leftover card never starts a task another session runs or holds. A folded `effort: xhigh` raises the title too, and the `chips` board shows the same title.
- The `chips` board tells a session a card started to work from `chips brief`, which reaches cards offered before this change, whose prompts only run `chips`. When the title a card shows changes, such as when its effort rises, `chips --session` asks to card it again. When the dismiss tool reports that the owner started or dismissed the card, the lead logs `started` or `dismissed declined`; otherwise it logs `uncarded` and cards the task again once `chips` lists it as Ready. A change that keeps the title needs no new card, because the card's session reads `chips brief`.
- A fold or a dup into a carded task joins it and keeps the card. The owner's decline of that card closes the task with all its work, including work that joined after the card, because nothing records what each card showed. The closed task's rows keep its findings, paths and owned checks, so the work can be offered again.
- `chips.md` drops the fold-before-dup step. The sweep keeps the earliest design question among the duplicates, or the earliest task when none is one, and logs one dup row for each other. Before a dup, an `updated` row moves the duplicate into the kept task's topic when its own differs, unless both are design questions. The lead re-cards a card this session holds when its title changes, and another session's card keeps its title. The pending-card check after a suggest result touches only tasks `chips` still lists as Ready or Waiting. A runtime without a suggest tool runs the close sweep right after the `Status:` change and lists each Ready task in the plan's and the subject's Open work in the same edit.

## Steps

- [x] Run `architect` on how a duplicate task joins the task it repeats: three runners and a blind cross-judge, with grounding from the round 2 and round 3 findings and the trail review. Proof: an `architect` row citing the judge's reply saved verbatim. Done: `docs/plans/artifacts/2026-10-15-chip-merge/architect/judge/verdict.md` and `architect/synthesis.md`.
- [x] Write the chosen design into Main changes, then run a panel whose packet holds this plan, the revert `d408957` and the smoke-round delta `05b79d7..5a29a5f`. Proof: `seats` and finding rows. Done: three rounds reached the cap, with 8 critical findings applied and every warning applied, deferred or dismissed in the log.
- [x] Build the design in dotai, each behavior with a test that fails at `d408957`. Proof: the dotai suite through `proof.mjs` and a `built:` row. Done: dotai `09c6146`, 234 of 234; each round's new tests failed on the draft before that round's fixes.
- [x] Apply plate-2, ellie and the plate worktree from the local dotai commit, then run the whole smoke set on both runtimes, its intended behavior written first, with P5 on an offered design task. Proof: `smoke` rows citing each answer file. Done: three smoke rounds. Round 2 ran on dotai `1cc5164` in all three projects and forced the `cae6c6a` fixes; round 3 ran on `cae6c6a` in plate-2 only, on P1, P7, P9 and P10. The follow-up iteration reruns the whole set on the final rules.
- [x] Run the writing passes, then a panel on the build's diff and any smoke fix. Proof: `writing` and `seats` rows. Done: three diff rounds reached the cap. The run first dismissed round 3's two critical findings as rare; the trail review showed the rules required a revert, so the run reverted the decline guard they found. The smoke's rule fixes in `cae6c6a` go to the follow-up iteration's panel.
- [x] Rerun the reproduction of each surviving panel fix from both iterations through `mutate.mjs`, the old and new helper over every managed ledger, `verify` on each project and the suite, all through `proof.mjs`. Proof: `verify` rows citing those logs. Done: 19 of 19 mutations caught on `1cc5164`, the corpus unchanged over 278 logs, `verify` passing in all three projects and the suite 249 of 249. The chip-decline iteration reruns acceptance without the reverted guard's mutations.
- [x] Run the decision-trail review. Proof: a `trail` row. Done: `docs/plans/artifacts/2026-10-15-chip-merge/trail/sol.md`, two critical findings and three warnings, each accepted.
- [x] Revert the decline guard and review the revert with `cae6c6a` in the follow-up iteration, `docs/plans/2026-10-15-chip-decline.md`. Proof: that plan's `Status:` says executed. Done: it says executed.
- [x] Push dotai, commit and push ellie's sync, push the plate worktree to PR 5166's branch and update its body, and leave plate-2 uncommitted. Proof: `delivery` rows. Done: `docs/plans/2026-10-15-chip-card-work.md`'s `delivery` rows.
- [x] Append the ledger rows the design needs, and judge whether any of plate-2's nine single-task design topics answer one question. Proof: the `chips` board after the append. Done: the design needs no ledger rows, because the corpus and boards did not change. Read from their full briefs, none of plate-2's nine open design questions answers another's; `docs/plans/artifacts/2026-10-15-chip-merge/briefs/owner-questions.md`.
- [x] Close, page and chip sweep. Proof: `plan-open.mjs` passes. Done: this Close.
- [x] Run `/pstack:reflect`. Proof: a `reflect` row. skip: the owner's "fast" drops reflect.


## Close

Reversals and deviations come first.

- Main changes says a fold or a dup into a carded task joins it and a decline closes it all. `docs/plans/2026-10-15-chip-card-work.md` replaced that: a carded task takes no new work, and later findings wait on it and merge once its card is withdrawn.
- The owner's "fast" dropped reflect.

What landed: dotai `09c6146` moved a duplicate's work in its `dismissed dup` row, and `cae6c6a` settled the chips.md readings. Both are on main with `docs/plans/2026-10-15-chip-card-work.md`'s commits, synced to plate-2, ellie and the plate worktree.
