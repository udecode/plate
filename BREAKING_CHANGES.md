# Breaking Changes

## 6.0.0

### `@udecode/plate-alignment`

The align plugin is no longer wrapping a block, but instead setting an `align` field to an existing block.

- `createAlignPlugin`:
  - removed `pluginKeys`, `renderElement` and `deserialize`
- removed:
  - `ELEMENT_ALIGN_LEFT`
  - `ELEMENT_ALIGN_CENTER`
  - `ELEMENT_ALIGN_RIGHT`
  - `ELEMENT_ALIGN_JUSTIFY`
  - `KEYS_ALIGN` in favor of `KEY_ALIGN`
  - `getAlignDeserialize`
  - `upsertAlign` in favor of `setAlign`

Migration (normalizer):  
- for each node:
  - run `parent = getParent(editor, path)`, if `parent[0].type` is one of the alignment values:
    - run `setAlign(editor, { align }, { at: path })`
    - run `unwrapNodes(editor, { at: path })`

### `@udecode/plate-alignment-ui`

- `ToolbarAlignProps`:
  - removed `type` in favor of `align`
  - removed `unwrapTypes`
  - added `align`

## 5.0.0

### `@udecode/plate-mention`

The mention plugin is now using the combobox.
- removed `useMentionPlugin` in favor of `createMentionPlugin`
  - migration: replace `useMentionPlugin().plugin` by `createMentionPlugin()`
- removed options:
  - `mentionableSearchPattern`
  - `insertSpaceAfterMention`
  - `maxSuggestions`: moved to `comboboxStore`
  - `trigger`: moved to `comboboxStore`
  - `mentionables`: moved to `items` in `comboboxStore` 
  - `mentionableFilter`: moved to `filter` in `comboboxStore` 
- removed `matchesTriggerAndPattern` in favor of `getTextFromTrigger`
- removed `MentionNodeData` in favor of `ComboboxItemData`
```ts
export interface ComboboxItemData {
  /**
   * Unique key.
   */
  key: string;
  /**
   * Item text.
   */
  text: any;
  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Data available to `onRenderItem`.
   */
  data?: unknown;
}
```

### `@udecode/plate-mention-ui`

- removed `MentionSelect` in favor of `MentionCombobox`

### `@udecode/plate-toolbar`

- removed `setPositionAtSelection` in favor of `useBalloonToolbarPopper`
- removed `useBalloonMove` in favor of `useBalloonToolbarPopper`
- removed `usePopupPosition` in favor of `useBalloonToolbarPopper`
- removed `useBalloonShow` in favor of `useBalloonToolbarPopper`
`BalloonToolbar` props:
- removed `direction` in favor of `popperOptions.placement`
- renamed `scrollContainer` to `popperContainer`

## 4.0.0

### `@udecode/plate-toolbar`

- `BalloonToolbar`: removed `hiddenDelay` prop.

## 3.0.0

### All UI packages

There was multiple instances of `styled-components` across all the packages.
So we moved `styled-components` from dependencies to peer dependencies.

#### Before

`styled-components` was not listed in your dependencies

#### After

Add `styled-components` to your dependencies

## 2.0.0

### `@udecode/plate-autoformat`

- `autoformatBlock`:
  - signatude changed 

```ts
// Before 
(
  editor: TEditor,
  type: string,
  at: Location,
  options: Pick<AutoformatRule, 'preFormat' | 'format'>
)
```

```ts
// After
(editor: TEditor, options: AutoformatBlockOptions)
```

  - moved the checks from `withAutoformat`
- `autoformatInline`:
  - renamed to `autoformatMark`
  - signatured changed

```ts
// Before
(
  editor: TEditor,
  options: Pick<AutoformatRule, 'type' | 'between' | 'markup' | 'ignoreTrim'>
)  
```

```ts
// After
(
  editor: TEditor,
  options: AutoformatMarkOptions
) 
```

- `AutoformatRule` is now `AutoformatBlockRule
  | AutoformatMarkRule
  | AutoformatTextRule;`
  - `mode: 'inline'` renamed to `mode: 'mark'`
  - `markup` and `between` have been replaced by `match: string | string[] | MatchRange | MatchRange[]`: The rule applies when the trigger and the text just before the cursor matches. For `mode: 'block'`: lookup for the end match(es) before the cursor. For `mode: 'text'`: lookup for the end match(es) before the cursor. If `format` is an array, also lookup for the start match(es). For `mode: 'mark'`: lookup for the start and end matches. Note: `'_*'`, `['_*']` and `{ start: '_*', end: '*_' }` are equivalent. 
  - `trigger` now defaults to the last character of `match` or `match.end` (previously `' '`)
- the plugin now checks that there is no character before the start match to apply autoformatting. For example, nothing will happen by typing `a*text*`.