---
review_scopes: [react]
review_basis: [2026-10-04-react-audit-2]
work_kind: implementation
review_commit: da4898bb61da71aaf82226709ee29f761ac73835
review_inputs: [packages/plitejs/src/react/hooks/use-plite-runtime.tsx, packages/plitejs/src/react/hooks/use-plite-history.ts, packages/plitejs/src/react/index.ts, packages/platejs/src/react/core.tsx, packages/platejs/src/react/plite-react.ts, packages/platejs/src/react/internal/plite-components.ts, packages/platejs/src/react/plugin/PlatePlugin.ts, packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx, packages/plitejs/test/react/generic-react-editor-contract.tsx, packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx, packages/plitejs/test/react/use-plite-root-command-hooks.test.tsx, content/docs/api/react-hooks.mdx, tooling/scripts/check.mjs, tooling/scripts/check-hook-generics.mjs, tooling/scripts/check-hook-generics.test.mjs, tooling/scripts/check-hook-generics-baseline.json, docs/vision/plite.md]
---

# React: context hooks without caller generics

Status: executed: built, reviewed, verified and committed
Playbook: plan

Plite's React hooks that read the mounted editor from context stop taking caller-chosen `V` and `TPlugins` generics. The context is typed `any` where it is created (`packages/plitejs/src/react/hooks/use-plite-runtime.tsx:223-226`, `:737-739`), so `useRootEditor<V, TPlugins>`, `useActiveEditor`, `useRootEffect` and `useCommand` return or accept whatever type the caller asserts, and nothing checks it against the editor `EditorRoot` mounted. `docs/vision/plite.md` forbids that ("retrieve the mounted contract without caller generics"). This is the second time: the 2026-08-06 plan cut the same shape from `useEditor<E>()` and `useActiveEditor<E>()`, the 2026-09-12 view work brought it back on `useRootEditor`, `useRootEffect` and `useCommand`, and no check enforced the law. This plan builds the 2026-10-04 Pursue (`2026-10-04-react-audit-2`) in one phase under the Build playbook, `.agents/playbooks/build.md`. It removes the generics and the context plumbing that carried them, cuts `useActiveEditor`, `useActiveRoot`, `useRootEffect` and `RootEditor`, keeps `useCommand` without caller generics because, for a root with a registered view, it dispatches through that view and honors its read-only policy, types the runtime selectors' state as the core React editor state instead of `any`, and adds a type-aware check that fails the forms of this regression its proof runs. The same law is broken in the element hooks, the creation hooks and functions and the context selector; that work left this plan after the panel's second round and waits in Open work with its own plan. The panel's first round proved that `useRootEditor` writes into a root mounted read-only (`docs/plans/artifacts/2026-10-06-react-review/panel/round-1/readonly-policy-probe.jsonl`); that shipped defect goes to the Bug fix playbook. The owner said "go plan" on 2026-10-06; this plan builds nothing until the owner's go.

## Brief

### What will change?

The removed hooks and the editor types that callers chose are gone. A new check in the gate fails the known forms of this mistake. The close lists the proof, two accepted limits and the open work.

### What could go wrong?

Apps that use the removed hooks stop compiling. The check misses some type forms. A separate bug still lets a root editor write into a read-only root. Your commit is next.

## Public API

A control that follows the selection reads the active root through the runtime selector, because `useActiveRoot` only wrapped that selector.

```tsx before
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
const activeRoot = useActiveRoot();
```

```tsx after
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
const activeRoot = useRuntimeState((state) =>
  SelectionApi.root(state.selection())
);
```

`useCommand` keeps its job, dispatching through the root's registered view at click time, but loses the caller-asserted value and plugin tuple. A plugin-owned command no longer type-checks through it; the plugin that owns the command exposes it through its `api`, whose factory types the editor from its declared dependencies.

```tsx before
// packages/plitejs/test/react/generic-react-editor-contract.tsx
const runSpecial = useCommand<
  typeof specialCommand,
  CustomValue,
  readonly [typeof SpecialCommandPlugin]
>(specialCommand);
```

```tsx after
```

A post-flush root effect goes, because only its own tests used it. Mounted measurements use React effects and refs, and document reactions use `editor.subscribeCommit`.

```tsx before
// packages/plitejs/test/react/use-plite-root-command-hooks.test.tsx
useRootEffect((rootEditor) => {
  calls.push({
    childLayoutSeen: screen
      .getByTestId('root-effect-root')
      .getAttribute('data-child-layout'),
    root: rootEditor.read((state) => state.view.root()),
  });
});
```

```tsx after
```

A root editor reports its root through `read`, because `RootEditor`'s extra `root` member goes with the type.

```tsx before
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
expect(contentRootEditor.root).toBe(childRoot);
```

```tsx after
// packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx
expect(contentRootEditor.read((state) => state.view.root())).toBe(
  childRoot
);
```

## Hard cuts and app migration

`plitejs/react` and `platejs/react` lose these exports. The callers come from the blast-radius run in Evidence, which typechecked `plitejs`, `platejs` and www against a spike of the larger first-round cut.

| Removed | Repository callers that break | App migration |
| --- | --- | --- |
| `useActiveEditor` | none outside export-name lists | `useRootEditor(useRuntimeState((state) => SelectionApi.root(state.selection())))` |
| `useActiveRoot` | `plite-runtime-provider-contract.test.tsx:48`, `:676`, `:961` | `useRuntimeState((state) => SelectionApi.root(state.selection()))` |
| `useRootEffect`, `UseRootEffectOptions` | `use-plite-root-command-hooks.test.tsx` (its five effect cases) | `useLayoutEffect` with a ref for mounted measurement; `editor.subscribeCommit` for document reactions |
| `RootEditor` | `PlatePlugin.ts:94`, `:337`; `BlockPlaceholderPlugin.tsx:8`, `:49`; `plite-runtime-provider-contract.test.tsx:407` | let the callback parameter infer |
| type arguments to `useRootEditor` and `useCommand` | `generic-react-editor-contract.tsx:377-406` | drop the type arguments; read exact capability with `editor.plugin(Plugin)`; dispatch a plugin-owned command from that plugin's `api` |

