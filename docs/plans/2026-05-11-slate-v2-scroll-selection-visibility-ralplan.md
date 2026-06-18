---
date: 2026-05-11
topic: slate-v2-scroll-selection-visibility-ralplan
status: done
source: slate-ralplan
score: 0.94
---

# Slate v2 Scroll Selection Visibility Ralplan

## Current Verdict

Slate Ralplan is ready for user review and `ralph` execution.

The video report looks like autoscroll, but the worse bug is stale selection:
after the user scrolls and clicks a lower paragraph, typing can still follow an
older model selection and scroll back to that older caret. The accepted plan is
selection import first, scroll request second, post-update visibility third.

Live Slate v2 has already moved since this plan was opened: the default scroll
helper now owns a rectangle walker, and a scroll-into-view browser row exists.
Those are treated as execution artifacts to verify and refine under `ralph`, not
as Slate Ralplan work. Slate Ralplan's job is complete because the remaining
implementation and proof owners are explicit.

The additional scroll-algorithm pass is now recorded below. It keeps the same
north star but tightens the exact algorithm contract before execution.

## Intent And Boundary

- intent: make Slate v2 caret visibility boringly correct across nested scroll
  parents, browser-owned selection moves, beforeinput, composition, and app
  scroll customization.
- outcome: typing after scroll-and-click inserts at the visible caret, then
  scrolls only the minimal parent chain needed to reveal that caret.
- in scope: Slate React selection import, beforeinput selection freshness,
  scroll request lifecycle, caret geometry measurement, nested scroll parents,
  test/browser proof.
- non-goals: app-specific sticky toolbar policy, Plate product commands,
  upstream issue auto-close without exact reproductions, raw mobile-device
  claims from desktop emulation.
- decision boundary: later `ralph` execution may rewrite internal Slate React
  runtime code and add a small unopinionated scroll policy API; raw Slate must
  not depend on Plate product behavior.

## Decision Brief

Principles:

- current in-editor DOM selection is authoritative for native user input unless
  an explicit model-owned operation is active
- scroll is a post-selection, post-update visibility request
- geometry belongs to measured rectangles, not temporary DOM method overrides
- app customization should be policy input, not runtime ownership

Chosen shape:

1. Add a selection freshness phase before native text input and model-owned
   fallback. This imports the current DOM selection for in-editor beforeinput
   unless the event is internal-control, programmatic repair/export, active
   composition, or a known model-owned command.
2. Add an internal caret visibility request queue with reason, margin,
   threshold, scroll mode, and skip/force policy.
3. Replace the default scroll helper with a Slate-owned rectangle walker over
   nested scroll parents. Keep `scrollSelectionIntoView` as the public escape
   hatch, but feed it correct post-update DOM ranges.

Rejected alternatives:

- keep `scroll-into-view-if-needed` and only fix cleanup: too local; it misses
  stale selection and nested policy gaps.
- always trust beforeinput target ranges: Lexical and Slate bugs both show
  target ranges can be stale under model-owned or internal-control paths.
- scroll immediately during event handlers: forces layout at the worst time and
  can reveal pre-commit positions.
- expose a large ProseMirror-style plugin API: too heavy for raw Slate.

## Current Source Evidence

Live Slate v2 after the prior execution attempt:

- `packages/slate-react/src/components/editable.tsx:420` owns a
  `scrollRectIntoViewIfNeeded` parent walker with a fixed visibility margin.
- `packages/slate-react/src/components/editable.tsx:513` owns
  `defaultScrollSelectionIntoView`; it measures the collapsed focus range and
  falls back to the leaf rect without mutating DOM methods.
- `packages/slate-react/src/editable/runtime-before-input-events.ts:239`
  still calls `syncSelectionForBeforeInput`.
- `packages/slate-react/src/editable/selection-controller.ts:291`
  still carries model-selection preference as a boolean plus source, not a
  reasoned freshness token.
