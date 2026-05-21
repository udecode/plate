# Slate v2 Huge Document Rendering Example Hard Cut

Status: done

## Goal

Make `huge-document` the public rendering strategy playground and remove the
public `rendering-strategy-runtime` and `scroll-into-view` example routes.

## Source Of Truth

- User approved merging rendering strategy controls/stats into `huge-document`.
- Public examples should teach useful authoring/product behavior, not expose
  internal proof harnesses.
- Existing rendering and scroll browser proofs must be retargeted or kept only
  where the surviving behavior exists.

## Scope

In scope in `.tmp/slate-v2`:

- `site/examples/ts/huge-document.tsx`
- `site/constants/examples.ts`
- `site/pages/examples/[example].tsx`
- rendering strategy and scroll Playwright rows
- `docs/general/docs-proof-map.md`
- docs references to rendering-strategy route names
- browser contract route declarations

Out of scope:

- Rewriting rendering strategy internals.
- Moving every synthetic `rendering-strategy-runtime` contract into
  `huge-document`; only public demo-worthy strategy controls belong there.
- Keeping compatibility route aliases.

## Plan

1. [done] Add `renderingStrategy`, shell/virtualized controls, and
   `onRenderingStrategyMetrics` display to `huge-document`.
2. [done] Retarget scroll-into-view browser tests to `huge-document`.
3. [done] Remove public route/import/list entries for `rendering-strategy-runtime`
   and `scroll-into-view`.
4. [done] Delete the old rendering-strategy synthetic route and its public
   Playwright harness; surviving strategy behavior is covered by
   `huge-document` and package-level rendering strategy tests.
5. [done] Update docs/proof maps/contracts to name `huge-document` for the
   surviving public rendering proof.
6. [done] Run focused type/browser/lint gates, then a final changed-files
   review.

## Verification

- `bun typecheck:site`
- `bun --filter slate-react typecheck`
- targeted Playwright rows for `huge-document`
- stale route grep for public `rendering-strategy-runtime` and
  `scroll-into-view`
- `bun lint:fix`

## Results

- `huge-document` now owns shell and virtualized strategy controls, query params,
  bounded virtualized editing, and rendering strategy metrics.
- Public `rendering-strategy-runtime` and `scroll-into-view` examples were
  deleted with no compatibility route.
- Browser proof moved to `playwright/integration/examples/huge-document.test.ts`.
- The old synthetic rendering runtime stress rows were removed; the surviving
  IME undo stress row runs on `richtext`.

## Verification Results

- `bun typecheck:site` passed.
- `bun --filter slate typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun --filter slate-browser typecheck` passed.
- `bun lint:fix` passed.
- `bun --filter slate-react test -- test/rendering-strategy-and-scroll.test.tsx test/surface-contract.test.tsx` passed.
- `bun --filter slate-browser test:core` passed.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium` passed.
- `STRESS_FAMILIES=ime-composition-undo PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run test:stress` passed.
- `rg -n "rendering-strategy-runtime|Scroll Into View|Rendering Strategy Runtime" . -g '!node_modules/**' -g '!*.tsbuildinfo'` returned no matches in `.tmp/slate-v2`.
- `rg -n "scroll-into-view" . -g '!node_modules/**' -g '!*.tsbuildinfo'` only returned the existing `skip-scroll-into-view` policy tag.
- `node tooling/scripts/completion-check.mjs` passed in `plate-2`.
- `ce-compound` evaluation updated
  `docs/solutions/developer-experience/2026-04-29-slate-v2-hard-cuts-must-run-explicit-contract-files.md`
  with the example-route hard-cut sweep.
