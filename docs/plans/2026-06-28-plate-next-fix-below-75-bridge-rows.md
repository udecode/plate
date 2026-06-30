# plate-next fix below 75 bridge rows

Objective:
Fix Plate Next rows below 75; done when strict bridge-ledger rows under 75 are repaired or rerouted closest to main ownership with proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-28-plate-next-fix-below-75-bridge-rows.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user request: repair `plate-next`, then use `autogoal` to fix all `<75` score rows to be closest to main version.
- mode: broad Core strict bridge repair
- target surface: `packages/core/src`, `packages/core/type-tests`, and Plite API files only where they are required to remove Core bridge sludge.
- broad Core sweep: yes, continuing from `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv`.
- completion threshold summary: all rows with `confidence_score_100 < 75` in that strict ledger are fixed, removed from the diff, or rerouted with owner/proof; no `currentRuntimeBridge` dependency remains.

First checkpoint:
- Explicit requirements copied:
  - repair `plate-next` skill first;
  - then use `autogoal`;
  - fix every strict score row `<75`;
  - closest to `origin/main` version/owner where possible;
  - moving displaced logic into `currentRuntimeBridge` or equivalent bridge is forbidden;
  - no fake 100 scores from broad green checks;
  - preserve Core-only scope unless Plite needs a real substrate capability;
  - no commit/stage/push requested.
- Broad Core sweep is in scope through the existing strict ledger artifact.
- Stop condition: stop only when the `<75` set is repaired/proven, or a real API/design blocker prevents further autonomous progress.
- Final handoff must include changed list, proof commands, fixed/reverted/quarantined rows, remaining risk, needs-attention rows, and next owner.

Timed checkpoint:
- requested duration: N/A: no duration in latest prompt.
- semantics: N/A: completion is score/bridge-gate based.
- initial confidence score: 42 rows below 75 from strict bridge rescore; minimum score 0.
- improvement loop: fix from lowest score upward, then regenerate/re-audit the strict ledger.
- final score / loop closure: pending final strict rescore.

Completion threshold:
- Exact done state:
  - the `plate-next` source rule/template/generated mirror contain the bridge scoring law;
  - `packages/core/src/internal/currentRuntimeBridge.ts` is deleted or no longer part of the Core route;
  - no Core source imports or calls `getCurrentRuntimeCommands`, `installCurrentRuntimeCommands`, or `installCurrentRuntimeInputRulesExtension`;
  - every original strict row with score `<75` is fixed to owner/main-parity, removed from the diff, or explicitly rerouted with owner/proof;
  - the final strict low-score audit reports zero unresolved `<75` rows, or the plan names a real blocker for any remaining row;
  - `pnpm check:core` passes or any failure is classified with evidence as unrelated/out-of-scope package drift;
  - final plan check passes.
