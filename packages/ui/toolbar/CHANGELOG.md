# @udecode/plate-toolbar

## 21.1.4

### Patch Changes

- [#2393](https://github.com/udecode/plate/pull/2393) by [@bojangles-m](https://github.com/bojangles-m) – New prop to BalloonToolbar `hideToolbar`: Handler to leave Balloon toolbar open or close after use to actionate the button. Default: false

## 21.1.2

### Patch Changes

- [#2382](https://github.com/udecode/plate/pull/2382) by [@zbeyens](https://github.com/zbeyens) – Fixes #2298

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.3.1

## 20.0.0

### Minor Changes

- [#2262](https://github.com/udecode/plate/pull/2262) by [@12joan](https://github.com/12joan) – Add `ignoreReadOnly` prop to BalloonToolbar

## 19.7.0

### Patch Changes

- [#2231](https://github.com/udecode/plate/pull/2231) by [@12joan](https://github.com/12joan) – Fix mark toolbar button not applying mark properly

## 19.6.0

### Minor Changes

- [#2212](https://github.com/udecode/plate/pull/2212) by [@TomMorane](https://github.com/TomMorane) –
  - default aria-label = tooltip content

### Patch Changes

- [#2212](https://github.com/udecode/plate/pull/2212) by [@TomMorane](https://github.com/TomMorane) –
  - Fixes #1603

## 19.5.0

### Minor Changes

- [#2202](https://github.com/udecode/plate/pull/2202) by [@zbeyens](https://github.com/zbeyens) – Replace onMouseDown by onClick. Add aria-label.

- [#2202](https://github.com/udecode/plate/pull/2202) by [@zbeyens](https://github.com/zbeyens) –

  - Replace arrow from true to false
  - Replace delay from 0 to 500
  - Replace <span> by <button>

- [#2202](https://github.com/udecode/plate/pull/2202) by [@zbeyens](https://github.com/zbeyens) – New prop: Handler to use to actionate the button. Default: onClick

## 19.4.4

## 19.4.2

### Patch Changes

- [#2187](https://github.com/udecode/plate/pull/2187) by [@zbeyens](https://github.com/zbeyens) – fix: replace `useEditorState` by `usePlateEditorState` to support nested editors.

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.12.1

### Patch Changes

- [#2027](https://github.com/udecode/plate/pull/2027) by [@bojangles-m](https://github.com/bojangles-m) – Feat/floating UI toolbar dropdown

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

## 16.5.0

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

### Minor Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - `FloatingVerticalDivider`
  - new dep:
    - `@udecode/plate-ui-button`

## 15.0.3

## 15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - remove `@udecode/plate-ui-popper` and `react-popper` deps for `@udecode/plate-floating`
  - `BalloonToolbarProps`:
    - removed `popperOptions` for `floatingOptions`
  - remove `useBalloonToolbarPopper` for `useFloatingToolbar`

### Patch Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #1434

## 14.4.2

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.1.0

## 11.2.1

## 11.2.0

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

### Patch Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – updated deps:
  ```bash
  "@tippyjs/react": "^4.2.6",
  "react-popper": "^2.3.0",
  "react-use": "^17.3.2"
  ```

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

## 10.1.0

## 10.0.0

### Major Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) – Before, `BalloonToolbar` could be outside `Plate`. Now, `BallonToolbar` should be a child of `Plate`.
  This fixes the multi editor bug.

### Patch Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) –
  - `BalloonToolbar`:
    - fix: hide when the editor is not focused.
    - fix: multiple editors can have a balloon toolbar.

## 9.3.1

## 9.3.0

## 9.2.1

### Patch Changes

- [#1341](https://github.com/udecode/plate/pull/1341) by [@zbeyens](https://github.com/zbeyens) – Fix components using `usePlateEditorState` by introducing `withEditor` / `EditorProvider` hoc

## 9.2.0

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

## 7.0.2

## 7.0.1

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) – renamed:
  - `ToolbarElement` to `BlockToolbarButton`
  - `ToolbarMark` to `MarkToolbarButton`

## 6.4.1

## 6.4.0

## 6.3.0

## 6.2.0

### Patch Changes

- [#1173](https://github.com/udecode/plate/pull/1173) by [@zbeyens](https://github.com/zbeyens) – Replace `import * as React` by `import React`

## 6.1.0

## 6.0.0

## 5.3.5

### Patch Changes

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5
  - @udecode/plate-popper@5.3.5
  - @udecode/plate-styled-components@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-popper@5.3.1
  - @udecode/plate-styled-components@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e), [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-styled-components@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-popper@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-popper@5.1.0
  - @udecode/plate-styled-components@5.1.0

## 5.0.1

### Patch Changes

- [#1103](https://github.com/udecode/plate/pull/1103) [`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec) Thanks [@zbeyens](https://github.com/zbeyens)! - fix infinite loop happening when selecting text with the balloon toolbar

- Updated dependencies [[`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec), [`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec)]:
  - @udecode/plate-popper@5.0.1

## 5.0.0

### Major Changes

- [#1086](https://github.com/udecode/plate/pull/1086) [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8) Thanks [@zbeyens](https://github.com/zbeyens)! - changes:
  - removed `setPositionAtSelection` in favor of `useBalloonToolbarPopper`
  - removed `useBalloonMove` in favor of `useBalloonToolbarPopper`
  - removed `usePopupPosition` in favor of `useBalloonToolbarPopper`
  - removed `useBalloonShow` in favor of `useBalloonToolbarPopper`
    `BalloonToolbar` props:
  - removed `direction` in favor of `popperOptions.placement`
  - renamed `scrollContainer` to `popperContainer`

### Minor Changes

- [#1086](https://github.com/udecode/plate/pull/1086) [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8) Thanks [@zbeyens](https://github.com/zbeyens)! - `BalloonToolbar`
  - new prop `popperOptions`: allow overriding `usePopper` options
  - now uses `useBalloonToolbarPopper`

### Patch Changes

- Updated dependencies [[`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8)]:
  - @udecode/plate-popper@5.0.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0
  - @udecode/plate-styled-components@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7
  - @udecode/plate-styled-components@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0
  - @udecode/plate-styled-components@4.3.0

## 4.2.0

### Patch Changes

- [#1058](https://github.com/udecode/plate/pull/1058) [`ea693250`](https://github.com/udecode/plate/commit/ea6932504e1639f38a28c177ac0ef7de5b9ea79d) Thanks [@ghingis](https://github.com/ghingis)! - fix:
  - `BlockToolbarButton` now uses the provided `active` prop

## 4.0.0

### Major Changes

- [#1048](https://github.com/udecode/plate/pull/1048) [`d5667409`](https://github.com/udecode/plate/commit/d5667409e4e53b4b41a14335a7298c260c52019e) Thanks [@karthikcodes6](https://github.com/karthikcodes6)! - Removed `hiddenDelay` prop from `BalloonToolbar` component.

### Minor Changes

- [#1048](https://github.com/udecode/plate/pull/1048) [`a899c585`](https://github.com/udecode/plate/commit/a899c5850fbe09792113b2b3f4787d869568427d) Thanks [@karthikcodes6](https://github.com/karthikcodes6)! - added:
  - `usePopupPosition` hook to position the hovering popup correctly even in the nested scroll, this hook using `react-popper` internally and user can pass modifiers, placements to customise the behaviour
  - transition for showing the balloon toolbar smoothly.
  - `scrollContainer` prop to the BalloonToolbar as well.

## 3.5.1

### Patch Changes

- Updated dependencies [[`0db393e1`](https://github.com/udecode/plate/commit/0db393e1cebec792c89a633cb8929a0786943713)]:
  - @udecode/plate-styled-components@3.5.1

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0
  - @udecode/plate-styled-components@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0
  - @udecode/plate-styled-components@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3
  - @udecode/plate-styled-components@3.1.3

## 3.1.0

### Minor Changes

- [#980](https://github.com/udecode/plate/pull/980) [`a1600e5f`](https://github.com/udecode/plate/commit/a1600e5f8cf1a1b4aa6a88048063431ecafbf766) Thanks [@cungminh2710](https://github.com/cungminh2710)! - `BalloonToolbar` – New prop: `portalElement` used to customize the `Portal` container

### Patch Changes

- Updated dependencies [[`03f2acdd`](https://github.com/udecode/plate/commit/03f2acdd1b34d1e4e574bcf296ae5b4796930c9a)]:
  - @udecode/plate-styled-components@3.1.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`885a7799`](https://github.com/udecode/plate/commit/885a77995619c99293403b4a7ee0019eecf3dfd0)]:
  - @udecode/plate-styled-components@3.0.1

## 3.0.0

### Major Changes

- [#955](https://github.com/udecode/plate/pull/955) [`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed) Thanks [@zbeyens](https://github.com/zbeyens)! - WHAT: moved `styled-components` from dependencies to peer dependencies.
  WHY: there was multiple instances of `styled-components` across all the packages.
  HOW: make sure to have `styled-components` in your dependencies.

### Patch Changes

- Updated dependencies [[`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed)]:
  - @udecode/plate-styled-components@3.0.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0
  - @udecode/plate-styled-components@2.0.0

## 1.1.7

### Patch Changes

- Updated dependencies [[`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78)]:
  - @udecode/plate-styled-components@1.1.7

## 1.1.6

### Patch Changes

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6
  - @udecode/plate-styled-components@1.1.6

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
  - @udecode/slate-plugins-styled-components@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59
  - @udecode/slate-plugins-styled-components@1.0.0-next.59

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56
  - @udecode/slate-plugins-styled-components@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55
  - @udecode/slate-plugins-styled-components@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`f9e4cb95`](https://github.com/udecode/slate-plugins/commit/f9e4cb9505837dd7ba59df3f2598f7ed112d8896), [`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-styled-components@1.0.0-next.54
  - @udecode/slate-plugins-common@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-styled-components@1.0.0-next.53

## 1.0.0-next.51

### Patch Changes

- Updated dependencies [[`0c02cee8`](https://github.com/udecode/slate-plugins/commit/0c02cee8cc7b105ab27a329882991d86253c0517)]:
  - @udecode/slate-plugins-styled-components@1.0.0-next.51

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.46

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.39

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.36

## 1.0.0-next.30

### Patch Changes

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.30

## 1.0.0-next.29

### Minor Changes

- [#668](https://github.com/udecode/slate-plugins/pull/668) [`f1e6107c`](https://github.com/udecode/slate-plugins/commit/f1e6107cb1cd082f44bd48252fce0eefd576037c) Thanks [@zbeyens](https://github.com/zbeyens)! - The components/hooks can now be outside `SlatePlugins` and need the
  editor to be focused once to be functional.

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies []:
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.26
