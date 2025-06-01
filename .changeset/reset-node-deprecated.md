---
'@udecode/plate-reset-node': major
---

- Package `@udecode/plate-reset-node` has been deprecated.
- Its functionality (e.g., `ResetNodePlugin`) has been moved to `@platejs/utils` (which is re-exported via `platejs`).
- Migration:
  - Remove `@udecode/plate-reset-node` from your dependencies.
  - Update import paths to use `platejs` (e.g., `import { ResetNodePlugin } from 'platejs';`).
