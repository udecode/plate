# Public package entrypoints

Public package entrypoints expose `plitejs`, `platejs`, and `@platejs/test` across headless, React, SSR, and declaration consumers while enforcing the entrypoint graph.

## Sub-features

- `pkg-partitions`: isolated package test partitions and package typechecks.
- `pkg-public-types`: `dist` declaration builds and external consumer typechecks.
- `pkg-runtime-entrypoints`: client export check via `apps/plite` `/runtime-entrypoints`.
- `pkg-packed-release`: packed tarball headless, SSR, and boundary export checks.

## How to get to it (user POV)

- Import from `plitejs`, `plitejs/<subpath>`, `platejs`, `platejs/<subpath>`, or `@platejs/test`.
- Run `pnpm entrypoint:turbo:check`, `pnpm plite:typecheck`, `pnpm plite:public-types`, or `pnpm plite:release:packages`.

## Driving it with pnpm package runners

Preconditions: dependencies are installed and `tooling/entrypoints/entrypoint-dag.mjs` matches generated scripts and `package.json` exports.

- **Entrypoint graph:** `pnpm entrypoint:turbo:check && pnpm test:manifests` exits 0.
- **Typecheck:** `pnpm plite:typecheck` (or `pnpm --filter <plitejs|platejs|@platejs/test> typecheck`) exits 0.
- **Partition tests:** `pnpm --filter <plitejs|platejs|@platejs/test> run test:partition:<name>` or `node tooling/scripts/package-tests.mjs <exact-test-file>` exits 0.
- **Fast root tests:** `pnpm test:fast` (or `pnpm test apps/www/<path>`) exits 0.
- **Public types:** `pnpm plite:public-types` exits 0 with no new leaks beyond `tooling/entrypoints/declaration-consumer-baseline.json` and `check-package-declaration-brands.mjs` baselines; run `node tooling/scripts/check-source-declaration-leaks.mjs` for source `.d.ts` leaks.
- **Runtime entrypoints:** `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/runtime-entrypoints.test.ts` exits 0 (asserts `[data-runtime-entrypoint-proof="passed"]` on `apps/plite` `/runtime-entrypoints`).
- **Packed release:** `pnpm plite:release:packages` exits 0 across packed headless/SSR/DCE checks (`pnpm plite:release:boundaries` runs the faster optional-peer subset).

## Gotchas

- `pnpm check --affected` runs only `land: true` steps, skipping `entrypoint-graph`, `public-types`, `plite-test`, and `lint`.
- Never run raw `bun test <folder>` on `platejs`, `plitejs`, or `@platejs/test`; `mock.module` leaks across files and some suites require Vitest (`plitejs` React/Cloudflare and `@platejs/test` browser).
- `pnpm test <path>` skips `packages/platejs`, `packages/plitejs`, `packages/test`, and `packages/cli` (`No tests matched`); use `node tooling/scripts/package-tests.mjs <exact-file>` (folder args are rejected).
- `TS4094` errors on wrapped native factories appear during `pnpm --filter platejs build`, not `typecheck`.
- Pass `TURBO_FORCE=true` when cached Turbo or `pnpm check` passes cannot satisfy the proof.
