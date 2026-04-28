# Slate v2 Editable Event Runtime Hard-Cut Plan

## Status

Active.

Execution started from `complete-plan` on 2026-04-27.

Current next owner: `slate-react` Editable event-runtime boundary.

## Problem

The previous Editable runtime/root selector lane moved direct hot policy bodies
out of `EditableDOMRoot`. That was the right cut.

It is not the final architecture.

`EditableDOMRoot` still assembles the editor event runtime in React component
closures:

- beforeinput and React beforeinput fallback
- input and input capture
- paste, copy, cut, drag, and drop
- composition start/update/end
- focus, blur, click, mouse down, mouse up
- keydown
- selection import controller wiring
- repair request wiring
- kernel frame and trace wiring
- Android manager wiring
- shell-backed selection state transitions
- browser handle attachment

Policy bodies are mostly in runtime/strategy modules now, but the component is
still the traffic controller. For React 19.2-perfect runtime, that is still too
much React ownership.

## North Star

React attaches the editor.

The event runtime drives the editor.

`EditableDOMRoot` should:

- resolve props
- own React refs and context providers
- instantiate one event runtime hook
- attach returned stable handlers
- render the editable root and children

`EditableDOMRoot` should not:

- call `prepareEditable*Kernel(...)`
- call `applyEditable*Strategy(...)`
- record kernel trace payloads
- branch on browser editing policy
- decide selection import/export timing
- request repair directly from individual event handlers
- thread `forceRender` through event-family code
- recreate hot handlers because app callback props changed

## Target Shape

### Runtime Facade

Add an internal event runtime facade:

- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`

Preferred hook shape:

```ts
const eventRuntime = useEditableEventRuntime({
  androidInputManagerRef,
  attributes,
  browserHandleNextId,
  browserHandleRangeRefs,
  deferredOperations,
  editor,
  inputController,
  inputRules,
  isShellBackedSelection,
  largeDocument,
  onKeyCommand,
  onUserInput,
  readOnly,
  rootRef,
  scrollSelectionIntoView,
  setExplicitShellBackedSelection,
  setIsComposing,
  shellBackedSelection,
})
```

Returned shape:

```ts
{
  attachBrowserHandle(): void
  handlers: EditableRootEventHandlers
  repair: EditableRepairRuntime
  selection: EditableSelectionRuntime
}
```

Exact names can change. Ownership cannot.

### Event Family Modules

Do not make one new giant file. The facade should compose smaller owners:

- `runtime-before-input-events.ts`
- `runtime-input-events.ts`
- `runtime-clipboard-events.ts`
- `runtime-composition-events.ts`
- `runtime-focus-mouse-events.ts`
- `runtime-keyboard-events.ts`
- `runtime-drag-events.ts`
- `runtime-browser-handle-events.ts`

Keep existing strategy modules as workers. The event runtime orchestrates event
families; it should not swallow every mutation algorithm.

### Stable Handler Contract

App callbacks should not churn hot handler identity.

Use callback refs or a tiny internal `useLatestEditableProps(...)` helper for:

- `attributes.onBeforeInput`
- `attributes.onInput`
- `attributes.onKeyDown`
- clipboard callbacks
- composition callbacks
- focus/mouse callbacks
- `onKeyCommand`
- `inputRules`

The hot root handlers should be stable across ordinary app prop callback
changes when editor/runtime identity is unchanged.

This follows the React 19.2 performance posture:

- transient hot editing state lives in refs/runtime objects
- React state is only for visible render facts
- event handlers do not resubscribe broad editor state
- non-urgent proof or UI updates do not sit in the typing path

## Hard Cuts

### Cut 1: `EditableDOMRoot` Stops Importing Event Workers

After this lane, `components/editable.tsx` should not import event worker
families directly:

- `clipboard-input-strategy`
- `composition-state` event applicators
- `editing-kernel` prepare functions
- `keyboard-input-strategy`
- `model-input-strategy`
- `native-input-strategy`
- event-facing `selection-reconciler` workers

It may import render-only helpers, contexts, types, and the event runtime hook.

### Cut 2: Event Runtime Owns Handler Assembly

All root handlers are assembled in runtime modules:

- `onDOMBeforeInput`
- `onReactBeforeInput`
- `onDOMInput`
- `onInputCapture`
- `onPaste`
- `onCopy`
- `onCut`
- `onDragStart`
- `onDragOver`
- `onDragEnd`
- `onDrop`
- `onCompositionStart`
- `onCompositionUpdate`
- `onCompositionEnd`
- `onFocus`
- `onBlur`
- `onClick`
- `onMouseDown`
- `onMouseUp`
- `onKeyDown`

`EditableDOMRoot` spreads or assigns `eventRuntime.handlers`.

### Cut 3: Selection And Repair Are Runtime Inputs, Not Handler Locals

Event handlers use named runtime capabilities:

- `eventRuntime.selection.flushSelectionChange()`
- `eventRuntime.selection.applyKeyDownSelectionPolicy(...)`
- `eventRuntime.selection.syncDOMSelectionFromRuntime()`
- `eventRuntime.repair.request(...)`
- `eventRuntime.trace.record(...)`

No event handler in `EditableDOMRoot` calls those directly because the handler
is not in `EditableDOMRoot`.

### Cut 4: Static Guards Prevent Backslide

Add guards that fail when `EditableDOMRoot` imports or calls forbidden event
workers.

Do not rely on code review memory. The next rushed patch must fail locally.

## Execution Plan

### Phase 0: Freeze The Current Event Surface

Purpose: prove the plan is moving the real current surface, not stale debt.

Actions:

- Inventory every handler closure in `EditableDOMRoot`.
- Inventory every imported event worker in `components/editable.tsx`.
- Add a package contract that records the current forbidden/import owner list.
- Classify any allowed remaining import as:
  - render-only
  - root ref/context wiring
  - event runtime facade
  - temporary bridge with burn-down owner

Acceptance:

- `EditableDOMRoot` event imports are listed in one guard.
- The guard names the final owner for each import family.
- No behavior moves before the inventory is green.

Likely files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`

