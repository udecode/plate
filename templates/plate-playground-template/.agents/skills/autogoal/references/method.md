# Goal lifecycle and evidence

Read the entrypoint first. Native tools require a goal requested directly or through an explicit standing user instruction covering this work. Apply that request without another confirmation. Current tool contracts govern status and budget. These procedures describe an already-authorized goal or its file plan.

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

## Active Goal Conflict Protocol

When `get_goal` returns a goal, classify it before touching durable state:

- `same`: the existing goal already describes the current requested end state.
  Check the plan's pause state before continuing under it.
- `same but stale plan`: the goal is right but the plan is stale. Repair the
  plan first, then continue.
- `newer user correction`: the latest user message narrows, reverses, or
  corrects the goal. Record the correction in the plan, follow the newest
  instruction, and do not call the old objective complete unless it is actually
  true.
- `different objective`: the active goal is unrelated. Do not hijack it. If no
  lifecycle tool can pause, resume, cancel, or replace it, say so briefly and
  continue the already-authorized task with an ordinary file plan, clearly distinguishing it from the unrelated native goal.
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

## Pause handling

A direct request to pause, stop, or hold work takes effect before another work
step or requested repair detour. Persist it in the existing plan immediately:

- Set `Status: Paused` and record the date and user instruction.
- Preserve the objective, remaining checklist, evidence, and unfinished cleanup.
- Save the current next step under `Saved next action after explicit resume`;
  make `Next action` wait for a direct user instruction to resume.
- Read back the changed plan. An acknowledgment or private note is insufficient.

If a supported native pause control exists, use it under its current contract
and read back the result. Otherwise record the unavailable native control in
the same plan and explain it once. A paused file plan does not prove a paused
native goal. Do not repurpose `update_goal` completion or blocked states,
manipulate internal goal storage, or bypass a rejected control route.

End the turn promptly after the pause and any separately requested detour.
Never use sleeps, polling, repeated pause reminders, or another goal to wait
for resumption. Automatic goal continuations and compaction are not direct
user instructions to resume. Read the paused plan before considering work and
leave it paused when no direct resume exists. A request to repair a skill or
task history authorizes that repair only; finishing it does not resume the
original objective.

On explicit resumption, update the existing plan to active, retain the pause
record, and revalidate the saved next step before proceeding. Resume supported
native control separately if needed; never conflate its state with the file.

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
observable progress checkpoint, and how the current
loop will finish cleanly after the checkpoint is reached.

The `create_goal.objective` field is only a short handle for the active goal.
Keep it concise; the current tool schema owns any actual size limit. Put the full contract in the goal plan, not in
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
3. Pick one primary behavior owner. Patch its shared source, project adapter and
   loaded callers only where needed to prevent a conflicting instruction.
4. Use the existing affected plan for the expectation, repair and verification.
   Do not create a second plan or copy its acceptance ledger. Only when no
   suitable plan exists and the repair needs durable tracking, create one with:

   ```bash
   node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
     --template goal-repair \
     --title "<short repair title>"
   ```

   A bounded repair may close with its source/verification handoff.
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
- If an active goal is unrelated to the repair, do not hijack it. Record the mismatch and follow current user intent without falsely completing or blocking the unrelated goal.

## Checklist retention

For long-running work, assume recall alone will drop strict checklist items. The native goal supplies continuation; the plan preserves obligations; the checker rejects unresolved recorded work. None of these discovers omitted requirements automatically.

Before extended work:

1. Resolve method applicability from the actual request and unanswered decisions. Read selected methods and checklists in full once; do not recursively load every reference or repeat intake for each finding. Extract the user's acceptance, required work, proof, handoff and applicable gates into the existing plan.
2. Keep every applicable obligation in one resolvable checkbox or gate row with its owning source and eventual evidence. Existing detailed ledgers or child plans own their rows; the parent links their coverage and completion rather than copying their state. Group coupled findings into bounded batches while retaining each acceptance ID. Do not collapse distinct requirements into a vague “all checks passed” row.
3. Resolve applicability under current user and project authority. Record a specific N/A reason for excluded source requirements. Do not silently delete, relax or defer an applicable item because the task is long. Do not turn a source's possible tests into mandatory tests against the project's test-value policy.

Update current state in place at a settled batch, changed scope/authority/decision, material failure/blocker, pause or handoff. Batch routine successful reads and checks into that checkpoint; command logs already retain their details. Preserve original evidence and material decisions without appending another full scope or chronology after each tool call. On scope changes, add obligations and identify invalidated evidence. On resume or compaction, read the current checkpoint and referenced open obligations; consult source methods again only when changed, missing or needed to resolve uncertainty.

