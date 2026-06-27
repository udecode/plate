# plate-next runtime marker cleanup plan

Objective:
Plate Next runtime marker cleanup plan; done when all remaining runtime markers are inventoried, grouped, ordered, and routed with proof gates.

Goal plan:
docs/plans/2026-06-26-plate-next-runtime-marker-cleanup-plan.md

Automation source:
- type: user-invoked skill
- prompt / link: `$plate-next` full plan for the many remaining `runtime*` markers in `packages/core/src/react/editor/createPlateRuntimeEditor.ts`
- lane: Plate Next boundary cleanup plan
- surface / route / package: `@platejs/core` runtime/plugin API, plus owning feature packages that declare `runtime*` markers
- invocation mode: planning only, no implementation
- minimum runtime / deadline: none requested
- completion threshold summary: inventory all markers, classify them, choose kill order, name owners and proof commands, and stop for review

Completion threshold:
Done when every remaining `runtime*` marker family in `createPlateRuntimeEditor.ts` has a verdict, an owner, a cleanup packet, a proof gate, and a source audit. This is a plan-only run; implementation starts only after review.

Verification surface:
- Source inventory: `rg -n "runtime[A-Z][A-Za-z0-9_]*" packages/core/src/react/editor/createPlateRuntimeEditor.ts`.
- Caller map: `rg -n "runtime[A-Z][A-Za-z0-9_]*" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/*.d.ts'`.
- Source reads: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and `.agents/skills/plate-next/SKILL.md`.
- Final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-plate-next-runtime-marker-cleanup-plan.md`.

Constraints:
- No implementation in this run.
- No compat aliases.
- No public `runtime*` plugin API as the final shape.
- Plite owns substrate extension installation; Plate packages may compose it.
- Plate Core must not be a giant key-based feature router.
- Every implementation packet must keep package tests/typecheck/build green before moving to the next packet.
- Broad command bridge deletion must be package-by-package, not one huge cut.

Boundaries:
- Source of truth: current checkout source and tests.
- Allowed edit scope for future implementation: `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, Core runtime internals, owning package plugins/tests, generated barrels if exports move.
- Browser surfaces: N/A for this planning run.
- Package/API surfaces: `PlateRuntimePlugin`, plugin `extensions`, plugin `tx`, runtime command bridge, and owning package plugin declarations.
- Docs/research surfaces: docs must only change when public API docs mention the old runtime shape.
- Non-goals: committing, staging, browser proof, package migration beyond the plan.

