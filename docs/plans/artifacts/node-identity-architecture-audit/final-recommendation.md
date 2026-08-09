# Final node identity recommendation

## Verdict

Keep two identity systems because they solve different problems:

1. Plite owns mandatory, non-serialized runtime identity for every descendant,
   including text nodes.
2. Plate offers persisted identity only through an explicitly installed
   `ElementIdPlugin`, for every element, including inline elements, never text.

Paths and anchors remain first-class. Runtime IDs identify a live node across
moves. Paths describe structure. Anchors map text and ranges through edits.
Persisted element IDs identify application entities across reloads and systems.
Collapsing those jobs into one ID makes at least two of them dishonest.

The current Plite runtime is already the correct base. The main defect is that
Core installs persisted IDs by default and many session-only features depend on
them.

## Final identity law

| Concept                  | Owner                               | Applies to                     | Stored in JSON / collaboration                  | Lifetime                   | Primary use                                             |
| ------------------------ | ----------------------------------- | ------------------------------ | ----------------------------------------------- | -------------------------- | ------------------------------------------------------- |
| `RuntimeId`              | Plite                               | Every element and text node    | Never                                           | One editor runtime         | Stable local lookup, subscriptions, React/DOM bindings  |
| `Path`, `Point`, `Range` | Plite                               | Structural and text positions  | Only when an application explicitly stores them | One snapshot unless mapped | Tree operations and selections                          |
| `Anchor`                 | Plite                               | Path, point, or range          | No; adapters may encode their own durable form  | Until released or deleted  | Retained locations through edits                        |
| Element `id`             | Explicit Plate plugin / application | Every element, block or inline | Yes                                             | Across reloads and systems | Database rows, links, Markdown IDs, external references |

`RuntimeId` is editor-scoped, like `Path`. It does not promise uniqueness across
editors, processes, reloads, or documents. Cross-editor operations carry the
source editor with the runtime ID and create fresh runtime IDs in the target.

## Final public shape

### Runtime identity

Hard-cut the conversion names to the shorter runtime-scoped vocabulary and
brand the string type:

```ts
declare const runtimeId: unique symbol;

export type RuntimeId = string & {
  readonly [runtimeId]: true;
};

type NodeTarget<N extends Descendant = Descendant> = Location | N | RuntimeId;
```

```ts
const id = editor.read.runtime.id(element);

editor.update.nodes.remove({ at: id });

const path = editor.read.runtime.path(id);
```

Use overloads so a live descendant always returns `RuntimeId`, while a location
may return `null`:

```ts
type EditorRuntimeRead = {
  id(node: Descendant): RuntimeId;
  id(at: Location): RuntimeId | null;
  path(id: RuntimeId): Path | null;
  snapshot(): EditorSnapshot;
};
```

Delete `idAt` and `pathOf`; do not retain aliases. Every generic node read or
update that accepts `NodeTarget` then accepts a stable runtime ID without a
manual ID-to-path round trip.

Keep the existing editor-scoped prefix-plus-counter allocator. A UUID on every
runtime node would waste CPU, memory, and DOM bytes without adding a valid
guarantee. A realm-global counter would also couple otherwise independent
editor renders. The editor argument scopes runtime identity just as it scopes a
path.

### Persisted element identity

Hard-cut `NodeIdPlugin` to `ElementIdPlugin`. Keep it exported from
`@platejs/core`, but remove it from `getCorePlugins()`.

```ts
const EditorKit = [ElementIdPlugin] as const;
```

The built-in generator is full-length `nanoid()`. Database-backed applications
can replace it with UUIDv7 or any other string generator:

```ts
const EditorKit = [
  ElementIdPlugin.configure({
    initialState: {
      generateId: () => uuidv7(),
    },
  }),
] as const;
```

There is one option: `generateId`. There is no block filter, inline filter,
text filter, initialization mode, paste reuse switch, duplicate-scan callback,
hidden `_id`, or number-valued ID.