- `packages/slate-react/src/editable/selection-reconciler.ts:564`
  still gates `insertText` DOM selection import on
  `preferModelSelectionForInput`.
- `apps/www/tests/slate-browser/donor/examples/scroll-into-view.test.ts:1`
  exists, but the row currently selects the final block programmatically. `ralph`
  should tighten it against the user path: scroll, click visible lower text,
  type, scroll away, click/type again.
- `apps/www/src/app/(app)/examples/slate/_examples/scroll-into-view.tsx:20` creates the nested
  scroll-parent repro surface.

User evidence:

- `.tmp/issue-scroll.mp4` shows repeated scroll/click/type cycles.
- `.tmp/issue-scroll-frames/frame-5.jpg`, `frame-8.jpg`, and `frame-10.jpg`
  show the user reaches a lower paragraph, types, and the viewport returns
  toward the older location.

Prior learning:

- `docs/solutions/ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md`
  already records the same class: browser-visible selection movement must be
  imported before model-owned navigation.
- `docs/solutions/logic-errors/2026-05-11-slate-react-scroll-range-measurement-must-restore-dom-methods.md`
  is now only partial; it fixes method cleanup but not the root stale-selection
  failure.
- `docs/solutions/performance-issues/2026-04-11-shell-promotion-must-move-selection-into-the-promoted-island-or-it-is-just-cosmetic.md`
  reinforces the rule: visible editing location must become model selection.

## Ecosystem Strategy Synthesis

| System      | Evidence                                                                                                                                                                   | Mechanism                                                                                                                               | Slate target                                                                     | Verdict |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| ProseMirror | `../prosemirror-view/src/index.ts:178`, `../prosemirror-view/src/domcoords.ts:32`, `../raw/prosemirror/packages/state/src/transaction.ts:204`                              | transaction carries scroll intent; view scrolls post-update selection rect through parent chain; non-scroll updates preserve anchors    | add commit/request-scoped scroll intent and custom rect walker                   | agree   |
| Lexical     | `../lexical/packages/lexical/src/LexicalEvents.ts:760`, `../lexical/packages/lexical/src/LexicalSelection.ts:2637`, `../lexical/packages/lexical/src/LexicalUtils.ts:1399` | beforeinput applies DOM target range when safe; selection reconciliation chooses DOM selection for native events; scroll accepts a rect | import DOM selection before text insertion unless model-owned reason is explicit | partial |
| CodeMirror  | `node_modules/.pnpm/@codemirror+view@6.39.16/node_modules/@codemirror/view/dist/index.d.ts:861`, `:1125`, `:1365`                                                          | scroll is a transaction effect; measurements are batched; scroll margins model obscured areas                                           | schedule read/write geometry and add margin policy                               | agree   |
| Tiptap      | `../tiptap/packages/core/src/commands/scrollIntoView.ts:15`, `../tiptap/packages/core/src/commands/focus.ts:36`                                                            | product command delegates to ProseMirror transaction scroll; focus can opt out                                                          | keep a simple app-facing customization boundary                                  | partial |
| Milkdown    | `../raw/milkdown/repo/packages/prose/src/toolkit/position/index.ts:53`, `:74`                                                                                              | UI positioning uses ProseMirror `coordsAtPos`; command paths use `tr.scrollIntoView()`                                                  | treat Milkdown as ProseMirror confirmation, not a new engine pattern             | agree   |
| Obsidian    | `../raw/obsidian/developer/en/Reference/TypeScript API/Editor/scrollIntoView.md:16`                                                                                        | product API exposes `scrollIntoView(range, center?)`                                                                                    | keep raw Slate lower-level; Plate can expose product commands                    | diverge |

Compiled research:

- `docs/research/sources/editor-architecture/scroll-selection-visibility-runtime.md`
  records the source comparison from this pass.

## Target Architecture

### Public API

