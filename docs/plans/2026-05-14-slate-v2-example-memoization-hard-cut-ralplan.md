# Slate v2 example memoization hard-cut ralplan

Date: 2026-05-14
Status: done
Score: 0.92
Owner: Slate Ralplan planning only
Execution owner: ralph in `.tmp/slate-v2`

## Verdict

The keydown plan was too narrow.

Correction: the first version of this plan was wrongly marked ready. It had a
good current-state inventory, but it had not completed the Slate Ralplan pass
schedule. The pass ledger below is now closed and the Done Handoff is ready for
user review.

There are three real library-level memoization leaks:

1. Rendering docs still teach `useCallback` for `renderElement`, `renderLeaf`,
   `renderText`, and `renderSegment`.
2. Editing behavior examples still use callback props and memoized rule arrays
   because Slate React lacks complete command/key/paste/rule ownership.
3. Option-object APIs still make examples memoize objects to avoid identity
   churn. Projection-store examples are a lower-priority smell, not a release
   blocker.

Do not turn this into "delete every `useCallback`". That would be stupid.
Internal runtime callbacks, subscriptions, UI demo handlers, and overlay state
can keep memoization when identity is a real implementation detail.

## Scope

Inventory source:

- `.tmp/slate-v2/site/examples/ts`
- `.tmp/slate-v2/docs`
- `.tmp/slate-v2/packages/slate-react/test/input-router-contract.test.tsx`

Implementation edits are out of scope for this pass.

## Hard Cuts And Conditional Cleanups

### 1. Render props should not teach `useCallback`

Current examples/docs:

- `docs/concepts/09-rendering.md`
- `docs/walkthroughs/03-defining-custom-elements.md`
- `docs/walkthroughs/04-applying-custom-formatting.md`
- `docs/walkthroughs/05-executing-commands.md`
- `docs/walkthroughs/09-performance.md`

Current problem:

- docs say render functions should be top-level or `useCallback`
- `Editable` passes render props through memoized block/text components
- `EditableTextBlock` compares renderer prop identity, so inline renderers can
  rerender too much
- the docs therefore teach React ceremony as normal Slate onboarding

Target:

- keep `renderElement`, `renderLeaf`, `renderText`, and `renderSegment` as raw
  escape-hatch props
- add a Slate React renderer capability consumed by `Editable`
- teach component/renderer registration as the default path

Candidate shape:

```ts
editor.extend(
  editableRenderers({
    elements: {
      code: CodeElement,
      paragraph: ParagraphElement,
    },
    leaves: {
      bold: BoldLeaf,
    },
  }),
);
```

This belongs in `slate-react`, not core `slate`. Core `EditorElementSpec`
should stay non-React.

Docs target:

- no `useCallback` in beginner render docs
- performance docs say stable top-level components/spec registration first
- raw render props stay advanced/custom

### 2. Editing behavior should move to command/rule capabilities

Current examples:

- `site/examples/ts/tables.tsx`
- `site/examples/ts/code-highlighting.tsx`
- `site/examples/ts/markdown-shortcuts.tsx`
- `site/examples/ts/inlines.tsx`
- `site/examples/ts/iframe.tsx`
- `site/examples/ts/richtext.tsx`
- `site/examples/ts/images.tsx`

Current problem:

- `tables.tsx` uses `useCallback<EditableKeyDownHandler>`
- `code-highlighting.tsx` uses `useCallback` for keydown behavior
- `markdown-shortcuts.tsx` uses `useMemo` for `inputRules`,
  `useCallback` for Android `onDOMBeforeInput`, and `useCallback` for
  Enter/Backspace
- `inlines.tsx` uses `useMemo` for `inputRules`, plus raw keydown/paste
  handlers
- `iframe.tsx` and `richtext.tsx` still teach raw hotkey parsing
- `images.tsx` still teaches raw select-all key parsing

Target:

- make `onCommand` keydown-complete, not `format`-only
- add key-command capability for custom hotkeys
- keep `editableInputRules(...)` as extension capability, not example-local
  memoized arrays
- add command-aware rules for Enter/Backspace/Delete
- route paste customization through `insert-data` or paste rules
- move Android pending diff flushing into the runtime

This supersedes the narrower keydown-only plan:
`docs/plans/2026-05-14-slate-v2-keydown-command-coverage-ralplan.md`.

### 3. Rendering strategy option objects should be value-normalized

Current example:

- `site/examples/ts/rendering-strategy-runtime.tsx`

Current problem:

- the example memoizes a `renderingStrategy` object before passing it to
  `Editable`
- `EditableTextBlocks` already normalizes strategy internals, but some memo
  dependencies still preserve option object identity

Target:

- `Editable`/`EditableTextBlocks` should normalize rendering strategy options
  by primitive fields
- examples should be able to inline:

```tsx
<Editable
  renderingStrategy={{
    estimatedBlockSize,
    overscan,
    threshold: 1,
    type: "virtualized",
  }}
/>
```

No user memo required.

### 4. Annotation/widget projection hooks are optional

Current examples:

- `site/examples/ts/review-comments.tsx`
- `site/examples/ts/collaborative-comments.tsx`
- `site/examples/ts/persistent-annotation-anchors.tsx`

Current problem:

- examples memoize annotation and widget arrays before passing them into
  `useSlateAnnotationStore` and `useSlateWidgetStore`
- the hooks already keep latest cells internally, but array identity still
  drives refresh effects

Conditional target:

- add projector-friendly overloads to Slate React projection hooks, not a
  comment-specific API
- keep app-specific mapping in user code, but move memoization mechanics into
  the hook
- do not make this a release blocker; land it only if the overload is tiny,
  generic, metadata-safe, and clearer than a shared example helper

Candidate shape:

```ts
const annotationStore = useSlateAnnotationStore(editor, {
  deps: [comments],
  project: () => comments.map(toAnnotation),
});

const widgetStore = useSlateWidgetStore(editor, {
  annotationStore,
  deps: [comments],
  project: () => comments.map(toWidget),
});
```

This is lower priority than renderer, command/rule routing, and rendering
strategy normalization. It is a real smell, but not strong enough to block the
execution handoff.

### 5. One-shot initial value docs should not use `useMemo`

Current docs:

- `docs/walkthroughs/06-saving-to-a-database.md`

Current problem:

- docs use `useMemo(..., [])` to read localStorage-backed initial content
- this is the wrong React teaching shape for one-shot initialization

Target:

- use plain lazy `useState` in docs unless a tiny, already-safe core overload
  falls out of implementation
- do not teach `useMemo` as constructor storage

Do not add core lazy `initialValue` just to clean one walkthrough. If
`CreateEditorOptions` stays value-only, the docs use lazy `useState`.

## Weak Cuts / Do Not Push Into Slate React

| Site                                                       | Current memo                                     | Verdict                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `site/examples/ts/embeds.tsx`                              | `safeUrl` from URL parsing                       | Do not put URL sanitization in Slate core. Use a plain helper or shared example utility. |
| `site/examples/ts/paste-html.tsx`                          | `safeHref` from URL parsing                      | Same.                                                                                    |
| `site/examples/ts/inlines.tsx`                             | link `safeUrl` from URL parsing                  | Same.                                                                                    |
| `site/examples/ts/iframe.tsx`                              | `handleBlur = useCallback(...)`                  | Remove or inline; no library API needed.                                                 |
| `site/examples/ts/mentions.tsx`                            | popup `onKeyDown = useCallback(...)`             | UI overlay state. Keep as app-owned or move to a future combobox plugin, not raw Slate.  |
| `site/examples/ts/dom-coverage-boundaries.tsx`             | demo button callbacks and hidden-boundary object | Debug/demo UI state. Not library-owned.                                                  |
| `site/examples/ts/huge-document.tsx`                       | config setter and context value                  | Benchmark/demo UI. Not a Slate editing API leak.                                         |
| `site/examples/ts/rendering-strategy-runtime.tsx`          | `editableStyle` object                           | Plain React style object. Not Slate-owned.                                               |
| `packages/slate-react/test/input-router-contract.test.tsx` | test-local `useMemo` for editor/lifecycle        | Test harness. Can be cleaned later, but not a public DX/API problem.                     |

## Full Inventory

| File                                                       | Hook site                                            | Classification  | Action                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------- | --------------- | ---------------------------------------------------------------------- |
| `site/examples/ts/code-highlighting.tsx`                   | `useCallback` keydown                                | strong cut      | key-command and command rules                                          |
| `site/examples/ts/tables.tsx`                              | `useCallback<EditableKeyDownHandler>`                | strong cut      | keydown-complete `onCommand`                                           |
| `site/examples/ts/markdown-shortcuts.tsx`                  | `useMemo` `inputRules`                               | strong cut      | extension capability / command-aware rules                             |
| `site/examples/ts/markdown-shortcuts.tsx`                  | `useCallback` Android `onDOMBeforeInput`             | strong cut      | runtime owns Android pending diff flush                                |
| `site/examples/ts/markdown-shortcuts.tsx`                  | `useCallback` Enter/Backspace                        | strong cut      | command-aware rules                                                    |
| `site/examples/ts/inlines.tsx`                             | `useMemo` `inputRules`                               | strong cut      | extension capability / paste rules                                     |
| `site/examples/ts/inlines.tsx`                             | `useMemo` link `safeUrl`                             | weak cut        | shared helper, not lib                                                 |
| `site/examples/ts/rendering-strategy-runtime.tsx`          | `useMemo` `renderingStrategy`                        | strong cut      | value-normalize options internally                                     |
| `site/examples/ts/rendering-strategy-runtime.tsx`          | `useMemo` `editableStyle`                            | no lib cut      | plain React style                                                      |
| `site/examples/ts/review-comments.tsx`                     | `useMemo` widgets                                    | optional cut    | projector overload only if tiny/generic; otherwise shared helper/defer |
| `site/examples/ts/review-comments.tsx`                     | `useMemo` annotations                                | optional cut    | projector overload only if tiny/generic; otherwise shared helper/defer |
| `site/examples/ts/collaborative-comments.tsx`              | `useMemo` annotations                                | optional cut    | projector overload only if tiny/generic; otherwise shared helper/defer |
| `site/examples/ts/persistent-annotation-anchors.tsx`       | `useMemo` annotations/widgets                        | optional cut    | projector overload only if tiny/generic; otherwise shared helper/defer |
| `site/examples/ts/embeds.tsx`                              | `useMemo` `safeUrl`                                  | weak cut        | helper, not Slate React                                                |
| `site/examples/ts/paste-html.tsx`                          | `useMemo` `safeHref`                                 | weak cut        | helper, not Slate React                                                |
| `site/examples/ts/iframe.tsx`                              | `useCallback` blur                                   | no lib cut      | inline/remove callback                                                 |
| `site/examples/ts/mentions.tsx`                            | `useCallback` popup keydown                          | no lib cut      | UI overlay state                                                       |
| `site/examples/ts/dom-coverage-boundaries.tsx`             | five `useCallback`s and one `useMemo`                | no lib cut      | debug UI state                                                         |
| `site/examples/ts/huge-document.tsx`                       | `useCallback` config setter, `useMemo` render config | no lib cut      | benchmark UI state                                                     |
| docs rendering walkthroughs/concept docs                   | `useCallback` render props                           | strong cut      | renderer capability and docs rewrite                                   |
| docs saving walkthrough                                    | `useMemo` one-shot initial value                     | strong docs cut | lazy `useState` docs; core API only if tiny and safe                   |
| `packages/slate-react/test/input-router-contract.test.tsx` | `useMemo` editor/lifecycle                           | no public cut   | optional test cleanup only                                             |

## Execution Order

1. Renderer capability and docs rewrite.
2. Command/key/input/paste behavior cuts.
3. Rendering strategy option normalization.
4. Optional projection overload only if it stays tiny and generic.
5. Docs-first lazy initialization cleanup.
6. Opportunistic safe URL/helper cleanup and trivial callback simplification.

Do not start with safe URL cleanup. It is the easiest work and the least
important architecture issue.

## Current-State Read And Initial Score

This pass re-grounded the plan in current Slate v2 source and docs:

- `.tmp/slate-v2/site/examples/ts`: searched for all `useCallback` and `useMemo`
  examples.
- `.tmp/slate-v2/docs`: searched for all docs that teach `useCallback` or
  `useMemo`.
