---
title: Test Suite Excellence Plan
type: testing
date: 2026-03-09
status: active
---

# Test Suite Excellence Plan

## Summary

- Keep `bun test` as the single default run. The suite is already fast enough that quality matters more than orchestration.
- No Playwright or browser coverage in this program.
- Use coverage as hotspot telemetry, not as a repo-wide KPI.
- Phase order:
  1. `@platejs/slate`
  2. `@platejs/utils`, `@udecode/react-utils`, `@udecode/utils`
  3. `@platejs/core`
  4. High-ROI remaining packages
  5. Everything else only when it has real logic

## Phase 1: `@platejs/slate`

- Focus on pure editor/query/transform behavior first.
- Add runtime coverage for editor navigation, selection math, structural queries, transform edge cases, extension transforms, and `createEditor` legacy sync.
- Add a small compile-only type lane for public `@platejs/slate` contracts.

### Upstream `../slate` scan

- `[ ]` `slate-react/test/chunking.spec.ts`: save chunk/index-stability ideas for `@platejs/core`
- `[x]` `slate-react/test/decorations.spec.tsx`: adapt later in `@platejs/core`
- `[x]` `slate-react/test/editable.spec.tsx`: keep change-callback partitioning ideas for `@platejs/core`
- `[ ]` `slate-react/test/react-editor.spec.tsx`: skip unless a Plate DOM bug forces it
- `[x]` `slate-react/test/use-selected.spec.tsx`: adapt later in `@platejs/core`
- `[x]` `slate-react/test/use-slate-selector.spec.tsx`: reuse in utility and core selector tests
- `[x]` `slate-react/test/use-slate.spec.tsx`: adapt later in `@platejs/core`
- `[ ]` `playwright/integration/examples/*`: explicitly out

# Full Test Suite Plan After Slate Phase 1

## Summary

- Yes, phase 2 is ready.
- The current order still makes sense: the utility ring is sparse and cheap to harden, while `@platejs/core` already has a wider runtime base but still needs the serious type-contract pass.
- Keep `testing.mdc` as the permanent rulebook. Do not recreate giant cleanup-plan docs unless new durable policy appears.
- No production API changes are planned. This work adds or rewrites runtime specs, compile-only `type-tests`, and small package-local test helpers only.

## Phase Plan

### Phase 2: utility ring

- `@platejs/utils` stays runtime-first. Cover `ExitBreakPlugin`, selection hooks, `useSelectionFragment`, `useEditorString`, `useMarkToolbarButton`, `useRemoveNodeButton`, and only the real branchy parts of `BlockPlaceholderPlugin`.
- Use `createSlateEditor` for plugin behavior and selector-backed hook state. Use rendered React tests only for hook props, click handlers, and placeholder rerender semantics.
- Do not add utility type-tests by default. Only add them if a utility exposes a brittle public generic contract during implementation.
- `@udecode/react-utils` gets direct behavior tests for `createPrimitiveComponent`, `createPrimitiveElement`, `createSlotComponent`, `useEffectOnce`, `useOnClickOutside`, `useStableFn`, `useStableMemo`, `withRef`, and `PortalBody`.
- Skip thin wrapper vanity tests for `Box`, `Text`, or `MemoizedChildren` unless a real branch or regression shows up.
- `@udecode/utils` covers `findHtmlParentElement`, `sanitizeUrl`, `isUrl`, `mergeProps`, `hexToBase64`, and `escapeRegexp`/`getHandler` only where branches still matter. Skip pure type alias files and `environment.ts` unless its runtime Apple detection logic is actually used in package behavior.
- Reuse the upstream `use-slate-selector` invariant in phase 2 for selector equality and stale-rerender prevention where it maps cleanly.

### Phase 3: `@platejs/core`

