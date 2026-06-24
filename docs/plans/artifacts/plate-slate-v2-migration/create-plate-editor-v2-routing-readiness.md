# `createPlateEditor` v2 runtime routing readiness

Verdict:
Do not route public `createPlateEditor` / `withPlate` to `createPlateRuntimeEditor` yet.

Why:
The v2 runtime scaffold now proves plugin metadata, configuration, plugin API,
tx groups, provider/editable/content adapters, focus, initial-value transforms,
SlateReact memo cleanup, and the legacy React/history enhancers plus DOM
scroll/selection runtime bridge. Plate plugin node schema flags now install as
Slate v2 element specs, OverridePlugin break/delete/merge/normalize rules route
through runtime facades, NavigationFeedback API/transforms route through the v2
runtime without fake legacy editor APIs, ParserPlugin insert-data behavior
lands in v2 fragment transactions, InputRulesPlugin insert transforms route
through executable v2 runtime rule buckets, LengthPlugin maxLength behavior
routes through v2 operation middleware, AffinityPlugin selection/mark affinity
behavior routes through v2 runtime transforms, and ChunkingPlugin installs its
runtime chunk-size hook. The default Plate core plugin stack still contains
global editor/runtime contracts that the scaffold deliberately rejects.

Current safe scaffold:
- `createPlateRuntimeEditor` creates a Slate v2 React editor through
  `createReactEditor`.
- It installs Plate identity/meta/plugin caches without mutating Slate v2
  `editor.api`.
- It supports plugin metadata, option stores, dependency order, overrides,
  `configure()`, functional `.extend(...)`, nested `configurePlugin(...)`,
  plugin-specific `extendApi(...)`, `extendTx(...)`, tx-backed
  `extendTransforms(...)`, focus, runtime `init`, current
  `transformInitialValue`, SlateReact `_memo` cleanup, and Slate v2 element
  specs for Plate plugin node flags.
- It supports the OverridePlugin schema, break-rule, delete-rule, merge-rule,
  and normalize-rule wrappers on the runtime route.
- It supports NavigationFeedback active-target API, flash/clear/navigate
  transforms, and path-ref movement on the runtime route.
- It supports ParserPlugin data insertion on the runtime route: parser
  selection, injected parser hooks, fallback insert-data delegation, and final
  `tx.fragment.insert(...)`.
- It supports InputRulesPlugin insertText/insertBreak/insertData behavior on
  the runtime route with resolved rule buckets and Slate v2 state-derived
  context helpers.
- It supports LengthPlugin maxLength behavior on the runtime route by applying
  the original operation, reading full-document text length through Slate v2
  state, and trimming overflow with `tx.text.delete(...)`.
- It supports AffinityPlugin deleteBackward/insertText/move behavior on the
  runtime route, backed by Slate v2 `tx.marks.set(...)` for exact collapsed
  insertion-mark semantics.
- It supports ChunkingPlugin `withChunking` behavior on the runtime route by
  installing `editor.getChunkSize`; configured queries stay in control, and the
  built-in current-editor-root query maps to the v2 runtime editor.
- It supports NodeIdPlugin `withNodeId` insert/split ID policy on the runtime
  route through Slate v2 operation middleware. Duplicate inserted IDs are
  regenerated, unique inserted IDs are preserved, missing inserted IDs are
  generated, `_id` override values are cleaned, and split nodes receive fresh
  IDs when reuse would collide.
- It intentionally does not support old `normalizeInitialValue`.
- It supports non-transform global `extendEditorApi(...)` by installing the
  returned API object through a Slate v2 extension.
- It supports the DOM plugin's runtime route specifically: `withScrolling` as a
  Plate transform facade, `scrollIntoView` through Slate v2 extension API, and
  auto-scroll / previous-selection bookkeeping through operation middleware.
