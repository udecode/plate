---
'@udecode/plate-heading': major
---

- Package `@udecode/plate-heading` has been deprecated.
  - `HeadingPlugin` and individual heading plugins (e.g., `H1Plugin`) have been moved to `@platejs/basic-nodes`.
    - Migration: Import from `@platejs/basic-nodes/react` (e.g., `import { HeadingPlugin } from '@platejs/basic-nodes/react';`).
  - `TocPlugin` has been moved to `@platejs/toc`.
    - Migration: Add `@platejs/toc` to your dependencies and import `TocPlugin` from `@platejs/toc/react`.
- Remove `@udecode/plate-heading` from your dependencies.
