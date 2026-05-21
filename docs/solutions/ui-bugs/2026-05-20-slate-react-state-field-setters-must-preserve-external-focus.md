---
title: Slate React state field setters must preserve external focus
date: 2026-05-20
category: ui-bugs
module: slate-v2 slate-react state-fields browser-selection
problem_type: ui_bug
component: tooling
symptoms:
  - Clicking the Document State example editor did not reliably place focus in the body.
  - Typing in the document title input moved focus and DOM selection back to the editor.
  - Undoing a state-only title history batch moved focus back to the editor.
  - A stale focus retry after title undo/redo could throw `Could not set focus, editor seems stuck with pending operations`.
  - Title input keyboard undo/redo could use the browser's native input history instead of Slate state-field history.
  - Repeated title input undo stopped after the title batch and left the prior editor-content batch untouched, or let the editor reclaim focus.
  - Existing Playwright coverage passed because it used model selection helpers instead of real clicks.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, state-fields, selection, focus, playwright]
---

# Slate React state field setters must preserve external focus

## Problem

The Document State example exposed two browser-facing failures: the styled
editor root was not actually clickable, and title-field keystrokes stole focus
back to the editor. The state field API looked clean, but the browser behavior
was not honest.

State-only history replay has the same ownership hazard. Undoing a title-field
history batch updates only editor state, but a React render can still export the
stale model selection back to the DOM and focus the contenteditable.

Even after the ownership fix, stale focus retries must fail closed. A focus
repair request can be superseded by an external title input before the DOM node
map settles; exhausting retries must leave focus unchanged, not crash the app.

The title input must also own its keyboard history shortcut. A controlled input
backed by a Slate state field should not let the browser's native input undo
create a second ordinary state patch. It should run Slate history for every
available history batch and keep focus in the title input, even when repeated
undo crosses from title state into editor content.

## Symptoms

- `editor.selection.select(...)`-based Playwright coverage stayed green while
  real mouse clicks failed.
- Playwright reported parent elements intercepting clicks on the contenteditable
  root when the example wrapped a styled `<Editable>`.
- After focusing the title input and typing, `document.activeElement` became
  the editor root and the DOM selection moved back into editor text.
- After typing in the editor, typing in the title input, then undoing the title
  history batch, the editor root became focused again.
- After title undo/redo, `DOMEditor.focus` could keep retrying while the node
  map was dirty and eventually throw into the Next error overlay.
- Keyboard undo/redo in the title input updated the title, but the commit was
  not `historic`, so the example was bypassing Slate state-field history.
- Repeated keyboard undo from the title input reverted the title batch, then
  failed to apply the prior editor batch while the title input remained active.

## What Didn't Work

- Scoping the test harness with a normal wrapper around `<Editable>` made the
  contenteditable easier to find, but the wrapper intercepted clicks because
  Slate's default editable style includes `z-index: -1`.
- Passing `metadata.selection.dom = 'preserve'` to state updates was not enough
  until the React DOM-selection bridge actually checked that policy before
  exporting the model selection back to the DOM.

## Solution

Keep wrappers around styled editables non-intercepting, and override the
editable root `zIndex` when the example gives it its own border/background:

```tsx
<div className={editorSurfaceCss} id="document-state-editor-surface">
  <Editable
    className={editorCss}
    id="document-state"
    spellCheck={spellcheckEnabled}
    style={{ zIndex: 0 }}
  />
</div>
```

Make `useSetStateField` safe for external controls by default:

```ts
editor.update(
  (tx) => {
    tx.setField(field, value)
  },
  {
    metadata: {
      selection: { dom: 'preserve', focus: false, scroll: false },
    },
  }
)
```

Then make the Slate React selection bridge honor `selection.dom: 'preserve'`
before it mutates the browser selection.

State-only history replay should use the same selection policy and should not
restore the saved editor selection:

```ts
editor.update(fn, {
  metadata: {
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: 'historic',
})
```

Only operation-backed history batches should restore `selectionBefore`.

Finally, make `DOMEditor.focus` fail closed when retry budget is exhausted:

```ts
if (options.retries <= 0) {
  return
}
```

For the example's title input, intercept undo/redo shortcuts before the browser
uses native input history. If a Slate history batch exists, run it with DOM
selection preservation:

```tsx
event.preventDefault()
event.stopPropagation()

if (hasHistoryBatch) {
  editor.update(
    (tx) => tx.history.undo(),
    {
      metadata: {
        selection: { dom: 'preserve', focus: false, scroll: false },
      },
    }
  )
}

restoreTitleFocus()
```

## Why This Works

State fields are often edited from controls outside the contenteditable surface.
Those writes must update Slate state and history without treating the stale
editor selection as the browser's current selection. Preserving the DOM
selection keeps focus in the input, while `focus: false` and `scroll: false`
avoid the related focus and scroll side effects.

State-only history replay is still a state-field write from the browser's point
of view. Replaying the patch should change metadata, comments, settings, title,
or annotations without making the editor reclaim focus.

Focus retry exhaustion is also not a model invariant. It is a best-effort DOM
repair path during a transient render gap. Returning preserves the live external
focus owner and lets later selection sync do normal work.

Intercepting every title-field history shortcut makes the example honest: the
title field is still part of the document state/history model, and repeated
undo/redo walks the same history stack as the editor. The active DOM owner still
remains the title input because the command carries selection preservation
metadata.

The example clickability fix is separate: a styled editable root with border,
background, and padding needs to sit in front of its parent. Otherwise the page
can look editable while click hit-testing lands on an ancestor.

## Prevention

- Interaction examples with external controls need Playwright rows that use
  real clicks and `page.keyboard.insertText`, not only model selection helpers.
- If an example wraps `<Editable>` only for test scoping, the wrapper should not
  create a click target over the editor.
- Any metadata contract like `selection.dom: 'preserve'` needs a direct unit
  assertion and a browser row proving the DOM is actually preserved.
- Test state-only undo separately from the original state-field setter path.
  The setter can be correct while `tx.history.undo()` still exports stale
  editor selection.
- Add an explicit dirty-node-map focus test. Browser examples may not reproduce
  every retry timing, but the low-level contract should still guarantee no
  runtime throw.
- Assert `tags:historic` for keyboard title undo/redo. Focus staying put is not
  enough if the example bypasses Slate history.
- Add a repeated-undo row that starts in the editor, types in the title, then
  presses undo twice from the title input. The second undo must change the
  editor model and DOM text without focusing the editor.

## Related Issues

- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
- [Slate React keydown must import DOM selection before model-owned navigation](./2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
- [Slate React repair-induced selectionchange must stay model-owned](./2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
