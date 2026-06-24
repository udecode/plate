# Plate v2 API Conflict Plan

Objective:
Close Plate v2 API conflict plan; done when score >=0.92, conflict ledger and boundary gates pass.

Goal plan:
docs/plans/2026-06-22-plate-v2-api-conflict-plan.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Completion threshold:
- Produce a reviewable Plate v2 API conflict plan, not implementation.
- Source-discover overlapping runtime, plugin, package, docs, and example surfaces from the current checkout.
- Define the minimal breaking changes needed so Plate stops conflicting with Plite APIs.
- Keep Plite substrate owned by Plite and Plate product APIs owned by Plate.
- No public compatibility aliases, public shims, or public migration wrappers.
- Private bridges are allowed only with owner, deletion gate, proof route, and no public export/docs.
- Plan closure needs score >=0.92, no dimension below 0.85, complete Plite/Plate boundary map, complete API conflict ledger, minimal breaking-change matrix, concrete public API target, bridge deletion gates, proof matrix, objection ledger, and final user-review handoff.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-plan.md` must pass before goal completion.

Verification surface:
- Source audits from current checkout over package manifests, public exports, editor runtime types, plugin extension points, legacy substrate imports, docs, and examples.
- Representative source anchors:
  - `packages/plite/src/interfaces/editor.ts:610` owns Plite `editor.api`; `:611` owns `getApi`; `:616` owns `read`; `:621` owns `update`; `:631` owns `extend`.
  - `packages/plite/src/interfaces/editor.ts:1489-1503` and `:1505-1527` prove Plite extensions can contribute `api`, `state`, and `tx`.
  - `packages/plite/src/interfaces/editor.ts:1684-1700` proves installed tx/api groups are inferred from installed extensions.
  - `packages/plite/src/core/editor-extension.ts:502-507` registers extension APIs; `:630-636` registers tx groups.
  - `packages/core/package.json:50-54` mixes new Plite packages with `@platejs/slate-legacy`; `:69-70` still depends on old upstream `slate` and `plite-dom`.
  - `packages/core/src/internal/currentRuntimeBridge.ts:1-15` imports legacy substrate; `:30-34` exports current runtime aliases to legacy implementation.
  - `packages/core/src/react/editor/PlateEditor.ts:34-61` exposes Plate `api`, `tf`, `transforms`, `getPluginApi`, `getTransforms`, and Plite-style `update` in the same type.
  - `packages/core/src/react/editor/createPlateRuntimeEditor.ts:669-724` exposes runtime `tf`, `transforms`, `getTransforms`, `getPluginApi`, options, and Plite update.
  - `packages/core/src/lib/editor/PliteEditor.ts:192-216` names a Plate product editor `PliteEditor` with Plate `api/tf/transforms`.
  - `packages/core/src/lib/plugin/SlatePlugin.ts:95-129` and `packages/core/src/react/plugin/PlatePlugin.ts:105-139` define plugin API/transforms extension points over legacy editor APIs.
  - `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts:56-99` is a Plate core feature named as Plite extension and still extends API/transforms.
  - `packages/core/src/react/editor/createPlateRuntimeEditor.ts:9723-9739` already installs `plugin.api` and `plugin.tx` through `defineEditorExtension`.
  - `packages/plate/src/index.tsx:1-7` re-exports Plate core and all `@platejs/plite` from the same top-level package.
  - `content/docs/migration/slate-to-plate.mdx:20-30` teaches `editor.tf.*` and `editor.api.*`.
- Planning-only pass: no package implementation, browser proof, or docs rewrite executed.

Constraints:
- Plate v2 may make breaking changes for best architecture, DX, performance, testability, and agent maintainability.
- Minimal breaking change means the smallest public break set that removes real overlap. It does not mean keeping aliases.
- Plite APIs win when Plate APIs overlap with the Plite substrate.
- Plate product APIs should be obvious as Plate, not disguised as Plite substrate.
- Private temporary bridges are legal only when they are not exported, not documented, and have deletion gates.
- Implementation starts only after user acceptance in a separate execution goal.

Boundaries:
- Source of truth: user prompt, root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `docs/vision/plate.md`, `.agents/rules/plate-plan.mdc`, current Plite package APIs, current Plate source/docs.
- Plite owns substrate: document model, editor read/update lifecycle, transaction groups, extension groups, DOM/React runtime primitives, history, Yjs adapter, layout substrate, browser proof harness.
- Plate owns product framework: plugins, kits, UI, registry, feature packages, editor composition, option stores, product services, docs/examples for product assembly.
- Allowed planning edit scope: this plan only.
- Non-goals: implementation, docs rewrite, package migration, public shims, compatibility aliases, final Plate v2 runtime patch before review.

First checkpoint:
- Requirements copied before source discovery:
  - use `plate-plan` planning mode;
  - define minimal breaking changes needed for Plate/Plite API conflict removal;
  - source-discover conflicts from current code;
  - keep Plite substrate owned by Plite;
  - keep Plate product APIs owned by Plate;
  - no public compat aliases or shims;
  - private bridges only with deletion gates;
  - stop with a reviewable plan, not implementation.

Output budget strategy:
- Used focused `nl -ba` owner slices and `rg -l` package counts instead of dumping full match streams.
- Excluded generated/build/vendor output where possible: `dist`, `.next`, `out`, `node_modules`, `apps/www/public/r`.
- Broad accessor count showed the change is repo-wide, so the plan uses staged owners instead of a single-file patch.

Blocked condition:
- Not blocked. The source evidence is enough to recommend a minimal break set. User review is needed only to approve the chosen public names before implementation.

Plate Plan lane state:
- plate_plan_lane_status: complete-for-review
- current_pass: verification-and-final-handoff
- current_pass_status: complete
- next_pass: user-review
- next_action: approve, revise, or reject the public API target before implementation
- final_handoff_status: ready

Current verdict:
- verdict: revise Plate public API before continuing package migration
- confidence: 0.94
- keep / cut / revise call: use Plite-native extension `api/state/tx`, cut legacy Plate transform wrappers, bridge privately only where needed
- reason: Plite already supports typed extension APIs and tx groups. A separate `editor.plate` namespace would be an extra product layer, not the minimal clean architecture.

Completion rule:
- Goal may close because the plan is reviewable, checklist is complete, source evidence is recorded, and implementation is intentionally deferred.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint section copies every explicit requirement. |
| Active goal checked or created | yes | Created goal for this plan. |
| Source of truth read before edits | yes | Read `plate-plan`, `autogoal`, root `VISION.md`, and relevant `docs/vision/**`. |
| Plite/Plate boundary surface identified | yes | Boundary rows below split Plite substrate from Plate product APIs. |
| API conflict ledger needed | yes | User requested Plate v2 API conflict plan. |
| Planning vs execution mode decided | yes | Planning mode only; no runtime implementation. |
| Browser proof needed | no | This is a planning artifact; implementation phases name later browser proof when behavior changes. |
| External research needed | no | User asked for current-code source discovery. |

Work Checklist:
- [x] Short objective plus lane outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Planning vs execution mode is explicit.
- [x] Live source grounding recorded for current implementation/API/docs claims.
- [x] Plite/Plate boundary map is complete.
- [x] API conflict ledger includes public/exported Plate runtime accessors, command surfaces, transform namespaces, plugin extension points, Plite read/update interaction points, runtime bridges, package exports, docs/examples, and legacy substrate bridges.
- [x] Minimal breaking-change matrix is complete.
- [x] Private bridges have owner, deletion gate, and proof route.
- [x] Public API target is concrete.
- [x] Runtime/default-route target is concrete.
- [x] Plugin/feature package target is concrete.
- [x] Docs/examples/registry target is concrete.
- [x] Proof matrix names focused package/app/docs commands.
- [x] Applicable implementation-skill review matrix is applied or skipped with concrete reason.
- [x] Objection ledger covers the public API, package-boundary, runtime, docs, and behavior-adjacent changes.
- [x] Scorecard recorded with evidence; total score >=0.92 and no dimension below 0.85.
- [x] Final handoff outline lists every accepted decision.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Source audit completed; `check-complete` named for final mechanical gate. |
| Plite/Plate boundary rows closed | yes | Boundary map rows all have target owner and verdict. |
| API conflict ledger closed | yes | Ledger rows all have target shape and adoption/proof answer. |
| Breaking changes accepted | review | Plan recommends breaks; user approval is the next gate before code. |
| Private bridges controlled | yes | Bridge table gives owner, deletion gate, and no-public-exposure check. |
| Package/source execution changed | no | Planning-only pass made no package source changes. |
| Docs/content changed | no | Planning-only pass made no docs content changes outside this plan. |
| Browser behavior claim | no | No runtime/browser behavior was changed or claimed. |
| Agent rules or skills changed | no | No agent rules or skills changed. |
| Autoreview for implementation changes | no | Planning-only artifact; autoreview is required in implementation closure. |
| Final user-review handoff | yes | Final response will summarize decisions and review points. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-plan.md`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Read source anchors and package counts. | intent-boundary |
| Intent, scope, boundary, non-goals | complete | Boundaries and non-goals recorded. | Plite/Plate boundary audit |
| Plite/Plate boundary audit | complete | Boundary map rows closed. | API conflict inventory |
| API conflict inventory | complete | Ledger rows closed with source anchors. | minimal breaking-change strategy |
| Minimal breaking-change strategy | complete | Break matrix closed. | runtime/performance/testability |
| Runtime, performance, testability pass | complete | Runtime target and proof matrix recorded. | docs/examples/registry |
| Docs, examples, registry pass | complete | Docs target rows closed. | research/ecosystem |
| Research/ecosystem/live-source pass | complete | Current-code source discovery completed; external research intentionally skipped. | objection ledger |
| Objection and steelman pass | complete | Objection ledger closed. | high-risk pass |
| High-risk deliberate pass | complete | Pre-mortem rows closed. | revision |
| Revision pass | complete | Target revised from separate Plate namespace to Plite-native extension `api/state/tx`. | verification/final handoff |
| Verification and final handoff gate | complete | Plan ready for user review. | user review |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.95 | Boundary keeps Plite extension `api/state/tx` as the host for Plate feature APIs instead of adding a parallel Plate root namespace. |
| Plate API/DX quality | 0.20 | 0.94 | App authors use `editor.api.<feature>` for reads/services and `editor.update(tx => tx.<feature>.*())` for mutations. |
| Runtime, performance, and testability | 0.20 | 0.92 | Runtime already installs `plugin.api` and `plugin.tx` through Plite extensions; plan removes legacy transform wrappers from public API. |
| Minimal breaking-change strategy | 0.15 | 0.94 | Break set is limited to names that collide with Plite or expose legacy substrate. |
| Product/plugin/docs/examples coherence | 0.15 | 0.92 | Plugin, docs, examples, and package rows share the same target vocabulary. |
| Research, source evidence, and proof completeness | 0.10 | 0.93 | Current-code source anchors and commands are concrete; external research correctly skipped. |
| Total | 1.00 | 0.936 | Passes >=0.92 threshold; no dimension below 0.85. |

Plite/Plate boundary map:
| Surface | Current owner | Target owner | Keep / move / cut / bridge / defer | Evidence | Verdict |
|---------|---------------|--------------|------------------------------------|----------|---------|
| `@platejs/plite` editor lifecycle | Plite | Plite | keep | `packages/plite/src/interfaces/editor.ts:610-631` | Plite keeps `api`, `getApi`, `read`, `update`, `extend`, `tx`, `state`. |
| Plate editor product runtime | Plate | Plite extension host plus Plate plugins | move-to-slate/revise | `packages/core/src/react/editor/PlateEditor.ts:34-61`; `createPlateRuntimeEditor.ts:9723-9739` | Plate plugins contribute to Plite `api/state/tx`; no separate `editor.plate` root namespace. |
| Legacy upstream Slate bridge | Plate transitional | private Plate bridge | bridge then delete | `packages/core/src/internal/currentRuntimeBridge.ts:1-34` | Allowed only inside core while migration runs; no public export/declaration. |
| `@platejs/slate-legacy` package | Public package today | private scaffold or deleted package | cut public package | `packages/core/package.json:54`; `packages/slate-legacy/package.json` inspected during package scan | Do not publish as beta product. |
| Top-level `platejs` package | Plate product facade that currently re-exports core/slate/utils | Plate product facade | curate facade exports, not consumer import churn | `packages/plate/src/index.tsx:1-9` plus internal `platejs` import audit | Plate feature packages may keep importing from `platejs`. Substrate packages and intentionally low-level code use direct `@platejs/*` owners. Fix conflicts at the facade/API boundary instead of forcing every plugin package around it. |
| `createPliteEditor` from Plate core | Plate static editor with Plite name | Plate static editor | rename | `packages/core/src/lib/editor/PliteEditor.ts:192-216`; `packages/plate/src/index.tsx:2` | Rename to `createPlateStaticEditor`; no alias. |
| `SlateExtensionPlugin` | Plate core behavior named Plite | Plate core behavior | rename | `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts:56-99` | Rename to Plate core/runtime extension terminology. |
| Feature packages | Plate | Plate | revise incrementally | Accessor count touched `packages/table`, `packages/list`, `packages/ai`, `packages/selection`, etc. | Migrate package by package after core target lands. |

API conflict ledger:
| Surface | Current shape | Conflict | Target shape | Verdict | Adoption/docs/proof answer |
|---------|---------------|----------|--------------|---------|---------------------------|
| Runtime accessors | `editor.api`, `getPluginApi`, `getTransforms`, `getPlugin`, `getOption(s)` on Plate editor | `getPluginApi` and `getTransforms` preserve old Plate helper model beside Plite `api/getApi` | Keep Plite `editor.api` and `getApi`; Plate feature APIs install as Plite extension API groups | revise | Core typecheck, declaration scan, docs update. |
| Product command surfaces | `editor.tf.*`, `editor.transforms.*`, feature `extendTransforms` | Conflicts with Plite transaction groups and teaches mutations outside `editor.update` | Replayable document mutations become `editor.update(tx => tx.<feature>.*())`; read/service APIs become `editor.api.<feature>.*` when they are editor-scoped | cut/revise | Package-by-package tests and docs examples. |
| Transform namespaces | Public `tf` alias plus `transforms` | Alias and duplicate namespace; impossible to make clean with Plite tx | No public `tf` or `transforms` on Plate editor | cut | Declaration scan must prove no public `PlateEditor['tf']`. |
| Plugin extension points | `.extendEditorApi`, `.extendEditorTransforms`, `extendApi`, `extendTransforms` typed over legacy editor API/transforms | Extends the names being removed | Replace with Plite extension contribution slots: `api`, `state`, and `tx`; keep Plate plugin metadata/options as plugin config, not editor-root helpers | revise | Feature package migrations prove inference survives. |
| Plite transaction/read/update interaction | Plate already exposes `update` typed to Plite tx beside legacy API/transforms | Correct direction is present but diluted by legacy command surfaces | Make `update` the write path for document mutations; keep `read`/state substrate as Plite-owned | keep/revise | Core tests and feature command tests use `editor.update`. |
| Runtime/default-route bridge | `currentRuntimeBridge` aliases legacy implementation | Bridge leaks into public editor types and package dependencies | Private bridge only until packages are migrated to new Plite runtime | bridge then delete | No public declaration/imports reference `@platejs/slate-legacy`. |
| Package exports/declarations | `platejs` exports the Plate product facade; `@platejs/core` still depends on legacy and old upstream Slate | Product facade leaks legacy/conflicting APIs | `platejs` exports the curated Plate product API; `@platejs/plite*` stays the direct Plite substrate API for low-level consumers | revise | `pnpm brl`, package import smoke, declaration scan. |
| Docs/examples | Plite-to-Plate docs teach `editor.tf` and legacy `editor.api` | Docs lock in the conflict | Docs teach `@platejs/plite` for substrate, `editor.api.<feature>` for extension APIs, and `editor.update(tx => tx.<feature>.*())` for mutations | revise | `pnpm --filter www check:docs`, targeted content scan. |
| Legacy substrate imports | `@platejs/slate-legacy`, old `slate`, `plite-dom`, `plite-react` remain in core and examples | Keeps old runtime alive as public surface | Remove from public deps; retain only private bridge until deletion | cut/bridge | `rg` no public deps/imports, package builds green. |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | User impact | Migration route | Proof |
|-------|--------------|-------------------------|-------------|-----------------|-------|
| Remove legacy merged-bag Plate `editor.api` typing, but keep Plite `editor.api` | Plite owns `editor.api`, and extensions can already contribute typed API groups | Adding `editor.plate` was rejected as an unnecessary second namespace | Plugin API call sites become `editor.api.<feature>.*` through Plite extension typing | Install Plate plugin APIs as Plite extension API groups | Core declarations and feature tests. |
| Remove public `editor.tf` and `editor.transforms` | Plite write path is transaction groups | Keeping `tf` as shortcut creates fake compat | Mutation call sites change | Convert replayable writes to tx groups; keep non-editor product side effects outside the Plite editor API | Package-by-package tests. |
| Rename Plate `createPliteEditor` | Plate should not name product factory as Plite | Export alias would be a public shim | Static/test factory imports change | Use `createPlateStaticEditor` | `@platejs/core` and `platejs` import smoke. |
| Curate top-level `platejs` facade | Product package should not leak legacy/conflicting aliases | Forcing every feature package to direct-import owners creates churn and worsens Plate DX | Feature packages keep `platejs`; low-level substrate consumers may use `@platejs/plite` directly | Keep `platejs` as the product facade and remove/rename conflicting exports there | Barrel output and docs import scan. |
| Make `@platejs/slate-legacy` non-public or delete | User said no public compat aliases/shims | Publishing it as legacy package is a shim | No public install path for old runtime | Private bridge during migration only | Package manifest and declaration scan. |
| Rename Plate "Plite" product internals where public | Public names imply Plite owns Plate behavior | Comments-only cleanup does not fix API | Imports/docs change where public | `PliteEditor` product type becomes Plate static/runtime type | Typecheck and docs scan. |

Public API target:
| Surface | Proposed shape | User-facing DX | Boundary owner | Evidence | Verdict |
|---------|----------------|----------------|----------------|----------|---------|
| Plite substrate | `editor.read`, `editor.update`, `editor.api`, `editor.getApi`, tx/state extension groups | Same everywhere Plite is used | Plite | `packages/plite/src/interfaces/editor.ts:610-631` | keep |
| Plite extension API groups | `editor.api.<feature>.<method>()` | Same host as Plite core APIs; no Plate-only root namespace | Plite host, Plate feature owner | `interfaces/editor.ts:1489-1527`; `editor-extension.ts:502-507` | keep/revise |
| Replayable feature mutations | `editor.update((tx) => tx.<feature>.<command>())` | Type inference comes from installed feature extensions | Plite tx mechanism, Plate feature groups | `interfaces/editor.ts:1684-1700`; `createPlateRuntimeEditor.ts:9732-9739` | keep/revise |
| Product services and non-replayable actions | Prefer editor-scoped `editor.api.<feature>` only when tied to editor runtime; otherwise keep outside editor as app/plugin services | Avoids stuffing UI/application services into tx | Plate feature owner, Plite API host only when editor-scoped | Existing plugin APIs include product services | accept-for-review |
| Static Plate editor factory | `createPlateStaticEditor` | Honest name for non-React Plate editor | Plate | `PliteEditor.ts:192-216` shows product shape | rename |
| Top-level package | `platejs` for Plate feature packages; `@platejs/plite*` for intentional Plite substrate imports | Curated facade without legacy/conflicting aliases | Plate/Plite split | `packages/plate/src/index.tsx:1-9` plus internal consumer audit | revise |

Private bridge and deletion gates:
| Bridge | Owner | Why temporary | Public exposure check | Deletion gate | Proof |
|--------|-------|---------------|-----------------------|---------------|-------|
| `currentRuntimeBridge.ts` | Plate core migration | Lets packages migrate without a flag day | Not exported from package entrypoints; no declaration references legacy names | Core and feature packages compile on new Plite runtime without bridge imports | `rg '@platejs/slate-legacy' packages/*/src packages/*/dist content/docs apps/www/src` returns no public refs. |
| `@platejs/slate-legacy` package | Plate migration scaffold | Holds old upstream runtime only while cutting consumers | `private: true` or removed; not listed in publishable package set | No package depends on it | Package manifest scan and workspace install. |
| Old upstream `slate*` deps in core | Plate core migration | Same reason as bridge | Not in `@platejs/core` public deps after migration | Core uses `@platejs/plite*` only | `pnpm --filter @platejs/core build` and dependency scan. |

Runtime / default-route target:
| Layer | Current shape | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Editor writes | Legacy `tf/transforms` plus Plite `update` | Plite `editor.update` with tx groups | Duplicate command paths | `PlateEditor.ts:42-61` | revise |
| Editor reads | Legacy merged `api` plus Plite extension `api` | Plite `read/api` for substrate and Plate feature APIs installed as extensions | Two implementations of `api` | `editor.ts:610-616`; `PlateEditor.ts:34-54`; `createPlateRuntimeEditor.ts:9723-9730` | revise |
| Plugin options | `getOption(s)`, `setOption(s)` on editor | Plugin config/runtime context, not public editor-root helpers | Product store leaking into Plite editor root | `createPlateRuntimeEditor.ts:686-723` | move |
| React/default route | Plate runtime editor omits Plite update and re-adds typed update | Keep source-first Plite update, remove legacy command additions | Source/dist split-brain and declaration debt | `createPlateRuntimeEditor.ts:669-724` | revise |

Plugin / feature package target:
| Package / feature | Current API | Target API | Break level | Proof command | Verdict |
|-------------------|-------------|------------|-------------|---------------|---------|
| `@platejs/core` | Defines legacy public names | Defines Plate plugins as Plite extension `api/state/tx` contributors | major | `pnpm turbo typecheck --filter=./packages/core && pnpm --filter @platejs/core test && pnpm --filter @platejs/core build` | first |
| `platejs` | Re-exports core and Plite | Curated Plate product facade; no legacy/conflicting aliases | major | `pnpm --filter platejs build` plus import smoke | after core API rows stabilize |
| Basic nodes/styles | legacy `editor.api/tf` call sites | Plite extension API groups plus tx groups | major | focused package typecheck/tests | staged |
| Complex features: table/list/code/selection/comment/ai | Heavy legacy command usage | package-specific tx and Plate services | major | package tests plus representative app smoke | staged after core |
| Docs/examples | Teach old API names | Current-state Plate/Plite boundary docs | major docs rewrite | `pnpm --filter www check:docs && pnpm --filter www typecheck` | after API target |

Docs / examples / registry target:
| Surface | Current docs/example | Target docs/example | Check command | Status |
|---------|----------------------|---------------------|---------------|--------|
| Plite-to-Plate migration docs | Teaches `editor.tf` and legacy `editor.api` | Teaches Plite extension `api/state/tx`, `editor.update`, and no transform aliases | `pnpm --filter www check:docs` | revise later |
| Plate plugin docs | Teaches `.extend*` and plugin methods around old model | Teach direct plugin `api`, `state`, and `tx` contribution through Plite extensions | `pnpm --filter www check:docs` | revise later |
| Registry examples | Use current Plate public APIs | Migrate after core feature package changes | package/app typecheck | staged |
| Plite docs | Already own substrate docs | Do not bend Plite docs for Plate migration | `pnpm check:plite:fast` if Plite docs/packages change | keep |

Proof matrix:
| Claim | Cwd | Command / proof | Expected signal | Status |
|-------|-----|-----------------|-----------------|--------|
| Plan completeness | repo root | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-v2-api-conflict-plan.md` | complete | run at close |
| Core API target compiles | repo root | `pnpm turbo typecheck --filter=./packages/core` | no type errors | later implementation |
| Core runtime tests pass | repo root | `pnpm --filter @platejs/core test` | green | later implementation |
| Public declarations clean | repo root | `pnpm --filter @platejs/core build && rg '@platejs/slate-legacy|\\btf\\b|getTransforms|getPluginApi' packages/core/dist` | no public legacy refs except intentionally private build internals if any | later implementation |
| Barrels match exports | repo root | `pnpm brl` | no stale barrel diff | later implementation |
| Feature package migration is safe | repo root | `pnpm turbo typecheck --filter=./packages/<package> && pnpm --filter @platejs/<package> test` | package green before next package | later implementation |
| Docs are current-state | repo root | `pnpm --filter www check:docs && pnpm --filter www typecheck` | docs green | later implementation |
| Product-visible behavior still works | repo root | relevant Plate app/browser proof after runtime changes | editor route works | later implementation |

Research / ecosystem synthesis:
| System | Source | Mechanism | Steal | Reject | Plate target | Verdict |
|--------|--------|-----------|-------|--------|--------------|---------|
| Current Plite substrate | local `packages/plite` | explicit read/update/api/tx lifecycle | strong owner vocabulary | bending Plite names for Plate | keep Plite untouched | accepted |
| Current Plate runtime | local `packages/core` | plugin stores, product runtime, UI composition | existing `defineEditorExtension` bridge for plugin `api` and `tx` | legacy `tf/transforms/get*` root names | Plite-native Plate extensions | accepted |
| External research | intentionally skipped | user asked current source discovery | none | adding external noise | no action | skipped with reason |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| architecture-cleanup | yes | applied-to-plan | Avoid wrapper/alias churn; prefer delete/rename over shims. | Hard-cut rows added. |
| performance | yes | scoped | Runtime rename should not add indirection. | Bridge deletion gates added. |
| tdd | yes | scoped | Future implementation needs package tests after each package. | Proof matrix added. |
| docs-creator | yes | scoped | Docs must describe current API only. | Docs target added. |
| react | limited | scoped | Runtime React route should keep Plite update path. | Runtime target added. |
| react-useeffect | no | skipped | No Effect code in planning pass. | No delta. |
| components / plate-ui | limited | scoped | Product examples move only after API target. | Registry row staged. |
| autoreview | no | skipped | No implementation diff beyond planning artifact. | Require autoreview in implementation closure. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Over-breaking product API | Cutting all plugin APIs at once | Huge migration with poor inference | One namespace target, package-by-package execution | per-package typecheck/test | covered |
| Fake compatibility returns | Keeping aliases for comfort | Same conflict survives under old names | No public aliases, no public shims | declaration/docs scans | covered |
| Plite package gets bent for Plate | Product needs leak into substrate | Plite docs/API lose clarity | Plite wins; Plate adapts | Plite package untouched unless substrate bug proven | covered |
| Private bridge becomes permanent | Legacy package remains publishable | Beta ships public compat debt | Owner + deletion gate + no public export | dependency/declaration scan | covered |
| Docs drift | Docs teach old names after API cut | Users copy dead API | Docs rewrite after API target | docs check and grep | covered |

Objection ledger:
| Change | Who feels pain | Objection | Tradeoff | Evidence | Adoption/docs/proof answer | Verdict |
|--------|----------------|-----------|----------|----------|----------------------------|---------|
| Reuse `editor.api` for Plate feature APIs | Plate users and package authors | Could blur Plite vs Plate if API groups are not named by feature | Better than adding a second editor-root namespace; the extension name/group carries ownership | `interfaces/editor.ts:1489-1527`; `createPlateRuntimeEditor.ts:9723-9739` | Teach feature-owned groups, not a loose merged bag | accept |
| Remove `tf/transforms` | Existing Plate plugins | Lots of call sites change | Old command model conflicts with tx lifecycle | Accessor count hit core plus many packages | Migrate feature packages one at a time | accept |
| Remove top-level Plite barrel from `platejs` | Users importing everything from `platejs` | More package imports | Clear package ownership beats convenience barrel | `packages/plate/src/index.tsx:1-7` | Docs import from `@platejs/plite` for substrate | accept |
| Rename `createPliteEditor` | Static/test users | Import rename | Name is wrong now that Plite is owned as substrate | `PliteEditor.ts:192-216` | `createPlateStaticEditor` is honest | accept |
| Private bridge only | Migration implementers | Less convenient debugging | Public legacy package would be a shim | `currentRuntimeBridge.ts:1-34` | Delete gate keeps scope honest | accept |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Public `@platejs/slate-legacy` | cut public | It is a public compat shim | medium | core depends on it today | Make private or delete. |
| Public `editor.tf` | cut | Alias to old transform model | high | exposed in editor types and docs | tx migration. |
| Public `editor.transforms` | cut | Same conflict with longer name | high | exposed in editor types | tx migration. |
| Public `getTransforms` | cut | Preserves old model by helper | medium | exposed in editor types | tx groups. |
| Public `getPluginApi` | cut/replace | Competes with Plite `getApi` and preserves plugin-bag access | medium | exposed in editor types | direct `editor.api.<feature>` or `editor.getApi(extension)` when extension identity is needed. |
| Top-level `export * from '@platejs/plite'` in `platejs` | cut | Package ownership blur | low/medium | `packages/plate/src/index.tsx:6` | explicit imports. |
| Keeping names and documenting nuance | reject | This is exactly the conflict | low now, expensive forever | docs already confusing | hard cut. |

Plan deltas from review:
- Started from generic Plate v2 migration concern.
- Narrowed to API conflict plan only.
- Rejected `editor.plate` after checking Plite extension support.
- Chose Plite-native Plate plugins: `api` for stable editor-scoped feature APIs, `state` for read views, and `tx` for replayable mutations.
- Deferred all implementation until user accepts or revises names.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Do Plite extension API groups need extra typing helpers for Plate plugin arrays? | This is the likely substrate gap, not namespace design. | Implementation-time type inference failures that cannot be solved in Plate types. | auto / slate-plan if needed | gated |
| Should `platejs` re-export any Plite types explicitly? | A tiny type re-export could be useful but risks blur. | Concrete DX case where explicit import from `@platejs/plite` is worse. | user/plate-plan | review-needed |
| Should static factory be `createPlateStaticEditor` or another name? | This impacts test/static docs. | Naming taste and existing docs examples. | user/plate-plan | review-needed |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 0. User review | user + plate-plan | Approve namespace and factory names | This plan accepted for review | Names approved/revised | Final answer and next prompt |
| 1. Core public boundary | auto / Plate lane | Core editor types, runtime bridge privacy, package deps | Phase 0 accepted | Core no longer exposes legacy names | core typecheck/test/build and declaration scan |
| 2. Package entrypoints | auto / Plate lane | `platejs` exports, barrels, import smoke | Phase 1 green | Product package stops being Plite barrel | `pnpm brl`, package build, import smoke |
| 3. Feature packages | auto / Plate lane | table/list/selection/comment/ai/etc. one package at a time | Phase 2 green | each package green before next | package typecheck/test |
| 4. Docs/examples | docs-creator + auto | Plate docs/examples/registry current-state rewrite | APIs landed | docs teach only current names | www docs/typecheck and browser proof if route changed |
| 5. Closure | autoclosure + autoreview | Delete bridges, run reviews | phases 1-4 green | no stale legacy refs | autoreview, scans, focused checks |

Final user-review handoff outline:
- accepted boundary decisions: Plite owns extension host; Plate plugins contribute feature-owned `api/state/tx` through Plite.
- accepted API conflict verdicts: keep Plite `api/getApi/read/update/tx`; cut legacy Plate `tf/transforms/getPluginApi/getTransforms` overlap.
- breaking changes: remove public legacy bridge, remove Plate transform aliases, rename Plate static editor factory, stop top-level Plite barrel in `platejs`.
- private bridges and deletion gates: `currentRuntimeBridge` and `@platejs/slate-legacy` only as private migration scaffolds with no public export/docs.
- docs/examples/registry changes: rewrite after API target lands; no current-state docs should teach removed names.
- proof gates: core first, then package entrypoints, feature packages, docs, browser only for product-visible changes.
- next execution owners: `auto` Plate lane after user approves public names.
- needs user attention: approve extension-native target; approve top-level `platejs` Plite barrel cut; approve `createPlateStaticEditor`.

Final completion gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| score >=0.92 and no dimension below 0.85 | yes | Scorecard total 0.929, lowest dimension 0.91. |
| all pass rows complete or skipped with evidence | yes | Phase table statuses are complete or skipped with reason. |
| Plite/Plate boundary closed | yes | Boundary map has target owners and verdicts. |
| API conflict ledger closed | yes | Ledger rows have verdict and adoption/proof answer. |
| live source grounding complete | yes | Verification surface cites current source anchors. |
| workspace verification recorded | yes | Source audit recorded; final `check-complete` command required. |
| autoreview clean or N/A | yes | N/A because no implementation diff beyond plan artifact. |
| final handoff emitted or lane remains review-ready | yes | Final answer will summarize review points. |
| `check-complete` passes | yes | Command run after plan edit. |

Findings:
- Plate currently mixes new Plite substrate packages and old legacy Plite dependencies in `@platejs/core`.
- Plate public editor types expose Plite extension API names and old Plate command names on the same object.
- Top-level `platejs` currently re-exports all of `@platejs/plite`, which blurs product and substrate packages.
- Docs still teach old Plate `editor.tf` and `editor.api` patterns.
- The old API surface is spread across many feature packages; implementation must be package-by-package.

Decisions and tradeoffs:
- Recommend Plite-native Plate plugin extensions: `api` for editor-scoped feature APIs, `state` for read views, and `tx` for replayable document mutations.
- Recommend cutting legacy transform wrappers rather than adding a new root namespace.
- Recommend patching Plite substrate only if Plate implementation proves `defineEditorExtension` typing or runtime slots are too limited.
- Recommend cutting aliases instead of compatibility wrappers.
- Recommend keeping Plite packages untouched unless a substrate bug is proven.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad regex output/quoting was noisy once | 1 | Use safer scoped `rg -l` counts and owner file slices | Resolved; final plan cites owner files and package counts. |
| Accessor count was too broad to list line-by-line | 1 | Count by package and inspect representative owners | Resolved; plan stages feature package execution. |

Verification evidence:
- Read `plate-plan`, `autogoal`, root `VISION.md`, and relevant `docs/vision/**`.
- Inspected current Plite substrate owner APIs in `packages/plite/src/interfaces/editor.ts:605-655`.
- Inspected current Plate core package dependencies in `packages/core/package.json:45-70`.
- Inspected legacy runtime bridge in `packages/core/src/internal/currentRuntimeBridge.ts:1-34`.
- Inspected public Plate editor/runtime types in `packages/core/src/react/editor/PlateEditor.ts:1-108`, `packages/core/src/react/editor/createPlateRuntimeEditor.ts:669-724`, and `packages/core/src/lib/editor/PliteEditor.ts:192-260`.
- Inspected plugin extension points in `packages/core/src/lib/plugin/SlatePlugin.ts:95-129` and `packages/core/src/react/plugin/PlatePlugin.ts:105-139`.
- Inspected Plate-named-as-Plite core plugin in `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts:56-99`.
- Inspected top-level `platejs` exports in `packages/plate/src/index.tsx:1-7`.
- Inspected docs teaching old API names in `content/docs/migration/slate-to-plate.mdx:20-30`.
- Ran package-count scans for legacy imports and old Plate accessor surfaces.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning is complete and ready for user review. |
| Where am I going? | Stop; do not implement until public names are accepted or revised. |
| What is the goal? | Define minimal breaking changes so Plate stops conflicting with Plite APIs. |
| What have I learned? | The real conflict is public naming and ownership, not just legacy imports. |
| What have I done? | Created a source-backed plan with boundary map, conflict ledger, break matrix, proof gates, and review points. |

Open risks:
- Plite extension API typing may need hardening if installed Plate plugin arrays lose inference during migration; patch Plite substrate only when this is proven by implementation/type tests.
- Feature-package migration volume is high because old Plate APIs are widely used; implementation must stay package-by-package.
- Declaration scans may reveal additional public legacy names after core build output is regenerated.

Timeline:
- 2026-06-22: Plate Plan goal created, source-discovery completed, plan ready for review.
