---
title: Browser/example deleted family closure must follow current diff and live proof owners
type: solution
date: 2026-04-09
status: completed
category: workflow-issues
module: slate-v2
tags:
  - slate
  - slate-v2
  - browser
  - examples
  - deletion-closure
  - proof
  - workflow
---

# Problem

The active audit plan still treated `playwright/integration/examples/**` as an
open `11`-file family, but the live repo diff only had `2` deleted files left:

- `huge-document.test.ts`
- `select.test.ts`

If we had trusted the older audit rows, the next batch would have wasted time
“closing” already-restored example tests again.

# Root Cause

Browser/example deletion families drift faster than package families because
their proof owners are split across:

- direct current example tests
- replacement compatibility rows
- benchmark lanes
- architecture docs that explicitly cut old internals

That means one deleted family can shrink dramatically while the old audit plan
still carries a much larger historical count.

# Solution

Freeze the **current** deleted inventory first, then classify each remaining row
by its live proof owner.

For `playwright/integration/examples/**`, the current diff showed only:

1. `select.test.ts`
2. `huge-document.test.ts`

Those two rows needed different handling:

- `select.test.ts` still matched a real browser behavior seam, so the fix was to
  recover it directly in
  [richtext.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts)
  with a triple-click paragraph-selection proof
- `huge-document.test.ts` only asserted old chunking internals, so it was an
  explicit better-cut and mapped to the live huge-document benchmark lane

That let the full Playwright deleted family close honestly in
[2026-04-09-slate-v2-playwright-integration-examples-deleted-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-playwright-integration-examples-deleted-family-closure.md)
while exposing the real next residue:

- `site/examples/ts/custom-types.d.ts`

# Why This Works

This keeps deletion closure attached to the thing that actually matters:

- current deleted paths
- current release claim
- current proof owners

Instead of treating all example deletions as one monolith, it lets each row land
where it belongs:

- direct current browser proof
- replacement compatibility
- benchmark lane
- explicit skip

# Prevention

- Never trust an older browser/example deletion count without re-running
  `git diff --diff-filter=D --name-only` on the exact glob first.
- For browser/example deletions, classify each surviving path by live proof
  owner before deciding whether it is recovered or explicit skip.
- Treat performance/example rows separately from behavior/example rows.
  `huge-document` is a benchmark owner question, not automatically a browser
  e2e owner question.
- When the family closes, replace vague roadmap wording like
  “supporting example/browser families” with the exact remaining path or glob.
