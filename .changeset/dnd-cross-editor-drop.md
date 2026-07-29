---
"@platejs/dnd": major
---

Fix cross-editor multi-block drops so every selected block is inserted before
the source blocks are removed.

Keep the edge scroller reactive to plugin store state.
Preserve plugin API inference in typed component integrations and expose
DOM-compatible drag references.

Remove the standalone `selectBlockById` helper. Table row integrations now
keep their selection-and-focus flow in the owning pre-drop handler.

Remove the exported `getNewDirection` helper.

Replace `DndConfig` with the complete `DndPluginState` contract.
