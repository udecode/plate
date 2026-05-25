# Editor Benchmarks Neutral Registry + Fixtures

## Goal

Implement a benchmark-owned neutral protocol registry and fixture layer in
`/Users/zbeyens/git/editor-benchmarks`.

## Scope

- stop making the app's truth depend directly on Plate docs
- seed neutral registry data from current Plate behavior work
- add canonical fixture metadata for benchmark lanes
- wire the app to load and surface the new layer

## Verification

- `npm run build:web`
- `npx eslint` on touched files
- browser screenshot on `http://127.0.0.1:3023`
