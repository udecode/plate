# Live Plite architecture inventory

## Scope and provenance

This is a source-derived map of the Plite side of the multi-editor audit. It is not a verdict against Wordgard, Lexical, or ProseMirror and it does not trust earlier migration plans.

- Checkout commit: `979c00b350f0c139c28f5bfb3b52adc51d18d5dd`.
- Machine manifest: `plite-source-manifest.json`.
- Generator/checker: `plite-build-manifest.mjs`.
- Audited owners: `packages/plite*`, `packages/browser`, `packages/yjs`, `apps/plite`, editor benchmarks, Plite docs, donor proof tooling, root Plite checks, and Plite CI.
- Runtime-generated directories such as `node_modules`, `dist`, `.next`, `.tmp`, `.turbo`, `out`, `tmp`, `coverage`, and `test-results` are excluded.
- The manifest maps every included file and every parsed top-level TypeScript, JavaScript, Markdown, JSON, and workflow declaration to at least one atomic concept. Current result: **2,318 files, 6,004 declarations, zero unmapped**.

## Current public shape

The core call shape is compact despite the implementation depth:

```ts
import {
  createEditor,
  defineCommand,
  defineEditorExtension,
  property,
  schema,
} from "@platejs/plite";
import { history } from "@platejs/plite-history";

const paragraph = defineEditorExtension({
  name: "paragraph",
  schema: {
    elements: {
      paragraph: {
        content: schema.content.text({ min: 1 }),
        properties: {
          align: property.string({ default: "left" }),
        },
      },
    },
  },
});

const editor = createEditor({
  extensions: [paragraph, history()],
  initialValue: [{ children: [{ text: "" }], type: "paragraph" }],
});

const selection = editor.read.selection();
const text = selection ? editor.read.text.string(selection) : "";

editor.update({ history: "new-batch" }, (tx) => {
  tx.text.insert("hello");
});

editor.update({ history: "skip" }).nodes.insert({
  children: [{ text: "" }],
  type: "paragraph",
});
```

Commands are descriptor-owned and pure until dispatch:

```ts
const insertMention = defineCommand<{ id: string }>("mention.insert", {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.nodes.insert({
        children: [{ text: "" }],
        id: input.id,
        type: "mention",
      });
    }),
});

const mentions = defineEditorExtension({
  name: "mentions",
  commands: ({ handle, around }) => [
    handle(insertMention, ({ input, state }) => {
      if (!state.selection()) return false;

      return state.transaction((tx) => {
        tx.nodes.insert({
          children: [{ text: "" }],
          id: input.id,
          type: "mention",
        });
      });
    }),
    around(insertMention, ({ input, next, state }) => {
      const prefix = state.transaction((tx) => tx.text.delete());

      return next.after(prefix, input);
    }),
  ],
});
```

DOM, React, history, and Yjs are installed extensions rather than fields baked into the JSON document:

```ts
import { history } from "@platejs/plite-history";
import { react } from "@platejs/plite-react";
import { createYjsExtension } from "@platejs/yjs";

const editor = createEditor({
  extensions: [history(), react(), createYjsExtension({ doc })],
});
```

The exact overloads and inferred extension namespaces live at `packages/plite/src/interfaces/editor.ts:1055`, `packages/plite/src/interfaces/editor.ts:1114`, `packages/plite/src/interfaces/editor.ts:1157`, `packages/plite/src/interfaces/editor.ts:1258`, and `packages/plite/src/interfaces/editor.ts:1293`. Construction inference lives at `packages/plite/src/interfaces/editor.ts:1567` and `packages/plite/src/create-editor.ts:396`.

## Atomic concept ledger

### PL-01 — JSON document, roots, and multi-root ownership

- **Public shape:** plain JSON `Element`/`Text` descendants inside `EditorDocumentValue`, with primary `children`, optional named `roots`, and optional metadata. Root-aware points preserve the plain path model.
- **Internal shape and invariant:** the primary root is internally canonicalized as `main`; public APIs omit that sentinel. Root creation, replacement, and deletion are canonical transaction changes.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:144`, `packages/plite/src/interfaces/editor.ts:151`, `packages/plite/src/interfaces/editor.ts:613`, `packages/plite/src/core/public-root.ts:12`, `packages/plite/src/core/change/document-change.ts:24`.
- **Consumers:** Plate owns product element types; Yjs binds one shared type per root; layout and React mount named roots without changing JSON representation.
- **Proof owner:** multi-root core tests, Yjs named-root tests, React root tests, and browser root-focus contracts.
- **Local assessment:** preserve. JSON-native multi-root documents are a real Plite advantage.

### PL-02 — Locations, traversal, and structural queries

- **Public shape:** paths, points, ranges, node targets, and grouped `state.nodes`, `state.points`, `state.ranges`, and `state.text` queries.
- **Internal shape and invariant:** snapshot-local paths are resolved through document indexes; public query results are immutable and root-aware.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:631`, `packages/plite/src/interfaces/editor.ts:821`, `packages/plite/src/interfaces/editor.ts:831`, `packages/plite/src/interfaces/editor.ts:838`, `packages/plite/src/core/change/document-index.ts:1`.
- **Consumers:** almost every Plate transform; DOM mapping; selectors; schema fitting; history validation.
- **Proof owner:** `packages/plite/test` query/location contracts and type contracts.
- **Local assessment:** preserve the grouped API. Compare reference editors for better compiled traversal/index locality, not for raw integer positions as the public model.