- It exposes a narrow `createPlateEditor({ runtime: 'slate-v2' })` opt-in that
  returns a branded `PlateRuntimeEditor`, composes core + React plugin lists, and
  rejects unsupported root-level legacy Plate options instead of ignoring them.
- The opt-in route supports synchronous root initialization options:
  `transformInitialValue`, `autoSelect`, `shouldNormalizeEditor`, and `onReady`.
  It still rejects async/string values, `skipInitialization`, `rootPlugin`, and
  other broad legacy-only root config.
- The opt-in route supports root wrapper `render` metadata for `aboveSlate`,
  `aboveEditable`, `beforeEditable`, and `afterEditable`.
- The opt-in route supports root node wrapper `render` metadata for
  `aboveNodes`, `belowNodes`, and `belowRootNodes`.
- The opt-in route supports root `components` overrides, and the runtime
  editable adapter renders plugin-owned elements through Slate v2
  `Editable.renderElement`. It supports `render.node`, `node.component`, and
  `render.as` with real v2 path context, without a fake legacy `PlateElement`
  fallback.
- The opt-in route supports the narrow root handler subset, and the runtime
  Slate adapter pipes provider `onChange` through plugin handlers before the
  external Slate callback.
- It exposes a narrow `usePlateEditor({ runtime: 'slate-v2' })` opt-in that
  calls the v2 runtime route without injecting legacy-only `onReady`, preserves
  inferred plugin tx groups from `createPlatePlugin(...).extendTx(...)` through
  public `platejs/react` imports, and keeps call sites free of `any` update
  casts.

Blocking default Plate plugins:
| Owner | Current contract | Why it blocks public routing | Next packet |
|-------|------------------|------------------------------|-------------|
| none for default insert/split/runtime routes | N/A | Default plugin runtime blockers are closed enough for app/playground proof. Manual legacy batch/history commands remain separate command-surface owners. | Prove the migrated package state in `apps/www` playground routes. |

Playground proof:
- `pnpm --filter www typecheck` passed after loop 307.
- `pnpm --filter www exec playwright test --config playwright.slate.config.ts --project=chromium tests/slate-browser/playground.spec.ts` passed; `/blocks/playground` edit, DOM/model text, undo, and redo are green through the current Plate browser proof adapter.

