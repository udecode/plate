# Plite Yjs From-Scratch Operation Matrix Plan

Date: 2026-05-29
Status: complete
Owner skills: `.agents/skills/task/SKILL.md`, `.agents/skills/slate-ralplan/SKILL.md`
Completion: `.tmp/019e71a2-c1fd-7bf3-83ff-732f806062ee/completion-check.md`

Supersedes for current execution:

- `docs/plans/2026-05-13-plite-yjs-core-readiness-ralplan.md`
- `docs/plans/2026-05-13-yjs-collaboration-harvest.md`
- `docs/plans/2026-05-18-slate-yjs-package-readiness-ralplan.md`
- `docs/plans/2026-05-28-slate-yjs-current-architecture-operation-matrix.md`

## Current Verdict

Build a new first-party `@slate/yjs` source package from scratch in
`../plite/packages/plite-yjs`.

The current live tree has only package residue:

- `packages/plite-yjs/dist/**`
- `packages/plite-yjs/node_modules/**`
- `packages/plite-yjs/.turbo/**`
- no `packages/plite-yjs/package.json`
- no `packages/plite-yjs/src/**`
- no `packages/plite-yjs/test/**`
- no `site/examples/ts/yjs-collaboration.tsx`

The previous staged docs and Playwright file in `../plite` are source
material, not implementation truth. Keep their behavioral specs, especially
undo/reconnect/selection rows, but do not carry over missing or residue package
code.

Strong call: do not resurrect the old monolithic package from `dist`. Dist is
not source. Rebuild cleanly around current Plite extension APIs.

## Intent And Boundary

Intent: ship a first-party Yjs binding that makes collaboration correctness a
protocol contract, not a demo accident.

Desired outcome:

- source package `@slate/yjs` exists under `packages/plite-yjs`
- public API is small and current-Plite-native
- all Plite operations and named transform families are classified in an
  operation matrix
- every supported operation has local-offline, concurrent-remote,
  reconnect/recovery, and local undo/redo proof
- unsupported behavior fails explicitly or enters a named traceable fallback
- undo only reverts local user intent while preserving concurrent remote edits
- structural encoders preserve existing `Y.XmlText` and `Y.XmlElement`
  identities whenever possible
- example is a four-peer collaboration simulator with real controls
- Playwright covers selection and undo/reconnect regressions

In scope:

- `../plite/packages/plite-yjs/**`
- `../plite/site/examples/ts/yjs-collaboration.tsx`
- `../plite/site/constants/examples.ts`
- `../plite/playwright/integration/examples/yjs-collaboration.test.ts`
- changeset and package wiring needed for the new package
- docs/solutions and plan sync when implementation discovers reusable behavior

Non-goals:

- no Plate product API in raw Plite
- no provider hosting, auth, comments, suggestions, or permission policy
- no compatibility promise for external `@slate-yjs/*` wrappers
- no Yjs objects in serialized Plite values
- no fixed issue claim for `#5771` until package/browser proof passes
- no stable moved-subtree collaboration claim for `move_node` until node
  identity is preserved or a logical identity layer is proven

Decision boundaries:

- raw Plite owns document values, operations, transactions, history, refs,
  runtime ids, and React/browser runtime contracts
- `@slate/yjs` owns Yjs schema, binding lifecycle, operation encoding, remote
  import, history/UndoManager bridge, selection/relative-position mapping,
  awareness, trace policy, and example controls
- Plate owns product collaboration UI

## Current Source Evidence

Live `../plite` facts read this activation:

| Surface | Evidence | Decision |
| --- | --- | --- |
| package residue | `find packages/plite-yjs -maxdepth 4 -print` lists only `dist`, `node_modules`, `.turbo` | hard-cut and recreate source |
| operation union | `packages/plite/src/interfaces/operation.ts` includes `insert_text`, `remove_text`, `insert_node`, `remove_node`, `split_node`, `merge_node`, `move_node`, `set_node`, `set_selection`, `replace_fragment`, `replace_children` | operation registry must be exhaustive |
| extension API | `packages/plite/src/core/editor-extension.ts` rejects `register`, `commands`, `methods`, `operationMiddlewares`, `commitListeners`; supports `setup` and `onCommit` | public API must be extension/state/tx based |
| core collab proof | `packages/plite/test/collab-adapter-extension-contract.ts` proves commit export, remote import, pause, skip-collab, cleanup without monkey-patches | package binding follows this shape |
| selection stress | `packages/plite/test/collab-selection-stress-contract.ts` proves high-QPS remote selection rebasing and remote-history skip | port these scenarios into package/browser proof |
| bookmarks | `packages/plite/test/collab-bookmark-position-contract.ts` proves split, merge, move, remove, replace_children bookmark rebasing | Y relative positions must match this semantics |
| canonical reconcile | `packages/plite/test/collab-canonical-reconcile-contract.ts` proves remote full replace can skip local history and side effects | allowed only as explicit traceable fallback/reconcile mode |
| example registry | `site/constants/examples.ts` has no `yjs-collaboration` entry | add route registration |
| staged previous specs | staged `playwright/integration/examples/yjs-collaboration.test.ts` covers four peers, selection, offline reconnect, undo/redo, split/merge/remove/move/wrap/fragment rows | preserve as browser acceptance source |

Staged `../plite` source material inspected:

- `docs/plans/2026-05-25-yjs-demo-four-editors-marks.md`
- `docs/plans/2026-05-25-yjs-offline-mixed-edits-reconnect.md`
- `docs/plans/2026-05-26-yjs-history-split-fixes.md`
- `docs/plans/2026-05-26-yjs-offline-mark-stale-undo.md`
- `docs/plans/2026-05-26-yjs-offline-merge-undo-noop.md`
- `docs/plans/2026-05-26-yjs-offline-move-undo-redo.md`
- `docs/plans/2026-05-27-yjs-collaboration-soak.md`
- `docs/plans/2026-05-27-yjs-merge-node-canonical-late-peer.md`
- `docs/plans/2026-05-28-yjs-command-matrix-controls.md`
- `docs/plans/2026-05-28-yjs-potion-parity-regressions.md`
- `docs/plans/2026-05-28-yjs-public-split-api.md`
- `docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md`
- `docs/solutions/logic-errors/yjs-forward-move-history-fallback-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-offline-split-reconnect-merge-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-offline-merge-stale-undo-2026-05-26.md`
- `docs/solutions/ui-bugs/slate-react-structural-text-dom-sync-2026-05-28.md`
- `playwright/integration/examples/yjs-collaboration.test.ts`

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| external `plite-yjs` | `../slate-yjs/packages/core/src/plugins/withYjs.ts`, `withYHistory.ts`, `applyToYjs/*` | editor wrapper stores local origins, observes Y events, maps Plite ops to Y edits, stores relative selections in UndoManager metadata | pure snapshot sync for every edit | operation mappers, relative-position conversion, origin discipline, Y.UndoManager metadata | mutating `editor.children`, overriding `apply`/`onChange`, wrapper-first public API | extension-owned controller and operation registry | partial |
| Lexical Yjs | `../lexical/packages/lexical-yjs/src/Bindings.ts`, `SyncV2.ts` | binding object owns Y doc, node mapping, default property filtering, cursor state, and XmlElement/XmlText mapping | editor core depending on Yjs classes | binding/controller object, default-property exclusion, in-place mapping, cursor state outside doc model | Lexical class-node/node-key coupling | internal `YjsController` with maps hidden behind `state.yjs`/`tx.yjs` | partial |
| y-prosemirror | `../y-prosemirror/src/sync-plugin.js`, `undo-plugin.js` | plugin state binds Y type, uses transaction metadata, stores undo selection through relative bookmarks, reconfigures/pause via plugin state | local undo deleting remote edits, stale selection after remote import | relative-selection undo restore, pause/reconfigure lifecycle, transaction metadata discipline | ProseMirror plugin surface and schema fitting as raw Plite API | `tx.yjs.pause/resume/reconcile`, UndoManager bridge, remote imports with history skip | agree |
| current Plite | `packages/plite/test/collab-*.ts`, `editor-extension.ts` | extension setup/onCommit, transaction replay, skip-history metadata, bookmarks, runtime ids, canonical replace | adapter monkey-patches and remote side effects | state/tx namespaces, commit export, remote import through `editor.update` | adding Yjs to raw `slate` core | first-party package on current extension substrate | agree |

## Accepted Public API Target

Keep the first public surface deliberately small:

```ts
import { createEditor } from 'slate'
import { history } from 'plite-history'
import { createYjsExtension } from '@slate/yjs'

const editor = createEditor({
  extensions: [
    history(),
    createYjsExtension({
      awareness,
      doc,
      rootName: 'slate',
      clientId: 'peer-a',
    }),
  ],
})

editor.tx.yjs.connect()
editor.tx.yjs.disconnect()
editor.tx.yjs.pause()
editor.tx.yjs.resume()
editor.tx.yjs.reconcile()
editor.tx.yjs.undo()
editor.tx.yjs.redo()

editor.read((state) => state.yjs.connected())
```

Exports:

- `@slate/yjs`
- `@slate/yjs/core`
- `@slate/yjs/react`
- `@slate/yjs/internal` only for package-local tests and explicitly unstable
  test helpers

Hard cuts:

- no `withYjs(editor)`
- no public `editor.apply`/`editor.onChange` patching
- no direct `editor.children = ...`
- no hidden provider abstraction

## Internal Runtime Target

Target file layout:

| File | Owns |
| --- | --- |
| `src/index.ts` | root public exports |
| `src/core/index.ts` | stable core exports |
| `src/core/extension.ts` | `createYjsExtension` and state/tx namespace registration |
| `src/core/controller.ts` | lifecycle, local export, remote import, transaction/origin discipline |
| `src/core/document.ts` | Plite value <-> Yjs document model |
| `src/core/operations.ts` | operation encoder registry, exhaustiveness, trace policy |
| `src/core/history.ts` | UndoManager bridge, local-intent undo/redo, history repair |
| `src/core/selection.ts` | Plite point/range <-> Y.RelativePosition |
| `src/core/awareness.ts` | awareness payloads and remote cursor projection |
| `src/core/testing.ts` | package-local harness only |
| `src/react/index.tsx` | external-store cursor hooks and optional render helpers |
| `src/internal/index.ts` | unstable test/debug exports |

The controller is the package brain. `index.ts` must stay thin.

## Operation Matrix

Every row needs four scenario lanes:

- local offline operation
- concurrent remote operation
- reconnect / recovery through real `Y.encodeStateAsUpdate` /
  `Y.applyUpdate`
- local undo / redo through Yjs local intent semantics

| Surface | Decision | Identity rule | Fallback rule | Required proof |
| --- | --- | --- | --- | --- |
| `insert_text` | support | mutate existing `Y.XmlText` | no snapshot | 4 lanes plus unicode/mark metadata |
| `remove_text` | support | mutate existing `Y.XmlText` | no snapshot | 4 lanes plus concurrent same-offset inserts |
| `insert_node` | support | insert new `Y.XmlElement`/`Y.XmlText` at parent slot | no root snapshot | 4 lanes nested and top-level |
| `remove_node` | support | hide/remove one target node, preserve siblings | no root snapshot | first red test slice |
| `split_node` | support | keep original left shared type, create right sibling | no root snapshot | public `tx.nodes.split({ at: Point })` and keyboard Enter |
| `merge_node` | support | preserve survivor shared type; absorbed children stay live through virtual merge refs | no root snapshot; trace virtual merge as `virtual-merge-ref` | keyboard Backspace, tx merge, and cross-block delete |
| `move_node` | P1 support, P2 gated | P1 clone+hide only for outside-subtree convergence; P2 requires stable moved identity | explicit `trace.mode: "clone-hide-move"` until P2 | 4 lanes plus documented limitation |
| `set_node` | support | set attributes/leaf metadata in place | no snapshot | element props, text marks |
| `unset_node` | transform characterization | lower to `set_node` clearing props | no snapshot | exact emitted op sequence then 4 lanes |
| `replace_children` | support | scoped child-window edit; preserve unaffected children | explicit reconcile only for dev/test trace | 4 lanes |
| `replace_fragment` | support | scoped fragment replace under operation path | no root snapshot | 4 lanes |
| `insert_fragment` | transform characterization | lower to existing operation rows | no hidden private mutation | exact emitted op sequence then 4 lanes |
| `delete_fragment` | transform/browser characterization | lower to existing operation rows; preserve absorbed end-block text identity through virtual merge refs | no hidden private mutation | browser selection delete plus op sequence |
| `wrapNodes` / `tx.nodes.wrap` | support through op sequence | preserve original child identity through virtual wrapper/source ref | no clone-only if concurrent inner edits matter | 4 lanes |
| `unwrapNodes` / `tx.nodes.unwrap` | support through op sequence | restore original child identity | no root snapshot | 4 lanes |
| `liftNodes` / `tx.nodes.lift` | support through op sequence | move scoped child without root rewrite | named clone-hide trace if needed | 4 lanes |

