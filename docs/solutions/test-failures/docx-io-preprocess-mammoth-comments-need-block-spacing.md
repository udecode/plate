---
title: Docx IO Mammoth comments need block spacing before text collapse
category: test-failures
date: 2026-03-17
tags:
  - docx-io
  - mammoth
  - comments
  - parsing
---

# Docx IO Mammoth comments need block spacing before text collapse

## Problem

Multi-paragraph DOCX comments imported through Mammoth could lose word boundaries during preprocessing.

A comment like two paragraphs, `Second note` and `more detail`, collapsed into `Second notemore detail`.

## Root Cause

`preprocessMammothHtml` removed backlink anchors and then read `dd.textContent`.

Sibling block nodes do not contribute separator whitespace on their own, so the later whitespace normalization step could only collapse existing spaces. It could not recreate missing boundaries between adjacent block elements.

## Solution

Insert explicit spaces for block boundaries before reading `textContent`.

The fix walks cloned comment content and:

- replaces `<br>` with a text-space node
- appends a text-space node to block elements like `<div>`, `<li>`, and `<p>`

After that, the existing whitespace normalization produces readable comment text again.

## Prevention

- Keep a direct helper spec for multi-paragraph comment definitions instead of relying on larger import flows.
- When flattening HTML to plain text, add separators before collapsing whitespace. `textContent` alone is not enough for adjacent block nodes.