Blocked condition:
Implementation should stop and route to `plate-plan` only if we decide to introduce a new public plugin authoring surface. If we use existing `extensions`, `tx`, and private internals, implementation can proceed via `plate-next`/`auto`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | user asked for full plan, not implementation |
| `plate-next` source rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| `vision` read as checkpoint zero | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md` read |
| Active goal checked or created | yes | created active autogoal |
| Lane resolved | yes | Plate Next runtime marker cleanup plan |
| Invocation mode and timebox recorded | yes | plan-only, no timed minimum |
| Source of truth and allowed workspaces recorded | yes | current checkout source/tests only |
| Output budget strategy recorded | yes | structured inventory from `rg`/Node extraction |
| Release/PR/publish boundary recorded | yes | no git/release action |
| Package/API proof strategy recorded | yes | proof gates below |

## Harsh Summary

`runtime*` is not an API. It is a private migration protocol that leaked into the public `PlateRuntimePlugin` type.

The current shape is bad for three reasons:
- `resolveRuntimePluginConfig` mutates plugins by key (`blockquote`, `caption`, `code_block`, `a`, etc.).
- `applyRuntimePluginMetadata` calls every `installRuntimeX` for every plugin.
- feature packages declare `runtimeFoo: true` instead of owning behavior through `extensions` and `tx`.

Final shape:
- plugin behavior lives in `plugin.extensions` and `plugin.tx`;
- Core installs generic plugin plumbing once;
- no package relies on `runtimeFoo: true`;
- `PlateRuntimePlugin` does not publicly expose `runtime*` fields;
- command fallbacks disappear in favor of `editor.update(tx => tx.*)` and plugin tx groups.

## Inventory

Raw remaining protocol in `PlateRuntimePlugin`:
- feature markers: `runtimeAffinity`, `runtimeBlockquote`, `runtimeCaption`, `runtimeClassicTodoList`, `runtimeCodeBlock`, `runtimeComment`, `runtimeDomOperations`, `runtimeFootnote`, `runtimeIndent`, `runtimeInputRules`, `runtimeLayoutColumn`, `runtimeLink`, `runtimeList`, `runtimeMultiSelect`, `runtimeNavigationFeedback`, `runtimeNodeId`, `runtimeNormalizeTypes`, `runtimeOverrideMergeRules`, `runtimeOverrideNormalizeRules`, `runtimeParser`, `runtimePliteExtensionPipeline`, `runtimePliteReactOverride`, `runtimeSingleBlock`, `runtimeSingleLine`, `runtimeToggle`, `runtimeTrailingBlock`, `runtimeTriggerCombobox`.
- storage/bookkeeping: `runtime*Cleanup`, `runtime*Extension`, `runtimePliteExtensions`, `runtimePliteExtensionsCleanup`.
- command bridge: `runtimeCommands`.

## Verdict Matrix

| Marker family | Current owner | Verdict | Future owner/shape | Notes |
|---|---|---|---|---|
| `runtimePliteExtensions`, `runtimePliteExtensionsCleanup` | Core runtime | hard-cut public field | local internal variables or WeakMap during install | derived from `plugin.extensions`; should never be on public plugin object |
| `runtimePliteExtensionPipeline` | `PliteExtensionPlugin` | hard-cut marker | `PliteExtensionPlugin.extensions` | pure adapter to Plite extensions |
| `runtimePliteReactOverride` | `PliteReactExtensionPlugin` | hard-cut marker | `PliteReactExtensionPlugin.extensions` | React bridge plugin owns this directly |
| `runtimeDomOperations` | `DOMPlugin` | hard-cut marker | `DOMPlugin.extensions` | generic DOM behavior, but Plate-owned DOM plugin can install it |
| `runtimeNodeId` | `NodeIdPlugin` | hard-cut marker | `NodeIdPlugin.extensions` plus package tests | already extracted installer; next step is move ownership to plugin |
| `runtimeParser` | `ParserPlugin` | hard-cut marker | `ParserPlugin.extensions` or parser-owned tx/insert-data extension | keep parser behavior in Core plugin, not central runtime key scan |
| `runtimeInputRules` | `InputRulesPlugin` and implicit fallback | private-bridge then hard-cut | plugin input rules resolver should install one Core extension from resolved rules | fallback for configured rules makes this a two-step packet |
| `runtimeNavigationFeedback` | `NavigationFeedbackPlugin` | hard-cut marker | `NavigationFeedbackPlugin.extensions` | Core plugin owns visual feedback behavior |
| `runtimeAffinity` | `AffinityPlugin` | hard-cut marker | `AffinityPlugin.extensions` or tx group | behavior modifies adjacent editing operations |
| `runtimeOverrideMergeRules`, `runtimeOverrideNormalizeRules` | `OverridePlugin` | private-bridge then hard-cut | root-level extension built from resolved override metadata | needs all plugins; probably stays Core-internal but not public marker |
| `runtimeNormalizeTypes` | `@platejs/utils` NormalizeTypesPlugin | move owner then hard-cut | owning plugin extensions | not Core runtime special-case |
| `runtimeSingleBlock`, `runtimeSingleLine` | `@platejs/utils` plugins | move owner then hard-cut | owning plugin extensions | utility package owns behavior |
| `runtimeTrailingBlock` | `@platejs/utils` TrailingBlockPlugin | move owner then hard-cut | owning plugin extensions | utility package owns behavior |
| `runtimeTriggerCombobox` | mention/slash/emoji/footnote | hard-cut marker | shared trigger-combobox extension factory consumed by feature packages | repeated behavior, package-owned config |
| `runtimeCaption` | `@platejs/caption` | move owner then hard-cut | caption plugin extensions/tx | package already exposes marker tests; rewrite tests to behavior |
| `runtimeFootnote` | `@platejs/footnote` | move owner then hard-cut | footnote plugin extensions/tx | also uses trigger combobox |
| `runtimeComment` | comment path in API extension handling | move owner then hard-cut | comment plugin extension/tx | current detection from `__apiExtensions` is sludge |
| `runtimeCodeBlock` | central key mapping for `code_block` | move owner then hard-cut | code-block package extension/tx | largest feature packet, has many runtime tests |
| `runtimeList` | central key mapping for `list` | move owner then hard-cut | list package extension/tx | large packet, commands must migrate carefully |
| `runtimeLayoutColumn` | central key mapping for `column` | move owner then hard-cut | layout/column package extension/tx | package-owned behavior |
| `runtimeLink` | central key mapping for `a` | move owner then hard-cut | link package extension/tx | package-owned behavior |
| `runtimeIndent` | central key mapping for `indent` | move owner then hard-cut | indent/list package extension/tx | likely shared helper, not central key scan |
| `runtimeMultiSelect` | central key mapping for `tag` | move owner then hard-cut | multi-select/tag package extension/tx | package-owned behavior |
| `runtimeToggle` | central key mapping for `toggle` | move owner then hard-cut | toggle package extension/tx | package-owned behavior |
| `runtimeBlockquote` | central key mapping for `blockquote` | move owner then hard-cut | blockquote/basic-nodes plugin extension/tx | package-owned behavior |
| `runtimeClassicTodoList` | central installer with no external marker | hard-cut or move to owning legacy package | probably delete if no current package owns it | suspicious dead/legacy branch |
| `runtimeCommands` | Core runtime command bridge | private-bridge with deletion gate | plugin tx groups and `editor.update` | biggest blocker; kill after feature packets no longer depend on it |
| `runtime*Cleanup`, `runtime*Extension` | public plugin object | hard-cut public fields | local cleanup registry or WeakMap | never public API |

## Cleanup Order

1. **Make the protocol private**
   - Introduce an internal cleanup registry or local install result map.
   - Remove `runtime*Cleanup`, `runtime*Extension`, `runtimePliteExtensions`, and `runtimePliteExtensionsCleanup` from public `PlateRuntimePlugin`.
   - Keep behavior identical.
   - Proof: Core tests, Core typecheck/build, audit no public cleanup fields.

2. **Delete central key-based mutation**
   - Remove the `if (plugin.key === ...) plugin.runtimeX = true` block.
   - Move each key-owned behavior to the owning plugin package in small packets.
   - Start with smallest packages: blockquote, caption, toggle, trailing-block, single-line/single-block.
   - Proof per package: package tests + Core runtime tests + typecheck/build.

3. **Convert Core-owned markers to `extensions`**
   - DOM operations, node-id, parser, navigation feedback, affinity, Plite extension pipeline, Plite React override.
   - These should be boring plugin-owned `extensions`, not central runtime flags.
   - Proof: focused Core specs for each plugin plus `pnpm turbo typecheck --filter=./packages/core`.

4. **Fix input rules as a resolver-level service**
   - Remove `runtimeInputRules` as a marker.
   - Resolve input rules into one internal extension from `editor.meta.inputRules`.
   - Keep fallback behavior for configured rules without synthesizing a fake plugin object.
   - Proof: Core input-rules specs, package input-rule specs in link/list/math/emoji/mention/code-block.

5. **Extract shared feature factories**
   - Trigger combobox, block toggles, break/reset rules, delete/merge/normalize rule helpers.
   - Only extract when there are at least two package owners and call-site type inference stays good.
   - Proof: package tests and type tests if public types move.

6. **Migrate command bridge users**
   - Replace `plugin.runtimeCommands = ...` with plugin `tx` and Plite transform/operation extensions.
   - Replace tests using `getCurrentRuntimeCommands` with `editor.update` or user-level interaction helpers.
   - Do this package-by-package: trigger-combobox group, toggle, link, list, code-block, layout, media, toc.
   - Proof: package runtime tests, Core runtime tests, source audit for `runtimeCommands` and `getCurrentRuntimeCommands`.

7. **Cut `PlateRuntimePlugin` runtime fields**
   - Once feature packets are migrated, remove all `runtime*` fields from `PlateRuntimePlugin`.
   - Keep only real public plugin config: `extensions`, `tx`, `api`, `options`, `selectors`, `parser`, `inputRules`, render/handlers/rules.
   - Proof: `rg -n "runtime[A-Z]" packages/core/src packages/*/src --glob '!**/dist/**'` only allows unrelated `runtimeId`/test names.

8. **Split `createPlateRuntimeEditor.ts` after cleanup**
   - Do not split the 9k file before deleting the protocol.
   - After markers are gone, split by durable owner: plugin resolution, metadata caches, root React components, DOM wrappers, package-neutral services.
   - Proof: architecture-cleanup pass plus Core tests/typecheck/build.

## Packet Proof Gates

For every implementation packet:
- `pnpm --filter @platejs/core test -- createPlateRuntimeEditor.spec.ts`
- focused package test for touched package, for example `pnpm --filter @platejs/code-block test`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/<package>`
- `pnpm --filter @platejs/core build`
- `pnpm brl` when exports or public files move
- source audit for removed names, scoped to the packet

Broad closure gate after all packets:
- `pnpm check:core`
- `rg -n "runtime[A-Z][A-Za-z0-9_]*" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/*.d.ts'`
- `rg -n "getCurrentRuntimeCommands|runtimeCommands" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/*.d.ts'`

Work Checklist:

- [x] Full prompt copied into plan before implementation.
- [x] `plate-next` skill read.
- [x] `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read.
- [x] All remaining runtime marker families inventoried.
- [x] Each marker family has a verdict.
- [x] Cleanup order defined.
- [x] Proof gates defined.
- [x] Implementation deferred for review.
- [x] Changed list recorded.
- [x] Needs-your-attention list recorded.
- [x] Final plan check ready.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source inventory | yes | inventory remaining runtime markers | 66 raw runtime properties, grouped into feature markers/bookkeeping/command bridge |
| Review matrix | yes | classify every marker family | Verdict Matrix above |
| Implementation safety | yes | stop before patching | plan-only run |
| Package/API proof strategy | yes | define per-packet gates | Packet Proof Gates above |
| Goal plan complete | yes | run check-complete | pending final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | done | prompt, skill, and vision read | inventory |
| Runtime marker inventory | done | 66 raw runtime properties grouped | verdict matrix |
| Verdict matrix | done | all marker families classified | cleanup order |
| Cleanup order | done | eight ordered packets defined | proof gates |
| Proof gates | done | per-packet and broad closure gates defined | handoff |
| Final handoff | done | changed list, review attention, and stopping checkpoints filled | implementation after review |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/oracles/browser proof | none |
| examples/docs | none |
| skills/workflow | none |
| plan | created this runtime marker cleanup plan |

Needs your attention:
| Rank | Item | Why | Recommendation |
|------|------|-----|----------------|
| 1 | Final public shape | I recommend no public `runtime*` fields at all. | Approve existing `extensions` + `tx` as the only public plugin behavior surface. |
| 2 | Command bridge order | `runtimeCommands` is the hardest blocker. | Do not start there; migrate package markers first, then kill command bridge. |
| 3 | Central key mapping | Core currently knows feature keys like `a`, `list`, `code_block`. | Kill this early; packages must own their behavior. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Recommendation |
|----|------|---------------------|----------------|
| SP-1 | API | Should any `runtime*` field remain public? | No. None. Keep everything behind `extensions`, `tx`, or private install registries. |
| SP-2 | Sequencing | Start with command bridge or markers? | Markers first, command bridge later. |
| SP-3 | Source shape | Split `createPlateRuntimeEditor.ts` now? | No. Delete protocol first, split after. |

Verification evidence:
- Read `plate-next`, root vision, common vision, and Plate vision.
- Ran runtime marker inventory and caller map.
- No implementation performed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-plate-next-runtime-marker-cleanup-plan.md`
- Lane: Plate Next runtime marker cleanup plan
- Surface: `packages/core/src/react/editor/createPlateRuntimeEditor.ts`
- Mode: plan-only
- Reviewed: all runtime marker families
- Next owner: `$plate-next` implementation, starting with protocol privacy + central key mapping removal

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plan complete |
| Where am I going? | Run autogoal check, then handoff |
| What is the goal? | Full plan for remaining runtime markers |
| What have I learned? | The flags are a leaked private migration protocol, not real API |
| What changed? | Plan artifact only |

Open risks:
- The plan assumes `extensions` and `tx` are sufficient for all feature behavior. If a package proves otherwise, route the missing substrate to `plite-plan`, not a new `runtime*` flag.
- The current package tests include marker assertions; those must become behavior tests during implementation.
