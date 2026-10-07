# Testing

Test value follows the Tests rule in `AGENTS.md`: add a test only for a named, plausible defect nothing else already catches, written first when the test path is cheap. This reference owns test shape, owners and runners. `testing audit [scope]` runs the [suite audit](./testing-audit.md), which ranks remaining work and never authorizes writing tests.

## Test mechanics

Choose the smallest boundary that proves the behavior:

- Pure unit tests for deterministic logic.
- Thin editor or plugin contract tests for real Plate or Slate wiring.
- Golden input or output tests for serializer and parser behavior. Test a
  serializer that rewrites embedded-language source to fit its container, such
  as TeX, a URL or an HTML attribute, by comparing the consumer's own parse or
  render before and after, over the modes and escapes it touches; an
  input the consumer already rejects stays byte-identical. A literal expected
  string alone does not prove the rewrite keeps the meaning.
- Managed browser tests for native input, focus, selection, rendering and real
  component interactions that the lower layers cannot prove. `verify` owns
  the route, source identity and evidence.

Hard constraints:

- Bun owns the fast lane, and `node:test` runs the files that
  `TEST_NODE_FILE_PATTERNS` in `tooling/config/test-suites.mjs` lists, such as
  oxlint rule tests, whose `RuleTester` refuses Bun. Use the narrowest affected
  runner during iteration; `bun run test` is the fast aggregate, and `pnpm check`
  is the full handoff/CI gate only when the change or claim requires it.
- Keep the default iterative suite fast.
- A unit regression may accompany a browser regression when they guard distinct
  failure boundaries. Avoid duplicate assertions, not necessary integration proof.

## Test design

- Type tests use an exact `Equal` check that defeats `any` widening, with
  `IsAny` and `IsNever` guards. Each `@ts-expect-error` sits on the line
  immediately before the error, with a reason; an unused directive fails the
  test because the constraint is missing. When a public prop reuses a native DOM attribute name, omit the native key from the inherited attributes; when the prop's type is wider, add a type contract that passes the wider value, such as JSX to a `placeholder`. A public type contract imports from the package's public entrypoints, never from `src/internal`, because only the public path catches a missing root export; it proves source exports, and published declarations need the packed-consumer proof.
- Type proof runs at application scale: app-scale API and core-field access stay
  under TypeScript's instantiation-depth limit, and a standalone conversion
  typechecks with a full application kit, not a small plugin tuple.
- Design for testability: accept dependencies instead of creating them, give
  each external operation its own SDK-style function, and return results
  instead of hiding side effects.
- Tests assert current behavior, never deleted compatibility paths or
  incidental text-leaf grouping.
- When a test is written first, work in vertical slices: one test, then its
  minimal implementation, then the next. Never write all the tests first, and
  do not anticipate later tests.
- One logical assertion per test.
- Failing at the base commit proves only that the behavior was missing. For a
  guard or a new branch, revert that one condition in place, watch the test
  fail for its named defect, then restore the file byte for byte (`cmp`
  against a saved copy).
- A lossy case asserts that the round trip equals the input apart from the
  reported part, plus the diagnostic; a reported loss narrows the check and
  never removes the case.
- A new refusal or resource bound ships with a must-still-accept case at
  realistic scale beside its must-refuse case, because over-refusal drops
  user data.
- A regression for Node-native module loading, such as a CommonJS dependency imported by name from an ESM entrypoint, loads the built entrypoint through `node`, because `process.execPath` under Bun launches Bun and hides the failure.
## Plate foundation Rules

- Bun globals come from `tooling/config/global.d.ts`. Do not import `describe`, `it`, `expect`, `mock`, `spyOn`, or other globals from `bun:test`.
- Use `*.spec.ts[x]` for the fast lane and `*.slow.ts[x]` for the slow lane.
- Keep helpers package-local first. Reuse `packages/test` (`@platejs/test`) for
  shared editor/browser contracts; never import a helper from another spec file.
