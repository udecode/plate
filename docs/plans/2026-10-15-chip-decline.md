# A declined card closes its whole task

Status: executed: the decline design moved to docs/plans/2026-10-15-chip-card-work.md, which shipped fast
Topic: pstack
Playbook: feature

The owner's words: "i want to repair our pstack worfklow how they suggest those chip tasks so next time there is not all those issues, it would better track and batch", then "actually not fast, use full poteto". The decision-trail review of `docs/plans/2026-10-15-chip-merge.md` opened this iteration. It found two problems. That iteration's last code review found cases the decline guard missed. The guard had already had the one redesign `panel.md` allows, so the rules required a revert, not a dismissal of the findings as rare. Five `chips.md` sentences the final smoke forced, dotai `cae6c6a`, also shipped after the code review's last round. The previous trail review had found the same gap.

## Brief

### What will change?

When the owner dismisses a suggested task's card, the task closes with everything it holds, including work merged into it after the card went out. This also reviews five rule sentences the last smoke test forced, which no review saw.

### What could go wrong?

An owner who dismisses a card can close a merged finding the card never showed. The closed task keeps that finding in its rows, so it can be offered again. The owner can ask for card snapshots instead.

## Teach

A suggested task can gain work after its card goes out, when a duplicate or a related finding joins it. The card cannot change, so the owner may dismiss a card that does not show everything the task now holds.

The last iteration tried to stop that dismissal twice. The second try still missed cases, and the rules allow one redesign per piece in an iteration, so this iteration removes the guard and says that a dismissal closes the whole task.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A dismissed card older than its task's work | It closes the whole task, merged work included; the task's rows keep that work, so it can be offered again (look) | Build a card snapshot now, so a dismissal closes only what its card showed | card snapshot now | small |
| Architect | Skipped: the review rules require the revert, and the rest is wording the smoke forced | Run architect on the dismissal | architect | detail |
| Pushes | Hold every push, dotai's included, until this iteration's trail review | Push dotai now | push now | detail |

## Main changes

- dotai `7c33536` removes the decline guard. A fold or a dup into a carded task joins it and keeps the card, and the owner's decline of that card closes the task with all its work. A check the declined work owned is left with no owner, so `append` refuses the next row that blames it on the base branch until a task owns it again. The re-card item that `chips --session` prints says again to log `started` or `dismissed declined` when the dismiss tool reports either, and `uncarded` otherwise.
- dotai `f07462a`: `chips.md` Limits defines a card's withdrawal once: the lead calls the dismiss tool, then logs `started`, `dismissed declined` or `uncarded` as the tool reports. Every sentence and both board items that withdraw a card use it, and a started task closes with `landed` or `dismissed stopped` without one. When the owner says to drop a task, the lead withdraws its card first. The sweep puts a withdrawal in one batch and the card that replaces it in the next, and repeats while a batch creates a Do item.
- dotai `cae6c6a` rewrites five `chips.md` sentences the smoke read two ways. A fold carries `kind: decide` for a design question, or only `effort: xhigh` for design judgment that is not one, such as a bug whose cause is unknown. A withdrawal before any other dismissal logs `uncarded`. After a dup, the kept task keeps its own title and lists the duplicate under Also covers. The sweep runs `chips` again and applies, in a second batch, any Do item the first batch created. Limits says a task's title in its rows never changes, while the title `chips` shows gains ` (xhigh)` when a fold or a dup raises its effort. dotai `f07462a` replaces this bullet's withdrawal, batching and title sentences, as the next bullet says.

## Steps

- [x] Revert the decline guard on top of dotai `cae6c6a`. The guard's code, its four tests and its rule text go. The dup-into-carded test now checks that the merge keeps the card and that a decline closes the task. The chip-merge plan and `chips.md` say a decline closes the whole task, and CODING_STANDARDS row 97 drops the guard's refusal. Proof: the dotai suite through `proof.mjs`. Done: dotai `7c33536`, 245 of 245.
- [x] Run the writing passes, then a panel on this plan and the diff `1cc5164..7c33536`, which holds `cae6c6a` and the revert. Proof: `writing` and `seats` rows. Done: two rounds. Round 1's fixes are dotai `f07462a`, with the suite at 246 of 246. Round 2's Opus critical showed that work joining a carded task is the common flow and a decline loses it, so the decline goes back to planning in `docs/plans/2026-10-15-chip-card-work.md`, which also takes round 2's withdrawal and batching warnings.
- [x] Design and build how work that joins a carded task stays tracked, in `docs/plans/2026-10-15-chip-card-work.md`. Proof: that plan's `built:` row. Done: dotai `ece175a`.
- [x] Apply plate-2, ellie and the plate worktree from the final local dotai commit, then run the whole smoke set on both runtimes against `smoke/intended.md`, updated first: plate-2 P1 to P10, and ellie and plate P1 and P7. A rule or code edit the smoke forces gets a panel round, counted toward the cap, before the trail review. Proof: `smoke` rows citing each answer file. skip: `docs/plans/2026-10-15-chip-card-work.md` applied `bb27327` and smoked the two routes it reverses, after the owner's "fast".
- [x] Rerun acceptance through `mutate.mjs` on the final commit, without the guard's mutations, then the old and new helper over every managed ledger, `verify` on each project and the suite, all through `proof.mjs`. Proof: `verify` rows. Done: `docs/plans/2026-10-15-chip-card-work.md`'s `verify` rows, 31 of 31 mutants caught.
- [x] Run the decision-trail review over both iterations. Proof: a `trail` row. skip: the owner's "fast" drops the trail review.
- [x] Push dotai, commit and push ellie's sync, push the plate worktree to PR 5166's branch and update its body, and leave plate-2 uncommitted. Proof: `delivery` rows. Done: `docs/plans/2026-10-15-chip-card-work.md`'s `delivery` rows.
- [x] Close, page and chip sweep. Proof: `plan-open.mjs` passes. Done: this Close.
- [x] Run `/pstack:reflect`. Proof: a `reflect` row. skip: the owner's "fast" drops reflect.

## Close

Reversals and deviations come first.

- Round 2 showed that reverting the decline guard loses work that joins a carded task, the common flow. The design went back to planning in `docs/plans/2026-10-15-chip-card-work.md`, whose fast build replaced this plan's decline rule: a carded task now takes no new work.
- The owner's "fast" dropped this plan's smoke set, trail review and reflect.

What landed: dotai `7c33536` reverted the guard and `f07462a` defined a card withdrawal once. Both are on main under `docs/plans/2026-10-15-chip-card-work.md`'s `ece175a` and `bb27327`, which supersede the decline text.
