# Slate v2 Roadmap React Spec Core Name Fix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove the last active-spec use of `slate-v2` where the doc clearly meant the
  `slate` package.

## Finding

- `react-runtime-spec.md` still said:
  - `Core Contract Required From \`slate-v2\``
  - `` `slate-v2` owns committed state ``
- That contradicted the frozen package naming used everywhere else in the live
  roadmap/spec stack.

## Patch

- Normalize those references to `slate`.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/react-runtime-spec.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-react-spec-core-name-fix.md`
- [x] grep confirms the stale active-spec `slate-v2` core references are gone
