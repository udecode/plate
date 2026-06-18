---
date: 2026-05-07
topic: slate-v2-operation-extensibility-validation
status: done
skill: slate-ralplan
score: 0.93
---

# Slate v2 Operation Extensibility Validation Ralplan

## 1. Current Verdict

Select `v2-operation-extensibility-validation` as the next issue-backed lane.

The sharp decision:

```txt
Operation.isOperation(value) remains the built-in Slate operation guard.
Editor detection must never depend on user operation log validation.
Custom operation-like data needs editor-scoped registration or commit metadata.
Raw arbitrary custom ops must not silently enter core apply/history/collab.
```

This is the right next lane because `#5977` has been deliberately excluded from
the structural delete and normalization plan, and current live source shows the
original `isEditor` crash path is probably already gone but not locked by an
issue-shaped test.

## 2. Intent And Boundary

Intent:

- Resolve the custom-operation validation pressure without weakening Slate's
  operation model.
- Keep operations useful for history, refs, collaboration, replay, and JSON
  transport.
- Give extension authors a real escape hatch without reintroducing legacy
  mutable public `editor.operations` coupling.

Desired outcome:

- Exact proof for the `#5977` failure class.
- Built-in operation type guards are easier to use from TypeScript.
- Custom app metadata uses commit tags or extension-owned state.
- Custom document-changing operations require explicit editor-scoped operation
  specs before they can be replayed.

In scope:

- `packages/slate/src/interfaces/operation.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/editor-extension.ts`
- `packages/slate/src/core/extension-registry.ts`
- `packages/slate/test/interfaces-contract.ts`
- `packages/slate/test/generic-operation-contract.ts`
- `packages/slate/test/generic-extension-contract.ts`
- DOM bridge smoke only if current `slate-dom` still consults editor predicates
  on the exact path.

Non-goals:

- No global `Operation.register(...)`.
- No arbitrary unknown operation acceptance.
- No public `Editor.*` growth.
- No product command catalog in raw Slate.
- No full custom CRDT protocol design.
- No custom operation apply/inverse support without dirty/ref/history semantics.

Decision boundaries:

- Ralph may add tests and implementation in `Plate repo root`.
- Ralph may update docs/ledgers and PR description claim counts.
- Ralph may claim `Fixes #5977` only if the original editor-detection failure is
  proven impossible through an issue-shaped test.
- Ralph may only claim `Improves #5558` unless specific built-in operation guard
  APIs land and typecheck proves useful narrowing.

Unresolved user-decision points:

- None. The architecture decision is clear enough to execute.

## 3. Decision Brief

Principles:

- Operations are collaboration/history truth, not generic app events.
- Unknown data must fail closed unless Slate knows how to apply, invert, map,
  dirty, serialize, and replay it.
- Editor identity is editor identity. It must not depend on the current contents
  of an operation log.
- Extension DX should be discoverable but editor-scoped.
- Raw Slate should stay smaller than Plate/Tiptap command catalogs.

Top drivers:

- `#5977` reports custom operations breaking `isEditor` and then
  `DOMEditor.findPath`.
- v2 already hard-cuts public mutable editor fields; direct public
  `editor.operations` is no longer the normal contract.
- Current `Operation.isOperation` validates only built-in operation shapes.
- Current extension infrastructure already supports operation middleware and
  state/tx groups.

Viable options:

1. Accept any object with a `type` string as an operation.

   - Pro: fixes the broadest reading of `#5977`.
   - Con: breaks operation integrity; history/collab/ref logic cannot know what
     it means.
   - Verdict: reject.

2. Keep custom operations out of `Operation`, and use commit metadata only.

   - Pro: cleanest core.
   - Con: does not help plugins that genuinely need custom document-changing
     operation transport.
   - Verdict: partial.

3. Add editor-scoped operation specs for advanced extensions, while keeping
   `Operation.isOperation` built-in-only.

   - Pro: keeps default core strict, gives advanced users a typed path, avoids
     global registry collisions.
   - Con: needs careful proof before any full custom apply/replay support.
   - Verdict: chosen direction.

