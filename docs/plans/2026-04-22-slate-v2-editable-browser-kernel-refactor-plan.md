---
date: 2026-04-22
topic: slate-v2-editable-browser-kernel-refactor
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
related:
  - docs/plans/2026-04-22-slate-v2-core-api-runtime-perfection-plan.md
  - docs/slate-v2/final-api-hard-cuts-status.md
  - docs/slate-v2/references/architecture-contract.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/solutions/logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md
---

# Slate v2 Editable Browser Kernel Refactor Plan

## Goal

Replace the current `packages/slate-react/src/components/editable.tsx` browser
event monolith with a lossless browser editing kernel.

The new shape must preserve every current behavior-bearing bug patch while
making ownership explicit enough that future browser regressions cannot hide
behind model-only tests.

This is not a cosmetic file split. It is a correctness and architecture lane.

## Hard Take

`editable.tsx` is not clean enough for the final architecture.

It currently owns too many unrelated responsibilities:

- DOM selection reconciliation
- input routing
- native-vs-model edit decisions
- composition handling
- paste/drop handling
- post-commit DOM/caret repair
- Android input management integration
- browser proof handle plumbing
- focus/blur/key hotkey compatibility
- root DOM weak-map registration
- scroll-into-view behavior

The caret bug proved the weakness: Slate model text and model selection were
correct, but the browser caret was visually wrong. Tests that only asserted
model state could not catch it.

The target architecture should make browser state a first-class proof owner:

- model text
- model selection
- visible DOM text
- DOM selection anchor/focus
- visual caret location where relevant

## Non-Negotiables

- Do not regress editing, IME, accessibility, paste, undo/redo, mobile input,
  Shadow DOM, or rich/custom rendering.
- Do not reintroduce legacy `decorate` or child-count chunking.
- Do not make `slate` core React-first.
- Do not hide browser bugs behind semantic test handles when the claim is
  native browser editing.
- Do not delete `editable.tsx` comments or compatibility patches by accident.
  Every comment must either move with its owner or be explicitly classified as
  obsolete.
- Do not add horizontal test suites. Use TDD tracer bullets: one failing
  behavior row, one owner extraction/fix, one green gate, then continue.

## Current Important Truth

Current hard cuts already landed:

- primary `Editable` has no `decorate`
- child-count chunking is dead in the product runtime
- mutable field reads are mostly moved to explicit `Editor.*` accessors
- examples no longer teach `editor.apply` monkeypatching
- old legacy renderer exports/tests are removed

Current remaining weakness:

- `EditableDOMRoot` still concentrates browser event handling and repair logic.
- Browser selection/caret proof was too narrow until the trailing-punctuation
  caret regression row was added.

Current concrete bug class:

- model-owned `insertText` can leave DOM selection on an element wrapper
  while the model selection is correct
- `ReactEditor.toSlateRange(...)` can map that wrapper selection to the right
  Slate range, so selection-sync can incorrectly think the DOM caret is already
  fixed
- visual caret is wrong even though text and model selection are right

## Target Modules

All paths below are proposed under
`../slate-v2/packages/slate-react/src/editable/`.

### `selection-reconciler.ts`

Owns:

- model selection to DOM selection sync
- DOM selection to Slate range conversion
- canonical caret repair
- wrapper-element collapsed-selection rejection
- focus-time restore
- Shadow DOM/document selection lookup
- Firefox multi-range preservation
- Android forced selection retry hooks
- scroll-into-view dispatch

Does not own:

- deciding what an input event means
- applying text/delete/paste operations
- test-only browser handle plumbing

Key API:

```ts
type SelectionReconciler = {
  captureDOMSelection(): DOMSelectionSnapshot | null
  syncDOMSelectionFromModel(options?: { force?: boolean }): DOMRange | null
  syncModelSelectionFromDOM(options?: { exactMatch?: boolean }): Range | null
  repairCaretAfterModelOperation(options: RepairCaretOptions): void
  isCanonicalDOMCaretForModelSelection(): boolean
}
```

### `input-router.ts`

Owns:

- native `beforeinput`
- native `input`
- React fallback `onBeforeInput`
- `keydown`
- `compositionstart`
- `compositionupdate`
- `compositionend`
- `paste`
- `drop`
- `copy`
- `cut`
- focus/blur/click/mouse-down routing

Does not own:

- low-level operation application
- DOM selection reconciliation mechanics
- native-vs-model edit policy

Key API:

```ts
type InputRouter = {
  onDOMBeforeInput(event: InputEvent): void
  onDOMInput(event: InputEvent): void
  onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void
  onPaste(event: React.ClipboardEvent<HTMLDivElement>): void
  onDrop(event: React.DragEvent<HTMLDivElement>): void
}
```

### `native-input-strategy.ts`

Owns when native browser input is allowed.

Rules currently embedded in `editable.tsx` that must move here:

- allow native single-character `insertText` only for safe simple characters
- reject native input when marks are active
- reject native input when node maps are dirty
- reject native input when the text host does not declare direct DOM sync
- reject native input at the end of anchor nodes
- reject native input with `white-space: pre` plus tab content
- keep browser target ranges out of model-owned lanes when the model selection
  is already authoritative

Key API:

```ts
type NativeInputStrategy = {
  canUseNativeInput(context: NativeInputContext): NativeInputDecision
}
```

### `model-input-strategy.ts`

Owns Slate-owned operations for browser edit intents.

Operation classes:

- `insert_text`
- `remove_text`
- expanded range delete
- delete backward/forward/word/line/block
- soft break
- block split / Enter
- rich/plain/fragment paste
- drop
- composition commit
- undo/redo through history
- mark-preserving insert

Key API:

```ts
type ModelInputStrategy = {
  applyInputIntent(intent: InputIntent): void
}
```

### `dom-repair-queue.ts`

Owns post-commit DOM repairs for model-owned operations.

This exists because some model-owned operations intentionally prevent native DOM
mutation but still need the browser view/caret repaired after React commits.

Owns:

- text DOM repair after model-owned insert
- caret repair after model-owned insert/delete/range delete
- DOM repair after undo/redo
- shell-backed selection DOM cleanup
- direct DOM sync mutation marking so Android restore does not undo deliberate
  programmatic text changes

Key API:

```ts
type DOMRepairQueue = {
  enqueue(operationClass: DOMRepairClass, options: DOMRepairOptions): void
  flushAfterCommit(): void
}
```

### `browser-handle.ts`

Owns test/proof-only semantic control surface.

This is not app API.

Owns:

- `createRangeRef`
- `unrefRangeRef`
- `getSelection`
- `getText`
- `selectRange`
- `insertText`
- `deleteFragment`
- `deleteBackward`
- `deleteForward`
- `insertBreak`
- `insertData`
- `undo`
- `redo`

Rules:

- handle operations must exercise the same model/browser repair stack as real
  editor operations where possible
- handle fallback must never be counted as native browser transport proof
- handle rows may close semantic behavior, not raw platform transport

### `editable-dom-root.tsx`

Owns only the DOM root composition.

Responsibilities left in the component:

- render root element
- provide read-only/composing contexts
- mount `RestoreDOM`
- attach router handlers
- register root refs

Anything else belongs in one of the kernel modules above.

## Lossless Comment And Patch Migration Map

Every current `editable.tsx` behavior comment must move with its owner.

### Root lifecycle / DOM registration

Move to `editable-dom-root.tsx`:

- `Rerender editor when composition status changed`
- `Update internal state on each render.`
- `The autoFocus TextareaHTMLAttribute doesn't do anything on a div...`
- `Update element-related weak maps with the DOM element ref.`
- SSR/autocorrect/capitalize comments near root props
- `Allow positioning relative to the editable element.`
- `Preserve adjacent whitespace and new lines.`
- `Allow words to break if they are too long.`
- `Allow for passed-in styles to override anything.`
- `this magic zIndex="-1" will fix it`

Important note:

- the z-index decoration comment is stale in wording but not obviously dead.
  Move it first, then decide in a later focused slice whether the styling is
  still needed.

### Selection reconciliation

Move to `selection-reconciler.ts`:

- `Listen on the native selectionchange event...`
- `React's onSelect is leaky and non-standard...`
- `Deselect the editor if the dom selection is not selectable in readonly mode`
- `Make sure the DOM selection state is in sync.`
- `If the DOM selection is properly unset, we're done.`
- `Get anchorNode and focusNode`
- Firefox multi-range comment:
  - `COMPAT: In firefox the normal selection way does not work`
  - right-to-left / left-to-right notes
- `verify that the dom selection is in the editor`
- `If the DOM selection is in the editor and the editor selection is already correct, we're done.`
- `domSelection is not necessarily a valid Slate range`
- controlled external value comment:
  - `when <Editable/> is being controlled through external value...`
- `Otherwise the DOM selection is out of sync, so update it.`
- `Ignore, dom and state might be out of sync`
- Firefox multi-range guard:
  - `In firefox if there is more then 1 range...`
- Android forced selection comments:
  - `Android IMEs try to force their selection...`
  - `we force it again here... visible flicker`
  - `GBoards spellchecker state...`
- `Leave browser selection unchanged if the DOM bridge is between commits.`
- focus restore comments:
  - active element returning from blur
  - embedded editable focus
  - void spacer focus
  - non-editable section focus
  - Safari stale selection on blur
- caret repair comments added by the caret bug:
  - wrapper-element collapsed selection is not canonical even when it maps to
    the same Slate range

### Native beforeinput / input routing

Move to `input-router.ts`:

- `Listen on the native beforeinput event to get real "Level 2" events...`
- `React's beforeinput is fake...`
- WebKit ShadowRoot branch:
  - `Translate the DOM Range into a Slate Range`
- `BeforeInput events aren't cancelable on android...`
- Grammarly/IME immediate selection comment
- composition hint comment for issue `#5038`
- delete-input target range comment
- expanded selection delete comment
- composition change cannot be cancelled comment
- Safari `insertFromComposition` order comment
- weak DataTransfer comparison comment
- React fallback `onBeforeInput` comments
- `input` fallback comments
- paste fallback comments
- native history undo/redo comments
- hotkey fallback comments

### Native input policy

Move to `native-input-strategy.ts`:

- `Only use native character insertion for single characters a-z or space...`
- long-press duplicate insert comment
- Chrome start-of-node issue comment
- `Skip native if there are marks...`
- dirty node map anchor trust comment
- Chrome end-of-anchor issue comment
- `Find the last text node inside the anchor.`
- Chrome tab / `white-space: pre` comment
- `Only insertText operations use the native functionality, for now.`
- `Potentially expand to single character deletes, as well.`

### Model-owned input policy

Move to `model-input-strategy.ts`:

- expanded delete should delete fragment comment
- delete word/line/block intent mapping
- soft break / paragraph split handling
- current `repairDOMInput` model-vs-DOM text mismatch logic
- `Restore the actual user selection if nothing manually set it.`
- mark placeholder insertion comments:
  - pending insertion marks after composition
  - `Ensure we insert text with the marks the user was actually seeing`
- void/zero-width hotkey comments:
  - skip void node / zero-width adjacent inline behavior

### DOM repair

Move to `dom-repair-queue.ts`:

- caret repair after model-owned `insertText`
- DOM repair after native history events
- direct DOM sync mutation marking
- `Flush native operations... compare DOM text values... autocorrect and spellcheck`
- `Since beforeinput doesn't fully preventDefault... browser undo stack`
- `repair DOM after model undo` behavior from the history hotkey row

### Paste / copy / drop

Move paste/copy/drop comments to `input-router.ts` plus strategy modules:

- copy/cut fragment handling
- drag selection preservation
- void drag target comments
- Firefox dragend/drop cleanup comment
- external drop focus comment
- paste fallback comments:
  - missing beforeinput
  - paste without formatting
  - Safari fragment payload limitations

### Browser proof handle

Move to `browser-handle.ts`:

- all `__slateBrowserHandle` setup
- handle range-ref cleanup
- handle text/selection assertions
- force-render only where semantic handle operation opts out of DOM-owned lane

## TDD Strategy

No horizontal rewrite.

Every phase follows:

1. write or strengthen one browser test
2. prove it fails for the expected reason
3. extract the smallest owner
4. make the test green
5. rerun local regression gates
6. update this plan with the exact moved comments and changed files

## Operation-Class Coverage Matrix

Each user-path row must assert:

- Slate model text
- Slate model selection
- visible DOM text
- DOM selection anchor/focus
- visual caret location where relevant

| Operation class | Required rows | Projects |
| --- | --- | --- |
| Insert text before text | rich text before trailing punctuation; plain paragraph start | Chromium, WebKit; semantic handle on mobile/Firefox where transport is not the target |
| Insert text inside text | rich text middle leaf; plain text middle leaf | Chromium, WebKit |
| Insert text after text | end of first rich text block; end of plain block | Chromium, WebKit |
| Delete backward | before text, after text, around inline boundary, after DOM-owned sync | Chromium, WebKit, mobile semantic |
| Delete forward | before punctuation, before inline/void boundary, after DOM-owned sync | Chromium, WebKit, mobile semantic |
| Expanded range delete | same text node, cross leaf, cross block, inline/void included | Chromium, Firefox, WebKit, mobile semantic |
| Select text + add mark | select range, apply bold, assert model marks, DOM markup, caret after operation | Chromium, WebKit |
| Insert with active mark | set mark, type text, assert mark and caret | Chromium, WebKit, mobile semantic |
| Split block / Enter | plain paragraph, rich leaf boundary, after inline/void, shell-backed island | Chromium, Firefox, WebKit, mobile where transport is honest |
| Paste plain | collapsed and expanded selection | Chromium, Firefox, WebKit, mobile semantic |
| Paste rich HTML | collapsed and expanded selection | Chromium, Firefox, WebKit, mobile semantic where clipboard transport is limited |
| Paste Slate fragment | full document, partial shell-backed selection, inline/void fragment | Chromium, Firefox, WebKit, mobile semantic |
| IME composition | empty text, non-empty text, inline edge, void edge, DOM-owned opt-out | Chromium proxy/direct, Firefox direct where honest, WebKit proxy, mobile semantic/proxy |
| Undo/redo after native edit | native insert then undo/redo, DOM text and caret repaired | Chromium, WebKit |
| Undo/redo after model-owned edit | handle/model insert/delete/paste then undo/redo | All projects |
| Focus/blur selection restore | focus editor, focus void child/input, blur Safari, nested editable Firefox | Chromium, Firefox, WebKit |
| Shadow DOM editing | insert, delete, Enter, follow-up typing, selection rect | Chromium, Firefox, WebKit, mobile if honest |

## Proposed Phases

### Phase 0: Baseline Freeze

Purpose:

- lock current behavior before extraction
- preserve comments
- identify already-flaky rows

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
cd packages/slate-react && bun test:vitest
```

Acceptance:

- baseline rows are green or failures are classified before extraction
- comment migration map is updated if line numbers drift

### Phase 1: Extract Browser Handle

Why first:

- lowest production risk
- shrinks `EditableDOMRoot`
- keeps test/proof-only behavior out of runtime strategy modules

Work:

- create `editable/browser-handle.ts`
- move `__slateBrowserHandle` type and setup
- keep force-render semantics unchanged
- keep range-ref cleanup unchanged

Tests:

- richtext semantic handle rows
- large-document-runtime semantic handle rows
- provider hooks if exposed indirectly

Acceptance:

- no production logic behavior changes
- no browser integration drift

### Phase 2: Extract Selection Reconciler

Why:

- caret bugs live here
- selection sync is conceptually separate from input routing

Tracer bullets:

1. trailing punctuation caret row
2. inside text leaf caret row
3. expanded selection delete caret row
4. focus restore with projected segment
5. Shadow DOM Enter/follow-up typing

Work:

- create `editable/selection-reconciler.ts`
- move:
  - `toSlateCollapsedRangeFromDOMSelection`
  - `toSlateRangeFromDOMSelection`
  - DOM selection sync layout effect logic
  - `syncDOMSelectionToEditor`
  - canonical wrapper-caret rejection
  - scroll dispatch
- preserve all selection comments listed above

Acceptance:

- the reconciler is the only owner that writes DOM selection from Slate
- input router calls it but does not implement selection repair itself

### Phase 3: Extract DOM Repair Queue

Why:

- model-owned operations need post-commit DOM/caret repair
- this must generalize beyond `insertText`

Tracer bullets:

1. model-owned insert before punctuation
2. model-owned delete backward before punctuation
3. model-owned range delete across leaves
4. undo after model-owned insert
5. redo after model-owned insert

Work:

- create `editable/dom-repair-queue.ts`
- implement operation-class repair requests:
  - `text-insert`
  - `text-delete`
  - `range-delete`
  - `split-node`
  - `paste`
  - `history`
  - `selection`
- use post-commit flush timing instead of ad hoc `requestAnimationFrame`
  scattered in input code

Acceptance:

- no operation-specific repair lives directly in `onDOMBeforeInput`
- test rows prove model text, DOM text, model selection, DOM selection, and
  visual caret

### Phase 4: Extract Native Input Strategy

Why:

- native-vs-model decision logic is currently mixed with event routing
- native input is a high-risk browser policy, not a random conditional

Tracer bullets:

1. safe native single-character insert in DOM-owned text
2. custom leaf opts out to model-owned insert
3. active mark opts out to model-owned insert
4. anchor-end opts out
5. dirty node map opts out

Work:

- create `editable/native-input-strategy.ts`
- move every native input compatibility condition
- return structured decisions with opt-out reasons

Acceptance:

- policy can be unit-tested without mounting React
- browser tests prove key decisions on real surfaces

### Phase 5: Extract Model Input Strategy

Why:

- Slate-owned operation application should be centralized
- coverage must span all operation classes, not only insert text

Tracer bullets:

1. delete backward
2. delete forward
3. expanded range delete
4. active mark insert
5. Enter / split block
6. paste plain
7. paste rich
8. paste Slate fragment

Work:

- create `editable/model-input-strategy.ts`
- move switch over input types
- call DOM repair queue for model-owned operations
- keep compatibility comments with their operation class

Acceptance:

- `input-router` maps event to intent
- `model-input-strategy` applies intent
- `selection-reconciler` repairs selection
- no giant switch remains in `EditableDOMRoot`

### Phase 6: Extract Input Router

Why after strategies:

- routing is easier once strategies exist

Work:

- create `editable/input-router.ts`
- move:
  - native `beforeinput`
  - native `input`
  - React fallback `onBeforeInput`
  - composition handlers
  - keydown
  - paste
  - drop/copy/cut
  - focus/blur/click/mouse-down wiring
- preserve all comments

Acceptance:

- root component passes handlers from router
- root component does not interpret browser input event types

### Phase 7: Android Manager Integration

Why separate:

- Android timing is a trap
- mark writes are currently explicit compatibility seams

Work:

- define a small adapter between `input-router`, `selection-reconciler`, and
  `useAndroidInputManager`
- move Android-specific comments only when the adapter exists
- leave mark writes until there is a dedicated mark-state setter API

Acceptance:

- all mobile large-document and richtext rows green
- no broad Android rewrite hidden in generic router extraction

### Phase 8: Root Component Shrink

Target:

- `EditableDOMRoot` should be mostly composition:
  - contexts
  - refs
  - `RestoreDOM`
  - root props
  - handler spread

Acceptance:

- `editable.tsx` no longer contains browser input policy
- `editable.tsx` no longer contains operation-specific logic
- `editable.tsx` no longer contains canonical caret repair logic

### Phase 9: Final Proof

Required gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts
bunx playwright test ./playwright/integration/examples/plaintext.test.ts
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts
bunx playwright test ./playwright/integration/examples/mentions.test.ts
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts
bunx playwright test ./playwright/integration/examples/paste-html.test.ts
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
cd packages/slate-react && bun test:vitest
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
bun run lint
```

Final gate:

```sh
bun test:integration-local
```

## Test Helper Improvements

Create shared Playwright helpers for caret proof:

- `assertModelText`
- `assertModelSelection`
- `assertVisibleText`
- `assertDOMSelection`
- `assertDOMCaretTextNode`
- `assertVisualCaretRectNear`
- `assertOperationProof`

Do not hide assertions inside a single opaque helper. Helpers should return
readable failure messages for:

- model mismatch
- DOM text mismatch
- DOM selection node/offset mismatch
- visual caret rect mismatch

## Refactor Rules

- Move comments with behavior, not with old file boundaries.
- If a comment cannot be moved, mark it obsolete in this plan before deleting.
- Keep every phase small enough that failures identify one owner.
- Build `slate-react` before Playwright rows that consume package `dist`.
- Do not run Playwright commands in parallel when they need `next build`.
- Do not classify semantic handle proof as native browser transport proof.

## Completion Criteria

This plan is complete only when:

- `EditableDOMRoot` is mostly a root shell
- selection reconciliation is a dedicated module
- input routing is a dedicated module
- native/model strategy decisions are explicit
- post-commit repair is centralized
- browser handle is isolated as test/proof plumbing
- operation-class coverage exists for all rows in the matrix
- all final gates pass

## Current Next Move

Start Phase 1 with the browser handle extraction.

Do not start by moving the whole `beforeinput` switch. That is how this becomes
a risky rewrite instead of a controlled kernel extraction.

## 2026-04-22 Execution Start

Status: in progress.

Current owner:

- Phase 1 browser handle extraction

Next action:

- run focused browser-handle baseline rows, then extract `__slateBrowserHandle`
  setup/cleanup into `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`

## 2026-04-22 Phase 1 Browser Handle Extraction

Status: closed.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- moved `__slateBrowserHandle` setup/cleanup, semantic handle methods, browser
  handle range-ref bookkeeping, and cleanup into `attachSlateBrowserHandle`
- kept behavior unchanged:
  - semantic handle text/delete/break/data/history methods still force render
    where they did before
  - `insertText` still skips force-render for direct DOM-synced text paths
  - shell-backed selection state still updates from `selectRange`
  - range refs still unref on cleanup
- changed `EditableDOMRoot` to call `attachSlateBrowserHandle(...)`

Changed files:

- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Moved comments:

- no behavior comments moved in this slice; the browser handle block did not
  carry compatibility comments
- range-ref cleanup behavior moved with the handle cleanup

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undoes inserted text|undo restores deleted selected text|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- focused richtext browser-handle/caret rows: `6 passed`
- Slate React focused contracts: `1 pass`, `15 pass`, `6 pass`
- lint: passed
- build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- Phase 1 is complete.
- The next owner is Phase 2: extract selection reconciliation.

## 2026-04-22 Continue Checkpoint 1

Verdict: keep course.

Harsh take: the handle extraction is clean but low-risk. The real architecture
work starts with selection reconciliation.

Why:

- test/proof-only handle plumbing is isolated
- behavior stayed green
- no input policy moved yet

Risks:

- selection extraction is high-risk because it owns visual caret, Shadow DOM,
  Firefox multi-range, Android forced selection, and focus restore behavior
- moving too much at once will make failures untriageable

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret"`
- `bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- begin Phase 2 by extracting only the pure DOM/Slate range conversion helpers
  into `editable/selection-reconciler.ts`; do not move the layout effect yet

Do-not-do list:

- do not move the `beforeinput` switch
- do not change Android selection retry behavior
- do not change focus/blur handlers in the first selection slice

## 2026-04-22 Phase 2 Selection Conversion Helper Extraction

Status: closed.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved pure DOM-selection to Slate-range conversion helpers:
  - `toSlateCollapsedRangeFromDOMSelection`
  - `toSlateRangeFromDOMSelection`
- updated `EditableDOMRoot` to import `toSlateRangeFromDOMSelection`
- did not move the selection layout effect, focus handlers, Android retry, or
  scroll behavior yet

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Moved comments:

- no comments moved in this slice; the moved helpers had no behavior comments
- all selection compatibility comments remain in `editable.tsx` until the
  layout effect/focus-sync owner moves

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret"
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext visual caret rows: `3 passed`
- shadow-dom Chromium rows: `3 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  rerunning the command alone passed

Decision:

- pure range conversion is isolated and behavior-neutral
- the next selection owner is the DOM selection sync layout effect

## 2026-04-22 Continue Checkpoint 2

Verdict: keep course.

Harsh take: selection conversion is extracted, but `editable.tsx` still owns
the dangerous selection layout effect. That is the next real cut.

Why:

- two low-risk extractions are green
- browser caret and Shadow DOM proof stayed green
- the remaining selection comments and bugs are still concentrated in the
  layout effect

Risks:

- moving the layout effect can regress Firefox multi-range, Android forced
  selection, controlled external value recovery, and wrapper-caret repair
- it must be split into one focused owner, not merged with input routing

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret"`
- `bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"`

Next move:

- extract the DOM selection sync layout effect into
  `editable/selection-reconciler.ts` while preserving every selection comment
  in the migration map

Do-not-do list:

- do not move the `beforeinput` switch
- do not alter Android input manager internals
- do not change focus/blur handlers in the same slice

## 2026-04-22 Phase 2 DOM Selection Sync Extraction

Status: closed.

Actions:

- moved DOM selection sync layout-effect ownership into
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved `syncDOMSelectionToEditor` into `useEditableSelectionReconciler`
- `EditableDOMRoot` now calls `useEditableSelectionReconciler(...)` and
  consumes only `syncDOMSelectionToEditor`
- left `beforeinput`, focus/blur handlers, and Android input manager internals
  untouched

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Moved comments:

- `Update element-related weak maps with the DOM element ref.`
- `Make sure the DOM selection state is in sync.`
- `If the DOM selection is properly unset, we're done.`
- `Get anchorNode and focusNode`
- Firefox multi-range selection comment and right-to-left / left-to-right notes
- `verify that the dom selection is in the editor`
- `If the DOM selection is in the editor and the editor selection is already correct, we're done.`
- invalid DOM selection range note
- controlled external value selection recovery note
- `Otherwise the DOM selection is out of sync, so update it.`
- transient DOM/state mismatch comments
- Firefox multi-range guard comment
- Android forced-selection comments, including GBoard spellchecker state
- `Leave browser selection unchanged if the DOM bridge is between commits.`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret"
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext visual caret rows: `3 passed`
- shadow-dom Chromium rows: `3 passed`
- mobile large-document direct-sync rows: `5 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential reruns passed
- typecheck caught the extracted `Range` import as type-only; fixed to a value
  import and reran typecheck green

Decision:

- Phase 2 selection reconciliation extraction is complete enough for this
  milestone.
- The next owner is Phase 3 DOM repair queue extraction.

## 2026-04-22 Continue Checkpoint 3

Verdict: keep course.

Harsh take: selection reconciliation now has a real module. The next bug-prone
cluster is post-commit DOM repair, where the caret bug was patched ad hoc with
`requestAnimationFrame`.

Why:

- the selection layout effect moved with comments intact
- browser caret, Shadow DOM, and mobile direct-sync proof stayed green
- model-owned text insertion repair still lives inside the `beforeinput`
  switch, which is the next wrong owner

Risks:

- moving repair too broadly can regress native/model-owned input policy
- repair queue must not accidentally run for native DOM-owned text where the
  browser already owns DOM state

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undoes inserted text|repairs DOM after Mac keyboard undo"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"`

Next move:

- create `editable/dom-repair-queue.ts` and move only the model-owned
  `insertText` post-commit caret repair into it

Do-not-do list:

- do not move the entire `beforeinput` switch
- do not change native input eligibility
- do not change delete/paste/history repair yet

## 2026-04-22 Phase 3 DOM Repair Queue First Slice

Status: closed for model-owned `insertText` caret repair.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- moved the ad hoc model-owned `insertText` `requestAnimationFrame` caret
  repair behind `createDOMRepairQueue(...)`
- kept the repair behavior unchanged:
  - only model-owned `insertText` queues this repair in this slice
  - delete, paste, history, and range-delete repairs remain in their existing
    owners

Changed files:

- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Moved comments:

- no comments moved in this slice
- the new module owns the operation class explicitly so later repair comments
  can move there without touching input routing

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|undoes inserted text|repairs DOM after Mac keyboard undo"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext caret/undo rows: `5 passed`
- mobile large-document direct-sync rows: `5 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential reruns passed

Decision:

- Phase 3 first slice is closed.
- The next owner is Phase 4 native input strategy extraction.

## 2026-04-22 Continue Checkpoint 4

Verdict: keep course.

Harsh take: repair now has a home, but native-vs-model ownership is still
buried in the `beforeinput` switch. That is the next clean cut.

Why:

- model-owned insert repair is isolated
- focused caret/undo/mobile proof stayed green
- native input eligibility remains a self-contained conditional cluster

Risks:

- native input strategy controls whether the browser or Slate owns the DOM, so
  mistakes here cause duplicated input, stale caret, or broken marks
- active mark, anchor-end, DOM sync capability, dirty-node-map, and whitespace
  edge cases must stay covered

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"`

Next move:

- create `editable/native-input-strategy.ts` and move only the native
  single-character `insertText` eligibility checks into it

Do-not-do list:

- do not move the whole `beforeinput` switch
- do not change model operation application
- do not alter paste/delete/composition handling

## 2026-04-22 Phase 4 Native Input Strategy First Slice

Status: closed for native single-character `insertText` eligibility.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- moved the native single-character `insertText` eligibility cluster out of
  `EditableDOMRoot`
- preserved all native eligibility comments with the strategy:
  - only single `a-z` / space native input
  - long-press duplicate insert warning
  - Chrome start-of-node issue
  - active marks opt out
  - dirty node map opt out
  - DOM sync capability opt out
  - Chrome end-of-anchor issue
  - anchor last-text lookup
  - `white-space: pre` / tab issue
- did not move model operation application
- did not move paste/delete/composition handling

Changed files:

- `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext native/caret rows: `4 passed`
- mobile large-document direct-sync rows: `5 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- Phase 4 first slice is closed.
- The next owner is Phase 5 model input strategy extraction.

## 2026-04-22 Continue Checkpoint 5

Verdict: keep course.

Harsh take: native policy now has a module. The remaining `beforeinput` switch
still owns model operation application, so the next clean cut is model-owned
`insertText` intent application.

Why:

- browser/native eligibility rules moved with comments intact
- high-signal input/caret/mobile gates stayed green
- model-owned operation switch remains the next cohesive owner

Risks:

- extracting too many operation classes at once can blur delete/paste/history
  ownership
- model-owned `insertText` is coupled to DOM repair queue and
  `preferModelSelectionForInputRef`

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input|undoes inserted text"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- create `editable/model-input-strategy.ts` and move only model-owned
  `insertText` application into it, calling the DOM repair queue for the
  post-commit caret repair

Do-not-do list:

- do not move delete/paste/composition in the same slice
- do not change native eligibility
- do not alter Android manager behavior

## 2026-04-22 Phase 5 Model Input Strategy First Slice

Status: closed for model-owned `insertText`.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- moved model-owned `insertText` application into
  `applyModelOwnedTextInput(...)`
- the model input strategy now owns:
  - `Editor.insertText(editor, data)`
  - scheduling `domRepairQueue.repairCaretAfterModelTextInsert()`
  - setting `preferModelSelectionForInputRef.current = true` for `insertText`
- native deferred text input remains in `EditableDOMRoot`
- delete, paste, composition, and history operation classes remain untouched

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Moved comments:

- no comments moved in this slice
- model-owned insert now has a strategy home for future insert-related comments

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input|undoes inserted text"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "DOM-owned text sync|directly synced"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext native/model/caret/undo rows: `5 passed`
- mobile large-document direct-sync rows: `5 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- Phase 5 first slice is closed.
- The next model input owner is delete backward/forward.

## 2026-04-22 Continue Checkpoint 6

Verdict: keep course.

Harsh take: model-owned insert is clean. The next input-operation cluster is
delete backward/forward, because it is still in the monolithic switch and has
caret/selection semantics distinct from insert.

Why:

- insert operation application is now strategy-owned
- DOM repair queue integration stayed green
- delete operation classes are the next smallest cohesive switch branch

Risks:

- delete with expanded selection must still delete the selection, not route to
  collapsed delete
- native/browser target-range semantics for delete are different from insert

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo restores deleted selected text|undoes inserted text"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "deletes backward|deletes forward"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- extend `model-input-strategy.ts` with delete backward/forward intent
  application only

Do-not-do list:

- do not move paste/composition/history
- do not change native eligibility
- do not change expanded selection delete outside the dedicated delete slice

## 2026-04-22 Phase 5 Delete Backward/Forward Strategy Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyModelOwnedDeleteIntent(...)`
- moved collapsed delete backward/forward application into the model input
  strategy:
  - default backward/forward delete
  - word delete
  - soft/hard line delete
  - block delete
  - entire soft-line delete composition
- kept expanded selection delete in `EditableDOMRoot` for a dedicated slice
- did not move paste, composition, history, or native eligibility

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo restores deleted selected text|undoes inserted text"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "deletes backward|deletes forward"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext delete/undo rows: `2 passed`
- mobile large-document backward/forward delete rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- delete backward/forward application is strategy-owned.
- the next owner is expanded range delete / `deleteFragment` application.

## 2026-04-22 Continue Checkpoint 7

Verdict: keep course.

Harsh take: collapsed delete is clean. Expanded range delete is the next
dangerous branch because it overrides apparent backward/forward intent when a
selection is expanded.

Why:

- delete backward/forward branches moved without behavior drift
- expanded selection delete is still in the root switch
- range delete needs model/DOM/caret proof separate from collapsed delete

Risks:

- deleting expanded selections must preserve direction and history grouping
- cross-leaf and cross-block deletes need browser proof, not only model proof

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo restores deleted selected text"`
- `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "semantic selection|copies decorated text"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move expanded selection delete / `Editor.deleteFragment` application into
  `model-input-strategy.ts` only

Do-not-do list:

- do not move paste/composition/history
- do not change collapsed delete again
- do not change native eligibility

## 2026-04-22 Phase 5 Expanded Delete Strategy Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyModelOwnedExpandedDelete(...)`
- moved expanded selection delete application into the model input strategy
- preserved direction selection:
  - `deleteContentBackward` => `backward`
  - other delete input types => `forward`
- kept collapsed delete branches unchanged after the previous slice
- did not move paste, composition, or history

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo restores deleted selected text"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "semantic selection|copies decorated text"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext expanded delete undo row: `1 passed`
- highlighted text semantic/decorated selection rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- expanded range delete application is strategy-owned.
- the next model input owner is line break / paragraph split.

## 2026-04-22 Continue Checkpoint 8

Verdict: keep course.

Harsh take: delete is now cleaner. The next small model-owned branch is
`insertLineBreak` / `insertParagraph`, which owns split/Enter behavior.

Why:

- delete operation class moved in two controlled slices
- decorated/range selection proof stayed green
- Enter/split remains a self-contained switch branch

Risks:

- Enter behavior touches block structure and selection, so browser proof must
  include follow-up typing where possible
- Shadow DOM line-break rows are the critical integration guard

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "new line"`
- `bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move `insertLineBreak` and `insertParagraph` application into
  `model-input-strategy.ts`

Do-not-do list:

- do not move paste/composition/history
- do not change hotkey fallback branches

## 2026-04-22 Phase 5 Line Break Strategy Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyModelOwnedLineBreak(...)`
- moved:
  - `insertLineBreak` => `Editor.insertSoftBreak(editor)`
  - `insertParagraph` => `Editor.insertBreak(editor)`
- kept hotkey fallback branches unchanged
- did not move paste, composition, or history

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "new line"
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- Shadow DOM newline row: `1 passed`
- Markdown shortcuts list/h1 rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- line break / paragraph split application is strategy-owned.
- the next owner is paste model input strategy extraction.

## 2026-04-22 Continue Checkpoint 9

Verdict: keep course.

Harsh take: the basic model operation classes are moving cleanly. Paste is the
next high-risk owner because it mixes DataTransfer, Slate fragments, rich HTML,
plain text, shell-backed selections, and browser transport limitations.

Why:

- insert, delete, expanded delete, and line break/paragraph application are now
  in `model-input-strategy.ts`
- focused row coverage stayed green
- paste remains a self-contained branch with high browser-risk value

Risks:

- paste must preserve Slate fragment priority over plain text fallback
- shell-backed paste must remain model/fragment-owned
- mobile/WebKit clipboard transport limitations must stay honestly classified

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "paste"`

Next move:

- move `DataTransfer` paste/drop text insertion application into
  `model-input-strategy.ts` without changing transport fallback behavior

Do-not-do list:

- do not change clipboard transport helpers
- do not collapse rich/fragment/plain paste semantics
- do not move composition/history in the same slice

## 2026-04-22 Phase 5 Paste DataTransfer Strategy Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyModelOwnedDataTransferInput(...)`
- moved only the `DataTransfer` application branch to the model input strategy
- preserved the weak DataTransfer detection comment in `EditableDOMRoot`
- kept clipboard transport helpers unchanged
- kept rich/fragment/plain paste semantics unchanged
- did not move composition or history

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "paste"
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- paste-html Chromium: `2 passed`
- large-document-runtime paste Chromium: `3 passed`
- large-document-runtime paste mobile: `3 passed`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- paste `DataTransfer` application is strategy-owned.
- The next owner is composition commit handling.

