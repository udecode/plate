# Slash commands

Page: https://claude.ai/artifact/956yoYW7DUdCXUXXVweQss

Slash presentation stays copied, and insertion goes through each feature's typed `upsert` or `insert`. The copied registry owns the command catalog, labels, icons, keywords, grouping, installed-feature choices, AI membership, JSX and the trigger plugin itself. Since the [2026-10-18 cut](../2026-10-18-slash-review.md), `platejs` ships no slash code, the shape emoji took on 2026-10-09. `node tooling/scripts/review-ledger.mjs show slash` prints the full history.

## Public API

The copied slash file defines its own plugin, with the trigger settings and the code-block veto, and mounts the popup beside the Editable.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
export const SlashPlugin = definePlugin('slashCommand', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: null,
    trigger: '/',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({
          type: codeBlock.schema.type,
        })
      );
    },
  }),
});

export const SlashKit = [
  SlashPlugin.configure({ slots: { afterEditable: SlashCombobox } }),
];
```

The popup takes Plate's shared props type for components beside the Editable.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
export function SlashCombobox({ editableRef }: EditableSiblingProps) {
```

Each catalog item runs a feature's typed command inside the completion. On a Details title, Heading sets the title's level in place and Text clears it.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
const upsertHeading = (
  editor: Editor,
  tx: PluginTransaction,
  level: 1 | 2 | 3
) => {
  const heading = tx.plugin(BaseHeadingPlugin);

  return isTitle(editor, tx)
    ? heading.setLevel(level)
    : heading.upsert({ level }, { select: true });
};
```

An inline item runs only its command, and each item hands its command's result straight to the completion.

```tsx
// apps/www/src/registry/components/editor/slash.tsx
{
  icon: <CalendarIcon />,
  isAvailable: (editor) => editor.plugin(BaseDatePlugin).installed,
  keywords: ['time'],
  label: 'Date',
  value: PLUGINS.date,
  onSelect: (_editor, tx) =>
    tx.plugin(BaseDatePlugin).insert({}, { select: true }),
},

<InlineComboboxItem
  key={value}
  value={value}
  onSelect={(tx) => onSelect?.(editor, tx)}
>
```

The completion's edit returns `true`, `false` or nothing, and only `false` refuses, so a typed command's result passes straight through.

```ts
// packages/platejs/src/react/features/combobox/comboboxOwner.internal.ts
export type ComboboxCompletion = (tx: PluginTransaction) => boolean | void;
```

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Query | Ordinary text, per the `autocomplete` subject; the transient input schema and `BaseComboboxPlugin` are gone. |
| Trigger policy | `ComboboxState` fields of the copied `SlashPlugin` in `slash.tsx`, with the code-block veto in `triggerQuery`; no `platejs` entrypoint holds slash code. |
| Completion | `useCombobox`'s `complete` replaces the trigger and query and runs the chosen edit in one synchronous, refusable transaction with one-step undo, and refuses without running the edit when the view is read-only. The edit returns `true`, `false` or nothing, and only `false` refuses, so a typed command's result passes straight through. Shared by slash, mentions, emoji and footnotes. |
| Semantic block identity | Plate's typed plugin insertion decides whether to reuse a matching empty block; Plite owns structural `blocks.insertAfter(..., { replaceEmpty })`. |
| Catalog | 20 product items in copied `slash.tsx`; `isAvailable` alone decides which items show, and an inline item runs only its command. The AI item checks read-only before it opens AI, because it runs after the completion commits. A small lexical factory is allowed there if it keeps descriptor inference, never exported. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The copied `transforms.ts` matcher and callback recipe | Typed `insert` and `upsert` own it; deleted. |
| A public slash item factory or command catalog | Publishes one product configuration and duplicates the plugin portal. |
| One catalog shared with the Insert toolbar | Different labels, groups, membership, focus policy and async actions. |
| A trigger-only slash plugin in `platejs` | Its only terminal consumer was the copied `slash.tsx`, and `docs/vision/plate.md` makes a plugin stage that only copied UI uses registry-owned. |
| A public `ComboboxCompletion` export | `VISION.md` counts every public name as API, and `InlineComboboxItem` already infers the type from `UseComboboxReturn['complete']`. |
| Renaming the plugin to `slash` | The plugin name is API too, and the layout review keeps `slashCommand`. |

## What other editors do

The 2026-10-18 review read Tiptap at `91c51be53c`, Lexical at `dd5c41b131`, BlockNote at `1e26f1c5e1` and Slate at `945a484df2`, without running them. Only BlockNote, an all-in-one editor, ships the slash trigger and its catalog in a package; the others give apps a neutral typeahead and leave the slash menu in example or app code. No ProseMirror checkout sits beside the repository, so it was not read.

| Editor | Neutral trigger primitive | Where the `/` menu lives | Catalog owner |
| --- | --- | --- | --- |
| Tiptap | `@tiptap/suggestion` with a `char` option | A demo extension, `Extension.create({ name: 'commands' })` with `char: '/'` in `demos/src/Experiments/Commands` | The demo |
| Lexical | `LexicalTypeaheadMenuPlugin` and `useBasicTypeaheadTriggerMatch` in `@lexical/react` | The playground's `ComponentPickerPlugin` and the `website-notion` example's `SlashMenuPlugin`, each calling `useBasicTypeaheadTriggerMatch('/')` | App code |
| BlockNote | `SuggestionMenu` in `@blocknote/core` with a `triggerCharacter` | `BlockNoteDefaultUI` mounts `triggerCharacter="/"` | `getDefaultSlashMenuItems` in the core package |
| Slate | None | None; the site has only a mentions example | None |

## Main changes

- Copied callers lost the raw transaction recipe; nine Chromium cases cover Base and Radix at desktop and narrow widths.
- The copied `slash.tsx` owns `SlashPlugin`. `platejs` publishes no slash plugin and no `slashCommand` plugin key, and the combobox spec tests two triggers with its own `TestSlashTrigger`.
- The copied emoji, mention, footnote and slash popups take `EditableSiblingProps`, and `InlineCombobox` types its ref as `UseComboboxOptions['editableRef']`, so no copied file restates the slot's ref type.
- `InlineComboboxItem` infers its `onSelect` type from `UseComboboxReturn['complete']`, so the copied file follows the package's completion contract without a second copy of it.

## Open work

- The [autocomplete occurrence host plan](../2026-10-03-autocomplete-occurrence-host.md)'s gated Phase 2 still edits the removed package plugin, its state type, its React entrypoint edge and the slash changeset. After the cut it targets the copied `SlashPlugin` in `slash.tsx`. owner: that plan's Phase 2. stop: its verdict gate.
