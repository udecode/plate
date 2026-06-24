# Plite React Editor Initialization And Value Ralplan

## Current Verdict

Score: `0.93`, status: `ready-for-user-review`.

Hard take: the current example code is too much, and the root cause is real.
`<Plite initialValue>` mutates the editor during provider render, while
projection/decoration stores can read the editor snapshot before that provider
initialization runs. That forces manual pre-seeding with
`editor.update((tx) => tx.value.replace(...))`, which is correct mechanically but
bad public DX.

Target direction:

```tsx
const editor = usePliteEditor({
  initialValue,
  withEditor: withHistory,
});

return (
  <Plite editor={editor} decorationSources={[codeHighlightingSource]}>
    <Editable />
  </Plite>
);
```

Hard revision from the API bake-off:

- Use singular `withEditor`, not a composer array.
- Fix editor composer typing first: `withHistory` should mirror `withReact` and
  preserve `ValueOf<T>`.
- Do not ship an array composer API in the first public hook. It looks pleasant
  but pushes TypeScript toward tuple tricks, `as const`, or explicit generic
  assertions.

Low-level non-React target:

```ts
const editor = createEditor<CustomValue>({
  initialValue,
  initialSelection: null,
});
```

This steals the right idea from Lexical, Tiptap, and ProseMirror: initial
document state belongs to editor/state creation, not to a post-construction
manual transaction hidden in app code.

## Intent And Boundaries

Intent:

- Make React example initialization one obvious line.
- Avoid teaching users and agents to seed document state through manual
  `tx.value.replace` boilerplate.
- Ensure decoration/projection/comment stores see the initialized document before
  they build their first snapshot.
- Solve the related Plite issue family around initial value, document
  replacement, and selection repair without reintroducing controlled-value
  confusion.

Outcome:

- Public examples initialize editors without manual `editor.update` seeding.
- Core supports synchronous initial document state at editor creation.
- React exposes one small creation hook that is Plite-close and not Plate-like.
- `<Plite>` stops being the primary value initializer.

In scope:

- `createEditor({ initialValue, initialSelection })`.
- `usePliteEditor({ initialValue, withEditor })` in `plite-react`.
- Example cleanup for code highlighting, markdown preview, highlighted text,
  review comments, persistent annotation anchors, collaborative comments, and
  rendering strategy runtime.
- Test helpers that forbid manual initial seeding in examples and React tests
  except explicit replacement behavior tests.
- Issue-targeted tests for external replacement and selection reset.

Non-goals:

- Do not make Plite a fully controlled React component.
- Do not copy Tiptap's extension/content API wholesale.
- Do not make `plite-react` depend on `plite-history`.
- Do not remove `editor.update` or `tx.value.replace`; they remain the correct
  mounted-editor replacement path.
- Do not make Plate-style `plugins` the raw Plite initialization API.

Decision boundaries:

- This plan may add a small React hook and core creation options.
- This plan may de-emphasize or hard-cut `<Plite initialValue>` after migration
  proof.
- This plan may add docs/tests/examples but must not add opinionated schema
  defaults.

Resolved by this pass:

- `<Plite initialValue>` should not be the blessed v2 initialization API.
- Remove it before public v2 release if possible. If a short-lived internal
  compatibility adapter is needed during migration, keep it undocumented and
  warn in development.

## Live Current State

Current code-highlighting example manually creates, seeds, and returns the
editor:

- `/Users/zbeyens/git/plite/site/examples/ts/code-highlighting.tsx:55`
- `/Users/zbeyens/git/plite/site/examples/ts/code-highlighting.tsx:61`

Current provider accepts `initialValue`:

- `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate.tsx:65`
- `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate.tsx:96`
- `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate.tsx:107`

Current provider initialization mutates the editor in render via
`editor.update -> tx.value.replace`, then marks the editor initialized in a
WeakSet:

- `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate.tsx:96`
- `/Users/zbeyens/git/plite/packages/plite-react/src/components/slate.tsx:107`

Current projection stores build immediately from the editor snapshot when the
source is created:

- `/Users/zbeyens/git/plite/packages/plite-react/src/projection-store.ts:343`
- `/Users/zbeyens/git/plite/packages/plite-react/src/projection-store.ts:352`

That is why examples with decoration/projection stores are tempted to seed the
editor before `<Plite>` renders.

Current core `createEditor` takes no options and initializes public state to an
empty document:

- `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:385`
- `/Users/zbeyens/git/plite/packages/plite/src/create-editor.ts:508`
- `/Users/zbeyens/git/plite/packages/plite/src/core/public-state.ts:2474`

## Ecosystem Evidence

Lexical:

- `LexicalComposer` creates the editor inside `useMemo` and calls
  `initializeEditor(editor, initialEditorState)` before returning context:
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx:57`
  and
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx:82`.
- `initialConfig.editorState` is the React entrypoint:
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx:45`.
- It supports object/string/function initialization and guards empty editor
  state:
  `/Users/zbeyens/git/lexical/packages/lexical-react/src/LexicalComposer.tsx:110`.

Tiptap:

- `useEditor` owns editor creation from options:
  `/Users/zbeyens/git/tiptap/packages/react/src/useEditor.ts:344`.
- `EditorOptions.content` is the initial document input:
  `/Users/zbeyens/git/tiptap/packages/core/src/types.ts:296`.
- React creation uses `useSyncExternalStore` and has explicit rerender controls:
  `/Users/zbeyens/git/tiptap/packages/react/src/useEditor.ts:351` and
  `/Users/zbeyens/git/tiptap/packages/react/src/useEditor.ts:365`.

ProseMirror:

- The canonical shape is state-first:
  `EditorState.create({ doc, plugins })`, then `new EditorView({ state })`.
  Evidence:
  `/Users/zbeyens/git/prosemirror/demo/demo.ts:13` and
  `/Users/zbeyens/git/prosemirror/demo/demo.ts:16`.

Conclusion:

- Steal state-at-creation and React hook/composer ergonomics.
- Reject Tiptap's opinionated `content` name for raw Plite. Plite's term is
  `initialValue`.
- Reject making the provider mutate the editor during render.

## Decision Brief

Principles:

- Initial value is editor state, not provider side effect.
- React helpers may improve DX, but raw Plite stays unopinionated.
- Initialization must be synchronous before projection sources read snapshots.
- Whole-document replacement after mount remains a transaction.
- Names should match Plite vocabulary: `initialValue`, not `content`.

Top drivers:

- Code-highlighting/projection sources need initialized snapshots before first
  source build.
- Existing examples teach manual transactions as setup boilerplate.
- Issue corpus shows real pain around controlled-value drift and document
  replacement.

Options:

1. Keep `<Plite initialValue>` as the blessed API.
   - Pro: close to legacy examples.
   - Con: provider render mutates editor and is too late for pre-provider
     source creation.
   - Verdict: reject as primary API.
2. Add only `createEditor({ initialValue })`.
   - Pro: core-correct, simple, works for headless and React.
   - Con: React examples still require `useMemo` plus composer nesting.
   - Verdict: keep as low-level substrate.
3. Add `usePliteEditor({ initialValue, withEditor })`.
   - Pro: best React DX, close to Tiptap's hook ergonomics while preserving
     Plite `with*` composition.
   - Con: new hook needs careful name/type design because `useEditor` already
     means context in Plite.
   - Verdict: leading public React API.
4. Add `usePliteEditor({ initialValue, withEditors: [...] })`.
   - Pro: nice visual symmetry with Tiptap/Lexical extension arrays.
   - Con: wrong first raw-Plite API. TypeScript proof shows the array shape does
     not preserve `HistoryEditor` without extra tuple machinery or explicit
     generics. It also implies a plugin list instead of Plite's existing
     composer-function model.
   - Verdict: reject for first public API.
5. Add Tiptap-style `useEditor({ content, extensions })`.
   - Pro: familiar to Tiptap users.
   - Con: not Plite vocabulary, collides with existing `useEditor`, and
     implies an opinionated extension architecture.
   - Verdict: reject.
6. Add Lexical-style `<SlateComposer initialConfig>`.
   - Pro: clean full React composer.
   - Con: heavier than Plite needs and duplicates `<Plite>`.
   - Verdict: reject for first cut.

Chosen:

- Core: `createEditor({ initialValue, initialSelection })`.
- React: `usePliteEditor({ initialValue, withEditor })`.
- Support editor composer typing: fix `withHistory` typing to preserve the editor value and
  extension intersection through `ValueOf<T>`, matching `withReact`.
- Provider: `<Plite editor={editor}>` should provide context and subscriptions,
  not initialize document content.

Consequences:

- Examples get shorter and source stores see the correct first snapshot.
- The current `<Plite initialValue>` tests need migration or a compatibility
  decision.
- The API bake-off picks singular `withEditor` and adds the `withHistory`
  `ValueOf<T>` typing prerequisite.

Follow-ups:

- Implement type tests that prove `withHistory` preserves `ValueOf<T>`.
- Implement the hook with the singular `withEditor` option.

## Public API Target

Core:

```ts
type CreateEditorOptions<V extends Value = Value> = {
  initialSelection?: Selection;
  initialValue?: V;
};

