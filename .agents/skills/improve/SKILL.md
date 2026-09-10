---
description: Audit and improve the current Plate/Plite project through Autogoal and one evolving audit plan across architecture, simplification, performance, test value, docs, registry, and applicable agent rules. Use for a recurring whole-project improvement run, with one optional iteration count or hour budget.
name: improve
metadata:
  skiller:
    source: .agents/rules/improve.mdc
---

# Improve

Handle $ARGUMENTS. This is the user's recurring Plate/Plite improvement preset
for [Task autonomous mode](../task/references/autonomous.md). Read that method
and [the Plate workflow](../task/references/workflow.md); retain their single
plan, technical owners, authority, proof, and review budget.

Invocation requests a full audit and repair of every confirmed actionable
defect in its scope, including the affected audits opened below. A repair
batch is a checkpoint inside that work. Do not stop at recommendations or ask
the user to invoke each specialist. An explicit read-only instruction still
wins. Creating or explaining this skill does not start a run.

## Use Autogoal with the audit plan

The user explicitly requested Autogoal as part of Improve. Invoking this preset
therefore includes a request for one native goal, unless the user opts out.
This preset request also covers short Improve runs; the project-wide standing
request covers long-running work through any entrypoint.
Questions and edits about Improve do not invoke the preset.

Read [Autogoal](../autogoal/SKILL.md) and use its existing lifecycle, goal
conflict handling, resume procedure, and completion gate. Keep Task's one plan:
start it with the requested audit scope, budget, and completion criteria, then
write the audit findings, required repairs, and proof obligations into that
same plan as they are discovered. Do not wait for the audit to finish before
starting the goal. Use `get_goal` and reuse or create the goal through Autogoal;
its objective names the whole requested run and links this plan.

Keep the audit itself and every unresolved required finding or expanded audit
as unchecked work in the plan. A batch's proof closes only its own rows. Do
not create a goal per batch, create a second plan, or narrow the objective to
the work already finished. Before completing the goal, reconcile the full
scope with the plan, prove its acceptance criteria, and run Autogoal's existing
`check-complete.mjs` gate. A structurally valid plan cannot replace audit or
runtime evidence.

## One optional budget

| Invocation | Run |
| --- | --- |
| `$improve` | One complete improvement iteration. |
| `$improve 5` | Up to five complete iterations, while worthwhile work remains. |
| `$improve 3h` | Repeat within three hours, including verification and cleanup. |
| `$improve 0.5h` | The same loop with a thirty-minute budget. |
| `$improve forever` | Continue while useful authorized work remains, until stopped or blocked. |

An integer means iterations; a positive number with `h` means hours. Reject
zero, negative, malformed, or conflicting budgets rather than guessing a long
run. `forever` is the unbounded value of this same parameter, not a scheduler.
The current project is the scope; there is no required scope or execute flag.
Honor a scope supplied in the user's surrounding request.

An iteration count limits completed passes; it does not impose a deadline or
limit the number of repair batches. With `$improve` or `$improve 5`, continue
the current iteration until its full scope is complete. Without an explicit
duration, there is no timebox. Context compaction and specialist transitions keep
the same iteration and its unfinished obligations.

Record the budget and, for hours, the start time and deadline using the actual
clock. Carry them across context compaction and specialist transitions. A
deadline is an upper bound. Reserve proof and cleanup before it; do not start
a change that cannot reach a coherent checkpoint. Report an exhausted budget
with pending work, not a false completion claim. Task's rules for native goals,
publication, other checkouts, and scheduled continuation remain in force.
For a timed run, check remaining time before each batch and specialist transition.

Bind the goal to this budget at creation. An iteration-based goal requires the
complete iterations below. An hour-budget goal requests a bounded improvement
run ending in a verified checkpoint and an exact record of unfinished scope;
completing that timed goal does not count an unfinished iteration as complete.
Keep its remaining audit scope visible, with retained changes proved or safely
removed before closing the checkpoint. Never turn an untimed full-scope goal
into a timed checkpoint to close it early. Iterations and hours are not native
token budgets; set a token budget only when the user explicitly requests one.

## What one iteration means

1. Review the current state across every applicable lane below, including the
   unresolved findings and proof gaps from previous runs.
2. Rank the strongest source-backed opportunities across lanes. Select a
   coherent batch with the largest durable benefit, not the easiest edits.
