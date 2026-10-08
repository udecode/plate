---
review_scopes: [suggestions]
review_basis: [2026-10-07-suggestions-review]
verdict: pursue
work_kind: implementation
review_commit: b3482a2034af62a585e275ada6067ad244a809d8
review_inputs: [packages/platejs/src/lib/editor/editorUser.internal.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/react/editor/withPlate.ts, packages/platejs/src/react/editor/useCreateEditor.ts, packages/platejs/src/static/editor/withStatic.tsx, packages/platejs/src/lib/editor/editorUser.spec.ts, packages/platejs/src/react/editor/useCreateEditor.spec.tsx, packages/platejs/src/lib/editor/withPlite.slow.ts, content/docs/api/core.mdx, content/docs/api/react-hooks.mdx, docs/plans/2026-10-07-suggestions-review.md]
---

# Suggestions: cut the existing-editor input

Status: executed: built, reviewed and folded; waiting on your commit
Playbook: plan

Pursue. `createEditor` takes an existing editor through its `editor` option, and so do the React `createEditor`, `createStaticEditor`, `useCreateEditor` and `useStaticEditor`. No product source, copied UI, example, template or docs page passes one. All 93 uses are tests, and 31 calls in 25 tests need an existing editor because they test that input's own guards. Every guard of the editor-user record that the previous iteration built, its construction phases, its three refusals and its retry, exists only because an existing editor can come back in. The input also drops `id` and `lifecycleErrorSink` with no error, keeps a failed attempt's `readOnly` and `maxLength`, and makes `useCreateEditor` throw on a development StrictMode mount. Cutting it leaves the record as one fixed `userId` and the author read. This review was owed before the previous iteration rebuilt the editor-user mechanism, as the Build playbook requires, and the decision-trail review found it skipped. Removing the input is a hard cut, which builds only on the owner's word; the owner answered "continue poteto mode" on the page that recommended removal.

## Brief

### What will change?

Every Plate editor is now created new, and passing an existing editor throws a clear error. The user record lost its build phases and refusals. The Close lists the proof and its limits.

### What could go wrong?

An outside app that passed its own editor now gets an error. No app route was tried in a browser. Two review rounds found two serious gaps, and the build fixed both. The generated API reference still lists the removed `currentUserId`, because its generator fails at HEAD.

## Public API

A test or app that built a raw editor first and handed it in now lets `createEditor` allocate.

```tsx before
// packages/platejs/src/lib/editor/withPlite.slow.ts
const editor = createReactEditor({ editor: createPliteEditor() });
```

```tsx after
// packages/platejs/src/lib/editor/withPlite.slow.ts
const editor = createReactEditor();
```

The hook stops taking an editor, so it can no longer throw on a supplied editor's rebuild.

```tsx before
// packages/platejs/src/react/editor/useCreateEditor.spec.tsx
useCreateEditor({ editor: supplied, initialValue, userId })
```

```tsx after
```

## What other editors do

Read from local checkouts at the commits named. Only Slate composes onto an editor the caller made first; Lexical, Tiptap, ProseMirror and BlockNote each build from options alone.

| Editor | How an app gets an editor | A built editor can come back in | Source |
| --- | --- | --- | --- |
| Slate `945a484df` | `withReact(createEditor())`: each `with*` function takes an editor and returns it enhanced | Yes; nothing stops a second wrap | `ianstormtaylor/slate@945a484df:packages/slate/src/create-editor.ts:91`; `ianstormtaylor/slate@945a484df:packages/slate-react/src/plugin/with-react.ts:16-22` |
| Lexical `dd5c41b13` | `createEditor(config)` allocates | No editor input | `facebook/lexical@dd5c41b13:packages/lexical/src/LexicalEditor.ts:926` |
| Tiptap `91c51be53` | `new Editor(options)` | No editor input | `ueberdosis/tiptap@91c51be53:packages/core/src/Editor.ts:121` |
| ProseMirror | `EditorState.create(config)`, then `new EditorView(place, props)` | The view takes a state, never an editor | `ProseMirror/prosemirror-state@ffad5d945:src/state.ts:185`; `ProseMirror/prosemirror-view@ca4c78e9b:src/index.ts:69` |
| BlockNote `1e26f1c5e` | `BlockNoteEditor.create(options)`, with a protected constructor | No editor input | `TypeCellOS/BlockNote@1e26f1c5e:packages/core/src/editor/BlockNoteEditor.ts:419-435` |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One internal `buildEditor(options)` that allocates and builds | Plate | `platejs` core, `lib/editor/withPlite.ts` | Every constructor allocates in one place, so freshness and the allocation options cannot drift apart again |
| One `assertConstructorOptions(options)` that refuses the removed `editor` and `migrations` keys, which every public entry calls on the options it received, before any copy or memo | Plate | `platejs` core, `lib/editor/withPlite.ts` | A spread or destructure drops a non-enumerable or inherited key, and a memoized hook skips the constructor on later renders |
| The React `createEditor` and `createStaticEditor` call `buildEditor`; `useCreateEditor` and `useStaticEditor` assert on every render | Plate | `platejs/react` core and `platejs/static`, which already import core | `createStaticEditor` allocates with `id` alone today and drops `lifecycleErrorSink` |
| `editor.userId` is a fixed data property defined right after allocation, and a Plate `WeakMap` from editor to user, written at the same moment, serves the author read through the runtime owner | Plate | `platejs` core, `lib/editor/editorUser.internal.ts` | Plite's owner type carries no Plate fields, and an editor-like object that never copied the property still finds its owner's user |

