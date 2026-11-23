---
'plitejs': patch
---

- Refuse a state field keyed `$configuration`, the marker a plugin reconfiguration puts in a commit's `dirtyStateKeys`.
- Keep `$configuration` in a commit's `dirtyStateKeys` when an update writes `meta.$configuration` and also reconfigures a plugin without changing it.
- Keep a persisted state field in a commit's `dirtyStateKeys` when one update sets it more than once and its saved value ends different from before, even when the field's `compare` calls the two values equal.
- Apply a plugin reconfiguration that a plugin method makes while the document has pending suggestions, which the editor dropped.
