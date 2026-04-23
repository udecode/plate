---
date: 2026-04-22
topic: slate-v2-editing-kernel-hard-cut-rewrite
status: planned
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/edix
related:
  - docs/plans/2026-04-22-slate-v2-editing-navigation-gauntlet-review-plan.md
  - docs/plans/2026-04-21-slate-v2-final-api-runtime-shape-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/analysis/editor-architecture-candidates.md
  - docs/solutions/ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-internal-controls-must-be-native-owned.md
  - docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md
  - docs/solutions/logic-errors/2026-03-29-table-arrow-navigation-must-own-moveline-and-visual-line-boundaries.md
---

# Slate v2 Editing Kernel Hard-Cut Rewrite Plan

## Hard Take

The current `slate-react` browser editing architecture is still not the final
shape.

It has better files:

- `EditableInputController`
- `EditableSelectionController`
- `EditableMutationController`
- `EditableCaretEngine`
- `DOMRepairQueue`
- slate-browser scenarios/traces

But those are currently mostly ownership labels around legacy timing. They do
not yet form one authoritative editing kernel.

The missing architecture is:

```txt
browser event
  -> target policy
  -> input intent
  -> selection source
  -> ownership decision
  -> mutation command
  -> transaction/commit
  -> DOM text/selection repair
  -> trace
```

Until that chain is centralized, edge cases will keep leaking through whenever
browser DOM selection, Slate model selection, app/plugin transforms, and delayed
repair disagree.

The correct solution is not to patch every bug. It is to hard-cut the ambiguity
that lets those bugs exist.

## North Star

Keep:

- data-model-first `slate`
- operation/collaboration-friendly core
- transaction-first local execution
- React 19.2 optimized runtime
- semantic `Editable`
- projection-source overlays
- DOM-owned text as an explicit capability
- slate-browser model + DOM proof

Hard-cut:

- browser default structural editing as trusted truth
- ad hoc plugin/example mutation paths that bypass the kernel contract
- DOM-only test setup unless explicitly proving native DOM transport
- green integration as proof of architectural closure
- compatibility surfaces that force `Editable` to behave like legacy Slate React

## Current Gap

### 1. Controller Split Is Not A State Machine

Current split is useful but incomplete:

- `InputController` classifies some events.
- `SelectionController` imports/exports selection in some paths.
- `MutationController` applies some model-owned mutations/repairs.
- `CaretEngine` owns some movement commands.
- `DOMRepairQueue` repairs some model-owned DOM drift.

But no single owner decides the full lifecycle.

That means:

- keydown can make one ownership decision
- beforeinput can make another
- selectionchange can race in later
- plugin/example code can mutate the model outside the intended route
- repair can run with stale assumptions

### 2. Browser Default Editing Still Has Too Much Authority

Native text transport is useful.

Native structural editing is not safe enough.

The browser should provide platform events for:

- text input transport
- composition transport
- clipboard transport
- pointer/selection gestures
- accessibility focus

The browser should not be trusted as the source of truth for:

- Enter/split
- Backspace/Delete structural joins
- range delete
- mark toggles
- list/blockquote/heading shortcuts
- rich paste normalization
- shell-backed selection behavior
- inline/void boundary semantics

Those must be editor-owned commands.

### 3. Selection Truth Is Still Conditional

The runtime still asks, path by path:

- should DOM selection win?
- should model selection win?
- should delayed repair win?
- should composition selection win?
- should shell selection win?

That decision must be explicit and centralized per event.

The kernel should carry:

```ts
type SelectionSource =
  | 'model-owned'
  | 'dom-current'
  | 'composition-owned'
  | 'shell-backed'
  | 'internal-control'
  | 'app-owned'
  | 'unknown'
```

Every event must leave the kernel with exactly one source of selection truth.

### 4. Tests Are Still Too Example-Shaped

The test suite now has strong rows, but still too many are example assertions.

Example rows prove "this route works today."

They do not prove the state space:

- native movement followed by model mutation
- model mutation followed by native movement
- mark command followed by delete
- composition followed by paste
- shell activation followed by selection
- internal control focus followed by outer editor repair
- shadow DOM selection followed by Enter
- mobile semantic fallback followed by model repair

The suite needs generated gauntlets.

### 5. React Perf Is Ahead Of Editing Correctness

The huge-doc perf architecture is good and should be kept.

But correctness owns priority.

The kernel must preserve:

- DOM-owned text fast lane
- active corridor
- semantic islands
- projection stores
- no chunking

But no performance lane can bypass:

- custom renderers
- decorations/projections
- IME/composition
- accessibility markup
- rich paste
- internal controls
- shell selection semantics

## Architecture Target

## EditableEditingKernel

Add a single kernel above the current controllers:

```ts
type EditableEditingKernel = {
  dispatchBrowserEvent(event: EditableBrowserEvent): EditableKernelResult
}
```

The kernel is the only owner of:

- event ordering
- target ownership
- intent classification
- native vs model ownership
- selection source
- model command dispatch
- DOM repair scheduling
- trace emission

Controllers become workers, not decision makers.

### Kernel Lifecycle

Every browser event follows this shape:

```txt
1. classify target
2. classify event intent
3. decide ownership
4. import or preserve selection
5. run command
6. collect mutation result
7. schedule DOM repair
8. emit trace
9. return handled/native/deferred result
```

### Kernel States

The kernel must use explicit states:

```ts
type EditableKernelState =
  | 'idle'
  | 'dom-selection'
  | 'model-owned'
  | 'composition'
  | 'internal-control'
  | 'shell-backed'
  | 'clipboard'
  | 'dragging'
  | 'repairing'
```

### Kernel Events

The kernel must own these event families:

- `keydown`
- native `beforeinput`
- React/input fallback
- native `input`
- `selectionchange`
- `compositionstart`
- `compositionupdate`
- `compositionend`
- `paste`
- `copy`
- `cut`
- `dragstart`
- `dragover`
- `drop`
- `focus`
- `blur`
- `mousedown`
- `click`

### Kernel Output

Every dispatch returns:

```ts
type EditableKernelResult = {
  handled: boolean
  nativeAllowed: boolean
  intent: InputIntent | null
  selectionSource: SelectionSource
  command: EditableCommand | null
  repair: EditableRepairRequest | null
  trace: EditableTraceEntry
}
```

## Worker Responsibilities

### InputController

Owns only:

- target classification
- event-to-intent classification
- platform capability classification

Does not:

- read Slate selection
- write Slate selection
- focus editor
- schedule repair
- call transforms

### SelectionController

Owns only:

- DOM -> Slate selection import
- Slate -> DOM selection export
- selection source bookkeeping
- shell-backed selection representation
- internal-control opt-out

Does not:

- decide when to import/export
- apply editing commands
- inspect keyboard shortcuts

### MutationController

Owns only:

- model-owned text insertion
- structural insertion/split
- delete/backspace/range delete
- mark toggles
- paste/drop/cut model mutation
- history undo/redo mutation
- command result metadata

Does not:

- read DOM selection directly
- focus editor
- repair DOM itself

### CaretEngine

Owns only:

- horizontal movement
- word movement
- visual line movement
- Home/End
- range extension
- inline/void boundary movement
- shell/island movement
- bidi fallback

Does not:

- own select-all
- own document commands
- own mutation
- own paste

### DOMRepairQueue

Owns only:

- text node repair
- caret repair
- selection export execution
- deferred repair flushing

Does not:

- decide the selected model range
- decide native vs model ownership

### SlateBrowser

Owns proof, not product behavior:

- scenario DSL
- trace artifacts
- transport/capability metadata
- reduction candidates
- generated gauntlets
- model + DOM assertions

Does not:

- encode product-only behavior into test helpers
- hide DOM drift behind model-only handles

## Hard Cuts

### Hard Cut 1: Browser Default Structural Editing

Model-owned commands:

- Enter
- Shift+Enter
- Backspace
- Delete
- word delete
- line delete
- range delete
- list split
- list lift/outdent via backspace
- block split/merge
- inline/void boundary delete

Native allowed:

- ordinary text transport when capability is safe
- IME transport
- native pointer selection
- platform clipboard transport where capability exists

### Hard Cut 2: Ad Hoc Plugin Mutation Outside Kernel

Examples/plugins may request commands.

They should not mutate editor state from raw browser handlers without going
through the kernel/command contract.

Markdown shortcuts should become:

```ts
registerInputRule({
  trigger: '* ',
  at: 'block-start',
  command: { type: 'set-block', blockType: 'list-item', wrap: 'bulleted-list' },
})
```

Not:

```ts
editor.insertText = ...
Transforms.select(...)
Transforms.delete(...)
Transforms.setNodes(...)
Transforms.wrapNodes(...)
```

### Hard Cut 3: DOM-Only Setup In Tests

DOM-only selection setup is allowed only when the row explicitly proves native
DOM transport.

Default setup should use slate-browser semantic helpers that set both:

- model selection
- DOM selection

### Hard Cut 4: Compatibility As Runtime Shape

Do not preserve:

- legacy `decorate` as primary overlay API
- child-count chunking
- renderChunk
- old legacy `Editable`
- mutable editor fields as docs/examples primary API

### Hard Cut 5: Green Integration As Closure

`bun test:integration-local` passing is a floor.

Closure requires:

- generated gauntlet coverage
- trace artifacts
- reducer output for failures
- owner classification for every accepted platform fallback

## What To Recover From Legacy

Recover:

- event timing discipline
- compact browser compat reasoning
- selection restoration ordering
- beforeinput/keydown interplay
- composition handling comments
- focus restore fail-closed posture

Do not recover:

- monolithic `Editable`
- chunking
- decorate-primary architecture
- legacy React-driven state shape

Legacy was not perfect. It was coherent.

The rewrite must preserve coherence while replacing the runtime.

## What To Steal From Other Editors

### ProseMirror

Steal:

- transaction boundary discipline
- selection bookmarks
- plugin command dispatch shape
- DOM observer flush before command handling
- mapped decorations/metadata

Do not steal:

- full schema/plugin ontology
- ProseMirror DOM parser as Slate's model identity

### Lexical

Steal:

- command dispatch priority
- update lifecycle
- dirty leaves/elements
- DOM reconciliation after update
- selection update inside one editor update

Do not steal:

- React-first core identity
- node-class ontology

### Edix

Steal:

- small framework-agnostic contenteditable state manager discipline
- explicit sync around DOM input
- lightweight state boundaries

Do not steal:

- small-editor scope as the Slate architecture ceiling

### VS Code

Steal:

- model/view-model/cursor split
- cursor controller owns movement
- view model owns visual lines

Do not steal:

- non-DOM desktop assumptions

## Implementation Plan

## Phase 0: Freeze Current Reality

Goal:

- prevent more "fixed one bug, broke another" churn

Actions:

- Keep current green `test:integration-local` as baseline.
- Save current trace artifacts for the richtext gauntlet.
- Inventory all direct calls in `slate-react`:
  - `Transforms.select`
  - `Transforms.deselect`
  - `ReactEditor.focus`
  - `Editor.insertText`
  - `Editor.insertBreak`
  - `Editor.delete*`
  - `editor.insertText =`
  - `editor.deleteBackward =`
  - `onKeyDown`
  - `onDOMBeforeInput`
  - `onInput`

Files:

- `../slate-v2/packages/slate-react/src/editable/**`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/site/examples/ts/**`

Gates:

```sh
bun test:integration-local
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Exit:

- inventory exists
- current baseline is recorded

### Phase 0 Result: Ownership Inventory

Status: inventory complete, baseline gates in progress.

Actions:

- Reset `tmp/completion-check.md` from the closed controller lane to this
  active editing-kernel rewrite lane.
- Inventoried direct editing/timing ownership across:
  - `../slate-v2/packages/slate-react/src/**`
  - `../slate-v2/site/examples/ts/**`
  - `../slate-v2/playwright/integration/examples/**`
- Queried direct calls/writes for:
  - `Transforms.select`
  - `Transforms.deselect`
  - `ReactEditor.focus`
  - `Editor.insertText`
  - `Editor.insertBreak`
  - `Editor.delete*`
  - `editor.insertText =`
  - `editor.deleteBackward =`
  - `onKeyDown`
  - `onDOMBeforeInput`
  - `onInput`
  - selection source/timing flags

Inventory command:

```sh
rg -n "Transforms\\.(select|deselect)|ReactEditor\\.focus|Editor\\.(insertText|insertBreak|delete|deleteBackward|deleteForward|deleteFragment)|editor\\.(insertText|deleteBackward)\\s*=|onKeyDown|onDOMBeforeInput|onInput" packages/slate-react/src site/examples/ts playwright/integration/examples -g "*.ts" -g "*.tsx"
rg -n "preferModelSelectionForInputRef|isUpdatingSelection|IS_FOCUSED|IS_COMPOSING|state\\.activeIntent|selectionSource|repairCaret|syncDOMSelection|selectionchange|beforeinput|composition" packages/slate-react/src/editable packages/slate-react/src/components -g "*.ts" -g "*.tsx"
```

High-signal inventory findings:

- `EditableDOMRoot` still has broad event orchestration:
  - `components/editable.tsx`: `23` direct editing/timing matches
  - active intent assignment still happens per handler
  - beforeinput still decides native/model input locally
  - keydown still decides force DOM import locally
- `keyboard-input-strategy.ts` still owns structural key fallback:
  - `19` matches
  - select-all remains command-owned
  - fallback Enter/Delete/Backspace paths still mutate directly
- `android-input-manager.ts` is a parallel editing subsystem:
  - `22` direct mutation/selection matches
  - it schedules text, delete, break, and selection operations independently
- `selection-reconciler.ts` and `selection-controller.ts` split selection truth:
  - reconciler: `8` direct selection calls, `22` timing/source matches
  - controller: `5` direct selection calls, `18` timing/source matches
- `mutation-controller.ts` owns some command helpers but not all mutation
  routing:
  - `6` direct mutation/focus matches
- `clipboard-input-strategy.ts`, `composition-state.ts`,
  `model-input-strategy.ts`, and `dom-repair-queue.ts` still perform direct
  model/selection/repair actions.
- Example/plugin mutation still bypasses the intended kernel contract:
  - `markdown-shortcuts.tsx`: `editor.insertText =`, `editor.deleteBackward =`,
    and direct `Transforms.select`
  - `check-lists.tsx`: `editor.deleteBackward =`
  - `tables.tsx`: `editor.deleteBackward =`
  - `inlines.tsx`: `editor.insertText =` and keydown movement
  - `mentions.tsx`: direct selection and keydown ownership
  - `code-highlighting.tsx`: direct keydown/text insertion

Counts by notable file:

```txt
packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts: 22
packages/slate-react/src/components/editable.tsx: 23
packages/slate-react/src/editable/keyboard-input-strategy.ts: 19
packages/slate-react/src/editable/selection-reconciler.ts: 8
packages/slate-react/src/editable/model-input-strategy.ts: 7
packages/slate-react/src/editable/mutation-controller.ts: 6
packages/slate-react/src/editable/browser-handle.ts: 6
packages/slate-react/src/editable/selection-controller.ts: 5
packages/slate-react/src/editable/clipboard-input-strategy.ts: 5
site/examples/ts/code-highlighting.tsx: 6
site/examples/ts/mentions.tsx: 5
site/examples/ts/markdown-shortcuts.tsx: 4
site/examples/ts/inlines.tsx: 4
```

Decision:

- The plan premise is confirmed. The current architecture has named owners,
  but real editing authority remains distributed.
- Phase 1 should add a compile-only `EditableEditingKernel` API/type anchor
  before moving behavior.
- Do not change behavior until Phase 0 baseline gates are recorded.

Next action:

- Run Phase 0 baseline gates:
  - `bun test:integration-local`
  - `bun run bench:react:rerender-breadth:local`
  - `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`

### Phase 0 Baseline Gates

Status: complete.

Evidence:

```sh
bun test:integration-local
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- integration local: `368 passed`
- rerender breadth guardrail:
  - many-leaf sibling renders: `0`
  - deep ancestor render events: `0`
  - hidden panel renders while hidden: `0`
  - text edit external recompute count: `0`
- 5000-block legacy compare:
  - v2 ready: `11.82ms` vs legacy off/on `269.14ms` / `291.05ms`
  - v2 select-all: `0.12ms` vs `16.80ms` / `0.85ms`
  - v2 start typing: `7.86ms` vs `154.91ms` / `31.89ms`
  - v2 start select+type: `0.92ms` vs `176.53ms` / `32.85ms`
  - v2 middle typing: `2.28ms` vs `157.52ms` / `40.94ms`
  - v2 middle select+type: `0.49ms` vs `179.91ms` / `39.81ms`
  - v2 middle promote+type: `25.48ms` vs `170.71ms` / `39.24ms`
  - v2 full text replacement: `23.43ms` vs `112.77ms` / `123.25ms`
  - v2 fragment insertion: `29.15ms` vs `111.32ms` / `115.81ms`

Decision:

- Baseline is green enough to start Phase 1.
- No behavior changes are needed before the kernel type anchor.

Next owner:

- Phase 1: define compile-only `EditableEditingKernel` API in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.

## Phase 1: Define EditableEditingKernel API

Goal:

- add the kernel boundary without moving behavior

New file:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`

Define:

- `EditableBrowserEvent`
- `EditableKernelState`
- `EditableKernelContext`
- `EditableKernelResult`
- `EditableTraceEntry`
- `EditableCommand`
- `EditableOwnership`

Rules:

- no behavior change
- no event handler rewrites yet
- types must describe the target architecture honestly

Gates:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
```

Exit:

- kernel types compile
- no runtime behavior moved

### Phase 1 Result: Compile-Only Kernel API Anchor

Status: complete.

Actions:

- Added
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Defined compile-only kernel types:
  - `EditableBrowserEventFamily`
  - `EditableKernelState`
  - `EditableEventTargetOwner`
  - `EditableOwnership`
  - `EditableCommand`
  - `EditableBrowserEvent`
  - `EditableKernelTraceEntry`
  - `EditableKernelResult`
  - `EditableKernelContext`
  - `EditableEditingKernel`
- No runtime handlers call the kernel yet.
- No behavior was moved.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
```

Results:

- slate-react build/typecheck: passed
- lint: passed

Decision:

- Kernel API anchor is safe.
- Phase 2 can add trace observation without taking control of behavior.

Next owner:

- Phase 2: kernel trace without control.

## Phase 2: Kernel Trace Without Control

Goal:

- let the kernel observe all event paths before it controls them

Actions:

- Add trace emission around current event handlers.
- Include:
  - event family
  - target owner
  - intent
  - selection source before
  - selection source after
  - command result
  - repair request
- Pipe traces to slate-browser scenario artifacts when enabled.

Files:

- `editing-kernel.ts`
- `input-controller.ts`
- `selection-controller.ts`
- `mutation-controller.ts`
- `caret-engine.ts`
- `packages/slate-browser/src/playwright/index.ts`

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "navigation and mutation chained"
bun --filter slate-browser test
```

Exit:

- traces show the current lifecycle
- no behavior change

### Phase 2a Result: Keydown Trace Observation

Status: complete for keydown.

Actions:

- Added trace storage helpers to
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`:
  - `mapSelectionSourceToKernelState(...)`
  - `getEditableKernelTrace(...)`
  - `clearEditableKernelTrace(...)`
  - `recordEditableKernelTrace(...)`
- Added keydown trace observation in `EditableDOMRoot`.
- Keydown trace records:
  - event family
  - target owner
  - active intent
  - ownership classification
  - native allowed flag
  - selection before/after
  - selection source
  - state before/after
  - operations
- No handler behavior was moved.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|word movement|line extension|read-only inline" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- focused keydown/caret browser floor: `24 passed`

Rejected tactic:

- Running Playwright in parallel with package build caused a temporary site
  build failure where Next could not resolve `slate-react`. Rerunning after
  package build/typecheck completed passed. Do not parallelize Playwright
  against package builds.

Decision:

- Keydown trace observation is safe.
- Phase 2 is not complete until the other browser event families are traced.

Next owner:

- Phase 2b: trace native `beforeinput`, React/native `input`, clipboard,
  composition, focus/blur, mouse, and drag/drop handlers without changing
  behavior.

### Phase 2b Result: Broad Event Entry Trace Observation

Status: complete for root handler entry tracing.

Actions:

- Added `recordKernelEventTrace(...)` inside `EditableDOMRoot`.
- Added trace entries for:
  - native `beforeinput`
  - React/native `input`
  - paste
  - copy
  - cut
  - dragstart
  - dragover
  - dragend
  - drop
  - compositionstart
  - compositionupdate
  - compositionend
  - focus
  - blur
  - click
  - mousedown
- Kept the existing keydown after-handler trace from Phase 2a.
- No handler behavior was moved.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|word movement|line extension|read-only inline" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- focused keydown/caret browser floor: `24 passed`

Rejected tactic:

- Playwright must not run in parallel with package build/typecheck. The site
  can see unresolved `slate-react` while package output is being rebuilt.

Remaining Phase 2 gap:

- `selectionchange` and DOM repair execution traces are not yet recorded.
- slate-browser scenario artifacts do not yet include kernel traces.

Next owner:

- Phase 2c: trace `selectionchange` and DOM repair execution, then expose
  kernel traces through slate-browser scenario snapshots/artifacts without
  changing runtime behavior.

### Phase 2c Result: Selectionchange/Repair Trace And Slate-Browser Exposure

Status: complete.

Actions:

- Added `repair` to `EditableBrowserEventFamily`.
- Recorded kernel traces for:
  - native `selectionchange`
  - DOM repair execution via `DOMRepairQueue.repairCaretAfterModelOperation`.
- Exposed kernel traces through the slate-browser handle:
  - `SlateBrowserHandle.getKernelTrace()`
- Added `kernelTrace` to slate-browser `EditorSnapshot`.
- Included kernel traces in scenario artifacts.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "navigation and mutation chained" --workers=1 --retries=0
find test-results -name 'richtext-navigation-mutation-gauntlet.json' -print
rg -n 'kernelTrace|eventFamily|repair|selectionchange|keydown' test-results/**/richtext-navigation-mutation-gauntlet.json
```

Results:

- build/typecheck/lint: passed
- scenario-shaped richtext gauntlet: `1 passed`
- trace artifact now includes `kernelTrace` entries for:
  - `focus`
  - `selectionchange`
  - `mousedown`
  - `click`
  - `keydown`
  - repair events where they occur

Decision:

- Phase 2 is complete enough to start Phase 3.
- The kernel can now observe the current lifecycle before it starts owning
  dispatch decisions.

Next owner:

- Phase 3a: keydown enters through kernel decision prep first.
  - move keydown target/intent/ownership/force-import decision into
    `editing-kernel.ts`
  - keep existing keydown behavior and worker calls unchanged

## Phase 3: Kernel Owns Target + Intent Classification

Goal:

- every event enters through the kernel first

Actions:

- Move target classification into kernel dispatch.
- Move event intent classification into kernel dispatch.
- Make event handlers call:
  - `kernel.dispatchKeyDown(...)`
  - `kernel.dispatchBeforeInput(...)`
  - `kernel.dispatchInput(...)`
  - `kernel.dispatchSelectionChange(...)`
  - etc.
- Workers still do existing behavior.

Hard rule:

- internal controls exit before any editor-owned selection import.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|Backspace|Delete|visual caret"
```

