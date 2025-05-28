---
'@udecode/plate-normalizers': major
---

- Package `@udecode/plate-normalizers` has been deprecated.
- Its functionality (e.g., `NormalizersPlugin`) has been moved to `@udecode/plate-utils` (which is re-exported via `@udecode/plate`).
- Migration:
  - Remove `@udecode/plate-normalizers` from your dependencies.
  - Ensure `@udecode/plate` (or `@udecode/plate-utils`) is a dependency.
  - Update import paths to use `@udecode/plate` (e.g., `import { NormalizersPlugin } from '@udecode/plate';`).
