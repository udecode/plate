---
title: Docx IO decimal bracket end lists must keep decimal numbering
category: test-failures
date: 2026-03-17
tags:
  - docx-io
  - numbering
  - lists
  - html-to-docx
---

# Docx IO decimal bracket end lists must keep decimal numbering

## Problem

`decimal-bracket-end` ordered lists produced the right visible suffix, `%1)`, but could emit the wrong DOCX numbering type when the package default ordered style was not decimal.

That meant the same style could serialize as roman or alpha numbering just because the package default changed.

## Root Cause

`ListStyleBuilder.getListPrefixSuffix(...)` handled `decimal-bracket-end`, but `getListStyleType(...)` did not.

So the suffix logic knew it was decimal-with-parenthesis, while the numbering-type logic silently fell back to `defaultOrderedListStyleType`.

## Solution

Map `decimal-bracket-end` to `decimal` in `getListStyleType(...)`.

That keeps the numbering format aligned with the emitted list text:

- `getListStyleType('decimal-bracket-end') -> 'decimal'`
- `getListPrefixSuffix({ 'list-style-type': 'decimal-bracket-end' }, 0) -> '%1)'`

## Prevention

- When a helper splits one visual style across two methods, test both methods for the same style token.
- Include at least one case where package defaults are intentionally non-decimal so fallback bugs cannot hide behind the default happy path.
