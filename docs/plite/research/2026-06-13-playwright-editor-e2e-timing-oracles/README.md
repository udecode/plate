# Plite Playwright Editor E2E Timing Oracles

Date: 2026-06-13

## Question

Does Lexical's Playwright 1.54.x e2e failure issue expose a Plite bug,
missing browser helper, or already-covered harness discipline?

## Scope

- Inspect the GitHub issue for the failure signature.
- Inspect local Lexical playground helper/test source.
- Compare against current `plite-browser` proof helpers.
- Do not patch runtime from a Playwright-version issue.

## Verdict

The useful invariant is already covered in Plite's browser harness:
clipboard/selection e2e proof must wait for editor-observable state, not assume
Playwright keyboard/copy/paste promises imply editor convergence.

Plite already has the stronger shape:

- `withExclusiveClipboardAccess` serializes native clipboard access;
- `copyPayload` retries until text/html/types are visible;
- `pasteText` and `pasteHtml` compare before/after model text, selection, and
  kernel trace before using fallback insertion;
- route rows use `expect.poll` for model text and selection;
- scenario helpers serialize replayable assertions and reduction artifacts.

No runtime patch and no new helper were needed.

## Proof

```bash
cd .tmp/plite/packages/plite-browser
bun test ./test/core/scenario.test.ts
```

Result: 21 passed.

```bash
cd .tmp/plite
bun --filter ./packages/plite-browser typecheck
```

Result: passed.

## Evidence Summary

- Lexical issue #7739 reports Playwright 1.54.x failures in copy/paste,
  selection, navigation, table, and typing tests. Maintainers called out timing
  sensitivity and later said newer Playwright no longer reproduced it
  (`https://github.com/facebook/lexical/issues/7739`).
- Lexical's helpers use a clipboard lock and synthetic copy/paste helpers, but
  the issue still shows immediate DOM HTML assertions can be too eager across a
  Playwright upgrade
  (`../lexical/packages/lexical-playground/__tests__/utils/index.mjs:278-646`).
- Plite's current `plite-browser` helper is already stricter: clipboard payload
  retry, native paste outcome detection, model/selection/trace comparisons, and
  fallback only when the native path did not apply
  (`.tmp/plite/packages/plite-browser/src/playwright/index.ts:2896-2965`,
  `7063-7230`).

## Claim Width

This packet claims harness coverage, not product/runtime correctness. It says
the current Plite test API already encodes the Lexical/Playwright timing lesson.
It does not claim every route is immune to future Playwright changes.