Before closure, reconcile the original acceptance and selected source checklists against their canonical rows, using the already-read sources and rereading changed or uncertain requirements. Every applicable item needs current evidence, a justified N/A disposition, or an unresolved state that prevents completion. Run the owning semantic validators and `check-complete.mjs` on the root plan, including linked plans. Passing a subset or a structurally valid plan cannot close the full objective. A user-approved narrower outcome changes scope explicitly; elapsed time does not.

If the user opts out of a native goal, retain this durable checklist for long work and explain the unavailable continuation guarantee only when material. Short work checks the same applicable obligations directly before handoff without creating a plan or native goal solely for this protocol.

## Bounded batches and evidence reuse

An acceptance row is an accounting boundary, not a mandatory planning,
implementation, verification or delivery cycle. Group ready work that shares an
implementation owner, dependency or proof surface. Record included IDs, remaining
acceptance, required proof and one concrete exit condition in the existing
checkpoint. Preserve explicit scope and delivery deadlines. An exit condition
names the current safe unit; it cannot be “keep improving until everything works.”

### Eligible owners and traversal

For a multi-owner sweep, choose the highest-priority eligible owner that has not
been visited in this traversal. Eligible means its selected unit can run under
current authority and access. A deferred owner is not eligible merely because
more local investigation, helpers or implementation are possible.

Give each owner one bounded visit. Complete the selected unit or record its
verified constraint, save all remaining acceptance under that owner, and advance
to the next unvisited eligible owner. Newly discovered work joins the current
unit only if needed to finish it safely within its recorded exit condition;
otherwise queue it under the same acceptance row. Do not repeatedly enlarge the
exit condition. Revisit after all eligible owners have been traversed, when new
evidence removes the recorded constraint, or when the user changes priority.

If final acceptance needs unavailable human/provider/browser access, finish only
the already-defined safe unit and park the remaining dependent work for the
assisted iteration. If no bounded safe unit exists, park now. Do not start a new
architecture, fixture, tooling or local-proof expansion to fill the blocked time.
Independent work belonging to another ready owner stays eligible.

At each settled checkpoint report disjoint counts for verified, awaiting human
help, unfinished and unvisited, totaling the original denominator. A verified
row needs its full acceptance evidence. Awaiting human help names the exact
external action plus any queued dependent implementation/proof; that work remains
unverified. Ready agent-owned work stays unfinished. Unvisited is relative to the
current traversal and may retain older implementation/proof. Record the missing
acceptance and next action once in the owning row.

Two consecutive checkpoints without advancing an acceptance or disposition
trigger scheduling reassessment before further work on that owner. Helper,
document, command and capture counts alone do not qualify. Choose a concrete
closing unit or park the owner and advance the traversal; do not add another
review or investigation loop.

### Human help and bounded troubleshooting

An evidenced user-only unlock, security-key interaction, browser popup dismissal,
provider approval or comparable manual prerequisite is deferred immediately.
Record the failed operation/evidence, exact required human action, affected
acceptance and resume check in one consolidated help queue. Tell the user once.
Do not probe equivalent paths or weaken security to avoid the human action.
Retry only after confirmed changed state or when the user starts the assisted
iteration; starting that iteration permits a check, not an assumption of success.

For an unclear tool/access failure, make at most two informed diagnostic attempts
or spend ten minutes investigating it, whichever comes first, unless the user
sets another bound. Each attempt must name its hypothesis and discriminating
observation. Equivalent symptoms share one budget across tools, turns, context
recovery and renamed tasks. A genuinely new condition may justify a new attempt;
record that condition first. Polling a confirmed live operation follows the tool's
wait contract and is not permission to restart it or renew investigation limits.

At the bound, apply a known authorized repair with a concrete finish condition,
request the specific missing human action, or defer the investigation and choose
another eligible owner. A known repair is ordinary implementation, not an excuse
to restart troubleshooting. This bound limits diagnosis, not all engineering
work. Parked agent-owned work stays unfinished; time spent never proves a blocker
or completion. Direct evidence of an external prerequisite requires no two-attempt
minimum.

### Evidence and iteration closure

