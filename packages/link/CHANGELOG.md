# @udecode/plate-link

## 25.0.1

## 25.0.0

## 24.5.2

## 24.5.1

### Patch Changes

- [#2705](https://github.com/udecode/plate/pull/2705) by [@AndreyMarchuk](https://github.com/AndreyMarchuk) – Fix: "Cannot resolve a DOM node from Slate node" floating link case

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

## 23.5.0

### Minor Changes

- [#2585](https://github.com/udecode/plate/pull/2585) by [@zbeyens](https://github.com/zbeyens) – `LinkFloatingToolbar`:

  - soft br: `useVirtualFloatingLink` removed `placement` and `middleware` default values from floating options.
  - refactor: `useFloatingLinkEdit` and `useFloatingLinkEditState`
  - refactor: `useFloatingLinkInsert` and `useFloatingLinkInsertState`
  - feat: `useFloatingLinkInsert` return new field: `hidden`

## 23.4.0

### Patch Changes

- [#2579](https://github.com/udecode/plate/pull/2579) by [@zbeyens](https://github.com/zbeyens) – Add missing dependency `@udecode/plate-floating`

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `FloatingLink`
  - `FloatingLinkEditButton`
  - `FloatingLinkTextInput`
  - `UnlinkButton`
  - `LaunchIcon`
  - `Link`
  - `LinkIcon`
  - `LinkOffIcon`
  - `ShortTextIcon`

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New hooks:

  - `useLink`
  - `useLinkToolbarButton`

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New exports:
  - `useListToolbarButton`
  - `useTodoListElement`
  - `someList`

## 21.5.0

## 21.4.2

### Patch Changes

- [#2453](https://github.com/udecode/plate/pull/2453) by [@dimaanj](https://github.com/dimaanj) – `LinkPlugin` - new option:
  - `keepSelectedTextOnPaste`: Allow pasting links as urls

## 21.4.1

## 21.4.0

### Minor Changes

- [#2441](https://github.com/udecode/plate/pull/2441) by [@vevsindre](https://github.com/vevsindre) – Added option to skip link sanitation

## 21.3.2

## 21.3.0

## 21.2.0

### Minor Changes

- [#2405](https://github.com/udecode/plate/pull/2405) by [@12joan](https://github.com/12joan) –
  - New link plugin option `defaultLinkAttributes?: AnchorHTMLAttributes<HTMLAnchorElement>`
  - Avoid returning `undefined` from `getLinkAttributes`, since this overrides other values

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.1

### Patch Changes

- [#2296](https://github.com/udecode/plate/pull/2296) by [@bojangles-m](https://github.com/bojangles-m) – fix target for new tab

## 20.4.0

## 20.3.2

## 20.0.0

### Major Changes

- [#2240](https://github.com/udecode/plate/pull/2240) by [@OliverWales](https://github.com/OliverWales) –
  - Add `allowedSchemes` plugin option
    - Any URL schemes other than `http(s)`, `mailto` and `tel` must be added to `allowedSchemes`, otherwise they will not be included in links

### Minor Changes

- [#2240](https://github.com/udecode/plate/pull/2240) by [@OliverWales](https://github.com/OliverWales) –
  - `upsertLink`:
    - Removed `isUrl`
    - Added `skipValidation`
  - Check that URL scheme is valid when:
    - Upserting links
    - Deserializing links from HTL
    - Passing `href` to `nodeProps`
    - Rendering the `OpenLinkButton` in `FloatingLink`

## 19.7.0

### Patch Changes

- [#2225](https://github.com/udecode/plate/pull/2225) by [@TomMorane](https://github.com/TomMorane) – fix: hotkey

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

### Patch Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - fix import

## 18.11.0

### Patch Changes

- [#2005](https://github.com/udecode/plate/pull/2005) by [@O4epegb](https://github.com/O4epegb) – Fix link hotkey prevent default

## 18.9.1

### Patch Changes

- [#1981](https://github.com/udecode/plate/pull/1981) by [@O4epegb](https://github.com/O4epegb) – Fix floating link escape handling

## 18.9.0

### Patch Changes

- [#1976](https://github.com/udecode/plate/pull/1976) by [@O4epegb](https://github.com/O4epegb) – Fixes #1771

## 18.8.1

### Patch Changes

- [#1970](https://github.com/udecode/plate/pull/1970) by [@O4epegb](https://github.com/O4epegb) –
  - Fixes #1771
  - Fixes #1967

## 18.7.0

## 18.6.0

### Patch Changes

- [#1955](https://github.com/udecode/plate/pull/1955) by [@zbeyens](https://github.com/zbeyens) –
  - feat:`LinkPlugin` new option `forceSubmit?: boolean`. When true and inserting a link, `enter` key should submit even when url is invalid
  - fix: when inserting a link, `enter` key should now submit even another key is pressed
  - fix: hotkey to trigger floating link (`cmd+k` by default) should prevent default

## 18.2.0

## 18.1.1

## 18.1.0

### Minor Changes

- [#1892](https://github.com/udecode/plate/pull/1892) by [@zakishaheen](https://github.com/zakishaheen) – Wrap valid link in anchor element when inserting a break

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.9.1

### Patch Changes

- [#1868](https://github.com/udecode/plate/pull/1868) by [@rawi96](https://github.com/rawi96) –
  - `upsertLink()` Set nodes also if only the link target has changed.

## 16.9.0

### Minor Changes

- [#1865](https://github.com/udecode/plate/pull/1865) by [@rawi96](https://github.com/rawi96) –
  - `TLinkElement` new optional prop `target`: allows you to control the link `target` attribute. Default is `undefined` (`_blank`).

## 16.8.0

## 16.5.0

## 16.3.0

## 16.2.2

### Patch Changes

- [#1783](https://github.com/udecode/plate/pull/1783) by [@zbeyens](https://github.com/zbeyens) – fix: https://github.com/udecode/editor-protocol/issues/70

## 16.2.1

### Patch Changes

- [#1765](https://github.com/udecode/plate/pull/1765) by [@zbeyens](https://github.com/zbeyens) – fix:
  - overall, marks should be kept on link insert/edit
  - `unwrapLink`: new option `split`
    - if true: split the link above anchor/focus before unwrapping
  - `upsertLink`:
    - replaced `update` option by `insertTextInLink`: if true, insert text when selection is in url
    - `upsertLinkText`: If the text is different than the link above text, replace link children by a new text. The new text has the same marks than the first text replaced.
  - specs:
    - https://github.com/udecode/editor-protocol/issues/47
    - https://github.com/udecode/editor-protocol/issues/50
    - https://github.com/udecode/editor-protocol/issues/58
    - https://github.com/udecode/editor-protocol/issues/59
    - https://github.com/udecode/editor-protocol/issues/60

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.5

### Patch Changes

- [#1715](https://github.com/udecode/plate/pull/1715) by [@tmilewski](https://github.com/tmilewski) – Fix FloatingLinkUrlInput snapping to the previous location on show and to the bottom of the editor upon clicking outside of the element

## 15.0.3

## 15.0.1

### Patch Changes

- [#1697](https://github.com/udecode/plate/pull/1697) by [@zbeyens](https://github.com/zbeyens) – fix: copy/paste was blocked by the link plugin. Now it should work when the data is not a url and not inserted into a link

## 15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - `createLinkPlugin`
    - removed `onKeyDownLink` for floating link
    - removed `hotkey` for `triggerFloatingLinkHotkeys`
  - removed:
    - `getAndUpsertLink` for `upsertLink`
    - `upsertLinkAtSelection` for `upsertLink`
  - `LinkToolbarButton`:
    - `onClick` now calls `triggerFloatingLink`

### Minor Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –

  - new dep:
    - `@udecode/plate-button`
  - new unstyled components + props hooks:
    - `PlateFloatingLink`
    - `LinkRoot`
    - `FloatingLink`
    - `FloatingLinkEditRoot`
    - `FloatingLinkInsertRoot`
    - `FloatingLinkUrlInput`
    - `FloatingLinkTextInput`
    - `FloatingLinkEditButton`
    - `UnlinkButton`
    - `OpenLinkButton`
  - new store: `floatingLinkStore`
  - `LinkPlugin` new props:
    - `triggerFloatingLinkHotkeys`: Hotkeys to trigger floating link. Default is 'command+k, ctrl+k'
  - new utils:
    - `insertLink`
    - `submitFloatingLink`
    - `unwrapLink`
    - `upsertLink`
    - `createLinkNode`
    - `triggerFloatingLink`
    - `triggerFloatingLinkEdit`
    - `triggerFloatingLinkInsert`

  Specs:

  - Insert data:
    - https://github.com/udecode/editor-protocol/issues/34
    - https://github.com/udecode/editor-protocol/issues/35
    - https://github.com/udecode/editor-protocol/issues/36
    - https://github.com/udecode/editor-protocol/issues/37
    - https://github.com/udecode/editor-protocol/issues/38
    - https://github.com/udecode/editor-protocol/issues/43
  - Insert space:
    - https://github.com/udecode/editor-protocol/issues/39
    - https://github.com/udecode/editor-protocol/issues/40
    - https://github.com/udecode/editor-protocol/issues/41
    - https://github.com/udecode/editor-protocol/issues/42
  - Floating link:
    - https://github.com/udecode/editor-protocol/issues/45
    - https://github.com/udecode/editor-protocol/issues/48
    - https://github.com/udecode/editor-protocol/issues/51
    - https://github.com/udecode/editor-protocol/issues/60
  - Floating link insert:
    - https://github.com/udecode/editor-protocol/issues/44
    - https://github.com/udecode/editor-protocol/issues/46
    - https://github.com/udecode/editor-protocol/issues/47
    - https://github.com/udecode/editor-protocol/issues/49
    - https://github.com/udecode/editor-protocol/issues/50
  - Floating link edit:
    - https://github.com/udecode/editor-protocol/issues/54
    - https://github.com/udecode/editor-protocol/issues/55
    - https://github.com/udecode/editor-protocol/issues/56
    - https://github.com/udecode/editor-protocol/issues/57
    - https://github.com/udecode/editor-protocol/issues/58
    - https://github.com/udecode/editor-protocol/issues/59
    - https://github.com/udecode/editor-protocol/issues/61
  - Selection:
    - https://github.com/udecode/editor-protocol/issues/52
    - https://github.com/udecode/editor-protocol/issues/53

### Patch Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #1580
  - Fixes #1542
  - Fixes #1194
  - Fixes #712

## 14.4.2

## 14.4.1

### Patch Changes

- [#1687](https://github.com/udecode/plate/pull/1687) by [@davisg123](https://github.com/davisg123) – Allow the link plugin to optionally specify a custom href for link text

## 14.4.0

### Patch Changes

- [#1685](https://github.com/udecode/plate/pull/1685) by [@davisg123](https://github.com/davisg123) – Allow the link plugin to optionally specify a custom href for link text

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

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.0.0

## 8.3.0

### Patch Changes

- [#1257](https://github.com/udecode/plate/pull/1257) by [@tjramage](https://github.com/tjramage) –
  - fix link upsert on space
  - `getPointBefore`: will return early if the point before is in another block. Removed `multiPaths` option as it's not used anymore.

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
  - @udecode/plate-normalizers@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-normalizers@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-normalizers@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-normalizers@5.1.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0
  - @udecode/plate-normalizers@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7
  - @udecode/plate-normalizers@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0
  - @udecode/plate-normalizers@4.3.0

## 4.0.0

### Minor Changes

- [#1052](https://github.com/udecode/plate/pull/1052) [`22da824e`](https://github.com/udecode/plate/commit/22da824e9acea62cbd9073a150b543348a1b128b) Thanks [@aj-foster](https://github.com/aj-foster)! - Add keyboard shortcut for inserting a link at the current selection

## 3.5.0

### Minor Changes

- [#1041](https://github.com/udecode/plate/pull/1041) [`7ab01674`](https://github.com/udecode/plate/commit/7ab016745c5eddcf4daa73bbc1958f087d0c4b90) Thanks [@aj-foster](https://github.com/aj-foster)! - feat(link): Unwrap selected links when pasting a URL. Previously, pasting any text (including a URL) with an existing link selected would insert plain text. With this change, pasting a URL will unwrap any selected links and wrap a new link.

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0
  - @udecode/plate-normalizers@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0
  - @udecode/plate-normalizers@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3
  - @udecode/plate-normalizers@3.1.3

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0
  - @udecode/plate-normalizers@2.0.0

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6
  - @udecode/plate-normalizers@1.1.6

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
  - @udecode/slate-plugins-normalizers@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59
  - @udecode/slate-plugins-normalizers@1.0.0-next.59

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56
  - @udecode/slate-plugins-normalizers@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55
  - @udecode/slate-plugins-normalizers@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-common@1.0.0-next.54
  - @udecode/slate-plugins-normalizers@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-normalizers@1.0.0-next.53

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-normalizers@1.0.0-next.46

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40
  - @udecode/slate-plugins-normalizers@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39
  - @udecode/slate-plugins-normalizers@1.0.0-next.39

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37
  - @udecode/slate-plugins-normalizers@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36
  - @udecode/slate-plugins-normalizers@1.0.0-next.36

## 1.0.0-next.32

### Patch Changes

- [#713](https://github.com/udecode/slate-plugins/pull/713) [`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: added the core dep to avoid duplicated stores in the build

## 1.0.0-next.30

### Patch Changes

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30
  - @udecode/slate-plugins-normalizers@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29
  - @udecode/slate-plugins-normalizers@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
  - @udecode/slate-plugins-normalizers@1.0.0-next.26
