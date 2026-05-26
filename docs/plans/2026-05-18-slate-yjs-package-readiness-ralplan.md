# Slate Yjs Package Readiness Ralplan

> Sync note, 2026-05-24: current `../slate-v2` still has no source
> `packages/slate-yjs` package, no source `yjs-collaboration` example, and no
> package Playwright suite. The core extension API remains `setup(...)` /
> `onCommit(...)`, and the collab-readiness benchmark is no longer stale: it
> now uses `history()` plus `setup(...)` / `onCommit(...)` and passes as a
> calibration benchmark. The remaining execution gates are package source,
> full simulation example, package tests, Playwright selection proof, and final
> public package identity.

Date: 2026-05-18
Status: pending user review / Ralph implementation
Owner skill: `.agents/skills/slate-ralplan/SKILL.md`
Previous plans:

- `docs/plans/2026-05-13-slate-v2-yjs-core-readiness-ralplan.md`
- `docs/plans/2026-05-13-yjs-collaboration-harvest.md`

Institutional learnings checked:

- `docs/solutions/developer-experience/2026-05-13-slate-v2-yjs-readiness-needs-core-contracts-before-package-work.md`
- `docs/solutions/documentation-gaps/2026-04-09-slate-collaboration-docs-must-mark-the-external-adapter-boundary.md`
- `docs/solutions/test-failures/2026-03-22-yjs-slow-tests-need-explicit-bun-paths-and-bootstrapped-shared-types.md`
- `docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md`

## Current Verdict

Create the first-party `slate-yjs` package, but do it as a clean source
package. Do not patch the current `../slate-v2/packages/slate-yjs` folder as if
it were real source. It is build residue: `dist/`, empty `src/` and `test/`
directories, no `package.json`, and no current source package contract.

The 2026-05-13 core-readiness plan is superseded for package timing. Its
original "do not create `slate-yjs` yet" verdict is stale because the core
readiness contracts now exist and pass focused tests. Its API examples are also
partly stale: live Slate v2 rejects extension `register` and
`commitListeners`; the current adapter contract uses `setup(...)` and
`onCommit(...)`.

Strong call: hard-cut the residue and recreate `packages/slate-yjs` as a
first-party package folder with `./core`, `./react`, and `./internal`
subpaths. Do not assume the public npm name is `slate-yjs`: npm currently has
`slate-yjs@3.2.0` published from `BitPhinix/slate-yjs`. The preferred public
import path is `@slate/yjs` if the Slate npm scope can publish it; otherwise
the implementation must keep the package private or revise the import path
before docs ship. The package must speak current Slate v2:

- mount with `editor.extend(createYjsExtension(...))`
- observe local commits through extension `onCommit`
- import remote changes through `editor.update((tx) => ...)`
- expose state/tx namespace helpers, not editor monkey-patches
- keep provider, awareness, cursors, and selection state adapter-owned
- prove selection bugs in Playwright, not just Node tests

## Intent And Boundary Record

Intent: turn the old Yjs plan and harvest into a current, executable package
plan after several core APIs changed.

Desired outcome: `../slate-v2` has a real `slate-yjs` workspace package, docs,
a full simulation example, unit coverage comparable to the reference packages,
and Playwright coverage for selection/collaboration bugs.

In scope:

- `../slate-v2/packages/slate-yjs` source package shape
- `slate-yjs` public/core/react/internal exports
- Yjs document binding, operation conversion, canonical reconcile, relative
  position conversion, undo/history, awareness, remote cursors
- full example with controls to simulate peers, network lifecycle, remote
  updates, undo/redo, cursor/selection behavior, and failure cases
- Playwright tests for selection and cross-editor browser regressions
- docs and current PR/reference accounting in later passes

Non-goals:

- no Plate-specific API inside raw Slate
- no current external `@slate-yjs/*` compatibility promise
- no first-party OT protocol or Yjs-free collaboration package in this slice
- no provider hosting story; use in-memory/local test providers for proof
- no browser/mobile claim without matching Playwright/device evidence

Decision boundaries:

- Raw Slate owns document values, operations, transactions, commits, metadata,
  history hooks, bookmarks/range refs, and runtime ids.
- `slate-yjs` owns Yjs schema, shared root lifecycle, Y event translation,
  relative-position mapping, undo-manager integration, awareness, cursor state,
  loop suppression, and adapter lifecycle.
- React owns rendering and external-store projection.
- Plate owns product collaboration UI, comments, suggestions, permissions, and
  app/provider policy.

Acceptance boundary:

- The first public package must include a working binding, simulation example,
  package tests, and Playwright selection proof before it is called ready.
- A provider component is not required for readiness. Provider policy can stay
  inline in the example unless a thin provider-agnostic component proves its
  value.
- Undo/redo is a required behavior lane, but public `tx.yjs.undo()` /
  `tx.yjs.redo()` commands ship only if relative-selection restoration is
  proven. Do not publish commands that mostly work but corrupt selection.
- Origin/source metadata belongs in commit metadata and adapter origins. This
  plan does not add a durable public source field to every Slate operation.

Unresolved user-decision points: none for planning. The package implementation
may choose clean architecture over compatibility shims, and that includes
breaking from external `@slate-yjs/*` wrapper naming.

## Decision Brief

Principles:

- Current Slate v2 source wins over old plans and external adapters.
- First-party package code must not revive legacy mutable editor extension
  hooks.
- Collaboration correctness is a state-machine and browser-selection problem,
  not just a serializer problem.
- Provider/awareness policy belongs in the adapter, not raw Slate.
- Test coverage should track the reference packages' behavior breadth, then add
  Slate-specific browser proof where those packages are blind.

Top drivers:

- live Slate v2 extension API changed to `setup` / `onCommit`
- live package folder is not a source package
- #5771-class selection bugs need real adapter/browser proof before `Fixes`
  language
- old external `slate-yjs` has valuable behavior fixtures but the architecture
  is the wrong shape for v2

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Recreate first-party package around current Slate extension/state/tx APIs | clean v2 shape, no monkey-patches, best migration backbone | requires more package/test work | chosen |
| Port external `slate-yjs` wrappers mostly as-is | fastest apparent API familiarity | mutates `apply`, `onChange`, and `children`; fights v2 | rejected |
| Keep only raw collaboration substrate docs, no package | avoids package risk | does not satisfy user goal or real ecosystem need | rejected |
| Put Yjs concepts in raw `slate` core | convenient access | makes core Yjs-opinionated and bloats non-Yjs users | rejected |
| Expose a public binding/controller object first | mirrors Lexical's binding shape | prematurely freezes internals before Slate package tests prove the lifecycle | rejected for first API; keep binding internal |
| Ship provider UI/component as part of readiness | looks complete to app authors | drags room/auth/provider policy into raw package | rejected unless it stays thin and provider-agnostic |

Consequences:

- Package public API should prefer extension factories and helper functions over
  `withYjs(...)` editor wrappers.
- The old `withYjs`, `withYHistory`, and `withCursors` names can inspire docs
  but should not force the v2 API.
- The internal binding/controller should exist, but public users should meet it
  through `createYjsExtension(...)`, `state.yjs`, `tx.yjs`, and pure conversion
  helpers first.
- Full package readiness needs both Node/package tests and Playwright tests.
- The benchmark lane is current and useful as core calibration, but it is not
  package/browser proof and still cannot carry a production performance claim.

Follow-ups:

- related-issue discovery pass
- issue-ledger sync pass after claims are finalized
- separate Ralph implementation after user accepts this plan

## Intent-Boundary And Decision-Brief Pressure Pass

Pass date: 2026-05-18
Status: complete
Skill: `.agents/skills/intent-boundary-pass/SKILL.md`

Evidence used:

- current intent/boundary record in this plan
- current decision brief in this plan
- live source evidence table above
- related issue discovery and issue-ledger passes

Pressure result:

| Surface | Weak interpretation | Final boundary |
| --- | --- | --- |
| "new `slate-yjs` package" | copy external `@slate-yjs/core` / `@slate-yjs/react` wrappers or claim the occupied npm name | one first-party `packages/slate-yjs` package folder with current Slate extension/state/tx APIs; public npm name resolves before docs |
| "full example" | docs-style page or happy-path two editors | simulation tool surface with peer controls, event log, failure controls, selection JSON, and Playwright assertions |
| "provider support" | first-party room/auth/provider abstraction | package accepts Yjs doc/shared root/awareness; provider hosting policy stays out |
| "undo/redo controls" | publish commands before selection restore is proven | undo/redo is required proof, but public commands ship only with relative-selection tests |
| "source metadata" | add source fields to every Slate operation | use commit metadata and adapter origins; keep #4178 as related/non-closure |
| "migration support" | support current Plate or current external slate-yjs public APIs | provide migration backbone and docs mapping, not compatibility shims |

No user question is needed. The repo and user request already answer the only
real ambiguity: clean rearchitecture is allowed, so the plan should optimize for
current Slate v2 correctness over wrapper compatibility.

## Current Live Source Evidence