The plugin's semantic property is `id`. Add a closed application-schema key
override so its compiled key can differ without changing plugin capability
identity:

```ts
defineEditor("app", {
  plugins: [ElementIdPlugin],
  schema: {
    overrides: [
      schema.override(ElementIdPlugin, {
        properties: {
          id: { key: "blockId" },
        },
      }),
    ],
  },
});
```

This belongs to `defineEditor` schema policy, not `.configure()` or `.extend()`.
Plugin and consumer code use the compiled property handle, never `element.id`
or a raw key.

The same closed override narrows applicability when an application deliberately
wants block-only IDs:

```ts
schema.override(ElementIdPlugin, {
  properties: {
    id: { target: target.group("block") },
  },
});
```

That is schema policy, so it does not justify restoring `filterInline` or a
second runtime matcher.

```ts
const elementId = editor.plugin(ElementIdPlugin);

const id: string = elementId.read.id(element);
const entry = elementId.read.entry(id);

if (entry) {
  editor.update.nodes.remove({ at: entry[0] });
}
```

Do not accept a persisted string directly as `NodeTarget`. A raw application
ID and a `RuntimeId` are different namespaces. The plugin-scoped lookup keeps
that distinction visible and returns the generic node target that Core already
understands.

### Schema lifecycle

Move copy behavior into the Plite schema instead of cloning trees inside one
plugin. Add one generic element/text-property policy:

```ts
type SchemaPropertyCopyPolicy = "drop" | "preserve";
```

Add a generated default that is optional in construction input but required in
the canonical schema shape. The fingerprint records the declarative
`generated` law, not the callback identity or its nondeterministic output. A
generator change from Nano ID to UUIDv7 does not change the accepted string
value domain.

The resulting plugin declaration is conceptually:

```ts
export const ElementIdPlugin = defineBasePlugin("elementId", {
  initialState: {
    generateId: () => nanoid(),
  },
  schema: ({ initialState }) => ({
    properties: {
      id: schema.elementProperty(
        property.string({ generate: initialState.generateId }),
        {
          copy: "drop",
          role: "metadata",
          split: "drop",
          target: target.group("element"),
          typeChange: "preserve-if-allowed",
        }
      ),
    },
  }),
});
```

`generate` has one exact law:

- the construction input may omit the property;
- canonical created nodes contain it;
- an existing valid value is preserved;
- generation runs before a local change is published;
- copied or split nodes regenerate after the schema lifecycle drops the value;
- the callback is excluded from schema identity because it changes values, not
  the accepted value type; the fingerprint still records that the field is
  generated.

This is useful beyond IDs, but the implementation must stay narrow. Do not add
a general callback pipeline or another plugin stage.

### Element ID lifecycle

The fixed lifecycle is:

| Operation                          | Result                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| Create or insert without ID        | Generate one ID before publication                         |
| Load with a valid unique string ID | Preserve it                                                |
| Move                               | Preserve it                                                |
| Change element type                | Preserve it while the property remains allowed             |
| Split                              | Original branch keeps its ID; new branch receives a new ID |
| Merge                              | Survivor keeps its ID; removed element loses identity      |
| Duplicate or paste                 | Copied IDs drop and regenerate                             |
| Remote collaborative insert        | Preserve the ID already published by the source peer       |
| Explicit duplicate ID              | Reject with a precise diagnostic                           |

The plugin builds one document-wide `id -> RuntimeId` index when installed and
updates it from changed runtime IDs after each commit. This replaces repeated
document scans. IDs are unique across the primary root and named roots.

Initial legacy data is migrated once at the authoritative persistence boundary
before collaborative clients attach. Export one pure `migrateElementIds`
helper for that editor-free job. It preserves valid string IDs, fills missing
ones, reports duplicates, and accepts the same generator. Do not silently run
different migrations on multiple peers.

### Text identity

Never persist an ID on a text leaf. Text leaves split and merge as an editing
detail, and every non-`text` property participates in merge equality. Unique
leaf IDs would prevent valid merges and turn transient fragments into durable
entities.

