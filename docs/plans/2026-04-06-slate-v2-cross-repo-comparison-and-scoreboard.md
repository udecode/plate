---
date: 2026-04-06
topic: slate-v2-cross-repo-comparison-and-scoreboard
status: completed
---

# Slate-v2 Cross-Repo Comparison And Scoreboard

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Rebuild cross-repo comparison lanes in `/Users/zbeyens/git/slate-v2` against
`/Users/zbeyens/git/slate`, then publish the explicit replacement-gates
scoreboard in the Slate v2 docs.

## What Landed

- cross-repo local runner:
  [/Users/zbeyens/git/slate-v2/scripts/run-cross-repo-local.sh](/Users/zbeyens/git/slate-v2/scripts/run-cross-repo-local.sh)
- replacement compatibility lane:
  [/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)
- replacement placeholder benchmark:
  [/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/placeholder.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/placeholder.mjs)
- replacement huge-document benchmark:
  [/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document.mjs)
- root package scripts for those lanes in
  [/Users/zbeyens/git/slate-v2/package.json](/Users/zbeyens/git/slate-v2/package.json)
- replacement scoreboard doc:
  [/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## Verification

- `yarn test:replacement:compat:local`
- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`
