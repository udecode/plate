# Slate v2 Experimental Virtualized Rendering Boundary

## Goal

Make Slate v2 virtualized rendering read as experimental everywhere users and
agents encounter it.

## Acceptance

- Public `Editable` rendering strategy config stays `type: 'virtualized'`.
- Docs and JSDoc mark the mode experimental and not production-ready.
- Main `Editable` and performance docs point to a separate experimental
  virtualization doc instead of teaching it inline.
- Example/sidebar copy labels the mode experimental.
- Tests and metrics assertions follow the experimental public tag.
- Focused `slate-react` typecheck and rendering strategy tests pass.

## Current Status

- Status: done
- Source repo: `/Users/zbeyens/git/slate-v2`
- Docs/control repo: `/Users/zbeyens/git/plate-2`
- Decision: keep code/API/metrics on `virtualized`; make only docs, JSDoc, and
  example labels describe the mode as experimental.

## Findings

- Existing plan history already says virtualized mode is explicit,
  experimental, and not default.
- Live docs still include a copyable virtualized snippet in
  `docs/libraries/slate-react/editable.md`.
- Live example sidebar labels the example as `Virtualized Rendering`, which
  sounds production-ready.
- No `docs/solutions/patterns/critical-patterns.md` file exists in this repo;
  the learnings pass used targeted virtualization solution docs instead.

## Result

- Public rendering strategy config uses `type: 'virtualized'`.
- Runtime strategy metrics report `virtualized`.
- The virtualized example is labeled `Experimental Virtualized Rendering` and
  shows `Experimental. Not production-ready.` in the example body.
- `Editable` docs and the performance walkthrough link to a separate
  experimental virtualization doc instead of teaching the mode inline.
- `RenderingStrategyOptions` JSDoc marks the `virtualized` option branch as
  experimental.

## Verification

- `bun lint:fix`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx`
- `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "experimental virtualized|TanStack-backed"`
