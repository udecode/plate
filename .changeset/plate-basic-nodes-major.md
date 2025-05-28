---
'@udecode/plate-basic-nodes': major
---

- The packages `@udecode/plate-basic-elements` and `@udecode/plate-basic-marks` have been deprecated. All their plugins are now consolidated into the new `@udecode/plate-basic-nodes` package.
- Migration steps:
  - Replace `@udecode/plate-basic-elements` and `@udecode/plate-basic-marks` in your dependencies with `@udecode/plate-basic-nodes`.
  - Update all import paths from `@udecode/plate-basic-elements/react` or `@udecode/plate-basic-marks/react` to `@udecode/plate-basic-nodes/react`.
- `CodeBlockPlugin` is **not** part of `@udecode/plate-basic-nodes`. Ensure it is imported from `@udecode/plate-code-block/react`.
- `SkipMarkPlugin` (standalone) is removed. Its functionality is now built into the core editor. To enable boundary clearing for a specific mark, configure the mark plugin directly: `plugin.configure({ node: { clearOnBoundary: true } })`.
- Default HTML Tag Changes:
  - **Blocks**: Element plugins in `@udecode/plate-basic-nodes` (e.g., `BlockquotePlugin`, `HeadingPlugin`, `HorizontalRulePlugin`) now default to rendering with specific HTML tags (`<blockquote>`, `<h1>-<h6>`, `<hr>` respectively). `ParagraphPlugin` still defaults to `<div>`. If you relied on previous defaults or need different tags, provide a custom component or use the `render.as` option.
  - **Marks**: Mark plugins in `@udecode/plate-basic-nodes` (e.g., `BoldPlugin`, `CodePlugin`, `ItalicPlugin`) now default to specific HTML tags (`<strong>`, `<code>`, `<em>` respectively). If you relied on previous defaults or need different tags, provide a custom component or use the `render.as` option.
- Removed Default Shortcuts:
  - Default keyboard shortcuts are no longer bundled with most plugins (exceptions: bold, italic, underline).
  - Configure shortcuts manually via the `shortcuts` field in plugin configuration.
  - Example (Block Plugins):
    ```ts
    H1Plugin.configure({ shortcuts: { toggle: { keys: 'mod+alt+1' } } });
    BlockquotePlugin.configure({
      shortcuts: { toggle: { keys: 'mod+shift+period' } },
    });
    ```
  - Example (Mark Plugins):
    ```ts
    CodePlugin.configure({ shortcuts: { toggle: { keys: 'mod+e' } } });
    StrikethroughPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+shift+x' } },
    });
    SubscriptPlugin.configure({ shortcuts: { toggle: { keys: 'mod+comma' } } });
    SuperscriptPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+period' } },
    });
    HighlightPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+shift+h' } },
    });
    ```
