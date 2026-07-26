# Proposal pressure review

## Verdict

The current donor and local ledgers contain **six** architecture packets that
clear the material-value gate. Two are P0, three are P1, and one is P2. The
`selection.domRange()` rename is worth doing, but it should be folded into the
selection-protocol adoption of the query-middleware cut rather than planned as
a seventh packet.

The ordered-content automaton does **not** clear the gate on current evidence.
It is the most seductive overbuild in the audit: ProseMirror proves that the
mechanism is coherent, but the retained Plate surface does not yet prove enough
present deletion or correctness value to justify a new grammar AST, NFA/DFA
compiler, prefix-state index, fitter rewrite, public match object, and full
ecosystem adoption.

| Value rank | Priority | Packet                                                                         | Pressure verdict                                                                                                                                                                                                                                                              | Primary layer plan            | Dependent layer plan                                       |
| ---------: | -------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
|          1 | P0       | Split immutable plugin options from editor-local session state                 | **Accept; revise the proposed API.** Keep the established `options` noun for immutable configuration. Add one explicit `session` owner. Do not rename options to `config` or invent runtime plugin reconfiguration in this packet.                                            | `plate-plan` after `best-api` | none unless a separate Plite reconfiguration job is proven |
|          2 | P0       | Hard-cut global Plate plugin and Plite extension priority                      | **Accept.** One scalar currently changes unrelated compilers and runtime lanes.                                                                                                                                                                                               | `plate-plan` after `best-api` | `plite-plan`                                               |
|          3 | P1       | Schema-owned exclusive text-property groups                                    | **Accept.** This is the strongest correctness pull from ProseMirror.                                                                                                                                                                                                          | `plite-plan` after `best-api` | `plate-plan`                                               |
|          4 | P1       | Hard-cut generic read-query middleware                                         | **Accept, but the current replacement proposal is not decision-ready.** Migrate all five registrations to their exact semantic owners; do not replace one generic interceptor with a generic `nodePolicy` bag. Fold `domRange` → `primaryRange` into the selection-spec work. | `plite-plan` after `best-api` | `plate-plan`                                               |
|          5 | P1       | Move clipboard transport and clipboard handlers from Plite core to `plite-dom` | **Accept.** Merge the table clipboard-internal contract from `PL-C6` into this packet.                                                                                                                                                                                        | `plite-plan` after `best-api` | `plate-plan`                                               |
|          6 | P2       | Descriptor-owned required dependency/conflict edges                            | **Accept only in narrowed form.** The installed extension descriptor is the identity; do not add a second public key descriptor, `optionalDependencies`, `context.optional`, or a service-container API.                                                                      | `plite-plan` after `best-api` | `plate-plan`                                               |

Everything else is keep, reject, or evidence-backed defer. In particular, the
four ProseMirror proof packets are valuable proof inputs, not standalone
architecture changes, and must not inflate the P0-P3 architecture ranking.

## Why these six survive

### 1. Immutable options versus session state — accept P0

The current public ontology says one value is both compiler input and mutable
runtime state:

- `PluginBase.options` is documented as mutable runtime state at
  `packages/core/src/lib/plugin/PluginConfig.ts:208-224`.
- Schema factories receive the same options as immutable inputs at
  `packages/core/src/lib/plugin/PluginConfig.ts:390-400`.
- HTML callbacks receive them as immutable inputs at
  `packages/core/src/lib/plugin/PluginConfig.ts:854-861`.
- `PluginBaseContext` exposes `getOption`, `getOptions`, `setOption`, and
  `setOptions` at `packages/core/src/lib/plugin/PluginConfig.ts:458-492`.
- Runtime writes update a separate editor-local Zustand store at
  `packages/core/src/lib/plugin/getEditorPlugin.ts:229-299` and
  `packages/core/src/internal/plugin/pluginOptionsStore.ts:10-16,120-149`.
- The live census found 166 production mutation lines in 40 files, including
  AI, uploads, DnD, selection, links, suggestions, and find/replace.

That is not harmless naming debt. A write to a schema/codec input does not
recompile the published model, while a write captured by a runtime closure can
take effect immediately.

The current dossier's proposed rename from `options` to `config` is needless
breakage. `options` is already Plate's established immutable authoring noun and
is explicitly favored by current API doctrine. The clean target is:

```ts
import { createPlatePlugin, usePluginSession } from "@platejs/core/react";

export const PlaceholderPlugin = createPlatePlugin({
  key: "placeholder",
  options: {
    disableFileDrop: false,
    upload: uploadConfig,
  },
  session: {
    error: null as UploadError | null,
    uploadingFiles: {} as Record<string, File>,
  },
});

const placeholder = editor.plugin(PlaceholderPlugin);

placeholder.options.disableFileDrop; // readonly
placeholder.session.set({ uploadingFiles });

const files = usePluginSession(
  PlaceholderPlugin,
  (session) => session.uploadingFiles
);
```

The final `best-api` pass may choose the exact session selector spelling, but
the following laws are fixed:

```ts
type CompiledPlatePlugin<O, S> = Readonly<{
  options: DeepReadonly<O>;
  sessionInitial: DeepReadonly<S>;
  sessionSelectors: Readonly<Record<string, unknown>>;
}>;

type InstalledPlatePlugin<O, S> = Readonly<{
  descriptor: CompiledPlatePlugin<O, S>;
  options: DeepReadonly<O>;
  session: PluginSessionStore<S>;
}>;
```

- `options` are snapshotted once per compiled descriptor publication.
- `session` is one editor-local ephemeral store.
- Session writes never change schema, codecs, history, Yjs, persistence, or
  configuration fingerprints.
- Persistent semantic state remains document properties, state fields, or
  typed effects.
- The existing `PluginConfig.state` generic continues to mean state-bound read
  groups; it must not be silently repurposed as mutable storage.

Hard deletions:

- mixed `getOption`, `getOptions`, `setOption`, and `setOptions`;
- the mixed `PluginOptionsStore` owner and four mixed React option hooks;
- tests that celebrate divergence between compiled options and runtime options;
- live closures that treat configuration writes as if they republished a model.

The packet must classify every mutated key as immutable options, session state,
document state, field/effect state, or app state. A raw count is not an adoption
ledger.

The proposed `tx.plugins.reconfigure(...)` example must be removed. No current
Plate application job proves that public API, and runtime plugin reconfiguration
is a separate atomic-publication decision, not a side effect of fixing the
options/session lie.

### 2. Global priority — accept P0

`BasePlugin.priority` controls plugin graph ordering, weak overrides, component
overrides, shortcuts, input rules, MIME codecs, and HTML codecs:

- public contract: `packages/core/src/lib/plugin/PluginConfig.ts:211-224`;
- shortcut fallback:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1083-1084`;
- input-rule fallback:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1133-1169`;
- component wins:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1296-1328`;
- weak override order:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1420-1461`;
- dependency ready queue:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1810-1818`;
- MIME codec order:
  `packages/core/src/internal/plugin/compilePlateCodecs.ts:132-150`;
- HTML codec order:
  `packages/core/src/internal/plugin/compilePlateHtmlCodec.ts:650-665`.

Plite repeats the problem with `EditorExtension.priority` and globally sorts
extension records before dependency traversal at
`packages/plite/src/core/editor-extension.ts:1236-1269`.

The target public shape is simply the absence of global priority:

```ts
import { createBasePlugin } from "@platejs/core";
import { defineEditorExtension } from "@platejs/plite";

export const FeaturePlugin = createBasePlugin({
  key: "feature",
  dependencies: [DependencyPlugin],
  shortcuts: {
    toggle: { keys: "mod+k", priority: 20 },
  },
  inputRules: [{ ...rule, priority: 30 }],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "text/html": {
        decode,
        encode,
        match,
        priority: 10,
      },
    }),
});

export const FeatureExtension = defineEditorExtension({
  name: "feature-runtime",
  dependencies: [DependencyExtension],
});
```

The internal target is:

```ts
type CompiledOrder = Readonly<{
  dependencyOrder: readonly EditorExtensionDescriptor[];
  sourceOrder: ReadonlyMap<EditorExtensionDescriptor, number>;
}>;
```

- required dependencies determine legality and topological order;
- source/configuration order is the stable tie-break for unrelated owners;
- each capability compiler owns any precedence it actually needs;
- ambiguous exclusive claims reject at the compiler that understands them;
- command `handle`/`around` order comes from extension configuration.

The current Plate sample in `PL-C2` still shows string Plite dependencies. The
final shape must use the descriptor graph from packet 6. The global-priority cut
must also enumerate every intentional local ordering that replaces a current
fallback; otherwise it silently changes behavior.

### 3. Exclusive text-property groups — accept P1

Current subscript and superscript commands name and clear each other at
`packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts:20-28` and
`packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts:20-28`. Core publicly
accepts caller-owned `clear` and performs the removal loop at
`packages/plite/src/editor/toggle-mark.ts:14-55`.

The final proposal should prefer one schema relation over a generic cardinality
framework:

```ts
import { createBasePlugin } from "@platejs/core";
import { property, schema } from "@platejs/plite";

