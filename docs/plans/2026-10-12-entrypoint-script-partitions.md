# Stale entrypoint package scripts

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/Qp6XPWibcKcazWpT6iTDcX
Playbook: bug-fix

Three `plitejs` scripts, `test:entrypoint:hyperscript`, `test:entrypoint:pagination-react` and `test:entrypoint:root`, exited 1 with the runner's usage line because the names they pass are not partitions. They belong to a family of 57 `*:entrypoint:*` scripts in `plitejs` and `platejs` that the generator never owned. This run deletes the family and makes the generator own every script whose command names a task runner, so `pnpm check entrypoint-graph` refuses one that comes back.

## Teach

Plate's packages get their lint, test and typecheck commands from a generator. It groups each package's entrypoints into partitions and writes one command per partition. A CI check fails when a package's commands differ from what the generator would write.

The generator only rewrote commands whose names it recognized. An older setup had added one command per entrypoint under names it did not recognize, so 57 of them stayed. Some point at partitions that do not exist and fail right away. The others copy a partition command under another name, or run no tests. The CI check only looked at the names the generator recognized, so it missed all of them.

Now the generator rewrites every command that names the task runner, whatever the command is called. Regenerating drops the old ones, and the CI check fails if one comes back.

## Main changes

- `withManagedPackageScripts` in `tooling/entrypoints/entrypoint-turbo.mjs` now drops a script whose command names `run-entrypoint-task.mjs` or `run-entrypoint-package-task.mjs`, as well as one whose name matches the generator's pattern. `pnpm check entrypoint-graph` runs `assertEntrypointTurboGenerated`, which compares the whole manifest with that output. So the check refuses a script that names a runner and that the generator does not emit, and `pnpm generate` deletes it.
- `packages/plitejs/package.json` loses 27 `*:entrypoint:*` scripts and `packages/platejs/package.json` loses 30. Nothing else in either manifest changed.
- The `generated entrypoint Turbo state is current` test in `tooling/scripts/entrypoint-turbo.test.mjs` compares the whole script map with `withManagedPackageScripts` instead of a copied name regex.
- `CODING_STANDARDS.md` gains a rules-table row naming `pnpm check entrypoint-graph` as the gate for scripts whose command names a runner.

## Script decisions

The DAG puts each broken script's entrypoint in a partition that already has its own `*:partition:*` script, so pointing the old name at that partition would only add a second name for it. Each line covers the `lint`, `test` and `typecheck` scripts of that name.

| Package | Old script name | What it ran | Decision |
| --- | --- | --- | --- |
| plitejs | `hyperscript` | usage error; the entrypoint sits in partition `testing` | delete |
| plitejs | `pagination-react` | usage error; `pagination/react` sits in partition `pagination` | delete |
| plitejs | `root` | usage error; the entrypoint sits in partition `core` | delete |
| plitejs | `diff`, `dom`, `history`, `pagination`, `react`, `testing` | the same command as `*:partition:<name>` | delete |
| platejs | `diff`, `dom`, `history`, `hyperscript`, `pagination` | usage error; each sits in partition `proxies` | delete |
| platejs | `pagination-react` | usage error; passes `pagination/react`, while the partition is `pagination-react` | delete |
| platejs | `migrations`, `static` | the same command as `*:partition:<name>` | delete |
| platejs | `react`, `root` | lint and typecheck repeat the partition script; test runs a partition with no test files and exits 0 having run nothing | delete |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The 27 broken old scripts | Delete them | Point each at the partition that holds its entrypoint, a second name for a script that already exists | repoint | small |
| The 30 old scripts that still ran | Delete them too, since each repeats a partition script or runs no tests | Keep them as aliases | keep aliases | small |
| The old scripts in the Plate package | Remove them in this change, since the same generator fix covers them | Leave the Plate package for its own fix | plite only | small |
| Where the new check lives | The CI check that already compares commands with the generator's output | A new name check in the CI workflow test, which only looks at the root and docs app commands | workflow test | detail |
| Open-work notes about these scripts in two other plans | Leave them for you to clear | Edit those plans here | clear them | detail |

