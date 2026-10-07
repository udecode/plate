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
- The plan's `## Close` also reports the source roots inspected, candidate count and top recommendation, decision counts, navigation-score changes, packets applied with their keep, revert or quarantine result, proof run, scale receipts or source-backed N/A, rejected and deferred candidates, and the next owner with its first command or file.

## Package review and sync

`plate-next <package, file or API path>` runs this playbook read-only with the architecture reference's Audit against the Plate v2 target, and repairs only when the request asks. `sync` is an execution mode, not a status summary: `plate-next sync <package>` reviews that package and repairs its findings; `plate-next sync` with no argument does the same for every live Plate package, `packages/platejs` and `packages/test`. Public call-shape forks go to `best-api`, and adoption plans to the Plan playbook.

- Use `origin/main` as evidence, not as the final API target. Preserve user-visible behavior unless a breaking change is part of the accepted Plate v2 direction, and preserve the existing Plate owner when that owner still describes the product concern. Never keep an old API shape, alias, shim, wrapper or `with*` glue because `origin/main` had it.
- `origin/main` is behavior and ownership evidence, not a veto on the best current path or filename. Compare the current owner, name and role with it before suggesting renames, deletions or new owner topology.
- Implementation topology is not frozen. A repair request renames, moves, merges or deletes internal files, helper exports and test filenames in the same packet when that restores owner truth or removes a one-use split; a read-only review recommends those moves instead. Reject cosmetic synonym churn, but complete owner-driven merge/delete/rename work in the active packet.
- Treat new plugins and public concepts as API decisions. They go through `best-api`, while internal colocation, helper deletion and owner-accurate file and test names belong to the current cleanup packet.
- Prefer merging into the existing owner or a hard cut over restoring a one-use migration split.

For a package, do not treat `plate-next packages/<name>` as permission to sweep the repo or move to the next package.

- Freeze scope to the named package plus the smallest Plite/Plate foundation owner needed to remove a blocker found in that package. Do not silently turn a package review into a repo-wide migration. A correction's related-surface sweep is mandatory, but it is not permission to update unrelated packages, docs, examples, or generated surfaces, and a hard cut found in one package lands package by package unless the user names the broader scope.
- Before repairs, build the package manifest as the architecture reference's Audit describes and materialize one checkbox per reviewed file in the plan. A row is checked only when its file has no behavior regression versus `origin/main`, no type regression, and the ownership the lens and Vision require. Anything else stays unchecked with a concrete reason and next action.
- Do not move to the next package until every file is either checked or explicitly deferred for user review with reason, owner, and proof needed.
- `sweep`, `all plate`, `full-loop`, `full review` and similar broad Plate foundation requests mean a review of every foundation source file, each with its manifest row, never a sample.
- The handoff lists the out-of-scope matches discovered; they are routing hints, not permission to patch them. Failures in packages outside the named scope are out-of-scope drift unless the current change caused them.

Sync:

1. Keep one plan under `docs/plans/` with `work_kind: verification`, `review_basis: []` and the packages' review scopes, and one section per queued package holding its manifest and findings.
2. Process one package at a time, building its manifest before repairs as above, and repair each finding; never start the next package while the active one has unchecked or deferred rows.
3. Close each package with the proof below. The plan's front matter and `Status:` are its ledger history; `work_kind: verification` never adopts a Pursue.
4. Sync finishes when the plan has no unchecked or deferred row. A blocked package stays open in the plan and blocks the all-done claim.

Proof:

```bash
pnpm check:core
pnpm turbo typecheck --filter=./packages/platejs
pnpm --filter platejs test
pnpm --filter platejs build
```

Use package-local focused tests first and broader gates only when exports, the public type surface or the foundation/Plite owner change. Never start `apps/www` from a package review unless the target is docs, registry UI or examples.

## Candidates

Use the repo's vocabulary: model, operations, runtime, DOM and input, selection, history, browser proof, packages, benchmarks and public API for Plite; plugins, wrappers, components, kits, registry, app-facing docs and product UX for Plate. Read `docs/research/sources/editor-architecture/candidates.md` only when the surface is editor architecture and current source does not settle it.

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

- Red flags: screen the shape against pstack's `architect/references/design-red-flags.md`, which covers shallow modules, pass-through methods, split ownership, two ways to do one task, importable internals and hand-synced lists.
- Adapter test: one adapter is usually hypothetical structure; two real adapters can justify an interface boundary.
- Test-surface test: if useful tests must punch through the public interface, the module shape is probably wrong.
- Side-effect test: prefer accepting dependencies and returning results over hidden construction and ambient mutation when that makes behavior easier to test.
