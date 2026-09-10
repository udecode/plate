### `status`

Use `sync-shadcn status` when the user wants a quick checkpoint before choosing
the next sync step.

Purpose:

- show the current baseline, latest planned target, current upstream target, and
  whether the tracked plan looks fresh enough for decision-making
- list accepted partial syncs already landed
- list deferred decisions so the user can choose what to do next
- list reviewable Plate-vs-shadcn differences that are still intentionally
  undecided or deferred, especially visual parity gaps from scoped sync plans
- recommend the next command or decision

Status mode may:

- read `docs/sync/shadcn/status.json`
- read `lastPlan`, the linked `inventory.md`, and the latest run directory when
  present
- resolve `../shadcn` refs and fetch `origin main --tags` when the user asks for
  current upstream freshness; if fetch fails, report freshness as unverified
- count upstream commits and file-status rows for
  `lastPlannedCommit..origin/main`
- summarize `partialSyncs[*].slices`, `partialSyncs[*].deferred`,
  and plan `Questions`
- when the user supplies words after `status`, treat the remaining argument as
  a status scope filter, for example `status our /editors vs shadcn /blocks`;
  prefer the matching `partialSyncs[*].plan`, `lastPlan`, or run directory
  before falling back to global status
- summarize remaining reviewable differences from the matched plan's
  `Recommended Merge Slices`, `Visual Evidence`, `Implementation Result`, and
  `partialSyncs[*].deferred`

Status mode must not:

- patch `apps/www`
- write `docs/sync/shadcn/runs/**`
- write review artifacts
- change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or
  `partialSyncs`
- delegate implementation to `task`
- treat listed deferred items as accepted decisions
- list settled exclusions or preserved Plate forks as if they still need
  action; those belong in `review` evidence or the plan, not routine status
  output

Status must distinguish three things:

- `Landed`: accepted partial sync slices already applied.
- `Reviewable differences`: Plate still differs from upstream and the
  difference is not settled policy. These are the items the user can re-decide.
  Include the upstream behavior, current Plate behavior, likely owner files,
  and the smallest next command or decision.
- `Settled differences`: explicit exclusions and preserved Plate forks. Do not
  list these by default unless the user asks to re-open them.

Deferred item sources, in order:

1. `docs/sync/shadcn/status.json` `partialSyncs[*].deferred`
2. the selected plan's `Questions` section
3. recommended merge slices marked `defer`, `needs-question`, or not yet
   implemented
4. visual evidence rows where the plan says a Plate-vs-upstream difference
   still needs work
5. implementation-result notes that explicitly leave a follow-up slice open
6. status update notes that say `lastSyncedCommit` cannot advance

For visual scoped status, do not stop at "fresh" when visible deltas remain.
Report them as reviewable differences even when the scoped implementation was
verified. Example:

```md
Reviewable differences:
- BlockViewer toolbar: upstream `/blocks` has compact device controls,
  refresh, separated command pill, and v0 action; Plate `/editors` still keeps
  its current toolbar density and excludes v0. Decision: sync toolbar spacing
  only, keep Plate install/source behavior and no v0; or leave as Plate fork.
```

Collapse rejected upstream product/theme noise into its owning decision. Keep
Plate's accepted eight registry code styles separate from the rejected theme,
font, color, v0, and full project-designer surfaces.

Status checks:

```bash
node -e '
const fs = require("fs");
const status = JSON.parse(fs.readFileSync("docs/sync/shadcn/status.json", "utf8"));
console.log(JSON.stringify({
  lastSyncedCommit: status.lastSyncedCommit,
  lastPlannedCommit: status.lastPlannedCommit,
  lastPlan: status.lastPlan,
  partialSyncs: status.partialSyncs ?? []
}, null, 2));
'

git -C ../shadcn fetch origin main --tags
TARGET=$(git -C ../shadcn rev-parse origin/main)
PLANNED=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("docs/sync/shadcn/status.json", "utf8")).lastPlannedCommit || "")')
git -C ../shadcn log --oneline --decorate "$PLANNED..$TARGET" -- apps/v4
git -C ../shadcn diff --name-status --find-renames "$PLANNED..$TARGET" -- apps/v4
```

Status output shape:

```md
Status: <fresh | upstream-ahead | no-plan | blocked-ref | unverified>
Baseline: <lastSynced-short>
Planned: <lastPlanned-short>
Current upstream: <target-short>
Plan: <path or none>

Partial syncs:
- <date/range>: <landed slices>

Reviewable differences:
- <surface>: upstream <behavior>; Plate <behavior>; decision needed <adopt |
  smart-merge | keep fork>; files <paths>

Deferred decisions:
- <item>

Next: <run review | rerun planning | decide deferred item | implement accepted slice | advance baseline>
```

Keep status concise, but do not hide reviewable differences behind a generic
"deferred" label. If the user wants full evidence, tell them to run
`sync-shadcn review`.

