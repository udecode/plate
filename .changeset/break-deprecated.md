---
'@udecode/plate-break': major
---

- Package `@udecode/plate-break` has been deprecated.
- Its functionality (e.g., `SoftBreakPlugin`, `ExitBreakPlugin`) has been moved to `@udecode/plate-utils` (which is re-exported via `@udecode/plate`).
- Migration:
  - Remove `@udecode/plate-break` from your dependencies.
  - Ensure `@udecode/plate` (or `@udecode/plate-utils`) is a dependency.
  - Update import paths to use `@udecode/plate` (e.g., `import { SoftBreakPlugin } from '@udecode/plate';`).
