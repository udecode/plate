# Emoji

Page: https://claude.ai/artifact/3SM4ZBnLNBb37VfQfB458T

In Plate, typing `:` and a query opens a popup that inserts an emoji as ordinary text, and a toolbar picker inserts one from a grid that remembers the user's frequent picks. Emoji has no node, mark or document property. The ledger question is what should own emoji search, insertion and frequent-item preferences, and which state belongs outside the document. The 2026-10-04 audit gave it a Pursue verdict that no plan adopted. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show emoji`.

## Public API

The copied `emoji` item puts the emoji-mart dataset in the package plugin's state and mounts the popup.

```tsx
// apps/www/src/registry/components/editor/emoji.tsx
export const emojiPlugin = EmojiPlugin.extend({
  initialState: {
    data: emojiMartData as unknown as EmojiMartData,
  },
});

export const EmojiKit = [
  emojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
```

The popup searches that dataset with the package search and inserts through the package command.

```tsx
// apps/www/src/registry/components/editor/emoji.tsx
const data = usePluginStore(emojiPlugin, 'data');
const search = React.useMemo(() => createEmojiSearch(data), [data]);

<InlineComboboxItem
  key={emoji.id}
  value={emoji.name}
  onSelect={(tx) => {
    tx.plugin(emojiPlugin).insert(emoji);
  }}
>
```

The toolbar button and the callout icon both open the copied picker, which takes an emoji-mart `Emoji`.

```tsx
// apps/www/src/registry/components/editor/callout.tsx
<EmojiPicker
  closeOnSelect
  disabled={readOnly}
  onSelectEmoji={(emoji) => {
    const icon = emoji.skins[0]?.native;

    if (!icon) return;

    editor.update.nodes.set({ icon }, { at: props.element });
    localStorage.setItem(CALLOUT_STORAGE_KEY, icon);
  }}
>
```

## What other editors do

| Editor | Dataset | Picker | Stored as |
| --- | --- | --- | --- |
| Tiptap (`@tiptap/extension-emoji`) | `emojibase-data` 17, read at build time with GitHub and Emojibase shortcodes | Suggestion list only; apps bring a picker | An inline emoji node with a shortcode name |
| BlockNote | `@emoji-mart/data` and `emoji-mart`, imported dynamically | emoji-mart's picker, for the `:` menu and comment reactions | Text |
| Lexical playground | A vendored copy of GitHub's gemoji list | A typeahead menu | Text |
| Liveblocks Comments | Emojibase, fetched from a CDN and cached in `localStorage` | frimousse, which it extracted as its own package | Text |

Sources: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-emoji/src/generate.ts`, `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/core/src/extensions/SuggestionMenu/getDefaultEmojiPickerItems.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-playground/src/utils/emoji-list.ts` and `liveblocks/frimousse@5723fc11a8162b3b795cd2f5d1164bd6795ae30e:src/data/emoji.ts`.

## Layer and owner

| Job | Owner |
| --- | --- |
| Trigger policy for `:` | `BaseEmojiPlugin` state in `platejs/emoji` |
| Insertion | `BaseEmojiPlugin`'s `insert(emoji)`, through a `createEmojiNode` option |
| Search | `createEmojiSearch` in `platejs/emoji` |
| Dataset | `@emoji-mart/data` 1.2.1, an optional peer of `platejs`, imported statically by both copied items |
| Picker grid, categories, preview and frequent picks | Copied `emoji-picker.tsx`, 1,207 lines |

## Main changes

- `platejs/emoji` publishes `BaseEmojiPlugin`, `EmojiPluginState`, `createEmojiSearch` and a re-export of emoji-mart's `Emoji` type, and `platejs/emoji/react` publishes `EmojiPlugin`. Only copied registry UI, docs and generated output import them.
