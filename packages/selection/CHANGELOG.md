# @udecode/plate-selection

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

## 27.0.3

## 27.0.0

### Patch Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) – Update Zustood imports

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

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.1.3

### Patch Changes

- [#2384](https://github.com/udecode/plate/pull/2384) by [@zbeyens](https://github.com/zbeyens) – Fixes #2321

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.5

### Patch Changes

- [#2117](https://github.com/udecode/plate/pull/2117) by [@OliverWales](https://github.com/OliverWales) – Fixes #2117

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.14.3

### Patch Changes

- [#2090](https://github.com/udecode/plate/pull/2090) by [@OliverWales](https://github.com/OliverWales) – Respect editor read-only state in block selection hooks

## 18.13.0

## 18.9.0

## 18.7.0

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
