---
date: 2026-04-06
topic: slate-v2-phase9-paste-html-matrix
status: complete
---

# Slate v2 Phase 9 Paste HTML Matrix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Start Phase 9 replacement-envelope expansion with one honest matrix slice for
the `paste-html` family.

## Scope

- add legacy `paste-html` coverage to the replacement compatibility matrix
- add current `paste-html` coverage to the same matrix
- sync scoreboard/docs if the slice lands cleanly

## Constraints

- no fake direct parity claim between legacy broad HTML paste and current narrow
  explicit subset
- use the matrix to show what each side really proves
- keep verification on port `3010` for current local app runs

## Evidence

- legacy `paste-html` already has Playwright tests for `<strong>` and `<code>`
- current `paste-html` now has browser proof for paragraph, link, `strong`,
  `em`, and `code`
- the replacement matrix currently omits the `paste-html` family entirely

## Progress

- added one legacy `paste-html` row to the replacement compatibility matrix
- added one current `paste-html` row to the same matrix
- proved the expanded matrix through the cross-repo local runner
- synced the scoreboard and top-level v2 docs so Phase 9 is now the active
  program phase
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/search-highlighting "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
