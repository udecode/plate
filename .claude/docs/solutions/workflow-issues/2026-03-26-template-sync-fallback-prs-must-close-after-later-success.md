---
module: Registry Automation
date: 2026-03-26
problem_type: workflow_issue
component: tooling
symptoms:
  - "A fallback template-fix PR stays open even after a later release run successfully syncs templates onto `main`"
  - "The open PR is conflicted and only contains stale template package and lockfile drift"
  - "Release history shows `chore: sync templates after release` on `main`, but the old fallback PR still exists"
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - templates
  - github-actions
  - release
  - pull-requests
  - cleanup
  - automation
---

# Template sync fallback PRs must close after a later successful run

## Problem

The release workflow could create a fallback PR on template-sync failure, but a later successful release run left that PR open.

That created zombie PRs like `templates/release-sync-failure`: stale, conflicted, and already superseded by `main`.

## Root cause

The workflow was asymmetric:

- failure path: create `templates/release-sync-failure` PR
- success path: push synced templates to `main`

What it did not have was a cleanup step that closed an already-open fallback PR after the success path landed.

## Solution

In [`release.yml`](/Users/zbeyens/git/plate/.github/workflows/release.yml), give the successful template push step an id and add a follow-up cleanup step with `actions/github-script`.

That cleanup step should:

1. run only when template update succeeded and either:
   - no template changes were produced, or
   - template CI succeeded and the synced templates were pushed to `main`
2. list open pull requests whose head branch is `templates/release-sync-failure`
3. comment that the PR is being superseded by the successful sync on `main`
4. close the PR

## Why this works

The fallback PR is just a recovery artifact. Once a later run proves the templates synced cleanly to `main`, that artifact is no longer the source of truth.

Closing it automatically keeps the release queue clean and prevents reviewers from staring at a dead PR that CI has already made irrelevant.

## Prevention

Whenever a workflow has:

- a failure branch that opens a fallback PR
- and a later-success branch that can land the same recovery directly on `main`

it also needs an explicit cleanup branch that closes any older fallback PRs. GitHub will not do that for free just because the later run skipped the PR-creation step.
