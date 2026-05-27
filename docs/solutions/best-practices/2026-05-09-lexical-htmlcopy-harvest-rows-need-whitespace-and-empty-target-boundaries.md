---
title: Lexical HTML copy harvest rows need whitespace and empty-target boundaries
date: 2026-05-09
category: docs/solutions/best-practices
module: Slate v2 Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical HTMLCopyAndPaste mixed paragraph whitespace normalization, code HTML import, and HR/decorator insertion rows.
  - A multiline HTML paste browser row created seven paragraphs instead of four because raw newline text leaked into the Slate fragment.
  - Switching the example importer to tx.fragment.insert fixed the empty paragraph but broke existing code and nested-list paste rows.
root_cause: wrong_api
resolution_type: documentation_update
severity: medium
tags: [slate-v2, lexical-harvest, paste-html, clipboard, whitespace, tests]
---

# Lexical HTML copy harvest rows need whitespace and empty-target boundaries

## Problem

Lexical's `HTMLCopyAndPaste.spec.mjs` looks like one clipboard file, but the
portable rows split into separate owners: normal HTML whitespace import,
code-source import, and HR/block-void insertion policy.

## Symptoms

- The red multiline paragraph row imported seven paragraphs instead of four.
- Raw newline text between top-level `<p>` nodes became empty paragraphs.
- Raw newline characters inside normal paragraph text survived as document text.
- A broad switch to `tx.fragment.insert` removed the empty paste target but
  regressed source-code and nested-list paste behavior.

## What Didn't Work

- Treating HR rows as generic paste-html work. Slate has no accepted HR element
  owner in this example, so those rows need a future HR/block-void plus
  block-fragment owner.
- Replacing `tx.nodes.insert` with `tx.fragment.insert` for the whole example
  importer. That broke existing accepted rows for source-code HTML and nested
  list import.
- Asserting the new paragraph count before proving whether the extra paragraph
  was an importer whitespace bug or the example's empty paste target.

## Solution

Keep the insertion path that preserves the existing corpus, and normalize the
HTML importer at the narrow boundary:

```ts
if (el.nodeType === 3) {
  return normalizeTextNode(el)
}
```

`normalizeTextNode` strips raw newline characters from normal HTML text nodes
while preserving explicit code/pre whitespace. `normalizeBodyFragment` drops
top-level whitespace-only text nodes. After `tx.nodes.insert(fragment)`, the
example removes only a leading empty text block when the pasted fragment
contains top-level blocks.

The browser proof should cover both accepted rows:

- multiline paragraph HTML with extra raw newlines imports as exactly four
  paragraphs and preserves inline `<b>` / `<i>`;
- `<code data-language>...<br>...</code>` imports as a code block through the
  existing source-code HTML corpus.

## Why This Works

The copied invariant is not "replace Slate paste with Lexical's paste model."
It is "normal HTML source newlines are layout noise unless they come from an
explicit break or preserved-whitespace context."

Keeping `tx.nodes.insert` avoids destabilizing list/table/code import behavior.
The targeted empty-target cleanup fixes native block-fragment paste without
claiming a new generic fragment insertion law.

## Prevention

- Source-read clipboard files row-by-row before copying tests.
- Separate source whitespace, explicit `<br>`, code/pre whitespace, and
  decorator/block-void insertion.
- When touching `paste-html-import.ts`, run the focused row and the full
  `paste-html.test.ts` browser file.
- Do not promote HR/decorator rows until Slate has an explicit HR/block-void
  owner.
- Treat `tx.fragment.insert` as a separate policy change that must pass the
  whole paste-html corpus before it can replace `tx.nodes.insert`.

## Related Issues

- [Lexical tab node harvest rows need clipboard and browser proof boundaries](./2026-05-09-lexical-tab-node-harvest-rows-need-clipboard-browser-proof-boundaries.md)
- [Lexical codeblock harvest rows need DataTransfer boundaries](./2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md)
- [V2 HTML paste formatting should stay app-owned on explicit inline elements](../logic-errors/2026-04-06-v2-html-paste-formatting-should-stay-app-owned-on-explicit-inline-elements.md)
