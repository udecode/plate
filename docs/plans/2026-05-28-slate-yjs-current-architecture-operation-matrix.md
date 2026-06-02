# Slate Yjs Current Architecture Operation Matrix Plan

Date: 2026-05-28
Status: active
Owner skill: `.agents/skills/task/SKILL.md`
Supersedes:

- `docs/plans/2026-05-13-slate-v2-yjs-core-readiness-ralplan.md`
- `docs/plans/2026-05-13-yjs-collaboration-harvest.md`
- `docs/plans/2026-05-18-slate-yjs-package-readiness-ralplan.md`
- `docs/plans/2026-05-25-slate-yjs-structural-operation-coverage-ralplan.md`

## Verdict

The job is no longer "create `packages/slate-yjs` from empty residue." Current
`../slate-v2` already has a real first-party `@slate/yjs` package with source,
package metadata, a React subpath, an example route, package tests, and
Playwright tests.

The correct next move is a hard architecture reset inside that package:

- keep the public package shape: `createYjsExtension(...)`, `createYjsController(...)`, `state.yjs`, `tx.yjs`, `./core`, `./react`, `./internal`
- split the monolithic core into explicit document, operation, history,
  selection, awareness, and controller modules
- replace implicit full-document snapshot fallback with an explicit operation
  encoder registry
- require every supported user operation to cover local offline, concurrent
  remote, reconnect/recovery, and local undo/redo
- make unsupported operations throw or enter a named traceable fallback mode
  with test coverage; no silent root rewrites
- rebuild the example as a real collaboration simulator, not a two-peer demo
  with test-only assumptions

Strong call: do not keep growing `src/core/index.ts` as the package brain. It is
already doing document serialization, op encoding, remote import, history repair,
 selection binding, awareness, lifecycle, and React-facing state in one file.
That is how collaboration bugs hide.

## Live Source Facts

Read on 2026-05-28 from `../slate-v2`:

- `packages/slate-yjs/package.json`
- `packages/slate-yjs/src/core/index.ts`
- `packages/slate-yjs/src/index.ts`
- `packages/slate-yjs/src/internal/index.ts`
- `packages/slate-yjs/src/react/index.tsx`
- `packages/slate-yjs/test/core-contract.ts`
- `site/examples/ts/yjs-collaboration.tsx`
- `playwright/integration/examples/yjs-collaboration.test.ts`
- `packages/slate/src/interfaces/operation.ts`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate-history/src/history-extension.ts`
- `docs/editor-test-harvester/yjs-collaboration/{report,inventory,test-index}.md`
- `docs/solutions/developer-experience/2026-05-13-slate-v2-yjs-readiness-needs-core-contracts-before-package-work.md`
- `docs/solutions/test-failures/2026-03-22-yjs-slow-tests-need-explicit-bun-paths-and-bootstrapped-shared-types.md`

Current architecture:

- Package name is `@slate/yjs`, version `0.0.0`, with exports `.`, `./core`,
  `./internal`, and `./react`.
- Core API mounts through Slate v2 extension groups, not legacy wrappers.
- Remote imports use `REMOTE_IMPORT_OPTIONS` with collaboration tags, history
  skip, and selection focus/scroll suppression.
- Yjs document model stores Slate elements as `Y.XmlElement` and contiguous
  Slate text leaves as one `Y.XmlText` with `slate:text-leaves` metadata.
- Selection uses encoded `Y.RelativePosition` arrays.
- Undo uses `Y.UndoManager`, stack item metadata, and local Slate history
  bridging.
- `applySlateOperationsToYjs(...)` currently supports `insert_text`,
  `remove_text`, `set_node`, `set_selection`, `insert_node`, and
  `replace_children`.
- `remove_node`, `merge_node`, `move_node`, `split_node`, and
  `replace_fragment` are not explicitly handled in the current switch observed
  at `packages/slate-yjs/src/core/index.ts:1009-1087`.
- When operation encoding fails, `writeLocalSnapshot(...)` falls back to
  `writeSlateValueToYjsUnchecked(...)`, which calls `replaceYjsChildren(...)`
  and deletes/reinserts root children.
- The example source currently renders only peers A and B.
- The Playwright file contains broader scenario assertions, including peers C
  and D plus controls such as `mark-bold`, `split-node`, `insert-text`,
  `wrap-node`, `insert-fragment`, and `move`, that are not present in the
  current example source.

## Current Gaps

1. Operation coverage is incomplete and not guarded by type-level exhaustiveness.
2. Fallback behavior is silent and destructive for normal user edits.
3. The package does not expose trace data saying whether a commit was encoded
   incrementally, reconciled, or rejected.
4. Undo still relies on operation inversion metadata in places where the
   protocol requirement is user-intent undo through Yjs state.
5. Node identity is not a first-class design axis. Clone-and-hide may be an
   acceptable bounded fallback for first-stage `move_node`, but it cannot be
   advertised as stable moved-subtree identity.
6. Example and Playwright source have drifted apart.
7. The older harvest remains valuable, but it does not define current package
   architecture.

## Protocol Rules

- User-edit operations must never silently rewrite the whole Yjs root.
- Unsupported operation kinds must throw in tests/dev or use a named fallback
  mode that increments trace counters and is asserted in tests.
- Undo must remove only the local user's intent and preserve concurrent remote
  edits.
- Remote imports must skip local history unless explicitly marked otherwise.
- Structural encoders should preserve existing `Y.XmlText` and `Y.XmlElement`
  instances whenever possible.
- `move_node` cannot claim stable moved-subtree CRDT semantics until it preserves
  the existing Yjs node identity through the move or introduces a tested
  identity/proxy design.
- Public API should stay small. The implementation can be deep; the user-facing
  surface should not sprawl.

## Target Internal Layout

Keep public exports stable, but split internals:

| File                                        | Owns                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `packages/slate-yjs/src/core/index.ts`      | public core exports only                                  |
| `packages/slate-yjs/src/core/controller.ts` | extension lifecycle, connect/pause/resume/disconnect      |
| `packages/slate-yjs/src/core/document.ts`   | Slate value <-> Yjs document serialization                |
| `packages/slate-yjs/src/core/operations.ts` | operation encoder registry and traceable fallback policy  |
| `packages/slate-yjs/src/core/history.ts`    | Yjs UndoManager bridge and Slate history repair           |
| `packages/slate-yjs/src/core/selection.ts`  | Slate range <-> Y.RelativePosition mapping                |
| `packages/slate-yjs/src/core/awareness.ts`  | awareness state and remote cursor projection              |
| `packages/slate-yjs/src/core/testing.ts`    | package-local test helpers if repeated fixtures get noisy |

Do this split as execution work only when it directly helps the operation matrix.
No ornamental refactor.

## Operation Matrix

Every row must get four tests:

- `local-offline`: operation applies while the peer is disconnected
- `concurrent-remote`: another peer edits related or adjacent content
- `reconnect-recovery`: peers exchange real `Y.encodeStateAsUpdate` /
  `Y.applyUpdate` updates and converge
- `local-undo-redo`: local undo/redo removes only local intent and preserves
  remote edits

| Surface                            | Current state                                        | Required encoder / classification                                                                     | Required tests                       |
| ---------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `insert_text`                      | encoded incrementally                                | keep bounded `Y.XmlText.insert`; add unicode/marks rows                                               | 4 scenarios                          |
| `remove_text`                      | encoded incrementally                                | keep bounded `Y.XmlText.delete`; prove deleted text with concurrent inserts                           | 4 scenarios                          |
| `insert_node`                      | encoded incrementally                                | preserve parent/window insert; prove nested element and text-leaf cases                               | 4 scenarios                          |
| `remove_node`                      | missing from switch                                  | hide target Yjs child or remove one text leaf without root rewrite                                    | 4 scenarios                          |
| `split_node`                       | verify current live support before trusting old plan | split text metadata or element children without root rewrite                                          | 4 scenarios                          |
| `merge_node`                       | missing from switch                                  | merge into surviving previous sibling and hide absorbed node                                          | 4 scenarios                          |
| `move_node`                        | missing from switch                                  | P1 clone+hide only for outside-subtree convergence; P2 stable identity design for moved-subtree edits | 4 scenarios plus explicit limitation |
| `set_node`                         | encoded incrementally                                | cover element props, text marks, and unset-as-set semantics                                           | 4 scenarios                          |
| `unset_node` public transform      | no operation kind; maps through `set_node`           | characterize emitted operations, then cover as `set_node` clearing props                              | 4 transform scenarios                |
| `replace_children`                 | encoded incrementally                                | keep child-window replacement and hidden old containers                                               | 4 scenarios                          |
| `replace_fragment`                 | missing from switch                                  | encode as scoped child-window replacement under `operation.path`                                      | 4 scenarios                          |
| `insert_fragment` public transform | emits operation batches, not a standalone op         | characterize exact emitted ops, then cover resulting `replace_fragment`/`replace_children`/text ops   | 4 transform scenarios                |
| `delete_fragment` public command   | command surface, not current `Operation` union       | characterize emitted ops from browser/user path; no invented op kind                                  | 4 transform scenarios                |
| `wrapNodes` / `tx.nodes.wrap`      | composed transform                                   | characterize emitted op sequence and require no silent snapshot                                       | 4 transform scenarios                |
| `unwrapNodes` / `tx.nodes.unwrap`  | composed transform                                   | characterize emitted op sequence and require no silent snapshot                                       | 4 transform scenarios                |
| `liftNodes` / `tx.nodes.lift`      | composed transform                                   | characterize emitted op sequence and require no silent snapshot                                       | 4 transform scenarios                |

Completion rule: the matrix is not complete until every row has all four
scenario lanes or an explicit unsupported decision with a failing-safe behavior.

## Test Harness

Add a package-local collaboration harness in `packages/slate-yjs/test/`:

- creates three or four Slate editors backed by separate `Y.Doc` instances
- seeds docs from the same encoded Yjs update
- can disconnect a peer without destroying its local doc
- exchanges updates by `Y.encodeStateAsUpdate` / `Y.applyUpdate`
- records trace output from the operation encoder path
- exposes helpers for local operation replay, public transform execution, undo,
  redo, reconnect, and convergence assertions

Do not compare only local Slate values. The proof must go through real Yjs
updates.

## Implementation Phases

1. Add operation encoder trace and exhaustiveness guard.
   - Type guard: every `Operation['type']` is either `supported`,
     `unsupported`, or `snapshot-only-explicit`.
   - Test guard: supported user operations cannot hit whole-root snapshot.
2. Build the package harness and first red test for `remove_node`.
   - Start with outside-concurrent-edit preservation.
3. Red/green `merge_node`.
4. Red/green `replace_fragment`.
5. Re-check and complete `split_node` against live source.
6. Red/green `move_node` P1.
   - Claim only outside-subtree convergence.
   - Add a skipped or failing-design note for moved-subtree stable identity.
7. Backfill `insert_text`, `remove_text`, `insert_node`, `set_node`,
   `replace_children` into the four-scenario matrix.
8. Characterize public transform entrypoints:
   - `unsetNodes`
   - `insertFragment`
   - `deleteFragment`
   - `wrapNodes`
   - `unwrapNodes`
   - `liftNodes`
9. Rebuild the example as a control-panel simulator.
10. Add Playwright rows for selection, undo, reconnect, and operation controls.
11. Add docs and changeset.
12. Run final package and browser gates.

## Example Requirements

File: `../slate-v2/site/examples/ts/yjs-collaboration.tsx`

The example must become a simulator with:

- four peers, not two
- per-peer connect, disconnect, pause, resume, reconcile
- per-peer undo/redo with visible enabled state
- per-peer operation controls for the matrix rows
- selection controls: collapsed caret, word range, paragraph range, whole doc
- concurrent scenario runner that can queue local/remote operations while a peer
  is offline
- live outputs for connection state, export/import counts, trace mode,
  selection JSON, remote cursor rows, and document JSON
- no hidden test-only controls that bypass real editor commands

Browser tests should use real user editing paths when a browser path exists:
typing, Backspace, Enter, selection delete, paste/insert fragment, and toolbar
buttons that call the public editor transforms.

## Playwright Requirements

File: `../slate-v2/playwright/integration/examples/yjs-collaboration.test.ts`

Required groups:

1. Selection/presence:
   - remote cursor survives text insert
   - disconnected peer cursor disappears
   - reconnect restores valid relative positions
2. Operation matrix smoke:
   - one browser row per public transform family
   - no fake controls that mutate private state
3. Undo protocol:
   - offline local operation
   - concurrent remote edit
   - reconnect
   - undo and redo
   - assert remote edit survives
4. Failure policy:
   - unsupported operation path shows explicit trace or throws in test/dev
   - no root-snapshot trace for supported user operations

Use `/examples/yjs-collaboration` unless a standalone block route is added.

## Verification Gates

From `../slate-v2`:

```sh
bun test ./packages/slate-yjs/test/core-contract.ts
bun --filter @slate/yjs build
bun --filter @slate/yjs typecheck
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium
bun lint:fix
```

If package exports or file layout changes, run the repo barrel/update command
required by the current `../slate-v2` package tooling.

Release artifact: this changes a published package under `packages/`, so a
changeset is required before completion.

## Open Design Decision

`move_node` has two possible definitions:

1. P1 bounded support: clone the moved Yjs subtree to the destination and hide
   the old subtree. This avoids root snapshots and preserves concurrent edits
   outside the moved subtree.
2. P2 stable identity: preserve the actual Yjs node identity across the move or
   introduce a stable logical identity layer that keeps remote inserts, marks,
   selections, history, and presence attached.

P1 is enough to close the current destructive fallback bug class. P2 is required
before claiming full moved-subtree collaboration correctness. Do not blur those.

## Next Slice

Start with implementation Phase 1 and Phase 2:

- add the operation coverage/trace guard
- write the first red `remove_node` four-scenario package test
- prove the current code fails because it hits the silent root snapshot fallback

Do not implement the whole matrix in one shot. That would create beautiful
garbage.
