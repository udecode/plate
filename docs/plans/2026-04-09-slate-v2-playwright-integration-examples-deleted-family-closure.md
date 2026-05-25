---
date: 2026-04-09
topic: slate-v2-playwright-integration-examples-deleted-family-closure
---

# Slate V2 Playwright Integration Examples Deleted-Family Closure: playwright/integration/examples/**

> Historical batch note. The live closure read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Scope closed

- `playwright/integration/examples/**`

## Frozen Deleted Inventory

Captured from:

```bash
git -C /Users/zbeyens/git/slate-v2 diff --diff-filter=D --name-only -- playwright/integration/examples
```

Exact deleted example-test paths: `2`

- `playwright/integration/examples/huge-document.test.ts`
- `playwright/integration/examples/select.test.ts`

## Deleted-Family Closure Matrix

| Deleted file                                      | Status          | Current proof owner / replacement                                                                                                                                                                                                 | Resolution                                                                                                                                                                      |
| ------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playwright/integration/examples/select.test.ts`  | `recovered now` | [richtext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts), [proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md), `yarn test:slate-browser:e2e:local` | direct browser proof now covers the live triple-click paragraph-selection intent on the current richtext surface and keeps block quote controls inactive for a plain paragraph |
| `playwright/integration/examples/huge-document.test.ts` | `explicit skip` | [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md), [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md), `yarn bench:replacement:huge-document:local` | the deleted test only asserted chunking internals; the live huge-document claim is the benchmark lane, not a browser test for dead chunking UI                                 |

Totals:

- `recovered now`: `1`
- `explicit skip`: `1`
- reconciled deleted example-test paths: `2`

## What Was Recovered

- [richtext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts)
  now directly proves:
  - triple-clicking a plain paragraph in the current richtext example selects
    that paragraph text
  - the block-quote toolbar control stays inactive for that plain paragraph
    selection

## Explicit Skip Rationale

### `huge-document.test.ts`

- the deleted test asserted old chunking-specific UI:
  - `Chunk size`
  - `[data-slate-chunk]`
- the live v2 huge-document example no longer exposes that chunking control
  surface
- current docs already say chunking should not be foundational in v2
- the honest live owner for `huge-document` is the replacement benchmark lane,
  not a browser assertion about dead chunk markup

## Supporting Example / Browser Tree

| Scope                                  | Status    | Notes                                                                                                                                                             |
| -------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playwright/integration/examples/**`   | `closed`  | closed by this note                                                                                                                                               |
| `site/examples/ts/custom-types.d.ts`   | `closed`  | already closed in [2026-04-09-slate-v2-site-examples-ts-custom-types-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-site-examples-ts-custom-types-closure.md) |
| `site/examples/js/**`                  | `closed`  | no current deleted paths remain under this glob                                                                                                                   |

## Sibling buckets still open

- none inside the supporting example/browser family

## What this batch does NOT close

- broader `True Slate RC` blockers outside example/browser deletion work

## Fresh verification used for this closure

- `bash ./scripts/run-slate-browser-local.sh 3100 /examples/richtext "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/richtext.test.ts --project=chromium --workers=1"`
