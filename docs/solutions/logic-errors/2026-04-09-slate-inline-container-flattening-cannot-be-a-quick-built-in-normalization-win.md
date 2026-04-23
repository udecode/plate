---
title: Slate inline-container flattening cannot be a quick built-in normalization win
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - normalization
  - inline
  - clipboard
  - selection
  - range-ref
---

# Problem

The obvious next normalization step after the safe block-only floor was to
flatten block wrappers inside inline-style containers into their text / inline
descendants.

That looked reasonable in isolated tests and was still wrong.

# Symptoms

- targeted snapshot and range-ref tests passed
- the full clipboard suite exploded across mixed-inline and wrapper-unit lanes
- `slate-react` runtime proof started failing in mixed-inline rendering and
  selection restoration
- core fragment insertion started throwing
  `clipboard proof currently supports insertion only inside top-level text blocks`

# What Didn't Work

Treating inline-container coercion as “just unwrap the block wrapper and keep
the descendants” was too aggressive.

The inline tree shape is part of the current fragment/selection/runtime proof.
Flattening wrappers changed that shape broadly enough to invalidate:

- mixed-inline clipboard extraction
- mixed-inline fragment insertion
- range-ref rebasing across those structures
- DOM selection restoration in `slate-react`

# Solution

Do not land inline-container flattening as a casual helper change.

The seam only became safe once it was:

- inline-aware
- run through the full clipboard and `slate-react` runtime lanes
- reconciled with the merge-node oracle rows that now expect spacer text around
  inline children

The landed built-in floor is:

- empty-child repair
- inline spacer insertion
- direct-child block-only cleanup on node-op seams
- replace/manual-normalize block-only cleanup
- explicit-only inline-container flattening into inline-compatible descendants
- scoped `fallbackElement`

# Why This Works

The current engine already proves a lot of behavior on top of specific
mixed-inline container shapes.

The “simple normalization improvement” was actually a broad fragment/runtime
contract rewrite in disguise.

It only worked once the flattening logic was aligned with the editor's actual
inline contract and the proof stack was updated to the normalized tree shape.

# Prevention

- Do not trust isolated normalization tests for inline-container coercion.
  Run the full clipboard and `slate-react` runtime lanes immediately.
- If a normalization change alters mixed-inline descendant shape, expect
  clipboard and DOM-selection fallout until proven otherwise.
- Inline-container coercion is its own design lane. Treat it like a contract
  recovery, not a convenience refactor.