| Surface | Current owner | Evidence | Plan impact |
| --- | --- | --- | --- |
| `slate-yjs` package | `../slate-v2/packages/slate-yjs` | `ls -la` shows only `dist/`, `.turbo`, `node_modules`, empty `src/`, empty `test`; `test -f packages/slate-yjs/package.json` failed | recreate source package; do not patch residue |
| examples | `../slate-v2/site/pages/examples/[example].tsx:14-51`, `../slate-v2/site/constants/examples.ts:1-31` | no `yjs-collaboration` importer or example list entry | add example route registration and source |
| docs | `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md` | docs describe raw adapter substrate, not a package recipe | add package docs after package API exists |
| extension API | `../slate-v2/packages/slate/src/core/editor-extension.ts:162-203`, `:205-233`, `:566-581` | live code rejects `register`, `commitListeners`, and setup-output `commitListeners`; supports `onCommit` | old plan examples must be rewritten |
| state/tx namespaces | `../slate-v2/packages/slate/test/extension-namespaces-contract.ts:28-70`, `:72-127` | extension groups install on state/tx without mutating editor object | `slate-yjs` should expose state/tx groups |
| document replace | `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts:93-122` | `tx.value.replace(...)` exists and commits full-document replace | canonical Y snapshot reconcile should use it |
| current collab core proof | `../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts:65-145`, `:171-232` | fake adapter uses `setup`, runtime state, `onCommit`, remote replay, loop suppression, cleanup | package should follow this shape |
| selection stress | `../slate-v2/packages/slate/test/collab-selection-stress-contract.ts:99-220` | high-QPS remote prefix, same-offset, suffix, split/merge, removal, history skip pass in focused tests | package/browser tests must reuse these scenarios |
| bookmarks | `../slate-v2/packages/slate/test/collab-bookmark-position-contract.ts:79-254` | bookmarks rebase/null through remote text, split, merge, move, replace_children | Y relative positions should map to these semantics |
| canonical reconcile | `../slate-v2/packages/slate/test/collab-canonical-reconcile-contract.ts:51-150` | remote canonical replace publishes one commit, skips history, preserves policy | package needs incremental import plus canonical fallback |
| React side effects | `../slate-v2/packages/slate-react/test/selection-side-effect-policy-contract.ts:13-97` | remote selection metadata can suppress scroll/focus while still syncing selection | adapter remote imports must carry this metadata |
| collab benchmark | `../slate-v2/scripts/benchmarks/core/current/collab-readiness.mjs:4-10`, `:112-145`, `:272-283` | current file imports `history as historyExtension`, mounts fake collaboration through `setup(...)`, observes local commits through `onCommit(...)`, and passes `bun run bench:core:collab-readiness:local` | keep as core calibration proof; still require real package and browser proof before performance or issue claims |

Fresh command evidence:

- `bun test ./packages/slate/test/collab-adapter-extension-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-bookmark-position-contract.ts ./packages/slate/test/collab-canonical-reconcile-contract.ts ./packages/slate-react/test/selection-side-effect-policy-contract.ts` from `../slate-v2`: 16 pass, 0 fail.
- `bun run bench:core:collab-readiness:local` from `../slate-v2`
  on 2026-05-24: passed. It emitted normal, large, stress, and pathological
  cohort calibration rows, and all red flags were false.
- `test -f packages/slate-yjs/package.json` from `../slate-v2`: failed.
- `find packages/slate-yjs/src packages/slate-yjs/test -type f -maxdepth 5` from `../slate-v2`: no source/test files.
- `bun run completion-check -- --id 019e3967-668f-7f20-89e9-c6d3be500b9a` from `plate-copy` after passes 1-8: correctly kept the staged Ralplan loop open while later scheduled passes remained.
- `npm view slate-yjs name version description repository --json` from
  `plate-copy`: `slate-yjs@3.2.0` exists and points at
  `BitPhinix/slate-yjs`.
- `npm view @slate/yjs name version description repository --json` from
  `plate-copy`: returned npm `E404`; candidate name is not published but still
  needs Slate scope/publish access proof.
- `find ../slate-yjs -maxdepth 3 -name package.json ...` from `plate-copy`:
  external repo root is `slate-yjs`, with workspaces `@slate-yjs/core` and
  `@slate-yjs/react`.
- `sed -n '1,180p' packages/yjs/package.json` from `plate-copy`: Plate package
  is `@platejs/yjs` and depends on `@slate-yjs/core`.
- `bun run completion-check -- --id 019e3967-668f-7f20-89e9-c6d3be500b9a`
  from `plate-copy` after passes 9-11: correctly kept the staged Ralplan loop
  open while later scheduled passes remained.
- `bun run completion-check -- --id 019e3967-668f-7f20-89e9-c6d3be500b9a`
  from `plate-copy` after pass 12: passed; the Slate Ralplan planning lane is
  complete.

Goal-continuation audit, 2026-05-18:

- `bun test ./packages/slate/test/collab-adapter-extension-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-bookmark-position-contract.ts ./packages/slate/test/collab-canonical-reconcile-contract.ts ./packages/slate-react/test/selection-side-effect-policy-contract.ts`
  from `../slate-v2`: 16 pass, 0 fail.
- `bun run bench:core:collab-readiness:local` from `../slate-v2`
  on 2026-05-24: passes after the live benchmark moved to
  `history as historyExtension` plus `setup(...)` / `onCommit(...)`.
- `test -f packages/slate-yjs/package.json` from `../slate-v2`: missing.
- `find packages/slate-yjs/src packages/slate-yjs/test -maxdepth 5 -type f`
  from `../slate-v2`: `0` source/test files.
- `npm view slate-yjs name version description repository --json` from
  `plate-copy`: `slate-yjs@3.2.0` still points at
  `BitPhinix/slate-yjs`.
- `npm view @slate/yjs name version description repository --json` from
  `plate-copy`: still returns npm `E404`.
- Local reference package identities remain `@slate-yjs/core@1.0.2`,
  `@slate-yjs/react@1.1.0`, `@lexical/yjs@0.44.0`,
  `@y/prosemirror@2.0.0-2`, and `@platejs/yjs@52.3.10`.
- Current Slate v2 extension API still rejects `commitListeners` and
  `register`, and accepts `setup` / `onCommit` as the collaboration adapter
  shape.
- Current source `site/constants/examples.ts` and
  `site/pages/examples/[example].tsx` still have no `yjs-collaboration`
  source example entry. The generated `site/out` route is stale build output,
  not source evidence.

## 2026-05-24 Current-State Sync Pass

Status: complete for this activation. Overall plan status remains pending for
Ralph implementation.

Fresh source facts:

- `../slate-v2/packages/slate-yjs`: still no `package.json`, no source files,
  and no test files. Current files are generated/build residue under `dist/`,
  `.turbo`, and package-local `node_modules`.
- `../slate-v2/packages/slate/src/core/editor-extension.ts:179-248`,
  `:575-584`: current extension API still rejects `methods`, `commands`,
  `operationMiddlewares`, `commitListeners`, and `register`; `onCommit` is the
  current commit-observation slot.
- `../slate-v2/scripts/benchmarks/core/current/collab-readiness.mjs:1-10`,
  `:112-145`, `:272-283`: benchmark now imports
  `history as historyExtension`, uses `setup(...)`, uses `onCommit(...)`, and
  reads history through `state.history.get()`.
- `../slate-v2/site/constants/examples.ts:11-43` and
  `../slate-v2/site/pages/examples/[example].tsx:14-51`: no source
  `yjs-collaboration` example registration.
- `../slate-v2/site/out/**` contains generated `yjs-collaboration` output, but
  generated output is not source evidence and should not be used as proof that
  the example exists.

Fresh command evidence:

- cwd: `/Users/felixfeng/Desktop/repos/slate-v2`
- `bun test ./packages/slate/test/collab-adapter-extension-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-bookmark-position-contract.ts ./packages/slate/test/collab-canonical-reconcile-contract.ts ./packages/slate-react/test/selection-side-effect-policy-contract.ts`:
  16 pass, 0 fail.
- `bun run bench:core:collab-readiness:local`: passed and emitted normal,
  large, stress, and pathological cohort rows with all red flags false.
- `test -f packages/slate-yjs/package.json`: failed; package source still
  absent.
- `find packages/slate-yjs -maxdepth 3 -type f`: only generated/build residue
  files under `dist/` and `.turbo`.

Plan delta:

- keep the first-party package verdict;
- keep `@slate/yjs` as preferred public identity pending publish access;
- remove the stale benchmark-repair blocker from execution gates;
- keep benchmark proof classified as core calibration only;
- keep package source, full simulation example, package tests, Playwright
  selection proof, and public package identity as the next execution gates.
- pr-description updated: issue coverage summary now records the 2026-05-24
  benchmark refresh and keeps issue claims unchanged.
- issue coverage matrix unchanged: no fixed/improved/related claim changed.

Next owner:

- `ralph` implementation should start with package scaffold and source-first
  package tests, then example controls, then Playwright selection proof.

## Ecosystem Strategy Synthesis

Pass 5 compiled the reusable source summary:
`docs/research/sources/editor-architecture/yjs-collaboration-bindings.md`.
The table below keeps row-level live anchors, but that page is the research
entrypoint for future `slate-yjs` package work.

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Slate v2 core | `collab-adapter-extension-contract.ts`; `editor-extension.ts` | extension setup owns runtime state, `onCommit` observes commits, remote import goes through `tx.operations.replay` | editor monkey-patching and re-export loops | adapter extension factory, runtime state, onCommit filtering | `register`, `commitListeners`, `editor.apply`, `editor.onChange` hooks | `createYjsExtension(options)` mounted by `editor.extend(...)` | agree |
| Slate v2 state/tx | `extension-namespaces-contract.ts`; `state-tx-public-api-contract.ts` | extension state/tx groups expose capability without editor mutation | leaking package methods onto editor object | `state.yjs.*`, `tx.yjs.*` for connect/pause/reconcile/inspect | flat `editor.yjs` or wrapper-only API | namespace helpers plus standalone pure converters | agree |
| External `slate-yjs` | `../slate-yjs/packages/core/src/plugins/withYjs.ts:156-283`; `withYHistory.ts:58-182`; `withCursors.ts:160-269`; `utils/position.ts:10-80` | editor wrapper observes Y events, stores local changes, converts relative positions, tracks undo/cursors | many Yjs binding details already solved | Y.XmlText representation, op fixture breadth, relative position helpers, grouped origins, undo metadata, awareness hooks | direct `children` assignment, `apply`/`onChange` override, `Transforms.select` restoration, wrapper API as core shape | translate into extension-owned binding/controller and tests | partial |
| Lexical Yjs | `../lexical/packages/lexical-yjs/src/Bindings.ts:25-127`; `SyncEditorStates.ts:134-174`; `index.ts:90-150`; `SyncCursors.ts:168-310` | binding object owns editor/doc/provider/mapping/cursors; Y events precompute delta; collaboration tags suppress scroll; cursor DOM owned outside model | mixing CRDT state into editor values and broad React rerenders | binding object shape, precomputed YEvent delta, explicit update tags, ensure-non-empty repair, cursor lifecycle cleanup | class-node coupling and DOM-owned cursor rendering as raw Slate core | package-local binding state and React external-store cursor projections | agree |
| y-prosemirror | `../y-prosemirror/src/commands.js:12-66`; `undo-plugin.js:23-67`, `:98-227`; `cursor-plugin.js:95-152`, `:169-296` | sync can pause/reconfigure Y type, canonical replace from Y content, undo selection bookmarks use relative positions, awareness identity comes from awareness doc | stale cursor identity, undo cursor jumps, history pollution | pause/reconfigure lifecycle, relative-selection undo metadata, awareness-doc identity, canonical replace fallback | ProseMirror transaction/plugin complexity and integer positions | `tx.yjs.pause/resume/connect`, Y relative positions mapped to Slate bookmarks | agree |
| Yjs | harvest report and test index | relative positions, text/delta, updates, snapshots, UndoManager, XML/text containers have deep fixture coverage | CRDT edge cases missed by Slate-only tests | selected portable rows for relative positions, delta, undo, snapshots, updates | low-level ID/encoding internals as Slate package tests | package unit tests backed by selected Yjs fixtures | partial |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md` | `useSyncExternalStore` is the subscription primitive; Activity/deferred work do not replace core invalidation | cursor/awareness rerender breadth | external-store cursor hooks with selectors | stuffing transient cursor state into editor render props | `@slate/yjs/react` selector hooks | agree |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md` | product DX packages extension config, commands, UI, React selectors | scattered adapter setup | readable extension entrypoint and example call site | chain-first product API as raw core requirement | simple extension factory plus explicit controls example | partial |

