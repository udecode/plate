---
'plitejs': patch
---

Add the `references` option to `schema.elementProperty`. It declares that a property names elements by the value of a unique string element property, as `references: { key, map }`. The schema compiler refuses a `key` that names no such property, and `references` on a unique property. Copies do not apply `map` yet.
