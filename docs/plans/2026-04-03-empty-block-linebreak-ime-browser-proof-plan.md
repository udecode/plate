---
date: 2026-04-03
topic: empty-block-linebreak-ime-browser-proof-plan
status: in_progress
---

# Empty-Block Line-Break IME Browser Proof Plan

## Goal

Replace the failed jsdom composition attempt with a real browser-capable IME
proof for the empty-block line-break placeholder path.

## What We Learned

- jsdom contenteditable composition is not a trustworthy proof seam here
- Slate already has Playwright integration under:
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples`
- Lexical already has the exact kind of IME coverage we need:
  - real browser tests in
    `/Users/zbeyens/git/lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`
  - Chromium CDP `Input.imeSetComposition` usage for controlled IME composition

## Chosen Next Cut

Build a Slate Playwright test for the placeholder example that:

1. starts from an empty editor with the placeholder visible
2. focuses the editor
3. drives composition with Chromium CDP `Input.imeSetComposition`
4. asserts the committed text result and final selection

That is the first honest way to decide whether the empty-block line-break path
can drop FEFF in legacy code.

## Why This Beats jsdom

- real contenteditable
- real browser selection
- real composition event ordering
- same class of harness Lexical uses for IME regression coverage

## First Test Target

Use the existing Slate placeholder example:

- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder.test.ts`

Add a new IME-focused case or a sibling test file that:

- uses Chromium only at first
- composes one Hangul or Hiragana syllable while placeholder is visible
- verifies:
  - final DOM text
  - final editor content
  - final selection position

## Open Constraint

Do not widen legacy renderer policy until this browser proof exists and passes.
