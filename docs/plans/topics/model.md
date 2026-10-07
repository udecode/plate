# Model document

Page: https://claude.ai/artifact/6gb4zfU1Ys6mqJpDReA4c5

The Plite document model: the JSON tree a document holds, the top-level fields each entry point admits, and the three identities, runtime `NodeKey`, optional persisted element ID and schema fingerprint. Its law lives in `docs/research/decisions/model-document-boundary.md`.

## Public API

Validate a complete document against the compiled schema.

```ts
// content/docs/(guides)/schema.mdx
editor.read.schema.assertDocument(document);
```

`assertDocument` narrows to a document, so it refuses a key a document lacks.

```ts
// tested in packages/plitejs/test/schema-identity-contract.test.ts
editor.read.schema.assertDocument({ children, extra: 1 }); // throws invalid-document: Editor document field "extra" is not supported. Store application data in meta.
```

Replace content from outside the editor.

```ts
// content/docs/(guides)/controlled.mdx
editor.update((tx) => tx.value.replace({ children: value }));
```

Direct replacement takes a snapshot, which admits `selection` and nothing else beyond a document's fields.

```ts
// tested in packages/plitejs/test/schema-identity-contract.test.ts
editor.update.value.replace({ children, document: { application: true } }); // throws inside the replace; the value is unchanged
```

Plate construction reads its raw value as a document, so a selection goes in the `selection` option.

```ts
// packages/platejs/src/lib/editor/withPlite.slow.ts
createEditor({ initialValue: { children }, selection });
```

A schema migration callback returns structure, checked before the editor rebuilds it.

```ts
// packages/plitejs/test/plugin-configuration.test.ts
editor.update.plugins.reconfigure(slot, next, { migrate: ({ document }) => ({ ...document, extra: 1 }) }); // throws; publication rolls back
```

Bring a saved envelope to the current schema, then construct the editor with it.

```tsx
// content/docs/(guides)/editor.mdx
const current = migrateDocument(persisted, {
  migrations: EditorMigrations,
}).output;
const editor = useCreateEditor({
  initialValue: current,
  plugins: EditorKit,
  schema: EditorSchema,
});
```

A migration step reads a legacy top-level field from `legacy` and passes on the rest; its document types admit only document fields.

```ts
// content/docs/(guides)/editor.mdx
2: ({ document, legacy: { title, ...legacy } }) => ({
  document: title === undefined ? document : { ...document, meta: { ...document.meta, title } },
  legacy,
}),
```

Completion refuses a historical field that no step lifted.

```ts
// packages/platejs/src/migrations/documentMigrations.spec.ts
migrateDocument({ children, stray: 1 }, { migrations, source: 1 }); // throws at completion: Migrated document field "stray" was not lifted by any migration step.
```

## What other editors do

Read from source at prosemirror-model `6264de0` and prosemirror-state `ffad5d9`, Lexical `dd5c41b13`, Slate `945a484df`, the slate-v2 fork `f0e5ad1ae` and Tiptap `91c51be53`; Lexical and slate-v2 were also probed on source, while ProseMirror, Slate and Tiptap were read but not run. None of them refuses an unknown top-level key. ProseMirror, Lexical, slate-v2 and Tiptap drop it silently, Slate has no top-level document object, and Lexical keeps unknown keys only in its `$` node-state bag. None routes every load path through one reader.

| Editor | Load call | Validates the document | Unknown top-level or node keys | One reader for every path | Selection and version |
| --- | --- | --- | --- | --- | --- |
| ProseMirror | `Node.fromJSON`, `EditorState.fromJSON` | Throws on unknown types, required attrs and bad text; content rules only through opt-in `check()` | Dropped; state JSON reads only `doc`, `selection` and named plugin fields | One JSON reader, no single validator | Selection beside the doc in the state envelope; no version |
| Lexical | `editor.parseEditorState`, node `importJSON` | Unknown types hit an invariant, reported through `onError` with a partial state | Top level reads only `root`; undeclared node fields dropped; the `$` state bag keeps unknown keys on purpose | One JSON reader; Yjs bypasses it | Selection never serialized; per-node `version` never read |
| Slate | `editor.children = value` | Shallow node-list check in `<Slate>` only | Kept as node properties; the value is the children array, so there is no top-level key | No reader | Selection on the editor object; no envelope or version |
| slate-v2 fork | `createEditor({ initialValue })`, `tx.value.replace` | Shape checks at construction only; replace has none | Unknown top-level keys dropped on both paths; node fields and `state` keys kept | No; construction and replace diverge | `initialSelection` beside the document; no schema version |
| Tiptap | `new Editor({ content })`, `setContent` | Default turns a bad document into an empty one; `enableContentCheck` adds `check()` | Same as ProseMirror: dropped | One helper, a different policy per caller | Selection from `autofocus`; no version |

