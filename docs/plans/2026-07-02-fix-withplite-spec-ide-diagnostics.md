# fix withPlite spec IDE diagnostics

Objective:
Fix IDE TypeScript diagnostics for `packages/core/src/lib/editor/withPlite.spec.ts` by making the file belong to the correct Core test-aware TS project.

Goal plan:
docs/plans/2026-07-02-fix-withplite-spec-ide-diagnostics.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user report: "`packages/core/src/lib/editor/withPlite.spec.ts` has many type errors in ide"
- mode: named file/API packet
- target surface: Core TS project ownership for `withPlite.spec.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; targeted config/spec ownership fix only
- correction-triggered related Core sweep: TS project ownership audit for Core specs and root project inclusion
- completion threshold summary: `withPlite.spec.ts` has zero diagnostics under Core test config and inferred-style checks; root `tsconfig.json` does not own the spec; focused spec test, Core package typecheck, `check:core`, and plan check pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: 80; package test config was clean, but root TS project crashed and could poison IDE
- improvement loop: tried source-config ownership, rejected because it pulled broad unrelated spec debt into the source lane; kept source/test split and removed root spec ownership
- final score / loop closure: 96; current proof is green, remaining risk is stale VS Code TS server cache

Completion threshold:
- Done when root `tsconfig.json` no longer owns `withPlite.spec.ts`, `packages/core/tsconfig.test.json` owns it, focused TS diagnostics for the file are zero, focused Bun tests pass, Core typecheck passes, `check:core` passes, and the autogoal plan completes.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-fix-withplite-spec-ide-diagnostics.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`; TypeScript API diagnostics for `withPlite.spec.ts`; `pnpm exec tsc --project packages/core/tsconfig.test.json --noEmit --pretty false`
- package proof: `pnpm --filter @platejs/core typecheck`
- source audits: parse root/Core tsconfigs to prove root does not own package specs and Core test config owns the target spec
- related Core sweep query / match count / patched count / deferred count: `tsconfig.json`, `packages/core/tsconfig.json`, and `packages/core/tsconfig.test.json` parsed for target file ownership; root false, Core source false, Core test true; patched two selection point reads in target file
- Plite/Plate gap ledger: N/A; no Plite runtime/API gap
- broad Core drift ledger gate: N/A; named config packet only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-fix-withplite-spec-ide-diagnostics.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: `packages/core/tsconfig.json`, root `tsconfig.json`, this plan, and only `withPlite.spec.ts` if actual diagnostics prove source mistakes
- package/API surfaces: Core test/typecheck project ownership only
- docs/browser surfaces: none
- non-goals: broad Core migration, runtime/API refactor, full root TypeScript crash repair beyond excluding package tests from root ownership
- out-of-scope package errors: any unrelated package type errors outside Core/Plite

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- If VS Code still shows diagnostics after configs and proof are green, the remaining action is TS server reload or stale IDE cache, not source migration.

