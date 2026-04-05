---
title: Slate Monorepo Updates Need One Custom Sync Workflow
type: solution
date: 2026-03-31
status: completed
category: workflow-issues
module: dependency-automation
problem_type: workflow_issue
component: tooling
symptoms:
  - Dependabot grouping did not cleanly match the desired one-PR shape across multiple package manifests.
  - The repo needed one PR that bumps all Slate packages together, not separate PRs by directory or dependency.
root_cause: missing_tooling
resolution_type: workflow_improvement
severity: low
tags:
  - slate
  - dependabot
  - github-actions
  - npm-check-updates
  - monorepo
---

# Slate Monorepo Updates Need One Custom Sync Workflow

## Problem

The repo needed automated Slate dependency bumps, but the desired shape was strict: one direct sync, all Slate packages, across every manifest that pins them.

## Root Cause

The missing piece was not version detection. It was workflow shape.

GitHub-native dependency bots are fine for generic updates, but the exact ask here was tighter: bundle `slate`, `slate-dom`, `slate-react`, and `slate-hyperscript` into one monorepo sync instead of splitting by dependency or directory.

## Fix

Add a dedicated scheduled GitHub Actions workflow that:

- runs once per day
- filters updates to the Slate package family only
- rewrites workspace manifests with `npm-check-updates`
- refreshes lockfiles with `pnpm install`
- syncs one stable `.changeset/slate.md`
- commits and pushes straight to `main` with `[skip release]`

## Rule

If a dependency automation request is really about sync shape, solve the sync shape directly.

Do not force a general-purpose dependency bot into a workflow it does not express cleanly.
