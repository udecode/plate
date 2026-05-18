# Slate v2 Boolean Mark Key Type Helper Ralplan

## Current Verdict

Yes. The example-local `BooleanTextKey<T>` mapped type is bad DX. It makes the
example teach TypeScript plumbing instead of Slate.

Accepted target: add Slate-owned type helpers for boolean mark keys and boolean
mark objects, then make examples consume those helpers.

This is a type-surface and example-DX plan only. It does not change mark runtime
semantics, transform behavior, React rendering, or collaboration behavior.

## Intent And Boundary

- Intent: keep Slate v2 examples readable while preserving the value-first
  generic type model.
- Desired outcome: example authors can write
  `type CustomTextKey = BooleanMarkKeysOf<CustomText>` without copying mapped
  conditional types into examples.
- In scope: `slate` type exports, generic type contracts, examples that use
  `CustomTextKey`, PR/reference wording, and issue accounting for the related
  TypeScript-formatting DX issue.
- Non-goals: no runtime mark registry, no product-level toolbar API, no Plate
  plugin helper, no hotkey system, no `MarkKeysOf` semantic change, no backward
  compatibility alias.
- Decision boundary: Slate may add tiny type-only helpers when the helper
  expresses a real Slate concept. Slate must not grow runtime opinion just
  because examples are noisy.
- Unresolved user decision points: none.

## Live Current State

Live source proves the bad shape exists now:

```ts
type BooleanTextKey<T> = {
  [K in keyof T]: Exclude<T[K], undefined> extends boolean ? K : never
}[keyof T]

export type CustomTextKey = Extract<BooleanTextKey<CustomText>, string>
```

Source: `../slate-v2/site/examples/ts/custom-types.d.ts`.

The copied type feeds public example helpers:

```ts
type ActiveMarks = Partial<Pick<CustomText, CustomTextKey>>

export const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
  editor.update((tx) => {
    tx.marks.toggle(format)
  })
}
```

Source: `../slate-v2/site/examples/ts/mark-utils.ts`.

Current core already owns adjacent generic mark helpers:

```ts
export type MarksOf<N> = Simplify<UnionToIntersection<TextProps<TextOf<N>>>>
export type MarksIn<V extends readonly unknown[]> = MarksOf<V[number]>
export type MarkKeysOf<N> = {} extends MarksOf<N> ? unknown : keyof MarksOf<N>
```

Source: `../slate-v2/packages/slate/src/interfaces/text.ts`.

Current tests intentionally preserve the `MarkKeysOf` fallback:

```ts
type _OptionalMarkKeysFollowPlateFallback = Assert<
  Equal<MarkKeysOf<ParagraphElement>, unknown>
>
```

Source: `../slate-v2/packages/slate/test/generic-value-contract.ts`.

## Decision Brief

Principles:

- Examples teach Slate concepts, not conditional-type stunts.
- Type helpers belong in `slate` only when they name Slate data, not generic TS
  utility trivia.
- Additive helpers should not disturb existing helper contracts.
- Boolean toolbar marks and rich text attributes are different DX shapes.

Top drivers:

- Current examples have repeated boolean mark UI surfaces.
- `MarkKeysOf` is too broad and intentionally falls back to `unknown` for
  optional marks.
- The helper must work from text, element, value, or editor-shaped inputs by
  reusing `MarksOf<N>`.

Options:

| Option | Verdict | Reason |
| --- | --- | --- |
| Keep `BooleanTextKey` in examples | reject | This leaks advanced TS into starter code and duplicates a Slate concept. |
| Change `MarkKeysOf` to return optional mark keys | reject | It silently changes an existing contract and broadens keys beyond boolean marks. |
| Export generic `BooleanKeys<T>` | reject | Too general for Slate core; it looks like a utility library. |
| Add `BooleanMarkKeysOf<N>` only | revise | Fixes key typing but leaves `ActiveMarks = Partial<Pick<...>>` noise. |
| Add `BooleanMarkKeysOf<N>` and `BooleanMarksOf<N>` | choose | Small, Slate-named, type-only, and enough to clean examples without runtime API. |

Chosen option:

```ts
export type BooleanMarkKeysOf<N> = Extract<
  {
    [K in keyof MarksOf<N>]-?: Exclude<MarksOf<N>[K], undefined> extends boolean
      ? K
      : never
  }[keyof MarksOf<N>],
  string
>

export type BooleanMarksOf<N> = Partial<
  Pick<MarksOf<N>, BooleanMarkKeysOf<N>>
>
```

Consequences:

- `BooleanMarkKeysOf<CustomText>` returns boolean mark keys such as `bold`,
  `italic`, `code`, and `underline`.
- `fontSize?: string` is excluded.
- `MarkKeysOf<ParagraphElement>` can keep returning `unknown`.
- The helper is type-only; runtime bundle cost is zero.

Follow-ups:

- Add generic type-contract coverage before changing examples.
- Export both helpers from the public `slate` type surface.
- Replace example-local `BooleanTextKey`.

## Public API Target

Add to `../slate-v2/packages/slate/src/interfaces/text.ts`:

```ts
export type BooleanMarkKeysOf<N> = Extract<
  {
    [K in keyof MarksOf<N>]-?: Exclude<MarksOf<N>[K], undefined> extends boolean
      ? K
      : never
  }[keyof MarksOf<N>],
  string
>

export type BooleanMarksOf<N> = Partial<
  Pick<MarksOf<N>, BooleanMarkKeysOf<N>>
>
```

Export through `../slate-v2/packages/slate/src/index.ts` next to `MarksOf`,
`MarksIn`, and `MarkKeysOf`.

Example target:

```ts
import type { BooleanMarkKeysOf } from 'slate'

export type CustomTextKey = BooleanMarkKeysOf<CustomText>
```

Mark helper target:

```ts
import type { BooleanMarksOf } from 'slate'

type ActiveMarks = BooleanMarksOf<CustomText>
```

Do not export a generic `BooleanKeys<T>` unless another Slate-owned type surface
needs it later.

## Internal Runtime Target

No runtime change.

The helper derives from `MarksOf<N>`, so it follows the current value-first type
model and does not introduce a schema registry, mark registry, plugin registry,
or toolbar abstraction.

## Hook, Component, And Render DX Target

Examples should show:

- `CustomTextKey` as a Slate-derived mark key union.
- toolbar and hotkey maps typed with `CustomTextKey`.
- no copied mapped conditional type in example code.

Affected live examples:

- `../slate-v2/site/examples/ts/custom-types.d.ts`
- `../slate-v2/site/examples/ts/mark-utils.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/site/examples/ts/hovering-toolbar.tsx`
- `../slate-v2/site/examples/ts/iframe.tsx`

## Migration Backbone

Plate/plugin authors can map this directly to their own text type. The helper
does not require current Plate API compatibility and does not constrain Plate's
plugin-level mark config.

slate-yjs/collab is unaffected. Mark values and operations stay unchanged; only
TypeScript authoring gets a narrower key/object helper.

## Issue Accounting

ClawSweeper related-issue pass: ledger-first, no live GitHub needed.

Touched issue:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5075 | example-typescript-ergonomics | Improves after execution | The issue is exactly formatting-key TypeScript ergonomics. This plan removes the copied example type stunt and gives examples a Slate-owned helper. Do not mark `Fixes` without replaying the exact original issue shape. | type contract plus example typecheck | currently `not-claimed`; execution may move to `improves` with proof | related matrix only unless exact closure is proven |

Related but not fixed:

- Marks/decorations runtime issues stay out of claim scope. This plan does not
  change leaf splitting, decoration merging, DOM selection, Android input, or
  mark operation behavior.

