# Plite createEditor refuses unknown options at compile time

Status: executed: uncommitted on next, for the owner to commit
Page: https://claude.ai/artifact/PEWHQ9jw2Mu5Soh8kTRRJA
Playbook: bug-fix

Iteration 2 of `docs/plans/2026-10-14-create-editor-options.md`, which keeps the runtime check, the Plate side, the docs and the changesets. Run directory: `docs/plans/artifacts/2026-10-14-create-editor-options/`, this iteration's files under `architect-2/` and named `iter2` or `round*-iter2`. Requested by the PR 5168 redo session as suggested task `task_347dc1bf`. Diff panel round 3 of iteration 1 sent the Plite type refusal back to planning; that plan's log holds the rows.

## Brief

### What will change?

Plite's three ways to make an editor once more reject a misspelled option in the call and name it. Every call we tested still gets the same types. Review rejected the first try, and this one waits for your commit.

### What could go wrong?

We only proved the call shapes we tested. A few rare ones, like an option named after a built-in method, still compile and fail only at runtime. The Close lists the trail review's six warnings and what each changed.

## Teach

Plite makes an editor with one call that takes an options object. That call has several versions, and TypeScript tries them in order. The first versions work out the document's type from the options you pass, and TypeScript skips its unknown-key check in exactly those versions. So a typo such as value for initialValue compiled, and the editor started empty.

The first fix swapped each of those versions for a stricter type. Review kept finding calls it broke, such as a choice between two options objects, so the old versions came back.

This fix keeps every old version and changes only what the type-reading ones accept. They take the whole options object when it has no unknown key, and otherwise the object without its unknown keys. A typo then meets that smaller object, whose own check names it. A wrapper that passes its options along still fits, even after marking them read-only or pulling a key out.

## Public API

