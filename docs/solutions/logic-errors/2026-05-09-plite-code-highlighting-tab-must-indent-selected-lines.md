---
title: Plite code highlighting Tab must indent selected lines
date: 2026-05-09
category: docs/solutions/logic-errors
module: plite code-highlighting
problem_type: logic_error
component: testing_framework
symptoms:
  - "Tab over a selected multi-line code range replaced selected text with spaces."
  - "Collapsed Tab worked, hiding the expanded-selection bug."
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [plite, code-block, tab, selection, browser-proof]
---

# Plite code highlighting Tab must indent selected lines

## Problem

The Plite code-highlighting example handled Tab as plain text insertion.
That was fine for a collapsed caret, but wrong for selected code lines.

## Symptoms

- Collapsed Tab inserted the configured spaces and passed browser proof.
- Tab over a selection spanning two code lines corrupted the selected text.
- The first red browser run received mangled code text instead of line-start
  indentation.

## What Didn't Work

- Treating Lexical's full code-node command matrix as the row to copy. Most of
  it is Lexical class, DOM, metadata, tokenizer, or command-dispatch policy.
- Keeping a one-path Tab handler and assuming the expanded range would behave
  like a caret. It replaced the range because text insertion owns selected text
  replacement.

## Solution

Keep collapsed Tab simple, but route expanded selections inside one code block
through line-start edits:

```ts
const handledCodeLines = updateSelectedCodeLines(
  editor,
  isShiftTab ? 'outdent' : 'indent'
)

if (!handledCodeLines && isTab) {
  editor.update((tx) => {
    tx.text.insert(CodeIndent)
  })
}
```

`updateSelectedCodeLines` reads the current value and selection, finds selected
`code-line` children inside the same `code-block`, then inserts or removes the
indent string at each selected line's first text leaf.

The browser proof selects across two code lines, presses Tab, checks both lines
are indented, selects again, presses Shift+Tab, and checks both lines return to
their original text.

## Why This Works

Collapsed code Tab is a caret text insertion. Expanded code Tab is structural
line editing. Splitting those paths prevents the text insertion transform from
deleting the selected code range.

The fix also keeps the behavior local to the example's accepted model: code
blocks are `code-block` elements containing `code-line` children. It does not
pretend to implement Lexical node keys, DOM export shape, language metadata,
highlighter transforms, line moving, or Home/End visual caret policy.

## Prevention

- Every code-block Tab proof needs a multi-line selected range, not only a
  collapsed caret.
- If Tab modifies indentation, test Shift+Tab in the same row.
- Before copying editor-framework tests, split the user-facing invariant from
  framework class and command APIs.
- Browser-visible keyboard behavior needs browser proof, not only package tests.

## Related Issues

- [Code block tab should indent every selected line](./2026-03-23-code-block-tab-should-indent-every-selected-line.md)
- [Editor key protocols must cover expanded selection and repeated escalation](./2026-04-03-editor-key-protocols-must-cover-expanded-selection-and-repeated-escalation.md)