- `.tmp/slate-v2/packages/slate-react/test/input-router-contract.test.tsx`: read
  test-only memoization.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts`: read
  current editor construction API.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
  and `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-widget-store.tsx`:
  read projection-store identity behavior.
- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`: read current
  non-React `EditorElementSpec`.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`:
  read renderer and rendering-strategy prop identity pressure.

Initial score is intentionally below the completion threshold:

| Dimension                              | Score | Evidence                                                                             | Gap                                                        |
| -------------------------------------- | ----: | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| React 19.2 runtime performance         |  0.68 | live `EditableTextBlocks`, projection hooks, and rendering-strategy reads            | no performance pass or stress proof yet                    |
| Slate-close unopinionated DX           |  0.72 | inventory separates raw escape hatches from first-class command/render/rule surfaces | no decision brief or objection ledger yet                  |
| Plate and slate-yjs migration backbone |  0.35 | raw Slate/Slate React ownership boundary stated                                      | Plate/slate-yjs pass not run                               |
| Regression-proof testing strategy      |  0.40 | verification families named                                                          | no issue-ledger pass or concrete red/green test matrix yet |
| Research evidence completeness         |  0.45 | prior editor-candidate research known; current pass did not synthesize systems       | ecosystem strategy table not written                       |
| shadcn-style composability/minimalism  |  0.65 | renderer, command, projection, and option-object surfaces identified                 | component/API alternatives not compared yet                |

Weighted score: `0.55`.

Completion threshold remains `>= 0.92` with no dimension below `0.85`.

## Slate Ralplan Pass-State Ledger

| Pass                                                                            | Status   | Evidence added                                                                                                                                                                                  | Plan delta                                                                                                                                                                 | Open issues                                                                      | Next owner                             |
| ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| 1. Current-state read and initial score                                         | complete | live source/docs/test inventory listed above                                                                                                                                                    | score lowered from `0.93` to `0.55`; status changed to `pending`                                                                                                           | none for this pass                                                               | related issue discovery                |
| 2. Related issue discovery                                                      | complete | cached live/manual/coverage/PR ledgers searched for callback, memoization, render, command, keydown, paste, projection, annotation, widget, examples, and performance rows                      | ClawSweeper applied in ledger-cache discovery mode; no broad live GitHub search needed                                                                                     | candidate set needs exact claim matrix in pass 3                                 | issue-ledger pass                      |
| 3. Issue-ledger pass                                                            | complete | exact candidate issue matrix added; fixed/improved claims kept unchanged                                                                                                                        | score raised from `0.58` to `0.62`; no sync/coverage/PR claim rows changed because no implementation proof changed                                                         | no issue can be promoted from this planning pass alone                           | intent/boundary and decision brief     |
| 4. Intent/boundary and decision brief                                           | complete | live source refresh plus intent, outcome, scope, non-goals, boundary map, options, rejected alternatives, and chosen direction                                                                  | score raised from `0.62` to `0.68`; architecture owner is Slate React, not raw Slate core or Plate                                                                         | ecosystem synthesis and proof plan still missing                                 | research/ecosystem/live-source refresh |
| 5. Research/ecosystem/live-source refresh                                       | complete | compiled research plus local Lexical, ProseMirror, Tiptap, Plate, slate-yjs, and React-selector evidence                                                                                        | score raised from `0.68` to `0.75`; renderer and command targets strengthened; input rules stay feature-owned, not example-local arrays                                    | migration and regression proof still need pressure passes                        | pressure-pass bundle                   |
| 6. Performance/DX/unopinionated/migration/regression/simplicity pressure passes | complete | Vercel React, performance, performance-oracle, tdd, and simplicity lenses applied to live Slate v2 source and existing tests                                                                    | score raised from `0.75` to `0.82`; projection overload downgraded to conditional, lazy initial value cut to docs-first unless core support is trivial, proof matrix added | maintainer objections and high-risk deliberate review still missing              | Slate maintainer objection ledger      |
| 7. Slate maintainer objection ledger                                            | complete | maintainer objections added for renderer registration, `onCommand`, rules, raw escape hatches, projection overload, lazy initialization, docs churn, issue claims, migration, and browser proof | score raised from `0.82` to `0.86`; closure blockers narrowed to high-risk deliberate mode, ecosystem maintainer review, revision, and issue sync                          | issue claims, ecosystem answers, and browser/native proof still block closure    | high-risk deliberate mode              |
| 8. High-risk deliberate mode                                                    | complete | live Slate v2 API refresh plus blast-radius, pre-mortem, expanded proof, rollback, and keep/split/drop decisions                                                                                | score raised from `0.86` to `0.88`; projection and core lazy initializer are no longer release blockers; browser/native and ecosystem proof remain required                | ecosystem maintainer review, issue sync, and final closure scoring still missing | ecosystem maintainer pass              |
| 9. Ecosystem maintainer pass                                                    | complete | local Plate, slate-yjs, Slate v2, Lexical, ProseMirror, Tiptap, React, and compiled decision evidence checked                                                                                   | score raised from `0.88` to `0.90`; feature ownership, origin/metadata, durable anchors, and raw escape hatches are now explicit non-negotiables                           | revision pass, issue sync, and final closure scoring still missing               | revision pass                          |
| 10. Revision pass                                                               | complete | coherence/scope review applied to top-level verdict, hard cuts, inventory, outcome, scope, decision brief, and execution order                                                                  | score raised from `0.90` to `0.91`; stale projection and lazy-initializer language revised to match passes 6 through 9                                                     | issue sync and final closure scoring still missing                               | issue sync accounting                  |
| 11. Issue sync accounting                                                       | complete | current generated live rows, manual sync rows, issue coverage matrix, fork dossier, and PR reference checked for all candidate issues                                                           | no ledger or PR changes; planning-only pass still produces zero new fixed/improved claims                                                                                  | none                                                                             | closure score and final gates          |
| 12. Closure score and final gates                                               | complete | final scorecard, completion threshold audit, and Done Handoff added                                                                                                                             | status raised to `done`; score raised from `0.91` to `0.92`; final handoff emitted                                                                                         | none                                                                             | ralph                                  |

Passes 1 through 12 are complete. The plan is ready for user review and later
`ralph` execution.

## Verification Plan

From `.tmp/slate-v2`:

- focused `slate-react` unit tests for renderer capability and key command
  routing
- focused example tests for tables, inlines, markdown shortcuts, code
  highlighting, and rendering strategy runtime; add annotation/widget example
  proof only if the optional projection overload lands
- docs grep proving beginner docs no longer teach `useCallback`/`useMemo` as
  required Slate ceremony
- `bun --filter slate-react typecheck`
- `bun lint:fix`
- `bun --filter slate-react test`
- `bun check`

From `plate-2` after planning/doc artifact edits:

- `pnpm lint:fix`
- `bun run completion-check`

## Related Issue Discovery

Status: complete for discovery. Exact issue accounting is complete in the
Issue-Ledger Pass below.

ClawSweeper mode: applied as a ledger/cache-first discovery pass. No broad live
GitHub issue list/search was run, because the generated live ledger, manual v2
sync ledger, coverage matrix, fork dossier, benchmark map, and test-candidate
maps already expose the touched surfaces.

Read evidence:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/test-candidate-map.md`
- `docs/slate-issues/test-candidate-map/*`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

Candidate issue set for pass 3:

| Issue                       | Surface                                                       | Discovery result                                                                                                                    | Pass 3 likely claim                                                                |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `#5181`                     | stale React callback/editor props                             | Already related in coverage matrix; native input listener proof does not close stale `onChange` / editor replacement.               | `Related`, keep no fixed claim unless the new plan proves exact stale-prop repro.  |
| `#4317`                     | selection/render callback churn                               | Already related in coverage matrix; directly adjacent to render callback identity pressure.                                         | `Related`, possible strengthened row after renderer-capability proof.              |
| `#5961`                     | warning from `onKeyDown` state update while rendering         | Live open row; relevant to moving editing behavior out of raw `onKeyDown` examples.                                                 | `Related` or `Improves` only with a focused React warning proof.                   |
| `#5928`                     | slash command mobile keydown not firing                       | Live open row; relevant to key-command architecture but mobile proof is outside this memoization pass.                              | `Related`, no closure without mobile/browser proof.                                |
| `#5994`                     | mentions example cursor/backspace                             | Live open row; mentions popup keydown stays app/UI-owned in this plan.                                                              | `Not claimed` unless a later combobox/plugin lane is added.                        |
| `#5987`                     | decorate callback changes from async state update moves caret | Live open row; projection/render callback identity pressure, but exact caret repro is separate.                                     | `Related` pending projection/store proof.                                          |
| `#4483`                     | dynamic decoration rerender cost                              | Existing `Improves` row; projection/store APIs are directly adjacent.                                                               | Keep `Improves`; decide whether projector overload strengthens but does not close. |
| `#3382` / `#3352`           | decoration and selection stability                            | Existing `Improves` rows; projection mechanism related.                                                                             | Keep `Improves`, no new closure from memoization cleanup alone.                    |
| `#2051` / `#3656` / `#4141` | rerender breadth                                              | Benchmark/test maps identify rerender breadth lanes. Renderer capability and option normalization are related performance pressure. | `Related`/`Improves` only with rerender benchmark proof.                           |
| `#790`                      | dynamic rendering / large document rendering                  | Benchmark map and architecture refs cover rendering strategy pressure.                                                              | `Related`, no closure; virtualization remains experimental.                        |
| `#2465`                     | render-time marks ergonomics                                  | Render docs/capability surface is adjacent, but issue asks richer mark rendering semantics.                                         | `Related`, no fixed claim.                                                         |
| `#6013` / `#5605` / `#5709` | editor initialization/value/provider                          | Already fixed claims; one-shot initial value docs must not disturb these claims.                                                    | No new claim; ensure docs stay aligned.                                            |
| `#6016`                     | same initialValue object shared by two editors                | Live open row; adjacent to initialization/value ownership, not directly this memoization hard cut.                                  | `Related` or `Not claimed` in pass 3.                                              |
| `#4268` / `#2560`           | paste-html/example behavior                                   | Examples/docs row; paste rule cleanup may touch examples, but no exact repro proof yet.                                             | `Related`/`Not claimed`; do not close from API cleanup.                            |
| `#4569`                     | insertData docs                                               | Already fixed claim; paste-rule docs must not regress return semantics/fallback wording.                                            | No new claim; reference as proof owner.                                            |

No fork dossier, coverage matrix, manual sync ledger, or PR reference rows were
changed in pass 2. Pass 3 completed exact claim classification and found no
claim-ledger update was justified by a planning-only pass.

## Issue-Ledger Pass

Status: complete.

Verdict: this pass changes planning confidence only. It does not add or promote
any fixed issue claim, because the current work is a planning pass and did not
add fresh Slate v2 source, test, browser, benchmark, or docs proof.

Issue accounting:

