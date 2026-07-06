# execute plite react runtime cleanup

Objective:
Execute Plite React runtime cleanup; done when Plate keyboard bridge is cut and focused proof passes.

Goal plan:
docs/plans/2026-07-04-execute-plite-react-runtime-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted `docs/plans/2026-07-04-plite-react-runtime-cleanup-plan.md` and said `go`
- mode: accepted Plite Plan execution through a named Plate Next cleanup packet
- target surface: `packages/core/src/react/plugins/react/ReactPlugin.ts`, direct specs/callers, and related Plite React runtime proof
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A; user accepted one Plite React runtime cleanup plan, not a full Core sweep
- correction-triggered related Core sweep: required after each removed bridge/API symbol
- completion threshold summary: `PlateKeyboardApi`, `onPlateReactKeyDown`, and dead `editor.api.keyboard` bridge removed; direct dead bridge proof removed or replaced; no stale bridge matches; focused Core/Plite package proof passes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: one-shot execution of accepted plan
- initial confidence score: N/A; concrete source-audit and test threshold is stronger here
- improvement loop: patch one bridge cleanup packet, sweep direct symbols, run focused proof
- final score / loop closure: pass/fail proof plus source-audit closure

Completion threshold:
- Done when the accepted Plite React runtime plan is executed for the named
  packet: the Plate React keyboard bridge is gone, no direct
  `PlateKeyboardApi` / `onPlateReactKeyDown` / `editor.api.keyboard` bridge
  matches remain, no compatibility replacement API is added, and focused proof
  passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-execute-plite-react-runtime-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  - `pnpm --filter @platejs/core exec bun test src/react/plugins/react/ReactPlugin.slow.tsx` before deletion only if still present or useful
  - `pnpm --filter @platejs/core test` focused to changed Core specs when a wrapper exists
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm turbo typecheck --filter=./packages/plite-react`
- package proof: Core and Plite React typecheck; focused tests when direct bridge tests remain or replacement coverage is needed
- source audits:
  - `rg -n 'PlateKeyboardApi|onPlateReactKeyDown|api\\.keyboard|editor\\.api\\.keyboard' packages/core/src packages/plite-react/src packages/plite-react/test --glob '!**/dist/**'`
  - `rg -n 'ReactPlugin|SlateReactExtensionPlugin' packages/core/src packages/plite-react/src packages/plite-react/test --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  record after source audit