Plite refuses where these editors drop, because it has a slot for application data (`meta`) and a migration chain to lift legacy fields, and its persisted envelope already refuses unknown keys. Silent loss is the failure the comparison shows most often, as in Tiptap's empty document. The cost is forward compatibility. Once raw readers refuse unknown keys, a new top-level document field breaks every older reader of raw documents, so Plite adds one only with a doctrine change and a migration.

## Document shape

Every load path reads the stored document. An application that saved a field at the top level moves it into `meta`, through `migrateDocument` or before it calls the editor.

```json
{ "children": [{ "type": "paragraph", "children": [{ "text": "Hello" }] }], "meta": { "title": "Draft" } }
```

## Main changes

- Plite owns top-level admission in `packages/plitejs/src/core/document-shape.ts`: one field list per input kind, checked against its public type, and `readDocumentRecord`, which reads a plain JSON record, treats a field holding `undefined` as absent and returns the caller's object unless it drops one. `readEditorDocument` adds the container check, and `readPersistedEnvelope` reads an envelope and checks its schema identity's fields and value types. Construction, `assertDocument`, `fitDocument`, snapshot and envelope load, the root-bound view, reconfigure `migrate`, `parseAuthoredDocument`, Plate construction and Plate migrations call them, Plate through `plitejs/internal`.
- `transformEditorSnapshotInput` admits the caller's raw snapshot or envelope before an installed host transform runs, and the transform's output is admitted again; a transform that returns nothing leaves the input as it was.
- A document-bound view keeps cached validation only for a document `assertDocument` registered as owned, which a frozen document of owned values such as `editor.read.value()` becomes; a caller's document is validated on every view.
- Plate migrations split a historical document into its document fields and a `legacy` record with `Object.fromEntries`, so even a stored `__proto__` field stays data, treat only a record with `document` and no `children` as an envelope, and refuse at completion a field no step lifted. `defineDocumentMigrations` refuses an inline step whose one returned document shape carries an extra key; a conditional return or an annotated standalone step still compiles, and runtime refuses the field. Plate's own container and exact-key readers are gone.

## Open work

- The special-case reject callbacks (reconfigure `meta`, root view `meta` and `roots`, Plate `selection`) could become a per-field hint map in Plite's record message mapper, the migration step loop could use a `readStepResult` helper, and `readDocumentRecord`'s result could be typed from its field list; the build's reviews deferred all three as small. owner: zbeyens.
- A document view keeps reading the caller's object after admission, so a later mutation reaches its reads unvalidated; snapshotting the document on admission would close it at a copy's cost. owner: zbeyens.
- Plite load, Plate construction and the root view still report a `document` key beside `children` as an envelope error naming `children`; `migrateDocument` already asks for `source` there. `plate migrate run` reports an envelope under `--from` with API wording ("omit source intent"). owner: zbeyens.
- `pnpm --filter www editor:check` reports `apps/www/src/registry/components/editor/plugins.generated.ts` and `plugins.schema.json` stale; regenerating them moves only where the `summary` element is allowed, which this build did not touch. owner: zbeyens.
- The build's panel deferred these additive fixes after its last allowed round: `MigrationClosure` should check each variant of an inferred step's returned document union, so an extra key on one conditional branch fails to compile (runtime already refuses it), with wording that says to return the field in `legacy`; `isEnvelopeInput` should ignore an own `document` holding `undefined`; a Plate spec case should refuse an envelope whose identity has `version: '1'`; `fitDocument` should give the base JSON error for `undefined`, `NaN` and functions; `plate migrate run` should name the file for JSON parse errors and skip the temp path for `--stdin`; and `migrateDocument` should require `schema` before it reads a record as an envelope. owner: zbeyens.
- `readPersistedSchemaIdentity` repeats `readEditorSchemaIdentity`'s rules; reusing the decoder needs it to accept cross-realm records and undefined-valued keys first. owner: zbeyens.
- `setStateValueByKey` assigns meta keys, so an own `__proto__` key inside `meta` is lost on `value.replace`; it predates this build. owner: zbeyens.