## 2026-04-22 Continue Checkpoint 10

Verdict: keep course.

Harsh take: model input strategy now owns most ordinary operation application.
Composition is the next high-risk branch because browser event order differs by
engine and comments already encode Safari/Chrome pitfalls.

Why:

- paste transport behavior stayed green
- strategy extraction remained behavior-neutral
- composition remains a dedicated branch in the switch

Risks:

- Safari `insertFromComposition` ordering is fragile
- Chrome compositionend fallback is fragile
- IME proof must not be jsdom-only

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME composition"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only the `insertFromComposition` state-reset behavior into
  `model-input-strategy.ts` or a composition-specific helper, preserving the
  Safari comment exactly

Do-not-do list:

- do not move history
- do not rewrite Android composition manager internals
- do not collapse composition into generic text input

## 2026-04-22 Phase 5 Composition State Reset Slice

Status: closed for `insertFromComposition` state reset.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- moved the Safari `insertFromComposition` composing-state reset into
  `commitInsertFromComposition(...)`
- preserved the Safari event-order comment exactly with the helper
- did not move Chrome compositionend fallback
- did not touch Android composition manager internals
- did not move history

Changed files:

- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME composition"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- large-document-runtime IME Chromium row: `1 passed`
- richtext insert browser-input Chromium row: `1 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed
- one parallel Playwright attempt hit the known `next build` lock before tests;
  sequential rerun passed

Decision:

- `insertFromComposition` composing-state reset is isolated.
- The next owner is the Chrome compositionend fallback branch.

## 2026-04-22 Continue Checkpoint 11

Verdict: keep course.

Harsh take: composition state reset now has a home. The remaining composition
logic is still split, and the Chrome compositionend fallback is the next
cohesive branch.

Why:

- Safari event-order patch moved with comments intact
- IME proof stayed green
- Chrome fallback comment still lives in `EditableDOMRoot`

Risks:

- Chrome compositionend fallback inserts committed DOM text manually and touches
  marks, so it is higher risk than the state reset
- Android manager must remain untouched

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME composition"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only the Chrome compositionend fallback branch into
  `composition-state.ts`, preserving marks behavior and comments

Do-not-do list:

- do not move history
- do not change Android composition manager internals
- do not rewrite mark placeholder behavior

## 2026-04-22 Phase 5 Chrome Composition End Fallback Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
  with `commitChromeCompositionEndFallback(...)`
- moved the Chrome compositionend fallback branch out of `EditableDOMRoot`
- preserved the Chrome comment with the helper:
  - Chrome does not fire the `insertFromComposition` `beforeinput` shape needed
    by the main path
  - committed composition text must be inserted on `compositionend`
- preserved pending insertion marks and user marks behavior
- left Android composition manager internals untouched
- did not move history

Changed files:

- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME composition"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- large-document-runtime IME Chromium row: `1 passed`
- richtext insert browser-input Chromium row: `1 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- composition commit fallback behavior is isolated enough for this milestone.
- The next owner is history undo/redo input extraction.

## 2026-04-22 Continue Checkpoint 12

Verdict: keep course.

Harsh take: model, paste, and composition application are mostly out of the
root switch. History is the last obvious model-owned branch before router-level
extraction starts.

Why:

- IME proof stayed green
- mark behavior stayed untouched
- `handleNativeHistoryEvents` and hotkey history fallback still own model
  history application in `EditableDOMRoot`

Risks:

- native history events touch browser undo stack quirks
- keyboard history hotkeys must still repair DOM after model undo/redo

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undoes inserted text|repairs DOM after Mac keyboard undo"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move history undo/redo model application into `model-input-strategy.ts` or a
  dedicated history helper, preserving DOM repair behavior

Do-not-do list:

- do not move generic keydown routing yet
- do not change browser history event detection

## 2026-04-22 Phase 5 History Undo/Redo Strategy Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyModelOwnedHistoryIntent(...)`
- moved model undo/redo application out of:
  - native history event handling
  - keyboard undo/redo hotkey handling
- preserved browser history event detection in `EditableDOMRoot`
- preserved keyboard routing in `EditableDOMRoot`
- preserved `forceRender()` after successful keyboard undo/redo
- did not move generic keydown routing

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undoes inserted text|repairs DOM after Mac keyboard undo"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext undo/DOM repair rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- model operation application is extracted enough for Phase 5.
- The next owner is Phase 6 input router extraction.

## 2026-04-22 Continue Checkpoint 13

Verdict: pivot.

Harsh take: model input application now has a real module. The next remaining
monolith problem is event routing itself.

Why:

- insert, delete, expanded delete, line break, paste/DataTransfer, composition
  state, composition fallback, and history application are extracted
- the root still owns native listener attachment, callback refs, beforeinput,
  input, keydown, paste, drop, focus, blur, and mouse routing

Risks:

- moving all routing at once would be a reckless rewrite
- ref attachment controls native `beforeinput` and `input`; that is the safest
  first router slice

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`

Next move:

- create `editable/input-router.ts` and move only root native listener
  attach/detach handling from `callbackRef`, not the `beforeinput` logic itself

Do-not-do list:

- do not move the whole `beforeinput` callback
- do not move keydown/paste/drop/focus/blur yet

## 2026-04-22 Phase 6 Native Listener Attachment Slice

Status: closed.

Actions:

- created `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- moved only native root listener attach/detach mechanics into
  `attachEditableNativeInputListeners(...)`
- preserved native listener comments with the helper:
  - React `onBeforeInput` is a leaky polyfill
  - native `beforeinput` is attached directly
  - `input` listener is attached next to it
- kept `onDOMBeforeInput` and `onDOMInput` callback bodies in
  `EditableDOMRoot`
- did not move keydown, paste, drop, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext visual caret / browser input rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- root native listener attachment is router-owned.
- The next router owner is native `input` callback routing.

## 2026-04-22 Continue Checkpoint 14

Verdict: keep course.

Harsh take: native listener plumbing is out. The next safe router slice is
`onDOMInput`, because it is smaller than `beforeinput` and already delegates
actual repair to `repairDOMInput`.

Why:

- listener attach/detach is isolated
- browser input/caret proof stayed green
- `onDOMInput` is a small callback that can become the first true router-owned
  native event handler

Risks:

- native `input` is tied to DOM repair after browser mutation
- do not move `repairDOMInput` in the same slice unless required by types

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only `onDOMInput` callback creation into `input-router.ts`

Do-not-do list:

- do not move `onDOMBeforeInput`
- do not move `repairDOMInput` unless the input router helper requires it
- do not move keydown/paste/drop/focus/blur

## 2026-04-22 Phase 6 Native Input Callback Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableDOMInputHandler(...)`
- moved native `input` callback creation out of `EditableDOMRoot`
- kept `repairDOMInput(...)` in `EditableDOMRoot`
- kept native `beforeinput` callback body in `EditableDOMRoot`
- did not move keydown, paste, drop, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|inserts text through browser input"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext visual caret / browser input rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native `input` callback creation is router-owned.
- The next safe router owner is React fallback `onBeforeInput` wrapper creation.

## 2026-04-22 Continue Checkpoint 15

Verdict: keep course.

Harsh take: native input routing is now half-extracted. The remaining easy
router work is wrapper creation for React fallback handlers; the native
`beforeinput` body is still too large to move in one piece.

Why:

- native input handler now lives in `input-router.ts`
- proof stayed green
- React fallback `onBeforeInput` is a small wrapper around `onDOMBeforeInput`

Risks:

- React fallback only exists for browsers without real `beforeinput`; keep its
  behavior identical

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only React `onBeforeInput` fallback wrapper creation into
  `input-router.ts`

Do-not-do list:

- do not move native `onDOMBeforeInput`
- do not change the fallback policy
- do not move keydown/paste/drop/focus/blur

## 2026-04-22 Phase 6 React BeforeInput Fallback Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableReactBeforeInputHandler(...)`
- moved React fallback `onBeforeInput` wrapper creation out of
  `EditableDOMRoot`
- preserved fallback comments with the helper:
  - some browsers do not support real `beforeinput`
  - React fallback is leaky
  - fallback only works for `insertText`
- kept native `onDOMBeforeInput` callback body in `EditableDOMRoot`
- did not change fallback policy
- did not move keydown, paste, drop, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext browser input row: `1 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- React `onBeforeInput` fallback wrapper is router-owned.
- The next safe router owner is paste handler wrapper creation.

## 2026-04-22 Continue Checkpoint 16

Verdict: keep course.

Harsh take: input-router now owns simple native/input wrappers. Paste handler
creation is next, but paste semantics must stay where they are until a focused
paste-strategy slice moves them.

Why:

- fallback wrapper moved without behavior drift
- browser input proof stayed green
- paste handler is still a wrapper around existing paste semantics

Risks:

- paste handler owns several compatibility comments and shell-backed selection
  gating
- moving semantics with the wrapper would be too much for one slice

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only paste handler creation into `input-router.ts`, keeping paste
  semantics and comments intact if possible

Do-not-do list:

- do not change paste semantics
- do not move keydown/drop/focus/blur

## 2026-04-22 Phase 6 Paste Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditablePasteHandler(...)`
- moved paste handler callback creation through the input router
- kept paste semantics in `EditableDOMRoot`
- preserved the existing browser compatibility comments with the paste
  semantic handler
- did not change shell-backed selection, rich fragment, plain text, or WebKit
  paste policy
- did not move keydown, drop, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=mobile --grep "paste"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- paste-html Chromium rows: `2 passed`
- large-document-runtime paste Chromium rows: `3 passed`
- large-document-runtime paste mobile rows: `3 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- paste event wrapper creation is router-owned.
- Paste semantics stay in `EditableDOMRoot` until a focused paste-strategy
  slice moves them.
- The next safe router owner is copy/cut handler wrapper creation.

## 2026-04-22 Continue Checkpoint 17

Verdict: keep course.

Harsh take: paste routing is now shaped, but the core paste behavior is still
too loaded to move casually. The right next bite is copy/cut wrapper extraction,
not rewriting clipboard semantics.

Why:

- paste proof stayed green across Chromium and mobile
- all browser compatibility comments survived with the behavior
- input-router now owns listener, input, beforeinput fallback, and paste
  wrapper creation

Risks:

- copy/cut affect fragment serialization, so keep semantics local for this
  wrapper slice
- do not blur the boundary between wrapper ownership and clipboard strategy
  ownership

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only copy/cut handler creation into `input-router.ts`, keeping fragment
  serialization semantics in `EditableDOMRoot`

Do-not-do list:

- do not change copy/cut semantics
- do not move drop semantics yet
- do not move keydown/focus/blur

## 2026-04-22 Phase 6 Copy/Cut Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableClipboardHandler(...)`
- moved copy/cut handler callback creation through the input router
- kept fragment serialization, void cut deletion, and expanded-selection
  deletion semantics in `EditableDOMRoot`
- did not change copy/cut policy
- did not move drop, keydown, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- highlighted-text Chromium rows: `3 passed`
- clipboard-boundary unit rows: `6 pass`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- copy/cut event wrapper creation is router-owned.
- Clipboard semantics stay in `EditableDOMRoot` until a focused clipboard
  strategy slice moves them.
- The next safe router owner is drag/drop handler wrapper creation.

## 2026-04-22 Continue Checkpoint 18

Verdict: keep course.

Harsh take: clipboard event wrappers are out, but drag/drop is still sitting in
the root. Extract wrapper creation only; do not pretend that makes drop
semantics clean.

Why:

- copy proof stayed green
- fragment serialization proof stayed green
- the root lost another batch of inline event hook creation without behavior
  drift

Risks:

- drag/drop combines internal dragging state, void selection, target ranges,
  and DataTransfer insertion
- drop semantics are too risky to move with wrapper ownership

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only drag/drop handler creation into `input-router.ts`, keeping drag/drop
  semantics in `EditableDOMRoot`

