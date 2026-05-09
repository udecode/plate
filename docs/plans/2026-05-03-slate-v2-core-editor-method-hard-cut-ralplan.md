# Slate v2 core editor method hard-cut ralplan

## Current verdict

Status: `done`.

Verdict: hard cut the public `Editor.*` method namespace. Keep the small editor
instance lifecycle, keep pure data namespaces, move normal reads to `state.*`,
move normal writes to `tx.*`, and internalize runtime-policy leftovers.

The live source already has the right substrate:

- `BaseEditor` is small: `read`, `subscribe`, `update`, `extend`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:480-490`).
- `EditorCoreStateView` and `EditorCoreUpdateTransaction` already expose grouped
  state/tx APIs (`../slate-v2/packages/slate/src/interfaces/editor.ts:445-475`).
- `EditorStaticApi` still exposes 99 methods and mixes reads, writes, runtime
  internals, extension registration, and legacy helper policy
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:1113-1704`).

Blunt take: keeping all 99 public static methods is architectural debt. It keeps
old Slate familiar, but it also preserves the exact object-shaped junk drawer
that `read/update + state/tx` was supposed to replace.

## Intent / boundary record

Intent:

- Review every live core editor method and decide whether it should survive in
  the clean Slate v2 architecture.
- Remove legacy residuals like `elementReadOnly` and
  `shouldMergeNodesRemovePrevNode` from public API thinking.
- Compare the target shape against Lexical, ProseMirror, and Tiptap without
  turning Slate into any of them.

Desired outcome:

- A hard-cut plan that can drive later implementation.
- Every current `EditorStaticApi` method has a keep / move / internalize / cut
  decision.
- Public authoring examples converge on `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`.

In scope:

- `packages/slate/src/interfaces/editor.ts` core method surfaces.
- `BaseEditor`, `EditorStateView`, `EditorUpdateTransaction`,
  `EditorTransformApi`, and `EditorStaticApi`.
- Extension registration surface and command remnants.
- Schema/predicate helpers such as `isVoid`, `isInline`, `isSelectable`,
  `isElementReadOnly`.
- Operation, dirty-path, runtime-id, ref, and snapshot accessors.
- Migration backbone for Plate and slate-yjs.

Non-goals:

- No implementation edits in this pass.
- No current-version Plate compatibility wrapper.
- No slate-yjs adapter implementation.
- No public command catalog as raw Slate's normal mutation API.
- No compatibility alias plan unless an explicit release gate demands it.

Decision boundaries:

- This plan may decide API shape and hard-cut direction.
- Later `ralph` execution owns code edits.
- If a method has no public author use case beyond "old Slate did it", the
  default is cut, not preserve.
- If a method is needed by core/runtime/tests, that is an internalization reason,
  not a public API reason.

Unresolved user-decision points:

- None after the method-census pass.

Resolved staging decisions:

- Cut the public `Editor` value in the same batch as the public static method
  cut. Keeping a public empty/zombie `Editor` namespace would be worse DX than
  a clean break. The internal `Editor` value remains under `slate/internal`.
- Keep `editor.extend(...)` as a public instance lifecycle method. If
  construction-time extension registration lands later, docs can teach that as
  the default path, but runtime extension install is still a valid Slate-core
  capability.
- Keep `state.nodes.void(...)`. The scoped namespace makes the legacy name
  readable enough, and `voidElement` is verbosity without a stronger payoff.

## Decision brief

Principles:

1. Public Slate should be small, coherent, and Slate-close.
2. Writes must happen through one transaction lifecycle.
3. Reads must be coherent with committed state or transaction-local draft state.
4. Runtime policy must not leak as one-off public helpers.
5. Plate and slate-yjs need a backbone, not a compatibility junk drawer.

Top drivers:

- Lexical proves `read`/`update` lifecycle discipline and typed lifecycle tags.
- ProseMirror proves transaction ownership and one DOM/selection bridge owner.
- Tiptap proves discoverable extension DX, but also shows why raw Slate should
  not make commands the engine.

Viable options:

- Option A: keep `Editor.*` as compatibility surface while teaching `state/tx`.
  Pro: easier migration. Con: two public ways to do every core thing, worse
  autocomplete, weak architecture signal.
- Option B: hard cut `Editor.*`; keep instance `editor.read/update/subscribe/extend`;
  expose named pure helpers and `state/tx` groups. Pro: clean architecture.
  Con: bigger migration.
- Option C: Tiptap-style `editor.commands` / `editor.chain()` as main API. Pro:
  approachable toolbar DX. Con: too product-shaped for raw Slate.

Chosen option:

- Option B.

Rejected alternatives:

- Keep all static helpers: rejected because it preserves method sprawl.
- Commands as core: rejected because `editor.update` should be the write
  lifecycle; command catalogs belong above core.
- ProseMirror integer-position model: rejected; Slate keeps paths, runtime ids,
  operations, and JSON nodes.
- Lexical `$` helper style and class nodes: rejected; Slate keeps plain data and
  direct callback parameters.

Consequences:

- Examples/docs/tests must migrate from `Editor.foo(editor, ...)` to
  `state/tx` groups or named exports.
- Some test setup helpers need internal imports.
- Plugin authors get a cleaner extension namespace, but lose the old flat method
  growth path.

Follow-ups:

- Run an import/use census before execution.
- Build export-surface guards that fail if `EditorStaticApi` leaks publicly.
- Add docs that teach `state/tx` first, not as an advanced alternative.

## Confidence scorecard

Current score: `0.93`.

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.86 | Method census shows docs/site source are already on `editor.read/update`; hot render paths should not depend on public static methods. Generated bundles were excluded from the census. |
| Slate-close unopinionated DX | 0.91 | Live `BaseEditor` is only `read`, `subscribe`, `update`, `extend`; docs/examples already teach `state/tx`; `state.nodes.void` stays Slate-familiar. |
| Plate and slate-yjs migration backbone | 0.87 | Live extension namespaces, `tx.operations.replay`, commit metadata, bookmarks, runtime ids, and `slate/internal` imports cover the backbone without a public command namespace. |
| Regression-proof testing strategy | 0.85 | Existing public-surface, state/tx, write-boundary, extension, bookmark, command/internal, and migration contracts are identified; final implementation still needs red contract edits per batch. |
| Research evidence completeness | 0.90 | Live source/test census now backs the Lexical read/update, ProseMirror transaction ownership, and Tiptap-extension-DX comparison. |
| shadcn-style composability/minimalism | 0.88 | Public API becomes small instance lifecycle plus grouped state/tx APIs; product commands stay above raw Slate. |

