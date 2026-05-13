# Slate v2 UseElementSelected Collapsed Mode Ralplan

Date: 2026-05-12

Status: `done`

Owner: `slate-ralplan`

Completion:
`.tmp/019e1c53-3e25-78c0-9083-355925be3817/completion-check.md`

## Current Verdict

Yes, the image example selector is weird.

It is semantically intentional but architecturally the wrong teaching surface.
The example needs "selected only when the caret is collapsed inside this block
void", because the image browser contract explicitly expects select-all to
include the image without drawing the image selected ring. But app authors should
not have to write path math and raw `useEditorSelector` to express that.

Accepted target: keep `useElementSelected()` as the default
"selection intersects this element" hook, and add a collapsed-selection mode for
the block-void/image case through an options object:

```tsx
const selected = useElementSelected({ mode: 'collapsed' })
```

Explicit watched paths use `useElementSelected({ at: path })`. Do not keep a
positional path overload.

Do not change the default semantics of `useElementSelected()`. Do not keep the
manual selector in examples as the final API.

## Intent Boundary

| Field | Decision |
| --- | --- |
| Intent | Decide whether the image example should use `useElementSelected()` or keep a custom collapsed-selection selector after the render `path` hard cut. |
| Desired outcome | A `ralph` pass can replace the bespoke selector with a small public hook option while preserving browser behavior and selector locality. |
| In scope | `useElementSelected` API shape, image/block-void selected UI, selector invalidation, docs examples, tests. |
| Non-goals | Changing generic element selected semantics, changing focus APIs, broad image behavior rewrite, implementing code in this Slate Ralplan pass. |
| Decision boundary | Slate v2 may add a small unopinionated hook option when the alternative is teaching raw selector/path internals in examples. |
| User decision needed | None. The clean shape is obvious enough: add a mode, keep default behavior. |

## Live Source Evidence

| Surface | Current owner | Current shape | Verdict |
| --- | --- | --- | --- |
| Image example selected UI | `../slate-v2/site/examples/ts/images.tsx:121-134` | `Image` uses `useEditorSelector`, reads current selection, checks `Range.isCollapsed`, calls `editor.dom.findPath(element)`, then compares `selection.anchor.path` to `path.concat(0)`. | Correct behavior, bad public example surface. |
| Generic hook semantics | `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:10-63` | `useElementSelected(options?)` resolves the current path or `options.at` and returns `Range.intersection(Editor.range(editor, selectedPath), selection)`, with deferred runtime-id-scoped update filtering. | Keep as default `intersects` mode. |
| Hook docs | `../slate-v2/docs/libraries/slate-react/hooks.md:80-84` | Hook is documented as "intersects the current selection." | Accurate, but missing collapsed mode. |
| Legacy Slate | `../slate/packages/slate-react/src/hooks/use-selected.ts:21-36` | Legacy `useSelected()` also uses `Range.intersection`. | Do not silently change default semantics. |
| Select-all image contract | `../slate-v2/playwright/integration/examples/images.test.ts:186-220` | Select-all from text selects across image content but expects first image `boxShadow` to be `none`. | Requires collapsed-only UI for image ring. |
| Arrow into image contract | `../slate-v2/playwright/integration/examples/images.test.ts:391-409` | Collapsed selection at `[1,0]` expects first image `boxShadow` not `none`. | Collapsed mode must still select clicked/arrowed void. |
| Selector performance | `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:91-96`, `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:59-63` | Raw `useEditorSelector` defaults to global updates unless options are supplied; `useElementSelected` supplies deferred/profile/`shouldUpdate` filtering. | The snippet is not the optimized shape. |
| Stale test smell | `../slate-v2/packages/slate-react/test/use-element-selected.test.tsx:143-169` | A test still destructures `path` from `RenderElementProps` despite the public render-prop hard cut. | Clean during Ralph; use event-time `editor.dom.findPath(element)` or the new hook option. |

## Decision Brief

Principles:

- A public example should not teach raw selector plumbing for normal selected UI.
- `useElementSelected()` must stay Slate-close and legacy-compatible by default.
- Collapsed-only block-void UI is a real selection mode, not a product opinion.
- Selector performance should stay runtime-id scoped.

Top drivers:

- Images need collapsed-only selected UI because expanded select-all should not
  draw the image ring.
- Mentions, links, paste-html images, and normal elements still need the current
  intersection semantics.
- The bespoke selector bypasses `useElementSelected`'s deferred/runtime-id
  update policy.

Options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep the custom selector in `images.tsx` | No API change; behavior remains correct. | Weird public example, path math leaks into app code, global selector updates. | Reject. |
| Replace with `useElementSelected()` | Cleaner example; optimized hook. | Regresses select-all image browser contract by highlighting the image during expanded selection. | Reject. |
| Change `useElementSelected()` default to collapsed-only | Makes images clean. | Breaks legacy semantics and every element that expects intersection selected state. | Reject. |
| Add `useElementSelected({ mode: 'collapsed' })` | Small API, preserves default, keeps performance ownership inside hook, fixes example weirdness. | Slightly wider hook signature. | Choose. |
| Add separate `useElementCaretSelected()` hook | Very explicit. | More public API names for a narrow variant. | Reject for now. |

