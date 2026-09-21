# Best API Review in Plate

Use the shared [Best API Review](../../../skills/best-api-review/SKILL.md) for
"is this approach better?", "is it worth changing?", or an audit whose first
decision is whether any change earns its cost. It may finish with Stop. Its
purpose is not to find work for another skill.

## Review history is the default

Start with `node tooling/scripts/review-ledger.mjs lookup <scope-or-feature>`
from the repository root. [The feature review ledger](../../../../docs/research/reviews.md)
maps current package, registry and tooling capabilities to stable semantic
questions. Compact lookup and the generated `docs/research/features/<scope>.md`
hub locate the current decision, relevant earlier alternatives, newer execution,
changed inputs and unresolved conflicts. Read those linked sources before
proposing more work. Use `lookup <scope> --detail` only for full records and
fingerprints. Inspect historical candidates before classifying them in the
index's `documents`; filename matches alone remain candidates. Use
`research <key-or-term>` on the same helper for read,
lead and rejection lookup across dated Plite research runs. A text hit routes
inspection; it does not prove semantic equivalence or current source reuse.

Treat the source census and semantic questions separately. Read the scope's
inspection depth and gaps; a populated directory bucket does not establish
feature coverage. Check the local observation against its base commit and
fingerprint before interpreting a GitHub-versus-local discrepancy. Related
scope history supplies context without transferring its review/proof status.

Every invocation challenges the strongest deletion/replacement alternative
against current jobs and hard laws; no reassessment flag is required. First
reconcile the current decision, earlier material alternatives and subsequent
execution. Name the conclusions retained, reopened or superseded, with reasons.
Keep question boundaries: a paint finding does not reopen topology or resize
without evidence against those decisions. Reuse matching observations; inspect
changed inputs rather than treating one stale fingerprint as a full reset.
When the challenge adds no new value, reaffirm and Stop without another plan
or repeated external research. A completed design is not runtime adoption;
an implementation receipt may require correcting the decision's progress.

If no scope matches a new proposal, add its semantic question to the index
with the current comparison owners and explicit evidence inputs. A proposed scope may have
no current feature members; its real comparator files supply the source
fingerprints. Do not invent a source path for the proposed API.

For a material review, use `draft <scope>` to capture the scope's current source,
owners, consumers, selected proof and additional `evidenceInputs` into a JSON
draft under the existing task artifacts. Review prerequisites control queue
order only. Add decision-critical shared contracts, fixtures and runner inputs
explicitly; do not fingerprint every prerequisite's whole implementation.
When no relevant proof is located, record the gap instead of borrowing an
unrelated test or treating a demo as proof.
Complete its requirements, alternatives, rationale, source references, proof
limits, available model identity and relation to the previous review. Fill
`reconciliation` for prior conclusions and later execution using exact record
IDs, question, `retains`/`reopens`/`supersedes` and reason. Resolve contradictions
or keep their limits explicit. Record
with `record <repo-relative-json-path>` before closeout. The helper appends an
immutable record and updates review state. Adoption and proof are derived from
bound execution outcomes; legacy flags are explicitly unbound claims.
Reconcile the current decision page, then run `render` and `check`. A Stop
record is history, not a new implementation task. Small reviews use the same
compact record without a new plan.

For associated execution, follow Task's [feature-history closure](workflow.md#feature-history-closure).
Keep each plan's `review_scopes`, `review_basis` and `work_kind` metadata and
one lifecycle status in that plan. Do not maintain a second status in a hub.

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

Before generalizing a plugin access pattern, census every in-scope production
call shape and separate descriptor portals, generated direct transaction
groups, and dynamic name dispatch. A presence guard makes name dispatch
runtime-safe, not statically capability-safe. Accept that erased path only at
an independently optional package or entrypoint boundary where importing the
descriptor creates the wrong dependency. When an integration already chooses
both features, require the descriptor and its inferred portal. Never present
`editor.plugin(pluginName)` as the name-only alternative: the escape hatch is
`tx.plugin(pluginName)` inside the active transaction, guarded there when the
peer is optional. One exceptional boundary cannot establish a registry-wide
pattern.

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

For Pursue or Defer, choose the entry point for the whole remaining job. When
API, architecture, lifetime, adoption and proof decisions remain coupled,
recommend `$task design plan <scope>`. Task applies Best API, the owning layer
plan and Benchmark as needed inside one lifecycle. Do not narrow that work to
a standalone Best API handoff merely because its public contract is unresolved.
Keep assessed cuts as candidates to validate during design.

| Remaining question | Next owner |
| --- | --- |
| API and architecture choices remain coupled across owners, with adoption or proof to resolve together | [Task](../../../skills/task/SKILL.md), `design plan <scope>` through its [complex-work method](./complex-work.md) |
| One bounded public-contract decision remains | [Best API](../../../skills/best-api/SKILL.md), `design` or `review` with the exact surface |
| The Plate target is clear; adoption and proof span owners | [Plate Plan](../../../skills/plate-plan/SKILL.md) |
| The Plite substrate target is clear; adoption and proof span owners | [Plite Plan](../../../skills/plite-plan/SKILL.md) |
| The target and bounded implementation/proof path are clear | [Task](../../../skills/task/SKILL.md) |
| Runtime scale can decide whether the target is justified | [Benchmark](../../../skills/benchmark/SKILL.md), with the exact comparison; verdict stays Defer |
| Missing ownership/lifetime evidence needs a deeper, scored audit | [Plate Review](../../../skills/plate-review/SKILL.md), with one resolved surface; verdict stays Defer |

Within Task, or when an accepted target needs only adoption planning, pick the
layer plan that owns the first unresolved boundary. Do not recommend both by
default. The assessment must expose the
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