## Research/Ecosystem/Live-Source Refresh Pass

Pass date: 2026-05-18
Status: complete
Mode: research-wiki maintain over the editor-architecture lane.

Source refresh:

- `../slate-v2/packages/slate/src/core/editor-extension.ts:162-233`,
  `:566-581`
- `../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts:65-145`,
  `:171-232`
- `../slate-v2/packages/slate/test/collab-selection-stress-contract.ts:99-220`
- `../slate-v2/packages/slate/test/collab-bookmark-position-contract.ts:79-254`
- `../slate-v2/packages/slate/test/collab-canonical-reconcile-contract.ts:51-150`
- `../slate-v2/packages/slate-react/test/selection-side-effect-policy-contract.ts:13-97`
- `../slate-yjs/packages/core/src/plugins/withYjs.ts:156-283`
- `../slate-yjs/packages/core/src/plugins/withYHistory.ts:58-182`
- `../slate-yjs/packages/core/src/plugins/withCursors.ts:160-269`
- `../slate-yjs/packages/core/src/utils/position.ts:10-80`
- `../lexical/packages/lexical-yjs/src/Bindings.ts:25-127`
- `../lexical/packages/lexical-yjs/src/SyncEditorStates.ts:134-174`
- `../lexical/packages/lexical-yjs/src/index.ts:90-150`
- `../lexical/packages/lexical-yjs/src/SyncCursors.ts:168-325`
- `../y-prosemirror/src/commands.js:12-66`
- `../y-prosemirror/src/undo-plugin.js:23-227`
- `../y-prosemirror/src/cursor-plugin.js:95-296`

Compiled research edits:

- Added
  `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md`.
- Linked it from `docs/research/sources/editor-architecture/README.md`.
- Linked it from `docs/research/index.md`.
- Appended a 2026-05-18 maintain entry to `docs/research/log.md`.

Disposition:

| Corpus | Status | Plan result |
| --- | --- | --- |
| Current Slate v2 source | evidenced | current `setup`/`onCommit` and state/tx APIs remain the package target |
| Current `packages/slate-yjs` folder | source package gap | hard-cut residue and recreate the package |
| External slate-yjs | evidenced, mechanism-only | steal conversion, origin, undo, awareness, and relative-position mechanics; reject wrapper mutation |
| Lexical Yjs | evidenced | steal binding-object ownership, delta precompute, update tags, cursor cleanup |
| y-prosemirror | evidenced | steal pause/reconfigure, canonical replace fallback, relative-selection undo, awareness identity |
| Research layer | compile gap closed | future agents should read the new source page before rebuilding this synthesis |

Pass conclusion: the architecture call is stronger, not different. The package
should be a clean Slate v2 extension/state/tx binding. No current evidence
rescues the old wrapper API, and no implementation readiness claim is allowed
until the package and Playwright gates exist. The core benchmark exists and
passes as calibration, but it does not prove the package adapter or browser
selection behavior.

## Public API Target

Package identity:

```txt
folder: packages/slate-yjs
preferred package name: @slate/yjs
fallback: private workspace package until publish identity is resolved
blocked name: slate-yjs
```

Package subpaths, using the preferred public package name:

```txt
@slate/yjs
@slate/yjs/core
@slate/yjs/react
@slate/yjs/internal
```

Core API target:

```ts
import * as Y from 'yjs'
import { createEditor } from 'slate'
import { createYjsExtension } from '@slate/yjs/core'

const doc = new Y.Doc()
const sharedRoot = doc.get('content', Y.XmlText)
const editor = createEditor({
  extensions: [
    createYjsExtension({
      awareness,
      autoConnect: false,
      clientId: 'writer',
      sharedRoot,
    }),
  ],
})

editor.update((tx) => {
  tx.yjs.connect()
})

editor.read((state) => state.yjs.connected())
```

Named exports:

- `createYjsExtension(options)`
- `slateNodesToYDelta(nodes)`
- `yDeltaToSlateNodes(delta)`
- `slatePointToYRelativePosition(binding, point)`
- `yRelativePositionToSlatePoint(binding, position)`
- `slateRangeToYRelativeRange(binding, range)`
- `yRelativeRangeToSlateRange(binding, relativeRange)`

Release-gated/internal first:

- `encodeYjsSnapshot(binding)` / `applyYjsSnapshot(binding, snapshot)` stay
  internal until a public snapshot restore behavior row needs them.
- `isYjsOrigin(origin)` / `createYjsOrigin(label)` stay internal unless
  third-party origin integration tests prove public users need them.

State namespace:

- `state.yjs.connected()`
- `state.yjs.paused()`
- `state.yjs.clientId()`
- `state.yjs.sharedRoot()`
- `state.yjs.remoteCursors()`
- `state.yjs.pendingLocalOperations()`
- `state.yjs.lastRemoteRevision()`

Tx namespace:

- `tx.yjs.connect()`
- `tx.yjs.disconnect()`
- `tx.yjs.pause()`
- `tx.yjs.resume()`
- `tx.yjs.flushLocal()`
- `tx.yjs.applyRemoteEvents(events, origin)`
- `tx.yjs.reconcileFromSharedRoot(options?)`
- `tx.yjs.sendCursor(range?)`
- `tx.yjs.clearCursor()`

React API target:

- `useRemoteCursorStates(editor, selector?, isEqual?)`
- `useRemoteCursorDecorations(editor, options?)`
- no required public `YjsProvider` in the first package API; keep provider
  wiring inline in the example unless a later pass proves a thin
  provider-agnostic component earns its weight

Hard rule: no `withYjs(editor)`, `withYHistory(editor)`, or `withCursors(editor)`
wrapper as the primary v2 API. Those names can appear in migration docs only as
old-reference concepts.

## Internal Runtime Target

Binding state:

- stored in extension runtime state / WeakMaps
- owns `Y.Doc`, `Y.XmlText`, awareness, origin symbols, connect state, paused
  state, current revision, local export queue, remote import depth, cursor
  revision
- never stored in Slate document values
- never exposed through public editor object mutation

Local export:

1. extension `onCommit` receives Slate commit
2. skip if disconnected, paused, `skip-collab`, `collaboration`, remote origin,
   selection-only awareness update, or no snapshot change
3. convert operations to Yjs changes inside one Y transaction with a package
   local origin
4. group commits by origin where useful
5. update awareness separately for local cursor/selection

Remote import:

1. observe Y events and precompute event deltas during the event callback
2. if incremental conversion is safe, replay Slate operations in one
   `editor.update`
3. if conversion is ambiguous, use canonical `tx.value.replace(...)` from
   shared root
4. always tag remote imports with `collaboration`, `remote-import`,
   `skip-scroll-into-view`, and `skip-selection-focus`
5. set metadata `{ collab: { origin: 'remote', saveToHistory: false }, history:
   { mode: 'skip' }, selection: { dom: 'preserve', focus: false, scroll: false
   } }`
6. clamp/null selections and cursor ranges explicitly after remote shrink/repair

Undo/history:

- use Y.UndoManager for shared root changes with tracked local origins
- store selection metadata as Y relative ranges
- do not pollute `slate-history` undo stacks on remote import
- expose undo/redo through `tx.yjs.undo()` / `tx.yjs.redo()` only if the first
  implementation proves selection restoration

Awareness/cursors:

- awareness lives outside document updates
- remote cursor state uses awareness doc client id, not bound root doc id
- cursor updates increment a separate revision/external-store signal
- React hooks subscribe narrowly; no document commit needed for awareness-only
  updates

## Hook, Component, And Example DX Target

The example should demonstrate the actual call-site API first. Helpers are fine
only after the API is visible.

Required example:

- `../slate-v2/site/examples/ts/yjs-collaboration.tsx`
- route importer in `../slate-v2/site/pages/examples/[example].tsx`
- label in `../slate-v2/site/constants/examples.ts`

Controls:

- two editors plus optional third peer
- connect / disconnect / pause / resume per peer
- seed/reset shared document
- local type into focused peer
- remote prefix burst
- same-offset contention
- remote suffix insert
- remote split/merge
- remote move/remove selected node
- canonical reconcile
- undo / redo
- send cursor / clear cursor
- toggle network lag, dropped update, reorder queue
- show event log, commit tags, local export count, remote import count,
  awareness revision, selection JSON, shared Yjs text snapshot

Example UI rule: build a useful tool surface, not a docs lecture. The controls
are part of the proof, not decorative chrome.

Simplicity rule: the example may use local helpers for repeated UI controls and
scenario dispatch, but the first screen must show the actual Slate/Yjs call
site. Do not hide `createYjsExtension(...)`, `state.yjs`, or `tx.yjs` behind an
example-only abstraction.

## Plate Migration Backbone Target

Plate should be able to adopt the package without wrapping every core call:

- Plate can install `createYjsExtension(...)` during editor construction.
- Plate can layer provider/auth/room/presence policy above package options.
- Plate can use `state.yjs` and `tx.yjs` from product commands.
- Plate-specific comments/suggestions stay in Plate packages.
- Plate can keep its existing Yjs fixtures as downstream integration proof.

No current-version Plate adapter promise is required in this package slice.

## Slate-Yjs Migration Backbone Target

External `slate-yjs` concepts map as follows:

| Old concept | V2 target |
| --- | --- |
| `withYjs(editor, sharedRoot)` | `createYjsExtension({ sharedRoot })` |
| `YjsEditor.connect(editor)` | `editor.update((tx) => tx.yjs.connect())` |
| `YjsEditor.disconnect(editor)` | `editor.update((tx) => tx.yjs.disconnect())` |
| `withYHistory(editor)` | package undo manager integration, gated by tests |
| `withCursors(editor, awareness)` | extension awareness option plus `@slate/yjs/react` hooks |
| direct `editor.children = ...` | `tx.value.replace(...)` |
| override `editor.apply` | extension `onCommit` local export |
| override `editor.onChange` | commit/awareness listeners and React external store |
| `Transforms.select` restore | `tx.selection.set(...)` or explicit skip when relative range cannot resolve |

## Issue-Ledger Accounting

Current-state pass result: issue surface is real and cannot be skipped. The
related-issue discovery pass is next.

Read evidence this pass:

- `docs/slate-issues/gitcrawl-live-open-ledger.md:91` lists live open #5771.
- `docs/slate-issues/gitcrawl-live-open-ledger.md:176` lists live open #5533.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:93` currently marks #5771 as
  `improves-claimed`, not fixed.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:211` keeps #5771 as
  `Improves` because exact provider/browser closure is unclaimed.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:212` keeps #5533 as
  `Related`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:98-99` keeps #1770 and #3741
  related to collaboration op metadata/transaction boundaries.

Current issue matrix:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5771 | collaboration-selection-anchor-rebase | Improves now; possible Fixes only after package/browser proof | core proves selection stress; package/browser exact repro still missing | package unit + Playwright yjs-collaboration selection suite | existing `improves-claimed`; update later only if browser proof passes | pending |
| #5533 | collaboration-without-yjs | Related | a Yjs package does not answer Yjs-free collaboration | no fixed claim | unchanged unless issue pass finds new wording | related matrix only |
| #1770 | collaboration-op-metadata-and-transaction-boundaries | Related | package may reduce op chatter but does not add a general op merge utility | package convergence tests | unchanged unless issue pass revises | related matrix only |
| #3741 | collaboration-op-metadata-and-transaction-boundaries | Related | package can reconstruct moved-node state in Yjs, but does not change core `move_node` payload | package move_node conversion tests | unchanged unless issue pass revises | related matrix only |
| #4178 | collaboration-op-metadata-and-transaction-boundaries | Related | commit tags/metadata help source tracking, but operations themselves are not new source-tag payloads | package origin tests | v2 sync remains `cluster-synced`; coverage matrix and fork dossier now carry explicit `Related` rows | related matrix only |

ClawSweeper related-issue discovery status: complete. Trigger: public package
API, runtime behavior, browser behavior, and issue claims are in scope. Existing
ledgers were enough; no broad live GitHub discovery was needed.

PR reference status: unchanged in current-state pass; update in issue-sync pass
if accepted API shape, proof rows, or issue claims change.

## Related Issue Discovery Pass

Pass date: 2026-05-18
Status: complete
Mode: ledger/cache-first ClawSweeper pass; no broad live GitHub discovery.

Source ledgers checked:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/test-candidate-map/5912-5771.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-issues/package-impact-matrix.md`

Discovery findings:

| Issue | Live/local status | Current claim posture | Package-plan decision | Pass-3 ledger action |
| --- | --- | --- | --- | --- |
| #5771 | live open singleton; test candidate is high-QPS remote `insert_text` vs local selection | `improves-claimed` in v2 sync and `Improves` in coverage matrix | central package browser-selection proof row; no `Fixes` until real `slate-yjs` adapter + Playwright repro passes | keep `Improves`; later add package proof only after implementation |
| #5533 | live open singleton feature request for collaboration without Yjs | `Related` in coverage matrix | explicit non-claim; this package is Yjs-specific and should not pretend to answer Yjs-free collaboration | keep related/non-claim wording |
| #1770 | frozen corpus/v2 sync collaboration operation-composition pressure | `Related` in coverage matrix | package may reduce Yjs transport noise but does not ship general op merge API | keep related |
| #3741 | v2 sync says PM-08 covers remote `move_node` replay but no moved-node payload claim | `Related` in coverage matrix | Yjs package can store reconstructed shared content but must not redesign Slate `move_node` payload | keep related |
| #4178 | live open singleton; v2 sync has `cluster-synced`; no explicit coverage-matrix row found | cluster-synced only | package origin tags help adapter provenance, but operations still do not carry durable public source metadata | pass 3 should add or explicitly skip a coverage-matrix related row |
| #2288 | existing `Improves` row for range-capable child-window operation | `Improves` unchanged | adjacent operation-range pressure; not a package claim | no change unless package tests add range replay proof |
| #4477 | existing `Improves` row for selection-anchored annotations/widgets | `Improves` unchanged | adjacent collaborative comments product request; raw `slate-yjs` should not own comments | no change |
| #3715 | v2 sync says not claimed/docs-example/support lane | not claimed | old core-readiness adjacency, not relevant to package API | no package-plan claim |
| #3482 | v2 sync says cluster-synced under transaction/op/history pressure | cluster-synced | adjacent historical pressure only; no slate-yjs package claim | no package-plan claim |

Pass conclusion: the current plan's conservative issue posture is right. The
only discovered sync gap is `#4178`: it is relevant enough to mention in this
package plan, but it lacks an explicit coverage-matrix row. Do that in pass 3,
not in this discovery pass.

## Issue-Ledger Pass

Pass date: 2026-05-18
Status: complete

Ledger edits:

- Added `#4178` to `docs/slate-v2/ledgers/issue-coverage-matrix.md` as
  `Related`, not `Fixes` or `Improves`.
- Added a fork-local `#4178` section to
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- Left `docs/slate-issues/gitcrawl-v2-sync-ledger.md` at `cluster-synced`
  because the current sync row is still accurate; the new coverage-matrix row
  carries the package-plan claim boundary.
- Left `docs/slate-v2/references/pr-description.md` unchanged. No fixed-issue
  count changes, and no PR-facing `Fixes` claim exists.

Final claim wording:

- `#5771`: `Improves`, still gated on real `slate-yjs` adapter plus Playwright
  repro before any `Fixes` claim.
- `#5533`: `Related`; a Yjs package does not answer Yjs-free collaboration.
- `#1770`: `Related`; no general operation-composition utility.
- `#3741`: `Related`; no moved-node payload redesign.
- `#4178`: `Related`; adapter provenance via commit metadata/origins, no
  durable public source field on operations.

Pass conclusion: issue-ledger accounting is synced for planning. Later
issue-sync accounting still has to revisit PR-reference text after the accepted
API shape and proof rows are final.

## Issue Sync Accounting Pass

Pass date: 2026-05-18
Status: complete
Mode: ClawSweeper ledger/reference sync after package identity revision.

Files synced:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

Claim decisions:

| Issue | Final pass-11 claim | Sync action |
| --- | --- | --- |
| #5771 | `Improves` | kept exact `Fixes` blocked until real `@slate/yjs` adapter/browser repro passes; added May 18 package plan to proof refs |
| #5533 | `Related` | clarified that planned `@slate/yjs` is Yjs-specific and does not answer Yjs-free collaboration |
| #1770 | `Related` | fixed fork-dossier status wording to match the existing related decision; no operation-composition closure |
| #3741 | `Related` | fixed fork-dossier status wording to match the existing related decision; no moved-node payload closure |
| #4178 | `Related` | clarified adapter-local origins/commit metadata as the package answer; no durable public source field on operations |

PR reference result:

- Added a Slate-Yjs package readiness summary line.
- Fixed issue count unchanged.
- Related matrix count unchanged.
- No new exact fixed or improved claims beyond the already-recorded #5771
  `Improves` posture.
- PR/import path remains a non-claim until `@slate/yjs` publish access or
  another final public package identity is resolved.

Pass conclusion: issue/reference sync is complete for the planning lane. The
next pass is closure/final-gate review only.

## Legacy Regression Proof Matrix

| Risk | Required proof |
| --- | --- |
| local text/mark/node op does not converge through Yjs | package fixture matrix from external `slate-yjs` op fixtures |
| remove/split/merge/move corrupts relative positions | unit tests using Y relative positions and Slate bookmarks |
| remote import exports back to Yjs | onCommit loop suppression test |
| remote import pollutes local undo | `slate-history` + Y.UndoManager tests |
| undo restores wrong cursor after remote change | relative-range metadata tests inspired by y-prosemirror undo |
| awareness-only cursor update rerenders document or changes commit count | React external-store test |
| selected node removed remotely leaves stale selection path | unit plus Playwright browser repro |
| same-offset remote insert breaks local follow-up typing | unit plus Playwright |
| select-all/Delete regression returns | Playwright on example |
| left-editor type then right-editor Enter crash returns | Playwright on example |
| canonical reconcile steals focus or scroll | React policy unit plus Playwright focus check |

## Browser Stress And Parity Strategy

Playwright file:

- `../slate-v2/playwright/integration/examples/yjs-collaboration.test.ts`

Required browser rows:

- initial two-peer convergence after local typing
- disconnect peer, edit local, reconnect, reconcile
- pause peer, local edits do not export, resume exports after explicit flush
- same-offset remote insert while local collapsed selection is active
- remote prefix burst then local typing lands at transformed point
- remote remove selected node then local typing does not throw
- select-all/Delete leaves valid empty paragraph and converges
- type in left editor, press Enter in right editor, assert no pageerror
- remote cursor awareness update changes cursor UI without document writes
- canonical reconcile does not focus/scroll-steal active peer
- undo/redo after remote insert restores expected selection

Browser proof must assert:

- model text
- model selection when observable
- visible DOM text
- event log / commit tags
- no `pageerror`
- follow-up typing after the stress action

## Performance/DX/Migration/Regression/Simplicity Pressure Pass

Pass date: 2026-05-18
Status: complete
Skills applied:

- `.agents/skills/performance/SKILL.md`
- `.agents/skills/regression-lock-pass/SKILL.md`
- `.agents/skills/tdd/SKILL.md`
- `.agents/skills/code-simplicity-reviewer/SKILL.md`

Source evidence:

- `../slate-v2/scripts/benchmarks/core/current/collab-readiness.mjs:21-26`,
  `:110-157`, `:216-340`, `:351-378`
- `../slate-v2/packages/slate-history/src/history-extension.ts:177-210`,
  `:211-270`
- `../slate-v2/playwright/integration/examples/plaintext.test.ts:14-84`,
  `:271-320`
- `../slate-v2/playwright/stress/stress-utils.ts:37-67`, `:94-130`
- `../slate-v2/site/pages/examples/[example].tsx:14-58`
- `../slate-v2/site/constants/examples.ts:1-31`
- `docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md`
- `.agents/skills/performance/rules/cohort-segmentation.md`
- `.agents/skills/performance/rules/repeated-unit-budget.md`
- `.agents/skills/performance/rules/effect-subscription-budget.md`
- `.agents/skills/performance/rules/interaction-inp-matrix.md`
- `.agents/skills/performance/rules/memory-dom-tagging.md`
- `.agents/skills/performance/rules/editor-native-behavior-proof.md`
- `.agents/skills/performance/rules/degradation-contract.md`
- `.agents/skills/performance/rules/react-19-runtime-proof.md`
- `.agents/skills/performance/rules/browser-trace-cwv-proof.md`
- `.agents/skills/performance/rules/production-rum-dashboard.md`

### Performance

Current benchmark verdict: useful shape, current implementation. The benchmark
has normal/large/stress/pathological cohorts and lanes for local export, remote
replay batch/separate, bookmark rebase, canonical replace, history skip,
connect/disconnect heap, convergence, and red flags. On 2026-05-24 it passes
through the current API: `history()` plus extension `setup(...)` /
`onCommit(...)`.

Required benchmark follow-up:

- keep the calibration-only threshold until three comparable runs exist
- run one five-iteration calibration before package release
- add package-adapter rows after real `packages/slate-yjs` source exists
- keep browser interaction traces separate from core benchmark proof

Performance release rows:

| Surface | Requirement |
| --- | --- |
| Cohorts | normal, medium, large, stress, pathological; add complexity tags for collaboration activity, selection span length, cursor count, annotations/comments, custom renderers, mobile/IME |
| Repeated unit | document block plus peer cursor projection; track DOM nodes, components, handlers, effects, subscriptions, allocations, dirty-id sizes |
| Local export | one commit -> one Y transaction; no whole-document scan for selection-only awareness |
| Remote import | batch remote operations should not be slower than separate replay; red flag stays until repeated runs prove the ratio |
| Canonical reconcile | fallback only; benchmark it separately and never hide it inside incremental import averages |
| Awareness | cursor-only update must not create Slate document commits and must wake only cursor subscribers |
| Selectionchange | hot path stays primitive and model-owned; no public raw DOM range bridge for collaboration |
| React 19.2 | use external-store selectors for cursor state; keep visible typing/selection/IME urgent; Activity/deferred work can apply to logs and hidden panels, not editable content |
| Trace/RUM | Playwright/browser trace for selection bugs; RUM tags for interaction, cohort, doc size, visible DOM count, cursor count, mode, browser/mobile/IME |

Explicit non-claim: no production performance claim from the core benchmark
alone. It is a lab calibration gate. Browser interaction rows and memory/DOM
tags are still required.

### DX

DX pressure result: keep the API smaller than the first draft.

- Keep public first API to extension factory, conversion helpers, relative
  position helpers, `state.yjs`, `tx.yjs`, and React cursor hooks.
- Keep snapshot encode/apply helpers internal until a public snapshot restore
  behavior row exists.
- Keep origin helpers internal unless a third-party origin integration test
  proves public users need them.
- Do not add a public provider component for readiness.
- Do not add compatibility aliases for `withYjs`, `withYHistory`, or
  `withCursors`.
- Do not hide the package API behind example-local helpers.

Package shape:

| File/surface | Decision |
| --- | --- |
| `package.json` | folder `packages/slate-yjs`; preferred name `@slate/yjs`; do not use published `slate-yjs` unless ownership is secured; `type: module`, `sideEffects: false`, `files: ["dist/"]`, subpath exports for `.`, `./core`, `./react`, `./internal` |
| peers | `slate`, `yjs`; awareness protocol dependency for cursor support; `react` / `react-dom` optional peers for `./react` only |
| build | match current package `tsdown` / `tsconfig` patterns; do not hand-edit `dist` |
| source entrypoints | root reexports safe core surface; `./core` has no React import; `./react` owns hooks/decorations; `./internal` owns binding/controller test hooks |

### Migration

Migration story is mapping, not shim compatibility.

| Source user | Path |
| --- | --- |
| external slate-yjs wrapper user | use migration docs table from `withYjs` / `YjsEditor.connect` / `withCursors` to `createYjsExtension` and `tx.yjs` |
| Plate user | install extension at editor creation; keep room/auth/provider UI in Plate |
| raw Slate user | pass `Y.Doc`, shared root, optional awareness; control lifecycle through `tx.yjs` |
| package maintainer | run old fixture ideas through current state/tx contracts; do not port wrapper mutation |

### Regression Lock And TDD

TDD strategy: vertical slices, not a giant imagined suite.

First red rows:

1. package mounts `createYjsExtension(...)` and exposes `state.yjs.connected()`
   / `tx.yjs.connect()` without mutating the editor object
2. local text commit exports exactly one Y transaction and does not export
   skipped/remote commits
3. remote Y event imports through `editor.update` with collaboration metadata
   and no history pollution
4. relative range survives remote prefix/suffix/same-offset operations
5. awareness cursor update changes React cursor state without document commit
6. Playwright reproduces #5771-class selected-node-delete/follow-up typing

Regression gates reuse current proof instead of inventing a parallel harness:

- focused package tests for core binding/conversion/positions/undo/cursors
- existing Slate collaboration tests for adapter, selection stress, bookmarks,
  canonical reconcile, React side-effect policy
- Playwright example tests modeled after existing example and stress helpers,
  including `pageerror`, model text, model selection, visible DOM text, native
  selection/copy/paste/select-all, undo/history, IME where applicable, and
  follow-up typing

Native behavior contract:

| Behavior | Default package target |
| --- | --- |
| browser find | native, because editor content stays DOM-present |
| native selection | native model-owned bridge; no raw DOM range public API |
| copy/paste | native event path preserved; package adds collaboration proof rows only |
| select-all/Delete | native action with model convergence proof |
| IME/composition | native urgent path; no deferred cursor/update bridge in composition |
| mobile touch selection | no claim until mobile/browser row exists |
| undo/history | Y.UndoManager plus Slate history skip proof; public undo/redo gated |
| collaboration/follow-up typing | unit plus Playwright row required before issue closure |

### Simplicity

Simplicity verdict: the plan was mostly right, but the public API was too eager.

Cuts made in this pass:

- snapshot encode/apply helpers moved out of the first public API
- origin helpers moved out of the first public API
- example helpers explicitly subordinate to showing the actual API call site

Rejected complexity:

- provider component as readiness requirement
- compatibility aliases for old wrapper names
- generic network simulator abstraction in package source
- broad public binding/controller object before tests prove lifecycle needs

Remaining complexity is earned: conversion, relative positions, undo selection,
awareness, and browser tests are not optional in a collaboration package.

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Current-state finding | Plan delta |
| --- | --- | --- | --- |
| Vercel React best practices | applied | awareness/cursor state must use narrow external-store subscriptions; React cannot be the collaboration engine | `@slate/yjs/react` hooks use `useSyncExternalStore` / selector API |
| performance-oracle | applied | conversion, replay, canonical replace, bookmarks, connect/disconnect, awareness, and selectionchange are hot paths | require current collab benchmark calibration, package stress rows, memory/DOM tags, and browser interaction proof |
| performance | applied | repeated editor peers and large docs need cohort budgets | pass 6 adds cohort, repeated-unit, trace/RUM, native behavior, and degradation gates |
| tdd | applied | behavior surfaces are testable; package work should start with red unit/browser contracts | pass 6 defines vertical red rows before package source |
| shadcn/component composition | applied to example only | example is a tool surface with controls; keep UI composable and dense | use controls/log panels; no marketing page |
| react-useeffect | applied to React bindings | provider/awareness subscriptions are external-system effects; avoid reset-on-prop or derived-state effects | use external store and cleanup via extension lifecycle |
| regression-lock-pass | applied | #5771 and prior Enter/select-all bugs are browser/runtime regressions, not serializer-only bugs | package rows must reuse existing collab unit contracts and add Playwright proof |
| code-simplicity-reviewer | applied | first API exposed helpers before behavior rows earned them | snapshot and origin helpers are internal/release-gated first |
| steelman-pass | applied | public package/API decisions need maintainer-grade objections before closure | pass 7 expands the objection ledger; pass 9 revises package identity to a publish-access gate |
| high-risk-deliberate-pass | applied | collaboration package work can corrupt documents, selections, undo, awareness, browser behavior, issue claims, and release packaging | pass 8 expands the pre-mortem, proof plan, rollback/remediation, and no-claim gates |

## High-Risk Deliberate Mode

Pass date: 2026-05-18
Status: complete
Skill: `.agents/skills/high-risk-deliberate-pass/SKILL.md`

Trigger: this plan changes a public package boundary, collaboration behavior,
selection/undo semantics, browser proof, extension substrate usage, migration
path, issue claims, and release gates.

Source evidence:

- `docs/slate-issues/package-impact-matrix.md`: runtime boundary owns the
  majority of issue pressure; selection/focus/DOM bridge and React runtime are
  cross-package risk, not a raw-core-only concern.
