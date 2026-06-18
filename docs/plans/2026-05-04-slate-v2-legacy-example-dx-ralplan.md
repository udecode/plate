# Slate v2 Legacy Example DX Ralplan

## Current Verdict

Score: `0.91`, status: `ready-for-user-review`.

Hard take: the legacy examples are drifting into two bad teaching patterns:

- too much lifecycle boilerplate for runtime stores;
- model behavior shoved into React event handlers because the extension/input
  API is not yet pleasant enough.

Do not paper over that by making Slate magically opinionated. Fix the reusable
surfaces that examples are exposing.

This plan updates, but does not replace, the accepted initialization plan:

- [React Editor Initialization And Value Ralplan](/Users/zbeyens/git/plate-2/docs/plans/2026-05-04-slate-v2-react-editor-initialization-value-ralplan.md)

## Intent And Boundaries

Intent:

- Keep raw Slate unopinionated while making examples feel first-class.
- Avoid teaching users to copy boilerplate that only exists because the public
  React helpers are missing one layer.
- Compare the example DX against Lexical, ProseMirror, and Tiptap without
  importing their full mental model.

Outcome:

- A concrete execution plan for six reviewed surfaces:
  editor history setup, checklist backspace behavior, code highlighting
  decorations, TypeScript inference cleanup, annotation store context, and void
  render props.
- No implementation in this pass.

In scope:

- `apps/www/src/app/(app)/examples/slate/_examples/**`
- `packages/slate-react/src/hooks/use-slate-editor.ts`
- `packages/slate-react/src/decoration-source.ts`
- `packages/slate-react/src/hooks/use-slate-annotations.tsx`
- `packages/slate-react/src/components/slate.tsx`
- `packages/slate-react/src/components/editable-text-blocks.tsx`
- `.agents/rules/ralph.mdc` rule update, during execution only

Non-goals:

- Do not make `slate-react` depend on `slate-history`.
- Do not add Plate-like plugins to raw Slate.
- Do not resurrect public extension `commands`; the current hard cut rejects
  that surface.
- Do not claim any issue closure from this plan. This is DX/API cleanup.

Issue-ledger accounting:

- No `Fixes #....` rows are added by this plan.
- Related issue pressure remains the existing decoration/annotation and React
  runtime clusters in
  [Issue Coverage Matrix](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/issue-coverage-matrix.md).
- If execution changes public APIs or example proof status, sync
  [PR Description Reference](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md).

## Live Current State

Editor creation:

- `useSlateEditor` creates `withReact(createEditor(editorOptions))` and only
  runs `withEditor` when provided:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts:23`.
- `CreateEditorOptions` only carries `initialValue` and `initialSelection`:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:616`.
- `slate-react` has `slate-history` only as a dev dependency, not runtime
  dependency:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json`.

History examples:

- Many examples repeat `withEditor: (editor) => withHistory(editor) as
CustomEditor`, for example code highlighting:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx:54`.
- Simple examples can pass `withEditor: withHistory`, for example plain text:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/plaintext.tsx:6`.

Checklist behavior:

- Checklists currently handle Backspace through `Editable onKeyDown`:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx:75`.
- The handler calls model logic and returns `true`, which `Editable` treats as
  handled and prevents default:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:74`.
- The model behavior itself is currently helper-based, not extension-owned:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx:97`.

Code highlighting:

- The example creates a decoration source with `useMemo` and manually destroys
  it in `useEffect`:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx:60`.
- The public low-level factory is `createDecorationSource(editor, options)`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/decoration-source.ts:111`.
- `code-highlighting.tsx` imports `type Node as SlateNode` only to annotate
  `match` callbacks:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx:25`.

Annotations:

- `Slate` currently accepts `annotationStores` and composes their projection
  stores:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:62`.
- `useSlateAnnotations` still requires the store argument:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx:68`.
- `collaborative-comments.tsx` passes the same store to `<Slate>` and then
  manually down to `CommentList`:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/collaborative-comments.tsx:540`.

Void renderer props:

- `renderVoid` receives `target`, but that value is literally a `Path`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:456`.
- The exported prop type is `target: Path`:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:496`.
- Examples then type the prop as `target: Path` and use it as `at`:
  `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:119`.

## Ecosystem Evidence

Lexical:

- Core `createEditor` does not include history by default; vanilla examples
  register history explicitly with `registerHistory`:
  `/Users/zbeyens/git/lexical/examples/vanilla-js-iframe/src/main.ts:38`.
- React rich text adds `<HistoryPlugin />` as a plugin:
  `/Users/zbeyens/git/lexical/examples/react-rich/src/App.tsx:159`.
- The newer extension path includes `HistoryExtension` explicitly in
  dependencies:
  `/Users/zbeyens/git/lexical/examples/extension-vanilla-tailwind/src/main.ts:83`.
- Checklist and tab behavior are registered as editor commands, not random app
  `onKeyDown` branches:
  `/Users/zbeyens/git/lexical/packages/lexical-list/src/checkList.ts:68` and
  `/Users/zbeyens/git/lexical/packages/lexical-extension/src/TabIndentationExtension.ts:83`.

ProseMirror:

- History is a plugin with transaction metadata, grouping, and collaboration
  rebase behavior. It is not core editor default:
  `/Users/zbeyens/git/prosemirror/history/src/history.ts:258`.

Tiptap:

- StarterKit includes undo/redo by default and lets users disable it with
  `undoRedo: false`:
  `/Users/zbeyens/git/tiptap/packages/starter-kit/src/starter-kit.ts:95` and
  `/Users/zbeyens/git/tiptap/packages/starter-kit/src/starter-kit.ts:218`.
- The lower-level extension registers ProseMirror history and keyboard
  shortcuts explicitly:
  `/Users/zbeyens/git/tiptap/packages/extensions/src/undo-redo/undo-redo.ts:46`.
- Keyboard behavior lives on extensions through `addKeyboardShortcuts`, which
  the extension manager turns into keymap plugins:
  `/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts:110`.

Conclusion:

- Copy the explicit-history/preset split.
- Copy the extension-owned keyboard behavior.
- Do not make raw Slate silently include history.

## Decision Brief

Principles:

- Raw Slate is unopinionated. Examples can be friendly; the core hook cannot
  lie about installed behavior.
- Runtime stores should have React lifecycle helpers when examples must create
  them before `<Slate>`.
- If a public prop is a `Path`, call it `path`. If the runtime wants a stable
  target, make it a real target object.
- TypeScript examples should teach inference, not cargo-cult aliases and casts.

### 1. History Default

Decision: do not put history in `useSlateEditor` by default.

Why:

- `slate-react` does not own `slate-history` at runtime.
- Lexical and ProseMirror keep history opt-in.
- Tiptap only defaults history inside an opinionated starter kit, not in the
  core editor.
- Collaboration often needs custom history. A hidden default would create
  accidental double-history and migration pain.

Target:

```tsx
const editor = useSlateEditor({
  initialValue,
  withEditor: withHistory,
});
```

For custom behavior:

```tsx
const editor = useSlateEditor({
  initialValue,
  withEditor: (editor) => withImages(withHistory(editor)),
});
```

Execution requirement:

- Fix `withHistory` generic preservation enough that common examples stop
  needing `as CustomEditor`.
- If the repo later creates a `slate-starter` package or example-only helper,
  that preset may include history by default and expose an explicit disable
  switch. Keep that out of raw `useSlateEditor`.

Rejected:

```tsx
const editor = useSlateEditor({ initialValue }); // hidden history
```

That is convenient but wrong for Slate.

### 2. Checklist Backspace

Decision: the current `onKeyDown` move is mechanically safe but not the best DX.

Why it happened:

- v2 `Editable` owns keydown classification, composition, shell/virtualization
  repair, and default prevention. Returning `true` from a user keydown handler
  plugs into that runtime path.

Why it is not good enough:

- Checklist Backspace is model behavior, not a component event concern.
- App authors should not have to remember to wire `onKeyDown` every time they
  use checklists.
- Lexical and Tiptap put this kind of behavior in commands/extensions.

Target:

- Keep the current helper as a local safety bridge.
- Add an extension-owned keyboard/input capability for model behaviors that
  need key intent access.
- Implement checklist backspace through that capability or a typed
  `withChecklists` composer, not through per-example `Editable onKeyDown`.

Do not resurrect public extension `commands`. The v2 extension hard cut
explicitly rejects public `commands` slots. Use capabilities or runtime input
handlers.

### 3. Code Highlighting And Decoration Source Lifecycle

Decision: add a React lifecycle hook for decoration sources.

