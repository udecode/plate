---
title: Slate read-only selection tests need selector-owned DOM selection
date: 2026-05-18
category: docs/solutions/test-failures
module: Slate v2 browser examples
problem_type: test_failure
component: testing_framework
symptoms:
  - A Playwright test selected text but the read-only comment button stayed disabled.
  - The page showed selection in the editable writer pane instead of the read-only comment pane.
  - Generated stress rows coupled overlay setup to selection transport even though they only needed a seeded comment.
root_cause: wrong_api
resolution_type: test_fix
severity: medium
tags: [slate-v2, playwright, read-only, selection, examples]
---

# Slate read-only selection tests need selector-owned DOM selection

## Problem

A two-pane Slate example made the public comment pane read-only, while the
document pane stayed editable. The browser test used the shared example harness
to select text, but that helper targeted the contenteditable document pane.

## Symptoms

- `Add comment on selection` stayed disabled until the test timed out.
- `#review-comments-selection` showed `selection:none`.
- The writer pane showed `selection:0.0:0|0.0:24`, proving the helper selected
  the wrong editor.

## What Didn't Work

- Switching from `editor.selection.select(...)` to
  `editor.selection.selectDOM(...)`.
  The helper still starts from the harness root, and the harness root resolves
  to the editable surface, not the read-only viewer.
- Keeping generated stress rows dependent on the same selection helper.
  Those rows verify annotation overlay stability, not read-only selection
  import.

## Solution

For read-only panes, select through the pane's own DOM selector and dispatch
`selectionchange` from that document.

```ts
await page.locator('#review-comments').evaluate((root) => {
  const document = root.ownerDocument
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNode = walker.nextNode()

  if (!textNode?.textContent) {
    throw new Error('Comment text node was not found')
  }

  const range = document.createRange()
  range.setStart(textNode, 0)
  range.setEnd(textNode, 24)

  const selection = document.defaultView?.getSelection()

  if (!selection) {
    throw new Error('Window selection is unavailable')
  }

  selection.removeAllRanges()
  selection.addRange(range)
  document.dispatchEvent(new Event('selectionchange'))
})
```

For stress rows that only need comment data, seed the comment through the
example control instead of pretending selection transport is part of the
overlay contract.

```ts
{
  kind: 'clickSelector',
  label: 'seed-review-comment',
  selector: 'button:has-text("Seed example comment")',
}
```

## Why This Works

`openExample(...).selection.selectDOM(...)` is a good default for editable
examples because the harness owns a contenteditable root. A read-only pane is
not contenteditable, so the test has to identify the exact viewer DOM before it
can prove that Slate imports the browser selection for that viewer.

Splitting stress setup from read-only selection also keeps the test honest:
one integration row proves selecting in the read-only pane, and the stress rows
focus on annotation and widget invalidation.

## Prevention

- When an example has multiple editors, never assume the shared harness selected
  the visual target. Assert which pane reports the selection.
- For read-only Slate panes, prefer selector-owned DOM selection in Playwright.
- Keep generated stress rows on the smallest setup that proves the stress
  contract. Do not make stress depend on unrelated selection transport.

## Related Issues

- [Slate browser selectionchange proof must separate traceability from programmatic import](./2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
- [Slate browser IME proof rows need honest DOM composition boundaries](../developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md)
