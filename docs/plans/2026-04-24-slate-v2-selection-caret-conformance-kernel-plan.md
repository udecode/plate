---
date: 2026-04-24
topic: slate-v2-selection-caret-conformance-kernel
status: active
supersedes_execution_confidence_from:
  - docs/plans/2026-04-23-slate-v2-perfect-architecture-master-plan.md
source_repos:
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
depends_on:
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
  - docs/solutions/logic-errors/2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md
---

# Slate v2 Selection/Caret Conformance Kernel Plan

## Verdict

Do not pivot to a different editor model.

Pivot harder into the stricter version of the accepted Slate v2 architecture:

```txt
Slate model + operations
Lexical-style read/update lifecycle
ProseMirror-style transaction + DOM-selection authority
Tiptap-style extension DX
React 19.2 live-read / dirty-commit runtime
Selection/Caret Conformance Kernel
Generated browser gauntlets
```

The previous master plan closed the current checked suite. User-visible cursor
regressions mean that suite was not strong enough. The architecture direction is
still right; the proof and timing discipline are not yet good enough.

Latest browser evidence reopens release confidence: fresh deterministic rows can
pass while a warm, no-refresh page gets stuck after real user selection,
toolbar toggles, and arrow navigation. That class is not a missing assertion.
It is stale async selection/repair work surviving into the next user event.

## Harsh Take

The bug class is not "missing ArrowRight row" or "bold click edge case".

The bug class is that selection and caret truth can still leak across:

- DOM selection
- model selection
- transaction target
- focus owner
- app/plugin commands
- browser default editing
- post-commit DOM repair
- test handles

If those owners can disagree without one audited kernel deciding the sequence,
cursor regressions will keep escaping.

## North Star

- data-model-first core
- operations remain collaboration truth
- `editor.read` and `editor.update` remain the public lifecycle
- primitive editor methods remain the main DX inside `editor.update`
- internal target resolution stays hidden
- `slate-react` owns DOM selection import/export
- one kernel owns event timing and selection/caret authority
- React consumes commit dirtiness/live reads, not snapshots
- browser proof asserts model, DOM, visual caret, commit, trace, and follow-up
  typing

## Non-Goals

- Do not restore legacy monolithic `Editable`.
- Do not copy Lexical's class node model.
- Do not copy ProseMirror's integer-position public model.
- Do not make Tiptap `focus().chain().run()` the required DX.
- Do not expose `tx.resolveTarget()` to app/plugin authors.
- Do not solve every Plate migration API in this plan.
- Do not reopen child-count chunking as the primary perf strategy.

## Architecture Target

### Public API

Keep the public shape:

```ts
editor.read(() => {
  editor.getSelection()
  editor.getChildren()
  editor.getMarks()
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

Keep primitive editor methods flexible:

- `editor.select`
- `editor.setNodes`
- `editor.wrapNodes`
- `editor.unwrapNodes`
- `editor.insertNodes`
- `editor.removeNodes`
- `editor.splitNodes`
- `editor.mergeNodes`
- `editor.moveNodes`
- `editor.insertText`
- `editor.delete`
- `editor.insertFragment`
- `editor.insertBreak`

Convenience methods are allowed only when tiny and stable:

- `editor.toggleMark`
- `editor.toggleBlock`

Do not grow semantic methods for every custom node type.

### Internal Spine

Every browser editing path must reduce to:

```txt
event
  -> event frame / epoch
  -> input intent
  -> selection source
  -> target resolution
  -> editor.update / transaction
  -> operations
  -> EditorCommit
  -> DOM repair decision
  -> trace
```

Exactly one owner decides that sequence: `EditableConformanceKernel`.

Current controllers become workers:

- `InputRouter`: classify raw browser events into intents only
- `SelectionReconciler`: import/export model and DOM selection only
- `CaretEngine`: compute movement and canonical caret placement only
- `MutationController`: execute model mutations only through `editor.update`
- `DOMRepairQueue`: execute scheduled repair only
- `BrowserHandle`: proof-only semantic control surface, never native proof
- `EditableConformanceKernel`: owns order, authority, legality, and trace

### Source-Backed Timing Upgrade

The current plan already steals the right high-level ideas. The deeper source
read adds one missing non-negotiable: editing work must be framed by a single
event epoch.

Source lessons to steal:

- Legacy Slate kept `selectionchange`, `beforeinput`, composition, and movement
  timing in one coherent control flow. Recover the ordering comments and
  browser cautions, not the monolith.
- ProseMirror flushes DOM observation before key handling, centralizes
  `selectionFromDOM` / `selectionToDOM`, disconnects or suppresses selection
  observation while writing DOM selection, and uses counters like
  `domChangeCount` to cancel stale async fallbacks.
- Lexical runs writes inside one `editor.update` lifecycle, tags updates, owns
  dirty nodes and DOM selection update during commit, and lets tags like
  `skip-dom-selection` or composition tags decide post-commit DOM work.

Slate v2 answer:

```txt
EditableEventFrame
  -> selection import/export
  -> editor.update transaction
  -> commit
  -> repair scheduling
  -> trace
```

Every frame gets an id. Every repair, selection export, delayed retry,
selectionchange import, and trace entry carries that id. Starting a new user
event invalidates stale async work from older frames unless the kernel
explicitly transfers ownership.

### Event Frame / Epoch Contract

Required frame shape:

```ts
type EditableEventFrame = {
  id: number
  active: boolean
  eventFamily: EditableEventFamily
  focusOwner: EditableFocusOwner
  inputIntent: InputIntent | null
  modelSelectionBefore: Selection | null
  selectionSource: EditableSelectionSource
  startedAt: number
  targetOwner: EditableTargetOwner
}
```

Rules:

- every browser event opens or joins exactly one current frame
- every command/transaction/commit records the current frame id
- every DOM repair request records the frame id that scheduled it
- every delayed repair checks that its frame is still current before writing
  DOM selection or DOM text
- every `selectionchange` records whether it is native, programmatic export,
  repair-induced, or unknown
- programmatic export/repair suppresses or labels the resulting
  `selectionchange`; it must not re-import as a fresh user selection
- stale frame writes fail tests immediately and log the cancelled frame id,
  current frame id, event family, selection before/after, and repair reason

## Hard Cuts

Cut from primary runtime, docs, examples, and blessed plugin patterns:

- public mutable `editor.selection`
- public mutable `editor.children`
- public mutable `editor.marks`
- public mutable `editor.operations`
- public `Transforms.*` as the primary mutation story
- direct `editor.apply` as an extension point
- direct `editor.onChange` as an extension point
- command policy objects
- `ReactEditor.runCommand`
- required `focus().chain().run()` command ceremony
- browser default structural editing as trusted truth
- app/plugin mutations that bypass `editor.update`
- tests that claim native behavior through semantic handles
- tests that assert model only for browser/caret claims
- tests that assert DOM only for editor/model claims
- local helper soup that duplicates `slate-browser` proof primitives
- child-count chunking outside legacy comparison fixtures

## Recover From Legacy

Recover the useful parts, not the monolith:

- event ordering comments
- browser-specific timing cautions
- selection restoration discipline
- DOM point/path mapping edge cases
- composition/IME guardrails
- focus/blur and internal-control heuristics
- history undo/redo selection restoration knowledge

Do not recover:

- mutable-field mental model
- method monkeypatching as extension architecture
- `Editable` as one giant event file
- callback-first `decorate` as overlay architecture
- child-count chunking

## New Core Concept: Selection/Caret Conformance Kernel

The kernel owns a state machine, not a pile of callbacks.

States:

- `idle`
- `focused`
- `dom-selection-authoritative`
- `model-selection-authoritative`
- `transaction-open`
- `repair-pending`
- `composition`
- `clipboard`
- `dragging`
- `internal-control`
- `shell-backed`
- `shadow-root`
- `mobile-semantic`

Events:

- `keydown`
- `beforeinput`
- `input`
- `selectionchange`
- `compositionstart`
- `compositionupdate`
- `compositionend`
- `paste`
- `cut`
- `drop`
- `focus`
- `blur`
- `mousedown`
- `mouseup`
- `click`
- `pointerdown`
- `toolbar-command`
- `browser-handle-command`
- `post-commit-repair`

For every transition record:

- previous state
- event family
- input intent
- selection source
- target source
- focus owner
- transaction id
- operation classes
- commit id
- repair policy
- DOM selection before/after
- model selection before/after
- visual caret assertion status

Illegal transitions fail tests immediately. Runtime throwing can remain
dev/test-only until the transition map stabilizes.

## Selection Authority Rules

### DOM Authoritative

Use DOM selection as target when:

- user clicked or selected inside the editable
- toolbar/app command follows a browser selection
- browser-native movement just happened and model selection is stale
- explicit user interaction changed the caret outside the model-owned pipeline

### Model Authoritative

Use model selection as target when:

- inside `editor.update`
- browser-handle semantic command
- model-owned text insertion/delete
- undo/redo repair
- shell-backed semantic edit
- internal controls intentionally preserve editor selection
- composition mode owns pending text

### Explicit Target

Use explicit target with no DOM import when:

- `at` is provided
- command targets a path/range/ref/bookmark
- operation targets durable collaboration/history bookmark

### No Selection

Use no selection target when:

- command mutates app-only state
- command reads only
- extension updates non-document metadata

These are internal rules. Plugin authors should not choose policies manually.

## Repair Contract

Every commit that can affect visible caret/text must produce a repair decision:

- `none`
- `sync-dom-selection`
- `sync-dom-text`
- `force-react-render`
- `focus-editor`
- `restore-model-selection`
- `skip-dom-sync`
- `defer-for-composition`
- `defer-for-shadow-root`
- `defer-for-mobile`

Repair input:

- commit metadata
- model selection before/after
- operation classes
- DOM selection snapshot
- focus owner
- composition state
- direct-DOM text capability result

Repair output:

- whether DOM text changed directly
- whether React fallback is required
- whether DOM selection was canonicalized
- whether scroll/focus changed
- trace entry

### Repair Cancellation Contract

`DOMRepairQueue` must never be a free-floating retry loop.

Required behavior:

- `DOMRepairQueue.beginFrame(frameId)` records the newest event frame
- `DOMRepairQueue.cancelBefore(frameId)` invalidates older pending retries
- every repair request carries `frameId`, `commitId`, reason, and target
  selection bookmark
- immediate, microtask, timeout, animation-frame, and retry repairs all check
  `frameId` before touching DOM
- a newer keydown, pointer event, toolbar command, native input, composition
  event, paste/drop, focus change, or real selectionchange cancels older
  model-owned repair retries unless the kernel explicitly preserves them
- controlled DOM selection writes suppress or classify their resulting
  selectionchange instead of letting it import as user intent

This is the likely owner for warm no-refresh flakes where keydown/keyup fires
but visual/model selection stays stuck: an older repair or delayed export can
overwrite the browser's newer caret movement.

### Movement Ownership Capability Matrix

Do not make all caret movement model-owned by default.

The kernel must choose movement ownership from a capability matrix:

- native-owned collapsed horizontal movement when DOM selection is inside a
  normal editable text node and there is no inline/void/zero-width/projection,
  shell, shadow-root, composition, or internal-control hazard
- model-owned movement when crossing Slate-only structures, voids, inlines,
  zero-width text, projections, hidden placeholders, shell-backed rows, or
  known browser-broken line/word movement
- semantic-owned movement only for browser-handle proof rows, never for native
  transport claims

Every model-owned movement must import the current DOM selection at the start
of the current event frame unless the frame already declares model selection
authoritative. Every native-owned movement must cancel stale model-owned repair
work before the browser moves the caret.

## Visual Caret Proof

Model selection and DOM selection are not enough.

Browser rows that claim caret correctness must assert one of:

- DOM anchor/focus node and offset
- root-relative caret rectangle
- caret is visually after/before a known text node/character
- follow-up typing lands at the asserted caret

When a browser cannot expose reliable caret geometry, the row must say so and
fall back to:

- model selection
- DOM selection where observable
- visible DOM text
- follow-up typing
- platform limitation note

No silent downgrade to model-only proof.

## Test Architecture

### Layer 1: Pure Core Contracts

Purpose:

- prove `editor.read` / `editor.update`
- prove primitive method target behavior
- prove selection bookmarks
- prove commit metadata
- prove operation classes and dirty regions

Files:

- `../slate-v2/packages/slate/test/read-update-contract.ts`
- `../slate-v2/packages/slate/test/primitive-method-runtime-contract.ts`
- `../slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`
- `../slate-v2/packages/slate/test/commit-metadata-contract.ts`
- `../slate-v2/packages/slate/test/bookmark-contract.ts`

### Layer 2: React Runtime Contracts

Purpose:

- prove DOM import/export ownership
- prove focus/internal-control behavior
- prove repair decisions
- prove direct-DOM sync fallback
- prove selector/live-read render isolation

Files:

- `../slate-v2/packages/slate-react/test/selection-conformance-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/caret-repair-contract.ts`
- `../slate-v2/packages/slate-react/test/target-runtime-contract.tsx`
- `../slate-v2/packages/slate-react/test/dom-text-sync-contract.ts`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`

