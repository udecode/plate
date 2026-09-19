# @platejs/cli

## 54.0.0-beta.1

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add deterministic generated schema contracts for authored editor modules. Export one Plate plugin tuple and an optional application schema from `src/editor.ts`; `plate generate` discovers them by validated runtime shape, independent of their export names. Pass them directly to editor construction, generate committed exact recursive `Value` and editor types, and verify generated artifacts with `plate generate --check`.

  Keep raw plugin tuples lightweight: they infer authored API, read, update, and store capabilities plus descriptor-local schema operations while their global `Value` remains broad. Generated types add exact application-wide `Value`, root and transaction mutation namespaces, and schema relationships without recursively evaluating the complete grammar at each editor access. Recursive JSON property edges degrade to `unknown` instead of overflowing the generator or emitting an unsafe recursive expansion; finite declared fields remain exact. Generated plugin bindings expose one flat primary identity at `schema.plugins.<name>.type` or `.key`; application-owned properties remain under `schema.properties`.

  Give every element descriptor standard `insert`, `set`, and `remove` updates through `editor.plugin(Plugin).update`. Generated editor types also project them as `editor.update.<name>` and `tx.<name>`. An authored same-name method replaces the standard method when the plugin owns additional semantics. Remove redundant feature aliases such as `insertDate`, `insertExcalidraw`, `insertPlaceholder`, `insertTable`, and `insertToc`.

  Generate exact text-block toggle eligibility so closed editor types expose `editor.update.<name>.toggle()` only for default-constructible compatible elements without authored toggle semantics.

  Add canonical Plite schema contract serialization and structural diffs. Use `plate migrate new <name>` to create typed application-owned migration snapshots and a pure `FromValue -> ToValue` scaffold. Add each completed step to the editor module's `defineDocumentMigrations` chain and bind the generated source fingerprint for each historical envelope version. Use `plate migrate run` for dry-run and `--check` validation, or add `--write` to atomically replace JSON files through the detached converter. Supply `--from <version|current>` when a batch contains raw documents; envelopes carry their own source identity. The executable runner reads `EditorMigrations` from its entry module by exact export name.

  Run `plate generate` with the conventional `src/editor.ts` entry, pass multiple entries for one atomic batch, or add `--watch` to reuse one TypeScript project. The CLI is bin-only; its JavaScript implementation is not a package API.

  Generated modules export static `Editor`, `Value`, element/text, mutation, schema-handle, and fingerprint contracts. They never export a runtime plugin kit, wrap authored plugins, validate runtime construction, or act as a hook argument. Runtime composition always uses the authored plugin tuple and optional application schema; CI `--check` is the staleness gate.

  Keep compiler scratch in the operating system temp directory and transaction, lock, watcher, staging, and recovery state in the project's deterministic `node_modules/.cache`. Consumer source contains only the intentional generated contracts and needs no Plate-specific ignore rules.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Convert persisted documents explicitly at the storage boundary. Define one immutable target with `defineDocumentMigrations({ plugins, schema, sourceFingerprints, steps })`, then call `migrateDocument(input, { migrations, source? })`. The result contains `{ output, applied, source }`; save or load `output` directly.

  Plate editors accept current-schema input only. Remove editor `migrations`, plugin `prepareDocument`, `migrateElementIds`, root migration imports, and public v53 manifest imports. Import migration APIs from `platejs/migrations`. Raw documents require `source: number | 'current'`; persisted envelopes carry their own exact schema identity.

  `plate migrate run` uses the same detached converter. Pass `--from <version|current>` for raw files; mixed batches apply the flag only to raw documents.

  Persist authored state with codec v6 footprints so current checkpoint admission can validate and index retained revisions without decoding their bodies. Older codec versions convert to v6 during admission.

  Compile Authored checkpoint construction and admission as a private capability of the installed Authored plugin. Generic Plite internals and Plate's core facade do not export Authored algorithms.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use one nominal `Plugin` descriptor family across Plite and Plate. Author plugins with `definePlugin`, install them through the `plugins` option, and open their exact typed portal with `editor.plugin(Plugin)`. Plate keeps its product compiler while preserving the original descriptor through headless and React authoring stages; dependencies, conflicts, ancestry, editor-local configuration, stores, rollback, retained portals, and view capabilities resolve from that shared identity.

  **Migration:** Replace `defineExtension` with `definePlugin`, `extensions` with `plugins`, `editor.extension(Plugin)` with `editor.plugin(Plugin)`, `EditorExtension` with `Plugin`, and `EditorExtensionTypeProvider` with `PluginTypeProvider`. Replace Plate's `defineBasePlugin` and `definePlatePlugin` factories with `definePlugin`. The v54 CLI migration emits one mixed `EditorKit` plugin tuple.

### Patch Changes

- [#5115](https://github.com/udecode/plate/pull/5115) by [@zbeyens](https://github.com/zbeyens) – Add the `plate deps` command for dependency maintenance.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require `platejs@>=54.0.0-beta.1` as a peer dependency.

  Generate and migrate editor contracts from application schemas that declare a primary root.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Generate schema and binding facts through `platejs/compiler`, without activating editor plugins during module evaluation.
  - Materialize exact installed property types through type-only compiler projections while preserving discovery and atomic output publication.
  - Resolve property type aliases only for schema properties that consume them.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) –

  - Run npm lookups without shell interpolation
  - Require `--install` before installing in `--yes` mode
  - Restore TypeScript declaration builds

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add typed block `upsert` operations and make block `insert` apply one semantic empty-block policy across generated and feature-owned plugin portals. Generated editor contracts identify block mutations so inline portals remain excluded.
