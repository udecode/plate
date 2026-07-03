# plate-next BasePlugin drift review

Objective:
Deep-review `packages/core/src/lib/plugin/BasePlugin.ts` against `origin/main`, fix safe Plate/Plite drift, and prove the named-file packet.

Goal plan:
docs/plans/2026-07-03-plate-next-baseplugin-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked whether `packages/core/src/lib/plugin/BasePlugin.ts`
  has zero drift regression vs main and is fully clean under `plate-next`
- mode: named file/API drift review
- target surface: `packages/core/src/lib/plugin/BasePlugin.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, user named one file
- correction-triggered related Core sweep: yes, only for same-class smells
  introduced or touched by this packet
- completion threshold summary: source-map current `BasePlugin.ts` to
  `origin/main`, classify accepted Plite-era cuts vs accidental regression,
  patch safe type/API drift, run focused Core proof, close plan.

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
- initial confidence score: 80 before source map
- improvement loop: patch only concrete named-file drift; no broad Core sweep
- final score / loop closure: 100 after second-pass patch and proof

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Named `BasePlugin` drift review | complete | source map, legacy audit, focused tests, typecheck, and lint passed |

Completion threshold:
- Named packet is done when `BasePlugin.ts` has a source-backed verdict against
  `origin/main:packages/core/src/lib/plugin/BasePlugin.ts`, no concrete
  regression remains in the reviewed file, any same-class correction sweep is
  recorded, focused tests/typecheck/lint pass, and this plan passes
  `check-complete`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-baseplugin-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: likely `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts` plus any affected BasePlugin-adjacent tests discovered by the source map
- package proof: `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core lint`
- source audits: `rg` for legacy transform/getTransforms/plugin.transforms/API
  names in `BasePlugin.ts` and direct same-class callers
- related Core sweep query / match count / patched count / deferred count:
  partial-config/fake-generic/context audit reviewed; legacy-name audit 0 / 0 /
  0; bridge audit 0 / 0 / 0
- Plite/Plate gap ledger: N/A unless proof exposes missing Plite or Plate
  plugin typing capability
- broad Core drift ledger gate: N/A, named-file packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-baseplugin-drift-review.md`

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
- allowed edit scope: `BasePlugin.ts`, directly coupled type tests/specs or
  internal helpers only if required by a safe fix, and this plan
- package/API surfaces: Core plugin type surface and Plite extension/tx typing
  only
- docs/browser surfaces: N/A
- non-goals: broad Core cleanup, rename pass, Plate package sweep, public API
  redesign, runtime behavior migration outside this file
- out-of-scope package errors: non-Core package failures unless they prove a
  Core public API regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- None currently.

Current verdict:
- verdict: patched type drift, then keep current BasePlugin shape
- confidence: 100 for the named file
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: old Slate transform/context surfaces are cut, Plite extension/tx
  inference is covered by type contracts, nested plugin partial config is fixed,
  fake extension input generics are cut, and no forbidden runtime bridge caps
  this file.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact target, no duration, no broad sweep, proof and handoff captured above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before review |
