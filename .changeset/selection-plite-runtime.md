---
"@platejs/selection": major
---

- Move block-selection mutations to explicit Plite transactions
- Publish block-selection services, snapshot reads, selectors, and updates on
  the installed plugin
- Derive inserted block selections from the last canonical commit
- Compose `BlockMenuPlugin` explicitly beside `BlockSelectionPlugin`
- Preserve plugin API inference and render non-element block-selection
  integrations without requiring element context

**Migration:** Use `editor.plugin(BlockSelectionPlugin).api` for UI and
clipboard services, `.read` for selected-node queries, `.store.get` for state
and selectors, and `.update` for document mutations. Use
`editor.plugin(CursorOverlayPlugin).api` for cursor overlays. Remove exported
block-selection query, copy, paste, and selection helpers. Add both Block
Selection and Block Menu descriptors when the menu UI is needed.
