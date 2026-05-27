---
date: 2026-04-16
topic: slate-v2-tranche-2-execution
status: complete
---

# Goal

Execute tranche 2 in `/Users/zbeyens/git/slate-v2`: land React 19.2 plus the latest Next baseline in one behavior-preserving runtime/site compatibility lane.

# Scope

- root/site React + Next upgrades
- forced package/runtime compatibility fallout
- optional `slate-browser` landing only if genuinely non-conflicting
- no engine semantics work

# Phases

1. inventory current repo + draft lane + relevant learnings
2. choose exact target versions and impacted files
3. implement dependency/config/source compatibility changes
4. verify install/build/typecheck/lint/test
5. update tranche docs/ledgers if needed

# Constraints

- tranche rule: Next upgrade belongs here, not tranche 1
- repair-drift: same-path source first, minimum forced drift only
- review stop still applies after tranche completion

# Findings

- Registry targets used for this slice:
  - `react` / `react-dom`: `19.2.5`
  - `@types/react`: `19.2.14`
  - `@types/react-dom`: `19.2.3`
  - `next`: `16.2.4`
- Next 16 no longer accepts `eslint` inside `next.config.js`.
- Next 16's route bundling choked on the template-string example importer
  because it pulled `examples/ts/custom-types.d.ts` into the route bundle. The
  explicit importer map from the draft lane fixes that without widening runtime
  drift.
- React 19 type fallout was small and local:
  - stricter `useRef` initialization
  - null-aware ref object typing
  - `React.InputEvent` on the editable input handler

# Progress

- started tranche 2 execution
- upgraded root to React `19.2.5` and Next `16.2.4`
- updated site config for Next 16 (top-level `turbopack`, `.next/types` TS
  include, removed invalid `eslint` config, no forced webpack)
- fixed the explicit tranche-2 source fallout in `slate-react`
- recovered the explicit example importer map so Next 16 stops bundling
  `custom-types.d.ts`
- verification passed:
  - `pnpm install`
  - `pnpm turbo build --concurrency=1 --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-hyperscript --filter=./packages/slate-dom --filter=./packages/slate-react`
  - `pnpm turbo typecheck --concurrency=1 --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-hyperscript --filter=./packages/slate-dom --filter=./packages/slate-react`
  - `pnpm typecheck:site`
  - `pnpm build`
  - `pnpm lint:fix`
  - `pnpm lint`
  - `pnpm test`
