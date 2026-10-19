---
'platejs': patch
---

Align Plate plugin schemas with Plite. Schema publication derives identity internally, element membership uses `blockContent`, schema queries accept plugin descriptors directly, and plugin definitions expose the authored schema without public compiler witnesses. Metadata-aware HTML, node-id, and element-state behavior uses placement roles. Application-owned property targets retain their authored semantic identity when Plate lowers plugin names to persisted element types.

Expose compiled normal-flow membership through `editor.read.schema.isBlockContent(element)`.
