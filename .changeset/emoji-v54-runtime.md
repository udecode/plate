---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep emoji picker state, category focus, preview, and frequent storage in the copied `emoji-toolbar-button` registry item. Use `createEmojiSearch(data)` from `platejs/emoji` for dataset-scoped search with ordered, independent results. Custom dataset names, IDs, and keywords are matched without case sensitivity.

Export `EmojiPluginState` as the complete mutable state contract for `BaseEmojiPlugin`.

Move emoji insertion to `editor.plugin(EmojiPlugin).update.insert`, isolate search state per emoji dataset, and clean up picker observers when the menu closes. Remove the standalone `insertEmoji` helper.

Always render the frequent section when `showFrequent.value` is enabled, including before category data is populated.

Keep the package React surface limited to `EmojiPlugin`. Copy `emoji-toolbar-button` for the complete picker and `emoji` for inline search. Replace `EmojiInputConfig` with `DefinitionOf<typeof BaseEmojiPlugin>`. Search uses the supplied dataset without shared singleton state; grid construction and frequent-item ranking stay in the copied picker.
