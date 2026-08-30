# Material architecture dossiers

These are planning targets, not implementation. Public shapes are blank-slate endpoints; current compatibility does not constrain them.

## Honest plugin and persisted identity (`PLATE-PLUGIN-IDENTITY`)

<a id="honest-plugin-and-persisted-identity"></a>

- Rows: `PLATE-PLUGIN-IDENTITY`
- Priority: P0
- Owner: `best-api repair` -> `plate-plan`; dependent persistence packets in History and Yjs
- Decision: `name` owns installation and capabilities; `type` exists only on AST-owning plugins and owns persisted identity.


- Sources: `packages/core/src/lib/plugin/defineBasePlugin.ts:479-509`, `packages/core/src/lib/plugin/BasePlugin.ts:180-212`, `packages/core/src/lib/plugin/BasePlugin.ts:1200-1261`, `packages/core/src/lib/plugin/PluginDefinition.ts:55-90`, `packages/utils/src/lib/plate-keys.ts:1-139`, `packages/utils/src/lib/plate-keys.spec.ts:3-53`, `content/docs/(guides)/editor.mdx:53-84`, `content/docs/plite/libraries/plite-yjs.mdx:62-76`, `../wordgard/src/types/schema.ts:67-86`, `../wordgard/src/types/schema.ts:133-171`, `../wordgard/src/doc/schema.ts:189-240`, `../wordgard/src/doc/schema.ts:280-319`, `../wordgard/src/doc/node.ts:88-94`

### Current shape

```ts
import { defineBasePlugin, definePlatePlugin } from 'platejs';

// Core currently invents type: name for every descriptor.
const FixedToolbarPlugin = definePlatePlugin('fixedToolbar', {
  render: { beforeEditable: FixedToolbar },
});
FixedToolbarPlugin.type; // "fixedToolbar", despite owning no AST node

const ParagraphPlugin = defineBasePlugin('paragraph', {
  type: 'p',
  schema: { element: schema.element.textBlock() },
});

const editor = createPlateEditor({
  initialValue: persisted.document,
  plugins: EditorKit,
});
```

### Final shape

```ts
import { migratePlateAstIdentities } from 'platejs/migrations';

export const FixedToolbarPlugin = definePlatePlugin('fixedToolbar', {
  render: { beforeEditable: FixedToolbar },
});
// FixedToolbarPlugin.type -> TypeScript error

export const BaseParagraphPlugin = defineBasePlugin('paragraph', {
  type: 'paragraph',
  schema: { element: schema.element.textBlock() },
});

const schemaIdentity = { id: 'acme-document', version: 2 } as const;
const initialValue = migratePlateAstIdentities(persisted.document, {
  types: {
    p: 'paragraph',
    a: 'link',
    img: 'image',
    hr: 'horizontalRule',
    tr: 'tableRow',
    td: 'tableCell',
    th: 'tableCellHeader',
    li: 'listItem',
    lic: 'listItemContent',
    code_block: 'codeBlock',
    code_drawing: 'codeDrawing',
    code_line: 'codeLine',
    code_syntax: 'codeSyntax',
    column_group: 'columnGroup',
    emoji_input: 'emojiInput',
    inline_equation: 'inlineEquation',
    media_embed: 'mediaEmbed',
    mention_input: 'mentionInput',
    search_highlight: 'searchHighlight',
    slash_input: 'slashInput',
    action_item: 'todoList',
    ol: 'numberedList',
    ul: 'bulletedList',
  },
  properties: { align: 'textAlign' },
});

const editor = createPlateEditor({
  initialValue,
  plugins: EditorKit,
  schemaIdentity,
});

defineBasePlugin('alignment', {
  targetPlugins: [BaseParagraphPlugin, optionalRuntimePluginName],
});
```

### Delete

- `type: name` in `defineBasePluginRuntime` and every universal `type: string` descriptor/portal assertion.
- `InferPluginDocumentType<C> = C["name"]`, fake types on behavior plugins, and any reverse name-from-type lookup.
- The 23 legacy first-party type strings and persisted `align` property key after the one-shot host migration.
- `STYLE_KEYS`, `KEYS` spreading persisted identities, runtime aliases, compatibility maps, and dual old/new schemas.
- Any migration plugin installed in the editor: migration completes before editor construction and leaves no runtime machinery.

### Adopt

- `packages/core`: optional AST-owner `type`, exact descriptor portals, erased `type?: string`, configuration, target resolution, declaration output.
- `packages/utils`: semantic lower-camel `NODES`, independent plugin-name `KEYS`, and the exact 24-entry migration fixture.
- `schemaIdentity` is part of persisted meaning: one type string resolves only inside its schema/version, and runtime ownership always comes from the compiled schema rather than reverse `NODES` lookup.
- Every first-party AST plugin schema/codec/render definition; behavior-only plugins omit `type` completely.
- Package injections use descriptors; copied registry injections use plugin-name strings only when importing the descriptor would couple the registry item.
- Primary and named persisted roots, element types, persisted property/mark keys, HTML/Markdown codecs, static RSC, examples, docs, and changesets.
- Serialized History is invalidated or version-migrated; offline Yjs documents move to a new schema-versioned room before any peer connects.

### Dependency order

1. Make `type` optional only for behavior descriptors while keeping AST-owner schemas and configured types exact in Core generics and portals.
2. Split `KEYS` from `NODES`; land the final semantic persisted vocabulary without aliases.
3. Implement the pure, JSON-safe 24-entry migration with primary/named-root traversal, collision diagnostics, and unknown-key preservation.
4. Migrate package descriptors, codecs, injections, registry strings, persisted fixtures, docs, and examples.
5. Add History invalidation/version migration and offline Yjs room migration at the schema-identity boundary.
6. Remove every compatibility path only after packed declarations and persistence proofs pass.

### Proof gates

- Compile-only: AST descriptors preserve literal `.type`; behavior descriptors reject `.type`; dynamic `editor.plugin(name).type` is `string | undefined`.
- Migration table is exactly 23 type entries plus `align -> textAlign`; no generic snake-case conversion exists.
- Migration covers primary and every named root, property/mark keys, and nested elements; unknown custom identities are byte-for-byte preserved.
- Old/new collisions throw with root and node path; migration output contains no legacy first-party identity.
- Configured AST types, descriptor/string target plugins, injection, schema predicates, HTML, Markdown, static RSC, and live React retain exact behavior.
- Two schema identities may intentionally resolve the same persisted type string to different runtime contracts; each compiled schema rejects ambiguous same-name owners and round-trips through its own map.
- `schemaIdentity.version` changes; stale History fails or migrates explicitly; mixed-version Yjs peers fail closed and the new offline room converges.
- Packed package types expose no universal behavior-plugin `type`, alias map, or migration plugin; docs show only pre-construction migration.

