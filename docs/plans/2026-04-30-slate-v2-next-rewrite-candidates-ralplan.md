# Slate v2 next rewrite candidates ralplan

Status: done
Current pass: closure-score complete
Next pass: ralph-execution-prompt
Score: 0.93, ready for user review before implementation

## Strong take

The next rewrite should not be another render-prop or decorator tweak. The big remaining value is substrate work, in this execution order:

1. extension registration runtime and extension-owned state
2. update metadata plus history/collab policy
3. typed internal command/input policy
4. element spec behavior and extension-owned element properties
5. browser input pipeline cleanup behind existing browser contracts

Do not replace the Slate tree with VS Code's piece tree. Do not copy Lexical class nodes. Do not expose Tiptap's command-chain ceremony as the normal raw Slate API. Those are seductive wrong turns.

## Intent and boundary

Intent: decide what else deserves a real Slate v2 rewrite after the annotation/channel work.

Outcome: a ranked rewrite map with steal, reject, and defer decisions grounded in live `../slate-v2`, `../lexical`, `../prosemirror`, `../tiptap`, and `../vscode`.

In scope:

- raw Slate runtime/API substrate
- `slate-react` input, selection, projection, and selector runtime when it affects the substrate
- migration backbone for Plate and slate-yjs, without requiring current adapter compatibility
- browser proof gates and perf contracts

Non-goals:

- product comment services in raw Slate
- Plate-style command catalogs in raw Slate
- ProseMirror schema/content-expression identity
- Lexical node classes or `$` helper API
- VS Code text buffer replacement for the rich document tree
- broad Tiptap UI-kit parity

Decision boundary: raw Slate owns primitives, lifecycle, deterministic commits, selection/input truth, and data channels. Plate owns product affordances, toolbar APIs, sidebars, command palettes, and comment service UI.

Unresolved user-decision points: none for planning. The first implementation lane should be extension registration runtime unless the user explicitly picks a different P0.

Weakest assumption tested: "commands should become public because Tiptap DX is good." Rejected. The current raw Slate contract already rejects extension command slots and internal command registry exports. Raw Slate should improve feature packaging through lifecycle and `state` / `tx` namespaces, not expose product command catalogs.

## Pass ledger

| Pass | Status | Result |
| --- | --- | --- |
| Current-state read | complete | Live Slate v2 already has read/update, commits/tags, extension namespaces, internal command registry, selector gating, projection channels, and browser contracts. |
| Intent/boundary | complete | The plan is a ranked queue. First executable lane is extension registration runtime. Raw Slate public mutation stays `editor.update`. |
| Research refresh | complete | Local Lexical, ProseMirror, Tiptap, and VS Code sources were read and cited. No contradiction found. |
| Steelman | complete | Public commands, piece-tree core rewrite, schema-first copy paths, and framework-ish naming were rejected. Extension registration/runtime and typed metadata stayed. |
| High-risk deliberate | complete | Public API, collaboration/history, browser input, and package-boundary risks have proof gates and rollback strategy. |
| Revision | complete | Execution order changed: extension registration runtime first, update metadata second, input kernel third. |
| Closure score | complete | Score is `0.93`; no dimension below `0.88`. |

## Current Slate v2 evidence

Already done in live source:

- `editor.read` / `editor.update` exists and forbids starting an update inside a read outside an active transaction: `../slate-v2/packages/slate/src/core/public-state.ts:972-1008`.
- Canonical update tags already include history, paste, collaboration, DOM selection, scroll, focus, and composition tags: `../slate-v2/packages/slate/src/interfaces/editor.ts:126-140`.
- One update produces one commit with operations, dirty paths/runtime ids, selection before/after, tags, and operation classes: `../slate-v2/packages/slate/src/interfaces/editor.ts:814-839`; `../slate-v2/packages/slate/test/commit-metadata-contract.ts:17-127`.
- The transaction snapshot owns children, marks, operations, tags, previous snapshot, command context, and selection: `../slate-v2/packages/slate/src/core/public-state.ts:1773-1830`.
- Extension namespaces exist for `state`, `tx`, and `editor`, with dependencies and rollback: `../slate-v2/packages/slate/src/interfaces/editor.ts:720-780`; `../slate-v2/packages/slate/src/core/editor-extension.ts:67-255`.
- Raw Slate extension command slots are explicitly rejected by type contract: `../slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:130-139`.
- Internal command registry exists with priority and deterministic order, but it is deliberately not public: `../slate-v2/packages/slate/src/core/command-registry.ts:26-109`; `../slate-v2/packages/slate/test/public-surface-contract.ts:205-208`.
- `EditorElementSpec` exists, but it is small: `inline`, `void`, `readOnly`, `selectable`, `markableVoid`, and `match`: `../slate-v2/packages/slate/src/interfaces/editor.ts:319-357`.
- `slate-react` provider composes annotation stores and decoration sources into the projection channel: `../slate-v2/packages/slate-react/src/components/slate.tsx:38-50`; `../slate-v2/packages/slate-react/src/components/slate.tsx:151-160`.
- React selectors already gate updates by commit operations and runtime ids: `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:51-144`; `../slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:41-105`; `../slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx:42-79`.
- Browser contracts already cover annotations, widgets, external decorations, large-document projection, paste, IME, tables, voids, and render budgets: `../slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts:24-198`.

