---
"@platejs/cli": major
---

Add deterministic generated schema contracts for authored editor modules.
Export one Plate plugin tuple and an optional application schema from
`src/editor.ts`; `plate generate` discovers them by validated runtime shape,
independent of their export names. Pass them directly to editor construction,
generate committed exact recursive `Value` and editor types, and verify
generated artifacts with `plate generate --check`.

Keep raw plugin tuples lightweight: they infer authored API, read, update, and
store capabilities plus descriptor-local schema operations while their global
`Value` remains broad. Generated types add exact application-wide `Value`, root
and transaction mutation namespaces, and schema relationships without
recursively evaluating the complete grammar at each editor access. Recursive
JSON property edges degrade to `unknown` instead of overflowing the generator
or emitting an unsafe recursive expansion; finite declared fields remain
exact. Generated plugin bindings expose one flat primary identity at
`schema.plugins.<name>.type` or `.key`; application-owned properties remain
under `schema.properties`.

Give every element descriptor standard `insert`, `set`, and `remove` updates
through `editor.plugin(Plugin).update`. Generated editor types also project
them as `editor.update.<name>` and `tx.<name>`. An authored same-name method
replaces the standard method when the plugin owns additional semantics. Remove
redundant feature aliases such as `insertDate`, `insertExcalidraw`,
`insertPlaceholder`, `insertTable`, and `insertToc`.

Generate exact text-block toggle eligibility so closed editor types expose
`editor.update.<name>.toggle()` only for default-constructible compatible
elements without authored toggle semantics.

Add canonical Plite schema contract serialization and structural diffs. Use
`plate migrate new <name>` to create typed application-owned migration
snapshots and a pure `FromValue -> ToValue` scaffold. Add each completed step to
the editor module's `defineDocumentMigrations` chain and bind the generated
source fingerprint for each historical envelope version. Use
`plate migrate run` for dry-run and `--check` validation, or add `--write` to
atomically replace JSON files through the same runner as editor initialization.
The executable runner reads `EditorKit`, `EditorSchema`, and
`EditorMigrations` from its entry module by exact export name.

Run `plate generate` with the conventional `src/editor.ts` entry, pass multiple
entries for one atomic batch, or add `--watch` to reuse one TypeScript project.
The CLI is bin-only; its JavaScript implementation is not a package API.

Generated modules export static `Editor`, `Value`, element/text, mutation,
schema-handle, and fingerprint contracts. They never export a runtime plugin
kit, wrap authored plugins, validate runtime construction, or act as a hook
argument. Runtime composition always uses the authored plugin tuple and
optional application schema; CI `--check` is the staleness gate.

Keep compiler scratch in the operating system temp directory and transaction,
lock, watcher, staging, and recovery state in the project's deterministic
`node_modules/.cache`. Consumer source contains only the intentional generated
contracts and needs no Plate-specific ignore rules.