| Active goal checked or created | yes | this plan created from `plate-next` template |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | target surface recorded above |
| Broad Core drift ledger initialized when in scope | N/A | broad Core sweep not in scope |
| Source of truth and allowed workspace recorded | yes | current checkout plus `origin/main:packages/core/src/lib/plugin/BasePlugin.ts` |
| Output budget strategy recorded | yes | targeted reads and capped `rg` output |
| Public API fork routing checked | yes | no public API fork planned unless source map exposes one |
| Gap policy checked | yes | no local workaround if Plite/Plate gap appears |
| Related Core sweep policy checked | yes | same-class sweep after correction |
| Review-mode rename freeze checked | yes | no rename pass in this packet |

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
| Named verification threshold | yes | Run the proof commands named in this plan | focused tests, package typecheck, and lint passed |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | named-file packet; broad Core sweep explicitly out of scope |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | reviewed file scored 0 drift risk / 100 confidence; no high-drift row |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | keep current BasePlugin as Plite-era plugin method surface; reject old transforms/tf compat |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no Plite/Plate gap found |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | same-class audit recorded for partial config, fake generics, context `any`, legacy names, and bridge caps |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck`, focused bun tests, and lint passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core proof failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | exact legacy-name audit returned no matches in plugin/type-test scope |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename proposed |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/lib/plugin packages/core/type-tests` returned 0 rows |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | tiny type-surface packet with focused proof; no separate autoreview needed |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-baseplugin-drift-review.md` | will run after this update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugin/BasePlugin.ts` imports and config split | 0 | main-parity-cleanup | Core plugin API | old base/static plugin primitives moved to `SlatePlugin.ts`; `BasePlugin.ts` now owns plugin methods, parser/render handlers, extension/tx typing | keep |
| `BasePluginContextEditor.update` | 0 | keep-in-plate | Core plugin API | exposes Plite `editor.update` plus plugin tx groups without `editor.tf` or `transforms` | keep |
| `BasePluginMethods.extendExtension` | 0 | keep-in-plate | Core plugin API | infers Plite extension api/state/tx groups through `EditorInstalled*Groups`; type contracts passed | keep |
| `BasePluginMethods.extendApi` / `extendEditorApi` | 0 | keep-in-plate | Core plugin API | preserves plugin-scoped API vs root editor API split; override/literal type contracts passed | keep |
| `BasePluginMethods.extendTx` / `extendTxGroup` | 0 | keep-in-plate | Core plugin API | preserves own plugin tx and cross-plugin tx groups; type contracts passed | keep |
| `BasePluginConfig.node` | 2 -> 0 | main-parity-cleanup | Core plugin API | fixed dropped plugin config from `BasePlugin['node']`; now preserves `PluginConfig<K, Partial<O>, A, Tx, S, State>` | keep |
| `BasePluginMethodConfig` / `BasePluginMethodConfigFromPlugin` | 2 -> 0 | main-parity-cleanup | Core plugin API | fixed partial nested API/selectors config with `Deep2Partial` / `Partial`; type contract added | keep |
| `PlateEditorExtension` / `PlateEditorExtensionInput` | 1 -> 0 | hard-cut | Core plugin API | removed unused fake generic; updated `createBasePlugin.ts` normalizer | keep |
| `BasePluginContextEditor.update` context | 1 -> 0 | main-parity-cleanup | Core plugin API | replaced `EditorUpdateContext<any>` with default `EditorUpdateContext`; stronger Plate editor generic failed because Plite context owns Plite editor type | keep |
| old Slate transform/context surface | 0 | hard-cut | Core plugin API | exact audit found no `InferTransforms`, `extendTransforms`, `editor.tf`, `getTransforms`, `getPluginApi`, `normalizeInitialValue`, or `aboveSlate?:` in target/type-test scope | keep cut |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `BasePlugin.ts` | keep current Plite-era type surface after type cleanup | old `transforms`, `tf`, `getTransforms`, `getPluginApi`, `aboveSlate`, `normalizeInitialValue`, bridge adapters, fake extension generics, full-object nested config requirements | it is a type-method owner, not a runtime dumping ground; focused contracts prove API and tx inference | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no gap found | no workaround needed | N/A | focused Core proof passed | keep |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| partial config cleanup | `rg -n "Partial<BasePlugin\\['node'\\]>|api\\?: InferApi<|selectors\\?: InferSelectors<" packages/core/src/lib/plugin packages/core/type-tests --glob '!**/dist/**'` | 2 remaining create-time full-shape inputs | 1 file | 0 | remaining hits in `createBasePlugin.ts` are initial plugin creation inputs, not nested/partial reconfiguration |
| fake extension generic cleanup | `rg -n "PlateEditorExtension<|PlateEditorExtensionInput<" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 0 | 2 files | 0 | none |
| update context cleanup | `rg -n "EditorUpdateContext<any>" packages/core/src/lib/plugin packages/core/type-tests --glob '!**/dist/**'` | 0 | 1 file | 0 | attempted stronger `EditorUpdateContext<BaseEditor<Value, C>>`, rejected by typecheck because Plite owns the context editor type |
| legacy compat audit | `rg -n "aboveSlate\\?:|normalizeInitialValue\\?:|InferTransforms|extendTransforms|extendEditorTransforms|getTransforms\\b|getPluginApi\\b|editor\\.tf\\b|plugin\\.transforms\\b|@platejs/slate" packages/core/src/lib/plugin packages/core/type-tests --glob '!**/dist/**'` | 0 | 0 | 0 | none |
| bridge-cap audit | `rg -n "currentRuntimeBridge|currentRuntimeCommandStore|runtimeTxExtensions" packages/core/src --glob '!**/dist/**'` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: N/A, named-file packet
- Manifest command: N/A
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
| `packages/core/src/lib/plugin/BasePlugin.ts` | 0 | keep-in-plate | Core plugin API | named-file review and proof passed | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `BasePlugin` drift review | plate-next | possible drift from main after Plite/tx migration | reviewed `BasePlugin.ts`, `SlatePlugin.ts`, type tests; patched type drift; ran focused tests/typecheck/lint | keep patched packet | next named file review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/plugin packages/core/type-tests` returned 0 rows | no extracted files in scope | command output empty |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core failures | scoped Core proof passed | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `BasePlugin.ts` partial config typing, extension input generic cut, update context cleanup; `createBasePlugin.ts` extension input normalizer type |
| tests/proof | `plugin-composition-contracts.ts` nested partial API/selectors type contract |
| docs/templates/skills | updated this plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | no user review needed for `BasePlugin.ts` | second pass found and fixed type drift; remaining shape is clean under current Plate Next law | `packages/core/src/lib/plugin/BasePlugin.ts` | keep patched shape |

