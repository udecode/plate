---
review_scopes: [editor-options]
review_basis: []
verdict: pursue
work_kind: implementation
review_commit: d53a8810369603967229766e1b6b192b2d08c368
review_inputs: [VISION.md, docs/vision/common.md, docs/plans/2026-10-14-create-editor-options.md, docs/plans/2026-10-15-create-editor-options-types.md, packages/plitejs/src/core/public-state.ts, packages/plitejs/test/create-editor-options-message.test.ts, oxlint.config.ts, tooling/scripts/check-hook-generics.mjs]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../slate@945a484df2497e4c448b33f417b0de2a49840032']
---

# Editor constructors honor inherited options

Status: executed: applied to your next checkout, waiting on your commit
Page: https://claude.ai/artifact/8jBszs3zy65Wm4tiTgtyDV
Playbook: plan

Pursue: every editor constructor reads an option the options object inherits, as headless `createEditor` already does, and none refuses it. The strongest reason is that the types already promise it. TypeScript cannot tell an own key from an inherited one, so a class instance whose getter defines `initialValue` type-checks as `CreateEditorOptions`, and refusing it at runtime would throw on a call the compiler accepts. Today four places split the options with object rest, which copies own keys only: plitejs/react `createEditor`, which `useEditor` builds through, Plate's `buildEditor`, platejs/react `createEditor` and `useCreateEditor`. So the four React constructors build an empty editor from `Object.create({ initialValue })` without an error, and platejs `createEditor` drops an inherited root-plugin option such as `api`. The tests that show it fail at `d53a881036`: `red-plite-react-a4.log` and `red-plate-a1.log`. That silent drop is the failure the closed option set exists to stop. This page also carries suggested task `t_244c89b3`, merged into this one: a CI test that reads the compile error headless `createEditor` gives an unknown option. `editor-options` is a new review scope for this question; no ledger item queued it.

## Brief

### What will change?

Editors now keep options they get from a parent object or a class getter. Plite's React editor and Plate's three editor makers used to drop them and start empty. It is applied to your next checkout, not committed.

### What could go wrong?

A getter that defines an option now runs while the editor is built. The speed check passed, but only on its third run, after a busy machine spoiled the first two.

## Teach

Every way to make an editor takes one options object. It first checks the object's keys against a fixed list and refuses a key it does not know, even one the object inherits from a parent object. Then it reads the options it knows.

The headless maker reads each option by name, so an option the object inherits counts. Plite's React maker, Plate's two makers and Plate's hook instead copied the object in a way that keeps only what is set on the object itself. A document or user id set on a parent object got lost, and the editor started empty.

Now each of those makers first copies every option it knows, from the object or its parents, into a plain object, and works from that copy. Plate checks the object once more after the copy. So the old option that passed in an existing editor still fails, even when reading another option adds it.

## Demo

1. From the repository root, run `pnpm --dir packages/plitejs exec vitest run --config ./vitest.config.mjs test/react/create-editor-options.test.tsx`. All 12 tests pass. In "builds the editor from them", Plite's headless and React makers both build the document, id, caret and read-only state from a parent object.
2. Run `bun test ./packages/platejs/src/lib/editor/withPlite.spec.ts ./packages/platejs/src/react/editor/withPlate.spec.ts ./packages/platejs/src/react/editor/useCreateEditor.spec.tsx`. All 31 pass, including the inherited document, user id and root `api` cases, and the case where a getter adds an `editor` option and still gets the migration error.

## Public API

No public call or type changes. The same call now builds the editor its options describe.

The first render of this test gets its document from a parent object. The base built an empty editor from it and the test never looked.

```ts before
// packages/plitejs/test/react/create-editor-options.test.tsx:49
it('plitejs/react useEditor refuses it on a later render', () => {
  const { rerender } = renderHook((options) => useEditor(options), {
    initialProps: Object.create({ initialValue }),
  });

  expect(() => rerender(Object.create({ value: initialValue }))).toThrow(
    unknownValueMessage
  );
});
```

```ts after
// packages/plitejs/test/react/create-editor-options.test.tsx
it('plitejs/react useEditor refuses it on a later render', () => {
  const { rerender, result } = renderHook((options) => useEditor(options), {
    initialProps: Object.create({ initialValue }),
  });
  const children = result.current.read.children();
  let message: string | undefined;

  try {
    rerender(Object.create({ value: initialValue }));
  } catch (error) {
    ({ message } = error as Error);
  }

  expect({ children, message }).toEqual({
    children: initialValue,
    message: unknownValueMessage,
  });
});
```