## Honest lifecycle phases (`LOCAL-LIFECYCLE-PHASE`)

<a id="honest-lifecycle-phases"></a>

- Rows: `LOCAL-LIFECYCLE-PHASE`
- Priority: P0
- Owner: `plite-plan` in the extension publication owner
- Decision: Activation is candidate-scoped and rollbackable; only cleanup and `afterPublish` are post-commit isolated observers.


- Sources: `packages/plite/src/core/editor-extension.ts:1150-1244`, `packages/plite/src/core/editor-extension.ts:2002-2023`, `packages/plite/src/core/editor-extension.ts:2082-2163`, `packages/plite/src/interfaces/editor.ts:1902-1939`, `packages/plite/src/interfaces/editor.ts:2370-2401`, `packages/plite/test/extension-configuration.test.ts:2141-2231`, `packages/plite/test/extension-configuration.test.ts:2417-2659`, `../wordgard/src/editor/editor.ts:240-243`

### Current shape

```ts
const BrokenActivation = defineExtension('brokenActivation', {
  activate() {
    throw new Error('cannot start');
  },
});

const cleanup = editor.install(BrokenActivation);
// Current behavior: descriptor is published, error is only sent to the sink.
editor.extension(BrokenActivation); // installed
cleanup();
```

### Final shape

```ts
const BrokenActivation = defineExtension('brokenActivation', {
  activate({ editor }) {
    editor.extension(RequiredDependency).api.readCandidate();
    // editor.update(() => {}) -> throws: candidate lifecycle is read-only
    throw new Error('cannot start');
  },
});

try {
  editor.install(BrokenActivation);
} catch (error) {
  // EditorExtensionPublicationError {
  //   extensionName: 'brokenActivation',
  //   phase: 'activate',
  //   cause,
  //   rollbackErrors,
  // }
}

// The previous registry, APIs, fields, document, selection, anchors, and
// version remain exact; BrokenActivation was never observable as installed.
```

### Delete

- Activation from post-publication `finalize()` and its catch-and-report path that leaves a failed descriptor installed.
- Tests that bless nested-write or async activation errors while the failed extension remains in the compiled registry.
- Any lifecycle state where registry/API/fields are new while document, selection, anchors, or activation records are old.
- Aggregate-error-only activation semantics that lose `extensionName`, phase, primary cause, or ordered rollback failures.

### Adopt

- `prepareScopedEditorExtensionPublication`: compiled candidate, provisional fields/APIs, activation records, commit, rollback, and finalization.
- `EditorExtensionActivationContext`: candidate-scoped read/portal access, `afterPublish`, cleanup registration, signal, root, and schema.
- `editor.install`, extension-slot reconfiguration, dependency replacement/removal, schema publication, and Plate plugin publication.
- Lifecycle error types/sink, extension configuration tests, History/Yjs activation owners, docs, and changesets.

### Dependency order

1. Create a candidate-scoped read-only editor whose read/API/exact descriptor portals resolve the staged dependency graph and whose update entrypoints throw.
2. Activate new records dependencies-first before registry publication; retain cleanup registrations in provisional activation records.
3. On activation failure, run new cleanups in reverse and restore every staged/published facet while preserving old activations.
4. Publish registry, APIs, fields, document, selection, anchors, and version atomically only after all candidate activations succeed.
5. After commit, deactivate old records dependents-first, then run new `afterPublish` callbacks dependencies-first through the isolated error sink.
6. Expose and document `EditorExtensionPublicationError`; delete tests and workarounds for partially installed activation failures.

### Proof gates

- Activation can read candidate facets/APIs/exact descriptor portals and cannot start any nested write.
- A thrown or thenable activation restores registry identity, root/named documents, APIs, fields, selection, anchors, schema/version, and old activation records exactly.
- New cleanup order is reverse activation; dependency activation is dependencies-first; old cleanup is dependents-first; `afterPublish` is dependencies-first.
- `EditorExtensionPublicationError` preserves extension name, `activate` phase, cause, and ordered rollback errors without hiding the first failure.
- Cleanup and `afterPublish` failures report once, continue later observers, never roll back committed publication, and never make the committed update throw.
- Install, remove, replace, transitive dependency, schema reconfiguration, History, Yjs, and Plate publication tests all exercise the same phase law.

## Grammar-owned defaults (`LOCAL-SCHEMA-DEFAULT-SIDECHANNEL`)

<a id="grammar-owned-defaults"></a>

- Rows: `LOCAL-SCHEMA-DEFAULT-SIDECHANNEL`
- Priority: P1
- Owner: `best-api` -> `plite-plan`; Plate consumes the compiled result
- Decision: `SchemaContent.default` is the only authored default; the schema compiler plans it and runtime schema APIs execute it.


- Sources: `packages/plite/src/interfaces/schema.ts:195-218`, `packages/plite/src/interfaces/editor.ts:943-951`, `packages/plite/src/interfaces/editor.ts:1349-1362`, `packages/plite/src/core/editor-schema.ts:85-101`, `packages/plite/src/core/editor-schema.ts:1345-1383`, `packages/plite/src/core/editor-commands.ts:331-355`, `packages/core/src/lib/editor/withPlite.ts:111-149`, `packages/core/src/lib/editor/withPlite.ts:194-213`, `packages/plite/test/schema-contract.ts:238-251`

### Current shape

```ts
const editor = createEditor({
  defaultBlockType: 'paragraph',
});

// A Core WeakMap defaults to "paragraph" and Plate rebuilds root grammar from it.
```

### Final shape

```ts
const ArticleSchema = defineEditorSchema('schema:article', {
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
});

const editor = createEditor({ extensions: [ArticleSchema] });
editor.read.schema.createDefaultRootChild();
editor.read.schema.create('paragraph');
```

### Delete

- `CreateEditorOptions.defaultBlockType` and the `EDITOR_DEFAULT_BLOCK_TYPE` WeakMap/getter/setter.
- Plate root-schema reconstruction from `getEditorDefaultBlockType(editor)` and the implicit `paragraph` fallback.
- Manual default nodes in reset/split/empty/void code paths that bypass compiled content programs.
- Any proposed second public `createDefaultChild` API; nested creation remains `schema.create(type)`.

### Adopt

- Schema declaration/compiler default plans for complete primary roots, named roots, and element-owned nested content.
- `state.schema.createDefaultRootChild(root?)` for root creation and `state.schema.create(type)` for nested canonical elements.
- Editor initialization, replace-empty, reset, split, delete-last-block, void insertion, slice fitting, and external import.
- Plate schema compilation and initial-value fallback, schema docs, History schema resets, and Yjs schema identity.

### Dependency order

