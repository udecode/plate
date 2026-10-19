# Template update and check repair

## Goal

Run `pnpm templates:update`, reproduce the current `pnpm templates:check` failure, and fix the actual breakage without undoing the `baseUrl` keep.

## Context

- `apps/www/tsconfig.json` keeps `baseUrl: "."` because Bun still misbehaves for this repo shape without it.
- `templates:update` is supposed to generate and normalize templates.
- `templates:check` is the verification layer and currently needs to pass after the TS 6 work.

## Relevant learnings

### Template updater should generate, not own CI verification

- Source: `docs/solutions/developer-experience/2026-03-13-template-update-script-should-not-own-ci-verification.md`
- Takeaway: let `templates:update` mutate and lint-fix generated output; keep failing verification in `templates:check` and workflow-level commands.

## Plan

1. Run `pnpm templates:update`.
2. Run `pnpm templates:check` and capture the first real failure.
3. Trace the failure to root cause before editing.
4. Apply the smallest fix that keeps template generation/check boundaries sane.
5. Re-run `pnpm templates:update`, `pnpm templates:check`, and repo-required lint verification.
6. Decide whether this produced reusable knowledge and capture it if yes.

## Verification gate

- `pnpm templates:update`
- `pnpm templates:check`
- `pnpm lint:fix`

## Errors encountered

- `pnpm templates:update` failed immediately in `tooling/scripts/update-templates.sh` with `EXTRA_ARGS[@]: unbound variable` under `set -euo pipefail` when no CLI args were passed.
- Template linting from `templates/plate-template` walked the repo root instead of the template when the scripts used `biome check .`.
- `templates/plate-playground-template/biome.jsonc` still pointed at `ultracite/core`, which Biome could not resolve in the template setup.
- TypeScript 6 now errors on template `baseUrl` during `tsc --noEmit`; templates need `ignoreDeprecations: "6.0"` while we keep `@/*`.
- `templates/plate-playground-template` still failed lint after update because the generated `code-drawing-node.tsx` inherited a Biome violation from the registry source in `apps/www/src/registry/ui/code-drawing-node.tsx`.
- Template generation can emit fixes Biome only applies in `--unsafe` mode, so template `lint:fix` needs to be the real normalization path rather than a safe-fix subset.