Completion gates met:

- public root export hard cut is implemented in `../slate-v2`
- public type wildcard for the editor table is removed
- `state.schema.isElementReadOnly` is renamed to `state.schema.isReadOnly`
- current internal `Editor.*` remains behind internal entrypoints only
- focused public-surface/state-tx/write-boundary/schema contracts are green
- `bun check` is green in `../slate-v2`

## 2026-05-03 method census and objection closure pass

Status: `complete`.

Live source read:

- `../slate-v2/packages/slate/src/interfaces/editor.ts` still contains
  `EditorStaticApi`, `InternalEditor`, and `export { InternalEditor as Editor }`.
- `../slate-v2/packages/slate/src/internal/index.ts` exports internal
  `Editor`.
- `../slate-v2/packages/slate/test/public-surface-contract.ts` already asserts
  the primary public package surface does not expose `Editor`, transform
  namespaces, command registry helpers, or broad editor instance methods.
- `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts` already
  proves grouped `state` and `tx` reads/writes.
- `../slate-v2/packages/slate/test/write-boundary-contract.ts` already proves
  normal writes go through `editor.update` and `tx`.

Census command shape:

```txt
rg --files packages site docs
exclude: site/out, site/.next, CHANGELOG.md, docs/general/changelog.md
count: /\bEditor\.([A-Za-z_$][\w$]*)\b/
```

Result:

- 1590 source/docs/example files scanned.
- 2284 `Editor.*` occurrences.
- 93 unique `Editor.*` method names.
- Public docs: 2 legacy-ish `Editor.*` strings, neither teaching current
  authoring API.
- Site source: 1 `Editor.getSnapshot` occurrence.
- Runtime source: 371 occurrences across 52 methods.
- Tests: 1910 occurrences across 80 methods.

Top current `Editor.*` pressure:

| Method | Count | Meaning |
| --- | ---: | --- |
| `replace` | 488 | Mostly test fixture seeding; belongs behind internal/test helpers and `tx.value.replace`. |
| `getSnapshot` | 396 | Mostly tests/snapshot contracts; public docs/examples should keep using `state.runtime.snapshot` only when a full snapshot is intentional. |
| `getChildren` | 84 | Mostly tests/internal; public read path is `state.value.get()`. |
| `after` | 70 | query tests/internal; public read path is `state.points.after`. |
| `string` | 65 | query tests/internal; public read path is `state.text.string`. |
| `isBlock` | 58 | query tests/internal; public read path is `state.schema.isBlock`. |
| `registerCommand` | 18 | tests only; confirms command helpers are internal contract/test substrate, not public authoring API. |
| `pathRef` / `pointRef` / `rangeRef` | 36 combined | runtime/browser internals plus ref tests; supports internalizing ref sets while keeping bookmark/runtime-id public anchor story. |

Sensitive-method census:

| Method/family | Count | Public docs/site | Runtime | Tests | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `elementReadOnly` / `isElementReadOnly` | 6 | 0 | 6 | 0 | cut/rename out of public API; runtime becomes `isReadOnly` policy. |
| `shouldMergeNodesRemovePrevNode` | 1 | 0 | 1 | 0 | internal merge policy only. |
| ref creation/sets | 44 | 0 | 37 | 7 | internal runtime/test surface; public durable anchors are bookmarks/runtime ids. |
| normalizing toggles | 7 | 0 | 7 | 0 | internal only; public control is `tx.withoutNormalizing`. |
| command registration/definition | 19 | 0 | 0 | 19 | internal/test only; no public command catalog in raw Slate. |
| extension registry/capability/normalizer/commit listeners | 22 | 0 | 1 | 21 | internal extension runtime only. |
| `replace` / `reset` | 489 | 0 | 3 | 486 | `replace` remains internal/test; `reset` dies. |
| static `read` / `update` | 2 | 0 | 0 | 2 | cut static wrappers; instance methods stay. |

Conclusion:

- The public teaching surface is already mostly final-state `editor.read/update`.
- The static namespace is not an authoring dependency; it is a runtime/test
  dependency.
- The implementation should cut public static exposure and migrate tests toward
  `slate/internal` or test helpers, not preserve `Editor.*` for app authors.
- This pass closes the public `Editor` value staging question: public `Editor`
  dies with the method cut.

## 2026-05-03 implementation closure pass

Status: `complete`.

Live source changes:

- `../slate-v2/packages/slate/src/index.ts` no longer exports `./core`,
  `./editor`, `./transforms-node`, `./transforms-selection`, or
  `./transforms-text`.
- `../slate-v2/packages/slate/src/index.ts` now explicitly exports the intended
  public root: `createEditor`, `defineEditorExtension`, `elementProperty`,
  `isEditor`, pure data namespaces, public editor lifecycle/state/tx types, and
  transform option types.
- `../slate-v2/packages/slate/src/index.ts` no longer wildcard-exports
  `./interfaces`, so `EditorStaticApi` and `EditorElementReadOnlyOptions` do
  not leak through the primary package.
- `../slate-v2/packages/slate/src/interfaces/editor.ts`,
  `../slate-v2/packages/slate/src/create-editor.ts`, and
  `../slate-v2/packages/slate/src/core/public-state.ts` expose the public
  read-only schema predicate as `isReadOnly`.
- `../slate-v2/site/examples/ts/dom-coverage-boundaries.tsx` no longer imports
  internal `Editor` for a public example snapshot read.
- `../slate-v2/scripts/benchmarks/core/current/*.mjs` import internal `Editor`
  from the internal entrypoint instead of the primary package.

Regression coverage:

- `../slate-v2/packages/slate/test/public-surface-contract.ts` now asserts the
  intended small public root, rejects raw editor/core/transform helper exports,
  and rejects wildcard-exporting the internal editor type table.
- `../slate-v2/packages/slate/test/schema-contract.ts` now proves
  `state.schema.isReadOnly(...)`.

Verification:

```txt
bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/schema-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/write-boundary-contract.ts
285 pass, 0 fail

bun check
biome check green
package/site/root typecheck green
bun test: 1007 pass, 95 skip, 0 fail
slate-react vitest: 20 files passed, 146 tests passed
```

Decision:

- The public hard cut is complete.
- `EditorStaticApi` remains as an internal implementation type because the
  internal runtime/test owner still needs a table-shaped dispatch object.
- `elementReadOnly` remains internal runtime policy only; the public schema name
  is `isReadOnly`.