Current code is too much:

```tsx
const codeHighlightingSource = useMemo(
  () => createDecorationSource(editor, options),
  [editor],
);

useEffect(
  () => () => codeHighlightingSource.destroy(),
  [codeHighlightingSource],
);
```

Target:

```tsx
const codeHighlightingSource = useSlateDecorationSource(editor, {
  id: "code-highlighting",
  dirtiness: ["text", "node"],
  read: ({ snapshot }) => collectCodeProjections(snapshot.children),
  runtimeScope: ({ snapshot }) => collectCodeRuntimeScope(snapshot),
});
```

Rules:

- Keep `createDecorationSource` as the low-level API.
- Add `useSlateDecorationSource` in `slate-react` for the common React lifecycle.
- Do not hide `dirtiness` or `runtimeScope`; they are the performance contract.
- Reduce `code-highlighting.tsx` by extracting code-block editor behavior and
  projection source setup into named helpers.

### 4. TypeScript Inference In Examples

Decision: clean examples aggressively.

Current worst offender:

```tsx
match: (n: SlateNode) => Node.isElement(n) && n.type === ParagraphType;
```

Target:

```tsx
match: (node) => Node.isElement(node) && node.type === ParagraphType;
```

Execution:

- Remove useless `type Node as SlateNode` imports.
- Remove inline callback parameter types where the prop or API already infers
  them.
- Keep real exported component prop types where inference has no owner.
- Remove avoidable `as CustomEditor`, `as any`, and alias casts after composer
  typing is fixed. If a cast remains, it needs a local reason.
- Add this rule to `.agents/rules/ralph.mdc`, then run `pnpm install` because
  rules are source of truth.

Rule text to encode:

```txt
For TypeScript examples, prefer inference. Do not annotate callback parameters,
alias broad node types, or use `as any` / public type casts unless the compiler
cannot infer the public API shape. Prefer type guards, `satisfies`, and fixed
generic surfaces over local assertions.
```

### 5. Annotation Store Context

Decision: yes, the store should be consumable from Slate context, and the
public provider prop should be singular: `annotationStore`.

Current shape passes `annotationStores` into `<Slate>`, but that is worse DX.
One `SlateAnnotationStore` already stores many annotations through `allIds` and
`byId`; channel/source distinctions should live in annotation data/projection,
not in a plural provider prop.

Target:

```tsx
<Slate annotationStore={annotationStore} editor={editor}>
  <CommentList />
</Slate>
```

```tsx
const snapshot = useSlateAnnotations();
```

API shape:

- `useSlateAnnotations()` uses the nearest annotation store.
- `useSlateAnnotations(store)` remains valid for external sidebars,
  cross-editor inspectors, and explicit non-context reads.
- If no store exists, return the empty snapshot or throw in development based
  on the current hook philosophy.
- If a product really needs separate stores with independent lifecycles, expose
  an explicit composition helper or require the app to build one aggregate
  store. Do not make the common provider prop plural.

Do not put annotation stores on the core editor. They are React/projection
runtime state, not document model state.

### 6. `renderVoid` Prop Name

Decision: rename public `renderVoid` prop from `target` to `path`, unless the
value becomes a real target object first.

Current API says:

```ts
target: Path;
```

That is vague. If the value is a `Path`, the prop should be:

```ts
path: Path;
```

Future option, only if useful:

```ts
target: {
  path: Path;
  runtimeId: RuntimeId;
}
```

Do not keep `target: Path` as the stable v2 public API. It is worse for agents
and humans because it sounds abstract while being less informative than
`path`.

## Execution Plan

### Phase 1: History And Composer Typing

- Keep `useSlateEditor` history-free by default.
- Re-check `withHistory` and `withReact` generics.
- Remove casts from simple examples where generic preservation makes them
  unnecessary.
- Add type tests for `withHistory` preserving `ValueOf<T>` and editor
  intersections.

Acceptance:

- Examples can use `withEditor: withHistory` when no custom composer is needed.
- Custom composers do not require casts unless the custom editor type itself is
  intentionally broader than the runtime extension.

### Phase 2: Checklist Behavior Ownership

- Keep current `onKeyDown` as baseline proof.
- Design a minimal extension keyboard/input capability that works with the v2
  input runtime and composition guards.
- Move checklist Backspace into `withChecklists` or a checklist extension.
- Add focused tests around Backspace at start of a checklist item.

