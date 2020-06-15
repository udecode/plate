# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.60.0 (2020-06-15)

**Note:** Version bump only for package slate-plugins





Until 1.0.0 is released, breaking changes will be added as minor or
patch version bumps.

## 0.59.2 (2020-06-12)

**Note:** Version bump only for package slate-plugins





## 0.59.1 (2020-06-06)

**Note:** Version bump only for package slate-plugins





# 0.59.0 (2020-06-05)

**Note:** Version bump only for package slate-plugins


## v0.59.0 — June 3, 2020

### Breaking Changes

- renamed `withDeserializeHtml` to `withDeserializeHTML`.
- changed signature of `withDeserializeHTML` to `({ plugins })`
- renamed most of utils in `deserialize-html`, including
  `htmlDeserialize` to `deserializeHTMLToDocumentFragment`
- renamed `htmlSerialize` to `serializeHTMLFromNodes`.
- removed `ToolbarCodeBlock` in favor of `ToolbarElement` instead.
- `withBreakEmptyReset` and `withDeleteStartReset` – renamed option
  `typeP` to `defaultType`.
- `withToggleType` – renamed option `typeP` to `defaultType`
- `withTable` – removed `insertBreak` handler that prevented to insert
  break inside table cells, you should now use `SoftBreakPlugin` to
  allow inserting soft breaks instead.

### Features

- new types, including `SlateDocument` to enforce a valid structure to
  be used in `<Slate>`
- added `inlineTypes` and `voidTypes` properties to the `SlatePlugin`
  interface. `EditablePlugins` will set `isInline` and `isVoid` to each
  provided type.
- `withVoid` and `withInline` have been replaced by `withInlineVoid`.
- `withResetBlockType` – combines `withBreakEmptyReset` and
  `withDeleteStartReset`.
- `SoftBreakPlugin` – configurable rules.
- `ExitBreakPlugin`.

### Bug Fixes

- `deserializeHTMLToDocumentFragment` could return a fragment with empty `children`,
  crashing the editor. It has been fixed so all elements have at least
  one children (empty text) by using `SlateDocument` type.
- `withDeserializeHTML` was buggy when the first inserted node is an
  inline element (e.g. mention element).

## v0.58.14 — May 31, 2020

### Features

- `htmlSerialize` – function for serializing content from Slate format
  to HTML format.

### Bug Fixes

- `htmlSerialize` – improved the plugin identification and also added a
  branch for missing types in top levels.
- `withNodeID` – `insertNode` operation was not creating new ids.

## v0.58.13 — May 30, 2020

### Features

- `htmlSerialize` – function for serializing content from Slate format
  to HTML format.

## v0.58.11 — May 30, 2020

### Bug Fixes

- correctly export the React component types.

## v0.58.9 — May 30, 2020

### Bug Fixes

- export `withNodeID`.

## v0.58.8 — May 28, 2020

### Breaking Changes

- renamed `withBlock` to `withToggleType` as it just toggles the type of
  an element (inline or not).
- renamed `withImage` to `withImageUpload`.
- renamed `VideoPlugin` and its atoms to `MediaEmbedPlugin`.
- renamed `VIDEO` type to `MEDIA_EMBED` and changed its value from
  `video` to `media_embed`.
- renamed `withShortcuts` to `withAutoformat`.
- renamed `HoveringToolbar` to `BalloonToolbar`.
- renamed `MarkdownPreviewPlugin` to `PreviewPlugin` as it will be
  configurable to support other languages.
- removed `height` props in `Toolbar`, use `styles` instead.
- renamed `ToolbarBlock` to `ToolbarElement`.
- renamed `ToolbarTableProps.action` to `ToolbarTableProps.transform`.

### Features

- New plugin `BasicElementPlugins`
- New props `styles` in `Toolbar`
- New props `styles` in `HeadingToolbar`
- New props in `ToolbarButton`:
  - `styles`
  - `tooltip`
- New props in `BalloonToolbar`:
  - `styles`
  - `direction`
  - `hiddenDelay`
  - `theme`
  - `arrow`
- `Toolbar`, `HeadingToolbar` and `BalloonToolbar` restyled.
- New queries:
  - `getSelectionText`
  - `getText`
  - `isCollapsed`
  - `isExpanded`
  - `isSelectionExpanded`

## v0.58.7 — May 22, 2020

### Breaking Changes

- `useMention`:
  - removed `MentionSelectComponent` from return
- `onChangeMention`:
  - signature changed from `({ editor }: { editor: Editor })` to
    `(editor: Editor)`
- `MentionSelect`:
  - props renaming:
    - from `mentionables` to `options`
    - from `index` to `valueIndex`
    - from `target` to `at`
- `MentionNode` interface: replaced `mentionable` by `value`. You can
  add more fields to the element interface instead of adding them to
  `mentionable`
- `onKeyDownMark`:
  - signature changed from `({ clear, type, hotkey, }:
    MarkOnKeyDownOptions)` to `(type: string, hotkey: string, { clear }:
    MarkOnKeyDownOptions = {})`