## Public API Target

Keep:

```tsx
const selected = useElementSelected()
const selected = useElementSelected({ at: path })
```

Add:

```tsx
const selected = useElementSelected({ mode: 'collapsed' })
const selected = useElementSelected({ at: path, mode: 'collapsed' })
```

Semantics:

- `mode: 'intersects'` is the default and matches current `useElementSelected()`.
- `mode: 'collapsed'` returns `false` unless the selection is collapsed.
- For collapsed mode, resolve the target element path the same way as the
  default hook, then use the element range intersection against the collapsed
  selection. Do not hardcode `path.concat(0)` in app code.
- Keep missing/removed target behavior fail-closed to `false`.

## Internal Runtime Target

Implementation owner: later `ralph`.

- Accept an options object only; explicit paths use `at`.
- Preserve the existing deferred selector and `selectionImpactRuntimeIds`
  update filtering.
- Include `mode` and `at` in selector dependencies.
- Do not wake all mounted elements for collapsed mode.
- Do not expose runtime id in public options.

## Hook / Render DX Target

Image example target:

```tsx
const selected = useElementSelected({ mode: 'collapsed' })
```

Keep event-time `editor.dom.findPath(element)` for delete/update handlers, not
for selected UI.

## Issue Ledger Accounting

ClawSweeper related-issue pass: skipped for this pass because this is a narrow
hook/example API polish on surfaces already covered by:

- `docs/plans/2026-05-08-slate-v2-use-element-selected-self-removal-ralplan.md`
- `docs/plans/2026-05-12-slate-v2-render-path-prop-performance-ralplan.md`

No new `Fixes #...` claim.

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #6053 | singleton-react-runtime | Preserved fixed claim | This plan preserves `useElementSelected` as the issue-facing selected-state hook; the new mode is additive and should not weaken self-removal or stale-path behavior. | `use-element-selected.test.tsx`, image browser rows | unchanged | unchanged |

PR reference sync: unchanged for this planning pass. A later Ralph execution
that changes the hook signature and image example must update
`docs/slate-v2/references/pr-description.md` under public API / examples.

## Regression Proof Matrix

| Contract | Must prove |
| --- | --- |
| Default `useElementSelected()` | Still returns true for expanded selection intersecting the element. |
| `useElementSelected({ mode: 'collapsed' })` | Returns true for collapsed selection inside the element and false for expanded selection crossing it. |
| `useElementSelected({ at: path })` | Watches an explicit path without relying on an element render context. |
| Image select-all | `images.test.ts` select-all row keeps image `boxShadow` as `none`. |
| Image arrow/click selection | Arrow or click into image still gives selected ring and delete affordance. |
| Removed target | Existing `useElementSelected` removed-path/self-removal tests remain green. |
| Path-shift | Current shifted selected element tests remain green with default and collapsed modes. |
| Performance | Collapsed mode uses the same deferred/runtime-id scoped selector policy as default mode. |

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `vercel-react-best-practices` | applied | The raw selector is a global editor selector; the public hook already owns narrower update policy. | Move collapsed semantics into `useElementSelected`. |
| `performance-oracle` | applied | The cost risk is repeated selected probes in large repeated void surfaces. | Preserve runtime-id scoped update filtering; do not keep ad hoc selectors. |
| `performance` | applied | Repeated-unit budget is "one selected probe per void element, no all-node render fanout." | Add performance proof row. |
| `tdd` | applied | Behavior split is exact and browser-observable: select-all false, collapsed image true. | Add hook unit rows and image browser rows before implementation closure. |
| `build-web-apps:shadcn` | skipped | No UI component/chrome design change. | None. |
| `react-useeffect` | skipped | No effect lifecycle decision. | None. |

## High-Risk Deliberate Mode

Triggered because this changes public hook API.

Pre-mortem:

1. Option object makes the simple hook feel heavier.
2. Collapsed mode accidentally changes default intersection behavior.
3. Collapsed mode loses selector locality and wakes too many elements.

Proof plan:

- type-level or runtime test for default/intersects compatibility;
- unit test for collapsed true/false cases;
- existing self-removal/stale path tests;
- image browser select-all and image collapsed selection rows;
- focused `slate-react` typecheck.

## Slate Maintainer Objection Ledger