Acceptance:

- The checklist example does not manually wire checklist Backspace in
  `Editable`.
- IME/composition keydown behavior stays green.

### Phase 3: Decoration Hook

- Add `useSlateDecorationSource`.
- Migrate code highlighting, search highlighting, external decoration sources,
  markdown preview, and highlighted text where the hook simplifies lifecycle.
- Keep low-level `createDecorationSource` exported.

Acceptance:

- No example manually pairs `createDecorationSource` with cleanup `useEffect`
  unless it is demonstrating the low-level API.
- Decoration store metrics and runtime-scope behavior stay unchanged.

### Phase 4: Annotation Context Hooks

- Rename the public provider prop from `annotationStores` to
  `annotationStore`.
- Add annotation store context value derived from `<Slate annotationStore>`.
- Make `useSlateAnnotations(store?)` and `useSlateAnnotation(id, store?)`
  support context defaults.
- Migrate collaborative comments, review comments, and persistent annotation
  anchors where it removes prop threading.

Acceptance:

- `collaborative-comments.tsx` does not pass the same store through `<Slate>`
  and component props just to list annotations.
- One store can hold multiple annotation channels.

### Phase 5: Void Prop Rename

- Rename `RenderVoidProps<T>['target']` to `path`.
- Update examples and hooks that consume it.
- Decide whether to keep a temporary internal alias only if tests or examples
  need a migration bridge before public v2 freeze.

Acceptance:

- Public examples use `path`, not `target`, when passing `at` to transforms or
  `useElementSelected`.
- If a future stable object is introduced, it is named and typed as a real
  target, not a path alias.

### Phase 6: Example Type Cleanup And Rule Sync

- Remove useless callback parameter annotations and alias imports from all
  examples.
- Remove avoidable casts after the API fixes above.
- Update `.agents/rules/ralph.mdc` with the TypeScript inference rule.
- Run `pnpm install` to sync generated skills/rules.

Acceptance:

- `rg -n "match: \\(n: SlateNode\\)|type Node as SlateNode| as any| as CustomEditor" apps/www/src/app/(app)/examples/slate/_examples`
  only returns justified leftovers.
- `.agents/rules/ralph.mdc` includes the inference rule.

## Regression Proof

Required focused proof after implementation:

- `bun --filter slate-react typecheck`
- `bun --filter slate-history typecheck`
- focused Slate React tests for decoration source lifecycle
- focused annotation store hook tests
- focused checklist Backspace test
- focused examples typecheck or example-app typecheck
- browser smoke on:
  - `/examples/check-lists`
  - `/examples/code-highlighting`
  - `/examples/collaborative-comments`
  - `/examples/images`
  - `/examples/embeds`
  - `/examples/mentions`

Do not run full browser integration unless one of these focused rows points at
runtime selection/input risk.

## Maintainer Objections

### "History should just be default. Everyone wants undo."

No. Everyone wants undo until collaboration, read-only, history-forking, or
custom batching arrives. Lexical, ProseMirror, and Tiptap all keep the raw
engine separate from the history plugin/extension. Slate should too.

### "But examples are noisier without default history."

Correct. Fix the composer typing and example helper story, not the package
boundary.

### "Checklist behavior in `onKeyDown` is simpler."

It is simpler for one file and worse as the example people copy. Model behavior
belongs to editor extension behavior, with React event hooks as escape hatches.

### "Decoration hooks hide performance."

Only if they hide `dirtiness` and `runtimeScope`. The hook should hide
lifecycle cleanup, not the invalidation contract.

### "Annotation stores are external; hooks should take the store explicitly."

Explicit store arguments should remain. The default should use the nearest
Slate context because `<Slate annotationStore>` is the editor-local projection
channel.

### "What if I have comments, suggestions, and review marks?"

Put them in one `SlateAnnotationStore` with a `kind`, `channel`, or `source`
field. A store is already a collection. If independent lifecycles are truly
needed, compose them before passing to `<Slate>`.

### "`target` sounds future-proof."

Not while typed as `Path`. Future-proofing with a misleading name is fake
design. Either call it `path` or make it a real target object.

## Applied Skill Notes

- `slate-ralplan`: applied. This is a planning/review pass with live source
  grounding.
- `intent-boundary-pass`: applied. Intent, in-scope, non-goals, and issue
  boundaries are explicit.
