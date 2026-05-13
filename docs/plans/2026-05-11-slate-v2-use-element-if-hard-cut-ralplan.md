---
date: 2026-05-11
topic: slate-v2-use-element-if-hard-cut-ralplan
status: done
source: slate-ralplan
score: 0.93
---

# Slate v2 `useElementIf` Hard-Cut Ralplan

## Current Verdict

Yes: hard cut `useElementIf` from the public `slate-react` API.

Do not cut the capability. Cut the public name. The optional context read is an
internal implementation detail for hooks like `useElementSelected(path?)`, not a
concept users should learn.

This plan is ready for user review and later `ralph` execution. No Slate v2
implementation files were edited by this Slate Ralplan pass.

## Intent And Boundary

- intent: remove a weird public hook before API freeze and keep Slate v2's React
  surface literal, small, and teachable.
- desired outcome: public users choose between strict `useElement()` inside a
  rendered element, selector hooks for mounted node reads, or purpose-built
  hooks like `useElementSelected(path?)`.
- in scope: `slate-react` public exports, hook naming, internal optional
  element context read, docs/examples/proof rows.
- non-goals: changing element render props, changing `useElementSelected`
  behavior, adding compatibility aliases, or touching Plate product APIs.
- decision boundary: `ralph` may remove the public export and refactor the
  internal call site, but should not add a replacement public hook unless a
  downstream usage audit proves a real user case that the selector hooks cannot
  cover.

## Live Source Evidence

- Current public export: `../slate-v2/packages/slate-react/src/index.ts:91`
  exports `useElement` and `useElementIf` from `./hooks/use-element`.
- Current implementation:
  `../slate-v2/packages/slate-react/src/hooks/use-element.ts:10` throws outside
  render-element context, while `:25` returns `useContext(ElementContext)` and
  may be `null`.
- Current only source call site:
  `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts:8` imports
  `useElementIf`; `:10-15` uses it only to support either context element or an
  explicit path.
- Current examples use the real public hook, not `useElementIf`:
  `../slate-v2/site/examples/ts/huge-document.tsx:220`,
  `../slate-v2/site/examples/ts/inlines.tsx:280`,
  `../slate-v2/site/examples/ts/paste-html.tsx:193`, and
  `../slate-v2/site/examples/ts/mentions.tsx:254` use
  `useElementSelected`.
- Current selector backbone:
  `../slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:110-116`
  exposes selector-first `useNodeSelector`, and `:129-144` exposes
  `useTextSelector`.
- Current state selector:
  `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:153-187`
  exposes `useEditorState(selector, options)`.
- Current proof for the adjacent issue lane:
  `../slate-v2/packages/slate-react/test/use-element-selected.test.tsx:30-230`
  proves `useElementSelected` behavior and selected self-removal safety.
- Current issue accounting:
  `docs/slate-v2/ledgers/issue-coverage-matrix.md:73` and `:200` already claim
  `Fixes #6053` for `useElementSelected`, not for `useElementIf`.
- Current PR reference:
  `docs/slate-v2/references/pr-description.md:109-111` mentions
  `useElementSelected`, and `:697` records `useElementSelected(path?)` as the
  accepted current shape. It does not mention `useElementIf`.
- Current Slate v2 verification:
  `bun --filter slate-react typecheck` passed from
  `/Users/zbeyens/git/slate-v2`.

## Decision Brief

Principles:

1. Public hooks should describe stable user intent, not nullable context
   plumbing.
2. A hook that may return `null` must pay for that nullable shape with a real
   public use case.
3. Render-context hooks should be strict by default.
4. Optional reads belong either inside a purpose-built public hook or behind an
   internal helper.
5. Do not preserve weird names only because a legacy changelog listed them.

Top drivers:

- DX clarity: `useElementIf` sounds like a conditional hook and makes users ask
  "if what?"
- Runtime architecture: public users should prefer selector hooks for mounted
  node reads instead of grabbing context opportunistically.
- API freeze pressure: the hook is public but has one internal call site and no
  current examples.

Viable options:

1. Keep `useElementIf`.
   - Pro: zero migration.
   - Con: teaches a nullable render-context escape hatch with no clear user
     story.
