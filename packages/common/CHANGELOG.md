# @udecode/plate-common

## 6.0.0

### Minor Changes

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – `unsetNodes`

### Patch Changes

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – fix: EditorNodesOptions `at` option

## 5.3.5

### Patch Changes

- [#1146](https://github.com/udecode/plate/pull/1146) [`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf) Thanks [@ghingis](https://github.com/ghingis)! - fix: `isRangeAcrossBlocks` when one of the edges is in an inline element

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1

## 5.3.0

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0

## 5.1.0

### Patch Changes

- [#1105](https://github.com/udecode/plate/pull/1105) [`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a) Thanks [@aj-foster](https://github.com/aj-foster)! - Allow options passed to isSelectionAtBlockStart

## 4.4.0

### Minor Changes

- [#1085](https://github.com/udecode/plate/pull/1085) [`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37) Thanks [@ghingis](https://github.com/ghingis)! - `removeMark`:
  - `key` can be an array (to remove multiple marks)
  - `options` are extended so we can use other location than `editor.selection`

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7

## 4.3.0

### Patch Changes

- Updated dependencies [[`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-core@4.3.0

## 3.4.0

### Patch Changes

- [#1027](https://github.com/udecode/plate/pull/1027) [`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085) Thanks [@ghingis](https://github.com/ghingis)! - fix: `findNode` option `at` was ignored

- Updated dependencies [[`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-core@3.4.0

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- Updated dependencies [[`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4)]:
  - @udecode/plate-core@3.2.0

## 3.1.3

### Patch Changes

- [#1002](https://github.com/udecode/plate/pull/1002) [`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e) Thanks [@nemanja-tosic](https://github.com/nemanja-tosic)! - `isSelectionAtBlockEnd` should always return a boolean

## 2.0.0

### Patch Changes

- [#939](https://github.com/udecode/plate/pull/939) [`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532) Thanks [@zbeyens](https://github.com/zbeyens)! - fix:
  - `getPointBefore`: it's now doing a strict equality between the lookup text and `matchString` instead of `includes`

## 1.1.6

### Patch Changes

- [#918](https://github.com/udecode/plate/pull/918) [`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b) Thanks [@zbeyens](https://github.com/zbeyens)! - add `slate-history` as a peerDep

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, install `@udecode/plate[-x]` then find and replace all
occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

> The **Slate Plugins** project has evolved to **Plate**. This is the
> last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Patch Changes

- Updated dependencies [[`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3)]:
  - @udecode/slate-plugins-core@1.0.0-next.61

## 1.0.0-next.59

### Patch Changes

- [#866](https://github.com/udecode/slate-plugins/pull/866) [`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22) Thanks [@zbeyens](https://github.com/zbeyens)! - HTML deserializer with `'*'` style rule was inserting empty fields (e.g. color) on each paste. Fixed by not allowing empty styles to be deserialized.

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55

## 1.0.0-next.54

### Minor Changes

- [#844](https://github.com/udecode/slate-plugins/pull/844) [`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29) Thanks [@ghingis](https://github.com/ghingis)! - features:
  - `getNodeDeserializer` now supports dynamic style rules by providing an asterisk instead of an exact value
  - `isMarkActive`: returns true if the mark value is defined (before: returns true if the mark value is true)
  - `getMark`(new): Get selected mark by type
  - `setMarks`(new): Set marks to selected text.

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-core@1.0.0-next.53

## 1.0.0-next.46

### Minor Changes

- [#807](https://github.com/udecode/slate-plugins/pull/807) [`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b) Thanks [@zbeyens](https://github.com/zbeyens)! - `selectEditor`: Select an editor at a target or an edge (start, end).

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39

## 1.0.0-next.37

### Major Changes

- [#734](https://github.com/udecode/slate-plugins/pull/734) [`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c) Thanks [@cawabunga](https://github.com/cawabunga)! - changes:
  - BREAKING CHANGE: `normalizeDescendantsToDocumentFragment` parameters are now: `(editor, { descendants })`. Used by the HTML deserializer.
  - fix: Handles 1st constraint: "All Element nodes must contain at least one Text descendant."
  - fix: Handles 3rd constraint: "Block nodes can only contain other blocks, or inline and text nodes."

## 1.0.0-next.36

### Patch Changes

- [#731](https://github.com/udecode/slate-plugins/pull/731) [`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: `getLastNode` returns undefined when the editor has no children

- Updated dependencies [[`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-core@1.0.0-next.36

## 1.0.0-next.30

### Patch Changes

- [#699](https://github.com/udecode/slate-plugins/pull/699) [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: support paragraph custom type

- Updated dependencies [[`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-core@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3)]:
  - @udecode/slate-plugins-core@1.0.0-next.29

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