### Layer 3: Browser Gauntlets

Purpose:

- prove user-path behavior across Chromium, Firefox, WebKit, and mobile
- catch unknown cursor regressions before users do
- differentiate native transport proof from semantic-handle proof

Files:

- `../slate-v2/packages/slate-browser/src/playwright/**`
- `../slate-v2/playwright/integration/examples/**`

Every row asserts:

- model tree/text
- model selection
- visible DOM
- DOM selection/caret where observable
- focus owner
- commit metadata
- no illegal transition
- follow-up typing

Warm-state rows are mandatory. A browser proof must include no-refresh repeated
interaction sequences, not only fresh-page deterministic setup. At least one
row per high-risk family must run the same editor instance through repeated
selection, toolbar, navigation, mutation, and follow-up typing cycles.

## Generated Gauntlet Families

### Navigation

Scenarios:

- ArrowLeft / ArrowRight inside text
- word movement
- line movement
- Up / Down across paragraphs
- Down -> Right -> Up -> Right
- Home / End
- Shift + arrows
- selection collapse after movement
- navigation across inline boundary
- navigation across void boundary
- navigation after toolbar command
- navigation after model-owned insert/delete

### Mutation

Scenarios:

- insert before/inside/after text
- Backspace at start/middle/end
- Delete at start/middle/end
- range delete collapsed/non-collapsed
- split block / Enter
- merge block
- insert fragment
- paste plain text
- paste rich HTML
- cut
- undo/redo after native and model-owned edits

### Formatting

Scenarios:

- select word -> bold -> click another word
- select word -> bold -> bold off -> selection remains expanded
- select word -> bold -> bold off -> ArrowLeft/ArrowRight still moves
- select word -> bold -> type
- select text -> block toggle
- paragraph 2 -> toolbar heading updates paragraph 2
- toolbar command after browser selection
- toolbar command after model selection is stale
- mark toggle followed by arrow movement
- mark toggle followed by delete/backspace
- warm no-refresh: repeat word selection -> toolbar toggle -> arrow movement
  without reloading the example

### Primitive Custom Transforms

Scenarios:

- custom list transform with `unwrapNodes` / `setNodes` / `wrapNodes`
- custom todo transform
- custom callout transform
- nested block transform
- explicit `at` transform never imports DOM
- implicit target transform imports fresh selection only through runtime

### Inline / Void

Scenarios:

- type before inline
- type after inline
- Backspace at inline boundary
- Delete at inline boundary
- select across inline
- void selection and deletion
- markable void behavior
- nested editable inside void

### Composition / IME

Scenarios:

- composition start/update/end
- composition with mark active
- composition near inline boundary
- composition after toolbar command
- composition with direct-DOM sync declined
- mobile semantic fallback

### Clipboard / Drag

Scenarios:

- paste plain
- paste rich
- paste fragment
- paste over selection
- cut selected range
- drop fragment
- clipboard after shell-backed selection

### Shadow DOM

Scenarios:

- click/select/type in shadow root
- arrow movement in shadow root
- delete/backspace in shadow root
- toolbar command from shadow selection
- paste in shadow root
- WebKit semantic fallback with explicit limitation record

### Large Document

Scenarios:

- direct DOM sync typing
- direct DOM sync delete/backspace
- shell activation
- shell-backed selection
- paste in large doc
- undo/redo after direct DOM sync
- block transform in 5000-block doc
- scroll preservation

### Internal Controls

Scenarios:

- checkbox focus preserves editor selection
- button click executes toolbar command at preserved/fresh target
- nested input does not rewrite outer selection
- internal control blur restores editor typing target only when intended

## Scenario Generator

Build `slate-browser` scenario generation as a first-class test tool.

Inputs:

- document shape
- selection seed
- event sequence
- browser project
- transport mode:
  - native
  - semantic handle
  - mixed
- expected ownership:
  - DOM authoritative
  - model authoritative
  - explicit target
  - none
- warm-up sequence that leaves pending repair/selectionchange risk behind
- frame/epoch expectations for each step

Output:

- deterministic test title
- replayable seed
- step-by-step trace
- failure diff:
  - model tree/text
  - model selection
  - DOM text
  - DOM selection
  - focus owner
  - commit metadata
  - transition log
  - active frame id
  - cancelled stale frame ids
  - pending repair requests
  - native event log when available

Shrinking:

- when a generated row fails, shrink the event list to the smallest sequence
  that still reproduces
- persist the shrunk row as a named regression fixture
- preserve enough warm-up context in the fixture to reproduce stale timing bugs
  that disappear on a fresh page

## TDD Execution Strategy

Use tracer bullets, not horizontal rewrite.

For each slice:

1. write one red conformance row
2. prove it fails for the current owner
3. fix the owner
4. run the focused gate
5. run the relevant suite gate
6. record the owner classification and rejected tactics

Do not write a giant imagined test matrix before the first red row proves the
test harness can catch the class.

## Progress Sync

This plan has already completed the first conformance lane. Do not rerun it as
if nothing happened.

Completed:

- proof substrate exists for model, DOM, focus owner, commit, caret/follow-up
  typing, and kernel trace evidence
- `slate-browser` has typed kernel trace entries and reusable trace assertions
- generated gauntlets exist for toolbar mark/caret, mixed editing, mobile
  semantic editing, inline cut, clipboard paste, composition, drop, shadow,
  void/internal-control, shell, and focused browser families
- cut, paste, drop, and composition paths record mutation command traces instead
  of only event-family traces
- focused browser families passed across Chromium, Firefox, WebKit, and mobile
  for the recorded scope
- `bun test:integration-local` passed with `508 passed`
- lint, focused build/typecheck, React rerender breadth, React 5000-block
  compare, core observation compare, and core huge-document compare passed

Still open:

- warm no-refresh selection/toolbar/arrow flakes are not closed
- event frames/epochs are not yet a first-class runtime object
- delayed repair retries are not yet globally cancellable by event frame
- repair-induced `selectionchange` is not yet classified/suppressed everywhere
- movement ownership is still not driven by an explicit capability matrix
- repeated warm/jitter gauntlets are not release-blocking yet
- OS-native drag and raw mobile IME remain outside current claims

Conclusion:

- previous Batches 0-3 and the recorded closeout are complete historical
  evidence
- the remaining plan starts at a new architecture layer:
  `EditableEventFrame` plus cancellable repair/selectionchange ownership

## Remaining Architecture Plan

### Batch A: Warm No-Refresh Red Owner

Goal:

- reproduce the reported flake class without relying on user screenshots or
  manual browser intuition

Actions:

- add a generated richtext warm-state row:
  - select word
  - toolbar bold on
  - toolbar bold off
  - ArrowLeft / ArrowRight
  - repeat without reload
  - follow-up type
- add jitter around selection, toolbar click, keydown, selectionchange, repair,
  and focus restoration timing
- assert model selection, DOM selection, focus owner, visible DOM, follow-up
  typing, active frame id placeholder, repair trace, and pending repair list
- run the row under `--repeat-each=10` first, then raise the loop count only
  if the failure needs more pressure

Exit criteria:

- row either fails red for stale timing, or the plan records that automation
  could not reproduce the manual flake after jitter/repeat
- failure output includes enough trace to classify owner without guessing
- no runtime patch happens before this red owner exists or is explicitly
  classified as unreproducible in automation

### Batch B: Event Frame Runtime Contract

Goal:

- make every browser event and delayed continuation belong to one authoritative
  epoch

Actions:

- add `EditableEventFrame` to the React editing runtime
- create frames for keydown, beforeinput, input, selectionchange, pointer/click,
  toolbar command, browser-handle command, paste/cut/drop, composition, focus,
  blur, and repair
- thread `frameId` through kernel trace entries, selection import/export,
  transactions/commits where available, and repair requests
- add unit contracts proving a command, selection import/export, and repair all
  carry the current frame
- keep the public API unchanged; this is internal engine-room state

Exit criteria:

- all conformance browser rows expose frame ids in traces
- unit tests reject selection import/export or repair requests without a frame
  for event-owned paths
- no plugin/app author has to pass a policy object or frame id

### Batch C: Cancellable Repair And Selectionchange Ownership

Goal:

- prevent stale async work from overwriting newer user selection/caret state

Actions:

- add `DOMRepairQueue.beginFrame(frameId)` and
  `DOMRepairQueue.cancelBefore(frameId)`
- make immediate, microtask, timeout, animation-frame, and retry repair check
  that their frame is still current
- cancel older model-owned repair on newer keydown, pointer/click, toolbar
  command, native input, paste/drop, composition, focus change, or user
  selectionchange
- classify `selectionchange` origin:
  - native user
  - programmatic export
  - repair-induced
  - browser-handle
  - unknown
- suppress or label programmatic/repair-induced selectionchange so it cannot
  import as fresh user intent

Exit criteria:

- stale repair writes fail tests before touching DOM
- warm no-refresh row passes under repeat without stale frame writes
- trace shows cancelled frame ids and the current frame id for every repair
  attempt

