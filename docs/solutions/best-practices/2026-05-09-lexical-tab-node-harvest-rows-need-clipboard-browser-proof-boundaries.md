---
title: Lexical tab node harvest rows need clipboard and browser proof boundaries
date: 2026-05-09
category: docs/solutions/best-practices
module: Plite Lexical harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical TabNode tests mix clipboard paste, keyboard indentation, command API, and node schema behavior.
  - A broad paste-html insertion API swap fixed the new tab assertion but broke existing nested-list browser rows.
  - Counting every rendered paragraph after paste was brittle because the example can retain an empty paragraph around pasted content.
root_cause: wrong_api
resolution_type: documentation_update
severity: medium
tags: [plite, lexical-harvest, tab-node, paste-html, clipboard, tests]
---

# Lexical tab node harvest rows need clipboard and browser proof boundaries

## Problem

Lexical `TabNode` tests look like one portable tab feature, but they cover
several different owners: plain-text clipboard fallback, Google Docs HTML paste,
keyboard indentation, command-level tab insertion, node serialization, and
selection around a TabNode class. Plite only owns the literal tab/newline paste
behavior in this slice.

## Symptoms

- Plain-text tab/newline paste needed package proof in the DOM clipboard owner.
- Google Docs `Apple-tab-span` paste needed browser proof in the paste-html
  example.
- A trial switch from `tx.nodes.insert` to `tx.fragment.insert` removed an empty
  paragraph for the tab fixture but flattened existing nested-list paste rows.
- A browser assertion that expected exactly two paragraphs failed because one
  empty paragraph could remain around the visible pasted content.

## What Didn't Work

- Treating Lexical's `TabNode` class as a Plite model target. Plite stores
  literal tabs as normal text.
- Broadly changing the paste-html importer insertion API to satisfy one
  paragraph-count assertion. That traded a narrow tab proof for regressions in
  the existing list corpus.
- Asserting all paragraph wrappers after paste. That tests incidental wrapper
  count instead of the visible tab/newline invariant.

## Solution

Split the source rows by owner:

- add a `plite-dom` clipboard package row for `text/plain`
  `hello\tworld\nhello\tworld`;
- add a paste-html browser row for the Google Docs `Apple-tab-span` HTML;
- assert the two non-empty paragraph text values exactly as
  `Hello\tworld`, not the total paragraph count;
- reject Lexical TabNode schema/serialization/type-guard rows;
- defer keyboard indentation and adjacent literal-tab selection replacement to
  explicit code/list/input or text-boundary owners.

## Why This Works

The copied behavior is not "Plite should have a TabNode." The useful invariant
is that editor paste paths preserve literal tab characters while honoring line
boundaries. Package clipboard proof covers model fallback; Playwright covers the
browser HTML parser path.

Keeping the paste-html importer on its existing insertion path also preserves
the already-proved nested-list corpus. A cleaner insertion API might be possible
later, but it needs the full paste-html browser file as the first proof, not one
new tab row.

## Prevention

- For upstream node tests, split clipboard/browser behavior from node
  serialization and command API before editing Plite.
- When touching paste-html insertion, run the whole paste-html browser file, not
  only the new row.
- In paste browser rows, assert visible imported content and exact text where
  possible; avoid paragraph-count assertions unless wrapper count is the real
  contract.
- Treat `tx.fragment.insert` as paste-like policy only after checking existing
  list/table corpus behavior.

## Related Issues

- [Lexical paragraph node harvest rows need DOM import splitting](./2026-05-09-lexical-paragraph-node-harvest-rows-need-dom-import-splitting.md)
- [Plite browser command rows must share app text policy with native input](../test-failures/2026-04-29-plite-browser-command-rows-must-share-app-text-policy-with-native-input.md)