- Plite/Plate gap ledger: expected N/A unless source proof reveals missing Plite React API
- broad Core drift ledger gate: N/A; named packet, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-execute-plite-react-runtime-cleanup.md`

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
- allowed edit scope: `packages/core/src/react/plugins/react/**`, direct imports/exports/tests, `packages/plite-react/**` only if focused proof reveals missing Plite-owned API, and this plan
- package/API surfaces: remove dead Plate bridge only; do not create public compat aliases, reset APIs, or public `Editable onCommand`
- docs/browser surfaces: N/A unless implementation exposes stale docs; no browser route changed in this packet
- non-goals: broad Plate runtime migration, broad Core sweep, file renames, `_memo`, Plate auto-scroll, public command callback design
- out-of-scope package errors: non-Core package errors are out of scope unless current Core/API change causes them

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if deleting the Plate bridge exposes a required Plite React public API decision not already covered by the accepted plan and no safe bridge-free implementation remains.

Current verdict:
- verdict: execute
- confidence: 0.91 before edits
- next owner: plate-next
- keep / revert / quarantine call: keep after focused proof
- reason: accepted plan says bridge is dead and source audit should prove no real callers

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | accepted plan path and `go`: execute bridge deletion, no implementation beyond accepted scope |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned none; execution goal created |
| Mode classified as named packet vs broad Core sweep | yes | named packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | cut dead bridge; no compat replacement |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not in scope |
| Source of truth and allowed workspace recorded | yes | accepted plan + live repo root evidence |
| Output budget strategy recorded | yes | targeted source reads and exact `rg` audits only |
| Public API fork routing checked | yes | no new public reset/onCommand/API fork in this packet |
| Gap policy checked | yes | gap ledger N/A unless deletion reveals missing Plite React API |
| Related Core sweep policy checked | yes | exact bridge symbol audit required after edit |
| Review-mode rename freeze checked | yes | no file rename planned |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: top sections in this plan.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: `ReactPlugin` keyboard bridge -> `cut`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence: no replacement API target.
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
- [x] `pnpm brl` is run when exports/barrels change. N/A: no exported files or barrels changed.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | focused Core spec, Core tests, Core typecheck, Plite React typecheck, Core lint all pass |
| Broad Core drift ledger coverage | no | N/A: named accepted-plan packet, not broad Core sweep | broad Core rows marked N/A in ledger below |
| Score gate | yes | Prove inspected files are owned/fixed/deferred in the plan ledger | no high drift remains in inspected target; bridge removed |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | `ReactPlugin` remains DOM adapter only; keyboard bridge hard-cut |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: Plite React already owns keyboard/default runtime and React APIs needed for this cut |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | exact bridge symbol sweeps returned zero stale matches |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core tests 701 pass; Core + Plite React typecheck pass |
| Non-Core package error triage | no | N/A: no proof command reported non-Core failures | none |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | stale bridge audits returned zero matches |
| Rename ledger | no | N/A: no rename proposed or applied | none |
| Extracted-file inventory | no | N/A: no new extracted/untracked Core file introduced; one dead spec deleted | no Added/Deleted rename soup |
| Autoreview / review | no | N/A: focused accepted-plan packet; scoped proof stronger than a broad review here | no separate autoreview run |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | changed list and needs attention filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-execute-plite-react-runtime-cleanup.md` | passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Execute accepted Plite React cleanup | complete | bridge removed, dead spec deleted, stale-symbol sweeps clean, focused proof passed | final checker and handoff |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/plugins/react/ReactPlugin.ts` | 0 | main-parity-cleanup / hard-cut bridge | Plate React adapter | removed `PlateKeyboardApi`, `onPlateReactKeyDown`, and handler install; keeps `toPlatePlugin(DOMPlugin, { key: 'dom' })` | keep |
| `packages/core/src/react/plugins/react/ReactPlugin.slow.tsx` | 0 | hard-cut | none | deleted dead bridge-only tests for removed API | keep deletion |
| `packages/core/src/lib/editor/withPlite.spec.ts` | 0 | main-parity-cleanup | Core plugin ordering test | removed assertion that Core DOM plugin exposes dead `onKeyDown` bridge; retained plugin install/order assertions | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plate React plugin | Keep `ReactPlugin` as a DOM-plugin React adapter only | `editor.api.keyboard`, `onPlateReactKeyDown`, `PlateKeyboardApi`, public reset/onCommand replacement | Plite React owns editable keyboard/default runtime; bridge had no real callers outside its own test | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none for this packet | N/A | N/A | Core + Plite React proof passed | no Plite/Plate gap blocks deletion |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| remove keyboard bridge | `rg -n 'PlateKeyboardApi|onPlateReactKeyDown|api\\.keyboard|editor\\.api\\.keyboard' packages/core/src packages/plite-react/src packages/plite-react/test --glob '!**/dist/**'` | 0 after patch | 3 files changed | 0 | none |
| remove dead keyboard spec | `rg -n 'ReactPlugin\\.slow|keyboard shortcuts' packages/core/src packages/plite-react/src packages/plite-react/test --glob '!**/dist/**'` | 0 after patch | 1 file deleted | 0 | none |
| keep ReactPlugin adapter | `rg -n 'ReactPlugin' packages/core/src packages/plite-react/src packages/plite-react/test --glob '!**/dist/**'` | expected adapter/order/import matches only | 0 further patches | 0 | name remains as current Plate owner |

Core drift ledger:
- Applies: no; named accepted-plan packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none in named packet

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | broad Core sweep not requested | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| P1 | Plate Next | Plate React keyboard bridge is dead and Plite React owns the runtime path | `ReactPlugin.ts`, deleted `ReactPlugin.slow.tsx`, updated `withPlite.spec.ts`; proof commands below | keep | next packet can review remaining Plate React plugin cleanup if desired |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no new extracted file introduced | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `rg -n 'withPlite|ReactPlugin|keyboard shortcuts' packages/core/src packages/core/test packages/core/type-tests` | included non-existent `packages/core/test` path | command-shape miss only; rerouted to real `packages/core/src` / focused proof | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `ReactPlugin` no longer installs `editor.api.keyboard` keydown bridge |
| tests/proof | deleted dead bridge-only slow spec; removed stale `onKeyDown` assertion from `withPlite.spec.ts` |
| docs/templates/skills | execution plan updated only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `ReactPlugin` remains as DOM adapter | The name is still legacy-ish, but rename is explicitly out of this packet | `packages/core/src/react/plugins/react/ReactPlugin.ts` | accept for now; handle rename only in a later rename pass |

Findings:
- Source audit after patch found zero stale `PlateKeyboardApi`,
  `onPlateReactKeyDown`, `api.keyboard`, or `editor.api.keyboard` matches in
  Core/Plite React.
- Remaining `ReactPlugin` matches are expected adapter/order/import references.

Decisions and tradeoffs:
- Cut the Plate keyboard bridge instead of moving it to Plite. Plite React
  already owns keyboard/default runtime behavior.
- Do not add replacement reset or command callback APIs in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` included missing `packages/core/test` | 1 | use existing `packages/core/src` / package commands | rerouted; no product issue |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`
  -> 29 pass.
- `pnpm --filter @platejs/core test` -> 701 pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm turbo typecheck --filter=./packages/plite-react` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- stale-symbol audits listed in related Core sweep ledger -> zero stale
  bridge matches.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-execute-plite-react-runtime-cleanup.md`
  -> pass.

Final handoff contract:
- target surface and mode: named accepted-plan execution for Plate React bridge
- files/APIs reviewed: `ReactPlugin.ts`, `ReactPlugin.slow.tsx`, `withPlite.spec.ts`, direct imports/callers
- broad Core drift score coverage: N/A, named packet
- best Plate v2 recommendation: keep `ReactPlugin` as DOM adapter; cut keyboard bridge
- verdict matrix summary: hard-cut bridge/spec; main-parity cleanup for plugin-order spec
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above, zero stale bridge matches
- changes made: bridge removed, dead spec deleted, stale test assertion removed
- tests/proof commands: focused Core spec, Core tests, Core/Plite React typecheck, Core lint
- old compatibility names audited: `PlateKeyboardApi`, `onPlateReactKeyDown`, `api.keyboard`, `editor.api.keyboard`
- needs attention: only `ReactPlugin` naming, deferred by rename freeze
- next best Plate Next packet: continue reviewing remaining Core React plugin/runtime surfaces, especially plugin names only after behavior/API diff is stable

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Final checker and handoff |
| What is the goal? | Execute the accepted Plite React runtime cleanup packet |
| What have I learned? | Bridge was local dead API; Plite React already owns runtime keyboard path |
| What have I done? | Removed bridge/spec, updated stale Core test assertion, ran proof |

Timeline:
- 2026-07-04T23:05:03.625Z Goal plan created.
- 2026-07-05T00:00:00Z Goal created and checkpoint zero filled.
- 2026-07-05T00:00:00Z Removed Plate keyboard bridge and dead slow spec.
- 2026-07-05T00:00:00Z Focused Core spec, Core tests, Core/Plite React typecheck, and Core lint passed.

Open risks:
- Low: `ReactPlugin` name stays for review stability. Rename belongs in a later accepted rename pass, not this packet.
