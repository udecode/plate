---
'@udecode/plate-block-quote': major
---

- Package `@udecode/plate-block-quote` has been deprecated.
- `BlockquotePlugin` has been moved to the `@udecode/plate-basic-nodes` package.
- Migration:
  - Remove `@udecode/plate-block-quote` from your dependencies.
  - Add `@udecode/plate-basic-nodes` to your dependencies if not already present.
  - Import `BlockquotePlugin` from `@udecode/plate-basic-nodes/react`.