Driver gate:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`

### Phase 1: Create The Event Runtime Facade

Purpose: introduce the owner without changing behavior.

Actions:

- Add `runtime-event-engine.ts`.
- Move no event behavior yet.
- Define `EditableRootEventHandlers` and runtime input/output types.
- Thread existing runtime engines through the facade:
  - selection change runtime
  - selection import controller
  - repair runtime
  - kernel trace runtime
  - composition runtime
  - Android runtime
- Return the existing handler values unchanged through the facade where needed.

Acceptance:

- `EditableDOMRoot` can instantiate `useEditableEventRuntime(...)`.
- Existing tests pass before any event-family extraction.
- No public API changes.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-repair-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-kernel-trace.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Driver gate:

- `bun --filter slate-react typecheck`

### Phase 2: Move Low-Risk Event Families First

Purpose: shrink `EditableDOMRoot` without touching the most timing-sensitive
input path first.

Move these families into runtime event modules:

1. copy/cut/paste
2. drag/drop
3. focus/blur/click/mousedown/mouseup

Acceptance:

- `EditableDOMRoot` no longer defines those handler closures.
- Clipboard and mouse selection kernel traces stay identical.
- Hovering toolbar row still shows the toolbar after mouse selection.
- Paste/normalize/undo stress family still replays.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-clipboard-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-drag-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Driver gates:

- `bun --filter slate-react test:vitest test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "hovering toolbar|paste|undo"`

### Phase 3: Move Composition And Android Event Assembly

Purpose: isolate platform event assembly before the native input path moves.

Actions:

- Move composition start/update/end handlers into
  `runtime-composition-events.ts`.
- Keep composition state transitions in `runtime-composition-engine.ts`.
- Keep Android lifecycle in `runtime-android-engine.ts`.
- Event runtime wires the Android ref to composition/input workers.

Acceptance:

- `EditableDOMRoot` no longer assembles composition handlers.
- Composition handlers do not recreate when app composition callbacks change.
- IME stress rows keep model text, focus owner, and trace assertions green.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-composition-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`

