---
name: best-api-review
description: Judge whether an API or architecture change is worth pursuing, including new primitives and breaking redesigns beyond today's API. Give harsh, source-backed stop, pursue, or defer feedback before detailed design or implementation.
metadata:
  source: udecode/dotai
  source-path: skills/best-api-review
---

# Best API Review

Decide whether further work is justified. Agreement is not the default. A
successful review can end with "Keep the current design; this change adds no
material value."

Invoke `$best-api-review <proposal, path, or plan>`. Use `audit <scope>` when
every candidate in a bounded set needs a verdict.

This skill compares design directions before deciding their value. It must
consider changes to the API and architecture, not just ways to use them. It
does not replace detailed API design, architecture scoring, adoption planning,
code review, or implementation. Read the project's routing instructions and
applicable design methods when present. Do not turn every ordinary
implementation request into another architecture review.

## Resolve the question

Use the supplied proposal, code, plan, or conversation to name the current job,
the proposed change, and the claimed benefit. Inspect the current owner and a
real consumer before judging it. Compare plans and past claims with source.
Ask only when the missing target or requirement cannot be recovered from that
context.

For one proposal, expand the review only to owners, callers, lifetimes and hard
constraints that could change the verdict. Stop investigating after the
plausible design lanes have been considered and the decisive evidence is
sufficient. Do not manufacture a full audit to reject a thin idea.

For an explicit audit, enumerate the selected units and their materially
different consumers. Give every unit a disposition; report expected, reviewed,
excluded and unresolved counts. An early rejection ends work on that candidate,
not the remaining requested audit. Do not call a partial scan exhaustive.

## Compare the full design space

Apply [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md)
before judging the proposed direction. Read the full method once; a familiar
name or a paraphrase does not replace it.

First name the required behavior and hard laws without preserving current
symbols. Ask what the smallest clear contract and owner would be if this need
were part of the original design. Sketch that ideal before fitting it to the
current implementation. Current APIs and architecture establish the baseline;
they are not the boundary of the answer.

Consider each lane that can materially change the decision:

| Lane | Question |
| --- | --- |
| Keep or configure | Does the current design already solve the job without extra coordination? |
| Change an existing API | Would changing inputs, outputs, inference, configuration or lifecycle at its owner remove caller work? |
| Add a primitive | Is a real capability missing, and what smallest new contract would own it? |
| Delete, merge or inline | Can a noun, state store, adapter, plugin, layer or package disappear? |
| Move ownership | Does a higher or lower layer own the law, including a substrate that must change to support it? |
| Replace the architecture | Would a different state model, lifetime or responsibility split remove the need for the current protocol? |

For a small question, screen irrelevant lanes briefly. For competing material
lanes, show the strongest candidates and why each wins, loses or needs evidence.
Do not equate full consideration with inventing an abstraction for every lane.

Treat every current and proposed public noun as deletable. Look above and below
the named owner. Existing primitives earn reuse by fitting the job; familiarity
and availability do not make them correct. A missing primitive earns addition
only through a current job or hard law. Do not preserve an inadequate lower
layer by making its callers assemble glue.

Reject "this already works with today's API" as a sufficient recommendation.
Do not defer the strongest missing-API or architecture alternative to a later
skill while presenting a current-API workaround as best. This review must name
that alternative, its owner and material benefit before the value verdict;
the next skill can settle the detailed contract and proof.

## Test the value

Trace the consequence of each claimed improvement:

- Which current user, caller, maintainer or runtime job becomes better?
- Does ownership, lifetime, inference, discoverability or customization improve?
- Does recurring coordination, work or state disappear, or merely move?
- What new concepts, dependencies, mutable state or failure paths remain?
- Which behaviors, callers, data or native laws could regress?

Demand a concrete benefit. Symmetry, a fashionable pattern, fewer lines, a
larger configuration surface, or hypothetical reuse do not establish value.
Use the project's durable architecture and API criteria rather than inventing
a competing doctrine.

Judge the long-term target before adoption effort. A large repair can be worth
doing. Compatibility, sunk effort and implementation difficulty can change its
order or timing; they cannot make the weaker architecture the better target.
Separate migration cost from the complexity the target would retain forever.
Breaking changes are an adoption consequence, not a reason to disqualify a
target. Preserve actual correctness, security, data and native/runtime laws,
plus explicit user constraints; do not silently promote current signatures or
package boundaries into hard laws.

For the strongest direction, show a small ownership flow or normal call site
and identify the APIs or owners to add, change, move or remove. Label new
signatures and imports as proposed; cite live source for current claims. Do not
invent an existing API or require the ideal example to compile today.

Keep facts, judgments and proof gaps distinct. Passing behavior tests do not
prove good ownership. Source inspection does not prove performance or native
parity. When one missing fact can change the choice, identify the smallest
decisive observation or experiment; do not invent measurements or guarantees.

## Give one verdict

| Verdict | Meaning | End of this review |
| --- | --- | --- |
| **Stop** | The proposal has no material benefit, adds unjustified machinery, violates a hard constraint, or loses to keeping the current design. | State why and keep the current design. No plan, task or consolation backlog. |
| **Pursue** | A material problem and a better direction are supported by evidence. The better direction may replace the user's proposal. | Recommend the single next owner and its first bounded question or action. |
| **Defer** | A named evidence gap or external prerequisite can change the verdict. | State what would settle it and recommend only that next investigation. |

Missing evidence alone is not a Stop verdict. A Pursue verdict approves further
work on a direction; it does not certify an unmeasured runtime design or select
an API whose important questions remain unresolved.
An API that does not exist yet is design work, not an evidence gap by itself.
Stop only after the stronger change lanes also fail to justify further work.

Be blunt about the proposal, not the person. Lead with the verdict and its
strongest reason. Do not soften rejection with invented minor improvements,
balanced praise, or a menu of equally good choices.

## Recommend the next owner

Choose from routes that actually exist in the project:

- A worthwhile direction still needs its public contract chosen: the API design
  skill.
- The target is clear but adoption crosses owners or needs a proof sequence:
  the owning architecture or migration plan skill.
- The target and scope are clear, with a direct implementation and proof path:
  the task or implementation owner.
- One factual uncertainty controls the decision: the appropriate investigation
  or measurement owner, with the exact question to settle.

Verify the selected skill's path and invocation. If no matching skill exists,
describe the next job directly. Recommend one next invocation, not a mandatory
chain of review, design, plan and task skills.

A review request authorizes assessment, not downstream execution. Do not invoke
the recommended owner, create implementation plans, edit product code or publish
from a recommendation alone. If the user already authorized proceeding when the
change is worthwhile, continue that work after the verdict under the existing
task and authority; do not ask for permission again.

## Return the decision

Keep a single-proposal answer short:

1. **Stop, Pursue, or Defer**, followed by one concrete reason.
2. Current versus strongest target, with its owner and add/change/move/remove
   impact; label proposed APIs.
3. The material lanes considered, decisive source evidence, regression risk
   and proof limits. State why current-API composition beats a breaking
   alternative if it is the recommendation.
4. One copyable next invocation for Pursue or Defer; none for Stop.

An audit adds one row per selected unit with its verdict, evidence and next
owner. Rank worthwhile work and recommend the first step overall. Reuse an
existing plan or artifact when the scope needs a durable record. Do not create
a scoring system, review panel or checklist suite merely to issue this verdict.
