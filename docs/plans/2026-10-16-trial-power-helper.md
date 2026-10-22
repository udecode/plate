---
review_scopes: []
review_basis: []
work_kind: workflow
review_commit: 0a5cb4f411c51a22bd494a908915b9f073fc2734
review_inputs: [tooling/scripts/trial-power.mjs, tooling/scripts/trial-power.test.mjs, .agents/playbooks/references/workflow-change.md, docs/development/agent-skills.md, docs/plans/2026-10-15-trial-power.md, docs/plans/2026-10-15-trial-power.decisions.tsv]
---

# A helper that tells whether a workflow trial can separate its arms

Status: executed; the changes wait in the working tree for your commit
Page: https://claude.ai/artifact/1iwnKXzgGfm5FQVekcZ5ex
Playbook: plan

Verdict: Pursue, narrowly. The checks a trial can count go into a helper, and the rest stay text or go to their owners' tasks. No paired trial this repository has run, in five plans, checked before its arms ran whether its keep rule could keep a real gain and refuse a useless one. Three never asked, the regression sweep asked only after its trials, and the one run that asked in time got the math wrong, because it counted 24 answers from one session as 24 independent ones. That is arithmetic, which a tested script checks the same way every time and text cannot. The new helper, `tooling/scripts/trial-power.mjs`, reads a trial's frozen spec and refuses it before any arm runs when cases share a session, when the pilot and the trial use different graders, when the incumbent's pilot caught nothing or when the gain cannot happen. It also refuses a key whose dry grade docks any version's right answer or passes one with only its call flipped. And it refuses a keep rule that keeps the claimed gain less than two times in three, or keeps a candidate no better than the incumbent more than one time in five, for any way the two versions' answers on a case relate and across the pilot's likely range. Afterwards it judges the result only under the digest logged at the freeze, and calls it inconclusive when the spec does not pass, when an arm scored too high for any keep, or when the incumbent and the candidate both caught nothing. The findings that need judgment, not arithmetic, stay out of it.

## Brief

### What will change?

A script now checks, before a workflow trial runs, whether it can tell the versions apart, and refuses trials that can't. We cut the rule for picking trial cases, and a separate task decides it.

### What could go wrong?

No real trial has used it yet. Its guarantees assume the cases were picked at random, and nothing checks that. A swapped key still gets through. Trials get bigger, since a one-in-five gain needs about 80 cases.

## Teach

When an agent workflow change claims to help, we run a trial. Each version answers the same cases, and a separate grader counts what each gets right against a hidden key. A keep rule, written first, says how far ahead the new version must finish.

So far no trial checked correctly, before it ran, whether that rule could work. With few cases, or many answers from one session, chance alone decides most results. And a key that rewards wording instead of the right call scores every version the same.

The new script does the math first. It works out how often the rule would keep a real gain and how often a useless change, and it refuses answers that share a session. It also checks that one grader grades the trial and its pilot, and that the key passes each version's right answer and fails it with only the call flipped. Someone who never saw the key writes those answers.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the checks are kept | A script that refuses a weak trial, plus one pointer in the trial rules (look) | Keep the checks on the earlier plan page only | record only | big |
| A trial of the pointer itself | Adopt it without one, since it only refuses weak trials and its math is proven by tests (look) | Run a paired trial of the pointer first | trial it first | small |
| Answers from one session | Refuse them, so each case runs in its own session | Model them with a correlation the lead states | model correlation | small |
| A useless change's chance of being kept | Checked whatever the other versions score, at every rate | Checked with every version at one shared rate | shared rate | detail |
| A small pilot | The power check covers the pilot's likely range, not just its score | Use the pilot's score alone | pilot score only | small |
| A candidate that swaps right and wrong cases | Bound both checks whatever the pairing, which needs about 80 cases (look) | Assume the versions fail independently, which needs about 40 | assume independent | big |
| How trial cases get chosen | Ship the helper now, saying its bounds assume randomly drawn cases, and decide the draw in its own task (look) | Build a draw no one can steer before shipping | build the draw now | big |
| Power near the bar | Refuse a trial whose power cannot be shown above two in three | Accept a small error from a coarse grid | coarse grid | detail |
| Where the script lives | The project's tooling, beside the trial rules it serves | The shared pstack source | shared source | detail |
| Findings that need judgment | Three new design questions, one fix task, and one finding added to an open task | Write them into the trial rules now | write rules now | small |