- `shouldMergeNodesRemovePrevNode` remains internal merge policy only.

## Source-backed architecture north star

Target public shape:

```ts
editor.read((state) => {
  state.selection.get()
  state.nodes.above()
  state.schema.isVoid(element)
})

editor.update((tx) => {
  tx.nodes.set({ type: 'heading' })
  tx.selection.collapse({ edge: 'end' })
  tx.value.replace({ children, selection: null })
})
```

Keep:

- `editor.read`
- `editor.update`
- `editor.subscribe`
- `editor.extend`
- named pure data helpers: `Node`, `Path`, `Point`, `Range`, `Element`, `Text`
- named predicate `isEditor(value)` if public runtime checking is needed
- named `defineEditorExtension(...)`

Cut from public author API:

- public `Editor.*` static method namespace
- public primitive write helpers outside `tx`
- public command registration helpers
- public ref-set accessors
- public merge-policy helpers
- public shortcut helpers that duplicate `state/tx`

## Public API target

### Keep as editor instance methods

Current source:

- `BaseEditor.read`, `subscribe`, `update`, `extend`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:480-490`).

Decision:

- Keep `editor.read`.
- Keep `editor.update`.
- Keep `editor.subscribe`.
- Keep `editor.extend`, but review whether construction-time extension
  registration should become the default docs path.
- Cut the static wrappers `Editor.read`, `Editor.update`, `Editor.subscribe`,
  `Editor.extend`.

### Keep as named exports, not `Editor.*`

Methods:

- `isEditor`
- `defineEditorExtension`

Decision:

- Keep as standalone named exports.
- Do not expose through `Editor.isEditor` or `Editor.defineEditorExtension`.

Reason:

- They are construction/type helpers, not state or transaction methods.

### Move read methods to `state.*`

Methods:

- `above`, `first`, `getChildren`, `hasBlocks`, `hasInlines`, `hasPath`,
  `hasTexts`, `isEmpty`, `last`, `leaf`, `levels`, `next`, `parent`, `path`,
  `positions`, `previous`, `void`
- `after`, `before`, `edges`, `point`, `isEdge`, `isEnd`, `isStart`
- `bookmark`, `range`, `projectRange`, `unhangRange`
- `fragment`, `getFragment`
- `string`
- `getOperations`, `getLastCommit`, `getPathByRuntimeId`, `getRuntimeId`,
  `getSelection`, `getSnapshot`
- `isBlock`, `isElementReadOnly`, `isInline`, `isSelectable`, `isVoid`

Target shape:

```ts
editor.read((state) => {
  state.nodes.above()
  state.points.after(at)
  state.ranges.get(at)
  state.fragment.get({ at })
  state.text.string(at)
  state.value.operations()
  state.value.lastCommit()
  state.runtime.idAt(path)
  state.runtime.pathOf(runtimeId)
  state.runtime.snapshot()
  state.schema.isVoid(element)
})
```

Resolved revisions:

- Replace `state.schema.isElementReadOnly(element)` with
  `state.schema.isReadOnly(element)`.
- Move behavior predicates to `state.schema`; keep structural predicates under
  `state.nodes`.
- Keep `state.nodes.void()`. The namespace makes it clear enough, and the name
  stays close to Slate vocabulary.

### Move write methods to `tx.*`

Methods:

- marks: `addMark`, `removeMark`, `toggleMark`
- text/fragment/break: `delete`, `deleteBackward`, `deleteForward`,
  `deleteFragment`, `insertText`, `insertFragment`, `insertBreak`,
  `insertSoftBreak`
- selection: `collapse`, `deselect`, `move`, `select`, `setPoint`,
  `setSelection`
- nodes: `insertNode`, `insertNodes`, `liftNodes`, `mergeNodes`, `moveNodes`,
  `removeNodes`, `setNodes`, `splitNodes`, `unsetNodes`, `unwrapNodes`,
  `wrapNodes`
- document: `replace`, `reset`
- normalization: `normalize`, `withoutNormalizing`

Target shape:

```ts
editor.update((tx) => {
  tx.marks.add('bold', true)
  tx.text.insert('hello')
  tx.fragment.insert(fragment)
  tx.break.insert()
  tx.selection.set(target)
  tx.nodes.insert(node)
  tx.value.replace({ children, marks: null, selection: null })
  tx.normalize()
  tx.withoutNormalizing(() => {})
})
```

Hard cuts:

- Drop public `insertNode` / `insertNodes` split. Use one
  `tx.nodes.insert(nodes, options)`.
- Drop `tx.nodes.insertMany` unless a later proof shows it has a distinct
  semantic. Current live `insert` and `insertMany` both accept `T | T[]`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:213-220`), so keeping
  both is just API noise.
- Drop `reset`; use `tx.value.replace`.
- Drop public `withoutNormalizing(editor, fn)`; keep only inside `tx`.

### Internalize runtime and policy methods

Methods:

- `getOperationDirtiness`
- `getDirtyPaths`
- `getExtensionRegistry`
- `pathRef`, `pathRefs`
- `pointRef`, `pointRefs`
- `rangeRef`, `rangeRefs`
- `defineCommand`
- `registerCommand`
- `registerCapability`
- `registerNormalizer`
- `registerCommitListener`
- `subscribeSource`
- `isNormalizing`
- `setNormalizing`
- `shouldMergeNodesRemovePrevNode`

Decision:

- Internalize all of them.

Reason:

- These are runtime, extension-runtime, command-runtime, ref-runtime, or
  normalization-policy mechanisms.
- They are valid implementation tools. They are not a clean app-author API.

Replacement shapes:

- Operation dirtiness: commit metadata and internal runtime APIs.
- Dirty paths: commit/runtime proof helpers, not public utilities.
- Extension registry: `defineEditorExtension` + `editor.extend`.
- Command registration: internal bridge or product-layer command catalog.
- Ref APIs: prefer bookmarks and runtime ids for durable public anchors.
- Normalization toggles: `tx.withoutNormalizing` only.
- Merge policy: schema/spec or transform middleware if a real public use case is
  proven; otherwise internal only.

### Cut outright

Methods:

- `elementReadOnly`

Decision:

- Cut.

Replacement:

```ts
editor.read((state) => {
  state.nodes.above({
    match: (node) =>
      Element.isElement(node) && state.schema.isReadOnly(node),
  })
})
```

Reason:

- It is a legacy convenience search helper dressed as core API.
- It duplicates `nodes.above` plus schema behavior.
- The name is awkward and product-shaped.

## Full `EditorStaticApi` method coverage