Keep `Editable`'s `scrollSelectionIntoView?: (editor, domRange) => void` for
compatibility. Do not add a new public `scrollPolicy` prop in the first
execution slice.

Add an internal policy object behind the default helper:

- margin: number or per-side rect
- threshold: number or per-side rect
- mode: `nearest` by default
- scrollParents: default DOM parent walk
- skip reason: `skip-scroll` commit tag, composition repair, app override

Do not expose ProseMirror transactions or CodeMirror effects directly. Promote
the policy object to public API only after the `#4995` customization row has
browser proof that the existing callback is insufficient.

### Internal Runtime

- `syncSelectionForBeforeInput` should import current DOM selection for
  in-editor `insertText` before model-owned fallback unless model preference is
  backed by a current explicit source such as internal-control, programmatic
  export, or repair.
- `setEditableModelSelectionPreference` should carry a reason/timestamp, not
  just a boolean, so stale preference cannot suppress later user selection.
- Add a `requestCaretVisibility` path on the selection runtime. Inputs:
  `range`, `reason`, `margin`, `threshold`, `mode`, and `phase`.
- Measure after DOM selection export or post-input repair. The measured target
  is a DOMRange rect, with leaf/node fallback only when the range gives a zero
  or invalid rect.
- Replace temporary method overrides with a function that scrolls a `Rect`
  through scroll parents.
- Preserve scroll anchors when a state update changes DOM but did not request
  caret reveal.
- Keep the first implementation internal to
  `selection-controller`/`selection-reconciler`; the existing public callback
  still receives a correct post-update DOM range.

### Plate And slate-yjs Migration Backbone

- Plate can pass sticky toolbar/content chrome margins through the scroll
  policy; raw Slate should not know Plate toolbar names.
- slate-yjs remote commits should default to `skip-scroll` for remote selection
  changes unless the local user explicitly follows a remote cursor.
- Local commits keep current-user caret visibility; remote commits preserve
  scroll anchors.

## Issue Accounting

No new fixed issue claim is allowed from this plan yet.

Related issue sync completed from cached ledgers; no live GitHub discovery was
needed, and no ledger row should be promoted before the browser red row exists:

- `#5826`: closest match. Dossier says refocus/selection-scroll family; exact
  long-editor refocus autoscroll closure is not claimed. Test-candidate map is
  `ready-now` and should be covered by the first browser row.
- `#4995`: related scroll customization pressure. Coverage matrix keeps it
  related; test-candidate map says not a direct red-test target in the current
  contract.
- `#5639`: mobile/RTL repeated scroll pressure. Matrix-only future proof until
  raw iPhone/RTL proof exists.
- `#5291`: Android cursor jump in tall block. Long-form proof-route backlog;
  do not claim from desktop Chromium.
- `#5524`: vertical navigation across soft breaks. Related selection pressure,
  but current dossier routes exact closure to core caret/navigation unless DOM
  bridge proof shows otherwise.
- `#5806`: custom inline gesture selection. Related to React selection
  reconciliation, but exact drag/slide-selection browser proof is not claimed.
- `#5711`: DOM point resolution crash family. Related to fail-closed DOM import,
  but exact iOS closure needs matching browser proof.
- `#4961`: focus after insert. Adjacent React focus/input runtime ownership;
  exact insert-and-focus replay still needed.

No changes to `docs/slate-v2/references/pr-description.md` are justified in
this planning pass. No fixed issue claim is legal yet.

Next pass:

- tighten maintainer objections around the exact API shape and TypeScript
  surface