| Change | Likely objection | Steelman antithesis | Tradeoff tension | Answer | Verdict |
| --- | --- | --- | --- | --- | --- |
| Add `useElementSelected({ mode: 'collapsed' })` | "Why add options to a tiny hook?" | A one-off image selector avoids widening the API. | Slightly more public API to document. | The image behavior is first-party and browser-proven; raw selector/path math in examples is worse DX and worse selector locality. | keep |
| Keep default intersection semantics | "Images want collapsed only, so make selected mean collapsed." | Simpler mental model for block voids. | Other element UIs rely on broad selection intersection. | Legacy Slate and current docs define selected as intersection; collapsed mode is the special case. | keep |

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.94 | Current custom selector lacks the hook's `shouldUpdate` options; target preserves hook-owned deferred/runtime-id filtering. |
| Slate-close unopinionated DX | 0.94 | Default hook remains legacy-like intersection; collapsed mode replaces app path math with a small option. |
| Plate and slate-yjs migration-backbone shape | 0.90 | Additive hook option does not affect core operations/collab; Plate can wrap it without product policy in Slate. |
| Regression-proof testing strategy | 0.93 | Browser rows and unit rows are named for both select-all false and collapsed image true, plus existing stale-path/self-removal hook rows. |
| Research evidence completeness | 0.92 | Live v2 source, legacy Slate source, browser rows, and prior solution/plan evidence are enough; Lexical/ProseMirror are not relevant to this hook-mode API. |
| shadcn-style composability and hook/component minimalism | 0.93 | One option beats a new hook name and beats raw selector code in examples. |

Weighted total: `0.93`.

Status: `done`.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | images example, hook source, docs, legacy Slate, image browser rows, selector implementation | accepted target: collapsed mode option | closure/revision pass still needed before marking ready | slate-ralplan |
| Closure score and final gates | complete | option wording, issue/accounting skip, final Ralph gates | plan ready for user review; no implementation edits | none | ralph after user approval |
| Ralph execution start | complete | `.tmp/019e1c53-3e25-78c0-9083-355925be3817/completion-check.md`; `.tmp/019e1c53-3e25-78c0-9083-355925be3817/continue.md` | reopened scoped completion state as pending; started hook tests and implementation | none | ralph |
| Ralph hook implementation | complete | red hook test failed before implementation; focused `use-element-selected` test passes after implementation | added collapsed mode API, migrated image example, synced docs/reference/changeset | none | verification |
| Ralph verification closeout | complete | `bun --filter slate-react test:vitest -- use-element-selected`; `bun --filter slate-react test:vitest -- surface-contract -t useElementSelected`; `bun --filter slate-react typecheck`; `site`: `bun x tsc --project tsconfig.json --noEmit`; `bun lint:fix`; Chromium `images.test.ts` | all focused gates passed | none | done |
| Options-only API cleanup | complete | user review rejected `Path | UseElementSelectedOptions` as weird; focused hook test, surface contract, package typecheck, site typecheck, and lint-fix passed | hard-cut positional path overload; explicit paths stay as `{ at: path }` | none | done |

## Implementation Phases For Ralph

1. Add `UseElementSelectedOptions`; keep the public signature options-only.
2. Implement `mode: 'collapsed'` inside the existing selector, preserving
   deferred/runtime-id `shouldUpdate` behavior.
3. Add focused `useElementSelected` tests for default/intersects and collapsed
   mode.
4. Replace the image example's raw selector with
   `useElementSelected({ mode: 'collapsed' })`.
5. Remove lingering test destructuring of `path` from `RenderElementProps`.
6. Update hook docs and PR reference public API/example rows.
7. Verify from `../slate-v2`:

```bash
cd /Users/zbeyens/git/slate-v2
bun --filter slate-react test:vitest -- use-element-selected
bun --filter slate-react typecheck
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/images.test.ts --project=chromium
```

## Plan Deltas From Review

- Added accepted target `useElementSelected({ mode: 'collapsed' })`.
- Cut positional `useElementSelected(path)` in favor of
  `useElementSelected({ at: path })`.
- Rejected replacing the image selector with default `useElementSelected()`
  because the select-all browser row expects no image ring.
- Rejected changing default `useElementSelected()` semantics because legacy
  Slate and current docs define selected as range intersection.
- Recorded the raw selector as a performance/DX smell, not the best
  optimization.
- Added a Ralph cleanup item for the lingering `RenderElementProps.path`
  destructure in `use-element-selected.test.tsx`.

## Final Completion Gates

- Closure pass accepts `useElementSelected({ mode: 'collapsed' })` as the target.
- No new fixed issue claim is made.
- `docs/slate-v2/references/pr-description.md` owner is explicit for later
  execution.
- Plan score reaches `0.94`.
- Ralph execution completed the hook API, image example migration, docs,
  reference sync, and changeset.
- Follow-up Ralph cleanup removed the positional path overload and kept
  explicit paths under `useElementSelected({ at: path })`.
- Focused Slate v2 hook tests, surface test, typecheck, site typecheck,
  lint-fix, and Chromium image browser rows pass.
