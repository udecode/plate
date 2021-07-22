# @udecode/plate-html-serializer

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, install `@udecode/plate[-x]` then find and replace all
occurrences of:
- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

>  This is the last version of `@udecode/slate-plugins[-x]`, please install
>  `@udecode/plate[-x]`.

### Major Changes

- [#869](https://github.com/udecode/slate-plugins/pull/869) [`fd91359d`](https://github.com/udecode/slate-plugins/commit/fd91359dc3722292cee06e0f80ed414934b27572) Thanks [@zbeyens](https://github.com/zbeyens)! - Removed `getFragment` and `insert` option in favor of the new plugin options.

### Patch Changes

- Updated dependencies [[`546ee49b`](https://github.com/udecode/slate-plugins/commit/546ee49b1e22464a8a0c0fad7f254da85bcfde3d), [`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3)]:
  - @udecode/slate-plugins-serializer@1.0.0-next.61
  - @udecode/slate-plugins-core@1.0.0-next.61
  - @udecode/slate-plugins-common@1.0.0-next.61

## 1.0.0-next.60

### Minor Changes

- [#864](https://github.com/udecode/slate-plugins/pull/864) [`37a52994`](https://github.com/udecode/slate-plugins/commit/37a529945a882adb0222b47a28466dd31286a354) Thanks [@dylans](https://github.com/dylans)! - Refactor insert for deserializers

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59

## 1.0.0-next.58

### Patch Changes

- [#860](https://github.com/udecode/slate-plugins/pull/860) [`db6371c3`](https://github.com/udecode/slate-plugins/commit/db6371c36e389cb03901a119194dd93652134554) Thanks [@dylans](https://github.com/dylans)! - wrap paste deserialization in withoutNormalization block to prevent paste errors

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

## 1.0.0-next.48

### Minor Changes

- [#821](https://github.com/udecode/slate-plugins/pull/821) [`091f0940`](https://github.com/udecode/slate-plugins/commit/091f0940bd3c06c3dfaf49a4ab14eb611678637d) Thanks [@dylans](https://github.com/dylans)! - If empty fragment, eject from deserializer

## 1.0.0-next.47

### Minor Changes

- [#813](https://github.com/udecode/slate-plugins/pull/813) [`2d671565`](https://github.com/udecode/slate-plugins/commit/2d67156509ca8689aede2d4a9a45f749772c789c) Thanks [@dylans](https://github.com/dylans)! - Fix ast-deserialize insert, minor cleanup to html/md deserializer

- [#814](https://github.com/udecode/slate-plugins/pull/814) [`1bbdae38`](https://github.com/udecode/slate-plugins/commit/1bbdae389e7ec3ec7a54877526055a9464e46fdf) Thanks [@dylans](https://github.com/dylans)! - allow override of fragment root for deserializers

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

- [#734](https://github.com/udecode/slate-plugins/pull/734) [`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c) Thanks [@cawabunga](https://github.com/cawabunga)! - changes:

  - BREAKING CHANGE: `normalizeDescendantsToDocumentFragment` parameters are now: `(editor, { descendants })`. Used by the HTML deserializer.
  - fix: Handles 1st constraint: "All Element nodes must contain at least one Text descendant."
  - fix: Handles 3rd constraint: "Block nodes can only contain other blocks, or inline and text nodes."

- [#735](https://github.com/udecode/slate-plugins/pull/735) [`097d3f3d`](https://github.com/udecode/slate-plugins/commit/097d3f3d3517a5352b6a84bb63a5d97a39aed52f) Thanks [@cawabunga](https://github.com/cawabunga)! - fix: calling leaf serializers with preceding serialization result

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c)]:
  - @udecode/slate-plugins-common@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36

## 1.0.0-next.34

### Patch Changes

- [#700](https://github.com/udecode/slate-plugins/pull/700) [`33e0d16e`](https://github.com/udecode/slate-plugins/commit/33e0d16ebd7ace30fada72cb0ee98341c3917ca3) Thanks [@danlunde-ign](https://github.com/danlunde-ign)! - fix: strip data-slate-leaf from serialized html

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

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
