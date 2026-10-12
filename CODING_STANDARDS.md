# Coding standards

Read this file before source, test or tooling changes. `VISION.md` owns product
direction and `AGENTS.md` owns lifecycle.

- Preserve callback inference. Repair the owning generic instead of hiding a
  broken contract with casts or explicit callback parameter annotations.
- Keep published types, JSDoc, runtime behavior and real examples consistent.
  Use the current package builders and public entrypoints.
- Prefer inline code for one owner. Extract a reusable helper only when it has
  a distinct job. Comments explain non-obvious reasons; public JSDoc stays.
- Before changing tests, load `verify` and read `.agents/pstack/rules/tests.md`.
  Assert observable behavior at its real owner. Type contracts belong in
  `type-tests/`; native behavior needs browser proof.
- Bun owns the repository test lanes. Inspect `tooling/config/test-suites.mjs`
  and the affected package scripts before selecting a runner. Run a focused
  path with `./` so Bun does not treat it as a repository-wide name filter.
- Typechecking follows the actual package graph. The root typecheck builds
  packages first. App source aliases do not make every package source-first.
  Build only when the selected runner resolves generated declarations or dist.
- Use Biome and ESLint through repository scripts. `pnpm lint:fix` is the last
  check that edits code. Scope formatting to this task when other work exists.
- Keep generated skill and pstack files out of formatter rewrites. Regenerate
  skills through `pnpm run prepare` and check with `pnpm check:workflow`.
- Run `pnpm brl` when exported files move, public files are added or removed,
  or a barrel check reports drift. Include the generated barrels.
- Templates and registry build output are CI-owned. Fix the source inputs.
- For recognizable local install corruption, run `pnpm run reinstall` once,
  then retry the exact failing command. Examples include mixed Bun/pnpm React
  paths, null dispatchers and missing modules unrelated to the diff. Do not
  change product code to hide install corruption.
- Third-party code and documentation need a verified license or permission.
  Retain required notices and independently express harvested behavior tests.

`pnpm check` runs workflow validation, lint, package typecheck and the existing
test lanes. A red check remains open until repaired or reproduced at the base
commit with its exact limitation recorded. Do not weaken a gate to get green.