Still weak:

- History does not yet use canonical tags as first-class policy. It mostly batches operations by local heuristics: `../slate-v2/packages/slate-history/src/with-history.ts:86-135`; `../slate-v2/packages/slate-history/src/with-history.ts:180-208`.
- Extension registration has install, dependencies, cleanup, and namespaces, but no explicit `options`, extension runtime output, extension-local state, registration phases, peer dependencies, conflicts, or cleanup signal: `../slate-v2/packages/slate/src/core/editor-extension.ts:19-255`.
- The input pipeline is strong but sprawling. `runtime-before-input-events` mixes policy, browser repairs, app hooks, selection import, model-owned operations, and repair requests in one long path: `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:99-247`.
- Selection ownership exists, but policy is still distributed across controller, reconciler, input state, and browser quirks: `../slate-v2/packages/slate-react/src/editable/selection-controller.ts:60-104`; `../slate-v2/packages/slate-react/src/editable/selection-controller.ts:189-250`.
- `EditorElementSpec` cannot yet express atom/isolating behavior, keyboard-selectability, extension-owned element properties, or edit-boundary policy. Those concerns leak into browser/input code.

## External evidence

Lexical:

- Listener partitions are explicit: update, editable, decorator, text content, root, command, mutation, and node transform listeners: `../lexical/packages/lexical/src/LexicalEditor.ts:862-1040`.
- Commands are prioritized and deterministic within priority, and command listeners run inside update context: `../lexical/packages/lexical/src/LexicalEditor.ts:929-994`.
- Update tags match the Slate v2 canonical tag family almost exactly: `../lexical/packages/lexical/src/LexicalUpdateTags.ts:9-91`.
- Dirty transform scheduling processes dirty leaves before dirty elements, loops until clean, and keeps root transform last: `../lexical/packages/lexical/src/LexicalUpdates.ts:245-348`.
- Extensions have config, dependencies, peer dependencies, conflicts, `init`, `build`, `register`, `afterRegistration`, output, and abort-signal cleanup: `../lexical/packages/lexical/src/extension-core/types.ts:148-286`.
- `NodeState` gives parse/default/equality-backed JSON state for node-owned fields: `../lexical/packages/lexical/src/LexicalNodeState.ts:148-220`.
- `DecoratorNode` exposes isolated, inline, and keyboard-selectable policy hooks: `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:27-45`.

ProseMirror:

- Transaction metadata is first-class and plugin-readable: `../prosemirror/state/src/transaction.ts:22-42`; `../prosemirror/state/src/transaction.ts:185-202`.
- Transaction selection maps through accumulated changes: `../prosemirror/state/src/transaction.ts:67-77`.
- Selection bookmarks map without a current document and resolve later: `../prosemirror/state/src/selection.ts:173-204`; `../prosemirror/state/src/selection.ts:309-317`.
- Plugin state is initialized and applied through transactions; plugins can filter or append transactions: `../prosemirror/state/src/plugin.ts:7-40`; `../prosemirror/state/src/plugin.ts:91-115`.
- Input/view owns event handling, DOM observer flushing, composition flags, and DOM selection import/export: `../prosemirror/view/src/input.ts:19-60`; `../prosemirror/view/src/domobserver.ts:39-145`; `../prosemirror/view/src/domobserver.ts:174-240`.
- History policy uses transaction metadata like `addToHistory`, `closeHistory`, `composition`, `rebased`, selection bookmarks, and adjacency: `../prosemirror/history/src/history.ts:258-368`.

Tiptap:

- Extension config packages options, storage, global attributes, commands, shortcuts, input rules, paste rules, ProseMirror plugins, and nested extensions: `../tiptap/packages/core/src/Extendable.ts:30-258`.
- Node config exposes atom/selectable/draggable/isolating and parse/render/attributes hooks: `../tiptap/packages/core/src/Node.ts:106-244`; `../tiptap/packages/core/src/Node.ts:246-334`.
- CommandManager builds single-command and chain APIs on one transaction: `../tiptap/packages/core/src/CommandManager.ts:28-92`.
- ExtensionManager collects commands, plugins, keyboard shortcuts, input rules, paste rules, node views, and dispatch hooks by extension priority: `../tiptap/packages/core/src/ExtensionManager.ts:58-181`; `../tiptap/packages/core/src/ExtensionManager.ts:246-278`.

VS Code:

- Marker decorations are a separate service channel, not document content: `../vscode/src/vs/editor/common/services/markerDecorationsService.ts:24-130`.
- Decorations are delta-updated by owner id and stored in interval trees partitioned by channel: `../vscode/src/vs/editor/common/model/textModel.ts:1669-1739`; `../vscode/src/vs/editor/common/model/textModel.ts:2197-2352`.
- Piece tree text buffer is excellent for linear text, including sorted non-overlapping edits and bottom-up application: `../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts:304-326`; `../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts:480-505`; `../vscode/src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase.ts:848-940`.

## Ranked rewrite map

### P0. Extension registration runtime and extension-owned state

Decision: rewrite.

Current shape: Slate v2 has extension namespaces, dependencies, cleanup, commit listeners, operation middleware, capabilities, and element specs. It does not yet have registration phases, typed options/runtime output, peer dependency/conflict handling, cleanup signal support, or extension-local state.

Steal:

- Lexical extension registration shape: options/config, init/build/register phases, output, dependencies, peers, conflicts, cleanup signal.
- Tiptap packaging: options, storage, node/mark policy, keyboard/input/paste hooks grouped by feature.

Reject:

- Tiptap public `addCommands` as raw Slate's main API.
- Lexical class-node registration as the document model.
- Any raw Slate extension API that exposes Plate-like product command catalogs.

Target direction:

```ts
const tables = defineEditorExtension({
  name: 'tables',
  dependencies: ['blocks'],
  options: {
    navigation: 'cell-boundary',
  },
  register(context) {
    const selectionMode = context.runtimeState<'cell' | 'text'>('text')

    return {
      capabilities: {
        keyboardBoundary: { kind: 'table-cell' },
      },
      state: {
        table(state) {
          return {
            currentCell: () => state.selection.get(),
          }
        },
      },
      tx: {
        table(tx) {
          return {
            insertRow: () => tx.nodes.insert({ type: 'tr', children: [] }),
          }
        },
      },
      onCommit(commit) {
        if (commit.selectionChanged) selectionMode.set('cell')
      },
    }
  },
})
```

The exact syntax is not final. The direction is: registration output wraps the existing `state` / `tx` / `editor` namespace model. It does not introduce `commands` on raw Slate extensions.

Before:

```ts
editor.extend(
  defineEditorExtension({
    name: 'tables',
    dependencies: ['blocks'],
    state: {
      table(state) {
        return { currentCell: () => state.selection.get() }
      },
    },
    tx: {
      table(tx) {
        return { insertRow: () => tx.nodes.insert(row()) }
      },
    },
    commitListeners: [syncTableState],
  })
)
```

After:

```ts
editor.extend(
  defineEditorExtension({
    name: 'tables',
    dependencies: ['blocks'],
    options: { navigation: 'cell-boundary' },
    register(context) {
      const mode = context.runtimeState<'cell' | 'text'>('text')

      return {
        state: {
          table: (state) => ({ currentCell: () => state.selection.get() }),
        },
        tx: {
          table: (tx) => ({ insertRow: () => tx.nodes.insert(row()) }),
        },
        onCommit(commit) {
          if (commit.selectionChanged) mode.set('cell')
        },
      }
    },
  })
)
```

Why this wins: current namespaces stay intact, while options, registration-owned state, cleanup, conflicts, and typed runtime output become first-class.

Proof:

- dependency, peer, conflict, cleanup, and rollback contracts
- typed config/output inference tests
- extension-local state does not force React rerenders
- no public `commands` extension slot
- docs example with table-like extension plus yjs-like collab listener

### P0. Typed internal command and input-policy kernel

Decision: rewrite internals, keep raw public API as `editor.update`.

Current shape: command handlers have priority and deterministic registration, but command identity is stringly typed, public surface hides registry helpers, and input policy still branches across `runtime-before-input-events`, selection controller, and event kernels.

Steal:

- Lexical command priority and update-context guarantee.
- ProseMirror input/view ownership: one owner for DOM event import, DOM selection import/export, and composition mode.
- Tiptap command discoverability only for generated docs and devtools, not raw public mutation DX.

Reject:

- `editor.commands.toggleBold()` as raw Slate's central API.
- `editor.chain().focus().toggleX().run()` as required UI mutation.
- app-command buses in raw Slate.

Target direction:

```ts
const insertText = defineInternalEditorCommand<{
  inputType?: string
  text: string
}>('insert_text')

registerInputPolicy(editor, insertText, {
  priority: 'model',
  handle(ctx, next) {
    if (ctx.event?.isComposing) return { handled: false }
    return next()
  },
})
```

This should feed commit metadata, not become the public userland mutation API.

Proof:

- command ordering tests by priority and install order
- keyboard/beforeinput/paste/composition families replayed through the same command kernel
- browser contracts continue to prove table, void, IME, paste, annotation, and large-document routes
- public-surface contract still rejects command registry exports

Before:

```ts
const decision = prepareEditableBeforeInputKernel({ editor, event, inputController })
selection.flushSelectionChange()
const beforeInputDecision = getNativeBeforeInputDecision({ editor, event, selection })
const request = applyModelOwnedBeforeInputOperation({ editor, inputType, selection })
```

After:

```ts
inputRuntime.dispatch(beforeInputCommand, {
  event,
  inputType,
  target: selectionPolicy.resolve(event),
})
```

The implementation still ends in `editor.update`; the rewrite is about one typed policy path, not public user commands.

### P0. Update metadata, history, and collab policy

Decision: rewrite.

Current shape: tags and commit metadata exist, but history still relies on local batching heuristics. Collab replay uses tags and deterministic operations, but policy is not rich enough to explain undo grouping, remote imports, rebases, skip-collab, or selection-focus behavior.

Steal:

- ProseMirror `tr.setMeta` idea, but make it typed and Slate-shaped.
- ProseMirror history handling for `addToHistory`, `closeHistory`, composition grouping, rebased content, and selection bookmarks.
- Lexical update tags for lifecycle metadata.

Reject:

- arbitrary untyped plugin metadata as the normal API.
- history behavior inferred only from operation shapes.

Target direction:

```ts
editor.update(
  (tx) => {
    tx.text.insert('!')
  },
  {
    tag: ['paste'],
    metadata: {
      history: { mode: 'push' },
      origin: { kind: 'clipboard' },
      selection: { dom: 'export-model', scroll: false },
    },
  }
)
```

`tag` remains the cheap broad signal. `metadata` becomes the typed durable policy channel for history, collab, browser selection, and docs/devtools.

Before:

```ts
editor.update(
  (tx) => {
    tx.operations.replay(remoteOps, { tag: 'remote-import' })
  },
  { tag: 'collaboration' }
)
```

After:

```ts
editor.update(
  (tx) => {
    tx.operations.replay(remoteOps)
  },
  {
    tag: ['collaboration'],
    metadata: {
      collab: { origin: 'remote', saveToHistory: false },
      history: { mode: 'skip' },
      selection: { dom: 'preserve' },
    },
  }
)
```

Why this wins: tags stay lightweight, but history/collab/browser selection stop guessing policy from operation shape.

Proof:

- `history-push`, `history-merge`, `historic`, `skip-collab`, `collaboration`, `remote-import`, and `rebased` behavior contracts
- undo/redo selection restoration through bookmarks
- remote replay does not save local history unless explicitly requested
- composition grouping does not create broken undo batches

### P1. Element spec behavior and extension-owned properties

Decision: rewrite after the P0 runtime work starts.

Current shape: `EditorElementSpec` covers inline/void/readOnly/selectable/markableVoid. That is not enough to encode table cells, editable islands, decorator-like atoms, keyboard-selectable voids, isolating blocks, or extension-owned element properties without scattering policy across React/browser code.

Steal:

- Tiptap/ProseMirror node policy names: `atom`, `selectable`, `draggable`, `isolating`.
- Lexical `DecoratorNode` policy: inline, isolated, keyboard-selectable.
- Lexical `NodeState` and Tiptap `addAttributes` for parse/default/equality-backed extension-owned element properties.

Reject:

- ProseMirror content expressions as Slate core identity.
- renderHTML/parseHTML as the raw Slate core rendering story.
- schema-first enforcement that makes plain JSON authoring painful.

Target direction:

```ts
editor.schema.define({
  type: 'table-cell',
  isolating: true,
  selectable: false,
  properties: {
    colSpan: property.number({ default: 1 }),
    rowSpan: property.number({ default: 1 }),
  },
})
```

Keep it optional. Raw Slate must still accept plain JSON nodes.

Proof:

- element spec contracts for atom, isolating, keyboard selectable, editable island, and read-only behavior
- table boundary browser contract uses spec policy, not hard-coded table branches
- property defaults do not mutate user values unless a write path chooses normalization
- JSON serialization remains plain

