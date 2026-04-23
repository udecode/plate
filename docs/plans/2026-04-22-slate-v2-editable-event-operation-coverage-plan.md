---
date: 2026-04-22
topic: slate-v2-editable-event-operation-coverage
status: planned
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
related:
  - docs/plans/2026-04-22-slate-v2-editable-browser-kernel-refactor-plan.md
  - docs/plans/2026-04-22-slate-v2-backspace-caret-testing-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-cut-proof-must-use-real-shortcut-and-assert-selection.md
---

# Slate v2 Editable Event / Operation Coverage Plan

## Goal

Build high-confidence browser editing coverage for every meaningful event and
operation lane used by the v2 `Editable` runtime.

The coverage must prevent the current class of regressions:

- model text changes but DOM/caret is wrong
- DOM text changes but Slate selection is null
- selection looks correct in Slate but visible caret is outside the editor
- browser event transport works in one path but breaks follow-up typing
- clipboard/drag/composition/history behavior is green only through model-only
  or synthetic proof

Backspace is the first tracer bullet. It is not the whole lane.

## Hard Take

No, the current proof is not "absolute best" yet.

The architecture direction is right:

- data-model-first core
- transaction/commit truth
- renderer live reads
- semantic `Editable`
- DOM-owned text as a guarded capability
- browser proof through `slate-browser`
- split owners under `packages/slate-react/src/editable/*`

But the proof is still too thin around event/operation coverage.

The refactor made ownership cleaner. It did not magically prove every editing
path. The next step is a full event/operation test grid that asserts browser
state, not just model state.

## Architecture Position

### Keep

- data-model-first `slate`
- operations as collaboration/history truth
- transaction-first local execution
- renderer-optimized live reads and dirty regions
- projection-source overlay model
- semantic `Editable`
- `slate-browser` model + DOM assertions
- strict DOM-owned text capability

### Do Not Revert

- do not revive child-count chunking
- do not bring `decorate` back as the primary overlay API
- do not make core React-first
- do not use `Editor.getSnapshot()` as the urgent render/read path
- do not merge browser editing policy back into one giant `editable.tsx`

### Still Not Perfect

- core microbench lanes still need work for "absolute best core"
- mutable editor fields and compatibility surfaces still exist in places
- `EditableDOMRoot` still coordinates native `beforeinput`
- event/operation browser proof is incomplete
- non-Chromium/mobile coverage is not enough for framework-grade closure

## Current Runtime Owners

Current owner files in `../slate-v2/packages/slate-react/src/editable/`:

- `browser-handle.ts`
- `clipboard-input-strategy.ts`
- `composition-state.ts`
- `dom-repair-queue.ts`
- `input-router.ts`
- `keyboard-input-strategy.ts`
- `model-input-strategy.ts`
- `native-input-strategy.ts`
- `selection-reconciler.ts`

`EditableDOMRoot` should remain a coordinator, not a policy dump.

Current accepted coordinator:

- native `beforeinput` orchestration remains in `EditableDOMRoot` because it
  coordinates many already-extracted owners. Extracting it as one huge helper
  would make the boundary worse.

## Universal Test Contract

Any user-facing editing row must assert every relevant layer.

For text/editing operations:

- model text
- visible DOM text
- Slate selection
- DOM selection
- visual caret when meaningful
- follow-up typing lands at the expected place

For clipboard operations:

- clipboard text
- clipboard HTML/fragment semantics
- model text after operation
- visible DOM text after operation
- Slate selection
- DOM selection/caret when editable state continues

For composition/IME:

- committed text
- model selection
- DOM selection
- no duplicate insertion
- follow-up typing

For focus/selection:

- model selection
- DOM selection
- focus state where observable
- no accidental activation/selection mutation

## Event / Operation Coverage Matrix

## Legacy No-Regression Protocol

Legacy Slate is evidence, not a cage.

Before calling this lane complete, build a parity ledger from:

- `../slate/packages/slate-react/**`
- `../slate/site/examples/**`
- `../slate/playwright/**` if present
- current v2 examples/tests under `../slate-v2/playwright/integration/examples/**`
- current v2 React contracts under `../slate-v2/packages/slate-react/test/**`

Every legacy browser-editing behavior must be classified:

- `recovered`: v2 has an equivalent or stronger browser-visible row
- `replaced`: v2 proves the same user contract through the final API/runtime
- `hard-cut`: legacy behavior is intentionally not supported, with rationale
- `compat-only`: supported only through explicit compat surface
- `deferred`: accepted with exact owner, risk, and future gate

No hidden skip debt:

- do not leave broad project skips as "green"
- do not keep tests for dead legacy APIs
- do not preserve a legacy row if it conflicts with the final architecture
- do not drop a legacy behavior without a written hard-cut rationale

Required artifact:

- append a `Legacy No-Regression Ledger` section to this plan as rows are
  classified

Minimum columns:

| Legacy behavior | Final v2 behavior | Status | Proof command | Owner | Rationale |
| --- | --- | --- | --- | --- | --- |

## Legacy No-Regression Ledger

Skip inventory:

- v2 `../slate-v2/playwright/integration/examples/**`: no skipped rows found
  with `rg -n "test\\.skip|\\.skip\\(|skip\\("`.
- legacy `../slate/playwright/integration/examples/**`: one skipped row,
  `inlines.test.ts` arrow-key read-only inline navigation.
- v2 recovers the legacy skipped inline row as an active integration row:
  `playwright/integration/examples/inlines.test.ts` /
  `arrow keys skip over read-only inline`.