- `docs/slate-issues/test-candidate-map/5912-5771.md`: #5771 needs high-QPS
  remote insert versus local selection proof.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md:212`: #5771 remains
  `Improves`, not `Fixes`, until real adapter/browser proof exists.
- `docs/slate-issues/benchmark-candidate-map.md`: historical performance proof
  needs specific workload lanes, not vague "large doc" timing.
- `../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:181-263`,
  `:300-348`: existing browser proof already checks `pageerror`, native drag
  selection, IME, and mobile boundary behavior.
- `../slate-v2/playwright/stress/generated-editing.test.ts:914-1038`,
  `:1128-1148`: stress harness already records native selection text, model
  selection, render budgets, backward selection, IME, undo, and focus proof.

Blast radius:

| Area | Affected surface | Risk |
| --- | --- | --- |
| package source | `packages/slate-yjs` | new public package, exports, peer deps, build, docs |
| raw core | `packages/slate` | operations, transactions, bookmarks, commit metadata, full-document replace |
| React runtime | `packages/slate-react` | external-store cursor hooks, selection side effects, focus/scroll suppression |
| history | `packages/slate-history` | remote history skip, Y.UndoManager coordination, selection restore |
| browser examples | `site/examples`, example route registry | simulation controls become the browser proof surface |
| Playwright | `playwright/integration/examples`, stress helpers | selection bugs only close with browser proof |
| docs/PR/ledgers | walkthroughs, package docs, issue coverage, PR reference | issue overclaim risk |

Pre-mortem and required mitigation:

| Failure | Likely cause | User-visible damage | Required mitigation | Release posture |
| --- | --- | --- | --- | --- |
| CRDT divergence after nested move/split/merge | incremental Y event conversion misses a Slate structural edge | peers display different documents | canonical reconcile fallback, external fixture matrix, batch/separate convergence tests | block release |
| Remote import exports back to Yjs | origin/metadata filtering incomplete | infinite echo or duplicate content | onCommit loop suppression tests and event-log assertions | block release |
| Remote import pollutes local undo | remote metadata/history skip incomplete | undo removes remote changes or corrupts stack | Slate history skip tests plus Y.UndoManager tests | block release |
| Undo restores stale Slate paths | selection metadata stores paths instead of relative ranges | caret jumps or throws after remote edits | Y relative-range metadata, bookmark tests, Playwright undo row | gate public undo/redo |
| Awareness update creates document commit | cursor state stored through Slate value/commit | typing lag, dirty history, false exports | external-store cursor state and commit-count assertion | block React API release |
| Provider lifecycle leaks listeners | connect/disconnect cleanup incomplete | duplicate cursor/events after reconnect | connect/disconnect heap/listener benchmark and cleanup tests | block release |
| Browser selection proof misses real bug | tests only assert model text | #5771-class bugs survive | Playwright rows assert model selection, DOM text, `pageerror`, and follow-up typing | no `Fixes` claim |
| Benchmark passes but real interaction lags | benchmark is core-only calibration | slow browser selection/typing in examples | interaction rows with trace, memory/DOM tags, and native behavior proof | no perf claim |
| Package identity unresolved | final public package name cannot publish or conflicts with the community package | docs/import path churn after implementation | publish-access proof before docs/examples finalize | revise import path before publish |
| Public API too broad | binding/snapshot/origin helpers exposed too early | breaking changes or long-term support burden | internal-first helpers and type tests for only approved public API | block docs until surface matches plan |
| Issue claim overreaches | core substrate proof mistaken for package/browser proof | maintainer trust loss | coverage/PR sync after implementation only; #5771 stays `Improves` until Playwright passes | block claim upgrade |

Expanded proof plan:

| Proof class | Required rows |
| --- | --- |
| Unit/package | mount extension without editor mutation; local export suppression; remote import metadata; conversion fixtures; relative point/range; undo selection metadata; connect/disconnect cleanup |
| Integration | package with `slate`, `slate-history`, and `slate-react`; remote history skip; canonical reconcile; awareness-only update without document commit |
| Browser | two-peer convergence; selected-node removal plus follow-up typing; same-offset contention; select-all/Delete; left-editor type then right-editor Enter; remote cursor awareness; undo/redo after remote insert; no `pageerror` |
| Performance | repaired collab readiness benchmark; five-iteration calibration; interaction trace; memory/DOM tags; cursor count; batch/separate convergence red flags |
| Migration/adoption | docs map external `withYjs` family to extension/state/tx calls; no compatibility aliases unless test-backed; Plate/provider boundary documented |
| Release/package | registry availability for final package name; peer dependency check; no `yjs` dependency leak into raw `slate`; subpath typecheck/build |
| Issue/reference | coverage matrix and PR reference only upgrade issue claims after package + Playwright proof |

Rollback and remediation:

- safe to delete/recreate `../slate-v2/packages/slate-yjs` source during
  implementation because current folder is residue, not source.
- if conversion diverges, keep package internal and fall back to canonical
  reconcile while narrowing public conversion helpers.
- if undo selection restoration fails, ship without public `tx.yjs.undo()` /
  `tx.yjs.redo()` commands.
- if awareness causes document commits, split React cursor hooks from core
  package release until external-store proof passes.
- if package identity fails, revise import path before docs and examples ship.
- if Playwright cannot prove #5771-class behavior, keep issue language at
  `Improves` and do not close the issue.

Verdict: keep the plan. The risk is high, but the plan has the right hard
cuts: no wrapper API, no provider policy, no broad public binding, no issue
closure without browser proof, and no performance claim from a core benchmark
alone.

## Slate Maintainer Objection Ledger

Pass date: 2026-05-18
Status: complete
Skill: `.agents/skills/steelman-pass/SKILL.md`

Architecture overview: raw Slate stays unopinionated and owns the
transaction/commit/bookmark substrate. `slate-yjs` owns Yjs-specific binding
state, relative-position mapping, undo-manager integration, and awareness.
React owns rendering and external-store subscription. Plate owns app/provider
policy.

| Decision | Strongest fair objection | Steelman antithesis and tradeoff | Viable alternatives | Why chosen wins | Adoption/docs/proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Add first-party `slate-yjs` package | "This makes Slate look officially Yjs-only." | Not shipping it keeps raw Slate smaller and avoids maintaining CRDT semantics. The cost is that every app re-learns the same adapter bugs outside the core test system. | leave third-party only; publish docs-only adapter recipe; put Yjs in raw `slate` core | package boundary keeps raw core clean while giving the ecosystem one tested binding | docs must state Yjs is optional; package tests must prove no `yjs` peer leaks into `slate` / `slate-react` | keep |
| Public package name | "Using a scoped name breaks the unscoped Slate package-family feel." | Unscoped would be nicer if Slate owned it, but npm reality wins. A scoped name avoids confusing users and mirrors `@lexical/yjs` / `@y/prosemirror`. | `@slate/yjs`; `@slate-yjs/v2`; keep only internal package; secure ownership transfer for `slate-yjs` | pass 9 proved `slate-yjs` is already published by `BitPhinix/slate-yjs`, so unscoped cannot be the default publish target | implementation must use the final import path only after ownership/scope access is resolved | revise: prefer `@slate/yjs` unless `slate-yjs` ownership is secured |
| Replace `withYjs` wrapper API with `createYjsExtension(...)` | "Existing adapter users already know `withYjs`; changing names increases migration pain." | Keeping wrapper names lowers apparent migration cost but preserves the wrong mental model: editor mutation and lifecycle monkey-patching. | compatibility aliases; wrapper that internally installs extension; dual API | current Slate v2 explicitly rejects wrapper-era extension slots; one public shape avoids two lifecycles | migration docs map old names to new calls; no compatibility alias until tests prove a real adoption need | keep |
| Expose `state.yjs` / `tx.yjs` namespaces | "Simple editor methods would be easier to discover." | Flat methods are easy at first and messy later; they collide with plugins and hide read/write boundaries. | `editor.yjs.connect()`; public binding object; hooks-only API | state/tx namespaces match live extension contracts and keep read/write legality explicit | API docs must show one-page lifecycle recipe; type tests must prove namespace augmentation | keep |
| Keep binding/controller internal first | "Advanced users will need direct binding access for providers, debugging, and instrumentation." | Public binding access helps power users but freezes internals before lifecycle tests settle. | public `YjsBinding`; public debug controller; event emitter | internal-first keeps the first API small; state/tx and hooks cover normal usage | expose debug snapshots through `state.yjs` only when tests prove stable fields | keep |
| Keep provider policy out | "A collaboration package without provider UI feels incomplete." | Provider components speed demos but drag auth, room naming, persistence, reconnection, and product policy into raw Slate. | `YjsProvider` component; room/provider adapter interface; provider examples only | package should accept Y doc/root/awareness and leave hosting to apps/Plate | example wires an in-memory/local provider inline; docs show provider boundary, not a product room abstraction | keep |
| Gate public undo/redo commands | "Users expect undo/redo in any collaboration package." | Shipping commands early is tempting, but wrong selection restoration corrupts trust faster than missing commands. | expose immediately; only expose Y.UndoManager; leave undo to apps | public commands ship only after relative-selection restoration passes unit and Playwright proof | docs can mention internal integration and say command exposure is gated by proof | keep |
| Require Playwright selection proof before issue closure | "This slows package delivery; Node tests cover conversion." | Skipping browser proof gets a faster package and a fake #5771 story. The real failures were browser selection/runtime failures. | Node-only release; manual QA; issue marked improves only | Playwright is the only honest closure gate for selection bugs and Enter/select-all regressions | issue claims stay `Improves` until package/example Playwright proof passes | keep |
| Canonical reconcile fallback | "Full replace can be expensive and may hide bad incremental conversion." | Removing fallback forces all edge cases through incremental conversion but risks unrecoverable divergence. | incremental-only; always canonical; explicit user-triggered reconcile only | fallback is required for reconnect and ambiguous events, but benchmark red flags must prevent overuse | benchmark canonical separately; event log marks canonical path; no production perf claim from fallback | keep |
| Trim snapshot/origin helpers from first public API | "Power users may need snapshots and origin introspection immediately." | Exposing them now makes implementation details contractual before behavior rows exist. | publish helpers now; debug-only exports; internal only forever | release-gated helpers preserve API minimalism while leaving a path if tests prove need | public docs omit them; internal tests can use `./internal`; add later only with behavior proof | keep |
| Full simulation example with many controls | "The example could become a mini app that distracts from the API." | A small demo is easier to read but misses selection, lag, undo, and failure controls. | minimal two-editor example; docs-only controls; separate test harness | the example is also the browser proof surface, so controls are justified if the API call site remains visible | first viewport shows actual setup; controls are dense tool UI; Playwright uses the same controls | keep |
| Conservative issue language | "If core selection stress passes, why not say `Fixes #5771`?" | Aggressive issue claims make the PR look stronger, but they collapse core substrate proof into package/browser proof. | claim fixes now; never mention issue; split issue claims into later PR | conservative language protects maintainer trust and prevents accidental overclaim | PR/reference sync can upgrade only after package plus Playwright proof | keep |

