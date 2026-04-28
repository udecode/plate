---
title: Slate v2 destructive delete must clean empty leaves before render
date: 2026-04-25
category: docs/solutions/logic-errors
module: slate-v2 browser editing
problem_type: logic_error
component: tooling
symptoms:
  - Repeated Backspace or Option-Backspace in richtext created fake blank visual lines
  - Model text and selection looked broadly correct while rendered DOM shape was wrong
  - Empty code or marked leaves rendered zero-width line-break nodes inside a non-empty paragraph
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, leaf-lifecycle, zero-width, dom-shape, destructive-delete, slate-browser]
---

# Slate v2 destructive delete must clean empty leaves before render

## Problem

Repeated destructive deletes through richtext leaf boundaries can leave empty
marked/code leaves in a non-empty paragraph. If React renders those leaves as
line-break zero-width nodes, the visible editor gains fake blank lines even
when model text and selection appear correct.

## Symptoms

- Repeated Backspace or Option-Backspace around the richtext `<textarea>!`
  segment created blank lines in the first paragraph.
- The first block model text could be coherent while `innerText`,
  `textContent`, and zero-width DOM nodes diverged.
- Follow-up typing still worked often enough that model-only tests missed the
  visual regression.

## What Didn't Work

- Patching one richtext row was too narrow; the same class appears at mark,
  code, decoration, inline, range-delete, cut, and word-delete boundaries.
- Hiding the `<br>` in React alone was the wrong owner. React can defend
  rendering, but the invalid committed model shape still exists.
- Treating legacy parity as "copy empty-leaf internals" weakens v2. Legacy
  tolerates more zero-width render shapes; v2 should classify or remove invalid
  leaves before render.

## Solution

Make destructive leaf cleanup a core lifecycle owner, then prove the rendered
DOM shape through `slate-browser`.

Core cleanup removes empty text leaves unless they are structurally required:

```ts
const requiredInlineSpacer = isRequiredInlineSpacer(editor, children, index)
const requiredEmptyBlockAnchor = !parentHasText && emptyTextChildren <= 1

if (requiredInlineSpacer || requiredEmptyBlockAnchor) {
  continue
}

maybeRebaseSelectionBeforeRemoval(editor, childPath, affinity)
removeNodes(editor, { at: childPath, voids: true })
```

React rendering keeps the same invariant from leaking visually:

```txt
empty block anchor -> one line-break placeholder
required inline spacer -> non-line-breaking sentinel
mark placeholder -> non-line-breaking sentinel
removable empty marked/code/decorated leaf -> must not reach render truth
```

`slate-browser` must assert rendered DOM shape in generated destructive
gauntlets:

```ts
await editor.assert.renderedDOMShape({
  blockIndex: 0,
  innerText: firstBlockModelText,
  noUnexpectedZeroWidthBreaks: true,
  textContent: firstBlockModelText,
  zeroWidthBreakCount: 0,
})
```

Release proof should include the guard names:

- `leaf-lifecycle-contract`
- `selection-rebase-contract`
- `rendered-dom-shape-contract`
- `destructive-leaf-boundary-gauntlet`
- `legacy-leaf-delete-parity`

## Why This Works

The root bug is not "Backspace timing" once the editing epoch is model-owned.
The root bug is committed tree shape plus render shape:

```txt
destructive edit
  -> empty leaf survives
  -> React treats it as a line-break zero-width node
  -> non-empty paragraph gains fake visual lines
```

Owning the lifecycle in core prevents invalid empty leaves from becoming render
truth. Keeping a React rendered-DOM contract catches custom render paths. Adding
`slate-browser` DOM-shape assertions closes the exact gap that model text and
selection tests missed.

## Prevention

- Destructive-edit tests must assert model tree/text, model selection, visible
  DOM text, zero-width shape, DOM selection target, and follow-up typing.
- Non-empty blocks must not contain unexplained zero-width `<br>` nodes.
- Empty leaves need a named lifecycle class: empty block anchor, inline spacer,
  mark placeholder, or temporary transaction anchor.
- Release proof must fail if the DOM-shape assertion path is removed.
- Legacy parity should classify copied, improved, and rejected behavior instead
  of silently copying old internals.

## Related Issues

- [Slate React repair-induced selectionchange must stay model-owned](../ui-bugs/2026-04-25-slate-react-repair-induced-selectionchange-must-stay-model-owned.md)
- [Slate browser Playwright helpers must normalize zero-width selection and wait for selection sync](2026-04-04-slate-browser-playwright-helpers-must-normalize-zero-width-selection-and-wait-for-selection-sync.md)
- [V2 editable text primitives should compose leaf text zero-width and placeholder](2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md)
