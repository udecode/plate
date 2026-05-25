---
title: Slate v2 site should resolve workspace source with webpack and pin tsx test tsconfig
date: 2026-04-11
category: docs/solutions/integration-issues
module: slate-v2 site and slate-react test runtime
problem_type: integration_issue
component: tooling
symptoms:
  - "The `site` app needed package builds before browser benches could run cleanly"
  - "Pointing `site` at workspace source with a copied Next config still produced `Module not found: Can't resolve 'slate'` under webpack"
  - "The `slate-react` package test runner kept throwing `React is not defined` on JSX helpers even though the package tsconfig already used `react-jsx`"
root_cause: config_error
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - nextjs
  - webpack
  - turbopack
  - tsx
  - workspace
  - jsx
---

# Slate v2 site should resolve workspace source with webpack and pin tsx test tsconfig

## Problem

The `slate-v2/site` app still behaved like it depended on prebuilt package
output, which is the opposite of the `apps/www` workflow we actually want.

At the same time, the `slate-react` package tests were still drifting into the
wrong JSX runtime on one import path.

## Symptoms

- browser benches would fail on the current app before the page even mounted
- copying a source-alias pattern into `site/next.config.js` fixed neither
  webpack nor the test runner by itself
- webpack dev reported `Can't resolve 'slate'` from example pages
- `pnpm --filter slate-react test` failed in the `withLinks` runtime row with
  `React is not defined`

## What Didn't Work

- assuming React 19 alone would make every compile path use the automatic JSX
  runtime
- assuming the same alias target format works for both turbopack and webpack
- patching lots of tiny components with `createElement(...)` instead of fixing
  the runner/config path that was wrong

## Solution

1. Make `site` resolve workspace packages to source directly in
   [next.config.js](/Users/zbeyens/git/slate-v2/site/next.config.js).
2. Use two alias maps:
   - turbopack gets import-style relative paths
   - webpack gets absolute filesystem paths
3. Enable `experimental.externalDir` so the app can compile package source
   outside `site/`.
4. Pin the `slate-react` package test script to its package tsconfig in
   [packages/slate-react/package.json](/Users/zbeyens/git/slate-v2/packages/slate-react/package.json):

```json
"test": "TSX_DISABLE_CACHE=1 tsx --tsconfig ./tsconfig.json --test test/**/*.tsx"
```

That made the test runner honor the package’s own `jsx: "react-jsx"` setting
instead of drifting into the wrong compile behavior, and it stopped stale `tsx`
cache state from lying about JSX-runtime regressions.

## Why This Works

There were two separate config bugs:

1. `apps/www`-style aliasing was copied too literally. Turbopack accepts
   import-style alias targets, but webpack wants absolute paths.
2. The `tsx --test` runner was not reliably using the package-local tsconfig,
   so one runtime test path still compiled JSX helpers the wrong way.

Once the app used source aliases correctly and the test runner used the right
tsconfig explicitly, the workflow stopped depending on prebuilt package output.

## Prevention

- when copying Next workspace-source alias logic, do not assume turbopack and
  webpack accept the same alias target format
- if a package test runner depends on JSX mode, pin `--tsconfig` explicitly
  instead of hoping the runner picks the right one
- React version does not decide JSX runtime behavior; the active compiler path
  does
