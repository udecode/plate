# Native input

Page: https://claude.ai/artifact/EBmyC5xS9iaGutbfSB3hjJ

The ledger asks how browser input becomes canonical edits. The 2026-10-04 audit stopped. Each mounted Editable has one input controller built on the shared `DOMInputRuntime`, every accepted edit lands as a canonical transaction through either the model command path or the single native-text writer, and the integrity observer restores DOM mutations nothing authorized. No competing write path exists to remove. `node tooling/scripts/review-ledger.mjs show native` prints the scope's history. Since 2026-10-24, every write of the page's selection first checks whether a read-only press holds a click Plite has not read yet, and leaves that click alone ([the plan](../2026-10-24-native-unread-press-selection.md)).

## Public API

A component that re-renders on focus reads the editor's focus as usual, and a read-only click's caret survives that render.

```tsx
// apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx
const modelSelection = useEditorSelection();
const selection = useEditorFocused() ? modelSelection : null;
```

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Shared input state | `packages/plitejs/src/react/editable/editable-dom-runtime.ts` binds one `DOMInputRuntime` per Editable. |
| Arbitration | `runtime-input-events.ts` excludes Android from root repair and suppresses React repair after a root claim. |
| Native text | `dom-repair-queue.ts` writes accepted native text through canonical transactions. |
| Integrity | The observer restores unauthorized DOM changes and recognizes only its exact owned attributes. |
| Composition | IME lifetime and composition-owned history grouping stay with the native owner; `ReactApi.settleInput()` flushes a pending composition end ([autocomplete](autocomplete.md)). |
| Press selection | `UnreadPress` in `react/editable/unread-press.ts`, one per Editable runtime, decides whether the page holds a selection that Plite has not read and may not write over. Each write of the page's selection first asks `claimPageSelection`. That asks every press on the page that holds a record, because the page has one selection, and a write from any root can replace a click in another editor or in a content root. Those writes are `syncEditableDOMSelectionToEditor`, each attempt of the typing repair queue, the selection controller's native clear, the clears that the caret engine and content-root navigation defer, and the focus retry of an arrow key into a content root. While that selection is newer, the runtime reads it before a React commit, when a node binding, a text string or Plite's text flow below the fence unmounts, and before its own text flow writes, and the import decision funnel ends the press. When an ask finds nothing newer, the rest of that turn is Plite's own, and the record takes the page's selection again in a microtask once the turn ends. The turn is part of the record, so the next press or read ends it even when the root drops that microtask. It sits beside `SelectionClaims` on the runtime. The editing kernel still owns the selection source and repair scheduling, and `UnreadPress` sets neither. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Absorbing router, controller and kernel into `DOMInputRuntime` | No caller benefit; the binding already shares that state. |
| Uniform model-only handling | Still needs IME reconciliation. |
| Uniform DOM ownership | Cannot replace semantic commands and renderer safety. |
| A generic input primitive | No current caller. |

## What other editors do

A Codex reader read ProseMirror at ca4c78e9b5, Lexical at dd5c41b131, Slate at 945a484df2 and CodeMirror at fbff59ba00 from source, and ran none of them. None of them guards every unread selection. ProseMirror and CodeMirror write their selection only when it changed, which by the source keeps a render from writing over a click they have not read yet, and CodeMirror also places a click itself at mousedown. Lexical never writes the selection in a non-editable view. Slate, whose every-render write Plite inherited, names this bug in a comment: a layout-effect write before its selectionchange import "can remove the DOM selection accidentally" (`slate-react/src/components/editable.tsx:230`).

The [editor comparison](editor-comparison.md) holds the wider cross-editor reads.

| Editor | A plain click | When it writes the selection | On focus | Non-editable view |
| --- | --- | --- | --- | --- |
| ProseMirror | The browser places it; `selectionchange` reads it | Only after the document or its selection changed, and not during a mouse press whose selection it already saw (`index.ts:207`, whose comment names "an update arriving right between a DOM selection change and the selectionchange event") | Writes its own selection after 20 ms, only if the page's differs from the last one it saw | Same press path; reads and writes while focus is inside |
| Lexical | The browser places it; `pointerdown` marks the next `selectionchange` as a mouse one | At commit, when the update changed the selection, after comparing with the live page selection | Dispatches a focus command; no selection read or write | Regular commit writes are off; it only reads (`LexicalUpdates.ts:713`) |
| Slate | The browser places it; a 100 ms throttled read | Every render, when the page's selection differs from the model's, or clears it when the model has none | Marks focus; the provider re-renders | Same writer while marked focused; the comment above names the bug |
| CodeMirror | Computes the point at mousedown, selects it and prevents the browser's placement (`input.ts:385`) | On a view update, when the wanted selection differs from the last one it read | Updates after 10 ms; no direct read | Same computed press path |

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
- The 2026-10-04 audit's 5066 safety-flag cut and composition-owned history stand.

## Open work

- Double insertion, lost pending input and split undo stay the critical regression risks; no physical-device IME run backs the Stop. owner: Verify. stop: a device run per platform.
- E30, a tap into a parked read-only view whose focus comes late. owner: t_13309460. stop: that task's run, which takes the reproduction from the run directory's open-repro folder.
- E34, a click in a read-only view inside a shadow root. owner: t_3faba581, which fixes the outside-press release and the opener's target and takes the reproduction from the run directory's shadow-repro folder. stop: that task's landing.
- E31, a handler's placement during a click with no export after the browser's. owner: the owner, whose word "handler wins" starts it. stop: that word.
- E42, a leaf that moves the clicked text on focus without remounting it while the Editable does not re-render. owner: the owner, whose word "leaf hook" starts it. stop: that word.
- E43, a click on a caret the page shows but Plite never read, with no model selection. owner: t_13309460, whose E20 places such a caret from a page script. stop: that task's run, which takes probe E from the run directory's round-3 probe.
- E54, a read-only click beside a content root whose caret the browser puts inside it. The frame's clear now keeps the click, but the main root's import then replaces it with the main root's own selection, a path this fix does not change. owner: the owner, whose word "nested click" starts it. stop: that word.
- A typing repair in one editor that runs after another editor read its click still moves the page's selection out of the focused editor, as at base, because the repair checks neither focus nor where the selection is. owner: the owner, whose word "repair focus" starts it. stop: that word.
- Two Android IME bugs reproduced 5 of 5 times (Gboard Korean commits each jamo; autocorrect on space appends the word) exist only as local drafts in `docs/plite/research/2026-10-02-agentic-e2e-testing/issue-drafts/`. owner: Ziad. stop: filed through `maintainer`'s issue-draft mode, or rejected. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