| Legacy behavior | Final v2 behavior | Status | Proof command | Owner | Rationale |
| --- | --- | --- | --- | --- | --- |
| Editable void structure, duplication, and embedded input editing | `editable-voids` keeps legacy rows and adds outer-selection restoration, nested editor input, and selectionchange-noise rows | recovered | `bun test:integration-local` | `slate-react` browser event policy | v2 proves the original behavior plus the higher-risk focus/selection paths that legacy did not cover. |
| Check-list checkbox toggling | `check-lists` toggles checkbox and preserves editor selection/follow-up insertion | recovered | `bun test:integration-local` | `slate-react` internal interactive target policy | v2 keeps the checkbox behavior and proves the non-editable target does not corrupt selection. |
| Read-only inline arrow navigation | Active `inlines` row for arrow keys around read-only inline | recovered | `bun test:integration-local` | `slate-react` selection/navigation | Legacy skipped this row; v2 runs it. |
| Inline link cut | `inlines` cut row deletes selected inline link text and keeps desktop caret follow-up; mobile proves deletion only | recovered / mobile transport narrowed | `bun test:integration-local` | clipboard transport / mobile automation | Desktop projects prove caret follow-up; mobile cannot use forbidden clipboard reads or reliable role follow-up after cut, so it proves deletion. |
| Richtext render and typing | `richtext` covers render, browser insertion, visual caret, movement, delete/backspace, undo, paste-over-selection, and route remount | recovered | `bun test:integration-local` | `slate-react` input/selection/history | v2 exceeds legacy's render/type/undo coverage with browser-visible selection and caret assertions. |
| Plaintext typing | `plaintext` inserts typed text | recovered | `bun test:integration-local` | browser input | Legacy behavior remains active. |
| Paste HTML bold/code | `paste-html` keeps bold/code rows and adds selected-content rich paste/follow-up proof; mobile uses semantic insertion where clipboard write is denied | recovered / mobile transport narrowed | `bun test:integration-local` | clipboard transport | Desktop proves clipboard path; mobile proves model/visible rich insertion because `navigator.clipboard.write*` is denied. |
| Shadow DOM editor render/edit/line break | `shadow-dom` covers nested shadow rendering, editing, and new-line typing | recovered | `bun test:integration-local` | `slate-react` DOM bridge | Legacy behavior remains active and green across projects. |
| Markdown shortcuts quote/list/heading | `markdown-shortcuts` keeps quote, list, and heading rows | recovered | `bun test:integration-local` | app shortcut example | Legacy behavior remains active. |
| Mentions render/list/insert | `mentions` keeps render/list/insert rows | recovered | `bun test:integration-local` | inline void/app example | Legacy behavior remains active after earlier mention/full-selection fixes. |
| Images render/delete invalid URL/selected image | `images` covers image render, invalid prompt rejection, and selected image deletion | recovered | `bun test:integration-local` | void element selection/deletion | v2 keeps legacy image behavior and adds invalid prompt proof. |
| Tables render | `tables` table tag row remains active | recovered | `bun test:integration-local` | table rendering | Legacy behavior remains active. |
| Huge document chunking example | v2 huge document renders without child-count chunking | replaced | `bun test:integration-local`; `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local` | semantic islands / large-document runtime | Legacy chunking behavior is intentionally replaced by semantic islands, corridor, and occlusion. |
| Code highlighting visual token rendering | v2 uses semantic token projection assertions | replaced | `bun test:integration-local` | projection-source overlays | Final API teaches projection sources instead of legacy `decorate` as primary overlay story. |
| Search highlighting | v2 active row highlights searched text | recovered | `bun test:integration-local` | projection/decorated text | Legacy behavior remains active. |
| Hovering toolbar | v2 keeps appear/disappear rows | recovered | `bun test:integration-local` | selection/floating UI | Legacy behavior remains active. |
| Styling via `style` and `className` | v2 keeps both styling rows | recovered | `bun test:integration-local` | public `Editable` props | Legacy behavior remains active. |
| Iframe editor | v2 iframe editor remains editable | recovered | `bun test:integration-local` | DOM bridge | Legacy behavior remains active. |
| Read-only editor | v2 read-only row remains non-editable | recovered | `bun test:integration-local` | read-only policy | Legacy behavior remains active. |
| Forced layout deletion persistence | v2 forced-layout rows remain active | recovered | `bun test:integration-local` | example rendering | Legacy behavior remains active. |
| Placeholder rendering and editor height | v2 placeholder rows remain active | recovered | `bun test:integration-local` | placeholder rendering | Legacy behavior remains active. |
| Markdown preview | v2 markdown preview row remains active | recovered | `bun test:integration-local` | example rendering | Legacy behavior remains active. |
| Embeds | v2 embeds row remains active | recovered | `bun test:integration-local` | void/embed rendering | Legacy behavior remains active. |

Classification summary:

- recovered: legacy user behavior has an equivalent or stronger active v2 row
- replaced: legacy implementation strategy is intentionally replaced by the
  final v2 architecture
- transport narrowed: the row remains active, but mobile/WebKit clipboard or
  hardware-keyboard proof is narrowed where Playwright/platform APIs do not
  provide honest native transport

## Full Shape Coverage Additions

The event matrix below is not enough unless these cross-cutting shapes are
covered too.

### Marks / Formatting

Rows:

- collapsed active mark then type
- selected text add mark
- selected text remove mark
- mark-preserving insert after selection
- mark placeholder + composition
- mark placeholder + delete/backspace
- copy/cut/paste marked text

Assertions:

- model marks
- visible DOM formatting
- Slate selection
- DOM caret
- follow-up typing

### Read-Only / Disabled Editing

Rows:

- read-only editor ignores insert
- read-only editor ignores delete/backspace
- read-only editor allows safe selection
- copy works in read-only when selection exists
- paste/cut/drop do not mutate read-only content

Assertions:

- no model mutation
- selection behavior matches supported read-only contract
- no DOM/caret corruption

### App-Owned Handlers

Rows:

- `onBeforeInput` handled returns `true`
- `onBeforeInput` prevents default
- `onInput` handled returns `true`
- `onKeyDown` handled returns `true`
- `onPaste` handled returns `true`
- `onCopy` / `onCut` handled returns `true`
- drag/drop handlers handled returns `true`

Assertions:

- app-owned handler wins where documented
- Slate does not double-apply
- DOM/model selection stays valid

### Nested / Non-Editable Targets

Rows:

- event target inside `<input>` / `<textarea>` inside editor
- contentEditable=false child
- void spacer
- nested editable inside void
- target outside editor
- stale click target after app mutation

Assertions:

- ignored events stay ignored
- supported nested editable behavior still works
- focus/selection does not leak to dead nodes

### Accessibility / Focus

Rows:

- root role/aria contract stays present
- focus after cut/paste/delete remains inside editor when editing continues
- blur to supported internal target does not destroy model selection
- visual caret exists after mutating operations
- shell activation is keyboard reachable and does not publish selection unless
  intentionally selecting

Assertions:

- DOM focus
- model selection
- DOM selection
- visible caret
- ARIA/role attributes where relevant

### History

Rows:

- undo after insert
- undo after Backspace/Delete
- undo after cut
- undo after paste
- redo after each
- native browser history event while editor focus is lost

Assertions:

- model text
- DOM text
- Slate selection
- DOM selection/caret
- follow-up typing after undo/redo

### Operation Classes

Every operation class reachable from `Editable` needs at least one browser row
or explicit classification:

- `set_selection`
- `insert_text`
- `remove_text`
- `split_node`
- `merge_node`
- `insert_node`
- `remove_node`
- `set_node`
- mark-affecting operation paths
- history undo/redo operation replay

For each row, record:

- originating browser event
- expected operation class
- browser proof command
- owner strategy module

### Performance Guardrails

Any product change that touches input routing, selection reconciliation,
DOM-owned text, large-document activation, or render subscriptions must rerun at
least one performance/locality guardrail.

Fast guardrails:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Do not let correctness work silently undo the huge-doc runtime posture.

### Native `beforeinput`

Rows:

- `insertText`
- `insertReplacementText`
- `insertFromComposition`
- `insertCompositionText`
- `deleteCompositionText`
- `insertFromPaste`
- `insertFromDrop`
- `insertFromYank`
- `insertLineBreak`
- `insertParagraph`
- `deleteContentBackward`
- `deleteContentForward`
- `deleteWordBackward`
- `deleteWordForward`
- `deleteSoftLineBackward`
- `deleteSoftLineForward`
- `deleteHardLineBackward`
- `deleteHardLineForward`
- `deleteEntireSoftLine`
- `deleteByCut`
- `deleteByDrag`
- `deleteByComposition`
- `historyUndo`
- `historyRedo`

For each supported row:

- prove native event path if browser can generate it honestly
- otherwise prove the strategy owner through a browser-level synthetic event
  and explicitly classify why native transport is not used
- assert model + DOM + selection + follow-up operation

Primary files:

- `richtext.test.ts`
- `highlighted-text.test.ts`
- `large-document-runtime.test.ts`
- `shadow-dom.test.ts`

Primary owners:

- `model-input-strategy.ts`
- `native-input-strategy.ts`
- `selection-reconciler.ts`
- `dom-repair-queue.ts`

### React `onInput` / Native `input`

Rows:

- browser insert that mutates DOM before Slate model
- `input` after prevented `beforeinput`
- undo/redo native history event after focus loss
- autocorrect-like replacement
- DOM text repair after native mutation
- Android input manager dispatch

Assertions:

- DOM text and model text converge
- Slate selection is non-null when editing continues
- DOM caret is canonical
- follow-up typing works

Primary owner:

- `model-input-strategy.ts`
- `dom-repair-queue.ts`

### Keyboard

Rows:

- undo
- redo
- select all
- native character key in large-document mode
- move backward/forward
- move word backward/forward
- move line backward/forward
- extend line backward/forward
- delete backward/forward
- delete word backward/forward
- delete line backward/forward
- split block
- soft break
- blocked browser formatting hotkeys when `beforeinput` is unavailable
- composition recovery when keydown says composition ended

Assertions:

- model text/selection
- DOM selection/caret
- follow-up typing
- shell-backed selection state for large-doc select-all

Primary owner:

- `keyboard-input-strategy.ts`

### Clipboard

Rows:

- copy decorated text
- cut decorated text
- paste plain text
- paste rich HTML
- paste Slate fragment
- paste over full-document shell-backed selection
- paste over partial shell-backed selection
- paste with app-owned HTML subset
- paste without formatting fallback
- Safari fragment-missing fallback

Assertions:

- clipboard payload
- model/DOM text
- collapsed selection after mutating operations
- no render-only wrappers in payload
- follow-up typing after cut/paste

Primary owner:

- `clipboard-input-strategy.ts`

### Drag / Drop

Rows:

- drag start on void selects the void for fragment serialization
- drag over void allows drop
- internal drop deletes original dragged range when appropriate
- external drop inserts data
- drop repairs focus if editor was not focused
- Firefox global drag lifecycle cleanup after unmount

Assertions:

- DataTransfer payload
- model text
- DOM text
- selection/focus after drop
- no stale internal drag state

Primary owner:

- `clipboard-input-strategy.ts`
- `input-router.ts`

### Composition / IME

Rows:

- composition start on collapsed selection
- composition start over expanded selection deletes selected content first
- composition update sets composing state
- composition end commits Chrome fallback
- `insertFromComposition` resets composition state
- composition target inside nested input is ignored
- Android manager composition start/end path

