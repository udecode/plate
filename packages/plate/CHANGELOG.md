# platejs

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  - Expose the Plite-backed Plate editor and plugin model, including `editor.read`, `editor.update`, sole plugin identity `name`, compiled `schema.element` and `schema.mark`, plugin `initialState`, an editor-local plugin `store`, and inferred plugin-owned `editor.api[name]` and `editor.update` groups; exact generic code uses `editor.plugin(Plugin)` as the sole imperative plugin lookup, while dynamic names resolve through `editor.plugin(name)`; declare Plite capabilities and every prefixless lifecycle/DOM event directly under root `on`, without a nested `extension` or separate `handlers` field
  - Separate plugin capability `name` from persisted element `type` and property `key`. Default omitted schema identities to `name`, expose only the identity owned by each schema plugin, and keep `PLUGINS` capability-only.
  - Name live node identity `key`, persisted element occurrence identity `id`, and persisted associations `ref`.
  - Infer one exact plugin definition from each positional descriptor factory, `defineBasePlugin(name, definition)` or `definePlatePlugin(name, definition)`, use `DefinitionOf<typeof Plugin>` for descriptor contracts, and keep undeclared fields absent from the inferred plugin type
  - Keep object `initialState` beside store-dependent fields; stage factory `initialState` before those fields in a following `.extend()`
  - Export pure schema and plugin builders from `platejs`, React components and hooks from `platejs/react`, and `renderStaticHtml` from `platejs/static`
  - Initialize editors synchronously through `initialValue` or `({ editor }) => Value`, observe edits through `onCommit`, use strict `useEditor`, and use nullable `useActiveEditor`
  - Accept a primary-root value or complete `EditorDocumentValue`, emit the complete document through Plate `onValueChange`, and render typed interactive or static content-root slots
  - Defer initialization with `skipInitialization: true`, then publish the loaded document with one `editor.update.value.replace(...)` call; application migrations run before installed-plugin preparation and schema fitting
  - Delete `@platejs/autoformat`; declare input rules on the feature plugins that own the resulting behavior
  - Delete `@platejs/caption`; non-void media elements own direct inline caption children, while Plate UI media components render caption and asset-focus states
  - Compose required plugin capabilities through `dependencies`; include optional capabilities and presets directly in consumer plugin arrays
  - Remove recursive child mutation, root-plugin callbacks, topology-capable foreign-plugin patches, and the parallel global plugin enablement map; keep configuration-only weak peers for package plugins that cannot control the editor kit
  - Declare bidirectional product formats and HTML node, mark, and property mappings through a context-bound constructor `codecs: ({ defineCodecs }) => defineCodecs(...)` declaration; keep whole-input HTML `query`, `transformData`, and `transformFragment` hooks on the `'text/html'` codec

  **Migration:** Replace `value` with synchronous `initialValue`, move async loading before editor construction, replace `useEditorRef` with `useEditor`, replace `serializeHtml` with `renderStaticHtml`, and replace autoformat rules with feature-owned `inputRules`. Replace plugin `key` with `name`, flatten native Plite fields from `extension`, and move every lifecycle or DOM callback to prefixless `on` names such as `commit`, `keyDown`, and `paste`. Remove the `PluginConfig` family (`AnyPluginConfig`, `SlatePluginConfig`, and `PlatePluginConfig`) and `InferConfig` usage. Remove `@platejs/caption` imports and caption plugin registration, then store and render captions as the media element's direct children. Configure imported plugin descriptors in the ordinary array. Use `override.plugins[name]` only for package-owned adaptation of an already-installed foreign peer. Declare HTML node, mark, and property mappings through `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })`, and put whole-input HTML hooks on the `'text/html'` codec.

  Replace `KEYS`, `NODES`, and `STYLE_KEYS` plugin references with `PLUGINS`. Resolve persisted identity through `.type` / `.key` or explicit document literals, and remove every public reverse name/type lookup.

  Persist schema identity beside each durable document. Configure the v54 release step and v55 AST-contract step through the application schema migration chain:

  ```tsx
  import {
    defineDocumentMigrations,
    migratePlateV54,
    migratePlateV55,
  } from "platejs/migrations";
  import { fingerprint as v53Fingerprint } from "./migrations/v54-upgrade-plate/from";
  import { fingerprint as v54Fingerprint } from "./migrations/v55-upgrade-plate/from";

  const migrations = defineDocumentMigrations(EditorSchema, {
    sourceFingerprints: { 53: v53Fingerprint, 54: v54Fingerprint },
    steps: { 54: migratePlateV54, 55: migratePlateV55 },
    unversioned: 53,
  });
  ```

  Replace plugin `transformInitialValue` with `prepareDocument` only for permanent installed-plugin invariants.

  For deferred loading:

  ```tsx
  const editor = createPlateEditor({
    migrations,
    plugins,
    schema: EditorSchema,
    skipInitialization: true,
  });
  const persisted = await loadDocument();

  editor.update.value.replace(persisted);
  ```

  Migrate frozen Plate v53 documents through v54 and v55. Existing v54 documents run only the v55 AST-contract step.

