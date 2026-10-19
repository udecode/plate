---
'platejs': patch
---

- Return the callback's value from `editor.update(fn)`, or `undefined` when the editor refuses the update, and return `undefined` from a plugin context update method whose update is refused
- Return `false` from Media's `insertUrl` when the editor refuses the insert