3. Challenge its architecture, implement the justified target, and verify the
   affected behavior and any performance claim through the existing owners.
4. Reconcile expanded audits and re-rank remaining work. Repeat the checkpoints
   within this iteration until its completion conditions hold, then record the
   result and count the iteration.

An iteration is complete only when:

- every applicable lane and required affected audit has its entire governed
  set reviewed, with evidence-backed dispositions in the current plan;
- every confirmed actionable defect is repaired and passes its required proof,
  or is reported with evidence when the user explicitly requested read-only work;
- every remaining lead has been investigated enough to accept or reject it.
  Unsupported hypotheses and optional redesigns may be rejected with evidence;
  leaving an investigation pending does not resolve it.

This requires complete coverage of the declared scope and discovered defects,
not a claim that no unknown bug exists. Do not invent work or implement an
unproved optimization to empty a queue. A real deadline, user instruction, or
external blocker may end an incomplete run. First exhaust independent work;
record the blocked obligation and what would unblock it. A partial iteration
does not count toward the requested number of completed iterations.

A pass is not one lint invocation, one fixed bug, or an identical rerun. In
later iterations refresh changed or uncertain evidence across lanes; reuse
valid proof and rule reads. Revisit an earlier keep/reject decision when new
source evidence or a stronger argument warrants it. A new model's opinion
alone does not invalidate working proof.

## Inventory the rules and the project

Use one current Task plan. Inventory effective global, project, and nested
AGENTS.md instructions; repo-owned skills and their references; and installed
skills whose methods apply to the project. Follow source and lock provenance;
generated mirrors are not additional rule owners. Account for every applicable
rule family, including domain references that a convenient shortlist misses.
Mark unrelated capabilities N/A with a reason instead of applying every
installed vendor skill to every file.

Read applicable sources fully in manageable batches before judging their
consumers. Record the rule source, governed file set, evidence, and status
(`pending`, `reviewed`, `violation`, `contested`, `blocked`, or `N/A`) in the
same plan. A clean sample or grep is not proof that the governed set complies.
This is a per-run coverage record, not a new permanent rule engine or feature
map. Recheck changed rule inputs on a later invocation.

| Lane | Inspect and route through |
| --- | --- |
| Architecture and API | Plate Review, Architecture Cleanup, Best API, and Task's architecture method: ownership, lifetime, data flow, packages, public calls, redundant state, wrappers, and compatibility paths. |
| Correctness and behavior | Patch, Regression when its triggers apply, and Verify Plate: existing editor and app behavior, failure recovery, resource cleanup, data integrity, and native interaction contracts. |
| Runtime and scale | Benchmark: editor, rendering, input, selection, history, serialization, collaboration, allocations, and fan-out where implemented. Include existing specialized lanes such as pagination when auditing the whole project; do not infer new features. |
| DX and CI | Benchmark and owning tooling: startup, incremental checks, builds, lint, typechecks, test discovery, caching, generators, and duplicated proof work. |
| Tests and proof | Testing and Verify Plate: real regression value, duplicate fixtures, useless wrappers' tests, private spelling locks, fake smoke tests, missing hard-law proof, runner cost, browser/native capability gaps. |
| Documentation | Plate Docs: house style, structure, API truth, examples, commands, links, and preservation. |
| Registry and components | Plate UI and its full applicable references: component/API patterns, props, hooks, state ownership, accessibility, kits, metadata, dependencies, and actual rendered behavior. |
| Rules and agent workflow | Maintain Workflow and Agent Native Reviewer: compliance, contradictions, stale teaching, source ownership, discovery, generated mirrors, and unnecessary repeated work. |

Locate the actual authored roots and consumers. Include current docs, registry,
tests, tooling, apps, Plate, and Plite; mark absent lanes explicitly. Generated
registry and template outputs are checked through their authored source and
generator. Historical evidence remains evidence, not a current API tutorial
to rewrite. Proof gaps and existing failures stay visible and eligible for
repair; calling them pre-existing does not dispose of them.

## One defect triggers the full affected audit

A confirmed violation opens an audit of its entire governed area, beyond the
current diff, package, or directory. Record the exact rule and enumerate all
applicable files before calling that audit complete.

- One bad documentation page: audit all current authored documentation against
  the applicable documentation rules, prioritizing the discovered pattern.
- One registry component violating Plate UI: audit the complete authored
  registry/component set against its applicable patterns and shared consumers.