| Issue   | Existing ledger status                    | Pass 3 classification           | Reason                                                                                                                                                                                                                 | Sync action |
| ------- | ----------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `#5181` | `Related`                                 | unchanged related               | Native input listeners read latest handler props, but the exact stale `onChange` / editor replacement repro is still not closed. Renderer/command cleanup may reduce the same callback pressure, not prove this issue. | none        |
| `#4317` | `Related`                                 | unchanged related               | Render callback selection churn is directly adjacent to the renderer-capability plan, but the exact `onSelect` / `renderLeaf` repro still needs replay.                                                                | none        |
| `#5961` | `Not claimed` / stale-candidate           | unchanged non-claim             | Moving examples away from raw `onKeyDown` is relevant pressure, but an old React warning report needs a current focused repro before it earns architecture weight.                                                     | none        |
| `#5928` | `Not claimed` / stale-candidate           | unchanged non-claim             | Slash-command mobile keydown failure belongs to mobile/input proof, not this memoization hard cut.                                                                                                                     | none        |
| `#5994` | `issue-reviewed`                          | unchanged non-claim             | Mentions popup cursor/backspace behavior is app UI or a future combobox/plugin lane. Raw Slate should not absorb it here.                                                                                              | none        |
| `#5987` | `Improves`                                | unchanged improves              | Projection stores already reduce async decoration/caret pressure. Projector overloads may improve the public shape, but exact async app repro is still not auto-closed.                                                | none        |
| `#4483` | `Improves`                                | unchanged improves              | Dynamic decoration performance is already represented by projection-store and rerender proof. New projector overloads can strengthen DX, not upgrade to `Fixes`.                                                       | none        |
| `#3382` | `Improves`                                | unchanged improves              | Cross-node/runtime-slice projection proof already improves the decoration range family; legacy `Text.decorations` parity is not claimed.                                                                               | none        |
| `#3352` | `Improves`                                | unchanged improves              | Cross-node projection is covered as v2 projection behavior, but the legacy decorator callback API is not the target.                                                                                                   | none        |
| `#2051` | `Improves`                                | unchanged improves              | Leaf rerender pressure is already represented by v2 render/runtime performance gates. Renderer capability needs fresh benchmark proof before stronger language.                                                        | none        |
| `#3656` | `Improves`                                | unchanged improves              | Existing breadth benchmark covers sibling leaf and parent block locality. This plan may preserve that target, not change the claim.                                                                                    | none        |
| `#4141` | `Improves`                                | unchanged improves              | Existing deep rerender breadth benchmark covers ancestor and sibling branch locality. Renderer/API cleanup does not change current proof.                                                                              | none        |
| `#790`  | `cluster-synced`                          | unchanged related/perf pressure | Rendering strategy normalization is adjacent to large-document strategy pressure, but virtualization remains experimental and needs benchmark/browser tradeoff proof.                                                  | none        |
| `#2465` | matrix-only non-claim                     | unchanged non-claim             | Render-time marks ergonomics is adjacent to renderer capability, but the issue asks for richer mark rendering semantics.                                                                                               | none        |
| `#6013` | `Fixes`                                   | unchanged fixed claim           | One-shot initial value docs must stay aligned with editor-created initial state; no new claim is needed.                                                                                                               | none        |
| `#5605` | `Fixes`                                   | unchanged fixed claim           | Provider-level `initialValue` removal remains the fixed claim owner. Lazy docs should not reopen or broaden it.                                                                                                        | none        |
| `#5709` | `Fixes`                                   | unchanged fixed claim           | Provider hook consumers receiving replacement editors remains the fixed claim owner.                                                                                                                                   | none        |
| `#6016` | `Not claimed` / invalid or likely invalid | unchanged non-claim             | Shared initial value object pressure is adjacent to initialization ownership, but the current ledger says do not bend v2 without a current minimal repro.                                                              | none        |
| `#4268` | `issue-reviewed`                          | unchanged docs/example only     | Paste HTML blank-line/caret behavior belongs to examples/docs unless it reproduces at package level. Paste-rule cleanup cannot close it alone.                                                                         | none        |
| `#2560` | docs/example duplicate lane               | unchanged docs/example only     | Extra space in the paste-html example is example serialization behavior, not a raw Slate architecture claim.                                                                                                           | none        |
| `#4569` | `Fixes`                                   | unchanged fixed claim           | Insert-data docs already own capability order, handler return semantics, and fallback behavior. Paste-rule docs must preserve that wording.                                                                            | none        |

Claim changes from this pass:

- New `Fixes` claims: 0.
- New `Improves` promotions: 0.
- Fixed/improved demotions: 0.
- Manual sync ledger changes: 0.
- Coverage matrix changes: 0.
- PR reference changes: 0.
- Fork dossier additions: 0.

Why no ledger files changed: every candidate already has a current cached row or
is only plan-local pressure. A planning-only pass must not rewrite public issue
claims unless it changes exact claim text, proof routes, or closure status.

Next issue gate: pass 11 must re-run sync accounting after the architecture
decision, proof plan, and revision passes. If later execution changes renderer,
command, paste, projection, or initialization proof, that later pass owns the
manual sync, coverage matrix, fork dossier, and PR reference updates.

## Intent And Decision Boundary Pass

Status: complete.

Live source refresh for this pass:

- `.tmp/slate-v2/docs/walkthroughs/09-performance.md:44` still tells users to
  stabilize `renderElement`, `renderLeaf`, `renderText`, and `renderSegment`
  with top-level functions or `useCallback`.
