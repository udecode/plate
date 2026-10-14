---
'plitejs': patch
---

Keep copied object blocks intact when pasting into an empty block inside a container.

Allow slice and fragment replacement to target exact contiguous sibling nodes with `SelectionApi.nodes(...)`. Preserve command handling in editor views and expose `editorReads.slice.landing` for destination preparation after paste handlers.
