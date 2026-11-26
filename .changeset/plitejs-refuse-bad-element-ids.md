---
'plitejs': patch
---

In an editor whose elements store ids, such as with Plate's `ElementIdPlugin`, refuse to load a document whose element id is an empty string, a number or an object. The load throws an `EditorSchemaValidationError` instead of keeping or replacing the id.