Keep one canonical record per claim and the relevant implementation/dependency,
environment, authorization, fixture, state and artifact bindings. Reuse proof
while those bindings hold; a new revision alone is not invalidation. Record the
actual invalidator before repeating passed proof. Unknown impact is uncovered.
Do narrow checks during iteration and required wider proof once for the settled
batch. Batching and deferral never replace required live, received-artifact,
provider or deployment proof, or justify another plan, panel or test matrix.

A traversal iteration can be fully accounted for with explicitly deferred rows
while product acceptance remains incomplete. Report those states separately.
Iteration completion does not change the native goal's objective or completion
threshold: a full-delivery goal stays open while required work/proof is missing.
Only a user-authorized disposition-only objective can finish at disposition.
Tool-specific whole-goal completion and repeated-blocker rules still apply; one
parked owner does not make the whole goal blocked while eligible work remains.

## Resume Protocol

After compaction, interruption, or a long pause:

1. Read the latest direct user instruction first; distinguish automatic goal
   continuations from an explicit resume.
2. Call `get_goal` when available.
3. Re-read the active `docs/plans` path named by the goal, current workflow, or
   latest handoff.
4. Check for `Status: Paused` using Pause handling before selecting work. Then
   find the latest verification evidence, open risk, and next owner.
5. Continue from the newest user instruction, not from an older stale objective.
   Select the next eligible owner under the saved traversal; preserve human-help
   deferments and retry budgets across recovery. Do not reopen a parked owner
   merely because it was the most recent work.
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

## Linked Plan Trees

Use linked child plans when one root goal coordinates multiple independent
task-sized plans. This is the right shape for a PRD/full-loop parent plan that
delegates one child plan per Linear issue or implementation packet.

Format the parent section as:

```md
Linked plans:
- [DEV-123 task closeout](docs/plans/DEV-123-auth-invites.md) - owns invite acceptance.
- [DEV-124 task closeout](docs/plans/DEV-124-password-reset.md) - owns reset flow.
```

If there are no child plans, write:

```md
Linked plans:
- None.
```

Rules:

- Link only `docs/plans/*.md` files. Do not link scratch files, generated
  artifacts, issue URLs, PR URLs, or external docs as child plans.
- Each child plan must be a normal autogoal-compatible plan with concrete
  objective, threshold, verification, checklist, evidence, risks, and next action. Add gates or phases only when the owning lane requires them.
- The parent plan tracks orchestration and rollup decisions; the child plan
  owns task-level proof. Do not duplicate child gates in the parent.
- Run `check-complete.mjs` on the root parent plan before completing the goal.
  The checker follows `Linked plans`, `Linked goal plans`, or `Child plans`
  sections recursively and fails on missing, incomplete, out-of-tree, or cyclic
  child plans.
- Use child plans for independent task packets, not for pass-gated phases that
  should stay rows in one plan.

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
- required acceptance rows and final goal-plan check
- phase or pass table when the work needs one
- completion gates and score caps when score is used
- review or pressure lenses required by the actual project lane
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
- No primary template may require `Autoreview`. A complete end-to-end feature
  may end with an optional recommendation after normal proof, but declining it
  never blocks `Goal plan complete`.
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
- Architecture and API templates must decide scale applicability before target
  acceptance. When repeated or hot runtime work can change, materialize the
  performance pack, require an executable baseline-versus-target probe before
  accepting the design, and require the same production-path rerun plus a
  correctness guard after implementation. Only source-backed type-only or
  zero-runtime work may record N/A.
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

Create or reuse the plan before extended work. Maintain it at the material
checkpoints defined in Checklist retention; keep routine command details in
their existing evidence log. Re-read the current state before major decisions
and after compaction or interruption.

Check the goal plan before completion:

```bash
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<goal-plan>.md
```

This is the final mechanical gate, not a substitute for the named verification
surface.

The plan records its required acceptance and evidence.
Do not call
`update_goal(status: complete)` while any required checklist item remains
unchecked. If an item does not apply, check it and add `N/A: <reason>`.

Extended plan example (select relevant sections; the entrypoint and chosen template define required sections):

```md
# <Goal title>

Objective:
<concise create_goal objective>

Flow mode:
<one-shot execution | agent-led plan hardening | collaborative planning>

Goal plan:
<docs/plans/path>

Primary template:
<docs/plans/templates/name.md>

Applied packs:
- <pack or none>

Linked plans:
- <child docs/plans path or None>

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
verification evidence, checked checklist, current resume state, and any
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
- every linked child plan is complete when the root plan has `Linked plans`,
  `Linked goal plans`, or `Child plans` entries
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