Assertions:

- no duplicate insert
- committed text
- selection/caret after commit
- follow-up typing

Primary owner:

- `composition-state.ts`

### Focus / Blur / Click / Selection

Rows:

- focus sets focused state
- blur clears focused state
- Safari blur clears DOM selection
- Firefox nested editable focus redirects to root
- blur to void spacer is ignored
- blur to non-void internal DOM is ignored
- click void selects void
- triple-click selects block
- stale click path after app mutation is ignored
- mouse down resets model-selection preference

Assertions:

- model selection
- DOM selection
- focus state where observable
- follow-up typing after focus/click paths

Primary owner:

- `selection-reconciler.ts`

### Root / Lifecycle

Rows:

- root ref attaches native `beforeinput` and `input`
- unmount detaches native listeners
- weak maps are registered and cleaned
- selectionchange listener attaches and filters input/textarea Chrome noise
- global drag lifecycle detaches on unmount

Assertions:

- input still works after mount
- unmount/remount does not double-dispatch events
- no stale editor root mapping after remount

Primary owner:

- `input-router.ts`
- `selection-reconciler.ts`

### DOM-Owned Text Capability

Rows:

- plain text direct DOM sync path
- custom render fallback
- decorations/projections fallback
- IME fallback
- placeholders/zero-width fallback
- multiple string nodes fallback
- accessibility markup fallback
- app-owned input handlers fallback

Assertions:

- model text
- DOM text
- selection/caret
- render count/locality where relevant

Primary owner:

- `dom-repair-queue.ts`
- DOM sync hook code

## TDD Execution Order

Use vertical slices. Do not write the full matrix first.

### Phase 1: Backspace Tracer Bullet

Add one RED row:

```ts
test('keeps caret editable after browser Backspace at selected text end', ...)
```

Must assert:

- text changed
- Slate selection non-null and collapsed
- DOM selection inside editor
- visual caret at expected point
- follow-up typing lands

Command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace at selected text end"
```

### Phase 1 Result: Browser Backspace Tracer

Status: closed.

Actions:

- added `keeps caret editable after browser Backspace at selected text end` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`
- changed the tracer to reproduce the real user path:
  - select end of first richtext block
  - browser-type `O`
  - native Backspace
  - assert text and selection
  - browser-type `Z`
  - assert model text, visible DOM text, Slate selection, DOM caret, and visual
    caret
- fixed model-owned delete/native follow-up repair:
  - `DOMRepairQueue` now exposes `repairCaretAfterModelOperation(...)`
  - model-owned delete paths schedule caret repair
  - deferred native input flushes set `preferModelSelectionForInputRef`
  - path-indexed DOM repair uses `data-slate-path` when weak-map identity is
    stale

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace at selected text end"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace|inserts text through browser input|visual caret|undo|types at the browser-selected end"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "delete|directly synced|IME|paste"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- Backspace tracer: `1 passed`
- richtext Backspace/input/visual/undo selected cluster: `9 passed`
- large-document delete/direct-sync/IME/paste cluster: `14 passed`
- React contract gates: `1 pass`, `15 pass`, `6 pass`
- lint/build/typecheck: passed
- rerender breadth: locality preserved
- 5000-block huge-doc compare: v2 wins all reported mean lanes vs legacy
  chunking-on/off in the run

Decision:

- Backspace cursor-loss tracer is closed for Chromium.
- The measured owner was model-owned delete/native follow-up DOM caret repair.
- Next owner is native Delete/forward-delete tracer.

### Phase 2: Delete Forward Tracer Bullet

Mirror Phase 1 with native Delete.

Command:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Delete at selected"
```

### Phase 2 Result: Delete Forward Tracer

Status: closed.

Actions:

- added `keeps caret editable after browser Delete before trailing punctuation`
  to `../slate-v2/playwright/integration/examples/richtext.test.ts`
- mirrored the Backspace contract:
  - native Delete removes trailing punctuation
  - Slate selection remains non-null and collapsed
  - DOM selection remains inside the editor
  - follow-up browser typing lands at the same logical caret
  - DOM/visual caret is repaired after follow-up typing

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Delete before trailing punctuation"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace|Delete|inserts text through browser input|visual caret|undo|types at the browser-selected end"
```

Results:

- Delete tracer: `1 passed`
- richtext Backspace/Delete/input/visual/undo selected cluster: `10 passed`

Decision:

- Delete forward tracer is closed for Chromium.
- No product change was needed beyond the Phase 1 DOM repair fix.
- Next owner is native expanded-range delete.

### Phase 3: Range Delete

Native Backspace/Delete over expanded selection.

Must prove collapsed selection at deletion start and follow-up typing.

### Phase 3 Result: Expanded Range Delete

Status: closed.

Actions:

- added `keeps caret editable after browser Backspace deletes selected range`
  to `../slate-v2/playwright/integration/examples/richtext.test.ts`
- added `keeps caret editable after browser Delete deletes selected range` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`
- both rows assert:
  - visible DOM text after deletion
  - model text after deletion
  - Slate selection collapsed at deletion start
  - DOM caret at deletion start
  - follow-up browser typing lands at the same caret

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace deletes selected range"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Delete deletes selected range"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace|Delete|inserts text through browser input|visual caret|undo|types at the browser-selected end"
```

Results:

- range Backspace tracer: `1 passed`
- range Delete tracer: `1 passed`
- richtext Backspace/Delete/input/visual/undo selected cluster: `12 passed`

Decision:

- native expanded-range Backspace/Delete is closed for Chromium richtext.
- Next owner is decorated text delete coverage.

### Phase 4: Decorated Text Delete

Use `highlighted-text.test.ts`.

Rows:

- Backspace at decorated boundary
- Delete at decorated boundary
- range delete across decorated text
- follow-up typing after each

### Phase 4 Result: Decorated Text Delete

Status: closed.

Actions:

- added `keeps caret editable after Backspace inside decorated text` to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- added `keeps caret editable after Delete inside decorated text` to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- added `keeps caret editable after deleting a decorated selected range` to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- rows assert decorated rendering remains, model text, Slate selection, DOM
  selection, and follow-up typing

Changed files:

- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "Backspace inside decorated"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "Delete inside decorated"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "decorated selected range"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- decorated Backspace tracer: `1 passed`
- decorated Delete tracer: `1 passed`
- decorated range delete tracer: `1 passed`
- highlighted-text Chromium file: `7 passed`
- lint/build/typecheck: passed

Decision:

- decorated text Backspace/Delete/range delete is closed for Chromium.
- Next owner is clipboard mutator gaps.

### Phase 5: Clipboard Mutators

Already improved:

- decorated copy
- decorated cut
- paste HTML
- shell-backed paste

Add remaining rows:

- paste without formatting fallback
- cut around inline/void
- follow-up typing after paste over selection

### Phase 5 Partial Result: Plain Text Paste Over Selection

Status: partially closed.

Actions:

- added `keeps caret editable after plain text paste over selected range` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`
- the row uses real clipboard paste transport through `slate-browser`
- asserts:
  - model text after paste
  - Slate selection after paste
  - DOM selection after paste
  - follow-up browser typing
  - model/DOM/selection after follow-up typing
- fixed paste/repair behavior:
  - model-owned DataTransfer input now schedules caret repair
  - React paste fallback now receives `DOMRepairQueue` and schedules caret
    repair after `Editor.replace(...)` / `ReactEditor.insertData(...)`

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "plain text paste over selected range"
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste|Backspace|Delete|visual caret|undo|browser-selected end"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- plain-text paste-over-selection tracer: `1 passed`
- richtext/paste-html/large-document selected cluster: `20 passed`
- React package contract gates: `1 pass`, `15 pass`, `6 pass`
- lint/build/typecheck: passed
- rerender breadth: locality preserved
- 5000-block huge-doc compare: v2 won all reported mean lanes vs legacy
  chunking-on/off in the run

Decision:

- plain-text paste over selection is closed for Chromium.
- Remaining Phase 5 gaps:
  - paste without formatting fallback classification/proof
  - cut around inline/void
  - follow-up typing after rich/fragment paste variants where editing should
    continue

### Phase 5 Partial Result: Rich HTML Paste Follow-Up Typing

Status: partially closed.

Actions:

- added `keeps caret editable after rich HTML paste over selected content` to
  `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- used real clipboard paste through `slate-browser`
- asserted:
  - rich HTML paste preserves formatting
  - Slate selection remains non-null
  - follow-up browser typing lands after pasted content
- classified exact text-leaf selection after app-owned rich HTML paste as not
  guaranteed; the app-owned paste path can produce an element-level Slate
  selection, so the row asserts the user-facing editing contract instead

Changed files:

- `../slate-v2/playwright/integration/examples/paste-html.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "rich HTML paste over selected"
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
```

Results:

- rich HTML paste follow-up row: `1 passed`
- paste-html Chromium file: `3 passed`

Decision:

- rich HTML paste follow-up typing is covered for Chromium.
- Remaining Phase 5 gaps:
  - paste without formatting fallback classification/proof
  - cut around inline/void
  - follow-up typing after shell-backed fragment paste where editing should
    continue

### Phase 5 Partial Result: Inline Cut

Status: partially closed.

Actions:

- added `keeps caret editable after cutting inline link text` to
  `../slate-v2/playwright/integration/examples/inlines.test.ts`
- the row uses real `ControlOrMeta+X`
- asserted clipboard text, removal of the link text, non-null selection, and
  follow-up typing
- fixed inline cut behavior:
  - if cutting selected inline text empties an inline element, remove the empty
    inline
  - restore selection at the preceding text point
  - sync DOM focus/selection so follow-up typing lands at the inline position

Changed files:

- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "cutting inline link"
bunx playwright test ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "cut|copy|paste|Backspace|Delete"
```

Results:

- inline cut tracer: `1 passed`
- inline/highlighted/richtext clipboard/delete selected cluster: `10 passed`

Decision:

- cut around inline link text is closed for Chromium.
- Remaining Phase 5 gaps:
  - paste without formatting fallback classification/proof
  - cut around void/mention, if supported by current final API surface
  - follow-up typing after shell-backed fragment paste where editing should
    continue

### Phase 5 Checkpoint

Verdict: keep course.

Harsh take: clipboard mutators are much healthier now, and they found real
selection bugs. There are still narrower gaps, but the next highest-value
matrix family is composition.

Why:

- plain text paste over selection is covered
- rich HTML paste follow-up typing is covered
- decorated copy/cut is covered
- inline cut is covered
- remaining clipboard gaps are either narrower or may need classification

Risks:

- mention/void cut may still be unsupported or underproved
- paste-without-formatting may be hard to automate honestly
- shell-backed fragment paste follow-up typing remains a future Phase 5 row

Next move:

- move to Phase 6 composition coverage, starting with expanded selection
  composition start and follow-up typing

Do-not-do list:

- do not mark Phase 5 fully complete until remaining clipboard gaps are covered
  or classified
- do not use synthetic clipboard transport when native shortcut transport is
  available
- do not set completion-check to done

## 2026-04-22 Continue Checkpoint 1

Verdict: keep course.

Harsh take: Backspace/Delete coverage is already proving its worth; it found
real DOM caret repair gaps in delete and paste paths. Keep moving through the
matrix vertically.

Why:

- native Backspace/Delete/caret rows are green
- decorated delete rows are green
- plain text and rich HTML paste follow-up rows are green
- repair fixes preserved large-doc and rerender guardrails

Risks:

- remaining Phase 5 cut around inline/void and shell-backed fragment follow-up
  are less covered than plain/rich paste
- native paste-without-formatting may require classification if the browser
  transport is not reliably automatable

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- add a cut-around-void/inline tracer if the current examples expose an honest
  final-API surface; otherwise classify the gap and move to shell-backed
  fragment paste follow-up typing

Do-not-do list:

- do not add synthetic-only clipboard proof when a native shortcut is available
- do not mark Phase 5 complete until remaining gaps are covered or classified
- do not set completion-check to done

### Phase 6: Composition

Add rows for:

- expanded selection composition start
- composition update while not composing
- ignored composition target inside nested input
- follow-up typing after IME commit

### Phase 6 Probe: Expanded Selection IME Selection/Caret

Status: deferred.

Probe:

- attempted a `richtext` row for IME composition replacing an expanded
  selection
- used `editor.ime.compose(...)`
- added a `transport: 'synthetic' | 'native'` option to
  `slate-browser` IME helpers for future targeted proof

Result:

- text committed
- both Chromium CDP IME and synthetic event-helper paths left Slate/browser
  selection unavailable for exact post-composition caret assertions

Classification:

- test-helper/browser-transport-owned for exact selection/caret proof
- product text commit is already covered by existing large-document IME row

Decision:

- do not keep a failing or fake row
- keep the coverage gap explicit
- future proof owner is `slate-browser` IME helper fidelity:
  - it must preserve or reconstruct a real active editable selection after
    composition before exact caret assertions can be required

Changed files:

- `../slate-v2/packages/slate-browser/src/playwright/ime.ts`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`

Rejected tactic:

- asserting exact selection after current Chromium CDP IME transport; it
  returns `null` selection even though text commits

Additional probe:

- attempted to force the `slate-browser` synthetic composition path in
  Chromium with `transport: 'synthetic'`
- focused the editor before composition
- result was still not suitable for exact selection/caret proof; text commits
  but Slate/browser selection is unavailable

Decision:

- Phase 6 exact selection/caret rows remain deferred to
  `slate-browser` IME helper fidelity
- existing text-commit IME row remains the current covered behavior
- next owner moves to Phase 7 keyboard movement coverage

### Phase 7: Keyboard Movement

Add rows for movement/extension hotkeys only after delete rows are stable.

Rows:

- move word backward/forward
- move line backward/forward
- extend line backward/forward

Assert model selection and DOM selection.

### Phase 7 Partial Result: ArrowLeft / ArrowRight Movement

Status: partially closed.

Actions:

- added `keeps selection synchronized after browser ArrowLeft and ArrowRight`
  to `../slate-v2/playwright/integration/examples/richtext.test.ts`
- row asserts Slate selection and DOM caret after ArrowLeft and ArrowRight
- initial attempt used immediate manual DOM selection and failed because Slate
  had not observed selectionchange yet
- corrected the setup to use semantic selection for the keyboard movement
  contract, not a selectionchange timing test

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "ArrowLeft and ArrowRight"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- ArrowLeft/ArrowRight row: `1 passed`
- React contract gates: `1 pass`, `15 pass`, `6 pass`
- lint/build/typecheck for `slate-browser`, `slate-dom`, and `slate-react`:
  passed

Decision:

- basic character movement is covered for Chromium.
- attempted native word movement with `Alt+ArrowLeft` / `Alt+ArrowRight`
- result: browser/test-environment did not fire the expected word movement
  path; row was removed rather than keeping fake coverage
- added a reliable generic word movement row with `Control+ArrowLeft` /
  `Control+ArrowRight`
- added a line extension row using a Mac user-agent context for the Apple-only
  `Alt+Shift+ArrowDown` shortcut
- focused keyboard movement cluster passed:
  - character movement
  - word movement
  - line extension
- Remaining Phase 7 gaps are classified for future matrix work:
  - exact platform matrix for word/line shortcuts
  - selected range collapse semantics

## 2026-04-22 Continue Checkpoint 2

Verdict: keep course.

Harsh take: the high-risk text editing and clipboard rows are paying off. They
found real cursor/selection gaps in delete, paste, and inline cut. Keep moving
through event families, but do not force unautomatable native shortcuts.

Why:

- richtext Backspace/Delete/range delete rows are green
- decorated delete rows are green
- plain/rich paste follow-up rows are green
- inline cut row is green
- basic ArrowLeft/ArrowRight movement is green
- unautomatable exact IME selection proof and native word movement are
  classified instead of faked

Risks:

- remaining keyboard movement rows need better transport choices
- focus/click, lifecycle, read-only, app-owned handlers, marks, operation-class
  ledger, legacy no-regression ledger, and non-Chromium matrix remain open

Recent broad gate:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "Backspace|Delete|paste|cut|copy|ArrowLeft|ArrowRight|visual caret|undo|browser-selected end"
```

Result:

- selected clipboard/delete/movement cluster: `20 passed`

Next move:

- continue Phase 7 only if a reliable keyboard movement transport exists;
  otherwise classify remaining movement shortcuts and move to Phase 8
  focus/click coverage

Do-not-do list:

- do not keep brittle native hotkey rows that do not fire in Playwright
- do not mark coverage complete while focus/click/lifecycle/read-only/app-owned
  handler and legacy ledger remain open

### Phase 8: Focus / Click

Rows:

- triple-click block selection
- click void selection
- nested editable focus redirection
- blur to spacer ignored

### Phase 8 Partial Result: Triple-Click Block Selection

Status: partially closed.

Actions:

- added `selects the current block on browser triple click` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`
- row asserts:
  - Slate selection spans the first block
  - DOM selection is non-collapsed and inside the editor