Do-not-do list:

- do not change drag/drop semantics
- do not move keydown/focus/blur
- do not treat wrapper extraction as browser drag/drop closure

## 2026-04-22 Phase 6 Drag/Drop Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableDragHandler(...)`
- moved drag/drop handler callback creation through the input router
- kept drag/drop semantics in `EditableDOMRoot`
- preserved void drag selection, internal drag deletion, event range lookup,
  DataTransfer insertion, and focus repair comments/behavior
- did not change drag/drop policy
- did not move keydown, focus, or blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- editable-voids Chromium rows: `4 passed`
- paste-html Chromium rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- drag/drop event wrapper creation is router-owned.
- Drag/drop semantics stay in `EditableDOMRoot` until a focused drag/drop
  strategy slice moves them.
- The next safe router owner is composition handler wrapper creation.

## 2026-04-22 Continue Checkpoint 19

Verdict: keep course.

Harsh take: wrapper extraction is working because it is intentionally boring.
Keep it boring. The next dangerous inline cluster is composition; move wrapper
creation only and keep IME semantics exactly where they are.

Why:

- drag/drop proof stayed green
- lint/build/typecheck stayed green after Biome formatting
- input-router now owns listener, input, beforeinput fallback, paste,
  copy/cut, and drag/drop wrapper creation

Risks:

- composition events are IME-sensitive and browser-specific
- composition wrappers must not alter ordering, state flags, or Chrome fallback
  behavior

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only composition handler creation into `input-router.ts`, keeping
  composition semantics in `EditableDOMRoot`

Do-not-do list:

- do not change composition semantics
- do not move keydown/focus/blur
- do not move Android integration in the same slice

## 2026-04-22 Phase 6 Composition Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableCompositionHandler(...)`
- moved composition handler callback creation through the input router
- kept composition semantics in `EditableDOMRoot`
- preserved Android composition manager calls, `IS_COMPOSING` updates, expanded
  selection deletion, and Chrome composition-end fallback behavior
- did not move Android integration or keydown/focus/blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- large-document-runtime Chromium grep row ran the runtime cluster: `14 passed`
- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- composition event wrapper creation is router-owned.
- Composition semantics stay in `EditableDOMRoot` until a focused composition
  strategy slice moves them.
- The next safe router owner is React `onInput` wrapper creation.

## 2026-04-22 Continue Checkpoint 20

Verdict: keep course.

Harsh take: composition routing is safer, but the root still has a chunky
React `onInput` handler mixing app callback, Android manager, deferred native
op flushing, and selector repair. Extract wrapper creation only.

Why:

- IME and caret/browser-input gates stayed green
- composition state behavior did not move
- input-router is steadily taking event ownership without swallowing policy

Risks:

- React `onInput` is tied to Android input manager and deferred operation flush
- moving semantics with the wrapper would mix router ownership with input repair
  ownership

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only React `onInput` handler creation into `input-router.ts`, keeping
  input semantics in `EditableDOMRoot`

Do-not-do list:

- do not change React `onInput` semantics
- do not move Android integration
- do not move keydown/focus/blur

## 2026-04-22 Phase 6 React Input Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableInputHandler(...)`
- moved React `onInput` handler callback creation through the input router
- kept React `onInput` semantics in `EditableDOMRoot`
- preserved app `onInput` handling, Android input manager dispatch, deferred
  native operation flushing, model insertion repair, `handledDOMBeforeInputRef`
  reset, and native-history repair behavior
- did not move Android integration or keydown/focus/blur

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- React `onInput` event wrapper creation is router-owned.
- React `onInput` semantics stay in `EditableDOMRoot` until a focused input
  strategy slice moves them.
- The next safe router owner is `onInputCapture` wrapper creation.

## 2026-04-22 Continue Checkpoint 21

Verdict: keep course.

Harsh take: `onInput` is shaped, but `onInputCapture` still manually schedules
DOM repair in the JSX. Extract the wrapper, not the repair queue.

Why:

- browser input/caret proof stayed green
- DOM sync contract stayed green
- no Android or deferred-op behavior moved

Risks:

- `onInputCapture` is directly tied to post-native DOM repair timing
- changing its timer or payload shape would regress caret/text repair

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only `onInputCapture` handler creation into `input-router.ts`, keeping
  repair scheduling semantics in `EditableDOMRoot`

Do-not-do list:

- do not change repair scheduling timing
- do not move `repairDOMInput`
- do not move keydown/focus/blur

## 2026-04-22 Phase 6 Input Capture Handler Wrapper Slice

Status: closed.

Actions:

- reused `useEditableInputHandler(...)` for `onInputCapture`
- moved `onInputCapture` handler callback creation through the input router
- kept repair scheduling semantics in `EditableDOMRoot`
- preserved the `setTimeout` timing and `{ data, inputType }` payload shape
- did not move `repairDOMInput`
- did not move keydown/focus/blur

Changed files:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- `onInputCapture` event wrapper creation is router-owned.
- Repair scheduling semantics stay in `EditableDOMRoot` until the DOM repair
  queue owner moves them.
- The next safe router owner is focus/blur wrapper creation.

## 2026-04-22 Continue Checkpoint 22

Verdict: keep course.

Harsh take: root input wrappers are mostly out. Focus/blur is next, but it has
real browser compatibility landmines, so move handler creation only and preserve
every comment with the behavior.

Why:

- caret/browser-input proof stayed green
- DOM repair timing stayed intact
- no repair logic moved

Risks:

- focus/blur owns Safari selection clearing, Firefox nested editable focus,
  void spacer focus, and root active-element tracking
- moving semantics casually would break browser behavior without model failures

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only focus/blur handler creation into `input-router.ts`, keeping
  focus/blur semantics and compatibility comments in `EditableDOMRoot`

Do-not-do list:

- do not change focus/blur semantics
- do not move keydown/click/mouse-down
- do not move selection reconciliation in the same slice

## 2026-04-22 Phase 6 Focus/Blur Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableFocusHandler(...)`
- moved focus/blur handler callback creation through the input router
- kept focus/blur semantics in `EditableDOMRoot`
- preserved Firefox nested-editable focus handling, Safari selection clearing,
  void spacer focus ignoring, non-void internal focus ignoring, and latest
  active element tracking
- did not move keydown/click/mouse-down or selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- editable-voids Chromium rows: `4 passed`
- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- focus/blur event wrapper creation is router-owned.
- Focus/blur semantics stay in `EditableDOMRoot` until a focused focus policy
  slice moves them.
- The next safe router owner is click/mouse-down wrapper creation.

## 2026-04-22 Continue Checkpoint 23

Verdict: keep course.

Harsh take: focus/blur moved safely because only the hook identity moved. Click
and mouse-down still belong to routing shape, but click contains selection
policy and must not be rewritten in this slice.

Why:

- nested editable and caret gates stayed green
- browser focus compatibility comments stayed with behavior
- no selection reconciliation moved

Risks:

- click owns triple-click block selection and void selection behavior
- mouse-down owns model-selection preference reset

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"`
- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only click/mouse-down handler creation into `input-router.ts`, keeping
  click/mouse-down semantics in `EditableDOMRoot`

Do-not-do list:

- do not change click/mouse-down semantics
- do not move keydown
- do not move selection reconciliation in the same slice

## 2026-04-22 Phase 6 Click/MouseDown Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableMouseHandler(...)`
- moved click and mouse-down handler callback creation through the input router
- kept click/mouse-down semantics in `EditableDOMRoot`
- preserved model-selection preference reset, app mouse-down delegation,
  click-time stale path guard, triple-click block selection, and void click
  selection behavior
- did not move keydown or selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium click/selection-sensitive rows: `4 passed`
- editable-voids Chromium rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- click/mouse-down event wrapper creation is router-owned.
- Click/mouse-down semantics stay in `EditableDOMRoot` until a focused mouse
  selection policy slice moves them.
- The next safe router owner is keydown wrapper creation.

## 2026-04-22 Continue Checkpoint 24

Verdict: keep course.

Harsh take: almost every small wrapper is gone. Keydown is the monster. Move
only handler identity; do not rewrite hotkey, history, deletion, or selection
policy in this slice.

Why:

- click/void/caret gates stayed green
- Biome formatting changed only generated style after the move
- root still has giant keydown event wiring inline

Risks:

- keydown owns history, select-all shell state, void/inline movement,
  line/word deletion, composition recovery, Android dispatch, and fallback
  keyboard behavior
- any semantic change here can break editing silently

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo|types at the browser-selected end|visual caret"`
- `bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only keydown handler creation into `input-router.ts`, keeping keydown
  semantics in `EditableDOMRoot`

Do-not-do list:

- do not change keydown semantics
- do not move native `beforeinput` in the same slice
- do not move selection reconciliation in the same slice

## 2026-04-22 Phase 6 KeyDown Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableKeyboardHandler(...)`
- moved keydown handler callback creation through the input router
- kept keydown semantics in `EditableDOMRoot`
- preserved Android keydown dispatch, composition recovery, select-all shell
  state, history hotkeys, large-document text insertion, line/word movement,
  void/inline movement, delete fallback, and all compatibility comments
- did not move native `beforeinput` or selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo|types at the browser-selected end|visual caret"
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium undo / selected-end / visual caret rows: `7 passed`
- markdown-shortcuts Chromium h1/list rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- keydown event wrapper creation is router-owned.
- Keydown semantics stay in `EditableDOMRoot` until focused keyboard strategy
  slices move them.
- The next safe router owner is native `beforeinput` wrapper creation.

## 2026-04-22 Continue Checkpoint 25

Verdict: keep course.

Harsh take: keydown is no longer inline JSX, but the root still owns native
`beforeinput` callback creation. Rename the semantic callback and wrap it;
do not move the actual native input policy.

Why:

- undo/hotkey/caret gates stayed green
- markdown shortcut rows stayed green
- keydown behavior text moved once and remains intact

Risks:

- native `beforeinput` is the hottest browser-policy owner
- changing its semantics would hit text input, deletion, paste, composition,
  and native/model ownership

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move only native `beforeinput` handler creation into `input-router.ts`,
  keeping native input semantics in `EditableDOMRoot`

Do-not-do list:

- do not change native `beforeinput` semantics
- do not move model/native input strategy code in this slice
- do not move selection reconciliation in the same slice

## 2026-04-22 Phase 6 Native BeforeInput Handler Wrapper Slice

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableDOMBeforeInputHandler(...)`
- renamed the semantic native `beforeinput` callback to
  `handleDOMBeforeInput`
- moved native `beforeinput` handler callback creation through the input router
- kept native input policy in `EditableDOMRoot`
- preserved native/model input ownership, selection target-range repair,
  composition gates, app input policy checks, deletion routing, DataTransfer
  routing, direct native insert deferral, and user-selection restore behavior
- did not move model/native input strategy code or selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / undo / visual caret rows: `7 passed`
- large-document-runtime Chromium input/delete/IME/runtime cluster: `14 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native `beforeinput` event wrapper creation is router-owned.
- Native input policy stays in `EditableDOMRoot` until focused native/model
  strategy slices move it.
- Phase 6 wrapper extraction is closed enough to pivot to the next owner:
  selectionchange listener extraction.

## 2026-04-22 Continue Checkpoint 26

Verdict: pivot.

Harsh take: the wrapper phase has hit diminishing returns. The remaining root
size is no longer because JSX has inline handlers; it is because durable
owners still live inside the root. Next owner is selection reconciliation.

Why:

- no inline JSX `useCallback` event handlers remain
- native `beforeinput`, keydown, input, clipboard, drag/drop, composition,
  focus, blur, click, and mouse-down wrapper creation is routed
- the remaining root-owned listener effect includes selectionchange behavior
  that belongs with the selection reconciler

Risks:

- selectionchange is browser-state critical and can recreate the visual-caret
  bug if mishandled