1. Audit every runtime default-node construction and map it to a root or parent compiled content program.
2. Make compiler diagnostics reject ambiguous, missing, cyclic, or invalid required defaults with owner/path evidence.
3. Route root creation through `createDefaultRootChild` and nested creation through `schema.create(type)`.
4. Delete `defaultBlockType`, its WeakMap, Plate bridge, and manual fallback nodes.
5. Migrate docs/examples and prove schema reconfiguration, History, and Yjs against the grammar-owned identity.

### Proof gates

- Primary, named, nested, and element-owned defaults create the exact canonical structure and required properties.
- Ambiguous/defaultless required content, cycles, unknown types, and invalid default properties fail with the owning root/element path.
- Optional empty content remains empty; schema-less editors keep their explicitly documented permissive behavior without an invented paragraph.
- Initialization, reset, split, deletion, void insertion, paste/import fitting, and reconfiguration call the same compiled default plan.
- History and Yjs schema changes never resurrect the removed side channel; browser empty-editor behavior remains exact.

## History idle boundary (`LOCAL-HISTORY-IDLE-GROUP`)

<a id="history-idle-boundary"></a>

- Rows: `LOCAL-HISTORY-IDLE-GROUP`
- Priority: P1
- Owner: `plite-plan` in `packages/plite-history`
- Decision: Automatic native batches merge only when structurally compatible and within a monotonic idle window; explicit merge remains authoritative.


- Sources: `packages/plite-history/src/history-extension.ts:88-143`, `packages/plite-history/src/history-extension.ts:530-627`, `packages/plite-history/src/history-merge-policy.ts:283-357`, `../wordgard/src/history/history.ts:295-333`

### Current shape

```ts
const History = history({ maxDepth: 100 });

// Structurally adjacent native text/property edits keep merging without an
// idle-time boundary.
```

### Final shape

```ts
const History = history({
  maxDepth: 100,
  newBatchDelay: 500,
});

editor.update({ history: 'merge' }, (tx) => {
  // Explicit merge ignores the idle boundary but still obeys root safety.
});

editor.update({ history: 'new-batch' }, (tx) => {
  // Explicit split clears the automatic temporal group.
});
```

### Delete

- Unbounded automatic native merging based only on structural adjacency.
- Any proposal to put wall-clock time on Core transactions or persist timestamps in History batches.
- Temporal-group state surviving remote commits, undo/redo, restore, skip, explicit new-batch, or schema reset.
- Sleep-based timing tests.

### Adopt

- `HistoryOptions` validation and the History extension factory.
- Automatic merge branch for native text/property batches and private monotonic last-group time.
- Explicit merge/new-batch/skip, undo/redo, restore, remote mapping, schema activation/reset, and persisted History codecs.
- History docs, tests, Plate defaults, and browser native/composition scenarios.

### Dependency order

1. Add validated `newBatchDelay` and an injectable monotonic clock to the History owner, not Core transaction state.
2. Gate only automatic native merges with both structural compatibility and elapsed time `<= newBatchDelay`.
3. Make explicit merge override elapsed time and make explicit new-batch/push split deterministically.
4. Clear private temporal state at every remote, navigation, restore, skip, and schema boundary.
5. Verify persistence excludes time, then document the option and adopt the default.

### Proof gates

- Fake monotonic clock proves below, exactly-at, and above-delay boundaries with no sleeps.
- Structural incompatibility and root changes split inside the delay; explicit merge joins after the delay only where root safety allows.
- Explicit new-batch/push, skip, remote commit, undo, redo, restore, and schema publication clear the next automatic group.
- Composition/native text sequences preserve intended grouping and one undo batch per idle burst.
- History JSON round-trip contains no timestamps and behaves identically after restore; multi-root and schema tests remain deterministic.

## Max length is authoring policy (`LOCAL-MAX-LENGTH-POLICY`)

<a id="max-length-is-authoring-policy"></a>

- Rows: `LOCAL-MAX-LENGTH-POLICY`
- Priority: P1
- Owner: `best-api` -> `plite-plan`; Plate and React hosts adopt it
- Decision: Max length is one editor extension with pleasant command clamping plus an atomic precommit validator; non-authoring ingestion requires an explicit bypass.


- Sources: `packages/plite/src/interfaces/editor.ts:589-595`, `packages/plite/src/interfaces/editor.ts:1349-1362`, `packages/plite/src/core/update-policy.ts:24-85`, `packages/plite/src/core/insert-limit.ts:23-100`, `packages/plite/src/core/public-state.ts:5020-5041`, `packages/plite/src/core/public-state.ts:7186-7194`, `packages/plite-react/src/components/editable-text-blocks.tsx:180-192`, `packages/plite-react/src/components/editable-text-blocks.tsx:1127-1138`, `packages/core/src/lib/editor/withPlite.ts:483-487`, `packages/core/src/lib/editor/withPlite.ts:600-617`, `packages/core/src/react/editor/withPlate.ts:218-225`, `packages/plite/test/state-tx-public-api-contract.ts:413-426`

### Current shape

```ts
const editor = createPlateEditor({ maxLength: 200 });

<Plate editor={editor}>
  <Editable maxLength={120} />
</Plate>

// A view effect mutates one editor-global WeakMap; generic replacements can
// bypass command-local clamping.
```

### Final shape

```ts
import { createEditor, maxLength } from '@platejs/plite';

const editor = createEditor({
  extensions: [maxLength(200)],
});

// Import, restore, and collaboration are deliberate non-authoring paths.
editor.update({ authoring: 'bypass' }, (tx) => {
  tx.value.replace(importedDocument);
});
```

### Delete

- `CreateEditorOptions.maxLength`, Plate constructor forwarding, and the editor-global max-length WeakMap/getter/setter.
- `Editable`/content-root `maxLength` props and the layout effect that overwrites editor policy when views mount/unmount.
- Command-only enforcement as the final authority; it cannot cover arbitrary update functions or value replacement.
- Silent bypass for imported, restored, or collaborative updates; bypass is explicit in `EditorUpdatePolicy.authoring`.

### Adopt

- Core extension authoring gains a final `validateUpdate` hook over before/after state and compiled update policy.
- `maxLength(limit)` owns text/fragment/slice/node command clamping, native input integration, and final atomic validation.
- `EditorUpdatePolicy` adds `authoring?: "bypass"`; compiled update policy carries it to precommit without a public tag convention.
- Plite React, Plate editor construction, Editable props, paste/composition/input managers, import/restore/collaboration, docs, and tests.

### Dependency order

1. Add `authoring` policy compilation and the deterministic extension `validateUpdate` precommit phase with rollback-before-publication semantics.
2. Implement `maxLength(limit)` over existing clamping helpers plus whole-document final validation.
3. Mark import, restore, and collaboration owners with explicit `authoring: "bypass"`; ordinary app updates remain enforced.
4. Delete constructor, WeakMap, Plate bridge, and view props; migrate docs and callers to the extension.
5. Run package, multi-view browser, composition, paste, History, and collaboration proof.

### Proof gates

