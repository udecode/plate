---
'plitejs': patch
---

Add `editor.api.react.subscribeTypedText` and `editor.api.dom.textToCaret`.

- `subscribeTypedText` reports the text each mounted Editable inserts at the caret by typing, with the Editable's root element and the inserted model range. Paste, drop, yank, replacement text, history replay and remote edits report nothing. On Android, a keyboard paste sent as `insertText` reports as typed, and a pending input that merges typed and pasted text reports nothing.
- `textToCaret` reads the text the mounted view shows from a model point to the DOM caret, including IME preedit the model has not received.
