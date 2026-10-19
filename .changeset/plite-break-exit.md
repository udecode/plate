---
'plitejs': patch
---

- Add `tx.break.exit({ before?, match? })` to leave the nearest structure around the selected block and insert the default block its parent declares there. A void, an object or a text block that declares `ownsExit` is a structure of its own, so exit lands beside it and stays in its container; any other block leaves the nearest container whose parent can hold a text block. When the block that owns its exit cannot get a plain text block beside it, exit leaves its container instead. Once exit stops at a container, it returns `false` and changes nothing when that container's parent declares no default block, has no room for it, cannot fill a required property of the default, or would leave the caret without text. `match` limits which levels exit may leave, the selected block included when it owns its exit
- Add `ownsExit` to block text element schemas, through `schema.element.textBlock({ ownsExit: true })` or the element declaration. `EditorElementBehavior.ownsExit` and `EditorSchemaElement.behavior.ownsExit` report whether the element owns its exit, which every void and object does, as does a text block that declares it. Declaring it on an inline, void, object or container element fails schema compilation. A schema that never declares it keeps its fingerprint
- Fix Enter on a block void throwing when the default block beside it needs a required property or holds no text; it changes nothing instead
- Report the `missing-property` diagnostic code when a schema-built element lacks a required property
