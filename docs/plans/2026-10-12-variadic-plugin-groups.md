# Editor types keep plugin groups after a rest element

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/LNPWzJu4zJjx1bncScDPUh
Playbook: bug-fix

`EditorResolvedInstalledPlugins` resolved every plugin list whose length is not fixed through `TPlugins[number]`. The React editor's list is `readonly [...TPlugins, DOMPlugin, TransferPlugin, ReactPlugin]`. With `TPlugins` set to `any` or `readonly unknown[]`, that union collapses to `any` or `unknown`, so `EditorInstalledReadGroups`, `EditorInstalledUpdateGroups` and `EditorInstalledApiGroups` lost the groups of all three fixed plugins. `Editor<any, any>` from `plitejs/react` then had no `state.transfer` and failed to assign to `ReactRuntimeEditor<Value, PluginsOf<Editor>>`. That is why `registerViewEditor` took an erased editor type and `EditorRuntimeProvider` published its context through `as unknown as`.

## Brief

### What will change?

An editor type that allows unknown extra plugins no longer forgets its built-in ones. That let me remove three casts in the React code that were hiding type errors.

### What could go wrong?

Low risk. Only types changed, and Plite and Plate typecheck and Plite's tests pass. One check read stale build files, so it proved nothing. Nothing is committed yet. That's yours.

## Teach

An editor's type carries its list of plugins. Plite reads that list to type the editor's groups: what a read can see, what an update can change and what the API offers. Each plugin adds a group under its own name.

When the list has no fixed length, Plite used to merge all its plugins into one type and read the groups from that. A React editor's list is any number of extra plugins, then DOM, transfer and React. When the extras have the type "anything", merging them with the three known plugins gives just "anything". The known plugins vanish, so the editor loses its transfer reads, and code had to cast types away to pass such an editor around.

Now Plite reads the known plugins at the start and end of the list one by one. An "anything" part adds nothing. So an editor with unknown extras keeps the groups of the plugins it is known to have.

## Main changes

- In `packages/plitejs/src/interfaces/editor.ts`, `EditorResolvedInstalledPlugins` sends every list whose length is not fixed to the new `EditorResolvedVariadicPlugins`. It peels fixed leading and trailing elements one at a time through the fixed-tuple branch. A remaining rest element resolves to no plugins when it is `any` or `unknown`, and to the old `ReadonlyArray` form otherwise. A plain `any` list and plain `readonly any[]` or `readonly unknown[]` now resolve to `readonly []`. Their read, update and API groups and their default document value are the same as before.
- In `packages/plitejs/src/react/hooks/use-plite-runtime.tsx`, `EditorRuntimeProvider` takes `editor: ReactEditorType` instead of generic `V` and `TPlugins`, so every editor it registers is a `MountedViewEditor`. `registerViewEditor` takes `MountedViewEditor`. The context value and both `EDITOR_TO_ROOT_VIEW_EDITORS` calls no longer cast. `RegisteredViewEditor` and `EditorRuntimeProviderProps` are gone.
- In `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx`, `TestProvider` takes the file's existing `ReturnType<typeof useEditor<any, any>>` instead of generic `V` and `TPlugins`, and its context cast is gone.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Lists of only unknown plugins | Read as no plugins, with the same groups as before | Keep the old merged form | keep merged | detail |
| React provider type parameters | Removed, since it serves one editor type | Keep them and the three casts | keep generics | small |
| Extra type test | None, because the provider code stops compiling if the fix breaks | Add a type test file | add type test | small |
| Release note | None, because Plite has only shipped an empty placeholder | Add a Plite patch note | add note | detail |

## Close

**Reversals.** This replaces the parameter type from this session's first hand-back, `ReactRuntimeEditor<Value, readonly unknown[]>`, with `MountedViewEditor`, now that the editor type can prove its groups. The deslop pass removed an `IsAny` guard I first added in front of `EditorResolvedVariadicPlugins`. Without it the type matrix kept every group and value, the plitejs typecheck still passed, and a TS2589 that the plain `any` list hit went away. The comment-sicko pass cut the new comment down to the one fact TypeScript hides. A fixed element unions into an `any` or `unknown` rest element.

**Landed, uncommitted on `next`.** Three files: `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` and `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx`. Each one already held other sessions' work, so the run kept a copy of each from before its first edit in `docs/plans/artifacts/2026-10-12-variadic-plugin-groups/`, and every log below is there too.

**Proof.**

- Reproduction. `matrix-probe.ts`, run with `matrix-tsconfig.json`, prints the groups and the default value for ten list shapes. Before the fix, in `matrix-before.txt`, `[...any[], DOM, Transfer, React]`, `[...unknown[], DOM, Transfer, React]`, `[Transfer, ...unknown[]]` and `[Transfer, ...any[], DOM]` had no groups, while the fixed `[DOM, Transfer, React]` read `transfer`, updated `dom` and offered `dom`, `react` and `transfer`. After it, in `matrix-after.txt`, those four lists show their fixed plugins' groups, and every other row keeps its groups and its default value.
- Mutation control. With every current file except `editor.ts`, which went back to its copy from before the fix, `pnpm --filter plitejs typecheck` exits 2 with `plite.tsx(264,28)`, where `E` is not assignable to `Editor`, and `plite.tsx(329,54)`, where `E` is not assignable to `MountedViewEditor` (`mutant-core-reverted-typecheck-a1.log`). The same worktree with the fixed `editor.ts` passes 13 of 13 tasks with 0 cached (`mutant-control-fixed-typecheck-a1.log`). So the shipped provider code is the regression check, and I added no separate type test.
- Final bytes. `pnpm --filter plitejs typecheck` passes 13 of 13 tasks with 0 cached (`plitejs-typecheck-a2.log`). The react partition passes 93 files and 1,439 tests (`plitejs-test-react-a2.log`), and the core partition passes 1,868 tests with 0 failures (`plitejs-test-core-a2.log`), both on a cache miss. `pnpm --filter platejs typecheck` passes 88 of 88 tasks (`platejs-typecheck-a2.log`). `pnpm lint:task` reports 0 warnings and 0 errors on the three files.

**Limits.** All gates ran in this checkout, which holds other sessions' uncommitted work. The mutant ran in a detached worktree at `HEAD` with that whole diff applied (`tree-at-mutation.patch`). `pnpm --filter plitejs typecheck:contracts` exited 0 but reads built declarations, which this run did not rebuild, so it proves nothing about this change (`plitejs-typecheck-contracts-a2.log`). The matrix covers the ten shapes it names, not every list. A list with a rest element still never drops a plugin whose name repeats, as before. `createReactRuntimeViewEditor` in the same file keeps its own `as any` and `as unknown as` casts, which come from its generic parameters, not from this defect. `pnpm check` did not run, because the change is type-only inside plitejs and the platejs typecheck covers its one dependent. The app reported the suggested task chip for this fix as already started when I tried to withdraw it, so another session may be making the same change in its own worktree.

**No changeset.** `plitejs` on npm is 0.0.1, a 3-file, 2,571-byte placeholder, so no released version has this defect.