- One duplicate or useless test: audit that pattern across the project's test
  suites and shared helpers, including React and tooling where it applies.
- One ownership, API, or tooling defect: trace every consumer and parallel
  implementation of that contract, even across package boundaries.

Read each candidate in context; a similar spelling does not prove the same
defect. Fix every confirmed instance. Record an actual authority, access, or
proof blocker when one prevents repair; the affected scope remains incomplete.
Existing debt, another technical owner, implementation effort, and finishing
the selected batch are not blockers or reasons to defer authorized work.
Deduplicate overlapping sweeps by rule and governed set. Keep their remaining
work in this iteration's ranked queue; do not recursively restart full audits
or move unfinished scope into a later iteration. An explicit timebox can leave
a sweep partial, but cannot justify calling it complete.

## Rank by value and challenge the target

Lead with the strongest justified cut, including deletion of an entire layer,
plugin, package, or public concept. Compare durable user/developer benefit,
frequency and scale of the cost, evidence strength, complexity removed, and
implementation plus proof effort. Repair serious correctness defects first.
Cheap cosmetic edits must not crowd out a larger demonstrated opportunity.
Line count and coverage percentage are supporting data, not objectives.

Use [Task's architecture method](../task/references/autonomous/architecture.md)
for a substantial redesign: compare materially different targets and attack
the chosen one before adopting it. Its implementation path is authorized by
this invocation; specialist boundaries are internal transitions. Do not limit
the run to Architecture Cleanup's small behavior-neutral packets.

Plate v2 is in beta. Challenge inherited constraints, VISION, plans, skills,
APIs, and the current implementation when they preserve unnecessary complexity.
Compatibility and blast radius affect adoption order, not the ideal target.
Preserve current explicit user constraints and hard correctness, security,
serialized-data, native-behavior, and runtime laws. Distinguish a stale rule
from a consumer defect: justify a better rule, repair its authorized source
through Maintain Workflow or the domain owner, then align consumers and
mirrors. Do not silently violate it or weaken it just to clear a failure.
Keep repairs to shared sources outside this project as concrete proposals
unless that destination is also authorized. Continue independent local work.

Delete or merge before adding another abstraction. Preserve the job of every
removed owner through an existing owner, an executable replacement, or proof
of redundancy. Keep useful deep modules, instrumentation, and tests. No test
is justified solely because a file exists; no deletion is justified solely by
its size. Never make checks green by deleting evidence of a real failure.

## Keep only proved improvements

Verify Plate selects the applicable package, type, browser, native, registry,
and artifact proof. Testing selects the smallest valuable regression coverage.
Use existing checks first. Preserve original failures and distinguish missing
capabilities from passing behavior. Documentation and registry sweeps require
semantic/source checks and their owned generation or rendered proof, not just
formatting. Workflow-only edits do not require editor or browser test suites.

Measure expensive work through Benchmark before changing it, with comparable
inputs, correctness guards, and a candidate rerun. Optimize tooling instead of
asking the user to pause other apps. Do not relabel a reduced workload as a
speedup or promise runtime gains from maintenance-only cuts.

Keep successful changes, repair failures, or revert only this run's failed
changes. Do not leave speculative implementations active. If an explicit hour
budget expires before an accepted change can be proved, preserve the proposal
and missing proof as unfinished work. An iteration count is not a reason to
defer it. The review budget belongs to the entire invocation; an iteration
never resets it.

## Continue and report honestly

Continue with the highest-value remaining obligation until the iteration is
complete or an allowed early-stop condition applies. Do not stop after a green
repair batch, a specialist handoff, or a report while required audits, repairs,
or proof remain actionable. A new invocation must not be needed to finish
already authorized scope. If all candidates are resolved and no worthwhile
authorized move remains, record the evidence and stop; do not invent churn or
sleep to consume hours. `forever` cannot outlive the active runtime by itself.

Keep iteration outcomes and proof links in the existing plan so a later run
can resume and challenge them. The final report states the strongest finding,
changes kept and complexity removed, measured gains and their limits, rule
families and governed areas covered, expanded audits still pending, failed or
unavailable proof, iterations completed, and why the run stopped. Label an
early exit `incomplete` even when its retained repair batches pass. Reporting
pending work does not authorize that exit. Distinguish local implementation
from publication. No weekly schedule is created merely because this skill is
useful weekly.
