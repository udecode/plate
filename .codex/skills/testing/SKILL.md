---
name: testing
description: 'Skill: testing'
---

## Testing Goal

Push the suite toward three layers only:

- Pure unit tests for deterministic logic.
- Thin editor or plugin contract tests for real Plate or Slate wiring.
- Golden input or output tests for serializer and parser behavior.

Hard constraints:

- Bun-first and speed-first. `bun run test` is the default iterative workflow.
- Bare `bun test` is the full end-of-task and CI run. Do not use it as the default inner-loop command.
- Keep the default iterative suite fast.
- No browser or e2e coverage in this program.
- Coverage is hotspot telemetry, not a vanity target. Do not chase repo-wide numbers blindly.
- Use coverage after each phase only to choose the next hotspot.
- No one-smoke-test-per-package sweep.
- Do not add broad smoke coverage for thin wrapper packages.

## Current Priorities

- Phase order:
  1. `@platejs/slate`
  2. `@platejs/utils`, `@udecode/react-utils`, `@udecode/utils`
  3. `@platejs/core`
  4. `table`, `selection`, `markdown`, `code-block`, `list-classic`, `autoformat`, `link`
  5. `media`, `docx-io`, `docx`, `ai`, `dnd`, `combobox`, `suggestion`, `resizable`, `date`, `layout`, `list`
  6. thin wrappers only when they gain branching logic or other real logic
- `@platejs/slate` phase 1 is complete enough. Stop once the remaining misses are mostly deferred DOM wrappers plus low-risk non-DOM dust.
- Next up is the utility ring:
  - `@platejs/utils`: keep plugin contract tests as the main seam and cover only real logic gaps.
  - `@udecode/react-utils`: prioritize zero-coverage helpers and hook semantics.
  - `@udecode/utils`: prioritize pure helper branches and composition utilities.
- After the utility ring, deepen `@platejs/core`:
  - expand the compile-only type lane for plugin creation, editor creation, inference, and option or API merging
  - deepen runtime coverage for plugin resolution, override rules, editor composition, HTML or static behavior, node-id, affinity, and selector or store semantics

## Core Rules

- Assert public behavior through editor APIs, plugin APIs, hooks, transforms, or rendered output. Do not assert private state, call order, or implementation detail when public behavior already proves the contract.
- Bun globals come from `tooling/config/global.d.ts`. Do not import `describe`, `it`, `expect`, `mock`, `spyOn`, or other globals from `bun:test`.
- Use `*.spec.ts[x]` for all tests.
- Keep helpers package-local. Never import a helper from another spec file.
- No spec should import another spec.
- Put compile-only type contracts in `type-tests/`, not mixed into runtime specs.
- Titles should describe behavior semantically, not echo raw option names.
- Prefer explicit assertions over snapshots by default.
- Delete skipped tests, commented-out tests, and dead placeholder cases. Do not preserve wishful thinking.
- No fake smoke tests.
- No app-registry imports in package tests.
- When adding tests, measure fast-suite outliers with `bun run test:slowest`. If a fast-suite spec repeatedly crosses the thresholds in `tooling/config/test-suites.mjs`, move it into a slow bucket or document why it stays fast.

## Seam Selection

- Use `createEditor` from `@platejs/slate` for pure Slate query, transform, interface, and history contracts.
- Use `createSlateEditor` for non-React plugin or editor wiring:
  - plugin option stores
  - selector extension
  - pure plugin API composition
  - pure transform composition
  - parser and deserializer contracts
  - HTML `insertData`
  - DnD-style contracts
- Use `createPlateEditor` only when the contract is genuinely Plate-specific.
- Use rendered React tests only for hooks, providers, stores, DOM behavior, or rerender semantics.
- Remaining `createPlateEditor` usage is a reviewed allowlist, not a future cleanup queue.

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
- Use plain object fixtures for option, state, and pure helper tests.
- Use a real editor object only when editor-root semantics matter. `NodeApi` and `ElementApi` do not treat plain `{ children: [...] }` objects the same way as real editors.
- Keep inputs and outputs small.
- Use `it.each` for small behavior matrices.
- In this Bun + Testing Library setup, prefer render-returned queries over `screen`.
- Snapshots are allowed only when serialized text, AST, or similar output is the contract and inline assertions would be worse.
- Whitespace-sensitive serializer outputs should prefer direct `toBe(...)` string assertions.
- Avoid `toHaveStyle` here. Use direct style-property assertions instead.
- After broad title renames on snapshot-backed suites, delete and regenerate the snapshot file. `bun test -u` updates and adds keys, but does not reliably prune dead ones.

## Cleanup Heuristics

- Score files before cleanup waves instead of skimming randomly.
- Rewrite large hotspot specs before chasing broad title debt. Bigger signal first.
- Scan title debt across:
  - plain string titles
  - `it.each(...)` format strings
  - `String.raw` titles
  - snapshot keys derived from those titles
- Scan for commented-out `it`, `test`, and `describe` blocks during dead-spec cleanup waves.
- End cleanup waves with repo scans for:
  - skipped tests
  - commented-out tests
  - cross-spec imports
  - placeholder titles
  - non-allowlisted `createPlateEditor` seams