export const ScriptPosition = schema.property.exclusive(
  "plate:script-position"
);

export const BaseSubscriptPlugin = createBasePlugin({
  key: "subscript",
  schema: {
    mark: {
      exclusive: [ScriptPosition],
      property: property.boolean({ default: false, omitDefault: true }),
    },
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.marks.toggle(type),
  }),
});
```

The relation belongs beside the schema property declaration, not inside the
reusable value descriptor. `schema.property.exclusive()` means at most one
active member. Do not expose speculative `"one" | "at-most-one"` cardinality:
subscript/superscript may both be absent, and no current job needs a more
general property-group algebra.

```ts
type SchemaPropertyExclusiveGroup<TId extends string = string> = Readonly<{
  id: TId;
  kind: "schema-property-exclusive";
}>;

type CompiledSchemaPropertyRelations = Readonly<{
  conflictsByPropertyId: ReadonlyMap<string, ReadonlySet<string>>;
  membersByExclusiveGroup: ReadonlyMap<string, ReadonlySet<string>>;
}>;
```

Every write path uses one schema canonicalizer. Ordered explicit writes are
incoming-wins; unordered external values containing several members reject
with all conflicting property IDs; Yjs resolves concurrent inputs
deterministically before publication. No object-key, schema-declaration, or
plugin order is allowed to become the winner policy.

This packet's existing ProseMirror dossier already has the strongest internal
shape. The cross-editor result should use that one and delete the competing
`propertyGroup(...).member(...)` and generic-cardinality proposals from the
other draft artifacts.

### 4. Generic read-query middleware — accept P1 with a hard shape gate

The current public `EditorQueryMiddlewareMap` mirrors 43 read methods at
`packages/plite/src/interfaces/editor.ts:1367-1559`, and
`packages/plite/src/core/query-middleware.ts` builds recursive continuation
chains and generator wrappers. Production has only five registrations:

1. Plate delete/merge policy at
   `packages/core/src/lib/plugins/override/OverridePlugin.ts:500-529`;
2. toggle selectability at
   `packages/toggle/src/react/TogglePlugin.tsx:100-109`;
3. diff copy projection at
   `packages/diff/src/lib/excludeDiffFromFragment.ts:30-39`;
4. table selection fragment projection at
   `packages/table/src/lib/BaseTablePlugin.ts:2543-2581`;
5. table selection marks at
   `packages/table/src/lib/BaseTablePlugin.ts:3046-3088`.

The deletion value is real, but neither `PL-C3` nor the Plite pressure audit has
finished the replacement shape. A generic `nodePolicy` object containing
unrelated selectability and merge decisions is the same mistake with fewer
methods.

The required ownership map is:

| Current registration      | Required target owner                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| merge-target query        | existing typed delete command policy, or one narrow merge-target descriptor only if the core merge algorithm cannot be expressed by the command |
| toggle selectability      | one narrow dynamic selectability policy consulted only by navigation/selection                                                                  |
| diff fragment projection  | one typed `ContentSlice` export projection                                                                                                      |
| table fragment projection | the `table-cell` selection spec                                                                                                                 |
| table marks projection    | the `table-cell` selection spec                                                                                                                 |

The table selection spec should become the exact advanced shape:

```ts
import type { EditorSelectionSpec } from "@platejs/plite";

