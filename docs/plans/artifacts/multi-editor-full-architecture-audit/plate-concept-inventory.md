# Live Plate architecture inventory

Planning evidence only. This file maps the current Plate framework/product layer
for the multi-editor audit. It does not decide the cross-editor verdict and does
not authorize implementation.

## Coverage contract

The machine-readable owner is
`docs/plans/artifacts/multi-editor-full-architecture-audit/plate-coverage-manifest.json`.
It records every in-scope file, top-level TypeScript declaration, package export
key, concept assignment, exact exclusion, line count, byte count, and source
hash.

At the latest validated source snapshot:

- 44 target public Plate packages;
- 2,253 included files;
- 7,660 top-level declarations;
- 3,965 exported declarations;
- 135 exact file exclusions;
- 369,402 source lines;
- 318 docs files and 364 registry product files;
- 641 proof files.

The current checkout can change while the parallel audit runs. Regenerate and
validate immediately before consuming the counts:

```sh
node docs/plans/artifacts/multi-editor-full-architecture-audit/plate-build-manifest.mjs
node docs/plans/artifacts/multi-editor-full-architecture-audit/plate-validation.mjs
```

The manifest deliberately includes current docs, registry sources, package
tests, and type tests. It records these exact exclusions rather than silently
dropping them:

- `packages/plite*/**`: parallel Plite substrate lane;
- `packages/list-classic/**`: maintenance-only architecture excluded by
  `VISION.md`;
- `packages/plate-scripts/**`: repository tooling, not an editor surface;
- `packages/udecode/**`: generic utility workspaces, not Plate owners;
- `templates/**`: CI-generated copies; registry source is authoritative;
- `apps/www/src/generated/**`: generated website output;
- `apps/plite/**`: parallel Plite/browser-proof lane;
- translated `.cn.mdx` files: duplicate of the English evidence owner;
- migration docs and registry changelog entries: historical, not current shape.

### Public package denominator

| Family                   | In-scope packages                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework and umbrella   | `core`, `plate`                                                                                                                                                                      |
| Basic document features  | `basic-nodes`, `basic-styles`, `callout`, `code-block`, `code-drawing`, `date`, `excalidraw`, `footnote`, `layout`, `link`, `math`, `tag`, `toc`, `toggle`                           |
| Editing behavior         | `combobox`, `cursor`, `dnd`, `emoji`, `find-replace`, `floating`, `indent`, `list`, `mention`, `resizable`, `selection`, `slash-command`, `suggestion`, `tabbable`, `table`, `utils` |
| Media and AI             | `ai`, `media`                                                                                                                                                                        |
| Codecs and import/export | `csv`, `diff`, `docx`, `docx-io`, `juice`, `markdown`                                                                                                                                |
| Collaboration            | `comment`, `yjs`                                                                                                                                                                     |
| Proof support            | `browser`, `test-utils`                                                                                                                                                              |

The manifest reads every package `exports` object. Most feature packages expose
`.` and `./react`; headless codecs expose `.`; `core` exposes `.`, `./internal`,
`./react`, `./react/internal`, `./react/test`, `./static`, and
`./static/internal`; `yjs` exposes `.`, `./core`, and `./react`; `plate` is the
thin umbrella re-export in `packages/plate/src/{index,react/index,static/index}`.

## Ownership graph

1. Plite owns JSON document state, schema compilation, changes, transactions,
   selections, history integration points, DOM runtime, and React projection.
2. Plate core compiles plugin descriptors into a frozen product model: schema
   contribution, type bindings, codecs, components, shortcuts, input rules,
   APIs, reads, updates, and runtime caches.
3. Feature packages own product semantics such as tables, flat lists, media,
   suggestions, and AI.
4. `apps/www/src/registry` owns copied kits, components, product wiring, and
   examples. `content/docs` teaches the public contract.

This boundary is visible in the copied-kit doctrine
(`content/docs/(guides)/feature-kits.mdx:6-21,70-114`), the constructor and
terminal-configuration doctrine
(`content/docs/(guides)/plugin-methods.mdx:6-33`), and the Plite capability
boundary (`content/docs/(guides)/plugin-methods.mdx:121-185`).

## Atomic Plate concept ledger

`Preserve` means the live shape is a Plate strength unless an external editor
shows a material failure. `Pressure` means the owning abstraction needs
cross-editor judgment. `Boundary` means the behavior is valid but must remain in
the named owner.

