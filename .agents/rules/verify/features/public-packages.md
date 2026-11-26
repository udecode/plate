# Public package entrypoints

Public package entrypoints expose `plitejs`, `platejs`, and `@platejs/test` across headless, React, SSR, and declaration consumers while enforcing the entrypoint graph.

## Sub-features

- `pkg-partitions`: isolated package test partitions and package typechecks.
- `pkg-public-types`: `dist` declaration builds and external consumer typechecks.
- `pkg-runtime-entrypoints`: client export check via `/runtime-entrypoints`.
- `pkg-packed-release`: packed tarball headless, SSR, and boundary export checks.

## How to get to it (user POV)

- Import from `plitejs`, `platejs`, or `platejs/<subpath>`.
- Run `pnpm check --affected`, `pnpm plite:public-types`, or `pnpm plite:release:packages`.

## Driving it with pnpm package runners

Preconditions: dependencies are installed and `tooling/entrypoints/entrypoint-dag.mjs` matches `package.json` exports.

- **Typecheck:** `pnpm --filter plitejs typecheck` or `pnpm --filter platejs typecheck` exits 0.
- **Partition tests:** `pnpm --filter platejs run test:partition:<name>` or `node tooling/scripts/package-tests.mjs <test-file>` exits 0.
- **Fast root tests:** `pnpm test:fast` (or `pnpm test apps/www/<path>`) exits 0.
- **Public types:** `pnpm plite:public-types` exits 0 with zero declaration leaks.
- **Packed release:** `pnpm plite:release:packages` exits 0 across packed headless/SSR imports.

## Gotchas

- Never run raw `bun test <folder>` on `platejs`/`plitejs`; `mock.module` leaks across files.
- `pnpm test <path>` skips `packages/platejs` and `packages/plitejs` (`No tests matched`); use `node tooling/scripts/package-tests.mjs <file>`.
- `TS4094` errors on wrapped native factories appear during `pnpm --filter platejs build`, not `typecheck`.
- Pass `TURBO_FORCE=true` when cached Turbo passes cannot satisfy the proof.
