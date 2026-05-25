# Slate v2 Embeds Spacing Regression

## Status

Complete.

## Goal

Restore `/examples/embeds` visual parity with legacy Slate: the paragraph after
the Vimeo void must sit below the URL input with normal block spacing, not
visually glued to the input.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/embeds`.
- Keep existing selectable-void keyboard behavior intact.

## Current Evidence

- User screenshot shows the new renderer on the left and legacy on the right.
- Regression is visual/layout parity around the video void and following
  paragraph.
- Existing embeds keyboard-navigation plan already fixed atomic selectable void
  traversal; do not regress that.
- Browser metrics before the fix:
  - input bottom: `730.4296875`
  - following paragraph top: `768.828125`
  - input-to-paragraph gap: `38.390625`
  - void wrapper bottom: `752.828125`
  - extra void height after input: about `22.4px`
- Owner: `site/examples/ts/embeds.tsx` hand-rolled the void wrapper and rendered
  `children` directly after the URL input. That made the required Slate void
  spacer participate in layout.
- Fix: render the Vimeo block with `VoidElement`, passing the app-owned video
  UI as `content` and Slate children as `spacer`.
- Captured the reusable learning in
  `docs/solutions/logic-errors/2026-04-26-slate-react-custom-voids-must-render-children-through-spacer.md`.
- Browser metrics after the fix:
  - input bottom: `730.4296875`
  - following paragraph top: `746.4296875`
  - input-to-paragraph gap: `16`
  - extra void height after input: `0`

## Plan

1. Reproduce the layout with browser metrics on `/examples/embeds`. Done.
2. Identify whether the owner is example markup, reusable void rendering, or
   global editor CSS. Done: example markup bypassed `VoidElement`.
3. Add a focused browser regression assertion for the gap after the URL input.
   Done.
4. Fix the owner without weakening selectable void behavior or internal control
   ownership. Done.
5. Run focused Playwright, typecheck, lint, dev-browser proof, and completion
   check. Done except completion check is next.

## Verification

- Red proof:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/embeds.test.ts --project=chromium --workers=1 --retries=0`
  failed with `Received: 38.390625`, expected `<= 24`.
- Green proof:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/embeds.test.ts --project=chromium --workers=1 --retries=0`
  passed, 3 tests.
- Dev-browser proof:
  `dev-browser --connect http://127.0.0.1:9222` on `/examples/embeds`
  measured `gapInputToParagraph: 16` and `extraVoidHeightAfterInput: 0`.
- `bun typecheck:root` passed.
- `bun typecheck:site` passed.
- `bun lint:fix` passed, formatted 2 files.
- `bun lint` passed.
