---
'@platejs/find-replace': major
---

Export `FindReplacePluginState` as the complete mutable state contract for `FindReplacePlugin`.

Move find-and-replace decoration into `FindReplacePlugin`, remove its React runtime requirement, highlight matches across inline descendants, and register search highlights in compiled schemas. The capability name and persisted decoration property key are both `searchHighlight`.

**Migration:** Remove `decorateFindReplace` imports. Configure and install `FindReplacePlugin`; it owns decoration directly.
