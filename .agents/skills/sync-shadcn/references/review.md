# Re-Audit Current Plan (`review`)

Proves whether `docs/sync/shadcn/status.json`, the latest plan artifacts, current `../shadcn/apps/v4`, and the current Plate checkout still describe the same sync problem. Permissions live in [policy](./policy.md).

## Inputs and Checks

Inputs: optional plan path/run dir (default `lastPlan` from `status.json`), optional target ref (default `origin/main` in `../shadcn`), baseline `lastSyncedCommit`, and planned target `lastPlannedCommit`.

Fetch `../shadcn`, read `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, and `partialSyncs` from `status.json`, then verify ancestry and recompute inventories:

```bash
git -C ../shadcn fetch origin main --tags
TARGET=$(git -C ../shadcn rev-parse origin/main)
git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"
git -C ../shadcn log --oneline --decorate "$PLANNED..$TARGET" -- apps/v4
git -C ../shadcn diff --name-status --find-renames "$BASE..$TARGET" -- apps/v4
```

Compare recomputed name-status/numstat/log data (saved to a temp review file in the run dir or `docs/sync/shadcn/reviews/`) against stored run artifacts, and rerun scoped `git grep --untracked` / file-existence checks for Plate owners, explicit exclusions, preserved forks, partial syncs, and recommended slices.

## Staleness Verdicts

- `fresh`: target equals `lastPlannedCommit`, recomputed inventory matches stored run artifact, required Plate owner paths/evidence still exist, and no status/partial-sync contradiction exists.
- `stale-upstream`: `origin/main` has newer `apps/v4` commits than `lastPlannedCommit`, or recomputed inventory differs from the stored artifact.
- `stale-local`: Plate owner paths or local search evidence no longer match the current checkout.
- `stale-status`: `status.json` contradicts the selected plan (e.g., plan target differs from `lastPlannedCommit` without override, or `partialSyncs` claim work absent locally).
- `blocked-ref`: baseline, planned target, selected target, or ancestry cannot be proven.

## Artifact and Output Shape

Write a dated `review.md` under the run dir or `docs/sync/shadcn/reviews/` recording: selected plan/run dir; base, planned, and current target SHAs; upstream commit and file-status counts for `PLANNED..TARGET`; inventory diff result for `BASE..TARGET`; local Plate owner/source evidence summary; exclusions and preserved forks checked; status semantics checked; verdict and next action.

```md
Review: <fresh | stale-upstream | stale-local | stale-status | blocked-ref>
Range: <base-short>..<target-short>
Plan: <path>
Report: <path>

| Check | Result | Evidence |
| --- | --- | --- |
| upstream target | ... | ... |
| inventory | ... | ... |
| Plate owners | ... | ... |
| status semantics | ... | ... |

Next: <use the existing plan | rerun planning | fix local drift | resolve refs>
```
