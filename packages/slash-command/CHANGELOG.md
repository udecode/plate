# @platejs/slash-command

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –

  - The following plugins now default to `editOnly: true`. This means their core functionalities (handlers, rendering injections, etc.) will be disabled when the editor is in read-only mode. To override this behavior for a specific plugin, configure its `editOnly` field. For example, `SomePlugin.configure({ editOnly: false })`.

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –

  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - The type `TSlashInputElement` has been removed.
  - Use `TComboboxInputElement` from `platejs` instead for Slash Command input elements, as slash command functionality is built upon the combobox.

# @udecode/plate-slash-command

## 48.0.0

## 44.0.0

## 43.0.0

## 42.2.4

## 42.0.0

## 41.0.0

## 40.0.0

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSlashPlugin` -> `SlashPlugin`
  - NEW `SlashInputPlugin`

## 36.0.0

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
