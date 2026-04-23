---
title: Slate v2 migration must take transaction seams from real draft source, not reference proposals
date: 2026-04-18
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - tranche planning started treating `slate-batch-engine.md` like implementation truth even though it was only historical proposal context
  - the next-wave plan assumed draft had `Editor.withBatch(...)` when the real draft actually exposed `Editor.withTransaction(...)`
  - a bulk fixture drift in current `packages/slate/test/**` hid real wave progress behind broken JSX imports
root_cause: config_error
resolution_type: workflow_improvement
severity: high
tags: [slate, slate-v2, draft, tdd, transaction, applybatch, planning]
---

# Slate v2 migration must take transaction seams from real draft source, not reference proposals

## Problem

The tranche-3 `slate` plan drifted toward a fake source of truth.

A historical reference doc in `docs/slate-v2-draft/references/` was being
treated like the draft implementation owner, which made the next batch assume a
`withBatch(...)` seam that the real draft package did not even ship.

That is how planning turns into fan fiction.

## Symptoms

- The plan said the next draft-backed seam was `Editor.withBatch(...)`.
- The real draft in `../slate-v2-draft/packages/slate/**` only had:
  - `getChildren`
  - `setChildren`
  - `Editor.withTransaction(...)`
  - `Transforms.applyBatch(...)`
- The current `slate` fixture suite was also red for a separate reason:
  108 same-path legacy JSX fixtures had drifted and no longer imported `jsx`,
  which made the harness scream about `React`/`jsx` being undefined before it
  could tell us anything useful about the actual wave.

## What Didn't Work

- Using a reference/proposal doc as if it were code truth.
- Planning the public seam from memory instead of reading the actual draft
  package on disk.
- Treating the red fixture suite as proof the runtime seam was broken when the
  first failure was really fixture import drift.
- Writing a batch plan that tried to recover the wrong public entry point.

## Solution

1. Re-ground the wave against the real draft source in
   `../slate-v2-draft/packages/slate/**`.
2. Rewrite the next wave around the seams the draft actually owns:
   - `getChildren`
   - `setChildren`
   - `Editor.withTransaction(...)`
   - `Transforms.applyBatch(...)`
3. Use focused draft-backed RED slices first instead of importing a whole
   draft suite and disappearing into horizontal code churn.
4. Restore the same-path legacy JSX fixture files that had drifted so the
   current `index.spec.ts` harness became honest again.
5. Recover the minimal public seam in current `slate-v2`:
   - accessors
   - snapshot/listener helpers
   - transaction seam
   - `applyBatch(...)`

## Why This Works

There are three different kinds of evidence here, and they are not equal:

- reference docs explain ideas
- legacy source explains the old contract
- real draft code explains the new engine we are actually migrating from

When those disagree, the code wins.

The fixture repair mattered too: a red suite caused by missing `jsx` imports is
not a runtime oracle. Fix the harness noise first, then trust the failures that
remain.

## Prevention

- For `slate-v2` migration work, verify the seam in `../slate-v2-draft` before
  naming it in a plan. Do not promote `docs/slate-v2-draft/references/**` to
  implementation truth.
- If a current fixture suite explodes on import/pragma noise, fix that same-path
  drift before using the failures as runtime evidence.
- Pull focused draft RED slices first. Do not import every draft test and then
  go write all the code.
- If a legacy compatibility name is not in the real draft source, treat it as a
  separate explicit keep/cut decision, not as automatic draft recovery.