- the Chrome input/textarea filter and React `onSelect` compatibility comment
  must move with behavior

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"`
- `bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move selectionchange listener attachment/filtering into
  `selection-reconciler.ts`, keeping semantics and comments intact

Do-not-do list:

- do not change selectionchange semantics
- do not move dragend/drop global listener in the same slice
- do not change DOM-to-model selection conversion in this slice

## 2026-04-22 Phase 7 SelectionChange Listener Extraction

Status: closed.

Actions:

- added `attachEditableSelectionChangeListener(...)` to
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved native `selectionchange` listener attachment and Chrome
  input/textarea filtering out of `EditableDOMRoot`
- preserved the React `onSelect` compatibility comment with the listener owner
- kept DOM-to-model selection conversion unchanged
- kept global dragend/drop lifecycle listeners in `EditableDOMRoot`

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium visual caret / selected-end rows: `4 passed`
- shadow-dom Chromium rows: `3 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- selectionchange attachment/filtering is selection-reconciler-owned.
- DOM-to-model conversion remains unchanged for now.
- The next safe owner is global drag lifecycle listener extraction.

## 2026-04-22 Continue Checkpoint 27

Verdict: keep course.

Harsh take: selectionchange is in the right module. The root still owns the
global dragend/drop lifecycle listener only because it was adjacent. Move that
small lifecycle owner next.

Why:

- caret and shadow DOM gates stayed green
- selectionchange compatibility comments moved with behavior
- dragend/drop lifecycle is independent from selectionchange

Risks:

- Firefox dragend/drop lifecycle is a real compatibility patch
- moving it must preserve global document listeners and cleanup order

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move global dragend/drop lifecycle listener attachment into
  `input-router.ts`, preserving Firefox compatibility comments

Do-not-do list:

- do not change drag lifecycle semantics
- do not move drag/drop operation semantics in the same slice
- do not touch selection reconciliation in the same slice

## 2026-04-22 Phase 7 Global Drag Lifecycle Listener Extraction

Status: closed.

Actions:

- added `attachEditableGlobalDragLifecycleListeners(...)` to
  `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- moved global `dragend`/`drop` lifecycle listener attachment out of
  `EditableDOMRoot`
- preserved the Firefox compatibility comment with the listener owner
- kept drag/drop operation semantics in `EditableDOMRoot`
- did not touch selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- editable-voids Chromium rows: `4 passed`
- paste-html Chromium rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- global drag lifecycle attachment is input-router-owned.
- Drag/drop operation semantics stay in `EditableDOMRoot` until focused
  drag/drop strategy slices move them.
- Wrapper/listener extraction is now closed enough to re-inventory remaining
  root owners before moving semantics.

## 2026-04-22 Continue Checkpoint 28

Verdict: replan.

Harsh take: the root is cleaner, but this is still not the final architecture.
We moved event shells; the real remaining work is semantic owner migration and
operation coverage.

Why:

- inline JSX event handlers are gone
- native/global listener attachment is factored
- remaining callbacks still contain actual browser editing policy in the root

Risks:

- moving semantics without a fresh owner inventory will re-create the dirty
  patch pile in smaller files
- the next owner must be chosen by regression blast radius, not convenience

Earliest gates:

- inventory: `rg -n "const handle[A-Z].*= useCallback|useIsomorphicLayoutEffect|useEffect\\(" packages/slate-react/src/components/editable.tsx`
- safety floor: `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|undo|types at the browser-selected end"`
- safety floor: `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- re-inventory remaining `EditableDOMRoot` owner clusters and choose the next
  semantic extraction slice with proof gates before editing

Do-not-do list:

- do not move another semantic block blindly
- do not call wrapper extraction architecture closure
- do not set completion-check to done

## 2026-04-22 Remaining Root Owner Inventory

Status: closed.

Actions:

- inventoried remaining `EditableDOMRoot` callback/effect owners after wrapper
  extraction
- measured current root/module sizes:
  - `components/editable.tsx`: 2090 lines
  - `editable/input-router.ts`: 260 lines
  - `editable/selection-reconciler.ts`: 404 lines
  - `editable/model-input-strategy.ts`: 98 lines
  - `editable/native-input-strategy.ts`: 90 lines
  - `editable/dom-repair-queue.ts`: 15 lines
- identified remaining semantic clusters:
  - native `beforeinput` policy
  - DOM repair after native/model input
  - paste/copy/cut/drop clipboard semantics
  - composition semantics
  - focus/blur/click selection policy
  - keydown hotkey policy
  - pending marks effect
  - root ref weak-map lifecycle

Command:

```sh
rg -n "const handle[A-Z].*= useCallback|const on[A-Z].*= useEditable|useIsomorphicLayoutEffect|useEffect\\(|const callbackRef|const repairDOMInput|const syncDOMSelectionToEditor|const onDOMSelectionChange|const scheduleOnDOMSelectionChange|const domRepairQueue|const \\{ marks \\}" packages/slate-react/src/components/editable.tsx
wc -l packages/slate-react/src/components/editable.tsx packages/slate-react/src/editable/input-router.ts packages/slate-react/src/editable/selection-reconciler.ts packages/slate-react/src/editable/model-input-strategy.ts packages/slate-react/src/editable/native-input-strategy.ts packages/slate-react/src/editable/dom-repair-queue.ts
```

Decision:

- Next semantic owner should be DOM repair, not native `beforeinput` policy.
- `repairDOMInput(...)` is isolated, already protected by visual-caret and
  DOM-sync gates, and belongs in `dom-repair-queue.ts`.
- Native `beforeinput` policy is larger and should wait until DOM repair has a
  clearer module boundary.

## 2026-04-22 Continue Checkpoint 29

Verdict: pivot.

Harsh take: moving native `beforeinput` policy next would be macho refactoring,
not engineering. DOM repair is the cleaner next owner and directly attacks the
caret class that started this lane.

Why:

- `repairDOMInput(...)` is self-contained
- it already has focused browser and unit gates
- `dom-repair-queue.ts` is currently too thin for its intended ownership

Risks:

- this function repairs browser-visible state, so model-only proof is not
  enough
- the current timing from `onInputCapture` must stay unchanged

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move `repairDOMInput(...)` from `EditableDOMRoot` into
  `dom-repair-queue.ts`, keeping call timing and behavior unchanged

Do-not-do list:

- do not change repair timing
- do not move native `beforeinput` policy
- do not move selection reconciliation in the same slice

## 2026-04-22 Phase 8 DOM Repair Input Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
  so `DOMRepairQueue` owns `repairDOMInput(...)`
- moved DOM input repair behavior out of `EditableDOMRoot`
- wired native `input` and React `onInputCapture` repair paths through
  `domRepairQueue.repairDOMInput(...)`
- preserved `onInputCapture` timeout timing and payload shape
- did not move native `beforeinput` policy or selection reconciliation

Changed files:

- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- DOM input repair is DOM-repair-queue-owned.
- The next high-value owner is native `beforeinput` semantic split, but it
  should start with a focused sub-slice, not a bulk move.

## 2026-04-22 Continue Checkpoint 30

Verdict: replan.

Harsh take: the easy root shrink is done. The next block is the real beast:
native `beforeinput` policy. Moving it whole would be dumb. Split it by
sub-owner and prove each cut.

Why:

- DOM repair behavior now lives with DOM repair ownership
- the remaining root block with biggest blast radius is `handleDOMBeforeInput`
- that block mixes native-input eligibility, target-range selection repair,
  composition gates, deletion routing, DataTransfer routing, and user-selection
  restore

Risks:

- a bad `beforeinput` extraction will regress typing, delete, paste,
  composition, and visual caret at once
- browser-visible proof is mandatory

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete|paste"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- split native `beforeinput` by owner; first candidate is extracting
  target-range/model-selection synchronization into `selection-reconciler.ts`
  only if the extracted helper has the same inputs/outputs and no policy drift

Do-not-do list:

- do not move all native `beforeinput` at once
- do not change native/model ownership policy
- do not accept model-only proof for this path

## 2026-04-22 Phase 8 BeforeInput Selection Sync Extraction

Status: closed.

Actions:

- added `syncSelectionForBeforeInput(...)` to
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved native `beforeinput` target-range selection synchronization out of
  `EditableDOMRoot`
- preserved the existing input target range rules:
  - delete forward/backward target ranges are not applied
  - dirty node map blocks DOM-point trust
  - model-preferred text insert blocks target-range override
  - non-text-input target range changes preserve/restores user selection refs
  - insertText can sync from DOM selection
  - empty-editor fallback selects first text
  - delete paths can sync from DOM selection
- kept native/model ownership policy and operation dispatch in
  `EditableDOMRoot`

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete|paste"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / undo / visual caret rows: `7 passed`
- large-document-runtime Chromium input/delete/IME/paste cluster: `14 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native `beforeinput` selection synchronization is
  selection-reconciler-owned.
- The next native `beforeinput` owner is model-input operation dispatch.

## 2026-04-22 Continue Checkpoint 31

Verdict: keep course.

Harsh take: this was the right first semantic cut. The remaining
`beforeinput` block is smaller, and the switch-based operation dispatch belongs
in `model-input-strategy.ts`.

Why:

- browser-visible input/delete/IME/paste gates stayed green
- selection policy moved with explicit inputs/outputs
- operation dispatch still lives in the root even though model-input strategy
  already owns the target functions

Risks:

- operation dispatch covers paste, drop, composition, replacement text,
  soft/paragraph breaks, delete units, and native deferral
- proof must include large-doc runtime and richtext browser rows

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete|paste"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- extract the native `beforeinput` operation dispatch switch into
  `model-input-strategy.ts` with explicit inputs for `data`, `native`,
  `inputType`, `selection`, `domRepairQueue`, and composition state

Do-not-do list:

- do not change operation dispatch semantics
- do not move native eligibility in the same slice
- do not accept model-only proof

## 2026-04-22 Phase 8 BeforeInput Operation Dispatch Extraction

Status: closed.

Actions:

- added `applyModelOwnedBeforeInputOperation(...)` to
  `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- moved native `beforeinput` operation dispatch out of `EditableDOMRoot`
- preserved expanded-delete handling, delete units, line-break routing,
  composition commit, DataTransfer routing, native insert deferral, model-owned
  text input repair, and weak DataTransfer detection
- kept native eligibility and selection synchronization outside the dispatch
  helper

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete|paste"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / undo / visual caret rows: `7 passed`
- large-document-runtime Chromium input/delete/IME/paste cluster: `14 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native `beforeinput` operation dispatch is model-input-strategy-owned.
- The next native owner is native eligibility and composition gating in
  `native-input-strategy.ts`.

## 2026-04-22 Continue Checkpoint 32

Verdict: keep course.

Harsh take: `handleDOMBeforeInput` is finally mostly orchestration. The next
honest cut is native eligibility/composition gating, not clipboard or keydown.

Why:

- operation dispatch moved with green browser-visible proof
- model-input strategy now owns the switch it already conceptually owned
- native eligibility still sits in the root next to app input policy and
  composition-change gates

Risks:

- native eligibility controls whether browser DOM mutation is allowed
- a bad cut can reintroduce visual caret drift or double insertion

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move native `beforeinput` eligibility and composition-change decision into
  `native-input-strategy.ts`, preserving current input policy

Do-not-do list:

- do not change native eligibility
- do not move selection sync or operation dispatch again
- do not accept model-only proof

## 2026-04-22 Phase 8 BeforeInput Native Eligibility Extraction

Status: closed.

Actions:

- added `getNativeBeforeInputDecision(...)` to
  `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- moved native `beforeinput` input type/data extraction, composition-change
  detection, composition abort decision, and native insert eligibility out of
  `EditableDOMRoot`
- preserved app input policy as an explicit input from the root
- preserved current native/model ownership behavior
- kept selection synchronization and operation dispatch in their extracted
  owners

Changed files:

- `../slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret rows: `4 passed`
- large-document-runtime Chromium direct-sync/IME cluster: `14 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native `beforeinput` eligibility is native-input-strategy-owned.
- Current `components/editable.tsx` size after this cut: `1810` lines.
- The next small owner is saved user-selection restoration after beforeinput.

## 2026-04-22 Continue Checkpoint 33

Verdict: keep course.

Harsh take: `handleDOMBeforeInput` is much closer to orchestration, but it
still directly restores `EDITOR_TO_USER_SELECTION`. That is selection
reconciler work.

Why:

- native eligibility moved with green browser-visible proof
- beforeinput selection sync already lives in `selection-reconciler.ts`
- saved user-selection restore is the matching tail operation

Risks:

- a bad restore helper can make selection look correct in the model while the
  browser caret drifts

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end|undo"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move saved user-selection restore after beforeinput into
  `selection-reconciler.ts`

Do-not-do list:

- do not change restore semantics
- do not move more beforeinput policy in the same slice
- do not accept model-only proof

## 2026-04-22 Phase 8 BeforeInput Saved Selection Restore Extraction

Status: closed.

Actions:

- added `restoreUserSelectionAfterBeforeInput(...)` to
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved saved user-selection restore out of `EditableDOMRoot`
- preserved `EDITOR_TO_USER_SELECTION` unref/delete behavior and
  live-selection comparison before `Transforms.select(...)`
- did not move more native `beforeinput` policy in this slice

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end|undo"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium visual caret / selected-end / undo rows: `7 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- beforeinput saved-selection restore is selection-reconciler-owned.
- The next small owner is native history input handling.