Exit:

- target and intent ownership is centralized
- internal controls remain native/app-owned

### Phase 3a Result: Keydown Decision Prep Enters Kernel

Status: complete for keydown.

Actions:

- Added `EditableKeyDownKernelDecision`.
- Added `prepareEditableKeyDownKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved keydown decision prep into the kernel:
  - intent classification
  - internal target detection
  - target owner classification
  - ownership classification
  - native allowed flag
  - release-model-selection decision
  - force-DOM-import decision
  - selection-before capture
  - state-before capture
- `EditableDOMRoot` now consumes that decision and still calls the same
  existing keydown worker.
- No keydown behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|word movement|line extension|read-only inline" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- focused keydown/caret browser floor: `24 passed`

Decision:

- Keydown now enters through the kernel for target/intent/ownership decisions.
- Phase 3 is not complete until the other event families enter through kernel
  decision prep.

Next owner:

- Phase 3b: native `beforeinput` enters through kernel decision prep first,
  while preserving current native/model decision behavior.

### Phase 3b Result: Beforeinput Decision Prep Enters Kernel

Status: complete.

Actions:

- Added `EditableBeforeInputKernelDecision`.
- Added `prepareEditableBeforeInputKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved native `beforeinput` decision prep into the kernel:
  - intent classification
  - internal target detection
  - target owner classification
  - ownership classification
  - native allowed flag
  - selection-before capture
  - state-before capture
- Preserved the existing native/model decision flow:
  - `getNativeBeforeInputDecision(...)`
  - `syncSelectionForBeforeInput(...)`
  - `applyModelOwnedBeforeInputOperation(...)`
- No beforeinput behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|visual caret|paste|can add list|can add a h1|traced slate-browser scenario|navigation and mutation chained" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=webkit --grep "rich HTML paste over selected content" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "rich HTML paste over selected content|pasted bold|pasted code" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- mixed beforeinput-sensitive browser gate: `75 passed`, `1 failed`
  - failed row: WebKit `paste-html` rich paste selection assertion
  - isolated rerun of the failed row: `1 passed`
  - full paste-html focused all-project gate: `12 passed`

Decision:

- Phase 3b is safe.
- The WebKit paste failure is classified as a flaky focused-row occurrence
  because it passed isolated and in the full paste-html focused gate without
  code changes.

Next owner:

- Phase 3c: clipboard event families enter through kernel decision prep first,
  while preserving current copy/cut/paste/drop behavior.

### Phase 3c Result: Clipboard Decision Prep Enters Kernel

Status: complete.

Actions:

- Added `EditableClipboardKernelDecision`.
- Added `prepareEditableClipboardKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved clipboard-family decision prep into the kernel for:
  - paste
  - copy
  - cut
  - dragend
  - dragover
  - dragstart
  - drop
- Preserved the existing clipboard/drag/drop workers:
  - `applyEditablePaste(...)`
  - `applyEditableCopy(...)`
  - `applyEditableCut(...)`
  - `applyEditableDrag*`
  - `applyEditableDrop(...)`
- No clipboard behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "copy|cut|paste|fragment|shell-backed|rich HTML" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- clipboard/paste/fragment browser gate: `32 passed`

Decision:

- Clipboard-family events now enter through kernel decision prep.
- Phase 3 is still not complete for all event families.

Next owner:

- Phase 3d: composition event families enter through kernel decision prep first,
  while preserving current composition behavior.

### Phase 3d Result: Composition Decision Prep Enters Kernel

Status: complete.

Actions:

- Added `EditableCompositionKernelDecision`.
- Added `prepareEditableCompositionKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved composition event decision prep into the kernel for:
  - `compositionstart`
  - `compositionupdate`
  - `compositionend`
- Preserved existing composition workers:
  - `applyEditableCompositionStart(...)`
  - `applyEditableCompositionUpdate(...)`
  - `applyEditableCompositionEnd(...)`
- No composition behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME|composition" --workers=1 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- large-doc React contract: `15 pass`
- large-document runtime composition gate: `15 passed`

Decision:

- Composition events now enter through kernel decision prep.
- Phase 3 still has focus/mouse and input fallback event families open.

Next owner:

- Phase 3e: focus/blur/click/mousedown enter through kernel decision prep first,
  while preserving current behavior.

### Phase 3e Result: Focus/Mouse Decision Prep Enters Kernel

Status: complete.

Actions:

- Added `EditableFocusMouseKernelDecision`.
- Added `prepareEditableFocusMouseKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved focus/mouse decision prep into the kernel for:
  - focus
  - blur
  - click
  - mousedown
- Preserved existing focus and mouse workers:
  - `applyEditableFocus(...)`
  - `applyEditableBlur(...)`
  - `applyEditableClick(...)`
  - `applyEditableMouseDown(...)`
- No focus/mouse behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/select.test.ts ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "restores outer|keeps nested editor input focused|selectionchange noise|focus on checkbox|triple click|selects the current block" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- focused focus/mouse/internal-control gate: `24 passed`

Decision:

- Focus/mouse events now enter through kernel decision prep.
- Remaining Phase 3 gap is input fallback/native input capture.

Next owner:

- Phase 3f: React/native input and input-capture enter through kernel decision
  prep first, while preserving current behavior.

### Phase 3f Result: Input Fallback Decision Prep Enters Kernel

Status: complete.

Actions:

- Added `EditableInputKernelDecision`.
- Added `prepareEditableInputKernel(...)` in
  `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`.
- Moved React `input` and `inputCapture` decision prep into the kernel:
  - internal target detection
  - target owner classification
  - ownership classification
  - selection-before capture
  - state-before capture
- Preserved existing input fallback workers:
  - `applyEditableInput(...)`
  - `domRepairQueue.repairDOMInput(...)`
- Hardened `richtext` Backspace-at-end test setup from DOM-only selection to
  semantic+DOM selection. The row's product claim is browser insertion and
  Backspace after a stable selection, not DOM-only setup.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/plaintext.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "inserts text|visual caret|directly synced|DOM-owned|Backspace|Delete|traced slate-browser scenario|navigation and mutation" --workers=4 --retries=0
```

Results:

- slate-react build/typecheck: passed
- lint: passed
- input/native fallback browser gate: `80 passed`

Decision:

- Phase 3 event-family decision prep is complete enough to start Phase 4.
- The kernel now prepares decisions for:
  - keydown
  - beforeinput
  - input/inputCapture
  - clipboard/drag/drop
  - composition
  - focus/blur/click/mousedown
- Next risk is selection source ownership, not more event-family prep.

Next owner:

- Phase 4a: replace boolean model-selection preference decisions with explicit
  kernel selection source transitions for keydown and beforeinput first.

## Phase 4: Kernel Owns Selection Source

Goal:

- remove conditional selection truth from workers

Actions:

- Kernel sets selection source before each worker runs.
- SelectionController only executes import/export.
- Remove direct worker reads of `preferModelSelectionForInputRef` where possible.
- Replace boolean preference with structured source:
  - `model-owned`
  - `dom-current`
  - `composition-owned`
  - `shell-backed`
  - `internal-control`
  - `app-owned`

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Exit:

- one selection source per event
- traces prove source transitions

### Phase 4a Result: Keydown/Beforeinput Selection Source Transitions

Status: complete.

Actions:

- Added `EditableSelectionSourceTransition`.
- Replaced the keydown `shouldReleaseModelSelection` boolean decision with an
  explicit transition:
  - reason: `native-selection-move`
  - `preferModelSelection: false`
  - `selectionSource: dom-current`
- Added `selectionSourceTransition: null` to beforeinput decisions so the
  beforeinput path has the same explicit shape without changing behavior.
- `EditableDOMRoot` now applies the keydown transition through
  `setEditableModelSelectionPreference(...)`.
- No behavior was intentionally changed.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|word movement|line extension|read-only inline" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "Backspace|Delete|visual caret|navigation and mutation" --workers=2 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/plaintext.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "inserts text|visual caret|directly synced|DOM-owned|Backspace|Delete|traced slate-browser scenario|navigation and mutation" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- keydown/caret gate: `24 passed`
- focused Chromium mutation cluster after setup hardening: `12 passed`
- input/native fallback gate: `80 passed`

Rejected tactic:

- The `richtext` Backspace-at-selected-text-end row was relying on DOM-only
  selection setup even though its product claim is browser insertion followed
  by Backspace. Under clustered load it became flaky. The row now uses
  semantic+DOM setup and still proves native insertion/backspace.

Decision:

- Phase 4a is safe and behavior-preserving.
- Boolean model-selection preference still exists in repair requests.

Next owner:

- Phase 4b: replace repair-request `preferModelSelection?: boolean` with an
  explicit selection-source transition while keeping boolean compatibility only
  as a temporary fallback.

### Phase 4b Result: Repair Selection Source Transitions

Status: complete.

Actions:

- Moved `EditableSelectionSourceTransition` to `input-state.ts` so both the
  kernel and mutation controller can share it.
- Added `selectionSourceTransition?: EditableSelectionSourceTransition` to
  repair requests.
- Updated current repair producers to emit explicit transitions:
  - model input repair
  - native input drift repair
  - caret movement sync
  - clipboard/cut/drop repair
  - model-owned text insert repair
- Kept `preferModelSelection?: boolean` as temporary compatibility fallback in
  `EditableRepairRequest`.
- Preserved existing repair behavior.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-state.ts`
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/caret-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation|Arrow|word movement|line extension|Backspace|Delete|copy|cut|paste|fragment|shell-backed|directly synced|visual caret" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- repair/mutation/selection-source browser gate: `112 passed`

Decision:

- Current repair producers no longer rely on raw boolean selection preference.
- The boolean repair field remains only as compatibility fallback.
- The next type mismatch is that the plan names `app-owned` as a selection
  source but `SelectionSource` does not yet include it.

Next owner:

- Phase 4c: add `app-owned` to `SelectionSource` and kernel state mapping, then
  use it for app/native-owned internal target transitions where behavior stays
  unchanged.

### Phase 4c Result: App-Owned Selection Source

Status: complete.

Actions:

- Added `app-owned` to `SelectionSource`.
- Added `app-owned` to `EditableKernelState`.
- Mapped `SelectionSource: app-owned` to kernel state `app-owned`.
- Updated internal-control click/mousedown selection source transitions to
  `app-owned`.
- Preserved existing behavior.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-state.ts`
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "restores outer|keeps nested editor input focused|selectionchange noise|focus on checkbox|traced slate-browser scenario|navigation and mutation" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- internal-control/focus browser gate: `24 passed`

Decision:

- The selection source enum now matches the architecture plan.
- Direct reads of `preferModelSelectionForInputRef.current` remain and need to
  be reduced behind selection-controller/kernel helpers.

Next owner:

- Phase 4d: replace direct `preferModelSelectionForInputRef.current` reads in
  beforeinput/key paths with explicit selection-controller helper calls where
  behavior remains unchanged.

### Phase 4d Result: Direct Preference Reads Hidden Behind Selection Controller

Status: complete.

Actions:

- Added `isEditableModelSelectionPreferred(...)` to
  `selection-controller.ts`.
- Updated `syncEditorSelectionFromDOM(...)` to take `inputController` instead
  of a raw preference ref.
- Updated `EditableDOMRoot` beforeinput/key paths to use the helper.
- Updated `useEditableSelectionReconciler(...)` to receive `inputController`
  and use the helper.
- After this slice, raw `preferModelSelectionForInputRef.current` reads are
  limited to `selection-controller.ts`.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/editable/input-controller.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
rg -n "preferModelSelectionForInputRef\\.current" packages/slate-react/src -g "*.ts" -g "*.tsx"
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/check-lists.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation chained|Arrow|word movement|line extension|read-only inline|restores outer|keeps nested editor input focused|selectionchange noise|focus on checkbox" --workers=4 --retries=0
```

Results:

- raw preference reads only remain in `selection-controller.ts`
- build/typecheck/lint: passed
- selection/focus/key gate: `40 passed`

Decision:

- Direct boolean reads are now behind the selection controller.
- The remaining temporary boolean debt is `EditableRepairRequest.preferModelSelection`.

Next owner:

- Phase 4e: remove `preferModelSelection?: boolean` from repair requests and
  require `selectionSourceTransition` for repair-driven selection source
  changes.

### Phase 4e Result: Repair Boolean Fallback Removed

Status: complete.

Actions:

- Removed `preferModelSelection?: boolean` from `EditableRepairRequest`.
- Removed boolean fallback logic from `applyEditableRepairRequest(...)`.
- Repair-driven selection source changes now require
  `selectionSourceTransition`.
- Verified all current repair producers emit structured transitions.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`

Evidence:

```sh
rg -n "preferModelSelection\\?:|preferModelSelection: true|preferModelSelection: false|preferModelSelection" packages/slate-react/src/editable packages/slate-react/src/components -g "*.ts" -g "*.tsx"
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation and mutation|Arrow|word movement|line extension|Backspace|Delete|copy|cut|paste|fragment|shell-backed|directly synced|visual caret" --workers=4 --retries=0
```

Results:

- no repair request type fallback remains
- remaining `preferModelSelection` references are:
  - structured transition payloads
  - the selection-controller setter/helper
  - legacy compatibility input selection arguments that still need future
    replacement
- build/typecheck/lint: passed
- repair/mutation/selection-source browser gate: `112 passed`

Decision:

- Phase 4 is complete enough to move to structural editing ownership.
- The remaining legacy boolean pressure is contained behind
  `selection-controller` and compatibility beforeinput arguments.

Next owner:

- Phase 5a: inventory and classify native structural editing paths before
  behavior changes:
  - Enter
  - Shift+Enter
  - Backspace
  - Delete
  - range delete
  - word/line delete
  - inline/void boundary delete
  - list split/lift/outdent
  - block split/merge

## Phase 5: Hard Cut Native Structural Editing

Goal:

- no structural mutation relies on browser DOM default

Model-owned:

- Enter
- Shift+Enter
- Backspace
- Delete
- range delete
- word delete
- line delete
- split block
- merge block
- inline/void boundary delete

Actions:

- Route structural keys through `MutationController`.
- Mark native structural default as disallowed.
- Let native beforeinput provide data, not authority.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|undo|navigation and mutation"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Exit:

- structural browser default is not trusted
- model + DOM remain in sync

### Phase 5a Result: Structural Editing Ownership Inventory

Status: complete.

Actions:

- Inventoried structural editing paths before changing behavior.
- Classified current owners for Enter, Shift+Enter, Backspace, Delete, range
  delete, word/line delete, inline/void boundary delete, list split/lift/outdent,
  and block split/merge.
- Confirmed the current runtime already treats native `beforeinput` as data for
  most structural edits, but the command contract is still split across multiple
  files.

