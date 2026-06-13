---
date: 2026-06-13
topic: slate-v2-table-fragment-semantics
status: deferred-spec
---

# Slate v2 Table Fragment Semantics

## Current Verdict

Table fragments are not current private-alpha runtime proof. Keep them deferred
until the contract below is implemented and verified.

The target contract is rectangle algebra, not generic nested-block merging:

- a copied table-cell selection serializes as a rectangular table-area fragment;
- ragged source cell rows normalize to a rectangle before insertion;
- paste into a selected cell rectangle clips or repeats the source rectangle to
  the destination rectangle;
- paste into one cell places the source rectangle starting at that cell;
- destination tables grow or split only through an explicit table policy;
- row/col spans crossing replacement boundaries are split or rejected by policy;
- the post-paste selection is part of the contract.

## Current Gap

The current Slate v2 checkout has three explicit skipped fixture owners:

- `.tmp/slate-v2/packages/slate/test/transforms/insertFragment/of-tables/merge-into-full-cells.tsx`
- `.tmp/slate-v2/packages/slate/test/transforms/insertFragment/of-tables/merge-into-empty-cells.tsx`
- `.tmp/slate-v2/packages/slate/test/transforms/insertFragment/of-tables/merge-cells-with-nested-blocks.tsx`

Focused current proof:

```sh
cd .tmp/slate-v2
SLATE_FIXTURE_FILTER='transforms/insertFragment/of-tables' bun test ./packages/slate/test/index.spec.ts
```

Latest result in this run: `3 pass`, `6 skip`, `0 fail`.

Source recheck on 2026-06-13:

- the skipped fixtures are anonymous nested `<block>` shape fixtures, not typed
  table-row/table-cell schema fixtures;
- the test schema supports element specs and element properties such as
  `colSpan`, but there is no Slate-native table-area or cell-selection owner in
  core insert-fragment;
- therefore unskipping the fixtures would only bless generic nested-block merge
  behavior. It would not prove table copy/paste semantics.

Adjacent browser coverage is real but not equivalent:

- table-cell keyboard containment and paste containment live in
  `.tmp/slate-v2/playwright/integration/examples/tables.test.ts`;
- rich table HTML import from Google Docs, Quip, Word, Google Sheets, and
  ProseMirror row slices lives in
  `.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts`;
- these rows prove external table import and cell editing stability, not Slate
  table-fragment merge law.

## Why Rectangle Algebra

The strongest external source is ProseMirror tables, summarized in
`docs/slate-v2/research/2026-06-12-table-fragment-semantics/sources/prosemirror-tables-table-fragment-summary.md`.

The portable invariant is not ProseMirror's API. The portable invariant is that
table fragments need a grid/rectangle owner before insertion. Without that owner,
the skipped fixtures ask generic nested-block `insertFragment` to guess table
semantics from shape, which is how dirty fixture fixes happen.

## Implementation Order

1. Add a Slate-native table-area model or internal table-fragment normalization
   helper before touching the skipped fixtures.
2. Replace the skipped nested-block fixtures with explicit table-shaped core
   contracts that name source rectangle, target rectangle, and expected
   selection.
3. Add browser rows for selected-cell copy/paste only after core rectangle
   semantics are green.
4. Keep external HTML table import rows separate from internal Slate
   table-fragment rows.

## Proof Gates

Core proof:

```sh
cd .tmp/slate-v2
SLATE_FIXTURE_FILTER='transforms/insertFragment/of-tables' bun test ./packages/slate/test/index.spec.ts
```

Browser proof after browser rows exist:

```sh
cd .tmp/slate-v2
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium --grep "table"
```

## Non-Goals

- Do not unskip the fixtures by blessing current nested-block outputs.
- Do not copy ProseMirror APIs or table schema.
- Do not treat external HTML table import as internal Slate fragment semantics.
- Do not claim release, publish, or raw mobile readiness from this contract.