PR reference sync: required because accepted API shape and examples change.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Current Slate v2 | `../slate-v2/packages/slate/src/interfaces/text.ts` | `MarksOf<N>` derives marks from `TextOf<N>` and strips `text`. | Ad hoc `Omit<T, 'text'>` copies in every example. | Reuse `MarksOf<N>` as the base. | Changing `MarkKeysOf` fallback. | Add boolean-specific helpers beside `MarksOf`. | agree |
| Current Slate v2 tests | `../slate-v2/packages/slate/test/generic-value-contract.ts` | `MarkKeysOf` intentionally returns `unknown` for optional marks. | Breaking existing type expectations. | Add new contracts for boolean mark keys. | Mutating old helper semantics. | Keep old tests green, add new helper tests. | agree |
| Prior generics plan | `docs/plans/2026-04-26-slate-v2-plate-generics-type-system-plan.md` | Value-first helpers derive marks from text unions. | Declaration-merging and `any` mark objects. | Keep helper derivation value-first. | A generic schema object as primary typing model. | Type-only helper derived from current value model. | agree |
| Issue corpus | `docs/slate-issues/requirements-from-issues.md` | Public API/type surface needs helpers matching actual runtime guarantees. | Growing core because docs are weak. | Small type helper where runtime guarantee is real. | Product toolbar helper in raw core. | Type-only public helper, no runtime abstraction. | partial |

No Lexical, ProseMirror, or Tiptap evidence is needed for this narrow type
helper. This is not a runtime architecture decision.

## Applicable Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| Vercel React | skipped | No React render/subscription/effect change. | None. |
| performance-oracle | applied | Type-only exports have zero runtime cost; helper should not add runtime mark registry. | Keep helper type-only. |
| performance | skipped | No production perf claim or benchmark surface. | None. |
| tdd | applied | Public type helper needs type-contract proof, not implementation-detail tests. | Add compile contract before example migration. |
| shadcn | skipped | No UI component surface changes. | None. |
| react-useeffect | skipped | No effects or external synchronization. | None. |

## High-Risk Deliberate Mode

Triggered because this changes public type API.

Pre-mortem:

- Helper accidentally includes non-boolean marks like `fontSize`; test should
  reject it.
- Helper breaks `MarkKeysOf` optional fallback by refactoring shared types; keep
  existing contract tests.
- Example still imports a local helper or uses `keyof EditorMarksOf` and lets
  arbitrary string-valued marks into boolean toggles.

Expanded proof plan:

- Type contract: `BooleanMarkKeysOf<CustomText>` equals expected boolean keys.
- Type contract: `BooleanMarksOf<CustomText>` excludes `fontSize`.
- Existing contract: `MarkKeysOf<ParagraphElement>` remains `unknown`.
- Example typecheck: site examples compile with no local `BooleanTextKey`.

Blast radius:

- `packages/slate/src/interfaces/text.ts`
- `packages/slate/src/index.ts`
- `packages/slate/test/generic-value-contract.ts`
- `site/examples/ts/custom-types.d.ts`
- `site/examples/ts/mark-utils.ts`
- example consumers of `CustomTextKey`

Rollback answer:

- Removing the helper would only restore bad example-local TS plumbing. The
  additive type-only helper is cheaper and cleaner than that rollback.

## Slate Maintainer Objection Ledger

| Change | Likely objection | Steelman antithesis | Tradeoff tension | Answer | Rejected alternative | Proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Add `BooleanMarkKeysOf<N>` and `BooleanMarksOf<N>` | "This is too niche for core; examples can keep their own type." | Slate core should stay minimal and avoid every docs convenience. | Two new public type names are API surface. | The helper names a Slate concept: boolean marks. The current example has to reimplement it because `MarkKeysOf` intentionally does not solve optional boolean marks. Type-only, no runtime cost, no product API. | Generic `BooleanKeys<T>` and changing `MarkKeysOf`. | Generic type contracts plus example typecheck. | keep |

## Hard Cuts And Rejected Alternatives

- Cut example-local `BooleanTextKey`.
- Do not change `MarkKeysOf`.
- Do not add `BooleanKeys<T>` as public API.
- Do not add runtime `toggleBooleanMark`, toolbar helpers, hotkey helpers, or
  Plate-style mark config to raw Slate.
- Do not claim fixed issue closure for #5075 until exact repro proof exists.

## Legacy Regression Proof Matrix

| Risk | Proof |
| --- | --- |
| Boolean helper includes string-valued marks | type contract rejects `fontSize` |
| Optional boolean marks collapse to `unknown` | type contract expects concrete union |
| Existing `MarkKeysOf` contract changes | existing `generic-value-contract.ts` rows stay green |
| Examples still carry copied helper | `rg "BooleanTextKey" site/examples/ts` returns none |
| Example helpers lose active-mark precision | `BooleanMarksOf<CustomText>` used in `mark-utils.ts` |

