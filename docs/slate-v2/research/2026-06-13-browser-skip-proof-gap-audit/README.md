# Browser Skip Proof Gap Audit

Date: 2026-06-13

## Question

Do high-risk Slate v2 browser route skips hide a current proof gap?

## Scope

- Audited stable editor, huge-document, pagination, selection, inline, void,
  placeholder, hidden DOM, image, and table Playwright route files.
- Classified `test.skip` guards by proof width.
- Rechecked the one suspicious runtime skip branch with focused browser proof.

## Verdict

No runtime patch is justified from this packet.

The route skips are mostly explicit claim-width guards:

- desktop-only rows stay scoped because raw mobile/device proof is deferred.
- Chromium-only rows mostly cover CDP, reporter, clipboard, perf, and
  experimental pagination/huge-document stress lanes.
- WebKit/Firefox skips are named browser capability or native-behavior deltas.
- The only apparent unconditional skip is a runtime fallback inside the inline
  native word-Backspace parity row; the focused row currently passes in
  Chromium, Firefox, and WebKit, so it is not fake coverage.

## Proof

Focused command:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --grep "word Backspace around an inline link matches plain editable text"
```

Result: 3 passed.

## Follow-Up

Keep the scoped skip strategy, but avoid broad skip scans in chat output. Future
skip audits should write raw rows to a local artifact first, then summarize.
