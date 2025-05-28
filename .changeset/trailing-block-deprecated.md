---
'@udecode/plate-trailing-block': major
---

- Package `@udecode/plate-trailing-block` has been deprecated.
- Its functionality (e.g., `TrailingBlockPlugin`) has been moved to `@udecode/plate-utils` (which is re-exported via `@udecode/plate`).
- Migration:
  - Remove `@udecode/plate-trailing-block` from your dependencies.
  - Ensure `@udecode/plate` (or `@udecode/plate-utils`) is a dependency.
  - Update import paths to use `@udecode/plate` (e.g., `import { TrailingBlockPlugin } from '@udecode/plate';`).
