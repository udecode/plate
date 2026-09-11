# Best API Review in Plate

Use the shared [Best API Review](../../../skills/best-api-review/SKILL.md) for
"is this approach better?", "is it worth changing?", or an audit whose first
decision is whether any change earns its cost. It may finish with Stop. Its
purpose is not to find work for another skill.

## Review history is the default

Start with `node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>`
from the repository root. [The feature review ledger](../../../../docs/research/reviews.md)
maps current package, registry and tooling capabilities to stable semantic
questions. Read the linked decisions, earlier attempts, rejected alternatives
and proof limits. Use `research <key-or-term>` on the same helper for read,
lead and rejection lookup across dated Plite research runs. A text hit routes
inspection; it does not prove semantic equivalence or current source reuse.

Every repeated invocation requests a fresh review, even with unchanged source
and the same model. No reassessment flag is required. Frame the ideal from
current jobs and hard laws, compare all material design lanes, then reconcile
the earlier conclusion. Reuse exact source observations only while their
question, fingerprint and relevant dependencies match. Changed source or a
deliberate reconsideration names what was rechecked and why; it does not start
external discovery or implementation without that scope.

If no scope matches a new proposal, add its semantic question to the index
with the current comparison owners and dependencies. A proposed scope may have
no current feature members; its real comparator dependencies supply the source
fingerprints. Do not invent a source path for the proposed API.

For a material review, use `draft <scope>` to capture the current source and
dependency fingerprints into a JSON draft under the existing task artifacts.
Complete its requirements, alternatives, rationale, source references, proof
limits, available model identity and relation to the previous review. Record
with `record <repo-relative-json-path>` before closeout. The helper appends an
immutable record and updates review state; adoption and proof remain separate.
Reconcile the current decision page, then run `render` and `check`. A Stop
record is history, not a new implementation task. Small reviews use the same
compact record without a new plan.

If the source inventory changes, inspect the delta, map added/renamed features
in `docs/research/review-index.json`, and run `refresh`, `render`, then `check`.
Refresh updates inventory observations only; it cannot refresh an old review
or certify behavior. Historical imports keep unknown model/source fields and
original evidence. [The record contract](../../../../docs/research/schema.md#review-history)
owns the exact fields and commands. AI remains last in the global review order;
a direct feature request still selects that feature.

## Assess the current design

Read `VISION.md`, `docs/vision/common.md` and the relevant Plate or Plite owner
when they can change the verdict. Inspect the owning implementation, public
types and materially different consumers. Include copied UI and kits when they
own the policy under discussion; a package-only trace cannot settle that case.

Before issuing the value verdict, apply the relevant decision methods, not
only their eventual handoff routes:

- [Redesign from First Principles](../../../skills/principle-redesign-from-first-principles/SKILL.md)
  starts from the current job and hard laws before preserving a proposed or
  existing owner. It is the governing `next` beta principle, not a fallback
  after the current design fails.
- [Best API](../../../skills/best-api/SKILL.md) supplies the ideal-first call
  shape, maximum-value hard cut, long-term target and scale gates.
- [Plate Plan](../../../skills/plate-plan/SKILL.md) supplies Plate/substrate
  ownership and the keep/cut/rearchitect/rename/move/bridge/defer/gate choices.
- [Plite Plan](../../../skills/plite-plan/SKILL.md) supplies raw model, runtime,
  DOM/React, history and collaboration boundaries when those laws are involved.

Read the applicable ownership and decision sections without starting the
skills' planning or execution workflows. When the boundary is contested, use
both Plate and Plite methods. The shared review's lanes cover current
configuration, changed APIs, new primitives, deletions, owner moves and
replacement architecture; none is limited by today's exports.

Keep long-term value separate from adoption effort. On `next`, breaking APIs
and architecture are permitted. Preserve hard laws and explicit user
constraints, not incidental signatures or package topology. Reject Plate glue
when the durable repair belongs in Plite, and keep product policy out of an
otherwise neutral substrate. A lower primitive can be added or redesigned;
"Plite does not expose it" cannot settle the verdict.

For cross-feature presentation, compare changing the existing producer's
presentation contract, introducing a justified lower primitive, and removing
or merging producers as well as a new consumer subscription. Merely moving
classes into a kit through an existing hook does not establish the best design.
Keep any proposed API clearly labeled and name the deleted protocol or caller
work. Do not accept changed runtime machinery without its required executable
scale comparison.

For Pursue or Defer, choose the first unresolved job:

| Remaining question | Next owner |
| --- | --- |
| Which reusable public contract should exist? | [Best API](../../../skills/best-api/SKILL.md), `design` or `review` with the exact surface |
| The Plate target is clear; adoption and proof span owners | [Plate Plan](../../../skills/plate-plan/SKILL.md) |
| The Plite substrate target is clear; adoption and proof span owners | [Plite Plan](../../../skills/plite-plan/SKILL.md) |
| The target and bounded implementation/proof path are clear | [Task](../../../skills/task/SKILL.md) |
| Runtime scale can decide whether the target is justified | [Benchmark](../../../skills/benchmark/SKILL.md), with the exact comparison; verdict stays Defer |
| Missing ownership/lifetime evidence needs a deeper, scored audit | [Plate Review](../../../skills/plate-review/SKILL.md), with one resolved surface; verdict stays Defer |

For work crossing Plate and Plite, pick the plan that owns the first unresolved
boundary. Do not recommend both by default. The assessment must expose the
strongest plausible breaking direction before routing detailed API design or
adoption. Best API's pre-acceptance scale gate remains binding; an unmeasured
runtime target stays provisional even when its direction earns further work.

A direct request for a scored architecture audit still belongs to Plate Review.
A request to choose detailed public call shapes belongs to Best API. A PR or
correctness diff review follows Task's Autoreview policy, including its
prohibition on `next`. The new skill does not bypass that policy or replace
native/browser proof.

Recommend the next invocation and stop unless the active request already
authorizes its execution. Preserve the current Task plan and any applicable
Autogoal request. Do not create a downstream plan merely to say a proposal is
not worthwhile.
