# createEditor refuses options it does not know

Status: executed: committed in 1a9a7cbf1e, with the Plite type refusal rebuilt by iteration 2
Page: https://claude.ai/artifact/5bgJGacoRZ6XniABNfmsWg
Playbook: bug-fix

Run directory: `docs/plans/artifacts/2026-10-14-create-editor-options/`. Intake base: `e544d29448`. Requested by the PR 5168 redo session as suggested task `task_347dc1bf`, "After: Refuse unknown createEditor options (xhigh)". Design: `architect/synthesis.md` in the run directory.

## Brief

### What will change?

All six ways to make an editor reject an unknown option and name it. A typo written in the call fails to compile, and any unknown option throws at runtime. Review rejected Plite's compile-time part, and iteration 2 redid it.

### What could go wrong?

Code that passes extra options, say by spreading in a bigger object, now throws. We only proved the call shapes we tested. Iteration 2's Close answers the trail review's warnings.

## Teach

You create every Plate or Plite editor with one call that takes an options object: the plugins, the starting document and a few flags. There are six of these calls, plain and React, for each library.

Today the editor mostly ignores a wrong option. Plite's types guess the type of the whole object, and TypeScript skips its unknown-option check when it guesses. Plate checks, but with plugins the error points at the plugins. At runtime both drop the option, so a typo gets you an empty editor and a confusing crash later.

After this change the types still guess, but an option they don't know, written in the call, becomes an error that names it, with or without plugins. An object built elsewhere and passed in still compiles, because TypeScript never checks extra keys there. So each call also checks its options when it runs, on every render for the two hooks, and throws on one it doesn't know.

## Public API

A Plite call with plugins and an option Plite does not have compiled, and Plite ignored the option. Now it fails to compile and, without types, throws.

```ts before
// packages/plitejs/test/react/runtime-before-input-events-contract.test.ts:51
const editor = createEditor({
  plugins: [
    definePlugin('mounted-trigger-command', {
      commands: ({ handle }) => [
        handle(editorCommands.insertText, ({ input, state }) => {
          if (input.text !== '@' || !input.options?.at) return false;

          return state.transaction(() => {});
        }),
      ],
    }),
  ],
  initialValue: [
    { children: [{ text: '' }], type: 'paragraph' },
  ] satisfies InitialValue,
  selection: null,
});
```

```ts after
// packages/plitejs/test/react/runtime-before-input-events-contract.test.ts:51
const editor = createEditor({
  plugins: [
    definePlugin('mounted-trigger-command', {
      commands: ({ handle }) => [
        handle(editorCommands.insertText, ({ input, state }) => {
          if (input.text !== '@' || !input.options?.at) return false;

          return state.transaction(() => {});
        }),
      ],
    }),
  ],
  initialValue: [
    { children: [{ text: '' }], type: 'paragraph' },
  ] satisfies InitialValue,
});
// Keeping `selection: null` is now "Object literal may only specify known
// properties, and 'selection' does not exist", and untyped it throws
// TypeError: Unknown editor option "selection".
```

A Plate call with plugins and a wrong option named the plugin in its error; now it names the option.

```ts before
// docs/plans/artifacts/2026-10-14-create-editor-options/probe-types.tsx:27
createPlateEditor({ value, plugins: [BaseParagraphPlugin] });
// Type 'BasePlugin<…>' is not assignable to type 'undefined'.
// Untyped, it builds one empty paragraph.
```

```ts after
// docs/plans/artifacts/2026-10-14-create-editor-options/probe-types.tsx:27
createPlateEditor({ value, plugins: [BaseParagraphPlugin] });
// Object literal may only specify known properties, and 'value' does not exist in type '…'.
// Untyped: TypeError: Unknown editor option "value". Use "initialValue" to set the document.
```

## Main changes

