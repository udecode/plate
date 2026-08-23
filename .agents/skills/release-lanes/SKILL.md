---
description: 'Maintain Plate''s latest and beta release lanes end-to-end with an autogoal plan: promote next to main, sync main directly back into next, repair release metadata conflicts, re-enter beta, and verify npm/GitHub release state.'
argument-hint: '[status | sync | promote | verify | full]'
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

One invocation is permission to run the lane until completion. Ask again only
for hard stops.

## Autogoal Contract

This is a derived autogoal skill.

Default flow mode: one-shot execution.

Use:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template release-lanes \
  --title "release lane maintenance"
```

Create or continue a goal before mutating remote release branches. The goal is
complete only when the requested lane state is true and the template gates pass.

## Lanes

- `main` publishes stable packages with npm tag `latest`.
- `next` publishes prerelease packages with npm tag `beta`.
- `.changeset/pre.json` belongs on `next` only.
- `main` must never publish while `.changeset/pre.json` exists.
- Major changesets target `next` for beta before stable promotion.
- Minor changesets target `main`, not `next`.
- Patch changes may target `main`; use `next` patch changes only for active
  beta-lane fixes or direct-sync beta metadata.

## Plite Release Claims

Package publication runs `pnpm plite:release:packages` and does not imply broad
Plite behavior readiness. When repository release input selects
`PLITE_RELEASE_CLAIM_PROFILE=release-ready`, `pnpm plite:release:proof` must
resolve the run named by `PLITE_RELEASE_PROOF_RUN_ID` from live GitHub Actions
metadata. That run must be a successful manual
`.github/workflows/plite-ci.yml` run in the same repository at the exact release
SHA. The verifier requires exactly one unexpired `plite-release-proof`
artifact, downloads it by GitHub artifact ID, verifies GitHub's SHA-256 archive
digest, requires the manifest's run attempt to match the live run attempt, and
reads no caller-local manifest. It also rejects tracked or untracked checkout
changes before accepting the source claim. Missing, stale, incomplete, failed,
tampered, dirty, or non-canonical evidence blocks that explicit claim. Do not
infer broad readiness from source tests, historical artifacts, or package
proof, and do not select the profile without that authoritative producer run.

The current Plite CI workflow does not emit `plite-release-proof`, so the broad
profile is unavailable. A future producer job must build the manifest from
lane-owned outputs after those jobs pass; accepting an operator-supplied
manifest would recreate the fake authority this gate rejects.

The profile and run ID are repository-wide release inputs. Change them only
when the user explicitly authorizes a broad release-ready claim. Preflight the
producer from a clean checkout at the exact release SHA before setting them.
The verifier reads and downloads from live `udecode/plate` Actions data and
requires an Actions-read token even outside the release workflow:

```bash
gh run view <run-id> --json headSha,conclusion,event,workflowName,url
PLITE_RELEASE_PROOF_GITHUB_TOKEN="$(gh auth token)" \
  node tooling/scripts/check-plite-release-proof.mjs \
  --profile release-ready \
  --expected-commit <release-sha> \
  --producer-run-id <run-id>
```

Then set both inputs before the target release begins:

```bash
gh variable set PLITE_RELEASE_CLAIM_PROFILE --body release-ready
gh variable set PLITE_RELEASE_PROOF_RUN_ID --body <run-id>
```

After the target release finishes or fails, clear both inputs and read them
back. Do not leave a broad claim armed for the next push:

```bash
gh variable delete PLITE_RELEASE_CLAIM_PROFILE
gh variable delete PLITE_RELEASE_PROOF_RUN_ID
gh variable list
```

## Modes

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

Run after a stable release, after merging a promote PR, or whenever `main` has
commits missing from `next`.

Dry run first:

```bash
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --dry-run
```

Then run the direct sync:

```bash
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --push
```

The script must:

- fetch `main` and `next`
- refuse real direct sync when the checkout has local tracked or untracked
  changes
- create a merge commit on `next`
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

Merging the promote PR is allowed when the user asked for full automation or
merge. Use a merge commit, not squash or rebase.

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

Do this only after direct sync and verification pass.

## Hard Stops

Stop only for:

- missing GitHub or npm auth needed for the requested live action
- real source conflicts outside package manifests, changelogs, and
  `.changeset/pre.json`
- release workflow failure after one clear retry or repair attempt
- npm `latest` or `beta` points at an unexpected version after publication
- branch protection rejects the required merge or push
- local tracked or untracked changes are present before a real direct sync

Do not stop to ask whether to run the next obvious lane step. The goal plan is
the authorization boundary.

## Handoff

Report:

- `main` SHA and `next` SHA
- promote PR URL or N/A
- direct sync result and pushed commit
- beta pre mode state
- release run URLs
- npm `latest` and `beta` versions
- stale PR cleanup
- residual risk or `none`
