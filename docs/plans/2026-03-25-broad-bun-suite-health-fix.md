---
title: Broad Bun Suite Health Fix
type: testing
date: 2026-03-25
status: completed
---

# Broad Bun Suite Health Fix

## Goal

Make the broad Bun package-graph sweep honest again after the non-React coverage passes.

## Scope

- Reproduce the shared failure in the broad Bun package-graph run.
- Find the first real shared root cause instead of blaming random product files.
- Fix the smallest honest seam.
- Re-run the broad Bun sweep plus build-first verification for touched packages.

## Phase Plan

- [completed] Reproduce the broad Bun failure and narrow the first shared culprit
- [completed] Fix the first shared suite-health root cause
- [completed] Re-run the broad Bun sweep
- [completed] Run build, typecheck, lint, and capture reusable learning

## Findings

- The first broad failure presents as `editor.tf` being undefined inside [SlateExtensionPlugin.ts](/Users/zbeyens/git/plate/packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts).
- That symptom is misleading.
- [getLinkAttributes.spec.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/getLinkAttributes.spec.ts) passes alone and fails only when paired with [floatingLinkTriggers.spec.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/floatingLinkTriggers.spec.ts).
- That makes the current first culprit test pollution, not a random product regression.
- [useTableMergeState.spec.tsx](/Users/zbeyens/git/plate/packages/table/src/react/hooks/useTableMergeState.spec.tsx) was the second poison pill: it replaced the whole `../../lib` barrel with a partial mock surface.
- [useElementStore.spec.tsx](/Users/zbeyens/git/plate/packages/core/src/react/stores/element/useElementStore.spec.tsx) was still dumping expected `USE_ELEMENT_CONTEXT` warnings into the broad run because the spec harness used the default debug logger.

## Outcome

- Broad Bun package-graph sweep is green again.
- The product code in `SlateExtensionPlugin` was not the root cause.
- The actual fix was test-harness cleanup:
  - [floatingLinkTriggers.spec.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/floatingLinkTriggers.spec.ts) now spies on `platejs.getEditorPlugin` instead of mocking all of `platejs`
  - [useTableMergeState.spec.tsx](/Users/zbeyens/git/plate/packages/table/src/react/hooks/useTableMergeState.spec.tsx) now spies on `platejs/react` and `../../lib` exports instead of replacing whole modules
  - [useElementStore.spec.tsx](/Users/zbeyens/git/plate/packages/core/src/react/stores/element/useElementStore.spec.tsx) now overrides `DebugPlugin` in the test editor so warning-path coverage stays quiet

## Verification

- Repro combo:
  - `bun test packages/link/src/react/utils/getLinkAttributes.spec.ts packages/link/src/react/utils/floatingLinkTriggers.spec.ts`
- Table pair:
  - `bun test packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx packages/table/src/react/hooks/useTableMergeState.spec.tsx`
- Package slice:
  - `bun test packages/table/src`
- Broad sweep:
  - `bun test packages/link/src packages/markdown/src packages/core/src packages/autoformat/src packages/basic-nodes/src packages/table/src packages/list-classic/src packages/suggestion/src`
- Noise cleanup:
  - `bun test packages/core/src/react/stores/element/useElementStore.spec.tsx`
- Build-first gate:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/link --filter=./packages/table`
  - `pnpm turbo typecheck --concurrency=1 --filter=./packages/link --filter=./packages/table`
  - `pnpm lint:fix`

## Learning

- Shared package mocks should be local spies, not partial Bun module replacements. See [2026-03-25-shared-package-mocks-should-be-local-spies-not-partial-bun-module-replacements.md](/Users/zbeyens/git/plate/docs/solutions/test-failures/2026-03-25-shared-package-mocks-should-be-local-spies-not-partial-bun-module-replacements.md).
- Warning-path React specs should capture `debug.warn` in their harness. See [2026-03-25-warning-path-react-specs-should-capture-debug-warn-in-their-harness.md](/Users/zbeyens/git/plate/docs/solutions/test-failures/2026-03-25-warning-path-react-specs-should-capture-debug-warn-in-their-harness.md).