createEditor<CustomValue>({
  initialValue,
  initialSelection: null,
});
```

React:

```ts
type PliteEditorComposer<
  V extends Value,
  E extends ReactEditor<V> = ReactEditor<V>,
> = (editor: ReactEditor<V>) => E;

type UsePliteEditorOptions<
  V extends Value,
  E extends ReactEditor<V> = ReactEditor<V>,
> = {
  withEditor?: PliteEditorComposer<V, E>;
  initialSelection?: Selection;
  initialValue?: V;
};

const editor = usePliteEditor({
  initialValue,
  withEditor: withHistory,
});
```

Support composer typing target:

```ts
export const withHistory = <T extends Editor<any>>(
  editor: T
): T & HistoryEditor<ValueOf<T>>
```

That shape is not optional polish. The current `withHistory` signature loses the
custom value/editor intersection in TypeScript and forces casts in examples.

Docs examples should show:

```tsx
const editor = usePliteEditor({
  initialValue,
  withEditor: withHistory,
});

return (
  <Plite editor={editor}>
    <Editable />
  </Plite>
);
```

Multiple editor wrappers stay explicit composition:

```tsx
const editor = usePliteEditor({
  initialValue,
  withEditor: (editor) => withFoo(withHistory(editor)),
});
```

If multiple composition becomes common, add a tiny `composeEditors`
helper later. Do not make the first public hook carry an array DSL.

Mounted replacement remains:

```ts
editor.update((tx) => {
  tx.value.replace({
    children: nextValue,
    selection: null,
  });
});
```

That is not initialization. It is explicit document replacement.

## Related Plite Issues To Solve

Primary:

- `#5488`: real API ergonomics pain around replacing editor content without
  fake controlled `value` loops.
  Evidence: `docs/plite-issues/open-issues-dossiers/5558-5480.md:886`.
- `#5710`: load different content; current answer is a pile of transforms or
  direct children replacement.
  Evidence: `docs/plite-issues/open-issues-dossiers/5760-5666.md:464`.
- `#4564`: programmatic clearing leaves selection pointing into vanished
  content and crashes.
  Evidence: `docs/plite-issues/open-issues-dossiers/4642-4542.md:954`.
- `#3465`: normalization for initial value/imported documents.
  Evidence: `docs/plite-issues/open-issues-dossiers/3558-3435.md:721`.

Adjacent:

- `#4612`: externally updating editor value in `plite-react`; not a direct test
  candidate, but relevant API pressure.
  Evidence: `docs/plite-issues/test-candidate-map/4642-4542.md:125`.
- `#5351`: empty array as an initial value breaks; docs/API should make the
  valid initial value contract impossible to miss.
  Evidence: `docs/plite-issues/open-issues-dossiers/5402-5250.md:646`.

Do not overclaim:

- This plan does not solve every controlled React editor use case.
- It gives users a first-class initial-value path and a first-class replacement
  transaction path.

## Runtime Target

- `initializePublicState(editor, options)` should seed children, runtime ids,
  selection, marks, operations, commit, caches, and version coherently.
- Initial seeding should not emit user operations, fire `onChange`, or enter
  history.
