# Block agent edits in the main checkout: path resolver

Status: executed

Page: https://claude.ai/artifact/6gQbKY7MHM7vJqpmiun55x

Playbook: feature

## Brief

### What will change?

Agents can no longer edit a file in the main checkout while it is on next or main. The ledger and the artifacts folder stay open. A symlink, a step-up in the path or a git failure no longer gets around the block, because the guard refuses the edit instead.

### What could go wrong?

A session started in the main checkout stops at its first edit until it moves to a worktree. Shell commands and Codex still write there unchecked. A worktree cut before this landed gets the guard only once it rebases.

## Teach

Before it allows an edit, the guard must know which real file the edit will change. Claude Code first cleans the path text. It expands the home folder sign, makes the path absolute and drops the parts that step up a folder. It writes to that cleaned path, following a symlink in any parent folder, and refuses to write through a symlink at the end.

The first plan cleaned a link's target before following it, so a link that pointed up and out slipped through. The fix follows each part on disk, one at a time. It uses a link's target as raw text, step-up parts included, and keeps walking through missing folders. The guard also walks the uncleaned path, in case a future editor writes it as typed, and either walk can refuse the edit.

## Main changes

- `editDenial` trims the path and expands `~` like Claude Code, then walks two spellings, `path.resolve(cwd, file)` and the uncleaned `cwd/file`. Either walk landing in the main checkout outside the ledger and artifacts denies the edit.
- `resolvePhysically` walks a path's segments on disk. A symlink's raw target is spliced in, from root when it is absolute and from the link's parent when it is relative, so a `..` inside it is resolved on disk. It matches the real path wherever every folder exists. A missing segment is kept and the walk goes on, which projects where the file would land once the folder exists. It stops with an error after 40 links.
- Every git call is killed after 1 second, and a git error, a failed toplevel lookup, a malformed `pstack.json` or one without a branch name denies the edit instead of letting it through. A detached main checkout, such as a stopped rebase, is guarded like one on next.
- New test deny rows cover a link whose target holds `..` and the raw `escape/../a.txt` spelling; a new pass row covers an artifact reached through a link whose target holds `..`. Further deny rows cover a detached main checkout and a config whose branch is not a name.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Path order | Walk the cleaned path and the raw path, and refuse when either lands in the main checkout | Walk only the cleaned path Claude Code writes today | "cleaned only" | small |

## Steps

- [x] Panel on this plan.
- [x] Rewrite `resolvePhysically` and the error boundary, with the test changes. Proof: the new cases fail on the round 3 guard and pass on the new one, and the walk matches `realpathSync.native` on every existing fixture path.
- [x] Writing passes, then the diff panel, then sync, land and the dotai push.

## Open work

- Sync the other managed projects to dotai 36aa56e. ellie has never been synced and plate is behind. owner: zbeyens. stop: the next `sync-pstack sync`.
- `sync-pstack apply` does not add the edit tools to a project's PreToolUse matcher, so each trunk project wires it by hand as this one did. owner: zbeyens. stop: when a second project picks trunk delivery.

## Close

This landed the edit branch of `guard.mjs` from dotai [36aa56e](https://github.com/udecode/dotai/commit/36aa56e1a6884afce88dfafa5cc7915197c229cf), rendered here byte for byte, the PreToolUse matcher in `.claude/settings.json`, and the `land.md` and `chips.md` lines that name the artifacts exception.

The trunk tests pass, 14 of 14, and dotai's build, sync-pstack tests and skill check pass, 331 tests. The walk matched `realpathSync.native` on 34 of 34 real fixture paths. On real paths from this clone, three bypasses the round 3 guard let through are now denied, and the ledger, artifacts, sibling worktree and outside paths still pass. Each diff-round fix was probed alone in a scratch repo, where the pre-fix guard passed or hung for 12 seconds and the fixed one denied within a second. `sync-pstack verify` passes on this worktree.

Shell writes and Codex's `apply_patch` are not caught. Where a folder on the path is missing, the walk projects where the file would land once the folder exists. The hook runs only in sessions whose checkout holds this commit.

The first plan ran three diff rounds and was superseded when its resolver needed a second replacement. This iteration ran one plan round and one diff round, with no critical finding in the diff round, and applied seven warnings and nits. Beyond the ask, the guard also covers MultiEdit, NotebookEdit, the `.git` folder, the protected branch main and a detached main checkout.
