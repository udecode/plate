# Proof Routing

Choose proof from actual touched surfaces.

| Surface                       | Minimum focused proof                                         | Handoff expansion                                           |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| package metadata/dependencies | `pnpm install`; `pnpm test:manifests`                         | root `check` only when requested or required                |
| package import boundaries     | scoped `lint:fix`; audit affected `oxlint.config.ts` override | prove new source roots and entrypoints have no broad ignore |
| package source/types          | package source-first typecheck and focused tests              | declaration/build proof when exports or artifacts changed   |
| exports/files                 | `pnpm brl`; export audit                                      | package consumer typecheck                                  |
| copied registry UI            | owning app typecheck and focused tests                        | Browser on `/blocks/<id>-demo` when available               |
| docs                          | source/API/link audit                                         | affected docs build or route proof                          |
| registry metadata             | registry metadata tests/audit                                 | install/render path proof                                   |
| package release               | changeset validation                                          | release lane owns publication                               |
| registry release              | registry changelog validation                                 | registry build remains CI-owned                             |
| agent workflow                | `pnpm install`, source/mirror checks                          | agent-native review                                         |

Always run lint on changed files or the repo's scoped equivalent. Do not run
`build:registry` locally. Browser proof is required for package, registry, or
docs changes with a runnable surface; record the exact blocker when no runnable
path exists.

Before completion, audit:

- public exports and stale import paths;
- exactly four package roots remain: `plitejs`, `platejs`, `@platejs/cli`, and
  `@platejs/test`;
- `@platejs/cli` and `@platejs/test` peer on `platejs` with `workspace:^` as
  the local dev provider and no normal `platejs` dependency;
- only `packages/platejs` declares or imports `plitejs`;
- every Plate feature is reachable through `platejs`, `platejs/react`, or an
  entrypoint declared in `tooling/entrypoints/entrypoint-dag.mjs`; every public
  entrypoint declares exactly one `headless`, `ssr`, or `client` runtime, and
  Oxlint rejects undeclared entrypoint edges, cycles, React reachability from
  headless roots, and facade bypasses;
- optional peers are optional capabilities or shared runtimes, declare matching
  `peerDependenciesMeta` and dev providers, and do not hide always-required
  implementation libraries;
- only `packages/platejs` declares or imports `plitejs`, apart from named raw
  Plite proof/test entrypoint consumers;
- headless Plate and Plite roots cannot reach React packages, React entrypoints,
  or React-owned source trees;
- package self-import and reverse `plitejs -> platejs` bans still cover every
  affected source root;
- package/registry ownership duplication;
- the generated runtime matrix Node-imports every public entrypoint, executes
  every headless entrypoint without React or DOM, renders every SSR entrypoint
  without DOM, and exercises every client entrypoint in a real browser;
- copied registry metadata and examples;
- docs and release classification;
- Plate Next version/status and package fingerprint when attesting;
- accepted P1 review findings.