const tableSelection = {
  codec,
  kind: "table-cell",
  map,
  marks(selection, state) {
    return getSharedCellMarks(selection, state);
  },
  primaryRange(selection) {
    return { anchor: selection.anchor, focus: selection.anchor };
  },
  ranges: (selection) => selection.cells,
  replacementRange: (selection) => selection,
  slice(selection, state) {
    return getSelectedCellSlice(selection, state);
  },
  validate: isTableCellSelection,
} satisfies EditorSelectionSpec<TableCellSelection>;
```

This is also the correct time to hard-cut the misleading `domRange` name.
`primaryRange` returns a Plite model range; actual DOM conversion remains
`editor.api.dom.resolveDOMRange(range)`.

Before the parent audit calls this packet decision-ready, it must show a full
before/after example for **all five** registrations and freeze the reducer/veto
semantics of every surviving narrow descriptor. “Exact names need best-api” is
an open gate, not a final proposal.

### 5. Clipboard transport ownership — accept P1

Plain `@platejs/plite` currently exports `DataTransfer` contracts and always
installs `editor.api.clipboard`:

- clipboard types at `packages/plite/src/interfaces/editor.ts:1912-1952`;
- core API group at `packages/plite/src/interfaces/editor.ts:1941-1943`;
- core extension slot at `packages/plite/src/interfaces/editor.ts:2107-2109`;
- generic capability lowering at
  `packages/plite/src/core/editor-extension.ts:841-861`.

Actual MIME codecs, exact-fragment transport, DOM serialization, and browser
policy live in `@platejs/plite-dom`. Core is not DOM-free while its mandatory
public API names `DataTransfer`.

The final public dossier needs all three paths:

```ts
import { createEditor } from "@platejs/plite";

const headless = createEditor({ value });
// No headless.api.clipboard.
```

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";
import { clipboardHandler, dom } from "@platejs/plite-dom";

const imageClipboard = defineEditorExtension({
  name: "image-clipboard",
  outputs: [
    clipboardHandler({
      insertData(data, { next, transaction }) {
        return insertImageData(data, transaction) || next(data);
      },
    }),
  ],
});

const editor = createEditor({
  extensions: [dom(), imageClipboard],
  value,
});

editor.api.clipboard.insertData(dataTransfer);
```

```ts
import { createBasePlugin } from "@platejs/core";

export const ImagePlugin = createBasePlugin({
  clipboard: {
    insertData(data, context) {
      return insertPlateImageData(data, context);
    },
  },
  key: "image",
});
```

Plate may retain `clipboard` as authoring sugar, but its compiler must lower it
to the typed `plite-dom` output. It must not lower into a Plite-core extension
slot.

This packet should absorb the table half of `PL-C6`: public
`editor.api.clipboard.readSlice/writeSlice` owns the exact MIME envelope, while
table owns CSV/TSV semantics. Do not publish the renderer commit-claim protocol
in the same packet.

The internal target is a typed host-owned output chain:

```ts
type DOMClipboardHandler = Readonly<{
  insertData(data: DataTransfer, context: DOMClipboardContext): boolean;
}>;

type DOMExtensionRuntime = Readonly<{
  handlers: readonly DOMClipboardHandler[];
  hostCodecs: readonly HostCodecRegistration[];
}>;
```

The typed aggregate-output token may be a generic Plite primitive internally,
but the common public author sees `clipboardHandler` and `hostCodecs`, not
`capabilities<T>(string)`.

### 6. Typed extension descriptor graph — accept P2, narrowed

Current Plite dependency, peer, and conflict edges are strings at
`packages/plite/src/interfaces/editor.ts:2117-2132`. Missing peers throw exactly
like missing required dependencies at
`packages/plite/src/core/editor-extension.ts:770-805,1272-1298`.
`capabilities<T>(name)` lets the consumer assert a type unrelated to the
provider at `packages/plite/src/interfaces/editor.ts:1958-1998`. Plate already
authors required plugin edges with descriptors and lowers them back to names.

The smallest truthful graph is:

```ts
import { createEditor, defineEditorExtension } from "@platejs/plite";

export const HostExtension = defineEditorExtension({
  api: {
    host: {
      read: () => "host",
    },
  },
  name: "host",
});

export const ConsumerExtension = defineEditorExtension({
  dependencies: [HostExtension],
  name: "consumer",
});

const editor = createEditor({
  extensions: [ConsumerExtension],
  value,
});

editor.getApi(HostExtension).host.read();
```

Required descriptor dependencies install transitively and determine order.
Conflicts also use descriptors. The extension returned by
`defineEditorExtension` is already the identity; a separate
`defineExtensionKey()` adds a public noun without a user job.

Hard-cut `peerDependencies`. Current behavior is required, while genuinely
optional product capability remains ordinary omission from the consumer's
extension/plugin array. Do not import Lexical's `optionalDependencies`,
`declarePeerDependency`, `context.optional`, or `getPeer` model; it conflicts
with Plate's explicit product-composition law and would turn the extension
context into a service locator.

