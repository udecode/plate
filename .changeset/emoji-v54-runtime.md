---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep emoji picker state, search, category focus, preview, and frequent storage in the copied `emoji-toolbar-button` registry item.

Export `EmojiPluginState` as the complete mutable state contract for `BaseEmojiPlugin`.

Move emoji insertion to `editor.plugin(EmojiPlugin).update.insert`, isolate search state per emoji dataset, clean up picker observers when the menu closes, and register emoji-input properties in compiled schemas. Remove the standalone `insertEmoji` helper.

Install the emoji input descriptor as a required plugin dependency. Its capability name and persisted element type are both `emojiInput`.

Always render the frequent section when `showFrequent.value` is enabled, including before category data is populated.

Keep the package React surface limited to `EmojiPlugin` and `EmojiInputPlugin`. Copy `emoji-toolbar-button` for the complete picker and `emoji-node` for inline search. Replace the removed `EmojiInputConfig` type with `DefinitionOf<typeof BaseEmojiPlugin>`.