## Close

**Reversals and deviations.** None against the ask. The scope grew from the three named scripts to all 57, because the generator fix removes them all, as the Defaults row says.

**What landed, in the working tree on `next`, uncommitted.** The code change is in `tooling/entrypoints/entrypoint-turbo.mjs`, where `withManagedPackageScripts` also drops a script whose command matches `managedCommandPattern`, and in `tooling/scripts/entrypoint-turbo.test.mjs`. The generator's output removes 27 scripts from `packages/plitejs/package.json` and 30 from `packages/platejs/package.json`. `CODING_STANDARDS.md` gains one rules-table row. There is no changeset, because the scripts are dev-only.

**Proof.** The first four runs used detached worktrees at `6fa1169c5e` with this run's files copied in. The decision log holds each log path.

- Before the fix, `pnpm check entrypoint-graph` and the state test both pass with all 57 stale scripts present. That is how the defect escaped.
- The generator change alone fails both gates on the old manifests. The check says `platejs package scripts are stale`, and the test diff lists the 30 platejs `*:entrypoint:*` keys and no other key.
- With the full patch, both gates pass, and all 18 tests in `entrypoint-turbo.test.mjs` pass.
- Five scripts the check must refuse each fail it: the reported `test:entrypoint:root`, an alias of a valid partition under a new name, a composite command, a bogus `test:partition:*`, and an alias of the package runner.
- In this checkout, before the fix, the three named scripts exited 1 with the usage line. The runner calls behind two platejs scripts, `test:entrypoint:react` and `test:entrypoint:root`, printed nothing and exited 0, because their partitions have no test files.

**Limits.** The check reads command text only in the manifests of the three DAG packages. A script that calls a wrapper file passes it, and so does a runner call in the root `package.json` or in any other manifest. A `git grep` for the two runner file names finds them only in the three DAG manifests; nobody listed or tested scripts that reach a runner through another file. In this checkout, `pnpm check entrypoint-graph` passes the script comparison and then fails on `packages/platejs/turbo.json`, which another session's staged `entrypoint-dag.mjs` edit leaves stale. That is why the proof ran in worktrees. The full `pnpm check` did not run, because the change reaches only the entrypoint-graph step and the tooling test file, and both ran.

**Counts.** 20 items: 18 done, 2 skipped with reasons, 0 partial, 0 blocked, 0 open. The skips are the PR, because you asked for no commit or push, and the panel, because no review trigger applies. The run's todo record is `docs/plans/artifacts/2026-10-12-entrypoint-script-partitions/todo.md`.

**Attention.** Reviewed by codex:gpt-6.1-sol @xhigh, with no critical finding. All four of its findings are applied.

- The DAG mappings, the duplicate commands and the two empty test runs support deleting all 57 scripts. The manifests changed only by those deletions.
- On the final bytes, both gates and all 18 tests passed, and each of the five refusal forms has its failing log.
- The combined checkout has no green check. The full `pnpm check` did not run, and this checkout's entrypoint-graph step is red on another session's staged change.
- No commit, push, forbidden removal, stash or worktree prune ran. The freeze made one commit object for the review, and no branch points to it.

**Open work.**

- The open-work lines about these scripts in `docs/plans/2026-10-12-end-empty-line.md` and `docs/plans/topics/pagination.md` now meet their stops. owner: zbeyens. stop: both lines are removed. Tracked in those two files.

**Follow-up.** A later request in this session closed the review's side finding. It inlined the identity function `taskSuffix` and the `suffix` locals in `entrypoint-turbo.mjs`, and `createPartitionTsconfig` now calls `projectReferences` instead of copying it. The generator's output for all three packages stayed byte-identical, and both gates and all 18 tests in `entrypoint-turbo.test.mjs` passed at `6fa1169c5e` with the patch.