Plate's React maker named three options to keep them when inherited and split off the rest. The rest lost an inherited document or user id.

```ts before
// packages/platejs/src/react/editor/withPlate.ts:182
assertConstructorOptions(resolvedOptions, REACT_EDITOR_OPTION_KEYS);
// Named reads keep allocation options that the options object inherits.
const {
  id,
  lifecycleErrorSink,
  maxLength,
  navigationFeedback,
  plugins = [],
  readOnly,
  ...rest
} = resolvedOptions;

return buildEditor(
  {
    ...rest,
    id,
    lifecycleErrorSink,
    maxLength,
    plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
    readOnly,
  },
  REACT_EDITOR_OPTION_KEYS
);
```

```ts after
// packages/platejs/src/react/editor/withPlate.ts
const {
  navigationFeedback,
  plugins = [],
  ...rest
} = readConstructorOptions(resolvedOptions, REACT_EDITOR_OPTION_KEYS);

return buildEditor({
  ...rest,
  plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
});
```

## Main changes

- `plitejs/internal` gains `readEditorOptions(options, keys)`. For each key of a constructor's key set it reads the option by property access and copies it into a plain object when the value is defined or `key in options` holds. So an inherited option, a class getter and an own non-enumerable option all reach the copy, an absent option stays absent, and a key outside the set is never read. The copy runs the getters of the options it copies, so each caller runs the closed-set check first.
- `plitejs/react` `createEditor` splits that copy instead of the caller's object. `useEditor` is unchanged. It checks every render and builds through `createEditor` inside its memo.
- Plate's `withPlite.ts`, the one bridge file that may import Plite, gains `readConstructorOptions(options, keys)`, which checks the caller's object, copies it and checks it again. The second check keeps Plate's promise that an `editor` or `migrations` key a getter adds while the options are read still throws the migration message.
- `buildEditor` loses its `optionKeys` parameter and the runtime check of the options that reach the root plugin, because its input is now the copy, which holds only key-set keys. The `satisfies Record<string, never>` guard moves to the root plugin handoff and still fails the build when a builder option would reach the root plugin.
- Plate's `createEditor` and Plate React's `createEditor` build from the copy. Plate React drops its named reads of `id`, `lifecycleErrorSink`, `maxLength` and `readOnly` and their comment, since the copy carries every option.
- `useCreateEditor` reads `enabled`, `id` and `userId` by name on every render, so its memo key sees inherited values. The copy moves inside the memo, so a render that reuses its editor no longer copies its options.
- `packages/plitejs/test/create-editor-options-message.test.ts` compiles the two calls of `t_244c89b3` through the TypeScript 6 API and asserts each diagnostic names `'value'`, in the package's own test script.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| The reader | Plite | `plitejs/internal` | It sits beside `assertEditorOptions` and reads the same key sets; Plite React and Plate's bridge already import this entry |
| Plite React's split | Plite | `plitejs/react` | Its rest split dropped the options |
| Check, copy, check | Plate | `platejs`, `lib/editor/withPlite.ts` | Only bridge files may import Plite, and this one holds Plate's migration refusals beside `assertConstructorOptions` and `buildEditor`; the root entry names its exports by hand, so the helper stays internal |
| Plate React's split and the hook | Plate | `platejs/react` | Their rest splits dropped the options |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reading options in a constructor that splits them | object rest on the caller's object, own enumerable keys only | rest on a plain copy of every key-set option the object holds | `readEditorOptions` | the check already counts inherited keys as options | internal, no caller changes | the inherited cases in the Plite test and the three Plate specs, red at base | a getter now runs while the editor is built | rearchitect |
| Plate's getter-added `editor` refusal | check of the rest that reaches the root plugin, own enumerable only | second check of the caller's object after the copy | `readConstructorOptions` | the copy reads only key-set names, so a key a getter adds never reaches it | internal | `withPlite.spec.ts` getter case; removing the second check must fail it | none | move |
| `buildEditor`'s `optionKeys` and remainder check | present | deleted | `buildEditor` | dead once both callers pass the copy | two internal callers | the type guard stays at the handoff | a third caller passing a raw object | cut |
| Plate React's named allocation reads | four named reads beside a rest | deleted | Plate React `createEditor` | the copy carries every option | none | `withPlate.spec.ts` | none | cut |
| `useCreateEditor`'s per-render rest | copied every render | named reads of `enabled`, `id`, `userId` per render, the copy inside the memo | `useCreateEditor` | the memo key reads inherited values, and a reused render copies nothing | none | `useCreateEditor.spec.tsx`; render-cost rerun | render cost | gate |
| Headless `createEditor` and `useEditor` | named reads; per-render check and memo | unchanged | `plitejs` | they already honor inherited options | none | the headless row of the Plite test | none | keep |
| The unknown-option compile message | read only by an ignored run-directory probe | a CI test in the package's test script | `create-editor-options-message.test.ts` | `t_244c89b3` | none | fails by its message with the fifth overload removed | TypeScript 6 API drift | keep |

