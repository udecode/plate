---
'plitejs': patch
---

- Fix `tx.key(node)` throwing inside a command or input rule for a node the same change already edited, wrapped or split
- Fix a node losing its key when a command or input rule edits it and then moves it
- Keep the key a command or input rule reads for a node it creates, such as a wrapper or the new half of a split, after the change lands
- Add `key` to `EditorTransactionSpecBuilder`, so `tx.key` type-checks inside `state.transaction` and `state.transaction.extend`
