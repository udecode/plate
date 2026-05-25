---
title: Slate browser command rows must share app text policy with native input
date: 2026-04-29
category: docs/solutions/test-failures
module: slate-v2 slate-react integration-local
problem_type: test_failure
component: testing_framework
symptoms:
  - URL and markdown shortcut rows failed under slate-browser command-style text insertion.
  - Native browser input behavior and proof-handle text insertion diverged in the same examples.
  - Rich HTML paste over shell-backed selection passed in one transport path and failed in another.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, slate-browser, input-rules, insert-fragment, playwright]
---

# Slate browser command rows must share app text policy with native input

## Problem

`bun test:integration-local` had real reds after excluding stress rows. The
broken examples put editing policy in browser-event-only handlers, while
`slate-browser` command rows use editor handles that must prove the same user
behavior without depending on DOM event transport.

## Symptoms

- `inlines` did not wrap a typed URL when the test used `editor.insertText(...)`.
- `markdown-shortcuts` did not convert `- ` through the same command-style text
  insertion path.
- `persistent-annotation-anchors` inserted raw nodes where the expected behavior
  was fragment insertion semantics.
- `large-document-runtime` rich HTML paste over shell-backed selection depended
  on whether Firefox synthetic paste mutated selection before the fallback path.

## What Didn't Work

- Keeping URL wrapping and markdown shortcut conversion in `onDOMBeforeInput`.
  That only proves native event transport, not the command path used by
  `slate-browser`.
- Changing the tests to type through the page keyboard. That would hide the
  broken shared editing contract instead of fixing it.
- Inserting deserialized blocks with raw node insertion for paste-like behavior.
  Paste and fragment insertion have merge/replacement rules that raw insertion
  does not provide.

## Solution

Put example-owned text insertion policy on the shared `Editable inputRules`
surface and keep browser-event hooks for browser-event-only bookkeeping.

```ts
const inputRules = useMemo<readonly EditableInputRule[]>(
  () => [
    ({ data, inputType }) => {
      if (inputType === 'insertText' && typeof data === 'string') {
        return applyMarkdownTextShortcut(editor, data)
      }
    },
  ],
  [editor]
)

return <Editable inputRules={inputRules} />
```

Make the public wrapper expose the same input-rule path as the DOM root:

```ts
export type { EditableInputRule } from 'slate-react'
```

For paste-like behavior, use transaction fragment insertion instead of raw node insertion:

```ts
editor.update(tx => {
  tx.fragment.insert([
    {
      type: 'paragraph',
      children: [{ bold: true, text }],
    },
  ])
})
```

For Firefox synthetic paste rows that already need the proof handle fallback,
call the handle directly and import DOM selection before inserting data.

## Why This Works

The browser proof handle is not just a testing convenience. It is the executable
contract for model-owned editor operations. If an example puts real editing
policy only in `onDOMBeforeInput`, native browser input and command-style proof
paths can drift.

`Editable inputRules` gives native and command-style text insertion one shared
policy point. `insertFragment(...)` gives paste and fragment buttons the same
merge/replacement semantics that users expect from Slate editing, instead of
depending on raw node insertion details.

## Prevention

- Do not put example-owned text insertion semantics only in
  `onDOMBeforeInput`.
- Keep `slate-browser` command rows on editor handles when the contract is model
  behavior, even if a page-keyboard version would pass.
- Use `insertFragment(...)` for paste-like and fragment-like insertion tests.
- When synthetic paste needs a browser-handle fallback, import DOM selection
  before calling `handle.insertData(...)`.
- Run the focused row first, then the fail-fast integration sweep:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration --max-failures=1 --reporter=line
```

## Related Issues

- [Slate browser generated stress rows need real Editable harnesses](2026-04-28-slate-browser-generated-stress-rows-need-real-editable-harnesses.md)
- [Slate v2 integration-local should cap local Playwright workers before debugging editor failures](2026-04-24-slate-v2-integration-local-should-cap-local-playwright-workers-before-debugging-editor-failures.md)
- [Slate v2 clipboard proof must split fragment semantics from DOM transport](../logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