- keep `docs/slate-v2/ledgers/fork-issue-dossier.md` and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md` unchanged unless proof rows
  change status

## Regression Proof Matrix

| Row                                     | Test owner                                                                                          | Behavior                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Stale click selection before typing     | `apps/www/tests/slate-browser/donor/examples/scroll-into-view.test.ts` tighten existing row       | scroll nested editor, click lower paragraph, type, assert text lands in clicked paragraph and caret remains visible |
| Repeat scroll/click/type                | same browser file                                                                                   | repeat the reported cycle three times; assert scroll does not chase old selection                                   |
| DOM selection import before beforeinput | `packages/slate-react/test/selection-controller-contract.test.ts` or new focused test | `insertText` imports current in-editor DOM selection when model preference is stale                                 |
| Internal control undo/text input        | existing editable-void/read-only rows                                                               | internal-control preference still protects native controls                                                          |
| Zero rect fallback                      | `packages/slate-react/test/editable-behavior.test.tsx`                                | empty/line-break caret still reveals using fallback rect without mutating element methods                           |
| Nested parent scrolling                 | `packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`                    | inner and outer scroll containers receive minimal deltas                                                            |
| Scroll margin                           | new unit row                                                                                        | sticky chrome margin shrinks visible rect                                                                           |
| Composition                             | existing IME rows plus new skip-scroll row if needed                                                | composition repair does not import/scroll stale non-composed selection                                              |

## Browser Stress Strategy

- Use the real `/examples/scroll-into-view` route, not a synthetic unit-only
  DOM.
- Use a browser helper that clicks by text block rect and verifies both model
  text and visible DOM selection.
- Add a failure assertion for “old paragraph got the typed character” because
  that is the regression the video exposes.
- Add a mobile/RTL follow-up row only after desktop behavior is stable; do not
  claim `#5639` from desktop Chromium.

## Performance And React Review

- Vercel React: applied. Geometry should be event/request scheduled and use
  refs/request queues, not React state churn.
- performance-oracle: applied. Parent walk is O(depth of scroll ancestors), not
  O(document size); no per-block listeners.
- performance skill: applied. Interaction budget is typed character p95 under
  nested scroll; memory budget is one pending visibility request per editor.
- performance lane detail:
  - repeated unit: scroll parent, not block or leaf
  - budget: one range-to-rect measurement and one ancestor walk per requested
    reveal
  - cohorts: normal nested editor, long document, tall-block mobile backlog,
    and pathological custom inline/RTL device rows
  - degradation contract: none for desktop native typing; mobile/RTL and
    remote-cursor follow remain unclaimed until device proof exists
  - RUM gap: no production dashboard in raw Slate; browser regression rows are
    the proof mechanism for now
- tdd: applied. Build one red browser row first, then the smallest selection
  import unit, then the scroll rect walker.
- shadcn/react-useeffect: skipped. No component UI or effect API decision in
  this pass.

## High-Risk Pre-Mortem

1. We break internal controls by importing DOM selection when the user types in
   an embedded input. Counter: explicit internal-control reason survives and has
   focused editable-void proof.
2. We cause scroll jank by measuring during beforeinput. Counter: queue the
   visibility request and measure after DOM export/repair.
3. We overfit desktop Chromium. Counter: keep mobile/IME/RTL issue claims
   related until raw device or scoped mobile proof exists.

## Maintainer Objection Ledger

| Objection                                                        | Answer                                                                                                                                                                | Verdict |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| “This is just a bug in the example.”                             | The example is only the repro shell; the stale selection path is in `slate-react` beforeinput/import logic.                                                           | keep    |
| “Existing `scrollSelectionIntoView` is customizable.”            | It customizes the final scroll callback, not the selection freshness or correct measured target.                                                                      | keep    |
| “A custom rect walker is overkill.”                              | ProseMirror, Lexical, and CodeMirror all own their scroll math/lifecycle; delegating through method mutation already produced a repeat bug.                           | keep    |
| “Do not steal ProseMirror.”                                      | The plan steals lifecycle discipline only: intent, post-update rect, parent walk, and anchor preservation.                                                            | keep    |
| “A new policy prop is API bloat.”                                | Correct. First slice keeps the policy internal and keeps the existing callback. Public promotion waits for exact customization proof.                                 | revise  |
| “DOM selection import before input can break internal controls.” | Internal-control, composition, shell, and programmatic-export reasons must remain model/native-owned guards; this is the first unit-test row after the browser repro. | keep    |
| “One browser row cannot close mobile/RTL scroll issues.”         | Correct. `#5639` and `#5291` stay related/backlog until raw device proof exists.                                                                                      | keep    |
| “The scroll walker might force layout on every keystroke.”       | It runs only on explicit visibility requests, not every state change; the target budget is one range rect and one ancestor walk per reveal.                           | keep    |

