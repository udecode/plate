For older changelogs, see https://github.com/udecode/plate/blob/main/tooling

# 47.0.0

# @udecode/plate-markdown

### Major Changes

- [#4174](https://github.com/udecode/plate/pull/4174) by [@felixfeng33](https://github.com/felixfeng33) – #### New Features

  - Added support for math type deserialization
  - Added default underline mark serialization as `<u>underline</u>`
  - Improved serialization process:
    - Now uses a two-step process: `slate nodes => MDAST nodes => markdown string`
    - Previously: direct conversion from Slate nodes to markdown string
    - Results in more reliable and robust serialization
  - New node filtering options:
    - `allowedNodes`: Whitelist specific nodes
    - `disallowedNodes`: Blacklist specific nodes
    - `allowNode`: Custom function to filter nodes
  - New `rules` option for customizing serialization and deserialization rules, including **custom mdx** support
  - New `remarkPlugins` option to use [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins)

  #### Breaking Changes

  **Plugin Options**
  
  Removed options:
  - `elementRules` use `rules` instead
  - `textRules` use `rules` instead
  - `indentList` now automatically detects if the IndentList plugin is used
  - `splitLineBreaks` deserialize only

  ##### Deserialization

  - Removed `elementRules` and `textRules` options
    - Use `rules.key.deserialize` instead
    - See [nodes documentation](https://platejs.org/docs/markdown)

  Example migration:

  ```tsx
  export const markdownPlugin = MarkdownPlugin.configure({
    options: {
      disallowedNodes: [SuggestionPlugin.key],
      rules: {
        // For textRules
        [BoldPlugin.key]: {
          mark: true,
          deserialize: (mdastNode) => ({
            bold: true,
            text: node.value || '',
          }),
        },
        // For elementRules
        [EquationPlugin.key]: {
          deserialize: (mdastNode, options) => ({
            children: [{ text: '' }],
            texExpression: node.value,
            type: EquationPlugin.key,
          }),
        },
      },
      remarkPlugins: [remarkMath, remarkGfm],
    },
  });
  ```

  - Removed processor in `editor.api.markdown.deserialize`
    - Use `remarkPlugins` instead

  ##### Serialization

  - Removed `serializeMdNodes`
    - Use `editor.markdown.serialize({ value: nodes })` instead
  - Removed `SerializeMdOptions` due to new serialization process
    - Previous process: `slate nodes => md`
    - New process: `slate nodes => md-ast => md`
  - Removed options:
    - `nodes`
    - `breakTag`
    - `customNodes`
    - `ignoreParagraphNewline`
    - `listDepth`
    - `markFormats`
    - `ulListStyleTypes`
    - `ignoreSuggestionType`

  Migration example for `SerializeMdOptions.customNodes` and `SerializeMdOptions.nodes`:

  ```tsx
  export const markdownPlugin = MarkdownPlugin.configure({
    options: {
      rules: {
        // Ignore all `insert` type suggestions
        [SuggestionPlugin.key]: {
          mark: true,
          serialize: (slateNode: TSuggestionText, options): mdast.Text => {
            const suggestionData = options.editor
              .getApi(SuggestionPlugin)
              .suggestion.suggestionData(node);

            return suggestionData?.type === 'insert'
              ? { type: 'text', value: '' }
              : { type: 'text', value: node.text };
          },
        },
        // For elementRules
        [EquationPlugin.key]: {
          serialize: (slateNode) => ({
            type: 'math',
            value: node.texExpression,
          }),
        },
      },
      remarkPlugins: [remarkMath, remarkGfm],
    },
  });
  ```

# 46.0.0

## @udecode/plate-code-block@46.0.0

### Major Changes

- [#4122](https://github.com/udecode/plate/pull/4122) by [@zbeyens](https://github.com/zbeyens) – Migrated from `prismjs` to `highlight.js` + `lowlight` for syntax highlighting.

  - Fix highlighting multi-lines tokens. Before, line tokens were computed line by line. Now, it's computed once for the whole block.
  - Bundle size much lower.
  - `CodeBlockPlugin`: remove `prism` option. Use `lowlight` option instead:

  ```tsx
  import { all, createLowlight } from 'lowlight';

  const lowlight = createLowlight(all);

  CodeBlockPlugin.configure({
    options: {
      lowlight,
    },
  });
  ```

  - New option: `defaultLanguage`
  - Remove `syntax` option. Just omit `lowlight` option to disable syntax highlighting.
  - Remove `syntaxPopularFirst` option. Control this behavior in your own components.
  - Fix pasting code inside code blocks.
  - Remove `useCodeBlockCombobox`, `useCodeBlockElement`, `useCodeSyntaxLeaf`, `useToggleCodeBlockButton`. The logic has been moved to the components.

# 45.0.0

## @udecode/plate-comments@45.0.0

### Major Changes

- [#4064](https://github.com/udecode/plate/pull/4064) by [@felixfeng33](https://github.com/felixfeng33) – This is a rewrite of the comments plugin removing UI logic (headless).

  **Plugin Options**

  - Removed configuration options from plugin options in favor of component-level control:
    - `options.comments`
    - `options.myUserId`
    - `options.users`

  **Components**

  - Removed legacy components:
    - `CommentDeleteButton`
    - `CommentEditActions`
    - `CommentEditButton`
    - `CommentEditCancelButton`
    - `CommentEditSaveButton`
    - `CommentEditTextarea`
    - `CommentNewSubmitButton`
    - `CommentNewTextarea`
    - `CommentResolveButton`
    - `CommentsPositioner`
    - `CommentUserName`

  **API**

  - Removed functions in favor of new API methods:
    - `findCommentNode` → `api.comment.node()`
    - `findCommentNodeById` → `api.comment.node({ id })`
    - `getCommentNodeEntries` → `api.comment.nodes()`
    - `getCommentNodesById` → `api.comment.nodes({ id })`
    - `removeCommentMark` → `tf.comment.remove()`
    - `unsetCommentNodesById` → `tf.comment.unsetMark({ id })`
  - Removed unused functions:
    - `getCommentFragment`
    - `getCommentUrl`
    - `getElementAbsolutePosition`
    - `getCommentPosition`
  - Updated `getCommentCount` to exclude draft comments

  **State Management**

  - Removed `CommentProvider` - users should implement their own state management – `block-discussion.tsx`
  - Moved `useHooksComments` to UI registry – `comments-plugin.tsx`
  - Removed hooks no longer needed with new UI:
    - `useActiveCommentNode`
    - `useCommentsResolved`
    - `useCommentAddButton`
    - `useCommentItemContent`
    - `useCommentLeaf`
    - `useCommentsShowResolvedButton`
    - `useFloatingCommentsContentState`
    - `useFloatingCommentsState`

  **Types**

  - Removed `CommentUser`
  - Moved `TComment` to UI registry – `comment.tsx`

## @udecode/plate-suggestion@45.0.0

### Major Changes

- [#4064](https://github.com/udecode/plate/pull/4064) by [@felixfeng33](https://github.com/felixfeng33) – Note: This plugin is currently in an experimental phase and breaking changes may be introduced without a major version bump.

  - Add Suggestion UI
  - Remove: `findSuggestionNode` use `findSuggestionProps.ts` instead
  - Remove `addSuggestionMark.ts`
  - Remove `useHooksSuggestion.ts` as we've updated the activeId logic to no longer depend on useEditorSelector

# 44.0.1

## @udecode/plate-core@44.0.0

### Major Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) –

  - Support React 19
  - Upgraded to `zustand-x@6`
    - `eventEditorSelectors` -> `EventEditorStore.get`
    - `eventEditorActions` -> `EventEditorStore.set`
    - `useEventEditorSelectors` -> `useEventEditorValue(key)`
  - Upgraded to `jotai-x@2`
    - `usePlateEditorStore` -> `usePlateStore`
    - `usePlateActions` -> `usePlateSet`
    - Remove `editor.setPlateState`, use `usePlateSet` instead
    - `usePlateSelectors` -> `usePlateValue`
    - `usePlateStates` -> `usePlateState`
  - Moving plugin options hooks into standalone hooks to be compatible with React Compiler
    - `editor.useOption`, `ctx.useOption` -> `usePluginOption(plugin, key, ...args)`
    - `editor.useOptions`, `ctx.useOptions` -> `usePluginOption(plugin, 'state')`
    - New hook `usePluginOptions(plugin, selector)` to select plugin options (Zustand way).
  - We were supporting adding selectors to plugins using `extendOptions`. Those were mixed up with the options state, leading to potential conflicts and confusion.
    - The plugin method is renamed to `extendSelectors`
    - Selectors are now internally stored in `plugin.selectors` instead of `plugin.options`, but this does not change how you access those: using `editor.getOption(plugin, 'selectorName')`, `ctx.getOption('selectorName')` or above hooks.
    - Selector types are no longer in the 2nd generic type of `PluginConfig`, we're adding a 5th generic type for it.

  ```ts
  // Before:
  export type BlockSelectionConfig = PluginConfig<
    'blockSelection',
    { selectedIds?: Set<string>; } & BlockSelectionSelectors,
  >;

  // After:
  export type BlockSelectionConfig = PluginConfig<
    'blockSelection',
    { selectedIds?: Set<string>; },
    {}, // API
    {}, // Transforms
    BlockSelectionSelectors, // Selectors
  }>
  ```

## @udecode/plate-comments@44.0.0

### Major Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Upgrade to `jotai-x@2`. [Migration](https://github.com/udecode/jotai-x/blob/main/packages/jotai-x/CHANGELOG.md#211) needed only if you use `useCommentStore`

## @udecode/plate-media@44.0.0

### Major Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Upgrade to `zustand-x@2`. [Migration](https://github.com/udecode/zustand-x/blob/main/packages/zustand-x/CHANGELOG.md#600) needed only if you use one of these stores:

  - `ImagePreviewStore`
  - `FloatingMediaStore`

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Upgrade to `jotai-x@2`. [Migration](https://github.com/udecode/jotai-x/blob/main/packages/jotai-x/CHANGELOG.md#211) needed only if you use `usePlaceholderStore`

## @udecode/plate-resizable@44.0.0

### Major Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Upgrade to `jotai-x@2`. [Migration](https://github.com/udecode/jotai-x/blob/main/packages/jotai-x/CHANGELOG.md#211) needed only if you use `useResizableStore`

## @udecode/plate-table@44.0.0

### Major Changes

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Move store state `selectedCells` and `selectedTables` from `useTableStore` to `TablePlugin` options store. This fixes the issue to get access to those state outside a table element (e.g. the toolbar)

- [#4048](https://github.com/udecode/plate/pull/4048) by [@zbeyens](https://github.com/zbeyens) – Upgrade to `jotai-x@2`. [Migration](https://github.com/udecode/jotai-x/blob/main/packages/jotai-x/CHANGELOG.md#211) needed only if you use `useTableStore`

# 43.0.0

No breaking changes. Upgraded all dependencies to the latest version.

# 42.0.1

## @udecode/plate-ai@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – AI plugins are now experimental: pin the dependency to avoid breaking changes. No breaking changes for this release.

## @udecode/plate-common@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated and will be renamed to `@udecode/plate`. Migration:

  - Remove `@udecode/plate-common` and install `@udecode/plate`
  - Replace all `'@udecode/plate-common'` with `'@udecode/plate'`,

## @udecode/plate-core@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –

  - **Plugin `normalizeInitialValue`** now returns `void` instead of `Value`. When mutating nodes, keep their references (e.g., use `Object.assign` instead of spread).
  - **Editor methods have moved** to `editor.tf` and `editor.api`. They still exist at the top level for **slate backward compatibility**, but are no longer redundantly typed. If you truly need the top-level method types, extend your editor type with `LegacyEditorMethods` (e.g. `editor as Editor & LegacyEditorMethods`). Since these methods can be overridden by `extendEditor`, `with...`, or slate plugins, consider migrating to the following approaches:

    ```tsx
    // For overriding existing methods only:
    overrideEditor(({ editor, tf: { deleteForward }, api: { isInline } }) => ({
      transforms: {
        deleteForward(options) {
          // ...conditional override
          deleteForward(options);
        },
      },
      api: {
        isInline(element) {
          // ...conditional override
          return isInline(element);
        },
      },
    }));
    ```

  This was previously done in `extendEditor` using top-level methods, which still works but now throws a type error due to the move to `editor.tf/editor.api`. A workaround is to extend your editor with `LegacyEditorMethods`.

  **Why?** Having all methods at the top-level (next to `children`, `marks`, etc.) would clutter the editor interface. Slate splits transforms in three places (`editor`, `Editor`, and `Transforms`), which is also confusing. We've reorganized them into `tf` and `api` for better DX, but also to support transform-only middlewares in the future. This also lets us leverage `extendEditorTransforms`, `extendEditorApi`, and `overrideEditor` to modify those methods.

  Migration example:

  ```tsx
  // From:
  export const withInlineVoid: ExtendEditor = ({ editor }) => {
    const { isInline, isSelectable, isVoid, markableVoid } = editor;

    const voidTypes: string[] = [];
    const inlineTypes: string[] = [];

    editor.pluginList.forEach((plugin) => {
      if (plugin.node.isInline) {
        inlineTypes.push(plugin.node.type);
      }
      if (plugin.node.isVoid) {
        voidTypes.push(plugin.node.type);
      }
    });

    editor.isInline = (element) => {
      return inlineTypes.includes(element.type as any)
        ? true
        : isInline(element);
    };

    editor.isVoid = (element) => {
      return voidTypes.includes(element.type as any) ? true : isVoid(element);
    };

    return editor;
  };

  export const InlineVoidPlugin = createSlatePlugin({
    key: 'inlineVoid',
    extendEditor: withInlineVoid,
  });

  // After (using overrideEditor since we're only overriding existing methods):
  export const withInlineVoid: OverrideEditor = ({
    api: { isInline, isSelectable, isVoid, markableVoid },
    editor,
  }) => {
    const voidTypes: string[] = [];
    const inlineTypes: string[] = [];

    editor.pluginList.forEach((plugin) => {
      if (plugin.node.isInline) {
        inlineTypes.push(plugin.node.type);
      }
      if (plugin.node.isVoid) {
        voidTypes.push(plugin.node.type);
      }
    });

    return {
      api: {
        isInline(element) {
          return inlineTypes.includes(element.type as any)
            ? true
            : isInline(element);
        },
        isVoid(element) {
          return voidTypes.includes(element.type as any)
            ? true
            : isVoid(element);
        },
      },
    };
  };

  export const InlineVoidPlugin = createSlatePlugin({
    key: 'inlineVoid',
  }).overrideEditor(withInlineVoid);
  ```

  - Move `editor.redecorate` to `editor.api.redecorate`

  Types:

  - Rename `TRenderElementProps` to `RenderElementProps`
  - Rename `TRenderLeafProps` to `RenderLeafProps`
  - Rename `TEditableProps` to `EditableProps`

## @udecode/plate@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **This package is now the new common package**, so all plugin packages are being removed. **Migration**:

  - Add the following dependencies:

  ```json
  "@udecode/plate-alignment": "42.0.0",
  "@udecode/plate-autoformat": "42.0.0",
  "@udecode/plate-basic-elements": "42.0.0",
  "@udecode/plate-basic-marks": "42.0.0",
  "@udecode/plate-block-quote": "42.0.0",
  "@udecode/plate-break": "42.0.0",
  "@udecode/plate-code-block": "42.0.0",
  "@udecode/plate-combobox": "42.0.0",
  "@udecode/plate-comments": "42.0.0",
  "@udecode/plate-csv": "42.0.0",
  "@udecode/plate-diff": "42.0.0",
  "@udecode/plate-docx": "42.0.0",
  "@udecode/plate-find-replace": "42.0.0",
  "@udecode/plate-floating": "42.0.0",
  "@udecode/plate-font": "42.0.0",
  "@udecode/plate-heading": "42.0.0",
  "@udecode/plate-highlight": "42.0.0",
  "@udecode/plate-horizontal-rule": "42.0.0",
  "@udecode/plate-indent": "42.0.0",
  "@udecode/plate-indent-list": "42.0.0",
  "@udecode/plate-kbd": "42.0.0",
  "@udecode/plate-layout": "42.0.0",
  "@udecode/plate-line-height": "42.0.0",
  "@udecode/plate-link": "42.0.0",
  "@udecode/plate-list": "42.0.0",
  "@udecode/plate-markdown": "42.0.0",
  "@udecode/plate-media": "42.0.0",
  "@udecode/plate-mention": "42.0.0",
  "@udecode/plate-node-id": "42.0.0",
  "@udecode/plate-normalizers": "42.0.0",
  "@udecode/plate-reset-node": "42.0.0",
  "@udecode/plate-resizable": "42.0.0",
  "@udecode/plate-select": "42.0.0",
  "@udecode/plate-selection": "42.0.0",
  "@udecode/plate-slash-command": "42.0.0",
  "@udecode/plate-suggestion": "42.0.0",
  "@udecode/plate-tabbable": "42.0.0",
  "@udecode/plate-table": "42.0.0",
  "@udecode/plate-toggle": "42.0.0",
  "@udecode/plate-trailing-block": "42.0.0"
  ```

  - Either replace all `@udecode/plate` imports with the individual package imports, or export the following in a new file (e.g. `src/plate.ts`):

  ```ts
  export * from '@udecode/plate-alignment';
  export * from '@udecode/plate-autoformat';
  export * from '@udecode/plate-basic-elements';
  export * from '@udecode/plate-basic-marks';
  export * from '@udecode/plate-block-quote';
  export * from '@udecode/plate-break';
  export * from '@udecode/plate-code-block';
  export * from '@udecode/plate-combobox';
  export * from '@udecode/plate-comments';
  export * from '@udecode/plate-diff';
  export * from '@udecode/plate-find-replace';
  export * from '@udecode/plate-font';
  export * from '@udecode/plate-heading';
  export * from '@udecode/plate-highlight';
  export * from '@udecode/plate-horizontal-rule';
  export * from '@udecode/plate-indent';
  export * from '@udecode/plate-indent-list';
  export * from '@udecode/plate-kbd';
  export * from '@udecode/plate-layout';
  export * from '@udecode/plate-line-height';
  export * from '@udecode/plate-link';
  export * from '@udecode/plate-list';
  export * from '@udecode/plate-media';
  export * from '@udecode/plate-mention';
  export * from '@udecode/plate-node-id';
  export * from '@udecode/plate-normalizers';
  export * from '@udecode/plate-reset-node';
  export * from '@udecode/plate-select';
  export * from '@udecode/plate-csv';
  export * from '@udecode/plate-docx';
  export * from '@udecode/plate-markdown';
  export * from '@udecode/plate-slash-command';
  export * from '@udecode/plate-suggestion';
  export * from '@udecode/plate-tabbable';
  export * from '@udecode/plate-table';
  export * from '@udecode/plate-toggle';
  export * from '@udecode/plate-trailing-block';
  export * from '@udecode/plate-alignment/react';
  export * from '@udecode/plate-autoformat/react';
  export * from '@udecode/plate-basic-elements/react';
  export * from '@udecode/plate-basic-marks/react';
  export * from '@udecode/plate-block-quote/react';
  export * from '@udecode/plate-break/react';
  export * from '@udecode/plate-code-block/react';
  export * from '@udecode/plate-combobox/react';
  export * from '@udecode/plate-comments/react';
  export * from '@udecode/plate-floating';
  export * from '@udecode/plate-font/react';
  export * from '@udecode/plate-heading/react';
  export * from '@udecode/plate-highlight/react';
  export * from '@udecode/plate-layout/react';
  export * from '@udecode/plate-slash-command/react';
  export * from '@udecode/plate-indent/react';
  export * from '@udecode/plate-indent-list/react';
  export * from '@udecode/plate-kbd/react';
  export * from '@udecode/plate-line-height/react';
  export * from '@udecode/plate-link/react';
  export * from '@udecode/plate-list/react';
  export * from '@udecode/plate-media/react';
  export * from '@udecode/plate-reset-node/react';
  export * from '@udecode/plate-selection';
  export * from '@udecode/plate-suggestion/react';
  export * from '@udecode/plate-tabbable/react';
  export * from '@udecode/plate-table/react';
  export * from '@udecode/plate-toggle/react';
  export * from '@udecode/plate-resizable';
  ```

  - Replace all `'@udecode/plate'` and `'@udecode/plate/react'` with `'@/plate'` in your codebase.

## @udecode/plate-utils@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –
  - Removed unused `moveSelectionByOffset`, `getLastBlockDOMNode`, `useLastBlock`, `useLastBlockDOMNode`

## @udecode/plate-selection@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – Remove first parameter of editor.api.blockSelection.duplicate

## @udecode/slate@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) –

  - Remove `slate`, `slate-dom`, `slate-react`, `slate-history` and `slate-hyperscript` from your dependencies. It's now part of this package and `@udecode/plate`. All exports remain the same or have equivalents (see below).
  - Renamed `createTEditor` to `createEditor`.
  - `createEditor` now returns an editor (`Editor`) with all queries under `editor.api` and transforms under `editor.tf`. You can see or override them at a glance. For example, we now use `editor.tf.setNodes` instead of importing `setNodes`. This marks the completion of generic typing and the removal of error throws from `slate`, `slate-dom`, and `slate-history` queries/transforms, without forking implementations. We’ve also reduced the number of queries/transforms by merging a bunch of them.

  The following interfaces from `slate` and `slate-dom` are now part of `Editor`:

  - `Editor`, `EditorInterface`

  - `Transforms`

  - `HistoryEditor` (noop, unchanged), `HistoryEditorInterface`

  - `DOMEditor` (noop, unchanged), `DOMEditorInterface`

  - `editor.findPath` now returns `DOMEditor.findPath` (memo) and falls back to `findNodePath` (traversal, less performant) if not found.

  - Removed the first parameter (`editor`) from:

    - `editor.hasEditableTarget`
    - `editor.hasSelectableTarget`
    - `editor.isTargetInsideNonReadonlyVoid`
    - `editor.hasRange`
    - `editor.hasTarget`

  - `editor.api.node(options)` (previously `findNode`) `at` option is now `at ?? editor.selection` instead of `at ?? editor.selection ?? []`. That means if you want to lookup the entire document, you need to pass `[]` explicitly.

  - Removed `setNode` in favor of `setNodes` (you can now pass a `TNode` to `at` directly).

  - Removed `setElements` in favor of `setNodes`.

  - Removed unused `isWordAfterTrigger`, `setBlockAboveNode`, `setBlockAboveTexts`, `setBlockNodes`, `getPointNextToVoid`.

  - Replaced `Path` from slate with `Path` (type) and `PathApi` (static methods).

  - Replaced `Operation` from slate with `Operation` (type) and `OperationApi` (static methods).

  - Replaced `Point` from slate with `Point` (type) and `PointApi` (static methods).

  - Replaced `Text` from slate with `TText` (type) and `TextApi` (static methods). We also export `Text` type like `slate` but we don't recommend it as it's conflicting with the DOM type.

  - Replaced `Range` from slate with `TRange` (type) and `RangeApi` (static methods). We also export `Range` type like `slate` but we don't recommend it as it's conflicting with the DOM type.

  - Replaced `Location` from slate with `TLocation` (type) and `LocationApi` (static methods). We also export `Location` type like `slate` but we don't recommend it as it's conflicting with the DOM type.

  - Replaced `Span` from slate with `Span` (type) and `SpanApi` (static methods).

  - Replaced `Node` from slate with `TNode` (type) and `NodeApi` (static methods). We also export `Node` type like `slate` but we don't recommend it as it's conflicting with the DOM type.

  - Replaced `Element` from slate with `TElement` (type) and `ElementApi` (static methods). We also export `Element` type like `slate` but we don't recommend it as it's conflicting with the DOM type.

  - Signature change:

    - `editor.tf.toggle.block({ type, ...options })` -> `editor.tf.toggleBlock(type, options)`
    - `editor.tf.toggle.mark({ key, clear })` -> `editor.tf.toggleMark(key, { remove: clear })`

  - Moved editor functions:

    - `addMark` -> `editor.tf.addMark`
    - `addRangeMarks` -> `editor.tf.setNodes(props, { at, marks: true })`
    - `blurEditor` -> `editor.tf.blur`
    - `collapseSelection` -> `editor.tf.collapse`
    - `createDocumentNode` -> `editor.api.create.value` (core)
    - `createNode` -> `editor.api.create.block`
    - `createPathRef` -> `editor.api.pathRef`
    - `createPointRef` -> `editor.api.pointRef`
    - `createRangeRef` -> `editor.api.rangeRef`
    - `deleteBackward({ unit })` -> `editor.tf.deleteBackward(unit)`
    - `deleteForward({ unit })` -> `editor.tf.deleteForward(unit)`
    - `deleteFragment` -> `editor.tf.deleteFragment`
    - `deleteText` -> `editor.tf.delete`
    - `deselect` -> `editor.tf.deselect`
    - `deselectEditor` -> `editor.tf.deselectDOM`
    - `duplicateBlocks` -> `editor.tf.duplicateNodes({ nodes })`
    - `findDescendant` -> `editor.api.descendant`
    - `findEditorDocumentOrShadowRoot` -> `editor.api.findDocumentOrShadowRoot`
    - `findEventRange` -> `editor.api.findEventRange`
    - `findNode(options)` -> `editor.api.node(options)`
    - `findNodeKey` -> `editor.api.findKey`
    - `findNodePath` -> `editor.api.findPath`
    - `findPath` -> `editor.api.findPath`
    - `focusEditor` -> `editor.tf.focus({ at })`
    - `focusEditorEdge` -> `editor.tf.focus({ at, edge: 'startEditor' | 'endEditor' })`
    - `getAboveNode` -> `editor.api.above`
    - `getAncestorNode` -> `editor.api.block({ highest: true })`
    - `getBlockAbove` -> `editor.api.block({ at, above: true })` or `editor.api.block()` if `at` is not a path
    - `getBlocks` -> `editor.api.blocks`
    - `getEdgeBlocksAbove` -> `editor.api.edgeBlocks`
    - `getEdgePoints` -> `editor.api.edges`
    - `getEditorString` -> `editor.api.string`
    - `getEditorWindow` -> `editor.api.getWindow`
    - `getEndPoint` -> `editor.api.end`
    - `getFirstNode` -> `editor.api.first`
    - `getFragment` -> `editor.api.fragment`
    - `getFragmentProp(fragment, options)` -> `editor.api.prop({ nodes, ...options})`
    - `getLastNode` -> `editor.api.last`
    - `getLastNodeByLevel(level)` -> `editor.api.last([], { level })`
    - `getLeafNode` -> `editor.api.leaf`
    - `getLevels` -> `editor.api.levels`
    - `getMark` -> `editor.api.mark`
    - `getMarks` -> `editor.api.marks`
    - `getNextNode` -> `editor.api.next`
    - `getNextNodeStartPoint` -> `editor.api.start(at, { next: true })`
    - `getNodeEntries` -> `editor.api.nodes`
    - `getNodeEntry` -> `editor.api.node(at, options)`
    - `getNodesRange` -> `editor.api.nodesRange`
    - `getParentNode` -> `editor.api.parent`
    - `getPath` -> `editor.api.path`
    - `getPathRefs` -> `editor.api.pathRefs`
    - `getPoint` -> `editor.api.point`
    - `getPointAfter` -> `editor.api.after`
    - `getPointBefore` -> `editor.api.before`
    - `getPointBeforeLocation` -> `editor.api.before`
    - `getPointRefs` -> `editor.api.pointRefs`
    - `getPositions` -> `editor.api.positions`
    - `getPreviousBlockById` -> `editor.api.previous({ id, block: true })`
    - `getPreviousNode` -> `editor.api.previous`
    - `getPreviousNodeEndPoint` -> `editor.api.end({ previous: true })`
    - `getPreviousSiblingNode` -> `editor.api.previous({ at, sibling: true })`
    - `getRange` -> `editor.api.range`
    - `getRangeBefore` -> `editor.api.range('before', to, { before })`
    - `getRangeFromBlockStart` -> `editor.api.range('start', to)`
    - `getRangeRefs` -> `editor.api.rangeRefs`
    - `getSelectionFragment` -> `editor.api.fragment(editor.selection, { structuralTypes })`
    - `getSelectionText` -> `editor.api.string()`
    - `getStartPoint` -> `editor.api.start`
    - `getVoidNode` -> `editor.api.void`
    - `hasBlocks` -> `editor.api.hasBlocks`
    - `hasEditorDOMNode` -> `editor.api.hasDOMNode`
    - `hasEditorEditableTarget` -> `editor.api.hasEditableTarget`
    - `hasEditorSelectableTarget` -> `editor.api.hasSelectableTarget`
    - `hasEditorTarget` -> `editor.api.hasTarget`
    - `hasInlines` -> `editor.api.hasInlines`
    - `hasTexts` -> `editor.api.hasTexts`
    - `insertBreak` -> `editor.tf.insertBreak`
    - `insertData` -> `editor.tf.insertData`
    - `insertElements` -> `editor.tf.insertNodes<TElement>`
    - `insertEmptyElement` -> `editor.tf.insertNodes(editor.api.create.block({ type }))`
    - `insertFragment` -> `editor.tf.insertFragment`
    - `insertNode` -> `editor.tf.insertNode`
    - `insertNodes` -> `editor.tf.insertNodes`
    - `insertText` -> `editor.tf.insertText({ at })` or `editor.tf.insertText({ marks: false })` without `at`
    - `isAncestorEmpty` -> `editor.api.isEmpty`
    - `isBlock` -> `editor.api.isBlock`
    - `isBlockAboveEmpty` -> `editor.api.isEmpty(editor.selection, { block: true })`
    - `isBlockTextEmptyAfterSelection` -> `editor.api.isEmpty(editor.selection, { after: true })`
    - `isCollapsed(editor.selection)` -> `editor.api.isCollapsed()`
    - `isComposing` -> `editor.api.isComposing`
    - `isDocumentEnd` -> `editor.api.isEditorEnd`
    - `isEdgePoint` -> `editor.api.isEdge`
    - `isEditorEmpty` -> `editor.api.isEmpty()`
    - `isEditorFocused` -> `editor.api.isFocused`
    - `isEditorNormalizing` -> `editor.api.isNormalizing`
    - `isEditorReadOnly` -> `editor.api.isReadOnly`
    - `isElementEmpty` -> `editor.api.isEmpty`
    - `isElementReadOnly` -> `editor.api.elementReadOnly`
    - `isEndPoint` -> `editor.api.isEnd`
    - `isExpanded(editor.selection)` -> `editor.api.isCollapsed()`
    - `isInline` -> `editor.api.isInline`
    - `isMarkableVoid` -> `editor.api.markableVoid`
    - `isMarkActive` -> `editor.api.hasMark(key)`
    - `isPointAtWordEnd` -> `editor.api.isAt({ at, word: true, end: true })`
    - `isRangeAcrossBlocks` -> `editor.api.isAt({ at, blocks: true })`
    - `isRangeInSameBlock` -> `editor.api.isAt({ at, block: true })`
    - `isRangeInSingleText` -> `editor.api.isAt({ at, text: true })`
    - `isSelectionAtBlockEnd` -> `editor.api.isAt({ end: true })`
    - `isSelectionAtBlockStart` -> `editor.api.isAt({ start: true })`
    - `isSelectionCoverBlock` -> `editor.api.isAt({ block: true, start: true, end: true })`
    - `isSelectionExpanded` -> `editor.api.isExpanded()`
    - `isStartPoint` -> `editor.api.isStart`
    - `isTargetinsideNonReadonlyVoidEditor` -> `editor.api.isTargetInsideNonReadonlyVoid`
    - `isTextByPath` -> `editor.api.isText(at)`
    - `isVoid` -> `editor.api.isVoid`
    - `liftNodes` -> `editor.tf.liftNodes`
    - `mergeNodes` -> `editor.tf.mergeNodes`
    - `moveChildren` -> `editor.tf.moveNodes({ at, to, children: true, fromIndex, match: (node, path) => boolean })`
    - `moveNodes` -> `editor.tf.moveNodes`
    - `moveSelection` -> `editor.tf.move`
    - `normalizeEditor` -> `editor.tf.normalize`
    - `removeEditorMark` -> `editor.tf.removeMark`
    - `removeEditorText` -> `editor.tf.removeNodes({ text: true, empty: false })`
    - `removeEmptyPreviousBlock` -> `editor.tf.removeNodes({ previousEmptyBlock: true })`
    - `removeMark(options)` -> `editor.tf.removeMarks(keys, options)`
    - `removeNodeChildren` -> `editor.tf.removeNodes({ at, children: true })`
    - `removeNodes` -> `editor.tf.removeNodes`
    - `removeSelectionMark` -> `editor.tf.removeMarks()`
    - `replaceNode(editor, { nodes, insertOptions, removeOptions })` -> `editor.tf.replaceNodes(nodes, { removeNodes, ...insertOptions })`
    - `select` -> `editor.tf.select`
    - `selectEndOfBlockAboveSelection` -> `editor.tf.select(editor.selection, { edge: 'end' })`
    - `selectNodes` -> `editor.tf.select(editor.api.nodesRange(nodes))`
    - `setFragmentData` -> `editor.tf.setFragmentData`
    - `setMarks(marks, clear)` -> `editor.tf.addMarks(marks, { remove: string | string[] })`
    - `setNodes` -> `editor.tf.setNodes`
    - `setPoint` -> `editor.tf.setPoint`
    - `setSelection` -> `editor.tf.setSelection`
    - `someNode` -> `editor.api.some(options)`
    - `splitNodes` -> `editor.tf.splitNodes`
    - `toDOMNode` -> `editor.api.toDOMNode`
    - `toDOMPoint` -> `editor.api.toDOMPoint`
    - `toDOMRange` -> `editor.api.toDOMRange`
    - `toggleWrapNodes` -> `editor.tf.toggleBlock(type, { wrap: true })`
    - `toSlateNode` -> `editor.api.toSlateNode`
    - `toSlatePoint` -> `editor.api.toSlatePoint`
    - `toSlateRange` -> `editor.api.toSlateRange`
    - `unhangCharacterRange` -> `editor.api.unhangRange(range, { character: true })`
    - `unhangRange` -> `editor.api.unhangRange`
    - `unsetNodes` -> `editor.tf.unsetNodes`
    - `unwrapNodes` -> `editor.tf.unwrapNodes`
    - `withoutNormalizing` -> `editor.tf.withoutNormalizing`
    - `wrapNodeChildren` -> `editor.tf.wrapNodes(element, { children: true })`
    - `wrapNodes` -> `editor.tf.wrapNodes`
    - `replaceNodeChildren` -> `editor.tf.replaceNodes({ at, children: true })`
    - `resetEditor` -> `editor.tf.reset`
    - `resetEditorChildren` -> `editor.tf.reset({ children: true })`
    - `selectEditor` -> `editor.tf.select([], { focus, edge })`
    - `selectSiblingNodePoint` -> `editor.tf.select(at, { next, previous })`

  - Moved to `NodeApi.`:

    - `getNextSiblingNodes(parentEntry, path)` -> `NodeApi.children(editor, path, { from: path.at(-1) + 1 })`
    - `getFirstNodeText` -> `NodeApi.firstText`
    - `getFirstChild([node, path])` -> `NodeApi.firstChild(editor, path)`
    - `getLastChild([node, path])` -> `NodeApi.lastChild(editor, path)`
    - `getLastChildPath([node, path])` -> `NodeApi.lastChild(editor, path)`
    - `isLastChild([node, path], childPath)` -> `NodeApi.isLastChild(editor, childPath)`
    - `getChildren([node, path])` -> `Array.from(NodeApi.children(editor, path))`
    - `getCommonNode` -> `NodeApi.common`
    - `getNode` -> `NodeApi.get`
    - `getNodeAncestor` -> `NodeApi.ancestor`
    - `getNodeAncestors` -> `NodeApi.ancestors`
    - `getNodeChild` -> `NodeApi.child`
    - `getNodeChildren` -> `NodeApi.children`
    - `getNodeDescendant` -> `NodeApi.descendant`
    - `getNodeDescendants` -> `NodeApi.descendants`
    - `getNodeElements` -> `NodeApi.elements`
    - `getNodeFirstNode` -> `NodeApi.first`
    - `getNodeFragment` -> `NodeApi.fragment`
    - `getNodeLastNode` -> `NodeApi.last`
    - `getNodeLeaf` -> `NodeApi.leaf`
    - `getNodeLevels` -> `NodeApi.levels`
    - `getNodeParent` -> `NodeApi.parent`
    - `getNodeProps` -> `NodeApi.extractProps`
    - `getNodes` -> `NodeApi.nodes`
    - `getNodeString` -> `NodeApi.string`
    - `getNodeTexts` -> `NodeApi.texts`
    - `hasNode` -> `NodeApi.has`
    - `hasSingleChild` -> `NodeApi.hasSingleChild`
    - `isAncestor` -> `NodeApi.isAncestor`
    - `isDescendant` -> `NodeApi.isDescendant`
    - `isEditor` -> `NodeApi.isEditor`
    - `isNode` -> `NodeApi.isNode`
    - `isNodeList` -> `NodeApi.isNodeList`
    - `nodeMatches` -> `NodeApi.matches`

  - Moved to `ElementApi.`:

    - `elementMatches` -> `ElementApi.matches`
    - `isElement` -> `ElementApi.isElement`
    - `isElementList` -> `ElementApi.isElementList`

  - Moved to `TextApi.`:

    - `isText` -> `TextApi.isText(at)`

  - Moved to `RangeApi.`:

    - `isCollapsed` -> `RangeApi.isCollapsed`
    - `isExpanded` -> `RangeApi.isExpanded`

  - Moved to `PathApi.`:

    - `isFirstChild` -> `!PathApi.hasPrevious`
    - `getPreviousPath` -> `PathApi.previous`

  - Moved to `PointApi.`:

    - `getPointFromLocation({ at, focus })` -> `PointApi.get(at, { focus })`

  - Moved from `@udecode/plate/react` to `@udecode/plate`:

    - `Hotkeys`

  - Upgraded to `zustand@5` and `zustand-x@5`:
    - Replace `createZustandStore('name')(initialState)` with `createZustandStore(initialState, { mutative: true, name: 'name' })`
    - All plugin stores now use [zustand-mutative](https://github.com/mutativejs/zustand-mutative) for immutable state updates, which is faster than `immer`.

  Types:

  - Rename the following types:
    - `TEditor` -> `Editor`
    - `TOperation` -> `Operation`
    - `TPath` -> `Path`
    - `TNodeProps` -> `NodeProps`
    - `TNodeChildEntry` -> `NodeChildEntry`
    - `TNodeEntry` -> `NodeEntry`
    - `TDescendant` -> `Descendant`
    - `TDescendantEntry` -> `DescendantEntry`
    - `TAncestor` -> `Ancestor`
    - `TAncestorEntry` -> `AncestorEntry`
    - `TElementEntry` -> `ElementEntry`
    - `TTextEntry` -> `TextEntry`
  - Query/transform options now use generic `V extends Value` instead of `E extends Editor`.
  - `getEndPoint`, `getEdgePoints`, `getFirstNode`, `getFragment`, `getLastNode`, `getLeafNode`, `getPath`, `getPoint`, `getStartPoint` can return `undefined` if not found (suppressing error throws).
  - `NodeApi.ancestor`, `NodeApi.child`, `NodeApi.common`, `NodeApi.descendant`, `NodeApi.first`, `NodeApi.get`, `NodeApi.last`, `NodeApi.leaf`, `NodeApi.parent`, `NodeApi.getIf`, `PathApi.previous` return `undefined` if not found instead of throwing
  - Replace `NodeOf` type with `DescendantOf` in `editor.tf.setNodes` `editor.tf.unsetNodes`, `editor.api.previous`, `editor.api.node`, `editor.api.nodes`, `editor.api.last`
  - Enhanced `editor.tf.setNodes`:
    - Added `marks` option to handle mark-specific operations
    - When `marks: true`:
      - Only applies to text nodes in non-void nodes or markable void nodes
      - Automatically sets `split: true` and `voids: true`
      - Handles both expanded ranges and collapsed selections in markable voids
    - Replaces `addRangeMarks` functionality

## @udecode/slate-utils@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated. Use `@udecode/slate` or `@udecode/plate` instead.

## @udecode/slate-react@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated. Use `@udecode/slate` or `@udecode/plate` instead.

## @udecode/plate-table@42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **Major performance improvement**: all table cells were re-rendering when a single cell changed. This is now fixed.

  - `TablePlugin` now depends on `NodeIdPlugin`.
  - Table merging is now enabled by default:
    - Renamed `enableMerging` to `disableMerge`.
    - **Migration**:
      - `enableMerging: true` → remove the option.
      - otherwise → `TablePlugin.configure({ options: { disableMerge: true } })`
  - Renamed `unmergeTableCells` to `splitTableCell`.
  - Renamed `editor.api.create.cell` to `editor.api.create.tableCell`.
  - In `useTableMergeState`, renamed `canUnmerge` to `canSplit`.
  - `insertTableRow` and `insertTableColumn`: removed `disableSelect` in favor of `select`. **Migration**: replace it with the opposite boolean.
  - `getTableCellBorders`: params `(element, options)` → `(editor, options)`; removed `isFirstCell` and `isFirstRow`.
  - Merged `useTableCellElementState` into `useTableCellElement`:
    - Removed its parameter.
    - Removed `hovered` and `hoveredLeft` returns (use CSS instead).
    - Renamed `rowSize` to `minHeight`.
    - Computes column sizes and returns `width`.
  - Merged `useTableCellElementResizableState` into `useTableCellElementResizable`:
    - Removed `onHover` and `onHoverEnd` props (use CSS instead).
  - Merged `useTableElementState` into `useTableElement`:
    - Removed its parameter.
    - No longer computes and returns `colSizes`, `minColumnWidth`, and `colGroupProps`.

# 41.0.2

## @udecode/slate-react@41.0.0

### Major Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Rename `findNodePath` to `findPath` since the addition of `findNodePath` in the headless lib.

  We recommend using `findPath` mostly when subscribing to its value (e.g. in a React component) as it has O(path.length) complexity, compared to O(n) for the traversal-based `findNodePath`. This optimization is particularly important in:

  - Render functions of Plate components where using `findNodePath` would increase the initial render time by O(n²)
  - Key press handlers where using `findNodePath` would increase the handling time by O(n)

  where n is the number of nodes in the editor.

## @udecode/plate-dnd@41.0.2

### Major Changes

- [#3861](https://github.com/udecode/plate/pull/3861) by [@zbeyens](https://github.com/zbeyens) –

  - Removed `useDndBlock`, `useDragBlock`, and `useDropBlock` hooks in favor of `useDndNode`, `useDragNode`, and `useDropNode`.
  - Removed `DndProvider` and `useDraggableStore`. Drop line state is now managed by `DndPlugin` as a single state object `dropTarget` containing both `id` and `line`.
  - `useDropNode`: removed `onChangeDropLine` and `dropLine` options

  Migration steps:

  - Remove `DndProvider` from your draggable component (e.g. `draggable.tsx`)
  - Replace `useDraggableStore` with `useEditorPlugin(DndPlugin).useOption`
  - Remove `useDraggableState`. Use `const { isDragging, previewRef, handleRef } = useDraggable`
  - Remove `useDraggableGutter`. Set `contentEditable={false}` to your gutter element
  - Remove `props` from `useDropLine`. Set `contentEditable={false}` to your drop line element
  - Remove `withDraggable`, `useWithDraggable`. Use [`DraggableAboveNodes`](https://github.com/udecode/plate/pull/3878/files#diff-493c12ebed9c3ef9fd8c3a723909b18ad439a448c0132d2d93e5341ee0888ad2) instead

## @udecode/plate-indent-list@41.0.0

### Major Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) –
  - Move `render.belowNodes` from `IndentListPlugin` to `BaseIndentListPlugin`. Props type for `listStyleTypes.liComponent` and `listStyleTypes.markerComponent` options is now `SlateRenderElementProps` instead of `PlateRenderElementProps`
  - Move `someIndentList`, `someIndentTodo` from `@udecode/plate-indent-list/react` to `@udecode/plate-indent-list`

## @udecode/plate-layout@41.0.2

### Major Changes

- [#3878](https://github.com/udecode/plate/pull/3878) by [@zbeyens](https://github.com/zbeyens) –

  - `insertColumnGroup`: rename `layout` to `columns`
  - Remove `setColumnWidth`, `useColumnState`. Use `setColumns` instead

## @udecode/plate-table@41.0.0

### Major Changes

- [#3830](https://github.com/udecode/plate/pull/3830) by [@felixfeng33](https://github.com/felixfeng33) – Move from `@udecode/plate-table/react` to `@udecode/plate-table`:

  - `deleteColumn`
  - `deleteColumnWhenExpanded`
  - `deleteRow`
  - `deleteRowWhenExpanded`
  - `getTableColumn`
  - `getTableGridAbove`
  - `getTableGridByRange`
  - `getTableRow`
  - `insertTable`
  - `mergeTableCells`
  - `moveSelectionFromCell`
  - `overrideSelectionFromCell`
  - `unmergeTableCells`
  - `withDeleteTable`
  - `withGetFragmentlable`
  - `withInsertFragmentTable`
  - `withInsertTextTable`
  - `withMarkTable`
  - `withSelectionTable`
  - `withSetFragmentDataTable`
  - `withTable`

# 40.0.0

## @udecode/slate-react@40.0.0

### Major Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Add `slate-dom` as a peer dependency.
  - Update `slate-react` peer dependency to `>=0.111.0`

## @udecode/plate-ai@40.0.0

### Major Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `scrollContainerSelector` option in favor of `useEditorContainerRef`

## @udecode/plate-heading@40.0.0

### Major Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `scrollContainerSelector` option in favor of `useEditorContainerRef`

## @udecode/plate-layout@40.0.0

### Major Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `toggleColumns` in favor of `toggleColumnGroup`
  - Remove `insertEmptyColumn` in favor of `insertColumn`

# 39.0.0

## @udecode/plate-dnd@39.0.0

### Major Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) – The following changes were made to improve performance:

  - Refactored `useDraggable` hook to focus on core dragging functionality:
    - Removed `dropLine`. Use `useDropLine().dropLine` instead.
    - Removed `groupProps` from the returned object – `isHovered`, and `setIsHovered` from the returned state. Use CSS instead.
    - Removed `droplineProps`, and `gutterLeftProps` from the returned object. Use `useDropLine().props`, `useDraggableGutter().props` instead.

## @udecode/plate-selection@39.0.0

### Major Changes

- [#3597](https://github.com/udecode/plate/pull/3597) by [@zbeyens](https://github.com/zbeyens) – The following changes were made to improve performance:

  - Removed `useHooksBlockSelection` in favor of `BlockSelectionAfterEditable`
  - Removed `slate-selected` class from `BlockSelectable`. You can do it on your components using `useBlockSelected()` instead, or by using our new `block-selection.tsx` component.
  - Introduced `useBlockSelectableStore` for managing selectable state.

# 38.0.1

## @udecode/plate-core@38.0.1

### Major Changes

- [#3506](https://github.com/udecode/plate/pull/3506) by [@zbeyens](https://github.com/zbeyens) –

  - Change `plugin.options` merging behavior from deep merge to shallow merge.
  - This affects `.extend()`, `.configure()`, and other methods that modify plugin options.
  - This update addresses a **performance regression** introduced in v37 that affected editor creation.

  Before:

  ```ts
  const plugin = createSlatePlugin({
    key: 'test',
    options: { nested: { a: 1 } },
  }).extend({
    options: { nested: { b: 1 } },
  });

  // Result: { nested: { a: 1, b: 1 } }
  ```

  After:

  ```ts
  const plugin = createSlatePlugin({
    key: 'test',
    options: { nested: { a: 1 } },
  }).extend(({ getOptions }) => ({
    options: {
      ...getOptions(),
      nested: { ...getOptions().nested, b: 1 },
    },
  }));

  // Result: { nested: { a: 1, b: 1 } }
  ```

  Migration:

  - If you're using nested options and want to preserve the previous behavior, you need to manually spread both the top-level options and the nested objects.
  - If you're not using nested options, no changes are required.

- Rename all base plugins that have a React plugin counterpart to be prefixed with `Base`. This change improves clarity and distinguishes base implementations from potential React extensions. Use base plugins only for server-side environments or to extend your own DOM layer.
- Import the following plugins from `/react` entry: `AlignPlugin`, `CalloutPlugin`, `EquationPlugin`, `FontBackgroundColorPlugin`, `FontColorPlugin`, `FontFamilyPlugin`, `FontSizePlugin`, `FontWeightPlugin`, `InlineEquationPlugin`, `LineHeightPlugin`, `TextIndentPlugin`, `TocPlugin`

# 37.0.0

Migration example: https://github.com/udecode/plate/pull/3480

We recommend to upgrade to `@udecode/plate-core@38.1.0` in one-go.

## @udecode/plate-alignment@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createAlignPlugin` -> `AlignPlugin`
  - `setAlign`: remove `key` option

## @udecode/plate-autoformat@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createAutoformatPlugin` -> `AutoformatPlugin`

## @udecode/plate-basic-elements@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createBasicElementPlugins` -> `BasicElementsPlugin`
  - `createBlockquotePlugin` -> `BlockquotePlugin`
  - `createCodeBlockPlugin` -> `CodeBlockPlugin`
  - `createHeadingPlugin` -> `HeadingPlugin`
  - Move paragraph plugin to `@udecode/plate-core`

## @udecode/plate-basic-marks@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createBasicMarksPlugins` -> `BasicMarksPlugin`
  - `createBoldPlugin` -> `BoldPlugin`
  - `createCodePlugin` -> `CodePlugin`
  - `createItalicPlugin` -> `ItalicPlugin`
  - `createStrikethroughPlugin` -> `StrikethroughPlugin`
  - `createSubscriptPlugin` -> `SubscriptPlugin`
  - `createSuperscriptPlugin` -> `SuperscriptPlugin`
  - `createUnderlinePlugin` -> `UnderlinePlugin`
  - All mark plugins removed `hotkey` option. Use `plugin.shortcuts` instead (see plate-core)

## @udecode/plate-block-quote@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createBlockquotePlugin` -> `BlockquotePlugin`

## @udecode/plate-break@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSoftBreakPlugin` -> `SoftBreakPlugin`
  - `createExitBreakPlugin` -> `ExitBreakPlugin`
  - `createSingleLinePlugin` -> `SingleLinePlugin`

## @udecode/plate-caption@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCaptionPlugin` -> `CaptionPlugin`
  - `CaptionPlugin` options:
    - Rename `pluginKeys` to `plugins`
    - Rename `focusEndCaptionPath` to `focusEndPath`
    - Rename `focusStartCaptionPath` to `focusStartPath`
    - Rename `showCaptionId` to `visibleId`
    - Rename `isShow` to `isVisible`
  - Move `captionGlobalStore` to `CaptionPlugin`

## @udecode/plate-cloud@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCloudPlugin` -> `CloudPlugin`

## @udecode/plate-code-block@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCodeBlockPlugin` -> `CodeBlockPlugin`
  - NEW `CodeLinePlugin`
  - NEW `CodeSyntaxPlugin`
  - Remove `getCodeLineType`, use `editor.getType(CodeLinePlugin)` instead

## @udecode/plate-combobox@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-combobox` and `@udecode/plate-combobox/react`.

## @udecode/plate-comments@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCommentsPlugin` -> `CommentsPlugin`
  - Move `commentsStore` to `CommentsPlugin`
  - Remove `CommentsProvider` and its hooks
  - Remove `useCommentsStates` (replaced by direct option access)
  - Remove `useCommentsSelectors` (replaced by option selectors)
  - Remove `useCommentsActions` (replaced by api methods)
  - Replace `useUpdateComment` with `api.comment.updateComment`
  - Replace `useAddRawComment` with `api.comment.addRawComment`
  - Replace `useAddComment` with `api.comment.addComment`
  - Replace `useRemoveComment` with `api.comment.removeComment`
  - Replace `useResetNewCommentValue` with `api.comment.resetNewCommentValue`
  - Replace `useNewCommentText` with `options.newText`
  - Replace `useMyUser` with `options.myUser`
  - Replace `useUserById` with `options.userById`
  - Replace `useCommentById` with `options.commentById`
  - Replace `useActiveComment` with `options.activeComment`
  - Replace `useAddCommentMark` with `insert.comment`

## @udecode/plate-common@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-common` and `@udecode/plate-common/react`.
  - NEW `/react` exports `@udecode/react-hotkeys`

## @udecode/plate-core@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – **Plugin System**:

  Decoupling React in all packages:

  - Split build into `@udecode/plate-core` and `@udecode/plate-core/react`
  - NEW `SlatePlugin` as the foundation for all plugins
  - `PlatePlugin` extends `SlatePlugin` with React-specific plugin features

  **Plugin Creation**:

  - Remove `createPluginFactory`
  - NEW `createSlatePlugin`: vanilla
  - NEW `createTSlatePlugin`: vanilla explicitly typed
  - NEW `createPlatePlugin`: React
  - NEW `createTPlatePlugin`: React explicitly typed
  - NEW `toPlatePlugin`: extend a vanilla plugin into a React plugin
  - NEW `toTPlatePlugin`: extend a vanilla plugin into a React plugin explicitly typed
  - Rename all plugins starting with `createNamePlugin()` to `NamePlugin`

  Before:

  ```typescript
  const MyPluginFactory = createPluginFactory({
    key: 'myPlugin',
    isElement: true,
    component: MyComponent,
  });
  const plugin = MyPluginFactory();
  ```

  After:

  ```typescript
  const plugin = createSlatePlugin({
    key: 'myPlugin',
    node: {
      isElement: true,
      component: MyComponent,
    },
  });
  const reactPlugin = toPlatePlugin(plugin);
  ```

  **Plugin Configuration**:

  - Remove all `NamePlugin` option types, use `NameConfig` instead.
  - `NameConfig` as the new naming convention for plugin configurations.

  Before:

  ```typescript
  createPluginFactory<HotkeyPlugin>({
    handlers: {
      onKeyDown: onKeyDownToggleElement,
    },
    options: {
      hotkey: ['mod+opt+0', 'mod+shift+0'],
    },
  });
  ```

  After:

  ```typescript
  export const ParagraphPlugin = createPlatePlugin({
    key: 'p',
    node: { isElement: true },
  }).extend({ editor, type }) => ({
    shortcuts: {
      toggleParagraph: {
        handler: () => {
          editor.tf.toggle.block({ type });
        },
        keys: [
          [Key.Mod, Key.Alt, '0'],
          [Key.Mod, Key.Shift, '0'],
        ],
        preventDefault: true,
      },
    },
  })
  ```

  - `toggleParagraph` is now a shortcut for `editor.tf.toggle.block({ type: 'p' })` for the given keys
  - Multiple shortcuts can be defined per plugin, and any shortcut can be disabled by setting `shortcuts.toggleParagraph = null`
  - Note the typing support using `Key`

  **Plugin Properties**:

  Rename `SlatePlugin` / `PlatePlugin` properties:

  - `type` -> `node.type`
  - `isElement` -> `node.isElement`
  - `isLeaf` -> `node.isLeaf`
  - `isInline` -> `node.isInline`
  - `isMarkableVoid` -> `node.isMarkableVoid`
  - `isVoid` -> `node.isVoid`
  - `component` -> `node.component` or `render.node`
  - `props` -> `node.props`
  - `overrideByKey` -> `override.plugins`
  - `renderAboveEditable` -> `render.aboveEditable`
  - `renderAboveSlate` -> `render.aboveSlate`
  - `renderAfterEditable` -> `render.afterEditable`
  - `renderBeforeEditable` -> `render.beforeEditable`
  - `inject.props` -> `inject.nodeProps`
  - `inject.props.validTypes` -> `inject.targetPlugins`
  - `inject.aboveComponent` -> `render.aboveNodes`
  - `inject.belowComponent` -> `render.belowNodes`
  - `inject.pluginsByKey` -> `inject.plugins`
  - `editor.insertData` -> `parser`
    - NEW `parser.format` now supports `string[]`
    - NEW `parser.mimeTypes: string[]`
  - `deserializeHtml` -> `parsers.html.deserializer`
  - `deserializeHtml.getNode` -> `parsers.html.deserializer.parse`
  - `serializeHtml` -> `parsers.htmlReact.serializer`
  - `withOverride` -> `extendEditor`
  - All methods now have a single parameter: `SlatePluginContext<C>` or `PlatePluginContext<C>`, in addition to the method specific options. Some of the affected methods are:
    - `decorate`
    - `handlers`, including `onChange`. Returns `({ event, ...ctx }) => void` instead of `(editor, plugin) => (event) => void`
    - `handlers.onChange`: `({ value, ...ctx }) => void` instead of `(editor, plugin) => (value) => void`
    - `normalizeInitialValue`
    - `editor.insertData.preInsert`
    - `editor.insertData.transformData`
    - `editor.insertData.transformFragment`
    - `deserializeHtml.getNode`
    - `deserializeHtml.query`
    - `inject.props.query`
    - `inject.props.transformProps`
    - `useHooks`
    - `withOverrides`

  NEW `SlatePlugin` properties:

  - `api`: API methods provided by this plugin
  - `dependencies`: An array of plugin keys that this plugin depends on
  - `node`: Node-specific configuration for this plugin
  - `parsers`: Now accept `string` keys to add custom parsers
  - `priority`: Plugin priority for registration and execution order
  - `shortcuts`: Plugin-specific hotkeys
  - `inject.targetPluginToInject`: Function to inject plugin config into other plugins specified by `inject.targetPlugins`

  Before:

  ```typescript
  export const createAlignPlugin = createPluginFactory({
    key: KEY_ALIGN,
    inject: {
      props: {
        defaultNodeValue: 'start',
        nodeKey: KEY_ALIGN,
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
        validTypes: ['p'],
      },
    },
    then: (_, plugin) =>
      mapInjectPropsToPlugin(editor, plugin, {
        deserializeHtml: {
          getNode: (el, node) => {
            if (el.style.textAlign) {
              node[plugin.key] = el.style.textAlign;
            }
          },
        },
      }),
  });
  ```

  After:

  ```typescript
  export const AlignPlugin = createSlatePlugin({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        nodeKey: 'align',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
      targetPluginToInject: ({ editor, plugin }) => ({
        parsers: {
          html: {
            deserializer: {
              parse: ({ element, node }) => {
                if (element.style.textAlign) {
                  node[editor.getType(plugin)] = element.style.textAlign;
                }
              },
            },
          },
        },
      }),
      targetPlugins: [ParagraphPlugin.key],
    },
    key: 'align',
  });
  ```

  **Plugin Shortcuts**:

  - NEW `shortcuts` to add custom hotkeys to a plugin.
  - Remove `hotkey` option from all plugins

  Before:

  ```typescript
  type LinkPlugin = {
    hotkey?: string;
  };
  ```

  After:

  ```typescript
  type LinkConfig = PluginConfig<
    // key
    'p',
    // options
    { defaultLinkAttributes?: any },
    // api
    { link: { getAttributes: (editor: PlateEditor) => LinkAttributes } },
    // transforms
    { floatingLink: { hide: () => void } }
  >;
  ```

  Shortcuts API:

  - `handler` is called with the editor, event, and event details.
  - `keys` is an array of keys to trigger the shortcut.
  - `priority` is the priority of the shortcut over other shortcuts.
  - `...HotkeysOptions` from `@udecode/react-hotkeys`

  **Plugin Types**:

  - Update `SlatePlugin`, `PlatePlugin` generics. `P, V, E` -> `C extends AnyPluginConfig = PluginConfig`
  - Remove `PluginOptions`
  - Remove `PlatePluginKey`
  - Remove `HotkeyPlugin`, `ToggleMarkPlugin` in favor of `plugin.shortcuts`
  - `WithPlatePlugin` -> `EditorPlugin`, `EditorPlatePlugin`
  - `PlatePluginComponent` -> `NodeComponent`
  - `InjectComponent*` -> `NodeWrapperComponent*`
  - `PlatePluginInsertData` -> `Parser`
  - `PlatePluginProps` -> `NodeProps`
  - `RenderAfterEditable` -> `EditableSiblingComponent`
  - `WithOverride` -> `ExtendEditor`
  - `SerializeHtml` -> `HtmlReactSerializer`

  **Plugin Store**:

  - NEW each plugin has its own store, accessible via `plugin.optionsStore` and `plugin.useOptionsStore`
  - `editor` has many methods to get, set and subscribe to plugin options

  **Plugin Methods**:

  - All plugin methods return a new plugin instance with the extended types.
  - Remove `then`, use `extend` instead
  - NEW `extend` method to deep merge a plugin configuration
    - If you pass an object, it will be directly merged with the plugin config.
    - If you pass a function, it will be called with the plugin config once the editor is resolved and should return the new plugin config.
    - Object extensions always have the priority over function extensions.
    - Extend multiple times to derive from the result of the previous extension.
  - NEW `configure` method to configure the properties of existing plugins. The difference with `extend` is that `configure` with not add new properties to the plugin, it will only modify existing ones.
  - NEW `extendPlugin` method to extend a nested plugin configuration.
  - NEW `configurePlugin` method to configure the properties of a nested plugin.
  - NEW `extendApi` method to extend the plugin API. The API is then merged into `editor.api[plugin.key]`.
  - NEW `extendTransforms` method to extend the plugin transforms. The transforms is then merged into `editor.transforms[plugin.key]`.
  - NEW `extendEditorApi` method to extend the editor API. The API is then merged into `editor.api`. Use this to add or override top-level methods to the editor.
  - NEW `extendEditorTransforms` method to extend the editor transforms. The transforms is then merged into `editor.transforms`.
  - NEW `extendOptions` method to extend the plugin options with selectors. Use `editor.useOption(plugin, 'optionKey')` to subscribe to an (extended) option.
  - NEW `withComponent` to replace `plugin.node.component`

  **Plugin Context**

  Each plugin method now receive the plugin context created with `getEditorPlugin(editor, plugin)` as parameter:

  - `api`
  - `editor`
  - `getOption`
  - `getOptions`
  - `plugin`
  - `setOption`
  - `setOptions`
  - `tf`
  - `type`
  - `useOption`

  **Core Plugins**:

  - NEW `ParagraphPlugin` is now part of `core`
  - NEW `DebugPlugin` is now part of `core`
    - NEW `api.debug.log`, `api.debug.info`, `api.debug.warn`, `api.debug.error` methods
    - `options.isProduction` to control logging in production environments
    - `options.logLevel` to set the minimum log level
    - `options.logger` to customize logging behavior
    - `options.throwErrors` to control error throwing behavior, by default a `PlateError` will be thrown on `api.debug.error`
  - NEW - You can now override a core plugin by adding it to `editor.plugins`. Last plugin wins.
  - `createDeserializeHtmlPlugin` -> `HtmlPlugin`
    - NEW `api.html.deserialize`
  - `createEventEditorPlugin` -> `EventEditorPlugin`
    - `eventEditorStore` -> `EventEditorStore`
  - `createDeserializeAstPlugin` -> `AstPlugin`
  - `createEditorProtocolPlugin` -> `SlateNextPlugin`
    - NEW `editor.tf.toggle.block`
    - NEW `editor.tf.toggle.mark`
    - Remove `createNodeFactoryPlugin`, included in `SlateNextPlugin`.
    - Remove `createPrevSelectionPlugin`, included in `SlateNextPlugin`.
  - `createHistoryPlugin` -> `HistoryPlugin`
  - `createInlineVoidPlugin` -> `InlineVoidPlugin`
  - `createInsertDataPlugin` -> `ParserPlugin`
  - `createLengthPlugin` -> `LengthPlugin`
  - `createReactPlugin` -> `ReactPlugin`

  **Editor Creation**:

  NEW `withSlate`:

  - Extends an editor into a vanilla Plate editor
  - NEW `rootPlugin` option for configuring the root plugin

  NEW `withPlate`:

  - Extends an editor into a React Plate editor
  - Now extends `withSlate` with React-specific enhancements
  - NEW `useOptions` and `useOption` methods to the editor

  NEW `createSlateEditor`:

  - Create a vanilla Plate editor with server-side support

  `createPlateEditor`:

  - Plugin replacement mechanism: using `plugins`, any plugin with the same key that a previous plugin will **replace** it. That means you can now override core plugins that way, like `ReactPlugin`
  - `root` plugin is now created from `createPlateEditor` option as a quicker way to configure the editor than passing `plugins`. Since plugins can have nested plugins (think as a recursive tree), `plugins` option will be passed to `root` plugin `plugins` option.
  - Centralized editor resolution. Before, both `createPlateEditor` and `Plate` component were resolving the editor. Now, only `createPlateEditor` takes care of that. That means `id`, `value`, and other options are now controlled by `createPlateEditor`.
  - Remove `createPlugins`, pass plugins directly:

    - `components` -> `override.components`
    - `overrideByKey` -> `override.plugins`

  `createPlateEditor` options:

  - Rename `normalizeInitialValue` option to `shouldNormalizeEditor`
  - Move `components` to `override.components` to override components by key
  - Move `overrideByKey` to `override.plugins` to override plugins by key
  - Remove `disableCorePlugins`, use `override.enabled` instead
  - NEW `value` to set the initial value of the editor.
  - NEW `autoSelect?: 'end' | 'start' | boolean` to auto select the start of end of the editor. This is decoupled from `autoFocus`.
  - NEW `selection` to control the initial selection.
  - NEW `override.enabled` to disable plugins by key
  - NEW `rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin` to configure the root plugin. From here, you can for example call `configurePlugin` to configure any plugin.
  - NEW `api`, `decorate`, `extendEditor`, `handlers`, `inject`, `normalizeInitialValue`, `options`, `override`, `priority`, `render`, `shortcuts`, `transforms`, `useHooks`. These options will be passed to the very first `rootPlugin`.

  NEW `usePlateEditor()` hook to create a `PlateEditor` in a React component:

  - Uses `createPlateEditor` and `useMemo` to avoid re-creating the editor on every render.
  - Dependencies can be added to the hook to re-create the editor on demand. `id` option is always used as dependency.

  **Editor Methods**:

  `editor: PlateEditor`:

  - Move `redecorate` to `editor.api.redecorate`
  - Move `reset` to `editor.tf.reset`
  - Move `plate.set` to `editor.setPlateState`
  - Move `blockFactory` to `editor.api.create.block`
  - Move `childrenFactory` to `editor.api.create.value`
  - Rename `plugins` to `pluginList`
  - Rename `pluginsByKey` to `plugins`
  - NEW `getApi()` to get the editor API
  - NEW `getTransforms()` to get the editor transforms
  - Remove `getPlugin(editor, key)`, use `editor.getPlugin(plugin) or editor.getPlugin({ key })`
  - Remove `getPluginType`, use `editor.getType(plugin)` to get node type
  - Remove `getPluginInjectProps(editor, key)`, use `editor.getPlugin(plugin).inject.props`
  - NEW `getOptionsStore()` to get a plugin options store
  - Remove `getPluginOptions`, use `getOptions()`
  - NEW `getOption()` to get a plugin option
  - NEW `setOption()` to set a plugin option
  - NEW `setOptions()` to set multiple plugin options. Pass a function to use Immer. Pass an object to merge the options.
  - NEW `useOption` to subscribe to a plugin option in a React component
  - NEW `useOptions` to subscribe to a plugin options store in a React component
  - Remove `getPlugins`, use `editor.pluginList`
  - Remove `getPluginsByKey`, use `editor.plugins`
  - Remove `mapInjectPropsToPlugin`

  **Editor Types**:

  The new generic types are:

  - `V extends Value = Value`, `P extends AnyPluginConfig = PlateCorePlugin`
  - That means this function will **infer all plugin configurations** from the options passed to it:
    - `key`
    - `options`
    - `api`
    - `transforms`
  - Can't infer for some reason? Use `createTPlateEditor` for explicit typing.

  ```ts
  const editor = createPlateEditor({ plugins: [TablePlugin] });
  editor.api.htmlReact.serialize(); // core plugin is automatically inferred
  editor.tf.insert.tableRow(); // table plugin is automatically inferred
  ```

  **Plate Component**

  `PlateProps`:

  - `editor` is now required. If `null`, `Plate` will not render anything. As before, `Plate` remounts on `id` change.
  - Remove `id`, `plugins`, `maxLength`, pass these to `createPlateEditor` instead
  - Remove `initialValue`, `value`, pass `value` to `createPlateEditor` instead
  - Remove `editorRef`
  - Remove `disableCorePlugins`, override `plugins` in `createPlateEditor` instead

  Utils:

  - Remove `useReplaceEditor` since `editor` is now always controlled
  - NEW `useEditorPlugin` to get the editor and the plugin context.

  Types:

  - `PlateRenderElementProps`, `PlateRenderLeafProps` generics: `V, N` -> `N, C`

  **Plate Store**:

  - Remove `plugins` and `rawPlugins`, use `useEditorRef().plugins` instead, or listen to plugin changes with `editor.useOption(plugin, <optionKey>)`
  - Remove `value`, use `useEditorValue()` instead
  - Remove `editorRef`, use `useEditorRef()` instead

  **Miscellaneous Changes**

  - `slate >=0.103.0` peer dependency
  - `slate-react >=0.108.0` peer dependency
  - New dependency `@udecode/react-hotkeys`
  - Remove `ELEMENT_`, `MARK_` and `KEY_` constants. Use `NamePlugin.key` instead.
  - Replace `ELEMENT_DEFAULT` with `ParagraphPlugin.key`.
  - Remove `getTEditor`
  - Rename `withTReact` to `withPlateReact`
  - Rename `withTHistory` to `withPlateHistory`
  - Rename `usePlateId` to `useEditorId`
  - Remove `usePlateSelectors().id()`, `usePlateSelectors().value()`, `usePlateSelectors().plugins()`, use instead `useEditorRef().<key>`
  - Rename `toggleNodeType` to `toggleBlock`
  - `toggleBlock` options:
    - Rename `activeType` to `type`
    - Rename `inactiveType` to `defaultType`
  - Remove `react-hotkeys-hook` re-exports. Use `@udecode/react-hotkeys` instead.

  Types:

  - Move `TEditableProps`, `TRenderElementProps` to `@udecode/slate-react`
  - Remove `<V extends Value>` generic in all functions where not used
  - Remove `PlatePluginKey`
  - Remove `OverrideByKey`
  - Remove `PlateId`

## @udecode/plate-csv@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDeserializeCsvPlugin` -> `CsvPlugin`

## @udecode/plate-cursor@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createCursorPlugin` -> `CursorPlugin`

## @udecode/plate-date@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDatePlugin` -> `DatePlugin`

## @udecode/plate-diff@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDiffPlugin` -> `DiffPlugin`

## @udecode/plate-dnd@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDndPlugin` -> `DndPlugin`
  - Remove `editor.isDragging`, use `editor.getOptions(DndPlugin).isDragging` instead
  - Move `dndStore` to `DndPlugin`

## @udecode/plate-docx@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDeserializeDocxPlugin` -> `DocxPlugin`

## @udecode/plate-emoji@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createEmojiPlugin` -> `EmojiPlugin`
  - NEW `EmojiInputPlugin`

## @udecode/plate-excalidraw@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createExcalidrawPlugin` -> `ExcalidrawPlugin`
  - `insertExcalidraw` remove `key` option

## @udecode/plate-find-replace@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createFindReplacePlugin` -> `FindReplacePlugin`

## @udecode/plate-floating@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Remove unused generics

## @udecode/plate-font@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createFontBackgroundColorPlugin` -> `FontBackgroundColorPlugin`
  - `createFontColorPlugin` -> `FontColorPlugin`
  - `createFontSizePlugin` -> `FontSizePlugin`
  - `createFontFamilyPlugin` -> `FontFamilyPlugin`
  - `createFontWeightPlugin` -> `FontWeightPlugin`

## @udecode/plate-heading@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createHeadingPlugin` -> `HeadingPlugin`
  - Replace `ELEMENT_H1` with `HEADING_KEYS.H1`
  - Replace `KEYS_HEADING` with `HEADING_LEVELS`

## @udecode/plate-highlight@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createHighlightPlugin` -> `HighlightPlugin`

## @udecode/plate-horizontal-rule@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createHorizontalRulePlugin` -> `HorizontalRulePlugin`

## @udecode/plate-html@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDeserializeHtmlPlugin` -> `HtmlPlugin`
  - Rename `deserializeHtml` plugin to `html`
  - Rename `deserializeHtml.getNode` to `parse`

## @udecode/plate-indent@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createIndentPlugin` -> `IndentPlugin`

## @udecode/plate-indent-list@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createIndentListPlugin` -> `IndentListPlugin`
  - Rename `injectIndentListComponent` to `renderIndentListBelowNodes`
  - Replace `normalizeIndentList` with `withNormalizeIndentList`
  - Replace `deleteBackwardIndentList` with `withDeleteBackwardIndentList`
  - Replace `insertBreakIndentList` with `withInsertBreakIndentList`
  - Remove types: `LiFC` (use `PlateRenderElementProps`), `MarkerFC` (use `Omit<PlateRenderElementProps, 'children'>`)

## @udecode/plate-juice@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createJuicePlugin` -> `JuicePlugin`

## @udecode/plate-kbd@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createKbdPlugin` -> `KbdPlugin`

## @udecode/plate-layout@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createColumnPlugin` -> `ColumnPlugin`
  - NEW `ColumnItemPlugin`

## @udecode/plate-line-height@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createLineHeightPlugin` -> `LineHeightPlugin`

## @udecode/plate-link@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createLinkPlugin` -> `LinkPlugin`
  - Move `floatingLinkStore` to `LinkPlugin`

## @udecode/plate-list@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createListPlugin` -> `ListPlugin`
  - NEW `BulletedListPlugin`
  - NEW `NumberedListPlugin`
  - NEW `ListItemPlugin`
  - NEW `ListItemContentPlugin`
  - NEW list transforms: `toggle.list`, `toggle.bulletedList`, `toggle.numberedList`
  - Remove type utils: `getListItemType`, `getUnorderedListType`, `getOrderedListType`, `getListItemContentType`
  - Replace `insertBreakList(editor)` with `withInsertBreakList(ctx)`
  - Replace `insertFragmentList(editor)` with `withInsertFragmentList(ctx)`
  - Replace `insertBreakTodoList(editor)` with `withInsertBreakTodoList(ctx)`
  - Replace `deleteForwardList(editor)` with `withdeleteForwardList(ctx)`
  - Replace `deleteBackwardList(editor)` with `withdeleteBackwardList(ctx)`
  - Move list options from `ul` and `ol` to `list` plugin
  - `toggleList` options are now `{ type: string }`

## @udecode/plate-markdown@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createDeserializeMdPlugin` -> `MarkdownPlugin`

## @udecode/plate-math@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createMathPlugin` -> `MathPlugin`

## @udecode/plate-media@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createMediaPlugin` -> `MediaPlugin`
  - `FloatingMediaUrlInput`, `submitFloatingMedia` rename option `pluginKey` -> `plugin`
  - `insertMediaEmbed` remove `key` option

## @udecode/plate-mention@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createMentionPlugin` -> `MentionPlugin`
  - NEW `MentionInputPlugin`
  - Remove `createMentionNode` option, override `api.insert.mention` instead

## @udecode/plate-node-id@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createNodeIdPlugin` -> `NodeIdPlugin`

## @udecode/plate-normalizers@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createNormalizersPlugin` -> `NormalizersPlugin`

## @udecode/plate@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - NEW `@udecode/plate-layout`
  - NEW `/react` exports `@udecode/react-hotkeys`
  - Split build into `@udecode/plate` and `@udecode/plate/react`.
  - Remove `@udecode/plate-paragraph`
  - All stores now start with a capital letter

## @udecode/plate-utils@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Remove `onKeyDownToggleElement`, use shortcuts instead.
  - Remove `onKeyDownToggleMark`, use shortcuts instead.

## @udecode/plate-playwright@37.0.0

### Major Changes

- [#3473](https://github.com/udecode/plate/pull/3473) by [@12joan](https://github.com/12joan) – New package for integrating Plate with Playwright tests

## @udecode/plate-reset-node@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createResetNodePlugin` -> `ResetNodePlugin`

## @udecode/plate-resizable@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Peer dependencies updated

## @udecode/plate-select@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSelectOnBackspacePlugin` -> `SelectOnBackspacePlugin`
  - `createDeletePlugin` -> `DeletePlugin`

## @udecode/plate-selection@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Rename `createSelectionPlugin` to `BlockSelectionPlugin`
  - Remove `isNodeBlockSelected`, `isBlockSelected`, `hasBlockSelected`, `useBlockSelected` functions
    - Use `editor.getOptions(BlockSelectionPlugin)` or `editor.useOptions(BlockSelectionPlugin)` instead
  - Remove `addSelectedRow` function
    - Use `editor.api.blockSelection.addSelectedRow` instead
  - Remove `withSelection` HOC
  - Rename `onCloseBlockSelection` to `onChangeBlockSelection`
  - Moved `blockSelectionStore` to `BlockSelectionPlugin`
  - Moved `blockContextMenuStore` to `BlockContextMenuPlugin`
  - Remove `BlockStartArea` and `BlockSelectionArea` components
    - Use `areaOptions` in `BlockSelectionPlugin` for configuration instead
  - Remove dependency on `@viselect/vanilla` package
    - Forked and integrated selection functionality locally
  - Add `BlockContextMenuPlugin`, which is now used by `BlockSelectionPlugin`
    - No need to add it manually
  - Fix scroll-related bugs in the selection functionality
  - Improve performance and reliability of block selection

## @udecode/plate-slash-command@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSlashPlugin` -> `SlashPlugin`
  - NEW `SlashInputPlugin`

## @udecode/slate@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – `createTEditor`:

  - Implement default methods for `slate-react` and `slate-history` in `createTEditor`
  - Add `noop` function to provide default implementations for unimplemented editor methods

  Types:

  - Merge `ReactEditor` and `HistoryEditor` interfaces into `TEditor`, removing `TReactEditor` and `THistoryEditor`
  - Remove `Value` generic type parameter from function signatures and type definitions
  - Replace `V extends Value` with `E extends TEditor` for improved type inference
  - Simplify `TEditor<V>` to `TEditor` in many places
  - Refactor element-related types, where `E extends TEditor` in all cases:
    - `EElement<V>` to `ElementOf<E>`
    - `EText<V>` to `TextOf<E>`
    - `ENode<V>` to `NodeOf<E>`
    - `EDescendant<V>` to `DescendantOf<E>`
    - `EAncestor<V>` to `AncestorOf<E>`
    - `EElementOrText<V>` to `ElementOrTextOf<E>`
  - Update `TNodeEntry` related types:
    - `ENodeEntry<V>` to `NodeEntryOf<E>`
    - `EElementEntry<V>` to `ElementEntryOf<E>`
    - `ETextEntry<V>` to `TextEntryOf<E>`
    - `EAncestorEntry<V>` to `AncestorEntryOf<E>`
    - `EDescendantEntry<V>` to `DescendantEntryOf<E>`
  - Remove unused types:
    - `EElementEntry<V>`
    - `ETextEntry<V>`
    - `EDescendantEntry<V>`

## @udecode/slate-react@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – Types:

  - Remove `TReactEditor` type, as it's now integrated into the main `TEditor` type in `@udecode/slate`. Use `TEditor` instead.
  - Replace `V extends Value` with `E extends TEditor` for improved type inference
  - NEW `TEditableProps`, `TRenderElementProps`

## @udecode/slate-utils@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – Types:

  - Replace `V extends Value` with `E extends TEditor` for improved type inference

## @udecode/plate-suggestion@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSuggestionPlugin` -> `SuggestionPlugin`
  - Move `suggestionStore` to `SuggestionPlugin`
  - Remove `SuggestionProvider` and its hooks
  - Remove `useSuggestionStates` (replaced by direct option access)
  - Remove `useSuggestionSelectors` (replaced by option selectors)
  - Remove `useSuggestionActions` (replaced by api methods)
  - Replace `useUpdateSuggestion` with `api.suggestion.updateSuggestion`
  - Replace `useAddSuggestion` with `api.suggestion.addSuggestion`
  - Replace `useRemoveSuggestion` with `api.suggestion.removeSuggestion`
  - Replace `useSuggestionById` with `options.suggestionById`
  - Replace `useSuggestionUserById` with `options.suggestionUserById`
  - Replace `useCurrentSuggestionUser` with `options.currentSuggestionUser`
  - Remove `editor.activeSuggestionId`, use plugin option
  - Remove `useSetIsSuggesting`, use `editor.setOption`
  - Remove `useSetActiveSuggestionId`, use `editor.setOption`
  - Remove `editor.isSuggesting`, use plugin option
  - Remove `SuggestionEditorProps` type

## @udecode/plate-tabbable@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createTabbablePlugin` -> `TabbablePlugin`
  - `TabbablePlugin` option `isTabbable`: remove first `editor` parameter

## @udecode/plate-table@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createTablePlugin` -> `TablePlugin`
  - NEW `TableRowPlugin`, `TableCellPlugin`, `TableCellHeaderPlugin`
  - Replace `insertTableColumn` with `editor.insert.tableColumn`
  - Replace `insertTableRow` with `editor.insert.tableRow`
  - Move `cellFactory` option to `create.cell` api
  - Move `getCellChildren` option to `table.getCellChildren` api

## @udecode/plate-toggle@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createTogglePlugin` -> `TogglePlugin`
  - Move `toggleControllerStore` to `TogglePlugin`
  - Remove `setOpenIds` option
  - Replace `isToggleOpen` with option `isOpen`
  - Rename `injectToggle` to `renderToggleAboveNodes`

## @udecode/plate-trailing-block@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createTrailingBlockPlugin` -> `TrailingBlockPlugin`

## @udecode/plate-yjs@37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createYjsPlugin` -> `YjsPlugin`
  - Move `yjsStore` to `YjsPlugin`
  - Move `editor.yjs.provider` to `options.provider`
  - Rename `RenderAboveEditableYjs` to `YjsAboveEditable`
