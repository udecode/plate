# Slate v2 Root Runtime Selector Guard Hard-Cut Plan

## Status

Done.

Execution started from `complete-plan` on 2026-04-28.

Execution completed on 2026-04-28.

Current next owner: none. Completion target met.

## Goal

Close the remaining React/runtime architecture findings without touching public
DX yet.

This plan covers only:

1. Named root selector sources.
2. `EditableDOMRoot` root runtime ownership.
3. Static guards that prevent root policy and broad selectors from returning.

Public `renderVoid` / void-shell DX work is intentionally out of scope. It
comes after this internal runtime cut.

## Current Fact Check

The pasted review is directionally right but stale in one important detail.

`EditableTextBlocks` already consumes `useLargeDocumentRootSources(...)` and
`usePlaceholderValue(...)` from `root-selector-sources.ts`. So Finding 2 is not
"inline generic selectors still sit directly in `editable-text-blocks.tsx`" in
the current checkout.

The remaining problem is stricter:

- `root-selector-sources.ts` still owns generic `useSlateSelector(...)` calls.
- That is acceptable only if this module is the named source boundary.
- Static guards must make sure hot render components do not rebuild generic
  selectors inline.
- `EditableDOMRoot` still wires too much runtime orchestration directly.

## North Star

React wires refs, listeners, props, and rendered children.

Runtime modules own editing policy, selection import/export, repair, Android,
composition, tracing, force render, and root selector facts.

No hot render component should contain broad selector predicates or snapshot
walks inline.

## Non-Goals

- Do not add `renderVoid`.
- Do not introduce Plate-style node specs into Slate.
- Do not change Slate document shape or operation semantics.
- Do not move slow generated stress into default `bun check`.
- Do not hide broad root invalidation behind friendlier names without guards.
- Do not rewrite the event runtime facade completed on 2026-04-27 unless this
  plan exposes a direct regression.

## Target Shape

### Named Root Selector Sources

`EditableTextBlocks` should consume named facts only:

```ts
const rootSources = useEditableRootSources({
  largeDocumentConfig,
  placeholder,
  promotedIslandIndex,
})
```

or the equivalent split hooks:

```ts
const topLevelRuntimeIds = useRootRuntimeIds()
const selectedTopLevelIndex = useSelectedTopLevelIndex(enabled)
const placeholderValue = usePlaceholderValue(placeholder)
const islandPlan = useLargeDocumentRootSources(...)
```

Allowed generic selector owner:

- `packages/slate-react/src/editable/root-selector-sources.ts`

Forbidden generic selector owners:

- `components/editable-text-blocks.tsx`
- `components/editable.tsx`
- mounted node/text/leaf render components once a node/text/source selector
  exists

### Editable Root Runtime

`EditableDOMRoot` should instantiate one root runtime facade:

```ts
const rootRuntime = useEditableRootRuntime({
  editor,
  inputController,
  readOnly,
  rootRef: ref,
  scrollSelectionIntoView,
  shellBackedSelection,
  state,
})
```

It should receive runtime-owned capabilities:

```ts
const {
  androidInputManagerRef,
  callbackRef,
  eventRuntime,
  isComposing,
  repairRuntime,
  selectionRuntime,
  traceRuntime,
} = rootRuntime
```

`EditableDOMRoot` may attach returned refs/listeners and render. It should not
decide policy.

### Static Guard Boundary

Add authority tests that fail when forbidden root code returns:

- direct `useSlateSelector(...)` in `EditableDOMRoot`
- direct `useSlateSelector(...)` in `EditableTextBlocks`
- direct `Editor.getSnapshot(...)` in `EditableTextBlocks`
- direct selectionchange handler construction in `EditableDOMRoot`
- direct Android engine construction in `EditableDOMRoot`
- direct selection reconciler setup in `EditableDOMRoot`
- direct repair runtime setup in `EditableDOMRoot`
- direct kernel trace runtime setup in `EditableDOMRoot`
- direct root commit wakeup call in `EditableDOMRoot`
- direct global drag lifecycle attachment in `EditableDOMRoot`

The only tolerated imports in `EditableDOMRoot` should be root facades and
React-only presentation helpers.

## Execution Phases

### Phase 0: Live Inventory And Guard Baseline

Purpose: make the lane honest before moving code.

Actions:

- Read current `EditableDOMRoot`, `EditableTextBlocks`, and
  `root-selector-sources.ts`.
- Add or update inventory tests that describe the current root ownership count.
- Separate three buckets:
  - already-correct named source ownership
  - tolerated root wiring
  - policy that must move into runtime modules