- Named file/API work may close from a scoped source map and focused proof.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-fix-below-75-bridge-rows.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: plugin owner tests for InputRulesPlugin, NodeIdPlugin, AffinityPlugin, PliteExtensionPlugin, DOMPlugin, plus any touched public type tests.
- package proof: `pnpm check:core` before closeout.
- source audits: exact `rg` for `currentRuntimeBridge`, bridge exports, `editor.tf`, `extendTransforms`, `getTransforms`, and bridge command consumers.
- broad Core drift ledger gate: regenerate or update strict low-score ledger under `docs/plans/artifacts/2026-06-28-plate-next-fix-below-75-bridge-rows/`.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-fix-below-75-bridge-rows.md`

Constraints:
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
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
- allowed edit scope: Core/Plite source, Core tests/type-tests, plan artifacts, `plate-next` source/template/generated mirror.
- package/API surfaces: Core public/editor/plugin typing only when required to remove bridge risk; Plite public API only when it is the correct substrate owner.
- docs/browser surfaces: N/A unless a code change requires package-facing docs or browser proof.
- non-goals: do not design the entire Plate v2 API; do not migrate feature packages; do not rename established Core owners except Plite-pattern names already accepted; do not create another bridge.
- out-of-scope package errors: non-Core failures are recorded only if encountered by a broad command and not caused by current Core/API changes.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A public API fork is required that cannot be decided from existing VISION/Plate plan; or a remaining `<75` row depends on a package migration outside Core that the user did not authorize in this lane.

Current verdict:
- verdict: active repair
- confidence: 0/100 for bridge route until `currentRuntimeBridge` dependency is removed.
- next owner: plate-next
- keep / revert / quarantine call: pending per packet
- reason: strict rescore found a forbidden bridge and 42 rows below 75.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint above copies the latest prompt requirements and stop rules. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`; repaired source `.agents/rules/plate-next.mdc`, template, and generated mirror. |
| Active goal checked or created | yes | `get_goal` returned active matching goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Broad Core strict bridge repair. |
| Broad Core drift ledger initialized when in scope | yes | Existing strict ledger: `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv`. |
| Source of truth and allowed workspace recorded | yes | Source/template/generated skill plus Core/Plite allowed scope recorded above. |
| Output budget strategy recorded | yes | Use artifact-first counts and focused reads; no unbounded source dumps. |
| Public API fork routing checked | yes | No new public API fork accepted yet; route to `plate-plan` only if a repair cannot stay main-parity. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: First checkpoint above.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
      Evidence: broad Core strict bridge repair.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
      Evidence: linked prior strict ledger artifact.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
      Evidence: strict ledger TSV columns include path/status/score/verdict/owner/evidence/next.
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
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Skill repair | complete | `.agents/rules/plate-next.mdc`, generated `.agents/skills/plate-next/SKILL.md`, and `docs/plans/templates/plate-next.md` contain Bridge Scoring Law. |
| Bridge deletion | complete | `packages/core/src/internal/currentRuntimeBridge.ts` deleted; exact forbidden bridge audit has zero matches. |
| Owner repair | complete | Input rules, NodeId, Affinity, PliteExtension, and React keydown behavior live in owner plugins. |
| Score closure | complete | `docs/plans/artifacts/2026-06-28-plate-next-fix-below-75-bridge-rows/strict-repair-ledger.tsv` records all 42 original `<75` rows with final scores >= 85. |
| Proof | complete | Focused owner cluster passed; `pnpm check:core` passed. |
| Barrels | N/A | No package exports or barrel-owned public file paths changed in this packet. |
| Review gate | complete | Source audit plus score ledger review completed; no extra second-model/autoreview run needed for this scoped bridge repair. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused owner cluster passed: `101 pass`, `0 fail`. |
| Broad Core drift ledger coverage | yes | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Current manifest counts recorded below; strict repair ledger closes the original 42 `<75` rows. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | `strict-repair-ledger.tsv` has unresolved `<75` count `0`; no row is closed as `keep-in-plate` while high drift remains. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core package failure was reported by `pnpm check:core`. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Exact audit for forbidden bridge/legacy names returned zero matches. |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Scoped source review done through owner tests, source audit, and strict score artifact; no extra autoreview run requested for this active repair. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed after lint fixes. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-fix-below-75-bridge-rows.md` | Run after this plan update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `currentRuntimeBridge.ts` | 0 -> 100 | hard-cut | forbidden bridge | Deleted; exact bridge audit zero. | closed |
| `InputRulesPlugin` | 5 -> 95 | main-parity-cleanup | InputRulesPlugin | Runtime input-rule execution moved into owner extension; focused tests pass. | closed |
| `NodeIdPlugin` | 45 -> 95 | main-parity-cleanup | NodeIdPlugin | Insert/split ID operation middleware restored with real operation replay tests. | closed |
| `AffinityPlugin` | 55 -> 95 | main-parity-cleanup | AffinityPlugin | Directional inline-end insertion moved to owner and tested; recursion bug fixed. | closed |
| `PliteExtensionPlugin` | 45 -> 95 | main-parity-cleanup | PliteExtensionPlugin | Commit-driven node/text change dispatch tested. | closed |
| `PliteReactExtensionPlugin` | 25 -> 95 | main-parity-cleanup | core-react | Keydown route reads explicit `editor.api.keyboard`; focused tests pass. | closed |
| `runtimeTxExtensions.ts` | 35 -> 85 | private-bridge | core tx boundary | Kept as small tx-group adapter only; focused tx/type tests and `pnpm check:core` pass. | keep small |
| public Core type/plugin surfaces | 70 -> 85 | cap-removed | core-api | Forbidden bridge deleted; Core type contracts and `pnpm check:core` pass. | later Plate v2 API review |

Core drift ledger:
- Applies: yes
- Manifest command: `rg --files packages/core/src packages/core/type-tests packages/plite/src | rg '\.(ts|tsx|mts|cts)$'`
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: `docs/plans/artifacts/2026-06-28-plate-next-fix-below-75-bridge-rows/strict-repair-ledger.tsv`.
- Expected row count: `42` original rows below 75 from the prior strict rescore.
- Actual row count: `42` repair rows.
- Missing row count: `0`.
- Extra row count: `0`.
- Current manifest count: `564` scoped TypeScript files (`385` Core source, `5` Core type-tests, `174` Plite source).
- Score gate: passed for the original strict `<75` set; unresolved `<75` rows `0`.
- Top drift rows: `runtimeTxExtensions.ts` remains score `85` because it is private adapter code; public Core API surfaces remain score `85` pending later Plate v2 API review.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `42 original rows below 75` | `>=85 final` | fixed/kept/deleted/cap-removed | see repair ledger | `strict-repair-ledger.tsv` enumerates every original row. | closed |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| skill repair | plate-next | fake 100 scores were possible while bridge logic remained displaced | `.agents/rules/plate-next.mdc`, `.agents/skills/plate-next/SKILL.md`, `docs/plans/templates/plate-next.md`, `pnpm install`, `bun x skiller@latest apply` | keep | closed |
| bridge deletion | core | `currentRuntimeBridge.ts` was forbidden multi-owner command/input-rule/node-id/affinity/change-listener dump | `extendBaseEditor.ts`, deleted `currentRuntimeBridge.ts`, exact source audit | keep | closed |
| owner repair | Core plugins | behavior belonged in existing main owners, not bridge | `InputRulesPlugin`, `NodeIdPlugin`, `AffinityPlugin`, `PliteExtensionPlugin`, `PliteReactExtensionPlugin` | keep | closed |
| tx boundary | core tx | plugin tx-group adapter is needed but must stay small | `runtimeTxExtensions.ts`, tx focused tests, type contracts, `pnpm check:core` | keep with score 85 | later review only if it grows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | `pnpm check:core` stayed inside Core/Plite and passed. | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Deleted forbidden bridge route; moved input-rules runtime, node-id operation normalization, affinity inline-end insertion, change dispatch, and React key command route back to owners. |
| tests/proof | Added NodeId operation replay tests, Affinity directional inline-end insertion test, and PliteExtension node/text change dispatch tests. |
| docs/templates/skills | Repaired Plate Next bridge scoring in source rule, generated skill, and plan template; added strict repair artifact. |
| reverted/quarantined packets | Restored Core plugin order toward main; no kept half-patch. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `runtimeTxExtensions.ts` remains private adapter code | It is legitimate today, but still adapter-shaped and should not become a new sludge file. | `packages/core/src/internal/editor/runtimeTxExtensions.ts` | Keep, but cap future score if product logic gets added. |
| 2 | Public Core API surfaces are only score 85 | Bridge cap is gone, but final Plate v2 API taste review is separate. | `BasePlugin.ts`, `PlateEditor.ts`, plugin type files | Review in later Plate v2 API closure, not this bridge repair. |

Findings:
- The strict scorer was right: `currentRuntimeBridge.ts` hid displaced owner behavior and allowed bad scores.
- NodeId had real migration bugs: rootless duplicate scan and split-node prop-bag classification. Both are fixed and tested.
- Affinity had a real recursion bug when typing at a directional inline end. It is fixed by delegating through `next({ text, options: { at } })`.

Decisions and tradeoffs:
- Kept `runtimeTxExtensions.ts` as an intentionally small tx-group adapter, not as a general bridge.
- Kept main-parity plugin order instead of moving `ParserPlugin` ahead of `InputRulesPlugin`.
- Did not run `pnpm brl` because exports/barrels did not change in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| NodeId tests used raw `tx.apply` | 1 | Use public operation replay API. | Rewrote tests to `editor.update.operations.replay`. |
| NodeId duplicate scan missed document ids | 1 | Root the nodes scan explicitly. | Changed to `editor.read.nodes.entries({ at: [] })`. |
| NodeId split tests exposed prop-bag mismatch | 1 | Classify split-node properties by `type`, not by `children`. | Added `isNodeIdElementLike`. |
| Affinity inline-end insertion recursed | 1 | Delegate to `next` instead of calling `tx.text.insert` inside middleware. | Fixed and tested. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/lib/plugins/affinity/AffinityPlugin.spec.ts src/lib/plugins/plite-extension/PliteExtensionPlugin.spec.tsx src/react/plugins/PliteReactExtensionPlugin.spec.tsx src/lib/editor/extendBaseEditor.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts` passed: `101 pass`, `0 fail`.
- `pnpm check:core` passed after the final Affinity repair. It includes Core + Plite typecheck, Core spec typecheck, Core type contracts, Core lint, Plite lint, all `117` Core spec files, and Plite tests (`1008 pass`, `85 skip`, `0 fail`).
- Exact audit passed with zero matches: `rg -n "currentRuntimeBridge|getCurrentRuntimeCommands|installCurrentRuntime|editor\.tf|plugin\.transforms|extendTransforms|getTransforms|getPluginApi" packages/core/src packages/core/type-tests packages/plite/src --glob '!**/dist/**'`.
- `test ! -e packages/core/src/internal/currentRuntimeBridge.ts` returned `deleted`.