- Diff round 3 reversed the Plite type refusal. The three Plite constructors' overloads went back to HEAD's and `CheckedEditorOptions` went away, because four of round 3's five critical findings hit its sink and plugins rules after each had used its one replacement. Until iteration 2, `docs/plans/2026-10-15-create-editor-options-types.md`, rebuilds the Plite type refusal, an unknown key that a Plite inferred overload takes compiles and throws only at runtime. The approved wording below stays as the reversal's record.
- `packages/plitejs/src/internal/editor-options.ts` is new. It holds `assertEditorOptions(options, keys)`, the one owner of the closed-set check, and `CheckedEditorOptions`, the private type that refuses unknown keys on an inferred options object. Like HEAD, it also refuses an optional `plugins` key and a `plugins` value that may be undefined, and accepts `plugins: undefined` and a generic plugins tuple with the same return type. A sink that fits the plugin-taking constraint HEAD used keeps its own type, and a callback written in the call takes that constraint's sink type, so both compile with HEAD's return type. Inside the callback, the editor's value or plugin type argument can differ from HEAD's. The check reads the string keys of the options object and of every prototype, and never reads a value. It stops at `Object.prototype`, and in any other prototype it skips a key that `Object.prototype` held when Plite loaded. That lets a class instance through, and an object from another realm whose `Object.prototype` no script extended. `plitejs/internal` exports the check for Plate; no public entrypoint exports either.
- `plitejs` `createEditor` goes from four overloads to three: one inferred overload checked by `CheckedEditorOptions`, then the two explicit ones, the one that takes `plugins` last, so a type error names the unknown key and `Parameters<typeof createEditor>[0]` reads that overload. `createEditorImplementation` checks the caller's options first. The unused `createEditorUnchecked` is deleted.
- `plitejs/react` `createEditor` checks its options, `clipboardFormatKey` included, before it splits them. `useEditor` checks the caller's options on every render, before its memo, because later renders never reach `createEditor`. Both inferred overloads use `CheckedEditorOptions`.
- Plate's `assertConstructorOptions(options, keys)` keeps its `editor` and `migrations` refusals first, then runs the closed set. `platejs` `createEditor`, `platejs/react` `createEditor` and `useCreateEditor`, on every render, call it on the caller's object with their own key sets. `buildEditor(options, optionKeys)` calls it on the object it hands the root plugin, after it reads its named options. It uses the key set its caller checked, so a key that a getter adds during that read never reaches the root plugin. That object's type must hold no typed option, so an option added to the type but not read by name fails the build. Their overloads are reordered so the last one accepts plugins, which makes a type error name the unknown key and makes `Parameters` read that overload.
- The type-level refusal covers an object literal written in the call. A variable or a spread with an unknown key still compiles through the declared overloads, which explicit type arguments need, and the runtime check refuses it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When the runtime check runs | Always, in production too (look) | Only in development builds | dev only | big |
| Untyped root plugin fields such as options, transforms, handlers, rules or slots | Refused, like any unknown option | Still passed to the root plugin | keep root fields | small |
| Two Plite tests that pass an ignored selection | Fixed now, while no other session has them open | Left until the paste landing work lands | wait for paste | detail |
| The core docs rows for options and transforms, root plugin fields the options type never listed | Rows removed, since both now throw; initialState, affinity, initialSelection, skipInitialization and lifecycleErrorSink added | Left as is | keep docs | detail |
| The options type a wrapper reads from the parameters of createEditor | The options that take plugins, since the last overload decides which key a type error names | The options without plugins, with type errors that blame plugins | no-plugin last | small |
| The runtime error text | Names the option, with a hint for value | Also names which call threw | name the call | detail |
| When the two hooks check their options | On every render, like the existing editor check | Only when they create an editor | check on create | small |
| An options object built from a class that has methods | Refused, unless the method shares a name with one every object inherits, such as toString | Methods skipped, like the keys every object inherits | allow methods | detail |

## Steps