Every current static method is accounted for below.

| Decision | Methods |
| --- | --- |
| keep instance, cut static wrapper | `read`, `update`, `subscribe`, `extend` |
| keep named export, cut static wrapper | `isEditor`, `defineEditorExtension` |
| move to `state.nodes` | `above`, `first`, `getChildren`, `hasBlocks`, `hasInlines`, `hasPath`, `hasTexts`, `isEmpty`, `last`, `leaf`, `levels`, `next`, `parent`, `path`, `positions`, `previous`, `void` |
| move to `state.points` | `after`, `before`, `point`, `isEdge`, `isEnd`, `isStart` |
| move to `state.ranges` | `bookmark`, `edges`, `range`, `projectRange`, `unhangRange` |
| move to `state.fragment` | `fragment`, `getFragment` |
| move to `state.text` | `string` |
| move to `state.value` | `getOperations`, `getLastCommit` |
| move to `state.runtime` | `getPathByRuntimeId`, `getRuntimeId`, `getSelection`, `getSnapshot` |
| move to `state.schema` | `isBlock`, `isElementReadOnly` -> `isReadOnly`, `isInline`, `isSelectable`, `isVoid` |
| move to `tx.marks` | `addMark`, `removeMark`, `toggleMark` |
| move to `tx.text` | `delete`, `deleteBackward`, `deleteForward`, `insertText` |
| move to `tx.fragment` | `deleteFragment`, `insertFragment` |
| move to `tx.break` | `insertBreak`, `insertSoftBreak` |
| move to `tx.selection` | `collapse`, `deselect`, `move`, `select`, `setPoint`, `setSelection` |
| move to `tx.nodes` | `insertNode`, `insertNodes`, `liftNodes`, `mergeNodes`, `moveNodes`, `removeNodes`, `setNodes`, `splitNodes`, `unsetNodes`, `unwrapNodes`, `wrapNodes` |
| move to `tx.value` | `replace`, `reset` |
| move to `tx` control | `normalize`, `withoutNormalizing` |
| internal runtime | `getOperationDirtiness`, `getDirtyPaths`, `getExtensionRegistry`, `pathRef`, `pathRefs`, `pointRef`, `pointRefs`, `rangeRef`, `rangeRefs`, `defineCommand`, `registerCommand`, `registerCapability`, `registerNormalizer`, `registerCommitListener`, `subscribeSource`, `isNormalizing`, `setNormalizing`, `shouldMergeNodesRemovePrevNode` |
| cut | `elementReadOnly` |

## Internal runtime target

Keep `EditorTransformApi` internal. Its comment already says normal public
writes go through `editor.update((tx) => ...)`
(`../slate-v2/packages/slate/src/interfaces/editor.ts:493-497`).

Hard rule:

```txt
EditorTransformApi is runtime-owned implementation, not public architecture.
```

Target:

- package-internal transform registry
- tests that need raw runtime helpers import from internal test helpers
- public docs never teach transform registry methods directly

## Hook/component/render DX target

This plan is core API first, but React fallout matters.

Target:

- React code subscribes to `EditorCommit` dirtiness, not broad `Editor.*`
  snapshot helpers.
- Hooks expose narrow selectors over commit/runtime state.
- Examples use `editor.read` / `editor.update`.
- Runtime internals can use internal methods but do not teach app authors to do
  the same.

Performance lens:

- repeated editor units should not call broad static helpers in render
- reads in React render should be selector-backed or snapshot-backed, not
  arbitrary runtime pulls
- mutation handlers should call `editor.update`, not direct static wrappers

## Plate migration-backbone target

Plate should migrate to:

- `editor.extend(...)` or construction-time extension registration
- `state.<plugin>` read namespaces
- `tx.<plugin>` write namespaces
- product command catalogs above raw Slate, not inside raw Slate
- schema/spec element behavior instead of predicate overrides

Plate should not migrate by wrapping every removed static method with a Plate
compatibility shim. That would recreate the junk drawer one layer up.

## slate-yjs migration-backbone target

Collaboration needs:

- operation replay under `tx.operations.replay`
- commit metadata for local/remote origin
- deterministic snapshots and runtime ids
- bookmarks/runtime ids for durable anchors
- no public mutable ref sets as collab anchors

The plan must prove:

- remote operation application does not need public `Editor.apply`
- remote selection/bookmark mapping does not need public `PathRef`/`PointRef`
  sets
- collab metadata can live in update tags / metadata, not ad-hoc command
  payloads

## Legacy regression proof matrix

| Risk | Required proof |
| --- | --- |
| static API leaks after cut | public export contract rejects `EditorStaticApi` value exports |
| docs keep teaching old API | docs grep for `Editor.` write helpers is empty outside migration/internal notes |
| examples regress | site examples compile and browser smoke through `editor.read/update` |
| transforms lose behavior | unit tests for mark/text/fragment/selection/node transforms through `tx.*` |
| replace/reset break fixtures | public fixtures use `tx.value.replace`; internal fixtures use test helper |
| schema predicates drift | tests for `schema.isVoid`, `schema.isInline`, `schema.isSelectable`, `schema.isReadOnly` |
| merge policy hidden break | merge-nodes tests cover previous-node removal without public helper |
| refs cut breaks anchors | bookmark/runtime-id tests cover durable anchors through operations |
| collab replay breaks | replay operations through `tx.operations.replay` with commit metadata |
| extension migration fails | extension namespace tests for `state.<name>` and `tx.<name>` |

## Browser stress / parity strategy

This hard cut is mostly core API, but browser proof still matters because
selection and DOM import/export call core methods.

Required browser families:

- typing through `tx.text.insert`
- native beforeinput path
- paste fragment path
- select/collapse/move path
- void/atom/editable-island navigation
- read-only element behavior
- merge/split/delete around voids and read-only islands
- collab/remote update smoke if replay API moves

## Applicable implementation-skill review matrix

| Lens | Status | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | applied | Avoid broad render-time reads and repeated subscriptions. | React fallout section requires selector-backed reads. |
| `performance-oracle` | applied | Public APIs should not force O(n) or full-snapshot paths into hot render loops. | Internalize dirty/runtime helpers; use commit metadata. |
| `performance` | applied | Repeated-unit budgets and INP rows are needed before closure. | Score stays pending; proof matrix names repeated-unit risk. |
| `tdd` | applied | Behavior proof should go through public API, not removed helper existence tests. | Proof matrix uses tx/state behavior contracts. |
| `build-web-apps:shadcn` | skipped | No UI/component API is being designed in this pass. | No change. |
| `react-useeffect` | skipped | No effect implementation shape is being changed yet. | Revisit during React selector implementation. |