### PL-03 — Immutable snapshots, indexes, and runtime identity

- **Public shape:** `state.runtime.snapshot()`, `idAt(path)`, and `pathOf(runtimeId)`.
- **Internal shape and invariant:** immutable snapshots own lazy indexes; runtime IDs are render identity, not serialized node identity.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1030`, `packages/plite/src/interfaces/editor.ts:1614`, `packages/plite/src/interfaces/editor.ts:1632`, `packages/plite/src/core/snapshot-index.ts:1`.
- **Consumers:** React node subscriptions, commit impact queries, DOM mapping, anchors, layout projections.
- **Proof owner:** snapshot/runtime-id tests, React selector contracts, huge-document benchmarks.
- **Local assessment:** preserve. Paths for snapshot queries plus runtime IDs for mounted identity is the correct split.

### PL-04 — Canonical `DocumentChange` algebra

- **Public shape:** immutable, versioned, serializable multi-root changes with `between`, `transformPair`, `compose`, `correct`, `changedRanges`, `mapPosition`, `apply`, `invert`, and `toJSON`.
- **Internal shape and invariant:** each root owns a canonical token-level `RootChange`; changes are frozen, cross-realm validated, and compose only against compatible bases.
- **Evidence:** `packages/plite/src/core/change/document-change.ts:24`, `packages/plite/src/core/change/document-change.ts:634`, `packages/plite/src/core/change/document-change.ts:695`, `packages/plite/src/core/change/document-change.ts:858`, `packages/plite/src/core/change/document-change.ts:900`, `packages/plite/src/core/change/document-change.ts:973`, `packages/plite/src/core/change/document-change.ts:1047`.
- **Consumers:** transactions, commit queries, history, selection mapping, anchors, Yjs, corrections.
- **Proof owner:** change algebra unit/property tests, transform-pair exhaustive tests, serialization tests, and Yjs bridge tests.
- **Local assessment:** preserve. This is Plite's semantic center and must remain the only document-change truth.

### PL-05 — Transaction construction and change application

- **Public shape:** `state.transaction(...)` builds an immutable `TransactionSpec`; `editor.update(...)` publishes; `tx.changes.apply(change)` applies canonical changes directly.
- **Internal shape and invariant:** `DocumentChangeBuilder` shares indexes across steps, produces one canonical change, and keeps non-publishing draft reads isolated.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1093`, `packages/plite/src/interfaces/editor.ts:1114`, `packages/plite/src/interfaces/editor.ts:1690`, `packages/plite/src/core/change/builder.ts:41`, `packages/plite/src/core/change/builder.ts:180`.
- **Consumers:** commands, history restore, Yjs import, fitted slice insertion, product transforms.
- **Proof owner:** transaction-spec, update, rollback, normalization, and command contracts.
- **Local assessment:** preserve. Reference editors should be judged against this immutable-spec/publish split.

### PL-06 — Read, update, and correction lifecycle

- **Public shape:** direct single-call groups (`editor.read.nodes.block`, `editor.update.nodes.insert`) and callback forms for coherent reads or writes. Semantic policy is first: `editor.update({ history: 'skip' }, fn)`.
- **Internal shape and invariant:** reads observe one snapshot; writes are atomic, correction worklists run to a fixed point, failed updates roll back, and publication occurs once.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1157`, `packages/plite/src/interfaces/editor.ts:1258`, `packages/plite/src/interfaces/editor.ts:1288`, `packages/plite/src/core/editor-lifecycle-api.ts:177`, `packages/plite/src/core/public-state.ts:1`.
- **Consumers:** all packages.
- **Proof owner:** lifecycle/update/correction contract suites and correction-worklist benchmarks.
- **Local assessment:** preserve. Any imported mechanism must not bring back operation-by-operation publication or caller-owned normalization.

### PL-07 — Selection model and extensible selection protocol

- **Public shape:** nullable text/node/custom selections, root-aware points, range extraction, replacement range, mapping, validation, and versioned codecs.
- **Internal shape and invariant:** built-in text/node selections are strictly validated; custom kinds install descriptors that own mapping and persistence; a selection cannot cross roots.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:456`, `packages/plite/src/interfaces/editor.ts:2156`, `packages/plite/src/core/selection-protocol.ts:52`, `packages/plite/src/core/selection-protocol.ts:88`, `packages/plite/src/core/selection-protocol.ts:189`, `packages/plite/src/core/selection-protocol.ts:214`.
- **Consumers:** table selections, React selection reconciliation, history, Yjs awareness, DOM projection.
- **Proof owner:** selection protocol/mapping tests, table selection tests, browser selection snapshots.
- **Local assessment:** preserve extensibility. `selection.domRange()` is suspicious terminology because it returns a model `Range`; compare a host-neutral name such as `primaryRange()`.

