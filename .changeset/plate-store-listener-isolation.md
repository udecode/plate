---
'platejs': patch
---

- Fix a throwing plugin store listener skipping the others and failing the write. A `store.subscribe` or `viewStore.subscribe` listener that throws goes to the editor's `lifecycleErrorSink`, and the other listeners still run. The throw no longer fails `store.set` or rolls back an `editor.update` around it