| ID              | Live public and internal shape                                                                                                                                        | Exact evidence                                                                                                                                                                                                                                                       | Live judgment                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `PL-BND-01`     | Individual capability packages plus the `plate` umbrella. Package export keys are captured per manifest package row.                                                  | `packages/plate/src/index.tsx:1-4`; `packages/plate/src/react/index.tsx:1-4`; package manifests                                                                                                                                                                      | Preserve discoverability layer; reject moving product features into Plite.                |
| `PL-BND-02`     | Headless/base, React, and static entrypoints are separate. React descriptors adapt base descriptors through `toPlatePlugin`.                                          | `packages/core/src/react/plugin/toPlatePlugin.ts:205-379`; `packages/core/src/static/index.ts:1-6`                                                                                                                                                                   | Preserve boundary; internal generic duplication remains pressure.                         |
| `PL-DESC-01`    | Nominally witnessed, structurally typed plugin identity uses `key`, configured document `type`, and type-only `__config`.                                             | `packages/core/src/lib/plugin/PluginConfig.ts:184-193`                                                                                                                                                                                                               | Preserve typed identity without runtime classes.                                          |
| `PL-DESC-02`    | `createBasePlugin` and `createPlatePlugin` accept independent author contributions with contextual inference.                                                         | `packages/core/src/lib/plugin/createBasePlugin.ts:592-918`; `packages/core/src/react/plugin/createPlatePlugin.ts:41-249`                                                                                                                                             | Preserve public entrypoints; pressure internal type volume.                               |
| `PL-DESC-03`    | `.extend()` widens an imported descriptor; accumulated authoring callbacks live in private arrays.                                                                    | `packages/core/src/lib/plugin/BasePlugin.ts:1647-1665,1728-1857`                                                                                                                                                                                                     | Preserve public role.                                                                     |
| `PL-DESC-04`    | One terminal `.configure()` is reapplied after extensions so app configuration wins; `.clone()` copies a definition.                                                  | `packages/core/src/internal/plugin/resolvePlugin.ts:264-331`; `content/docs/(guides)/plugin-methods.mdx:6-16`                                                                                                                                                        | Preserve terminal override law.                                                           |
| `PL-DESC-05`    | Dependencies form a graph, but one global plugin `priority` also affects graph ties and unrelated compilers.                                                          | `packages/core/src/lib/plugin/PluginConfig.ts:211-224`; `packages/core/src/internal/plugin/resolvePlugins.ts:1810-1818`                                                                                                                                              | Pressure: omnibus priority is an owner error.                                             |
| `PL-DESC-06`    | Resolution snapshots options, freezes published descriptors/model lists, and rejects mutation after publication.                                                      | `packages/core/src/internal/plugin/resolvePlugins.ts:405-438,442-618`                                                                                                                                                                                                | Preserve frozen publication.                                                              |
| `PL-OPT-01`     | One `options` generic is both schema/codec/config input and mutable editor-local Zustand state exposed by `get/setOption(s)` and React hooks.                         | `packages/core/src/lib/plugin/PluginConfig.ts:208-224,390-400`; `packages/core/src/internal/plugin/pluginOptionsStore.ts:10-16,120-149`; `packages/core/src/lib/plugin/getEditorPlugin.ts:235-299`; `packages/core/src/react/stores/plate/usePluginOption.ts:52-188` | Pressure: materially conflated ownership.                                                 |
| `PL-CTX-01`     | `editor.plugin(Descriptor)` returns plugin/type/API/read/update/option context; callbacks receive the same typed portal.                                              | `packages/core/src/lib/plugin/getEditorPlugin.ts:31-311`; `content/docs/(guides)/plugin-context.mdx:6-30`                                                                                                                                                            | Preserve call-site idea; pressure recursive runtime proxies.                              |
| `PL-CAP-01`     | Constructor contributions accumulate plugin API, read groups, transaction groups, selectors, and Plite extensions.                                                    | `packages/core/src/lib/plugin/BasePlugin.ts:1647-1665`; `content/docs/(guides)/plugin-methods.mdx:18-33,96-119`                                                                                                                                                      | Preserve namespaced capability ownership.                                                 |
| `PL-SCHEMA-01`  | A plugin declares either one element, one mark, arbitrary properties, and content-root projections.                                                                   | `packages/core/src/lib/plugin/PluginConfig.ts:340-430`; `packages/core/src/internal/plugin/compilePlateModel.ts:367-477`                                                                                                                                             | Preserve schema contribution ownership; pressure missing cross-mark/sequence laws.        |
| `PL-SCHEMA-02`  | Plate compiles every declaration and rejects element/mark dual ownership, duplicate element types, unresolved references, and duplicate schema type owners.           | `packages/core/src/internal/plugin/compilePlateModel.ts:347-520`                                                                                                                                                                                                     | Preserve atomic compilation and conflict rejection.                                       |
| `PL-SCHEMA-03`  | Plate wraps the Plite schema API so callers can use plugin descriptors instead of string types.                                                                       | `packages/core/src/lib/editor/withPlite.ts:474-631`                                                                                                                                                                                                                  | Preserve descriptor-aware facade.                                                         |
| `PL-CODEC-01`   | MIME-keyed product codecs compile claims, priorities, query/decode/encode functions, and failure isolation against the schema model.                                  | `packages/core/src/internal/plugin/compilePlateCodecs.ts:23-310`                                                                                                                                                                                                     | Preserve.                                                                                 |
| `PL-CODEC-02`   | HTML codecs compile schema-aware match/encode indexes with conflict detection and safe URL/style handling.                                                            | `packages/core/src/internal/plugin/compilePlateHtmlCodec.ts:54-293,650-894`                                                                                                                                                                                          | Preserve host-owned HTML codec architecture.                                              |
| `PL-CODEC-03`   | Legacy HTML parsing helpers remain in core/internal, including DOM clipboard HTML cleanup.                                                                            | `packages/core/src/lib/plugins/html/utils/htmlStringToDOMNode.ts:1-31`; `packages/core/src/lib/plugins/html/utils/parseHtmlDocument.ts:1-27`                                                                                                                         | Boundary: delete only when compiled HTML adoption proves no consumer.                     |
| `PL-CODEC-04`   | Markdown is a schema-aware Plate plugin with document-scope `text/markdown` and `text/plain` codecs plus plugin API.                                                  | `packages/markdown/src/lib/MarkdownPlugin.ts:27-142`                                                                                                                                                                                                                 | Preserve as host codec, not Plite core.                                                   |
| `PL-CODEC-05`   | CSV, DOCX, DOCX-IO, Juice, and feature codecs stay in format/product packages.                                                                                        | Package export/source rows in manifest; `packages/csv/src/lib/CsvPlugin.ts:20-52`; `packages/docx/src/lib/DocxPlugin.ts:15-72`                                                                                                                                       | Preserve ownership.                                                                       |
| `PL-CMD-01`     | Plugin `update` factories bind transaction-local methods; portal one-shot updates open one editor update.                                                             | `packages/core/src/lib/plugin/getEditorPlugin.ts:126-173`; `content/docs/(guides)/plugin-methods.mdx:105-119`                                                                                                                                                        | Preserve transaction-local vs one-shot distinction.                                       |
| `PL-CMD-02`     | Generic editor commands/corrections/state/tx groups enter through Plate’s `extension` contribution.                                                                   | `content/docs/(guides)/plugin-methods.mdx:121-181`; `packages/core/src/lib/plugin/pluginAuthoringContext.ts:8-55`                                                                                                                                                    | Preserve Plite ownership; pressure query middleware breadth.                              |
| `PL-INPUT-01`   | Shortcuts compile namespaced IDs, explicit local priority, and plugin/API/update targets.                                                                             | `packages/core/src/internal/plugin/compilePlateShortcuts.ts:16-171`; `packages/core/src/internal/plugin/resolvePlugins.ts:1065-1105`                                                                                                                                 | Preserve local compiler; remove global-priority fallback.                                 |
| `PL-INPUT-02`   | Input rules have local priority, trigger indexes, and stable plugin/declaration tie-breaks.                                                                           | `packages/core/src/internal/plugin/resolvePlugins.ts:1108-1175`; `packages/core/src/lib/plugins/input-rules/types.ts:1-104`                                                                                                                                          | Preserve compiler; remove global-priority fallback.                                       |
| `PL-INPUT-03`   | React/DOM event handlers, matching rules, affinity, and override command behavior are host plugins.                                                                   | `packages/core/src/lib/plugins/override/OverridePlugin.ts:1-559`; `packages/core/src/lib/plugin/PluginConfig.ts:260-324`                                                                                                                                             | Preserve host ownership.                                                                  |
| `PL-RENDER-01`  | Plugin components compile by schema binding; ordinary components are terminal app configuration.                                                                      | `packages/core/src/internal/plugin/resolvePlugins.ts:466-494`; `apps/www/src/registry/components/editor/plugins/table-kit.tsx:17-22`                                                                                                                                 | Preserve component binding.                                                               |
| `PL-RENDER-02`  | Render wrappers, injected props, decorators, and above/below node slots traverse compiled plugin caches.                                                              | `packages/core/src/react/utils/pluginRenderElement.tsx:26-140`; `packages/core/src/internal/plugin/resolvePlugins.ts:520-597`                                                                                                                                        | Pressure: erased wrapper/context types and manual DOM commit claims.                      |
| `PL-RENDER-03`  | Static rendering is separate from editable React and can render HTML server-side.                                                                                     | `packages/core/src/static/renderStaticHtml.tsx:1-77`; `content/docs/(guides)/feature-kits.mdx:70-87`                                                                                                                                                                 | Preserve.                                                                                 |
| `PL-REACT-01`   | `<Plate>` provides editor/store/read-only context and commit-derived callbacks; `<PlateContent>` owns the Plite editable boundary and render slots.                   | `packages/core/src/react/components/Plate.tsx:32-208`; `packages/core/src/react/components/PlateContent.tsx:19-238`                                                                                                                                                  | Preserve commit truth and host boundary.                                                  |
| `PL-REACT-02`   | React hooks subscribe to editor commits, element stores, plugin option stores, and feature-local stores.                                                              | `packages/core/src/react/stores/plate/usePluginOption.ts:61-188`; manifest React declarations                                                                                                                                                                        | Preserve subscription locality; split config from session state.                          |
| `PL-DOM-01`     | Core bridges Plite DOM/runtime internals; table also imports exact clipboard wire helpers and a React commit-claim hook directly.                                     | `packages/table/src/lib/BaseTablePlugin.ts:45-49,1474-1499,2583-2626`; `packages/table/src/react/useTableElement.ts:1-17`                                                                                                                                            | Pressure on feature-facing host contracts.                                                |
| `PL-SEL-01`     | Text selection stays Plite-owned; Plate adds block selection and table-cell selection plus UI projection.                                                             | `packages/selection/src/react/BlockSelectionPlugin.tsx:136-205`; `packages/table/src/lib/BaseTablePlugin.ts:2888-2915`                                                                                                                                               | Preserve extensible selection kinds; keep product UI in Plate.                            |
| `PL-TABLE-01`   | Table package owns grid compilation, mutation planning, paste, spans, rectangle repair, cell selection, and React UI. Plite schema only enforces row/cell membership. | `packages/table/src/lib/BaseTablePlugin.ts:329-559,2812-2886`; `packages/table/src/lib/internal/mutation.ts`                                                                                                                                                         | Preserve domain engine; expose only missing generic host contracts.                       |
| `PL-LIST-01`    | Current list is flat block metadata with change-aware sibling derivation across roots, not nested list classes.                                                       | `packages/list/src/lib/BaseListPlugin.tsx:378-405,1162-1325,1617-1652`                                                                                                                                                                                               | Preserve flat representation; replace internal Plite imports with public root/change API. |
| `PL-COLLAB-01`  | Yjs translates canonical `DocumentChange` in both directions, preserves multi-root/schema metadata, effects, and awareness.                                           | `packages/yjs/src/core/change-bridge.ts:37-240`; `packages/yjs/src/core/event-change-bridge.ts:1683-2860`; `packages/yjs/src/core/controller.ts:475-637,1329-1340`                                                                                                   | Preserve; do not replace with central OT.                                                 |
| `PL-COLLAB-02`  | Comment, suggestion, cursor, discussion, and diff semantics remain Plate features using marks, effects, corrections, and views.                                       | Package rows in manifest; `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1334-1454,1674-1715`                                                                                                                                                                  | Preserve product ownership; session-state split affects UI flags.                         |
| `PL-AI-01`      | AI owns document preview transforms plus a large React chat/copilot state bag.                                                                                        | `packages/ai/src/react/ai-chat/AIChatPlugin.ts:72-160,314-352`; `packages/ai/src/react/copilot/CopilotPlugin.tsx:65-145`                                                                                                                                             | Preserve product ownership; strongest options/session split adopter.                      |
| `PL-MEDIA-01`   | Media, uploads, DnD, and resizing are feature/React concerns; captions use schema content and named roots.                                                            | `packages/media/src/lib/media/MediaPlugin.internal.ts:42-369`; `packages/dnd/src/DndPlugin.tsx:45-102`                                                                                                                                                               | Preserve owner; session-state split affects uploads and drag state.                       |
| `PL-COMBO-01`   | Combobox, mention, emoji, and slash packages own trigger/product UI behavior.                                                                                         | Package and registry rows in manifest                                                                                                                                                                                                                                | Preserve.                                                                                 |
| `PL-FEATURE-01` | Basic blocks, marks, fonts, links, and style plugins are small schema/codec/update descriptors.                                                                       | `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:1-29`; basic package manifest rows                                                                                                                                                                              | Preserve thin feature descriptors; move mark exclusivity into schema.                     |
| `PL-FEATURE-02` | Advanced nodes remain independent product plugins and kits rather than core node classes.                                                                             | package/registry manifest rows                                                                                                                                                                                                                                       | Preserve JSON-native extensibility.                                                       |
| `PL-PRODUCT-01` | 75 registry plugin-kit files compose package descriptors, components, shortcuts, and options. `EditorKit` is app-owned composition.                                   | `apps/www/src/registry/components/editor/editor-kit.tsx:1-101`; manifest `PL-PRODUCT-01` count                                                                                                                                                                       | Preserve copied-kit ownership.                                                            |
| `PL-PRODUCT-02` | Registry UI, blocks, examples, values, hooks, and helpers are product source, not package runtime.                                                                    | `apps/www/src/registry/**`; `content/docs/(guides)/feature-kits.mdx:18-21,89-114`                                                                                                                                                                                    | Preserve.                                                                                 |
| `PL-DOCS-01`    | Current docs teach constructor/extend/configure, plugin portal, codecs, kits, React, and feature contracts.                                                           | 195 included English current-doc rows in manifest                                                                                                                                                                                                                    | Adoption owner for every public break.                                                    |
| `PL-PROOF-01`   | Package unit/type/integration proof is distributed with each owner; 641 files are classified as proof.                                                                | Manifest proof rows; `apps/www/src/__tests__/package-integration/**`                                                                                                                                                                                                 | Preserve owner-local proof.                                                               |
| `PL-PROOF-02`   | Browser package owns reusable browser harness/contracts; Plite app owns matrix execution in the parallel lane.                                                        | `packages/browser/src/core/first-party-browser-contracts.ts`; `packages/browser/src/playwright/**`                                                                                                                                                                   | Preserve proof boundary.                                                                  |

