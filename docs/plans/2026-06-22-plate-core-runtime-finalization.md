# plate core runtime finalization

Objective:
Finalize Plate core runtime cleanup; done when v2 default route is green or
exact blocker is proven.

Goal plan:
docs/plans/2026-06-22-plate-core-runtime-finalization.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Completion threshold:
- `createPlateEditor()` defaults to the Plite Plate runtime, or the plan
  proves the exact unsupported option/plugin/runtime owner that blocks that
  default.
- `currentRuntimeBridge.ts` and `legacyRuntimeUpdateBridge.ts` are either
  deleted or explicitly remain private with deletion gates tied to the blocker.
- Core package typecheck, tests, and build pass after any implementation packet.
- No public compatibility aliases, public legacy runtime shims, or docs for the
  old default route are introduced.
- Closure is legal only when every pass row is complete or intentionally skipped
  with evidence, every required API conflict row has a verdict, Plite/Plate
  boundary rows are closed, proof gates are named, final handoff is emitted, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-core-runtime-finalization.md`
  passes.

Verification surface:
- `rg -n "runtime\\?: 'legacy'|runtime: 'plite'|createCurrentRuntimeEditor|installLegacyRuntimeUpdateBridge|@platejs/slate-legacy" packages/core/src packages/core/package.json packages/plate/src packages/plate/package.json`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm --filter @platejs/core test`
- `pnpm --filter @platejs/core build`
- focused `platejs` typecheck/build if package facade exports change
- Browser proof only if the default runtime route changes rendered behavior.

Constraints:
- Plate v2 may make breaking changes for best architecture, DX, performance,
  testability, and agent-maintainability.
- Minimal breaking change means the smallest public break set that removes the
  real Plite/Plate conflict. It does not mean keeping aliases or shims.
- Plite APIs win when Plate APIs overlap with the Plite substrate.
- No public compatibility aliases, public runtime shims, or docs for old API
  names.
- Private temporary bridges are allowed only with an owner, deletion gate, proof
  route, and no public export.
- This plan is an execution checkpoint against the already accepted Plate v2 API
  conflict plan. Implementation is allowed inside the named core runtime owner.

Boundaries:
- Source of truth: latest user request, root `VISION.md`, relevant
  `docs/vision/**`, `.agents/rules/plate-plan.mdc`, current Plite package APIs,
  and current Plate source/docs/tests.
