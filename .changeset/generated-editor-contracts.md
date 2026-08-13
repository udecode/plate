---
"@platejs/cli": major
---

Add closed editor definitions and deterministic generated schema contracts.
Define an application editor with `defineEditor(name, definition)`, generate
committed exact recursive `Value` and editor types with `plate generate`, and
verify generated artifacts with `plate generate --check`. Generated kits carry
a structural fingerprint that Core validates before editor publication.

Keep raw plugin tuples lightweight: they infer authored API, read, update, and
store capabilities plus descriptor-local schema operations while their global
`Value` remains broad. Generated kits add exact application-wide `Value`, root
and transaction mutation namespaces, and schema relationships without
recursively evaluating the complete grammar at each editor access.
Recursive JSON property edges degrade to `unknown` instead of overflowing the
generator or emitting an unsafe recursive expansion; finite declared fields
remain exact.
Generated plugin bindings expose one flat primary identity at
`EditorKit.schema.plugins.<name>.type` or `.key`; application-owned properties
remain under `EditorKit.schema.properties`.

Give every element descriptor standard `insert`, `set`, and `remove` updates
through `editor.plugin(Plugin).update`. Generated editors also project them as
`editor.update.<name>` and `tx.<name>`. An authored same-name method replaces
the standard method when the plugin owns additional semantics. Remove redundant
feature aliases such as `insertDate`, `insertExcalidraw`, `insertPlaceholder`,
`insertTable`, and `insertToc`.

Generate exact text-block toggle eligibility so closed editors expose
`editor.update.<name>.toggle()` only for default-constructible compatible
elements without authored toggle semantics.

Add canonical Plite schema contract serialization and structural diffs. Use
`plate migrate new <name>` to create typed application-owned migration
snapshots and a pure `FromValue -> ToValue` scaffold; Plate does not execute the
migration automatically.

Run `plate generate` with the conventional
`src/editor/editor-definition.tsx` entry, pass multiple entries for one atomic
batch, or add `--watch` to reuse one TypeScript project. The CLI is bin-only;
its JavaScript implementation is not a package API.

Keep compiler scratch in the operating system temp directory and transaction,
lock, watcher, staging, and recovery state in the project's deterministic
`node_modules/.cache`. Consumer source contains only the intentional generated
contracts and needs no Plate-specific ignore rules.
