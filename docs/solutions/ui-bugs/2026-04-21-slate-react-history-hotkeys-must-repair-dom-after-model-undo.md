---
title: Slate React history hotkeys must repair DOM after model undo
date: 2026-04-21
last_updated: 2026-05-13
category: ui-bugs
module: slate-v2 slate-react
problem_type: ui_bug
component: tooling
symptoms:
  - Cmd+Z on the richtext example updated the Slate model but left inserted text visible in the editor DOM
  - handle-only undo tests passed while the real keyboard history path was broken
  - static Playwright needed rebuilt package output before it reflected slate-react source fixes
  - generated mobile paste-normalize-undo stress could duplicate text or crash React during DOM removal when undo replay used the wrong history path
  - Cmd+Z inside a native input in an editable void cleared the input instead of removing the newly inserted void block
  - typing at the end of the scroll-into-view example, scrolling away, undoing, and typing again could leave the caret at the start of the edited block
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, history, undo, redo, dom-repair, richtext, internal-controls]
---

# Slate React history hotkeys must repair DOM after model undo

## Problem

Keyboard undo and redo in `slate-react` can mutate the Slate model while leaving browser-owned text DOM stale. The same ownership bug appears when browser history events originate inside native controls embedded in editable voids. This breaks the real editing experience even when model-level history and handle-only tests look green.

## Symptoms

- `/examples/richtext` accepted typed text, but Cmd+Z left the text visible.
- The browser handle `undo()` path passed because it already forced a render after model history changes.
- A connected local Chrome 146 repro showed `Editor.string(editor, [])` no longer contained the inserted text after Cmd+Z, while `editor.textContent` still did.
- `/examples/editable-voids` inserted a new editable void, typed into its native input, then Cmd+Z cleared only the native input while the inserted void block stayed in the document.
- `/examples/scroll-into-view` could keep the first repeated typing visible, but after undo a delayed native selection update moved the model and DOM caret to the start of the edited block.

## What Didn't Work

- Treating a browser-handle undo proof as enough coverage. That path is not the same as a user pressing Cmd+Z.
- Trusting bundled Playwright Chromium alone. It did not expose the same stale-DOM behavior as the connected local Chrome.
- Rerunning static Playwright without rebuilding `slate-react`; the site can consume stale package output.
- Treating every internal-control event as browser-native. Typing, paste, and arrow keys inside native controls should stay native-owned, but `historyUndo` and `historyRedo` still represent the editor transaction that created or changed the owning Slate node.
- A Playwright row that only asserted text visibility after repeated manual scroll-away. It missed the delayed undo path because it never asserted the Slate selection, DOM caret, and follow-up typing target after the browser's late `selectionchange`.

## Solution

Route keyboard and native history events through Slate-owned history, then force
a view repair only when the history batch is not already handled by direct DOM
text sync:

```ts
if (Hotkeys.isUndo(nativeEvent)) {
  event.preventDefault()

  if (
    applyModelOwnedHistoryIntent({
      direction: 'undo',
      editor,
    }) &&
    shouldForceRenderAfterModelOwnedHistory(editor)
  ) {
    forceRender()
  }

  return
}
```

Use the same policy for redo and native `historyUndo` / `historyRedo` events.
The render decision should be based on the last committed operations:

```ts
export const shouldForceRenderAfterModelOwnedHistory = (editor: Editor) => {
  const commit = Editor.getLastCommit(editor)

  return (
    !commit ||
    commit.operations.some(
      (operation) =>
        operation.type !== 'insert_text' &&
        operation.type !== 'remove_text' &&
        operation.type !== 'set_selection'
    )
  )
}
```

Classify native browser history before the internal-control early return:

```ts
if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
  return 'history'
}

if (internalTarget) {
  return 'internal-control'
}
```

Then apply model-owned native history before stopping internal-control
`beforeinput` propagation:

```ts
if (applyModelOwnedNativeHistoryEvent({ editor, event })) {
  event.preventDefault()
  event.stopImmediatePropagation()

  if (shouldForceRenderAfterModelOwnedHistory(editor)) {
    repair.requestEditableRepair({ forceRender: true, kind: 'force-render' })
  }

  handledDOMBeforeInputRef.current = true
  return
}

if (decision.internalTarget) {
  event.stopImmediatePropagation()
  return
}
```

Mounted editor text and block renderers can opt out of rerendering after synced
text-only commits, but generic selector hooks must still report model text
updates to app code.

For model-owned history hotkeys, request the same caret repair lane as other
model commands instead of only forcing a render:

```ts
const getModelOwnedHistoryRepair = (
  editor: ReactEditor
): EditableRepairRequest => ({
  focus: true,
  forceRender: shouldForceRenderAfterModelOwnedHistory(editor),
  kind: 'repair-caret',
  selectionSourceTransition: {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  },
})
```

While that history repair is pending, delayed native `selectionchange` events
must not cancel the queued model-owned repair or import stale DOM selection over
the undo target.

## Why This Works

The native/direct DOM text lane can leave React with no urgent render to perform
after history changes. Undo correctly mutates the Slate model, but the DOM can
still contain browser-inserted text until `slate-react` explicitly reconciles
the view.

Non-text history batches still need that explicit repair. Text-only history
batches are different: direct DOM text sync already owns the visible text. A
broad React render there can race the browser-owned DOM and produce duplicate
text or node-removal crashes during mobile replay.

Internal controls need a smaller exception. Their ordinary native input events
must not leak into the outer editor, but browser history events are not ordinary
native typing. If a focused input sits inside a void block that Slate just
inserted, Cmd+Z should undo the Slate insertion before the browser clears the
input's private value.

The scroll-into-view caret bug was the same ownership rule in a more subtle
shape. The history batch restored the right model selection, but Chrome still
held a stale DOM caret at offset `0`. If the history path only syncs once, a
late native `selectionchange` can overwrite the repaired model selection.
Keeping history model-owned until the caret repair completes prevents the stale
DOM point from winning.

## Prevention

- Test history through real keyboard hotkeys, not only editor handles.
- Assert both `Editor.string(editor, [])` and visible editor DOM after direct/native DOM input.
- Rebuild touched packages before static Playwright runs when site examples consume package output.
- Use connected-browser verification for browser-version-specific editing bugs; bundled Playwright can miss real Chrome behavior.
- Keep generated paste/normalize/undo browser contracts replaying Slate-owned
  history, not browser-native contenteditable undo.
- Do not make generic runtime selectors stale to optimize mounted editor
  internals. Put the synced-text skip on the internal render subscribers that
  need it.
- Add explicit browser rows for editable void input undo and package-level
  intent classification so internal-control history cannot silently fall back
  to native input undo.
- When adding new direct force-render calls for history repair, update the
  static authority inventory in the same slice.
- For scroll or layout-sensitive history bugs, assert the selection and caret
  after a delay, then type again. Text visibility before undo is not enough.

## Related Issues

- [Slate public single-op writes should use `Editor.apply(...)` and keep `onChange` behind subscribers](../developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md)
- [Slate React focus tests need Vitest with jsdom 20, not Happy DOM or jsdom 26](../test-failures/2026-04-17-slate-react-focus-tests-need-vitest-jsdom-20-not-happy-dom-or-jsdom-26.md)
- [Slate React internal controls must be native-owned](../logic-errors/2026-04-22-slate-react-internal-controls-must-be-native-owned.md)
