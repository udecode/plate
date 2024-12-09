# @udecode/plate-emoji

## 40.0.0

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createEmojiPlugin` -> `EmojiPlugin`
  - NEW `EmojiInputPlugin`

## 36.0.0

## 34.0.8

## 34.0.0

### Major Changes

- [#3168](https://github.com/udecode/plate/pull/3168) by [@12joan](https://github.com/12joan) –
  - Now uses the reworked combobox package
  - Added `ELEMENT_EMOJI_INPUT`; combobox functionality must now be handled in the component
  - Plugin options:
    - Now extends from `TriggerComboboxPlugin`
    - Added `createEmojiNode` to support custom emoji nodes
    - Removed `emojiTriggeringController`
    - Removed `id` (no longer needed)
    - Removed `createEmoji`

## 33.0.0

## 32.0.0

## 31.4.0

### Patch Changes

- [#3118](https://github.com/udecode/plate/pull/3118) by [@felixfeng33](https://github.com/felixfeng33) – Missing exports

## 31.0.0

### Minor Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Updated minor dependencies

### Patch Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Fixes #3031

## 30.7.0

### Patch Changes

- [#2991](https://github.com/udecode/plate/pull/2991) by [@SamuelAlev](https://github.com/SamuelAlev) – fix: add assertion as JSON on emoji mart data so it can be read in ESM

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.5.2

### Patch Changes

- [#2961](https://github.com/udecode/plate/pull/2961) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.4.5

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Replace `useEdtiorState` with `useEditorSelector`

## 27.0.3

## 27.0.0

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New exports:
  - `useEmojiCombobox`
  - `useEmojiDropdownMenuState`

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.5

### Patch Changes

- [#2433](https://github.com/udecode/plate/pull/2433) by [@bojangles-m](https://github.com/bojangles-m) –
  - removed fix number to find triggering mark, now triggered with space followed by colon
  - possible forward delete
  - improved code to no interfere with other combobox plugin

## 21.3.3

### Patch Changes

- [#2421](https://github.com/udecode/plate/pull/2421) by [@bojangles-m](https://github.com/bojangles-m) –
  - if after ':' char was break inserted typing further would activate dropdown. Should be only activated in the same line.
  - if the emoji was enclosed whit the ':' sign nothing happened, now the emoji is created if it was found.

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.1

### Patch Changes

- [#2294](https://github.com/udecode/plate/pull/2294) by [@bojangles-m](https://github.com/bojangles-m) – Fixes #2277

## 20.4.0

## 20.3.2

### Patch Changes

- [#2285](https://github.com/udecode/plate/pull/2285) by [@12joan](https://github.com/12joan) – Ignore `defaultPrevented` keydown events

## 20.3.1

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

### Patch Changes

- [#2139](https://github.com/udecode/plate/pull/2139) by [@zbeyens](https://github.com/zbeyens) – Fix: key navigation with emoji plugin

## 19.0.5

### Patch Changes

- [#2114](https://github.com/udecode/plate/pull/2114) by [@bojangles-m](https://github.com/bojangles-m) – fix: Conflict with combobox. Only apply if the triggering mark is for Emoji and not any other

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.14.4

### Patch Changes

- [#2093](https://github.com/udecode/plate/pull/2093) by [@bojangles-m](https://github.com/bojangles-m) –
  - Added prop to control toolbar (open or close) after selecting emoji.
  - Set focus to editor after selection of emoji while in Firefox selections jumped on the beginning of the line.

## 18.14.2

### Patch Changes

- [#2082](https://github.com/udecode/plate/pull/2082) by [@bojangles-m](https://github.com/bojangles-m) – Separated search and clear button.
  Updated component for easier styling.

## 18.14.0

### Minor Changes

- [#2071](https://github.com/udecode/plate/pull/2071) by [@bojangles-m](https://github.com/bojangles-m) – Toolbar emoji UI.

## 18.13.2

### Patch Changes

- [#2065](https://github.com/udecode/plate/pull/2065) by [@zbeyens](https://github.com/zbeyens) – fix es module

## 18.13.0

## 18.11.2

### Patch Changes

- [#2020](https://github.com/udecode/plate/pull/2020) by [@bojangles-m](https://github.com/bojangles-m) – fix bug when editor text is empty

## 18.11.0

### Minor Changes

- [#2007](https://github.com/udecode/plate/pull/2007) by [@bojangles-m](https://github.com/bojangles-m) – New plugin: emoji
