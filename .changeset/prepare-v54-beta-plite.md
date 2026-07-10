---
"@platejs/plite": major
---

Prepare v54 beta prerelease versioning for Plite.

Expose one-shot `editor.read.*` and `editor.update.*` methods for common reads and writes while keeping callback forms for grouped state and transaction work.

Add direct `editor.update.value.replace(input, options)` for document imports, resets, and controlled value replacement.

Add a `clear` option to `editor.update.marks.toggle` and `tx.marks.toggle` for mutually exclusive marks.

Accept live text and element targets in public `at` options, resolve paths with `editor.read.nodes.path`, and support shallow property matchers with scalar and one-of values.

Expose explicit selection and point predicates for text scope, block scope, block edges, range intersection and containment, and word endings.

Centralize pure predicate and property matching in `NodeApi.matches`, including path-aware predicates and one-of property values.
