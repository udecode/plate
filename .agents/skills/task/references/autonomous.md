# Task autonomous mode

Handle $ARGUMENTS through [the Plate workflow](./workflow.md).
Task owns scope, plan, authority, timing, proof and review. Task autonomous mode selects and
reconciles checkpoints for an explicitly autonomous request. Use one current
Task plan and Show Me Your Work's decision trail.

## Route first

An explicit leading mode wins. Preserve the scope and newest user constraints.
Routed work continues under the existing authority without asking the user to
invoke another skill.

| Request | Owner |
| --- | --- |
| PR, issue URL, public queue, security or heartbeat | Maintainer |
| Current tree, post-merge, ready to commit or teammate branch | Task closure |
| `regression <case|surface|corpus>` | Regression |
| `benchmark`, `perf`, profiling or primary performance comparison | Benchmark |
| One local behavior bug | Patch |
| `architecture`, broad rearchitecture or an overall design challenge | [Architecture mode](./autonomous/architecture.md) |
| Issue inventory or exhaustive issue closure | Editor Test Harvester or Issue Harvester, respectively |
| Broad internal quality | The checkpoint loop below |

Architecture grammar is `task autonomous architecture <scope> [execute] [loop timed
<duration>]`. Without implementation wording it is a read-only audit; `execute`
authorizes the named implementation after target/adoption proof. A timebox does
not widen scope. Read only the architecture method for that mode.

The complete [argument reference](./autonomous/arguments.md) describes scope,
timing, aliases and examples. Load it when resolving invocation ambiguity;
ordinary routing uses the table above.

## Supervise quality checkpoints

1. Establish the requested outcome, bounded owners, actual edit authority and
   any timing constraint in the current plan. Infer Plate, Plite or shared
   ownership from source paths. Pagination requires an explicit pagination
   request; huge documents, virtualization and performance do not imply it.
2. Compare current evidence with the remaining acceptance criteria. Choose
   one useful checkpoint. Add, split, merge, reprioritize or reopen plan rows
   when evidence changes them; retire obsolete rows with a reason.
3. Route the concrete question through the table below. Read that owner's full
   method only when the checkpoint needs it. Do not run every row as a cycle.
4. Inspect the resulting proof. Record the owner, failure or hypothesis,
   files/commands, evidence and `keep`, `revert` or `quarantine` decision once.
   Link an existing Regression, Benchmark or research receipt instead of
   copying its ledger. Quarantined work is unfinished and stays outside the
   active runtime. Revert only the current run's unsuccessful changes.
5. Reconcile outstanding obligations and continue. Reserve proof and cleanup
   before a deadline. Missing preferences pause dependent work; continue any
   independent authorized work. Stop when the scope is complete or no useful
   authorized move remains, under Task's timing and native-goal contracts.

| Evidence gap | Owner and exit evidence |
| --- | --- |
| Incorrect local behavior | Patch; exact symptom and final replay, Regression for its explicit triggers |
| Package, editor, visual or native input proof | Verify Plate; exact source/route/action, scoped result and surviving evidence |
| Missing test value or reusable boundary helper | Testing; smallest worthwhile public-behavior proof |
| Slow operation or unreliable metric | Benchmark; causal owner, comparable baseline/candidate, correctness and exact rerun |
| Public API or broader runtime design | Best API then Plate Plan/Plite Plan; accepted target and adoption proof |
| Source layout and ownership friction | Architecture Cleanup; source-backed cut/merge/inline decision |
| External editor evidence | Plite Research, Editor Test Harvester or Issue Harvester; provenance and local proof target |
| General prose | Technical Writing |
| Plate public docs | [Plate Docs](../../plate-docs/SKILL.md) |
| Workflow failure or slowdown | Owning rule/helper through Task; concrete failing action and rerun |

Use `slate-ar status`, `quality`, `stabilize` or `gate` only for a checkpoint
whose actual owner is that autoresearch program. Stable browser examples and
scenario generation live in Verify Plate. Correct behavior is a precondition
for accepting a performance win; Benchmark owns plateau and bottleneck changes.

When a research lead becomes a packet, return its final decision and proof to
the originating research ledger. Issue clusters route work; Issue Harvester's
issue-by-issue ledger establishes exhaustive closure. Plate-owned rows remain
deferred to their owner when the user scoped the run to Plite.

Record a recurring slowdown with its real command, owner, observed duration,
evidence and repair decision. Repair the owning source within authority; do
not trade away necessary proof to make the loop faster. Keep one-off findings
in the plan. Sync Vision owns accepted reusable product decisions.

## Handoff

Report changes, proof, unfinished or quarantined work, stop reason and the next
owner. Link the current plan and decision trail. Include measured performance,
elapsed time and queued user decisions only when relevant. State exact local
versus published status. Apply Task's standing Autogoal request for long-running
work; autonomous mode adds no review panel or scheduler.