Completion rule: no matrix row can be silent. It is either supported, explicitly
unsupported with thrown error, or traceable fallback with tests.

## Undo Protocol

Undo is protocol, not polish.

Rules:

- local undo/redo must route through `Y.UndoManager` tracked origins
- remote imports must not enter Plite local history
- undo stack metadata stores relative selection before/after where possible
- undo must revert the local user's semantic intent, not replay inverse stale
  Plite operations against a changed document
- after reconnect, if local Plite history and Yjs truth disagree, canonical
  Yjs truth wins and the local editor is repaired
- no coarse document snapshot restore as undo implementation

Use staged solution notes as acceptance cases:

- offline split plus concurrent text replacement
- offline Backspace merge plus concurrent insert, then keyboard Undo
- offline move reconnect, keyboard Undo, keyboard Redo
- offline wrap / insert fragment preserving concurrent text in the edited
  subtree

## Example Simulator Target

File: `../plite/site/examples/ts/yjs-collaboration.tsx`

Requirements:

- four peers: A, B, C, D
- deterministic Yjs `clientID` / displayed peer id mapping for tests
- per-peer connect, disconnect, pause, resume, reconcile
- per-peer undo/redo with visible enabled state
- operation controls for every matrix family
- selection controls: caret, word range, paragraph range, whole doc
- concurrent scenario runners that queue offline edits then reconnect
- visible debug rows: connected state, doc client id, export/import counts,
  trace counters, selection JSON, remote cursor rows, document JSON
- controls use public Plite transaction APIs or browser editing paths, not
  private model mutation

The staged Playwright file expects `data-test-id` attributes such as:

- `yjs-peer-a-mark-bold`
- `yjs-peer-a-select`
- `yjs-peer-a-disconnect`
- `yjs-peer-a-connect`
- `yjs-peer-a-split-node`
- `yjs-peer-a-wrap-node`
- `yjs-peer-a-insert-fragment`
- `yjs-peer-a-move`

## Test Harness Target

Add package-local tests under `../plite/packages/plite-yjs/test/`.

Harness responsibilities:

- create three or four peers backed by separate `Y.Doc` instances
- seed peers from one Yjs update
- disconnect a peer without destroying its local doc
- exchange updates only with `Y.encodeStateAsUpdate` / `Y.applyUpdate`
- capture operation trace entries
- expose helpers for local Plite transactions, public transforms, undo, redo,
  reconnect, convergence, and identity assertions
- compare both Plite values and Yjs shared types

Do not test by comparing only local Plite values. That is how broken snapshot
fallback looked correct.

## Implementation Phases

1. Hard-cut package residue and scaffold `@slate/yjs`.
   - Add `package.json`, tsconfig, tsdown config, source entries, test folder.
   - Add `yjs` dependency.
   - Add changeset.
2. Add extension/controller skeleton.
   - `createYjsExtension`, `state.yjs`, `tx.yjs`.
   - Connect/disconnect/pause/resume/reconcile lifecycle.
3. Add document serialization.
   - `Y.XmlElement` for elements.
   - Contiguous Plite text leaves in `Y.XmlText` with leaf metadata.
   - No Yjs types in Plite values.
4. Add operation trace and exhaustive registry.
   - Test unsupported operations throw.
   - Test supported operations cannot hit root snapshot.
5. First red/green operation slice: `remove_node`.
   - four scenario lanes.
   - prove no root rewrite and sibling identity preserved.
6. Complete structural rows in this order:
   - `split_node`
   - `merge_node`
   - `insert_fragment`
   - `wrapNodes`
   - `unwrapNodes`
   - `move_node` P1
7. Backfill existing simple rows:
   - `insert_text`
   - `remove_text`
   - `insert_node`
   - `set_node` / `unset_node`
   - `replace_children`
8. Add UndoManager bridge and history repair.
   - prove local intent undo with concurrent remote edits.
9. Add awareness/selection conversion and React hooks.
   - external-store style, no document commits for cursor movement.
10. Build example simulator and register route.
11. Port staged Playwright specs and add missing selection rows.
12. Run gates and sync issue/reference docs conservatively.

Do not implement the whole matrix in one huge diff. Start with scaffold,
trace/exhaustiveness, and `remove_node` four-lane proof.