### PL-08 — Anchors and transaction-scoped draft references

- **Public shape:** root-level `editor.anchor(value, { deletion, association, root })`; transaction-local `tx.refs.path/point`.
- **Internal shape and invariant:** anchors map canonical changes, retain explicit affinity/deletion behavior, share lazy root indexes, and release deterministically. Draft scopes are stack-disciplined.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:520`, `packages/plite/src/interfaces/editor.ts:1297`, `packages/plite/src/core/anchor.ts:36`, `packages/plite/src/core/anchor.ts:52`, `packages/plite/src/core/anchor.ts:179`, `packages/plite/src/core/anchor-state.ts:29`, `packages/plite/src/core/anchor-state.ts:60`, `packages/plite/src/core/anchor-state.ts:125`.
- **Consumers:** browser selection handles, collaboration cursors, table operations, async UI.
- **Proof owner:** anchor contracts, randomized rebase tests, and anchor performance targets.
- **Local assessment:** preserve root-level ownership. Benchmark bulk-anchor behavior against reference registries before proposing another index layer.

### PL-09 — Compiled schema, identity, and vocabulary

- **Public shape:** immutable schema declarations, element/property/group/root vocabulary, derived or named identity, validation, construction, and introspection through `state.schema`.
- **Internal shape and invariant:** all contributions compile into immutable lookup tables, construction plans, target matchers, property lookup, wrapper plans, fingerprints, and schema deltas.
- **Evidence:** `packages/plite/src/interfaces/schema.ts:243`, `packages/plite/src/interfaces/schema.ts:270`, `packages/plite/src/interfaces/schema.ts:340`, `packages/plite/src/core/schema-compiler.ts:280`, `packages/plite/src/core/schema-compiler.ts:369`, `packages/plite/src/core/schema-compiler.ts:3635`.
- **Consumers:** Plate plugins, fitting, codecs, Yjs schema checks, history persistence, corrections.
- **Proof owner:** schema construction/identity/validation tests, compile benchmarks, TS inference fixtures.
- **Local assessment:** preserve the compiler and JSON vocabulary. Reference grammars may improve expressiveness, not replace Plite with class-based nodes.

### PL-10 — Content grammar, `ContentSlice`, and fitting

- **Public shape:** content rules currently describe a set (`all`, `any`, `group`, `not`, `open`, `text`, `type`, `types`) plus one global `min`, `max`, and default; `ContentSlice` preserves open depth and detached roots.
- **Internal shape and invariant:** compiled content programs reduce rules to allowed element types, text/unknown flags, global cardinality, defaults, and cached shortest wrapper plans; insertion fits before publication.
- **Evidence:** `packages/plite/src/interfaces/schema.ts:174`, `packages/plite/src/interfaces/schema.ts:186`, `packages/plite/src/interfaces/editor.ts:492`, `packages/plite/src/interfaces/editor.ts:1021`, `packages/plite/src/core/schema-compiler.ts:286`, `packages/plite/src/core/schema-compiler.ts:457`.
- **Consumers:** paste, host codecs, fragment insertion, root construction. Plate still needs corrections for a required trailing block and single-root-block shape.
- **Proof owner:** slice fit/open-depth tests, clipboard browser contracts, large-payload and fit-locality benchmarks.
- **Local assessment:** strong fitting, weak grammar. Ordered sequence/choice/repetition and term-level cardinality are a real candidate if reference editors prove a smaller compiled model. Such a change should delete representable structural corrections, not table rectangularity repair.

### PL-11 — Properties, marks, defaults, and lifecycle laws

- **Public shape:** schema properties own value codecs/defaults/merge behavior and text lifecycle (`inclusive`, split, type change, target). Mark toggle still accepts caller-provided `clear`.
- **Internal shape and invariant:** compiled properties are keyed by owner/placement/target and can use replace or set merge semantics.
- **Evidence:** `packages/plite/src/interfaces/schema.ts:127`, `packages/plite/src/interfaces/schema.ts:143`, `packages/plite/src/interfaces/schema.ts:323`, `packages/plite/src/interfaces/editor.ts:539`, `packages/plite/src/core/schema-compiler.ts:337`, `packages/plite/src/editor/toggle-mark.ts:14`.
- **Consumers:** superscript/subscript hardcode reciprocal clearing in `packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts:22` and `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:22`; toolbar code forwards `clear` from `packages/utils/src/react/hooks/useMarkToolbarButton.ts:8`.
- **Proof owner:** property lifecycle/merge tests, mark typing browser tests, Yjs set-valued property tests.
- **Local assessment:** rearchitect candidate. Mutual exclusion/cardinality belongs in compiled property relations; callers should not enumerate peer marks.

### PL-12 — Canonical representation and corrections

- **Public shape:** extensions declare corrections; callers insert plain JSON and rely on schema-aware construction/fitting.
- **Internal shape and invariant:** adjacent compatible text leaves merge, required spacer leaves are inserted, minimum/default content is constructed, and correction work is localized.
- **Evidence:** `packages/plite/src/core/representation.ts:101`, `packages/plite/src/core/representation.ts:286`, `packages/plite/src/interfaces/editor.ts:2125`, `packages/plite/src/core/editor-extension.ts:1575`.
- **Consumers:** core representation, tables, lists, trailing blocks, single-block mode.
- **Proof owner:** representation laws, correction contracts, correction-worklist benchmark, browser DOM-shape contracts.
- **Local assessment:** preserve corrections for semantic invariants. Delete correction loops only where a richer compiled grammar can enforce the invariant during construction.

### PL-13 — Extension configuration and atomic publication

- **Public shape:** immutable extension descriptors with name, config/options, schema, dependencies/conflicts, lifecycle, resources, and `editor.extend(...)`.
- **Internal shape and invariant:** a detached registry and schema are compiled, validated, staged, activated, committed, finalized, or fully rolled back. Published API factories become visible atomically.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1954`, `packages/plite/src/interfaces/editor.ts:2072`, `packages/plite/src/interfaces/editor.ts:2097`, `packages/plite/src/core/editor-extension.ts:1575`, `packages/plite/src/core/editor-extension.ts:1757`, `packages/plite/src/core/editor-extension.ts:1920`, `packages/plite/src/core/editor-extension.ts:2194`.
- **Consumers:** every host package and Plate plugin preset.
- **Proof owner:** extension configuration/rollback/replacement tests and generic type contracts.
- **Local assessment:** preserve atomic publication. Investigate descriptor identity and resource-specific ordering; the global `priority` number currently reorders every resource owned by an extension.

