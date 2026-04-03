# TypeScript 6 upgrade for PR 4887

## Goal

Make the current checkout pass with TypeScript 6, or identify the exact blocker if the ecosystem is not ready.

## Context

- Root `package.json` currently pins `typescript` to `5.8.3`.
- The repo already has documented pitfalls around mixed `src`/`dist` graphs and misleading filtered Turbo typecheck failures.
- The user supplied the TS 6 migration guide. I still need primary-source confirmation for toolchain compatibility before changing versions.

## Relevant learnings

### Workspace alias split-brain

- Source: `docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md`
- Takeaway: do not trust noisy type explosions until I confirm whether the TS program is mixing package `src` and `dist`.

### Turbo filtered typecheck can lie

- Source: `docs/solutions/test-failures/2026-03-24-turbo-filtered-typecheck-can-lie-when-package-typecheck-passes.md`
- Takeaway: if filtered Turbo typecheck fails, verify the package directly and rerun serialized before declaring real debt.

## Plan

1. Confirm TS 6 release + compatibility of key tooling from primary sources.
2. Reproduce the failing check on this checkout.
3. Upgrade the minimum required deps/config for TS 6.
4. Fix real breakage exposed by the upgrade.
5. Run install/build/typecheck/lint verification in the required order.
6. Decide whether this work produces reusable knowledge and capture it if yes.

## Verification gate

- `pnpm install`
- `pnpm turbo build ...`
- `pnpm turbo typecheck ...`
- `pnpm lint:fix`

## Errors encountered

- None yet.
