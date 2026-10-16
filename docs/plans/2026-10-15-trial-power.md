---
review_scopes: []
review_basis: []
work_kind: workflow
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [.agents/playbooks/references/workflow-change.md, .agents/playbooks/plan.md, .agents/playbooks/build.md, docs/development/agent-skills.md, docs/plans/2026-10-15-regression-sweep.md]
---

# What makes a workflow trial able to tell its arms apart

Status: closed: Stop verdict, no rule edit; two follow-up tasks offered
Page: https://claude.ai/artifact/CHeae54aR4k5WoRBMBrLgp
Playbook: plan

Verdict: Stop on rewriting the trial law. A trial can tell its arms apart only when all of these hold before any arm runs. Each arm reaches every input and tool through the runner it will run with. The key holds only items an arm can reach. The grade scores the call, counts only what separates a right call from a wrong one, measures the reason the change exists, and uses one grader for the pilot and the trial. The cases recreate the conditions the change is meant to fix. And the keep rule keeps the claimed gain at least two times in three and a no-better version at most one time in five, with answers from one session counted as correlated. This plan wrote most of those checks into the law, then ran a trial of the rewrite under them. That trial could not tell its arms apart: its key scored restated facts, docked a rule every arm had to follow, and each arm answered all cases in one session. So the rewrite has no passed trial, and the law in force keeps it pending. Its own trial also showed that text alone does not catch a bad grading key. The law stays as it is, and the findings this verdict did not settle go to two suggested tasks. Suggested task t_cd60e5cf asked this question, from the regression-sweep reflect review's Judgment 1 to 7 and Divergent 1 to 4.

## Brief

### What will change?

No rule changes. This page now lists what a trial needs before it can tell two versions apart. A rewrite of the trial rules was dropped, because its own trial could not show it helped.

### What could go wrong?

The sweep's trial failures can happen again until a follow-up task turns these checks into a helper or a rule that works. The page's checklist helps only a lead who finds it.

## Teach

Before we change how agents find, pick or finish work, we run a paired trial. Each version, called an arm, does the same task, and a separate grader counts what each catches against a hidden answer key.

A trial can only tell arms apart when each arm can use its tools, the key holds reachable items, the grade counts the right call rather than wording, and the pass mark has a fair chance to spot a real gain. The regression sweep's three trials missed these, and every arm tied at or near zero or full marks.

We wrote those checks into the rules and tried the new text against the old. That trial broke the same way: its key rewarded restating facts, so it could not show a difference. The rules stay, and a follow-up task decides whether a helper can do these checks instead of more text.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The trial rules | Keep the current text, since the rewrite has no trial that shows it helps (look) | Adopt the rewrite on its reasoning, marked unmeasured | adopt rewrite | big |
| A seen answer key | Leave the rule as it is, and send key reuse to the follow-up task | Widen it now without a trial | widen key rule | small |
| What's still unowned | One design-question task for the rest of the sweep's findings, plus a fix for the sweep's first round | Leave them recorded here only | no follow-up | small |
| A trial of the rewrite | Ran one under the proposed checks, with a pilot and one repair | Skip it and decide on reasoning | skip self trial | small |
| Where the page lives | Its own page, apart from the big workflow page | Add it to the workflow page | workflow page | detail |
| Review | Three panel rounds on the plan, because the question was contested | No panel | skip panel | detail |

## Main changes

- No rule, playbook or guide file changes. This plan and its decision log are the record.

## Trial of the rewrite

The rewrite changed when a plan step counts as adopted, which is completion behavior, so it got a trial, run under the checks it proposed. The result is inconclusive and decides nothing for any arm.

- **Arms.** A is the incumbent text. B is the rewrite, saved as `docs/plans/artifacts/2026-10-15-trial-power/variants/b/`. C is the incumbent plus one sentence: "A result with every arm at the floor or at the ceiling is inconclusive and decides nothing." Each arm was `claude-opus-5-5 @high` through `cross.mjs --to claude`, run once from its own workspace, answering all 24 cases in one session.
- **Key.** A separate Opus agent wrote 24 cases, 4 pilot cases and the key from the reason for the change, without the variants. The lead read the key only after grading.
- **Access.** Disposable probe sessions read every workspace file before the arms ran, and again after the cases changed.
- **Power.** A's pilot caught 3 of 4, graded by Sol. On 12 cases the rule's power was 0.59. The repair added 12 cases and gave 0.71, but only by counting each case as independent.
- **Result.** Astra graded blind: A 15, B 12, C 10 of 24. Three panel seats showed the numbers do not measure the calls. Graded on the call alone, A and B reach the key on nearly every case. A lost four cases to one opening paragraph that followed plan.md's rule to run the simplest alternative too, which the key did not expect. Several zeros were for not restating a fact in the case. At the observed rates the rule's power is 0.50. The pilot and the trial also used different graders.
- **What it teaches.** The trial passed the access, reach and power checks as written and still could not separate its arms, because the key graded wording, and nothing checked the key before the arms ran. Hence the grade and grader conditions in the Verdict, and the follow-up task's dry grade of the key.

