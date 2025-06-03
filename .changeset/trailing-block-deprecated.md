---
'@udecode/plate-trailing-block': major
---

- Package `@udecode/plate-trailing-block` has been deprecated.
- Its functionality (e.g., `TrailingBlockPlugin`) has been moved to `@platejs/utils` (which is re-exported via `platejs`).
- Migration:
  - Remove `@udecode/plate-trailing-block` from your dependencies.
  - Ensure `platejs` (or `@platejs/utils`) is a dependency.
  - Update import paths to use `platejs` (e.g., `import { TrailingBlockPlugin } from 'platejs';`).
