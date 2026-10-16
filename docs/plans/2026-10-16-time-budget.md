# Cap every run step at an hour

Status: done
Playbook: feature

## Brief

### What will change?

No command, proof, review seat or wait on the machine runs longer than an hour. A long measurement that is still worth running becomes a suggested task you start when you want it, and a run's close never waits on it.

### What could go wrong?

A real proof that needs more than an hour, such as a full timing protocol, now ends as an open gate instead of a result, until you start its task.

## Teach

You said, on 2026-10-16: "hey repair our pstack workflow skills, we can't run things for >1h for fast development except rare stress testing". Then: "if those potentially long runs are really recommended, it should not block the poteto workflow, but instead recommend as /chips task".

Before this change, nothing capped how long one step could take. The review-tree pivot's final gate showed the cost: its timing lines needed a host under load 7, the machine never got there, and the run waited on a background job for hours.

Now the shared block has a Time budget rule. A step sized past an hour gets split or narrowed. A wait on the machine gives up at the hour and logs its line `inconclusive`. A measurement that cannot fit goes to a suggested task, its plan step goes to Open work naming that task, and only that task's session passes `--stress`. `proof.mjs` stops a command after an hour by default, with every process still in its process group, and logs the run as timed out even when the command exits 0 on the signal. `proof.mjs` and `cross.mjs` refuse a longer `--timeout` without `--stress`, and `mutate.mjs` caps its whole run at an hour. The task's session measures with the run's patch applied and writes its verdict straight into the checkout, so nothing it lands carries the run's change.

## Main changes

- `skills/sync-pstack/assets/block.md` in dotai: the Time budget rule, and the Autopilot rule's suggested-task clause, which now also takes a measurement the Time budget rule sends there.
- `skills/sync-pstack/assets/pstack/proof.mjs` and `cross.mjs` in dotai: the hour cap and `--stress`. `proof.mjs` runs the command under a supervisor in its own process group, which stops the group at the timeout. The tests are in `skills/sync-pstack/scripts/sync-pstack.test.mjs`.
- `skills/sync-pstack/assets/pstack/mutate.mjs` in dotai: a spec timeout over an hour is refused, and the whole run stops at an hour. `decisions-check.mjs`'s `chips wait` now stops after 60 minutes, not 240.
- `skills/sync-pstack/assets/pstack/rules/close.md` and `rules/long-runs.md` in dotai: a measurement handed to a suggested task takes the close rule's accepted route, so its plan can be marked done.
- `skills/sync-pstack/assets/pstack/rules/chips.md` and `skills/chips/SKILL.md` in dotai: the suggested-task definition takes the same exception.
- `.agents/rules/benchmark.mdc`: the final tree's full protocol fits the hour, and a protocol that cannot fit goes to a suggested task. A Perf issue run whose measurement goes to one stays partial, because its validator does not accept a deferral yet. The pre-acceptance probe never goes to a suggested task.
- `docs/development/agent-skills.md`: the workflow guide says the same, and so does ellie's `docs/development/agent-workflow.md`.
- Plate's `check:workflow` inventory now counts the installed `chips` skill, 24 names.

## Steps

- [x] Write the rule, the helper caps and their tests; prove each new test fails on the old helpers.
  Built on 2026-10-16 (decision log, the built, verify and panel rows). Each new helper test fails alone on the tree before its fix (`docs/plans/artifacts/2026-10-16-time-budget/budget-tests-old-helpers-a2.log`, `docs/plans/artifacts/2026-10-16-time-budget/repro-r1-late-a1.log`, `docs/plans/artifacts/2026-10-16-time-budget/repro-r1-graceful-a1.log`, `docs/plans/artifacts/2026-10-16-time-budget/repro-r1-stubborn-a1.log`, `docs/plans/artifacts/2026-10-16-time-budget/repro-r1-zero-a1.log`, `docs/plans/artifacts/2026-10-16-time-budget/repro-r1-mutate-a1.log`).