Current owners:

- `model-input-strategy.ts` owns model-backed `beforeinput` structural edits:
  expanded range delete, `deleteContent*`, `deleteWord*`, `delete*Line*`,
  `insertLineBreak`, `insertParagraph`, paste/drop/yank/replacement/text, and
  composition commit.
- `mutation-controller.ts` owns low-level helpers for model-owned delete,
  expanded delete, line break, data transfer, text input, and history.
- `keyboard-input-strategy.ts` still owns structural key fallback behavior when
  `beforeinput` is unavailable, plus the Chrome/WebKit void-boundary delete
  workaround and select-all/history hotkeys.
- `android-input-manager.ts` is a separate structural edit subsystem that
  schedules delete, split, text, paste/drop, and composition operations.
- `browser-handle.ts` exposes direct structural commands for tests/proofs:
  `deleteBackward`, `deleteForward`, `deleteFragment`, `insertBreak`, and
  `insertText`.
- Example/plugin code still overrides or directly mutates structure:
  `markdown-shortcuts.tsx`, `tables.tsx`, `check-lists.tsx`,
  `inlines.tsx`, `code-highlighting.tsx`, `mentions.tsx`, and toolbar-style
  richtext transforms.

Decision:

- The next safe move is not to change browser behavior immediately.
- First route structural intent classification through an explicit kernel
  command mapping so traces show one command language for keydown, beforeinput,
  Android-compatible input, browser handles, and future input rules.
- Then move fallback keydown structural execution to `MutationController` command
  dispatch.
- Then hard-cut trusted native structural editing path by path with cross-browser
  model + DOM gates.

Rejected tactics:

- Do not patch individual Backspace/Delete/Enter rows one by one.
- Do not let example/plugin overrides keep bypassing the command contract.
- Do not restore the legacy monolith.
- Do not change Android behavior in the same slice as desktop keydown routing.

Evidence:

```sh
sed -n '1,260p' packages/slate-react/src/editable/editing-kernel.ts
sed -n '1,620p' packages/slate-react/src/editable/model-input-strategy.ts
sed -n '1,620p' packages/slate-react/src/editable/keyboard-input-strategy.ts
sed -n '1,280p' packages/slate-react/src/editable/mutation-controller.ts
rg -n "insertBreak|insertSoftBreak|deleteBackward|deleteForward|deleteFragment|deleteContent|deleteBy|deleteWord|deleteLine|inputType|beforeinput|Editor\\.delete|Transforms\\.delete" packages/slate-react/src site/examples/ts packages/slate-browser playwright/integration/examples -g "*.ts" -g "*.tsx"
```

Next owner:

- Phase 5b: add a single structural command mapper/dispatcher:
  - map `beforeinput.inputType` and fallback keydown hotkeys to
    `EditableCommand`
  - make traces include the structural command
  - route fallback keydown structural execution through
    `MutationController.applyEditableCommand(...)`
  - keep behavior unchanged in this slice
  - prove with cross-browser structural gates

### Phase 5b Result: Structural Command Mapper And Dispatcher

Status: complete.

Actions:

- Added explicit structural command mapping for keydown and beforeinput:
  `delete`, `delete-fragment`, `delete-both`, `insert-break`, `history`,
  `insert-text`, and movement trace commands.
- Added `MutationController.applyEditableCommand(...)` as the single dispatcher
  for executable model-owned commands.
- Routed fallback keydown structural execution through the dispatcher.
- Preserved current behavior for native `beforeinput`, Android, browser handle,
  and example/plugin paths.
- Added browser proof that real Backspace and Enter key events produce kernel
  trace commands.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|undo|navigation and mutation|Arrow|word movement|line extension" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|read-only inline|void|selection|Arrow|keyboard" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "records kernel commands" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- richtext structural navigation/delete/undo gate: `48 passed`
- highlighted/inlines/editable-voids structural gate: `48 passed`
- command-trace browser proof: `4 passed`

Decision:

- The command language now exists and fallback keydown structural behavior no
  longer owns its own mutation calls.
- The next real cleanup is beforeinput structural dispatch. Keeping the
  beforeinput switch forever would recreate the same split owner under a
  different event family.

Rejected tactics:

- Do not hard-cut Android in the same slice.
- Do not remove beforeinput behavior before the dispatcher path proves parity.
- Do not let green browser rows substitute for command-trace evidence.

Next owner:

- Phase 5c: route `applyModelOwnedBeforeInputOperation(...)` structural
  execution through `applyEditableCommand(...)`:
  - reuse the same command mapping for delete/history/break/text where safe
  - preserve native text deferred behavior
  - keep composition and data-transfer special cases explicit until their
    transport gates are isolated
  - prove with the same cross-browser structural gates plus composition/paste
    spot checks

### Phase 5c Result: Beforeinput Structural Dispatch Unified

Status: complete.

Actions:

- Extracted `getEditableCommandFromBeforeInputType(...)` so beforeinput tracing
  and beforeinput execution share the same command mapping.
- Routed beforeinput delete and break structural execution through
  `applyEditableCommand(...)`.
- Routed non-native text insertion through `applyEditableCommand(...)` inside
  `applyModelOwnedTextInput(...)`.
- Preserved native text deferred behavior.
- Kept composition and data-transfer paths explicit until their transport gates
  are isolated.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|undo|navigation and mutation|Arrow|word movement|line extension|records kernel commands" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|read-only inline|void|selection|Arrow|keyboard" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "plain text paste|rich HTML paste|pasted bold|pasted code|commits IME composition" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- richtext structural + command-trace gate: `52 passed`
- highlighted/inlines/editable-voids structural gate: `48 passed`
- composition/paste spot gate: `24 passed`

Decision:

- Desktop beforeinput and fallback keydown now share command mapping and
  dispatcher execution for structural edits.
- The remaining structural split owner is Android scheduling and proof-only
  browser handles. Android is the higher-priority user path.

Rejected tactics:

- Do not fold paste/clipboard into generic command dispatch before rich fragment
  gates are isolated.
- Do not treat the command mapper as closure while Android still schedules raw
  structural `Editor.*` operations.

Next owner:

- Phase 5d: route Android input manager structural scheduling through the same
  command mapper/dispatcher:
  - preserve Android-specific DOM reconciliation and scheduling timing
  - map delete/break/text command scheduling to `EditableCommand`
  - keep composition/data-transfer special cases explicit
  - prove with mobile structural, composition, paste, and richtext gauntlet gates

### Phase 5d Result: Android Structural Scheduling Uses Commands

Status: complete.

Actions:

- Routed Android pending diff application through `applyEditableCommand(...)`.
- Added Android `scheduleCommand(...)` so scheduled structural operations use
  the same command dispatcher as desktop keydown/beforeinput.
- Routed Android delete, break, data-transfer, multiline text, and final text
  scheduling through commands.
- Preserved Android selection normalization, diff storage, pending action
  scheduling, SwiftKey insert-position handling, and DOM reconciliation timing.

Changed files:

- `../slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`

Evidence:

```sh
rg -n "Editor\\.insertText|Editor\\.deleteFragment|Editor\\.deleteBackward|Editor\\.deleteForward|Editor\\.insertBreak|Editor\\.insertSoftBreak|ReactEditor\\.insertData" packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "Backspace|Delete|undo|navigation and mutation|Arrow|word movement|line extension|records kernel commands|plain text paste|rich HTML paste|pasted bold|pasted code|commits IME composition" --workers=2 --retries=0
```

Results:

- raw Android structural `Editor.*` / `ReactEditor.insertData` scan: no matches
- build/typecheck/lint: passed
- mobile structural/composition/paste gate: `22 passed`

Decision:

- Android no longer owns a separate raw structural mutation path.
- The remaining structural bypass is proof-only browser handles and
  example/plugin overrides.

Rejected tactics:

- Do not simplify Android diff storage or timing in this architecture slice.
- Do not remove Android text-diff optimization; it is not the same problem as
  structural command ownership.

Next owner:

- Phase 5e: route slate-browser proof handles through the command dispatcher:
  - `insertText`
  - `insertBreak`
  - `deleteFragment`
  - `deleteBackward`
  - `deleteForward`
  - keep `selectRange` as selection-controller/proof API
  - emit or preserve kernel trace command evidence
  - prove browser-handle tests and command-trace browser proof

### Phase 5e Result: Proof Handles Use Command Dispatch

Status: complete.

Actions:

- Routed slate-browser proof-handle mutation methods through
  `applyEditableCommand(...)`:
  - `insertText`
  - `insertBreak`
  - `insertData`
  - `deleteFragment`
  - `deleteBackward`
  - `deleteForward`
- Preserved `selectRange` as a selection/proof API, not a mutation command.
- Recorded kernel trace entries for proof-handle command execution so handle
  tests cannot silently validate a different mutation path.
- Added browser proof that proof-handle edits produce command trace entries.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "records kernel commands" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "can add|keeps caret|deleting a decorated|cuts decorated|line break|follow-up typing|directly synced|deletes backward|deletes forward|records kernel commands" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- command trace proof: `8 passed`
- handle-heavy integration gate: `40 passed`

Decision:

- Phase 5 structural command ownership is complete for desktop keydown,
  beforeinput, Android scheduling, and proof handles.
- The next structural bypass is not browser native default; it is
  app/example/plugin mutation outside the kernel contract.

Rejected tactics:

- Do not route `selectRange` through mutation dispatch.
- Do not make proof handles a production extension API.

Next owner:

