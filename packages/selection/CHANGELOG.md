# @udecode/plate-selection

## 18.6.0

## 18.5.0

### Minor Changes

- [#1947](https://github.com/udecode/plate/pull/1947) by [@zbeyens](https://github.com/zbeyens) –
  - new dep: `copy-to-clipboard`
  - `blockSelectionStore`
    - new state: `isSelecting` - can be true even with no block selected
    - action `reset` renamed to `resetSelectedIds`
    - new action: `unselect`
  - moved hooks from `BlockSelectionArea` to `useHooksBlockSelection`
  - when block selection is updating, an invisible input element is added to the document to capture the following events:
    - `escape`: unselect
    - `mod+z`: undo
    - `mod+shift+z`: redo
    - `enter`: focus the end of the first selected block
    - `delete`: delete selected blocks
    - `copy`
    - `cut`
    - `paste`
  - we no longer reset block selection on focus but rather on change when the editor selection gets defined
  - new plugin option: `onKeyDownSelecting`

## 18.2.1

### Patch Changes

- [#1928](https://github.com/udecode/plate/pull/1928) by [@zbeyens](https://github.com/zbeyens) – `SelectionArea` props:

  - new prop: `getBoundaries` to customize `boundaries`

- [#1929](https://github.com/udecode/plate/pull/1929) by [@zbeyens](https://github.com/zbeyens) – Types: `BlockStartArea` `placement` and `size` props are now optional

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.1

### Patch Changes

- [#1862](https://github.com/udecode/plate/pull/1862) by [@zbeyens](https://github.com/zbeyens) – fix: support string ids on selectable blocks

## 16.8.0

### Minor Changes

- [#1856](https://github.com/udecode/plate/pull/1856) by [@zbeyens](https://github.com/zbeyens) – New plugin: Block Selection
