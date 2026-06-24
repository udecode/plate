---
title: Plite browser IME proof rows need honest DOM composition boundaries
date: 2026-05-07
category: developer-experience
module: plite plite-browser playwright ime proof
problem_type: developer_experience
component: tooling
symptoms:
  - CDP IME proof inserted text at the end of a marked leaf instead of the selected mid-leaf offset.
  - Passing replacementStart and replacementEnd to imeSetComposition targeted the wrong document offset.
  - A test harness source edit did not affect Playwright until plite-browser dist was rebuilt.
root_cause: wrong_api
resolution_type: test_fix
severity: high
tags: [plite, plite-browser, ime, composition, playwright, prosemirror]
---

# Plite browser IME proof rows need honest DOM composition boundaries

## Problem

The Mobile/IME proof lane needed a row for composition inside marked text.
Using Chromium CDP IME as the oracle for a mid-leaf mark boundary looked close,
but it was not honest for this harness.

## Symptoms

- Model selection and DOM selection both let `Input.imeSetComposition` commit at
  the end of bold `rich`, producing `richすし` instead of `riすしch`.
- A `replacementStart` / `replacementEnd` experiment inserted after `Th`,
  proving the offsets were not the Plite leaf offsets the test needed.
- Editing `packages/plite-browser/src/playwright/ime.ts` did not change
  Playwright behavior until `packages/plite-browser` was rebuilt, because tests
  import `plite-browser/playwright` from `dist`.

## What Didn't Work

- Treating `editor.selection.select(...)` as enough for native CDP IME.
- Treating `editor.selection.selectDOM(...)` as enough for native CDP IME.
- Passing local leaf offsets to CDP replacement fields.
- Patching `plite-browser` source and rerunning Playwright without rebuilding
  the package.

## Solution

For the mark-boundary row, use the same proof shape as ProseMirror's
`webtest-composition.ts`: set a real DOM range in the marked text node, dispatch
composition events, mutate the captured range, then let Plite import the DOM
change.

The landed row asserts the actual Plite contract:

- composing inside bold `rich` at offset 2 produces `riすしch`
- the bold mark remains intact
- selection advances inside the marked leaf
- composition trace ownership is recorded
- Backspace recovery restores the original marked text and caret

When changing reusable `plite-browser` helpers, rebuild before expecting
Playwright to see the edit:

```bash
cd /Users/zbeyens/git/plite/packages/plite-browser
bun run build
```

## Why This Works

The proof row is about Plite importing a browser-owned composition mutation
without corrupting marks or selection. A direct DOM composition mutation proves
that contract. CDP IME is still useful for end-of-text native composition and
trace rows, but this harness did not provide reliable mid-mark replacement
semantics through CDP offsets.

## Prevention

- Do not promote CDP IME rows to exact mid-mark or mobile-device claims unless
  the insertion point itself is proved.
- For ProseMirror composition rows, translate the DOM-mutation contract first;
  add native CDP coverage only when its offset semantics are proved for that
  surface.
- If a Playwright test imports `plite-browser/playwright`, remember it is using
  built package output.

## Related Issues

- [Plite-browser multi-subpath packages need local tsdown entry maps and split test-runtime typecheck ownership](./2026-04-18-plite-browser-multi-subpath-packages-need-local-tsdown-entry-maps-and-split-test-runtime-typecheck-ownership.md)
- [Plite React runtime owner cuts need static inventories and browser proof](./2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
