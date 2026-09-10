# Plate workflow

Task owns intake, scope, the current plan, implementation and delivery. Its
[autonomous mode](./autonomous.md) reconciles quality checkpoints through the
same plan and domain owners. Poteto Mode supplies its full engineering method. A specialist owns
its technical decisions and proof; it does not start another task lifecycle.

This is the common execution contract for every local rule, reference and plan
template. Current user instructions and runtime tool contracts take precedence.
Read this once per task, then load only the methods the work calls for.

## Plans and native goals

For API and architecture decisions, apply
[Redesign from First Principles](../../../skills/principle-redesign-from-first-principles/SKILL.md)
before target selection, using the `next` beta law in `VISION.md` and
`docs/vision/common.md`. This governs Best API Review, Best API, layer plans,
architecture audits, cleanup and migration. Reuse a settled comparison while
its requirements and evidence hold; continue ordinary implementation directly.

Use the shared `best-api-review` skill when the user asks whether an API or
architecture proposal is worth pursuing before design or execution. Follow
[Plate's assessment routing](./best-api-review.md). It may stop with no change;
it does not add a mandatory review to ordinary tasks.

Keep a durable file for multi-step work that needs resumable decisions or
evidence. Record outcome, scope, acceptance, decisions, proof, risk and next
action once. Tiny edits and questions need no plan template.

The project templates under `docs/plans/templates/` remain project-owned. Their
case matrices and package, release, browser and source gates remain available.
Choose one primary template when its specific contract helps. Add only relevant
surface packs; do not fill unrelated tables just to perform ordinary work.
Regression and Benchmark retain their executable semantic-validator schemas.

`create-goal-scratchpad.mjs` creates a file. `check-complete.mjs` checks that
file's structure. Neither creates a native Codex goal or proves app behavior.
The user's standing instruction requests Autogoal for every long-running workflow,
including standalone specialist, planning, audit, research and maintenance work
unless they opt out. Apply [Autogoal's standing-request criteria](../../../skills/autogoal/SKILL.md)
before extended work or when a small task grows: substantial objectives with
multiple execution, investigation or verification checkpoints and an acceptance
ledger, including large audits and multi-gap implementation. No separate
invocation or confirmation is needed. Quick questions, small edits and a slow
command alone do not qualify. Improve retains its own standing goal request.
Reuse the current goal and plan across workers; a goal preserves audit-only,
plan-only, human-assignment and publication boundaries. Templates and mode names
do not supply authority beyond the user's direct or standing request.

Assume long execution will lose strict checklist items unless they are persisted.
Apply Autogoal's checklist-retention method: materialize every applicable user,
method, reference and template obligation in the existing plan with source and
evidence; update at checkpoints and resume; reconcile the original checklists
before closure. Keep domain ledgers and semantic validators authoritative. Short
work checks the same applicable requirements directly. An explicit no-goal
request disables native continuation, not required proof or durable accounting.

Honor the user's duration as stated. A deadline or budget is an upper bound;
an explicitly requested minimum run remains a minimum. An unspecified duration
does not authorize an endless loop, invented work, or scheduled continuation.
Continue authorized work through internal owner transitions without another
approval. Ask only for a missing decision, access or authority.

## Scope, Git and publication

Read the user-named source first. Current user corrections outrank old plans
and tracker proposals. Root `VISION.md` and the relevant `docs/vision/` detail
own durable product law; local code and proof establish current behavior.

An audit inspects its whole named scope and records findings. Product repairs
require implementation authority. A named workflow repair may fix the owned
instructions or helper that failed. Protect vendor/package skills and every
Next dev loop copy. Edit `.agents/AGENTS.md`, `.agents/rules/` and project
templates; regenerate with `pnpm install`. Shared skill edits belong in Dotai,
followed by a named install. Never hand-edit generated skill mirrors.

Before nontrivial source mutation, check only `git branch --show-current`.
Do not proactively inspect Git status or create another checkout. Continue in
the current authorized checkout. A PR request authorizes branch handling under
the current user instructions; the entire current checkout is its scope unless
the user explicitly narrows it.

Commit, push, PR, merge, release, deployment, tracker mutation and messages to
other people require their actual authorization. A skill, template, issue URL,
`full`, `execute`, or a useful result cannot manufacture it. Prepare the complete
local result first. Existing authorization persists; do not request it again.
Never send an external comment, issue, email or chat message merely because an
older recipe says to post status. Keep private security evidence private.

## Proof and review

Verify Plate selects existing proof owners and the exact affected surface.
Testing owns test value and runner mechanics. Patch owns one exact behavior
repair; Regression owns executable corpus/oracle/receipt semantics; Benchmark
owns measurement and causal diagnosis. Keep their distinct claims intact.

Run the narrowest affected proof during iteration. Wider package, browser,
registry, release and root gates apply when the change or claim requires them.
Do not run the app or full test suite for a local prose edit. Do not substitute
a source scan for required browser, native-device or published-package proof.

Reuse completed proof while its effective source, dependencies, fixture,
runner and environment inputs remain valid. Use the existing entrypoint Turbo
graph and browser manifest checks; do not create a second proof cache. A plan,
receipt or unrelated source edit does not invalidate every completed gate.
Root package types run from source. Release artifacts and full browser closure
keep their explicit owning commands.

Shared-host elapsed time is diagnostic evidence, not a routine correctness
gate. Do not rerun unchanged workloads until a historical timing limit passes
or require users to pause other apps. Preserve failed measurements. A speed
claim needs a matched comparison that isolates the changed owner; an unresolved
timing result remains inconclusive even when correctness passes.

Task owns one Autoreview budget for an explicit review request or actual PR
closure. Plate uses P1 by default, P2/P3 only when requested, and at most three
helper invocations for one scope. Never run Autoreview on `next`. Record the
scope, target, invocation count, findings and result once. Workers, plans,
Autonomous checkpoints, goals, pstack critiques and closure recipes cannot reset this budget or
add another final panel. A clean unchanged result needs no ceremonial rerun.

Always inspect your own result and resolve verified in-scope defects. Apply
Agent Native Reviewer to meaningful workflow changes. Best API still owns
public-call-shape judgment and doctrine repair; it is not a second diff-review
service. On `next`, report structured review as not run under branch policy;
never switch branches to evade that rule or claim a reviewer passed.

For publication, run `pnpm check` and every applicable release/registry gate.
Keep existing changeset rules, immutable doctrine history, exact pushed-ref
replay, receipt fingerprints, security read-back and browser claim boundaries.
A local pass proves local behavior; it does not prove integration or release.

## Full methods and evidence

Read full pstack playbooks and the principle leaves that govern the decision.
Use the installed Codex adapter to map tools and actual model availability.
Do not replace their examples, prompts or methods with summaries. Separate
independent design questions from repeated reviews of the same final diff.

Show Me Your Work keeps one append-only decision trail for long or unattended
work. Link existing plan, Regression or Benchmark receipts rather than copying
their contents. Preserve original evidence through cleanup and corrections.
Technical Writing owns prose and preservation. [Plate Docs](../../plate-docs/SKILL.md)
owns the public documentation method and selects its applicable proof.
Walkthrough presents existing final visual evidence.

Report observed outcomes and material limits. Do not invent confidence
percentages, model independence, feature coverage, or publication status.

## PR descriptions

For an authorized PR, follow its actual repository template. Describe the final
problem, behavior, owning fix, relevant proof and material tradeoffs. Use
`--body-file` and read back the final body with `gh pr view --json body`. Changeset
owns the managed auto-release block. Do not copy another project's PR format.