## Hard cuts and app migration

The callers come from the census in `docs/plans/artifacts/2026-10-07-suggestions-editor-input/how/`.

| Removed or changed | Repository callers that break | App migration |
| --- | --- | --- |
| The `editor` option of `createEditor` from `platejs` and `platejs/react`, `createStaticEditor`, `useCreateEditor` and `useStaticEditor` | None outside tests; 64 test calls pass the key | Pass the document as `initialValue`, the selection as `selection`, and `id`, `readOnly`, `maxLength` and `lifecycleErrorSink` as options; render an existing editor with `EditorRoot` |
| The two internal `createEditorWithEditor` functions | 29 test calls | Call `createEditor` |
| Building the same editor again after a failed build | The retry specs | Create a new editor |
| `platejs/testing`'s raw Plite helpers, such as `createEditorFromFixture` and hyperscript `createEditor`, can no longer feed a Plate constructor | No first-party caller passes their result to a Plate constructor | Keep them for Plite-level consumer tests; a Plate test calls `createEditor` with `initialValue`. `VISION.md` line 54 says so through `best-api repair` |

## Main changes

- `buildEditor(options)` replaces `applyEditor`, `applyPlateEditor`, both `createEditorWithEditor` functions and the three separate allocations. It allocates with `id`, `lifecycleErrorSink`, `readOnly` and `maxLength`, records and defines `userId`, and builds. The construction comparison decides the document flag. When swapping it gives the same results with an authored document, the flag goes and every constructor keeps the envelope. Otherwise `buildEditor` takes the flag each constructor passes today.
- `assertConstructorOptions(options)` throws when `'editor' in options` or `'migrations' in options`, which sees an own, inherited, enumerable or non-enumerable key without calling a getter. The base and React `createEditor` and `createStaticEditor` call it first, `useCreateEditor` and `useStaticEditor` call it on every render before `useMemo`, and `buildEditor` calls it again on its own copy, which closes a Proxy whose `has` trap hides the key. The `migrations` check inside the build goes. Deviation (diff panel rounds 1 and 2): the built check counts a key that either `in` or an own-property check along the prototype chain sees, which needs no second call on `buildEditor`'s copy; a proxy that hides a key from both is outside the claim.
- `editorUser.internal.ts` keeps `resolveEditorUserId`, a `WeakMap<object, string>` from editor to user that `buildEditor` writes once, and `readEditorAuthor`, which reads that map through `getEditorRuntimeOwner(editor)` and still throws `This editor has no user` when the owner has none. The phases, the getter, admission and settle go.
- The failure-path restores, the empty-document fit and `resolvePlugins`' publication guard stay, with `publicationBeforePlugin`, `resolvePlugins`' `clearPluginStores` at entry and the `readOnly` and `maxLength` writes in `prepareInitialPlatePlugins`. A compile that fails early still needs the preparation restore, and a runtime schema with a root minimum of 0 still reaches the empty-document fit (plan panel round 1). Deviation: the build deleted `publicationBeforePlugin` and the `readOnly` and `maxLength` writes, because with every editor allocated just before preparation they are always unset or repeat what allocation already set (code-quality review); the existing `readOnly` and `maxLength` specs and the construction comparison cover them.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Existing-editor input | Four constructors and two hooks accept an `editor` | Removed; an `editor` key in the received options throws at every public entry and on every hook render | Plate core | No non-test caller, and it alone needs the record's phases and refusals | Phase 4, on the owner's word | One refusal case per entry and one helper block, each failing at base, with a mutant per entry and per wrong predicate | An outside app that passes raw editors breaks loudly | cut |
| Editor-user record | A record per editor with phases, a getter and three refusals | A fixed data property and a Plate map from editor to user, both written at allocation; the author read uses the map through the runtime owner | Plate core | With fresh editors, no user code runs before the user exists | Phase 4 | Kept specs on the fixed user, with writable, configurable and define-after-build mutants | An editor-like object that never copied the property; reading through the owner removes it | rearchitect |
| Allocation | Three allocation sites with different options | One allocation in `buildEditor` for every constructor; the compile path keeps its own throwaway editor, which has no user | Plate core | `createStaticEditor` drops `lifecycleErrorSink` | Phase 4 | A static spec that fails at base | None found | rearchitect |
| Reuse-only branches | Restores, the empty-document fit and the publication guard | Kept, with the build and preparation restores pinned by tests | Plate core | Panel round 1 showed an early compile failure and a root minimum of 0 reach two of them | Open work | Rewritten cleanup tests and mutants that delete each restore | None while pinned | keep |