- Two simultaneous views of one editor cannot race or disagree about the limit; mounting/unmounting either view changes no editor policy.
- Typing, composition, paste, text/fragment/slice/node insertion, replacement, and arbitrary update callbacks cannot commit an over-limit authoring state.
- Pleasant paths clamp before mutation; the precommit validator rejects unhandled paths atomically with no document, operation, selection, effect, or commit residue.
- Only explicit `authoring: "bypass"` permits over-limit import, restore, or collaboration; omitting it fails closed.
- Undo/redo and History grouping remain exact, and configuration install/replace/remove obey lifecycle rollback.
- Compile-only proof exposes one extension route and one bypass field—no constructor, view prop, WeakMap API, callback annotations, or `any`.

## ESM namespace ergonomics (`LOCAL-RUNTIME-API-TREESHAKING`)

<a id="esm-namespace-ergonomics"></a>

- Rows: `LOCAL-RUNTIME-API-TREESHAKING`
- Priority: P1
- Owner: `best-api` -> `plite-plan` in package exports/runtime utilities
- Decision: Use native ESM module namespaces on method-level subpaths; hard-cut frozen `*Api` objects only after two packed-artifact bundlers prove reachability.


- Sources: `packages/plite/src/interfaces/node.ts:639-760`, `packages/plite/src/index.ts:257-266`, `packages/plite/package.json:35-49`, `docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/runtime-api-bundle-probe.json:1-38`, `docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-namespace-bundle-probe.json:1-94`, `../wordgard/bin/build.ts:129-181`

### Current shape

```ts
import { NodeApi, PathApi } from '@platejs/plite';

NodeApi.string(value);
PathApi.equals(left, right);
```

### Final shape

```ts
import * as Node from '@platejs/plite/node';
import * as Path from '@platejs/plite/path';

Node.string(value);
Path.equals(left, right);

// Named imports remain available from the same subpath for minimal consumers.
import { string } from '@platejs/plite/node';
```

### Delete

- Root `NodeApi`, `PathApi`, `PointApi`, `RangeApi`, `TextApi`, and `ElementApi` values after every method and consumer is migrated.
- Frozen object literals that retain sibling methods when one property is imported.
- Any TypeScript namespace output or Wordgard-style AST rewrite/purity patch in the Plite build.
- The source-entry-only Rolldown probe as sufficient release evidence; it remains a diagnostic baseline, not the hard-cut gate.
- The belief that Wordgard already proves property-level namespace shaking: current `heading.keyBindings` and `heading.createOnHash` retain each other in both measured bundlers.

### Adopt

- `@platejs/plite/node`, `/path`, `/point`, `/range`, `/text`, and `/element` package exports with one source module per namespace.
- Root/internal barrels, all Plite/Plate/package/registry imports, public types, examples, docs, codemods, and packed declarations.
- Tarball build configuration and permanent Rolldown plus esbuild bundle probes.

### Dependency order

1. Inventory every public `*Api` method, type-only dependency, internal call, and consumer; source each method from a subpath module without cycles.
2. Publish subpath exports in the packed tarball while keeping current root objects temporarily for an A/B bundle gate.
3. Run Rolldown and esbuild against packed namespace and named imports; repair reachability before migrating callers.
4. Migrate source, tests, docs, examples, and packages to subpaths.
5. Hard-cut root `*Api` objects and compatibility exports only after packed proof and declaration checks pass.

### Proof gates

- Packed tarball resolves types/runtime for all six subpaths in Node ESM, Rolldown, and esbuild.
- For every representative method, namespace and named imports retain the selected method, omit a sibling sentinel, and differ by no more than `max(5%, 1 KiB)` after minification and compression.
- Rolldown and esbuild independently prove `Node.string`, `Node.isText`, Path, Point, Range, Text, and Element reachability; no source aliases mask the result.
- Root `NodeApi`/other `*Api` imports fail after the hard cut, while every inventoried method has one subpath export and one migrated owner.
- Package declarations are finite, tree-shaking metadata remains truthful, and no custom namespace AST transform is introduced.

## Explicit math CSS (`LOCAL-MATH-CSS-BOUNDARY`)

<a id="explicit-math-css"></a>

- Rows: `LOCAL-MATH-CSS-BOUNDARY`
- Priority: P1
- Owner: `plate-plan` in `packages/math`; registry/app owners import style policy
- Decision: The headless math package exposes CSS as an explicit subpath; applications opt in. Wordgard-style runtime scoped CSS-in-JS is rejected for Plate.


- Sources: `packages/math/src/lib/BaseEquationPlugin.ts:1-12`, `packages/math/package.json:20-29`, `apps/www/src/registry/components/editor/plugins/math-kit.tsx:1-20`, `apps/www/src/registry/components/editor/plugins/math-base-kit.tsx:1-15`, `../wordgard-website/site/docs/guide/index.md:1130-1207`, `../wordgard-website/site/examples/style/index.md:20-70`, `../wordgard/src/editor/editor.ts:358-362`, `../wordgard/src/editor/editor.ts:584-588`, `../wordgard/src/editor/editor.ts:705-752`

### Current shape

```ts
import { BaseEquationPlugin, MathRules } from '@platejs/math';

// Importing the headless package also imports katex/dist/katex.min.css.
const plugins = [BaseEquationPlugin];
```

### Final shape

```ts
import '@platejs/math/katex.css';
import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

const plugins = [EquationPlugin, InlineEquationPlugin];
```

### Delete

- The top-level `katex/dist/katex.min.css` import from `BaseEquationPlugin.ts`.
- Inaccurate package-wide `sideEffects: false`; metadata names only the exported CSS side effect.
- Any claim that importing the headless descriptor implicitly styles live or static output.
- Wordgard-style `styles()`/`theme()` runtime CSS-in-JS for Plate math: it would add DOM-root mounting, CSP nonce, RSC, and copied-registry ownership to a stylesheet import.

### Adopt

- `@platejs/math/katex.css` export, packed files, package side-effect metadata, and declaration/build configuration.
- Registry math kit/base kit consumers, app layout/theme entrypoints, installation docs, examples, static/RSC examples, and tests.
- Headless `@platejs/math` and `@platejs/math/react` imports remain JavaScript-only unless the application imports the CSS subpath.

### Dependency order

1. Export the exact KaTeX stylesheet subpath and mark that subpath—not the whole package—as side-effectful.
2. Remove the hidden CSS import from the headless plugin owner.
3. Add explicit CSS imports at app/registry composition owners that choose styled math.
4. Update docs/examples and verify packed, RSC, CSP, and bundler behavior.

### Proof gates

