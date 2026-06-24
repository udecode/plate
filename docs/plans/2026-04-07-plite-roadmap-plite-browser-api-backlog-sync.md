# Plite Roadmap Plite-browser API Backlog Sync

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

- Remove two lower-priority Plite-browser doc contradictions that still
  misstate the current package or API surface.

## Finding

- `prioritized-backlog.md` still referred to `plite-dom-v2` and
  `plite-react-v2`.
- `api-design.md` still documented the removed `waitForEditable`,
  `waitForPlaceholderVisible`, `waitForSelector`, and `waitForText` options
  instead of the current `ready` contract.

## Patch

- Normalize the package names in the backlog doc.
- Remove the dead `waitFor*` options from the API-design example.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/plite-browser/prioritized-backlog.md /Users/zbeyens/git/plate-2/docs/plite-browser/api-design.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-plite-roadmap-plite-browser-api-backlog-sync.md`
- [x] grep confirms the stale package names and dead `waitFor*` options are gone from the target docs
