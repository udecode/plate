---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Multi-block child containers inside proved sibling units still reduce to one wrapper-list fragment
tags:
  - slate-v2
  - wrapper-unit
  - sibling-units
  - quote
  - bulleted-list
severity: medium
---

# Multi-block child containers inside proved sibling units still reduce to one wrapper-list fragment

## What happened

After proving sibling complex units where each `list-item` already contained:

- a paragraph
- a nested list
- a quote

the next honest question was whether those child containers could themselves
become multi-block:

- nested list with two items
- quote with two paragraphs

## What fixed it

It still did not need a new fragment seam.

Selection across sibling units still reduced cleanly to:

- one `bulleted-list` fragment
- containing already-proved sibling `list-item` units

That survived:

- `slate-v2` extraction
- `slate-dom-v2` clipboard transport
- Chromium copy/paste

## Why this works

The model still holds because the fragment unit is unchanged.

The nested list and quote each got internally broader, but the outer sibling
unit is still one `list-item`.

So the higher-level fragment story stays:

- proved sibling unit
- lifted into one wrapper list of proved sibling units

## Reusable rule

When testing whether the wrapper-list model still holds:

- widen child containers before inventing a new outer fragment abstraction
- if the outer sibling unit is still stable, try to prove the round-trip before
  designing a new seam

## Related issues

- [2026-04-05-multiple-complex-list-units-still-reduce-to-one-wrapper-list-fragment-when-each-unit-stays-proved.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-multiple-complex-list-units-still-reduce-to-one-wrapper-list-fragment-when-each-unit-stays-proved.md)