Current verdict:
- verdict: keep
- confidence: 96
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Core test config and inferred-style diagnostics are clean; root no longer owns the spec; focused and package proof passed.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Diagnose IDE diagnostics | complete | Core test diagnostics were initially clean; root project owned package specs and root TypeScript crashed; actual target source errors were optional point reads in expected selection objects | keep root spec exclusions and required point reads |
| Patch target | complete | `withPlite.spec.ts` uses `{ required: true }` for autoSelect expected start/end points | keep |
| Verify | complete | TS API target diagnostics 0; inferred-style diagnostics 0; focused spec 27 pass; Core typecheck passed; `check:core` passed | close |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan copies the named file and IDE diagnostic target. |
| `plate-next` skill/rule read | yes | Skill read before work in this goal. |
| Active goal checked or created | yes | Active goal created for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named TS project ownership packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | No runtime/API compatibility change in scope. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Current checkout, Core/root TS configs. |
| Output budget strategy recorded | yes | Targeted config reads and capped diagnostics. |
| Public API fork routing checked | N/A | No public API fork. |
| Gap policy checked | yes | No Plite/Plate gap; tooling ownership issue. |
| Related Core sweep policy checked | yes | Sweep TS ownership for Core specs/root project. |
| Review-mode rename freeze checked | N/A | No renames. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `core-test diagnostics 0`; `inferred-style diagnostics 0`; focused spec 27 pass |
| Broad Core drift ledger coverage | N/A | Not a broad Core sweep | N/A |
| Score gate | N/A | Not a broad Core sweep | N/A |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep Core source/test split; root must not own package specs; use required point reads |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A; no Plite/Plate runtime gap |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Parsed root/Core source/Core test configs; target ownership now root=false, core source=false, core test=true |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` passed; `pnpm check:core` passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | None in final proof |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | No compatibility names cut |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename |
| Extracted-file inventory | N/A | Record untracked/extracted file command, row count, and bucket for every file in scope | No extracted files |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | Small config/spec typing packet; `check:core` used as stronger gate |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm exec biome check ...` passed; `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-fix-withplite-spec-ide-diagnostics.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/withPlite.spec.ts` expected autoSelect selections | 0 | keep | Core test | Changed `state.points.start/end([])` to `state.points.start/end([], { required: true })` so expected ranges are typed as real points | keep |
| `tsconfig.json` package spec ownership | 1 | keep | root tooling | Root excludes `packages/**/src/**/*.spec.*`, `*.test.*`, `*-contract.*`, and `*.slow.*`; parsed config has `withPlite.spec.ts` false | keep |
| `packages/core/tsconfig.json` source/test split | 0 | keep | Core tooling | Core source config excludes specs; full test ownership stays in `tsconfig.test.json`; package typecheck passed | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `withPlite.spec.ts` IDE diagnostics | Root project must not own package specs; Core test config owns actual spec typing; point reads use `{ required: true }` when constructing expected ranges | Moving all Core specs into source `tsconfig.json`; broad test-suite typing cleanup inside this packet; casts around expected selection | Keeps source lane green and fixes the actual target without hiding undefined points | No |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No Plite/Plate runtime capability missing | No local workaround needed | N/A | N/A | N/A |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Target spec point-read correction | Parse `tsconfig.json`, `packages/core/tsconfig.json`, `packages/core/tsconfig.test.json` for `withPlite.spec.ts` ownership | 3 configs | 2 files patched (`tsconfig.json`, `withPlite.spec.ts`) | 0 | Root `tsc -p tsconfig.json` still has a known TS6 debug crash outside this packet, but the target file is no longer in that project |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| spec point-read typing | plate-next | Expected `Range` was assembled from optional point reads | `packages/core/src/lib/editor/withPlite.spec.ts`; focused TS diagnostics/test | keep | none |
| root spec ownership | plate-next | Root TS project should not own package specs and poison IDE diagnostics | `tsconfig.json`; parsed config ownership audit | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/lib/editor/withPlite.spec.ts` uses required point reads for expected autoSelect ranges; no runtime API change |
| tests/proof | `tsconfig.json` no longer includes package spec/test/contract/slow files in root project |
| docs/templates/skills | goal plan updated |
| reverted/quarantined packets | rejected making `packages/core/tsconfig.json` own all specs because it pulled unrelated test typing debt into source typecheck |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Reload TS server if VS Code still shows old errors | Current CLI and TS API diagnostics are clean; IDE can keep stale project state | VS Code command: TypeScript: Restart TS Server | Do that before assuming source is still wrong |
| 2 | Root `tsc -p tsconfig.json` crash remains outside this packet | Root project still crashes TypeScript 6 when run broadly; target spec is excluded, so it no longer owns these diagnostics | `tsconfig.json` root project | Separate tooling cleanup lane if root `tsc` should become a supported command |

Findings:
- Core `tsconfig.test.json` and an inferred-style TypeScript program report zero diagnostics for `withPlite.spec.ts`.
- Root `tsconfig.json` previously owned package specs; it now excludes package spec/test/contract/slow files.
- `packages/core/tsconfig.json` should stay source-only. Moving all Core specs into it is too broad and reopens unrelated test typing debt.

Decisions and tradeoffs:
- Keep the Core source/test split.
- Do not cast the expected autoSelect selections; use required point reads because the document is known non-empty in this test.
- Do not solve the known root TypeScript 6 debug crash here; keep this packet scoped to the target IDE diagnostic.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried making `packages/core/tsconfig.json` include all specs | 1 | Restore source/test split and keep specs out of root | Reverted; package typecheck green again |

Verification evidence:
- `pnpm exec tsc --project packages/core/tsconfig.test.json --noEmit --pretty false` passed.
- TypeScript API diagnostics for `withPlite.spec.ts` under `packages/core/tsconfig.test.json`: `0`.
- TypeScript API inferred-style diagnostics for `withPlite.spec.ts`: `0`.
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts` passed: 27 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm check:core` passed.
- `pnpm exec biome check packages/core/src/lib/editor/withPlite.spec.ts packages/core/tsconfig.json tsconfig.json docs/plans/2026-07-02-fix-withplite-spec-ide-diagnostics.md` passed before final plan edits; final code/config files were checked by `check:core`.

Final handoff contract:
- target surface and mode: named Core TS/IDE diagnostics packet
- files/APIs reviewed: `withPlite.spec.ts`, `tsconfig.json`, `packages/core/tsconfig.json`, `packages/core/tsconfig.test.json`
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: keep source/test split; root must not own package tests; no casts for expected ranges
- verdict matrix summary: keep all changes
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: parsed 3 TS configs; patched 2 files; deferred 0 in target scope
- changes made: root package test excludes; required point reads in `withPlite.spec.ts`; plan update
- tests/proof commands: see Verification evidence
- old compatibility names audited: N/A
- needs attention: restart TS server if stale IDE errors remain
- next best Plate Next packet: separate root TypeScript 6 crash cleanup only if root `tsc -p tsconfig.json` should become supported

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed packet |
| Where am I going? | Final handoff |
| What is the goal? | Fix `withPlite.spec.ts` IDE diagnostics |
| What have I learned? | Root package-spec ownership caused IDE risk; source config must stay source-only |
| What have I done? | Patched root test ownership and spec point-read typing |

Timeline:
- 2026-07-02T16:03:17.636Z Goal plan created.
- 2026-07-02: Reproduced clean focused diagnostics, found root project ownership/crash risk, rejected broad source-config spec ownership, patched target spec and root package-test excludes, ran focused and Core proof.

Open risks:
- VS Code may need TypeScript server reload to drop stale diagnostics.
- Root `tsc -p tsconfig.json` still has a known TypeScript 6 debug crash outside this packet; the target spec is no longer included there.
