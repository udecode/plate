---
date: 2026-04-18
topic: slate-v2-normalization-reference
status: active
---

# Normalization Reference

## Purpose

Single live reference for the current normalization posture.

## Current Read

- keep the default-vs-explicit normalization contract closed
- do not reopen broad default live coercion casually
- the current contract is intentionally narrower than old Slate
- promoting explicit-only cleanup into ordinary commit behavior is a real
  public contract change

## Contract Summary

Default live behavior keeps only the invariants needed for correctness.

Heavier cleanup stays on explicit or app-owned seams:

- `Editor.normalize()`
- load / replace / reset
- import / paste ingestion
- app-owned custom `normalizeNode(...)`

## Phase Boundary Read

The engine still has one normalization phase before publish.

That means:

- publish is not a second normalization tier
- commit canonicalization does not exist yet
- promoting explicit-only cleanup would change committed snapshots

## Promotion Read

If normalization work reopens later, the first credible promotion candidate is:

- explicit adjacent-text cleanup / merge

Not first:

- broad inline-container flattening
- broad always-on live coercion
