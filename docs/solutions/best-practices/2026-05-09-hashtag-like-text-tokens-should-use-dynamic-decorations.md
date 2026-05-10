---
title: Hashtag-like text tokens should use dynamic decorations
date: 2026-05-09
category: best-practices
module: slate-v2
problem_type: best_practice
component: testing_framework
symptoms:
  - A copied upstream hashtag test gets mistaken for an inline atom or mention test.
  - A text-token proof accidentally tests full-document replacement setup instead of token boundary editing.
  - Decoration rows lose the distinction between editable text tokens and inline void nodes.
root_cause: logic_error
resolution_type: test_update
severity: medium
tags: [slate-v2, lexical-harvest, text-token, decorations, browser-tests]
---

# Hashtag-like text tokens should use dynamic decorations

## Problem

Lexical hashtag rows look like inline-token bugs, but the portable behavior is
not an inline void or mention contract. The token is editable text whose styling
changes as the text changes.

## Symptoms

- Space in the middle of `#yolo` should split the styled token to `#yo` while
  keeping the inserted space and tail editable as plain text.
- Delete at the token boundary should remove only the plain trailing space.
- Backspace from the plain tail should keep the remaining token text styled.

## What Did Not Work

- Mapping the row to mention/inline-void ownership.
- Treating Lexical Playground DOM classes as the proof target.
- Clearing the whole example document through a browser Backspace setup before
  typing the token. That exercised a separate projected-document replacement
  edge, not the hashtag invariant.

## Solution

Model hashtag-style tokens as dynamic text decorations over normal Slate text.
Use model-owned setup to establish the initial token text, then use browser
keyboard input for the actual token boundary behavior.

The useful proof shape is:

- insert `#yolo` as normal text
- assert a dynamic decoration renders `#yolo`
- press ArrowLeft twice and Space
- assert the document is `#yo lo`, only `#yo` is decorated, and the selection is
  after the inserted space
- insert `#yolo `, then use Delete and Backspace to prove boundary edits keep
  the text token editable

## Why This Works

The model stays a text node the entire time. Decorations can appear, shrink, or
disappear without changing node identity, so keyboard editing remains ordinary
text editing instead of atom deletion or mark affinity.

This also keeps the harvest boundary honest: Lexical theme spans are evidence
that a text range is styled, not evidence that Slate needs a new inline element
or void contract.

## Prevention

- Classify hashtag-like rows as `text token` unless the source proves an actual
  atomic node model.
- Do not use mention/void tests for editable token styling.
- For browser proofs, separate setup mechanics from the accepted invariant.
  Model-owned setup is fine when the row under test is boundary editing after
  the token exists.
- Keep raw mobile, collaboration, table-model, and product theme claims out
  until those owners explicitly accept them.

## Related Files

- `/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/highlighted-text.test.ts`
