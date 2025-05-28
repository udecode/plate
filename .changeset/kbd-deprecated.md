---
'@udecode/plate-kbd': major
---

- Package `@udecode/plate-kbd` has been deprecated.
- `KbdPlugin` has been moved to the `@udecode/plate-basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-kbd` from your dependencies.
  - Add `@udecode/plate-basic-nodes` to your dependencies if not already present.
  - Import `KbdPlugin` from `@udecode/plate-basic-nodes/react`.
