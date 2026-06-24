---
title: Plite React cut proof must use real shortcut transport and assert selection
date: 2026-04-22
last_updated: 2026-05-04
category: docs/solutions/logic-errors
module: Plite slate-react browser editing
problem_type: logic_error
component: testing
symptoms:
  - "A synthetic cut event proved clipboard payload and text deletion but left Plite selection null"
  - "A post-cut clipboard helper re-copied from the editor and perturbed the collapsed selection"
  - "Model-only cut proof missed the visual/browser selection risk"
  - "Selected block void cut deleted the model node but returned no trace command or repair request"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plite
  - slate-react
  - clipboard
  - cut
  - browser-editing
  - selection
---

# Plite React cut proof must use real shortcut transport and assert selection

## Problem

Cut behavior can look correct if tests only assert clipboard payload or model
text deletion.

That is not enough for Plite browser editing. After cutting selected content,
the model selection and visible DOM selection must land at the cut start.

## Symptoms

- A synthetic `ClipboardEvent('cut')` copied the right fragment data and deleted
  the selected text.
- Plite selection then became `null`.
- A later version of the test used `editor.clipboard.assert.types(...)` after
  the cut, but that helper performs another copy and changed the collapsed
  selection again.

## What Didn't Work

- Dispatching a synthetic cut event and treating it as equivalent to user cut.
  It exercises the React `onCut` path, but it does not prove the real browser
  shortcut lifecycle.
- Restoring only model text or clipboard payload. The actual regression was
  selection/caret state.
- Re-copying after the cut to inspect clipboard types. That made the test
  flaky because it interacted with the already-mutated selection.

## Solution

Use the real browser shortcut path for the browser proof:

```ts
await editor.selection.select({
  anchor: { path: [0, 0], offset: 1 },
  focus: { path: [0, 0], offset: 9 },
})

await editor.root.press('ControlOrMeta+X')

expect(await editor.clipboard.readText()).toBe('lpha bet')
expect(await editor.clipboard.readHtml()).toContain('data-plite-fragment')
await editor.assert.text('aa')
await editor.assert.selection({
  anchor: { path: [0, 0], offset: 1 },
  focus: { path: [0, 0], offset: 1 },
})
```

Fix the product path by preserving the cut-start point, deleting the fragment,
restoring a collapsed selection, and syncing DOM focus/selection:

```ts
const collapsePointRef = Editor.pointRef(editor, Range.start(selection))
Editor.deleteFragment(editor)
const collapsePoint = collapsePointRef.unref()

if (collapsePoint) {
  Transforms.select(editor, {
    anchor: collapsePoint,
    focus: collapsePoint,
  })
  ReactEditor.focus(editor)
}
```

For selected block voids, also assert the React cut handler returns the same
model-owned repair contract as expanded cuts. Deleting the void node is not
enough; the runtime needs a command trace and repair request so the DOM caret
does not depend on browser luck:

```ts
const result = applyEditableCut({ editor, event, readOnly: false })

expect(result.command).toEqual({ kind: 'delete-fragment' })
expect(result.repair).toEqual({
  focus: true,
  kind: 'repair-caret',
  selectionSourceTransition: {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  },
})
```

## Why This Works

The user-facing cut contract is not just "clipboard got data" or "text was
deleted".

The full contract is:

- selected fragment serializes correctly
- selected content is removed from model and DOM
- model selection collapses at the cut start
- DOM focus/selection is repaired so the caret is visually honest
- the event runtime returns a non-null command trace and repair request when it
  performs the model mutation itself

`Editor.pointRef(...)` tracks the intended collapsed point through the deletion.
`ReactEditor.focus(...)` then syncs the browser selection back to that model
selection.

## Prevention

- Browser cut tests should use `ControlOrMeta+X` when the claim is user-path
  editing behavior.
- Avoid clipboard helper calls after a cut if those helpers trigger another
  copy from the editor.
- Cut tests should assert clipboard payload, model/visible text, and collapsed
  Plite selection.
- Handler-level cut tests should also assert the returned command and repair
  request when the handler performs model-owned deletion directly.
- Treat synthetic `ClipboardEvent('cut')` as a narrow React handler diagnostic,
  not full browser editing proof.

## Related

- [Decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-decorated-clipboard-and-selected-text-helpers-should-strip-render-only-wrappers-and-feff.md)
- [V2 HTML paste formatting should stay app-owned on explicit inline elements](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
