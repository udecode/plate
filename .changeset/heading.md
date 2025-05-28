---
'@udecode/plate-heading': major
---

- Package `@udecode/plate-heading` has been deprecated.
  - `HeadingPlugin` and individual heading plugins (e.g., `H1Plugin`) have been moved to `@udecode/plate-basic-nodes`.
    - Migration: Import from `@udecode/plate-basic-nodes/react` (e.g., `import { HeadingPlugin } from '@udecode/plate-basic-nodes/react';`).
  - `TocPlugin` has been moved to `@udecode/plate-toc`.
    - Migration: Add `@udecode/plate-toc` to your dependencies and import `TocPlugin` from `@udecode/plate-toc/react`.
- Remove `@udecode/plate-heading` from your dependencies.
