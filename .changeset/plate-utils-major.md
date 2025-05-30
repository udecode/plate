---
'@udecode/plate-utils': major
---

- Node type definitions (e.g., `TImageElement`, `TParagraphElement`) previously co-located with their respective plugin packages (like `@udecode/plate-media`) have been centralized into `@platejs/utils`. These are typically re-exported via the main `platejs` package.

  - Migration: Update imports for these types to pull from `platejs`.

    ```tsx
    // Before
    // import { TImageElement } from '@udecode/plate-media';

    // After
    import { TImageElement } from 'platejs'; // Or from '@platejs/utils' directly
    ```

- Removed `structuralTypes` option from `useSelectionFragment` and `useSelectionFragmentProp`. These hooks now automatically use `editor.meta.containerTypes` from enabled plugins.
- Removed:
  - `createNodesHOC`
  - `createNodesWithHOC`
  - `createNodeHOC`
- Removed `usePlaceholderState` hook.
  - Migration: Use the `BlockPlaceholderPlugin` (typically from `platejs`) instead of the `withPlaceholders` HOC and `usePlaceholderState`. Configure placeholders directly within the `BlockPlaceholderPlugin` options.
    ```ts
    // Example BlockPlaceholderPlugin configuration
    BlockPlaceholderPlugin.configure({
      options: {
        className:
          'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
        placeholders: {
          [ParagraphPlugin.key]: 'Type something...',
          // ...other placeholders
        },
        query: ({ editor, path }) => {
          // Example query: only show for top-level empty blocks
          return (
            path.length === 1 && editor.api.isEmpty(editor.children[path[0]])
          );
        },
      },
    });
    ```
