# React integration and rendering

Page: https://claude.ai/artifact/5peMoqSqf1kAjR2onWfB2W

How Plite mounts one editor's independent views in React and lets controls read state and run commands against the right mounted root. The ledger asks for the smallest React integration for canonical editor state, rendering and component lifetime. The 2026-09-12 Pursue landed: the public `Runtime` handle, `useRuntime` and the setup-only types are gone, and `EditorRoot` takes a required `editor` plus a root and authored view inputs. The 2026-09-30 content-root work kept that mount grammar, added no public provider or location carrier, and closed with local typecheck, Plite React tests and a Chromium static and AI matrix. None of that proof is bound to a ledger receipt. The 2026-10-04 audit found four context-only hooks still taking caller-chosen `V` and `TPlugins` generics, which `docs/vision/plite.md` forbids. The 2026-10-06 build removed them, cut `useActiveEditor`, `useActiveRoot`, `useRootEffect` and `RootEditor`, kept `useCommand` without caller types, and added `pnpm check hook-generics` so a third return of the shape fails CI in the forms its tests run. The element hooks, the creation hooks and functions and the context selector still break the same law and wait in Open work. Its law is in `docs/research/decisions/plite-view-ownership.md`.

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

## What other editors do

Read from source at Lexical `dd5c41b13`, Tiptap `91c51be53` and Slate `945a484df`. None was run. No editor's React context hook takes a caller generic that chooses the editor's installed capabilities. Each returns its broad editor type, and command typing comes from the command value or a global declaration, never from a tuple the caller writes at the hook.

| Editor | Context hook | Returns | Command typing |
| --- | --- | --- | --- |
| Lexical | `useLexicalComposerContext()` (`facebook/lexical@dd5c41b13:packages/lexical-react/src/LexicalComposerContext.ts:87`) | `[LexicalEditor, context]`, no generics | `editor.dispatchCommand<TCommand>(command, payload)` infers the payload from the command value (`facebook/lexical@dd5c41b13:packages/lexical/src/LexicalEditor.ts:1584`) |
| Tiptap | `useCurrentEditor()` (`ueberdosis/tiptap@91c51be53:packages/react/src/Context.tsx:22`) | `{ editor: Editor \| null }`, no generics | Each extension augments the global `Commands` interface through `declare module '@tiptap/core'` |
| Slate | `useSlateStatic()` (`ianstormtaylor/slate@945a484df:packages/slate-react/src/hooks/use-slate-static.tsx:15`) | `Editor`, no generics | Custom types come from global `CustomTypes` declaration merging |

In Plite, `editor.plugin(Plugin)` infers the plugin's API from its descriptor and checks at runtime that the editor has the plugin, so it needs neither a caller tuple nor global declaration merging.

## Main changes

- `packages/plitejs/src/react/components/plite.tsx` owns `EditorRoot` and the per-mount `PliteRuntimeProvider`, which registers mounted views and their cleanup, and subscribes through `getEditorRuntime(editor).subscribe(...)`.
- `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` owns the context-only hooks: `useRootEditor`, `useCommand`, `useRuntimeState` and `useRootState`. Its context value is one non-generic type over the core React editor contract; the provider erases the mounted editor once, and `registerViewEditor` takes the one named erased slot, because `PliteRuntimeView` bounds its editor by `ReactEditorType<any, any>`.
- `useRuntimeState` and `useRootState` hand their selectors the core React editor state, so a selector cannot read a plugin state group the core contract does not prove; a plugin's state comes from `editor.plugin(Plugin)`.
- `tooling/scripts/check-hook-generics.mjs` runs as the `hook-generics` step of `pnpm check`. It fails a hook or `createEditor` exported from a client entrypoint of `plitejs` or `platejs` whose type parameter only the caller chooses, with a baseline that only shrinks.
- `packages/plitejs/src/react/hooks/use-editor-selector.tsx` owns the selector hooks, which read five different sources: the nearest view, the document runtime with no root filter, one filtered root, an explicit editor through `subscribeCommit`, and non-commit view state.
- `packages/platejs/src/react/core.tsx` re-exports `useRootEditor` for Plate and omits Plite's `useCommand`.

## Open work

