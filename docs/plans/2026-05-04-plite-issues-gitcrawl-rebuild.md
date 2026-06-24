---
date: 2026-05-04
topic: slate-issues-gitcrawl-rebuild
status: done
source: docs/plite-issues
tooling: gitcrawl
---

# Plite Issues Gitcrawl Rebuild

## Goal

Rebuild `docs/plite-issues` from a live `gitcrawl` mirror instead of the old
pre-v2 frozen snapshot. The output should be better triage, not a prettier copy
of the April ledger.

## Hard Rules

- `gitcrawl` is the archive-first source for candidate discovery, neighbors,
  clusters, and stale/duplicate pressure.
- Live GitHub remains final truth for issue state when a claim depends on
  current status or comments.
- Do not keep the `682`-issue snapshot as the active truth if live data
  disagrees.
- Keep exact `Fixes #...` claims limited to issue-level proof in
  `docs/plite/ledgers/issue-coverage-matrix.md`.
- Document gaps brutally: missing mirror coverage, weak clusters,
  duplicate-uncertain families, stale rows, no-repro rows, and v2 proof holes.
- No GitHub comments, label writes, closes, commits, pushes, or PRs.

## Source Files To Rebuild Or Reconcile

- `docs/plite-issues/open-issues-ledger.md`
- `docs/plite-issues/open-issues-dossiers.md`
- `docs/plite-issues/test-candidate-map.md`
- `docs/plite-issues/benchmark-candidate-map.md`
- `docs/plite-issues/issue-clusters.md`
- `docs/plite-issues/package-impact-matrix.md`
- `docs/plite-issues/requirements-from-issues.md`
- `docs/plite-issues/roadmap-from-issues.md`
- `docs/plite-issues/triage-close-queue.md`

## Execution Phases

| Phase                      | Status   | Output                                                                                             |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| 1. Mirror refresh          | complete | Fresh `gitcrawl` sync for `ianstormtaylor/slate` open issues and comments.                         |
| 2. Cluster build           | complete | `gitcrawl` cluster output plus weak-cluster and singleton gap notes.                               |
| 3. Gap audit               | complete | Current docs vs live mirror deltas: closed, new, missing, stale, weak duplicate candidates.        |
| 4. Corpus rebuild          | complete | Updated `docs/plite-issues` summary docs and generated/detailed ledgers.                           |
| 5. V2 claim reconciliation | complete | Issue coverage matrix claims left unchanged; new live rows stay untriaged until issue-level proof. |
| 6. Verification            | complete | Formatting, row/count scripts, `bun run completion-check`.                                         |

## Current Findings

- Existing corpus is a `2026-04-02` frozen `682`-issue snapshot.
- Gitcrawl live mirror now reports `630` open issues and `29` open PRs:
  `659` open threads total.
- Gitcrawl hydrated `1856` comments/reviews, embedded `659` rows, and produced
  `617` clusters.
- Only `28` clusters are multi-member; `589` are singletons. Raw gitcrawl
  clustering is useful for candidate discovery but too conservative for the
  Plite architecture taxonomy.
- New live issues absent from the frozen ledger: `#6051`, `#6053`.
- Frozen rows no longer live-open: `54`; GitHub confirms all are closed.
- V2 exact issue claims are unchanged. The new live ledger preserves old sync
  status where available and marks new live rows as `untriaged-live-new`.
