---
date: 2026-04-04
problem_type: developer_experience
component: tooling
root_cause: config_error
title: Editor benchmark targets should use source for dev and built for runs
tags:
  - benchmarks
  - vite
  - aliases
  - local-packages
  - monorepo
severity: medium
---

# Editor benchmark targets should use source for dev and built for runs

## What happened

The vendored editor benchmark lab originally pointed the Plate target at the
published npm packages.

That was wrong for a repo-local benchmark.

Inside `plate-2`, the benchmark should answer:

- how the current checkout behaves
- how local edits affect the target

Published packages answer neither.

There was a second trap too: naive Vite alias maps added the package root alias
before the `/react` subpath alias, so imports like `@platejs/basic-nodes/react`
were rewritten to nonsense paths like `dist/index.js/react`.

## What fixed it

Use the same split that `apps/www` uses in spirit, but at the Vite layer:

- `source` mode
  - alias Plate package imports to local `src` entrypoints
  - use for dev and iteration
- `built` mode
  - alias Plate package imports to local `dist` entrypoints
  - use for benchmark builds and real comparison runs
- `published` mode
  - keep only as a fallback/reference lane

Also:

- build aliases as exact entries, not broad prefix hacks
- register subpaths like `/react` and `/static` before the package root alias
- make root benchmark helpers prepare the local package builds before benchmark
  preview/contract runs

## Reusable rule

For a benchmark target living inside the same repo as the framework it tests:

- dev should use local source
- serious benchmark numbers should use local built outputs
- published npm packages should not be the default truth source

And for Vite alias maps:

- exact aliases beat prefix aliases
- subpaths must win before roots

If `@platejs/foo` aliases first and `@platejs/foo/react` aliases second, Vite
will happily hand you garbage.