- `.tmp/slate-v2/docs/concepts/09-rendering.md:17` and
  `.tmp/slate-v2/docs/concepts/09-rendering.md:45` still teach
  `useCallback`-wrapped render functions.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:87` exposes
  `inputRules`, `renderingStrategy`, `onDOMBeforeInput`, `onCommand`,
  `onKeyDown`, and `scrollSelectionIntoView` as raw `Editable` props.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:216` defines
  `EditableCommandHandler`; `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:227`
  defines the raw `onDOMBeforeInput` escape hatch with command context.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:144`
  still rebuilds effective input rules from the `inputRules` prop identity.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:501`
  still accepts raw `renderElement`; the render callback remains a hot path.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx:15`
  and `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-widget-store.tsx:17`
  still take projected arrays directly and refresh when array identity changes.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts:23` constructs
  the editor lazily, but `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:619`
  still types `CreateEditorOptions.initialValue` as a value, while extension
  runtime state at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:869`
  already permits lazy initializers.
- `.tmp/slate-v2/site/examples/ts/tables.tsx:105`,
  `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx:87`, and
  `.tmp/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx:508` remain
  representative example-local memoization sites.

Intent:

- Remove React memoization as required Slate ceremony where the memo exists
  only because Slate React lacks a semantic owner.
- Keep Slate unopinionated. The answer is not "turn raw Slate into Plate".
- Keep raw escape hatches for advanced apps, but stop making escape hatches the
  happy path in docs/examples.
- Make performance behavior an API contract that can be tested, not a
  documentation warning that users must remember.

Outcome for a later `ralph` execution:

- Beginner rendering docs and examples no longer teach `useCallback` as the
  normal way to render elements, leaves, text, or projected segments.
- Common editing examples no longer need user-owned memoized `onKeyDown`,
  `onDOMBeforeInput`, or `inputRules` arrays for first-party behavior.
- Rendering strategy examples can pass option objects inline without defeating
  internal memoization.
- Annotation/widget examples may stop memoizing derived arrays by hand if a
  tiny generic projector overload survives implementation review.
- One-shot initial value docs use lazy `useState`, not `useMemo`.

In scope:

- `slate-react` renderer registration/capability for default element, leaf,
  text, and segment rendering.
- `slate-react` command/key/input/paste/rule ownership for common editing
  behavior that examples currently express as memoized callbacks.
- Internal value-normalization for `renderingStrategy` option objects.
- Optional projector overloads for `useSlateAnnotationStore` and
  `useSlateWidgetStore`, only if the overload is tiny, generic, and safer than
  a shared helper.
- Docs and examples that currently teach memoization as Slate setup work.
- Focused tests and grep checks proving current docs/examples no longer require
  this ceremony.

Non-goals:

- Do not remove raw `renderElement`, `renderLeaf`, `renderText`,
  `renderSegment`, `onKeyDown`, or `onDOMBeforeInput`.
- Do not put React component registration in raw `slate` core.
- Do not put URL sanitization, embed policy, mention popup behavior, debug UI,
  or benchmark controls into Slate React.
- Do not make virtualization production-ready in this lane.
- Do not assume React Compiler as a dependency or a correctness requirement.
- Do not implement Plate's plugin authoring model inside raw Slate.
- Do not claim any new fixed issue until implementation and proof exist.

Decision boundaries:

| Owner            | Owns                                                                                                                                           | Must not own                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| raw `slate` core | document model, transactions, schema/spec policy, commands as non-React extension substrate                                                    | React components, render callbacks, DOM events, app UI policy, one-off docs lazy initializer cleanup |
| `slate-react`    | `Editable` rendering capabilities, DOM/native input command routing, input-rule execution, projection stores, rendering strategy normalization | product plugins, URL trust policy, app-specific overlays                                             |
| examples/docs    | latest recommended API, small app-owned helpers, advanced escape-hatch examples labeled as such                                                | workarounds that exist only to satisfy Slate React internals                                         |
| Plate/plugins    | opinionated tables, combobox/mentions, rich paste policy, product shortcuts, toolbar recipes                                                   | generic Slate React rendering/input primitives                                                       |

User decision points:

- No user decision is needed before pass 5.
- If the later revision pass finds two equally clean public names for renderer
  registration, ask then. Do not stop this pass for naming bikeshedding.
- Lazy `initialValue` in core is not a user-decision point for this plan. Use
  lazy `useState` in docs unless implementation independently proves a tiny
  safe overload.

## Decision Brief

Principles:

- Semantic APIs beat handler memoization.
- Raw escape hatches stay available, but they are not onboarding material.
- Raw Slate core remains React-free.
- Slate React owns generic React runtime behavior; Plate owns product policy.
- React Compiler can make examples nicer, but Slate's public API must not rely
  on it.
- Every issue-facing claim needs implementation proof before the ledger changes.

Decision drivers:

- Performance: avoid prop-identity churn in hot render and input paths.
- DX: examples should read like editor code, not React memoization exercises.
- Migration: Plate and slate-yjs need generic substrate primitives, not
  one-off example callbacks.
- Testability: command, renderer, projection, and strategy behavior must be
  covered by package tests or example tests.
- Adoption: breaking changes must keep raw prop escape hatches.

Viable options:

| Option                                                        | Verdict                  | Reason                                                                                        |
| ------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| Docs-only cleanup                                             | reject                   | It hides the problem. Users would still need stable callback identity for hot paths.          |
| Assume React Compiler                                         | reject                   | Good future direction, bad library contract. Slate must work without a compiler.              |
| Move generic behavior to Plate/plugins                        | reject for core surfaces | Plate should own opinionated product behavior, not generic `Editable` render/input mechanics. |
| Remove raw render/input props                                 | reject                   | Too breaking and less Slate-like. Advanced apps still need escape hatches.                    |
| Add Slate React semantic capabilities while keeping raw props | choose                   | Best balance of unopinionated core, strong DX, and measurable runtime behavior.               |

Chosen direction:

1. Add a Slate React renderer capability/registration API. `renderElement`,
   `renderLeaf`, `renderText`, and `renderSegment` stay as raw props for
   advanced customization.
2. Make `onCommand` and extension-owned input/key/paste rules complete enough
   that examples stop parsing keys and native input events for common behavior.
3. Normalize `renderingStrategy` option objects by primitive fields inside the
   runtime, so inline objects do not create avoidable churn.
4. Keep annotation/widget projector overloads optional. Land only if the API is
   tiny, generic, metadata-safe, and clearly better than a shared helper.
5. Rewrite one-shot initial value docs to lazy `useState`; do not add core lazy
   `initialValue` for this walkthrough alone.

Rejected implementation shapes:

- A global React renderer registry in raw `slate`: wrong owner.
- A Plate-style plugin object as the default raw Slate authoring model: too
  opinionated.
- A single `memoizeEverything` docs section: preserves the bad API signal.
- A broad `useStableCallback` helper: treats the symptom, not the owner.
- A hard removal of `onKeyDown` or `onDOMBeforeInput`: hostile to advanced apps
  and browser escape hatches.

Consequences:

- `slate-react` gets a slightly larger public surface, but it buys back cleaner
  examples and lower hot-path identity pressure.
- The later proof pass must include rerender and handler-staleness tests. A
  pretty API without runtime proof is not enough.
- Docs must distinguish "recommended semantic API" from "escape hatch". Mixing
  those again is how this problem came back.
- Issue ledgers stay unchanged until execution produces fresh proof.

Pass 4 score update:

| Dimension                              | Previous | Current | Reason                                                                                 |
| -------------------------------------- | -------: | ------: | -------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |     0.68 |    0.72 | owner decisions now point at hot render/input/projection identity pressure             |
| Slate-close unopinionated DX           |     0.72 |    0.80 | raw escape hatches stay, semantic happy paths become first-class                       |
| Plate and slate-yjs migration backbone |     0.35 |    0.42 | boundary map separates raw substrate, Slate React runtime, and Plate policy            |
| Regression-proof testing strategy      |     0.40 |    0.46 | proof families are clearer, but not yet concrete enough                                |
| Research evidence completeness         |     0.45 |    0.47 | live-source refresh improved current-state evidence, ecosystem synthesis still missing |
| shadcn-style composability/minimalism  |     0.65 |    0.72 | chosen shape favors composable capabilities and keeps low-level escape hatches         |

Weighted score: `0.68`.

## Research And Ecosystem Strategy Pass

Status: complete.

Research mode: maintain. The compiled editor-architecture lane already covers
the relevant comparison set, so this pass did not create new research pages.
It did append the research log and recorded the gap report here. The remaining
gaps are execution-proof gaps, not missing source-family gaps.

Compiled evidence read:

- `docs/research/index.md` and `docs/research/log.md`.
- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`.
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`.
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`.
- `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`.
- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`.
- `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md`.
- `docs/research/systems/editor-node-text-mark-dx-landscape.md`.
- `docs/research/decisions/plugin-input-rules-guide-should-lead-with-runtime-first-then-feature-owners-then-api-reference.md`.
- `docs/analysis/editor-architecture-candidates.md`.

Local source evidence read:

- Lexical: `../lexical/packages/lexical/src/LexicalEditor.ts`.
- ProseMirror: `../raw/prosemirror/packages/state/src/transaction.ts`,
  `../prosemirror-view/src/index.ts`, `../prosemirror-view/src/selection.ts`,
  and `../prosemirror-view/src/input.ts`.
- Tiptap: `../tiptap/packages/core/src/ExtensionManager.ts`,
  `../tiptap/packages/core/src/CommandManager.ts`,
  `../tiptap/packages/react/src/useEditorState.ts`, and
  `../tiptap/packages/react/src/useEditor.ts`.
- Plate: `../plate/packages/core/src/react/editor/PlateEditor.ts`,
  `../plate/packages/core/src/react/editor/withPlate.ts`, and
  `../plate/packages/autoformat/src/plugin.ts`.
- slate-yjs: `../slate-yjs/packages/core/src/plugins/withYjs.ts`,
  `../slate-yjs/packages/core/src/utils/position.ts`,
  `../slate-yjs/packages/core/src/plugins/withYHistory.ts`, and remote cursor
  React hooks.

Ecosystem synthesis:

| System      | Steal                                                                                                                                                       | Reject                                                                                                                                               | Deliberately diverge                                                                                                                      | Effect on this plan                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lexical     | Read/update lifecycle, prioritized command listeners, root/update/decorator listener partitioning, lifecycle tags, dirty scheduling, extension-local state. | Class nodes, `$` helper culture, app code dispatching raw commands as the normal write API.                                                          | Keep JSON-like Slate data, `editor.read` / `editor.update`, and React-visible renderers instead of a Lexical DOM reconciler.              | `onCommand` should be semantic and runtime-owned, but normal writes stay `editor.update((tx) => ...)`. Renderer capability should consume commit dirtiness, not React callback identity. |
| ProseMirror | Transactions owning doc changes, selection, marks, metadata, scroll intent, and one DOM selection bridge owner.                                             | Integer-position identity, schema-first core as Slate identity, plugin complexity as the default user API, ProseMirror view tree as the React story. | Use paths, runtime ids, operations, commits, and React selectors while preserving transaction discipline.                                 | Inline `onKeyDown`/`onDOMBeforeInput` examples are the wrong default. Common edit behavior should become command/rule contracts with transaction metadata and browser proof.             |
| Tiptap      | Extension packaging, command discoverability, keyboard/input/paste rule families, React selector posture.                                                   | Required `chain().focus().run()` ceremony and React NodeView wrappers as the default raw renderer API.                                               | Treat Tiptap as product-DX evidence, not engine authority. Plate gets richer product packaging; raw Slate keeps primitive lifecycle APIs. | `inputRules` should be feature-owned extension config. Example-local memoized arrays are a smell, but raw Slate should not become Tiptap.                                                |
| React 19.2  | External-store selectors, transitions/deferred work for non-urgent UI, Activity for hidden panes, performance tracks for proof.                             | React Compiler as a correctness contract, React scheduling as a substitute for editor dirtiness.                                                     | Keep urgent editing below React where needed and feed React precise commit/store snapshots.                                               | Removing user `useCallback` is justified only when Slate React owns identity. It must be backed by selector/dirtiness tests, not just prettier docs.                                     |
| Plate       | Feature packaging, plugin-level renderers, handlers, transforms, input rule families, and product-level shortcuts.                                          | Copying `editor.api` / `editor.tf` naming into raw Slate, or moving Plate product policy into `slate-react`.                                         | Raw Slate uses `state` / `tx` namespaces. Plate can build richer `api` / `tf` and kits above it.                                          | Renderer and command primitives must be strong enough for Plate migration, but shortcut, table, combobox, URL, and toolbar policy remains Plate/plugin-owned.                            |
| slate-yjs   | Operation batching, local/remote origin metadata, relative ranges, stored positions, history selection snapshots, cursor stores/selectors.                  | Syncing runtime ids, DOM shells, hidden anchors, React projections, or DOM selection.                                                                | Yjs syncs document content, typed node state, operations, and durable anchors. Runtime/browser facts stay local.                          | The plan's projection and lazy-initial-value rows are migration-relevant only if they preserve operation/commit metadata and durable selection anchors.                                  |

Cross-system decisions from this pass:

1. Renderer capability should be spec-first, not a thin helper around
   `renderElement`. The target is closer to `defineElement({ render })` plus
   runtime-owned shells than to "memoize this callback".
2. `onCommand` is the right generic public name for edit intent at the
   `Editable` boundary. Extension APIs may expose feature commands, but raw
   Slate should not lead with a Tiptap-style command catalog.
3. Input rules should move out of example-local `useMemo` arrays, but they
   should stay feature-owned. A generic rules engine is useful; a new central
   product policy bucket is not.
4. Rendering strategy normalization is still valid, but it is a smaller
   runtime hygiene fix than renderer and command ownership.
5. Projection hook projector overloads are plausible because they match React
   external-store and slate-yjs selector evidence, but later passes downgrade
   them to optional. They should land only if generic, tiny, and metadata-safe.
6. Lazy initial value is docs-first. A core overload is not required for this
   plan and must not weaken operation replay, collaboration initialization, or
   fixed issue claims around editor replacement and provider value ownership.

Research gap report:

| Area              | Gap                                                                                                                                                          | Owner          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Performance proof | Need measured rerender/identity tests for renderer capability and rendering strategy normalization; projection proof only if the optional overload survives. | pass 6         |
| Regression proof  | Need concrete tests for stale callback behavior, key/native input routing, paste/rule execution, docs grep, and example ergonomics.                          | pass 6         |
| Migration proof   | Need substrate rows for Plate feature packaging and slate-yjs operation/anchor preservation.                                                                 | passes 6 and 9 |
| API objections    | Need maintainer objection rows before calling the plan ready.                                                                                                | pass 7         |
| High-risk gate    | Public renderer, command, rule, projection, and initialization surfaces require deliberate-mode review.                                                      | pass 8         |

Pass 5 score update:

| Dimension                              | Previous | Current | Reason                                                                                                 |
| -------------------------------------- | -------: | ------: | ------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance         |     0.72 |    0.78 | React selector and external-store evidence now directly supports projection and identity targets       |
| Slate-close unopinionated DX           |     0.80 |    0.84 | Tiptap/Plate pressure sharpened the boundary between raw Slate primitives and product APIs             |
| Plate and slate-yjs migration backbone |     0.42 |    0.62 | local Plate and slate-yjs source now grounds extension, operation, origin, and durable-anchor pressure |
| Regression-proof testing strategy      |     0.46 |    0.52 | test families are clearer, but no concrete matrix or red/green proof yet                               |
| Research evidence completeness         |     0.47 |    0.80 | compiled research and local source refresh now cover the required ecosystem set                        |
| shadcn-style composability/minimalism  |     0.72 |    0.82 | spec-first renderer and feature-owned rule direction removes callback ceremony without bloating core   |

Weighted score: `0.75`.

## Pressure Pass

Status: complete.

Applied review lenses:

| Lens                        | Status  | Evidence                                                                                                  | Effect                                                                                                                    |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Vercel React best practices | applied | `Editable`/example callback surfaces, projection hooks, rendering strategy object dependencies            | use stable library-owned subscriptions and primitive deps; do not ask users to fix Slate prop identity with `useCallback` |
| Performance                 | applied | current rendering strategy metrics, render profiler, annotation locality tests, docs INP guidance         | add cohorts, repeated-unit budgets, INP rows, memory/DOM tags, degradation contracts, and native-behavior proof           |
| Performance Oracle          | applied | hot paths are render blocks, text/leaves, input rules, projection stores, and rendering strategy planning | require O(changed block + affected projection) behavior; reject typing/selecting paths that scan the whole document       |
| TDD                         | applied | later execution changes public behavior and docs/examples                                                 | execution must land one behavior test at a time, not a horizontal pile of imagined tests                                  |
| Code simplicity             | applied | five candidate cuts plus weak cleanup rows                                                                | keep two core cuts, one cheap runtime hygiene fix, one conditional projection cut, and docs-first lazy initialization     |

Live source pressure evidence:

- `EditableDOMRootProps` still exposes `inputRules`, `renderingStrategy`,
  `onDOMBeforeInput`, `onCommand`, and `onKeyDown` as raw props in
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`.
- Rendering strategy metrics already include cohort, degradation mode,
  DOM node count, mounted counts, shell counts, and `nativeSurfaceComplete` in
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`.
- `EditableTextBlocks` still accepts raw `renderElement`, `renderLeaf`,
  `renderText`, `renderSegment`, and `renderVoid` props in
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
- `runtime-root-engine.ts` still memoizes effective input rules by
  `inputRules` prop identity.
- `useSlateAnnotationStore` and `useSlateWidgetStore` still refresh when the
  projected array identity changes.
- `useSlateEditor` is already lazy as a hook, but public
  `CreateEditorOptions.initialValue` is still value-only.
- Existing tests already cover annotation locality, render profiling,
  rendering strategy metrics/degradation, large DOM-present group stability,
  and virtualized native-surface flags, but not the specific "user can stop
  memoizing examples" contract.

### Keep / Downgrade / Cut

| Candidate                              | Pressure verdict         | Reason                                                                                                                                                                                                                                                                      |
| -------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer capability and docs rewrite   | keep, top priority       | This is the biggest DX and perf leak. Beginner docs still teach callback stability, and renderer prop identity is a hot repeated-unit input. The target should be spec/component registration consumed by Slate React, not a tiny helper that merely wraps `renderElement`. |
| Command/key/input/paste behavior cuts  | keep, top priority       | Tables, markdown shortcuts, code highlighting, inlines, rich text, and images still teach app-local key/native-event plumbing. The fix is semantic command/rule ownership with raw escape hatches intact.                                                                   |
| Rendering strategy value normalization | keep, cheap              | Current internals derive configs from object options, and examples memoize option objects. Normalize by primitive fields so equivalent inline objects do not churn strategy config or metrics.                                                                              |
| Annotation/widget projector overloads  | downgrade to conditional | The hook API smell is real, but it is lower leverage and risks API bloat. Execute only if the overload is tiny and generic. Otherwise leave a shared example helper or defer. Do not make comment-specific API.                                                             |
| Lazy initial value support             | downgrade to docs-first  | The hook construction is already lazy; the public core type is value-only. Prefer rewriting the docs to lazy `useState` first. Add function-valued `initialValue` only if it is a small, well-tested core change that does not disturb initialization issue claims.         |
| Safe URL helpers and trivial callbacks | cut from architecture    | These are example cleanup, not Slate React API work. Do them only as opportunistic docs/example polish after core rows.                                                                                                                                                     |

### Performance

- applicability: applied.
- Vercel rules used:
  - `rerender-dependencies`: strategy configs and effects should depend on
    primitive fields, not option-object identity.
  - `rerender-lazy-state-init`: one-shot localStorage reads belong in lazy
    initialization, not `useMemo(..., [])`.
  - `rerender-defer-reads`: event handlers should not subscribe/render just to
    read state later.
  - `advanced-event-handler-refs`: long-lived native listeners need latest
    callbacks without reattachment.
  - `client-event-listeners`: repeated editor blocks should not carry repeated
    global/native listener work.
  - `js-length-check-first`, `js-set-map-lookups`, and `js-early-exit`: hot
    projection and rule paths need cheap guards before scans.
- extra performance rules used:
  - cohort segmentation
  - repeated-unit budget
  - event-delegation budget
  - interaction INP matrix
  - memory/DOM tagging
  - degradation contract
  - editor native behavior proof
  - React 19 runtime proof
- repeated units:
  - top-level block renderer
  - text/leaf renderer
  - input event/rule dispatch
  - annotation/widget projection bucket
  - rendering strategy group/segment
- cohorts:
  - normal: 0-500 blocks, low decorations, DOM-present
  - medium: 500-2000 blocks, DOM-present with strict repeated-unit budgets
  - large: 2000-10000 blocks, staged rendering and DOM metrics required
  - stress: 10000-50000 blocks, explicit degradation rows required
  - pathological: 50000+ blocks or custom renderers plus dense annotations,
    collaboration, IME/mobile, or broad selection
- budgets:
  - no per-block effects from renderer registration
  - no per-block event handler growth from command/rule APIs
  - typing/selecting must not allocate or scan proportional to full document
  - projection refresh must be scoped by affected runtime ids or explicit
    external ids
  - rendering strategy metrics must keep DOM node, mounted group, shell, and
    boundary counts visible
- React/runtime primitives:
  - `useSyncExternalStore`-style selectors remain correct for projected UI
  - React transitions/deferred work can help sidebars and overlays only
  - React 19 `Activity` is not a hidden editable-content primitive
  - React Compiler is not accepted as a library correctness contract
- interaction metrics required:
  - type
  - select
  - select then type
  - select-all
  - copy
  - paste
  - backspace/enter shortcut
  - click far group then type
  - materialize staged/shell/virtualized group
  - remote/projection update
- trace/CWV proof:
  - page load/Core Web Vitals are out of scope for this plan
  - React Performance Tracks matter only when component breadth is suspicious
  - lab proxies are event-to-update and event-to-paint by interaction/cohort
- memory tags:
  - JS heap
  - DOM node count
  - mounted group count
  - shell/virtualized boundary count
  - event listener count
  - projected annotation/widget count
  - dirty runtime id set size
- degradation contract:
  - DOM-present/staged is the production path
  - shell and virtualized remain named degraded modes
  - every degraded mode must classify browser find, screen-reader traversal,
    native selection, copy, paste, select-all, IME, mobile touch selection,
    undo/history, collaboration, and follow-up typing
- dashboard/RUM gap:
  - no production RUM required for this docs/example API cleanup lane
  - if performance claims are marketed later, tag interaction name, cohort,
    rendering strategy, document size, DOM nodes, annotations, browser, mobile,
    IME, and release version

### DX And API Pressure

| API row                          | DX verdict                                    | Required adjustment                                                                                                                                    |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Renderer registration            | Strong. It removes the worst onboarding lie.  | Do not expose a confusing second way to render everything. Docs lead with spec/component registration; raw render props are the advanced escape hatch. |
| `onCommand`                      | Strong. Name is clean and already exists.     | Keep it semantic. Do not invent `onEditableCommand` or a raw command catalog.                                                                          |
| Key/paste/input rules            | Strong but easy to overgrow.                  | Feature-owned rules, not a central product-policy registry. Raw `onKeyDown` and `onDOMBeforeInput` stay.                                               |
| Rendering strategy inline object | Strong enough because it is internal hygiene. | Normalize primitive fields; no public naming debate.                                                                                                   |
| Projection projector overload    | Conditional.                                  | Only land if it makes examples simpler with a very small generic overload. Otherwise defer.                                                            |
| Lazy initial value               | Docs-first.                                   | Use lazy `useState` in docs unless function-valued `initialValue` is already a tiny safe core change.                                                  |

### Unopinionated Core Pressure

Raw `slate` must not absorb:

- React renderers.
- URL trust policy.
- mention popup behavior.
- table product navigation.
- toolbar/shortcut packages.
- Plate-style `api` / `tf` naming.
- React projection stores.

Raw `slate` may own:

- value initialization if the function-valued initializer is a pure
  construction-time value API.
- transaction/commit metadata that Slate React, Plate, and slate-yjs can all
  consume.
- extension namespace substrate through `state` / `tx`.

Slate React may own:

- renderer component registration.
- native input/keyboard command classification.
- generic feature-owned input/paste/key rules.
- projection-store hook mechanics.
- rendering strategy normalization and metrics.

### Migration Pressure

| Migration consumer               | Required substrate                                                                                            | Non-promise                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Plate renderer/plugins           | component/spec registration, feature-owned rules, `state` / `tx` extension groups, stable command/rule events | do not promise current Plate `editor.api` / `editor.tf` compatibility in raw Slate |
| Plate tables/mentions/rich paste | generic command/rule hooks and raw escape hatches                                                             | do not put product table, combobox, URL, or toolbar policy in Slate React          |
| slate-yjs                        | deterministic operations, local/remote origin metadata, durable relative anchors, selection/history snapshots | do not sync runtime ids, DOM shells, hidden anchors, or React projections          |
| Legacy Slate examples            | raw props remain available, docs label them as escape hatches                                                 | do not break advanced custom handlers just to make examples pretty                 |

### Regression Proof Matrix

| Area                         | First red test                                                                                                    | Green proof                                                                                                                                                     | Browser/manual proof                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Renderer capability          | parent rerender with semantic renderer registration does not re-render unchanged blocks just because app rendered | `slate-react` render-profiler/surface contract proves unchanged block/text/leaf counts stay bounded; docs grep removes beginner `useCallback` renderer guidance | one example route renders custom elements/leaves with registration and accepts typing/selecting       |
| Raw render escape hatch      | raw `renderElement`/`renderLeaf` still works                                                                      | existing surface contracts remain green plus one escape-hatch docs/API test                                                                                     | not required beyond existing editable smoke                                                           |
| `onCommand` key/native input | table boundary and markdown Enter/Backspace/format cases can be expressed without example-local `useCallback`     | focused unit tests for command classification, latest handler, preventDefault/return semantics, and raw escape hatch fallback                                   | markdown/table examples accept keyboard input in Playwright if example tests exist in execution slice |
| Input rules                  | markdown/inlines can register feature-owned rules without memoized arrays                                         | test that equivalent extension input rules do not rebuild because parent rerendered; rule order and fallback preserved                                          | markdown shortcut example smoke                                                                       |
| Android pending diff flush   | markdown shortcut Android flush is runtime-owned                                                                  | focused native-input/router test around pending diff schedule                                                                                                   | mobile proof only if the changed path affects mobile-specific behavior                                |
| Rendering strategy object    | inline equivalent object does not churn config/metrics or remount groups                                          | rendering-strategy test with parent rerender and equivalent inline object; metrics stable where they should be                                                  | existing rendering-strategy example route smoke                                                       |
| Projection hooks             | if implemented, projector overload refreshes on deps change, not parent rerender                                  | annotation/widget store tests prove scoped refresh counts and no full reproject on unchanged deps                                                               | comment examples render and sidebar stays synced                                                      |
| Lazy initial value docs      | docs no longer use `useMemo(..., [])` for one-shot storage reads                                                  | docs grep plus existing `useSlateEditor`/provider tests                                                                                                         | not required unless runtime API changes                                                               |
| Issue claims                 | no new issue is claimed by docs/API cleanup alone                                                                 | coverage/sync ledger unchanged until execution proof exists                                                                                                     | none until pass 11                                                                                    |

### TDD Execution Shape

Execution should use vertical slices:

1. Renderer registration test, implementation, docs rewrite.
2. Command/rule routing test, implementation, examples rewrite.
3. Rendering strategy inline-object test, implementation, example rewrite.
4. Projection overload test only if the API survives implementation review.
5. Lazy initial value docs grep, with core test only if core API changes.

Do not write all tests first. That would lock the wrong API too early.

### Simplicity Review

Core purpose: stop teaching React memoization as Slate setup work when the
runtime can own the identity or behavior.

Simplification decisions:

- Keep renderer capability and command/rule routing because they remove real
  repeated ceremony across docs/examples.
- Keep rendering strategy normalization because it is small and internal.
- Downgrade projection overloads because they may create public API weight for
  three examples.
- Cut core lazy `initialValue` unless implementation is tiny; lazy docs are
  enough for the current problem.
- Cut safe URL and UI overlay callbacks from this architecture lane.

Plan delta from pass 6:

- Execution order changes to:
  1. renderer capability and render docs
  2. command/rule routing and editing examples
  3. rendering strategy normalization
  4. conditional projection overload
  5. docs-first lazy initialization
- Projection overload is no longer a required closure item.
- Core lazy `initialValue` is no longer required for closure.
- Performance proof now requires cohorts, repeated-unit budgets, interaction
  rows, memory/DOM tags, and native behavior classification for degraded modes.

Pass 6 score update:

| Dimension                              | Previous | Current | Reason                                                                                            |
| -------------------------------------- | -------: | ------: | ------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |     0.78 |    0.84 | pressure pass added cohorts, repeated-unit budgets, metrics, memory/DOM tags, and React 19 limits |
| Slate-close unopinionated DX           |     0.84 |    0.86 | API rows now separate semantic Slate React primitives from Plate product policy                   |
| Plate and slate-yjs migration backbone |     0.62 |    0.74 | migration proof rows now name substrate requirements and non-promises                             |
| Regression-proof testing strategy      |     0.52 |    0.72 | concrete red/green/browser matrix exists, though execution proof is still missing                 |
| Research evidence completeness         |     0.80 |    0.84 | no new source gap found; pass 6 tied research to concrete pressure rows                           |
| shadcn-style composability/minimalism  |     0.82 |    0.84 | conditional/cut decisions reduce API bloat while keeping the high-leverage primitives             |

Weighted score: `0.82`.

## Slate Maintainer Objection Ledger

Status: complete.

This pass asks the uncomfortable question first: would a serious Slate
maintainer reject this as a slow drift from unopinionated primitives into a
framework? Some objections are real. The plan survives only where the answer is
stronger than "cleaner examples".

| Decision                                               | Strongest fair objection                                                                                                                   | Why it is valid                                                                                                                            | Answer                                                                                                                                                                                                        | Plan delta                                                                                                                                         | Blocks closure?                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Renderer registration as the default docs path         | This creates a second rendering model beside `renderElement` and makes Slate feel less like plain React.                                   | Slate users know render props. A new registration API can confuse ownership and create a React-only shadow schema.                         | Keep raw render props as first-class escape hatches. The new default is Slate React component/spec registration for repeated renderer identity, not a core Slate schema.                                      | Docs must split "recommended renderer registration" from "raw render props for advanced control"; execution needs an escape-hatch regression test. | No, if docs/API proof keeps raw props intact.      |
| `onCommand` as the public edit-intent surface          | This can turn into a fake command framework and hide normal DOM events from users.                                                         | Slate's strength is direct control. A broad command surface can become a product policy bucket.                                            | `onCommand` already exists and is the clean name. Keep it semantic at the `Editable` boundary, keep raw `onKeyDown`/`onDOMBeforeInput`, and do not introduce a central command catalog.                       | Key/native input proof must cover latest handler, return/preventDefault semantics, and fallback to raw handlers.                                   | No, but high-risk pass must audit event semantics. |
| Key/input/paste rules moving out of examples           | This can smuggle Plate-style plugin policy into raw Slate React.                                                                           | Markdown shortcuts, links, tables, mentions, and paste are product behavior families. Raw Slate should not ship rich product opinions.     | Keep the rule machinery generic and feature-owned. Rich rule packs belong in plugins or Plate; Slate React owns routing and composition, not product defaults.                                                | Plan text now treats rule families as extension-owned, not a central product-policy registry.                                                      | No, if ecosystem pass confirms the boundary.       |
| Raw escape hatches remain but become "advanced" docs   | "Advanced" can become a soft deprecation, which would be hostile to existing Slate users.                                                  | Slate has always been powerful because users can drop to raw handlers/renderers.                                                           | No removal. Escape hatches stay public and tested. Docs only stop teaching raw callback memoization as the beginner path.                                                                                     | Execution needs docs wording that says raw props are valid control surfaces, not legacy leftovers.                                                 | No, if docs and tests prove parity.                |
| Projection projector overload                          | This is API bloat for three comment examples.                                                                                              | The hook already works. A projector option may solve app mapping mechanics that userland can own.                                          | Conditional only. Land it only if the overload is tiny, generic, and reduces parent-render churn without comment-specific API. Otherwise defer or use shared example helpers.                                 | Projection is no longer required for closure.                                                                                                      | No.                                                |
| Lazy `initialValue` function support                   | This risks reopening old initialization/provider issue claims for a docs-only smell.                                                       | Initial value semantics are sensitive: editor replacement, provider values, history, collaboration bootstrap, and issue rows have history. | Docs-first. Use lazy `useState` unless function-valued `initialValue` is a tiny safe core change with focused tests.                                                                                          | Core lazy initializer is removed from required architecture work.                                                                                  | No.                                                |
| Docs churn across rendering, commands, and performance | A docs rewrite can bury familiar APIs and make the migration feel larger than the code change.                                             | Users copy docs. If the docs overcorrect, the API surface gets distorted.                                                                  | Rewrite only beginner/example guidance. Reference docs keep raw APIs and state what each surface owns. No changelog-style migration prose.                                                                    | Execution must list touched docs and run a grep proving no beginner doc teaches `useCallback`/`useMemo` as required Slate ceremony.                | No.                                                |
| Issue-claim discipline                                 | This plan could overclaim old GitHub issues as fixed because the architecture sounds related.                                              | Renderer/command cleanup may improve symptoms without reproducing the exact old issue.                                                     | No new `Fixes` or `Improves` rows until execution proof exists. Pass 11 owns sync accounting.                                                                                                                 | Issue sync remains a separate required pass.                                                                                                       | Yes.                                               |
| Plate and slate-yjs migration                          | This may be good for raw examples but not enough for Plate plugins or collaboration.                                                       | Plate needs packaging and rule families. slate-yjs needs operation/origin/anchor guarantees, not prettier React examples.                  | Treat migration as substrate only: renderer specs, command/rule events, `state`/`tx`, commit metadata, deterministic ops, durable anchors. No promise of current Plate or slate-yjs public API compatibility. | Pass 9 must run an ecosystem maintainer pass before closure.                                                                                       | Yes.                                               |
| Browser/native proof                                   | Removing app handlers can break IME, Android pending diffs, selection, paste, select-all, or native find/copy in degraded rendering modes. | Editor bugs live in browsers, not plan tables. React unit tests alone are too narrow.                                                      | Keep browser/native proof in the execution matrix for renderer, command/rule, rendering strategy, projection if landed, and degraded modes.                                                                   | High-risk deliberate mode must classify native behavior rows before the plan can score ready.                                                      | Yes.                                               |
| Performance payoff versus API weight                   | Top-level functions and plain helpers might solve most docs examples without new API.                                                      | A small teaching cleanup is cheaper than a new public surface.                                                                             | Top-level functions are fine for one-off docs, but the repeated renderer and command/rule cases are library-owned identity/behavior problems. The lower-leverage rows are downgraded or cut.                  | Only renderer registration, command/rule routing, and rendering-strategy normalization remain high-confidence execution targets.                   | No.                                                |

Rejected after objection review:

- "Remove every example `useCallback` / `useMemo`": too broad and wrong.
- "Make raw Slate core own React renderers": wrong owner.
- "Ship a central product input-rule registry": Plate/plugin territory.
- "Use React Compiler as the answer": not a library contract.
- "Claim old issues from architecture cleanup alone": overclaiming.

Pass 7 score update:

| Dimension                              | Previous | Current | Reason                                                                                     |
| -------------------------------------- | -------: | ------: | ------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance         |     0.84 |    0.85 | objections narrowed the required public work to true repeated-unit identity/behavior leaks |
| Slate-close unopinionated DX           |     0.86 |    0.87 | raw escape hatches remain first-class while beginner docs can lead with better primitives  |
| Plate and slate-yjs migration backbone |     0.74 |    0.78 | migration blockers are now explicit and assigned to the ecosystem maintainer pass          |
| Regression-proof testing strategy      |     0.72 |    0.76 | browser/native and issue-claim blockers are named, but execution proof is still missing    |
| Research evidence completeness         |     0.84 |    0.85 | maintainer objections are grounded in the already-read source and ecosystem rows           |
| shadcn-style composability/minimalism  |     0.84 |    0.86 | projection and lazy initialization remain downgraded, keeping the API smaller              |

Weighted score: `0.86`.

## High-Risk Deliberate Pass

Status: complete.

High-risk trigger: this plan changes public Slate React API guidance, render
contracts, command/rule routing, browser-native input behavior, docs/examples,
and migration substrate expectations. It is additive on paper, but it touches
the exact places where editor regressions are expensive: typing, selection,
IME, paste, undo, rendering breadth, and downstream plugin authors.

Live API refresh used for this pass:

- `EditableDOMRootProps` still exposes `inputRules`, `renderingStrategy`,
  `onDOMBeforeInput`, `onCommand`, and `onKeyDown` in
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`.
- `EditableTextBlocks` still forwards `renderElement`, `renderLeaf`,
  `renderText`, `renderSegment`, and `renderVoid`, and memo comparison still
  includes renderer identity in
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
- `runtime-root-engine.ts` still derives effective input rules from
  `inputRules` prop identity and owns Android/native input routing.
