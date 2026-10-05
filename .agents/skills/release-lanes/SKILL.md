---
description: Promote Plate beta releases, sync main back to next and verify published npm/GitHub state with release authority.
argument-hint: '[status | verify | sync | promote] [dry-run | execute]'
name: release-lanes
metadata:
  skiller:
    source: .agents/rules/release-lanes.mdc
---

# Release Lanes

Use this when the user asks to maintain Plate `latest` and `beta`, promote beta
to stable, sync `main` into `next`, recover release lane drift, verify npm
dist-tags, or run the release lane after a stable release.

## Core Take

CI owns publishing. This skill owns lane maintenance.

Do not create a routine `main -> next` sync PR. That path creates review churn
for deterministic release metadata conflicts. Sync directly with a merge commit,
repair known release metadata automatically, push `next`, then let `release.yml`
publish beta.

## Lanes

- `main` publishes stable packages with npm tag `latest`.
- `next` publishes prerelease packages with npm tag `beta`.
- `.changeset/pre.json` belongs on `next` only.
- `main` must never publish while `.changeset/pre.json` exists.

## Plite Release Claims

Package publication runs `pnpm plite:release:packages` and does not imply broad
Plite behavior readiness. A `release-ready` claim needs the authoritative
producer run that `tooling/scripts/check-plite-release-proof.mjs` verifies;
missing, stale, incomplete, failed, tampered, dirty, or non-canonical evidence
blocks that explicit claim. Do not infer broad readiness from source tests,
historical artifacts, or package proof, and do not select the profile without
that authoritative producer run.

The current Plite CI workflow does not emit `plite-release-proof`, so the broad
profile is unavailable. A future producer job must build the manifest from
lane-owned outputs after those jobs pass; accepting an operator-supplied
manifest would recreate the fake authority this gate rejects.

The profile and run ID are repository-wide release inputs. Change them only
when the user explicitly authorizes a broad release-ready claim. Preflight the
producer from a clean checkout at the exact release SHA before setting them.
The verifier reads and downloads from live `udecode/plate` Actions data and
requires an Actions-read token even outside the release workflow.

After the target release finishes or fails, clear both inputs and read them
back. Do not leave a broad claim armed for the next push.

## Modes

These are skill arguments, not subcommands of `release-branch-prs.mjs`.

| Invocation | Action |
| --- | --- |
| `release-lanes status` | Read branch, workflow and npm state. |
| `release-lanes sync` | Dry-run, then perform and push the direct main-to-next sync. |
| `release-lanes sync dry-run` | Inspect the direct sync without committing or pushing. |
| `release-lanes promote` or `promote dry-run` | Dispatch the promotion workflow with `dry_run=true`. |
| `release-lanes promote execute` | Dispatch with `dry_run=false`; verify the generated next-to-main PR. Merge only with merge authority. |
| `release-lanes verify` | Read release workflows, npm tags and GitHub releases. |
| `release-lanes full <scope>` | Status, the explicitly requested promotion/merge or sync steps, then verification. No unrelated release operation is implied. |

### Status

Read state only:

```bash
git fetch origin main next
gh pr list --base main --head next --state open --json number,title,url,state
gh run list --workflow release.yml --branch main --limit 5 \
  --json databaseId,status,conclusion,createdAt,url
gh run list --workflow release.yml --branch next --limit 5 \
  --json databaseId,status,conclusion,createdAt,url
npm view platejs dist-tags --json
```

Record:

- `origin/main` SHA
- `origin/next` SHA
- whether `origin/next:.changeset/pre.json` exists and has tag `beta`
- latest GitHub release
- npm `platejs` dist-tags for `latest` and `beta`
- open promote PR, if any
- stale `sync/main-to-next` PRs, if any

### Sync Main To Next

This fast mode is the whole direct sync recipe. It skips planning and panel review unless a planning artifact was requested.

Run after a stable release, after merging a promote PR, or whenever `main` has
commits missing from `next`.

Dry run first:

```bash
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --dry-run
```