- `createPliteRootEditor` builds a root view whose read-only policy comes only from its options or the runtime owner, so `useRootEditor` writes into a root mounted read-only (the read-only probe in `docs/plans/2026-10-06-react-review.md`). Its other callers share it: `useEditorHistory` (`use-plite-history.ts:136-145`), `useCommand`'s fallback for a root with no registered view (`use-plite-runtime.tsx:899-905`), and `useCommand` itself when two views of one root disagree, because it picks the root's active view rather than the caller's (`use-plite-runtime.tsx:443-452`, `:506-515`). Route: the Bug fix playbook, in `docs/plans/2026-10-06-root-editor-readonly-bypass.md`, fixing the producer. owner: zbeyens. stop: regression tests that fail on the probe's case, on history and on two disagreeing views pass, or the owner rejects the fix. Tracked in that plan.
- Close the same law in the element hooks, the creation hooks and functions, and the context selector, in its own plan. Its scope from both panel rounds: Plite `useElement` and `useOptionalElement`; Plite `useEditor` and `createEditor` overload 2 (a plugin tuple only with required `plugins`, keeping the raw value parameter; `plite-runtime-provider-contract.test.tsx:66-76` and `:100` migrate, `yjs-hocuspocus.tsx:1530` compiles unchanged); Plate `useCreateEditor` and `createEditor` in every overload, including `TSchema` (`withPlate.ts:72`, `:141`, `:202-237`); `useStaticEditor` and `createStaticEditor`, whose `platejs/static` entrypoint is `ssr`, not `client` (`entrypoint-dag.mjs:442-452`); an omitted `enabled` typing a non-null editor, `false` typing `null` and a dynamic boolean typing the union; `useEditorContext`, `useOptionalEditorContext`, `useEditorSelector`'s `ContextEditor` (`use-editor-selector.tsx:22`) and the `any` overload `update(policy, fn)` in `with-react.ts:139-146`, whose negative case must use the two-argument form; negative contract cases that fail at base; www's package-integration `tsc`, which the API-reference failure masks; and the "public subtype-return hooks" clause at `oxlint.config.ts:798`. The build's panel added Plate's headless `createEditor` (`withPlite.ts:1492-1505`, `V` and `TSchema` in both overloads), which the check does not scan; once its findings are fixed, the check scans headless and `ssr` entrypoints too, exempting Plite's raw `createEditor` value parameter in `packages/plitejs/src/create-editor.ts`. The build's code review added three more: `PliteRuntimeView`'s `E extends ReactEditorType<any, any>` bounds in `plite.tsx`, which keep `registerViewEditor`'s input erased; the two names for one runtime editor, `ReactRuntimeEditor` in `react-editor.ts` and `Editor` in `with-react.ts`; and `useRootEditor` overwriting the selection-store key `createPliteRootEditor` just set. The build's panel also asked to erase the provider's editor once on entry, so `tsc` checks the context value instead of the whole-value `as unknown as` cast. The build's panel added `useAnnotationStore`, whose `TData` comes only from its annotations' optional `data`. The check's baseline lists the client findings until then; the headless and `ssr` ones it does not scan. owner: zbeyens. stop: that plan passes its panel, its build empties the baseline, and the check scans headless and `ssr` entrypoints and judges `createStaticEditor`, with a test that pins creation scanning, or the owner drops it.
- Plugin-owned command dispatch from React context, such as a `command` member on the plugin view, waits for a real job. owner: zbeyens. stop: a shipped plugin-owned command that a React control must dispatch, or 2026-12-31, when it is dropped. Tracked here.
- Plate's `view` is the Plite view that Plate's wrapper casts to Plate's `Editor`, and `content/docs/api/core/plate-plugin.mdx:388-389` promises "the exact Plate root as `view`". A truthful Plate type for it, without an `any` value, waits for its owner. owner: zbeyens. stop: the creation plan above settles Plate's context type, or the owner keeps the Plite view type.
- The `verify` description now triggers before calling a failure pre-existing and before a base or HEAD control, a change to skill discovery, so its paired baseline and revised trials are pending. owner: zbeyens. stop: the trials run, or the owner accepts the change without them.
- Eight reflect backlog items wait for their mechanisms: an in-flight flag in `review-ledger.mjs next`, a `narrowed` panel result, `decisions-check.mjs --help`, a zsh `no_equals` and `no_nomatch` setting, a helper that saves a subagent reply verbatim, a proof-worktree setup helper, plan-file writes by `cross.mjs` Claude seats, and a cross-family arena judge (the plan's reflect Backlog). owner: zbeyens. stop: each lands through its owner, or the owner drops it.
- No reachability test covers check scripts under `tooling/scripts`, so deleting the `hook-generics` step from `tooling/scripts/check.mjs` passes; `tooling/scripts/ci-workflow.test.mjs` covers `package.json` scripts only. owner: zbeyens. stop: a test fails on a check script that is neither a `check.mjs` step nor listed manual, or the owner drops it.
- The www API-reference check throws at `apps/www/scripts/build-api-reference.mts:231` ("must be included or excluded exactly once"). The base control ran in a worktree a patched build had touched and its log lost the message, so "pre-existing" is inferred until a clean worktree at `HEAD` reproduces it. owner: zbeyens. stop: `pnpm api-reference --check` passes in `apps/www`, or a clean `HEAD` run shows the same message. Tracked here until its owner's plan claims it.
