---
title: Slate direct-audit green does not mean mirrored if the harness shapes output
type: solution
date: 2026-04-14
status: completed
category: workflow-issues
module: slate-v2
tags:
  - slate
  - slate-v2
  - proof
  - audit
  - harness
  - ledger
  - workflow
  - docs
---

# Problem

The transform audit turned green, but the ledger story was still wrong.

One row only passed because the test harness prepended a synthetic empty block
before comparing the output:

- `packages/slate/test/transforms/delete/selection/block-hanging-multiple.tsx`

If that row gets marked `mapped-mirrored`, the docs overclaim runtime parity.

# Root Cause

The workflow treated a green direct audit as automatic mirrored proof.

That is only true when the harness is acting like a normal runner. It stops
being true when the harness mutates the observed output shape to force a legacy
match.

In this case, the runtime and the proof harness were sharing responsibility for
the result:

- runtime got the delete behavior mostly right
- harness restored a leading empty block that runtime did not emit on its own

That is not clean mirrored parity. It is mixed ownership.

# Solution

Split the truth instead of hiding it.

1. Keep the direct transform audit green where it is genuinely green.
2. Mark the shaped row as `mapped-mixed`, not `mapped-mirrored`.
3. Say exactly why:
   - the audit is green
   - the harness still normalizes the output
   - runtime does not yet own that exact legacy shape cleanly
4. Sync the exact ledger, API audit matrix, roadmap, verdict docs, and PR drift
   register in the same turn.

That landed in:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [slate-transforms-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-transforms-api.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

# Why This Works

The key distinction is simple:

- green audit means the row is not currently failing
- mirrored parity means runtime owns the result without proof-only shaping

Those are not the same thing.

By recording harness-shaped rows as mixed, the ledger stops lying while still
preserving the useful fact that the direct audit is mostly closed.

# Prevention

- Do not upgrade a row to `mapped-mirrored` just because the direct audit is
  green.
- Check whether the harness mutates inputs, outputs, or selection shape before
  comparison.
- If the harness shapes the result to force a legacy match, mark the row
  `mapped-mixed` until runtime owns it cleanly.
- Sync the control docs in the same turn. A stale verdict doc is just a more
  polite lie.
