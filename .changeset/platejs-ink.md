---
'platejs': patch
---

Add `platejs/ink` and `platejs/ink/react`, an experimental layer for pen marks on document text. Each mark is saved in the document with a copy of the words it was drawn on, and draws over those words while the layer can place it on them. Otherwise the layer shows a sign for it in the margin.

- Install `InkPlugin` from `platejs/ink/react` to save marks, which also turns on block ids
- Render `InkLayer` after the content through the `wrapContent` slot, with the component that renders each `InkSign` as its `sign` prop, so toolbars from `afterEditable` slots stay above it
- Read a sign's `marks` and its `state`, which is `changed` when its ink no longer sits on its words, `deleted` when its block is gone, or `narrow` when the margin is too narrow for a margin note
- Turn the Draw tool on with `editor.plugin(InkPlugin).api.setTool({ type: 'draw', brush })` and off with `setTool(null)`
- Draw with the primary mouse button or a pen, while a finger still scrolls the page
- `setTool` returns `false` and changes nothing when it would turn Draw on in a read-only view
- Hide a view's ink and signs with `setHidden(true)`
- Draw a halo around marks with `setPicked(ids)`
- Show the words a mark was drawn on, with its ink over them, with `InkCopyView`
- Add or remove marks with `tx.plugin(BaseInkPlugin).add(input)` and `remove(ids)`
- Removing a mark keeps the copy of its words, so every save keeps the words of each marked block as they were, deleted words included
- A document that holds ink records loads only into an editor that installs the ink plugin, even after its last mark is removed
- The saved form of marks may change before the layer is stable, so marks saved with this version may not show after an upgrade