Then run the direct sync from a clean detached worktree, never from the shared checkout. The real sync checks out `origin/next` detached in whatever checkout runs it, and it refuses local changes. Create the worktree with `git worktree add --detach ../plate-sync origin/next`, run `pnpm install` there, and run the sync from it. Remove it afterward with `git worktree remove ../plate-sync`.

For an explicit `dry-run` request, stop after the dry run and report it.

```bash
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --push
```

The script must:

- fetch `main` and `next`
- refuse real direct sync when the checkout has local tracked or untracked
  changes
- create the merge commit on a detached checkout of `origin/next`, leaving local branches and the git identity unchanged
- keep `next` beta package versions over `main` stable versions
- keep `.changeset/pre.json` from `next`, or create beta pre mode in the same
  sync commit when `next` is out of pre mode after promotion
- insert or refresh stable changelog sections from `main`
- create patch changesets for public packages changed by the synced `main`
  commits so the beta lane can publish those fixes
- run `pnpm ci:version` before committing when beta changesets are generated,
  so `next` receives versioned beta package metadata instead of a pending
  Version Packages PR
- use a `[skip release]` sync commit only when no beta changesets were generated
- verify the merge commit with `verify-main-to-next-sync`
- push directly to `origin/next`

If the script stops on files outside known release metadata, do not guess.
Resolve only when source ownership is obvious; otherwise stop with exact files.

Then watch only the workflows created by the pushed sync commit:

```bash
gh run list --branch next --limit 10 \
  --json databaseId,name,workflowName,headSha,status,conclusion,displayTitle,url
gh run watch <release-run-id> --exit-status
gh run watch <ci-run-id> --exit-status
```

- Do not re-run broad release status commands once the pushed SHA is known.
- Do not wait on unrelated old workflow runs.

### Re-Enter Beta

After a beta-to-stable promotion, `next` may be out of prerelease mode. The
direct `main -> next` sync restores beta pre mode in the same unskipped merge
commit, so the next release workflow can publish the generated beta changesets.

Use a standalone beta re-entry commit only when no direct sync is needed and no
beta changesets need publication:

```bash
git switch next
git pull --ff-only origin next
pnpm changeset pre enter beta
git add .changeset/pre.json
git commit -m "chore: enter beta pre-release mode [skip release]"
git push origin next
```

If `.changeset/pre.json` already exists with `{ "mode": "pre", "tag": "beta" }`,
record N/A and do not create a duplicate commit.

### Promote Beta To Stable

Run dry first unless the user explicitly asks for the real promotion:

```bash
gh workflow run promote.yml --ref next -f dry_run=true
gh run watch <run-id> --exit-status
```

For a real promotion:

```bash
gh workflow run promote.yml --ref next -f dry_run=false
gh run watch <run-id> --exit-status
```

Then review the generated `next -> main` PR:

- base `main`
- head `next`
- no `.changeset/pre.json`
- package versions are stable, not `-beta.*`
- body tells maintainers to use **Create a merge commit**

Merge the promote PR only when the user explicitly authorized that merge as
part of the release request. Use a merge commit, not squash or rebase.

### Verify Releases

Watch release workflows:

```bash
gh run list --workflow release.yml --branch main --limit 5 \
  --json databaseId,status,conclusion,createdAt,url
gh run list --workflow release.yml --branch next --limit 5 \
  --json databaseId,status,conclusion,createdAt,url
```

Verify npm:

```bash
npm view platejs dist-tags --json
npm view platejs@latest version
npm view platejs@beta version
```

Verify GitHub releases:

```bash
gh release list --limit 10
```

## Stale PR Cleanup

Close stale `sync/main-to-next` PRs after direct sync succeeds:

```bash
gh pr list --base next --head sync/main-to-next --state open --json number,url
gh pr close <number> --comment "Closing because release-lanes synced main directly into next."
```

Do this only after direct sync and verification pass and the active request
authorizes closing the stale PRs and posting the cleanup message.

## Hard Stops

Stop only for:

- missing GitHub or npm auth needed for the requested live action
- real source conflicts outside package manifests, changelogs, and
  `.changeset/pre.json`
- release workflow failure after one clear retry or repair attempt
- npm `latest` or `beta` points at an unexpected version after publication
- branch protection rejects the required merge or push
- local tracked or untracked changes are present before a real direct sync