Acceptance:

- Guard explains why `root-selector-sources.ts` may use generic
  `useSlateSelector(...)`.
- Guard fails if `EditableTextBlocks` adds inline generic selectors or snapshot
  reads.
- Guard fails if `EditableDOMRoot` adds inline generic selectors.

Likely files:

- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`

Driver gates:

```sh
bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx
bun --filter slate-react typecheck
```

### Phase 1: Finish Named Root Selector Sources

Purpose: complete item 1 without over-building.

Actions:

- Keep root selector bodies inside `root-selector-sources.ts`.
- Rename or split hooks only if it makes the contract sharper:
  - `useRootRuntimeIds`
  - `useSelectedTopLevelIndex`
  - `usePlaceholderValue`
  - `useLargeDocumentRootSources`
  - `useEditableRootCommitWakeup`
- Consider a small facade `useEditableRootSources(...)` only if it reduces
  root component churn and test setup.
- Move equality and `shouldUpdate` predicates beside each source.
- Add tests for the selector predicates if current coverage does not prove
  selection-only and text-only operations avoid broad root rerenders.

Acceptance:

- `EditableTextBlocks` has no `useSlateSelector(...)`.
- `EditableTextBlocks` has no `Editor.getSnapshot(...)`.
- Root selector facts are named and documented by tests.
- Selection-only operations do not invalidate top-level runtime ids.
- Text-only operations do not invalidate top-level runtime ids.
- Placeholder updates ignore selection-only operations.

Driver gates:

```sh
bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx
bun --filter slate-react typecheck
```

Browser gates if root rendering changes:

```sh
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/large-document-runtime.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium
```

### Phase 2: Introduce `useEditableRootRuntime(...)`

Purpose: close the remaining Finding 1 owner, not just shrink the file.

Actions:

- Add `editable/runtime-root-engine.ts` or equivalent.
- Move root runtime orchestration out of `EditableDOMRoot`:
  - Android input manager lifecycle
  - selectionchange handler and scheduler construction
  - selection import controller construction
  - selection-only DOM export subscription
  - repair runtime construction
  - kernel trace runtime construction
  - root commit wakeup
  - global selectionchange listener attachment
  - global drag lifecycle listener attachment
  - root callback ref composition
- Keep event family assembly inside `useEditableEventRuntime(...)`.
- `useEditableRootRuntime(...)` may compose existing runtime modules, but it
  must not become a dumping ground. It should read like orchestration of named
  runtime capabilities.

Acceptance:

- `EditableDOMRoot` calls `useEditableRootRuntime(...)`.
- `EditableDOMRoot` does not construct selectionchange handlers directly.
- `EditableDOMRoot` does not construct Android manager directly.
- `EditableDOMRoot` does not construct repair or trace runtimes directly.
- `EditableDOMRoot` does not subscribe to selector runtime directly.
- `EditableDOMRoot` attaches returned refs/listeners and renders.
- Existing event runtime facade remains the only event handler owner exposed to
  the root component.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-kernel-trace.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`

Driver gates:

```sh
bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx
bun --filter slate-react typecheck
bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/selection-runtime-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts test/target-runtime-contract.test.ts
```

Browser gates:

```sh
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "hovering toolbar|paste|undo|search"
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium
```

### Phase 3: Hard Guards For Root Policy

Purpose: make the architecture durable.

Actions:

- Extend `kernel-authority-audit-contract.ts` with a root runtime inventory.
- Guard `EditableDOMRoot` forbidden calls/imports.
- Guard `EditableTextBlocks` selector ownership.
- Guard root selector source ownership so the only generic selector calls in
  this category live in `root-selector-sources.ts`.
- Add a "no broad root selector in hot render components" test with explicit
  allowlist.

Forbidden in `EditableDOMRoot` after this phase:

```txt
useSlateSelector(
Editor.getSnapshot(
useEditableRootCommitWakeup(
useRuntimeAndroidEngine(
createRuntimeSelectionChangeHandler(
createRuntimeSelectionChangeScheduler(
createRuntimeSelectionImportController(
useEditableSelectionReconciler(
subscribeSelectionOnlyDOMExport(
useRuntimeRepairEngine(
useRuntimeKernelTraceEngine(
attachEditableSelectionChangeListener(
attachEditableGlobalDragLifecycleListeners(
```

Allowed:

```txt
useEditableRootRuntime(
useEditableEventRuntime(
useEditableRootRef( only if root ref composition stays React-only )
```

