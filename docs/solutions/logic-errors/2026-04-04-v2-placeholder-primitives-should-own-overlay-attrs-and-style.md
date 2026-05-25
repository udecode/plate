---
date: 2026-04-04
last_updated: 2026-04-26
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 placeholder primitives should own overlay attrs and style
tags:
  - slate-v2
  - slate-react-v2
  - placeholder
  - renderer
severity: medium
---

# V2 placeholder primitives should own overlay attrs and style

## What happened

After packaging the v2 node-shape and text-boundary primitives, the placeholder
proof surface was still hand-rolling the overlay DOM:

- `data-slate-placeholder`
- `contentEditable={false}`
- overlay positioning and interaction styles

That was the same mistake in smaller clothes.

The same failure mode came back in `examples/custom-placeholder`: the built-in
placeholder used `SlatePlaceholder` and looked right, but custom
`renderPlaceholder` received `attributes.style = {}` and rendered as normal
black document content instead of the grey absolute overlay.

The first style fix still missed legacy parity: once the placeholder became an
absolute overlay, it no longer contributed to editable root height. The overlay
was visually outside the editor until the root measured placeholder height and
applied `minHeight`.

A later delete-to-empty pass exposed the same ownership bug from another angle:
after text insertion hid the placeholder, the root rerendered with no
placeholder value. Deleting all text only rerendered the text node, so custom
`renderPlaceholder` received `children: undefined` and root height measurement
never restarted.

## What fixed it

`slate-react` owns a reusable `SlatePlaceholder` primitive:

- [slate-placeholder.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-placeholder.tsx)

The placeholder proof surface consumes that primitive instead of
repeating the overlay contract inline.

Custom placeholder renderers use the same owner. `SlatePlaceholder` exposes the
default style through a shared helper, and `EditableText` passes that merged
style through `renderPlaceholder` attributes.

`EditableTextBlocks` measures the mounted placeholder element and applies the
height as root `minHeight`, matching the legacy placeholder-height contract.

`EditableTextBlocks` also subscribes to the placeholder-visible state. Empty
state is text-operation-sensitive, not just structure-sensitive, so the root
must rerender when typing/deleting toggles placeholder visibility.

`EditableText` only calls custom `renderPlaceholder` when an actual placeholder
value exists.

## Why this works

Placeholder overlays are part of the renderer/input contract, not decorative
markup.

Their DOM attrs and styles determine whether the browser treats them as real
editable content, whether they interfere with selection, and whether they sit
on the correct visual layer.

If each proof surface hand-writes that contract, drift is inevitable.

If the built-in placeholder has the right visual behavior but
`renderPlaceholder` does not, the primitive owner is still incomplete. The
attrs object passed to custom renderers is part of the same contract.

If an absolute placeholder is taller than the empty text line, root height must
come from the placeholder element. Otherwise the overlay is technically styled
correctly but still outside the visible editor box.

## Reusable rule

For `slate-react`:

- node shapes belong in renderer primitives
- text boundaries belong in renderer primitives
- placeholder overlays also belong in renderer primitives
- custom `renderPlaceholder` attrs must receive the same default overlay style
  as the built-in placeholder
- custom placeholder height must contribute to editable root `minHeight`
- placeholder visibility must update on text operations, including deleting
  back to an empty editor
- custom `renderPlaceholder` must not be called with missing placeholder
  children
- parity tests should assert the style object, not just that
  `data-slate-placeholder` exists

If a DOM contract affects browser editing behavior, it should not live forever
inside example files.

## Related issues

- [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)
- [2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-text-string-primitives-should-own-the-dom-text-boundary.md)