Driver gates:

- `bun --filter slate-react test:vitest test/editing-epoch-kernel-contract.test.ts`
- `STRESS_FAMILIES=selection-repair-ime PLAYWRIGHT_RETRIES=0 bun test:stress`

### Phase 4: Move Beforeinput And Input Event Assembly

Purpose: cut the hardest React-owned path.

Actions:

- Move native `beforeinput` handler assembly into
  `runtime-before-input-events.ts`.
- Move React fallback beforeinput assembly into the same owner.
- Move input and input-capture handler assembly into
  `runtime-input-events.ts`.
- Keep existing worker modules for actual mutation decisions.
- Preserve selection import timing exactly:
  - flush selectionchange before model-owned beforeinput
  - honor internal targets
  - preserve Android beforeinput branch
  - preserve WebKit shadow DOM branch
  - preserve duplicate epoch command guard
  - preserve model-owned native history repair

Acceptance:

- `EditableDOMRoot` no longer imports or calls beforeinput/input strategy
  workers.
- Native word-delete row stays green with retries disabled.
- Search highlighting input keeps focus.
- Placeholder type/delete/undo does not regress.
- Direct DOM text sync does not introduce public stale selector policy.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`

Driver gates:

- `bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/editing-kernel-contract.test.ts test/surface-contract.test.tsx`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium --grep "native word-delete|search|placeholder"`

### Phase 5: Move Keydown Event Assembly

Purpose: finish hot keyboard ownership.

Actions:

- Move keydown handler assembly into `runtime-keyboard-events.ts`.
- Event runtime owns:
  - `prepareEditableKeyDownKernel(...)`
  - selection policy application
  - keydown event frame creation
  - keyboard worker invocation
  - arrow-up/down deferred DOM selection sync
  - keydown trace recording
- Preserve `onKeyCommand`, read-only behavior, shell-backed selection updates,
  and large-document policy.

Acceptance:

- `EditableDOMRoot` no longer assembles keydown.
- Mentions inline void navigation from both sides stays green.
- Tables right-arrow cell boundary stays offset `0`.
- Images/block void keyboard navigation stays green.
- Large-document shell activation stays green.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`

Driver gates:

- `bun --filter slate-react test:vitest test/selection-runtime-contract.test.ts test/selection-controller-contract.test.ts`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium`

### Phase 6: Move Browser Handle And Target Runtime Wiring

Purpose: make proof-only and implicit-target bridges explicit event-runtime
capabilities.

Actions:

- Move `attachSlateBrowserHandle(...)` setup behind
  `runtime-browser-handle-events.ts`.
- Move `writeTargetRuntime(...)` setup into the event runtime facade or a
  small target-runtime bridge owner.
- Keep browser handle force-render calls classified as proof bridge calls until
  a separate proof-transport cleanup replaces them.

Acceptance:

- `EditableDOMRoot` no longer attaches the browser handle directly.
- Target runtime setup has one owner.
- Browser proof handle remains test/proof-only and audited.

Likely files:

- `../slate-v2/packages/slate-react/src/editable/runtime-browser-handle-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-mutation-state.ts`

Driver gate:

- `bun --filter slate-react test:vitest test/target-runtime-contract.test.ts test/kernel-authority-audit-contract.test.ts`

### Phase 7: Shrink `EditableDOMRoot` And Lock The Boundary

Purpose: enforce the architecture.

Actions:

- Remove direct event worker imports from `components/editable.tsx`.
- Keep `EditableDOMRoot` as a wiring/render component.
- Add static contract:
  - forbidden imports in `components/editable.tsx`
  - forbidden calls in `EditableDOMRoot`
  - maximum tolerated event handler closure list
  - allowed runtime facade imports