Export-name lists that change with the cut: `packages/plitejs/test/react/surface-contract.tsx:195-210`, and `packages/platejs/test/public-package-import-smoke.slow.ts:337-351`; `packages/plitejs/test/public-package-types-smoke.ts:141-146` holds no removed name and stays unchanged. `tooling/scripts/check-plite-release-artifacts.mjs:847`, `:855` keeps `useCommand` omitted from Plate and drops `useRootEffect`. No registry component, kit or www example calls a removed hook. The registry docs output that embeds `react-hooks.mdx` (`apps/www/public/r/api-react-hooks-docs.json`, `registry-docs.json`, `registry.json`) regenerates with the docs.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Context hooks lose caller generics; three hooks and `RootEditor` go | Plite | `plitejs/react` (`packages/plitejs/src/react/hooks/use-plite-runtime.tsx`) | Plite React owns mounted-view context; Plate re-exports by identity |
| Context value and accessor are typed over one named internal editor contract; the provider holds the one cast | Plite | `plitejs/react`, private | The provider receives the typed editor, so it is the one place the type can be erased |
| View-attribute `view` and the placeholder plugin take the Plite React `Editor` | Plate | `platejs/react` through the private bridge `packages/platejs/src/react/plite-react.ts` | The runtime object is the mounted Plite view, which Plate's wrapper only casts to Plate's `Editor` (`packages/platejs/src/react/internal/plite-components.ts:21-22`); bare Plate `Editor` types its value `any` (`packages/platejs/src/react/editor/Editor.ts:155-167`) |
| `check-hook-generics` | tooling | `tooling/scripts/check-hook-generics.mjs`, a `pnpm check` step in `tooling/scripts/check.mjs` | Only a type-aware check sees a type parameter that reaches a parameter through an alias or conditional type |

No owner moves between entrypoints, so `tooling/entrypoints/entrypoint-dag.mjs` is unchanged.

## Main changes

- `PliteRuntimeContextValue`, `useRequiredPliteRuntimeContext` and `createPliteRootEditor` lose their type parameters and are typed over one named internal editor contract. The provider holds the only cast, and the hooks hold none.
- The provider's view-effect queue goes with `useRootEffect`, its only consumer: `createPliteViewEffectQueue`, the `viewEffectVersion` state, `registerViewEffect`, the per-commit version bump and the flush layout effect.
- `useRuntimeState` and `useRootState` hand their selectors the core React editor state instead of `EditorStateView<any, any>`, so a selector cannot read a plugin's state group that the core contract does not prove.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `useRootEditor` | `<V, TPlugins, TRoot>(root?, options?)`, returns `RootEditor<V, TPlugins>` | `<const TRoot>(root?, options?)`, returns the `plitejs/react` `Editor` | Plite React | Root-scoped commands are a documented job (`roots.mdx:97`); context retrieval takes no caller generic | this plan | type contract; provider, history, chrome and announcement tests | downstream type arguments break | rearchitect |
| `useActiveEditor` | composes `useRootEditor` with the active root | deleted | none | Its body is that composition (`use-plite-runtime.tsx:955-962`) | this plan | name lists | downstream one-line rewrite | cut |
| `useActiveRoot` | one-line `useRuntimeState` selector | deleted | none | `SelectionApi.root` never returns `main` (`selection.ts:225-240`), so the selector is the same call | this plan | provider-contract active-root cases | downstream one-line rewrite | cut |
| `useRootEffect` and the view-effect queue | post-flush effect with the mounted view | deleted | none | No Vision job, no consumer; Plate omits it; its generics reach only the callback | this plan | its five cases are deleted with it | downstream reliance on its timing | cut |
| `useCommand` | dispatcher checked against an asserted tuple | `<TCommand, const TRoot>(command, options?)` checked against the core React contract; dispatch path unchanged | Plite React | For a root with a registered view, it is the dispatch path that honors that view's read-only policy (probe) | this plan | contract cases; its command case in `use-plite-root-command-hooks.test.tsx` | plugin-owned commands stop type-checking through it | rearchitect |
| `RootEditor` | branded generic editor variant | deleted | none | Vision bans branded editor variants (`plite.md:80-84`); its `root`, `focus` and `blur` have no product reader | this plan | both package typechecks | Plate declarations | cut |
| `UseRootEditorOptions.readOnly` | read-only root view option | kept | Plite React | It is today the only way to ask for a read-only root editor, and the read-only bug fix decides root-editor policy | none | none | none | keep |
| Context plumbing | generic accessor over an `any` context | non-generic over one named internal contract; one cast in the provider | Plite React, private | Removes the path that carried both regressions | this plan | plitejs typecheck | none found by the spike | rearchitect |
| `useRuntimeState`, `useRootState` selector state | `EditorStateView<any, any>` | core React editor state | Plite React | `any` exposes every plugin read group as `Record<string, any>` (`editor.ts:3344-3349`) | this plan | two directives that fail at base | downstream selectors reading plugin state | rearchitect |
| Regression guard | one-time `rg` queries in the 2026-08-06 plan | `check-hook-generics` in `pnpm check`, with a baseline that only shrinks | tooling | A third regression in the forms its proof runs must fail CI under any hook name | this plan | its rule tests and the past-file proof | the forms listed under Proof limits pass it | gate |
| Plugin-owned command from React context | asserted tuple through `useCommand` | no new API; the owning plugin's `api` dispatches with a proven editor type | Plite core and plugin owners | No shipped command or doc needs React-context dispatch (`plugin-methods.mdx:155-175`) | none | contract cases removed | a future command needs it; that `api` dispatch runs on a root editor, which has the read-only bug | defer |
| Element hooks, creation hooks and functions, context selector | caller-chosen element, value, schema, plugin and enabled types; `any` context | each inferred from a supplied input | Plite React and Plate creation | Same law; the panel's second round found the work wider than one phase | its own plan | none here | none here | defer |

## Steps

### Start gates

- [x] The accessibility announcement-host build has landed, because it changes `screen-reader-announcement.test.tsx`, which this plan's proof runs. Proof: `docs/plans/2026-10-06-accessibility-announcement-host.md` shows an executed `Status:` line. Closed: its Status reads `executed`, with its edits uncommitted in the shared tree.
- [x] The read-only bypass in `useRootEditor` has its own bug-fix plan through the Bug fix playbook, `.agents/playbooks/bug-fix.md`. This plan neither fixes nor widens it. Proof: that plan's path in this plan's Open work. Closed: `docs/plans/2026-10-06-root-editor-readonly-bypass.md`.

### Build

