# React integration and rendering

Page: https://claude.ai/artifact/FKHi7cBVsLj8aTZjDDdUr7

How Plite mounts one editor's independent views in React and lets controls read state and run commands against the right mounted root. The ledger asks for the smallest React integration for canonical editor state, rendering and component lifetime. The 2026-09-12 Pursue landed: the public `Runtime` handle, `useRuntime` and the setup-only types are gone, and `EditorRoot` takes a required `editor` plus a root and authored view inputs. The 2026-09-30 content-root work kept that mount grammar, added no public provider or location carrier, and closed with local typecheck, Plite React tests and a Chromium static and AI matrix. None of that proof is bound to a ledger receipt. The 2026-10-04 audit found four context-only hooks still taking caller-chosen `V` and `TPlugins` generics, which `docs/vision/plite.md` forbids. The 2026-10-06 build removed them, cut `useActiveEditor`, `useActiveRoot`, `useRootEffect` and `RootEditor`, kept `useCommand` without caller types, and added `pnpm check hook-generics` so a third return of the shape fails CI in the forms its tests run. The element hooks, the creation hooks and functions and the context selector still break the same law and wait in Open work. `node tooling/scripts/review-ledger.mjs show react` prints the scope's history.

## Public API

Mount one editor and give each root its own editable view.

```tsx
// content/docs/(guides)/roots.mdx
<EditorRoot editor={editor}>
  <EditorContent aria-label="Header" root="header" />
  <EditorContent aria-label="Body" />
  <EditorContent aria-label="Footer" root="footer" />
</EditorRoot>
```

Get a command-capable editor for one mounted root.

```tsx
// packages/plitejs/test/react/use-plite-history.test.tsx
headerEditor = useRootEditor('header');
```

A control that follows the selection reads the active root through the runtime selector.

```tsx
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
const activeRoot = useRuntimeState((state) =>
  SelectionApi.root(state.selection())
);
```

A root editor reports its root through `read`.

```tsx
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
expect(contentRootEditor.read((state) => state.view.root())).toBe(
  childRoot
);
```

A component call site stays the same; what changes is that its editor lets go of the document when the component unmounts.

```tsx
// apps/www/src/app/(app)/examples/plite/_examples/yjs-hocuspocus.tsx (shape)
const editor = useEditor({
  initialValue,
  plugins: [yjs({ awareness, doc: provider.document, initialReady })],
});
// The component's unmount releases the binding; the next mount binds again.
```

A headless owner ends its editor, which frees the document for the next one.

```ts
// packages/plitejs/test/yjs/support/collaboration.ts (shape)
const editor = createEditor({ initialValue, plugins: [yjs({ doc, initialReady: true })] });
editor.destroy();
```

A plugin that holds something outside the editor takes it in `acquire`, which a render React throws away never runs.