Pass conclusion: the major architecture decisions survive steelman pressure,
but pass 9 revised the package-name decision. The package folder can still be
`packages/slate-yjs`; the public package name must not silently claim
`slate-yjs`.

## Ecosystem Maintainer Pass

Pass date: 2026-05-18
Status: complete
Mode: ecosystem boundary review after live package/source checks.

Source evidence:

- `npm view slate-yjs name version description repository --json`: `slate-yjs`
  exists as `3.2.0`, "Yjs bindings for Slate.", repository
  `BitPhinix/slate-yjs`.
- `npm view @slate/yjs name version description repository --json`: registry
  returned `E404` for `@slate/yjs`.
- `../slate-yjs/package.json`: root package name is `slate-yjs`; workspace
  packages are `@slate-yjs/core` and `@slate-yjs/react`.
- `packages/yjs/package.json`: Plate publishes `@platejs/yjs` and currently
  depends on `@slate-yjs/core`, `y-protocols`, and `yjs`.
- `packages/yjs/src/lib/BaseYjsPlugin.ts:1-170` and
  `packages/yjs/src/lib/withPlateYjs.ts:1-47`: Plate owns provider config,
  Hocuspocus/WebRTC integration, plugin APIs, and wrapper-era `withTYjs` /
  `withTCursors` / `withTYHistory` composition.
- `docs/editor-test-harvester/yjs-collaboration/report.md:12-45`: external
  slate-yjs, y-prosemirror, Yjs, and Lexical evidence is fixture/mechanism
  input, not a drop-in API mandate.
- `docs/solutions/documentation-gaps/2026-04-09-slate-collaboration-docs-must-mark-the-external-adapter-boundary.md:19-41`:
  collaboration docs must name the boundary between Slate substrate and
  adapter/provider ownership.
- `docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md:31-64`:
  collaboration/cursor overlays get model `Range | null`, not raw DOM range
  policy.

Maintainer-facing decisions:

| Surface | Decision | Why |
| --- | --- | --- |
| package identity | create `../slate-v2/packages/slate-yjs`; prefer public name `@slate/yjs`; treat `slate-yjs` as blocked unless ownership transfer/publish access is proven | npm already has `slate-yjs@3.2.0`; docs cannot claim an import path that may not publish |
| external slate-yjs relationship | use as MIT mechanism/fixture evidence; do not present as a compatible fork or drop-in replacement | its public packages are `@slate-yjs/core` / `@slate-yjs/react` and its wrapper model conflicts with Slate v2 extension/state/tx |
| Plate adoption | keep `@platejs/yjs` as provider/product policy; let it migrate internals to the new package only after package tests pass | Plate currently owns provider config, room lifecycle, user callbacks, and product API; raw Slate should not inherit that policy |
| provider ecosystem | no first-party room/auth/provider abstraction in this package | Hocuspocus/WebRTC/local providers are app/Plate choices; package accepts `Y.Doc`, shared root, and awareness |
| docs | write latest-state docs with final import path only; no changelog/migration prose in reference pages | package identity and adapter boundary are user-facing API truth |
| examples | simulation example may use an in-memory/local provider and explicit failure controls; it must show the real extension/state/tx call site | example is proof surface and DX surface, not marketing |
| issue claims | keep #5771 at `Improves` until real package plus Playwright selection proof passes | package naming and architecture evidence do not close a browser selection bug |

Migration contract:

- external `@slate-yjs/core` users get a concept map, not compatibility
  aliases.
- Plate gets a downstream adoption plan: keep `@platejs/yjs` public APIs,
  replace wrapper internals behind its plugin boundary later, and reuse its
  fixture pack as integration proof.
- raw Slate users get a small package: extension factory, conversion helpers,
  relative-position helpers, state/tx namespaces, and React cursor hooks.
- provider users bring their own provider; docs show where to connect it
  without making provider hosting a Slate API.

Release communication rules:

- do not publish docs that import from `slate-yjs` unless the npm package is
  controlled by Slate.
- do not imply the new package supersedes the community package without naming
  the API break plainly in migration docs.
- do not copy external source wholesale; port portable fixtures/mechanics with
  MIT attribution where required.
- do not upgrade issue claims in the PR reference until the final import path,
  package tests, and Playwright rows exist.

Pass conclusion: keep the architecture, revise the package identity. The
ecosystem-safe path is `packages/slate-yjs` as the repo folder and `@slate/yjs`
as the preferred public package name, pending scope/publish access.

## Revision Pass

Pass date: 2026-05-18
Status: complete
Scope: pass-9 contradiction cleanup across package identity, public API,
driver commands, scorecard, pass ledger, and final gates.

Revision findings:

| Area | Problem found | Revision |
| --- | --- | --- |
| current verdict | plan still implied an unscoped first-party `slate-yjs` package | kept repo folder `packages/slate-yjs`; made `@slate/yjs` the preferred public name and `slate-yjs` blocked unless ownership is secured |
| public API examples | imports could drift between folder name and publish name | examples use `@slate/yjs/core` and subpath list uses `@slate/yjs/*` |
| package shape | `package.json` row still treated unscoped name as the target | package row now separates folder name from publish name |
| maintainer objection ledger | old package-name row framed conflict as hypothetical | row now states npm reality and the scoped-name decision directly |
| implementation gates | package filters used a publish name that may change | gates use `--filter ./packages/slate-yjs` so local verification survives final package naming |
| score/pass state | scorecard and pass ledger still described passes 1-9 | scorecard now records passes 1-10 and leaves issue sync/final gates open |
| final gates | package identity language was too soft | final gate requires resolved public identity before docs/examples claim an import |

Revision verdict: the plan is internally coherent enough for issue/reference
sync. No architecture decision changed in this pass; this pass only removed
stale wording and made the package identity rule executable.

## Hard Cuts And Rejected Alternatives

Hard cuts:

- primary `withYjs` / `withYHistory` / `withCursors` wrapper API
- direct `editor.children` assignment
- `editor.apply` or `editor.onChange` override
- extension `register` / `commitListeners`
- storing Yjs objects in Slate document values
- claiming #5771 fixed without package/browser proof
- treating `dist/` residue as source
- publishing or documenting `slate-yjs` as the package name without verified
  ownership/publish access

Rejected:

- current-version external `slate-yjs` compatibility aliases before publish
- product comments/suggestions in `slate-yjs`
- broad provider hosting abstraction
- Yjs-free collaboration claim

## Implementation Phases With Owners

1. Package source scaffold: `../slate-v2/packages/slate-yjs/package.json`,
   `tsdown.config.mts`, `tsconfig.json`, `src/{index,core,react,internal}`.
2. Core binding: extension factory, runtime state, onCommit export, remote
   import, lifecycle, loop suppression.
3. Conversion: Slate nodes/ops <-> Y.XmlText/Y delta, with canonical fallback.
4. Positions: Slate point/range <-> Y relative position/range.
5. Undo/history: Y.UndoManager integration and selection metadata.
6. Awareness/react: cursor state store, selector hooks, decoration helpers.
7. Example: full simulation controls and event log.
8. Playwright: selection/browser regression suite.
9. Docs: package README/library page and collaborative editing walkthrough.
10. Ledgers/PR reference: issue claims and proof rows.

## Fast Driver Gates

Planning-only gate:

- cwd: `/Users/felixfeng/Desktop/repos/plate-copy`
- `bun run completion-check -- --id 019e3967-668f-7f20-89e9-c6d3be500b9a`

Slate v2 implementation gates:

- cwd: `/Users/felixfeng/Desktop/repos/slate-v2`
- `bun install`
- `bun --filter ./packages/slate-yjs test`
- `bun --filter ./packages/slate-yjs typecheck`
- `bun --filter ./packages/slate-yjs build`
- `bun test ./packages/slate/test/collab-adapter-extension-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts ./packages/slate/test/collab-bookmark-position-contract.ts ./packages/slate/test/collab-canonical-reconcile-contract.ts ./packages/slate-react/test/selection-side-effect-policy-contract.ts`
- `bun run bench:core:collab-readiness:local`
- `SLATE_COLLAB_READINESS_ITERATIONS=5 bun run bench:core:collab-readiness:local`
  after the calibration benchmark runs once cleanly
- `bun typecheck:site`
- `playwright test playwright/integration/examples/yjs-collaboration.test.ts --project=chromium`
- `playwright test playwright/integration/examples/yjs-collaboration.test.ts --project=chromium --trace=on`
  for the first browser-selection proof artifact
- `bun check`

## Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.85 | React research page; cursor hooks target; pass 6 adds interaction, memory/DOM, trace/RUM gates; pass 8 adds awareness/selection failure gates; no implementation proof yet |
| Slate-close unopinionated DX | 0.90 | current state/tx extension contracts; raw Slate ownership boundary; first API trimmed; steelman pass accepts namespace/API shape; revision pass removes publish-name ambiguity from API examples |
| Plate and slate-yjs migration-backbone shape | 0.90 | external slate-yjs mapping; Plate owner boundary; package target; shim boundary explicit; ecosystem pass proves Plate provider policy stays downstream and package identity must be scoped/resolved |
| Regression-proof testing strategy | 0.87 | concrete unit/browser matrix; pass 6 adds TDD red rows and native behavior contract; pass 8 adds pre-mortem and rollback/remediation gates; Playwright not implemented yet |
| Research evidence completeness | 0.92 | live Slate source, external slate-yjs, Lexical-Yjs, y-prosemirror, harvest report, dedicated compiled source page, npm/package identity checks, synced issue/reference rows |
| shadcn-style composability and hook/component minimalism | 0.85 | example/control plan and React hook target; pass 6 keeps helpers subordinate to API visibility; steelman pass accepts full controls only as proof surface |
| total | 0.92 | passes 1-12 complete; planning lane is ready for user review and later execution |

