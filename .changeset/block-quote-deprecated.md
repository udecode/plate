---
'@udecode/plate-block-quote': major
---

- Package `@udecode/plate-block-quote` has been deprecated.
- `BlockquotePlugin` has been moved to the `@platejs/basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-block-quote` from your dependencies.
  - Add `@platejs/basic-nodes` to your dependencies if not already present.
  - Import `BlockquotePlugin` from `@platejs/basic-nodes/react`.
