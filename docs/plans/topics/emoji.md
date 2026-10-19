# Emoji

Page: https://claude.ai/artifact/JTtn9cRPNbp2rsv5HpNVnF

In Plate, typing `:` and a query opens a popup that inserts an emoji as ordinary text, and a toolbar picker inserts one from a grid that remembers the user's frequent picks. Emoji has no node, mark or document property. Everything emoji lives in copied registry items on frimousse and Emojibase; `platejs` ships no emoji entrypoint. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show emoji`.

## Public API

The copied `emoji` item defines an edit-only plugin whose state holds the trigger policy and refuses a trigger inside a code block, as slash does. The kit adds the popup slot.

```tsx
// apps/www/src/registry/components/editor/emoji.tsx
export const EmojiPlugin = definePlugin('emoji', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: /^[\p{L}\p{N}_+\-:]$/u,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({ type: codeBlock.schema.type })
      );
    },
  }),
});

export const EmojiKit = [
  EmojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
```

The popup asks the shared catalog for matches, which loads on the first query character and ranks shortcodes first, and it inserts the emoji character in the completion transaction.

```tsx
// apps/www/src/registry/components/editor/emoji.tsx
const { results, status } = useEmojiSearch(query || null);

<InlineComboboxItem
  key={emoji.emoji}
  value={emoji.label}
  onSelect={(tx) => {
    tx.text.insert(emoji.emoji);
  }}
>
```

The picker takes its trigger as its child and hands the caller the emoji character. The callout sets its icon.

```tsx
// apps/www/src/registry/components/editor/callout.tsx
<EmojiPicker
  onEmojiSelect={(icon) => {
    editor.update.nodes.set({ icon }, { at: props.element });
  }}
>
```

The toolbar button is the one place that inserts a picked emoji into the document, at the editor's kept selection as its own undo step.

```tsx
// apps/www/src/registry/components/editor/emoji-toolbar-button.tsx
<EmojiPicker
  onEmojiSelect={(emoji) => {
    if (!editor.read.selection()) return;

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert(emoji);
    });
  }}
>
  <ToolbarButton
    aria-label="Emoji"
    disabled={readOnly}
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
| Trigger policy for `:` | `ComboboxState` fields of the copied `EmojiPlugin` in `emoji.tsx`, with a code-block veto in `triggerQuery` |
| Insertion | `tx.text.insert` in the popup's completion and in the toolbar button's `onEmojiSelect` |
| Search | `searchEmojis` in the copied `lib/emoji-data.ts`, ranking exact shortcode, then shortcode prefix, then label word prefix, then substring, for both the popup and the picker's search |
| Dataset | The copied `lib/emoji-data.ts`, with one memoized load through frimousse's `defaultEmojiDataResolver` and GitHub shortcodes from `emojibase-data@17.0.0`, shared by the popup and every picker |
| Picker grid, categories, preview and frequent picks | Copied `emoji-picker.tsx` inside its own popover, with its own search input and ranked results while the user types, and frimousse's virtualized grid with a frequent row above it while the search is empty |

All of these live in Plate's copied registry layer; no `platejs` or `plitejs` entrypoint holds emoji code.

## Main changes

- The emoji dataset lives outside the editor bundle. It loads on the first `:` query or picker open, from a pinned CDN URL, frimousse caches it in memory and `localStorage` and drops emoji the device cannot draw, and Plate stores the GitHub shortcodes in `localStorage` beside it, keyed by the pinned release.
- The copied `inline-combobox` reads option order from the popup's DOM, because Ariakit sorts its collection a frame late and misses a reorder of kept options. The first result stays active after each query until an arrow key or a scroll moves away. A `loading` prop keeps Enter and Tab from editing while options load, and the empty row stays mounted, so the popup stays open across the load.
- Plite's `Editable` ignores React events that bubble from a portal outside its DOM, so an input in a popover that an element renders keeps focus, including the callout icon search and the inline equation input.

## Open work

- CI on `next` fails at install, because merge `1efe622706` tracks `apps/www/node_modules` as a symlink to a path on one Mac. Commit its removal with `git rm --cached apps/www/node_modules` and the root `.gitignore` line `node_modules`, then push `next`. owner: zbeyens. stop: CI on `next` passes its install step.
- The `emoji-picker` and `emoji-toolbar-button` registry items link the `emoji-pro` example and Plate Pro's emoji picker page, which runs `@platejs/emoji` 52 on emoji-mart with another picker API. owner: zbeyens. stop: the next Plate Pro emoji sync, or 2026-11-30.
- Hovering an inline combobox option only highlights it, so Enter after a hover picks the keyboard choice. owner: zbeyens. stop: a combobox hover plan, or 2026-11-30.
- A new query does not scroll a hand-scrolled list back to its active first option. owner: zbeyens. stop: a combobox scroll plan, or 2026-11-30.
- Rerun the popup typing probe on a quiet machine with layout and style counts; its scripts sit in `docs/plans/artifacts/2026-10-08-emoji-review/bench/`. owner: zbeyens. stop: the next performance pass, or 2026-11-30.
- Rerun the fresh-app install check once `dnd.tsx` typechecks in the Base family app. owner: zbeyens. stop: that check passes.
- The www Chromium suite has 27 failures on the emoji review's final bytes, none from its code: 19 also fail at its run base, six fail on the code that passed them hours earlier, one is flaky and one came with a merge of `next`; the logs sit in `docs/plans/artifacts/2026-10-08-emoji-review/browser/`. owner: zbeyens. stop: the next full-suite triage, or 2026-11-30.
- The picker copies platejs's internal IME key check. owner: zbeyens. stop: platejs exports one, or 2026-11-30.
- `math.tsx` relies on preventing Escape on the Base popover, which Base UI ignores. owner: zbeyens. stop: a math popover fix, or 2026-11-30.
