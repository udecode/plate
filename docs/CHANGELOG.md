# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit
guidelines.

## Latest

- [Release PRs]( https://github.com/udecode/plate/pulls?q=is%3Apr+is%3Aclosed+author%3Aapp%2Fgithub-actions)
- [All releases](https://github.com/udecode/slate-plugins/releases) 

## v0.70.0

### Breaking Changes

- `isSelectionInListItem`:
  - renamed to `getListItemEntry`
  - returns `{ list, listItem }`
- `isList`:
  - renamed to `isNodeTypeList`
  - renamed options from `(options?: ListOptions) => (n: Node)` to `(n:
    Node, options?: ListOptions)`
- options refactored (old/new not listed here):
  - `isSelectionInListItem`
  - `moveChildren`
  - `moveListItemDown`
  - `moveListItemUp`
- `getSelectableElement`: you should now provide a drag icon in
  `dragIcon` option. Example:

```
import { DragIndicator } from '@styled-icons/material/DragIndicator';

<DragIndicator
  style={{
    width: 18,
    height: 18,
    color: 'rgba(55, 53, 47, 0.3)',
  }}
/>
```

### Features

- `withList`: handles some cases of `deleteBackward` to avoid deleting
  sublist items when deleting a list item.
- new functions:
  - `getLastChild`: Get the last child of a node
  - `getNodeById`: Get the first editor node entry found by id
  - `getPreviousPath`
  - `getListItemSublist`: Get the list inside listItem if existing
  - `hasListInListItem`: Is there a list in `listItemNode`
  - `isListNested`: Is the list nested, i.e. its parent is a list item
  - `moveListItemSublistItemsToList`: Move the list items of the sublist
    of `fromListItem` to `toList`
  - `moveListItemSublistItemsToListItemSublist`: Move fromListItem
    sublist list items to the end of `toListItem` sublist
  - `moveListSiblingsAfterCursor`
  - `removeFirstListItem`
  - `removeRootListItem`: Remove list item and move its sublist to list if any

### Bug Fixes

- `styled-components` is not a peer dependency anymore

## v0.68.0

### Breaking Changes

- remove `withToggleType`, use `toggleNodeType` instead.
- remove `withTransforms`, use `Transforms.insertNodes` instead.
- renamed `onKeyDownMark` to `getOnHotkeyToggleMark`.
- renamed `onKeyDownMarkDefault` to `getOnHotkeyToggleMarkDefault`.

### Features

- `toggleNodeType`: Toggle the type of the selected node.
- hotkey to toggle node type (default type is paragraph):
  - blockquote: `mod+shift+.`
  - paragraph: `['mod+opt+0', 'mod+shift+0']`
  - todo list: `['mod+opt+4', 'mod+shift+4']`
  - code block: `['mod+opt+8', 'mod+shift+8']`
- `getOnHotkeyToggleNodeType`: Get `onKeyDown` handler to toggle node
  type if hotkey is pressed.
- `getOnHotkeyToggleNodeTypeDefault`: `getOnHotkeyToggleNodeType` with
  default options.
- added `serialize` as a plugin option. it accepts `element` and `leaf`
  properties.
- `serializeHTMLFromNodes` will use `plugin.serialize.element`
  in place of `plugin.renderElement` and `plugin.serialize.leaf` in place of
  `plugin.renderLeaf`


### Bug Fixes

- `todo-list`:
  - use `user-select: none` in the checkbox wrapper to fix selection
    bug.
  - checked can be `undefined`
- `table`: Set child type of a table cell to be `<p>` for the `TablePlugin`.
- `list`: Copy the marks from the current leaf node to the next

## v0.67.0

### Breaking Changes

- removed:
  - `isRangeAtRoot`
  - `isPointAtRoot`
- `deserializeHTMLElement`, `deserializeHTMLToDocument`,
  `deserializeHTMLToDocumentFragment`:
  - Refactor parameters from `(plugins: SlatePlugin[]) => (element:
    HTMLElement)` to `({ plugins: SlatePlugin[]; element: HTMLElement; }`
- `deserializeHTMLToElement`, `deserializeHTMLToFragment`,
  `deserializeHTMLToMarks`:
  - Refactor option `el` to `element`
- `serializeHTMLFromNodes`:
  - Refactor from `(plugins: SlatePlugin[]) => ( nodes: SlateNode[] )`
    to
```
{
  /**
   * Plugins with renderElement or renderLeaf.
   */
  plugins: SlatePlugin[];
  /**
   * Slate nodes to convert to HTML.
   */
  nodes: SlateNode[];
}
```

### Features

- `common/queries`:
  - `getParent` – Calls `Editor.parent` and returns undefined if there
    is no parent instead of throwing an error.
- `common/utils`
  - `createElementWithSlate` – Create a React element wrapped in a Slate provider
- `types`:
  - `SlateProps`
  - `EditorParentOptions`
- `serializeHTMLFromNodes`:
  - new option `stripDataAttributes` (default:
  `true`) – Enable stripping data attributes
  - new option `slateProps` (default: empty editor) – Slate props to
    provide if the rendering depends on slate hooks

### Bug Fixes

- `serializeHTMLFromNodes`: it should now work with plugins using slate
  hooks
- `isSelectionInListItem`: it's now using `getParent` to not throw an
  error when selecting the root.

## v0.66.0

### Breaking Changes

- `withList` is now needed for nested list (back again). Moved
  `onKeyDownList` handler for Enter and Backspace to `insertBreak` and
  `deleteBackward`.

### Features

- queries:
  - `isSelectionInListItem`
- transforms:
  - `moveListItemDown`
  - `moveListItemUp`
  - `insertListItem`

### Bug Fixes

- Could not use IME in nested lists, fixed using `withList`.

## v0.65.1

### Bug Fixes

- Add `editor` as deps in `Editable` `onKeyDown`, `decorate` and
  `onDOMBeforeInput`. Sometimes the editor reference can change, e.g.
  when resetting the editor.

## v0.65.0

### Breaking Changes

- `EditablePlugins`:
  - `onKeyDownPlugins`: Run `onKeyDownList` then `onKeyDown` of each
    plugin. Stop if one handler returns false. It's a way to "stop
    propagation". By doing so, you should carefully order your plugins.

### Features

- `isBlockTextEmptyAfterSelection`: Is there empty text after the
  selection. If there is no leaf after the selected leaf, return
  `Editor.isEnd`. Else, check if the next leaves are empty.
- `getNextSiblingNodes`: Get the next sibling nodes after a path.

### Bug Fixes

- When a link was inserted at the end of a list item, we could not add a
  new list item after it.
- Stopping the propagation in mention `onKeyDown` so pressing `Enter`
  in a list item will not insert a new list item when selecting a
  mention.

## v0.64.3
### Bug Fixes
- markdown deserializer is now fixed by using `remark-slate`

## v0.64.2

### Bug Fixes

- `onKeyDownList`: missing options fixed.

## v0.64.1

### Bug Fixes

- `onKeyDownList`: fixed a bug when inserting break at the start of a
  list item.

## v0.64.0

### Breaking Changes

- removed:
  - `withResetBlockType`, `withBreakEmptyReset`,
    `withDeleteStartReset` in favor of `ResetBlo ### Breaking Changes

- removed:
  - `withResetBlockType`, `withBreakEmptyReset`,
    `withDeleteStartReset` in favor of `ResetBlockTypePlugin`.
  - `withList`: its logic has been moved into `ListPlugin`
    (`onKeyDownList`).
  - `isTable`, `isTableRow`, `isTableCell` in favor of `getAboveByType`.

### Features

- new plugin `ResetBlockTypePlugin` replacing `withResetBlockType`
  - `onKeyDownResetBlockType`
- new editor plugin:
  - `withRemoveEmptyNodes`: Remove nodes with empty text. `options`
    accepts node types where the rule applies.
- queries:
  - `getAboveByType`: Get the block above a location (default:
    selection) by type.
  - `isAncestorEmpty`: Is an ancestor empty (empty text and no inline
    children).
  - `isBlockAboveEmpty`: Is the block above the selection empty.
- new normalizer: `withRemoveEmptyNodes`:
  - Remove nodes with empty text.
  - Option `type` to specify which node types are targeted.
- `link` plugin:
  - `isUrl` option with default to `is-url` package.
  - Paste a string inside a link element will edit its children text but
    not its url.
  - Uses `withRemoveEmptyNodes`.
- `getRenderLeaf` is now passing `leaf` to the component props.

### Bug Fixes

- Pasting some urls was freezing the editor.
- `list`: delete at the start of a list item will move it up.ckTypePlugin`.
  - `withList`: its logic has been moved into `ListPlugin`
    (`onKeyDownList`).
  - `isTable`, `isTableRow`, `isTableCell` in favor of `getAboveByType`.

### Features

- new plugin `ResetBlockTypePlugin` replacing `withResetBlockType`
  - `onKeyDownResetBlockType`
- new editor plugin:
  - `withRemoveEmptyNodes`: Remove nodes with empty text. `options`
    accepts node types where the rule applies.
- queries:
  - `getAboveByType`: Get the block above a location (default:
    selection) by type.
  - `isAncestorEmpty`: Is an ancestor empty (empty text and no inline
    children).
  - `isBlockAboveEmpty`: Is the block above the selection empty.
- new normalizer: `withRemoveEmptyNodes`:
  - Remove nodes with empty text.
  - Option `type` to specify which node types are targeted.
- `link` plugin:
  - `isUrl` option with default to `is-url` package.
  - Paste a string inside a link element will edit its children text but
    not its url.
  - Uses `withRemoveEmptyNodes`.
- `getRenderLeaf` is now passing `leaf` to the component props.

### Bug Fixes

- Pasting some urls was freezing the editor.
- `list`: delete at the start of a list item will move it up.

## v0.63.1

### Bug Fixes

- improved typing of `EditablePlugins`

## v0.63.0

### Breaking Changes

- renamed `setPropsToNodes` to `mergeDeepToNodes`

### Features

- new utils:
  - `applyDeepToNodes`
  - `defaultsDeepToNodes`

### Bug Fixes

- `withNodeID`: use `defaultsDeepToNodes` instead of `mergeDeepToNodes`
  as we don't want to override any existing id.
- missing export

## v0.62.3
### Features

- update `EditablePluginsProps` interface.

## v0.62.2
### Bug Fixes
- `attributes` was missing in the element plugins

## v0.62.1
### Bug Fixes

- tree-shaking support for `lodash`
- export `isExpanded`

## 0.62.0 (2020-07-17)

### Breaking Changes

- Removed:
  - `styled-components` from peerDependencies
  - `AlignElement`
  - `DeserializeElement` in favor of `DeserializeNode`
  - `DeserializeLeaf` in favor of `DeserializeNode`
  - `getElementComponent` in favor of `getRenderElement`
  - `HeadingEelements`
  - `ListElements`
- Renamed:
  - `ActionItem` to `TodoList`.
  - Node types, full list:

```js
ELEMENT_PARAGRAPH
ELEMENT_MENTION
ELEMENT_BLOCKQUOTE
ELEMENT_CODE_BLOCK
ELEMENT_LINK
ELEMENT_IMAGE
ELEMENT_MEDIA_EMBED
ELEMENT_TODO_LI
ELEMENT_H1
ELEMENT_H2
ELEMENT_H3
ELEMENT_H4
ELEMENT_H5
ELEMENT_H6
ELEMENT_ALIGN_LEFT
ELEMENT_ALIGN_CENTER
ELEMENT_ALIGN_RIGHT
ELEMENT_UL
ELEMENT_OL
ELEMENT_LI
ELEMENT_TABLE
ELEMENT_TH
ELEMENT_TR
ELEMENT_TD

MARK_BOLD
MARK_ITALIC
MARK_UNDERLINE
MARK_STRIKETHROUGH
MARK_CODE
MARK_SUBSCRIPT
MARK_SUPERSCRIPT
MARK_HIGHLIGHT
MARK_SEARCH_HIGHLIGHT
```

- Plugin options follow a new structure:

For `getRenderElement`:
```
const options: ParagraphRenderElementOptions = {
  // Use a unique key for each slate node.
  p: {
    // Give a React component or HTML tag (e.g. 'div') to render the element.
    component: StyledElement,
    // Give a unique type for each element.
    type: ELEMENT_PARAGRAPH,
    // Give props to the root of the React component.
    rootProps: {
      // Give a className to the React component. Give an empty string to remove the className.
      className: 'slate-p',
      // When using a styled component, specify the root tag to render.
      as: 'p',
      // Customize styled components: https://github.com/microsoft/fluentui/wiki/Component-Styling
      styles: {
        root: {
          margin: 0,
        }
      }
    },
  },
}
```

For `getRenderLeaf`:

```
const options: BoldRenderLeafOptions = {
  // Use a unique key for each slate node.
  bold: {
    // Give a React component or HTML tag (e.g. 'span') to render the leaf.
    component: StyledLeaf,
    // Give a unique string for each mark.
    type: MARK_BOLD,
    // Specify the hotkey to toggle this mark.
    hotkey: 'mod+b',
    // Specify the marks to clear when toggling this mark.
    clear: '',
    // Give props to the root of the React component.
    rootProps: {
      // Give a className to the React component. Give an empty string to remove the className.
      className: 'slate-bold',
      // When using a styled component, specify the root tag to render.
      as: 'strong',
      // Customize styled components: https://github.com/microsoft/fluentui/wiki/Component-Styling
      styles: {
        root: {
          fontWeight: 600,
        }
      }
    },
  },
}
```

- `onKeyDownMark` signature updated:

```
// from
(
  type: string,
  hotkey: undefined,
  options?: MarkOnKeyDownOptions
)
// to
(options: MarkOnKeyDownOptions)
```

- `HighlightPlugin`:
  - Removed `bg` option in favor of `styles` props.
- Updated `getLeafDeserializer`, `getElementDeserializer` and
  `getNodeDeserializer`
- Updated `deserializeHTMLToMarks`.
- Updated default hotkeys:
  - `code`: `mod+e`
  - `strikethrough`: `mod+shift+s`
- `getNodeDeserializer`
  - returns a list of deserializers
  - options:
    - updated: `node` (renamed from `createNode`): Slate node creator from HTML element.
    - new: `rules`: List of rules the element needs to follow to be
      deserialized to a slate node:
        - updated: `nodeNames` (renamed from `tagNames`): Required node names
          to deserialize the element. Set '*' to allow any node name.
        - new: `className`: Required className to deserialized the element.
        - new: `style`: Required style to deserialize the element. Each value
          should be a (list of) string.
- ...

### Features

- Centralized default options for each plugin (`defaults.ts`):

```js
DEFAULTS_PARAGRAPH
DEFAULTS_MENTION
DEFAULTS_BLOCKQUOTE
DEFAULTS_CODE_BLOCK
DEFAULTS_LINK
DEFAULTS_IMAGE
DEFAULTS_MEDIA_EMBED
DEFAULTS_TODO_LIST
DEFAULTS_TABLE
DEFAULTS_LIST
DEFAULTS_HEADING
DEFAULTS_ALIGN
```

- All element and leaf plugins use a default `className`: useful for
  serialization.
- Components:
  - New:
    - `StyledComponent`
    - `StyledElement`
    - `StyledLeaf`
  - Updated:
    - `strikethrough`: `<s>` tag instead of `<span>` with styles
- New utils:
  - `setDefaults` – Deep merge the default object properties
    that are not defined in the destination object. Used to set the
    default options.
  - `getRenderLeafDefault`
  - `onKeyDownMarkDefault`
- Hotkeys:
  - New:
    - `highlight`: `mod+shift+h`
  - Updated:
    - `code`: `mod+e`
    - `strikethrough`: `mod+shift+s`
- HTML Deserializers:
  - added style deserializing for:
    - superscript: `vertical-align: sub`
    - subscript: `vertical-align: super`
    - code: `word-wrap: break-word`
- Styles updated:
  - `blockquote`
  - `code`
  - `code-block`
  - `table`
- Decorate code block using Prismjs. It's using javascript language by
  default (WIP).

### Bug Fixes

- `align`: deserialize

## 0.61.0 (2020-07-06)

### Breaking Changes

- `getSelectionNodesByType` renamed to `getNodesByType`
  - new option: `at`
- `isNodeInSelection` renamed to `isNodeTypeIn`
  - new option: `at`
- `getBlockAboveSelection` renamed to `getBlockAbove`
  - new option: `at`
- `getTextFromBlockStartToAnchor` renamed to `getRangeFromBlockStart`
  - new option: `at`
- removed `getSelectionNodesArrayByType`
- replaced `insertLink` by `upsertLinkAtSelection`
- `wrapLink` is now only wrapping the link (without unwrapping).
- `@udecode/core` package renamed to `@udecode/slate-plugins-core`.

### Features

- `AlignPlugin` – new plugin for alignment.
- `getPointBefore`
  - new options:
    - `multiPaths`
    - `afterMatch` (replacing `beforeMatch`)
    - `skipInvalid`
  - support for multiple characters lookup.
- `getRangeBefore` – Get range from `getPointBefore` to the end point of `at`.
- `withAutoformat`:
  - new option type: `WithAutoformatOptions`
  - Configurable markup to trigger the autoformatting.
  - Configurable character to trigger the autoformatting.
  - Configurable option to enable autoformatting in the middle of a block by inserting a block instead of updating.
  - Configurable option to enable inline formatting.
- `wrapNodes` – new transform extending `Transforms.wrapNodes`. Options:
  - `unhang` – to unhang range before wrapping.
- `getNodes` – same for `Editor.nodes`

### Bug Fixes

- `withLink` – space key should wrap the previous url with a link at the start of a block.
- `wrapNodes` – fixed a bug where selecting an entire node then calling `wrapNodes` was wrapping also the next node.

## 0.60.2 (2020-07-01)

### Features

- `getPointBefore` – Editor.before with additional options,
useful to look for a point before a location using match options.
- `withLink` – Insert space after a url to wrap a link.
There should be a space before the url.
TODO: it's not working when the url is at the start of the block.
- `LinkElement`:
    - styles updated.
    - supports `styles`.

### Bug Fixes

- when using `withLink`, inserting '#' was adding a link element.

## 0.60.1 (2020-06-30)

- Split the core functionality to `@udecode/slate-plugins-core`

# 0.60.0 (2020-06-15)

**Note:** Version bump only for package slate-plugins

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
- removed `ToolbarCodeBlock` in favor of `BlockToolbarButton` instead.
- `withBreakEmptyReset` and `withDeleteStartReset` – renamed option
  `p.type` to `defaultType`.
- `withToggleType` – renamed option `p.type` to `defaultType`
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
- renamed `ToolbarBlock` to `BlockToolbarButton`.
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
  add more properties to the element interface instead of adding them to
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

```
// you can add nodeTypes to any element plugin
export const nodeTypes = {
  p.type: PARAGRAPH,
  typeMention: MENTION,
  blockquote.type: BLOCKQUOTE,
  typeCode: CODE_BLOCK,
  typeLink: LINK,
  typeImg: IMAGE,
  typeVideo: MEDIA_EMBED,
  todo_li.type: TODO_LIST,
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  ul.type: ListType.UL,
  ol.type: ListType.OL,
  typeLi: ListType.LI,
  h1.type: HeadingType.H1,
  h2.type: HeadingType.H2,
  h3.type: HeadingType.H3,
  h4.type: HeadingType.H4,
  h5.type: HeadingType.H5,
  h6.type: HeadingType.H6,
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