- `steelman-pass`: applied. Maintainer objections recorded.
- `high-risk-deliberate-pass`: applied. Public API and runtime behavior
  changes are gated by proof.
- `performance` / `performance-oracle`: applied. Decoration invalidation and
  runtime store lifecycle keep `dirtiness` and `runtimeScope` visible.
- `react-useeffect`: applied. The plan removes repeated userland
  `useMemo`/`useEffect` cleanup ceremony behind a hook.
- `tdd`: applied as proof requirements, not implementation.

## Score

| Dimension                                 | Score | Evidence                                                                                                              |
| ----------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance            |  0.90 | Decoration hook keeps runtime-scope contract; annotation context avoids prop threading without adding per-node state. |
| Slate-close unopinionated DX              |  0.94 | History remains explicit; `withEditor` remains current accepted shape.                                                |
| Plate and slate-yjs migration backbone    |  0.88 | No hidden history; annotation stores remain external, collaboration-compatible.                                       |
| Regression-proof testing strategy         |  0.90 | Focused tests and browser examples listed by affected behavior.                                                       |
| Research evidence completeness            |  0.92 | Local Lexical, ProseMirror, Tiptap, and live Slate source cited.                                                      |
| shadcn-style composability and minimalism |  0.92 | Hook hides lifecycle, props become literal, examples reduce casts.                                                    |

Weighted score: `0.91`.

## Ready State

This plan is ready for a later `ralph` execution pass.

Do not start by implementing all phases at once. First execution should take
Phase 1 plus one narrow example cleanup so type evidence is real before
touching the rest.

## Execution Log

### 2026-05-04 Phase 1

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx`

Result:

- `useSlateEditor({ withEditor: withHistory })` remains history-free by
  default and still preserves the `ReactEditor & HistoryEditor` intersection.
- The type contract now covers the example-shaped custom editor case where
  decoration sidecar state is optional.
- The checklist example uses direct `withEditor: withHistory` with no
  `as CustomEditor` cast.

Evidence:

- `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`
- `bunx tsc --project packages/slate-history/test/tsconfig.generic-types.json --noEmit`
- `bun --filter slate-react typecheck`
- `bun --filter slate-history typecheck`
- `bun typecheck:site`
- `bun lint:fix`

Next:

- Phase 2: move checklist Backspace ownership out of the example-level
  `Editable onKeyDown` wiring and into a cleaner editor behavior surface.

### 2026-05-04 Phase 2

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/internal/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-editor-api.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editable-input-rules.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

Result:

- Added `editableInputRules(...)` as the Slate React helper for registering
  `Editable` input behavior from editor extension capabilities.
- `Editable` combines explicit prop `inputRules` with editor extension input
  rules.
- The checklist example now installs a `checklists` extension and no longer
  wires checklist Backspace through example-level `Editable onKeyDown`.
- The PR description reference documents the new React Editable extension input
  rule surface.

Evidence:

- `bun test ./packages/slate-react/test/editable-behavior.tsx`
- `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun --filter slate-history typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `dev-browser` smoke on `http://localhost:3100/examples/check-lists`: Backspace
  at the start of "Slide to the left." changed checkbox count from 6 to 5 and
  kept the text visible.

Next:

- Phase 3: add `useSlateDecorationSource` and migrate decoration examples away
  from manual `useMemo`/`useEffect` lifecycle glue.

### 2026-05-04 Phase 3

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/app-owned-customization.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-preview.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/external-decoration-sources.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

Result:

- Added `useSlateDecorationSource(editor, options)` for React-owned decoration
  source lifecycle.
- Migrated decoration examples away from manual `createDecorationSource` plus
  cleanup `useEffect` glue.
- Kept `createDecorationSource` as the low-level API.
- Kept `dirtiness` and `runtimeScope` visible at call sites.

Evidence:

