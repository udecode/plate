# Slate v2 Roadmap Final Spec Name Sync

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Finish the active spec-stack package naming cleanup.

## Finding

- Active specs still mixed the real package names with old placeholders:
  - `slate-v2`
  - `slate-dom-v2`
  - `slate-react-v2`
- That contradicted the frozen package map and the public package docs.

## Patch

- Normalize the active specs and north-star doc to the real package names:
  - `slate`
  - `slate-dom`
  - `slate-react`
  - `slate-history`

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-v2/engine.md /Users/zbeyens/git/plate-2/docs/slate-v2/core-foundation-spec.md /Users/zbeyens/git/plate-2/docs/slate-v2/dom-runtime-boundary-spec.md /Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-final-spec-name-sync.md`
- [x] grep confirms the stale placeholder package names are gone from those target docs
