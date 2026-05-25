---
title: Inline void clipboard export must not assume block void spacer DOM
date: 2026-05-04
category: docs/solutions/logic-errors
module: slate-v2 slate-dom clipboard inline voids
problem_type: logic_error
component: tooling
symptoms:
  - Copying a selected inline void crashed during clipboard export.
  - The exporter looked for data-slate-spacer inside inline void cloned DOM.
  - Internal Slate fragment copy could be lost before paste or cut cleanup.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-dom, clipboard, inline-void, void, feff, fragment]
---

# Inline void clipboard export must not assume block void spacer DOM

## Problem

The DOM clipboard exporter reused a block-void assumption for every void
selection. When the selection started inside an inline void, it tried to attach
`data-slate-fragment` to `[data-slate-spacer]`, but inline void shells do not
render that spacer.

## Symptoms

- Selected inline void copy threw
  `TypeError: null is not an object (evaluating 'attach.setAttribute')`.
- Copy/cut could fail before the Slate fragment payload was written.
- The fragile path only appeared for void selections because ordinary text
  selections attach fragment metadata to cloned text DOM.

## What Didn't Work

- Treating all voids as block voids. Block voids use `data-slate-spacer`;
  inline voids place hidden zero-width text around visible content instead.
- Fixing React copy/cut dispatch. React was already delegating to
  `editor.dom.clipboard.writeSelection`; the crash lived in DOM transport.
- Depending on visible inline void text. Raw Slate cannot infer app-specific
  external plain text from a mention's `character` field.

## Solution

Keep the Slate fragment model-backed, but make DOM attachment tolerant of inline
void DOM:

```ts
if (startVoid) {
  attach =
    contents.querySelector('[data-slate-spacer]') ??
    contents.querySelector(
      '[data-slate-node="element"], [data-slate-node="text"], [data-slate-string], [data-slate-zero-width]'
    ) ??
    attach
}

let attachElement: Element

if (isDOMElement(attach)) {
  attachElement = attach
} else {
  const span = contents.ownerDocument.createElement('span')

  if (attach) {
    span.appendChild(attach)
  }

  contents.appendChild(span)
  attachElement = span
}

attachElement.setAttribute('data-slate-fragment', encoded)
```

The regression should select the inline void through its empty text child and
prove all four behaviors:

- copy does not throw without `data-slate-spacer`
- `application/x-slate-fragment` preserves the inline void node
- external `text/plain` does not leak FEFF or neighboring text
- paste round-trip and cut-shaped delete keep model order deterministic

## Why This Works

The fragment payload is the editor truth. The DOM node carrying
`data-slate-fragment` is only transport metadata for browser clipboard HTML.

Block voids and inline voids have different DOM shapes, so the exporter should
find a valid cloned element or create a tiny wrapper. It should not require one
specific void shell.

## Prevention

- Clipboard tests for voids should cover block void and inline void DOM shapes
  separately.
- A test that says "void copy" but only mounts `data-slate-spacer` is incomplete.
- External text assertions should check for FEFF and neighboring text leaks, not
  pretend raw Slate knows app-specific labels.
- Keep copy-before-delete ordering in the same test when the bug can break cut.

## Related Issues

- [Slate React void renderers should not own hidden children](../developer-experience/2026-04-27-slate-react-void-renderers-should-not-own-hidden-spacer-children.md)
- [Decorated clipboard and selected-text helpers should strip render-only wrappers and FEFF](./2026-04-04-decorated-clipboard-and-selected-text-helpers-should-strip-render-only-wrappers-and-feff.md)
- [Slate v2 clipboard proof must split fragment semantics from DOM transport](./2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