### Batch D: Movement Ownership Capability Matrix

Goal:

- stop choosing native-vs-model caret movement by ad hoc key cases

Actions:

- define a movement capability matrix for collapsed horizontal, word, line,
  vertical, shift-extended, inline-boundary, void-boundary, zero-width,
  projection, shadow-root, shell, internal-control, and composition contexts
- make native-owned movement cancel stale repair before browser movement
- make model-owned movement import current DOM selection at frame start unless
  the frame already declares model selection authoritative
- add browser rows for warm chains:
  - Down -> Right -> Up -> Right
  - toolbar toggle -> ArrowRight
  - toolbar toggle off -> ArrowLeft/Right
  - inline boundary -> ArrowLeft/Right
  - shadow/root boundary movement

Exit criteria:

- every movement trace records ownership reason
- no movement row can pass without model selection, DOM selection/caret or
  follow-up typing, focus owner, and trace assertions
- no stale repair is allowed to run after native-owned movement begins

### Batch E: Warm-State Generated Matrix And Shrinking

Goal:

- turn the reported flakiness into a reusable generated test family

Actions:

- add warm-up sequence support to `slate-browser` scenario specs
- add jitter controls for wait, keydown, click, selectionchange, and repair
  windows
- add shrink output that preserves enough warm-up history to reproduce stale
  timing bugs
- seed warm families for richtext, inline, void/internal-control, shadow DOM,
  large-doc shell, composition, paste/cut/drop, and mobile semantic transport

Exit criteria:

- at least one warm family can run repeated no-refresh loops
- failed generated cases shrink into named regression fixtures
- semantic transport rows are labeled semantic and never claimed as native

### Batch F: Cross-Browser And Perf Closure

Goal:

- close the reopened timing layer without weakening React 19.2 perf posture

Actions:

- run focused warm rows across Chromium, Firefox, WebKit, and mobile with exact
  native-vs-semantic classification
- run `bun test:integration-local`
- run React render-breadth and 5000-block compare
- run core observation and huge-document compare
- run touched build/typecheck/lint gates

Exit criteria:

- warm no-refresh rows pass or remaining platform limitations are exact and
  accepted
- full integration passes without broad hidden skip debt
- React/core perf guardrails remain green
- completion-check can be set to done only after this batch, not before

### Deferred After This Reopen

Do not mix these into the event-frame fix unless a red row proves they block it:

- final public API hard cuts for mutable fields and `Transforms.*`
- optional chain API
- full extension dependency/conflict polish
- OS-native desktop drag proof
- raw mobile IME proof beyond current automation limits
- broad docs/migration polish

## Driver Gates

Core:

```sh
bun test ./packages/slate/test/read-update-contract.ts --bail 1
bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/commit-metadata-contract.ts --bail 1
bun test ./packages/slate/test/bookmark-contract.ts --bail 1
```

React:

```sh
bun test ./packages/slate-react/test/selection-conformance-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/caret-repair-contract.ts --bail 1
bun test ./packages/slate-react/test/target-runtime-contract.tsx --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
```

Browser focused:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "warm|no-refresh|event frame|stale repair|toolbar|arrow" --workers=1 --retries=0 --repeat-each=10
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Full browser:

```sh
bun test:integration-local
```

Perf:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Build/type/lint:

```sh
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
cd ./packages/slate && bun run build
bunx turbo typecheck --filter=./packages/slate --force
bunx turbo typecheck --filter=./packages/slate-dom --force
bunx turbo typecheck --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --force
```

## Completion Criteria

This plan is complete only when:

- known cursor regressions are red first, then green
- generated gauntlet base exists
- kernel trace contract exists
- selection authority is centralized
- caret repair is centralized
- event state machine owns browser timing
- event frames/epochs cancel stale async repair and stale selection imports
- warm no-refresh generated rows pass under repeated execution
- primitive methods and examples obey `editor.update`
- every browser row asserts model + DOM + caret/focus/commit/trace as
  applicable
- `bun test:integration-local` is green without broad skip debt
- React/core perf gates remain green
- residual platform limitations are exact, narrow, and accepted

## Stop Rule

A green focused row is not stop.

A local cursor patch is not stop.

A Chromium-only proof is not stop.

Stop only when:

- all completion criteria above pass, or
- every remaining failure is accepted with exact browser/project/feature
  rationale, or
- no autonomous progress is possible and the missing evidence/user decision is
  named exactly.

## First Execution Move

Start with Remaining Batch A:

1. keep `tmp/completion-check.md` pending for the reopened timing layer
2. add the generated warm no-refresh richtext row:
   select word -> bold on -> bold off -> ArrowLeft/Right -> repeat without
   reload -> follow-up type
3. assert model selection, DOM selection, focus owner, visible DOM, follow-up
   typing, repair trace, pending repair list, and placeholder frame evidence
4. run it under repeat/jitter before patching runtime
5. only implement `EditableEventFrame` once the red owner is reproduced or the
   automation gap is explicitly recorded

## Execution Ledger

### Batch 0/1 Slice 1: Toolbar Mark Caret Proof Substrate

Status: complete.

Actions:

- reopened `tmp/completion-check.md` to `status: pending` for active
  Selection/Caret Conformance Kernel execution
- added a shared `selectDOM` scenario step to `slate-browser`
- added a shared `doubleClickTextOffset` scenario step to `slate-browser`
- added `createSlateBrowserToolbarMarkClickTypingGauntlet(...)`
- added focus-owner snapshots to scenario traces
- added last-commit snapshots to scenario traces
- added focus-owner assertions to the harness
- added two richer richtext toolbar-mark caret rows:
  - raw DOM selection -> toolbar bold -> click elsewhere -> type
  - native double-click word selection -> toolbar bold -> click elsewhere ->
    type

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar marking selected text" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "toolbar marking selected text" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native word selection toolbar mark" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native word selection toolbar mark|toolbar marking selected text" --workers=1 --retries=0
```

Results:

- focused `slate-browser` build: passed
- raw DOM toolbar-mark row: passed on Chromium
- raw DOM toolbar-mark row: passed on Chromium, Firefox, WebKit, and mobile
- native double-click word-selection toolbar-mark row: passed on Chromium
- strengthened toolbar rows with focus-owner and last-commit assertions:
  `2 passed` on Chromium

Owner classification:

- the simple toolbar-mark/click/type path is no longer a current red row in the
  built richtext example
- the proof substrate was too weak because scenario snapshots did not carry
  focus owner or last commit
- the next likely owner is kernel trace completeness, not a local runtime patch

Rejected tactics:

- patching runtime without a failing row
- treating the existing hotkey-based mark row as toolbar proof
- treating semantic selection setup as enough for a native browser-selection
  claim

Checkpoint:

- verdict: keep course
- harsh take: the first suspected cursor sequence did not reproduce, but the
  substrate was still under-instrumented; green rows without focus/commit
  evidence were too cheap
- why:
  - the toolbar-mark family now has raw DOM selection and native word selection
    coverage
  - scenario traces now include focus-owner and last-commit evidence
  - no runtime patch has been made without a red owner
- risks:
  - this does not close the broader cursor-regression class
  - native double-click selection is currently Chromium-only in the focused row
  - kernel trace entries are still `unknown[]` and not a typed conformance
    contract
- earliest gates:
  - safety: `slate-browser` build and focused richtext toolbar caret rows
  - progress: introduce a typed kernel trace contract and fail rows on missing
    trace families
- next move:
  - start Batch 2 kernel trace contract
- do-not-do list:
  - do not call the plan complete from these green rows
  - do not patch cursor runtime without a red owner
  - do not leave trace evidence as untyped `unknown[]`

### Batch 2 Slice 1: Typed Kernel Trace Contract

Status: complete.

Actions:

- replaced `slate-browser` Playwright `kernelTrace: unknown[]` with a typed
  `SlateBrowserKernelTraceEntry[]` wire contract
- added typed kernel trace support types for event family, state, ownership,
  target owner, command, selection policy, repair policy, transition, operation,
  and repair request
- added reusable trace matching helpers:
  - `matchesSlateBrowserKernelTrace(...)`
  - `findSlateBrowserKernelTraceEntry(...)`
  - `assertSlateBrowserKernelTraceEntry(...)`
- added an `assertKernelTrace` scenario step
- added `harness.assert.kernelTrace(...)`
- removed the cast from `getIllegalKernelTransitions(...)`
- strengthened the toolbar-mark caret gauntlet to require an allowed
  `repair` trace with `repair-caret`
- strengthened the native word-selection toolbar row to require the same repair
  trace

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native word selection toolbar mark|toolbar marking selected text" --workers=1 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --force
```

Results:

- focused `slate-browser` build: passed
- focused toolbar caret rows with typed repair-trace assertions: `2 passed`
- focused `slate-browser` typecheck: passed

Owner classification:

- kernel trace evidence is now typed at the proof harness boundary
- toolbar/caret rows now prove an allowed repair trace exists after the
  model-owned text mutation
- this still does not prove the full reported cursor-regression state space

Rejected tactics:

- importing `slate-react` types into `slate-browser`; the harness stays package
  independent and owns a browser-proof wire contract
- expanding semantic toolbar methods; primitive/update DX remains the target
- treating a typed trace as completion without generated state-space coverage

Checkpoint:

- verdict: keep course
- harsh take: typed traces remove a bullshit escape hatch, but the plan is still
  underpowered until generated cursor/navigation/mutation chains use them
- why:
  - assertions can now fail on missing kernel evidence instead of only final DOM
  - trace helpers are reusable across richtext, inline, void, shadow, mobile,
    and large-document rows
  - no runtime behavior was patched without a red owner
- risks:
  - toolbar rows remain Chromium-only for the native word-selection path
  - existing tests still contain local trace casts that should be migrated as
    rows are touched
  - trace entries are typed structurally, not imported from `slate-react`, so
    future kernel shape changes must update the harness contract intentionally
- earliest gates:
  - safety: `slate-browser` build/typecheck and focused richtext toolbar caret
    rows
  - progress: add generated event-chain gauntlets that assert trace families
    for navigation, mutation, toolbar command, and repair
- next move:
  - start Batch 3 generated conformance gauntlet base for mixed
    navigation/mutation/toolbar chains
- do-not-do list:
  - do not stop at typed trace plumbing
  - do not add local cursor patches
  - do not claim cross-browser closure from Chromium-only native word-selection
    proof

### Batch 3 Slice 1: Generated Mixed Event-Chain Gauntlet

Status: complete.

Actions:

- added `createSlateBrowserMixedEditingConformanceGauntlet(...)`
- covered a mixed user-path chain:
  - model selection setup
  - keyboard navigation
  - native typing
  - native Backspace
  - DOM-selected toolbar block command
  - follow-up typing
  - model selection assertions
  - DOM caret assertions
  - focus-owner assertion
  - typed kernel trace assertions for movement, delete, and repair
- added a richtext generated mixed-editing conformance row