## Quantified pressure

### One priority controls unrelated lanes

`BasePlugin.priority` is documented as both registration and execution order
(`packages/core/src/lib/plugin/PluginConfig.ts:211-224`). The same value is
consumed by:

1. dependency-graph ready-node ordering
   (`packages/core/src/internal/plugin/resolvePlugins.ts:1810-1818`);
2. weak plugin override precedence
   (`packages/core/src/internal/plugin/resolvePlugins.ts:1420-1461`);
3. component override precedence
   (`packages/core/src/internal/plugin/resolvePlugins.ts:1296-1328`);
4. shortcut priority fallback
   (`packages/core/src/internal/plugin/resolvePlugins.ts:1083-1084`);
5. input-rule priority fallback
   (`packages/core/src/internal/plugin/resolvePlugins.ts:1133-1169`);
6. MIME codec ordering
   (`packages/core/src/internal/plugin/compilePlateCodecs.ts:132-150`);
7. HTML codec ordering
   (`packages/core/src/internal/plugin/compilePlateHtmlCodec.ts:650-665`);
8. Plite extension ordering through a second global
   `EditorExtension.priority`
   (`packages/plite/src/interfaces/editor.ts:2087-2134`;
   `packages/plite/src/core/editor-extension.ts:1261-1265`).

