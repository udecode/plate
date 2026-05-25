# Slate v2 Roadmap Slate-browser API Backlog Sync

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Remove two lower-priority Slate-browser doc contradictions that still
  misstate the current package or API surface.

## Finding

- `prioritized-backlog.md` still referred to `slate-dom-v2` and
  `slate-react-v2`.
- `api-design.md` still documented the removed `waitForEditable`,
  `waitForPlaceholderVisible`, `waitForSelector`, and `waitForText` options
  instead of the current `ready` contract.

## Patch

- Normalize the package names in the backlog doc.
- Remove the dead `waitFor*` options from the API-design example.

## Verification

- [x] `pnpm exec prettier --check /Users/zbeyens/git/plate-2/docs/slate-browser/prioritized-backlog.md /Users/zbeyens/git/plate-2/docs/slate-browser/api-design.md /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-roadmap-slate-browser-api-backlog-sync.md`
- [x] grep confirms the stale package names and dead `waitFor*` options are gone from the target docs
