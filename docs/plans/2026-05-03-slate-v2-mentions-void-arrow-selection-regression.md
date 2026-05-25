# Slate v2 Mentions Void Arrow Selection Regression

## Goal

Fix `/examples/mentions` so ArrowLeft/ArrowRight next to an inline void mention selects the mention atomically instead of skipping it.

## Acceptance

- Reproduce the regression in browser.
- Add a failing regression test before changing implementation.
- Fix the shared editor/navigation path, not the mention example.
- Verify focused tests, package typecheck, lint, and Browser Use proof.

## Current Status

- Status: done
- Relevant prior learning: selectable voids should be atomic navigation points.
- Root cause: core character-position collection exposed the adjacent text
  segment around an atomic inline void but did not include the inline void
  atom itself as a navigation stop.
- Fix: `Editor.after` / `Editor.before` character movement now stops on the
  inline void child point first, then moves to adjacent text on the next arrow.
- Browser console follow-up: the earlier DOM coverage errors were stale
  browser/server logs; a mentions Playwright guard and fresh Browser Use pass
  both showed no new `without a DOM coverage boundary` errors.

## Files Updated

- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/positions.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/query-contract.ts`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts`
- `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts`
- `/Users/zbeyens/git/slate-v2/.changeset/selectable-void-navigation.md`
- `/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-26-slate-v2-selectable-voids-should-be-atomic-navigation-points.md`

## Verification

- `bun test ./packages/slate/test/query-contract.ts`
- `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/mentions.test.ts --project=chromium`
- `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium -g "arrow keys"`
- `STRESS_ROUTES=mentions STRESS_FAMILIES=inline-void-boundary-navigation,markable-inline-void-formatting bun test:stress`
- `bun --filter slate typecheck`
- `bun --filter slate-browser typecheck`
- `bun lint:fix`
- Browser Use proof on `http://localhost:3102/examples/mentions`: ArrowRight
  selected an inline mention chip and fresh DOM coverage error count was `0`.