Closed blockers:
| Owner | Result | Proof |
|-------|--------|-------|
| `DebugPlugin`-style global `extendEditorApi` | Supported by `createPlateRuntimeEditor` through Slate v2 extension `api`; global transforms and overrides remain blocked. | `createPlateRuntimeEditor.spec.ts` proves `editor.api.debug.label()` and plugin API access without own-property mutation. |
| `HistoryPlugin` | Legacy `withHistory` is stripped from the v2 runtime route; Slate v2 history remains installed by `createReactEditor` / `history()`. The current legacy public runtime still owns `withPlateHistory` until `createPlateEditor` routes through v2. | `createPlateRuntimeEditor.spec.ts` proves the installed plugin no longer has `extendEditor`, `tx.text.insert(...)` creates one undo batch, and `tx.history.undo()` restores the document. |
| `ReactPlugin` legacy enhancer | Legacy `withReact` is stripped from the v2 runtime route; Slate v2 React remains installed by `createReactEditor` / `react()`. | `createPlateRuntimeEditor.spec.ts` proves `ReactPlugin` no longer fails with `uses extendEditor`, then the DOM route proof below proves the inherited DOM behavior now mounts. |
| `DOMPlugin` runtime route | The DOM route no longer relies on legacy `overrideEditor(apply)` inside `createPlateRuntimeEditor`; it installs a Slate v2 operation middleware extension for scroll operation targeting and `set_selection` bookkeeping, exposes `scrollIntoView` as extension API, and keeps `withScrolling` as the Plate transform facade. | `createPlateRuntimeEditor.spec.ts` proves `ReactPlugin` mounts with DOM installed, `isScrolling` / `scrollIntoView` exist, `withScrolling` toggles during an inferred `editor.update((tx) => ...)`, and `set_selection` records `prevSelection` while clearing `currentKeyboardEvent`; core lint/typecheck/test/build and migration scanners pass. |
| `SlateReactExtensionPlugin` keyboard/reset route | Keydown handlers pipe through `PlateRuntimeEditable`; reset uses a v2 root-value replacement, clears selection, and restores focus through the React API bridge when focused. The old inherited `SlateExtensionPlugin` transform/override metadata is skipped deliberately for this scaffold instead of treated as supported. | `createPlateRuntimeEditor.spec.ts` proves `ArrowUp` keydown reaches the root movement command and records `currentKeyboardEvent`, and `editor.tf.reset()` resets to a default paragraph through inferred `editor.update((tx) => ...)`; core lint/typecheck/test/build and migration scanners pass. |
| `SlateReactExtensionPlugin` memo cleanup route | The old `overrideEditor(normalizeNode)` `_memo` cleanup now runs as a Slate v2 `normalizers.node` extension. It removes `_memo` through `tx.nodes.unset(...)` and stops that normalization pass, without exposing a legacy `normalizeNode` facade. | `createPlateRuntimeEditor.spec.ts` proves forced normalization removes `_memo`; core test/typecheck/lint/build and migration scanners pass. |
| `OverridePlugin` schema element-spec route | Plate plugin node flags now register as Slate v2 element specs. `isInline`, `isVoid`, `isMarkableVoid`, and `isSelectable` flow through Slate v2 schema behavior instead of a legacy `editor.api` override. | `createPlateRuntimeEditor.spec.ts` proves `state.schema.isInline`, `isVoid`, `markableVoid`, and `isSelectable` reflect plugin node flags; core test/typecheck/lint/build and migration scanners pass. |
| `OverridePlugin` break rules route | Runtime `editor.tf.insertBreak()` now applies Plate break rules through Slate v2 transactions. Standard Enter uses Slate v2 `tx.break.insert`, Plate `lineBreak` inserts a newline through the Plate facade, and empty reset / emptyLineEnd deleteExit / splitReset continuations are covered without a legacy editor facade. | `createPlateRuntimeEditor.spec.ts` proves default break insertion, empty reset, lineBreak newline insertion, emptyLineEnd deleteExit, and splitReset; core test/typecheck/lint/build and migration scanners pass. |
| `OverridePlugin` delete rules route | Runtime `editor.tf.deleteBackward()`, `deleteForward()`, and `deleteFragment()` now apply Plate delete rules through Slate v2 transactions. Start reset, empty reset, matched lift, first-block reset at document start, normal delete fallback, and full-document fragment reset are covered without a legacy editor facade. | `createPlateRuntimeEditor.spec.ts` proves start reset, empty reset, matched lift, document-start first-block reset, normal backward delete fallback, and full-document fragment reset; core test/typecheck/lint/build and migration scanners pass. |
| `OverridePlugin` merge rules route | Runtime merge cleanup now applies Plate `merge.removeEmpty` policy through Slate v2 query and operation middleware. Empty paragraph-like targets can be removed, custom empty targets are preserved by default, and match overrides can veto removal while preserving target props. | `createPlateRuntimeEditor.spec.ts` proves remove-empty, default keep, and match-veto behavior; the first focused proof caught the missing prop-preservation path, and final core test/typecheck/lint/build plus migration scanners pass. |
| `OverridePlugin` normalize rules route | Runtime normalize cleanup now applies Plate `normalize.removeEmpty` policy through a Slate v2 node normalizer. Empty elements are removed only when the effective plugin or match override rule says `removeEmpty: true`; match overrides can force or veto removal. | `createPlateRuntimeEditor.spec.ts` proves remove-empty, default keep, match-force, and match-veto behavior; core test/typecheck/lint/build and migration scanners pass. |
| `NavigationFeedbackPlugin` route | Runtime NavigationFeedback consumes the plugin API/transform metadata and installs a v2-native active-target API plus flash/clear/navigate transforms. It uses local option state, local path refs transformed by commit operations, and runtime `tf.select`; it does not add legacy `editor.api.node` to the v2 editor. | `createPlateRuntimeEditor.spec.ts` proves active-target setup, path movement after insertion, `isTarget`, `navigate` selection with focus/scroll disabled, and clear; core test/typecheck/lint/build plus migration scanners pass. |
| `ParserPlugin` route | Runtime ParserPlugin consumes the legacy insert-data override metadata and installs a v2-native parser route. Parser plugin selection, injected parser query/data/fragment/preInsert hooks, fallback insert-data delegation, and final insertion use the runtime facade; accepted fragments land through `tx.fragment.insert(...)`, not legacy `editor.tf.insertFragment`. | `createPlateRuntimeEditor.spec.ts` proves plain-text parser selection, injected `transformData`, injected `transformFragment`, injected `preInsert`, and resulting v2 root value; core test/typecheck/lint/build plus migration scanners pass. |
| `InputRulesPlugin` route | Runtime InputRulesPlugin consumes the legacy insert transform override metadata and installs v2-native insertText, insertBreak, and insertData wrappers. Runtime rule metadata is fully resolved into executable target/trigger buckets, and rule context helpers read selection, block text, and adjacent characters through Slate v2 state APIs. | `createPlateRuntimeEditor.spec.ts` proves metadata trigger buckets plus insertText, insertBreak, and insertData rules against the v2 root value; core test/typecheck/lint/build plus migration scanners pass. |
| `LengthPlugin` route | Runtime LengthPlugin consumes the legacy apply override metadata and installs a v2 operation middleware route. It applies the operation first, reads the full document string length through Slate v2 state, and trims overflow with `tx.text.delete({ distance, reverse: true, unit: 'character' })` instead of adding a legacy `editor.tf.apply` facade. | `createPlateRuntimeEditor.spec.ts` proves maxLength trimming for typed text insertion and fragment paste; core test/typecheck/lint/build plus migration scanners pass. |
| `AffinityPlugin` route | Runtime AffinityPlugin consumes the legacy deleteBackward/insertText/move override metadata and installs v2-native wrappers over runtime transforms. Slate v2 `tx.marks.set(...)` owns exact pending-mark replacement, so the runtime route does not mutate `editor.marks` or add a fake legacy selection facade. | `state-tx-public-api-contract.ts` proves `tx.marks.set(...)` insertion semantics, and `createPlateRuntimeEditor.spec.ts` proves Affinity outward insertion, directional delete, and directional move on the v2 runtime route; Slate/core typecheck, builds, and migration scanners pass. |
| `ChunkingPlugin` route | Runtime Chunking consumes the legacy `withChunking` override metadata and installs `editor.getChunkSize` directly on the v2 runtime editor. The built-in root query maps to the runtime editor object; custom queries are preserved instead of being bypassed. | `createPlateRuntimeEditor.spec.ts` proves default chunk size on the runtime editor and configured query/chunk-size behavior; core lint/typecheck/test/build and migration scanners pass. |
| `NodeIdPlugin` insert/split route | Runtime NodeId consumes the legacy `withNodeId` override metadata and installs a v2 operation middleware route for `insert_node` and `split_node`. Initial-value ID assignment remains pure `transformInitialValue` behavior through `initialValueIds`; the stale `nodeId.normalizeInitialValue` alias is cut from code/latest docs. Manual `tf.nodeId.normalize()` remains a separate legacy batch/history command owner. | `createPlateRuntimeEditor.spec.ts` proves duplicate inserted IDs are regenerated, unique/missing inserted IDs are handled, override IDs are cleaned, and split nodes get fresh IDs; `NodeIdPlugin.spec.tsx` no longer carries alias tests; core test/typecheck/lint/build, docs parity, migration scanner, command scanner, and focused cast audit pass. |
| `createPlateEditor` opt-in runtime route | `createPlateEditor({ runtime: 'slate-v2' })` routes through `createPlateRuntimeEditor`, maps array/null `value` to Slate v2 `initialValue`, preserves legacy mode as the default, returns `PlateRuntimeEditor` for the opt-in overload, and rejects unsupported root-level legacy Plate options. | `createPlateRuntimeEditor.spec.ts` proves the opt-in returns a branded v2 runtime editor, installs NodeId/DOM/SlateExtension plugins, preserves NodeId insert behavior, and rejects `rootPlugin`; core test/typecheck/lint/build plus migration scanners pass. |
| `createPlateEditor` public inference route | `createPlateEditor({ plugins, runtime: 'slate-v2', value })` infers plugin tx groups from public `platejs/react` imports without explicit generic arguments. | `apps/www/src/__tests__/package-integration/core-runtime/usePlateEditor-runtime.spec.tsx` proves public `createPlateEditor` imports infer `tx.txPlugin.replace()` while rejecting missing command access; `pnpm --filter www typecheck` and the app integration test pass. |
| `usePlateEditor` opt-in runtime route | `usePlateEditor({ runtime: 'slate-v2' })` routes through `createPlateEditor` without adding legacy `onReady`, returns a `PlateRuntimeEditor`, and preserves public plugin tx inference from `createPlatePlugin(...).extendTx(...)`. | `createPlateRuntimeEditor.spec.ts` proves the core hook route updates the v2 root, and `apps/www/src/__tests__/package-integration/core-runtime/usePlateEditor-runtime.spec.tsx` proves public `platejs/react` imports infer `tx.txPlugin.replace()` from plain `usePlateEditor({ plugins, runtime, value })` while rejecting missing command access; core/app typecheck, app integration test, builds, migration scanners, anti-cast audit, and Chromium playground proof pass. |
| `createPlateEditor` sync root initialization options | The explicit v2 route accepts root `transformInitialValue`, `autoSelect`, `shouldNormalizeEditor`, and sync `onReady` without using legacy root plugin shims. | `createPlateRuntimeEditor.spec.ts` proves the public v2 factory applies root `transformInitialValue`, sets end selection, runs forced normalization, and calls `onReady` with the final v2 root value; core typecheck/test/lint/build, `platejs` build, `www` typecheck, migration scanners, and anti-cast audit pass. |
| `createPlateEditor` root render wrappers | The explicit v2 route accepts root wrapper `render` metadata through the synthetic runtime root plugin. | `createPlateRuntimeEditor.spec.ts` mounts the public v2 factory through `PlateRuntimeContent` and proves `aboveSlate`, `aboveEditable`, `beforeEditable`, and `afterEditable` wrappers render; core typecheck/test/lint/build, `platejs` build, `www` typecheck, migration scanners, and anti-cast audit pass. |
| `createPlateEditor` node render/components adapter | The explicit v2 route accepts root `components`, and `PlateRuntimeEditable` renders plugin-owned elements through Slate v2 `Editable.renderElement`. The adapter supports `render.node`, `node.component`, and `render.as` with real Slate v2 element path context and no fake legacy `PlateElement` fallback. | `createPlateRuntimeEditor.spec.ts` proves plugin element component rendering and public root component overrides through `PlateRuntimeContent`; core typecheck/test/lint/build, `platejs` build, `www` typecheck, migration scanners, and anti-cast audit pass. |
| `createPlateEditor` root handlers | The explicit v2 route accepts root `handlers` for `onChange`, `onKeyDown`, `onNodeChange`, and `onTextChange` through the synthetic runtime root plugin. Runtime `onChange` handlers run before the external Slate provider callback and can stop propagation by returning `true`. | `createPlateRuntimeEditor.spec.ts` proves runtime plugin `onChange` dispatch suppresses the external callback and public root `handlers.onChange` dispatches after `editor.update((tx) => ...)`; core typecheck/test/lint/build, `platejs` build, `www` typecheck, migration scanners, and anti-cast audit pass. |
| `createPlateEditor` root node wrappers | The explicit v2 route accepts root `aboveNodes`, `belowNodes`, and `belowRootNodes` metadata through the synthetic runtime root plugin. Runtime element rendering applies below-node wrappers inside the element, below-root nodes after children, and above-node wrappers around the rendered element. | `createPlateRuntimeEditor.spec.ts` proves public root node wrappers render with v2 path and target plugin context; core typecheck/test/lint/build, `platejs` build, `www` typecheck, migration scanners, and anti-cast audit pass. |
| `SlateExtensionPlugin` callback/apply route | The legacy `apply` wrapper callback pipeline now runs as Slate v2 operation middleware. It captures previous/current node state for node operations and previous/current text for text operations, then dispatches plugin handlers and configured callbacks. | `createPlateRuntimeEditor.spec.ts` proves configured `onNodeChange` fires for `tx.nodes.set(...)` and configured `onTextChange` fires for `tx.text.insert(...)`; internal `root: "main"` is normalized before public primary-root reads; core lint/typecheck/test/build and migration scanners pass. |
| `SlateExtensionPlugin` setValue route | Runtime `editor.tf.setValue(value)` replaces the v2 root through `tx.value.replace`; empty values use the runtime default paragraph, and string HTML values require an installed HTML deserialize API. | `createPlateRuntimeEditor.spec.ts` proves document replacement and empty-value reset; core lint/typecheck/test/build and migration scanners pass. |
| `SlateExtensionPlugin` resetBlock route | Runtime `editor.tf.resetBlock({ at })` resolves an explicit or selection-derived element path, preserves the id key, unsets extra props, and sets the paragraph type through v2 node transactions. | `createPlateRuntimeEditor.spec.ts` proves explicit-path and selection-derived reset behavior; core lint/typecheck/test/build and migration scanners pass. |
| `SlateExtensionPlugin` liftBlock route | Runtime `editor.tf.liftBlock({ at, match })` resolves an explicit or selection-derived block, verifies a matching ancestor, and unwraps through a typed Slate v2 node transaction. | `createPlateRuntimeEditor.spec.ts` proves a blockquote wrapper unwraps to its paragraph through inferred `editor.update((tx) => ...)`; core lint/typecheck/test/build and migration scanners pass. |
| `SlateExtensionPlugin` insertExitBreak route | Runtime `editor.tf.insertExitBreak({ at, match, reverse })` inserts a configured default paragraph beside the current block or nearest ancestor that accepts normal siblings. | `createPlateRuntimeEditor.spec.ts` proves normal insertion, reverse insertion, strict-sibling ancestor targeting, value output, and cursor placement; core lint/typecheck/test/build and migration scanners pass. |
| `SlateExtensionPlugin` init route | Runtime `editor.tf.init(...)` loads sync/async values through v2 value replacement, keeps history skipped, runs runtime `transformInitialValue`, preserves selection through transform passes, normalizes only when requested, and calls `onReady` after the final value is readable. | `createPlateRuntimeEditor.spec.ts` proves sync value + transformInitialValue + auto-select + onReady and async value + explicit selection + async onReady; core lint/typecheck/test/build and migration scanners pass. |

Recommended next order:
1. Hard runtime/default-route checkpoint: decide whether `createPlateEditor`
   default routing can flip to `createPlateRuntimeEditor`.
2. React provider / browser-handle unification packet: decide when Plate routes
   expose the `@platejs/browser` handle instead of only the current
   `@platejs/playwright` adapter.

Stop condition:
If a packet needs to preserve old `normalizeInitialValue`, legacy `withReact`,
legacy `withHistory`, or a fake `editor.children` / `editor.selection` facade
on the v2 editor, stop and route it back to the runtime architecture plan.