### P1. Browser input pipeline cleanup

Decision: rewrite behind existing contracts, not as a public API project.

Current shape: the runtime already has serious browser ownership, but the beforeinput path is too dense. It should read as a policy pipeline, not a maze of special cases.

Steal:

- ProseMirror DOM observer and input-state discipline.
- Lexical command/input priority.
- existing Slate browser contract registry as the release proof backbone.

Target phases:

1. classify event and intent
2. resolve selection policy
3. import or preserve DOM selection
4. run app hooks with explicit ownership
5. execute model-owned command/update
6. export/repair DOM selection
7. publish browser trace

Proof:

- beforeinput, keydown, paste, drop, composition, Android, Shadow DOM, editable island, and table routes
- browser traces prove which phase owned the event
- render budgets stay green

### P1. React selector/runtime hardening

Decision: harden, do not rewrite wholesale.

Current shape: selector context and runtime-id gating already exist. The useful work is making commit dirtiness and projection invalidation even more explicit, not replacing everything with a generic external store just because React has one.

Steal:

- Lexical listener partitioning.
- Tiptap selector guidance.
- VS Code channel partitioning for decoration/projection stores.

Target direction:

- partition subscribers by commit class and runtime id
- keep `useNodeSelector`, `useTextSelector`, and `useDecorationSelector` as the public React posture
- use `useSyncExternalStore` only if it improves correctness without forcing hot-path rerenders
- keep urgent text sync out of React rerender dependency

Proof:

- render-profiler contracts with node, leaf, text, decoration, annotation, widget, and large-document scenarios
- external decoration refresh does not rerender the editable root
- selectors do not see torn state across one commit

### Already done. Decoration/annotation channels

Decision: no new core rewrite.

Current shape: annotation stores and decoration sources are external channels, composed through projections. Browser contracts include external decoration refresh, many-source overlay refresh, annotation metadata updates, annotation bookmark rebase, widget dirty-id wakeup, mixed updates, and large-document projection budgets.

Steal only for polish:

- VS Code owner-id/channel partitioning vocabulary
- service-like examples for comment channels

Do not put reader comments in the Slate value. That would be a regression.

### Defer. Optional chain API

Decision: defer.

Tiptap's chain API is useful sugar, but it should be sugar over `editor.update`, not the mutation model. Build it only after update metadata and extension registration are stable.

### Reject. VS Code piece tree as Slate core model

Decision: reject for rich document core, keep as future inspiration for huge text islands.

VS Code's piece tree is brilliant for linear text. Slate is a nested rich tree with path/runtime-id operations, voids, annotations, and React projection. Replacing the core model would buy text-buffer performance at the cost of Slate's actual identity.

Steal:

- sorted non-overlapping edit validation
- bottom-up edit application for text islands
- interval-tree/channel ideas for overlays

Do not steal:

- linear text buffer as the document model
- line/column positions as raw Slate coordinates

## Decision brief

Principles:

- Raw Slate stays unopinionated and JSON-first.
- Public writes go through `editor.update`.
- Extensions can package behavior, but should not turn raw Slate into a product framework.
- Browser selection/input has one owner.
- Commit metadata is the durable contract for history, collab, React, and proof.

Drivers:

- Plate migration needs feature packaging and namespaced APIs.
- slate-yjs-like collab needs local/remote policy that is not guessed from operation shapes.
- Browser proof keeps finding selection/input bugs where ownership is implicit.
- React perf depends on commit dirtiness and channel invalidation, not full snapshot churn.
- Agent DX needs JSDoc-friendly APIs with obvious legal read/write boundaries.

Viable options:

- Option A: stop after current work and only document. Rejected. Too many policies are still implicit or scattered.
- Option B: copy Lexical. Rejected. Class nodes and `$` helpers fight Slate.
- Option C: copy ProseMirror. Rejected. Integer positions and schema-first identity fight Slate.
- Option D: copy Tiptap. Rejected as engine design. Useful as extension/product DX reference.
- Option E: targeted substrate rewrites. Chosen.
- Option F: VS Code model rewrite. Rejected for core. Defer to text-island and overlay indexing.

Consequences:

- More internal architecture, but less accidental public API.
- More tests before visible features, but better release confidence.
- Extensions get stronger, but raw Slate must keep product APIs out.

## First executable lane

Start with extension registration runtime.

Why first:

- It unlocks the cleanest adoption story for Plate and slate-yjs-like integrations.
- It does not require changing the document data model.
- It gives update metadata and input policy a place to register behavior later.
- It is easier to prove with unit/type contracts before browser-sensitive rewrites.

