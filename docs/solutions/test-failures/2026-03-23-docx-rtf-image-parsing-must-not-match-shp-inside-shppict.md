---
title: Docx RTF image parsing must not match shp inside shppict
category: test-failures
date: 2026-03-23
tags:
  - docx
  - rtf
  - images
  - cleaner
---

# Docx RTF image parsing must not match shp inside shppict

## Problem

`getRtfImagesMap(...)` could invent duplicate image entries while parsing RTF image data.

A `\shppict` block was being parsed once as a `shppict` image and then again as a `shp` image, which produced bogus `s...` image ids for content that only existed as `i...` images.

## Root Cause

`getRtfImagesByType(...)` used `rtf.split(type)`.

That is too loose for RTF control words because `\shp` is a prefix of `\shppict`. Splitting on `\shp` matched both the real `\shp` token and the start of every `\shppict` token.

## Solution

Split on the exact RTF control word, not a raw substring:

```ts
const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
const [, ...images] = rtf.split(new RegExp(`${escapedType}(?![a-zA-Z])`));
```

That negative lookahead keeps `\shp` from matching `\shppict`, while still matching the real standalone control word.

## Prevention

- When parsing RTF control words, match whole tokens instead of raw prefixes.
- If one control word is a prefix of another, add one test that proves the shorter token does not steal the longer one.
- For image-map helpers, always include at least one mixed `\shppict` plus `\shp` fixture so duplicate parsing cannot hide.
