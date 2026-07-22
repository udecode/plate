---
"@platejs/find-replace": major
---

Move find-and-replace decoration into `FindReplacePlugin`, remove its React
runtime requirement, highlight matches across inline descendants, and register
search highlights in compiled schemas.

**Migration:** Remove `decorateFindReplace` imports. Configure and install
`FindReplacePlugin`; it owns decoration directly.
