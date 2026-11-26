# Optional schema CLI

`@platejs/cli` generates typed editor schemas (`editor.schema.json`, `editor.generated.ts`), verifies them with `--check`, scaffolds and runs document migrations, and updates consumer dependencies.

## Sub-features

- `cli-generate`: emit schema/types and detect stale output via `--check`.
- `cli-migrate-new`: scaffold a checksummed migration from committed Git HEAD artifacts.
- `cli-migrate-run`: dry-run, `--check`, `--write`, `--stdin`, and `--from <version|current>` document migrations.
- `cli-deps`: update matching stale dependencies in a consumer `package.json`.

## How to get to it (user POV)

- Run `plate generate|migrate|deps ...` in a consumer project.
- Build workspace dependencies first (`pnpm turbo run build --filter=@platejs/cli`), then run `pnpm --filter @platejs/cli run test` for automated CLI fixtures.

## Driving it with the built CLI binary

Preconditions: built binary and workspace dependencies (`pnpm turbo run build --filter=@platejs/cli`), plus a disposable consumer dir outside the repo with `package.json` (`"type": "module"`) and `tsconfig.json` extending `tooling/config/tsconfig.base.json` with `"rootDir": "/"` and `paths` aliases for `platejs`, `platejs/compiler`, `platejs/migrations`, and `platejs/react`.

- **Doctor:** `node <abs>/packages/cli/dist/bin.js --version` matches `packages/cli/package.json`.
- **Generate and check:** copy the fixture entry from `packages/cli/test/generate.test.ts` to `editor.ts`, run `generate editor.ts` (creates `editor.schema.json` + `editor.generated.ts`, leaves `editor.ts` untouched), then `generate editor.ts --check` (exit 0, unchanged mtimes).
- **Stale detection:** append a marker to `editor.generated.ts`, confirm `generate editor.ts --check` exits nonzero without modifying files, then restore and re-verify exit 0.
- **Migrations:** commit v2 outputs in the consumer's own Git repo, make a structural schema change (such as adding a required property) plus bump `version` to `3`, and run `migrate new <name> --entry editor.ts`. For `migrate run`, use an entry exporting `EditorMigrations` via `defineDocumentMigrations` (`packages/cli/test/run-migration.test.ts`) and test default dry-run, `--check`, `--stdin`, and `--write` (pass `--from <version>` for raw JSON inputs, omit `--from` for persisted `{ document, schema }` envelopes).
- **Deps:** run `node <abs>/packages/cli/dist/bin.js deps <package-specifier> --yes --cwd <consumer-dir>` (use a non-matching specifier for an offline no-op check, or `--latest --yes` without `--install` when npm registry access is available).
- **Cleanup:** copy logs to `docs/plans/artifacts/<task-slug>/` and delete only the disposable consumer dir.

## Gotchas

- Ordinary editor setup never requires `@platejs/cli`.
- Both `pnpm --filter @platejs/cli build` and `pnpm --filter @platejs/cli run test` fail in a fresh worktree until `plitejs` and `platejs` are built (`pnpm turbo run build --filter=@platejs/cli`).
- `migrate new` reads the consumer's real Git HEAD and rejects version-only bumps without structural schema changes; never run fixture Git commands inside the Plate worktree.
- TSX entries with JSX need React installed in the consumer; path aliases alone are insufficient.
