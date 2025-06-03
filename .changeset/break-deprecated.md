---
'@udecode/plate-break': major
---

- Package `@udecode/plate-break` has been deprecated.
- `SoftBreakPlugin` has been removed. Migration:
  - For `shift+enter` rules: no migration is needed - this behavior is built into Slate by default.
  - For `enter` rules: use `plugin.configure({ node: { breakMode: 'lineBreak' } })` to insert a line break instead of a hard break on `Enter` keydown when the selection is within the configured node type. Use `breakMode: 'splitOnEmptyLine'` to insert line breaks normally but split the block when on an empty line.
  - For more complex break rules: use `extendTransforms` to override the `insertBreak` transform with custom logic.
- `ExitBreakPlugin` has been moved to `@platejs/utils` (which is re-exported via `platejs`).
- Migration:
  - Remove `@udecode/plate-break` from your dependencies.
  - Ensure `platejs` (or `@platejs/utils`) is a dependency.
  - Update import paths to use `platejs` (e.g., `import { ExitBreakPlugin } from 'platejs';`).