4. Copy ProseMirror custom steps directly.
   - Pro: proven model for registered custom operations.
   - Con: too class-heavy and schema-shaped for Slate.
   - Verdict: steal the registration discipline, not the class model.

Chosen option:

- First close the `#5977` editor-detection crash with a narrow proof.
- Add built-in operation subtype guard DX if it is low risk.
- Add only a small editor-scoped operation-spec substrate if the test requires
  custom operation validation beyond editor detection.
- Do not make unknown ops applyable.

Consequences:

- `Operation.isOperation(custom)` may continue returning `false`.
- A custom operation can be recognized only in an editor-scoped context.
- Apps that only need audit/paste/history metadata should use update tags, not
  custom operations.

Follow-ups:

- A later collaboration plan may add serializable custom operation specs only
  after map/invert/rebase semantics are proven.

## 4. Confidence Scorecard

| Dimension                              | Score | Evidence                                                                                                                                              |
| -------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.91 | No React hot path is added; `Operation.isOperation` stays pure and editor-scoped lookup is only for advanced operation validation.                    |
| Slate-close unopinionated DX           |  0.94 | Keeps data namespaces; uses `state`/`tx` extension groups from `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:65`. |
| Plate and slate-yjs migration backbone |  0.92 | Operation integrity remains strict; custom metadata is routed through tags/specs, not arbitrary log pollution.                                        |
| Regression-proof testing strategy      |  0.94 | Plan names red tests for `#5977`, built-in subtype guards, invalid unknown ops, operation middleware, and optional DOM bridge smoke.                  |
| Research evidence completeness         |  0.93 | Live v2 source, gitcrawl issue reads, Lexical command tags, ProseMirror custom step registration, and Tiptap transaction middleware were checked.     |
| Minimal composability                  |  0.94 | No global registry and no flat command catalog; extension state/tx groups stay the public package point.                                              |

Total: `0.93`.

## 5. Source-Backed North Star

Current live source:

- `packages/slate/src/interfaces/operation.ts:147` defines
  `Operation` as a built-in union only.
- `packages/slate/src/interfaces/operation.ts:200` validates
  built-in operation shapes with a switch and rejects unknown types at
  `packages/slate/src/interfaces/operation.ts:266`.
- `packages/slate/src/editor/is-editor.ts:3` now checks internal
  editor state, not `Operation.isOperationList`.
- `packages/slate/src/core/public-state.ts:1367` already routes
  operations through extension operation middleware.
- `packages/slate/src/core/editor-extension.ts:294` already
  registers extension operation middleware.
- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:65`
  accepts extension namespaces on `state` and `tx`.

North star:

```txt
strict built-in operation contract
+ editor-scoped extension specs for advanced custom operation recognition
+ commit tags for app metadata
+ package tests that prove editor detection ignores operation-log shape
```

## 6. Ecosystem Strategy Synthesis

| System           | Evidence                                                                                                                                         | Mechanism                                                                                                 | Slate target                                                                                      | Verdict |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------- |
| Lexical          | `../lexical/packages/lexical/src/LexicalCommands.ts:17`; `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md:53` | Commands are reference-typed and listeners are partitioned; update tags carry lifecycle metadata.         | Use tags/metadata for app-specific events. Do not turn custom operations into app command events. | partial |
| ProseMirror      | `../prosemirror/transform/src/step.ts:11`; `../prosemirror/state/src/transaction.ts:26`                                                          | Custom steps require registered classes with apply/invert/map/JSON behavior; transactions carry metadata. | Steal registered custom semantics and transaction metadata, reject class/position model.          | agree   |
| Tiptap           | `../tiptap/packages/core/src/commands/setMeta.ts:5`; `../tiptap/packages/core/__tests__/dispatchTransaction.spec.ts:7`                           | Extension hooks wrap transactions and commands can set metadata.                                          | Keep extension operation middleware, but keep raw Slate writes inside `editor.update`.            | partial |
| Slate v2 current | `packages/slate/src/core/public-state.ts:1367`; `packages/slate/src/core/editor-extension.ts:294`                    | Operation middleware already exists.                                                                      | Use current middleware as the first proof owner; add specs only if necessary.                     | agree   |

## 7. Public API Target

Keep:

```ts
Operation.isOperation(value);
Operation.isOperationList(value);
Operation.isNodeOperation(value);
Operation.isTextOperation(value);
Operation.isSelectionOperation(value);
```

Add only if TypeScript proof justifies it:

```ts
Operation.isInsertNodeOperation(value);
Operation.isRemoveNodeOperation(value);
Operation.isMergeNodeOperation(value);
Operation.isSplitNodeOperation(value);
Operation.isMoveNodeOperation(value);
Operation.isSetNodeOperation(value);
Operation.isInsertTextOperation(value);
Operation.isRemoveTextOperation(value);
Operation.isSetSelectionOperation(value);
Operation.isReplaceChildrenOperation(value);
Operation.isReplaceFragmentOperation(value);
```

Do not add:

```ts
Operation.register(...)
Operation.isOperation(value, editor)
Editor.isOperation(...)
editor.commands.*
customOperation: true
```

Advanced extension target, only if required by the red proof:

```ts
defineEditorExtension({
  name: "my-extension",
  operations: {
    "my-extension:mark-imported": {
      is(value): value is MyOperation {
        return value?.type === "my-extension:mark-imported";
      },
      kind: "metadata",
    },
  },
});