Implementation slices:

1. Add registration runtime shape on top of existing `defineEditorExtension` without removing `state` / `tx` / `editor`.
2. Add options/runtime-output/cleanup/conflict/peer-dependency contracts.
3. Add extension-local state primitive with explicit cleanup.
4. Prove public surface still rejects `commands`.
5. Write one docs example: table-like extension plus collab listener, no Plate API.

Do not start with input pipeline cleanup. It has higher browser blast radius and should consume the lifecycle/metadata substrate after those are stable.

## Maintainer objection ledger

| Objection | Answer | Verdict |
| --- | --- | --- |
| "This turns Slate into Tiptap." | Only if raw Slate exposes product command catalogs. The plan keeps `editor.update` as the public mutation API and keeps commands internal or first-party policy. | keep |
| "Extension lifecycle is too much framework." | Agreed on the naming risk. Call it extension registration/runtime, not lifecycle. Current namespaces are good but underpowered; options/output/cleanup/conflict state are substrate, not product UX. Keep the API small and typed. | keep |
| "History should not need a metadata system." | Operation shape cannot distinguish paste, collaboration, history replay, composition, skip-collab, or explicit group splits reliably. Tags already prove the need; typed metadata closes it. | keep |
| "Input rewrite risks breaking browser behavior." | Correct. It must happen behind existing browser contracts, one phase at a time, with trace output. That is why input is third, after extension registration and update metadata. | keep |
| "VS Code piece tree is faster." | For linear text, yes. For Slate's nested rich tree, it is the wrong core model. Steal edit validation and overlay indexing only. | drop core rewrite |
| "Commands should be public for DX." | Public commands are Plate's job. Raw Slate can expose primitive namespaced `state`/`tx` groups and optional later sugar. | keep |

## High-risk deliberate plan

Trigger: public extension API, update metadata, history/collab behavior, browser input, and React subscriptions are high-blast-radius surfaces.

Blast radius:

- packages: `slate`, `slate-react`, `slate-history`, `slate-browser`
- consumers: raw Slate users, Plate migration, slate-yjs-like collaboration, browser examples
- behavior: extension install/cleanup, undo/redo grouping, remote replay, selection import/export, render invalidation
- docs/tests: public API contracts, migration backbone contracts, browser operation-family contracts, extension docs

Pre-mortem:

- Extension registration becomes framework sludge. Prevention: registration wraps existing namespaces; raw public commands remain rejected.
- Update metadata duplicates tags and confuses users. Prevention: tags are broad lifecycle labels; metadata is typed policy for history/collab/selection.
- Input cleanup breaks IME/table/void behavior. Prevention: input rewrite waits until lifecycle/meta land and runs only behind first-party browser contracts.

Rollback/remediation:

- Extension registration can be feature-gated behind new optional fields while preserving old `state` / `tx` / `editor` extension input.
- Update metadata can ship as additive `EditorUpdateOptions.metadata`; existing `tag` behavior stays valid.
- Input pipeline cleanup must land in small refactor slices with browser contracts green at every step.

## Proof matrix

| Lane | Required proof |
| --- | --- |
| Extension registration runtime | type inference, dependency order, missing peer, conflict, rollback cleanup, cleanup-signal behavior, extension-local state cleanup, no public `commands` slot |
| Update metadata/history/collab | `history-push`, `history-merge`, `historic`, `skip-collab`, remote import, rebased commit, selection bookmark restore, composition grouping |
| Internal command/input policy | priority ordering, deterministic same-priority order, implicit update context, beforeinput/keydown/paste/composition dispatch, public registry still hidden |
| Element interaction spec | atom, isolating, selectable, keyboard selectable, editable island, read-only, attribute default/equality behavior |
| Browser input cleanup | browser contracts for tables, voids, paste, IME, annotations, large-document projection, render budgets |
| React runtime | selector no-tearing, runtime-id invalidation, projection-channel invalidation, external decoration refresh without root rerender |

## Implementation-skill review notes

- Vercel React: applied. React work must stay selector/commit-dirtiness based, avoid broad subscriptions, and keep urgent text sync out of React rerenders.
- Performance oracle: applied. Avoid whole-document invalidation, unbounded overlay scans, recursive decoration churn, and O(n) subscription fanout on hot text input.
- TDD: applied as implementation acceptance. Use vertical contracts per lane, not horizontal "write all tests first" coverage dumps.
- shadcn/react-useeffect: skipped. This is not a UI component or effect-specific implementation plan yet.

