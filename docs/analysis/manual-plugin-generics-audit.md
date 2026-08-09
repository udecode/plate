# Manual plugin generics audit

Date: 2026-07-26

Scope: explicit TypeScript generics that manually supply Plate plugin contracts
to builders, scoped portals, updates, or React hooks in package source, package
tests, `apps/www`, and current docs. This is a read-only API audit. It does not
authorize source migration.

## Verdict

The aggregate contract is the problem, not the angle brackets by themselves.

- Type method inputs at the method that owns them.
- Infer method returns, plugin API, read, update, selectors, extension, and the
  final plugin config.
- Keep a named domain type when defaults cannot express optional or nullable
  consumer options.
- Keep an explicit generic only for a real external contract, generic factory,
  Core bootstrap boundary, or a type test whose subject is the explicit
  contract path.

The audited surface contains 109 current code/docs calls:

| Surface                               | Migrate |   Keep |   Total |
| ------------------------------------- | ------: | -----: | ------: |
| Production package builders           |      20 |      1 |      21 |
| Production package capability ferries |      12 |      0 |      12 |
| Package tests and type tests          |      26 |     28 |      54 |
| `apps/www` and current `content/**`   |      20 |      2 |      22 |
| **Total**                             |  **78** | **31** | **109** |

One active plan also contains a stale shadow contract, bringing the actionable
count to 79 without changing the current-code total.

`Migrate` has two forms:

- **Remove**: the generic only restates output already present in the
  implementation.
- **Reshape**: the generic mixes a real input domain with inferred output.
  Preserve the input domain at its field or method, then delete the aggregate
  config generic. Do not replace it with `as`, `any`, or callback annotations.

## Production package builders

### Remove all nine `.extend<TContract>` output contracts

| Call                                                             | Decision | Target                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/comment/src/lib/BaseCommentPlugin.ts:126`              | Remove   | Type `setDraft` and `unsetMark` inputs inline; infer the update group. The stage remains because it consumes earlier API/read capabilities.                                                                                                                                                         |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts:217`             | Remove   | Use `.extend({ extension: pliteDom() })`. The imported extension is already typed.                                                                                                                                                                                                                  |
| `packages/link/src/lib/BaseLinkPlugin.ts:241`                    | Remove   | Type link command inputs at `insert`, `unwrap`, `upsert`, `upsertText`, and `wrap`; delete the aggregate `BaseLinkTx`.                                                                                                                                                                              |
| `packages/link/src/react/LinkPlugin.tsx:61`                      | Remove   | Type floating-link API and selector inputs locally; derive `LinkConfig`. Keep the stage because it adapts the imported Base descriptor and consumes added options.                                                                                                                                  |
| `packages/list/src/lib/BaseListPlugin.tsx:657`                   | Remove   | Delete the generic only. Every domain input is already typed at its method.                                                                                                                                                                                                                         |
| `packages/media/src/lib/media/MediaPlugin.internal.ts:141`       | Remove   | Keep generic factory `C`, but infer the inner contribution after typing `insert` and `setUrl` inputs locally. An isolated current-factory TS7/`tsdown` declaration probe preserves its key-correlated output without `any`; apply after Media adopts Core's in-flight `initialState`/`store` names. |
| `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:221` | Remove   | Type `addUploadingFile`, `removeUploadingFile`, and `uploadingFile` inputs locally. Use `Partial<Record<string, File>>` so selector inference remains `File \| undefined`.                                                                                                                          |
| `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:242` | Remove   | Type media-upload inputs locally and infer the update group.                                                                                                                                                                                                                                        |
| `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:662`        | Remove   | Type update inputs at their methods. Replace the aggregate `BaseSuggestionTx` with only the smaller domain input types genuinely reused by internal helpers.                                                                                                                                        |

The stages are not automatically wrong. Seven consume earlier capabilities,
React Link adapts an imported descriptor, and Media is a shared generic
factory. Their manual output contracts are wrong.

### Reshape eleven constructor/adapter generics