## Browser Stress And Parity Strategy

No browser proof required for this planning slice or the helper itself. The
later implementation should typecheck examples. Existing browser rows for
formatting examples remain owned by their runtime plans because runtime behavior
does not change here.

## Implementation Phases

1. Type contract RED: add `BooleanMarkKeysOf` / `BooleanMarksOf` expectations
   to `../slate-v2/packages/slate/test/generic-value-contract.ts`.
2. Core helper: add type exports in
   `../slate-v2/packages/slate/src/interfaces/text.ts` and public index export.
3. Example cleanup: replace `BooleanTextKey` in
   `../slate-v2/site/examples/ts/custom-types.d.ts`; use
   `BooleanMarksOf<CustomText>` in `mark-utils.ts`.
4. Example audit: ensure richtext, hovering toolbar, and iframe keep inferred
   `CustomTextKey` usage without local generic gymnastics.
5. Ledger/reference sync: update #5075 from not-claimed to improves only if
   execution proof justifies it.

## Fast Driver Gates

- cwd `../slate-v2`: `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
- cwd `../slate-v2`: `bun --filter slate typecheck`
- cwd `../slate-v2`: `bun typecheck:site` or the repo's current site/example
  typecheck command if different
- cwd `../slate-v2`: `rg "BooleanTextKey" site/examples/ts`
- cwd `plate-2`: `pnpm lint:fix`
- cwd `plate-2`: `node tooling/scripts/completion-check.mjs`

## Confidence Scorecard

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.98 | no runtime/React change |
| Slate-close unopinionated DX | 0.20 | 0.96 | helper derives from `MarksOf<N>` and stays type-only |
| Plate and slate-yjs migration backbone | 0.15 | 0.94 | value-first generics plan and no collab/runtime change |
| Regression-proof testing strategy | 0.20 | 0.92 | named type contracts and example typecheck gates |
| Research evidence completeness | 0.15 | 0.92 | live source, prior generics plan, issue corpus |
| shadcn-style composability/minimalism | 0.10 | 0.95 | no UI/product API; examples stay tiny |

Weighted score: `0.946`.

Threshold result: pass.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | live example/core/test reads | accepted additive helper target | none | closure |
| 2. Related issue discovery | complete | #5075 ledger/live rows read | classify as future `Improves`, not `Fixes` | no exact closure proof | closure |
| 3. Issue-ledger pass | complete | requirements, issue clusters, coverage matrix, dossier | no fixed issue claim | #5075 proof awaits execution | closure |
| 4. Intent/boundary and decision brief | complete | boundary and decision sections | reject local helper and generic utility | none | closure |
| 5. Research/ecosystem/live-source refresh | complete | live source plus prior generics plan | no external runtime research needed | none | closure |
| 6. Pressure passes | complete | review matrix and hard cuts | helper is type-only | none | closure |
| 7. Maintainer objection ledger | complete | objection row | keep tiny type-only helper | none | closure |
| 8. High-risk deliberate mode | complete | pre-mortem/proof plan | public API proof added | none | closure |
| 9. Ecosystem maintainer pass | skipped | no runtime/plugin/collab behavior change | no Plate/slate-yjs adapter work | none | closure |
| 10. Revision pass | complete | rejected alternatives and API target | add `BooleanMarksOf` with key helper | none | closure |
| 11. Issue sync accounting | complete | #5075 sync/coverage rows read | no ledger claim until execution proof | none | closure |
| 12. Closure score and final gates | complete | scorecard, handoff, completion gates | ready for Ralph execution | none | none |

## Plan Deltas From Review

- Added `BooleanMarksOf<N>` alongside `BooleanMarkKeysOf<N>` because key helper
  alone leaves the active-marks example noisy.
- Kept `MarkKeysOf` unchanged to avoid violating existing optional-mark
  fallback tests.
- Downgraded #5075 from tempting `Fixes` to execution-time `Improves` unless
  exact original repro proof is added.
- Skipped browser proof because no behavior changes.

## Open Questions

None for planning.

What would change the decision:

- If `BooleanMarksOf<N>` cannot typecheck cleanly against `MarksOf<N>`, keep
  only `BooleanMarkKeysOf<N>` and use `Partial<Pick<...>>` in examples.
- If site typecheck reveals non-boolean toolbar formats, split the local
  example key union instead of widening the core helper.

## Final User-Review Handoff Outline

- Public API: add `BooleanMarkKeysOf<N>` and `BooleanMarksOf<N>`.
- Example DX: replace copied `BooleanTextKey` with Slate-owned helper.
- Runtime: no change.
- Tests: type-contract first; example typecheck after cleanup.
- Issues: improve #5075 only after execution proof; no fixed issue claim now.

## Final Completion Gates

- Pass schedule complete: yes.
- Every completion threshold row has evidence or a concrete skip reason: yes.
- PR reference sync required: yes, update accepted API/example shape.
- Slate v2 behavior verification required now: no, planning-only; later
  execution gates are listed.
- Final handoff status: complete.

## Done Handoff

- Public API: `BooleanTextKey` copied in example -> `BooleanMarkKeysOf<N>` in
  Slate core; status `add`; proof `Live Current State`.
- Public API: noisy `Partial<Pick<CustomText, CustomTextKey>>` -> optional
  `BooleanMarksOf<N>` helper; status `add`; proof `Decision Brief`.
- Existing helper: `MarkKeysOf<ParagraphElement>` stays `unknown`; status
  `keep`; proof `generic-value-contract.ts`.
- Example DX: `custom-types.d.ts` owns mapped conditional type -> imports
  Slate helper; status `revise`; proof `Public API Target`.
- Runtime: no mark registry, toolbar helper, hotkey helper, or transform change;
  status `keep`; proof `Internal Runtime Target`.
- Plate/slate-yjs: no runtime/collab migration work; status `keep`; proof
  `Migration Backbone`.
- Tests: add type-contract gates and example typecheck; status `gate`; proof
  `Legacy Regression Proof Matrix`.
- Issue #5075: classify as future `Improves` only after execution proof, not
  `Fixes`; status `gate`; proof `Issue Accounting`.
- Hard cuts: no generic `BooleanKeys<T>`, no `MarkKeysOf` semantic change, no
  example-local helper; status `cut`; proof `Hard Cuts`.

## Ralph Execution - 2026-05-16

Status: done.

Goal:

- Slate v2 exposes type-only `BooleanMarkKeysOf` and `BooleanMarksOf` helpers,
  examples use them instead of local `BooleanTextKey` plumbing,
  issue/reference docs stay synced, and focused plus broad checks pass.

Current pass:

- `verification-sweep-pass`
- Owner: final gates.
- Scope: type-only boolean mark helper API, examples, and issue/reference docs.

Execution checkpoints:

- Added the generic type contract first and observed the expected RED failure.
- Implemented `BooleanMarkKeysOf<N>` and `BooleanMarksOf<N>` in
  `../slate-v2/packages/slate/src/interfaces/text.ts`.
- Replaced example-local `BooleanTextKey` with `BooleanMarkKeysOf<CustomText>`.
- Replaced local active-mark `Partial<Pick<...>>` with
  `BooleanMarksOf<CustomText>`.
- Synced #5075 as `Improves`, not `Fixes`.
- Ran diff review and tightened `BooleanMarksOf<N>` to pick the exported string
  key helper shape.

Execution verification:

- cwd `../slate-v2`: `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false` red before helper.
- cwd `../slate-v2`: `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false` pass after helper.
- cwd `../slate-v2`: `bun --filter slate typecheck` pass.
- cwd `../slate-v2`: `bun typecheck:site` pass.
- cwd `../slate-v2`: `rg "BooleanTextKey" site/examples/ts` no matches.
- cwd `../slate-v2`: `bun lint:fix` pass; Biome fixed one file.
- cwd `../slate-v2`: `bun check` pass; lint, package/site/root typecheck,
  1008 Bun tests, and 267 Slate React Vitest tests passed.
- cwd `plate-2`: `pnpm lint:fix` pass; no fixes applied.
