# Block agent edits in the main checkout

Status: superseded: the path resolver moved to 2026-10-19-main-checkout-guard-2

Playbook: feature

## Brief

### What will change?

When an agent tries to edit a file in the main checkout on next, the edit is refused and the agent is told to use its own worktree. The ledger and the run folders under plans artifacts can still be edited, as you asked. Main is guarded too.

### What could go wrong?

A session started in the main checkout stops at its first edit until it moves to a worktree. Shell commands and Codex can still write there.

## Teach

The main checkout is the folder that tracks next. The rule already said agents only pull there and do their work in their own worktree, but nothing enforced it. Sessions started from that folder, suggested-task cards included, edited next directly.

The project already runs one guard before each shell command, which stops force-pushes. That guard now also runs before each file edit. It finds which checkout the file lives in, and refuses the edit when that checkout is the main one and it is on next. A worktree nested inside the main folder counts as its own checkout, so it passes.

## Main changes

- `guard.mjs` handles `Edit`, `Write` and `NotebookEdit`. It resolves symlinks and on-disk case, finds the main checkout's folder by device and inode, and denies a path inside it, `.git` included, while that checkout is on the project or protected branch. The ledger `<plans>/suggested-tasks.decisions.tsv` and `<plans>/artifacts/` pass, and so does any checkout nested in that folder, such as a linked worktree. A session already in a worktree is told which file to edit there instead.
- `.claude/settings.json` runs the guard on those tools too.
- `rules/land.md` says the guard enforces the main-checkout rule, and that shell writes and Codex's `apply_patch` are not caught.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Shell writes | Not caught; the rule says so | Also parse shell commands for writes | "catch shell writes" | small |
| Main checkout on main | Also refused, since nobody edits from main | Refuse only on next | "only next" | small |
| Git broken | Every edit refused until git works | Let edits through | "let edits through" | detail |

## Steps

- [x] Add the edit check to `guard.mjs` with one test. Proof: the test passes and fails with the check removed.
- [x] Wire the hook and update `land.md` and the setup docs. Proof: real-path probes in this worktree.
- [ ] Panel on the diff, then land.

## Open work

- None yet.
