---
date: 2026-04-22
topic: slate-v2-authoritative-editing-kernel-perfect-architecture
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/edix
related:
  - docs/plans/2026-04-22-slate-v2-editing-kernel-hard-cut-rewrite-plan.md
  - docs/plans/2026-04-21-slate-v2-final-api-runtime-shape-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/analysis/editor-architecture-candidates.md
---

# Slate v2 Authoritative Editing Kernel Plan

## Verdict

Pivot execution strategy.

Do not pivot away from Slate's data model, operations, transactions, semantic
`Editable`, projection overlays, or React-perfect runtime work.

Do pivot away from patching browser bugs row by row.

The target architecture is:

```txt
browser event
  -> kernel dispatch
  -> target owner
  -> input intent
  -> command
  -> selection source
  -> transaction/mutation
  -> DOM text/selection repair
  -> trace
```

Exactly one owner decides that chain.

Everything else is a worker.

## Harsh Take

The current runtime is promising, but it is not the final architecture.

The files are better:

- `editing-kernel.ts`
- `input-controller.ts`
- `selection-controller.ts`
- `mutation-controller.ts`
- `caret-engine.ts`
- `dom-repair-queue.ts`
- `input-router.ts`

But the kernel is still not fully authoritative.

The runtime still has too many places where timing truth can leak:

- `keydown` can import DOM selection before a model command.
- `beforeinput` can store stale user selection and restore it after a command.
- `selectionchange` can race model-owned repair.
- app key handlers can mutate model state unless they use explicit command
  paths.
- DOM repair can run after browser-native follow-up typing.
- proof handles can make tests pass while native transport remains unproved.

That is why regressions keep appearing.

The problem is not missing cases. The problem is ambiguous authority.

## Principle Stack

Order matters:

- data-model-first core
- operation/collaboration-friendly commands
- transaction-first local execution
- browser-editing correctness
- React-perfect runtime
- huge-doc performance
- compatibility only where it does not pollute the runtime

React should get better runtime APIs.

React should not define the core model.

## Keep

- Slate JSON-like document model.
- Slate operation layer.
- transaction/commit metadata.
- live reads and runtime-id/path indexes.
- semantic `Editable`.
- projection-source overlays.
- DOM-owned plain text capability.
- `EditableInputRule`.
- `onKeyCommand`.
- `slate-browser` model + DOM proof.
- active corridor / semantic islands / no child-count chunking.

## Hard Cut

- model mutations from arbitrary `onKeyDown`.
- model mutations from arbitrary `onDOMBeforeInput`.
- editor method monkeypatching in examples/plugins.
- browser default structural editing as trusted truth.
- `Editor.getSnapshot()` as urgent render/read path.
- repair paths that import DOM selection during model-owned repairs.
- tests that use proof handles while claiming native transport.
- broad Chromium-only browser closure.
- legacy `decorate` as primary overlay API.
- child-count chunking as product runtime.

## Recover From Legacy

Recover:

- centralized timing discipline.
- browser-compat ordering knowledge.
- caution around selection restoration.
- the idea that editing behavior has one coherent mental model.

Do not recover:

- the legacy `Editable` monolith.
- legacy plugin method monkeypatching.
- `renderChunk`.
- child-count chunking.
- `decorate` as the primary API.

## Reference Lessons

### Lexical

Local refs:

- `../lexical/packages/lexical/src/LexicalUpdates.ts`
- `../lexical/packages/lexical/src/LexicalUtils.ts`
- `../lexical/packages/lexical/src/LexicalUpdateTags.ts`

Useful lessons:

- commands and updates are the mutation path.
- update tags explicitly control DOM selection/focus behavior.
- DOM selection sync is part of the update lifecycle, not random React repair.

Slate v2 take:

- keep Slate's model and operations.
- adopt explicit update/repair tags.
- every editing command must declare selection and repair semantics.

### ProseMirror

Local refs:

- `../prosemirror/view/src/input.ts`
- `../prosemirror/view/src/selection.ts`
- `../prosemirror/view/src/domobserver.ts`
- `../prosemirror/state/src/transaction.ts`

Useful lessons:

- the view owns input, transactions, DOM observation, and selection sync.
- plugin handlers can participate, but the view decides the final transaction.
- DOM observer effects are coordinated with transaction application.

Slate v2 take:

- `EditableEditingKernel` is Slate v2's view authority.
- app/plugin hooks return commands or decisions, not arbitrary timing side
  effects.

### Edix

Local refs:

- `../edix/src/editor.ts`
- `../edix/src/commands.ts`
- `../edix/src/doc/edit.ts`
- `../edix/e2e/common.spec.ts`

Useful lessons:

- simple command functions with selection snapshots are easier to test.
- e2e rows aggressively assert selection after commands.

Slate v2 take:

- every command must have model text, model selection, DOM text, DOM selection,
  and follow-up typing proof.

## Target Architecture

### 1. `EditableEditingKernel`

The kernel owns:

- browser event ordering
- target ownership
- intent classification
- command creation
- native-vs-model ownership
- selection source
- mutation dispatch
- repair scheduling
- trace emission

Public internal shape:

```ts
type EditableEditingKernel = {
  dispatch(event: EditableKernelEvent): EditableKernelResult
}
```

### 2. `EditableKernelEvent`

Every browser/input path becomes one event shape:

```ts
type EditableKernelEvent = {
  family:
    | 'keydown'
    | 'beforeinput'
    | 'input'
    | 'selectionchange'
    | 'compositionstart'
    | 'compositionupdate'
    | 'compositionend'
    | 'paste'
    | 'copy'
    | 'cut'
    | 'drop'
    | 'dragstart'
    | 'dragover'
    | 'dragend'
    | 'focus'
    | 'blur'
    | 'mousedown'
    | 'click'
    | 'repair'
  nativeEvent: Event
  target: EventTarget | null
}
```

### 3. `EditableKernelResult`

All handlers return a result.

No handler performs hidden policy.

```ts
type EditableKernelResult = {
  handled: boolean
  nativeAllowed: boolean
  ownership:
    | 'model-owned'
    | 'native-allowed'
    | 'native-denied'
    | 'app-owned'
    | 'deferred'
    | 'no-op'
  targetOwner:
    | 'editor'
    | 'internal-control'
    | 'app-owned'
    | 'shell'
    | 'outside-editor'
    | 'unknown'
  intent: InputIntent | null
  command: EditableCommand | null
  selectionSource: SelectionSource
  repair: EditableRepairRequest | null
  transition: EditableKernelTransition
  trace: EditableKernelTraceEntry
}
```

### 4. `EditableCommand`

Commands are the only mutation language.

Required command families:

- insert text
- insert break
- insert data
- delete
- delete fragment
- history
- move selection
- select
- select all
- set block
- toggle mark
- paste fragment
- accept app interaction
- shell activate

### 5. `SelectionSource`

Every event has one selection truth source:

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

Rules:

- model-owned commands never restore stale DOM selection.
- native text may import DOM selection before mutation.
- composition owns selection during composition.
- shell activation is not selection unless it intentionally selects.
- internal controls keep editor selection stable.
- app commands must declare repair behavior.

### 6. `KernelMode`

Modes are explicit:

- `idle`
- `dom-selection`
- `model-owned`
- `composition`
- `app-owned`
- `clipboard`
- `dragging`
- `internal-control`
- `shell-backed`
- `repairing`

Illegal examples:

- command with `nativeAllowed: true`
- model command from internal control
- repair handing authority back to DOM selection
- composition event mutating through non-composition command
- app key handler mutating model without command result

### 7. Workers

Workers do not decide global timing.

`InputController`:

- classify only
- no mutation
- no repair scheduling

`SelectionController`:

- import/export model and DOM selection
- no command policy

`MutationController`:

- apply commands
- return operation/selection effects
- no DOM repair

`CaretEngine`:

- movement only
- no event ownership
- no repair scheduling beyond returning result metadata

`DOMRepairQueue`:

- execute repair
- no model mutation policy
- no stale DOM import during model-owned repair

`InputRouter`:

- attach low-level listeners
- no editing policy

## Public Runtime APIs

`Editable` supports:

- `inputRules`
- `onKeyCommand`
- future `appCommands`
- projection stores
- DOM-owned text capability
- browser handle for proof only

Do not expose:

- `renderChunk`
- child-count chunking
- `decorate` as primary overlay API
- editor method monkeypatching as extension API

## Testing Architecture

### Required Assertions

Every browser-editing scenario must assert:

- model text
- visible DOM text
- model selection
- DOM selection
- focus/active owner
- follow-up typing
- kernel trace
- transition legality

### Generated Gauntlets

Add slate-browser generated scenarios for:

- horizontal movement
- vertical movement
- word movement
- line extension
- Home/End
- movement then text
- movement then Backspace/Delete
- range select then mark
- range delete then type
- Enter/list continuation
- inline/read-only inline boundaries
- void boundaries
- nested editor/internal controls
- shell activation
- shell-backed selection
- paste/cut/drop
- composition
- shadow DOM
- mobile semantic fallback

### Scenario Metadata

Each generated step records:

- platform
- transport
- event family
- input intent
- expected command
- expected selection source
- expected ownership
- expected repair
- expected transition legality
- reduction hint

### Strict Mode

Phase 1:

- trace illegal transitions

Phase 2:

- fail generated gauntlets on illegal transitions

Phase 3:

- fail development/test runtime on illegal transitions

Do not throw in production.

## Implementation Plan

### Phase A: Kernel State Machine

Goal:

- make state transitions explicit and traceable.

Actions:

- complete `EditableKernelTransition`
- add legal transition table
- add `createEditableKernelResult`
- route every keydown trace through kernel result
- route every beforeinput trace through kernel result
- expose illegal transition traces in slate-browser snapshots

Gates:

```sh
bunx turbo build --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "kernel transitions|Arrow|navigation and mutation"
```

Exit:

- every keydown/beforeinput row has transition metadata.

### Phase B: Generated Navigation Gauntlet

Goal:

- stop relying on hand-picked navigation examples.

Actions:

- add `slate-browser` navigation scenario generator
- generate bounded sequences:
  - arrows
  - word movement
  - line movement
  - line extension
  - text after movement
  - delete after movement
- include reduction hints
- fail on illegal kernel transitions

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "navigation gauntlet"
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Exit:

- navigation has generated model + DOM + trace proof.

### Phase C: CaretEngine API

Goal:

- movement has one worker API.

Actions:

- split:
  - `moveHorizontal`
  - `moveWord`
  - `moveLine`
  - `extendLine`
  - `moveHomeEnd`
- return movement command result metadata
- keep DOM geometry reads local to caret engine
- use conservative fallback when geometry unavailable

Gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "Arrow|word movement|line extension|navigation gauntlet"
```

Exit:

- browser default movement is allowed only by explicit result.

### Phase D: App Command Contract

Goal:

- app/plugin commands stop mutating model without repair metadata.

Actions:

- expand `onKeyCommand`
- add `appCommands` helper API
- make command result declare repair/focus behavior
- convert:
  - code-highlighting Tab
  - mentions accept/cancel
  - richtext toolbar helpers where useful

Gates:

```sh
bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
```

Exit:

- app commands have explicit repair contract.

### Phase E: Clipboard Kernel

Goal:

- clipboard is command/capability driven.

Actions:

- classify clipboard capability:
  - native read/write
  - event data
  - Slate fragment
  - HTML
  - plain text
  - denied
- route paste/cut/drop through kernel result
- keep fragment/rich/plain semantics explicit

Gates:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "copy|cut"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "paste|fragment|shell"
```

Exit:

- paste/cut/drop have capability traces and no hidden browser-default
  structural mutation.

### Phase F: Composition Kernel

Goal:

- IME owns its mode and repair timing.

Actions:

- route composition lifecycle through kernel mode
- composition text command owns selection
- direct DOM sync opts out during composition
- add generated composition scenarios where automation is honest

Gates:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "composition|IME"
```

Exit:

- composition cannot leak into generic text path.

### Phase G: Shell/Internal Control Kernel

Goal:

- shell activation and internal controls stop fighting selection.

Actions:

- shell activation command is separate from selection
- internal controls preserve editor model selection
- nested editors own their own focus/selection
- shell-backed selection has explicit command semantics

Gates:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "shell|activation|selection"
```

Exit:

- no direct selection mutation for activation.

### Phase H: Strict Transition Mode

Goal:

- illegal timing transitions fail tests.

Actions:

- turn trace warnings into test failures in generated gauntlets
- add dev/test strict mode
- keep production non-throwing

Gates:

```sh
bun test:integration-local
```

Exit:

- no broad skipped browser debt
- no illegal transition traces in release proof rows

## Performance Guardrails

Every phase must preserve:

- DOM-owned plain text lane
- active corridor
- semantic islands
- projection stores
- no child-count chunking
- 5000-block huge-doc compare

Perf gates:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Run these after changes to:

- text rendering
- DOM repair timing
- selection subscriptions
- large-document shell activation
- projection store invalidation

## Completion Criteria

This lane is not complete until:

- kernel result owns every event family
- illegal transitions fail generated gauntlets
- `CaretEngine` owns movement only
- `DOMRepairQueue` repairs only
- `MutationController` mutates only
- `SelectionController` imports/exports only
- app/plugin mutation goes through commands/input rules
- browser structural default is not trusted
- slate-browser generated gauntlets cover navigation, mutation, marks,
  composition, clipboard, internal controls, shell selection, shadow DOM, and
  mobile semantic fallback
- `bun test:integration-local` is green or every remaining row is explicitly
  accepted/deferred with exact rationale
- huge-doc perf gates remain green

## Current Next Owner

Phase A is active.

Start with keydown and beforeinput because they caused the observed regressions.

Do not move to clipboard/composition until keydown/beforeinput have generated
gauntlet proof.