- Add a handler identity contract if practical:
  - app callback prop change should not recreate root hot handlers
  - editor/runtime identity change may recreate handlers

Acceptance:

- Static guard fails if `EditableDOMRoot` imports event workers again.
- Static guard fails if `EditableDOMRoot` calls `prepareEditable*Kernel`,
  `applyEditable*`, or `recordKernelEventTrace`.
- Handler identity behavior is either contract-tested or explicitly documented
  as an open proof gap.

Likely files:

- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- possible new `../slate-v2/packages/slate-react/test/event-runtime-contract.test.tsx`

Driver gates:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`

### Phase 8: Browser Proof And Stress Closure

Purpose: prove this was not just file shuffling.

Required focused browser rows:

- hovering toolbar mouse selection
- mentions inline void navigation from both sides
- tables right-arrow cell boundary offset `0`
- images/block void keyboard navigation
- embeds/block void layout and navigation
- search highlighting typing keeps focus in search input
- placeholder type/delete/undo
- richtext persistent native word-delete
- large-document shell activation and composition rows

Required stress families:

- `inline-void-boundary-navigation`
- `block-void-navigation`
- `table-cell-boundary-navigation`
- `external-decoration-refresh`
- `mouse-selection-toolbar`
- `paste-normalize-undo`
- `selection-repair-ime`

Final closure gates:

- `bun --filter slate-react test:vitest`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react build`
- `bun lint:fix`
- targeted Chromium regression pack with retries disabled
- `bun test:stress`
- `bun check:full`

If `bun check:full` retries a row, rerun that exact row alone with retries
disabled before closure.

## Implementation Order

1. Phase 0 inventory guard.
2. Phase 1 facade with no behavior move.
3. Phase 2 low-risk clipboard/drag/focus/mouse families.
4. Phase 3 composition/Android assembly.
5. Phase 4 beforeinput/input assembly.
6. Phase 5 keydown assembly.
7. Phase 6 browser handle and target runtime bridge.
8. Phase 7 shrink and static locks.
9. Phase 8 proof closure.

Reason: beforeinput/input and keydown are the highest-risk timing paths, so the
event runtime should be structurally real before touching them.

## Non-Goals

- Do not change public app renderer DX in this lane.
- Do not rewrite selection, repair, composition, or Android algorithms unless a
  failing contract proves the extraction exposed a real bug.
- Do not make one giant `runtime-event-engine.ts` with every event body inside.
- Do not broaden React rerenders to get green browser rows.
- Do not add slow stress to default `bun check`.
- Do not claim legacy browser parity; that is a separate generated
  current-vs-legacy harness lane.

## Stop And Replan Conditions

Replan if:

- handler identity stability requires stale app callbacks
- event runtime becomes a worse god module than `EditableDOMRoot`
- beforeinput/input rows only pass by broadening `forceRender()`
- keydown rows only pass by importing DOM selection directly back into
  `EditableDOMRoot`
- static guards need large vague allowlists
- browser tests pass without asserting model selection, DOM selection, focus
  owner, and render budget where those facts matter

## Completion Definition

This plan is complete only when:

- `EditableDOMRoot` no longer assembles root event handlers.
- `EditableDOMRoot` no longer imports event worker strategy modules directly.
- event family assembly lives behind `useEditableEventRuntime(...)`.
- hot root handlers are stable across ordinary app callback prop changes or
  the remaining churn is explicitly measured and accepted.
- selection, repair, kernel trace, composition, Android, browser handle, and
  target runtime wiring are event-runtime capabilities.
- static guards prevent event worker imports/calls from returning to
  `EditableDOMRoot`.
- focused browser rows and generated stress families pass.
- `bun check:full` passes before the lane is marked done.

## First Execution Slice

Start with Phase 0.

Do not move behavior first.

Add the inventory guard, then use it to drive the extraction.

## Execution Ledger

### 2026-04-27 Complete-Plan Activation