## Main changes

- New `tooling/scripts/trial-power.mjs` judges a trial spec before any arm runs and its result after, with exit codes like the benchmark's `paired-timing.mjs`: 0 pass or keep, 1 refused or drop, 3 inconclusive, 2 error.
- `.agents/playbooks/references/workflow-change.md` requires the helper to pass before any arm runs, adds the dry grade's two reference answers per case and arm from an agent that has not seen the key, and counts a result only through `--analyze` with the frozen digest.
- `docs/development/agent-skills.md` says a trial runs once the helper shows it can tell its arms apart.

## Evidence

Model: claude-opus-5-5 @high, the session tool's report for this card session; its brief asked for xhigh.

This continues `docs/plans/2026-10-15-trial-power.md`, whose Stop verdict on rewriting the trial law it keeps. That plan named this helper as the open design question. It builds on the regression-sweep reflect review in `docs/plans/artifacts/2026-10-15-regression-sweep/reflect/review.md`, a git-ignored file in the main checkout.

### Requirements

- A broad change to discovery, method selection or completion behavior needs evidence that it beats the incumbent, and an unrun trial is pending. Source: `workflow-change.md`.
- The lead never sees a key before grading ends, and the variants, prompts, grader brief and keep rule freeze before any arm runs. Source: `workflow-change.md` and `plan.md`'s trial delta.
- A repeated mistake gets architecture, types, a check or a helper before rule text. Source: `CODING_STANDARDS.md`'s rules table and the pstack Improve the workflow rule.
- The task's ask: decide whether the trial checks become structure, such as a helper that computes power for correlated answers and dry-grades a key, or stay recorded. Source: the t_decefa65 brief.

### Census of past trials

Searched with `git grep --untracked -l 'keep rule' -- 'docs/plans/*.decisions.tsv'`, which lists 14 logs, then read the trial rows of the five that ran a paired trial. Inferred from those rows, not from the arm transcripts.

- `2026-10-06-knowledge-reorg` ran five held-out queries per arm, one run each, and round 3 tied 35 to 35. It had no power check.
- `2026-10-09-agents-md-diet` ran one run per side on six requests and kept the moves "on one sample per arm". It had no power check.
- `2026-10-12-suggestions-complete` ran three prompts, one run per side, then reran one prompt under a frozen keep rule and adopted the lesson. It had no power check.
- `2026-10-15-regression-sweep` ran three trials, which scored 0, 0 and 1 of 12, then 18 of 18 for every arm, then 0 and 0. Its false-keep rate was computed only after a round 6 seat asked.
- `2026-10-15-trial-power` ran the only power check made before its arms ran. It counted 24 independent answers when each arm answered all 24 in one session, and its pilot and trial used different graders.

### Lanes

- **A helper for the arithmetic** (picked). Power, false keeps, correlated sessions, one grader, a reachable pilot and a passing dry grade are all mechanical once the spec states them, and the replays show it refuses the last trial for the two reasons its panel found by hand.
- **Leave the checks on the earlier plan page** (the strongest deletion). Rejected. Of the five plans above, three never computed power, one computed it only after its trials ran, and one computed it wrong, so a recorded checklist has already failed to reach the lead.
- **Rewrite the trial law with every check as text.** Rejected by the earlier plan's Stop, and the reason holds: its own trial passed the text checks and still failed.
- **A full trial harness that launches the arms.** Rejected. Launching runs through `cross.mjs`, which the shared source owns, and the checks that matter all run before any arm.
- **Drop required trials.** Rejected for the same reason as before: the incumbent law still keeps an untested change pending.

