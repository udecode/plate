---
title: Plite issue claims need exact browser proof and honest input contracts
date: 2026-05-23
category: docs/solutions/workflow-issues
module: plite issue ledger proof
problem_type: workflow_issue
component: testing_framework
symptoms:
  - "Issue ledger rows stayed Related because source-level representation existed without exact browser proof."
  - "Native input issues were tempting to close from model-owned beforeinput coverage alone."
  - "Bun rejected a bare test path as a filter instead of a file path."
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags: [plite, issue-ledger, browser-proof, beforeinput, bun]
---

# Plite issue claims need exact browser proof and honest input contracts

## Problem

Plite issue ledgers can drift if a row is promoted from source ownership
alone. Browser-facing issues need a browser row that follows the original user
flow, and input-event issues need an honest statement of whether Plite promises
native event parity or a model-owned editing callback.

## Symptoms

- `#5826` had selection repair and scroll forwarding code, but no exact
  long-editor blur, scroll, and refocus proof.
- `#5603` and `#5669` asked for native `input` event parity, while the runtime
  intentionally routes text through `beforeinput` and Backspace through a
  model-owned keydown command.
- `bun test packages/plite-history/test/history-contract.ts` failed with
  "filters did not match any test files"; Bun needed `./packages/...` to treat
  it as a path.

## What Didn't Work

- Treating scroll-selection source tests as enough for `#5826`. The issue was
  about viewport movement after a concrete long-editor refocus flow.
- Treating model-owned input tests as native `input` parity. That would overstate
  the contract and make the issue ledger less trustworthy.
- Running Bun's test path without `./`, which triggered filter semantics instead
  of path semantics.

## Solution

Write the smallest browser rows that match the issue claims:

- For `#5826`, add a huge-document row that clicks the top block, blurs the
  editor, scrolls to the final block, clicks back into the editor, and asserts
  the clicked final-block selection stays visible.
- For `#5603` and `#5669`, add a richtext row that proves the actual contract:
  start and number insertions are observable through `beforeinput`, while
  Backspace is a model-owned keydown delete command. Keep native `input` parity
  unclaimed.
- For package-path Bun tests, use `bun test ./packages/...`.

Then sync all claim surfaces in the same pass:

- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
- `docs/plite/references/pr-description.md`
- the active `docs/plans/**` execution plan
- the session `active goal state`

## Why This Works

Issue claims stay credible because every promotion has the same shape as the
reported user path. `#5826` can become `Fixes` because the browser proof matches
the long-editor refocus report. `#5603` and `#5669` stay Related because the
proof clarifies Plite's current input contract without pretending native
`input` events are guaranteed for every operation.

## Prevention

- Promote a Related issue only when the browser row follows the issue's original
  steps closely enough that a maintainer would recognize the repro.
- Name the contract honestly. If Plite owns the operation through `beforeinput`
  or keydown, do not call that native `input` parity.
- After any issue classification change, update the coverage matrix, fork
  dossier, manual sync ledger, PR reference, active plan, and completion state
  before marking the lane done.
- Use `bun test ./path/to/file.ts` for direct Bun test-file execution.

## Related Issues

- `#5826`
- `#5603`
- `#5669`
- `#3871`
- `#5847`
- `#3534`
- `#3551`
