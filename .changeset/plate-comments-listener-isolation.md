---
'platejs': patch
---

- Fix a throwing comments listener skipping the others. A comments `subscribe*` listener or decoration refresher that throws goes to the editor's `lifecycleErrorSink`, and the other listeners still run