- Use `bun run test:slowest` for the fast suite and `bun run test:slowest:all` for the whole repo when deciding whether a new spec belongs in `TEST_SLOW_BUCKETS`.
- For rule-override hotspots, extract one editor helper and table-drive repeated node-type cases instead of cloning the same transform assertions.
- For plugin-composition hotspots, extract helpers before adding more inline setup.
- Adapt upstream invariants when local runtime semantics differ. Keep the invariant, rewrite the fixture around the real public contract.

## Package Rules

### `autoformat`

- Use package-local rule arrays.
- Use `KEYS` or base plugins, not React plugin `.key`.
- Add only the base plugins a rule actually needs.
- Collapse tiny mark or block suites into matrices when the contract is the same.
- Do not import `AutoformatKit` or app registries in package tests.

### `markdown`

- Configure `MarkdownPlugin` locally in the package helper.
- Do not import `MarkdownKit` or any app registry from `apps/www`.
- Prefer direct string assertions for tiny whitespace-sensitive serializer outputs.

### `ai / streaming markdown`

- Keep one mixed-document smoke case.
- Add a few explicit chunk-boundary tests.
- Do not hide streaming behavior behind snapshots or giant hand-written trees.

### `core`

- Use `createSlateEditor` for:
  - pure plugin option stores
  - selector extension
  - plugin API composition
  - transform composition
  - parser and deserializer contracts
  - HTML `insertData`
  - DnD-style contracts
- Grow the compile-only type lane here first:
  - plugin creation
  - editor creation
  - inference
  - option merging
  - API merging
- Port upstream Slate React invariants by behavior, not by file.
- When a core source test mounts `Plate` while the same run also loads public-package React entrypoints, treat duplicate-instance warnings as test noise. Suppress them in the test wrapper with `suppressInstanceWarning` instead of changing runtime warning logic.
- For provider-only React specs in core, reuse the shared `packages/core/src/react/__tests__/TestPlate.tsx` helper instead of re-declaring local `const Plate = ...` wrappers.

### `selection`

- `moveSelection` and `shiftSelection` stay on Plate. They are genuinely Plate-bound exceptions, not cleanup debt.

### `docx`, `docx-io`, and app integration

- Keep app-owned cross-package integration tests under `apps/www/src/__tests__/package-integration`.
- Keep buckets local under that folder instead of scattering app-owned integration coverage through `src/lib`.
- Package tests must not pull app aliases, app kits, or registries into package graphs.
- Fixture-heavy `docx` and `docx-io` suites are valid reasons to keep `__tests__/`.

### `slate`

- Focus on pure editor, query, and transform behavior first.
- Keep runtime coverage on navigation, selection math, structural queries, transform edge cases, extension transforms, and `createEditor` legacy sync.
- Keep a small compile-only type lane for public `@platejs/slate` contracts.
- Use selective upstream mining. Pull invariants that cheaply improve local public-contract coverage; do not mirror upstream blindly.
- Add direct helper specs for custom Slate code when indirect coverage is lying.
- Use `lcov` as package truth. Bun’s text coverage summary is noisy for targeted package runs.
- Stop once the remaining misses are mostly deferred DOM wrappers plus low-risk non-DOM dust.
- Later utility and core work should mine these upstream `slate-react` invariants:
  - `use-slate-selector`: selector equality and stale-rerender prevention
  - `use-slate`: editor version and subscription behavior
  - `use-selected`: selection rerender and path stability
  - `editable`: value-change vs selection-change partitioning
  - `decorations`: decoration propagation and redecorate behavior
  - `chunking`: chunk or index invalidation only if remaining core gaps justify it
- Skip `react-editor` DOM focus coverage unless a real Plate bug forces it.
- Playwright example coverage stays out.

## Reviewed Exceptions

### `createPlateEditor` allowlist

Keep `createPlateEditor` when the contract is actually about:

- React or provider wiring
- rendered output or DOM behavior
- store rerender semantics
- Plate plugin conversion boundaries
- the known Plate-only selection APIs: `moveSelection` and `shiftSelection`

Do not treat these files as backlog just because they still use Plate.

### `__tests__/` allowlist

Keep `__tests__/` when it holds:

- package-local helpers or fixture banks
- intentionally split multi-file suites like `withAutoformat`
- fixture-heavy integration suites like `docx` and `docx-io`
- app-owned cross-package integration suites under `apps/www/src/__tests__/package-integration`

## Quick Reference

- Start with the smallest seam that proves the contract: `createEditor` -> `createSlateEditor` -> `createPlateEditor`.
- Use `bun run test` for the fast default loop. Use bare `bun test` for the full suite.
- Use `bun run test:slowest` to police the fast loop. Use `bun run test:slowest:all` when you need the whole-suite outliers.
- Use Bun globals. Do not import them from `bun:test`.
- Keep specs beside the implementation. Use `__tests__/` only for helpers, fixtures, or intentional split or integration suites.
- Use plain objects for simple state. Use JSX hyperscript only when tree or selection shape is the contract.
- Prefer explicit assertions. Use render-returned queries over `screen`, and use direct style-property assertions over `toHaveStyle`.
- Delete skips, commented tests, dead smoke tests, and stale snapshot files after broad title renames.
- Package tests must stay package-local. No app registries, no app kits, no cross-spec imports.
- For package-only coverage decisions, trust `lcov`, not Bun’s broad text summary.

