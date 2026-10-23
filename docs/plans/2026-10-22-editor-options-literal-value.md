---
review_scopes: [editor-options]
review_basis: [2026-10-15-plite-inherited-options]
verdict: pursue
work_kind: implementation
review_commit: da4bc3e523ee7286ed479be75981808583f1215d
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/plans/2026-08-02-schema-derived-editor-value-types.md, docs/plans/2026-10-15-plite-inherited-options.md, packages/platejs/src/react/editor/withPlate.ts, packages/platejs/src/react/editor/useCreateEditor.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/react/editor/Editor.ts, packages/platejs/src/lib/editor/Editor.ts, packages/platejs/src/internal/editor/generatedEditorTypes.ts, packages/plitejs/src/create-editor.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/interfaces/node.ts, packages/platejs/type-tests/editor-configure-contracts.ts, packages/platejs/type-tests/plate-editor-value-contracts.ts, packages/plitejs/test/react/create-editor-options-contract.ts, packages/plitejs/test/generic-value-contract.ts, packages/test/src/react/createPlateTestEditor.ts, packages/platejs/src/features/table/lib/__tests__/getTestTablePlugins.ts, packages/platejs/src/react/utils/inputRules.spec.tsx, apps/www/src/registry/components/editor/plugins.spec.tsx, apps/www/src/registry/components/editor/plugins.generated.ts, tooling/scripts/check-hook-generics.mjs, tooling/scripts/check-hook-generics-baseline.json, 'content/docs/(guides)/editor.mdx', packages/platejs/src/core.tsx, packages/platejs/src/react/core.tsx, packages/platejs/src/internal/plugin/resolveCreatePluginTest.ts]
review_upstreams: ['../slate@945a484df2497e4c448b33f417b0de2a49840032', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# A starting document no longer types the editor

Status: executed: landed on next
Page: https://claude.ai/artifact/3MJBaiJVbDRUTqTAFNfsoH
Playbook: plan

Pursue: `createEditor` widens a literal or typed `initialValue`. Every Plate editor's document type is `Value`, and the starting document is only checked against it. The plain Plate `Editor` type also means `Value`, not `any`. The state view does not become assignable across `V`. The strongest reason is that the starting document's type is false after the first edit. An editor seeded with `'a'` still claims `'a'` and one child after the user types more text (probe lines 74-79), and nothing stops the write. Making `Editor` covariant would let more helpers accept that false type, and about ten transaction methods would have to stop taking `V` as input. The Plate vision already says raw plugin tuples keep "editor-wide `Value` broad" (`docs/vision/plate.md:279-280`), and the 2026-08-02 value-types plan already cut caller value generics from the factories (slice 4, `docs/plans/2026-08-02-schema-derived-editor-value-types.md:131`). Today's overloads bring them back. This page answers suggested task `t_f51d6de6` and judges the question under the `editor-options` review scope.

## Brief

### What will change?

A Plate editor no longer takes its type from an inline or typed starting document, and the plain editor type now means the normal document type. Ten casts that only worked around the old types are gone. The change landed with its guides and release note.

### What could go wrong?

Code that relied on the exact type of its starting document now has to check the value first, as one registry test, two table tests and one DOCX test did. The spec type check still shows 244 unrelated errors.

## Teach

An editor's document type describes what its content can look like. A helper that takes an editor only accepts editors whose document type is exactly the one it expects, because the helper may write any content its own type allows.

Today Plate's React editor maker copies the starting document into the editor's type. Start with one paragraph that says "a", and the type says the document is always exactly that, which the first keystroke makes wrong. Helpers that expect the normal document type reject that editor, so 15 spec type checks fail. The plain editor type has the opposite problem. It accepts any document, so a wrong read compiles.

After this change the editor maker only checks the starting document. Every Plate editor, and the plain editor type, gets the normal document type, as the Plate vision already says. Apps that want an exact document type get it from the generator, for saved data and other static boundaries.

## Public API

A helper typed with the editor maker's return type now accepts an editor built from an inline starting document.

```ts before
// packages/platejs/src/react/utils/inputRules.spec.tsx:32, 357-377
const setEndSelection = (editor: ReturnType<typeof createEditor>) => {
  /* … */
};

const editor = createEditor({
  plugins: [BaseParagraphPlugin /* , … */],
  initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
});
setEndSelection(editor); // error: Target requires 1 element(s) but source may have fewer
type Doc = ValueOf<typeof editor>; // readonly [{ readonly children: readonly [{ readonly text: 'a' }]; readonly type: 'paragraph' }]
```

```ts after
// packages/platejs/src/react/utils/inputRules.spec.tsx:32, 357-377
const setEndSelection = (editor: ReturnType<typeof createEditor>) => {
  /* … */
};

const editor = createEditor({
  plugins: [BaseParagraphPlugin /* , … */],
  initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
});
setEndSelection(editor);
type Doc = ValueOf<typeof editor>; // Value
```

The plain `Editor` type of `platejs` and `platejs/react` now means a `Value` document, so a wrong read no longer compiles.

```ts before
// packages/platejs/src/react/editor/Editor.ts:163
import type { Editor } from 'platejs/react';

const readNumber = (editor: Editor): number =>
  editor.read.children()[0].children[0].text; // compiles: the document is any
```

```ts after
// packages/platejs/src/react/editor/Editor.ts:163
import type { Editor } from 'platejs/react';

const readNumber = (editor: Editor): number =>
  editor.read.children()[0].children[0].text; // error: unknown is not assignable to number
```

The editor makers and their options type no longer take a document type. The only code in the repository that passed one is a table test helper.

```ts before
// packages/platejs/src/features/table/lib/__tests__/getTestTablePlugins.ts:51-70
export const createTestTableEditor = (
  options: Omit<
    CreateEditorOptions<Value, readonly BasePluginInput[]>,
    'initialValue'
  > & { initialValue?: InitialValue<Value> }
): TableTestEditor => {
  /* … */
  return createEditor<
    Value,
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined
  >({ /* … */ });
};
```

```ts after
// packages/platejs/src/features/table/lib/__tests__/getTestTablePlugins.ts:51-70
export const createTestTableEditor = (
  options: Omit<
    CreateEditorOptions<readonly BasePluginInput[]>,
    'initialValue'
  > & { initialValue?: InitialValue<Value> }
): TableTestEditor => {
  /* … */
  return createEditor<
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined
  >({ /* … */ });
};
```

The `@platejs/test` harness and its `ReactTestEditor` type drop their document type parameter, which none of the 195 call sites passes.

```ts before
// packages/test/src/react/createPlateTestEditor.ts:123-133
export const createTestEditor = async <
  V extends Value = Value,
  const TPlugins extends readonly SharedPluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TPlugins, TSchema>,
  harnessOptions: EditorTestHarnessOptions = {}
): Promise<[ReactTestEditor<V, TPlugins, TSchema>, EditorTestActions, EditorTestRenderResult]> => {
```

```ts after
// packages/test/src/react/createPlateTestEditor.ts:123-133
export const createTestEditor = async <
  const TPlugins extends readonly SharedPluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<TPlugins, TSchema>,
  harnessOptions: EditorTestHarnessOptions = {}
): Promise<[ReactTestEditor<TPlugins, TSchema>, EditorTestActions, EditorTestRenderResult]> => {
```

## What other editors do

I read Slate `945a484df`, Lexical `dd5c41b13`, ProseMirror (`prosemirror-model` `6264de0`, `prosemirror-state` `ffad5d9`) and Tiptap `91c51be53` without running them. None of them takes the editor's document type from its initial content.

| Editor | Where the document type comes from | Does initial content narrow it? |
| --- | --- | --- |
| Slate | Declared app types merged into `CustomTypes` (`src/types/custom-types.ts:23`); `createEditor()` takes no type (`create-editor.ts:91`) | No |
| ProseMirror | The schema's node and mark names, `Schema<Nodes, Marks>` (`src/schema.ts:572`) | No; `EditorState.create({ doc })` takes a plain `Node` (`state.ts:67-71`) |
| Lexical | Not typed; node classes register at runtime (`LexicalEditor.ts:926`) | No |
| Tiptap | Not typed; `content` is plain JSON or HTML (`src/types.ts:298`, `Editor.ts:56`) | No |
| Plate after this plan | The installed plugins, or a `plate generate` contract at a static boundary | No; it is checked against `Value` |

## Hard cuts and app migration

Removed:

- The first overload of `platejs/react` `createEditor` and of `useCreateEditor`, the `const TInitialValue` overload that typed the editor from its literal starting document.
- The caller-chosen `V` type parameter of `createEditor` in `platejs` and `platejs/react`, of `useCreateEditor`, of the public `CreateEditorOptions` type in both entrypoints, and of `@platejs/test`'s `createTestEditor` and `ReactTestEditor`.
- The `any` document of the plain `Editor` type in `platejs` (`lib/editor/Editor.ts:117`) and `platejs/react` (`react/editor/Editor.ts:163`), which `docs/vision/plite.md:88-90` already forbids.
- The unused `InferPlateEditorValue` export of `platejs/react`.

Callers that break, from the spike census (`spec-tsc-spike-v5`, `typecheck-spike-v5`, `type-tests-spike-v5`, `www-tsc-spike-v5`, `www-pkg-tsc-spike-v6` and `hook-generics-spike-v5`):

- `packages/platejs/src/features/table/lib/__tests__/getTestTablePlugins.ts:53,66` spells `CreateEditorOptions<Value, …>` and `createEditor<Value, …>`.
- `packages/test/src/react/createPlateTestEditor.ts:56,128` spells `ReactTestEditor<V, …>` and `CreateEditorOptions<V, …>`.
- `packages/platejs/type-tests/editor-configure-contracts.ts:49-51,93-101` casts the seed and pins its exact type.
- `apps/www/src/registry/components/editor/plugins.spec.tsx:32-34` reads the first child as a table only through the literal type.
- Three table spec files compiled only because the plain `Editor` was `any`: `BaseTablePlugin.range-projection.spec.tsx` passes a slice node to a helper typed for elements (7 calls), `BaseTablePlugin.delete.spec.tsx` passes the hyperscript fixture's selection as a write target (4 calls), which the fixture type allowed to be a node selection although the fixture only builds text selections, and `BaseTablePlugin.merge.spec.tsx:144-145` reads `children` from a node that may be text.
- `apps/www/src/__tests__/package-integration/docx/list-roundtrip.spec.tsx:243-245` seeds an editor with an `unknown[]` parameter. It compiled only because `exportDocx` takes the plain `Editor`, whose `any` document let the seed's type become `any` too. Its helper now takes `Value`.
- `tooling/scripts/check-hook-generics-baseline.json` still lists the removed type parameters.
- `content/docs/(guides)/editor.mdx` and `editor.cn.mdx` teach that `ValueOf<typeof editor>` of a literal-seeded editor is the app's value type and type a helper with the generated `Editor`, and `content/docs/api/core/plate-editor.mdx:285,304` says the installed plugin schema supplies the value type.
- `apps/www/src/generated/api-reference-manifest.json` and the docs registry files under `apps/www/public/r/` are regenerated from those sources.

The card also cites `UploadPlugin.spec.ts:81`. That error is a different class: it passes a headless editor, which lacks the React editor's `[reactEditorReference]`, where a React editor is expected, 10 errors in all, and this change leaves it as it is. It goes to the task that makes the spec typecheck pass.

The delete spec keeps its code, because the fixture's selection type now matches the text selections the fixture builds:

```ts before
// packages/plitejs/src/testing/jsx.ts:22-25
export type TestEditorFixture = {
  children: Element[];
  selection?: Selection<EditorSelection>;
};
```

```ts after
// packages/plitejs/src/testing/jsx.ts:22-25
export type TestEditorFixture = {
  children: Element[];
  selection?: Selection<TextSelection>;
};
```

An app that used its starting document for a node's exact type now reads the node with a type check:

```ts before
// apps/www/src/registry/components/editor/plugins.spec.tsx:32-34
const table = editor.read.children()[0];

expect(editor.plugin(TablePlugin).api.columnWidths(table)).toEqual([300, 300]);
```

```ts after
// apps/www/src/registry/components/editor/plugins.spec.tsx:32-34
const table = editor.read.nodes.get([0], { type: TablePlugin })![0];

expect(editor.plugin(TablePlugin).api.columnWidths(table)).toEqual([300, 300]);
```

An app that passed its own document type drops it.

```ts before
const editor = createEditor<MyValue>({ initialValue });
```

```ts after
const editor = createEditor({ initialValue });
```

No live Plate editor has an exact document type without a cast. A helper that takes the app's editor types its parameter with `typeof editor`, `ReturnType<typeof createAppEditor>` or the plain `Editor`. The `Editor` and `Value` types that `plate generate` writes fit static data boundaries, such as a saved document or a server payload, as the guide's "Exact generated editor types" section says. A live editor has the `Value` type, so it does not pass where the generated `Editor` is expected. With the full editor kit that was already true before this change (TS2719 on the base). A small kit whose seed matched the generated type passed before and fails now; its helper takes `typeof editor` instead.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Type of an editor built from a starting document | The normal document type; the starting document is only checked (look) | Keep copying the starting document into the type, and let editors pass across document types | keep literal | big |
| Document type the caller hands to the Plate editor maker | Removed, because the vision forbids a second document type beside the plugins (look) | Keep it | keep value type | big |
| Plite's editor taking its type from its starting document | Kept for now; whether to drop it is its own decision task (look) | Drop it in this run too | plite too | small |
| Plate editor type written without a document type | The normal document type, in this run, with two table test files narrowed and the test fixture's selection typed (look) | Leave it meaning any document and fix it in its own task | bare editor later | small |
| The two editor-maker signatures, one for an editor with no plugin list | Kept; merging them, so an options object typed with optional plugins passes, is its own fix task (look) | Merge them in this run | one signature | small |
| Exact document type from the generator | Nothing new; apps keep using the generated types in their own type declarations (safe) | Let the plugin list carry the generated document type into the editor | generated value | small |
| Registry test that reads a table node | Read the node with a type check (safe) | Add a type to the starting document | annotate seed | detail |
| Build once the plan panel passes | Build in this run (safe) | Stop at the plan | hold | detail |
| This plan's page | A new page, https://claude.ai/artifact/3MJBaiJVbDRUTqTAFNfsoH, because the old one, https://claude.ai/artifact/51oK1H4weY4guyk7U6FSfN, no longer opens (safe) | Delete the new page and leave the plan without one | drop new page | detail |

## Evidence

### Requirements

- [ask] An editor built from a literal `initialValue` passes where `Editor` is expected, including a consumer helper typed `(editor: Editor) => void`, without per-spec annotation.
- [ask] The decision is settled before the specs change: `createEditor` widens a literal `initialValue`, or the state view stays assignable across `V`.
- [law] Raw plugin tuples keep editor-wide `Value` broad, and exact types come from `plate generate` ([plate.md:279-285](../vision/plate.md)).
- [law] Normal Plate code infers `Editor` through creation and never uses a parallel value generic; raw schema-less Plite may keep an explicit `createEditor<ExternalValue>` ([plite.md:111-117](../vision/plite.md)).
- [law] Bare Plite `Editor` is `Editor<Value>`, not an existential editor ([plite.md:86-91](../vision/plite.md), [generic-value-contract.ts:124-127](../../packages/plitejs/test/generic-value-contract.ts)).
- [lead] A document type must stay true after the document changes.

### Lanes

- **Widen (picked).** Delete the literal overloads and every Plate `V`, and make the plain `Editor` mean `Value` by giving its type parameter the default `Value`, which deletes its separate `never` branch. On the spike (`spike-v6.patch`, then `spike-v7.patch` with the round 2 fixes), all 15 tuple errors and 11 others clear, and the spec errors drop from 270 to 244 (`spec-tsc-spike-v5`). Two errors in `BaseDetailsViews.mounted.spec.tsx` and two in `BaseTablePlugin.cell-selection.spec.tsx` stay at the same lines with `Value` in place of the tuple or `any`; the first spec's helper wants an installed `authored` state view the editor lacks. No new error site appears once the table spec files narrow; typing the fixture's selection later adds none in the platejs, plitejs or www package-integration projects (`spec-tsc-prefixture-*`, `spec-tsc-fixture-*`). `TURBO_FORCE=true pnpm typecheck` passes with 0 of 96 tasks cached (`typecheck-spike-v5`), and `pnpm test:types` with the extended contract, the www typecheck, `check-hook-generics.mjs --check` after the baseline rewrite and the registry spec pass (`type-tests-spike-v5`, `www-tsc-spike-v6`, `hook-generics-spike-v6`, `registry-spec-spike-v6`). With v7 and the round 3 fixes, the www package-integration typecheck, `pnpm test:types`, type-aware `pnpm lint:task` on every changed file, `pnpm check www` and the forced `platejs` and `@platejs/test` typecheck pass (`www-pkg-tsc-r2fix`, `type-tests-r3final`, `lint-task-r3`, `check-www-r3`, `typecheck-r3final`). After the diff panel's fixes, the table, DOCX and registry spec files pass (`specs-r5`), and so do `pnpm test:types`, type-aware `pnpm lint:task`, `pnpm check www` and the same typecheck (`type-tests-r5`, `lint-task-r5`, `check-www-r5`, `typecheck-r5`, which adds `plitejs`).
- **Covariant state view.** Rejected. The literal type is still false after an edit. About ten transaction members take `V` as input (`interfaces/editor.ts:773-780, 990, 1333, 1413, 1467-1476`). TypeScript also measures `EditorStateFragmentApi` invariant where its shape is covariant, so both causes would need repair.
- **Plite-style widening in Plate.** Rejected. It drops the literal text and tuple length but still yields a `V` that `Editor<Value>` and `ReturnType<typeof createEditor>` reject.
- **Control: retype the 15 spec helpers to Plate's any-valued `Editor`.** Rejected. It keeps the false type, cannot fix `AIChatPlugin.focus.spec.tsx:84`, which compares children to the tuple, and moves the defect into every caller.
- **Strongest deletion considered.** Also stop Plite from inferring a type from its starting document. That stays out of this plan: it is a hard cut that Vision does not order, so it goes to a decide task. The plain `Editor` change is already law (`plite.md:88-90`) and is in this plan, after the plan panel showed that leaving it on `any` lets a helper typed `(editor: Editor)` accept the seeded editor while checking nothing (`panel/plan-r1`, probe `bare-editor-any.ts` compiles at the base and fails on the spike).
- **Proof limits.** The spec typecheck is not a CI gate, and it still reports 244 unrelated errors after the change. The claim covers only the tuple class and the table sites named under Hard cuts.

### Dependents

- `basic`, `markdown` (`packages/platejs/src/markdown/lib/MarkdownPlugin.ts`), `compiler` (`packages/platejs/src/compiler/compileEditor.ts`), `documents` (`packages/platejs/src/docx/import/lib/importDocx.ts`), `html` (`packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx`, `staticPresentation.ts`), `persistence` (`packages/platejs/src/migrations/documentMigrations.ts`) and `plate-api` (`HtmlPlugin.ts`, `htmlConversion.ts`): unaffected, because they import format and compilation helpers, not the editor makers' value type; `pnpm typecheck` passes on the spike.
- `distribution`: `packages/platejs/src/core.tsx` re-exports `CreateEditorOptions`, whose arity changes; `resolveCreatePluginTest.ts` calls `createEditor({ … })` with no type arguments and is unaffected; `plain-text.ts` imports unrelated helpers.
- `react`: `packages/platejs/src/react/core.tsx` and `react/editor/index.ts` re-export `createEditor`, `useCreateEditor` and `CreateEditorOptions`, whose arity changes.
- `plate-api`: `packages/platejs/src/lib/editor/index.ts` re-exports `withPlite.ts`, so its `CreateEditorOptions` arity changes.

Model: claude-opus-5-5 @xhigh (lead); arena runners claude-opus-5-5 @xhigh, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh; cross-judge claude-opus-5-5 @xhigh. This review reopens the head `2026-10-15-plite-inherited-options` only for value typing; its option-reading decisions stand.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Literal seed typing in `platejs/react` | `const TInitialValue` overloads type the editor from the seed | Deleted | `withPlate.ts`, `useCreateEditor.ts` | False after an edit; breaks `plate.md:279-280` | Contracts, www spec, docs | Spec tsc tuple class gone; new contract | A caller reads a node type from its seed | cut |
| Caller-chosen Plate `V` | `createEditor<V>`, `useCreateEditor<V>`, `CreateEditorOptions<V, …>` | Deleted; `V` is `Value` | `withPlate.ts`, `withPlite.ts`, `useCreateEditor.ts` | `plite.md:114-117` forbids a parallel value generic; hook-generics baselines it as debt | Table helper, test harness, baseline, changeset | `pnpm typecheck`, hook-generics without the baseline lines | An app spelled a value type | cut |
| `createTestEditor` and `ReactTestEditor` value type | `V` param no caller spells | Deleted | `@platejs/test` | Same law; it feeds `CreateEditorOptions` | Changeset | `pnpm typecheck` | None found | cut |
| Internal option types that carry `V` | `CreateEditorOptionsForValue`, `BaseEditorOptions<V>`, `ReactEditorOptions<V>`, `UseCreateEditorResult<V>` and the initial-value helpers in `withPlite.ts` | `V` removed; each uses `Value` | `withPlite.ts`, `withPlate.ts`, `useCreateEditor.ts` | Dead once the caller `V` is gone; the helpers drop three casts | None | `pnpm typecheck` | None found | cut |
| `InferPlateEditorValue` | Exported from `platejs/react`, no caller | Deleted | `withPlate.ts` | Dead export | Changeset | `git grep -w` finds no caller | An outside app imported it | cut |
| Plite seed inference | `ReadonlyJson` and mutable seed shapes | Unchanged here | `plitejs` `create-editor.ts`, `with-react.ts`, `use-editor.ts` | Hard cut not ordered by Vision; outside the card | Decide task | Judge probe J3, J3b | Same false-after-edit class stays in Plite | defer |
| Bare Plate `Editor` value | `any` when `V` is omitted | `Value`, as the type parameter's default | `lib/editor/Editor.ts`, `react/editor/Editor.ts` | `plite.md:88-90` bans defaulting `Editor` to `any`; with `any`, a helper typed `(editor: Editor)` accepts the seeded editor while checking nothing | 8 table spec calls narrowed and the hyperscript fixture's selection typed as a text selection; the DOCX list round-trip helper takes `Value`; `normalizeBaseInitialValue` loses its `V` | `spec-tsc-spike-v5`, `typecheck-spike-v5`, `www-pkg-tsc-r2fix`, the contract's read guard (`contract-base-r4`) | A caller outside the repository read through `any` | cut |

## Steps

- [x] **1. Cut the starting-document typing and every Plate `V`.** Delete the `const TInitialValue` overloads in `packages/platejs/src/react/editor/withPlate.ts` and `useCreateEditor.ts`. Drop `V` from `createEditor` in `withPlate.ts` and `packages/platejs/src/lib/editor/withPlite.ts`, from `useCreateEditor`, from both public `CreateEditorOptions` types, from the internal option types and initial-value helpers, and from `createTestEditor` and `ReactTestEditor` in `packages/test/src/react/createPlateTestEditor.ts`, so each returns `Editor<Value, …>`. Make the plain `Editor` in `lib/editor/Editor.ts` and `react/editor/Editor.ts` mean `Value` by defaulting `V` to `Value` and deleting the `never` branch. Delete `InferPlateEditorValue` and the internal `GeneratedEditorValue` it read, which nothing else uses. Migrate `getTestTablePlugins.ts`, narrow two table spec files, type the selection of `TestEditorFixture` in `packages/plitejs/src/testing/jsx.ts` as a text selection, which is all the hyperscript fixture builds, and type the DOCX list round-trip helper with `Value`. Run `node tooling/scripts/check-hook-generics.mjs` to drop the stale baseline lines. Proof: `pnpm exec tsc -p packages/platejs/tsconfig.test.json --noEmit` compared with the base log through `scripts/tsc-diff.mjs` shows every tuple-class error gone and no new error site; `TURBO_FORCE=true pnpm typecheck` passes; both www TypeScript projects pass, `tsconfig.json` and `tsconfig.package-integration.json`; `pnpm check hook-generics` passes; `pnpm lint:task` passes on the changed files.
- [x] **2. Guard the rule with a type contract.** Extend `packages/platejs/type-tests/create-editor-options-contracts.ts`. An editor seeded with a literal, a typed `Element[]` variable, a callback or a `{ children }` document, from either entrypoint and with or without plugins, returns `Value` from `read.children()`, and so does either plain Plate `Editor`. The contract checks that return type instead of `ValueOf`, because `ValueOf` maps an `any` document to `Value` (`any-editor-probe-r4`). A plugin-seeded and a pluginless editor pass `ReturnType<typeof createEditor>`, and seeded editors pass the plain `Editor` of `platejs`, `platejs/react`, `plitejs` and `plitejs/react`; the contract imports the two Plite types through the approved bridges `../src/facade` and `../src/react/internal/plite-types`. `useCreateEditor` gives the same type, or that type or `null` under `enabled: boolean`, checked at module scope. A seed that is not a `Value` still fails. Drop the seed cast and the exact-type pin from `editor-configure-contracts.ts`. Proof: `pnpm test:types` passes (`type-tests-r5`); in a detached worktree at `da4bc3e523`, the contract fails on the seeds, both read assertions, the plugin-seeded `ReturnType` line and both Plite handoffs (`contract-base-r4`).
- [x] **3. Migrate the registry spec.** Read the table in `apps/www/src/registry/components/editor/plugins.spec.tsx` with `editor.read.nodes.get([0], { type: TablePlugin })`. Proof: `bun test ./apps/www/src/registry/components/editor/plugins.spec.tsx` passes.
- [x] **4. Fix the docs.** Run `plate-docs` on `content/docs/(guides)/editor.mdx`, its Chinese twin and `content/docs/api/core/plate-editor.mdx`, whose Chinese twin has no type helpers section. "Typed editor" says the starting document is checked against `Value` and never sets the type. "Value type" says every editor's document type is `Value`, that helpers take `typeof editor` or the plain `Editor`, and points to "Exact generated editor types" for static data boundaries. That section's example calls updates the heading and table plugins lack. It also types its helper with the generated `Editor`, which no live editor has. The fixed example's helper takes the factory's return type, and it compiles against the spike (`docs-guide-spike-v6`). The API reference's "Type helpers" stops saying the installed schema supplies the value type. Proof: the `plate-docs` checks it names and the docs preview of each page.
- [x] **5. Repair the API teaching.** Run `best-api repair` with `node tooling/scripts/teaching-sweep.mjs` on `CreateEditorOptions`, `createEditor<`, `ReactTestEditor`, `InferPlateEditorValue` and `ValueOf<typeof editor>`, and fix each live hit. Proof: the sweep lists no live hit of the removed shape.
- [x] **6. Write the changeset.** Load `changeset` and amend the unreleased `.changeset/platejs-foundation.md`, which already moves users from `createPlateEditor` to `createEditor`. Its migration adds the `CreatePlateEditorOptions` rename, says that `createEditor`, `useCreateEditor` and `CreateEditorOptions` take no value type argument, and says that a helper takes the factory's return type. The changeset rule measures against `platejs@54.0.0-beta.1`, whose plain `Editor` already defaulted to `Value`, so the plain `Editor` change gets no sentence. `@platejs/test` gets none, because it has never been published, and `InferPlateEditorValue` never shipped. Proof: the `changeset` skill's own check.
- [x] **7. Writing passes, gates, review and land.** Run `deslop` and `no-comments` on the code, `unslop` on the docs, plan and changeset, then `pnpm lint:task` on every changed file, which runs type-aware oxlint as `land.mjs` does. After the last writing pass and after each panel round's fixes, regenerate with `pnpm generate www`, then run `pnpm check www`. Then the diff panel (reviews: api-build), then `node .agents/pstack/land.mjs --check 'pnpm check --affected'`. Proof: each pass's row in the decision log, `pnpm check www` passing, the panel rows and the landed commit.

## Open work

- Plite's seed inference: offered as decide task `t_ebcb5e83` with the judge's probes J3 and J3b. Owner: the editor-options scope. Stop: that task's verdict.
- One editor-maker signature, so `createEditor(options)` accepts options typed `CreateEditorOptions<typeof Kit>` with optional plugins (TS2769 today): offered as fix task `t_c9ea5a4f`. It is done when the casts that work around the split can go, `createEditor(options as any)` in `createTestEditor`, `options as CreateEditorOptions` in `withPlate.ts` and `options as CreateEditorOptions & { enabled?: boolean }` in `useCreateEditor.ts`. Owner: the editor-options scope. Stop: that task's landing.
- The `[reactEditorReference]` spec class, `UploadPlugin.spec.ts:81` and 9 more: folded into `t_d957b48c`, which makes the platejs spec typecheck pass. Owner: the platejs spec typecheck. Stop: that task's landing.

## Close

- **Reversals and deviations.** The diff panel's guard nit reversed one build choice. The four `kind === 'text'` guards in `BaseTablePlugin.delete.spec.tsx` are gone, and `TestEditorFixture` in `packages/plitejs/src/testing/jsx.ts` types its selection as the text selection the hyperscript fixture builds, so the spec keeps its code. No Defaults pick changed.
- **Repeat check.** The guard nit repeats the rule-only row in `docs/development/enforcement.md` that bars a structural guard or cast hiding a missing typed API, so `/pstack:correct` ran on its class. The fixture type removes this instance, because a spec that reads a hyperscript selection now gets a text selection without a guard. At `da4bc3e523` no other spec narrows a fixture selection. The three kind checks the sweep found read browser-sampled or runtime selections that can be either kind (`correct-sweep`). A lint cannot tell a guard that hides a weak type from one that narrows a real runtime union, so the row stays rule-only.
- **What landed.** One commit on `next`, "feat(platejs): type every Plate editor's document as Value", after two test commits that it needed to pass the land check: "test(plitejs): run the selection import work case at 16 views at most", for suggested task `t_1bf5e7d5`, and "test(plitejs): fit view-caret-work's cases inside the test deadline". `createEditor`, `useCreateEditor`, `CreateEditorOptions` and the test editor makers take no value type argument, `initialValue` is checked against `Value`, and the plain `Editor` defaults its document to `Value`. Ten casts that the new types made unnecessary are removed, in four specs, the copilot kit, the editor perf page and the plugin resolver. The type contract checks the new types, and the editor guides, the PlateEditor API page and the foundation changeset teach it.
- **Proof.** `pnpm test:types` passes with the contract (`type-tests-r5`), and the same contract fails at `da4bc3e523` on the seeds, both read checks, the plugin-seeded `ReturnType` line and both Plite handoffs (`contract-base-r4`). The read checks reject an `any` document that `ValueOf` lets through (`any-editor-probe-r4`). Type-aware `pnpm lint:task` on every changed path, `pnpm generate www` with no output change, `pnpm check www` and a forced typecheck of `platejs`, `plitejs` and `@platejs/test` (95 tasks, 0 cached) pass (`lint-task-r5`, `generate-www-r5`, `check-www-r5`, `typecheck-r5`). The three table specs, the DOCX list round-trip spec and the registry spec pass, 63 of 63 (`specs-r5`). The hand drive covers the three docs pages, and the thirteen package, app and generated files it lists show nothing on any page (`hand-drive-check-r6`). The first land run's whole-tree type-aware lint found the ten casts, which the r5 lint had checked only on changed paths. With them removed, `pnpm lint:type-aware` passes on the whole tree, a forced platejs typecheck passes (84 tasks, 0 cached), `pnpm generate www` and `pnpm check www` pass, and the four changed specs pass, 71 of 71 (`lint-type-aware-r6`, `typecheck-r6`, `generate-www-r6`, `check-www-r6`, `specs-r6`). The three changed non-test files transpile to byte-identical JavaScript (`emit-identical`). Five land runs failed `plite-test` on `view-caret-work` timeouts at load averages from 30 to 40, while the file passed 16 of 16 alone (`caret-work-rerun`). The file's cases count work, and their run time grows with its 32 views and 500 history batches. To unblock the landing, the run took suggested task `t_1bf5e7d5`, which runs the selection import case at 16 views (`caret-work-fix-five`), and then cut the whole file to 16 views and 200 history batches. Its slowest case fell from 2.5 and 3.2 s to 0.65 s, and the file passed 16 of 16 in five warm runs (`caret-sixteen-timing`, `caret-sixteen-slowest`, `caret-sixteen-five`).
- **Limits.** The platejs spec typecheck is not a CI gate. It still reports 244 errors outside the tuple class, and the plitejs spec typecheck reports 1459, both unchanged by the fixture type (`spec-tsc-fixture-platejs`, `spec-tsc-fixture-plitejs`). Plite's own seed inference is unchanged.
- **Counts.** 1 of 1 asks done: the card's decision, which widens, and the fix it gated. 3 plan panel rounds and 1 diff round ran; no diff round critical.
- **Open work.** The three items under Open work, each with its owner and stop.