- `useSlateAnnotationStore` and `useSlateWidgetStore` still refresh from
  array identity.
- `CreateEditorOptions.initialValue` is still value-only while `Editor` also
  has lazy initializer typing elsewhere.

### Blast Radius

| Area                                  | Risk                                                                                            | Consumers affected                                           | Required containment                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Renderer registration                 | New default rendering path can conflict with raw render props or overfit React.                 | Slate React users, docs readers, Plate renderer migration.   | Additive API only; raw render props stay supported and tested.     |
| `onCommand` and key/input/paste rules | Native DOM event ordering, IME, Android pending diffs, paste, and table navigation can regress. | Every editable user path plus plugin authors.                | Vertical tests per input family; raw handler fallback unchanged.   |
| Rendering strategy normalization      | Equivalent inline objects could still remount groups or distort metrics.                        | Large-document examples and staged/virtualized modes.        | Primitive-field normalization with metrics stability proof.        |
| Projection hooks                      | Projector overload can create stale closures, broad reprojection, or unnecessary public API.    | Annotation/widget examples, collaboration-adjacent overlays. | Split from required work; land only after tiny generic proof.      |
| Lazy initialization                   | Function-valued `initialValue` can blur editor replacement and provider ownership.              | Persistence docs, provider users, history/collab bootstrap.  | Docs-first lazy `useState`; no core API unless trivial and tested. |
| Issue claims                          | Architecture cleanup can overclaim old issues.                                                  | Release notes, issue ledger, PR reference.                   | No claim movement until pass 11 and execution proof.               |