- Initial seeding should create a snapshot that projection stores can read
  immediately.
- Invalid `initialValue` should fail with a clear error before React renders.
- Empty initial value behavior needs a deliberate contract:
  - either reject `[]` with a better error and docs;
  - or normalize to schema/default-root shape if the core can do that without
    product assumptions.
    Current recommendation: reject `[]` for raw Plite unless a schema/default
    element exists.

## React Runtime Target

- `usePliteEditor` creates one editor per component lifetime.
- It applies `withReact` internally.
- It applies optional `withEditor` after `withReact`, so `withEditor: withHistory`
  gives `withHistory(withReact(createEditor(...)))`.
- It does not expose a composer array in the first API.
- It must not recreate the editor on every render.
- It must not hide external store subscriptions inside broad component rerenders.
- It should mirror Tiptap's `useSyncExternalStore` discipline only where needed;
  Plite already has provider-level selector contexts, so do not add a second
  subscription model casually.

## Hook And Option Naming

Rejected:

- `useEditor`: already means context in Plite and would be a breaking semantic
  collision.
- `useCreateEditor`: accurate but clunky.
- `useEditorInstance`: internal-sounding.
- `usePlite`: too vague and close to legacy naming confusion.
- `withEditors` / composer arrays: attractive but wrong for first public API; array typing failed the
  bake-off and implies a plugin list.
- `plugins` / `extensions`: too Tiptap/Plate-shaped for raw Plite.
- `setup` / `configure`: vague and side-effect flavored.
- `with`: cute, but too terse for a public option name.

Accepted names:

- `usePliteEditor`
- `withEditor`

Reason:

- Clear enough for React creation.
- Does not collide with existing context `useEditor`.
- Close to Plite vocabulary without copying Tiptap.
- Matches existing `withReact` / `withHistory` function composition.

## Test And Proof Matrix

Unit/API:

- `createEditor({ initialValue })` snapshot has the initialized children before
  any update.
- `createEditor({ initialValue, initialSelection })` preserves or nulls
  selection deterministically.
- Initial seeding emits no operations and no commit.
- Invalid `initialValue` throws a clear public error.
- Empty `[]` behavior is explicitly tested according to the chosen contract.

React:

- `withHistory(withReact(createEditor<CustomValue>()))` preserves
  `CustomValue`, `ReactEditor`, and `HistoryEditor` without casts.
- `usePliteEditor({ initialValue, withEditor: withHistory })` returns a
  React-enabled editor with initialized value.
- `usePliteEditor({ initialValue, withEditor: editor => withFoo(withHistory(editor)) })`
  keeps callback parameters typed.
- Decoration source created immediately after `usePliteEditor` sees initialized
  text in its first build.
- `<Plite editor={editor}>` no longer needs `initialValue`.
- If `<Plite initialValue>` remains temporarily, duplicate initialization warns
  or no-ops deterministically.

Issue regressions:

- `#5488/#5710`: docs and tests show how to replace a whole document after
  mount with selection reset.
- `#4564`: replacing/clearing content with `selection: null` never leaves DOM
  selection pointing into removed content.
- `#3465`: initial/imported normalization contract is tested or explicitly
  rejected with an error.

Browser:

- Code-highlighting example loads with projections active on first paint.
- Markdown preview, highlighted text, review comments, persistent annotation
  anchors, and collaborative comments render without manual seeding.
- Mentions example still preserves void-arrow selection behavior from the
  recent regression fix.

## Applicable Lens Matrix

`vercel-react-best-practices`: applied.

- React render should not mutate editor state in provider render.
- Initialization should happen in a stable hook/factory, not broad rerender
  paths.

`react-useeffect`: applied.

- Initializing editor value is not an effect. It is construction state.
- Tiptap uses an effect for instance lifecycle, but Plite can keep initial value
  synchronous because editor creation is local.

`performance-oracle`: applied.

- Projection stores build immediately; wrong empty first snapshot causes stale
  or wasted projection work.
- Initial seeding must avoid operation/history/subscription churn.

`performance`: applied.

- Large repeated surfaces should not pay for a provider-level transaction just
  to establish initial content.
