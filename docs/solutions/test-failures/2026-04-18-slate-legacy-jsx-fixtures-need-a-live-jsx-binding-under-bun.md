---
title: Slate legacy JSX fixture bindings should stay in the Bun preload loader
date: 2026-04-18
category: test-failures
module: slate-v2
problem_type: test_failure
component: testing_framework
symptoms:
  - "The full `packages/slate/test/index.spec.ts` harness failed before Slate logic ran with `React is not defined` or `jsx is not defined`"
  - "Focused product-code tests were green while many same-path legacy fixtures still crashed at module evaluation"
  - "A spec-level helper started mutating `globalThis.jsx` and `globalThis.React` around fixture imports"
root_cause: config_error
resolution_type: test_fix
severity: high
tags: [slate, slate-v2, bun, jsx, fixtures, hyperscript]
---

# Slate legacy JSX fixture bindings should stay in the Bun preload loader

## Problem

The full `slate` fixture harness was red even though the product-code tests were
already green.

The failures were not coming from Slate behavior. They were happening before the
tests even ran:

- `React is not defined`
- `jsx is not defined`

The obvious trap after that was to patch the spec harness instead of fixing the
fixture loader. That creates a second source of truth for legacy JSX handling
and leaks fake globals into a lane that should just import fixtures and run
assertions.

## Symptoms

- `bun test ./test/index.spec.ts` failed across large swaths of
  `interfaces/**`, `operations/**`, `normalization/**`, and `transforms/**`
  before any assertion ran.
- The current Bun preload already had a `legacy-hsx-fixtures` loader targeting
  `packages/slate`, `packages/slate-history`, and
  `packages/slate-hyperscript` fixture trees.
- `packages/slate/test/index.spec.ts` still grew an extra helper that wrapped
  every fixture import with temporary `globalThis.jsx` and `globalThis.React`
  mutation.

## What Didn't Work

- Treating the remaining failures as product regressions first.
- Splitting the test stack into more runtime lanes just to paper over a legacy
  fixture family.
- Keeping a spec-local helper that mutates globals around every dynamic import.

## Solution

Keep one owner for legacy fixture binding: the Bun preload loader in
[config/bun-test-setup.ts](/Users/zbeyens/git/slate-v2/config/bun-test-setup.ts).

That loader already:

- matches the legacy fixture filename family
- runs those files through a classic JSX transform with `jsxFactory: 'jsx'`
- injects a `jsx` import from
  [slate-test-jsx.js](/Users/zbeyens/git/slate-v2/config/slate-test-jsx.js)
  when the fixture does not declare one itself

Once that loader is in place, the spec harness should stay boring:

- dynamic-import the fixture module
- run the fixture
- do not patch `globalThis.jsx`
- do not replace `globalThis.React` with a fake hyperscript object

That let
[packages/slate/test/index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts)
drop the `withLegacyClassicJsxGlobals(...)` wrapper entirely.

## Why This Works

The classic Slate fixture corpus is not normal React test code. It is a legacy
hyperscript-shaped file family.

That means the fix belongs at module-load time, not in the spec body.

Once the preload loader owns that translation, every matching fixture module
gets the same runtime treatment before evaluation, and the spec files stop
carrying duplicate compatibility logic.

## Prevention

- When a large legacy fixture family suddenly fails with `React is not defined`
  or `jsx is not defined`, inspect the same-path fixture imports before
  touching product code.
- Prefer one filename-pattern preload transform over per-spec global mutation.
- Do not add another Bun lane just because one fixture family needs custom JSX
  handling. Keep the loader scoped to the right file family instead.
- If the preload loader already matches the failing fixture path, remove spec
  wrappers before adding more runtime indirection.
