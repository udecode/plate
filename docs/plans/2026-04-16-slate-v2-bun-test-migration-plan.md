---
date: 2026-04-16
topic: slate-v2-bun-test-migration-plan
status: active
---

# Goal

Move `/Users/zbeyens/git/slate-v2` off Jest and Mocha as far as possible.

Default target:

- `bun test`

Fallback target:

- `vitest` only for lanes Bun cannot carry honestly

Unchanged:

- Playwright browser integration tests

# Reference Rules

- Use Plate as the primary model.
- Test files should not import from `bun:test`.
- Use Bun globals from setup/types, like Plate.
- Do not suppress or delete tests.
- Preserve intentionally skipped fixture tests as skipped, not fake-passed.
- If Vitest is needed, copy the Better Convex project/setup pattern: explicit
  projects, explicit environment, explicit setup file.

# Current State

## Root

Current root test graph:

- `test`: `test:bun && test:vitest`
- `test:vitest`: root Vitest call for `slate-react`
- Playwright remains under `playwright`

## Package Test Lanes

### `packages/slate`

Current runner:

- Bun only

Shape:

- `packages/slate/test/index.spec.ts` owns the full fixture corpus
- `packages/slate/test/index.js` is now a pure helper export for legacy fixture
  imports
- `packages/slate/test/support/with-test.js`
- roughly 1000 fixture files
- mostly `.tsx` hyperscript fixtures
- direct `node:assert/strict`
- keeps `utils/string.ts` as the other direct Bun test file
- several intentional `export const skip = true` fixtures
- scoped preload transform still needed for
  legacy TSX fixture modules under `packages/slate*`
- migrated Bun fixtures use stock `slate-hyperscript` JSX instead of a local
  test-utils wrapper
- ordinary legacy fixture files stay bare TSX; the preload injects the stock
  `slate-hyperscript` factory import

Target:

- Bun

### `packages/slate-history`

Current runner:

- Bun only

Shape:

- `packages/slate-history/test/index.spec.ts` owns the full fixture corpus
- `packages/slate-history/test/index.js` is now a pure helper export for legacy
  fixture imports
- `.js` and `.tsx` fixtures
- `node:assert/strict`
- one intentional skipped fixture
- uses the shared root legacy JSX preload

Target:

- done

### `packages/slate-hyperscript`

Current runner:

- Bun through the root `bunfig.toml`

Shape:

- first-class Bun spec at
  `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.spec.ts`
- tiny local helper at
  `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/jsx.ts`
- scoped preload transform still needed for this package's JSX path

Target:

- done

### `packages/slate-dom`

Current runner:

- `tsx --test test/**/*.ts`

Current repo has no active `packages/slate-dom/test/**` lane.

Target:

- Bun when DOM tests exist

### `packages/slate-react`

Current runner:

- Bun + Vitest + jsdom

Shape:

- Bun keeps `test/bun/**`
- Vitest owns the remaining `test/*.vitest.{ts,tsx}` lane
- React Testing Library
- jest-dom matchers
- Jest-style `fn`/`spyOn` compatibility through runner setup
- source mapping for workspace packages
- DOM selection/focus behavior
- `react-editor.vitest.tsx` needed `jsdom 20.0.3`; Bun + Happy DOM and Vitest +
  Happy DOM were not lossless on that focus row

Target:

- done with Vitest fallback for the DOM-fidelity lane

# Migration Design

## Shared Bun Test Setup

Add:

- `config/bun-test-setup.ts`
- `config/bun-test-globals.d.ts`

Setup responsibilities:

- register Happy DOM globals only for DOM-capable tests
- extend Bun `expect` with Testing Library matchers
- expose Jest-compatible globals:
  - `globalThis.jest.fn`
  - `globalThis.jest.spyOn`
  - optionally `globalThis.jest.restoreAllMocks`
- expose direct globals if useful:
  - `mock`
  - `spyOn`
- call Testing Library `cleanup()` after each test

Why:

- Plate imports from `bun:test` only in setup, not in every test file.
- Slate tests should keep using `describe`, `it`, `test`, and `expect` without
  importing runner APIs.

Do not:

- add `import { test } from 'bun:test'` across test files
- rewrite assertions for sport
- suppress failing tests

## Fixture Harness Rewrite

Replace or adapt:

- `support/fixtures.js`

Bun-compatible requirements:

1. Discover fixture files synchronously.
2. Preserve nested `describe(...)` grouping.
3. Use Bun global `it`.
4. Load `.ts` / `.tsx` / `.js` fixture modules through dynamic `import(...)`.
5. Preserve intentional skips.

Skip handling:

- pre-read fixture source text
- if it contains an explicit `export const skip = true`, register `it.skip(...)`
- otherwise register a normal async `it(...)`

Reason:

- Mocha used `this.skip()` after `require(...)`.
- Bun should not fake a skipped fixture as a passing test.

Fixture import:

- use `pathToFileURL(p).href`
- dynamic import fixture modules
- keep existing fixture module exports:
  - `input`
  - `run`
  - `test`
  - `output`
  - `operations`

Hyperscript JSX:

- keep the existing `/** @jsx jsx */` + `jsx` value pattern
- verify Bun handles the TSX pragma before broad conversion

## Package Scripts

Target scripts:

Root:

```json
{
  "test": "bun test",
  "test:bun": "bun test",
  "test:integration": "playwright install --with-deps && run-p -r serve playwright",
  "test:integration-local": "playwright install && run-p -r serve playwright"
}
```

Package scripts:

```json
{
  "test": "bun test"
}
```

Potential root split if needed:

```json
{
  "test": "pnpm test:bun && pnpm test:vitest",
  "test:bun": "bun test",
  "test:vitest": "vitest run"
}
```

Use the split only if a real Vitest lane survives.

## Type Setup

Update test tsconfigs to include Bun globals:

- root or package-level `types` should include Bun test globals
- keep `@testing-library/jest-dom` types for React tests
- remove `@types/jest` and `@types/mocha` after the files no longer reference
  those type packages

Expected final removals:

- `jest`
- `jest-environment-jsdom`
- `ts-jest`
- `babel-jest`
- `mocha`
- `@types/jest`
- `@types/mocha`

Keep only if still used elsewhere:

- `@babel/register`
- Babel presets/plugins used by non-test tooling

# Phase Plan

## Phase 1: Bun Smoke Harness

Goal:

- prove Bun can execute one representative fixture family without Mocha.

Tasks:

1. Add Bun setup/types.
2. Rewrite `support/fixtures.js` to dynamic-import fixture modules.
3. Temporarily point only one package script to Bun.
4. Run:
   - one plain `.ts` utility test
   - one `.tsx` hyperscript fixture
   - one skipped fixture

Recommended first checks:

```bash
bun test packages/slate/test/utils/string.ts
bun test packages/slate/test/index.js --test-name-pattern above
```

Acceptance:

- normal fixture passes
- skipped fixture reports skipped
- no fixture import needs runner imports

## Phase 2: Move `slate`, `slate-history`, `slate-hyperscript` To Bun

Goal:

- remove Mocha and `scripts/run-from-root.mjs` from core/support package tests.

Tasks:

1. Update package test scripts:
   - `packages/slate/package.json`
   - `packages/slate-history/package.json`
   - `packages/slate-hyperscript/package.json`
2. Update root `test:mocha` to `test:bun:packages` or delete it.
3. Run full fixture packages through Bun.
4. Remove Mocha dependencies when green.

Acceptance:

```bash
pnpm --filter slate test
pnpm --filter slate-history test
pnpm --filter slate-hyperscript test
```

All pass with Bun.

No test count may be silently reduced.

## Phase 3: Move `slate-dom` To Bun

Goal:

- standardize `slate-dom` on Bun even though it currently has little/no local
  test surface.

Tasks:

1. Change `packages/slate-dom/package.json` test script to `bun test`.
2. If there are no tests, decide whether package-local `test` should:
   - be omitted, or
   - run `bun test test` only after tests exist

Recommendation:

- omit package-local `test` until `slate-dom/test/**` exists
- root test should not fail because a package has no tests

## Phase 4: Attempt `slate-react` On Bun

Goal:

- remove Jest if Bun can handle the React DOM tests faithfully.

Tasks:

1. Replace Jest config with Bun setup.
2. Map workspace package imports to source the same way Jest currently does.
   Options:
   - package `imports` / aliases if Bun supports enough locally
   - `tsconfig` paths for Bun-compatible resolution
   - minimal source import adjustment only if needed
3. Shim `jest.fn()` globally to Bun `mock`.
4. Keep `@testing-library/jest-dom` matchers through setup.
5. Run each current React test file under Bun.

Acceptance:

```bash
bun test packages/slate-react/test
```

All seven existing suites pass:

- `chunking.spec.ts`
- `decorations.spec.tsx`
- `editable.spec.tsx`
- `react-editor.spec.tsx`
- `use-selected.spec.tsx`
- `use-slate-selector.spec.tsx`
- `use-slate.spec.tsx`

No suppressions:

- do not drop coverage assertions unless Bun coverage replaces them
- do not skip focus/selection tests
- do not weaken DOM assertions

## Phase 5: Vitest Fallback For `slate-react` Only If Needed

Use Vitest only if Bun has a real blocker, such as:

- missing DOM selection behavior that cannot be safely polyfilled
- React Testing Library behavior diverges under Bun in a way that invalidates
  the test
- Bun cannot support the coverage threshold without unacceptable tooling hacks

Vitest setup shape, copied from Better Convex:

- `vitest.config.mts`
- project named `slate-react`
- `environment: 'happy-dom'`
- `setupFiles: ['./config/vitest.setup.ts']`
- `globals: true`
- aliases:
  - `slate` -> `packages/slate/src/index.ts`
  - `slate-dom` -> `packages/slate-dom/src/index.ts`
  - `slate-history` -> `packages/slate-history/src/index.ts`
  - `slate-hyperscript` -> `packages/slate-hyperscript/src/index.ts`
  - `slate-react` -> `packages/slate-react/src/index.ts`

Setup responsibilities:

- `expect.extend(matchers)`
- `afterEach(cleanup)`
- `globalThis.jest = { fn: vi.fn, spyOn: vi.spyOn }`

Vitest file naming:

- either keep existing `*.spec.tsx` and include only `packages/slate-react/test`
- or rename only if it makes the project split clearer

Do not migrate other packages to Vitest.

## Phase 6: Root Test Graph Cleanup

Goal:

- remove Jest/Mocha plumbing from root.

Tasks:

1. Delete `jest.config.js` if no Vitest fallback is needed.
2. Delete `scripts/run-from-root.mjs` once no package script uses it.
3. Remove dependencies:
   - `jest`
   - `jest-environment-jsdom`
   - `ts-jest`
   - `babel-jest`
   - `mocha`
   - `@types/jest`
   - `@types/mocha`
4. Keep `@testing-library/*` only if React tests still use them.
5. Update root scripts.
6. Update docs/ledger/PR description.

Acceptance:

```bash
rg -n "jest|mocha|run-from-root|ts-jest|babel-jest" /Users/zbeyens/git/slate-v2 \
  -g '!node_modules' -g '!pnpm-lock.yaml' -g '!docs/**'
```

Expected after full Bun migration:

- no live matches except possibly comments in changelog/history docs

Expected if Vitest fallback remains:

- no Jest/Mocha matches
- Vitest matches only in config/package scripts

# Verification Matrix

Run after each phase:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Run after final phase:

```bash
pnpm build
pnpm test:integration-local
```

For React test migration:

```bash
pnpm --filter slate-react test
```

For fixture migration:

```bash
pnpm --filter slate test
pnpm --filter slate-history test
pnpm --filter slate-hyperscript test
```

# Risk Register

## Risk: Bun does not honor fixture JSX pragma

Impact:

- Slate hyperscript fixtures fail.

Response:

- fix harness/transpilation once
- do not rewrite every fixture unless the harness route fails

## Risk: skipped fixture semantics get lost

Impact:

- skipped known failures become fake passing tests.

Response:

- pre-detect `export const skip = true`
- register `it.skip(...)`

## Risk: React tests rely on Jest-specific mock APIs

Impact:

- tests fail on `jest.fn()`.

Response:

- global Jest-compatible shim in setup
- do not edit every test to import Bun APIs

## Risk: Happy DOM differs from jsdom on selection/focus

Impact:

- `slate-react` DOM tests may become unreliable.

Response:

- add narrowly justified polyfills if they reflect browser behavior
- otherwise move only `slate-react` to Vitest/happy-dom

## Risk: coverage threshold parity

Impact:

- Jest coverage gate disappears.

Response:

- if Bun coverage can express the same threshold, use it
- otherwise use Vitest for `slate-react` coverage rather than dropping the gate

# Recommended Final State

Best case:

- all package unit/fixture tests run on Bun
- Playwright stays Playwright
- no Jest
- no Mocha
- no Vitest

Likely pragmatic state:

- `slate`, `slate-history`, `slate-hyperscript`, `slate-dom`: Bun
- `slate-react`: Bun if Happy DOM is good enough; Vitest if DOM/coverage parity
  blocks
- Playwright unchanged

Do not keep Jest.

Do not keep Mocha.

Do not keep `scripts/run-from-root.mjs` after package scripts stop using it.

# Directory Rule

Keep migrated package tests under the package's existing `test/**` tree.

Use:

- `packages/<pkg>/test/bun/**`

Do not use:

- `packages/<pkg>/test-bun/**`

# Proof Slice Results

Date: 2026-04-16

This slice intentionally did not migrate all tests. It added minimal Bun setup
scaffolding and ran one representative check per lane to prove or disprove the
setup assumptions.

## Added Proof Scaffolding

- `/Users/zbeyens/git/slate-v2/bunfig.toml`
- `/Users/zbeyens/git/slate-v2/config/bun-test-setup.ts`
- `/Users/zbeyens/git/slate-v2/config/bun-test-globals.d.ts`
- Bun-aware dynamic import path in `/Users/zbeyens/git/slate-v2/support/fixtures.js`
- Bun-only source aliases in `/Users/zbeyens/git/slate-v2/config/bun-test-setup.ts`
  via `mock.module(...)`:
  - `slate`
  - `slate-dom`
  - `slate-history`
  - `slate-hyperscript`
  - `slate-react`
- root test infra deps:
  - `@happy-dom/global-registrator`
  - `@testing-library/jest-dom`
  - `@testing-library/react`

The setup now carries the useful Plate pieces:

- Happy DOM registration
- Testing Library matcher extension
- Testing Library cleanup after each test
- `jest.fn` / `jest.spyOn` compatibility globals
- `mock` / `spyOn` globals
- `TextEncoder`, `DOMParser`, `MessageChannel`
- writable `HTMLElement.prototype.isContentEditable`
- Bun Mock/Spy type augmentation for Jest-style mock methods

## Passed Proof

### `slate` non-fixture utility lane

Command:

```bash
bun test ./packages/slate/test/utils/string.ts --test-name-pattern "getWordDistance - ltr"
```

Result:

- passed
- proves plain TypeScript tests using Bun globals work
- no `bun:test` imports needed in the test file

### `slate-react` non-DOM logic lane

Command:

```bash
bun test ./packages/slate-react/test/chunking.spec.ts --test-name-pattern "returns flat tree for 1 child"
```

Result:

- passed
- proves non-DOM `slate-react` logic tests can run under Bun

### `slate-react` DOM lane

Command:

```bash
bun test ./packages/slate-react/test/use-slate.spec.tsx --test-name-pattern "tracks a global"
```

Result:

- passed after importing the useful Plate Bun setup pieces
- proves React Testing Library + jest-dom matchers + cleanup work under Bun
- proves a small existing DOM suite can run without importing from `bun:test`

## Failed Proofs And Meaning

### Fixture TSX lanes

Commands:

```bash
bun test ./packages/slate/test/index.js --test-name-pattern "block-highest|root"
bun test ./packages/slate-history/test/index.js --test-name-pattern "basic|non-contiguous"
```

Result:

- partial pass only
- skipped fixtures were correctly registered as skipped
- failures came from TSX/hyperscript JSX handling, not from assertion logic

Observed failures:

- Plain Bun runtime fixture imports were not being compiled through the Slate
  hyperscript path the way Babel/Mocha currently does.
- Some fixture outputs became React-ish objects, which breaks editor mutation
  and `withHistory(...)`.

Meaning:

- Bun can be the runner, but raw Bun TSX compilation is still the blocker.
- `slate-hyperscript` is now beyond the old fixture harness: one first-class
  Bun spec plus a scoped preload transform keeps the package on the root Bun
  config with no package-local `bunfig.toml`.
- `slate` and `slate-history` should follow the same direction instead of
  keeping their dynamic fixture harnesses.

Next implementation target:

- add a Bun-compatible fixture transform or fixture import path that honors
  `/** @jsx jsx */`
- prove the same three commands pass before changing package `test` scripts

## Current Recommendation After Proof

Still proceed, but in this order:

1. migrate `slate` with the same scoped preload-transform pattern
2. migrate `slate-history` the same way
3. expand `slate-react` Bun coverage file-by-file
4. use Vitest only if the React DOM lane has a real Bun/happy-dom fidelity
   blocker

Do not delete Jest/Mocha yet.

# Moved Slice Results

Date: 2026-04-16

The proof slice moved real tests, not copies, under each package's existing
`test/**` tree:

- `packages/slate/test/bun/**`
- `packages/slate-history/test/bun/**`
- `packages/slate-hyperscript/test/bun/**`
- `packages/slate-react/test/bun/**`

## Moved Test Counts

### Fixture Packages (`slate`, `slate-history`, `slate-hyperscript`)

Attempted moved-slice integration under a single root `bunfig` exposed a real
constraint:

- the fixture packages still rely on the old Babel fixture path for stable TSX
  hyperscript evaluation
- once package-local Bun config was removed, the moved fixture slice became
  sensitive to Bun/runtime behavior and even triggered Bun crashes in some
  paths

Final state for this turn:

- fixture-package Bun slice integration was backed out
- their tests still run through the existing Mocha/Babel harness
- the repo is green

Conclusion:

- root-only `bunfig` is kept
- fixture-package Bun migration is not ready for integration yet
- next step there is to normalize the fixture transform path first, not keep
  forcing moved slices into the main graph

### `slate-react`

Moved 10 tests by moving these suites:

- `editable.spec.tsx`
- `use-slate.spec.tsx`
- `use-slate-selector.spec.tsx`

The remaining Jest suite ignores `packages/slate-react/test/bun/**`.

Command:

```bash
pnpm --filter slate-react run test:bun
```

Result:

- 10 passed

## Script Wiring

- root-owned Bun slice:
  - `test:bun`
- package `slate-react` `test` runs `test:bun` before the remaining Jest lane
- root `test:jest` delegates to `pnpm --filter slate-react test`
- Jest ignores the moved `slate-react/test/bun/**` files
- fixture packages remain on the old runner for now

## Verification

Commands passed:

```bash
pnpm test:bun
pnpm test
pnpm typecheck
pnpm lint
```

Root-only-bunfig proof:

```bash
bun test ./packages/slate-react/test/bun
```

## Next Batch Rule

The setup is now proven enough to continue in batches.

Next batch should move another 10-25 tests per package, not the whole tree.