## Evidence

Model: claude-opus-5-5 @high, the session tool's report for this card session.

This is the first review of the question. No review-ledger scope owns these files (`node tooling/scripts/review-ledger.mjs lookup .agents/playbooks/references/workflow-change.md` matches nothing), so the page carries no ledger front matter. It builds on the regression-sweep plan's `## Skill trials` section and the reflect review in `docs/plans/artifacts/2026-10-15-regression-sweep/reflect/review.md`.

### Requirements

- A broad change to discovery, method selection or completion behavior needs evidence that it beats the incumbent. Source: `workflow-change.md`'s second paragraph.
- The lead never sees a key before grading ends, and the variants, prompts, grader brief and keep rule freeze before any arm runs. Source: `workflow-change.md` and `plan.md`'s trial delta.
- An option that leaves the owner's stated goal unmet is never a default. Source: the Plan pages rule in `.agents/pstack/rules/pages.md`.
- The task's own ask: decide what makes a trial able to separate its arms, then plan any fix. Source: the t_cd60e5cf brief.

### Lanes

- **Rewrite the trial law with the checks** (arm B). Not adopted. Its trial was inconclusive, so under the law in force it stays pending, and its own trial showed the failure it targets survives text.
- **One sentence on floor and ceiling results** (arm C). Not adopted, for the same reason.
- **Keep the current text** (arm A, kept). Not because it won, which the trial cannot show, but because nothing beat it.
- **Spend a seen key for every agent that read it.** Dropped. Its wording forbade the grader's own brief, and build.md would need a trial of it that no case covered.
- **Drop required trials** (the strongest deletion). Rejected. This run's trial was the check that stopped an untested rewrite from landing.
- **Make the checks a helper** (power for correlated answers, a dry grade of the key on a known-good answer). Not built here. It is the follow-up design question, t_decefa65.

Proof limits. The trial ran each arm once, on cases one agent wrote, and graded with a key the panel showed was flawed. Nothing here measures whether the checks would have saved the sweep's long run.

### Dependents

- `.agents/playbooks/plan.md`, `.agents/playbooks/build.md` and `docs/development/agent-skills.md` are unaffected, since no rule changes.
- `docs/plans/2026-10-15-regression-sweep.md`'s round 1 keep rule states a false-keep rate but not its chance of keeping a real gain, and has no rule for a result at the floor. Task t_e2eab08a checks it before seeding.

## Steps

- [x] Write the verdict and plan. Done: docs/plans/2026-10-15-trial-power.md; `node .agents/pstack/plan-page.mjs docs/plans/2026-10-15-trial-power.md`.
- [x] Run panel rounds on the plan and settle each finding. Done: `docs/plans/2026-10-15-trial-power.decisions.tsv`, its three rounds of `panel` rows.
- [x] Run the rewrite's trial and record its result. Done: `docs/plans/2026-10-15-trial-power.decisions.tsv`, its `verify` rows, which record the trial inconclusive.
- [x] Apply the kept text. skip: Stop verdict, nothing is kept.
- [x] Run `unslop` on the plan. Done: `docs/plans/2026-10-15-trial-power.decisions.tsv`, its `writing` rows.
- [x] Land the patch in the checkout, log the task landed and offer the follow-up tasks. Done: `docs/plans/artifacts/chips/t_cd60e5cf.patch`, and the ledger rows for t_cd60e5cf, t_decefa65 and t_e2eab08a in `docs/plans/suggested-tasks.decisions.tsv`.

## Open work

- The rest of the regression-sweep reflect's trial findings, and whether these checks become a helper, are task t_decefa65 in `docs/plans/suggested-tasks.decisions.tsv`. owner: zbeyens. stop: that task lands or is dismissed.
- The sweep's round 1 keep rule gets its power check before seeding as task t_e2eab08a in the same ledger. owner: zbeyens. stop: round 1 seeding starts, or the task lands.
- The reflect's tooling findings stay with task t_c4abe78e, and its panel goal check with t_68844aa2, in the same ledger. owner: zbeyens. stop: each task lands or is dismissed.

## Close

Reversals and deviations.

- The verdict reversed twice. It opened as Pursue with a rewrite of the trial law. After the rewrite's own trial it narrowed to one kept sentence. After the third panel round it became Stop with no edit, because that trial could not tell its arms apart and the kept sentence broke the grader's brief.
- The page claimed for a while that "the old text made the right call more often" and that the trial was conclusive. Both are withdrawn; the decision log supersedes those rows.

What landed.

- This plan and its decision log, applied to the checkout's working tree as a patch, uncommitted, for the owner to commit.
- Two suggested tasks: t_decefa65, a design question that waits on this task, and t_e2eab08a, a fix with no wait.

Proof and its limits.

- Three panel rounds, each with Opus, Astra and Sol answering, on frozen trees `ad7ee3c`, `add0219` and `9aa6e44`.
- The trial's files are in `docs/plans/artifacts/2026-10-15-trial-power/trial/`. Its result is inconclusive and supports no claim for any arm.
- Counts: 6 steps, 5 done and 1 skipped.