If root ref composition needs selection/event policy, move it behind
`useEditableRootRuntime(...)` too.

Acceptance:

- Static guard fails on direct root policy reintroduction.
- Static guard keeps root selector ownership narrow.
- Authority test names owner and rationale for every remaining allowed bridge.

Driver gates:

```sh
bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx
bun --filter slate-react typecheck
```

### Phase 4: Closure Proof

Purpose: prove this was not cosmetic.

Actions:

- Run focused unit gates.
- Run focused browser rows for user-reported families:
  - hovering toolbar mouse selection
  - search input focus retention
  - mentions inline void navigation
  - tables arrow-right cell boundary
  - images block void navigation
  - large-document runtime
- Run lint fix after code movement.
- Run `bun check:full` only when the lane is otherwise complete.

Final gates:

```sh
bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx
bun --filter slate-react typecheck
bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/selection-runtime-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts test/target-runtime-contract.test.ts
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "hovering toolbar|paste|undo|search"
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium
bun lint:fix
bun check:full
```

Completion criteria:

- `EditableTextBlocks` consumes named root selector sources only.
- Generic root selectors are isolated to `root-selector-sources.ts`.
- `EditableDOMRoot` calls one root runtime facade for root policy.
- `EditableDOMRoot` calls one event runtime facade for event handlers.
- Static guards fail if hot policy returns to `EditableDOMRoot`.
- Focused browser rows pass.
- `bun check:full` passes.

## Risk Register

### Risk: `useEditableRootRuntime(...)` becomes a new god hook

Mitigation:

- Keep worker modules named and separate.
- The root runtime facade composes capabilities; it should not contain selection
  or repair algorithms inline.
- Authority guard should count policy calls by worker file.

### Risk: root selectors are renamed but not improved

Mitigation:

- Do not accept wrapper-only moves unless guards prove hot components no longer
  own generic selectors.
- Keep `shouldUpdate` predicates next to selector ownership.

### Risk: browser timing changes around selectionchange

Mitigation:

- Extract one owner at a time.
- Use hovering toolbar, search, mentions, tables, images, and large-document
  rows before closure.
- Do not mark complete without `bun check:full`.

### Risk: plan conflicts with completed 2026-04-27 lane

Mitigation:

- Treat the 2026-04-27 event runtime lane as closed.
- This plan only handles root runtime orchestration and selector guard hardening
  that sits above/beside that event runtime.

## Activation Notes

When execution starts:

- Update `tmp/completion-check.md` to `status: pending`.
- Refresh `tmp/continue.md` with this plan.
- Keep status `pending` while any phase has a runnable next move.
- Set `done` only after Phase 4 final gates pass.
- Set `blocked` only when no autonomous progress is possible.

## Execution Ledger

### 2026-04-28 Activation And Phase 0 Checkpoint

Actions:

- Activated this plan through `complete-plan`.
- Set `tmp/completion-check.md` to `status: pending`.
- Refreshed `tmp/continue.md` for this lane.
- Added root selector source ownership guards to
  `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`.
- Added current `EditableDOMRoot` root runtime orchestration inventory for the
  Phase 2 burn-down.
- Classified the existing `Editor.getSnapshot(...)` read in
  `EditableTextBlocks` as mounted-node child runtime-id resolution, not root
  selector debt.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`

Evidence:

- Authority/surface guard passed: 2 files, 17 tests.
- `slate-react` typecheck passed.

Changed files:

- `tmp/completion-check.md`
- `tmp/continue.md`
- `docs/plans/2026-04-28-slate-v2-root-runtime-selector-guard-hard-cut-plan.md`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. The plan's stale-review correction is now executable: generic
  root selector calls are allowed only in `root-selector-sources.ts`, and the
  remaining root runtime orchestration is inventoried before moving policy.

Rejected tactics:

- Do not force `EditableTextBlocks` to zero `Editor.getSnapshot(...)` in this
  lane. The current read is inside the mounted node selector for child runtime
  id resolution, not the root selector path named by the review.

Next action:

- Execute Phase 1: finish named root selector sources and add behavior tests
  for root selector update predicates if current coverage does not already
  prove text-only and selection-only invalidation behavior.

### 2026-04-28 Phase 1 Checkpoint

Actions:

- Reviewed existing root selector source coverage.
- Kept the split root source hooks instead of adding a facade, because
  `EditableTextBlocks` already consumes named root facts clearly.
- Added a provider hook test proving `usePlaceholderValue(...)` ignores
  selection-only commits.

Commands:

- `bun --filter slate-react test:vitest test/provider-hooks-contract.test.tsx`
- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`

