---
title: Lexical codeblock harvest rows need DataTransfer boundaries
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical CodeBlock tests mix source-code HTML import, inline code, source-specific token styling, and unrelated typography rows.
  - A browser-native clipboard proof flattened Quip-style pre HTML before the app importer could preserve it as a code block.
  - Adding an app onPaste interceptor made the code block row green but broke the runtime kernel-trace gauntlet.
root_cause: wrong_api
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, code-block, paste-html, clipboard, tests]
---

# Lexical codeblock harvest rows need DataTransfer boundaries

## Problem

Lexical's `CodeBlock.test.ts` is not a pure code-block model suite. Its useful
portable row is rich HTML insertion from code sources: `<pre>`, editor
`white-space: pre` line wrappers, and GitHub code tables should import as code
without source gutters.

## Symptoms

- Quip-style `<pre>function...<br>...</pre>` imported through Chromium native
  clipboard as plain paragraphs, not a Slate code block.
- A custom `onPaste` interception made that browser row pass, but it bypassed
  the runtime command path and failed the generated paste kernel-trace gauntlet.
- The source file also includes Postman bold token styling, Google Docs title
  inference, sub/sup typography, and inline code rows that belong to different
  owners.

## What Didn't Work

- Treating the row as a generic native clipboard transport claim. Chromium can
  mutate or flatten rich HTML before the app importer sees it.
- Intercepting every paste in the example with `onPaste`. That stole ownership
  from the runtime clipboard strategy and removed the expected `insert-data`
  kernel trace.
- Copying Lexical's full source matrix one-for-one. Some rows are source-theme
  styling or product typography, not raw Slate behavior.

## Solution

Keep this harvest row at the DataTransfer insertion boundary, matching
Lexical's unit test shape:

- exercise the app `insertData` handle in browser proof;
- import representative code-source HTML as one code block;
- strip source gutters from GitHub-style tables;
- preserve line breaks from `<br>` and line-wrapper `<div>` elements;
- keep single-line `<code>` as inline code through the existing row;
- defer token styling, title inference, sub/sup, native clipboard transport, raw
  mobile, collaboration, and table-model claims to explicit future owners.

The importer should detect code-source HTML before generic table/paragraph
deserialization:

```ts
if (isCodeSourceElement(el as HTMLElement)) {
  return createCodeBlockElement(collectCodeSourceText(el as HTMLElement))
}
```

Then the full paste-html browser file must still pass, especially the generated
clipboard gauntlet that asserts the runtime command trace.

## Why This Works

The copied invariant is "code-source HTML maps to code content," not "native
browser paste always preserves code blocks." DataTransfer proof covers the same
insertion boundary as Lexical's unit test without weakening Slate React's
clipboard runtime contract.

Keeping native clipboard transport separate also prevents a small parser row
from silently changing the event pipeline. If native rich paste needs a stronger
policy later, that is a runtime/browser lane with kernel-trace proof, not an
app importer shortcut.

## Prevention

- For Lexical clipboard unit tests, identify whether the source exercises
  DataTransfer insertion or real browser paste before choosing proof.
- Do not use app `onPaste` interception to fix importer behavior unless the
  runtime trace contract is updated and re-proved.
- When touching paste-html import, run the focused row and the whole
  `paste-html.test.ts` browser file.
- Split code-source import from syntax highlighting, source theme styling, and
  typography rows before editing Slate.

## Related Issues

- [Lexical tab node harvest rows need clipboard and browser proof boundaries](./2026-05-09-lexical-tab-node-harvest-rows-need-clipboard-browser-proof-boundaries.md)
- [Lexical paragraph node harvest rows need DOM import splitting](./2026-05-09-lexical-paragraph-node-harvest-rows-need-dom-import-splitting.md)
- [V2 HTML paste formatting should stay app-owned on explicit inline elements](../logic-errors/2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