Proof limits. Both bounds assume each trial case is an independent random draw from the cases the claim is about, and the trial law does not yet say how cases are drawn, so a hand-picked suite or a steered draw is outside them. Specs past about 150 cases take 15 seconds to over a minute, because the power search refines every share to 0.002 even far above the bar. The pilot is the incumbent's alone, so nothing measures how often the versions disagree. Nothing bounds a candidate no better than an alternative. The dry grade catches a key that scores more than the call only as well as the key-blind writer follows each version's rules, and the lead reads only its pass and fail cells. Nothing in the helper can tell that a spec's numbers describe the trial that actually ran.

### Dependents

- `.agents/playbooks/plan.md` is unaffected: its trial delta sends the trial's design to `workflow-change.md`.
- Suggested task t_e2eab08a, which checks the regression sweep's round 1 keep rule, now waits on this task, so it runs on the helper instead of by hand.

### Findings outside the helper

Each regression-sweep reflect finding the brief lists, and where it goes.

- Judgment 1, that a floor or ceiling result is inconclusive, goes to `--analyze`. The helper does not model a planted control row.
- Judgment 2, false keeps and drops before the freeze, goes to the helper's power and false-keep check.
- Judgment 3, a reachability pilot, goes to the helper, which refuses a pilot that caught nothing.
- Divergent 1, that a result cited later carries its own verdict, goes to `--analyze`, which prints that verdict.
- Judgment 4 and Divergent 3, a method only a person can run and the panels' demands for agent trials of it, go to design question t_895d65a0, since no helper can measure a person-only method.
- Divergent 4, design runners reading sealed keys, goes to design question t_47a5235c on who counts as having seen a key.
- Judgment 7, a plain-language pass that dropped a claim's qualifiers, goes to fix task t_f7148d32 on the plan-page skill.
- Tooling 2, plan-mode arms with no web access, joins t_c4abe78e, which already fixes the sweep trials' `cross.mjs` gaps.

## Paired bounds

Rounds 2 and 3 of the panel showed that both checks undercounted when the versions are paired on the same cases. If the candidate gets right exactly the cases the incumbent gets wrong, both score the same on average, yet the round 1 example rule kept it 0.215 of the time (Astra and Sol, by exact enumeration). The same pairing with a real gain also lowers power below what the independent model reported. The false-keep check had its one replacement in round 1, so round 3 reviewed this plan before its build.

- **False keep.** On the cases where the candidate and the incumbent differ, a candidate no better than the incumbent wins each at most half the time. So its chance of clearing `overIncumbent` is at most the largest binomial tail over every possible number of differing cases. That bound is exact, needs no grid, and holds whatever the alternatives score (Astra's and Sol's round 3 suggestion).
- **Power.** The keep chance depends on the incumbent's rate only through how often the versions can differ. That share is widest at the rate in the pilot's interval nearest (1 - gain) / 2, and at that rate the helper takes the smallest keep chance over every share of differing cases, less each alternative's worst chance of missing its margin. The keep chance moves at most cases / 2 per unit of that share, so the helper splits the range until its proven floor is within 0.002 of the smallest value it found, and stops early once some share falls below two in three.
- **Assumption.** Both bounds assume each trial case is an independent random draw from the cases the claim is about. Diff round 1 had the lead draw from twice the cases needed, with replacement and a logged seed, but the lead picks the seed and can preview draws. That draw rule had already had its one replacement, so round 2 removed it. Suggested task t_feec64a0 decides how to draw cases so no one can steer the draw.
- **Dry grade.** Each case gets a right answer and a call-flipped twin under every arm's version. One answer holding both versions' content passed a key that docks any answer missing one version's content, and that key would dock the other version's right answers in the trial.
- **Effect.** A gain of 0.2 over a 6 of 8 pilot passes at 80 cases with margins 11 and 2: power 0.735 and worst false keep 0.130. The round 1 example (40 cases, margin 5) is refused at 0.261. The seats' 596-case grid-gap rule is refused at 0.206.
- **Proof.** `verify-bounds.mjs` in the run directory recomputes the false keep by direct convolution, and `verify-dense.mjs` recomputes power by direct convolution over 2000 incumbent rates and at least 1500 shares each; the helper's floor sits at or below each within 0.002 per margin. Tests pin the refused complementary case, two of the seats' power cases that the old grids passed, and a docked right answer under one version.
- **Lanes considered.** Keeping the independent bounds and stating their limits is rejected, because the brief asks for correlated answers to count. Estimating the pairing from a paired pilot is rejected, because a four- to eight-case pilot cannot measure it. A sign test on the differing cases is rejected for now, because its power before the trial depends on how often the versions disagree, which a pilot of the incumbent alone cannot show.

