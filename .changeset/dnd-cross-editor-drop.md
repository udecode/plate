---
"@platejs/dnd": major
---

Fix cross-editor multi-block drops so every selected block is inserted before
the source blocks are removed. Drag items carry the source editor identity plus
editor-scoped `NodeKey` values; persisted element IDs are not used for drag
state.

Keep the edge scroller reactive to plugin store state.
Preserve plugin API inference in typed component integrations and expose
DOM-compatible drag references.

Use `key` on element drag items and drop callbacks, `draggingKey` in plugin
state, `{ key, line }` for drop targets, and `useDropLine({ key })` for an
explicit live node target.

Remove the standalone `selectBlockById` helper. Table row integrations now
keep their selection-and-focus flow in the owning pre-drop handler.

Remove the exported `getNewDirection` helper.

Replace `DndConfig` with the complete `DndPluginState` contract.
