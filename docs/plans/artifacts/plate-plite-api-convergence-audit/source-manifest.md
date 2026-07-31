# Plate / Plite plugin-extension source manifest

## Scope

This manifest covers the public authoring and consumption grammar shared by
Plite extensions, Base plugins, and React Plate plugins. It excludes internal
compiler helpers whose names never cross a package export, generated files,
historical migrations, and feature-specific methods that do not define or
consume an extension/plugin descriptor.

## Public shape census

| Family | Current public surface | Source owner | Concept |
|---|---|---|---|
| Generic descriptor declarations | `defineEditorExtension`, `createBasePlugin`, `createPlatePlugin` | `packages/plite/src/core/editor-extension.ts:590-711`; `packages/core/src/lib/plugin/createBasePlugin.ts:500-735`; `packages/core/src/react/plugin/createPlatePlugin.ts:400-523` | `STACK-001` |
| Configured extension factories | `history`, `dom`, `react`, `hostCodecs`, `createYjsExtension`, `createTriggerComboboxExtension`, `createExcludeDiffFragmentExtension` | `packages/plite-history/src/history-extension.ts:626-630`; `packages/plite-dom/src/plugin/with-dom.ts:153-185`; `packages/plite-react/src/plugin/with-react.ts:76-88`; `packages/plite-dom/src/plugin/host-codec.ts:540-557`; `packages/yjs/src/core/extension.ts:79-97`; `packages/combobox/src/lib/createTriggerComboboxExtension.ts:20-33`; `packages/diff/src/lib/excludeDiffFromFragment.ts:32-34` | `STACK-002` |
| Descriptor nouns and exact definitions | `EditorExtension`, `BasePlugin`, `PlatePlugin`, `EditorExtensionDefinition`, `BasePluginDefinition`, `PlatePluginDefinition`, `DefinitionOf` | `packages/plite/src/interfaces/editor.ts:2046-2066,2115-2121,2347-2351`; `packages/core/src/lib/plugin/PluginDefinition.ts:40-123`; `packages/core/src/lib/plugin/BasePlugin.ts:1195-1231`; `packages/core/src/react/plugin/PlatePlugin.ts:620-650` | `STACK-003` |
| Native author fields | `name`, `enabled`, `dependencies`, `conflicts`, `schema`, `api`, `read`, `update`, `readMiddleware`, `commands`, `corrections`, `stateFields`, `effectTypes`, `facetProviders`, `selectionKinds`, `contributions`, `on`, `activate`, `validate` | `packages/plite/src/interfaces/editor.ts:2353-2387`; `packages/core/src/lib/plugin/PluginDefinition.ts:46-82`; `packages/core/src/lib/plugin/BasePlugin.ts:963-990`; `packages/core/src/react/plugin/PlatePlugin.ts:322-366` | `STACK-004` |
| Identity and schema | Extension/plugin `name`; Plate node `type`; shallow dependency references; schema factory/lowering | `packages/plite/src/interfaces/editor.ts:2007-2044,2138-2142`; `packages/core/src/lib/plugin/PluginDefinition.ts:63-79,277-285,429-435`; `packages/core/src/lib/plugin/BasePlugin.ts:1205-1224` | `STACK-005` |
| Editor creation and installed collections | `createEditor({ extensions })`, `createBaseEditor({ plugins })`, `createPlateEditor({ plugins })`, `createEditorRuntime`, `createEditorView` | `packages/plite/src/interfaces/editor.ts:1365-1377`; `packages/plite/src/create-editor.ts:329-372`; `packages/core/src/lib/editor/withPlite.ts:811-911`; `packages/core/src/react/editor/withPlate.ts:163-246`; `packages/plite/src/editor-runtime-view.ts:939-986` | `STACK-006` |
| Existing-editor enhancement | `extendBaseEditor(editor, options)`, `extendPlateEditor(editor, options)`, plus the `editor` option on both constructors | `packages/core/src/lib/editor/withPlite.ts:515-656,811-907`; `packages/core/src/react/editor/withPlate.ts:70-175,216-246` | `STACK-007` |
| Live extension mutation | `editor.extend(extension)`, `EditorApi.extend(editor, extension)`, `editor.update.extensions.reconfigure(slot, input)` | `packages/plite/src/interfaces/editor.ts:378-398,1284-1310,3366-3370` | `STACK-008` |
| Scoped and root capability access | `editor.extension(Extension).api`, `editor.plugin(Plugin)`, and root `editor.api/read/update` | `packages/plite/src/interfaces/editor.ts:1284-1335,1873-1875`; `packages/core/src/lib/editor/BaseEditor.ts:47-70`; `packages/core/src/react/editor/PlateEditor.ts:21-56`; `packages/core/src/lib/plugin/PluginDefinition.ts:437-449` | `STACK-009` |
| Plate state layer | `initialState`, `selectors`, portal `store`; distinct from editor `initialValue` and Plite `stateFields` | `packages/core/src/lib/plugin/PluginDefinition.ts:46-82,437-449`; `packages/core/src/lib/plugin/BasePlugin.ts:1205-1224,1495-1506`; `packages/plite/src/interfaces/editor.ts:1365-1377,2357-2387` | `STACK-010` |
| Plate render/host layer | `component`, `render`, `decorate`, `useHooks`, `editOnly` | `packages/core/src/lib/plugin/PluginDefinition.ts:46-82,150-273`; `packages/core/src/lib/plugin/BasePlugin.ts:963-1057,1264-1266`; `packages/core/src/react/plugin/PlatePlugin.ts:238-296,322-366` | `STACK-011` |
| Plate behavior conveniences | `inject`, `inputRules`, `rules`, `shortcuts`, `transformInitialValue` | `packages/core/src/lib/plugin/PluginDefinition.ts:46-82,150-273`; `packages/core/src/lib/plugin/BasePlugin.ts:983-1084` | `STACK-012` |
| Serialization authoring | `codecs` and the parallel `parsers.html` pre/post-processing bucket | `packages/core/src/lib/plugin/BasePlugin.ts:303-312,658-805,983-1006`; `packages/core/src/lib/plugins/html/HtmlPlugin.ts:415-439` | `STACK-013` |
| Cross-plugin adaptation | `targetPluginNames`, `inject`, and weak `override.plugins` | `packages/core/src/lib/plugin/PluginDefinition.ts:150-175`; `packages/core/src/lib/plugin/BasePlugin.ts:991-1003,1219-1224`; `packages/core/src/internal/plugin/compilePlateModel.ts:124-184` | `STACK-014` |
| Author widening | Base/Plate descriptor `.extend(object | callback | EditorExtensionReference)` | `packages/core/src/lib/plugin/BasePlugin.ts:1531-1654`; `packages/core/src/react/plugin/PlatePlugin.ts:771-898` | `STACK-015` |
| Terminal consumer override | Base/Plate descriptor `.configure(object | callback)` and configured terminal types | `packages/core/src/lib/plugin/BasePlugin.ts:1495-1548,1656-1662`; `packages/core/src/react/plugin/PlatePlugin.ts:780-791,900-906` | `STACK-016` |
| Base-to-React adapter | `toPlatePlugin(BasePlugin, adapter?)` | `packages/core/src/react/plugin/toPlatePlugin.ts:306-363` | `STACK-017` |
| Cross-extension composition | `defineExtensionPoint`, `contributions`, `defineExtensionSlot`, and transactional slot reconfiguration | `packages/plite/src/core/editor-extension.ts:82-104`; `packages/plite/src/core/extension-slot.ts:18-62`; `packages/plite/src/interfaces/editor.ts:1829-1848,2377-2377,391-398` | `STACK-018` |