```ts
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

Read from source at Lexical `dd5c41b13`, Tiptap `91c51be53` and Slate `945a484df`. None was run. No editor's React context hook takes a caller generic that chooses the editor's installed capabilities. Each returns its broad editor type, and command typing comes from the command value or a global declaration, never from a tuple the caller writes at the hook.

| Editor | Context hook | Returns | Command typing |
| --- | --- | --- | --- |
| Lexical | `useLexicalComposerContext()` (`facebook/lexical@dd5c41b13:packages/lexical-react/src/LexicalComposerContext.ts:87`) | `[LexicalEditor, context]`, no generics | `editor.dispatchCommand<TCommand>(command, payload)` infers the payload from the command value (`facebook/lexical@dd5c41b13:packages/lexical/src/LexicalEditor.ts:1584`) |
| Tiptap | `useCurrentEditor()` (`ueberdosis/tiptap@91c51be53:packages/react/src/Context.tsx:22`) | `{ editor: Editor \| null }`, no generics | Each extension augments the global `Commands` interface through `declare module '@tiptap/core'` |
| Slate | `useSlateStatic()` (`ianstormtaylor/slate@945a484df:packages/slate-react/src/hooks/use-slate-static.tsx:15`) | `Editor`, no generics | Custom types come from global `CustomTypes` declaration merging |

In Plite, `editor.plugin(Plugin)` infers the plugin's API from its descriptor and checks at runtime that the editor has the plugin, so it needs neither a caller tuple nor global declaration merging.

The explorer read slate-yjs, y-prosemirror, Lexical and Tiptap at the revisions in `review_upstreams` (source only, nothing run). In slate-yjs, classic y-prosemirror and Lexical, nothing acquires a document binding during React render, and none of the three holds an exclusive claim on a document namespace. Tiptap builds its editor and view in render; its `@tiptap/y-tiptap` sync package was not traced.

| Editor | When the binding starts listening to the document | Who releases it | A render React throws away |
| --- | --- | --- | --- |
| slate-yjs | `YjsEditor.connect(editor)` in an effect; `withYjs` at construction attaches nothing | `disconnect` in the effect cleanup | attaches nothing |
| y-prosemirror (classic `ySyncPlugin`) | the plugin view's `initView` when the `EditorView` mounts | the plugin view's `destroy` | allocates a binding object with no observers |
| Lexical (`CollaborationPlugin`) | an effect creates the binding and its observers | the effect cleanup destroys the binding and disconnects | creates nothing |
| Tiptap (`useEditor`) | the editor and its ProseMirror view are built in render through an instance manager | a scheduled destroy, cancelled when the component mounts or an effect rehearsal reruns | destroyed later by the scheduled timer |
| Plite today | `activate` and `afterPublish` inside `createEditor`, during render | nothing for a constructor plugin | claims the namespace, observes the document and may seed it |

## Main changes

- `packages/plitejs/src/react/components/plite.tsx` owns `EditorRoot` and the per-mount `PliteRuntimeProvider`, which registers mounted views and their cleanup, and subscribes through `getEditorRuntime(editor).subscribe(...)`.
- `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` owns the context-only hooks: `useRootEditor`, `useCommand`, `useRuntimeState` and `useRootState`. Its context value is one non-generic type over the core React editor contract; the provider erases the mounted editor once, and `registerViewEditor` takes the one named erased slot, because `PliteRuntimeView` bounds its editor by `ReactEditorType<any, any>`.
- `useRuntimeState` and `useRootState` hand their selectors the core React editor state, so a selector cannot read a plugin state group the core contract does not prove; a plugin's state comes from `editor.plugin(Plugin)`.
- `tooling/scripts/check-hook-generics.mjs` runs as the `hook-generics` step of `pnpm check`. It fails a hook or `createEditor` exported from a client entrypoint of `plitejs` or `platejs` whose type parameter only the caller chooses, with a baseline that only shrinks.
- `packages/plitejs/src/react/hooks/use-editor-selector.tsx` owns the selector hooks, which read five different sources: the nearest view, the document runtime with no root filter, one filtered root, an explicit editor through `subscribeCommit`, and non-commit view state.
- `packages/platejs/src/react/core.tsx` re-exports `useRootEditor` for Plate and omits Plite's `useCommand`.

- `packages/plitejs/src/core/editor-owner.ts` gives a component hook one editor that builds dormant in render, starts at commit, releases on layout cleanup and ends on passive cleanup; Plite `useEditor` and Plate `useCreateEditor` both drive it, and Plite `EditorRoot` starts the editor from the first child of each view after subscribing its change callbacks.
- `packages/plitejs/src/yjs/core/binding.ts` is an editor-local binding service with stable API facades; the Yjs plugin builds its controller and claims the document in `acquire`, and frees both when the editor releases.

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

Shared document authority stays below React and mounted effects and registration inside it; Plate's passive `EditorProvider` binds controls without creating a view, and Plate's document-wide callbacks and plugin render contributions are adapter jobs, not a root-scoped raw callback.

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| The public `Runtime`, `useRuntime` and `RuntimeValue` | A peer handle that copied the editor's API and a second setup vocabulary; `EditorRoot` already hosts ordinary and multiple-root views. |
| Optional editor and root props on the mount | Admitted combinations the runtime rejected. |
| A public React runtime or view manager | `createEditorView` already exists. |
| Deleting every context owner | Out-of-editor controls and document callbacks would rebuild scope. |
| A global React store, or one document per Editable | Loses independence or shared roots. |
| Caller-chosen `V` and `TPlugins` generics on context hooks | Let callers manufacture the editor's types, which `docs/vision/plite.md` forbids. |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Collaboration admission | A component editor admits the shared document in the commit's layout phase instead of during render | jsdom Vitest contract in `packages/plitejs/test/react`; hand drive of `/examples/plite/yjs-collaboration` in Chromium |
| Remount on one document | Unmount, Strict Mode, `deps` change and a Suspense retry all mount again | jsdom Vitest contract, red at base |
| Selection and focus | `EditorRoot` starts the editor before any view's layout effect, so `autoFocus` and the selection mount see an admitted document | React case with `Editable autoFocus` over a Yjs editor whose document already holds content, where nothing throws and the selection survives admission; existing Plite React and Yjs awareness suites |
| Mount latency | A collaborative component editor renders once more before paint, an accepted cost | Benchmark performance pack: mount latency and render count of a 1,000-block Yjs document whose `initialValue` is one empty paragraph, base against head; the budget is one extra render and a head median at most 1.5 times base |
| Change callbacks | Admission now commits after the view mounts, so `onCommit` and `onValueChange` see the admission commit of a loaded document; the callback subscription moves into the start gate, subscribes before the start, and keeps its delivered version across effect disconnection, resetting only for a new runtime | React cases that assert each fires once for it under Strict Mode, Activity reveal and a following `autoFocus` commit |

## Open work

- `createPliteRootEditor` builds a root view whose read-only policy comes only from its options or the runtime owner, so `useRootEditor` writes into a root mounted read-only (the read-only probe in `docs/plans/2026-10-06-react-review.md`). Its other callers share it: `useEditorHistory` (`use-plite-history.ts:136-145`), `useCommand`'s fallback for a root with no registered view (`use-plite-runtime.tsx:899-905`), and `useCommand` itself when two views of one root disagree, because it picks the root's active view rather than the caller's (`use-plite-runtime.tsx:443-452`, `:506-515`). Route: the Bug fix playbook, in `docs/plans/2026-10-06-root-editor-readonly-bypass.md`, fixing the producer. owner: zbeyens. stop: regression tests that fail on the probe's case, on history and on two disagreeing views pass, or the owner rejects the fix. Tracked in that plan.
- Close the same law in the element hooks, the creation hooks and functions, and the context selector, in its own plan. Its scope from both panel rounds: Plite `useElement` and `useOptionalElement`; Plite `useEditor` and `createEditor` overload 2 (a plugin tuple only with required `plugins`, keeping the raw value parameter; `plite-runtime-provider-contract.test.tsx:66-76` and `:100` migrate, `yjs-hocuspocus.tsx:1530` compiles unchanged); Plate `useCreateEditor` and `createEditor` in every overload, including `TSchema` (`withPlate.ts:72`, `:141`, `:202-237`); `useStaticEditor` and `createStaticEditor`, whose `platejs/static` entrypoint is `ssr`, not `client` (`entrypoint-dag.mjs:442-452`); an omitted `enabled` typing a non-null editor, `false` typing `null` and a dynamic boolean typing the union; `useEditorContext`, `useOptionalEditorContext`, `useEditorSelector`'s `ContextEditor` (`use-editor-selector.tsx:22`) and the `any` overload `update(policy, fn)` in `with-react.ts:139-146`, whose negative case must use the two-argument form; negative contract cases that fail at base; www's package-integration `tsc`, which the API-reference failure masks; and the "public subtype-return hooks" clause at `oxlint.config.ts:798`. The build's panel added Plate's headless `createEditor` (`withPlite.ts:1492-1505`, `V` and `TSchema` in both overloads), which the check does not scan; once its findings are fixed, the check scans headless and `ssr` entrypoints too, exempting Plite's raw `createEditor` value parameter in `packages/plitejs/src/create-editor.ts`. The build's code review added three more: `PliteRuntimeView`'s `E extends ReactEditorType<any, any>` bounds in `plite.tsx`, which keep `registerViewEditor`'s input erased; the two names for one runtime editor, `ReactRuntimeEditor` in `react-editor.ts` and `Editor` in `with-react.ts`; and `useRootEditor` overwriting the selection-store key `createPliteRootEditor` just set. The build's panel also asked to erase the provider's editor once on entry, so `tsc` checks the context value instead of the whole-value `as unknown as` cast. The build's panel added `useAnnotationStore`, whose `TData` comes only from its annotations' optional `data`. The check's baseline lists the client findings until then; the headless and `ssr` ones it does not scan. owner: zbeyens. stop: that plan passes its panel, its build empties the baseline, and the check scans headless and `ssr` entrypoints and judges `createStaticEditor`, with a test that pins creation scanning, or the owner drops it.
- Plugin-owned command dispatch from React context, such as a `command` member on the plugin view, waits for a real job. owner: zbeyens. stop: a shipped plugin-owned command that a React control must dispatch, or 2026-12-31, when it is dropped. Tracked here.
- Plate's `view` is the Plite view that Plate's wrapper casts to Plate's `Editor`, and `content/docs/api/core/plate-plugin.mdx:388-389` promises "the exact Plate root as `view`". A truthful Plate type for it, without an `any` value, waits for its owner. owner: zbeyens. stop: the creation plan above settles Plate's context type, or the owner keeps the Plite view type.
- The `verify` description now triggers before calling a failure pre-existing and before a base or HEAD control, a change to skill discovery, so its paired baseline and revised trials are pending. owner: zbeyens. stop: the trials run, or the owner accepts the change without them.
- Eight reflect backlog items wait for their mechanisms: an in-flight flag in `review-ledger.mjs next`, a `narrowed` panel result, `decisions-check.mjs --help`, a zsh `no_equals` and `no_nomatch` setting, a helper that saves a subagent reply verbatim, a proof-worktree setup helper, plan-file writes by `cross.mjs` Claude seats, and a cross-family arena judge (the plan's reflect Backlog). owner: zbeyens. stop: each lands through its owner, or the owner drops it.
- No reachability test covers check scripts under `tooling/scripts`, so deleting the `hook-generics` step from `tooling/scripts/check.mjs` passes; `tooling/scripts/ci-workflow.test.mjs` covers `package.json` scripts only. owner: zbeyens. stop: a test fails on a check script that is neither a `check.mjs` step nor listed manual, or the owner drops it.
- The www API-reference check throws at `apps/www/scripts/build-api-reference.mts:231` ("must be included or excluded exactly once"). The base control ran in a worktree a patched build had touched and its log lost the message, so "pre-existing" is inferred until a clean worktree at `HEAD` reproduces it. owner: zbeyens. stop: `pnpm api-reference --check` passes in `apps/www`, or a clean `HEAD` run shows the same message. Tracked here until its owner's plan claims it.
- Details open state lives in the document-owned plugin store while authored views keep their own selection. A read-only authored view that closes a Details hides another authored view's caret, which is present on `next`, and the open keys of deleted blocks have no bound since the PR 5156 babysit stopped pruning them (`docs/plans/2026-10-11-pr-5156-details-selection.md`). owner: zbeyens. stop: Details open state belongs to its view with a bounded lifetime, or the owner drops it.
- Keyboard text-selection scrolling past closed Details, redone from PR 5156's reverted commit `f0a73ca1f9` without the regressions its panel found: the skipped table select clamp, a self-scrolling Editable at document boundaries, stale paint when an endpoint has no DOM host, unmounted voids in closed Details, and a scroll on every selection repair retry. It carries a browser check that repeated arrows across suggestions never open an inline equation. owner: zbeyens. stop: a PR lands it or the owner drops it.
- Two IME cases in `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts` fail at `6fa1169c5e` in Chromium: "keeps decoration refresh from interrupting active IME composition" and "keeps unrelated retained flow mounted during IME composition". The first shows 2 async decoration highlights where it expects 3. The second finds a text-flow node in the first block where it expects none. They fail the same way with and without the blur fix (`docs/plans/artifacts/2026-10-12-plite-blur-gate/decorations-async-base-a1.log`, `decorations-async-RM-a1.log`). owner: zbeyens. stop: both cases pass at the head of next, or 2026-11-30.

- Time a Yjs editor's mount on a quiet host, base against head, through `.agents/rules/benchmark/scripts/paired-timing.mjs`, at 100 and 1,000 blocks; a head median above 1.5 times base reopens Phase 1 and sends the design back to `architect`. owner: the owner, through suggested task `t_27d327a0` in `docs/plans/suggested-tasks.decisions.tsv`. stop: a paired run passes or conclusively misses.
- The history plugin keeps its replay receipts in module-level maps that an editor's end does not clear. owner: the owner, through suggested task `t_d451217c` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- The AI chat session that `useAIChat` starts is not released by the AI chat plugin's cleanup. owner: the owner, through suggested task `t_e4189747` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- Plate's `EditorRoot` `onCommit`, `onValueChange` and `onSelectionChange` subscribe to the supplied editor in Plate's layout effect, after Plite's view starts the editor, so they can repeat the admission commit under Strict Mode and miss it after a child layout commit; `onNodeChange` and `onTextChange` subscribe there too and always miss it. The fix must keep the stored commit that an authored preview projects away. owner: the owner, through suggested task `t_b15f1499` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- An editor ended from inside its own release, cleanup or take has no single owner for its end. A nested `destroy()` runs the remaining releases and cleanups before the calling callback returns, cleanups of older plugins can run before a newer plugin's last cleanup, and a take that ends its editor leaves its release unrun and the editor live again. The fix gives the end one owner: a nested end records the request and the outer pass finishes it, and `destroy()` inside a take is refused. The probe is `docs/plans/artifacts/react-editor-release/panel-diff-3/probe/reentrant-release.test.ts`. owner: the owner, through suggested task `t_43e3a423` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
- A throw from `controller.start()` after a throw publishing pending cursor data replaces the publish error, so only the start error is reported. owner: the owner. stop: a report of an awareness or admission subscriber that throws.
- The annotation store, the decoration manager, range geometry and now the editor owner each implement the Vision's render-owned disposable rule on their own. owner: the owner, through suggested task `t_508ad246` in `docs/plans/suggested-tasks.decisions.tsv`. stop: that task lands or the owner drops it.