- Importing `@platejs/math` or `/react` emits no CSS and performs no DOM/style-root work.
- `@platejs/math/katex.css` exists in the packed tarball, resolves through exports, and is retained by Rolldown and esbuild production bundles.
- A live registry math demo and static/RSC render display correct KaTeX markup; the explicitly styled app visually matches the current output.
- CSP/static/headless tests require no runtime style injection or nonce API; copied registry code makes the CSS dependency visible.
- Package side-effect metadata permits unused JavaScript to shake while retaining an explicitly imported stylesheet.

## Mixed-bidi visual caret movement (`WG-STATE-013`)

<a id="visual-bidi-order"></a>

- Rows: `WG-STATE-013`
- Priority: P1
- Owner: `best-api` -> `plite-plan`; `@platejs/plite-dom` owns resolution and `@platejs/plite-react` adopts it
- Decision: Add a DOM-geometry visual-point resolver that preserves selection affinity; keep logical Core movement and reject Wordgard's incomplete bidi engine.


- Sources: `../wordgard/src/state/bidi.ts:29-38`, `../wordgard/src/state/bidi.ts:51-115`, `../wordgard/src/state/bidi.ts:136-405`, `../wordgard/src/state/textblock.ts:51-55`, `../wordgard/src/state/textblock.ts:142-175`, `../wordgard/test/test-selection.ts:102-158`, `packages/plite/src/interfaces/selection.ts:7-16`, `packages/plite/src/core/selection-protocol.ts:95-116`, `packages/plite/src/core/selection-protocol.ts:700-733`, `packages/plite-dom/src/plugin/dom-geometry.ts:1138-1204`, `packages/plite-react/src/editable/keyboard-input-strategy.ts:147-159`, `packages/plite-react/src/editable/caret-engine.ts:435-454`, `packages/plite-react/src/editable/caret-engine.ts:677-843`, `apps/plite/tests/plite-browser/donor/examples/navigation-bidi.test.ts:93-197`

### Current shape

```ts
applyEditableCaretMovement({ editor, event, isRTL, selection });

// Horizontal arrows choose logical reverse from one first-strong block
// direction, so mixed-direction spans cannot follow rendered visual order.
```

### Final shape

```ts
export type DOMVisualPoint = Readonly<{
  point: Point;
  affinity: SelectionAssociation;
}>;

const next = editor.api.dom.resolveVisualPoint(selection.focus, {
  affinity: selection.affinity,
  direction: 'left',
  unit: alt ? 'word' : 'character',
});

if (next) {
  editor.update.selection.select({
    kind: 'text',
    anchor: extend ? selection.anchor : next.point,
    focus: next.point,
    affinity: next.affinity,
  });
}
```

### Delete

- `isRTL` as the horizontal-movement decision input to `applyEditableCaretMovement` and the first-strong left/right/word branches in the caret engine.
- Horizontal routing in `keyboard-input-strategy.ts` that reduces a mixed block to one base direction.
- Any copied Wordgard UAX9 table or second model-only bidi engine; the donor ignores isolates and truncates paired-bracket coverage.
- Any new persisted selection kind or Plate-only wrapper API; existing `TextSelection.affinity` carries association.

### Adopt

- `@platejs/plite-dom`: `DOMApi.resolveVisualPoint`, public result/options, mounted-block visual-caret graph, geometry/layout revision cache, and root/boundary fallback.
- `@platejs/plite-react`: preserve full `TextSelection` affinity through the caret engine and adopt the resolver for move/extend by character and word.
- Plate inherits the DOM capability through its configured editor; Core logical `editor.update.selection.move`, vertical movement, and content-root navigation remain unchanged.

### Dependency order

1. Specify the point-plus-affinity result and physical left/right contract in `plite-dom` without adding a Core bidi API.
2. Build a visual-caret graph from mounted grapheme boundaries measured through `pointRect(...association)`, grouped by rendered line and cached by runtime/text/layout revision.
3. Compose word movement from visual grapheme steps and `Intl.Segmenter`; return null at unmounted/root boundaries so existing navigation owns fallback.
4. Adopt the resolver in `plite-react` for horizontal move and extend, then remove first-strong horizontal routing.
5. Keep Wordgard vectors only as oracles, extend them for isolates/brackets, and run cross-engine plus bounded-work proof.

### Proof gates

- Exact left/right, extend, and word sequences for mixed `treeشجرة`, RTL-base text, numbers, and the same logical offset with opposite affinities.
- LRI, RLI, FSI, PDI, paired brackets beyond Wordgard's table, emoji, combining marks, and grapheme clusters preserve rendered order without splitting units.
- Inline/void/content-root boundaries, selection extension, promoted or virtualized blocks, and null fallback preserve existing ownership.
- Chromium, Firefox, and WebKit assert exact visual sequences and DOM/model/selection convergence; current logical movement tests remain unchanged.
- A bounded-work benchmark proves no whole-document scan and cache invalidation follows text, runtime, geometry, and layout revisions.

## First-party persisted block direction (`WG-PRODUCT-003A2D`)

<a id="first-party-block-direction"></a>

- Rows: `WG-PRODUCT-003A2D`
- Priority: P1
- Owner: `plate-plan` in `@platejs/basic-styles`; `plite-dom`, lists, static rendering, and registry UI consume the persisted property
- Decision: `textDirection` is the sole semantic plugin/property identity; Plate owns persistence and commands, HTML alone maps it to `dir`, and DOM geometry owns visual movement.


- Sources: `../wordgard/src/types/schema.ts:291-310`, `../wordgard/src/command/commands.ts:275-307`, `../wordgard/src/schema/block.ts:183-265`, `docs/editor-issue-harvester/wordgard/full/issue-closure-ledger.md:51-51`, `docs/editor-issue-harvester/wordgard/full/issue-closure-ledger.md:77-77`, `packages/basic-styles/src/lib/BaseStylePlugins.ts:386-443`, `packages/basic-styles/src/lib/BaseStylePlugins.ts:458-535`, `packages/list/src/react/ListPlugin.tsx:9-31`, `packages/plite-dom/src/plugin/dom-geometry.ts:707-714`

### Current shape

```ts
// Plate has a persisted textAlign owner, but no first-party persisted
// block-direction schema, command, codec, or list-wrapper projection.

editor.update.textAlign.set('end');
```

### Final shape

```ts
import { BaseTextDirectionPlugin } from '@platejs/basic-styles';

const editor = createPlateEditor({
  plugins: [BaseTextDirectionPlugin, ...EditorKit],
});

editor.update.textDirection.set('rtl');
editor.update.textDirection.set('ltr');
editor.update.textDirection.set('auto');
editor.update.textDirection.set(null);
```

### Delete

- Any `dir` or `direction` persisted alias: `textDirection` is the plugin name and semantic property identity; only the HTML codec reads/writes the `dir` attribute.
- Any copied Wordgard `BidiSpan`/`autoDir` algorithm in the Plate feature; visual caret order belongs to the separate DOM resolver dossier.
- Any second clear/toggle/read command beside `update.textDirection.set(value | null)`.
- Projection that sets direction only on an inner paragraph while list wrappers and markers remain directionless—the exact donor issue #2 failure.

