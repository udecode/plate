# @platejs/basic-nodes

## 53.0.0

### Major Changes

- [#4941](https://github.com/udecode/plate/pull/4941) by [@zbeyens](https://github.com/zbeyens) – Store blockquotes as container blocks with block children.
  Lift every selected nested quoted block one level on `Shift+Tab`.
  Reset headings to paragraphs on `Backspace` at block start before any merge.

  **Migration:**

  1. Update persisted values, fixtures, and tests to use block children instead of direct text children.
  2. Expect `editor.tf.blockquote.toggle()` to wrap or unwrap blocks instead of retagging one text block in place.
  3. Empty later quoted paragraphs delete in place on `Backspace` instead of jumping out of the quote.
  4. `Backspace` at the start of a heading now resets the heading to a paragraph before any merge.
  5. Legacy flat blockquote values still normalize on load, but persisted snapshots and fixtures should move to the new shape.

  ```tsx
  // Before
  { type: 'blockquote', children: [{ text: 'Quote' }] }

  // After
  {
    type: 'blockquote',
    children: [{ type: 'p', children: [{ text: 'Quote' }] }],
  }
  ```

## 52.3.10

### Patch Changes

- [#4897](https://github.com/udecode/plate/pull/4897) by [@zbeyens](https://github.com/zbeyens) – Fix declaration bundling by restoring the workspace `platejs` build edge during package builds

## 52.0.11

### Patch Changes

- [#4784](https://github.com/udecode/plate/pull/4784) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed "Cannot find module 'react/compiler-runtime'" error for React 18 users

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - The packages `@udecode/plate-basic-elements` and `@udecode/plate-basic-marks` have been deprecated. All their plugins are now consolidated into the new `@platejs/basic-nodes` package.
  - **Migration**:
    - Replace `@udecode/plate-basic-elements` and `@udecode/plate-basic-marks` in your dependencies with `@platejs/basic-nodes`.
    - Update all import paths from `@udecode/plate-basic-elements/react` or `@udecode/plate-basic-marks/react` to `@platejs/basic-nodes/react`.
    - `CodeBlockPlugin` is **not** part of `@platejs/basic-nodes`. Ensure it is imported from `@platejs/code-block/react`.
  - `SkipMarkPlugin` (standalone) is removed. Its functionality is now built into the core editor. To enable boundary clearing for a specific mark, configure the mark plugin directly: `plugin.configure({ rules: { selection: { affinity: 'outward' } } })`.
  - Default HTML Tag Changes:
    - **Blocks**: Element plugins in `@udecode/plate-basic-nodes` (e.g., `BlockquotePlugin`, `HeadingPlugin`, `HorizontalRulePlugin`) now default to rendering with specific HTML tags (`<blockquote>`, `<h1>-<h6>`, `<hr>` respectively). `ParagraphPlugin` still defaults to `<div>`. If you relied on previous defaults or need different tags, provide a custom component or use the `render.as` option.
    - **Marks**: Mark plugins in `@udecode/plate-basic-nodes` (e.g., `BoldPlugin`, `CodePlugin`, `ItalicPlugin`) now default to specific HTML tags (`<strong>`, `<code>`, `<em>` respectively). If you relied on previous defaults or need different tags, provide a custom component or use the `render.as` option.
  - Removed Default Shortcuts:
    - Default keyboard shortcuts are no longer bundled with most plugins (exceptions: bold, italic, underline).
    - Configure shortcuts manually via the `shortcuts` field in plugin configuration.
    - Example (Block Plugins):
      ```ts
      H1Plugin.configure({ shortcuts: { toggle: { keys: "mod+alt+1" } } });
      BlockquotePlugin.configure({
        shortcuts: { toggle: { keys: "mod+shift+period" } },
      });
      ```
    - Example (Mark Plugins):
      ```ts
      CodePlugin.configure({ shortcuts: { toggle: { keys: "mod+e" } } });
      StrikethroughPlugin.configure({
        shortcuts: { toggle: { keys: "mod+shift+x" } },
      });
      SubscriptPlugin.configure({
        shortcuts: { toggle: { keys: "mod+comma" } },
      });
      SuperscriptPlugin.configure({
        shortcuts: { toggle: { keys: "mod+period" } },
      });
      HighlightPlugin.configure({
        shortcuts: { toggle: { keys: "mod+shift+h" } },
      });
      ```

### Minor Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - New `toggle` Transforms Added:
    - Block plugins with new `toggle` transforms: `BlockquotePlugin`, `H1Plugin`, `H2Plugin`, `H3Plugin`, `H4Plugin`, `H5Plugin`, `H6Plugin`.
    - All mark plugins in this package now also feature a `toggle` transform, including: `BoldPlugin`, `ItalicPlugin`, `UnderlinePlugin`, `CodePlugin`, `StrikethroughPlugin`, `SubscriptPlugin`, `SuperscriptPlugin`, `KbdPlugin`, `HighlightPlugin`.
  - Individual Heading Plugins Available:
    - `H1Plugin`, `H2Plugin`, `H3Plugin`, `H4Plugin`, `H5Plugin`, and `H6Plugin` offer a flexible alternative to the general `HeadingPlugin`, allowing granular control over heading level inclusion and configuration (e.g., custom components, shortcuts per level).
  - Plugin Consolidations into `@udecode/plate-basic-nodes`:
    - `KbdPlugin` (formerly from `@udecode/plate-kbd`).
    - `HighlightPlugin` (formerly from `@udecode/plate-highlight`).