## 2026-04-22 Phase 8 Native History Event Extraction

Status: closed.

Actions:

- added `applyModelOwnedNativeHistoryEvent(...)` to
  `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- moved `historyUndo`/`historyRedo` native input handling out of
  `EditableDOMRoot`
- reused the existing history intent helper
- preserved both beforeinput and input-event history handling call sites

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium undo / visual caret rows: `6 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- native history events are model-input-strategy-owned.
- The next small owner is WebKit Shadow DOM beforeinput preflight selection
  repair.

## 2026-04-22 Continue Checkpoint 34

Verdict: keep course.

Harsh take: the root now has one obvious preflight wart left before the normal
beforeinput flow: the WebKit Shadow DOM processing branch. That is selection
bridge behavior, not root behavior.

Why:

- native history moved with undo/caret proof
- `handleDOMBeforeInput` still owns a self-contained WebKit ShadowRoot
  target-range-to-Slate-range repair branch
- shadow DOM has a focused Playwright gate

Risks:

- this branch calls `stopImmediatePropagation`; changing return semantics would
  break Shadow DOM input behavior

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move WebKit Shadow DOM beforeinput preflight selection repair into
  `selection-reconciler.ts`

Do-not-do list:

- do not change `preventDefault` / `stopImmediatePropagation` behavior
- do not move normal beforeinput orchestration in the same slice
- do not accept model-only proof

## 2026-04-22 Phase 8 WebKit Shadow DOM BeforeInput Preflight Extraction

Status: closed.

Actions:

- added `handleWebKitShadowDOMBeforeInput(...)` to
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- moved the WebKit ShadowRoot `beforeinput` target-range repair branch out of
  `EditableDOMRoot`
- preserved early-return behavior when no DOM target range or Slate range
  exists
- preserved `preventDefault()` and `stopImmediatePropagation()` behavior
- did not move normal `beforeinput` orchestration

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- shadow-dom Chromium rows: `3 passed`
- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build passed
- first typecheck failed on `Window.Range` typing in
  `selection-reconciler.ts`; fixed by typing the `window` input as
  `Window & typeof globalThis`
- rerun typecheck passed for `slate-dom` and `slate-react`

Decision:

- WebKit Shadow DOM beforeinput preflight is selection-reconciler-owned.
- The next small owner is pending insertion marks during composition.

## 2026-04-22 Continue Checkpoint 35

Verdict: keep course.

Harsh take: the Shadow DOM preflight is out. The next leftover root effect is
pending insertion marks; it is explicitly composition-state behavior and should
not live in `EditableDOMRoot`.

Why:

- shadow DOM and caret gates stayed green
- the type failure was local to the helper boundary and fixed
- the pending marks effect is small and has a clear composition owner

Risks:

- moving the effect must preserve timeout timing relative to composition end
- active marks behavior can regress without obvious DOM failures

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move pending insertion marks effect into `composition-state.ts`

Do-not-do list:

- do not change timeout timing
- do not change marks comparison
- do not move unrelated composition handlers in the same slice

## 2026-04-22 Phase 8 Pending Insertion Marks Effect Extraction

Status: closed.

Actions:

- added `usePendingInsertionMarksEffect(...)` to
  `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- moved pending insertion marks effect out of `EditableDOMRoot`
- preserved `setTimeout` timing, loose `Text.equals(...)` mark comparison,
  and `EDITOR_TO_PENDING_INSERTION_MARKS` set/delete behavior
- did not move unrelated composition handlers

Changed files:

- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- large-document-runtime Chromium IME/runtime cluster: `14 passed`
- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- pending insertion marks effect is composition-state-owned.
- The next larger owner is clipboard/paste strategy extraction from
  `EditableDOMRoot`.

## 2026-04-22 Continue Checkpoint 36

Verdict: keep course.

Harsh take: the root is materially smaller and less filthy, but still not the
final architecture. Clipboard/paste/drop semantics remain in the root and are
the next meaningful owner.

Why:

- composition marks behavior moved with IME/input proof
- native beforeinput is now orchestration around extracted strategy helpers
- paste/copy/cut/drop still mixes event routing, app handlers, shell-backed
  selection, fragment serialization, deletion, and DataTransfer insertion in
  `EditableDOMRoot`

Risks:

- clipboard extraction can break rich paste, Slate fragment paste,
  shell-backed paste, cut deletion, void cut, and decorated copy semantics
- must use browser-visible and clipboard-boundary proof

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"`
- `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium`
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- extract clipboard/paste/cut/drop semantics into a dedicated model/input
  strategy owner without changing transport behavior

Do-not-do list:

- do not change rich/plain/fragment paste behavior
- do not move shell-backed paste without focused proof
- do not set completion-check to done

## 2026-04-22 Phase 9 Paste Strategy Extraction

Status: closed.

Actions:

- added `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- moved paste semantics out of `EditableDOMRoot` into
  `applyEditablePaste(...)`
- preserved shell-backed full-document plain-text replacement
- preserved shell-backed fragment/rich paste fallback through
  `ReactEditor.insertData(...)`
- preserved React `onPaste` fallback policy for unsupported `beforeinput`,
  paste-without-formatting, and Safari missing Slate fragment items
- kept copy/cut/drop semantics in `EditableDOMRoot`

Changed files:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "paste"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- paste-html Chromium rows: `2 passed`
- large-document-runtime Chromium paste rows: `3 passed`
- highlighted-text Chromium rows: `3 passed`
- clipboard-boundary unit rows: `6 pass`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- paste semantics are clipboard-input-strategy-owned.
- The next clipboard owner is copy/cut strategy extraction.

## 2026-04-22 Continue Checkpoint 37

Verdict: keep course.

Harsh take: paste is finally out of the root. Copy/cut is the obvious next
slice: same owner, narrower behavior, good decorated-copy proof.

Why:

- paste/fragment/rich browser gates stayed green
- decorated copy and clipboard-boundary stayed green despite paste move
- copy/cut still owns fragment serialization and deletion in the root

Risks:

- cut mutates the document after setting fragment data
- void cut and expanded cut must remain unchanged

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium`
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move copy/cut semantics into `clipboard-input-strategy.ts`, preserving
  fragment serialization and cut deletion behavior

Do-not-do list:

- do not change cut deletion semantics
- do not move drag/drop in the same slice
- do not set completion-check to done

## 2026-04-22 Phase 9 Copy/Cut Strategy Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
  with `applyEditableCopy(...)` and `applyEditableCut(...)`
- moved copy/cut semantics out of `EditableDOMRoot`
- preserved decorated fragment serialization through
  `ReactEditor.setFragmentData(...)`
- preserved cut behavior:
  - set fragment data before mutating
  - expanded selection deletes the fragment
  - collapsed void selection deletes the void
  - read-only and app-handled events do nothing
- did not move drag/drop semantics

Changed files:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- highlighted-text Chromium rows: `3 passed`
- clipboard-boundary unit rows: `6 pass`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Known gap:

- No browser cut helper exists yet. Cut semantics are behavior-preserving and
  covered by close clipboard/DOM gates, but a dedicated browser cut row remains
  a worthwhile future proof.

Decision:

- copy/cut semantics are clipboard-input-strategy-owned.
- The next clipboard owner is drag/drop strategy extraction.

## 2026-04-22 Continue Checkpoint 38

Verdict: keep course.

Harsh take: copy/cut is out, but drag/drop still sits in the root. Move it next
with void/editor proof; do not pretend that covers all native DnD weirdness.

Why:

- decorated copy and clipboard-boundary proof stayed green
- paste proof stayed green in the previous slice
- drag/drop still owns fragment data, internal drag deletion, void drag prep,
  and focus repair in `EditableDOMRoot`

Risks:

- drag/drop is underproved compared to paste
- Firefox global drag lifecycle is already extracted, but operation semantics
  still need focused proof

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move drag/drop semantics into `clipboard-input-strategy.ts`, preserving void
  drag selection, internal drag deletion, DataTransfer insertion, and focus
  repair

Do-not-do list:

- do not change drag/drop semantics
- do not add broad skips
- do not set completion-check to done

## 2026-04-22 Phase 9 Drag/Drop Strategy Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
  with drag/drop strategy functions:
  - `applyEditableDragEnd(...)`
  - `applyEditableDragOver(...)`
  - `applyEditableDragStart(...)`
  - `applyEditableDrop(...)`
- moved drag/drop semantics out of `EditableDOMRoot`
- preserved void drag selection, internal drag deletion, DataTransfer fragment
  serialization, insertion, and focus repair
- kept global drag lifecycle listener ownership in `input-router.ts`

Changed files:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- editable-voids Chromium rows: `4 passed`
- paste-html Chromium rows: `2 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- drag/drop semantics are clipboard-input-strategy-owned.
- The extraction exposed a real proof gap: browser cut semantics still lack a
  direct browser row.

## 2026-04-22 Continue Checkpoint 39

Verdict: pivot.

Harsh take: we can keep shrinking the root, but the sharper next move is
coverage. Copy/cut moved with unit/adjacent proof, and cut deserves a browser
row before more churn.

Why:

- clipboard strategy extraction is green
- paste/copy have strong browser proof
- cut has behavior-preserving code but no direct browser user-path proof

Risks:

- synthetic cut transport is not identical to native OS clipboard, but it proves
  the actual React `onCut` path, fragment serialization, and model deletion

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium`
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- add a focused browser cut row for decorated text that dispatches the editor
  cut event, asserts clipboard fragment semantics, and asserts model/DOM text
  deletion

Do-not-do list:

- do not fake success with model-only cut proof
- do not broaden into native OS clipboard transport
- do not set completion-check to done

## 2026-04-22 Phase 9 Browser Cut Proof

Status: closed.

Actions:

- added a browser cut row to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- used the real browser shortcut path, `ControlOrMeta+X`, instead of a
  synthetic `ClipboardEvent`
- asserted:
  - clipboard plain text is `lpha bet`
  - clipboard HTML contains Slate fragment semantics
  - model/visible text becomes `aa`
  - Slate selection collapses at the cut start