### Three-Scenario Pre-Mortem

| Scenario       | What happens                                                                                                                                      | Early warning                                                                                                | Prevention                                                                                      | Recovery                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Best case      | Renderer registration, command/rule routing, and rendering-strategy normalization remove example memoization without changing raw escape hatches. | Tests show unchanged block render counts, raw props still green, examples simplify.                          | Execute vertical slices with docs grep and focused browser proof.                               | Keep projection/lazy rows deferred until they prove worth.                          |
| Likely failure | The API is mostly right, but docs overteach it or command/rule routing misses an edge case.                                                       | Raw handler examples disappear, Android/IME/paste tests need special casing, or docs imply deprecation.      | Require raw escape-hatch docs and native-input matrix before closure.                           | Revise docs first; keep raw examples where behavior is truly app-owned.             |
| Worst case     | Slate React absorbs product policy, breaks native input ordering, and downstream users lose trust.                                                | Feature rules start encoding tables/links/mentions directly; browser proof fails; issue claims get inflated. | Keep product behavior in plugins/Plate, keep claim sync separate, require browser-native proof. | Drop or split the offending API; ship only docs cleanup and internal normalization. |

### High-Risk Rows

| Row                              | Verdict                | Non-negotiable proof                                                                                                            | Reason                                                                                           |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Renderer registration            | keep, additive         | raw render props still work; semantic registration avoids unchanged-block rerenders; docs make raw props valid advanced control | This is the highest leverage API cleanup and the risk is containable.                            |
| `onCommand` key/native routing   | keep, strict           | keydown, beforeinput, command return/preventDefault, latest handler, and raw fallback tests                                     | The name is right, but only if it stays semantic and does not hide raw DOM control.              |
| Input/paste/key rules            | keep, feature-owned    | rule order, fallback, equivalent parent rerender, Enter/Backspace/Delete, paste, Android pending diff proof                     | The runtime should own routing mechanics; plugins own product behavior.                          |
| Rendering strategy normalization | keep                   | inline equivalent object does not churn config, remount groups, or skew metrics                                                 | Cheap internal hygiene with low public API risk.                                                 |
| Projection projector overload    | split/defer            | no stale projector closures, no full reproject on parent rerender, tiny generic overload                                        | Useful only if it stays smaller than the ceremony it removes. Not a release blocker.             |
| Core lazy `initialValue`         | drop from required API | docs grep for lazy `useState`; core test only if the public type changes                                                        | The current smell is docs teaching `useMemo`, not proof that core needs a new initializer shape. |
| Issue claim movement             | defer to pass 11       | ledger/coverage/PR reference sync after execution proof                                                                         | Planning alone proves zero issue fixes.                                                          |

### Expanded Proof Plan

| Proof lane         | Required checks                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit               | `slate-react` renderer registration contract, raw render escape hatch, command latest-handler semantics, command fallback, input-rule order/fallback, rendering-strategy primitive normalization, optional projection deps behavior. |
| Integration        | example-level tables, markdown shortcuts, inlines, code highlighting, rendering strategy runtime, and comments only if projection lands.                                                                                             |
| Browser/native     | typing, selection then typing, Enter/Backspace/Delete, paste, copy/select-all, IME-sensitive beforeinput, Android pending diff path if touched, staged/virtualized degraded-mode native behavior classification.                     |
| Migration/adoption | raw props continue to compile; feature-owned rules stay plugin/Plate friendly; no current Plate or slate-yjs adapter promise.                                                                                                        |
| Docs/examples      | beginner docs stop teaching `useCallback`/`useMemo` as Slate setup; reference docs preserve raw APIs; examples only remove memoization where Slate React owns identity or behavior.                                                  |
| Performance        | repeated-unit budgets for unchanged block/text/leaf renderers, event listener count, rule dispatch cost, strategy metric stability, projection refresh count if landed.                                                              |
| Release/package    | export/barrel updates if public files move; package-scoped typecheck; no issue claim movement until pass 11.                                                                                                                         |

### Rollback And Remediation

- Renderer registration rollback: keep raw render docs and remove the new docs
  recommendation before cutting raw props. Raw props are the recovery path.
- Command/rule rollback: keep `onKeyDown` and `onDOMBeforeInput` documented and
  tested; do not migrate an example if the semantic route cannot express it.
- Rendering strategy rollback: revert to internal identity memo only if
  primitive normalization distorts metrics.
- Projection rollback: do not land the overload unless it is tiny and generic.
- Lazy initialization rollback: docs use lazy `useState`; core public API stays
  value-only unless the implementation is proven boring.
- Issue rollback: no claims move before pass 11, so bad planning cannot create
  public issue debt.

Pass 8 decision: keep the plan, but split optional projection and drop required
core lazy initialization. The release-quality target is now:

1. Renderer registration and render docs.
2. Command/rule routing and editing examples.
3. Rendering strategy primitive normalization.
4. Optional projection only after tiny generic proof.
5. Docs-first lazy initialization.

Pass 8 score update:

| Dimension                              | Previous | Current | Reason                                                                                                        |
| -------------------------------------- | -------: | ------: | ------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |     0.85 |    0.87 | high-risk proof now ties renderer identity, rule routing, and strategy normalization to repeated-unit budgets |
| Slate-close unopinionated DX           |     0.87 |    0.88 | raw escape hatches are explicit recovery paths, not deprecated leftovers                                      |
| Plate and slate-yjs migration backbone |     0.78 |    0.82 | migration risk is better bounded, but ecosystem maintainer review is still required                           |
| Regression-proof testing strategy      |     0.76 |    0.82 | proof lanes now cover native input, browser paths, docs grep, and package gates                               |
| Research evidence completeness         |     0.85 |    0.86 | current live API refresh confirms the high-risk surfaces                                                      |
| shadcn-style composability/minimalism  |     0.86 |    0.87 | optional projection and required lazy core API were split out, keeping the public shape smaller               |

Weighted score: `0.88`.

## Ecosystem Maintainer Pass

Status: complete.

This pass treats the plan as if Plate, slate-yjs, legacy Slate, and the major
editor ecosystems had to live with it. Verdict: keep the plan, but the execution
handoff must be stricter about feature ownership and metadata. The dangerous
version of this plan is "nice examples with a big new Slate React API." The
acceptable version is "small Slate React primitives that make Plate and
collaboration easier without absorbing their policy."

Ecosystem evidence refreshed:

- Plate current source exposes plugin-owned `api`, `tf`, plugin lists, handler,
  render, decorate, and input-rule metadata in
  `../plate/packages/core/src/react/editor/PlateEditor.ts` and
  `../plate/packages/core/src/react/editor/withPlate.ts`.
- Plate autoformat is now explicitly inert/deprecated and says new behavior
  belongs in feature-owned `inputRules` in
  `../plate/packages/autoformat/src/plugin.ts`.
- slate-yjs current source depends on local/remote origins, operation batching,
  stored relative positions, and history selection snapshots in
  `../slate-yjs/packages/core/src/plugins/withYjs.ts`,
  `../slate-yjs/packages/core/src/utils/position.ts`, and
  `../slate-yjs/packages/core/src/plugins/withYHistory.ts`.
- Slate v2 current source already exposes `editor.read`, `editor.update`,
  extension `state`/`tx`, commands, commit listeners, metadata, operations,
  bookmarks, and selection impact metadata in
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`.
- Lexical confirms command listeners, dirty node tracking, root/decorator/update
  listeners, and read/update lifecycle are worth stealing structurally.
- ProseMirror confirms transactions should own document changes, selection,
  stored marks, metadata, paste/input tags, scroll intent, and the DOM selection
  bridge.
- Tiptap confirms extension-owned commands, keyboard shortcuts, input rules,
  paste rules, and React selector posture are good DX, but its chain-first
  command surface is not the raw Slate target.
- React 19.2 compiled evidence keeps `useSyncExternalStore` and background UI
  as projection/overlay tools, not editor-core invalidation.

### Maintainer Lenses

| Maintainer lens             | Objection                                                                                                        | Ecosystem answer                                                                                                                                                                                        | Required plan constraint                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Plate plugin maintainer     | If Slate React owns renderers and rules, Plate plugins lose their product-level home.                            | Slate React owns primitive registration/routing only. Plate owns rich feature packaging, `api`/`tf`, kits, toolbar behavior, table policy, comboboxes, URL trust, and opinionated rule families.        | Renderer specs and rule events must be consumable by Plate without copying Plate's public naming into raw Slate.       |
| Plate input-rule maintainer | A generic rule surface could recreate old autoformat as a central junk drawer.                                   | Current Plate source points the other way: feature-owned `inputRules`, inert legacy autoformat. Slate should match that direction.                                                                      | No central Markdown/autoformat/product rule pack in raw Slate React.                                                   |
| slate-yjs maintainer        | Renderer and projection APIs do not matter unless operations, origin, selection, and anchors stay deterministic. | Correct. Runtime ids, shells, hidden anchors, DOM selection, and React projections remain local. Synced truth is operations, document content, typed node state, origins, and durable relative anchors. | Command/rule execution must preserve update metadata and not bypass operation batching or selection/history snapshots. |
| Legacy Slate maintainer     | New APIs can make raw render props and DOM handlers feel obsolete.                                               | Raw `renderElement`, `renderLeaf`, `onKeyDown`, `onDOMBeforeInput`, and paste handlers stay public control surfaces. Docs can demote them from beginner path without calling them legacy.               | Execution must keep raw escape-hatch tests and reference docs.                                                         |
| Lexical maintainer          | Command/rule APIs without priority and update boundaries become inconsistent.                                    | Slate already has `editor.update`, command registration, dirty metadata, and commit listeners. This plan should use those, not app-level event callbacks.                                               | Command/rule work must run through editor update/command metadata, not ad hoc DOM-only branching.                      |
| ProseMirror maintainer      | DOM input, selection import/export, scroll intent, and composition are the real hard parts.                      | Agree. The plan cannot claim browser correctness from API shape. It needs the browser/native matrix from pass 8 and must keep DOM selection bridge ownership inside Slate React.                        | Browser proof remains a closure blocker.                                                                               |
| Tiptap maintainer           | Developers want extension packaging, commands, keyboard shortcuts, input and paste rules.                        | Use this as DX pressure, not engine authority. Slate should expose primitives; Plate/plugin packages can productize them.                                                                               | Avoid chain-first command catalogs and feature-specific product APIs in raw Slate.                                     |
| React/runtime maintainer    | Removing `useCallback` is invalid if the library still depends on prop identity.                                 | Correct. Remove memoization from examples only where Slate React owns identity through specs, command routing, normalized options, or external stores.                                                  | Docs grep must be paired with render/projection proof.                                                                 |

### Plan Deltas From Ecosystem Review

Accepted deltas:

- Add a hard constraint that command/rule execution preserves update metadata,
  origins, operation batching, and selection/history snapshots.
- Strengthen the Plate migration target: Slate React provides primitives Plate
  can consume; it does not mimic Plate `api`/`tf` or ship Plate product policy.
- Strengthen the docs target: raw handlers/render props are valid reference
  APIs, not deprecated paths.
- Keep optional projection split out of release blockers because slate-yjs cares
  about durable anchors and source dirtiness, not a comment-example overload.
- Require browser-native proof to remain a closure blocker, even though the API
  direction is now ecosystem-consistent.

Rejected deltas:

- Do not move rich Markdown, table, URL, mention, toolbar, or paste policy into
  raw Slate React.
- Do not make `editor.commands` or chain-style Tiptap APIs the public raw Slate
  shape.
- Do not make renderer registration a replacement for raw render props.
- Do not make React Compiler, `useCallback`, or `useMemo` part of the public
  correctness story.
- Do not claim slate-yjs readiness from React projection improvements.

### Ecosystem Closure Matrix

| Surface                          | Ecosystem verdict              | Closure requirement                                                                           |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| Renderer registration            | Keep as Slate React primitive. | Additive API, raw renderer parity, bounded rerender proof, Plate-consumable spec shape.       |
| `onCommand` and rule routing     | Keep, but metadata-aware.      | Command/update metadata, raw fallback, keyboard/native input tests, no product rule registry. |
| Rendering strategy normalization | Keep.                          | Primitive option equivalence, stable metrics, no degraded-mode native behavior regression.    |
| Projection overload              | Optional/defer.                | Only land if generic and metadata/anchor-safe; not required for issue or release claims.      |
| Lazy initialization              | Docs-first.                    | Lazy `useState` docs; no collaboration/provider claim without core proof.                     |
| Issue claims                     | Defer.                         | Pass 11 must sync ledgers after execution proof, not planning confidence.                     |

Pass 9 score update:

| Dimension                              | Previous | Current | Reason                                                                                                    |
| -------------------------------------- | -------: | ------: | --------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |     0.87 |    0.88 | React evidence is now tied to external-store/projection limits and not used as a core invalidation crutch |
| Slate-close unopinionated DX           |     0.88 |    0.90 | raw escape hatches and primitive-only Slate React ownership are now explicit                              |
| Plate and slate-yjs migration backbone |     0.82 |    0.87 | Plate feature ownership and slate-yjs origin/anchor/metadata constraints are now concrete                 |
| Regression-proof testing strategy      |     0.82 |    0.84 | browser/native proof stays below threshold until execution proof exists                                   |
| Research evidence completeness         |     0.86 |    0.89 | local ecosystem sources and compiled decisions now cover the remaining migration objection                |
| shadcn-style composability/minimalism  |     0.87 |    0.89 | optional projection and product rule APIs remain out of the required core shape                           |

Weighted score: `0.90`.

## Revision Pass

Status: complete.

This pass folded the accepted deltas from passes 6 through 9 back into the
front of the plan so the handoff does not lie by omission. The earlier draft
still made projection and lazy `initialValue` sound more central than the later
review allowed. That is fixed.

Coherence review:

| Area checked       | Finding                                                                                        | Revision                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Top-level verdict  | "Projection-store APIs" sounded like a required library leak.                                  | Reworded as a lower-priority smell, not a release blocker.                                       |
| Section heading    | "Strong Hard Cuts" included conditional work.                                                  | Renamed to "Hard Cuts And Conditional Cleanups".                                                 |
| Projection hooks   | Opening target said to add projector overloads.                                                | Rewritten as optional: only if tiny, generic, metadata-safe, and better than a shared helper.    |
| Lazy initial value | Opening target suggested lazy `initialValue` support.                                          | Rewritten to docs-first lazy `useState`; core overload is not required.                          |
| Full inventory     | Projection rows and saving docs looked like required API work.                                 | Reclassified projection as optional and saving docs as a strong docs cut.                        |
| Execution order    | Optional projection appeared before lazy docs cleanup and safe-helper cleanup.                 | Reordered to required rows first, then optional projection, then docs-first lazy initialization. |
| Decision brief     | Chosen direction still said "add projector overloads" and "prefer lazy initial value support". | Rewritten to optional projection and lazy `useState` docs.                                       |
| Research synthesis | Pass 5 still called projection overloads valid without the later downgrade.                    | Rewritten as plausible but optional after later pressure passes.                                 |

Scope review:

| Scope question                                 | Answer                                                                                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is the plan still right-sized?                 | Yes. Required execution is three rows: renderer registration, command/rule routing, and rendering-strategy normalization.                                                                     |
| Does any abstraction fail to earn its keep?    | Projection overload is not yet proven; it stays optional. Core lazy `initialValue` does not earn its keep for one walkthrough.                                                                |
| Does Plate product policy leak into raw Slate? | No after revision. Rule machinery stays primitive and feature-owned; Plate/plugin packages own rich behavior.                                                                                 |
| Does slate-yjs get overpromised?               | No after revision. Projection improvements do not imply collaboration readiness; origins, operations, metadata, durable anchors, and selection/history snapshots remain the real constraints. |
| Does any issue claim move from planning alone? | No. Pass 11 still owns sync accounting.                                                                                                                                                       |

Final execution handoff shape for `ralph`:

1. Renderer registration and render docs.
2. Command/rule routing and editing examples, preserving command/update
   metadata, origins, operation batching, selection/history snapshots, and raw
   handler fallback.
3. Rendering strategy primitive normalization.
4. Docs-first lazy initialization with lazy `useState`.
5. Optional projection overload only if implementation proves it is tiny,
   generic, metadata-safe, and better than a shared helper.
6. Opportunistic safe URL/helper and trivial callback cleanup only after the
   architecture rows.

Pass 10 score update:

| Dimension                              | Previous | Current | Reason                                                                                               |
| -------------------------------------- | -------: | ------: | ---------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |     0.88 |    0.89 | execution rows now separate required hot-path identity fixes from optional projection cleanup        |
| Slate-close unopinionated DX           |     0.90 |    0.91 | raw escape hatches and docs-first lazy initialization are clearer                                    |
| Plate and slate-yjs migration backbone |     0.87 |    0.88 | handoff now preserves feature ownership, metadata, origins, batching, and durable-anchor constraints |
| Regression-proof testing strategy      |     0.84 |    0.85 | revision removed contradictory proof scope and kept browser/native proof as a closure blocker        |
| Research evidence completeness         |     0.89 |    0.90 | current plan text now matches the evidence gathered in passes 5 through 9                            |
| shadcn-style composability/minimalism  |     0.89 |    0.90 | optional API work stays optional and required public surface is smaller                              |

Weighted score: `0.91`.

## Completion

This planning lane is complete. The old keydown-only plan is now a subset of
this broader memoization hard-cut plan.

## Issue Sync Accounting Pass

Status: complete.

Read evidence:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

Issue sync result:

| Issue   | Current sync state                       | Closure decision                                                                 |
| ------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| `#5181` | `cluster-synced`, Related                | unchanged; exact stale `onChange` / editor replacement repro is not closed       |
| `#4317` | `cluster-synced`, Related                | unchanged; render-callback selection churn remains adjacent pressure             |
| `#5961` | `triage-closed`, Not claimed             | unchanged; needs current repro before v2 work earns claim weight                 |
| `#5928` | `triage-closed`, Not claimed             | unchanged; mobile slash-command keydown needs mobile/browser proof               |
| `#5994` | `issue-reviewed`, Not claimed            | unchanged; mentions popup behavior is app UI or future combobox/plugin work      |
| `#5987` | `improves-claimed`                       | unchanged; exact async decoration app repro is not auto-closed                   |
| `#4483` | `improves-claimed`                       | unchanged; projection stores improve the class, not the exact legacy API request |
| `#3382` | `improves-claimed`                       | unchanged; legacy `Text.decorations` API parity is not claimed                   |
| `#3352` | `improves-claimed`                       | unchanged; decorator callback API parity is not claimed                          |
| `#3656` | `improves-claimed`                       | unchanged; existing rerender benchmark owns the claim                            |
| `#4141` | `improves-claimed`                       | unchanged; existing deep rerender benchmark owns the claim                       |
| `#2051` | `cluster-synced` / coverage `Improves`   | unchanged; exact leaf-rerender closure needs execution proof                     |
| `#790`  | `cluster-synced`                         | unchanged; virtualization remains experimental and benchmark-gated               |
| `#2465` | `cluster-synced` / matrix-only non-claim | unchanged; mark rendering ergonomics is related but not fixed                    |
| `#6013` | `fixes-claimed`                          | unchanged fixed claim; lazy docs must not broaden it                             |
| `#5605` | `fixes-claimed`                          | unchanged fixed claim; provider-level initialization remains the owner           |
| `#5709` | `fixes-claimed`                          | unchanged fixed claim; replacement editor propagation remains the owner          |
| `#6016` | `triage-closed`                          | unchanged non-claim; reopen only with a current minimal repro                    |
| `#4268` | `issue-reviewed`                         | unchanged docs/example-only row                                                  |
| `#2560` | `issue-reviewed`                         | unchanged docs/example-only row                                                  |
| `#4569` | `fixes-claimed`                          | unchanged fixed claim; paste-rule docs must preserve insertData fallback wording |

