# Slate v2 Mentions Inline Void Keyboard Navigation

## Status

Done.

## Goal

Fix `/examples/mentions` keyboard navigation before and after inline void
mentions, from both left and right entry points.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/mentions`.
- Primary behavior: ArrowLeft and ArrowRight around inline void mention nodes
  should keep DOM selection, Slate selection, and visible caret in agreement.

## Findings

- User reports regression in keyboard navigation before/after inline void from
  left and right.
- Mentions are inline, void, and markable void nodes.
- Existing lessons warn not to trust handle-only setup for browser selection
  behavior.
- Existing related coverage exists for `inlines`, `richtext`, `embeds`,
  `highlighted-text`, and `shadow-dom`; mentions needs route-specific proof.
- `dev-browser` reproduced the bug with real keyboard input:
  - `[1,0]@32` ArrowRight landed at `[1,2]@1` instead of `[1,2]@0`.
  - `[1,2]@0` ArrowLeft landed at `[1,0]@31` instead of `[1,0]@32`.
  - The same off-by-one happened around the second mention.
- Root cause was core `unit: 'character'` traversal flattening atomic inline
  voids to zero-length text. That made the next character after the atom become
  the first movement target.
- Package change is user-visible for `slate`; existing
  `.changeset/selectable-void-navigation.md` was widened to cover inline voids.

## Plan

1. Reproduce both directions with `dev-browser` on persistent Chrome. Done.
2. Add a failing `/examples/mentions` Playwright regression for left and right
   navigation around a mention. Done.
3. Fix the runtime or example contract at the right layer. Done in core
   `Editor.positions` character traversal.
4. Verify focused Playwright, `dev-browser`, scoped typecheck/lint, and relevant
   browser proof. Done.
5. Update completion state and capture reusable learning if this teaches a new
   rule. Done by updating the selectable void navigation learning.

## Verification

- Red proof:
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --grep "arrow keys skip over mentions" --workers=1 --retries=0` failed with `[1,2]@1` instead of `[1,2]@0`.
  - `bun test ./packages/slate/test/query-contract.ts -t "atomic boundaries"` failed with `[0,2]@1` instead of `[0,2]@0`.
- Green proof:
  - `bun test ./packages/slate/test/query-contract.ts -t "atomic boundaries"`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --grep "arrow keys skip over mentions" --workers=1 --retries=0`
  - `dev-browser --connect http://127.0.0.1:9222` on `/examples/mentions` confirmed Slate and DOM selection at `[1,2]@0`, `[1,0]@32`, `[1,4]@0`, `[1,2]@4`.
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/mentions.test.ts --project=chromium --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "arrow keys skip over read-only inline" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "keeps projected text movement model-owned and editable" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "keeps shadow DOM ArrowLeft movement model-owned inside the shadow root" --workers=1 --retries=0`
  - `bun test ./packages/slate/test/query-contract.ts`
  - `bun --filter slate typecheck`
  - `bun typecheck:root`
  - `bun lint:fix`