Use a named anchor instead:

```ts
const comment = {
  anchor: editor.anchor(range),
  id: "comment-42",
};
```

An application that needs reloadable or collaborative text references encodes
the anchor through its collaboration or annotation adapter. It does not put an
ID on `Text`.

## Consumer migration

### Session-only consumers

Move these from persisted `element.id` to branded `RuntimeId`:

- block selection;
- drag source and drop target state;
- toggle open state;
- AI temporary replacement sets;
- media preview state;
- table memo/index keys;
- React and DOM reconciliation.

Cross-editor DnD carries `{ editor, runtimeId }` at the drag boundary. A move in
one editor preserves its runtime ID. A copy into another editor receives fresh
runtime IDs.

Keep `data-plite-runtime-id` as the Plite DOM binding. Remove Core's unconditional
`data-block-id`. A feature that exposes a durable application ID to HTML does so
through `ElementIdPlugin` or its own renderer.

### Durable consumers

Markdown block-ID interchange, TOC link targets, database block rows, and
external references explicitly install and depend on `ElementIdPlugin`. Their
code reads the schema-owned property through its plugin portal so a physical
key remap remains valid.

Existing documents are not stripped. Applications that currently persist IDs
add `ElementIdPlugin` to their kit and run the migration once. Applications
that used numeric IDs supply an explicit number-to-string migration.

## Hard-cut list

Delete without aliases:

- `NodeIdPlugin` and the `nodeId` plugin name;
- `NodeIdPluginState`, `NodeIdDefinition`, and `NodeIdPluginUpdate`;
- `IdElement`;
- `normalizeNodeId` as an editor-runtime convenience;
- `filterInline`, `filterText`, `initialValueIds`, `reuseId`,
  `disableInsertOverrides`, and `onDuplicateIdScan`;
- `_id` insertion escape behavior;
- `string | number` IDs;
- Core default installation;
- direct session-feature reads of persisted `element.id`;
- `idAt` and `pathOf` after the runtime API migration.

The editor-free `migrateElementIds` helper is not a compatibility alias. It is
the explicit persistence migration boundary that cannot use an editor portal.

## Rejected alternatives

| Alternative                                           | Decision | Reason                                                                                                        |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| Persist IDs on every node by default                  | Reject   | It bloats every document and corrupts text merge semantics.                                                   |
| Persist IDs only on blocks                            | Reject   | Inline elements can be durable entities too; plugin installation is the opt-in boundary.                      |
| Keep `NodeIdPlugin` default but disable generation    | Reject   | It leaves an optional application schema field in every editor and preserves confused ownership.              |
| Serialize Plite `RuntimeId`                           | Reject   | Runtime continuation, persistence, collaboration, and external uniqueness have different laws.                |
| Replace paths with IDs                                | Reject   | IDs do not encode order, offsets, insertion positions, or ranges.                                             |
| Replace runtime IDs with WeakMap object identity only | Reject   | Immutable copies, DOM attributes, subscriptions, and changed-node buckets need a stable scalar key.           |
| Copy Lexical's class-node map                         | Reject   | Plite's weak ownership and lazy indexes already provide the applicable benefit without abandoning JSON nodes. |
| Copy ProseMirror or Wordgard's position-only model    | Reject   | Plate's React and plugin stores benefit materially from stable moved-node identity.                           |
| Add text IDs for rare cases                           | Reject   | Anchors solve the real job without changing leaf equality.                                                    |
| Create a new `@platejs/element-id` package            | Reject   | One small opt-in plugin does not justify another package boundary.                                            |

## Ordered implementation plan

### Packet 1: Plite identity and property lifecycle

Owner: `plite-plan`.

1. Brand `RuntimeId`.
2. Replace `runtime.idAt/pathOf` with `runtime.id/path`.
3. Accept `RuntimeId` in every generic `NodeTarget` resolver.
4. Keep runtime IDs editor-scoped and non-serialized.
5. Add schema property `copy` policy and generated construction values.
6. Add closed-schema physical key overrides for semantic properties.
7. Make generated values optional on construction input and required on the
   canonical output type without expanding every editor capability generic.
