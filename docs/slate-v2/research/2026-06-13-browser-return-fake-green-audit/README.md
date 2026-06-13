# Browser Return Fake-Green Audit

Date: 2026-06-13

## Question

Do browser/project-gated `return` statements in Slate v2 Playwright example
tests hide fake green coverage?

## Scope

- Scanned `playwright/integration/examples/**` for `return` statements near
  `browserName`, `testInfo.project.name`, or named browser/project guards.
- Converted top-level test guards to explicit `test.skip(...)` with concrete
  reasons.
- Removed one mobile early return that skipped the follow-up editability
  assertion after HTML paste.

## Verdict

Keep the repair.

The scan found test-level fake greens in:

- `playwright/integration/examples/mentions.test.ts`
- `playwright/integration/examples/paste-html.test.ts`
- `playwright/integration/examples/embeds.test.ts`

After repair and a full `playwright/**` rescan, the remaining browser/project
return hits are helper control-flow branches, not skipped tests:

- `stress/generated-editing.test.ts`: stress-case factory return.
- `shadow-dom.test.ts`: typed-input helper branches for mobile/WebKit.
- `richtext.test.ts`: text insertion helper branch for mobile.

## Proof

Focused browser proof:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/mentions.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/embeds.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "shows list of mentions|keeps mention portal closed|inserts from list|arrow keys select mentions atomically|Backspace after typing between adjacent inline mentions|selects the last character after a leading inline mention|typing two spaces after an inline mention|preserves a leading mention|preserves mention order when Backspace|keeps caret editable after rich HTML paste over selected content|runs generated clipboard paste gauntlet|moves from the first paragraph into the embed before the next paragraph"
```

Result: 31 passed, 17 skipped.

Full Playwright proof-width scan:

- browser/project return audit: 0 test-level returns, 4 helper returns.
- disabled/fixme/fail audit: 0 rows.

Lint:

```bash
bun lint
```

Result: passed.
