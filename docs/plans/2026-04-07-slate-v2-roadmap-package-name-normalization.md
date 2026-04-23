# Slate v2 Roadmap Package Name Normalization

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove stale pre-freeze package names from the active Slate v2 spec docs.

## Finding

- `core-foundation-spec.md` still talked about `slate-v2`,
  `slate-dom-v2`, and `slate-react-v2` as package names.
- `dom-runtime-boundary-spec.md` still used `slate-dom-v2` and
  `slate-react-v2`.
- `chunking-review.md` still described the runtime target as
  `slate-react-v2`.

## Patch

- Normalize the active spec docs to the actual package names:
  - `slate`
  - `slate-dom`
  - `slate-react`

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/core-foundation-spec.md /Users/zbeyens/git/plate-2/docs/slate-v2/dom-runtime-boundary-spec.md /Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-package-name-normalization.md`
- [x] grep confirms the stale `*-v2` package names are gone from those target docs
