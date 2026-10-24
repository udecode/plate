---
review_scopes: [native]
verdict: pursue
review_basis: [2026-10-04-native-audit]
work_kind: implementation
review_commit: e70fb8abf51ef5d46f3e5f31787907419e7616f2
review_inputs: [VISION.md, docs/vision/plite.md, docs/vision/common.md, docs/plans/2026-10-21-view-selection-import.md, docs/plans/2026-10-22-synced-root-shift-extend.md, packages/plitejs/src/react/editable/selection-reconciler.ts, packages/plitejs/src/react/editable/selection-controller.ts, packages/plitejs/src/react/editable/selection-change-listener.ts, packages/plitejs/src/react/editable/runtime-selection-engine.ts, packages/plitejs/src/react/editable/root-interaction-controller.ts, packages/plitejs/src/react/editable/runtime-focus-mouse-events.ts, packages/plitejs/src/react/editable/selection-claim.ts, packages/plitejs/src/react/editable/editable-dom-runtime.ts, packages/plitejs/src/react/editable/input-state.ts, packages/plitejs/src/react/components/editable.tsx, packages/plitejs/test/react/authored-preview-selection.test.tsx, packages/plitejs/test/react/view-carets.test.tsx, apps/www/tests/browser/regressions/suggestion-preview-selection.spec.ts, apps/www/src/registry/examples/suggestion-view-demo.tsx, packages/platejs/src/react/components/NodeSelection.tsx, apps/www/src/registry/components/editor/find.tsx]
review_upstreams: ['../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Keep a click's caret until Plite reads it

Status: executed: landed on next; open work waits on t_13309460, t_3faba581 and your words
Playbook: plan

**Pursue.** In a read-only view, Firefox puts a click's caret into the page during mousedown, before focus, and tells Plite about it only in a later `selectionchange`. Focus makes the Editable re-render, and that render writes Plite's older selection over the click, or clears it when Plite has none. The editor stays focused with no caret, and Shift+Left selects nothing. The only signal Plite has that the page holds a selection it has not read is `pendingDOMSelectionImport`, and the event that sets it comes after the render. So no export can tell an unread click from a stale caret, and the first iteration's press record, which tried to infer that from DOM state, failed three panel rounds and was reverted. Editable views never hit this because their root controller places the model at the click point during mousedown, before focus. Read-only roots switch that controller off. The fix should keep every render from writing over a selection Plite has not read yet, without guessing from page state. The same question is open for other inputs as t_13309460, and this plan's table carries those cases too.

## Brief

### What will change?

A click or tap in a read-only view now keeps its caret when the page redraws before Plite reads it, so Shift+Arrow selects from the click. Browser tests pass in Chromium, Firefox and WebKit, and editable views work as before.

### What could go wrong?

As before, clicks lose their caret when an edit beats the read, after a late tap in a parked view, inside a shadow root, when a leaf moves the text, or on a caret Plite never read. Phones are untested.

## Teach

Plite keeps two copies of the selection. Commands and Shift+Arrow use Plite's copy, and the browser's copy paints the caret. On a click the browser moves its copy first, and Plite reads it from a later event. Each redraw writes Plite's copy back into the browser.

Firefox moves its copy at mousedown, before focus, and focus makes many pages redraw. That redraw writes Plite's old copy over the click before Plite reads it, so the caret vanishes. Editable views work out the click point themselves at mousedown. Read-only views skip that step.

The fix notes the browser's copy when a read-only press starts. Until Plite reads the click, Plite checks that copy right before it writes it or changes the page under it. If it moved, Plite takes the click first. If not, the change is Plite's own, so Plite notes the copy again after it. After mouseup the browser can still move the caret, so the check starts over.

## Public API

No public call changes. A component that re-renders on focus, like this one, stays as written, and after the fix a click's caret survives that render.

```tsx before
// apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx
const modelSelection = useEditorSelection();
const selection = useEditorFocused() ? modelSelection : null;
```

```tsx after
// apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx
const modelSelection = useEditorSelection();
const selection = useEditorFocused() ? modelSelection : null;
```

## What other editors do

A Codex reader read ProseMirror at ca4c78e9b5, Lexical at dd5c41b131, Slate at 945a484df2 and CodeMirror at fbff59ba00 from source, and ran none of them. None of them guards every unread selection. ProseMirror and CodeMirror write their selection only when it changed, which by the source keeps a render from writing over a click they have not read yet, and CodeMirror also places a click itself at mousedown. Lexical never writes the selection in a non-editable view. Slate, whose every-render write Plite inherited, names this bug in a comment: a layout-effect write before its selectionchange import "can remove the DOM selection accidentally" (`slate-react/src/components/editable.tsx:230`). The full read is `editors/answer.md` in the run directory.

| Delta | Editor | A plain click | When it writes the selection | On focus | Non-editable view |
| --- | --- | --- | --- | --- | --- |
| added | ProseMirror | The browser places it; `selectionchange` reads it | Only after the document or its selection changed, and not during a mouse press whose selection it already saw (`index.ts:207`, whose comment names "an update arriving right between a DOM selection change and the selectionchange event") | Writes its own selection after 20 ms, only if the page's differs from the last one it saw | Same press path; reads and writes while focus is inside |
| added | Lexical | The browser places it; `pointerdown` marks the next `selectionchange` as a mouse one | At commit, when the update changed the selection, after comparing with the live page selection | Dispatches a focus command; no selection read or write | Regular commit writes are off; it only reads (`LexicalUpdates.ts:713`) |
| added | Slate | The browser places it; a 100 ms throttled read | Every render, when the page's selection differs from the model's, or clears it when the model has none | Marks focus; the provider re-renders | Same writer while marked focused; the comment above names the bug |
| added | CodeMirror | Computes the point at mousedown, selects it and prevents the browser's placement (`input.ts:385`) | On a view update, when the wanted selection differs from the last one it read | Updates after 10 ms; no direct read | Same computed press path |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Press selection | `UnreadPress` in `react/editable/unread-press.ts`, one per Editable runtime, decides whether the page holds a selection that Plite has not read and may not write over. Each write of the page's selection first asks `claimPageSelection`. That asks every press on the page that holds a record, because the page has one selection, and a write from any root can replace a click in another editor or in a content root. Those writes are `syncEditableDOMSelectionToEditor`, each attempt of the typing repair queue, the selection controller's native clear, the clears that the caret engine and content-root navigation defer, and the focus retry of an arrow key into a content root. While that selection is newer, the runtime reads it before a React commit, when a node binding, a text string or Plite's text flow below the fence unmounts, and before its own text flow writes, and the import decision funnel ends the press. When an ask finds nothing newer, the rest of that turn is Plite's own, and the record takes the page's selection again in a microtask once the turn ends. The turn is part of the record, so the next press or read ends it even when the root drops that microtask. It sits beside `SelectionClaims` on the runtime. The editing kernel still owns the selection source and repair scheduling, and `UnreadPress` sets neither. |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| A plain click in a read-only view that re-renders on focus | In Firefox, which places the click before focus, keeps its caret, and Shift+Arrow extends from it, whether the Editable, a leaf, an element, a decoration or Plite's own text flow re-renders (E1 to E4, E14, E24, E33, E35, E39, E41). Still lost as at base when a leaf moves the clicked text without the Editable re-rendering (E42), or when the click lands on a caret the page shows but Plite never read (E43) | jsdom cases; the focus-render Plite browser spec in Firefox, Chromium and WebKit |
| A tap in a read-only view | Keeps its caret (E5), except a tap into a parked view whose focus arrives after the press window, which still restores the view's old caret, as today (E30, owned by t_13309460) | jsdom with touch and compatibility mouse events; devices unproven |
| A click, tap or edit in an editable view | Unchanged (E16, E19) | jsdom suite; Plite browser specs in three engines |
| A drag, double-click or Shift+click in a read-only view | Unchanged (E17, E18) | Plite read-only browser specs in three engines |
| A plain click in a read-only view in Chromium or WebKit | Unchanged. Focus comes before the browser places the click, so the focus render still writes Plite's caret first, as at base, and the import then takes the click (E14, E17, E18, E23, E37) | the same specs in both engines; jsdom in Chromium's order |

## Main changes

- A read-only root's own pointerdown on its editable content opens an unread press. The press records the shown document (`view.read.runtime.snapshot().children`, the authored projection), the placement generation and the page's selection inside the root. The owner's control and chrome checks stop at the root, so a view inside a non-editable wrapper opens one too. A press inside a shadow root opens none yet, because the outside-press release clears its caret first in every engine; t_3faba581 owns both (E34). A press on a control, a nested editor, an external text host or non-editable chrome inside the root opens none, and every pointerdown ends the press before it.
- The press checks its stamp first and stops counting the page as newer once the shown document or the placement generation moves. The page's selection is newer than Plite's only while the press is unread and the page holds a selection inside the root that differs from the recorded one. A press that placed nothing, a selection the page cleared, and the older range that a Chromium or WebKit focus render sees before the browser places the click never count.
- While the page's selection is newer, `syncEditableDOMSelectionToEditor` and each attempt of the typing repair queue, a retry included, leave it alone (E36). So does the work deferred to the next frame that would replace it: the deferred selection clear in `selection-controller.ts`, the clears that a large-document Shift+Arrow in the caret engine and a Shift+Arrow into a content root defer, and the focus retry of an arrow key into a content root. Each of them asks every press on the page, so a click in another editor, or in a content root inside the writing root, counts too (E50 to E53).
- When one of those asks finds the page's selection not newer, the rest of that turn's writes and DOM changes are Plite's own. The record takes the page's selection again in a microtask, once the turn ends, so a caret that Plite moved or broke itself never counts as a click (E28, E44). The turn is a field of the record, so the next pointerdown or read ends it even when the root drops the microtask, as when the editor is hidden or its root element is replaced (E45).
- While the page's selection is newer, the runtime imports it before anything replaces text that may hold the caret: before a React commit at the commit fence, when a node binding, a text string or Plite's text flow below the fence unmounts, and before Plite's own text flow writes the DOM. The text flow reads in its layout cleanup, before it releases its mappings, so a wrapper that remounts the flow without touching its block still keeps the click (E46). The binding reads before its children's string refs, because React detaches refs parent-first and the binding's cleanup drops the mappings an import needs (E41). That import ignores the model-selection preference that a decoration refresh sets.
- At mouseup, a press that Plite already read records the page's selection again, because the browser can still collapse a range after mouseup. A press that is still unread keeps its record from pointerdown.
- The four import decisions in `selection-controller.ts` go through one funnel that ends the press before claims decide as today.

## Expected results

Each row is a case shape the redesign must handle. Start is the document and selection before the steps, Steps run in order, and Result is the model selection and the browser's caret after them. The text `one / two / three` is three paragraphs. At base is the row's result at e70fb8abf5, from the reverted tree's run (`reverted-acceptance-a1-a1.log` in the run directory, and `round-2-base-a1-a1.log` for E33 and E35 to E40) or `not run`, which the baseline step fills before the design.

| # | Rank | Start | Steps | Result | Proof | At base |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | P0 | Read-only preview, model caret at one@1 | Press on three; the browser puts its caret at three@2 before focus; focus; the Editable re-renders; selectionchange; import | Model and caret at three@2; Shift+Left then selects three@1 to 2 | E35's case, which runs this click and focus render in a view inside a non-editable wrapper. Its own case failed on no planted bug a kept case misses and was cut; the shown-to-stored mapping it also checked belongs to the selectionchange import, which the authored-preview tests pin | red |
| E2 | P0 | Same | As E1, with a leaf render after the selectionchange and before the import | three@2 | E35's case: the focus render's commit fence imports the click before the selectionchange, so a later leaf render finds it read. Its own case failed on no planted bug a kept case misses and was cut | red |
| E3 | P0 | Same | As E1, with a second selectionchange and then a leaf render before the import | three@2 | E35's case, as for E2 | red |
| E4 | P0 | Same, the browser's caret at one@1 | As E1, where the focus render replaces the text node of one | three@2 | E35's case: the commit fence imports the click before the focus render replaces the old caret's text. Its own case failed on no planted bug a kept case misses and was cut | red |
| E5 | P1 | Same | A tap on three; the browser puts its caret at three@2 before focus; focus; render; selectionchange; import; the compatibility mouse events | three@2 | read-only-press-selection: a tap's caret survives renders | red |
| E7 | P1 | Read-only, caret at one@1, focused | A press that moves no caret; an edit moves the model caret; release; import | The caret where the edit moved it, in model and page | E27's case: a document change during a press lets Plite write. Its own case failed only when a press blocks every write, which E27's case also catches, and was cut | green |
| E8 | P1 | Same | A press that moves no caret; the caret's block is removed | The caret where the removal moved it | No case: its case failed on no planted bug and was cut. E27's case pins the document stamp that lets the removal's write through | green |
| E9 | P1 | Same | A press that moves no caret; the caret's block moves after the next block, or to the end | The caret where the move put it | E27's case, as for E7 | green |
| E10 | P1 | Views A and B of one editor, B read-only, focused, caret B one@1 | A press in B that its mousedown does not place, with the browser's caret at two@2; a text write in two before mouseup; mouseup; selectionchange | B keeps one@1 in model and page | E27's case pins the document stamp behind this result. Its own case failed only on bugs E27's case catches, and the result it pinned is a limit rather than a promise, so it was cut | green |
| E11 | P1 | Read-only, caret at one@1 | A mousedown handler places two@1 during a click | two@1 in model and page when a render follows the browser's placement in Firefox; otherwise the browser's click, as E13 and E31 pick | read-only-press-selection: a selection a handler places during a read-only click | green |
| E12 | P1 | Same | A handler places during a touch; the touch's compatibility mousedown follows | The handler's selection when a render follows the browser's placement in Firefox; otherwise the browser's tap | E11's case: a placement during a press beats the press however it opened. Its own case failed on no planted bug a kept case misses and was cut | green |
| E13 | P2 | A lone read-only editor, focused, caret at one@1 | A mousedown handler places two@1; the browser's click then puts its caret at three@2 | three@2, the browser's click; in peer views claims veto the click and the handler's two@1 stays | new jsdom case | not run |
| E14 | P0 | The hidden focus-render example's read-only editor, whose Editable props change on focus | Click after "from" in line two; Shift+Left three times | "rom" selected, ending at the click | focus-render Plite browser spec, read-only case, five runs per engine | red in Firefox (model null after the click); green in Chromium and WebKit |
| E15 | P1 | /docs/suggestion in Accepted, Proposed and Markup | Click; Shift+Left | Selects from the click | apps/www regression spec suggestion-preview-selection, five runs per engine | green (Firefox 15 of 15) |
| E16 | P1 | The same example's editable editor | As E14 | As E14 | focus-render spec, editable case | green in all three engines |
| E17 | P1 | Read-only view | Press, drag, release | The dragged range | comment-mode: real pointer selection in the read-only editor | green in all three engines |
| E18 | P1 | Read-only, focused | Double-click a word; Shift+click later in the text | The word, then the range extended to the click, by whole words in Chromium and WebKit | focus-render: a double-click then a Shift+click in the read-only editor | green in all three engines |
| E19 | P1 | The current suite | Every view-carets, authored-preview and read-only-press case | Unchanged | test:react | green |
| E20 | P2 | Editor not focused, model caret none | A page script puts a collapsed range at the end of the last paragraph, then focuses the editor; type x | The range kept; x lands at the end | new jsdom case from t_13309460 | red by t_13309460's finding; not run here |
| E21 | P2 | Two views, focused | A native selection across roots set within a frame of a commit, before its import | The native selection kept | view-carets selectAcrossRootsInA with wait(0) | red by t_13309460's finding; not run here |
| E22 | P2 | Two views, nothing focused, A holds the caret | A keep in B with no gesture open runs B's commit export | A's caret stays | new jsdom case from t_13309460 | not run |
| E23 | P1 | Read-only, a programmatic selection shown | Click inside it | Both selections collapse to the click | read-only: clicking inside a read-only selection collapses DOM and Plite selection (EDIT-SEL-CLICK-READONLY-001) | green in all three engines |
| E24 | P0 | Read-only preview whose first leaf changes when focused, model caret at two@1 | Press on one; the browser puts its caret at one@2 before focus; focus; the focus render replaces one's text node; selectionchange; import | Model and caret at one@2 | E45's case, whose focus render replaces the clicked text after a hide and show. Its own case failed on no planted bug a kept case misses and was cut | red (the old caret stays) |
| E25 | P1 | Read-only preview, focused, a block selection shown whose native clear waits for a frame | Press on three; the browser puts its caret at three@2; the frame runs; selectionchange; import | three@2 | E36's and E51's cases, which pin the export gate and the deferred clear this click waits on. Its own case failed on no planted bug a kept case misses and was cut | red |
| E26 | P1 | Read-only, focused, two@0 to 3 selected | Press inside it; mouseup; the browser collapses to two@1; click; a render; selectionchange | two@1 | read-only-press-selection: a click inside a read-only selection keeps its caret through a render on click | red |
| E27 | P1 | Proposed preview with an inserted block, caret in the block after it | Press in the inserted block; switch to Accepted, which hides it; selectionchange | The model's caret, shown where Accepted puts it | read-only-press-selection: a preview switch during a read-only press that hides the pressed block | green |
| E28 | P1 | Read-only preview whose first leaf changes on each render, focused, caret at one@3 | Press at one@3, which moves nothing; selectionchange; import; mouseup; a render replaces one's text | The caret repaired at one@3 | No case: its case failed on no planted bug and was cut. E39's and E49's cases pin the repair after Plite's own redraw | green |
| E29 | P1 | Read-only preview with a button in each block, caret at two@1, not focused | Press on a button whose handler selects one@0 to 3; focus the editor | two@1 in model and page | E32's case, which runs this control press after a cancelled touch. Its own case failed on no planted bug a kept case misses and was cut | green |
| E30 | P2 | Views A and B, B read-only with a parked caret at 0.0.1, A holding the caret | A tap on B; the press window ends; the browser puts its caret at 0.0.3; B gets focus; selectionchange | B at 0.0.3 | the reproduction in the run directory's open-repro folder | red, the same way as after the fix; owned by t_13309460 |
| E31 | P2 | Proposed preview, not focused | Press on three, during which a handler places two@1 and the browser puts its caret at three@2; focus with no render; selectionchange | three@2, the browser's click, as E13 picks | the reproduction in the run directory's open-repro folder | three@2, the same as after the fix |
| E32 | P1 | Read-only preview with a button in each block, focused, caret at two@1 | A touch on one that the browser cancels; press a button whose handler selects one@0 to 3; a render | two@1 in model and page | read-only-press-selection: a press on a control after a cancelled read-only touch, whose handler selects text | green |
| E33 | P1 | Read-only preview whose first leaf reads focus itself while the Editable does not re-render, model caret at two@1 | Press on one; the browser puts its caret at one@2 before focus; focus; the leaf replaces one's text; selectionchange | one@2 in model and page | E45's case, which runs this leaf after a hide and show. Its own case failed on no planted bug a kept case misses and was cut | red |
| E34 | P1 | The focus-render example's read-only editor inside an open shadow root | As E14 | As E14 | the shadow-root case in the run directory's shadow-repro folder; owner t_3faba581 | red in Chromium, Firefox and WebKit, because the outside-press release clears the click |
| E35 | P1 | A read-only view inside a non-editable wrapper, model caret at one@1 | As E1 | three@2 | read-only-press-selection: a view inside a non-editable wrapper | red |
| E36 | P1 | A view whose typing repair still retries, because the shown text differs from Plite's, then switched to read-only | Press on three; the browser puts its caret at three@2; the retries run; selectionchange | three@2 | read-only-press-selection: a typing repair still retrying when the view turns read-only | red |
| E37 | P1 | A read-only view that re-renders on focus, the page holding an older caret at one@1, model caret at two@1 | Press on three; focus and its render run before the browser places three@2; mouseup; selectionchange | two@1 until the import, then three@2 | read-only-press-selection: a click in Chromium's order | green |
| E38 | P1 | Read-only, focused, caret at two@1 in model and page, an Editable that does not re-render on focus | Click on two@1; mouseup; a blur clears the page's selection, as WebKit's does; focus without a pointer | two@1 in model and page | read-only-press-selection: a blur that clears the page's selection. A case whose blur moves the selection outside the editor failed on no planted bug and was cut | green |
| E39 | P1 | Read-only preview, model caret at two@1 | Press on one; the browser puts its caret at one@2; a decoration refresh replaces one's text, in Plite's text flow and in a React leaf; focus; selectionchange | one@2 | read-only-press-selection: a decoration refresh that re-renders the clicked leaf. The case in Plite's text flow failed on no planted bug a kept case misses and was cut; E46's and E49's cases pin the text flow's reads | red |
| E40 | P1 | Read-only, focused, caret at one@1 | Press on three; the browser puts its caret at three@2; a mouseup handler takes the event without placing and re-renders; selectionchange | three@2 | read-only-press-selection: a mouseup handler that takes the click | red |
| E41 | P1 | Read-only preview whose elements change their tag on focus and whose leaves are React components, while the Editable does not re-render, model caret at two@1 | Press on one; the browser puts its caret at one@2 before focus; focus; the element replaces one's block; selectionchange | one@2 in model and page | read-only-press-selection: an element that changes its tag on focus | red |
| E42 | P2 | Read-only preview whose first leaf moves its text after its chrome on focus without remounting it, while the Editable does not re-render, model caret at two@1 | Press on one; the browser puts its caret at one@2 before focus; focus; the leaf moves the text, which drops the caret to the leaf's start; selectionchange | one@2 | the round-3 probe in the run directory, probe D | red, one@0, the same as after the fix |
| E43 | P2 | Read-only preview, not focused, no model selection, the page holding a caret at one@2 that Plite never read | Press at one@2, which moves nothing; focus; the Editable re-renders; selectionchange | one@2 | the round-3 probe in the run directory, probe E | red, no selection, the same as after the fix |
| E44 | P1 | Read-only preview in Plite's text flow, focused, caret at one@1 in model and page | Press at one@1, which moves nothing; selectionchange; import; mouseup; a decoration refresh rewrites every line | The caret repaired at one@1 | E49's case, which runs this refresh on a caret the page did not show. Its own case failed on no planted bug a kept case misses and was cut | green |
| E45 | P1 | Read-only preview whose first leaf changes when focused, model caret at two@1 | Press on three, which the browser places at three@2; the editor is hidden and shown, which drops the press's turn-end task; press on one, which the browser places at one@2; focus; selectionchange | one@2 in model and page | read-only-press-selection: a click after the editor was hidden and shown during an earlier press. A case that replaces the Editable's root element after a read click fails the same way on the old turn flag and was cut, because it failed on no planted bug this case misses | red |
| E46 | P1 | Read-only preview whose elements remount an inner wrapper around Plite's text flow on focus, while the Editable does not re-render, model caret at two@1 | Press on one, which the browser places at one@2 before focus; focus; the wrapper remounts the flow; selectionchange | one@2 in model and page | read-only-press-selection: an element whose inner wrapper remounts on focus | red |
| E47 | P1 | An editable document of 1000 blocks, caret at one@1 | Shift+ArrowDown, whose native clear waits for a frame; the view turns read-only; press at three@3; the frame runs; selectionchange | three@3 in model and page | E50's case, which runs the same deferred clear with the click in another read-only editor. Its own case failed on no planted bug a kept case misses and was cut | red |
| E48 | P1 | Read-only, focused, a content root as the second block, above@4 to 5 selected | Shift+ArrowRight into the content root, whose native clear waits for a frame; press at after@2; the frame runs; selectionchange | after@2 | E51's case, which runs the same deferred clear with the click inside the content root, and E36's for the export gate. Its own case failed on no planted bug a kept case misses and was cut | red |
| E49 | P1 | Read-only preview in Plite's text flow, focused, model caret at one@1 that the page does not show | Press at one@1; selectionchange; import; mouseup; a decoration refresh rewrites every line | The caret repaired at one@1 | read-only-press-selection: a decoration refresh after a click on a model caret the page did not show | green |
| E50 | P1 | Two editors: an editable document of 1000 blocks, caret at one@1, and a read-only editor | Shift+ArrowDown in the first, whose native clear waits for a frame; press in the read-only editor at offset 2; focus it; the frame runs; mouseup; selectionchange | The read-only editor's caret at offset 2 in model and page | read-only-press-selection: a click's caret in another read-only editor | red |
| E51 | P1 | As E48 | Shift+ArrowRight into the content root, whose native clear waits for a frame; press inside the content root at body@1; focus it; the frame runs; mouseup; selectionchange | body@1 in the content root | read-only-press-selection: a click's caret inside a content root | red |
| E52 | P1 | An editable main root whose content root is read-only, focused, caret at above@5 | ArrowRight into the content root, whose focus retry waits for a frame; press at body@2; the frame runs; mouseup; selectionchange | body@2 in model and page | read-only-press-selection: the focus retry of an ArrowRight into a content root | red |
| E53 | P1 | Two editors: an editable one whose typing repair still retries, because its shown text differs from Plite's, caret at one@3, and a read-only one | Press in the read-only editor, which the browser places at offset 2; focus it; the shown text matches again and the repair runs; mouseup; selectionchange | The read-only editor's caret at offset 2 in model and page | read-only-press-selection: a typing repair still retrying in another editor | red (the repair puts the page's caret back at one@3 and the read-only editor has no selection) |
| E54 | P2 | Read-only, focused, a content root as the second block, above@4 to 5 selected | Shift+ArrowRight into the content root, whose native clear waits for a frame; press beside the content root, which the browser places inside it at body@1; the frame runs; mouseup; selectionchange | body@1 | the round-3 nested-click probe in the run directory | not run; after the fix the frame's clear keeps the click, and the main root's import then shows above@4 |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which review question owns this | Native input, which asks who may write the browser's state (look) | Selections, whose open review is about named roots | selection scope | detail |
| Where the design starts | While a read-only press is unread, exports leave the page's selection alone unless Plite placed or committed since; all three designers converged on it (look) | Place read-only clicks at mousedown; read the caret when focus arrives; give SelectionClaims a lone mode; write only when the model changed | press time; focus read; claims lane; write on change | big |
| A commit during an unread read-only press | The model wins and the click is dropped, because Plite cannot know where its commit left the browser's caret | Keep the click when the commit leaves the model caret where it was | keep clicks through edits | small |
| The zero-delay press window | Keep it; it answers whether a focus came from a press, for editable presses too | Fold it into the unread press and delete the timer | fold press window | small |
| Other inputs with the same problem | Keep them in the table as P2 rows for t_13309460, which decides them; this design covers none of E20 to E22 | Cover them here | cover P2 rows | small |
| A press the browser places but mousedown does not, while another view edits | Drop the click and keep the old caret, as today (E10) | Keep the click wherever the edit moves it | keep moved clicks | small |
| The clears and the focus retry a key schedules for the next frame | They wait for every press on the page, as the block selection's clear does. Otherwise a click within that frame loses its caret to them, whether it lands in the same view, in another editor or in a content root (E47, E48, E50 to E52) | Leave them as they are and lose those clicks | ungate key clears | small |
| Who a write of the page's selection asks | Every press on the page that holds a record, the export and the typing repair included, because the page has one selection and a repair can run frames after the click (E53) | Ask only the writer's own press, or only the press of the root that holds the page's selection, which misses a click in another editor or a press whose caret lands in a root nested in its own | own press | small |
| A handler that places during a click when nothing exports after the browser's placement | The browser's click wins in a lone editor, as in every engine today, and a handler that must win prevents the default; in peer views claims keep the handler's placement (E13, E31). Making the handler win costs a refusal of the press's later imports, about one branch in the funnel and a jsdom case (look) | The handler's placement wins | handler wins | small |
| A redraw while a read-only press is unread | Plite reads the page's selection before a React commit, when a text string unmounts and before its own text flow writes, because each may replace the text that holds the caret (E24, E33, E39) (look) | Leave the page alone and lose a caret whose text the redraw replaces | no commit read | small |
| A tap into a parked read-only view whose focus comes after the press window | The view restores its old caret, as today (E30), and t_13309460 owns it. Telling that late focus from a focus after a cancelled touch needs a pointerup and pointercancel listener for each read-only touch press, and a tap is not the click this task fixes (look) | Keep the tap through that focus | keep late taps | small |
| Proof tool for event orders | Rely on the table's rows as suite tests, because the handler rows (E11 to E13, E31) pick their winner by timing and would fail an every-order check by construction | Build a jsdom check that tries every order of press, caret move, focus, render, event, import, release and edit | event-order check | small |
| A click in a read-only view inside a shadow root | Leave it to t_3faba581, because it fails the same way at base in all three engines, because the document's outside-press listeners take the click for a press outside the editor. The press opener keeps reading the event's own target (E34) (look) | Fix both listeners and the opener's target here, with the shadow-root case in three engines and the shadow-dom suite | shadow here | small |
| The native subject page | Keep the new page UzUNpX4kxiKhtBN8L3m7gy, because the old page S29TaM1oXZUspK5V2vPb3j was deleted and no longer opens | Leave the subject without a published page | drop new page | small |
| What a press records | The page's selection inside the root, so only a selection that moved since the press counts as newer; it also answers a press that placed nothing, a cleared selection and Chromium's focus-first order, which round 2 found (E37, E38) (look) | A per-path guard for each: end the press on blur and on pointercancel, and check the stamp again at mouseup | per-path guards | small |
| Where a redraw below the Editable reads the click | A click survives a block, a wrapper or a leaf that redraws on focus, which edits two files outside the editor folder (E33, E41) (look) | Cover only a leaf that redraws, so a block or wrapper that redraws still loses the click | leaf only | small |
| A leaf that moves the clicked text on focus without redrawing it | The click is lost, as today (E42), because only a hook in every leaf could see the move (look) | Add that hook to every leaf | leaf hook | small |
| A click on a caret the page shows but Plite never read | The click is lost, as today (E43). Blur keeps Plite's selection, so a second click on the same spot works (look) | Treat the page's caret as the click whenever Plite has no selection | page caret wins | small |
| Plite's own redraws after a click | Plite tells its own caret moves apart from a click, so it still repairs a caret it broke (E28, E44) | Track only Plite's own selection writes, which misses a caret a redraw moves | write record | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read-only press | The root controller is off; the model learns the click at selectionchange or mouseup | No render writes over a press's caret that Plite has not read | plitejs/react editable | The only signal comes after the render (E1 to E5) | Internal | E1 to E5, E14 | A read-only click lands off the browser's point, or an edit leaves a stale caret | rearchitect |
| Export guard | `pendingDOMSelectionImport`, set by the notification | Stays the scheduling flag | plitejs/react editable | It cannot cover the time before the notification | None | E2, E3 | None | keep |
| Lone-editor claims | SelectionClaims returns early without peers | Unchanged; the unread press is its own owner, and a funnel around claims' decision settles it | plitejs/react editable | A lone mode would bring release listeners and claims' DOM movement note to every editor | None | E10, E19 | None | keep |
| Export on every render | Each render compares and writes | Unchanged, except that it yields while a read-only press is unread and the model unchanged | plitejs/react editable | Plite's own leaf renders break the shown caret without a model change, and only this compare repairs them | Internal | E1 to E4, E7 to E9 | A repair waits while a press Plite never reads stays open | keep |

## Steps

### Before the design

- [x] Run every row's case that exists at e70fb8abf5, whose source this worktree holds unchanged, through `proof.mjs`, and fill At base; a row whose case does not exist yet runs at base when its slice writes it. Proof: one log per suite file and browser engine, cited by a `baseline` row.
- [x] Architect: three runners on this table, judged blind. Proof: the runners' answers and the judge's verdict in the run directory, cited by an `architect` row.
- [x] Prove each premise of the winner and its grafts that existing code already holds, by running it. Proof: one probe log per premise.
- [x] Panel the finished plan, at most three rounds. Proof: `seats` rows and their answers.

### Build

- [x] Slices from the design, each landing when it fixes a failing P0 or P1 row and breaks no passing row. Proof: the rows' suite tests and browser specs on the slice's tree, and its diff panel.

### Close

- [x] Final proof on the last bytes: E14 to E18 five times per engine, the hand drive on /docs/suggestion. Proof: the logs and `hand-drive.mjs check`.
- [x] Fold the design into the native subject file and settle t_13309460 by the P2 rows. Proof: the render with `--folded`.

## Evidence

### Requirements

- A click, tap or caret key leaves the caret where the browser put it, in editable and read-only views, and the next Shift+Arrow extends from there. Plite's Vision requires model, DOM, caret, focus owner and follow-up typing for every browser editing claim. Four limits lose the click as at base: a tap into a parked read-only view whose focus arrives after the press window (E30, owned by t_13309460), a view inside a shadow root (E34, owned by t_3faba581), a leaf that moves the clicked text on focus while the Editable does not re-render (E42), and a click on a caret the page shows but Plite never read, with no model selection (E43).
- A selection that a handler or command places during a press wins over the press when Plite exports after the browser places the click (E11, E12). When nothing exports after that, the browser's click wins in a lone editor, as at base (E13, E31); the owner's word "handler wins" pivots the run to change that.
- An edit that moves the model's caret during a press that placed nothing shows the moved caret (E7 to E9).
- A view takes the caret only from its own gesture, as the view selection import plan decided (E10, E19).
- Selection repair and DOM writes re-enter the root scheduler, in the order model, DOM read, DOM write, selection repair; a timer may not decide who owns the selection (Vision, Plite runtime loop).
- `plitejs/react` owns input import and native selection export (Vision, Plite rules), so the fix stays in that entrypoint.
- A read-only authored preview maps a click from shown to stored places (#5195), so any new placement path uses the same mapping as the import.
- No per-node hot work, and no listener or observer added to every lone editor without a measured budget.
- The brief limits writes to `packages/plitejs/src/react/editable`. The fix also writes the text string's `ref` in `react/components` and the node binding's ref in `react/hooks`, because before a commit below the fence React runs nothing but ref detaches, and a binding detaches before its children's mappings go.

### Lanes

- **Place at press time.** Read-only text presses run the same mousedown placement that editable presses run, so the model holds the click point before focus. It needs no inference and works in every engine, and it removes a difference between the two modes instead of adding a mechanism. Modified clicks, multi-clicks, presses on selected text and taps whose mousedown comes after focus still wait for the import. It costs one caret-from-point lookup per press. Predicted benefit: E1 to E4 and E14; E5 depends on when the compatibility mousedown fires.
- **Read at focus.** A focus that comes from a press imports the browser's selection before it publishes focus, when nothing placed since the press began. It covers every press kind in Firefox. In Chromium and WebKit, focus comes before the caret moves, so it reads the old selection for a moment. It covers only renders that focus causes.
- **One owner for single editors.** SelectionClaims tracks gestures for a lone editor too, and every exporter asks it whether the page holds an unread selection. It covers the whole class, t_13309460 included. It inherits the movement note's known ambiguity (t_10d9a772), and it adds listeners and an observer to every editor at a cost no one measured.
- **Write only on change (the strongest deletion).** Delete the export that runs on every render, and write the selection only when Plite has something new to show: a model change, or a commit that moved the shown caret. It covers every app re-render. The commit export then faces the same question, and E4 still needs it to judge whether a commit moved the caret.
- **Read-only views never write.** As Lexical does, a read-only view only reads the page's selection and writes it only for an explicit placement. It breaks E7 to E9, where an edit moves the caret of a press that placed nothing, unless a model change still counts as a reason to write, which makes it the write-only-on-change lane limited to read-only views.
- **Stop.** Keep the current design. It loses, because any Editable that re-renders on focus drops a read-only click's caret in Firefox, and many registry components read the editor's focus.
- **Press record (iteration 1).** Reverted after three panel rounds; it stays evidence only.

Proof limits: E14 runs on a hidden proof example, focus-render, because since 7f2eacb6eb no shipped route changes an Editable's props on focus; the comment-mode example re-renders its pane on focus but not its Editable, and keeps the caret at base in all three engines. An empty line needs no read before it redraws, because its zero-width string keeps the caret at base and with the fix. A decoration refresh over 100 leaves after a read click reads the page's selection 10 times with the fix and 4 times at base, against 103 on the round-2 build by Astra's count. No phone or screen-reader run backs any row. Three mechanisms have no case that fails without them on the final bytes. The read-only condition on the press opener only keeps editable presses from opening a record. The page re-read when a turn ends now runs after the repair tasks of its flush, so it only saves one import of Plite's own caret. The page read also checks that the selection lies inside the root. The export after a render asks every press too, but no case fails when it asks only its own, because its focus check already stops it while another editor holds focus; the round-3 blur probe kept the click with the round-2 check. No kept case tells asking every press from asking only the press of the root that holds the page's selection. E54 would, but it still loses its caret when the main root imports. A press leaves the page's list when its runtime is destroyed, and no case sees that, because a destroyed root's press never counts a selection as newer.

Recall (no time window, three Codex readers over every transcript of this project): no earlier session fixed this bug; the press record was reverted to e70fb8abf5; 7688e161fe gave peer views SelectionClaims and its write record; ea413417bb opened the press window at the Editable's pointerdown; t_13309460, t_c422f5bc, t_10d9a772 and t_f2e79968 hold the class's open questions.

[2026-10-04-native-audit](../research/review-records/2026-10-04-native-audit.json) reopens, because its Stop judged how input becomes document changes, and the selection export that writes over an unread click is a competing writer of browser state it did not review. Its Stop on merging the input owners still holds.

### Dependents

- accessibility, basic, clipboard, code, compiler, distribution, editing, html, media, mentions, pagination, plate-api, proof, runtime, table, ui and uploads: unaffected, because they import Plite's public React or internal entries for rendering, commands or plugin wiring, and no export they import changes; only press timing inside read-only roots does.
- react: `packages/platejs/src/react/components/NodeSelection.tsx` turns itself off in read-only views and writes the selection only for its own node selection gesture, so read-only press handling does not reach it; a lane that changes every export would.
- search: `apps/www/src/registry/components/editor/find.tsx` focuses the editor through `editor.api.dom.focus()`, a programmatic focus, which E20 and the focus lane touch.

Model: claude-opus-5-5 (Claude Code), effort xhigh.

## Close

What landed. A press on a read-only view's text now opens an unread press, which records the shown document, the placement generation and the page's selection inside the root. Until Plite reads that click, every write of the page's selection first asks every press on the page, and leaves the page alone while one holds a newer selection. Before a redraw that could replace the clicked text, the runtime reads the click. The new owner is `UnreadPress` in `packages/plitejs/src/react/editable/unread-press.ts`. The text string, Plite's text flow and the node binding's ref read the click below the commit fence. A hidden focus-render example in apps/www and its Plite browser spec reproduce the bug, and a plitejs patch changeset describes the fix.

Reversals and deviations come first.

- Plan round 2 changed what a press records, from the shown document and placement alone to also the page's selection inside the root. A press that placed nothing, a selection the page cleared and Chromium's focus-first order each counted as a click before (E37, E38).
- Diff round 2 made the deferred clears and the content-root focus retry ask the press of the root that holds the page's selection. Diff round 3 replaced that with every press on the page, because a typing repair in one editor wrote over a click in another (E53). Round 3 also cut the cases of E47 and E48, which failed on no planted bug that a kept case misses.
- The brief limited writes to `react/editable`. The fix also writes the text string and text flow in `react/components` and the node binding in `react/hooks`, because before a commit React runs only ref detaches below the fence.
- The hand drive ran in the built-in pane, which draws no frames, so an ArrowRight into an editable void's child root ran only in the browser suite.

Proof and its limits, each from its decision-log row:

- E53 fails at e70fb8abf5. The typing repair leaves the page's caret at offset 3 in the editable editor, and the read-only editor has no selection.
- The plitejs package checks pass on the final bytes, with 1971 of 1971 react tests, typecheck, test typecheck and lint. Their first run failed test typecheck on fakes that three contract tests kept for a cut parameter; those files now match base.
- 41 of 46 mutants fail a kept case. The five that survive are the mechanisms Proof limits names.
- From apps/plite, focus-render (E14, E16, E18), comment-mode (E17) and read-only (E23) pass five of five runs in Chromium, Firefox and WebKit, 45 of 45 runs. From apps/www, the suggestion preview spec (E15) passes 15 of 15 in each engine. At base, E14 fails in Firefox with a null model selection after the click.
- The editable-voids spec passes 24 of 24 in each engine.
- The hand drive covers focus-render, the three /docs/suggestion views, read-only, comment-mode and editable-voids at desktop width, and the hand-drive check exits 0.
- No phone, tablet or screen-reader run backs any row, and Playwright's WebKit is not Safari.

Counts. 7 steps, 7 done. The card's one ask, "Keep a click's caret in a read-only editor in Firefox", is done. No owner message arrived during the run. The plan had 3 panel rounds and the diff had 3, each with Opus, Astra and Sol at xhigh. t_13309460 takes this plan's P2 rows as a folded finding, and t_3ae73c08 holds the one P1 finding this run found outside its task.

## Open work

- E30, a tap into a parked read-only view whose focus comes late. owner: t_13309460. stop: that task's run, which takes the reproduction from the run directory's open-repro folder.
- E34, a click in a read-only view inside a shadow root. owner: t_3faba581, which fixes the outside-press release and the opener's target and takes the reproduction from the run directory's shadow-repro folder. stop: that task's landing.
- E31, a handler's placement during a click with no export after the browser's. owner: the owner, whose word "handler wins" starts it. stop: that word.
- E42, a leaf that moves the clicked text on focus without remounting it while the Editable does not re-render. owner: the owner, whose word "leaf hook" starts it. stop: that word.
- E43, a click on a caret the page shows but Plite never read, with no model selection. owner: t_13309460, whose E20 places such a caret from a page script. stop: that task's run, which takes probe E from the run directory's round-3 probe.
- E54, a read-only click beside a content root whose caret the browser puts inside it. The frame's clear now keeps the click, but the main root's import then replaces it with the main root's own selection, a path this fix does not change. owner: the owner, whose word "nested click" starts it. stop: that word.
- A typing repair in one editor that runs after another editor read its click still moves the page's selection out of the focused editor, as at base, because the repair checks neither focus nor where the selection is. owner: the owner, whose word "repair focus" starts it. stop: that word.