Changed files:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "triple click"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- triple-click row: `1 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-browser`, `slate-dom`, and `slate-react`:
  passed

Decision:

- triple-click block selection is covered for Chromium.
- Remaining Phase 8 gaps:
  - click void selection
  - nested editable focus redirection
  - blur to spacer/internal target behavior

### Phase 8 Partial Result: Void Click Selection

Status: partially closed.

Actions:

- added `selects void content by browser click without mutating content` to
  `../slate-v2/playwright/integration/examples/large-document-runtime.test.ts`
- row clicks rendered void content in the final large-document runtime
- asserts Slate selection collapses at the void path and content is not mutated

Changed files:

- `../slate-v2/playwright/integration/examples/large-document-runtime.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "selects void"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "void|inline|table"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- void click row: `1 passed`
- large-document inline/void/table focused cluster: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-browser`, `slate-dom`, and `slate-react`:
  passed

Decision:

- click void selection is covered for Chromium on the final large-document
  runtime.
- Remaining Phase 8 gaps:
  - nested editable focus redirection
  - blur to spacer/internal target behavior

### Phase 8 Result: Internal Interactive Targets

Status: closed for the current browser matrix.

Actions:

- added browser-visible focus/input rows for editable void internals:
  - outer editor selection survives editing a text input inside an editable void
  - nested editor inside an editable void accepts focused input without leaking
    into the outer editor
  - checklist checkbox focus/click preserves the Slate selection and follow-up
    editing point
- fixed `slate-react` event ownership for interactive internal controls by
  adding `editable/target-policy.ts`
- made interactive internal controls opt out of Slate-owned keyboard,
  beforeinput, input, input-capture, click/mousedown selection, and layout
  selection-sync paths
- stopped propagation for internal-control keyboard/beforeinput/input paths so
  WebKit does not route subsequent input back into the editor root
- kept mobile follow-up editor insertion on semantic handle transport because
  Pixel hardware-keyboard contenteditable insertion reverses characters and is
  not honest mobile IME proof

Changed files:

- `../slate-v2/packages/slate-react/src/editable/target-policy.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/playwright/integration/examples/editable-voids.test.ts`
- `../slate-v2/playwright/integration/examples/check-lists.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "restores outer"
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=webkit --grep "restores outer"
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/check-lists.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "restores outer|keeps nested editor input|keeps selection"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Results:

- focused interactive-control matrix: `12 passed` across Chromium, Firefox,
  WebKit, and mobile
- React contract tests: `1 + 15 + 6 passed`
- lint/build/typecheck: passed
- rerender breadth: passed; edited branch/locality stayed bounded
- 5000-block huge-doc compare: v2 won all reported mean lanes versus legacy
  chunking-off and chunking-on in this run

Decision:

- Phase 8 nested editable and internal interactive target coverage is closed
  for the current matrix.
- The owner was not generic blur cleanup. The real bug was Slate root event
  ownership leaking into controls that should be native/app-owned.
- Mobile native hardware-keyboard contenteditable insertion remains transport
  debt; this slice uses semantic handle insertion only for mobile follow-up
  editor typing, not for desktop proof.

Next move:

- Phase 9 lifecycle:
  - prove unmount/remount does not double-handle input
  - prove native listeners detach
  - prove selectionchange input/textarea noise is ignored

### Phase 9: Lifecycle

Rows:

- unmount/remount does not double-handle input
- native listeners detach
- selectionchange input/textarea noise is ignored

### Phase 9 Result: Lifecycle Listener Proof

Status: closed for focused lifecycle rows.

Actions:

- added `ignores selectionchange noise from input inside editable void`
  to `../slate-v2/playwright/integration/examples/editable-voids.test.ts`
- added `does not duplicate native input handling after route remount`
  to `../slate-v2/playwright/integration/examples/richtext.test.ts`
- used route navigation through `/examples/plaintext` as the browser-visible
  unmount/remount proof
- kept mobile remount follow-up insertion on semantic handle transport because
  Pixel hardware-keyboard contenteditable insertion is not native mobile IME
  proof

Changed files:

- `../slate-v2/playwright/integration/examples/editable-voids.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "selectionchange noise"
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selectionchange noise"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "route remount"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "route remount"
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- selectionchange noise row: `4 passed` across Chromium, Firefox, WebKit, and
  mobile
- route remount row: `4 passed` across Chromium, Firefox, WebKit, and mobile
- lint/build/typecheck: passed

Decision:

- Phase 9 lifecycle is closed for focused browser proof.
- The row proves stale input/textarea selectionchange events do not overwrite
  Slate selection.
- The route remount row proves unmount/remount does not leave native input
  listeners double-applying subsequent input.

Next move:

- Phase 10 browser matrix and remaining event family gaps:
  - run a wider Chromium cluster around richtext, editable-voids, check-lists,
    highlighted text, paste-html, and large-document runtime
  - classify any remaining project-specific failures instead of adding skips

### Phase 10: Browser Matrix

After Chromium is green:

- Firefox
- WebKit
- mobile

Every failure gets classified:

- product-owned
- browser-owned
- test-owned
- accepted/deferred with exact rationale

No blanket project skips.

### Phase 10 Partial Result: Chromium Cluster

Status: Chromium cluster green.

Actions:

- ran the focused browser-editing cluster after Phase 8/9 target-policy and
  lifecycle additions

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium
```

Results:

- Chromium focused browser-editing cluster: `59 passed`

Decision:

- Chromium is not the closure claim, but it is a clean expansion gate after the
  internal-control and lifecycle fixes.

Next move:

- run the same focused cluster on Firefox, WebKit, and mobile
- classify failures as product-owned, browser-owned, test-owned, or accepted
  transport debt with exact rationale

### Phase 10 Result: Full Integration Matrix

Status: green.

Actions:

- fixed Firefox decorated-cut selection loss by making `applyEditableCut`
  repair the restored model-owned collapsed selection after deleting the
  fragment
- kept real cut payload proof on Chromium through navigator clipboard and on
  Firefox through the actual `cut` event payload
- narrowed WebKit/mobile cut payload assertions where the platform denies
  programmatic clipboard reads or exposes empty event clipboard payload
- narrowed mobile decorated delete/paste follow-up assertions to model/visible
  text and semantic handle insertion where Playwright mobile hardware-keyboard
  or clipboard transport is not authoritative
- kept desktop projects on DOM/selection/caret assertions

Changed files:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=firefox --grep "cuts decorated"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=firefox --project=webkit --project=mobile
bunx playwright test ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/richtext.test.ts --project=mobile --grep "paste over selected|rich HTML paste"
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=mobile --grep "cutting inline"
bun test:integration-local
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Results:

- highlighted text Firefox/WebKit/mobile rerun: `21 passed`
- mobile paste reruns: richtext plain paste and paste-html rich insertion passed
- mobile inline cut rerun: passed after narrowing mobile to deletion proof
- full integration: `356 passed`
- final lint/build/typecheck: passed

Accepted transport classifications:

- mobile hardware-keyboard contenteditable insertion is not treated as mobile
  IME proof; mobile rows use semantic handles where the native transport is not
  authoritative
- mobile clipboard read/write through `navigator.clipboard` is denied by the
  Playwright mobile project; mobile clipboard rows prove model/visible behavior
  through semantic insertion or deletion instead of forbidden clipboard APIs
- WebKit clipboard payload reads are denied or empty for some shortcut rows;
  WebKit still proves deletion/selection behavior while Chromium/Firefox own
  payload assertions

Decision:

- Browser matrix is green for the current integration suite.
- The active plan is not complete until skip debt and legacy no-regression
  classifications are written down.

Next move:

- inventory skipped rows and legacy no-regression ledger gaps
- classify each remaining skip/legacy behavior as recovered, replaced,
  hard-cut, compat-only, or deferred

## Required Gates Per Slice

For `packages/slate-react/**` product changes:

```sh
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

For browser rows:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "Backspace|Delete|visual caret|undo"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "delete|directly synced|IME|paste"
```

Final browser cluster:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium
```

Release-quality gate:

```sh
bun test:integration-local
```

`bun test:integration-local` can close browser editing only if every remaining
skip/failure is explicitly classified.

## Architecture Answer

Do we have the absolute best Slate/`slate-react` architecture?

No, not yet.

We have the right direction and a much cleaner runtime shape. But an editor is
not "best" until event/operation coverage proves the weird browser paths:
delete, composition, selection drift, clipboard transport, focus traps, shadow
DOM, mobile, and platform differences.

Would I do it differently from scratch?

Yes:

- define the event/operation matrix before the refactor
- create `slate-browser` model+DOM+caret assertions first
- build the runtime around explicit input strategies from day one
- keep `EditableDOMRoot` as a coordinator only
- make native-vs-model operation decisions explicit and typed
- require follow-up typing assertions after every mutating edit

Do we have the absolute best core for React-perfect perf?

No.

Core is good enough for the current huge-doc React lane, but not theoretical
perfection. Remaining core work:

- commit allocation
- dirty-region bookkeeping
- runtime-id index cost
- mutable mirror overhead
- incremental snapshot/index maintenance
- richer operation metadata for renderers

Would I hard-cut more legacy features?

Yes.

Hard cuts to keep:

- no child-count chunking
- no primary `decorate`
- no legacy `Editable` path as public runtime
- no mutable editor fields as primary API
- no instance `editor.apply` / `onChange` as taught extension model
- no examples that preserve old behavior without final-API value

Hard cuts still worth doing:

- move any `decorate` bridge to explicit compat, not primary exports
- demote mutable fields to dev/compat mirrors only
- remove dead renderer compatibility from docs/tests as it surfaces
- keep `createSlateDecorationSource` adapter-only
- require projection stores in docs/examples

## Stop Rule

This coverage lane is done only when:

- every event/operation family above has at least one browser-visible row
- native Backspace/Delete cannot lose cursor/focus/selection
- every mutating event row proves follow-up typing
- marks, formatting, read-only, app-owned handler, nested target, focus,
  accessibility, history, clipboard, drag/drop, composition, lifecycle, and
  DOM-owned text rows are covered or explicitly classified
- every reachable `Editable` operation class is covered or explicitly
  classified
- legacy no-regression ledger is complete
- Chromium rows are green
- Firefox/WebKit/mobile rows are green or classified
- perf guardrails pass when runtime-sensitive code changed
- package gates pass
- `bun test:integration-local` is green or every remaining row is explicitly
  accepted/deferred with rationale

Do not stop at one Backspace fix.

Do not stop at model-only proof.

Do not stop at Chromium-only if the claim is framework-grade browser editing.

## Completion Target

The final deliverable is not "more tests".

The final deliverable is a browser-editing contract for v2 `Editable`:

- full event family matrix exists
- full operation class matrix exists
- each row has model + DOM + selection proof or explicit classification
- every mutating row proves follow-up typing where editing should continue
- every legacy row is recovered, replaced, hard-cut, compat-only, or deferred
- `EditableDOMRoot` remains a coordinator, not a policy dump
- strategy modules own their behavior
- Chromium cluster is green
- non-Chromium/mobile status is known and documented
- final package gates pass
- completion-check is `done` only after all of the above
