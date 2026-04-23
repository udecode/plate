---
date: 2026-04-15
topic: slate-v2-huge-document-history-lane-cut
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
---

# Goal

Resolve the bogus browser huge-document history compare debt by deciding whether
the lane is fixable or should be deleted.

# Scope

- `bench:replacement:huge-document:history:local`
- the lane script, command surface, and live control docs
- no new replacement lane unless the legacy surface actually supports it

# Loaded Skills

- `major-task`
- `task`
- `planning-with-files`
- `learnings-researcher`
- `performance-oracle`
- `debug`
- `hard-cut`

# Phases

- [x] Load skills and source-of-truth files
- [x] Reproduce the lane failure and inspect both surfaces
- [x] Decide whether to fix or cut
- [x] Apply the chosen cut across code and live docs
- [x] Verify the surviving history perf story

# Findings

- the lane fails immediately on the legacy side because it expects
  `#huge-document-undo`
- legacy `/Users/zbeyens/git/slate/site/examples/ts/huge-document.tsx` does
  not expose undo/redo controls
- worse: legacy huge-document is not even created with `withHistory(...)`, so
  this is not just a missing-button problem
- the kept honest owner already exists:
  `pnpm bench:history:compare:local`
- keeping the browser huge-document history lane as “follow-up debt” would keep
  a structurally invalid compare row alive
- applied cut:
  - removed `bench:replacement:huge-document:history:local`
  - deleted
    `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-history.mjs`
  - rewrote live control docs so `pnpm bench:history:compare:local` is the only
    history compare owner
- fresh same-turn surviving owner rerun:
  - typing undo `20.27ms`
  - typing redo `17.7ms`
  - fragment undo `31.77ms`
  - fragment redo `29.11ms`

# Progress

## 2026-04-15

- reproduced the browser huge-document history failure
- audited the current and legacy huge-document example implementations
- confirmed the row is invalid by construction, not blocked by ordinary harness
  plumbing
- applied the hard cut across `package.json`, the dead lane script, and the
  live perf verdict docs
- verified:
  - `pnpm lint:fix`
  - `pnpm bench:history:compare:local`

# Errors

- reproduced failure:
  `expect(locator('#huge-document-undo')).toBeVisible()`
