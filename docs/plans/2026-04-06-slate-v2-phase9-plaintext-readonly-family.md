---
date: 2026-04-06
topic: slate-v2-phase9-plaintext-readonly-family
status: complete
---

# Slate v2 Phase 9 Plaintext / Read-only Family

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Widen the replacement envelope for the simple editorial family:

- plaintext
- read-only

## Scope

- add current v2 plaintext and read-only example surfaces
- add replacement-matrix rows for those current surfaces
- add the minimal `slate-react` `Editable` support needed for read-only truth
- sync scoreboard and family ledger if the slice lands

## Constraints

- no fake `richtext` parity claim
- keep the package change as small as possible
- use current port `3010` for current local proof

## Progress

- added current `plaintext` and `read-only` example surfaces in
  `/Users/zbeyens/git/slate-v2/site/examples/ts/`
- added JS mirrors and example registry entries
- proved current `plaintext` and current `read-only` through the replacement
  matrix
- widened the matrix further with matching legacy `plaintext` and
  `read-only` rows
- synced the scoreboard, family ledger, migration story, and current-surface
  docs
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/plaintext ../slate 3210 /examples/plaintext "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
