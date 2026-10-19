---
'plitejs': patch
---

- Return the callback's value from `editor.update(fn)` and `editor.update(policy, fn)`, or `undefined` when the editor refuses the update
- Return `undefined` instead of `true` from a direct update method, `editor.update.command`, a plugin portal, `useCommand`'s dispatcher and `editor.api.dom.clipboard.insertData`, `insertFragmentData` and `insertTextData` when the editor refuses their update, such as a Suggesting write it cannot record. `false` still means nothing applied
