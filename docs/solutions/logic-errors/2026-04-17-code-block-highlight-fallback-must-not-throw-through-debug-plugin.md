---
module: Code Block
date: 2026-04-17
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Opening `/docs/code-block` in browser fell into the docs error boundary instead of rendering the page"
  - "The browser surfaced `PlateError: [CODE_HIGHLIGHT] Error: Could not highlight with Highlight.js`"
  - "A registered language highlight failure crashed the whole route instead of degrading to plaintext"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - code-block
  - highlight
  - debug-plugin
  - docs
  - fallback
  - browser
---

# Code block highlight fallback must not throw through DebugPlugin

## Problem

The code block docs page crashed in browser when one highlighted sample failed
to tokenize.

The specific repro was `/docs/code-block`: instead of rendering the page and
degrading one block, the route hit the docs error boundary.

## Symptoms

- Browser error: `PlateError: [CODE_HIGHLIGHT] Error: Could not highlight with Highlight.js`
- The code block docs route showed "This page couldn’t load"
- The crash happened during initial editor normalization, before any user
  interaction

## What Didn't Work

- Treating the issue like another docs-wrapper or preview-shell failure
- Assuming the existing catch path in `setCodeBlockToDecorations` already made
  highlight failures safe

## Solution

Keep the plaintext fallback, but stop using `editor.api.debug.error(...)` inside
the highlight catch path.

`debug.error` throws in dev by design, which means this code:

```ts
try {
  highlighted = lowlight.highlight(effectiveLanguage, text);
} catch (error) {
  editor.api.debug.error(error, 'CODE_HIGHLIGHT');
  highlighted = { value: [] };
}
```

never actually reached the fallback.

Use a non-throwing warning instead:

```ts
try {
  highlighted = lowlight.highlight(effectiveLanguage, text);
} catch (error) {
  editor.api.debug.warn(
    `Could not highlight with Highlight.js for language "${effectiveLanguage}". Falling back to plaintext`,
    'CODE_HIGHLIGHT',
    error
  );
  highlighted = { value: [] };
}
```

Update the unit test to assert warning-based fallback for registered languages
that fail to highlight.

## Why This Works

The code already wanted graceful degradation. The real bug was that the logging
lane overruled the fallback lane.

With `debug.warn`, the editor still records the failure in dev, but it no
longer converts a recoverable highlight problem into a fatal route crash.

## Prevention

- If a catch block is supposed to recover, do not call a debug helper that
  throws before the recovery path runs.
- For fallback-oriented code, test with the real behavior of the logging lane in
  mind. A stubbed `debug.error` that never throws can hide a production-facing
  or dev-facing crash path.
- For browser regressions on docs routes, verify both:
  - the route still renders
  - the failed block degrades locally instead of taking down the page

## Related Issues

- [2026-03-26-code-block-language-change-must-trigger-redecorate.md](./2026-03-26-code-block-language-change-must-trigger-redecorate.md)
- [2026-03-27-code-block-format-must-rebuild-code-lines.md](./2026-03-27-code-block-format-must-rebuild-code-lines.md)
