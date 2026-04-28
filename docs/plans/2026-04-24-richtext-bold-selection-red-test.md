# Richtext Bold Selection Red Test

## Goal

Reproduce the regression where selecting `editable` in `examples/richtext`, toggling bold on, then toggling bold off collapses the visible selection.

## Contract

- Use the browser-facing richtext example.
- Select the real `editable` word, not a model-only shortcut.
- Click the real bold toolbar button twice.
- Assert Slate selected text is still `editable`.
- Assert visible DOM selection is still expanded and selected text is still `editable`.

## Progress

- status: not_reproduced
- Added the focused Playwright row in `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts`.
- The first semantic DOM-selection version passed and was not a valid RED reproducer.
- Native mouse-drag selected the wrong text before toolbar interaction, so it was rejected as a setup failure rather than the reported bug.
- Native double-click word-selection stayed green on Chromium, WebKit, and mobile, but Firefox selected `rich` during setup; that is also not the reported bold-off collapse.
- The committed row uses harness DOM selection setup to keep the contract focused on toolbar bold on/off selection preservation.
- Current evidence: the new test asserts visible DOM selection text, non-collapsed DOM selection, editor focus ownership, and non-collapsed Slate selection after bold on and bold off.
- Focused gate: `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "keeps selected word expanded after toggling toolbar bold off" --workers=4 --retries=0` passed.
- Lint gate: `bun run lint:fix && bun run lint` passed.
- Typecheck probe: `bun run typecheck:root` failed on existing root-wide benchmark/tmp/test debt unrelated to this row, including prior `richtext.test.ts` errors at lines 901 and 1284.
- Browser Use follow-up: `http://localhost:3100/examples/richtext` initially failed because `bun serve` runs Next dev and the exported dynamic example route 404s there. Serving `site/out` with `PORT=3100 bun ./scripts/serve-playwright.mjs` loaded the real page in Browser Use.
- Browser Use exact word selection limitation: Browser Use coordinate double-click/drag did not create a word selection in the in-app browser, so it could not reproduce the exact `select editable` path autonomously.
- Browser Use visible selection proof: `Control+A` produced a visible native selection; clicking the real bold toolbar button on and off preserved the visible selection after both toggles. This did not reproduce the reported collapse.