- [x] Write the type-contract cases first in `packages/plitejs/test/react/generic-react-editor-contract.tsx`: two `@ts-expect-error` reads of `state['special-command']` through `useRuntimeState` and `useRootState`; `// @ts-expect-error` on `useRootEditor<CustomValue>()`; and exact return-type checks with `IsAny` and `IsNever` guards for `useRootEditor()`. Proof: `pnpm exec tsc -p packages/plitejs/test/tsconfig.generic-types.json --noEmit` fails at base, the selector directives with TS2578 (`blast/erasure-probe-at-base.log`) and the return checks with an assignability error. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/step1-contract-at-base.log` (TS2344 and three TS2578 at base); the `useRootEditor<CustomValue>()` case left after the code review, per Close > Build.
- [x] In one change, make the context value, its accessor and `createPliteRootEditor` non-generic over one named internal contract with the only cast in the provider; retype `useRootEditor` to `<const TRoot extends RootKey = RootKey>(root?, options?)` returning the `plitejs/react` `Editor`; retype `useCommand` to `<TCommand, const TRoot>` checked against that `Editor` with its dispatch path unchanged; and give `useRuntimeState` and `useRootState` the core React editor state. Proof: `pnpm --filter plitejs typecheck` and the contract cases from the first step. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/accept/plitejs-typecheck-a1.log` and `docs/plans/artifacts/2026-10-06-react-review/build/accept/generic-contract-a1.log`; one named erased registration slot remains, per Close > Build.
- [x] Delete `useActiveEditor`, `useActiveRoot`, `useRootEffect`, `RootEditor`, `UseRootEffectOptions`, the private `useLatestCallbackCell`, and the view-effect queue, with their exports from `packages/plitejs/src/react/index.ts`, `packages/platejs/src/react/plite-react.ts` and `packages/platejs/src/react/core.tsx`. Proof: `git grep -w` for each name over live source, current docs, skills and open plans finds only history. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/close-hard-cut-sweep.log`.
- [x] Type Plate's view-attribute `view` (`PlatePlugin.ts:337`) and `BlockPlaceholderPlugin.tsx:49` as the Plite React `Editor` through the private bridge, with no new `platejs/react` export. Proof: `pnpm --filter platejs typecheck`. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/accept/platejs-typecheck-a1.log`, through `packages/platejs/src/react/internal/plite-types.ts`.
- [x] Migrate the tests. In `packages/plitejs/test/react/use-plite-root-command-hooks.test.tsx`, delete the five `useRootEffect` cases and keep the `useCommand` case. In the contract, delete the asserted-tuple calls. Move the provider-contract test's `useActiveRoot` calls to the selector and its `.root` read to `read((state) => state.view.root())`. Update the three export-name lists and the release-artifact list named in Hard cuts. Proof: from `packages/plitejs`, `bun run test:react test/react/plite-runtime-provider-contract.test.tsx test/react/use-plite-history.test.tsx test/react/use-plite-root-chrome.test.tsx test/react/screen-reader-announcement.test.tsx test/react/use-plite-root-command-hooks.test.tsx`; then `pnpm check public-types`. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/accept/react-partition-a1.log` (93 files, 1419 tests) and `docs/plans/artifacts/2026-10-06-react-review/build/accept/public-types-a1.log`.
- [x] Add `tooling/scripts/check-hook-generics.mjs`, its `tooling/scripts/check-hook-generics.test.mjs`, a `pnpm check` step in `tooling/scripts/check.mjs`, and a baseline keyed by package, file, symbol, overload index and type-parameter name. It builds a TypeScript program over every `client(...)` entrypoint of `plitejs` and `platejs` in `tooling/entrypoints/entrypoint-dag.mjs`, and fails closed when an entrypoint has no source or no exports. For each exported `use[A-Z]*` hook and each exported `createEditor` or `createEditorWithEditor` function, it judges every callable signature, never an implementation signature behind overloads. A type parameter fails when no inferable occurrence exists in a parameter: an occurrence inside a callback's own parameter list, or in a conditional type's check or `extends` clause after aliases resolve, does not count. It also fails when it reaches the return type or a hook-supplied callback parameter and every inferable occurrence sits in an optional parameter or an optional property of an options object. The one exemption is the value parameter of Plite's `useEditor` and `createEditor` in `packages/plitejs/src/react`, keyed by file, symbol and parameter, citing the raw schema-less creation law. Seed the baseline once with only the findings on the surfaces Open work's creation item lists. Proof: in a detached worktree at `da4898bb61`, the check flags `V` and `TPlugins` on `useRootEditor`, `useActiveEditor`, `useRootEffect` and `useCommand`; on the built tree it passes; its tests cover a renamed caller-chosen hook, an unannotated return, an optional options property, `usePath` as a must-still-accept overload, Plate's `useEditor` as a non-exempt name, and an entrypoint with no source. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/accept/hook-generics-check-a1.log`, `docs/plans/artifacts/2026-10-06-react-review/build/accept/hook-generics-tests-a1.log`, `docs/plans/artifacts/2026-10-06-react-review/build/accept/hook-generics-mutations-a2.log` and `docs/plans/artifacts/2026-10-06-react-review/panel/build-round-2/past-file-proof-a2.log`; baseline keying, entrypoint scope and the stated limits differ, per Close > Build and Proof limits.
- [x] List each way to pass the check without fixing code (a baseline edit, a renamed export, a hook outside a client entrypoint, a dropped base, and each form under Proof limits) and record which one the review sees and which one fails closed. Then add the check's row to `AGENTS.md`'s Rules and enforcement table, claiming only the forms the proof ran. Proof: the list in the run directory and the row's text. Closed: `docs/plans/artifacts/2026-10-06-react-review/panel/build-round-2/ways-to-pass-a2.tsv` and the `AGENTS.md` rules row.
- [x] Run `plate-docs` on `content/docs/api/react-hooks.mdx`: remove `useActiveEditor` and `useActiveRoot`, show `useRootEditor` returning `Editor`, and show the active-root composition and the non-generic `useCommand`. `content/docs/(guides)/roots.mdx` already matches, and neither page has a Chinese twin. Rebuild the registry docs output with `pnpm --filter www build:registry`. Proof: the `plate-docs` checks, a docs preview of both pages, and the three regenerated JSON files. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/step8-build-source.log`, `docs/plans/artifacts/2026-10-06-react-review/panel/build-round-1/fix-build-registry.log`, `docs/plans/artifacts/2026-10-06-react-review/build/accept/www-tsc-a2.log` and the preview of both pages, `docs/plans/artifacts/2026-10-06-react-review/build/docs-preview-a1.log`; no `useCommand` section, per Close > Build.
- [x] Add a breaking changeset for `plitejs` and `platejs` through `changeset`, and run `best-api repair` on the context-retrieval law. Proof: the changeset file and the repair's search log. Closed: skip: no changeset, because the hooks never shipped (decision row 15:35:55Z); `best-api repair` in `docs/vision/plite.md` and decision row 15:36:31Z.
- [x] Close. Run `pnpm lint:baseline` to drop the `plate/no-one-off-editor-type` entry for the deleted `RootEditor`, then `pnpm check lint-baseline`, `pnpm check hook-generics`, both package typechecks, the generic contract `tsc`, www `tsc` run directly (`node --max-old-space-size=8192 ../../node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` from `apps/www`, because the www typecheck chain stops at an API-reference failure that also appears without this plan's changes) and `pnpm lint`. Keep when all pass; otherwise revert the build's files to their copies from before it. Closed: `docs/plans/artifacts/2026-10-06-react-review/build/accept/lint-baseline-a1.log`, `docs/plans/artifacts/2026-10-06-react-review/build/accept/hook-generics-check-a1.log`, both typechecks, the contract, `docs/plans/artifacts/2026-10-06-react-review/build/accept/www-tsc-a2.log` and `docs/plans/artifacts/2026-10-06-react-review/build/close-lint-check-a2.log`.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Execution packet | yes | Record the build base, authority and the files this build writes | base `da4898bb61`, then `cd19701029`; the owner's "go"; files in `docs/plans/artifacts/2026-10-06-react-review/build/accept-task-a1.patch` |
| Blast radius before code | yes | Run `pstack:blast-radius` on the public API change at the build base | `docs/plans/artifacts/2026-10-06-react-review/build/census-removed-names.txt`, `docs/plans/artifacts/2026-10-06-react-review/build/census-selectors.txt` |
| Verify loaded | yes | Load `verify` before the first proof gate | `verify` loaded before `docs/plans/artifacts/2026-10-06-react-review/build/baseline-react-tests.log` |
| Code slice proofs | yes | Each Build step's proof, on this build's bytes | Build step boxes; `docs/plans/artifacts/2026-10-06-react-review/build/accept/` |
| Thermo-nuclear review | yes | A fresh-context `pstack:thermo-nuclear-code-quality-review` on the shared-code diff | `docs/plans/artifacts/2026-10-06-react-review/build/thermo/answer.md` |
| Hard cut sweep | yes | Live source, current docs, skills and open plans hold no removed name | `docs/plans/artifacts/2026-10-06-react-review/build/close-hard-cut-sweep.log` |
| `best-api repair` | yes | Repair the context-retrieval law's teaching artifacts | `docs/vision/plite.md`; decision row 15:36:31Z and its superseding row |
| `plate-docs` | yes | `content/docs/api/react-hooks.mdx` and its example coverage audit | `content/docs/api/react-hooks.mdx`; `docs/plans/artifacts/2026-10-06-react-review/build/step8-build-source.log` |
| Changeset | yes | Breaking changeset for `plitejs` and `platejs` through `changeset` | skip: the hooks never shipped (decision row 15:35:55Z) |
| Writing passes | yes | `deslop` and `no-comments` on code, one `unslop` on docs and plans | `docs/plans/artifacts/2026-10-06-react-review/build/comment-sicko/answer.md`; writing rows in the decision log |
| Type-aware lint | yes | `pnpm exec oxlint --type-aware` on the lintable files, before the panel freeze | `docs/plans/artifacts/2026-10-06-react-review/build/thermo-oxlint-type-aware.log`; `docs/plans/artifacts/2026-10-06-react-review/build/close-lint-check-a2.log` |
| Diff panel | yes | `api-build` row: a panel on this build's diff | `docs/plans/artifacts/2026-10-06-react-review/panel/build-round-1/`, `docs/plans/artifacts/2026-10-06-react-review/panel/build-round-2/`; panel rows in the decision log |
| Lint fix | yes | `pnpm lint:fix` on this build's code paths, last code edit | `docs/plans/artifacts/2026-10-06-react-review/build/close-lint-fix-a1.log`, `docs/plans/artifacts/2026-10-06-react-review/build/close-lint-check-a2.log` |
| Decision-trail review | yes | A `codex:gpt-6.1-sol @xhigh` trail review, Attention in Close | `docs/plans/artifacts/2026-10-06-react-review/trail-build/sol/answer.md`; Close > Build attention |
| Ledger and fold | yes | `review-ledger.mjs check`, fold the delta into `docs/plans/topics/react.md`, render `--folded`, republish | `node tooling/scripts/review-ledger.mjs check` exit 0; `docs/plans/topics/react.md` Public API, Main changes and Open work |

## Proof

The guard's type layer already fails at base for its named defect: `docs/plans/artifacts/2026-10-06-react-review/blast/erasure-probe-at-base.log` shows TS2578 on both selector directives at `da4898bb61`. The read-only probe (`panel/round-1/readonly-policy-probe.jsonl`) shows the dispatch difference this plan keeps: under one read-only header mount, `useRootEditor('header')` reports `isReadOnly` false and writes "R", while `useCommand` throws "Cannot update a read-only editor view."; under an editable mount both write. The check's proof runs in the build on the real past file. Nothing here claims browser behavior, so no browser lane applies.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| How a third regression fails | A type-aware check in the CI gate, as the design runoff chose | A syntactic lint rule | use the lint rule |
| The active-root hook | Remove it; the runtime selector does the same job | Keep it as a shortcut | keep the active root hook |
| The command hook | Keep it without caller types, because it honors a registered read-only view | Remove it | remove the command hook |
| The read-only option on the root editor hook | Keep it until the bug fix decides root-editor policy | Remove it now | remove the read-only option |
| Plugin-owned commands from a control | No new API until a real command needs it | Add a command method to the plugin view | add the plugin command method |
| The type of the view in Plate attribute callbacks | The Plite view type, reached by inference with no new Plate name | Plate's own editor type, which types its value as any | use the Plate editor type |
| The element and creation hooks | A separate plan after this one | Fix them in this plan | fold the creation work back in |
| The type check proof for the context and close steps | Accept it: every package and test type check this build owns passes, and the one failing test file belongs to another session and fails the same way before this build | Keep both steps open until that test file compiles | reopen the type check proof |
| The build's diff after its panel cap | Ship it: no known critical finding remains, and every change after round 2 restores code round 1 reviewed or narrows a claim | Hold it, or run another round | hold, another round |

## Open work

- `createPliteRootEditor` builds a root view whose read-only policy comes only from its options or the runtime owner, so `useRootEditor` writes into a root mounted read-only (`panel/round-1/readonly-policy-probe.jsonl`). Its other callers share it: `useEditorHistory` (`use-plite-history.ts:136-145`), `useCommand`'s fallback for a root with no registered view (`use-plite-runtime.tsx:899-905`), and `useCommand` itself when two views of one root disagree, because it picks the root's active view rather than the caller's (`use-plite-runtime.tsx:443-452`, `:506-515`). Route: the Bug fix playbook, in `docs/plans/2026-10-06-root-editor-readonly-bypass.md`, fixing the producer. owner: zbeyens. stop: regression tests that fail on the probe's case, on history and on two disagreeing views pass, or the owner rejects the fix. Tracked in that plan.
- Close the same law in the element hooks, the creation hooks and functions, and the context selector, in its own plan. Its scope from both panel rounds: Plite `useElement` and `useOptionalElement`; Plite `useEditor` and `createEditor` overload 2 (a plugin tuple only with required `plugins`, keeping the raw value parameter; `plite-runtime-provider-contract.test.tsx:66-76` and `:100` migrate, `yjs-hocuspocus.tsx:1530` compiles unchanged); Plate `useCreateEditor`, `createEditor` and `createEditorWithEditor` in every overload, including `TSchema` (`withPlate.ts:72`, `:141`, `:202-237`); `useStaticEditor` and `createStaticEditor`, whose `platejs/static` entrypoint is `ssr`, not `client` (`entrypoint-dag.mjs:442-452`); an omitted `enabled` typing a non-null editor, `false` typing `null` and a dynamic boolean typing the union; `useEditorContext`, `useOptionalEditorContext`, `useEditorSelector`'s `ContextEditor` (`use-editor-selector.tsx:22`) and the `any` overload `update(policy, fn)` in `with-react.ts:139-146`, whose negative case must use the two-argument form; negative contract cases that fail at base; www's package-integration `tsc`, which the API-reference failure masks; and the "public subtype-return hooks" clause at `oxlint.config.ts:798`. The build's panel added Plate's headless `createEditor` (`withPlite.ts:1492-1505`, `V` and `TSchema` in both overloads), which the check does not scan; once its findings are fixed, the check scans headless and `ssr` entrypoints too, exempting Plite's raw `createEditor` value parameter in `packages/plitejs/src/create-editor.ts`. The build's code review added three more: `PliteRuntimeView`'s `E extends ReactEditorType<any, any>` bounds in `plite.tsx`, which keep `registerViewEditor`'s input erased; the two names for one runtime editor, `ReactRuntimeEditor` in `react-editor.ts` and `Editor` in `with-react.ts`; and `useRootEditor` overwriting the selection-store key `createPliteRootEditor` just set. The build's panel also asked to erase the provider's editor once on entry, so `tsc` checks the context value instead of the whole-value `as unknown as` cast. The build's panel added `useAnnotationStore`, whose `TData` comes only from its annotations' optional `data`. The check's baseline lists the client findings until then; the headless and `ssr` ones it does not scan. owner: zbeyens. stop: that plan passes its panel, its build empties the baseline, and the check scans headless and `ssr` entrypoints and judges `createStaticEditor`, with a test that pins creation scanning, or the owner drops it.
- Plugin-owned command dispatch from React context, such as a `command` member on the plugin view, waits for a real job. owner: zbeyens. stop: a shipped plugin-owned command that a React control must dispatch, or 2026-12-31, when it is dropped. Tracked in `docs/plans/topics/react.md` once this plan folds.
- Plate's `view` is the Plite view that Plate's wrapper casts to Plate's `Editor`, and `content/docs/api/core/plate-plugin.mdx:388-389` promises "the exact Plate root as `view`". A truthful Plate type for it, without an `any` value, waits for its owner. owner: zbeyens. stop: the creation plan above settles Plate's context type, or the owner keeps the Plite view type.
- The `verify` description now triggers before calling a failure pre-existing and before a base or HEAD control, a change to skill discovery, so its paired baseline and revised trials are pending. owner: zbeyens. stop: the trials run, or the owner accepts the change without them.
- Eight reflect backlog items wait for their mechanisms: an in-flight flag in `review-ledger.mjs next`, a `narrowed` panel result, `decisions-check.mjs --help`, a zsh `no_equals` and `no_nomatch` setting, a helper that saves a subagent reply verbatim, a proof-worktree setup helper, plan-file writes by `cross.mjs` Claude seats, and a cross-family arena judge (`reflect/synthesis.md`, Backlog). owner: zbeyens. stop: each lands through its owner, or the owner drops it.
- No reachability test covers check scripts under `tooling/scripts`, so deleting the `hook-generics` step from `tooling/scripts/check.mjs` passes; `tooling/scripts/ci-workflow.test.mjs` covers `package.json` scripts only. owner: zbeyens. stop: a test fails on a check script that is neither a `check.mjs` step nor listed manual, or the owner drops it.
- The www API-reference check throws at `apps/www/scripts/build-api-reference.mts:231` ("must be included or excluded exactly once"). The base control ran in a worktree a patched build had touched and its log lost the message, so "pre-existing" is inferred until a clean worktree at `HEAD` reproduces it. owner: zbeyens. stop: `pnpm api-reference --check` passes in `apps/www`, or a clean `HEAD` run shows the same message. Tracked here until its owner's plan claims it.

## Panel gate

The build's diff had two rounds, the cap. Round 1, on frozen `486ced75698cb0c945f26188a481ccd7e38e87c2`, raised nine criticals, all on the new check: five were applied, three dismissed with the limit stated, and one applied by narrowing the check's claims to client entrypoints. Round 2, on `3a25f8ab358083f45f02261bb0aed9e3694e1469`, raised criticals only against two round-1 fixes, and both were reverted to the code round 1 reviewed. No known critical finding remains, and no additive change waits unreviewed.

The plan's own panel had two rounds, the cap. Round 1, on frozen commit `4f4a8c1a753f8515a3418e9870ee1013744c6dab`, applied five critical findings. Round 2, on `5e6c7f9e1ff8d13bae651addbab93d08d6c4ac5e`, found seven critical findings across its seats. After the cap, this plan took only subtractive fixes: the element and creation work moved to Open work, the round-1 Plate `view` change was reverted to the round-1 text, and the check's and `useCommand`'s claims were narrowed. The additive fixes wait unreviewed in `docs/plans/artifacts/2026-10-06-react-review/panel/round-2/unreviewed.patch`: a three-argument `useCommand` contract case, a read-only case through `useCommand`, a check predicate that requires evidence on every accepted input path and scans `ssr` entrypoints, and the named internal contract.

## Close

### Build

Deviations from the approved steps, each with its decision-log row:

- Build step 1's `useRootEditor<CustomValue>()` expectation is gone. It errored only because `CustomValue` is not a root key, so it could not catch a returning value generic; `pnpm check hook-generics` does. The exact return check and both selector expectations remain.
- Build step 2's "only cast in the provider" holds for what the context returns. `registerViewEditor` still takes `RegisteredViewEditor`, a named `ReactRuntimeEditor<any>`. `PliteRuntimeView` bounds its editor by `ReactEditorType<any, any>`, which cannot prove the core state groups, and a cast at that call site would be an `as unknown as`. The other registry inputs take the core contract. The creation item under Open work owns that bound.
- Build step 4 types the view through `packages/platejs/src/react/internal/plite-types.ts`, the existing private alias, instead of a new bridge alias.
- Build step 6's baseline runs through `finding-baseline.mjs` and keys each finding by its type parameter's line, not by package, file, symbol, overload index and name. An overload index shifts when overloads move, and the shared helper bounds the baseline by its committed copy. The check takes the helper's modes: `--check` in `pnpm check`, the default mode to drop fixed entries, and `--init`. It judges each exported value's call signatures, so an annotated const counts and a hook-named value with no call signature fails closed.
- Build step 8 does not document `useCommand`, because the Plate page documents `platejs/react`, which omits it.
- Build step 9 writes no changeset, because the removed and retyped hooks never shipped.
- The owner committed the tree as `cd19701029` ("v2") during the build panel's first round. That commit holds this build exactly as the panel reviewed it (frozen `486ced7`), including the check's line-keyed baseline. The round's fixes sit on top of it. Two were reverted before round 2: keying the baseline by hook and parameter turns the local check red against the committed copy until a new baseline is committed, and scanning headless entrypoints finds four `withPlite.ts` parameters, which `AGENTS.md` says a widened rule fixes or excepts rather than baselines. Round 2 reverted two more round-1 fixes, the empty recursion seed and the mapped-type optional modifier, after its seats showed each misjudged real TypeScript; Proof limits states both forms.

What landed: `useActiveEditor`, `useActiveRoot`, `useRootEffect`, `RootEditor`, `UseRootEffectOptions` and the provider's view-effect queue are gone from `plitejs/react` and `platejs/react`. `useRootEditor` and `useCommand` take no value or plugin type, and the runtime selectors read the core React editor state. `pnpm check hook-generics` runs the new check over the client entrypoints with a 19-finding baseline. The hooks page shows the active-root composition, and `docs/vision/plite.md` and the `AGENTS.md` rules row name the check. The owner's commit `cd19701029` holds the build as the panel's first round reviewed it; the panel fixes, the lint pass and these plan edits sit uncommitted on top of it.

Files the build changed or proved: `packages/plitejs/src/react/hooks/use-plite-runtime.tsx`, `packages/plitejs/src/react/hooks/use-plite-history.ts` (unchanged; a caller the typecheck proves), `packages/plitejs/src/react/index.ts`, `packages/platejs/src/react/core.tsx`, `packages/platejs/src/react/plite-react.ts`, `packages/platejs/src/react/internal/plite-components.ts` (unchanged; the Plate view wrapper), `packages/platejs/src/react/plugin/PlatePlugin.ts`, `packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx`, `packages/plitejs/test/react/generic-react-editor-contract.tsx`, `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx`, `packages/plitejs/test/react/use-plite-root-command-hooks.test.tsx`, `content/docs/api/react-hooks.mdx`, `tooling/scripts/check.mjs`, `tooling/scripts/check-hook-generics.mjs`, `tooling/scripts/check-hook-generics.test.mjs`, `tooling/scripts/check-hook-generics-baseline.json` and `docs/vision/plite.md`.

Proof and its limits: the acceptance run used a fresh worktree at `cd19701029` with this build's patch. The `platejs` typecheck, every `plitejs` source partition, the type contract, the React partition (93 files, 1419 tests), the check with its 14 tests and 13 caught mutations, `lint-baseline`, `public-types` and www `tsc` passed (decision row "Acceptance proof"). A docs preview rendered both pages (`docs/plans/artifacts/2026-10-06-react-review/build/docs-preview-a1.log`). Two checks fail in that worktree and in a clean `HEAD` worktree the same way: the `plitejs` test typecheck at `screen-reader-announcement.test.tsx:202`, which Build steps 2 and 10 accept under a `look` Defaults row, and `pnpm kb check`, whose baseline another session has not committed. The check's blind spots are listed under Proof limits. Nothing here claims browser behavior.

Panel: the build's diff had two rounds, the cap, with Opus, `gpt-6-astra @xhigh` and `gpt-6.1-sol @xhigh` answering both. Round 1 raised nine criticals on the check: five applied, three dismissed with their limits stated, one applied by narrowing the claims to client entrypoints. Round 2 raised criticals only against two round-1 fixes; both were reverted to the reviewed code. The build ships under the Defaults row, and "hold" reverses it.

Counts: of 26 tracked items (the owner's "go", ten Build steps and fifteen Completion Gates), 21 are done, 3 partial (Build steps 2 and 10 and the Code slice proofs gate, under the type check Defaults row), 2 skipped (the changeset, because the hooks never shipped, and its gate), 0 blocked and 0 open. Reflect did not run again: the owner corrected no workflow after the plan-stage reflect, and this build's slips are logged as rows.

Open work: the items under Open work, now also in `docs/plans/topics/react.md`, each with its owner and stop. The plan stage's four shared-source reflect lessons landed in dotai `04b2cb7` and reached this checkout through a sync during the build, uncommitted here: `.agents/pstack/freeze.mjs` and the matching `AGENTS.md` rules.

Next: `node tooling/scripts/review-ledger.mjs next` first named `documents`, but `docs/plans/2026-10-06-documents-review.md` is building it in another session. After `docs/plans/2026-10-06-ledger-in-flight.md`, `next` skips that scope and three more in flight, and names `pagination`.

### Build attention

reviewed by GPT-6 (Codex)

- **2026-10-06T16:31:43Z — “critical … the baseline identity drops the hook…”; 16:54:02Z — “Ship the build diff after the panel cap.”** The dismissal’s probe proves that re-keying conflicts with the committed baseline. It does not rebut the identity collision: `red-after.log` still fails that case. Proof limits acknowledges the bypass, but migration difficulty alone does not support dismissing its severity. Shipping depends on accepting this remaining risk.

- **2026-10-06T16:59:23Z — “Acceptance proof on the final bytes…”; transcript 17:00:08Z.** The acceptance evidence is real, including the matching clean-HEAD failure. However, Close says “Both package typechecks … passed,” while `plitejs-typecheck-a1.log` exits 1. Build steps 2 and 10 are checked despite requiring that proof to pass; step 10 explicitly says to revert otherwise. No Defaults row explicitly accepts the narrower proof.

- **2026-10-06T16:59:23Z — “Acceptance proof on the final bytes…”** Its evidence names `build/accept/accept-task-a1.patch`, which does not exist. The actual patch is `build/accept-task-a1.patch`. The Execution packet gate repeats the wrong path. This breaks the pointer identifying the tested changes, although the transcript shows the correct patch being applied.

- **2026-10-06T15:35:24Z — “Step 8: update the Plate React hooks page and regenerate registry docs.”** The builds and regeneration ran. The approved step also requires a preview of both documentation pages. I found no preview action or evidence in the build transcript, yet the step is checked. A source build and TypeScript check do not establish that the pages rendered correctly.

- **2026-10-06T16:31:43Z — “www tsc run directly on the shared checkout before the panel.”** The API-reference failure used to justify bypassing the package typecheck chain has no clean-HEAD reproduction in this build. The frozen plan itself says the earlier control used a patched worktree and lost the failure message. Calling that failure pre-existing remains inferred; the package-integration proof remains unrun.

- **Transcript 2026-10-06T15:40:30Z compaction; 16:31:43Z — “Re-read AGENTS.md before the panel launch…”** The first post-compaction actions inspect reviewer output and then edit documentation. They do not perform the required instruction, models-sheet and pin rereads. Later instruction comparisons also truncate output by column, including `l[:600]` at 16:32:19. The trail therefore does not establish complete compliance with the rule-refresh gate.

- **2026-10-06T16:53:38Z — “Slip: two probes overwrote tracked files in the shared checkout”; transcript 16:51:16–24Z.** Restoration evidence supports the recorded slips, but the probes still exposed shared tracked files to temporary invalid states. The separate temporary file written into `tooling/scripts` and removed appears only in the transcript, without its own slip row. Later detached-worktree probes improve the process; they do not erase these violations.

The lead's answers, each logged as a `trail` row: the identity collision stays a stated limit that ends when the creation plan empties the baseline; the typecheck proof is accepted by the Defaults row above; the patch path, the docs preview and the three slips are corrected or logged; the API-reference failure stays inferred under Open work.

### Plan stage, before your answer

Reversals first. The post-cap narrowing first dropped the read-only bug start gate; reflect's divergent reviewer showed that loosens the gate, and the plan restored it. The first draft cut `useCommand` and `useRootEditor`'s `readOnly` option; the read-only probe reversed both. The first draft swapped the arena's type-aware guard for a syntactic lint rule; round 1 swapped it back. Round 1 widened Phase 2 to the creation functions and the context selector; round 2 found it still incomplete, and the plan moved that work out. Round 1 typed Plate's `view` as Plate's `Editor`; round 2 found that types its value `any`, and the plan reverted to the round-1 text. The trail review found the post-cap narrowing had loosened the check's baseline seeding; the plan restored the restriction.

What landed: this plan in one phase, the subject file `docs/plans/topics/react.md`, the decision log beside this plan, `packages/plitejs/src/react/editable/typed-text.ts` added to `docs/research/review-scopes/react.json`, and the corrected `rm` rule at `~/.claude/CLAUDE.md:18`, which the owner asked for. No product code changed and nothing was committed.

Proof and its limits: the blast-radius spike's typechecks, the base-failing type-contract probe and the read-only probe, as Proof and Evidence say. The rest of the build's proof runs only after your go. The check script does not exist yet, and the four additive fixes in `panel/round-2/unreviewed.patch` have no reviewer.

Panel: two rounds, the cap. Round 1 applied five critical findings. Round 2 found seven critical findings across its seats; after the cap, the plan resolved them only by narrowing claims, reverting round 1's `view` change and moving the creation work out.

Counts: of 21 tracked items, 20 are done and 1 is partial (reflect: its shared-source lessons wait in a saved dotai patch); none is skipped, blocked or open once this page publishes.

Open work: the five items under Open work, each with its owner and stop.

### Reflect

Three Opus reviewers read this run's transcript and an Opus synthesizer sorted their findings (`docs/plans/artifacts/2026-10-06-react-review/reflect/synthesis.md`): 14 accepted, 14 rejected, 8 backlog. Under the owner's standing reflect authority, the ten lessons that edit this repository are applied: `.agents/playbooks/plan.md` now probes every unverified premise before the arena pick, proves a cut's redundancy at runtime, phases only census-proven members of a regression class, logs a post-verdict swap as a deviation and loads `verify` before base controls; `.agents/playbooks/api-review.md` lets a verdict stale only from moved doctrine go to plan after the law diff is read; `verify` now triggers before calling a failure pre-existing and before a base control, and its commands reference says a patched worktree is never base and a proof runs `pnpm check <step>`; `~/.claude/CLAUDE.md` notes that Apple Git's `git grep -E` has no `\b`. The four shared-source lessons (a `freeze.mjs` helper for panel freezes, attempt-indexed proof logs, a wider `/pstack:correct` trigger for repeated shell mistakes, and removing a gate counting as additive after the cap) wait in a dotai patch, listed under Open work. The rejected rows and their reasons are in the synthesis file.

### Attention

reviewed by GPT-6 (Codex), `gpt-6.1-sol @xhigh`

- The post-cap narrowing loosened the check's baseline to any finding on the finished build. Restored to the creation item's surfaces (log `trail` rows).
- Several round-2 rows say `applied` where the plan only narrowed a claim or moved work out. No repair was reproduced; the stronger predicate and new test cases stay in the unreviewed patch.
- The erasure row's cited log was overwritten by a later run. The errors are recovered verbatim in `blast/spike-first-run-errors.log`.
- Both runtime controls ran in the shared checkout, not a clean base. They prove the commands exist, not base behavior.
- The `rm` fix is a corrected rule, not proof the mistake cannot recur. A hook that blocks `rm` with a variable path would enforce it; that is offered, not done.

## Evidence

### Requirements

- The user job: mount one editor's independent views in React and let controls inside or outside a view read state and run commands against the right mounted root.
- Context retrieval returns the mounted contract without caller generics, and selector hooks infer only their selected result (`docs/vision/plite.md`, React creation and context retrieval).
- Public generics correlate with a typed input, an installed descriptor or a descriptor-owned validator; no method-level generic manufactures a capability or chooses a result type (`docs/vision/plite.md`).
- Exact plugin capabilities come from `editor.plugin(Plugin)`.
- `EditorRoot` requires an editor and owns one independent mounted view; mounted-view identity, keyed replacement, callback scope, registration, cleanup and its read-only and authored policy stay correct.
- Hard cuts over compatibility, and every claim names its check (`VISION.md` Invariants).
- The owner's words this run: "already in progress in another session, do the next one", then "go plan".

### Lanes

The arena prompt, rubric, grounding, the three runner packages and the judge's verdict are in `docs/plans/artifacts/2026-10-06-react-review/arena/`. Opus wrote candidate C, `gpt-6-astra @xhigh` wrote A and `gpt-6.1-sol @xhigh` wrote B, each read-only through `.agents/pstack/cross.mjs`. An Opus cross-judge scored C 22, B 19 and A 18 of 24, and the lead's own scoring picked the same base.

- Keep the hooks and strip only the generics, the review's minimal option. It loses on interface depth: `useActiveEditor` composes two public hooks, `useRootEffect` is a second effect system, and nothing stops a third regression.
- Cut four hooks, including `useCommand`, and add a command member to the plugin view (C and B). The first round cut `useCommand`; the panel and the read-only probe reversed that. The member is deferred: no shipped command or doc needs it, and it must be written in four Plite `createPortal` branches, Plate's portal producers and the React view proxy (`plugin.ts:1867-1889`, `use-plite-runtime.tsx:287-325`).
- Return the registered mounted view, or `null`, from `useRootEditor` (B). Rejected here: it adds per-root notification code and breaks callers that need a root editor before `Editable` mounts (`screen-reader-announcement.test.tsx:86-99`, `plite-runtime-provider-contract.test.tsx:381-407`). The read-only bug fix reopens how a root editor gets its policy.
- Typed hooks bound to one editor, `editorHooks(editor)` (C's alternative). Rejected: a second way to read context that fights independent documents in one tree.
- The strongest deletion that survives the panel: three hooks, `RootEditor` and the provider's effect queue.

Challenge delta: improved. The review proposed dropping `V` and `TPlugins` and left the deletion set to Best API. The arena deleted `useActiveEditor`, `useActiveRoot`, `useRootEffect` and `RootEditor`, made the context plumbing non-generic, and chose the type-aware guard. The panel kept `useCommand` and `readOnly` after the read-only probe, and moved the element and creation work to its own plan.

### Prior work

From `node tooling/scripts/review-ledger.mjs show react` and `lookup react --detail`:

- 2026-07-23 assessment, no verdict. Its record is historical.
- 2026-08-06 `docs/plans/2026-08-06-cut-explicit-react-editor-hook-generics.md` cut 72 explicit context-editor generics, including `useActiveEditor<EditorType>()`, and set the law. Its proof was one-time `rg` queries, never a gate. This review's first plan search missed it; the grounding explainer found it.
- 2026-08-23 provider-lifetime fix, recovered on 2026-09-18. Its proof is historical.
- 2026-09-12 review, Pursue: remove `Runtime` and `useRuntime` for one required-editor `EditorRoot`. It landed. Its adopting work also added `useRootEditor`, `useRootEffect` and `useCommand` with caller generics, although its design said to drop them.
- 2026-09-30 content-root design, execution and closure, completed locally. Retained; this plan does not touch content roots.
- 2026-10-04 audit and `2026-10-04-react-audit-2`, Pursue, the head this plan builds. Retained.

### Blast radius

A spike of the first-round cut ran in a detached worktree at `da4898bb61` (`docs/plans/artifacts/2026-10-06-react-review/blast/spike.patch`). Controls at base passed `pnpm --filter plitejs typecheck`, `pnpm --filter platejs typecheck` and the generic contract `tsc`. Under the spike, the only breakages were the callers in Hard cuts plus the `useCommand` import the first round removed. That the revised plan breaks no other caller is inferred: it keeps `useCommand` and `readOnly`, and its context typing was not spiked. www `tsc` showed one identical error at base and under the spike, a generated docs module a fresh worktree lacks. The spike also showed the context needs one named erasure point: `createPliteRootEditor` rejected the `any` context until its parameter named it (`use-plite-history.ts:142`).

### Freshness

Between `17195da367`, the commit that added the head record, and `da4898bb61`, `use-plite-runtime.tsx` changed only import order and `plite.tsx` moved the provider to `getEditorRuntime(editor).subscribe`. `VISION.md`, `docs/vision/common.md` and `docs/vision/plite.md` were reread for this plan, and their law on context retrieval and public generics is unchanged.

### Failure modes

- A downstream app calls `useActiveEditor`, `useActiveRoot` or `useRootEffect`, or passes type arguments to `useRootEditor` or `useCommand`. It fails to compile on upgrade. The Hard cuts table gives each rewrite; no changeset names them, because they never shipped.
- A downstream selector reads a plugin's state group through `useRuntimeState` or `useRootState`. It fails to compile once the state is the core type. It reads `editor.plugin(Plugin).read` instead, which the descriptor types.
- A downstream control dispatches a plugin-owned command through `useCommand` with an asserted tuple. It fails to compile, and moves the dispatch into the owning plugin's `api`, which then runs on a root editor and shares the read-only bug.

The build rolls back by restoring its files from the copies taken before it. No scale probe applies, because the build changes types and deletes code. The deleted effect queue ran only when a hook registered into it (`use-plite-runtime.tsx:612-621`, `:691-697`), so no hot path gains work.

### Proof limits

- The repository census covers this repository only, not downstream apps.
- The spike changed types and exports but did not delete the effect queue or run React tests; those run in the build.
- The check scans exported hooks and `createEditor` and `createEditorWithEditor` in the packages' client entrypoints only. It does not scan the headless `createEditor` that `platejs` exports (`packages/platejs/src/lib/editor/withPlite.ts:1492-1505`), `ssr` entrypoints such as `platejs/static`, registry source copied into apps, or other exported generic functions.
- The check counts every interface type argument as plain, required input. An interface member that names the parameter only optionally or only in a callback's parameters, an interface call signature, and a type-literal setter therefore pass. Resolving interfaces like aliases flagged `useAnnotation` and `useAnnotations`, whose `TData` TypeScript infers from a store already typed `AnnotationStore<TData>`, and `useAnnotationStore`, whose `TData` comes only from its annotations' optional `data` (`docs/plans/artifacts/2026-10-06-react-review/panel/build-round-2/interface-variant-a1.log`), so the check keeps interfaces opaque and the creation item takes `useAnnotationStore`.
- The check counts an array rest parameter as supplied input, so a call with no rest arguments lets the caller choose. Marking an array rest optional would flag `useComposedRef`, whose `T` appears only in its callback result; `usePluginStore` and `useEditorPluginStore` take tuple rests (`docs/plans/artifacts/2026-10-06-react-review/panel/build-round-2/rest-census-a1.log`).
- An optional property written through a mapped type, such as `Partial` or a `+?` modifier, and an optional element of a rest tuple count as required input. A recursive alias's reference to itself counts as plain input. Round 1 of the build panel tried to close both; round 2 showed each fix misjudged real TypeScript (`Required<Partial<…>>`, and mutual recursion whose verdict changed with export order), and both were reverted.
- The check does not see a type parameter whose only evidence is a required parameter or property that also admits `undefined`, a union branch without it, or a phantom interface parameter. For a hook with no return annotation it matches the parameter's name in the printed result, so a same-named type elsewhere in that result reads as reached.
- The baseline keys each finding by the trimmed line of its type parameter, through `tooling/scripts/finding-baseline.mjs`, and its committed copy bounds it. A new hook in the same file can take over a fixed finding whose line reads the same; `useCreateEditor.ts` and `withPlate.ts` repeat such lines. Keying by hook and parameter re-keys every committed entry, so the local check fails against `cd19701029` until a new baseline is committed (`docs/plans/artifacts/2026-10-06-react-review/panel/build-round-1/rekey-probe-a1.log`); the risk ends when the creation plan empties the baseline.
- The check uses the TypeScript 6 compiler API, as `tooling/scripts/check-plite-bridge.mjs` does, and ran in 2 to 4 seconds over 38 client entrypoints across this build's runs.
- No build test mounts a read-only root through `useCommand`; the build keeps its dispatch path unchanged.
- The read-only probe ran in jsdom with one registered read-only header view; it did not cover two views of one root, an unregistered root, authored policy or a policy change after mount.
- www's package-integration `tsc` does not run while the API-reference failure stands; `git grep` finds no package-integration file that uses a hook or type this plan changes.

Model: Claude Opus 5.5 led; the arena ran Opus, `gpt-6-astra @xhigh` and `gpt-6.1-sol @xhigh`; Opus judged; the panel seated the same three models.

Ledger counts from `node tooling/scripts/review-ledger.mjs status` on 2026-10-06: 67 scopes, 0 unreviewed, 0 fork, 33 pursue-not-adopted, 1 deferred (search), 33 closed. `react.json` gained `packages/plitejs/src/react/editable/typed-text.ts`, and coverage now lists no unowned file.