8. Prove roots, moves, removal, direct targeting, generated values, copying,
   splitting, collaboration payload exclusion, and type-depth safety.

### Packet 2: ElementIdPlugin hard cut

Owner: `plate-plan`, after Packet 1.

1. Replace `NodeIdPlugin` with the minimal `ElementIdPlugin` declaration above.
2. Remove it from Core defaults.
3. Add the incremental document-wide reverse index.
4. Expose only `read.id` and `read.entry`; use generic updates afterward.
5. Add the authoritative `migrateElementIds` helper.
6. Remove the old options, hidden property, scans, aliases, and required-shape
   assertion type.

### Packet 3: Consumer adoption

Owner: `plate-plan`, split by package only after the owner APIs pass.

1. Migrate session-only consumers to RuntimeId.
2. Add explicit `ElementIdPlugin` dependencies to durable consumers.
3. Replace raw `element.id` access with the compiled property portal.
4. Remove Core's unconditional durable DOM projection.
5. Update registry kits that persist block IDs.

### Packet 4: migration and release surface

1. Add one breaking changeset for each published package changed.
2. Document runtime versus persisted identity and the one-time migration.
3. Provide a codemod for the plugin/type/API renames and kit installation.
4. Regenerate barrels and API reference artifacts through their owning
   workflows.
5. Keep physical-device testing deferred; this architecture has no
   device-specific behavior.

## Proof gates

### Plite

- Compile-only tests reject arbitrary strings as `RuntimeId` and accept branded
  IDs as `NodeTarget`.
- Runtime tests cover all generic read/update families with a moved node ID.
- Root tests prove the wrong root view returns no target.
- Runtime IDs never appear in serialized values, slices, history, or Yjs data.
- Element and text IDs survive immutable copies; removed IDs resolve to null.
- Schema tests cover `copy`, `split`, `typeChange`, generated construction input,
  canonical output, physical key override, and schema fingerprint stability.
- The large EditorKit type-depth fixture remains below TS2589.

### Plate

- Editors without `ElementIdPlugin` do not add or scan persisted IDs.
- Editors with it give every block and inline element one unique string ID.
- Text nodes never receive an ID.
- Move/type-change preserve; split/duplicate/paste regenerate; merge keeps only
  the survivor's ID.
- Initial and named-root duplicates fail with exact diagnostics.
- Reverse lookup stays correct after insert, remove, move, ID change rejection,
  undo, redo, and schema reconfiguration.
- A configured physical property key works without raw-key reads.
- Markdown/TOC round trips preserve durable IDs only when the plugin is
  installed.
- Two collaborative peers converge when starting from an authoritative migrated
  document; runtime IDs remain peer-local.

### Browser

- Selection, DnD, toggle, media, table, and AI demos work without persisted IDs.
- Same-editor DnD preserves runtime identity; cross-editor copy creates target
  runtime identity.
- DOM lookup uses `data-plite-runtime-id`; durable HTML IDs appear only where an
  explicit feature renders them.

## Reference verdict

- Steal from Lexical: mandatory runtime identity, direct lookup, stale-object
  continuity, and strict non-serialization.
- Keep from Plite: weak ownership, JSON-native nodes, lazy bidirectional
  indexes, root-aware paths, canonical changes, and anchors.
- Steal from ProseMirror and Wordgard: mapped position semantics and the rule
  that persisted identity is explicit schema/application data.
- Do not copy any editor wholesale. The Plite plus explicit Plate plugin split
  is stronger for Plate's actual React, plugin, collaboration, and copied
  registry constraints.

## Final ownership

The implementation is one architecture change with two ordered owners, not two
competing designs. `plite-plan` owns runtime targeting and schema lifecycle.
`plate-plan` owns the persisted plugin, consumer migration, docs, and release
adoption. Packet 2 must not reproduce copy or generation policy locally if
Packet 1 can express it generically.
