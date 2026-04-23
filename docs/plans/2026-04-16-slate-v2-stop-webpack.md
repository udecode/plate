---
date: 2026-04-16
topic: slate-v2-stop-webpack
status: complete
---

# Goal

Remove forced `--webpack` usage from `/Users/zbeyens/git/slate-v2` and align the Next setup with the working Plate repo shape.

# Scope

- root site scripts
- `site/next.config.js`
- any forced compatibility fallout required to keep Next green without `--webpack`

# Phases

1. inspect Plate repo reference and current slate-v2 Next setup
2. patch scripts/config to stop forcing webpack
3. verify build/type/lint/test for the affected lane

# Findings

- Plate uses `next build` / `next dev` directly and keeps `turbopack` as the
  active lane instead of forcing webpack.
- `slate-v2` no longer needs the webpack callback once the explicit example
  importer map is in place.
- Turbopack build and dev both boot cleanly after removing the forced webpack
  path.

# Progress

- started stop-webpack pass
- removed `--webpack` from `build:next` and `serve`
- removed the old webpack-only branch from `site/next.config.js`
- kept dev-only turbopack source aliases, aligned with the Plate reference
- verification passed:
  - `pnpm build:next`
  - `pnpm typecheck:site`
  - `pnpm lint`
  - `pnpm serve` booted cleanly on Next 16.2.4 Turbopack
