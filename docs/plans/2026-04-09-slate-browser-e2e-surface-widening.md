---
date: 2026-04-09
topic: slate-browser-e2e-surface-widening
status: completed
---

# Slate Browser E2E Surface Widening

## Goal

Bring `read-only` and `shadow-dom` into the dedicated current-example browser
lane instead of only proving them through the replacement matrix.

## Result

- added dedicated browser tests for:
  - `read-only`
  - `shadow-dom`
  - `iframe`
  - `plaintext`
- widened `test:slate-browser:e2e` and `test:slate-browser:e2e:local` to carry
  those examples and the broader current example suite
- kept the proof-lane matrix aligned with the widened current-example e2e lane

## Verification

- `bash ./scripts/run-slate-browser-local.sh 3100 /examples/read-only "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/read-only.test.ts playwright/integration/examples/shadow-dom.test.ts --project=chromium --workers=1"`
- `bash ./scripts/run-slate-browser-local.sh 3100 /examples/plaintext "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/iframe.test.ts playwright/integration/examples/plaintext.test.ts --project=chromium --workers=1"`
- `yarn test:slate-browser:e2e:local`