editor.read((state) => {
  state.operations.is(value);
});
```

For document-changing custom operations, specs must eventually include:

```ts
{
  kind: 'document'
  is(value): value is MyOperation
  apply(tx, operation): void
  inverse?(state, operation): MyOperation
  mapPath?(path, operation): Path | null
  dirtyPaths?(operation): Path[]
  toJSON?(operation): unknown
  fromJSON?(value): MyOperation
}
```

Hard cut:

- Do not support document-changing custom operations until the full semantics
  above have tests.

## 8. Internal Runtime Target

Execution should first prove:

- `Editor.isEditor(editor)` stays true even if internal operation history holds
  a custom operation-like object.
- `Operation.isOperation(custom)` stays false unless the object is a built-in
  Slate operation.
- `Operation.isOperationList([...builtIns, custom])` stays false for the pure
  built-in guard.
- Extension operation middleware still receives canonical operations only.
- Unknown operations passed to `tx.operations.replay` fail with a useful error.

If an editor-scoped custom operation spec is added:

- registry lives on the editor extension registry, not a module global.
- lookup is O(1) by operation `type`.
- spec registration is deterministic and duplicate type IDs throw.
- custom metadata operations do not touch history/ref/collab unless explicitly
  configured.

## 9. Hook, Component, And Render DX Target

No React component or hook API should be added for this lane.

If DOM proof is needed, it is a smoke test that `DOMEditor.findPath` or the
current v2 DOM bridge no longer fails editor detection because of the operation
history. The plan does not add a React hook.

## 10. Plate Migration Backbone

Plate should use:

- `editor.update((tx) => ...)` for writes.
- extension `state`/`tx` groups for feature methods.
- update tags for app command metadata.
- operation middleware for inspecting canonical operations.
- future editor-scoped operation specs only for true custom document mutation.

Plate should not depend on arbitrary unknown operation objects being accepted by
raw Slate core.

## 11. slate-yjs Migration Backbone

Yjs adapters need operation integrity more than arbitrary extension freedom.

Rules:

- Built-in Slate operations remain serializable and validated.
- `replace_children` remains the preferred range-compaction primitive for large
  child-window changes.
- Custom metadata should travel as update tags or adapter metadata, not as core
  operations.
- Custom document operations need explicit map/invert/rebase semantics before a
  collaboration adapter may replay them.

## 12. Issue Ledger Accounting

ClawSweeper pass:

- applied through gitcrawl `doctor`, `threads`, `neighbors`, and `search`.
- reviewed issues: `#5977`, `#5558`, `#5129`, `#5080`, `#5412`, `#3891`,
  `#3964`, `#3973`, `#6016`, `#6053`.

Issue matrix:

| Issue | Cluster                     | Claim       | Why                                                                                                                                                                            | Proof route                    | Ledger sync                               | PR line             |
| ----- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----------------------------------------- | ------------------- |
| #5977 | custom-operation-validation | Fixes       | Editor identity ignores user-attached custom operation lists, DOM `findPath` still resolves, and replay rejects unknown operation records before they enter the operation log. | package unit, DOM bridge smoke | dossier refreshed in execution            | fixed line added    |
| #5558 | operation-type-guard-dx     | Improves    | Concrete built-in operation subtype guards landed with runtime and TypeScript narrowing proof.                                                                                 | typecheck contract             | dossier and matrix refreshed in execution | improved line added |
| #5129 | replace-node-transform      | Not claimed | Node replacement API is separate transform/history design pressure.                                                                                                            | no proof in this lane          | unchanged                                 | none                |
| #5080 | reverse-node-iteration      | Not claimed | `Editor.nodes({ reverse: true })` traversal semantics are separate query API behavior.                                                                                         | no proof in this lane          | unchanged                                 | none                |
| #5412 | insert-fragment-at          | Not claimed | Fragment target placement belongs to transform/clipboard insertion, not operation validation.                                                                                  | no proof in this lane          | unchanged                                 | none                |
| #3891 | multi-node-remove-range     | Not claimed | Already represented by `replace_children`; public helper API is separate.                                                                                                      | existing related row           | unchanged                                 | none                |
| #3964 | insertBreak selection       | Not claimed | Core caret placement lane, not custom operation validation.                                                                                                                    | no proof in this lane          | unchanged                                 | none                |
| #3973 | word movement               | Not claimed | Core movement lane, not custom operation validation.                                                                                                                           | no proof in this lane          | unchanged                                 | none                |
| #6016 | shared initial value        | Not claimed | Existing dossier classifies as likely invalid shared-node reuse; not this lane.                                                                                                | no proof in this lane          | unchanged                                 | none                |
| #6053 | useSelected stale path      | Not claimed | React selector stale path issue, already improved elsewhere.                                                                                                                   | no proof in this lane          | unchanged                                 | none                |

Fixed issues:

- `#5977` after execution proof.

Improved issues:

- `#5558` after operation subtype guards landed.

PR description:

- fixed count updated to include `#5977`.
- open-debt wording updated to classify `#5977` as fixed.
- `#5558` added as an improved operation guard DX row.

## 13. Legacy Regression Proof Matrix

| Proof                                | Required result                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `#5977` editor detection             | `isEditor` does not validate operation log shape.                                        |
| Custom unknown op in pure guard      | `Operation.isOperation(custom)` returns false with no crash.                             |
| Built-in operation list              | built-in list remains accepted.                                                          |
| Mixed built-in/custom list           | pure built-in list guard rejects it.                                                     |
| `DOMEditor.findPath` smoke if needed | no editor-detection failure caused by custom operation-like history data.                |
| Operation subtype guards             | TypeScript narrows each built-in op without casts.                                       |
| Middleware                           | extension operation middleware still sees canonical operations.                          |
| Replay invalid op                    | `tx.operations.replay([custom as any])` fails with a clear error unless a spec exists.   |
| Custom metadata spec if added        | editor-scoped `state.operations.is(value)` accepts the registered custom metadata shape. |
| Duplicate spec if added              | duplicate operation type registration throws deterministically.                          |

## 14. Browser Stress And Parity Strategy

This is mostly a package-level API/runtime lane.

Browser proof is required only if live `slate-dom` source still has a public
path that can reproduce the `DOMEditor.findPath` failure from `#5977`.

If browser proof is needed:

- use a tiny custom example or unit DOM harness;
- avoid adding a public example unless the API itself becomes public;
- prove no crash, not visual behavior.

## 15. Applicable Implementation-Skill Review Matrix

