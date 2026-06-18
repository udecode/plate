# Slate v2 BaseEditor State/Tx Hard Cut Plan

Date: 2026-04-29
Status: done
Implementation status: complete
Code repo: `/Users/zbeyens/git/slate-v2`
Plan repo: `/Users/zbeyens/git/plate-2`

## 1. Verdict

Hard cut the public `BaseEditor` instance query/read surface.

The current public shape still has two competing APIs:

1. `editor.read((state) => ...)` and `editor.update((tx) => ...)`
2. direct instance reads and queries such as `editor.getSnapshot()`,
   `editor.getSelection()`, `editor.getChildren()`, `editor.string(...)`,
   `editor.above(...)`, `editor.before(...)`, `editor.pathRef(...)`, and
   `editor.schema.define(...)`

That is not a clean rewrite. It is a transaction-first API with a legacy
instance API still attached.

The target public editor is small:

```ts
export interface Editor<V extends Value = Value> {
  read<T>(fn: (state: EditorStateView<V>) => T): T;
  update(
    fn: (tx: EditorUpdateTransaction<V>) => void,
    options?: EditorUpdateOptions,
  ): void;
  subscribe(listener: SnapshotListener<V>): () => void;
  extend(extension: EditorExtensionInput<V>): () => void;
}
```

`subscribe` is an advanced adapter/runtime bridge. Normal app code uses
React hooks or `read` / `update`.

## 2. Current Evidence

Live source:

- `packages/slate/src/interfaces/editor.ts`
  - `BaseEditor` exposes direct reads: `getChildren`, `getFragment`,
    `getLastCommit`, `getOperations`, `getSelection`, `getSnapshot`,
    `getRuntimeId`, and `getPathByRuntimeId`.
  - `BaseEditor` exposes direct queries: `above`, `after`, `before`,
    `edges`, `first`, `fragment`, `hasBlocks`, `hasInlines`, `hasPath`,
    `isBlock`, `isEmpty`, `levels`, `nodes`-style traversal through
    `levels` / `next` / `previous`, refs, `string`, `unhangRange`, and
    `void`.
  - Those aliases are typed through `OmitFirstArg<typeof Editor.*>`, keeping
    the internal static `Editor` table embedded in the public editor type.
- `packages/slate/src/create-editor.ts`
  - `createEditor()` still attaches every direct query/read alias onto the
    editor object.
- `packages/slate/src/core/public-state.ts`
  - `state` / `tx` groups already exist, but they are incomplete; they call
    back through direct editor aliases for several reads.
- Current call-site pressure includes `slate-history`, `slate-dom`, site
  examples, and tests using direct instance reads.

## 3. Intent And Boundaries

Intent:

- Make `read` / `update` the only normal public editor-state API.
- Remove duplicate ways to read the document, selection, operations, schema,
  traversal, refs, and text.
- Break public type coupling to the internal static `Editor` implementation.
- Keep raw Slate unopinionated. This is core API cleanup, not Plate-style
  command sugar.

