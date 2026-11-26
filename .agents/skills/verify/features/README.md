# Plate verification map

Maintained user-facing feature map for Plate and Plite. Read this index, then follow the matching feature file.

## Baseline preconditions

- Work from the current checkout root with dependencies installed and owned ports.
- Run `node apps/plite/scripts/inspect-plite-browser.mjs doctor` before Plite browser runs.
- Keep all proof artifacts under `docs/plans/artifacts/<task-slug>/`.

## Driving conventions

- Prefer stable handles (route paths, `[data-editor="true"]`, ARIA roles, visible text).
- Type key by key for input rules, hotkeys, marks, or trigger menus (`.agents/pstack/rules/browser.md`).
- Run managed Playwright proofs serially and keep artifacts during cleanup.

## Feature entry contract

Each file has an H1 title, a one-paragraph summary, and four H2s: `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`.

## Features

- [Plite browser examples](./plite-examples.md): interactive Plite editor examples and managed Playwright suites.
- [Plate copied UI and blocks](./plate-ui-blocks.md): registered block previews, docs demos, and Base/Radix create-install consumers.
- [Public package entrypoints](./public-packages.md): `plitejs`, `platejs`, and `@platejs/test` partitions, runtime entrypoints, and packed release checks.
- [Optional schema CLI](./schema-cli.md): `@platejs/cli` generate, check, migrate, and deps commands.
- [Docs and registry outputs](./docs-registry.md): English/Chinese docs routes, previews, registry builds, and route health.
