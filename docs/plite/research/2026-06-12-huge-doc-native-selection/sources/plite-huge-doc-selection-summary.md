# Plite Huge-Document Selection Notes

Current v2 source:
- `.tmp/plite/playwright/integration/examples/huge-document.test.ts:825-1175`
- `.tmp/plite/playwright/integration/examples/huge-document.test.ts:1177-1325`
- `.tmp/plite/playwright/integration/examples/huge-document.test.ts:1662-1829`
- `.tmp/plite/playwright/integration/examples/huge-document.test.ts:2027-2268`
- `.tmp/plite/packages/plite-react/src/editable/dom-coverage-vertical-selection.ts:1-220`
- `.tmp/plite/packages/plite-react/src/editable/dom-coverage-vertical-selection.ts:1055-1281`
- `.tmp/plite/packages/plite-react/src/editable/runtime-keyboard-events.ts:235-360`

Legacy Plite source:
- `../plite/site/examples/ts/huge-document.tsx:1-260`
- `../plite/playwright/integration/examples/huge-document.test.ts:1-10`

Take:
- Current v2 has much stronger proof than legacy Plite: staged/virtualized,
  screenshots, native/model/view selection checks, no double highlight,
  full-DOM parity, and select-all delete/undo flows.
- The remaining value is in tighter residual metrics and p95 attribution, not
  broad architecture churn.
- Legacy Plite's huge-doc test only checks chunk count, so it should never be
  treated as a target quality bar.
