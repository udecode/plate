# @udecode/plate

## 20.5.0

## 20.4.1

## 20.4.0

## 20.3.2

## 20.3.1

## 20.3.0

## 20.2.0

## 20.1.0

## 20.0.1

## 20.0.0

## 19.7.0

## 19.6.0

## 19.5.0

## 19.4.5

## 19.4.4

## 19.4.3

## 19.4.2

## 19.4.1

## 19.4.0

## 19.3.0

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.7

## 19.0.6

## 19.0.5

## 19.0.4

## 19.0.3

## 19.0.2

## 19.0.1

## 19.0.0

### Major Changes

- [#2097](https://github.com/udecode/plate/pull/2097) by [@zbeyens](https://github.com/zbeyens) –
  - due to esm issues, dnd plugin is not part of plate package anymore. To use it, install `@udecode/plate-ui-dnd`
  ```ts
  // before
  import { createDndPlugin } from '@udecode/plate';
  // after
  import { createDndPlugin } from '@udecode/plate-ui-dnd';
  ```
  - upgrade peerDeps:
  ```json
  // from
  "slate": ">=0.78.0",
  "slate-history": ">=0.66.0",
  "slate-react": ">=0.79.0"
  // to
  "slate": ">=0.87.0",
  "slate-history": ">=0.86.0",
  "slate-react": ">=0.88.0"
  ```

## 18.15.0

## 18.14.4

## 18.14.3

## 18.14.2

## 18.14.1

## 18.14.0

## 18.13.2

## 18.13.1

## 18.13.0

### Minor Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - new plugin: comments

## 18.12.2

## 18.12.1

## 18.11.2

## 18.11.1

## 18.11.0

## 18.10.3

## 18.10.1

## 18.9.2

## 18.9.1

## 18.9.0

## 18.8.1

## 18.8.0

## 18.7.0

## 18.6.0

## 18.5.1

## 18.5.0

## 18.4.0

## 18.3.1

## 18.3.0

## 18.2.1

## 18.2.0

## 18.1.3

## 18.1.2

## 18.1.1

## 18.1.0

## 18.0.0

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.9.1

## 16.9.0

## 16.8.1

## 16.8.0

## 16.7.0

## 16.6.1

## 16.6.0

## 16.5.0

## 16.4.2

## 16.4.1

## 16.4.0

## 16.3.0

## 16.2.3

## 16.2.2

## 16.2.1

## 16.2.0

## 16.1.1

## 16.1.0

## 16.0.2

## 16.0.1

## 16.0.0

### Major Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –

  - deprecate `@udecode/plate-ui-popover` for `@udecode/plate-floating`

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - deprecate `@udecode/plate-image` and `@udecode/plate-media-embed`, those got merged into `@udecode/plate-media`

## 15.0.6

## 15.0.5

## 15.0.4

## 15.0.3

## 15.0.2

## 15.0.1

## 15.0.0

### Major Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - remove `@udecode/plate-ui-popper` dep for `@udecode/plate-floating`

## 14.4.3

## 14.4.2

## 14.4.1

## 14.4.0

## 14.3.0

## 14.2.0

## 14.1.0

## 14.0.2

## 14.0.1

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.4.2

## 13.4.1

## 13.4.0

## 13.3.2

## 13.3.1

## 13.3.0

## 13.2.1

## 13.2.0

## 13.1.0

## 13.0.1

## 13.0.0

## 12.0.0

## 11.3.1

## 11.3.0

## 11.2.1

## 11.2.0

## 11.1.1

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

## 10.8.0

## 10.7.0

## 10.6.3

## 10.6.2

## 10.6.1

## 10.6.0

## 10.5.3

## 10.5.2

## 10.5.1

## 10.5.0

## 10.4.5

## 10.4.4

## 10.4.3

## 10.4.2

## 10.4.1

## 10.4.0

## 10.3.0

## 10.2.4

## 10.2.3

## 10.2.2

## 10.2.1

## 10.2.0

## 10.1.3

## 10.1.2

## 10.1.1

## 10.1.0

## 10.0.0

## 9.4.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.1.3

## 9.1.2

## 9.1.1

## 9.1.0

## 9.0.0

### Major Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - renamed `plate-x-ui` to `plate-ui-x`: all packages depending on `styled-components` has `plate-ui` prefix
  - renamed `plate-x-serializer` to `plate-serializer-x`
  - is now exporting only these (new) packages:
    - `@udecode/plate-headless`: all unstyled packages
    - `@udecode/plate-ui`: all styled packages

## 8.3.1

## 8.3.0

## 8.2.1

## 8.2.0

## 8.1.0

### Minor Changes

- [#1249](https://github.com/udecode/plate/pull/1249) by [@zbeyens](https://github.com/zbeyens) – New package:
  - `@udecode/plate-juice`

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Breaking changes:

  - all plugins options are now defined in the plugin itself
  - plugins which now have nested plugins instead of array:
    - `createBasicElementsPlugin`
    - `createCodeBlockPlugin`
    - `createHeadingPlugin`
    - `createListPlugin`
    - `createTablePlugin`
    - `createBasicMarksPlugin`

  Removed:

  - `createEditorPlugins` for `createPlateEditor` (without components) and `createPlateEditorUI` (with Plate components)
  - `createPlateOptions` for `createPlugins`
  - all `DEFAULTS_X`: these are defined in the plugins
  - all `getXDeserialize`: these are defined in the plugins
  - all `WithXOptions` for extended plugins
  - all `getXRenderElement`
  - some plugin option types are removed for `PlatePlugin`

  Renamed:

  - `createPlateComponents` to `createPlateUI`
  - all `getXY` handlers to `yX` (e.g. `getXOnKeyDown` to `onKeyDownX`)
  - all `XPluginOptions` to `XPlugin`
  - all `pluginKey` parameter to `key` except in components

  Renamed types:

  - `DecorateSearchHighlightOptions` to `FindReplacePlugin`

  Updated deps:

  - `"slate": "0.70.0"`
  - `"slate-react": "0.70.1"`

  Removed deps (merged to core):

  - `plate-common`
  - `plate-ast-serializer`
  - `plate-html-serializer`
  - `plate-serializer`

### Minor Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – New package:
  - `plate-docx-serializer`
    - `createDeserializeDocxPlugin`
    - deserialize docx inserted data:
      - clean the html first
      - marks
      - lists to plate indent lists (no support yet for plate lists)

## 7.0.3

## 7.0.2

## 7.0.1

## 7.0.0

### Minor Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) – new package: `@udecode/plate-indent-list`

## 6.5.0

### Patch Changes

- [#1168](https://github.com/udecode/plate/pull/1168) by [@nemanja-tosic](https://github.com/nemanja-tosic) – Inline mention proposal element instead of using whatever comes after a trigger.

## 6.4.2

## 6.4.1

## 6.4.0

### Minor Changes

- [#1176](https://github.com/udecode/plate/pull/1176) by [@ghingis](https://github.com/ghingis) – new packages: `line-height` and `line-height-ui`

## 6.3.0

## 6.2.0

### Minor Changes

- [#1173](https://github.com/udecode/plate/pull/1173) by [@zbeyens](https://github.com/zbeyens) –
  - new package exports:
    - `@udecode/plate-ui-button`
    - `@udecode/plate-ui-popover`
  - register `TableRowElement` component for `ELEMENT_TR` plugin key.

## 6.1.0

### Minor Changes

- [#1161](https://github.com/udecode/plate/pull/1161) by [@zbeyens](https://github.com/zbeyens) – `ELEMENT_TD` component is now using `TableCellElement`

## 6.0.0

## 5.3.5

### Patch Changes

- Updated dependencies [[`3718c6d1`](https://github.com/udecode/plate/commit/3718c6d1abe1af8a94b41e9debef0cb5301d051c), [`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf), [`25dcad65`](https://github.com/udecode/plate/commit/25dcad654b8297a50c905cc427a59e68c0ff8093)]:
  - @udecode/plate-list@5.3.5
  - @udecode/plate-common@5.3.5
  - @udecode/plate-code-block@5.3.5
  - @udecode/plate-list-ui@5.3.5
  - @udecode/plate-ast-serializer@5.3.5
  - @udecode/plate-md-serializer@5.3.5
  - @udecode/plate-autoformat@5.3.5
  - @udecode/plate-break@5.3.5
  - @udecode/plate-dnd@5.3.5
  - @udecode/plate-alignment@5.3.5
  - @udecode/plate-alignment-ui@5.3.5
  - @udecode/plate-basic-elements@5.3.5
  - @udecode/plate-block-quote@5.3.5
  - @udecode/plate-block-quote-ui@5.3.5
  - @udecode/plate-code-block-ui@5.3.5
  - @udecode/plate-heading@5.3.5
  - @udecode/plate-horizontal-rule@5.3.5
  - @udecode/plate-image@5.3.5
  - @udecode/plate-image-ui@5.3.5
  - @udecode/plate-link@5.3.5
  - @udecode/plate-link-ui@5.3.5
  - @udecode/plate-media-embed@5.3.5
  - @udecode/plate-media-embed-ui@5.3.5
  - @udecode/plate-mention@5.3.5
  - @udecode/plate-mention-ui@5.3.5
  - @udecode/plate-paragraph@5.3.5
  - @udecode/plate-table@5.3.5
  - @udecode/plate-table-ui@5.3.5
  - @udecode/plate-find-replace@5.3.5
  - @udecode/plate-find-replace-ui@5.3.5
  - @udecode/plate-indent@5.3.5
  - @udecode/plate-basic-marks@5.3.5
  - @udecode/plate-font@5.3.5
  - @udecode/plate-font-ui@5.3.5
  - @udecode/plate-highlight@5.3.5
  - @udecode/plate-kbd@5.3.5
  - @udecode/plate-node-id@5.3.5
  - @udecode/plate-normalizers@5.3.5
  - @udecode/plate-placeholder@5.3.5
  - @udecode/plate-reset-node@5.3.5
  - @udecode/plate-select@5.3.5
  - @udecode/plate-serializer-csv@5.3.5
  - @udecode/plate-html-serializer@5.3.5
  - @udecode/plate-serializer@5.3.5
  - @udecode/plate-trailing-block@5.3.5
  - @udecode/plate-combobox@5.3.5
  - @udecode/plate-popper@5.3.5
  - @udecode/plate-styled-components@5.3.5
  - @udecode/plate-toolbar@5.3.5

## 5.3.4

### Patch Changes

- Updated dependencies [[`f45ed8cf`](https://github.com/udecode/plate/commit/f45ed8cff140a604169bfa0d042447a8fd0236ed), [`9b61b9d5`](https://github.com/udecode/plate/commit/9b61b9d5a631c9b0e14dfd081f70a633a3c0b436), [`a574a753`](https://github.com/udecode/plate/commit/a574a7537f7a4a25bb6a527a08ad6698da1dc7b1)]:
  - @udecode/plate-serializer@5.3.4
  - @udecode/plate-code-block@5.3.4
  - @udecode/plate-code-block-ui@5.3.4
  - @udecode/plate-ast-serializer@5.3.4
  - @udecode/plate-serializer-csv@5.3.4
  - @udecode/plate-html-serializer@5.3.4
  - @udecode/plate-md-serializer@5.3.4
  - @udecode/plate-basic-elements@5.3.4

## 5.3.3

### Patch Changes

- Updated dependencies [[`cff2a6a0`](https://github.com/udecode/plate/commit/cff2a6a0dea34dae0beea9e5d5001c494d8435fe)]:
  - @udecode/plate-md-serializer@5.3.3

## 5.3.2

### Patch Changes

- Updated dependencies [[`4e3e55f2`](https://github.com/udecode/plate/commit/4e3e55f20b77c4208b1054fd878cd05bb1700eb9)]:
  - @udecode/plate-html-serializer@5.3.2

## 5.3.1

### Patch Changes

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118), [`2c50679e`](https://github.com/udecode/plate/commit/2c50679efb5f9dfdfae0a7b34ab77d2d7120ad6a)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-code-block@5.3.1
  - @udecode/plate-ast-serializer@5.3.1
  - @udecode/plate-serializer-csv@5.3.1
  - @udecode/plate-html-serializer@5.3.1
  - @udecode/plate-md-serializer@5.3.1
  - @udecode/plate-serializer@5.3.1
  - @udecode/plate-indent@5.3.1
  - @udecode/plate-autoformat@5.3.1
  - @udecode/plate-break@5.3.1
  - @udecode/plate-common@5.3.1
  - @udecode/plate-dnd@5.3.1
  - @udecode/plate-alignment@5.3.1
  - @udecode/plate-alignment-ui@5.3.1
  - @udecode/plate-basic-elements@5.3.1
  - @udecode/plate-block-quote@5.3.1
  - @udecode/plate-block-quote-ui@5.3.1
  - @udecode/plate-code-block-ui@5.3.1
  - @udecode/plate-heading@5.3.1
  - @udecode/plate-horizontal-rule@5.3.1
  - @udecode/plate-image@5.3.1
  - @udecode/plate-image-ui@5.3.1
  - @udecode/plate-link@5.3.1
  - @udecode/plate-link-ui@5.3.1
  - @udecode/plate-list@5.3.1
  - @udecode/plate-list-ui@5.3.1
  - @udecode/plate-media-embed@5.3.1
  - @udecode/plate-media-embed-ui@5.3.1
  - @udecode/plate-mention@5.3.1
  - @udecode/plate-mention-ui@5.3.1
  - @udecode/plate-paragraph@5.3.1
  - @udecode/plate-table@5.3.1
  - @udecode/plate-table-ui@5.3.1
  - @udecode/plate-find-replace@5.3.1
  - @udecode/plate-find-replace-ui@5.3.1
  - @udecode/plate-basic-marks@5.3.1
  - @udecode/plate-font@5.3.1
  - @udecode/plate-font-ui@5.3.1
  - @udecode/plate-highlight@5.3.1
  - @udecode/plate-kbd@5.3.1
  - @udecode/plate-node-id@5.3.1
  - @udecode/plate-normalizers@5.3.1
  - @udecode/plate-placeholder@5.3.1
  - @udecode/plate-reset-node@5.3.1
  - @udecode/plate-select@5.3.1
  - @udecode/plate-trailing-block@5.3.1
  - @udecode/plate-combobox@5.3.1
  - @udecode/plate-popper@5.3.1
  - @udecode/plate-styled-components@5.3.1
  - @udecode/plate-toolbar@5.3.1

## 5.3.0

### Minor Changes

- [#1126](https://github.com/udecode/plate/pull/1126) [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930) Thanks [@zbeyens](https://github.com/zbeyens)! - new package: plate-indent

### Patch Changes

- Updated dependencies [[`09234c44`](https://github.com/udecode/plate/commit/09234c44e69f59ad493a3b2ab2d72d735c254f43), [`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e), [`5c68eb04`](https://github.com/udecode/plate/commit/5c68eb04b5f528d08d45a4f994ef8c1d7924ab33), [`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e), [`1021397d`](https://github.com/udecode/plate/commit/1021397df42ee13006892372bd329446f362a930)]:
  - @udecode/plate-media-embed-ui@5.3.0
  - @udecode/plate-core@5.3.0
  - @udecode/plate-code-block-ui@5.3.0
  - @udecode/plate-code-block@5.3.0
  - @udecode/plate-indent@5.3.0
  - @udecode/plate-block-quote-ui@5.3.0
  - @udecode/plate-image-ui@5.3.0
  - @udecode/plate-link-ui@5.3.0
  - @udecode/plate-list-ui@5.3.0
  - @udecode/plate-mention-ui@5.3.0
  - @udecode/plate-table-ui@5.3.0
  - @udecode/plate-styled-components@5.3.0
  - @udecode/plate-autoformat@5.3.0
  - @udecode/plate-break@5.3.0
  - @udecode/plate-common@5.3.0
  - @udecode/plate-dnd@5.3.0
  - @udecode/plate-alignment@5.3.0
  - @udecode/plate-alignment-ui@5.3.0
  - @udecode/plate-basic-elements@5.3.0
  - @udecode/plate-block-quote@5.3.0
  - @udecode/plate-heading@5.3.0
  - @udecode/plate-horizontal-rule@5.3.0
  - @udecode/plate-image@5.3.0
  - @udecode/plate-link@5.3.0
  - @udecode/plate-list@5.3.0
  - @udecode/plate-media-embed@5.3.0
  - @udecode/plate-mention@5.3.0
  - @udecode/plate-paragraph@5.3.0
  - @udecode/plate-table@5.3.0
  - @udecode/plate-find-replace@5.3.0
  - @udecode/plate-find-replace-ui@5.3.0
  - @udecode/plate-basic-marks@5.3.0
  - @udecode/plate-font@5.3.0
  - @udecode/plate-font-ui@5.3.0
  - @udecode/plate-highlight@5.3.0
  - @udecode/plate-kbd@5.3.0
  - @udecode/plate-node-id@5.3.0
  - @udecode/plate-normalizers@5.3.0
  - @udecode/plate-placeholder@5.3.0
  - @udecode/plate-reset-node@5.3.0
  - @udecode/plate-select@5.3.0
  - @udecode/plate-ast-serializer@5.3.0
  - @udecode/plate-serializer-csv@5.3.0
  - @udecode/plate-html-serializer@5.3.0
  - @udecode/plate-md-serializer@5.3.0
  - @udecode/plate-serializer@5.3.0
  - @udecode/plate-trailing-block@5.3.0
  - @udecode/plate-combobox@5.3.0
  - @udecode/plate-popper@5.3.0
  - @udecode/plate-toolbar@5.3.0

## 5.2.3

### Patch Changes

- Updated dependencies [[`25b359a2`](https://github.com/udecode/plate/commit/25b359a23df79bc3b5f710fe9f58c4b549c72e75)]:
  - @udecode/plate-combobox@5.2.3
  - @udecode/plate-mention@5.2.3
  - @udecode/plate-mention-ui@5.2.3

## 5.2.2

### Patch Changes

- Updated dependencies [[`b8f2f97b`](https://github.com/udecode/plate/commit/b8f2f97be28db3f0eb4e8e5222dabe5aa0c2fb3b)]:
  - @udecode/plate-combobox@5.2.2
  - @udecode/plate-mention@5.2.2
  - @udecode/plate-mention-ui@5.2.2

## 5.2.1

### Patch Changes

- Updated dependencies [[`07d4df63`](https://github.com/udecode/plate/commit/07d4df63f8358cdf9dd34242e4ffb4eb5e4c4e73), [`882308a8`](https://github.com/udecode/plate/commit/882308a81a5ed18669c8209d8b74d3fca76a4dd2)]:
  - @udecode/plate-mention@5.2.1
  - @udecode/plate-mention-ui@5.2.1
  - @udecode/plate-combobox@5.2.1

## 5.2.0

### Patch Changes

- Updated dependencies [[`9910a511`](https://github.com/udecode/plate/commit/9910a511998649641e3938f3569eed1ded711842), [`86837955`](https://github.com/udecode/plate/commit/86837955ebcdf7d93e10cdcfe3a97181611500bf)]:
  - @udecode/plate-mention@5.2.0
  - @udecode/plate-mention-ui@5.2.0

## 5.1.1

### Patch Changes

- Updated dependencies [[`73ca0d4e`](https://github.com/udecode/plate/commit/73ca0d4ef46c77423926721a6e14dc09cd45e45a)]:
  - @udecode/plate-mention-ui@5.1.1
  - @udecode/plate-combobox@5.1.1
  - @udecode/plate-mention@5.1.1

## 5.1.0

### Patch Changes

- Updated dependencies [[`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a), [`503956fd`](https://github.com/udecode/plate/commit/503956fd9f71253249b3ad699b81c1c465351b0a)]:
  - @udecode/plate-list@5.1.0
  - @udecode/plate-common@5.1.0
  - @udecode/plate-list-ui@5.1.0
  - @udecode/plate-ast-serializer@5.1.0
  - @udecode/plate-md-serializer@5.1.0
  - @udecode/plate-autoformat@5.1.0
  - @udecode/plate-break@5.1.0
  - @udecode/plate-dnd@5.1.0
  - @udecode/plate-alignment@5.1.0
  - @udecode/plate-alignment-ui@5.1.0
  - @udecode/plate-basic-elements@5.1.0
  - @udecode/plate-block-quote@5.1.0
  - @udecode/plate-block-quote-ui@5.1.0
  - @udecode/plate-code-block@5.1.0
  - @udecode/plate-code-block-ui@5.1.0
  - @udecode/plate-heading@5.1.0
  - @udecode/plate-horizontal-rule@5.1.0
  - @udecode/plate-image@5.1.0
  - @udecode/plate-image-ui@5.1.0
  - @udecode/plate-link@5.1.0
  - @udecode/plate-link-ui@5.1.0
  - @udecode/plate-media-embed@5.1.0
  - @udecode/plate-media-embed-ui@5.1.0
  - @udecode/plate-mention@5.1.0
  - @udecode/plate-mention-ui@5.1.0
  - @udecode/plate-paragraph@5.1.0
  - @udecode/plate-table@5.1.0
  - @udecode/plate-table-ui@5.1.0
  - @udecode/plate-find-replace@5.1.0
  - @udecode/plate-find-replace-ui@5.1.0
  - @udecode/plate-basic-marks@5.1.0
  - @udecode/plate-font@5.1.0
  - @udecode/plate-font-ui@5.1.0
  - @udecode/plate-highlight@5.1.0
  - @udecode/plate-kbd@5.1.0
  - @udecode/plate-node-id@5.1.0
  - @udecode/plate-normalizers@5.1.0
  - @udecode/plate-placeholder@5.1.0
  - @udecode/plate-reset-node@5.1.0
  - @udecode/plate-select@5.1.0
  - @udecode/plate-serializer-csv@5.1.0
  - @udecode/plate-html-serializer@5.1.0
  - @udecode/plate-serializer@5.1.0
  - @udecode/plate-trailing-block@5.1.0
  - @udecode/plate-combobox@5.1.0
  - @udecode/plate-popper@5.1.0
  - @udecode/plate-styled-components@5.1.0
  - @udecode/plate-toolbar@5.1.0

## 5.0.1

### Patch Changes

- Updated dependencies [[`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec), [`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec), [`53d13cbc`](https://github.com/udecode/plate/commit/53d13cbcfc7af26040cb86182a7ea0ba9ae5abec)]:
  - @udecode/plate-toolbar@5.0.1
  - @udecode/plate-popper@5.0.1
  - @udecode/plate-alignment-ui@5.0.1
  - @udecode/plate-code-block-ui@5.0.1
  - @udecode/plate-image-ui@5.0.1
  - @udecode/plate-link-ui@5.0.1
  - @udecode/plate-list-ui@5.0.1
  - @udecode/plate-table-ui@5.0.1
  - @udecode/plate-find-replace-ui@5.0.1
  - @udecode/plate-font-ui@5.0.1
  - @udecode/plate-combobox@5.0.1
  - @udecode/plate-mention@5.0.1
  - @udecode/plate-mention-ui@5.0.1

## 5.0.0

### Minor Changes

- [#1086](https://github.com/udecode/plate/pull/1086) [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8) Thanks [@zbeyens](https://github.com/zbeyens)! - new exports:
  - `@udecode/plate-combobox`
  - `@udecode/plate-popper`

### Patch Changes

- Updated dependencies [[`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8), [`9a091446`](https://github.com/udecode/plate/commit/9a091446ae393c23f64f0b011e431fb2d002aaf8)]:
  - @udecode/plate-code-block-ui@5.0.0
  - @udecode/plate-combobox@5.0.0
  - @udecode/plate-popper@5.0.0
  - @udecode/plate-mention@5.0.0
  - @udecode/plate-mention-ui@5.0.0
  - @udecode/plate-toolbar@5.0.0
  - @udecode/plate-alignment-ui@5.0.0
  - @udecode/plate-image-ui@5.0.0
  - @udecode/plate-link-ui@5.0.0
  - @udecode/plate-list-ui@5.0.0
  - @udecode/plate-table-ui@5.0.0
  - @udecode/plate-find-replace-ui@5.0.0
  - @udecode/plate-font-ui@5.0.0

## 4.4.0

### Patch Changes

- Updated dependencies [[`c353b008`](https://github.com/udecode/plate/commit/c353b0085804fa9099f0c18405ca01b0b25da03a), [`7c32d4ef`](https://github.com/udecode/plate/commit/7c32d4efc0e84f6e2878473a3dd0efad3740ba9e), [`b22c06aa`](https://github.com/udecode/plate/commit/b22c06aad1cfed08069dadc7ec39bcbfb1d0af37)]:
  - @udecode/plate-list@4.4.0
  - @udecode/plate-basic-elements@4.4.0
  - @udecode/plate-code-block@4.4.0
  - @udecode/plate-code-block-ui@4.4.0
  - @udecode/plate-common@4.4.0
  - @udecode/plate-list-ui@4.4.0
  - @udecode/plate-ast-serializer@4.4.0
  - @udecode/plate-md-serializer@4.4.0
  - @udecode/plate-autoformat@4.4.0
  - @udecode/plate-break@4.4.0
  - @udecode/plate-dnd@4.4.0
  - @udecode/plate-alignment@4.4.0
  - @udecode/plate-alignment-ui@4.4.0
  - @udecode/plate-block-quote@4.4.0
  - @udecode/plate-block-quote-ui@4.4.0
  - @udecode/plate-heading@4.4.0
  - @udecode/plate-horizontal-rule@4.4.0
  - @udecode/plate-image@4.4.0
  - @udecode/plate-image-ui@4.4.0
  - @udecode/plate-link@4.4.0
  - @udecode/plate-link-ui@4.4.0
  - @udecode/plate-media-embed@4.4.0
  - @udecode/plate-media-embed-ui@4.4.0
  - @udecode/plate-mention@4.4.0
  - @udecode/plate-mention-ui@4.4.0
  - @udecode/plate-paragraph@4.4.0
  - @udecode/plate-table@4.4.0
  - @udecode/plate-table-ui@4.4.0
  - @udecode/plate-find-replace@4.4.0
  - @udecode/plate-find-replace-ui@4.4.0
  - @udecode/plate-basic-marks@4.4.0
  - @udecode/plate-font@4.4.0
  - @udecode/plate-font-ui@4.4.0
  - @udecode/plate-highlight@4.4.0
  - @udecode/plate-kbd@4.4.0
  - @udecode/plate-node-id@4.4.0
  - @udecode/plate-normalizers@4.4.0
  - @udecode/plate-placeholder@4.4.0
  - @udecode/plate-reset-node@4.4.0
  - @udecode/plate-select@4.4.0
  - @udecode/plate-serializer-csv@4.4.0
  - @udecode/plate-html-serializer@4.4.0
  - @udecode/plate-serializer@4.4.0
  - @udecode/plate-trailing-block@4.4.0
  - @udecode/plate-styled-components@4.4.0
  - @udecode/plate-toolbar@4.4.0

## 4.3.7

### Patch Changes

- Updated dependencies [[`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca)]:
  - @udecode/plate-core@4.3.7
  - @udecode/plate-autoformat@4.3.7
  - @udecode/plate-break@4.3.7
  - @udecode/plate-common@4.3.7
  - @udecode/plate-dnd@4.3.7
  - @udecode/plate-alignment@4.3.7
  - @udecode/plate-alignment-ui@4.3.7
  - @udecode/plate-basic-elements@4.3.7
  - @udecode/plate-block-quote@4.3.7
  - @udecode/plate-block-quote-ui@4.3.7
  - @udecode/plate-code-block@4.3.7
  - @udecode/plate-code-block-ui@4.3.7
  - @udecode/plate-heading@4.3.7
  - @udecode/plate-horizontal-rule@4.3.7
  - @udecode/plate-image@4.3.7
  - @udecode/plate-image-ui@4.3.7
  - @udecode/plate-link@4.3.7
  - @udecode/plate-link-ui@4.3.7
  - @udecode/plate-list@4.3.7
  - @udecode/plate-list-ui@4.3.7
  - @udecode/plate-media-embed@4.3.7
  - @udecode/plate-media-embed-ui@4.3.7
  - @udecode/plate-mention@4.3.7
  - @udecode/plate-mention-ui@4.3.7
  - @udecode/plate-paragraph@4.3.7
  - @udecode/plate-table@4.3.7
  - @udecode/plate-table-ui@4.3.7
  - @udecode/plate-find-replace@4.3.7
  - @udecode/plate-find-replace-ui@4.3.7
  - @udecode/plate-basic-marks@4.3.7
  - @udecode/plate-font@4.3.7
  - @udecode/plate-font-ui@4.3.7
  - @udecode/plate-highlight@4.3.7
  - @udecode/plate-kbd@4.3.7
  - @udecode/plate-node-id@4.3.7
  - @udecode/plate-normalizers@4.3.7
  - @udecode/plate-placeholder@4.3.7
  - @udecode/plate-reset-node@4.3.7
  - @udecode/plate-select@4.3.7
  - @udecode/plate-ast-serializer@4.3.7
  - @udecode/plate-serializer-csv@4.3.7
  - @udecode/plate-html-serializer@4.3.7
  - @udecode/plate-md-serializer@4.3.7
  - @udecode/plate-serializer@4.3.7
  - @udecode/plate-trailing-block@4.3.7
  - @udecode/plate-styled-components@4.3.7
  - @udecode/plate-toolbar@4.3.7

## 4.3.6

### Patch Changes

- Updated dependencies [[`826a1c0a`](https://github.com/udecode/plate/commit/826a1c0a048e4e52a3d04e21a7325e9b05f3dd89)]:
  - @udecode/plate-code-block-ui@4.3.6

## 4.3.5

### Patch Changes

- Updated dependencies [[`8525af01`](https://github.com/udecode/plate/commit/8525af01b2ca705665bad3ada73b8e906620dad8)]:
  - @udecode/plate-code-block@4.3.5
  - @udecode/plate-basic-elements@4.3.5
  - @udecode/plate-code-block-ui@4.3.5
  - @udecode/plate-ast-serializer@4.3.5
  - @udecode/plate-md-serializer@4.3.5

## 4.3.4

### Patch Changes

- Updated dependencies [[`fe1ff731`](https://github.com/udecode/plate/commit/fe1ff731f7757603fde06c5d042ec2e1a2e4305a)]:
  - @udecode/plate-code-block-ui@4.3.4

## 4.3.3

### Patch Changes

- Updated dependencies [[`39b29f66`](https://github.com/udecode/plate/commit/39b29f66216d8cb26ac142f57cbee220e9ee2570)]:
  - @udecode/plate-code-block-ui@4.3.3

## 4.3.2

### Patch Changes

- Updated dependencies [[`56ff3d62`](https://github.com/udecode/plate/commit/56ff3d6235a9d8aaeb76d9bc8ec229850af9c891)]:
  - @udecode/plate-code-block-ui@4.3.2

## 4.3.1

### Patch Changes

- Updated dependencies [[`a692c078`](https://github.com/udecode/plate/commit/a692c078f9386ebb63aea9cb704decf554b07e8e)]:
  - @udecode/plate-code-block@4.3.1
  - @udecode/plate-basic-elements@4.3.1
  - @udecode/plate-code-block-ui@4.3.1
  - @udecode/plate-ast-serializer@4.3.1
  - @udecode/plate-md-serializer@4.3.1

## 4.3.0

### Patch Changes

- Updated dependencies [[`7b892a59`](https://github.com/udecode/plate/commit/7b892a59f27bdaa81c90097534c411cc80b92e8a), [`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6)]:
  - @udecode/plate-code-block@4.3.0
  - @udecode/plate-code-block-ui@4.3.0
  - @udecode/plate-core@4.3.0
  - @udecode/plate-basic-elements@4.3.0
  - @udecode/plate-ast-serializer@4.3.0
  - @udecode/plate-md-serializer@4.3.0
  - @udecode/plate-autoformat@4.3.0
  - @udecode/plate-break@4.3.0
  - @udecode/plate-common@4.3.0
  - @udecode/plate-dnd@4.3.0
  - @udecode/plate-alignment@4.3.0
  - @udecode/plate-alignment-ui@4.3.0
  - @udecode/plate-block-quote@4.3.0
  - @udecode/plate-block-quote-ui@4.3.0
  - @udecode/plate-heading@4.3.0
  - @udecode/plate-horizontal-rule@4.3.0
  - @udecode/plate-image@4.3.0
  - @udecode/plate-image-ui@4.3.0
  - @udecode/plate-link@4.3.0
  - @udecode/plate-link-ui@4.3.0
  - @udecode/plate-list@4.3.0
  - @udecode/plate-list-ui@4.3.0
  - @udecode/plate-media-embed@4.3.0
  - @udecode/plate-media-embed-ui@4.3.0
  - @udecode/plate-mention@4.3.0
  - @udecode/plate-mention-ui@4.3.0
  - @udecode/plate-paragraph@4.3.0
  - @udecode/plate-table@4.3.0
  - @udecode/plate-table-ui@4.3.0
  - @udecode/plate-find-replace@4.3.0
  - @udecode/plate-find-replace-ui@4.3.0
  - @udecode/plate-basic-marks@4.3.0
  - @udecode/plate-font@4.3.0
  - @udecode/plate-font-ui@4.3.0
  - @udecode/plate-highlight@4.3.0
  - @udecode/plate-kbd@4.3.0
  - @udecode/plate-node-id@4.3.0
  - @udecode/plate-normalizers@4.3.0
  - @udecode/plate-placeholder@4.3.0
  - @udecode/plate-reset-node@4.3.0
  - @udecode/plate-select@4.3.0
  - @udecode/plate-serializer-csv@4.3.0
  - @udecode/plate-html-serializer@4.3.0
  - @udecode/plate-serializer@4.3.0
  - @udecode/plate-trailing-block@4.3.0
  - @udecode/plate-styled-components@4.3.0
  - @udecode/plate-toolbar@4.3.0

## 4.2.0

### Patch Changes

- Updated dependencies [[`87cca4a0`](https://github.com/udecode/plate/commit/87cca4a0894b512a8257257570952e827924c13b), [`6fe49e22`](https://github.com/udecode/plate/commit/6fe49e22e51b5fbec8695629e77ab149d80ce4cb), [`8ec2679b`](https://github.com/udecode/plate/commit/8ec2679bf76f6ff285b6bf046dfd1df57b83655a), [`ea693250`](https://github.com/udecode/plate/commit/ea6932504e1639f38a28c177ac0ef7de5b9ea79d)]:
  - @udecode/plate-list@4.2.0
  - @udecode/plate-list-ui@4.2.0
  - @udecode/plate-toolbar@4.2.0
  - @udecode/plate-ast-serializer@4.2.0
  - @udecode/plate-md-serializer@4.2.0
  - @udecode/plate-alignment-ui@4.2.0
  - @udecode/plate-code-block-ui@4.2.0
  - @udecode/plate-image-ui@4.2.0
  - @udecode/plate-link-ui@4.2.0
  - @udecode/plate-table-ui@4.2.0
  - @udecode/plate-find-replace-ui@4.2.0
  - @udecode/plate-font-ui@4.2.0

## 4.1.0

### Patch Changes

- Updated dependencies [[`eb30aa5d`](https://github.com/udecode/plate/commit/eb30aa5d355abb81bc3e8577fedb3800e1b056aa)]:
  - @udecode/plate-list@4.1.0
  - @udecode/plate-list-ui@4.1.0
  - @udecode/plate-ast-serializer@4.1.0
  - @udecode/plate-md-serializer@4.1.0

## 4.0.0

### Minor Changes

- [#1054](https://github.com/udecode/plate/pull/1054) [`9f7abfc4`](https://github.com/udecode/plate/commit/9f7abfc42e0c97585f3784e4bbe8d93ec3655082) Thanks [@zbeyens](https://github.com/zbeyens)! - New plugin: horizontal rule

### Patch Changes

- [#1052](https://github.com/udecode/plate/pull/1052) [`22da824e`](https://github.com/udecode/plate/commit/22da824e9acea62cbd9073a150b543348a1b128b) Thanks [@aj-foster](https://github.com/aj-foster)! - Add keyboard shortcut for inserting a link at the current selection

- Updated dependencies [[`22da824e`](https://github.com/udecode/plate/commit/22da824e9acea62cbd9073a150b543348a1b128b), [`9f7abfc4`](https://github.com/udecode/plate/commit/9f7abfc42e0c97585f3784e4bbe8d93ec3655082), [`cc14dfd4`](https://github.com/udecode/plate/commit/cc14dfd4c5eddd62e9e86de2034df5c7d054dbff), [`d5667409`](https://github.com/udecode/plate/commit/d5667409e4e53b4b41a14335a7298c260c52019e), [`a899c585`](https://github.com/udecode/plate/commit/a899c5850fbe09792113b2b3f4787d869568427d)]:
  - @udecode/plate-link@4.0.0
  - @udecode/plate-link-ui@4.0.0
  - @udecode/plate-horizontal-rule@4.0.0
  - @udecode/plate-autoformat@4.0.0
  - @udecode/plate-toolbar@4.0.0
  - @udecode/plate-ast-serializer@4.0.0
  - @udecode/plate-md-serializer@4.0.0
  - @udecode/plate-alignment-ui@4.0.0
  - @udecode/plate-code-block-ui@4.0.0
  - @udecode/plate-image-ui@4.0.0
  - @udecode/plate-list-ui@4.0.0
  - @udecode/plate-table-ui@4.0.0
  - @udecode/plate-find-replace-ui@4.0.0
  - @udecode/plate-font-ui@4.0.0

## 3.5.1

### Patch Changes

- Updated dependencies [[`b758cfb6`](https://github.com/udecode/plate/commit/b758cfb6ea955ab4d054c0873ab632aaf1c3e866), [`0db393e1`](https://github.com/udecode/plate/commit/0db393e1cebec792c89a633cb8929a0786943713)]:
  - @udecode/plate-list@3.5.1
  - @udecode/plate-serializer@3.5.1
  - @udecode/plate-styled-components@3.5.1
  - @udecode/plate-list-ui@3.5.1
  - @udecode/plate-ast-serializer@3.5.1
  - @udecode/plate-md-serializer@3.5.1
  - @udecode/plate-serializer-csv@3.5.1
  - @udecode/plate-html-serializer@3.5.1
  - @udecode/plate-dnd@3.5.1
  - @udecode/plate-alignment-ui@3.5.1
  - @udecode/plate-block-quote-ui@3.5.1
  - @udecode/plate-code-block-ui@3.5.1
  - @udecode/plate-image-ui@3.5.1
  - @udecode/plate-link-ui@3.5.1
  - @udecode/plate-media-embed-ui@3.5.1
  - @udecode/plate-mention-ui@3.5.1
  - @udecode/plate-table-ui@3.5.1
  - @udecode/plate-find-replace-ui@3.5.1
  - @udecode/plate-font-ui@3.5.1
  - @udecode/plate-placeholder@3.5.1
  - @udecode/plate-toolbar@3.5.1

## 3.5.0

### Patch Changes

- Updated dependencies [[`7ab01674`](https://github.com/udecode/plate/commit/7ab016745c5eddcf4daa73bbc1958f087d0c4b90)]:
  - @udecode/plate-link@3.5.0
  - @udecode/plate-link-ui@3.5.0
  - @udecode/plate-ast-serializer@3.5.0
  - @udecode/plate-md-serializer@3.5.0

## 3.4.1

### Patch Changes

- Updated dependencies [[`fd7d7f8a`](https://github.com/udecode/plate/commit/fd7d7f8a86344091c8b3aa5c6ea58e8f7cbd7baa)]:
  - @udecode/plate-font@3.4.1
  - @udecode/plate-font-ui@3.4.1

## 3.4.0

### Patch Changes

- Updated dependencies [[`533d904f`](https://github.com/udecode/plate/commit/533d904f9afc547e232d7cb7843a82923778d41d), [`f1da7267`](https://github.com/udecode/plate/commit/f1da7267d46d94e207f4477f73e42b63736a9085), [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c)]:
  - @udecode/plate-placeholder@3.4.0
  - @udecode/plate-common@3.4.0
  - @udecode/plate-core@3.4.0
  - @udecode/plate-autoformat@3.4.0
  - @udecode/plate-break@3.4.0
  - @udecode/plate-dnd@3.4.0
  - @udecode/plate-alignment@3.4.0
  - @udecode/plate-alignment-ui@3.4.0
  - @udecode/plate-basic-elements@3.4.0
  - @udecode/plate-block-quote@3.4.0
  - @udecode/plate-block-quote-ui@3.4.0
  - @udecode/plate-code-block@3.4.0
  - @udecode/plate-code-block-ui@3.4.0
  - @udecode/plate-heading@3.4.0
  - @udecode/plate-image@3.4.0
  - @udecode/plate-image-ui@3.4.0
  - @udecode/plate-link@3.4.0
  - @udecode/plate-link-ui@3.4.0
  - @udecode/plate-list@3.4.0
  - @udecode/plate-list-ui@3.4.0
  - @udecode/plate-media-embed@3.4.0
  - @udecode/plate-media-embed-ui@3.4.0
  - @udecode/plate-mention@3.4.0
  - @udecode/plate-mention-ui@3.4.0
  - @udecode/plate-paragraph@3.4.0
  - @udecode/plate-table@3.4.0
  - @udecode/plate-table-ui@3.4.0
  - @udecode/plate-find-replace@3.4.0
  - @udecode/plate-find-replace-ui@3.4.0
  - @udecode/plate-basic-marks@3.4.0
  - @udecode/plate-font@3.4.0
  - @udecode/plate-font-ui@3.4.0
  - @udecode/plate-highlight@3.4.0
  - @udecode/plate-kbd@3.4.0
  - @udecode/plate-node-id@3.4.0
  - @udecode/plate-normalizers@3.4.0
  - @udecode/plate-reset-node@3.4.0
  - @udecode/plate-select@3.4.0
  - @udecode/plate-ast-serializer@3.4.0
  - @udecode/plate-serializer-csv@3.4.0
  - @udecode/plate-html-serializer@3.4.0
  - @udecode/plate-md-serializer@3.4.0
  - @udecode/plate-serializer@3.4.0
  - @udecode/plate-trailing-block@3.4.0
  - @udecode/plate-styled-components@3.4.0
  - @udecode/plate-toolbar@3.4.0

## 3.3.0

### Patch Changes

- Updated dependencies [[`2c341eff`](https://github.com/udecode/plate/commit/2c341eff209637d26de990ebe27460123ba52936), [`e183065f`](https://github.com/udecode/plate/commit/e183065fb6b05ff09a5841454c04be2645da79fb), [`8b7c85b3`](https://github.com/udecode/plate/commit/8b7c85b3ec63d94cf9f1ce66afa2092d0f76812a), [`aaf99b7c`](https://github.com/udecode/plate/commit/aaf99b7c57465caa08427b46d64be64e9ce9f371)]:
  - @udecode/plate-image@3.3.0
  - @udecode/plate-html-serializer@3.3.0
  - @udecode/plate-font@3.3.0
  - @udecode/plate-image-ui@3.3.0
  - @udecode/plate-font-ui@3.3.0

## 3.2.1

### Patch Changes

- Updated dependencies [[`baddeb11`](https://github.com/udecode/plate/commit/baddeb117c1a13451f7f4da271ea441fafe3c02d)]:
  - @udecode/plate-list@3.2.1
  - @udecode/plate-list-ui@3.2.1
  - @udecode/plate-ast-serializer@3.2.1
  - @udecode/plate-md-serializer@3.2.1

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

### Patch Changes

- [#995](https://github.com/udecode/plate/pull/995) [`5eb42cdd`](https://github.com/udecode/plate/commit/5eb42cdd47db4fd41936420b86b0bf7df9a8aa09) Thanks [@dylans](https://github.com/dylans)! - update to slate 0.66.x

- Updated dependencies [[`56b2551b`](https://github.com/udecode/plate/commit/56b2551b2fa5fab180b3c99551144667f99f7afc), [`3a590663`](https://github.com/udecode/plate/commit/3a5906637b008e85a6d907a7492a78fe9961bf34), [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4), [`8662815f`](https://github.com/udecode/plate/commit/8662815f8c714ba9efb8cc6772bb675ea075332b), [`5eb42cdd`](https://github.com/udecode/plate/commit/5eb42cdd47db4fd41936420b86b0bf7df9a8aa09)]:
  - @udecode/plate-table@3.2.0
  - @udecode/plate-serializer@3.2.0
  - @udecode/plate-autoformat@3.2.0
  - @udecode/plate-break@3.2.0
  - @udecode/plate-common@3.2.0
  - @udecode/plate-core@3.2.0
  - @udecode/plate-dnd@3.2.0
  - @udecode/plate-alignment@3.2.0
  - @udecode/plate-alignment-ui@3.2.0
  - @udecode/plate-basic-elements@3.2.0
  - @udecode/plate-block-quote@3.2.0
  - @udecode/plate-block-quote-ui@3.2.0
  - @udecode/plate-code-block@3.2.0
  - @udecode/plate-code-block-ui@3.2.0
  - @udecode/plate-heading@3.2.0
  - @udecode/plate-image@3.2.0
  - @udecode/plate-image-ui@3.2.0
  - @udecode/plate-link@3.2.0
  - @udecode/plate-link-ui@3.2.0
  - @udecode/plate-list@3.2.0
  - @udecode/plate-list-ui@3.2.0
  - @udecode/plate-media-embed@3.2.0
  - @udecode/plate-media-embed-ui@3.2.0
  - @udecode/plate-mention@3.2.0
  - @udecode/plate-mention-ui@3.2.0
  - @udecode/plate-paragraph@3.2.0
  - @udecode/plate-table-ui@3.2.0
  - @udecode/plate-find-replace@3.2.0
  - @udecode/plate-find-replace-ui@3.2.0
  - @udecode/plate-basic-marks@3.2.0
  - @udecode/plate-font@3.2.0
  - @udecode/plate-font-ui@3.2.0
  - @udecode/plate-highlight@3.2.0
  - @udecode/plate-kbd@3.2.0
  - @udecode/plate-node-id@3.2.0
  - @udecode/plate-normalizers@3.2.0
  - @udecode/plate-placeholder@3.2.0
  - @udecode/plate-reset-node@3.2.0
  - @udecode/plate-select@3.2.0
  - @udecode/plate-ast-serializer@3.2.0
  - @udecode/plate-serializer-csv@3.2.0
  - @udecode/plate-html-serializer@3.2.0
  - @udecode/plate-md-serializer@3.2.0
  - @udecode/plate-trailing-block@3.2.0
  - @udecode/plate-styled-components@3.2.0
  - @udecode/plate-toolbar@3.2.0

## 3.1.3

### Patch Changes

- Updated dependencies [[`f6c58134`](https://github.com/udecode/plate/commit/f6c581347cc5877b7afa0774ef1ad78ad227564e), [`d73b22d0`](https://github.com/udecode/plate/commit/d73b22d03a0fc270265cbd1bdecfcc4adc70b9d8), [`c53532ba`](https://github.com/udecode/plate/commit/c53532baebd83fe79c53b300e97ecf6e713f7754)]:
  - @udecode/plate-common@3.1.3
  - @udecode/plate-list@3.1.3
  - @udecode/plate-html-serializer@3.1.3
  - @udecode/plate-autoformat@3.1.3
  - @udecode/plate-break@3.1.3
  - @udecode/plate-dnd@3.1.3
  - @udecode/plate-alignment@3.1.3
  - @udecode/plate-alignment-ui@3.1.3
  - @udecode/plate-basic-elements@3.1.3
  - @udecode/plate-block-quote@3.1.3
  - @udecode/plate-block-quote-ui@3.1.3
  - @udecode/plate-code-block@3.1.3
  - @udecode/plate-code-block-ui@3.1.3
  - @udecode/plate-heading@3.1.3
  - @udecode/plate-image@3.1.3
  - @udecode/plate-image-ui@3.1.3
  - @udecode/plate-link@3.1.3
  - @udecode/plate-link-ui@3.1.3
  - @udecode/plate-list-ui@3.1.3
  - @udecode/plate-media-embed@3.1.3
  - @udecode/plate-media-embed-ui@3.1.3
  - @udecode/plate-mention@3.1.3
  - @udecode/plate-mention-ui@3.1.3
  - @udecode/plate-paragraph@3.1.3
  - @udecode/plate-table@3.1.3
  - @udecode/plate-table-ui@3.1.3
  - @udecode/plate-find-replace@3.1.3
  - @udecode/plate-find-replace-ui@3.1.3
  - @udecode/plate-basic-marks@3.1.3
  - @udecode/plate-font@3.1.3
  - @udecode/plate-font-ui@3.1.3
  - @udecode/plate-highlight@3.1.3
  - @udecode/plate-kbd@3.1.3
  - @udecode/plate-node-id@3.1.3
  - @udecode/plate-normalizers@3.1.3
  - @udecode/plate-placeholder@3.1.3
  - @udecode/plate-reset-node@3.1.3
  - @udecode/plate-select@3.1.3
  - @udecode/plate-ast-serializer@3.1.3
  - @udecode/plate-serializer-csv@3.1.3
  - @udecode/plate-md-serializer@3.1.3
  - @udecode/plate-serializer@3.1.3
  - @udecode/plate-trailing-block@3.1.3
  - @udecode/plate-styled-components@3.1.3
  - @udecode/plate-toolbar@3.1.3

## 3.1.2

### Patch Changes

- Updated dependencies [[`2906a0a4`](https://github.com/udecode/plate/commit/2906a0a45fa00b38a1e71ed8e3c57203f429db4d), [`1244bcb7`](https://github.com/udecode/plate/commit/1244bcb748411e6291d635647c2053b115704eb9), [`5651aed7`](https://github.com/udecode/plate/commit/5651aed704d69af85e2dd7d6f850e8dcabcd45f4)]:
  - @udecode/plate-list@3.1.2
  - @udecode/plate-table@3.1.2
  - @udecode/plate-list-ui@3.1.2
  - @udecode/plate-ast-serializer@3.1.2
  - @udecode/plate-md-serializer@3.1.2
  - @udecode/plate-table-ui@3.1.2
  - @udecode/plate-serializer-csv@3.1.2

## 3.1.1

### Patch Changes

- Updated dependencies [[`a985354e`](https://github.com/udecode/plate/commit/a985354ea3cb672cfe010cac59cacfd1b011483b)]:
  - @udecode/plate-placeholder@3.1.1

## 3.1.0

### Patch Changes

- Updated dependencies [[`a1600e5f`](https://github.com/udecode/plate/commit/a1600e5f8cf1a1b4aa6a88048063431ecafbf766), [`03f2acdd`](https://github.com/udecode/plate/commit/03f2acdd1b34d1e4e574bcf296ae5b4796930c9a), [`2c46e814`](https://github.com/udecode/plate/commit/2c46e8148b22fdb1170e580ce101ce301cc2e088)]:
  - @udecode/plate-toolbar@3.1.0
  - @udecode/plate-styled-components@3.1.0
  - @udecode/plate-mention-ui@3.1.0
  - @udecode/plate-alignment-ui@3.1.0
  - @udecode/plate-code-block-ui@3.1.0
  - @udecode/plate-image-ui@3.1.0
  - @udecode/plate-link-ui@3.1.0
  - @udecode/plate-list-ui@3.1.0
  - @udecode/plate-table-ui@3.1.0
  - @udecode/plate-find-replace-ui@3.1.0
  - @udecode/plate-font-ui@3.1.0
  - @udecode/plate-dnd@3.1.0
  - @udecode/plate-block-quote-ui@3.1.0
  - @udecode/plate-media-embed-ui@3.1.0
  - @udecode/plate-placeholder@3.1.0

## 3.0.5

### Patch Changes

- Updated dependencies [[`7cffccb2`](https://github.com/udecode/plate/commit/7cffccb29aa1a1ab00e29b12c48c486b67d3c873)]:
  - @udecode/plate-md-serializer@3.0.5

## 3.0.4

### Patch Changes

- Updated dependencies [[`46398095`](https://github.com/udecode/plate/commit/4639809567e4c96d58912c2a16e74948474d4547)]:
  - @udecode/plate-list@3.0.4
  - @udecode/plate-list-ui@3.0.4
  - @udecode/plate-ast-serializer@3.0.4
  - @udecode/plate-md-serializer@3.0.4

## 3.0.3

### Patch Changes

- Updated dependencies [[`0e5050ba`](https://github.com/udecode/plate/commit/0e5050ba0ca7862a535712a49c2eeb29c5337b5d)]:
  - @udecode/plate-break@3.0.3

## 3.0.2

### Patch Changes

- Updated dependencies [[`83aaf31c`](https://github.com/udecode/plate/commit/83aaf31c02b24f388d1f178dcd4b80354ddab773)]:
  - @udecode/plate-table@3.0.2
  - @udecode/plate-table-ui@3.0.2
  - @udecode/plate-serializer-csv@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [[`885a7799`](https://github.com/udecode/plate/commit/885a77995619c99293403b4a7ee0019eecf3dfd0)]:
  - @udecode/plate-styled-components@3.0.1
  - @udecode/plate-dnd@3.0.1
  - @udecode/plate-alignment-ui@3.0.1
  - @udecode/plate-block-quote-ui@3.0.1
  - @udecode/plate-code-block-ui@3.0.1
  - @udecode/plate-image-ui@3.0.1
  - @udecode/plate-link-ui@3.0.1
  - @udecode/plate-list-ui@3.0.1
  - @udecode/plate-media-embed-ui@3.0.1
  - @udecode/plate-mention-ui@3.0.1
  - @udecode/plate-table-ui@3.0.1
  - @udecode/plate-find-replace-ui@3.0.1
  - @udecode/plate-font-ui@3.0.1
  - @udecode/plate-placeholder@3.0.1
  - @udecode/plate-toolbar@3.0.1

## 3.0.0

### Major Changes

- [#955](https://github.com/udecode/plate/pull/955) [`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed) Thanks [@zbeyens](https://github.com/zbeyens)! - WHAT: moved `styled-components` from dependencies to peer dependencies.
  WHY: there was multiple instances of `styled-components` across all the packages.
  HOW: make sure to have `styled-components` in your dependencies.

### Patch Changes

- Updated dependencies [[`348f7efb`](https://github.com/udecode/plate/commit/348f7efb9276735d8282652db1516b46c364b6ed)]:
  - @udecode/plate-dnd@3.0.0
  - @udecode/plate-alignment-ui@3.0.0
  - @udecode/plate-block-quote-ui@3.0.0
  - @udecode/plate-code-block-ui@3.0.0
  - @udecode/plate-image-ui@3.0.0
  - @udecode/plate-link-ui@3.0.0
  - @udecode/plate-list-ui@3.0.0
  - @udecode/plate-media-embed-ui@3.0.0
  - @udecode/plate-mention-ui@3.0.0
  - @udecode/plate-table-ui@3.0.0
  - @udecode/plate-find-replace-ui@3.0.0
  - @udecode/plate-font-ui@3.0.0
  - @udecode/plate-placeholder@3.0.0
  - @udecode/plate-styled-components@3.0.0
  - @udecode/plate-toolbar@3.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`099a86fa`](https://github.com/udecode/plate/commit/099a86faede3b3acf7da6842a78e4fab76815073)]:
  - @udecode/plate-table@2.0.1
  - @udecode/plate-table-ui@2.0.1
  - @udecode/plate-serializer-csv@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`e6ea7ac2`](https://github.com/udecode/plate/commit/e6ea7ac222c09568b8c012af85346dfa4bc50b07), [`ec4d5b7b`](https://github.com/udecode/plate/commit/ec4d5b7bd01b6fd21ba14a28f782c143d32c7532), [`2eb3bb7a`](https://github.com/udecode/plate/commit/2eb3bb7a740f48ae9b98668eb957a4c16bed3652)]:
  - @udecode/plate-autoformat@2.0.0
  - @udecode/plate-common@2.0.0
  - @udecode/plate-break@2.0.0
  - @udecode/plate-dnd@2.0.0
  - @udecode/plate-alignment@2.0.0
  - @udecode/plate-alignment-ui@2.0.0
  - @udecode/plate-basic-elements@2.0.0
  - @udecode/plate-block-quote@2.0.0
  - @udecode/plate-block-quote-ui@2.0.0
  - @udecode/plate-code-block@2.0.0
  - @udecode/plate-code-block-ui@2.0.0
  - @udecode/plate-heading@2.0.0
  - @udecode/plate-image@2.0.0
  - @udecode/plate-image-ui@2.0.0
  - @udecode/plate-link@2.0.0
  - @udecode/plate-link-ui@2.0.0
  - @udecode/plate-list@2.0.0
  - @udecode/plate-list-ui@2.0.0
  - @udecode/plate-media-embed@2.0.0
  - @udecode/plate-media-embed-ui@2.0.0
  - @udecode/plate-mention@2.0.0
  - @udecode/plate-mention-ui@2.0.0
  - @udecode/plate-paragraph@2.0.0
  - @udecode/plate-table@2.0.0
  - @udecode/plate-table-ui@2.0.0
  - @udecode/plate-find-replace@2.0.0
  - @udecode/plate-find-replace-ui@2.0.0
  - @udecode/plate-basic-marks@2.0.0
  - @udecode/plate-font@2.0.0
  - @udecode/plate-font-ui@2.0.0
  - @udecode/plate-highlight@2.0.0
  - @udecode/plate-kbd@2.0.0
  - @udecode/plate-node-id@2.0.0
  - @udecode/plate-normalizers@2.0.0
  - @udecode/plate-placeholder@2.0.0
  - @udecode/plate-reset-node@2.0.0
  - @udecode/plate-select@2.0.0
  - @udecode/plate-ast-serializer@2.0.0
  - @udecode/plate-serializer-csv@2.0.0
  - @udecode/plate-html-serializer@2.0.0
  - @udecode/plate-md-serializer@2.0.0
  - @udecode/plate-serializer@2.0.0
  - @udecode/plate-trailing-block@2.0.0
  - @udecode/plate-styled-components@2.0.0
  - @udecode/plate-toolbar@2.0.0

## 1.1.8

### Patch Changes

- Updated dependencies [[`a3825e35`](https://github.com/udecode/plate/commit/a3825e3556e9980b8cce39d454aa4d3c8ea78586)]:
  - @udecode/plate-list@1.1.8
  - @udecode/plate-list-ui@1.1.8
  - @udecode/plate-ast-serializer@1.1.8
  - @udecode/plate-md-serializer@1.1.8

## 1.1.7

### Patch Changes

- Updated dependencies [[`10064d24`](https://github.com/udecode/plate/commit/10064d24dde293768452abb7c853dc75cbde2c78)]:
  - @udecode/plate-dnd@1.1.7
  - @udecode/plate-mention@1.1.7
  - @udecode/plate-html-serializer@1.1.7
  - @udecode/plate-styled-components@1.1.7
  - @udecode/plate-mention-ui@1.1.7
  - @udecode/plate-alignment-ui@1.1.7
  - @udecode/plate-block-quote-ui@1.1.7
  - @udecode/plate-code-block-ui@1.1.7
  - @udecode/plate-image-ui@1.1.7
  - @udecode/plate-link-ui@1.1.7
  - @udecode/plate-list-ui@1.1.7
  - @udecode/plate-media-embed-ui@1.1.7
  - @udecode/plate-table-ui@1.1.7
  - @udecode/plate-find-replace-ui@1.1.7
  - @udecode/plate-font-ui@1.1.7
  - @udecode/plate-placeholder@1.1.7
  - @udecode/plate-toolbar@1.1.7

## 1.1.6

### Patch Changes

- Updated dependencies [[`7d045d8d`](https://github.com/udecode/plate/commit/7d045d8db39515d4574c5313cc97287486c5866b)]:
  - @udecode/plate-autoformat@1.1.6
  - @udecode/plate-break@1.1.6
  - @udecode/plate-common@1.1.6
  - @udecode/plate-alignment-ui@1.1.6
  - @udecode/plate-alignment@1.1.6
  - @udecode/plate-basic-elements@1.1.6
  - @udecode/plate-block-quote-ui@1.1.6
  - @udecode/plate-block-quote@1.1.6
  - @udecode/plate-code-block-ui@1.1.6
  - @udecode/plate-code-block@1.1.6
  - @udecode/plate-heading@1.1.6
  - @udecode/plate-image-ui@1.1.6
  - @udecode/plate-image@1.1.6
  - @udecode/plate-link-ui@1.1.6
  - @udecode/plate-link@1.1.6
  - @udecode/plate-list-ui@1.1.6
  - @udecode/plate-list@1.1.6
  - @udecode/plate-media-embed-ui@1.1.6
  - @udecode/plate-media-embed@1.1.6
  - @udecode/plate-mention-ui@1.1.6
  - @udecode/plate-mention@1.1.6
  - @udecode/plate-paragraph@1.1.6
  - @udecode/plate-table-ui@1.1.6
  - @udecode/plate-table@1.1.6
  - @udecode/plate-find-replace-ui@1.1.6
  - @udecode/plate-find-replace@1.1.6
  - @udecode/plate-basic-marks@1.1.6
  - @udecode/plate-font-ui@1.1.6
  - @udecode/plate-font@1.1.6
  - @udecode/plate-highlight@1.1.6
  - @udecode/plate-dnd@1.1.6
  - @udecode/plate-kbd@1.1.6
  - @udecode/plate-node-id@1.1.6
  - @udecode/plate-normalizers@1.1.6
  - @udecode/plate-placeholder@1.1.6
  - @udecode/plate-reset-node@1.1.6
  - @udecode/plate-select@1.1.6
  - @udecode/plate-ast-serializer@1.1.6
  - @udecode/plate-serializer-csv@1.1.6
  - @udecode/plate-html-serializer@1.1.6
  - @udecode/plate-md-serializer@1.1.6
  - @udecode/plate-serializer@1.1.6
  - @udecode/plate-trailing-block@1.1.6
  - @udecode/plate-styled-components@1.1.6
  - @udecode/plate-toolbar@1.1.6

## 1.1.5

### Patch Changes

- Updated dependencies [[`f955b72c`](https://github.com/udecode/plate/commit/f955b72c0ab97e2e2ca54f17f9f8022f7d0f121b)]:
  - @udecode/plate-table@1.1.5
  - @udecode/plate-table-ui@1.1.5
  - @udecode/plate-serializer-csv@1.1.5

## 1.1.4

### Patch Changes

- Updated dependencies [[`decc90d9`](https://github.com/udecode/plate/commit/decc90d984170d94ac8dbd0dc487a107d68d296d)]:
  - @udecode/plate-serializer-csv@1.1.4

## 1.1.3

### Patch Changes

- Updated dependencies [[`c5c73683`](https://github.com/udecode/plate/commit/c5c73683eb3b9c9a091fe1fa05113c9176f9b12a)]:
  - @udecode/plate-serializer-csv@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [[`b5bf8329`](https://github.com/udecode/plate/commit/b5bf8329dc745b911345f2d704660c495d1a1e0c), [`08bff1b5`](https://github.com/udecode/plate/commit/08bff1b58fb879f67bf605fd08ad507ccc13f8f3)]:
  - @udecode/plate-media-embed-ui@1.1.2
  - @udecode/plate-dnd@1.1.2

## 1.1.1

### Patch Changes

- Updated dependencies [[`135e1821`](https://github.com/udecode/plate/commit/135e18213285a9566d57b4eb5666ea0f406d03b7)]:
  - @udecode/plate-media-embed-ui@1.1.1

## 1.1.0

### Patch Changes

- Updated dependencies [[`6e8c22e3`](https://github.com/udecode/plate/commit/6e8c22e389568e44d97cf2ce582bc0e5352197b2)]:
  - @udecode/plate-media-embed-ui@1.1.0

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

### Minor Changes

- [#869](https://github.com/udecode/slate-plugins/pull/869) [`546ee49b`](https://github.com/udecode/slate-plugins/commit/546ee49b1e22464a8a0c0fad7f254da85bcfde3d) Thanks [@zbeyens](https://github.com/zbeyens)! - New package: `@udecode/slate-plugins-serializer` for common logic used by serializers

### Patch Changes

- Updated dependencies [[`546ee49b`](https://github.com/udecode/slate-plugins/commit/546ee49b1e22464a8a0c0fad7f254da85bcfde3d), [`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3), [`fd91359d`](https://github.com/udecode/slate-plugins/commit/fd91359dc3722292cee06e0f80ed414934b27572)]:
  - @udecode/slate-plugins-serializer@1.0.0-next.61
  - @udecode/slate-plugins-core@1.0.0-next.61
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.61
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.61
  - @udecode/slate-plugins-html-serializer@1.0.0-next.61
  - @udecode/slate-plugins-md-serializer@1.0.0-next.61
  - @udecode/slate-plugins-autoformat@1.0.0-next.61
  - @udecode/slate-plugins-break@1.0.0-next.61
  - @udecode/slate-plugins-common@1.0.0-next.61
  - @udecode/slate-plugins-dnd@1.0.0-next.61
  - @udecode/slate-plugins-alignment@1.0.0-next.61
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.61
  - @udecode/slate-plugins-basic-elements@1.0.0-next.61
  - @udecode/slate-plugins-block-quote@1.0.0-next.61
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.61
  - @udecode/slate-plugins-code-block@1.0.0-next.61
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.61
  - @udecode/slate-plugins-heading@1.0.0-next.61
  - @udecode/slate-plugins-image@1.0.0-next.61
  - @udecode/slate-plugins-image-ui@1.0.0-next.61
  - @udecode/slate-plugins-link@1.0.0-next.61
  - @udecode/slate-plugins-link-ui@1.0.0-next.61
  - @udecode/slate-plugins-list@1.0.0-next.61
  - @udecode/slate-plugins-list-ui@1.0.0-next.61
  - @udecode/slate-plugins-media-embed@1.0.0-next.61
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.61
  - @udecode/slate-plugins-mention@1.0.0-next.61
  - @udecode/slate-plugins-mention-ui@1.0.0-next.61
  - @udecode/slate-plugins-paragraph@1.0.0-next.61
  - @udecode/slate-plugins-table@1.0.0-next.61
  - @udecode/slate-plugins-table-ui@1.0.0-next.61
  - @udecode/slate-plugins-find-replace@1.0.0-next.61
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.61
  - @udecode/slate-plugins-basic-marks@1.0.0-next.61
  - @udecode/slate-plugins-font@1.0.0-next.61
  - @udecode/slate-plugins-font-ui@1.0.0-next.61
  - @udecode/slate-plugins-highlight@1.0.0-next.61
  - @udecode/slate-plugins-kbd@1.0.0-next.61
  - @udecode/slate-plugins-node-id@1.0.0-next.61
  - @udecode/slate-plugins-normalizers@1.0.0-next.61
  - @udecode/slate-plugins-placeholder@1.0.0-next.61
  - @udecode/slate-plugins-reset-node@1.0.0-next.61
  - @udecode/slate-plugins-select@1.0.0-next.61
  - @udecode/slate-plugins-trailing-block@1.0.0-next.61
  - @udecode/slate-plugins-styled-components@1.0.0-next.61
  - @udecode/slate-plugins-toolbar@1.0.0-next.61

## 1.0.0-next.60

### Patch Changes

- Updated dependencies [[`37a52994`](https://github.com/udecode/slate-plugins/commit/37a529945a882adb0222b47a28466dd31286a354)]:
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.60
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.60
  - @udecode/slate-plugins-html-serializer@1.0.0-next.60
  - @udecode/slate-plugins-md-serializer@1.0.0-next.60

## 1.0.0-next.59

### Patch Changes

- Updated dependencies [[`3a3eb1b8`](https://github.com/udecode/slate-plugins/commit/3a3eb1b8565789b7ba49e8170479df8245ed5b22)]:
  - @udecode/slate-plugins-common@1.0.0-next.59
  - @udecode/slate-plugins-autoformat@1.0.0-next.59
  - @udecode/slate-plugins-break@1.0.0-next.59
  - @udecode/slate-plugins-dnd@1.0.0-next.59
  - @udecode/slate-plugins-alignment@1.0.0-next.59
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.59
  - @udecode/slate-plugins-basic-elements@1.0.0-next.59
  - @udecode/slate-plugins-block-quote@1.0.0-next.59
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.59
  - @udecode/slate-plugins-code-block@1.0.0-next.59
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.59
  - @udecode/slate-plugins-heading@1.0.0-next.59
  - @udecode/slate-plugins-image@1.0.0-next.59
  - @udecode/slate-plugins-image-ui@1.0.0-next.59
  - @udecode/slate-plugins-link@1.0.0-next.59
  - @udecode/slate-plugins-link-ui@1.0.0-next.59
  - @udecode/slate-plugins-list@1.0.0-next.59
  - @udecode/slate-plugins-list-ui@1.0.0-next.59
  - @udecode/slate-plugins-media-embed@1.0.0-next.59
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.59
  - @udecode/slate-plugins-mention@1.0.0-next.59
  - @udecode/slate-plugins-mention-ui@1.0.0-next.59
  - @udecode/slate-plugins-paragraph@1.0.0-next.59
  - @udecode/slate-plugins-table@1.0.0-next.59
  - @udecode/slate-plugins-table-ui@1.0.0-next.59
  - @udecode/slate-plugins-find-replace@1.0.0-next.59
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.59
  - @udecode/slate-plugins-basic-marks@1.0.0-next.59
  - @udecode/slate-plugins-font@1.0.0-next.59
  - @udecode/slate-plugins-font-ui@1.0.0-next.59
  - @udecode/slate-plugins-highlight@1.0.0-next.59
  - @udecode/slate-plugins-kbd@1.0.0-next.59
  - @udecode/slate-plugins-node-id@1.0.0-next.59
  - @udecode/slate-plugins-normalizers@1.0.0-next.59
  - @udecode/slate-plugins-placeholder@1.0.0-next.59
  - @udecode/slate-plugins-reset-node@1.0.0-next.59
  - @udecode/slate-plugins-select@1.0.0-next.59
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.59
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.59
  - @udecode/slate-plugins-html-serializer@1.0.0-next.59
  - @udecode/slate-plugins-md-serializer@1.0.0-next.59
  - @udecode/slate-plugins-trailing-block@1.0.0-next.59
  - @udecode/slate-plugins-styled-components@1.0.0-next.59
  - @udecode/slate-plugins-toolbar@1.0.0-next.59

## 1.0.0-next.58

### Patch Changes

- Updated dependencies [[`db6371c3`](https://github.com/udecode/slate-plugins/commit/db6371c36e389cb03901a119194dd93652134554)]:
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.58
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.58
  - @udecode/slate-plugins-html-serializer@1.0.0-next.58
  - @udecode/slate-plugins-md-serializer@1.0.0-next.58

## 1.0.0-next.57

### Patch Changes

- Updated dependencies [[`5abacbc2`](https://github.com/udecode/slate-plugins/commit/5abacbc23af67f9388536f73076d026b89b24c5c)]:
  - @udecode/slate-plugins-list@1.0.0-next.57
  - @udecode/slate-plugins-list-ui@1.0.0-next.57
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.57
  - @udecode/slate-plugins-md-serializer@1.0.0-next.57

## 1.0.0-next.56

### Patch Changes

- Updated dependencies [[`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d)]:
  - @udecode/slate-plugins-core@1.0.0-next.56
  - @udecode/slate-plugins-autoformat@1.0.0-next.56
  - @udecode/slate-plugins-break@1.0.0-next.56
  - @udecode/slate-plugins-common@1.0.0-next.56
  - @udecode/slate-plugins-dnd@1.0.0-next.56
  - @udecode/slate-plugins-alignment@1.0.0-next.56
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.56
  - @udecode/slate-plugins-basic-elements@1.0.0-next.56
  - @udecode/slate-plugins-block-quote@1.0.0-next.56
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.56
  - @udecode/slate-plugins-code-block@1.0.0-next.56
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.56
  - @udecode/slate-plugins-heading@1.0.0-next.56
  - @udecode/slate-plugins-image@1.0.0-next.56
  - @udecode/slate-plugins-image-ui@1.0.0-next.56
  - @udecode/slate-plugins-link@1.0.0-next.56
  - @udecode/slate-plugins-link-ui@1.0.0-next.56
  - @udecode/slate-plugins-list@1.0.0-next.56
  - @udecode/slate-plugins-list-ui@1.0.0-next.56
  - @udecode/slate-plugins-media-embed@1.0.0-next.56
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.56
  - @udecode/slate-plugins-mention@1.0.0-next.56
  - @udecode/slate-plugins-mention-ui@1.0.0-next.56
  - @udecode/slate-plugins-paragraph@1.0.0-next.56
  - @udecode/slate-plugins-table@1.0.0-next.56
  - @udecode/slate-plugins-table-ui@1.0.0-next.56
  - @udecode/slate-plugins-find-replace@1.0.0-next.56
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.56
  - @udecode/slate-plugins-basic-marks@1.0.0-next.56
  - @udecode/slate-plugins-font@1.0.0-next.56
  - @udecode/slate-plugins-font-ui@1.0.0-next.56
  - @udecode/slate-plugins-highlight@1.0.0-next.56
  - @udecode/slate-plugins-kbd@1.0.0-next.56
  - @udecode/slate-plugins-node-id@1.0.0-next.56
  - @udecode/slate-plugins-normalizers@1.0.0-next.56
  - @udecode/slate-plugins-placeholder@1.0.0-next.56
  - @udecode/slate-plugins-reset-node@1.0.0-next.56
  - @udecode/slate-plugins-select@1.0.0-next.56
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.56
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.56
  - @udecode/slate-plugins-html-serializer@1.0.0-next.56
  - @udecode/slate-plugins-md-serializer@1.0.0-next.56
  - @udecode/slate-plugins-trailing-block@1.0.0-next.56
  - @udecode/slate-plugins-styled-components@1.0.0-next.56
  - @udecode/slate-plugins-toolbar@1.0.0-next.56

## 1.0.0-next.55

### Patch Changes

- Updated dependencies [[`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79)]:
  - @udecode/slate-plugins-core@1.0.0-next.55
  - @udecode/slate-plugins-autoformat@1.0.0-next.55
  - @udecode/slate-plugins-break@1.0.0-next.55
  - @udecode/slate-plugins-common@1.0.0-next.55
  - @udecode/slate-plugins-dnd@1.0.0-next.55
  - @udecode/slate-plugins-alignment@1.0.0-next.55
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.55
  - @udecode/slate-plugins-basic-elements@1.0.0-next.55
  - @udecode/slate-plugins-block-quote@1.0.0-next.55
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.55
  - @udecode/slate-plugins-code-block@1.0.0-next.55
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.55
  - @udecode/slate-plugins-heading@1.0.0-next.55
  - @udecode/slate-plugins-image@1.0.0-next.55
  - @udecode/slate-plugins-image-ui@1.0.0-next.55
  - @udecode/slate-plugins-link@1.0.0-next.55
  - @udecode/slate-plugins-link-ui@1.0.0-next.55
  - @udecode/slate-plugins-list@1.0.0-next.55
  - @udecode/slate-plugins-list-ui@1.0.0-next.55
  - @udecode/slate-plugins-media-embed@1.0.0-next.55
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.55
  - @udecode/slate-plugins-mention@1.0.0-next.55
  - @udecode/slate-plugins-mention-ui@1.0.0-next.55
  - @udecode/slate-plugins-paragraph@1.0.0-next.55
  - @udecode/slate-plugins-table@1.0.0-next.55
  - @udecode/slate-plugins-table-ui@1.0.0-next.55
  - @udecode/slate-plugins-find-replace@1.0.0-next.55
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.55
  - @udecode/slate-plugins-basic-marks@1.0.0-next.55
  - @udecode/slate-plugins-font@1.0.0-next.55
  - @udecode/slate-plugins-font-ui@1.0.0-next.55
  - @udecode/slate-plugins-highlight@1.0.0-next.55
  - @udecode/slate-plugins-kbd@1.0.0-next.55
  - @udecode/slate-plugins-node-id@1.0.0-next.55
  - @udecode/slate-plugins-normalizers@1.0.0-next.55
  - @udecode/slate-plugins-placeholder@1.0.0-next.55
  - @udecode/slate-plugins-reset-node@1.0.0-next.55
  - @udecode/slate-plugins-select@1.0.0-next.55
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.55
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.55
  - @udecode/slate-plugins-html-serializer@1.0.0-next.55
  - @udecode/slate-plugins-md-serializer@1.0.0-next.55
  - @udecode/slate-plugins-trailing-block@1.0.0-next.55
  - @udecode/slate-plugins-styled-components@1.0.0-next.55
  - @udecode/slate-plugins-toolbar@1.0.0-next.55

## 1.0.0-next.54

### Patch Changes

- Updated dependencies [[`477bab57`](https://github.com/udecode/slate-plugins/commit/477bab572d943b21d3390c440f28e76074484a56), [`bf693c13`](https://github.com/udecode/slate-plugins/commit/bf693c1327c3c6af0d641af5fe7a956e564a995e), [`f9e4cb95`](https://github.com/udecode/slate-plugins/commit/f9e4cb9505837dd7ba59df3f2598f7ed112d8896), [`d906095d`](https://github.com/udecode/slate-plugins/commit/d906095d20cf8755a200d254f6c20c510a748f29)]:
  - @udecode/slate-plugins-list@1.0.0-next.54
  - @udecode/slate-plugins-reset-node@1.0.0-next.54
  - @udecode/slate-plugins-styled-components@1.0.0-next.54
  - @udecode/slate-plugins-common@1.0.0-next.54
  - @udecode/slate-plugins-list-ui@1.0.0-next.54
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.54
  - @udecode/slate-plugins-md-serializer@1.0.0-next.54
  - @udecode/slate-plugins-dnd@1.0.0-next.54
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.54
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.54
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.54
  - @udecode/slate-plugins-image-ui@1.0.0-next.54
  - @udecode/slate-plugins-link-ui@1.0.0-next.54
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.54
  - @udecode/slate-plugins-mention-ui@1.0.0-next.54
  - @udecode/slate-plugins-table-ui@1.0.0-next.54
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.54
  - @udecode/slate-plugins-font-ui@1.0.0-next.54
  - @udecode/slate-plugins-placeholder@1.0.0-next.54
  - @udecode/slate-plugins-toolbar@1.0.0-next.54
  - @udecode/slate-plugins-autoformat@1.0.0-next.54
  - @udecode/slate-plugins-break@1.0.0-next.54
  - @udecode/slate-plugins-alignment@1.0.0-next.54
  - @udecode/slate-plugins-basic-elements@1.0.0-next.54
  - @udecode/slate-plugins-block-quote@1.0.0-next.54
  - @udecode/slate-plugins-code-block@1.0.0-next.54
  - @udecode/slate-plugins-heading@1.0.0-next.54
  - @udecode/slate-plugins-image@1.0.0-next.54
  - @udecode/slate-plugins-link@1.0.0-next.54
  - @udecode/slate-plugins-media-embed@1.0.0-next.54
  - @udecode/slate-plugins-mention@1.0.0-next.54
  - @udecode/slate-plugins-paragraph@1.0.0-next.54
  - @udecode/slate-plugins-table@1.0.0-next.54
  - @udecode/slate-plugins-find-replace@1.0.0-next.54
  - @udecode/slate-plugins-basic-marks@1.0.0-next.54
  - @udecode/slate-plugins-font@1.0.0-next.54
  - @udecode/slate-plugins-highlight@1.0.0-next.54
  - @udecode/slate-plugins-kbd@1.0.0-next.54
  - @udecode/slate-plugins-node-id@1.0.0-next.54
  - @udecode/slate-plugins-normalizers@1.0.0-next.54
  - @udecode/slate-plugins-select@1.0.0-next.54
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.54
  - @udecode/slate-plugins-html-serializer@1.0.0-next.54
  - @udecode/slate-plugins-trailing-block@1.0.0-next.54

## 1.0.0-next.53

### Patch Changes

- Updated dependencies [[`1e9ba6d9`](https://github.com/udecode/slate-plugins/commit/1e9ba6d9bec22e279b84bb1dfa61cfeb8dd19683), [`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af)]:
  - @udecode/slate-plugins-dnd@1.0.0-next.53
  - @udecode/slate-plugins-core@1.0.0-next.53
  - @udecode/slate-plugins-autoformat@1.0.0-next.53
  - @udecode/slate-plugins-break@1.0.0-next.53
  - @udecode/slate-plugins-common@1.0.0-next.53
  - @udecode/slate-plugins-alignment@1.0.0-next.53
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.53
  - @udecode/slate-plugins-basic-elements@1.0.0-next.53
  - @udecode/slate-plugins-block-quote@1.0.0-next.53
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.53
  - @udecode/slate-plugins-code-block@1.0.0-next.53
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.53
  - @udecode/slate-plugins-heading@1.0.0-next.53
  - @udecode/slate-plugins-image@1.0.0-next.53
  - @udecode/slate-plugins-image-ui@1.0.0-next.53
  - @udecode/slate-plugins-link@1.0.0-next.53
  - @udecode/slate-plugins-link-ui@1.0.0-next.53
  - @udecode/slate-plugins-list@1.0.0-next.53
  - @udecode/slate-plugins-list-ui@1.0.0-next.53
  - @udecode/slate-plugins-media-embed@1.0.0-next.53
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.53
  - @udecode/slate-plugins-mention@1.0.0-next.53
  - @udecode/slate-plugins-mention-ui@1.0.0-next.53
  - @udecode/slate-plugins-paragraph@1.0.0-next.53
  - @udecode/slate-plugins-table@1.0.0-next.53
  - @udecode/slate-plugins-table-ui@1.0.0-next.53
  - @udecode/slate-plugins-find-replace@1.0.0-next.53
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.53
  - @udecode/slate-plugins-basic-marks@1.0.0-next.53
  - @udecode/slate-plugins-highlight@1.0.0-next.53
  - @udecode/slate-plugins-kbd@1.0.0-next.53
  - @udecode/slate-plugins-node-id@1.0.0-next.53
  - @udecode/slate-plugins-normalizers@1.0.0-next.53
  - @udecode/slate-plugins-placeholder@1.0.0-next.53
  - @udecode/slate-plugins-reset-node@1.0.0-next.53
  - @udecode/slate-plugins-select@1.0.0-next.53
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.53
  - @udecode/slate-plugins-csv-serializer@1.0.0-next.53
  - @udecode/slate-plugins-html-serializer@1.0.0-next.53
  - @udecode/slate-plugins-md-serializer@1.0.0-next.53
  - @udecode/slate-plugins-trailing-block@1.0.0-next.53
  - @udecode/slate-plugins-styled-components@1.0.0-next.53
  - @udecode/slate-plugins-toolbar@1.0.0-next.53

## 1.0.0-next.52

### Patch Changes

- [#837](https://github.com/udecode/slate-plugins/pull/837) [`bc3910e1`](https://github.com/udecode/slate-plugins/commit/bc3910e11f8a31ef8853f2c4bf9c9ec73a2285d0) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: export csv-serializer

- Updated dependencies [[`e99dc2db`](https://github.com/udecode/slate-plugins/commit/e99dc2db6c462a72d536843c48f1f0e5ed4fa410)]:
  - @udecode/slate-plugins-dnd@1.0.0-next.52

## 1.0.0-next.51

### Patch Changes

- [#823](https://github.com/udecode/slate-plugins/pull/823) [`72aec67b`](https://github.com/udecode/slate-plugins/commit/72aec67b584e55ecc36a1532e8d7f9519a87f3c3) Thanks [@dylans](https://github.com/dylans)! - Missed adding new package for top-level package.json

- Updated dependencies [[`be3023db`](https://github.com/udecode/slate-plugins/commit/be3023db20dd3f57c704244aa432d41036b3cba9), [`0c02cee8`](https://github.com/udecode/slate-plugins/commit/0c02cee8cc7b105ab27a329882991d86253c0517)]:
  - @udecode/slate-plugins-list@1.0.0-next.51
  - @udecode/slate-plugins-styled-components@1.0.0-next.51
  - @udecode/slate-plugins-dnd@1.0.0-next.51
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.51
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.51
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.51
  - @udecode/slate-plugins-image-ui@1.0.0-next.51
  - @udecode/slate-plugins-link-ui@1.0.0-next.51
  - @udecode/slate-plugins-list-ui@1.0.0-next.51
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.51
  - @udecode/slate-plugins-mention-ui@1.0.0-next.51
  - @udecode/slate-plugins-table-ui@1.0.0-next.51
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.51
  - @udecode/slate-plugins-placeholder@1.0.0-next.51
  - @udecode/slate-plugins-toolbar@1.0.0-next.51

## 1.0.0-next.50

### Patch Changes

- Updated dependencies [[`92e19158`](https://github.com/udecode/slate-plugins/commit/92e19158fe6edf93c238e5de9727505967071b96)]:
  - @udecode/slate-plugins-list@1.0.0-next.50
  - @udecode/slate-plugins-reset-node@1.0.0-next.50

## 1.0.0-next.48

### Patch Changes

- Updated dependencies [[`091f0940`](https://github.com/udecode/slate-plugins/commit/091f0940bd3c06c3dfaf49a4ab14eb611678637d), [`a15ab621`](https://github.com/udecode/slate-plugins/commit/a15ab6217c6e2d4eb2a1320f6b76c483fc963047), [`b82f47a6`](https://github.com/udecode/slate-plugins/commit/b82f47a66ea1521dc426ae87e1ec37f004593cbe)]:
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.48
  - @udecode/slate-plugins-html-serializer@1.0.0-next.48
  - @udecode/slate-plugins-md-serializer@1.0.0-next.48
  - @udecode/slate-plugins-list@1.0.0-next.48
  - @udecode/slate-plugins-list-ui@1.0.0-next.48

## 1.0.0-next.47

### Patch Changes

- Updated dependencies [[`2d671565`](https://github.com/udecode/slate-plugins/commit/2d67156509ca8689aede2d4a9a45f749772c789c), [`1bbdae38`](https://github.com/udecode/slate-plugins/commit/1bbdae389e7ec3ec7a54877526055a9464e46fdf)]:
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.47
  - @udecode/slate-plugins-html-serializer@1.0.0-next.47
  - @udecode/slate-plugins-md-serializer@1.0.0-next.47

## 1.0.0-next.46

### Patch Changes

- Updated dependencies [[`6e9068f6`](https://github.com/udecode/slate-plugins/commit/6e9068f6f483b698b6b3aae6819333103504f41b)]:
  - @udecode/slate-plugins-common@1.0.0-next.46
  - @udecode/slate-plugins-autoformat@1.0.0-next.46
  - @udecode/slate-plugins-break@1.0.0-next.46
  - @udecode/slate-plugins-dnd@1.0.0-next.46
  - @udecode/slate-plugins-alignment@1.0.0-next.46
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.46
  - @udecode/slate-plugins-basic-elements@1.0.0-next.46
  - @udecode/slate-plugins-block-quote@1.0.0-next.46
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.46
  - @udecode/slate-plugins-code-block@1.0.0-next.46
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.46
  - @udecode/slate-plugins-heading@1.0.0-next.46
  - @udecode/slate-plugins-image@1.0.0-next.46
  - @udecode/slate-plugins-image-ui@1.0.0-next.46
  - @udecode/slate-plugins-link@1.0.0-next.46
  - @udecode/slate-plugins-link-ui@1.0.0-next.46
  - @udecode/slate-plugins-list@1.0.0-next.46
  - @udecode/slate-plugins-list-ui@1.0.0-next.46
  - @udecode/slate-plugins-media-embed@1.0.0-next.46
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.46
  - @udecode/slate-plugins-mention@1.0.0-next.46
  - @udecode/slate-plugins-mention-ui@1.0.0-next.46
  - @udecode/slate-plugins-paragraph@1.0.0-next.46
  - @udecode/slate-plugins-table@1.0.0-next.46
  - @udecode/slate-plugins-table-ui@1.0.0-next.46
  - @udecode/slate-plugins-find-replace@1.0.0-next.46
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.46
  - @udecode/slate-plugins-basic-marks@1.0.0-next.46
  - @udecode/slate-plugins-highlight@1.0.0-next.46
  - @udecode/slate-plugins-kbd@1.0.0-next.46
  - @udecode/slate-plugins-node-id@1.0.0-next.46
  - @udecode/slate-plugins-normalizers@1.0.0-next.46
  - @udecode/slate-plugins-placeholder@1.0.0-next.46
  - @udecode/slate-plugins-reset-node@1.0.0-next.46
  - @udecode/slate-plugins-select@1.0.0-next.46
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.46
  - @udecode/slate-plugins-html-serializer@1.0.0-next.46
  - @udecode/slate-plugins-md-serializer@1.0.0-next.46
  - @udecode/slate-plugins-trailing-block@1.0.0-next.46
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.46
  - @udecode/slate-plugins-toolbar@1.0.0-next.46

## 1.0.0-next.45

### Minor Changes

- [#785](https://github.com/udecode/slate-plugins/pull/785) [`11884ecc`](https://github.com/udecode/slate-plugins/commit/11884eccfd4c390d2adfdbc331d126cd332a9afa) Thanks [@dylans](https://github.com/dylans)! - Add ast decode+fix for paste from slate ast format

### Patch Changes

- Updated dependencies [[`11884ecc`](https://github.com/udecode/slate-plugins/commit/11884eccfd4c390d2adfdbc331d126cd332a9afa)]:
  - @udecode/slate-plugins-ast-serializer@1.0.0-next.45

## 1.0.0-next.44

### Patch Changes

- Updated dependencies [[`7f5f223d`](https://github.com/udecode/slate-plugins/commit/7f5f223d39e0b6a6381d42d1a95d73592960319a)]:
  - @udecode/slate-plugins-md-serializer@1.0.0-next.44

## 1.0.0-next.43

### Patch Changes

- Updated dependencies [[`e70f8043`](https://github.com/udecode/slate-plugins/commit/e70f8043125d06161fa3ea5d47810749782e0a8a)]:
  - @udecode/slate-plugins-list@1.0.0-next.43
  - @udecode/slate-plugins-list-ui@1.0.0-next.43
  - @udecode/slate-plugins-md-serializer@1.0.0-next.43

## 1.0.0-next.42

### Patch Changes

- Updated dependencies [[`e10f2fa4`](https://github.com/udecode/slate-plugins/commit/e10f2fa4963efdfef9e642a5125942c4819cfe9c), [`558a89da`](https://github.com/udecode/slate-plugins/commit/558a89da4217e9be57bc6ab2abcc48482c9f60bd)]:
  - @udecode/slate-plugins-list@1.0.0-next.42
  - @udecode/slate-plugins-list-ui@1.0.0-next.42
  - @udecode/slate-plugins-md-serializer@1.0.0-next.42

## 1.0.0-next.41

### Patch Changes

- Updated dependencies [[`786989d2`](https://github.com/udecode/slate-plugins/commit/786989d2b1263e2e3d40811649310af5de1a61c3)]:
  - @udecode/slate-plugins-dnd@1.0.0-next.41

## 1.0.0-next.40

### Patch Changes

- Updated dependencies [[`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89)]:
  - @udecode/slate-plugins-core@1.0.0-next.40
  - @udecode/slate-plugins-autoformat@1.0.0-next.40
  - @udecode/slate-plugins-break@1.0.0-next.40
  - @udecode/slate-plugins-common@1.0.0-next.40
  - @udecode/slate-plugins-dnd@1.0.0-next.40
  - @udecode/slate-plugins-alignment@1.0.0-next.40
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.40
  - @udecode/slate-plugins-basic-elements@1.0.0-next.40
  - @udecode/slate-plugins-block-quote@1.0.0-next.40
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.40
  - @udecode/slate-plugins-code-block@1.0.0-next.40
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.40
  - @udecode/slate-plugins-heading@1.0.0-next.40
  - @udecode/slate-plugins-image@1.0.0-next.40
  - @udecode/slate-plugins-image-ui@1.0.0-next.40
  - @udecode/slate-plugins-link@1.0.0-next.40
  - @udecode/slate-plugins-link-ui@1.0.0-next.40
  - @udecode/slate-plugins-list@1.0.0-next.40
  - @udecode/slate-plugins-list-ui@1.0.0-next.40
  - @udecode/slate-plugins-media-embed@1.0.0-next.40
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.40
  - @udecode/slate-plugins-mention@1.0.0-next.40
  - @udecode/slate-plugins-mention-ui@1.0.0-next.40
  - @udecode/slate-plugins-paragraph@1.0.0-next.40
  - @udecode/slate-plugins-table@1.0.0-next.40
  - @udecode/slate-plugins-table-ui@1.0.0-next.40
  - @udecode/slate-plugins-find-replace@1.0.0-next.40
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.40
  - @udecode/slate-plugins-basic-marks@1.0.0-next.40
  - @udecode/slate-plugins-highlight@1.0.0-next.40
  - @udecode/slate-plugins-kbd@1.0.0-next.40
  - @udecode/slate-plugins-node-id@1.0.0-next.40
  - @udecode/slate-plugins-normalizers@1.0.0-next.40
  - @udecode/slate-plugins-placeholder@1.0.0-next.40
  - @udecode/slate-plugins-reset-node@1.0.0-next.40
  - @udecode/slate-plugins-select@1.0.0-next.40
  - @udecode/slate-plugins-html-serializer@1.0.0-next.40
  - @udecode/slate-plugins-md-serializer@1.0.0-next.40
  - @udecode/slate-plugins-trailing-block@1.0.0-next.40
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.40
  - @udecode/slate-plugins-toolbar@1.0.0-next.40

## 1.0.0-next.39

### Patch Changes

- Updated dependencies [[`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631)]:
  - @udecode/slate-plugins-core@1.0.0-next.39
  - @udecode/slate-plugins-autoformat@1.0.0-next.39
  - @udecode/slate-plugins-break@1.0.0-next.39
  - @udecode/slate-plugins-common@1.0.0-next.39
  - @udecode/slate-plugins-dnd@1.0.0-next.39
  - @udecode/slate-plugins-alignment@1.0.0-next.39
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.39
  - @udecode/slate-plugins-basic-elements@1.0.0-next.39
  - @udecode/slate-plugins-block-quote@1.0.0-next.39
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.39
  - @udecode/slate-plugins-code-block@1.0.0-next.39
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.39
  - @udecode/slate-plugins-heading@1.0.0-next.39
  - @udecode/slate-plugins-image@1.0.0-next.39
  - @udecode/slate-plugins-image-ui@1.0.0-next.39
  - @udecode/slate-plugins-link@1.0.0-next.39
  - @udecode/slate-plugins-link-ui@1.0.0-next.39
  - @udecode/slate-plugins-list@1.0.0-next.39
  - @udecode/slate-plugins-list-ui@1.0.0-next.39
  - @udecode/slate-plugins-media-embed@1.0.0-next.39
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.39
  - @udecode/slate-plugins-mention@1.0.0-next.39
  - @udecode/slate-plugins-mention-ui@1.0.0-next.39
  - @udecode/slate-plugins-paragraph@1.0.0-next.39
  - @udecode/slate-plugins-table@1.0.0-next.39
  - @udecode/slate-plugins-table-ui@1.0.0-next.39
  - @udecode/slate-plugins-find-replace@1.0.0-next.39
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.39
  - @udecode/slate-plugins-basic-marks@1.0.0-next.39
  - @udecode/slate-plugins-highlight@1.0.0-next.39
  - @udecode/slate-plugins-kbd@1.0.0-next.39
  - @udecode/slate-plugins-node-id@1.0.0-next.39
  - @udecode/slate-plugins-normalizers@1.0.0-next.39
  - @udecode/slate-plugins-placeholder@1.0.0-next.39
  - @udecode/slate-plugins-reset-node@1.0.0-next.39
  - @udecode/slate-plugins-select@1.0.0-next.39
  - @udecode/slate-plugins-html-serializer@1.0.0-next.39
  - @udecode/slate-plugins-md-serializer@1.0.0-next.39
  - @udecode/slate-plugins-trailing-block@1.0.0-next.39
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.39
  - @udecode/slate-plugins-toolbar@1.0.0-next.39

## 1.0.0-next.38

### Patch Changes

- Updated dependencies [[`f4c3b4fb`](https://github.com/udecode/slate-plugins/commit/f4c3b4fbe1f8c057f3f2d33ee4f8a6ae9768f9bf), [`317f6205`](https://github.com/udecode/slate-plugins/commit/317f620598d19f2f9ebf01b4f92256bf0ca05097)]:
  - @udecode/slate-plugins-list@1.0.0-next.38
  - @udecode/slate-plugins-list-ui@1.0.0-next.38
  - @udecode/slate-plugins-md-serializer@1.0.0-next.38

## 1.0.0-next.37

### Patch Changes

- Updated dependencies [[`2cf618c3`](https://github.com/udecode/slate-plugins/commit/2cf618c3a0220ca03c1d95e0b51d1ff58d73578c), [`097d3f3d`](https://github.com/udecode/slate-plugins/commit/097d3f3d3517a5352b6a84bb63a5d97a39aed52f)]:
  - @udecode/slate-plugins-common@1.0.0-next.37
  - @udecode/slate-plugins-html-serializer@1.0.0-next.37
  - @udecode/slate-plugins-autoformat@1.0.0-next.37
  - @udecode/slate-plugins-break@1.0.0-next.37
  - @udecode/slate-plugins-dnd@1.0.0-next.37
  - @udecode/slate-plugins-alignment@1.0.0-next.37
  - @udecode/slate-plugins-block-quote@1.0.0-next.37
  - @udecode/slate-plugins-code-block@1.0.0-next.37
  - @udecode/slate-plugins-heading@1.0.0-next.37
  - @udecode/slate-plugins-image@1.0.0-next.37
  - @udecode/slate-plugins-link@1.0.0-next.37
  - @udecode/slate-plugins-list@1.0.0-next.37
  - @udecode/slate-plugins-media-embed@1.0.0-next.37
  - @udecode/slate-plugins-mention@1.0.0-next.37
  - @udecode/slate-plugins-paragraph@1.0.0-next.37
  - @udecode/slate-plugins-table@1.0.0-next.37
  - @udecode/slate-plugins-find-replace@1.0.0-next.37
  - @udecode/slate-plugins-basic-marks@1.0.0-next.37
  - @udecode/slate-plugins-highlight@1.0.0-next.37
  - @udecode/slate-plugins-kbd@1.0.0-next.37
  - @udecode/slate-plugins-node-id@1.0.0-next.37
  - @udecode/slate-plugins-normalizers@1.0.0-next.37
  - @udecode/slate-plugins-reset-node@1.0.0-next.37
  - @udecode/slate-plugins-select@1.0.0-next.37
  - @udecode/slate-plugins-md-serializer@1.0.0-next.37
  - @udecode/slate-plugins-trailing-block@1.0.0-next.37
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.37
  - @udecode/slate-plugins-toolbar@1.0.0-next.37
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.37
  - @udecode/slate-plugins-basic-elements@1.0.0-next.37
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.37
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.37
  - @udecode/slate-plugins-image-ui@1.0.0-next.37
  - @udecode/slate-plugins-link-ui@1.0.0-next.37
  - @udecode/slate-plugins-list-ui@1.0.0-next.37
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.37
  - @udecode/slate-plugins-mention-ui@1.0.0-next.37
  - @udecode/slate-plugins-table-ui@1.0.0-next.37
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.37
  - @udecode/slate-plugins-placeholder@1.0.0-next.37

## 1.0.0-next.36

### Patch Changes

- Updated dependencies [[`7cbd7bd9`](https://github.com/udecode/slate-plugins/commit/7cbd7bd95b64e06fde38dcd68935984de8f3a82f), [`3ecfc2b2`](https://github.com/udecode/slate-plugins/commit/3ecfc2b2d1fe65c3b772b63fe1ca046cc43e7aa0), [`abe34bfa`](https://github.com/udecode/slate-plugins/commit/abe34bfa83265a9404ed911e03ba455dfa01a769), [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e)]:
  - @udecode/slate-plugins-common@1.0.0-next.36
  - @udecode/slate-plugins-trailing-block@1.0.0-next.36
  - @udecode/slate-plugins-basic-marks@1.0.0-next.36
  - @udecode/slate-plugins-core@1.0.0-next.36
  - @udecode/slate-plugins-autoformat@1.0.0-next.36
  - @udecode/slate-plugins-break@1.0.0-next.36
  - @udecode/slate-plugins-dnd@1.0.0-next.36
  - @udecode/slate-plugins-alignment@1.0.0-next.36
  - @udecode/slate-plugins-block-quote@1.0.0-next.36
  - @udecode/slate-plugins-code-block@1.0.0-next.36
  - @udecode/slate-plugins-heading@1.0.0-next.36
  - @udecode/slate-plugins-image@1.0.0-next.36
  - @udecode/slate-plugins-link@1.0.0-next.36
  - @udecode/slate-plugins-list@1.0.0-next.36
  - @udecode/slate-plugins-media-embed@1.0.0-next.36
  - @udecode/slate-plugins-mention@1.0.0-next.36
  - @udecode/slate-plugins-paragraph@1.0.0-next.36
  - @udecode/slate-plugins-table@1.0.0-next.36
  - @udecode/slate-plugins-find-replace@1.0.0-next.36
  - @udecode/slate-plugins-highlight@1.0.0-next.36
  - @udecode/slate-plugins-kbd@1.0.0-next.36
  - @udecode/slate-plugins-node-id@1.0.0-next.36
  - @udecode/slate-plugins-normalizers@1.0.0-next.36
  - @udecode/slate-plugins-reset-node@1.0.0-next.36
  - @udecode/slate-plugins-select@1.0.0-next.36
  - @udecode/slate-plugins-html-serializer@1.0.0-next.36
  - @udecode/slate-plugins-md-serializer@1.0.0-next.36
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.36
  - @udecode/slate-plugins-toolbar@1.0.0-next.36
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.36
  - @udecode/slate-plugins-basic-elements@1.0.0-next.36
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.36
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.36
  - @udecode/slate-plugins-image-ui@1.0.0-next.36
  - @udecode/slate-plugins-link-ui@1.0.0-next.36
  - @udecode/slate-plugins-list-ui@1.0.0-next.36
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.36
  - @udecode/slate-plugins-mention-ui@1.0.0-next.36
  - @udecode/slate-plugins-table-ui@1.0.0-next.36
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.36
  - @udecode/slate-plugins-placeholder@1.0.0-next.36

## 1.0.0-next.35

### Patch Changes

- Updated dependencies [[`53ebb551`](https://github.com/udecode/slate-plugins/commit/53ebb551d823b092e23b49370d9a924b853bd374)]:
  - @udecode/slate-plugins-basic-marks@1.0.0-next.35

## 1.0.0-next.34

### Patch Changes

- Updated dependencies [[`33e0d16e`](https://github.com/udecode/slate-plugins/commit/33e0d16ebd7ace30fada72cb0ee98341c3917ca3)]:
  - @udecode/slate-plugins-html-serializer@1.0.0-next.34

## 1.0.0-next.33

### Patch Changes

- Updated dependencies [[`9e3246f3`](https://github.com/udecode/slate-plugins/commit/9e3246f3ae5c343d9e5d878ecc90b53776df0567)]:
  - @udecode/slate-plugins-link-ui@1.0.0-next.33

## 1.0.0-next.32

### Patch Changes

- Updated dependencies [[`73b77853`](https://github.com/udecode/slate-plugins/commit/73b77853cb38f61d4bfb31a0d604e947c130ee0f), [`a96dca85`](https://github.com/udecode/slate-plugins/commit/a96dca85a4aa9e7f97d867862fe9c44095abbd20)]:
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.32
  - @udecode/slate-plugins-alignment@1.0.0-next.32
  - @udecode/slate-plugins-basic-elements@1.0.0-next.32
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.32
  - @udecode/slate-plugins-block-quote@1.0.0-next.32
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.32
  - @udecode/slate-plugins-code-block@1.0.0-next.32
  - @udecode/slate-plugins-image-ui@1.0.0-next.32
  - @udecode/slate-plugins-image@1.0.0-next.32
  - @udecode/slate-plugins-link-ui@1.0.0-next.32
  - @udecode/slate-plugins-link@1.0.0-next.32
  - @udecode/slate-plugins-list-ui@1.0.0-next.32
  - @udecode/slate-plugins-list@1.0.0-next.32
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.32
  - @udecode/slate-plugins-media-embed@1.0.0-next.32
  - @udecode/slate-plugins-mention-ui@1.0.0-next.32
  - @udecode/slate-plugins-mention@1.0.0-next.32
  - @udecode/slate-plugins-table-ui@1.0.0-next.32
  - @udecode/slate-plugins-table@1.0.0-next.32
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.32
  - @udecode/slate-plugins-find-replace@1.0.0-next.32
  - @udecode/slate-plugins-node-id@1.0.0-next.32
  - @udecode/slate-plugins-md-serializer@1.0.0-next.32

## 1.0.0-next.31

### Patch Changes

- Updated dependencies [[`15cdf5d7`](https://github.com/udecode/slate-plugins/commit/15cdf5d7614734c78c31f290586d0d64b0cff3fd)]:
  - @udecode/slate-plugins-list@1.0.0-next.31
  - @udecode/slate-plugins-list-ui@1.0.0-next.31
  - @udecode/slate-plugins-md-serializer@1.0.0-next.31

## 1.0.0-next.30

### Patch Changes

- Updated dependencies [[`84b5feed`](https://github.com/udecode/slate-plugins/commit/84b5feedd20b12f0ec23e082d90314b045a69e62), [`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67), [`28f30c8a`](https://github.com/udecode/slate-plugins/commit/28f30c8a6b0a2d245d6f6403c8399f2e59d98b92), [`c03b511e`](https://github.com/udecode/slate-plugins/commit/c03b511ee99edd813bd23475fe2e71a21a0061a9), [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0)]:
  - @udecode/slate-plugins-list@1.0.0-next.30
  - @udecode/slate-plugins-core@1.0.0-next.30
  - @udecode/slate-plugins-break@1.0.0-next.30
  - @udecode/slate-plugins-common@1.0.0-next.30
  - @udecode/slate-plugins-code-block@1.0.0-next.30
  - @udecode/slate-plugins-trailing-block@1.0.0-next.30
  - @udecode/slate-plugins-node-id@1.0.0-next.30
  - @udecode/slate-plugins-list-ui@1.0.0-next.30
  - @udecode/slate-plugins-md-serializer@1.0.0-next.30
  - @udecode/slate-plugins-autoformat@1.0.0-next.30
  - @udecode/slate-plugins-dnd@1.0.0-next.30
  - @udecode/slate-plugins-alignment@1.0.0-next.30
  - @udecode/slate-plugins-block-quote@1.0.0-next.30
  - @udecode/slate-plugins-heading@1.0.0-next.30
  - @udecode/slate-plugins-image@1.0.0-next.30
  - @udecode/slate-plugins-link@1.0.0-next.30
  - @udecode/slate-plugins-media-embed@1.0.0-next.30
  - @udecode/slate-plugins-mention@1.0.0-next.30
  - @udecode/slate-plugins-paragraph@1.0.0-next.30
  - @udecode/slate-plugins-table@1.0.0-next.30
  - @udecode/slate-plugins-find-replace@1.0.0-next.30
  - @udecode/slate-plugins-basic-marks@1.0.0-next.30
  - @udecode/slate-plugins-highlight@1.0.0-next.30
  - @udecode/slate-plugins-kbd@1.0.0-next.30
  - @udecode/slate-plugins-normalizers@1.0.0-next.30
  - @udecode/slate-plugins-placeholder@1.0.0-next.30
  - @udecode/slate-plugins-reset-node@1.0.0-next.30
  - @udecode/slate-plugins-select@1.0.0-next.30
  - @udecode/slate-plugins-html-serializer@1.0.0-next.30
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.30
  - @udecode/slate-plugins-toolbar@1.0.0-next.30
  - @udecode/slate-plugins-basic-elements@1.0.0-next.30
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.30
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.30
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.30
  - @udecode/slate-plugins-image-ui@1.0.0-next.30
  - @udecode/slate-plugins-link-ui@1.0.0-next.30
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.30
  - @udecode/slate-plugins-mention-ui@1.0.0-next.30
  - @udecode/slate-plugins-table-ui@1.0.0-next.30
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.30

## 1.0.0-next.29

### Patch Changes

- Updated dependencies [[`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3), [`f1e6107c`](https://github.com/udecode/slate-plugins/commit/f1e6107cb1cd082f44bd48252fce0eefd576037c), [`f1e6107c`](https://github.com/udecode/slate-plugins/commit/f1e6107cb1cd082f44bd48252fce0eefd576037c)]:
  - @udecode/slate-plugins-core@1.0.0-next.29
  - @udecode/slate-plugins-placeholder@1.0.0-next.29
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.29
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.29
  - @udecode/slate-plugins-dnd@1.0.0-next.29
  - @udecode/slate-plugins-image-ui@1.0.0-next.29
  - @udecode/slate-plugins-link-ui@1.0.0-next.29
  - @udecode/slate-plugins-list-ui@1.0.0-next.29
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.29
  - @udecode/slate-plugins-mention-ui@1.0.0-next.29
  - @udecode/slate-plugins-table-ui@1.0.0-next.29
  - @udecode/slate-plugins-toolbar@1.0.0-next.29
  - @udecode/slate-plugins-autoformat@1.0.0-next.29
  - @udecode/slate-plugins-break@1.0.0-next.29
  - @udecode/slate-plugins-common@1.0.0-next.29
  - @udecode/slate-plugins-alignment@1.0.0-next.29
  - @udecode/slate-plugins-block-quote@1.0.0-next.29
  - @udecode/slate-plugins-code-block@1.0.0-next.29
  - @udecode/slate-plugins-heading@1.0.0-next.29
  - @udecode/slate-plugins-image@1.0.0-next.29
  - @udecode/slate-plugins-link@1.0.0-next.29
  - @udecode/slate-plugins-list@1.0.0-next.29
  - @udecode/slate-plugins-media-embed@1.0.0-next.29
  - @udecode/slate-plugins-mention@1.0.0-next.29
  - @udecode/slate-plugins-paragraph@1.0.0-next.29
  - @udecode/slate-plugins-table@1.0.0-next.29
  - @udecode/slate-plugins-find-replace@1.0.0-next.29
  - @udecode/slate-plugins-basic-marks@1.0.0-next.29
  - @udecode/slate-plugins-highlight@1.0.0-next.29
  - @udecode/slate-plugins-kbd@1.0.0-next.29
  - @udecode/slate-plugins-node-id@1.0.0-next.29
  - @udecode/slate-plugins-normalizers@1.0.0-next.29
  - @udecode/slate-plugins-reset-node@1.0.0-next.29
  - @udecode/slate-plugins-select@1.0.0-next.29
  - @udecode/slate-plugins-html-serializer@1.0.0-next.29
  - @udecode/slate-plugins-md-serializer@1.0.0-next.29
  - @udecode/slate-plugins-trailing-block@1.0.0-next.29
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.29
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.29
  - @udecode/slate-plugins-basic-elements@1.0.0-next.29
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.29

## 1.0.0-next.28

### Patch Changes

- Updated dependencies [[`97d4cd29`](https://github.com/udecode/slate-plugins/commit/97d4cd29359000fa8bb104d8186210d7b8b0c461)]:
  - @udecode/slate-plugins-mention@1.0.0-next.28
  - @udecode/slate-plugins-mention-ui@1.0.0-next.28

## 1.0.0-next.27

### Patch Changes

- Updated dependencies [[`88d49713`](https://github.com/udecode/slate-plugins/commit/88d497138c2f8a1ce51af6910c5052b1ddf8dabc)]:
  - @udecode/slate-plugins-list@1.0.0-next.27
  - @udecode/slate-plugins-list-ui@1.0.0-next.27
  - @udecode/slate-plugins-md-serializer@1.0.0-next.27

## 1.0.0-next.26

### Patch Changes

- Updated dependencies [[`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea)]:
  - @udecode/slate-plugins-core@1.0.0-next.26
  - @udecode/slate-plugins-autoformat@1.0.0-next.26
  - @udecode/slate-plugins-break@1.0.0-next.26
  - @udecode/slate-plugins-common@1.0.0-next.26
  - @udecode/slate-plugins-dnd@1.0.0-next.26
  - @udecode/slate-plugins-alignment@1.0.0-next.26
  - @udecode/slate-plugins-block-quote@1.0.0-next.26
  - @udecode/slate-plugins-code-block@1.0.0-next.26
  - @udecode/slate-plugins-heading@1.0.0-next.26
  - @udecode/slate-plugins-image@1.0.0-next.26
  - @udecode/slate-plugins-link@1.0.0-next.26
  - @udecode/slate-plugins-list@1.0.0-next.26
  - @udecode/slate-plugins-media-embed@1.0.0-next.26
  - @udecode/slate-plugins-mention@1.0.0-next.26
  - @udecode/slate-plugins-paragraph@1.0.0-next.26
  - @udecode/slate-plugins-table@1.0.0-next.26
  - @udecode/slate-plugins-find-replace@1.0.0-next.26
  - @udecode/slate-plugins-basic-marks@1.0.0-next.26
  - @udecode/slate-plugins-highlight@1.0.0-next.26
  - @udecode/slate-plugins-kbd@1.0.0-next.26
  - @udecode/slate-plugins-node-id@1.0.0-next.26
  - @udecode/slate-plugins-normalizers@1.0.0-next.26
  - @udecode/slate-plugins-placeholder@1.0.0-next.26
  - @udecode/slate-plugins-reset-node@1.0.0-next.26
  - @udecode/slate-plugins-select@1.0.0-next.26
  - @udecode/slate-plugins-html-serializer@1.0.0-next.26
  - @udecode/slate-plugins-md-serializer@1.0.0-next.26
  - @udecode/slate-plugins-trailing-block@1.0.0-next.26
  - @udecode/slate-plugins-ui-fluent@1.0.0-next.26
  - @udecode/slate-plugins-alignment-ui@1.0.0-next.26
  - @udecode/slate-plugins-basic-elements@1.0.0-next.26
  - @udecode/slate-plugins-block-quote-ui@1.0.0-next.26
  - @udecode/slate-plugins-code-block-ui@1.0.0-next.26
  - @udecode/slate-plugins-image-ui@1.0.0-next.26
  - @udecode/slate-plugins-link-ui@1.0.0-next.26
  - @udecode/slate-plugins-list-ui@1.0.0-next.26
  - @udecode/slate-plugins-media-embed-ui@1.0.0-next.26
  - @udecode/slate-plugins-mention-ui@1.0.0-next.26
  - @udecode/slate-plugins-table-ui@1.0.0-next.26
  - @udecode/slate-plugins-find-replace-ui@1.0.0-next.26
  - @udecode/slate-plugins-toolbar@1.0.0-next.26

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 0.60.2 (2020-07-01)

**Note:** Version bump only for package @udecode/slate-plugins

## 0.60.1 (2020-06-30)

**Note:** Version bump only for package @udecode/slate-plugins

# 0.60.0 (2020-06-15)

**Note:** Version bump only for package @udecode/slate-plugins

## 0.59.2 (2020-06-12)

**Note:** Version bump only for package @udecode/slate-plugins

## 0.59.1 (2020-06-06)

**Note:** Version bump only for package @udecode/slate-plugins

# 0.59.0 (2020-06-05)

**Note:** Version bump only for package @udecode/slate-plugins