- [x] Reproduce at the type level and at runtime. Proof: `probe-types-before-a1.log`, `probe-control-before-a1.log` and `probe-runtime-before-a2.log` in the run directory.
- [x] Design through `architect`. Proof: `architect/synthesis.md`, `architect/judge/verdict.md`.
- [x] Panel on this plan (reviews: api-plan). Rounds: `panel-plan-1/`, `panel-plan-2/`, `panel-plan-3/` in the run directory, the last before the build.
- [x] Write the Plite regression test, `packages/plitejs/test/react/create-editor-options.test.tsx`, and run it red at the base: each `@ts-expect-error` unused under `typecheck:tests`, and no throw under vitest. Proof: `plite-types-before-a1.log`, `plite-runtime-before-a1.log`.
- [x] Add round 1's Plite cases: `useEditor` refusing on a later render, an options object from another realm accepted, and the inferred value type unchanged by an `undefined` sink. Run the later-render case red at the base. Proof: `plite-runtime-before-a2.log`, `plite-types-before-a2.log`.
- [x] Add round 2's and round 3's Plite cases: `value` inherited from a parent whose prototype is `null` refused, `value` inherited from a custom parent refused after a script adds `value` to `Object.prototype`, and a class instance accepted. Run the refusals red at the base. Proof: `plite-runtime-before-a3.log`.
- [x] Add the Plate regression: runtime cases beside the existing refusal tests in `withPlite.spec.ts`, `withPlate.spec.ts` and `useCreateEditor.spec.tsx`, and a type contract in `packages/platejs/type-tests/` with `@ts-expect-error` on each call's `value` line. Run both red at the base. Proof: `plate-specs-before-a1.log`, `plate-types-before-a1.log`.
- [x] Build: `editor-options.ts`, the Plite signatures and check, the Plate check and overload order, the `createEditorUnchecked` deletion, the two Plite test callers, the docs rows and twin, the closed option set as a line in `docs/vision/plite.md` and `docs/vision/plate.md`, and changesets for `plitejs` and `platejs`. Proof: `run-patch.diff`.
- [x] Rerun the regressions green, the diagnostic matrix from the cross-judge (`architect/judge/scratch/matrix/`), round 1's seat probes for the getter, the sink and the later render, round 2's for the null-prototype parent, and round 3's for an extended `Object.prototype`. Revert each round's fix alone with `mutate.mjs` and see its case fail. Proof: `plite-runtime-after-a2.log`, `plate-specs-after-a2.log`, `plite-callers-after-a1.log`, `matrix-replay-a1.log`, `mutate-a1.txt`, `mutate-a2.txt`.
- [x] Benchmark probe for the per-render check. The metric is the median microseconds of one `useEditor` or `useCreateEditor` rerender that reuses its editor and gets a fresh options object, as an app component passes one, from `bench/hook-render.ts` in the run directory. It covers four cohorts: Plite and Plate, each with a three-key object and with every key plus two inherited. A rerender took 9 to 15 µs on the tree before the build. Budget, frozen before any candidate run: candidate over base at most 1.10 in every cohort, judged by `paired-timing.mjs` with a 3 µs busy-wait planted arm and a second candidate copy as the same-code arm. A conclusive miss sends the per-render check back to `architect`; an inconclusive run stays a gate. Proof: `bench-paired-a2.log`, `bench/measurements-a2.json` and `bench/work-count-a2.txt`; the first run, `bench-paired-a1.log`, was inconclusive on a loaded host.
- [x] Writing passes: `deslop` and `no-comments` on the code, `unslop` on the docs, plan and changesets. Proof: decision rows of phase `writing`.
- [x] Panel on the diff (reviews: api-build). Rounds: `panel-diff-1/`, `panel-diff-2/` and `panel-diff-3/` in the run directory; round 3's findings reverted the Plite type mechanism, `round3-revert.diff`, with every seat probe matching HEAD in `round3-revert-probes-a1.log`.
- [x] Rebuild the Plite type refusal through iteration 2, `docs/plans/2026-10-15-create-editor-options-types.md`. Proof: that plan's Close and its acceptance in `accept2/compare-sides-a1.log`.
- [x] `pnpm lint:task` on this run's files. The formatter folded one `root-location` export in `packages/plitejs/src/internal/index.ts` that other commits wrote. Proof: `accept2/lint-task-iter1-a1.log` and `accept2/lint-task-iter1-a2.log`, with no error in the eleven paths lint reads.
- [x] Acceptance in a detached worktree at the base plus this run's patch: `plitejs` typecheck, package suite and React suite, `platejs` typecheck and package suite, `check:core`, `hook-generics`, `test:types`, `platejs` spec typecheck on the touched specs, and the root `pnpm test` and `pnpm test:slow`, which reach the apps and the other packages that build an editor, each beside the same run at the base. Proof: `acceptance/base-*` and `acceptance/cand-*` logs, the `--continue` reruns among them, and the line diffs `plite-test-tsc-base-a1.log` against `plite-test-tsc-cand-a1.log` and `plate-tsc-base-a1.log` against `plate-tsc-cand-a1.log`.
- [x] Decision-trail review. Proof: `trail-review/seat-sol.md`, shared with iteration 2 and settled in its log's `trail` rows.