## Field closure

Every public Plite extension root field maps to `STACK-004` or `STACK-005`:

`name`, `enabled`, `dependencies`, `conflicts`, `schema`, `api`, `read`,
`update`, `readMiddleware`, `commands`, `corrections`, `stateFields`,
`effectTypes`, `facetProviders`, `selectionKinds`, `contributions`, `on`,
`activate`, and `validate`.

Every Plate-only root author field maps to `STACK-010` through `STACK-014`:

`initialState`, `selectors`, `component`, `render`, `decorate`, `useHooks`,
`editOnly`, `inject`, `inputRules`, `rules`, `shortcuts`,
`transformInitialValue`, `codecs`, `parsers`, `targetPluginNames`, `override`,
and Plate's serialized node `type` in `STACK-005`.

No nested public `extension` or `handlers` authoring bucket remains in the live
definitions. Native fields are already flat and lifecycle/DOM handlers already
share root `on`.

## Adoption census

Bounded repository scans across `packages`, `apps`, and `content` found:

- `defineEditorExtension(`: 391 occurrences in 99 files.
- `createBasePlugin(`: 907 occurrences in 184 files.
- `createPlatePlugin(`: 254 occurrences in 82 files.
- `toPlatePlugin(`: 128 occurrences in 50 files.
- Production descriptor declarations: 72 `Base*Plugin` values built by
  `createBasePlugin`, 14 direct React values built by `createPlatePlugin`, and
  75 React values built with `toPlatePlugin`.
- Scoped plugin lookups: 1,258 descriptor-form calls and 19 string-form calls.
- The seven configured extension factory spellings in `STACK-002` are all
  publicly exported or used by public package consumers.

These counts size migration work; they do not decide the API.

## Exclusions

- Internal helpers such as `compileEditorExtension`,
  `createPlateRuntimeExtensions`, `createExtensionRegistry`, and
  `createEditorViewExtensionApis` describe compiler/runtime implementation,
  not author-facing descriptor grammar.
- Transaction-local `state.transaction.extend(...)` is immutable transaction
  composition, not plugin/extension authoring or installation.
- Feature plugin methods are outside this comparison unless they manufacture,
  install, configure, or expose a descriptor.