The internal root descriptor uses `10_000`
(`packages/core/src/lib/editor/withPlite.ts:858-868`), every plugin defaults to
`100` (`packages/core/src/lib/plugin/createBasePlugin.ts:889-918`), and the core
override extension uses `-100`
(`packages/core/src/lib/plugins/override/OverridePlugin.ts:485-500`). Changing
one number can therefore alter schema/plugin traversal, UI component wins,
input behavior, and codec wins together.

### One options bag is both immutable input and mutable state

The type calls `options` “mutable runtime state”
(`packages/core/src/lib/plugin/PluginConfig.ts:208-209`), while schema and HTML
factory contexts receive those same options as immutable compilation input
(`packages/core/src/lib/plugin/PluginConfig.ts:390-400,854-861`). Publication
freezes the descriptor copy, but runtime writes update a separate Zustand store:

- the split is explicitly tested at
  `packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1315-1353`;
- runtime closures deliberately stay live at
  `packages/core/src/internal/plugin/plateModelPublication.spec.ts:396-419`;
- the store snapshots every write at
  `packages/core/src/internal/plugin/pluginOptionsStore.ts:28-117`;
- `setOption(s)` bypasses document transactions/history/Yjs at
  `packages/core/src/lib/plugin/getEditorPlugin.ts:235-299`.

There are 169 production `setOption`/`setOptions` calls in 42 files.
Literal keys include `open`, `streaming`, `selectedIds`, `draggingId`,
`dropTarget`, `uploadingFiles`, `search`, `hoverId`, `activeId`, `cursors`,
`abortController`, `completion`, and private streaming buffers. Concrete mixed
declarations include:

- AI configuration and session state together
  (`packages/ai/src/react/ai-chat/AIChatPlugin.ts:72-140`);
- Copilot callbacks/debounce and fetch state together
  (`packages/ai/src/react/copilot/CopilotPlugin.tsx:65-145`);
- block-selection policy and selected IDs/refs together
  (`packages/selection/src/react/BlockSelectionPlugin.tsx:136-186`);
- upload policy and live files/errors together
  (`packages/media/src/react/placeholder/PlaceholderPlugin.tsx:139-190`);
- DnD settings and current drag state together
  (`packages/dnd/src/DndPlugin.tsx:45-76`).

This is not just naming debt: mutating an option used by schema/codecs cannot
recompile the frozen model, while mutating an option captured by a live runtime
closure takes effect immediately.

### Forty-three overridable reads serve five registrations

`EditorQueryMiddlewareMap` exposes 43 methods: fragment 1, marks 1, nodes 26,
points 9, ranges 5, text 1
(`packages/plite/src/interfaces/editor.ts:1367-1559`). Core read construction
routes those methods through recursive `next()` middleware with WeakMap depth
tracking (`packages/plite/src/core/query-middleware.ts:1-216`); there are 73
`executeQueryMiddleware` call occurrences across the two read surfaces and the
middleware owner.

Production Plate registers only five entries in four owners:

1. merge-target policy in core override
   (`packages/core/src/lib/plugins/override/OverridePlugin.ts:500-527`);
2. dynamic selectable policy for closed toggles
   (`packages/toggle/src/react/TogglePlugin.tsx:100-108`);
3. copied-fragment cleanup for diff metadata
   (`packages/diff/src/lib/excludeDiffFromFragment.ts:30-39`);
4. copied-fragment projection for table-cell selections
   (`packages/table/src/lib/BaseTablePlugin.ts:2543-2575`);
5. mark aggregation for table-cell selections
   (`packages/table/src/lib/BaseTablePlugin.ts:3046-3080`).

These are four different domain policies, not evidence that arbitrary core
reads should be middleware.

### Mutual mark validity lives in commands

Subscript and superscript are independent boolean schema properties, then each
plugin’s toggle manually clears the other:

- `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:6-27`;
- `packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts:6-27`.

Plite exposes caller-provided `EditorMarkToggleOptions.clear`
(`packages/plite/src/interfaces/editor.ts:539-545`) and executes it only in the
toggle transform (`packages/plite/src/editor/toggle-mark.ts:14-54`). Direct mark
addition, external JSON, codecs, paste, collaboration, and custom commands do
not derive the exclusivity law from schema. Registry UI currently calls the
typed plugin updates, so the main UI path is safe
(`apps/www/src/registry/ui/mark-toolbar-button.tsx:38-76`); the document
invariant is still not safe.

### Content grammar pressure is real but bounded

`SchemaContent` expresses allowed membership plus one global `min`/`max` and
default (`packages/plite/src/interfaces/schema.ts:174-199`). Nested rules
explicitly reject their own cardinality
(`packages/plite/src/core/schema-definition.ts:738-747`). The compiled program
therefore stores only allowed types/text/unknown/default/global min/max
(`packages/plite/src/core/schema-compiler.ts:280-293`).

Plate has 14 production correction arrays with 15 entries. Only four owners
with five entries directly express positional/cardinality grammar that a richer
regular content model could own:

- single block (`packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts:17-39`);
- single line, two corrections
  (`packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts:18-57`);
- required trailing block
  (`packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts:44-73`);
- exact path/type rules
  (`packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts:30-69`).

Other correction pressure is not solved by ordered grammar:

- table rectangle/span geometry
  (`packages/table/src/lib/BaseTablePlugin.ts:2812-2886`);
- column widths summing to 100%
  (`packages/layout/src/lib/BaseColumnPlugin.ts:62-93`);
- flat-list derived numbering
  (`packages/list/src/lib/BaseListPlugin.tsx:1617-1652`);
- comment/suggestion/AI/tag semantic metadata;
- code highlighting cache refresh.

Code blocks, table membership, columns, cells, blockquotes, and footnotes
already use the current membership grammar effectively. A full ProseMirror-like
content-expression engine is material only if donor laws show slice-fitting or
external-value failures beyond the five utility correction entries. Table
geometry and list derivation must remain domain planners either way.

The maintenance-only classic-list package is excluded from the target package
denominator, but it is still relevant counter-evidence. Its list-item rule
allows the content element, nested list types, and configured children in any
order (`packages/list-classic/src/lib/BaseListPlugin.ts:68-103`), while the
implementation has ten direct index/path assumptions that content is child
zero and a nested list is child one
(`packages/list-classic/src/lib/BaseListPlugin.ts:497,504,733,739,1475,2364,2377,2537,2541,2546`).
An ordered grammar would make those assumptions valid and make imported slices
fit the structure. It would not delete the list algorithms themselves, and it
does not justify retaining a package that `VISION.md` already classifies as
maintenance-only.

Primary-root modes also need a separate ownership decision. Plate currently
hardcodes one root grammar—top-level block membership with `min: 1`
(`packages/core/src/lib/editor/withPlite.ts:362-379`)—and plugin schema
contributions are forbidden from owning the primary root
(`packages/plite/src/interfaces/schema.ts:368-395`). That exclusivity is good:
an arbitrary plugin must not silently replace the application document shape.
If ordered terms are accepted, application/editor construction needs one
explicit root-content configuration. `SingleBlockPlugin` and
`SingleLinePlugin` cannot be translated into a bare `max: 1`: they also define
merge/newline and break behavior
(`packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts:8-47`;
`packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts:8-70`).
Likewise, `TrailingBlockPlugin` has level/matcher/custom-insert policy and
`NormalizeTypesPlugin` accepts arbitrary paths. Ordered terms can replace only
their static positional law; the behavioral policy remains a command,
fitter hook, or correction.

### Internal Plite dependencies

Plate production has 31 imports from Plite-family internal entrypoints across 30
files. Core and Yjs are intentional friend packages. Only three feature-package
imports expose product-facing pressure:

1. list reads internal changed-root keys and opens an internal root update scope
   (`packages/list/src/lib/BaseListPlugin.tsx:30-33,1162-1173,1308-1325`);
2. table reads/writes Plite’s internal exact clipboard envelope
   (`packages/table/src/lib/BaseTablePlugin.ts:45-49,1474-1499,2583-2626`);
3. table React claims Plite’s internal DOM commit protocol
   (`packages/table/src/react/useTableElement.ts:1-17`).

The first two are generic extension-author needs. The third has one first-party
feature consumer and is explicitly documented in source as an internal Plate
render-boundary protocol
(`packages/plite-react/src/hooks/use-claim-editable-dom-commit.ts:27-38`), so it
does not justify a broad public API without a second independent consumer.

## Pressure-test verdicts and exact deletion denominator

These are Plate-lane verdicts for the parent cross-editor audit. A donor can
change a `defer` to `accept` only with a concrete law or failure that Plite does
not already cover.

| Packet                                                | Verdict                                                                                                                                                                     | Exact live denominator                                                                                                                                                                                                                   | Hard deletion target                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Immutable configuration vs editor-local session state | **Accept, P0.** One value cannot safely be both compiler input and mutable state.                                                                                           | 169 production `setOption`/`setOptions` calls in 42 files; four mixed context/portal methods in `PluginBaseContext`; four exported React access hooks; the store and hook owners total 339 lines.                                        | Delete the mixed `getOption`, `getOptions`, `setOption`, and `setOptions` contract; delete the four mixed hook names (`usePluginOption`, `useEditorPluginOption`, `usePluginOptions`, `useEditorPluginOptions`); replace the mixed `PluginOptionsStore` owner. Retain only reusable snapshot/store mechanics under explicit config or session owners.                   |
| Global plugin/extension priority                      | **Accept, P0. Hard-cut.** A number that changes unrelated compilers is invalid configuration.                                                                               | Two conceptual public scalars repeated across six type declarations; ten Plate consumption sites plus one Plite extension sort; five authored/default magic assignments (`100`, `10_000`, code-block `10`, list `100`, override `-100`). | Delete both global scalars, all eleven cross-lane consumption sites, the five assignments, and priority from plugin graph signatures. Keep capability-local codec, HTML, shortcut, input-rule, and override precedence.                                                                                                                                                 |
| Ordered content grammar                               | **Defer as a ranked Plate change; accept only with donor fit/validation evidence.** Plate proves a real expressiveness gap, but not enough active deletion value by itself. | Five active correction entries in four utility owners; one hardcoded primary-root grammar; ten unsafe positional assumptions in excluded classic-list.                                                                                   | No immediate hard deletion. If accepted, the maximum first adoption is the root-cardinality part of two single-block/single-line corrections plus static cases of trailing-block and normalize-types. Their merge, newline, matcher, custom-insert, and error policy must remain. Classic-list algorithms remain and the package stays on its independent removal path. |
| Schema-owned mutually exclusive mark groups           | **Accept, P1.** This is document validity, not toolbar policy.                                                                                                              | Twelve mark-clear-specific occurrences in six files: one public option, core toggle helper/execution, command forwarding, two feature declarations, and one generic toolbar hook.                                                        | Delete all twelve occurrences and `EditorMarkToggleOptions.clear`; the two mark plugins stop naming each other and the toolbar stops carrying schema knowledge.                                                                                                                                                                                                         |
| Generic query middleware                              | **Accept, P1, subject only to the external-editor extension inventory.** Five registrations do not justify intercepting nearly every read.                                  | 43 overridable methods, 73 wrapper calls, four exported middleware types, one 216-line execution owner, and five registrations in four Plate files.                                                                                      | Delete the generic map/context/result/args types, registry field and registration path, depth tracking, generator wrapper, 73 wrappers, and all five registrations after adopting four explicit policy owners.                                                                                                                                                          |