## Additional Scroll Algorithm Passes

### Selection Authority Pass

Verdict: a boolean `preferModelSelectionForInput` is too weak for this bug
class. The execution slice needs a reasoned freshness token, not just
model-versus-DOM preference.

Algorithm contract:

1. Native pointer/click/selectionchange inside the editable records a
   `dom-current` selection token with event frame and source.
2. Model-owned paths record a specific reason: `internal-control`,
   `composition`, `programmatic-repair`, `shell-export`, or
   `model-transform`.
3. Before native `insertText`, current in-editor DOM selection wins unless a
   still-current model-owned reason explicitly owns the frame.
4. Stale model preference expires after a newer user DOM selection inside the
   editor.
5. External or unselectable DOM selection fails closed: no import, no crash, no
   scroll claim.

Execution owner:

- `packages/slate-react/src/editable/input-state.ts`
- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-react/src/editable/selection-reconciler.ts`
- `packages/slate-react/src/editable/runtime-before-input-events.ts`

### Scroll Request Lifecycle Pass

Verdict: scroll must be a request attached to committed selection visibility,
not a side effect of every selection check.

Algorithm contract:

1. User input or selection export produces at most one pending visibility
   request per editor frame.
2. The request stores `range`, `reason`, `phase`, `mode`, `margin`,
   `threshold`, and `skip/force`.
3. Measurement happens after DOM selection export or post-input repair, not in
   the middle of `beforeinput`.
4. Non-reveal updates preserve scroll anchors and do not chase the model
   selection.
5. Remote/collab selection changes default to `skip-scroll` unless the local
   user follows that remote cursor.

Execution owner:

- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-react/src/editable/dom-repair-queue.ts`
- `packages/slate-react/src/editable/runtime-repair-engine.ts`
- `packages/slate-react/src/editable/runtime-root-engine.ts`

### Geometry And Parent-Walk Pass

Verdict: the rect walker is the right direction, but the execution pass should
make its policy explicit and prove it through nested parents.

Algorithm contract:

1. Measure the collapsed focus range for the effective post-update selection.
2. Treat a zero or unusable range rect as a fallback signal, not as permission
   to monkeypatch DOM methods.
3. Fall back to the closest Slate text/leaf rect only when the range rect is
   unusable.
4. Walk scrollable ancestors from inner to outer, then viewport last.
5. After each ancestor scroll, offset the target rect by the actual scroll
   delta before evaluating the next parent.
6. Reveal by nearest-edge deltas by default, not centering.
7. Margins and thresholds shrink the visible rect per side; Plate can later
   feed sticky chrome margins without raw Slate knowing toolbar concepts.
8. Horizontal and RTL scrolling stay in scope for the rect walker, but exact
   Persian/iPhone closure remains unclaimed until device proof.

Execution owner:

- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`
- `packages/slate-react/test/editable-behavior.test.tsx`

### Browser Proof Pass

Verdict: the current browser row is useful but not sufficient; programmatic
selection can bypass the exact stale click path from the video.

Required first row:

1. Open `/examples/scroll-into-view`.
2. Scroll to the lower content through the real scroll container.
3. Click a visible lower paragraph by DOM rect, not by setting Slate selection.
4. Type.
5. Scroll away again.
6. Click/type again.
7. Assert the typed text lands in the clicked paragraph.
8. Assert the old paragraph did not receive the second text.
9. Assert the visible caret is inside the nearest scroll parent.

Execution owner:

- `apps/www/tests/slate-browser/donor/examples/scroll-into-view.test.ts`
- `apps/www/src/app/(app)/examples/slate/_examples/scroll-into-view.tsx`

### API Cut Pass

Verdict: no new public API in the first execution slice.

Keep:

- `scrollSelectionIntoView?: (editor, domRange) => void`
- internal policy object behind the default helper
- issue `#4995` as related pressure only

Cut:

- public `scrollPolicy` prop in the first slice
- ProseMirror-style transaction API in raw Slate React
- Plate sticky-toolbar concepts in raw Slate

Promote a public policy only if a focused `#4995` browser row proves the
existing callback cannot express the app need.

### Failure-Mode Pass

Execution must not regress:

- embedded/native internal controls
- active composition and IME repair
- shadow-root selection lookup
- zero-rect collapsed caret on line breaks
- offscreen editor focus repair
- remote/collab selection preservation
- custom inline gesture selection
- mobile/RTL claim boundaries

No fixed issue claim is legal until the matching proof row exists.

## Implementation Phases

Ralplan owns this owner map only. `ralph` owns implementation, verification, and
any source/test edits.

1. Tighten the browser row for `.tmp/issue-scroll.mp4` behavior on
   `/examples/scroll-into-view`.
2. Selection freshness fix: reasoned model-selection preference and DOM import
   before text insertion.
3. Scroll helper rewrite: rect walker, margins, thresholds, no method mutation.
4. Scroll anchor preservation for non-reveal updates.
5. Focused issue accounting update after proof results.

### Execution Owner Map

First browser row:

- refine `apps/www/tests/slate-browser/donor/examples/scroll-into-view.test.ts`
- use `apps/www/src/app/(app)/examples/slate/_examples/scroll-into-view.tsx`
- assert both browser DOM text and Slate handle/model text after scroll,
  click-lower-paragraph, type, scroll-away, click-lower-paragraph, type again
- first issue target: `#5826` related proof; no fixed claim until the row
  passes after implementation

First runtime slice:

- `packages/slate-react/src/editable/input-state.ts`: replace the
  stale boolean-only model preference with reason/source freshness data.
- `packages/slate-react/src/editable/selection-controller.ts`:
  update `setEditableModelSelectionPreference` and expose a single internal
  helper for stale-preference checks.
- `packages/slate-react/src/editable/selection-reconciler.ts`:
  import current in-editor DOM selection for `insertText` when model preference
  is stale, while preserving internal-control/composition/programmatic guards.
- `packages/slate-react/src/editable/runtime-before-input-events.ts`:
  pass the freshness-aware preference instead of the raw boolean.

Second runtime slice:

- `packages/slate-react/src/components/editable.tsx`: replace
  temporary `getBoundingClientRect` mutation with a rect-based default helper.
- `packages/slate-react/src/editable/selection-controller.ts`: queue
  caret visibility requests after DOM selection export.
- `packages/slate-react/test/editable-behavior.test.tsx`: keep the
  two-scroll regression row and add zero-rect fallback proof.
- `packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`:
  prove nested parent deltas and internal policy margins.
- `packages/slate-react/test/selection-controller-contract.test.ts`:
  prove stale model preference expires on explicit user DOM selection.

Cut line:

- Do not edit `EditableTextBlocksProps` or add public API until the existing
  callback proves insufficient under a focused `#4995` browser row.

## Fast Driver Gates

From `/Users/zbeyens/git/slate-v2`:

```bash
bun test ./packages/slate-react/test/selection-controller-contract.test.ts ./packages/slate-react/test/selection-runtime-contract.test.ts ./packages/slate-react/test/editable-behavior.test.tsx ./packages/slate-react/test/rendering-strategy-and-scroll.test.tsx
bun --filter slate-react typecheck
bun lint:fix
bun test:integration-local --grep "scroll into view"
```

