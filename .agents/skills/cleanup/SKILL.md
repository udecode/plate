---
name: cleanup
description: "Audit disk usage and remove idle git worktrees, Next.js caches, test Postgres DBs, and unused Bun/npx/uv/Docker caches while preserving active checkouts. Use for /cleanup, /cleanup disk, or freeing worktree/build disk space."
argument-hint: '[scan|all|disk]'
---

# Cleanup

Extends pstack's Worktree and simulator cleanup playbook (this skill wins on differences). Always remove worktrees with `git worktree remove --force`, never `rm -rf`, `git worktree prune`, or `git stash`. `scripts/scan.mjs` makes every verdict deterministically.

## Modes

- `/cleanup scan`: classify and report without deleting.
- `/cleanup`: remove the `SAFE` set in the current repository plus `machine.mjs --delete`.
- `/cleanup all`: run across all sibling checkouts (`--repos <parent dir>`) plus `machine.mjs --delete`.
- `/cleanup disk`: read-only space audit via `node <skill>/scripts/disk.mjs` (run in background; scans home, `/private/tmp`, tmp, `/Applications` >=10 GB up to 5 levels, flags `written` vs `quiet`). Never delete quiet rows automatically; run `/cleanup scan` on top worktree repos.

## Supporting commands

- `scan.mjs --landed <worktree>`: verifies the main checkout holds all changes and `<plans>/artifacts/` ignored files of a landed card worktree before leaving it for cleanup.
- `scan.mjs --remove <worktree>...`: used by `/chips` cleanup to stop processes, save unique state, and remove archived card worktrees (skips locked, active, unresolved-merge, or unsafe paths).
- `scan.mjs --brief --auto`: optional `SessionStart` hook; runs at most once/day in background removing only `SAFE` items (disable via `auto cleanup: off` in `~/.claude/pstack-models.md`).
- `machine.mjs [--delete]`: clears `SAFE` global caches (week-old Bun transpiler files, idle npx installs, `uv cache prune`, unused anonymous Docker volumes) and lists `ASK` items (pnpm store, named compose volumes).
- `daily.mjs install`: installs a 05:30 launchd job running cleanup across `~/git` (logs to `~/Library/Logs/cleanup-daily/`). Lock any pinned worktree with `git worktree lock` so daily runs keep it.

## Workflow (`/cleanup`, `/cleanup scan`, `/cleanup all`)

1. Record `df -h <checkout>` (macOS `df -h /` shows the read-only system volume, not data).
2. If the runtime has a session-list tool, save all sessions (including archived) as a JSON array in the run directory. Without it, idle worktrees expire after one quiet day.
3. Run `node <skill>/scripts/scan.mjs --repo . --sessions <file>` (or `--repos <dir>` for `all`) in the background. Verdicts:
   - **Worktree `KEEP`:** locked, T3-managed (`~/.t3/worktrees/`), current worktree, active process/server, running/pinned session, or modified/transcript-written within 1 day (reads HEAD reflog, Claude project transcripts, Codex rollouts).
   - **Worktree `SAFE`:** agent-created location or `claude/`/`codex/`/detached branch with no `KEEP` signal. Before removal, `--delete` saves unique state under `<git-dir>/cleanup/<worktree>-<id>/` (`changes.patch`, `staged.patch`, `commits.bundle`, `ignored/`, `worktree` metadata), re-verifies no write occurred during save, removes via `git worktree remove --force`, and expires week-old saves. Restore within a week via `git fetch <save>/commits.bundle 'refs/cleanup/*:refs/restored/*'`, `git worktree add --detach`, `git apply`, and copying `ignored/`.
   - **Worktree `ASK`:** outside agent folders, nested worktree/dirty submodule, unresolved merge, unreadable git history, >20k ignored files, or missing `.git` with remaining files.
   - **Caches:** `.next`/`.next-plite` build outputs stay; their `dev`/`cache` subdirs expire after 1 quiet day (`main` checkout `.next-<port>` / `dev` kept 7 days for Turbopack cache; worktree `.next-*` kept 1 hour, or 7 days if `BUILD_ID` exists). Active server locks keep caches.
   - **Run folders (`<plans>/artifacts/*`, `.tmp/*`):** `KEEP` if active/worktree/written within 1 day; `SAFE strip` removes `node_modules`/`.next*`/`.turbo`; `SAFE expire` removes week-old unreferenced folders (after saving clone patches). Top-level files (ledger) are never touched.
   - **Local Docker Postgres DBs:** `KEEP` if referenced by an env file, active connection, or written within 1 day; `SAFE` otherwise (dropped without `FORCE`).
4. For `/cleanup scan`, report the table and stop. Otherwise refresh the session list and run `scan.mjs --delete` plus `machine.mjs --delete`.
5. List every `ASK` row with path, size, reason, and session title. Only delete rows the owner explicitly names (`git worktree remove --force <path>`) and lock any they want kept (`git worktree lock --reason "<why>" <path>`).
6. Record `df -h <checkout>` again and report actual space freed (`du` overcounts APFS clones), what was removed, and each kept/asked item.

**Next telemetry note:** If a `KEEP` row is held only by orphaned `next/dist/telemetry/detached-flush.js` (PPID 1), stop them, run `next telemetry disable`, and rescan.