| Call                                                                                 | Target                                                                                                                                                     | Important constraint                                                                                |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/core/src/lib/plugins/debug/DebugPlugin.ts:59`                              | Keep logger option/input domain types; inline API method inputs; derive `DebugConfig`.                                                                     | Preserve logger callback inference.                                                                 |
| `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts:48` | Type navigation inputs locally, widen `storedTarget` at the option field, infer selectors/update, derive config.                                           | Replace the self-generic render hook with its contextual installed plugin.                          |
| `packages/dnd/src/DndPlugin.tsx:54`                                                  | Export `DndPluginState`, check a typed default object, infer the descriptor, and derive config.                                                            | Preserve optional `onDropFiles`, which is absent from defaults.                                     |
| `packages/link/src/react/LinkPlugin.tsx:47`                                          | Let `toPlatePlugin` infer `BaseLinkPlugin`; retain only floating-link option domains; derive config.                                                       | Coordinate with the `.extend<T>` removal above.                                                     |
| `packages/selection/src/react/BlockMenuPlugin.tsx:35`                                | Type API inputs locally and derive config.                                                                                                                 | Keep nullable/union option domains; use a lexical `show` implementation for same-declaration reuse. |
| `packages/selection/src/react/BlockSelectionPlugin.tsx:251`                          | Keep reusable option/query input types, infer API/read/update/selectors, derive one config.                                                                | Break hook import cycles and same-declaration self-calls before emit.                               |
| `packages/selection/src/react/CursorOverlayPlugin.tsx:43`                            | Infer options/API, then use one dependent stage for extension/handlers/hooks that consume that API.                                                        | Delete the `DOMHandler<CursorOverlayConfig>` ferry and existing `any` repairs.                      |
| `packages/toggle/src/react/TogglePlugin.tsx:27`                                      | Let `toPlatePlugin` infer `BaseTogglePlugin`, add the `toggleIndex` option, then infer the dependent selectors/hooks stage.                                | Break the `useToggle` config cycle.                                                                 |
| `packages/utils/src/lib/plugins/NormalizeTypesPlugin.ts:30`                          | Export `NormalizeTypesPluginState`, check typed defaults, and derive config.                                                                               | Keep optional `onError` and name `Rule` cleanly.                                                     |
| `packages/utils/src/lib/plugins/TrailingBlockPlugin.ts:29`                           | Export `TrailingBlockPluginState` and give the editor-derived default factory an explicit return type.                                                     | Preserve optional `insert`/`match` and broad resolved `type`.                                       |
| `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx:37`                     | Export `BlockPlaceholderPluginState`, check typed defaults, narrow query context, and infer selectors.                                                     | Do not replace the recursive contract with a cast.                                                  |

These are not all blind deletions. Nullable defaults and absent optional keys
cannot communicate their full domain through value inference. Each production
owner declares a named `*PluginState` and checks its defaults with a typed
constant or explicit factory return type. The builder still infers the
descriptor's capabilities from those checked values; no full `PluginConfig`
generic or cast is needed.

### Keep one production builder generic

| Call                                                | Why it stays                                                                                                                                                                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts:70` | `createBasePlugin<DomConfig>` is a nameable Core bootstrap boundary. Removing it creates circular `CorePluginApi`/`CorePluginTx` derivation or enormous declarations. Keep it until the Core bootstrap types are reorganized; the final `.extend<...>` generic still goes. |

## Production package capability ferries

All 12 migrate. These calls reconstruct a plugin contract from a key or force a
whole editor type only to reach one installed capability.

