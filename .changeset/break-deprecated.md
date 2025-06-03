---
'@udecode/plate-break': major
---

- Package `@udecode/plate-break` has been deprecated.
- `SoftBreakPlugin` has been removed. Migration:
  - For `shift+enter` rules: no migration is needed - this behavior is built into Slate by default.
  - For `enter` rules: use `plugin.configure({ node: { breakMode: 'lineBreak' } })` to insert a line break instead of a hard break on `Enter` keydown when the selection is within the configured node type. Use `breakMode: 'splitOnEmptyLine'` to insert line breaks normally but split the block when on an empty line.
  - For more complex break rules: use `extendTransforms` to override the `insertBreak` transform with custom logic.
- `ExitBreakPlugin` has been moved to `@platejs/utils` (which is re-exported via `platejs`) with a simplified API and improved behavior.

  - **Behavior Change**: Instead of always exiting to the root level of the document, exiting will now insert a block to the nearest exitable ancestor that has `isStrictSiblings: false`. This means deeply nested structures (like tables in columns) are exitable at many levels.
  - Migration:

    - Remove `@udecode/plate-break` from your dependencies.
    - Ensure `@platejs/utils` (or `platejs`) is a dependency.
    - Update import paths to use `@platejs/utils` (e.g., `import { ExitBreakPlugin } from '@platejs/utils/react';`).
    - **Important**: If not using Plate plugins, you must set `isStrictSiblings: true` on your custom node plugins that can't have paragraph siblings for exit break to work correctly.
    - Replace complex rule-based configuration with simple shortcuts:

      ```tsx
      // Before (old API)
      ExitBreakPlugin.configure({
        options: {
          rules: [
            { hotkey: 'mod+enter' },
            { hotkey: 'mod+shift+enter', before: true },
          ],
        },
      });

      // After (new API)
      ExitBreakPlugin.configure({
        shortcuts: {
          insert: { keys: 'mod+enter' },
          insertBefore: { keys: 'mod+shift+enter' },
        },
      });
      ```
