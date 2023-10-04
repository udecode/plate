# @udecode/plate-list

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

## 23.7.2

### Patch Changes

- [#2597](https://github.com/udecode/plate/pull/2597) by [@nicktrn](https://github.com/nicktrn) – Prevent `deleteBackward` and `deleteForward` from creating empty nodes when merging sibling list items with multiple children

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 23.2.0

### Patch Changes

- [#2559](https://github.com/udecode/plate/pull/2559) by [@dimaanj](https://github.com/dimaanj) –
  - list plugin: call `deleteFragmentList` only if in a list

## 22.0.2

## 22.0.1

## 22.0.0

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

### Minor Changes

- [#2351](https://github.com/udecode/plate/pull/2351) by [@almeraikhi](https://github.com/almeraikhi) – Enables the developer to enable or disable the checkbox state inheritance when creating a new todo list item.

  The option is configurable for when a line break is inserted from the start of the node or the end of the node.

  The plugin now has two new optional options:

  ```tsx
  createTodoListPlugin(
      options:{
          inheritCheckStateOnLineStartBreak: false,
          inheritCheckStateOnLineEndBreak: false
      }
  )
  ```

  `inheritCheckStateOnLineStartBreak` option will create a new todo item on **top** of the current one, and the new todo item will inherit the checkbox state of the current todo item. Default value is `false`.

  `inheritCheckStateOnLineEndBreak` option will create a new todo item **below** the current one, and the new todo item will inherit the checkbox state of the current todo item. Default value is `false`.

## 20.4.0

## 20.3.2

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.4.1

### Patch Changes

- [#2180](https://github.com/udecode/plate/pull/2180) by [@12joan](https://github.com/12joan) – Ignore defaultPrevented keydown event

## 19.2.0

## 19.1.1

## 19.1.0

### Patch Changes

- [#2141](https://github.com/udecode/plate/pull/2141) by [@12joan](https://github.com/12joan) – Fix crash when deleting line ending in \n

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.2

### Patch Changes

- [#1986](https://github.com/udecode/plate/pull/1986) by [@charrondev](https://github.com/charrondev) – Fix Tab and Shift+Tab adjust selection ranges with the list plugin.

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.6.1

### Patch Changes

- [#1842](https://github.com/udecode/plate/pull/1842) by [@zbeyens](https://github.com/zbeyens) – `moveListItems` should return a boolean (whether it has been moved)

## 16.5.0

## 16.4.2

### Patch Changes

- [#1816](https://github.com/udecode/plate/pull/1816) by [@zbeyens](https://github.com/zbeyens) – Fixes #1817

## 16.4.1

### Patch Changes

- [#1804](https://github.com/udecode/plate/pull/1804) by [@zbeyens](https://github.com/zbeyens) – Fixes #1803

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.6

### Patch Changes

- [#1728](https://github.com/udecode/plate/pull/1728) by [@dylans](https://github.com/dylans) – Retain order of blocks when converting to a list

## 15.0.3

## 15.0.0

## 14.4.3

### Patch Changes

- [#1693](https://github.com/udecode/plate/pull/1693) by [@zbeyens](https://github.com/zbeyens) – fix: list plugin was preventing default event even when selection was not containing any list node

## 14.4.2

## 14.4.0

### Minor Changes

- [#1676](https://github.com/udecode/plate/pull/1676) by [@zakishaheen](https://github.com/zakishaheen) – Allow escape unindent of the first element of a list

## 14.1.0

### Minor Changes

- [#1663](https://github.com/udecode/plate/pull/1663) by [@zakishaheen](https://github.com/zakishaheen) – Allow un-indenting top level list items

## 14.0.2

## 14.0.0

### Minor Changes

- [#1642](https://github.com/udecode/plate/pull/1642) by [@zakishaheen](https://github.com/zakishaheen) – Improved list item indentation when selection spans across different elements

## 13.8.0

### Patch Changes

- [#1651](https://github.com/udecode/plate/pull/1651) by [@davisg123](https://github.com/davisg123) – Some types of nested lists are not unwrapped completely

## 13.7.0

## 13.6.0

### Patch Changes

- [`42c5ed1`](https://github.com/udecode/plate/commit/42c5ed1a15dfecb7e64fc39ba328c16733472112) by [@zbeyens](https://github.com/zbeyens) – Toggling a nested list that includes paragraph content should toggle all nested list elements

## 13.5.0

## 13.3.1

### Patch Changes

- [#1607](https://github.com/udecode/plate/pull/1607) by [@dylans](https://github.com/dylans) – Fix list deleteBackward with custom type

## 13.1.0

## 11.2.1

## 11.2.0

### Minor Changes

- [#1560](https://github.com/udecode/plate/pull/1560) by [@zbeyens](https://github.com/zbeyens) –
  - fix: tab / untab when composing with IME
  - update peerDeps:
    - `"slate": ">=0.78.0"`
    - `"slate-react": ">=0.79.0"`

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

## 10.5.3

## 10.5.2

## 10.5.0

## 10.4.2

## 10.4.1

## 10.4.0

## 10.2.2

## 10.2.1

## 10.1.2

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

## 10.1.0

### Minor Changes

- [#1386](https://github.com/udecode/plate/pull/1386) by [@fakedarren](https://github.com/fakedarren) – Improvements to list behaviours:

  - copy/paste of lis into existing lists
  - behaviour of browser autocorrection

  Improvements to list-specific tests

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

### Patch Changes

- [#1336](https://github.com/udecode/plate/pull/1336) by [@fondation451](https://github.com/fondation451) – Copy/paste inside a list now works properly with pasting text:
  The text was not pasted at all.
  For other kind of nodes like "p", there were pasted but inside the same bullet.

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

## 7.0.2

## 7.0.1

## 7.0.0

## 6.4.1

## 6.4.0

## 6.3.0

## 6.2.0

## 6.1.0

## 6.0.0

## 5.3.5

### Patch Changes

- [#1146](https://github.com/udecode/plate/pull/1146) [`3718c6d1`](https://github.com/udecode/plate/commit/3718c6d1abe1af8a94b41e9debef0cb5301d051c) Thanks [@ghingis](https://github.com/ghingis)! - fix: list toggle when selection is inside a single block

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5
  - @udecode/plate-reset-node@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-reset-node@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-reset-node@5.3.0

## 5.1.0

### Minor Changes

- [#1105](https://github.com/udecode/plate/pull/1105) [`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a) Thanks [@aj-foster](https://github.com/aj-foster)! - Unwrap list item only if selection is at start of list item, not any block

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-reset-node@5.1.0

## 4.4.0

### Patch Changes

- [#1098](https://github.com/udecode/plate/pull/1098) [`c353b008`](https://github.com/udecode/plate/commit/c353b0085804fa9099f0c18405ca01b0b25da03a) Thanks [@djagya](https://github.com/djagya)! - Respect validLiChildrenTypes by keeping valid block elements as direct li children

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0
  - @udecode/plate-reset-node@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7
  - @udecode/plate-reset-node@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0
  - @udecode/plate-reset-node@4.3.0

## 4.2.0

### Minor Changes

- [#1058](https://github.com/udecode/plate/pull/1058) [`6fe49e22`](https://github.com/udecode/plate/commit/6fe49e22e51b5fbec8695629e77ab149d80ce4cb) Thanks [@ghingis](https://github.com/ghingis)! - Normalizer:
  - now merges lists with the same type next to each other
  - if a list has no lic and it has children it moves those childrens up a level

### Patch Changes

- [#1058](https://github.com/udecode/plate/pull/1058) [`87cca4a0`](https://github.com/udecode/plate/commit/87cca4a0894b512a8257257570952e827924c13b) Thanks [@ghingis](https://github.com/ghingis)! - fix:
  - `toggleList` works as expected
  - `moveListItemDown` wrap transformations in `withoutNormalizing` (it caused a pathing issue since the normalization would remove the created empty list)

## 4.1.0

### Minor Changes

- [#1028](https://github.com/udecode/plate/pull/1028) [`eb30aa5d`](https://github.com/udecode/plate/commit/eb30aa5d355abb81bc3e8577fedb3800e1b056aa) Thanks [@ghingis](https://github.com/ghingis)! - feat: handle more `deleteForward` edge case scenarios

## 3.5.1

### Patch Changes

- [#1044](https://github.com/udecode/plate/pull/1044) [`b758cfb6`](https://github.com/udecode/plate/commit/b758cfb6ea955ab4d054c0873ab632aaf1c3e866) Thanks [@djagya](https://github.com/djagya)! - fix: normalize direct child nested list ul -> ul

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0
  - @udecode/plate-reset-node@3.4.0

## 3.2.1

### Patch Changes

- [#1015](https://github.com/udecode/plate/pull/1015) [`baddeb11`](https://github.com/udecode/plate/commit/baddeb117c1a13451f7f4da271ea441fafe3c02d) Thanks [@ericyip](https://github.com/ericyip)! - Fix first LIC normalize on paste

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0
  - @udecode/plate-reset-node@3.2.0

## 3.1.3

### Patch Changes

- [`d73b22d0`](https://github.com/udecode/plate/commit/d73b22d03a0fc270265cbd1bdecfcc4adc70b9d8) Thanks [@zbeyens](https://github.com/zbeyens)! - Fix list delete forward

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3
  - @udecode/plate-reset-node@3.1.3

## 3.1.2

### Patch Changes

- [#990](https://github.com/udecode/plate/pull/990) [`2906a0a4`](https://github.com/udecode/plate/commit/2906a0a45fa00b38a1e71ed8e3c57203f429db4d) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Fix nested list paste

## 3.0.4

### Patch Changes

- [#971](https://github.com/udecode/plate/pull/971) [`46398095`](https://github.com/udecode/plate/commit/4639809567e4c96d58912c2a16e74948474d4547) Thanks [@vimtor](https://github.com/vimtor)! - List plugin was preventing all tab key strokes without checking if a list item was being selected. Fix: Don't prevent tab if list is not selected.

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0
  - @udecode/plate-reset-node@2.0.0

## 1.1.8

### Patch Changes

- [#927](https://github.com/udecode/plate/pull/927) [`a3825e35`](https://github.com/udecode/plate/commit/a3825e3556e9980b8cce39d454aa4d3c8ea78586) Thanks [@zbeyens](https://github.com/zbeyens)! - partial fix pasting into lists, if the selection is in `li`:
  - `preInsert`: override the default (do not run `setNodes`)
  - filter out `ul` and `ol` from the fragment to paste only `li`
  - override `insertFragment` by `insertNodes`. Note that it implies that the first fragment node children will not be merged into the selected `li`.

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6
  - @udecode/plate-reset-node@1.1.6

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, install `@udecode/plate[-x]` then find and replace all
occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

> This is the last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Patch Changes

- Updated dependencies [[`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3)]:
  - @udecode/slate-plugins-core@1.0.0-next.61
  - @udecode/slate-plugins-common@1.0.0-next.61
  - @udecode/slate-plugins-reset-node@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59
  - @udecode/slate-plugins-reset-node@1.0.0-next.59

## 1.0.0-next.57

### Patch Changes

- [#858](https://github.com/udecode/slate-plugins/pull/858) [`5abacbc2`](https://github.com/udecode/slate-plugins/commit/5abacbc23af67f9388536f73076d026b89b24c5c) Thanks [@dylans](https://github.com/dylans)! - wrap toggleNode inside a withoutNormalizing call to prevent errors when inserting new lists

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56
  - @udecode/slate-plugins-reset-node@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55
  - @udecode/slate-plugins-reset-node@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- [#850](https://github.com/udecode/slate-plugins/pull/850) [`477bab57`](https://github.com/udecode/slate-plugins/commit/477bab572d943b21d3390c440f28e76074484a56) Thanks [@zbeyens](https://github.com/zbeyens)! - fix:
  - Indenting multiple list items was not working as expected
  - Normalizer: lists without list items are deleted
  - Unindent a list item should not delete the list at the first level
- Updated dependencies [[`bf693c13`](https://github.com/udecode/slate-plugins/commit/bf693c1327c3c6af0d641af5fe7a956e564a995e), [`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-reset-node@1.0.0-next.54
  - @udecode/slate-plugins-common@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-reset-node@1.0.0-next.53

## 1.0.0-next.51

### Patch Changes

- [#828](https://github.com/udecode/slate-plugins/pull/828) [`be3023db`](https://github.com/udecode/slate-plugins/commit/be3023db20dd3f57c704244aa432d41036b3cba9) Thanks [@zbeyens](https://github.com/zbeyens)! - fix:
  - Can't delete a list as first block
  - Deleting at the start of the first list item is deleting a character from the previous block

## 1.0.0-next.50

### Minor Changes

- [#824](https://github.com/udecode/slate-plugins/pull/824) [`92e19158`](https://github.com/udecode/slate-plugins/commit/92e19158fe6edf93c238e5de9727505967071b96) Thanks [@stephenkiers](https://github.com/stephenkiers)! - Allow `li` elements to be deleted, even when they are the first node

### Patch Changes

- Updated dependencies [[`92e19158`](https://github.com/udecode/slate-plugins/commit/92e19158fe6edf93c238e5de9727505967071b96)]:
  - @udecode/slate-plugins-reset-node@1.0.0-next.50

## 1.0.0-next.48

### Patch Changes

- [#817](https://github.com/udecode/slate-plugins/pull/817) [`a15ab621`](https://github.com/udecode/slate-plugins/commit/a15ab6217c6e2d4eb2a1320f6b76c483fc963047) Thanks [@whytspace](https://github.com/whytspace)! - add deserializer for `ELEMENT_LIC`

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-reset-node@1.0.0-next.46

## 1.0.0-next.43

### Minor Changes

- [#793](https://github.com/udecode/slate-plugins/pull/793) [`e70f8043`](https://github.com/udecode/slate-plugins/commit/e70f8043125d06161fa3ea5d47810749782e0a8a) Thanks [@dylans](https://github.com/dylans)! - Decouple changing of list-item depth from event handler

## 1.0.0-next.42

### Minor Changes

- [#787](https://github.com/udecode/slate-plugins/pull/787) [`e10f2fa4`](https://github.com/udecode/slate-plugins/commit/e10f2fa4963efdfef9e642a5125942c4819cfe9c) Thanks [@zbeyens](https://github.com/zbeyens)! - feat:
  - (shift+)tab will (un)indent the highest selected list items (multi blocks support)
  - Hotkeys support

### Patch Changes

- [#787](https://github.com/udecode/slate-plugins/pull/787) [`558a89da`](https://github.com/udecode/slate-plugins/commit/558a89da4217e9be57bc6ab2abcc48482c9f60bd) Thanks [@zbeyens](https://github.com/zbeyens)! - normalizer: set node with ELEMENT_LIC type to ELEMENT_DEFAULT if its parent type is not ELEMENT_LI

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40
  - @udecode/slate-plugins-reset-node@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39
  - @udecode/slate-plugins-reset-node@1.0.0-next.39

## 1.0.0-next.38

### Patch Changes

- [#751](https://github.com/udecode/slate-plugins/pull/751) [`f4c3b4fb`](https://github.com/udecode/slate-plugins/commit/f4c3b4fbe1f8c057f3f2d33ee4f8a6ae9768f9bf) Thanks [@dylans](https://github.com/dylans)! - fix: improve lic (list-item-content) normalization

- [#747](https://github.com/udecode/slate-plugins/pull/747) [`317f6205`](https://github.com/udecode/slate-plugins/commit/317f620598d19f2f9ebf01b4f92256bf0ca05097) Thanks [@dylans](https://github.com/dylans)! - Fix comments for list normalization

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37
  - @udecode/slate-plugins-reset-node@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36
  - @udecode/slate-plugins-reset-node@1.0.0-next.36

## 1.0.0-next.32

### Patch Changes

- [#713](https://github.com/udecode/slate-plugins/pull/713) [`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: added the core dep to avoid duplicated stores in the build

## 1.0.0-next.31

### Patch Changes

- [#702](https://github.com/udecode/slate-plugins/pull/702) [`15cdf5d7`](https://github.com/udecode/slate-plugins/commit/15cdf5d7614734c78c31f290586d0d64b0cff3fd) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: when unwrapping list, set node to paragraph instead of unwrapping `lic`

## 1.0.0-next.30

### Patch Changes

- [#694](https://github.com/udecode/slate-plugins/pull/694) [`84b5feed`](https://github.com/udecode/slate-plugins/commit/84b5feedd20b12f0ec23e082d90314b045a69e62) Thanks [@pubuzhixing8](https://github.com/pubuzhixing8)! - fix: list range deletion

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30
  - @udecode/slate-plugins-reset-node@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29
  - @udecode/slate-plugins-reset-node@1.0.0-next.29

## 1.0.0-next.27

### Patch Changes

- [#670](https://github.com/udecode/slate-plugins/pull/670) [`88d49713`](https://github.com/udecode/slate-plugins/commit/88d497138c2f8a1ce51af6910c5052b1ddf8dabc) Thanks [@ngfk](https://github.com/ngfk)! - unwrap and reset to default element when removing a list item (first element, non-nested)

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
  - @udecode/slate-plugins-reset-node@1.0.0-next.26
