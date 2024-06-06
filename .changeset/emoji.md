---
"@udecode/plate-emoji": major
---

- Now uses the reworked combobox package
- Added `ELEMENT_EMOJI_INPUT`; combobox functionality must now be handled in the component
- Plugin options:
  - Now extends from `TriggerComboboxPlugin`
  - Added `createEmojiNode` to support custom emoji nodes
  - Removed `emojiTriggeringController`
  - Removed `id` (no longer needed)
  - Removed `createEmoji`
