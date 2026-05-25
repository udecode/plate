---
module: Slate v2 Bun JSX fixture lanes
date: 2026-04-16
last_updated: 2026-04-17
problem_type: test_failure
component: testing_framework
symptoms:
  - "Bun imports legacy Slate TSX fixture files as React-style elements instead of Slate hyperscript output"
  - "Files with `/** @jsx jsx */` still fail under the root Bun config"
  - "Dynamic fixture imports yield `children` or `selection` as `undefined`"
  - "Calling `Editor.above` on the imported `slate` fixture editor blows up because the imported TSX module is not a real Slate editor"
root_cause: config_error
resolution_type: code_change
severity: high
tags:
  - bun
  - slate
  - slate-v2
  - slate-hyperscript
  - hyperscript
  - tests
  - jsx
  - fixtures
---

# Bun preload transforms for legacy Slate JSX lanes must target the imported fixture files

## Problem

Legacy Slate TSX fixture lanes do not compile through the Slate hyperscript path
under raw `bun test` in this repo.

Without help, Bun turns fixture JSX like `<element>word</element>` into
React-style element objects instead of Slate hyperscript output.

That shows up in the current dynamic-import lanes:

- `packages/slate-hyperscript/test/index.spec.ts` importing
  `packages/slate-hyperscript/test/fixtures/*.tsx`
- `packages/slate/test/index.spec.ts` importing the full `packages/slate/test/**`
  fixture corpus
- `packages/slate-history/test/index.spec.ts` importing the full
  `packages/slate-history/test/**` fixture corpus

## What Didn't Work

### 1. Trusting plain Bun runtime imports for the fixture modules

The official Bun docs say per-file JSX pragmas are supported, and
`Bun.Transpiler` does honor them. The problem was the plain runtime import path
used by the dynamic fixture imports, not the pragma contract itself.

### 2. Targeting the spec entrypoint instead of the imported fixtures

The current `slate-hyperscript` Bun lane imports `test/fixtures/*.tsx` from
`index.spec.ts`. A preload regex that targets a dead or non-imported spec path
does nothing for the actual failing modules.

### 3. Reaching for package-local `bunfig.toml`

That is still the wrong fix. It papers over the import path and breaks the
single-root Bun setup.

## Solution

Keep the legacy fixture syntax and fix the import path that Bun actually uses.

Use one scoped preload transform in
[config/bun-test-setup.ts](/Users/zbeyens/git/slate-v2/config/bun-test-setup.ts)
that targets the legacy fixture directories directly:

- `packages/slate-hyperscript/test/**/*.tsx`
- `packages/slate/test/**/*.tsx` excluding the Bun spec entrypoints

For plain legacy fixtures, keep the files as bare TSX and let the preload
inject `import { jsx } from 'slate-hyperscript'` before running the classic JSX
transform. Only keep a local `const jsx = createHyperscript(...)` inside files
that truly need a custom factory.

For the current `slate` and `slate-history` Bun lanes, keep the shared editor
helpers and let the fixtures import a side-effect-free package-local `index.js`
helper for `jsx`:

- keep the legacy custom JSX factory only inside
  [packages/slate/test/index.js](/Users/zbeyens/git/slate-v2/packages/slate/test/index.js)
  and
  [packages/slate-history/test/index.js](/Users/zbeyens/git/slate-v2/packages/slate-history/test/index.js)
  as pure helper exports for legacy fixture imports
- move the editor helper into
  [packages/slate/test/support/with-test.js](/Users/zbeyens/git/slate-v2/packages/slate/test/support/with-test.js)
- keep one Bun suite entry at
  [packages/slate/test/index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/index.spec.ts)
  and
  [packages/slate-history/test/index.spec.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/index.spec.ts)
  for the full package fixture corpora
- keep those package-local `index.js` files side-effect free so fixtures can
  import `jsx` from them without re-entering an old suite bootstrap
- when Bun reveals type-only imports as runtime imports, convert them to
  `import type` instead of papering over the error

That keeps all legacy Slate fixture packages on the single root Bun config while
letting Bun own the migrated fixture lanes.

## Why This Works

The real contract was not "Bun cannot run Slate JSX tests."

It was "raw Bun runtime imports are not reproducing the hyperscript pragma path
for the imported fixture modules."

Using `Bun.Transpiler` inside a scoped preload gives Bun the transform path it
actually needs while keeping the single root config. The important detail is
scope: the preload has to intercept the TSX files that Bun is dynamically
importing, not some neighboring spec filename. A broad test-directory rule also
avoids turning filename suffixes into tooling metadata, and the injected stock
import removes the per-file pragma and `import { jsx }` boilerplate for
ordinary fixtures.

## Prevention

- For legacy Slate fixture lanes, do not assume plain runtime imports tell the
  truth about Bun pragma support.
- If a Bun spec dynamically imports legacy TSX fixtures, scope the preload regex
  to the legacy fixture directories, not a hand-maintained bucket list.
- If a Bun slice lives under a legacy Mocha `test/**/*.ts` tree, keep the Bun
  entrypoint off that glob so Mocha does not accidentally execute it.
- Use package-local `bunfig.toml` only if there is a real runtime reason, not
  to emulate old Babel behavior.

## Verification

```bash
pnpm install
pnpm turbo build --filter=./packages/slate-hyperscript
pnpm turbo typecheck --filter=./packages/slate-hyperscript
pnpm turbo build --filter=./packages/slate
pnpm turbo typecheck --filter=./packages/slate
pnpm exec tsc --project config/tsconfig.test.json --noEmit
bun test ./packages/slate-hyperscript/test/index.spec.ts
bun test ./packages/slate/test/bun/editor-above.spec.tsx
pnpm test:bun
pnpm test:mocha
pnpm lint
```
