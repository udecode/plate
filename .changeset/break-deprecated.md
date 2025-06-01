---
'@udecode/plate-break': major
---

- Package `@udecode/plate-break` has been deprecated.
- Its functionality (e.g., `SoftBreakPlugin`, `ExitBreakPlugin`) has been moved to `@platejs/utils` (which is re-exported via `platejs`).
- Migration:
  - Remove `@udecode/plate-break` from your dependencies.
  - Ensure `platejs` (or `@platejs/utils`) is a dependency.
  - Update import paths to use `platejs` (e.g., `import { SoftBreakPlugin } from 'platejs';`).