## Open work

- Delete Plate's `hasOption` once the closed set covers its proxy cases, from diff round 1's deferred warning 4. owner: zbeyens. stop: the next change to `assertConstructorOptions`. Tracked in this plan's decision log.
- Iteration 2's three suggested tasks, `t_dcc41973`, `t_244c89b3` and `t_54844d26`, listed in `docs/plans/2026-10-15-create-editor-options-types.md`. owner: the owner. stop: the owner starts or dismisses each task. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.

## Close

The owner committed this iteration in `1a9a7cbf1e`. All six editor constructors check their options at runtime and throw a `TypeError` that names the first unknown key, `value` with a hint to use `initialValue`. Plate's three refuse an unknown key written in the call at compile time. Plite's three do so through iteration 2, which rebuilt the refusal that this iteration's diff round 3 sent back.

Reversals come first.

- Diff round 3 reversed the Plite type refusal, Main changes bullet 1. Four of its five critical findings hit the sink and plugins rules after each had used its one replacement, so the three Plite constructors went back to their overloads from before this iteration, and iteration 2 rebuilt the refusal with another type. Its Close says what that type covers.
- Defaults row 5 now holds for Plate only. Plite's `Parameters<typeof createEditor>[0]` again reads the options without plugins, as it did before this iteration.

What landed in `1a9a7cbf1e`: `assertEditorOptions` in `packages/plitejs/src/internal/editor-options.ts` and its calls in the three Plite constructors; the closed set in Plate's `assertConstructorOptions`, called by `platejs` `createEditor`, `platejs/react` `createEditor`, `useCreateEditor` and `buildEditor`; Plate's reordered overloads; the option rows in `content/docs/api/core.mdx` and its Chinese twin; the closed-option-set lines in `docs/vision/plite.md` and `docs/vision/plate.md`; the plitejs and platejs changesets; and the Plite and Plate regression tests.

Proof. Each regression ran red at the base and green after: `plite-types-before-a1.log`, `plite-runtime-before-a1.log` to `a3`, `plate-specs-before-a1.log` and `plate-types-before-a1.log` against `plite-runtime-after-a2.log` and `plate-specs-after-a2.log`. The per-render check stayed within its frozen budget of 1.10 against the base in `bench-paired-a2.log`. Acceptance ran at the base and with this iteration's patch in `acceptance/`, and iteration 2's acceptance reran the same suites at `HEAD` with both iterations in `accept2/`. The mutation logs `mutate-a1.txt`, `mutate-a2.txt`, `mutate-a4.txt` and `mutate-a5.txt` cover this iteration's runtime check, which iteration 2 left unchanged. Their type mutants cover a mechanism iteration 2 replaced, so iteration 2's `accept2/cand-mutate-types-a1.log` supersedes them.

Limits. An options object held in a variable, built by a spread or typed by a type parameter meets only the runtime check, on every constructor. A key named after an `Object` member, such as `toString`, passes TypeScript's excess-property check, so it likely compiles on Plate's constructors too. This run measured that only on Plite's, so the Plate claim is inferred.

Counts. Of sixteen steps, all sixteen are done, and none is skipped, partial, blocked or open.

### Attention

reviewed by gpt-6.1-sol @xhigh

- The review covered both iterations and raised six warnings and one nit, all on iteration 2's dismissals, claims and tooling. Iteration 2's Close lists each one and its fix.
- For this iteration, one claim narrowed. Iteration 2's acceptance shows the failing test names, compiler errors and failed turbo tasks match at `HEAD` with and without iteration 2, not every diagnostic.