## Plate candidate leads

These are live-source candidates for the parent audit to reconcile against all
three editors. They are not final cross-editor rankings.

### PL-C1 — split immutable plugin options from editor-local session state

Plate verdict: accept, P0. Route: `best-api` then `plate-plan`; no Plite change
is needed.

Current public shape:

```ts
const PlaceholderPlugin = createPlatePlugin({
  options: {
    disableFileDrop: false,
    uploadConfig,
    uploadingFiles: {},
    error: null,
  },
  schema: ({ options }) => schemaFrom(options),
});

editor.plugin(PlaceholderPlugin).setOption("uploadingFiles", files);
const files = usePluginOption(PlaceholderPlugin, "uploadingFiles");
```

Proposed public shape:

```ts
const PlaceholderPlugin = createPlatePlugin({
  options: {
    disableFileDrop: false,
    upload: uploadConfig,
  },
  session: () => ({
    error: null as UploadError | null,
    uploadingFiles: {} as Record<string, File>,
  }),
  schema: ({ options }) => schemaFrom(options),
});

editor.plugin(PlaceholderPlugin).session.set({ uploadingFiles: files });
const files = usePluginSession(
  PlaceholderPlugin,
  (session) => session.uploadingFiles
);
```

Advanced shape:

```ts
const SearchPlugin = createBasePlugin({
  options: { caseSensitive: false },
  session: () => ({ query: "" }),
  api: ({ options, session }) => ({
    normalized: () => {
      const { query } = session.get();

      return options.caseSensitive ? query : query.toLocaleLowerCase();
    },
  }),
});
```

Target internal shape:

- `options` is one frozen descriptor graph used by schema, codec, rule, and
  publication compilation;
- `session` is one editor-local typed store with stable selector subscriptions
  and explicit setup/cleanup;
- session writes never claim document/history/Yjs persistence;
- semantic persistent state uses document properties, Plite state fields, or
  typed effects instead;
- live application/provider settings remain with their application owner;
  runtime plugin reconfiguration is not part of this packet.

Hard deletions:

- mutable `setOption`, `setOptions`, and option-store fallback from plugin
  context;
- `PluginOptionsStore` as a mixed owner;
- `usePluginOption(s)` over the mixed graph;
- tests asserting runtime options diverge from published options;
- docs calling options both configuration and state.

Adoption:

- 169 production mutation calls across 42 files;
- AI/copilot, selection, DnD, link popover, media upload, comments,
  suggestions, cursors, find/replace, navigation feedback;
- schema/codec/rule factories keep one readonly `options` revision;
- registry settings that change only live behavior move to session/app state;
- any future live setting that changes compiled structure requires a separate
  evidence-backed atomic reconfiguration packet.

Proof:

- options cannot change after publication;
- session updates notify only session subscribers;
- session never enters history, Yjs, serialization, or schema fingerprints;
- editor destruction runs session cleanup;
- session/options inference requires no callback annotations;
- benchmark store subscription and 5,000-block no-traversal behavior.

Dependency: none. Reuse the existing private store kernel for `session`; do not
add a new reactive system.

### PL-C2 — hard-cut global plugin and extension priority

Plate verdict: accept, P0. Route: `best-api`, then `plate-plan`; `plite-plan` owns
removal of `EditorExtension.priority`.

Current public shape:

```ts
createBasePlugin({
  key: "feature",
  dependencies: [Dependency],
  priority: 200,
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "text/html": { match, decode, encode, priority: 10 },
    }),
  shortcuts: {
    toggle: { keys: "mod+k" }, // silently inherits 200
  },
});

defineEditorExtension({
  name: "feature-runtime",
  priority: 200,
});
```

Proposed public shape:

```ts
createBasePlugin({
  key: "feature",
  dependencies: [Dependency],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "text/html": { match, decode, encode, priority: 10 },
    }),
  shortcuts: {
    toggle: { keys: "mod+k", priority: 20 },
  },
  inputRules: [{ ...rule, priority: 30 }],
  override: {
    components: {
      paragraph: { component: Paragraph, priority: 10 },
    },
  },
});

defineEditorExtension({
  name: "feature-runtime",
  dependencies: ["dependency-runtime"],
});
```

Target internal shape:

- dependencies determine legality and topological order;
- source/configuration order is the stable tie-break for unrelated plugins and
  extensions;
- each compiler owns its own optional local precedence;
- ambiguous equal claims reject at the compiler that understands the conflict;
- command middleware order comes from extension configuration/dependencies, not
  a global number.

Hard deletions:

- `BasePlugin.priority`, default `100`, root `10_000`, override `-100`;
- `EditorExtension.priority`;
- shortcut and input-rule fallback to plugin priority;
- plugin-priority fields in MIME/HTML compiled declarations;
- weak/component override dependence on plugin priority;
- graph-signature priority field and related cross-lane tests.

Adoption:

- make every intentional shortcut, input-rule, codec, HTML, component, and weak
  override ordering explicit in that lane;
- reject callers using global priority as an undocumented side effect;
- update docs and type tests.

Proof:

- permutation/property tests for dependency graphs;
- each local compiler’s conflict and stable-order laws;
- one lane’s priority cannot alter any other lane;
- before/after compile and dispatch benchmark.

### PL-C3 — replace general read middleware with four explicit policies

Plate verdict: accept, P1, subject to the external-editor extension inventory.
Route: `best-api` then `plite-plan`, with Plate adoption in `plate-plan`.

Current public shape:

```ts
defineEditorExtension({
  queries: {
    nodes: {
      isSelectable({ element, next, state }) {
        return hidden(element, state) ? false : next();
      },
    },
    fragment: {
      get({ next }) {
        return sanitize(next());
      },
    },
  },
});
```

Proposed public shape:

```ts
defineEditorExtension({
  nodePolicy: {
    selectable({ element, state }) {
      return hidden(element, state) ? false : undefined;
    },
    removePreviousOnMerge({ current, previous, state }) {
      return shouldRemove(previous, current, state) ? true : undefined;
    },
  },
  fragment: {
    map(fragment, state) {
      return sanitize(fragment, state);
    },
  },
  selections: [
    {
      kind: "table-cell",
      marks(selection, state) {
        return aggregateCellMarks(selection, state);
      },
    },
  ],
});
```

`undefined` means “no opinion”; veto/replace/reducer semantics are fixed per
policy. Ordinary handlers do not receive `next`.

Target internal shape:

- core reads stay direct;
- a compiled selectable predicate list is consulted only by selectability;
- a compiled merge policy is consulted only by merge;
- fragment mappers form one simple reducer;
- custom selection specs own their mark projection;
- no recursive arbitrary method interception, query depth WeakMaps, or
  generator context wrapper.

Hard deletions:

- `EditorQueryMiddlewareArgs`, `EditorQueryMiddlewareResult`,
  `EditorQueryMiddlewareMap`, and generic context;
- `queryMiddlewares` registry map and registration;
- `executeQueryMiddleware`, default/query depth WeakMaps, generator wrapper;
- 43 read wrappers and generic query middleware tests.

Adoption:

- core override merge policy;
- toggle selectable policy;
- diff/table fragment mappers;
- table-cell selection mark resolver;
- plugin docs that currently advertise query middleware.

Proof:

- composition laws for fragment maps and predicate policies;
- table-cell marks, closed-toggle navigation, diff copy, and merge behavior;
- read microbenchmarks with zero policies and multiple policies;
- browser copy/selection proof for table and toggle.

### PL-C4 — compile mutually exclusive marks as schema law

Plate verdict: accept, P1, because it closes every construction path and deletes
caller knowledge. Route: `best-api` then `plite-plan`; basic-nodes and registry
adoption in `plate-plan`.

Current public shape:

```ts
schema: {
  mark: property.boolean({ default: false, omitDefault: true }),
},
update: ({ editor, tx, type }) => ({
  toggle: () =>
    tx.marks.toggle(type, true, {
      clear: editor.getType(KEYS.sup),
    }),
}),
```

Proposed public shape:

```ts
const ScriptPositionMarks = schema.markGroup("script-position", {
  max: 1,
});

const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: property.boolean({
      default: false,
      groups: [ScriptPositionMarks],
      omitDefault: true,
    }),
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});
```

Target internal shape:

- schema compiler resolves structurally identified mark groups and rejects
  contradictory declarations;
- mark add/toggle derives competing removals from compiled schema;
- text canonicalization, slice fitting, codec decode, external value
  validation, history, and Yjs all preserve the same cardinality;
- transactions use “new mark wins”; ambiguous external JSON is rejected or
  repaired by one documented fitting policy, never object-key order.

Hard deletions:

- `EditorMarkToggleOptions.clear`;
- clear handling in `applyToggleMark` and `editorCommands.toggleMark`;
- subscript/superscript command knowledge of each other;
- `clear` props in generic mark toolbar hooks;
- tests/docs that make callers specify mutual exclusion.

Adoption:

- subscript and superscript declarations;
- any other genuinely exclusive marks discovered in product schemas;
- codec/external-value diagnostics and migration fixtures.

Proof:

- every construction path cannot publish both marks;
- add/toggle/invert/compose/history/Yjs laws;
- HTML nesting and Markdown decode cases;
- no change for independent marks.

### PL-C5 — add typed ordered content terms only if donor laws justify them

Plate verdict: defer pending donor fit/validation evidence. Route if accepted:
`best-api` then `plite-plan`, with `plate-plan` adoption. Do not build a string
grammar.

Current public shape:

```ts
content: schema.content.types([cellType, headerCellType], {
  default: { type: cellType },
  min: 0,
});
```

The rule constrains every child identically.

Proposed public shape:

```ts
content: schema.content.sequence([
  schema.term.type(titleType, { min: 0, max: 1 }),
  schema.term.group("block", { min: 1 }),
]);

const editor = createPlateEditor({
  document: {
    content: schema.content.sequence([
      schema.term.group("block"),
      schema.term.type(trailingType, { min: 1, max: 1 }),
    ]),
  },
  plugins,
});

const ClassicListItemPlugin = createBasePlugin({
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.sequence([
        schema.term.type(plugins.elementType(ListItemContentPlugin)),
        schema.term.anyOf(plugins.elementTypesByKey(nestedListPlugins), {
          max: 1,
        }),
      ]),
    },
  }),
});
```

Target internal shape:

- immutable typed grammar AST;
- compiler lowers it to deterministic transition/repair tables shared by
  validation, create-and-fill, slice fitting, and corrections;
- expected-token diagnostics identify exact position and owner;
- no regular grammar attempts to encode table span geometry, column width
  totals, or flat-list numbering.

Possible deletions, not guaranteed by grammar alone:

- the root-cardinality correction in `SingleBlockPlugin`;
- the root-cardinality correction in `SingleLinePlugin`, while its text
  sanitizer and break commands remain;
- only static exact-type cases of `TrailingBlockPlugin` and
  `NormalizeTypesPlugin`;
- representation-only correction passes that the fitter can make impossible;
- special-case slice-fitting branches proven redundant by generated laws.

Adoption/proof:

- first port only the four concrete positional owners;
- generated acceptance/fill/fit laws for optional, repeated, and required
  terms;
- paste/replace/browser proof for those owners;
- large-document compile and fit benchmarks.

Hard gate: if Wordgard/Lexical/ProseMirror tests do not expose material
fit/validation failures beyond the five current correction entries, keep this
deferred. Current table/list/layout corrections do not justify it, and
classic-list is not a target-architecture retention argument.

### PL-C6 — publish the two generic host contracts currently used by features

Preliminary value: medium. Route: `best-api` then `plite-plan`; Plate feature
adoption in `plate-plan`.

Current public/internal shape:

```ts
import {
  getInternalDocumentChangeRootKeys,
  withEditorUpdateRootScope,
} from "@platejs/plite/internal";

import {
  getDOMClipboardFormatKey,
  readDOMFragmentData,
  writeDOMHostFragmentData,
} from "@platejs/plite-dom/internal";
```

Proposed public shape:

```ts
for (const root of change.changedRoots()) {
  tx.inRoot(root, (rootTx) => {
    updateDerivedListState(rootTx, change.changed(root));
  });
}

const slice = editor.api.dom.clipboard.readSlice(data);
editor.api.dom.clipboard.writeSlice(data, {
  slice: ContentSlice.closed([table]),
  formats: { "text/csv": csv, "text/tab-separated-values": tsv },
});
```

Target internal shape:

- `DocumentChange.changedRoots()` exposes public logical root keys;
- transaction root scoping is a public extension-author operation with nested
  scope restoration;
- Plite DOM owns exact MIME/envelope/versioning and host representation writes;
- table owns CSV/TSV/table semantics, not envelope bytes.

Hard deletions:

- list imports of internal root helpers;
- table imports of internal clipboard format/read/write helpers;
- duplicated exact-MIME and embedded-fragment detection in table;
- feature tests coupled to internal format constants.

