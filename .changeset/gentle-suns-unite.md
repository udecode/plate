---
'@platejs/selection': patch
---

- Added a `selectionFallback` option to `api.getNodes`.
  - If `selectionFallback` is set to `true`, and no nodes are selected by `blockSelection`, the method will use the editor's original selection to retrieve blocks.
