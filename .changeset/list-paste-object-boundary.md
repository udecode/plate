---
'plitejs': patch
---

Keep copied object blocks intact when pasting into an empty block inside a container.

Add `editorReads.slice.landing` with its `SliceLanding`, `SliceLandingInput` and `SliceLandingTarget` types. After paste handlers delegate, a plugin can shape the slice a paste lands and propose whole blocks for an empty target block; the editor checks that proposal against the schema and `maxLength`. Keep command handling in editor views.
