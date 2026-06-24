---
date: 2026-04-06
topic: plite-cross-repo-comparison-and-scoreboard
status: completed
---

# Plite-v2 Cross-Repo Comparison And Scoreboard

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Rebuild cross-repo comparison lanes in `/Users/zbeyens/git/plite` against
`/Users/zbeyens/git/slate`, then publish the explicit replacement-gates
scoreboard in the Plite docs.

## What Landed

- cross-repo local runner:
  [/Users/zbeyens/git/plite/scripts/run-cross-repo-local.sh](/Users/zbeyens/git/plite/scripts/run-cross-repo-local.sh)
- replacement compatibility lane:
  [/Users/zbeyens/git/plite/playwright/integration/examples/replacement-compatibility.test.ts](/Users/zbeyens/git/plite/playwright/integration/examples/replacement-compatibility.test.ts)
- replacement placeholder benchmark:
  [/Users/zbeyens/git/plite/scripts/benchmarks/browser/replacement/placeholder.mjs](/Users/zbeyens/git/plite/scripts/benchmarks/browser/replacement/placeholder.mjs)
- replacement huge-document benchmark:
  [/Users/zbeyens/git/plite/scripts/benchmarks/browser/replacement/huge-document.mjs](/Users/zbeyens/git/plite/scripts/benchmarks/browser/replacement/huge-document.mjs)
- root package scripts for those lanes in
  [/Users/zbeyens/git/plite/package.json](/Users/zbeyens/git/plite/package.json)
- replacement scoreboard doc:
  [/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)

## Verification

- `yarn test:replacement:compat:local`
- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`
