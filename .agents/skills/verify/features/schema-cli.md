# Optional schema CLI

`@platejs/cli` generates typed editor schemas (`editor.schema.json`, `editor.generated.ts`), verifies them with `--check`, scaffolds and runs document migrations, and updates consumer dependencies.

## Sub-features

- `cli-generate`: emit schema/types and detect stale output via `--check`.
- `cli-migrate-new`: scaffold a checksummed migration from committed Git HEAD artifacts.
- `cli-migrate-run`: dry-run, `--check`, `--write`, and `--stdin` document migrations.
- `cli-deps`: update matching stale dependencies in a consumer `package.json`.

## How to get to it (user POV)

- Run `plate generate|migrate|deps ...` in a consumer project.
- Run `pnpm --filter @platejs/cli run test` for automated CLI fixtures.

## Driving it with the built CLI binary

Preconditions: built binary at `<checkout>/packages/cli/dist/bin.js` (`pnpm --filter @platejs/cli build`), plus a disposable consumer dir outside the repo with `package.json` (`"type": "module"`) and `tsconfig.json` extending `tooling/config/tsconfig.base.json` with `platejs` source aliases.

- **Doctor:** `node <abs>/packages/cli/dist/bin.js --version` matches `packages/cli/package.json`.
- **Generate and check:** copy the fixture entry from `packages/cli/test/generate.test.ts` to `editor.ts`, run `generate editor.ts` (creates `editor.schema.json` + `editor.generated.ts`, leaves `editor.ts` untouched), then `generate editor.ts --check` (exit 0, unchanged mtimes).
- **Stale detection:** append a marker to `editor.generated.ts`, confirm `generate editor.ts --check` exits nonzero without modifying files, then restore and re-verify exit 0.
- **Migrations:** commit v2 outputs in the consumer's own Git repo, bump to v3, run `migrate new <name> --entry editor.ts`; test `migrate run` in default, `--check`, `--write`, and `--stdin` modes.
- **Cleanup:** copy logs to `docs/plans/artifacts/<task-slug>/` and delete only the disposable consumer dir.

## Gotchas

- Ordinary editor setup never requires `@platejs/cli`.
- `migrate new` reads the consumer's real Git HEAD; never run fixture Git commands inside the Plate worktree.
- TSX entries with JSX need React installed in the consumer; path aliases alone are insufficient.
