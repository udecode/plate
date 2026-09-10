### `review`

Use `sync-shadcn review` when the user asks whether the latest sync plan is
still fresh, whether a previously written plan can still be implemented, or
whether current `apps/www` drift changed the merge posture.

Purpose:

- prove whether `docs/sync/shadcn/status.json`, the latest plan artifacts, the
  current `../shadcn/apps/v4` target, and the current Plate docs checkout still
  describe the same sync problem
- find new upstream commits since `lastPlannedCommit`
- find stale inventory artifacts for the `lastSyncedCommit..target` range
- re-run local Plate owner/source evidence for actionable rows before
  implementation

Inputs:

- optional plan path or run directory; default to `lastPlan` from
  `docs/sync/shadcn/status.json`
- optional target ref; default to `origin/main` in `../shadcn`
- baseline from `lastSyncedCommit`
- planned target from `lastPlannedCommit`

Review mode may:

- fetch `../shadcn` and resolve exact refs
- read `docs/sync/shadcn/status.json`, the selected plan, `inventory.md`, and
  `upstream-name-status.tsv`
- recompute upstream name-status/numstat/log data into a temporary review file
  under the same run directory or under `docs/sync/shadcn/reviews/`
- compare recomputed inventories with the stored run artifacts
- re-run scoped `rg`/file-existence checks for Plate owner paths, explicit
  exclusions, preserved forks, partial sync entries, and recommended slices
- write a dated `review.md` artifact with the verdict and evidence

Review mode must not:

- patch `apps/www`
- change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or
  `partialSyncs`
- delegate implementation to `task`
- create a new implementation plan or advance the baseline
- treat a fresh review as user acceptance to implement

Review checks:

```bash
git -C ../shadcn fetch origin main --tags

node -e '
const fs = require("fs");
const status = JSON.parse(fs.readFileSync("docs/sync/shadcn/status.json", "utf8"));
console.log(JSON.stringify({
  lastSyncedCommit: status.lastSyncedCommit,
  lastPlannedCommit: status.lastPlannedCommit,
  lastPlan: status.lastPlan,
  partialSyncs: status.partialSyncs?.length ?? 0
}, null, 2));
'

BASE=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/sync/shadcn/status.json", "utf8")).lastSyncedCommit || "")')
PLANNED=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/sync/shadcn/status.json", "utf8")).lastPlannedCommit || "")')
TARGET=$(git -C ../shadcn rev-parse origin/main)

git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"
git -C ../shadcn log --oneline --decorate "$PLANNED..$TARGET" -- apps/v4
git -C ../shadcn diff --name-status --find-renames "$BASE..$TARGET" -- apps/v4
```

Staleness verdicts:

- `fresh`: current upstream target equals `lastPlannedCommit`, recomputed
  upstream inventory matches the selected run artifact, required Plate owner
  paths/source evidence still exist, and no partial-sync/status contradiction is
  found.
- `stale-upstream`: `origin/main` has newer `apps/v4` commits than
  `lastPlannedCommit` or the recomputed upstream inventory differs from the
  selected run artifact.
- `stale-local`: Plate owner paths or local search evidence used by the plan no
  longer match the current checkout.
- `stale-status`: `status.json` contradicts the selected plan, for example the
  selected plan target differs from `lastPlannedCommit` without an explicit
  override, or `partialSyncs` claim work that the local checkout no longer
  shows.
- `blocked-ref`: the baseline, planned target, selected target, or ancestry
  cannot be proven.

The review artifact must include:

- selected plan/run directory
- base, planned target, and current target SHAs
- upstream commit count and file-status count for `PLANNED..TARGET`
- inventory comparison result for `BASE..TARGET`
- local Plate owner/source evidence summary
- explicit exclusions and preserved forks checked
- status semantics checked
- verdict and the next action

Review output shape:

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

Before substantive work:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template sync-shadcn \
  --title "sync shadcn <short range or target>"
```

Fill the generated plan immediately. It must name the objective, flow mode,
completion threshold, verification surface, constraints, boundaries, output
budget strategy, blocked condition, and planned run directory. Do not replace it
with a smaller ad hoc plan.

Completion requires the named sync evidence plus:

```bash
node .agents/skills/autogoal/scripts/check-complete.mjs <docs/plans/path>
```

Never mark the active goal complete just because a range plan was written if
the goal also required implementation, baseline advancement, or user acceptance.