Proof:

- multi-root list changes and scope restoration under thrown callbacks;
- exact slice/HTML/plain/CSV/TSV clipboard round trips;
- malformed exact payload rejection;
- table cross-editor copy/paste browser proof.

Do not automatically publicize `useClaimEditableDOMCommit`. It has one
feature-package consumer and exposes a renderer protocol. First test whether
Plate’s own store hooks can claim commits internally or whether a declarative
render boundary can own it.

### PL-C7 — compile and cache plugin portals, with no public call-site break

Preliminary value: medium only if benchmarked. Route: `plate-plan`; `best-api`
is unnecessary if the public shape remains identical.

Current public shape:

```ts
editor.plugin(TablePlugin).api.getGridAbove();
editor.plugin(TablePlugin).read.selection();
editor.plugin(TablePlugin).update.insertRow();
```

Current internal shape creates recursive `Proxy` trees for API, read, and update
on every `getEditorPlugin` call
(`packages/core/src/lib/plugin/getEditorPlugin.ts:31-228`). There are 271
production `editor.plugin(...)` call-site lines.

Proposed internal shape:

```ts
type CompiledPluginPortal = Readonly<{
  api: Readonly<Record<string, unknown>>;
  read: Readonly<Record<string, (...args: unknown[]) => unknown>>;
  update: Readonly<Record<string, (...args: unknown[]) => unknown>>;
  // config/session accessors
}>;

// Stable by editor runtime owner and plugin key.
portalCache.get(editor).get(plugin.key);
```

Publication already knows the compiled API and update/read method paths. Bind
stable functions once, freeze the portal, and use a separate lightweight
authoring context while resolving descriptors.

Hard deletions:

- recursive `createApiFacade`, `createReadFacade`, `createUpdateFacade`;
- per-access `then`/`toJSON` guards;
- runtime path walking and late “not callable” errors for published methods.

Proof:

- stable portal/function identity;
- pre-publication authoring callbacks still infer and resolve;
- missing plugin/method diagnostics;
- portal creation and hot-call benchmarks. Reject the change if it is not
  simpler and measurably cheaper.

### PL-C8 — one internal descriptor type/compiler kernel, two public hosts

Preliminary value: medium-low cleanup, not a reason to collapse public
entrypoints. Route: `architecture-cleanup` or `plate-plan` after the higher
dependencies settle.

Current public shape:

```ts
createBasePlugin({ ...headlessContributions });
createPlatePlugin({ ...headlessAndReactContributions });
toPlatePlugin(BasePlugin, { component });
```

Keep that public shape. The pressure is internal: five descriptor/type-builder
files total 5,115 lines and contain 123 `any`/`as any` markers:

- `packages/core/src/lib/plugin/BasePlugin.ts`;
- `packages/core/src/lib/plugin/createBasePlugin.ts`;
- `packages/core/src/react/plugin/PlatePlugin.ts`;
- `packages/core/src/react/plugin/createPlatePlugin.ts`;
- `packages/core/src/react/plugin/toPlatePlugin.ts`.

Proposed internal shape:

```ts
type PluginHost = {
  render: object;
  editor: object;
};

type PluginDescriptorSpec<THost extends PluginHost, TContract> = Readonly<{
  core: CompiledPluginCore<TContract>;
  host: THost['render'];
}>;

const createPluginDescriptor = <THost extends PluginHost>(host: THost) => ...
```

Base and React constructors become thin typed frontends over one descriptor
method/configuration compiler. React render fields remain impossible from the
base entrypoint.

Hard deletions:

- duplicated configure/extend overload machinery that one kernel can infer;
- `toPlatePlugin` field-copy/normalization branches made redundant by host
  projection;
- render-pipeline casts whose only cause is erased descriptor host type.

Proof:

- retain every current type-test inference contract;
- negative tests prevent React fields in base plugins;
- emitted declaration size and TypeScript compile-time benchmark;
- no public package/export churn unless it removes a demonstrated problem.

## Explicit non-candidates from the live Plate lane

- Do not move tables, flat lists, media, AI, comments, suggestions, codecs,
  copied kits, or UI into Plite.
- Do not replace plain JSON nodes with classes.
- Do not replace table-cell selection with DOM-only selection state.
- Do not replace Yjs with a Plate-owned central transform protocol.
- Do not merge headless, React, and static entrypoints.
- Do not replace app-owned registry kits with one locked package preset.
- Do not turn `usePlateEditor` into a reactive options hook by itself. Its
  current dependency list deliberately controls editor instance lifetime
  (`packages/core/src/react/editor/usePlateEditor.ts:22-90`). Configuration
  revision belongs to PL-C1; document resets belong to an explicit key/reset.
- Do not add ordered grammar to encode relational table geometry, column
  percentages, or flat-list numbering.
- Do not publish renderer commit-claim machinery solely because one first-party
  feature imports it.

## Proof and adoption owners

| Change family                        | Primary owner                                         | Required downstream owners                                            |
| ------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Plugin config/session split          | `best-api` → `plate-plan`                             | all feature packages, registry, docs, package integration tests       |
| Scoped priority                      | `best-api` → `plate-plan`; Plite part in `plite-plan` | codecs, shortcuts, input rules, override components, extensions       |
| Narrow query policies                | `best-api` → `plite-plan`                             | core override, toggle, diff, table, docs/browser                      |
| Exclusive mark schema law            | `best-api` → `plite-plan`                             | basic-nodes, utils toolbar hook, registry, HTML/Markdown, Yjs/history |
| Ordered content terms                | `best-api` → `plite-plan` if accepted                 | utils structural plugins, codecs, slice fitter, browser paste         |
| Root/clipboard public host contracts | `best-api` → `plite-plan`                             | list, table, plite-dom, browser                                       |
| Portal compilation                   | `plate-plan`                                          | core package only plus performance proof                              |
| Descriptor kernel consolidation      | `architecture-cleanup` / `plate-plan`                 | core types, all type tests, declaration/compile benchmarks            |

## Closure statement for the Plate lane

Every current public Plate package, package export key, source/proof/product/doc
file, and top-level TypeScript declaration in the declared scope has a manifest
row with at least one atomic concept or an exact exclusion. The live audit found
five material architecture pressures, two generic host-contract leaks, two
conditional internal simplifications, and explicit reasons to preserve the
remaining Plate ownership. Cross-editor agents must still decide whether each
candidate beats the full Wordgard/Lexical/ProseMirror evidence; this artifact
does not promote a candidate merely because another editor looks cleaner.
