---
'@udecode/plate-ai': minor
---

Breaking changes (experimental):

- `AIChatPlugin`: Remove `createAIEditor` option
- Fix `editor.tf.replaceSelection`:
  - Improved single block selection case with full range check
  - Fixed text properties inheritance when replacing selection
- Add `useAIChatEditor`: Creates an editor, registers in the AI chat plugin, and deserializes the
  content into `editor.children` with block-level memoization.
