---
'plitejs': patch
---

Keep copied object blocks intact when pasting into an empty block inside a container.

Replace selected blocks whole when pasting over them, and cut the paste to `maxLength` instead of throwing. A paste the schema would reject, such as one naming a content root the document lacks or giving an exclusive root a second owner, returns `false` and leaves the document unchanged.

Leave void and read-only element text out of `text.string` over a node selection unless `voids: true`, as for other targets, so typing or pasting over a selected void stays within `maxLength`.

Join pasted text with its neighbors in a named root that declares no content rules, as in the main document.

Add `editorReads.slice.landing` with its `SliceLanding`, `SliceLandingInput` and `SliceLandingTarget` types. After paste handlers delegate, a plugin can shape the slice a paste lands, reading the root the paste lands in, and propose whole blocks for an empty target block; the editor checks that proposal against the schema and `maxLength`. Keep command handling in editor views.