## 53.2.1

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.1.2

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.7

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.6

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 53.0.5

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 53.0.3

### Patch Changes

- Updated `@platejs/utils`.

## 53.0.0

## 52.3.21

### Patch Changes

- Updated `@platejs/core`, `@platejs/slate`, `@platejs/utils`.

## 52.3.16

### Patch Changes

- Updated `@platejs/core`, `@platejs/utils`.

## 52.3.11

### Patch Changes

- [`4af5ea4`](https://github.com/udecode/plate/commit/4af5ea4298c0d15f813edd6322bb99cf0a8aaf85) by [@zbeyens](https://github.com/zbeyens) – Use compatible internal dependency ranges so `platejs` can resolve the current `@platejs/*` package graph without nested stale installs.

## 52.3.9

## 52.3.4

### Patch Changes

- [#4857](https://github.com/udecode/plate/pull/4857) by [@zbeyens](https://github.com/zbeyens) –
  - Update internal `@platejs/*` and `@udecode/*` dependency ranges to workspace references.

## 52.3.3

## 52.3.2

## 52.0.17

## 52.0.15

## 52.0.11

### Patch Changes

- [#4784](https://github.com/udecode/plate/pull/4784) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed "Cannot find module 'react/compiler-runtime'" error for React 18 users

## 52.0.10

## 52.0.8

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.3

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 50.3.9

## 50.3.8

## 50.3.7

## 49.2.21

## 49.2.12

## 49.2.11

## 49.2.9

## 49.2.8

## 49.2.6

## 49.2.5

## 49.2.4

## 49.2.3

## 49.1.13

## 49.1.5

## 49.1.4

## 49.1.3

## 49.1.2

## 49.0.19

## 49.0.18

## 49.0.16

## 49.0.15

## 49.0.14

## 49.0.13

## 49.0.11

## 49.0.10

## 49.0.9

## 49.0.6

## 49.0.5

## 49.0.4

## 49.0.3

## 49.0.2

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed package to `platejs`:
    - Replace all `@udecode/plate/react` with `platejs/react`
    - Replace all `'@udecode/plate'` with `'platejs'`

# @udecode/plate

## 48.0.5

## 48.0.3

## 48.0.1

## 48.0.0

## 47.3.1

## 47.2.7

## 47.2.3

## 47.1.1

## 46.0.10

## 46.0.9

## 46.0.4

## 46.0.2

## 45.0.9

## 45.0.8

## 45.0.7

## 45.0.6

## 45.0.5

## 45.0.2

## 45.0.1

## 44.0.7

## 44.0.1

## 44.0.0

## 43.0.5

## 43.0.4

## 43.0.2

## 43.0.0

## 42.2.5

## 42.2.2

## 42.1.2

## 42.1.1

## 42.0.6

## 42.0.5

## 42.0.4

## 42.0.3

## 42.0.1

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **This package is now the new common package**, so all plugin packages are being removed. **Migration**:

  - Add the following dependencies:

  ```json
  "@udecode/plate-alignment": "42.0.0",
  "@udecode/plate-autoformat": "42.0.0",
  "@udecode/plate-basic-elements": "42.0.0",
  "@udecode/plate-basic-marks": "42.0.0",
  "@udecode/plate-block-quote": "42.0.0",
  "@udecode/plate-break": "42.0.0",
  "@udecode/plate-code-block": "42.0.0",
  "@udecode/plate-combobox": "42.0.0",
  "@udecode/plate-comments": "42.0.0",
  "@udecode/plate-csv": "42.0.0",
  "@udecode/plate-diff": "42.0.0",
  "@udecode/plate-docx": "42.0.0",
  "@udecode/plate-find-replace": "42.0.0",
  "@udecode/plate-floating": "42.0.0",
  "@udecode/plate-font": "42.0.0",
  "@udecode/plate-heading": "42.0.0",
  "@udecode/plate-highlight": "42.0.0",
  "@udecode/plate-horizontal-rule": "42.0.0",
  "@udecode/plate-indent": "42.0.0",
  "@udecode/plate-indent-list": "42.0.0",
  "@udecode/plate-kbd": "42.0.0",
  "@udecode/plate-layout": "42.0.0",
  "@udecode/plate-line-height": "42.0.0",
  "@udecode/plate-link": "42.0.0",
  "@udecode/plate-list": "42.0.0",
  "@udecode/plate-markdown": "42.0.0",
  "@udecode/plate-media": "42.0.0",
  "@udecode/plate-mention": "42.0.0",
  "@udecode/plate-node-id": "42.0.0",
  "@udecode/plate-normalizers": "42.0.0",
  "@udecode/plate-reset-node": "42.0.0",
  "@udecode/plate-resizable": "42.0.0",
  "@udecode/plate-select": "42.0.0",
  "@udecode/plate-selection": "42.0.0",
  "@udecode/plate-slash-command": "42.0.0",
  "@udecode/plate-suggestion": "42.0.0",
  "@udecode/plate-tabbable": "42.0.0",
  "@udecode/plate-table": "42.0.0",
  "@udecode/plate-toggle": "42.0.0",
  "@udecode/plate-trailing-block": "42.0.0"
  ```

  - Either replace all `@udecode/plate` imports with the individual package imports, or export the following in a new file (e.g. `src/plate.ts`):

  ```ts
  export * from "@udecode/plate-alignment";
  export * from "@udecode/plate-autoformat";
  export * from "@udecode/plate-basic-elements";
  export * from "@udecode/plate-basic-marks";
  export * from "@udecode/plate-block-quote";
  export * from "@udecode/plate-break";
  export * from "@udecode/plate-code-block";
  export * from "@udecode/plate-combobox";
  export * from "@udecode/plate-comments";
  export * from "@udecode/plate-diff";
  export * from "@udecode/plate-find-replace";
  export * from "@udecode/plate-font";
  export * from "@udecode/plate-heading";
  export * from "@udecode/plate-highlight";
  export * from "@udecode/plate-horizontal-rule";
  export * from "@udecode/plate-indent";
  export * from "@udecode/plate-indent-list";
  export * from "@udecode/plate-kbd";
  export * from "@udecode/plate-layout";
  export * from "@udecode/plate-line-height";
  export * from "@udecode/plate-link";
  export * from "@udecode/plate-list";
  export * from "@udecode/plate-media";
  export * from "@udecode/plate-mention";
  export * from "@udecode/plate-node-id";
  export * from "@udecode/plate-normalizers";
  export * from "@udecode/plate-reset-node";
  export * from "@udecode/plate-select";
  export * from "@udecode/plate-csv";
  export * from "@udecode/plate-docx";
  export * from "@udecode/plate-markdown";
  export * from "@udecode/plate-slash-command";
  export * from "@udecode/plate-suggestion";
  export * from "@udecode/plate-tabbable";
  export * from "@udecode/plate-table";
  export * from "@udecode/plate-toggle";
  export * from "@udecode/plate-trailing-block";
  export * from "@udecode/plate-alignment/react";
  export * from "@udecode/plate-autoformat/react";
  export * from "@udecode/plate-basic-elements/react";
  export * from "@udecode/plate-basic-marks/react";
  export * from "@udecode/plate-block-quote/react";
  export * from "@udecode/plate-break/react";
  export * from "@udecode/plate-code-block/react";
  export * from "@udecode/plate-combobox/react";
  export * from "@udecode/plate-comments/react";
  export * from "@udecode/plate-floating";
  export * from "@udecode/plate-font/react";
  export * from "@udecode/plate-heading/react";
  export * from "@udecode/plate-highlight/react";
  export * from "@udecode/plate-layout/react";
  export * from "@udecode/plate-slash-command/react";
  export * from "@udecode/plate-indent/react";
  export * from "@udecode/plate-indent-list/react";
  export * from "@udecode/plate-kbd/react";
  export * from "@udecode/plate-line-height/react";
  export * from "@udecode/plate-link/react";
  export * from "@udecode/plate-list/react";
  export * from "@udecode/plate-media/react";
  export * from "@udecode/plate-reset-node/react";
  export * from "@udecode/plate-selection";
  export * from "@udecode/plate-suggestion/react";
  export * from "@udecode/plate-tabbable/react";
  export * from "@udecode/plate-table/react";
  export * from "@udecode/plate-toggle/react";
  export * from "@udecode/plate-resizable";
  ```

  - Replace all `'@udecode/plate'` and `'@udecode/plate/react'` with `'@/plate'` in your codebase.

# @udecode/plate-common (< 42.0.0)

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated and will be renamed to `@udecode/plate`. Migration:

  - Remove `@udecode/plate-common` and install `@udecode/plate`
  - Replace all `'@udecode/plate-common'` with `'@udecode/plate'`,

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-common` and `@udecode/plate-common/react`.
  - NEW `/react` exports `@udecode/react-hotkeys`

## 33.0.4

### Patch Changes

- [#3199](https://github.com/udecode/plate/pull/3199) by [@zbeyens](https://github.com/zbeyens) – Fix `PlateElementProps` type

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - re-export `@udecode/react-utils`

### Patch Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Fix import from RSC

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0
