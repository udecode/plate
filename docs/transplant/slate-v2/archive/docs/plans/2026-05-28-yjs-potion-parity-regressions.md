# Yjs Potion parity regressions

## Goal

Fix only collaboration behaviors where Potion disagrees with the local
`@slate/yjs` implementation, using failing-first tests.

## Scope

- [x] Split Node: offline split + concurrent insert + B undo must converge like
      Potion.
- [x] Merge Node: offline merge + concurrent append may drop the append because
      Potion also does, but B undo must not diverge.
- [x] Wrap Node: offline wrap + concurrent text insert must preserve the insert.
- [x] Insert Fragment: offline fragment insert + concurrent append must preserve
      both edits.
- [x] Move Down: no fix in this slice; Potion also drops the concurrent insert.

## Release Artifact

- Added `.changeset/slate-yjs-potion-parity.md` for the package behavior fix.

## TDD Plan

1. Add the smallest failing package tests for the four parity cases.
2. Fix the shared Yjs operation/history boundary, not the demo buttons.
3. Run targeted `@slate/yjs` tests after each green slice.
4. Run package typecheck and lint fix before handoff.

## Verification

- `bun test ./packages/slate-yjs/test` -> 53 pass.
- `bun --filter ./packages/slate-yjs typecheck` -> pass.
- `bun typecheck:root` -> pass.
- `bun lint:fix` -> pass.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "offline wrap button|offline insert fragment"` -> 2 pass.
- Captured reusable learning in `docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md`.
- Follow-up full e2e stabilization: fixed `placePeerCaret` to use a
  textbox-scoped Playwright click and fixed the example so each simulated
  peer's `Y.Doc.clientID` matches its displayed client id.
- Follow-up verification:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium`
  -> 28 pass.
- Captured reusable learning in
  `docs/solutions/test-failures/yjs-example-client-id-determinism-2026-05-28.md`.

## Notes

- Potion evidence from `felixfeng33@gmail.com` profile:
  - Split undo: Potion converges to `alph!abeta`, no B-only fork.
  - Merge undo: Potion converges to `alpha / beta`, no B-only fork.
  - Wrap: Potion preserves `alpha!` inside the blockquote.
  - Insert Fragment: Potion converges to `alpha AdaLin fragment`.
  - Move Down: Potion drops `!`, same as local.
