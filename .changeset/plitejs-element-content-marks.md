---
'plitejs': minor
---

Add `contentMarks?: boolean` on `SchemaElementInput` (default `true`) so text-admitting elements can reject `role: 'content'` text properties (formatting marks) while keeping `role: 'metadata'` text properties (such as `authored`) legal across schema compilation, contract/fingerprint serialization, `addMark`, mixed-range `toggleMark`, `getProperty`, `tracksPlaces`, and `AuthoredPlugin`.
