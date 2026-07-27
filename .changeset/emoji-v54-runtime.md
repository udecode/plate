---
"@platejs/emoji": major
---

Move emoji insertion to `editor.plugin(EmojiPlugin).update.insert`, isolate
search state per emoji dataset, clean up picker observers when the menu closes,
and register emoji-input properties in compiled schemas. Remove the standalone
`insertEmoji` helper.

Install the emoji input descriptor as a required plugin dependency. Its plugin
identity is `emojiInput`; persisted elements remain `emoji_input`.