| Call                                                                                  | Target                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/csv/src/lib/deserializer/utils/deserializeCsv.ts:15`                        | Let `CsvPlugin` call `deserializeCsvWithContext` directly. A retained editor wrapper imports the real `CsvPlugin` and passes its resolved options; otherwise delete the wrapper in favor of the plugin API.            |
| `packages/markdown/src/lib/internal/markdownRuntime.ts:43`                            | Make `createMarkdownRuntime` consume resolved `MarkdownPluginState` or owner context. Do not invent `MarkdownRuntimeConfig` from `pluginName`.                                                                        |
| `packages/markdown/src/lib/internal/markdownRuntime.ts:77`                            | Pass resolved options into `withMarkdownRuntime`; keep the runtime module descriptor-agnostic to avoid a cycle.                                                                                                        |
| `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:485`                      | Let the handler context retain the exact plugin config so bare `editor.update((tx) => tx.placeholder.insertMedia(...))` infers. Core currently erases the key through `DOMHandlers<WithAnyName<C>>`; repair that owner. |
| `packages/selection/src/react/hooks/useBlockSelectable.ts:20`                         | Use `useEditorPlugin(BlockSelectionPlugin)` after colocating/breaking the reverse import.                                                                                                                              |
| `packages/selection/src/react/hooks/useSelectionArea.ts:45`                           | Same real-descriptor portal; delete the key-plus-config surrogate.                                                                                                                                                     |
| `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts:229` | Use the contextual installed `plugin` in `transformProps` with `useEditorPluginStore`.                                                                                                                                 |
| `packages/toc/src/react/useToc.ts:112`                                                | Use a plain editor plus `useEditorPlugin(NavigationFeedbackPlugin)` for the owned capability.                                                                                                                          |
| `packages/toggle/src/react/useToggle.ts:76`                                           | Use `usePluginStore(TogglePlugin, 'isClosed', elementId)` after hook-family colocation.                                                                                                                                |
| `packages/indent/src/react/hooks/useIndentButton.ts:9`                                | Use `useEditorPlugin(BaseIndentPlugin).update.increase()`.                                                                                                                                                             |
| `packages/indent/src/react/hooks/useOutdentButton.ts:9`                               | Use `useEditorPlugin(BaseIndentPlugin).update.decrease()`.                                                                                                                                                             |
| `packages/floating/src/hooks/useFloatingToolbar.ts:36`                                | Use plain `useEditor({ id })`; Core capability is already part of `BaseEditor`.                                                                                                                                        |

The targeted AST scan found 28 calls in this family across 1,289 production
package files. The other 16 are legitimate generic editor/value boundaries:
Plite React runtime wrappers, one Core generic forwarding hook, and one
Excalidraw value specialization.

## `apps/www` and current docs

### Remove nine calls outright

- `apps/www/src/app/(app)/examples/plite/_examples/plate-schema-descriptors.tsx:63`
  — infer the `label: string` codec proof plugin.
- `apps/www/src/registry/ui/suggestion-node.tsx:29,229,233,300,304`
  — use the real resolved suggestion descriptor/renderer plugin instead of a
  name-only `WithRequiredName<SuggestionConfig>` surrogate.
- `apps/www/src/registry/ui/media-placeholder-node.tsx:111`
  — take `editor` from `useEditorPlugin(PlaceholderPlugin)` and infer
  `tx.placeholder`.
- `content/docs/api/core/plate-plugin.mdx:548` and
  `content/docs/api/core/plate-plugin.cn.mdx:526`
  — teach inferred constructor fields, not a fake `MyPluginConfig` shadow.

### Reshape eleven option-domain calls

- `apps/www/src/registry/components/editor/plugins/comment-kit.tsx:25`
  carries real `string | null` and `Path | null` option domains. Replace the
  duplicated full `CommentConfig` shape only when the conversion authoring path
  can type those option fields without casts.
- Comment docs use stale one-argument `toPlatePlugin<CommentConfig>` at
  `comment.mdx:91,114,168` and `comment.cn.mdx:91,114,168`. Teach imported
  descriptor adaptation plus a checked added-options domain.
- Suggestion docs have the same problem at `suggestion.mdx:93,126` and
  `suggestion.cn.mdx:91,124`.

### Keep two extracted-factory contracts

- `content/docs/(guides)/plugin-methods.mdx:171`
- `content/docs/(guides)/plugin-methods.cn.mdx:163`

`createBasePlugin<TriggerConfig>` is honest there: an extracted reusable
extension factory is typed from `BasePluginContext<TriggerConfig>`, and
contextual typing cannot flow backward into that factory.

## Package tests and type tests

The test audit found 54 actual builder-generic calls across 16 files.

### Migrate 26 test calls

| File                                                          | Lines                   | Reason                                                                                        |
| ------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `packages/selection/src/react/BlockMenuPlugin.spec.tsx`       | 8                       | Minimal fixture falsely claims all of `BlockSelectionConfig`.                                 |
| `packages/core/type-tests/editor-configure-contracts.ts`      | 18, 60                  | Ordinary option/API fixtures should prove inference.                                          |
| `packages/core/type-tests/base-plugin-contracts.ts`           | 524                     | `UnifiedListUpdate` is a shadow output contract.                                              |
| `packages/core/type-tests/plate-editor-value-contracts.ts`    | 39, 58                  | Manual config/update contracts obscure the value-inference subject.                           |
| `packages/core/type-tests/plate-plugin-contracts.ts`          | 56, 106                 | Toolbar should infer; the explicit plugin proof can author API in its constructor.            |
| `packages/core/src/react/plugin/toPlatePlugin.spec.ts`        | 236, 293, 334, 403, 514 | Two output-extension shadows and three runtime fixtures gain nothing from explicit configs.   |
| `packages/core/src/react/plugin/createPlatePlugin.spec.ts`    | 44, 227, 230            | Root publication and portal separation should prove constructor inference.                    |
| `packages/core/src/internal/plugin/compilePlateModel.spec.ts` | 486                     | Runtime schema configuration should infer options while preserving its literal tuple locally. |
| `packages/core/src/internal/plugin/resolvePlugins.spec.tsx`   | 99, 118                 | Keep two dependent stages, but infer both outputs.                                            |
| `packages/core/src/lib/plugin/createBasePlugin.spec.ts`       | 246, 783                | Runtime schema/context fixtures should exercise inference.                                    |
| `packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts` | 14, 118, 152            | Schema/contextual configuration tests are stronger with inferred option contracts.            |
| `packages/core/src/lib/plugin/getEditorPlugin.spec.ts`        | 21, 59                  | Portal tests should infer the installed descriptor instead of restating its option contract.  |

### Keep 28 explicit-contract proof calls

| File                                                           | Lines                                            | Proof owned                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `packages/core/src/react/stores/plate/usePluginStore.spec.tsx` | 119                                              | Optional selector return contract that implementation presence alone cannot express.      |
| `packages/core/type-tests/plugin-schema-contracts.ts`          | 277, 301                                         | Explicit dependency reference and exact-empty options at erased boundaries.               |
| `packages/core/type-tests/base-plugin-contracts.ts`            | 601, 662, 702                                    | Optional option propagation, declared update context, declared shortcut command.          |
| `packages/core/type-tests/plate-plugin-contracts.ts`           | 29, 101, 116                                     | Exact declaration boundary, external plugin API contract, declared Plate update contract. |
| `packages/core/type-tests/plugin-composition-contracts.ts`     | 108, 148                                         | Extracted dependency factory and portable external contract.                              |
| `packages/core/src/react/plugin/toPlatePlugin.spec.ts`         | 190, 219, 232, 358, 363, 380, 399, 414, 469, 475 | Explicit conversion/external-wrapper overloads are the test subject.                      |
| `packages/core/src/react/plugin/createPlatePlugin.spec.ts`     | 198, 200                                         | Explicit foreign transaction `.extend<T>` context.                                        |
| `packages/core/src/lib/utils/pluginExtensionMerge.spec.ts`     | 44                                               | External root-API contract context.                                                       |
| `packages/core/src/lib/plugin/createBasePlugin.spec.ts`        | 424, 426                                         | Base explicit foreign transaction counterpart.                                            |
| `packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts`  | 348, 464                                         | Phantom shortcut contract and named full-config scenario.                                 |

These tests justify retaining Core's explicit portable-contract overload. They
do not justify using that overload for ordinary concrete plugins.

## Active plan debt

`docs/plans/2026-07-23-wordgard-full-architecture-audit.md:3907` contains
`BaseLinkPluginDefinition.extend<{ extension: ... }>` as a proposed shape. It
should use inferred extension output when that plan is refreshed. Generated
Wordgard artifacts are snapshots and should be regenerated by their owner, not
hand-edited.

## Facts, inference, and recommendation

### Facts

- Babel AST parsed 1,754/1,754 non-generated files under `packages/**/src`,
  with zero parse failures in the final scan.
- Package code contains 75 actual builder-generic calls: 21 production and 54
  tests/type tests.
- The production capability-ferry scan parsed 1,289 non-test package source
  files and found exactly the 12 rows above.
- `apps/www/src` plus current `content/**` contains 22 relevant calls.
- After a fresh current Core build, an isolated Media factory shadow passed TS7
  and `tsdown` declaration emit without its inner output generic. Full Media
  emit remains unavailable because live Media has not adopted Core's
  `initialState`/`store` hard cut.
- Core declares 14 constructor/adapter overloads plus 19
  `.extend`/`.configure` generic signatures. They are definitions, not usage
  debt.
- No package source file was edited by this audit.

### Inference

- Aggregate `PluginConfig` and `.extend<{ ... }>` contracts hide whether the
  implementation still infers its real output.
- Bare keys plus `<Config>` fabricate descriptor ownership.
- Some constructor generics survive because TypeScript cannot infer a nullable
  or absent state domain from default values. Replacing them with assertions
  would make the API worse.
- Core's explicit contract path remains useful for exported factories and
  compile-only proof, but it should be exceptional.

### Recommendation

1. Remove the nine production `.extend<T>` output contracts and the 12 package
   capability ferries first.
2. Add one checked field-level state-domain path shared by Base, Plate, and
   `toPlatePlugin`; do not introduce another builder verb.
3. Reshape the eleven production constructor/adapter calls and the eleven
   app/docs option-domain calls onto that path.
4. Clean the 26 ordinary test fixtures while retaining the 28 deliberate
   explicit-contract proofs.
5. Rebuild Core before package declaration emit. If inference fails, fix the
   owning Core generic; do not restore a shadow interface.

## Exclusions

- Ordinary domain/result narrowing such as `state.nodes.get<TElement>()`,
  `Map<K, V>`, React component generics, and generic Plite runtime owners.
- Constructor hooks such as `usePlateEditor<MyEditor>()`, where typed inputs
  create the returned editor. Context retrieval through `useEditor()` is not a
  type boundary and accepts no editor refinement.
- Generated registry JSON, templates, completed historical plans, and proof
  snapshots.
- Generic factory parameters that correlate real input and output, including
  `defineMediaPlugin<C>`.
