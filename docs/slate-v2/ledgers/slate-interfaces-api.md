---
date: 2026-04-16
topic: slate-interfaces-api-ledger
status: active
---

# Slate Interfaces API Ledger

- owner: `packages/slate`
- tranche: 3
- rule: restore same-path interface truth before example or runtime patches

## Current Read

- interfaces-family deleted-test closure is already banked
- `CustomTypes` stays explicit skip under the current structural typing claim
- package-local interface recovery for `slate` is closed
- `interfaces/node.ts` is now partially pulled back toward legacy by routing
  child traversal through the recovered `getChildren` seam instead of assuming
  raw `children` access everywhere
- `interfaces/path.ts`, `interfaces/point.ts`, `interfaces/range.ts`, and the
  path/point/range ref files are now pulled back toward the legacy source shape
  without changing the green fixture surface
- direct non-Editor interface oracle proof is now live and green in:
  - `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`
- package-local closeout is green on:
  - `bun test ./packages/slate/test`
  - `bunx turbo build --filter=./packages/slate`
  - `bunx turbo typecheck --filter=./packages/slate`
  - `bun run lint:fix`
  - `bun run lint`
- tranche-3 interface/bookmark seams are now landed:
  - `interfaces-contract.ts`
  - `interfaces/bookmark.ts`
  - root `Bookmark*` exports

## Sources

- [2026-04-18-slate-v2-slate-claim-width-classification.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-claim-width-classification.md)
- [2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md)

## Tranche 3 Rule

- legacy exported interface width wins by default
- do not revive `CustomTypes` declaration-merging width by accident
- do not let the current narrower structural typing story win automatically
  just because it ships today
- recover same-path exported interface truth before consumer patches or example
  cleanup
- restored direct interface-fixture owners outrank source closeness when they
  disagree