- Phase 6a: inventory and harden input-rule/plugin mutation bypasses:
  - markdown shortcuts
  - tables
  - check lists
  - inlines
  - code highlighting
  - mentions
  - richtext toolbar transforms
  - classify each as kernel command, input rule, app command, or acceptable
    proof-only helper

## Phase 6: Input Rules Replace Ad Hoc Example Mutation

Goal:

- plugins/examples request commands instead of mutating through random
  overrides

New concept:

```ts
type EditableInputRule = {
  id: string
  trigger: string | RegExp
  at: 'block-start' | 'selection' | 'text'
  command: EditableCommand
}
```

Actions:

- Add input-rule path in kernel.
- Convert markdown shortcuts from `editor.insertText = ...` override to input
  rules.
- Convert any other simple example overrides that mutate selection/structure.

Files:

- `editing-kernel.ts`
- `mutation-controller.ts`
- `site/examples/ts/markdown-shortcuts.tsx`

Gates:

```sh
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bun test:integration-local
```

Exit:

- markdown shortcuts no longer bypass kernel contract

### Phase 6a Result: Example/Plugin Mutation Bypass Inventory

Status: complete.

Actions:

- Inventoried example/plugin mutation paths that still bypass the kernel command
  contract.
- Classified each path by intended final ownership instead of blindly deleting
  customization.

Classification:

- `markdown-shortcuts.tsx`: input-rule owner.
  - Current bypass: `editor.insertText = ...`, `editor.deleteBackward = ...`,
    direct `Transforms.delete`, `Transforms.setNodes`, `Transforms.wrapNodes`,
    and `Transforms.unwrapNodes`.
  - Final shape: declarative input rules for trigger-to-block conversion plus a
    named block-reset command for Backspace at block start.
- `check-lists.tsx`: command owner.
  - Current bypass: `editor.deleteBackward = ...` with direct
    `Transforms.setNodes`.
  - Final shape: named checklist Backspace-at-start command, invoked through the
    editing kernel command path.
- `tables.tsx`: boundary policy owner.
  - Current bypass: `editor.deleteBackward`, `editor.deleteForward`, and
    `editor.insertBreak` monkeypatches that block crossing table-cell
    boundaries.
  - Final shape: table boundary policy consumed by the kernel/caret/mutation
    path; do not treat table boundaries as random editor method overrides.
- `inlines.tsx`: mixed owner.
  - Current bypass: `onKeyDown` directly calls `Transforms.move` for
    offset-based inline movement; `editor.insertText`/`insertData` wrap links.
  - Final shape: inline movement belongs to `CaretEngine`; URL insertion/paste
    belongs to an input-rule/data-transfer rule.
- `code-highlighting.tsx`: mixed owner.
  - Current bypass: toolbar/app commands mutate blocks, and Tab key inserts
    spaces with `Editor.insertText`.
  - Final shape: toolbar stays app-command; Tab text insertion should use a
    command/input-rule path.
- `mentions.tsx`: app interaction command owner.
  - Current bypass: portal key/mouse handlers call `Transforms.select` and
    `insertMention`.
  - Final shape: mention accept/cancel are app commands with explicit selection
    import/export, not generic native input.
- `richtext.tsx`: app command owner.
  - Current bypass: toolbar formatting uses direct mark/block transforms.
  - Final shape: toolbar uses app commands; this is not input text transport.

Decision:

- Phase 6 should start with markdown shortcuts because it is the clearest
  browser-input bypass: it replaces typed text and Backspace behavior by
  monkeypatching editor methods.
- Tables and inline movement are not the same owner; they belong to boundary
  policy and `CaretEngine`, so forcing them into the first input-rule patch
  would recreate the current mess.

Rejected tactics:

- Do not ban app commands. Toolbar/portal commands are valid if explicit.
- Do not keep monkeypatching editor instance methods as the final extension
  story.
- Do not convert table/caret behavior inside the markdown shortcut slice.

Evidence:

```sh
sed -n '80,200p' site/examples/ts/markdown-shortcuts.tsx
sed -n '1,130p' site/examples/ts/tables.tsx
sed -n '80,135p' site/examples/ts/check-lists.tsx
sed -n '1,170p' site/examples/ts/inlines.tsx
sed -n '1,180p' site/examples/ts/code-highlighting.tsx
sed -n '1,180p' site/examples/ts/mentions.tsx
rg -n "editor\\.(insertText|deleteBackward|deleteForward|insertBreak|apply|onChange)|Transforms\\.(delete|insert|setNodes|wrapNodes|unwrapNodes|select)|Editor\\.(insertText|delete|insertBreak|addMark|removeMark)" site/examples/ts -g "*.tsx"
```

Next owner:

- Phase 6b: replace `markdown-shortcuts.tsx` editor method monkeypatching with
  explicit input-rule/command plumbing:
  - preserve current markdown shortcut behavior
  - keep browser model + DOM tests green across projects
  - prove list, heading, and Backspace-at-start behavior
  - do not touch tables/inlines/mentions in the same slice

### Phase 6b Result: Markdown Shortcuts Use Input Rules

Status: complete for proof-handle/semantic transport; native fast-list
continuation remains a later caret/list-boundary owner.

Actions:

- Added `EditableInputRule` support to the public `Editable` prop surface.
- Ran input rules inside the native beforeinput pipeline after Slate imports the
  selection and before model mutation.
- Made input-rule-owned edits skip stale user-selection restore and request
  model-owned caret repair.
- Passed input rules through `EditableTextBlocks` and exported
  `EditableInputRule` from `slate-react`.
- Wired slate-browser proof-handle `insertText` through input rules so tests do
  not bypass the same rule contract.
- Removed `markdown-shortcuts.tsx` `editor.insertText` and
  `editor.deleteBackward` monkeypatching.
- Converted markdown shortcuts to:
  - `inputRules` for text triggers
  - explicit Backspace-at-block-start app command via `onKeyDown`
- Fixed model-owned `insertParagraph`/`insertLineBreak` to request caret repair
  after structural breaks.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|undo|navigation and mutation|Arrow|word movement|line extension|records kernel commands|keeps caret|directly synced|deletes backward|deletes forward" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=webkit --grep "Backspace at selected text end" --workers=1 --retries=0
```

Results:

- build/typecheck/lint: passed
- markdown-shortcuts proof/semantic gate: `12 passed`
- broad structural guardrail: `91 passed`, `1 WebKit row failed`
- focused rerun of the WebKit row: `1 passed`

Failed probes recorded:

- A local `onDOMBeforeInput` shortcut handler was wrong because it ran outside
  the core repair timing and left fast follow-up typing against stale DOM.
- Fully native list continuation in markdown-shortcuts still exposes a separate
  list/Enter caret-boundary problem: after Enter in list items, fast follow-up
  text can land in the following paragraph on some projects.
- Mobile native markdown shortcut transport is not closed by this slice; the
  semantic proof-handle path is green.

Decision:

- The right abstraction is `EditableInputRule` in the `Editable` beforeinput
  pipeline, not editor method monkeypatching and not app-local DOM handlers.
- The remaining native list continuation bug belongs to the caret/list-boundary
  owner, not markdown trigger recognition.

Rejected tactics:

- Do not restore `editor.insertText` / `editor.deleteBackward` monkeypatching.
- Do not call the native list continuation row closed from proof-handle
  transport.

Next owner:

- Phase 6c: convert/check the next mutation bypass with lower caret blast
  radius:
  - start with `check-lists.tsx` Backspace-at-start command
  - then table boundary policy
  - keep the native markdown list-continuation failure in the Phase 7
    CaretEngine/list-boundary owner list

### Phase 6c Result: Checklist Backspace Command Is Explicit

Status: complete.

Actions:

- Removed `check-lists.tsx` `editor.deleteBackward` monkeypatching.
- Added explicit Backspace-at-checklist-start app command through `onKeyDown`.
- Added model + DOM + selection browser proof for checklist item reset.
- Preserved checkbox focus/selection behavior.
- Recorded that app-owned keydown commands still need a real repair API:
  Firefox/WebKit dropped selection until the command performed delayed
  selection/focus repair locally.

Changed files:

- `../slate-v2/site/examples/ts/check-lists.tsx`
- `../slate-v2/playwright/integration/examples/check-lists.test.ts`

Evidence:

```sh
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- lint: passed
- checklist + markdown shortcut gate: `24 passed`

Decision:

- Checklist Backspace is no longer an editor method override.
- The local delayed selection repair is acceptable only as a tracer bullet; the
  durable owner is an app-command repair API in `Editable`, because app-owned
  keydown commands need the same post-command selection discipline as input
  rules.

Rejected tactics:

- Do not reintroduce `editor.deleteBackward` monkeypatching.
- Do not convert table boundary policy in the same slice; it needs a policy API,
  not one more `onKeyDown` special case.

Next owner:

- Phase 6d: define a small app-command repair path for `Editable` keydown
  handlers before converting table/inlines:
  - app handler can signal “model command handled”
  - `Editable` applies model-owned selection preference and caret repair
  - checklist delayed local repair can be removed
  - then table boundary policy can use the same path

### Phase 6d Result: Key App Commands Get Repair Path

Status: complete.

Actions:

- Added `EditableKeyCommandHandler` and `onKeyCommand` as an explicit
  app-owned model-command key path.
- Routed `onKeyCommand` through `applyEditableKeyDown(...)` with model-owned
  caret repair and selection-source transition.