### PL-14 — Typed extension API, state, and transaction groups

- **Public shape:** extensions contribute structurally typed `api`, `state`, and `tx` namespaces inferred into the installed editor. `editor.api.foo`, `state.foo`, and `tx.foo` are the normal paths; `getApi(extension)` offers descriptor-directed access.
- **Internal shape and invariant:** factories resolve against one provisional configuration and publish together; duplicate names use installed-resolution rules.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1871`, `packages/plite/src/interfaces/editor.ts:1895`, `packages/plite/src/interfaces/editor.ts:1900`, `packages/plite/src/interfaces/editor.ts:2304`, `packages/plite/src/create-editor.ts:559`.
- **Consumers:** history, React, DOM, Yjs, Plate plugins.
- **Proof owner:** generic extension install/API inference contracts and public type snapshots.
- **Local assessment:** preserve structural namespaces. `getApi` has almost no production use outside React runtime setup and duplicates `editor.api`; compare whether descriptor-scoped capability access earns its public cost.

### PL-15 — Typed command descriptors and dispatch

- **Public shape:** `defineCommand(id, { prepare, build })`; extensions register ordinary `handle` fallback or explicit `around` continuation; handlers return only `false | TransactionSpec`.
- **Internal shape and invariant:** descriptors own identity; IDs reject cross-descriptor collisions; continuation is available only to `around`; delegation is single-use; cycles/depth are guarded; the final spec publishes once.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1708`, `packages/plite/src/interfaces/editor.ts:1710`, `packages/plite/src/interfaces/editor.ts:1717`, `packages/plite/src/interfaces/editor.ts:1744`, `packages/plite/src/core/command-definition.ts:76`, `packages/plite/src/core/command-registry.ts:57`, `packages/plite/src/core/command-registry.ts:122`, `packages/plite/src/core/command-registry.ts:132`.
- **Consumers:** core commands and Plate plugin command policy.
- **Proof owner:** command contracts, type inference, recursion/delegation tests, command-dispatch benchmark.
- **Local assessment:** preserve. This already implements the pure typed command direction the audit should demand.

### PL-16 — Query middleware

