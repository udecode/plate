# Plite Roadmap Final Spec Name Sync

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

- Finish the active spec-stack package naming cleanup.

## Finding

- Active specs still mixed the real package names with old placeholders:
  - `plite`
  - `plite-dom-v2`
  - `plite-react-v2`
- That contradicted the frozen package map and the public package docs.

## Patch

- Normalize the active specs and north-star doc to the real package names:
  - `slate`
  - `plite-dom`
  - `plite-react`
  - `plite-history`

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/plite/engine.md /Users/zbeyens/git/plate-2/docs/plite/core-foundation-spec.md /Users/zbeyens/git/plate-2/docs/plite/dom-runtime-boundary-spec.md /Users/zbeyens/git/plate-2/docs/plite/references/chunking-review.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-plite-roadmap-final-spec-name-sync.md`
- [x] grep confirms the stale placeholder package names are gone from those target docs
