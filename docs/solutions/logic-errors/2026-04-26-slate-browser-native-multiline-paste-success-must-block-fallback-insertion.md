---
title: Slate browser native multiline paste success must block fallback insertion
date: 2026-04-26
category: docs/solutions/logic-errors
module: slate-browser
problem_type: logic_error
component: testing_framework
symptoms:
  - Browser stress expected two pasted blocks but rendered duplicated multiline text.
  - Native paste succeeded, then the helper fallback inserted the same text again.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate-browser
  - paste
  - multiline
  - playwright
  - stress
---

# Slate browser native multiline paste success must block fallback insertion

## Problem

Generated browser stress caught a false negative in the public paste helper. The
helper judged native multiline paste by raw model text, missed that the browser
had already split the payload into blocks, and then inserted fallback text on
top of the successful paste.

## Symptoms

- `bun test:stress` failed on the plaintext multiline paste row.
- Expected rendered block text was `["Alpha", "Beta"]`.
- Actual rendered block text was `["Alpha", "BetaAlpha\nBeta"]`.
- The failure appeared only after a real browser paste path, not in a pure
  model-only check.

## What Didn't Work

- Checking `modelText.includes(text)` was too narrow for multiline paste.
  Browser editing can convert one clipboard string into multiple rendered
  blocks, so the original multiline string may not appear literally in the
  model text even when paste succeeded.
- Treating the mismatch as native paste failure made the fallback path unsafe.
  Fallback insertion must be conservative because it runs after the browser had
  a real chance to mutate the document.

## Solution

Teach paste helpers to detect successful multiline paste through rendered block
text before falling back:

```ts
function didPasteApplyText(root: Locator, modelText: string, text: string) {
  if (modelText.includes(text)) return true;

  const blockText = getBlockTexts(root).join('\n');

  return blockText.includes(text);
}
```

Use that guard in both text and HTML paste helpers before fallback insertion.

## Why This Works

The browser-visible contract is block-oriented for this case. A multiline paste
can be correct even when the exact clipboard string is not present as one model
substring. Joining rendered block text gives the helper a cheap, public signal
that native paste already landed.

This keeps the fallback path useful for browsers that do not apply the paste,
while preventing duplicate insertion when the browser did apply it.

## Prevention

- Browser stress for paste helpers must assert rendered DOM shape, not only
  model text.
- Any helper with "native action then fallback" behavior needs a success check
  that matches the user-visible output shape.
- Replay artifacts should be kept for failed stress rows so a helper bug can be
  rerun without rediscovering the sequence by hand.

## Related Issues

- `docs/solutions/logic-errors/2026-04-04-public-paste-helpers-should-use-real-clipboard-write-plus-real-paste-gesture.md`
- `docs/solutions/logic-errors/2026-04-25-slate-v2-destructive-delete-must-clean-empty-leaves-before-render.md`
