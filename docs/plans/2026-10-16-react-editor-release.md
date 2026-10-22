---
review_scopes: [react, collaboration]
review_basis: [2026-10-04-react-audit-2, 2026-10-04-collaboration-audit]
verdict: pursue
work_kind: implementation
review_commit: 0a5cb4f411c51a22bd494a908915b9f073fc2734
review_inputs: [packages/plitejs/src/react/hooks/use-editor.ts, packages/plitejs/src/react/hooks/use-plite-annotation-store.tsx, packages/plitejs/src/react/range-geometry.ts, packages/plitejs/src/react/components/plite.tsx, packages/plitejs/src/create-editor.ts, packages/plitejs/src/core/plugin.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/yjs/core/plugin.ts, packages/plitejs/src/yjs/core/controller-registry.ts, packages/plitejs/src/yjs/core/controller.ts, packages/plitejs/test/react/provider-hooks-contract.tsx, packages/plitejs/test/yjs/admission-lifecycle-contract.spec.ts, packages/platejs/src/react/editor/useCreateEditor.ts, packages/platejs/src/yjs/react/YjsPlugin.tsx, packages/platejs/src/features/comments/BaseCommentsPlugin.ts, packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx, apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx, apps/www/src/registry/examples/collaboration-demo.tsx, content/docs/(plugins)/(collaboration)/yjs.mdx, content/docs/plite/libraries/plite-yjs.mdx, docs/vision/plite.md, docs/plans/2026-09-14-collaboration-lifetimes.md, docs/research/decisions/collaboration-ownership.md]
review_upstreams: ['../slate-yjs@69f3e0eaecc0b81049dc57e70403df60e7a10163', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7']
---

# React: a component-owned editor releases what it holds

Status: executed: waiting on your commit, with one review finding left open
Playbook: plan

**Pursue.** A `useEditor` component whose plugins include `yjs()` binds the shared `Y.Doc` while React renders and never lets go. Unmounting and mounting again on the same document throws `Yjs namespace "document" already has an independent binding`, with or without Strict Mode, and so do a `deps` change and a mount render that Suspense throws away (`docs/plans/artifacts/react-editor-release/base-release-probe-a8.log`, from this worktree's run directory). The strongest reason is ownership. Plite runs every plugin's `activate` and `afterPublish` inside `createEditor`, `useEditor` calls `createEditor` during render, and no owner ever releases a constructor plugin, so the Vision promise that `useEditor` "owns one editor for a component lifetime" is false for any plugin that holds something outside the editor. The pursued direction is that a component-owned editor takes nothing outside itself until React commits it, and gives everything back when that component unmounts or replaces it. The next owner is the Plan playbook on this file, which ran `architect` because the fix changes the plugin lifecycle contract and adds a public release.

**Plan.** All three `architect` runners reached one shape, and the plan builds it under the Build playbook (`.agents/playbooks/build.md`). A component hook builds a dormant editor in render: every plugin activates in memory as today, but nothing outside the editor is touched. React's commit starts it, and only then do plugins take outside resources, through one new activation hook, `acquire`. A real unmount or a replacement stops it in the same commit and destroys it right after. On a live editor, acquisition runs inside the publication's prepare step, right after the last `beforePublish`, so a failed take still rolls the publication back. `createEditor` stays live on return and gains `editor.destroy()`, so a headless owner can end it too. Yjs builds its controller, claims the namespace and attaches its listeners inside `acquire`. An editor-local binding service built in `activate` answers render-time reads and keeps subscribers until a controller attaches. Admission waits until the editor is both published and attached, and the namespace registry keeps the claim until teardown finishes. `EditorRoot` remounts its inner component when the runtime changes and starts the editor before any view's layout effect. The owner destroys an editor only after its passive cleanups run. Plate's `useCreateEditor` uses the same owner. The design record is `docs/plans/artifacts/react-editor-release/architect/synthesis.md` in this worktree's run directory, as revised by plan panel rounds 1 and 2.

## Brief

### What will change?

A collaborative editor can now unmount and mount again on the same shared document without crashing, including after a page change, an editor rebuild or a React retry. It is built and reviewed, and waits for your commit.

### What could go wrong?

Unmounting now cancels pending uploads. Plate's change callbacks can report the shared document loading twice in development, or miss it. An editor that a plugin ends from its own teardown may tear down out of order.

## Teach

When a Plite editor is built, each plugin starts up and may grab things that live outside the editor. The Yjs plugin grabs the most. It claims one slot in the shared document so no second editor can write there, starts listening to that document, and may even write the first content into it.

In React, the editor hook builds the editor during render. Render is supposed to be a dry run: React can throw it away, run it twice, or redo it later. Today nothing ever tells the editor its component is gone, so the Yjs claim stays forever, and the next editor on the same document is refused.

The plan makes React's commit the moment the editor goes live, and the component's real unmount, or its replacement, the moment it gives everything back. A render React throws away then grabs nothing.

## Public API

A component call site stays the same; what changes is that its editor lets go of the document when the component unmounts.

```tsx before
// apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx (shape)
const editor = useEditor({
  initialValue,
  plugins: [yjs({ awareness, doc: provider.document, initialReady })],
});
// Unmounting and mounting this component again on the same provider throws.
```

```tsx after
// apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx (shape)
const editor = useEditor({
  initialValue,
  plugins: [yjs({ awareness, doc: provider.document, initialReady })],
});
// The component's unmount releases the binding; the next mount binds again.
```

A headless owner ends its editor, which frees the document for the next one.

```ts before
// packages/plitejs/test/yjs/support/collaboration.ts (shape)
const editor = createEditor({ initialValue });
const uninstall = editor.install(yjs({ doc, initialReady: true }));
uninstall(); // the only release; a constructor plugin has none
```

```ts after
// packages/plitejs/test/yjs/support/collaboration.ts (shape)
const editor = createEditor({ initialValue, plugins: [yjs({ doc, initialReady: true })] });
editor.destroy();
```

A plugin that holds something outside the editor takes it in `acquire`, which a render React throws away never runs.

```ts before
// packages/plitejs/src/yjs/core/plugin.ts (shape)
activate({ onCleanup }) {
  const lease = claimYjsNamespace(doc, rootName, owner, factoryToken);
  controller.initializeCanonicalState();
  onCleanup(() => lease.release('dispose'));
}
```

```ts after
// packages/plitejs/src/yjs/core/plugin.ts (shape)
activate({ acquire, afterPublish }) {
  acquire(() => {
    const lease = claimYjsNamespace(doc, rootName, owner, factoryToken);
    const controller = lease.reused ? current : buildAndAttachController(); // releases the lease if it throws
    return ({ reason }) => {
      // The registry checks the lease is still current, runs teardown, then frees the namespace.
      lease.release(reason === 'rollback' ? 'rollback' : 'dispose', () => controller.destroy());
    };
  });
  afterPublish(() => markPublished()); // admission runs once published and attached
}
```

## What other editors do

The explorer read slate-yjs, y-prosemirror, Lexical and Tiptap at the revisions in `review_upstreams` (source only, nothing run). In slate-yjs, classic y-prosemirror and Lexical, nothing acquires a document binding during React render, and none of the three holds an exclusive claim on a document namespace. Tiptap builds its editor and view in render; its `@tiptap/y-tiptap` sync package was not traced.

| Editor | When the binding starts listening to the document | Who releases it | A render React throws away |
| --- | --- | --- | --- |
| slate-yjs | `YjsEditor.connect(editor)` in an effect; `withYjs` at construction attaches nothing | `disconnect` in the effect cleanup | attaches nothing |
| y-prosemirror (classic `ySyncPlugin`) | the plugin view's `initView` when the `EditorView` mounts | the plugin view's `destroy` | allocates a binding object with no observers |
| Lexical (`CollaborationPlugin`) | an effect creates the binding and its observers | the effect cleanup destroys the binding and disconnects | creates nothing |
| Tiptap (`useEditor`) | the editor and its ProseMirror view are built in render through an instance manager | a scheduled destroy, cancelled when the component mounts or an effect rehearsal reruns | destroyed later by the scheduled timer |
| Plite today | `activate` and `afterPublish` inside `createEditor`, during render | nothing for a constructor plugin | claims the namespace, observes the document and may seed it |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Editor lifetime: dormant, live, released, destroyed; `editor.destroy()` | Plite | `plitejs` root (`src/core/editor-lifetime.ts`, `src/create-editor.ts`) | Every editor, headless or React, needs one way to end; the root owns plugin records |
| `acquire` on the plugin activation context | Plite | `plitejs` root (`src/core/plugin.ts`, `src/interfaces/editor.ts`) | Outside resources need a step a dormant editor can skip and a release that always runs |
| Component owner handle: build dormant through an explicit internal option, retire, start, release, destroy | Plite | `plitejs/internal` (headless, no React import) | Plite `useEditor` and Plate `useCreateEditor` share one ordering algorithm; `plitejs/internal` is the one bridge Plate may import; an explicit option makes only the editor the hook builds dormant, never an editor a plugin or `initialValue` builds inside it |
| `useEditor` wires the handle to React effects | Plite | `plitejs/react` | React owns render and commit timing |
| `EditorRoot` remounts its inner component by runtime identity, and the inner component's first child subscribes the change callbacks, then starts the editor, in its layout effect | Plite | `plitejs/react` | Descendant layout effects run before the owner hook's, so a view would otherwise act on a dormant editor; Plate's root already self-keys |
| `useCreateEditor` wires the same handle | Plate | `platejs/react` | Plate inherits the Plite lifetime instead of copying it |
| Yjs claim, listeners and admission in `acquire` | Plite | `plitejs/yjs` | The binding is the plugin that holds outside resources |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Collaboration admission | A component editor admits the shared document in the commit's layout phase instead of during render | jsdom Vitest contract in `packages/plitejs/test/react`; hand drive of `/examples/plite/yjs-collaboration` in Chromium |
| Remount on one document | Unmount, Strict Mode, `deps` change and a Suspense retry all mount again | jsdom Vitest contract, red at base |
| Selection and focus | `EditorRoot` starts the editor before any view's layout effect, so `autoFocus` and the selection mount see an admitted document | React case with `Editable autoFocus` over a Yjs editor whose document already holds content, where nothing throws and the selection survives admission; existing Plite React and Yjs awareness suites |
| Mount latency | A collaborative component editor renders once more before paint, an accepted cost | Benchmark performance pack: mount latency and render count of a 1,000-block Yjs document whose `initialValue` is one empty paragraph, base against head; the budget is one extra render and a head median at most 1.5 times base |
| Change callbacks | Admission now commits after the view mounts, so `onCommit` and `onValueChange` see the admission commit of a loaded document; the callback subscription moves into the start gate, subscribes before the start, and keeps its delivered version across effect disconnection, resetting only for a new runtime | React cases that assert each fires once for it under Strict Mode, Activity reveal and a following `autoFocus` commit |

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Editor end | none; constructor plugins never deactivate | `editor.destroy()`: release, deactivate every record with reason `remove`, then refuse `update` and `install`; an uninstall handle called after `destroy` does nothing; a view editor's `destroy` ends the runtime it views; only the document snapshot stays readable, plugin reads may throw | `plitejs` root | headless owners and framework adapters must free shared resources | new method, no caller breaks | headless contract test, including uninstall after `destroy` | a view mounted on a destroyed editor; code that writes after unmount now throws | rearchitect |
| Outside resources | taken in `activate` during construction | `acquire(take)`: on a live editor every take runs inside the publication's prepare step, right after the last `beforePublish`, in both `createEditor` and the `update`/`install` transaction, so a throw in that step rolls the publication back and releases takes newest first; one guard shared by both drivers refuses an editor update inside a take; on a dormant editor takes run at start, and a start whose take throws releases the earlier takes newest first, returns the editor to dormant so a later start can retry, and rethrows; a plugin's work that needs every take, such as Yjs admission, runs after the last take succeeds, in `afterPublish` on a live editor and right after the take loop at start; each release gets the cleanup reason, runs once, and a release that throws does not stop the others | `plitejs` root | a render React throws away must take nothing, and no outside write may precede an accepted publication | Yjs migrates; no other first-party plugin takes outside resources in `activate` (explorer census) | headless contract test; dormant Yjs build adds no listener and no `doc.share` key | a third-party plugin keeps using `activate` and leaks | rearchitect |
| Component editor lifetime | built live in render, never ended | dormant in render; started by the first child of `EditorRoot`'s inner component in its layout effect, and by the owner hook's layout effect for an editor rendered without a root; every start first stops each retired editor still holding resources, from one module-level list; the owner's layout cleanup stops a retired editor; the owner's passive cleanup destroys it in a microtask; the insertion cleanup retires the editor, stops it in a microtask when its layout effect is already disconnected, and destroys it there only when its passive effect is also disconnected (a hidden Activity deleted), never when only layout is disconnected (a Suspense boundary that hid shown content); the insertion cleanup does not stop the editor itself, because a stop notifies React subscribers and awareness listeners, and React warns when an insertion effect schedules an update; a headless `createEditor` does not drain the list, so binding a document that a hidden, deleted component still holds throws until its microtask runs | `plitejs/internal` handle, wired by both hooks and `EditorRoot` | measured React order makes insertion cleanup the only real-end signal, descendant layout effects run before the owner's, and Suspense keeps passive effects connected while hiding (`react-dom-client.development.js:16142`) | `useEditor`, `useCreateEditor` and `EditorRoot` internals; call sites unchanged | React contract tests, red at base, including hidden Activity and re-suspended Suspense deletion outside `act` | one extra render before paint for Yjs | rearchitect |
| `EditorRoot` replacement | throws when its editor changes; the caller remounts it with a key | split into an outer and an inner component, as Plate's root does; the outer keys the inner by runtime identity, and the replacement check is deleted because the key makes it unreachable | `plitejs/react` | the original `deps` reproduction is unkeyed, the check runs in `EditorRoot`'s own body (`plite.tsx:214`), and `key={editor.id}` fails for a caller-chosen stable id | internal | the unkeyed `deps` case from the base probe | none | rearchitect |
| Yjs binding | claim, controller and listeners in `activate`; admission in `afterPublish`; lease freed before teardown | `activate` gets an editor-local binding service with a stable identity, keyed by binding and editor like today's controller map, so a reused-lease replacement keeps it and only the lease's final release frees it: the admission status and its subscribers, the cursor cache and its subscribers, and the active-controller slot. While dormant or released it reports waiting for load and no cursors, holds cursor data and publishes it once every plugin's take has succeeded, and ignores selection writes, view releases and retries; once attached it forwards to the controller. Hooks, geometry owners, the plugin APIs and `on.commit` read only the service, and a commit with no attached controller writes nothing. The awareness adapter clears only presence it published. The take claims, then reuses the controller on a reused lease or builds and attaches a new one, snapshotting the shared-effect log and subscribing together; a throw inside the take releases its claim; admission runs once the editor is both published and attached. The registry's `release(reason, teardown)` returns before teardown for a stale lease and for a reused lease's rollback, which restores the previous lease; otherwise it runs teardown, then frees the namespace. `controller.destroy()` runs every teardown step even when one throws, then reports the collected errors | `plitejs/yjs` | one owner per namespace stays loud; no render-time shared writes or authority checks; no event lost between snapshot and subscription; render-time reads keep answering | `plugin.ts`, `controller.ts`, `controller-registry.ts`, `useYjs.ts`, Plate `YjsPlugin.tsx` | existing Yjs suites plus dormant, destroy, compaction `deps` change, failed-publication, reused-lease replacement and rollback, throwing teardown and released-commit cases | first render reports waiting | rearchitect |
| Strict Mode getter in `useEditor` | builds one editor per memo | deleted; the handle tolerates two dormant builds | `plitejs/react` | dormant builds take nothing, so a second one is harmless | internal | Strict Mode React case | none | cut |
| Docs that say a new editor cannot bind a held namespace | taught as a limit | teach that one live editor holds a namespace, that unmount and `editor.destroy()` free it, and that an editor hidden by Activity keeps it | Plate Docs | the limit now applies only to two live editors | `yjs.mdx`, `react-hooks.mdx`, their Chinese twins, Plite plugin and Yjs pages, the `useCreateEditor` JSDoc | `plate-docs` checks | stale copy elsewhere | rearchitect |

## Scope

The plan changes the Plite editor lifetime, `acquire`, `editor.destroy()`, the component owner handle, Plite `useEditor`, `EditorRoot`'s replacement and start, Plate `useCreateEditor` and its JSDoc, the Yjs binding and its namespace registry, the `beforePublish` JSDoc that tells authors where outside resources go, the Vision rules for editor creation and Yjs, the docs pages that teach the old limit, the Yjs collaboration example's remount control, and a changeset for `plitejs` and `platejs`.

The module-level history replay maps, the AI chat session's own lifetime and one shared owner for the render-owned disposables predate this change and go to Open work. The owner handle follows the annotation store's reading of the Vision rule (`use-plite-annotation-store.tsx`): survive Strict Mode rehearsal, end on a real replacement or unmount.

## Steps

Phase 1, Plite core and Yjs. Keep when every proof below passes; revert the phase otherwise.

- [x] Add the editor lifetime, `acquire` inside the prepare step right after the last `beforePublish` in both `createEditor` and the `update`/`install` transaction, and `editor.destroy()`, and rewrite the `beforePublish` and `onCleanup` JSDoc. Proof: a headless contract test in `packages/plitejs/test` shows that a take runs at `createEditor` after every `beforePublish`, and that a take on a replaced record runs before the old record's cleanup. It also shows the take never runs when a later `beforePublish` throws, and that a throwing take, in `createEditor` and in `editor.install`, rolls the publication back, releases the earlier takes newest first, and leaves the document version and the registry unchanged. A dormant editor's start whose take throws releases the earlier takes, returns the editor to dormant and rethrows. It shows each release runs exactly once by `destroy` and by install cleanup, that a throwing release does not skip the others, that `update` and `install` throw after `destroy`, and that an uninstall handle called after `destroy` does nothing.
- [x] Add the editor-local Yjs binding service in `activate` and move every controller lookup onto it; move the controller build, claim, listeners, readiness and awareness subscriptions into the take; keep admission behind published-and-attached; give the namespace registry `release(reason, teardown)`; make `controller.destroy()` run every step despite errors. Proof: the existing `packages/plitejs/test/yjs` suites pass, plus one case each for:
  - a dormant build adds no document listener, no `doc.share` key and no update;
  - `createEditor`, `destroy`, `createEditor` on one document binds twice;
  - a later plugin's throwing `beforePublish`, and a throwing take during `editor.install`, leave the document's state vector unchanged;
  - reused-lease replacement through `editor.update.plugins.reconfigure` keeps the controller and the binding service, so an admission subscriber and a cursor subscriber added before it still hear updates; its rollback restores the previous lease, and the incumbent keeps one `afterTransaction` listener and still syncs;
  - a later take that throws after Yjs attached leaves a pre-existing awareness selection unchanged and makes no awareness write;
  - a throwing readiness subscriber, and a throwing unsubscribe at teardown, leave no old listener, so the next editor binds with exactly one `afterTransaction` listener;
  - on a dormant and on a released editor, the admission status, the presence API and the cursor reads answer waiting or none, cursor data, selection writes, view release and import retry do not throw, cursor data set before start is published after it, a subscriber added before start hears admission after it, and a commit writes nothing and does not throw;
  - a dormant editor's start whose later take throws leaves the document's state vector unchanged, and a second start binds;
  - a live shared effect pushed between the dormant build and the start is not replayed, as for any peer that joins after it, and later effects arrive;
  - a commit on a released editor writes nothing to the document and does not throw.
- [x] Add the owner handle to `plitejs/internal`, build dormant through an explicit internal option, wire Plite `useEditor`, split `EditorRoot` into an outer component that keys an inner one by runtime identity, and start the editor in the inner component's first child's layout effect; delete the getter. Proof: a Vitest contract in `packages/plitejs/test/react`, run red at base with `tooling/scripts/proof-worktree.mjs --expect-fail`. Each case on one `Y.Doc` mounts cleanly with exactly one `afterTransaction` listener:
  - unmount, Strict Mode unmount, and a Suspense-discarded mount;
  - the base probe's unkeyed `deps` change, and the same change outside `act` with real scheduling;
  - a `deps` change with `sharedEffectCompaction`;
  - deleting a hidden Activity, with and without a same-commit mount on the same document;
  - deleting a Suspense boundary that hid already-shown content, outside `act`, with a child cleanup that updates the editor;
  - the three Yjs cursor and admission hooks render on a dormant editor;
  - a second live owner on one document throws to an error boundary, while the first keeps syncing and no claim leaks; with the boundary between the owner and `EditorRoot`, the first owner unmounts, the boundary resets and the same editor binds;
  - `onCommit` and `onValueChange` fire once for the admission commit on a loaded document, under Strict Mode, after an Activity hide and reveal, and when an `autoFocus` selection commit follows admission;
  - a `deps` change inside a hidden Activity leaves the new editor dormant until reveal and frees the old editor's claim;
  - `Editable autoFocus` over a document that already holds content keeps its selection after admission;
  - no child cleanup sees a destroyed editor.

Phase 2, Plate. Keep when its proof passes.

- [x] Wire Plate `useCreateEditor` and its `buildEditor` to the same handle through the explicit internal option. Proof: a Plate React spec on one document, red at base, covers what Plate wires itself. An `id` change under Strict Mode replaces the editor, and the new editor paints a remote selection it found when it started. `enabled: false` ends the previous editor. Mount, unmount and a Suspense-discarded mount run through the same owner that the Plite contract proves. Plate `YjsPlugin.tsx` keeps reading `remoteCursors` from the plugin API, which the binding service answers. Plate's `EditorRoot` callbacks keep their own subscription to the supplied editor, because Plite's view callbacks deliver the authored preview's projected commit rather than the stored one; moving that subscription before the start is open work.

Phase 3, law, teaching and cost.

- [x] Update `docs/vision/plite.md` (editor creation, plugin lifetime and Yjs rules) and run `best-api repair`. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [x] Rewrite the docs and the `useCreateEditor` JSDoc that teach the old limit, and add `acquire` and `destroy` where plugin lifetime is taught, through `plate-docs`. Proof: `plate-docs` checks and a preview of each changed page.
- [x] Add the changeset through `changeset`. Proof: the changeset check. `.changeset/plite-plugin-acquire.md`, `.changeset/platejs-use-create-editor-lifetime.md` and the two amended changesets; decision-log line 38.
- Moved to Open work: Measure mount latency of a large Yjs document, base against head, through Benchmark's performance pack. Proof: its comparison log; more than one extra render, or a head median above 1.5 times base, reopens Phase 1. Renders: `docs/plans/artifacts/react-editor-release/bench/base-renders-a1.log` 2 per mount, `docs/plans/artifacts/react-editor-release/bench/head-renders-a1.log` 3 per mount. Timing got no paired run on a heavily loaded host (load 43 to 200 on 18 cores), so the step moved to Open work under suggested task `t_27d327a0`.
- [x] Add a remount control per peer to `/examples/plite/yjs-collaboration`, then hand drive it in Chromium. Both peers load, type, remount and keep typing. Proof: `hand-drive.mjs check` and a read screenshot. `docs/plans/artifacts/react-editor-release/drive/hand-drive-check-a1.log` covers all 12 cells; `docs/plans/artifacts/react-editor-release/drive/yjs-peer-b-remounted-typed.jpg` shows all four peers with the text typed after Peer A's remount and Peer B's two remounts.

## Proof

- `cd packages/plitejs && bun run test:react test/react/<new contract>.test.tsx` and the Yjs and headless suites through `pnpm --filter plitejs test`.
- `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck`.
- The red-at-base runs through `tooling/scripts/proof-worktree.mjs --expect-fail`.
- The mount-latency comparison through Benchmark.
- `pnpm lint:task` on the task's files last.

### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Base controls fail today for every behavior step | yes | Phase 1: `docs/plans/artifacts/react-editor-release/build/base-red-react-a1.log`, 14 of 14 fail at base. Phase 2: `docs/plans/artifacts/react-editor-release/build/base-red-plate-a1.log`, both cases fail at base |
| `blast-radius` before code moved | yes | `docs/plans/artifacts/react-editor-release/blast/writeup.md` |
| Each slice frozen before the next | yes | slice 1a `323b6920ca`, slice 1b-1c `19d2381061` |
| `thermos` after each slice | no | skip: the `api-build` row owes a panel on the diff, whose seats apply both lenses |
| `best-api repair` | yes | decision-log line 36; `pnpm check skill-mirrors` passes (`docs/plans/artifacts/react-editor-release/check/skill-mirrors-a1.log`) |
| `plate-docs` on the changed pages, with its example coverage audit | yes | decision-log line 40; the hand drive covers each changed docs page |
| Hand drive of `/examples/plite/yjs-collaboration` | yes | `docs/plans/artifacts/react-editor-release/drive/hand-drive-check-a1.log` |
| Benchmark performance pack | yes | partial: render count within budget; the paired timing run is open work under `t_27d327a0` (`docs/plans/artifacts/react-editor-release/bench/head-renders-a1.log`) |
| `pnpm check` steps the edits reach, before the package proof | yes | plite-bridge, hook-generics, barrels, bench-targets and skill-mirrors pass; public-types, entrypoint-graph and core-audits fail on base code this task does not touch (`docs/plans/artifacts/react-editor-release/check/`) |
| `oxlint --type-aware` on the task's files before each panel freeze | yes | `pnpm lint:task` on 33 files, 0 warnings and 0 errors (`docs/plans/artifacts/react-editor-release/build/lint-task-a1.log`) |
| Changeset | yes | decision-log line 38 |

## Evidence

Model: claude-opus-5-5 (Opus 5.5) at high effort led this review; two read-only Codex `gpt-6.1-sol @medium` explorers traced the core lifecycle and the Yjs binding (`explorer-core-a1.md` and `explorer-yjs-a1.md` in this run directory).

Earlier reviews and plans of these scopes:

- `2026-10-04-react-audit-2`: retains it, because its question, caller-chosen hook generics, is untouched here.
- `2026-10-06-react-review`: retains it, because that build removed hook generics and never touched editor creation or release.
- `2026-10-04-collaboration-audit`: reopens it at the binding-lifetime question only, because the remount probe is evidence that audit did not have; its Stop on the Plate decoration, the factory input and the app-owned provider stands.
- `2026-09-14-collaboration-lifetimes`: retains its laws, because its Final disposal row describes what cleanup releases; it never gave a constructor plugin a trigger, which this plan adds.

The owner the fix starts from is [use-editor.ts](../../packages/plitejs/src/react/hooks/use-editor.ts), and the binding it leaks is claimed in [plugin.ts](../../packages/plitejs/src/yjs/core/plugin.ts).

### Requirements

- `useEditor(options, deps?)` owns one editor for a component lifetime (`docs/vision/plite.md`, React creation rule).
- Each `(Y.Doc, rootName)` has one binding owner, and a second independent binding is rejected before it can write (`docs/vision/plite.md`, native Yjs rule; collaboration-lifetimes table row "A second factory targets the same").
- A render-owned disposable source survives React Strict Mode effect rehearsal and is destroyed only on a real replacement or unmount (`docs/vision/plite.md`, annotation rules).
- The app owns provider, document and awareness; final disposal releases only binding-owned presence and subscriptions (collaboration-lifetimes, Final disposal row).
- A different document or room generation gets a fresh editor runtime (collaboration-lifetimes), so mounting a new editor on a document an earlier editor used is a supported job.
- A headless `createEditor` with `yjs()` keeps working; the shared test fixture binds through `editor.install(yjs(...))` and its cleanup (`packages/plitejs/test/yjs/support/collaboration.ts`).
- Framework adapters with an independent lifetime get an owned result they can release (`docs/vision/plite.md`, `createAnnotationStore` rule). This is the lead's reading for editors, to attack.
- React may discard, repeat or delay a render, so render must not change shared state. This is React's contract and the lead's conclusion that it binds here.

### Lanes

- **Keep the current design (control, no new artifact).** Docs already teach that a new editor cannot bind a namespace an earlier editor holds (`content/docs/(plugins)/(collaboration)/yjs.mdx`). Loses: leaving and returning to a page with a cached document, any `deps` change and any Suspense retry throw, and the shipped examples build peers with `useEditor` and never release them.
- **Release on unmount only.** Add a whole-editor release and call it from a `useEditor` effect cleanup, the Tiptap shape. Fixes unmount and Strict Mode. Loses the `deps` case, because the new editor claims during render while the old one still holds the slot, and the discarded-render case, because the claim, the observers and a possible seed write already happened in render.
- **Commit-time acquisition plus release (pursued).** Render builds the editor and its in-memory plugin state only; React's commit makes external resources live; a real unmount or replacement releases every plugin; a plain `createEditor` stays one step and gets the same release. Fixes all four probe cases. Cost: one lifecycle rule plugin authors must follow for resources outside the editor, and a core release path.
- **Connect and disconnect (slate-yjs shape).** The binding attaches only through an explicit public verb. Adds a verb to every Yjs caller, splits the editor's lifetime from its binding's, and headless callers must call it too.
- **Delete the exclusive claim (strongest deletion).** Removes the throw, as slate-yjs and Lexical have no claim. Loses: leaked controllers keep observing the document and can write repairs and acknowledgements into it, and two live editors on one namespace silently double-apply.
- **Newest binding takes over.** A second claim retires the first. Hides real duplicate-binding bugs and keeps the shared writes a discarded render makes.

Predicted benefit of the pursued lane, for the Close to mark held or falsified: all four probe cases (unmount, Strict Mode unmount, `deps` change, Suspense retry) mount cleanly and leave exactly one `afterTransaction` listener on the document, and a discarded render adds none.

Prior art was read, not run. The probe runs in jsdom through the Plite package's Vitest config, not a browser.

### Dependents

Every scope below imports the `react` scope's hooks or components. None changes a call site; each gets plugin cleanup at unmount, which only matters where a plugin's cleanup does visible work.

- collaboration: affected; `apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx` and `apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx` build Yjs peers with `useEditor`, which now release on unmount. `apps/www/src/registry/examples/collaboration-demo.tsx` builds its peers in an effect on fresh documents it destroys, so it never rebinds a held namespace and needs no change.
- comments: affected; `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` destroys its store and anchors in cleanup, now at unmount.
- uploads: affected; `packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts` cancels every active upload in cleanup, now at unmount.
- ai: affected; `packages/platejs/src/ai/react/AIChatPlugin.ts` releases its preview anchor in cleanup, now at unmount.
- accessibility, annotations, authored, autocomplete, basic, callout, canvas, clipboard, code, compiler, date, diff, distribution, dnd, documents, drawing, editing, emoji, exports, external-text, footnote, geometry, history, html, large-documents, layout, link, lint, list, markdown, math, media, mentions, native, pagination, persistence, proof, runtime, schema, search, slash, state, streaming, styles, suggestions, table, tags, toc and ui: unaffected; their plugins' cleanups only drop editor-owned state, which the garbage collector already reclaims, and no call site changes.

## Close

Reversals and deviations come first.

- Plate's `EditorRoot` callbacks are back at their base code. Diff round 1 routed them through Plite's `EditorRoot`, and diff round 2 showed that under an authored preview this delivers the projected commit, so an accepted-preview root missed stored proposals in `onValueChange` and selection changes in `onSelectionChange`. The plan's claim narrows. Plate's callbacks can see the admission commit twice under Strict Mode and miss it after a child layout commit, and suggested task `t_b15f1499` owns the fix (decision-log lines 54 and 55).
- Diff round 3's critical stays open. A nested `destroy()` from inside a release runs the remaining releases and the cleanups before that release returns. The panel rule asks to revert a mechanism that already had its replacement, and that revert did not happen. The build's code before the round 1 fix recursed on such an end (round 1's before-fix log, on the post-build tree), so the round 2 drain stays as the lead's pick (Defaults row "reentrant end", look). Suggested task `t_43e3a423` owns the one-owner end as a new plan iteration. A release or cleanup that ends its own editor still runs each release and cleanup once; a take that ends its editor leaves its release unrun and the editor live again, a seat finding no test has run.
- The mount timing step moved to Open work. Renders went from 2 to 3 per mount, inside the budget of one extra, but the frozen timing line got no paired run on a heavily loaded host, and a miss there reopens Phase 1.

Phases 1 to 3 landed. They add `acquire(take)` and `editor.destroy()` in Plite, a dormant build for component editors with one owner that starts, releases and destroys them, `EditorRoot` remounting by runtime identity, the Yjs binding claimed in `acquire` and freed on release, and Plate `useCreateEditor` on the same owner, with Vision, docs, changesets and a remount control per peer in `/examples/plite/yjs-collaboration`.

Proof and its limits:

- For Plite `useEditor`, the four reported cases (unmount, Strict Mode unmount, a `deps` change and a Suspense retry) fail at base and pass here, among 14 base-red cases, two of which fail at setup on the missing `destroy()` rather than on the behavior (`docs/plans/artifacts/react-editor-release/build/base-red-react-a1.log`). For Plate `useCreateEditor`, two cases ran red at base, an `id` replacement and `enabled: false` (`docs/plans/artifacts/react-editor-release/build/base-red-plate-a1.log`); its unmount and discarded-mount cases are inferred from the owner it shares with Plite. All run in jsdom, not a browser.
- Each critical panel fix fails on the tree before it and passes after, with the round 1 logs in `docs/plans/artifacts/react-editor-release/panel-diff-1/` and the round 2 logs in `docs/plans/artifacts/react-editor-release/panel-diff-2/`.
- The hand drive in Chromium typed into all four peers, remounted Peer A once and Peer B twice, and every peer kept syncing with no console error; all 12 page cells are covered (`docs/plans/artifacts/react-editor-release/drive/hand-drive-check-a1.log`).
- The plitejs Bun suite ran 3797 passing and 9 failing cases, and all 9 failures are base-red (`docs/plans/artifacts/react-editor-release/build/plitejs-bun-r3.log`). The plitejs React suite passed 1410 of 1411 in its last full run, and its one failure, `ime-decoration`, passed 3 of 3 alone at load 72, and the Plate Yjs, component and suggestion specs passed 108 of 108.
- In `pnpm check`, plite-bridge, hook-generics, barrels, bench-targets and skill-mirrors pass. Public-types, entrypoint-graph, core-audits and the plitejs typecheck fail on base code this task does not touch, owned by `t_54844d26` and `t_7d2fa403` (`docs/plans/artifacts/react-editor-release/check/`).

Of 9 plan steps, 8 are done, 0 partial, 0 skipped, 0 blocked and 1 moved to open work, the mount timing step.

The diff panel ran three rounds, the cap. Round 1 applied 4 criticals, round 2 applied 2 (one by reverting Plate's callbacks), and round 3 left 1 open.

Open work moved to the React subject's Open work, each item with its owner and stop.

### Attention

reviewed by gpt-6.1-sol @xhigh, the decision-trail review.

- Diff round 3's critical stays open. The panel rule asked for a revert, and the record now says it did not happen and why.
- A take that ends its own editor leaves its release unrun; no test has run that case.
- Plate's proof covers two measured cases; its unmount and discarded-mount cases are inferred from the shared owner.
- Mount timing has no paired run yet, and a miss reopens Phase 1.
- The zero-caller counts behind the Plate revert and the reentrant-end pick are inferred from literal searches.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `packages/plitejs/src/react/hooks/use-editor.ts`
- `packages/plitejs/src/react/hooks/use-plite-annotation-store.tsx`
- `packages/plitejs/src/react/range-geometry.ts`
- `packages/plitejs/src/react/components/plite.tsx`
- `packages/plitejs/src/create-editor.ts`
- `packages/plitejs/src/core/plugin.ts`
- `packages/plitejs/src/interfaces/editor.ts`
- `packages/plitejs/src/yjs/core/plugin.ts`
- `packages/plitejs/src/yjs/core/controller-registry.ts`
- `packages/plitejs/src/yjs/core/controller.ts`
- `packages/plitejs/test/react/provider-hooks-contract.tsx`
- `packages/plitejs/test/yjs/admission-lifecycle-contract.spec.ts`
- `packages/platejs/src/react/editor/useCreateEditor.ts`
- `packages/platejs/src/yjs/react/YjsPlugin.tsx`
- `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`
- `packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts`
- `packages/platejs/src/ai/react/AIChatPlugin.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx`
- `apps/www/src/registry/examples/collaboration-demo.tsx`
- `content/docs/(plugins)/(collaboration)/yjs.mdx`
- `content/docs/plite/libraries/plite-yjs.mdx`
- `docs/vision/plite.md`
- `docs/plans/2026-09-14-collaboration-lifetimes.md`
- `docs/research/decisions/collaboration-ownership.md`

## Open work

- Time a Yjs editor's mount on a quiet host, base against head, through `.agents/rules/benchmark/scripts/paired-timing.mjs`, at 100 and 1,000 blocks; a head median above 1.5 times base reopens Phase 1 and sends the design back to `architect`. owner: the owner, through suggested task `t_27d327a0` in `docs/plans/suggested-tasks.decisions.tsv`. stop: a paired run passes or conclusively misses.
- The history plugin keeps its replay receipts in module-level maps that an editor's end does not clear. owner: the owner, through suggested task `t_d451217c` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- The AI chat session that `useAIChat` starts is not released by the AI chat plugin's cleanup. owner: the owner, through suggested task `t_e4189747` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- Plate's `EditorRoot` `onCommit`, `onValueChange` and `onSelectionChange` subscribe to the supplied editor in Plate's layout effect, after Plite's view starts the editor, so they can repeat the admission commit under Strict Mode and miss it after a child layout commit; `onNodeChange` and `onTextChange` subscribe there too and always miss it. The fix must keep the stored commit that an authored preview projects away. owner: the owner, through suggested task `t_b15f1499` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- An editor ended from inside its own release, cleanup or take has no single owner for its end. A nested `destroy()` runs the remaining releases and cleanups before the calling callback returns, cleanups of older plugins can run before a newer plugin's last cleanup, and a take that ends its editor leaves its release unrun and the editor live again. The fix gives the end one owner. A nested end records the request and the outer pass finishes it, and `destroy()` inside a take is refused. The probe is `docs/plans/artifacts/react-editor-release/panel-diff-3/probe/reentrant-release.test.ts`. owner: the owner, through suggested task `t_43e3a423` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- A throw from `controller.start()` after a throw publishing pending cursor data replaces the publish error, so only the start error is reported. owner: the owner. stop: a report of an awareness or admission subscriber that throws.
- The annotation store, the decoration manager, range geometry and now the editor owner each implement the Vision's render-owned disposable rule on their own. owner: the owner, through suggested task `t_508ad246` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What to do next | Plan the fix and build it | Stop at this verdict | hold | detail |
| An editor ended from inside its own release, cleanup or take | Keep the round 2 drain and leave the round 3 critical open for a new plan iteration, instead of the revert the panel rule asks for, because the build's code before the round 1 fix recursed on such an end (look) | Revert to the build's code and accept that recursion, or restore the round 1 guard | reentrant end | small |
| Where the editor's end lives | On every editor, including ones a component owns (look) | Only on editors made outside React, as its own editor type | owned type | big |
| How plugins hold outside things | One step that takes a thing and returns how to let it go, run after every plugin's preparation and before the publication is final | A second step that runs after every plugin has taken its things | after-acquire | small |
| Swapping the editor under one root | The root remounts itself when its editor changes, as Plate's root does | The caller still remounts the root with a key, as the law says today | caller key | small |
| Collaboration status before the editor goes live | Waiting for the document to load | A new waiting reason for an editor not started yet | start reason | small |
| Using an editor after it ends | Changes and plugin installs fail; the document snapshot still reads; plugin reads may fail | Every use fails, reads included | strict end | small |
| Why a plugin is cleaned up at the end | The existing removal reason, also passed to a release when the editor is released | A new end-of-editor reason | end reason | detail |
| Ending an editor through a view editor | Ends the runtime it views | Refuses | view end | detail |
| The shared document loading on mount | Reaches the view's change callbacks like any collaboration change | The view skips it | skip admission | small |
| A start whose take throws | Releases what it took and returns the editor to dormant, so a later start can retry | Leaves the editor released | stopped start | detail |
| Which page this lives on | The React subject page | A page of its own | split | detail |
| The React page link | A new page, because the old link no longer opens | Drop the new page and restore the old link | old page | detail |
| How Plate drives the editor's owner | Plate's editor hook runs its own three effects in the same order as Plite's, because Plate's React entry may import only Plite's public React entry | Export Plite's effect hook from its public React entry | shared hook | detail |
