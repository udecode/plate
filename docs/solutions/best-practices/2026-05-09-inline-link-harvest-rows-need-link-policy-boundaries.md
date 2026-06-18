---
title: Inline link harvest rows need link policy boundaries
date: 2026-05-09
category: docs/solutions/best-practices
module: slate-v2
problem_type: best_practice
component: testing_framework
symptoms:
  - Lexical link paste tests mixed raw inline boundary behavior with link-plugin policy.
  - A one-for-one port would make generic Slate core special-case link paste behavior.
  - Existing Slate inline coverage looked broad but lacked an explicit paste-at-link-boundary browser row.
root_cause: scope_issue
resolution_type: test_fix
severity: medium
tags: [slate-v2, lexical-harvest, inline-links, clipboard, testing]
---

# Inline link harvest rows need link policy boundaries

## Problem

Lexical link tests are tempting to copy directly, but several rows are product
or link-plugin policy rather than generic editor behavior. Porting all of them
would make Slate core encode a link-specific paste rule that belongs in an app
or plugin.

## Symptoms

- Link-boundary rows, partial-link copy rows, toolbar rows, autolink rows, and
  paste-inside-link rows appear in the same upstream file.
- The raw Slate owner is split across `inlines.test.ts`,
  `clipboard-contract.ts`, and future link-plugin policy.
- A direct copy would imply pasted text inside a link should always lose link
  affinity.

## What Didn't Work

- Treating every Lexical link row as raw editor behavior.
- Treating paste-inside-link splitting as a generic inline-fragment law.
- Closing the source file as covered because Slate already had inline typing,
  cut, and mention navigation rows.

## Solution

Split the rows by ownership:

- Browser-owned raw behavior: paste before or after an inline link must not
  expand the link.
- Model-owned raw behavior: partial inline-link fragment copy/paste preserves
  link attributes.
- Link-plugin policy: paste text, formatted HTML, another link, or multiple
  blocks inside an existing link may split the link only if the link plugin
  accepts that behavior.
- Product policy: toolbar link conversion, image linking, and autolink URL paste
  do not belong in generic Slate proof.

The Slate coverage added:

- `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`: browser proof
  for plain-text and rich-HTML paste at inline-link boundaries.
- `packages/slate/test/clipboard-contract.ts`: package proof for
  partial inline-link fragment copy/paste.

## Why This Works

Slate core owns inline structure, fragment insertion, and browser boundary
behavior. It does not own a universal "links should stop absorbing pasted
content" rule because `link` is schema/plugin meaning, not a primitive text
law.

This keeps generic coverage strong without hardcoding app-level link semantics.

## Prevention

- For harvested link tests, classify rows as boundary behavior, fragment
  behavior, link-plugin policy, or product shell before writing code.
- Add browser proof when the claim is about the real paste transport or DOM
  boundary.
- Add package proof when the claim is about fragment shape and model selection.
- Do not make generic Slate transforms branch on `type: 'link'` unless a public
  link-plugin owner is explicitly accepted.

## Related Issues

- [Editor behavior specs must lock node model and affinity before UX](editor-behavior-specs-must-lock-node-model-and-affinity-before-ux.md)
- [Inline void clipboard export must not assume block void spacer DOM](../logic-errors/2026-05-04-inline-void-clipboard-export-must-not-assume-block-void-spacer-dom.md)