- removed `withForcedLayout` in favor of `withTypeRules` (more generic)
- changed `CODE` type value from `code` to `code_block`
- renamed `CodePlugin` to `CodeBlockPlugin` and `InlineCodePlugin` to
  `CodePlugin`

### Features

- `getLastNode(editor: Editor, level: number)`: new query to get the
  last node at a specific level/depth
- `withTypeRules`: new normalizer plugin to force any node to have a
  specific type
- `utils`:
  - `getPreviousIndex`
  - `getNextIndex`
- `queries`:
  - `isPointAtWordEnd`
  - `isWordAfterTrigger`
  - `getNode`: same than `Node.get` but returns null if not the node is
    not found at the given path.
- `useMention`:
  - `options` is now optional
- `MentionPlugin`, `renderElementMention`:
  - added `prefix` option
  - added `onClick` option
- `MentionSelect`:
  - added props:
    - `styles`, see
      [Component Styling](https://github.com/microsoft/fluentui/wiki/Component-Styling)
- `getRenderElement`
  - added a 3rd argument: `options` that will be passed to the component
    as props. You should use that for static props (same value for all
    instances). And you should mutate the element when it's dynamic.
- `MentionElement`:
  - attribute `data-slate-character` renamed to `data-slate-value`

## v0.58.5 — May 19, 2020

### Breaking Changes

- `mention`:
  - signature of `onChangeMention` changed
  - signature of `useMention` changed

```ts
// from
useMention({
  characters: CHARACTERS,
}
    
// to   
useMention(CHARACTERS, {
  maxSuggestions: 10,
  trigger: '@',
  prefix: ''
});
```


### Features

- `mention`:
  - changed mention representation from string to object (more useful
    later for storing other information then just the string, like ids)
  - added an options parameter to useMention, adding trigger and prefix
    to maxSuggestions
  - improved typing where seemed appropriate

### Bug Fixes

- `deserializer-html`:
  - export `withDeserializeHtml`


## v0.58.4 — May 18, 2020

### Bug Fixes

- previous build was broken because of tests not being excluded

## v0.58.3 — May 18, 2020

### Breaking Changes

- refactored:
  - `toggleCode` to `toggleWrapNodes` (generic).
- removed:
  - `clearMark` in favor of `Editor.removeMark`.

### Features

- `pipe`: new helper to avoid the wrapper hell when using `withPlugins`.
  You can now have an array of plugins `withPlugins`.
- `EditablePlugins`: new props for adding your dependencies to the
  corresponding `useCallback`.
  - `decorateDeps`
  - `renderElementDeps`
  - `renderLeafDeps`
  - `onDOMBeforeInputDeps`
  - `onKeyDownDeps`
- `toggleMark`: new optional parameter `clear`: marks to clear when
  adding mark.
- helpers:
  - `createDefaultHandler`
- there was a big performance gap between the official slate `Editable`
  component and our `EditablePlugins` component. This has been resolved
  by using `useCallback`.

### Bug Fixes

- `deserializeLink`: should work with slate fragments.
- `withForcedLayout` was normalizing on each change.

## v0.58.2 — May 17, 2020

### Breaking Changes

- `withNodeID`: renamed `idGenerator` to `idCreator`

### Features

- `withNodeID`: new options:
  - `filterText`
  - `filter`
  - `allow`
  - `exclude`
- `setPropsToNodes`: helper to set props to nodes and its children
  (recursively), with many options to filter the nodes that will receive
  the props (e.g. only Element, only Text, only nodes of type Paragraph,
  etc.).

### Bug Fixes

- `withNodeID` should now work with history undos/redos

## v0.58.1 — May 16, 2020

### Breaking Changes

- renamed:
  - `withPasteHtml` to `withDeserializeHtml`
  - `withPasteMd` to `withDeserializeMd`
  - `onKeyDownMark.mark` to `onKeyDownMark.type`
- refactored:
  - `onKeyDownMention` and `onChangeMention` are now returned by
    `useMention`
  - `isBlockActive` and `isLinkActive` have been removed in favor of
    `isNodeInSelection`

### Features

- new options for mark plugins: type (`typeBold`, `typeItalic`, etc.) .
- `withDeserializeHtml`:
  - the deserializer is now using `data-slate-type` attribute of each
    HTML element. So copy/pasting slate fragments should now work.
  - when pasting a value, the type of the first node will replace the
    type of the selected node (using `Transforms.setNodes`).
- `withTransforms`:
  - extends `editor` with transforms (only one for now).
- `withNodeID`:
  - Set an id to the new `Element` and/or `Text` nodes.
- `deserializeMention`
- `deserializeActionItem`
- `deserializeIframe`
- `deserializeHighlight`
- `getSelectionNodesArrayByType`
- `getSelectionNodesByType`
- `isAncestor`
- `unwrapNodesByType`
- unit testing
- a lot of refactoring
- `HeadingPlugin`:
  - styling change (from h1 to h6)
- `EditablePlugins`:
  - `style` props is now overridable

### Bug Fixes

- `withDeserializeHtml`: fix `Cannot read property 'children' of null`
- `withForcedLayout`: the previous behavior was forcing to have
  paragraph nodes after the title. New behavior: first node should be a
  title (otherwise insert/edit) and second node should exist (otherwise
  insert a paragraph by default). We will see how to generalize this
  plugin in a future release.
- `Toolbar`: change `height` to `min-height` for dynamic height.

## v0.58.0 — April 29, 2020

### Breaking Changes

- refactor `getElement` to `getElementComponent`
- refactor elements types to reflect the html tags. Also avoiding `-` as
  it's not valid in GraphQL enums.
  - `action-item` -> `action_item`
  - `block-quote` -> `blockquote`
  - `heading-one` -> `h1` (until `h6`)
  - `link` -> `a`
  - `numbered-list` -> `ol`
  - `bulleted-list` -> `ul`
  - `list-item` -> `li`
  - `paragraph` -> `p`
  - `table-row` -> `tr`
  - `table-cell` -> `td` If you already saved elements in your database,
    you will need to migrate or override the types with the previous
    ones:

```js
// you can add nodeTypes to any element plugin
export const nodeTypes = {
  typeP: PARAGRAPH,
  typeMention: MENTION,
  typeBlockquote: BLOCKQUOTE,
  typeCode: CODE_BLOCK,
  typeLink: LINK,
  typeImg: IMAGE,
  typeVideo: MEDIA_EMBED,
  typeActionItem: ACTION_ITEM,
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeH1: HeadingType.H1,
  typeH2: HeadingType.H2,
  typeH3: HeadingType.H3,
  typeH4: HeadingType.H4,
  typeH5: HeadingType.H5,
  typeH6: HeadingType.H6,
  typeEditableVoid: EDITABLE_VOID,
};
```

### Features

- Ordered lists supported in `withShortcuts` (Markdown Shortcuts) by
  typing `1.`.
- Option type to all elements. Not yet for the marks.
- `getRenderElements`

## v0.57.15 — April 29, 2020

### Features

- queries:
  - `isRangeAtRoot(point: Point)` to check if anchor or focus of a range
    is at the root.

### Bug Fixes

- use `isRangeAtRoot(point: Point)` before each `Editor.parent` call.


## v0.57.14 — April 26, 2020

### Features

- queries:
  - `isPointAtRoot(point: Point)` to check if a point is at the root.
- plugins:
  - `withVoid` to set a list of element types to void.
  - `withInline` to set a list of element types to inline.

### Bug Fixes

- `plugin-list`: fixed a bug where toggling the list throws an error
  when a paragraph has few leafs

## v0.57.13 — April 25, 2020

### Features

- `plugin-marks`: New plugins for HTML `<sub>` and `<sup>` tags:
  superscript and subscript plugins. Included in the "Marks" story.

## v0.57.12 — April 14, 2020

### Bug Fixes

- Deserializer: pasting html or markdown with Elements inside Text tags
  works correctly now.

## v0.57.11 — March 3, 2020

### Features

- `paste-md`:
  - markdown can be pasted into the editor

## v0.57.10 — February 25, 2020

### Bug Fixes

- `plugin-list`:
  - make sure list item is removed when unwrapping.
  - if multiple paragraphs are selected when pressing toggle - they
    should end up as separate list items.

## v0.57.9 — February 25, 2020

### Bug Fixes

- The default toggleBlock function creates several code blocks if there
  are multiple paragraphs selected. This fix creates a toggleCode
  function that just wraps the whole selection in a code block - or
  unwraps if it is already in a block.

## v0.57.8 — February 5, 2020

### Features

- `plugin-table`:
  - Insert table
  - Delete table
  - Add/delete row
  - Add/delete cell

## v0.57.7 — February 2, 2020

### Breaking Changes

- `plugin-list`:
  - Each list item now has a paragraph child.

### Features

- `plugin-list`:
  - Supports nested lists:
    - Press `Tab` on a list item (except the first one) to indent the
      current list.
    - Press `Shift+Tab`, `Enter` or `Backspace` to unindent the current
      list.

## v0.57.6 — January 8, 2020

### Bug Fixes

- styles:
  - `line-height` of heading

## v0.57.5 — January 7, 2020

### Breaking Changes

- plugins:
  - `withList` has been removed and its logic is now inside `withBlock`
    with the new option `unwrapTypes`.
  - `withShortcuts`: removed `deleteBackward` logic as its covered by
    `withDeleteStartReset`.
- `p` tag was the default if no `type` was provided. The new default is
  `div`.

### Features

- plugins:
  - `withDeleteStartReset`: on delete at the start of an empty block in
    types, replace it with a new paragraph.
  - `withBreakEmptyReset`: on insert break at the start of an empty
    block in types, replace it with a new paragraph.
- queries:
  - `isList`
- styles
  - action item.
  - removed the element styling from `globalStyle` as it is not
    exported.
  - a lot of spacing changes.
