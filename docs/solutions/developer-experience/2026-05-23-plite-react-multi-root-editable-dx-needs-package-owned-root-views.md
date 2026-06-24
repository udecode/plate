---
title: Plite React multi-root Editable DX needs package-owned root views
date: 2026-05-23
category: docs/solutions/developer-experience
module: plite slate-react multi-root dx
problem_type: developer_experience
component: tooling
symptoms:
  - "The canonical multi-root example had to import SlateRuntime and createEditorView."
  - "App code tracked activeRoot and repaired DOM selection with window.getSelection."
  - "Undo/redo toolbar code created root views manually instead of using package-owned root editors."
  - "ReturnType<typeof usePliteRootEditor> erased history extension types in site typecheck."
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [plite, slate-react, multi-root, editable-root, dx, typecheck]
---

# Plite React multi-root Editable DX needs package-owned root views

## Problem

The multi-root document example taught the runtime substrate as the normal app
API. Users had to wire `SlateRuntime`, create root views manually, track the
active root in React state, and repair DOM selection from app code.

## Symptoms

- `site/examples/ts/multi-root-document.tsx` imported `SlateRuntime`,
  `createEditorView`, `usePliteRuntimeState`, and `usePliteViewState`.
- The example kept `activeRoot` in local React state and used `flushSync` before
  focusing root surfaces.
- Title and history flows manually preserved or restored focus with
  `window.getSelection()`, `document.createRange()`, and `selectionchange`.
- After the package DX moved into hooks, `ReturnType<typeof usePliteRootEditor>`
  in helper signatures dropped extension-specific `state.history` and
  `tx.history` types during `bun typecheck:site`.

## What Didn't Work

- Keeping `<SlateRuntime><Plite root>` as the canonical example shape. That is a
  useful substrate, but it makes app authors own runtime/view wiring.
- Fixing the example by hiding the old code in a product wrapper. Raw Plite
  should expose primitives: one provider, root-bound editables, and root hooks.
- Typing helpers with `ReturnType<typeof usePliteRootEditor>`. Generic hook
  return extraction widened the extension tuple enough for site typecheck to
  lose history fields.

## Solution

Make the normal API one editor provider with root-bound editables:

```tsx
const editor = usePliteEditor({
  extensions: [documentTitle],
  initialValue: {
    roots: {
      footer: [{ type: 'paragraph', children: [{ text: 'Prepared' }] }],
      header: [{ type: 'paragraph', children: [{ text: 'Confidential' }] }],
      main: [{ type: 'paragraph', children: [{ text: 'Body' }] }],
    },
  },
})

return (
  <Plite editor={editor}>
    <Editable root="header" aria-label="Header editor" />
    <Editable aria-label="Body editor" />
    <Editable root="footer" aria-label="Footer editor" />
  </Plite>
)
```

Keep `SlateRuntime`, `<Plite root>`, `createEditorView`,
`usePliteRuntimeState`, and `usePliteViewState` available for advanced hosts,
but do not teach them in the canonical app example.

Add root-named public hooks and let the package create view editors internally:

```tsx
const activeRoot = usePliteActiveRoot()
const rootEditor = usePliteRootEditor(activeRoot)
const headerText = usePliteRootState('header', rootText)

rootEditor.update((tx) => {
  tx.history.undo()
})
```

For helper signatures outside the hook call site, use the exported public editor
type instead of `ReturnType` over a generic hook:

```tsx
import { type ReactEditor } from 'plite-react'

const updateHistory = (
  editor: Pick<ReactEditor, 'update'>,
  direction: 'redo' | 'undo'
) => {
  editor.update((tx) => {
    direction === 'undo' ? tx.history.undo() : tx.history.redo()
  })
}
```

## Why This Works

`<Plite editor>` already owns the editor runtime. Letting `Editable root` create
and register its root view keeps the app on normal Plite composition while the
package owns active-root selection, root-local DOM sync, and history execution.

The public `ReactEditor` type carries the default React and history extensions.
Using it in helper signatures avoids generic `ReturnType` widening and keeps
history state/transaction fields visible to TypeScript.

## Prevention

- Canonical multi-root examples should contain one `<Plite editor>` and many
  `<Editable root>` surfaces.
- App examples should not call `createEditorView`, `SlateRuntime`,
  `window.getSelection`, `document.createRange`, or dispatch
  `selectionchange`.
- Keep source-cleanliness greps beside browser proof for public examples.
- When a generic hook returns an extension-derived editor, do not use
  `ReturnType<typeof hook>` for exported/helper signatures if extension fields
  matter.
- Browser proof must still cover focus, native selection, history, and root-local
  copy/paste.

## Related Issues

- [Plite multi-root roots must stay natively editable for caret clicks](../ui-bugs/2026-05-21-plite-multi-root-chrome-clicks-must-activate-root-before-focus.md)
- [Plite React state field setters must preserve external focus](../ui-bugs/2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md)
- [Plite React runtime owner cuts need static inventories and browser proof](./2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
- [Plite React public type hard cuts need internal runtime type splits](./2026-05-17-slate-react-public-type-hard-cuts-need-internal-runtime-type-splits.md)