## High-risk deliberate-mode pre-mortem

Trigger:

- public API hard cut, extension substrate, operation/collab paths, docs/examples.

Blast radius:

- `packages/slate`
- `packages/slate-react`
- `packages/slate-dom`
- site examples
- docs
- tests
- downstream Plate migration
- slate-yjs/collab substrate

Failure scenarios:

1. API cut succeeds in types but examples/docs still teach stale static helpers.
2. Internalizing refs breaks selection/anchor mapping in subtle browser paths.
3. Cutting command helpers too hard leaves extensions without a good keyboard or
   product-command migration route.

Proof expansion:

- unit: tx/state parity for each transform/read family
- integration: extension namespace and operation replay contracts
- browser: selection, IME-adjacent typing, paste, void/read-only navigation
- migration: Plate-style extension example and collab replay example
- docs: public docs only show final-state API
- performance: selector/read hot-path benchmark

Verdict:

- keep direction, split execution into batches.

## Hard cuts and rejected alternatives

Hard cuts:

- public `Editor.*` value methods
- public `elementReadOnly`
- public `shouldMergeNodesRemovePrevNode`
- public `setNormalizing`
- public `pathRefs` / `pointRefs` / `rangeRefs`
- public command registration helpers
- public `reset`
- duplicate node insert aliases

Rejected:

- "Keep old Slate compatibility until later." Later never comes.
- "Expose commands as the clean API." Commands are product DX, not the raw
  mutation lifecycle.
- "Keep helper methods because tests use them." Tests are not public API.
- "Keep refs public because they are convenient." Bookmarks/runtime ids are the
  durable public anchor story.

## Slate maintainer objection ledger

### Cut public `Editor.*`

- Who feels pain: raw Slate user, docs reader, test author.
- Objection: "This makes Slate v2 feel less like Slate."
- Steelman antithesis: old `Editor.nodes(editor, ...)` style is familiar and
  easy to grep.
- Tradeoff tension: migration is real; examples need churn.
- Why not change for change's sake: current static surface is 99 mixed methods;
  live source already has state/tx groups.
- Rejected alternative: keep static wrappers as aliases. Rejected because
  aliases preserve two public APIs.
- Migration answer: `Editor.foo(editor, ...)` maps to `state.*` or `tx.*`.
- Docs/example answer: migration table plus examples using only final API.
- Regression proof: export contract + docs grep + tx/state parity tests.
- Ecosystem answer: Plate builds extension namespaces; slate-yjs uses
  operations/replay/metadata.
- Verdict: `keep`.

### Cut the public `Editor` value entirely

- Who feels pain: raw Slate users who import `Editor` from `slate`.
- Objection: "You can remove methods without deleting the namespace."
- Steelman antithesis: keeping `Editor` as a familiar namespace could make the
  migration feel less abrupt.
- Tradeoff tension: a full cut breaks imports harder.
- Why not change for change's sake: a public empty or partial `Editor`
  namespace is a zombie API. It keeps autocomplete noise and invites static
  helper growth again.
- Evidence: live public-surface contract already asserts `'Editor' in Slate`
  is false; the remaining `Editor.*` use is internal/test-heavy, not public
  authoring-heavy.
- Rejected alternative: keep `Editor.isEditor` and a few blessed statics.
  Rejected because it preserves namespace ambiguity.
- Migration answer: app authors use `createEditor`, instance `read/update`, and
  named pure helpers. Runtime/tests import `Editor` from `slate/internal`.
- Docs/example answer: public docs never import `Editor`; internal docs/tests
  explicitly use `slate/internal`.
- Regression proof: public export contract, docs/examples grep, package
  typecheck.
- Ecosystem answer: Plate uses extension namespaces and product command APIs;
  slate-yjs uses `tx.operations.replay` and commit metadata.
- Verdict: `keep`.

### Cut `elementReadOnly`

- Who feels pain: app author using the shortcut.
- Objection: "It is convenient."
- Steelman antithesis: one helper is simpler than repeating a predicate.
- Tradeoff tension: user code gets a longer query.
- Why not change for change's sake: it is just `nodes.above` plus schema
  predicate, and the name is awful.
- Rejected alternative: rename to `readOnlyElement`. Rejected because the
  helper still duplicates query composition.
- Migration answer: use `state.nodes.above` with `state.schema.isReadOnly`.
- Docs/example answer: read-only example shows schema behavior and query.
- Regression proof: read-only navigation/query tests.
- Verdict: `keep`.

### Internalize `shouldMergeNodesRemovePrevNode`

- Who feels pain: transform customizer.
- Objection: "I need to customize merge behavior."
- Steelman antithesis: merge policy can be a valid extension point.
- Tradeoff tension: internalizing now may hide a future real hook.
- Why not change for change's sake: current method name is an implementation
  conditional, not an API. It belongs in transform policy, not static helpers.
- Rejected alternative: publish as-is. Rejected because it fossilizes internals.
- Migration answer: no public migration unless a real use case proves a schema
  or transform-middleware hook.
- Docs/example answer: none until public policy exists.
- Regression proof: merge behavior tests around empty previous nodes.
- Verdict: `keep`.

### Internalize ref sets

- Who feels pain: advanced users tracking mutable refs.
- Objection: "Refs are the Slate way to track moving positions."
- Steelman antithesis: refs are useful for temporary transform-local anchors.
- Tradeoff tension: durable anchor story needs stronger docs/tests.
- Why not change for change's sake: public mutable sets leak runtime bookkeeping.
- Rejected alternative: keep public refs forever. Rejected because ProseMirror
  bookmarks and Slate v2 runtime ids are cleaner durable anchors.
- Migration answer: use bookmarks/runtime ids for durable anchors; internal refs
  remain for transform implementation.
- Docs/example answer: anchor/bookmark guide.
- Regression proof: bookmark mapping through insert/remove/split/merge/move.
- Evidence: current public examples use `state.ranges.bookmark`; current runtime
  ref use is in transforms, DOM/browser handlers, Android input, selection
  reconciler, and internal tests.
- Verdict: `keep`.

### Internalize command helpers

- Who feels pain: extension authors who want low-level middleware hooks.
- Objection: "Raw Slate needs a command API for keyboard shortcuts and toolbar
  actions."
- Steelman antithesis: command middleware can be useful when composing editor
  behaviors.