- Passed `onKeyCommand` through `EditableTextBlocks`.
- Exported `EditableKeyCommandHandler` from `slate-react`.
- Migrated `check-lists.tsx` from local delayed repair to `onKeyCommand`.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/site/examples/ts/check-lists.tsx`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Backspace|Delete|navigation and mutation|Arrow|records kernel commands" --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- checklist + markdown shortcut gate: `24 passed`
- richtext keydown guardrail: `40 passed`

Decision:

- App-owned key commands now have an explicit repair contract.
- `onKeyDown` remains for UI/menu handling and should not be inferred as a
  model mutation path.

Rejected tactics:

- Do not infer every `preventDefault` keydown handler as model-owned.
- Do not keep delayed local selection repair in examples once a command repair
  path exists.

Next owner:

- Phase 6e: convert table boundary overrides to explicit boundary policy or
  `onKeyCommand` commands:
  - `deleteBackward` at cell start
  - `deleteForward` at cell end
  - `insertBreak` inside table
  - prove table rows across projects

### Phase 6e Result: Table Boundary Policy Uses Key Commands

Status: complete.

Actions:

- Removed `tables.tsx` `editor.deleteBackward`, `editor.deleteForward`, and
  `editor.insertBreak` monkeypatching.
- Added explicit table boundary handling through `onKeyCommand`.
- Added browser rows for:
  - Backspace at table-cell start
  - Delete at table-cell end
  - Enter inside a table cell
- Rewrote table test assertions to use semantic table text plus model selection;
  `slate-browser` path locators do not map cleanly through table DOM wrappers.

Changed files:

- `../slate-v2/site/examples/ts/tables.tsx`
- `../slate-v2/playwright/integration/examples/tables.test.ts`

Evidence:

```sh
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/tables.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- lint: passed
- table boundary gate: `16 passed`

Decision:

- Table boundary behavior is no longer hidden behind editor method overrides.
- The next bypass should be inline URL insertion and inline caret movement, but
  the movement part belongs to `CaretEngine`, not a text input rule.

Rejected tactics:

- Do not force table boundaries into generic text input rules.
- Do not use DOM path locators through table wrappers as proof; use semantic
  table text plus model selection.

Next owner:

- Phase 6f: split inline example bypasses:
  - URL typed/pasted input becomes input-rule/data-transfer command
  - ArrowLeft/ArrowRight offset movement moves to the Phase 7 `CaretEngine`
    owner
  - add or update focused inline tests before changing behavior

### Phase 6f Result: Inline URL Input Uses Rules

Status: complete for URL typed/pasted command split; inline movement remains
Phase 7 `CaretEngine` owner.

Actions:

- Removed `inlines.tsx` `editor.insertText` and `editor.insertData`
  monkeypatching.
- Added `EditableInputRule` for typed URL insertion.
- Added explicit `onPaste` app command for plain-text URL paste.
- Preserved `isInline`, `isElementReadOnly`, and `isSelectable` editor
  capability overrides because those define element semantics, not mutation
  transport.
- Added focused browser proof for typed URL link insertion.
- Left ArrowLeft/ArrowRight offset movement unchanged and explicitly assigned
  to Phase 7.

Changed files:

- `../slate-v2/site/examples/ts/inlines.tsx`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`

Evidence:

```sh
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- lint: passed
- inline focused gate: `16 passed`

Decision:

- Inline URL mutation transport is no longer hidden behind editor method
  overrides.
- Inline visual movement is still not solved by this slice; it belongs to the
  central `CaretEngine` owner.

Rejected tactics:

- Do not convert ArrowLeft/ArrowRight offset movement through ad hoc app command
  plumbing.
- Do not remove semantic editor capability overrides like `isInline`; they are
  not mutation bypasses.

Next owner:

- Phase 6g: classify remaining app/example mutations:
  - code-highlighting Tab insertion and toolbar app commands
  - mentions accept/cancel selection/import behavior
  - richtext toolbar app commands
  - decide which need `onKeyCommand`, input rules, app command helpers, or
    Phase 7 caret work

### Phase 6g Result: Remaining App Mutation Classification

Status: complete.

Actions:

- Re-scanned remaining example mutations after hard-cutting the editor method
  overrides.
- Classified remaining mutations by owner instead of deleting valid app command
  behavior.

Classification:

- `code-highlighting.tsx`
  - `Tab` key inserts two spaces with `Editor.insertText`.
  - Owner: `onKeyCommand` text command, low risk.
  - Toolbar code-block button and language select use explicit app commands;
    keep as app commands, not input rules.
- `mentions.tsx`
  - Portal accept uses `Transforms.select(...)` and `insertMention(...)`.
  - Owner: app interaction command with explicit selection import/export.
  - Semantic overrides `isInline`, `isVoid`, `markableVoid` stay; they define
    model behavior, not mutation transport.
- `richtext.tsx`
  - Toolbar mark/block commands use direct transforms.
  - Owner: app command helper/documentation, not input rule.
  - No hidden editor method monkeypatch remains.
- `inlines.tsx`
  - URL insertion/paste is handled by input rule/app paste command.
  - Arrow movement remains `CaretEngine` owner.
- `markdown-shortcuts.tsx`, `check-lists.tsx`, `tables.tsx`
  - Editor method monkeypatches removed.

Decision:

- Phase 6’s hard-cut target is effectively complete for editor method mutation
  monkeypatches.
- The remaining high-risk work is not more example cleanup. It is Phase 7:
  central caret/selection movement ownership.

Rejected tactics:

- Do not turn toolbar commands into input rules.
- Do not remove mention semantic overrides.
- Do not hide inline/table movement under local app commands.

Next owner:

- Phase 7: `CaretEngine` owns visual movement:
  - ArrowLeft/ArrowRight around inline/read-only inline
  - ArrowUp/ArrowDown chained movement
  - Home/End and line extension
  - generated slate-browser navigation gauntlets
  - native markdown list continuation stays in this owner list

## Phase 7: CaretEngine Owns Visual Movement

Goal:

- stop relying on browser movement where Slate/plugin semantics require visual
  ownership

Actions:

- Add visual movement API:
  - `moveHorizontal`
  - `moveWord`
  - `moveLine`
  - `extendLine`
  - `moveHomeEnd`
- Use DOM range rects for visual line boundaries.
- Add conservative fallback when geometry is unavailable.
- Move table-like visual boundary lessons into Slate v2 core runtime.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Arrow|word movement|line extension|navigation and mutation"
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Exit:

- visual movement has one owner
- browser default movement is used only where explicitly allowed

### Phase 7a Result: Model-Owned Break Repair Is Authoritative

Status: complete for native desktop markdown list continuation and existing
navigation guardrails.

Actions:

- Added a native desktop markdown list-continuation browser row that reproduces
  the previously hidden caret/list-boundary regression.
- Made beforeinput command-owned operations skip stale user-selection restore.
  The command result owns selection.
- Made `repairCaretAfterModelOperation()` model-first by removing DOM selection
  import before repair.
- Added immediate, microtask, and macrotask DOM selection repair attempts before
  the existing rAF retry loop. This closes fast follow-up typing races after
  model-owned structural breaks.