- Future metrics should split initial snapshot build from first interactive
  render.

`tdd`: applied.

- This needs red tests around source-first snapshot initialization and
  replacement selection repair.

`build-web-apps:shadcn`: skipped.

- No UI chrome decision here.

## Maintainer Objection Ledger

Change: Add `createEditor({ initialValue })`.

- Pain: raw Plite users learn a new option.
- Objection: "Plite already has `<Plite initialValue>`; why duplicate?"
- Steelman: keeping initialization in one React provider is simpler for docs.
- Tradeoff: two surfaces exist during migration.
- Answer: provider initialization is too late for stores created before
  provider render; core initialization is the only source-order-safe primitive.
- Evidence: projection store initial build reads `Editor.getSnapshot(editor)`
  during source creation.
- Rejected alternative: keep manual `tx.value.replace` in examples. It teaches
  setup as a mutation and confuses agents.
- Migration: move `initialValue` from `<Plite>` into `createEditor` or
  `usePliteEditor`.
- Proof: initialized snapshot, zero operations, projection first-build test.
- Verdict: keep.

Change: Add `usePliteEditor`.

- Pain: another React hook in slate-react.
- Objection: "Plite should not become Tiptap."
- Steelman: users can already write `useMemo(() => withReact(createEditor()))`.
- Tradeoff: hook must own `withReact` ordering and one optional composition
  callback.
- Answer: the hook is tiny and only removes repeated unsafe initialization
  ceremony; it does not add Plate-style plugins or commands.
- Evidence: code-highlighting currently needs 14 lines of editor setup just to
  avoid provider-late initialization.
- Rejected alternative: Lexical-style composer. Too heavy for Plite.
- Migration: replace `useMemo/useState` editor setup with `usePliteEditor`.
- Proof: example rewrite and type tests for custom editor/value generics.
- Verdict: keep with singular `withEditor`.

Change: Reject `withEditors` / composer arrays.

- Pain: users with several wrappers must compose them in one function.
- Objection: "Arrays are easier to scan and closer to plugin lists."
- Steelman: `withEditors: [withHistory, withFoo]` looks nice in examples.
- Tradeoff: single `withEditor` is less list-like for multi-wrapper setups.
- Answer: TypeScript proof matters more. The array shape failed to preserve
  `HistoryEditor` without tuple machinery, while `withEditor: withHistory` passed
  once `withHistory` used `ValueOf<T>`.
- Evidence: in-memory TypeScript bake-off against live `Plate repo root` paths:
  current `withHistory` chain fails; `ValueOf<T>` `withHistory` plus
  `withEditor: withHistory` passes; variadic composer arrays still fail.
- Rejected alternative: variadic tuple array plus `as const`. Too much ceremony
  for raw Plite's first hook.
- Migration: advanced users compose manually:
  `withEditor: editor => withFoo(withHistory(editor))`.
- Proof: add type tests for direct composer and composed callback.
- Verdict: keep rejection.

Change: Fix `withHistory` typing.

- Pain: support package type change.
- Objection: "This is separate from initialization."
- Steelman: examples can cast to `CustomEditor` and move on.
- Tradeoff: touches `plite-history` before the React hook.
- Answer: without this fix, every hook shape either lies about the editor type or
  requires the same cast we are trying to remove.
- Evidence: current `withHistory(withReact(createEditor<CustomValue>()))` fails
  type proof; `withReact` already uses `ValueOf<T>` and passes the preservation
  pattern.
- Rejected alternative: force `usePliteEditor<CustomValue, CustomEditor>`.
  Generic assertions are not better DX than the current cast.
- Migration: no runtime migration; only better exported typings.
- Proof: type tests for direct chain and hook chain.
- Verdict: keep.

Change: Demote or remove `<Plite initialValue>`.

- Pain: legacy Plite docs muscle memory.
- Objection: "This is the familiar API."
- Steelman: simple examples are currently readable with `<Plite initialValue>`.
- Tradeoff: examples must all create initialized editors explicitly.
- Answer: a provider prop that mutates editor state during render is the wrong
  primitive for v2's source/store runtime.
