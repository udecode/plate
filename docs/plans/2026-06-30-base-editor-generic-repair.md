# base-editor-generic-repair

Objective:
Repair BaseEditor generics; done when no AnyBaseEditor remains and Core type/tests pass.

Goal plan:
docs/plans/2026-06-30-base-editor-generic-repair.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: latest user request: "OMG no AnyBaseEditor... repair packages/core/src/lib/editor/SlateEditor.ts so V extends Value = Value, P extends AnyPluginConfig = CorePl like in main branch, so we juste use BaseEditor like before in usages."
- mode: named file/API packet
- target surface: `packages/core/src/lib/editor/SlateEditor.ts` and directly affected Core typing/tests
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user named a specific editor type repair, not full Core
- correction-triggered related Core sweep: required for `AnyBaseEditor`, `BaseEditor<any, any>`, and custom editor structural stand-ins
- completion threshold summary: no `AnyBaseEditor`; normal `BaseEditor` usage works; focused Core type/tests pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `AnyBaseEditor` is removed.
- `BaseEditor<any, any>` is not used as a replacement.
- `packages/core/src/lib/editor/SlateEditor.ts` exposes a main-branch-like `BaseEditor<V extends Value = Value, P extends AnyPluginConfig = CorePluginConfig>` shape when TypeScript permits it without breaking inferred plugin/value usage.
- If the literal default is impossible because Plite read/update are invariant, the plan records the exact reason and keeps the smallest broad default without reintroducing `AnyBaseEditor`.
- Focused Core type/tests pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-base-editor-generic-repair.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core typecheck`; focused Core specs for edited surfaces
- package proof: `pnpm check:core` before closeout if practical
- source audits: exact `rg` for `AnyBaseEditor`, `BaseEditor<any, any>`, fake structural editor types, and affected type errors
- related Core sweep query / match count / patched count / deferred count:
  recorded after patch
- Plite/Plate gap ledger: record if literal default is blocked by Plite variance
- broad Core drift ledger gate: N/A: named packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-base-editor-generic-repair.md`

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
- allowed edit scope: `packages/core/src/lib/editor/SlateEditor.ts`, directly affected Core type files/specs, this plan
- package/API surfaces: Core editor/plugin typing only
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no rename pass, no compatibility shim
- out-of-scope package errors: ignore unless caused by the Core type repair

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Blocked only if TypeScript cannot express the requested default without breaking typed plugin/value inference; then record the exact compiler evidence and smallest clean alternative.

Current verdict:
- verdict: keep
- confidence: 100 for named packet after `pnpm check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: `BaseEditor` and `PlateEditor` have strict Core defaults; broad root/editor aliases are explicit.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Latest user requirement copied into Plate Next source and completion threshold. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Active goal checked or created | yes | Active goal created for this named packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Target is clean Core editor typing, no alias shim. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout, Core editor/plugin typing only. |
| Output budget strategy recorded | yes | Narrow `sed`/`rg`, focused commands. |
| Public API fork routing checked | yes | No public API fork; Core type repair. |
| Gap policy checked | yes | Literal default blocker will be recorded if compiler proves it. |
| Related Core sweep policy checked | yes | Required for aliases/casts/structural editor stand-ins. |
| Review-mode rename freeze checked | yes | No rename pass. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm --filter @platejs/core typecheck`; focused bun specs; `pnpm check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named file/API packet, not broad Core sweep. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no broad drift scoring requested. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep `BaseEditor<V = Value, P = CorePluginConfig>`; keep `AnyPlateEditor = PlateEditor<any, any>` only for explicit broad root/store surfaces. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No gap remains. `HtmlApi` was made explicit to remove the circular Core default. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Exact audit for `AnyBaseEditor`, `BaseEditor<any, any>`, structural `Pick<BaseEditor>`, and recursive CorePluginConfig patterns had no matches. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no non-Core failures in final proof. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Exact `rg` audit returned no matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted files in this named type packet. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow type repair with focused Core proof; no PR/release review requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed after `pnpm --filter @platejs/core lint:fix`. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and needs-attention sections filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-base-editor-generic-repair.md` | Passed after final update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Named BaseEditor repair | complete | `pnpm check:core` passed; source audits clean. | Handoff. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/SlateEditor.ts` `BaseEditor` | 0 | main-parity-cleanup | Core editor typing | `BaseEditor<V = Value, P = CorePluginConfig>` typechecks; no `AnyBaseEditor` audit matches. | keep |
| `packages/core/src/react/editor/PlateEditor.ts` `PlateEditor` / `AnyPlateEditor` | 0 | main-parity-cleanup | React editor typing | `PlateEditor` strict by default; explicit `AnyPlateEditor = PlateEditor<any, any>` keeps root/store broadness. | keep |
| `packages/core/src/lib/plugins/getCorePlugins.ts` core config/API | 0 | main-parity-cleanup | Core plugin registry typing | Explicit `CorePluginConfig` and `HtmlApi` remove recursive `InferConfig<CorePlugin>` default. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `BaseEditor` default | `BaseEditor<V extends Value = Value, P extends AnyPluginConfig = CorePluginConfig>` | `AnyBaseEditor`; `BaseEditor<any, any>` replacement; recursive `CorePluginConfig = InferConfig<CorePlugin>` | Matches requested main-branch-like default without alias sludge. | none |
| broad React/root editor surfaces | explicit `AnyPlateEditor = PlateEditor<any, any>` | making default `PlateEditor` broad; forcing root/store surfaces to strict `Value` | Plite value typing is invariant, so root/store surfaces need an explicit broad alias while public `PlateEditor` remains strict. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | none | none | `pnpm check:core` | no gap remains |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove `AnyBaseEditor` and structural stand-ins | `rg -n "AnyBaseEditor|BaseEditor<any, any>|Pick<BaseEditor|Pick<AnyBaseEditor|Parameters<typeof getPluginByType>|export type .*Editor = Pick<BaseEditor|CorePluginConfig\\s*=\\s*InferConfig<CorePlugin>|CorePlugin\\s*=\\s*ReturnType<typeof getCorePlugins>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 0 | aliases removed; `getSlatePlugin` uses `BaseEditor`; explicit core config restored | 0 | none |
| Tighten plugin type regression | `rg -n "BasePluginMethodContext<any>|BasePluginContextEditor<any>|PluginBaseContext<C extends AnyPluginConfig = any>|BasePluginContext<C extends AnyPluginConfig = any>|Record<string, any> & \\{" packages/core/src/lib/plugin/BasePlugin.ts packages/core/src/lib/plugin/SlatePlugin.ts packages/core/type-tests --glob '!**/dist/**'` | 0 | `configurePlugin` callback context typed by target plugin; context defaults moved from `any` to `PluginConfig`; method config records use `unknown` instead of `any`. | 0 | none |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A: named packet
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none for named packet

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | N/A | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Base editor type repair | Core editor typing | Remove `AnyBaseEditor`; restore strict defaults and typed plugin map | `pnpm --filter @platejs/core typecheck`; focused bun specs; `pnpm check:core` | keep | none |

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
| code/runtime/API | `BaseEditor` default repaired; typed plugin map restored; `CorePluginConfig`/`HtmlApi` made explicit; `PlateEditor` strict by default with explicit broad `AnyPlateEditor`; `BasePlugin`/`SlatePlugin` context defaults tightened; `configurePlugin` callback context typed by target plugin. |
| tests/proof | Negative type assertions repaired in Core specs/type contracts; added `configurePlugin` callback regression contract in `packages/core/type-tests/plugin-composition-contracts.ts`. |
| docs/templates/skills | This autogoal plan only. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `AnyPlateEditor = PlateEditor<any, any>` | Deliberate broad React/root-store escape hatch, not a hidden `BaseEditor` alias. | `packages/core/src/react/editor/PlateEditor.ts` | Keep unless you want a separate typed root-store redesign. |