## Issue Accounting

Current issue posture:

| Issue | Claim | Why | Proof needed |
| --- | --- | --- | --- |
| `#5771` | Improves only | core selection stress exists; real `@slate/yjs` adapter/browser proof missing | package + Playwright selection rows before `Fixes` |
| `#3715` | Related | package/example work answers collaboration example pressure but exact docs/examples closure must wait for final docs | example route + docs |
| `#3741` | Related | `move_node` moved-node payload/identity pressure remains real | stable moved-subtree identity design before stronger claim |
| `#4178` | Related | adapter origins and commit metadata help source tracking, but operations still do not expose public source fields | no fixed claim in this package |
| `#5533` | Related | Yjs package does not provide non-Yjs collaboration protocol | no fixed claim |

No new fixed issue claim in this activation.

## Implementation-Skill Review Matrix

| Lens | Status | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | applied by rule | React cursor hooks must be external-store projection, not document state | keep awareness outside commits |
| `performance-oracle` | applied by rule | operation encoding is a hot path; root snapshots create O(document) damage | trace and block silent root fallback |
| `tdd` | applied | first implementation slice starts with failing `remove_node` four-lane package test | no broad horizontal test dump |
| `testing` | applied | package tests must assert public behavior and Yjs updates, not private state | package harness through public APIs |
| `browser-use` | queued | example/browser surface requires Browser Use proof after implementation | final closure cannot skip browser |

## High-Risk Pre-Mortem

1. Silent fallback deletes live Yjs nodes and loses remote edits.
   - Guard: trace registry, throw unsupported operations, no supported row can
     root-snapshot.
2. Undo passes convergence but deletes remote intent.
   - Guard: every operation row includes local undo/redo after concurrent
     remote edit.
3. Example controls bypass real editor APIs and give fake browser confidence.
   - Guard: controls must call public Plite transforms or real browser paths.
4. `move_node` overclaims.
   - Guard: current P1 is a narrow virtual wrapper move only; broader moved-subtree identity remains separate.

## Fast Driver Gates

Run from `cwd=/Users/felixfeng/Desktop/repos/plite`:

```sh
bun test ./packages/plite-yjs/test
bun --filter @slate/yjs build
bun --filter @slate/yjs typecheck
bun typecheck:root
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium
bun lint:fix
bun check
```

