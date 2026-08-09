---
"@platejs/selection": major
---

- Move block-selection mutations to explicit Plite transactions
- Track block and menu selections with editor-scoped `NodeKey` values rather
  than persisted element properties.
- Store them as `selectedKeys` and `anchorKey`; block-menu state uses
  `openKey`.
- Publish block-selection services, snapshot reads, selectors, and updates on
  the installed plugin
- Remove the redundant `read.first` alias; read the first selected node from
  `read.nodes()`.
- Derive inserted block selections from the last canonical commit
- Compose `BlockMenuPlugin` explicitly beside `BlockSelectionPlugin`
- Preserve plugin API inference and render non-element block-selection
  integrations without requiring element context
- Export complete `BlockMenuPluginState`, `BlockSelectionPluginState`, and
  `CursorOverlayPluginState` contracts, with public selection-area option types
- Use `@platejs/cursor` as the sole cursor geometry, overlay-state, and
  positioning-hook owner
- Treat data and header cells as one `tableCell` selection type

**Migration:** Use `editor.plugin(BlockSelectionPlugin).api` for UI and
clipboard services, `.read` for selected-node queries, `.store.get` for state
and selectors, and `.update` for document mutations. Use
`editor.plugin(CursorOverlayPlugin).api` for cursor overlays. Remove exported
block-selection query, copy, paste, and selection helpers. Add both Block
Selection and Block Menu descriptors when the menu UI is needed. Import cursor
types and `useCursorOverlayPositions` from `@platejs/cursor`.