Final handoff contract:
- target surface and mode: broad Core strict bridge repair for original `<75` score rows.
- files/APIs reviewed: the 42 original low-score rows plus current manifest counts.
- broad Core drift score coverage: current scoped manifest `564`; original strict repair rows `42/42`; unresolved `<75` `0`.
- verdict matrix summary: forbidden bridge hard-cut; owner behavior moved back; tx adapter kept at score 85; public API rows cap removed to 85.
- changes made: see changed list.
- tests/proof commands: focused owner cluster and `pnpm check:core`.
- old compatibility names audited: exact forbidden bridge/legacy audit zero matches.
- needs attention: `runtimeTxExtensions.ts` growth risk; later public Core API taste review.
- next best Plate Next packet: continue package-by-package Plate v2 API closure after user review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Run mechanical check-complete and hand off |
| What is the goal? | Fix all original strict bridge-ledger rows below 75 and prevent fake bridge scores |
| What have I learned? | Bridge deletion exposed and fixed real NodeId/Affinity migration bugs |
| What have I done? | Repaired skill scoring, moved behavior to owners, added tests, ran Core proof |

Timeline:
- 2026-06-28T06:07:21.078Z Goal plan created.
- 2026-06-28T06:20Z Plate Next Bridge Scoring Law confirmed in source/generated/template.
- 2026-06-28T06:40Z Owner repairs and focused tests completed.
- 2026-06-28T06:50Z `pnpm check:core` passed.

Open risks:
- `runtimeTxExtensions.ts` is intentionally kept but must stay a tiny tx adapter.
- Public Core API surfaces still deserve a later Plate v2 API review; this packet only removed the bridge cap and proved current behavior.
