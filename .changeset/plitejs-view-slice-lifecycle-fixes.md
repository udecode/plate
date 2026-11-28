---
'plitejs': patch
---

- Fix `state.transaction` and `state.transaction.extend` over authored previews and document views
- Keep read and document-view guards active across lazy `nodes.entries`, `nodes.levels`, and `points.positions` iterator callbacks
- Fix `tx.slice.replace`, `editor.update.slice.replace`, `state.slice.fit`, and `tx.fragment.replace` over block node selections
- Keep one teardown owner for reentrant `editor.destroy()` calls and refuse `editor.destroy()` during plugin `acquire` callbacks