In scope:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate/src/core/public-state.ts`
- internal runtime helpers needed by core packages
- `slate-dom`, `slate-history`, `slate-react`, `slate-hyperscript` call sites
- site examples and docs that teach direct editor reads
- public-surface and type contract tests

Out of scope:

- current-version Plate adapters
- current-version slate-yjs adapters
- React render/runtime event rewrites
- browser selection policy rewrites
- `editor.refs` as a public object proposal
- changing pure data namespaces: `Node`, `Path`, `Point`, `Range`, `Element`,
  `Text`, `Operation`

Decision boundary:

- No compatibility aliases.
- No deprecated shims.
- No “removed API” docs.
- If an API is only needed by core/runtime/tests, move it behind
  `slate/internal` or a package-local helper.

## 4. Public API Target

### Editor

Keep:

```ts
editor.read((state) => ...)
editor.update((tx) => ...)
editor.subscribe(listener)
editor.extend(extension)
```

Cut from public `BaseEditor`:

- document reads: `getChildren`, `getFragment`, `getSelection`,
  `getSnapshot`, `getOperations`, `getLastCommit`
- runtime id reads: `getRuntimeId`, `getPathByRuntimeId`
- dirtiness reads: `getDirtyPaths`, `getOperationDirtiness`
- direct schema object: `schema`
- direct normalization hooks as public app methods: `normalizeNode`,
  `shouldNormalize`
- all direct query aliases: `above`, `after`, `before`, `edges`, `first`,
  `fragment`, `hasBlocks`, `hasInlines`, `hasPath`, `hasTexts`, `isBlock`,
  `isEdge`, `isEmpty`, `isEnd`, `isNormalizing`, `isStart`, `last`, `leaf`,
  `levels`, `next`, `parent`, `path`, `point`, `positions`, `previous`,
  `projectRange`, `range`, `string`, `unhangRange`, `void`,
  `shouldMergeNodesRemovePrevNode`
- ref aliases: `pathRef`, `pathRefs`, `pointRef`, `pointRefs`, `rangeRef`,
  `rangeRefs`
- any `OmitFirstArg<typeof Editor.*>` reference in public `BaseEditor`

### State View

Expand `EditorStateView` until every surviving read has one obvious home:

```ts
editor.read((state) => {
  state.value.get();
  state.value.snapshot();
  state.value.operations({ since: 0 });
  state.value.lastCommit();

  state.selection.get();
  state.marks.get();

  state.nodes.children([]);
  state.nodes.get([0]);
  state.nodes.parent([0, 0]);
  state.nodes.above({ at, match });
  state.nodes.first(at);
  state.nodes.last(at);
  state.nodes.leaf(at);
  state.nodes.levels({ at });
  state.nodes.next({ at });
  state.nodes.previous({ at });
  state.nodes.match({ at });
  state.nodes.hasPath(path);
  state.nodes.isBlock(element);
  state.nodes.isEmpty(element);
  state.nodes.hasBlocks(element);
  state.nodes.hasInlines(element);
  state.nodes.hasTexts(element);
  state.nodes.void({ at });

  state.points.before(at, options);
  state.points.after(at, options);
  state.points.start(at);
  state.points.end(at);
  state.points.get(at, options);
  state.points.isEdge(point, at);
  state.points.isStart(point, at);
  state.points.isEnd(point, at);

  state.ranges.get(at);
  state.ranges.edges(at);
  state.ranges.unhang(range, options);
  state.ranges.project(range);

  state.text.string(at, options);

  state.schema.getElementSpec(type);
  state.schema.isInline(element);
  state.schema.isBlock(element);
  state.schema.isVoid(element);
  state.schema.isElementReadOnly(element);
  state.schema.isSelectable(element);
  state.schema.markableVoid(element);

  state.runtime.idAt(path);
  state.runtime.pathOf(runtimeId);
});
```

No direct editor instance query is the normal read path.

### Transaction View

`tx` inherits read groups and adds writes:

```ts
editor.update((tx) => {
  tx.value.replace(value);
  tx.operations.replay(ops);

  tx.nodes.set(props, options);
  tx.nodes.insert(node, options);
  tx.nodes.remove(options);
  tx.nodes.move(options);
  tx.nodes.wrap(element, options);
  tx.nodes.unwrap(options);
  tx.nodes.split(options);
  tx.nodes.merge(options);

  tx.selection.set(target);
  tx.selection.clear();
  tx.selection.move(options);
  tx.selection.collapse(options);

  tx.text.insert(text, options);
  tx.text.delete(options);

  tx.marks.add(key, value);
  tx.marks.remove(key);
  tx.marks.toggle(key, options);

  tx.normalize(options);
  tx.withoutNormalizing(fn);
});
```

If refs remain public, they live in state/tx groups, not on `editor`:

```ts
editor.update((tx) => {
  const ref = tx.refs.path(path, options);
});
```

If refs are only runtime infrastructure, they move to `slate/internal`.

### Extension And Schema

Public schema mutation should not be `editor.schema.define(...)`.

Target:

```ts
const cleanup = editor.extend(
  defineEditorExtension({
    elements: [
      {
        type: "image",
        void: "block",
        selectable: true,
      },
    ],
  }),
);
```

Read schema facts through `state.schema` / `tx.schema`.

Internal packages can use a runtime schema registry, but the public editor
object should not expose a mutable schema object.

## 5. Internal Runtime Target

Introduce an internal runtime object that owns the removed direct methods:

```ts
type EditorRuntime<V extends Value = Value> = {
  state: InternalEditorStateApi<V>;
  queries: InternalEditorQueryApi<V>;
  transforms: EditorTransformRegistry<V>;
  refs: InternalEditorRefApi;
  schema: InternalEditorSchemaApi;
  normalize: InternalEditorNormalizeApi;
};
```

Rules:

- `createEditor()` returns the small public editor object.
- Internal runtime is stored out-of-band, keyed by editor identity.
- Core implementation files call internal runtime helpers, not public instance
  aliases.
- `slate/internal` exports internal helpers for first-party packages only.
- Public types do not mention `EditorStaticApi`, `InternalEditor`, or
  `OmitFirstArg<typeof Editor.*>`.

This keeps extension override points, but they are explicit extension/runtime
registration points, not monkeypatched methods on the public editor object.

## 6. Migration Backbone

Plate migration backbone:

- Plate can install behavior through `editor.extend(...)`.
- Plate can add state/tx groups through extension registration.
- Plate commands can call `editor.update((tx) => ...)`.
- Plate UI hooks can subscribe through node/runtime-id selectors, not broad
  editor instance reads.

slate-yjs migration backbone:

- Collaboration reads snapshots/commits through `state.value.snapshot()` and
  `state.value.lastCommit()`.
- Remote operations apply through `tx.operations.replay(...)`.
- Runtime ids remain available through `state.runtime`.
- Subscription remains available through `editor.subscribe(...)` as an
  advanced adapter bridge.

No current-version adapter compatibility is required.

## 7. Execution Phases

### Phase 1: Red Public-Surface Contracts

Add tests before implementation:

- `BaseEditor` public keys are exactly:
  - `read`
  - `update`
  - `subscribe`
  - `extend`
- `editor.getSnapshot`, `editor.getSelection`, `editor.getChildren`,
  `editor.string`, `editor.above`, `editor.pathRef`, and `editor.schema` are
  type errors and absent at runtime.
- public `BaseEditor` source has no `OmitFirstArg<typeof Editor`.
- public root `slate` still exports `type Editor`, not runtime `Editor`.
- pure namespaces still work: `Node`, `Path`, `Point`, `Range`, `Element`,
  `Text`, `Operation`.

Focused command:

```bash
bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts
```

Expected before implementation: red.

### Phase 2: Complete State/Tx Read Coverage

Add missing state groups before deleting aliases:

- `state.value.snapshot()`
- `state.value.operations(options?)`
- `state.value.lastCommit()`
- `state.runtime.idAt(path)`
- `state.runtime.pathOf(runtimeId)`
- `state.nodes.above`, `first`, `last`, `leaf`, `levels`, `next`,
  `previous`, `void`, `hasBlocks`, `hasInlines`, `hasTexts`, `isBlock`,
  `isEmpty`
- `state.points.get`, `isEdge`, `isStart`, `isEnd`
- `state.ranges.unhang`, `project`
- `state.schema.isBlock`

Add transaction equivalents only where mutation or tx-local read semantics are
needed.

### Phase 3: Internal Runtime Split

Move direct query/read implementations behind internal helpers:

- `getEditorRuntime(editor)`
- `getEditorQueryRuntime(editor)`
- `getEditorSchemaRuntime(editor)`
- `getEditorRefRuntime(editor)`
- `getEditorNormalizeRuntime(editor)`

Then update `public-state.ts` so `state` / `tx` call internal helpers directly
instead of calling `editor.above(...)`, `editor.string(...)`, etc.

### Phase 4: Cut `BaseEditor`

Edit `packages/slate/src/interfaces/editor.ts`:

- shrink `BaseEditor`
- remove public direct reads
- remove public direct queries
- remove public `schema`
- remove public normalization hooks
- remove ref aliases or move them to state/tx/internal
- remove `OmitFirstArg<typeof Editor.*>` from public editor surface

Edit `packages/slate/src/create-editor.ts`:

- stop attaching removed methods to the public editor object
- initialize internal runtime registries instead
- keep only `read`, `update`, `subscribe`, `extend`

### Phase 5: First-Party Package Migration

Migrate packages by ownership:

- `slate-history`
  - `Editor.getSnapshot(e)` -> `e.read((state) => state.value.snapshot())`
  - `Editor.subscribe(e, ...)` can remain `e.subscribe(...)` as advanced
    adapter bridge
  - history writes stay inside `e.update((tx) => ...)`
- `slate-dom`
  - model reads use `editor.read(...)`
  - DOM-only helpers stay DOM-owned
  - internal-only map seeding uses `slate/internal`
- `slate-react`
  - tests and runtime use state/tx or the runtime facade
  - hot React paths keep node/runtime-id selectors
- `slate-hyperscript`
  - fixture setup uses state/tx or package-local helpers

### Phase 6: Tests And Fixtures

Migrate test intent:

- Public API tests use `editor.read` / `editor.update`.
- Internal implementation tests import from `slate/internal` explicitly.
- Delete tests whose only purpose is proving removed direct aliases exist.
- Keep behavior contracts for traversal, refs, schema, normalization, and
  selection, but route them through state/tx/internal owners.

No preload rewrites. No compatibility bridges.

### Phase 7: Docs And Examples

Docs must describe current truth only:

- normal app reads: `editor.read((state) => ...)`
- normal app writes: `editor.update((tx) => ...)`
- extension/schema install: `editor.extend(...)`
- no `editor.getSnapshot()`
- no `editor.getChildren()`
- no `editor.string(...)`
- no `editor.schema.define(...)`
- no `Editor.*` state/query helpers

Examples migrate the same way.

### Phase 8: Guard Rails

Add grep-backed guards:

```bash
rg -n "OmitFirstArg<typeof Editor" packages/slate/src/interfaces/editor.ts
rg -n "\beditor\.(getChildren|getSelection|getSnapshot|getOperations|getLastCommit|getRuntimeId|getPathByRuntimeId|string|above|after|before|pathRef|pointRef|rangeRef|schema)\b" packages site docs --glob '!**/dist/**' --glob '!site/out/**' --glob '!site/.next/**'
rg -n "import \{[^}]*Editor[^}]*\} from ['\"]slate['\"]" packages site docs --glob '!**/dist/**'
```

Allowed hits must be explicit internal tests or historical changelog only.

### Phase 9: Verification

Required before marking implementation done:

```bash
bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/query-contract.ts ./packages/slate/test/snapshot-contract.ts
bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts
bun check
```

If docs/examples change user-facing browser behavior, add focused
`slate-browser` or Playwright proof. Do not put `bun test:integration-local`
in the normal iteration loop.

## 8. Risk Register

| Risk                                                   | Why It Matters                                        | Plan Response                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| State/tx groups miss a current query                   | Removal becomes a DX regression                       | Phase 2 fills parity before the cut                                                                        |
| Internal packages start importing public aliases again | The hard cut rots                                     | Phase 8 grep guards                                                                                        |
| Extension authors lose override points                 | Plugins need behavior hooks                           | Move overrides to explicit extension/runtime registration                                                  |
| Collaboration loses snapshot/commit access             | slate-yjs-style substrate needs deterministic commits | `state.value.snapshot()`, `state.value.lastCommit()`, `tx.operations.replay(...)`, `editor.subscribe(...)` |
| Ref API gets fuzzy                                     | refs are neither pure reads nor normal writes         | Decide state/tx/internal in Phase 2 before deleting aliases                                                |
| Docs keep stale snippets                               | Users learn the wrong API                             | Phase 7 plus grep guards                                                                                   |

## 9. Done Criteria

- `BaseEditor` public surface is small and does not expose direct state/query
  aliases.
- `createEditor()` returns an object with only `read`, `update`, `subscribe`,
  and `extend` as public methods.
- `state` and `tx` cover all intended public reads/writes.
- Public types do not depend on `typeof Editor.*`.
- First-party packages use state/tx or explicit internal helpers.
- Docs/examples teach one public lifecycle.
- No compatibility bridge, alias, deprecated shim, or fallback remains.
- Focused contract tests pass.
- `bun check` passes in `Plate repo root`.

## 10. Next Move

No runnable in-scope owner remains for this plan.

## 11. Execution Log

### 2026-04-29 Ralph Activation

- Set `active goal state` to `pending`.
- Regenerated `active goal state` for the active execution lane.
- Started Phase 1: red public-surface and state/tx contracts in
  `packages/slate`.

### 2026-04-29 Phase 1 Red Contracts

- Added public-surface contracts for:
  - public editor instance methods limited to `extend`, `read`, `subscribe`,
    and `update`
  - no direct read/query/schema/ref aliases on editor instances
  - no public `BaseEditor` typing through `OmitFirstArg<typeof Editor.*>`
- Added state/tx contracts for:
  - `state.value.snapshot()`
  - `state.value.operations()`
  - `state.value.lastCommit()`
  - `state.runtime.idAt(path)`
  - `state.runtime.pathOf(runtimeId)`
  - expanded query groups under `state.nodes`, `state.points`,
    `state.ranges`, and `state.schema`
- Ran:
  `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`
- Result: red as intended, `163 pass`, `5 fail`.
- Next owner: Phase 2 state/tx read coverage.

### 2026-04-29 Public Surface, Docs, And Guard Sweep

- Completed the public runtime hard cut in `Plate repo root`:
  - `BaseEditor` public methods are `read`, `update`, `subscribe`, and
    `extend`.
  - `createEditor()` no longer attaches public direct read/query/schema/ref
    aliases.
  - internal runtime access moved behind runtime helpers and `slate/internal`.
  - first-party package sources use state/tx or runtime facades instead of
    public `editor.*` aliases.
- Tightened public state/tx types:
  - removed `OmitFirstArg<typeof Editor.*>` coupling from
    `packages/slate/src/interfaces/editor.ts`.
  - removed the now-dead `OmitFirstArg` utility exports from
    `packages/slate/src/utils/types.ts`.
- Migrated current docs/examples away from stale public editor APIs:
  - `editor.schema.define(...)` -> `editor.extend(...)`
  - `Editor.getSnapshot(...)` / `Editor.subscribe(...)` ->
    `editor.read(...)` / `editor.subscribe(...)`
  - docs examples use `tx.schema` / `state.*` groups for queries.
- Verification:
  - `bun test:vitest test/surface-contract.test.tsx` in
    `packages/slate-react`: `1 passed`, `9 tests passed`.
  - `bun check` in `Plate repo root`: lint, package/site/root typecheck,
    Bun tests, and Vitest all passed.
  - Guard sweep has no banned hits for direct public editor aliases in
    package sources, site examples, or current docs.
  - `rg -n "OmitFirstArg" packages/slate/src -S` only found the now-removed
    utility before the final cleanup.
- Remaining issue:
  - Phase 6 is not done. `packages/slate/test/support/with-test.js` still
    attaches legacy fixture-only methods such as `getChildren`,
    `getSelection`, `schema`, `string`, and transform aliases.
  - That is a test harness compatibility bridge. The public runtime is clean,
    but the full hard-cut plan cannot be marked done until old fixtures stop
    needing that bridge.
- Next owner: Phase 6 fixture cleanup.

### 2026-04-29 Phase 6 Fixture Bridge Cut

- Removed the remaining test-only legacy editor-method bridge in
  `packages/slate/test/support/with-test.js`.
- The fixture helper now exposes only the grouped transaction API, current
  `extend(...)`, and runtime registration needed by old internal query
  callbacks. It no longer exposes `getChildren`, `getSelection`,
  `getOperations`, `schema.define`, or direct transform aliases.
- Migrated stale transform fixtures to current grouped APIs:
  - `tx.value.operations()` for operation assertions
  - `tx.operations.replay(...)` for replay
  - `tx.marks.add(...)` for mark writes
  - `tx.nodes.*`, `tx.selection.*`, `tx.withoutNormalizing(...)`, and
    `tx.normalize(...)` for transform intent
  - `editor.extend(...)` for fixture schema setup
- Verification in `Plate repo root`:
  - `bun test packages/slate/test/index.spec.ts`: `964 pass`, `94 skip`.
  - `bun test packages/slate/test/index.spec.ts packages/slate-hyperscript/test/index.spec.ts`: `993 pass`, `94 skip`.
  - `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`: `168 pass`.
  - `bun lint:fix`: passed, fixed formatting in touched files.
  - `bun typecheck:packages`: passed, `6 successful`.
  - `bun check`: passed lint, package/site/root typecheck, Bun tests, and
    slate-react Vitest.
  - `bun test ./packages/slate/test/query-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts`: `286 pass`.
- Follow-up stale-test sweep found additional path-runnable contract files that
  are not matched by default Bun discovery and still encode removed public
  aliases.
- Representative explicit-path run failed as expected:
  `bun test ./packages/slate/test/read-update-contract.ts ./packages/slate/test/schema-contract.ts ./packages/slate/test/transforms-contract.ts ./packages/slate/test/surface-contract.ts`.
- Completion state moved back to `pending`; the plan is not honestly complete
  while those stale contract files remain.

### 2026-04-29 Stale Contract Cleanup

- Removed stale contract files whose purpose was the deleted API:
  - `packages/slate/test/surface-contract.ts`
  - `packages/slate/test/extension-contract.ts`
- Migrated kept path-runnable contract files from direct public editor aliases
  to current APIs:
  - reads through `editor.read(...)` or explicit `slate/internal` helpers
  - writes through `editor.update((tx) => ...)`
  - schema setup through `editor.extend(...)`
  - test-only schema setup through
    `packages/slate/test/support/schema.ts`
- Updated explicit contract inventory counts after the stale API burn-down.
- Verification in `Plate repo root`:
  - `bun test ./packages/slate/test/*contract.ts ./packages/slate-hyperscript/test/smoke-contract.ts`: `591 pass`.
  - `bun test packages/slate/test/index.spec.ts packages/slate-hyperscript/test/index.spec.ts`: `993 pass`, `94 skip`.
  - Direct public editor alias grep over `packages/slate/test` and
    `packages/slate-hyperscript/test`: no hits for `editor.schema`,
    `editor.get*`, or direct transform aliases.
  - `bun lint:fix`: passed.
  - `bun typecheck:packages`: passed, `6 successful`.
  - `bun check`: passed lint, package/site/root typecheck, Bun tests, and
    slate-react Vitest.
- Completion state moved to `done`.