### Adopt

- `@platejs/basic-styles`: inferred enum schema property, selected-block update, HTML codec, and main-node projection.
- Modern and legacy list model owners, static RSC renderers, Markdown/HTML round trips, registry control, docs, examples, and persisted fixtures.
- `plite-dom` continues to derive computed direction and the visual-point dossier owns mixed-bidi movement; the feature adds no Core bidi engine.
- History and Yjs treat `textDirection` as ordinary schema-owned persisted data under the configured schema identity.

### Dependency order

1. Define `TextDirection = "auto" | "ltr" | "rtl"` and `BaseTextDirectionPlugin` with exact `textDirection` name/type and target filtering.
2. Add the one `set(value | null)` update plus `textDirection` to/from HTML `dir` codec and static projection.
3. Propagate the effective property to modern, classic, and static list wrappers/markers instead of only their paragraph child.
4. Add the copied-registry control without a package-owned menu DSL.
5. Land after or with the visual-point resolver so stored direction and horizontal selection behavior cannot diverge.

### Proof gates

- Schema rejects invalid values; split/type-change preservation occurs only on allowed targets.
- `set("ltr" | "rtl" | "auto" | null)` works for collapsed and expanded selections and round-trips through undo/redo.
- HTML decode/encode and static RSC map only `textDirection` to `dir` and expose no persisted alias.
- Paragraph plus modern/classic/static list outer wrappers and markers carry the effective direction; the Wordgard issue #2 case is retained as an oracle.
- Chromium, Firefox, and WebKit prove mixed-bidi arrow/selection behavior and RTL/auto list-marker placement with the visual-point resolver.
- Compile-only proof preserves the inferred scoped/global `editor.update.textDirection.set` surface.

## Keyboard media resize (`LOCAL-MEDIA-KEYBOARD-RESIZE`)

<a id="keyboard-media-resize"></a>

- Rows: `LOCAL-MEDIA-KEYBOARD-RESIZE`
- Priority: P2
- Owner: `plate-plan` in `packages/media`; `packages/resizable` and registry UI consume the command
- Decision: Media descriptors own persisted width mutation through `setWidth`; UI owns pointer/keyboard delta math and calls that one update.


- Sources: `packages/media/src/lib/BaseMediaPlugin.ts:26-37`, `packages/media/src/lib/BaseMediaPlugin.ts:101-180`, `packages/media/src/lib/BaseMediaPluginContracts.spec.ts:181-243`, `packages/resizable/src/useResizable.ts:56-147`, `apps/www/src/registry/ui/resize-handle.tsx:17-64`, `apps/www/src/registry/ui/media-image-node.tsx:23-65`

### Current shape

```ts
const commitWidth = (nextWidth: number) => {
  editor.update.nodes.set({ width: nextWidth }, { at: element });
};

// Pointer-only resize handles call the generic node mutation directly.
```

### Final shape

```ts
const image = editor.plugin(ImagePlugin);

image.update.setWidth(nextWidth, { at: element });

// Pointer drag and ArrowLeft/ArrowRight compute nextWidth in the UI and call
// the same descriptor-owned update. Persisted width remains number | string.
```

### Delete

- Direct generic `editor.update.nodes.set({ width })` from `useResizableState` and registry media components.
- Separate pointer and keyboard mutation paths or a plugin command that owns DOM pixels, percentages, direction, or handle geometry.
- Inaccessible resize-handle `<div>` semantics with no keyboard role, value, bounds, or announcement.

### Adopt

- Media plugin update contract for image, video, audio, file, and embed width owners with typed `at` targeting.
- `packages/resizable` keeps local preview width/delta/clamp math and calls a supplied commit callback only when the gesture finishes.
- Registry image/video/embed handles add keyboard interaction, slider semantics, current/min/max value, focus, and announcements.
- Media schema/codecs/static rendering, History, package tests, registry browser tests, docs, and examples.

### Dependency order

1. Add inferred `update.setWidth(width, { at })` to the shared media descriptor contract and preserve `number | string` schema data.
2. Route existing pointer commit through the plugin update without moving presentation math into the plugin.
3. Add keyboard/ARIA behavior to the resize handle and reuse the same UI calculation plus plugin commit.
4. Migrate registry media owners and remove generic width mutations.
5. Verify History batching, codecs, static output, pointer behavior, and browser accessibility.

### Proof gates

- Compile-only: each media descriptor exposes `setWidth(number | string, { at })` with its element type and no raw `tx`/editor parameter.
- Pointer and keyboard paths produce the same persisted update for left/right handles, alignment direction, px/% input, min/max clamp, and RTL where supported.
- Arrow keys, larger-step modifier, focus retention, `role="slider"`, orientation, value/min/max, and accessible announcement pass browser/a11y proof.
- One completed interaction creates one undo batch; preview motion does not write document state.
- Selection, caption focus, drag coexistence, HTML/static rendering, and number/string width codec behavior remain exact.

## Asynchronous hover-source lifecycle (`WG-VIEW-014C2`)

<a id="async-hover-source-lifecycle"></a>

- Rows: `WG-VIEW-014C2`
- Priority: P2
- Owner: `plate-plan` in the consuming registry component family; promote a generic hook only after a second real consumer
- Decision: The main hover component family owns request, cancellation, stale-result, and loading/error state; Radix owns pointer/focus geometry and editor plugins expose only feature queries.


- Sources: `../wordgard/src/editor/tooltip.ts:401-425`, `../wordgard/src/editor/tooltip.ts:618-838`, `apps/www/src/components/ui/hover-card.tsx:1-46`, `apps/www/src/registry/ui/footnote-node.tsx:98-214`, `apps/www/src/registry/ui/footnote-node.slow.tsx:673-704`, `apps/www/src/registry/ui/footnote-node.slow.tsx:847-896`, `packages/link/src/react/useLink.ts:1-18`

### Current shape

```ts
// Wordgard owns hover timers, pointer movement, async source identity,
// editor effects, tooltip aggregation, positioning, and teardown in Core.
const tooltip = Tooltip.hover(async (wg, pos, side) => loadPreview(pos));

// Plate consumers currently compose synchronous editor reads with HoverCard.
```

### Final shape

```ts
function LinkPreview({ href }: { href: string }) {
  const [open, setOpen] = React.useState(false);
  const preview = useAsyncHoverSource({
    key: href,
    load: ({ signal }) => loadLinkPreview(href, { signal }),
    open,
  });

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>{/* feature trigger */}</HoverCardTrigger>
      <HoverCardContent>{renderPreview(preview)}</HoverCardContent>
    </HoverCard>
  );
}
```

### Delete

