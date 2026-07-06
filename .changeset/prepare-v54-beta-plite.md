---
"@platejs/plite": major
---

Prepare v54 beta prerelease versioning for Plite.

Expose one-shot `editor.read.*` and `editor.update.*` methods for common reads and writes while keeping callback forms for grouped state and transaction work.

Add direct `editor.update.value.replace(input, options)` for document imports, resets, and controlled value replacement.

Add a `clear` option to `editor.update.marks.toggle` and `tx.marks.toggle` for mutually exclusive marks.