Actions:

- Activated this plan.
- Refreshed `tmp/completion-check.md` for the Editable event runtime lane.
- Wrote `tmp/continue.md`.
- Started Phase 0.

Commands:

- Read the previous completion state and active plan.
- Read the current `EditableDOMRoot` source and existing runtime authority
  contracts.

Artifacts:

- `tmp/completion-check.md`
- `tmp/continue.md`
- this plan

Evidence:

- Current `EditableDOMRoot` still contains 20 `handle*` event closures and 21
  `on*` root handler wrapper constants.
- Current `EditableDOMRoot` still imports event worker families directly from
  `browser-handle`, `clipboard-input-strategy`, `composition-state`,
  `editing-kernel`, `input-router`, `keyboard-input-strategy`,
  `model-input-strategy`, `native-input-strategy`, and
  `selection-reconciler`.

Hypothesis:

- A static inventory guard is the safest first slice because it freezes the
  current event surface before timing-sensitive behavior moves.

Decision:

- Execute Phase 0 as a guard-only slice. No behavior moves in this slice.

Owner classification:

- Current owner is `slate-react` event-runtime architecture/test guard
  ownership.

Changed files:

- `tmp/completion-check.md`
- `tmp/continue.md`
- `docs/plans/2026-04-27-slate-v2-editable-event-runtime-hard-cut-plan.md`

Rejected tactics:

- Do not jump straight to `runtime-event-engine.ts` before the event import and
  handler surface is guarded.
- Do not move beforeinput/input first.

Next action:

- Add the Phase 0 event-worker import and handler-closure inventory guard to
  `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`.

### 2026-04-27 Phase 0-2 Checkpoint

Actions:

- Added the Phase 0 `EditableDOMRoot` event-worker import and handler-closure
  inventory guard.
- Added the Phase 1 `useEditableEventRuntime(...)` facade.
- Moved clipboard, drag/drop, focus, and mouse handler assembly out of
  `EditableDOMRoot` into runtime event family modules.
- Updated the inventory guard from 20 handler closures / 21 wrapper constants
  to 8 handler closures / 9 wrapper constants.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react test:vitest test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts`
- `bun --filter slate-react typecheck`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --grep "hovering toolbar|paste|undo"`

Evidence:

- Authority/surface guard passed: 2 files, 15 tests.
- Editing kernel guard passed: 2 files, 19 tests.
- `slate-react` typecheck passed.
- Targeted package build passed. It emitted the existing `is-hotkey` external
  warning from `slate-dom/src/utils/hotkeys.ts`, but the build succeeded.
- Browser proof passed: 8 chromium rows, including real mouse selection for
  hovering toolbar and paste/undo richtext rows.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-clipboard-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-drag-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. The low-risk handler extraction stayed behavior-green and
  reduced root assembly without touching the most timing-sensitive
  beforeinput/input/keyboard code yet.

Rejected tactics:

- Do not mark the lane complete after Phase 2. `EditableDOMRoot` still
  assembles composition, beforeinput/input, keyboard, browser-handle, and
  target-runtime wiring.

Next action:

- Execute Phase 3: move composition handler assembly to
  `runtime-composition-events.ts` while keeping composition state transitions in
  `runtime-composition-engine.ts` / `composition-state.ts`.

### 2026-04-27 Phase 3 Checkpoint

Actions:

- Added `runtime-composition-events.ts`.
- Moved composition end/start/update handler assembly out of
  `EditableDOMRoot`.
- Kept IME/composition state transitions in the existing composition runtime
  and state worker modules.
