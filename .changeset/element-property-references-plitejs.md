---
'plitejs': patch
---

Add the `references` option to `schema.elementProperty`. It declares that a property names elements by the value of a unique string element property, as `references: { key, map }`. The schema compiler refuses a `key` that names no such property, and `references` on a unique property. It also refuses a referring property with a prefix key, a default value or a target other than element types, and a content slot or content default that fixes the referring property or the unique property it names. Copies do not apply `map` yet.