Findings:
- `BasePlugin.ts` is not literally main-equivalent, but the drift is the
  intended Plite migration: old static plugin primitives moved to
  `SlatePlugin.ts`, old `transforms` became `tx`, and the plugin method surface
  now infers Plite extensions.
- Concrete type drift found and fixed: nested plugin reconfiguration was too
  strict for partial API/selectors, `node` config dropped the plugin config,
  and extension input had fake generics.

Decisions and tradeoffs:
- Keep the current split: `SlatePlugin.ts` owns base/static plugin config
  primitives; `BasePlugin.ts` owns the plugin method/API/tx/extension surface.
- Do not resurrect old `transforms`/`tf`/`getTransforms` compatibility.
- Do not patch remaining `any` occurrences that are legitimate dynamic plugin,
  React, or extension-boundary types.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried `EditorUpdateContext<BaseEditor<Value, C>>` | 1 | use Plite's default update context instead | failed typecheck because `EditorUpdateContext` is parameterized over Plite's base editor, not Plate's `BaseEditor` |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts` passed: 24 tests, 0 failures.
- `pnpm --filter @platejs/core typecheck` passed, including package, test, and type-test projects.
- `pnpm --filter @platejs/core lint` passed.
- Exact legacy-name audit in plugin/type-test scope returned no matches.
- Same-class type-drift audits returned no fake extension generics, no
  `Partial<BasePlugin['node']>`, no `EditorUpdateContext<any>`, and only
  intentional create-time full-shape inputs in `createBasePlugin.ts`.
- Extracted-file inventory for plugin/type-test scope returned 0 untracked rows.

Final handoff contract:
- target surface and mode: named-file Plate Next review of `BasePlugin.ts`
- files/APIs reviewed: `BasePlugin.ts`, coupled `SlatePlugin.ts`, plugin type-test contracts
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: keep patched `BasePlugin.ts`
- verdict matrix summary: keep-in-plate / hard-cut old transform compat
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: type-drift audits patched, legacy audit 0/0/0, bridge audit 0/0/0
- changes made: `BasePlugin.ts`, `createBasePlugin.ts`, `plugin-composition-contracts.ts`, plan
- tests/proof commands: focused bun tests, package typecheck, package lint
- old compatibility names audited: transforms/tf/getTransforms/getPluginApi/normalizeInitialValue/aboveSlate/@platejs/slate
- needs attention: none
- next best Plate Next packet: next user-selected Core file/API

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after named-file proof |
| Where am I going? | Final handoff after check-complete |
| What is the goal? | Prove whether `BasePlugin.ts` is clean vs main under Plate Next |
| What have I learned? | `BasePlugin.ts` is intentionally migrated, but the first pass missed concrete type drift |
| What have I done? | Source map, type patches, same-class audits, focused tests, typecheck, lint, plan update |

Timeline:
- 2026-07-03T15:19:35.587Z Goal plan created.
- 2026-07-03T15:40Z Read `plate-next`, `BasePlugin.ts`, `SlatePlugin.ts`, and current plan.
- 2026-07-03T15:48Z Audited old transform/Slate compat names and extracted files.
- 2026-07-03T15:52Z Ran focused tests, package typecheck, and lint successfully.
- 2026-07-03T15:58Z First pass recorded keep verdict.
- 2026-07-03T16:10Z Second pass found and patched partial config / fake generic / context type drift.
- 2026-07-03T16:18Z Re-ran focused tests, package typecheck, lint, and same-class audits successfully.

Open risks:
- None for this named-file packet. This does not claim a broad Core sweep.