## Steps

- [x] Write the verdict and plan. Done: docs/plans/2026-10-16-trial-power-helper.md.
- [x] Build the helper and its test. Done: `node --test tooling/scripts/trial-power.test.mjs`, docs/plans/artifacts/2026-10-16-trial-power-helper/test-a1.log.
- [x] Replay the 2026-10-15 trial's spec and the panel's break cases, and check the math. Done: docs/plans/artifacts/2026-10-16-trial-power-helper/replay-tp-2026-10-15-r2-a1.log, docs/plans/artifacts/2026-10-16-trial-power-helper/montecarlo-r2-falsekeep-a1.log, docs/plans/artifacts/2026-10-16-trial-power-helper/montecarlo-r2-power-a1.log.
- [x] Point the trial law and the contributor guide at the helper. Done: .agents/playbooks/references/workflow-change.md, docs/development/agent-skills.md.
- [x] Run panel rounds 1 and 2 on the diff and settle each finding. Done: docs/plans/2026-10-16-trial-power-helper.decisions.tsv, its panel rows.
- [x] Review the paired bounds' plan in panel round 3. Done: docs/plans/2026-10-16-trial-power-helper.decisions.tsv, its round 3 panel rows.
- [x] Build the paired bounds, with their tests and an independent check, and review the diff. Done: docs/plans/2026-10-16-trial-power-helper.decisions.tsv, its diff rounds 1 to 3, docs/plans/artifacts/2026-10-16-trial-power-helper/mutate-final.json.
- [x] Run the writing passes and the lint check. Done: docs/plans/2026-10-16-trial-power-helper.decisions.tsv, its writing rows and its lint build row.
- [x] Route the findings outside the helper in the ledger, land the patch and log the task landed. Done: docs/plans/suggested-tasks.decisions.tsv, its t_decefa65 landed row, /Users/zbeyens/git/plate-2/docs/plans/artifacts/chips/t_decefa65.patch.

## Close

Reversals and deviations first.

- The rule for how a trial draws its cases is gone. Plan round 3 asked for a random draw from twice the cases needed. Diff round 1 made it a draw with replacement and a logged seed, after Astra showed that a small pool drawn without replacement breaks the bounds. Diff round 2 found that the lead picks the seed and can preview draws. That rule had already had its one replacement, so it left the loop. The helper, the trial law and this page now say the bounds assume independent random draws and that nothing ensures them, so a keep is evidence, not proof. Suggested task t_feec64a0 owns a draw no one can steer.
- Diff round 1 replaced power's search and the dry grade's single reference answer, each mechanism's one replacement in the diff rounds. Diff rounds 2 and 3 found no critical defect in either.
- Diff round 3, at the cap, found that the header promised a proven floor even for a refused spec. The fix rewords the header and the refusal and changes no verdict, so no round reviewed it. The lint fix after it moved dry-grade lines to named fields, with the same tests passing.
- Plan round 2's deviation, which kept the independent false-keep check until the paired bound landed, ended when the build replaced it.