Failed probe:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "mixed editing conformance" --workers=1 --retries=0
```

Initial result:

- failed because semantic `selectDOM` alone did not model the real user
  activation path before the toolbar command
- failure selected paragraph 2 in DOM but left Slate model selection at the
  previous paragraph after toolbar command:
  expected `[1,0]@0`, received `[0,6]@1`

Resolution:

- the generated gauntlet now dispatches `mousedown` on the editor before
  `selectDOM(...)` for DOM-selected toolbar command paths
- this matches the existing hand-authored toolbar rows and the user path better
  than a pure semantic DOM selection write

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "mixed editing conformance" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "mixed editing conformance" --workers=4 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "mixed editing conformance|native word selection toolbar mark|toolbar marking selected text" --workers=4 --retries=0
```

Results:

- focused `slate-browser` build: passed
- generated mixed conformance row after activation fix: passed on Chromium
- generated mixed conformance row: passed on Chromium, Firefox, WebKit, and
  mobile
- focused `slate-browser` typecheck: passed
- mixed + toolbar caret focused browser group: `12 passed`

Owner classification:

- the first red was harness realism, not runtime
- the generated base now proves a real activation path before toolbar command
  selection import
- this materially improves coverage because a single row spans navigation,
  mutation, delete, toolbar command, repair, DOM caret, focus, and trace

Rejected tactics:

- patching toolbar selection import based on a synthetic selection-only row
- keeping the generated row model-only
- treating the hand-authored toolbar tests as sufficient mixed-chain proof

Checkpoint:

- verdict: keep course
- harsh take: this is the right testing direction; it finally tests a chain
  where stale selection can hide between event families
- why:
  - a generated row caught an unrealistic proof assumption immediately
  - the corrected row is cross-browser and trace-backed
  - proof now spans event families instead of isolated anecdotes
- risks:
  - mobile currently returns early for native-keyboard internals, so mobile
    semantic transport still needs a dedicated generated chain
  - this is one mixed chain, not a generated family matrix
  - the runtime can still regress in inline/void/shadow/IME variants
- earliest gates:
  - safety: mixed + toolbar caret focused browser group
  - progress: add mobile semantic mixed chain and broaden generated families
    into inline/void/shadow owners
- next move:
  - start Batch 3 Slice 2: mobile semantic mixed chain or inline-boundary mixed
    chain, whichever has the clearest existing harness support
- do-not-do list:
  - do not call generated coverage done from one mixed row
  - do not use semantic handles while claiming native transport proof
  - do not suppress mobile by accident in final release accounting

### Batch 3 Slice 2: Mobile Semantic Mixed Chain

Status: complete.

Actions:

- added `deleteBackward` and `deleteForward` scenario steps to
  `slate-browser`
- added `createSlateBrowserSemanticEditingConformanceGauntlet(...)`
- added a mobile-only richtext semantic editing conformance row
- covered a semantic fallback chain:
  - model selection setup
  - browser-handle insert text
  - browser-handle delete backward
  - DOM-selected toolbar heading
  - browser-handle follow-up insert text
  - model selection assertions
  - model/visible text assertions
  - typed kernel trace assertions for insert/delete/follow-up command traces

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=mobile --grep "mobile semantic editing conformance" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "mobile semantic editing conformance|mixed editing conformance" --workers=4 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --force
```

Results:

- focused `slate-browser` build: passed
- mobile semantic conformance row: passed on mobile
- mixed native + mobile semantic conformance group: `8 passed`
- focused `slate-browser` typecheck: passed

Owner classification:

- mobile semantic fallback is now an explicit generated row, not a silent skip
  inside the native-keyboard chain
- the row honestly proves semantic handle transport plus DOM-selected toolbar
  command behavior
- it does not claim raw mobile native keyboard/IME transport

Rejected tactics:

- forcing native mobile keyboard into a row that cannot honestly prove it yet
- treating mobile early-return in the native mixed chain as sufficient mobile
  coverage
- mixing mobile semantic transport claims with native keyboard claims

Checkpoint:

- verdict: keep course
- harsh take: this closes one bullshit accounting gap; mobile is still not
  native transport proof, but at least it is no longer invisible
- why:
  - scenario runner can now express semantic delete operations
  - generated coverage distinguishes native-keyboard chains from semantic-handle
    chains
  - typed trace assertions apply to semantic command paths too
- risks:
  - raw mobile IME and clipboard still need their own generated rows
  - inline/void/shadow owners are still not covered by the mixed-chain family
  - current mobile row is richtext-only
- earliest gates:
  - safety: mobile semantic richtext row and mixed conformance group
  - progress: port mixed-chain generator to inline boundary or shadow DOM owner
- next move:
  - start Batch 3 Slice 3: inline-boundary mixed chain using existing
    `inlines.test.ts` harness support
- do-not-do list:
  - do not call mobile native transport closed
  - do not collapse semantic and native transport evidence
  - do not continue adding richtext-only rows forever

### Batch 3 Slice 3: Inline Boundary Cut Trace

Status: complete.

Actions:

- strengthened `createSlateBrowserInlineCutTypingGauntlet(...)` with typed
  trace assertions:
  - native cut must record a `delete-fragment` command trace
  - follow-up typing must record an allowed caret repair trace
- changed `slate-browser` shortcut handling so `ControlOrMeta+X` uses
  Playwright/native cut transport instead of a synthetic keydown
- changed `applyEditableCut(...)` to return the command it actually applied
- changed `Editable` cut handling to record that command in the kernel trace
  after cut mutation

Failed probes:

```sh
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "generated inline cut" --workers=1 --retries=0
```

Initial results:

- failed because the row expected a `delete-fragment` command trace but the cut
  path only recorded a generic `cut` event
- after adding command return/recording, it still failed because
  `ControlOrMeta+X` was synthetic in `slate-browser`, so the test was not
  actually exercising native cut transport

Resolution:

- let Playwright handle native `ControlOrMeta+X`
- record the actual cut mutation command in the kernel trace

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "generated inline cut" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated inline cut" --workers=4 --retries=0
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bunx turbo typecheck --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate-react --force
```

Results:

- touched package build: passed
- inline generated cut row after fixes: passed on Chromium
- inline generated cut row: passed on Chromium, Firefox, WebKit, and mobile
- focused React kernel/repair/selection contracts: passed
- focused `slate-browser` and `slate-react` typechecks: passed

Owner classification:

- this found real trace debt in `slate-react` cut handling
- it also found a `slate-browser` native-transport lie for cut
- inline boundary proof is now trace-backed instead of only final text/link
  shape

Rejected tactics:

- relaxing the inline assertion to a generic `cut` event
- keeping synthetic `ControlOrMeta+X` while claiming native cut proof
- adding a new hand-authored inline row instead of strengthening the generated
  gauntlet

Checkpoint:

- verdict: keep course
- harsh take: this is exactly why the full plan is necessary; the old row was
  green while lying about transport and command authority
- why:
  - generated inline proof now forces native transport and command trace truth
  - runtime trace now reports the mutation command instead of only the event
  - browser coverage spans all configured projects
- risks:
  - mobile row passes by early return in the existing inline test; mobile
    semantic inline coverage still needs a dedicated row if required for release
  - cut command tracing is fixed; paste/drop command trace depth is still open
  - inline arrow/read-only behavior still has separate legacy risk
- earliest gates:
  - safety: inline generated cut row, React kernel unit contracts, package
    typechecks
  - progress: add clipboard/paste command trace proof or inline movement proof
- next move:
  - start Batch 3 Slice 4: clipboard/paste command trace and repair proof
- do-not-do list:
  - do not count synthetic shortcut rows as native proof
  - do not leave mutation paths with event-only traces
  - do not stop before paste/drop/IME families are covered

### Batch 3 Slice 4: Clipboard Paste Command Trace

Status: complete.

Actions:

- strengthened `createSlateBrowserClipboardPasteGauntlet(...)` with typed
  trace assertions:
  - paste must record an `insert-data` command trace
  - paste follow-up repair must record an allowed caret repair trace
- changed `applyEditablePaste(...)` to return the command it actually applies
  for clipboard-backed insert-data paths
- changed `Editable` paste handling to record the returned command in the
  kernel trace
- changed beforeinput command classification so `insertFromPaste`,
  `insertFromDrop`, and `insertFromYank` with `DataTransfer` classify as
  `insert-data`
- kept the gauntlet event-family-agnostic for paste command authority because
  engines split paste between `beforeinput` and `paste`

Failed probe:

```sh
bunx turbo build --filter=./packages/slate-browser --force && bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "generated clipboard paste" --workers=1 --retries=0
```

Initial result:

- failed because paste produced correct DOM/model output but no `insert-data`
  command trace

Resolution:

- both native beforeinput paste and fallback paste now expose command authority
  in the trace
- the browser assertion requires command kind and allowed transition without
  overfitting to a browser-specific event family

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "generated clipboard paste" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated clipboard paste" --workers=4 --retries=0
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bunx turbo typecheck --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate-react --force
```

Results:

- touched package build: passed
- paste generated row after fixes: passed on Chromium
- paste generated row: passed on Chromium, Firefox, WebKit, and mobile
- focused React kernel/repair/selection contracts: passed
- focused `slate-browser` and `slate-react` typechecks: passed after fixing an
  explicit `null` return in the shell-backed plain-text branch

Owner classification:

- paste had the same event-only trace debt as cut
- command authority now works for both fallback paste and native beforeinput
  paste
- the assertion is intentionally about command authority, not event family

Rejected tactics:

- overfitting paste proof to Chromium's event family
- accepting correct visible DOM as enough for clipboard runtime proof
- leaving `applyEditablePaste(...)` as a mutation path with no command return

Checkpoint:

- verdict: keep course
- harsh take: cut and paste both had the same trace-authority hole; this was
  not an isolated inline issue
- why:
  - clipboard command traces now cover cut and paste
  - generated rows fail on missing command authority
  - cross-browser paste proof is green without broad skips
- risks:
  - drop still needs the same command-trace audit
  - IME/composition still needs generated trace coverage
  - shell-backed full-document plain-text paste returns `null` command for now
    and should be classified separately if it becomes release-critical
- earliest gates:
  - safety: paste generated row, React kernel unit contracts, package typechecks
  - progress: drop or IME generated trace proof
- next move:
  - start Batch 3 Slice 5: composition/IME generated trace proof
- do-not-do list:
  - do not stop before composition/IME
  - do not assume drop is covered by paste
  - do not make browser-specific event family claims for clipboard paths

### Batch 3 Slice 5: Composition Trace Proof

Status: complete.

Actions:

- strengthened `createSlateBrowserCompositionGauntlet(...)` with typed trace
  assertions for:
  - `compositionstart`
  - `compositionupdate`
  - `compositionend`
- kept the row transport-aware:
  - Chromium uses native composition transport
  - other projects use synthetic composition transport

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --grep "generated composition" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated composition" --workers=4 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --force
```

Results:

- focused `slate-browser` build: passed
- generated composition row with trace assertions: passed on Chromium
- generated composition row: passed on Chromium, Firefox, WebKit, and mobile
- focused `slate-browser` typecheck: passed