| Lens                          | Status  | Reason                                                     | Plan delta                                    |
| ----------------------------- | ------- | ---------------------------------------------------------- | --------------------------------------------- |
| `tdd`                         | applied | Behavior/API regression class with good package seams.     | Red tests first for `#5977` and guard typing. |
| `performance-oracle`          | applied | Operation predicates are hot enough to keep pure and O(1). | No document scans or global registries.       |
| `performance`                 | skipped | No repeated React UI or virtualization claim.              | none                                          |
| `vercel-react-best-practices` | skipped | No React rendering change planned.                         | none                                          |
| `react-useeffect`             | skipped | No effects planned.                                        | none                                          |
| `build-web-apps:shadcn`       | skipped | No UI surface.                                             | none                                          |

## 16. High-Risk Deliberate-Mode Premortem

Risk: Accepting unknown operations makes Slate impossible to reason about.

- Guard: keep `Operation.isOperation` strict.

Risk: A global operation registry leaks across tests/editors.

- Guard: operation specs, if added, are editor-scoped.

Risk: A custom operation spec implies collab support before map/invert semantics
exist.

- Guard: metadata-only specs are separate from document-changing specs.

Risk: Adding eleven specific operation guards bloats the API.

- Guard: add them only if typecheck proof shows they replace real casts or user
  pain; otherwise defer.

Risk: Claiming `#5977` fixed while only rejecting custom ops.

- Guard: claim exact fix only if the original `isEditor`/`findPath` failure path
  is impossible in v2.

## 17. Hard Cuts And Rejected Alternatives

Hard cuts:

- no global operation registry;
- no arbitrary custom operation acceptance;
- no custom operation mutation without apply/invert/map/dirty proof;
- no public `Editor` namespace growth;
- no React hook for operation validation;
- no command catalog in raw Slate.

Rejected alternatives:

- `Operation.isOperation(value)` accepts `{ type: string }`: too unsafe.
- `Operation.isOperation(value, editor)`: wrong owner and ugly DX.
- `Editor.isCustomOperation`: grows the namespace we are already cutting.
- storing app events in operation history: use tags/metadata.
- copying ProseMirror `Step` classes: wrong model for Slate's plain JSON API.

## 18. Maintainer Objection Ledger

| Objection                                      | Answer                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| "Users asked for custom operations, not tags." | If the data does not mutate the Slate document, tags are the correct primitive. Calling metadata an operation is the original bug. |
| "But ProseMirror supports custom steps."       | Yes, with registered apply/invert/map/JSON semantics. That proves arbitrary acceptance is wrong.                                   |
| "Specific guards are API bloat."               | True if added blindly. Only add built-in subtype guards if TypeScript proof shows real narrowing value.                            |
| "Why not just fix `isEditor`?"                 | v2 likely already did. The lane exists to lock that proof and decide whether any public custom-op API is actually warranted.       |
| "Will this help slate-yjs?"                    | It avoids unregistered operation pollution. Real custom collab ops need specs, not silent acceptance.                              |

## 19. Pass Schedule And State Ledger

| Pass                           | Status   | Evidence added                                                  | Plan delta                                               | Open issues                                          | Next owner |
| ------------------------------ | -------- | --------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ---------- |
| Current-state read             | complete | live v2 operation, editor detection, extension middleware files | selected operation validation lane                       | none                                                 | done       |
| ClawSweeper related issue pass | complete | gitcrawl doctor, threads, neighbors, search                     | `#5977` selected, `#5558` related                        | no live GitHub token, gitcrawl mirror current enough | done       |
| Issue ledger pass              | complete | coverage matrix and dossier read/update                         | `#5977` fixed and `#5558` improved after execution proof | none                                                 | done       |
| Research/ecosystem pass        | complete | Lexical, ProseMirror, Tiptap local source                       | reject arbitrary custom ops, steal registered semantics  | none                                                 | done       |
| Closure score                  | complete | score `0.93`                                                    | plan Ralph-ready                                         | none                                                 | Ralph      |

## 20. Plan Deltas From Review

- Changed `#5977` from "outside this lane" to "fixed after issue-shaped proof".
- Kept `Operation.isOperation` strict.
- Added a specific rule that metadata belongs in update tags, not custom ops.
- Added a possible editor-scoped operation spec path, gated behind tests.
- Added `#5558` as improved DX pressure after concrete built-in subtype guards
  landed with type proof.

