---
date: 2026-04-18
topic: slate-v2-replacement-family-ledger
status: active
---

# Replacement Family Ledger

## Purpose

Track, family by family, what the live `slate-v2` stack:

- preserves
- redefines
- keeps intentionally narrow

This is broader than package-level API ledgers and narrower than roadmap or
readiness docs.

## Status Legend

- `Preserved`
- `Redefined`
- `Comparison-only`
- `Intentionally later`

## Current Family Read

### Anchor lifecycle

- status: `Preserved`
- current truth:
  - `Slate`
  - `Editable`
  - `withHistory(createEditor())`
  - explicit reset/load boundary
  - committed selection recovery

### Inline family

- status: `Redefined`
- current truth:
  - links are explicit current inline elements
  - mentions are explicit current inline suggestion behavior
  - HTML paste policy is current and explicit

### Decoration / highlight family

- status: `Redefined`
- current truth:
  - projection-driven highlight behavior
  - explicit decoration-source lane

### Anchor / projection family

- status: `Redefined`
- current truth:
  - bookmark-backed durable anchors
  - annotation/widget runtime split

### Placeholder / IME family

- status: `Preserved`
- current truth:
  - placeholder behavior stays part of the kept user-facing surface

### Shadow DOM / iframe family

- status: `Preserved`
- current truth:
  - browser boundary behavior is still part of the kept claim

### Huge document family

- status: `Redefined`
- current truth:
  - huge-document behavior is benchmark-backed
  - large-document posture is part of the v2 story, not optional garnish