Keep typed aggregate outputs separate from dependency API access. Only host
codecs currently use generic capabilities, so the output-token work belongs in
the clipboard/host-codec packet unless a second independent aggregate output is
proven.

## Merge and split decisions

| Existing draft rows                                                          | Decision                                                                                                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PL-C1` config/session                                                       | Keep one packet, but retain `options`, introduce `session`, delete invented runtime reconfigure.                                                        |
| Plate and Plite global-priority rows                                         | Merge into one cross-layer P0 packet with `plate-plan` primary and `plite-plan` dependent.                                                              |
| Lexical typed dependency candidate plus Plite descriptor/output candidate    | Split. Keep descriptor required/conflict graph as P2. Move host aggregate outputs into clipboard/codec ownership. Reject optional-dependency machinery. |
| `PL-C3` generic query cut plus `selection.domRange()` rename                 | Merge the rename into selection-spec adoption. Do not create a standalone P3 plan.                                                                      |
| Clipboard owner move plus `PL-C6` table clipboard helpers                    | Merge. One host transport owner should delete both internal leaks.                                                                                      |
| `PL-C6` changed-root/root-scope helpers                                      | Defer separately. The proposed ambient root scope risks publicizing an implementation detail and has one production feature consumer.                   |
| Ordered grammar rows from Plite, Plate, and ProseMirror                      | Merge as one evidence-backed defer, not P1 work.                                                                                                        |
| ProseMirror generated fitter, browser, history/Yjs, and clipboard proof rows | Remove from architecture ranking; attach to surviving packet proof or the test-harvester backlog.                                                       |
| Portal cache and descriptor-kernel consolidation                             | Keep as benchmark/cleanup defers, not cross-editor architecture packets.                                                                                |

## Ordered grammar — defer, do not promote

ProseMirror's regular child language is stronger than Plite's current
set-plus-global-cardinality program. That classification is correct. Promotion
is not.

Current retained evidence is too weak:

- the strongest invalid-order example is `packages/list-classic`, which current
  API doctrine marks maintenance-only and forbids as a target-architecture
  investment driver;
- modern list, table, code-block, layout, media, callout, and inline schemas in
  the production census use homogeneous child classes or one repeated concrete
  type;
- `TrailingBlockPlugin` is retained, but its dynamic `level`, `match`, and
  custom insertion behavior at
  `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts:18-90`
  is only partly a regular grammar;
- `SingleBlockPlugin` and `SingleLinePlugin` combine cardinality with merge,
  newline, and command behavior at
  `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts:6-58` and
  `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts:6-74`;
- `NormalizeTypesPlugin` is path-specific product policy, not a child-language
  expression.

The proposal adds a new public pattern language, automaton compiler, filler
search, wrapper search, prefix-state document caches, fitter integration,
schema fingerprinting, codec adoption, reconfiguration validation, and every
Plate schema migration. Its claimed deletions are mostly replacement of the
current simpler schema compiler, not net deletion. One partially expressible
trailing-block correction does not pay that bill.

Reopen only when a retained Plate/Plite owner supplies:

1. a named structure whose valid children require order/alternation/repetition;
2. a current fit, validation, paste, external-value, or collaboration failure;
3. a typed-pattern prototype proving the common call remains small;
4. a deletion ledger larger than the new machinery;
5. large-parent validation/fitting measurements showing prefix-state caching is
   necessary rather than speculative.

If reopened, steal ProseMirror's language semantics but keep the typed frozen
AST; never adopt strings, classes, integer positions, or schema rank.

## Proof packets are not architecture packets

The ProseMirror ledger promotes four proof-only rows to P2/P3. That weakens the
audit's ownership model:

| Proof lead                              | Correct destination                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| generated structural fitting laws       | proof for the existing fitter and any later accepted schema packet; test-harvester owns translation/provenance |
| browser composition/DOM-change gauntlet | closure proof for the explicitly retained Plite input/repair runtime                                           |
| history/Yjs rebase and compression laws | closure proof for the retained `DocumentChange`/history/Yjs architecture                                       |
| clipboard context/security corpus       | proof for the clipboard host-owner packet                                                                      |

No public or internal architecture shape changes in those rows. They therefore
cannot satisfy the editor-audit P0-P3 candidate contract by repeating an
unchanged public call and adding a test loop. Keep them visible in proof, but
remove them from the ranked architecture count.

## Evidence-backed defers and rejects

| Lead                                                                                                         | Verdict                                                                                                               | Exact reopen gate                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| changed-root enumeration and root-scoped update                                                              | Defer. One list consumer currently imports internals, but the proposed ambient scope may expose implementation state. | A second extension-author consumer or a best-api design that avoids ambient mutation and fits the multi-root transaction model.               |
| compiled plugin portals                                                                                      | Defer. 271 call-site lines do not prove proxy construction is material.                                               | Stable-identity or hot-call benchmark showing measured cost, plus a cache lifecycle that remains correct through publication/reconfiguration. |
| one internal plugin descriptor kernel                                                                        | Route to `architecture-cleanup`, not editor-audit ranking.                                                            | Concrete declaration-size, TypeScript compile-time, inference, or defect reduction.                                                           |
| bulk anchor registry                                                                                         | Defer. Shared indexes already exist.                                                                                  | A current benchmark proving anchor mapping/listener work remains material.                                                                    |
| layout file split                                                                                            | Route to `architecture-cleanup`.                                                                                      | Independent owners and tests that reduce navigation or defect cost without changing behavior.                                                 |
| imperative renderer                                                                                          | Defer.                                                                                                                | Real non-React consumer and funded parity/benchmark target.                                                                                   |
| snapshot traversal cursor, public offset view                                                                | Defer/reject.                                                                                                         | Named integration or profile that paths, anchors, and snapshot indexes cannot satisfy.                                                        |
| reactive extension signals                                                                                   | Reject.                                                                                                               | None while atomic publication owns configuration.                                                                                             |
| node-local state bag                                                                                         | Reject.                                                                                                               | None while schema properties, fields, facets, annotations, and projections cover the jobs.                                                    |
| Lexical file format/devtools/Dragon/product shell                                                            | Defer to named product owners.                                                                                        | Real product requirement and its own runtime/proof contract.                                                                                  |
| donor node/mark/selection/plugin classes, flat integer positions, global registries, central OT, DOM in core | Reject.                                                                                                               | These weaken JSON, structural typing, multi-root, persistence, collaboration, or host ownership.                                              |

## Dependency order

Value priority and execution order are different. The smallest coherent
execution dependency is:

1. `best-api` freezes the six surviving public shapes and closes every exact
   name/import/example gate.
2. The Plate options/session split can run independently.
3. `plite-plan` installs descriptor-owned required/conflict edges.
4. `plite-plan` plus `plate-plan` migrate the five query registrations,
   including `domRange` → `primaryRange`, then delete generic query middleware.
5. `plate-plan` plus dependent `plite-plan` remove global priority after the
   query owner and dependency order are explicit.
6. `plite-plan` moves clipboard transport and typed host output aggregation to
   `plite-dom`; `plate-plan` adopts media/table/codec contributors.
7. The exclusive-property packet can run in parallel after its `best-api`
   shape is frozen; it does not depend on the extension packets.

Do not combine all six into one layer plan. Config/session adoption alone spans
40 production files; query deletion, priority deletion, clipboard ownership,
and schema property relations have independent public breaks and proof.

## Missing full-shape gates in the current drafts

The parent audit is not decision-ready until these are repaired:

1. **Exact imports:** most Plate/Plite candidate samples omit public imports.
   Every final before/after example must compile against a named public
   entrypoint.
2. **Config/session:** current draft lacks concrete current and target internal
   types, renames `options` without value, and invents an unproven
   `tx.plugins.reconfigure` API.
3. **Priority:** current proposed Plite sample still uses string dependencies
   and does not enumerate which local compiler owns every removed fallback.
4. **Query middleware:** all five registrations need individual before/after
   shapes. A placeholder sentence saying names need `best-api` is unresolved.
5. **Clipboard:** show headless absence, DOM common use, direct Plite DOM
   extension authoring, Plate sugar, and table exact-slice adoption.
6. **Typed dependencies:** remove the conflict between P1 and P2 rankings;
   delete optional-dependency/service-locator proposals; do not add a separate
   extension-key noun.
7. **Exclusive properties:** choose one public declaration. The minimal
   exclusive descriptor beside the schema property beats generic
   cardinality/member builders.
8. **Cross-reference judgment:** every surviving packet must explicitly state
   why its target is better than Wordgard, Lexical, and ProseMirror rather than
   citing only the donor that inspired it.
9. **Proof ownership:** proof-only donor rows belong under the matching packet
   or harvester, not in the architecture priority count.
10. **Adoption completeness:** every current call-site family needs a
    classification, not only a total count. This is especially mandatory for
    the 166 option writes and every global-priority fallback.
11. **No conditional candidates:** ordered grammar, portal caching, anchor
    changes, and descriptor-kernel cleanup remain defers until their explicit
    reopen evidence exists.

With those repairs, the decision-ready audit should report six material
architecture packets, zero standalone proof packets, one merged naming cut,
and explicit keep/reject/defer closure for every other donor mechanism.

## Exact pressure findings against the parent A1–A10 dossier

Line references below point to
`docs/plans/2026-07-25-multi-editor-full-architecture-audit.md` as reviewed.

### Blocking corrections

1. **Demote `A2` from P1 to evidence-backed defer.**
   The ranking at line 444 and dossier at lines 603–734 do not clear the
   material-value gate. The local case at lines 612–614 is five heterogeneous
   corrections plus a `list-classic` ordering defect; `list-classic` is
   maintenance-only, while retained table, code, layout, media, and callout
   schemas are homogeneous or repeated-type rules. `TrailingBlockPlugin`,
   `SingleBlockPlugin`, and `SingleLinePlugin` also contain dynamic command,
   merge, match, or insertion policy that the proposed regular grammar would
   not delete. Lines 723–725 therefore overclaim net deletion and adoption.
   The sample is not executable either: `plateSchema` at line 665 is not a live
   `@platejs/core` export, and `ParagraphPlugin` at line 666 belongs to
   `@platejs/core/react`, not `@platejs/basic-nodes/react`. The hypothetical
   article grammar at lines 651–658 is not a current product job. Remove the
   false `A1 → A2` dependency at line 454 and reopen only on the five evidence
   gates in this artifact's ordered-grammar defer.

2. **Split `A3` into a P0 priority cut and a P2 descriptor graph.**
   The rank says P1 at line 445 while the dossier says P0 at line 738. More
   importantly, lines 740–746 combine two independent jobs: a globally
   overpowered priority scalar and stringly dependency identity. Hard-cut
   global priority as P0. Keep descriptor-owned required/conflict edges as P2.
   Lines 845–847 and 858–859 leave optional dependencies, optional output
   inference, presence/absence behavior, and auto-install “if retained.”
   Decision-ready architecture cannot leave those branches conditional.
   Hard-cut `peerDependencies`; do not add `optionalDependencies`,
   `context.optional`, `getPeer`, or a service locator. The descriptor returned
   by `defineEditorExtension` is already the identity. Move
   `HostCodecOutput` at lines 783–794 to `A5` unless a second independent
   aggregate-output consumer is proven.

3. **Repair `A1` without renaming `options`.**
   Lines 504–515, 531–543, and 567–578 replace Plate's established immutable
   authoring noun with `config`. That adds a broad break without value. The
   target is `options` plus editor-local `session`; the compiler and portal
   expose readonly `options`, while only `session` is mutable. The dossier must
   explicitly preserve `PluginConfig.state` as state-bound read groups, not
   repurpose it as storage. Line 596 cannot defer exact names and portal shape
   to a later `best-api` pass: this audit promised a decision-ready shape.
   Adoption must classify every one of the 166 writes as options, session,
   document, field/effect, or application state rather than treating the raw
   count as a migration ledger.

4. **Finish `A4` before calling it decision-ready.**
   Lines 899–925 invent `defineSelection`, `nodePolicy`, a generic extension
   `slice` bag, and `buildPlateDelete` without executable imports or fixed
   contracts. `defineSelection` is not a live public API, and `nodePolicy`
   risks recreating the generic bag being deleted. Lines 928–930 assert fixed
   composition semantics without specifying order, reducer, or veto rules.
   The plan must show a full before/after for all five current registrations:
   override merge, toggle selectability, diff fragment projection, table
   fragment projection, and table marks projection. Table projection can
   extend the existing `EditorSelectionSpec` directly with `marks`,
   `primaryRange`, and `slice`; no new constructor noun is required. The
   delete/merge replacement must prove the behavior of the current deep
   `shouldMergeNodesRemovePrevNode` decision instead of hiding it behind
   `buildPlateDelete(...) ?? next()`.

5. **Merge `A8` into `A4`.**
   Lines 1269–1318 touch the same `EditorSelectionSpec`, registry, and table
   adopter as `A4`. A standalone P3 packet causes two breaks over one owner.
   Lines 1283–1288 and 1296–1301 also use the nonexistent `defineSelection`.
   Make `domRange` → `primaryRange` one hard-cut adoption inside the
   selection-protocol part of `A4`, then remove `A8` from the ranking and
   packet count.

6. **Complete the Plate-facing `A5` shape.**
   Lines 1037–1038 say Plate “may keep” clipboard DSL sugar but do not show its
   import, plugin declaration, lowering contract, or table read/write adoption.
   The final dossier needs four executable public examples: core-only Plite
   with no clipboard API, common DOM-installed use, direct `plite-dom`
   extension authoring, and Plate plugin authoring. It also needs the table
   exact-slice read/write shape. Typed host output aggregation belongs inside
   this packet, so line 1079 must not force acceptance of the bundled `A3`
   output registry.

7. **Narrow `A6` to the invariant that exists.**
   Lines 1118–1121 and 1169–1173 expose a generic cardinality framework even
   though the only current job is “at most one of subscript and superscript.”
   Use one exact relation such as
   `schema.property.exclusive('plate:script-position')`, referenced beside the
   schema mark declaration. Do not expose arbitrary `max`. The public samples
   also need real `createBasePlugin`, `KEYS`, `property`, and `schema` imports.
   Line 1196 again leaves the supposedly final declaration to a later owner;
   choose the exact shape here.

8. **Demote `A7` to evidence-backed defer.**
   Lines 1202–1206 conflate two changed-root readers with one root-scope
   consumer. Node ID reads changed roots, but only list imports
   `withEditorUpdateRootScope`. Lines 1235–1250 expose `null` as the primary
   root and an ambient push/pop callback as public API. Both are suspicious:
   omitted/`undefined` is the normal public primary-root spelling, and
   `tx.inRoot(root, callback)` leaks the implementation strategy rather than
   proving the clean transaction abstraction. Reopen on a second scoped-update
   consumer or a `best-api` result that supplies a non-ambient root transaction
   view with executable adoption.

9. **Remove `A9` and `A10` from the architecture ranking.**
   Both packets explicitly have no public or product change at lines
   1331–1343 and 1399–1401/1451. Their proposed internals are invented test
   pseudocode (`browserContracts.register`, `property`, and
   `replayHistoryCollabTrace`) rather than live architecture. Attach the `A9`
   cases to the retained DOM/input proof owner and the `A10` laws to retained
   `DocumentChange`/history/Yjs proof, with `editor-test-harvester` owning donor
   translation. The Yjs bridge is a Plite integration owner; line 1457 should
   not assign its architecture to `plate-plan`.

10. **Repair the handoff and closure arithmetic.**
    Lines 374–376, 1531–1540, 1547–1549, and 1558–1561 overclaim ten material
    proposals and zero unresolved candidates. `A2` and `A7` are defers, `A8`
    merges into `A4`, and `A9`/`A10` are proof inputs. `A3` must split. The
    truthful final handoff is six architecture packets:
    immutable options/session; global-priority hard cut; exclusive schema
    properties; query-middleware hard cut plus range rename; clipboard host
    ownership; and descriptor-owned required/conflict edges.

### Revised priority and dependency order

| Order | Priority | Packet                                                          | Dependency                                                                        |
| ----: | -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
|     1 | P0       | Immutable Plate `options` / editor-local `session`              | Independent after one exact `best-api` shape                                      |
|     2 | P0       | Hard-cut global Plate/Plite priority                            | Descriptor order and all local resource precedence must be explicit first         |
|     3 | P1       | Schema-owned exclusive text properties                          | Independent after exact schema declaration is fixed                               |
|     4 | P1       | Hard-cut generic read middleware; include `primaryRange` rename | All five replacement contracts must be accepted first                             |
|     5 | P1       | Move clipboard transport to `plite-dom`                         | Typed host aggregation is owned here; descriptor graph may precede implementation |
|     6 | P2       | Descriptor-owned required/conflict graph                        | No optional dependency or service-container branch                                |

Ordered grammar and public root scoping stay outside P0–P3 until their reopen
gates clear. Browser/history/Yjs donor rows remain mandatory proof inputs for
the retained or accepted owners, not independent architecture work.