- Forced render before model-owned break caret repair.
- Narrowed the new native list-continuation row to desktop-native transport;
  mobile remains covered by the semantic list fallback row because Playwright
  mobile `pressSequentially('* ')` does not trigger the shortcut transport.

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`

Evidence:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bun run lint:fix
bun run lint
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Arrow|word movement|line extension|navigation and mutation" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- markdown shortcuts: `16 passed`
- richtext navigation guardrail: `20 passed`
- inline navigation/input guardrail: `16 passed`

Failed probes recorded:

- Initial native desktop list-continuation row failed on Chromium/WebKit because
  model-owned structural break repair restored stale user selection.
- After model-first repair, WebKit still raced because rAF repair was too late
  for fast follow-up typing. Immediate/microtask/macrotask repair closed it.
- Mobile raw keyboard transport for `* ` did not trigger markdown shortcut
  beforeinput. The existing semantic list row remains the honest mobile proof.

Decision:

- For model-owned beforeinput commands, command selection is authoritative.
  Restoring pre-command user selection is wrong.
- Model-owned caret repair must attempt synchronous/near-synchronous DOM repair
  before waiting for animation frames.

Rejected tactics:

- Do not make mobile raw keyboard shortcut transport a required proof when the
  automation does not fire the same beforeinput path.
- Do not restore DOM selection into model selection during model-owned repair.

Next owner:

- Phase 7b: make `CaretEngine` API explicit:
  - split movement into `moveHorizontal`, `moveWord`, `moveLine`,
    `extendLine`, and `moveHomeEnd`
  - add kernel command traces for handled movement
  - add generated slate-browser navigation gauntlet coverage

### Architecture Replan: Pivot To Authoritative Kernel

Status: active replan.

Harsh take:

- Continuing with one-row caret patches is the wrong tactic.
- The direction is still right, but the runtime is not yet strict enough.
- The current architecture has good owners, but `EditableEditingKernel` is not
  yet the only authority. That is why regressions keep appearing in timing
  gaps between `keydown`, `beforeinput`, `selectionchange`, app commands, DOM
  repair, and browser-native behavior.

Current gap:

- `CaretEngine`, `DOMRepairQueue`, `SelectionController`,
  `MutationController`, input rules, and app commands exist, but they still
  coordinate by convention instead of one audited kernel result.
- Some handlers still do local sequencing and then ask repair/selection systems
  to catch up.
- Browser tests catch individual cases, but they are not yet a generated
  executable state-space spec.
- Model-owned repair only became correct after the native list continuation
  failure proved stale DOM selection could overwrite command-owned selection.
  That class of failure should be illegal by design.

Reference lesson from local editor sources:

- Lexical centralizes command/update ownership and uses explicit update tags
  for DOM selection/focus behavior.
- ProseMirror centralizes DOM input, transactions, and selection syncing in the
  view layer.
- Edix has simpler internals but strong operation/selection proof rows.
- Slate v2 should not copy their model, but it should copy the discipline:
  one authority decides mutation and selection timing.

Decision:

- Pivot Phase 7b from "add more caret helpers" to "make the editing kernel
  authoritative".
- Keep the current data-model-first / transaction-first / React-optimized
  direction.
- Do not rewrite back to legacy `Editable`; recover legacy timing discipline,
  not legacy monolith code.

Next owner:

- Phase 7b: kernel state-machine skeleton:
  - define `EditableKernelMode` transitions for `idle`, `dom-selection`,
    `model-owned`, `composition`, `app-owned`, `clipboard`, `dragging`,
    `internal-control`, and `shell-backed`
  - define `KernelResult` as the single carrier for command, selection source,
    ownership, repair, trace, and allowed native behavior
  - route keydown movement through the result first
  - throw or trace illegal transitions in dev/test
  - keep behavior identical in the first slice except for trace/guarding

Then:

- Phase 7c: generated slate-browser navigation/mutation gauntlet
  - navigation chains
  - mutation after navigation
  - inline/read-only inline boundaries
  - list continuation
  - shell activation
  - app command repair
- Phase 7d: move `CaretEngine` into explicit movement APIs under the kernel
  result contract.
- Phase 7e: repeat for clipboard, composition, and focus/mouse.

### Phase 7b Result: Kernel Transition Skeleton

Status: complete for trace-level state-machine skeleton and keydown movement
result routing.

Actions:

- Added kernel transition metadata to every trace entry.
- Added `getEditableKernelTransition(...)` with first illegal-transition guards:
  - command cannot be native-owned
  - `nativeAllowed` requires native ownership
  - internal controls cannot dispatch model commands
  - repair cannot hand authority back to stale DOM selection
- Added `createEditableKernelTraceEntry(...)` and
  `createEditableKernelResult(...)`.
- Made `applyEditableKeyDown(...)` return handled status.
- Routed keydown trace construction through `createEditableKernelResult(...)`.
- Added browser proof that movement commands record an allowed kernel
  transition.

Changed files:

- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Arrow|word movement|line extension|navigation and mutation|kernel transitions" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- build/typecheck/lint: passed
- richtext navigation + transition gate: `24 passed`
- markdown + inlines guardrail: `32 passed`

Decision:

- The kernel now emits transition legality, but the state machine is still
  observability-first. It does not yet drive all event families.
- This is the right first slice: no behavior change, but future illegal timing
  transitions become visible in browser traces.

Rejected tactics:

- Do not make transition guards throw yet. The trace layer needs one full
  generated-gauntlet pass before strict mode can fail tests.
- Do not continue adding one-off movement rows without generated scenarios.

Next owner:

- Phase 7c: generated slate-browser navigation/mutation gauntlet:
  - add reusable scenario builder for bounded keyboard/navigation/mutation
    chains
  - record platform, transport, expected owner, and reduction hint per step
  - cover ArrowLeft/Right, ArrowUp/Down, word movement, line extension,
    type/delete after movement, markdown list continuation, and inline
    boundaries
  - fail on illegal kernel transition traces

## Phase 8: Clipboard And Paste Kernel Ownership

Goal:

- paste/cut/drop become command-driven with capability metadata

Actions:

- Kernel classifies clipboard capability:
  - native clipboard read/write
  - event clipboard data
  - Slate fragment
  - rich HTML
  - plain text
  - denied transport
- MutationController owns model insertion/deletion.
- DOMRepairQueue owns post-mutation selection/caret repair.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "copy|cut"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "paste|fragment|shell"
```

Exit:

- rich/fragment/plain paste paths have explicit capability proof

## Phase 9: Composition Kernel Ownership

Goal:

- composition is a first-class state, not a boolean side flag

Actions:

- Kernel enters `composition` state on compositionstart/update.
- Selection source becomes `composition-owned`.
- DOM-owned text sync opts out.
- Commit path exits composition with explicit repair.
- Android manager stays behind a composition worker boundary.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME|composition"
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
```

Exit:

- composition transitions are traceable
- no direct DOM sync during composition

## Phase 10: Shell / Island Kernel Ownership

Goal:

- shell activation, shell selection, and shell paste are kernel states

Actions:

- Shell activation is not selection unless explicitly selecting.
- Shell-backed selection is a selection source.
- Full-doc shell paste remains model-owned.
- Partial shell paste remains fragment-owned.

Gates:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Exit:

- huge-doc perf stays green
- shell correctness is kernel-owned

## Phase 11: Generated Slate-Browser Gauntlets

Goal:

- stop relying on hand-written rows only

Add gauntlet families:

- navigation chains
- mutation chains
- selection + marks
- composition
- paste/cut/drop
- nested editors/internal controls
- inline/void boundaries
- large-doc shell activation
- shadow DOM
- mobile semantic fallback

Each generated scenario must assert:

- model text
- model selection
- DOM text
- DOM selection
- focus owner
- trace steps
- follow-up typing

Files:

- `../slate-v2/packages/slate-browser/src/playwright/**`
- `../slate-v2/playwright/integration/examples/**`

Exit:

- at least one generated scenario per event family
- failure artifacts include trace + reduction candidates

## Phase 12: Reduction Workflow

Goal:

- failures shrink to minimal repros automatically or semi-automatically

Actions:

- Use `createScenarioReductionCandidates(...)`.
- Add a local command/helper to rerun candidates.
- Emit:
  - original failing scenario
  - shortest passing prefix
  - smallest failing candidate
  - trace diff

Exit:

- a failed gauntlet gives a useful minimal next owner

## Phase 13: Hard-Cut Legacy Surfaces

Goal:

- remove the APIs that keep pulling the runtime backward

Cut or isolate:

- `decorate` from primary API
- `renderChunk`
- child-count chunking
- old legacy `Editable`
- mutable editor fields from docs/examples
- instance `editor.apply` / `onChange` as normal extension paths
- ad hoc `editor.insertText = ...` example overrides where kernel commands
  exist

Exit:

- docs/examples teach only the final runtime

## Phase 14: Full Closure Gates

Required gates:

```sh
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun --filter slate-browser test
bun run test:slate-browser
bun test:integration-local
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Completion criteria:

- kernel owns event ordering
- each event has one selection source
- structural edits are model-owned
- native editing is allowed only by explicit capability
- plugin/example mutations go through command/input-rule contracts
- generated gauntlets cover all event families
- traces include platform/transport/capability metadata
- reducer candidates exist for failures
- full integration and perf gates pass

## Testing Matrix

### Event Families

- keydown navigation
- keydown structural edit
- beforeinput text
- beforeinput delete
- input fallback
- composition
- paste
- copy
- cut
- drag/drop
- focus/blur
- click/mousedown
- selectionchange

### Document Shapes

- plain paragraph
- marked text
- decorated text
- inline links
- inline voids
- block voids
- tables
- nested editor
- internal input/button/select/textarea
- shadow DOM
- iframe
- large-document shell
- shell-backed selection

### Platform Targets

- Chromium
- Firefox
- WebKit
- mobile Playwright semantic fallback
- Appium only where it can honestly drive contenteditable

### Assertions

Every user-editing scenario must assert:

- Slate model text
- visible DOM text
- Slate model selection
- DOM selection
- active/focused owner
- follow-up typing
- trace owner/source transitions

## Performance Rules

Do not regress:

- DOM-owned plain text lane
- active corridor
- semantic islands
- projection stores
- overlay source invalidation
- 5000-block compare

Perf gates must stay tied to correctness gates. No perf win can bypass:

- IME
- custom renderers
- decorations/projections
- internal controls
- rich paste
- accessibility markup
- shell selection

## File Ownership Map

### `slate-react`

- `src/editable/editing-kernel.ts`
  - event lifecycle owner
- `src/editable/input-controller.ts`
  - classification worker
- `src/editable/selection-controller.ts`
  - selection import/export worker
- `src/editable/mutation-controller.ts`
  - model command worker
- `src/editable/caret-engine.ts`
  - cursor movement worker
- `src/editable/dom-repair-queue.ts`
  - repair executor
- `src/editable/input-router.ts`
  - low-level listener attachment only
- `src/components/editable.tsx`
  - React shell only, not editing policy

### `slate-browser`

- `src/playwright/index.ts`
  - public browser proof harness
- future `src/playwright/scenario.ts`
  - scenario DSL
- future `src/playwright/reducer.ts`
  - reducer/shrinker
- future `src/playwright/capabilities.ts`
  - platform/transport ledger

### Examples

- `site/examples/ts/markdown-shortcuts.tsx`
  - convert to input rules
- `site/examples/ts/richtext.tsx`
  - keep as broad runtime proof
- `site/examples/ts/large-document-runtime.tsx`
  - keep as perf/correctness proof

## Non-Goals

- Do not make core React-first.
- Do not revive child-count chunking.
- Do not restore legacy `Editable` monolith.
- Do not keep patching one browser bug at a time as the main strategy.
- Do not treat Playwright mobile hardware keyboard as native mobile IME proof.
- Do not move everything into one mega-controller.

## Final Recommendation

Do the hard-cut kernel rewrite.

The current controller split is a good staging area, but it is not the final
architecture. The next serious lane must make `EditableEditingKernel` the only
authority over browser editing timing.

Until then, the system will keep producing edge-case regressions because the
architecture still allows multiple pieces to believe they own selection and
mutation timing.

The product goal remains:

- Slate data model
- transaction/operation truth
- React 19.2 perfect runtime
- browser editing safety
- no chunking
- no legacy API drag

The path to get there is not another local bug fix. It is the kernel.
