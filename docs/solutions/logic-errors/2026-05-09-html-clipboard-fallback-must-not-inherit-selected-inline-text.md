---
title: HTML clipboard fallback must not inherit selected inline text
date: 2026-05-09
category: docs/solutions/logic-errors
module: Slate v2 DOM clipboard fallback
problem_type: logic_error
component: documentation
symptoms:
  - "A browser paste over selected link text inserted the pasted text inside the remaining link."
  - "The package fragment proof passed while the Playwright paste proof failed."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, clipboard, inline-links, data-transfer, lexical-harvest]
---

# HTML clipboard fallback must not inherit selected inline text

## Problem

Lexical regression 5251 exposed a split between Slate's model fragment path and
the real browser paste path. Replacing selected text inside an inline link with
rich clipboard content passed through `insertFragment` correctly in package
tests, but browser paste still inherited the link because the DataTransfer
fallback inserted plain text directly.

## Symptoms

- `packages/slate/test/clipboard-contract.ts` passed for rich fragment
  insertion over selected inline-link text.
- `playwright/integration/examples/inlines.test.ts` failed with the link text
  rendered as `replacedlink`.
- The failure only appeared through the browser/DOM clipboard path, not through
  direct transaction fragment insertion.

## What Didn't Work

- Fixing only `insertFragment`. That made direct model insertion correct, but
  `text/html` without a Slate fragment still fell back to single-line
  `insertText`.
- Treating this as an HTML parser problem. The inlines example does not own a
  generic HTML import pipeline; the bug was the fallback path inheriting inline
  context for an expanded same-inline selection.
- Asserting only final plain text. The text can look right while the pasted text
  is still inside the link.

## Solution

Keep the model and browser paths aligned:

- `insertFragment` handles selected one-level inline text with a single
  replacement operation.
- DOM clipboard fallback detects expanded selections inside one inline text node
  and routes single-line plain text through fragment insertion.
- Browser proof asserts the pasted text is outside the surviving link tail.

Verification:

```bash
bun test ./packages/slate/test/clipboard-contract.ts -t "selected inline link text"
bun test ./packages/slate-dom/test/clipboard-boundary.ts -t "selected inline text"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium -g "selected inline link text"
bun test ./packages/slate/test/clipboard-contract.ts
bun test ./packages/slate-dom/test/clipboard-boundary.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium
bun run lint:fix && bun check
```

## Why This Works

The direct fragment path has enough structure to split the selected inline text
into before/paste/after children. The plain-text clipboard fallback previously
skipped that structure and called `insertText`, so the inserted text inherited
the current inline node.

Routing expanded same-inline fallback through fragment insertion preserves the
generic clipboard law without inventing a link-plugin policy: pasted content
replaces the selected inline text and lands before the surviving inline tail.

## Prevention

- Pair package fragment proofs with a DOM clipboard fallback proof when the
  source regression uses real paste.
- For inline-link paste rows, assert link containment, not just block text.
- Treat `text/html` without `data-slate-fragment` as a separate transport path;
  green `insertFragment` tests do not prove browser paste.

## Related Issues

- [Inline link harvest rows need link policy boundaries](../best-practices/2026-05-09-inline-link-harvest-rows-need-link-policy-boundaries.md)
- [Lexical codeblock harvest rows need DataTransfer boundaries](../best-practices/2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md)
- [Clipboard fragment format keys must guard HTML fallback](2026-05-04-clipboard-fragment-format-keys-must-guard-html-fallback.md)
