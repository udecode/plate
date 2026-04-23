---
date: 2026-04-23
topic: slate-v2-read-update-runtime-architecture
status: paused
depends_on:
  - docs/plans/2026-04-23-slate-v2-remaining-perfect-architecture-batches-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
related:
  - docs/solutions/logic-errors/2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md
  - docs/solutions/logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md
---

# Slate v2 Read/Update Runtime Architecture

## Authoritative Direction

This section supersedes the earlier target-fresh editor-method framing below.
The execution ledger remains valid historical evidence, but the final API
direction is `editor.read(...)` and `editor.update(...)`, not semantic-method
growth.

## Verdict

Do not pivot to a different editor architecture.

Pivot harder into:

```txt
Slate model + operations
Lexical-style read/update lifecycle
ProseMirror-style transaction and DOM-selection discipline
Tiptap-style extension ergonomics
React 19.2 optimized rendering/runtime APIs
```

The core stays data-model-first and operation/collaboration-friendly. React
does not own the model. React receives better runtime facts: live reads,
commit dirtiness, dirty runtime ids, semantic islands, and direct DOM text sync
as an explicit capability.

The public runtime contract becomes:

```ts
editor.read(() => {
  const selection = editor.getSelection()
  const active = editor.hasNodes({ match: isHeading })
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

The internal runtime contract remains:

```txt
editor.update
  -> transaction
  -> resolve implicit target once
  -> primitive editor methods use the transaction target when `at` is omitted
  -> operations
  -> EditorCommit
  -> history / collaboration / React runtime / DOM repair
```

`tx.resolveTarget()` is correct, but it is an internal engine-room API. Plugin
authors should not learn DOM freshness policy.

## Harsh Take

The current target-fresh method direction fixed real stale-selection bugs, but
it risks semantic API bloat:

- `toggleMark`
- `toggleBlock`
- `toggleList`
- `toggleAlignment`
- `toggleTodo`
- `toggleCallout`
- `toggleWhateverCustomNode`

That is not the final DX. Slate's durable advantage is flexible primitive
transforms over arbitrary JSON-like document models. The perfect v2 should make
those primitives safe under one lifecycle, not replace flexibility with an
endless semantic-method catalog.

The right public headline is:

```txt
All writes happen in `editor.update`.
All coherent reads happen in `editor.read`.
Primitive editor methods are safe inside updates.
Operations remain collaboration truth.
Commits are local runtime truth.
```

## State-Of-The-Art Takeaways

### Lexical

Steal:

- `editor.update(fn)` as the public write lifecycle.
- `editor.read(fn)` as the public coherent read lifecycle.
- update tags for advanced history/collab/render behavior.
- dirty leaves/elements discipline, adapted to Slate paths/runtime ids.
- transform/update lifecycle discipline: no update-listener waterfalls.
- extension dependency graph concepts.

Do not steal:

- `$function` naming.
- class-based node model.
- a full Lexical DOM reconciler as the main story.

Slate v2 adaptation:

- keep JSON-like nodes and operations
- use `read/update` lifecycle
- use commit dirty regions instead of full snapshot reads on urgent paths
- keep direct DOM text sync as a capability, not a global reconciler

### ProseMirror

Steal:

- transaction authority
- position/selection mapping discipline
- selection bookmarks for history/collab-safe restoration
- `selectionFromDOM` and `selectionToDOM` as explicit bridge directions
- DOM observer discipline: browser DOM changes enter through one owner
- decorations as mapped data, not render callbacks

Do not steal:

- integer position document model
- rigid schema-first model
- ProseMirror plugin complexity as the public extension API
- a view layer that forces React to stand outside the editor

Slate v2 adaptation:

- paths/runtime ids replace integer positions
- transactions and operation maps maintain selection/dirty truth
- `slate-react` owns DOM import/export/repair via one runtime owner

### Tiptap

Steal:

- extension ergonomics
- discoverable commands/methods
- optional chain API later
- composable React UI helpers and selector-based UI state

Do not steal:

- required `editor.chain().focus().toggleX().run()` ceremony
- ProseMirror leakage as the normal escape hatch
- advice that React should mostly be isolated from the editor

Slate v2 adaptation:

- `editor.update` eliminates `focus()` ceremony for target freshness
- optional `editor.chain()` can exist later as sugar over `editor.update`
- React integration should be first-class and fast, not avoided

## Final Public API Shape

### Reads

Primary coherent read boundary:

```ts
editor.read(() => {
  editor.getSelection()
  editor.getChildren()
  editor.getMarks()
  editor.getOperations()
  editor.getLastCommit()
})
```

Rules:

- `editor.read` is synchronous.
- `editor.read` never imports DOM selection.
- `editor.read` sees a coherent model/runtime state.
- `editor.read` may flush pending updates if the implementation needs it.
- reads outside `editor.read` may exist only for stable live APIs that are
  explicitly documented as safe.

### Writes

Primary write boundary:

```ts
editor.update(() => {
  editor.setNodes({ type: 'heading-one' })
})
```

Rules:

- `editor.update` creates or reuses one transaction.
- nested updates collapse into one transaction/commit.
- the implicit target is resolved at most once per transaction.
- primitive methods with explicit `at` never import DOM selection.
- primitive methods without explicit `at` use the transaction target.
- all operations emitted inside the update become one `EditorCommit`.
- history, collaboration, React runtime, and DOM repair consume the commit.

### Primitive Methods

Keep flexible primitives as the main power-user/plugin API:

- `editor.setNodes(props, options?)`
- `editor.unsetNodes(key, options?)`
- `editor.wrapNodes(element, options?)`
- `editor.unwrapNodes(options?)`
- `editor.insertNodes(nodes, options?)`
- `editor.removeNodes(options?)`
- `editor.mergeNodes(options?)`
- `editor.splitNodes(options?)`
- `editor.moveNodes(options?)`
- `editor.insertText(text, options?)`
- `editor.delete(options?)`
- `editor.insertFragment(fragment, options?)`
- `editor.select(selection)`

These methods must be safe inside `editor.update`.

### Convenience Methods

Convenience methods are allowed, but they are not the architecture:

- `editor.toggleMark('bold')`
- `editor.toggleBlock('heading-one')`

Do not grow core convenience methods for every app-specific node family.
Custom node families should be implemented from primitives inside
`editor.update`.

### Optional Chain API

Optional later sugar:

```ts
editor
  .chain()
  .unwrapNodes({ match: isList })
  .setNodes({ type: 'list-item' })
  .wrapNodes({ type: 'bulleted-list', children: [] })
  .run()
```

Rules:

- `chain().run()` is sugar over `editor.update`.
- it must not introduce a second transaction engine.
- it must not require `focus()` ceremony for ordinary toolbar commands.

## Extension Model

Public extension shape:

```ts
editor.extend({
  name: 'todo',
  methods: {
    toggleTodo() {
      this.update(() => {
        this.setNodes({ type: 'todo', checked: true })
      })
    },
  },
})
```

Named package shape:

```ts
const TodoExtension = defineEditorExtension({
  name: 'todo',
  methods: {
    toggleTodo() {
      this.update(() => {
        this.setNodes({ type: 'todo', checked: true })
      })
    },
  },
  normalizers: [],
  commands: [],
})
```

Rules:

- extension methods compose through `editor.update`
- arbitrary method monkeypatching is not the extension model
- command registry may exist for internal/event routing
- plugin authors should not choose command policies
- extension dependencies/conflicts are registry-owned, not ad hoc React context

## Target Freshness Contract

Target freshness is internal:

```txt
editor.update
  -> active transaction
  -> tx.resolveTarget()
  -> target runtime asks slate-react only when an implicit current-selection
     mutation needs browser target freshness
