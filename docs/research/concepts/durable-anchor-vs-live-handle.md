---
title: Durable anchor vs live handle
type: concept
status: partial
updated: 2026-04-14
related:
  - docs/research/concepts/runtime-identity-vs-tree-address.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Durable anchor vs live handle

## Definition

A durable anchor is the value you can keep, map through changes, and resolve
later.

A live handle is the mutable runtime helper the engine uses while editing is in
flight.

## Why the split matters

Public APIs usually want durable anchors.

Runtime internals often want live handles.

Confusing those two is how public APIs leak mutable runtime machinery.

## Strongest supporting evidence

- ProseMirror `SelectionBookmark`
- local Slate v2 `Bookmark`
- local Slate v2 lower-level `RangeRef`

## Practical use

This concept is the reason the Slate v2 plan prefers `Bookmark` publicly and
pushes `RangeRef` downward.
