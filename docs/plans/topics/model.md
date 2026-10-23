# Model document

Page: https://claude.ai/artifact/6gb4zfU1Ys6mqJpDReA4c5

The Plite document model: the JSON tree a document holds, the top-level fields each entry point admits, and the three identities, runtime `NodeKey`, optional persisted element ID and schema fingerprint. One private Plite document-shape owner gives construction, assertion, fitting and replacement the same container contract, and each entry point admits fields by input kind where the caller's raw object is still visible: a document admits `children`, `meta` and `roots`, a direct snapshot also `selection`, and the persisted envelope `document`, `schema` and `selection`. Application data belongs in `meta`. `assertDocument` validates and narrows without modifying; construction and import may still fit and fill schema defaults ([admission plan](../2026-10-03-model-document-admission.md), [September patch](../2026-09-11-model-document-boundary-patch.md)). `node tooling/scripts/review-ledger.mjs show model` prints the full history.

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
// packages/platejs/src/lib/editor/withPlite.schema-plugins.spec.ts
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

Inserting a block that another root holds gives the copy its own key.

```ts
// keys-table.ts in the run directory, row update-other-root-block
const live = header.read.children()[0];
editor.update((tx) => tx.nodes.insert(live, { at: [2] }));
editor.key([2]) === header.key([0]); // false: the copy has its own key
```

A thrown-away draft that puts back a pasted block leaves that block's key alone.