## Final score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React runtime performance | 0.92 | Selector/runtime-id gating, projection stores, render-profiler contracts, and hot-path rules are named. |
| Slate-close unopinionated DX | 0.95 | Public writes stay `editor.update`; JSON nodes stay core; public command slots stay rejected; extension registration wraps current namespaces. |
| Plate and slate-yjs migration backbone | 0.92 | First lane targets extension registration/runtime; update metadata covers history/collab; raw Slate avoids current adapter compatibility promises. |
| Regression-proof testing | 0.92 | Proof matrix names unit/type/browser contracts for each lane, including first-party browser operation families. |
| Research evidence completeness | 0.94 | Local Lexical, ProseMirror, Tiptap, VS Code, and live Slate v2 source evidence are cited. |
| shadcn-style composability | 0.91 | Plan keeps composable hooks/selectors and extension packaging without product UI APIs. |

Weighted score: 0.93.

Completion threshold is met. The plan is ready for user review and a later `ralph` execution prompt.

## Next pass

Run `ralph` next if the user wants execution:

- execution starts with extension registration runtime
- keep implementation in `../slate-v2`
- do not implement product commands in raw Slate
- add vertical contracts per slice before refactoring broader runtime code

## Ralph execution ledger

| Time | Pass | Status | Evidence | Next action |
| --- | --- | --- | --- | --- |
| 2026-04-30T18:00:00Z | ralph-execution-prompt | in_progress | `.tmp/completion-check.md` moved to `pending`; `.tmp/continue.md` refreshed for the accepted execution lane. Live files re-read: `packages/slate/src/interfaces/editor.ts`, `packages/slate/src/core/editor-extension.ts`, `packages/slate/src/core/extension-registry.ts`, and extension namespace contracts in the implementation workspace. | Start the first extension registration runtime slice with focused contracts, then patch implementation additively. |
| 2026-04-30T19:00:00Z | extension-registration-runtime | complete | Implemented additive `register(context)` output, `options`, `peerDependencies`, `conflicts`, cleanup signal, extension-local `runtimeState`, runtime rejection of raw extension `commands`, focused runtime contracts, generic extension command-slot type rejection, and docs example in the Slate v2 implementation workspace. Gates: `bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/extension-namespace-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/extension-methods-contract.ts`; `bun --filter slate typecheck`; Biome check on touched Slate files. Residual: `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit` still fails in unrelated generic editor/value/operation files, not the new extension namespace contract. | Next accepted-plan owner is update metadata plus history/collab policy. |
| 2026-04-30T19:10:00Z | update-metadata-history-collab | in_progress | User corrected that `ralph` must keep the whole accepted implementation plan open. `.tmp/completion-check.md` reopened to `pending`; `.tmp/continue.md` now names all remaining owners and keeps the full plan as the completion target. | Start typed update metadata/history/collab slice with focused contracts against current live files. |
| 2026-04-30T19:35:00Z | update-metadata-history-collab | complete | Implemented typed `EditorUpdateOptions.metadata`, frozen commit metadata, history push/merge/skip policy, remote collab skip-history policy, and docs for update metadata. Gates: `bun test ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate-history/test/history-contract.ts ./packages/slate/test/public-surface-contract.ts`; `bun --filter slate typecheck`; `bun --filter slate-history typecheck`; `bunx biome check ...`; `bun test ./packages/slate-history/test`; `bun test ./packages/slate-history/test/integrity-contract.ts`; `bun test ./packages/slate/test/read-update-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`; `git diff --check ...`. | Next accepted-plan owner is typed internal command/input policy. |
| 2026-04-30T19:40:00Z | typed-internal-command-input-policy | in_progress | Completion state advanced to the third owner while keeping the full implementation plan pending. | Read current command registry and input policy code; start with focused typed-command contracts. |
| 2026-04-30T20:00:00Z | typed-internal-command-input-policy | in_progress | Implemented typed internal command definitions for the core command registry, with deterministic priority-order proof and public-surface proof that command helpers stay hidden from raw Slate public exports. Gates: `bun test ./packages/slate/test/transaction-contract.ts ./packages/slate/test/public-surface-contract.ts`; `bun --filter slate typecheck`; `bunx biome check packages/slate/src/interfaces/editor.ts packages/slate/src/core/command-registry.ts packages/slate/src/internal/index.ts packages/slate/test/transaction-contract.ts packages/slate/test/public-surface-contract.ts`. | Continue same owner: connect browser/input policy to typed command definitions or record why the editable command union remains the input-side policy shape for this pass. |
| 2026-04-30T20:15:00Z | typed-internal-command-input-policy | complete | Added typed editable command definitions, command-definition traces, beforeinput/keydown command-definition proof, and kept core command helpers hidden from raw public exports. Gates: `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/editing-epoch-kernel-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/public-surface-contract.ts`; `bun --filter slate typecheck`; `bun --filter slate-react typecheck`; `bunx biome check ...`. | Next accepted-plan owner is element spec behavior and extension-owned element properties. |
| 2026-04-30T20:20:00Z | element-spec-behavior-extension-properties | in_progress | Completion state advanced to the fourth owner while keeping the whole implementation plan pending. Solution notes checked: explicit contract files must be path-run, and browser-proof gates stay required before broad migration claims. | Read live element spec/schema files and start with focused element spec/property contracts. |
| 2026-04-30T20:45:00Z | element-spec-behavior-extension-properties | complete | Implemented additive atom/isolating/keyboard-selectable/editable-island schema policy, `elementProperty` descriptors, default/equality reads without JSON mutation, matched-spec property overlays, reserved property rejection, and docs. Gates: `bun test ./packages/slate/test/schema-contract.ts ./packages/slate/test/query-contract.ts ./packages/slate/test/migration-backbone-contract.ts ./packages/slate/test/public-surface-contract.ts`; `bun --filter slate typecheck`; `bunx biome check ...`; `git diff --check ...`. | Next accepted-plan owner is browser input pipeline cleanup. |
| 2026-04-30T20:45:00Z | browser-input-pipeline-cleanup | in_progress | Completion state advanced to the final implementation owner while keeping the whole implementation plan pending. | Read live Slate React input pipeline and existing input/kernel contracts; start with the smallest cleanup backed by focused proof. |
| 2026-04-30T21:00:00Z | browser-input-pipeline-cleanup | complete | Removed duplicate beforeinput command parsing by threading the typed kernel command into model-owned beforeinput execution and the React fallback path. Gates: `bun test ./packages/slate-react/test/model-input-strategy-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/editing-epoch-kernel-contract.ts`; `bun --filter slate-react typecheck`; `bunx biome check ...`; `bun --filter slate-browser test:proof`; `bun --filter slate-browser test:selection`; `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "keeps model and DOM coherent after persistent native word-delete"`. | Run diff review, then verification sweep before setting completion done. |
| 2026-04-30T21:00:00Z | diff-review-pass | in_progress | Whole accepted implementation lane is ready for changed-file review. | Review changed files for concrete regressions and either fix them or proceed to verification sweep. |
| 2026-04-30T23:13:40Z | diff-review-pass | complete | Changed-file review found and fixed one concrete browser-input regression risk: prepared beforeinput commands must not freeze stale delete selection before DOM selection import. Delete commands now refresh against the synced selection, while typed insert commands still win over stale raw event data. Gates: `bun test ./packages/slate-react/test/model-input-strategy-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/editing-epoch-kernel-contract.ts`; `bun --filter slate-react typecheck`; `bunx biome check packages/slate-react/src/editable/model-input-strategy.ts packages/slate-react/src/editable/runtime-before-input-events.ts packages/slate-react/test/model-input-strategy-contract.ts packages/slate-react/test/editing-kernel-contract.ts packages/slate-react/test/editing-epoch-kernel-contract.ts`. | Run verification sweep before setting completion done. |
| 2026-04-30T23:13:40Z | verification-sweep-pass | in_progress | Completion state advanced to final whole-plan proof. | Run the final proof bundle across Slate core, history/collab, Slate React, browser proof, typecheck, Biome, diff whitespace, and completion-check. |
| 2026-04-30T23:16:12Z | verification-sweep-pass | complete | Final proof passed: Slate core/history/collab contracts (`408 pass, 0 fail`); Slate React annotation/projection/input contracts (`43 pass, 0 fail`); `bun --filter slate typecheck`; `bun --filter slate-history typecheck`; `bun --filter slate-react typecheck`; changed-file Biome check; `git diff --check` in `../slate-v2`; `git diff --check` for plan/state files in this repo; `bun --filter slate-browser test:proof` (`23 pass, 0 fail`); `bun --filter slate-browser test:selection` (`1 file passed, 2 tests`); focused Chromium Playwright row `keeps model and DOM coherent after persistent native word-delete` (`1 passed`). | Set `.tmp/completion-check.md` to `done`; run completion-check. |
| 2026-04-30T23:18:38Z | ce-compound | complete | Captured the reusable diff-review lesson in `docs/solutions/ui-bugs/2026-04-30-slate-react-beforeinput-delete-commands-must-refresh-synced-selection.md`. Biome ignores `docs/solutions/**/*.md`; `git diff --check` and `bun run completion-check` passed after the write. | Whole accepted plan remains done. |
