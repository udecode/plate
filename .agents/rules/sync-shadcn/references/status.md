# Incremental Status and Discovery (`status`)

Read-only checkpoint before choosing the next sync step. Permissions live in [policy](./policy.md).

## Scope and Behavior

- Show baseline (`lastSyncedCommit`), latest planned target (`lastPlannedCommit`), current upstream target, freshness, landed `partialSyncs`, deferred decisions, reviewable Plate-vs-shadcn differences (especially visual parity gaps from scoped plans), create compatibility gaps (options at `origin/main` with no verdict, or `pending`/`defer`), and recommended next action.
- Fetch `origin main --tags` in `../shadcn` when checking current freshness (if fetch fails, report `unverified`), count commits/file-status rows in `lastPlannedCommit..origin/main`, and run `pnpm sync-shadcn compat` (writes no file).
- Treat words after `status` as a scope filter (e.g., `status our /editors vs shadcn /blocks`), preferring the matching `partialSyncs[*].plan`, `lastPlan`, or run dir before falling back to global status. Summarize remaining reviewable differences from the matched plan's `Recommended Merge Slices`, `Visual Evidence`, `Implementation Result`, and `partialSyncs[*].deferred`.

Distinguish three buckets (never list settled exclusions/forks by default unless asked to reopen them):

- `Landed`: accepted partial sync slices already applied.
- `Reviewable differences`: Plate still differs from upstream without settled policy (include upstream behavior, Plate behavior, likely owner files, and smallest next command/decision). For visual scoped status, never stop at "fresh" while visible deltas remain (e.g., BlockViewer toolbar density/controls on `/editors` vs upstream `/blocks`).
- `Settled differences`: explicit exclusions and preserved Plate forks (collapse rejected upstream product/theme noise into its owning decision; keep Plate's accepted eight registry code styles and `/create` preset pickers separate from rejected v0 features and hand-copied theme/font/color/project designers).

Check deferred sources in order:

1. `status.json` `partialSyncs[*].deferred`
2. Selected plan's `Questions` section
3. Recommended merge slices marked `defer`, `needs-question`, or not yet implemented
4. Visual evidence rows noting unresolved Plate-vs-upstream deltas
5. Implementation-result notes leaving a follow-up slice open
6. Status notes stating `lastSyncedCommit` cannot advance

## Checks and Output Shape

Read `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, and `partialSyncs` from `docs/sync/shadcn/status.json`, then run:

```bash
git -C ../shadcn fetch origin main --tags
TARGET=$(git -C ../shadcn rev-parse origin/main)
git -C ../shadcn log --oneline --decorate "$PLANNED..$TARGET" -- apps/v4
git -C ../shadcn diff --name-status --find-renames "$PLANNED..$TARGET" -- apps/v4
pnpm sync-shadcn compat
```

```md
Status: <fresh | upstream-ahead | no-plan | blocked-ref | unverified>
Baseline: <lastSynced-short>
Planned: <lastPlanned-short>
Current upstream: <target-short>
Plan: <path or none>

Partial syncs:
- <date/range>: <landed slices>

Reviewable differences:
- <surface>: upstream <behavior>; Plate <behavior>; decision needed <adopt | smart-merge | keep fork>; files <paths>

Deferred decisions:
- <item>

Create compatibility at <origin/main-short>:
- <option>: no verdict | <state> in <item id>, <decision>

Next: <run review | rerun planning | decide deferred item | implement accepted slice | advance baseline>
```

Keep status concise without hiding reviewable differences behind a generic "deferred" label; point to `sync-shadcn review` for full evidence.