Why not higher:

- benchmark is core-only calibration and not package/browser proof
- no package source exists
- Playwright proof is not implemented
- public package identity is revised but not yet proven with publish access

## Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | live package residue, Slate API changes, focused tests pass, benchmark pass, reference source scan | recreated plan around package implementation and current APIs | package absent; example and Playwright proof absent | ralplan |
| 2. Related issue discovery | complete | local issue ledgers, coverage matrix, fork dossier, PR reference, test-candidate map, requirements/package-impact docs | confirmed #5771/#5533/#1770/#3741 posture; added #4178 sync gap plus adjacent #2288/#4477/#3715/#3482 decisions | #4178 gap resolved in pass 3 | ClawSweeper/ralplan |
| 3. Issue-ledger pass | complete | coverage matrix, fork dossier, pass-2 discovery | added explicit related/non-closure #4178 rows; finalized current issue wording | later PR-reference sync after API/proof finalization | ralplan |
| 4. Intent/boundary and decision brief | complete | intent-boundary pass, decision brief pressure table | hardened provider scope, public binding exposure, undo/redo gate, source-metadata non-claim, migration boundary | none for planning | ralplan |
| 5. Research/ecosystem/live-source refresh | complete | new compiled Yjs collaboration binding source page; live line refs for Slate v2, external slate-yjs, Lexical Yjs, y-prosemirror | closed research compile gap and strengthened steal/reject/diverge synthesis | none for this pass | ralplan |
| 6. Performance/DX/migration/regression/simplicity pressure | complete | performance rule files, current benchmark source, package patterns, Playwright examples/stress helpers, DOM selection performance solution | added cohort/repeated-unit/trace/RUM/native gates; trimmed first public API; added TDD red rows and migration boundaries | package/browser performance proof still pending | ralplan |
| 7. Maintainer objection ledger | complete | steelman-pass rows for package scope, name, wrapper cut, state/tx namespaces, binding exposure, provider boundary, undo/redo, Playwright proof, canonical reconcile, helper trimming, example controls, issue claims | accepted current decisions; later pass 9 revised package identity | package implementation proof remains | steelman-pass |
| 8. High-risk deliberate mode | complete | package-impact matrix, #5771 test candidate, benchmark candidate map, issue coverage row, browser/stress proof lanes | expanded pre-mortem, blast radius, proof plan, rollback/remediation, and no-claim gates | implementation proof still pending | high-risk-deliberate-pass |
| 9. Ecosystem maintainer pass | complete | npm package identity checks, external slate-yjs package names, Plate `@platejs/yjs` package/source, harvester report, collaboration docs boundary, DOM-selection learning | revised public package identity; kept Plate/provider policy downstream; added release communication rules | final import path still needs publish-access proof | ralplan |
| 10. Revision pass | complete | package identity/API scan, command filter scan, score/pass-state scan, final-gate scan | cleaned unscoped-name contradictions, package filter commands, scorecard, pass ledger, and final gates | issue/reference sync still pending | ralplan |
| 11. Issue sync accounting | complete | coverage matrix, v2 sync ledger, fork issue dossier, PR reference | kept #5771 `Improves`, kept #5533/#1770/#3741/#4178 related/non-closure, synced package identity caveat | none for issue sync | ralplan/ClawSweeper |
| 12. Closure score/final gates | complete | pass ledger, issue/reference sync, scorecard, final completion gates | reclassified package identity, package source, and Playwright rows as execution gates, not planning blockers; benchmark drift is resolved | implementation remains for later execution | ralplan |

Ralplan status: done. The next autonomous owner is implementation execution,
not another planning pass.

Plan status remains pending for user review or Ralph implementation. That is
intentional: the planning pass loop is closed, while package implementation and
browser proof are the next execution lane.

## Plan Deltas From This Review

Added:

- stale package-residue finding
- stale extension API finding
- benchmark API drift finding and resolution
- package-first verdict
- current public API target
- public API simplification after pass 6 pressure
- full example controls
- browser selection proof matrix
- performance cohort/interaction/memory/native behavior gates
- maintainer-grade steelman ledger
- package identity publish-access gate
- npm conflict for `slate-yjs`; preferred public package identity is now
  `@slate/yjs` pending Slate scope/publish access
- high-risk pre-mortem, proof plan, rollback/remediation gates
- ecosystem maintainer release communication rules
- issue/reference sync for #5771, #5533, #1770, #3741, #4178, and the PR
  reference

Dropped:

- old "do not create package yet" verdict
- old `register` / `commitListeners` adapter examples
- implicit compatibility with external wrapper API
- unscoped `slate-yjs` as the default public package name

Strengthened:

- Playwright selection proof is mandatory
- #5771 remains `Improves` until package/browser proof exists
- package must hard-cut `dist` residue into real source
- #4178 is related source-metadata pressure; do not overclaim it from adapter
  origin tags. The coverage-matrix and fork-dossier rows are explicit related
  non-closure entries.
- first public API does not include snapshot or origin helpers until behavior
  rows prove them
- package/provider/API naming objections are resolved for planning, not deferred
  to implementation
- high-risk pass makes issue-claim, package-name, awareness, undo/redo, and
  canonical-reconcile failure handling explicit
- package identity is no longer a soft release check: `slate-yjs` is occupied,
  so docs/import paths must use the resolved final name only
- PR reference now records package readiness without changing fixed issue
  counts or overclaiming #5771 as fixed

Unchanged:

- raw Slate stays unopinionated
- Yjs and awareness stay package-owned
- Plate product collaboration stays out of raw package

## Open Questions And What Would Change The Decision

- If live issue discovery finds a current maintainer comment that asks for a
  different issue claim, update the issue matrix.
- If repeated benchmark calibration exposes a core performance cliff, package
  start should first fix the core/benchmark blocker.
- If Yjs relative position conversion cannot preserve Slate bookmarks across
  nested move/split/merge, narrow the public cursor/undo API until it can.
- If Playwright cannot prove browser selection stability, do not claim #5771
  fixed.
- If Slate cannot publish `@slate/yjs`, revise the public import path before
  package docs, examples, or PR references claim a final import.

## Final User-Review Handoff Outline

Accepted decisions by surface:

- package source shape: recreate `../slate-v2/packages/slate-yjs` as source;
  keep repo folder name, but use final public package identity only after
  publish access is resolved.
- public API: prefer `@slate/yjs` with `./core`, `./react`, and `./internal`;
  expose extension factory, conversion helpers, relative-position helpers,
  `state.yjs`, `tx.yjs`, and React cursor hooks.
- internal binding/runtime: extension-owned binding state, `setup`,
  `onCommit`, remote import through `editor.update`, no editor monkey-patches.
- conversion and canonical reconcile: incremental conversion first, canonical
  `tx.value.replace(...)` fallback for ambiguous/reconnect states.
- undo/history: Y.UndoManager integration with relative-selection metadata;
  public undo/redo commands ship only after selection restoration proof.
- awareness/react hooks: awareness stays outside document commits; React hooks
  use narrow external-store subscriptions.
- example controls: full simulation tool with peer lifecycle, network failure
  controls, event log, selection JSON, cursor controls, undo/redo, and
  reconciliation actions.
- Playwright regression rows: selection bugs require browser proof, including
  #5771-class selected-node/follow-up typing, same-offset contention,
  select-all/Delete, Enter crash, cursor awareness, and undo rows.
- issue claims: #5771 remains `Improves`; #5533, #1770, #3741, and #4178 stay
  related/non-closure until implementation proof exists.
- hard cuts: no wrapper API, no direct `editor.children`, no `apply` /
  `onChange` overrides, no provider hosting policy, no Yjs-free collaboration
  claim, no unowned `slate-yjs` public package claim.
- verification gates: package test/typecheck/build, focused core collab tests,
  current collab benchmark, site typecheck, Playwright yjs-collaboration
  proof with trace, then `bun check`.

## Closure Score/Final Gates Pass

Pass date: 2026-05-18
Status: complete

Closure verdict: done for Slate Ralplan planning. Not done for implementation.

Final-gate accounting:

| Gate | Status | Evidence |
| --- | --- | --- |
| all pass-state rows complete | complete | passes 1-12 complete in this plan and completion state |
| related issue discovery and issue-ledger sync | complete | related issue pass, issue-ledger pass, and issue-sync accounting pass |
| PR reference and coverage matrix sync | complete | PR reference, coverage matrix, v2 sync ledger, and fork dossier updated in pass 11 |
| collab benchmark | complete core calibration | `bun run bench:core:collab-readiness:local` passes in `../slate-v2`; package/browser performance proof remains separate |
| public package identity | execution gate | plan records `slate-yjs` occupied and prefers `@slate/yjs` pending publish access |
| package source | execution gate | plan records package source absent and gives package source scaffold phase |
| Playwright proof | execution gate | plan records required browser proof rows and no issue closure until they pass |
| score threshold | complete | total `0.92`, no dimension below `0.85` |
| final handoff | complete | accepted decisions listed above |

Reasoning: Slate Ralplan is a planning/review gate. The remaining unmet facts
are exactly the build work this plan hands to a later execution owner. Keeping
the hook pending would be fake rigor; it would only ask the next pass to repeat
the same conclusion.

## Final Completion Gates

Closed for planning:

- every pass-state row is complete with evidence
- related issue discovery and issue-ledger sync are complete
- PR reference and coverage matrix are updated
- goal-continuation audit revalidated the current Slate API, package residue,
  registry identity, local reference packages, focused collab tests, and
  current collab benchmark
- collab benchmark stale API blocker is resolved; package/browser performance
  proof remains an execution gate
- public package identity is recorded as an execution gate
- final score is `0.92` with no dimension below `0.85`
- final handoff is emitted in this document