- **Public shape:** `EditorExtension.queries` mirrors nearly every node/point/range/text/fragment/mark query and supplies `next`.
- **Internal shape and invariant:** per-method chains enforce at most one delegation and wrap generators.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:1367`, `packages/plite/src/interfaces/editor.ts:1434`, `packages/plite/src/interfaces/editor.ts:1494`, `packages/plite/src/interfaces/editor.ts:1510`, `packages/plite/src/core/query-middleware.ts:124`.
- **Consumers:** only five production registrations were found: override merge policy (`packages/core/src/lib/plugins/override/OverridePlugin.ts:499`), diff fragment export (`packages/diff/src/lib/excludeDiffFromFragment.ts:30`), table fragment export and marks (`packages/table/src/lib/BaseTablePlugin.ts:2543`, `packages/table/src/lib/BaseTablePlugin.ts:3046`), and toggle selectability (`packages/toggle/src/react/TogglePlugin.tsx:100`).
- **Proof owner:** query middleware tests plus each owning Plate package.
- **Local assessment:** hard-cut candidate. Five heterogeneous policies do not justify a public interception matrix for the entire read API. Route each policy to its actual owner, then delete the generic registry.

### PL-17 — Facets and dependency-aware derived state

- **Public shape:** typed facets with providers, combine/compare behavior, and explicit dependencies.
- **Internal shape and invariant:** per-editor/per-provider caches invalidate only when declared dependencies change; cycles are diagnosed; draft configuration owns a separate cache.
- **Evidence:** `packages/plite/src/core/facet.ts:17`, `packages/plite/src/core/facet.ts:38`, `packages/plite/src/core/facet.ts:203`, `packages/plite/src/core/facet.ts:248`, `packages/plite/src/core/facet.ts:295`.
- **Consumers:** configuration-derived behavior and optional host data.
- **Proof owner:** facet dependency/cache/cycle tests.
- **Local assessment:** preserve explicit dependencies. Automatic dependency tracking would add magic and weaker agent readability.

### PL-18 — State fields, effects, annotations, and value codecs

- **Public shape:** descriptor-owned typed fields, effects, update annotations, and versioned JSON codecs.
- **Internal shape and invariant:** shared fields require persistence; encoded values are JSON-compatible and version checked; effects own invert/map/codec behavior.
- **Evidence:** `packages/plite/src/core/state-field.ts:20`, `packages/plite/src/core/state-field.ts:42`, `packages/plite/src/core/value-codec.ts:298`, `packages/plite/src/core/value-codec.ts:344`, `packages/plite/src/core/transaction-values.ts:38`.
- **Consumers:** history, Yjs shared effects, layout settings, plugin state.
- **Proof owner:** field/effect/annotation/value-codec tests and history/Yjs persistence tests.
- **Local assessment:** preserve. These are the typed replacement for ad hoc metadata.

### PL-19 — Commits, lazy impact queries, and subscriptions

- **Public shape:** commits expose snapshots, canonical changes/inverse changes, effects, tags, selection, version, and lazy `changed` queries. Subscriptions can target commits or snapshots.
- **Internal shape and invariant:** paths, runtime IDs, and top-level ranges derive lazily from canonical changes plus snapshot indexes; no eager operation impact bag is authoritative.
- **Evidence:** `packages/plite/src/interfaces/editor.ts:2509`, `packages/plite/src/interfaces/editor.ts:2546`, `packages/plite/src/interfaces/editor.ts:2560`, `packages/plite/src/core/commit.ts:967`.
- **Consumers:** React selectors/projections, DOM scheduling, history, Yjs, layout.
- **Proof owner:** commit-change query/subscription tests, selector contracts, rendering benchmarks.
- **Local assessment:** preserve. Reference invalidation systems must beat this on measured locality without introducing a second change truth.

### PL-20 — Host codecs and clipboard

- **Public shape:** `ContentSlice` is the host-neutral payload; `defineHostCodec` in `@platejs/plite-dom` owns MIME parse/query/serialize and schema ownership. However `@platejs/plite` itself still exposes `DataTransfer`, clipboard middleware, `api.clipboard`, and host-codec-specific lifecycle errors.
- **Internal shape and invariant:** codecs compile atomically by format/ownership and parse intact slices before contextual fitting. Core still builds a generic clipboard chain.
- **Evidence:** `packages/plite-dom/src/plugin/host-codec.ts:92`, `packages/plite-dom/src/plugin/host-codec.ts:98`, `packages/plite-dom/src/plugin/host-codec.ts:113`, `packages/plite/src/interfaces/editor.ts:1912`, `packages/plite/src/interfaces/editor.ts:1929`, `packages/plite/src/interfaces/editor.ts:1941`, `packages/plite/src/interfaces/editor.ts:1972`, `packages/plite/src/interfaces/editor.ts:2108`.
- **Consumers:** media, table, CSV, Markdown, HTML, input rules, registry examples, and DOM clipboard tests.
- **Proof owner:** core clipboard contracts, DOM clipboard/codec contracts, package integration tests, browser copy/paste/drop suites.
- **Local assessment:** preserve `ContentSlice` and host codecs; move all `DataTransfer` and clipboard middleware ownership out of core. Core should expose pure slice construction/fitting only.

### PL-21 — DOM mapping, geometry, coverage, and scheduling

- **Public shape:** installed `editor.api.dom` provides nullable `resolve*` and throwing `assert*` conversions, geometry, focus, scrolling, and mounted-root access. `DOMCoverage` declares what hidden or virtualized content can support.
- **Internal shape and invariant:** one renderer-neutral `DOMRootRuntime` owns a mounted root, generation guards, input runtime, integrity observer, and a four-phase bounded scheduler: model, DOM read, DOM write, selection repair.
- **Evidence:** `packages/plite-dom/src/plugin/dom-editor.ts:111`, `packages/plite-dom/src/plugin/dom-editor.ts:117`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:9`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:37`, `packages/plite-dom/src/plugin/dom-phase-scheduler.ts:109`, `packages/plite-dom/src/plugin/dom-root-runtime.ts:180`, `packages/plite-dom/src/plugin/dom-coverage.ts:33`.
- **Consumers:** React renderer, layout, browser handle, product floating UI.
- **Proof owner:** DOM public-surface/mapping/coverage/scheduler contracts and browser selection/geometry suites.
- **Local assessment:** preserve. The nullable/required pair is clean and the internal runtime boundary is earned.

### PL-22 — Browser input, composition, selection, and DOM repair

- **Public shape:** mostly host-owned through `<Editable>` and DOM APIs; browser tests access a typed handle rather than internal controllers.
- **Internal shape and invariant:** event families pass through an editing kernel, runtime event engine, version-guarded repair engine, root engine, and scheduler-owned selection export. Composition, native input, mutation ownership, and repair are explicit states.
- **Evidence:** `packages/plite-react/src/editable/editing-kernel.ts:50`, `packages/plite-react/src/editable/runtime-event-engine.ts:69`, `packages/plite-react/src/editable/runtime-repair-engine.ts:13`, `packages/plite-react/src/editable/runtime-root-engine.ts:79`, `packages/plite-react/src/editable/editable-dom-runtime.ts:53`.
- **Consumers:** desktop/mobile input, IME, Android, Firefox/WebKit repairs, partial DOM.
- **Proof owner:** package contract tests plus Chromium, Firefox, WebKit, mobile-viewport, and raw-device proof lanes.
- **Local assessment:** preserve behavior and explicit state. File count is not evidence of overarchitecture here; any simplification must retain the full browser matrix.

### PL-23 — React provider, rendering, and selectors

- **Public shape:** `withReact`, `<Plite>`, `<Editable>`, immutable selector hooks, node selectors, and typed render callbacks.
- **Internal shape and invariant:** runtime/view ownership is separate from core state; selector subscriptions scope by commit kind and runtime ID; text rendering can skip synced-but-unchanged leaves.
- **Evidence:** `packages/plite-react/src/plugin/with-react.ts:27`, `packages/plite-react/src/components/plite.tsx:241`, `packages/plite-react/src/components/editable-text-blocks.tsx:649`, `packages/plite-react/src/hooks/use-editor-selector.tsx:29`, `packages/plite-react/src/hooks/use-node-selector.tsx:19`.
- **Consumers:** Plate and Plite examples.
- **Proof owner:** React public/type contracts, render-profiler tests, browser render/selection suites.
- **Local assessment:** preserve React as a host package. Compare Lexical/ProseMirror view invalidation only with measured render locality.

### PL-24 — Decorations, projections, annotations, and widgets

- **Public shape:** separate decoration, annotation, widget, and projection concepts with source hooks and stores.
- **Internal shape and invariant:** one private mapped-view-store kernel shares mapping, invalidation, keyed/global subscriptions, lifecycle, and optional-source fault isolation without collapsing the public concepts.
- **Evidence:** `packages/plite-react/src/mapped-view-store.ts:12`, `packages/plite-react/src/mapped-view-store.ts:28`, `packages/plite-react/src/projection-store.ts:31`, `packages/plite-react/src/hooks/use-plite-decoration-source.ts:18`, `packages/plite-react/src/hooks/use-plite-annotation-store.tsx:12`, `packages/plite-react/src/hooks/use-plite-widget-store.tsx:13`.
- **Consumers:** comments, remote cursors, search, diff, layout projections.
- **Proof owner:** mapped-store/projection/decorations tests and render locality benchmarks.
- **Local assessment:** preserve the shared private substrate and separate public vocabulary.

### PL-25 — History, inversion, mapping, and persistence

- **Public shape:** `history()` installs `state.history` and `tx.history`; batches store canonical inverse changes, selections, roots, and effects; `History.toJSON/fromJSON` is versioned.
- **Internal shape and invariant:** history maps remote changes, validates schema identity, persists only registered effects/selections, bounds depth, and publishes immutable revisions.
- **Evidence:** `packages/plite-history/src/history.ts:24`, `packages/plite-history/src/history.ts:39`, `packages/plite-history/src/history.ts:49`, `packages/plite-history/src/history.ts:100`, `packages/plite-history/src/history-extension.ts:61`, `packages/plite-history/src/history-extension.ts:70`, `packages/plite-history/src/history-codec.ts:211`.
- **Consumers:** React preset, Plate, Yjs.
- **Proof owner:** history package contracts, persistence/mapping/merge tests, depth benchmark, browser undo/redo scenarios.
- **Local assessment:** preserve. History is change-based and serializable without live class identity.

### PL-26 — Yjs collaboration, awareness, and remote changes

- **Public shape:** a normal extension contributes `state.yjs` and `tx.yjs`; options cover provider/doc, roots, awareness, tracing, and shared effects.
- **Internal shape and invariant:** local canonical changes lower to Yjs; captured Yjs events import as canonical changes with explicit bounded fallback reasons; schema identity and set-valued properties are checked; lifecycle is rollback-aware.
- **Evidence:** `packages/yjs/src/core/change-bridge.ts:37`, `packages/yjs/src/core/change-bridge.ts:72`, `packages/yjs/src/core/change-bridge.ts:111`, `packages/yjs/src/core/event-change-bridge.ts:67`, `packages/yjs/src/core/event-change-bridge.ts:77`, `packages/yjs/src/core/event-change-bridge.ts:1769`, `packages/yjs/src/core/controller.ts:115`, `packages/yjs/src/core/extension.ts:92`.
- **Consumers:** collaboration plugins and remote cursor React projection.
- **Proof owner:** Yjs event/change bridge tests, multi-root/schema/effect tests, collaboration browser proof, 10k sparse-change benchmark.
- **Local assessment:** preserve Yjs as the collaboration engine. Do not replace it with a central OT system.

### PL-27 — Layout, pagination, and partial DOM rendering

- **Public shape:** versioned page settings/break snapshots, layout engines, projections, React hooks, `PagedEditable`, and mount plans.
- **Internal shape and invariant:** layout is derived state; selected/composing pages pin; viewport overscan chooses mounted pages; connection is deferred until React commit.
- **Evidence:** `packages/plite-layout/src/index.ts:45`, `packages/plite-layout/src/index.ts:358`, `packages/plite-layout/src/index.ts:525`, `packages/plite-layout/src/index.ts:3045`, `packages/plite-layout/src/index.ts:3471`, `packages/plite-layout/src/page-mount-plan.ts:59`, `packages/plite-layout/src/layout-runtime-lifecycle.ts:9`, `packages/plite-layout/src/react.tsx:121`.
- **Consumers:** pagination examples and large-document renderer.
- **Proof owner:** layout unit tests, pagination browser scenarios, huge-document and mount-plan benchmarks.
- **Local assessment:** preserve the host package and derived model. `packages/plite-layout/src/index.ts` is a 4k-line mixed owner and deserves architecture-cleanup, but file layout alone is not a cross-editor architectural proposal.

### PL-28 — Hyperscript and fixture authoring

- **Public shape:** JSX fixture factories produce plain editor values, selections, and editor instances.
- **Internal shape and invariant:** fixture syntax lowers to public JSON and editor construction rather than introducing a second document model.
- **Evidence:** `packages/plite-hyperscript/src/index.ts:1`, `packages/plite-hyperscript/src/hyperscript.ts:1`.
- **Consumers:** core/history fixtures and donor parity tests.
- **Proof owner:** hyperscript fixture suites.
- **Local assessment:** preserve if it continues to pay for fixture readability; it is proof tooling, not runtime architecture.

### PL-29 — Browser contracts, harnesses, and release proof

- **Public shape:** declarative feature contracts, typed scenario/harness APIs, selection snapshots, native-event traces, and release-proof artifacts.
- **Internal shape and invariant:** evidence classes distinguish synthetic, viewport, persistent-profile, and direct-device claims. Zero retries prevents hidden flake.
- **Evidence:** `packages/browser/src/core/feature-contracts.ts:1`, `packages/browser/src/core/feature-contracts.ts:21`, `packages/browser/src/core/release-proof.ts:10`, `packages/browser/src/core/release-proof.ts:24`, `packages/browser/src/core/release-proof.ts:73`, `packages/browser/src/playwright/harness.ts:80`, `apps/plite/playwright.config.ts:36`, `apps/plite/playwright.config.ts:77`.
- **Consumers:** every Plite browser feature lane.
- **Proof owner:** `packages/browser`, `apps/plite/tests/plite-browser`, raw-device runner.
- **Local assessment:** preserve. This is stronger than a pile of Playwright examples because claims and evidence classes are machine-checkable.

### PL-30 — Benchmarks, CI gates, and proof orchestration

- **Public shape:** `check:plite:dev` for affected iteration, strict `check:plite`, browser matrix, target-backed benchmarks, runner contracts, and public-type snapshots.
- **Internal shape and invariant:** benchmark targets are explicit artifacts; browser work is bounded into child processes; release claims require matching proof fingerprints.
- **Evidence:** `package.json:42`, `package.json:43`, `package.json:44`, `package.json:45`, `package.json:47`, `apps/plite/package.json:5`, `apps/plite/scripts/run-plite-browser.mjs:54`, `apps/plite/scripts/plite-proof-inputs.mjs:21`, `.github/workflows/plite-ci.yml:189`.
- **Consumers:** development and release closure.
- **Proof owner:** tooling script contract tests and Plite CI.
- **Local assessment:** preserve tiered proof. Browser wall time is a tooling optimization problem, not permission to reduce coverage.

### PL-31 — Package boundaries, exports, docs, and adoption

- **Public shape:** `@platejs/plite` exports 269 top-level declarations from its public index; DOM exports 98, React 177, layout 61. Low-level internals are isolated behind explicit `/internal` entrypoints.
- **Internal shape and invariant:** core remains the intended DOM-free substrate; host packages depend inward; Plate owns product schema/plugins/UI.
- **Evidence:** `packages/plite/src/index.ts:1`, `packages/plite/src/internal/index.ts:1`, `packages/plite-dom/src/index.ts:1`, `packages/plite-dom/src/internal/index.ts:1`, `packages/plite-react/src/index.ts:1`, `packages/plite-layout/src/index.ts:1`.
- **Consumers:** all Plate packages and apps.
- **Proof owner:** public-surface contracts, generic type contracts, package build/export checks, adopter typechecks.
- **Local assessment:** mostly preserve boundaries, but audit the public width. Core clipboard types violate the intended DOM-free owner; `getApi` duplication and the layout mega-entrypoint need value tests before retention.

### PL-32 — Accessibility and assistive output

- **Public shape:** editor announcements and renderer ARIA behavior are explicit; browser proof can assert accessibility output.
- **Internal shape and invariant:** screen-reader announcements are stateful editor signals; React renders the assistive surface without storing it in document JSON.
- **Evidence:** `packages/plite/src/core/screen-reader-announcement.ts:1`, `packages/plite-react/src/components/editable-text-blocks.tsx:649`, `packages/browser/src/core/first-party-browser-contracts.ts:28`.
- **Consumers:** React editable, tables, keyboard navigation.
- **Proof owner:** announcement/accessibility unit tests and browser contracts.
- **Local assessment:** preserve explicit ownership; compare reference editors for missing browser laws, not for document-level ARIA state.

## Plite strengths that reference designs must not erase

1. Plain JSON documents with multi-root support.
2. One canonical immutable `DocumentChange` algebra shared by update, history, collaboration, selection, anchors, and invalidation.
3. Pure `TransactionSpec` construction separated from publication.
4. Compiled schema identity, validation, slice fitting, and atomic extension reconfiguration.
5. Structurally inferred extension namespaces and typed descriptor-owned commands.
6. Extensible selection kinds, explicit anchor affinity/deletion, and runtime IDs separate from serialized content.
7. Versioned state/effect/history persistence.
8. Yjs integration that imports and lowers canonical changes.
9. DOM-free rendering substrate intent, renderer-neutral root runtime, bounded DOM phases, and explicit partial-DOM coverage.
10. Separate public decoration/annotation/widget concepts backed by one private mapped-store kernel.
11. Browser evidence classes, contract registries, zero retries, and target-backed performance proof.

## Confirmed local pressure points

The source map exposes five concrete candidates before any donor comparison:

1. Core owns `DataTransfer` clipboard middleware and host-codec error details even though `@platejs/plite-dom` owns codecs and DOM transport.
2. Set-only content grammar cannot express ordered required structure, leaving some structural laws in corrections.
3. Mark mutual exclusion is repeated as caller `clear` lists instead of compiled property relations.
4. A single extension `priority` number changes ordering across unrelated resource lanes.
5. Generic query middleware mirrors the entire read API for five heterogeneous production registrations.

Those are pressure findings, not accepted cross-editor proposals. The detailed current-versus-candidate shapes and deletion/adoption ledgers are in `plite-pressure-audit.md`.
