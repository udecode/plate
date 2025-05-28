---
'@udecode/plate-highlight': major
---

- Package `@udecode/plate-highlight` has been deprecated.
- `HighlightPlugin` has been moved to the `@udecode/plate-basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-highlight` from your dependencies.
  - Add `@udecode/plate-basic-nodes` to your dependencies if not already present.
  - Import `HighlightPlugin` from `@udecode/plate-basic-nodes/react`.
