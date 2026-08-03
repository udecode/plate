---
"@platejs/emoji": major
---

Export `EmojiPluginState` as the complete mutable state contract for
`BaseEmojiPlugin`.

Move emoji insertion to `editor.plugin(EmojiPlugin).update.insert`, isolate
search state per emoji dataset, clean up picker observers when the menu closes,
and register emoji-input properties in compiled schemas. Remove the standalone
`insertEmoji` helper.

Install the emoji input descriptor as a required plugin dependency. Its
capability name and persisted element type are both `emojiInput`.

Always render the frequent section when `showFrequent.value` is enabled,
including before category data is populated.

Keep picker consumers on `useEmojiPicker`, `useEmojiDropdownMenuState`,
`EmojiFloatingLibrary`, and `FrequentEmojiStorage`. Remove the exported
observer, reducer, local-storage, floating-grid, and floating-grid-builder
implementation helpers. Replace the removed `EmojiInputConfig` type with
`DefinitionOf<typeof BaseEmojiPlugin>`.
