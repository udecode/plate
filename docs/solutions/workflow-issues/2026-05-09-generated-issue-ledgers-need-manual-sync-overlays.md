---
title: Generated issue ledgers need manual sync overlays
date: 2026-05-09
category: workflow-issues
module: slate-issues
problem_type: workflow_issue
component: documentation
symptoms:
  - A generated gitcrawl ledger was treated as the target for manual v2 classification
  - A frozen issue corpus was still being referenced like current live sync state
  - PR fixed-claim counts drifted from the issue coverage matrix
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags: [slate-issues, gitcrawl, issue-ledger, drift-check, workflow]
---

# Generated issue ledgers need manual sync overlays

## Problem

The Slate issue-ledger stack had mixed generated archive data, frozen research
corpus data, manual v2 sync classification, and PR claim accounting. That made
future `slate-ralplan` and `clawsweeper` runs likely to update the wrong file.

## Symptoms

- `docs/slate-issues/gitcrawl-live-open-ledger.md` says it intentionally
  contains live gitcrawl fields only, but rule text still told agents to add
  manual issue classifications there.
- `docs/slate-issues/open-issues-ledger.md` owns a frozen `682`-issue research
  corpus, while the current gitcrawl live ledger has `630` open issues.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` had `25` fixed claims while
  `docs/slate-v2/references/pr-description.md` had `31`.

## What Didn't Work

- Treating the generated live ledger as both archive output and manual
  classification state.
- Treating the frozen research corpus as current live issue sync.
- Letting PR prose carry hard counts without deriving them from the claim
  ledger.

## Solution

Separate the roles:

1. Keep `gitcrawl-live-open-ledger.md` generated/live-only.
2. Keep `open-issues-ledger.md` as the frozen historical corpus and
   classification seed.
3. Add a current manual overlay such as
   `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
4. Keep exact PR claims in
   `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
5. Keep long-form local issue reasoning in
   `docs/slate-v2/ledgers/fork-issue-dossier.md`.
6. Make PR description counts derive from the ledgers, not the other way
   around.
7. Add a checker that fails when these surfaces drift.

The first execution plan for this is:

- [2026-05-09-slate-issues-ledger-consolidation-ralplan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-05-09-slate-issues-ledger-consolidation-ralplan.md)

## Why This Works

Generated files are snapshots of external state. Manual sync overlays are local
interpretation. PR prose is presentation.

When those roles are distinct, regeneration is safe, planning is current, and
PR claims can be checked mechanically. When they collapse into one file, every
agent has to guess which truth it is allowed to edit. That is how stale counts
and accidental overclaims creep in.

## Prevention

- Before adding manual columns to a ledger, check whether the file declares
  itself generated.
- If a file represents a frozen corpus, name it as a historical seed instead of
  current state.
- Keep one source of truth for exact `Fixes #...` claims.
- Add a local checker for any ledger family with generated input, manual
  classification, and public-facing summary output.
- Do not print hard counts in PR prose unless a script checks them against the
  ledger.

## Related Issues

- [2026-04-15-example-parity-ledgers-must-track-contributor-facing-source-and-ui-not-just-behavior-rows.md](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-15-example-parity-ledgers-must-track-contributor-facing-source-and-ui-not-just-behavior-rows.md)
- [2026-04-14-slate-direct-audit-green-does-not-mean-mirrored-if-harness-shapes-output.md](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-14-slate-direct-audit-green-does-not-mean-mirrored-if-harness-shapes-output.md)

