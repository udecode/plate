---
"@platejs/find-replace": major
---

Move find-and-replace decoration into `FindReplacePlugin`, remove its React
runtime requirement, highlight matches across inline descendants, and register
search highlights in compiled schemas. The plugin identity is
`searchHighlight`; persisted decoration properties remain `search_highlight`.

**Migration:** Remove `decorateFindReplace` imports. Configure and install
`FindReplacePlugin`; it owns decoration directly.
