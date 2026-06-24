---
title: Plite React hook proof tests need package Vitest filters and internal Editor assertions
date: 2026-05-08
category: docs/solutions/developer-experience
module: plite slate-react tests
problem_type: developer_experience
component: testing_framework
symptoms:
  - "Bun path filters reported that the focused slate-react test file did not match any test files"
  - "A React hook proof test failed on Editor.hasPath or editor.hasPath even though the runtime behavior was correct"
root_cause: wrong_api
resolution_type: test_fix
severity: medium
tags: [plite, slate-react, vitest, bun, editor-api, tests]
---

# Plite React Hook Proof Tests Need Package Vitest Filters And Internal Editor Assertions

## Problem

Focused `plite-react` hook proof work can look broken when the wrong test runner
entrypoint or editor assertion API is used. The runtime hook can be correct while
the test fails before execution or crashes on an API shape the package does not
expose publicly at runtime.

## Symptoms

- `bun test ./packages/plite-react/test/use-element-selected.test.tsx` reports
  that filters did not match test files.
- Importing `Editor` from `slate` gives no runtime static API in `plite-react`
  tests.
- Calling `editor.hasPath(...)` can fail because the React editor object under
  test does not expose that instance helper.

## What Didn't Work

- Running the package file directly through root `bun test`. The package owns
  the Vitest config, jsdom environment, and file include rules.
- Importing `Editor` from public `slate` for static assertions. In this v2
  surface, the public root keeps `Editor` type-facing; internal tests that need
  static helpers should use the internal API.
- Switching to `editor.hasPath(...)`. That is not guaranteed on the editor
  object produced by this React package test setup.

## Solution

Run focused `plite-react` React tests through the package Vitest script:

```bash
# cwd: /Users/zbeyens/git/plite
bun --filter plite-react test:vitest -- use-element-selected
bun --filter plite-react test:vitest -- surface-contract -t useElementSelected
bun --filter plite-react typecheck
bun check
```

For internal package assertions about editor state, import the static editor API
from `plite/internal`:

```ts
import { createEditor } from 'slate'
import { Editor } from 'plite/internal'

expect(Editor.hasPath(editor, [2])).toBe(false)
```

Keep the public hook behavior under test; use the internal API only to assert
the editor state after the user-facing behavior happened.

## Why This Works

`plite-react` tests run under Vitest with a package-local jsdom config. Root Bun
file filters are not the same execution lane.

The public `slate` root intentionally does not expose every static helper as a
runtime value. Contract tests inside the repo can use `plite/internal` when they
need runtime state helpers such as `Editor.hasPath`, while public package code
and examples should stay on public imports.

## Prevention

- Start focused React hook proof with `bun --filter plite-react test:vitest -- <pattern>`.
- Use `plite/internal` only inside internal repo tests that need static editor
  assertions.
- Keep behavioral hook assertions separate from editor-state assertions: first
  prove the hook did not throw or returned the right boolean, then assert the
  document path exists or disappeared.
- Finish with `bun --filter plite-react typecheck` and `bun check` before
  promoting issue claims.

## Related Issues

- [Package typecheck must run public type contracts](./2026-05-04-package-typecheck-must-run-public-type-contracts.md)
- [Plite public root hard cuts need internal imports and explicit type exports](./2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md)
- [Plite React public selectors must stay model-truth](./2026-04-27-slate-react-public-selectors-must-stay-model-truth.md)
