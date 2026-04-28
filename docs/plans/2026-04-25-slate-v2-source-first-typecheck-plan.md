# Slate v2 Source-First Typecheck Plan

## Goal

Make Slate v2 local typecheck behave like Plate: source-first during development, no package rebuild required just to typecheck edited source.

## Findings

- Plate keeps app/typecheck source graphs pointed at package `src` with explicit `paths`.
- Plate’s documented failure mode is source/dist split-brain, not missing rebuilds.
- Slate v2 currently makes Turbo `typecheck` depend on package `build`, which forces rebuilds even for source checks.
- Slate v2 already aliases package source in Next dev, but not in TypeScript site/root/package configs.
- TypeScript project references pull stale sibling `lib` declarations during package typecheck; source-first aliases must own local workspace resolution instead.
- Shared typecheck config cannot be build-shaped; `composite` and declaration output belong in `tsconfig.build.json`.
- Package `typecheck` scripts must use source `tsconfig.json`; `tsconfig.build.json` remains artifact-only.
- `createEditor` must construct the base editor internally and cast at the boundary; source-first package programs can include consumer augmentations without forcing core construction to satisfy plugin-specific editor shapes.
- `slate-react` must not override the shared package aliases with local `../slate` paths. That reintroduced `../slate/dist` into the package typecheck graph.
- Site TypeScript source aliases expose a deeper boundary problem: app-wide `CustomTypes` pollute package internals when package source is compiled inside the site program. That is a separate source-first site hardening pass, not a package typecheck prerequisite.

## Plan

1. Add central workspace source aliases for Slate packages.
2. Remove Turbo build dependency from package `typecheck`.
3. Fix any workspace dependency metadata that points at published Slate instead of the local workspace.
4. Verify package typecheck without a preceding build.

## Status

- [x] Package source aliases
- [x] Turbo typecheck dependency cut
- [x] Verification

## Evidence

- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-browser --filter=./packages/slate-hyperscript --force` passed without build tasks.
- `bun run lint` passed in `../slate-v2`.
- `bun typecheck` package phase ran only Turbo `typecheck` tasks and no package builds, then stopped in `site` because site still typechecks against package contract/dist.
- `bun typecheck:site` with temporary source aliases failed because site custom `CustomTypes` forced package source internals to satisfy app-specific `Editor`, `Element`, and `Text` shapes. The temporary site alias experiment was reverted.
- `.agents/AGENTS.md` and generated `AGENTS.md` now default to source-first typecheck and reserve builds for artifact-facing checks or packages that lack a source-first path.

## Deferred

- Site TypeScript source aliases are not safe yet. The site examples define custom Slate module types, and pulling package source into that same TS program makes package internals typecheck against app-specific editor shapes. Keep Next dev on source aliases, but keep site `tsc` on the package contract until the app/package type boundary is split.
