# Yjs Merge Node Canonical Late Peer

## Goal

Fix `@slate/yjs` so a real Backspace merge keeps Yjs conflict-safe shared text
identity without exposing adjacent compatible text leaves to `readSlateValueFromYjs`
or late-joining peers.

## Status

- [x] Read task source and relevant prior solutions.
- [x] Add failing TDD coverage for late peer canonical value after text merge.
- [x] Fix the slate-yjs read/path mapping ownership boundary.
- [x] Run package tests, typecheck, lint, and browser e2e verification.

## Findings

- Existing merge reconnect fix intentionally preserves separate `Y.XmlText`
  containers to avoid same-offset conflicts with remote inserts.
- Current read/bootstrap path exposes those separate containers as adjacent
  compatible Slate text leaves.
- `readSlateValueFromYjs` must not globally merge metadata leaves inside one
  `Y.XmlText`; existing mark/selection tests rely on those metadata boundaries.
- The likely seam is Yjs child-boundary reading/mapping, not the structural
  merge encoder that preserves CRDT identity.
- Red test failed on `readSlateValueFromYjs(root)`: actual `alpha` + `beta`
  adjacent leaves instead of canonical `alphabeta`.
- First read-only fix broke existing concurrent insert coverage because operation
  replay started using canonical paths and fell back to snapshot replacement.
- Final design keeps raw Yjs leaf paths for operation replay and uses virtual
  merged paths for read/selection mapping.
- Remote history repair must also read raw Yjs child-boundary paths. Feeding it
  the canonical merged read leaves stale merge split positions and makes offline
  Backspace undo split `alpha!beta` into `alpha` / `!beta`.
- `docs/solutions/patterns/critical-patterns.md` is absent in this repo.
- Captured reusable learning in
  `docs/solutions/logic-errors/yjs-merge-read-virtual-text-leaves-2026-05-27.md`.

## Changeset

Updated `.changeset/slate-yjs-structural-reconnect.md` for `@slate/yjs` patch.

## Verification

- Red: `bun test ./packages/slate-yjs/test/core-contract.ts -t "canonical Slate text"` failed before the fix.
- Green: `bun test ./packages/slate-yjs/test/core-contract.ts -t "canonical Slate text"` passed.
- `bun test ./packages/slate-yjs/test/core-contract.ts` passed, 47/47.
- `bun --filter @slate/yjs test` passed, 47/47.
- `bun --filter @slate/yjs typecheck` passed.
- `bun lint:fix` passed; final run applied no fixes.
- Focused browser regression:
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- --project=chromium playwright/integration/examples/yjs-collaboration.test.ts -g "undoes offline Backspace merge"` passed.
- Real persistent dev-browser Chrome at `http://127.0.0.1:9222` passed all 25
  `yjs-collaboration` e2e scenarios in five batches: 1-5, 6-10, 11-15, 16-20,
  21-25.
- Official Chromium e2e:
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 bun run playwright -- --project=chromium playwright/integration/examples/yjs-collaboration.test.ts` passed, 25/25.
