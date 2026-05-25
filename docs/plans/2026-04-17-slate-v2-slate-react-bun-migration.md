---
date: 2026-04-17
topic: slate-v2-slate-react-bun-migration
status: completed
---

# Goal

Move `/Users/zbeyens/git/slate-v2/packages/slate-react` off Jest with a Bun-first
approach. Pause if the remaining lane hits a real Bun or DOM-environment blocker.

# Current State

- package test script still runs:
  - Bun lane: `packages/slate-react/test/bun/**`
  - Jest lane: `packages/slate-react/test/*.spec.ts[x]`
- current non-Bun files:
  - `chunking.vitest.ts`
  - `decorations.vitest.tsx`
  - `react-editor.vitest.tsx`
  - `use-selected.vitest.tsx`
- root Bun setup already provides:
  - Happy DOM globals
  - Testing Library jest-dom matchers
  - `jest.fn` compatibility
- existing Jest carry reasons from the earlier tsdown cut:
  - source resolution for workspace packages
  - jsdom environment
  - React/DOM behavior assertions

# Findings

- `slate-react` no longer needs Jest for basic mocking semantics; Bun setup
  already exposes `jest.fn`.
- the remaining question is not mocking, it is whether these four spec files run
  honestly under Bun + Happy DOM without rewriting product behavior.
- `react-editor.spec.tsx` and `use-selected.spec.tsx` are clearly React/DOM
  lanes.
- `chunking.spec.ts` is not a pure non-React lane; it imports `withReact`,
  `ReactEditor`, and DOM-backed chunk tree behavior.
- `decorations.spec.tsx` is also DOM-backed because it reads rendered leaves
  through `ReactEditor.toDOMNode(...)`.
- direct Bun status on the current Jest-owned files:
  - `chunking.vitest.ts`: green
  - `decorations.vitest.tsx`: green
  - `use-selected.vitest.tsx`: green
  - `react-editor.vitest.tsx`: 1 failing test
- current blocker test:
  - `ReactEditor > .focus > should be able to call .focus without getting toDOMNode errors`
- Bun + Happy DOM still failed that row with the selection stuck on `"test"`.
- Bun + ad hoc JSDOM preload also failed, but with `"foobar"` instead of
  `"bar"`.
- Vitest + Happy DOM failed with the same `"test"` shape as Bun + Happy DOM.
- The stable fix was not “use Vitest” by itself. The stable fix was:
  - keep the existing Bun lane for `test/bun/**`
  - move the remaining `test/*.spec.{ts,tsx}` lane to Vitest
  - run that Vitest lane on `jsdom 20.0.3`
- With `jsdom 20.0.3`, the full `slate-react` Vitest lane went green,
  including `react-editor.spec.tsx`.

# Final State

- `packages/slate-react/test/bun/**` stays on Bun
- `packages/slate-react/test/*.vitest.{ts,tsx}` now runs on Vitest + jsdom
- package `test` script is now `test:bun && test:vitest`
- root `test` script is now `test:bun && test:vitest`
- Jest config and the root Jest wrapper script are deleted

# Verification So Far

- `pnpm --dir /Users/zbeyens/git/slate-v2 exec bun test ./packages/slate-react/test/chunking.vitest.ts`
- `pnpm --dir /Users/zbeyens/git/slate-v2 exec bun test ./packages/slate-react/test/decorations.vitest.tsx`
- `pnpm --dir /Users/zbeyens/git/slate-v2 exec bun test ./packages/slate-react/test/use-selected.vitest.tsx`
- `pnpm --dir /Users/zbeyens/git/slate-v2 exec bun test ./packages/slate-react/test/react-editor.vitest.tsx`
- `pnpm --filter slate-react test`
- `pnpm turbo build --filter=./packages/slate-react`
- `pnpm turbo typecheck --filter=./packages/slate-react`
- `pnpm lint:fix`
- `pnpm test`
- `PLAYWRIGHT_BASE_URL=http://localhost:3101 bun check`

# Verification Targets

- targeted `bun test` on migrated `slate-react` spec files
- `pnpm --filter slate-react test`
- `pnpm turbo build --filter=./packages/slate-react`
- `pnpm turbo typecheck --filter=./packages/slate-react`
- `pnpm lint:fix`
