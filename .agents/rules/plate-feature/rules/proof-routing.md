# Proof Routing

Choose proof from actual touched surfaces.

| Surface | Minimum focused proof | Handoff expansion |
| --- | --- | --- |
| package metadata/dependencies | `pnpm install`; manifest checks | root `check` only when requested or required |
| package source/types | package source-first typecheck and focused tests | declaration/build proof when exports or artifacts changed |
| exports/files | `pnpm brl`; export audit | package consumer typecheck |
| copied registry UI | owning app typecheck and focused tests | Browser on `/blocks/<id>-demo` when available |
| docs | source/API/link audit | affected docs build or route proof |
| registry metadata | registry metadata tests/audit | install/render path proof |
| package release | changeset validation | release lane owns publication |
| registry release | registry changelog validation | registry build remains CI-owned |
| agent workflow | `pnpm install`, source/mirror checks | agent-native review |

Always run lint on changed files or the repo's scoped equivalent. Do not run
`build:registry` locally. Browser proof is required for package, registry, or
docs changes with a runnable surface; record the exact blocker when no runnable
path exists.

Before completion, audit:

- public exports and stale import paths;
- package/registry ownership duplication;
- headless and static consumers;
- copied registry metadata and examples;
- docs and release classification;
- Plate Next version/status and package fingerprint when attesting;
- accepted P1 review findings.