Evidence:

- Provider hooks contract passed: 1 file, 10 tests.
- Authority/surface guard passed: 2 files, 17 tests.
- `slate-react` typecheck passed.

Changed files:

- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `docs/plans/2026-04-28-slate-v2-root-runtime-selector-guard-hard-cut-plan.md`

Decision:

- Keep course. Root selector source behavior now has focused coverage for
  structural ids, selected top-level index, and placeholder selection-only
  invalidation.

Rejected tactics:

- Do not add `useEditableRootSources(...)` yet. The split hooks are already
  named, and a facade would be cosmetic unless Phase 2 proves it reduces root
  runtime wiring.

Next action:

- Execute Phase 2: introduce `useEditableRootRuntime(...)` and move remaining
  root runtime orchestration out of `EditableDOMRoot`.

### 2026-04-28 Phase 2 And Phase 3 Checkpoint

Actions:

- Added `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`.
- Moved root runtime orchestration behind `useEditableRootRuntime(...)`.
- Kept event handler assembly behind `useEditableEventRuntime(...)`.
- Reduced `EditableDOMRoot` to root facade wiring, event facade wiring, refs,
  listeners, props, and rendering.
- Updated authority guards so root policy imports and calls fail if they return
  to `EditableDOMRoot`.
- Kept root selector sources fenced to
  `../slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`.
- Updated the release escape-hatch inventory after the extraction removed one
  stale `slate-react/src` core-field reference.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/selection-runtime-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts test/target-runtime-contract.test.ts`
- `bun lint:fix`
- `bun test ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1`

Evidence:

- Authority/surface guard passed: 2 files, 17 tests.
- `slate-react` typecheck passed.
- Selection/editing kernel contracts passed: 4 files, 35 tests.
- `bun lint:fix` passed after removing stale `EditableDOMRoot` destructures.
- Escape-hatch inventory contract passed: 3 tests.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`
- `docs/plans/2026-04-28-slate-v2-root-runtime-selector-guard-hard-cut-plan.md`

Decision:

- Keep the new root facade. It is the right boundary for this lane: React owns
  attachment and rendering; runtime modules own root policy.

Rejected tactics:

- Do not inline root selector or selection policy back into `EditableDOMRoot`
  for convenience.
- Do not create a public render API change in this lane. Void/DX work remains a
  separate public API lane.

Next action:

- Execute Phase 4 closure proof.

### 2026-04-28 Phase 4 Completion Checkpoint

Actions:

- Ran focused browser rows for the user-reported regression families.
- Ran the final full local gate after focused unit, type, lint, build, release,
  persistent soak, and browser proof passed.
- Marked this lane complete after `bun check:full` passed.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx test/provider-hooks-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/selection-runtime-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts test/target-runtime-contract.test.ts`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "hovering toolbar|paste|undo|search"`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
- `bun check:full`

Evidence:

- Post-lint authority/provider guards passed: 3 files, 27 tests.
- `slate-react` typecheck passed.
- Selection/editing kernel contracts passed: 4 files, 35 tests.
- Targeted build passed for `slate-browser`, `slate-dom`, and `slate-react`;
  the existing `is-hotkey` unresolved external warning remained non-fatal.
- Focused browser pass:
  - hovering toolbar mouse selection
  - richtext paste and undo
  - search focus retention
  - mentions inline-void navigation
  - tables cell-boundary navigation
  - images block-void navigation
  - large-document runtime
- `bun check:full` passed:
  - lint passed
  - package/site/root typecheck passed
  - default tests passed: 1050 pass, 95 skip, 0 fail
  - `slate-react` vitest passed: 18 files, 105 tests
  - release discipline passed: 83 tests
  - `slate-browser` proof passed: 20 tests
  - scoped mobile proof passed
  - persistent-profile soak passed: 5 iterations
  - integration browser sweep passed: 628 passed, 4 skipped

Changed files:

- `tmp/completion-check.md`
- `docs/plans/2026-04-28-slate-v2-root-runtime-selector-guard-hard-cut-plan.md`

Decision:

- Completion target met. The two reviewed issues are resolved for this lane:
  `EditableDOMRoot` no longer owns root policy bodies, and hot root render
  selector ownership is fenced by named source modules plus guards.

Rejected tactics:

- Do not run additional slow stress beyond `bun check:full` for this lane. The
  requested browser regression families are covered by focused rows and the
  full integration matrix.

Next action:

- Public DX work can start in a separate lane: runtime-owned void shells and
  author-facing render API cleanup.
