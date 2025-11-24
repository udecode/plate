---
'@platejs/emoji': patch
---

Fixed React Compiler hook ordering issues by converting `EmojiPickerState` from a factory function to a proper custom hook `useEmojiPickerState`. This change ensures hooks are called in consistent order between renders, preventing React hook violations.