## What other editors do

The constructors were read at each checkout's `HEAD` (commits in `review_upstreams`), and none was run. Two of the four that take an options object read options by name, so inherited ones count; two copy own keys and drop inherited ones silently. None refuses an unknown or inherited key.

| Editor | Constructor | Reads options by | Inherited option | Unknown key |
| --- | --- | --- | --- | --- |
| ProseMirror | `EditorState.create(config)`, `new EditorView(place, props)` | property access; `setProps` copies with `for...in` | counts | ignored, or kept on the props |
| Lexical | `createEditor(config)` | property access and named destructuring | counts, except inside the nested `dom` config, which it spreads | ignored |
| Slate | `createEditor()`, `withReact(editor, clipboardFormatKey)` | no options object | not applicable | not applicable |
| Tiptap | `new Editor(options)` | object spread in `setOptions` | dropped silently | kept |
| CKEditor 5 | `Config` | `Object.keys` | dropped silently | kept |
| Plite and Plate today | six constructors | headless: property access; the other five: object rest | counts headless only | refused, own or inherited |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| After this verdict | Design, plan, build and prove the fix in this run (look) | Stop here with the verdict written | hold | big |
| An inherited option | Every editor maker uses it, as the headless one does | Every editor maker refuses it with an error | refuse inherited | big |
| Plate's three makers | Fix them in this run, since they drop the same options for the same reason | Fix only Plite and leave Plate as a suggested task | Plite only | small |
| A plan panel | Skip it, since no public call or type changes and three designers and a judge already compared designs | Run the panel on this plan before the build | panel | detail |
| Delivery | Apply it to your next checkout, as you asked, and leave the commit to you | Leave it as a patch file | patch only | detail |
| Extra edge-case tests | Leave out the four extra cases the design judge suggested, and list the two that matter as known gaps | Add them anyway | more tests | detail |
| The Plite law sentence | Draft it for later, since another open task is editing the same law file | Write it into that file now | write law now | detail |

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

No earlier review or plan judged this question. The two plans that set the closed option set, [Create editor options](2026-10-14-create-editor-options.md) and its iteration [Create editor options types](2026-10-15-create-editor-options-types.md), are retained: this verdict keeps their refusals and fixes the reads they left behind, which their diff round 1 deferred as suggested task `t_dcc41973`.

### Requirements

