---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Copy `inline-combobox` for input focus, query state, keyboard navigation, and presentation. `BaseComboboxPlugin` owns cancellation, completion, and guarded history actions using the live input's `NodeKey`.

- Handle trigger-combobox insertion through the typed `insertText` command
- Keep transient collaboration metadata on inserted combobox inputs and reject completion from a foreign, removed, or read-only input
- Remove and replace the input in one transaction through the inferred `onSelect(tx)` callback; cancellation restores literal query text in one undo step
- Rename `TriggerComboboxPluginOptions` to `TriggerComboboxPluginState`

**Migration:** Replace `withTriggerCombobox` with `triggerCombobox` in the descriptor's command factory. Mention, slash, emoji, and footnote input descriptors install `BaseComboboxPlugin` automatically.