During iteration, use focused package tests first. Browser proof is mandatory
once the example exists.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read | complete | live `../plite` package residue, staged docs/Playwright specs, external source reads, core collab tests | plan reset to from-scratch package; May 28 "current source exists" claim marked stale for this checkout | none | implementation |
| related issue discovery | reused | existing ledgers classify `#5771`, `#3715`, `#3741`, `#4178`, `#5533` | no new fixed claim | update after proof | implementation |
| implementation slice 1 | complete | `bun test ./packages/plite-yjs/test/remove-node-contract.spec.ts` -> 4 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | scaffolded `@slate/yjs`, added extension/controller/document/operation source, added `remove_node` four-scenario test, added changeset | remaining operation matrix rows | task/implementation |
| implementation slice 2 | complete | `bun test ./packages/plite-yjs/test` -> 8 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added `split_node` operation encoder, made package tests Bun-discoverable, added four-lane public split package proof at the split boundary, preserved left `Y.XmlText` identity, no root snapshot trace | staged append-style split undo parity still open (`alphabeta!` concurrent append undo must converge to `alph!abeta`) | task/implementation |
| implementation slice 3 | complete | `bun test ./packages/plite-yjs/test` -> 9 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added append-style split undo regression and semantic split undo/redo bridge backed by Yjs UndoManager stack metadata; no stale inverse Plite replay and no coarse snapshot restore | non-text split undo shapes still throw explicitly; merge history repair next | task/implementation |
| implementation slice 4 | complete | `bun test ./packages/plite-yjs/test` -> 14 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added `merge_node` operation encoder for public block merges, four-lane merge package proof, and raw text merge traceable fallback to avoid unsafe same-offset Yjs reordering | text merge fallback is explicit, not a full support claim; replace_fragment next | task/implementation |
| implementation slice 5 | complete | `bun test ./packages/plite-yjs/test` -> 19 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added `replace_fragment` package proof for single-text diff, concurrent remote append, reconnect, undo/redo, plus traceable broad replacement fallback | broad replace fallback is explicit; insert_fragment next | task/implementation |
| implementation slice 6 | complete | `bun test ./packages/plite-yjs/test` -> 24 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added public `insert_fragment` operation-sequence characterization and four-lane parity proof through Plite's emitted `insert_node` + text `merge_node` fallback path; started shared test harness extraction | composed wrap/unwrap/lift rows remain | task/implementation |
| implementation slice 7 | complete | `bun test ./packages/plite-yjs/test` -> 29 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass | added public `wrapNodes` operation-sequence characterization and four-lane proof; introduced hidden source nodes plus virtual wrapper refs so wrapped paths read through the original `Y.XmlElement` and concurrent remote text survives reconnect/undo/redo; refreshed `../plite/docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md` with current attribute names and trace policy | virtual move is intentionally narrow to wrapper first-child moves; unwrap/lift rows remain | task/implementation |
| implementation slice 8 | complete | `bun test ./packages/plite-yjs/test` -> 34 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass | added public `unwrapNodes` operation-sequence characterization and four-lane proof from a virtual-wrapped starting state; restored the hidden source node, deleted the hidden wrapper shell, and kept concurrent remote text through reconnect/undo/redo; refreshed `../plite/docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md` with unwrap trace policy | broader `move_node` P1 and `liftNodes` rows remain | task/implementation |
| implementation slice 9 | complete | `bun test ./packages/plite-yjs/test` -> 39 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass | added public `move_node` characterization, same-parent move four-lane proof, cross-parent local identity proof, and virtual move placeholders that preserve the original `Y.XmlElement`; refreshed `../plite/docs/solutions/logic-errors/yjs-forward-move-history-fallback-2026-05-26.md` away from clone+hide index guidance | cross-parent move full lanes next; `liftNodes` row remains | task/implementation |
| implementation slice 10 | complete | `bun test ./packages/plite-yjs/test` -> 41 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | completed cross-parent `move_node` concurrent remote, reconnect, and undo/redo lanes on the same virtual placeholder path | `liftNodes` row remains | task/implementation |
| implementation slice 11 | complete | `bun test ./packages/plite-yjs/test` -> 46 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass | added first-child `liftNodes` operation-sequence characterization and four-lane proof on the generic `virtual-move-placeholder` path | only-child and middle/last lift shapes still need explicit coverage | task/implementation |
| implementation slice 12 | complete | `bun test ./packages/plite-yjs/test` -> 54 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass | added only-child, last-child, and middle-child `liftNodes` characterization/proof; parent-shell removal with hidden moved descendants now uses `virtual-move-parent-remove` instead of deleting the hidden source | simple op backfill remains | task/implementation |
| implementation slice 13 | complete | `bun test ./packages/plite-yjs/test` -> 70 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass, then no-op pass | backfilled `insert_text`, `remove_text`, `insert_node`, `set_node` / `unset_node`, and `replace_children`; added text-mark `set_node` delta formatting and plain-text Yjs delta reads so formatted text does not import XML markup | selection/awareness APIs and browser simulator remain | task/implementation |
| implementation slice 14 | complete | `bun test ./packages/plite-yjs/test` -> 76 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one formatting pass, then no-op pass | added public Plite point/range to Yjs relative-position conversion, visible-path resolution through virtual moved nodes, text-insert rebasing proof, moved-node selection proof, and removed-node null resolution | awareness APIs, React hooks, and browser simulator remain | task/implementation |
| implementation slice 15 | complete | `bun install --lockfile-only`; `bun test ./packages/plite-yjs/test` -> 85 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass after one style fix pass, then no-op pass after docs capture | added awareness payload helpers, `state.yjs.remoteCursor(s)` / `awarenessRevision` / `subscribeAwareness`, `tx.yjs.sendSelection` / `sendCursorData` / `clearSelection`, local-selection auto-publish, fake-awareness package harness, `@slate/yjs/react` external-store hooks, remote-wrap selection sanitization, and refreshed `docs/solutions/developer-experience/yjs-awareness-react-hooks-2026-05-29.md` plus `docs/solutions/ui-bugs/slate-react-structural-text-dom-sync-2026-05-28.md` | broader package hardening remains | task/implementation |
| implementation slice 16 | complete | red: `bun test ./packages/plite-yjs/test/delete-fragment-contract.spec.ts` exposed absorbed end-block text loss; green: `bun test ./packages/plite-yjs/test` -> 90 pass; `bun --filter @slate/yjs typecheck` -> pass; `bun typecheck:site` -> pass; `bun --filter @slate/yjs build` -> pass; `bun lint:fix` -> pass; `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun test:integration-local --project=chromium --grep yjs-collaboration` -> 29 pass | added `delete_fragment` package contract, cross-block public deleteFragment browser row, `virtual-merge-ref` element merge encoding, visible-child merge resolution, changeset note, and refreshed `docs/solutions/logic-errors/yjs-backspace-merge-normalization-reconnect-2026-05-25.md` | full repo `check` still not claimed | task/implementation |
| implementation slice 17 | complete | `bun test ./packages/plite-yjs/test/lift-nodes-contract.spec.ts` -> 19 pass; `bun test ./packages/plite-yjs/test` -> 96 pass; `bun --filter @slate/yjs typecheck` -> pass through `bun check`; `bun lint:fix` -> pass | closed the remaining explicit `liftNodes` shape gaps: only-child, last-child, and middle-child lifts now each have local-offline, concurrent remote, reconnect/recovery, and undo/redo coverage; only-child recovery now has its own real Yjs update row | none | closure |
| build-fix pass | complete | focused slate-react Vitest contracts -> 39 pass; `bun install --lockfile-only`; `bun --filter plite-react typecheck`; `bun typecheck:site`; `bun --filter @slate/yjs typecheck`; `bun check` -> pass | repaired stale slate-react static inventories, aligned sibling peer floors to the live `0.124.1` packages, and changed the pagination stress control from whole-root `tx.value.replace()` to scoped remove/insert node transforms | none | closure |
| browser proof | complete | `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun test:integration-local --project=chromium --grep yjs-collaboration` -> 29 pass; `curl -I http://localhost:3100/examples/yjs-collaboration` -> 200 | verified the four-peer simulator route, split button DOM remount path, operation controls, selection rows, cross-block deleteFragment reconnect/undo row, reconnect rows, undo/redo rows, move undo/redo rows, awareness selection, and expanded browser selection deletion | none | task/browser-use |
| closure gates | complete | `bun install --lockfile-only`; `bun lint:fix`; `bun --filter plite-react typecheck`; `bun --filter @slate/yjs typecheck`; `bun typecheck:site`; `bun --filter @slate/yjs build`; `bun test ./packages/plite-yjs/test` -> 96 pass; `bun check` -> pass; focused Playwright -> 29 pass | first-party `@slate/yjs` package, operation matrix tests, simulator, Playwright coverage, package metadata, changeset, and reusable solution notes are all current | no fixed upstream issue claim made | done |

