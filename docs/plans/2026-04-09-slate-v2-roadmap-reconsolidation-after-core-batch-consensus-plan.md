---
date: 2026-04-09
topic: slate-v2-roadmap-reconsolidation-after-core-batch-consensus-plan
status: approved
source: /Users/zbeyens/.codex/skills/ralplan/SKILL.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-true-slate-rc-roadmap-20260408T151944Z.md
---

# Slate v2 Roadmap Reconsolidation After Core Batch

## RALPLAN-DR Summary

### Principles

1. roadmap owns sequence, not proof detail
2. verdict docs own live stop/go truth
3. closed work should disappear from “next move” language fast
4. broad open buckets must name the real remaining families, not old ones

### Decision Drivers

1. the core `packages/slate/test/**` deleted-family batch is now closed
2. the roadmap and overview still speak in pre-closeout terms
3. maintainers need the next blocker to point at the non-core deletion families

### Viable Options

#### Option A: Minimal reconsolidation of the four control docs

Pros:

- fastest honest refresh
- keeps ownership boundaries intact

Cons:

- does not collapse supporting docs beyond the command’s scope

#### Option B: Broader verdict-stack rewrite

Pros:

- maximum consistency in one pass

Cons:

- larger than the command’s actual role
- risks churning stable verdict docs without new truth

### Chosen Option

- `Option A`

## Decision

Refresh the standard reconsolidation set while preserving ownership boundaries:

1. [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
2. [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
3. [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
4. [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Verdict docs stay untouched unless the live stop/go truth changed there.

Expected direct edits:

- `master-roadmap.md`
  - `Tranche 4` exit wording
  - `Next Move`
- `overview.md`
  - `Current Read`
  - `Read In This Order` only if routing changed
- `release-file-review-ledger.md`
  - `major file/test deletion review` maintainer note
- `true-slate-rc-proof-ledger.md`
  - audit-only unless a wording drift is found during reconsolidation

Owner boundaries stay intact:

- roadmap owns sequence
- overview owns reading order / front-door routing
- release-file-review ledger owns file/deletion review truth
- proof ledger owns proof truth
- verdict docs still own verdict

## Required Truth Updates

1. Core deleted `packages/slate/test/**` family closure is done.
2. The remaining `major file/test deletion review` work is now:
   - `packages/slate-react/test/**`
   - `packages/slate-history/test/**`
   - supporting example/browser deletion families
3. The next mainline blocker wording must carry the sharper post-core read:
   - file/test deletion closure first
   - extension-model proof on the same critical path
   - no stale implication that core `packages/slate/test/**` is still open
4. `True Slate RC` is still open for:
   - extension model / interception
   - headless/core
   - operation-history-collaboration integrity
   - non-core file/test deletion closure

## Acceptance Criteria

1. The roadmap no longer implies the core deleted `packages/slate/test/**`
   bucket is still open in:
   - `Tranche 4`
   - `Next Move`
2. The overview `Current Read` explicitly says the core deleted test-family
   bucket is closed and the remaining deletion review is non-core.
3. The release-file-review ledger still keeps broader deletion review open, but
   explicitly says the remaining open scope is non-core.
4. The proof ledger remains aligned with the refreshed control read without
   collapsing `owning doc` and `execution owner`.
5. Verdict-first reading order stays intact in [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md):
   - verdict
   - roadmap
   - file/proof ledgers
6. Verdict-first reading order stays intact:
   - no roadmap-first rerouting
   - no proof-first rerouting

## Verification

- `bunx prettier --check docs/slate-v2/master-roadmap.md docs/slate-v2/overview.md docs/slate-v2/release-file-review-ledger.md docs/slate-v2/true-slate-rc-proof-ledger.md`
- `rg -n "packages/slate/test/\\*\\*|slate-react/test/\\*\\*|slate-history/test/\\*\\*|supporting example/browser" docs/slate-v2/master-roadmap.md docs/slate-v2/overview.md docs/slate-v2/release-file-review-ledger.md`