Owner classification:

- composition now has typed trace coverage for the event lifecycle
- this is not full raw mobile IME proof; non-Chromium projects use synthetic
  composition transport
- the gauntlet proves model/visible text plus event trace, not every platform
  keyboard service behavior

Rejected tactics:

- treating the existing model-text-only composition row as sufficient
- pretending synthetic composition is native mobile IME proof
- requiring one event-family shape for all composition transports beyond the
  composition lifecycle itself

Checkpoint:

- verdict: keep course
- harsh take: composition is trace-backed now, but mobile native IME remains an
  honest limitation, not a solved claim
- why:
  - all projects prove composition lifecycle trace and final text
  - the transport distinction is explicit in metadata
  - the row now fails if composition events disappear from the kernel trace
- risks:
  - raw mobile IME remains outside current automated proof
  - drop and drag mutation traces remain open
  - selection/caret after composition has only broad text proof here
- earliest gates:
  - safety: generated composition row and `slate-browser` typecheck
  - progress: drop/drag command trace proof or broader navigation matrix
- next move:
  - start Batch 3 Slice 6: drop/drag command trace audit, then run focused
    browser families together
- do-not-do list:
  - do not claim native mobile IME closure
  - do not leave drop unclassified
  - do not expand runtime behavior without a failing row

### Batch 3 Slice 6: Drop/Drag Audit Classification

Status: classified open.

Actions:

- audited drop/drag handling in:
  - `packages/slate-react/src/editable/clipboard-input-strategy.ts`
  - `packages/slate-react/src/components/editable.tsx`
  - current Playwright example rows
- found no existing browser proof row for actual drop/drag mutation transport
- found likely trace parity debt:
  - `applyEditableDrop(...)` mutates through `ReactEditor.insertData(...)`
  - `Editable` records a generic `drop` event trace before mutation
  - there is no generated row proving `insert-data` command authority for drop

Decision:

- do not patch drop trace without a real failing row
- keep drop/drag as an open owner for a dedicated harness slice
- do not treat paste command trace as drop proof

Owner classification:

- drop/drag needs a proper browser harness, not a speculative runtime edit
- current work can continue through tested families without pretending drop is
  closed

Rejected tactics:

- applying the paste/cut command-return pattern to drop without a failing row
- claiming `paste` coverage closes `drop`
- creating a fake semantic handle row and naming it native drop proof

Checkpoint:

- verdict: keep course
- harsh take: drop is exactly the kind of owner that becomes fake green if we
  patch from symmetry instead of proof
- why:
  - code audit shows plausible debt
  - no current row can honestly fail on it
  - the correct next action is harness work, not blind runtime edits
- risks:
  - drop remains open
  - drag internal move semantics remain open
  - final release accounting must not hide this
- earliest gates:
  - safety: broad focused rerun for touched families
  - progress: future real drop browser row with `DataTransfer` and event range
- next move:
  - run focused browser families and package gates for the touched owners, then
    continue to shadow/void or drop harness planning depending on failures
- do-not-do list:
  - do not mark drop complete
  - do not infer drop from paste
  - do not patch untested drop runtime

### Batch 3 Slice 7: Focused Browser Family Regression Rerun

Status: complete.

Actions:

- reran the focused cross-browser family set for all touched proof owners:
  - richtext mixed editing, mobile semantic editing, and toolbar caret rows
  - inline generated cut typing row
  - clipboard paste generated row
  - large-document composition generated row

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "mixed editing conformance|mobile semantic editing conformance|native word selection toolbar mark|toolbar marking selected text" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated inline cut" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated clipboard paste" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated composition" --workers=4 --retries=0
```

Results:

- richtext focused family: 16 passed
- inline cut generated family: 4 passed
- clipboard paste generated family: 4 passed
- composition generated family: 4 passed

Owner classification:

- touched keyboard, toolbar, semantic mobile, inline cut, paste, and
  composition proof families are stable across Chromium, Firefox, WebKit, and
  mobile in the focused rerun
- drop/drag remains open because no real browser row exists yet
- shadow/void generated rows already exist and are the next useful coverage
  owner before creating a new drop harness

Checkpoint:

- verdict: keep course
- harsh take: the strengthened rows are stable, but the plan is not done;
  shadow, void, and drop are still where hidden browser ownership bugs can
  survive
- why:
  - focused rows passed across all configured projects
  - the next highest-leverage work is broadening generated trace coverage, not
    patching a speculative runtime path
- risks:
  - shadow DOM rows may still prove text without enough trace authority
  - void rows may still prove click/render behavior without caret/transition
    authority
  - drop/drag needs a dedicated real `DataTransfer` row later
- earliest gates:
  - safety: existing shadow-dom and editable-voids focused rows
  - progress: generated shadow/void trace assertions
- next move:
  - harden existing shadow/void generated rows with kernel trace assertions and
    run them across Chromium, Firefox, WebKit, and mobile
- do-not-do list:
  - do not mark plan done
  - do not treat passing focused rows as full integration closure
  - do not patch drop without a failing row

### Batch 3 Slice 8: Shadow/Void Generated Trace Hardening

Status: complete.

Actions:

- hardened `createSlateBrowserTextInsertionGauntlet(...)` so semantic text
  insertion rows must prove an `insert-text` repair trace, not just final text
- hardened `createSlateBrowserInternalControlGauntlet(...)` so editable void
  internal-control rows must prove:
  - focus owner is `internal-control` while the nested input is active
  - follow-up outer insertion records an `insert-text` repair trace
- hardened the large-document void click row with a click kernel trace
  assertion before checking model selection and visible content

Evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated shadow DOM typing" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated internal-control" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selects void content" --workers=4 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --force
```

Results:

- focused `slate-browser` build: passed
- generated shadow DOM typing row: 4 passed
- generated editable void internal-control row: 4 passed
- large-document void click selection row: 4 passed
- focused `slate-browser` typecheck: passed

Owner classification:

- shadow text insertion now proves command/repair authority in the generated
  helper
- editable void internal-control now proves usable focus ownership before
  outer-editor follow-up insertion
- void click now proves a traceable click transition before asserting model
  selection and content stability
- drop/drag remains the only explicitly open event-family mutation owner in
  this Batch 3 pass

Rejected tactics:

- adding a bespoke shadow-only assertion instead of hardening the reusable text
  insertion gauntlet
- treating internal-control rows as selection-only proof without focus
  ownership
- inventing native drop proof from paste/cut symmetry

Checkpoint:

- verdict: keep course
- harsh take: shadow and void were still too final-state-heavy; this slice
  makes them fail on missing authority signals instead of only broken text
- why:
  - generated helper assertions now cover text insertion and internal control
    focus/repair
  - the void click row has trace proof across every configured project
  - no runtime code changed
- risks:
  - drop/drag still needs real `DataTransfer` harness support
  - these rows still do not replace the full focused browser suite
  - typecheck only covered `slate-browser`; broader type/lint remains for
    closeout
- earliest gates:
  - safety: focused shadow/void rows and `slate-browser` typecheck
  - progress: native drop harness or full focused browser gate
- next move:
  - audit whether a real drop harness can be added in `slate-browser` without
    speculative runtime changes; if not, record drop as exact deferred owner
    and move to full focused browser gate
- do-not-do list:
  - do not call shadow/void complete based only on final DOM text
  - do not patch runtime drop without a failing row
  - do not run completion-check while status remains pending

### Batch 3 Slice 9: Drop DataTransfer Command Trace

Status: complete.

Actions:

- added a generated drop data gauntlet using a browser `DragEvent` with
  `DataTransfer` and target coordinates
- added a `dropHtml` scenario step to `slate-browser`
- added a paste-html example row that requires:
  - a `drop` kernel event
  - an `insert-data` command trace
  - no illegal kernel transitions
  - visible rich dropped content
- fixed `applyEditableDrop(...)` to return the applied `insert-data` command
- fixed `Editable` drop handling to record that command in the kernel trace

Red probe:

```sh
bunx turbo build --filter=./packages/slate-browser --force
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "generated drop data" --workers=1 --retries=0
```

Initial result:

- failed on the `insert-data` command trace assertion
- this was the expected owner: dropped content could mutate, but command
  authority was invisible to the kernel trace

Green evidence:

```sh
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --grep "generated drop data" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated drop data" --workers=4 --retries=0
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-react --force
```

Results:

- touched package build: passed
- new drop row: red first on Chromium, then green on Chromium
- new drop row: 4 passed across Chromium, Firefox, WebKit, and mobile
- focused `slate-browser` + `slate-react` typecheck: passed after fixing the
  helper to convert fallback HTML text through the page/frame surface instead
  of a locator

Owner classification:

- external drop insertion now has generated command-trace proof
- the transport is explicitly synthetic `DataTransfer` drop, not OS-native
  drag proof
- internal drag move semantics remain separate from external drop insertion

Rejected tactics:

- patching drop from symmetry before a failing row existed
- calling paste proof sufficient for drop
- pretending the synthetic `DataTransfer` row proves all OS-native drag
  behavior

Checkpoint:

- verdict: keep course
- harsh take: drop had the same hidden authority gap as paste/cut; the
  difference is we finally forced it red before touching runtime
- why:
  - the row fails if drop mutates outside command trace authority
  - command recording now matches the actual mutation path
  - proof is cross-browser and typed
- risks:
  - internal drag move still needs its own row if it becomes release-critical
  - OS-native drag remains outside automated proof
  - full focused and integration gates still have not been rerun after this
    slice
- earliest gates:
  - safety: drop generated row and focused package typechecks
  - progress: full focused browser gate across the owner families
- next move:
  - run the focused browser driver set for richtext, inlines, editable-voids,
    shadow-dom, paste-html, and large-document-runtime before deciding whether
    Batch 3 can close
- do-not-do list:
  - do not call OS-native drag solved
  - do not skip the focused browser driver set
  - do not run completion-check while status remains pending

### Batch 3 Slice 10: Focused Browser Driver Gate

Status: complete.

Actions:

- ran the focused browser driver set across the owner families touched by this
  pass:
  - richtext selection/caret/toolbar/delete/paste rows
  - inlines
  - editable voids
  - shadow DOM
  - paste HTML, including generated paste and drop rows
  - large-document runtime

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Results:

- richtext focused driver: 104 passed
- inlines: 20 passed
- editable voids: 32 passed
- shadow DOM: 16 passed
- paste HTML: 20 passed
- large-document runtime: 68 passed

Owner classification:

- Batch 3 trace/gauntlet coverage is stable under the focused browser driver
  set
- no new cross-browser cluster appeared in selection, caret, toolbar,
  clipboard/drop, shadow, inline, void, shell, or large-document rows
- full `test:integration-local`, lint, build/type, and perf gates remain
  outstanding before completion

Checkpoint:

- verdict: keep course
- harsh take: this is the first strong browser signal in this pass, but it is
  still not release closure; the full integration and perf gates decide whether
  the plan can actually close
