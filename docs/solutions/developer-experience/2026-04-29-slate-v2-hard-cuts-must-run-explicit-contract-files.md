---
title: Slate v2 hard cuts must run explicit contract files, not only default tests
type: solution
date: 2026-04-29
status: completed
category: developer-experience
module: slate-v2
problem_type: developer_experience
component: testing_framework
symptoms:
  - `bun check` passed while path-runnable contract files still referenced removed editor APIs
  - default Bun discovery skipped `*-contract.ts` files unless they were passed by explicit path
  - stale tests still taught `editor.schema.define`, `editor.getChildren`, and direct transform aliases after the public surface was cut
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags:
  - slate
  - slate-v2
  - hard-cut
  - contract-tests
  - public-api
---

# Slate v2 hard cuts must run explicit contract files, not only default tests

## Problem

The Slate v2 BaseEditor hard cut looked complete after `bun check`, but
explicit contract files still contained removed public editor APIs.

## Symptoms

- `bun check` passed.
- `bun test ./packages/slate/test/read-update-contract.ts ...` failed.
- Stale files referenced removed APIs like `editor.schema.define(...)`,
  `editor.getChildren()`, and `editor.insertText(...)`.

## What Didn't Work

- Treating default Bun discovery as the whole contract suite.
- Marking the plan done after public source, docs, and default tests were
  green.
- Keeping path-runnable contract files as stale reference material.

## Solution

Run the explicit contract files named by the plan, then either migrate or cut
stale contracts:

```bash
bun test ./packages/slate/test/*contract.ts \
  ./packages/slate-hyperscript/test/smoke-contract.ts
```

For kept contracts:

- use `editor.read(...)` for public reads
- use `editor.update((tx) => ...)` for public writes
- use `editor.extend(...)` for schema setup
- use `slate/internal` only when the test is explicitly internal

For deleted behavior, delete the test. Do not preserve a compatibility helper
just to keep old contract wording alive.

## Why This Works

Bun's default test discovery does not treat every `*-contract.ts` file as a
test file. Explicit path runs are the only way to prove those files still match
the current API.

## Prevention

- Hard-cut plans should include explicit-path contract runs when contract files
  do not match default test discovery.
- Direct public editor alias greps should include tests, not only package
  source and docs.
- If a test only proves a removed API, delete it.