- No spec should import another spec.
- A plugin behavior family keeps one colocated `<FooPlugin>.<family>.spec.tsx`; merged helpers merge their specs into it, and no spec mirrors one public method, deleted helper or old filename.
- Tests declare no local fixture-shape alias or cast to hide weak hyperscript typing; the test-utils owner type is repaired and exported instead.
- Test setup is not extracted into constants, helpers or factories to work around weak inference; the source typing is fixed so inline construction infers.
- A spec that spies on a global, a prototype or a shared module export restores it in the same file (`mock.restore()` in `afterEach`, or the spy's `mockRestore()`); a spec that passes alone and fails in the full suite points at leaked spy or module-mock state before product code. A `mock.module` replacement spreads the real module into the mock, which `plate/mock-spreads-module` enforces, so later specs in the run still see the real exports.
- Put compile-only type contracts in `type-tests/`, not mixed into runtime specs.
- Titles should describe behavior semantically, not echo raw option names.
- Prefer explicit assertions over snapshots by default.
- Delete obsolete placeholders and commented-out dead tests. Preserve explicit
  capability skips and their missing prerequisites; never turn an unavailable
  browser/device case into a passing no-op or erase its coverage gap.
- No app-registry imports in package tests.
- Do not add package `devDependencies` just to support cross-package or app-shaped test setups. If a test needs other package kits, app aliases, or multi-package wiring, move it to `apps/www/src/__tests__/package-integration`.
- When test additions change the suite’s measured cost or an audit targets it, inspect outliers with `bun run test:profile`. `bun run test:slowest` hard-budgets the complete fast loop and genuinely blocking individual cases. It never fails a file merely because one coherent owner contains many cheap tests.
- Treat the local warning zone as real debt before CI proves you wrong, but optimize the slow behavior rather than splitting files to game aggregate file time.
- For borderline individual cases, run `pnpm test:slowest -- --top 25 --rerun-each 3` and move only repeatably blocking behavior into the matching `*.slow.ts[x]` family.
- Treat known third-party resource logs and serializer fallback warnings as test noise. Suppress them narrowly in the shared Bun setup at `tooling/config/bunTestSetup.ts`, not by changing runtime code or sprinkling per-spec console mocks.
- A spec that deliberately hits a Plate warning path captures that warning in its own editor harness, for example a no-op `logger.warn` on `DebugPlugin`; it never mutes the runtime warning globally or leaves it in broad runs.

## Owner Selection

- Use `createEditor` from `plitejs` for raw substrate query, transform,
  interface, and history contracts.
- Use `createEditor` from `platejs` for non-React Plate plugin or editor wiring:
  - plugin option stores
  - selector extension
  - pure plugin API composition
  - pure transform composition
  - parser and deserializer contracts
  - HTML `insertData`
  - DnD-style contracts
- Use `createEditor` from `platejs/react` only when the contract is genuinely Plate-specific.
- Use rendered React tests only when the contract is genuinely React-specific: hooks, providers, stores, DOM behavior, or rerender semantics.
- Remaining Plate React `createEditor` usage is a reviewed allowlist, not a future cleanup queue.

## Fake Runtime Contracts

When a bug or harvested invariant crosses a runtime boundary, prefer a small
fake runtime or contract helper over a one-off integration smoke. The fake
runtime must exercise both directions of the boundary: local code sends the
expected request/event, and the fake peer returns a deterministic response that
drives the local assertion.

Good targets:

- editor host services and browser/proof transports;
- clipboard, selection, history, paste, and command bridges;
- plugin registration and extension contracts;
- package public APIs that call into a host/runtime service.

Keep these helpers focused and package-local first. Promote them only after
multiple tests repeat the same boundary. Do not add broad barrels or
cross-package dev dependencies to support an overbuilt fake runtime.

For an escaped defect, identify what the test could miss before adding cases:
wrong input path, missing consumer/plugin mode, unobserved follow-up state, or
an assertion that can pass on invalid output. Extend the existing helper when
that omission recurs. Prove a changed assertion rejects the known bad result
and accepts the valid one, on the bytes the runner executes: raw
`playwright test` runs the built `@platejs/test`, so drive the red run through
`pnpm --filter plite test:plite-browser:project <project> <files>` or rebuild
that package after each source swap. Before a new or changed oracle's positive suite runs, list
each way a wrong result can look right, such as a throw after the logged step,
a canceled insert or a selection-only commit, and add one rejecting case for
each. A fake runtime cannot certify native browser behavior.

A contract whose data crosses editors, such as node keys, paths or an owner
editor read from a view editor, needs a fixture with separate owner and view
editors. A single-editor fixture shares one key space, so it passes while the
product fails. A mutation control proves only that the test notices a removed
guard, not that the fixture matches how the product wires its editors.

## Failures that pass alone

A test that fails in the full partition and passes when rerun alone is not a
flake until the same full partition passes at the base under the same
conditions. Isolated reruns cannot reproduce module evaluation order. When the
failures move between tests across runs, or a spy finds an undefined binding,
suspect an import cycle the change added. Show the cycle's import chain, then
remove the new edge instead of routing it through a module that already
imports both sides.

## File Organization

- File-scoped specs live beside the implementation.
- Keep `__tests__/` only for:
  - package-local helpers
  - fixture banks
  - intentionally split multi-file behavior suites
  - intentionally kept integration suites
- Move lone file-scoped specs out of `__tests__/`.
- Collapse tiny split suites into one adjacent table-driven file when the only variation is fixture shape.
- Action helpers may create the editor and perform the transform, but assertions stay in the `it()` body.
- Rule-action helpers should return the editor and other setup results, not assert internally.
- For composition-heavy suites, extract focused helpers before adding more inline setup. Small helpers like `getSortedKeys(...)` and `createStoreEditor(...)` beat repeated editor construction sludge.

## Fixtures And Assertions

- Use JSX hyperscript only when tree shape or selection shape is the contract.
- In a hyperscript file under automatic React JSX, put `/** @jsxRuntime classic */`
  before the custom factory pragma (`/** @jsx jsxt */` or `/** @jsx jsx */`).
  The factory pragma alone does not switch runtimes; React elements are not
  editor fixtures. Keep ordinary React rendering in its own JSX runtime. A suite that fails on fixture import or pragma drift is repaired first; its failures are not runtime evidence until it loads cleanly.
- Use plain object fixtures for option, state, and pure helper tests.
- Use a real editor object only when editor-root semantics matter. `NodeApi` and `ElementApi` do not treat plain `{ children: [...] }` objects the same way as real editors.
- Keep inputs and outputs small.
- An empty text renders a `data-editor-zero-width` placeholder and no `data-editor-string` node, so a test that edits empty-text DOM mutates the `[data-editor-node="text"]` host.
- The shared browser runtime error recorder `recordBrowserRuntimeErrors` uses `{ strict: true }` wherever every runtime error must fail, and it keeps listener cleanup and reset. Consolidating verification helpers preserves each caller's failure policy: strict error capture stays explicit on the existing recorder instead of copied listeners or a narrower filter.
- Use `it.each` for small behavior matrices.
- In this Bun + Testing Library setup, prefer render-returned queries over `screen`.
- Focus and blur inside one `act` leave the editor's focus state stale; run them in separate `act` calls.
- Inside `act`, MutationObserver records reach the callback in a microtask, so `takeRecords()` after `await act` comes back empty. Collect records in the callback.
- Snapshots are allowed only when serialized text, AST, or similar output is the contract and inline assertions would be worse.
- Whitespace-sensitive serializer outputs should prefer direct `toBe(...)` string assertions.
- Avoid `toHaveStyle` here. Use direct style-property assertions instead.
- After broad title renames on snapshot-backed suites, delete and regenerate the snapshot file. `bun test -u` updates and adds keys, but does not reliably prune dead ones.

## Package-specific contracts

Read [package recipes](./test-packages.md) only for the affected
autoformat, markdown/AI, Plate, selection, DOCX or Plite boundary. They retain
reviewed React/fixture exceptions and upstream behavior guidance.

## Select the runner

Use the smallest boundary and exact owning script. Bun globals and adjacent
specs serve the fast `*.spec.ts[x]` lane (`pnpm test`); unavoidable measured
slow cases use `*.slow.ts[x]` (`pnpm test:slow`). Focused runs use actual
repo-relative `./` paths or the package’s runner. `pnpm check test test-slow` runs
both test lanes as gate steps, and `pnpm check` is the full CI gate when the
claim needs it. Never infer coverage from
an aggregate command without checking its discovered files.

For coverage or cleanup waves, the full [suite audit](./testing-audit.md)
owns scoring, phases, `lcov`, timing checks and stopping. Ordinary test repair
does not start that program. Keep negative type proofs and explicit capability
skips with their missing prerequisites visible.
