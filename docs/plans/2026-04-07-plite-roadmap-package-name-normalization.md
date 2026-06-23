# Plite Roadmap Package Name Normalization

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

- Remove stale pre-freeze package names from the active Plite spec docs.

## Finding

- `core-foundation-spec.md` still talked about `plite`,
  `plite-dom-v2`, and `plite-react-v2` as package names.
- `dom-runtime-boundary-spec.md` still used `plite-dom-v2` and
  `plite-react-v2`.
- `chunking-review.md` still described the runtime target as
  `plite-react-v2`.

## Patch

- Normalize the active spec docs to the actual package names:
  - `slate`
  - `plite-dom`
  - `plite-react`

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/plite/core-foundation-spec.md /Users/zbeyens/git/plate-2/docs/plite/dom-runtime-boundary-spec.md /Users/zbeyens/git/plate-2/docs/plite/references/chunking-review.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-plite-roadmap-package-name-normalization.md`
- [x] grep confirms the stale `*-v2` package names are gone from those target docs
