---
name: autogoal
description: Create, verify, repair, and close durable Codex goals with measurable outcomes, evidence gates, plan templates, blocker handling, completion audits, and goal-backed workflow repair.
---

# Autogoal

Use this when the user asks for a durable objective, long-running autonomous
work, goal setup, or when a governing repo skill requires goal setup before
work starts.

This skill turns a vague "keep going" instruction into a thread-scoped
completion contract: what should be true, how it is verified, what must not
change, and when Codex should stop.

## Core Take

A normal prompt says: do the next thing.

A goal says: keep working until this outcome is true, or until the evidence
shows a real blocker.

Goals are for work where the next move depends on what Codex learns along the
way: debugging, migrations, flaky tests, benchmark tuning, deep research,
large refactors, prototypes, browser-proof loops, and pass-gated plans.

Goals are not a permission slip to wander. They are a scoped, evidence-checked
contract.

No measurable outcome, no goal. A goal must have a verification surface and a
completion threshold before `create_goal` is called. Prefer numbers: score,
count, latency, coverage, pass count, failing-to-passing repro count, issue
rows, or explicit command success. When a numeric target does not fit, use a
binary artifact checklist that can be audited from files, commands, screenshots,
browser proof, or source-backed citations.

## Universal Boundary

`autogoal` is the goal lifecycle kernel. It owns:

- objective shape
- measurable completion thresholds
- evidence standards
- active goal conflict handling
- durable plan state
- blocker and completion rules
- repair routing when a goal-backed workflow misses expectations

It does not own project policy. Keep repo commands, package managers, browser
tools, release rules, PR policy, scorecards, issue ledgers, and lane-specific
pass schedules in derived skills or project-owned
`docs/plans/templates/<template>.md`.

Derived skills may be stricter than `autogoal`; they should not duplicate the
goal lifecycle. `autogoal` says how work remains honest. The derived skill says
what the lane actually requires.

## Template Composition

Goal plans are composable, but only through static materialization.

The model is:

1. one active goal
2. one concrete `docs/plans` plan file
3. one primary template
4. optional materialized packs

The primary template is chosen by dominant risk: `task` for normal execution,
`docs` for docs-dominant work, `major-task` for heavyweight architecture or
proposal work, and repo-specific templates for domain lanes.

Packs are chosen by touched surface. They add recurring gates without becoming
parents:

- `docs`: docs are touched but not the dominant deliverable
- `agent-native`: agent instructions, skills, hooks, commands, prompts, or
  user-action tooling changed
- `browser`: real browser, route, UI, native browser/OS, console, network, or
  interaction proof is required
- `package-api`: package exports, public API, release artifacts, package
  boundaries, or package-level checks changed

Core execution and review gates belong in the primary template. Every primary
template must include `Autoreview` as the last human-readable gate before
`Goal plan complete`. Packs are only for optional touched surfaces that would
otherwise be absent from that template.

Do not create runtime inheritance between templates. The helper copies pack rows
into the generated plan's `Start Gates`, `Work Checklist`, and
`Completion Gates`. After creation, the generated plan is the truth; the checker
validates that materialized plan only.

The generated plan is the dedicated plan shell. Fill that exact file
immediately after generation: replace placeholders, resolve every gate row, and
mark non-applicable generated rows as `N/A: <reason>` with evidence. Do not
delete, wholesale replace, or hand-narrow the generated plan into an ad hoc
smaller plan after durable work has started. If the selected template is plainly
wrong and no substantive work has started, regenerate once with the right
template and record why. If work has already started, keep the generated plan
and close it honestly.

The first plan checkpoint is requirement extraction. Codex output can compact
and lose prompt constraints, so before implementation or broad exploration,
copy every explicit user requirement into the plan as checkable rows: scope,
non-goals, timing/duration, stop conditions, deliverables, final handoff
sections, verification surface, and success criteria. Do not continue into
implementation until this is complete or explicitly marked N/A with reason.

Use packs like this:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template task \
  --with docs \
  --with agent-native \
  --title "<short task title>"
