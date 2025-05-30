---
'@udecode/plate-kbd': major
---

- Package `@udecode/plate-kbd` has been deprecated.
- `KbdPlugin` has been moved to the `@platejs/basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-kbd` from your dependencies.
  - Add `@platejs/basic-nodes` to your dependencies if not already present.
  - Import `KbdPlugin` from `@platejs/basic-nodes/react`.
