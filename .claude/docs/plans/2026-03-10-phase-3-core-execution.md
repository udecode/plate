# Phase 3 Core Execution

## Goal

Complete phase 3 for `@platejs/core`.

Use TDD for every new spec cluster. Keep this file as the live record for status, findings, verification, and learnings.

## Baseline

- `packages/core/src` coverage:
  - `79.45%` lines
  - `82.19%` functions
- Current core suite:
  - `623` passing tests
  - `66` spec files
- Current core type-contract lane:
  - `packages/core/type-tests/editor-plugin-contracts.ts`

## Checklist

- [completed] Create phase-3 execution log and maintain it during the phase
- [completed] Expand the compile-only type lane under `packages/core/type-tests`
- [completed] Cover pure plugin composition/injection/change-pipeline hotspots
- [completed] Cover store/selector/react contract hotspots
- [completed] Cover HTML/static/node-id/affinity/event-editor hotspots
- [completed] Merge any durable testing learnings into `testing.mdc`
- [completed] Run final verification for `@platejs/core`

## Findings

- Core still has one thin type-contract fixture and needs multiple focused compile-only files.
- Fresh `lcov` filtered to `packages/core/src` points to these high-value low-coverage hotspots first:
  - `internal/plugin/pluginInjectNodeProps.ts`
  - `lib/utils/overridePluginsByKey.ts`
  - `lib/utils/getInjectMatch.ts`
  - `react/stores/plate/createPlateStore.ts`
  - `lib/plugins/node-id/withNodeId.ts`
  - `react/utils/pipeOnChange.ts`
- Useful upstream `slate-react` invariants remain the same shortlist:
  - `use-slate-selector`
  - `use-slate`
  - `use-selected`
  - `editable`
  - `decorations`
- Low-ROI core render wrappers like `PlateContainer`, `PlateView`, and `ContentVisibilityChunk` stay deferred unless a real invariant forces them in.
- Mixed Slate-only and Plate-react type fixtures produce useless cross-type noise fast. Keep nested plugin/configure coverage Slate-only, and prove Plate-specific editor/value inference in a separate narrow contract.
- `usePluginOption(plugin, 'state')` was typed as supported but broken at runtime. Phase 3 fixes that contract instead of papering over it in tests.
- `withNodeId` can be covered directly, but Bun needs `NodeIdPlugin` loaded first to avoid a module-cycle false start during the spec import.

## Progress

- Created phase-3 execution log.
- Replaced the old single core type fixture with focused compile-only files:
  - `slate-plugin-contracts.ts`
  - `plate-plugin-contracts.ts`
  - `editor-configure-contracts.ts`
- `pnpm test:types` is green with the split core fixtures.
- Added direct runtime specs for previously bare seams:
  - `pluginInjectNodeProps`
  - `getInjectMatch`
  - `overridePluginsByKey`
  - `omitPluginContext` (lib and react)
  - `pipeOnChange`
  - `pipeOnNodeChange`
  - `pipeOnTextChange`
- Added focused store and hook specs for:
  - `createPlateStore`
  - `usePluginOption`
  - `useEditorPlugin`
  - `useElementSelector`
- Added pure helper specs for:
  - `copyBlockMarksToSpanChild`
  - `cleanHtmlTextNodes`
  - `cleanHtmlLinkElements`
  - `removeHtmlNodesBetweenComments`
  - `getHtmlComments`
  - `getDataNodeProps`
  - `stripHtmlClassNames`
  - `getMarkBoundaryAffinity`
  - `getEventPlateId`
  - `useEventPlateId`
  - `useFocusEditorEvents`
- Added a direct `withNodeId` unit suite that covers:
  - insert-node duplicate stripping
  - `_id` override handoff
  - split-node id reuse vs regeneration
  - `filterText`-driven id removal
  - frozen-node cloning for `insertNode` / `insertNodes`
  - empty insert batch early return
- Final package coverage from `lcov`:
  - `packages/core/src`: `89.16%` lines, `89.12%` funcs
  - `withNodeId.ts`: `100%` lines, `100%` funcs
  - `createPlateStore.ts`: `100%` lines, `100%` funcs
  - `usePluginOption.ts`: `100%` lines, `100%` funcs
- Final core suite:
  - `678` passing tests
  - `90` spec files
- `bun run test:slowest -- --top 15 packages/core/src` stayed under slow-bucket thresholds for new phase-3 specs. No `test-suites` move was needed.
- Added a patch changeset for the runtime fix:
  - `.changeset/core-use-plugin-option-state-patch.md`

## Verification

- `pnpm test:types`
- `bun test packages/core/src/lib/utils/overridePluginsByKey.spec.ts packages/core/src/lib/utils/omitPluginContext.spec.ts packages/core/src/react/plugin/omitPluginContext.spec.ts packages/core/src/lib/utils/pipeOnNodeChange.spec.ts packages/core/src/lib/utils/pipeOnTextChange.spec.ts packages/core/src/react/utils/pipeOnChange.spec.ts packages/core/src/lib/utils/getInjectMatch.spec.ts packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts`
- `bun test packages/core/src/react/stores/plate/createPlateStore.spec.tsx packages/core/src/react/stores/plate/usePluginOption.spec.tsx packages/core/src/react/stores/plate/useEditorPlugin.spec.tsx packages/core/src/react/stores/element/useElementSelector.spec.tsx`
- `bun test packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.spec.ts packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.spec.ts packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.spec.ts packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.spec.ts packages/core/src/lib/plugins/html/utils/getHtmlComments.spec.ts packages/core/src/lib/plugins/html/utils/getDataNodeProps.spec.ts packages/core/src/static/utils/stripHtmlClassNames.spec.ts packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts packages/core/src/react/plugins/event-editor/getEventPlateId.spec.ts packages/core/src/react/stores/event-editor/useEventPlateId.spec.tsx packages/core/src/react/plugins/event-editor/useFocusEditorEvents.spec.tsx`
- `bun test packages/core/src/lib/plugins/node-id/withNodeId.spec.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/core`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm test:types`
- `bun lint:fix`
- `bun test packages/core/src`
- `bun run test:slowest -- --top 15 packages/core/src`
- `bun test --coverage --coverage-reporter=lcov --coverage-dir=/tmp/plate-core-phase3-coverage packages/core/src`
- `bun typecheck`
  - failed outside phase scope in `packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx`
  - error: readonly tuple `['_***', '***_']` not assignable to mutable `MatchRange[]`

## Learnings

- `package reality`: mixed Slate/Plate nested fixtures create garbage type errors that hide the real contract. Separate Slate-only configure chains from Plate-only editor inference tests.
- `package reality`: core editor creation can trigger change handlers during setup. Clear handler mocks after creating the editor before asserting `pipeOn*Change` behavior.
- `bug found`: `usePluginOption(plugin, 'state')` needed a dedicated runtime branch. The type contract existed before the runtime contract did.
- `package reality`: `usePlateStore()` can hand back equivalent wrapper APIs over the same underlying store. Compare the inner `.store` when a test cares about identity.
- `package reality`: `useIncrementVersion` and `useRedecorate` keep separate local counters. Calling both is not additive on the same version key.

## Errors

- `bun typecheck` failed outside `@platejs/core` in `packages/autoformat/src/lib/__tests__/withAutoformat/markup.spec.tsx`.