```

Rules:

- target freshness is triggered by primitive write methods with no explicit
  `at`
- target freshness is not triggered by `editor.read`
- target freshness is not triggered by `editor.getSelection`
- target freshness is not public API
- DOM import belongs to `slate-react` runtime, not core
- model-owned input paths must not re-import stale DOM target ranges

## React 19.2 Runtime Contract

React receives runtime facts, not responsibility for editor truth:

- live text/node reads
- last commit
- dirty paths
- dirty runtime ids
- dirty top-level ranges
- source-scoped projection invalidation
- semantic islands
- direct DOM text sync capability result
- explicit fallback signal when DOM sync declines an operation

React must not rely on `Editor.getSnapshot()` for urgent render paths.

Direct DOM sync rules:

- custom renderers opt out
- projections/decorations opt out
- composition opts out
- placeholders/zero-width opt out
- multiple string nodes opt out
- accessibility-impacting markup opts out
- app-owned input handlers opt out
- skipped text ops force React fallback

## Hard Cuts

Cut from primary public API/docs/examples:

- `Transforms.*`
- mutable `editor.selection`
- mutable `editor.children`
- mutable `editor.marks`
- mutable `editor.operations`
- public `editor.apply`
- public `editor.onChange`
- command policy objects
- `ReactEditor.runCommand`
- child-count chunking
- arbitrary method monkeypatching
- legacy `decorate` as primary overlay API

Allowed internally:

- private storage for children/selection/marks/operations
- internal command registry for event/kernel routing
- internal `tx.resolveTarget`
- internal compatibility wrappers only while being actively deleted

## Implementation Plan

### Phase 1: Read/Update Lifecycle

Files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`

Implement:

- `editor.read(fn)`
- `editor.update(fn, options?)`
- `Editor.read(editor, fn)`
- `Editor.update(editor, fn, options?)`
- update tags:
  - `history-push`
  - `history-merge`
  - `paste`
  - `collab`
  - `skip-dom-selection`
  - `skip-scroll`
- nested update collapse into one transaction
- read rejects writes in dev/test
- update produces one `EditorCommit`

Tests:

- `../slate-v2/packages/slate/test/read-update-contract.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

### Phase 2: Primitive Method Runtime Contract

Files:

- `../slate-v2/packages/slate/src/transforms-node/**`
- `../slate-v2/packages/slate/src/transforms-text/**`
- `../slate-v2/packages/slate/src/transforms-selection/**`
- `../slate-v2/packages/slate/src/editor/**`

Implement:

- every primitive write method runs inside `editor.update` or reuses active
  update
- every implicit-selection primitive uses transaction target when `at` is
  omitted
- explicit `at` bypasses DOM freshness
- transaction target resolves once

Tests:

- `../slate-v2/packages/slate/test/primitive-method-runtime-contract.ts`
- `../slate-v2/packages/slate/test/editor-methods-contract.ts`
- `../slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`

### Phase 3: Extension Runtime

Files:

- `../slate-v2/packages/slate/src/core/extension-registry.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/test/extension-methods-contract.ts`

Implement:

- `editor.extend({ name, methods, normalizers, commands })`
- `defineEditorExtension(...)`
- conflict detection
- deterministic method composition
- extension methods run through `editor.update`
- no assignment monkeypatching in docs/examples

### Phase 4: React Runtime Alignment

Files:

- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/**`
- `../slate-v2/packages/slate-react/src/hooks/**`

Implement:

- `slate-react` installs target runtime for implicit write targets
- `slate-react` owns DOM import/export/repair
- direct DOM sync returns capability result
- skipped text operations force React fallback
- React selectors consume commit dirtiness/live reads
- no urgent render path depends on `Editor.getSnapshot()`

Tests:

- `../slate-v2/packages/slate-react/test/target-runtime-contract.ts`
- `../slate-v2/packages/slate-react/test/dom-text-sync-contract.ts`
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`

### Phase 5: Public API Hard Cuts

Files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/index.ts`
- `../slate-v2/site/examples/ts/**`
- docs under `docs/slate-v2/**`

Cut:

- public mutable fields
- public `Transforms.*`
- public `apply/onChange` extension points
- stale field examples
- legacy command policy language

Tests:

- `../slate-v2/packages/slate/test/public-field-hard-cut-contract.ts`
- `../slate-v2/packages/slate/test/write-boundary-contract.ts`
- type tests for public surface if available

### Phase 6: Browser Gauntlets

Files:

- `../slate-v2/packages/slate-browser/src/playwright/**`
- `../slate-v2/playwright/integration/examples/**`

Generate scenario families:

- update/read write boundary
- toolbar/app command from browser-selected target
- marks
- simple blocks
- custom block transform from primitives
- list transform from primitives
- alignment transform from primitives
- inline boundaries
- void boundaries
- delete/backspace/range delete
- paste plain/rich/fragment
- undo/redo
- IME/composition
- shadow DOM
- mobile semantic fallback
- large-document shell activation

Every user-facing row asserts:

- model tree/text
- model selection
- visible DOM
- DOM selection/caret where observable
- commit metadata
- no illegal kernel transition
- follow-up typing

### Phase 7: Perf Gates

Required gates:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Perf target:

- React huge-doc remains faster than legacy chunk-off and chunk-on for steady
  typing and ready/mount
- only explicitly accepted first-activation tradeoffs may remain
- urgent render paths do not call full snapshot
- skipped direct DOM sync does not create broad React rerenders

## Completion Criteria

- `editor.read` and `editor.update` are the public lifecycle contract
- primitive methods are safe under `editor.update`
- implicit target resolution is internal and transaction-scoped
- plugin authors can build custom node behavior from primitives without target
  ceremony
- public mutable fields are hard cut from docs/examples/type surface
- `Transforms.*` is removed from primary docs/examples
- `slate-react` consumes live reads/dirty commits, not full snapshots, for urgent
  paths
- generated browser gauntlets cover known command/input families
- cross-browser integration is green or every remaining platform limitation is
  explicitly accepted
- 5000-block React perf gates remain green

## Non-Goals

- no React-first core
- no Lexical node-class model
- no ProseMirror integer-position model
- no required Tiptap-style `focus().chain().run()` ceremony
- no public command policy objects
- no `slate/compat`
- no semantic-method explosion for every custom node type
- no full custom DOM reconciler replacing React as the main renderer

## Superseded Previous Verdict

## Verdict

Pivot to a strict Editor Method Runtime Contract: method-first editor APIs
backed by transaction-owned lazy target resolution.

Do not expose command policy objects, command kinds, `dispatchCommand`, or
`ReactEditor.runCommand` as the normal user/plugin API.

The public DX should be:

```ts
editor.toggleBlock('heading-one')
editor.toggleMark('bold')
editor.setNodes({ type: 'heading-one' })
editor.insertText('x')
editor.deleteBackward()
```

The internal architecture should be:

```txt
all mutating editor methods
  -> Editor.withTransaction
    -> tx.resolveTarget(options)
      -> if explicit at: use explicit target
      -> if implicit target: lazily resolve target through runtime selection authority
    -> operations
    -> commit
    -> history/render/DOM repair
```

## Harsh Take

Batch 6 fixed DOM bridge/caret truth. It did not fix app command authority.

The next regression class is worse for DX: toolbar and plugin commands can still
read stale model selection and mutate the wrong block. The concrete tracer:

- browser selection is in paragraph 2
- user clicks heading toolbar button
- heading toggles paragraph 1

That means Slate v2 still lets app/plugin mutation bypass the runtime selection
target freshness invariant.

The real owner is not "add editor methods." Slate v2 already has many editor
methods and some `Transforms.*` delegation. The owner is guaranteeing that
every selection-dependent editor method and every temporary transform wrapper
resolves implicit targets through the same transaction target runtime.

## Non-Negotiable Direction

Target freshness belongs inside transaction target resolution.

Not:

```ts
ReactEditor.runCommand(editor, () => {
  Transforms.setNodes(editor, { type: 'heading-one' })
})
```

Not:

```ts
editor.dispatchCommand({
  kind: 'set-block',
  policy: 'import-dom-before-command',
})
```

Not:

```ts
editor.registerCommand('toggleTodo', {
  kind: 'selection-transform',
  run() {},
})
```

The final API must not require normal app or plugin authors to know DOM import
policy.

## Core Principle

If an editor method implicitly targets current selection, the transaction must resolve a fresh target before mutation.

Generic model selection reads stay model-only. DOM import belongs to target resolution, not to every selection read.

That is an editor runtime invariant.

Plugin authors should write:

```ts
editor.toggleTodo = (options) => {
  editor.setBlock({ type: 'todo', checked: options.checked })
}
```

The safety lives in `editor.setBlock(...)` resolving its implicit target through the transaction runtime, not in the plugin author choosing a policy.

## Architecture

### Public API

Primary API is editor methods:

- `editor.getSelection()`
- `editor.select(range)`
- `editor.setNodes(props, options?)`
- `editor.setBlock(propsOrType, options?)`
- `editor.toggleBlock(type, options?)`
- `editor.toggleMark(mark, options?)`
- `editor.insertText(text, options?)`
- `editor.deleteBackward(options?)`
- `editor.deleteForward(options?)`
- `editor.deleteFragment(options?)`
- `editor.insertFragment(fragment, options?)`
- `editor.insertBreak(options?)`

`Transforms.*` is not part of the final primary API.

There is no `slate/compat` package for this rewrite.

If a temporary in-package wrapper exists during execution, it is only a staging
mechanism while tests are migrated in the same plan. It is not documented,
exported as a migration story, or treated as a long-term API.

Docs and examples teach editor methods only.

### Transaction Runtime

All mutating editor methods run through `Editor.withTransaction`.

Nested method calls share the active transaction.

`withTransaction` owns:

- operation collection
- commit creation
- dirty metadata
- history handoff
- runtime/render notification
- lazy implicit-target resolution

`withTransaction` does not eagerly import DOM selection on every mutation.

It imports only when a transaction resolves an implicit current-selection target.

### Lazy Target Freshness

Freshness is triggered by:

- `tx.resolveTarget(options)` when no explicit `at` is provided
- editor methods that implicitly target current selection

Freshness is not triggered by:

- `editor.getSelection()` / `tx.getModelSelection()` reads
- methods with explicit `at`
- transactions that never resolve an implicit target
- app/UI code that does not mutate editor state

Examples:

```ts
editor.setNodes({ type: 'heading-one' })
// implicit target; tx.resolveTarget imports current DOM selection if DOM owns selection

editor.setNodes({ type: 'heading-one' }, { at: [1] })
// explicit target; no DOM import required

editor.insertText('x')
// input pipeline already model-owned; target freshness no-ops
```

### Target Runtime Hook

Core stays React-free.

Core owns a framework-neutral target runtime hook:

```ts
editor.targetRuntime = {
  resolveImplicitTarget(editor, request) {
    return Editor.getLiveSelection(editor)
  },
}
```

`slate-react` installs the browser implementation:

```ts
resolveImplicitTarget(editor, request) {
  if (domSelectionBelongsToEditor(editor) && domSelectionIsAuthoritativeForTarget(editor)) {
    return importDOMSelectionAsTarget(editor)
  }

  return Editor.getLiveSelection(editor)
}
```

The request may include internal diagnostics such as:

- implicit target resolution
- transaction id
- current selection source
- event/runtime owner

But normal plugin authors never pass this manually.

### Runtime Authority States

Authority remains internal runtime state:

- DOM current selection
- model-owned selection
- app/internal control
- shell-backed selection
- composition
- clipboard/drag/drop

These states guide `targetRuntime.resolveImplicitTarget`.

They are not public command policy knobs.

### Extension Model

Plugin authors extend editor methods through a deterministic extension API, not
free transforms and not arbitrary instance monkeypatching.

Good:

```ts
editor.extend({
  methods: {
    toggleTodo(options) {
      this.setBlock({ type: 'todo', checked: options.checked })
    },
  },
})
```

Also good for package authors that want a named extension unit:

```ts
const TodoExtension = defineEditorExtension({
  methods: {
    toggleTodo(options) {
      this.setBlock({ type: 'todo', checked: options.checked })
    },
  },
})
```

Bad:

```ts
editor.toggleTodo = (options) => {
  this.setBlock({ type: 'todo', checked: options.checked })
}
```

Lower-level extensions can still use transactions inside registered methods:

```ts
editor.extend({
  methods: {
    myTransform(options) {
      return Editor.withTransaction(this, (tx) => {
        const selection = tx.getSelection()
        // selection is fresh if needed
      })
    },
  },
})
```

Bad:

```ts
editor.myTransform = (options) =>
  Editor.withTransaction(editor, (tx) => {
    const selection = tx.getSelection()
  })
```

Bad:

```ts
Transforms.setNodes(editor, props)
```

Bad:

```ts
editor.selection
```

Bad:

```ts
editor.registerCommand('x', { policy: 'formatting' })
```

The command registry may exist internally, but the public plugin surface is
method-first.

### Write Boundary

Transactions are the only mutation boundary.

All document, selection, mark, operation, history, and runtime notification
changes must flow through:

```txt
editor method
  -> Editor.withTransaction
    -> tx.apply / tx helpers
```

No public API may apply operations or mutate runtime state outside a
transaction.

Collaboration/history/import code may apply operations, but it must enter
through a named editor method or transaction API that creates a commit.

Bad:

```ts
editor.apply(op)
editor.operations.push(op)
editor.selection = range
```

Good:

```ts
editor.applyOperation(op)
editor.withTransaction((tx) => tx.apply(op))
editor.select(range)
```

`editor.applyOperation(...)` is allowed only if it creates/uses a transaction
and emits the same commit metadata as other writes.

### React Runtime

`<Slate>` / `Editable` installs:

- selection runtime
- DOM selection importer
- DOM selection exporter/repairer
- event authority state
- runtime-error guarded browser handle for tests

It should not override every editor method.

It should provide the runtime hook that transactions call when needed.

### Core Hard Cuts

Hard cut from public primary API/docs:

- `Transforms.*`
- mutable `editor.selection` reads/writes
- mutable `editor.children` writes
- mutable `editor.marks` writes
- instance method monkeypatching as extension mechanism
- toolbar examples calling free transforms
- app/plugin commands that mutate selection-dependent content without a
  transaction
- public `editor.operations` queue access
- public `editor.onChange` as extension point
- public `editor.apply` as monkeypatch point
- public operation writes outside a transaction
- arbitrary assignment of plugin/editor methods

No `slate/compat`.

The editor may keep private/internal storage for:

- selection
- children
- marks
- operations

But public access goes through methods:

```ts
editor.getSelection()
editor.getChildren()
editor.getMarks()
editor.getOperations()
```

Public writes go through editor methods:

```ts
editor.select(range)
editor.setNodes(props)
editor.insertText(text)
editor.withTransaction(...)
```

`editor.selection` is stale-by-default and must not appear in app/plugin UI
command code.

## Why This Is Better Than Command Policies

Policy-based APIs leak runtime internals.

If a plugin author must choose between:

- `formatting`
- `selection-transform`
- `ui-only`
- `import-dom-before-command`

the architecture failed.

The method already knows whether it needs implicit selection.

The transaction already knows whether implicit target resolution has been requested.

The React runtime already knows whether DOM selection is authoritative.

So the safest API is:

```ts
editor.setNodes(props)
editor.setNodes(props, { at })
```

No extra policy.

## Field Comparison

### Lexical

Lexical hides this inside updates and command dispatch. Selection is part of
editor state, and DOM selection update is handled in update reconciliation.

Slate v2 should not copy Lexical's data model. It should copy the discipline:
mutations run inside a runtime-owned update/transaction.

### ProseMirror

ProseMirror commands receive `state`, `dispatch`, and `view`; transactions own
selection and document changes.

Slate v2 should not copy ProseMirror's schema model. It should copy the
discipline: commands do not randomly mutate stale editor fields.

### Edix

Edix methods operate on current selection with aggressive operation/selection
tests.

Slate v2 should copy the test discipline: command + selection behavior must be
proved through generated browser scenarios, not one-off examples.

## Implementation Plan

### Phase 0: Audit The Current Runtime Contract

Before new code, inventory the actual current state.

Do:

- list existing editor methods in `../slate-v2/packages/slate/src/interfaces/editor.ts`
- list which methods already call `Editor.withTransaction`
- list which methods or transforms resolve implicit selection unsafely
- list `Transforms.*` wrappers that already delegate to editor methods and
  wrappers that still bypass the method runtime
- list public mutable field reads/writes in:
  - `../slate-v2/packages/slate/**`
  - `../slate-v2/packages/slate-react/**`
  - `../slate-v2/site/examples/ts/**`
- list direct `Transforms.*` use in examples and React-facing tests
- classify each mutable field use:
  - internal storage
  - public read
  - public write
  - stale-prone UI command read
  - test-only legacy assumption

Output:

- append the audit table to this plan before implementation
- name the first owner before touching code
- explicitly mark the Editor Method Runtime Contract status for each
  selection-dependent method:
  - uses transaction
  - uses lazy target freshness for implicit target
  - skips DOM import for explicit `at`
  - emits commit/method metadata
  - has browser/app-command proof if reachable from UI

Do not:

- invent duplicate editor methods that already exist
- keep a compat namespace
- start by migrating examples before the transaction target freshness owner
  is identified

#### Phase 0 Audit Result

Status: complete.

Commands:

```sh
rg -n "editor\\.(selection|children|marks|operations|onChange|apply)\\b|Transforms\\." packages/slate packages/slate-react site/examples/ts -g "*.ts" -g "*.tsx"
```

High-signal findings:

| Area | Current state | Contract status | Owner |
| --- | --- | --- | --- |
| Existing editor methods | `createEditor()` already wires many methods including `setNodes`, `insertText`, `insertFragment`, `deleteBackward`, `select`, `withTransaction`, `getChildren`, `getLiveSelection`, `getOperations` | Do not invent duplicate methods | Audit-only |
| `NodeTransforms` | `insertNodes`, `liftNodes`, `mergeNodes`, `moveNodes`, `removeNodes`, `setNodes`, `splitNodes`, `unsetNodes`, `unwrapNodes`, `wrapNodes` delegate to editor methods | Mostly good as temporary wrappers | Keep until primary API migration, then remove from docs/examples |
| `SelectionTransforms` | `collapse`, `deselect`, `move`, `select`, `setPoint`, `setSelection` delegate to editor methods | Mostly good as temporary wrappers | Keep until primary API migration, then remove from docs/examples |
| `TextTransforms.insertText` | Has direct logic and calls `Transforms.delete`, `Transforms.setSelection`, `Transforms.deselect`, `applyOperation` | Bypasses final method runtime shape | Core method runtime owner |
| `TextTransforms.removeText` | Reads `Editor.getSnapshot(editor).selection?.anchor` | Stale-by-default; wrong hot/read source | Core method runtime owner |
| `Editor.addMark/removeMark` | Use `getCurrentSelection`, then call `Transforms.setNodes/unsetNodes` for expanded selections | Needs lazy target freshness for implicit target | Core method runtime owner |
| `Editor.deleteBackward/deleteForward/deleteFragment` | Read `editor.selection` directly and call `Transforms.delete` | P0 stale selection risk | First core owner after browser tracer |
| `Editor.insertText` | Reads `getCurrentSelection`, delegates back through `Transforms.insertNodes/insertText` | Needs method runtime contract | Core method runtime owner |
| `core/public-state.ts` | Initializes and publishes from `editor.selection`, `editor.marks`, `editor.operations`; uses `editor.apply` fallback internally | Required storage exists, but public fields are still source pressure | Public field hard-cut owner |
| `transforms-node/*` | Many internal transform helpers call `Transforms.*`; `lift-nodes` and `delete-text` can fall back to `editor.apply` | Some are internal composition, but final write boundary must be transaction-only | Core write-boundary owner |
| `slate-react` runtime | Uses `Transforms.*` in caret, selection, clipboard, model input, DOM repair, Android manager | Runtime internal usage can remain temporarily, but must flow through editor methods before closure | React migration owner |
| React hooks | `use-selected`, `use-slate-selection` read `editor.selection` | Stale/public-field pressure | React public-field owner |
| Examples | `richtext`, `inlines`, `markdown-shortcuts`, `images`, `check-lists`, `mentions`, etc. still call `Transforms.*` | Public DX is not final | Example migration owner |
| UI command tracer | `richtext.tsx` toolbar `toggleBlock` still calls `Transforms.unwrapNodes`, `Transforms.setNodes`, `Transforms.wrapNodes` | Direct source of paragraph-2 heading bug | Phase 1 red test owner |

First owner:

- add the red richtext toolbar heading browser tracer
- prove stale model selection is used before mutation
- then fix the shared target freshness runtime, not the local toolbar code

Do not implement before red:

- public field hard cut
- docs migration
- broad example migration
- extension API cleanup

### Phase 1: Characterization

Add a red browser test for the reported bug.

Scenario:

- open richtext
- select paragraph 2 via native DOM selection
- click heading-one toolbar button
- assert paragraph 2 becomes heading
- assert paragraph 1 remains paragraph
- assert model selection points at paragraph 2
- assert DOM selection/caret is still in paragraph 2 where observable
- type follow-up text and prove it lands in paragraph 2
- fail on hidden runtime errors
- assert command authority before mutation:
  - trace/commit shows the command resolved paragraph 2 as the target
  - trace/commit does not show stale paragraph 1 selection as the command input
  - the row fails even if later DOM repair makes final DOM look correct

Primary file:

- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Expected first owner:

- app command target freshness, not DOM bridge mapping.

#### Phase 1 Tracer Result

Status: red-green-partial, then replan required.

Actions:

- Added a Chromium browser tracer in `richtext.test.ts`:
  - force stale semantic model selection in paragraph 1
  - simulate native DOM selection authority in paragraph 2
  - click heading-one toolbar button
  - assert paragraph 2 becomes heading
  - assert paragraph 1 does not become heading
  - type follow-up text and assert model/DOM caret
- Added a framework-neutral selection runtime hook in core and installed a
  `slate-react` DOM selection runtime from `Editable`.
- Changed `setNodes` implicit target resolution from snapshot selection to
  fresh target.

Red evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar heading" --workers=1 --retries=0
```

Initial failure:

- paragraph 1 became heading
- paragraph 2 stayed paragraph

Partial green:

- after lazy target freshness, paragraph 2 became heading and paragraph 1
  stayed paragraph

New red:

- follow-up native typing inserted text in paragraph 2 but model/DOM selection
  stayed at offset `0` instead of advancing to offset `1`
- focused existing richtext rows then showed regressions in:
  - generated navigation/typing
  - generated mark-click typing
  - browser word movement
  - browser line extension
  - paste over selected range

Rejected implementation tactic:

- globally running DOM target freshness from every `getCurrentSelection`
  read is too broad
- it fixes the toolbar target but regresses existing browser selection/mutation
  paths
- patching individual input paths after that creates whack-a-mole and violates
  the plan's goal

Owner classification:

- real owner is narrower than "all current selection reads are fresh"
- target freshness must be transaction-scoped and request-scoped:
  - implicit app-command target resolution needs freshness
  - semantic handle selection must stay model-owned
  - native keyboard movement must keep browser-owned selection
  - input pipeline must not re-import stale DOM during model-owned repair

Decision:

- replan before further implementation
- keep the red toolbar tracer
- do not keep the broad `getCurrentSelection` freshness tactic unless it is
  constrained to transaction target resolution

Next move:

- move freshness from generic `getCurrentSelection` into an explicit
  transaction target resolver used by selection-dependent editor methods
- add a core contract for `tx.resolveTarget({})` instead of changing every
  current-selection read

#### Phase 2 Narrow Target Runtime Result

Status: partial success; continue with formal transaction API and broader
contracts.

Actions:

- Removed the unsafe broad freshness tactic from `getCurrentSelection`.
- Added a narrow core target runtime:
  - `EditorTargetRuntime`
  - `TargetFreshnessRequest`
  - `resolveImplicitTarget(editor, fallback)`
  - `setTargetRuntime(editor, runtime)`
- Updated `setNodes` implicit target resolution to call
  `resolveImplicitTarget(...)`.
- Installed a `slate-react` target runtime from `Editable` that imports DOM
  selection only for implicit target resolution.
- Scheduled model-to-DOM selection export after target import via the existing
  selection reconciler.
- Kept semantic handle selection and browser navigation model-owned/browser-owned
  paths isolated.

Evidence:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|toolbar heading" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar heading|generated|selection|caret|paste over selected" --workers=1 --retries=0
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun run bench:react:rerender-breadth:local
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
```

Results:

- generated navigation + toolbar heading: `2 passed`
- focused Chromium richtext selection/caret/paste subset: `18 passed`
- core transaction contract: `23 passed`
- core snapshot contract: `190 passed`
- slate-react focused contracts: passed
- rerender breadth: no broad text/ancestor renders
- typecheck blocked by existing generated `slate-dom/dist/index.d.ts` aliasing
  issue:
  - `Cannot find name 'BaseEditor'. Did you mean 'BaseEditor$1'?`
  - `Cannot find name 'Editor'. Did you mean 'Editor$1'?`
  - not caused by this target-runtime slice

Owner classification:

- toolbar heading bug owner: implicit target resolution for app commands
- previous broad-freshness tactic owner: rejected
- next owner: formal transaction API/contract, because the current working
  implementation uses a helper from `setNodes` rather than `tx.resolveTarget`

Rejected tactics:

- global DOM freshness from `getCurrentSelection`
- input-path whack-a-mole selection advancement
- direct local toolbar fix

Checkpoint:

- verdict: keep course
- harsh take: the target-runtime shape is validated by the browser tracer, but
  it is not yet the final architecture because it is still a helper, not a
  transaction contract
- why:
  - toolbar heading target and follow-up typing are green
  - prior richtext regressions are green again
  - current implementation is narrower and does not poison native movement/paste
- risks:
  - only `setNodes` uses target freshness so far
  - `tx.resolveTarget` is not formalized
  - public field hard cut is not started
- earliest gates:
  - safety: `transaction-target-runtime-contract.ts`
  - progress: richtext toolbar heading + existing selection/caret/paste subset
- next move:
  - add `tx.resolveTarget(...)` / `tx.getModelSelection()` as formal transaction
    API, move `setNodes` to use it, and add core contract tests
- do-not-do list:
  - do not reintroduce global freshness in `getCurrentSelection`
  - do not migrate examples before core transaction contract lands
  - do not treat the `slate-dom` d.ts aliasing blocker as this lane's failure

#### Phase 2 Transaction Target Runtime Result

Status: complete for the first target-runtime slice.

Actions:

- Removed broad DOM freshness from `getCurrentSelection`.
- Added framework-neutral target runtime types:
  - `TargetFreshnessRequest`
  - `EditorTargetRuntime`
- Added core target runtime helpers:
  - `setTargetRuntime(editor, runtime)`
  - `resolveImplicitTarget(editor, fallback)`
- Added transaction API:
  - `tx.getModelSelection()`
  - `tx.resolveTarget({ at? })`
- Moved `setNodes` implicit target resolution through `tx.resolveTarget`.
- Installed the `slate-react` target runtime in `Editable` and scoped DOM import
  to implicit target resolution only.
- Kept `editor.getSelection()` and `tx.getModelSelection()` model-only.
- Kept semantic handle selection and native browser movement isolated from app
  command target resolution.

Evidence:

```sh
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|toolbar heading" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar heading|generated|selection|caret|paste over selected" --workers=1 --retries=0
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun run bench:react:rerender-breadth:local
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
```

Results:

- transaction target runtime contract: `3 passed`
- generated navigation + toolbar heading: `2 passed`
- focused Chromium richtext selection/caret/paste subset: `18 passed`
- core transaction contract: `23 passed`
- core snapshot contract: `190 passed`
- slate-react focused contracts: passed
- rerender breadth: no broad text/ancestor renders
- typecheck blocked by known generated `slate-dom/dist/index.d.ts` aliasing:
  - `Cannot find name 'BaseEditor'. Did you mean 'BaseEditor$1'?`
  - `Cannot find name 'Editor'. Did you mean 'Editor$1'?`
  - `Cannot find name 'Ancestor'. Did you mean 'Ancestor$1'?`

Owner classification:

- app-command toolbar heading bug: fixed by transaction target runtime
- previous global freshness tactic: rejected
- remaining plan owners:
  - public field hard cut
  - editor method API completion
  - deterministic extension methods
  - examples/docs migration
  - generated app-command gauntlets beyond richtext heading

Rejected tactics:

- global `getCurrentSelection` freshness
- input-path selection advancement patches
- local toolbar import workaround

Checkpoint:

- verdict: keep course
- harsh take: the right architecture is now validated, but the plan is not
  complete; public surface still leaks stale fields and `Transforms.*`
- why:
  - toolbar heading bug is fixed without local toolbar policy or wrapper
  - existing richtext navigation/mark/paste rows are green
  - target freshness is transaction-scoped instead of global
- risks:
  - only `setNodes` uses `tx.resolveTarget` so far
  - public mutable fields still exist
  - examples still teach `Transforms.*`
  - typecheck still hits the unrelated `slate-dom` d.ts aliasing blocker
- earliest gates:
  - safety: `public-field-hard-cut-contract.ts`
  - progress: migrate richtext toolbar to editor methods without changing
    behavior
- next move:
  - add public-field hard-cut contract and start replacing stale `editor.selection`
    reads in React-facing code with method/runtime reads
- do-not-do list:
  - do not declare completion from one target-runtime method
  - do not create `slate/compat`
  - do not expose command policies or kinds

### Phase 2: Core Transaction Target Runtime

Add the framework-neutral target runtime hook.

Primary files:

- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/core/transaction.ts`
- `../slate-v2/packages/slate/src/core/apply.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`

Required behavior:

- `Editor.withTransaction` creates or reuses the active transaction.
- `tx.getModelSelection()` returns model selection without DOM import.
- `tx.resolveTarget({ at })` returns explicit `at` without DOM import.
- `tx.resolveTarget({})` lazily requests a fresh implicit target.
- implicit target freshness happens at most once per transaction unless invalidated.
- no React imports in `slate`.

Tests:

- `../slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`

Scenarios:

- explicit `at` does not request freshness
- implicit target resolution requests freshness once
- nested transactions share resolved target result
- transaction with no implicit target work does not request freshness
- commit contains selection-before/after and command/method metadata

### Phase 3: Editor Method API

Promote editor methods as the only primary write API.

Primary files:

- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/transforms-node/**`
- `../slate-v2/packages/slate/src/transforms-selection/**`
- `../slate-v2/packages/slate/src/transforms-text/**`

Required methods:

- `editor.select`
- `editor.setNodes`
- `editor.setBlock`
- `editor.toggleBlock`
- `editor.toggleMark`
- `editor.insertText`
- `editor.insertFragment`
- `editor.insertBreak`
- `editor.deleteBackward`
- `editor.deleteForward`
- `editor.deleteFragment`
- `editor.getSelection`
- `editor.getChildren`
- `editor.getMarks`
- `editor.getOperations`

Rules:

- all mutating methods use `Editor.withTransaction`
- methods with explicit `at` avoid implicit target freshness
- methods without explicit `at` use lazy target freshness
- public `Transforms.*` imports are removed from docs/examples
- internal transform helpers may exist only behind editor methods
- no public `editor.selection` reads in new tests/docs/examples
- no public mutable field writes

Tests:

- `../slate-v2/packages/slate/test/editor-methods-contract.ts`
- `../slate-v2/packages/slate/test/public-field-hard-cut-contract.ts`

### Phase 4: Public Field Hard Cut

Hard cut stalable fields from the public type/documented surface.

Primary files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/index.ts`

Cut from public primary surface:

- `editor.selection`
- `editor.children` writes
- `editor.marks`
- `editor.operations`
- `editor.onChange`
- `editor.apply` monkeypatching

Replace with method API:

- `editor.getSelection()`
- `editor.getChildren()`
- `editor.getMarks()`
- `editor.getOperations()`
- `editor.subscribe(listener)`
- `editor.applyOperation(op)` or equivalent final method

Rules:

- private/internal storage is allowed
- public direct mutable field access is not
- public operation writes outside transactions are not allowed
- tests should assert the method API, not the absence of old names unless this
  is a type-level/public-surface contract
- no `slate/compat`

Tests:

- `../slate-v2/packages/slate/test/public-field-hard-cut-contract.ts`
- type-level public API test if the package already has a type-test lane

### Phase 5: React Target Runtime

Install browser implicit-target resolution in `slate-react`.

Primary files:

- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/selection-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/input-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`

Required behavior:

- if DOM selection belongs to editor and DOM source is authoritative for app-command targeting, importing happens before implicit-target editor method work
- if model-owned selection is active, preserve model selection
- if internal control/nested input/shell is active, do not import unrelated DOM
  selection
- import result is traced in kernel/debug output
- target freshness is installed once per editor/runtime and cannot be bypassed by toolbar/app/plugin editor methods
- no toolbar/app code needs to call import manually

Tests:

- `../slate-v2/packages/slate-react/test/target-runtime-contract.ts`
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/selection-controller-contract.ts`

### Phase 6: Example And Plugin Surface Migration

Migrate examples from `Transforms.*` and stale public fields to editor methods.

Primary files:

- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/site/examples/ts/hovering-toolbar.tsx`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` only after Android
  scheduling is accounted for
- other examples only when a search proves direct `Transforms.*` use

Rules:

- no direct `editor.selection` reads in toolbar command logic
- toolbar buttons call editor methods
- button command does not manually import DOM selection
- docs teach editor methods only
- no `Transforms.*` imports in examples after the migration slice
- no public field reads in app/plugin command examples
- plugin examples use `editor.extend({ methods: ... })`, not assignment-based
  monkeypatching

Tests:

- existing example Playwright rows
- new app-command gauntlets
- extension-method composition contract

### Phase 7: Generated App-Command Gauntlets

Add generated scenario coverage for app/plugin commands.

Required scenario families:

- paragraph 2 native selection -> heading button -> paragraph 2 changes
- paragraph 2 native selection -> block quote button -> paragraph 2 changes
- paragraph 2 native selection -> list button -> paragraph 2 changes
- selected text -> toolbar bold -> selected text changes
- decorated/projected text -> toolbar mark -> correct selection changes
- inline boundary -> toolbar command -> correct target changes
- internal control/nested input -> toolbar/app action -> model selection
  preserved when appropriate

Every row asserts:

- no runtime/page errors
- command target/selection input before mutation
- model selection
- visible DOM
- DOM selection/caret where observable
- follow-up typing
- kernel trace has no illegal transition

Primary files:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`

### Phase 8: Public Surface Cleanup

After method API, hard cuts, and React runtime are green:

- remove leftover docs references to `Transforms.*` as public API
- remove direct mutable field examples
- update package exports if needed
- add changeset if package public surface changes

Do not create a compatibility namespace.

If a temporary wrapper remains inside the package while tests migrate, it must
be explicitly listed as temporary execution debt and removed before closure.

## Driver Gates

Core:

```sh
bun test ./packages/slate/test/public-field-hard-cut-contract.ts --bail 1
bun test ./packages/slate/test/write-boundary-contract.ts --bail 1
bun test ./packages/slate/test/extension-methods-contract.ts --bail 1
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/editor-methods-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
```

React:

```sh
bun test ./packages/slate-react/test/target-runtime-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
```

Browser:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "heading|toolbar|app command|selection" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
```

Perf:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Build/type/lint:

```sh
bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --force
bun run lint:fix
bun run lint
```

## Completion Criteria

- paragraph 2 -> toolbar heading changes paragraph 2, not paragraph 1
- editor method API exists for primary writes
- mutating editor methods use `Editor.withTransaction`
- implicit-target methods lazily resolve fresh target
- explicit `at` methods do not import DOM selection
- stalable public fields are hard cut from primary API/docs
- no `slate/compat`
- `slate-react` installs selection runtime once, not per method
- plugin/custom editor methods compose through `editor.extend({ methods })` and
  editor methods without policies
- no arbitrary method monkeypatching is part of the final extension model
- no public operation write bypasses `Editor.withTransaction`
- `Transforms.*` is removed from docs/examples as primary API; no final compat
  namespace exists
- examples/docs stop teaching direct `Transforms.*` for UI commands
- generated app-command gauntlets pass across browser projects
- 5000-block React perf remains green or exact deferred perf owner is recorded

## Non-Goals

- no React-first core
- no command policy objects in normal app/plugin code
- no `ReactEditor.runCommand` public ceremony
- no command `kind` taxonomy exposed to plugin authors
- no `slate/compat`
- no public mutable field API
- no final compatibility wrappers that bypass editor methods
- no arbitrary editor method assignment as the extension model
- no public mutation path outside transactions
- no unrelated markdown Android scheduling work
- no unrelated select-all tail-latency perf lane

## Final Decision

The absolute-best direction is:

```txt
method-first public API
transaction-owned lazy target resolution
React-installed selection runtime
hard-cut public mutable fields
deterministic extension methods
transaction-only write boundary
generated app-command browser gauntlets
```

If plugin authors need to understand DOM selection import policy, the
architecture failed.

## Execution Ledger

### Phase 2/3 Target Runtime And Richtext Method Slice

Status: complete for the first target-runtime and richtext method slice; plan
remains open.

Actions:

- Removed the rejected global `getCurrentSelection` freshness tactic.
- Added framework-neutral target runtime types and helpers:
  - `TargetFreshnessRequest`
  - `EditorTargetRuntime`
  - `setTargetRuntime(editor, runtime)`
  - `resolveImplicitTarget(editor, fallback)`
- Added transaction API:
  - `tx.getModelSelection()`
  - `tx.resolveTarget({ at? })`
- Moved `setNodes` implicit target resolution through `tx.resolveTarget`.
- Installed `slate-react` target runtime in `Editable`; it imports DOM selection
  only for implicit target resolution.
- Scheduled model-to-DOM export after implicit target import through the
  existing selection reconciler.
- Added `transaction-target-runtime-contract.ts`.
- Added the red/green richtext toolbar heading tracer.
- Migrated `site/examples/ts/richtext.tsx` block toolbar commands from
  `Transforms.*` to editor methods:
  - `editor.unwrapNodes`
  - `editor.setNodes`
  - `editor.wrapNodes`
- Removed React hook source reads of `editor.selection` in `useSelected` and
  `useSlateSelection`.

Evidence:

```sh
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bunx vitest run --config ./vitest.config.mjs test/use-selected.test.tsx
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|toolbar heading" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar heading|generated|selection|caret|paste over selected" --workers=1 --retries=0
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar heading|renders rich text|generated mark typing" --workers=1 --retries=0
bun run bench:react:rerender-breadth:local
bun run lint:fix
bun run lint
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
```

Results:

- transaction target runtime contract: `3 passed`
- core transaction contract: `23 passed`
- core snapshot contract: `190 passed`
- slate-react focused contracts: passed
- `useSelected` test: `4 passed`
- richtext generated navigation + toolbar heading: `2 passed`
- focused Chromium richtext selection/caret/paste subset: `18 passed`
- focused richtext method migration rows: `3 passed`
- rerender breadth: no broad text/ancestor renders
- lint: passed
- typecheck: blocked by existing generated `slate-dom/dist/index.d.ts`
  aliasing issue, not this slice:
  - `Cannot find name 'BaseEditor'. Did you mean 'BaseEditor$1'?`
  - `Cannot find name 'Editor'. Did you mean 'Editor$1'?`
  - `Cannot find name 'Ancestor'. Did you mean 'Ancestor$1'?`

Owner classification:

- toolbar heading stale-selection class: fixed by target runtime + editor
  methods, not local toolbar policy
- previous global freshness tactic: rejected and removed
- remaining owners:
  - public mutable field hard cut
  - transaction-only write-boundary contract
  - deterministic extension method API
  - broader example/docs migration away from `Transforms.*`
  - cross-project generated app-command gauntlets

Rejected tactics:

- global DOM freshness on all current selection reads
- input-path selection advancement patches
- local toolbar import wrapper
- `ReactEditor.runCommand`
- public command policies/kinds

Next move:

- add and satisfy `public-field-hard-cut-contract.ts` and
  `write-boundary-contract.ts` incrementally, starting with type/runtime
  contracts that prevent new React-facing `editor.selection` reads and public
  operation writes.

### Phase 3 Target-Fresh Mark Methods And Composition Fallback Slice

Status: complete for target-fresh mark methods and the discovered direct-DOM
composition fallback gap; plan remains open.

Actions:

- Added `editor.toggleMark(key, value?)` as the method-first public mark toggle.
- Moved `Editor.addMark` and `Editor.removeMark` selection decisions inside
  `Editor.withTransaction` and `tx.resolveTarget()`.
- Cached implicit target resolution once per transaction.
- Migrated richtext mark toolbar and hotkeys to `editor.toggleMark(...)`.
- Removed the richtext example's direct `editor.selection` read in block active
  state; it uses `editor.getSelection()`.
- Added a `mark-button-*` test id for app-command browser proof.
- Added core method contracts for:
  - `addMark` targeting the transaction-resolved implicit target
  - `removeMark` targeting the transaction-resolved implicit target
  - `toggleMark` deciding active state from the transaction-resolved target
  - transaction target runtime resolving at most once per transaction
- Added a richtext browser row proving toolbar bold applies to browser-selected
  text even when stale model selection points at already-bold text.
- Fixed the large-doc composition fallback:
  - `syncTextOperationsToDOM` reports text-op sync counts
  - `Slate` forces React selector updates only when text operations were not
    directly DOM-synced
  - composing selection repair creates an end caret when the DOM selection has
    no range instead of calling `collapseToEnd()` unsafely
- Tightened two `large-doc-and-scroll` React event fixtures to use
  `withReact(createEditor())` instead of a bare core editor.
- Added a changeset for the new `slate` public method.
- Captured reusable direct-DOM fallback learning in
  `docs/solutions/ui-bugs/2026-04-23-slate-react-unsynced-dom-text-ops-must-force-react-fallback.md`.

Commands:

```sh
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/editor-methods-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate-react/test/selection-controller-contract.ts --bail 1
bun test ./packages/slate-react/test/editing-kernel-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bun test ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar bold|toolbar heading|generated mark typing" --workers=1 --retries=0
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Evidence:

- transaction target runtime contract: `4 passed`
- editor methods contract: `3 passed`
- core transaction contract: `23 passed`
- core snapshot contract: `190 passed`
- slate-react selection controller contract: `2 passed`
- slate-react editing kernel contract: `3 passed`
- DOM text sync contract: `1 passed`
- DOM repair policy contract: `2 passed`
- large doc and scroll contract: `15 passed`
- projections and selection contract: `6 passed`
- focused Chromium richtext rows: `3 passed`
  - generated mark typing gauntlet
  - toolbar heading target freshness
  - toolbar bold target freshness
- lint: passed
- build: `slate`, `slate-react`, and `slate-browser` passed
- typecheck: blocked by existing generated `slate-dom/dist/index.d.ts`
  aliasing, not this slice:
  - `Cannot find name 'BaseEditor'. Did you mean 'BaseEditor$1'?`
  - `Cannot find name 'Editor'. Did you mean 'Editor$1'?`
  - `Cannot find name 'Ancestor'. Did you mean 'Ancestor$1'?`
- rerender breadth: passed; no broad text/ancestor renders
- 5000-block huge compare: command exited `0`; v2 remains far faster than
  legacy chunk-off and faster than chunk-on for ready, start typing,
  promoted-middle typing, and full-document replacement/fragment. Current run
  still shows the accepted first-activation class:
  - `v2 middleBlockTypeMs mean 53.66ms` vs `legacy chunk-on 33.27ms`
  - `v2 middleBlockSelectThenTypeMs mean 48.53ms` vs `legacy chunk-on 32.88ms`
  - `v2 middleBlockPromoteThenTypeMs mean 13.94ms` vs `legacy chunk-on 31.28ms`
  - `v2 readyMs mean 12.05ms` vs `legacy chunk-on 291.63ms`

Artifacts:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/editor-methods-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `/Users/zbeyens/git/slate-v2/.changeset/editor-method-target-fresh-marks.md`

Hypothesis:

- App/plugin mark toggles were still vulnerable because active mark state and
  add/remove decisions happened before target freshness.
- Direct-DOM text sync fallback was incomplete because text ops were hidden from
  React even when composition or capability checks declined direct DOM sync.

Decision:

- Keep method-first DX.
- Target-sensitive editor methods own target resolution.
- App/plugin authors should call `editor.toggleMark(...)`, not manually read
  marks and choose `addMark/removeMark`.
- Direct DOM sync must report whether it actually handled text ops; skipped
  sync requires React fallback.

Owner classification:

- mark toolbar stale target: core editor method runtime owner
- composition text fallback: slate-react DOM-sync capability owner
- empty DOM selection during composing repair: slate-react selection repair
  fail-closed owner
- bare core editor in React event rows: test fixture owner
- typecheck blocker: existing generated `slate-dom` declaration alias owner

Changed files:

- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/editor/add-mark.ts`
- `../slate-v2/packages/slate/src/editor/remove-mark.ts`
- `../slate-v2/packages/slate/src/editor/toggle-mark.ts`
- `../slate-v2/packages/slate/src/editor/index.ts`
- `../slate-v2/packages/slate/src/editor/is-editor.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/test/editor-methods-contract.ts`
- `../slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/.changeset/editor-method-target-fresh-marks.md`
- `docs/solutions/ui-bugs/2026-04-23-slate-react-unsynced-dom-text-ops-must-force-react-fallback.md`

Rejected tactics:

- public command policy/kind ceremony
- `ReactEditor.runCommand`
- local toolbar DOM import
- global `getCurrentSelection` freshness
- hiding unsynced text ops behind direct-DOM fast path optimism
- treating bare core editors as valid React event fixtures

Checkpoint:

- verdict: keep course
- harsh take: this closes another real stale-target class, but the plan is not
  done; block/list commands still need the same method-first treatment and
  public field hard cuts remain open
- why:
  - target freshness now covers marks, not only `setNodes`
  - app command browser proof covers heading and bold
  - composition fallback is safer without broad React rerenders on the fast path
- risks:
  - `toggleBlock`/`setBlock` are still example-owned logic, not core methods
  - examples beyond richtext still teach `Transforms.*`
  - public mutable fields still exist
  - typecheck remains blocked by generated `slate-dom` declarations
- earliest gates:
  - safety: add `setBlock`/`toggleBlock` editor-method contract with stale
    active-state target proof
  - browser: add toolbar blockquote/list app-command row after core method lands
  - cleanup: public-field hard-cut contract
- next move:
  - implement core `editor.setBlock` / `editor.toggleBlock` or a narrower
    block-format method API that removes stale active-state logic from
    richtext block toolbar without exposing command policies
- do-not-do list:
  - do not reintroduce global selection freshness
  - do not keep moving example-specific block logic around without a core method
  - do not call the lane complete while public fields and non-richtext
    `Transforms.*` examples remain

### Phase 3 Block Method Follow-Up Slice

Status: complete for basic block-format method ownership; plan remains open.

Actions:

- Added core editor methods:
  - `editor.setBlock(props, options?)`
  - `editor.toggleBlock(type, options?)`
- Implemented block methods through `Editor.withTransaction` and
  `tx.resolveTarget({ at })`.
- Added a core contract proving `toggleBlock` decides active state from the
  transaction-resolved implicit target, not stale model selection.
- Migrated richtext heading/block-quote toolbar commands to
  `editor.toggleBlock(...)`.
- Kept list/align example logic out of the core method for now because those
  need a richer block/list command contract rather than another quick local
  patch.
- Added a browser row where stale model selection is already `heading-one` but
  browser target is paragraph 2; clicking heading makes paragraph 2 a heading
  instead of toggling it back to paragraph.
- Updated the changeset to include `setBlock` and `toggleBlock`.

Commands:

```sh
bun test ./packages/slate/test/editor-methods-contract.ts --bail 1
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/transaction-contract.ts --bail 1
bun test ./packages/slate/test/snapshot-contract.ts --bail 1
bun test ./packages/slate/test/surface-contract.ts --bail 1
bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1
bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "toolbar bold|toolbar heading|generated mark typing" --workers=1 --retries=0
bun run lint:fix
bun run lint
bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-browser --force
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Evidence:

- editor methods contract: `4 passed`
- transaction target runtime contract: `4 passed`
- core transaction contract: `23 passed`
- core snapshot contract: `190 passed`
- core surface contract: `10 passed`
- slate-react large-doc contract: `15 passed`
- projections and selection contract: `6 passed`
- focused Chromium richtext app-command rows: `4 passed`
- lint: passed
- build: `slate`, `slate-react`, and `slate-browser` passed
- typecheck: `slate` and `slate-browser` passed; `slate-react` remains blocked
  by the known generated `slate-dom/dist/index.d.ts` aliasing issue:
  - `Cannot find name 'BaseEditor'. Did you mean 'BaseEditor$1'?`
  - `Cannot find name 'Editor'. Did you mean 'Editor$1'?`
  - `Cannot find name 'Ancestor'. Did you mean 'Ancestor$1'?`
- core observation compare: command exited `0`; current faster than legacy on
  all measured means:
  - children length `0.69ms` vs `1.09ms`
  - root nodes `6.51ms` vs `8.57ms`
  - first block positions `0.88ms` vs `1.71ms`
- core huge-document compare: command exited `0`; current faster or effectively
  tied:
  - start block type `0.65ms` vs `0.66ms`
  - middle block type `0.39ms` vs `0.51ms`
  - replace full document `3.51ms` vs `8.43ms`
  - insert fragment full document `4.01ms` vs `8.46ms`
  - select all `0.02ms` vs `0.01ms`

Artifacts:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/block-format.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/editor-methods-contract.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts`
- `/Users/zbeyens/git/slate-v2/.changeset/editor-method-target-fresh-marks.md`

Hypothesis:

- Block toolbar still had stale active-state risk because `isBlockActive(...)`
  lived in example code and read stale model selection before the target runtime
  resolved the browser target.

Decision:

- Basic block type toggles belong in core editor methods.
- List and align need their own command contract; do not pretend the generic
  `toggleBlock(type)` API solves list wrapping or alignment semantics.

Owner classification:

- heading/block-quote stale active state: core block method owner
- list/align toolbar: still open command-family owner
- examples still using `Transforms.*`: migration owner
- public mutable fields: hard-cut owner

Rejected tactics:

- keep example-owned heading logic
- add command policy objects
- stuff list wrapping into a too-generic `toggleBlock`

Checkpoint:

- verdict: keep course
- harsh take: the block API is now safer for simple block type toggles, but
  list/align and public field cleanup are still not closed
- why:
  - stale active-state heading browser proof is green
  - block method contract uses transaction target resolution
  - core perf gates remain green
- risks:
  - list and align commands still use example logic
  - non-richtext examples still use `Transforms.*`
  - public mutable fields still exist
  - `slate-react` typecheck remains blocked by generated `slate-dom` d.ts
- earliest gates:
  - add list/align command contracts or explicitly scope them out of generic
    block API
  - add public-field hard-cut/write-boundary contracts
- next move:
  - audit remaining richtext list/align toolbar and non-richtext `Transforms.*`
    examples; choose one command-family owner instead of broad mechanical
    migration
- do-not-do list:
  - do not claim final API closure from heading/bold only
  - do not hide list semantics behind a misleading generic block method
  - do not ignore public mutable field hard cuts
