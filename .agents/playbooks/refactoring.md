---
extends: refactoring
when: Use it to audit or simplify Plate or Plite code ownership, such as "clean up <surface>", "simplify <package>" or a structural audit that deletes, merges, inlines or splits.
---

# Refactoring

Find, rank and, when safe, clean source-backed architecture sludge so the codebase is easier for humans and agents to understand: delete, merge, inline, simplify, or split only when the split earns its keep. The Routing table in `AGENTS.md` sends public call shapes to `best-api`, adoption to the Plan playbook, performance to `benchmark`, bugs to the Bug fix playbook and closure to the Babysit playbook. A cleanup that removes behavior is a hard cut: it runs through the Build playbook per the architecture reference's Hard cut (`.agents/playbooks/references/architecture.md`).

- **Before** "Pin the behavior contract first": set the authority. Audit (`audit`, review, explain, plan, or a read-only delegation) inspects, ranks and routes candidates and writes only plan and evidence artifacts. Implement (implement, execute, change, fix, cleanup) applies only packets that pass the packet law. A loop or a timebox controls repetition and never grants mutation authority. A delegating supervisor keeps its plan and scope; return findings to it.
- **Replace** "Pin the behavior contract first": run the **how** skill over the affected subsystem to learn the contract. Pin behavior only where no existing test or type covers it, per `AGENTS.md`'s Tests rule, with one public-boundary test or an equivalence check that runs before any structure moves. No snapshots.
- **Before** "Name the structure the code is missing": find and rank candidates per the Candidates section below, and record them in the candidate ledger before choosing what to move.
- **In** "Name the target shape": the split law overrides size-based split advice, including pstack's thermo-nuclear review. Do not split because a file is large. Split only when the new owner has durable behavior or proof ownership, a stable specific name, a focused proof command, source-owner oracle or test ownership when relevant, and lower navigation cost. A split that adds hops without clearer ownership is merged back, inlined or rejected. File count is not architecture quality.
- **In** "Move in small behavior-preserving steps": in implement mode, apply a cleanup only when it is behavior-neutral, changes no public API or product UX, has a narrow owner and focused proof, repairs the source-owner oracle when ownership moves, and ends keep, revert or quarantine in the same loop. A scale-sensitive owner also needs its frozen pre-packet receipt and an exact post-packet rerun with the correctness guard; a slower, nonlinear or inconclusive receipt reverts or quarantines the packet. Focused proof comes first; run the broad gate after several packets or import churn. Never leave speculative cleanup dirty.
- **After** "Confirm the change is worth keeping": stop and hand off when the next action is a public API, runtime or product architecture decision, the best cleanup needs owner review, proof needs unavailable browser, device or credential state, every candidate is kept, deferred or rejected with a reason, or a VISION gap blocks confident cleanup. Do not stop at the first plausible candidate.
- **Replace** "Rebase into small ordered commits": leave commits to the owner, per `AGENTS.md`'s Delivery rule, and name the subtraction, reshape and follow-on slices in the report so they can be committed in that order. Open a PR only when the user asks.
- The reply also reports the source roots inspected, candidate count and top recommendation, decision counts, navigation-score changes, packets applied with their keep, revert or quarantine result, proof run, scale receipts or source-backed N/A, rejected and deferred candidates, and the next owner with its first command or file.

## Candidates

Use the repo's vocabulary: model, operations, runtime, DOM and input, selection, history, browser proof, packages, benchmarks and public API for Plite; plugins, wrappers, components, kits, registry, app-facing docs and product UX for Plate. Read `docs/analysis/editor-architecture-candidates.md` only when the surface is editor architecture and current source does not settle it.

Inspect at least five candidate areas unless the prompt names a smaller surface. A candidate needs concrete friction: a shallow wrapper or pass-through module, duplicated branching, helpers, proof or selector logic, a vague name hiding the owner, public/private confusion, an over-broad barrel, an orphan test or stale oracle, tests forced through internals, copied browser or proof logic, one behavior spread across too many files, aliases and compatibility paths the current API should not keep, stale docs or tests after ownership moved, or tests asserting old file locations. Apply `pstack:principle-subtract-before-you-add` and `pstack:principle-minimize-reader-load`, then rank each candidate on four tests:

1. **Deletion:** deleting it makes complexity disappear (shallow) or spreads it across callers (earning its keep).
2. **Navigation:** the files, owners and proof commands an agent touches to understand or fix one behavior.
3. **Interface depth:** callers learn less while behavior and proof become more local.
4. **VISION fit:** a cleanup outside `VISION.md`, or missing reusable taste, first records that taste in the smallest Vision owner; an unresolved call shape routes to `best-api`.

A candidate whose owner runs per node, plugin, subscriber, listener, render, query or DOM unit gets Benchmark's embedded probe with the performance pack before ranking; a behavior-neutral label does not prove scale neutrality.

Record candidates in the active plan or a `docs/analysis/**` artifact:

| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

- Navigation score: files to read for one behavior, owners touched for one bug, proof clarity, public/private boundary clarity, and the net effect (easier, same or worse).
- Strength: `Strong` (source-backed friction, clear owner and proof, durable payoff), `Worth exploring` (real signal, shape or payoff needs a plan) or `Speculative`.
- Decision: `delete`, `merge`, `inline`, `simplify`, `split`, `keep`, `defer`, `reject` or `plan`.

Every row names files, facts, owner, proof path and action; never a menu of generic refactors.

## Module design

Prefer deep modules: a small public interface, meaningful behavior behind it, a clear owner, and natural tests through that interface. A module earns its keep when callers gain leverage and maintainers gain locality. When a candidate changes module shape:

- Interface test: every method, option, invariant, ordering constraint, error mode, config rule and performance expectation is part of what callers must learn. A smaller learned surface wins when behavior stays honest.
- Depth test: a large implementation is fine when the caller-facing interface is small and stable. A shallow wrapper with nearly the same interface as its implementation is deleted, merged or inlined.
- Adapter test: one adapter is usually hypothetical structure; two real adapters can justify an interface boundary.
- Test-surface test: if useful tests must punch through the public interface, the module shape is probably wrong.
- Side-effect test: prefer accepting dependencies and returning results over hidden construction and ambient mutation when that makes behavior easier to test.