```

Examples:

- docs-only work: `--template docs`
- normal code task that also changes docs: `--template task --with docs`
- agent workflow task: `--template task --with agent-native`
- browser behavior task: `--template task --with browser`
- public app/API or package-boundary task: `--template task --with package-api`
- major architecture task: `--template major-task`
- major architecture task that also changes docs and package API:
  `--template major-task --with docs --with package-api`

If two packs add related gates, keep both when they protect different failure
modes. If they duplicate exactly the same proof, keep the more specific pack and
record the other as N/A in the plan.

## Proportionality Dial

Classify goal-backed work before creating or updating a plan:

- `micro`: one narrow, auditable outcome; no cross-file state; no meaningful
  continuation loop. Use a tiny plan only when a repo rule requires it, or
  record the audit surface directly in the final response.
- `normal`: multi-step work with concrete evidence and likely continuation.
  Use the appropriate `docs/plans` template and close all relevant gates.
- `major`: architecture, migrations, benchmarks, framework comparisons,
  broad refactors, pass-gated lanes, or public API/runtime risk. Use a derived
  skill or project template with phases, risk rows, review gates, and explicit
  closure criteria.

Do not inflate a micro work item into a ceremony pile. Do not shrink a major
work item into a checklist that cannot catch real risk.

## Goal Flow Modes

Every goal-backed workflow chooses exactly one flow mode before durable work
starts. The mode controls the human review boundary; it does not weaken the
evidence or completion rules.

### 1. One-Shot Execution

Use this for issue-like or work-item-like work where the agent is expected to
read the source, derive the local plan, implement, verify, and hand off the
result without stopping for plan approval.

Rules:

- Create or continue a goal when the work is non-trivial and auditable.
- Create a plan when durable state is useful or required by the caller.
- The plan is an execution ledger, not a proposal waiting for acceptance.
- Human review happens at the final handoff or explicit user interruption.
- Do not pause merely because the plan has not been reviewed. Pause only for a
  real blocker, unsafe ambiguity, or a user decision that changes scope.

### 2. Agent-Led Plan Hardening

Use this when the requested output is a plan and the user wants the agent to
drive toward the best plan with minimal human interruption.

Rules:

- The agent owns the review loop: research, compare options, pressure-test,
  revise, and improve the plan until the confidence threshold is met.
- Ask the user only for decisions that materially change intent, boundaries,
  risk tolerance, or acceptance criteria.
- Record each self-review pass and plan delta as evidence.
- Stop for one major user review when the plan reaches the stated readiness
  threshold.
- Do not execute implementation under the planning goal unless the caller's
  governing workflow explicitly says planning and execution are the same goal.

### 3. Collaborative Planning

Use this when the user and agent are intentionally shaping the plan together
before execution.

Rules:

- The goal outcome is an accepted plan, not implementation.
- Ask focused questions when user judgment changes the plan.
- Keep options, tradeoffs, rejected alternatives, and open decisions visible in
  the plan.
- Continue revising until the user accepts the plan or a blocker remains.
- Execution starts only after explicit acceptance or a new instruction that
  changes the flow mode.

Flow-mode selection belongs in the derived skill or the instantiated plan when
the caller knows it. If no caller specifies a mode, default to one-shot
execution for implementation tasks, agent-led plan hardening for autonomous
planning/review requests, and collaborative planning when the user is actively
brainstorming or asking for plan acceptance before work.

## Use When

- The user asks to set a goal or asks Codex to keep working until a verifiable
  end state.
- A repo skill says to use `create_goal` or goal setup.
- Work is long-running, iterative, and has an auditable success condition.
- The path is uncertain but the finish line is auditable.
- The user would otherwise keep saying: "continue", "try the next fix", "rerun
  the benchmark", "keep going until it works".
- A pass-gated lane needs one durable objective with the pass schedule and
  closure gates inside it.
- The user says `autogoal repair <expectation>` after any goal-backed workflow
  missed their expectation, and they want the owning rule/template repaired for
  future runs.

## Do Not Use When

- The user asks a one-off question or wants one short answer.
- The edit is tiny and no continuation loop is useful.
- The finish line is vague: "make it better", "improve performance", "clean
  this up" without a verification surface.
- The user explicitly declined goal setup or asked not to use goal tools.
- The only possible next move requires user input.
- Creating a goal would hide uncertainty instead of naming it.
- The user only wants the current artifact fixed once. Repair mode is for
  recurring workflow expectation misses, not every ordinary bug in a plan file.

## Tool Contract

This is agent-native. Use the goal tools directly when available:

- `get_goal` to inspect the current thread goal.
- `create_goal` to start a new active goal.
- `update_goal(status: complete)` only when the objective is genuinely met.
- `update_goal(status: blocked)` only when no autonomous progress remains and
  the same blocker has recurred enough to satisfy the tool contract.

There can be only one active goal per thread. Repeated `create_goal` calls fail
while a goal exists. Always call `get_goal` first; call `create_goal` only when
it returns no goal; use `update_goal` to complete or block the active goal.

## Active Goal Conflict Protocol

When `get_goal` returns a goal, classify it before touching durable state:

- `same`: the existing goal already describes the current requested end state.
  Continue under it and keep its plan current.
- `same but stale plan`: the goal is right but the plan is stale. Repair the
  plan first, then continue.
- `newer user correction`: the latest user message narrows, reverses, or
  corrects the goal. Record the correction in the plan, follow the newest
  instruction, and do not call the old objective complete unless it is actually
  true.
- `different objective`: the active goal is unrelated. Do not hijack it. If no
  lifecycle tool can pause, resume, cancel, or replace it, say so briefly and
  proceed only with degraded plan state when the user explicitly says to go.
- `paused or externally controlled`: do not fake completion or blocked status
  to escape the tool. Continue only if the latest user instruction clearly
  authorizes the new work, and record the mismatch in the plan.

Never mark a goal complete because the user changed their mind. Completion
means the objective is true. A correction changes the work path; it does not
retroactively prove the old objective.

Do not invent a goal state file when a goal tool is available. If goal tools are
not available, record degraded control state in the active plan only when the
repo workflow requires that fallback; otherwise state that goal tools are not
available and continue with the nearest safe workflow.

## Goal Anatomy

A strong goal defines eight things:

1. Flow mode: one-shot execution, agent-led plan hardening, or collaborative
   planning.
2. Outcome: what must be true when done.
3. Completion threshold: the number, pass/fail command, artifact checklist, or
   explicit acceptance rows that prove done.
4. Verification surface: tests, benchmarks, logs, browser proof, generated
   artifact, report, issue comment, or source-backed audit.
5. Constraints: what must not regress.
6. Boundaries: files, packages, repos, tools, data, routes, issue scope, or
   product surfaces Codex may or may not touch.
7. Iteration policy: how to choose the next move after each attempt.
8. Blocked stop condition: when to stop and report the blocker, evidence, and
   next input needed.

If the user requested a timed checkpoint, the plan must also define the
duration, whether it is minimum active work or an explicit hard stop, the
initial confidence scorecard when no better metric exists, and how the current
loop will finish cleanly after the checkpoint is reached.

The `create_goal.objective` field is only a short handle for the active goal.
Keep it under 240 characters. Put the full contract in the goal plan, not in
the tool objective.

Use this tool-objective shape:

```txt
<desired end state>; done when <short threshold>; plan <docs/plans/path>.
```

Do not put commands, full pass schedules, long issue lists, constraints,
boundaries, iteration policy, or blocked reports in `create_goal.objective`.
Those belong in the plan sections.

## Measurable Outcome Gate

Before calling `create_goal`, rewrite vague objectives into measurable ones,
then compress the tool objective to a short handle. The plan records the full
contract.

Required:

- a specific done state
- a flow mode
- a verification surface
- a completion threshold
- a constraint list or explicit `no extra constraints`
- a blocked condition

Quantitative examples:

- `p95 < 120 ms`
- `score >= 0.92 and no dimension below 0.85`
- `0 accepted review findings`
- `all 12 pass rows complete or skipped with evidence`
- `focused repro fails before fix and passes 5 consecutive runs after`
- `no stale symbol matches from rg`

Auditable non-numeric examples:

- named file exists with required sections
- named issue rows moved to fixed/improved/related/not-claimed
- named browser route has screenshot proof and no console errors
- named API examples compile and match the accepted public shape

Reject or rewrite:

- "make better"
- "clean up"
- "finish"
- "absolute best" without score rows, pass gates, or evidence
- "review and decide" without an artifact and acceptance criteria

## Timed Checkpoints

When the user gives a duration such as `30m`, `1h`, `2 hours`, or `10h`,
treat it as a minimum active-work checkpoint unless they explicitly say
`max`, `stop at`, `budget cap`, or `timebox hard stop`.

Timed checkpoints are not permission to stop early because the first obvious
gates passed. They mean: keep increasing confidence until the duration is
reached, then finish the current loop cleanly.

If the goal already has concrete metrics, use those metrics during the timed
loop and keep looking for the next highest-value confidence gap until the
duration elapses.

If there is no concrete metric, create an initial scorecard in the plan before
substantive work. Use a simple 0-100 confidence score with dimensions that fit
the task, for example correctness, proof strength, simplicity,
maintainability, docs/source alignment, risk, and slop removal. Record:

- initial score and dimension scores;
- what would raise the score;
- what would lower or cap confidence;
- next improvement packet;
- final score at handoff.

After the main implementation gates close, continue with confidence-building
work until the timed checkpoint is reached:

- review the diff/output against the newest prompt;
- remove slop, dead code, fake aliases, stale docs, and weak abstractions;
- refactor toward the durable owner when it reduces real complexity;
- add or repair missing tests, proof, diagnostics, and source audits;
- run focused verification again after meaningful changes;
- repair the owning skill/template when the workflow itself missed the user's
  expectation.

Do not start a large risky packet near the end unless there is enough time to
finish, verify, and keep/revert/quarantine it. When the requested duration is
reached, finish the active loop to a clean boundary: complete the current
packet, verify it, revert or quarantine unsafe partial work, update the plan,
and hand off. Never leave dirty half-work merely because the clock expired.

Stop before the timed checkpoint only for a real blocker, an explicit user
interruption, or an unsafe ambiguity that would make further autonomous work
harmful. Passing the first checks is not a stop condition.

## Completion Gate Policy

Do not make `check-complete.mjs` the whole goal. That only proves the plan looks
closed, not that the work is true.

Use the hybrid rule for every goal:

1. The goal tool objective names the outcome, short threshold, and plan path.
2. The `docs/plans` goal plan records the verification surface, constraints,
   boundaries, blocked condition, fresh evidence, and completion threshold.
3. `node .agents/skills/autogoal/scripts/check-complete.mjs <docs/plans/path>` is
   the final mechanical gate before `update_goal(status: complete)`.

The checker validates that the goal plan has no unchecked required checklist
items, no unresolved gate rows, no open phase/pass rows, concrete verification
evidence, current reboot status, and recorded risks. It does not replace tests,
browser proof, source audits, benchmark output, or other named verification
evidence.

## Evidence Type Contract

Every completion proof should fit at least one evidence type:

- `command`: exact command, cwd, and pass/fail result.
- `source-audit`: exact files or search query proving a static property.
- `browser`: route, interaction, screenshot or console/network caveat.
- `artifact`: generated file, report, table, PR body, issue comment, or
  exported asset.
- `review`: reviewer/tool used, accepted findings, fixes, and remaining
  rejected findings with reasons.
- `external-source`: cited URL, issue, paper, docs page, or connected app
  result used as authority.
- `N/A:<reason>`: why a recurring gate does not apply.

Evidence must name the owning workspace, package, app, route, or tool when
that ownership matters. A root-level check cannot prove a sibling repo, app
route, browser surface, or external tracker unless the plan explains why it is
the owning surface.

## Repair Mode

Trigger this mode when the arguments start with:

```txt
repair <expectation>
```

Repair mode is self-improvement with a leash. It converts a concrete expectation
miss from a goal-backed run into the smallest durable change to the owning
rule, template, helper, or active plan.

Use it for misses like:

- the generated goal plan lacked a gate the user expected
- a derived skill used the wrong template or completion rule
- the skill completed too early or kept running past the intended boundary
- the final handoff omitted evidence the user expects every time
- the workflow forced too much ceremony or skipped a required review/proof step

Do not use it for:

- one-off wording preferences in a single plan
- a product/runtime bug that belongs in implementation code
- broad "make all skills better" edits
- rewriting generated `skills/*/SKILL.md` by hand

Target selection order:

1. If the prompt names a plan path, read that plan first. Use its `Template:`,
   skill name, phase table, and completion gates to identify the owner.
2. If the prompt names a skill, read `skills/<skill>/SKILL.md` first, then
   project-owned `docs/plans/templates/<skill>.md` when it exists.
3. If there is an active goal, read its plan path from the objective or current
   plan before editing anything.
4. If the miss belongs to every goal, target the dotai source package:
   `skills/autogoal/SKILL.md` and
   `skills/autogoal/assets/templates/goal.md`. Do not patch the
   installed `.agents/skills/autogoal` copy by hand.
5. If ownership is still unclear after source reads, ask one short targeting
   question instead of patching multiple templates.

Repair scope matrix:

| Miss | Primary repair owner |
|------|----------------------|
| Current plan has wrong status, row, evidence, or handoff fields | active `docs/plans/*` plan |
| Future generated plans need a recurring section, gate, row, or placeholder | project-owned `docs/plans/templates/<owner>.md` or dotai source `skills/autogoal/assets/templates/<owner>.md` |
| Agent chose the wrong workflow, target, proof standard, or completion rule | `skills/<owner>/SKILL.md` |
| Prose keeps failing and the miss is mechanically checkable | dotai source `skills/autogoal/scripts/*` plus focused script proof |
| Derived skill adds lane-specific ceremony or policy | derived skill rule/template, not `autogoal` |
| Universal lifecycle rule is missing across goal-backed work | dotai source `skills/autogoal/SKILL.md` |

Repair workflow:

1. Restate the expectation in one sentence.
2. Identify the miss with source evidence: plan row, final response shape,
   missing gate, bad status, wrong template, or stale generated skill.
3. Pick exactly one primary owner. Patch secondary owners only when sync is
   required, such as source rule plus project template.
4. Create a repair plan with:

   ```bash
   node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
     --template goal-repair \
     --title "<short repair title>"
   ```

   If a repair is truly trivial, record why no separate repair plan is needed.
5. Patch source-of-truth files only. Never hand-edit installed
   `.agents/skills/**/SKILL.md`; after changing dotai `skills/**`, run
   `scripts/validate-skills`.
6. Prove the repair:
   - source audit with `rg` for the new rule/gate/wording
   - generated skill sync when `skills/**` changed
   - instantiate the repaired template or inspect it directly when a smoke plan
     would create noise
   - verify unfinished generated plans still fail `check-complete.mjs`
   - verify a completed plan can record the new expectation without editing the
     template again
7. Final response says: expectation, repaired owner, verification, and any
   deliberate non-repair.

Safety rules:

- One expectation should produce one narrow repair. Do not turn repair mode into
  a skill rewrite.
- Do not weaken completion gates just because a past run was annoying. If the
  expectation conflicts with evidence safety, record the conflict and ask.
- Prefer adding a missing row or decision rule over adding a new script. Add
  mechanical enforcement only when prose gates keep failing.
- A derived skill may have stricter rules than `autogoal`. Repair the derived
  skill when the expectation is lane-specific; repair `autogoal` only when the
  expectation should apply across goal-backed work.
- If an active goal is unrelated to the repair, do not hijack it. Ask whether to
  finish/block it first or run the repair after it is closed.

## Derived Skill Contract

Any skill that requires or wraps `autogoal` should declare:

- when it creates or continues a goal
- which flow mode it uses by default, and how the user changes it
- which project template `docs/plans/templates/<template>.md` it uses
- which packs it applies by default, and which touched surfaces add more packs
- extra start gates and completion gates it owns
- evidence types it requires
- final handoff shape
- review or pressure lenses it adds
- what remains delegated to `autogoal`
- what it intentionally does not inherit from broader templates

Derived skills should route to `autogoal` for lifecycle mechanics instead of
re-implementing plan creation, completion, blocked semantics, repair mode, or
evidence closure.

## Resume Protocol

After compaction, interruption, or a long pause:

1. Read the latest user message first.
2. Call `get_goal` when available.
3. Re-read the active `docs/plans` path named by the goal, current workflow, or
   latest handoff.
4. Find the latest verification evidence, open risk, and next owner.
5. Continue from the newest user instruction, not from an older stale objective.
6. Before final response, sanity-check that the answer matches the newest
   request and the current plan state.

If the active goal and newest request disagree, use the Active Goal Conflict
Protocol before editing.

## Start And Completion Gates

Project templates may define `Start Gates:` and `Completion Gates:` tables.
These are template-owned audit surfaces for recurring project checks.

Keep this rule generic. Do not put project-specific commands, package-manager
details, release rules, browser tooling, or repo policy in this file. Those rows
belong in project-owned templates under `docs/plans/templates/`.

When present, gate tables must use markdown tables with these columns:

- `Gate`
- `Applies`
- `Evidence`

They may include extra columns such as `Required action`. The checker treats any
cell in a gate row as unresolved when it is blank, `pending`, `TODO`, or `TBD`.

Gate closure rules:

- `Applies` must be resolved before completion.
- `yes` means the evidence cell names the command, artifact, proof, source
  audit, or concrete result.
- `no` or `N/A: <reason>` means the evidence cell explains why the gate does
  not apply.
- A completion gate row should stay unresolved until the action or reason is
  recorded.
- `check-complete.mjs` enforces gate-row closure mechanically, but it does not
  know what project-specific commands mean.

## Start Workflow

1. Read the user's request and any named plan, issue, logs, route, test, or
   source-of-truth file.
2. Inspect the current goal with `get_goal` when available.
3. Select the flow mode: one-shot execution, agent-led plan hardening, or
   collaborative planning.
4. Rewrite the desired objective until it has a measurable or auditable
   completion threshold.
5. Choose the title, template, and `docs/plans` path needed by the objective.
   If the helper is the only reliable way to know the path, create only the
   static plan shell before `create_goal`.
6. If `docs/plans/templates/` does not exist, initialize the generic templates
   before creating or selecting a plan:

   ```bash
   node .agents/skills/autogoal/scripts/init-templates.mjs
   ```

   Existing project templates must be kept. Do not continue with only built-in
   fallback templates when the project template directory is missing.
7. If no active goal exists and the user or governing skill asked for a goal,
   create one with a short `create_goal.objective` handle under 240 characters.
8. If an active goal already matches the desired end state, continue under it.
9. If an active goal exists but points at a different objective, do not overwrite
   it. Resolve the current goal honestly before starting another one. If the
   tool does not allow that transition, report the mismatch and ask for the
   smallest decision needed. A governing lane goal may proceed only when it can
   honestly complete or fit within the current active goal.
10. Ensure the `docs/plans` goal plan exists before substantive work.
11. Fill the generated plan itself before substantive work: write the objective,
   threshold, verification surface, constraints, boundaries, blocked condition,
   flow mode, and goal plan path; resolve generated gates as yes/no/N/A instead
   of deleting or replacing the template output.
12. Record the output-budget strategy before exploratory commands: which
    searches or reads are allowed, which high-volume paths are excluded, and
    how large results will be capped, counted, or saved as artifacts instead of
    streamed into the goal context.
13. Record timed-checkpoint semantics when the prompt includes a duration. If
    the duration is not explicitly a hard stop, treat it as minimum active work
    and add the initial scorecard when no concrete metric exists.
14. Use that exact path for
   `check-complete.mjs`.
15. Do not start durable work until the goal is set, verified as already matching,
   or the user explicitly resolves the missing-goal path.

Set or verify the goal before mutable lane state when the workflow depends on a
goal. The only exception is creating the static plan shell needed to get the
path for the short objective. For pass-gated planning or accepted-plan execution
lanes, the goal is the first durable action after the minimum read and optional
static plan shell needed to derive the objective.

## Template Init

Generic autogoal templates are project files. They live at:

```txt
docs/plans/templates/goal.md
docs/plans/templates/task.md
docs/plans/templates/docs.md
docs/plans/templates/major-task.md
docs/plans/templates/goal-repair.md
docs/plans/templates/packs/<pack>.md
```

When `docs/plans/templates/` is absent, or when `docs/plans/templates/goal.md`
or another generic template is missing, initialize the generic set before
creating a goal plan:

```bash
node .agents/skills/autogoal/scripts/init-templates.mjs
```

`create-goal-scratchpad.mjs` and `create-goal-template.mjs` run this
initialization automatically. If an agent is creating or selecting a plan
without those helpers and the directory is absent, run `init-templates.mjs`
first. Existing files are kept. Project-specific templates such as
`docs/plans/templates/<lane>.md` stay in the project and are never moved into
the skill package.

## Goal Plan

Every active goal gets one durable goal plan. It is a single markdown file that
absorbs the useful file-planning parts: phases, findings, progress,
decisions, failed attempts, verification, and reboot status.

Path:

```txt
docs/plans/YYYY-MM-DD-<short-goal-slug>.md
docs/plans/<ticket>-<short-goal-slug>.md
```

Use the ticket-prefixed form for issue-backed work. Do not create
`task_plan.md`, `findings.md`, `progress.md`, `.planning/**`,
`docs/goals/**`, `.tmp/goals/**`, or hook state for goal work. Hooks are
overkill. The active goal plus the `docs/plans` file are the durable state.

Create the goal plan with the source-owned helper whenever available:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --title "<short title>" \
  --template "<primary template name or path>" \
  --with "<optional pack name>"
```

The helper writes `docs/plans/YYYY-MM-DD-<slug>.md` or
`docs/plans/<ticket>-<slug>.md` from a project-owned template or built-in
autogoal template. The helper lives
under `.agents/skills/autogoal/` because it is generic rule tooling; generated
`SKILL.md` files are not edited by hand.

Do not pass objective, threshold, verification, constraints, boundaries, or
blocked condition through CLI flags. The CLI only creates the static plan shell.
After creation, edit the generated `docs/plans` file and write the active goal
objective, completion threshold, verification surface, constraints, boundaries,
blocked condition, and remaining goal-specific rows into the file.

Editing the generated file means filling and resolving that materialized shell,
not replacing it with a hand-made mini-plan. Keep generated sections and rows
unless the row is truly irrelevant, then mark it complete with `N/A: <reason>`.
If a template choice is wrong before work starts, regenerate with the correct
template and record the replacement. If any durable work has already started,
do not swap the plan out from under the work; close the generated plan with
honest evidence, N/A rows, or a blocker.

The default project template is generic:

```txt
docs/plans/templates/goal.md
```

Project or skill-specific templates live beside it:

```txt
docs/plans/templates/<template>.md
```

Reusable packs live under:

```txt
docs/plans/templates/packs/<pack>.md
```

Use templates by passing the primary template name. Add packs for touched
surfaces:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template "<template-name>" \
  --with "<pack-name>" \
  --title "<short title>" \
  ...
```

Repeat `--with` for multiple packs, or pass a comma-separated list. The helper
records `Primary template:` and `Applied packs:` in the generated plan and
copies pack rows into the plan's existing gate/checklist sections.

`docs/plans/templates` holds reusable project templates. Generic templates are
seeded there by `init-templates.mjs`; non-generic templates stay there as
project-owned workflow policy. Direct files under `docs/plans` are instantiated
runtime goal plans. Do not store goal templates or active goal state under
`docs/goals`.

Create a new project-owned template by copying the generic template:

```bash
node .agents/skills/autogoal/scripts/create-goal-template.mjs \
  --skill "<skill-name>"
```

Then edit the new `docs/plans/templates/<skill-name>.md` to add that skill or
project lane's mandatory sections, checklist rows, phase schedule, evidence
rows, and closure gates. Keep the generic goal template project-agnostic.

Template creation is not skill creation. Do not generate skill folders, aliases,
execution handoffs, hook state, or compatibility bridges from this workflow. A
project template is just a reusable static shell
for a future `docs/plans/*` goal plan. The agent fills the real objective,
threshold, verification surface, constraints, boundaries, and blocked condition
inside the instantiated plan.

Before creating or updating a project template, define these inputs:

- template name and owning skill or project lane
- primary-template role and which packs should usually compose with it
- display name and purpose
- recurring failure mode the template prevents
- use cases and non-use cases
- allowed edit boundaries for plans created from it
- required read-first sources and optional read-when-relevant sources
- evidence sources and final verification surface
- measurable score, count, pass/fail command, or artifact checklist threshold
- required plan sections
- required checklist rows, including skill analysis and final goal-plan check
- phase or pass table, or an explicit reason the template needs no phases
- completion gates and score caps when score is used
- review or pressure lenses that must run before closeout
- handoff, final response, and risk rows
- blocked condition and what input would unblock it

If an input cannot be inferred from current project context, add a placeholder
inside the template and label it as a generation gap. Ask the user only when
the missing answer changes the template's purpose, safety model, or boundaries.

Template quality bar:

- The template must be self-contained enough to create a useful goal plan from
  scratch. Do not require a sibling template to understand it.
- Sibling templates may be used for sync review, not as hidden dependencies.
- Packs may provide recurring touched-surface rows, but only after the helper
  materializes them into the generated plan. Do not rely on hidden pack state.
- Domain facts must be placeholders or instructions unless live source proves
  them. Do not invent current-state, before/after, API, product, or workflow
  facts.
- No template may let a goal finish from polished prose, score alone, or a
  completed phase table without fresh evidence.
- Every primary template must include an `Autoreview` completion gate before
  the final `Goal plan complete` check.
- Every required checklist item must map to evidence, an explicit N/A reason,
  or a blocker.
- Every required section is either present in the template or omitted with a
  recorded reason.
- Project templates that cover implementation work should include compact gates
  for review target selection, workspace-authority verification, specialized
  agent/tooling review when those surfaces change, and a high-risk note for
  public API, runtime, package-boundary, browser, agent-action, or command
  contract changes. Do not copy a major planning lane's scorecard, issue
  ledger, or full pass schedule into generic execution templates.
- The template should prefer concrete commands, file paths, issue rows,
  browser routes, screenshots, benchmark names, or source-audit rows over vague
  "review" wording.
- The generated plan remains the runtime truth. Do not put active goal state in
  `docs/plans/templates`.

Template sync review:

- Instantiate the template once with `create-goal-scratchpad.mjs` or inspect the
  copied file directly when a smoke plan would create noise.
- Verify the expected headings, checklist rows, phase/pass rows, completion
  gates, and blocker rows are present.
- Verify a blank or unfinished instantiated plan fails `check-complete.mjs`.
- Verify a completed plan can record the named evidence without editing the
  template itself.
- After editing dotai `skills/autogoal/SKILL.md`, run `scripts/validate-skills`.

Create the plan before substantive edits. Update it after every meaningful
decision, finding, tradeoff, failed attempt, review fix, verification run, or
scope change. Re-read it before major decisions and after compaction or
interruption.

Check the goal plan before completion:

```bash
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<goal-plan>.md
```

This is the final mechanical gate, not a substitute for the named verification
surface.

The goal-plan checklist is mandatory. Its first required item is skill analysis.
Do not call
`update_goal(status: complete)` while any required checklist item remains
unchecked. If an item does not apply, check it and add `N/A: <reason>`.

Required goal-plan sections:

```md
# <Goal title>

Objective:
<short create_goal objective, under 240 characters>

Flow mode:
<one-shot execution | agent-led plan hardening | collaborative planning>

Goal plan:
<docs/plans/path>

Primary template:
<docs/plans/templates/name.md>

Applied packs:
- <pack or none>

Completion threshold:
- <quantitative or auditable done row>

Verification surface:
- <tests/artifacts/browser proof/source audit>

Constraints:
- <must preserve / must not touch>

Boundaries:
- <allowed files/packages/tools>

Output budget strategy:
- <how command/search output will be scoped, capped, counted, or artifacted>

Blocked condition:
- <condition that stops autonomous work>

Start Gates:
| Gate | Applies | Evidence |

Work Checklist:
- [ ] Actual work item or pass-specific requirement with evidence.
- [ ] ...

Completion Gates:
| Gate | Applies | Required action | Evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |

Findings:
- <research, source reads, browser/visual findings as data>

Timeline:
- <timestamp> <action/evidence>

Decisions and tradeoffs:
- <decision> -> <reason> -> <risk>

Review fixes:
- <finding> -> <accepted/rejected> -> <change or reason>

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |

Verification evidence:
- <command/artifact> -> <result>

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |

Open risks:
- <risk or none>
```

Before `update_goal(status: complete)`, the goal plan must include the final
verification evidence, checked checklist, current reboot status, and any
remaining risks.

## Good Goal Handles

Performance:

```txt
Reduce checkout p95; done when p95 < 120 ms and checks pass; plan docs/plans/YYYY-MM-DD-checkout-latency.md.
```

Bug hunt:

```txt
Fix flaky checkout test; done when repro passes 5 consecutive runs; plan docs/plans/YYYY-MM-DD-checkout-flake.md.
```

Research:

```txt
Reproduce target paper evidence; done when every headline claim has a status row; plan docs/plans/YYYY-MM-DD-paper-repro.md.
```

Pass-gated planning:

```txt
Close layout plan; done when score >= 0.92 and closure gates pass; plan docs/plans/YYYY-MM-DD-layout-plan.md.
```

## Weak Goal Examples

```txt
Improve performance
Make this better
Refactor the editor
Run all passes
Finish the project
```

These are weak because they lack a measurable outcome, verification surface, or
scope boundary.

## Pass-Gated Goals

For pass-gated lanes, prefer one lane goal when the goal tool can persist across
turns. Put the pass schedule in the plan, keep the goal objective short, run
one pass per activation, and complete the goal only when closure gates prove no
pass remains runnable.

Use this when a workflow has scheduled passes such as current-state read,
issue discovery, intent boundary, research refresh, steelman, revision,
verification sweep, or closure.

Rules:

- The goal objective should describe only the lane outcome, short completion
  threshold, and plan path.
- The plan should describe the full pass schedule, one-pass-per-activation
  policy, proof gates, and closure condition.
- Complete the current pass in the plan or progress ledger, not by closing the
  goal.
- Complete the goal only when every required pass is complete or intentionally
  skipped with evidence.
- Do not use separate per-pass goals; keep scheduled passes as rows in the
  active plan.
- Keep pass status in the plan or progress ledger; keep goal status tied to the
  whole lane.

Progress fields for pass-gated lanes:

```md
current_pass: current-state-read
current_pass_status: in_progress
next_pass: related-issue-discovery
goal_status: active
```

Allowed `goal_status` values:

- `active`
- `complete`
- `blocked`

## Completion Rules

Mark a goal complete only when:

- the outcome in the goal is actually achieved
- the completion threshold is met exactly
- the verification surface named by the goal was checked
- the `docs/plans` goal plan is updated with final verification
- every required goal-plan checklist item is checked or marked N/A with reason
- `node .agents/skills/autogoal/scripts/check-complete.mjs <docs/plans/path>` passes
  after the final evidence is recorded
- constraints and boundaries were respected, or deviations were explicitly
  accepted
- required artifacts were created or updated
- no required owner remains runnable
- the final response reports the evidence, not just confidence

Do not mark complete because:

- tests passed but the goal also required review, browser proof, docs, or a
  report
- the budget is nearly exhausted
- the current slice is done but later slices remain
- a plan was written but execution or proof remains
- the user says "nice" without accepting open risks

When calling `update_goal(status: complete)`, include the tool's final token/time
usage in the user-facing closeout when the tool returns it.

## Blocked Rules

Blocked is terminal for the goal, not a normal checkpoint.

Use blocked only when:

- no autonomous next move remains
- missing evidence, access, tooling, data, or a user decision prevents progress
- repeated attempts show the same blocker, and the tool's blocked threshold is
  satisfied

Do not mark blocked when:

- more investigation is possible
- a different test, smaller repro, or narrower source read is available
- the work is merely hard, slow, or broad
- a review pass found issues that can be fixed
- a gate failed and the failing owner is obvious

Blocked report shape:

```md
Goal blocked.
Attempted:

- ...
  Evidence:
- ...
  Blocker:
- ...
  Needed to continue:
- ...
```

## Budget Handling

Budget exhaustion is not success.

## Output Budget Discipline

Goal token budgets are real work budgets, not decorative counters. A goal run
that burns its budget on tool output has failed the workflow even when no app
code was touched.

Oversized goal objectives are budget failures too. If the tool objective starts
to read like a plan, stop and move that detail into `docs/plans`.

Before running exploratory commands inside an active goal:

- Prefer narrow reads over broad scans: exact files, focused `rg -n` patterns,
  targeted globs, and short `sed -n` ranges.
- Treat `tmp/**`, logs, binaries, generated output, build artifacts,
  `node_modules`, `.next`, `.turbo`, and coverage folders as excluded by
  default. Include them only when they are the named source of truth.
- Set explicit tool output caps for commands likely to return more than a
  screenful. Keep ordinary source reads around a few thousand tokens, and
  justify any larger cap in the plan.
- For broad audits, first ask for counts, filenames, or top matches
  (`rg --count`, `rg --files-with-matches`, `--max-count`, `wc`, `head`) before
  printing matching lines.
- If a result may be large but still matters, write it to a local artifact and
  inspect slices from that artifact. Do not stream the full result into the
  conversation.
- Never run unbounded `rg` across the whole repo plus large generated trees, logs, or binary
  outputs during a budgeted goal. Split the search by owner or exclude the noisy
  trees first.
- After any accidental large output, stop broad exploration immediately, record
  the miss in the error-attempts row, and continue only with constrained
  commands.

If the system stops or warns because a goal budget is reached:

- stop substantive work
- summarize current evidence and remaining owners
- name the next useful action
- do not call the goal complete unless the original objective is already proven

## Lifecycle Boundaries

Do not use `update_goal` for lifecycle transitions outside its contract.

The model may complete or block a goal only through `update_goal` when the tool
contract is satisfied. Other lifecycle transitions are user/system-owned. If
the user asks for a lifecycle transition and no direct tool is available, state
that the current runtime does not expose that control instead of faking it with
completion or blocked status.

## Status Updates During Goals

Keep status short and evidence-based:

- current checkpoint
- what changed
- what was verified
- what remains
- whether blocked
- next concrete action

Avoid vague updates like "making progress" or "continuing investigation". If
status gets vague, tighten the goal or checkpoint.

## Research Goals

Research goals need stricter epistemic accounting.

Final reports should separate:

- confirmed findings
- approximate reconstructions
- proxy/support-only evidence
- blocked exact claims
- remaining uncertainty

Do not flatten "approximate support" into "reproduced" or "fixed". A good
research goal lets Codex keep working through uncertainty while preventing
overclaiming.

## Closeout Template

Use this shape when closing a goal:

```md
Goal complete.
Evidence:

- <command/artifact/source>
  What changed:
- <short list>
  Constraints preserved:
- <short list>
  Residual risk:
- <only if real>
  Usage:
- <tool-reported tokens/time, when available>
```

For blocked:

```md
Goal blocked.
Evidence:

- <what was tried>
  Blocker:
- <why no autonomous progress remains>
  Needed next:
- <specific user/tool/input>
```
