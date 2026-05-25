---
title: Slate v2 Clawpatch fix batches need dirty-gate and provider-failure fallbacks
date: 2026-05-18
last_updated: 2026-05-19
category: docs/solutions/workflow-issues
module: slate-v2 clawpatch workflow
problem_type: workflow_issue
component: tooling
symptoms:
  - Clawpatch fixed the first finding, then blocked the next fix on its own dirty worktree output.
  - A later Clawpatch provider run failed after stream and auth retries without changing files.
  - The report still had valid findings that needed direct patches and status sync.
  - Clawpatch revalidation reopened a source-fixed package because the exported dist artifact was stale.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [slate-v2, clawpatch, revalidate, triage, workflow]
---

# Slate v2 Clawpatch fix batches need dirty-gate and provider-failure fallbacks

## Problem

Clawpatch is useful as the finding store and one-finding repair loop, but a multi-finding Slate v2 batch cannot assume every `clawpatch fix --finding` run will complete. The workflow needs a fallback that preserves the Clawpatch ledger without leaving valid repo bugs unfixed.

## Symptoms

- `clawpatch fix --finding ...` applied the first fix and ran validation.
- The next fixes failed with `dirty worktree blocks fix` because the first Clawpatch edit made the checkout dirty.
- Temporarily disabling the dirty gate let more findings run.
- A later provider call failed after repeated stream/auth errors and changed no files.
- `clawpatch revalidate --finding ... --json` reported a finding as still open even though source was fixed, because `packages/*/dist` still contained the old exported package code.

## What Didn't Work

- Re-running the same `clawpatch fix` command after the dirty-worktree error. It repeated the same block.
- Waiting indefinitely for the provider-backed fix. The failed patch record showed stream reconnects and auth refresh failures, not a code failure.
- Treating stale `.clawpatch/findings/*.json` status as truth after verified manual fixes.

## Solution

Use Clawpatch where it can operate, but keep the repo moving when the tool layer fails.

```bash
clawpatch fix --finding <id>
```

If the next finding is blocked only because the previous Clawpatch fix dirtied the checkout, temporarily turn off the local dirty gate, run the remaining fix pass, then restore the default:

```json
{
  "git": {
    "requireCleanWorktreeForFix": false,
    "commit": false,
    "openPr": false
  }
}
```

If the provider fails without writing files, patch directly from the report, add focused regression tests, then sync the Clawpatch store explicitly:

```bash
clawpatch revalidate --finding <id> --json
clawpatch triage --finding <id> --status fixed --note "Fixed in working tree; bun check passed."
clawpatch triage --finding <false-positive-id> --status false-positive --note "Repro disproves the finding premise."
clawpatch status --json
```

If revalidation says source is fixed but exported package output is stale, rebuild the affected package before revalidating again:

```bash
bun --filter slate-react build
clawpatch revalidate --finding <id> --json
```

## Why This Works

The Clawpatch report stays the source of truth for finding identity and status, while the implementation does not depend on a long-running provider call being healthy. `clawpatch status --json` gives a concrete closeout signal: `openFindings: 0`.

For published packages in this repo, Clawpatch can also inspect the package surface that users actually import. A fix that only updates `src/` is incomplete when `package.json` exports `dist/index.js` and the tracked `dist/` file still has the old behavior.

## Prevention

- Run one real `clawpatch fix --finding` first to prove the tool works before launching a batch.
- Record false positives with `clawpatch triage`, not by silently ignoring them.
- Restore `requireCleanWorktreeForFix: true` after any local multi-finding run.
- When revalidation cites stale exported output, rebuild the affected package and revalidate the same finding again.
- Keep a repo plan file with the finding verdicts, because Clawpatch provider failure can happen mid-batch.
- Close with both repo verification and Clawpatch status:

```bash
bun check
clawpatch status --json
```

## Related Issues

- docs/solutions/developer-experience/2026-05-16-slate-transform-middleware-defaults-need-alias-depth-guard.md
- docs/solutions/developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md
