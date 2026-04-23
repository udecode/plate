---
title: Delete-command surface
type: concept
status: strong
updated: 2026-04-04
related:
  - docs/research/sources/typora/clipboard-and-delete-behavior.md
  - docs/editor-behavior/markdown-editing-spec.md
---

# Delete-command surface

## Definition

Delete commands are explicit destructive actions beyond ordinary single-step
Backspace or Delete key behavior.

Examples:

- delete paragraph or block
- delete sentence or line
- delete styled scope
- delete word

## Why this matters

Agents often collapse all destructive behavior into ordinary key law.

That loses real product semantics.

Delete commands can have context-specific meaning that ordinary Backspace does
not share.

## Current research conclusion

Typora's `Delete Range` page is strong evidence that delete commands deserve
their own behavior lane.

It explicitly distinguishes paragraph, table, code, and math behavior.

## Use

Use this concept when deciding:

- whether destructive commands need separate rows
- whether paragraph/code/table/math behavior should diverge
- whether a command is just "bigger Backspace" or something else