- Make this the first-class compile-only type phase.
- Expand `packages/core/type-tests` into multiple focused fixtures covering `createSlatePlugin`, `createTSlatePlugin`, `createPlatePlugin`, `createPlateEditor`, `withSlate`, `withPlate`, plugin API merging, option merging, and editor or plugin inference.
- Keep type fixtures compile-only with both positive assertions and `@ts-expect-error` negatives. Do not mix these checks into Bun runtime specs.
- Deepen runtime coverage around plugin resolution, store behavior, selector equality, rerender semantics, plugin conversion boundaries, override rules, HTML or static behavior, node-id, and affinity.
- Mine `../slate/packages/slate-react/test` by invariant, not by file copy:
  - `use-slate-selector` for equality and stale-rerender prevention
  - `use-slate` for editor version and subscription behavior
  - `use-selected` for selection rerender and path stability
  - `editable` for value-change vs selection-change partitioning
  - `decorations` for decoration propagation and redecorate behavior
  - `chunking` only if remaining core gaps justify chunk or index invalidation work
- Keep `react-editor.spec.tsx` and Playwright-style DOM focus coverage out unless a real Plate bug forces them in.

### Phase 4: high-ROI remaining packages

- `table`: prioritize transform-heavy and `with*` seams first, especially row or column mutations, selection helpers, merge or split behavior, and any remaining low-signal zero-coverage clusters.
- `selection`: keep it non-DOM where possible. Cover internal transforms, selection bookkeeping, copy or insert helpers, and hook behavior. Keep `moveSelection` and `shiftSelection` on Plate as the reviewed exception.
- `markdown`: deepen parser and serializer matrices, incomplete markdown and MDX boundaries, list edge cases, and explicit string assertions for readable outputs. Keep snapshots only where serialized structure is the contract.
- `code-block`, `list-classic`, `autoformat`, `link`: only add tests where real transform, parsing, or option behavior is still under-specified. Do not reopen packages that were already mostly cleanup work unless there is real logic left.

### Phase 5: secondary risk ring

- `media`: prioritize placeholder grouping, validation, URL or file-type logic, and upload decision helpers. Keep React flows thin.
- `docx-io` and `docx`: keep package tests on pure converters and cleaners; keep app-owned roundtrip coverage in `apps/www/src/__tests__/package-integration`.
- `ai`: prioritize pure markdown or range helpers, chunk utilities, and serializer or deserializer boundaries. Avoid network or model fakery.
- `dnd`, `combobox`, `suggestion`, `resizable`, `date`, `layout`, `list`: only add tests where branches, transforms, or parser-like logic justify the cost.

### Phase 6: thin wrappers only when earned

- Thin wrappers and export-heavy packages stay intentionally light.
- They only get tests when they gain meaningful branching logic, public type complexity, or real editor-state behavior.

## Verification And Acceptance

- `bun test` remains the default workflow and must stay fast enough to not punish local use. Treat runtime growth as a constraint, not an afterthought.
- After each phase, use coverage only to pick the next hotspot. For package truth, prefer `lcov` or package-scoped coverage output over Bun’s broad summary.
- Each phase is done only when the new tests prove public behavior through the smallest honest seam:
  - `createEditor` for pure Slate behavior
  - `createSlateEditor` for non-React plugin or editor wiring
  - `createPlateEditor` only for reviewed Plate-specific boundaries
- Each package pass must end with targeted Bun specs and the normal package verification path: build, typecheck, and lint for touched packages.
- `pnpm test:types` must stay green, and phase 3 expands it materially for core. Phase 2 only adds type-tests if a utility contract proves worth the cost.
- No browser or e2e lane is added anywhere in this program.

## Assumptions

- `testing.mdc` is the single source of truth for durable testing policy.
- The deleted cleanup or excellence plans do not need to come back; any lasting rule discovered during execution gets merged into `testing.mdc`.
- Utilities are runtime-first; core is where the serious compile-only type-contract work belongs.
- Upstream `../slate` remains reference material, not a suite to mirror.
- Coverage goals stay hotspot-driven. No global percentage floor, no bullshit smoke-test sweep.