- [x] Writing passes: `deslop` and `no-comments` on the helpers, `unslop` on the prose.
  Built on 2026-10-16 (decision log, the four writing rows, one per panel round's fixes).
- [x] dotai's checks: `build-workflow`, the sync-pstack tests and `validate-skills`.
  Passed on the round 3 tree (`docs/plans/artifacts/2026-10-16-time-budget/build-workflow-a4.log`, `docs/plans/artifacts/2026-10-16-time-budget/sync-pstack-tests-a4.log`, `docs/plans/artifacts/2026-10-16-time-budget/validate-skills-a5.log`); the block text changed after that run, so the checks run again before the push.
- [x] One helper panel round on the combined diff.
  Ran three rounds to the cap, because rounds 1 and 2 each applied a critical finding (decision log, the panel rows; the last round's answers start at `docs/plans/artifacts/2026-10-16-time-budget/seat-opus-r3.md`). Round 3's critical sent the Perf issue validator's deferral back to planning, as Open work says, and Build deviations names the change.
- [x] Paired smoke from the uncommitted dotai tree, then push dotai and sync every managed project.
  Smoked seven rounds, pushed dotai `dbf7457`, `7f290f2` and `c6b3c6d`, and synced ellie, plate-2 and plate's PR worktree from `c6b3c6d` (decision log, the smoke, push and delivery rows). The smokes are read-only, so they prove routing, not the actions..
- [x] `pnpm run prepare`, the resources check and `verify` on each project.
  All pass after the `c6b3c6d` apply (`docs/plans/artifacts/2026-10-16-time-budget/prepare-plate-2-a4.log`, `docs/plans/artifacts/2026-10-16-time-budget/sync-resources-plate-2-a5.log`, `docs/plans/artifacts/2026-10-16-time-budget/check-workflow-plate-a4.log`, `docs/plans/artifacts/2026-10-16-time-budget/verify-ellie-a3.log`, `docs/plans/artifacts/2026-10-16-time-budget/verify-plate-2-a2.log`, `docs/plans/artifacts/2026-10-16-time-budget/verify-plate-wt-a2.log`).

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the rule lives | In the block itself, read on every turn, because `long-runs.md` is read only for multi-slice runs and resumes (safe) | In `long-runs.md` | rule in long-runs |
| Waits the cap covers | Waits on the machine's state, such as a quiet host; a wakeup chain for a known external gate, such as a quota reset, stays as the Autopilot rule says (look) | Every wait, external gates included | cap every wait |
| The workflow-change trial | The paired smoke from the Lesson mode only; pstack's Eval playbook trial does not run, because this caps a resource and changes no discovery or method selection (look) | Run the Eval playbook's paired trial before adopting | run eval |
| The Perf issue validator's deferral | Suggested task t_6da4ae97, which you start after you commit this run's `benchmark.mdc`. Until then such a run stays partial and hands back, so it blocks nothing (look) | This run writes and builds that plan before it closes | build deferral now |

## Build deviations

- The helper panel. Approved: "One helper panel round on the combined diff." Built: three rounds to the cap. Round 1 replaced `proof.mjs`'s timeout with a process-group supervisor and added a `deferred:` result to the Perf issue validator. Round 2 widened that deferral to every timing gate. Round 3 found that a deferred lane before the last one still blocks the lanes after it. The panel allows one replacement per mechanism, so the validator, its tests, `perf-issue.md` and `CODING_STANDARDS.md` went back to `HEAD`, and `benchmark.mdc` says a Perf issue run whose measurement goes to a suggested task stays partial (decision log, round 3's rows).

- dotai commits. Approved: one dotai push. Built: three, because smokes five and six each found a clash in the new wording (decision log, the fix rows). Each commit holds only this run's hunks; another session's uncommitted cleanup work in the same files stays uncommitted, because its tests fail.

## Open work

- The Perf issue validator's deferral: a lane, a kept fix's rerun or an inherited line whose measurement goes to a suggested task cannot pass `validate-benchmark-plan.mjs --complete`, so such a run stays partial. Suggested task t_6da4ae97 writes that plan and builds it. Its brief cites the reverted code, `docs/plans/artifacts/2026-10-16-time-budget/r3-reverted/perf-deferral.patch`, and an inventory of the validator's 60 checks that read a lane's status, its order or a timing result, `docs/plans/artifacts/2026-10-16-time-budget/explorer-validator-a1.md`. owner: zbeyens, who starts t_6da4ae97. stop: t_6da4ae97 lands, or zbeyens drops it.
- `proof.mjs` leaves a background process running when the command's own process exits first, which round 2 dismissed as rare (0 of 28,971 proof logs). owner: zbeyens, who starts suggested task t_fe1ac0db. stop: t_fe1ac0db lands or is dropped.

## Close

Reversals first: the helper panel ran three rounds instead of one, and round 3 took out the Perf issue validator's deferral, so a Perf issue run whose measurement goes to a suggested task still stays partial until t_6da4ae97 lands. dotai took three pushes instead of one, because smokes five and six each found a clash in the new wording.

Landed: the Time budget rule and the helper caps in dotai `dbf7457`, `7f290f2` and `c6b3c6d`, synced to ellie (`e621d8ffe`, plus `4c5dd3b7e` to keep the helpers executable), plate's PR 5166 (`14984aa1ee`) and plate-2's working tree, which you commit. All 284 sync-pstack tests pass, and `verify` passes in all three projects.

Proof limits: the smokes are read-only, so they show what each runtime would do, not that it does it. They ran S1 to S4 in every project and S5 in plate-2 only. No real suggested-task session has yet run a handed-off measurement. On your word, the decision-trail review was cut to 15 minutes over rows 23 to 48.

Attention
reviewed by gpt-6.1-sol
- The dotai pushes ran before this review, as Lesson mode orders; ellie and plate delivered after it.
- Calling the hand-off your word for the narrower exit condition is my reading of "should not block the poteto workflow". The Close claims only what ran.
- Perf issue runs still stay partial until t_6da4ae97.
- The smoke rows overstated S5's coverage; corrected in the log.

Counts: 6 steps, 6 done.
