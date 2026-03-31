# Phase 2 Utility Ring Execution

## Goal

Complete phase 2 for:

1. `@platejs/utils`
2. `@udecode/react-utils`
3. `@udecode/utils`

Use TDD for every new spec group. Keep this file as the live record for status, findings, verification, and learnings.

## Checklist

- [completed] Audit existing source and specs for all three packages
- [completed] Complete `@platejs/utils`
- [completed] Complete `@udecode/react-utils`
- [completed] Complete `@udecode/utils`
- [completed] Merge any durable testing learnings into `testing.mdc`
- [completed] Run final verification for touched packages

## Findings

- Phase 2 package surfaces are still sparse compared to `@platejs/slate`:
  - `@platejs/utils`: 5 specs / 26 source files
  - `@udecode/react-utils`: 4 specs / 18 source files
  - `@udecode/utils`: 6 specs / 17 source files
- `@platejs/core` already has a much wider runtime base plus one compile-only type fixture, so deferring core until after the utility ring still makes sense.
- The shared upstream `slate-react` invariant that cleanly maps into phase 2 is `use-slate-selector`; the rest are phase-3 core material.
- `@platejs/utils` has real untested behavior in `ExitBreakPlugin`, selection hooks, fragment hooks, toolbar/remove hooks, and `BlockPlaceholderPlugin`.
- `@udecode/react-utils` has several branchy runtime helpers with no direct specs yet: primitive factories, `useEffectOnce`, `useOnClickOutside`, `useStableFn`, `useStableMemo`, `PortalBody`, and `withRef`.
- `@udecode/utils` mostly needs branch completion plus direct coverage for `findHtmlParentElement`.
- Existing harness patterns are usable as-is:
  - `normalizeRoot(...)` for normalize plugin behavior in `@platejs/utils`
  - `renderHook(...)` with Plate context for selector-backed hooks
  - small file-local editor builders are better than importing helpers from another spec
- `@udecode/react-utils` had two real runtime bugs, not just missing tests:
  - `createPrimitiveComponent` leaked `setProps` onto DOM nodes
  - `createPrimitiveComponent` merged hook and consumer styles, then overwrote the merged result with the raw consumer `style` prop
- `@udecode/utils` did not reveal new runtime bugs in scope; the remaining work was branch completion and one new direct helper suite.

## Progress

- Created phase-2 execution log.
- Re-read `tdd`, `planning-with-files`, and current testing policy.
- Audited target package sources and existing specs.
- Audited existing harness patterns for `@platejs/utils`.
- Wrote the first `@platejs/utils` red specs for `ExitBreakPlugin` and hook behavior.
- Added direct `@platejs/utils` coverage for:
  - `ExitBreakPlugin`
  - selection hooks
  - selection fragment hooks
  - `useEditorString`
  - `useMarkToolbarButton`
  - `useRemoveNodeButton`
  - `BlockPlaceholderPlugin`
- Added direct `@udecode/react-utils` coverage for:
  - `createPrimitiveComponent`
  - `createPrimitiveElement`
  - `createSlotComponent`
  - `useEffectOnce`
  - `useOnClickOutside`
  - `useStableFn`
  - `useStableMemo`
  - `PortalBody`
  - `withRef`
- Fixed `@udecode/react-utils` runtime bugs exposed by the new tests:
  - stop forwarding `setProps` to DOM elements in `createPrimitiveComponent`
  - preserve merged hook + consumer styles in `createPrimitiveComponent`
- Added `@udecode/utils` coverage for:
  - `findHtmlParentElement`
  - extra `isUrl` falsey/malformed branches
  - extra `sanitizeUrl` internal-link and undefined-input branches
  - extra `mergeProps` precedence/query branches

## Verification

- `bun test packages/utils/src` passed.
- `bun test packages/udecode/react-utils/src` passed.
- `bun test packages/udecode/utils/src` passed.
- `pnpm install` passed.
- `pnpm turbo build --filter=./packages/utils --filter=./packages/udecode/react-utils --filter=./packages/udecode/utils` passed.
- `pnpm turbo typecheck --filter=./packages/utils --filter=./packages/udecode/react-utils --filter=./packages/udecode/utils` passed.
- `bun lint:fix` passed.
- `bun typecheck` passed.
- Final combined phase-2 suite passed:
  - `bun test packages/utils/src packages/udecode/react-utils/src packages/udecode/utils/src`

## Learnings

- `durable testing rule`: `mock` and `spyOn` are already global via `tooling/config/global.d.ts`. Importing them from `bun:test` in new specs caused `describe` globals to disappear for those files. Phase-2 specs should use Bun globals only.
- `durable testing rule`: in this Bun + Testing Library setup, prefer render-returned queries over `screen`. Existing package tests already leaned that way, and new `screen` usage produced false harness failures.
- `durable testing rule`: avoid `toHaveStyle` in Bun specs here. Direct style property assertions are more reliable and avoid matcher internals that are currently broken in this setup.
- `package reality`: plugin `configure({ options })` paths should omit unset keys in test helpers. Passing explicit `undefined` values clobbered `BlockPlaceholderPlugin` defaults and created fake failures.
- `package reality`: `mergeProps({ handlerQuery: null })` does not disable handler merging. It means “no predicate gate,” so handler keys still merge.
- `bug found`: `createPrimitiveComponent` leaked `setProps` to DOM elements.
- `bug found`: `createPrimitiveComponent` dropped hook styles whenever the caller also passed `style`.

## Errors

- None yet.
