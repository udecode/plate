# @udecode/plate-mention

## 21.4.1

## 21.3.5

### Patch Changes

- [#2430](https://github.com/udecode/plate/pull/2430) by [@bojangles-m](https://github.com/bojangles-m) – Render an empty node tag at block start

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.6.5

### Patch Changes

- [#2317](https://github.com/udecode/plate/pull/2317) by [@santialbo](https://github.com/santialbo) – Get right mention input type when overriden

## 20.4.0

## 20.3.2

## 20.3.1

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.3.0

### Patch Changes

- [#2166](https://github.com/udecode/plate/pull/2166) by [@OliverWales](https://github.com/OliverWales) – Add `query` option to mention plugin

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.10.3

### Patch Changes

- [#1999](https://github.com/udecode/plate/pull/1999) by [@O4epegb](https://github.com/O4epegb) – Fix mention espace keydown handler: it always prevents default on Escape but it should only happen when there is a mention input

## 18.9.0

## 18.7.0

## 18.6.0

## 18.5.1

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.5.0

## 16.3.0

## 16.2.3

## 16.2.0

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

## 13.4.2

### Patch Changes

- [#1622](https://github.com/udecode/plate/pull/1622) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Pass search to createMentionNode as metadata

## 13.4.1

## 13.4.0

### Minor Changes

- [#1615](https://github.com/udecode/plate/pull/1615) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Add support for pasting into mentions

### Patch Changes

- [#1619](https://github.com/udecode/plate/pull/1619) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Merge lines, strip whitespaces

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

## 10.6.0

## 10.5.3

## 10.5.2

## 10.5.0

## 10.4.5

### Patch Changes

- [#1461](https://github.com/udecode/plate/pull/1461) by [@karthikcodes6](https://github.com/karthikcodes6) – adds current mention creationId to fix opening the mention in multiple sessions

## 10.4.2

## 10.4.1

## 10.4.0

## 10.2.2

## 10.2.1

## 10.2.0

### Minor Changes

- [#1397](https://github.com/udecode/plate/pull/1397) by [@fakedarren](https://github.com/fakedarren) – Improvements to mentions behaviours:

  - pressing 'esc' will take you out of the mentions flow
  - improve undo behavior (fixes #1284, #1285)
  - fix entioning at the beginning of a line and before other text (fixes #1232)

## 10.1.2

## 10.1.1

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.1.0

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `getMentionInputPluginOptions` for `getPlugin`
  - `getMentionInputType` for `getPluginType`
  - `COMBOBOX_TRIGGER_MENTION`

## 7.0.2

## 7.0.1

### Patch Changes

- [#1201](https://github.com/udecode/plate/pull/1201) by [@zbeyens](https://github.com/zbeyens) – breaking changes (v7):

  - `getMentionOnSelectItem`:
    - is now using plugin options
    - removed `createMentionNode` in favor of plugin options
    - removed `insertSpaceAfterMention` in favor of plugin options

  feat:

  - `MentionPluginOptions` new properties:
    - `id`
    - `insertSpaceAfterMention`
    - `createMentionNode`

## 7.0.0

## 6.5.0

### Minor Changes

- [#1168](https://github.com/udecode/plate/pull/1168) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Inline mention proposal element instead of using whatever comes after a trigger.

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
  - @udecode/plate-combobox@5.3.5

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-combobox@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-combobox@5.3.0

## 5.2.3

### Patch Changes

- Updated dependencies [[`25b359a2`](https://github.com/udecode/plate/commit/25b359a23df79bc3b5f710fe9f58c4b549c72e75)]:
  - @udecode/plate-combobox@5.2.3

## 5.2.2

### Patch Changes

- Updated dependencies [[`b8f2f97b`](https://github.com/udecode/plate/commit/b8f2f97be28db3f0eb4e8e5222dabe5aa0c2fb3b)]:
  - @udecode/plate-combobox@5.2.2

## 5.2.1

### Patch Changes

- [#1117](https://github.com/udecode/plate/pull/1117) [`07d4df63`](https://github.com/udecode/plate/commit/07d4df63f8358cdf9dd34242e4ffb4eb5e4c4e73) Thanks [@dylans](https://github.com/dylans)! - changes:
  - customizable `createMentionNode`
  - missing default for `id`
- Updated dependencies [[`882308a8`](https://github.com/udecode/plate/commit/882308a81a5ed18669c8209d8b74d3fca76a4dd2)]:
  - @udecode/plate-combobox@5.2.1

## 5.2.0

### Minor Changes

- [#1116](https://github.com/udecode/plate/pull/1116) [`86837955`](https://github.com/udecode/plate/commit/86837955ebcdf7d93e10cdcfe3a97181611500bf) Thanks [@dylans](https://github.com/dylans)! - mention, reintroduce insertSpaceAfterMention, decouple id from pluginKey

### Patch Changes

- [#1112](https://github.com/udecode/plate/pull/1112) [`9910a511`](https://github.com/udecode/plate/commit/9910a511998649641e3938f3569eed1ded711842) Thanks [@dylans](https://github.com/dylans)! - `Mention`: `getMentionOnSelectItem` now receives an optional pluginKey

## 5.1.1

### Patch Changes

- Updated dependencies [[`73ca0d4e`](https://github.com/udecode/plate/commit/73ca0d4ef46c77423926721a6e14dc09cd45e45a)]:
  - @udecode/plate-combobox@5.1.1

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0
  - @udecode/plate-combobox@5.1.0

## 5.0.1

### Patch Changes

- Updated dependencies []:
  - @udecode/plate-combobox@5.0.1

## 5.0.0

### Major Changes

- [#1086](https://github.com/udecode/plate/pull/1086) [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8) Thanks [@zbeyens](https://github.com/zbeyens)! - The mention plugin is now using the combobox.
  - removed `useMentionPlugin` in favor of `createMentionPlugin`
    - migration: replace `useMentionPlugin().plugin` by `createMentionPlugin()`
  - removed options:
    - `mentionableSearchPattern`
    - `insertSpaceAfterMention`
    - `maxSuggestions`: moved to `comboboxStore`
    - `trigger`: moved to `comboboxStore`
    - `mentionables`: moved to `items` in `comboboxStore`
    - `mentionableFilter`: moved to `filter` in `comboboxStore`
  - removed `matchesTriggerAndPattern` in favor of `getTextFromTrigger`
  - removed `MentionNodeData` in favor of `TComboboxItem`
  ```ts
  export interface TComboboxItem {
    /**
     * Unique key.
     */
    key: string;
    /**
     * Item text.
     */
    text: any;
    /**
     * Whether the item is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Data available to `onRenderItem`.
     */
    data?: unknown;
  }
  ```

### Minor Changes

- [#1086](https://github.com/udecode/plate/pull/1086) [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8) Thanks [@zbeyens](https://github.com/zbeyens)! - feat:
  - dependency: `"@udecode/plate-combobox": "4.4.0"`
  - defaults: `COMBOBOX_TRIGGER_MENTION = '@'`
  - `getMentionOnSelectItem`

### Patch Changes

- Updated dependencies [[`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8)]:
  - @udecode/plate-combobox@5.0.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0
  - @udecode/plate-common@4.3.0

## 3.4.0

### Patch Changes

- Updated dependencies [[`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e)]:
  - @udecode/plate-common@3.1.3

## 2.0.0

### Patch Changes

- Updated dependencies [[`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532)]:
  - @udecode/plate-common@2.0.0

## 1.1.7

### Patch Changes

- [#920](https://github.com/udecode/plate/pull/920) [`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-common@1.1.6

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
> This is the last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Patch Changes

- Updated dependencies [[`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3)]:
  - @udecode/slate-plugins-core@1.0.0-next.61
  - @udecode/slate-plugins-common@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-common@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36

## 1.0.0-next.32

### Patch Changes

- [#713](https://github.com/udecode/slate-plugins/pull/713) [`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: added the core dep to avoid duplicated stores in the build

## 1.0.0-next.30

### Patch Changes

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29

## 1.0.0-next.28

### Patch Changes

- [#677](https://github.com/udecode/slate-plugins/pull/677) [`97d4cd29`](https://github.com/udecode/slate-plugins/commit/97d4cd29359000fa8bb104d8186210d7b8b0c461) Thanks [@Avizura](https://github.com/Avizura)! - add `setValueIndex` to `useMentionPlugin().getMentionSelectProps()`

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