- A Core tooltip subsystem that owns product hover timing, async loading, DOM presentation, and editor transaction state together.
- Promise results applied after the key, editor, trigger, or open state changed; identity checks without request cancellation.
- Loading/error/request state stored in plugin fields or the document for one component-family concern.
- Custom pointer grace areas, focus transfer, portal positioning, and dismissal that duplicate the installed HoverCard primitive.
- A generic exported hook before two maintained component families prove the exact same contract.

### Adopt

- The first async registry hover consumer colocates `useAsyncHoverSource` with its main component family; synchronous footnote previews remain simple editor selectors.
- The hook owns an `AbortController`, key/open generation, idle/loading/success/error state, and stale completion rejection.
- Feature packages expose scoped read APIs only; copied UI decides what to fetch and render.
- HoverCard continues to own pointer-to-content transit, focus, delays, dismissal, portal, and geometry.
- If a second maintained family needs the identical lifecycle, promote only the hook to the smallest shared React/UI owner.

### Dependency order

1. Choose one real async preview consumer and define its loading/error/empty behavior without changing editor state.
2. Colocate the request hook with that main component family and add abort plus stale-key/open/editor guards.
3. Compose the hook with HoverCard; do not move pointer or positioning behavior into the hook.
4. Prove keyboard, pointer, touch, teardown, editor updates, and rapid target changes.
5. Promote the hook only after a second consumer demonstrates exact reusable semantics.

### Proof gates

- Closing, unmounting, changing key, replacing editor, or starting a newer request aborts the old request and prevents stale publication.
- Rapid A -> B -> A hover sequences never render B for A; rejected promises produce the declared error state without unhandled rejection.
- Pointer travel from trigger to content, focus entry/exit, Escape, outside interaction, touch behavior, and portal positioning remain owned and proven by HoverCard.
- Editor commits while open refresh only feature-owned synchronous context and do not restart unrelated network work.
- No plugin field, transaction effect, persisted property, global tooltip manager, or Core API is added for request state.
- The first consumer proves idle/loading/success/empty/error and teardown in focused component tests plus its standalone Browser route.

## Source-backed API reference facts (`WG-WEB-001`)

<a id="source-backed-api-reference"></a>

- Rows: `WG-WEB-001`
- Priority: P2
- Owner: `plate-plan` in docs tooling; curated pages remain docs-owned
- Decision: Generate export, symbol, signature, and source-link facts from packed declarations; keep narrative, ordering, examples, and recommendations in curated MDX.


- Sources: `../wordgard-website/src/build.ts:145-171`, `../wordgard-website/src/build.ts:222-237`, `../wordgard-website/template/ref.html:1-28`, `../wordgard-website/site/docs/ref/index.md:1-35`, `../wordgard/package.json:6-18`, `../wordgard/bin/build.ts:277-279`, `apps/www/src/components/api-list.tsx:28-220`, `content/docs/api/floating.mdx:58-210`, `content/docs/plite/api/transforms.mdx:1-180`, `.agents/rules/docs-creator.mdc:117-176`, `.agents/rules/docs-creator.mdc:658-718`

### Current shape

```ts
// Plate copies exact signatures into curated MDX.
<API name="useVirtualFloating">
  <APIOptions type="UseVirtualFloatingOptions">...</APIOptions>
</API>

// Wordgard generates a whole reference site from source comments, but the
// current generator omits its root aggregate and publishes a stale entrypoint.
```

### Final shape

```ts
// docs/api-reference.config.ts
export default defineApiReference({
  packages: ['@platejs/plite', '@platejs/core'],
  source: 'packed-declarations',
});

// Curated MDX still owns the useful page.
<APIReference package="@platejs/plite" symbol="Editor" />

// The component renders generated export/signature/source facts. Authors keep
// the explanation, examples, ordering, warnings, and recommendations around it.
```

### Delete

- Hand-copied export names, signatures, generic parameters, and source links that can drift from packed declarations.
- A Wordgard-style generated reference site that pretends extracted comments are complete product documentation.
- Source scanning that ignores the package export map, root aggregate, declaration/runtime parity, aliases, or packed artifacts.
- Generated prose, examples, recommendations, or page order: those remain deliberate MDX.

### Adopt

- One docs-only extractor reads packed package exports and declarations into a versioned symbol manifest with entrypoint, kind, signature, generics, source locator, and aliases.
- `APIReference` renders selected facts inside existing curated MDX and current API-list presentation.
- Plate and Plite API routes explicitly include or exclude every public packed symbol; exclusions require a reason.
- Internal links, anchors, source links, examples, localized pages, and search indexes consume the same symbol manifest where factual.
- Docs reference checks join package build/type parity, route validation, and Browser navigation without generating registry/template output.

### Dependency order

1. Freeze the packed export/declaration contract and define a deterministic symbol-manifest schema.
2. Extract every root and subpath export, alias, signature, type parameter, doc comment, and source locator; reject declaration/runtime drift.
3. Add the MDX renderer without changing curated prose or page ownership.
4. Adopt the renderer on one complete Plite reference family, then Plate package references.
5. Delete copied facts only after include/exclude parity, links, search, localization, and packed-artifact gates pass.

### Proof gates

- Every packed runtime/declaration export is included exactly once or excluded with a checked reason; the root aggregate and all subpaths participate.
- Aliases, overloads, generics, literal types, JSDoc links, and source locators resolve without inventing runtime values.
- A changed public declaration makes the docs check fail until the curated page accepts, excludes, or removes the generated fact.
- Broken anchors, stale entrypoint names, missing source paths, declaration/runtime mismatches, and sample syntax fail closed.
- Curated MDX remains readable without generated prose and retains explicit examples, ownership, caveats, and recommendations.
- Packed-artifact and Browser checks prove the rendered reference, navigation, search, and localized-link behavior.

## Raw mobile input proof (`WG-PROOF-004C`)

<a id="raw-mobile-input-proof"></a>

- Rows: `WG-PROOF-004C`
- Priority: P2
- Owner: `plite-plan` raw-device proof lane; no runtime API owner
- Decision: Release-quality mobile claims require replayable Appium receipts from real Android Chrome and iOS Safari; viewport emulation and lab capture remain diagnostics.


- Sources: `apps/plite/playwright.config.ts:36-75`, `apps/plite/src/app/mobile-lab/client.tsx:270-331`, `tooling/plite/donor/proof/mobile-device-proof.mjs:9-37`, `tooling/plite/donor/proof/mobile-device-proof.mjs:56-112`, `packages/browser/src/core/release-proof.ts:10-34`, `packages/browser/src/core/release-proof.ts:85-106`, `packages/browser/src/core/proof.ts:70-81`, `packages/browser/src/core/proof.ts:141-145`, `packages/browser/test/core/release-proof.test.ts:13-111`, `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts:645-770`, `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts:836-865`

### Current shape