- The owner's ask: decide through `best-api` whether React reads each known key by name, as headless does, or both constructors refuse an inherited known key; fix it; assert the document in the `useEditor` later-render test; done when a test that fails today proves the chosen behavior on plitejs/react `createEditor` and `useEditor`.
- The merged ask `t_244c89b3`: a test under `packages/plitejs/test` that compiles `createEditor({ plugins: [history()], value: [] })` and `createEditor({ readOnly: true, value: [] })` through the TypeScript 6 API and asserts that each diagnostic names `'value'`, failing by its message when the fifth `createEditor` overload is deleted, in a run of the package's own test script.
- The closed option set stays: every constructor refuses an unknown key, own or inherited, before it runs a getter, and Plate refuses `editor` and `migrations` with its migration message, including one a getter adds while the options are read (`packages/platejs/src/lib/editor/withPlite.spec.ts`).
- The exported types promise what the runtime accepts (`best-api`'s review questions).
- Plate source reaches plitejs only through the bridge files `oxlint.config.ts` lists; no `any` in production source (`CODING_STANDARDS.md`).
- A render that reuses its editor does no more work in `useEditor` and `useCreateEditor` than before; the earlier plan froze that budget at 1.10.

### Lanes

- **Honor inherited known options (picked).** Every constructor reads each known key wherever the object holds it. It matches the types, headless `createEditor`, Plate's own pinned allocation options and the two reference editors that read by name.
- **Refuse inherited known options.** `assertEditorOptions` throws on a known key that is not own. One rule for all six constructors, and the object rest would then see every option. It loses: it throws on calls the types accept, reverses Plate's tested allocation behavior, still drops an own non-enumerable option, and adds a second refusal message for a call that is not a mistake.
- **Delete the prototype walk (strongest deletion).** Check and read own keys only. It loses: an inherited `value` or misspelled key would pass silently, which the earlier plan's three panel rounds refused as critical.
- **Inline named reads in each constructor (control, no new artifact).** Each constructor destructures every option of its key set by name. It loses: each destructure becomes a second hand-kept list of its key set, so adding an option needs edits in Plite React, `buildEditor` and Plate React, and a missed edit drops the option silently, which is this bug again. It also hands the root plugin an own `api: undefined` when the caller wrote none, which throws (`probe-api-undefined-a1.log`).

### Design

`pstack:architect` ran three runners, Opus at high, Astra at xhigh and Sol at xhigh, and an Opus cross-judge on relabeled copies. All three reached the same shape: one reader driven by the key sets, Plate checks the caller's object again after the copy, and the hook copies inside its memo. The judge picked the Opus candidate as the base, because it is the smallest. It adds no file, no reader parameter and no change to headless `createEditor`. It grafted the Sol candidate's hook change, building with the `id` and `userId` the memo is keyed on. It rejected a second check in Plite React, because headless `createEditor` ignores a key a getter adds and the copy never reads one. It rejected Astra's headless rewrite and its `captured` reader parameter as surface with no outcome. Challenge delta: `improved`, the hook's cast to `(options: unknown) => Editor` is deleted.

Three realistic failures, each with its proof: a reader that copies only enumerable keys (the class-getter case of the Plite test), a reader that copies absent keys as `undefined` (every Plate spec, through the root plugin's `api` check), and Plate's second check dropped or run on the copy (the getter-added `editor` case of `withPlite.spec.ts`). The blast radius is the six constructors and nothing else. `readEditorOptions` and `readConstructorOptions` have no other caller, and `buildEditor` has two. Rollback is reverting the patch.

Proof limits: the runtime claims rest on Bun and Vitest runs under happy-dom and jsdom; no browser runs, because no rendered behavior changes.

### Dependents

`node tooling/scripts/review-ledger.mjs lookup editor-options` lists nine scopes whose code outside plitejs imports this scope's owners. None calls a constructor with an inherited option, so each is unaffected:

- `basic` and `markdown`, unaffected: `packages/platejs/src/markdown/lib/MarkdownPlugin.ts` imports `withPlateFormatCompilation`, which does not read constructor options.
- `compiler`, unaffected: `packages/platejs/src/compiler/compileEditor.ts` imports compilation types and helpers from `withPlite.ts`, none of which this change touches.
- `distribution`, unaffected: `packages/platejs/src/core.tsx` re-exports the constructors; `packages/platejs/src/internal/plugin/resolveCreatePluginTest.ts` calls `createEditor` with an object literal; `packages/platejs/src/plain-text.ts` imports `withPlateFormatCompilation`.
- `documents`, unaffected: `packages/platejs/src/docx/import/lib/importDocx.ts` imports `withPlateFormatCompilation`, which does not read constructor options.
- `html`, unaffected: `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx` and `staticPresentation.ts` import format helpers, which do not read constructor options.
- `persistence`, unaffected: `packages/platejs/src/migrations/documentMigrations.ts` imports document helpers, which do not read constructor options.
- `plate-api`, unaffected: `packages/platejs/src/lib/editor/index.ts` re-exports `withPlite.ts`, and no published entry reaches that barrel; `HtmlPlugin.ts` and `htmlConversion.ts` import format helpers.
- `react`, unaffected beyond the fix: `packages/platejs/src/react/core.tsx` and `packages/platejs/src/react/editor/index.ts` re-export the React constructors, which gain the fix with no call change.

## Steps

- [x] Add `readEditorOptions` to `plitejs/internal` and split its copy in `plitejs/react` `createEditor`. Proof: `red-base-plite-a1.log` fails at base; the same test passes on the final tree; with the reader mutated to `for...in`, the class-getter case fails.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-base-plite-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-plite-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/reader-copies-enumerable-keys-only-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/plite-react-splits-the-caller-object-a1.log`.
- [x] Add `readConstructorOptions` to Plate's bridge, drop `buildEditor`'s `optionKeys` and remainder check, and build Plate's `createEditor`, Plate React's `createEditor` and `useCreateEditor` from the copy, the hook with the `id` and `userId` it keyed on. Proof: `red-plate-a1.log` and `red-base-hook-a1-a1.log` fail at base; the three Plate specs pass on the final tree; with the second check removed, the getter-added `editor` case of `withPlite.spec.ts` fails; with the reader copying absent keys, the Plate specs fail.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-plate-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-base-hook-a1-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-plate-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/plate-drops-the-second-check-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/reader-copies-absent-keys-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/plate-builds-from-the-caller-object-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/plate-react-splits-the-caller-object-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/hook-keys-on-own-options-only-a1.log`.
- [x] Test headless `createEditor`'s unknown-option message in CI (`t_244c89b3`). Proof: `message-test-a1.log` passes through the package's test script; with the fifth overload deleted, a run of `pnpm --filter plitejs test` fails by the test's message.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-message-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/fifth-overload-deleted-a1.log`.
- [x] Types. Proof: plitejs and platejs typecheck show errors only in the files that fail the same way at base (`base-red: cmd:plitejs-typecheck`, `cmd:platejs-typecheck`, owned by `t_54844d26`), and no spec this change edits has a type error.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-plitejs-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-plitejs-base-a1.log` hold the same six errors; `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-platejs-core-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-platejs-react-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-platejs-root-a1.log` pass; `docs/plans/artifacts/2026-10-15-plite-inherited-options/typecheck-platejs-specs-a1.log` has no error in the three edited specs.
- [x] Render-cost gate on the final tree. Rerun the probe of [Create editor options](2026-10-14-create-editor-options.md) step 124 unchanged: the median microseconds of a `useEditor` or `useCreateEditor` rerender that reuses its editor, four cohorts, budget frozen at candidate over base at most 1.10 per cohort, judged by `paired-timing.mjs` with a 3 µs planted arm and a same-code arm. A conclusive miss sends the hook design back to `architect`; an inconclusive run stays a gate. Proof: `bench-paired-a<N>.log` and its measurements.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/bench-paired-a3.log` passes every cohort at load 7.40, the third run; the decision log records the two inconclusive runs before it. `docs/plans/artifacts/2026-10-15-plite-inherited-options/bench/reads-base-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/bench/reads-cand-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/bench/reads-harness-a1.log` count the options a reused render reads.
- [x] Amend the unreleased changesets for `plitejs` and `platejs`. Proof: `.changeset/plite-editor-options.md` and `.changeset/plate-editor-options.md`.
  Done: `.changeset/plite-editor-options.md` and `.changeset/plate-editor-options.md`.
- [x] Writing passes and the last lint. Proof: decision rows of phase `writing` and the `pnpm lint:fix` log.
  Done: the decision log's `writing` rows and `docs/plans/artifacts/2026-10-15-plite-inherited-options/lint-task-a1.log`.
- [x] Apply the change to the owner's `next` checkout. Proof: the patch applies there, and the Plite, Plate and message suites pass there.
  Done: `docs/plans/artifacts/2026-10-15-plite-inherited-options/inherited-options.patch` applied with `git apply`, after `docs/plans/artifacts/2026-10-15-plite-inherited-options/patch-apply-a3.log`; `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-plite-a1.log` 12 passed, `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-plate-a1.log` 31 pass and `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-message-a1.log` 1 pass.

## Open work

- Add the read law to `docs/vision/plite.md`, after the sentence that ends "`useEditor` checks on every render.": "A constructor that splits its options reads each option in its set wherever the options object holds it, so an inherited option, a class getter and an own non-enumerable option build the editor as the same option written in the call does." Another open task, `task_7deb6a75`, holds that file. owner: zbeyens, who applies it once that task lands. stop: the sentence is in `docs/vision/plite.md`.
- `docs/plans/topics/suggestions.md:179` still asks whether Plate constructors take a closed option set and says inherited options do not survive. Those two parts are settled: the 2026-10-14 plan closed the set, and this plan reads inherited options. Its other two parts stay open. `buildEditor`'s options type leaves out the root-plugin keys, such as `api` and `inject`, so its `satisfies Record<string, never>` guard types a non-empty object as empty. And each constructor still runs its check and its copy as two calls instead of one check that returns the options it checked. owner: zbeyens, who rewrites the item to those two parts. stop: the item names only them.

## Close

Deviations and reversals:

- The reader, Plite React's split and Plate's check, copy, check were written while the two Codex design runners still ran, before the judge's verdict. The judge picked the same shape, so that code stayed as the build, with the hook change it grafted on top.
- The render-cost step first closed on a count of option reads after an inconclusive timing run. The decision-trail review called that a substitution for the frozen rule, so the step reopened, and the same timing protocol then passed on a quiet host. That pass is the third run; the first two were inconclusive.
- The Plite law sentence is drafted in Open work, not written, because the open task `task_7deb6a75` holds `docs/vision/plite.md`.
- Six decision-log rows were written twice, because the queue file kept an earlier batch. The run removed the copies before any reviewer read the log, and `docs/plans/artifacts/2026-10-15-plite-inherited-options/decisions-before-dedupe.tsv` keeps the file from before.

What landed, applied to the `next` checkout on the owner's word and not committed:

- `readEditorOptions` in `plitejs/internal`, and `plitejs/react` `createEditor` splitting its copy.
- `readConstructorOptions` in Plate's `withPlite.ts`; `buildEditor` without `optionKeys` or its remainder check; Plate's `createEditor`, Plate React's `createEditor` and `useCreateEditor` building from the copy, the hook with the `id` and `userId` it keyed its memo on.
- The compile-message test of `t_244c89b3`, the inherited cases in the Plite test and the three Plate specs, and one new bullet in each of the two unreleased changesets.

Proof, each from its decision-log row:

- Red at `d53a881036`: `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-base-plite-a1.log` (the React row and the later-render document), `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-plate-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-base-hook-a1-a1.log`.
- Green on the final code: `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-plite-a1.log` 12 passed, `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-plate-a1.log` 31 pass, `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-message-a1.log` 1 pass, in a worktree at `d53a881036` plus the patch.
- Green again after the apply, in the `next` checkout, which also held other sessions' uncommitted work: `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-plite-a1.log`, `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-plate-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/next-green-message-a1.log`.
- Mutations on frozen tree `a98896cd`: 8 of 8 fail their own test, under `docs/plans/artifacts/2026-10-15-plite-inherited-options/mutate/`. The fifth-overload mutant fails by the test's message through `pnpm --dir packages/plitejs run test`.
- Types: the plitejs typecheck holds the same six errors as at base (`base-red: cmd:plitejs-typecheck`, owned by `t_54844d26`); the platejs core, react and root partitions pass; no edited spec has a type error.
- Render cost: `docs/plans/artifacts/2026-10-15-plite-inherited-options/bench-paired-a3.log` gives candidate over base 1.004, 0.990, 0.980 and 1.038 across the four cohorts, under the 1.10 budget, with every planted arm failing. Both candidate copies sit near 1.04 in the large Plate cohort. The cause is not identified, since the hook's own option reads fell there from 18 to 3 per reused render (`docs/plans/artifacts/2026-10-15-plite-inherited-options/bench/reads-cand-a1.log`).
- Coverage limits: no test changes an inherited `userId` to show that the hook builds a new editor. The hook reads `id` and `userId` in one named destructure, so the inherited `id` case proves that read, not the user key. The judge also suggested a Plate case where a getter adds an inherited unknown key. It was not added, because no promise asks Plate to refuse it. Plate's second check should refuse it anyway. That is inferred from the code, not run.
- The five structural findings of the comment review were the lead's dismissals, not the judge's. The judge ruled only on its candidates, where it rejected a reader parameter and a branded copy. The lead turned down the other three: unexporting the per-render check, removing the second check and folding the check into the reader. Typing the root-plugin keys stays open under Open work.
- Limits: every runtime claim rests on Bun and Vitest runs under jsdom and happy-dom. No browser ran, because nothing renders differently.

The owner's asks:

- "Decide through `best-api` whether React reads each known key by name, as headless does, or both constructors refuse an inherited known key": decided, every constructor reads it.
- "then fix it and assert the editor's document in the 'useEditor refuses it on a later render' test": done.
- "Done when a test that fails today proves the chosen behavior on createReactEditor and useEditor": done, `docs/plans/artifacts/2026-10-15-plite-inherited-options/red-base-plite-a1.log` and `docs/plans/artifacts/2026-10-15-plite-inherited-options/green-plite-a1.log`.
- `t_244c89b3`, a test that compiles both calls through the TypeScript 6 API and names `'value'`, failing by its message without the fifth overload in the package's own test script: done.
- "Try again": the cross-judge relaunched after a rate limit and returned its verdict.
- "cant you just edit files in next branch": done, the run applied the patch to the `next` checkout and left the commit to the owner.

Counts: 8 steps, 8 done. Two Open work items, each with its owner and stop. The decision-trail review raised 1 critical finding, 2 warnings and 1 nit, all applied.

### Attention

reviewed by gpt-6.1-sol

- Keep the 1.10 timing gate open until a conclusive run resolves it. Since the review, the third run passed every cohort.
- Review inherited `userId` rebuild coverage and the undisposed judge recommendation. Both are now named as coverage limits above.
- Treat the five structural dismissals as lead decisions. The Close now says so.
- Review the no-panel exemption. No panel ran on the finished plan or the diff, as the Defaults row "A plan panel" records.
- Verify clean patch application and retain the deferred Vision sentence. Since the review, the patch applied cleanly to `next`, and the Vision sentence is task `t_953143c6`.

### Reflect

After the owner's correction about asking before applying the patch, one Opus reviewer applied the tooling, judgment and divergent lenses to the session from that message onward. Its brief is `docs/plans/artifacts/2026-10-15-plite-inherited-options/reflect/reviewer-prompt.md`, and its reply is `docs/plans/artifacts/2026-10-15-plite-inherited-options/reflect/reviewer-reply.md`.

The run applied no lesson. None was a script crash fix or a rewording that adds no words, the two kinds this project applies without the owner. The run tested one finding instead of arguing it. A PreToolUse hook refused an edit tool call on the `next` checkout, so the Git rule's claim holds and shell writes are the only route there. The run fixed two defects in its own records. The last step's Done line now says the change was applied to `next`, and the worktree's log and run directory now match the `next` copies.

Accepted, each moved to Backlog because it changes a shared rule or adds a check:

- An app-worktree session stopped at a patch file and asked, though `git apply` from the shell reaches the owner's clean `next` checkout. The Git rule should have it apply the patch itself, after checking the branch, the status of every patched path and `git apply --check --whitespace=error-all`, and still commit nothing. (Tooling 1 and 2, Judgment 1.)
- After the apply, the run kept two copies of its plan, log and proof logs, and they drifted. The same rule should name which copy is the record. (Divergent 1, Tooling 3, Judgment 3.)
- `plan-open.mjs` reported no open items while the plan's Status, its last step and its log disagreed about delivery. A check should compare them. (Judgment 3, Divergent 5.)
- The scoped transcript ran past the reflect call into the skill's own setup. `reflect.md` should say where a scoped transcript ends. (Tooling 4.)

Rejected:

- Test the rule's claim that the edit tools cannot write to `next` (Divergent 2). This reflect tested it, and the hook refused the edit.
- Never re-ask in the hand-back a call a Defaults row settled (Judgment 2). The Autopilot and Plan pages rules already allow an ask only for a call the run stops on. The ask came from a wrong pick, which the first Accepted item fixes.
- Name other sessions' work when claiming green in a shared checkout (Divergent 3). `verify` already runs acceptance in a worktree at base plus the patch, and this run's acceptance ran there. The Close now says the `next` run was in a shared tree.
- Do not predict a reflect's findings (Divergent 4). The reviewer got pstack's prompts unchanged, and this synthesis judged every finding, so the prediction changed nothing.
- Keep the one-script, two-copy edit with a `cmp` check (Judgment 4). It proposes no change.

Backlog, each with owner: zbeyens and stop: the owner starts or drops the task, tracked in `docs/plans/suggested-tasks.decisions.tsv`:

- The first two Accepted items are folded into `t_591359ab` "Decide who applies a card session's patch and when its waits clear", which already asks who applies such a patch. The fold quotes the owner's words.
- The check is `t_33f1ebc3` "Check a done plan's Status against its delivery records".
- The transcript end is `t_2c566c4e` "End a scoped reflect transcript at the reflect call".