## Steps

### Start gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| The owner's answer to the hard cut | yes | "continue poteto mode", logged as a plan row in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` |
| Execution authority and packet | yes | the owner's answer above; packet `docs/plans/artifacts/2026-10-07-suggestions-editor-input/packet.txt`, frozen as build base `7dc371b775fd052d504d1e2d9aedd6efe9d0079e`, whose code paths match `b3482a20` |
| The pre-fix tree for every `--expect-fail` run is the frozen product tree `b3482a2034af62a585e275ada6067ad244a809d8`, where `AuthoredPlugin` and the previous iteration's code load | yes | `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-3.commit` names it |
| Files that hold another session's uncommitted work are copied to the run directory before the first edit | yes | all 29 packet files copied to `docs/plans/artifacts/2026-10-07-suggestions-editor-input/pre-edit/` |

### Completion gates

| Gate | Evidence |
| --- | --- |
| `pstack:blast-radius` on the removed input before code moves | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/blast/blast-radius.md`, census `docs/plans/artifacts/2026-10-07-suggestions-editor-input/blast/census-a1.log` |
| `pstack:thermo-nuclear-code-quality-review` on the phase, and a freeze | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/thermo/reply.md` on freeze `7997afcf`; its fixes are on freeze `cf9df977` (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/slice-review.commit`) |
| Hard-cut sweep of callers, exports, tests, docs, examples and benchmarks | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/blast/census-a1.log` and the build rows in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv`; `git grep` over `packages/platejs` finds the removed names only in the refusal specs |
| `best-api repair` for every artifact that teaches the existing-editor input | the best-api repair row in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` |
| The construction benchmark on the final build path through `benchmark` | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/bench/authored-construction-a2.log`, within budget, with `pstack:benchmark-checklist` before its verify row |
| `plate-docs` on `content/docs/api/core.mdx`, its Chinese twin and `content/docs/api/react-hooks.mdx` | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/build-source-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/docs-parity-a1.log` and the coverage row in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` |
| `pnpm exec oxlint --type-aware` on the task's lintable files before the diff panel | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/oxlint-type-aware-a2.log`, 24 files linted of 24 passed |
| Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and plans | the writing rows in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv`; comment reviews `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/comments/reply.md`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-1/comments/reply.md` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-2/comments/reply.md` |
| Panel on the diff (reviews: api-build) and its fixes | two rounds, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-1/` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-2/`; round 1's two criticals applied, round 2 found none |
| Changeset bullet for `platejs` | `.changeset/platejs-editor-user.md` |
| `pnpm brl`, `pnpm --filter www build:registry` and `pnpm check` | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/check-generated-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/build-registry-check-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/pnpm-check-tree-a1.log`, 20 of 25 steps after the public-types fix, with five failing as at HEAD and their later links passing (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/www-later-links-a1.log`) |
| Lint fix on the task's files | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/lint-fix-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/oxfmt-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/lint-check-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/oxlint-type-aware-a5.log`, 24 files of 24 |
| Repeated acceptance proof on final bytes | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/run-a2.out` on the final freeze |
| Decision-trail review | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/trail/review-sol.md`, with its rows and the Close's Attention |
| Fold the delta into `docs/plans/topics/suggestions.md`, ledger check and lookup, publish, and name the next ledger item | `docs/plans/topics/suggestions.md` (copy before the fold: `docs/plans/artifacts/2026-10-07-suggestions-editor-input/fold/suggestions.before-fold.md`) and the ledger rows in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` |
| `/pstack:reflect` | `docs/plans/artifacts/2026-10-07-suggestions-editor-input/reflect/synthesizer/reply.md`, with the three reviewer replies beside it; the Close's Reflect section lists the Accepted, Rejected and Backlog items, and `docs/plans/2026-10-08-suggestions-reflect-lessons.md` lands them |

### Phase 4: one allocating build path

- [x] Write the new specs first and run each on the pre-fix tree `b3482a20` through `proof-worktree.mjs --expect-fail` with the case's failure line. Each of base `createEditor` in `withPlite.spec.ts`, React `createEditor` and `createStaticEditor` in `withStatic.spec.tsx`, and `useCreateEditor` and `useStaticEditor` in `useCreateEditor.spec.tsx` refuses an unbuilt raw editor passed as a non-enumerable own key of the received options. One block on base `createEditor` refuses an inherited key, `editor: undefined` and `migrations`, and asserts that an `editor` getter was never called before it asserts the throw. Each hook refuses a rerender that adds the key without changing its memo dependencies. `createStaticEditor` forwards `lifecycleErrorSink`, in `withStatic.spec.tsx`. Proof: each case fails on `b3482a20` for its own assertion, never for a missing import.
  Done: `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/step1-base-a1.log`, twelve failure lines matched. Deviation: the React `createEditor` case lives in `withPlate.spec.ts` beside its implementation, `useStaticEditor` gets only its rerender case because its mount case fails only when `createStaticEditor`'s does, and the helper block adds proxy cases; after diff panel round 1 they fail when the check drops its `in` test or its own-property walk.
- [x] Closed by `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-step2/mutate/`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-step2-static/mutate/`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-restores-2/mutate/`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/probe/mutant-bare-construction-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/test-platejs-slice-a1.log`. Build `buildEditor` and `assertConstructorOptions`, route every constructor and hook through them, write the user map and define `userId` as a fixed data property at allocation, and reduce `editorUser.internal.ts`. Type `buildEditor` generically over the root plugin's definition input, so the diff adds no `as unknown as` and no `Parameters<typeof …>` to `withPlite.ts`, `withPlate.ts`, `withStatic.tsx` or `editorUser.internal.ts`. Proof: the new and kept specs pass. Separate mutants each fail their case: the assertion dropped at each of the five entries, the assertion run on a copy, `Object.hasOwn` and `options.editor !== undefined` as the predicate, the sink dropped at allocation, the property writable or configurable or defined after the build, the build-path restore deleted, and the preparation restore deleted. A `git diff` of the four files adds neither cast. The arena's construction snapshot and compile artifact runs match today's output. They gain an `AuthoredPlugin` case and a mutant that swaps the document flag, whose result decides the flag. `compileEditor.test.ts`, `pnpm --filter platejs typecheck` and the platejs tests pass.
  Deviation: `buildEditor` is generic over the editor type its `initialValue` callback receives, not over the root plugin's definition input. The root plugin's keys reach `createBasePlugin` untyped, which validates them at run time, because typing them is the closed option set that Open work item 2 leaves to the owner.
- [x] Closed by `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/test-platejs-slice-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-restores-2/mutate/build-restore-deleted-a1.log`. Migrate the 93 test calls as the arena's base table says, with these corrections: delete `plateModelPublication.spec.ts` 223-250; rewrite 136-150 to capture a fresh editor inside the throwing stage and keep its cleanup assertions; rewrite `withPlite.slow.ts` 1047-1073 on a fresh editor and keep its unchanged-schema and unchanged-value assertions; keep `resolvePlugins.spec.tsx` 926-944; keep `editorUser.spec.ts` 196-231 deleted with no replacement; add the early-failure probe from round 1, a plugin whose state and selector collide, on the build and compile paths, failing when the preparation restore is deleted; and run a mutant for the `withPlite.slow.ts` 411-449 rewrite or delete it as a duplicate. Proof: the affected spec files pass, the restore and rewrite mutant logs, and `git grep` over live source finds no `createEditorWithEditor`, no `editor: createPliteEditor` and no `editor:` key passed to a Plate constructor.
  Deviation: mutants showed two planned rewrites could not fail. `plateModelPublication.spec.ts` 136-150, rewritten on an editor captured in the throwing stage, passed with every cleanup deleted, so it is deleted, and a new test whose initial value throws pins the build-path restore. `withPlite.slow.ts` 1047-1073, rewritten the same way, passed with both restores deleted, so it keeps only its duplicate-property refusal. `withPlite.slow.ts` 411-449 is deleted as a duplicate of Plite's bootstrap guard, which refuses writes during construction.
- [x] Closed by `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/build-source-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/build-registry-check-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/docs-parity-a1.log`. Remove the `editor` option from the docs and JSDoc, correct the `id` JSDoc that says `@default nanoid()` while Plite allocates `plite-editor-N`, add the changeset bullet, add the Vision line that Plate constructors always allocate and `EditorProvider` binds UI to an existing editor, reword `VISION.md` line 54 so `platejs/testing`'s raw helpers serve Plite-level tests, update `docs/plans/topics/suggestions.md`, `docs/plans/topics/react.md` and `tooling/scripts/check-hook-generics.mjs`, and add `superseded` rows for the census count and the previous iteration's supplied-editor claims. Proof: `build:source`, the registry check and docs parity pass, and the `best-api repair` row names each artifact.
- [x] Closed by `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/bench/authored-construction-a2.log`. Rerun the construction benchmark on the final build path. Proof: its log within the frozen budget.
- [x] Closed by the keep row in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv` and `docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/run-a2.out`. Keep, revert or quarantine Phase 4. Proof: the decision row in `docs/plans/2026-10-07-suggestions-editor-input.decisions.tsv`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| How an editor key is handled | Refuse any editor key the caller passed, own or inherited, enumerable or not, an undefined value included, without reading it | Ignore it silently | strip editor key |
| Where the refusal runs | At every public entry and on every hook render, on the options the caller passed | Only inside the shared build step | refuse in build only |
| How the user is stored | A fixed data property and a Plate map from editor to user, both written at allocation; the author read finds the user in the map through the runtime owner | Keep the getter over a record | keep user getter |
| The document flag | The construction comparison with an authored document decides it, and the flag goes when swapping it changes nothing | Keep each constructor's flag as today | keep document flag |
| Cleanup after a failed build | Keep the build and compile restores as today | Delete them and accept stale state on a leaked reference | delete restores |
| Other unknown option keys | Refuse only the two removed keys, the existing editor and the migrations option, in this iteration | Refuse every key outside a closed option set | closed options |
| How the cast check reads | No new cast site in the four build files; the one cast on a changed line is the existing allocation cast, moved into the new build function, and the cast counts fall from 11 to 2 and from 6 to 3 | No changed line holds a cast at all, which needs a typed raw-editor constructor first | strict cast check |
| The existing-editor input | Removed, on the owner's "continue poteto mode" after the page recommended removal | Keep it, with the user record's build phases, refusals and retry | keep editor input |
| Who runs this iteration's panels | The configured seats, Opus, Astra and Sol, since the owner restored Codex access | Opus seats labeled same-family | same-family seats |
| The subject page | A new page at https://claude.ai/artifact/Phwz4TDjXPEtjgqxpprE2v, because the old page at https://claude.ai/artifact/1QnTKkb8W4jSNFNjimgJEs no longer opens | Drop the new page and keep the subject without one | drop the new page |

## Close

### Reversals and deviations

- The build ran on the owner's "continue poteto mode", which took the recommended removal of the existing-editor input.
- Step 1 put the React `createEditor` case in `withPlate.spec.ts` beside its code, gave `useStaticEditor` only its rerender case, and added proxy cases to the helper block.
- Step 2 types `buildEditor` over the editor its `initialValue` callback receives, not over the root plugin's definition input, which stays with the closed option set in Open work. Its cast check reads as no new cast site, because the one cast on a changed line is the existing allocation cast (Defaults: How the cast check reads).
- The document flag is gone. Every constructor passes the implicit document as an envelope, because the construction comparison and a flag-swap mutant matched the pre-fix tree.
- Step 3 deleted `plateModelPublication.spec.ts` 136-150 instead of rewriting it, kept only the duplicate-property refusal of `withPlite.slow.ts` 1047-1073 and deleted 411-449, because mutants showed the rewrites could not fail. A new test whose initial value throws pins the build-path restore.
- The code-quality review deleted `publicationBeforePlugin` and the repeated `readOnly` and `maxLength` writes that the plan kept.
- The diff panel replaced the planned `in` check with one that also checks own properties along the prototype chain, removed `buildEditor`'s second check and a dead runtime-candidate clear, and restored `createStaticEditor`'s own refusal case after the code-quality review had deleted it.
- A separate workflow repair makes `tooling/scripts/run-entrypoint-task.mjs` pass each platejs spec to bun with `./`, which stops bun from scanning 23 GB of ignored files and failing with EMFILE.

### What landed

- `createEditor` from `platejs` and `platejs/react`, `createStaticEditor`, `useCreateEditor` and `useStaticEditor` always allocate their own editor. An `editor` or `migrations` key throws before construction, whether own or inherited, enumerable or not, behind a getter, or hidden by a proxy from either `in` or its own-property traps.
- One internal `buildEditor` allocates each constructor's editor with `id`, `lifecycleErrorSink`, `readOnly` and `maxLength`, so `createStaticEditor` now honors `lifecycleErrorSink`. React `createEditor` reads those four options by name, so options an object inherits still reach allocation, as before.
- `editor.userId` is a fixed data property defined right after allocation. A Plate map from editor to user serves the author read through the runtime owner and keeps its missing-user throw. The record's phases, refusals, retry and getter are gone, and so are `applyEditor`, `applyPlateEditor` and both `createEditorWithEditor` functions.
- The API docs and their Chinese twin drop the `editor` option and point to `EditorRoot`, the hook docs and JSDoc drop the supplied-editor sentences, the Plate Vision rule says every constructor allocates, `VISION.md` says `platejs/testing`'s raw helpers serve Plite-level tests, and the `platejs` changeset gains a bullet and a migration sentence.
- The 93 test calls migrated. The editor-user spec keeps 4 of its 15 tests, and new cases cover the refusals, the static sink, inherited allocation options and failure cleanup.
- The build regenerated `packages/platejs/turbo.json` for a spec's new compiler import. Another session's uncommitted work shares some of this run's files, as the previous plan's Close lists.

### Proof and its limits

- Twelve step 1 cases fail on `b3482a20` for their own assertion (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/step1-base-a1.log`).
- Each of these mutants fails only its own case: 15 for step 2 (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-step2/mutate/`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-step2-static/mutate/`), the restore mutants (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/mutate-restores-2/mutate/`), 9 for round 1's fixes (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-1/mutate/mutate/`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-1/mutate-named/mutate/`) and 2 for round 2's (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/mutate/mutate/`).
- 63 constructions and 4 compiles, authored documents included, match the pre-fix tree with deterministic ids and clock, and a flag-swap mutant matches too (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/probe/final-construction-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/probe/mutant-bare-construction-a1.log`).
- On the final bytes, the platejs suite passes 139 of 139 tasks in a fresh worktree (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/test-platejs-a2.log`), the construction benchmark stays within its budget (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/bench/authored-construction-a2.log`), and type-aware lint is clean on 24 files. `pnpm check` passes 20 of 25 steps in this checkout once its `public-types` fix runs; typecheck, test-slow, core-audits, knowledge and www fail with the same errors as at HEAD, and the links behind them pass except the www app's errors in another session's `next.config` files (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/pnpm-check-tree-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-editor-input/acceptance/www-later-links-a1.log`).
- No app route was mounted in a browser, because the change sits in the constructors and the construction comparison covers their output. The refusal leaves out a proxy that hides a key from both `in` and its own-property traps. `api-reference:check` stays red at HEAD on `HistoryApi`. `buildEditor`'s runtime-candidate clear has no failing test. The benchmark's limiter is not profiled, and its host ran at load 2.1 to 2.5 on 18 cores.
- The review and the build read these inputs: `packages/platejs/src/lib/editor/editorUser.internal.ts`, `packages/platejs/src/lib/editor/withPlite.ts`, `packages/platejs/src/react/editor/withPlate.ts`, `packages/platejs/src/react/editor/useCreateEditor.ts`, `packages/platejs/src/static/editor/withStatic.tsx`, `packages/platejs/src/lib/editor/editorUser.spec.ts`, `packages/platejs/src/react/editor/useCreateEditor.spec.tsx`, `packages/platejs/src/lib/editor/withPlite.slow.ts`, `content/docs/api/core.mdx`, `content/docs/api/react-hooks.mdx`, `docs/plans/2026-10-07-suggestions-review.md`.

### Attention

reviewed by codex:gpt-6.1-sol @xhigh (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/trail/review-sol.md`)

- Warning, fixed: the construction benchmark first ran before both diff rounds changed the constructors. It reran on the final bytes within budget (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/bench/authored-construction-a2.log`).
- Warning, fixed: the narrowed cast check had no proof file or acceptance record. The cast audit now has a log (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/cast-audit-a1.log`), a labeled partial row and an accepted row.
- Warning, dismissed: the reviewer read diff round 1's own-property walk as a replacement that needed a `best-api-review`. The final check keeps the approved `in` test and adds the walk, and every entry still refuses on the options the caller passed, so it extends the approved check.
- Nit, fixed: round 2's `deslop` row recorded a pass that was not run. It ran and simplified one test row, and round 2's mutants passed again on the new bytes.
- Nit, fixed: `pnpm check` passes 20 of 25 steps, not 19, once the `public-types` fix runs.

### Reflect

`/pstack:reflect` read this whole session. Three Opus reviewers, for judgment, tooling and divergent angles, and an Opus synthesizer saved their replies under `docs/plans/artifacts/2026-10-07-suggestions-editor-input/reflect/`. It accepted 16 lessons, rejected 9 and put 10 in the backlog. [The lessons plan](2026-10-08-suggestions-reflect-lessons.md) lands the accepted lessons. It also builds three backlog items now, because each repeats an earlier reflect's backlog item or prevents a mistake you corrected: a freeze that refuses to drop an earlier iteration's uncommitted path, a hook that refuses common removals hidden in inline shell strings, and `plan-open.mjs` reading a closed box's indented lines, which the lessons plan's trail review added. The list below is the reflect's record; the lessons plan reverted lesson 6 after both smoke runtimes declined it, and narrowed the hook to the forms its tests run.

Accepted:

- When a review finds a removal incomplete, finish it at runtime instead of restoring the input, and decide whether the goal still needs an input by counting its non-test callers.
- The same placeholder value added at many callers is a caller workaround, so a review of required options searches examples for placeholders.
- A brief tags each invariant as the user's ask, a cited law or the lead's own conclusion, and lists the lead's own as premises to attack.
- Reading types does not prove that something cannot be done at runtime. The check tries each public path, or the claim says inferred.
- The scale benchmark reruns in the close's repeated acceptance proof, after the last panel fix.
- When the task depends on uncommitted work it did not write, the acceptance check runs in the checkout, and each failing step is rerun at HEAD in a worktree.
- A Pursue verdict on a review you asked for authorizes its plan's hard cuts as a `look` default.
- A review that a gate owes the current request adds a stage to the title instead of restarting it, and the new iteration's brief names the request and the finding that opened it.
- Before each panel round, ping each Codex model again, and fall back to Opus only for a model that fails at that moment.
- EMFILE or ENFILE during a test run means a test path lacked `./`.
- The command reference says how to typecheck a platejs spec or `.slow.*` file.
- Generated API reference output counts as an artifact that `best-api repair` fixes.
- A plugin that wraps a native factory copies every registration of its nearest wrapped analog and proves the declaration build.
- How JavaScript looks up an options key is a grammar too large to list, so a check on it moves to a closed option set or passes the caller's object through.
- Agreement among seats of one model family counts as one sample.
- `verify` triggers for probes and browser controls run inside an API review.

Rejected, each already covered or not decision-changing: a caller census as best-api-review's first step, a removed-export sweep by name, Open work items that park picks, a writing pass scoped by prose, a correction pass inside a feature's close, limit sentences about code the plan does not change, running the later links of a chain that fails at HEAD, a benchmark target recipe and the `cli-test` build order.

Backlog, with owners and stops in the lessons plan: the frozen tree, the inline-string hook and `plan-open.mjs` reading a box one way, all three built; a check that refuses a replacement without its owed `best-api-review`; `decisions-check.mjs` refusals that name their fix; a typecheck step for platejs specs; `cli-test` building plitejs first; a `--continue` flag for `check-core.mjs`; a known-failure list for `pnpm check`; and seat exit codes in completion notices.

### Counts

Phase 4's 6 step boxes and 16 completion gates make 22 items: 21 done, 1 partial (`pnpm check` stays red on five steps that fail the same way at HEAD), 0 skipped, 0 blocked and 0 open.

## Open work

- After the cut, `createStaticEditor` is `createEditor` with narrower types, and `useStaticEditor` is a memoized base editor that does not key on `userId`. owner: zbeyens, who decides whether they keep separate names. stop: a `best-api-review` of the static entrypoint records the decision. Tracked in `docs/plans/topics/suggestions.md` Open work.
- Every unknown option key, such as a typo or `useStaticEditor`'s `enabled`, falls into the root plugin's definition. The same decision settles three review flags: typing the root plugin's keys in `buildEditor`, letting React `createEditor` pass its options untouched so every inherited option survives as it does in core and static, and folding the per-entry refusals into one check that returns the options it checked. owner: zbeyens, who decides whether Plate constructors take a closed option set. stop: a constructor-options plan records that decision as a Defaults row. Tracked in `docs/plans/topics/suggestions.md` Open work.
- The failure-path restores, the empty-document fit, `resolvePlugins`' publication guard and its `clearPluginStores` at entry, and `buildEditor`'s runtime-candidate clear, which no test fails without, may be dead or duplicated for fresh editors, but plan panel round 1 found an early compile failure and a root minimum of 0 that reach two of them. owner: zbeyens, who decides whether a cleanup plan proves each one. stop: that cleanup plan's Close, or the owner dropping the item. Tracked in `docs/plans/topics/suggestions.md` Open work.
- `apps/www/src/generated/api-reference-manifest.json` still lists the removed `currentUserId` 3 times (`rg -c currentUserId` on 2026-10-08), because `api-reference:check` fails at HEAD on `HistoryApi` and the manifest regenerates only from built declarations. owner: zbeyens, who regenerates it once that check passes. stop: `rg -c currentUserId apps/www/src/generated/api-reference-manifest.json` finds none. Tracked in `docs/plans/topics/suggestions.md` Open work.

## Evidence

Model: Opus 5.5 (claude-opus-5-5), with one Opus explainer for the caller census.

### Requirements

- An editor with no `userId` writes and comments as the local user `'local'`, and a `userId` with a NUL character throws (the owner's solo-mode words, quoted in [the previous iteration](2026-10-07-suggestions-review.md)).
- `editor.userId` cannot be reassigned, redefined or deleted, and every authored write and comment through the editor or a view of it carries that user.
- An editor with a plugin keyed `yjs` warns once in development at its first write or comment as the local user.
- `useCreateEditor` builds a new editor when the normalized `userId` changes.
- Hard cuts beat compatibility, and an API earns its place through a current job ([VISION.md](../../VISION.md)).

### Lanes

- Keep the record as built: phases, three refusals and retry, all serving an input with no non-test caller.
- Cut the hook's `editor` option only. Panel round 7 of the previous iteration reverted this cut, because the type change still let a prebuilt or spread options object through at runtime, and `createEditor` still honored it.
- Cut the input from every constructor, refuse an `editor` key at runtime, and reduce the record to a fixed property. This is the strongest deletion and the verdict's lane.

The census parsed every tracked and untracked source and docs file outside `docs/plans/artifacts` and `.tmp`, matching 4 constructors, 20 import aliases and 7 forwarding wrappers. It cannot see an options object built in another module except by reading the wrappers and their callers, and it cannot see outside consumers. Its script, output and probe are in `docs/plans/artifacts/2026-10-07-suggestions-editor-input/how/`. Its summary said 22 calls need an existing editor; its own table sums to 31, which the arena's second runner and the judge confirmed.

### Architect

A three-runner arena with an Opus cross-judge picked the target, all on Opus and labeled same-family because the Codex login refuses both Codex models. The runners got the outcome, the requirements, six must-answer questions from the census and the control of keeping today's code (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/arena/task.md`). All three converged on one allocating build path, an own-key refusal and a fixed data property, and each ran its design patched in memory against the source, with today's code as the control. The judge scored the third runner and the first 28 of 30 and the second 26, and recommended the third as the base, because it deletes the most dead code with its whole deletion set run and is the only one that pins the static sink drop (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/arena/judge.md`).

Grafts: from the first runner, a mutant per entry point so each refusal case catches its own defect, the construction snapshot and compile artifact identity runs, and the construction benchmark gate; from the second, the run that claimed the empty-document branch dead, which plan panel round 1 overturned, the getter and inherited-key cases, the Vision line and the nested-construction spec. Rejected: the third runner's rewrite of `plateModelPublication.spec.ts` 223-250, which repeats Plite's own spec and passes at base. Named by no runner and added: `useStaticEditor`, which forwards to `createStaticEditor`, and a run of `compileEditor.test.ts` once the catch-time restore goes.

Challenge delta: replaced. The previous iteration's target kept the existing-editor input and guarded it with an owner record; this target removes the input and the record with it.

### Plan panel round 1

Opus, Astra at xhigh and Sol at xhigh reviewed frozen commit `5084bfb3` (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/plan-round-1/`). Astra and Sol showed that the React constructor and `useCreateEditor` copy the options before the shared check, so a non-enumerable or inherited `editor` key slipped through and returned an empty editor, and that both hooks skip the check on a memoized rerender. The refusal now runs on the received options at every entry and on every hook render. Sol showed that an early compile failure needs the preparation restore and that a root minimum of 0 reaches the empty-document fit, so both stay, with the other reuse-only branches, as Open work. Opus moved the author read to the runtime owner, named the pre-fix tree, added the per-shape refusal cases, the cast check, the testing helpers and the smaller artifacts, and dropped the nested-construction spec.

Challenge delta: improved. The refusal moved from the shared build step to every public entry, the author read moved to the runtime owner, and the deletion set shrank to the input, the record and the split allocation.

### Plan panel round 2

The same three seats reviewed frozen commit `997ee4b4` (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/plan-round-2/`) and raised no critical finding. Astra and Sol each typechecked the planned owner read and got TS2339, because Plite's owner type has no `userId`; a Plate map from editor to user now serves the author read and keeps its missing-user throw. All three showed that the migration still deleted the only tests of the restores the plan keeps; Astra's and Sol's in-memory mutants left a plugin store and a publication behind. Those tests are now rewritten on a fresh editor, with an early-failure probe and a mutant per restore. Opus found that the `migrations` refusal still checks a copy, so one helper now refuses both removed keys at every entry. Opus also found that no case could fail for the document flag, so an authored construction comparison now decides it. Last, the refusal matrix repeated three defects, so it shrank to about nine cases, each with a named mutant.

Challenge delta: improved. The user lookup crosses Plite's owner type without a cast, the kept restores stay pinned by tests, and the refusal covers both removed keys with fewer cases.

### Build

A code-quality review read the slice in a fresh subagent and found no blocker (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/build/thermo/reply.md`). The build applied its findings on dead `readOnly` and `maxLength` writes, the unconditional publication clear, the refusal wording, the misplaced `createEditor` JSDoc and a duplicate-property test that matched only because its key was named `duplicate`. It deferred the closed option set, the static entrypoint's name and the restores to their Open work items.

### Diff panel round 1

Opus, Astra at xhigh and Sol at xhigh reviewed frozen commit `5de4d781` (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-1/`). Astra showed that React `createEditor` read its four allocation options through a rest copy, so options the caller's object inherits were dropped where the base read them by name. React now reads them by name, and one test pins all four. Sol, with Astra as a warning, showed that a proxy whose `has` trap hides an inherited or non-enumerable `editor` passed both checks. The check now looks for the key along the prototype chain with own-property checks, and `buildEditor`'s second check is gone. Opus found a cleanup field that could not fail, a dead candidate clear, the static constructor's lost refusal case, an unrecorded typing deviation and the changeset's hook wording, and each was fixed.

Challenge delta: improved. Every constructor reads its allocation options the same way the base did, and the refusal no longer trusts `in` alone.

### Diff panel round 2

The same seats reviewed frozen commit `ed92b0c9` against round 1 (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/panel/diff-round-2/`). Astra and Sol found nothing. Opus showed that replacing `in` let through the opposite proxy, one that shows `editor` only through `has` and `get`, so the check counts a key that either `in` or the own-property walk sees, with one test row for each half. No critical finding was raised, so the diff panel ended.

Challenge delta: improved. The check covers a proxy whose `has` trap and own-property traps disagree in either direction.

### Reconciled reviews and plans

- `2026-10-07-suggestions-review`: retains its target, one fixed acting user per editor and the local user. This review reopens only its Phase 3 mechanism and its Defaults row that kept the hook's `editor` option, and supersedes both once this plan builds.
- No earlier plan or decision covers the existing-editor input, by a search of `docs/plans` and `docs/research` for the option, its JSDoc and the internal `createEditorWithEditor`.
