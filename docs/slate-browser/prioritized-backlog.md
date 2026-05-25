---
date: 2026-04-04
topic: slate-browser-prioritized-backlog
---

# Slate Browser Prioritized Backlog

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the prioritized meaningful-test backlog for `slate-browser`.

It is derived from the proof work already completed in `slate`,
`slate-dom`, and `slate-react`.

Strong rule:

- every item here should prove a real public behavior
- no “increase coverage” chores
- no implementation-detail snapshots pretending to be progress

## Priority 0

These are the first tests that should exist next because they directly unblock
the remaining architecture questions.

### 1. Empty-block IME composition on placeholder path

Lane:

- Playwright + Chromium CDP

Why first:

- this is the exact missing proof behind the zero-width renderer policy
- current legacy policy is still conservative because this path is unproved

What to assert:

- final committed text
- final Slate selection
- no crash or empty-state wedge

### 2. Browser contract fixture for DOM selection assertions

Lane:

- Vitest browser

Why first:

- the framework still lacks `assertSelection` / `assertDomSelection`
- many past proof slices already depend on selection being first-class

What to assert:

- one semantic selection snapshot
- one DOM selection snapshot
- exact mapping between them where appropriate

### 3. Clipboard contract fixture

Lane:

- Vitest browser for DOM-scale behavior
- Playwright for full example flow later

Why first:

- clipboard is already proved in v2 core/dom, but the framework API still lacks
  a clean clipboard contract lane

What to assert:

- DOM/plaintext/html contract behavior
- zero-width cleanup on copy

## Priority 1

These build directly on the completed proof slices and raise the confidence bar
without exploding scope.

### 4. Persistent annotation anchor example regression

Lane:

- Playwright

Why:

- `RangeRef` + persistent projections are already proved at runtime level
- now they need one mounted example regression

What to assert:

- anchor survives text insert
- anchor survives fragment insert
- rendered overlay remains attached to the right content

### 5. Zero-width shape contract fixtures

Lane:

- Vitest browser

Why:

- the bridge now supports both FEFF-shaped and `<br>`-shaped line-break placeholders
- those shapes should stay pinned explicitly

What to assert:

- FEFF path
- `<br>` path
- round-trip DOM/Slate offsets

### 6. Shared Playwright helper assertions

Lane:

- Playwright

Why:

- helper smoke exists, but assertions are still too thin

What to add:

- `assertEditorHtml`
- `assertSelection`
- `assertDomSelection`

## Priority 2

These are important, but should wait until the first framework tranche is less
rough.

### 7. More IME regressions

- Safari/WebKit composition ordering
- placeholder-visible first-character regressions
- delete-after-composition regressions

### 8. Agent-native lane

- only after deterministic lanes are stable
- only with explicit artifacts

### 9. Perf lane expansion

- rerender breadth
- huge-doc interactions
- placeholder/selection hot paths only when benchmark questions are clear

## Mapping Back To Past Work

Completed proof work that should drive tests first:

1. clipboard boundary
2. projection store
3. range refs
4. persistent `RangeRef`-backed projections
5. zero-width DOM bridge normalization
6. `<br>` placeholder bridge tolerance

Testing priority follows the remaining uncertainty around those proofs, not the
chronological order they were implemented.
