---
extends: refactoring
when: Use it to audit or simplify Plate or Plite code ownership, such as "clean up <code surface>", "simplify <package>" or a structural audit that deletes, merges, inlines or splits code; retiring docs goes to `research` instead.
---

# Refactoring

Clean source-backed architecture sludge (delete, merge, inline, simplify, or split only when earned). Route public call shapes -> `best-api`, adoption -> Plan, perf -> `benchmark`, bugs -> Bug fix, closure -> Babysit, behavior removal (hard cut) -> Build (`.agents/playbooks/references/architecture.md`).

- **Before** "Pin the behavior contract first": set authority. Audit writes only plan/evidence artifacts; Implement applies only packets passing packet law. Loops/timeboxes never grant mutation authority.
- **Replace** "Pin the behavior contract first": run `how` on the subsystem; pin only uncovered boundaries (`tests.md`) with one public-boundary test or equivalence check. No snapshots.
- **Before** "Name the structure the code is missing": find, rank and record candidates per Candidates.
- **In** "Name the target shape": **split law** overrides size-based split advice (including `pstack:thermo-nuclear-code-quality-review`). Split only for durable behavior/proof ownership, specific name, focused proof, oracle/test ownership and lower navigation cost; else merge or inline back.
- **In** "Move in small behavior-preserving steps": **packet law** requires behavior-neutrality, unchanged public API/UX, narrow owner + focused proof, updated source-owner oracle and in-loop keep/revert/quarantine. Scale-sensitive owners need frozen pre/post benchmark receipts + correctness guard (slower/nonlinear/inconclusive reverts or quarantines). Run focused proof first, broad gates after import churn. Never leave speculative cleanup dirty.
- **After** "Confirm the change is worth keeping": stop and hand off if the next step is a public API/runtime/product call, needs owner review or unavailable browser/device/creds, all candidates are resolved, or a VISION gap blocks cleanup.
- **Replace** "Rebase into small ordered commits": land via `node .agents/pstack/land.mjs`, naming subtraction/reshape/follow-on slices in body and `## Close` (roots, counts, nav deltas, packet verdicts, proof/scale receipts, rejected/deferred, next owner).

## Package review and sync

`plate-next <target>` runs read-only (`architecture.md#audit`) against Plate v2; `plate-next sync [package]` reviews and repairs one package or all live Plate packages (`packages/platejs`, `packages/test`). Public call shapes -> `best-api`; adoption -> Plan.

- `origin/main` is behavior/ownership evidence, never the API/filename target; drop legacy aliases, shims and `with*` glue. Do owner-driven internal renames/merges/deletes in-packet (recommend read-only); reject cosmetic churn.
- Freeze scope to named package + minimal foundation blocker; report outside matches as hints.
- Build per-file checkbox manifest (`architecture.md#audit`) before repairs; check a file only with zero regressions vs `origin/main` and sound ownership. Never advance with unchecked rows (`sweep`/`all plate`/`full review` cover every foundation file).
- **Sync:** one `docs/plans/` file (`work_kind: verification`, `review_basis: []`, package scopes), one package at a time until zero rows stay unchecked/deferred (`verification` never adopts a Pursue).
- **Proof:** focused tests first, then `pnpm check:core`, `pnpm typecheck platejs`, `pnpm --filter platejs test`, `pnpm --filter platejs build` on export/type/foundation edits. Never start `apps/www` unless targeting docs/UI/examples.

## Candidates

Plite: model, ops, runtime, DOM/input, selection, history, browser proof, packages, benchmarks, public API. Plate: plugins, wrappers, components, kits, registry, docs, UX. Inspect >=5 areas unless narrowed (`docs/research/sources/editor-architecture/candidates.md` only if source is inconclusive). Rank concrete friction (`pstack:principle-subtract-before-you-add`, `pstack:principle-minimize-reader-load`) on Deletion, Navigation, Interface depth and VISION fit; hot per-node/render/DOM owners run Benchmark's embedded probe first. Ledger: `| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |`.

## Module design

Prefer deep modules with natural boundary tests; reject shallow pass-throughs, split ownership, duplicate paths, importable internals, hand-synced lists, single-adapter abstractions and ambient mutation.