- Evidence: current provider calls `editor.update` inside render-time
  initialization.
- Rejected alternative: keep as blessed API and document caveats. Caveats are
  exactly where agents and users get cut.
- Migration: `initialValue` moves to `usePliteEditor` or `createEditor`.
- Proof: all examples compile and render without provider initial seeding.
- Verdict: cut as public/blessed API before v2 release; temporary internal
  warning adapter allowed only during migration.

## Implementation Phases

Phase 0: support composer type substrate.

- Change `withHistory` to preserve `ValueOf<T>` like `withReact`.
- Add type tests for:
  - `withHistory(withReact(createEditor<CustomValue>()))`;
  - `usePliteEditor({ initialValue, withEditor: withHistory })`;
  - `usePliteEditor({ initialValue, withEditor: editor => withFoo(withHistory(editor)) })`.

Phase 1: core initialization.

- Add `CreateEditorOptions`.
- Seed initial value inside public-state initialization.
- Add zero-operation snapshot tests.

Phase 2: React hook.

- Add `usePliteEditor`.
- Apply `withReact` internally.
- Apply optional singular `withEditor`.
- Add React type/runtime tests.

Phase 3: provider cleanup.

- Migrate examples from `<Plite initialValue>` to initialized editors.
- Remove provider `initialValue` from the public docs/API target before v2
  public release. If migration needs a short-lived adapter, keep it undocumented
  and warn in development.
- Add source guard against manual initial `tx.value.replace` in examples.

Phase 4: issue tests.

- Add `#5488/#5710` whole-document replacement docs/test.
- Add `#4564` selection reset test.
- Add `#3465/#5351` initial value validity/normalization contract.

Phase 5: browser proof.

- Verify code-highlighting and related projection examples in browser.
- Recheck mentions void arrow-key behavior.

## Pass-State Ledger

| Pass                 | Status   | Evidence Added                                                                                                                                  | Delta                                                                                                                         | Open        |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- |
| current-state read   | complete | live code-highlighting, Plite provider, projection store, createEditor                                                                          | identified provider-late initialization bug                                                                                   | none        |
| ecosystem comparison | complete | local Lexical, Tiptap, ProseMirror source                                                                                                       | chose editor/state creation over provider render                                                                              | none        |
| issue mining         | complete | `#5488`, `#5710`, `#4564`, `#3465`, `#5351`                                                                                                     | added issue-solve targets                                                                                                     | none        |
| API bake-off         | complete | in-memory TypeScript proof against live `Plate repo root` package paths                                                                           | rejected `withEditors` / composer arrays, accepted `withEditor`, added `withHistory` typing prerequisite                      | none        |
| closure score        | complete | revised public API target, objection ledger, phases, and scorecard                                                                              | plan reaches `0.93`                                                                                                           | none        |
| Ralph execution      | complete | `createEditor` options, `usePliteEditor`, `withHistory` generic preservation, provider cleanup, example migration, focused tests, browser proof | active plan executed in `Plate repo root`; dynamic import errors surfaced; production `Editor.isEditor` chunk-order crash fixed | user review |

## Scorecard

| Dimension                 | Score | Evidence                                                                                         |
| ------------------------- | ----: | ------------------------------------------------------------------------------------------------ |
| React runtime performance |  0.94 | provider render mutation cut, projection immediate build, construction-time initialization       |
| Plite-close DX            |  0.93 | `initialValue`, `withEditor`, existing `withReact` / `withHistory` composition                   |
| Plate/slate-yjs backbone  |  0.90 | replacement transactions stay explicit; no controlled React value API                            |
| Regression-proof testing  |  0.92 | type tests, initial snapshot tests, replacement selection tests, issue-targeted browser/examples |
| Research evidence         |  0.92 | local Lexical/Tiptap/ProseMirror source read plus live Plite TypeScript bake-off              |
| composability/minimalism  |  0.95 | single hook, singular composition callback, no array/plugin DSL                                  |

Total: `0.93`.

Completion is `done`: the API bake-off proved the hook signature, and Ralph
execution shipped the core, React, example, test, and browser-proof slices.

## Next Owner

Ready for user review. No autonomous next pass remains for this plan.