- `bun test ./packages/slate-react/test/app-owned-customization.tsx`
- `bun test ./packages/slate-react/test/editable-behavior.tsx`
- `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `dev-browser` smoke on `code-highlighting`, `markdown-preview`,
  `highlighted-text`, `external-decoration-sources`,
  `rendering-strategy-runtime`, and `search-highlighting`; search query
  `search` produced 3 highlighted segments.

Next:

- Phase 4: rename/contextualize annotation store consumption with singular
  `annotationStore` and context-default hooks.

### 2026-05-04 Phase 4

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/collaborative-comments.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/review-comments.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/annotations.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md`
- `/Users/zbeyens/git/slate-v2/docs/general/docs-proof-map.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

Result:

- Renamed `<Slate annotationStores={[store]}>` to singular
  `<Slate annotationStore={store}>`.
- Added Slate annotation store context and context-default
  `useSlateAnnotations()` / `useSlateAnnotation(id)`.
- Kept explicit store arguments for out-of-tree and cross-editor annotation
  reads.
- Removed duplicate store prop threading in collaborative comments and
  annotation-sidebar examples where the provider already owns the store.
- Synced public docs and the PR reference with the current API.

Evidence:

- `bun test ./packages/slate-react/test/annotation-store-contract.tsx`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `rg "annotationStores" packages site/examples scripts docs/libraries docs/general -n`
  returns no source/doc hits.
- `dev-browser` cold-load smoke on `/examples/collaborative-comments`,
  `/examples/review-comments`, and `/examples/persistent-annotation-anchors`.
- `dev-browser` interaction smoke:
  `/examples/review-comments` seeded a comment card,
  `/examples/persistent-annotation-anchors` rendered
  `comment-anchor:Comment anchor:0:1|0:4`, and
  `/examples/collaborative-comments` enabled Add comment after real text
  selection and incremented comment writes to `1`.

Next:

- Phase 5: rename `renderVoid` `target` to `path` and update examples.

### 2026-05-04 Phase 5

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/embeds.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/paste-html.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

Result:

- `renderVoid` now receives `{ element, path }`, not `{ element, target }`.
- `RenderVoidProps['path']` is the only public path field; no `target` alias is
  kept.
- `useElementSelected(path?)` names its optional `Path` parameter literally.
- Void examples pass `path` through to transforms and selected-state hooks.

Evidence:

- `bun test ./packages/slate-react/test/surface-contract.tsx`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `rg "props\\.target|renderVoid = \\(\\{ element, target|RenderVoidProps.*target|renderVoidProps\\?\\.target|target\\}: RenderVoidProps|target: Path" packages/slate-react site/examples/ts docs/libraries/slate-react -n`
  returns no hits.
- `dev-browser` smoke on `/examples/images`, `/examples/embeds`,
  `/examples/paste-html`, and `/examples/mentions`.

Next:

- Phase 6: clean remaining example TypeScript assertions and sync
  `.agents/rules/ralph.mdc`.

### 2026-05-04 Phase 6

Status: complete.

Changed:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/hovering-toolbar.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/editable-voids.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/iframe.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/tables.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/embeds.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/paste-html.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`
- `/Users/zbeyens/git/slate-v2/.changeset/slate-react-example-dx-cleanup.md`
- `/Users/zbeyens/git/plate-2/.agents/rules/ralph.mdc`
- `/Users/zbeyens/git/plate-2/.agents/skills/ralph/SKILL.md`

Result:

- Removed the remaining forbidden example patterns from the plan:
  `type Node as SlateNode`, `match: (n: SlateNode)`, `as any`, and
  `as CustomEditor`.
- Replaced the huge-document content-visibility cast with a narrow parser.
- Added the TypeScript inference rule to `ralph.mdc` and synced generated
  skills with `pnpm install`.
- Added a `slate-react` changeset for the public annotation/void API cleanup.

Evidence:

- `rg -n "match: \\(n: SlateNode\\)|type Node as SlateNode| as any| as CustomEditor" site/examples/ts`
  returns no hits.
- `bun test ./packages/slate-react/test/editable-behavior.tsx`
- `bun test ./packages/slate-react/test/app-owned-customization.tsx`
- `bun test ./packages/slate-react/test/annotation-store-contract.tsx`
- `bun test ./packages/slate-react/test/surface-contract.tsx`
- `bun --filter slate-react typecheck`
- `bun --filter slate-history typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `pnpm install`
- `dev-browser` cold-load smoke on `forced-layout`, `images`,
  `hovering-toolbar`, `editable-voids`, `iframe`, `tables`,
  `markdown-shortcuts`, `inlines`, `richtext`, `embeds`, `paste-html`,
  `mentions`, `code-highlighting`, and `huge-document`.

Next:

- Lane complete. Completion state can be set to `done`.