```ts
pnpm check:plite:browser-matrix

// The "mobile" project is Chromium Pixel 5 emulation. The mobile lab says its
// capture is evidence, not a raw-device proof receipt.
```

### Final shape

```ts
pnpm test:mobile-device-proof:raw

// The command consumes Appium Android + iOS artifacts containing replay data,
// screenshots/video, event traces, model value, DOM text, native selection,
// and exactly-once update evidence for every required scenario.
```

### Delete

- Any release gate that accepts Pixel 5 viewport emulation, desktop WebKit, agent-browser iOS proxy, or a mobile-lab JSON capture as raw-device proof.
- Boolean pass-only receipts without device/browser version, replay steps, traces, model/DOM/native-selection snapshots, or artifact links.
- A single text-input/IME placeholder scenario standing in for native selection, gesture, clipboard, deletion, and composition behavior.

### Adopt

- `test:mobile-device-proof:raw`, Appium runner inputs, artifact schema, release-proof validator, replay parser, and CI/device-lab handoff.
- Android Chrome and iOS Safari scenario fixtures for the mobile lab/editor route, with deterministic initial document and debug snapshots.
- Release docs and audit rows `WG-PROOF-004`, `WG-VIEW-009`, and `WG-VIEW-010B` converge on final row `WG-PROOF-004C`.

### Dependency order

1. Define one versioned receipt schema with platform/device/browser/build identity, scenario ID, replay steps, traces, screenshots/video, and semantic snapshots.
2. Automate the exact scenario matrix in Appium Android Chrome, then iOS Safari, without accepting proxy transports.
3. Validate exactly-once model updates and model/DOM/native-selection convergence per step; store replayable artifacts.
4. Teach the raw proof command and release validator to require both platform matrices and reject incomplete/proxy receipts.
5. Run replay/readback from stored artifacts and attach immutable CI/device-lab evidence before making mobile release claims.

### Proof gates

- Both platforms prove tap, double-tap, long press, forward/backward selection-handle drag, cross-inline and cross-block selection, and selection autoscroll.
- Both platforms prove swipe with collapsed/expanded selection, inline void boundaries, Enter, Backspace, autocapitalization, composition/IME, and native clipboard.
- Every step records event trace, model value, DOM text, native selection, semantic selection, update count, screenshot, and video/time range.
- Each authoring gesture yields exactly one committed semantic update and converged model/DOM/native selection after quiescence.
- `pnpm test:mobile-device-proof:raw` fails when either platform, scenario, capability, artifact, or direct Appium transport is missing; emulation cannot satisfy it.
- Stored receipts replay through the parser and release validator on a separate readback run.


# Deferred research dossiers

These rows are not implementation backlog. Their missing evidence is the decision.

## Complete-schema relationship rebinding (`WG-DOC-004B1`)

<a id="complete-schema-relationship-rebinding"></a>

- Rows: `WG-DOC-004B1`
- Priority: P2
- Owner: `best-api` -> `plite-plan` only after one concrete Plate outliner or strict-property consumer exists
- Decision: Do not port `Schema.Override`; consider frozen relationship replacements only on the app-owned complete schema after a real local consumer proves the gap.
- Disposition: defer
- Entry condition: One maintained Plate feature must need to rebind content, groups, or a property target declared by an installed plugin without mutating or restating that plugin family.
- Sources: `../wordgard/src/doc/schema.ts:203-241`, `../wordgard/src/doc/schema.ts:323-390`, `../wordgard/test/test-schema.ts:38-58`, `packages/plite/src/interfaces/schema.ts:392-489`, `packages/plite/src/core/schema-definition.ts:915-1077`, `packages/plite/src/core/schema-compiler.ts:2600-3040`, `packages/plite/src/core/schema-compiler.ts:3320-3465`, `packages/core/src/lib/plugin/defineBasePlugin.ts:228-280`, `packages/core/src/internal/plugin/resolvePlugins.ts:1513-1536`, `packages/core/src/lib/editor/withPlite.ts:194-253`

### Current shape

```ts
const OutlinerSchema = defineEditorSchema('schema:outliner', {
  root: schema.content.type('bulleted-list', {
    default: { type: 'bulleted-list' },
    min: 1,
  }),
});

// Installed feature contributions remain immutable. There is no complete-
// schema owner for replacing one contributed content/group/target relation.
```

### Final shape

```ts
const OutlinerSchema = defineEditorSchema('schema:outliner', {
  root: schema.content.type('bulleted-list', {
    default: { type: 'bulleted-list' },
    min: 1,
  }),
  relationships: [
    schema.relationship.content(
      'list-item',
      schema.content.types(['paragraph', 'bulleted-list'], {
        default: { type: 'paragraph' },
        min: 1,
      })
    ),
    schema.relationship.groups('paragraph', ['textBlock']),
    schema.relationship.target(
      schema.handle.textProperty(BasicSchema, 'bold'),
      target.type('paragraph')
    ),
  ],
});
```

### Delete

- Nothing before the entry condition is met.
- Conditionally: any plugin `.extend/.configure({ schema })` escape hatch, weak deep merge, ordered callback transformer, or second `schemaRelationships` editor option.
- Wordgard nominal `Schema.Override`, mutable `Node.Type`/`Mark.Type` identity, order-selected winners, and arbitrary transformation callbacks.

### Adopt

- One frozen discriminated `SchemaRelationship` union on `EditorSchemaDefinition` only: content, groups, or property-target replacement.
- Plite normalization/compiler, canonical schema identity and delta, reconfiguration rollback, diagnostics, History, and Yjs mismatch handling.
- Plate may adapt configured plugin types/handles only at the one complete-schema boundary; plugin contributions remain immutable.
- Schema-specific Enter/Backspace behavior remains the separate `WG-DOC-004B2` research row.

### Dependency order

1. First demonstrate the entry-condition consumer and show why existing complete root grammar, groups, and configured descriptors cannot express it honestly.
2. Define structural handles and the frozen relationship union in raw Plite; reject duplicate ownership and order-dependent resolution.
3. Apply replacements after contribution ownership resolution and before group/content/property compilation; include them in fingerprint and delta.
4. Adapt Plate plugin references at the complete-schema boundary and migrate the one real consumer.
5. Only then decide whether the complete schema subsumes `schemaIdentity`; do not create parallel public configuration.

### Proof gates

- Compile-only: relationships are complete-schema-only; element/property handles infer valid types and keys.
- Unknown handles, duplicate relations, kind-changing content, conflicting owners, and reordered relationships fail or remain invariant with owner/path diagnostics.
- Content, group, and property-target acceptance flip exactly once; donor schema tests remain behavior oracles, not copied implementation.
- Relationship changes alter canonical identity/delta; failed reconfiguration publishes nothing; incompatible History/Yjs state fails closed.
- Configured Plate types resolve without mutating plugin descriptors and one standalone browser consumer proves the feature need.

