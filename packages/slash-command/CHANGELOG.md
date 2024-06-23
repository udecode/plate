# @udecode/plate-slash-command

## 34.0.8

## 34.0.0

### Major Changes

- [#3168](https://github.com/udecode/plate/pull/3168) by [@12joan](https://github.com/12joan) –
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

## 33.0.0

## 32.0.0

### Minor Changes

- [#3155](https://github.com/udecode/plate/pull/3155) by [@felixfeng33](https://github.com/felixfeng33) – Add `createSlashCommandPlugin`
