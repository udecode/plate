---
date: 2026-04-06
topic: slate-v2-phase9-browser-boundary-family
status: complete
---

# Slate v2 Phase 9 Browser-Boundary Family

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Turn the browser-boundary family from comparison-only into an honest current
family claim if the current v2 seam is already real.

## Scope

- add current `shadow-dom` and `iframe` rows to the replacement matrix
- implement minimal current example surfaces only if those rows fail for missing
  current examples
- sync the family ledger and scoreboard if the current rows land

## Constraints

- no broad rich-text iframe rewrite
- no fake “all browser-boundary parity” claim
- keep the current surfaces minimal and editor-shaped
- verify through the cross-repo local runner on current port `3010`

## Progress

- added current `shadow-dom` and `iframe` rows to the replacement matrix
- added minimal current `shadow-dom` and `iframe` example surfaces in
  `/Users/zbeyens/git/slate-v2/site/examples/ts/`
- added JS mirrors and example registry entries for those current surfaces
- proved the expanded family through the cross-repo local runner
- synced the scoreboard, family ledger, and current-surface docs so the
  browser-boundary family is now preserved instead of comparison-only
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/shadow-dom ../slate 3210 /examples/shadow-dom "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
