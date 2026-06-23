# Fresh OSS Selection Navigation Scout

Date: 2026-06-13

## Question

Do fresh Playwright/Lexical selection and input issues expose new Plite
selection/navigation or test-oracle work?

## Scope

- Search current web/GitHub leads for contenteditable selection/navigation,
  `beforeinput`, and Playwright editor-test failures.
- Inspect local repro source for code-level claims before promoting anything.
- Deduplicate against existing Plite research shards before adding tests or
  runtime patches.
- Promote only Plite-native proof leads.

## Verdict

No runtime patch is justified from this scout.

The newest Playwright Home plus Shift+End selectionchange race is already
deduplicated into the earlier detached-endpoint import contract:

```bash
cd .tmp/plite/packages/plite-react
bun test:vitest test/selection-controller-contract.test.ts -- -t "selectionchange ignores detached DOM endpoints before resolving Plite range"
```

The Playwright `locator.fill()` Firefox/contenteditable failures reinforce the
existing Plite-browser rule: `fill()` is not editor-surface proof for
model-owned `contenteditable`. Use keyboard, `insertText`, semantic harness
steps, and model/native/event-trace assertions instead.

## Evidence Summary

- Playwright issue `microsoft/playwright#40986` links
  `janpe/playwright-selectionchange-race-repro`; local source replaces a text
  node during `selectionchange`, then drives Home plus Shift+End. Plite already
  keeps the portable invariant as detached DOM endpoint import safety.
- Playwright issue `microsoft/playwright#36715` links
  `ITenthusiasm/playwright-issue-firefox-fill`; local source prevents default
  `beforeinput`, mutates a text node, updates native selection, then Firefox
  `locator.fill()` fails while keyboard-style input works.
- Playwright issue `microsoft/playwright#39492` shows `locator.fill()` appends
  in a contenteditable editor when focus handling interferes with the internal
  select-all step. This is supporting methodology evidence, not Plite runtime
  evidence.
- Lexical discussion `facebook/lexical#2659` reinforces real-browser editor
  proof because JSDOM does not cover contenteditable behavior well enough.

## Promotion

The strongest follow-up was a static/proof-methodology audit that current Plite
browser routes do not use `locator.fill()` on Plite editor roots. It found no
editor-root/contenteditable `fill()` usage. Existing `fill()` calls target form
controls, query controls, title inputs, and native inputs inside editable voids,
which are valid owners.

## Claim Width

This scout claims research deduplication and proof-methodology pressure. It
does not claim Playwright, Chromium, Firefox, or a bare contenteditable
reproducer is a Plite runtime bug.
