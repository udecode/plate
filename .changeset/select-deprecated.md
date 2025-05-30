---
'@udecode/plate-select': major
---

- Package `@udecode/plate-select` has been deprecated.
- Its functionality (e.g., `SelectOnBackspacePlugin`) has been moved to `@platejs/utils` (which is re-exported via `platejs`).
- Migration:
  - Remove `@udecode/plate-select` from your dependencies.
  - Update import paths to use `platejs` (e.g., `import { SelectOnBackspacePlugin } from 'platejs';`).
