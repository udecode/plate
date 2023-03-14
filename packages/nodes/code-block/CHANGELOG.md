# @udecode/plate-code-block

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.3

### Patch Changes

- [#2183](https://github.com/udecode/plate/pull/2183) by [@12joan](https://github.com/12joan) – Ignore defaultPrevented keydown event

## 19.4.2

## 19.3.0

### Minor Changes

- [#2167](https://github.com/udecode/plate/pull/2167) by [@12joan](https://github.com/12joan) – Add isCodeBlockEmpty and isSelectionAtCodeBlockStart queries for use with the reset node plugin

### Patch Changes

- [#2163](https://github.com/udecode/plate/pull/2163) by [@12joan](https://github.com/12joan) – Various fixes relating to code block

## 19.2.0

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

## 18.9.2

### Patch Changes

- [#1911](https://github.com/udecode/plate/pull/1911) by [@charrondev](https://github.com/charrondev) – Ensure children of code blocks are always normalized into code lines

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

### Major Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –
  - Removed these imports because of build errors:
    - `prismjs/components/prism-django`
    - `prismjs/components/prism-ejs`
    - `prismjs/components/prism-php`

## 16.8.0

## 16.5.0

## 16.3.0

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

### Patch Changes

- [#1420](https://github.com/udecode/plate/pull/1420) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Fix code block syntax highlight

## 10.1.2

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

### Patch Changes

- [#1358](https://github.com/udecode/plate/pull/1358) by [@jyc5131](https://github.com/jyc5131) – fix: "decorateCodeLine don't check the path of nodeEntry" when adding a code block

## 9.2.1

## 9.2.0

### Patch Changes

- [#1338](https://github.com/udecode/plate/pull/1338) by [@zbeyens](https://github.com/zbeyens) – Swap ast and html plugin order

- [#1334](https://github.com/udecode/plate/pull/1334) by [@Pedrobusou](https://github.com/Pedrobusou) – prevent extra nodes from being copy pasted

## 9.0.0

### Minor Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - `deserializeHtml`:
    - added a rule: `<p>` nodes with `fontFamily: 'Consolas'`

## 8.3.0

## 8.1.0

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `getCodeBlockPluginOptions` for `getPlugin`
  - `getCodeLinePluginOptions` for `getPlugin`

## 7.0.2

## 7.0.1

## 7.0.0

## 6.4.1

## 6.4.0

## 6.3.0

## 6.2.0

## 6.1.0

## 6.0.0

### Patch Changes

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – fix: `codeBlock` is undefined

## 5.3.5

### Patch Changes

- [#1148](https://github.com/udecode/plate/pull/1148) [`25dcad65`](https://github.com/udecode/plate/commit/25dcad654b8297a50c905cc427a59e68c0ff8093) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Limit disabling deserialization only when selection in code line.

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5
  - @udecode/plate-ast-serializer@5.3.5
  - @udecode/plate-html-serializer@5.3.5

## 5.3.4

### Patch Changes

- [#1101](https://github.com/udecode/plate/pull/1101) [`9b61b9d5`](https://github.com/udecode/plate/commit/9b61b9d5a631c9b0e14dfd081f70a633a3c0b436) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Strong typing of code block options, refactor options usage to use concrete code block/code line types.

- [#1101](https://github.com/udecode/plate/pull/1101) [`a574a753`](https://github.com/udecode/plate/commit/a574a7537f7a4a25bb6a527a08ad6698da1dc7b1) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Fix code block paste when selection is expanded.

- Updated dependencies []:
  - @udecode/plate-ast-serializer@5.3.4
  - @udecode/plate-html-serializer@5.3.4

## 5.3.1

### Patch Changes

- [#1136](https://github.com/udecode/plate/pull/1136) [`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118) Thanks [@dylans](https://github.com/dylans)! - allow disabling deserializer by paste target

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-ast-serializer@5.3.1
  - @udecode/plate-html-serializer@5.3.1
  - @udecode/plate-common@5.3.1

## 5.3.0

### Patch Changes

- [#1131](https://github.com/udecode/plate/pull/1131) [`5c68eb04`](https://github.com/udecode/plate/commit/5c68eb04b5f528d08d45a4f994ef8c1d7924ab33) Thanks [@bensquire](https://github.com/bensquire)! - Adds language class to codeblock <code> element, this enable language specifix syntax highlighting.

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-common@5.1.0

## 4.4.0

### Patch Changes

- [#1090](https://github.com/udecode/plate/pull/1090) [`7c32d4ef`](https://github.com/udecode/plate/commit/7c32d4efc0e84f6e2878473a3dd0efad3740ba9e) Thanks [@dylans](https://github.com/dylans)! - Add configuration options for code-block syntax highlighting

- Updated dependencies [[`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-common@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-common@4.3.7

## 4.3.5

### Patch Changes

- [#1081](https://github.com/udecode/plate/pull/1081) [`8525af01`](https://github.com/udecode/plate/commit/8525af01b2ca705665bad3ada73b8e906620dad8) Thanks [@dylans](https://github.com/dylans)! - Fix check for language attribute for syntax highlighting

## 4.3.1

### Patch Changes

- [#1072](https://github.com/udecode/plate/pull/1072) [`a692c078`](https://github.com/udecode/plate/commit/a692c078f9386ebb63aea9cb704decf554b07e8e) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - Pasting into a code block always adds codelines. All non code blocks are converted to text.

## 4.3.0

### Minor Changes

- [#1055](https://github.com/udecode/plate/pull/1055) [`7b892a59`](https://github.com/udecode/plate/commit/7b892a59f27bdaa81c90097534c411cc80b92e8a) Thanks [@dylans](https://github.com/dylans)! - changes:
  - enable syntax highlighting for `code_block`
  - new prop to `code_block` node: `lang?: string`

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

- [#699](https://github.com/udecode/slate-plugins/pull/699) [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: support paragraph custom type

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
