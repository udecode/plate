# Editor Benchmarks Move

## Goal
Move the standalone editor benchmark lab into `plate-2` under `benchmarks/editor`
as an isolated non-workspace project.

## Phases
- [x] Gather repo patterns and benchmark repo shape
- [x] Copy/move benchmark lab into `plate-2` without workspace integration
- [x] Adjust paths/docs/helpers for in-repo isolated operation
- [x] Verify the moved lab still builds/runs in isolation

## Notes
- Keep it out of pnpm workspace and Turbo
- Preserve its own lockfile/package manager
- Do not drag benchmark deps into main CI
- Moved location: `benchmarks/editor`
- Root viewer `tsconfig.json` now excludes `apps/`, `tests/`, and `website/` so
  the root Next build does not typecheck separate target apps with the wrong
  install graph.
- Verified from the moved path with fresh installs plus:
  - `npm run build:web`
  - `apps/plate: npm run build`
  - `apps/slate: npm run build`
  - `PORT=3333 npm run start:web` then `curl http://127.0.0.1:3333 -> 200`
- Root helpers now exist under `package.json` as `bench:editor:*`.
- Plate target now uses:
  - `source` mode for dev
  - `built` mode for serious benchmark runs
  - `published` only as fallback/reference
