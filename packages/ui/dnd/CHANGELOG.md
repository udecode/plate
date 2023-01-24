# @udecode/plate-dnd

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.10.1

### Patch Changes

- [#1991](https://github.com/udecode/plate/pull/1991) by [@zbeyens](https://github.com/zbeyens) – fix

## 18.9.0

## 18.8.0

### Minor Changes

- [#1966](https://github.com/udecode/plate/pull/1966) by [@zbeyens](https://github.com/zbeyens) – dnd plugin - new options:
  - `enableScroller`: this adds a scroll area at the top and bottom of the window so the document scrolls when the mouse drags over. If you have another scroll container, you can either keep it disabled or override the props so the scroll areas are correctly positioned.
  - `scrollerProps`

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

- [`4d03e4a`](https://github.com/udecode/plate/commit/4d03e4a42318ed87531b831d585510fcef38f11f) by [@zbeyens](https://github.com/zbeyens) – `Draggable`: Set `gutterLeft` before the block to fix a selection bug.

## 16.5.0

### Patch Changes

- [#1832](https://github.com/udecode/plate/pull/1832) by [@zbeyens](https://github.com/zbeyens) – Fix: `DraggableProps.level` type accepts `null`

## 16.3.0

## 16.2.0

### Patch Changes

- [#1778](https://github.com/udecode/plate/pull/1778) by [@zbeyens](https://github.com/zbeyens) –
  - `withDraggable`: default `level` option is now 0 as expected

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.3

## 15.0.0

## 14.4.2

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.1.0

## 13.0.0

### Major Changes

- [#1585](https://github.com/udecode/plate/pull/1585) by [@zbeyens](https://github.com/zbeyens) – Moved `react-dnd react-dnd-html5-backend` deps to peer-dependencies. Install these if using `@udecode/plate-ui-dnd`:
  ```bash
  yarn install react-dnd react-dnd-html5-backend
  ```

## 12.0.0

### Major Changes

- [#1579](https://github.com/udecode/plate/pull/1579) by [@zbeyens](https://github.com/zbeyens) – renamed:
  - `useDndBlock` options:
    - `blockRef` -> `nodeRef`
    - `removePreview` -> `preview.disable`
  - `useDropBlockOnEditor` -> `useDropBlock`
  - `useDropBlock` options:
    - `blockRef` -> `nodeRef`
    - `setDropLine` -> `onChangeDropLine`
      signature change:
  - `getHoverDirection`:
  ```tsx
  // before
  (
    dragItem: DragItemBlock,
    monitor: DropTargetMonitor,
    ref: any,
    hoverId: string
  )
  // after
  {
    dragItem,
    id,
    monitor,
    nodeRef,
  }: GetHoverDirectionOptions
  ```

### Minor Changes

- [#1574](https://github.com/udecode/plate/pull/1574) by [@xakdog](https://github.com/xakdog) – `useDndBlock`: add `previewRef` option to customize the preview

- [#1579](https://github.com/udecode/plate/pull/1579) by [@zbeyens](https://github.com/zbeyens) –
  - `useDndNode`: `useDndBlock` with:
    - `type` option. Different types are needed to allow dnd in different structures like tables or lists.
    - `drag` options
    - `drop` options
    - `preview` options
  - `useDragNode`: `useDragBlock` with `type` option.
  - `useDropNode`: `useDropBlock` with `accept` option:
    - `onDropNode` called on drop
    - `onHoverNode` called on hover

## 11.2.1

### Patch Changes

- [#1567](https://github.com/udecode/plate/pull/1567) by [@zbeyens](https://github.com/zbeyens) –
  - upgrade deps:
    - `"react-dnd": "^16.0.1"`
    - `"react-dnd-html5-backend": "^16.0.1"`

## 11.2.0

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

### Minor Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – updated deps:
  ```bash
  "@react-hook/merged-ref": "^1.3.2",
  "@tippyjs/react": "^4.2.6",
  "react-dnd": "^15.1.2",
  "react-dnd-html5-backend": "^15.1.3"
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

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

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

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5
  - @udecode/plate-styled-components@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-styled-components@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e), [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-styled-components@5.3.0
  - @udecode/plate-common@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-styled-components@5.1.0

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

- [#920](https://github.com/udecode/plate/pull/920) [`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78)]:
  - @udecode/plate-styled-components@1.1.7

## 1.1.6

### Patch Changes

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6
  - @udecode/plate-styled-components@1.1.6

## 1.1.2

### Patch Changes

- [#888](https://github.com/udecode/plate/pull/888) [`08bff1b5`](https://github.com/udecode/plate/commit/08bff1b58fb879f67bf605fd08ad507ccc13f8f3) Thanks [@zbeyens](https://github.com/zbeyens)! - Fix peer deps

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

- [#840](https://github.com/udecode/slate-plugins/pull/840) [`1e9ba6d9`](https://github.com/udecode/slate-plugins/commit/1e9ba6d9bec22e279b84bb1dfa61cfeb8dd19683) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: `onDrop` is now working correctly with slate-react >=0.63. New plugin needs to be used: `createDndPlugin`

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-styled-components@1.0.0-next.53

## 1.0.0-next.52

### Patch Changes

- [#834](https://github.com/udecode/slate-plugins/pull/834) [`e99dc2db`](https://github.com/udecode/slate-plugins/commit/e99dc2db6c462a72d536843c48f1f0e5ed4fa410) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: drag button is always invisible

## 1.0.0-next.51

### Patch Changes

- Updated dependencies [[`0c02cee8`](https://github.com/udecode/slate-plugins/commit/0c02cee8cc7b105ab27a329882991d86253c0517)]:
  - @udecode/slate-plugins-styled-components@1.0.0-next.51

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.46

## 1.0.0-next.41

### Patch Changes

- [#777](https://github.com/udecode/slate-plugins/pull/777) [`786989d2`](https://github.com/udecode/slate-plugins/commit/786989d2b1263e2e3d40811649310af5de1a61c3) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: this package does not support slate-react > 0.62.1. Adjusted slate-react peerDependency to <= 0.62.1

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

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.26