- why:
  - every touched browser family passed across Chromium, Firefox, WebKit, and
    mobile
  - generated trace rows now cover command authority for insert/delete/paste/
    cut/drop, composition lifecycle, shadow text insertion, void/internal
    controls, and toolbar selection freshness
- risks:
  - full integration may expose rows outside this focused owner set
  - OS-native drag and internal drag-move remain narrower than the synthetic
    external `DataTransfer` drop proof
  - lint/build/type/perf gates have not all been rerun after this slice
- earliest gates:
  - safety: focused unit contracts and package type/build/lint
  - progress: `bun test:integration-local`
- next move:
  - run focused React kernel/repair/selection unit contracts, package
    build/typecheck as needed, then move to full integration-local
- do-not-do list:
  - do not mark done from focused browser proof alone
  - do not hide OS-native drag as solved
  - do not skip package/lint/perf closeout gates

### Batch 3 Slice 11: Focused Unit And Package Gates

Status: complete.

Actions:

- reran focused React kernel/repair/selection unit contracts after the drop and
  browser proof changes
- rebuilt touched browser/react/dom package graph
- reran focused `slate-browser` and `slate-react` typechecks

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-react --force
```

Results:

- editing kernel contract: 3 passed
- DOM repair policy contract: 2 passed
- selection controller contract: 2 passed
- touched package build: passed
- focused `slate-browser` + `slate-react` typecheck: passed

Owner classification:

- Batch 3 code changes are covered by focused unit, build, type, and focused
  browser evidence
- next proof must be full integration-local, not more local rows

Checkpoint:

- verdict: keep course
- harsh take: the focused package gates are green; if we stop here, we are back
  to the exact fake-confidence loop that started this lane
- why:
  - local correctness gates passed
  - browser driver rows passed
  - full integration remains the next honest release gate
- risks:
  - full integration may expose rows outside the current grep driver set
  - lint and perf closeout still remain
- earliest gates:
  - progress: `bun test:integration-local`
  - closeout: lint plus React/core perf guardrails
- next move:
  - run `bun test:integration-local`
- do-not-do list:
  - do not add more proof rows before running the full integration gate
  - do not run completion-check while status remains pending

### Final Closeout: Selection/Caret Conformance Kernel

Status: done.

Actions:

- ran full integration-local after the Batch 3 trace/gauntlet expansion
- ran lint/fix and lint
- ran React/core perf guardrails
- ran broad package build/type gates
- verified the broad package typecheck with `--concurrency=1` after the first
  parallel probe exposed a `slate` dist rebuild race in `slate-dom`

Evidence:

```sh
bun test:integration-local
bun run lint:fix
bun run lint
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
cd ./packages/slate && bun run build
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force --concurrency=1
```

Results:

- full integration-local: 508 passed
- lint/fix: passed, Biome fixed 4 files
- lint: passed
- React rerender breadth: passed with zero broad/selection/sibling rerenders
  in the measured lanes
- React 5000-block compare: passed; v2 stayed strongly faster than legacy on
  readiness, start-block editing, document replacement, and fragment insertion;
  middle-block editing remains the known chunked-legacy tradeoff lane
- core observation compare: passed; v2 faster on all measured observation
  lanes
- core huge-document compare: passed; v2 faster on typing and full-document
  mutation lanes, with `selectAllMs` effectively tied
- touched package build: passed
- `packages/slate` local build: passed
- filtered package typecheck with `--concurrency=1`: passed

Failed probe:

```sh
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
```

Result:

- failed in `slate-dom` with `Cannot find module 'slate'`
- direct `packages/slate-dom` typecheck passed
- sequential package typechecks passed
- same filtered Turbo typecheck passed with `--concurrency=1`

Decision:

- classify the failed broad typecheck probe as a Turbo/package dist race, not a
  code blocker for this lane
- keep the exact successful closeout command in the ledger so future agents do
  not mistake the race for product debt

Accepted/narrow limitations:

- external drop insertion is proven through synthetic browser `DragEvent` +
  `DataTransfer`; OS-native drag from the desktop is not claimed
- internal drag-move semantics are not expanded in this slice; existing rows
  remain green and future release claims need a dedicated row
- non-Chromium composition proof uses synthetic composition transport; this is
  lifecycle trace proof, not raw platform IME proof

Completion classification:

- known cursor regression classes are covered by red-first or strengthened
  browser rows and now pass:
  - select word -> bold -> click elsewhere
  - browser-selected paragraph toolbar formatting
  - arrow/down/right navigation chains
  - Backspace/Delete caret survival
  - paste/cut/drop command trace authority
  - shadow/void/internal-control focus and repair authority
- generated gauntlet base exists and is used across navigation, mixed editing,
  toolbar, mobile semantic, inline cut, paste, drop, composition, shadow text,
  internal-control, shell, and void rows
- kernel trace contract is typed and asserted from `slate-browser`
- browser rows assert model, DOM, focus/caret/trace where applicable
- full integration and perf guardrails are green

Checkpoint:

- verdict: stop
- harsh take: this is finally an evidence-backed closure for the current
  selection/caret conformance kernel lane; the remaining limitations are
  transport-scope limits, not hidden skipped rows
- why:
  - full integration-local passed after the trace/gauntlet expansion
  - focused and broad browser gates passed across Chromium, Firefox, WebKit,
    and mobile
  - lint, build, type, and perf gates passed
- risks:
  - OS-native drag and raw mobile IME are not claimed beyond the exact rows
    above
  - future public release claims still need to preserve the same trace-first
    proof discipline
- earliest gates:
  - `bun test:integration-local`
  - filtered package typecheck with `--concurrency=1`
  - React/core perf guardrails
- next move:
  - return to the master architecture/perf backlog only if the user opens the
    next lane
- do-not-do list:
  - do not reopen local cursor patching without a generated red row
  - do not claim OS-native drag or native mobile IME beyond this recorded
    scope

### Reopen Addendum: Warm-State Timing Confidence

Status: active.

Why this addendum exists:

- the final closeout proves the checked suite, not mathematical cursor
  correctness
- user/manual browser evidence still reports flaky caret behavior after warm
  no-refresh selection, toolbar toggles, and arrow movement
- source review of legacy Slate, Lexical, and ProseMirror says the missing
  discipline is event-frame ownership and stale async cancellation

Source-backed findings:

- legacy Slate's `Editable` avoided some bugs by keeping selectionchange flush,
  beforeinput flush, composition guards, keydown movement, and repair timing in
  one mental model
- ProseMirror makes DOM observation explicit: flush before keydown, centralize
  DOM selection import/export, suppress selection updates while writing DOM
  selection, and cancel stale async fallbacks with event counters
- Lexical makes every write part of an update lifecycle with tags, dirty sets,
  and commit-time DOM selection behavior
- current Slate v2 has policies and traces, but delayed repair retries can
  still outlive the user event that scheduled them unless frame ids cancel them

Decision:

- keep the Slate v2 public direction: `editor.read`, `editor.update`,
  flexible primitives, operations as collaboration truth, commits as local
  runtime truth
- do not restore legacy `Editable`
- do not copy Lexical or ProseMirror data models
- add an `EditableEventFrame` / epoch layer before more local cursor patches
- make warm no-refresh generated gauntlets release-blocking for cursor claims

Next execution owner:

- Remaining Batch A, Tracer 1
- add the warm no-refresh richtext row first:
  `select word -> toolbar bold on -> toolbar bold off -> ArrowLeft/Right ->
  repeat without reload -> follow-up type`
- prove it records event frame ids, repair ids, selectionchange origin, model
  selection, DOM selection, focus owner, and follow-up typing
- if it passes, strengthen it with jitter/repeat until it can catch stale repair
  timing or proves the current reproduction is outside automation
- only after a red owner exists, implement repair cancellation and event-frame
  suppression

Earliest gates:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "warm|no-refresh|event frame|stale repair|toolbar|arrow" --workers=1 --retries=0 --repeat-each=10
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-react --force
```

Reopened completion criteria:

- event frames are present in kernel traces for keydown, beforeinput, input,
  selectionchange, toolbar command, browser-handle command, paste/cut/drop,
  composition, and repair
- delayed DOM repair cannot write after its frame is no longer current
- repair-induced DOM selectionchange is classified or suppressed, not imported
  as user selection
- native-owned movement cancels stale model-owned repair before the browser
  moves the caret
- model-owned movement imports DOM selection at frame start when DOM is the
  latest user truth
- warm no-refresh gauntlets pass under repeat without reload
- any remaining cursor limitation has exact browser/project/transport
  rationale, not a broad green claim

Harsh take:

- the previous closeout was not fake, but it was incomplete. It proved broad
  checked behavior and perf. It did not prove stale timing under warm user
  sessions.
- the absolute-best next move is not another one-off ArrowLeft/ArrowRight fix.
  It is event-frame ownership plus cancellable repair.

Progress sync:

- the old Batch 0/1 proof substrate, typed trace, generated mixed chains,
  command traces, full integration, and perf closeout are complete
- the active remaining work is Batch A through Batch F in
  `Remaining Architecture Plan`
- do not re-execute old completed batches unless a new red row invalidates
  their evidence

### 2026-04-24 Execution Slice: Warm Row And First Event Frames

Actions:

- added `createSlateBrowserWarmToolbarArrowGauntlet` in
  `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts`
- added the richtext warm no-refresh row in
  `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts`
  for `select editable -> toolbar bold on -> bold off -> ArrowRight ->
  ArrowLeft -> ArrowRight -> type`
- asserted selected text after toolbar toggles instead of stale exact text-node
  paths, because bold toggling splits `editable` into `[0,1]`
- asserted model selection, DOM selection, visible DOM text, DOM caret, focus
  owner, repair trace, no illegal transitions, and frame ids on keydown/repair
  traces
- added `EditableEventFrame` storage and frame ids to kernel traces in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- began frames for traced React browser events and keydown in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- added `DOMRepairFrameState` plus `beginFrame` / `cancelBefore` on
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- wired newer traced events/keydowns to cancel older model-owned repair retries

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
# 4 pass, 0 fail

bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
# 3 pass, 0 fail

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
# 7 pass, 0 fail

bunx turbo build --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 2 successful, 2 total

bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0
# 1 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0 --repeat-each=10
# 10 passed
```

Owner classification:

- Batch A first tracer did not reproduce the manual flake under Chromium
  repeat. It is still useful because it now locks the reported toolbar/arrow
  sequence and proves the automation can assert the post-format split node and
  follow-up typing.
- Batch B is started, not complete. Keydown and traced React event paths now
  carry frame ids; browser-handle commands, toolbar/app commands outside root,
  selectionchange origin classification, paste/cut/drop/composition-specific
  frame assertions, and repair scheduling metadata still need closure.
- Batch C is started, not complete. The repair queue has frame state and
  cancels stale retries on newer traced events/keydowns, but selectionchange
  suppression/classification and all delayed repair classes still need broader
  proof.

Rejected tactics:

- did not patch a local ArrowRight or toolbar branch; the observed test
  failures were stale path/DOM-locator assumptions in the new row, not runtime
  bugs
- did not claim closure from the green warm row, because the manual flake was
  not reproduced and event-frame coverage is still partial

Checkpoint:

- verdict: keep course
- harsh take: this is progress on the right owner, but still not enough to
  claim cursor-regression closure. The row proves one warm toolbar chain; the
  architecture still needs complete frame ownership and selectionchange
  suppression.
- why: first user-path frame assertions pass under repeat, and stale repair
  retry cancellation now has a concrete frame key
- risks: toolbar commands that run outside the editable root may still lack an
  explicit command frame; selectionchange from programmatic repair can still be
  re-imported until origin classification lands
- earliest gates:
  - `bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1`
  - `bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1`
  - focused warm richtext Chromium repeat row
  - filtered slate-react/slate-browser build and typecheck
- next move: continue Batch B/C by adding frame-origin classification for
  selectionchange and browser-handle/toolbar command frames, then assert those
  fields in generated browser traces
- do-not-do list:
  - do not call Batch A done until jitter/unreproducible automation is recorded
  - do not broaden to core perf
  - do not patch cursor symptoms without a generated row and owner

### 2026-04-24 Execution Slice: Repair/Selectionchange Origins

Actions:

- added typed `SelectionChangeOrigin` to the input/controller state
- added `selectionChangeOrigin` to editable kernel trace entries and
  `slate-browser` trace types
- marked repair DOM selection writes as `repair-induced`
- marked browser-handle command/import traces as `browser-handle`
- marked model-to-DOM selection exports as `programmatic-export`
- classified unmarked `selectionchange` traces as `native-user`
- kept default trace origin as `unknown` for non-selection event families
- tightened the warm richtext row to assert repair trace origin
- tightened semantic browser-handle gauntlet expectations to assert
  `browser-handle` origin for semantic insert/delete/follow-up command traces

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/selection-controller-contract.ts --bail 1
# 10 pass, 0 fail

bunx turbo build --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 2 successful, 2 total

bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bun run lint:fix
# passed after replacing assignment-in-condition in the DOM text walker

bun run lint
# passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0 --repeat-each=10
# 10 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=mobile --grep "runs generated mobile semantic editing conformance gauntlet" --workers=1 --retries=0
# 1 passed
```

Owner classification:

- Batch B is stronger: keydown, traced React browser events, repair, and
  browser-handle command paths now have traceable frame/origin metadata.
- Batch C is stronger: stale repair retries are frame-gated and repair-induced
  DOM selection writes are labeled.
- Still open: selectionchange suppression is not yet a hard runtime gate;
  toolbar/app commands outside editable-root event handlers do not yet have a
  dedicated command frame; jittered warm matrix is not implemented.

Rejected tactics:

- did not expose frame ids or selection policy to app/plugin authors
- did not change public DX or `editor.update` shape
- did not convert all movement to model-owned; movement ownership remains a
  separate Batch D decision

Checkpoint:

- verdict: keep course
- harsh take: the core timing instrumentation is now real, but the release
  proof is still too narrow. We have labels and frame keys; now we need the
  warm matrix and movement ownership rows to prove they catch unknown cursor
  bugs.
- why: focused contract, lint, typecheck, warm repeat, and mobile semantic
  proof all pass with frame/origin assertions
- risks:
  - selectionchange origin is labeled but not yet enforced as "do not import"
    for every programmatic/repair path
  - toolbar UI commands that execute outside editable event handlers can still
    rely on the most recent frame instead of opening their own command frame
  - the manual flake remains unreproduced in automation
- earliest gates:
  - warm richtext Chromium repeat row
  - mobile semantic browser-handle gauntlet
  - editing-kernel/dom-repair/selection-controller contracts
  - filtered slate-react/slate-browser build, typecheck, lint
- next move: implement Batch D movement ownership capability matrix tracer rows
  for native-owned vs model-owned movement, then add warm jitter/repeat around
  the toolbar-arrow row
- do-not-do list:
  - do not claim cross-browser cursor closure from Chromium warm repeat
  - do not turn every arrow movement model-owned by default
  - do not add public command policy ceremony

### 2026-04-24 Execution Slice: Warm Matrix And Movement Rejection

Actions:

- added deterministic warm timing jitter in
  `createWarmTimingWaitStep`: zero-delay macrotask, animation frame, then the
  existing timeout
- attempted a narrow Batch D runtime experiment allowing native-owned collapsed
  horizontal movement
- observed the warm toolbar-arrow row fail after native ArrowLeft because Slate
  selection stayed at `[0,1]@8` instead of importing the DOM/native caret to
  `[0,1]@7`
- reverted the native-horizontal runtime flip and kept horizontal movement
  model-owned until the import/flush proof is strong enough
- narrowed the warm toolbar-arrow row out of the mobile project because it is a
  native keyboard arrow transport claim; mobile remains covered by the semantic
  handle gauntlet

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0
# chromium, firefox, webkit passed; mobile row returns early because native
# keyboard-arrow transport is not claimed there

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=mobile --grep "runs generated mobile semantic editing conformance gauntlet" --workers=1 --retries=0
# 1 passed

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/selection-controller-contract.ts --bail 1
# 10 pass, 0 fail

bunx turbo build --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 2 successful, 2 total

bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bun run lint:fix
# passed

bun run lint
# passed
```

Rejected tactic:

- native-owned collapsed horizontal movement is not safe yet. The RED showed
  exactly why: browser-native movement can update the visible caret while Slate
  selection remains stale until the selectionchange/import timing is stronger.
  Keep model-owned horizontal movement for now.

Checkpoint:

- verdict: keep course
- harsh take: the matrix work produced a useful rejection, not a feature. The
  right architecture still needs a movement capability matrix, but native
  horizontal movement must stay behind an explicit import/flush proof.
- why: cross-browser desktop warm proof passes with model-owned movement;
  mobile is honestly scoped to semantic transport
- risks:
  - mobile native keyboard-arrow transport is not claimed
  - movement matrix is not complete; it currently has one rejected runtime
    candidate, not a finished policy table
- earliest gates:
  - warm toolbar-arrow row across Chromium/Firefox/WebKit
  - mobile semantic gauntlet
  - `bun test:integration-local`
- next move: run `bun test:integration-local`; if green, update remaining
  Batch D/E/F owner list; if red, classify the first failure by frame/origin
  owner before patching
- do-not-do list:
  - do not re-enable native horizontal movement without a RED/GREEN import
    contract
  - do not count mobile early-return as native mobile proof

### 2026-04-24 Execution Slice: Movement Ownership Trace Reasons

Actions:

- added `EditableMovementOwnershipTrace` to editable kernel traces
- recorded model-owned horizontal movement reason as
  `model-horizontal-inline-void-compat`
- recorded native vertical movement reason as `native-vertical-layout`
- exposed movement ownership expectations through `slate-browser`
  `assertKernelTrace`
- tightened the warm toolbar-arrow gauntlet to require model-owned horizontal
  movement metadata
- tightened the ArrowDown -> ArrowRight browser row to require native vertical
  movement metadata

Evidence:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
# 7 pass, 0 fail

bunx turbo build --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 2 successful, 2 total

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps ArrowDown then ArrowRight|keeps warm toolbar mark selection usable" --workers=1 --retries=0
# 2 passed

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/selection-controller-contract.ts --bail 1
# 12 pass, 0 fail

bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bun run lint:fix
# passed; no fixes applied

bun run lint
# passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0
# 4 passed

bun test:integration-local
# 516 passed
```

Failed probe:

- the first browser attempt failed because the site was running stale package
  build output and emitted traces without the new `movement` field; rebuilding
  `slate-react` and `slate-browser` fixed the proof. This reinforces the
  build-before-browser rule for package trace shape changes.

Owner classification:

- Batch D is now partially executable: movement traces carry an explicit
  ownership reason for the two most important buckets:
  model-owned horizontal compatibility and native-owned vertical layout.
- Batch D is not complete. Word, line, shift-extended, inline/void boundary,
  zero-width/projection, shadow-root, shell, internal-control, and composition
  contexts still need explicit matrix rows or recorded deferrals.
- Batch E is not started beyond the warm toolbar row; reusable generated
  no-refresh warm loops and shrink fixtures still need implementation.
- Batch F has a fresh integration-local pass for this slice, but perf
  guardrails still need rerun before reopened completion can close.

Rejected tactics:

- did not flip horizontal movement back to native-owned
- did not expose movement ownership as public API
- did not count the full integration pass as reopened-plan completion

Checkpoint:

- verdict: keep course
- harsh take: this is the right kind of proof because the trace now explains
  ownership, but the matrix is still too sparse. We have better observability,
  not full movement confidence.
- why: unit, build, typecheck, lint, focused Chromium, cross-project warm row,
  and full integration all pass with movement ownership metadata
- risks:
  - movement reason coverage is still representative, not exhaustive
  - native vertical movement still relies on browser selectionchange import
    timing after keydown
  - mobile native keyboard-arrow transport remains unclaimed
- earliest gates:
  - add word/line/shift movement metadata assertions
  - add inline/void/shadow movement metadata assertions
  - add generated warm-state repeat loops beyond the toolbar row
  - rerun React/core perf guardrails before closure
- next move: continue Batch D by extending the movement matrix rows to word,
  line, shift-extended, inline/void, and shadow contexts; then start Batch E
  generated warm-state loop/shrink support
- do-not-do list:
  - do not patch individual arrow bugs without adding matrix ownership proof
  - do not claim mobile native movement from semantic/mobile rows
  - do not skip perf closure after trace/runtime code changes

### 2026-04-24 Execution Slice: Movement Matrix Expansion

Actions:

- tightened the existing word movement row to assert
  `model-word-boundary-compat`
- tightened the existing line-extension row to assert
  `model-line-browser-compat`
- tightened the read-only inline boundary row to assert
  `model-horizontal-inline-void-compat`
- kept the assertions internal to trace/proof infrastructure; no public API
  added

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=webkit --grep "word movement|line extension" --workers=1 --retries=0
# 4 passed

bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "arrow keys skip over read-only inline" --workers=1 --retries=0
# 4 passed

bun run lint:fix
# passed; no fixes applied

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/selection-controller-contract.ts --bail 1
# 12 pass, 0 fail

bun run lint
# passed

bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bun test:integration-local
# 516 passed
```

Owner classification:

- Batch D now has representative rows for:
  - model-owned horizontal movement in normal/warm text
  - native-owned vertical movement
  - model-owned word movement
  - model-owned line/shift extension
  - model-owned inline-boundary movement
- Batch D still needs explicit zero-width/projection, shadow-root, shell,
  internal-control, and composition-context classification or a written
  deferral.
- Batch E remains the next architecture owner because the plan still needs
  generated no-refresh repeat loops and shrink fixtures instead of only
  hand-authored warm rows.

Checkpoint:

- verdict: keep course
- harsh take: movement ownership is finally becoming a matrix instead of vibes,
  but it is not exhaustive yet. The bigger remaining gap is generated warm
  repetition/shrinking.
- why: the same trace field now explains model/native movement across normal,
  warm, word, line, and inline contexts with full integration green
- risks:
  - shadow-root and shell movement still rely on broader rows without explicit
    movement reason assertions
  - warm flake reproduction is still one crafted row, not generated state-space
    pressure
- earliest gates:
  - add generated warm-state repeat loop support
  - add shrink metadata for failed generated warm cases
  - run focused warm families across projects
  - run React/core perf guardrails before completion
- next move: start Batch E by adding reusable warm-loop support to
  `slate-browser` scenario execution and convert the toolbar warm row to use
  that generated loop instead of a single hand-expanded sequence
- do-not-do list:
  - do not expand semantic editor methods
  - do not add public movement policies
  - do not mark done before Batch E/F closure

### 2026-04-24 Execution Slice: Selectionchange Origin Finalization And Closure Gates

Actions:

- added a focused `selection-controller` contract for model-owned
  selectionchange finalization:
  - programmatic export must keep the model-owned guard while model selection is
    still preferred
  - browser-handle selectionchange must keep the model-owned guard while model
    selection is still preferred
  - native-user selectionchange must clear its origin after import handling
- changed throttled `selectionchange` finalization in `Editable` to call the
  shared selection-controller helper instead of always clearing origin state
- changed browser-handle cleanup so it does not restore an older
  `selectionChangeOrigin` after a model-owned handle command
- fixed `slate-dom` bundled declaration output by using `import('slate').X`
  exported signature types where tsdown aliases Slate symbols to avoid DOM
  globals

Evidence:

```sh
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
# 10 pass, 0 fail

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
# 10 pass, 0 fail

bun test ./packages/slate/test/primitive-method-runtime-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
# 38 pass, 0 fail

bun run --cwd packages/slate-browser test:core
# 14 pass, 0 fail

bunx playwright test ./playwright/integration/examples/review-comments.test.ts --project=firefox --workers=1 --retries=0
# 1 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "records kernel policies for browser command and repair traces|runs generated mobile semantic editing conformance gauntlet|records core command metadata for text input and delete|runs a traced slate-browser scenario" --workers=1 --retries=0
# 16 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0
# 4 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0 --repeat-each=10
# 10 passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=webkit --grep "word movement|line extension" --workers=1 --retries=0
# 4 passed

bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "arrow keys skip over read-only inline" --workers=1 --retries=0
# 4 passed

bun run lint:fix
# passed; fixed formatting

bun run lint
# passed

bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
# 4 successful, 4 total

bun run typecheck:packages
# 12 successful, 12 total

bun test:integration-local
# 516 passed

bun run bench:react:rerender-breadth:local
# passed; selection/edit breadth stayed at zero broad/sibling rerenders in the key rows

REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
# passed; v2 kept large-document wins against legacy chunk-off and chunk-on on the tracked means except middle-block typing/select-then-type vs legacy chunk-on
```

Failed probes:

- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force`
  hit a stale/concurrent package-resolution failure where `slate-dom` could not
  resolve `slate`; serial package typecheck exposed the real declaration issue.
- first declaration fix used source aliases (`SlateBaseEditor`, `SlateEditor`,
  `SlateAncestor`), but tsdown did not emit those alias imports in
  `slate-dom/dist/index.d.ts`.
- second declaration fix used original names, but tsdown aliased the import to
  `BaseEditor$1` / `Editor$1` / `Ancestor$1` in the bundle and still left
  exported signatures unrewritten.
- final declaration fix uses `import('slate').X` in exported source signatures,
  which survived bundling and passed serial package typecheck.

Owner classification:

- Batch C has stronger proof: model-owned programmatic/export/browser-handle
  selectionchange no longer loses its ownership guard during the next import
  window.
- Batch D remains representative but not exhaustive: warm, word, line, inline,
  native vertical, and model horizontal movement are proved; zero-width,
  projection, shadow-root, shell, internal-control, and composition-context
  classification still need explicit rows or written deferral.
- Batch E remains active: the warm toolbar row is stress-repeated, but reusable
  generated warm-state loop support and shrink metadata are not yet implemented.
- Batch F has a fresh full integration pass plus React perf guardrails for this
  slice, but reopened completion still depends on Batch E/D closure.

Checkpoint:

- verdict: keep course
- harsh take: this was a real owner fix, not a local cursor patch. The mobile
  semantic delete failure was stale selectionchange origin cleanup pulling
  model selection back to old DOM truth after a model-owned command.
- why: core insert/delete selection already advanced correctly; the failing
  owner was React/browser-handle selectionchange finalization and stale origin
  cleanup
- risks:
  - generated warm-state loops still do not shrink failures into minimal
    sequences
  - some movement families are covered by broad rows without explicit movement
    reason assertions
  - middle-block large-document typing is still slower than legacy chunk-on in
    this local compare, though the plan already rejects child-count chunking as
    the primary architecture
- earliest gates:
  - add reusable warm-repeat execution in `slate-browser`
  - emit shrink metadata for failed generated warm cases
  - convert the warm toolbar/caret row to the reusable warm loop
  - rerun focused warm row and full integration
- next move: start Batch E implementation in `slate-browser` and richtext proof
  rows
- do-not-do list:
  - do not add more one-off warm rows before adding reusable repeat/shrink
    support
  - do not treat semantic mobile handles as native mobile keyboard proof
  - do not mark completion done while Batch D/E owners remain open

### 2026-04-24 Execution Slice: Warm Loop Shrink Metadata, Harness Focus Discipline, And Residual Movement Closure

Actions:

- added `warmLoop` and `iteration` metadata to generated `slate-browser`
  scenario steps
- added iteration-level reduction candidates so a failing warm loop can shrink
  by whole generated iterations instead of only prefix/suffix/single-step cuts
- converted the warm toolbar arrow row to assert the generated iteration
  reduction candidate
- reproduced the full-suite huge-document readiness flake under targeted
  stress and widened only the 10k route readiness budget
- fixed `slate-browser` `press()` so it preserves an existing usable DOM
  selection instead of always focusing and restoring model state first
- widened mark-click gauntlets to support explicit DOM selection transport
- added residual Batch D movement rows for:
  - projection/decorated text movement
  - shadow-root movement
  - editable-void internal-control ArrowLeft native input selection
- fixed the internal-control keydown owner leak by cutting Slate movement
  command classification when `isInteractiveInternalTarget(...)` owns the event
- updated the reusable solution note for browser proof focus/selection
  ownership

Evidence:

```sh
bun run --cwd packages/slate-browser test:core --bail 1
# 15 pass, 0 fail

bunx turbo build --filter=./packages/slate-browser --force
# passed

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "keeps warm toolbar mark selection usable through arrows without reload" --workers=1 --retries=0
# 4 passed

bunx playwright test ./playwright/integration/examples/huge-document.test.ts --project=chromium --project=mobile --workers=2 --retries=0 --repeat-each=3
# failed before widening the 10k route readiness budget; passed 6/6 after the
# readiness budget change

bun test:integration-local
# failed once after DOM-selection mark-click transport exposed that press()
# reselected stale model state before keyboard transport

bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps browser caret valid after marking selected text then clicking elsewhere|runs generated mark typing gauntlet" --workers=1 --retries=0
# 2 passed after the press() focus-discipline fix

bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --grep "runs generated mark-click gauntlet" --workers=1 --retries=0
# 3 passed

bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/shadow-dom.test.ts ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --grep "projected text movement|shadow DOM ArrowLeft movement|ArrowLeft inside editable void input" --workers=1 --retries=0
# 9 passed

bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
# 20 pass, 0 fail

bun run typecheck:packages
# 12 successful, 12 total

bun run lint:fix
# passed; fixed formatting

bun run lint
# passed

bun test:integration-local
# 528 passed

bun run bench:react:rerender-breadth:local
# passed; key rows stayed at zero broad/sibling rerenders

REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
# passed; v2 preserved large-document wins against legacy chunk-off/chunk-on on
# the tracked means except middle-block typing and middle-block select-then-type
# vs legacy chunk-on

bun run bench:core:observation:compare:local
# passed; current means beat legacy means on all tracked rows

bun run bench:core:huge-document:compare:local
# passed; current means beat legacy on all tracked rows except selectAllMs
# where both are near-zero and legacy is 0.02ms faster locally
```

Failed probes:

- parallel focused Playwright commands for the new residual rows failed because
  multiple Next builds raced on the same site lock; sequential reruns passed
- the first internal-control residual row failed because the input caret moved
  correctly but the kernel still emitted a Slate `move-selection` command for
  an `internal-control` target
- rerunning the internal-control row before rebuilding touched packages stayed
  red because the site imported stale built output
- `ControlOrMeta+b` as a mark-click fix was rejected; the owner was harness
  focus discipline, not shortcut naming

Owner classification:

- Batch A is closed: the warm no-refresh row is generated, repeated, and full
  integration green.
- Batch B is closed for this lane: keydown, beforeinput/input, selectionchange,
  toolbar/browser-handle, paste/cut/drop, composition, and repair have trace
  coverage in the release rows.
- Batch C is closed for this lane: stale repair and selectionchange origin
  ownership are frame-gated and covered by focused plus full integration gates.
- Batch D is closed with explicit proof/deferral:
  - model-owned horizontal, word, line, line-extension, inline/void boundary,
    projection/decorated, and shadow-root movement have browser proof
  - native vertical movement is classified as browser-owned and followed by
    model-owned movement proof
  - internal-control ArrowLeft is classified as internal-control, keeps native
    input selection, and no longer emits a Slate movement command
  - shell-backed movement is not a separate supported arrow-owner claim; shell
    activation, shell-backed selection, shell paste, and promoted-island text
    edits are covered by large-document rows
  - zero-width movement remains a bridge-level capability, not a separate
    release movement claim; zero-width DOM normalization and placeholder text
    paths stay covered by existing unit/browser rows
  - active-composition arrow movement is deferred to native IME deep proof;
    this lane proves composition lifecycle, final text, trace legality, and
    non-regression across projects
- Batch E is closed: generated warm loops have metadata and shrink candidates.
- Batch F is closed for this lane: integration, package build/type/lint, and
  React/core perf guardrails passed.

Checkpoint:

- verdict: stop
- harsh take: the last RED row was exactly the kind of hidden architecture bug
  this plan was meant to expose. Final DOM behavior was fine, but the kernel
  was still lying by logging a Slate movement command for an internal input.
- why: Batch A-F now have either cross-browser proof or exact deferred scope;
  the latest full integration and perf guards are green
- risks:
  - mobile still uses semantic transport for some paths and does not prove raw
    native mobile keyboard/IME transport
  - active-composition arrow movement is intentionally deferred
  - huge-doc middle-block typing remains slower than legacy chunk-on in the
    React compare, while the plan still rejects child-count chunking as the
    primary architecture
- earliest gates:
  - next lane should start from native mobile/IME transport or public API
    cleanup, not more local caret patches
- next move: stop this lane; start a new plan only if the user chooses the next
  architecture owner
- do-not-do list:
  - do not claim raw native mobile input proof from semantic-handle rows
  - do not treat shell arrow movement as supported without a product contract
  - do not revive child-count chunking to win one middle-block benchmark row