- Updated the event-runtime inventory guard from 8 handler closures / 9 wrapper
  constants to 5 handler closures / 6 wrapper constants.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/editing-epoch-kernel-contract.test.ts`

Evidence:

- Authority/surface guard passed: 2 files, 15 tests.
- `slate-react` typecheck passed.
- Editing epoch guard passed: 1 file, 7 tests.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. This removed the composition assembly closures from React
  without moving the underlying IME mutation worker.

Rejected tactics:

- Do not fold all composition state into the facade. That would make
  `runtime-event-engine.ts` the god module the plan explicitly rejects.

Next action:

- Execute Phase 4: move beforeinput and input handler assembly into
  `runtime-before-input-events.ts` and `runtime-input-events.ts`.

### 2026-04-27 Phase 4 Checkpoint

Actions:

- Added `runtime-before-input-events.ts`.
- Added `runtime-input-events.ts`.
- Moved native beforeinput, React beforeinput fallback, DOM input, React input,
  and input-capture handler assembly out of `EditableDOMRoot`.
- Kept selection import, native beforeinput decisions, repair requests, and
  editing epoch duplicate guards behavior-equivalent inside the event family
  modules.
- Updated the event-runtime inventory guard from 5 handler closures / 6 wrapper
  constants to 1 handler closure / 1 wrapper constant.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/editing-kernel-contract.test.ts test/surface-contract.test.tsx`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "inserts text through browser input|runs generated navigation and typing|runs generated destructive paste|records core command metadata|does not duplicate native input|keeps focus in search input|highlights the searched text|keeps caret editable after plain text paste"`

Evidence:

- Authority/surface guard passed: 2 files, 15 tests.
- `slate-react` typecheck passed.
- Selection/editing/surface unit gate passed: 3 files, 31 tests.
- Targeted package build passed with the existing `is-hotkey` external warning.
- Browser proof passed: 9 chromium rows covering native typing, generated
  navigation/typing, destructive paste, command metadata, duplicate native
  listener remount, search highlighting, and search input focus retention.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-input-events.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. The timing-sensitive beforeinput/input move stayed green under
  the narrow unit gate and browser rows that previously caught this class of
  regressions.

Rejected tactics:

- Do not widen Phase 4 into keyboard policy. Keep keydown isolated so table,
  image, mention, and large-document navigation proof can diagnose one owner.

Next action:

- Execute Phase 5: move keydown handler assembly into
  `runtime-keyboard-events.ts`.

### 2026-04-27 Phase 5 Checkpoint

Actions:

- Added `runtime-keyboard-events.ts`.
- Moved keydown handler assembly out of `EditableDOMRoot`.
- Updated the event-runtime inventory guard to 0 root handler closures and 0
  root wrapper constants for the tracked event families.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/selection-runtime-contract.test.ts test/selection-controller-contract.test.ts`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium`

Evidence:

- Authority/surface guard passed: 2 files, 15 tests.
- `slate-react` typecheck passed.
- Selection runtime/controller unit gate passed: 2 files, 16 tests.
- Targeted package build passed with the existing `is-hotkey` external warning.
- Browser proof passed: 33 chromium rows covering images, large-document
  runtime, mentions inline-void arrows, and table cell navigation.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. The root handler assembly target is now structurally met for the
  tracked event families. Remaining Phase 6 work is root bridge wiring:
  browser handle, target runtime, and global listeners.

Rejected tactics:

- Do not skip browser handle / target runtime just because handler closures are
  gone. Those are still event/proof bridges wired directly from React.

Next action:

- Execute Phase 6: move browser handle and target-runtime setup behind runtime
  bridge owners.

### 2026-04-27 Phase 6 Checkpoint

Actions:

- Added `runtime-browser-handle-events.ts`.
- Added `runtime-target-bridge.ts`.
- Moved browser proof handle setup and target-runtime publication out of
  `EditableDOMRoot`.
- Kept browser handles and implicit target resolution as explicit event-runtime
  capabilities.
- Updated the authority guard so `EditableDOMRoot` has no direct
  `attachSlateBrowserHandle(...)` or `writeTargetRuntime(...)` calls.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/target-runtime-contract.test.ts test/kernel-authority-audit-contract.test.ts`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium`

Evidence:

- Authority/surface guard passed: 2 files, 15 tests.
- `slate-react` typecheck passed.
- Target runtime / authority guard passed.
- Targeted package build passed with the existing `is-hotkey` external warning.
- Browser proof passed: 33 chromium rows covering images, large-document
  runtime, mentions inline-void arrows, and table cell navigation.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-browser-handle-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-target-bridge.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Decision:

- Keep course. Root bridge wiring is no longer directly owned by
  `EditableDOMRoot`; the remaining cleanup is facade consolidation and final
  release proof.

Rejected tactics:

- Do not leave `EditableDOMRoot` importing every event family module directly.
  The event runtime facade should be the only event assembly import the root
  needs.

Next action:

- Execute Phase 7: compose all event family hooks behind
  `useEditableEventRuntime(...)`, rerun the focused gates, then run
  `bun check:full`.

### 2026-04-27 Phase 7 Final Checkpoint

Actions:

- Moved event family hook composition behind `useEditableEventRuntime(...)`.
- Reduced `EditableDOMRoot` to consuming the event runtime facade for root event
  bindings.
- Removed direct event family imports from `EditableDOMRoot`.
- Kept selection, repair, kernel trace, composition, Android, browser handle,
  and target runtime wiring as event-runtime capabilities.
- Ran lint after the focused proof and kept the post-lint gates green.

Commands:

- `bun --filter slate-react test:vitest test/kernel-authority-audit-contract.test.ts test/surface-contract.test.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest test/selection-controller-contract.test.ts test/selection-runtime-contract.test.ts test/editing-kernel-contract.test.ts test/editing-epoch-kernel-contract.test.ts test/target-runtime-contract.test.ts test/surface-contract.test.tsx test/kernel-authority-audit-contract.test.ts`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hovering-toolbar.test.ts playwright/integration/examples/richtext.test.ts playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "hovering toolbar|paste|undo|search"`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
- `bun lint:fix`
- post-lint `bun --filter slate-react typecheck`
- post-lint authority/surface guard
- post-lint combined unit gate
- `bun check:full`