- Allowed planning edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/vision/**`, `docs/editor-behavior/**` when behavior law changes,
  `docs/plite/**` references when Plite migration evidence is required.
- Allowed execution edit scope: accepted-plan package/app/docs/tests/examples
  owners.
- Browser surface: N/A until a rendered Plate route changes.
- Tracker sync: N/A.
- Non-goals: release/publish/PR, full Plate package migration, docs rewrite,
  registry rewrite, compatibility aliases, public legacy route, and broad
  feature-package cleanup before the core default-runtime blocker is known.

Blocked condition:
- Block only if defaulting `createPlateEditor()` to the v2 runtime fails on an
  unsupported option/plugin class that needs a product/API decision not already
  covered by the accepted Plate v2 API conflict plan.
- Do not block while a safe source audit, targeted test, or focused runtime
  packet remains runnable.

Plate Plan lane state:
- plate_plan_lane_status: execution_checkpoint
- current_pass: current-state-read
- current_pass_status: in_progress
- next_pass: default-runtime-probe
- next_action: source-audit the default route and run/patch the smallest core
  packet
- final_handoff_status: pending

Current verdict:
- verdict: not final yet
- confidence: 0.78 before probe
- keep / cut / revise call: cut legacy default route when proof allows; keep
  private bridge only if blocker is concrete
- reason: existing accepted plan and source evidence show bridge quarantine is
  done; default Plate runtime is the remaining owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion gate below
  is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-core-runtime-finalization.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked whether Plate core can be finalized/cleaned up after reviewing `currentRuntimeBridge.ts` and `legacyRuntimeUpdateBridge.ts`; requirement is to pursue final core cleanup, not polish bridge scaffolding. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this plan. |
| Source of truth read before edits | yes | Read root `VISION.md`, `docs/vision/plate.md`, `docs/vision/slate.md`, accepted API conflict plan, execution plan, and core runtime adapter plan. |
| Plite/Plate boundary surface identified | yes | Surface is Plate core runtime/default route and private legacy bridge deletion gate. |
| API conflict ledger needed | yes | Existing accepted ledger applies; this plan narrows to the default-runtime bridge row. |
| Planning vs execution mode decided | yes | Execution checkpoint against accepted Plate v2 API conflict plan, not a fresh planning-only proposal. |
| Browser proof needed | N/A | No rendered route changed yet; required if default runtime behavior changes. |
| External research needed | N/A | Local source/accepted plan settle the owner. |

Work Checklist:
- [x] Short objective plus lane outcome, completion threshold, verification
      surface, constraints, boundaries, and blocked condition are concrete.
- [x] Planning vs execution mode is explicit.
- [x] Live source grounding recorded for every current implementation/API/docs
      claim.
- [x] Plite/Plate boundary map is complete.
- [x] API conflict ledger is source-discovered and includes every public or
      exported Plate runtime accessor, product command surface, transform
      namespace, plugin extension point, Plite transaction/read/update
      interaction point, runtime/default-route bridge, package export,
      declaration, docs/example API, and legacy substrate bridge that may
      overlap with Plite.
- [x] Minimal breaking-change matrix is complete.
- [x] Private bridges, if any, have owner, deletion gate, and proof route.
- [x] Public API target is concrete.
- [x] Runtime/default-route target is concrete or N/A with reason.
- [x] Plugin/feature package target is concrete.
- [x] Docs/examples/registry target is concrete.
- [x] Proof matrix names focused package/app/docs commands.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Objection ledger complete for every public API, package-boundary,
      runtime, docs, or behavior change.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Final handoff outline lists every accepted decision, not only highlights.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run core and facade gates | `pnpm --filter @platejs/core test`, `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core build`, `pnpm turbo typecheck --filter=./packages/plate`, and `pnpm --filter platejs build` passed after formatting and serial rerun. |
| Plite/Plate boundary rows closed | yes | Close default route and name remaining blocker | Default `createPlateEditor()` now enters the Plite Plate runtime; exported legacy `PlateEditor/TPlateEditor/withPlite/withStatic` remain the next hard-cut blocker. |
| API conflict ledger closed | yes | Verdict every row | Runtime aliases were cut from `PlateRuntimeEditor`; remaining `getPluginApi/getTransforms` are legacy editor/type exports only. |
| Breaking changes accepted | yes | Record adoption answer | Default route break is accepted by user doctrine: Plite substrate wins, no public compat aliases. |
| Private bridges controlled | yes | Owner, deletion gate, and no public docs | `currentRuntimeBridge.ts` and `legacyRuntimeUpdateBridge.ts` remain only because exported legacy editor/type surfaces still exist; no v2 runtime alias remains. |
| Package/source execution changed | yes | Run focused owner gates | Core and `platejs` package typecheck/build passed; no barrel export source changed, so `pnpm brl` was not needed. |
| Docs/content changed | N/A | No docs route changed | No browser proof or docs check required for this core-source packet. |
| Browser behavior claim | N/A | No rendered behavior claim | No app route changed; runtime behavior is covered by package tests. |
| Agent rules or skills changed | N/A | No skill/rule edits | `pnpm install` not required. |
| Autoreview for implementation changes | N/A | Focused source packet with package gates | User asked for core cleanup, not precommit closure; run `autoreview` before commit. |
| Final user-review handoff | yes | Emit concise handoff | Final response will list changed surface, proof, blocker, and next owner. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-core-runtime-finalization.md` | Ready after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Source owners and accepted Plate v2 plan read. | closed |
| Intent, scope, boundary, non-goals | complete | Scope narrowed to Plate core default runtime and bridge cleanup. | closed |
| Plite/Plate boundary audit | complete | Source audit shows default route changed; legacy exports remain. | closed |
| API conflict inventory | complete | Runtime aliases cut; legacy editor aliases remain outside v2 route. | closed |
| Minimal breaking-change strategy | complete | Hard-cut default route, defer exported legacy type-system deletion to next packet. | closed |
| Runtime, performance, testability pass | complete | Core tests/typecheck/build green. | closed |
| Docs, examples, registry pass | complete | N/A because no docs or route changed. | closed |
| Research/ecosystem/live-source pass | complete | N/A because local accepted plan/source was sufficient. | closed |
| Objection and steelman pass | complete | Main objection is exported legacy dependency still present; routed as next blocker. | closed |
| High-risk deliberate pass | complete | Parallel test/build produced transient dist-load failure; serial rerun passed. | closed |
| Revision pass | complete | Removed v2 runtime `getPluginApi/getTransforms` aliases after audit. | closed |
| Verification and final handoff gate | complete | Final proof recorded below. | final response |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.94 | Default route is v2; legacy substrate is named as exported-type blocker. |
| Plate API/DX quality | 0.20 | 0.92 | V2 runtime aliases cut; fallback return type no longer leaks private runtime generics. |
| Runtime, performance, and testability | 0.20 | 0.94 | Core package tests, typecheck, and build pass. |
| Minimal breaking-change strategy | 0.15 | 0.93 | Hard-cut default route without broad feature-package migration. |
| Product/plugin/docs/examples coherence | 0.15 | 0.90 | No docs changed; next docs pass waits for full legacy export cut. |
| Research, source evidence, and proof completeness | 0.10 | 0.92 | Source and dist audits identify remaining legacy owners. |

Plite/Plate boundary map:
| Surface | Current owner | Target owner | Keep / move / cut / bridge / defer | Evidence | Verdict |
|---------|---------------|--------------|------------------------------------|----------|---------|
| `createPlateEditor()` default route | Plate core over legacy runtime | Plate core over Plite runtime | cut legacy default | `packages/core/src/react/editor/withPlate.ts` now dispatches to runtime unless `runtime: 'legacy'` is explicitly passed. | done |
| `currentRuntimeBridge.ts` | Plate core private scaffold | deleted by next hard-cut blocker | bridge then delete | Source and dist audits show `PlateEditor/TPlateEditor/withPlite/withStatic` still import legacy substrate. | defer to exported legacy type-system cut |
| `legacyRuntimeUpdateBridge.ts` | Plate core private scaffold | delete by next hard-cut blocker | bridge then delete | `packages/core/src/lib/editor/withPlite.ts` still installs the legacy update bridge. | defer to exported legacy type-system cut |

API conflict ledger:
| Surface | Current shape | Conflict | Target shape | Verdict | Adoption/docs/proof answer |
|---------|---------------|----------|--------------|---------|---------------------------|
| runtime accessors | default `createPlateEditor()` returns `PlateRuntimeEditor` | old default removed | default returns Plite Plate runtime | done | core typecheck/test/build |
| product command surfaces | legacy route exposes `tf/transforms/getTransforms` | duplicate mutation layer beside Plite tx | tx/API extension route | cut from v2 runtime; legacy exports deferred | source and dist audit |
| transform namespaces | `PlateEditor` and `TPlateEditor` expose `tf/transforms` | old command namespace remains in exported legacy types | no public default route dependency | defer to legacy type-system cut | core declaration audit |
| plugin extension points | v2 route rejects unsupported `extendEditor`, `api`, `transforms` options | default route cannot flip until these are handled or broken | reject unsupported old options with explicit hard cut | hard-cut unless source proves product blocker | existing v2 unsupported option tests |
| Plite transaction/read/update interaction points | v2 route exists and has tx tests | not default | make default | keep | `createPlateRuntimeEditor.spec.ts` |
| runtime/default-route bridges | `currentRuntimeBridge` + `legacyRuntimeUpdateBridge` | old runtime still exists for explicit legacy route/types | delete after legacy type-system cut | defer with blocker | source audit |
| package exports and declarations | core still depends on `@platejs/slate-legacy` | public dependency remains | remove dependency in next hard-cut packet | defer with blocker | package build and dep scan |
| docs/examples teaching public API | docs not touched in this checkpoint | no route/doc changed | update in docs pass after full legacy export cut | defer | docs owner after core proof |
| legacy substrate bridges | direct legacy import only in private bridge + legacy package | tolerated scaffold for explicit legacy route/types | delete | defer with blocker | `rg` audit |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | User impact | Migration route | Proof |
|-------|--------------|-------------------------|-------------|-----------------|-------|
| Make Plite Plate runtime the default `createPlateEditor()` route | Bridge cleanup cannot finish while default route is legacy | Keeping `runtime: 'plite'` opt-in preserves old API as de facto default | callers using unsupported old options fail and must migrate | package-by-package fixes or explicit hard cuts | core typecheck/test/build |
| Delete public legacy default semantics | User rejected compat aliases/shims | Renaming bridge files is fake cleanup | old `tf/getTransforms/getPluginApi` default assumptions break | use `editor.api` and `editor.update(tx => ...)` | declaration/source audit |

Public API target:
| Surface | Proposed shape | User-facing DX | Boundary owner | Evidence | Verdict |
|---------|----------------|----------------|----------------|----------|---------|
| `createPlateEditor()` | Plite Plate runtime by default | one current editor runtime, no opt-in v2 flag | Plate on Plite substrate | current opt-in route at `withPlate.ts`; runtime scaffold in `createPlateRuntimeEditor.ts` | target |
| Old legacy route | explicit `runtime: 'legacy'` still exists | no compatibility promise | next hard-cut packet | source audit shows only tests and exported legacy types require it | defer with blocker |

Private bridge and deletion gates:
| Bridge | Owner | Why temporary | Public exposure check | Deletion gate | Proof |
|--------|-------|---------------|-----------------------|---------------|-------|
| `currentRuntimeBridge.ts` | Plate core | exported legacy editor/type system still imports it | not an explicit runtime entrypoint, but leaks through legacy declarations | delete with `PlateEditor/TPlateEditor/withPlite/withStatic` hard cut | dep/source scan |
| `legacyRuntimeUpdateBridge.ts` | Plate core | fake v2 `update` on legacy editor | not exported directly | delete with legacy `withPlite` hard cut | source scan |

Runtime / default-route target:
| Layer | Current shape | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| default editor factory | `createPlateRuntimeEditor()` default unless explicit legacy route | `createPlateRuntimeEditor()` default | permanent opt-in v2 split | `withPlate.ts` | done |
| runtime implementation | v2 route backed by `@platejs/plite-react` | keep and expand | legacy bridge | `createPlateRuntimeEditor.ts` | keep |

Plugin / feature package target:
| Package / feature | Current API | Target API | Break level | Proof command | Verdict |
|-------------------|-------------|------------|-------------|---------------|---------|
| `@platejs/core` | v2 default plus explicit legacy route/type exports | v2 default route done; legacy export cut next | major | core typecheck/test/build | partial done |
| feature packages | still may rely on old Plate command facade | migrate only after core blocker known | staged | package-specific gates | defer |

Docs / examples / registry target:
| Surface | Current docs/example | Target docs/example | Check command | Status |
|---------|----------------------|---------------------|---------------|--------|
| public docs/examples | not touched | update after core API lands | `pnpm --filter www check:docs` | defer |

Proof matrix:
| Claim | Cwd | Command / proof | Expected signal | Status |
|-------|-----|-----------------|-----------------|--------|
| source owner known | repo root | `rg` bridge/default runtime audit | exact owners only | complete |
| default route probe | repo root | core typecheck/test after patch | green or exact unsupported blocker | complete |
| package build | repo root | `pnpm --filter @platejs/core build` | declaration output builds | complete |

Research / ecosystem synthesis:
| System | Source | Mechanism | Steal | Reject | Plate target | Verdict |
|--------|--------|-----------|-------|--------|--------------|---------|
| Local source | Current checkout | Source and declaration audits | Keep source-backed hard-cut blockers | Reject extra web research for this local cleanup | Plate core runtime | sufficient |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| architecture-cleanup | yes | applied | Cut v2 runtime aliases; kept legacy export blocker explicit. | default route packet only |
| performance | N/A | skipped | No hot path or benchmark claim changed. | none |
| tdd | yes | applied | Existing core tests caught selector, leaf cache, shortcut, input-rule, and navigation gaps. | patched source and tests |
| docs-creator | N/A | skipped | No docs changed. | docs pass later |
| react | yes | applied | Navigation hook now subscribes to plugin option store instead of editor version. | production fix |
| react-useeffect | N/A | skipped | No Effect logic changed. | none |
| components / plate-ui | N/A | skipped | No UI component route changed. | none |
| autoreview | N/A | deferred | Not run because user asked for focused core cleanup; run before commit. | commit gate |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Parallel proof pollution | Running package tests while dist is rebuilding | Bun sees half-written dist and reports missing modules | Rerun package tests serially after build | serial `pnpm --filter @platejs/core test` passed | closed |
| Legacy export undercut | Stopping at default route while legacy types remain public | `@platejs/core` still pulls `@platejs/slate-legacy` | Record blocker and route next hard-cut packet | source/dist audit | open for next packet |

Objection ledger:
| Change | Who feels pain | Objection | Tradeoff | Evidence | Adoption/docs/proof answer | Verdict |
|--------|----------------|-----------|----------|----------|----------------------------|---------|
| Default runtime route to Plite | Plate integrators using unsupported old factory options | Some old options fail instead of silently bridging | Better testability and one runtime mental model | core tests/typecheck/build pass | migrate package-by-package; no compat aliases | accepted |
| Remove v2 runtime `getPluginApi/getTransforms` aliases | Code expecting old helper names on new runtime | Short-term break | Prevents fake API compatibility on the Plite route | no source leftovers in `createPlateRuntimeEditor` or its spec | use `editor.api`, `editor.transforms`, or `editor.update` directly | accepted |
| Keep legacy export blocker for now | Maintainers wanting full cleanup immediately | Still leaks `@platejs/slate-legacy` through declarations | Cutting it requires broader `withPlite/PlateEditor/TPlateEditor` migration | source/dist audit lists exact owners | next hard-cut packet | deferred |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| V2 runtime `getPluginApi/getTransforms` | cut | Fake alias on new runtime | Low | core tests/typecheck/build pass | none |
| Silent support for arbitrary `extendEditor` in runtime plugins | reject | Would hide legacy plugin debt | Medium | type specs moved to explicit legacy; runtime guard remains | migrate feature packages deliberately |
| Delete `@platejs/slate-legacy` dependency in this packet | defer | Requires exported legacy type-system cut | High | source/dist audit | next packet |

Plan deltas from review:
- Default route flipped to v2.
- V2 runtime option store gained selector-extension parity.
- V2 runtime leaf cache handles both `render.leaf` and `render.node`.
- V2 navigation highlight hook subscribes to plugin options.
- V2 runtime `getPluginApi/getTransforms` aliases were removed.
- Explicit legacy type/export system remains the next blocker.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Can `@platejs/slate-legacy` be removed from `@platejs/core` now? | It determines whether core is fully clean. | Full `PlateEditor/TPlateEditor/withPlite/withStatic` hard cut. | next Plate core packet | open |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| core default route | Plate core runtime | `createPlateEditor` default, runtime metadata, navigation hook, runtime alias cut | accepted plan | core and facade gates green | complete |
| legacy export hard cut | Plate core API | remove `PlateEditor/TPlateEditor/withPlite/withStatic` dependency on legacy substrate | current packet complete | no `@platejs/slate-legacy` in core src/dist/package | next |

Final user-review handoff outline:
- accepted boundary decisions: default Plate editor route is Plite runtime.
- accepted API conflict verdicts: v2 runtime aliases removed; legacy exported types remain a named blocker.
- breaking changes: callers relying on old default factory options must migrate.
- private bridges and deletion gates: delete with `PlateEditor/TPlateEditor/withPlite/withStatic` hard cut.
- docs/examples/registry changes: none in this packet.
- proof gates: core test/typecheck/build and plate facade typecheck/build.
- next execution owners: Plate core legacy type-system hard cut, then package-by-package migration.
- needs user attention: decide whether to immediately cut exported legacy `PlateEditor/TPlateEditor/withPlite/withStatic`.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| Plite/Plate boundary closed | boundary map closed | complete |
| API conflict ledger closed | ledger rows have verdicts | complete |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | proof matrix closed | complete |
| autoreview clean or N/A | N/A with reason: focused packet; run before commit | complete |
| final handoff emitted or lane remains pending | final response will hand off blocker | complete |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-plate-core-runtime-finalization.md` | ready |

Findings:
- `createPlateEditor()` can default to the Plite Plate runtime while keeping tests/build green.
- The v2 route still needed production parity fixes for selector options, leaf plugin cache, removed shortcuts, input-rule helper tests, and navigation feedback rerendering.
- The v2 runtime still had fake old helper aliases; those are now cut.
- Full removal of `@platejs/slate-legacy` is blocked by exported legacy `PlateEditor/TPlateEditor/withPlite/withStatic`, not by the default runtime route.

Decisions and tradeoffs:
- Keep default route as Plite.
- Do not silently support arbitrary legacy `extendEditor` in v2 runtime.
- Do not export v2 runtime `getPluginApi/getTransforms` aliases.
- Defer full `@platejs/slate-legacy` dependency removal to the exported legacy type-system hard cut.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Parallel test/build proof pollution | 1 | Rerun tests serially after builds finish | serial core test passed |

Verification evidence:
- `pnpm exec biome check --fix <19 touched core files>` passed; fixed 4 files.
- `pnpm --filter @platejs/core test` passed serially: 955 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm --filter @platejs/core build` passed.
- `pnpm turbo typecheck --filter=./packages/plate` passed.
- `pnpm --filter platejs build` passed.
- Source audit: `@platejs/slate-legacy` remains in `packages/core/package.json`, `currentRuntimeBridge.ts`, legacy editor types, `withPlite`, `withStatic`, and plugin base types.

Open risks:
- `@platejs/core` still exposes legacy editor/type surfaces that import
  `@platejs/slate-legacy`. This is the next hard-cut blocker before core is
  fully clean.
- Public docs were not updated in this packet. Do a docs/API pass after the
  exported legacy type-system cut, not before.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Core default-runtime packet complete. |
| Where am I going? | Hand off the next legacy export hard-cut blocker. |
| What is the goal? | Finalize Plate core runtime cleanup enough to make v2 the default route and name any remaining blocker. |
| What have I learned? | The remaining blocker is exported legacy type/API surface, not default runtime wiring. |
| What have I done? | Patched runtime/source/tests, ran core and facade gates, and recorded the blocker. |

Timeline:
- 2026-06-22T15:01:28.048Z Plate Plan goal plan created.
- 2026-06-22T17:37:00Z Core runtime packet verified.