```ts
// no-write.ts in the run directory, mode ambient-update
editor.update((tx) => {
  tx.fragment.replace([P('a'), P('b'), P('c')]);
  const block = tx.children()[2];
  editor.read((state) => state.transaction((inner) => inner.nodes.insert(block, { at: [0] })));
  // block keeps the key it got when the paste landed; the draft wrote none
});
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

For node keys, the how explorer and the lead read the same checkouts plus prosemirror-transform `662b7a9` and ran none of them. Only Lexical keys a node by the time the change that places it ends and stops a copy from sharing its key. Slate and the slate-v2 fork, which Plite's key cache comes from, key a node at its first lookup and let one object stand at two places with one key.

| Editor | Where identity lives | When a placed node gets it | What a copy gets | Can a discarded change alter committed identity? |
| --- | --- | --- | --- | --- |
| Lexical | A `__key` on the node and a key map per editor state (`LexicalUtils.ts:377`) | At construction: the node constructor sets its key (`LexicalNode.ts:906`) | `$copyNode` allocates a new key; a writable clone keeps the key as a new version (`LexicalUtils.ts:1829`) | No; the pending state and its node map are dropped (`LexicalUpdates.ts:1223`) |
| ProseMirror | Nowhere; nodes are values, and an id is an application attribute (`node.ts:22`) | Never | The same attributes, so an id attribute repeats unless a plugin repairs it | No; a discarded transform leaves the persistent nodes as they were |
| Slate | Paths in core; a global object-to-key WeakMap in the DOM layer (`dom-editor.ts:379`) | On first lookup: `findKey` creates and caches a key for an unseen object | A fresh object gets a new lazy key; shared descendants keep theirs (`with-dom.ts:222`) | Slate has no discard; operations apply at once |
| slate-v2 fork | An object-to-editor-to-id WeakMap (`runtime-ids.ts:5`) | On first lookup, through `getOrCreateRuntimeId` in the snapshot index (`snapshot-index.ts:4`) | A fresh object gets a new id; inherited ids carry through rewrites | Ids are restored, but counters and abandoned WeakMap entries are not rewound (`public-state.ts:3498`) |
| Tiptap | ProseMirror's, plus the optional UniqueID attribute (`unique-id.ts:96`) | After each transaction: the UniqueID plugin's `appendTransaction` gives new nodes ids (`unique-id.ts:208`) | Paste clears ids and makes new ones (`unique-id.ts:395`); a programmatic duplicate can escape (`unique-id.ts:263`) | No |

Plite takes Lexical's timing and copy rule. An update keys each node as it lands, a node placed while its source is live is a copy with a new key, and a node placed while its source is gone keeps the source's key. A draft keeps Slate's lazy keying until an insert or a read needs the keys. It shares the committed document's object cache, as Slate's DOM layer does, so an insert first finishes every keying a draft put off before it treats a node with no key as new.

## Document shape

Every load path reads the stored document. An application that saved a field at the top level moves it into `meta`, through `migrateDocument` or before it calls the editor.

```json
{ "children": [{ "type": "paragraph", "children": [{ "text": "Hello" }] }], "meta": { "title": "Draft" } }
```

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Container contract | Plite, `packages/plitejs/src/core/document-shape.ts`; Plate migrations and construction call `readDocumentRecord` through `plitejs/internal`. |
| Migration steps | See only document fields; `FromDocument` and `ToDocument` are closed, a legacy top-level field arrives in a typed `legacy` channel, and completion refuses a field no step lifted. The v54 suggestions step keeps fitting mid-chain. |
| Identities | Runtime `NodeKey` is opaque and never serialized; persisted element IDs are optional and stay with `ElementIdPlugin`, whose `read.id` is the persistence-boundary conversion; the schema fingerprint identifies document semantics, with application lineage kept apart. `insertNodes` sorts each placed node as fresh, moved or copied before it writes any key. Only a fresh caller object takes a key, a moved node keeps its own and a copy gets a new one. An update keys each node it places as the node lands, and `insertNodes` first settles every deferred key mapping an open draft or command frame registered, so a node with no key for this editor is fresh. |
| Plate | Its nonempty-root product policy and the application migration adapter. |
| Stored properties | A key a node stores was written, and an absent key was never written. `omitDefault` leaves a default out of a node nobody wrote it on, and admission stores a written value even when it equals the default. A schema that declares an `omitDefault` property carries `storageRevision` in its contract and fingerprint. An older editor, which dropped such writes, refuses the new envelopes, and the new editor refuses the older ones. `diffEditorSchemaContracts` reports a changed revision as `storage-revision-changed`, which requires a migration. Admission in `packages/plitejs/src/core/editor-schema.ts` and the contract in `schema-compiler.ts` own it. |

Node keys change in these files:

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Settle every registered deferred key mapping, then sort placed nodes as fresh, moved or copied before keying | Plite | `plitejs`, `src/transforms-node/insert-nodes.ts` | The insert is the one write that takes caller objects, so it is the one place that knows which objects are new |
| Ask every root whether a key is live, start a nested draft from its parent's indexes, and register a draft's latest deferred key mapping of each root until the draft closes | Plite | `plitejs`, `src/core/public-state.ts` | The open drafts, their indexes and the committed snapshots live there |
| Key each node an update places as it lands, let one placement cover a deferred view's run of pasted roots, and answer that a key older than an index is absent without reading the root | Plite | `plitejs`, `src/core/snapshot-index.ts` | The snapshot index owns which key sits at which path and which keys a root holds |
| Date each key, mint live or prepared keys through one helper, and hold each root's registered deferred mapping | Plite | `plitejs`, `src/utils/node-keys.ts` | The key allocator holds what each editor keyed |
| Register a command frame's deferred mapping of its projected roots | Plite | `plitejs`, `src/core/command-frame.ts` | The frame installs its projection's lazy mapping and disposes it with the frame |
| Count whole-root index walks and landing binds | Plite | `plitejs`, `src/core/work.ts` | `CoreWork` holds the counters the work tests read |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A public validated-document wrapper, parser family or validation mode | Existing JSON and assertion APIs already express the jobs. |
| One universal persisted node ID | Live keys, persisted element IDs and fingerprints have different lifetimes and consumers; authored lineage, Yjs and prepared keys need text-level or transport identity an element ID cannot give. |
| Validation in Plate or the codecs | Raw editors and other imports keep the hole. |
| An ID-indexed public store or class-based AST | Solves admission no better than one boundary check. |
| Silently dropping unknown top-level keys | Silent loss is the failure the comparison shows most; the cost is that a new top-level field needs a doctrine change and a migration. |
| Leaving out a written value equal to its default | "Written as the default" and "never written" become one state, so a rejected cut, a retype or a move cannot tell a dropped value from a written one ([cut-join](cut-join.md)). |
| An alias registry that records which caller object became which placed node | It changes four or more object-to-key lookups and scans retained versions on the rare path, where sorting each placed node before keying adds one set per insert. |
| Keying pasted blocks on first read and asking the drafts whether an unkeyed node is live | An index mark and a search of the open drafts each failed a diff panel round. The search missed drafts that an ambient read hides, and documents it never read. |

## Main changes

- Plite owns top-level admission in `packages/plitejs/src/core/document-shape.ts`: one field list per input kind, checked against its public type, and `readDocumentRecord`, which reads a plain JSON record, treats a field holding `undefined` as absent and returns the caller's object unless it drops one. `readEditorDocument` adds the container check, and `readPersistedEnvelope` reads an envelope and checks its schema identity's fields and value types. Construction, `assertDocument`, `fitDocument`, snapshot and envelope load, the root-bound view, reconfigure `migrate`, `parseAuthoredDocument`, Plate construction and Plate migrations call them, Plate through `plitejs/internal`.
- `transformEditorSnapshotInput` admits the caller's raw snapshot or envelope before an installed host transform runs, and the transform's output is admitted again; a transform that returns nothing leaves the input as it was.
- A document-bound view keeps cached validation only for a document `assertDocument` registered as owned, which a frozen document of owned values such as `editor.read.value()` becomes; a caller's document is validated on every view.
- Plate migrations split a historical document into its document fields and a `legacy` record with `Object.fromEntries`, so even a stored `__proto__` field stays data, treat only a record with `document` and no `children` as an envelope, and refuse at completion a field no step lifted. `defineDocumentMigrations` refuses an inline step whose one returned document shape carries an extra key; a conditional return or an annotated standalone step still compiles, and runtime refuses the field. Plate's own container and exact-key readers are gone.
- `insertNodes` sorts every node it places before it writes any key. It first runs every deferred key mapping an open draft or command frame registered, then treats a node with no key for this editor as fresh and mints its key onto the caller's object, live in an update and prepared in a spec. A node whose key no root holds is a move and keeps that key. A node whose object or key the call already placed, or whose key some root holds, is a copy and gets a new key. A copy's object never gets a key, so each node above a copy goes to the builder as a private stand-in. Another editor's key does not make a node a copy. The key transfer that wrap, unwrap and `replaceChildren` share is untouched.
- An update keys each node it places as the node lands. After a key mapping builds the mapped index, it reads the key at each node touching a changed range, so an update keeps a node's own key or mints a live one, and a draft binds a placed node to the prepared key its slice reserved. `CoreWork.landedNodeBinds` counts these reads. Before, a paste's nodes stayed unkeyed until a read asked.
- A draft still defers its key mapping, and it registers each root's latest deferred mapping under itself until it closes. A command frame registers its projection's deferred mapping the same way. A root with 32 waiting mappings runs them at once, as a key read would, so an insert replays at most 31.
- A prepared placement can cover a run of whole root nodes inside pasted content, so a paste's middle blocks need no entry each. A draft's index keeps it, and an update's keeps it only when acceptance adopts the run's reserved keys. A placement tracks the paths of its first and last surviving roots, drops itself when a change empties that span, and gives up its ends when they leave one parent. A mapping still keys every changed node outside a placement, such as the blocks a paste merged into.
- `findLiveNodeKeys` answers which of a set of keys some root of the current draft holds. It asks each root for the index a key read gets, and skips a root no open draft changed for a key the current root held at commit. It compares a root with its committed version by the node list an index reads.
- A nested spec's draft starts from its parent's index for every root, and a top-level spec starts from each cached root index whose snapshot holds the node list the spec starts from.
- A mapped snapshot index answers that a key is absent when its base never held that key and the key is older than the base. Each index records the live key counter when it is built or mapped, and a newer key costs one read of the root. The insert asks the committed index from its cached paths first. `CoreWork.snapshotIndexWalks` counts each whole-root walk.
- `mintNodeKeys` replaces `seedPreparedNodeKeys` and mints live or prepared keys for the insert. Loading still seeds through `seedNodeKeys`.

## Open work

- The special-case reject callbacks (reconfigure `meta`, root view `meta` and `roots`, Plate `selection`) could become a per-field hint map in Plite's record message mapper, the migration step loop could use a `readStepResult` helper, and `readDocumentRecord`'s result could be typed from its field list; the build's reviews deferred all three as small. owner: zbeyens.
- A document view keeps reading the caller's object after admission, so a later mutation reaches its reads unvalidated; snapshotting the document on admission would close it at a copy's cost. owner: zbeyens.
- Plite load, Plate construction and the root view still report a `document` key beside `children` as an envelope error naming `children`; `migrateDocument` already asks for `source` there. `plate migrate run` reports an envelope under `--from` with API wording ("omit source intent"). owner: zbeyens.
- `pnpm --filter www editor:check` reports `apps/www/src/registry/components/editor/plugins.generated.ts` and `plugins.schema.json` stale; regenerating them moves only where the `summary` element is allowed, which this build did not touch. owner: zbeyens.
- The build's panel deferred these additive fixes after its last allowed round: `MigrationClosure` should check each variant of an inferred step's returned document union, so an extra key on one conditional branch fails to compile (runtime already refuses it), with wording that says to return the field in `legacy`; `isEnvelopeInput` should ignore an own `document` holding `undefined`; a Plate spec case should refuse an envelope whose identity has `version: '1'`; `fitDocument` should give the base JSON error for `undefined`, `NaN` and functions; `plate migrate run` should name the file for JSON parse errors and skip the temp path for `--stdin`; and `migrateDocument` should require `schema` before it reads a record as an envelope. owner: zbeyens.
- `readPersistedSchemaIdentity` repeats `readEditorSchemaIdentity`'s rules; reusing the decoder needs it to accept cross-realm records and undefined-valued keys first. owner: zbeyens.
- `setStateValueByKey` assigns meta keys, so an own `__proto__` key inside `meta` is lost on `value.replace`; it predates this build. owner: zbeyens.
- A document view's nodes, and a command frame's, come through a projection that keys them lazily, so the insert counts such a node as fresh, as base does. An update that inserts a view's node gives the copy the view node's key, and a discarded spec leaves a prepared key on it. A command frame whose projection rebuilds the nodes it keeps leaves them unkeyed the same way. A projection that hides a stored node, such as a pending deletion in suggestion mode, lets a method's copy take the source's key inside the frame. owner: the owner, through suggested task `t_4e37894a`. stop: that task lands or is dropped.
- An authored projection that places nodes without a key mapping would leave a live node unkeyed, and the insert would count it as fresh. The plitejs suite and the census of write kinds found none. owner: the owner. stop: a case that shows one.
- Kept paste placements and deferred key mappings add work no frozen cohort covers. An accepted draft whose mapping ran keeps its paste's placement until the next rebuild, and each key lookup scans every placement a draft holds. An insert that asks about a key minted after another root's index was built walks that root, such as a split's new half beside a header that changed shape, or a copy of a newly made header block. The 32-mapping bound limits how many mappings an insert runs, not the edits each one carries. owner: the owner, through suggested task `t_1a1b60f6`. stop: that task lands or is dropped.
- A caller that keeps a block object from a thrown-away draft and inserts it in a later update gives the block that draft's prepared key, which stays unique but outlives the draft. owner: the owner, through suggested task `t_7ae57e2e`. stop: that task lands or is dropped.
- Spec acceptance can give a block that `replaceChildren` replaced in another root its old key while the draft gave it a draft key, so a spec that also moves the old block into main duplicates that key at acceptance. Base fails both cases too. owner: the owner, through suggested task `t_e10a3715`. stop: that task lands or is dropped.
- A spec that copies from or edits a root no read has cached builds that root's index in every spec, because a spec cannot write the snapshot cache, where base reads that root only in the first spec. owner: the owner, through suggested task `t_aa68ddfd`. stop: that task lands or is dropped.
- The insert's key sort has no conclusive paired timing. The paste cohorts and the timing receipt stayed inconclusive on a loaded host, with no paste median over its budget, and five runs of a spec that moves a block beside a 20,000-block header read a median 1.05 times base against its 1.10 budget. owner: the owner, through suggested task `t_9caf9c36`. stop: that task lands or is dropped.