From `/Users/zbeyens/git/plate-2` for planning artifacts only:

```bash
pnpm lint:fix
bun run completion-check
```

## Scorecard

| Dimension                          | Score | Evidence                                                                                              |
| ---------------------------------- | ----: | ----------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance     |  0.94 | request queue + O(parent depth) target; read/write timing called out; no per-block listeners          |
| Slate-close unopinionated DX       |  0.94 | keeps `scrollSelectionIntoView`; first policy stays internal                                          |
| Plate/slate-yjs migration backbone |  0.88 | margins and `skip-scroll` are specified; remote-follow remains a later proof row                      |
| Regression-proof testing           |  0.95 | user-path browser row, stale-selection unit, rect walker, zero-rect, and failure-mode rows are named  |
| Research evidence completeness     |  0.95 | ProseMirror, Lexical, CodeMirror, Tiptap, Milkdown, Obsidian local evidence compiled and issue-synced |
| Composability/minimalism           |  0.94 | public API bloat cut from first slice; internal policy avoids prop churn                              |

Total: `0.94`.

## Pass-State Ledger

| Pass                                    | Status   | Evidence added                                                                                                                                                                    | Plan delta                                                                                   | Open issues                                                 | Next owner                              |
| --------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Current-state and ecosystem source pass | complete | live Slate v2 owners, video frames, compiled research note, ProseMirror/Lexical/CodeMirror/Tiptap/Milkdown/Obsidian source reads                                                  | created plan and target architecture                                                         | exact browser red row pending                               | issue/accounting pass                   |
| Related issue sync                      | complete | exact dossier, coverage-matrix, live-open, v2-sync, and test-candidate rows read for `#5826`, `#4995`, `#5639`, `#5291`, `#5524`, `#5806`, `#5711`, and `#4961`                   | no fixed claims; #5826 identified as first browser red row                                   | proof rows still pending                                    | maintainer objection closure            |
| Maintainer objection closure            | complete | steelman/high-risk pressure applied to API bloat, internal-control safety, mobile claim scope, and layout cost                                                                    | first slice keeps policy internal; public API promotion deferred                             | exact implementation files/tests still pending              | execution plan closure                  |
| Execution plan closure                  | complete | current live source re-read, execution owner map, browser row owner, runtime file owners, and driver gates named                                                                  | plan status set to ready for user review; execution moved to `ralph`                         | no fixed issue claims until exact browser proof passes      | `ralph` execution after user invocation |
| Additional scroll-algorithm pass        | complete | selection authority, scroll request lifecycle, geometry walker, browser proof, API cut, and failure-mode passes recorded                                                          | tightened execution contract before `ralph`; no source edits from ralplan                    | user-path browser proof still belongs to `ralph`            | `ralph` execution after user invocation |
| Ralph execution closure                 | complete | repeated manual scroll-away browser row, reasoned model-selection preference, DOM repair caret visibility, rect parent walker, dependency cut, focused unit/type/lint/build proof | `scroll-into-view-if-needed` removed; public API unchanged; issue claims remain conservative | mobile/RTL/raw-device and remote-cursor rows stay unclaimed | none                                    |

## Completion Gates

Slate Ralplan closure:

- score `>= 0.92`, no dimension below `0.85`
- issue sync pass complete with no fake fixed claims
- execution owner map names exact implementation and test files
- live Slate v2 source is re-read before handoff
- no implementation edits are made from Slate Ralplan

Ralph execution gates:

- first user-path browser row exists and fails before the behavior fix, or the
  existing row is tightened to prove the user path directly
- Slate v2 focused unit/browser gates pass from `Plate repo root`
- no `scroll-into-view-if-needed` method-mutation dependency remains in default
  caret visibility path
- final handoff separates fixed, improved, related, and unclaimed issue rows
