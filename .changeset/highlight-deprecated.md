---
'@udecode/plate-highlight': major
---

- Package `@udecode/plate-highlight` has been deprecated.
- `HighlightPlugin` has been moved to the `@platejs/basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-highlight` from your dependencies.
  - Add `@platejs/basic-nodes` to your dependencies if not already present.
  - Import `HighlightPlugin` from `@platejs/basic-nodes/react`.
