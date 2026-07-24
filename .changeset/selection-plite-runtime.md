---
"@platejs/selection": major
---

- Move block-selection mutations to explicit Plite transactions
- Publish block-selection and cursor-overlay APIs on the inferred editor API
- Derive inserted block selections from the last canonical commit
- Compose `BlockMenuPlugin` explicitly beside `BlockSelectionPlugin`
- Preserve plugin API inference and render non-element block-selection
  integrations without requiring element context

**Migration:** Pass the active transaction to exported block-selection mutation
helpers, read block-selection methods from
`editor.api.blockSelection`, and read cursor-overlay methods from
`editor.api.cursorOverlay`. Add both Block Selection and Block
Menu descriptors when the menu UI is needed.