A Plite call with plugins and an option Plite does not have compiled before iteration 1 and compiles again after the revert. Iteration 2 makes it fail to compile again.

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
// Keeping `selection: null` fails to compile with
// Type '…' is not assignable to type '"Unknown editor option 'selection'"',
// and untyped it throws TypeError: Unknown editor option "selection".
```

## Main changes

- `packages/plitejs/src/internal/editor-options.ts` gains `CheckedEditorOptions<TOptions, TAllowed>`, the parameter type of each inferred overload. It is `TOptions` when every key of `TOptions` is in `TAllowed`, and otherwise, under `NoInfer`, a mapped type over `TOptions` that keeps only the keys of `TAllowed`. Inference reads only the first branch, because `NoInfer` blocks the second. So unions, generic sinks and sink callbacks keep their types, and TypeScript checks an explicit union options type member by member, as before. A literal with an unknown key meets the second branch, whose excess-property check names the key. That branch maps each member of a union apart, where `Omit` keeps only the keys the members share. So TypeScript still checks an explicit union member by member when a member holds an unknown key, even an optional one. It also drops an index signature, so a computed key no longer hides a typo written beside a known key. TypeScript checks a type parameter, or a mapped type of one such as `Readonly<O>`, against the first branch alone, so a wrapper that forwards its options keeps the inferred overload, whether it passes them bare or through `Readonly`, `Omit`, `Pick` or a rest pattern. An index signature counts as no key, so an explicit type such as `Record<string, never>` keeps its refusals. A wrapper that forwards its options through a conditional type, such as `Exclude<O, undefined>`, gets an editor typed `Value`, because TypeScript infers `never` for the options from a conditional argument against a conditional parameter. Neither of the repository's two generic forwards does that. With such an editor, an insert of a node type the schema lacks compiles. At runtime the schema refuses it with `Unknown editor element type "quote".` and the document stays unchanged, `trail-review/runtime-probe-a1.log`. `UnknownEditorOptionTarget` turns an unknown key into the string-literal type `Unknown editor option '<key>'`.
- `plitejs` `createEditor` keeps its four overloads from before iteration 1 in their order, the two inferred ones taking `CheckedEditorOptions`, and adds a fifth, last overload whose parameter is `UnknownEditorOptionTarget<TOptions, NoPluginsEditorOptions>`. With every key known, that parameter is the options type when it fits the no-plugins options, and the no-plugins options otherwise. So `Parameters`, `call`, `apply` and the error for a wrong known value read as before, and so does a call that passes options with an explicit options type that fits. A call that gives an explicit options type and no options, such as `createEditor<{ id: string }>()`, now compiles and makes a default editor. The overloads before iteration 1 refused any options type there, because none of them took one without options. An unknown key turns it into a message that names the key, where the old last overload blamed the plugins. A local `NoPluginsEditorOptions<V>` replaces the three inline copies of the no-plugins options type.
- `plitejs/react` `createEditor` and `useEditor` give their inferred overload `CheckedEditorOptions`. Their last overload takes optional plugins, so its excess-property check already names an unknown key.
- Still not refused at compile time, as before iteration 1: an options object held in a variable, built by a spread, typed by a type parameter, holding a computed key typed `string` and no known key, or given an explicit options type such as `{}` that admits the key. A key named after an `Object` member, such as `toString` or `constructor`, also compiles, because TypeScript's excess-property check counts those names as known on every object type. The base compiled it too. Of the 1861 options literals the repository writes in a Plite constructor call, through any import name, only this run's own regression case writes such a key. The runtime check refuses an unknown key in each of these cases.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which design | Every tested call shape keeps its types, at the cost of harder types (look) | A smaller type, but wrappers that pass options along lose their document type and the call and apply forms break | smaller types | small |
| Error for a typo in a headless call | Names the key in the error on the whole call | Points at the key's own line, but tools that read the call's last version change | point at the key | detail |
| A call that names its own options type, one Plite can't take. None of the repository's 177 calls that name a type does this outside this run's tests | It compiles as long as the options actually written are ones Plite takes | Reject it as before when all the type's keys are known. But then a wrong value in a plain call without plugins gets its error on the whole call, not on the key | refuse unfit options types | detail |
| A call that names an options type but passes no options. None of the repository's 111 calls that name a type and pass nothing names an options type | It compiles and makes a default editor | Reject it, as before iteration 1 | refuse options types without options | detail |

## Steps

- [x] Design through `architect`: grounding, the harness, three runners and a cross-judge. Proof: `architect-2/synthesis/synthesis.md`, `architect-2/judge/verdict.md` and `architect-2/harness-real-graft-a1.log` in the run directory.
- [x] Panel on this plan (reviews: api-plan). Rounds 1 to 3 are in `panel-plan2-1/` to `panel-plan2-3/` in the run directory. Round 3's fixes, proven in `panel-plan2-3/fix/`, go to the build, since a plan gets three rounds.
- [x] Regression: write `panel-plan2-3/fix/contract-draft.ts` into `packages/plitejs/test/react/create-editor-options-contract.ts`, which adds the cases diff round 3 and plan rounds 1 to 3 raised: a union of options, a generic sink, forwarded options bare and through `Readonly`, a rest pattern, `Pick` and `Omit`, a sink-only callback body, an optional plugins slot that holds only `undefined`, explicit options types, an explicit union whose members a call cannot mix, a sink callback typed by an explicit union, the same unions beside an optional unknown key or with a member holding one, a primitive, an unknown key valued `never` or in one branch of a ternary, the last overload's `Parameters` and the message type. Write `panel-plan2-3/fix/test-draft.tsx` into `create-editor-options.test.tsx`, which moves the headless `@ts-expect-error` to the line where the error lands. Run both red on the main checkout before the build, as `panel-plan2-3/fix/contract-r3-rev-a1.log` shows on a reverted copy, beside `contract-r3-v2-a1.log`, where round 3's cases fail on round 2's design. Proof: `build-plan2/plite-typecheck-red-a1.log`, where `pnpm --filter plitejs typecheck` on the main checkout fails with exactly those eight lines before the build. Two repository checks pin the last overload. The test's headless `@ts-expect-error` sits on the line only that overload's error reaches, so the test fails when another overload takes the call. The contract checks that the overload's parameter type names the key. Only the harness reads each diagnostic's text, and it runs from the run directory, outside CI.
- [x] Build with `panel-plan2-3/fix/apply-design.mjs`, which writes nothing unless every replacement matches once, then fix `.changeset/plite-editor-options.md`, which says `Parameters<typeof createEditor>[0]` now gives the options that take plugins. Proof: `build-plan2/apply-design-a1.log`, then `build-plan2/plite-typecheck-green-a1.log` with no error and 0 of 13 tasks cached, and `build-plan2/plite-runtime-test-a1.log` with 9 of 9 passing.
- [x] Rerun on the built source: the harness (`architect-2/harness/run.mjs`, which exits 1 on a failed case), the class matrix (`panel-plan2-3/class/class-probe.mjs` over `panel-plan2-3/class/cases.mjs`, which exits 1 on a case that differs from its expectation or a setup error), the runner probes through `panel-plan2-3/fix/rerun-probes.sh`, which exits 1 unless the report equals `probes-control.txt`, and the contract and runtime test. Proof: on the main checkout, `build-plan2/harness-built-a1.log` passes 39 of 39, `build-plan2/class-built-a1.log` 229 of 229, and `build-plan2/probes-built-a1.log` matches its control. The plitejs and platejs type diffs ran before the build on scratch tree `wt-iter2-r3`, which holds the base plus the same type bytes, and so did `panel-plan2-3/fix/mutate-types.mjs`, which exits 1 on a failing control or an unseen mutant. There, `panel-plan2-3/lead/plite-tsc-r3-a1.log` differs from the reverted tree's `plite-tsc-rev-a1.log` only in printed type names and the fixed regression lines, the platejs logs `plate-tsc-rev-a1.log` and `plate-tsc-r3-a1.log` match, and `panel-plan2-3/fix/mutate-types-a2.log` catches eleven mutants. The acceptance step reruns all three on the final bytes, at `HEAD` plus this task's patch.
- [x] Benchmark: not applicable, because the change is type-only and leaves the runtime check as iteration 1 measured it. skip: type-only, as the step says.
- [x] Writing passes: `deslop` and `no-comments` on the code, `unslop` on both plans and the changeset. Proof: the `writing` row after the `built:` row in this plan's log.
- [x] Panel on the diff (reviews: api-build). Round 1, in `panel-diff2-1/`, applied no critical, so it is the only round. Its fixes add exact schema-document and plugin-tuple assertions and a headless typo case without plugins to the contract, a runtime case for an own `toString` option to the regression test, and a guard to the class and harness runners against a compiler that fails silently. Proof: `panel-diff2-1/fix/mutate-contract-a1.log`, where Astra's three mutants and the mutant without the fifth overload each fail the contract or the test, `accept2/mutate-own-object-member-a1.log`, and `panel-diff2-1/fix/failed-compiler/failed-compiler-a1.log`.
- [x] `best-api repair` check: the Vision lines and docs still say what the code does. The closed-option-set line in `docs/vision/plite.md` now names the shapes that meet only the runtime check. `content/docs/api/core.mdx`, the plitejs and platejs changesets and every skill still say what the code does, and `teaching-sweep.mjs` finds no live use of iteration 1's removed types. Proof: `accept2/forward/forward-a2.log`, where six typos nobody seeded into the tests fail on all three constructors with the key in the message, and `valueOf` compiles as the Vision line says.
- [x] `pnpm lint:fix` on this run's paths, then acceptance on the final bytes, shared with iteration 1's step. Proof: `accept2/lint-task-a2.log`, then `accept2/compare-sides-a1.log`, `accept2/slow-laws-summary.txt` and `accept2/compare-core-tail-a1.log`, where every suite's failing tests, compiler errors and failed turbo tasks at `HEAD` plus `accept2/task-final.patch` match those at `HEAD`, apart from one timeout `HEAD` shares, and the design proofs pass on those bytes, as the Close says.
- [x] Decision-trail review over both decision logs. Proof: `trail-review/seat-sol.md`, settled in this log's `trail` rows and under Attention.

## Open work

- `t_dcc41973` Make React createEditor honor inherited editor options (xhigh). React `createEditor` drops an inherited known option that the runtime check lets through, as the base did. owner: the owner. stop: the owner starts or dismisses the task. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `t_244c89b3` Test headless createEditor's unknown-option message in CI. owner: the owner. stop: the owner starts or dismisses the task. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `t_54844d26` Make the package suites pass at HEAD (xhigh). It owns the suites that fail at `HEAD` 1a9a7cbf1e with or without this change. owner: the owner. stop: each owned check passes on `next`. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- The type-probe recipe line this run added to `.agents/rules/verify/references/commands.md` is in a directory that started task `task_b3a1e4b9` owns, so this run makes no further edit there. owner: the owner. stop: `task_b3a1e4b9` lands with the line kept or moved. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.

## Close

Iteration 2 rebuilt the compile-time refusal that iteration 1's diff round 3 sent back. Plite's `createEditor`, `plitejs/react` `createEditor` and `useEditor` refuse an unknown option written in the call's options literal, with or without plugins, and the error names the key. The change waits uncommitted on `next`.

Reversals and deviations come first.

- Diff round 1 narrowed two claims. A key named after an `Object` member, such as `toString`, compiles on all three constructors, as it did before iteration 1, and the runtime throws naming it. An explicit options type in a call with no options now compiles and makes a default editor, Defaults row 4. Outside this run's own tests, none of the 1861 options literals written in a Plite constructor call, through any import name, writes such a key, and none of the 111 calls with a type argument and no options passes an options type, `trail-review/constructor-calls-a1.log`.
- The repository's tests pin where the headless error lands and the type that names the key. Only the harness in the run directory reads the message text, so CI does not check it. `t_244c89b3` offers that test.
- The lint step removed an unnecessary cast at `create-editor.ts:358`, in a line `HEAD`'s commit `422564e6f6` wrote. The lint refuses that cast at `HEAD` too. Plan 1's lint step folded a `root-location` export in `packages/plitejs/src/internal/index.ts` after the acceptance run. The plitejs typecheck reran on those bytes with no task cached and failed only on the TS7022 error it shares with `HEAD`, `accept2/cand-plite-typecheck-folded-a1.log`.
- `/pstack:correct` ran on a class this run repeated three times, a check claimed as a gate that cannot fail, as the panel rule requires. It added `tooling/scripts/type-probe.mjs` with its tests, a recipe line in `verify`'s command recipes and a row in the `CODING_STANDARDS.md` rules table. That work is outside the ask. Its tests prove the helper, but no runner uses it yet, so the correction stays partial until the next type-probe runner does.

What landed: the overloads in `packages/plitejs/src/create-editor.ts`, `packages/plitejs/src/react/plugin/with-react.ts` and `packages/plitejs/src/react/hooks/use-editor.ts`; `CheckedEditorOptions` and `UnknownEditorOptionTarget` in `packages/plitejs/src/internal/editor-options.ts`; the contract `packages/plitejs/test/react/create-editor-options-contract.ts` and the regression test `packages/plitejs/test/react/create-editor-options.test.tsx`; the changeset `.changeset/plite-editor-options.md`; and the closed-option-set line in `docs/vision/plite.md`.

Proof.

- Before the build, `pnpm --filter plitejs typecheck` failed on exactly the eight regression lines, `build-plan2/plite-typecheck-red-a1.log`. After it, the same command passed with no task cached, `build-plan2/plite-typecheck-green-a1.log`.
- On the final bytes, in the detached worktree `wt-acc2` at `HEAD` 1a9a7cbf1e plus `accept2/task-final.patch`, the harness passes 39 of 39, the call-shape matrix 229 of 229, and the runner probes match their control. `mutate-types` catches all eleven mutants, the contract fails under each of its four mutants, and the regression test fails alone when the own-key guard goes. The logs are `accept2/cand-harness-a1.log`, `cand-class-a1.log`, `cand-probes-a1.log`, `cand-mutate-types-a1.log`, `cand-mutate-contract-a1.log` and `cand-mutate-own-object-member-a1.log`.
- Every acceptance suite also ran at `HEAD` 1a9a7cbf1e in a second clean worktree, `wt-head`, and `accept2/compare-sides-a1.log` compares the two trees' failing test names, compiler errors and failed turbo tasks. The React suite and `hook-generics` pass on both trees. The plitejs typecheck and suite, the platejs typecheck and suite, `test:types`, the platejs spec typecheck and root `pnpm test` fail the same cases on both. Root `pnpm test:slow` failed one more case with the change, a recording-laws test that timed out at 5092 ms against its 5000 ms limit. In three reruns per tree, alternating, it timed out twice at `HEAD` and never with the change, `accept2/slow-laws-summary.txt`. `check:core` stops at its Plate schema adoption audit on both trees with the same 28 findings. Its later links, run directly on both trees, also match: the source declaration leak audit and the plitejs generic type contracts pass, and the `test` and `cli` typecheck, the platejs type contracts, the core packages' lint and the `cli` suite fail the same way, `accept2/compare-core-tail-a1.log`. The lint flags the same files on both trees, apart from `packages/plitejs/src/internal/index.ts`, which the folded export fixed with the change. `t_54844d26` owns every suite that fails at `HEAD`, and `t_ed79a18b` owns the lint errors.
- Six typos nobody seeded into the tests fail on all three constructors with the key in each message, `accept2/forward/forward-a2.log`.

Limits. TypeScript's call shapes are too many to list, so the refusal claims only the call shapes the matrix, the contract and the forward test ran. The repository's CI does not read the message text. An options object held in a variable, built by a spread or typed by a type parameter, a computed key with no known key beside it, a key named after an `Object` member and an explicit options type that admits the key meet only the runtime check.

Counts. Of eleven steps, ten are done, one is skipped (Benchmark, because the change is type-only), and none is partial, blocked or open.

### Attention

reviewed by gpt-6.1-sol @xhigh

- The rarity counts matched constructor names only. A recount by resolved import binding, 16 aliases included, finds none outside this run's own tests, and the plan now cites 1861 options literals and 177 calls with a type argument, `trail-review/constructor-calls-a1.log`.
- The conditional-forwarding dismissal said only types change. At runtime the schema refuses the insert that now compiles and leaves the document unchanged, `trail-review/runtime-probe-a1.log`.
- The computed-key dismissal lacked a runtime mutation. Removing the own-name check lets the seat's case through and fails four regression cases, in the same log.
- The changeset promised a compile error for every unknown option. It now names the shapes that meet only the runtime check.
- The acceptance claim said "case for case". It now names what the comparison checks, and the lint lists differ only by the file the folded export fixed.
- `tooling/scripts/type-probe.mjs` has tests but no runner uses it yet, so the `/pstack:correct` change stays partial.
- `/pstack:reflect` did not run, because no rule triggered it; the log records why, and the word "reflect" runs it.