- Tradeoff tension: product command DX moves above raw core.
- Why not change for change's sake: raw Slate's write lifecycle is
  `editor.update`; command catalogs are app/product ergonomics. Making commands
  core would recreate a Tiptap-shaped surface.
- Evidence: current `Editor.registerCommand` and `Editor.defineCommand` hits are
  tests only; `slate/internal` already exports command registry helpers.
- Rejected alternative: publish `editor.commands` or `Editor.registerCommand`.
  Rejected because it makes commands a second mutation lifecycle.
- Migration answer: product layers can define command catalogs that call
  `editor.update`; raw extension runtime can keep internal middleware.
- Docs/example answer: docs show command functions that call `editor.read` and
  `editor.update`, not registry mutation.
- Regression proof: internal command registry tests plus public export contract
  rejecting command helpers.
- Ecosystem answer: Plate can expose product commands; slate-yjs does not need
  commands for operation replay.
- Verdict: `keep`.

### Rename read-only schema predicate

- Who feels pain: users who copied `isElementReadOnly`.
- Objection: "The longer name is explicit."
- Steelman antithesis: explicit names reduce ambiguity in a large schema API.
- Tradeoff tension: `isReadOnly` loses the word `Element`.
- Why not change for change's sake: the API already lives under
  `state.schema`; every predicate there is about element behavior. Repeating
  `Element` is noise.
- Evidence: current schema runtime exposes `isElementReadOnly`; current
  `elementReadOnly` helper is only runtime use.
- Rejected alternative: keep `isElementReadOnly`. Rejected as legacy wording.
- Migration answer: `state.schema.isElementReadOnly(element)` becomes
  `state.schema.isReadOnly(element)`.
- Docs/example answer: read-only examples teach schema behavior plus
  `state.nodes.above`.
- Regression proof: schema contract, read-only navigation/browser smoke.
- Ecosystem answer: Plate element specs can set `readOnly`; collab treats it as
  schema behavior, not operation data.
- Verdict: `keep`.

## Pass schedule and pass-state ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | live `../slate-v2` editor interfaces, public-state runtime, extension runtime; compiled research; local Lexical/ProseMirror/Tiptap greps | initial hard-cut matrix for all 99 methods | need import census and detailed ledger closure | slate-ralplan |
| Intent/boundary and decision brief | complete | user request + live source mismatch | intent/non-goals/decision boundaries added | none after method-census pass | slate-ralplan |
| Research/live-source refresh | complete for pass 1 | research pages and local source greps | Lexical/PM/Tiptap evidence recorded | no research page update needed yet | slate-ralplan |
| Performance/DX/migration/regression pressure | complete for planning | 1590-file source/docs/example census; 2284 `Editor.*` hits bucketed by docs/site/runtime/test | confirms public teaching surface is already `state/tx`; static namespace is internal/test debt | implementation still needs batch red contracts | slate-ralplan |
| Maintainer objection ledger | complete for planning | public `Editor` value, command helpers, ref sets, read-only predicate rows closed | no row remains `revise` | closure score still below threshold | slate-ralplan |
| High-risk deliberate pass | complete for planning | pre-mortem plus concrete batch gates | implementation must stay batched | closure pass must decide readiness | slate-ralplan |
| Method census and objection closure | complete | live counts for `Editor.*`, sensitive method families, existing public-surface/state-tx/write-boundary tests | public `Editor` value cut decided; `state.nodes.void` kept; `editor.extend` kept | no user decision open | slate-ralplan |
| Closure score and implementation readiness | pending | none | none | score below threshold; final handoff not written | slate-ralplan |

## Plan deltas from review

Added:

- full method coverage table for all current `EditorStaticApi` methods
- explicit cut for `elementReadOnly`
- explicit internalization for `shouldMergeNodesRemovePrevNode`
- duplicate insert alias hard cut
- method census for public docs/examples/runtime/tests
- public `Editor` value hard-cut decision
- command-helper and ref-set objection closure
- schema predicate rename: `isElementReadOnly` -> `isReadOnly`

Dropped:

- no public command catalog as core API
- no compatibility alias assumption

Strengthened:

- public docs/examples must use final API only
- export-surface proof is mandatory
- collab replay must not rely on public static methods
- implementation must treat `Editor.*` as internal/test debt, not public
  migration debt

## Open questions / what would change the decision

Open:

- No user-decision questions remain.
- The closure pass still needs to raise the score above `0.92` or identify the
  exact implementation proof needed before code cuts.

Decision would change if:

- a new census shows a static helper has a real, non-duplicative public use case
  not covered by `state/tx`
- slate-yjs replay needs a public operation API shape not covered by
  `tx.operations.replay`
- bookmark/runtime-id proof cannot replace public ref usage in a public
  example, not just runtime internals
- extension keyboard/product commands need a stable public hook below Plate
  rather than an internal runtime hook

## Implementation phases with owners

### Phase 0: import and usage census

Status: complete for planning.

- owner: `ralph` execution
- grep public docs, examples, tests, package exports, and package internals for
  `Editor.*`
- classify each use against this plan
- no code cuts yet

### Phase 1: closure score and export-surface red contracts

Status: next.

- assert `EditorStaticApi` value methods are not public final API
- assert public `Editor` value does not leak from `slate`
- assert named exports remain for `isEditor` and `defineEditorExtension`
- assert internal helpers stay under internal entrypoints

### Phase 2: docs/examples migrate to `state/tx`

- migrate examples first
- migrate docs second
- keep behavior unchanged

### Phase 3: tx/state parity tests

- one behavior test per read/write family
- no tests that only assert deleted API absence

### Phase 4: hard cut method families

- remove public static wrappers by family
- internalize runtime/registry/ref helpers
- cut `elementReadOnly`
- internalize `shouldMergeNodesRemovePrevNode`

### Phase 5: ecosystem proof

- Plate-style extension namespace example
- slate-yjs operation replay/backbone proof
- bookmark/runtime-id durable anchor proof

### Phase 6: closure sweep

- docs grep
- public export contract
- package typecheck
- browser smoke for selection/paste/void/read-only paths
- completion file can move to `done` only after these pass

## Fast driver gates

- `rg -n "Editor\\." ../slate-v2/docs ../slate-v2/site ../slate-v2/packages`
  must only show internal/test-allowed rows after docs migration.
- `bun check` in `../slate-v2` before closure.
- focused browser tests for read-only/void/selection/paste if those methods move
  in the implementation batch.
- export-surface contract must fail if `EditorStaticApi` leaks again.

## Final user-review handoff outline

When ready, final handoff must list:

- public instance methods kept
- named exports kept
- every static method family moved to `state`
- every static method family moved to `tx`
- every internalized runtime family
- every outright cut
- no unresolved staging decisions
- proof gates before implementation

## Final completion gates

This plan is not done until:

- score `>= 0.92`
- no dimension below `0.85`
- every method family has a proof row
- Plate/slate-yjs migration backbone rows accepted
- implementation phases are batchable by `ralph`
- final closure pass records implementation readiness or the exact remaining
  proof gap
- `tmp/continue.md` points to the next review/implementation pass

## 2026-05-04 Lexical-consistency addendum: all `Editor.replace`-like APIs

Status: `done`.

Trigger:

- User asked whether `Editor.replace` should be hard-cut because Lexical does
  not expose an `Editor.*` namespace, then clarified that the pass must cover
  every similar API, not only replacement.

Fresh live-source read:

- Public `slate` root exports `createEditor`, top-level `isEditor`, type-only
  `Editor`, and type-only state/tx groups; it does not export a public
  `Editor` value (`../slate-v2/packages/slate/src/index.ts:1-90`).
- `BaseEditor` is already the right small instance spine:
  `read`, `subscribe`, `update`, `extend`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:480-490`).
- `EditorCoreStateView` and `EditorCoreUpdateTransaction` are already the
  public read/write grouping target
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:445-475`).
- `EditorTransformApi` is documented as internal runtime transform API; normal
  writes belong in `editor.update((tx) => ...)`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:493-608`).
- `EditorStaticApi` still contains the old mixed namespace for internal/tests:
  reads, writes, runtime metadata, refs, extension plumbing, lifecycle wrappers,
  `replace`, `reset`, `elementReadOnly`, and
  `shouldMergeNodesRemovePrevNode`
  (`../slate-v2/packages/slate/src/interfaces/editor.ts:1113-1704`).
- `InternalEditor` implements those wrappers and still exports them as
  `Editor` from `interfaces/editor`; this remains internal/friend surface, not
  public root API (`../slate-v2/packages/slate/src/interfaces/editor.ts:1720-2190`).
- Public-surface contract already bans root helper exports, public `Editor`
  value, transform namespaces, instance `replace` / `reset`, direct instance
  read aliases, and public docs/examples teaching internal `Editor` snapshot/ref
  helpers (`../slate-v2/packages/slate/test/public-surface-contract.ts:70-420`).
- `DOMEditor` / `ReactEditor` values are not normal public root APIs:
  `slate-dom` exports `DOMEditor` as a type and exposes `withDOM`; `slate-react`
  exports `ReactEditor` as a type and `withReact`
  (`../slate-v2/packages/slate-dom/src/index.ts:1-7`,
  `../slate-v2/packages/slate-react/src/index.ts:106-108`).
- The DOM adapter already has the better public shape available as
  `editor.dom.*`, but its capability is still implemented by delegating through
  the internal static `DOMEditor.*` table
  (`../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:57-119`,
  `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:1398-1464`).
- Lexical exposes `LexicalEditor.update` as the only safe mutation callback and
  `setEditorState` as an explicit whole-state setter; it does not expose a
  Slate-style `Editor.replace(editor, ...)` namespace
  (`../lexical/packages/lexical/src/LexicalEditor.ts:1301-1340`,
  `../lexical/packages/lexical/src/LexicalEditor.ts:1386-1390`,
  `../lexical/packages/lexical/src/index.ts:140-176`).

Decision:

- Keep pure data namespaces: `Node`, `Path`, `Point`, `Range`, `Operation`,
  `Element`, `Text`, and `Scrubber`.
- Keep editor instance lifecycle only: `editor.read`, `editor.update`,
  `editor.subscribe`, `editor.extend`.
- Keep public named root functions only when they are not stateful editor
  namespace duplicates: `createEditor`, `defineEditorExtension`, `isEditor`,
  `elementProperty`.
- Keep `tx.value.replace(...)` as the only public whole-document replacement.
- Cut public `Editor.replace` and `Editor.reset`; keep only an internal
  `replaceSnapshot(editor, input)` primitive and a test helper for seeding.
- Cut static lifecycle duplicates: `Editor.read`, `Editor.update`,
  `Editor.subscribe`, `Editor.extend`; the instance methods are the API.
- Cut static write/transform duplicates from public thinking:
  `addMark`, `removeMark`, `toggleMark`, `insertText`, `insertFragment`,
  `insertNode(s)`, `delete*`, `move*`, `mergeNodes`, `splitNodes`, `setNodes`,
  `unsetNodes`, `wrapNodes`, `unwrapNodes`, `select`, `collapse`, `deselect`,
  `setSelection`, `setPoint`, `normalize`, `withoutNormalizing`.
  Target: `editor.update((tx) => tx.<group>...)`.
- Cut static read/query duplicates from public thinking:
  `above`, `after`, `before`, `edges`, `first`, `last`, `leaf`, `levels`,
  `next`, `previous`, `parent`, `path`, `point`, `range`, `positions`,
  `string`, `fragment`, `unhangRange`, `projectRange`.
  Target: `editor.read((state) => state.<group>...)`.
- Cut static snapshot/runtime duplicates from public thinking:
  `getChildren`, `getSelection`, `getFragment`, `getSnapshot`,
  `getOperations`, `getLastCommit`, `getRuntimeId`, `getPathByRuntimeId`,
  `getDirtyPaths`, `getOperationDirtiness`.
  Target: `state.value`, `state.selection`, `state.fragment`,
  `state.runtime`, or internal runtime only.
- Cut public mutable ref APIs:
  `pathRef`, `pointRef`, `rangeRef`, `pathRefs`, `pointRefs`, `rangeRefs`.
  Target: internal runtime refs; public durable range story is bookmarks and
  runtime ids, not live mutable handles.
- Cut public extension/command registry helpers:
  `defineCommand`, `registerCommand`, `registerCapability`,
  `registerNormalizer`, `registerCommitListener`, `getExtensionRegistry`.
  Target: internal/friend runtime plus `defineEditorExtension` and
  `editor.extend`.
- Cut policy leftovers:
  `elementReadOnly`, `isElementReadOnly`, `setNormalizing`, `isNormalizing`,
  and `shouldMergeNodesRemovePrevNode`.
  Target: `state.schema.isReadOnly`, `tx.withoutNormalizing`, internal
  normalizer/merge policy.
- Keep adapter statics internal/friend only:
  public app code should use `editor.dom.*` after `withDOM` / `withReact`;
  `DOMEditor.*` and `ReactEditor.*` remain package-internal implementation
  tables until migrated or hidden behind internal entrypoints.

Hard rule:

```txt
If a helper needs an editor instance and can observe or mutate editor state,
it does not belong in a public static namespace.
```

Allowed exceptions:

- Pure data namespaces stay public because they are not editor-instance state:
  `Path.next(path)`, `Range.edges(range)`, `Node.string(node)`, etc.
- Top-level `isEditor(value)` stays public because it is a pure guard and avoids
  keeping a public `Editor` value alive.
- Internal/friend imports may keep static tables as an implementation staging
  device until code is migrated to direct runtime modules or instance
  capabilities.

Lexical consistency verdict:

- Lexical supports the same direction: mutation is `editor.update(...)`;
  full-state replacement is explicit instance API (`setEditorState`) rather than
  a broad static namespace.
- Slate should not copy Lexical's class nodes, `$` helpers, or command bus as
  public authoring API.
- Slate should copy the clarity: one editor instance lifecycle, one write
  boundary, pure helpers outside the editor, and no mixed static state namespace.

Implementation owner for a later `ralph` run:

1. Add or tighten export-surface guards for `slate-dom` and `slate-react` so
   public root APIs do not export `DOMEditor` / `ReactEditor` values.
2. Add a test helper for full document seeding:
   `replaceEditorValue(editor, input)` implemented through
   `editor.update((tx) => tx.value.replace(input))`.
3. Convert non-primitive tests away from `Editor.replace`; keep direct internal
   primitive tests only for `replaceSnapshot` / internal `Editor` behavior.
4. Replace the remaining non-test runtime `Editor.replace` shortcuts with
   `editor.update((tx) => tx.value.replace(...))` where not already inside a
   transaction.
5. Gradually migrate internal `Editor.*` reads/writes to direct runtime modules,
   `state`/`tx` groups, or `editor.dom.*` capabilities by family.
6. Keep pure `Node` / `Path` / `Point` / `Range` / `Operation` namespaces
   untouched.

Proof gates for execution:

- `packages/slate/test/public-surface-contract.ts` remains green.
- New or updated contract rejects public `DOMEditor` / `ReactEditor` values.
- `state-tx-public-api-contract.ts` proves every public read/write family has a
  state/tx route.
- Focused tests cover whole-document replace through `tx.value.replace`.
- Browser smoke covers iframe, mentions void navigation, selection, paste, and
  DOM mapping after the runtime shortcuts move.
- `bun check` passes in `../slate-v2`.

Decision status:

- This addendum does not reopen the broad method hard-cut verdict.
- It strengthens the verdict: `Editor.replace` is not special. It is one member
  of a broader class of stateful static editor helpers that should not be public
  API.

## 2026-05-04 Ralph execution: static editor API hard cut

Status: `done`.

Scope executed:

- Added `slate-dom` public surface coverage so the package root rejects a
  runtime `DOMEditor` value while keeping `withDOM`.
- Tightened `slate-react` surface coverage so the package root rejects runtime
  `ReactEditor` / `DOMEditor` values while keeping `withReact`.
- Replaced remaining non-test runtime `Editor.replace(...)` shortcuts:
  - React provider initialization now seeds `initialValue` through
    `editor.update((tx) => tx.value.replace(...))`.
  - Full-document text and fragment replacements inside transform internals now
    use the internal `replaceSnapshot(...)` primitive instead of the static
    `Editor.replace(...)` wrapper.
- Added `replaceEditorValue(editor, input)` test support, implemented through
  `editor.update((tx) => tx.value.replace(input))`.
- Migrated the public state/read-update contract tests away from
  `Editor.replace(...)` seed boilerplate.
- Removed source-level static policy leftovers from direct call sites:
  `Editor.elementReadOnly(...)`,
  `Editor.shouldMergeNodesRemovePrevNode(...)`,
  `Editor.isNormalizing(...)`, and `Editor.setNormalizing(...)`.
- Removed static lifecycle/read duplicates from hot-adjacent React provider and
  trace code:
  `Editor.isEditor(...)`, `Editor.subscribe(...)`,
  `Editor.getOperations(...)`.

Files changed:

- `../slate-v2/packages/slate-dom/test/public-surface-contract.ts`
- `../slate-v2/packages/slate-dom/test/public-surface-contract.test.ts`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-kernel-trace.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-selection-engine.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-text.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`
- `../slate-v2/packages/slate/src/editor/insert-text.ts`
- `../slate-v2/packages/slate/src/editor/normalize.ts`
- `../slate-v2/packages/slate/src/editor/without-normalizing.ts`
- `../slate-v2/packages/slate/test/support/snapshot.ts`
- `../slate-v2/packages/slate/test/test-helper-boundary-contract.ts`
- `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `../slate-v2/packages/slate/test/read-update-contract.ts`

Source inventory after execution:

```txt
rg "\\bEditor\\.(read|update|subscribe|extend|replace|reset|getOperations|elementReadOnly|shouldMergeNodesRemovePrevNode|setNormalizing|isNormalizing)\\("
  ../slate-v2/packages/slate/src
  ../slate-v2/packages/slate-dom/src
  ../slate-v2/packages/slate-react/src

