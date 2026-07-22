---
"@platejs/selection": major
---

- Move block-selection mutations to explicit Plite transactions
- Scope cursor-overlay APIs to their plugin portal
- Derive inserted block selections from the last canonical commit

**Migration:** Pass the active transaction to exported block-selection mutation
helpers, read block-selection methods from
`editor.plugin(BlockSelectionPlugin).api`, and read cursor-overlay methods from
`editor.plugin(CursorOverlayPlugin).api`.