## 21. Open Questions

None before execution.

Evidence that would change the plan:

- If current v2 package tests already prove the exact `#5977` path, Ralph should
  only add missing dossier/coverage/PR claim sync.
- If operation subtype guards require ugly overloads, skip them and document the
  reason.
- If a custom operation spec cannot be scoped per editor cleanly, reject it and
  use commit tags only.

## 22. Implementation Phases

### Phase 1: Red issue-shaped proof

Owner: Ralph + TDD.

Add tests before implementation:

- `Editor.isEditor` ignores operation log contents.
- pure `Operation.isOperation` rejects unknown custom op.
- `tx.operations.replay` rejects unknown custom op clearly.
- optional `slate-dom` smoke if current source still routes through editor
  detection on `findPath`.

### Phase 2: Minimal fix

If Phase 1 fails:

- remove any remaining editor validation dependency on operation list shape.
- add a clear invalid-operation error at replay/apply boundaries.

If Phase 1 already passes:

- classify `#5977` as already fixed in live source and add only missing proof.

### Phase 3: Operation guard DX

Add built-in subtype guard APIs only with typecheck coverage.

Target proof:

- no casts needed for `insert_node`, `remove_node`, `replace_children`, and
  `set_selection` branches in public tests.

### Phase 4: Optional editor-scoped custom operation specs

Only execute if Phase 1 proves current v2 lacks a legitimate custom operation
recognition path beyond tags.

Start metadata-only:

- editor-scoped registry;
- duplicate type guard;
- `state.operations.is(value)` proof.

Do not support custom document mutation in this phase.

### Phase 5: Ledger and PR sync

- `Fixes #5977` only after exact proof.
- `Improves #5558` only if subtype guards land.
- Update fork dossier, coverage matrix, PR description counts, and full
  architecture execution ledger.

## 23. Fast Driver Gates

Run from `Plate repo root`:

```bash
bun test ./packages/slate/test/interfaces-contract.ts ./packages/slate/test/generic-operation-contract.ts ./packages/slate/test/generic-extension-contract.ts
bun --filter slate typecheck
bun lint:fix
```

Add DOM proof only if implementation touches `slate-dom`:

```bash
bun test ./packages/slate-dom/test/bridge.ts
bun --filter slate-dom typecheck
```

## 24. Final User-Review Handoff Outline

Ralph should report:

- whether `#5977` was already fixed by current editor detection;
- whether code changed or tests only;
- whether `Operation.isOperation` stayed strict;
- whether any operation subtype guards landed;
- whether any custom operation registry was rejected or added;
- exact issue claims and commands run.

## 25. Final Completion Gates

The execution lane is complete only when:

- focused red proof exists or current already-green proof is explicit;
- package tests pass;
- typecheck passes;
- lint passes;
- issue coverage matrix is synced;
- fork issue dossier is synced;
- PR description counts/text are synced if any claim changes;
- `active goal state` points to the next real owner;
- completion file is `done`.

## 26. Ralph Execution Ledger

| Pass                  | Status   | Owner                                                                                  | Evidence                                                                                                                                                                                                | Next owner                             |
| --------------------- | -------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Ralph activation      | started  | `packages/slate`                                                         | `.tmp/completion-checks/slate-v2-operation-extensibility-validation-execution.md` created; `active goal state` refreshed for this lane.                                                                  | TDD red proof for `#5977`.             |
| TDD red proof         | complete | `packages/slate`; `packages/slate-dom`                     | Focused tests first failed on missing concrete guards and silent unknown replay, then passed after adding guards and fail-closed replay validation.                                                     | Verification closeout.                 |
| Verification closeout | complete | `packages/slate`; `packages/slate-dom`; `docs/slate-v2/**` | Focused package tests, transaction/collab metadata tests, `slate` and `slate-dom` typecheck, `bun lint:fix`, issue matrix, fork dossier, PR reference, changeset, and full execution ledger are synced. | Next `slate-ralplan` bucket selection. |
