---
"@udecode/plate-mention": major
---

- Now uses the reworked combobox package
- `ELEMENT_MENTION_INPUT` is now an inline void element, and combobox functionality must now be handled in the component
- Plugin options:
  - Now extends from `TriggerComboboxPlugin`
  - Renamed `query` to `triggerQuery` (provided by `TriggerComboboxPlugin`)
  - Removed `id` (no longer needed)
  - Removed `inputCreation` (see `TriggerComboboxPlugin['createComboboxInput']`)
- Removed queries and transforms relating to the mention input:
  - `findMentionInput`
  - `isNodeMentionInput`
  - `isSelectionInMentionInput`
  - `removeMentionInput`
- Removed `withMention` (no longer needed)
- Removed `mentionOnKeyDownHandler` (no longer needed)
