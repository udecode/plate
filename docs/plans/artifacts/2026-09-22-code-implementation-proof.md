# Code implementation proof — 2026-09-22

The tested checkout was `next`. The browser ran against a restarted Next dev
server on port 3105 with `PLATE_WWW_PLITE=1` and `PLATE_WWW_DEV_SOURCE=1`.

## Passing checks

- `pnpm --filter platejs test:partition:standard-code-block`: 57 tests, 157 assertions.
- `pnpm --filter platejs typecheck:partition:standard-code-block`: passed.
- Plite core and authored test partitions: 1670 and 413 tests, respectively; Plite core typecheck passed.
- `bun test apps/www/src/registry/components/editor/code-block-lowlight.spec.ts apps/www/src/registry/components/editor/code-block.format.spec.tsx`: 5 tests, 21 assertions.
- `pnpm --filter www build:registry` and `pnpm --filter www typecheck`: passed. Both generated code-block registry items contain the copied Python resource and its BSD-3-Clause notice.
- Focused Playwright rows: mixed native/CodeMirror syntax and editing, live copied JSON formatting, and initial Python highlighting after hydration passed on the source-matched server.
- Targeted `pnpm exec ultracite check` on the changed code and test files, `git diff --check`, and Plate Next v230 validation: passed.

The direct Plite regression in `packages/plitejs/test/authored-anchor-contract.test.ts`
checks one update with disjoint text edits, an unchanged annotation range, and
undo/redo. The copied formatter tests cover invalid, unchanged, stale and
read-only no-ops, backward selection, exact annotation range and undo.

## Limit

An adjacent existing `code-block demos: default keeps the small main-style
value` Playwright row failed twice after Enter at the start of a heading: the
first code block remained at path 2 rather than moving to path 3. Its cause is
not established. The isolated initial Python hydration row passed; no claim
is made that the full code-demo browser file is green. No production bundle,
large-JSON timing, assistive-technology or physical-device run was performed.
