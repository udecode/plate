---
"@udecode/plate-slash-command": major
---

- Now uses the reworked combobox package
- `ELEMENT_SLASH_INPUT` is now an inline void element, and combobox functionality must now be handled in the component
- Replaced all plugin options with those extended from `TriggerComboboxPlugin`
  - Removed `createSlashNode`
  - Removed `id` (no longer needed)
  - Removed `inputCreation` (see `createComboboxInput`)
  - Renamed `query` to `triggerQuery` (provided by `TriggerComboboxPlugin`)
  - Removed `rules`: Slash command rules must now be provided in the component
- Removed queries and transforms relating to the slash input:
  - `findSlashInput`
  - `isNodeSlashInput`
  - `isSelectionInSlashInput`
  - `removeSlashInput`
- Removed `withSlashCommand` (no longer needed)
- Removed `slashOnKeyDownHandler` (no longer needed)
- Removed `getSlashOnSelectItem`: This should now be handled in the component
