# Autonomous architecture review

Use this resource only after Task autonomous mode selects architecture mode. It owns the full
user workflow: current-state audit, ideal target, adversarial challenge,
accepted adoption plan, optional execution, proof, and final verdict.

The workers remain private. Do not stop and ask the user to run the next skill.

## Plan And Scope

For multi-step work, create or continue one Task file plan. Prefer the
`architecture-cleanup` project template with the `agent-native` pack when agent
workflow changes are in scope. Copy every user requirement into the plan before
broad exploration or implementation.

Record:

- exact bounded scope and primary Plite, Plate, or shared owner;
- audit-only, `execute`, timed-loop, and deadline state;
- hard correctness, security, serialized-data, native-behavior, and runtime
  laws that cannot be traded away;
- explicit non-goals and mutation authority;
- proof surfaces, completion threshold, and at most three execution phases;
- cut obligations: every removed hook, adapter, owner, or public noun must
  name the behavior it carried, its replacement or proven redundancy, and its
  regression proof.

Do not treat an existing plan, compatibility promise, implementation cost, or
current file topology as the target. They constrain adoption order only.

## Evidence Before Opinion

Build the smallest complete source map for the bounded scope:

- public calls, packages, entrypoints, owners, state, lifetime, and data flow;
- runtime reachability and growing work such as nodes, marks, listeners,
  subscribers, DOM units, queries, or plugins;
- current behavior, tests, browser proof, benchmarks, and known gaps;
- duplicate abstractions, pass-through wrappers, stale compatibility, hidden
  coupling, and proof-host limitations.

Use private owners only when their evidence is material:

| Question | Private owner |
| --- | --- |
| durable product taste and non-negotiable laws | `VISION.md` |
| current ownership, lifetime, reachability, and architecture score | `plate-review` |
| source shape, deletion, consolidation, testability, and agent navigation | `architecture-cleanup` |
| ideal reusable public call shape | `best-api` |
| measured performance cause and fair normal/large/stress comparison | `benchmark` with the `benchmark review` lens |
| source-level comparison with selected editors | `editor-audit` |
| accepted Plite boundary and adoption | `plite-plan` |
| accepted Plate boundary and adoption | `plate-plan` |
| implementation and focused proof | the owning package/feature worker |

Infer which evidence is needed. Do not make users name comparators or say
“benchmark”, “harsh”, “break”, or “best”. External editors are evidence, not
voting members. Prefer current local source; follow repo rules before fetching
missing source.

Every private worker inherits Task's exact mutation authority. Audit-only mode
invokes cleanup, comparison, API, and layer-plan workers read-only; `execute`
may authorize their implementation packets only after the challenged target is
locked.

Performance claims require frozen comparable lanes and correctness guards.
Keep intentionally distinct modes, such as virtualized and non-virtualized
rendering, separate unless the target explicitly unifies them. Never hide a
slow path by changing the workload or proof contract.

## Bounded Bestness Challenge

Run no more than three design passes.

### Pass 1: Ideal and alternatives

State the ideal target before compatibility or current plans constrain it.
Compare at least two materially different architectures. Renames and wrapper
reshuffles do not count; alternatives must differ in ownership, lifetime, data
model, public call shape, or runtime strategy.

For each alternative, record:

- what disappears, merges, moves, or becomes private;
- the canonical owner and governing invariant;
- behavior and scale consequences across normal, large, and stress lanes when
  runtime work is involved;
- public DX/AX, proof burden, adoption cost, and failure mode;
- the evidence that would falsify it.

Choose the strongest target by hard laws and durable value. Compatibility and
implementation difficulty may change phase order, never the final target.

### Pass 2: Hostile review

Attack the chosen target as if reviewing a costly rewrite:

- What else can be deleted, merged, inlined, or reused?
- Which new noun, layer, hook, state copy, or adapter lacks an independent job?
- Is ownership split across two places?
- Does the target preserve every cut obligation, including composition,
  selection, IME, browser-native behavior, serialization, and failure cleanup?
- Can a simpler architecture win the same benchmark and correctness lanes?
- What current evidence contradicts the target?
- What exact result would make us pivot?

Do not defend the first answer. Try to kill it.

### Pass 3: Replay only when improved

If the hostile pass materially improves or invalidates the target, replace it
and replay the comparison once. If it does not, skip this pass. Never exceed
three total design passes by renaming the same review.

Record a `challenge delta`:

- `unchanged`: the hostile pass found no material improvement;
- `improved`: name exactly what was deleted, merged, moved, or re-owned;
- `replaced`: name the rejected target, new target, and decisive evidence.

No architecture verdict is complete without this delta.

## Adoption Plan

Produce at most three phases. Each phase must be independently valuable and
end with a checkpoint where the next phase can continue, pivot, or stop.

Each phase records:

- one owner and one architectural outcome;
- exact files/packages/public calls affected;
- cut obligations and replacement behavior;
- focused correctness, type, browser, package, and performance proof that
  actually applies;
- keep, revert, or quarantine rule;
- pivot trigger and blast radius;
- migration order without preserving duplicate permanent architectures.

Default shape when all three are needed:

1. Prove the cause and land the smallest owning primitive or boundary.
2. Adopt it across the primary Plite or Plate lane and delete the displaced
   path.
3. Finish cross-layer adoption, docs/examples, broad proof, and remaining cuts.

Do not invent three phases when one or two are enough.

## Execution

Without `execute`, stop after the challenged target and adoption plan. Do not
change product/runtime source.

With `execute`:

1. Lock the challenged target and phase-one proof before mutation.
2. Pass the private owner the user's `execute` authority, final target,
   `challenge delta`, exact layer packet, proof gates, current Task plan and
   remaining review budget. This is delegated supervisor mode: retain the
   existing authorization and do not require a second user invocation.
3. Implement one phase at a time through the private owner.
4. Run focused proof before broad proof and rerun frozen performance lanes when
   the phase touches growing runtime work.
5. Reconcile every cut obligation. Cutting a hook without replacing its real
   behavior is a regression, not cleanup.
6. End each phase with keep, revert, or quarantine. If proof fails or the
   architecture conflicts materially with source evidence, stop the phase,
   update the target, and pivot before more adoption.
7. Continue across private `plite-plan` or `plate-plan` transitions. Their
   decision gates are internal checkpoints, not reasons to return ceremony to
   the user.

In `loop timed <duration>`, select only in-scope packets that fit the remaining
budget, including proof and cleanup. Finish or checkpoint by the stated
deadline; report unfinished proof honestly. Honor an explicitly requested
minimum without inventing scope. A loop without `execute` remains
product/source read-only.

## Stop Rules

Stop when the requested audit or authorized phases meet their completion
threshold, the stated budget/deadline is reached, or a user-only product
choice, unauthorized external mutation, missing environment or proven blocker
leaves no safe in-scope alternative. An explicit minimum remains binding only
within the authorized scope; report when no meaningful work remains.

Do not stop merely because another private skill owns the next step. Do not ask
“is this actually the best?” at the end; the bounded challenge must have
answered that before the verdict.

## Final Handoff

Lead with the harsh verdict. Keep measured facts separate from proposals.

Report:

- final target and canonical owner;
- strongest current-state finding;
- alternatives compared and decisive rejection reasons;
- `challenge delta`;
- up to three phases with checkpoint, pivot trigger, and proof;
- execution state and phase results when authorized;
- cuts, replacements, regressions guarded, and residual falsifiers;
- exact evidence and artifacts;
- one next action, without asking the user to invoke a private worker.