Claim changes:

- New `Fixes` claims: 0.
- New `Improves` promotions: 0.
- Fixed/improved demotions: 0.
- Manual sync ledger changes: 0.
- Coverage matrix changes: 0.
- Fork dossier changes: 0.
- PR reference changes: 0.

`pr-description unchanged`: this pass changes the execution plan and proof
expectations only. It changes no exact fixed issue claim, accepted public API
shape in the PR reference, proof status, release gate, example row, or
maintainer-facing PR narrative.

## Closure Score And Final Gates

Status: complete.

Final score:

| Dimension                              | Score | Closure reason                                                                                                                                                    |
| -------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.93 | Required work is narrowed to renderer registration, command/rule routing, and rendering-strategy normalization, with repeated-unit and browser proof gates named. |
| Slate-close unopinionated DX           |  0.94 | Raw render props and raw handlers stay public; the default docs path stops making React memoization the happy path.                                               |
| Plate and slate-yjs migration backbone |  0.91 | Plate owns product APIs; slate-yjs constraints stay on operation metadata, origins, batching, durable anchors, and selection/history snapshots.                   |
| Regression-proof testing strategy      |  0.90 | Unit, docs-grep, example, browser/native, performance, and issue-claim gates are named without claiming implementation proof.                                     |
| Research evidence completeness         |  0.93 | Lexical, ProseMirror, Tiptap, React, Plate, slate-yjs, live Slate v2 source, and issue ledgers all feed concrete plan decisions.                                  |
| shadcn-style composability/minimalism  |  0.92 | Optional projection and lazy initializer work are split out; required public surface stays smaller.                                                               |

Weighted score: `0.92`.

Final gate audit:

- pass schedule: complete
- pass-state ledger: complete
- issue sync accounting: complete with no claim changes
- PR reference sync: unchanged with reason recorded
- objection ledger: accepted or downgraded into plan deltas
- high-risk deliberate mode: complete
- ecosystem maintainer pass: complete
- final execution handoff: complete
- final user-review handoff: complete
- Slate v2 verification claim: no implementation behavior claim is made from
  this planning pass; execution proof is assigned to `ralph`

## Done Handoff

Slate Ralplan is ready for user review:
`docs/plans/2026-05-14-slate-v2-example-memoization-hard-cut-ralplan.md`

Decisions:

- Public API: add Slate React renderer registration/capability for element,
  leaf, text, and segment rendering; raw render props remain public escape
  hatches.
- Public API: keep `renderElement`, `renderLeaf`, `renderText`, and
  `renderSegment`; stop teaching user `useCallback` as the beginner fix for
  renderer identity.
- Public API: keep `onCommand` as the clean semantic command boundary; do not
  rename to `onEditableCommand`.
- Public API: do not add a raw Slate command catalog or Tiptap-style chain API.
- Editing behavior: move table, markdown, format, paste, Enter, Backspace, and
  Delete example behavior toward command/rule capabilities where Slate React
  owns routing mechanics.
- Editing behavior: keep raw `onKeyDown`, `onDOMBeforeInput`, and paste
  handlers as supported advanced escape hatches, with fallback tests.
- Editing behavior: runtime owns Android pending diff flushing if the command
  and rule path touches that behavior.
- Input rules: keep rule machinery primitive and feature-owned; Plate/plugin
  packages own rich markdown, table, link, mention, toolbar, and product rule
  families.
- React/runtime: normalize `renderingStrategy` option objects by primitive
  fields so examples can inline equivalent objects without identity churn.
- React/runtime: remove memoization from public examples only where Slate React
  owns identity; keep real app UI, overlay, benchmark, and test-harness
  memoization where it is an implementation detail.
- Projection: split/defer projector overloads; land only if the overload is
  tiny, generic, metadata-safe, avoids broad reprojection, and beats a shared
  helper.
- Projection: do not claim projection improvements imply slate-yjs readiness;
  React projections remain local runtime facts.
- Initialization docs: replace one-shot `useMemo(..., [])` localStorage reads
  with lazy `useState`.
- Initialization API: do not add core lazy `initialValue` just to clean one
  walkthrough; only accept it if implementation proves it is tiny and already
  safe.
- Docs: beginner rendering docs should teach renderer registration or top-level
  stable components first; raw render props stay documented as valid control
  surfaces.
- Docs: performance docs should describe library-owned identity and proof gates,
  not push callback stabilization as normal user ceremony.
- Weak cuts: URL sanitization helpers in embeds, paste-html, and inlines stay
  app/example utilities, not Slate core or Slate React API.
- Weak cuts: mentions popup keydown, iframe blur, debug buttons, and huge-doc
  controls remain app/demo UI state, not library-owned architecture.
- Plate migration: expose primitive renderer/rule/command shapes that Plate can
  package, without copying current Plate `editor.api` / `editor.tf` naming into
  raw Slate.
- slate-yjs migration: preserve update metadata, origins, operation batching,
  durable anchors, and selection/history snapshots through command/rule work.
- Browser proof: require native input, IME-sensitive beforeinput, Android
  pending diff if touched, paste, select-all/copy, and staged/virtualized
  degraded-mode classification before implementation closure.
- Performance proof: require repeated-unit budgets for unchanged block, text,
  leaf, event listener count, rule dispatch cost, strategy metric stability,
  and projection refresh count if projection lands.
- TDD proof: first red tests should cover renderer registration/raw escape
  hatch, command latest-handler/fallback semantics, input-rule order/fallback,
  rendering-strategy primitive normalization, and docs grep.
- Issue accounting: no new `Fixes` or `Improves` claims from this planning
  pass.
- Issue accounting: keep `#5181`, `#4317`, `#5961`, `#5928`, `#5994`, `#5987`,
  `#4483`, `#3382`, `#3352`, `#3656`, `#4141`, `#2051`, `#790`, `#2465`,
  `#6016`, `#4268`, and `#2560` at their current related/improves/non-claim
  statuses until execution proof changes them.
- Issue accounting: keep existing fixed claims `#6013`, `#5605`, `#5709`, and
  `#4569` unchanged; this plan must not broaden them.
- Hard cut: do not start with safe URL cleanup; it is easiest and least
  important.
- Hard cut: do not delete every `useCallback` / `useMemo`; only cut the ones
  caused by missing Slate React ownership.
- Hard cut: do not put product behavior in raw Slate React to make examples
  prettier.
- Execution order: renderer registration and render docs first.
- Execution order: command/rule routing and editing examples second.
- Execution order: rendering strategy primitive normalization third.
- Execution order: docs-first lazy initialization fourth.
- Execution order: optional projection fifth, only if it earns its API weight.
- Execution order: opportunistic helper/trivial callback cleanup last.

## Ralph Execution Ledger

Status: `done`
Runtime state: `.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/completion-check.md`
Continuation prompt: `.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/continue.md`

Activation:

- 2026-05-14: User invoked `$ralph` for the full plan.
- Thread goal set around the desired Slate v2 end state.
- Completion state reopened from planning `done` to Ralph execution `pending`.

Execution slices:

- `ralph-execution-slice-1-renderer-registration-and-docs`: complete.
  Added `editableRenderers(...)`, consumed registered renderers in `Editable`,
  and moved beginner docs away from `useCallback` renderer guidance.
- `ralph-execution-slice-2-command-rule-routing`: complete. Added
  `editableKeyCommands(...)`, made `onCommand` keydown-complete, and moved
  strong command/rule examples off memoized callback props.
- `ralph-execution-slice-3-rendering-strategy-normalization`: complete.
  Normalized rendering-strategy option objects by primitive fields and removed
  the example `renderingStrategy` memo.
- `ralph-execution-slice-4-lazy-initial-value-docs`: complete. Replaced
  localStorage one-shot `useMemo` docs with lazy `useState`.
- `ralph-execution-slice-5-optional-projection-overload-review`: complete.
  Added generic projector overloads to annotation/widget hooks and removed
  projection-array `useMemo` from comment examples.
- `ralph-execution-slice-6-opportunistic-weak-cut-cleanup`: complete. Moved
  `iframe`, `images`, and `richtext` hotkeys to registered key commands; left
  URL parsing, popup keys, cursor movement, and demo controls app-owned.
- `ralph-execution-slice-7-reference-and-issue-accounting-sync`: complete.
  Synced PR reference and issue ledgers without adding fixed/improved claims.
- `ralph-execution-slice-8-final-verification`: complete. Added the missing
  core bookmark `replace_children` fix/regression needed by the projection
  overload, then ran package, typecheck, lint, and scoped browser proof.

Closeout:

- `completion-closeout`
- Owner: `.tmp/slate-v2` package, site, lint, browser, and `plate-2` checkpoint
  gates.
- Result: scoped checkpoint set to `done` after all in-scope implementation,
  reference sync, compound note, and verification gates closed.

Final verification:

- Green: `cd /Users/zbeyens/git/slate-v2/packages/slate && bun test ./test/bookmark-contract.ts ./test/collab-canonical-reconcile-contract.ts ./test/collab-bookmark-position-contract.ts` (18 passed).
- Green: `cd /Users/zbeyens/git/slate-v2/packages/slate-react && bun test:vitest test/annotation-store-contract.test.tsx test/widget-layer-contract.test.tsx test/surface-contract.test.tsx test/keyboard-input-strategy-contract.test.ts` (46 passed).
- Green: `cd /Users/zbeyens/git/slate-v2 && bun --filter slate typecheck`.
- Green: `cd /Users/zbeyens/git/slate-v2 && bun --filter slate-react typecheck`.
- Green: `cd /Users/zbeyens/git/slate-v2 && bun typecheck:site`.
- Green: `cd /Users/zbeyens/git/slate-v2 && bun typecheck:root`.
- Green: `cd /Users/zbeyens/git/slate-v2 && bun lint:fix`.
- Green: `cd /Users/zbeyens/git/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium` (1 passed).
- Green: `cd /Users/zbeyens/git/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/code-highlighting.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/tables.test.ts playwright/integration/examples/iframe.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/collaborative-comments.test.ts playwright/integration/examples/review-comments.test.ts playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium` (56 passed).
- Green: `cd /Users/zbeyens/git/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/rendering-strategy-runtime.test.ts playwright/integration/examples/richtext.test.ts --project=chromium -g "keeps DOM-owned text sync explicit and opt-out safe|proves DOM-present rendering-strategy input can use real browser-native typing|renders the full TanStack-backed experimental virtualized example with bounded DOM|exposes TanStack-backed experimental virtualized controls and warning|applies mark hotkeys to inserted rich text and clears active marks|applies block, alignment, and clear-formatting hotkeys|records core command metadata for keydown movement|records kernel policies for browser command and repair traces|records a soft break command for Shift\\+Enter"` (9 passed).
- Residual out-of-scope: the broader browser sweep over the same files produced
  168 passed, 3 skipped, and 5 failed; rerun narrowed this to 4 deterministic
  IME/native composition rows, while the native word-delete row passed on
  rerun. Those failures are not renderer registration, key-command routing,
  rendering-strategy option identity, projection, or bookmark-anchor proof.