Evidence:

- Authority/surface guard passed.
- `slate-react` typecheck passed after fixing the runtime facade state type to
  `EditableInputControllerState`.
- Combined unit gate passed: 6 files, 50 tests.
- Targeted package build passed with the existing `is-hotkey` external warning.
- Focused browser proof passed:
  - hovering toolbar, richtext, and search-highlighting: 15 chromium rows
  - mentions, tables, images, and large-document runtime: 33 chromium rows
- `bun lint:fix` passed and formatted 10 files.
- Post-lint `slate-react` typecheck passed.
- Post-lint authority/surface guard passed.
- Post-lint combined unit gate passed: 6 files, 50 tests.
- `bun check:full` passed.
- Full integration sweep result: 628 passed, 4 skipped.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-browser-handle-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-clipboard-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-drag-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-target-bridge.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `tmp/completion-check.md`
- `tmp/continue.md`

Decision:

- Mark lane complete. The completion target is met: root event handler assembly
  and direct event-worker imports are out of `EditableDOMRoot`, event family
  assembly lives behind `useEditableEventRuntime(...)`, static guards cover
  drift, focused browser rows passed, generated stress passed through
  `bun check:full`, and no runnable in-scope owner remains.

Rejected tactics:

- Do not continue cutting global listener attachment in this lane. React still
  attaches refs/listeners, which is allowed by the plan; the policy and handler
  assembly are now runtime-owned. A future lane can make global listener
  attachment a named runtime root-listener hook if the architecture bar moves
  again.

Next action:

- None for this lane.

### 2026-04-27 Learning Capture

Actions:

- Updated
  `docs/solutions/developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md`
  with the event runtime facade rule: `EditableDOMRoot` gets one
  `useEditableEventRuntime(...)` import, while event-family workers, browser
  handle setup, and target-runtime publication stay behind runtime-owned hooks.

Commands:

- `bun run completion-check`

Evidence:

- Completion check passed after the learning update.