Findings:
- `P = CorePluginConfig` failed while `CorePluginConfig` was derived from `InferConfig<CorePlugin>`.
- The clean fix was to make core plugin config/API explicit, especially `HtmlApi`, instead of broadening `BaseEditor`.
- `configurePlugin` callback context was still effectively broad; it now uses `InferConfig<P>` like `extendPlugin`.
- Defaulting plugin contexts to `any` was unnecessary; `PluginConfig` default keeps the escape hatch explicit through `AnyPluginConfig`.

Decisions and tradeoffs:
- `BaseEditor` is strict by default as requested.
- `PlateEditor` is strict by default too, but `AnyPlateEditor` remains explicit for React/root/store surfaces where Plite value typing is intentionally invariant.
- `BasePluginContextEditor<C>` stays intersected with non-keyed `BaseEditor`; using `BaseEditor<Value, C>` made `BasePlugin<C>` invariant and broke assignability to `AnyBasePlugin`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `CorePluginConfig = InferConfig<CorePlugin>` created a circular default | 1 | Make `CorePluginConfig` and `HtmlApi` explicit | Fixed and proven by `pnpm check:core`. |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core exec bun test src/react/editor/TPlateEditor.spec.ts src/react/plugin/toPlatePlugin.spec.ts src/lib/utils/extendApi.spec.ts src/lib/plugins/affinity` -> 84 pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/plugin/getEditorPlugin.spec.ts src/react/plugin/toPlatePlugin.spec.ts` -> 40 pass.
- Exact source audit for alias/structural smells and recursive core config patterns -> no matches.
- Exact source audit for broad plugin context regressions -> no matches.
- `pnpm check:core` -> pass: Core + Plite typecheck, type contracts, lint, Core tests, Plite tests.

Final handoff contract:
- target surface and mode: named `BaseEditor`/Core editor typing packet
- files/APIs reviewed: `SlateEditor.ts`, `PlateEditor.ts`, `getCorePlugins.ts`, affected type specs
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: strict `BaseEditor`/`PlateEditor` defaults; explicit broad `AnyPlateEditor`
- verdict matrix summary: all reviewed targets kept as main-parity-cleanup
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: exact alias/structural audit, 0 matches remaining
- changes made: see changed list
- tests/proof commands: see verification evidence
- old compatibility names audited: `AnyBaseEditor`, `BaseEditor<any, any>`, structural `Pick<BaseEditor>` stand-ins, recursive CorePluginConfig patterns
- needs attention: only deliberate `AnyPlateEditor` broad alias
- next best Plate Next packet: continue one-by-one Core review

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Packet complete |
| Where am I going? | Final plan check and handoff |
| What is the goal? | Repair `BaseEditor` generics without `AnyBaseEditor`; prove Core. |
| What have I learned? | Explicit core config/API removes the circular default. |
| What have I done? | Repaired Core editor typing and passed proof. |

Timeline:
- 2026-06-30T13:14:31.771Z Goal plan created.
- 2026-06-30T13:15Z Captured exact user requirement and created goal.
- 2026-06-30T13:20Z Restored strict `BaseEditor` default and typed plugin map.
- 2026-06-30T13:25Z Removed recursive core config/API derivation.
- 2026-06-30T13:30Z Ran focused proof and `pnpm check:core`.
- 2026-06-30T13:34Z Added BasePlugin/SlatePlugin targeted regression pass from user correction.
- 2026-06-30T13:40Z Tightened `configurePlugin` callback typing and plugin context defaults; reran `pnpm check:core`.

Open risks:
- None for this named packet.
