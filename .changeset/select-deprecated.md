---
'@udecode/plate-select': major
---

- Package `@udecode/plate-select` has been deprecated.
- Its functionality (e.g., `SelectOnBackspacePlugin`) has been moved to `@udecode/plate-utils` (which is re-exported via `@udecode/plate`).
- Migration:
  - Remove `@udecode/plate-select` from your dependencies.
  - Ensure `@udecode/plate` (or `@udecode/plate-utils`) is a dependency.
  - Update import paths to use `@udecode/plate` (e.g., `import { SelectOnBackspacePlugin } from '@udecode/plate';`).
