# Sync Main To Next

Handle $ARGUMENTS by loading `.agents/rules/release-lanes.mdc` and running only
its `Sync Main To Next` lane.

This is the complete fast mode within Release Lanes. `release-lanes`
owns the release architecture, script contract, hard stops, and handoff shape.

## Default Mode

Default to the real sync when the user says `release-lanes sync` without
arguments.

Use this sequence:

```bash
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --dry-run
node tooling/scripts/release-branch-prs.mjs sync-main-to-next --push
node tooling/scripts/release-branch-prs.mjs verify-main-to-next-sync
```

Then watch only the workflows created by the pushed sync commit:

```bash
gh run list --branch next --limit 10 \
  --json databaseId,name,workflowName,headSha,status,conclusion,displayTitle,url
gh run watch <release-run-id> --exit-status
gh run watch <ci-run-id> --exit-status
```

Read back:

```bash
npm view platejs dist-tags --json
npm view platejs@latest version
npm view platejs@beta version
gh release list --limit 5
gh pr list --base next --head sync/main-to-next --state open --json number,url
```

Close stale `sync/main-to-next` PRs only after the direct sync and release
verification pass and the active user request authorizes that cleanup and message.

## Keep It Fast

- A bounded sync checks this sequence directly without a new plan. If it grows
  into sustained investigation or repair, apply the project-wide standing
  Autogoal request and retain every remaining release/read-back obligation.
- Do not run autoreview at any priority, including P1.
- Do not create a `main -> next` PR.
- Do not touch promotion; this shortcut is not `next -> main`.
- Do not re-run broad release status commands once the pushed SHA is known.
- Do not wait on unrelated old workflow runs.

## Hard Stops

Use the `release-lanes` hard stops. In practice, stop only for:

- dirty checkout rejected by the direct sync script
- real source conflicts outside known release metadata
- branch protection rejecting the required push
- release or CI failure after one clear repair attempt
- npm/GitHub readback mismatch for the expected `latest` or `beta`

## Handoff

Report in five lines or fewer:

- pushed sync commit
- release and CI run URLs
- npm `latest` and `beta`
- stale PR cleanup result
- residual risk
