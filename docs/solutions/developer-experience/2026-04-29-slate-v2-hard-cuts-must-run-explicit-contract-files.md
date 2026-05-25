---
title: Slate v2 hard cuts must run explicit contract files, not only default tests
type: solution
date: 2026-04-29
last_updated: 2026-05-17
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
  - examples
  - browser-contracts
  - benchmarks
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

When a hard cut deletes a public example route, sweep more than the example
registry:

- `site/constants/examples.ts`
- `site/pages/examples/[example].tsx`
- `site/examples/ts/<route>.tsx`
- `playwright/integration/examples/<route>.test.ts`
- `packages/slate-browser/src/core/first-party-browser-contracts.ts`
- `playwright/stress/generated-editing.test.ts`
- browser benchmark scripts under `scripts/benchmarks/browser/**`
- docs proof maps that name the route

If the behavior still exists, move the browser proof to the surviving public
route. If the route was only a synthetic harness, delete the harness-specific
stress rows and keep package-level tests for the runtime behavior.

For Playwright route migrations, remember that this repo configures
`testIdAttribute: 'data-test-id'`. Public example metrics that tests read
should use `data-test-id`, not `data-testid`.

## Why This Works

Bun's default test discovery does not treat every `*-contract.ts` file as a
test file. Explicit path runs are the only way to prove those files still match
the current API.

Example route hard cuts have the same shape: the route can disappear from the
nav while benchmark paths, generated stress rows, proof maps, or static exports
still point at it. Grepping route names after the cut catches those stale
references before the browser gate does.

## Prevention

- Hard-cut plans should include explicit-path contract runs when contract files
  do not match default test discovery.
- Direct public editor alias greps should include tests, not only package
  source and docs.
- If a test only proves a removed API, delete it.
- For deleted public examples, grep the route slug repo-wide after build-backed
  browser verification, excluding only intentional policy tags.
- Retarget benchmark paths to the surviving public route before deleting the
  old fixture.
