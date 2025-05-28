---
'@udecode/plate-reset-node': major
---

- Package `@udecode/plate-reset-node` has been deprecated.
- Its functionality (e.g., `ResetNodePlugin`) has been moved to `@udecode/plate-utils` (which is re-exported via `@udecode/plate`).
- Migration:
  - Remove `@udecode/plate-reset-node` from your dependencies.
  - Ensure `@udecode/plate` (or `@udecode/plate-utils`) is a dependency.
  - Update import paths to use `@udecode/plate` (e.g., `import { ResetNodePlugin } from '@udecode/plate';`).