## Current Score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React/runtime performance | 0.86 | awareness external-store target, no doc commits for cursors, source-backed `selection-side-effect-policy` requirement |
| Plite-close unopinionated DX | 0.90 | extension/state/tx API, no provider/product policy |
| Plate and slate-yjs migration backbone | 0.88 | external `plite-yjs`, Lexical, y-prosemirror synthesis; no compatibility shims |
| Regression-proof testing strategy | 0.91 | four-lane operation matrix, public deleteFragment proof, and focused Playwright selection specs |
| Research evidence completeness | 0.91 | local source reads and compiled `yjs-collaboration-bindings.md` |
| shadcn-style composability / minimal hooks | 0.86 | example controls and React hooks target minimal external-store projection |

Total: `0.90`

Status is `complete`: the package, operation-matrix tests, simulator,
Playwright selection proof, package metadata, changeset, and closure gates are
current. No upstream issue is claimed fixed by this plan.

## Closeout

Completed in `../plite`:

1. `@slate/yjs` source package exists with operation encoders, controller,
   selection, awareness, React hooks, and package-local harnesses.
2. Every operation matrix row is either supported, explicitly characterized
   through public transform operation sequences, or traceable fallback with
   named trace modes.
3. Each supported operation family has local-offline, concurrent remote,
   reconnect/recovery, and local undo/redo coverage.
4. The four-peer simulator route is registered and covered by focused
   Playwright selection/collaboration rows.
5. Trace names stay precise: `virtual-merge-ref` for absorbed block merge refs,
   `virtual-move-ref` for wrapper-child refs,
   `virtual-move-placeholder` for generic moved-slot refs, and
   `virtual-move-parent-remove` for parent shells that must stay hidden to keep
   moved descendants alive.
