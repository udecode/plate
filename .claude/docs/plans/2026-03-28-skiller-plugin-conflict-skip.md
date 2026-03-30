# Skiller plugin conflict skip

## Goal

Patch `../skiller` so plugin-managed skills that conflict with local/manual skills can be skipped instead of being installed under duplicate names like `compound-engineering-*`.

## Context

- `plate` has local skills in `.agents/skills` that already occupy names like `ce-plan` and `document-review`.
- The globally enabled `compound-engineering` plugin currently syncs the same items into `.agents/skills` under namespaced directories.
- Existing `skiller` behavior hardcodes conflict resolution to namespace-on-conflict.

## Plan

1. Add a `skills` config option in `skiller` for plugin conflict handling.
2. Cover config parsing and plugin sync behavior with tests.
3. Pass the config through the apply path into plugin sync.
4. Set `plate/.claude/skiller.toml` to skip conflicting plugin items.
5. Verify `skiller apply` no longer regenerates the duplicate `compound-engineering-*` skills.

## Findings

- Existing repo learnings only cover canonical agent ids in `skiller.toml`, not duplicate plugin skills.
- The critical-patterns file referenced by `learnings-researcher` does not exist in this repo.
- `cloneLoadedConfig` in `../skiller/src/core/apply-engine.ts` currently drops `skills` config, so any new `skills` option must be threaded there too.

## Verification

- `../skiller`: targeted Jest tests for config parsing and plugin sync
- `../skiller`: `pnpm build`
- `../skiller`: `pnpm lint:fix`
- `plate`: `bun x /Users/zbeyens/git/skiller/dist/cli/index.js apply`
- `plate`: `pnpm lint:fix`