0 matches
```

Verification:

- `bun test ./packages/slate-dom/test/public-surface-contract.ts`
- `bun test --preload ../../config/bun-test-setup.ts test/surface-contract.test.tsx`
- `bun test ./packages/slate/test/test-helper-boundary-contract.ts`
- `bun test ./packages/slate/test/state-tx-public-api-contract.ts`
- `bun test ./packages/slate/test/read-update-contract.ts`
- `bun test ./packages/slate/test/transforms-contract.ts`
- `bun test ./packages/slate/test/normalization-contract.ts`
- `bun --filter slate typecheck`
- `bun --filter slate-dom typecheck`
- `bun --filter slate-react typecheck`
- `bun lint:fix`
- `bun check`

Fresh full-gate result:

```txt
bun check
biome check: pass
packages typecheck: 6 successful
site/root typecheck: pass
bun test: 1007 pass, 95 skip, 0 fail
slate-react vitest: 20 files passed, 147 tests passed
```

Browser proof:

- In-app Browser setup succeeded on
  `http://localhost:3102/examples/mentions`.
- Browser smoke could not be completed because Browser Use rejected reload of
  the current page with a `data:` URL safety block. No alternate browser
  workaround was used.

Decision:

- The accepted API direction is implemented for this pass.
- The only unresolved evidence is Browser Use proof for the current in-app tab;
  package and full repo gates are green.