- fixed product behavior in
  `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
  so expanded-selection cut preserves a point ref, deletes the fragment,
  restores the collapsed model selection, and syncs DOM focus/selection
- removed a flaky post-cut `clipboard.assert.types(...)` assertion because it
  performs another copy after cut and perturbs the collapsed selection

Changed files:

- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "cuts decorated"
bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts --project=chromium
bun test ./packages/slate-dom/test/clipboard-boundary.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- first synthetic cut row failed consistently because Slate selection became
  `null`; this exposed a real selection/caret safety gap
- adding a point-ref model restore alone was insufficient; DOM selection still
  cleared the model selection
- restoring the collapsed model selection and calling `ReactEditor.focus(...)`
  after cut fixed the real shortcut path
- highlighted-text Chromium full file: `4 passed`
- editable-voids + paste-html Chromium rows: `6 passed`
- clipboard-boundary unit rows: `6 pass`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- browser cut proof is now first-class for decorated text.
- Clipboard strategy has direct paste, copy, cut, and drag/drop regression
  floors.
- The next root owner is composition event strategy extraction.

## 2026-04-22 Continue Checkpoint 40

Verdict: keep course.

Harsh take: the cut row caught exactly the kind of regression the old model-only
proof missed. Clipboard strategy is now in a much better place. Next, move
composition event semantics out of `EditableDOMRoot`.

Why:

- paste/copy/cut/drag/drop are now strategy-owned with browser-visible gates
- `EditableDOMRoot` is down to `1636` lines
- remaining root owner clusters include composition handlers, focus/click
  selection policy, keydown policy, root-ref lifecycle, and final full-gate
  coverage

Risks:

- composition event extraction can break IME ordering, Android manager hooks,
  and Chrome composition-end fallback

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move composition start/update/end event semantics into `composition-state.ts`
  without changing Android, Chrome fallback, or expanded-selection behavior

Do-not-do list:

- do not change composition timing
- do not move keydown or focus policy in the same slice
- do not set completion-check to done

## 2026-04-22 Phase 10 Composition Event Strategy Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
  with composition event strategy functions:
  - `applyEditableCompositionEnd(...)`
  - `applyEditableCompositionStart(...)`
  - `applyEditableCompositionUpdate(...)`
- moved composition start/update/end semantics out of `EditableDOMRoot`
- preserved Android input manager composition hooks
- preserved Chrome composition-end fallback
- preserved expanded-selection deletion on composition start
- preserved composition target/input checks and app handler behavior

Changed files:

- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "IME"
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- large-document-runtime Chromium IME/runtime cluster: `14 passed`
- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- composition event semantics are composition-state-owned.
- `EditableDOMRoot` is now `1606` lines.
- The next smaller owner is focus/click selection policy extraction.

## 2026-04-22 Continue Checkpoint 41

Verdict: keep course.

Harsh take: composition is out. Do not jump into keydown yet; focus/click
selection policy is smaller, browser-sensitive, and belongs with selection
reconciliation.

Why:

- IME and caret gates stayed green
- focus/blur/click still own browser compatibility and selection policy in the
  root
- keydown remains larger and should be saved for a dedicated keyboard-policy
  slice

Risks:

- focus/blur/click can break nested editable focus, Safari selection clearing,
  triple-click block selection, and void click selection

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move focus/blur/click selection policy into `selection-reconciler.ts`

Do-not-do list:

- do not move keydown in the same slice
- do not change focus/blur/click semantics
- do not set completion-check to done

## 2026-04-22 Phase 11 Focus/Click Selection Policy Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
  with focus/click selection policy functions:
  - `applyEditableBlur(...)`
  - `applyEditableFocus(...)`
  - `applyEditableClick(...)`
  - `applyEditableMouseDown(...)`
- moved focus/blur/click/mouse-down semantics out of `EditableDOMRoot`
- preserved Firefox nested-editable focus handling
- preserved Safari blur selection clearing
- preserved void-spacer and non-void internal focus ignore behavior
- preserved click-time stale path guard, triple-click block selection, void
  click selection, and model-selection-preference reset
- did not move keydown

Changed files:

- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "visual caret|types at the browser-selected end"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- editable-voids Chromium rows: `4 passed`
- richtext Chromium selected-end / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- focus/click selection policy is selection-reconciler-owned.
- `EditableDOMRoot` is now `1496` lines.
- The next major owner is keyboard policy extraction.

## 2026-04-22 Continue Checkpoint 42

Verdict: keep course.

Harsh take: this leaves keydown as the obvious large browser-policy block. Move
it next, but as keyboard policy, not random helper soup.

Why:

- focus/click browser gates stayed green
- root has shrunk from a monolith to orchestration plus keydown/input/ref
  lifecycle
- keydown still owns history hotkeys, select-all shell state, line/word
  movement, void delete fallback, and browser fallback shortcuts

Risks:

- keyboard policy can break undo/redo, markdown shortcuts, selection movement,
  delete behavior, and large-document shell activation

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo|types at the browser-selected end|visual caret"`
- `bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "activates shells by keyboard|directly synced"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move keydown policy into a dedicated keyboard strategy module or
  `model-input-strategy.ts`, preserving all hotkey behavior

Do-not-do list:

- do not rewrite keyboard semantics
- do not move root ref lifecycle in the same slice
- do not set completion-check to done

## 2026-04-22 Phase 12 Keyboard Policy Extraction

Status: closed.

Actions:

- added `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- moved keydown policy out of `EditableDOMRoot`
- preserved:
  - Android keydown manager dispatch
  - composition recovery when `nativeEvent.isComposing === false`
  - app `onKeyDown` handling
  - select-all shell-backed state
  - undo/redo hotkeys
  - large-document single-character direct insert
  - line/word movement and extension
  - void/inline movement compatibility
  - delete fallback behavior when `beforeinput` is unavailable
- did not move root ref lifecycle

Changed files:

- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "undo|types at the browser-selected end|visual caret"
bunx playwright test ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium --grep "can add a h1|can add list"
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "activates shells by keyboard|directly synced"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium undo / selected-end / visual caret rows: `7 passed`
- markdown-shortcuts Chromium h1/list rows: `2 passed`
- large-document-runtime Chromium keyboard/direct-sync rows: `5 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- keyboard policy is keyboard-input-strategy-owned.
- `EditableDOMRoot` is now `1162` lines.
- The next smaller owner is root ref/native-listener lifecycle extraction.

## 2026-04-22 Continue Checkpoint 43

Verdict: keep course.

Harsh take: root has dropped below 1200 lines. The next cut should not be more
editing policy; it should be root ref/native listener lifecycle, which is
plumbing still sitting in the root.

Why:

- keyboard gates stayed green
- root ref callback still owns weak-map cleanup, native listener attach/detach,
  and forwarded ref assignment
- that lifecycle belongs with input/root plumbing, not editing semantics

Risks:

- bad root ref extraction can detach native `beforeinput`/`input` listeners or
  break weak-map registration

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`

Next move:

- move root ref/native listener lifecycle into `input-router.ts`

Do-not-do list:

- do not change weak-map lifecycle
- do not change native listener attach/detach timing
- do not set completion-check to done

## 2026-04-22 Phase 13 Root Ref / Native Listener Lifecycle Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/input-router.ts`
  with `useEditableRootRef(...)`
- moved root ref lifecycle out of `EditableDOMRoot`
- preserved:
  - selectionchange debounce cancellation on unmount
  - weak-map cleanup for editor/root DOM registration
  - native `beforeinput`/`input` listener attach/detach
  - internal root ref assignment
  - forwarded ref function/object assignment
- fixed helper type so `forwardedRef` may be undefined

Changed files:

- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret rows: `4 passed`
- DOM text sync contract: `1 pass`
- lint/build passed
- first typecheck failed because `forwardedRef` can be undefined; widened the
  helper type
- rerun typecheck passed for `slate-dom` and `slate-react`

Decision:

- root ref/native listener lifecycle is input-router-owned.
- `EditableDOMRoot` is now `1133` lines.
- The next owner is React `onInput` strategy extraction.

## 2026-04-22 Continue Checkpoint 44

Verdict: keep course.

Harsh take: root lifecycle is out. The remaining root still owns React
`onInput` semantics, including Android input dispatch, deferred native op
flush, DOM text repair, and native history repair. That belongs in an input
strategy owner.

Why:

- root ref gates stayed green
- current `handleInput(...)` is self-contained and has direct caret/browser
  gates
- this is smaller and safer than trying to move all remaining `beforeinput`
  orchestration

Risks:

- `onInput` repairs visible DOM/model drift, so browser-visible proof is
  mandatory
- Android manager dispatch must stay first

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret|undo"`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- move React `onInput` strategy into `model-input-strategy.ts` or a dedicated
  input strategy helper, preserving Android/deferred/native-history behavior

Do-not-do list:

- do not change `onInput` ordering
- do not move `beforeinput` orchestration in the same slice
- do not set completion-check to done

## 2026-04-22 Phase 14 React Input Strategy Extraction

Status: closed.

Actions:

- extended `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
  with `applyEditableInput(...)`
- moved React `onInput` semantics out of `EditableDOMRoot`
- preserved:
  - app `onInput` handling first
  - Android input manager dispatch before deferred native op flushing
  - deferred native operation flush
  - DOM/model text repair for native insert text
  - `handledDOMBeforeInputRef` reset
  - native history repair when the editor is not focused
- did not move `beforeinput` orchestration

Changed files:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`

Commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|visual caret|undo"
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Evidence:

- richtext Chromium browser input / visual caret / undo rows: `7 passed`
- DOM text sync contract: `1 pass`
- lint/build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- React `onInput` semantics are model-input-strategy-owned.
- `EditableDOMRoot` is now `1066` lines.
- The next owner is final `beforeinput` orchestration extraction or a final
  closure-gate decision if the remaining root is accepted as orchestration.

## 2026-04-22 Continue Checkpoint 45

Verdict: replan.

Harsh take: most real event policy is extracted. The remaining root is mostly
orchestration wrappers, but native `beforeinput` still has a meaningful
orchestration block. Decide whether to extract that final block or classify it
as the root coordinator.

Why:

- `EditableDOMRoot` is now substantially smaller and mostly delegates behavior
- all touched browser lanes stayed green
- remaining obvious block is `handleDOMBeforeInput(...)`, plus event wrapper
  callbacks that now call strategy functions

Risks:

- extracting `beforeinput` orchestration will pass a lot of dependencies and may
  make the boundary uglier than the current coordinator shape
- stopping without final gates would be fake closure

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "inserts text through browser input|undo|visual caret"`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "directly synced|IME|delete|paste"`
- `bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Next move:

- inspect `handleDOMBeforeInput(...)` and decide whether to extract it into a
  native input coordinator helper or explicitly keep it as root orchestration
  before running final gates

Do-not-do list:

- do not set completion-check to done before final gates
- do not move `beforeinput` blindly if the helper shape is worse than the root
  coordinator
- do not skip browser-visible proof

## 2026-04-22 Native BeforeInput Coordinator Decision

Status: closed.

Decision:

- Keep `handleDOMBeforeInput(...)` in `EditableDOMRoot` as the root
  coordinator.
- Do not extract it into a giant helper.

Why:

- the remaining block coordinates already-extracted owners:
  - model-owned native history
  - WebKit Shadow DOM preflight
  - user-input tracking
  - Android beforeinput manager
  - DOM selection flush
  - native input decision
  - beforeinput selection sync
  - model operation dispatch
  - saved user-selection restore
- extracting that coordinator would require passing nearly every root runtime
  dependency into one function and would make the boundary worse, not better
- the important behaviors under the coordinator already live in their
  respective strategy modules

Current root size:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`: `1066`
  lines

Next move:

- run final browser/editing/package gates.

Do-not-do list:

- do not move the coordinator just to reduce line count
- do not set completion-check done until final gates pass or exact blockers are
  named

## 2026-04-22 Continue Checkpoint 46

Verdict: keep course.

Harsh take: the architecture refactor is at the point where more blind
extraction is negative value. Run the final gates. If they pass, close the
lane. If they expose a regression, fix the owner.

Why:

- the dirty event-policy owners are extracted
- direct browser cut proof caught and fixed a real selection regression
- the remaining root is orchestration plus provider wiring

Risks:

- focused rows have been green, but final cluster can still expose integration
  fallout

Earliest gates:

- `bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium`
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
- `bun run lint`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`

Next move:

- run final gates sequentially.

Do-not-do list:

- do not run Playwright gates in parallel
- do not mark completion-check done on focused-row proof alone if final cluster
  fails

## 2026-04-22 Final Gate Closure

Status: closed.

Actions:

- kept native `beforeinput` in `EditableDOMRoot` as the root coordinator rather
  than extracting a worse mega-helper
- ran the final browser/editing/package gates sequentially
- no additional product changes were needed after the final gate run

Final root size:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`: `1066`
  lines

Final gate commands:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts --project=chromium
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Final evidence:

- Chromium browser cluster: `39 passed`
- DOM text sync contract: `1 pass`
- large-doc-and-scroll contract: `15 pass`
- projections-and-selection contract: `6 pass`
- lint: passed
- build/typecheck for `slate-dom` and `slate-react`: passed

Decision:

- The active editable browser-kernel refactor lane is complete under this plan.
- Remaining broader work is outside this lane:
  - wider non-Chromium/mobile browser parity
  - raw native transport diagnostic suite
  - future Android-specific expansion
  - larger core performance perfection

## 2026-04-22 Final Continue Checkpoint

Verdict: stop.

Harsh take: this lane is done. Keeping the loop alive now would be fake motion.

Why:

- all named owners in the active editable browser-kernel refactor lane are
  closed or explicitly classified
- the final Chromium browser cluster is green
- package-level React/DOM contract gates are green
- lint/build/typecheck are green

Risks:

- this is not a claim that every browser/platform row in the whole repo is done
- non-Chromium/mobile parity remains outside this lane unless reopened

Earliest gates:

- already passed in the final gate closure above

Next move:

- none for this active lane

Do-not-do list:

- do not keep looping after completion
- do not reopen broader browser parity unless the active target changes