2. Rename publicly to `useOptionalElement`.
   - Pro: better name.
   - Con: still exposes a capability users should rarely need.
3. Hard cut the public export and keep an internal optional helper.
   - Pro: smallest public API, keeps `useElementSelected` implementation simple,
     preserves selector-hook direction.
   - Con: any external user importing `useElementIf` must migrate.

Chosen option: option 3.

Rejected alternatives:

- Keep as deprecated alias: rejected. It keeps the weird API visible and creates
  a removal chore.
- Replace with public `useOptionalElement`: rejected until a real downstream
  usage proves selector hooks or explicit path props are insufficient.
- Inline `useContext(ElementContext)` everywhere: rejected if more than one
  internal optional reader appears; acceptable for the current single call site.

## Public API Target

- cut: root export `useElementIf`.
- keep: public `useElement()` as the strict render-element-context hook.
- keep: public `useElementSelected(path?)` as the purpose-built selected
  element hook.
- keep: public `useNodeSelector`, `useTextSelector`, and `useEditorState` for
  selector-based reads.
- internal: either inline `useContext(ElementContext)` in
  `useElementSelected`, or keep a non-exported helper named
  `useOptionalElementContext`.
- no alias: do not ship `useElementIf` as deprecated compatibility surface.

## Migration Answer

For users:

- If inside `renderElement` and the element is required: use `useElement()`.
- If the code only needs selected state: use `useElementSelected(path?)`.
- If outside render-element context and reading mounted node data: use
  `useNodeSelector` with an explicit `runtimeId` or other available context.
- If the user was calling `useElementIf()` just to avoid a throw, pass the
  `path` or element through their component boundary explicitly. Silent `null`
  is the wrong abstraction.

This is a hard cut because Slate v2 is still shaping the public surface. If the
package is treated as already API-frozen, this becomes a one-release deprecation
instead, but that is the weaker call.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Slate target | Verdict |
| --- | --- | --- | --- | --- |
| React | hook model and Vercel React rules applied in this pass | hooks should expose stable intent and avoid extra subscriptions/nullable branches in hot render surfaces | strict context hook plus selector hooks; no nullable public context escape hatch | agree |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:71-90` | product DX gives composable React helpers, but selector hooks carry rerender pressure | keep purpose-built hooks and selector hooks; do not expose accidental context plumbing | partial |
| Slate v2 compiled verdict | `docs/research/decisions/slate-v2-architecture-verdict-after-human-stress-sweep.md:101-108` | public selector hooks stay model-truth-only; runtime-specific shortcuts stay internal | cut public `useElementIf`; keep internal optional read only if needed | agree |

## Issue Accounting

No fixed issue claim changes.

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #6053 | singleton-react-runtime | Preserved fixed claim | `useElementSelected()` self-removal proof is the issue-facing hook behavior; `useElementIf` is only an internal support detail. | `../slate-v2/packages/slate-react/test/use-element-selected.test.tsx`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:73` and `:200` | unchanged: `docs/slate-issues/gitcrawl-v2-sync-ledger.md:18` remains `fixes-claimed` | unchanged: `Fixes #6053` stays about `useElementSelected`, not `useElementIf` |

ClawSweeper status: skipped. Existing ledgers already cover the only touched
issue-facing surface, `useElementSelected` / `#6053`; this plan makes no new
fixed/improved issue claim and does not change issue wording.

`docs/slate-v2/references/pr-description.md` status: unchanged. The reference
already names `useElementSelected(path?)` and does not mention `useElementIf`.

## Applicable Review Matrix

- Vercel React: applied. Public hooks should keep subscriptions narrow and
  semantic. `useElementIf` adds a nullable public branch without owning a
  subscription policy.
- performance-oracle: skipped. The cut is API surface cleanup; performance risk
  is indirect and covered by the selector-hook backbone.
- performance: skipped. No benchmark or large-document runtime claim changes.
- tdd: applied. Do not add dead-code removal tests for the old export. Preserve
  behavior through `useElementSelected` and public-surface/typecheck gates.
- shadcn/react-useeffect: skipped. No UI chrome or effect API is being changed.

## High-Risk Pre-Mortem