What landed. `tooling/scripts/trial-power.mjs` and its 20 tests. The trial law in `.agents/playbooks/references/workflow-change.md` requires the helper to pass, and its digest to be logged, before any arm runs, asks for a dry grade per case and arm, and counts a result only through `--analyze`. `docs/development/agent-skills.md` points contributors at the helper.

Proof, by scope.

- False keep. The bound is exact and needs no grid. `verify-bounds.mjs` recomputes it by direct convolution and matches on three specs, and the seats' 596-case rule is refused at 0.206.
- Power. `verify-dense.mjs` recomputes it by direct convolution over 2000 incumbent rates and at least 1500 shares. The helper's floor sits at or below it within 0.002 per margin at 80 cases (0.735 against 0.7391) and 60 cases (0.777 against 0.7809). The eight power cases the seats built across the diff rounds are all refused.
- Reproductions. On the final bytes, each of five fixes from the build and diff round 1 fails its own test when reverted alone, and the control run passes (mutate-final.json).
- Dry grade. The per-version format is tested only in the helper. The one replay on a real key, 2026-10-15's, used the earlier one-answer format and refused that key for docking 13 of 24 cases.

Where proof stops. No real trial has run through the helper. The per-version dry grade has not run on a real key. Nothing ensures the trial's cases are a random draw. The pilot measures only the incumbent, so nothing measures how often the versions disagree, and nothing bounds a candidate no better than an alternative. Specs past about 150 cases take 15 seconds to over a minute. This card session ran at high effort, while its brief asked for xhigh.

Steps: 9 of 9 done.

Open work is in the section below, each item with its owner and stop.

### Attention

reviewed by gpt-6.1-sol @xhigh

- Critical. The one-in-five bound holds only if the trial's cases are a random draw, and nothing checks that yet. A clustered, hand-picked suite can keep an equal candidate about half the time. The Defaults row "How trial cases get chosen" ships the helper with that limit stated, and t_feec64a0 decides the draw.
- Warning. The dry grade is bound to neither the key nor the cases. The helper checks counts and arms, not which case ids ran, and its digest leaves out the key, so a swapped key or case passes. t_feec64a0's brief covers binding the key into the digest.
- Warning. The only real-key replay used the earlier one-answer dry grade with separately written wrong answers, so the final per-version format has not run on a real key.
- Warning. In plan round 2, keeping the old false-keep check rested on a false choice between keeping it and having no check. The helper could have kept its other refusals and blocked every pass until the paired bound landed. The build replaced the check either way.
- Warning. A candidate that loses badly while the incumbent is at the ceiling, such as 0 against 80 of 80 cases, reads inconclusive, so it can be tried again instead of being dropped. Diff round 1 dismissed this because the incumbent stays either way.
- Nit. A failed mutation run that changed the tests had no row. It is logged now.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `tooling/scripts/trial-power.test.mjs`
- `docs/plans/2026-10-15-trial-power.md`
- `docs/plans/2026-10-15-trial-power.decisions.tsv`

## Open work

- Suggested tasks t_895d65a0, t_47a5235c, t_f7148d32 and t_c4abe78e in `docs/plans/suggested-tasks.decisions.tsv` hold the findings outside the helper. owner: zbeyens. stop: each task lands or is dismissed.
- Suggested task t_feec64a0 decides how a trial draws its cases so no one can steer the draw. owner: zbeyens. stop: it lands or is dismissed.
- The power search is slow past about 150 cases, deferred from diff round 2. owner: zbeyens. stop: the first real trial spec over 150 cases.
- The power search returns a proven floor and a sampled value as one bare number, so the header explains which a refused spec prints; returning them separately was flagged at the review cap and left. owner: zbeyens. stop: the next change to the power search.
