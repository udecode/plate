---
title: Plite table fragment semantics research
type: source
status: promoted-kept
updated: 2026-06-12
source_refs:
  - ../../../../docs/research/raw/2026-06-12-table-fragment-semantics/README.md
---

# Plite Table Fragment Semantics Research

## Question

What should Plite claim for table-fragment copy/paste/insert semantics before
the skipped `insertFragment/of-tables` fixtures can become real proof?

## Current Verdict

Promoted to a durable Plite contract:
`docs/plite/table-fragment-semantics.md`.

This is not safe to fix as a dirty local fixture tweak.

The best invariant from ProseMirror is table clipboard as rectangle algebra:
selected cells form a rectangular area; pasted cells are normalized to a
rectangle; pasting into a cell selection clips/repeats to the selected
rectangle; pasting into one cell places the source rectangle at the target and
grows/splits the destination table as needed. That maps to a Plite-native
policy better than blessing current skipped fixture behavior.

## Local Gap

Plite has strong adjacent coverage:

- table-cell keyboard and paste containment in
  `.tmp/plite/playwright/integration/examples/tables.test.ts`;
- rich table HTML import from Google Docs, Quip, Word, and Google Sheets in
  `.tmp/plite/playwright/integration/examples/paste-html.test.ts`;
- explicit skipped core fixtures under
  `.tmp/plite/packages/plite/test/transforms/insertFragment/of-tables/**`.

The exact missing claim is table-fragment semantics, not generic HTML import.
Prior automation unskipped those three fixtures and found they fail; upstream
Plite also skips them, so this is unsettled policy debt.

## Promotion

`table-fragment:rectangle-algebra:core-browser-proof` is kept as:

- `plite-plan`: define the raw Plite table-fragment contract.
- `slate` core tests: convert/replace skipped `insertFragment/of-tables` rows
  once the contract is accepted.
- browser proof: add selected-cell copy/paste rows only after the core contract
  exists.

Current proof-law owner:

- `docs/plite/table-fragment-semantics.md`
- `docs/plite/master-roadmap.md`

First proof command after spec/test work:

```sh
cd .tmp/plite
PLITE_FIXTURE_FILTER='transforms/insertFragment/of-tables' bun test ./packages/plite/test/index.spec.ts
```

Browser proof command after example rows exist:

```sh
cd .tmp/plite
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts playwright/integration/examples/paste-html.test.ts --project=chromium --grep "table"
```