1. External users imported `useElementIf` for nullable context reads.
   - mitigation: migration note points them to `useElement`, explicit props, or
     selector hooks.
2. `useElementSelected` loses optional outside-context behavior.
   - mitigation: keep the optional context read internal and rerun
     `use-element-selected` tests.
3. The cut accidentally removes `ElementContext` or strict `useElement`.
   - mitigation: only remove root export; do not delete the context or strict
     hook.

Blast radius:

- package export: `../slate-v2/packages/slate-react/src/index.ts`
- hook file: `../slate-v2/packages/slate-react/src/hooks/use-element.ts`
- internal user: `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts`
- proof: `../slate-v2/packages/slate-react/test/use-element-selected.test.tsx`
- docs/examples: only if a search finds public docs/examples mentioning
  `useElementIf`

## Slate Maintainer Objection Ledger

| Change | Likely objection | Steelman antithesis | Tradeoff tension | Rejected alternative | Migration answer | Proof required | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cut public `useElementIf` | "This was just added upstream; why break users?" | A nullable context hook is convenient for custom wrapper components that may mount inside or outside `renderElement`. | Hard cut breaks imports; users must choose a stricter shape. | Deprecation alias, because it keeps the weird name in docs and autocomplete. | `useElement()` inside render-element; `useElementSelected(path?)` for selected state; selector hooks or explicit props outside context. | `rg useElementIf`; `use-element-selected` tests; `slate-react` typecheck; package export/docs scan. | keep |

## Implementation Phases For Ralph

1. Remove `useElementIf` from
   `../slate-v2/packages/slate-react/src/index.ts`.
2. Keep optional element context internal:
   - either inline `useContext(ElementContext)` in `useElementSelected`, or
   - rename the non-exported helper to `useOptionalElementContext`.
3. Search and update any docs/examples outside generated historical changelog
   that still teach `useElementIf`.
4. Preserve `#6053` proof by running selected-element tests.
5. Do not add a test whose only assertion is "old export is gone"; use grep and
   typecheck as the public-surface guard.

## Fast Driver Gates

From `/Users/zbeyens/git/slate-v2`:

```bash
rg -n "useElementIf" packages/slate-react/src packages/slate-react/test site
cd packages/slate-react && bun test:vitest test/use-element-selected.test.tsx test/provider-hooks-contract.test.tsx
bun --filter slate-react typecheck
bun lint:fix
```

From `/Users/zbeyens/git/plate-2`:

```bash
node tooling/scripts/completion-check.mjs
```

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.93 | public nullable context hook cut; selector hooks remain the narrow subscription path |
| Slate-close unopinionated DX | 0.95 | `useElement()` remains strict and literal; `useElementSelected(path?)` owns the selected-state case |
| Plate and slate-yjs migration-backbone shape | 0.90 | no Plate product API added; no collab/data-model surface touched |
| Regression-proof testing strategy | 0.92 | `useElementSelected` proof already covers the behavior; implementation gates preserve it |
| Research evidence completeness | 0.92 | live source plus compiled selector-hook verdict and Tiptap React DX comparison |
| shadcn-style composability and hook minimalism | 0.96 | removes one public accidental hook; keeps purpose-built composable hooks |

Total: `0.93`.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Focused public hook hard-cut review | complete | live `useElementIf` export/implementation/call-site scan, selector-hook source scan, #6053 ledger scan, `slate-react` typecheck | accepted hard cut, no alias, internal optional helper only | none for planning; implementation still belongs to `ralph` | user review, then `ralph` |
| Ralph hard-cut execution | complete | removed public export; renamed internal helper to `useOptionalElementContext`; removed current docs mention; grep returned no current source/doc/dist matches; focused tests, typecheck, build, and lint passed | accepted hard cut executed; `#6053` accounting unchanged | none | none |

## Completion Gates

- Slate Ralplan score `0.93`; no dimension below `0.90`.
- Intent, boundary, decision brief, migration answer, objection row, issue
  accounting, implementation phases, and gates are recorded.
- No Slate v2 implementation code was edited by this skill.
- Completion-check may be `done` for planning. Execution still requires
  explicit `ralph`.
